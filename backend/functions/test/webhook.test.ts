import { describe, expect, it } from 'vitest'
import { syncAccess } from '../src/access'
import { confirmCheckout, createCheckoutSession } from '../src/checkout'
import { grantFromSession } from '../src/grant'
import { handleStripeWebhook, type WebhookRequestLike } from '../src/webhook'
import { charge, GOOD_SIGNATURE, INVITED, makeDeps, session, signedIn } from './fakes'

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

  it('leaves sessions that are not ours (no uid) alone, without logging an error', async () => {
    const deps = makeDeps()
    const foreign = session({ client_reference_id: null, metadata: {} })
    expect((await handleStripeWebhook(deps, post('checkout.session.completed', foreign))).status).toBe(200)
    expect((await handleStripeWebhook(deps, post('checkout.session.expired', foreign))).status).toBe(200)
    expect(deps.db.docs.size).toBe(0)
    expect(deps.log.entries.filter((e) => e.level === 'error')).toEqual([])
  })

  it('gives an invited person who pays a paid unlock, which a later removal from the whitelist does not take away', async () => {
    const deps = makeDeps()
    deps.db.seed('entitlements/user-1', { access: 'whitelist', source: 'whitelist', email: INVITED, grantedAt: 'x' })
    // a checkout opened before the invite completes after it
    const result = await handleStripeWebhook(deps, post('checkout.session.completed', session()))
    expect(result).toEqual({ status: 200, body: { received: true, outcome: 'granted' } })
    expect(deps.db.read('entitlements/user-1')).toMatchObject({ access: 'paid', source: 'stripe', paymentIntent: 'pi_111' })
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('paid')
    const warning = deps.log.entries.find((e) => e.level === 'warn' && e.message.includes('invited account paid'))
    expect(warning?.data).toMatchObject({ uid: 'user-1', sessionId: 'cs_test_a1b2c3', paymentIntent: 'pi_111' })
    // the owner removes them from the list: their payment still stands, so access stays
    deps.whitelist = 'friend@example.com'
    expect(await syncAccess(deps, signedIn('user-1', INVITED))).toEqual({ access: 'paid' })
    expect(deps.db.read('entitlements/user-1')?.access).toBe('paid')
  })

  it('a refunded invited person gets their free access back at the next whitelist check', async () => {
    const deps = makeDeps()
    deps.db.seed('entitlements/user-1', { access: 'whitelist', source: 'whitelist', email: INVITED, grantedAt: 'x' })
    await handleStripeWebhook(deps, post('checkout.session.completed', session()))
    expect(await handleStripeWebhook(deps, post('charge.refunded', charge()))).toMatchObject({ body: { outcome: 'revoked' } })
    expect(await syncAccess(deps, signedIn('user-1', INVITED))).toEqual({ access: 'whitelist' })
  })

  it('still unlocks a session opened at the old price after PRICE_SGD_CENTS is raised', async () => {
    const deps = makeDeps()
    await createCheckoutSession(deps, signedIn('user-1')) // records payments/cs_test_fake1 with amount 1000
    deps.priceCents = 1500
    const result = await handleStripeWebhook(deps, post('checkout.session.completed', session({ id: 'cs_test_fake1', amount_total: 1000 })))
    expect(result).toEqual({ status: 200, body: { received: true, outcome: 'granted' } })
    expect(deps.db.read('entitlements/user-1')?.access).toBe('paid')
    // a session with no record of its price is held to the current one
    const other = makeDeps()
    other.priceCents = 1500
    await handleStripeWebhook(other, post('checkout.session.completed', session({ amount_total: 1000 })))
    expect(other.db.read('entitlements/user-1')).toBeUndefined()
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
    expect(deps.db.read('entitlements/user-1')).toEqual({ ...paidEntitlement, access: 'revoked', revokedAt: 'server-time-3' })
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('refunded')
    expect(deps.db.read('refunds/pi_111')).toEqual({ chargeId: 'ch_111', uid: 'user-1', refundedAt: 'server-time-2' })
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

  it('answers 200 to a refund for a payment it has no record of, and only remembers the refund', async () => {
    const deps = makeDeps()
    const result = await handleStripeWebhook(deps, post('charge.refunded', charge({ metadata: null })))
    expect(result).toEqual({ status: 200, body: { received: true, outcome: 'unknown-payment' } })
    expect([...deps.db.docs.keys()]).toEqual(['refunds/pi_111'])
  })

  it('a refund handled before the unlock was recorded is not undone by a later grant', async () => {
    const deps = makeDeps()
    await createCheckoutSession(deps, signedIn('user-1')) // payments/cs_test_fake1, paymentIntent still null
    const id = 'cs_test_fake1'
    // the first completed delivery fails, so Stripe will retry it
    deps.db.failNextTransaction = new Error('Firestore unavailable')
    expect((await handleStripeWebhook(deps, post('checkout.session.completed', session({ id })))).status).toBe(500)
    // the owner refunds in full meanwhile
    expect((await handleStripeWebhook(deps, post('charge.refunded', charge()))).status).toBe(200)
    // Stripe's retry (its event still says "paid") and the payment check on the Account page both refuse
    const retry = await handleStripeWebhook(deps, post('checkout.session.completed', session({ id })))
    expect(retry).toEqual({ status: 200, body: { received: true, outcome: 'rejected' } })
    deps.stripe.sessions.set(id, session({ id }))
    expect(await confirmCheckout(deps, signedIn('user-1', 'student@example.com', true, { sessionId: id }))).toEqual({
      access: 'none',
      status: 'paid',
    })
    expect(deps.db.read('entitlements/user-1')).toBeUndefined()
    expect(deps.db.read(`payments/${id}`)).toMatchObject({ status: 'refunded', paymentIntent: 'pi_111' })
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

  it('a leftover test-mode payment never keeps a refunded live unlock (and a live second payment still does)', async () => {
    const deps = makeDeps()
    // the owner tested in test mode, then removed the test unlock as the README says (the payment record stays)
    await grantFromSession(deps, session({ id: 'cs_test_T1', payment_intent: 'pi_test_1' }))
    deps.db.docs.delete('entitlements/user-1')
    await grantFromSession(deps, session({ id: 'cs_live_L1', payment_intent: 'pi_live_1' }))
    const refunded = await handleStripeWebhook(deps, post('charge.refunded', charge({ id: 'ch_live_1', payment_intent: 'pi_live_1' })))
    expect(refunded).toEqual({ status: 200, body: { received: true, outcome: 'revoked' } })
    expect(deps.db.read('entitlements/user-1')?.access).toBe('revoked')

    // a genuine second live payment does keep it
    const twice = makeDeps()
    await grantFromSession(twice, session({ id: 'cs_live_A', payment_intent: 'pi_live_a' }))
    await grantFromSession(twice, session({ id: 'cs_live_B', payment_intent: 'pi_live_b' }))
    const moved = await handleStripeWebhook(twice, post('charge.refunded', charge({ id: 'ch_live_a', payment_intent: 'pi_live_a' })))
    expect(moved).toEqual({ status: 200, body: { received: true, outcome: 'moved' } })
    expect(twice.db.read('entitlements/user-1')).toMatchObject({ access: 'paid', sessionId: 'cs_live_B' })
  })

  it('sees a second payment granted just before the refund is applied, and keeps access on it', async () => {
    const deps = await paidUser()
    // the second payment's grant lands after the refund has started, just before its transaction
    const runTransaction = deps.db.runTransaction.bind(deps.db)
    let interleaved = false
    deps.db.runTransaction = async (fn) => {
      if (!interleaved) {
        interleaved = true
        await grantFromSession(deps, session({ id: 'cs_test_second', payment_intent: 'pi_222' }))
      }
      return runTransaction(fn)
    }
    const result = await handleStripeWebhook(deps, post('charge.refunded', charge()))
    expect(result).toEqual({ status: 200, body: { received: true, outcome: 'moved' } })
    expect(deps.db.read('entitlements/user-1')).toMatchObject({ access: 'paid', paymentIntent: 'pi_222', sessionId: 'cs_test_second' })
  })
})
