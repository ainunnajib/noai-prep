/*
  The access checks and the accounts switch, with accounts off (the default build) and on.
  The config is read from import.meta.env when the module first loads, so each "on" case stubs the env,
  resets the module registry and imports the accounts module afresh.
  Run: npx vitest run tests/accounts
*/
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as off from '../../src/lib/accounts'
import type { AccountState } from '../../src/lib/accounts'

const base: AccountState = {
  status: 'signed-in',
  user: { uid: 'u', email: 'student@example.com', name: null, photoURL: null, provider: 'google' },
  access: 'none',
  accessKnown: true,
  syncing: false,
  lastSyncedAt: null,
  error: null,
}
const FIREBASE_ENV = {
  VITE_FIREBASE_API_KEY: 'x',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo-noai.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'demo-noai',
  VITE_FIREBASE_APP_ID: '1:1:web:1',
}

async function fresh(env: Record<string, string>) {
  vi.resetModules()
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v)
  const [accounts, config] = await Promise.all([import('../../src/lib/accounts'), import('../../src/lib/accounts/config')])
  return { accounts, config }
}

afterEach(() => {
  vi.unstubAllEnvs()
  localStorage.clear()
})

describe('accounts off (no Firebase config at build time)', () => {
  it('is disabled and lets everyone see everything', () => {
    expect(off.ACCOUNTS_ENABLED).toBe(false)
    const s = off.account.get()
    expect(s.status).toBe('disabled')
    for (const st of [s, base, { ...base, status: 'signed-out' as const, user: null }]) {
      expect(off.hasFullAccess(st)).toBe(true)
      expect(off.canViewLesson(st, 'neural-networks')).toBe(true)
      expect(off.canUseGatedTools(st)).toBe(true)
      expect(off.isAccessPending(st)).toBe(false)
    }
  })

  it('every method is a harmless no-op', async () => {
    const before = off.account.get()
    off.account.init()
    await off.account.signIn('google')
    await off.account.signOut()
    await off.account.startCheckout()
    await off.account.refreshAccess()
    await off.account.deleteCloudProgress()
    await off.account.deleteAccount()
    expect(await off.account.confirmCheckout('cs_test_x')).toBe('none')
    expect(off.account.get()).toBe(before)
  })

  it('still knows which modules are free', () => {
    expect(off.isFreeModule('start-here')).toBe(true)
    expect(off.isFreeModule('ai-first-look')).toBe(true)
    expect(off.isFreeModule('neural-networks')).toBe(false)
  })
})

describe('accounts on', () => {
  it('switches on with the four Firebase values, and not with three', async () => {
    const all = await fresh(FIREBASE_ENV)
    expect(all.config.firebaseConfig).toEqual({ apiKey: 'x', authDomain: 'demo-noai.firebaseapp.com', projectId: 'demo-noai', appId: '1:1:web:1' })
    expect(all.config.ACCOUNTS_ENABLED).toBe(true)
    expect(all.config.ACCOUNTS_MOCK).toBe(false)
    expect(all.config.FUNCTIONS_REGION).toBe('asia-southeast1')
    expect(all.accounts.account.get().status).toBe('loading')

    vi.unstubAllEnvs()
    const three = await fresh({ ...FIREBASE_ENV, VITE_FIREBASE_APP_ID: '' })
    expect(three.config.firebaseConfig).toBeNull()
    expect(three.config.ACCOUNTS_ENABLED).toBe(false)
  })

  it('reads the functions region and the mock switch', async () => {
    const { config } = await fresh({ VITE_ACCOUNTS_MOCK: '1', VITE_FIREBASE_FUNCTIONS_REGION: 'europe-west1' })
    expect(config.ACCOUNTS_MOCK).toBe(true)
    expect(config.ACCOUNTS_ENABLED).toBe(true)
    expect(config.firebaseConfig).toBeNull()
    expect(config.FUNCTIONS_REGION).toBe('europe-west1')
  })

  it('locks everything but the free modules without paid or invited access', async () => {
    const { accounts: a } = await fresh({ VITE_ACCOUNTS_MOCK: '1' })
    const signedOut: AccountState = { ...base, status: 'signed-out', user: null }
    for (const s of [signedOut, base]) {
      expect(a.hasFullAccess(s)).toBe(false)
      expect(a.canUseGatedTools(s)).toBe(false)
      expect(a.canViewLesson(s, 'start-here')).toBe(true)
      expect(a.canViewLesson(s, 'ai-first-look')).toBe(true)
      expect(a.canViewLesson(s, 'neural-networks')).toBe(false)
    }
    for (const access of ['paid', 'whitelist'] as const) {
      const s = { ...base, access }
      expect(a.hasFullAccess(s)).toBe(true)
      expect(a.canUseGatedTools(s)).toBe(true)
      expect(a.canViewLesson(s, 'neural-networks')).toBe(true)
    }
  })

  it('treats access as pending while loading or before the entitlement is heard', async () => {
    const { accounts: a } = await fresh({ VITE_ACCOUNTS_MOCK: '1' })
    expect(a.isAccessPending({ ...base, status: 'loading', user: null, accessKnown: false })).toBe(true)
    expect(a.isAccessPending({ ...base, accessKnown: false })).toBe(true)
    expect(a.isAccessPending(base)).toBe(false)
    expect(a.isAccessPending({ ...base, status: 'signed-out', user: null, accessKnown: false })).toBe(false)
    expect(a.isAccessPending({ ...base, status: 'loading', access: 'paid', accessKnown: false })).toBe(false) // the hint already grants it
  })

  it('starts from the access hint, so a returning paid user sees no lock while sign-in is restored', async () => {
    localStorage.setItem('noai-prep:access-hint', JSON.stringify({ uid: 'u', access: 'paid' }))
    const { accounts: a } = await fresh({ VITE_ACCOUNTS_MOCK: '1' })
    const s = a.account.get()
    expect(s.status).toBe('loading')
    expect(s.accessKnown).toBe(false)
    expect(a.hasFullAccess(s)).toBe(true)
  })

  it('ignores a damaged access hint', async () => {
    localStorage.setItem('noai-prep:access-hint', JSON.stringify({ uid: 'u', access: 'everything' }))
    const { accounts: a } = await fresh({ VITE_ACCOUNTS_MOCK: '1' })
    expect(a.account.get().access).toBe('none')
  })
})
