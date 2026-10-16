/*
  The progress sync engine, driven with a fake account backend and the real progress store.
  Run: npx vitest run tests/accounts
*/
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { progress, type ProgressState } from '../../src/lib/progress'
import type { AccountsAdapter, ProgressSnapshot } from '../../src/lib/accounts/adapter'
import { LOAD_ERROR, SYNC_ERROR } from '../../src/lib/accounts/errors'
import { createProgressSync, decideInitial, decideSnapshot, sameProgress, type ProgressSync, type SyncStatus } from '../../src/lib/accounts/sync'

const D1 = '2026-03-01T00:00:00.000Z'
const D2 = '2026-03-02T00:00:00.000Z'
const state = (p: Partial<ProgressState> = {}): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [], ...p })

type SyncAdapter = Pick<AccountsAdapter, 'readProgress' | 'watchProgress' | 'writeProgress' | 'writeProgressOnExit' | 'deleteProgress'>

/** An in-memory account copy with a listener we can fire by hand. */
class FakeBackend implements SyncAdapter {
  remote: ProgressState | null = null
  writes: ProgressState[] = []
  deletes = 0
  /** the next N writes fail */
  failWrites = 0
  readFails = false
  /** when set, writes wait for release() */
  holdWrites = false
  /** when set, each saved write comes back from the listener once more, the way Firestore confirms it */
  echoWrites = false
  /** the save sent while the page closes (a spy) */
  writeProgressOnExit = vi.fn((_uid: string, _s: ProgressState) => true)
  private held: (() => void)[] = []
  private watchers = new Set<(s: ProgressSnapshot) => void>()

  async readProgress() {
    if (this.readFails) throw new Error('offline')
    return this.remote === null ? null : JSON.parse(JSON.stringify(this.remote))
  }
  watchProgress(_uid: string, cb: (s: ProgressSnapshot) => void) {
    this.watchers.add(cb)
    return () => {
      this.watchers.delete(cb)
    }
  }
  async writeProgress(_uid: string, s: ProgressState) {
    if (this.holdWrites) await new Promise<void>((r) => this.held.push(r))
    if (this.failWrites > 0) {
      this.failWrites--
      throw new Error('unavailable')
    }
    const copy: ProgressState = JSON.parse(JSON.stringify(s))
    this.writes.push(copy)
    this.remote = JSON.parse(JSON.stringify(s))
    // the confirmation shows what this write saved (even if a later write has landed since)
    if (this.echoWrites) setTimeout(() => this.deliver(copy, false, false), 0)
  }
  async deleteProgress() {
    this.deletes++
    this.remote = null
  }
  release() {
    this.holdWrites = false
    this.held.splice(0).forEach((r) => r())
  }
  /** lets the oldest held write go on, keeping later ones held */
  releaseOne() {
    this.held.shift()?.()
  }
  /** a change made on "another device" (or, with fromCache, what the device holds while the server can't be reached) */
  push(remote: ProgressState | null, hasPendingWrites = false, fromCache = false) {
    if (!hasPendingWrites && !fromCache) this.remote = remote
    this.deliver(remote, hasPendingWrites, fromCache)
  }
  private deliver(remote: ProgressState | null, hasPendingWrites: boolean, fromCache: boolean) {
    const data = remote === null ? null : JSON.parse(JSON.stringify(remote))
    this.watchers.forEach((cb) => cb({ data, hasPendingWrites, fromCache }))
  }
  get watching() {
    return this.watchers.size
  }
}

let backend: FakeBackend
let sync: ProgressSync
let status: SyncStatus

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  progress.clearLocal()
  backend = new FakeBackend()
  status = { syncing: false, lastSyncedAt: null, error: null }
  sync = createProgressSync({ adapter: backend, store: progress, onStatus: (p) => Object.assign(status, p) })
})

afterEach(async () => {
  await sync.stop()
  vi.useRealTimers()
})

/** lets pending promise callbacks run (and timers up to ms) */
const tick = (ms = 0) => vi.advanceTimersByTimeAsync(ms)

