/*
  The progress store (src/lib/progress.ts): its public API for the pages, and tabs of one browser. Each "tab" is its
  own instance of the module (a fresh module registry) over the one jsdom localStorage; a tab hears another's change
  only when the test delivers the storage event (deliver()), so a test can also have a tab act before it hears.
  Run: npx vitest run tests/accounts/progress-store.test.ts
*/
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProgressOrigin } from '../../src/lib/progress'
import * as crdt from '../../src/lib/progress-crdt'

type Store = typeof import('../../src/lib/progress').progress

const KEY = 'noai-prep:progress-v1'
const D1 = '2026-03-01T00:00:00.000Z'
const stored = () => JSON.parse(localStorage.getItem(KEY) ?? 'null')
/** A new tab: a fresh instance of the progress store, reading what this browser has stored. */
async function openTab(): Promise<{ progress: Store; origins: ProgressOrigin[] }> {
  vi.resetModules()
  const { progress } = await import('../../src/lib/progress')
  const origins: ProgressOrigin[] = []
  progress.onChange((o) => origins.push(o))
  return { progress, origins }
}
/** The storage event other tabs get after a change (every tab's listener runs; the one that wrote finds nothing new). */
const deliver = (key: string | null = KEY) => window.dispatchEvent(new StorageEvent('storage', { key }))
const lessons = (p: Store) => Object.keys(p.get().lessons).sort()

beforeEach(() => {
  localStorage.clear()
  deliver(null) // (tabs left over from earlier tests let go of their copies)
})

describe('the store the pages use', () => {
  it('keeps the existing behaviour of its API', async () => {
    const { progress } = await openTab()
    const seen: number[] = []
    progress.subscribe(() => seen.push(1))
    progress.markLesson('m/a')
    const date = progress.get().lessons['m/a']
    progress.markLesson('m/a') // already done: keeps its date, changes nothing
    expect(progress.get().lessons['m/a']).toBe(date)
    progress.recordCheckpoint('m/a', 0.5)
    progress.recordCheckpoint('m/a', 0.25)
    progress.recordCheckpoint('m/a', 0.75)
    for (const c of [true, false, true, true, false, true]) progress.recordAnswer('q1', c)
    const rec = { id: 'e1', date: D1, mode: 'sprint', total: 2, correct: 1, seconds: 30, byDomain: {} }
    progress.recordExam(rec)
    progress.recordExam({ ...rec, correct: 2 }) // the same attempt: recorded once
    expect(progress.get()).toEqual({ lessons: { 'm/a': date }, checkpoints: { 'm/a': 0.75 }, answers: { q1: [false, true, true, false, true] }, exams: [rec] })
    progress.markLesson('m/a', false)
    expect(progress.get().lessons).toEqual({})
    expect(seen.length).toBe(11) // (one per change, none for the changes that changed nothing)
    expect(progress.get()).toBe(progress.get()) // (the same object until something changes, as useSyncExternalStore needs)
  })

  it('stores the full state (format 3) and reads it back in a new tab', async () => {
    const a = await openTab()
    a.progress.markLesson('m/a')
    a.progress.markLesson('m/b')
    a.progress.markLesson('m/b', false)
    expect(stored()).toMatchObject({ v: 3, resetAt: 0, lessons: { 'm/a': { d: expect.any(String) }, 'm/b': { d: null } } })
    const b = await openTab()
    expect(b.progress.get()).toEqual(a.progress.get())
    expect(crdt.same(b.progress.getSync(), a.progress.getSync())).toBe(true)
  })

  it('reads progress the site stored in the old plain format', async () => {
    localStorage.setItem(KEY, JSON.stringify({ lessons: { 'm/a': D1 }, checkpoints: { 'm/a': 1 }, answers: { q1: [false, true] }, exams: [] }))
    const { progress } = await openTab()
    expect(progress.get()).toEqual({ lessons: { 'm/a': D1 }, checkpoints: { 'm/a': 1 }, answers: { q1: [false, true] }, exams: [] })
    progress.recordAnswer('q1', false)
    expect(progress.get().answers.q1).toEqual([false, true, false])
    expect(stored().v).toBe(3)
  })

  it('Reset and clearLocal both forget the progress and the mock exam in progress', async () => {
    const { progress, origins } = await openTab()
    progress.markLesson('m/a')
    localStorage.setItem('noai-prep:mock-current', '{}')
    progress.reset()
    expect(progress.get().lessons).toEqual({})
    expect(stored().resetAt).toBeGreaterThan(0) // (a Reset is a change to sync, not a wipe)
    expect(localStorage.getItem('noai-prep:mock-current')).toBeNull()
    progress.markLesson('m/b')
    localStorage.setItem('noai-prep:mock-current', '{}')
    progress.clearLocal()
    expect(progress.get().lessons).toEqual({})
    expect(stored()).toBeNull()
    expect(localStorage.getItem('noai-prep:mock-current')).toBeNull()
    expect(origins).toEqual(['local', 'reset', 'local', 'clear'])
  })

  it('records a mock exam with its answers as one change: one write and one notification, however many questions', async () => {
    const { progress, origins } = await openTab()
    const seen: number[] = []
    progress.subscribe(() => seen.push(1))
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    const given: [string, boolean][] = Array.from({ length: 300 }, (_, i) => [`prelim2026.${i + 1}`, i % 3 !== 0])
    const rec = { id: 'e1', date: D1, mode: 'marathon', total: 300, correct: 200, seconds: 60, byDomain: {} }
    progress.recordExam(rec, given)
    expect(writes.mock.calls.filter(([k]) => k === KEY)).toHaveLength(1)
    writes.mockRestore()
    expect(seen).toHaveLength(1)
    expect(origins).toEqual(['local'])
    const shown = progress.get()
    expect(shown.exams).toEqual([rec])
    expect(Object.keys(shown.answers)).toHaveLength(300)
    expect(shown.answers['prelim2026.1']).toEqual([false])
    expect(shown.answers['prelim2026.2']).toEqual([true])
    // the same attempt again (submitted in another tab, say) changes nothing but its answers, as before
    progress.recordExam(rec)
    expect(progress.get().exams).toHaveLength(1)
  })

  it('works on in memory when storage is blocked', async () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    try {
      const { progress } = await openTab()
      progress.markLesson('m/a')
      progress.recordAnswer('q1', true)
      expect(lessons(progress)).toEqual(['m/a'])
      expect(progress.get().answers.q1).toEqual([true])
    } finally {
      get.mockRestore()
      set.mockRestore()
    }
  })
})

