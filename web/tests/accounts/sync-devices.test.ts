/*
  Two devices signed in to the same account, through a Firestore-like fake: one server document with a revision that
  each save must advance by one (like backend/firestore.rules), and per device a queue of pending writes that overlays
  what its listener shows (hasPendingWrites) and, while offline, waits without settling. The save sent while a page
  closes changes only the fields it sends, like the REST commit it stands for.
  Run: npx vitest run tests/accounts
*/
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { normalizeProgress, SYNCED_KEY, type ProgressOrigin, type ProgressState } from '../../src/lib/progress'
import type { AccountsAdapter, ProgressSnapshot } from '../../src/lib/accounts/adapter'
import { exitCommit, fromFields, PROGRESS_FORMAT, toFields } from '../../src/lib/accounts/progress-doc'
import { createProgressSync, type ProgressSync, type SyncedStore, type SyncStatus } from '../../src/lib/accounts/sync'

const D1 = '2026-03-01T00:00:00.000Z'
const state = (p: Partial<ProgressState> = {}): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [], ...p })
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
const lessons = (s: ProgressState | null) => Object.keys(s?.lessons ?? {}).sort()
type SyncAdapter = Pick<AccountsAdapter, 'readProgress' | 'watchProgress' | 'writeProgress' | 'writeProgressOnExit' | 'clearProgress' | 'confirmUser'>
const refusal = () => Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' })

/** One device's progress store (in memory). */
class MemStore implements SyncedStore {
  s = state()
  cbs = new Set<(s: ProgressState, o: ProgressOrigin) => void>()
  get = () => this.s
  replace(n: ProgressState) {
    this.s = n
    this.cbs.forEach((cb) => cb(this.s, 'remote'))
  }
  reset() {
    this.s = state()
    this.cbs.forEach((cb) => cb(this.s, 'reset'))
  }
  onChange(cb: (s: ProgressState, o: ProgressOrigin) => void) {
    this.cbs.add(cb)
    return () => void this.cbs.delete(cb)
  }
  mark(k: string, done = true) {
    const lessons = { ...this.s.lessons }
    if (done) lessons[k] = D1
    else delete lessons[k]
    this.s = { ...this.s, lessons }
    this.cbs.forEach((cb) => cb(this.s, 'local'))
  }
}

class Server {
  doc: ProgressState | null = null
  rev = 0
  /** the account was deleted: the Auth check fails (its sign-in tokens still work with Firestore for a while) */
  userGone = false
  clients = new Set<Client>()
  commit(s: ProgressState | null, rev: number) {
    this.doc = clone(s)
    this.rev = rev
    this.clients.forEach((c) => c.serverChanged())
  }
}

