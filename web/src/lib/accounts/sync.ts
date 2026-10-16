import { canonical, mergeProgress, normalizeProgress, rebaseProgress, sameProgress, SYNCED_KEY, type ProgressOrigin, type ProgressState } from '../progress'
import { readJSON, writeJSON } from '../storage'
import { revFrom, type AccountsAdapter, type ProgressSnapshot } from './adapter'
import { errorCode, LOAD_ERROR, SYNC_ERROR } from './errors'

export { sameProgress }

/*
  Keeps this browser's progress and the account copy (progress/{uid}) in step while someone is signed in.
  - Every save carries the account copy's next revision number, and the account refuses a save that doesn't (see
    backend/firestore.rules). So a save based on an out-of-date copy (say, one queued on a phone while the laptop
    saved) can't overwrite newer work: it is refused, the newer copy arrives from the listener, and this browser's
    changes are merged into it and saved again. Revision numbers never start again while the account exists ("Delete
    my saved progress" saves an empty copy as the next one), so an old save can't line up with newer ones either.
  - This browser remembers the account copy its progress builds on (SYNCED_KEY, with the uid). Merging then means:
    take the account copy and redo on it what changed here since (lessons ticked or un-ticked, answers, a Reset).
    So a Reset, an un-tick or "Delete my saved progress" done on another device stays done, while changes made here
    that didn't reach the account (offline, or just before the page closed) still do on the next visit. Without
    that note (progress made before signing in), the two copies are combined, keeping everything either has.
    The note also lists the saves sent from here that haven't been seen to land (a reply lost with the connection,
    the save sent while the page closed): when the account copy turns out to be one of them, it is the base.
  - Sign-in: read the account copy, merge as above, show the result here, and save it if the account copy lacks anything.
  - Then listen to the account copy: with nothing unsaved here take it as it is, otherwise merge and save.
  - Changes here are saved 1.5 s after the last one, and at once when the tab is hidden or closed. Reset is saved at once.
  - A failed save leaves the changes marked unsaved; the next change (or the tab being hidden) tries again.
  - Signed-in tabs of one browser each sync with the account; a change in one is redone on what another saved to
    this browser meanwhile (see lib/progress.ts), and saved with it.
*/

export const WRITE_DEBOUNCE_MS = 1500

/** The parts of the progress store that sync uses (the real one is `progress` from lib/progress). */
export interface SyncedStore {
  get(): ProgressState
  replace(next: ProgressState, origin: 'remote'): void
  reset(): void
  onChange(cb: (s: ProgressState, origin: ProgressOrigin) => void): () => void
  /**
   * Whether to take progress saved by another tab of this browser: off while syncing, as each tab syncs with the
   * account itself. Turning it off first takes in what another tab has saved, so the copy matches what is stored.
   */
  followOtherTabs?(on: boolean): void
  /** Takes in, as a change made here, what other signed-in tabs of this browser saved there and this tab lacks. */
  takeOtherTabs?(): void
}

export interface SyncStatus {
  /** a write is waiting or in flight */
  syncing: boolean
  lastSyncedAt: string | null
  /** a sync error to show, or null when an earlier one is resolved */
  error: string | null
}

export interface SyncOptions {
  adapter: Pick<AccountsAdapter, 'readProgress' | 'watchProgress' | 'writeProgress' | 'writeProgressOnExit' | 'clearProgress' | 'confirmUser'>
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
  /**
   * Empties the account copy, then this browser's copy (keeping only progress made meanwhile). Rejects if that fails,
   * or before the first merge (the account copy isn't known yet).
   */
  deleteRemote(): Promise<void>
  /** Whether this browser holds progress the account may not have yet (signing out now would lose it). */
  hasUnsaved(): boolean
}

const empty = (): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [] })

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
  const remote = snap.remote ?? empty() // no copy (the account was deleted on another device): nothing saved
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

/** A save sent from this browser: its revision and a fingerprint of what it saved. */
interface Sent {
  rev: number
  f: string
  /** sent from this page (not just listed in the note when syncing started, possibly by another tab) */
  here?: boolean
}

