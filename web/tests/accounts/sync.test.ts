/*
  The progress sync engine, driven with a fake account backend and the real progress store.
  Run: npx vitest run tests/accounts
*/
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { progress, SYNCED_KEY, type ProgressState } from '../../src/lib/progress'
import type { AccountsAdapter, ProgressSnapshot } from '../../src/lib/accounts/adapter'
import { LOAD_ERROR, SYNC_ERROR } from '../../src/lib/accounts/errors'
import { createProgressSync, decideInitial, decideSnapshot, sameProgress, type ProgressSync, type SyncStatus } from '../../src/lib/accounts/sync'

const D1 = '2026-03-01T00:00:00.000Z'
const D2 = '2026-03-02T00:00:00.000Z'
const state = (p: Partial<ProgressState> = {}): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [], ...p })

type SyncAdapter = Pick<AccountsAdapter, 'readProgress' | 'watchProgress' | 'writeProgress' | 'writeProgressOnExit' | 'clearProgress' | 'confirmUser'>

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

/** An in-memory account copy with a listener we can fire by hand. Like the real rules, a save must carry the next revision. */
class FakeBackend implements SyncAdapter {
  remote: ProgressState | null = null
  rev = 0
  writes: ProgressState[] = []
  /** whose account each write went to */
  writeUids: string[] = []
  /** "Delete my saved progress" calls that emptied the account copy */
  clears = 0
  /** the next clear fails */
  failClear = false
  /** the next N writes fail */
  failWrites = 0
  readFails = false
  /** when set, writes wait for release() */
  holdWrites = false
  /** when set, each saved write comes back from the listener once more, the way Firestore confirms it */
  echoWrites = false
  /** the account was deleted (on another device): confirmUser rejects */
  userGone = false
  confirmUser = vi.fn(async () => {
    if (this.userGone) throw Object.assign(new Error('account gone'), { code: 'auth/user-token-expired' })
  })
  /** the save sent while the page closes (a spy): reports all of it as sent */
  writeProgressOnExit = vi.fn((_uid: string, s: ProgressState, _rev: number, _base: ProgressState): ProgressState | null => clone(s))
  private held: (() => void)[] = []
  private watchers = new Set<(s: ProgressSnapshot) => void>()

