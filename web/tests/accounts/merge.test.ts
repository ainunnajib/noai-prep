/*
  mergeProgress / normalizeProgress, and the progress store's additions for account sync
  (replace, clearLocal, onChange). Run: npx vitest run tests/accounts
*/
import { beforeEach, describe, expect, it } from 'vitest'
import {
  mergeProgress,
  normalizeProgress,
  progress,
  rebaseProgress,
  SYNCED_KEY,
  type ExamRecord,
  type ProgressOrigin,
  type ProgressState,
} from '../../src/lib/progress'

const exam = (id: string, date: string, correct = 1): ExamRecord => ({
  id,
  date,
  mode: 'sprint',
  total: 10,
  correct,
  seconds: 600,
  byDomain: { mathematics: { total: 10, correct } },
})

const state = (p: Partial<ProgressState> = {}): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [], ...p })

describe('mergeProgress', () => {
  it('unions lessons and keeps the earlier completion date', () => {
    const a = state({ lessons: { 'm/a': '2026-03-02T10:00:00.000Z', 'm/both': '2026-03-05T10:00:00.000Z' } })
    const b = state({ lessons: { 'm/b': '2026-03-03T10:00:00.000Z', 'm/both': '2026-03-01T10:00:00.000Z' } })
    expect(mergeProgress(a, b).lessons).toEqual({
      'm/a': '2026-03-02T10:00:00.000Z',
      'm/b': '2026-03-03T10:00:00.000Z',
      'm/both': '2026-03-01T10:00:00.000Z',
    })
    expect(mergeProgress(b, a).lessons['m/both']).toBe('2026-03-01T10:00:00.000Z')
  })

  it('keeps the best checkpoint score', () => {
    const a = state({ checkpoints: { x: 0.4, y: 1 } })
    const b = state({ checkpoints: { x: 0.8, z: 0.5 } })
    expect(mergeProgress(a, b).checkpoints).toEqual({ x: 0.8, y: 1, z: 0.5 })
  })

  it('keeps the longer answer history (a wins a tie), at most 5', () => {
    const a = state({ answers: { q1: [true], q2: [true, true], q3: [false] } })
    const b = state({ answers: { q1: [false, false], q2: [false, false], q4: [true, false, true, false, true, true, true] } })
    const m = mergeProgress(a, b)
    expect(m.answers.q1).toEqual([false, false])
    expect(m.answers.q2).toEqual([true, true])
    expect(m.answers.q3).toEqual([false])
    expect(m.answers.q4).toEqual([true, false, true, true, true]) // the last 5 of 7
  })

  it('unions exams by id, sorted by date, keeping the last 50', () => {
    const a = state({ exams: [exam('e3', '2026-03-03T00:00:00Z'), exam('e1', '2026-03-01T00:00:00Z', 7)] })
    const b = state({ exams: [exam('e2', '2026-03-02T00:00:00Z'), exam('e1', '2026-03-01T00:00:00Z', 9)] })
    const m = mergeProgress(a, b)
    expect(m.exams.map((e) => e.id)).toEqual(['e1', 'e2', 'e3'])
    expect(m.exams[0].correct).toBe(7) // the same attempt in both: a's copy
    const many = Array.from({ length: 40 }, (_, i) => exam(`a${i}`, new Date(Date.UTC(2026, 0, 1 + 2 * i)).toISOString()))
    const more = Array.from({ length: 40 }, (_, i) => exam(`b${i}`, new Date(Date.UTC(2026, 0, 2 + 2 * i)).toISOString()))
    const big = mergeProgress(state({ exams: many }), state({ exams: more }))
    expect(big.exams).toHaveLength(50)
    expect(big.exams.at(-1)!.id).toBe('b39') // the newest are kept
    expect(big.exams.map((e) => e.date)).toEqual([...big.exams.map((e) => e.date)].sort())
  })

  it('is pure and deterministic', () => {
    const a = state({ lessons: { 'm/a': '2026-03-02T10:00:00.000Z' }, answers: { q: [true] }, exams: [exam('e1', '2026-03-01T00:00:00Z')] })
    const b = state({ lessons: { 'm/a': '2026-03-01T10:00:00.000Z' }, checkpoints: { c: 0.5 }, answers: { q: [false, true] } })
    const before = JSON.stringify([a, b])
    const m1 = mergeProgress(a, b)
    const m2 = mergeProgress(a, b)
    expect(JSON.stringify([a, b])).toBe(before)
    expect(m1).toEqual(m2)
    expect(m1.lessons).not.toBe(a.lessons)
    m1.answers.q.push(true)
    expect(b.answers.q).toEqual([false, true])
  })

  it('treats keys like "constructor" as ordinary keys', () => {
    const m = mergeProgress(state(), state({ lessons: { constructor: '2026-01-01T00:00:00Z' }, checkpoints: { toString: 0.5 } }))
    expect(m.lessons.constructor).toBe('2026-01-01T00:00:00Z')
    expect(m.checkpoints.toString).toBe(0.5)
  })
})

