import { fromJSON, toJSON } from '../progress-crdt'
import { PREFIX, readJSON, removeKey, writeJSON } from '../storage'
import { accessFrom, revFrom, type AccountsAdapter, type ProgressSnapshot, type RemoteProgress } from './adapter'
import type { AccessLevel, AccountUser, SignInProvider } from './types'

/*
  A pretend account backend for development and end-to-end tests (built in only with VITE_ACCOUNTS_MOCK=1).
  No network: everything lives in this browser's localStorage, under these keys (each with the usual "noai-prep:"
  prefix), so tests can seed any situation:
    mock-auth                   the signed-in user {uid, email, name, provider}; absent when signed out
    mock-entitlements           uid -> 'whitelist' | 'paid' | 'revoked'
    mock-remote-progress:<uid>  the "account copy" of progress, standing in for another device: a SyncState (see
                                progress-crdt.ts), or progress in the old plain format (read as this browser would)
    mock-remote-rev:<uid>       its revision (a number; absent counts as 0). Like the real rules, a save must carry
                                the next one, so a save from a tab with an out-of-date copy is refused
    mock-checkout-fail          if present, confirming a checkout reports that the payment wasn't made
    mock-confirm-error          if present, the payment check itself fails (as when the server can't reach Stripe)
    mock-signin-error           if present, sign-in fails with this error code (for example auth/popup-blocked)
    mock-sync-fail              if present, saving progress to the account fails
  Only whitelisted@example.com is on the mock whitelist. Every call waits about 150 ms, so loading states show.
*/

const DELAY_MS = 150
const MOCK_WHITELIST = ['whitelisted@example.com']
const CHECKOUT_SESSION = 'cs_test_mock'
const CHECKOUT_URL = `./?checkout=success&session_id=${CHECKOUT_SESSION}#/account`

interface MockAuth {
  uid: string
  email: string | null
  name: string | null
  provider: SignInProvider | 'other'
}

const USERS: Record<SignInProvider, MockAuth> = {
  google: { uid: 'mock-google', email: 'student@example.com', name: 'Sam Student', provider: 'google' },
  apple: { uid: 'mock-apple', email: 'abc123@privaterelay.appleid.com', name: null, provider: 'apple' },
}

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, DELAY_MS))
const remoteKey = (uid: string) => `mock-remote-progress:${uid}`
const revKey = (uid: string) => `mock-remote-rev:${uid}`
function remoteOf(uid: string): RemoteProgress {
  const stored = readJSON<unknown>(remoteKey(uid), null)
  return { state: stored === null ? null : fromJSON(stored), rev: revFrom(readJSON<unknown>(revKey(uid), 0)) }
}

/** The raw stored text for a flag key (tests may seed plain text, not JSON), or null when absent. */
function flag(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key)
  } catch {
    return null
  }
}

const fail = (code: string, message: string) => Object.assign(new Error(message), { code })

function currentAuth(): MockAuth | null {
  const a = readJSON<Partial<MockAuth> | null>('mock-auth', null)
  if (!a || typeof a.uid !== 'string' || !a.uid) return null
  const provider = a.provider === 'google' || a.provider === 'apple' ? a.provider : 'other'
  return { uid: a.uid, email: typeof a.email === 'string' ? a.email : null, name: typeof a.name === 'string' ? a.name : null, provider }
}

const toUser = (a: MockAuth): AccountUser => ({ ...a, photoURL: null })

const entitlements = () => readJSON<Record<string, string>>('mock-entitlements', {})

function setEntitlement(uid: string, access: 'whitelist' | 'paid' | null) {
  const all = { ...entitlements() }
  if (access) all[uid] = access
  else delete all[uid]
  writeJSON('mock-entitlements', all)
}

const accessOf = (uid: string): AccessLevel => accessFrom(entitlements()[uid])