  async readProgress() {
    if (this.readFails) throw new Error('offline')
    return { data: this.remote === null ? null : clone(this.remote), rev: this.rev }
  }
  watchProgress(_uid: string, cb: (s: ProgressSnapshot) => void) {
    this.watchers.add(cb)
    return () => {
      this.watchers.delete(cb)
    }
  }
  async writeProgress(uid: string, s: ProgressState, rev: number) {
    if (this.holdWrites) await new Promise<void>((r) => this.held.push(r))
    if (this.failWrites > 0) {
      this.failWrites--
      throw new Error('unavailable')
    }
    if (rev !== this.rev + 1) throw Object.assign(new Error('out-of-date copy'), { code: 'permission-denied' })
    const copy: ProgressState = clone(s)
    this.writes.push(copy)
    this.writeUids.push(uid)
    this.remote = clone(s)
    this.rev = rev
    // the confirmation shows what this write saved (even if a later write has landed since)
    if (this.echoWrites) setTimeout(() => this.deliver(copy, rev, false, false), 0)
  }
  async clearProgress() {
    if (this.failClear) throw Object.assign(new Error('offline'), { code: 'unavailable' })
    if (this.remote === null) return 0
    this.clears++
    this.remote = state()
    this.rev++
    return this.rev
  }
  release() {
    this.holdWrites = false
    this.held.splice(0).forEach((r) => r())
  }
  /** lets the oldest held write go on, keeping later ones held */
  releaseOne() {
    this.held.shift()?.()
  }
  /** a change saved on "another device", delivered at once (or, with fromCache, what the device holds while the server can't be reached) */
  push(remote: ProgressState | null, hasPendingWrites = false, fromCache = false) {
    if (!hasPendingWrites && !fromCache) this.saveElsewhere(remote)
    this.deliver(remote, this.rev, hasPendingWrites, fromCache)
  }
  /** a change saved on "another device" that this one hasn't heard about yet */
  saveElsewhere(remote: ProgressState | null) {
    this.remote = remote === null ? null : clone(remote)
    this.rev = remote === null ? 0 : this.rev + 1
  }
  /** the account copy as it is, delivered (again) */
  redeliver() {
    this.deliver(this.remote, this.rev, false, false)
  }
  private deliver(remote: ProgressState | null, rev: number, hasPendingWrites: boolean, fromCache: boolean) {
    const data = remote === null ? null : clone(remote)
    this.watchers.forEach((cb) => cb({ data, rev, hasPendingWrites, fromCache }))
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
    backend.saveElsewhere(state({ lessons: { 'm/a': D1 } }))
    await sync.start('u1')
    backend.redeliver() // the listener's first delivery
    progress.markLesson('m/a', false)
    backend.redeliver() // delivered again (say, on reconnecting) before the un-tick is saved
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
    backend.saveElsewhere(state({ lessons: { 'm/x': D1 } }))
    await sync.start('u1')
    window.dispatchEvent(new Event('pagehide'))
    expect(backend.writeProgressOnExit).not.toHaveBeenCalled() // nothing unsaved
    progress.markLesson('m/a')
    window.dispatchEvent(new Event('pagehide')) // before the 1.5 s wait is up
    expect(backend.writeProgressOnExit).toHaveBeenCalledTimes(1)
    // the next revision, and the account copy it builds on (so only what changed since needs sending)
    expect(backend.writeProgressOnExit).toHaveBeenCalledWith('u1', progress.get(), 2, state({ lessons: { 'm/x': D1 } }))
  })

  it('the save sent on close builds on the last confirmed copy, not on a save still in flight (which may yet be refused)', async () => {
    backend.saveElsewhere(state({ lessons: { 'm/a': D1 } }))
    await sync.start('u1')
    backend.holdWrites = true
    progress.markLesson('m/b')
    await tick(1500) // the save of a and b (revision 2) is in flight
    progress.markLesson('m/c')
    window.dispatchEvent(new Event('pagehide'))
    const [, sent, rev, base] = backend.writeProgressOnExit.mock.calls[0]
    expect(rev).toBe(2)
    expect(Object.keys(base.lessons).sort()).toEqual(['m/a'])
    expect(Object.keys(sent.lessons).sort()).toEqual(['m/a', 'm/b', 'm/c'])
    backend.release()
  })

  it('never creates the account copy with the save sent on close (the account may have been deleted elsewhere)', async () => {
    await sync.start('u1') // a new account: no copy yet
    progress.markLesson('m/a')
    window.dispatchEvent(new Event('pagehide'))
    expect(backend.writeProgressOnExit).not.toHaveBeenCalled()
    await tick()
    expect(backend.confirmUser).toHaveBeenCalledTimes(1) // the normal save checks first
    expect(backend.rev).toBe(1)
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

  it('deleteRemote() empties the account copy (as the next revision) and this browser without writing it back', async () => {
    backend.saveElsewhere(state({ lessons: { a: D1 } }))
    await sync.start('u1')
    progress.markLesson('m/b')
    await sync.deleteRemote()
    await tick(5000)
    expect(backend.clears).toBe(1)
    expect(backend.remote).toEqual(state())
    expect(backend.rev).toBe(2) // revision numbers never start again
    expect(backend.writes).toHaveLength(0)
    expect(progress.get()).toEqual(state())
    // the next change is saved on top of the empty copy
    progress.markLesson('m/c')
    await tick(1500)
    expect(backend.rev).toBe(3)
    expect(Object.keys(backend.remote!.lessons)).toEqual(['m/c'])
  })

  it('deleteRemote() that fails changes nothing, and saves what was waiting', async () => {
    backend.saveElsewhere(state({ lessons: { a: D1 } }))
    await sync.start('u1')
    progress.markLesson('m/b')
    backend.failClear = true
    await expect(sync.deleteRemote()).rejects.toThrow()
    expect(Object.keys(progress.get().lessons).sort()).toEqual(['a', 'm/b'])
    await tick(1500)
    expect(Object.keys(backend.remote!.lessons).sort()).toEqual(['a', 'm/b'])
  })

  it('deleteRemote() before the account copy has loaded is refused (nothing is deleted)', async () => {
    backend.readFails = true
    await sync.start('u1')
    await expect(sync.deleteRemote()).rejects.toThrow()
    expect(backend.clears).toBe(0)
  })
})

