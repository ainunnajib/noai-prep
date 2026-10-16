/*
  A model of the deployed system for testing the progress sync engine (lib/accounts/sync.ts) together with the
  progress store (lib/progress.ts) and the account store (lib/accounts/index.ts), as they run in real tabs.
  - Server: progress/{uid} documents as stored fields (progress-doc format 3), with the rules from
    backend/firestore.rules (owner only; exactly the allowed keys; v == 3; resetAt an int; rev == stored rev + 1,
    stored = 0 for a missing doc; text sizes), and a version number per document.
  - Browser: one localStorage (a Map), one persisted auth user, online/offline. Tabs = pages. With KNOBS.tabCache, each
    tab reads its own copy of localStorage, as Chromium's tabs do: its writes reach the browser a moment later, other
    tabs' changes reach it (in order) up to that many ms later, and one that arrives while a write of its own to that
    key is on its way is ignored there. Tabs other than the one acting hear auth changes `authLag` ms late with
    KNOBS.authLag (a background tab whose timers the browser throttles).
  - Page: a fresh module instance of lib/progress + lib/accounts/{index,sync} (vi.resetModules + doMock), with
    storage bound to its browser, and a Firestore-like client: per-auth-user pending-write queues overlaying the
    listener's view (hasPendingWrites), separate write and watch channels with random latency, fromCache while offline,
    re-send of unacknowledged writes after a reconnect (so a write can land twice: the second is refused), writes left
    queued for the previous user after a user change, reads from the server showing pending writes, deliveries that
    occasionally arrive out of order, and the keepalive REST commit (updateMask) racing the SDK writes.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolve } from 'node:path'
import { vi } from 'vitest'
import { exitCommit, fromDoc, toDoc } from '../../../src/lib/accounts/progress-doc'
import { project, type SyncState } from '../../../src/lib/progress-crdt'

/** src/lib, as an absolute path (each page's modules are mocked by path) */
export const WEB = resolve(__dirname, '../../../src/lib')
/** fault-model switches (env SIM_KNOBS='{"landAfterDisconnect":0}' etc.) */
export const KNOBS: Record<string, any> = {
  landAfterDisconnect: 0.5,
  keepalive: true,
  reorder: 0.1,
  fixedLat: 0,
  tabCache: 0,
  authLag: 0,
  ...JSON.parse(process.env.SIM_KNOBS ?? '{}'),
}
export const PREFIX = 'noai-prep:'

/** whose progress a stored progress-v1 copy is (null: a visitor's, or not progress) */
function ownerOf(raw: string): string | null {
  try {
    const o = JSON.parse(raw).owner
    return typeof o === 'string' ? o : null
  } catch {
    return null
  }
}
export const T0 = Date.UTC(2026, 9, 16, 9, 0, 0)

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
  /** when this document (this time round) was created */
  createdAt: number
  /** for a document a page created: when it last confirmed the account still existed, and when it sent the save */
  confirmedAt?: number
  sentAt?: number
}

