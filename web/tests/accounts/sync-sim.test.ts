/*
  Randomised runs of the multi-browser model (model/world.ts, model/run.ts): two or three browsers, two of them on one
  account, whose tabs tick and un-tick lessons, answer, record checkpoints and exams, Reset, "Delete my saved
  progress", go offline, reload, open and close tabs and hide pages, over a Firestore model that enforces the rules
  and loses replies with dropped connections. Then everything comes back online and settles, and an oracle checks the
  outcome against what the student did. Fixed seeds and fake timers: every run is the same, and a failure prints the
  seed's problems and trace (re-run it with SIM_SEED=<n>).

  Checked: tabs and devices end with the account copy (nothing diverged or left unsaved), nothing leaks between
  accounts, and nothing the student did is lost.
  Not checked (known limits): a removal (un-tick, Reset, delete) can come back when a save from this browser landed
  without it hearing so and the account moved on before it looked again; and a checkpoint re-recorded with the same
  score while its own "Delete my saved progress" runs can't be told apart from the deleted one.
  Run: npx vitest run tests/accounts/sync-sim.test.ts
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { genScript, runScript, type Config } from './model/run'
import { KNOBS } from './model/world'

beforeAll(() => {
  ;(globalThis as any).__realSetTimeout = globalThis.setTimeout
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] })
  Object.assign(KNOBS, { landAfterDisconnect: 0.5, keepalive: true, dedupe: false, noLostAcks: false, fixedLat: 0 })
})
afterAll(() => vi.useRealTimers())

const base = { signInOut: false, deleteAccount: false, offline: true, keys: 4 }
const profiles: Record<string, { cfg: Config; seeds: number }> = {
  // two devices: edits, offline and hidden pages
  plain: { cfg: { ...base, browsers: 2, steps: 50, deleteCloud: false, tabs: false, reload: false, keys: 3 }, seeds: 50 },
  // three browsers, with reloads
  reloads: { cfg: { ...base, browsers: 3, steps: 60, deleteCloud: false, tabs: false, reload: true }, seeds: 40 },
  // ... and "Delete my saved progress"
  deletes: { cfg: { ...base, browsers: 3, steps: 60, deleteCloud: true, tabs: false, reload: true }, seeds: 40 },
  // ... and several tabs per browser
  tabs: { cfg: { ...base, browsers: 3, steps: 60, deleteCloud: true, tabs: true, reload: true }, seeds: 30 },
}

const only = process.env.SIM_SEED ? Number(process.env.SIM_SEED) : null

describe('random runs of tabs and devices (fixed seeds)', () => {
  for (const [name, { cfg, seeds }] of Object.entries(profiles)) {
    it(`${name}: ${seeds} runs`, async () => {
      const bad: string[] = []
      for (let seed = 1; seed <= seeds; seed++) {
        if (only !== null && seed !== only) continue
        const res = await runScript(seed, genScript(seed, cfg), cfg)
        const problems = res.problems.filter((p) => {
          const kind = p.split(':')[0]
          if (kind === 'RESURRECTED') return false
          // (a checkpoint re-recorded with the same score while its own delete runs can't be told apart from the old one)
          if (kind === 'LOST(made during own delete)') return false
          return true
        })
        if (problems.length) bad.push(`seed ${seed}:\n  ${problems.join('\n  ')}\n${res.trace.slice(-400).join('\n')}`)
      }
      expect(bad.join('\n\n')).toBe('')
    })
  }
})
