/*
  The progress sync engine (src/lib/accounts/sync.ts) with the real progress store and a fake account backend that
  enforces the rules' revisions (a new copy is revision 1, every save the next one, anything else is refused). The
  backend can go offline (saves then wait, as Firestore's do), hold or lose the replies to saves, refuse or fail them,
  and hold listener deliveries to hand them over late or out of order. Fake timers.
  Run: npx vitest run tests/accounts/sync.test.ts
*/
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { progress } from '../../src/lib/progress'
import * as crdt from '../../src/lib/progress-crdt'
import type { SyncState } from '../../src/lib/progress-crdt'
import type { ProgressSnapshot, RemoteProgress } from '../../src/lib/accounts/adapter'
import { LOAD_ERROR, SYNC_ERROR } from '../../src/lib/accounts/errors'
import { createProgressSync, DELETE_WAIT_MS, GONE_WAIT_MS, TAB_DELAY_MS, type ProgressSync, type SyncOptions, type SyncStatus } from '../../src/lib/accounts/sync'

type Doc = { state: SyncState; rev: number }
type SyncAdapter = SyncOptions['adapter']
const error = (code: string) => Object.assign(new Error(code), { code })
const keys = (s: SyncState | undefined) => Object.keys(s ? crdt.project(s).lessons : {}).sort()

/** The account copies, with the rules' revision check, and one device's connection to them. */
class FakeBackend implements SyncAdapter {
  docs = new Map<string, Doc>()
  online = true
  /** saves the server accepted, in order */
  saved: (Doc & { uid: string })[] = []
  refusals = 0
  reads = 0
  /** the next N saves fail (not a refusal: say, the service is unavailable) */
  failWrites = 0
  /** the next N saves are refused whatever their revision (as if another rule refused them) */
  refuseWrites = 0
  /** saves land at once, but their replies wait for releaseReplies() (or are lost if the connection drops first) */
  holdReplies = false
  /** listener deliveries wait for deliver() */
  holdSnapshots = false
  /** the account was deleted on another device */
  userGone = false
  exitSaves: { uid: string; state: SyncState; rev: number; base: SyncState }[] = []
  exitResult = true
  confirmUser = vi.fn(async () => {
    if (this.userGone) throw error('auth/user-token-expired')
  })
  /** what happens once back online: saves waiting for the connection, and saves sent again */
  private waiting: (() => void)[] = []
  private replies: { send: () => void; resend: () => void }[] = []
  private snapshots: ProgressSnapshot[] = []
  private watchers = new Map<string, Set<(s: ProgressSnapshot) => void>>()

  doc(uid = 'u1') {
    return this.docs.get(uid)
  }
  private copy(uid: string): RemoteProgress {
    const d = this.docs.get(uid)
    return d ? { state: crdt.normalize(JSON.parse(crdt.encode(d.state))), rev: d.rev } : { state: null, rev: 0 }
  }
  /** what the listener reports now (or, held, later) */
  private announce(uid: string) {
    if (!this.online) return
    for (const cb of this.watchers.get(uid) ?? []) {
      const snap = { ...this.copy(uid), hasPendingWrites: false, fromCache: false }
      if (this.holdSnapshots) this.snapshots.push(snap)
      else setTimeout(() => cb(snap), 0)
    }
  }
  /** hands over held deliveries (newest first, with `reverse`) */
  deliver({ reverse = false } = {}) {
    const snaps = reverse ? this.snapshots.reverse() : this.snapshots
    this.snapshots = []
    for (const s of snaps) for (const cb of this.watchers.get('u1') ?? []) cb(s)
  }
  /** another device saves (it built on the latest copy) */
  elsewhere(change: (s: SyncState) => SyncState, uid = 'u1') {
    const d = this.docs.get(uid)
    this.docs.set(uid, { state: change(d?.state ?? crdt.empty()), rev: (d?.rev ?? 0) + 1 })
    this.announce(uid)
  }
  /** the copy is deleted (with the account, on another device) */
  remove(uid = 'u1') {
    this.docs.delete(uid)
    this.announce(uid)
  }
  goOffline() {
    this.online = false
    // replies on their way are lost; Firestore sends those saves again once back online
    for (const r of this.replies.splice(0)) this.waiting.push(r.resend)
  }
  goOnline() {
    this.online = true
    for (const w of this.waiting.splice(0)) w()
    for (const uid of this.watchers.keys()) this.announce(uid)
  }
  releaseReplies() {
    this.holdReplies = false
    for (const r of this.replies.splice(0)) r.send()
  }

