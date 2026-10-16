/*
  The progress CRDT on its own (src/lib/progress-crdt.ts): the lattice laws of join on random states, the projection
  against an independent oracle that replays every operation in time order, migration from the old plain format, and
  reading untrusted data. Seeded randomness: every run is the same.
  Run: npx vitest run tests/accounts/crdt.test.ts
*/
import { describe, expect, it } from 'vitest'
import * as crdt from '../../src/lib/progress-crdt'
import type { ExamRecord, SyncState } from '../../src/lib/progress-crdt'
import { opOf, oracle, single, type Op } from './model/oracle'

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
type Rnd = () => number
const int = (r: Rnd, n: number) => Math.floor(r() * n)
const pick = <T,>(r: Rnd, xs: readonly T[]) => xs[int(r, xs.length)]

const DATES = ['2026-03-01T00:00:00.000Z', '2026-03-02T00:00:00.000Z', '2026-03-03T00:00:00.000Z']
const exam = (id: string, n = 0, date = DATES[n % 3]): ExamRecord => ({ id, date, mode: 'sprint', total: 10, correct: n, seconds: 60, byDomain: { d: { total: 10, correct: n } } })

/** A random state over a few keys and a small range of times, so that keys, times and records often collide. */
function randomState(r: Rnd): SyncState {
  const T = () => 1 + int(r, 30)
  const raw = {
    v: 3,
    resetAt: r() < 0.5 ? 0 : int(r, 12),
    lessons: {} as Record<string, unknown>,
    checkpoints: {} as Record<string, unknown>,
    answers: {} as Record<string, unknown>,
    exams: {} as Record<string, unknown>,
  }
  for (let i = 0; i < 6; i++) if (r() < 0.6) raw.lessons[`m/l${i}`] = { d: r() < 0.3 ? null : pick(r, DATES), t: T() }
  for (let i = 0; i < 4; i++) if (r() < 0.6) raw.checkpoints[`m/c${i}`] = Array.from({ length: 1 + int(r, 4) }, () => [pick(r, [0, 0.25, 0.5, 1]), T()])
  for (let i = 0; i < 4; i++) if (r() < 0.6) raw.answers[`t.q${i}`] = Array.from({ length: 1 + int(r, 8) }, () => [r() < 0.5, T()])
  for (let i = 0; i < 4; i++) if (r() < 0.5) raw.exams[`e${i}`] = { r: exam(`e${i}`, int(r, 3)), t: T() }
  return crdt.normalize(raw)
}

const enc = crdt.encode

describe('join is a semilattice join (random states)', () => {
  const ITER = 3000
  it(`commutative, associative, idempotent, with empty() as identity (${ITER} triples)`, () => {
    const r = rng(1)
    for (let i = 0; i < ITER; i++) {
      const [a, b, c] = [randomState(r), randomState(r), randomState(r)]
      const ab = crdt.join(a, b)
      expect(enc(ab)).toBe(enc(crdt.join(b, a)))
      expect(enc(crdt.join(ab, c))).toBe(enc(crdt.join(a, crdt.join(b, c))))
      expect(enc(crdt.join(a, a))).toBe(enc(a))
      expect(enc(crdt.join(a, crdt.empty()))).toBe(enc(a))
      // (absorption: what has been joined in stays joined in)
      expect(enc(crdt.join(ab, a))).toBe(enc(ab))
    }
  })

  it('the projection of a join is the same whichever way round it was built, and normalising changes nothing', () => {
    const r = rng(2)
    for (let i = 0; i < 1000; i++) {
      const [a, b, c] = [randomState(r), randomState(r), randomState(r)]
      expect(crdt.project(crdt.join(crdt.join(a, b), c))).toEqual(crdt.project(crdt.join(c, crdt.join(b, a))))
      expect(enc(crdt.normalize(JSON.parse(enc(a))))).toBe(enc(a))
      expect(enc(crdt.fromJSON(crdt.toJSON(a)))).toBe(enc(a))
    }
  })

  it('equality ignores the order keys were added in', () => {
    const a = crdt.normalize({ v: 3, lessons: { 'm/a': { d: DATES[0], t: 5 }, 'm/b': { d: null, t: 6 } } })
    const b = crdt.normalize({ v: 3, lessons: { 'm/b': { d: null, t: 6 }, 'm/a': { d: DATES[0], t: 5 } } })
    expect(crdt.same(a, b)).toBe(true)
    expect(crdt.same(a, crdt.normalize({ v: 3, lessons: { 'm/a': { d: DATES[0], t: 5 } } }))).toBe(false)
  })
})

