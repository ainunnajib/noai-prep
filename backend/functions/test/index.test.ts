// Loads the real entry point (without calling anything) to check the deployed
// shape: four functions, all in asia-southeast1, each with only the secrets it needs.
import { describe, expect, it } from 'vitest'
import * as functions from '../src/index'

type Endpoint = { region?: string[]; secretEnvironmentVariables?: Array<{ key: string }>; callableTrigger?: unknown; httpsTrigger?: unknown }

function endpoint(fn: unknown): Endpoint {
  return (fn as { __endpoint: Endpoint }).__endpoint
}

function secrets(fn: unknown): string[] {
  return (endpoint(fn).secretEnvironmentVariables ?? []).map((s) => s.key).sort()
}

describe('index', () => {
  it('exports exactly the four functions', () => {
    expect(Object.keys(functions).sort()).toEqual(['confirmCheckout', 'createCheckoutSession', 'stripeWebhook', 'syncAccess'])
  })

  it('runs everything in asia-southeast1', () => {
    for (const fn of Object.values(functions)) expect(endpoint(fn).region).toEqual(['asia-southeast1'])
  })

  it('makes the three app functions callable and the webhook a plain HTTPS endpoint', () => {
    expect(endpoint(functions.syncAccess).callableTrigger).toBeDefined()
    expect(endpoint(functions.createCheckoutSession).callableTrigger).toBeDefined()
    expect(endpoint(functions.confirmCheckout).callableTrigger).toBeDefined()
    expect(endpoint(functions.stripeWebhook).httpsTrigger).toBeDefined()
  })

  it('gives each function only the secrets it uses', () => {
    expect(secrets(functions.syncAccess)).toEqual(['ACCESS_WHITELIST'])
    expect(secrets(functions.createCheckoutSession)).toEqual(['ACCESS_WHITELIST', 'STRIPE_SECRET_KEY'])
    expect(secrets(functions.confirmCheckout)).toEqual(['STRIPE_SECRET_KEY'])
    expect(secrets(functions.stripeWebhook)).toEqual(['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'])
  })
})
