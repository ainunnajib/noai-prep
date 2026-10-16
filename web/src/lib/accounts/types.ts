export type SignInProvider = 'google' | 'apple'

export interface AccountUser {
  uid: string
  email: string | null
  name: string | null
  photoURL: string | null
  provider: SignInProvider | 'other'
}

export type AccessLevel = 'none' | 'paid' | 'whitelist'

export type AccountStatus = 'disabled' | 'loading' | 'signed-out' | 'signed-in'

export interface AccountState {
  status: AccountStatus
  user: AccountUser | null
  /**
   * 'none' while unknown. While loading, and until the live value arrives for the same user, it holds the access
   * this device last saw (the access hint) so a returning paid user doesn't see the course lock for a moment.
   */
  access: AccessLevel
  /** false until the entitlement listener has fired once (or failed); always true with accounts off */
  accessKnown: boolean
  /** a progress write is pending or in flight */
  syncing: boolean
  /** ISO time of the last successful sync with the account copy */
  lastSyncedAt: string | null
  /** last user-facing error (sign-in, sync, checkout), cleared on the next action */
  error: string | null
}