/** A short fingerprint (53-bit cyrb53) of a copy's canonical form, so the note can recognise a copy without holding it. */
function fingerprint(c: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < c.length; i++) {
    const ch = c.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

/** What this browser noted for `uid` (null if nothing, or noted for someone else): the account copy its progress builds on, and saves sent. */
function storedNote(uid: string): { base: ProgressState; sent: Sent[] } | null {
  const n = readJSON<{ uid?: unknown; data?: unknown; sent?: unknown } | null>(SYNCED_KEY, null)
  if (!n || typeof n !== 'object' || n.uid !== uid) return null
  const sent = Array.isArray(n.sent)
    ? n.sent.filter((s): s is Sent => typeof s === 'object' && s !== null && Number.isSafeInteger(s.rev) && typeof s.f === 'string')
    : []
  return { base: normalizeProgress(n.data), sent: sent.map(({ rev, f }) => ({ rev, f })) }
}

/** How many unconfirmed saves the note keeps. */
const MAX_SENT = 4

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
  /** the account copy is being emptied ("Delete my saved progress"): nothing is written, and account copies wait */
  let deleting = false
  /** the latest account copy that arrived while `deleting` (dealt with once the delete is done) */
  let heldSnapshot: ProgressSnapshot | null = null
  let errorShown = false
  /**
   * the last save was refused (most likely another device saved first); a second refusal in a row, with no newer
   * account copy seen since that save was built, is shown as an error
   */
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
  /** this browser's save in flight: its confirmation is nothing new */
  let inFlight: Copy | null = null
  /**
   * The account copy this browser's progress built on when syncing started, as noted then. Read once, as syncing
   * starts (this tab's copy matches what is stored then): another tab may note a newer one later, which this tab's
   * copy doesn't build on.
   */
  let startBase: ProgressState | null = null
  /** saves sent from this browser that haven't been seen to land (the newest few), kept in the note too */
  let sent: Sent[] = []
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

  function writeNote() {
    if (uid !== null) writeJSON(SYNCED_KEY, { uid, data: known.state, sent: sent.map(({ rev, f }) => ({ rev, f })) })
  }

  /**
   * Notes the account copy this browser now builds on, here and (for the next visit) in localStorage. Called after
   * this browser's copy is updated to build on it, so a tab starting meanwhile never reads a note newer than the copy.
   */
  function setKnown(rev: number, state: ProgressState) {
    known = copyOf(rev, state)
    sent = rev === 0 ? [] : sent.filter((s) => s.rev > rev) // the rest landed (and `known` builds on them) or never will
    writeNote()
  }

  /** Notes a save sent from here, so it is recognised as this browser's own when it lands, even if its reply never arrives. */
  function noteSent(rev: number, c: string) {
    sent = [...sent, { rev, f: fingerprint(c), here: true }].slice(-MAX_SENT)
    writeNote()
  }

  /** Whether the account copy (revision `rev`, canonical form `c`) is one this browser sent; `here`: only from this page. */
  function sentFromHere(rev: number, c: string, here: boolean): boolean {
    const candidates = sent.filter((s) => s.rev === rev && (!here || s.here))
    return candidates.length > 0 && candidates.some((s) => s.f === fingerprint(c))
  }

  function applyRemote(next: ProgressState) {
    applyingRemote = true
    try {
      store.replace(next, 'remote')
    } finally {
      applyingRemote = false
    }
    // The store kept changes another tab of this browser saved there meanwhile (see lib/progress.ts): they may never
    // reach the account otherwise, so save them.
    if (!sameProgress(store.get(), next)) {
      dirty = true
      if (ready && !deleting) schedule()
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
      // (nothing may land after the delete: deleteRemote deals with what is kept once it is done)
      if (myGen !== gen || uid === null || !dirty || deleting) return
      const myUid = uid
      if (known.rev === 0) {
        // About to create the account copy (a new account, or the account copy disappeared): check the account itself
        // still exists first. One deleted on another device keeps its sign-in working here for up to an hour, and saving
        // would leave its progress behind; instead this signs the person out here too, and nothing is saved.
        try {
          await adapter.confirmUser()
        } catch {
          if (myGen === gen) showError(SYNC_ERROR) // still unsaved: the next change, flush or account copy tries again
          return
        }
        if (myGen !== gen || !dirty || deleting) return
      }
      // with whatever another tab of this browser saved there that this one lacks (it may have closed before saving it)
      store.takeOtherTabs?.()
      const copy = store.get()
      const mine = copyOf(known.rev + 1, copy)
      inFlight = mine
      noteSent(mine.rev, mine.c)
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
        if (errorCode(e) === 'permission-denied' && (!refused || known.rev >= mine.rev)) {
          // Most likely another device saved first: its copy arrives from the listener, this browser's changes are
          // merged into it, and saved again. Try again shortly in any case. (A newer copy that arrived while this save
          // was on its way means it was simply built on an out-of-date one, however many times in a row.)
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
    // The base: the copy noted when syncing started or, when the account copy is a save sent from here whose reply
    // never arrived (sent as the page closed, say), the account copy itself.
    const base = rev > 0 && sentFromHere(rev, canonical(r), false) ? r : startBase
    const d = resetBeforeReady ? { state: local, write: !sameProgress(local, r) } : decideInitial(local, remote, base)
    resetBeforeReady = false
    ready = true
    if (!sameProgress(d.state, local)) applyRemote(d.state)
    setKnown(rev, r)
    dirty = d.write || !sameProgress(store.get(), d.state)
    if (dirty) await write()
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
    if (deleting) {
      heldSnapshot = snap // dealt with once the delete is done, against what is left then
      return
    }
    // Nothing new: the copy already known delivered again (say, on reconnecting), or Firestore confirming this
    // browser's own save (possibly before the save's own reply, or after the reply was lost and a re-send refused).
    // Merging it would bring back a lesson un-ticked (or a Reset pressed) here since.
    const r = remote ?? empty()
    const c = canonical(r)
    const mine = (inFlight !== null && rev === inFlight.rev && c === inFlight.c) || sentFromHere(rev, c, true)
    if (mine || (rev === known.rev && c === known.c)) {
      if (mine) setKnown(rev, r)
      if (!dirty) synced()
      else if (timer === null && writing === 0) schedule() // an earlier save failed: try again now the account copy is back
      return
    }
    // gone without this browser deleting it: the whole account was deleted (on another device). If so, this signs the
    // person out here at once (and until then, write() checks before saving anything).
    if (remote === null && known.rev > 0) adapter.confirmUser().catch(() => {})
    const d = decideSnapshot(store.get(), { remote, hasPendingWrites: false }, dirty, known.state)
    if (d.kind === 'in-sync') {
      setKnown(rev, r)
      synced()
    } else if (d.kind === 'replace') {
      applyRemote(d.state)
      setKnown(rev, r)
      synced()
    } else if (d.kind === 'merge') {
      if (!sameProgress(d.state, store.get())) applyRemote(d.state)
      setKnown(rev, r)
      if (d.write || !sameProgress(store.get(), d.state)) schedule()
      else if (writing === 0) {
        // the account copy already has everything this browser has
        dirty = false
        clearTimer()
        synced()
      }
    }
  }

  function onLocalChange(_s: ProgressState, origin: ProgressOrigin) {
    if (uid === null || applyingRemote) return
    // (while deleting, the change is marked unsaved but not written: deleteRemote keeps it once the delete is done)
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
    // on the account copy last confirmed here, never on a save still in flight (which may yet be refused): if anything
    // lands first (this browser's own save, or another device's), it is refused rather than overwrite parts it never
    // saw, and its changes stay in this browser for the next visit's merge. It never creates the account copy (see
    // write()). What it sends is noted, so the next visit recognises it if it lands.
    if (uid !== null && ready && dirty && !deleting && known.rev > 0) {
      const saved = adapter.writeProgressOnExit?.(uid, store.get(), known.rev + 1, known.state)
      if (saved) noteSent(known.rev + 1, canonical(saved))
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
    ready = dirty = resetBeforeReady = refused = deleting = false
    known = copyOf(0, empty())
    inFlight = heldSnapshot = startBase = null
    sent = []
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
      // the note first, then this tab's copy (catching up with other tabs): they are written in the other order
      const note = storedNote(newUid)
      store.followOtherTabs?.(false)
      startBase = note?.base ?? null
      sent = note?.sent ?? []
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
      if (!ready) throw new Error("The account copy hasn't loaded yet")
      const myGen = gen
      const myUid = uid
      clearTimer()
      deleting = true
      const before = store.get() // what is being deleted: progress made after this (say, while offline) is kept
      try {
        await queue // a write in flight lands before the delete, not after it
        if (myGen !== gen) return
        // An empty copy as the next revision, not a deleted document: revision numbers never start again, so a save
        // queued on another device before this can never line up with later ones and land on top.
        const rev = await adapter.clearProgress(myUid)
        if (myGen !== gen) return
        const since = rebaseProgress(store.get(), empty(), before)
        applyingRemote = true
        try {
          store.reset() // (also the half-done mock exam)
          if (!sameProgress(since, empty())) store.replace(since, 'remote')
        } finally {
          applyingRemote = false
        }
        setKnown(rev, empty())
        dirty = !sameProgress(store.get(), empty())
        synced()
      } finally {
        if (myGen === gen) {
          deleting = false
          // an account copy that arrived meanwhile (newer than the delete, or the delete failed), and anything unsaved
          const held = heldSnapshot
          heldSnapshot = null
          if (held && revFrom(held.rev) >= known.rev) onSnapshot(myGen, held)
          if (dirty && timer === null) schedule()
          status()
        }
      }
    },

    hasUnsaved() {
      if (uid === null) return false
      // before the first merge, nothing of this browser's copy is known to be in the account unless it is unchanged
      // since this browser last synced with it
      if (!ready) return !sameProgress(store.get(), startBase ?? empty())
      return dirty || timer !== null
    },
  }
}