/** What this browser has noted as the account copy its progress builds on. */
const note = () => JSON.parse(localStorage.getItem('noai-prep:' + SYNCED_KEY) ?? 'null')
const setNote = (uid: string, data: ProgressState) => localStorage.setItem('noai-prep:' + SYNCED_KEY, JSON.stringify({ uid, data }))

describe('saves based on an out-of-date copy', () => {
  it('a refused save is merged with the newer copy and saved again: nothing is lost on either device', async () => {
    backend.saveElsewhere(state({ lessons: { 'm/shared': D1 } }))
    await sync.start('u1')
    progress.markLesson('m/here')
    // another device saves before this one does, and its copy hasn't arrived here yet
    backend.saveElsewhere(state({ lessons: { 'm/shared': D1, 'm/there': D2 } }))
    await tick(1500)
    expect(backend.writes).toHaveLength(0) // refused: it was based on revision 1, and the account is at 2
    expect(status.error).toBeNull() // (most likely just this: nothing to worry the person about yet)
    backend.redeliver() // the newer copy arrives
    await tick(1500)
    expect(Object.keys(backend.remote!.lessons).sort()).toEqual(['m/here', 'm/shared', 'm/there'])
    expect(backend.rev).toBe(3)
    expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/here', 'm/shared', 'm/there'])
    expect(status.error).toBeNull()
  })

  it('tries again by itself if the newer copy is slow to arrive, and shows the error if that is refused too', async () => {
    await sync.start('u1')
    progress.markLesson('m/here')
    backend.saveElsewhere(state({ lessons: { 'm/there': D1 } }))
    await tick(1500) // refused once: quietly tries again
    expect(status.error).toBeNull()
    await tick(1500) // refused again (the newer copy still hasn't arrived)
    expect(status.error).toBe(SYNC_ERROR)
    backend.redeliver()
    await tick(1500)
    expect(Object.keys(backend.remote!.lessons).sort()).toEqual(['m/here', 'm/there'])
    expect(status.error).toBeNull()
  })
})

describe('the account copy this browser builds on (changes made on another device stay made)', () => {
  it('notes the account copy for the next visit as it syncs', async () => {
    backend.saveElsewhere(state({ lessons: { 'm/a': D1 } }))
    await sync.start('u1')
    expect(note()).toMatchObject({ uid: 'u1', data: state({ lessons: { 'm/a': D1 } }) })
    progress.markLesson('m/b')
    await tick(1500)
    expect(Object.keys(note().data.lessons).sort()).toEqual(['m/a', 'm/b'])
    backend.push(state({ lessons: { 'm/b': D2 } }))
    expect(note().data).toEqual(state({ lessons: { 'm/b': D2 } }))
  })

  it('a Reset on another device stays reset when this browser comes back', async () => {
    progress.replace(state({ lessons: { 'm/a': D1, 'm/b': D1 } }), 'remote')
    setNote('u1', state({ lessons: { 'm/a': D1, 'm/b': D1 } })) // what this browser last synced
    backend.saveElsewhere(state()) // Reset on the phone since
    await sync.start('u1')
    expect(backend.writes).toHaveLength(0)
    expect(backend.remote).toEqual(state())
    expect(progress.get()).toEqual(state())
  })

  it('"Delete my saved progress" on another device stays deleted when this browser comes back', async () => {
    progress.replace(state({ lessons: { 'm/a': D1 }, answers: { q1: [true] } }), 'remote')
    setNote('u1', state({ lessons: { 'm/a': D1 }, answers: { q1: [true] } }))
    await sync.start('u1') // no account copy
    expect(backend.writes).toHaveLength(0)
    expect(backend.remote).toBeNull()
    expect(progress.get()).toEqual(state())
  })

  it('an un-tick on another device stays un-ticked when this browser comes back', async () => {
    progress.replace(state({ lessons: { 'm/a': D1, 'm/b': D1 } }), 'remote')
    setNote('u1', state({ lessons: { 'm/a': D1, 'm/b': D1 } }))
    backend.saveElsewhere(state({ lessons: { 'm/a': D1 } }))
    await sync.start('u1')
    expect(backend.writes).toHaveLength(0)
    expect(progress.get().lessons).toEqual({ 'm/a': D1 })
  })

  it("changes made here that never reached the account (the page closed first) still do, un-ticks too", async () => {
    // synced {a, b}; then, unsaved: b un-ticked and c ticked here. Meanwhile the phone ticked d.
    progress.replace(state({ lessons: { 'm/a': D1, 'm/c': D2 }, answers: { q1: [true, false] } }), 'remote')
    setNote('u1', state({ lessons: { 'm/a': D1, 'm/b': D1 }, answers: { q1: [true] } }))
    backend.saveElsewhere(state({ lessons: { 'm/a': D1, 'm/b': D1, 'm/d': D2 }, answers: { q1: [true], q2: [false] } }))
    await sync.start('u1')
    expect(Object.keys(backend.remote!.lessons).sort()).toEqual(['m/a', 'm/c', 'm/d'])
    expect(backend.remote!.answers).toEqual({ q1: [true, false], q2: [false] })
    expect(progress.get()).toEqual(backend.remote)
  })

  it("ignores a note made for someone else (that progress is combined, as before signing in)", async () => {
    progress.replace(state({ lessons: { 'm/a': D1 } }), 'remote')
    setNote('someone-else', state({ lessons: { 'm/a': D1 } }))
    await sync.start('u1')
    expect(backend.remote?.lessons).toEqual({ 'm/a': D1 })
  })

  it('a Reset made on another device while a change here waits to be saved stays reset (only the change is added)', async () => {
    backend.saveElsewhere(state({ lessons: { 'm/a': D1, 'm/b': D1 } }))
    await sync.start('u1')
    progress.markLesson('m/c')
    backend.push(state()) // Reset on the phone, within the 1.5 s wait
    await tick(1500)
    expect(Object.keys(backend.remote!.lessons)).toEqual(['m/c'])
    expect(Object.keys(progress.get().lessons)).toEqual(['m/c'])
  })
})

