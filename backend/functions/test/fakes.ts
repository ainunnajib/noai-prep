// In-memory stand-ins for Firestore, Stripe and the logger, so the handlers can
// be tested without any network or emulator.

import type {
  CheckoutCreateParams,
  DbLike,
  DocData,
  DocRefLike,
  DocSnapshotLike,
  LoggerLike,
  QueryLike,
  StripeEventLike,
  StripeLike,
  TransactionLike,
} from '../src/deps'
import type { ChargeLike, CheckoutSessionLike } from '../src/entitlement'
import type { CallableRequestLike } from '../src/access'

function snapshot(data: DocData | undefined): DocSnapshotLike {
  return { exists: data !== undefined, data: () => (data ? { ...data } : undefined) }
}

export class FakeDb implements DbLike {
  readonly docs = new Map<string, DocData>()
  /** Set to make the next transaction fail, to test error handling. */
  failNextTransaction: Error | null = null

  doc(path: string): DocRefLike {
    return new FakeDocRef(this, path)
  }

  collection(path: string): QueryLike {
    return new FakeQuery(this, path, [], Infinity)
  }

  async runTransaction<T>(fn: (tx: TransactionLike) => Promise<T>): Promise<T> {
    if (this.failNextTransaction) {
      const err = this.failNextTransaction
      this.failNextTransaction = null
      throw err
    }
    const tx = new FakeTransaction(this)
    const result = await fn(tx)
    tx.commit()
    return result
  }

  seed(path: string, data: DocData): void {
    this.docs.set(path, { ...data })
  }

  read(path: string): DocData | undefined {
    const data = this.docs.get(path)
    return data ? { ...data } : undefined
  }

  write(path: string, data: DocData, merge = false): void {
    this.docs.set(path, merge ? { ...this.docs.get(path), ...data } : { ...data })
  }
}

class FakeDocRef implements DocRefLike {
  readonly id: string
  constructor(
    private readonly db: FakeDb,
    readonly path: string,
  ) {
    this.id = path.split('/').pop() ?? ''
  }

  async get(): Promise<DocSnapshotLike> {
    return snapshot(this.db.read(this.path))
  }

  async set(data: DocData, options?: { merge?: boolean }): Promise<void> {
    this.db.write(this.path, data, options?.merge)
  }
}

class FakeTransaction implements TransactionLike {
  private readonly writes: Array<() => void> = []
  constructor(private readonly db: FakeDb) {}

  async get(ref: DocRefLike): Promise<DocSnapshotLike> {
    // Real Firestore transactions refuse reads after writes.
    if (this.writes.length) throw new Error('Firestore transactions require all reads to be executed before all writes')
    return snapshot(this.db.read(ref.path))
  }

  set(ref: DocRefLike, data: DocData, options?: { merge?: boolean }): this {
    this.writes.push(() => this.db.write(ref.path, data, options?.merge))
    return this
  }

  delete(ref: DocRefLike): this {
    this.writes.push(() => this.db.docs.delete(ref.path))
    return this
  }

  commit(): void {
    for (const write of this.writes) write()
  }
}

class FakeQuery implements QueryLike {
  constructor(
    private readonly db: FakeDb,
    private readonly collectionPath: string,
    private readonly filters: Array<[string, unknown]>,
    private readonly max: number,
  ) {}

  where(field: string, _op: '==', value: unknown): QueryLike {
    return new FakeQuery(this.db, this.collectionPath, [...this.filters, [field, value]], this.max)
  }

  limit(n: number): QueryLike {
    return new FakeQuery(this.db, this.collectionPath, this.filters, n)
  }

  async get(): Promise<{ docs: Array<{ id: string; data(): DocData }> }> {
    const docs: Array<{ id: string; data(): DocData }> = []
    for (const [path, data] of this.db.docs) {
      const [collection, id, ...rest] = path.split('/')
      if (collection !== this.collectionPath || rest.length) continue
      if (!this.filters.every(([field, value]) => data[field] === value)) continue
      docs.push({ id, data: () => ({ ...data }) })
    }
    return { docs: docs.slice(0, this.max) }
  }
}