describe('pure decisions', () => {
  it('sameProgress ignores key order', () => {
    expect(sameProgress(state({ lessons: { a: D1, b: D2 } }), state({ lessons: { b: D2, a: D1 } }))).toBe(true)
    expect(sameProgress(state({ lessons: { a: D1 } }), state({ lessons: { a: D2 } }))).toBe(false)
  })

  it('decideInitial writes only when the account copy lacks something', () => {
    expect(decideInitial(state(), null).write).toBe(false)
    expect(decideInitial(state({ lessons: { a: D1 } }), null).write).toBe(true)
    expect(decideInitial(state({ lessons: { a: D1 } }), state({ lessons: { a: D1, b: D2 } }))).toEqual({
      state: state({ lessons: { a: D1, b: D2 } }),
      write: false,
    })
    expect(decideInitial(state({ lessons: { c: D1 } }), state({ lessons: { b: D2 } })).write).toBe(true)
  })

  it('decideSnapshot replaces when clean, merges when dirty, ignores pending writes', () => {
    const local = state({ lessons: { a: D1 } })
    const remote = state({ lessons: { b: D2 } })
    expect(decideSnapshot(local, { remote, hasPendingWrites: true }, false)).toEqual({ kind: 'ignore' })
    expect(decideSnapshot(local, { remote, hasPendingWrites: false }, false)).toEqual({ kind: 'replace', state: remote })
    expect(decideSnapshot(local, { remote: local, hasPendingWrites: false }, false)).toEqual({ kind: 'in-sync' })
    expect(decideSnapshot(local, { remote: null, hasPendingWrites: false }, false)).toEqual({ kind: 'replace', state: state() })
    expect(decideSnapshot(local, { remote, hasPendingWrites: false }, true)).toEqual({
      kind: 'merge',
      state: state({ lessons: { a: D1, b: D2 } }),
      write: true,
    })
    expect(decideSnapshot(local, { remote: state({ lessons: { a: D1, b: D2 } }), hasPendingWrites: false }, true)).toMatchObject({
      kind: 'merge',
      write: false,
    })
  })
})

describe('sign-in', () => {
  it('merges this browser into the account and writes the result when it differs', async () => {
    progress.markLesson('m/local')
    backend.remote = state({ lessons: { 'm/remote': D1 } })
    await sync.start('u1')
    expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/local', 'm/remote'])
    expect(backend.writes).toHaveLength(1)
    expect(Object.keys(backend.writes[0].lessons).sort()).toEqual(['m/local', 'm/remote'])
    expect(backend.watching).toBe(1)
    expect(status.lastSyncedAt).not.toBeNull()
  })

  it("doesn't write when the account already has everything", async () => {
    progress.replace(state({ lessons: { a: D1 } }), 'remote')
    backend.remote = state({ lessons: { a: D1, b: D2 }, checkpoints: { a: 1 } })
    await sync.start('u1')
    expect(backend.writes).toHaveLength(0)
    expect(sameProgress(progress.get(), backend.remote)).toBe(true)
  })

  it("doesn't create an account copy when there is nothing to save", async () => {
    await sync.start('u1')
    expect(backend.writes).toHaveLength(0)
  })

  it('keeps changes made while the account copy is being read', async () => {
    backend.remote = state({ lessons: { b: D2 } })
    const started = sync.start('u1')
    progress.markLesson('m/during')
    await started
    expect(Object.keys(progress.get().lessons).sort()).toEqual(['b', 'm/during'])
    expect(backend.writes).toHaveLength(1)
  })

  it('if the first read fails, merges with the first delivery instead of overwriting', async () => {
    progress.markLesson('m/local')
    backend.remote = state({ lessons: { 'm/remote': D1 } })
    backend.readFails = true
    await sync.start('u1')
    expect(status.error).toBe(LOAD_ERROR)
    backend.push(backend.remote)
    await tick()
    expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/local', 'm/remote'])
    expect(backend.writes).toHaveLength(1)
    expect(status.error).toBeNull()
  })

  it("if the server can't be reached, waits for the account copy instead of overwriting it with this browser's", async () => {
    progress.markLesson('m/local')
    backend.remote = state({ lessons: { 'm/a': D1, 'm/b': D2 }, checkpoints: { 'm/a': 0.9 } })
    const onServer = backend.remote
    backend.readFails = true
    await sync.start('u1')
    // offline: the listener reports the (empty) cache, which says nothing about the account copy
    backend.push(null, false, true)
    await tick(5000)
    expect(backend.writes).toHaveLength(0)
    expect(Object.keys(progress.get().lessons)).toEqual(['m/local'])
    // back online: the server's answer is merged in
    backend.push(onServer)
    await tick()
    expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/a', 'm/b', 'm/local'])
    expect(backend.writes).toHaveLength(1)
    expect(Object.keys(backend.writes[0].lessons).sort()).toEqual(['m/a', 'm/b', 'm/local'])
    expect(backend.writes[0].checkpoints).toEqual({ 'm/a': 0.9 })
  })
})

