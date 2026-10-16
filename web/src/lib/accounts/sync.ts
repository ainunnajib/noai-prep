import { mergeProgress, normalizeProgress, rebaseProgress, SYNCED_KEY, type ProgressOrigin, type ProgressState } from '../progress'
import { readJSON, writeJSON } from '../storage'
import { revFrom, type AccountsAdapter, type ProgressSnapshot } from './adapter'
import { errorCode, LOAD_ERROR, SYNC_ERROR } from './errors'

/*
  Keeps this browser's progress and the account copy (progress/{uid}) in step while someone is signed in.
  - Every save carries the account copy's next revision number, and the account refuses a save that doesn't (see
    backend/firestore.rules). So a save based on an out-of-date copy (say, one queued on a phone while the laptop
    saved) can't overwrite newer work: it is refused, the newer copy arrives from the listener, and this browser's
    changes are merged into it and saved again.
  - This browser remembers the account copy its progress builds on (SYNCED_KEY, with the uid). Merging then means:
    take the account copy and redo on it what changed here since (lessons ticked or un-ticked, answers, a Reset).
    So a Reset, an un-tick or "Delete my saved progress" done on another device stays done, while changes made here
    that didn't reach the account (offline, or just before the page closed) still do on the next visit. Without
    that note (progress made before signing in), the two copies are combined, keeping everything either has.
  - Sign-in: read the account copy, merge as above, show the result here, and save it if the account copy lacks anything.
  - Then listen to the account copy: with nothing unsaved here take it as it is, otherwise merge and save.
  - Changes here are saved 1.5 s after the last one, and at once when the tab is hidden or closed. Reset is saved at once.
  - A failed save leaves the changes marked unsaved; the next change (or the tab being hidden) tries again.
*/

export const WRITE_DEBOUNCE_MS = 1500

/** The parts of the progress store that sync uses (the real one is `progress` from lib/progress). */
export interface SyncedStore {
  get(): ProgressState
  replace(next: ProgressState, origin: 'remote'): void
  reset(): void
  onChange(cb: (s: ProgressState, origin: ProgressOrigin) => void): () => void
  /** Whether to take progress saved by another tab of this browser: off while syncing, as each tab syncs with the account itself. */
  followOtherTabs?(on: boolean): void
}

export interface SyncStatus {
  /** a write is waiting or in flight */
  syncing: boolean
  lastSyncedAt: string | null
  /** a sync error to show, or null when an earlier one is resolved */
  error: string | null
}

export interface SyncOptions {
  adapter: Pick<AccountsAdapter, 'readProgress' | 'watchProgress' | 'writeProgress' | 'writeProgressOnExit' | 'deleteProgress' | 'confirmUser'>
  store: SyncedStore
  /** called with the status fields that may have changed */
  onStatus(patch: Partial<SyncStatus>): void
  debounceMs?: number
  now?: () => Date
}

export interface ProgressSync {
  /** Starts syncing for a signed-in user: the first merge, then live updates. Resolves once the first merge is done. */
  start(uid: string): Promise<void>
  /** Saves waiting changes now. */
  flush(): Promise<void>
  /** Stops syncing, optionally saving waiting changes first. Resolves once any write in flight has settled. */
  stop(opts?: { flush?: boolean }): Promise<void>
  /** Deletes the account copy, then empties this browser's copy without writing it back. Rejects if the delete fails. */
  deleteRemote(): Promise<void>
  /** Whether this browser holds progress the account may not have yet (signing out now would lose it). */
  hasUnsaved(): boolean
}

const empty = (): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [] })

function canonical(s: ProgressState): string {
  const sorted = <T,>(o: Record<string, T>) => Object.keys(o).sort().map((k) => [k, o[k]] as const)
  return JSON.stringify([
    sorted(s.lessons),
    sorted(s.checkpoints),
    sorted(s.answers),
    s.exams.map((e) => [e.id, e.date, e.mode, e.total, e.correct, e.seconds, sorted(e.byDomain).map(([k, d]) => [k, d.total, d.correct])]),
  ])
}

/** Same progress, whatever order the keys are in (copies built in different orders still compare equal). */
export function sameProgress(a: ProgressState, b: ProgressState): boolean {
  return a === b || canonical(a) === canonical(b)
}

/** Merges this browser's copy into the account copy: rebased on `base` (the account copy it builds on) when known, else combined. */
function merge(local: ProgressState, remote: ProgressState, base: ProgressState | null): ProgressState {
  return base ? rebaseProgress(local, remote, base) : mergeProgress(local, remote)
}

