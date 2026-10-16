import { HttpsError } from 'firebase-functions/v2/https'
import type Stripe from 'stripe'
import { describe, expect, it } from 'vitest'
import { checkoutParams, confirmCheckout, createCheckoutSession, PRODUCT_DESCRIPTION, PRODUCT_NAME } from '../src/checkout'
import { INVITED, makeDeps, PRICE, session, signedIn, signedOut } from './fakes'

// Compile-time check (run by `npm run typecheck`): what we send is a valid set of Stripe parameters.
const typed: Stripe.Checkout.SessionCreateParams = checkoutParams('u1', 'a@example.com', PRICE, 'https://example.com/')
void typed

describe('createCheckoutSession', () => {
  it('rejects a signed-out caller and never calls Stripe', async () => {
    const deps = makeDeps()
    const call = createCheckoutSession(deps, signedOut())
    await expect(call).rejects.toBeInstanceOf(HttpsError)
    await expect(call).rejects.toMatchObject({ code: 'unauthenticated' })
    expect(deps.stripe.created).toHaveLength(0)
  })

  it('creates a one-time S$10 payment with exactly the agreed parameters', async () => {
    const deps = makeDeps()
    const result = await createCheckoutSession(deps, signedIn('user-1', 'student@example.com'))
    expect(result).toEqual({ url: 'https://checkout.stripe.com/c/pay/cs_test_fake1' })
    expect(deps.stripe.created).toHaveLength(1)
    expect(deps.stripe.created[0]).toEqual({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'sgd',
            unit_amount: 1000,
            product_data: { name: PRODUCT_NAME, description: PRODUCT_DESCRIPTION },
          },
          quantity: 1,
        },
      ],
      client_reference_id: 'user-1',
      metadata: { uid: 'user-1' },
      payment_intent_data: { metadata: { uid: 'user-1' } },
      customer_email: 'student@example.com',
      success_url: 'https://ainunnajib.github.io/noai-prep/?checkout=success&session_id={CHECKOUT_SESSION_ID}#/account',
      cancel_url: 'https://ainunnajib.github.io/noai-prep/?checkout=cancelled#/account',
    })
    expect(PRODUCT_NAME).toBe('NOAI Prep full course')
    expect(PRODUCT_DESCRIPTION).toBe(
      'One-time payment. Unlocks every module, the practice bank, mock exams and past papers on this account.',
    )
  })

  it('does not set payment_method_types, so the Dashboard settings (PayNow, wallets...) apply', async () => {
    const deps = makeDeps()
    await createCheckoutSession(deps, signedIn('user-1'))
    expect(deps.stripe.created[0]).not.toHaveProperty('payment_method_types')
  })

  it('records the new session in payments with status "created"', async () => {
    const deps = makeDeps()
    await createCheckoutSession(deps, signedIn('user-1', 'student@example.com'))
    expect(deps.db.read('payments/cs_test_fake1')).toEqual({
      uid: 'user-1',
      email: 'student@example.com',
      amount: 1000,
      currency: 'sgd',
      status: 'created',
      paymentIntent: null,
      createdAt: 'server-time-1',
      updatedAt: 'server-time-1',
    })
  })

  it('leaves out customer_email when the account has no email', async () => {
    const deps = makeDeps()
    await createCheckoutSession(deps, signedIn('user-1', null))
    expect(deps.stripe.created[0]).not.toHaveProperty('customer_email')
  })

  it('uses PRICE_SGD_CENTS and SITE_URL, adding the missing trailing slash', async () => {
    const deps = makeDeps()
    deps.priceCents = 1500
    deps.siteUrl = 'https://example.com/noai-prep'
    await createCheckoutSession(deps, signedIn('user-1'))
    const params = deps.stripe.created[0]
    expect(params.line_items[0].price_data.unit_amount).toBe(1500)
    expect(params.success_url).toBe('https://example.com/noai-prep/?checkout=success&session_id={CHECKOUT_SESSION_ID}#/account')
    expect(params.cancel_url).toBe('https://example.com/noai-prep/?checkout=cancelled#/account')
  })

  it('short-circuits for someone who has already paid', async () => {
    const deps = makeDeps()
    deps.db.seed('entitlements/user-1', { access: 'paid', source: 'stripe', email: null, grantedAt: 'x' })
    expect(await createCheckoutSession(deps, signedIn('user-1'))).toEqual({ alreadyUnlocked: true })
    expect(deps.stripe.created).toHaveLength(0)
    expect([...deps.db.docs.keys()]).toEqual(['entitlements/user-1'])
  })

  it('short-circuits for a whitelisted person, granting their free access instead of charging', async () => {
    const deps = makeDeps()
    expect(await createCheckoutSession(deps, signedIn('user-1', INVITED))).toEqual({ alreadyUnlocked: true })
    expect(deps.stripe.created).toHaveLength(0)
    expect(deps.db.read('entitlements/user-1')?.access).toBe('whitelist')
  })

  it('still lets someone pay again after a refund', async () => {
    const deps = makeDeps()
    deps.db.seed('entitlements/user-1', { access: 'revoked', source: 'stripe', email: null, grantedAt: 'x' })
    expect(await createCheckoutSession(deps, signedIn('user-1'))).toHaveProperty('url')
  })

  it('reports a friendly "unavailable" error if Stripe fails, without recording a payment', async () => {
    const deps = makeDeps()
    deps.stripe.createError = new Error('Invalid API Key provided')
    await expect(createCheckoutSession(deps, signedIn('user-1'))).rejects.toMatchObject({ code: 'unavailable' })
    expect(deps.db.docs.size).toBe(0)
  })

  it('refuses to start if SITE_URL is not https', async () => {
    const deps = makeDeps()
    deps.siteUrl = 'http://example.com/'
    await expect(createCheckoutSession(deps, signedIn('user-1'))).rejects.toMatchObject({ code: 'failed-precondition' })
    expect(deps.stripe.created).toHaveLength(0)
  })
})