  async readProgress(uid: string) {
    this.reads++
    if (!this.online) throw error('unavailable')
    return this.copy(uid)
  }
  watchProgress(uid: string, cb: (s: ProgressSnapshot) => void) {
    if (!this.watchers.has(uid)) this.watchers.set(uid, new Set())
    this.watchers.get(uid)!.add(cb)
    if (this.online) {
      const snap = { ...this.copy(uid), hasPendingWrites: false, fromCache: false }
      if (this.holdSnapshots) this.snapshots.push(snap)
      else setTimeout(() => cb(snap), 0)
    } else setTimeout(() => cb({ state: null, rev: 0, hasPendingWrites: false, fromCache: true }), 0)
    return () => {
      this.watchers.get(uid)!.delete(cb)
    }
  }
  writeProgress(uid: string, state: SyncState, rev: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const reply = (e?: unknown) => (e ? reject(e) : resolve())
      if (!this.online) this.waiting.push(() => this.process(uid, state, rev, reply))
      else this.process(uid, state, rev, reply)
    })
  }
  private process(uid: string, state: SyncState, rev: number, reply: (e?: unknown) => void) {
    if (this.failWrites > 0) {
      this.failWrites--
      return void setTimeout(() => reply(error('unavailable')), 0)
    }
    const stored = this.docs.get(uid)?.rev ?? 0
    if (this.refuseWrites > 0 || rev !== stored + 1) {
      if (this.refuseWrites > 0) this.refuseWrites--
      this.refusals++
      return void setTimeout(() => reply(error('permission-denied')), 0)
    }
    this.docs.set(uid, { state, rev })
    this.saved.push({ uid, state, rev })
    this.announce(uid)
    // the same save sent again after a lost reply: by then its revision is taken, so it is refused
    const resend = () => this.process(uid, state, rev, reply)
    if (this.holdReplies) this.replies.push({ send: () => reply(), resend })
    else setTimeout(() => reply(), 0)
  }
  writeProgressOnExit = vi.fn((uid: string, state: SyncState, rev: number, base: SyncState) => {
    this.exitSaves.push({ uid, state, rev, base })
    return this.exitResult
  })
}

let backend: FakeBackend
let sync: ProgressSync
let status: SyncStatus
/**
 * Moves the clock on by ms, then a few ms more so that whatever that set off (replies, deliveries, saves after them)
 * runs too. (Fake timers give a 0 ms timer set while timers run 1 ms.)
 */
