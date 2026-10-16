import { describe, expect, it } from 'vitest'
import { handleStripeWebhook, type WebhookRequestLike } from '../src/webhook'
import { charge, GOOD_SIGNATURE, INVITED, makeDeps, session } from './fakes'

let eventCounter = 0

/** A signed webhook delivery. Pass `null` as the signature to leave the header out. */
function post(type: string, object: unknown, signature: string | null = GOOD_SIGNATURE): WebhookRequestLike {
  const event = { id: `evt_${++eventCounter}`, type, data: { object } }
  const headers = signature === null ? {} : { 'stripe-signature': signature }
  return { method: 'POST', rawBody: Buffer.from(JSON.stringify(event)), headers }
}

const paidEntitlement = {
  access: 'paid',
  source: 'stripe',
  email: 'student@example.com',
  grantedAt: 'server-time-1',
  sessionId: 'cs_test_a1b2c3',
  paymentIntent: 'pi_111',
  amount: 1000,
  currency: 'sgd',
}

describe('stripeWebhook: requests', () => {
  it('only accepts POST', async () => {
    const deps = makeDeps()
    const result = await handleStripeWebhook(deps, { method: 'GET', headers: {} })
    expect(result).toMatchObject({ status: 405, headers: { Allow: 'POST' } })
  })

  it('answers 400 to a request without a signature', async () => {
    const deps = makeDeps()
    const result = await handleStripeWebhook(deps, post('checkout.session.completed', session(), null))
    expect(result.status).toBe(400)
    expect(deps.db.docs.size).toBe(0)
  })

  it('answers 400 to a bad signature and writes nothing', async () => {
    const deps = makeDeps()
    const result = await handleStripeWebhook(deps, post('checkout.session.completed', session(), 't=1,v1=forged'))
    expect(result.status).toBe(400)
    expect(deps.db.docs.size).toBe(0)
  })

  it('answers 400 when signed with a different endpoint secret', async () => {
    const deps = makeDeps()
    deps.webhookSecret = 'whsec_other'
    expect((await handleStripeWebhook(deps, post('checkout.session.completed', session()))).status).toBe(400)
    expect(deps.db.docs.size).toBe(0)
  })

  it('answers 200 to events it does not use, and ignores them', async () => {
    const deps = makeDeps()
    const result = await handleStripeWebhook(deps, post('payment_intent.created', { id: 'pi_111' }))
    expect(result).toEqual({ status: 200, body: { received: true, outcome: 'ignored' } })
    expect(deps.db.docs.size).toBe(0)
  })

  it('answers 500 if saving fails, so Stripe retries later', async () => {
    const deps = makeDeps()
    deps.db.failNextTransaction = new Error('Firestore unavailable')
    const result = await handleStripeWebhook(deps, post('checkout.session.completed', session()))
    expect(result.status).toBe(500)
    expect(deps.db.read('entitlements/user-1')).toBeUndefined()
    // Stripe's retry then succeeds.
    expect((await handleStripeWebhook(deps, post('checkout.session.completed', session()))).status).toBe(200)
    expect(deps.db.read('entitlements/user-1')?.access).toBe('paid')
  })
})

