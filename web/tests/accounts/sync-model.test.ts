/*
  Multi-tab, multi-device scenarios against the real modules: each tab is a fresh instance of lib/progress and
  lib/accounts/{index,sync} (its own module registry), with storage bound to its browser, over a model of Firestore that
  enforces backend/firestore.rules (see model/world.ts). Fixed 50 ms network latency, fake timers: deterministic.
  Each test is a situation an earlier version of the sync engine got wrong (named F1 to F10 when they were found),
  asserting the right outcome. On a failure, the trace of what each tab and the server did is printed.
  Run: npx vitest run tests/accounts/sync-model.test.ts
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeAll, beforeEach, describe, expect, it, onTestFailed, vi } from 'vitest'
import { toDoc } from '../../src/lib/accounts/progress-doc'
import { DELETE_PROGRESS_ERROR } from '../../src/lib/accounts/errors'
import { DELETE_WAIT_MS } from '../../src/lib/accounts/sync'
import * as crdt from '../../src/lib/progress-crdt'
import type { ProgressState, SyncState } from '../../src/lib/progress-crdt'
import { KNOBS, T0, World, type Browser, type Page } from './model/world'

/** A state with these lessons ticked, an hour before the tests start (minutes apart). */
const ticked = (...lessons: string[]) => lessons.reduce((s, k, i) => crdt.markLesson(s, `g1/${k}`, true, T0 - 3_600_000 + i * 60_000), crdt.empty())
const settle = (ms: number) => vi.advanceTimersByTimeAsync(ms)
const strip = (k: string) => k.replace(/^g1\//, '')
const keys = (s: ProgressState) => [...Object.keys(s.lessons), ...Object.keys(s.checkpoints), ...Object.keys(s.answers)].map(strip).sort()
const local = (p: Page) => keys(p.progress.progress.get())
const server = (w: World, uid = 'g1') => {
  const s = w.server.state(uid)
  return s ? keys(crdt.project(s)) : null
}
/** someone else's progress, without their uid in front of each key */
const theirs = (s: ProgressState | SyncState | null, uid: string) => {
  const p = s === null ? null : 'v' in s ? crdt.project(s) : s
  return p ? [...Object.keys(p.lessons), ...Object.keys(p.answers)].map((k) => k.replace(`${uid}/`, '')).sort() : null
}
function seedServer(w: World, s: SyncState, rev: number, uid = 'g1') {
  w.server.docs.set(uid, { fields: { ...toDoc(s, rev), updatedAt: 'then' }, version: rev, createdAt: 0 })
}
/** This browser's copy, as left by an earlier visit signed in as uid. */
function seedBrowser(b: Browser, s: SyncState, uid = 'g1') {
  b.ls.set('progress-v1', JSON.stringify({ ...crdt.toJSON(s), owner: uid }))
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
  Object.assign(KNOBS, { fixedLat: 50, landAfterDisconnect: 0, keepalive: true, reorder: 0, tabCache: 0, authLag: 0 })
  onTestFailed(() => console.log(`---- ${name} ----\n${w?.trace.join('\n')}`))
})

