import type { ProgressState } from '../progress'
import type { AccessLevel, AccountUser, SignInProvider } from './types'

/** The account copy as read: the parsed progress (untrusted; null when there is none) and its revision (0 when none). */
export interface RemoteProgress {
  data: unknown
  /** goes up by one with every save; the account refuses a save that doesn't carry the next one (see writeProgress) */
  rev: number
}

/** One delivery from the progress listener. */
export interface ProgressSnapshot extends RemoteProgress {
  /** true for the echo of this device's own unsent write */
  hasPendingWrites: boolean
  /** true when the server couldn't be reached and this is only what the device already had (not the account copy) */
  fromCache?: boolean
}

export interface CheckoutStart {
  /** Stripe Checkout page to send the browser to */
  url?: string
  /** the account already has full access, so there is nothing to pay */
  alreadyUnlocked?: boolean
}

export interface CheckoutResult {
  access: 'paid' | 'none'
  /** Stripe's payment_status, when known */
  status?: string
}

/**
 * The account backend: Firebase in production (firebase-adapter.ts), a fake for dev and e2e (mock-adapter.ts).
 * Failures reject with an Error that may carry a Firebase-style `code` (for example 'auth/popup-blocked').
 */
export interface AccountsAdapter {
  /** Calls back with the signed-in user (or null) once restored, then on every change. Returns an unsubscribe. */
  onUser(cb: (user: AccountUser | null) => void): () => void
  /** Popup sign-in. Must open the popup straight away (no awaits first) so browsers treat it as a response to the click. */
  signIn(provider: SignInProvider): Promise<void>
  signOut(): Promise<void>
  /** Before a sensitive action (deleting the account): asks the user to sign in again if their sign-in is old. */
  reauthenticateIfNeeded(): Promise<void>
  /** Deletes the signed-in user (signing in again by popup if the backend asks for a recent sign-in). */
  deleteUser(): Promise<void>
  /** Checks with the backend that the signed-in account still exists. Rejects (and signs out) if it doesn't, or if the check fails. */
  confirmUser(): Promise<void>

  /** Live access for `uid` (entitlements/{uid}); onError when the listener fails. Calls back only with answers it actually knows. */
  watchAccess(uid: string, cb: (access: AccessLevel) => void, onError: (e: unknown) => void): () => void
  /** Asks the backend to apply the whitelist to the signed-in user, and returns their access. */
  syncAccess(): Promise<AccessLevel>
  createCheckoutSession(): Promise<CheckoutStart>
  confirmCheckout(sessionId: string): Promise<CheckoutResult>

  /** The account copy of progress. */
  readProgress(uid: string): Promise<RemoteProgress>
  watchProgress(uid: string, cb: (snap: ProgressSnapshot) => void, onError: (e: unknown) => void): () => void
  /**
   * Saves `state` as revision `rev`, which must be one more than the account copy's (1 when there is none). Otherwise
   * the save is refused (an Error with code 'permission-denied'): another device saved since this one last looked.
   */
  writeProgress(uid: string, state: ProgressState, rev: number): Promise<void>
  /**
   * Best-effort save while the page is being closed: a request that outlives the page. It saves revision `rev`, sending
   * only what changed since `base` (the account copy at `rev - 1`). Returns false when it can't send one.
   */
  writeProgressOnExit?(uid: string, state: ProgressState, rev: number, base: ProgressState): boolean
  deleteProgress(uid: string): Promise<void>
}

/** An entitlement's `access` field as an access level ('revoked', missing or anything else: no access). */
export const accessFrom = (value: unknown): AccessLevel => (value === 'paid' || value === 'whitelist' ? value : 'none')

/** A revision number as stored (anything else counts as 0). */
export const revFrom = (value: unknown): number => (typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : 0)
