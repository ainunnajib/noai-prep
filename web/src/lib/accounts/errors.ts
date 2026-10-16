/** User-facing messages for account errors. Plain English; never shows raw error codes. */

export const SYNC_ERROR = "Couldn't save your progress to your account. It's still saved on this device."
export const LOAD_ERROR = "Couldn't load your progress from your account. Your progress on this device is safe."
export const START_ERROR = "Sign-in couldn't load. Check your connection and refresh the page."
export const CHECKOUT_ERROR = "Couldn't start the payment. Please try again in a minute."
export const CONFIRM_ERROR =
  "We couldn't confirm your payment yet. If you were charged, your access will switch on shortly; refresh this page in a minute."
export const CONFIRM_WRONG_ACCOUNT_ERROR =
  'This payment was made while signed in with a different account. Sign out, then sign in with that account to finish unlocking.'
export const ACCESS_ERROR = "Couldn't check your access. Please try again in a minute."
export const DELETE_PROGRESS_ERROR = "Couldn't delete your saved progress. Check your connection and try again."
export const DELETE_ACCOUNT_ERROR = "Couldn't delete your account. Check your connection and try again."
export const SIGN_OUT_ERROR = "Couldn't sign you out. Check your connection and try again."

export const errorCode = (e: unknown): string =>
  typeof e === 'object' && e !== null && typeof (e as { code?: unknown }).code === 'string' ? (e as { code: string }).code : ''

/** Message for a failed sign-in (or re-sign-in) popup, or null when the user simply closed it. */
export function authErrorMessage(e: unknown): string | null {
  switch (errorCode(e)) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.'
    case 'auth/account-exists-with-different-credential':
      return "You've used this email with another sign-in method before. Use that one (for example Google)."
    case 'auth/network-request-failed':
      return "Couldn't reach the sign-in service. Check your connection and try again."
    default:
      return "Sign-in didn't work. Please try again."
  }
}
