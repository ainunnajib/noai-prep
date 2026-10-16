// createCheckoutSession and confirmCheckout: starting a S$10 Stripe Checkout
// payment, and checking it straight away when Stripe sends the person back.

import { HttpsError } from 'firebase-functions/v2/https'
import { requireUser, syncEntitlement, type AccessDeps, type CallableRequestLike } from './access'
import type { CheckoutCreateParams, StripeLike } from './deps'
import {
  accessOf,
  CURRENCY,
  isValidSessionId,
  readEntitlement,
  sessionUid,
  type AccessLevel,
  type CheckoutSessionLike,
} from './entitlement'
import { grantFromSession, type GrantDeps } from './grant'
import { checkoutUrls } from './urls'

export interface CheckoutDeps extends AccessDeps {
  stripe: StripeLike
  priceCents: number
  siteUrl: string
}

export const PRODUCT_NAME = 'NOAI Prep full course'
export const PRODUCT_DESCRIPTION =
  'One-time payment. Unlocks every module, the practice bank, mock exams and past papers on this account.'

export function checkoutParams(
  uid: string,
  email: string | null,
  priceCents: number,
  siteUrl: string,
): CheckoutCreateParams {
  const { successUrl, cancelUrl } = checkoutUrls(siteUrl)
  return {
    mode: 'payment',
    // No payment_method_types: the methods switched on in the Stripe Dashboard
    // (cards, PayNow, Apple Pay, Google Pay...) are offered automatically.
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          unit_amount: priceCents,
          product_data: { name: PRODUCT_NAME, description: PRODUCT_DESCRIPTION },
        },
        quantity: 1,
      },
    ],
    client_reference_id: uid,
    metadata: { uid },
    payment_intent_data: { metadata: { uid } },
    // So Stripe emails the receipt to the address they signed in with.
    ...(email ? { customer_email: email } : {}),
    success_url: successUrl,
    cancel_url: cancelUrl,
  }
}

export async function createCheckoutSession(
  deps: CheckoutDeps,
  request: CallableRequestLike,
): Promise<{ url: string } | { alreadyUnlocked: true }> {
  const user = requireUser(request)
  // Also applies the whitelist, so an invited person is never asked to pay.
  if ((await syncEntitlement(deps, user)) !== 'none') return { alreadyUnlocked: true }

  let params: CheckoutCreateParams
  try {
    params = checkoutParams(user.uid, user.email, deps.priceCents, deps.siteUrl)
  } catch (err) {
    deps.log.error('SITE_URL is not a valid https:// address', { detail: errorMessage(err) })
    throw new HttpsError('failed-precondition', "Payments aren't set up correctly yet. Please try again later.")
  }

  let session: { id: string; url: string | null }
  try {
    session = await deps.stripe.checkout.sessions.create(params)
  } catch (err) {
    deps.log.error('Stripe could not create a Checkout Session', { uid: user.uid, detail: errorMessage(err) })
    throw new HttpsError('unavailable', "Couldn't start the payment. Please try again in a minute.")
  }
  if (!session.url) throw new HttpsError('internal', "Couldn't start the payment. Please try again in a minute.")

  const now = deps.serverTime()
  await deps.db.doc(`payments/${session.id}`).set({
    uid: user.uid,
    email: user.email,
    amount: deps.priceCents,
    currency: CURRENCY,
    status: 'created',
    paymentIntent: null,
    createdAt: now,
    updatedAt: now,
  })
  return { url: session.url }
}

export interface ConfirmDeps extends GrantDeps {
  stripe: StripeLike
}

/**
 * Called by the Account page when Stripe sends the person back. Checks the
 * session with Stripe directly, so unlocking works even if the webhook is late.
 */
export async function confirmCheckout(
  deps: ConfirmDeps,
  request: CallableRequestLike,
): Promise<{ access: AccessLevel; status: string }> {
  const user = requireUser(request)
  const sessionId = (request.data as { sessionId?: unknown } | null | undefined)?.sessionId
  if (!isValidSessionId(sessionId)) throw new HttpsError('invalid-argument', "That payment reference doesn't look right.")

  let session: CheckoutSessionLike
  try {
    session = await deps.stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    if ((err as { code?: unknown })?.code === 'resource_missing') {
      throw new HttpsError('not-found', "We couldn't find that payment.")
    }
    deps.log.error('Stripe could not retrieve a Checkout Session', { uid: user.uid, sessionId, detail: errorMessage(err) })
    throw new HttpsError('unavailable', "Couldn't check the payment just now. Please try again in a minute.")
  }

  if (sessionUid(session) !== user.uid) {
    deps.log.warn('confirmCheckout for a session that belongs to someone else', { uid: user.uid, sessionId })
    throw new HttpsError('permission-denied', 'This payment was made from a different account. Sign in with that account.')
  }

  if (session.payment_status === 'paid') {
    const result = await grantFromSession(deps, session)
    if (result.ok) return { access: result.access, status: session.payment_status }
  }
  // Not paid (yet), or not accepted: report whatever access the person already has.
  const snap = await deps.db.doc(`entitlements/${user.uid}`).get()
  return { access: accessOf(readEntitlement(snap.exists ? snap.data() : null)), status: session.payment_status }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