class Client implements SyncAdapter {
  online = true
  pending: { s: ProgressState; rev: number; resolve: () => void; reject: (e: unknown) => void }[] = []
  cb: ((s: ProgressSnapshot) => void) | null = null
  /** when set, the next read waits for this to be called */
  heldRead: Promise<void> | null = null
  /** when set, "Delete my saved progress" waits for releaseClear() */
  holdClear = false
  private clearHeld: (() => void) | null = null
  constructor(private server: Server) {
    server.clients.add(this)
  }
  private deliver(data: ProgressState | null, rev: number, hasPendingWrites: boolean) {
    const cb = this.cb
    setTimeout(() => cb?.({ data: clone(data), rev, hasPendingWrites, fromCache: false }), 0)
  }
  async readProgress() {
    if (this.heldRead) await this.heldRead
    if (!this.online) throw new Error('offline')
    return { data: clone(this.server.doc), rev: this.server.rev }
  }
  watchProgress(_u: string, cb: (s: ProgressSnapshot) => void) {
    this.cb = cb
    if (this.online) this.deliver(this.server.doc, this.server.rev, false)
    return () => {
      this.cb = null
    }
  }
  writeProgress(_u: string, s: ProgressState, rev: number) {
    return new Promise<void>((resolve, reject) => {
      this.pending.push({ s: clone(s), rev, resolve, reject })
      this.deliver(s, rev, true) // the device's own view shows the pending write
      if (this.online) this.send()
    })
  }
  /** like the real transaction: needs the server; saves an empty copy as the next revision */
  async clearProgress() {
    if (this.holdClear) await new Promise<void>((r) => (this.clearHeld = r))
    if (!this.online) throw Object.assign(new Error('offline'), { code: 'unavailable' })
    if (this.server.doc === null) return 0
    const rev = this.server.rev + 1
    this.server.commit(state(), rev)
    return rev
  }
  releaseClear() {
    this.holdClear = false
    this.clearHeld?.()
  }
  /** the whole account deleted (on another device) */
  deleteAccount() {
    this.server.userGone = true
    this.server.commit(null, 0)
  }
  confirmUser = vi.fn(async () => {
    if (!this.online) throw Object.assign(new Error('offline'), { code: 'auth/network-request-failed' })
    if (this.server.userGone) throw Object.assign(new Error('gone'), { code: 'auth/user-not-found' })
  })
  /** The REST commit sent as the page closes: it changes only the fields it carries, if its revision is the next one. */
  writeProgressOnExit(_u: string, s: ProgressState, rev: number, base: ProgressState) {
    const exit = exitCommit('doc', s, rev, base)
    if (exit === null) return null
    if (this.online && rev === this.server.rev + 1) {
      const fields: Record<string, unknown> = { ...toFields(this.server.doc ?? state()), v: PROGRESS_FORMAT }
      const w = JSON.parse(exit.body).writes[0]
      for (const k of w.updateMask.fieldPaths as string[]) if (k !== 'v' && k !== 'rev') fields[k] = w.update.fields[k].stringValue
      this.server.commit(normalizeProgress(fromFields((f) => fields[f])), rev)
    }
    return exit.saved
  }
  /** The oldest pending save reaches the server, but its reply is lost with the connection: it stays queued, to be sent again. */
  loseReply() {
    const p = this.pending[0]
    if (p.rev === this.server.rev + 1) this.server.commit(p.s, p.rev)
  }
  send() {
    while (this.pending.length) {
      const p = this.pending.shift()!
      if (p.rev === this.server.rev + 1) {
        this.server.commit(p.s, p.rev) // also confirms it to this device (once nothing else is pending)
        p.resolve()
      } else {
        // refused by the rules: the device's view falls back to the server's copy
        p.reject(refusal())
        this.serverChanged()
      }
    }
  }
  serverChanged() {
    if (!this.online || this.pending.length) return // offline, or the view is overlaid by a pending write
    this.deliver(this.server.doc, this.server.rev, false)
  }
  goOnline() {
    this.online = true
    this.send()
    this.serverChanged()
  }
}

const tick = (ms = 0) => vi.advanceTimersByTimeAsync(ms)
let syncs: ProgressSync[] = []
beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})
afterEach(async () => {
  for (const s of syncs) await s.stop()
  syncs = []
  vi.useRealTimers()
})

function device(server: Server, store = new MemStore()) {
  const client = new Client(server)
  const errors: (string | null)[] = []
  const onStatus = (p: Partial<SyncStatus>) => {
    if (p.error !== undefined) errors.push(p.error)
  }
  const sync = createProgressSync({ adapter: client, store, onStatus })
  syncs.push(sync)
  return { client, store, sync, errors }
}
/** What a browser notes about the account copy its progress builds on (as if it had synced it before). */
const setNote = (data: ProgressState) => localStorage.setItem('noai-prep:' + SYNCED_KEY, JSON.stringify({ uid: 'u1', data }))
const withLessons = (...keys: string[]) => state({ lessons: Object.fromEntries(keys.map((k) => [k, D1])) })

