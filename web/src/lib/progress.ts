import { useSyncExternalStore } from 'react'
import * as crdt from './progress-crdt'
import type { ExamRecord, ProgressState, SyncState } from './progress-crdt'
import { PREFIX, readRaw, removeKey, writeJSON } from './storage'

export type { ExamRecord, ProgressState, SyncState } from './progress-crdt'

/*
  Per-viewer study progress, stored in localStorage (and, when accounts are on and the viewer signs in, synced to
  their account by lib/accounts/sync.ts). It is kept as a SyncState (see progress-crdt.ts); the pages see its
  projection, the plain ProgressState.
  Tabs of one browser share the stored copy: every change joins what is stored first and writes the result, and a
  change another tab stores is joined in here. Join is safe whatever order this happens in.
  The stored copy also says whose progress it is (`owner`, a uid, while someone is signed in). A tab never mixes its
  copy into someone else's: when another tab clears the copy (sign-out) or it belongs to someone else now, this tab
  takes the stored copy as it is.
*/

/**
 * Where a change came from: 'local' (this viewer did something here), 'reset' (they pressed Reset), 'tab' (another
 * tab of this browser stored a change), 'remote' (the account copy was joined in) or 'clear' (this browser's copy was
 * wiped, here or in another tab, or now belongs to someone else).
 */
export type ProgressOrigin = 'local' | 'reset' | 'tab' | 'remote' | 'clear'

const KEY = 'progress-v1'
/** MockExam's own key for a finished or half-done attempt: it is mock-exam history too */
const MOCK_KEY = 'mock-current'

let state: SyncState = crdt.empty()
let owner: string | null = null
let view: ProgressState = crdt.project(state)
/** progress-v1 as this tab last wrote or read it (null: none): other text there now means another tab stored a change */
let seen: string | null = null
const listeners = new Set<() => void>()
const changeListeners = new Set<(origin: ProgressOrigin) => void>()

function parse(raw: string): { state: SyncState; owner: string | null } {
  let x: unknown = null
  try {
    x = JSON.parse(raw)
  } catch {
    /* damaged: read as empty */
  }
  const o = typeof x === 'object' && x !== null ? (x as { owner?: unknown }).owner : null
  return { state: crdt.fromJSON(x), owner: typeof o === 'string' ? o : null }
}

function set(next: SyncState, nextOwner: string | null) {
  state = next
  owner = nextOwner
  view = crdt.project(next)
}

function persist() {
  writeJSON(KEY, owner === null ? crdt.toJSON(state) : { ...crdt.toJSON(state), owner })
  seen = readRaw(KEY) // (unchanged if storage refused it: this tab's copy then stays in memory only)
}

function notify(origin: ProgressOrigin) {
  listeners.forEach((l) => l())
  changeListeners.forEach((cb) => cb(origin))
}

/**
 * Catches up with the stored copy if another tab has changed it since this tab last read or wrote it, and says how
 * this tab's copy changed (null: it didn't). The same person's copy is joined in (and written back if this tab's
 * holds more); a copy cleared, or someone else's now, is taken as it is.
 */
function refresh(): ProgressOrigin | null {
  const raw = readRaw(KEY)
  if (raw === seen) return null
  seen = raw
  if (raw === null) {
    // cleared by another tab (signing out)
    const had = owner !== null || !crdt.same(state, crdt.empty())
    set(crdt.empty(), null)
    return had ? 'clear' : null
  }
  const stored = parse(raw)
  if (stored.owner !== owner) {
    set(stored.state, stored.owner)
    return 'clear'
  }
  const joined = crdt.join(state, stored.state)
  const changed = !crdt.same(joined, state)
  if (changed) set(joined, owner)
  // this tab holds something the stored copy lacks (two tabs wrote at once, say): store it again
  if (!crdt.same(joined, stored.state)) persist()
  return changed ? 'tab' : null
}