describe('confirmCheckout', () => {
  it('rejects a signed-out caller', async () => {
    const deps = makeDeps()
    await expect(confirmCheckout(deps, signedOut({ sessionId: 'cs_test_a1b2c3' }))).rejects.toMatchObject({
      code: 'unauthenticated',
    })
  })

  it('validates the session id before asking Stripe', async () => {
    const deps = makeDeps()
    const bad = [undefined, null, {}, { sessionId: '' }, { sessionId: 5 }, { sessionId: 'pi_123' }, { sessionId: 'cs_test_a/../b' }]
    for (const data of bad) {
      await expect(confirmCheckout(deps, signedIn('user-1', null, true, data))).rejects.toMatchObject({
        code: 'invalid-argument',
      })
    }
    expect(deps.stripe.retrieved).toHaveLength(0)
  })

  it('reports an unknown session as "not-found"', async () => {
    const deps = makeDeps()
    await expect(
      confirmCheckout(deps, signedIn('user-1', null, true, { sessionId: 'cs_test_missing' })),
    ).rejects.toMatchObject({ code: 'not-found' })
  })

  it('unlocks the course when the session is paid and belongs to the caller', async () => {
    const deps = makeDeps()
    deps.stripe.sessions.set('cs_test_a1b2c3', session())
    const result = await confirmCheckout(deps, signedIn('user-1', 'student@example.com', true, { sessionId: 'cs_test_a1b2c3' }))
    expect(result).toEqual({ access: 'paid', status: 'paid' })
    expect(deps.db.read('entitlements/user-1')).toEqual({
      access: 'paid',
      source: 'stripe',
      email: 'student@example.com',
      grantedAt: 'server-time-1',
      sessionId: 'cs_test_a1b2c3',
      paymentIntent: 'pi_111',
      amount: 1000,
      currency: 'sgd',
    })
    expect(deps.db.read('payments/cs_test_a1b2c3')).toMatchObject({ uid: 'user-1', status: 'paid', paymentIntent: 'pi_111' })
  })

  it('is idempotent: confirming twice leaves the first grant as it was', async () => {
    const deps = makeDeps()
    deps.stripe.sessions.set('cs_test_a1b2c3', session())
    const request = signedIn('user-1', 'student@example.com', true, { sessionId: 'cs_test_a1b2c3' })
    await confirmCheckout(deps, request)
    expect(await confirmCheckout(deps, request)).toEqual({ access: 'paid', status: 'paid' })
    expect(deps.db.read('entitlements/user-1')?.grantedAt).toBe('server-time-1')
  })

  it('refuses a session that belongs to a different account', async () => {
    const deps = makeDeps()
    deps.stripe.sessions.set('cs_test_a1b2c3', session())
    const call = confirmCheckout(deps, signedIn('someone-else', null, true, { sessionId: 'cs_test_a1b2c3' }))
    await expect(call).rejects.toMatchObject({ code: 'permission-denied' })
    expect(deps.db.docs.size).toBe(0)
  })

  it('does not unlock a session that is not paid yet', async () => {
    const deps = makeDeps()
    deps.stripe.sessions.set('cs_test_a1b2c3', session({ payment_status: 'unpaid' }))
    const result = await confirmCheckout(deps, signedIn('user-1', null, true, { sessionId: 'cs_test_a1b2c3' }))
    expect(result).toEqual({ access: 'none', status: 'unpaid' })
    expect(deps.db.read('entitlements/user-1')).toBeUndefined()
  })

  it('does not unlock a paid session in the wrong currency or for too little', async () => {
    for (const bad of [session({ currency: 'usd' }), session({ amount_total: 500 })]) {
      const deps = makeDeps()
      deps.stripe.sessions.set('cs_test_a1b2c3', bad)
      const result = await confirmCheckout(deps, signedIn('user-1', null, true, { sessionId: 'cs_test_a1b2c3' }))
      expect(result).toEqual({ access: 'none', status: 'paid' })
      expect(deps.db.read('entitlements/user-1')).toBeUndefined()
    }
  })

  it('does not unlock again with a session whose payment was refunded', async () => {
    const deps = makeDeps()
    deps.stripe.sessions.set('cs_test_a1b2c3', session())
    deps.db.seed('entitlements/user-1', {
      access: 'revoked',
      source: 'stripe',
      email: null,
      grantedAt: 'x',
      paymentIntent: 'pi_111',
      revokedAt: 'y',
    })
    deps.db.seed('payments/cs_test_a1b2c3', { uid: 'user-1', status: 'refunded', paymentIntent: 'pi_111' })
    const result = await confirmCheckout(deps, signedIn('user-1', null, true, { sessionId: 'cs_test_a1b2c3' }))
    expect(result).toEqual({ access: 'none', status: 'paid' })
    expect(deps.db.read('entitlements/user-1')?.access).toBe('revoked')
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('refunded')
  })

  it('gives an invited person who somehow pays a paid unlock (so leaving the whitelist later keeps it)', async () => {
    const deps = makeDeps()
    deps.stripe.sessions.set('cs_test_a1b2c3', session())
    deps.db.seed('entitlements/user-1', { access: 'whitelist', source: 'whitelist', email: INVITED, grantedAt: 'x' })
    const result = await confirmCheckout(deps, signedIn('user-1', INVITED, true, { sessionId: 'cs_test_a1b2c3' }))
    expect(result).toEqual({ access: 'paid', status: 'paid' })
    expect(deps.db.read('entitlements/user-1')).toMatchObject({ access: 'paid', source: 'stripe', paymentIntent: 'pi_111' })
    expect(deps.db.read('payments/cs_test_a1b2c3')?.status).toBe('paid')
  })
})