describe('stripeWebhook: payments', () => {
  it('unlocks the course on checkout.session.completed when paid', async () => {
    const deps = makeDeps()
    deps.db.seed('payments/cs_test_a1b2c3', {
      uid: 'user-1',
      email: 'student@example.com',
      amount: 1000,
      currency: 'sgd',
      status: 'created',
      paymentIntent: null,
      createdAt: 'created-time',
      updatedAt: 'created-time',
    })
    const result = await handleStripeWebhook(deps, post('checkout.session.completed', session()))
    expect(result).toEqual({ status: 200, body: { received: true, outcome: 'granted' } })
    expect(deps.db.read('entitlements/user-1')).toEqual(paidEntitlement)
    expect(deps.db.read('payments/cs_test_a1b2c3')).toEqual({
      uid: 'user-1',
      email: 'student@example.com',
      amount: 1000,
      currency: 'sgd',
      status: 'paid',
      paymentIntent: 'pi_111',
      createdAt: 'created-time',
      updatedAt: 'server-time-1',
    })
  })

  it('does not unlock on checkout.session.completed while the payment is still unpaid', async () => {
    const deps = makeDeps()
    const result = await handleStripeWebhook(deps, post('checkout.session.completed', session({ payment_status: 'unpaid' })))
    expect(result.status).toBe(200)
    expect(deps.db.read('entitlements/user-1')).toBeUndefined()
    expect(deps.db.read('payments/cs_test_a1b2c3')).toMatchObject({ uid: 'user-1', status: 'pending' })
  })

  it('unlocks on checkout.session.async_payment_succeeded', async () => {
    const deps = makeDeps()
    await handleStripeWebhook(deps, post('checkout.session.completed', session({ payment_status: 'unpaid' })))
    const result = await handleStripeWebhook(deps, post('checkout.session.async_payment_succeeded', session()))
    expect(result.status).toBe(200)
    expect(deps.db.read('entitlements/user-1')).toMatchObject({ access: 'paid', paymentIntent: 'pi_111' })
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('paid')
  })

  it('keeps "paid" if an older "pending" event arrives late', async () => {
    const deps = makeDeps()
    await handleStripeWebhook(deps, post('checkout.session.async_payment_succeeded', session()))
    await handleStripeWebhook(deps, post('checkout.session.completed', session({ payment_status: 'unpaid' })))
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('paid')
    expect(deps.db.read('entitlements/user-1')?.access).toBe('paid')
  })

  it('records failed and expired sessions without granting anything', async () => {
    const deps = makeDeps()
    await handleStripeWebhook(deps, post('checkout.session.async_payment_failed', session({ payment_status: 'unpaid' })))
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('failed')
    await handleStripeWebhook(deps, post('checkout.session.expired', session({ id: 'cs_test_zz9', payment_status: 'unpaid' })))
    expect(deps.db.read('payments/cs_test_zz9')?.status).toBe('expired')
    expect(deps.db.read('entitlements/user-1')).toBeUndefined()
  })

  it('handles a duplicate delivery of the same event once', async () => {
    const deps = makeDeps()
    const request = post('checkout.session.completed', session())
    expect((await handleStripeWebhook(deps, request)).status).toBe(200)
    expect((await handleStripeWebhook(deps, request)).status).toBe(200)
    expect(deps.db.read('entitlements/user-1')).toEqual(paidEntitlement)
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('paid')
  })

  it('refuses the wrong currency, too small an amount or a subscription, but still answers 200', async () => {
    for (const bad of [session({ currency: 'usd' }), session({ amount_total: 999 }), session({ mode: 'subscription' })]) {
      const deps = makeDeps()
      const result = await handleStripeWebhook(deps, post('checkout.session.completed', bad))
      expect(result).toEqual({ status: 200, body: { received: true, outcome: 'rejected' } })
      expect(deps.db.read('entitlements/user-1')).toBeUndefined()
      expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('rejected')
      expect(deps.log.entries.some((e) => e.level === 'error')).toBe(true)
    }
  })

  it('leaves sessions that are not ours (no uid) alone', async () => {
    const deps = makeDeps()
    const foreign = session({ client_reference_id: null, metadata: {} })
    expect((await handleStripeWebhook(deps, post('checkout.session.completed', foreign))).status).toBe(200)
    expect((await handleStripeWebhook(deps, post('checkout.session.expired', foreign))).status).toBe(200)
    expect(deps.db.docs.size).toBe(0)
  })

  it('does not downgrade whitelist access when an invited person pays', async () => {
    const deps = makeDeps()
    const invited = { access: 'whitelist', source: 'whitelist', email: INVITED, grantedAt: 'x' }
    deps.db.seed('entitlements/user-1', invited)
    await handleStripeWebhook(deps, post('checkout.session.completed', session()))
    expect(deps.db.read('entitlements/user-1')).toEqual(invited)
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('paid')
  })
})

