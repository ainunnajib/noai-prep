/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest'
import { fromFields } from '../../../src/lib/accounts/progress-doc'
import { normalizeProgress, sameProgress, type ProgressState } from '../../../src/lib/progress'
import { KNOBS, rng, T0, World, type Page } from './world'

export type Step =
  | { t: 'advance'; ms: number }
  | { t: 'op'; page: number; kind: 'tick' | 'untick' | 'cp' | 'ans' | 'exam' | 'reset' | 'delcloud'; i: number; b: boolean }
  | { t: 'net'; browser: number; on: boolean }
  | { t: 'reload'; page: number; late: boolean }
  | { t: 'newtab'; browser: number }
  | { t: 'closetab'; page: number }
  | { t: 'pagehide'; page: number }
  | { t: 'signout'; page: number }
  | { t: 'signin'; page: number; provider: 'google' | 'apple' }
  | { t: 'delaccount'; page: number }

export interface Config {
  browsers: number
  steps: number
  signInOut: boolean
  deleteCloud: boolean
  deleteAccount: boolean
  tabs: boolean
  reload: boolean
  offline: boolean
  keys: number
}

export function genScript(seed: number, cfg: Config): Step[] {
  const r = rng(seed * 2654435761)
  const out: Step[] = []
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)]
  for (let i = 0; i < cfg.steps; i++) {
    const x = r()
    const page = Math.floor(r() * 8)
    if (x < 0.45) {
      const k = r()
      const kind =
        k < 0.3 ? 'tick' : k < 0.48 ? 'untick' : k < 0.62 ? 'cp' : k < 0.82 ? 'ans' : k < 0.86 ? 'exam' : k < 0.93 ? 'reset' : cfg.deleteCloud ? 'delcloud' : 'tick'
      out.push({ t: 'op', page, kind, i: Math.floor(r() * cfg.keys), b: r() < 0.5 })
    } else if (x < 0.65) out.push({ t: 'advance', ms: pick([0, 1, 5, 50, 200, 700, 1499, 1501, 1600, 3000, 8000, 20000]) })
    else if (x < 0.75) {
      if (cfg.offline) out.push({ t: 'net', browser: Math.floor(r() * cfg.browsers), on: r() < 0.5 })
    } else if (x < 0.8) {
      if (cfg.reload) out.push({ t: 'reload', page, late: r() < 0.5 })
    } else if (x < 0.83) {
      if (cfg.tabs) out.push(r() < 0.5 ? { t: 'newtab', browser: Math.floor(r() * cfg.browsers) } : { t: 'closetab', page })
    } else if (x < 0.86) out.push({ t: 'pagehide', page })
    else if (x < 0.92) {
      if (cfg.signInOut) out.push(r() < 0.5 ? { t: 'signout', page } : { t: 'signin', page, provider: r() < 0.7 ? 'google' : 'apple' })
    } else if (x < 0.925) {
      if (cfg.deleteAccount) out.push({ t: 'delaccount', page })
    }
  }
  return out
}

interface Op {
  id: number
  uid: string
  page: string
  t: number
  kind: 'add' | 'remove'
  keys: string[] | 'all'
  Kat: Set<number>
  desc: string
  /** made while this page's own sign-out / delete was in progress */
  during?: string
}

export interface Result {
  ok: boolean
  problems: string[]
  trace: string[]
  stats: Record<string, number>
}

function presence(s: ProgressState): Set<string> {
  return new Set([...Object.keys(s.lessons), ...Object.keys(s.checkpoints), ...Object.keys(s.answers), ...s.exams.map((e) => e.id)])
}

