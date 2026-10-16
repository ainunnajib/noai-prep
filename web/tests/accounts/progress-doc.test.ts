/*
  How the account copy of progress is stored (progress-doc.ts, format 3): split into parts, so the save sent while a
  page closes can carry just the parts that changed and stay under the browsers' 64 KB cap.
  Run: npx vitest run tests/accounts/progress-doc.test.ts
*/
import { describe, expect, it } from 'vitest'
import bank from '../../src/data/bank/bank.json'
import { PAPERS } from '../../src/data/papers'
import * as crdt from '../../src/lib/progress-crdt'
import type { ExamRecord, SyncState } from '../../src/lib/progress-crdt'
import { ANSWER_PARTS, answerPart, EXIT_SAVE_LIMIT, exitCommit, fromDoc, toDoc, toParts } from '../../src/lib/accounts/progress-doc'

const T0 = Date.parse('2026-03-01T00:00:00.000Z')
const doc = 'projects/p/databases/(default)/documents/progress/u1'
const bytes = (s: string) => new TextEncoder().encode(s).length
const getter = (f: Record<string, unknown>) => (k: string) => f[k]
const exam = (id: string): ExamRecord => ({ id, date: new Date(T0).toISOString(), mode: 'full', total: 40, correct: 30, seconds: 3600, byDomain: { ml: { total: 8, correct: 6 } } })

// The site's real lessons and questions: every lesson's checkpoint, the question bank and the past papers.
const quizzes = import.meta.glob<{ default: { id: string }[] }>(['../../src/curriculum/modules/*/quiz/*.ts', '!../../src/curriculum/modules/_*/quiz/*.ts'], { eager: true })
const paperFiles = import.meta.glob<{ default: { questions: { n: number }[] } }>('../../src/data/papers/*.json', { eager: true })
/** lesson keys ("module/lesson"): one checkpoint file per lesson */
const LESSONS = Object.keys(quizzes).map((path) => path.replace(/^.*\/modules\/([^/]+)\/quiz\/([^/]+)\.ts$/, '$1/$2'))
const QUESTIONS = [
  ...(bank as { id: string }[]).map((q) => q.id),
  ...Object.values(quizzes).flatMap((m) => m.default.map((q) => q.id)),
  ...Object.entries(paperFiles).flatMap(([path, m]) => {
    const paper = PAPERS.find((p) => p.files.some((f) => path.endsWith(`/${f}.json`)))!
    return m.default.questions.map((q) => `${paper.id}.${q.n}`)
  }),
]

/** One new attempt at every question, at time t. */
const answeredAgain = (t: number) => crdt.normalize({ v: 3, answers: Object.fromEntries(QUESTIONS.map((id) => [id, [[false, t]]])) })

const done = new Map<number, SyncState>()
/** A student who has done everything: every lesson and checkpoint, every question answered `attempts` times, 50 mock exams. */
function everything(attempts = 5): SyncState {
  if (done.has(attempts)) return done.get(attempts)!
  let t = T0
  const s = crdt.normalize({
    v: 3,
    lessons: Object.fromEntries(LESSONS.map((l) => [l, { d: new Date(T0).toISOString(), t: (t += 1000) }])),
    checkpoints: Object.fromEntries(LESSONS.map((l) => [l, [[0.8, (t += 1000)]]])),
    answers: Object.fromEntries(QUESTIONS.map((id) => [id, Array.from({ length: attempts }, (_, k) => [k % 2 === 0, (t += 1000)])])),
    exams: Object.fromEntries(Array.from({ length: 50 }, (_, i) => `mock-17${String(i).padStart(11, '0')}`).map((id) => [id, { r: exam(id), t: (t += 1000) }])),
  })
  done.set(attempts, s)
  return s
}

/** The document the server holds after the commit lands on `before` (the fields in its mask replaced). */
function applyCommit(before: Record<string, unknown>, body: string): Record<string, unknown> {
  const w = JSON.parse(body).writes[0]
  const after = { ...before }
  for (const p of w.updateMask.fieldPaths as string[]) {
    const v = w.update.fields[p]
    after[p] = 'integerValue' in v ? Number(v.integerValue) : v.stringValue
  }
  return after
}
/** a ⊑ b: joining a into b changes nothing */
const within = (a: SyncState, b: SyncState) => crdt.same(crdt.join(a, b), b)