/**
 * The first sync after sign-in: what this browser should hold, and whether the account copy needs writing.
 * `base`: the account copy this browser's progress builds on, if it has synced with this account before.
 */
export function decideInitial(
  local: ProgressState,
  remote: ProgressState | null,
  base: ProgressState | null = null,
): { state: ProgressState; write: boolean } {
  const r = remote ?? empty()
  const merged = merge(local, r, base)
  // an account with no copy yet and nothing to add needs no write
  return { state: merged, write: !sameProgress(merged, r) }
}

export type SnapshotDecision =
  /** this device's own write echoing back: nothing to do */
  | { kind: 'ignore' }
  /** the account copy matches this browser */
  | { kind: 'in-sync' }
  /** take the account copy as it is */
  | { kind: 'replace'; state: ProgressState }
  /** keep unsaved changes here: merge the account copy in, and write if the account copy lacks anything */
  | { kind: 'merge'; state: ProgressState; write: boolean }

/**
 * What to do when the account copy changes. `dirty`: this browser has changes that may not be saved yet.
 * `base`: the account copy those changes build on, when known.
 */
export function decideSnapshot(
  local: ProgressState,
  snap: { remote: ProgressState | null; hasPendingWrites: boolean },
  dirty: boolean,
  base: ProgressState | null = null,
): SnapshotDecision {
  if (snap.hasPendingWrites) return { kind: 'ignore' }
  const remote = snap.remote ?? empty() // no copy (deleted on another device): nothing saved
  if (!dirty) return sameProgress(remote, local) ? { kind: 'in-sync' } : { kind: 'replace', state: remote }
  const merged = merge(local, remote, base)
  return { kind: 'merge', state: merged, write: !sameProgress(merged, remote) }
}

interface Copy {
  rev: number
  state: ProgressState
  /** canonical form */
  c: string
}
const copyOf = (rev: number, state: ProgressState): Copy => ({ rev, state, c: canonical(state) })

/** The account copy this browser's progress builds on, as noted for `uid` (null if none, or noted for someone else). */
function storedBase(uid: string): ProgressState | null {
  const b = readJSON<{ uid?: unknown; data?: unknown } | null>(SYNCED_KEY, null)
  return b && typeof b === 'object' && b.uid === uid ? normalizeProgress(b.data) : null
}

