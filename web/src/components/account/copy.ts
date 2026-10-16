import { useAccount } from '../../lib/accounts'
import { SIGN_OUT_UNSAVED_ERROR, SYNC_ERROR } from '../../lib/accounts/errors'

/**
 * Where this person's progress is saved, to finish sentences like "Your progress is saved …".
 * Signed in: "to your account". Otherwise (signed out, or accounts off): "in this browser", as the site has always said.
 * While a save to the account is failing (or sign-out was held back because of that): "in this browser".
 */
export function useSavedWhere(): 'to your account' | 'in this browser' {
  const s = useAccount()
  return s.status === 'signed-in' && s.error !== SYNC_ERROR && s.error !== SIGN_OUT_UNSAVED_ERROR ? 'to your account' : 'in this browser'
}
