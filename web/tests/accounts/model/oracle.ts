/*
  An independent oracle for progress: what the student should see after a set of operations, replayed in time order
  (no join, no lattice), and the one-operation state each operation adds (to check whether a state includes it).
  Used by crdt.test.ts and the multi-device simulation (run.ts).
*/
import { empty, type ExamRecord, type ProgressState, type SyncState } from '../../../src/lib/progress-crdt'

export type Op =
  | { kind: 'tick' | 'untick'; key: string; d: string | null; t: number }
  | { kind: 'cp'; key: string; score: number; t: number }
  | { kind: 'ans'; key: string; correct: boolean; t: number }
  | { kind: 'exam'; rec: ExamRecord; t: number }
  | { kind: 'reset'; t: number }

/**
 * What the student should see after these operations, replayed in time order: the last action on each lesson after
 * the latest Reset, the best checkpoint score recorded after it, the newest five attempts at each question after it
 * and the newest 50 exams after it. Ties at the same time: an un-tick beats a tick, then the later date wins; a wrong
 * attempt sorts before a right one; an exam recorded twice keeps the larger record.
 */
export function oracle(ops: Op[]): ProgressState {
  const sorted = [...ops].sort((a, b) => a.t - b.t)
  const R = Math.max(0, ...sorted.filter((o) => o.kind === 'reset').map((o) => o.t))
  const live = sorted.filter((o) => o.t > R)
  const out: ProgressState = { lessons: {}, checkpoints: {}, answers: {}, exams: [] }
  const last = new Map<string, Op & { kind: 'tick' | 'untick' }>()
  for (const o of live) {
    if (o.kind !== 'tick' && o.kind !== 'untick') continue
    const prev = last.get(o.key)
    if (!prev || o.t > prev.t || (o.t === prev.t && (o.d === null || (prev.d !== null && o.d > prev.d)))) last.set(o.key, o)
  }
  for (const [k, o] of last) if (o.d !== null) out.lessons[k] = o.d
  for (const o of live) if (o.kind === 'cp') out.checkpoints[o.key] = Math.max(out.checkpoints[o.key] ?? -1, o.score)
  const attempts = new Map<string, Map<string, [boolean, number]>>()
  for (const o of live) {
    if (o.kind !== 'ans') continue
    if (!attempts.has(o.key)) attempts.set(o.key, new Map())
    attempts.get(o.key)!.set(`${o.correct}:${o.t}`, [o.correct, o.t])
  }
  for (const [k, xs] of attempts) {
    out.answers[k] = [...xs.values()]
      .sort((a, b) => a[1] - b[1] || Number(a[0]) - Number(b[0]))
      .slice(-5)
      .map((x) => x[0])
  }
  const exams = new Map<string, { rec: ExamRecord; t: number }>()
  for (const o of sorted) {
    if (o.kind !== 'exam') continue
    const prev = exams.get(o.rec.id)
    if (!prev || o.t > prev.t || (o.t === prev.t && JSON.stringify(o.rec) > JSON.stringify(prev.rec))) exams.set(o.rec.id, o)
  }
  out.exams = [...exams.values()]
    .filter((e) => e.t > R)
    .sort((a, b) => a.t - b.t || (a.rec.id < b.rec.id ? -1 : 1))
    .slice(-50)
    .map((e) => e.rec)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date) || (a.id < b.id ? -1 : 1))
  return out
}

/** The state holding just this operation: a state includes the operation when joining this in changes nothing. */
export function single(o: Op): SyncState {
  const s = empty()
  if (o.kind === 'tick' || o.kind === 'untick') s.lessons[o.key] = { d: o.d, t: o.t }
  else if (o.kind === 'cp') s.checkpoints[o.key] = [[o.score, o.t]]
  else if (o.kind === 'ans') s.answers[o.key] = [[o.correct, o.t]]
  else if (o.kind === 'exam') s.exams[o.rec.id] = { r: o.rec, t: o.t }
  else s.resetAt = o.t
  return s
}

/** The operation a change made here was, read from the state before and after it (null: it changed nothing). */
export function opOf(kind: 'tick' | 'untick' | 'cp' | 'ans' | 'exam' | 'reset', key: string, before: SyncState, after: SyncState): Op | null {
  if (kind === 'reset') return after.resetAt > before.resetAt ? { kind, t: after.resetAt } : null
  if (kind === 'tick' || kind === 'untick') {
    const e = after.lessons[key]
    return e && e !== before.lessons[key] && e.t !== before.lessons[key]?.t ? { kind, key, d: e.d, t: e.t } : null
  }
  if (kind === 'cp') {
    const r = after.checkpoints[key]?.at(-1)
    return r && r[1] !== before.checkpoints[key]?.at(-1)?.[1] ? { kind, key, score: r[0], t: r[1] } : null
  }
  if (kind === 'ans') {
    const r = after.answers[key]?.at(-1)
    return r && r[1] !== before.answers[key]?.at(-1)?.[1] ? { kind, key, correct: r[0], t: r[1] } : null
  }
  const e = after.exams[key]
  return e && !before.exams[key] ? { kind, rec: e.r, t: e.t } : null
}