describe('live updates from the account', () => {
  it('takes the account copy as it is when nothing is unsaved here (so an un-tick elsewhere shows up)', async () => {
    backend.remote = state({ lessons: { a: D1, b: D2 } })
    await sync.start('u1')
    backend.push(state({ lessons: { a: D1 } }))
    expect(progress.get().lessons).toEqual({ a: D1 })
    backend.push(null) // deleted on another device
    expect(progress.get()).toEqual(state())
    expect(backend.writes).toHaveLength(0)
  })

  it('merges instead when there are unsaved changes here, then saves', async () => {
    await sync.start('u1')
    progress.markLesson('m/mine')
    backend.push(state({ lessons: { 'm/theirs': D1 } }))
    expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/mine', 'm/theirs'])
    await tick(1500)
    expect(backend.writes).toHaveLength(1)
    expect(Object.keys(backend.writes[0].lessons).sort()).toEqual(['m/mine', 'm/theirs'])
  })

  it('ignores the echo of its own unsent write', async () => {
    progress.markLesson('m/a')
    await sync.start('u1')
    backend.push(state({ lessons: { other: D1 } }), true)
    expect(Object.keys(progress.get().lessons)).toEqual(['m/a'])
  })

  it("an un-tick made while the tick's save is in flight stays un-ticked when that save is confirmed", async () => {
    backend.echoWrites = true
    await sync.start('u1')
    backend.holdWrites = true
    progress.markLesson('m/a')
    await tick(1500) // the tick's save is now in flight
    progress.markLesson('m/a', false)
    backend.release()
    await tick() // the save's confirmation arrives
    expect(progress.get().lessons).toEqual({})
    await tick(1500)
    expect(progress.get().lessons).toEqual({})
    expect(backend.remote?.lessons).toEqual({})
  })

  it('Reset pressed while a save is in flight stays reset', async () => {
    backend.echoWrites = true
    await sync.start('u1')
    backend.holdWrites = true
    progress.markLesson('m/a')
    progress.markLesson('m/b')
    await tick(1500) // the save of a and b is in flight
    progress.reset() // its save waits behind that one
    backend.releaseOne()
    await tick() // the first save's confirmation arrives while the Reset's save is in flight
    expect(progress.get()).toEqual(state())
    backend.release()
    await tick(5000)
    expect(progress.get()).toEqual(state())
    expect(backend.remote).toEqual(state())
  })

  it('a repeat of the account copy it has already seen is not merged back in', async () => {
    backend.remote = state({ lessons: { 'm/a': D1 } })
    await sync.start('u1')
    backend.push(backend.remote) // the listener's first delivery
    progress.markLesson('m/a', false)
    backend.push(state({ lessons: { 'm/a': D1 } })) // delivered again (say, on reconnecting) before the un-tick is saved
    expect(progress.get().lessons).toEqual({})
    await tick(1500)
    expect(backend.remote?.lessons).toEqual({})
  })

  it('never writes back what it has just applied from the account', async () => {
    await sync.start('u1')
    backend.push(state({ lessons: { a: D1 } }))
    await tick(5000)
    expect(backend.writes).toHaveLength(0)
    expect(status.syncing).toBe(false)
  })
})

