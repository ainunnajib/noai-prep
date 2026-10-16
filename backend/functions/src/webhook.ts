// stripeWebhook: Stripe calls this after payments and refunds. Every request is
// checked against the webhook signing secret before anything is trusted.
//
// Replies: 405 for anything but POST, 400 if the signature is wrong, 500 if
// saving failed (Stripe then retries), otherwise 200, including for events we
// don't use, so Stripe doesn't keep retrying them.

import type { StripeLike } from './deps'
import type { ChargeLike, CheckoutSessionLike } from './entitlement'
import { grantFromSession, recordSessionStatus, revokeForRefund, type GrantDeps } from './grant'

export interface WebhookDeps extends GrantDeps {
  stripe: Pick<StripeLike, 'webhooks'>
  /** The endpoint's signing secret (whsec_...). */
  webhookSecret: string
}

/** The parts of the incoming request we use (an Express / firebase-functions Request fits this). */
export interface WebhookRequestLike {
  method: string
  rawBody?: Buffer
  headers: Record<string, string | string[] | undefined>
}

export interface WebhookResponse {
  status: number
  body: string | Record<string, unknown>
  headers?: Record<string, string>
}

export async function handleStripeWebhook(deps: WebhookDeps, req: WebhookRequestLike): Promise<WebhookResponse> {
  if (req.method !== 'POST') return { status: 405, body: 'Method Not Allowed', headers: { Allow: 'POST' } }

  const signature = req.headers['stripe-signature']
  if (!signature || !req.rawBody) return { status: 400, body: 'Missing Stripe signature' }

  let event
  try {
    event = deps.stripe.webhooks.constructEvent(req.rawBody, signature, deps.webhookSecret)
  } catch (err) {
    deps.log.warn('Rejected a webhook with a bad signature', { detail: err instanceof Error ? err.message : String(err) })
    return { status: 400, body: 'Invalid Stripe signature' }
  }

  try {
    const outcome = await handleEvent(deps, event.type, event.data.object)
    return { status: 200, body: { received: true, outcome } }
  } catch (err) {
    deps.log.error('Failed to handle a Stripe webhook', {
      eventId: event.id,
      type: event.type,
      detail: err instanceof Error ? err.message : String(err),
    })
    return { status: 500, body: 'Webhook handler failed' }
  }
}

async function handleEvent(deps: WebhookDeps, type: string, object: unknown): Promise<string> {
  switch (type) {
    case 'checkout.session.completed': {
      const session = object as CheckoutSessionLike
      // Card, Apple Pay and Google Pay payments are 'paid' here. A delayed
      // method stays 'unpaid' until checkout.session.async_payment_succeeded.
      if (session.payment_status !== 'paid') {
        await recordSessionStatus(deps, session, 'pending')
        return 'pending'
      }
      return (await grantFromSession(deps, session)).ok ? 'granted' : 'rejected'
    }
    case 'checkout.session.async_payment_succeeded':
      return (await grantFromSession(deps, object as CheckoutSessionLike)).ok ? 'granted' : 'rejected'
    case 'checkout.session.async_payment_failed':
      await recordSessionStatus(deps, object as CheckoutSessionLike, 'failed')
      return 'failed'
    case 'checkout.session.expired':
      await recordSessionStatus(deps, object as CheckoutSessionLike, 'expired')
      return 'expired'
    case 'charge.refunded':
      return revokeForRefund(deps, object as ChargeLike)
    default:
      return 'ignored'
  }
}