export function createProgressSync(opts: SyncOptions): ProgressSync {
  const { adapter, store, onStatus } = opts
  const debounceMs = opts.debounceMs ?? WRITE_DEBOUNCE_MS
  const now = opts.now ?? (() => new Date())

  let uid: string | null = null
  /** bumped on every start and stop, so late callbacks from an earlier sign-in are dropped */
  let gen = 0
  /** the first merge is done (until then local changes wait for it instead of being written) */
  let ready = false
  /** this browser has changes the account copy may not have */
  let dirty = false
  /** Reset was pressed before the first merge, so the account copy must not be merged back in */
  let resetBeforeReady = false
  /** the account copy is being applied here: its change event must not be written back */
  let applyingRemote = false
  /** the account copy is being deleted: changes here are not written meanwhile */
  let deleting = false
  let errorShown = false
  /** the last save was refused (most likely another device saved first); a second refusal in a row is shown as an error */
  let refused = false
  let timer: ReturnType<typeof setTimeout> | null = null
  /**
   * Writes in flight, and the queue that runs them one at a time, in order. Both belong to one sign-in (halt() starts
   * them afresh): a save left hanging by the previous person (Firestore never settles a signed-out user's pending
   * writes) must not hold up the next person's.
   */
  let writing = 0
  let queue: Promise<void> = Promise.resolve()
  /** the account copy this browser's progress builds on: the latest one seen or saved here, with its revision */
  let known: Copy = copyOf(0, empty())
  /** this browser's save in flight: its confirmation is nothing new, and the save sent while the page closes builds on it */
  let inFlight: Copy | null = null
  /** the account copy disappeared without this browser deleting it: check the account still exists before saving again */
  let vanished = false
  let unwatch: (() => void) | null = null
  let unlisten: (() => void) | null = null

  const status = (patch: Partial<SyncStatus> = {}) => onStatus({ syncing: timer !== null || writing > 0, ...patch })
  const showError = (message: string) => {
    errorShown = true
    status({ error: message })
  }
  const synced = () => {
    const patch: Partial<SyncStatus> = { lastSyncedAt: now().toISOString() }
    if (errorShown) patch.error = null
    errorShown = false
    status(patch)
  }

  /** Notes the account copy this browser now builds on, here and (for the next visit) in localStorage. */
  function setKnown(rev: number, state: ProgressState) {
    known = copyOf(rev, state)
    if (uid !== null) writeJSON(SYNCED_KEY, { uid, data: state })
  }

  function applyRemote(next: ProgressState) {
    applyingRemote = true
    try {
      store.replace(next, 'remote')
    } finally {
      applyingRemote = false
    }
  }

  function clearTimer() {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }

  function schedule() {
    clearTimer()
    timer = setTimeout(() => {
      timer = null
      void write()
    }, debounceMs)
    status()
  }

  /** Queues a write of whatever this browser holds when its turn comes. */
  function write(): Promise<void> {
    clearTimer()
    const myGen = gen
    const run = queue.then(async () => {
      if (myGen !== gen || uid === null || !dirty) return
      const myUid = uid
      if (vanished) {
        // The account copy was deleted elsewhere: check the account itself still exists before saving into it (if it
        // was deleted on another device, this signs the person out here too, and nothing is saved).
        try {
          await adapter.confirmUser()
        } catch {
          if (myGen === gen) showError(SYNC_ERROR) // still unsaved: the next change tries again
          return
        }
        if (myGen !== gen || !dirty) return
        vanished = false
      }
      const copy = store.get()
      const mine = copyOf(known.rev + 1, copy)
      inFlight = mine
      writing++
      status()
      try {
        await adapter.writeProgress(myUid, copy, mine.rev)
        if (myGen !== gen) return
        refused = false
        if (mine.rev >= known.rev) setKnown(mine.rev, copy) // (unless a newer copy has arrived meanwhile)
        if (sameProgress(store.get(), copy)) dirty = false
        else if (timer === null) schedule() // changed while saving (say, merged with another device) and nothing queued yet
        synced()
      } catch (e) {
        if (myGen !== gen) return
        if (errorCode(e) === 'permission-denied' && !refused) {
          // Most likely another device saved first: its copy arrives from the listener, this browser's changes are
          // merged into it, and saved again. Try again shortly in any case.
          refused = true
          if (timer === null) schedule()
        } else showError(SYNC_ERROR) // still dirty: the next change, flush or merge tries again
      } finally {
        if (myGen === gen) {
          if (inFlight === mine) inFlight = null
          writing--
          status()
        }
      }
    })
    queue = run.catch(() => {})
    return run
  }

  async function firstMerge(myGen: number, remote: ProgressState | null, rev: number) {
    const local = store.get()
    const r = remote ?? empty()
    const d = resetBeforeReady
      ? { state: local, write: !sameProgress(local, r) }
      : decideInitial(local, remote, uid === null ? null : storedBase(uid))
    resetBeforeReady = false
    ready = true
    setKnown(rev, r)
    if (!sameProgress(d.state, local)) applyRemote(d.state)
    dirty = d.write
    if (d.write) await write()
    else if (myGen === gen) synced()
  }

  function onSnapshot(myGen: number, snap: ProgressSnapshot) {
    // fromCache: the server couldn't be reached, so a missing copy means "not known yet", not "none"
    if (myGen !== gen || snap.hasPendingWrites || snap.fromCache) return
    const remote = snap.data == null ? null : normalizeProgress(snap.data)
    const rev = revFrom(snap.rev)
    if (!ready) {
      void firstMerge(myGen, remote, rev) // the first read failed, so this delivery stands in for it
      return
    }
    // Nothing new: the copy already known delivered again (say, on reconnecting), or Firestore confirming this
    // browser's own save (possibly before the save's own reply). Merging it would bring back a lesson un-ticked (or a
    // Reset pressed) here since.
    const r = remote ?? empty()
    const c = canonical(r)
    const mine = inFlight !== null && rev === inFlight.rev && c === inFlight.c
    if (mine || (rev === known.rev && c === known.c)) {
      if (mine) setKnown(rev, r)
      if (!dirty) synced()
      else if (timer === null && writing === 0 && !deleting) schedule() // an earlier save failed: try again now the account copy is back
      return
    }
    if (remote === null && known.rev > 0 && !deleting) {
      // deleted, but not from here: "Delete my saved progress" on another device, or the whole account
      vanished = true
      adapter.confirmUser().catch(() => {}) // if the account is gone, this signs the person out here at once
    }
    const base = known.state
    setKnown(rev, r)
    const d = decideSnapshot(store.get(), { remote, hasPendingWrites: false }, dirty, base)
    if (d.kind === 'in-sync') synced()
    else if (d.kind === 'replace') {
      applyRemote(d.state)
      synced()
    } else if (d.kind === 'merge') {
      if (!sameProgress(d.state, store.get())) applyRemote(d.state)
      if (d.write) schedule()
      else if (writing === 0) {
        // the account copy already has everything this browser has
        dirty = false
        clearTimer()
        synced()
      }
    }
  }

  function onLocalChange(_s: ProgressState, origin: ProgressOrigin) {
    if (uid === null || applyingRemote || deleting) return
    if (origin === 'local') {
      dirty = true
      if (ready) schedule()
    } else if (origin === 'reset') {
      dirty = true
      if (ready) void write()
      else resetBeforeReady = true
    }
    // 'remote' is our own doing; 'clear' only happens on sign-out
  }

  function flush(): Promise<void> {
    if (uid === null || !ready || (!dirty && timer === null)) return queue
    return write()
  }

  const onPageHide = () => {
    // The page may be closing: the normal write won't leave in time, so also send one that outlives the page. It builds
    // on the save in flight, if any: that was sent first, so it most likely lands first.
    if (uid !== null && ready && dirty && !deleting && !vanished) {
      const after = inFlight ?? known
      adapter.writeProgressOnExit?.(uid, store.get(), after.rev + 1, after.state)
    }
    void flush()
  }
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') void flush()
  }

  /** Ends the current sign-in's syncing straight away (a write in flight still settles; its result is ignored). */
  function halt() {
    if (uid === null) return
    gen++
    clearTimer()
    unwatch?.()
    unlisten?.()
    unwatch = unlisten = null
    if (typeof window !== 'undefined') {
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('visibilitychange', onVisibility)
    }
    store.followOtherTabs?.(true)
    uid = null
    ready = dirty = resetBeforeReady = refused = vanished = false
    known = copyOf(0, empty())
    inFlight = null
    queue = Promise.resolve()
    writing = 0
    onStatus({ syncing: false })
  }

  return {
    async start(newUid) {
      if (uid === newUid) return
      halt()
      const myGen = ++gen
      uid = newUid
      store.followOtherTabs?.(false)
      unlisten = store.onChange(onLocalChange)
      if (typeof window !== 'undefined') {
        window.addEventListener('pagehide', onPageHide)
        document.addEventListener('visibilitychange', onVisibility)
      }
      let first: { remote: ProgressState | null; rev: number } | undefined
      try {
        const r = await adapter.readProgress(newUid)
        first = { remote: r?.data == null ? null : normalizeProgress(r.data), rev: revFrom(r?.rev) }
      } catch {
        if (myGen === gen) showError(LOAD_ERROR) // the listener's first delivery will do the merge instead
      }
      if (myGen !== gen) return
      if (first) await firstMerge(myGen, first.remote, first.rev)
      if (myGen !== gen) return
      unwatch = adapter.watchProgress(
        newUid,
        (snap) => onSnapshot(myGen, snap),
        () => {
          if (myGen === gen && !ready) showError(LOAD_ERROR)
        },
      )
    },

    flush,

    async stop({ flush: save = false } = {}) {
      if (uid === null) return
      if (save) await flush()
      const settled = queue
      halt()
      await settled
    },

    async deleteRemote() {
      if (uid === null) return
      const myGen = gen
      const myUid = uid
      clearTimer()
      deleting = true
      try {
        await queue // a write in flight must not land after the delete
        if (myGen !== gen) return
        await adapter.deleteProgress(myUid)
        if (myGen !== gen) return
        store.reset()
        dirty = false
        vanished = false
        setKnown(0, empty())
        // a first merge still under way must not bring the deleted copy back
        if (!ready) resetBeforeReady = true
        synced()
      } finally {
        deleting = false
        if (myGen === gen) status()
      }
    },

    hasUnsaved() {
      if (uid === null) return false
      // before the first merge, nothing of this browser's copy is known to be in the account unless it is unchanged
      // since this browser last synced with it
      if (!ready) return !sameProgress(store.get(), storedBase(uid) ?? empty())
      return dirty || timer !== null
    },
  }
}