describe('the projection matches an oracle that replays every operation in time order', () => {
  it('random operations on three replicas with skewed clocks, synced at random (2000 runs)', () => {
    const r = rng(3)
    for (let run = 0; run < 2000; run++) {
      const replicas: SyncState[] = [crdt.empty(), crdt.empty(), crdt.empty()]
      const skew = [0, int(r, 40) - 20, int(r, 40) - 20]
      let clock = 1000
      const ops: Op[] = []
      for (let step = 0; step < 40; step++) {
        clock += int(r, 4)
        const i = int(r, 3)
        const now = clock + skew[i]
        const s = replicas[i]
        const x = r()
        const key = `m/k${int(r, 4)}`
        let next = s
        let op: Op | null = null
        if (x < 0.25) op = opOf('tick', key, s, (next = crdt.markLesson(s, key, true, now)))
        else if (x < 0.4) op = opOf('untick', key, s, (next = crdt.markLesson(s, key, false, now)))
        else if (x < 0.55) op = opOf('cp', key, s, (next = crdt.recordCheckpoint(s, key, pick(r, [0, 0.4, 0.6, 1]), now)))
        else if (x < 0.8) op = opOf('ans', `q.${key}`, s, (next = crdt.recordAnswer(s, `q.${key}`, r() < 0.5, now)))
        else if (x < 0.88) {
          const rec = exam(`e${int(r, 3)}`, int(r, 3))
          op = opOf('exam', rec.id, s, (next = crdt.recordExam(s, rec, now)))
        } else if (x < 0.92) op = opOf('reset', '', s, (next = crdt.reset(s, now)))
        else next = crdt.join(s, replicas[int(r, 3)]) // one replica syncs with another
        replicas[i] = next
        if (op) ops.push(op)
      }
      const final = replicas.reduce(crdt.join)
      expect(crdt.project(final)).toEqual(oracle(ops))
      // nothing any replica did is missing (an operation is in the state when joining it in changes nothing)
      for (const o of ops) expect(enc(crdt.join(final, single(o)))).toBe(enc(final))
      // and the final state is exactly what the operations make
      expect(enc(ops.map(single).reduce(crdt.join, crdt.empty()))).toBe(enc(final))
    }
  })

  it('keeps the newest five attempts and the newest 50 exams, by time', () => {
    let s = crdt.empty()
    for (let i = 0; i < 8; i++) s = crdt.recordAnswer(s, 'q1', i % 2 === 0, 100 + i)
    expect(crdt.project(s).answers.q1).toEqual([false, true, false, true, false])
    expect(s.answers.q1.map((a) => a[1])).toEqual([103, 104, 105, 106, 107])
    for (let i = 0; i < 60; i++) s = crdt.recordExam(s, exam(`x${String(i).padStart(2, '0')}`, i), 1000 + i)
    const p = crdt.project(s)
    expect(p.exams).toHaveLength(50)
    expect(p.exams.map((e) => e.id)).not.toContain('x09')
    expect(new Set(p.exams.map((e) => e.id))).toContain('x59')
  })
})