describe('tabs of one browser', () => {
  it("each tab takes in what another stores, so neither's next change overwrites the other's", async () => {
    const a = await openTab()
    const b = await openTab()
    a.progress.markLesson('m/a')
    deliver()
    expect(lessons(b.progress)).toEqual(['m/a'])
    expect(b.origins).toEqual(['tab'])
    b.progress.markLesson('m/a', false)
    b.progress.markLesson('m/b')
    deliver()
    expect(lessons(a.progress)).toEqual(['m/b'])
  })

  it("a change made before hearing of another tab's joins what that tab stored (nothing is lost)", async () => {
    const a = await openTab()
    const b = await openTab()
    a.progress.markLesson('m/a')
    a.progress.recordAnswer('q1', true)
    b.progress.markLesson('m/b') // (b hasn't heard of a's changes)
    b.progress.recordAnswer('q1', false)
    expect(lessons(b.progress)).toEqual(['m/a', 'm/b'])
    deliver()
    expect(lessons(a.progress)).toEqual(['m/a', 'm/b'])
    expect(a.progress.get().answers.q1).toEqual([true, false])
    expect(crdt.same(crdt.fromJSON(stored()), a.progress.getSync())).toBe(true)
  })

  it('an un-tick and a Reset in one tab reach the others (and stay done when an older copy is joined in)', async () => {
    const a = await openTab()
    const b = await openTab()
    a.progress.claim('u1')
    a.progress.markLesson('m/a')
    a.progress.markLesson('m/b')
    deliver()
    const before = b.progress.getSync()
    a.progress.markLesson('m/a', false)
    deliver()
    expect(lessons(b.progress)).toEqual(['m/b'])
    a.progress.reset()
    deliver()
    expect(b.progress.get().lessons).toEqual({})
    b.progress.mergeRemote(before, 'u1') // (an old copy, say from the account: nothing comes back)
    expect(b.progress.get().lessons).toEqual({})
  })

  it('getSync() includes what another tab stored, even before its storage event arrives', async () => {
    const a = await openTab()
    const b = await openTab()
    a.progress.markLesson('m/a')
    expect(Object.keys(b.progress.getSync().lessons)).toEqual(['m/a'])
    expect(b.origins).toEqual(['tab'])
  })

  it('writes its copy back when it holds more than what is stored (two tabs wrote at once and one overwrote the other)', async () => {
    const a = await openTab()
    const b = await openTab()
    a.progress.markLesson('m/a')
    const onlyA = localStorage.getItem(KEY)!
    deliver()
    b.progress.markLesson('m/b')
    localStorage.setItem(KEY, onlyA) // a's slower write lands over b's
    deliver()
    expect(Object.keys(stored().lessons).sort()).toEqual(['m/a', 'm/b'])
  })

  it("announces another tab's change it catches up with, and stores what it holds that the stored copy lacks", async () => {
    const a = await openTab()
    let heard = 0
    a.progress.subscribe(() => heard++)
    a.progress.markLesson('m/a')
    // another tab's write lands over a's (it hadn't heard of m/a)
    localStorage.setItem(KEY, JSON.stringify(crdt.toJSON(crdt.markLesson(crdt.empty(), 'm/b', true, Date.now()))))
    deliver()
    expect(a.origins).toEqual(['local', 'tab'])
    expect(heard).toBe(2)
    expect(lessons(a.progress)).toEqual(['m/a', 'm/b'])
    expect(Object.keys(stored().lessons).sort()).toEqual(['m/a', 'm/b'])
    const view = a.progress.get()
    deliver() // (nothing new: no announcement, and the same object for the pages)
    expect(a.progress.get()).toBe(view)
    expect(heard).toBe(2)
  })

  it('signing out in one tab clears the others, and a change made there before it hears goes onto an empty copy', async () => {
    const a = await openTab()
    const b = await openTab()
    a.progress.claim('u1')
    a.progress.markLesson('m/secret')
    deliver()
    expect(b.progress.owner()).toBe('u1')
    a.progress.clearLocal() // sign-out in tab a
    b.progress.markLesson('m/new') // tab b, before its storage event
    expect(lessons(b.progress)).toEqual(['m/new'])
    expect(b.progress.owner()).toBeNull()
    expect(Object.keys(stored().lessons)).toEqual(['m/new'])
    const c = await openTab()
    c.progress.claim('u1')
    c.progress.clearLocal()
    deliver()
    expect(b.origins.at(-1)).toBe('clear')
    expect(b.progress.get().lessons).toEqual({})
  })

  it("a tab that missed a sign-out and the next person's sign-in never mixes the old copy into theirs", async () => {
    const a = await openTab()
    const b = await openTab()
    a.progress.claim('u1')
    a.progress.markLesson('m/u1-only')
    deliver()
    // in tab a: u1 signs out, u2 signs in and their progress arrives; tab b hears none of it yet
    a.progress.clearLocal()
    a.progress.claim('u2')
    a.progress.mergeRemote(crdt.markLesson(crdt.empty(), 'm/u2-only', true, Date.now()), 'u2')
    b.progress.markLesson('m/clicked-in-b')
    expect(lessons(b.progress)).toEqual(['m/clicked-in-b', 'm/u2-only'])
    expect(b.progress.owner()).toBe('u2')
    deliver()
    expect(lessons(a.progress)).toEqual(['m/clicked-in-b', 'm/u2-only'])
  })
})

