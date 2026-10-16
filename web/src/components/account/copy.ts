import { useAccount } from '../../lib/accounts'
import { SYNC_ERROR } from '../../lib/accounts/errors'

/**
 * Where this person's progress is saved, to finish sentences like "Your progress is saved …".
 * Signed in: "to your account". Otherwise (signed out, or accounts off): "in this browser", as the site has always said.
 * While a save to the account is failing: "in this browser".
 */
export function useSavedWhere(): 'to your account' | 'in this browser' {
  const s = useAccount()
  return s.status === 'signed-in' && s.error !== SYNC_ERROR ? 'to your account' : 'in this browser'
}