describe('stripeWebhook: refunds', () => {
  async function paidUser() {
    const deps = makeDeps()
    await handleStripeWebhook(deps, post('checkout.session.completed', session()))
    return deps
  }

  it('revokes the paid unlock after a full refund', async () => {
    const deps = await paidUser()
    const result = await handleStripeWebhook(deps, post('charge.refunded', charge()))
    expect(result).toEqual({ status: 200, body: { received: true, outcome: 'revoked' } })
    expect(deps.db.read('entitlements/user-1')).toEqual({ ...paidEntitlement, access: 'revoked', revokedAt: 'server-time-2' })
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('refunded')
  })

  it('finds the account through the payment record when the charge has no uid', async () => {
    const deps = await paidUser()
    await handleStripeWebhook(deps, post('charge.refunded', charge({ metadata: {} })))
    expect(deps.db.read('entitlements/user-1')?.access).toBe('revoked')
  })

  it('ignores a partial refund', async () => {
    const deps = await paidUser()
    const result = await handleStripeWebhook(deps, post('charge.refunded', charge({ refunded: false })))
    expect(result.status).toBe(200)
    expect(deps.db.read('entitlements/user-1')?.access).toBe('paid')
  })

  it('only revokes the unlock bought with the refunded payment', async () => {
    const deps = await paidUser()
    await handleStripeWebhook(deps, post('charge.refunded', charge({ payment_intent: 'pi_other' })))
    expect(deps.db.read('entitlements/user-1')).toEqual(paidEntitlement)
  })

  it('never touches whitelist access', async () => {
    const deps = makeDeps()
    const invited = { access: 'whitelist', source: 'whitelist', email: INVITED, grantedAt: 'x', paymentIntent: 'pi_111' }
    deps.db.seed('entitlements/user-1', invited)
    const result = await handleStripeWebhook(deps, post('charge.refunded', charge()))
    expect(result.status).toBe(200)
    expect(deps.db.read('entitlements/user-1')).toEqual(invited)
  })

  it('answers 200 to a refund for a payment it has no record of', async () => {
    const deps = makeDeps()
    const result = await handleStripeWebhook(deps, post('charge.refunded', charge({ metadata: null })))
    expect(result).toEqual({ status: 200, body: { received: true, outcome: 'unknown-payment' } })
    expect(deps.db.docs.size).toBe(0)
  })

  it('does not unlock again if the old completed event is delivered after the refund', async () => {
    const deps = await paidUser()
    await handleStripeWebhook(deps, post('charge.refunded', charge()))
    await handleStripeWebhook(deps, post('checkout.session.completed', session()))
    expect(deps.db.read('entitlements/user-1')?.access).toBe('revoked')
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('refunded')
  })

  it('unlocks again when the person makes a new payment after a refund', async () => {
    const deps = await paidUser()
    await handleStripeWebhook(deps, post('charge.refunded', charge()))
    await handleStripeWebhook(deps, post('checkout.session.completed', session({ id: 'cs_test_new2', payment_intent: 'pi_222' })))
    expect(deps.db.read('entitlements/user-1')).toMatchObject({
      access: 'paid',
      sessionId: 'cs_test_new2',
      paymentIntent: 'pi_222',
    })
    expect(deps.db.read('entitlements/user-1')).not.toHaveProperty('revokedAt')
  })

  it('warns about a second payment for an account that is already unlocked', async () => {
    const deps = await paidUser()
    await handleStripeWebhook(deps, post('checkout.session.completed', session({ id: 'cs_test_second', payment_intent: 'pi_222' })))
    expect(deps.db.read('entitlements/user-1')).toEqual(paidEntitlement)
    expect(deps.db.read('payments/cs_test_second')?.status).toBe('paid')
    const warning = deps.log.entries.find((e) => e.level === 'warn' && e.message.includes('second payment'))
    expect(warning?.data).toMatchObject({ uid: 'user-1', sessionId: 'cs_test_second', paymentIntent: 'pi_222' })
  })

  it('keeps access on the other payment when someone who paid twice is refunded the first', async () => {
    const deps = await paidUser()
    await handleStripeWebhook(deps, post('checkout.session.completed', session({ id: 'cs_test_second', payment_intent: 'pi_222' })))
    const result = await handleStripeWebhook(deps, post('charge.refunded', charge()))
    expect(result).toEqual({ status: 200, body: { received: true, outcome: 'moved' } })
    expect(deps.db.read('entitlements/user-1')).toMatchObject({
      access: 'paid',
      paymentIntent: 'pi_222',
      sessionId: 'cs_test_second',
    })
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('refunded')
    // Refunding the second payment as well takes access away.
    const second = await handleStripeWebhook(deps, post('charge.refunded', charge({ id: 'ch_222', payment_intent: 'pi_222' })))
    expect(second).toEqual({ status: 200, body: { received: true, outcome: 'revoked' } })
    expect(deps.db.read('entitlements/user-1')?.access).toBe('revoked')
    expect(deps.db.read('payments/cs_test_second')?.status).toBe('refunded')
  })
})