async function tick(ms = 0) {
  await vi.advanceTimersByTimeAsync(ms)
  for (let i = 0; i < 10; i++) await vi.advanceTimersByTimeAsync(1)
}
/** Runs a promise of the engine's to its end while the clock moves on. */
async function settle<T>(p: Promise<T>, ms = 0): Promise<T> {
  await tick(ms)
  return p
}
const local = () => Object.keys(progress.get().lessons).sort()
const stamp = () => Date.now()

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(Date.parse('2026-10-16T09:00:00.000Z'))
  localStorage.clear()
  progress.clearLocal()
  backend = new FakeBackend()
  status = { syncing: false, lastSyncedAt: null, error: null }
  sync = createProgressSync({ adapter: backend, store: progress, onStatus: (p) => Object.assign(status, p) })
})
afterEach(() => {
  sync.stop()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

/** Signs in as u1 with this account copy, and lets the first delivery arrive. */
async function signIn(remote: ((s: SyncState) => SyncState) | null = null) {
  if (remote) backend.elsewhere(remote)
  sync.start('u1')
  await tick(0)
}

describe('signing in', () => {
  it("joins the account copy in, saves what it lacks, and makes this browser's progress the person's", async () => {
    progress.markLesson('m/visitor')
    await signIn((s) => crdt.markLesson(s, 'm/remote', true, stamp()))
    expect(local()).toEqual(['m/remote', 'm/visitor'])
    expect(backend.saved).toHaveLength(1)
    expect(keys(backend.doc()!.state)).toEqual(['m/remote', 'm/visitor'])
    expect(backend.doc()!.rev).toBe(2)
    expect(progress.owner()).toBe('u1')
    expect(status).toMatchObject({ syncing: false, error: null })
    expect(status.lastSyncedAt).not.toBeNull()
  })

  it("saves nothing when the account copy has everything, and creates no copy when there's nothing to save", async () => {
    await signIn()
    expect(backend.saved).toHaveLength(0)
    expect(status.lastSyncedAt).not.toBeNull()
    sync.stop()
    backend.elsewhere((s) => crdt.markLesson(s, 'm/a', true, stamp()))
    sync.start('u1')
    await tick(0)
    expect(local()).toEqual(['m/a'])
    await tick(10_000)
    expect(backend.saved).toHaveLength(0)
  })

  it("clears someone else's progress first (it never reaches this person's account)", async () => {
    progress.claim('u0')
    progress.markLesson('m/someone-else')
    await signIn()
    await tick(5000)
    expect(local()).toEqual([])
    expect(backend.saved).toHaveLength(0)
  })

  it("a Reset made before signing in erased only this browser's copy: the account keeps its progress", async () => {
    backend.elsewhere((s) => crdt.markLesson(s, 'm/old', true, stamp()))
    vi.advanceTimersByTime(60_000)
    progress.markLesson('m/visitor')
    progress.reset() // signed out: "Erase ... from this browser?"
    await signIn()
    await tick(5000)
    expect(local()).toEqual(['m/old'])
    expect(backend.saved).toHaveLength(0) // (nothing to add to the account copy)
    expect(backend.doc()!.state.resetAt).toBe(0)
    // progress made after such a Reset is added to the account's, as any visitor's is
    sync.stop()
    progress.clearLocal() // (signed out)
    progress.markLesson('m/before')
    progress.reset()
    progress.markLesson('m/after')
    await signIn()
    expect(local()).toEqual(['m/after', 'm/old'])
    expect(keys(backend.doc()!.state)).toEqual(['m/after', 'm/old'])
    expect(backend.doc()!.state.resetAt).toBe(0)
  })

  it("if the listener hasn't delivered yet, the first save reads the account copy first", async () => {
    backend.elsewhere((s) => crdt.markLesson(s, 'm/remote', true, stamp()))
    backend.holdSnapshots = true
    await signIn()
    progress.markLesson('m/a')
    await tick(1500)
    expect(backend.reads).toBe(1)
    expect(backend.refusals).toBe(0)
    expect(keys(backend.doc()!.state)).toEqual(['m/a', 'm/remote'])
  })

  it("shows the load error if the account copy can't be read, and clears it once it arrives", async () => {
    backend.online = false
    await signIn()
    progress.markLesson('m/a')
    await tick(1500)
    expect(status.error).toBe(LOAD_ERROR)
    expect(sync.hasUnsaved()).toBe(true)
    backend.goOnline()
    await tick(0)
    expect(status.error).toBeNull()
    expect(keys(backend.doc()!.state)).toEqual(['m/a'])
    expect(sync.hasUnsaved()).toBe(false)
  })
})

describe('saving changes', () => {
  it('waits 1.5 s after the last change, so a burst of changes is one save; a Reset is saved at once', async () => {
    await signIn()
    progress.markLesson('m/a')
    await tick(1000)
    progress.recordAnswer('q1', true)
    await tick(1000)
    expect(backend.saved).toHaveLength(0)
    expect(status.syncing).toBe(true)
    await tick(500)
    expect(backend.saved).toHaveLength(1)
    expect(status.syncing).toBe(false)
    progress.reset()
    await tick(0)
    expect(backend.saved).toHaveLength(2)
    expect(crdt.project(backend.doc()!.state).lessons).toEqual({})
  })

  it('a change made while a save is under way is saved straight after it', async () => {
    await signIn()
    backend.holdReplies = true
    progress.markLesson('m/a')
    await tick(1500)
    progress.markLesson('m/b')
    backend.releaseReplies()
    await tick(0)
    expect(backend.saved.map((s) => keys(s.state))).toEqual([['m/a'], ['m/a', 'm/b']])
  })

  it("an un-tick made while the tick's save is under way stays un-ticked, here and in the account", async () => {
    await signIn()
    backend.holdReplies = true
    progress.markLesson('m/a')
    await tick(1500)
    progress.markLesson('m/a', false)
    backend.releaseReplies()
    await tick(2000)
    expect(local()).toEqual([])
    expect(keys(backend.doc()!.state)).toEqual([])
  })

  it('saves at once when the tab is hidden', async () => {
    await signIn()
    progress.markLesson('m/a')
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    document.dispatchEvent(new Event('visibilitychange'))
    await tick(0)
    expect(backend.saved).toHaveLength(1)
  })

  it("saves changes another tab stored only if they're still unsaved a few seconds later", async () => {
    await signIn((s) => crdt.markLesson(s, 'm/a', true, stamp()))
    const otherTab = (key: string) => {
      const s = crdt.markLesson(progress.getSync(), key, true, stamp())
      localStorage.setItem('noai-prep:progress-v1', JSON.stringify({ ...crdt.toJSON(s), owner: 'u1' }))
      window.dispatchEvent(new StorageEvent('storage', { key: 'noai-prep:progress-v1' }))
      return s
    }
    // the other tab saves its change itself
    const s = otherTab('m/b')
    await tick(1000)
    backend.elsewhere(() => s)
    await tick(TAB_DELAY_MS)
    expect(backend.saved).toHaveLength(0)
    // the other tab closed before saving: this one saves it
    otherTab('m/c')
    await tick(1500)
    expect(backend.saved).toHaveLength(0)
    await tick(TAB_DELAY_MS)
    expect(keys(backend.doc()!.state)).toEqual(['m/a', 'm/b', 'm/c'])
  })
})

describe('when other devices save too', () => {
  it('a save refused because another device saved first is joined with the newer copy and saved again, with no error', async () => {
    await signIn()
    backend.holdSnapshots = true // (this device hasn't heard of the other's save yet)
    backend.elsewhere((s) => crdt.markLesson(s, 'm/phone', true, stamp()))
    progress.markLesson('m/laptop')
    await tick(1500)
    expect(backend.refusals).toBe(1)
    expect(keys(backend.doc()!.state)).toEqual(['m/laptop', 'm/phone'])
    expect(local()).toEqual(['m/laptop', 'm/phone'])
    expect(status.error).toBeNull()
  })

  it("a save that landed but whose reply was lost (so its re-send is refused) brings nothing back that was un-ticked since", async () => {
    await signIn()
    backend.holdReplies = true
    progress.markLesson('m/a')
    await tick(1500) // landed; the reply is on its way
    backend.goOffline()
    progress.markLesson('m/a', false)
    await tick(5000)
    backend.goOnline() // the save is sent again and refused; the account copy is read, joined in, saved
    await tick(2000)
    expect(backend.refusals).toBe(1)
    expect(keys(backend.doc()!.state)).toEqual([])
    expect(local()).toEqual([])
    expect(status.error).toBeNull()
    expect(sync.hasUnsaved()).toBe(false)
  })

  it('late or out-of-order deliveries never take the account copy it knows back to an older one', async () => {
    await signIn()
    backend.holdSnapshots = true
    progress.markLesson('m/a')
    await tick(1500)
    progress.markLesson('m/b')
    await tick(1500)
    expect(backend.doc()!.rev).toBe(2)
    backend.deliver({ reverse: true }) // revision 2, then revision 1
    progress.markLesson('m/c')
    await tick(1500)
    expect(backend.refusals).toBe(0)
    expect(backend.doc()!.rev).toBe(3)
    expect(keys(backend.doc()!.state)).toEqual(['m/a', 'm/b', 'm/c'])
  })

  it('a copy deleted and created again at a lower revision while this device slept is read, and what it lacks saved again', async () => {
    await signIn((s) => crdt.markLesson(s, 'm/a', true, stamp()))
    const first = backend.doc()!.state
    progress.markLesson('m/Z')
    await tick(1500)
    expect(backend.doc()!.rev).toBe(2)
    backend.goOffline() // (asleep)
    // another device that never heard of m/Z: "Delete my account" deletes the copy, then deleting the account fails,
    // so it saves its own copy again, as revision 1
    backend.docs.delete('u1')
    backend.elsewhere(() => first)
    const reads = backend.reads
    backend.goOnline() // (all the listener hears is revision 1)
    await tick(0)
    expect(backend.reads).toBe(reads + 1)
    expect(keys(backend.doc()!.state)).toEqual(['m/Z', 'm/a'])
    expect(backend.doc()!.rev).toBe(2)
    expect(sync.hasUnsaved()).toBe(false)
    expect(status.error).toBeNull()
  })

  it("a Reset on another device stays done here, while what was done here after it is kept", async () => {
    await signIn((s) => crdt.markLesson(s, 'm/old', true, stamp()))
    backend.goOffline()
    vi.advanceTimersByTime(10)
    backend.elsewhere((s) => crdt.reset(s, stamp())) // (the other device is online)
    vi.advanceTimersByTime(10)
    progress.markLesson('m/new')
    await tick(3000)
    backend.goOnline()
    await tick(3000)
    expect(local()).toEqual(['m/new'])
    expect(keys(backend.doc()!.state)).toEqual(['m/new'])
  })
})

describe('failures', () => {
  it('offline, saves wait (without an error) and go out once back online', async () => {
    await signIn()
    backend.goOffline()
    progress.markLesson('m/a')
    await tick(30_000)
    expect(backend.saved).toHaveLength(0)
    expect(status).toMatchObject({ syncing: true, error: null })
    expect(sync.hasUnsaved()).toBe(true)
    backend.goOnline()
    await tick(0)
    expect(keys(backend.doc()!.state)).toEqual(['m/a'])
    expect(status.syncing).toBe(false)
    expect(sync.hasUnsaved()).toBe(false)
  })

  it('a failed save shows the error, keeps the change, and tries again later, and on the next change', async () => {
    await signIn()
    backend.failWrites = 1
    progress.markLesson('m/a')
    await tick(1500)
    expect(status.error).toBe(SYNC_ERROR)
    expect(local()).toEqual(['m/a'])
    await tick(2000) // tried again
    expect(status.error).toBeNull()
    expect(keys(backend.doc()!.state)).toEqual(['m/a'])
    backend.failWrites = 10
    progress.markLesson('m/b')
    await tick(1500 + 2000 + 5000) // fails, and fails again later
    expect(status.error).toBe(SYNC_ERROR)
    backend.failWrites = 0
    progress.markLesson('m/c') // the next change tries again 1.5 s later
    await tick(1500)
    expect(status.error).toBeNull()
    expect(keys(backend.doc()!.state)).toEqual(['m/a', 'm/b', 'm/c'])
  })

  it("a refusal while the account copy is still the one the save was built on is shown, and tried again later", async () => {
    await signIn()
    backend.refuseWrites = 1
    progress.markLesson('m/a')
    await tick(1500)
    expect(status.error).toBe(SYNC_ERROR)
    await tick(2000)
    expect(status.error).toBeNull()
    expect(keys(backend.doc()!.state)).toEqual(['m/a'])
  })
})

describe('as the page closes', () => {
  it('sends the changed parts as the next revision, built on the copy the server last confirmed', async () => {
    await signIn((s) => crdt.markLesson(s, 'm/old', true, stamp()))
    progress.markLesson('m/a')
    window.dispatchEvent(new Event('pagehide'))
    expect(backend.exitSaves).toHaveLength(1)
    const [exit] = backend.exitSaves
    expect(exit).toMatchObject({ uid: 'u1', rev: 2 })
    expect(keys(exit.base)).toEqual(['m/old'])
    expect(keys(exit.state)).toEqual(['m/a', 'm/old'])
    expect(backend.saved).toHaveLength(0) // (the page may live on: the usual save follows)
    await tick(1500)
    expect(backend.saved).toHaveLength(1)
  })

  it("sends nothing when nothing is unsaved, and saves the usual way when it can't (no account copy yet, or too big)", async () => {
    await signIn()
    window.dispatchEvent(new Event('pagehide'))
    expect(backend.writeProgressOnExit).not.toHaveBeenCalled()
    progress.markLesson('m/a')
    window.dispatchEvent(new Event('pagehide'))
    expect(backend.writeProgressOnExit).not.toHaveBeenCalled() // (the copy would need creating)
    await tick(0)
    expect(backend.saved).toHaveLength(1)
    backend.exitResult = false
    progress.markLesson('m/b')
    window.dispatchEvent(new Event('pagehide'))
    expect(backend.writeProgressOnExit).toHaveBeenCalledTimes(1)
    await tick(0)
    expect(backend.saved).toHaveLength(2)
  })
})

describe('unsaved progress (signing out would lose it)', () => {
  it('counts changes waiting here, and those another tab stored, but not once the copy is no longer this person’s', async () => {
    await signIn()
    expect(sync.hasUnsaved()).toBe(false)
    progress.markLesson('m/a')
    expect(sync.hasUnsaved()).toBe(true)
    await settle(sync.flush())
    expect(sync.hasUnsaved()).toBe(false)
    // another tab stores a change (its storage event hasn't arrived)
    const other = crdt.markLesson(progress.getSync(), 'm/other-tab', true, stamp())
    localStorage.setItem('noai-prep:progress-v1', JSON.stringify({ ...crdt.toJSON(other), owner: 'u1' }))
    expect(sync.hasUnsaved()).toBe(true)
    await settle(sync.flush())
    expect(keys(backend.doc()!.state)).toEqual(['m/a', 'm/other-tab'])
    // another tab signed out (the copy is cleared) and someone made a change there
    progress.markLesson('m/x')
    localStorage.removeItem('noai-prep:progress-v1')
    expect(sync.hasUnsaved()).toBe(false)
  })
})

describe('"Delete my saved progress"', () => {
  it('resets this browser and the account copy', async () => {
    await signIn((s) => crdt.recordAnswer(crdt.markLesson(s, 'm/a', true, stamp()), 'q1', true, stamp()))
    localStorage.setItem('noai-prep:mock-current', '{}')
    expect(await settle(sync.deleteRemote())).toBe('saved')
    expect(progress.get()).toEqual({ lessons: {}, checkpoints: {}, answers: {}, exams: [] })
    expect(crdt.project(backend.doc()!.state)).toEqual(progress.get())
    expect(backend.doc()!.state.resetAt).toBeGreaterThan(0)
    expect(localStorage.getItem('noai-prep:mock-current')).toBeNull()
  })

  it("offline, it says it hasn't reached the account yet; it does once back online, and progress made since stays", async () => {
    await signIn((s) => crdt.markLesson(s, 'm/a', true, stamp()))
    backend.goOffline()
    const deleting = sync.deleteRemote()
    await tick(DELETE_WAIT_MS)
    expect(await deleting).toBe('pending')
    expect(local()).toEqual([])
    expect(sync.hasUnsaved()).toBe(true)
    progress.markLesson('m/after')
    backend.goOnline()
    await tick(2000)
    expect(keys(backend.doc()!.state)).toEqual(['m/after'])
  })

  it("refuses (and resets nothing) once this browser's progress isn't this person's any more", async () => {
    await signIn((s) => crdt.markLesson(s, 'm/a', true, stamp()))
    localStorage.removeItem('noai-prep:progress-v1') // (signed out in another tab)
    await expect(sync.deleteRemote()).rejects.toThrow()
    await tick(5000)
    expect(keys(backend.doc()!.state)).toEqual(['m/a'])
    expect(backend.doc()!.state.resetAt).toBe(0)
  })
})

describe('the account deleted on another device', () => {
  it('checks the account still exists when its copy vanishes, and never creates a new copy for a deleted account', async () => {
    await signIn((s) => crdt.markLesson(s, 'm/a', true, stamp()))
    backend.remove()
    await tick(0)
    expect(backend.confirmUser).toHaveBeenCalledTimes(1)
    progress.markLesson('m/b')
    await tick(5000)
    backend.userGone = true // (the account goes a moment after its copy)
    await tick(GONE_WAIT_MS)
    expect(backend.confirmUser.mock.calls.length).toBeGreaterThan(1)
    expect(backend.doc()).toBeUndefined()
    expect(backend.saved).toHaveLength(0)
  })

  it("saves nothing if, while it checks the account still exists, this browser's progress becomes someone else's", async () => {
    await signIn() // (no account copy yet: the first save checks the account first)
    let confirmed!: () => void
    backend.confirmUser.mockImplementationOnce(() => new Promise<void>((resolve) => (confirmed = resolve)))
    progress.markLesson('m/mine')
    await tick(1500)
    expect(backend.confirmUser).toHaveBeenCalledTimes(1)
    // meanwhile another tab signs out, and someone else signs in there
    const theirs = crdt.markLesson(crdt.empty(), 'm/someone-else', true, stamp())
    localStorage.setItem('noai-prep:progress-v1', JSON.stringify({ ...crdt.toJSON(theirs), owner: 'u2' }))
    confirmed()
    await tick(5000)
    expect(backend.saved).toHaveLength(0)
    expect(backend.doc()).toBeUndefined()
  })

  it('saving now (two sign-outs at once, say) during that wait keeps the wait, then saves', async () => {
    await signIn((s) => crdt.markLesson(s, 'm/a', true, stamp()))
    backend.remove()
    await tick(0)
    progress.markLesson('m/b')
    void sync.flush()
    void sync.flush()
    await tick(100)
    expect(backend.doc()).toBeUndefined()
    expect(sync.hasUnsaved()).toBe(true)
    await tick(GONE_WAIT_MS)
    expect(keys(backend.doc()!.state)).toEqual(['m/a', 'm/b'])
  })

  it('after "Delete my account" failed half-way (the account still exists), saves the progress as a new copy', async () => {
    await signIn((s) => crdt.markLesson(s, 'm/a', true, stamp()))
    backend.remove()
    await tick(GONE_WAIT_MS - 100)
    expect(backend.doc()).toBeUndefined()
    await tick(100)
    expect(backend.doc()!.rev).toBe(1)
    expect(keys(backend.doc()!.state)).toEqual(['m/a'])
  })
})

describe('one sign-in after another on the same page', () => {
  it("a save left hanging by the previous person doesn't hold up the next person's", async () => {
    await signIn()
    backend.goOffline()
    progress.markLesson('m/person-1')
    await tick(1500) // u1's save waits for the connection, maybe for good
    sync.stop()
    progress.clearLocal()
    backend.online = true // (only u1's save stays stuck)
    sync.start('u2')
    await tick(0)
    progress.markLesson('m/person-2')
    await tick(1500)
    expect(keys(backend.doc('u2')!.state)).toEqual(['m/person-2'])
    expect(status.syncing).toBe(false)
  })
})
