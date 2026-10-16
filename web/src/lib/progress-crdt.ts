/*
  Study progress as a state-based CRDT: every copy (each tab's memory, localStorage, the account copy) holds a state
  that only ever grows, and two copies combine with join(), which is commutative, associative and idempotent. So
  copies can be combined in any order, any number of times, and still agree; nothing needs to know what any other
  copy last saw. Removals are timestamped entries, not absences:
  - lessons: the latest tick or un-tick of each lesson (d = date completed, or null for un-ticked);
  - checkpoints: the scores recorded, keeping only those no later, higher score makes irrelevant;
  - answers: the newest five attempts at each question;
  - exams: the mock exams taken, by id (the newest 50);
  - resetAt: the time of the latest Reset, which hides everything up to then.
  Times are integer milliseconds from a hybrid logical clock (tick): never behind anything the copy has seen, so a
  change made after seeing another always counts as later; changes made apart are ordered by the device clocks.
  The app itself sees project(state), the plain ProgressState it always had. Pure functions, no storage.
*/

/** Per-viewer study progress, as the pages see it. */
export interface ProgressState {
  /** lessonKey ("module/lesson") -> ISO date completed */
  lessons: Record<string, string>
  /** lessonKey -> best checkpoint score as fraction 0..1 */
  checkpoints: Record<string, number>
  /** question id -> history of correctness (most recent last, max 5) */
  answers: Record<string, boolean[]>
  /** completed mock exams, oldest first */
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

/** A lesson's latest tick (d: the date completed) or un-tick (d: null), made at time t. */
export interface LessonEntry {
  d: string | null
  t: number
}
export type ScoreRecord = [score: number, t: number]
export type Attempt = [correct: boolean, t: number]
export interface ExamEntry {
  r: ExamRecord
  t: number
}

export interface SyncState {
  v: 3
  /** time of the latest Reset (0: never); everything at or before it is gone */
  resetAt: number
  lessons: Record<string, LessonEntry>
  /** oldest first; each later record has a lower score (an earlier, lower one is irrelevant) */
  checkpoints: Record<string, ScoreRecord[]>
  /** oldest first, at most MAX_ANSWERS */
  answers: Record<string, Attempt[]>
  /** keyed by exam id; at most MAX_EXAMS */
  exams: Record<string, ExamEntry>
}

export const MAX_ANSWERS = 5
export const MAX_EXAMS = 50

export const empty = (): SyncState => ({ v: 3, resetAt: 0, lessons: {}, checkpoints: {}, answers: {}, exams: {} })

// ---- small helpers ----

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const isDate = (x: unknown): x is string => typeof x === 'string' && !Number.isNaN(Date.parse(x))
const isCount = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x) && x >= 0
const isTime = (x: unknown): x is number => Number.isSafeInteger(x) && (x as number) > 0
const isScore = (x: unknown): x is number => typeof x === 'number' && x >= 0 && x <= 1
/** own keys, minus the one that would change an object's prototype when assigned */
const keysOf = (o: object) => Object.keys(o).filter((k) => k !== '__proto__')
/** o[k] only when k is o's own key (so a key like "constructor" never reads the prototype) */
const own = <T,>(o: Record<string, T>, k: string): T | undefined => (Object.hasOwn(o, k) ? o[k] : undefined)
const byString = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

/** f over the keys of a and b together; keys where f gives undefined are left out */
function both<T, U>(a: Record<string, T>, b: Record<string, T>, f: (x: T | undefined, y: T | undefined) => U | undefined): Record<string, U> {
  const out: Record<string, U> = {}
  for (const k of keysOf(a)) {
    const v = f(a[k], own(b, k))
    if (v !== undefined) out[k] = v
  }
  for (const k of keysOf(b)) {
    if (Object.hasOwn(a, k)) continue
    const v = f(undefined, b[k])
    if (v !== undefined) out[k] = v
  }
  return out
}

// ---- join ----

/** The later of two entries for one lesson: larger t; on a tie an un-tick, else the larger date. */
function laterLesson(x: LessonEntry | undefined, y: LessonEntry | undefined): LessonEntry | undefined {
  if (!x || !y) return x ?? y
  if (x.t !== y.t) return x.t > y.t ? x : y
  if (x.d === null || y.d === null) return x.d === null ? x : y
  return x.d >= y.d ? x : y
}

