// Writing a Stripe payment into Firestore: the shared, idempotent unlock used by
// both the webhook and confirmCheckout (whichever arrives first wins; the other
// finds the work already done), plus payment status updates and refunds.

import type { BaseDeps, DocData } from './deps'
import {
  checkPaidSession,
  isRefundedPayment,
  isSafeDocId,
  paymentIntentId,
  readEntitlement,
  sessionUid,
  shouldRevokeForRefund,
  type ChargeLike,
  type CheckoutSessionLike,
} from './entitlement'

export interface GrantDeps extends BaseDeps {
  priceCents: number
}

export type GrantResult =
  | { ok: true; access: 'paid'; changed: boolean; duplicate?: boolean; wasInvited?: boolean }
  | { ok: false; reason: string }

/**
 * Unlocks the course for the session's user if the session is a genuine paid
 * S$ unlock. Safe to call any number of times for the same session.
 */
export async function grantFromSession(deps: GrantDeps, session: CheckoutSessionLike): Promise<GrantResult> {
  // Not one of ours (`stripe trigger`, a Payment Link, another product on the same Stripe account): leave it alone.
  if (!isSafeDocId(sessionUid(session))) {
    deps.log.info('Ignored a Checkout Session that was not started from this site', { sessionId: session.id })
    return { ok: false, reason: 'no valid uid on the session' }
  }

  // Accept the price the session was created at (payments/{id}.amount, written only by createCheckoutSession), so
  // raising PRICE_SGD_CENTS doesn't reject sessions that were already open at the old price.
  let floor = deps.priceCents
  if (isSafeDocId(session.id)) {
    const recorded = (await deps.db.doc(`payments/${session.id}`).get()).data()?.amount
    if (typeof recorded === 'number' && Number.isFinite(recorded) && recorded > 0) floor = Math.min(floor, recorded)
  }
  const check = checkPaidSession(session, floor)
  if (!check.ok) {
    deps.log.error('Checkout Session not accepted as an unlock', { sessionId: session.id, reason: check.reason })
    await recordSessionStatus(deps, session, 'rejected', { reason: check.reason })
    return check
  }

  const { uid, sessionId, paymentIntent, amount, currency } = check
  const entitlementRef = deps.db.doc(`entitlements/${uid}`)
  const paymentRef = deps.db.doc(`payments/${sessionId}`)
  const refundRef = paymentIntent && isSafeDocId(paymentIntent) ? deps.db.doc(`refunds/${paymentIntent}`) : null

  const result = await deps.db.runTransaction(async (tx): Promise<GrantResult> => {
    // Firestore transactions need every read before any write.
    const entitlementSnap = await tx.get(entitlementRef)
    const paymentSnap = await tx.get(paymentRef)
    const refundSnap = refundRef ? await tx.get(refundRef) : null
    const current = readEntitlement(entitlementSnap.exists ? entitlementSnap.data() : null)
    const payment = paymentSnap.exists ? paymentSnap.data() : undefined
    const now = deps.serverTime()
    // Prefer the account email recorded when the session was created; fall back to what Stripe collected.
    const recordedEmail = typeof payment?.email === 'string' ? payment.email : null
    const email = recordedEmail ?? session.customer_email ?? session.customer_details?.email ?? null

    // A refunded Checkout Session still says "paid", so never let it unlock again. That includes a refund handled
    // before the unlock was ever recorded (Stripe doesn't promise the order of its events).
    if (refundSnap?.exists || isRefundedPayment(current, payment?.status, paymentIntent)) {
      if (refundSnap?.exists && payment?.status !== 'refunded') {
        tx.set(paymentRef, { uid, status: 'refunded', paymentIntent, updatedAt: now }, { merge: true })
      }
      return { ok: false, reason: 'payment was refunded' }
    }

    const paymentUpdate: DocData = { uid, amount, currency, status: 'paid', paymentIntent, updatedAt: now }
    if (!paymentSnap.exists) Object.assign(paymentUpdate, { email, createdAt: now })
    tx.set(paymentRef, paymentUpdate, { merge: true })

    if (current?.access === 'paid') {
      // Paying again for an account that's already unlocked: a second payment the owner may want to refund.
      const duplicate = !!paymentIntent && current.paymentIntent !== paymentIntent
      return { ok: true, access: 'paid', changed: false, duplicate }
    }
    // An invited person who pays (say, with a checkout opened before the invite) gets a paid unlock, so a later
    // removal from the whitelist can't take away access they paid for. If it's refunded, syncAccess re-grants the invite.
    const wasInvited = current?.access === 'whitelist'
    tx.set(entitlementRef, {
      access: 'paid',
      source: 'stripe',
      email,
      grantedAt: now,
      sessionId,
      paymentIntent,
      amount,
      currency,
    })
    return { ok: true, access: 'paid', changed: true, wasInvited }
  })

  if (!result.ok) deps.log.warn('Checkout Session not accepted as an unlock', { sessionId, reason: result.reason })
  if (result.ok && result.changed) deps.log.info('Unlocked the course after payment', { uid, sessionId })
  if (result.ok && result.wasInvited) {
    deps.log.warn('An invited account paid; it now has a paid unlock. Refund it if it was a mistake.', { uid, sessionId, paymentIntent })
  }
  if (result.ok && result.duplicate) {
    deps.log.warn('A second payment for an account that is already unlocked. Refund this one, not the first.', {
      uid,
      sessionId,
      paymentIntent,
    })
  }
  return result
}

