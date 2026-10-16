// syncAccess: called by the website once per sign-in. Grants free access to a
// verified whitelisted email, and takes a whitelist grant away again if the
// address has been removed from the whitelist. A paid unlock is never touched.

import { HttpsError } from 'firebase-functions/v2/https'
import type { BaseDeps } from './deps'
import { decideSync, readEntitlement, type AccessLevel } from './entitlement'
import { isWhitelisted, parseWhitelist } from './whitelist'

/** The parts of a callable request we use (firebase-functions' CallableRequest fits this). */
export interface CallableRequestLike<T = unknown> {
  auth?: { uid: string; token: { email?: string; email_verified?: boolean } }
  data: T
}

export interface SignedInUser {
  uid: string
  email: string | null
  emailVerified: boolean
}

export function requireUser(request: CallableRequestLike): SignedInUser {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Please sign in first.')
  const { uid, token } = request.auth
  return { uid, email: token.email ?? null, emailVerified: token.email_verified === true }
}

export interface AccessDeps extends BaseDeps {
  /** The raw ACCESS_WHITELIST secret. Never log or return it. */
  whitelist: string
}

/** Brings entitlements/{uid} in line with the whitelist and returns the person's access. */
export async function syncEntitlement(deps: AccessDeps, user: SignedInUser): Promise<AccessLevel> {
  const whitelisted = user.emailVerified && isWhitelisted(user.email, parseWhitelist(deps.whitelist))
  const ref = deps.db.doc(`entitlements/${user.uid}`)
  const decision = await deps.db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const decision = decideSync(readEntitlement(snap.exists ? snap.data() : null), whitelisted)
    if (decision.write === 'grant-whitelist') {
      tx.set(ref, { access: 'whitelist', source: 'whitelist', email: user.email, grantedAt: deps.serverTime() })
    } else if (decision.write === 'remove-whitelist') {
      tx.delete(ref)
    }
    return decision
  })
  if (decision.write === 'grant-whitelist') deps.log.info('Granted whitelist access', { uid: user.uid })
  if (decision.write === 'remove-whitelist') deps.log.info('Removed whitelist access', { uid: user.uid })
  return decision.access
}

export async function syncAccess(deps: AccessDeps, request: CallableRequestLike): Promise<{ access: AccessLevel }> {
  const user = requireUser(request)
  return { access: await syncEntitlement(deps, user) }
}