/**
 * The records after R that no other record makes irrelevant (another with a score at least as high, recorded no
 * earlier), oldest first; identical records once. The best score after any later reset is always among them.
 */
function frontier(rs: ScoreRecord[], R: number): ScoreRecord[] | undefined {
  const newestFirst = rs.filter((r) => r[1] > R).sort((p, q) => q[1] - p[1] || q[0] - p[0])
  const out: ScoreRecord[] = []
  let best = -Infinity
  for (const [score, t] of newestFirst) {
    if (score <= best) continue
    best = score
    out.push([score, t])
  }
  return out.length ? out.reverse() : undefined
}

/** The newest MAX_ANSWERS attempts after R, oldest first (by time, then wrong before right); identical ones once. */
function newestAttempts(rs: Attempt[], R: number): Attempt[] | undefined {
  const seen = new Set<string>()
  const out: Attempt[] = []
  for (const [c, t] of rs) {
    const id = `${c}:${t}`
    if (t <= R || seen.has(id)) continue
    seen.add(id)
    out.push([c, t])
  }
  out.sort((p, q) => p[1] - q[1] || Number(p[0]) - Number(q[0]))
  return out.length ? out.slice(-MAX_ANSWERS) : undefined
}

/** The later of two records of one exam: larger t; on a tie the larger record (as canonical JSON). */
function laterExam(x: ExamEntry | undefined, y: ExamEntry | undefined): ExamEntry | undefined {
  if (!x || !y) return x ?? y
  if (x.t !== y.t) return x.t > y.t ? x : y
  return JSON.stringify(canonicalExam(x.r)) >= JSON.stringify(canonicalExam(y.r)) ? x : y
}

function joinExams(a: Record<string, ExamEntry>, b: Record<string, ExamEntry>, R: number): Record<string, ExamEntry> {
  const live = Object.entries(both(a, b, laterExam))
    .filter(([, e]) => e.t > R)
    .sort(([i, x], [j, y]) => x.t - y.t || byString(i, j))
    .slice(-MAX_EXAMS)
  const out: Record<string, ExamEntry> = {}
  for (const [id, e] of live) out[id] = e
  return out
}

/** Two copies combined: everything either has, with later changes winning and Resets hiding what came before. */
export function join(a: SyncState, b: SyncState): SyncState {
  const R = Math.max(a.resetAt, b.resetAt)
  return {
    v: 3,
    resetAt: R,
    lessons: both(a.lessons, b.lessons, (x, y) => {
      const e = laterLesson(x, y)
      return e && e.t > R ? e : undefined
    }),
    checkpoints: both(a.checkpoints, b.checkpoints, (x = [], y = []) => frontier([...x, ...y], R)),
    answers: both(a.answers, b.answers, (x = [], y = []) => newestAttempts([...x, ...y], R)),
    exams: joinExams(a.exams, b.exams, R),
  }
}

// ---- what the pages see ----

/** The plain progress the pages show. */
export function project(s: SyncState): ProgressState {
  const R = s.resetAt
  const out: ProgressState = { lessons: {}, checkpoints: {}, answers: {}, exams: [] }
  for (const k of keysOf(s.lessons)) {
    const e = s.lessons[k]
    if (e.d !== null && e.t > R) out.lessons[k] = e.d
  }
  for (const k of keysOf(s.checkpoints)) {
    const live = s.checkpoints[k].filter((r) => r[1] > R)
    if (live.length) out.checkpoints[k] = Math.max(...live.map((r) => r[0]))
  }
  for (const k of keysOf(s.answers)) {
    const live = s.answers[k].filter((r) => r[1] > R).sort((p, q) => p[1] - q[1] || Number(p[0]) - Number(q[0]))
    if (live.length) out.answers[k] = live.slice(-MAX_ANSWERS).map((r) => r[0])
  }
  out.exams = Object.values(s.exams)
    .filter((e) => e.t > R)
    .map((e) => e.r)
    .sort((x, y) => Date.parse(x.date) - Date.parse(y.date) || byString(x.id, y.id))
    .slice(-MAX_EXAMS)
  return out
}