describe('normalizeProgress', () => {
  it('returns an empty state for anything that is not an object', () => {
    for (const x of [null, undefined, 3, 'text', [], true]) expect(normalizeProgress(x)).toEqual(state())
  })

  it('drops malformed entries and keeps good ones', () => {
    const n = normalizeProgress({
      lessons: { good: '2026-03-01T00:00:00.000Z', num: 5, bad: 'not a date', nul: null },
      checkpoints: { ok: 0.5, one: 1, zero: 0, big: 1.5, neg: -0.1, str: '0.5', nan: NaN },
      answers: { ok: [true, false], mixed: [true, 'yes'], empty: [], notArray: true, long: [true, true, true, true, true, false, false] },
      exams: [
        exam('ok', '2026-03-01T00:00:00Z'),
        { ...exam('noDate', 'x'), date: undefined },
        { ...exam('badTotal', '2026-03-01T00:00:00Z'), total: 'ten' },
        { id: 'missing', date: '2026-03-01T00:00:00Z' },
        { ...exam('noDomains', '2026-03-01T00:00:00Z'), byDomain: null },
        { ...exam('', '2026-03-01T00:00:00Z') },
        exam('ok', '2026-03-02T00:00:00Z'), // a duplicate id
        'junk',
      ],
    })
    expect(n.lessons).toEqual({ good: '2026-03-01T00:00:00.000Z' })
    expect(n.checkpoints).toEqual({ ok: 0.5, one: 1, zero: 0 })
    expect(n.answers).toEqual({ ok: [true, false], long: [true, true, true, false, false] })
    expect(n.exams.map((e) => e.id)).toEqual(['ok'])
  })

  it('drops malformed per-domain scores but keeps the exam', () => {
    const n = normalizeProgress({ exams: [{ ...exam('e', '2026-03-01T00:00:00Z'), byDomain: { a: { total: 3, correct: 2 }, b: { total: 'x' }, c: 4 } }] })
    expect(n.exams[0].byDomain).toEqual({ a: { total: 3, correct: 2 } })
  })

  it('never sets an object prototype from a "__proto__" key', () => {
    const n = normalizeProgress(JSON.parse('{"lessons":{"__proto__":"2026-01-01T00:00:00Z","x":"2026-01-01T00:00:00Z"}}'))
    expect(Object.getPrototypeOf(n.lessons)).toBe(Object.prototype)
    expect(Object.keys(n.lessons)).toEqual(['x'])
  })

  it('round-trips a valid state unchanged', () => {
    const s = state({
      lessons: { 'm/a': '2026-03-02T10:00:00.000Z' },
      checkpoints: { 'm/a': 0.75 },
      answers: { q: [true, false] },
      exams: [exam('e1', '2026-03-01T00:00:00Z')],
    })
    expect(normalizeProgress(JSON.parse(JSON.stringify(s)))).toEqual(s)
  })
})

