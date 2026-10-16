import { describe, expect, it } from 'vitest'
import {
  accessOf,
  checkPaidSession,
  decideSync,
  isRefundedPayment,
  isSafeDocId,
  isValidSessionId,
  readEntitlement,
  shouldRevokeForRefund,
  type Entitlement,
} from '../src/entitlement'
import { checkoutUrls, siteBase } from '../src/urls'
import { PRICE, session } from './fakes'

const paid: Entitlement = { access: 'paid', source: 'stripe', email: 'a@example.com', grantedAt: 't', paymentIntent: 'pi_1' }
const whitelist: Entitlement = { access: 'whitelist', source: 'whitelist', email: 'a@example.com', grantedAt: 't' }
const revoked: Entitlement = { ...paid, access: 'revoked', revokedAt: 't2' }

describe('decideSync', () => {
  it('grants whitelist access to a whitelisted person with nothing yet', () => {
    expect(decideSync(null, true)).toEqual({ write: 'grant-whitelist', access: 'whitelist' })
  })

  it('grants whitelist access again after a refund revoked a paid unlock', () => {
    expect(decideSync(revoked, true)).toEqual({ write: 'grant-whitelist', access: 'whitelist' })
  })

  it('leaves an existing paid or whitelist entitlement alone for a whitelisted person', () => {
    expect(decideSync(paid, true)).toEqual({ write: null, access: 'paid' })
    expect(decideSync(whitelist, true)).toEqual({ write: null, access: 'whitelist' })
  })

  it('removes whitelist access once the email is no longer whitelisted', () => {
    expect(decideSync(whitelist, false)).toEqual({ write: 'remove-whitelist', access: 'none' })
  })

  it('never removes a paid unlock', () => {
    expect(decideSync(paid, false)).toEqual({ write: null, access: 'paid' })
  })

  it('does nothing for a person who is neither whitelisted nor paid', () => {
    expect(decideSync(null, false)).toEqual({ write: null, access: 'none' })
    expect(decideSync(revoked, false)).toEqual({ write: null, access: 'none' })
  })
})

describe('readEntitlement and accessOf', () => {
  it('only accepts the three known access values', () => {
    expect(readEntitlement(paid)).toEqual(paid)
    expect(readEntitlement({ access: 'admin' })).toBeNull()
    expect(readEntitlement({})).toBeNull()
    expect(readEntitlement(undefined)).toBeNull()
    expect(readEntitlement('paid')).toBeNull()
  })

  it('maps revoked and missing to no access', () => {
    expect(accessOf(paid)).toBe('paid')
    expect(accessOf(whitelist)).toBe('whitelist')
    expect(accessOf(revoked)).toBe('none')
    expect(accessOf(null)).toBe('none')
  })
})

describe('isValidSessionId', () => {
  it('accepts test and live Checkout Session ids', () => {
    expect(isValidSessionId('cs_test_a1B2c3')).toBe(true)
    expect(isValidSessionId('cs_live_ZZ99')).toBe(true)
  })

  it('rejects anything else', () => {
    for (const bad of ['', 'cs_test_', 'cs_abc', 'pi_123', 'cs_test_abc/def', ' cs_test_abc', 'cs_test_abc\n', 'cs_other_abc']) {
      expect(isValidSessionId(bad), JSON.stringify(bad)).toBe(false)
    }
    expect(isValidSessionId(`cs_test_${'a'.repeat(300)}`)).toBe(false)
    expect(isValidSessionId(123)).toBe(false)
    expect(isValidSessionId(null)).toBe(false)
    expect(isValidSessionId({ id: 'cs_test_a' })).toBe(false)
  })
})

describe('isSafeDocId', () => {
  it('accepts Firebase-style uids and rejects path tricks', () => {
    expect(isSafeDocId('Xy12abCDef34GH56ij78KL90mn12')).toBe(true)
    expect(isSafeDocId('a/b')).toBe(false)
    expect(isSafeDocId('..')).toBe(false)
    expect(isSafeDocId('__name__')).toBe(false)
    expect(isSafeDocId('')).toBe(false)
    expect(isSafeDocId(null)).toBe(false)
  })
})

