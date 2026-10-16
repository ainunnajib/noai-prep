import { useSyncExternalStore } from 'react'
import { progress } from '../progress'
import { readJSON, removeKey, writeJSON } from '../storage'
import type { AccountsAdapter } from './adapter'
import { ACCOUNTS_ENABLED, FREE_MODULES, FUNCTIONS_REGION, firebaseConfig } from './config'
import {
  ACCESS_ERROR,
  CHECKOUT_ERROR,
  CONFIRM_ERROR,
  CONFIRM_WRONG_ACCOUNT_ERROR,
  DELETE_ACCOUNT_ERROR,
  DELETE_PROGRESS_ERROR,
  LOAD_ERROR,
  SIGN_OUT_ERROR,
  START_ERROR,
  SYNC_ERROR,
  authErrorMessage,
  errorCode,
} from './errors'
import { createProgressSync, type ProgressSync, type SyncStatus } from './sync'
import type { AccessLevel, AccountState, AccountUser, SignInProvider } from './types'

/*
  The account store: who is signed in, whether they have full access, and how progress sync is going.
  With accounts off (no Firebase config at build time) it stays 'disabled', every method does nothing and every
  access check passes, so the site behaves exactly as it always has.
  The backend (Firebase, or the dev/e2e mock) is loaded on demand by init(), so it is not part of the first download.
*/

export type { AccessLevel, AccountState, AccountStatus, AccountUser, SignInProvider } from './types'
export { ACCOUNTS_ENABLED, FREE_MODULES, PRICE_LABEL } from './config'

/** How long sign-out waits for waiting progress to save (a save can hang while offline). */
const SIGN_OUT_SAVE_WAIT_MS = 5000

/** The last access this device saw ({uid, access}), so a returning paid user doesn't see the lock while sign-in is restored. */
const HINT_KEY = 'access-hint'
/**
 * Whose progress this browser holds (a uid), set while someone is signed in, so a sign-in that ends while the page is
 * closed (say, the account was deleted on another device) still clears it.
 */
const OWNER_KEY = 'progress-owner'

interface AccessHint {
  uid: string
  access: AccessLevel
}

function readHint(): AccessHint | null {
  const h = readJSON<Partial<AccessHint> | null>(HINT_KEY, null)
  return h && typeof h.uid === 'string' && (h.access === 'paid' || h.access === 'whitelist' || h.access === 'none')
    ? { uid: h.uid, access: h.access }
    : null
}

let state: AccountState = {
  status: ACCOUNTS_ENABLED ? 'loading' : 'disabled',
  user: null,
  access: (ACCOUNTS_ENABLED && readHint()?.access) || 'none',
  accessKnown: !ACCOUNTS_ENABLED,
  syncing: false,
  lastSyncedAt: null,
  error: null,
}
const listeners = new Set<() => void>()

function set(patch: Partial<AccountState>) {
  const keys = Object.keys(patch) as (keyof AccountState)[]
  if (keys.every((k) => state[k] === patch[k])) return
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

function setAccess(uid: string, access: AccessLevel) {
  if (state.user?.uid !== uid) return
  // the payment we couldn't confirm went through after all (the webhook got there), so drop that message
  const error = access !== 'none' && state.error === CONFIRM_ERROR ? null : state.error
  set({ access, accessKnown: true, error })
  writeJSON(HINT_KEY, { uid, access } satisfies AccessHint)
}

function onSyncStatus(p: Partial<SyncStatus>) {
  const patch: Partial<AccountState> = {}
  if (p.syncing !== undefined) patch.syncing = p.syncing
  if (p.lastSyncedAt !== undefined) patch.lastSyncedAt = p.lastSyncedAt
  if (p.error) patch.error = p.error
  // a sync that works again clears its own error, never someone else's
  else if (p.error === null && (state.error === SYNC_ERROR || state.error === LOAD_ERROR)) patch.error = null
  set(patch)
}

/** Resolves once we know whether someone is signed in. */
function whenSettled(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (state.status === 'loading') return
      unsubscribe()
      resolve()
    }
    const unsubscribe = subscribe(check)
    check()
  })
}

// ---- the backend, loaded on demand ----

let started = false
let adapter: AccountsAdapter | null = null
let adapterReady: Promise<AccountsAdapter> | null = null
let sync: ProgressSync | null = null

function loadAdapter(): Promise<AccountsAdapter> {
  // The mock is bundled only into dev/e2e builds: Vite fixes this condition at build time, so production drops it.
  if (import.meta.env.VITE_ACCOUNTS_MOCK === '1') return import('./mock-adapter').then((m) => m.createMockAdapter())
  const config = firebaseConfig
  if (config) return import('./firebase-adapter').then((m) => m.createFirebaseAdapter(config, FUNCTIONS_REGION))
  return Promise.reject(new Error('Accounts are off'))
}