describe('rebaseProgress: this copy\'s own changes since the base, redone on the account copy', () => {
  const D = '2026-03-01T00:00:00.000Z'
  const D2 = '2026-03-02T00:00:00.000Z'

  it('adds what was added here and removes what was removed here, keeping the rest as the account has it', () => {
    const base = state({ lessons: { a: D, b: D }, checkpoints: { a: 0.5 }, answers: { q1: [true] }, exams: [exam('e1', D)] })
    const local = state({ lessons: { a: D, c: D2 }, checkpoints: { a: 0.9 }, answers: { q1: [true, false], q2: [true] }, exams: [exam('e1', D), exam('e2', D2)] })
    const remote = state({ lessons: { a: D, b: D, d: D2 }, checkpoints: { a: 0.5, d: 1 }, answers: { q1: [true], q3: [false] }, exams: [exam('e1', D), exam('e3', '2026-03-03T00:00:00.000Z')] })
    const r = rebaseProgress(local, remote, base)
    expect(r.lessons).toEqual({ a: D, c: D2, d: D2 }) // b un-ticked here; d ticked elsewhere
    expect(r.checkpoints).toEqual({ a: 0.9, d: 1 })
    expect(r.answers).toEqual({ q1: [true, false], q2: [true], q3: [false] })
    expect(r.exams.map((e) => e.id)).toEqual(['e1', 'e2', 'e3'])
  })

  it('keeps removals made elsewhere (a Reset or an un-tick there is not undone by an unchanged copy here)', () => {
    const base = state({ lessons: { a: D, b: D }, answers: { q: [true] } })
    expect(rebaseProgress(base, state(), base)).toEqual(state())
    expect(rebaseProgress(base, state({ lessons: { a: D } }), base)).toEqual(state({ lessons: { a: D } }))
  })

  it('a Reset here removes what this copy had, but not what was added elsewhere since', () => {
    const base = state({ lessons: { a: D }, exams: [exam('e1', D)] })
    const remote = state({ lessons: { a: D, b: D2 }, exams: [exam('e1', D), exam('e2', D2)] })
    expect(rebaseProgress(state(), remote, base)).toEqual(state({ lessons: { b: D2 }, exams: [exam('e2', D2)] }))
  })

  it('keeps what another device changed since the base, even if it was removed here (ticked again there, say)', () => {
    // (the base can be out of date: this browser un-ticked a and saved that as the page closed, and the note never heard)
    const base = state({ lessons: { a: D }, checkpoints: { c: 0.5 }, answers: { q: [true] } })
    const remote = state({ lessons: { a: D2 }, checkpoints: { c: 1 }, answers: { q: [true, false] } })
    expect(rebaseProgress(state(), remote, base)).toEqual(remote)
  })

  it('a value changed only here wins over the account copy left unchanged (an answer at a full history, say)', () => {
    const five = [true, true, true, true, true]
    const base = state({ answers: { q: five } })
    const local = state({ answers: { q: [true, true, true, true, false] } }) // a sixth attempt here
    expect(rebaseProgress(local, base, base).answers.q).toEqual([true, true, true, true, false])
    // the same for a lesson ticked again here (its new date) and a checkpoint retaken after a Reset (its new score)
    const was = state({ lessons: { a: D }, checkpoints: { c: 0.9 } })
    expect(rebaseProgress(state({ lessons: { a: D2 }, checkpoints: { c: 0.5 } }), was, was)).toEqual(state({ lessons: { a: D2 }, checkpoints: { c: 0.5 } }))
    // changed on both sides: the longer history, as before
    expect(rebaseProgress(state({ answers: { q: [false] } }), state({ answers: { q: [true, true] } }), state()).answers.q).toEqual([true, true])
  })
})

