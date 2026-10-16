import { useSyncExternalStore } from 'react'
import { PREFIX, readJSON, readRaw, writeJSON, removeKey } from './storage'

/** Per-viewer study progress, stored in localStorage (and, when accounts are on and the viewer signs in, synced to their account). */
export interface ProgressState {
  /** lessonKey ("module/lesson") -> ISO date completed */
  lessons: Record<string, string>
  /** lessonKey -> best checkpoint score as fraction 0..1 */
  checkpoints: Record<string, number>
  /** question id -> history of correctness (most recent last, max 5) */
  answers: Record<string, boolean[]>
  /** completed mock exams */
  exams: ExamRecord[]
}

export interface ExamRecord {
  id: string
  date: string
  mode: string
  total: number
  correct: number
  seconds: number
  byDomain: Record<string, { total: number; correct: number }>
}

/**
 * Where a change came from: 'local' (this viewer did something), 'remote' (their account's copy was applied),
 * 'reset' (they pressed Reset) or 'clear' (local copy wiped on sign-out; the account copy is untouched).
 */
export type ProgressOrigin = 'local' | 'remote' | 'reset' | 'clear'

const KEY = 'progress-v1'
/** MockExam's own key for a finished or half-done attempt: it is mock-exam history too */
const MOCK_KEY = 'mock-current'
/**
 * Account sync's note of the account copy this browser's progress builds on (see lib/accounts/sync.ts). It only means
 * something next to this browser's copy, so it is forgotten along with it.
 */
export const SYNCED_KEY = 'progress-synced'
const MAX_ANSWERS = 5
const MAX_EXAMS = 50
/** How many of the saves it builds on a stored copy lists (see commit). */
const MAX_SAVES = 20

const emptyState = (): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [] })

let state: ProgressState = load()
/** progress-v1 as this tab last wrote or read it: other text there now means another tab has saved since */
let seen: string | null = readRaw(KEY)
/** the saves (ids, newest first) that copy builds on */
let seenSaves: string[] = savesOf(seen)
/** recent copies this tab wrote or read, by save id: what another tab's copy may have been built on (see commit) */
const recent = new Map<string, ProgressState>()
remember(seenSaves[0], state)
const listeners = new Set<() => void>()
const changeListeners = new Set<(s: ProgressState, origin: ProgressOrigin) => void>()

function load(): ProgressState {
  return normalizeProgress(readJSON<unknown>(KEY, null))
}

function notify(origin: ProgressOrigin) {
  listeners.forEach((l) => l())
  changeListeners.forEach((cb) => cb(state, origin))
}

/**
 * The saves a stored copy builds on (ids, newest first). Every save here adds an id to the list of the copy it builds
 * on, so a tab can tell which of the copies it knows another tab's copy was built on (see commit).
 */
function savesOf(raw: string | null): string[] {
  const x = raw === null ? null : parseJSON(raw)
  return isRecord(x) && Array.isArray(x.saves) ? x.saves.filter((id): id is string => typeof id === 'string').slice(0, MAX_SAVES) : []
}

function remember(id: string | undefined, copy: ProgressState) {
  if (id === undefined) return
  recent.delete(id)
  recent.set(id, copy)
  if (recent.size > MAX_SAVES) recent.delete(recent.keys().next().value!)
}