describe('what account sync uses', () => {
  it("claim() makes a visitor's progress the person's, and clears someone else's first", async () => {
    const { progress, origins } = await openTab()
    progress.markLesson('m/visitor')
    progress.claim('u1')
    expect(progress.owner()).toBe('u1')
    expect(lessons(progress)).toEqual(['m/visitor'])
    expect(stored().owner).toBe('u1')
    progress.claim('u2')
    expect(progress.owner()).toBe('u2')
    expect(progress.get().lessons).toEqual({})
    expect(origins).toEqual(['local', 'clear'])
    const again = await openTab()
    expect(again.progress.owner()).toBe('u2')
  })

  it("claim() keeps a visitor's Reset to this browser: it never reaches the account the copy becomes", async () => {
    const { progress } = await openTab()
    progress.markLesson('m/before')
    progress.reset() // signed out: "Erase ... from this browser?"
    progress.markLesson('m/after')
    const shown = progress.get()
    expect(stored().resetAt).toBeGreaterThan(0)
    progress.claim('u1')
    expect(progress.owner()).toBe('u1')
    expect(stored()).toMatchObject({ owner: 'u1', resetAt: 0 })
    expect(progress.getSync().resetAt).toBe(0)
    expect(progress.get()).toEqual(shown)
    expect(lessons(progress)).toEqual(['m/after'])
    // the account's own progress from before the visitor's Reset isn't hidden by it
    const old = crdt.markLesson(crdt.empty(), 'm/older', true, Date.now() - 60_000)
    progress.mergeRemote(old, 'u1')
    expect(lessons(progress)).toEqual(['m/after', 'm/older'])
    // a Reset made while signed in is the person's: it stays, to be saved to the account
    progress.reset()
    expect(stored().resetAt).toBeGreaterThan(0)
    progress.claim('u1')
    expect(stored().resetAt).toBeGreaterThan(0)
  })

  it("mergeRemote() joins the person's account copy in, announcing it only when something changed", async () => {
    const { progress, origins } = await openTab()
    progress.claim('u1')
    progress.markLesson('m/here')
    const remote = crdt.markLesson(crdt.empty(), 'm/there', true, Date.now())
    progress.mergeRemote(remote, 'u1')
    progress.mergeRemote(remote, 'u1')
    expect(lessons(progress)).toEqual(['m/here', 'm/there'])
    expect(origins).toEqual(['local', 'remote'])
    progress.mergeRemote(crdt.markLesson(crdt.empty(), 'm/other-person', true, Date.now()), 'u2')
    expect(lessons(progress)).toEqual(['m/here', 'm/there'])
    expect(Object.keys(stored().lessons).sort()).toEqual(['m/here', 'm/there'])
  })
})
