/*
  Randomised runs of the multi-browser model (model/world.ts, model/run.ts): two or three browsers, two of them on one
  account, whose tabs tick and un-tick lessons, answer, record checkpoints and exams, Reset, "Delete my saved
  progress", go offline, reload, open and close tabs, hide pages, sign out and in (as someone else too) and delete the
  account, over a Firestore model that enforces the rules, loses replies with dropped connections and re-sends
  writes. Then everything comes back online and settles, and the outcome is checked (see run.ts):
  - convergence: every signed-in tab holds exactly the account copy, with nothing unsaved (saves never stuck);
  - no lost intent: every operation is in the account copy, unless it was cleared by a sign-out before it was saved
    (the allowed exception: made in another tab after sign-out checked everything was saved);
  - the account copy is exactly what its operations make, and shows what an oracle replaying them in time order says;
  - nothing leaks between accounts, and a deleted account leaves no progress document behind, except one created by
    a device that checked the account still existed just before "Delete my account" elsewhere deleted it (only a
    clean-up on the server could catch that; counted as orphanRaced).
  Not modelled: a click in a tab that hasn't heard yet that another tab signed out (counted as stray: see
  progress-store.test.ts), and signing out and deleting the account at the same time in one tab.
  Fixed seeds and fake timers: every run is the same, and a failure prints the seed's problems and trace (re-run it
  with SIM_SEED=<n>). SIM_COUNT=<n> (and SIM_FROM=<first seed>) runs more seeds and reports the failure rate.
  SIM_KNOBS changes the fault model (see model/world.ts), e.g. '{"authLag":30000}' (background tabs hear sign-ins and
  sign-outs 30 s late) or '{"tabCache":2}' (Chromium-like per-tab localStorage).
  Run: npx vitest run tests/accounts/sync-sim.test.ts
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { genScript, runScript, type Config } from './model/run'
import { KNOBS } from './model/world'

beforeAll(() => {
  ;(globalThis as any).__realSetTimeout = globalThis.setTimeout
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] })
  Object.assign(KNOBS, { landAfterDisconnect: 0.5, keepalive: true, reorder: 0.1, fixedLat: 0 }, JSON.parse(process.env.SIM_KNOBS ?? '{}'))
})
afterAll(() => vi.useRealTimers())

const base = { signInOut: false, deleteAccount: false, offline: true, keys: 4 }
const profiles: Record<string, { cfg: Config; seeds: number }> = {
  // two devices: edits, offline and hidden pages
  plain: { cfg: { ...base, browsers: 2, steps: 50, deleteCloud: false, tabs: false, reload: false, keys: 3 }, seeds: 25 },
  // three browsers, with reloads and "Delete my saved progress"
  reloads: { cfg: { ...base, browsers: 3, steps: 60, deleteCloud: true, tabs: false, reload: true }, seeds: 20 },
  // ... and several tabs per browser
  tabs: { cfg: { ...base, browsers: 3, steps: 60, deleteCloud: true, tabs: true, reload: true }, seeds: 20 },
  // ... and signing out and in (as someone else too), and deleting the account
  accounts: { cfg: { ...base, browsers: 3, steps: 60, deleteCloud: true, tabs: true, reload: true, signInOut: true, deleteAccount: true }, seeds: 20 },
}

const only = process.env.SIM_SEED ? Number(process.env.SIM_SEED) : null
const count = process.env.SIM_COUNT ? Number(process.env.SIM_COUNT) : null
const from = Number(process.env.SIM_FROM ?? 1)

describe('random runs of tabs and devices (fixed seeds)', () => {
  for (const [name, { cfg, seeds }] of Object.entries(profiles)) {
    const n = count ?? seeds
    it(`${name}: ${n} runs`, async () => {
      const bad: string[] = []
      const kinds: Record<string, number> = {}
      const totals: Record<string, number> = {}
      for (let seed = from; seed < from + n; seed++) {
        if (only !== null && seed !== only) continue
        const res = await runScript(seed, genScript(seed, cfg), cfg)
        for (const p of new Set(res.problems.map((p) => p.split(':')[0]))) kinds[p] = (kinds[p] ?? 0) + 1
        for (const [k, v] of Object.entries(res.stats)) totals[k] = (totals[k] ?? 0) + v
        if (res.problems.length) bad.push(`seed ${seed}:\n  ${res.problems.join('\n  ')}\n${res.trace.slice(-400).join('\n')}`)
      }
      if (count !== null) console.log(`SIM ${name}: ${bad.length}/${n} runs failed ${JSON.stringify(kinds)}; totals ${JSON.stringify(totals)}`)
      expect(bad.join('\n\n')).toBe('')
    }, (count ?? 0) * 1000 + 60_000)
  }
})