function commit(next: ProgressState, origin: ProgressOrigin = 'local') {
  const raw = readRaw(KEY)
  let saves = seenSaves
  if (!followTabs && raw !== null && raw !== seen) {
    // Signed in (tabs don't follow each other: see followOtherTabs), and another tab has saved here since this one last
    // did. Its changes may never reach the account (say it was offline, or closed before saving), so keep them: redo
    // this change on top of its copy instead of overwriting it (account sync then saves them with this tab's own).
    const theirs = savesOf(raw)
    if (origin !== 'reset') {
      // Redo this tab's changes since the copy that one was built on: not always this tab's last save, as tabs can
      // each miss the other's latest one (browsers keep a copy of storage per process). If this tab doesn't know that
      // copy, what the other lacks may just be unknown to it, not removed: keep all of this tab's own too.
      const stored = normalizeProgress(parseJSON(raw))
      const common = theirs.find((id) => recent.has(id))
      next = common !== undefined ? rebaseProgress(next, stored, recent.get(common)!) : mergeProgress(rebaseProgress(next, stored, state), next)
    }
    saves = [...theirs, ...seenSaves.filter((id) => !theirs.includes(id))]
  }
  const id = Math.random().toString(36).slice(2, 10)
  state = next
  writeJSON(KEY, { ...state, saves: [id, ...saves].slice(0, MAX_SAVES) })
  seen = readRaw(KEY)
  seenSaves = savesOf(seen)
  if (seenSaves[0] === id) remember(id, state) // (unless storage refused it)
  notify(origin)
}

/** Whether to take progress another tab of this browser saved (account sync turns this off while it runs: see followOtherTabs). */
let followTabs = true

/**
 * Takes the copy another tab saved, reset or cleared, if one has since this tab last wrote or read it, so this tab's
 * next save doesn't overwrite it with a stale one. Origin 'remote', so account sync doesn't save it again.
 */
function takeStored() {
  const raw = readRaw(KEY)
  if (raw === seen) return
  seen = raw
  seenSaves = savesOf(raw)
  const next = load()
  remember(seenSaves[0], next)
  if (JSON.stringify(next) === JSON.stringify(state)) return
  state = next
  notify('remote')
}

// Another tab saved: take its copy. Re-read storage rather than trust e.newValue (events can arrive late and out of
// date), and don't write it back (that tab already did).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!followTabs || (e.key !== null && e.key !== PREFIX + KEY)) return // key null: localStorage.clear()
    takeStored()
  })
}

export const progress = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  /** Like subscribe, but also says where the change came from (used by account sync). */
  onChange(cb: (s: ProgressState, origin: ProgressOrigin) => void) {
    changeListeners.add(cb)
    return () => {
      changeListeners.delete(cb)
    }
  },
  markLesson(key: string, done = true) {
    const lessons = { ...state.lessons }
    if (done) lessons[key] = lessons[key] ?? new Date().toISOString()
    else delete lessons[key]
    commit({ ...state, lessons })
  },
  recordCheckpoint(key: string, score: number) {
    const prev = state.checkpoints[key] ?? 0
    commit({ ...state, checkpoints: { ...state.checkpoints, [key]: Math.max(prev, score) } })
  },
  recordAnswer(questionId: string, correct: boolean) {
    const hist = [...(state.answers[questionId] ?? []), correct].slice(-MAX_ANSWERS)
    commit({ ...state, answers: { ...state.answers, [questionId]: hist } })
  },
  recordExam(rec: ExamRecord) {
    if (state.exams.some((e) => e.id === rec.id)) return // the same attempt is only recorded once
    commit({ ...state, exams: [...state.exams, rec].slice(-MAX_EXAMS) })
  },
  reset() {
    removeKey(MOCK_KEY)
    commit(emptyState(), 'reset') // (over the stored copy, so another tab can tell it was built on its own)
  },
  /** Applies the account's copy (already merged or normalised by the caller). */
  replace(next: ProgressState, origin: 'remote') {
    commit(next, origin)
  },
  /** Forgets this browser's copy, e.g. on sign-out, so the next person on a shared computer starts clean. The account copy is kept. */
  clearLocal() {
    removeKey(KEY)
    removeKey(MOCK_KEY)
    removeKey(SYNCED_KEY)
    state = emptyState()
    seen = null
    seenSaves = []
    notify('clear')
  },
  /**
   * Whether to take progress saved by another tab of this browser (on by default). Account sync turns it off while
   * someone is signed in: each tab then keeps in step through the account instead, and a change made here is redone
   * on whatever another tab saved meanwhile (see commit). Turning it off first takes in what another tab saved and
   * this one hasn't heard about yet, so this tab's copy matches what is stored when syncing starts.
   */
  followOtherTabs(on: boolean) {
    if (!on && followTabs) takeStored()
    followTabs = on
  },
  /**
   * While signed in: takes in what other tabs of this browser saved here since this tab last did (changes that may not
   * have reached the account, say made offline in a tab since closed), as a change made here, so account sync saves
   * them with this tab's own. Used before each save to the account, and before signing out (which clears this copy).
   */
  takeOtherTabs() {
    const raw = readRaw(KEY)
    if (followTabs || raw === null || raw === seen) return
    if (!sameProgress(normalizeProgress(parseJSON(raw)), state)) commit(state) // (commit merges them in)
  },
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(progress.subscribe, progress.get, progress.get)
}