describe('two devices, one account', () => {
  it("a save queued while offline doesn't overwrite what the other device saved meanwhile: both are kept, everywhere", async () => {
    const server = new Server()
    server.doc = state({ lessons: { 'm/shared': D1 } })
    server.rev = 1
    const phone = device(server)
    const laptop = device(server)
    // (the two devices keep separate notes, as two browsers would)
    await phone.sync.start('u1')
    localStorage.clear()
    await laptop.sync.start('u1')
    await tick()

    // the phone loses signal (tab still open) and the student ticks a lesson there: its save waits in the queue
    phone.client.online = false
    phone.store.mark('m/on-phone')
    await tick(1500)

    // meanwhile, on the laptop
    laptop.store.mark('m/on-laptop-1')
    laptop.store.mark('m/on-laptop-2')
    await tick(1500)
    expect(lessons(server.doc)).toEqual(['m/on-laptop-1', 'm/on-laptop-2', 'm/shared'])

    // signal comes back: the queued save goes out, is refused, and the phone merges and saves again
    phone.client.goOnline()
    await tick(5000)
    const all = ['m/on-laptop-1', 'm/on-laptop-2', 'm/on-phone', 'm/shared']
    expect(lessons(server.doc)).toEqual(all)
    expect(lessons(laptop.store.s)).toEqual(all)
    expect(lessons(phone.store.s)).toEqual(all)
  })

  it("a confirmation that never arrives (a newer copy came first) doesn't hide a later change made elsewhere", async () => {
    const server = new Server()
    server.doc = state() // (an account copy exists: creating one needs the account checked online first)
    server.rev = 1
    const a = device(server)
    await a.sync.start('u1')
    await tick()
    // A saves {x}; before its confirmation reaches A's listener, another device's save {x, y} lands
    a.store.mark('m/x')
    a.client.online = false
    await tick(1500) // A's save of {x} is pending
    const p = a.client.pending.shift()!
    server.doc = state({ lessons: { 'm/x': D1 } }) // A's save commits...
    server.rev = p.rev
    server.commit(state({ lessons: { 'm/x': D1, 'm/y': D1 } }), p.rev + 1) // ...and the other device's lands right after
    p.resolve()
    a.client.online = true
    a.client.serverChanged()
    await tick()
    expect(lessons(a.store.s)).toEqual(['m/x', 'm/y'])
    // the other device now un-ticks y: the account copy is {x} again, the same as A's own earlier save
    server.commit(state({ lessons: { 'm/x': D1 } }), server.rev + 1)
    await tick()
    expect(lessons(a.store.s)).toEqual(['m/x'])
    a.store.mark('m/z')
    await tick(1500)
    expect(lessons(server.doc)).toEqual(['m/x', 'm/z'])
  })

  it('two devices saving within moments of each other both end up with both changes', async () => {
    const server = new Server()
    const one = device(server)
    const two = device(server)
    await one.sync.start('u1')
    localStorage.clear()
    await two.sync.start('u1')
    await tick()
    one.store.mark('m/one')
    two.store.mark('m/two')
    await tick(1500) // both save at the same moment, from the same revision: one is refused
    await tick(5000)
    expect(lessons(server.doc)).toEqual(['m/one', 'm/two'])
    expect(lessons(one.store.s)).toEqual(['m/one', 'm/two'])
    expect(lessons(two.store.s)).toEqual(['m/one', 'm/two'])
  })
})

