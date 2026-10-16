import { mergeProgress, normalizeProgress, type ProgressOrigin, type ProgressState } from '../progress'
import type { AccountsAdapter, ProgressSnapshot } from './adapter'
import { LOAD_ERROR, SYNC_ERROR } from './errors'

/*
  Keeps this browser's progress and the account copy (progress/{uid}) in step while someone is signed in.
  - Sign-in: read the account copy once and merge it with this browser's copy, so progress made before signing in
    is kept. Show the result here, and write it back if the account copy lacks anything.
  - Then listen to the account copy. With unsaved changes here, merge it in and save; otherwise take it as it is,
    so a reset or an un-ticked lesson on another device shows up here too.
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
}

export interface SyncStatus {
  /** a write is waiting or in flight */
  syncing: boolean
  lastSyncedAt: string | null
  /** a sync error to show, or null when an earlier one is resolved */
  error: string | null
}

export interface SyncOptions {
  adapter: Pick<AccountsAdapter, 'readProgress' | 'watchProgress' | 'writeProgress' | 'writeProgressOnExit' | 'deleteProgress'>
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

/** The first sync after sign-in: what this browser should hold, and whether the account copy needs writing. */
export function decideInitial(local: ProgressState, remote: ProgressState | null): { state: ProgressState; write: boolean } {
  const base = remote ?? empty()
  const merged = mergeProgress(local, base)
  // an account with no copy yet and nothing to add needs no write
  return { state: merged, write: !sameProgress(merged, base) }
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

/** What to do when the account copy changes. `dirty`: this browser has changes that may not be saved yet. */
export function decideSnapshot(
  local: ProgressState,
  snap: { remote: ProgressState | null; hasPendingWrites: boolean },
  dirty: boolean,
): SnapshotDecision {
  if (snap.hasPendingWrites) return { kind: 'ignore' }
  const remote = snap.remote ?? empty() // no copy (deleted on another device): nothing saved
  if (!dirty) return sameProgress(remote, local) ? { kind: 'in-sync' } : { kind: 'replace', state: remote }
  const merged = mergeProgress(local, remote)
  return { kind: 'merge', state: merged, write: !sameProgress(merged, remote) }
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
  let timer: ReturnType<typeof setTimeout> | null = null
  let writing = 0
  /** writes run one at a time, in order */
  let queue: Promise<void> = Promise.resolve()
  /** what this browser has sent (canonical form, oldest first) and not yet seen come back from the listener */
  let sent: string[] = []
  /** the last account copy this browser has seen (canonical form): a repeat of it holds nothing new */
  let lastRemote: string | null = null
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
      const copy = store.get()
      const c = canonical(copy)
      sent.push(c)
      if (sent.length > 5) sent.shift()
      writing++
      status()
      try {
        await adapter.writeProgress(myUid, copy)
        if (myGen !== gen) return
        if (sameProgress(store.get(), copy)) dirty = false
        else if (timer === null) schedule() // changed while saving (say, merged with another device) and nothing queued yet
        synced()
      } catch {
        if (myGen !== gen) return
        const i = sent.lastIndexOf(c)
        if (i !== -1) sent.splice(i, 1) // a failed write never comes back from the listener
        showError(SYNC_ERROR) // still dirty: the next change, flush or merge tries again
      } finally {
        writing--
        if (myGen === gen) status()
      }
    })
    queue = run.catch(() => {})
    return run
  }

  async function firstMerge(myGen: number, remote: ProgressState | null) {
    const local = store.get()
    const d = resetBeforeReady ? { state: local, write: !sameProgress(local, remote ?? empty()) } : decideInitial(local, remote)
    resetBeforeReady = false
    ready = true
    lastRemote = canonical(remote ?? empty())
    if (!sameProgress(d.state, local)) applyRemote(d.state)
    dirty = d.write
    if (d.write) await write()
    else if (myGen === gen) synced()
  }

  function onSnapshot(myGen: number, snap: ProgressSnapshot) {
    // fromCache: the server couldn't be reached, so a missing copy means "not known yet", not "none"
    if (myGen !== gen || snap.hasPendingWrites || snap.fromCache) return
    const remote = snap.data == null ? null : normalizeProgress(snap.data)
    if (!ready) {
      void firstMerge(myGen, remote) // the first read failed, so this delivery stands in for it
      return
    }
    // Nothing new: Firestore confirming this browser's own write (one more delivery, without hasPendingWrites), or the
    // copy already seen delivered again (say, on reconnecting). Merging it would bring back a lesson un-ticked (or a
    // Reset pressed) here since.
    const c = canonical(remote ?? empty())
    const mine = sent.indexOf(c)
    if (mine !== -1) sent.splice(0, mine + 1) // older copies too, so they can't hide a later identical change from elsewhere
    if (mine !== -1 || c === lastRemote) {
      lastRemote = c
      if (!dirty) synced()
      else if (timer === null && writing === 0 && !deleting) schedule() // an earlier save failed: try again now the account copy is back
      return
    }
    lastRemote = c
    const d = decideSnapshot(store.get(), { remote, hasPendingWrites: false }, dirty)
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
    // the page may be closing: the normal write won't leave in time, so also send one that outlives the page
    if (uid !== null && ready && dirty && !deleting) adapter.writeProgressOnExit?.(uid, store.get())
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
    uid = null
    ready = dirty = resetBeforeReady = false
    sent = []
    lastRemote = null
    onStatus({ syncing: false })
  }

  return {
    async start(newUid) {
      if (uid === newUid) return
      halt()
      const myGen = ++gen
      uid = newUid
      unlisten = store.onChange(onLocalChange)
      if (typeof window !== 'undefined') {
        window.addEventListener('pagehide', onPageHide)
        document.addEventListener('visibilitychange', onVisibility)
      }
      let remote: ProgressState | null | undefined
      try {
        const raw = await adapter.readProgress(newUid)
        remote = raw == null ? null : normalizeProgress(raw)
      } catch {
        if (myGen === gen) showError(LOAD_ERROR) // the listener's first delivery will do the merge instead
      }
      if (myGen !== gen) return
      if (remote !== undefined) await firstMerge(myGen, remote)
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
        // a first merge still under way must not bring the deleted copy back
        if (!ready) resetBeforeReady = true
        synced()
      } finally {
        deleting = false
        if (myGen === gen) status()
      }
    },
  }
}