// ---- one signed-in session ----

/** bumped whenever the signed-in person changes, so late replies for an earlier one are dropped */
let session = 0
let unwatchAccess: (() => void) | null = null
/** people whose whitelist check has run since this page loaded (it runs once per sign-in, not on every change) */
const accessSynced = new Set<string>()

function beginSession(a: AccountsAdapter, user: AccountUser) {
  const mySession = ++session
  const hint = readHint()
  set({
    status: 'signed-in',
    user,
    access: hint?.uid === user.uid ? hint.access : 'none',
    accessKnown: false,
    syncing: false,
    lastSyncedAt: null,
  })
  writeJSON(OWNER_KEY, user.uid)

  // Access is known once the entitlement listener has answered. If it says 'none', also wait for the whitelist
  // check, so an invited person signing in for the first time doesn't see the unlock offer flash up.
  let heard = false
  let checked = accessSynced.has(user.uid)
  let live: AccessLevel = 'none'
  const settle = () => {
    if (mySession === session && heard && (checked || live !== 'none')) setAccess(user.uid, live)
  }
  unwatchAccess = a.watchAccess(
    user.uid,
    (access) => {
      heard = true
      live = access
      settle()
    },
    () => {
      heard = checked = true
      settle()
    },
  )
  if (!checked) {
    accessSynced.add(user.uid)
    a.syncAccess().then(
      (access) => {
        checked = true
        if (access !== 'none' && mySession === session) {
          live = access
          setAccess(user.uid, access)
        } else settle()
      },
      () => {
        checked = true
        settle()
      },
    )
  }
  void sync?.start(user.uid)
}

/** Signed out (here or in another tab) or the person changed: stop listening and forget this browser's copy. */
function endSession() {
  session++
  unwatchAccess?.()
  unwatchAccess = null
  void sync?.stop()
  progress.clearLocal()
  removeKey(HINT_KEY)
  removeKey(OWNER_KEY)
}

function handleUser(a: AccountsAdapter, user: AccountUser | null) {
  const prev = state.user
  if (user && prev?.uid === user.uid) {
    set({ user }) // the same person; their profile details may have changed
    return
  }
  if (prev) endSession()
  else {
    // the first report since the page loaded: progress left by someone whose sign-in ended while the page was closed is theirs, not this visitor's
    const owner = readJSON<string | null>(OWNER_KEY, null)
    if (owner !== null && owner !== user?.uid) progress.clearLocal()
  }
  if (user) beginSession(a, user)
  else {
    removeKey(HINT_KEY)
    removeKey(OWNER_KEY)
    set({ status: 'signed-out', user: null, access: 'none', accessKnown: false, syncing: false, lastSyncedAt: null })
  }
}

// ---- public API ----