const TEXT = ['lessons', 'checkpoints', 'exams', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7']
const KEYS = ['v', 'rev', 'resetAt', 'updatedAt', ...TEXT]

/** backend/firestore.rules for progress/{uid}: the reason a write is refused, or null */
export function rulesAllow(authUid: string | null, uid: string, prev: Fields | null, next: Fields): string | null {
  if (authUid === null || authUid !== uid) return 'not owner'
  if (!Object.keys(next).every((k) => KEYS.includes(k)) || !KEYS.every((k) => k in next)) return 'keys'
  if (next.v !== 3) return 'v'
  if (!Number.isInteger(next.resetAt) || (next.resetAt as number) < 0) return 'resetAt'
  const stored = prev === null ? 0 : prev.rev === undefined ? 0 : prev.rev
  if (typeof stored !== 'number') return 'stored rev not int'
  if (!Number.isInteger(next.rev) || next.rev !== stored + 1) return `rev ${String(next.rev)} != ${stored}+1`
  for (const k of TEXT) if (!(typeof next[k] === 'string' && (next[k] as string).length <= 200000)) return 'text'
  return null
}

const read = (f: Fields) => fromDoc((k) => (Object.hasOwn(f, k) ? f[k] : undefined))

export class Server {
  docs = new Map<string, Ver>()
  clients = new Set<Client>()
  deletedUsers = new Set<string>()
  /** when each deleted user was deleted */
  deletedAt = new Map<string, number>()
  constructor(private w: World) {}
  get(uid: string): Ver {
    return this.docs.get(uid) ?? { fields: null, version: 0, createdAt: 0 }
  }
  /** the stored state (null: no document) */
  state(uid: string): SyncState | null {
    const f = this.get(uid).fields
    return f ? read(f).state : null
  }
  private put(uid: string, fields: Fields | null, who = '', sentAt?: number) {
    const prev = this.get(uid)
    const creating = fields !== null && prev.fields === null
    const v: Ver = {
      fields,
      version: prev.version + 1,
      createdAt: fields === null ? 0 : creating ? this.w.now() : prev.createdAt,
      confirmedAt: creating ? this.w.pages.find((p) => who.startsWith(`${p.name}#`))?.confirmedAt : prev.confirmedAt,
      sentAt: creating ? sentAt : prev.sentAt,
    }
    this.docs.set(uid, v)
    for (const c of this.clients) c.watchChanged(uid, v)
    return v
  }
  set(authUid: string | null, uid: string, fields: Fields, who: string, sentAt?: number): { ok: boolean; ver?: Ver } {
    const prev = this.get(uid)
    const why = rulesAllow(authUid, uid, prev.fields, { ...fields, updatedAt: 'now' })
    if (why) {
      this.w.log(`  server: ${who} set ${uid} rev ${String(fields.rev)} DENIED (${why}; stored rev ${String(prev.fields?.rev ?? 0)})`)
      return { ok: false }
    }
    const ver = this.put(uid, { ...fields, updatedAt: this.w.now() }, who, sentAt)
    this.w.log(`  server: ${who} set ${uid} rev ${String(fields.rev)} OK v${ver.version} ${this.w.show(ver.fields)}`)
    return { ok: true, ver }
  }
  patch(authUid: string | null, uid: string, body: string, who: string) {
    const w = JSON.parse(body).writes[0]
    const prev = this.get(uid)
    const next: Fields = { ...(prev.fields ?? {}) }
    for (const p of w.updateMask.fieldPaths as string[]) {
      const v = w.update.fields[p]
      next[p] = 'integerValue' in v ? Number(v.integerValue) : v.stringValue
    }
    next.updatedAt = this.w.now()
    const why = rulesAllow(authUid, uid, prev.fields, next)
    const mask = w.updateMask.fieldPaths.join(',')
    if (why) return void this.w.log(`  server: ${who} KEEPALIVE ${uid} rev ${String(next.rev)} [${mask}] DENIED (${why})`)
    const ver = this.put(uid, next)
    this.w.log(`  server: ${who} KEEPALIVE ${uid} rev ${String(next.rev)} [${mask}] OK v${ver.version} ${this.w.show(ver.fields)}`)
  }
  del(authUid: string | null, uid: string, who: string): { ok: boolean; ver?: Ver } {
    if (authUid === null || authUid !== uid) {
      this.w.log(`  server: ${who} delete ${uid} DENIED`)
      return { ok: false }
    }
    const ver = this.put(uid, null)
    this.w.log(`  server: ${who} delete ${uid} OK v${ver.version}`)
    return { ok: true, ver }
  }
}

interface Mut {
  id: number
  kind: 'set' | 'delete'
  doc: string
  fields?: Fields
  user: string | null
  state: 'queued' | 'sent' | 'done'
  resolve: () => void
  reject: (e: unknown) => void
  result?: { ok: boolean; ver?: Ver }
  queuedAt: number
}

const unavailable = () => Object.assign(new Error('offline'), { code: 'unavailable' })
const denied = () => Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' })

/** One page's Firestore instance. */
export class Client {
  serverView = new Map<string, Ver>()
  queues = new Map<string | null, Mut[]>()
  listener: { uid: string; cb: (s: unknown) => void; synced: boolean; last: string | null } | null = null
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
  private q(user: string | null) {
    let q = this.queues.get(user)
    if (!q) this.queues.set(user, (q = []))
    return q
  }
  /** connection lost (offline, page closed, credentials changed): requests on the wire land or not; answers are lost */
  dropConnection() {
    this.conn++
    for (const q of this.queues.values()) for (const m of q) if (m.state === 'sent') m.state = 'queued' // sent again later
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
      this.take(l.uid, this.w.server.get(l.uid))
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
    for (const m of this.q(this.user)) {
      if (m.state !== 'queued') continue
      m.state = 'sent'
      const myConn = this.conn
      const arrive = Math.max(this.w.now() + this.w.lat(), this.lastArriveAt)
      this.lastArriveAt = arrive
      this.w.at(arrive, () => {
        // the request reached the server, unless the connection broke first (then it may or may not have)
        if (myConn !== this.conn && this.w.rnd() >= KNOBS.landAfterDisconnect) return
        if (m.state === 'done') return
        const who = `${this.page.name}#m${m.id}`
        const res = m.kind === 'set' ? this.w.server.set(m.user, m.doc, m.fields!, who, m.queuedAt) : this.w.server.del(m.user, m.doc, who)
        m.result = res
        const back = Math.max(this.w.now() + this.w.lat(), this.lastWriteRespAt)
        this.lastWriteRespAt = back
        this.w.at(back, () => {
          if (myConn !== this.conn || !this.page.alive || m.state === 'done') return // answer lost; sent again later
          m.state = 'done'
          const qq = this.q(m.user)
          qq.splice(qq.indexOf(m), 1)
          if (res.ok) {
            this.take(m.doc, res.ver!)
            this.w.log(`  ${this.page.name}: ack m${m.id}`)
            this.settle(() => m.resolve())
          } else {
            this.w.log(`  ${this.page.name}: rejected m${m.id}`)
            this.settle(() => m.reject(denied()))
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
    // in order (watch may skip to the latest version)
    const at = Math.max(this.w.now() + this.w.lat(), this.lastWatchAt)
    this.lastWatchAt = at
    this.w.at(at, () => {
      if (myConn !== this.conn || this.listener !== l || !this.online) return
      this.take(uid, this.w.rnd() < 0.3 ? this.w.server.get(uid) : v)
      this.emit()
    })
    // now and then also delivered again, late: after newer versions
    if (this.w.rnd() < KNOBS.reorder) {
      this.w.after(this.w.lat() + this.w.lat() + this.w.lat(), () => {
        if (myConn !== this.conn || this.listener !== l || !this.online || !this.page.alive) return
        if (this.q(this.user).some((m) => m.doc === uid && m.state !== 'done')) return // (shown with this tab's own pending writes)
        const snap = { ...(v.fields ? read(v.fields) : { state: null, rev: 0 }), hasPendingWrites: false, fromCache: false }
        this.w.log(`  ${this.page.name}: snapshot (late, v${v.version}) rev ${snap.rev} ${this.w.showState(snap.state)}`)
        l.cb(snap)
      })
    }
  }
  /** the listener's view: the server copy it holds with this user's pending writes on top */
  private view(uid: string) {
    let fields = this.serverView.get(uid)?.fields ?? null
    const pend = this.q(this.user).filter((m) => m.doc === uid && m.state !== 'done')
    for (const m of pend) fields = m.kind === 'set' ? m.fields! : null
    const f = fields
    return { remote: f ? read(f) : { state: null, rev: 0 }, pending: pend.length > 0, ids: pend.map((m) => m.id) }
  }
  emit() {
    const l = this.listener
    if (!l || !this.page.alive) return
    const base = this.serverView.get(l.uid)
    const { remote, pending, ids } = this.view(l.uid)
    const fromCache = !this.online || !l.synced
    if (!base && !pending && !fromCache) return
    const snap = { ...remote, hasPendingWrites: pending, fromCache }
    const key = JSON.stringify([fromCache, base?.version ?? -1, ids])
    if (key === l.last) return
    l.last = key
    this.w.after(0, () => {
      if (this.listener !== l || !this.page.alive) return
      this.w.log(`  ${this.page.name}: snapshot rev ${snap.rev}${pending ? ' pending' : ''}${fromCache ? ' cache' : ''} ${this.w.showState(snap.state)}`)
      l.cb(snap)
    })
  }
  // ---- adapter surface ----
  readProgress(uid: string): Promise<{ state: SyncState | null; rev: number; hasPendingWrites: boolean }> {
    return new Promise((resolve, reject) => {
      if (!this.online) return void this.w.after(5, () => reject(unavailable()))
      const myConn = this.conn
      this.w.after(this.w.lat() + this.w.lat(), () => {
        if (!this.page.alive) return
        if (myConn !== this.conn || !this.online) return reject(unavailable())
        if (this.user !== uid) return reject(denied())
        this.take(uid, this.w.server.get(uid))
        const { remote, pending } = this.view(uid)
        this.w.log(`  ${this.page.name}: read -> rev ${remote.rev}${pending ? ' pending' : ''} ${this.w.showState(remote.state)}`)
        resolve({ ...remote, hasPendingWrites: pending })
      })
    })
  }
  watchProgress(uid: string, cb: (s: unknown) => void) {
    const l = { uid, cb, synced: false, last: null as string | null }
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
      const m: Mut = { id: this.w.nextMut++, kind, doc, fields, user: this.user, state: 'queued', resolve, reject, queuedAt: this.w.now() }
      this.w.log(`  ${this.page.name}: queue m${m.id} ${kind} ${doc}${fields ? ` rev ${String(fields.rev)} ${this.w.show(fields)}` : ''} (as ${this.user})`)
      this.q(this.user).push(m)
      this.emit()
      this.pump()
    })
  }
  writeProgress(uid: string, state: SyncState, rev: number) {
    return this.enqueue('set', uid, { ...toDoc(state, rev), updatedAt: 'pending' })
  }
  deleteProgress(uid: string) {
    return this.enqueue('delete', uid)
  }
  writeProgressOnExit(uid: string, state: SyncState, rev: number, base: SyncState): boolean {
    if (!this.page.alive || this.user !== uid || !KNOBS.keepalive) return false
    const exit = exitCommit(`projects/p/databases/(default)/documents/progress/${uid}`, state, rev, base)
    if (exit === null) return false
    this.w.log(`  ${this.page.name}: keepalive rev ${rev} [${exit.sent.join(',')}] ${this.w.showState(state)}`)
    if (this.page.browser.online) this.w.after(this.w.lat(), () => this.w.server.patch(uid, uid, exit.body, this.page.name))
    return true
  }
}

let currentPage: Page | null = null
let patched = false
const allPages: Page[] = []
/** Routes the storage/pagehide/visibilitychange listeners each page adds to that page alone. */
function patchGlobals() {
  if (patched) return
  patched = true
  const route = (target: EventTarget) => {
    const add = target.addEventListener.bind(target)
    const remove = target.removeEventListener.bind(target)
    target.addEventListener = ((type: string, fn: EventListenerOrEventListenerObject, o?: unknown) => {
      const page = currentPage ?? allPages.find((p) => p.adding)
      if (['storage', 'pagehide', 'visibilitychange', 'online'].includes(type) && page) page.listeners.push({ type, fn: fn as (e: unknown) => void })
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

export class Browser {
  ls = new Map<string, string>()
  /** (KNOBS.tabCache) when the browser last applied a tab's write: writes are applied in order */
  lsAt = 0
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
  /** set while this page's code may add window listeners (sync starting) */
  adding = false
  listeners: { type: string; fn: (e: unknown) => void }[] = []
  /** when this page last confirmed its user still exists */
  confirmedAt?: number
  /** (KNOBS.tabCache) this tab's own copy of localStorage, its writes on their way per key, and when the last change reaches it */
  cache: Map<string, string> | null = null
  outgoing = new Map<string, number>()
  lsInAt = 0
  client: Client
  authUser: string | null
  userCbs = new Set<(u: unknown) => void>()
  lastUserSent: string | null | undefined = undefined
  progress: any
  account: any
  sync: any
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
    if (KNOBS.tabCache > 0) return this.cachedStorage()
    const page = this
    const b = this.browser
    const fire = (k: string) => {
      for (const q of b.pages) {
        if (q === page || !q.alive) continue
        this.w.after(1 + Math.floor(this.w.rnd() * 30), () => {
          if (q.alive) for (const l of q.listeners.filter((x) => x.type === 'storage')) l.fn({ key: PREFIX + k })
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
        fire(key)
      },
      removeKey(key: string) {
        if (!page.alive) return
        if (key === 'progress-v1' && b.ls.has(key)) page.w.onWipe?.(b, b.ls.get(key)!, page, page.sessionUid())
        b.ls.delete(key)
        fire(key)
      },
    }
  }
  /** Chromium-like localStorage (KNOBS.tabCache): see the header. */
  private cachedStorage() {
    const page = this
    const b = this.browser
    const w = this.w
    const cache = (this.cache = new Map(b.ls))
    const lat = () => 1 + Math.floor(w.rnd() * KNOBS.tabCache)
    /** runs fn when a change the browser applied now reaches tab q (in the order applied) */
    const reach = (q: Page, fn: () => void) => {
      const at = Math.max(w.now() + lat(), q.lsInAt)
      q.lsInAt = at
      w.at(at, fn)
    }
    const send = (key: string, value: string | null) => {
      page.outgoing.set(key, (page.outgoing.get(key) ?? 0) + 1)
      const by = page.sessionUid() // (as the tab wrote it, not as the browser applies it)
      const at = Math.max(w.now() + lat(), b.lsAt)
      b.lsAt = at
      w.at(at, () => {
        // applied in the browser: a copy removed, or replaced by someone else's, is gone from this browser
        const old = b.ls.get(key)
        if (key === 'progress-v1' && old !== undefined && (value === null || ownerOf(value) !== ownerOf(old))) w.onWipe?.(b, old, page, by)
        if (value === null) b.ls.delete(key)
        else b.ls.set(key, value)
        reach(page, () => page.outgoing.set(key, page.outgoing.get(key)! - 1))
        for (const q of b.pages) {
          if (q === page || !q.alive || !q.cache) continue
          reach(q, () => {
            if (!q.alive || (q.outgoing.get(key) ?? 0) > 0) return // (its own write is on its way: Chromium ignores this change)
            if (value === null) q.cache!.delete(key)
            else q.cache!.set(key, value)
            for (const l of q.listeners.filter((x) => x.type === 'storage')) l.fn({ key: PREFIX + key })
          })
        }
      })
    }
    return {
      PREFIX,
      readJSON<T>(key: string, fallback: T): T {
        const raw = cache.get(key)
        return raw == null ? fallback : (JSON.parse(raw) as T)
      },
      readRaw(key: string): string | null {
        return cache.get(key) ?? null
      },
      writeJSON(key: string, value: unknown) {
        if (!page.alive) return
        const v = JSON.stringify(value)
        cache.set(key, v)
        send(key, v)
      },
      removeKey(key: string) {
        if (!page.alive) return
        cache.delete(key)
        send(key, null)
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
        if (w.deleteUserFails > 0) {
          w.deleteUserFails--
          throw Object.assign(new Error('closed'), { code: 'auth/popup-closed-by-user' }) // (the person closed the sign-in pop-up)
        }
        const uid = page.authUser
        if (!uid) return
        await delay(w.lat())
        w.server.deletedUsers.add(uid)
        w.server.deletedAt.set(uid, w.now())
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
        page.confirmedAt = w.now()
      },
      watchAccess(_uid: string, cb: (a: string) => void) {
        w.after(10, () => page.alive && cb('paid'))
        return () => {}
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
      watchProgress: (uid: string, cb: (s: unknown) => void) => c.watchProgress(uid, cb),
      writeProgress: (uid: string, s: SyncState, rev: number) => c.writeProgress(uid, s, rev),
      writeProgressOnExit: (uid: string, s: SyncState, rev: number, base: SyncState) => c.writeProgressOnExit(uid, s, rev, base),
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
    this.adding = true
    try {
      for (const cb of [...this.userCbs]) cb(user)
    } finally {
      this.adding = false
    }
  }
  /** who this tab's account store says is signed in */
  sessionUid(): string | null {
    return this.account?.account.get().user?.uid ?? null
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
  /** the next N account deletions fail (after the progress copy was deleted) */
  deleteUserFails = 0
  /**
   * called when a browser's stored progress is removed (sign-out, someone else signing in), with what it held, the tab
   * that did it and whose sign-in that tab was in then
   */
  onWipe?: (b: Browser, raw: string, by: Page, byUid: string | null) => void
  constructor(
    public seed: number,
    netSeed: number,
  ) {
    this.rnd = rng(netSeed)
    this.server = new Server(this)
    patchGlobals()
    allPages.length = 0 // (the pages of earlier runs, and their module instances, can go)
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
    for (const p of b.pages) this.after(p === actor ? 1 : KNOBS.authLag || this.lat(), () => p.deliverUser())
  }
  show(f: Fields | null): string {
    return f ? this.showState(read(f).state) : '(none)'
  }
  showState(s: SyncState | null): string {
    if (!s) return '(none)'
    const x = project(s)
    const strip = (k: string) => k.replace(/^[ga]\d+\//, '').replace(/^[ga]\d+-/, '')
    const keys = [...Object.keys(x.lessons), ...Object.keys(x.checkpoints), ...Object.keys(x.answers), ...x.exams.map((e) => e.id)]
    return `{${keys.sort().map(strip).join(' ')}}${s.resetAt ? ` R${s.resetAt - T0}` : ''}`
  }
  async newBrowser(user: string | null): Promise<Browser> {
    const b = new Browser(this.browsers.length, this)
    this.browsers.push(b)
    b.user = user
    return b
  }
  async openPage(b: Browser): Promise<Page> {
    const page = new Page(this, b, this.nextPage++)
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
    vi.doMock(`${WEB}/accounts/firebase-adapter.ts`, () => ({ createFirebaseAdapter: () => adapter }))
    vi.doMock(`${WEB}/accounts/sync.ts`, async (importOriginal) => {
      const m = (await importOriginal()) as any
      return { ...m, createProgressSync: (o: unknown) => (page.sync = m.createProgressSync(o)) }
    })
    currentPage = page
    page.account = await import(`${WEB}/accounts/index.ts`)
    page.progress = await import(`${WEB}/progress.ts`)
    currentPage = null
    page.account.account.init()
    const realWait = () => new Promise((r) => (globalThis as any).__realSetTimeout(r, 0))
    for (let i = 0; i < 2000 && !page.sync; i++) await realWait()
    if (!page.sync) throw new Error('adapter never loaded')
    return page
  }
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
      if (on) {
        p.client.reconnect()
        p.dispatch('online')
      } else p.client.dropConnection()
    }
  }
}
