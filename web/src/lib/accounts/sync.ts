import { empty, join, same, type SyncState } from '../progress-crdt'
import type { ProgressOrigin } from '../progress'
import type { AccountsAdapter, ProgressSnapshot, RemoteProgress } from './adapter'
import { errorCode, LOAD_ERROR, SYNC_ERROR } from './errors'

/*
  Keeps this browser's progress and the account copy (progress/{uid}) in step while someone is signed in.
  Both are SyncStates (see lib/progress-crdt.ts): they only ever grow and combine with join(), so syncing is "join
  and write back", and nothing needs to know what any other copy last saw.
  - `remote` is the account copy as last confirmed by the server (a delivery from the listener, a read, or the reply
    to this tab's own save), with its revision. Every confirmed copy is joined into this browser's progress.
  - Something is unsaved when joining this browser's progress into `remote` would change it. Saving sends that join
    as the next revision. The rules refuse a save that doesn't carry the next revision, so a save built on an
    out-of-date copy never overwrites newer work: it is refused, the newer copy is read and joined in, and the save
    is sent again. A refusal loses nothing, as everything is still here (and in localStorage).
  - Changes here are saved 1.5 s after the last one, a Reset at once. Changes another tab stored are saved here only if
    they are still unsaved a few seconds later (that tab saves them itself, unless it closed first). When the tab is
    hidden it saves at once, and as the page closes it also sends the changed parts in a request that outlives it.
  - A failed save shows an error and is tried again later, on the next change, or when the browser is back online.
*/

export const WRITE_DEBOUNCE_MS = 1500
/** Changes another tab stored: that tab saves them, so this one does only if they are still unsaved this much later. */
export const TAB_DELAY_MS = 5000
/** How long "Delete my saved progress" waits for its save to reach the account. */
export const DELETE_WAIT_MS = 10_000
/**
 * After the account copy vanishes (most likely the account is being deleted on another device: its copy goes first,
 * then the account), how long to wait before checking the account still exists and saving a new copy.
 */
export const GONE_WAIT_MS = 10_000
/** The waits before trying again after failures in a row. */
const RETRY_MS = [2000, 5000, 15000, 30000, 60000]
/** Saves (refused ones included) one round of saving may send before pausing. */
const MAX_ROUNDS = 8

/** Waits for `p`, but no longer than `ms`. */
export async function waitAtMost(p: Promise<unknown> | undefined, ms: number): Promise<void> {
  let timeout: ReturnType<typeof setTimeout> | undefined
  await Promise.race([p, new Promise<void>((resolve) => (timeout = setTimeout(resolve, ms)))])
  clearTimeout(timeout)
}

/** The parts of the progress store that sync uses (the real one is `progress` from lib/progress). */
export interface SyncedStore {
  getSync(): SyncState
  owner(): string | null
  claim(uid: string): void
  mergeRemote(remote: SyncState, uid: string): void
  reset(): void
  onChange(cb: (origin: ProgressOrigin) => void): () => void
}

export interface SyncStatus {
  /** a save is waiting or under way */
  syncing: boolean
  lastSyncedAt: string | null
  /** a sync error to show, or null when an earlier one is resolved */
  error: string | null
}

export interface SyncOptions {
  adapter: Pick<AccountsAdapter, 'readProgress' | 'watchProgress' | 'writeProgress' | 'writeProgressOnExit' | 'confirmUser'>
  store: SyncedStore
  /** called with the status fields that may have changed */
  onStatus(patch: Partial<SyncStatus>): void
  debounceMs?: number
  now?: () => Date
}

export interface ProgressSync {
  /** Starts syncing for a signed-in user, whose progress this browser's now is (someone else's is cleared first). */
  start(uid: string): void
  /** Saves now, until nothing is unsaved or saving fails. */
  flush(): Promise<void>
  /** Stops syncing at once. A save under way may still land; its reply is ignored. */
  stop(): void
  /**
   * "Delete my saved progress": a Reset, saved at once. Resolves 'pending' if it hasn't reached the account in time (it
   * will later, like any change). Rejects only if the Reset couldn't be made.
   */
  deleteRemote(): Promise<'saved' | 'pending'>
  /** Whether this browser holds progress the account may not have yet (signing out now would lose it). */
  hasUnsaved(): boolean
}

