/*
  Two devices signed in to the same account, through a Firestore-like fake: one server document with a revision that
  each save must advance by one (like backend/firestore.rules), and per device a queue of pending writes that overlays
  what its listener shows (hasPendingWrites) and, while offline, waits without settling.
  Run: npx vitest run tests/accounts
*/
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProgressOrigin, ProgressState } from '../../src/lib/progress'
import type { AccountsAdapter, ProgressSnapshot } from '../../src/lib/accounts/adapter'
import { createProgressSync, type ProgressSync, type SyncedStore } from '../../src/lib/accounts/sync'

const D1 = '2026-03-01T00:00:00.000Z'
const state = (p: Partial<ProgressState> = {}): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [], ...p })
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
const lessons = (s: ProgressState | null) => Object.keys(s?.lessons ?? {}).sort()
type SyncAdapter = Pick<AccountsAdapter, 'readProgress' | 'watchProgress' | 'writeProgress' | 'writeProgressOnExit' | 'deleteProgress' | 'confirmUser'>

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
  constructor(private server: Server) {
    server.clients.add(this)
  }
  private deliver(data: ProgressState | null, rev: number, hasPendingWrites: boolean) {
    const cb = this.cb
    setTimeout(() => cb?.({ data: clone(data), rev, hasPendingWrites, fromCache: false }), 0)
  }
  async readProgress() {
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
  async deleteProgress() {
    this.server.commit(null, 0)
  }
  async confirmUser() {}
  send() {
    while (this.pending.length) {
      const p = this.pending.shift()!
      if (p.rev === this.server.rev + 1) {
        this.server.commit(p.s, p.rev) // also confirms it to this device (once nothing else is pending)
        p.resolve()
      } else {
        // refused by the rules: the device's view falls back to the server's copy
        p.reject(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' }))
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

function device(server: Server) {
  const client = new Client(server)
  const store = new MemStore()
  const sync = createProgressSync({ adapter: client, store, onStatus: () => {} })
  syncs.push(sync)
  return { client, store, sync }
}

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
