/*
  How the account copy of progress is stored (progress-doc.ts): split into parts, so the save sent while a page closes
  can carry just the parts that changed and stay under the browsers' 64 KB cap. Run: npx vitest run tests/accounts
*/
import { describe, expect, it } from 'vitest'
import bank from '../../src/data/bank/bank.json'
import { normalizeProgress, type ExamRecord, type ProgressState } from '../../src/lib/progress'
import { ANSWER_PARTS, answerPart, EXIT_SAVE_LIMIT, exitCommitBody, fromFields, toFields } from '../../src/lib/accounts/progress-doc'

const D1 = '2026-03-01T00:00:00.000Z'
const state = (p: Partial<ProgressState> = {}): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [], ...p })
const fieldsOf = (s: ProgressState) => {
  const f: Record<string, unknown> = { ...toFields(s), v: 2, rev: 4 }
  return (k: string) => f[k]
}
const bytes = (s: string) => new TextEncoder().encode(s).length

/** A student who has done everything: every lesson and checkpoint, every question answered five times, 50 mock exams. */
function everything(): ProgressState {
  const s = state()
  for (let i = 0; i < 184; i++) {
    const lesson = `module-${String(i % 31).padStart(2, '0')}-topic/lesson-number-${i}-title`
    s.lessons[lesson] = D1
    s.checkpoints[lesson] = 0.8
    for (let q = 1; q <= 5; q++) s.answers[`${lesson.replace('/', '.')}.${q}`] = [true, false, true, true, false]
  }
  for (const { id } of bank as { id: string }[]) s.answers[id] = [true, false, true, true, false]
  for (const paper of ['prelim2026', 'final2026', 'noai2025', 'noai2024', 'prelim2025'])
    for (let n = 1; n <= 60; n++) s.answers[`${paper}.${n}`] = [true, false, true, true, false]
  const domains = ['mathematics', 'programming', 'ml', 'deep-learning', 'vision', 'nlp', 'ethics', 'data']
  for (let i = 0; i < 50; i++) {
    const byDomain = Object.fromEntries(domains.map((d) => [d, { total: 5, correct: 3 }]))
    s.exams.push({ id: `mock-17${String(i).padStart(11, '0')}`, date: D1, mode: 'prelim', total: 40, correct: 24, seconds: 3600, byDomain })
  }
  return s
}