export const lessonKey = (moduleSlug: string, lessonSlug: string) => `${moduleSlug}/${lessonSlug}`

// ---- merging and validating copies of progress (local, account, another device) ----

// (function declarations, not arrow constants: load() uses them while this module is still initialising)
function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}
function isDate(x: unknown): x is string {
  return typeof x === 'string' && !Number.isNaN(Date.parse(x))
}
function isCount(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x) && x >= 0
}
/** own keys, minus the one that would change an object's prototype when assigned */
function keysOf(o: Record<string, unknown>) {
  return Object.keys(o).filter((k) => k !== '__proto__')
}
/** o[k] only when k is o's own key (so a key like "constructor" never reads the prototype) */
function own<T>(o: Record<string, T>, k: string): T | undefined {
  return Object.hasOwn(o, k) ? o[k] : undefined
}
const time = (iso: string) => Date.parse(iso)

/** A copy's content as text, the same whatever order its keys are in. */
export function canonical(s: ProgressState): string {
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

/** Exams in date order (ties keep their order), at most the last 50. */
function sortExams(exams: ExamRecord[]): ExamRecord[] {
  return [...exams].sort((x, y) => time(x.date) - time(y.date)).slice(-MAX_EXAMS)
}

/**
 * Combines two copies of progress without losing anything either has: every completed lesson (keeping the earlier
 * date), the best checkpoint score, the longer answer history for each question, and every mock exam.
 * Pure: neither input is changed.
 */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const lessons: Record<string, string> = { ...a.lessons }
  for (const [k, d] of Object.entries(b.lessons)) {
    const prev = own(lessons, k)
    if (prev === undefined || time(d) < time(prev)) lessons[k] = d
  }
  const checkpoints: Record<string, number> = { ...a.checkpoints }
  for (const [k, v] of Object.entries(b.checkpoints)) checkpoints[k] = Math.max(own(checkpoints, k) ?? 0, v)
  const answers: Record<string, boolean[]> = {}
  for (const k of new Set([...Object.keys(a.answers), ...Object.keys(b.answers)])) {
    const x = own(a.answers, k) ?? []
    const y = own(b.answers, k) ?? []
    answers[k] = (y.length > x.length ? y : x).slice(-MAX_ANSWERS)
  }
  const byId = new Map<string, ExamRecord>()
  for (const e of [...a.exams, ...b.exams]) if (!byId.has(e.id)) byId.set(e.id, e)
  return { lessons, checkpoints, answers, exams: sortExams([...byId.values()]) }
}

/**
 * Brings `local`'s own changes since `base` onto `remote`: `base` is a copy both grew from (the account copy this
 * browser last took in), `remote` the account copy now. Entries added or changed here are taken as they are, or
 * merged in as mergeProgress does if the account copy has changed them too; entries removed here since `base` (an
 * un-ticked lesson, a Reset) are removed, unless the account copy has changed them since `base` (ticked again on
 * another device, say). Whatever else the account copy holds stays as it is there, including removals made on another
 * device. Pure: no input is changed.
 */