describe('regressions found by the model checker and the multi-device runs', () => {
  it('two tabs starting together: the slower one merges on the copy it held when it started, not on a note written since', async () => {
    // the account has a lesson the phone ticked (rev 2); this browser last synced rev 1 and opens two tabs at once
    const server = new Server()
    server.doc = withLessons('m/l0', 'm/phone')
    server.rev = 2
    setNote(withLessons('m/l0'))
    const p1 = device(server, Object.assign(new MemStore(), { s: withLessons('m/l0') }))
    const p2 = device(server, Object.assign(new MemStore(), { s: withLessons('m/l0') }))
    let release = () => {}
    p2.client.heldRead = new Promise<void>((r) => (release = r))
    const second = p2.sync.start('u1') // starts first, its read slow
    await p1.sync.start('u1') // merges, and notes rev 2 {l0, phone}
    release()
    await second
    await tick(5000)
    expect(lessons(server.doc)).toEqual(['m/l0', 'm/phone'])
    expect(server.rev).toBe(2)
    expect(lessons(p2.store.s)).toEqual(['m/l0', 'm/phone'])
  })

  it("a save that landed but whose reply was lost doesn't bring back what was un-ticked after it", async () => {
    const server = new Server()
    server.doc = withLessons('m/l0')
    server.rev = 1
    const a = device(server)
    await a.sync.start('u1')
    await tick()
    a.client.online = false
    a.store.mark('m/l1')
    await tick(1500) // its save (rev 2) waits
    a.client.loseReply() // it reaches the server as the connection drops; the reply never comes
    a.store.mark('m/l1', false) // un-ticked, still offline
    await tick(1500)
    a.client.goOnline() // sent again: refused, as revision 2 is taken (by itself)
    await tick(5000)
    expect(lessons(server.doc)).toEqual(['m/l0'])
    expect(lessons(a.store.s)).toEqual(['m/l0'])
  })

  it('... and the same when the page reloads before the reply and the un-tick comes before the first merge', async () => {
    const server = new Server()
    server.doc = withLessons('m/l0')
    server.rev = 1
    const a = device(server)
    await a.sync.start('u1')
    await tick()
    a.client.online = false
    a.store.mark('m/l1')
    await tick(1500)
    a.client.loseReply()
    void a.sync.stop() // the page reloads (its save never settles)
    const again = device(server, a.store) // same browser: same copy, same note
    again.client.online = false
    await again.sync.start('u1') // can't read the account copy yet
    again.store.mark('m/l1', false)
    again.client.goOnline()
    await tick(5000)
    expect(lessons(server.doc)).toEqual(['m/l0'])
    expect(lessons(again.store.s)).toEqual(['m/l0'])
  })

  it("the save sent as a page closes doesn't overwrite what another device saved while this page's save was on its way", async () => {
    const server = new Server()
    server.doc = withLessons('m/l0')
    server.rev = 1
    const a = device(server)
    const b = device(server)
    await a.sync.start('u1')
    localStorage.clear()
    await b.sync.start('u1')
    await tick()
    a.client.online = false // a slow link: A's saves wait
    a.store.mark('m/onA')
    await tick(1500) // A's save (rev 2) is on its way
    b.store.mark('m/onB')
    await tick(1500) // B's lands first, as rev 2
    a.store.mark('m/onA2')
    a.client.online = true
    window.dispatchEvent(new Event('pagehide')) // A's tab closes
    void a.sync.stop()
    a.client.send() // A's save from before gets there after all: refused
    await tick(1000)
    expect(lessons(server.doc)).toEqual(['m/l0', 'm/onB'])
    expect(lessons(b.store.s)).toEqual(['m/l0', 'm/onB'])
    expect(lessons(a.store.s)).toEqual(['m/l0', 'm/onA', 'm/onA2']) // kept in A's browser for its next visit
    localStorage.clear()
    const later = device(server, a.store)
    await later.sync.start('u1')
    await tick(5000)
    expect(lessons(server.doc)).toEqual(['m/l0', 'm/onA', 'm/onA2', 'm/onB'])
  })

  it('while "Delete my saved progress" is on its way nothing is saved behind it, and progress made meanwhile is kept', async () => {
    const server = new Server()
    server.doc = withLessons('m/l0')
    server.rev = 1
    const a = device(server)
    await a.sync.start('u1')
    await tick()
    a.store.mark('m/before') // not saved yet when the delete is pressed: deleted with the rest
    a.client.holdClear = true
    const deleted = a.sync.deleteRemote()
    await tick()
    a.store.mark('m/after') // studying on meanwhile
    window.dispatchEvent(new Event('pagehide')) // switching away tries to save
    await tick(3000)
    expect(server.rev).toBe(1)
    a.client.releaseClear()
    await deleted
    expect(lessons(a.store.s)).toEqual(['m/after'])
    await tick(3000)
    expect(lessons(server.doc)).toEqual(['m/after'])
    expect(server.rev).toBe(3)
  })

  it('a save queued before "Delete my saved progress" on another device can\'t line up with later saves and land on top', async () => {
    const server = new Server()
    server.doc = withLessons('m/old-1', 'm/old-2')
    server.rev = 1
    const phone = device(server)
    const laptop = device(server)
    await phone.sync.start('u1')
    localStorage.clear()
    await laptop.sync.start('u1')
    await tick()
    phone.client.online = false
    phone.store.mark('m/on-phone')
    await tick(1500) // its save (rev 2) waits in the phone's queue
    await laptop.sync.deleteRemote()
    laptop.store.mark('m/after-delete')
    await tick(1500)
    phone.client.goOnline() // refused (the account is past revision 2), merged, saved again
    await tick(5000)
    const all = ['m/after-delete', 'm/on-phone']
    expect(lessons(server.doc)).toEqual(all)
    expect(lessons(phone.store.s)).toEqual(all)
    expect(lessons(laptop.store.s)).toEqual(all)
  })

  it("an account deleted on another device doesn't get a progress copy again from a device that was offline", async () => {
    const server = new Server() // a new account: no copy yet
    const d1 = device(server)
    const d2 = device(server)
    await d1.sync.start('u1')
    localStorage.clear()
    await d2.sync.start('u1')
    await tick()
    d2.client.online = false
    d2.store.mark('m/x')
    await tick(1500) // creating the copy needs the account checked first, which can't be done offline
    d1.client.deleteAccount()
    d2.client.goOnline()
    await tick(5000)
    expect(server.doc).toBeNull()
    expect(d2.client.confirmUser).toHaveBeenCalled()
  })

  it('... nor from one that reloads offline with unsaved progress and merges once back online', async () => {
    const server = new Server()
    server.doc = withLessons('m/l0')
    server.rev = 1
    const a = device(server)
    const b = device(server)
    await a.sync.start('u1')
    localStorage.clear()
    await b.sync.start('u1')
    await tick()
    b.client.online = false
    b.store.mark('m/onB')
    await tick(1500)
    void b.sync.stop() // reloads offline
    const b2 = device(server, b.store)
    b2.client.online = false
    await b2.sync.start('u1')
    a.client.deleteAccount() // the whole account, on the other device
    b2.client.goOnline() // its first merge finds no copy, and would create one
    await tick(5000)
    expect(server.doc).toBeNull()
  })
})
