/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest'
import * as crdt from '../../../src/lib/progress-crdt'
import type { ProgressState, SyncState } from '../../../src/lib/progress-crdt'
import { opOf, oracle, single, type Op } from './oracle'
import { rng, T0, World, type Page } from './world'

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
    } else if (x < 0.65) out.push({ t: 'advance', ms: pick([0, 1, 5, 50, 200, 700, 1499, 1501, 1600, 3000, 5001, 8000, 20000]) })
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

/** One thing the student did, as the operation it added to their progress. */
interface Rec {
  op: Op
  uid: string
  browser: number
  desc: string
  /** why it may be missing in the end (one of the allowed exceptions) */
  lossOk?: string
}

export interface Result {
  ok: boolean
  problems: string[]
  trace: string[]
  stats: Record<string, number>
}

/** a state includes an operation when joining it in changes nothing */
const includes = (s: SyncState, o: Op) => crdt.same(crdt.join(s, single(o)), s)
/** the projection as text, whatever order its keys were added in */
function canon(p: ProgressState): string {
  const sorted = <T,>(o: Record<string, T>) => Object.keys(o).sort().map((k) => [k, o[k]])
  return JSON.stringify([sorted(p.lessons), sorted(p.checkpoints), sorted(p.answers), p.exams])
}
/** every key a state mentions (removals too) */
const keysIn = (s: SyncState) => [...Object.keys(s.lessons), ...Object.keys(s.checkpoints), ...Object.keys(s.answers), ...Object.keys(s.exams)]
const ownKey = (uid: string, k: string) => k.startsWith(`${uid}/`) || k.startsWith(`${uid}-`)