// ---- canonical form ----

function canonicalExam(r: ExamRecord): ExamRecord {
  const byDomain: ExamRecord['byDomain'] = {}
  for (const k of keysOf(r.byDomain).sort()) byDomain[k] = { total: r.byDomain[k].total, correct: r.byDomain[k].correct }
  return { id: r.id, date: r.date, mode: r.mode, total: r.total, correct: r.correct, seconds: r.seconds, byDomain }
}

function sortedMap<T, U>(o: Record<string, T>, f: (v: T) => U): Record<string, U> {
  const out: Record<string, U> = {}
  for (const k of keysOf(o).sort()) out[k] = f(o[k])
  return out
}

/** The state as plain JSON data with every key in sorted order (what is stored, and what equality compares). */
export function toJSON(s: SyncState): SyncState {
  return {
    v: 3,
    resetAt: s.resetAt,
    lessons: sortedMap(s.lessons, (e) => ({ d: e.d, t: e.t })),
    checkpoints: sortedMap(s.checkpoints, (rs) => rs.map(([x, t]): ScoreRecord => [x, t])),
    answers: sortedMap(s.answers, (rs) => rs.map(([c, t]): Attempt => [c, t])),
    exams: sortedMap(s.exams, (e) => ({ r: canonicalExam(e.r), t: e.t })),
  }
}

/** Canonical JSON text: the same for equal states, whatever order they were built in. */
export const encode = (s: SyncState): string => JSON.stringify(toJSON(s))

export const same = (a: SyncState, b: SyncState): boolean => a === b || encode(a) === encode(b)

// ---- clock ----

/** The latest time anywhere in the state (0 for an empty one). */
export function maxT(s: SyncState): number {
  let m = s.resetAt
  for (const k of keysOf(s.lessons)) m = Math.max(m, s.lessons[k].t)
  for (const k of keysOf(s.checkpoints)) for (const r of s.checkpoints[k]) m = Math.max(m, r[1])
  for (const k of keysOf(s.answers)) for (const r of s.answers[k]) m = Math.max(m, r[1])
  for (const k of keysOf(s.exams)) m = Math.max(m, s.exams[k].t)
  return m
}

/** The time for a change made now: the clock, but always after everything the state has seen. */
export const tick = (s: SyncState, now: number): number => Math.max(Math.floor(now), maxT(s) + 1)

// ---- changes made here (each returns the state itself when nothing changes) ----

export function markLesson(s: SyncState, key: string, done: boolean, now: number): SyncState {
  const cur = own(s.lessons, key)
  const live = cur !== undefined && cur.d !== null && cur.t > s.resetAt
  if (done === live || key === '__proto__') return s
  const t = tick(s, now)
  return { ...s, lessons: { ...s.lessons, [key]: { d: done ? new Date(now).toISOString() : null, t } } }
}

/** Records a checkpoint score, if it beats the best so far. */
export function recordCheckpoint(s: SyncState, key: string, score: number, now: number): SyncState {
  if (!isScore(score) || key === '__proto__') return s
  const prev = own(s.checkpoints, key) ?? []
  if (prev.some((r) => r[1] > s.resetAt && r[0] >= score)) return s
  const records = frontier([...prev, [score, tick(s, now)]], s.resetAt)!
  return { ...s, checkpoints: { ...s.checkpoints, [key]: records } }
}

export function recordAnswer(s: SyncState, id: string, correct: boolean, now: number): SyncState {
  if (typeof correct !== 'boolean' || id === '__proto__') return s
  const attempts = newestAttempts([...(own(s.answers, id) ?? []), [correct, tick(s, now)]], s.resetAt)!
  return { ...s, answers: { ...s.answers, [id]: attempts } }
}

/**
 * Records several answers as one change (a submitted mock exam): one clock reading, each attempt a moment after the
 * last, exactly as recordAnswer would one after another.
 */
export function recordAnswers(s: SyncState, given: [id: string, correct: boolean][], now: number): SyncState {
  const answers = { ...s.answers }
  const first = tick(s, now)
  let t = first
  for (const [id, correct] of given) {
    if (typeof correct !== 'boolean' || id === '__proto__') continue
    answers[id] = newestAttempts([...(own(answers, id) ?? []), [correct, t++]], s.resetAt)!
  }
  return t === first ? s : { ...s, answers }
}