export function rebaseProgress(local: ProgressState, remote: ProgressState, base: ProgressState): ProgressState {
  const same = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y)
  const ours = emptyState()
  for (const k of keysOf(local.lessons)) if (own(base.lessons, k) !== local.lessons[k]) ours.lessons[k] = local.lessons[k]
  for (const k of keysOf(local.checkpoints)) if (own(base.checkpoints, k) !== local.checkpoints[k]) ours.checkpoints[k] = local.checkpoints[k]
  for (const k of keysOf(local.answers)) if (!same(own(base.answers, k), local.answers[k])) ours.answers[k] = local.answers[k]
  const baseExams = new Set(base.exams.map((e) => e.id))
  ours.exams = local.exams.filter((e) => !baseExams.has(e.id))
  const out = mergeProgress(remote, ours)
  // A value changed only here (the account copy still has the one this browser built on) is taken as it is. Combining
  // would keep the earlier date, the better score or the longer history: undoing a lesson ticked again, a Reset followed
  // by a lower score, or an attempt at a question already answered five times.
  for (const k of keysOf(ours.lessons)) if (own(remote.lessons, k) === own(base.lessons, k)) out.lessons[k] = ours.lessons[k]
  for (const k of keysOf(ours.checkpoints)) if (own(remote.checkpoints, k) === own(base.checkpoints, k)) out.checkpoints[k] = ours.checkpoints[k]
  for (const k of keysOf(ours.answers)) if (same(own(remote.answers, k), own(base.answers, k))) out.answers[k] = ours.answers[k]
  // removed here: removed there too, if the account copy still has what this browser removed (if `base` is out of date,
  // a value changed since was most likely set on another device after this browser's copy)
  for (const k of keysOf(base.lessons)) if (!Object.hasOwn(local.lessons, k) && own(remote.lessons, k) === base.lessons[k]) delete out.lessons[k]
  for (const k of keysOf(base.checkpoints))
    if (!Object.hasOwn(local.checkpoints, k) && own(remote.checkpoints, k) === base.checkpoints[k]) delete out.checkpoints[k]
  for (const k of keysOf(base.answers)) if (!Object.hasOwn(local.answers, k) && same(own(remote.answers, k), base.answers[k])) delete out.answers[k]
  const localExams = new Set(local.exams.map((e) => e.id))
  out.exams = out.exams.filter((e) => localExams.has(e.id) || !baseExams.has(e.id))
  return out
}

/** Reads progress from untrusted JSON (an old browser copy, the account copy), dropping anything malformed. */
export function normalizeProgress(x: unknown): ProgressState {
  const out = emptyState()
  if (!isRecord(x)) return out
  if (isRecord(x.lessons)) {
    for (const k of keysOf(x.lessons)) if (isDate(x.lessons[k])) out.lessons[k] = x.lessons[k] as string
  }
  if (isRecord(x.checkpoints)) {
    for (const k of keysOf(x.checkpoints)) {
      const v = x.checkpoints[k]
      if (typeof v === 'number' && v >= 0 && v <= 1) out.checkpoints[k] = v
    }
  }
  if (isRecord(x.answers)) {
    for (const k of keysOf(x.answers)) {
      const v = x.answers[k]
      if (Array.isArray(v) && v.length > 0 && v.every((b) => typeof b === 'boolean')) out.answers[k] = v.slice(-MAX_ANSWERS)
    }
  }
  if (Array.isArray(x.exams)) {
    const seen = new Set<string>()
    for (const e of x.exams) {
      const rec = normalizeExam(e)
      if (rec && !seen.has(rec.id)) {
        seen.add(rec.id)
        out.exams.push(rec)
      }
    }
    out.exams = out.exams.slice(-MAX_EXAMS)
  }
  return out
}

function normalizeExam(e: unknown): ExamRecord | null {
  if (!isRecord(e)) return null
  const { id, date, mode, total, correct, seconds, byDomain } = e
  if (typeof id !== 'string' || !id || !isDate(date) || typeof mode !== 'string') return null
  if (!isCount(total) || !isCount(correct) || !isCount(seconds) || !isRecord(byDomain)) return null
  const domains: ExamRecord['byDomain'] = {}
  for (const k of keysOf(byDomain)) {
    const d = byDomain[k]
    if (isRecord(d) && isCount(d.total) && isCount(d.correct)) domains[k] = { total: d.total, correct: d.correct }
  }
  return { id, date, mode, total, correct, seconds, byDomain: domains }
}