/**
 * Records a session's status (pending, failed, expired, rejected) in
 * payments/{sessionId} without touching access. Stripe may deliver events out
 * of order, so a payment already marked paid or refunded keeps that status.
 */
export async function recordSessionStatus(
  deps: BaseDeps,
  session: Pick<CheckoutSessionLike, 'id' | 'client_reference_id' | 'metadata'>,
  status: string,
  extra: DocData = {},
): Promise<void> {
  const uid = sessionUid(session)
  // Only our own sessions carry a uid; leave anything else on the Stripe account alone.
  if (!isSafeDocId(session.id) || !isSafeDocId(uid)) return
  const ref = deps.db.doc(`payments/${session.id}`)
  await deps.db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const previous = snap.exists ? snap.data()?.status : undefined
    if (previous === 'paid' || previous === 'refunded') return
    tx.set(ref, { ...extra, uid, status, updatedAt: deps.serverTime() }, { merge: true })
  })
}

export type RefundResult = 'revoked' | 'moved' | 'kept' | 'partial' | 'unknown-payment'

/**
 * A full refund takes a paid unlock away again, but only the unlock bought with
 * this payment. Whitelist access is never touched. If the person paid twice and
 * the other payment still stands, access stays and moves onto that payment.
 * The refund is also remembered on its own (refunds/{paymentIntent}), so a grant
 * that arrives after it (a webhook retry, or confirmCheckout) can't undo it.
 */
export async function revokeForRefund(deps: BaseDeps, charge: ChargeLike): Promise<RefundResult> {
  if (charge.refunded !== true) return 'partial'
  const paymentIntent = paymentIntentId(charge.payment_intent)
  if (!paymentIntent || !isSafeDocId(paymentIntent)) return 'unknown-payment'
  // Remember the refund even when no unlock is recorded for it yet.
  await deps.db
    .doc(`refunds/${paymentIntent}`)
    .set({ chargeId: charge.id, uid: charge.metadata?.uid ?? null, refundedAt: deps.serverTime() })

  const found = await deps.db.collection('payments').where('paymentIntent', '==', paymentIntent).limit(1).get()
  const paymentDoc = found.docs[0]
  const paymentUid = paymentDoc?.data().uid
  const uid = charge.metadata?.uid || (typeof paymentUid === 'string' ? paymentUid : null)
  if (!isSafeDocId(uid)) {
    deps.log.warn('Refund for a payment we have no record of', { chargeId: charge.id, paymentIntent })
    return 'unknown-payment'
  }

  // The person's other payments, read inside the transaction so that a second payment being granted at the same
  // moment conflicts with this refund (one of the two then retries and sees the other's result).
  const othersQuery = deps.db.collection('payments').where('uid', '==', uid)
  const entitlementRef = deps.db.doc(`entitlements/${uid}`)
  const result = await deps.db.runTransaction(async (tx): Promise<'revoked' | 'moved' | 'kept'> => {
    // Firestore transactions need every read before any write.
    const snap = await tx.get(entitlementRef)
    const others = await tx.get(othersQuery)
    const current = readEntitlement(snap.exists ? snap.data() : null)
    const now = deps.serverTime()
    if (paymentDoc) {
      tx.set(deps.db.doc(`payments/${paymentDoc.id}`), { status: 'refunded', updatedAt: now }, { merge: true })
    }
    if (!shouldRevokeForRefund(current, paymentIntent)) return 'kept'
    // Another payment by the same person that still stands (they paid twice).
    const spare = others.docs.find((d) => {
      const p = d.data()
      return p.status === 'paid' && typeof p.paymentIntent === 'string' && p.paymentIntent !== paymentIntent
    })
    if (spare) {
      // They paid twice and the refunded payment was the one tied to the unlock: keep access on the other payment.
      const sp = spare.data()
      tx.set(
        entitlementRef,
        { sessionId: spare.id, paymentIntent: sp.paymentIntent, amount: sp.amount, currency: sp.currency },
        { merge: true },
      )
      return 'moved'
    }
    tx.set(entitlementRef, { access: 'revoked', revokedAt: now }, { merge: true })
    return 'revoked'
  })

  if (result === 'revoked') deps.log.info('Removed paid access after a full refund', { uid, paymentIntent })
  if (result === 'moved') deps.log.info('Kept paid access on a second payment after a refund', { uid, paymentIntent })
  return result
}