describe('the stored document', () => {
  it('round-trips a state through its fields, with the format, revision and resetAt', () => {
    let s = crdt.markLesson(crdt.empty(), 'm/a', true, T0)
    s = crdt.markLesson(crdt.markLesson(s, 'm/b', true, T0 + 1), 'm/b', false, T0 + 2)
    s = crdt.recordCheckpoint(s, 'm/a', 0.75, T0 + 3)
    s = crdt.recordAnswer(crdt.recordAnswer(s, 'bank.x.q1', true, T0 + 4), 'prelim2026.3', false, T0 + 5)
    s = crdt.recordExam(s, exam('e1'), T0 + 6)
    const d = toDoc(s, 4)
    expect(d).toMatchObject({ v: 3, rev: 4, resetAt: 0 })
    expect(Object.keys(d).sort()).toEqual(['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'checkpoints', 'exams', 'lessons', 'resetAt', 'rev', 'v'])
    const back = fromDoc(getter(d))
    expect(back.rev).toBe(4)
    expect(crdt.encode(back.state)).toBe(crdt.encode(s))
    const reset = crdt.reset(s, T0 + 10)
    expect(crdt.encode(fromDoc(getter(toDoc(reset, 5))).state)).toBe(crdt.encode(reset))
  })

  it('keeps the answers of one checkpoint, topic or block of 50 questions of a paper together, spread over the parts', () => {
    expect(QUESTIONS.length).toBeGreaterThan(2900) // (the real ids: the bank, every checkpoint, the past papers)
    expect(LESSONS).toHaveLength(184)
    expect(answerPart('bank.ml.q1')).toBe(answerPart('bank.ml.q99'))
    expect(answerPart('ai-first-look.what-is-ai.1')).toBe(answerPart('ai-first-look.what-is-ai.5'))
    expect(answerPart('prelim2026.1')).toBe(answerPart('prelim2026.40'))
    expect(answerPart('prelim2026.51')).toBe(answerPart('prelim2026.100'))
    // a long paper is spread over several parts
    expect(new Set(Array.from({ length: 6 }, (_, i) => answerPart(`prelim2026.${i * 50 + 1}`))).size).toBeGreaterThan(1)
    const used = new Set((bank as { id: string }[]).map((q) => answerPart(q.id)))
    expect(used.size).toBe(ANSWER_PARTS)
    // the same state gives the same text, whatever order it was built in
    const a = crdt.recordAnswer(crdt.recordAnswer(crdt.empty(), 'x.1', true, 1), 'y.1', true, 2)
    const b = crdt.join(crdt.recordAnswer(crdt.empty(), 'y.1', true, 2), crdt.recordAnswer(crdt.empty(), 'x.1', true, 1))
    expect(toParts(a)).toEqual(toParts(b))
  })

  it('reads a damaged or missing part as empty, ignores "__proto__", and checks every entry', () => {
    const f: Record<string, unknown> = { ...toDoc(crdt.markLesson(crdt.empty(), 'm/a', true, T0), 2) }
    f.a3 = '{not json'
    f.checkpoints = '{"m/x": [[3, 1]]}' // not a fraction
    f.a5 = '{"__proto__": [[true, 5]], "ok.1": [[true, 6]]}'
    delete f.exams
    const { state, rev } = fromDoc(getter(f))
    expect(rev).toBe(2)
    expect(crdt.project(state)).toEqual({ lessons: { 'm/a': new Date(T0).toISOString() }, checkpoints: {}, answers: { 'ok.1': [true] }, exams: [] })
    expect(Object.getPrototypeOf(state.answers)).toBe(Object.prototype)
  })

  it('reads a document in another format (an earlier one) as empty, keeping its revision so the next save replaces it', () => {
    const v2 = { v: 2, rev: 7, lessons: '{"m/a":"2026-03-01T00:00:00.000Z"}', exams: '[]' }
    expect(fromDoc(getter(v2))).toEqual({ state: crdt.empty(), rev: 7 })
    expect(fromDoc(getter({ data: '{}' }))).toEqual({ state: crdt.empty(), rev: 0 })
  })

  it('keeps every part under the rules\' 200 000 characters, even with everything done', () => {
    const parts = toParts(everything())
    for (const [k, v] of Object.entries(parts)) expect(v.length, k).toBeLessThan(200_000)
    expect(bytes(JSON.stringify(parts))).toBeGreaterThan(3 * EXIT_SAVE_LIMIT) // why it is split: all of it is far too big
  })
})

describe('the save sent while the page closes', () => {
  const base = crdt.markLesson(crdt.recordAnswer(crdt.empty(), 'bank.x.q1', true, T0), 'm/a', true, T0 + 1)

  it('sends only the parts that changed, with v, rev and resetAt, and the server time as updatedAt', () => {
    const next = crdt.markLesson(base, 'm/b', true, T0 + 2)
    const exit = exitCommit(doc, next, 7, base)!
    expect(exit.sent).toEqual(['lessons'])
    const w = JSON.parse(exit.body).writes[0]
    expect(w.update.name).toBe(doc)
    expect(w.updateMask.fieldPaths).toEqual(['lessons', 'v', 'rev', 'resetAt'])
    expect(w.update.fields).toMatchObject({ v: { integerValue: '3' }, rev: { integerValue: '7' }, resetAt: { integerValue: '0' } })
    expect(w.updateTransforms).toEqual([{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }])
    const after = fromDoc(getter(applyCommit(toDoc(base, 6), exit.body)))
    expect(after.rev).toBe(7)
    expect(crdt.encode(after.state)).toBe(crdt.encode(next))
  })

  it('sends an un-tick and a Reset too, and nothing when nothing changed', () => {
    expect(exitCommit(doc, base, 7, base)).toBeNull()
    const unticked = crdt.markLesson(base, 'm/a', false, T0 + 2)
    expect(exitCommit(doc, unticked, 7, base)!.sent).toEqual(['lessons'])
    const reset = crdt.reset(base, T0 + 3)
    const exit = exitCommit(doc, reset, 7, base)!
    expect(exit.sent.sort()).toEqual(['a' + answerPart('bank.x.q1'), 'lessons'].sort())
    expect(crdt.encode(fromDoc(getter(applyCommit(toDoc(base, 6), exit.body))).state)).toBe(crdt.encode(reset))
    // a Reset with nothing to hide still changes resetAt
    const empty = crdt.reset(crdt.empty(), T0)
    expect(exitCommit(doc, empty, 2, crdt.empty())).toMatchObject({ sent: [] })
  })

  it('fits a change to any one answer part under the cap, for a student who has answered every question three times', () => {
    const all = everything(3)
    const parts = toParts(all)
    for (let part = 0; part < ANSWER_PARTS; part++) {
      const id = QUESTIONS.find((q) => answerPart(q) === part)!
      const exit = exitCommit(doc, crdt.recordAnswer(all, id, true, Date.now()), 7, all)!
      expect(exit.sent, `a${part} (${parts[`a${part}`].length} characters)`).toEqual([`a${part}`])
      expect(bytes(exit.body)).toBeLessThanOrEqual(EXIT_SAVE_LIMIT)
    }
  })

  it('fits under the 64 KB cap for a lesson ticked or a checkpoint score, even with everything done', () => {
    const all = everything()
    const lesson = Object.keys(all.lessons)[10]
    const unticked = crdt.markLesson(all, lesson, false, Date.now())
    const w1 = exitCommit(doc, unticked, 7, all)!
    expect(w1.sent).toEqual(['lessons'])
    expect(bytes(w1.body)).toBeLessThan(EXIT_SAVE_LIMIT)
    const better = crdt.recordCheckpoint(unticked, lesson, 1, Date.now())
    expect(exitCommit(doc, better, 7, all)!.sent).toEqual(['lessons', 'checkpoints'])
  })

  it('changes too big to send at once send what fits, the exam record first, and the copy that lands is still a valid one', () => {
    const all = everything()
    let after = crdt.join(crdt.recordExam(all, exam('mock-new'), Date.now()), answeredAgain(Date.now() + 1)) // every part changes
    after = crdt.markLesson(after, Object.keys(all.lessons)[0], false, Date.now())
    const exit = exitCommit(doc, after, 7, all)!
    expect(bytes(exit.body)).toBeLessThanOrEqual(EXIT_SAVE_LIMIT)
    expect(exit.sent[0]).toBe('exams')
    expect(exit.sent).toContain('lessons')
    expect(exit.sent.length).toBeLessThan(ANSWER_PARTS + 2) // not every part
    const landed = fromDoc(getter(applyCommit(toDoc(all, 6), exit.body))).state
    expect(within(all, landed) && within(landed, after)).toBe(true)
    expect(crdt.project(landed).exams.map((e) => e.id)).toContain('mock-new')
    // nothing fits at all: nothing is sent
    expect(exitCommit(doc, after, 7, all, 200)).toBeNull()
  })

  it('with a Reset, any mix of parts that fits still hides everything before it', () => {
    const all = everything()
    // a Reset, then every question answered again: the parts not sent still hold what came before the Reset
    const reset = crdt.join(crdt.markLesson(crdt.reset(all, Date.now()), 'm/after-reset', true, Date.now() + 1), answeredAgain(Date.now() + 2))
    const exit = exitCommit(doc, reset, 7, all)!
    expect(exit.sent.length).toBeLessThan(ANSWER_PARTS + 3)
    expect(exit.sent).toContain('lessons')
    const landed = fromDoc(getter(applyCommit(toDoc(all, 6), exit.body))).state
    expect(within(all, landed) && within(landed, reset)).toBe(true)
    const shown = crdt.project(landed)
    expect(shown).toMatchObject({ lessons: { 'm/after-reset': expect.any(String) }, checkpoints: {}, exams: [] })
    expect(Object.keys(shown.lessons)).toHaveLength(1)
    // answers: only the attempts since the Reset, from the parts that were sent
    expect(new Set(Object.values(shown.answers).map((a) => JSON.stringify(a)))).toEqual(new Set(['[false]']))
    expect(Object.keys(shown.answers).length).toBeGreaterThan(0)
  })
})