describe('stored fields', () => {
  it('round-trips progress through its fields', () => {
    const s = state({
      lessons: { 'm/a': D1, 'm/b': D1 },
      checkpoints: { 'm/a': 0.5 },
      answers: { 'bank.x.q1': [true], 'm.a.1': [false, true], 'prelim2026.3': [true] },
      exams: [{ id: 'e1', date: D1, mode: 'sprint', total: 10, correct: 7, seconds: 600, byDomain: { mathematics: { total: 10, correct: 7 } } }],
    })
    const f = toFields(s)
    expect(Object.keys(f).sort()).toEqual(['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'checkpoints', 'exams', 'lessons'])
    expect(normalizeProgress(fromFields(fieldsOf(s)))).toEqual(s)
    // the same progress, built in another order, gives the same text
    expect(toFields(state({ ...s, lessons: { 'm/b': D1, 'm/a': D1 } }))).toEqual(f)
  })

  it('keeps the answers of one checkpoint, topic or paper together, spread over the parts', () => {
    expect(new Set([1, 2, 3, 4, 5].map((q) => answerPart(`ai-first-look.classify-with-boundaries.${q}`))).size).toBe(1)
    expect(answerPart('bank.a-i-ethics-safety.ethics_001')).toBe(answerPart('bank.a-i-ethics-safety.ethics_099'))
    const used = new Set(Object.keys(everything().answers).map(answerPart))
    expect(used.size).toBe(ANSWER_PARTS)
  })

  it('reads a missing or damaged part as empty, and ignores a "__proto__" key', () => {
    const got = normalizeProgress(fromFields((k) => ({ v: 2, lessons: '{"m/a":"' + D1 + '"}', a0: 'not json', a1: '{"__proto__":[true],"q":[false]}' })[k]))
    expect(got).toEqual(state({ lessons: { 'm/a': D1 }, answers: { q: [false] } }))
    expect(Object.getPrototypeOf(got.answers)).toBe(Object.prototype)
  })

  it('still reads the earlier format (all of it as one JSON text in `data`)', () => {
    const s = state({ lessons: { 'm/a': D1 }, answers: { q: [true] } })
    expect(normalizeProgress(fromFields((k) => ({ v: 1, data: JSON.stringify(s) })[k]))).toEqual(s)
  })
})

describe('the save sent while the page closes', () => {
  const doc = 'projects/p/databases/(default)/documents/progress/u1'
  const body = (s: ProgressState, base: ProgressState) => JSON.parse(exitCommitBody(doc, s, 7, base)!)

  it('sends only the parts that changed, as the next revision', () => {
    const base = state({ lessons: { 'm/a': D1 }, answers: { 'bank.x.q1': [true] } })
    const next = { ...base, lessons: { 'm/a': D1, 'm/b': D1 } }
    const w = body(next, base).writes[0]
    expect(w.update.name).toBe(doc)
    expect(w.updateMask.fieldPaths).toEqual(['lessons', 'v', 'rev'])
    expect(w.update.fields).toEqual({ v: { integerValue: '2' }, rev: { integerValue: '7' }, lessons: { stringValue: toFields(next).lessons } })
    expect(w.updateTransforms).toEqual([{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }])
  })

  it('sends an emptied part too (an un-tick or a Reset), and nothing when nothing changed', () => {
    const base = state({ lessons: { 'm/a': D1 }, exams: [{ id: 'e', date: D1, mode: 'sprint', total: 1, correct: 1, seconds: 1, byDomain: {} } as ExamRecord] })
    expect(body(state(), base).writes[0].updateMask.fieldPaths).toEqual(['lessons', 'exams', 'v', 'rev'])
    expect(exitCommitBody(doc, base, 7, base)).toBeNull()
  })

  it('fits under the 64 KB cap for a lesson ticked, a question answered or a checkpoint finished, even with everything done', () => {
    const all = everything()
    const full = exitCommitBody(doc, all, 7, state())!
    expect(bytes(full)).toBeGreaterThan(3 * EXIT_SAVE_LIMIT) // why it is split: all of it is far too big

    const lesson = Object.keys(all.lessons)[10]
    const unticked = { ...all, lessons: { ...all.lessons } }
    delete unticked.lessons[lesson]
    expect(bytes(exitCommitBody(doc, unticked, 7, all)!)).toBeLessThan(EXIT_SAVE_LIMIT)

    const answered = { ...all, answers: { ...all.answers, 'bank.a-i-ethics-safety.ethics_001': [false, true, true, false, true] } }
    expect(bytes(exitCommitBody(doc, answered, 7, all)!)).toBeLessThan(EXIT_SAVE_LIMIT)

    // a checkpoint: its five answers, its score and the lesson ticked
    const base = { ...all, lessons: { ...all.lessons }, checkpoints: { ...all.checkpoints } }
    delete base.lessons[lesson]
    delete base.checkpoints[lesson]
    const checkpoint = { ...all, answers: { ...all.answers } }
    for (let q = 1; q <= 5; q++) checkpoint.answers[`${lesson.replace('/', '.')}.${q}`] = [false, false, false, false, true]
    const w = exitCommitBody(doc, checkpoint, 7, base)!
    expect(JSON.parse(w).writes[0].updateMask.fieldPaths).toHaveLength(5) // lessons, checkpoints, one answers part, v, rev
    expect(bytes(w)).toBeLessThan(EXIT_SAVE_LIMIT)
  })
})