export function createMockAdapter(): AccountsAdapter {
  const userWatchers = new Set<(u: AccountUser | null) => void>()
  const accessWatchers = new Set<{ uid: string; cb: (a: AccessLevel) => void }>()
  const progressWatchers = new Set<{ uid: string; cb: (s: ProgressSnapshot) => void }>()

  const emitUser = () => {
    const a = currentAuth()
    userWatchers.forEach((cb) => cb(a ? toUser(a) : null))
  }
  const emitAccess = () => accessWatchers.forEach((w) => w.cb(accessOf(w.uid)))
  const emitProgress = (uid: string, hasPendingWrites: boolean) =>
    progressWatchers.forEach((w) => {
      if (w.uid === uid) w.cb({ ...remoteOf(uid), hasPendingWrites })
    })

  // other tabs of this browser: like Firebase, sign-in and saved progress are shared between them
  window.addEventListener('storage', (e) => {
    if (e.key === PREFIX + 'mock-auth') emitUser()
    else if (e.key === PREFIX + 'mock-entitlements') emitAccess()
    else if (e.key?.startsWith(PREFIX + 'mock-remote-progress:')) emitProgress(e.key.slice((PREFIX + 'mock-remote-progress:').length), false)
  })

  /** Like the Firestore rules: only the signed-in person can touch their own progress. */
  function requireUser(uid?: string): MockAuth {
    const a = currentAuth()
    if (!a) throw fail('unauthenticated', 'Not signed in')
    if (uid !== undefined && a.uid !== uid) throw fail('permission-denied', 'Not your data')
    return a
  }

  /** Calls back after the usual delay, unless unsubscribed first. */
  function watch<T>(set: Set<T>, entry: T, first: () => void): () => void {
    set.add(entry)
    const t = setTimeout(first, DELAY_MS)
    return () => {
      clearTimeout(t)
      set.delete(entry)
    }
  }

  return {
    onUser(cb) {
      return watch(userWatchers, cb, () => {
        const a = currentAuth()
        cb(a ? toUser(a) : null)
      })
    },

    async signIn(provider) {
      await delay()
      const code = flag('mock-signin-error')
      if (code !== null) throw fail(code.replace(/^"|"$/g, ''), 'Mock sign-in failure')
      writeJSON('mock-auth', USERS[provider])
      emitUser()
    },

    async signOut() {
      await delay()
      removeKey('mock-auth')
      emitUser()
    },

    async reauthenticateIfNeeded() {},

    async confirmUser() {
      await delay()
      requireUser()
    },

    async deleteUser() {
      requireUser()
      await delay()
      removeKey('mock-auth') // like the real thing, the entitlement record is kept
      emitUser()
    },

    watchAccess(uid, cb) {
      const entry = { uid, cb }
      return watch(accessWatchers, entry, () => cb(accessOf(uid)))
    },

    async syncAccess() {
      await delay()
      const a = requireUser()
      const listed = MOCK_WHITELIST.includes((a.email ?? '').trim().toLowerCase())
      const current = entitlements()[a.uid]
      if (listed && (current === undefined || current === 'revoked')) setEntitlement(a.uid, 'whitelist')
      else if (!listed && current === 'whitelist') setEntitlement(a.uid, null)
      emitAccess()
      return accessOf(a.uid)
    },

    async createCheckoutSession() {
      await delay()
      const a = requireUser()
      return accessOf(a.uid) === 'none' ? { url: CHECKOUT_URL } : { alreadyUnlocked: true }
    },

    async confirmCheckout(sessionId) {
      await delay()
      const a = requireUser()
      if (flag('mock-confirm-error') !== null) throw fail('functions/unavailable', 'Mock payment check failure')
      if (flag('mock-checkout-fail') !== null || sessionId !== CHECKOUT_SESSION) return { access: 'none', status: 'unpaid' }
      if (accessOf(a.uid) === 'none') setEntitlement(a.uid, 'paid')
      emitAccess()
      return { access: 'paid', status: 'paid' }
    },

    async readProgress(uid) {
      await delay()
      requireUser(uid)
      return remoteOf(uid)
    },

    watchProgress(uid, cb) {
      const entry = { uid, cb }
      return watch(progressWatchers, entry, () => cb({ ...remoteOf(uid), hasPendingWrites: false }))
    },

    async writeProgress(uid, state, rev) {
      requireUser(uid)
      if (flag('mock-sync-fail') !== null) {
        await delay()
        throw fail('unavailable', 'Mock save failure')
      }
      if (rev !== remoteOf(uid).rev + 1) {
        // like the rules: refused, and then (as Firestore does) the listener shows the account copy as it is
        await delay()
        setTimeout(() => emitProgress(uid, false), 0)
        throw fail('permission-denied', 'Mock save refused: out-of-date copy')
      }
      // saved at once (so a test can read it straight after a page change), echoed to this tab as a pending write like Firestore
      writeJSON(revKey(uid), rev) // first, so another tab told about the new copy reads its revision too
      writeJSON(remoteKey(uid), toJSON(state))
      emitProgress(uid, true)
      await delay()
    },

    async deleteProgress(uid) {
      requireUser(uid)
      removeKey(revKey(uid))
      removeKey(remoteKey(uid))
      emitProgress(uid, true)
      await delay()
    },
  }
}
