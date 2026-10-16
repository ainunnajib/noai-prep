import { useSyncExternalStore } from 'react'
import { PREFIX, readJSON, writeJSON, removeKey } from './storage'

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

const emptyState = (): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [] })

let state: ProgressState = load()
const listeners = new Set<() => void>()
const changeListeners = new Set<(s: ProgressState, origin: ProgressOrigin) => void>()

function load(): ProgressState {
  return normalizeProgress(readJSON<unknown>(KEY, null))
}

function notify(origin: ProgressOrigin) {
  listeners.forEach((l) => l())
  changeListeners.forEach((cb) => cb(state, origin))
}

function commit(next: ProgressState, origin: ProgressOrigin = 'local') {
  state = next
  writeJSON(KEY, state)
  notify(origin)
}

/** Whether to take progress another tab of this browser saved (account sync turns this off while it runs: see followOtherTabs). */
let followTabs = true

// Another tab saved, reset or cleared progress: take that copy, so this tab's next save doesn't overwrite it with a
// stale one. Re-read storage rather than trust e.newValue (events can arrive late and out of date), and don't write it
// back (that tab already did). Origin 'remote', so account sync doesn't save it again either.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!followTabs || (e.key !== null && e.key !== PREFIX + KEY)) return // key null: localStorage.clear()
    const next = load()
    if (JSON.stringify(next) === JSON.stringify(state)) return
    state = next
    notify('remote')
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
    removeKey(KEY)
    removeKey(MOCK_KEY)
    commit(emptyState(), 'reset')
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
    notify('clear')
  },
  /**
   * Whether to take progress saved by another tab of this browser (on by default). Account sync turns it off while
   * someone is signed in: each tab then keeps in step through the account instead, which also keeps its own unsaved
   * changes safe from a copy another tab wrote meanwhile.
   */
  followOtherTabs(on: boolean) {
    followTabs = on
  },
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(progress.subscribe, progress.get, progress.get)
}

export const lessonKey = (moduleSlug: string, lessonSlug: string) => `${moduleSlug}/${lessonSlug}`

// ---- merging and validating copies of progress (local, account, another device) ----

// (function declarations, not arrow constants: load() uses them while this module is still initialising)
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
 * browser last took in), `remote` the account copy now. Entries added or changed here are merged in as mergeProgress
 * does; entries removed here since `base` (an un-ticked lesson, a Reset) are removed. Whatever else the account copy
 * holds stays as it is there, including removals made on another device. Pure: no input is changed.
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
  for (const k of keysOf(base.lessons)) if (!Object.hasOwn(local.lessons, k)) delete out.lessons[k]
  for (const k of keysOf(base.checkpoints)) if (!Object.hasOwn(local.checkpoints, k)) delete out.checkpoints[k]
  for (const k of keysOf(base.answers)) if (!Object.hasOwn(local.answers, k)) delete out.answers[k]
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