function refreshAndNotify() {
  const origin = refresh()
  if (origin) notify(origin)
}

/** A change made here: joined with what is stored, applied, stored and announced. */
function commit(change: (s: SyncState) => SyncState, origin: 'local' | 'reset') {
  const caught = refresh()
  const next = change(state)
  if (next !== state) {
    set(next, owner)
    persist()
    notify(origin)
  } else if (caught) notify(caught)
}

{
  const raw = readRaw(KEY)
  if (raw !== null) {
    const stored = parse(raw)
    set(stored.state, stored.owner)
    seen = raw
  }
}

// Another tab stored a change (or cleared the copy): catch up. (Storage is read again rather than trusting e.newValue,
// as events can arrive late.)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key === PREFIX + KEY) refreshAndNotify() // (key null: localStorage.clear())
  })
}

export const progress = {
  get: () => view,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  /** Like subscribe, but also says where the change came from (used by account sync). */
  onChange(cb: (origin: ProgressOrigin) => void) {
    changeListeners.add(cb)
    return () => {
      changeListeners.delete(cb)
    }
  },
  markLesson(key: string, done = true) {
    commit((s) => crdt.markLesson(s, key, done, Date.now()), 'local')
  },
  /** Records a checkpoint score (kept if it is the best so far). */
  recordCheckpoint(key: string, score: number) {
    commit((s) => crdt.recordCheckpoint(s, key, score, Date.now()), 'local')
  },
  recordAnswer(questionId: string, correct: boolean) {
    commit((s) => crdt.recordAnswer(s, questionId, correct, Date.now()), 'local')
  },
  /**
   * Records a finished mock exam (the same attempt only once), with the answers given in it, as one change: one write
   * to storage and one notification, however many questions it had.
   */
  recordExam(rec: ExamRecord, answers: [questionId: string, correct: boolean][] = []) {
    commit((s) => crdt.recordExam(crdt.recordAnswers(s, answers, Date.now()), rec, Date.now()), 'local')
  },
  /** Erases all progress, and (signed in) everywhere else the account reaches: a change that syncs like any other. */
  reset() {
    removeKey(MOCK_KEY)
    commit((s) => crdt.reset(s, Date.now()), 'reset')
  },
  /** Forgets this browser's copy, e.g. on sign-out, so the next person on a shared computer starts clean. The account copy is kept. */
  clearLocal() {
    removeKey(KEY)
    removeKey(MOCK_KEY)
    seen = null
    set(crdt.empty(), null)
    notify('clear')
  },

  // ---- for account sync ----

  /** This browser's copy in full (with whatever other tabs have stored since). */
  getSync(): SyncState {
    refreshAndNotify()
    return state
  },
  /** Whose progress this browser holds: a uid while someone is signed in, null for a visitor's own. */
  owner(): string | null {
    refreshAndNotify()
    return owner
  },
  /** Makes this browser's progress `uid`'s: a visitor's own progress becomes theirs, someone else's is cleared first. */
  claim(uid: string) {
    refreshAndNotify()
    if (owner === uid) return
    if (owner !== null) progress.clearLocal()
    // A visitor's Reset erased only this browser's copy, not the account's: drop it. (What it hid is already gone from
    // the state, so nothing comes back here; after clearLocal() resetAt is 0 anyway.)
    set({ ...state, resetAt: 0 }, uid)
    persist()
  },
  /** Joins the account copy of `uid` in (unless this browser's progress is someone else's now). */
  mergeRemote(remote: SyncState, uid: string) {
    const caught = refresh()
    const next = owner === uid ? crdt.join(state, remote) : state
    if (next !== state && !crdt.same(next, state)) {
      set(next, owner)
      persist()
      notify('remote')
    } else if (caught) notify(caught)
  },
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(progress.subscribe, progress.get, progress.get)
}

export const lessonKey = (moduleSlug: string, lessonSlug: string) => `${moduleSlug}/${lessonSlug}`