export const account = {
  get: (): AccountState => state,
  subscribe,

  /** Starts loading the backend and restoring sign-in. Call once at startup; safe to call again. Does nothing with accounts off. */
  init(): void {
    if (!ACCOUNTS_ENABLED || started) return
    started = true
    adapterReady = loadAdapter()
    adapterReady.then(
      (a) => {
        adapter = a
        sync = createProgressSync({ adapter: a, store: progress, onStatus: onSyncStatus })
        a.onUser((user) => handleUser(a, user))
      },
      () => set({ status: 'signed-out', access: 'none', error: START_ERROR }),
    )
  },

  /** Opens the provider's sign-in popup. Never throws: problems end up in `error`. */
  async signIn(provider: SignInProvider): Promise<void> {
    if (!ACCOUNTS_ENABLED) return
    account.init()
    set({ error: null })
    let a = adapter
    if (!a) {
      try {
        a = await adapterReady!
      } catch {
        set({ error: START_ERROR })
        return
      }
    }
    try {
      // normally the backend is already loaded, so the popup opens straight from the click (browsers block it otherwise)
      await a.signIn(provider)
    } catch (e) {
      const message = authErrorMessage(e)
      if (message) set({ error: message })
    }
  },

  /** Saves waiting progress, signs out, and clears this browser's copy of progress (the account keeps it). */
  async signOut(): Promise<void> {
    const a = adapter
    const user = state.user
    if (!a || !user) return
    set({ error: null })
    // save waiting progress first, but don't let a lost connection stop the person signing out
    await Promise.race([sync?.stop({ flush: true }), new Promise((resolve) => setTimeout(resolve, SIGN_OUT_SAVE_WAIT_MS))])
    try {
      await a.signOut()
    } catch {
      set({ error: SIGN_OUT_ERROR })
      if (state.user?.uid === user.uid) void sync?.start(user.uid) // still signed in: carry on syncing
      return
    }
    handleUser(a, null) // the backend reports this too; whichever comes first clears this browser's copy
  },

  /** Sends the browser to Stripe Checkout (or, if the account already has access, just refreshes it). */
  async startCheckout(): Promise<void> {
    const a = adapter
    if (!a || !state.user) return
    set({ error: null })
    try {
      const r = await a.createCheckoutSession()
      if (r.alreadyUnlocked) await account.refreshAccess()
      else if (r.url) window.location.assign(r.url)
      else throw new Error('No checkout page')
    } catch {
      set({ error: CHECKOUT_ERROR })
    }
  },

  /** After returning from Stripe: asks the backend to check the payment and unlock. Resolves to the access now held. */
  async confirmCheckout(sessionId: string): Promise<AccessLevel> {
    if (!ACCOUNTS_ENABLED) return 'none'
    account.init()
    await whenSettled()
    const a = adapter
    const user = state.user
    if (!a || !user) return 'none'
    set({ error: null })
    const current = () => (state.user?.uid === user.uid && state.accessKnown ? state.access : 'none')
    try {
      const r = await a.confirmCheckout(sessionId)
      if (r.access !== 'paid') return current()
      if (state.access === 'none' || !state.accessKnown) setAccess(user.uid, 'paid')
      return 'paid'
    } catch (e) {
      // already unlocked (the webhook got there first): nothing to warn about
      if (!(state.accessKnown && hasFullAccess(state))) {
        set({ error: errorCode(e) === 'functions/permission-denied' ? CONFIRM_WRONG_ACCOUNT_ERROR : CONFIRM_ERROR })
      }
      return current()
    }
  },

  /** Re-checks access with the backend (this also applies the whitelist). */
  async refreshAccess(): Promise<void> {
    const a = adapter
    const user = state.user
    if (!a || !user) return
    set({ error: null })
    try {
      setAccess(user.uid, await a.syncAccess())
    } catch {
      set({ error: ACCESS_ERROR })
    }
  },

  /** Deletes the progress saved to the account, and this browser's copy. */
  async deleteCloudProgress(): Promise<void> {
    if (!sync || !state.user) return
    set({ error: null })
    try {
      await sync.deleteRemote()
    } catch {
      set({ error: DELETE_PROGRESS_ERROR })
    }
  },

  /** Deletes the saved progress and then the account itself (asking the person to sign in again first if needed). */
  async deleteAccount(): Promise<void> {
    const a = adapter
    const user = state.user
    if (!a || !sync || !user) return
    set({ error: null })
    try {
      await a.reauthenticateIfNeeded() // first, so its popup still counts as a response to the click
    } catch (e) {
      const message = authErrorMessage(e)
      if (message) set({ error: message })
      return
    }
    await sync.stop() // nothing to save: it is all being deleted
    try {
      await a.deleteProgress(user.uid)
      await a.deleteUser()
    } catch (e) {
      const message = errorCode(e).startsWith('auth/') ? authErrorMessage(e) : DELETE_ACCOUNT_ERROR
      if (message) set({ error: message })
      // still signed in: carry on syncing, which also saves this browser's progress back to the account
      if (state.user?.uid === user.uid) void sync.start(user.uid)
      return
    }
    handleUser(a, null)
  },
}

export function useAccount(): AccountState {
  return useSyncExternalStore(account.subscribe, account.get, account.get)
}

/** Everything unlocked: accounts are off, or the account has paid or was invited. */
export function hasFullAccess(s: AccountState): boolean {
  return !ACCOUNTS_ENABLED || s.access === 'paid' || s.access === 'whitelist'
}

export function isFreeModule(moduleSlug: string): boolean {
  return FREE_MODULES.includes(moduleSlug)
}

export function canViewLesson(s: AccountState, moduleSlug: string): boolean {
  return isFreeModule(moduleSlug) || hasFullAccess(s)
}

/** Practice, mock exams and individual past papers. */
export function canUseGatedTools(s: AccountState): boolean {
  return hasFullAccess(s)
}

/** Access isn't settled yet (sign-in being restored, or the entitlement not heard yet): show a placeholder, not the lock. */
export function isAccessPending(s: AccountState): boolean {
  return ACCOUNTS_ENABLED && !hasFullAccess(s) && (s.status === 'loading' || (s.status === 'signed-in' && !s.accessKnown))
}