export const WEBHOOK_SECRET = 'whsec_test_secret'
export const GOOD_SIGNATURE = 't=1,v1=good'

export class FakeStripe implements StripeLike {
  readonly created: CheckoutCreateParams[] = []
  readonly retrieved: string[] = []
  readonly sessions = new Map<string, CheckoutSessionLike>()
  createError: Error | null = null
  private counter = 0

  checkout = {
    sessions: {
      create: async (params: CheckoutCreateParams) => {
        this.created.push(params)
        if (this.createError) throw this.createError
        const id = `cs_test_fake${++this.counter}`
        return { id, url: `https://checkout.stripe.com/c/pay/${id}` }
      },
      retrieve: async (id: string) => {
        this.retrieved.push(id)
        const session = this.sessions.get(id)
        if (!session) throw Object.assign(new Error(`No such checkout.session: '${id}'`), { code: 'resource_missing' })
        return session
      },
    },
  }

  webhooks = {
    constructEvent: (payload: Buffer | string, header: string | string[] | Buffer, secret: string): StripeEventLike => {
      if (secret !== WEBHOOK_SECRET || header !== GOOD_SIGNATURE) {
        throw new Error('No signatures found matching the expected signature for payload.')
      }
      return JSON.parse(payload.toString()) as StripeEventLike
    },
  }
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error'
  message: string
  data?: Record<string, unknown>
}

export function fakeLogger(): LoggerLike & { entries: LogEntry[] } {
  const entries: LogEntry[] = []
  return {
    entries,
    info: (message, data) => entries.push({ level: 'info', message, data }),
    warn: (message, data) => entries.push({ level: 'warn', message, data }),
    error: (message, data) => entries.push({ level: 'error', message, data }),
  }
}

/** Server timestamps become "server-time-1", "server-time-2"... so tests can tell writes apart. */
export function fakeServerTime(): () => string {
  let n = 0
  return () => `server-time-${++n}`
}

export const PRICE = 1000
export const SITE = 'https://ainunnajib.github.io/noai-prep/'
export const INVITED = 'invited@example.com'
export const WHITELIST = `  Invited@Example.com ,\n\nfriend@example.com\n`

export function makeDeps() {
  return {
    db: new FakeDb(),
    stripe: new FakeStripe(),
    log: fakeLogger(),
    serverTime: fakeServerTime(),
    whitelist: WHITELIST,
    priceCents: PRICE,
    siteUrl: SITE,
    webhookSecret: WEBHOOK_SECRET,
  }
}

/** A signed-in caller. Pass `null` as the email for an account without one. */
export function signedIn(
  uid: string,
  email: string | null = 'student@example.com',
  emailVerified = true,
  data: unknown = {},
): CallableRequestLike {
  return { auth: { uid, token: { email: email ?? undefined, email_verified: emailVerified } }, data }
}

export function signedOut(data: unknown = {}): CallableRequestLike {
  return { data }
}

export function session(overrides: Partial<CheckoutSessionLike> = {}): CheckoutSessionLike {
  return {
    id: 'cs_test_a1b2c3',
    mode: 'payment',
    payment_status: 'paid',
    currency: 'sgd',
    amount_total: PRICE,
    client_reference_id: 'user-1',
    metadata: { uid: 'user-1' },
    payment_intent: 'pi_111',
    customer_email: 'student@example.com',
    customer_details: { email: 'student@example.com' },
    ...overrides,
  }
}

export function charge(overrides: Partial<ChargeLike> = {}): ChargeLike {
  return {
    id: 'ch_111',
    refunded: true,
    payment_intent: 'pi_111',
    metadata: { uid: 'user-1' },
    ...overrides,
  }
}