export async function runScript(seed: number, script: Step[], cfg: Config, opts: { netSeed?: number } = {}): Promise<Result> {
  vi.clearAllTimers() // (whatever earlier runs left scheduled)
  vi.setSystemTime(T0)
  const w = new World(seed, opts.netSeed ?? seed)
  const recs: Rec[] = []
  const stats: Record<string, number> = {}
  const bump = (k: string) => (stats[k] = (stats[k] ?? 0) + 1)
  // Allowed exception: signing out clears this browser's copy, so what it held that hadn't reached the account then
  // (made in another tab after sign-out checked that everything was saved) is gone. Only the person's own sign-out
  // (or account deletion) may clear their copy: a tab that clears someone else's (one that heard late that its own
  // person signed out, say) loses that progress, and it is reported lost.
  w.onWipe = (b, raw, by, byUid) => {
    let owner: unknown = null
    try {
      owner = JSON.parse(raw).owner
    } catch {
      /* (not progress) */
    }
    if (typeof owner !== 'string') return
    if (byUid !== owner) return void w.log(`  (oracle: ${by.name} removed ${owner}'s copy outside ${owner}'s sign-in)`)
    const srv = w.server.state(owner) ?? crdt.empty()
    for (const r of recs) {
      if (r.uid !== owner || r.browser !== b.id || r.lossOk || includes(srv, r.op)) continue
      r.lossOk = 'cleared by a sign-out before it was saved'
      w.log(`  (oracle: ${r.desc} cleared from B${b.id} before it reached the account)`)
    }
  }
  // browsers: all signed in to g1 except maybe the last one (a1 or signed out)
  for (let i = 0; i < cfg.browsers; i++) {
    const b = await w.newBrowser(i < 2 ? 'g1' : seed % 2 === 0 ? 'a1' : null)
    await w.openPage(b)
  }
  await vi.advanceTimersByTimeAsync(3000)

  const live = () => w.pages.filter((p) => p.alive)
  const pageAt = (i: number) => {
    const ps = live()
    return ps.length ? ps[i % ps.length] : null
  }
  const flag = (p: Page, k: string) => (p as any)[k] === true

  for (const s of script) {
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
        if (flag(p, 'signingOut')) break // (the few ms between sign-out's last check and the clear: not humanly reachable)
        const prog = p.progress.progress
        if (prog.owner() !== uid) {
          // A tab that hasn't heard yet that another tab signed out (or someone else signed in): its click lands on
          // whatever this browser holds now, never on the old person's copy (see progress-store.test.ts).
          bump('stray')
          break
        }
        const before: SyncState = prog.getSync()
        let kind: 'tick' | 'untick' | 'cp' | 'ans' | 'exam' | 'reset' = 'tick'
        let key = ''
        if (s.kind === 'tick') {
          key = `${uid}/l${s.i}`
          prog.markLesson(key, true)
        } else if (s.kind === 'untick') {
          const present = Object.keys(prog.get().lessons)
          if (!present.length) break
          kind = 'untick'
          key = present[s.i % present.length]
          prog.markLesson(key, false)
        } else if (s.kind === 'cp') {
          kind = 'cp'
          key = `${uid}/c${s.i}`
          prog.recordCheckpoint(key, s.b ? 1 : 0.5)
        } else if (s.kind === 'ans') {
          kind = 'ans'
          key = `${uid}/t${s.i % 3}.q${s.i}`
          prog.recordAnswer(key, s.b)
        } else if (s.kind === 'exam') {
          kind = 'exam'
          key = `${uid}-e${recs.length}`
          prog.recordExam({ id: key, date: new Date().toISOString(), mode: 'full', total: 4, correct: 2, seconds: 60, byDomain: { d: { total: 4, correct: 2 } } })
        } else if (s.kind === 'reset') {
          kind = 'reset'
          prog.reset()
        } else {
          if (flag(p, 'deleting')) break // (the button is disabled while deleting)
          kind = 'reset'
          ;(p as any).deleting = true
          void p.account.account.deleteCloudProgress().finally(() => ((p as any).deleting = false))
        }
        const op = opOf(kind, key, before, prog.getSync())
        if (!op) break
        const desc = `#${recs.length + 1} ${s.kind} ${key.replace(/^[ga]\d+[/-]/, '')}@${p.name}`
        recs.push({ op, uid, browser: p.browser.id, desc })
        w.log(`${p.name}: OP ${desc} t=${op.t - T0} (as ${uid})`)
        break
      }
      case 'net':
        w.setOnline(w.browsers[s.browser % w.browsers.length], s.on)
        break
      case 'reload': {
        const p = pageAt(s.page)
        if (!p) break
        if (s.late) {
          // the page lives a moment after pagehide (its own write may get out)
          w.log(`${p.name}: RELOAD (pagehide, page lingers)`)
          p.dispatch('pagehide')
          for (let i = 0; i < 20; i++) await Promise.resolve()
        }
        w.closePage(p, 'reload')
        bump('reload')
        await w.openPage(p.browser)
        break
      }
      case 'newtab': {
        const b = w.browsers[s.browser % w.browsers.length]
        if (b.pages.length < 2) await w.openPage(b)
        break
      }
      case 'closetab': {
        const p = pageAt(s.page)
        if (p && p.browser.pages.length >= 2) w.closePage(p, 'close')
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
        // (one account action at a time in a tab: signing out and deleting the account both take a moment)
        if (!p || p.account.account.get().status !== 'signed-in' || flag(p, 'signingOut') || flag(p, 'deletingAccount')) break
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
        if (!p || st.status !== 'signed-in' || flag(p, 'signingOut') || flag(p, 'deletingAccount')) break
        w.log(`${p.name}: DELETE ACCOUNT ${st.user.uid}`)
        bump('delaccount')
        ;(p as any).deletingAccount = true
        void p.account.account.deleteAccount().finally(() => ((p as any).deletingAccount = false))
        break
      }
    }
  }

  // ---- quiesce: everything online, then a long quiet period ----
  w.log('==== QUIESCE ====')
  for (const b of w.browsers) w.setOnline(b, true)
  for (let i = 0; i < 40; i++) await vi.advanceTimersByTimeAsync(3000)

  const problems: string[] = []
  const serverState = (uid: string) => w.server.state(uid) ?? crdt.empty()

  // saves never stuck; every tab ends with the account copy (convergence); nothing leaks between accounts
  for (const p of w.pages) {
    if (!p.alive) continue
    const st = p.account.account.get()
    if (st.status !== 'signed-in' || !st.user || p.authUser !== st.user.uid) continue
    const uid = st.user.uid
    if (p.sync.hasUnsaved()) problems.push(`STUCK: ${p.name} (${uid}) still has unsaved changes after 120 s online (error: ${st.error})`)
    const mine: SyncState = p.progress.progress.getSync()
    if (!crdt.same(mine, serverState(uid))) problems.push(`DIVERGED: ${p.name} (${uid}) holds ${w.showState(mine)} but the account copy is ${w.showState(serverState(uid))}`)
    for (const k of keysIn(mine)) if (!ownKey(uid, k)) problems.push(`LEAK: ${p.name} signed in as ${uid} holds ${k}`)
  }
  for (const [uid, ver] of w.server.docs) {
    if (!ver.fields) continue
    for (const k of keysIn(serverState(uid))) if (!ownKey(uid, k)) problems.push(`LEAK: account copy of ${uid} holds ${k}`)
    if (!w.server.deletedUsers.has(uid)) continue
    // Allowed exception: a copy created by a device or tab with unsaved progress that had checked the account still
    // existed before "Delete my account" elsewhere deleted it (the copy itself having been deleted first, or never
    // created); devices that haven't heard yet may go on saving to it. Only a clean-up on the server when an account is
    // deleted could catch that. A copy created without such a check is a failure.
    const deletedAt = w.server.deletedAt.get(uid)!
    const checked = ver.confirmedAt !== undefined && ver.confirmedAt <= deletedAt && (ver.sentAt ?? Infinity) - ver.confirmedAt < 3000
    if (ver.createdAt <= deletedAt || checked) bump('orphanRaced')
    else problems.push(`ORPHAN: deleted user ${uid} still has a progress document ${w.show(ver.fields)}`)
  }

  // nothing the student did is lost, and the account copy shows exactly what the oracle says those operations make
  for (const uid of new Set(recs.map((r) => r.uid))) {
    if (w.server.deletedUsers.has(uid)) continue
    const final = serverState(uid)
    const mine = recs.filter((r) => r.uid === uid)
    for (const r of mine) if (!r.lossOk && !includes(final, r.op)) problems.push(`LOST: ${r.desc} (t=${r.op.t - T0}) is missing from ${uid}'s account`)
    const reached = mine.filter((r) => includes(final, r.op)).map((r) => r.op)
    if (!crdt.same(reached.map(single).reduce(crdt.join, crdt.empty()), final)) problems.push(`EXTRA: ${uid}'s account holds something no operation of theirs made: ${w.showState(final)}`)
    if (canon(crdt.project(final)) !== canon(oracle(reached))) problems.push(`ORACLE: ${uid}'s account shows ${canon(crdt.project(final))}, the oracle ${canon(oracle(reached))}`)
    stats.lossOk = (stats.lossOk ?? 0) + mine.filter((r) => r.lossOk && !includes(final, r.op)).length
  }
  stats.ops = recs.length
  for (const p of w.pages) {
    p.sync?.stop()
    p.alive = false
  }
  return { ok: problems.length === 0, problems, trace: w.trace, stats }
}