describe('changes made here', () => {
  it('stamps each change after everything the state has seen, even when the clock is behind', () => {
    const s = crdt.normalize({ v: 3, lessons: { 'm/a': { d: DATES[0], t: 5000 } } })
    expect(crdt.maxT(s)).toBe(5000)
    expect(crdt.tick(s, 100)).toBe(5001)
    expect(crdt.tick(s, 9000.7)).toBe(9000)
    const un = crdt.markLesson(s, 'm/a', false, 100)
    expect(un.lessons['m/a']).toEqual({ d: null, t: 5001 })
  })

  it('ticking a lesson already ticked, or un-ticking one that is not, changes nothing', () => {
    let s = crdt.markLesson(crdt.empty(), 'm/a', true, Date.parse(DATES[1]))
    expect(s.lessons['m/a'].d).toBe(DATES[1])
    expect(crdt.markLesson(s, 'm/a', true, Date.parse(DATES[2]))).toBe(s) // (keeps the first date)
    expect(crdt.markLesson(s, 'm/b', false, 1)).toBe(s)
    s = crdt.markLesson(s, 'm/a', false, Date.parse(DATES[2]))
    expect(crdt.project(s).lessons).toEqual({})
    expect(crdt.markLesson(s, 'm/a', true, Date.parse(DATES[2]) + 5).lessons['m/a'].d).toBe(new Date(Date.parse(DATES[2]) + 5).toISOString())
  })

  it('records a checkpoint score only when it beats the best so far; an answer every time; an exam once', () => {
    let s = crdt.recordCheckpoint(crdt.empty(), 'm/c', 0.5, 10)
    expect(crdt.recordCheckpoint(s, 'm/c', 0.5, 11)).toBe(s)
    expect(crdt.recordCheckpoint(s, 'm/c', 0.25, 12)).toBe(s)
    expect(crdt.recordCheckpoint(s, 'm/c', 2, 12)).toBe(s) // (not a fraction)
    s = crdt.recordCheckpoint(s, 'm/c', 0.75, 13)
    expect(s.checkpoints['m/c']).toEqual([[0.75, 13]])
    expect(crdt.project(crdt.recordCheckpoint(crdt.empty(), 'm/z', 0, 1)).checkpoints).toEqual({ 'm/z': 0 })
    const once = crdt.recordExam(s, exam('e1'), 20)
    expect(crdt.recordExam(once, exam('e1', 2), 21)).toBe(once)
  })

  it('recordAnswers (a submitted mock exam) gives exactly what recordAnswer one after another would', () => {
    const r = rng(7)
    for (let i = 0; i < 300; i++) {
      const s = randomState(r)
      const now = int(r, 40) // (often behind the state's own times)
      const given: [string, boolean][] = Array.from({ length: int(r, 12) }, () => [pick(r, ['t.q0', 't.q1', 't.q2', 'p.1', 'p.2', 'constructor']), r() < 0.5])
      if (r() < 0.1) given.push(['__proto__', true])
      const one = crdt.recordAnswers(s, given, now)
      const each = given.reduce((x, [id, c]) => crdt.recordAnswer(x, id, c, now), s)
      expect(enc(one)).toBe(enc(each))
      expect(crdt.same(one, each)).toBe(true)
      expect(crdt.project(one)).toEqual(crdt.project(each))
      if (given.every(([id]) => id === '__proto__')) expect(one).toBe(s) // (nothing recorded: the state itself)
    }
  })

  it('a Reset hides everything recorded before it, wherever that comes from, but nothing recorded after it', () => {
    const elsewhere = crdt.recordAnswer(crdt.markLesson(crdt.empty(), 'm/old', true, 50), 'q1', true, 60)
    let s = crdt.reset(crdt.markLesson(crdt.empty(), 'm/mine', true, 40), 100)
    expect(s.resetAt).toBe(100)
    s = crdt.markLesson(s, 'm/after', true, 120)
    const joined = crdt.join(s, elsewhere)
    expect(crdt.project(joined)).toEqual({ lessons: { 'm/after': new Date(120).toISOString() }, checkpoints: {}, answers: {}, exams: [] })
    // an answer made elsewhere after the Reset (by the clocks) stays
    expect(crdt.project(crdt.join(s, crdt.recordAnswer(elsewhere, 'q2', false, 150))).answers).toEqual({ q2: [false] })
  })

  it('checkpoint records that a later, higher score makes irrelevant are dropped (but not those a Reset might need)', () => {
    const s = crdt.normalize({ v: 3, checkpoints: { c: [[0.5, 1], [0.9, 2], [0.7, 3], [0.6, 3], [0.7, 3]] } })
    expect(s.checkpoints.c).toEqual([[0.9, 2], [0.7, 3]])
    expect(crdt.project(s).checkpoints.c).toBe(0.9)
    // after a Reset at 2, only the later, lower one counts
    expect(crdt.project(crdt.join(s, { ...crdt.empty(), resetAt: 2 })).checkpoints.c).toBe(0.7)
  })
})

