// The four Cloud Functions behind accounts on the NOAI Prep website. This file
// only wires the real Firestore, Stripe and secrets into the handlers; the logic
// lives in access.ts, checkout.ts, grant.ts and webhook.ts.

import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { defineInt, defineSecret, defineString } from 'firebase-functions/params'
import { setGlobalOptions } from 'firebase-functions/v2'
import { onCall, onRequest } from 'firebase-functions/v2/https'
import Stripe from 'stripe'
import * as access from './access'
import * as checkout from './checkout'
import type { BaseDeps, StripeLike } from './deps'
import { handleStripeWebhook } from './webhook'

initializeApp()

// Same region as the Firestore database. maxInstances caps cost if something goes wrong.
setGlobalOptions({ region: 'asia-southeast1', maxInstances: 10 })

// Secrets: set with `firebase functions:secrets:set NAME` (see backend/README.md).
const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET')
/** Emails that get full access free, separated by commas or new lines. Never logged. */
const ACCESS_WHITELIST = defineSecret('ACCESS_WHITELIST')

const SITE_URL = defineString('SITE_URL', {
  default: 'https://ainunnajib.github.io/noai-prep/',
  description: 'The public address of the website. Stripe sends people back here after paying.',
})
const PRICE_SGD_CENTS = defineInt('PRICE_SGD_CENTS', {
  default: 1000,
  description: 'The price of full access in Singapore cents (1000 = S$10.00).',
})

let stripeClient: { key: string; client: Stripe } | null = null

function stripe(): StripeLike {
  const key = STRIPE_SECRET_KEY.value()
  // No apiVersion: the SDK's own default version is used.
  if (stripeClient?.key !== key) stripeClient = { key, client: new Stripe(key) }
  return stripeClient.client
}

function base(): BaseDeps {
  return { db: getFirestore(), serverTime: () => FieldValue.serverTimestamp(), log: logger }
}

export const syncAccess = onCall({ secrets: [ACCESS_WHITELIST] }, (request) =>
  access.syncAccess({ ...base(), whitelist: ACCESS_WHITELIST.value() }, request),
)

export const createCheckoutSession = onCall({ secrets: [STRIPE_SECRET_KEY, ACCESS_WHITELIST] }, (request) =>
  checkout.createCheckoutSession(
    {
      ...base(),
      whitelist: ACCESS_WHITELIST.value(),
      stripe: stripe(),
      priceCents: PRICE_SGD_CENTS.value(),
      siteUrl: SITE_URL.value(),
    },
    request,
  ),
)

export const confirmCheckout = onCall({ secrets: [STRIPE_SECRET_KEY] }, (request) =>
  checkout.confirmCheckout({ ...base(), stripe: stripe(), priceCents: PRICE_SGD_CENTS.value() }, request),
)

export const stripeWebhook = onRequest({ secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] }, async (req, res) => {
  const result = await handleStripeWebhook(
    {
      ...base(),
      stripe: stripe(),
      webhookSecret: STRIPE_WEBHOOK_SECRET.value(),
      priceCents: PRICE_SGD_CENTS.value(),
    },
    req,
  )
  if (result.headers) res.set(result.headers)
  res.status(result.status).send(result.body)
})