describe('saving changes', () => {
  it('waits 1.5 s after the last change, so a burst of changes is one write', async () => {
    await sync.start('u1')
    progress.markLesson('m/a')
    await tick(1000)
    progress.recordAnswer('q1', true)
    await tick(1000)
    progress.recordCheckpoint('m/a', 0.5)
    expect(status.syncing).toBe(true)
    await tick(1499)
    expect(backend.writes).toHaveLength(0)
    await tick(1)
    expect(backend.writes).toHaveLength(1)
    expect(backend.writes[0]).toMatchObject({ answers: { q1: [true] }, checkpoints: { 'm/a': 0.5 } })
    expect(status.syncing).toBe(false)
    expect(status.lastSyncedAt).not.toBeNull()
  })

  it('writes Reset at once', async () => {
    backend.remote = state({ lessons: { a: D1 } })
    await sync.start('u1')
    progress.reset()
    await tick()
    expect(backend.writes).toEqual([state()])
  })

  it('saves straight away when the tab is hidden', async () => {
    await sync.start('u1')
    progress.markLesson('m/a')
    window.dispatchEvent(new Event('pagehide'))
    await tick()
    expect(backend.writes).toHaveLength(1)
  })

  it('also sends a save that outlives the page when it closes with unsaved changes', async () => {
    await sync.start('u1')
    window.dispatchEvent(new Event('pagehide'))
    expect(backend.writeProgressOnExit).not.toHaveBeenCalled() // nothing unsaved
    progress.markLesson('m/a')
    window.dispatchEvent(new Event('pagehide')) // before the 1.5 s wait is up
    expect(backend.writeProgressOnExit).toHaveBeenCalledTimes(1)
    expect(backend.writeProgressOnExit).toHaveBeenCalledWith('u1', progress.get())
  })

  it('a failed save shows the error, keeps the change, and tries again on the next change', async () => {
    await sync.start('u1')
    backend.failWrites = 1
    progress.markLesson('m/a')
    await tick(1500)
    expect(status.error).toBe(SYNC_ERROR)
    expect(backend.writes).toHaveLength(0)
    expect(progress.get().lessons['m/a']).toBeDefined()
    progress.markLesson('m/b')
    await tick(1500)
    expect(backend.writes).toHaveLength(1)
    expect(Object.keys(backend.writes[0].lessons).sort()).toEqual(['m/a', 'm/b'])
    expect(status.error).toBeNull()
  })

  it('a change made while a save is in flight gets its own save', async () => {
    await sync.start('u1')
    backend.holdWrites = true
    progress.markLesson('m/a')
    await tick(1500)
    progress.markLesson('m/b')
    backend.release()
    await tick(1500)
    expect(backend.writes.map((w) => Object.keys(w.lessons).sort())).toEqual([['m/a'], ['m/a', 'm/b']])
  })
})

describe('stopping and deleting', () => {
  it('stop({ flush }) saves waiting changes first, then stops listening', async () => {
    await sync.start('u1')
    progress.markLesson('m/a')
    await sync.stop({ flush: true })
    expect(backend.writes).toHaveLength(1)
    expect(backend.watching).toBe(0)
    progress.markLesson('m/b')
    backend.push(state({ lessons: { x: D1 } }))
    await tick(5000)
    expect(backend.writes).toHaveLength(1)
    expect(progress.get().lessons.x).toBeUndefined()
  })

  it('stop() without flush drops waiting changes', async () => {
    await sync.start('u1')
    progress.markLesson('m/a')
    await sync.stop()
    await tick(5000)
    expect(backend.writes).toHaveLength(0)
  })

  it('deleteRemote() deletes the account copy and empties this browser without writing it back', async () => {
    backend.remote = state({ lessons: { a: D1 } })
    await sync.start('u1')
    progress.markLesson('m/b')
    await sync.deleteRemote()
    await tick(5000)
    expect(backend.deletes).toBe(1)
    expect(backend.remote).toBeNull()
    expect(backend.writes).toHaveLength(0)
    expect(progress.get()).toEqual(state())
  })
})