describe('one sign-in after another on the same page', () => {
  it("a save left hanging by the previous person doesn't hold up the next person's", async () => {
    await sync.start('u1')
    backend.holdWrites = true // u1's connection drops: this save never settles
    progress.markLesson('m/person-1')
    await tick(1500)
    void sync.stop() // u1 signs out (the store doesn't wait for it)
    progress.clearLocal()
    backend.holdWrites = false
    await sync.start('u2')
    progress.markLesson('m/person-2')
    await tick(1500)
    expect(backend.writeUids).toEqual(['u2'])
    expect(backend.writes[0].lessons).toEqual({ 'm/person-2': expect.any(String) })
    expect(status.syncing).toBe(false)
    await sync.deleteRemote() // doesn't wait on u1's hung save either
    expect(backend.clears).toBe(1)
  })
})

describe('whether anything is unsaved (signing out would lose it)', () => {
  it('is false when everything is saved, true while a change waits or a save failed', async () => {
    await sync.start('u1')
    expect(sync.hasUnsaved()).toBe(false)
    progress.markLesson('m/a')
    expect(sync.hasUnsaved()).toBe(true)
    await tick(1500)
    expect(sync.hasUnsaved()).toBe(false)
    backend.failWrites = 1
    progress.markLesson('m/b')
    await tick(1500)
    expect(status.error).toBe(SYNC_ERROR)
    expect(sync.hasUnsaved()).toBe(true)
  })

  it("before the first merge: true for progress the account can't be known to have", async () => {
    backend.readFails = true
    progress.markLesson('m/a') // made before signing in, never merged
    await sync.start('u1')
    expect(sync.hasUnsaved()).toBe(true)
    await sync.stop()
    // the same copy this browser last synced with the account: nothing to lose
    setNote('u1', progress.get())
    await sync.start('u1')
    expect(sync.hasUnsaved()).toBe(false)
  })
})