describe('checkPaidSession', () => {
  it('accepts a paid S$10 payment session and reads the uid from client_reference_id', () => {
    expect(checkPaidSession(session(), PRICE)).toEqual({
      ok: true,
      uid: 'user-1',
      sessionId: 'cs_test_a1b2c3',
      paymentIntent: 'pi_111',
      amount: PRICE,
      currency: 'sgd',
    })
  })

  it('falls back to metadata.uid and accepts an expanded payment intent', () => {
    const result = checkPaidSession(
      session({ client_reference_id: null, metadata: { uid: 'user-2' }, payment_intent: { id: 'pi_222' } }),
      PRICE,
    )
    expect(result).toMatchObject({ ok: true, uid: 'user-2', paymentIntent: 'pi_222' })
  })

  it('accepts a currency written in capitals', () => {
    expect(checkPaidSession(session({ currency: 'SGD' }), PRICE).ok).toBe(true)
  })

  it('refuses sessions that are not a full paid S$ payment', () => {
    const cases = [
      session({ payment_status: 'unpaid' }),
      session({ payment_status: 'no_payment_required', amount_total: 0 }),
      session({ mode: 'subscription' }),
      session({ currency: 'usd' }),
      session({ currency: null }),
      session({ amount_total: PRICE - 1 }),
      session({ amount_total: null }),
      session({ client_reference_id: null, metadata: null }),
      session({ client_reference_id: 'a/b' }),
    ]
    for (const s of cases) expect(checkPaidSession(s, PRICE).ok, JSON.stringify(s)).toBe(false)
  })

  it('accepts more than the price (for example if tax were ever added)', () => {
    expect(checkPaidSession(session({ amount_total: PRICE + 90 }), PRICE).ok).toBe(true)
  })
})

describe('refund decisions', () => {
  it('revokes only the paid entitlement bought with the refunded payment', () => {
    expect(shouldRevokeForRefund(paid, 'pi_1')).toBe(true)
    expect(shouldRevokeForRefund(paid, 'pi_other')).toBe(false)
    expect(shouldRevokeForRefund(paid, null)).toBe(false)
    expect(shouldRevokeForRefund(whitelist, 'pi_1')).toBe(false)
    expect(shouldRevokeForRefund({ ...whitelist, paymentIntent: 'pi_1' }, 'pi_1')).toBe(false)
    expect(shouldRevokeForRefund(null, 'pi_1')).toBe(false)
  })

  it('recognises a refunded payment from either the payment record or the revoked entitlement', () => {
    expect(isRefundedPayment(null, 'refunded', 'pi_1')).toBe(true)
    expect(isRefundedPayment(revoked, 'paid', 'pi_1')).toBe(true)
    expect(isRefundedPayment(revoked, 'paid', 'pi_new')).toBe(false)
    expect(isRefundedPayment(null, 'created', 'pi_1')).toBe(false)
  })
})

describe('checkout return addresses', () => {
  it('put the query string before the #/account hash', () => {
    const { successUrl, cancelUrl } = checkoutUrls('https://ainunnajib.github.io/noai-prep/')
    expect(successUrl).toBe(
      'https://ainunnajib.github.io/noai-prep/?checkout=success&session_id={CHECKOUT_SESSION_ID}#/account',
    )
    expect(cancelUrl).toBe('https://ainunnajib.github.io/noai-prep/?checkout=cancelled#/account')
    expect(successUrl.indexOf('?')).toBeLessThan(successUrl.indexOf('#'))
  })

  it('normalises SITE_URL: adds the trailing slash and drops any query or hash', () => {
    expect(siteBase('https://example.com/noai-prep')).toBe('https://example.com/noai-prep/')
    expect(siteBase(' https://example.com/noai-prep/?x=1#/home ')).toBe('https://example.com/noai-prep/')
    expect(siteBase('https://example.com')).toBe('https://example.com/')
    expect(siteBase('https://example.com/app/index.html')).toBe('https://example.com/app/index.html')
  })

  it('needs https, except on localhost', () => {
    expect(() => siteBase('http://example.com/')).toThrow()
    expect(() => siteBase('not a url')).toThrow()
    expect(() => siteBase('javascript:alert(1)')).toThrow()
    expect(siteBase('http://localhost:5173/')).toBe('http://localhost:5173/')
  })
})
