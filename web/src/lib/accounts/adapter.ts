import type { ProgressState } from '../progress'
import type { AccessLevel, AccountUser, SignInProvider } from './types'

/** One delivery from the progress listener. `data` is the parsed account copy (untrusted; null when there is none). */
export interface ProgressSnapshot {
  data: unknown
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

  /** Live access for `uid` (entitlements/{uid}); onError when the listener fails. Calls back only with answers it actually knows. */
  watchAccess(uid: string, cb: (access: AccessLevel) => void, onError: (e: unknown) => void): () => void
  /** Asks the backend to apply the whitelist to the signed-in user, and returns their access. */
  syncAccess(): Promise<AccessLevel>
  createCheckoutSession(): Promise<CheckoutStart>
  confirmCheckout(sessionId: string): Promise<CheckoutResult>

  /** The account copy of progress (parsed JSON, untrusted), or null when there is none. */
  readProgress(uid: string): Promise<unknown>
  watchProgress(uid: string, cb: (snap: ProgressSnapshot) => void, onError: (e: unknown) => void): () => void
  writeProgress(uid: string, state: ProgressState): Promise<void>
  /** Best-effort save while the page is being closed: a request that outlives the page. Returns false when it can't send one. */
  writeProgressOnExit?(uid: string, state: ProgressState): boolean
  deleteProgress(uid: string): Promise<void>
}

/** An entitlement's `access` field as an access level ('revoked', missing or anything else: no access). */
export const accessFrom = (value: unknown): AccessLevel => (value === 'paid' || value === 'whitelist' ? value : 'none')
