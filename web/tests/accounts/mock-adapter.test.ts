/*
  The dev/e2e mock backend on its own, then the account store driving it (VITE_ACCOUNTS_MOCK=1).
  Real timers: every mock call waits about 150 ms.
  Run: npx vitest run tests/accounts
*/
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockAdapter } from '../../src/lib/accounts/mock-adapter'
import * as crdt from '../../src/lib/progress-crdt'
import { authErrorMessage, SIGN_OUT_UNSAVED_ERROR, SYNC_ERROR } from '../../src/lib/accounts/errors'
import type { AccountUser } from '../../src/lib/accounts/types'

const KEY = (k: string) => `noai-prep:${k}`
const seed = (k: string, v: unknown) => localStorage.setItem(KEY(k), typeof v === 'string' ? v : JSON.stringify(v))
const read = (k: string) => JSON.parse(localStorage.getItem(KEY(k)) ?? 'null')
const D1 = '2026-03-01T00:00:00.000Z'
const T1 = Date.parse(D1)
/** The stored copy's lessons that are ticked. */
const ticked = (k: string) => Object.keys(crdt.project(crdt.fromJSON(read(k))).lessons).sort()

beforeEach(() => localStorage.clear())

describe('mock adapter', () => {
  it('signs in with Google and Apple as the documented pretend users', async () => {
    const a = createMockAdapter()
    const seen: (AccountUser | null)[] = []
    a.onUser((u) => seen.push(u))
    await vi.waitFor(() => expect(seen).toEqual([null]))
    await a.signIn('google')
    expect(seen.at(-1)).toEqual({ uid: 'mock-google', email: 'student@example.com', name: 'Sam Student', photoURL: null, provider: 'google' })
    expect(read('mock-auth').uid).toBe('mock-google')
    await a.signOut()
    expect(seen.at(-1)).toBeNull()
    await a.signIn('apple')
    expect(seen.at(-1)).toMatchObject({ uid: 'mock-apple', email: 'abc123@privaterelay.appleid.com', name: null, provider: 'apple' })
  })

  it('restores a seeded user, so tests can sign in as anyone', async () => {
    seed('mock-auth', { uid: 'u-seeded', email: 'someone@example.com', name: 'Someone', provider: 'google' })
    const a = createMockAdapter()
    const user = await new Promise<AccountUser | null>((resolve) => a.onUser(resolve))
    expect(user).toMatchObject({ uid: 'u-seeded', email: 'someone@example.com' })
  })

  it('gives the whitelisted example user access, and takes it away when they leave the list', async () => {
    seed('mock-auth', { uid: 'u-w', email: ' Whitelisted@Example.com ', name: null, provider: 'google' })
    const a = createMockAdapter()
    expect(await a.syncAccess()).toBe('whitelist')
    expect(read('mock-entitlements')).toEqual({ 'u-w': 'whitelist' })
    seed('mock-auth', { uid: 'u-w', email: 'someone-else@example.com', name: null, provider: 'google' })
    expect(await a.syncAccess()).toBe('none')
    expect(read('mock-entitlements')).toEqual({})
  })

  it("doesn't give access to anyone else", async () => {
    const a = createMockAdapter()
    await a.signIn('google')
    expect(await a.syncAccess()).toBe('none')
  })

  it('checkout: sends you to the success page, and confirming grants paid access live', async () => {
    const a = createMockAdapter()
    await a.signIn('google')
    const live: string[] = []
    a.watchAccess('mock-google', (acc) => live.push(acc), () => {})
    await vi.waitFor(() => expect(live).toEqual(['none']))
    expect(await a.createCheckoutSession()).toEqual({ url: './?checkout=success&session_id=cs_test_mock#/account' })
    expect(await a.confirmCheckout('cs_test_other')).toEqual({ access: 'none', status: 'unpaid' })
    expect(await a.confirmCheckout('cs_test_mock')).toEqual({ access: 'paid', status: 'paid' })
    expect(live.at(-1)).toBe('paid')
    expect(read('mock-entitlements')).toEqual({ 'mock-google': 'paid' })
    expect(await a.createCheckoutSession()).toEqual({ alreadyUnlocked: true })
  })

  it('a seeded mock-checkout-fail makes confirming report no payment', async () => {
    seed('mock-checkout-fail', '1')
    const a = createMockAdapter()
    await a.signIn('google')
    expect(await a.confirmCheckout('cs_test_mock')).toEqual({ access: 'none', status: 'unpaid' })
    expect(read('mock-entitlements')).toBeNull()
  })

  it('a seeded mock-signin-error fails sign-in with that code', async () => {
    seed('mock-signin-error', 'auth/popup-blocked')
    const a = createMockAdapter()
    const err = await a.signIn('google').catch((e: unknown) => e)
    expect(err).toMatchObject({ code: 'auth/popup-blocked' })
    expect(authErrorMessage(err)).toMatch(/blocked the sign-in window/)
    expect(read('mock-auth')).toBeNull()
  })

  it('keeps the "account copy" of progress per user, for the signed-in user only', async () => {
    const a = createMockAdapter()
    await expect(a.readProgress('mock-google')).rejects.toMatchObject({ code: 'unauthenticated' })
    await a.signIn('google')
    expect(await a.readProgress('mock-google')).toEqual({ state: null, rev: 0 })
    const s = crdt.markLesson(crdt.empty(), 'm/a', true, T1)
    const snaps: unknown[] = []
    a.watchProgress('mock-google', (snap) => snaps.push(snap), () => {})
    await a.writeProgress('mock-google', s, 1)
    expect(read('mock-remote-progress:mock-google')).toEqual(crdt.toJSON(s))
    expect(snaps[0]).toEqual({ state: s, rev: 1, hasPendingWrites: true }) // its own write echoes as pending, like Firestore
    expect(await a.readProgress('mock-google')).toEqual({ state: s, rev: 1 })
    await expect(a.writeProgress('someone-else', s, 1)).rejects.toMatchObject({ code: 'permission-denied' })
    await a.deleteProgress('mock-google')
    expect(await a.readProgress('mock-google')).toEqual({ state: null, rev: 0 })
    // a seeded copy in the old plain format reads as this browser's would
    seed('mock-remote-progress:mock-google', { lessons: { 'm/old': D1 }, checkpoints: {}, answers: {}, exams: [] })
    expect(crdt.project((await a.readProgress('mock-google')).state!).lessons).toEqual({ 'm/old': D1 })
  })

  it('like the rules, refuses a save that is not the next revision, then shows the account copy as it is', async () => {
    const a = createMockAdapter()
    await a.signIn('google')
    const s = crdt.markLesson(crdt.empty(), 'm/a', true, T1)
    await a.writeProgress('mock-google', s, 1)
    const snaps: unknown[] = []
    a.watchProgress('mock-google', (snap) => snaps.push(snap), () => {})
    await expect(a.writeProgress('mock-google', crdt.empty(), 1)).rejects.toMatchObject({ code: 'permission-denied' })
    await vi.waitFor(() => expect(snaps).toContainEqual({ state: s, rev: 1, hasPendingWrites: false }))
    expect(read('mock-remote-progress:mock-google')).toEqual(crdt.toJSON(s))
  })

  it('a seeded mock-sync-fail makes saving fail', async () => {
    seed('mock-sync-fail', '1')
    const a = createMockAdapter()
    await a.signIn('google')
    await expect(a.writeProgress('mock-google', crdt.empty(), 1)).rejects.toBeTruthy()
  })
})