describe('the old plain format', () => {
  const old = {
    lessons: { 'm/a': DATES[0], 'm/bad': 'not a date', constructor: DATES[1] },
    checkpoints: { 'm/a': 0.8, 'm/bad': 1.5, 'm/neg': -1 },
    answers: { 'q.1': [true, false, true, true, false, true, true], 'q.bad': [true, 'x'], 'q.empty': [] },
    exams: [exam('e2', 1, DATES[2]), exam('e1', 2, DATES[0]), { id: 'broken' }, exam('e1', 0, DATES[1])],
  }

  it('is migrated: the same progress for the pages, malformed entries dropped', () => {
    const s = crdt.fromJSON(old)
    expect(s.v).toBe(3)
    expect(crdt.project(s)).toEqual({
      lessons: { 'm/a': DATES[0], constructor: DATES[1] },
      checkpoints: { 'm/a': 0.8 },
      answers: { 'q.1': [true, true, false, true, true] },
      exams: [exam('e1', 0, DATES[1]), exam('e2', 1, DATES[2])], // (e1 twice: the later record of it)
    })
    expect(s.lessons['m/a']).toEqual({ d: DATES[0], t: Date.parse(DATES[0]) })
    expect(s.checkpoints['m/a']).toEqual([[0.8, 1]])
    expect(s.answers['q.1'].map((a) => a[1])).toEqual([3, 4, 5, 6, 7])
  })

  it('migrates the same old copy the same way on every device, and anything recorded since counts as later', () => {
    expect(enc(crdt.migrate(old))).toBe(enc(crdt.migrate(JSON.parse(JSON.stringify(old)))))
    const later = crdt.recordAnswer(crdt.migrate(old), 'q.1', false, Date.now())
    expect(crdt.project(crdt.join(crdt.migrate(old), later)).answers['q.1'].at(-1)).toBe(false)
  })

  it('reads anything that is not progress as empty', () => {
    for (const x of [null, undefined, 3, 'text', [], { lessons: 'x', answers: [], exams: {} }]) expect(enc(crdt.fromJSON(x))).toBe(enc(crdt.empty()))
  })
})

describe('untrusted data in this format', () => {
  it('drops malformed entries, keeps good ones, and never sets a prototype', () => {
    const s = crdt.normalize(
      JSON.parse(`{
        "v": 3, "resetAt": 10,
        "lessons": {
          "good": {"d": "${DATES[0]}", "t": 20}, "removed": {"d": null, "t": 21}, "old": {"d": "${DATES[0]}", "t": 10},
          "badT": {"d": "${DATES[0]}", "t": 20.5}, "badD": {"d": "never", "t": 22}, "neg": {"d": null, "t": -3},
          "__proto__": {"d": "${DATES[0]}", "t": 30}
        },
        "checkpoints": { "c": [[0.5, 11], [7, 12], ["x", 13], [0.4]], "none": "x" },
        "answers": { "q": [[true, 11], [1, 12], [false, 9]], "z": [] },
        "exams": { "e1": {"r": ${JSON.stringify(exam('e1'))}, "t": 15}, "e2": {"r": ${JSON.stringify(exam('e3'))}, "t": 15}, "e4": {"r": {}, "t": 15} }
      }`),
    )
    expect(Object.keys(s.lessons).sort()).toEqual(['good', 'removed'])
    expect(s.checkpoints).toEqual({ c: [[0.5, 11]] })
    expect(s.answers).toEqual({ q: [[true, 11]] })
    expect(Object.keys(s.exams)).toEqual(['e1'])
    expect(Object.getPrototypeOf(s.lessons)).toBe(Object.prototype)
    expect(crdt.normalize({ v: 3, resetAt: -5 }).resetAt).toBe(0)
    expect(crdt.normalize({ v: 3, resetAt: 1.5 }).resetAt).toBe(0)
  })

  it('treats keys like "constructor" as ordinary keys', () => {
    let s = crdt.markLesson(crdt.empty(), 'constructor', true, 5)
    s = crdt.recordAnswer(s, 'toString', true, 6)
    expect(crdt.project(crdt.join(s, crdt.empty()))).toMatchObject({ lessons: { constructor: new Date(5).toISOString() }, answers: { toString: [true] } })
  })
})
