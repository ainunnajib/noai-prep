/*
  A model of the deployed system for testing the progress sync engine (lib/accounts/sync.ts) together with the
  progress store (lib/progress.ts) and the account store (lib/accounts/index.ts), as they run in real tabs.
  - Server: progress/{uid} documents as stored fields (progress-doc format), with the rules from backend/firestore.rules
    (owner only; keys; v == 2; rev == stored rev + 1, stored = 0 for a missing doc; text sizes), a monotonic version,
    and a "knowledge" set K (which user operations the stored content is derived from) for the intent oracle.
  - Browser: one localStorage (a Map), one persisted auth user, online/offline. Tabs = pages.
  - Page: a fresh module instance of lib/progress + lib/accounts/{index,sync} (vi.resetModules + doMock), with
    storage bound to its browser, and a Firestore-like client: per-auth-user pending-write queues overlaying the
    listener's view (hasPendingWrites), separate write and watch channels with random latency, fromCache while offline,
    re-send of unacknowledged writes after a reconnect, writes left queued for the previous user after a user change,
    getDoc showing pending writes, the keepalive REST commit (updateMask) racing the SDK writes.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolve } from 'node:path'
import { vi } from 'vitest'
import { exitCommit, fromFields, toFields } from '../../../src/lib/accounts/progress-doc'
import { revFrom } from '../../../src/lib/accounts/adapter'
import type { ProgressState } from '../../../src/lib/progress'

/** src/lib, as an absolute path (each page's modules are mocked by path) */
export const WEB = resolve(__dirname, '../../../src/lib')
/** fault-model switches (env SIM_KNOBS='{"landAfterDisconnect":0}' etc.) */
export const KNOBS: Record<string, any> = { landAfterDisconnect: 0.5, keepalive: true, dedupe: false, noLostAcks: false, fixedLat: 0, ...JSON.parse(process.env.SIM_KNOBS ?? '{}') }
export const PREFIX = 'noai-prep:'

export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Fields = Record<string, unknown>
export interface Ver {
  fields: Fields | null
  version: number
  K: Set<number>
}

