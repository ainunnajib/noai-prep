// Pure decisions about who has access, and whether a Stripe Checkout Session
// may unlock the course. No Firebase imports, so everything here is unit tested
// directly; the handlers in access.ts, grant.ts and webhook.ts do the reads and writes.

export type StoredAccess = 'whitelist' | 'paid' | 'revoked'
export type AccessLevel = 'whitelist' | 'paid' | 'none'

/** entitlements/{uid}. Written by the functions only. */
export interface Entitlement {
  access: StoredAccess
  source: 'whitelist' | 'stripe'
  email: string | null
  grantedAt: unknown
  sessionId?: string
  paymentIntent?: string | null
  amount?: number
  currency?: string
  revokedAt?: unknown
}

/** The few Checkout Session fields we rely on (a real Stripe.Checkout.Session fits this shape). */
export interface CheckoutSessionLike {
  id: string
  mode: string
  payment_status: string
  currency: string | null
  amount_total: number | null
  client_reference_id: string | null
  metadata: Record<string, string> | null
  payment_intent: string | { id: string } | null
  customer_email: string | null
  customer_details: { email: string | null } | null
}

/** The few Charge fields we rely on (a real Stripe.Charge fits this shape). */
export interface ChargeLike {
  id: string
  refunded: boolean
  payment_intent: string | { id: string } | null
  metadata: Record<string, string> | null
}

export const CURRENCY = 'sgd'

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/

/** True for a Checkout Session id such as "cs_test_a1B2c3". */
export function isValidSessionId(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 255 && SESSION_ID.test(value)
}

/**
 * True if the string can safely be used as one Firestore document id
 * (Firebase Auth uids always can; this guards against "a/b" style paths).
 */
export function isSafeDocId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 128 &&
    !value.includes('/') &&
    value !== '.' &&
    value !== '..' &&
    !/^__.*__$/.test(value)
  )
}

/** Reads an entitlement document defensively: anything unexpected counts as "no entitlement". */
export function readEntitlement(data: unknown): Entitlement | null {
  if (!data || typeof data !== 'object') return null
  const access = (data as { access?: unknown }).access
  if (access !== 'whitelist' && access !== 'paid' && access !== 'revoked') return null
  return data as Entitlement
}

export function accessOf(entitlement: Entitlement | null): AccessLevel {
  if (entitlement?.access === 'whitelist' || entitlement?.access === 'paid') return entitlement.access
  return 'none'
}

export interface SyncDecision {
  /** What to write to entitlements/{uid}, if anything. */
  write: 'grant-whitelist' | 'remove-whitelist' | null
  /** The access the person has once the write (if any) is done. */
  access: AccessLevel
}

/**
 * What syncAccess should do. `whitelisted` must already account for the email
 * being verified. A paid unlock is never touched; a whitelist grant is removed
 * when the address leaves the whitelist.
 */
export function decideSync(current: Entitlement | null, whitelisted: boolean): SyncDecision {
  const access = accessOf(current)
  if (whitelisted) {
    if (access === 'paid' || access === 'whitelist') return { write: null, access }
    return { write: 'grant-whitelist', access: 'whitelist' }
  }
  if (access === 'whitelist') return { write: 'remove-whitelist', access: 'none' }
  return { write: null, access }
}

export type PaidSessionCheck =
  | { ok: true; uid: string; sessionId: string; paymentIntent: string | null; amount: number; currency: string }
  | { ok: false; reason: string }

/** The uid a Checkout Session belongs to (we set both fields when creating it). */
export function sessionUid(session: Pick<CheckoutSessionLike, 'client_reference_id' | 'metadata'>): string | null {
  return session.client_reference_id || session.metadata?.uid || null
}

export function paymentIntentId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id ?? null
}

/** Decides whether a completed Checkout Session really is a paid S$ unlock for one of our users. */
export function checkPaidSession(session: CheckoutSessionLike, priceCents: number): PaidSessionCheck {
  const uid = sessionUid(session)
  if (!isSafeDocId(uid)) return { ok: false, reason: 'no valid uid on the session' }
  if (!isSafeDocId(session.id)) return { ok: false, reason: 'unexpected session id' }
  if (session.mode !== 'payment') return { ok: false, reason: `mode is ${session.mode}, not payment` }
  if (session.payment_status !== 'paid') return { ok: false, reason: `payment status is ${session.payment_status}` }
  const currency = (session.currency ?? '').toLowerCase()
  if (currency !== CURRENCY) return { ok: false, reason: `currency is ${currency || 'missing'}, not ${CURRENCY}` }
  const amount = session.amount_total
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < priceCents) {
    return { ok: false, reason: `amount ${amount} is below the price ${priceCents}` }
  }
  return { ok: true, uid, sessionId: session.id, paymentIntent: paymentIntentId(session.payment_intent), amount, currency }
}

/** A full refund revokes a paid unlock, but only the one bought with that payment, and never a whitelist grant. */
export function shouldRevokeForRefund(current: Entitlement | null, paymentIntent: string | null): boolean {
  return !!paymentIntent && current?.access === 'paid' && current.paymentIntent === paymentIntent
}

/** True if this payment has already been refunded (so its session must not unlock anything again). */
export function isRefundedPayment(current: Entitlement | null, paymentStatus: unknown, paymentIntent: string | null): boolean {
  if (paymentStatus === 'refunded') return true
  return !!paymentIntent && current?.access === 'revoked' && current.paymentIntent === paymentIntent
}