describe('tabs and devices, modelled', () => {
  it('F1 two tabs that load together: the second tab’s first merge deletes progress made on another device', async () => {
    name = 'F1-two-tabs-load'
    w = new World(1, 1)
    // the account has a lesson ticked on the phone (rev 2); this laptop browser last synced at rev 1
    seedServer(w, ticked('l0', 'phone'), 2)
    const b = await w.newBrowser('g1')
    seedBrowser(b, ticked('l0'))
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
    seedServer(w, ticked('l0'), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, ticked('l0'))
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
    seedServer(w, ticked('l0'), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, ticked('l0'))
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
    seedServer(w, ticked('l0'), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, ticked('l0'))
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
    seedServer(w, ticked('l0'), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, ticked('l0'))
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
    seedServer(w, ticked('l0'), 1)
    const ba = await w.newBrowser('g1')
    seedBrowser(ba, ticked('l0'))
    const bb = await w.newBrowser('g1')
    seedBrowser(bb, ticked('l0'))
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
    const a = await w.openPage(b)
    await settle(3000)
    a.progress.progress.markLesson('g1/l0', true)
    await settle(300)
    void a.account.account.deleteCloudProgress() // "Deleting..."
    await settle(20)
    a.dispatch('pagehide') // e.g. the student switches away (bfcache): any flush does the same
    await settle(10_000)
    w.log(`END server ${server(w)}; device ${local(a)}; device error ${a.account.account.get().error}`)
    expect(server(w)).toEqual([]) // (the Reset is saved: a new account's copy then holds just that)
    expect(local(a)).toEqual([])
    expect(a.account.account.get().error).toBeNull()
  })

  it("F5b offline, \"Delete my saved progress\" says it hasn't reached the account yet (not that it failed); it does once back online", async () => {
    name = 'F5b-delete-offline'
    w = new World(1, 1)
    const b = await w.newBrowser('g1')
    const a = await w.openPage(b)
    await settle(3000)
    a.progress.progress.markLesson('g1/l0', true)
    await settle(3000)
    expect(server(w)).toEqual(['l0'])
    w.setOnline(b, false)
    const deleting = a.account.account.deleteCloudProgress()
    await settle(DELETE_WAIT_MS + 100)
    expect(await deleting).toBe('pending')
    expect(a.account.account.get().error ?? '').not.toMatch(/Couldn't delete/)
    expect(a.account.account.get().syncing).toBe(true) // ("Saving to your account…")
    expect(local(a)).toEqual([])
    a.dispatch('pagehide')
    await settle(2000)
    w.setOnline(b, true)
    await settle(10_000)
    w.log(`END server ${server(w)}; device ${local(a)}`)
    expect(server(w)).toEqual([])
    expect(local(a)).toEqual([])
    expect(a.account.account.get().error).toBeNull()
  })

  it("F5c \"Delete my saved progress\" in a tab whose browser copy isn't its person's any more says it couldn't, and resets nothing", async () => {
    name = 'F5c-delete-not-theirs'
    w = new World(1, 1)
    const b = await w.newBrowser('g1')
    const a = await w.openPage(b)
    await settle(3000)
    a.progress.progress.markLesson('g1/l0', true)
    await settle(3000)
    b.ls.delete('progress-v1') // (signed out in another tab, which this one hasn't heard yet)
    expect(await a.account.account.deleteCloudProgress()).toBe('failed')
    expect(a.account.account.get().error).toBe(DELETE_PROGRESS_ERROR)
    await settle(10_000)
    expect(server(w)).toEqual(['l0'])
    expect(w.server.state('g1')!.resetAt).toBe(0)
  })

  it('F6 a save queued before another device deleted the saved progress never brings it back', async () => {
    name = 'F6-rev-reuse-after-delete'
    w = new World(1, 1)
    seedServer(w, ticked('l0'), 1)
    const ba = await w.newBrowser('g1')
    seedBrowser(ba, ticked('l0'))
    const bb = await w.newBrowser('g1')
    seedBrowser(bb, ticked('l0'))
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
    seedServer(w, ticked('l0'), 1)
    const ba = await w.newBrowser('g1')
    seedBrowser(ba, ticked('l0'))
    const bb = await w.newBrowser('g1')
    seedBrowser(bb, ticked('l0'))
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
    seedServer(w, ticked('l0'), 1)
    const ba = await w.newBrowser('g1')
    seedBrowser(ba, ticked('l0'))
    const bb = await w.newBrowser('g1')
    seedBrowser(bb, ticked('l0'))
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
    seedServer(w, ticked('l0'), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, ticked('l0'))
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
    seedServer(w, ticked('l0'), 1)
    const b = await w.newBrowser('g1')
    seedBrowser(b, ticked('l0'))
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

  it('V1 a Reset made while signed out erases only that browser\'s copy: signing in afterwards keeps the account\'s progress everywhere', async () => {
    name = 'V1-visitor-reset-then-sign-in'
    w = new World(1, 1)
    const b0 = await w.newBrowser('g1')
    const p0 = await w.openPage(b0)
    await settle(3000)
    p0.progress.progress.markLesson('g1/l1', true)
    p0.progress.progress.markLesson('g1/l2', true)
    await settle(10_000)
    const b1 = await w.newBrowser(null) // another computer, nobody signed in
    const p1 = await w.openPage(b1)
    await settle(60_000)
    p1.progress.progress.markLesson('g1/visitor-before', true)
    p1.progress.progress.reset() // "Erase ... from this browser?"
    p1.progress.progress.markLesson('g1/visitor-after', true)
    await settle(1000)
    void p1.account.account.signIn('google')
    await settle(30_000)
    w.log(`END server ${server(w)}; p0 ${local(p0)}; p1 ${local(p1)}`)
    expect(server(w)).toEqual(['l1', 'l2', 'visitor-after'])
    expect(w.server.state('g1')!.resetAt).toBe(0)
    expect(local(p0)).toEqual(['l1', 'l2', 'visitor-after'])
    expect(local(p1)).toEqual(['l1', 'l2', 'visitor-after'])
  })

  it('D1 a device asleep while "Delete my account" failed half-way elsewhere (copy deleted, then created again) saves what the new copy lacks', async () => {
    name = 'D1-copy-recreated-lower-rev'
    w = new World(1, 1)
    const b0 = await w.newBrowser('g1')
    const b1 = await w.newBrowser('g1')
    const d1 = await w.openPage(b0)
    const d2 = await w.openPage(b1)
    await settle(3000)
    d1.progress.progress.markLesson('g1/l1', true)
    await settle(10_000)
    w.setOnline(b0, false) // d1 never hears of Z
    d2.progress.progress.markLesson('g1/Z', true)
    await settle(10_000)
    expect(w.server.get('g1').fields!.rev).toBe(2)
    w.setOnline(b1, false) // d2 sleeps
    w.deleteUserFails = 1 // the copy is deleted, then deleting the account fails (the sign-in pop-up closed)
    void d1.account.account.deleteAccount()
    await settle(1000)
    w.setOnline(b0, true)
    await settle(30_000)
    expect(w.server.get('g1').fields!.rev).toBe(1) // (d1 saved its copy again, as a new one)
    expect(server(w)).toEqual(['l1'])
    w.setOnline(b1, true) // d2 wakes: its listener hears only revision 1
    await settle(30_000)
    w.log(`END server ${server(w)}; d1 ${local(d1)}; d2 ${local(d2)} unsaved ${d2.sync.hasUnsaved()}`)
    expect(server(w)).toEqual(['Z', 'l1'])
    expect(local(d1)).toEqual(['Z', 'l1'])
    expect(d2.sync.hasUnsaved()).toBe(false)
    let result = ''
    void d2.account.account.signOut().then((r: string) => (result = r))
    await settle(10_000)
    expect(result).toBe('done')
    expect(server(w)).toEqual(['Z', 'l1'])
  })

  for (const tabCache of [0, 2]) {
    const storage = tabCache ? 'Chromium-like per-tab localStorage' : 'shared localStorage'
    it(`L1 a background tab hearing late that its person signed out leaves the next person's progress alone (${storage}; their tab closed offline)`, async () => {
      name = `L1-late-tab-next-person-closed-offline-${tabCache}`
      Object.assign(KNOBS, { authLag: 30_000, tabCache }) // tabs in the background hear auth changes 30 s late
      w = new World(1, 1)
      const b = await w.newBrowser('g1')
      const A = await w.openPage(b) // g1's tab, in the background
      const B = await w.openPage(b)
      await settle(3000)
      void B.account.account.signOut()
      await settle(6000)
      void B.account.account.signIn('apple')
      await settle(5000)
      expect(B.account.account.get().user.uid).toBe('a1')
      w.setOnline(b, false)
      B.progress.progress.markLesson('a1/x', true)
      B.progress.progress.recordAnswer('a1/t.q1', true)
      await settle(2000)
      w.closePage(B, 'close') // (offline: it is all in this browser's storage)
      await settle(25_000) // tab A hears of a1 now (it never heard g1 sign out)
      expect(A.account.account.get().user.uid).toBe('a1')
      w.setOnline(b, true)
      await settle(30_000)
      w.log(`END a1 ${theirs(w.server.state('a1'), 'a1')}; A ${theirs(A.progress.progress.get(), 'a1')}`)
      expect(theirs(w.server.state('a1'), 'a1')).toEqual(['t.q1', 'x'])
      expect(theirs(A.progress.progress.get(), 'a1')).toEqual(['t.q1', 'x'])
    })

    for (const offline of [true, false]) {
      it(`L2 the same while the next person's tab is open (${storage}; ${offline ? 'offline' : 'online, changed in the last 1.5 s'})`, async () => {
        name = `L2-late-tab-next-person-open-${tabCache}-${offline}`
        Object.assign(KNOBS, { authLag: 30_000, tabCache })
        w = new World(1, 1)
        const b = await w.newBrowser('g1')
        const A = await w.openPage(b)
        const B = await w.openPage(b)
        await settle(3000)
        B.progress.progress.markLesson('g1/l1', true)
        await settle(10_000)
        void B.account.account.signOut()
        await settle(6000)
        void B.account.account.signIn('apple')
        await settle(offline ? 5000 : 23_800)
        B.progress.progress.markLesson('a1/x', true)
        if (offline) w.setOnline(b, false)
        await settle(offline ? 25_000 : 1000) // tab A hears of a1 meanwhile
        expect(A.account.account.get().user.uid).toBe('a1')
        w.setOnline(b, true)
        await settle(30_000)
        w.log(`END a1 ${theirs(w.server.state('a1'), 'a1')}; A ${theirs(A.progress.progress.get(), 'a1')}; B ${theirs(B.progress.progress.get(), 'a1')}`)
        expect(theirs(w.server.state('a1'), 'a1')).toEqual(['x'])
        expect(theirs(B.progress.progress.get(), 'a1')).toEqual(['x'])
        expect(theirs(A.progress.progress.get(), 'a1')).toEqual(['x'])
        expect(server(w)).toEqual(['l1'])
      })
    }

    it(`L3 a background tab hearing late that its person signed out leaves the visitor progress made since alone (${storage})`, async () => {
      name = `L3-late-tab-visitor-${tabCache}`
      Object.assign(KNOBS, { authLag: 30_000, tabCache })
      w = new World(1, 1)
      const b = await w.newBrowser('g1')
      const t1 = await w.openPage(b)
      const t2 = await w.openPage(b) // in the background
      await settle(3000)
      t1.progress.progress.markLesson('g1/l1', true)
      await settle(3000)
      void t1.account.account.signOut()
      await settle(6000)
      for (const k of ['v/a', 'v/b', 'v/c']) t1.progress.progress.markLesson(k, true) // a visitor now
      await settle(30_000) // tab 2 hears of the sign-out now
      expect(t2.account.account.get().status).toBe('signed-out')
      const visitor = (p: Page) => Object.keys(p.progress.progress.get().lessons).sort()
      w.log(`END t1 ${visitor(t1)}; t2 ${visitor(t2)}`)
      expect(visitor(t1)).toEqual(['v/a', 'v/b', 'v/c'])
      expect(visitor(t2)).toEqual(['v/a', 'v/b', 'v/c'])
      expect(Object.keys(JSON.parse(b.ls.get('progress-v1')!).lessons).sort()).toEqual(['v/a', 'v/b', 'v/c'])
      expect(server(w)).toEqual(['l1'])
    })
  }

  it('P1 a document in an earlier format is replaced by this format on the next save', async () => {
    name = 'P1-old-doc'
    w = new World(1, 1)
    const v2 = { lessons: '{"g1/old":"2026-10-01T00:00:00.000Z"}', checkpoints: '{}', exams: '[]', v: 2, rev: 4, updatedAt: 'then' }
    w.server.docs.set('g1', { fields: v2, version: 4, createdAt: 0 })
    const b = await w.newBrowser('g1')
    const a = await w.openPage(b)
    await settle(3000)
    expect(local(a)).toEqual([])
    a.progress.progress.markLesson('g1/new', true)
    a.dispatch('pagehide') // (the save sent as the page closes is refused: the document lacks this format's parts)
    await settle(10_000)
    const f = w.server.get('g1').fields!
    w.log(`END fields ${Object.keys(f).sort()} server ${server(w)}`)
    expect(f).toMatchObject({ v: 3, rev: 5 })
    expect(server(w)).toEqual(['new'])
  })
})