export async function runScript(seed: number, script: Step[], cfg: Config, opts: { netSeed?: number } = {}): Promise<Result> {
  vi.setSystemTime(T0)
  const w = new World(seed, opts.netSeed ?? seed)
  const ops: Op[] = []
  let nextOp = 1
  const stats: Record<string, number> = {}
  const bump = (k: string) => (stats[k] = (stats[k] ?? 0) + 1)
  /** op ids that were in a page's copy when sign-out cleared it, but not in the account copy */
  const clearedUnsaved = new Set<number>()
  w.onClear = (p: Page) => {
    const u = p.account?.account.get().user?.uid
    if (!u) return
    const sK = w.server.get(u).K
    for (const x of p.K) if (!sK.has(x)) clearedUnsaved.add(x)
  }
  // browsers: all signed in to g1 except maybe the last one (a1 or signed out)
  for (let i = 0; i < cfg.browsers; i++) {
    const user = i < 2 ? 'g1' : seed % 2 === 0 ? 'a1' : null
    const b = await w.newBrowser(user)
    await w.openPage(b)
  }
  await vi.advanceTimersByTimeAsync(3000)

  const live = () => w.pages.filter((p) => p.alive)
  const pageAt = (i: number) => {
    const ps = live()
    return ps.length ? ps[i % ps.length] : null
  }
  const keyOf = (uid: string, kind: string, i: number) =>
    kind === 'tick' || kind === 'untick' ? `${uid}/l${i}` : kind === 'cp' ? `${uid}/c${i}` : `${uid}/t${i % 3}.q${i}`

  for (const [si, s] of script.entries()) {
    await vi.advanceTimersByTimeAsync(1)
    switch (s.t) {
      case 'advance':
        await vi.advanceTimersByTimeAsync(s.ms)
        break
      case 'op': {
        const p = pageAt(s.page)
        if (!p) break
        const st = p.account.account.get()
        if (st.status !== 'signed-in' || !st.user) break
        const uid: string = st.user.uid
        if ((p as any).deleting && process.env.SIM_SKIP_DURING_DELETE) break
        if ((p as any).signingOut) break // the few ms between sign-out's last check and the clear: not humanly reachable
        const prog = p.progress.progress
        const cur: ProgressState = prog.get()
        const record = (kind: 'add' | 'remove', keys: string[] | 'all', desc: string) => {
          const id = nextOp++
          p.K.add(id)
          const during = (p as any).signingOut ? 'sign-out' : (p as any).deleting ? 'delete' : undefined
          const op: Op = { id, uid, page: p.name, t: Date.now() - T0, kind, keys, Kat: new Set(p.K), desc, during }
          ops.push(op)
          w.log(`${p.name}: OP#${id} ${desc} (as ${uid})`)
          return op
        }
        if (s.kind === 'tick') {
          const k = keyOf(uid, 'tick', s.i)
          if (Object.hasOwn(cur.lessons, k)) break
          record('add', [k], `tick ${k.split('/')[1]}`)
          prog.markLesson(k, true)
        } else if (s.kind === 'untick') {
          const present = Object.keys(cur.lessons)
          if (!present.length) break
          const k = present[s.i % present.length]
          record('remove', [k], `untick ${k.split('/')[1]}`)
          prog.markLesson(k, false)
        } else if (s.kind === 'cp') {
          const k = keyOf(uid, 'cp', s.i)
          record('add', [k], `checkpoint ${k.split('/')[1]}`)
          prog.recordCheckpoint(k, s.b ? 1 : 0.5)
        } else if (s.kind === 'ans') {
          const k = keyOf(uid, 'ans', s.i)
          record('add', [k], `answer ${k.split('/')[1]}`)
          prog.recordAnswer(k, s.b)
        } else if (s.kind === 'exam') {
          if (cur.exams.length >= 40) break
          const id = `${uid}-e${nextOp}`
          record('add', [id], `exam ${id.split('-')[1]}`)
          prog.recordExam({ id, date: new Date().toISOString(), mode: 'full', total: 4, correct: 2, seconds: 60, byDomain: { d: { total: 4, correct: 2 } } })
        } else if (s.kind === 'reset') {
          record('remove', 'all', 'RESET')
          prog.reset()
        } else if (s.kind === 'delcloud') {
          if ((p as any).deleting) break // the button is disabled while deleting
          const op = record('remove', 'all', 'DELETE SAVED PROGRESS')
          ;(op as any).pending = true
          ;(p as any).deleting = true
          p.deleteOp = op as any
          void p.account.account.deleteCloudProgress().finally(() => {
            ;(p as any).deleting = false
            p.deleteOp = null
            // a delete that failed never happened
            if (!p.account.account.get().error) (op as any).pending = false
          })
        }
        break
      }
      case 'net':
        w.setOnline(w.browsers[s.browser % w.browsers.length], s.on)
        break
      case 'reload': {
        const p = pageAt(s.page)
        if (!p) break
        if (KNOBS.noLostAcks) for (let i = 0; i < 200 && p.client.awaitingAck && p.browser.online; i++) await vi.advanceTimersByTimeAsync(25)
        if (s.late) {
          // the page lives a moment after pagehide (its own write may get out)
          w.log(`${p.name}: RELOAD (pagehide, page lingers)`)
          p.dispatch('pagehide')
          for (let i = 0; i < 20; i++) await Promise.resolve()
          w.closePage(p, 'reload')
        } else w.closePage(p, 'reload')
        bump('reload')
        await w.openPage(p.browser)
        break
      }
      case 'newtab': {
        const b = w.browsers[s.browser % w.browsers.length]
        if (b.pages.length >= 2) break
        await w.openPage(b)
        break
      }
      case 'closetab': {
        const p = pageAt(s.page)
        if (!p || p.browser.pages.length < 2) break
        if (KNOBS.noLostAcks) for (let i = 0; i < 200 && p.client.awaitingAck && p.browser.online; i++) await vi.advanceTimersByTimeAsync(25)
        w.closePage(p, 'close')
        break
      }
      case 'pagehide': {
        const p = pageAt(s.page)
        if (!p) break
        w.log(`${p.name}: PAGEHIDE (stays open)`)
        p.dispatch('pagehide')
        break
      }
      case 'signout': {
        const p = pageAt(s.page)
        if (!p || p.account.account.get().status !== 'signed-in') break
        w.log(`${p.name}: SIGN OUT`)
        bump('signout')
        ;(p as any).signingOut = true
        void p.account.account.signOut().then((r: string) => {
          ;(p as any).signingOut = false
          w.log(`  ${p.name}: signOut -> ${r}`)
        })
        break
      }
      case 'signin': {
        const p = pageAt(s.page)
        if (!p || p.account.account.get().status !== 'signed-out' || p.browser.user !== null || (p.browser as any).signingIn) break
        w.log(`${p.name}: SIGN IN ${s.provider}`)
        ;(p.browser as any).signingIn = true
        w.after(2000, () => ((p.browser as any).signingIn = false))
        bump('signin')
        void p.account.account.signIn(s.provider)
        break
      }
      case 'delaccount': {
        const p = pageAt(s.page)
        const st = p?.account.account.get()
        if (!p || st.status !== 'signed-in') break
        w.log(`${p.name}: DELETE ACCOUNT ${st.user.uid}`)
        bump('delaccount')
        void p.account.account.deleteAccount()
        break
      }
    }
    void si
  }

  // ---- quiesce: everything online, then a long quiet period ----
  w.log('==== QUIESCE ====')
  for (const b of w.browsers) w.setOnline(b, true)
  for (let i = 0; i < 40; i++) await vi.advanceTimersByTimeAsync(3000)

  const problems: string[] = []
  const serverState = (uid: string): ProgressState => {
    const f = w.server.get(uid).fields
    return normalizeProgress(f ? fromFields((k) => (Object.hasOwn(f, k) ? f[k] : undefined)) : null)
  }
  const users = new Set<string>(ops.map((o) => o.uid))
  for (const p of w.pages) if (p.alive && p.account.account.get().user) users.add(p.account.account.get().user.uid)

  // (3) nothing stuck / (1) convergence / (4) leaks
  for (const p of w.pages) {
    if (!p.alive) continue
    const st = p.account.account.get()
    if (st.status !== 'signed-in' || !st.user) continue
    const uid = st.user.uid
    if (p.authUser !== uid) continue
    const unsaved = p.sync.hasUnsaved()
    if (unsaved) problems.push(`STUCK: ${p.name} (${uid}) still has unsaved changes after 120 s online (error: ${st.error})`)
    const mine: ProgressState = p.progress.progress.get()
    const srv = serverState(uid)
    if (!sameProgress(mine, srv)) problems.push(`DIVERGED: ${p.name} (${uid}) holds ${w.showState(mine)} but the account copy is ${w.showState(srv)}`)
    for (const k of presence(mine)) if (!k.startsWith(`${uid}/`) && !k.startsWith(`${uid}-`)) problems.push(`LEAK: ${p.name} signed in as ${uid} holds ${k}`)
  }
  for (const [uid] of w.server.docs) {
    const s = serverState(uid)
    for (const k of presence(s)) if (!k.startsWith(`${uid}/`) && !k.startsWith(`${uid}-`)) problems.push(`LEAK: account copy of ${uid} holds ${k}`)
    if (w.server.deletedUsers.has(uid) && w.server.get(uid).fields) problems.push(`ORPHAN: deleted user ${uid} still has a progress document ${w.show(w.server.get(uid).fields)}`)
  }

  // (2) intent: per key, the causally-latest operations decide
  for (const uid of users) {
    if (w.server.deletedUsers.has(uid)) continue
    // deletes that never completed (page closed while "Deleting...", or the delete failed) did not happen, unless the
    // server applied them (the page closed before hearing back)
    const mine = ops.filter((o) => o.uid === uid && (!(o as any).pending || (o as any).landed))
    const keys = new Set<string>()
    for (const o of mine) if (o.keys !== 'all') o.keys.forEach((k) => keys.add(k))
    const final = presence(serverState(uid))
    for (const k of final) keys.add(k)
    for (const k of keys) {
      const touching = mine.filter((o) => o.keys === 'all' || o.keys.includes(k))
      const maximal = touching.filter((o) => !touching.some((o2) => o2 !== o && o2.Kat.has(o.id)))
      const has = final.has(k)
      if (maximal.length === 0) {
        if (has) problems.push(`INTENT: ${k} present in ${uid}'s account but no operation ever added it`)
        continue
      }
      const allAdd = maximal.every((o) => o.kind === 'add')
      const allRemove = maximal.every((o) => o.kind === 'remove')
      const desc = maximal.map((o) => `#${o.id} ${o.desc}@${o.page} t=${o.t}`).join(', ')
      const lostBySignOut = maximal.some((o) => clearedUnsaved.has(o.id))
      const during = maximal.find((o) => o.during)?.during
      if (allAdd && !has) problems.push(`LOST${during ? `(made during own ${during})` : lostBySignOut ? '(cleared at sign-out)' : ''}: ${k} missing from ${uid}'s account; latest ops: ${desc}`)
      if (allRemove && has) problems.push(`RESURRECTED: ${k} present in ${uid}'s account; latest ops: ${desc}`)
    }
  }
  return { ok: problems.length === 0, problems, trace: w.trace, stats }
}