describe('account store with the mock backend', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_ACCOUNTS_MOCK', '1')
  })
  type Loaded = typeof import('../../src/lib/accounts') & { progress: typeof import('../../src/lib/progress').progress }
  let loaded: Loaded | null = null
  afterEach(async () => {
    await loaded?.account.signOut({ force: true }) // so nothing from this test's store keeps running into the next
    loaded = null
    vi.unstubAllEnvs()
  })

  async function load(): Promise<Loaded> {
    const [accounts, prog] = await Promise.all([import('../../src/lib/accounts'), import('../../src/lib/progress')])
    loaded = { ...accounts, progress: prog.progress }
    return loaded
  }

  it('starts signed out, then signs in with Google: no access until paid', async () => {
    const { account, hasFullAccess, canViewLesson } = await load()
    expect(account.get().status).toBe('loading')
    account.init()
    account.init() // a second call does nothing
    await vi.waitFor(() => expect(account.get().status).toBe('signed-out'))
    await account.signIn('google')
    await vi.waitFor(() => expect(account.get()).toMatchObject({ status: 'signed-in', accessKnown: true, access: 'none' }))
    const s = account.get()
    expect(s.user?.email).toBe('student@example.com')
    expect(hasFullAccess(s)).toBe(false)
    expect(canViewLesson(s, 'start-here')).toBe(true)
    expect(canViewLesson(s, 'neural-networks')).toBe(false)
  })

  it('confirming the mock checkout unlocks everything and remembers the access hint', async () => {
    const { account, hasFullAccess } = await load()
    account.init()
    await account.signIn('google')
    await vi.waitFor(() => expect(account.get().accessKnown).toBe(true))
    expect(await account.confirmCheckout('cs_test_mock')).toBe('paid')
    expect(account.get().access).toBe('paid')
    expect(hasFullAccess(account.get())).toBe(true)
    expect(read('access-hint')).toEqual({ uid: 'mock-google', access: 'paid' })
    await account.startCheckout() // already unlocked: no payment page, just a refresh
    expect(account.get()).toMatchObject({ access: 'paid', error: null })
  })

  it("a failed confirmation leaves access as it was and doesn't throw", async () => {
    seed('mock-checkout-fail', '1')
    const { account } = await load()
    account.init()
    await account.signIn('google')
    await vi.waitFor(() => expect(account.get().accessKnown).toBe(true))
    expect(await account.confirmCheckout('cs_test_mock')).toBe('none')
    expect(account.get()).toMatchObject({ access: 'none', error: null }) // the page keeps waiting for the live update
  })

  it('a payment check that fails says why, and stays quiet once the account is unlocked anyway', async () => {
    let failWith: { code: string } = { code: 'functions/unavailable' }
    vi.doMock('../../src/lib/accounts/mock-adapter', async (importOriginal) => {
      const m = await importOriginal<typeof import('../../src/lib/accounts/mock-adapter')>()
      return {
        createMockAdapter: () => ({
          ...m.createMockAdapter(),
          confirmCheckout: async () => Promise.reject(Object.assign(new Error('failed'), failWith)),
        }),
      }
    })
    try {
      const { account } = await load()
      account.init()
      await account.signIn('google')
      await vi.waitFor(() => expect(account.get().accessKnown).toBe(true))
      // paid while signed in with another account
      failWith = { code: 'functions/permission-denied' }
      expect(await account.confirmCheckout('cs_test_mock')).toBe('none')
      expect(account.get().error).toMatch(/signed in with a different account/)
      // the server couldn't check the payment: shown until the unlock arrives (the webhook got there), then dropped
      failWith = { code: 'functions/unavailable' }
      await account.confirmCheckout('cs_test_mock')
      expect(account.get().error).toMatch(/We couldn't confirm your payment yet/)
      seed('mock-entitlements', { 'mock-google': 'paid' })
      window.dispatchEvent(new StorageEvent('storage', { key: KEY('mock-entitlements') })) // the live update
      expect(account.get()).toMatchObject({ access: 'paid', error: null })
      // already unlocked: a failed check has nothing to warn about
      await account.confirmCheckout('cs_test_mock')
      expect(account.get().error).toBeNull()
    } finally {
      vi.doUnmock('../../src/lib/accounts/mock-adapter')
    }
  })

  it('confirmCheckout waits for sign-in to be restored after the return from Stripe', async () => {
    seed('mock-auth', { uid: 'mock-google', email: 'student@example.com', name: 'Sam Student', provider: 'google' })
    const { account } = await load()
    account.init()
    expect(await account.confirmCheckout('cs_test_mock')).toBe('paid')
  })

  it('a seeded whitelisted user gets full access', async () => {
    seed('mock-auth', { uid: 'u-w', email: 'whitelisted@example.com', name: 'Invited', provider: 'google' })
    const { account, hasFullAccess } = await load()
    account.init()
    await vi.waitFor(() => expect(account.get().accessKnown).toBe(true))
    expect(account.get().access).toBe('whitelist')
    expect(hasFullAccess(account.get())).toBe(true)
  })

  it('anonymous progress is merged into the account, and seeded account progress appears', async () => {
    seed('mock-remote-progress:mock-google', { lessons: { 'm/remote': D1 }, checkpoints: {}, answers: {}, exams: [] })
    const { account, progress } = await load()
    progress.markLesson('m/anonymous')
    account.init()
    await account.signIn('google')
    await vi.waitFor(() => expect(Object.keys(progress.get().lessons).sort()).toEqual(['m/anonymous', 'm/remote']))
    await vi.waitFor(() => expect(ticked('mock-remote-progress:mock-google')).toEqual(['m/anonymous', 'm/remote']))
  })

  it("clears progress left by someone whose sign-in ended while the page was closed, instead of merging it into the next account", async () => {
    // A was signed in when the page closed; then their sign-in ended elsewhere (say, the account was deleted on another device)
    seed('progress-v1', { lessons: { 'm/A-secret': D1 }, checkpoints: {}, answers: {}, exams: [], owner: 'u-a' })
    const { account, progress } = await load()
    account.init()
    await vi.waitFor(() => expect(account.get().status).toBe('signed-out'))
    expect(progress.get().lessons).toEqual({})
    expect(read('progress-v1')).toBeNull()
    await account.signIn('google')
    await vi.waitFor(() => expect(account.get().lastSyncedAt).not.toBeNull())
    expect(read('mock-remote-progress:mock-google')).toBeNull()
    expect(read('progress-v1').owner).toBe('mock-google')
  })

  it("keeps this browser's progress when the same person's sign-in is restored", async () => {
    seed('progress-v1', { lessons: { 'm/mine': D1 }, checkpoints: {}, answers: {}, exams: [], owner: 'mock-google' })
    seed('mock-auth', { uid: 'mock-google', email: 'student@example.com', name: 'Sam Student', provider: 'google' })
    const { account, progress } = await load()
    account.init()
    await vi.waitFor(() => expect(account.get().lastSyncedAt).not.toBeNull())
    expect(progress.get().lessons).toEqual({ 'm/mine': D1 })
    expect(crdt.project(crdt.fromJSON(read('mock-remote-progress:mock-google'))).lessons).toEqual({ 'm/mine': D1 })
  })

  it('sign-out saves waiting progress, then clears this browser (the account keeps it)', async () => {
    const { account, progress } = await load()
    account.init()
    await account.signIn('google')
    await vi.waitFor(() => expect(account.get().lastSyncedAt).not.toBeNull())
    expect(read('progress-v1').owner).toBe('mock-google')
    progress.markLesson('m/a')
    expect(account.get().syncing).toBe(true)
    await account.signOut()
    expect(ticked('mock-remote-progress:mock-google')).toEqual(['m/a'])
    expect(progress.get().lessons).toEqual({})
    expect(read('progress-v1')).toBeNull()
    expect(read('access-hint')).toBeNull()
    expect(account.get()).toMatchObject({ status: 'signed-out', user: null, access: 'none' })
  })

  it("signing out with progress the account doesn't have yet asks first, and keeps it until told to sign out anyway", async () => {
    const { account, progress } = await load()
    account.init()
    await account.signIn('google')
    await vi.waitFor(() => expect(account.get().lastSyncedAt).not.toBeNull())
    seed('mock-sync-fail', '1')
    progress.markLesson('m/a')
    await vi.waitFor(() => expect(account.get().error).toBe(SYNC_ERROR), { timeout: 4000 })
    expect(await account.signOut()).toBe('unsaved')
    expect(account.get()).toMatchObject({ status: 'signed-in', error: SIGN_OUT_UNSAVED_ERROR })
    expect(ticked('progress-v1')).toEqual(['m/a'])
    // the connection comes back: it is saved, and signing out goes ahead
    localStorage.removeItem(KEY('mock-sync-fail'))
    expect(await account.signOut()).toBe('done')
    expect(ticked('mock-remote-progress:mock-google')).toEqual(['m/a'])
    expect(account.get()).toMatchObject({ status: 'signed-out', error: null })
  })

  it("signing out also asks first about progress another tab saved to this browser but not to the account", async () => {
    const { account, progress } = await load()
    account.init()
    await account.signIn('google')
    await vi.waitFor(() => expect(account.get().lastSyncedAt).not.toBeNull())
    seed('mock-sync-fail', '1') // offline
    // another signed-in tab ticks a lesson (its save fails too) and is closed; this tab never hears of it
    const theirs = crdt.markLesson(crdt.fromJSON(read('progress-v1')), 'm/other-tab', true, Date.now())
    seed('progress-v1', { ...crdt.toJSON(theirs), owner: 'mock-google' })
    expect(await account.signOut()).toBe('unsaved')
    expect(account.get().error).toBe(SIGN_OUT_UNSAVED_ERROR)
    expect(progress.get().lessons['m/other-tab']).toBeDefined()
    localStorage.removeItem(KEY('mock-sync-fail'))
    expect(await account.signOut()).toBe('done')
    expect(ticked('mock-remote-progress:mock-google')).toEqual(['m/other-tab'])
  })

  it('"sign out anyway" signs out and clears this browser, with no leftover message about it', async () => {
    const { account, progress } = await load()
    account.init()
    await account.signIn('google')
    await vi.waitFor(() => expect(account.get().lastSyncedAt).not.toBeNull())
    seed('mock-sync-fail', '1')
    progress.markLesson('m/a')
    expect(await account.signOut()).toBe('unsaved')
    expect(await account.signOut({ force: true })).toBe('done')
    expect(account.get()).toMatchObject({ status: 'signed-out', error: null })
    expect(read('progress-v1')).toBeNull()
  })

  it('a refund of an invited person who had paid falls back to the invite, without locking them out', async () => {
    seed('mock-auth', { uid: 'u-w', email: 'whitelisted@example.com', name: 'Invited', provider: 'google' })
    seed('mock-entitlements', { 'u-w': 'paid' }) // paid, then was invited
    const { account } = await load()
    account.init()
    await vi.waitFor(() => expect(account.get()).toMatchObject({ accessKnown: true, access: 'paid' }))
    const seen: string[] = []
    account.subscribe(() => seen.push(account.get().access))
    seed('mock-entitlements', { 'u-w': 'revoked' }) // a full refund
    window.dispatchEvent(new StorageEvent('storage', { key: KEY('mock-entitlements') }))
    await vi.waitFor(() => expect(account.get().access).toBe('whitelist'))
    expect(seen).not.toContain('none')
  })

  it('"Delete my saved progress" on another device stays deleted when this browser comes back, and later progress is kept', async () => {
    seed('progress-v1', { lessons: { 'm/old': D1 }, checkpoints: {}, answers: {}, exams: [], owner: 'mock-google' })
    seed('mock-auth', { uid: 'mock-google', email: 'student@example.com', name: 'Sam Student', provider: 'google' })
    // deleted on the phone after this browser's lesson; then a new lesson there
    const phone = crdt.markLesson(crdt.reset(crdt.empty(), T1 + 1000), 'm/new', true, T1 + 2000)
    seed('mock-remote-progress:mock-google', crdt.toJSON(phone))
    seed('mock-remote-rev:mock-google', 5)
    const { account, progress } = await load()
    account.init()
    await vi.waitFor(() => expect(account.get().lastSyncedAt).not.toBeNull())
    expect(Object.keys(progress.get().lessons)).toEqual(['m/new'])
    expect(ticked('mock-remote-progress:mock-google')).toEqual(['m/new'])
  })

  it("a save left hanging by the person who signed out doesn't block the next person's saves", async () => {
    let hangFor: string | null = null
    vi.doMock('../../src/lib/accounts/mock-adapter', async (importOriginal) => {
      const m = await importOriginal<typeof import('../../src/lib/accounts/mock-adapter')>()
      return {
        createMockAdapter: () => {
          const a = m.createMockAdapter()
          // like Firestore offline: this person's save never settles (and never will once they've signed out)
          return { ...a, writeProgress: (uid: string, s: crdt.SyncState, rev: number) => (uid === hangFor ? new Promise<void>(() => {}) : a.writeProgress(uid, s, rev)) }
        },
      }
    })
    try {
      const { account, progress } = await load()
      account.init()
      await account.signIn('google')
      await vi.waitFor(() => expect(account.get().lastSyncedAt).not.toBeNull())
      hangFor = 'mock-google'
      progress.markLesson('m/person-1')
      await new Promise((r) => setTimeout(r, 1700))
      const t0 = Date.now()
      expect(await account.signOut({ force: true })).toBe('done')
      expect(Date.now() - t0).toBeLessThan(1500) // "sign out anyway" comes after a full attempt to save: no second wait
      await account.signIn('apple')
      await vi.waitFor(() => expect(account.get().status).toBe('signed-in'))
      progress.markLesson('m/person-2')
      await vi.waitFor(() => expect(ticked('mock-remote-progress:mock-apple')).toEqual(['m/person-2']), { timeout: 4000 })
      await vi.waitFor(() => expect(account.get().syncing).toBe(false))
    } finally {
      vi.doUnmock('../../src/lib/accounts/mock-adapter')
    }
  })

  it('shows a sign-in error, and stays quiet when the popup is simply closed', async () => {
    const { account } = await load()
    account.init()
    seed('mock-signin-error', 'auth/popup-blocked')
    await account.signIn('google')
    expect(account.get().error).toMatch(/blocked the sign-in window/)
    seed('mock-signin-error', 'auth/popup-closed-by-user')
    await account.signIn('apple')
    expect(account.get().error).toBeNull()
    expect(account.get().status).toBe('signed-out')
  })

  it('a failed save shows the sync error and keeps the progress here', async () => {
    const { account, progress } = await load()
    account.init()
    await account.signIn('google')
    await vi.waitFor(() => expect(account.get().lastSyncedAt).not.toBeNull())
    seed('mock-sync-fail', '1')
    progress.markLesson('m/a')
    await vi.waitFor(() => expect(account.get().error).toMatch(/Couldn't save your progress/), { timeout: 4000 })
    expect(progress.get().lessons['m/a']).toBeDefined()
  })

  it('deleteCloudProgress empties the account copy (a Reset, as its next revision), and deleteAccount removes it', async () => {
    seed('mock-remote-progress:mock-google', { lessons: { 'm/remote': D1 }, checkpoints: {}, answers: {}, exams: [] })
    seed('mock-remote-rev:mock-google', 3)
    const { account, progress } = await load()
    account.init()
    await account.signIn('google')
    await vi.waitFor(() => expect(progress.get().lessons['m/remote']).toBeDefined())
    await account.deleteCloudProgress()
    expect(account.get().error).toBeNull()
    expect(read('mock-remote-progress:mock-google')).toMatchObject({ v: 3, lessons: {}, checkpoints: {}, answers: {}, exams: {} })
    expect(read('mock-remote-progress:mock-google').resetAt).toBeGreaterThan(0)
    expect(read('mock-remote-rev:mock-google')).toBe(4)
    expect(progress.get().lessons).toEqual({})
    progress.markLesson('m/b')
    await account.deleteAccount()
    expect(read('mock-remote-progress:mock-google')).toBeNull()
    expect(read('mock-auth')).toBeNull()
    expect(progress.get().lessons).toEqual({})
    expect(account.get().status).toBe('signed-out')
  })
})