export function createProgressSync(opts: SyncOptions): ProgressSync {
  const { adapter, store, onStatus } = opts
  const debounceMs = opts.debounceMs ?? WRITE_DEBOUNCE_MS
  const now = opts.now ?? (() => new Date())

  let uid: string | null = null
  /** bumped on every start and stop, so late replies for an earlier sign-in are dropped */
  let gen = 0
  /** the account copy as last confirmed by the server (null: none, or none heard yet), and its revision */
  let remote: SyncState | null = null
  let rev = 0
  /** a confirmed account copy has been heard since syncing started */
  let loaded = false
  /** the round of saving under way */
  let saving: Promise<void> | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let timerAt = 0
  /** failures in a row, for the wait before trying again */
  let failures = 0
  /** when the account copy last vanished (0: it hasn't) */
  let goneAt = 0
  let errorShown = false
  let cleanups: (() => void)[] = []

  const status = (patch: Partial<SyncStatus> = {}) => onStatus({ syncing: timer !== null || saving !== null, ...patch })
  const showError = (message: string) => {
    errorShown = true
    status({ error: message })
  }
  const synced = () => {
    failures = 0
    const patch: Partial<SyncStatus> = { lastSyncedAt: now().toISOString() }
    if (errorShown) patch.error = null
    errorShown = false
    status(patch)
  }

  /** This browser's progress joined into the account copy: what the account copy should be. */
  const target = () => join(remote ?? empty(), store.getSync())
  function unsaved(): boolean {
    if (uid === null || store.owner() !== uid) return false // (another tab signed out or switched person: nothing of theirs here)
    return !same(target(), remote ?? empty())
  }

  function clearTimer() {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }
  /** Saves in `ms` (instead of when already planned; with keepSooner, unless that is sooner). */
  function schedule(ms: number, keepSooner = false) {
    const at = Date.now() + ms
    if (keepSooner && timer !== null && timerAt <= at) return
    clearTimer()
    timerAt = at
    timer = setTimeout(() => {
      timer = null
      void kick()
    }, ms)
    status()
  }
  function fail(message: string) {
    showError(message)
    schedule(RETRY_MS[Math.min(failures, RETRY_MS.length - 1)])
    failures++
  }

  /** Starts a round of saving unless one is under way; resolves when it ends. */
  function kick(): Promise<void> {
    if (saving) return saving // (it saves what this would; a wait it set, say before trying again, stays set)
    clearTimer()
    if (uid === null) return Promise.resolve()
    const round: Promise<void> = save(gen, uid).finally(() => {
      if (saving !== round) return
      saving = null
      status()
    })
    saving = round
    status()
    return round
  }

  async function save(myGen: number, me: string): Promise<void> {
    for (let i = 0; i < MAX_ROUNDS; i++) {
      if (!loaded && !(await refetch(myGen, me))) return
      if (myGen !== gen) return
      if (!unsaved()) return synced()
      if (rev === 0) {
        // About to create the account copy (a new account, or the copy disappeared): first check the account itself
        // still exists. One deleted on another device keeps its sign-in working here for up to an hour, and saving
        // would leave its progress behind; instead this signs the person out here too, and nothing is saved. (A copy
        // that has just vanished gets a moment first: the account goes a moment after its copy.)
        const wait = goneAt + GONE_WAIT_MS - Date.now()
        if (wait > 0) return void schedule(wait)
        try {
          await adapter.confirmUser()
        } catch {
          if (myGen === gen) fail(SYNC_ERROR)
          return
        }
        // (another tab signed out or switched person meanwhile: nothing here is theirs, and that tab's sign-in takes over)
        if (myGen !== gen || store.owner() !== me) return
      }
      const base = rev
      const next = target()
      try {
        await adapter.writeProgress(me, next, base + 1)
      } catch (e) {
        if (myGen !== gen) return
        if (errorCode(e) !== 'permission-denied') return fail(SYNC_ERROR)
        // Refused: most likely another device or tab saved first (or this save landed, its reply was lost and the
        // re-send was refused). Read the account copy, join it in and save again. Refused while the account copy is
        // still the one the save was built on means something else is wrong.
        if (!(await refetch(myGen, me))) return
        if (rev === base) return fail(SYNC_ERROR)
        continue
      }
      if (myGen !== gen) return
      if (base + 1 > rev) {
        remote = next
        rev = base + 1
      }
    }
    if (myGen === gen && unsaved()) fail(SYNC_ERROR) // (saves kept being overtaken: pause, then try again)
  }

  /**
   * Takes an account copy confirmed by the server. A listener delivery with a lower revision than the copy this device
   * knows is either late, or the copy was deleted and created again (say "Delete my account" failed half-way on another
   * device): the next save reads the copy first to tell which.
   */
  function take(got: RemoteProgress, fresh: boolean) {
    loaded = true
    if (got.state === null) {
      if (remote === null && rev === 0) return
      // Gone without this browser deleting it: most likely the whole account was deleted on another device. If so,
      // this signs the person out here at once (and until then, save() checks before creating a new copy).
      remote = null
      rev = 0
      goneAt = Date.now()
      adapter.confirmUser().catch(() => {})
      return
    }
    if (fresh || got.rev >= rev) {
      remote = got.state
      rev = got.rev
    } else loaded = false
    store.mergeRemote(got.state, uid!)
  }

  /** Reads the account copy from the server and takes it. False if that failed (it is tried again later). */
  async function refetch(myGen: number, me: string): Promise<boolean> {
    try {
      const got = await adapter.readProgress(me)
      if (myGen !== gen) return false
      if (got.hasPendingWrites) {
        // not purely the server's copy (a save of this device's is still on its way): try again shortly
        if (got.state) store.mergeRemote(got.state, me)
        schedule(RETRY_MS[0])
        return false
      }
      take(got, true)
      return true
    } catch {
      if (myGen === gen) fail(loaded ? SYNC_ERROR : LOAD_ERROR)
      return false
    }
  }

  function onSnapshot(myGen: number, snap: ProgressSnapshot) {
    // (fromCache: the server couldn't be reached, so this says nothing about the account copy)
    if (myGen !== gen || snap.hasPendingWrites || snap.fromCache) return
    take(snap, false)
    if (!loaded) void kick() // (see take(): a read, and a save if the copy lacks anything)
    else if (unsaved()) {
      if (timer === null || timerAt - Date.now() > debounceMs) void kick() // (unless changes here are still coming)
    } else if (saving === null) {
      clearTimer()
      synced()
    }
  }

  function onLocalChange(origin: ProgressOrigin) {
    if (origin === 'local') schedule(debounceMs)
    else if (origin === 'reset') void kick()
    else if (origin === 'tab') schedule(TAB_DELAY_MS, true)
    // ('remote' is the account copy itself; 'clear' means it isn't this person's progress any more)
  }

  const onPageHide = () => {
    // The page may be closing, and a save sent the usual way may not leave in time: also send the changed parts in a
    // request that outlives the page, built on the copy the server last confirmed. If anything else lands first (this
    // tab's own save, or another device's), it is refused, and nothing is lost: it is all in localStorage too.
    if (uid === null || !unsaved()) return
    if (rev > 0 && remote !== null && adapter.writeProgressOnExit?.(uid, target(), rev + 1, remote)) return
    void kick()
  }
  const onVisibility = () => {
    if (document.visibilityState === 'hidden' && unsaved()) void kick()
  }
  const onOnline = () => {
    if (unsaved()) void kick()
  }

  /** Ends the current sign-in's syncing straight away. */
  function halt() {
    gen++
    clearTimer()
    cleanups.forEach((f) => f())
    cleanups = []
    uid = null
    remote = null
    rev = 0
    loaded = false
    saving = null // (a save left hanging, say by Firestore for someone signed out, mustn't hold up the next person's)
    failures = 0
    goneAt = 0
    onStatus({ syncing: false })
  }

  async function flush() {
    const myGen = gen
    for (let i = 0; i < 3 && myGen === gen && unsaved(); i++) await kick()
  }

  return {
    start(newUid) {
      if (uid === newUid) return
      halt()
      const myGen = gen
      uid = newUid
      store.claim(newUid)
      cleanups.push(store.onChange(onLocalChange))
      if (typeof window !== 'undefined') {
        window.addEventListener('pagehide', onPageHide)
        window.addEventListener('online', onOnline)
        document.addEventListener('visibilitychange', onVisibility)
        cleanups.push(() => {
          window.removeEventListener('pagehide', onPageHide)
          window.removeEventListener('online', onOnline)
          document.removeEventListener('visibilitychange', onVisibility)
        })
      }
      cleanups.push(
        adapter.watchProgress(
          newUid,
          (snap) => onSnapshot(myGen, snap),
          () => {
            if (myGen === gen) showError(loaded ? SYNC_ERROR : LOAD_ERROR)
          },
        ),
      )
      status()
    },

    flush,

    stop() {
      if (uid !== null) halt()
    },

    async deleteRemote() {
      if (uid === null) return 'saved'
      if (store.owner() !== uid) throw new Error("This browser's progress isn't this person's any more") // (signed out in another tab)
      const myGen = gen
      store.reset() // (it also forgets the half-done mock exam)
      await waitAtMost(flush(), DELETE_WAIT_MS)
      return myGen === gen && unsaved() ? 'pending' : 'saved'
    },

    hasUnsaved: unsaved,
  }
}
