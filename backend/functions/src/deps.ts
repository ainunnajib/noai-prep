// The small slices of Firestore, Stripe and the logger that the handlers use.
// index.ts passes the real things; the unit tests pass in-memory fakes.
// (The Admin SDK's Firestore and the Stripe client both fit these shapes as they are.)

import type { CheckoutSessionLike } from './entitlement'

export type DocData = Record<string, unknown>

export interface DocSnapshotLike {
  readonly exists: boolean
  data(): DocData | undefined
}

export interface DocRefLike {
  readonly id: string
  readonly path: string
  get(): Promise<DocSnapshotLike>
  set(data: DocData, options?: { merge?: boolean }): Promise<unknown>
}

export interface QueryLike {
  where(field: string, op: '==', value: unknown): QueryLike
  limit(n: number): QueryLike
  get(): Promise<{ docs: Array<{ id: string; data(): DocData }> }>
}

export interface TransactionLike {
  get(ref: DocRefLike): Promise<DocSnapshotLike>
  set(ref: DocRefLike, data: DocData, options?: { merge?: boolean }): unknown
  delete(ref: DocRefLike): unknown
}

export interface DbLike {
  doc(path: string): DocRefLike
  collection(path: string): QueryLike
  runTransaction<T>(fn: (tx: TransactionLike) => Promise<T>): Promise<T>
}

/** The Stripe Checkout Session parameters we send (a subset of Stripe.Checkout.SessionCreateParams). */
export interface CheckoutCreateParams {
  mode: 'payment'
  line_items: Array<{
    price_data: {
      currency: string
      unit_amount: number
      product_data: { name: string; description: string }
    }
    quantity: number
  }>
  client_reference_id: string
  metadata: Record<string, string>
  payment_intent_data: { metadata: Record<string, string> }
  customer_email?: string
  success_url: string
  cancel_url: string
}

export interface StripeEventLike {
  id: string
  type: string
  data: { object: unknown }
}

export interface StripeLike {
  checkout: {
    sessions: {
      create(params: CheckoutCreateParams): Promise<{ id: string; url: string | null }>
      retrieve(id: string): Promise<CheckoutSessionLike>
    }
  }
  webhooks: {
    constructEvent(payload: Buffer | string, header: string | string[] | Buffer, secret: string): StripeEventLike
  }
}

/** firebase-functions' logger. Don't put a `message` key in `data`: it would replace the log line's own message. */
export interface LoggerLike {
  info(message: string, data?: Record<string, unknown>): void
  warn(message: string, data?: Record<string, unknown>): void
  error(message: string, data?: Record<string, unknown>): void
}

/** What every handler needs. */
export interface BaseDeps {
  db: DbLike
  /** FieldValue.serverTimestamp() in production; something recognisable in tests. */
  serverTime: () => unknown
  log: LoggerLike
}