describe('progress store additions', () => {
  const seen: [ProgressState, ProgressOrigin][] = []
  beforeEach(() => {
    progress.clearLocal()
    seen.length = 0
    localStorage.clear()
  })

  it('reports where each change came from', () => {
    const off = progress.onChange((s, origin) => seen.push([s, origin]))
    progress.markLesson('m/a')
    progress.replace(state({ lessons: { 'm/b': '2026-03-01T00:00:00Z' } }), 'remote')
    progress.reset()
    progress.clearLocal()
    off()
    progress.markLesson('m/c')
    expect(seen.map(([, o]) => o)).toEqual(['local', 'remote', 'reset', 'clear'])
    expect(seen[1][0].lessons).toEqual({ 'm/b': '2026-03-01T00:00:00Z' })
  })

  it('replace() stores the new state and tells plain subscribers too', () => {
    let calls = 0
    const off = progress.subscribe(() => calls++)
    progress.replace(state({ checkpoints: { x: 1 } }), 'remote')
    off()
    expect(calls).toBe(1)
    expect(progress.get().checkpoints).toEqual({ x: 1 })
    expect(JSON.parse(localStorage.getItem('noai-prep:progress-v1')!).checkpoints).toEqual({ x: 1 })
  })

  it('clearLocal() and reset() both forget the progress and the mock exam in progress', () => {
    for (const wipe of [() => progress.clearLocal(), () => progress.reset()]) {
      progress.markLesson('m/a')
      localStorage.setItem('noai-prep:mock-current', '{"ids":[]}')
      wipe()
      expect(progress.get()).toEqual(state())
      expect(localStorage.getItem('noai-prep:mock-current')).toBeNull()
    }
    expect(localStorage.getItem('noai-prep:progress-v1')).not.toBeNull() // reset() saves the empty state, as before
    progress.clearLocal()
    expect(localStorage.getItem('noai-prep:progress-v1')).toBeNull()
  })

  it("clearLocal() also forgets account sync's note of the account copy (it only holds next to this browser's copy)", () => {
    localStorage.setItem('noai-prep:' + SYNCED_KEY, JSON.stringify({ uid: 'u1', data: state() }))
    progress.reset()
    expect(localStorage.getItem('noai-prep:' + SYNCED_KEY)).not.toBeNull() // a Reset is a change to sync, not a sign-out
    progress.clearLocal()
    expect(localStorage.getItem('noai-prep:' + SYNCED_KEY)).toBeNull()
  })

  it("takes progress another tab saved, so this tab's next change doesn't overwrite it", () => {
    const off = progress.onChange((s, origin) => seen.push([s, origin]))
    progress.markLesson('m/in-this-tab')
    // another tab (sharing localStorage) ticks a lesson: its copy already has this tab's lesson
    const theirs = { ...progress.get(), lessons: { ...progress.get().lessons, 'm/in-other-tab': '2026-03-01T00:00:00Z' } }
    localStorage.setItem('noai-prep:progress-v1', JSON.stringify(theirs))
    window.dispatchEvent(new StorageEvent('storage', { key: 'noai-prep:progress-v1' }))
    expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/in-other-tab', 'm/in-this-tab'])
    expect(seen.at(-1)![1]).toBe('remote') // not saved again as a change made here
    progress.markLesson('m/next')
    expect(Object.keys(JSON.parse(localStorage.getItem('noai-prep:progress-v1')!).lessons).sort()).toEqual(['m/in-other-tab', 'm/in-this-tab', 'm/next'])
    // an un-tick or a Reset there comes here too
    localStorage.removeItem('noai-prep:progress-v1')
    window.dispatchEvent(new StorageEvent('storage', { key: 'noai-prep:progress-v1' }))
    expect(progress.get()).toEqual(state())
    // other keys are none of its business
    localStorage.setItem('noai-prep:progress-v1', JSON.stringify(theirs))
    window.dispatchEvent(new StorageEvent('storage', { key: 'noai-prep:theme' }))
    expect(progress.get()).toEqual(state())
    off()
  })

  it("doesn't take another tab's copy while account sync has that turned off (signed in: each tab syncs itself)", () => {
    progress.followOtherTabs(false)
    try {
      progress.markLesson('m/mine')
      localStorage.setItem('noai-prep:progress-v1', JSON.stringify(state()))
      window.dispatchEvent(new StorageEvent('storage', { key: 'noai-prep:progress-v1' }))
      expect(Object.keys(progress.get().lessons)).toEqual(['m/mine'])
    } finally {
      progress.followOtherTabs(true)
    }
  })

  it('signed in, a change here is redone on what another tab saved meanwhile instead of overwriting it', () => {
    const D = '2026-03-01T00:00:00Z'
    progress.markLesson('m/a')
    progress.followOtherTabs(false)
    try {
      // another signed-in tab (offline, say) ticks a lesson: its copy may never reach the account, only this browser
      localStorage.setItem('noai-prep:progress-v1', JSON.stringify({ ...progress.get(), lessons: { ...progress.get().lessons, 'm/other': D } }))
      progress.recordAnswer('q1', true)
      expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/a', 'm/other'])
      const stored = JSON.parse(localStorage.getItem('noai-prep:progress-v1')!)
      expect(Object.keys(stored.lessons).sort()).toEqual(['m/a', 'm/other'])
      expect(stored.answers).toEqual({ q1: [true] })
      // a copy that lacks something this tab has, but wasn't built on this tab's last save (that tab missed it), doesn't
      // remove it here
      localStorage.setItem('noai-prep:progress-v1', JSON.stringify({ ...stored, lessons: { 'm/other': D }, saves: ['elsewhere'] }))
      progress.recordCheckpoint('m/x', 1)
      expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/a', 'm/other'])
      // one built on this tab's last save: what it lacks was removed there (an un-tick), and stays removed
      const mine = JSON.parse(localStorage.getItem('noai-prep:progress-v1')!)
      localStorage.setItem('noai-prep:progress-v1', JSON.stringify({ ...mine, lessons: { 'm/other': D }, saves: ['there', ...mine.saves] }))
      progress.recordAnswer('q2', false)
      expect(Object.keys(progress.get().lessons)).toEqual(['m/other'])
      // one built on an older save of this tab's (it missed the latest): this tab's changes since then stay, un-ticks too
      const older = JSON.parse(localStorage.getItem('noai-prep:progress-v1')!)
      progress.markLesson('m/c')
      progress.markLesson('m/c', false)
      progress.markLesson('m/other', false)
      localStorage.setItem('noai-prep:progress-v1', JSON.stringify({ ...older, answers: { ...older.answers, q3: [true] }, saves: ['stale', ...older.saves] }))
      progress.recordAnswer('q4', true)
      expect(progress.get().lessons).toEqual({})
      expect(Object.keys(progress.get().answers).sort()).toEqual(['q1', 'q2', 'q3', 'q4'])
      progress.markLesson('m/other')
      // an un-tick here is still an un-tick
      localStorage.setItem('noai-prep:progress-v1', JSON.stringify({ ...progress.get(), checkpoints: { 'm/y': 0.5 } }))
      progress.markLesson('m/other', false)
      expect(progress.get().lessons).toEqual({})
      expect(progress.get().checkpoints).toEqual({ 'm/x': 1, 'm/y': 0.5 })
      // a Reset there, built on this tab's last save, stays done (only this change is added)
      const last = JSON.parse(localStorage.getItem('noai-prep:progress-v1')!)
      localStorage.setItem('noai-prep:progress-v1', JSON.stringify({ ...state(), saves: ['reset-there', ...last.saves] }))
      progress.markLesson('m/b')
      expect(progress.get()).toEqual(state({ lessons: { 'm/b': progress.get().lessons['m/b'] } }))
      // a Reset here wipes everything, whatever another tab saved
      localStorage.setItem('noai-prep:progress-v1', JSON.stringify(state({ lessons: { 'm/c': D } })))
      progress.reset()
      expect(progress.get()).toEqual(state())
    } finally {
      progress.followOtherTabs(true)
    }
  })

  it('takeOtherTabs() takes in what another signed-in tab saved, as a change made here (to be saved)', () => {
    const D = '2026-03-01T00:00:00Z'
    progress.followOtherTabs(false)
    try {
      const off = progress.onChange((s, origin) => seen.push([s, origin]))
      progress.takeOtherTabs()
      expect(seen).toHaveLength(0) // nothing new
      localStorage.setItem('noai-prep:progress-v1', JSON.stringify(state({ lessons: { 'm/other': D } })))
      progress.takeOtherTabs()
      off()
      expect(progress.get().lessons).toEqual({ 'm/other': D })
      expect(seen.map(([, o]) => o)).toEqual(['local'])
    } finally {
      progress.followOtherTabs(true)
    }
  })

  it('turning tab-following off first takes in what another tab saved (no storage event has arrived yet)', () => {
    const D = '2026-03-01T00:00:00Z'
    localStorage.setItem('noai-prep:progress-v1', JSON.stringify(state({ lessons: { 'm/other': D } })))
    progress.followOtherTabs(false)
    progress.followOtherTabs(true)
    expect(progress.get().lessons).toEqual({ 'm/other': D })
  })

  it('keeps the existing behaviour of the old API', () => {
    progress.markLesson('m/a')
    progress.markLesson('m/a', false)
    progress.recordCheckpoint('m/a', 0.5)
    progress.recordCheckpoint('m/a', 0.25)
    for (let i = 0; i < 7; i++) progress.recordAnswer('q', i % 2 === 0)
    progress.recordExam(exam('e1', '2026-03-01T00:00:00Z'))
    progress.recordExam(exam('e1', '2026-03-01T00:00:00Z'))
    const s = progress.get()
    expect(s.lessons).toEqual({})
    expect(s.checkpoints).toEqual({ 'm/a': 0.5 })
    expect(s.answers.q).toEqual([true, false, true, false, true])
    expect(s.exams).toHaveLength(1)
  })
})