describe('the account copy deleted on another device', () => {
  it('checks the account still exists before saving again, and saves nothing if it is gone', async () => {
    backend.saveElsewhere(state({ lessons: { 'm/a': D1 } }))
    await sync.start('u1')
    backend.push(null) // deleted elsewhere
    expect(backend.confirmUser).toHaveBeenCalledTimes(1)
    backend.userGone = true // it was the whole account
    progress.markLesson('m/b')
    window.dispatchEvent(new Event('pagehide'))
    expect(backend.writeProgressOnExit).not.toHaveBeenCalled()
    await tick(1500)
    expect(backend.writes).toHaveLength(0)
    expect(backend.remote).toBeNull()
  })

  it('after "Delete my saved progress" elsewhere (the account still exists), saves new progress as a new copy', async () => {
    backend.saveElsewhere(state({ lessons: { 'm/a': D1 } }))
    await sync.start('u1')
    backend.push(null)
    progress.markLesson('m/b')
    await tick(1500)
    expect(backend.confirmUser).toHaveBeenCalledTimes(2)
    expect(backend.rev).toBe(1)
    expect(Object.keys(backend.remote!.lessons)).toEqual(['m/b'])
  })
})

describe('more regressions', () => {
  it("a save that was only built on an out-of-date copy isn't shown as an error, even twice in a row", async () => {
    backend.saveElsewhere(state({ lessons: { 'm/a': D1 } }))
    await sync.start('u1')
    backend.holdWrites = true
    progress.markLesson('m/b')
    await tick(1500) // its save (revision 2) is on its way...
    backend.saveElsewhere(state({ lessons: { 'm/a': D1, 'm/x': D2 } })) // ...and another device's lands first
    progress.reset() // Reset: its save waits behind the first, and is built on revision 1 too
    backend.releaseOne() // the first is refused
    await tick()
    backend.redeliver() // the other device's copy arrives while the Reset's save is on its way
    backend.release() // refused as well
    await tick()
    expect(status.error).toBeNull()
    await tick(5000)
    expect(status.error).toBeNull()
    expect(backend.remote).toEqual(state({ lessons: { 'm/x': D2 } })) // the Reset, and what the other device added
  })

  it("keeps and saves progress another signed-in tab saved to this browser but not to the account", async () => {
    backend.saveElsewhere(state({ lessons: { 'm/a': D1 } }))
    await sync.start('u1')
    // another tab, offline, ticks a lesson and is closed: only this browser's copy has it
    localStorage.setItem('noai-prep:progress-v1', JSON.stringify(state({ lessons: { 'm/a': D1, 'm/other-tab': D2 } })))
    backend.push(state({ lessons: { 'm/a': D1, 'm/phone': D2 } })) // this tab applies an account copy
    expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/a', 'm/other-tab', 'm/phone'])
    await tick(1500)
    expect(Object.keys(backend.remote!.lessons).sort()).toEqual(['m/a', 'm/other-tab', 'm/phone'])
  })

  it('starting to sync, a tab first takes in what another tab saved, so its copy matches the note it builds on', async () => {
    progress.replace(state({ lessons: { 'm/a': D1 } }), 'remote')
    // meanwhile another tab synced: it saved the account copy (with the phone's lesson) here, and noted it
    localStorage.setItem('noai-prep:progress-v1', JSON.stringify(state({ lessons: { 'm/a': D1, 'm/phone': D2 } })))
    setNote('u1', state({ lessons: { 'm/a': D1, 'm/phone': D2 } }))
    backend.saveElsewhere(state({ lessons: { 'm/a': D1, 'm/phone': D2 } }))
    await sync.start('u1')
    expect(backend.writes).toHaveLength(0)
    expect(Object.keys(backend.remote!.lessons).sort()).toEqual(['m/a', 'm/phone'])
    expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/a', 'm/phone'])
  })

  it('a save sent as the page closed that landed is the base next time (an un-tick before the first merge stays)', async () => {
    backend.saveElsewhere(state({ lessons: { 'm/a': D1 } }))
    // what the close-time save does: lands as the next revision
    backend.writeProgressOnExit.mockImplementation((_u, s, rev) => {
      backend.saveElsewhere(s)
      expect(backend.rev).toBe(rev)
      return clone(s)
    })
    await sync.start('u1')
    progress.markLesson('m/b')
    window.dispatchEvent(new Event('pagehide'))
    await sync.stop() // the page has gone before the normal save's reply (here: it never left)
    // the next visit: the student un-ticks b at once, before the first merge is done
    backend.readFails = true
    await sync.start('u1')
    progress.markLesson('m/b', false)
    backend.redeliver()
    await tick(1500)
    expect(Object.keys(backend.remote!.lessons)).toEqual(['m/a'])
  })
})