const ALLOWED = ['v', 'rev', 'updatedAt', 'lessons', 'checkpoints', 'exams', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7']
const TEXT = ['lessons', 'checkpoints', 'exams', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7']

export function rulesAllow(authUid: string | null, uid: string, prev: Fields | null, next: Fields): string | null {
  if (authUid === null || authUid !== uid) return 'not owner'
  if (!Object.keys(next).every((k) => ALLOWED.includes(k))) return 'keys hasOnly'
  if (!['v', 'rev', 'updatedAt'].every((k) => k in next)) return 'keys hasAll'
  if (next.v !== 2) return 'v'
  const stored = prev === null ? 0 : prev.rev === undefined ? 0 : prev.rev
  if (typeof stored !== 'number') return 'stored rev not int'
  if (!Number.isInteger(next.rev) || next.rev !== stored + 1) return `rev ${String(next.rev)} != ${stored}+1`
  for (const k of TEXT) if (k in next && !(typeof next[k] === 'string' && (next[k] as string).length < 200000)) return 'text'
  return null
}

export class Server {
  docs = new Map<string, Ver>()
  clients = new Set<Client>()
  deletedUsers = new Set<string>()
  constructor(private w: World) {}
  get(uid: string): Ver {
    return this.docs.get(uid) ?? { fields: null, version: 0, K: new Set() }
  }
  private put(uid: string, fields: Fields | null, K: Set<number>) {
    const v: Ver = { fields, version: this.get(uid).version + 1, K }
    this.docs.set(uid, v)
    for (const c of this.clients) c.watchChanged(uid, v)
    return v
  }
  set(authUid: string | null, uid: string, fields: Fields, K: Set<number>, who: string): { ok: boolean; ver?: Ver; why?: string } {
    const prev = this.get(uid)
    const why = rulesAllow(authUid, uid, prev.fields, fields)
    if (why) {
      this.w.log(`  server: ${who} set ${uid} rev ${String(fields.rev)} DENIED (${why}; stored rev ${String(prev.fields?.rev ?? 0)})`)
      return { ok: false, why }
    }
    const ver = this.put(uid, { ...fields, updatedAt: this.w.now() }, K)
    this.w.log(`  server: ${who} set ${uid} rev ${String(fields.rev)} OK v${ver.version} ${this.w.show(ver.fields)}`)
    return { ok: true, ver }
  }
  patch(authUid: string | null, uid: string, body: string, K: Set<number>, who: string) {
    const w = JSON.parse(body).writes[0]
    const prev = this.get(uid)
    const next: Fields = { ...(prev.fields ?? {}) }
    for (const p of w.updateMask.fieldPaths as string[]) {
      const v = w.update.fields[p]
      if (v === undefined) delete next[p]
      else next[p] = 'integerValue' in v ? Number(v.integerValue) : v.stringValue
    }
    next.updatedAt = this.w.now()
    const why = rulesAllow(authUid, uid, prev.fields, next)
    if (why) {
      this.w.log(`  server: ${who} KEEPALIVE ${uid} rev ${String(next.rev)} [${w.updateMask.fieldPaths.join(',')}] DENIED (${why})`)
      return
    }
    const ver = this.put(uid, next, new Set([...K, ...prev.K]))
    this.w.log(`  server: ${who} KEEPALIVE ${uid} rev ${String(next.rev)} [${w.updateMask.fieldPaths.join(',')}] OK v${ver.version} ${this.w.show(ver.fields)}`)
  }
  del(authUid: string | null, uid: string, K: Set<number>, who: string): { ok: boolean; ver?: Ver } {
    if (authUid === null || authUid !== uid) {
      this.w.log(`  server: ${who} delete ${uid} DENIED`)
      return { ok: false }
    }
    const ver = this.put(uid, null, K)
    this.w.log(`  server: ${who} delete ${uid} OK v${ver.version}`)
    return { ok: true, ver }
  }
}

interface Mut {
  id: number
  kind: 'set' | 'delete'
  doc: string
  fields?: Fields
  K: Set<number>
  user: string | null
  state: 'queued' | 'sent' | 'done'
  resolve: () => void
  reject: (e: unknown) => void
  conn: number
  result?: { ok: boolean; ver?: Ver }
}

/** One page's Firestore instance. */
export class Client {
  serverView = new Map<string, Ver>()
  queues = new Map<string | null, Mut[]>()
  listener: { uid: string; cb: (s: unknown) => void; onError: (e: unknown) => void; synced: boolean; last: string | null } | null = null
  conn = 0
  lastWatchAt = 0
  lastWriteRespAt = 0
  lastArriveAt = 0
  constructor(
    private w: World,
    private page: Page,
  ) {
    w.server.clients.add(this)
  }
  get online() {
    return this.page.browser.online && this.page.alive
  }
  get user() {
    return this.page.authUser
  }
  /** a write the server may have applied whose answer hasn't arrived */
  get awaitingAck() {
    for (const q of this.queues.values()) for (const m of q) if (m.state === 'sent' || (m.result && m.state !== 'done')) return true
    return false
  }
  private q(user: string | null) {
    let q = this.queues.get(user)
    if (!q) this.queues.set(user, (q = []))
    return q
  }
  /** connection lost (offline, page closed, credentials changed): requests on the wire land or not; answers are lost */
  dropConnection() {
    this.conn++
    for (const q of this.queues.values())
      for (const m of q)
        if (m.state === 'sent') {
          m.state = 'queued' // to be sent again (Firestore re-sends unacknowledged writes)
        }
    if (this.listener) {
      this.listener.synced = false
      this.emit()
    }
  }
  reconnect() {
    if (!this.online) return
    this.conn++
    this.pump()
    if (this.listener) this.resync()
  }
  private resync() {
    const l = this.listener!
    const myConn = this.conn
    this.w.after(this.w.lat(), () => {
      if (myConn !== this.conn || this.listener !== l || !this.online) return
      const cur = this.w.server.get(l.uid)
      this.take(l.uid, cur)
      l.synced = true
      this.emit()
    })
  }
  private take(uid: string, v: Ver) {
    const have = this.serverView.get(uid)
    if (!have || v.version > have.version) this.serverView.set(uid, v)
  }
  pump() {
    if (!this.online) return
    const q = this.q(this.user)
    for (const m of q) {
      if (m.state !== 'queued') continue
      m.state = 'sent'
      m.conn = this.conn
      const myConn = this.conn
      const arrive = Math.max(this.w.now() + this.w.lat(), this.lastArriveAt)
      this.lastArriveAt = arrive
      const authUid = m.user
      this.w.at(arrive, () => {
        // request reached the server unless the connection broke first (then it may or may not have)
        if (myConn !== this.conn && this.w.rnd() >= KNOBS.landAfterDisconnect) return
        if (m.state === 'done') return
        const who = `${this.page.name}#m${m.id}`
        // dedupe knob: a re-sent write the server already applied gets its first answer again (no re-evaluation)
        if (KNOBS.noLostAcks && m.result) return // (already answered once; that answer is delivered regardless)
        const res = KNOBS.dedupe && m.result ? m.result : m.kind === 'set' ? this.w.server.set(authUid, m.doc, m.fields!, m.K, who) : this.w.server.del(authUid, m.doc, m.K, who)
        m.result = res
        const back = Math.max(this.w.now() + this.w.lat(), this.lastWriteRespAt)
        this.lastWriteRespAt = back
        this.w.at(back, () => {
          if ((myConn !== this.conn && !KNOBS.noLostAcks) || !this.page.alive || m.state === 'done') return // answer lost; re-sent later
          m.state = 'done'
          const qq = this.q(m.user)
          qq.splice(qq.indexOf(m), 1)
          if (res.ok) {
            this.take(m.doc, res.ver!)
            this.w.log(`  ${this.page.name}: ack m${m.id}`)
            this.settle(() => m.resolve())
          } else {
            this.w.log(`  ${this.page.name}: rejected m${m.id}`)
            this.settle(() => m.reject(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' })))
          }
        })
      })
    }
  }
  /** settles a write's promise and raises the listener's new view, in either order */
  private settle(fn: () => void) {
    if (this.w.rnd() < 0.5) {
      fn()
      this.emit()
    } else {
      this.emit()
      fn()
    }
  }
  watchChanged(uid: string, v: Ver) {
    const l = this.listener
    if (!l || l.uid !== uid || !this.online || !l.synced) return
    const myConn = this.conn
    const at = Math.max(this.w.now() + this.w.lat(), this.lastWatchAt)
    this.lastWatchAt = at
    this.w.at(at, () => {
      if (myConn !== this.conn || this.listener !== l || !this.online) return
      this.take(uid, this.w.rnd() < 0.3 ? this.w.server.get(uid) : v) // watch may skip to the latest version
      this.emit()
    })
  }
  emit() {
    const l = this.listener
    if (!l || !this.page.alive) return
    const base = this.serverView.get(l.uid)
    const pend = this.q(this.user).filter((m) => m.doc === l.uid && m.state !== 'done')
    const fromCache = !this.online || !l.synced
    if (!base && pend.length === 0 && !fromCache) return
    let fields: Fields | null = base?.fields ?? null
    for (const m of pend) fields = m.kind === 'set' ? m.fields! : null
    const f = fields
    const snap = {
      data: f ? fromFields((k) => (Object.hasOwn(f, k) ? f[k] : undefined)) : null,
      rev: f ? revFrom(f.rev) : 0,
      hasPendingWrites: pend.length > 0,
      fromCache,
    }
    const key = JSON.stringify([snap, base?.version ?? -1, pend.map((m) => m.id)])
    if (key === l.last) return
    l.last = key
    const K = base?.K
    this.w.after(0, () => {
      if (this.listener !== l || !this.page.alive) return
      if (!snap.hasPendingWrites && !snap.fromCache && K) for (const x of K) this.page.K.add(x)
      this.w.log(`  ${this.page.name}: snapshot rev ${snap.rev}${snap.hasPendingWrites ? ' pending' : ''}${snap.fromCache ? ' cache' : ''} ${this.w.showState(snap.data)}`)
      l.cb(snap)
    })
  }
  // ---- adapter surface ----
  readProgress(uid: string): Promise<{ data: unknown; rev: number }> {
    return new Promise((resolve, reject) => {
      if (!this.online) {
        this.w.after(5, () => reject(Object.assign(new Error('offline'), { code: 'unavailable' })))
        return
      }
      const myConn = this.conn
      this.w.after(this.w.lat() + this.w.lat(), () => {
        if (!this.page.alive) return
        if (myConn !== this.conn || !this.online) return reject(Object.assign(new Error('offline'), { code: 'unavailable' }))
        if (this.user !== uid) return reject(Object.assign(new Error('denied'), { code: 'permission-denied' }))
        const cur = this.w.server.get(uid)
        this.take(uid, cur)
        let fields = this.serverView.get(uid)!.fields
        for (const m of this.q(this.user)) if (m.doc === uid && m.state !== 'done') fields = m.kind === 'set' ? m.fields! : null
        for (const x of cur.K) this.page.K.add(x)
        const f = fields
        this.w.log(`  ${this.page.name}: getDoc -> rev ${f ? revFrom(f.rev) : 0} ${this.w.show(f)}`)
        resolve({ data: f ? fromFields((k) => (Object.hasOwn(f, k) ? f[k] : undefined)) : null, rev: f ? revFrom(f.rev) : 0 })
      })
    })
  }
  watchProgress(uid: string, cb: (s: unknown) => void, onError: (e: unknown) => void) {
    const l = { uid, cb, onError, synced: false, last: null as string | null }
    this.listener = l
    if (this.online) this.resync()
    else this.w.after(20, () => this.emit())
    return () => {
      if (this.listener === l) this.listener = null
    }
  }
  private enqueue(kind: 'set' | 'delete', doc: string, fields?: Fields): Promise<void> {
    if (!this.page.alive) return new Promise(() => {})
    return new Promise((resolve, reject) => {
      const m: Mut = { id: this.w.nextMut++, kind, doc, fields, K: new Set(this.page.K), user: this.user, state: 'queued', resolve, reject, conn: -1 }
      this.w.log(`  ${this.page.name}: queue m${m.id} ${kind} ${doc}${fields ? ` rev ${String(fields.rev)} ${this.w.show(fields)}` : ''} (as ${this.user})`)
      this.q(this.user).push(m)
      this.emit()
      this.pump()
    })
  }
  writeProgress(uid: string, state: ProgressState, rev: number) {
    return this.enqueue('set', uid, { ...toFields(state), v: 2, rev, updatedAt: 'pending' })
  }
  deleteProgress(uid: string) {
    return this.enqueue('delete', uid)
  }
  /** A transaction: needs the server (fails offline), reads the revision and writes the empty copy at the next one. */
  clearProgress(uid: string): Promise<number> {
    const unavailable = () => Object.assign(new Error('offline'), { code: 'unavailable' })
    return new Promise((resolve, reject) => {
      if (!this.page.alive) return
      if (!this.online) {
        this.w.after(5, () => reject(unavailable()))
        return
      }
      const myConn = this.conn
      this.w.after(this.w.lat(), () => {
        if (!this.page.alive) return
        if (myConn !== this.conn || !this.online) return reject(unavailable())
        const cur = this.w.server.get(uid)
        if (!cur.fields) return this.w.after(this.w.lat(), () => this.page.alive && resolve(0)) // nothing to clear
        const rev = revFrom(cur.fields.rev) + 1
        const empty: ProgressState = { lessons: {}, checkpoints: {}, answers: {}, exams: [] }
        const res = this.w.server.set(this.user, uid, { ...toFields(empty), v: 2, rev, updatedAt: 'pending' }, new Set(this.page.K), `${this.page.name}#clear`)
        if (!res.ok) return reject(Object.assign(new Error('denied'), { code: 'permission-denied' }))
        if (this.page.deleteOp) this.page.deleteOp.landed = true // (it happened, even if the page closes before hearing back)
        // (the answer is modelled as always arriving: a commit whose answer is lost would be reported as failed)
        this.w.after(this.w.lat(), () => {
          if (!this.page.alive) return
          this.take(uid, res.ver!)
          resolve(rev)
        })
      })
    })
  }
  writeProgressOnExit(uid: string, state: ProgressState, rev: number, base: ProgressState): ProgressState | null {
    if (!this.page.alive || this.user !== uid) return null
    if (!KNOBS.keepalive) return null
    const exit = exitCommit(`projects/p/databases/(default)/documents/progress/${uid}`, state, rev, base)
    if (exit === null) return null
    const K = new Set(this.page.K)
    this.w.log(`  ${this.page.name}: keepalive rev ${rev} ${this.w.showState(exit.saved)}`)
    if (!this.page.browser.online) return exit.saved
    this.w.after(this.w.lat(), () => this.w.server.patch(uid, uid, exit.body, K, this.page.name))
    return exit.saved
  }
}

let currentPage: Page | null = null
let patched = false
function patchGlobals() {
  if (patched) return
  patched = true
  const route = (target: EventTarget) => {
    const add = target.addEventListener.bind(target)
    const remove = target.removeEventListener.bind(target)
    target.addEventListener = ((type: string, fn: EventListenerOrEventListenerObject, o?: unknown) => {
      if (['storage', 'pagehide', 'visibilitychange'].includes(type) && currentPage) currentPage.listeners.push({ type, fn: fn as (e: unknown) => void })
      else add(type, fn, o as AddEventListenerOptions)
    }) as typeof target.addEventListener
    target.removeEventListener = ((type: string, fn: EventListenerOrEventListenerObject, o?: unknown) => {
      for (const p of allPages) p.listeners = p.listeners.filter((l) => !(l.type === type && l.fn === fn))
      remove(type, fn, o as EventListenerOptions)
    }) as typeof target.removeEventListener
  }
  route(window)
  route(document)
}
const allPages: Page[] = []

export class Browser {
  ls = new Map<string, string>()
  lsK = new Set<number>()
  user: string | null = null
  online = true
  pages: Page[] = []
  constructor(
    public id: number,
    public w: World,
  ) {}
}

export class Page {
  alive = true
  /** the "Delete my saved progress" operation this page is carrying out, for the test's oracle */
  deleteOp: { landed?: boolean } | null = null
  K = new Set<number>()
  listeners: { type: string; fn: (e: unknown) => void }[] = []
  client: Client
  authUser: string | null
  userCbs = new Set<(u: unknown) => void>()
  lastUserSent: string | null | undefined = undefined
  progress: any
  account: any
  sync: any
  adapterLoaded = false
  name: string
  constructor(
    public w: World,
    public browser: Browser,
    public n: number,
  ) {
    this.name = `B${browser.id}.p${n}`
    this.authUser = browser.user
    this.client = new Client(w, this)
    allPages.push(this)
  }
  storage() {
    const page = this
    const b = this.browser
    const fire = (k: string) => {
      for (const q of b.pages) {
        if (q === page || !q.alive) continue
        this.w.after(1 + Math.floor(this.w.rnd() * 30), () => {
          if (!q.alive) return
          for (const l of q.listeners.filter((x) => x.type === 'storage')) {
            const before = q.progress?.progress.get()
            l.fn({ key: PREFIX + k })
            if (q.progress && q.progress.progress.get() !== before) {
              q.K = new Set(b.lsK)
              this.w.log(`  ${q.name}: took other tab's copy ${this.w.showState(q.progress.progress.get())}`)
            }
          }
        })
      }
    }
    return {
      PREFIX,
      readJSON<T>(key: string, fallback: T): T {
        const raw = b.ls.get(key)
        return raw == null ? fallback : (JSON.parse(raw) as T)
      },
      readRaw(key: string): string | null {
        return b.ls.get(key) ?? null
      },
      writeJSON(key: string, value: unknown) {
        if (!page.alive) return
        b.ls.set(key, JSON.stringify(value))
        if (key === 'progress-v1') b.lsK = new Set(page.K)
        fire(key)
      },
      removeKey(key: string) {
        if (!page.alive) return
        b.ls.delete(key)
        if (key === 'progress-v1') b.lsK = new Set()
        fire(key)
      },
    }
  }
  adapter() {
    const page = this
    const w = this.w
    const c = this.client
    const hang = () => new Promise<never>(() => {})
    const delay = (ms: number) => new Promise<void>((r) => w.after(ms, r))
    return {
      onUser(cb: (u: unknown) => void) {
        page.userCbs.add(cb)
        w.after(5, () => page.deliverUser())
        return () => page.userCbs.delete(cb)
      },
      async signIn(provider: 'google' | 'apple') {
        await delay(20)
        if (!page.alive) return hang()
        w.setBrowserUser(page.browser, w.uidFor(provider), page)
      },
      async signOut() {
        await delay(5)
        if (!page.alive) return hang()
        w.setBrowserUser(page.browser, null, page)
      },
      async reauthenticateIfNeeded() {},
      async deleteUser() {
        if (!page.alive) return hang()
        if (!page.browser.online) throw Object.assign(new Error('net'), { code: 'auth/network-request-failed' })
        const uid = page.authUser
        if (!uid) return
        await delay(w.lat())
        w.server.deletedUsers.add(uid)
        w.log(`  server: user ${uid} DELETED`)
        w.setBrowserUser(page.browser, null, page)
      },
      async confirmUser() {
        if (!page.alive) return hang()
        const uid = page.authUser
        if (!uid) return
        if (!page.browser.online) throw Object.assign(new Error('net'), { code: 'auth/network-request-failed' })
        await delay(w.lat())
        if (w.server.deletedUsers.has(uid)) {
          w.log(`  ${page.name}: confirmUser -> user gone, signing out`)
          w.setBrowserUser(page.browser, null, page)
          throw Object.assign(new Error('gone'), { code: 'auth/user-not-found' })
        }
      },
      watchAccess(_uid: string, cb: (a: string) => void) {
        const t = w.after(10, () => page.alive && cb('paid'))
        return () => void t
      },
      async syncAccess() {
        await delay(10)
        return 'paid'
      },
      async createCheckoutSession() {
        return { alreadyUnlocked: true }
      },
      async confirmCheckout() {
        return { access: 'paid' }
      },
      readProgress: (uid: string) => c.readProgress(uid),
      watchProgress: (uid: string, cb: (s: unknown) => void, onError: (e: unknown) => void) => c.watchProgress(uid, cb, onError),
      writeProgress: (uid: string, s: ProgressState, rev: number) => c.writeProgress(uid, s, rev),
      writeProgressOnExit: (uid: string, s: ProgressState, rev: number, base: ProgressState) => c.writeProgressOnExit(uid, s, rev, base),
      clearProgress: (uid: string) => c.clearProgress(uid),
      deleteProgress: (uid: string) => c.deleteProgress(uid),
    }
  }
  /** this tab's Firebase Auth reports the browser's user (deduplicated) */
  deliverUser() {
    if (!this.alive) return
    const u = this.browser.user
    if (u !== this.authUser) {
      this.authUser = u
      this.client.dropConnection()
      this.client.reconnect()
    }
    if (this.lastUserSent === u) return
    this.lastUserSent = u
    this.w.log(`  ${this.name}: onUser(${u})`)
    const user = u === null ? null : { uid: u, email: `${u}@example.com`, name: u, photoURL: null, provider: u.startsWith('g') ? 'google' : 'apple' }
    for (const cb of [...this.userCbs]) cb(user)
  }
  dispatch(type: string, e: unknown = { type }) {
    for (const l of this.listeners.filter((x) => x.type === type)) l.fn(e)
  }
}

export class World {
  rnd: () => number
  server: Server
  browsers: Browser[] = []
  pages: Page[] = []
  nextMut = 1
  nextPage = 1
  trace: string[] = []
  uids: Record<string, string> = { google: 'g1', apple: 'a1' }
  constructor(
    public seed: number,
    netSeed: number,
    public verbose = false,
  ) {
    this.rnd = rng(netSeed)
    this.server = new Server(this)
    patchGlobals()
  }
  now() {
    return Date.now()
  }
  log(s: string) {
    this.trace.push(`${String(this.now() - T0).padStart(7)} ${s}`)
    if (this.trace.length > 6000) this.trace.splice(0, 1000)
  }
  lat() {
    if (KNOBS.fixedLat) return KNOBS.fixedLat
    const r = this.rnd()
    return 2 + Math.floor(r * r * r * 900)
  }
  after(ms: number, fn: () => void) {
    return setTimeout(fn, ms)
  }
  at(t: number, fn: () => void) {
    return setTimeout(fn, Math.max(0, t - this.now()))
  }
  uidFor(provider: string) {
    let u = this.uids[provider]
    if (this.server.deletedUsers.has(u)) {
      const n = Number(u.slice(1)) + 1
      u = this.uids[provider] = `${u[0]}${n}`
    }
    return u
  }
  setBrowserUser(b: Browser, user: string | null, actor: Page) {
    b.user = user
    this.log(`  B${b.id}: auth user -> ${user}`)
    for (const p of b.pages) this.after(p === actor ? 1 : this.lat(), () => p.deliverUser())
  }
  show(f: Fields | null): string {
    if (!f) return '(none)'
    return this.showState(fromFields((k) => (Object.hasOwn(f, k) ? f[k] : undefined)))
  }
  showState(s: unknown): string {
    if (s == null) return '(none)'
    const x = s as ProgressState
    const L = Object.keys(x.lessons ?? {}).sort()
    const C = Object.keys(x.checkpoints ?? {}).sort()
    const A = Object.keys((x.answers ?? {}) as object).sort()
    const E = Array.isArray(x.exams) ? x.exams.map((e) => (e as { id: string }).id) : []
    const strip = (k: string) => k.replace(/^[ga]\d+\//, '').replace(/^[ga]\d+-/, '')
    return `{${[...L, ...C, ...A, ...E].map(strip).join(' ')}}`
  }
  async newBrowser(user: string | null): Promise<Browser> {
    const b = new Browser(this.browsers.length, this)
    this.browsers.push(b)
    b.user = user
    if (user) b.ls.set('progress-owner', JSON.stringify(user))
    return b
  }
  async openPage(b: Browser): Promise<Page> {
    const page = new Page(this, b, this.nextPage++)
    page.K = new Set(b.lsK)
    b.pages.push(page)
    this.pages.push(page)
    this.log(`${page.name}: OPEN (local ${b.ls.has('progress-v1') ? 'has copy' : 'empty'}, auth ${b.user})`)
    vi.resetModules()
    const storage = page.storage()
    const adapter = page.adapter()
    vi.doMock(`${WEB}/storage.ts`, () => storage)
    vi.doMock(`${WEB}/accounts/config.ts`, () => ({
      ACCOUNTS_MOCK: false,
      ACCOUNTS_ENABLED: true,
      firebaseConfig: { apiKey: 'k', authDomain: 'd', projectId: 'p', appId: 'a' },
      FREE_MODULES: ['start-here'],
      PRICE_LABEL: 'S$10',
      FUNCTIONS_REGION: 'r',
    }))
    vi.doMock(`${WEB}/accounts/firebase-adapter.ts`, () => ({
      createFirebaseAdapter: () => {
        page.adapterLoaded = true
        return adapter
      },
    }))
    vi.doMock(`${WEB}/accounts/sync.ts`, async (importOriginal) => {
      const m = (await importOriginal()) as any
      return {
        ...m,
        createProgressSync: (o: unknown) => (page.sync = m.createProgressSync(o)),
      }
    })
    currentPage = page
    page.account = await import(`${WEB}/accounts/index.ts`)
    page.progress = await import(`${WEB}/progress.ts`)
    currentPage = null
    const prog = page.progress.progress
    const follow = prog.followOtherTabs
    prog.followOtherTabs = (on: boolean) => {
      currentPage = page
      follow(on)
    }
    const clear = prog.clearLocal
    prog.clearLocal = () => {
      this.onClear?.(page)
      page.K = new Set()
      clear()
    }
    page.account.account.init()
    const realWait = () => new Promise((r) => (globalThis as any).__realSetTimeout(r, 0))
    for (let i = 0; i < 2000 && !page.sync; i++) await realWait()
    if (!page.sync) throw new Error('adapter never loaded')
    return page
  }
  onClear?: (p: Page) => void
  closePage(p: Page, how: 'reload' | 'close') {
    this.log(`${p.name}: ${how.toUpperCase()} (pagehide)`)
    p.dispatch('pagehide')
    p.alive = false
    p.client.dropConnection()
    p.browser.pages = p.browser.pages.filter((x) => x !== p)
  }
  setOnline(b: Browser, on: boolean) {
    if (b.online === on) return
    b.online = on
    this.log(`B${b.id}: ${on ? 'ONLINE' : 'OFFLINE'}`)
    for (const p of b.pages) {
      if (on) p.client.reconnect()
      else p.client.dropConnection()
    }
  }
}
export const T0 = Date.UTC(2026, 9, 16, 9, 0, 0)
