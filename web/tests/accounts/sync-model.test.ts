/*
  Multi-tab, multi-device scenarios against the real modules: each tab is a fresh instance of lib/progress and
  lib/accounts/{index,sync} (its own module registry), with storage bound to its browser, over a model of Firestore that
  enforces backend/firestore.rules (see model/world.ts). Fixed 50 ms network latency, fake timers: deterministic.
  Each test is a counterexample the model checker found in an earlier version (named F1 to F10), asserting the right
  outcome. On a failure, the trace of what each tab and the server did is printed.
  Run: npx vitest run tests/accounts/sync-model.test.ts
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeAll, beforeEach, describe, expect, it, onTestFailed, vi } from 'vitest'
import { fromFields, toFields } from '../../src/lib/accounts/progress-doc'
import { normalizeProgress, type ProgressState } from '../../src/lib/progress'
import { KNOBS, T0, World, type Browser, type Page } from './model/world'

const D1 = '2026-10-01T00:00:00.000Z'
const D2 = '2026-10-02T00:00:00.000Z'
const st = (p: Partial<ProgressState> = {}): ProgressState => ({ lessons: {}, checkpoints: {}, answers: {}, exams: [], ...p })
const settle = (ms: number) => vi.advanceTimersByTimeAsync(ms)
const strip = (k: string) => k.replace(/^g1\//, '')
const keys = (s: ProgressState) => [...Object.keys(s.lessons), ...Object.keys(s.checkpoints), ...Object.keys(s.answers)].map(strip).sort()
const local = (p: Page) => keys(p.progress.progress.get())
const server = (w: World, uid = 'g1') => {
  const f = w.server.get(uid).fields
  return f ? keys(normalizeProgress(fromFields((k) => (Object.hasOwn(f, k) ? f[k] : undefined)))) : null
}
function seedServer(w: World, s: ProgressState, rev: number, uid = 'g1') {
  w.server.docs.set(uid, { fields: { ...toFields(s), v: 2, rev, updatedAt: 'then' }, version: rev, K: new Set() })
}
function seedBrowser(b: Browser, s: ProgressState, uid = 'g1') {
  b.ls.set('progress-v1', JSON.stringify(s))
  b.ls.set('progress-synced', JSON.stringify({ uid, data: s }))
  b.ls.set('progress-owner', JSON.stringify(uid))
}
let w: World
let name = ''
beforeAll(() => {
  ;(globalThis as any).__realSetTimeout = globalThis.setTimeout
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] })
})
afterAll(() => vi.useRealTimers())
beforeEach(() => {
  vi.setSystemTime(T0)
  Object.assign(KNOBS, { fixedLat: 50, landAfterDisconnect: 0, keepalive: true, dedupe: true, noLostAcks: false })
  onTestFailed(() => console.log(`---- ${name} ----\n${w?.trace.join('\n')}`))
})

describe('tabs and devices, modelled', () => {
  it('F1 two tabs that load together: the second tab’s first merge deletes progress made on another device', async () => {
    name = 'F1-two-tabs-load'
    w = new World(1, 1)
    // the account has a lesson ticked on the phone (rev 2); this laptop browser last synced at rev 1
    seedServer(w, st({ lessons: { 'g1/l0': D1, 'g1/phone': D2 } }), 2)
    const b = await w.newBrowser('g1')
    seedBrowser(b, st({ lessons: { 'g1/l0': D1 } }))
    // the browser restores two tabs of the site at once (or the user opens two quickly)
    const x = await w.openPage(b)
    const y = await w.openPage(b)
    await settle(10_000)
    w.log(`END server ${server(w)}; tab x ${local(x)}; tab y ${local(y)}`)
    expect(server(w)).toContain('phone')
  })

  it('F1b same, online, with the other tab merely receiving a save from the phone while the new tab loads', async () => {
    name = 'F1b-new-tab-during-phone-save'
    w = new World(1, 1)
    seedServer(w, st({ lessons: { 'g1/l0': D1 } }), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, st({ lessons: { 'g1/l0': D1 } }))
    const phone = await w.newBrowser('g1')
    const old = await w.openPage(b)
    const ph = await w.openPage(phone)
    await settle(3000)
    // phone ticks a lesson; 1.5 s later it saves; the laptop's open tab receives it ~100 ms after that
    ph.progress.progress.markLesson('g1/phone', true)
    await settle(1500 + 60)
    // the student opens a second laptop tab just before that save reaches the open tab
    const fresh = await w.openPage(b)
    await settle(10_000)
    w.log(`END server ${server(w)}; old tab ${local(old)}; new tab ${local(fresh)}; phone ${local(ph)}`)
    expect(server(w)).toContain('phone')
  })

  it('F2 offline, two signed-in tabs: a tick in a tab that is then closed is overwritten by the other tab', async () => {
    name = 'F2-offline-tabs'
    w = new World(1, 1)
    seedServer(w, st({ lessons: { 'g1/l0': D1 } }), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, st({ lessons: { 'g1/l0': D1 } }))
    const x = await w.openPage(b)
    const y = await w.openPage(b)
    await settle(3000)
    w.setOnline(b, false)
    x.progress.progress.markLesson('g1/l1', true) // tab X: tick a lesson, then close the tab
    await settle(2000)
    w.closePage(x, 'close')
    await settle(1000)
    y.progress.progress.recordAnswer('g1/t0.q0', true) // tab Y: answer a question
    await settle(2000)
    w.setOnline(b, true)
    await settle(10_000)
    w.log(`END server ${server(w)}; tab y ${local(y)}`)
    expect(server(w)).toContain('l1')
  })

  it('F3a a save lands but its answer is lost to a dropped connection; an untick made offline is undone', async () => {
    name = 'F3a-lost-ack-resend'
    Object.assign(KNOBS, { dedupe: false }) // Firestore re-sends unacknowledged writes after reconnecting
    w = new World(1, 1)
    seedServer(w, st({ lessons: { 'g1/l0': D1 } }), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, st({ lessons: { 'g1/l0': D1 } }))
    const a = await w.openPage(b)
    await settle(3000)
    a.progress.progress.markLesson('g1/l1', true)
    await settle(1500 + 75) // the save (rev 2) reached the server at +50; its answer is due at +100
    w.setOnline(b, false)
    a.progress.progress.markLesson('g1/l1', false) // student un-ticks it while offline
    await settle(5000)
    w.setOnline(b, true)
    await settle(10_000)
    w.log(`END server ${server(w)}; device ${local(a)}`)
    expect(server(w)).not.toContain('l1')
    expect(local(a)).not.toContain('l1')
  })

  it('F3b the same with the page reloaded offline (no re-send involved): the untick is undone', async () => {
    name = 'F3b-lost-ack-reload'
    w = new World(1, 1)
    seedServer(w, st({ lessons: { 'g1/l0': D1 } }), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, st({ lessons: { 'g1/l0': D1 } }))
    const a = await w.openPage(b)
    await settle(3000)
    a.progress.progress.markLesson('g1/l1', true)
    await settle(1500 + 75)
    w.setOnline(b, false)
    w.closePage(a, 'reload')
    const a2 = await w.openPage(b)
    await settle(1000)
    a2.progress.progress.markLesson('g1/l1', false)
    await settle(5000)
    w.setOnline(b, true)
    await settle(10_000)
    w.log(`END server ${server(w)}; device ${local(a2)}`)
    expect(server(w)).not.toContain('l1')
  })

  it('F4 keepalive built on an in-flight save that is then refused overwrites another device’s tick', async () => {
    name = 'F4-keepalive-wrong-base'
    w = new World(1, 1)
    seedServer(w, st({ lessons: { 'g1/l0': D1 } }), 1)
    const ba = await w.newBrowser('g1')
    seedBrowser(ba, st({ lessons: { 'g1/l0': D1 } }))
    const bb = await w.newBrowser('g1')
    seedBrowser(bb, st({ lessons: { 'g1/l0': D1 } }))
    const B = await w.openPage(bb)
    const A = await w.openPage(ba)
    await settle(3000)
    B.progress.progress.markLesson('g1/onB', true)
    await settle(10)
    A.progress.progress.markLesson('g1/onA', true)
    await settle(1500 + 15) // both save rev 2; B's reaches the server first, A's is still in flight
    A.progress.progress.markLesson('g1/onA2', true)
    w.closePage(A, 'close') // A's tab closes: keepalive "rev 3" built on A's in-flight copy
    await settle(10_000)
    const A2 = await w.openPage(ba) // A's browser comes back later
    await settle(10_000)
    w.log(`END server ${server(w)}; B ${local(B)}; A ${local(A2)}`)
    expect(server(w)).toContain('onB')
  })

  it('F5 a save sent while "Delete my saved progress" is on its way never lands behind it (the device and account agree)', async () => {
    name = 'F5-flush-during-delete'
    w = new World(1, 1)
    const b = await w.newBrowser('g1') // new account: no copy yet
    b.ls.set('progress-owner', JSON.stringify('g1'))
    const a = await w.openPage(b)
    await settle(3000)
    a.progress.progress.markLesson('g1/l0', true)
    await settle(300)
    void a.account.account.deleteCloudProgress() // "Deleting..."
    await settle(20)
    a.dispatch('pagehide') // e.g. the student switches away (bfcache): any flush does the same
    await settle(10_000)
    w.log(`END server ${server(w)}; device ${local(a)}; device error ${a.account.account.get().error}`)
    expect(server(w)).toBeNull() // (a new account: there was no account copy to clear)
    expect(local(a)).toEqual([])
    expect(a.account.account.get().error).toBeNull()
  })

  it('F5b offline, "Delete my saved progress" fails at once and changes nothing (the progress is then saved as usual)', async () => {
    name = 'F5b-delete-offline'
    w = new World(1, 1)
    const b = await w.newBrowser('g1')
    b.ls.set('progress-owner', JSON.stringify('g1'))
    const a = await w.openPage(b)
    await settle(3000)
    a.progress.progress.markLesson('g1/l0', true)
    await settle(300)
    w.setOnline(b, false)
    const deleting = a.account.account.deleteCloudProgress()
    await settle(100)
    await deleting
    expect(a.account.account.get().error).toMatch(/Couldn't delete your saved progress/)
    a.dispatch('pagehide')
    await settle(2000)
    w.setOnline(b, true)
    await settle(10_000)
    w.log(`END server ${server(w)}; device ${local(a)}`)
    expect(server(w)).toEqual(['l0'])
    expect(local(a)).toEqual(['l0'])
  })

  it('F6 a save queued before another device deleted the copy is accepted when the revision numbers line up again', async () => {
    name = 'F6-rev-reuse-after-delete'
    w = new World(1, 1)
    seedServer(w, st({ lessons: { 'g1/l0': D1 } }), 1)
    const ba = await w.newBrowser('g1')
    seedBrowser(ba, st({ lessons: { 'g1/l0': D1 } }))
    const bb = await w.newBrowser('g1')
    seedBrowser(bb, st({ lessons: { 'g1/l0': D1 } }))
    const A = await w.openPage(ba)
    const B = await w.openPage(bb)
    await settle(3000)
    w.setOnline(ba, false)
    A.progress.progress.markLesson('g1/onA', true) // A (offline) queues its save as rev 2
    await settle(2000)
    void B.account.account.deleteCloudProgress() // B: "Delete my saved progress" (rev back to 0)
    await settle(500)
    B.progress.progress.markLesson('g1/afterDelete', true) // B starts again: saved as rev 1
    await settle(3000)
    w.setOnline(ba, true) // A's queued rev 2 goes out
    await settle(10_000)
    w.log(`END server ${server(w)}; A ${local(A)}; B ${local(B)}`)
    expect(server(w)).toContain('afterDelete')
    expect(server(w)).not.toContain('l0')
  })

  it('F7 another device with unsaved progress re-creates progress/{uid} after the account is deleted', async () => {
    name = 'F7-orphan-after-account-delete'
    w = new World(1, 1)
    seedServer(w, st({ lessons: { 'g1/l0': D1 } }), 1)
    const ba = await w.newBrowser('g1')
    seedBrowser(ba, st({ lessons: { 'g1/l0': D1 } }))
    const bb = await w.newBrowser('g1')
    seedBrowser(bb, st({ lessons: { 'g1/l0': D1 } }))
    const A = await w.openPage(ba)
    const B = await w.openPage(bb)
    await settle(3000)
    w.setOnline(bb, false)
    B.progress.progress.markLesson('g1/onB', true) // B: unsaved (offline)
    await settle(2000)
    w.closePage(B, 'reload')
    const B2 = await w.openPage(bb) // B reloads while offline
    await settle(2000)
    void A.account.account.deleteAccount() // A deletes the whole account
    await settle(2000)
    w.setOnline(bb, true) // within the hour: B's ID token is still valid
    await settle(10_000)
    w.log(`END server ${JSON.stringify(server(w))}; deleted users ${[...w.server.deletedUsers]}; B ${B2.account.account.get().status}`)
    expect(server(w)).toBeNull()
  })

  it('F8 a save queued behind a refused one reuses the stale revision, is refused too, and shows "Couldn\'t save"', async () => {
    name = 'F8-spurious-sync-error'
    w = new World(1, 1)
    seedServer(w, st({ lessons: { 'g1/l0': D1 } }), 1)
    const ba = await w.newBrowser('g1')
    seedBrowser(ba, st({ lessons: { 'g1/l0': D1 } }))
    const bb = await w.newBrowser('g1')
    seedBrowser(bb, st({ lessons: { 'g1/l0': D1 } }))
    const B = await w.openPage(bb)
    const A = await w.openPage(ba)
    await settle(3000)
    B.progress.progress.markLesson('g1/onB', true)
    await settle(10)
    A.progress.progress.markLesson('g1/onA', true)
    await settle(1500 + 15) // both save rev 2; B's lands first; A's is in flight
    A.progress.progress.reset() // A presses Reset (saved at once: queued behind the in-flight save)
    const errors: (string | null)[] = []
    for (let i = 0; i < 40; i++) {
      await settle(50)
      errors.push(A.account.account.get().error)
    }
    await settle(10_000)
    w.log(`END server ${server(w)}; A ${local(A)}; errors seen ${[...new Set(errors)].join(' / ')}`)
    expect(errors.every((e) => e === null)).toBe(true)
  })

  it('F9 progress made while an offline "Delete my saved progress" is pending is wiped when the delete lands', async () => {
    name = 'F9-progress-during-pending-delete'
    w = new World(1, 1)
    seedServer(w, st({ lessons: { 'g1/l0': D1 } }), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, st({ lessons: { 'g1/l0': D1 } }))
    const a = await w.openPage(b)
    await settle(3000)
    w.setOnline(b, false)
    void a.account.account.deleteCloudProgress() // "Deleting..." stays up while offline
    await settle(60_000)
    a.progress.progress.markLesson('g1/studiedAfter', true) // the student carries on studying meanwhile
    await settle(60_000)
    w.setOnline(b, true)
    await settle(10_000)
    w.log(`END server ${JSON.stringify(server(w))}; device ${local(a)}`)
    expect(local(a)).toContain('studiedAfter')
  })

  it('F10 offline: signing out in one tab discards another tab\'s unsaved progress without the unsaved warning', async () => {
    name = 'F10-signout-other-tab-unsaved'
    w = new World(1, 1)
    seedServer(w, st({ lessons: { 'g1/l0': D1 } }), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, st({ lessons: { 'g1/l0': D1 } }))
    const x = await w.openPage(b)
    const y = await w.openPage(b)
    await settle(3000)
    w.setOnline(b, false)
    x.progress.progress.markLesson('g1/studiedInX', true) // tab X: progress that can't be saved yet (offline)
    await settle(5000)
    let result = ''
    void y.account.account.signOut().then((r: string) => (result = r)) // tab Y: Sign out
    await settle(8000)
    w.log(`signOut in tab Y -> ${result}; tab Y error ${y.account.account.get().error}; tab X now ${local(x)} (${x.account.account.get().status})`)
    w.setOnline(b, true)
    await settle(10_000)
    w.log(`END server ${server(w)}`)
    expect(result === 'unsaved' || (server(w) ?? []).includes('studiedInX')).toBe(true)
  })

  it('P1 (expected to pass) a v1 document is read, merged and upgraded; a keepalive against it is refused cleanly', async () => {
    name = 'P1-v1-doc'
    w = new World(1, 1)
    const v1 = st({ lessons: { 'g1/old': D1 }, answers: { 'g1/t0.q1': [true] } })
    w.server.docs.set('g1', { fields: { data: JSON.stringify(v1), v: 1, updatedAt: 'then' }, version: 1, K: new Set() })
    const b = await w.newBrowser('g1')
    b.ls.set('progress-owner', JSON.stringify('g1'))
    const a = await w.openPage(b)
    await settle(3000)
    expect(local(a)).toEqual(['old', 't0.q1'])
    // keepalive while the doc is still v1: refused by the rules (data field), nothing written
    a.progress.progress.markLesson('g1/new', true)
    a.dispatch('pagehide')
    await settle(10_000)
    const f = w.server.get('g1').fields!
    w.log(`END fields ${Object.keys(f).sort()} server ${server(w)}`)
    expect(f.v).toBe(2)
    expect(f.data).toBeUndefined()
    expect(server(w)).toEqual(['new', 'old', 't0.q1'])
  })
})