/** Records a finished mock exam (the same attempt only once). */
export function recordExam(s: SyncState, rec: ExamRecord, now: number): SyncState {
  const r = normalizeExam(rec)
  if (!r || r.id === '__proto__' || own(s.exams, r.id)) return s
  return { ...s, exams: joinExams(s.exams, { [r.id]: { r, t: tick(s, now) } }, s.resetAt) }
}

/** Reset: hides everything so far, everywhere this state reaches. */
export function reset(s: SyncState, now: number): SyncState {
  return { ...empty(), resetAt: tick(s, now) }
}

// ---- reading untrusted data ----

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
  return canonicalExam({ id, date, mode, total, correct, seconds, byDomain: domains })
}

/** A state from untrusted JSON in this format (the account copy, a stored copy), dropping anything malformed. */
export function normalize(x: unknown): SyncState {
  const raw = empty()
  if (!isRecord(x)) return raw
  if (Number.isSafeInteger(x.resetAt) && (x.resetAt as number) > 0) raw.resetAt = x.resetAt as number
  const entries = (o: unknown) => (isRecord(o) ? keysOf(o).map((k) => [k, o[k]] as const) : [])
  for (const [k, e] of entries(x.lessons)) {
    if (isRecord(e) && isTime(e.t) && (e.d === null || isDate(e.d))) raw.lessons[k] = { d: e.d as string | null, t: e.t }
  }
  for (const [k, v] of entries(x.checkpoints)) {
    if (!Array.isArray(v)) continue
    const rs = v.filter((r): r is ScoreRecord => Array.isArray(r) && r.length === 2 && isScore(r[0]) && isTime(r[1]))
    if (rs.length) raw.checkpoints[k] = rs
  }
  for (const [k, v] of entries(x.answers)) {
    if (!Array.isArray(v)) continue
    const rs = v.filter((r): r is Attempt => Array.isArray(r) && r.length === 2 && typeof r[0] === 'boolean' && isTime(r[1]))
    if (rs.length) raw.answers[k] = rs
  }
  for (const [k, e] of entries(x.exams)) {
    if (!isRecord(e) || !isTime(e.t)) continue
    const r = normalizeExam(e.r)
    if (r && r.id === k) raw.exams[k] = { r, t: e.t }
  }
  return join(raw, empty()) // (puts each part in its usual form: newest five answers, the latest 50 exams, ...)
}

/**
 * The state for progress in the old plain format (what the site stored before accounts), dropping anything
 * malformed: lessons dated when they were completed, the other records as old as can be (so anything recorded since
 * on another copy counts as later), answers in their order.
 */
export function migrate(x: unknown): SyncState {
  const raw = empty()
  if (!isRecord(x)) return raw
  const when = (d: string) => Math.max(1, Date.parse(d))
  if (isRecord(x.lessons)) {
    for (const k of keysOf(x.lessons)) {
      const d = x.lessons[k]
      if (isDate(d)) raw.lessons[k] = { d, t: when(d) }
    }
  }
  if (isRecord(x.checkpoints)) {
    for (const k of keysOf(x.checkpoints)) {
      const v = x.checkpoints[k]
      if (isScore(v)) raw.checkpoints[k] = [[v, 1]]
    }
  }
  if (isRecord(x.answers)) {
    for (const k of keysOf(x.answers)) {
      const v = x.answers[k]
      if (Array.isArray(v) && v.length > 0 && v.every((b) => typeof b === 'boolean')) raw.answers[k] = v.map((c: boolean, i): Attempt => [c, i + 1])
    }
  }
  if (Array.isArray(x.exams)) {
    for (const e of x.exams) {
      const r = normalizeExam(e)
      if (r && r.id !== '__proto__') raw.exams[r.id] = laterExam(own(raw.exams, r.id), { r, t: when(r.date) })!
    }
  }
  return join(raw, empty())
}

/** A stored copy in either format: this one (v: 3), or the old plain one, migrated. */
export const fromJSON = (x: unknown): SyncState => (isRecord(x) && x.v === 3 ? normalize(x) : migrate(x))
