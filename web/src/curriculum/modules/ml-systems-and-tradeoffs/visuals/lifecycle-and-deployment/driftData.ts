/*
  Simulated weekly monitoring data for a deployed loan-approval model.

  Each week N = 1000 people apply. Income x (in $1000s) ~ Normal(mu_w, 15).
  The model approves when x > CUT, chosen so that 40% are approved on the training data (mu = 58):
    CUT = 58 + 15 × 0.2533 = 61.8   (0.2533 = the z-score with 60% of a normal below it).
  The true chance that an approved loan defaults is p(x) = 1 / (1 + exp((x − h_w) / 6)):
  richer applicants default less; h_w = 50 normally (about 4% of approved loans default).

  Drift scenarios (all start in week 10):
    data-gradual : mu falls steadily from 58 to 49 over weeks 10–17 (applicants get poorer)
    data-sudden  : mu drops to 49 in week 10
    concept      : incomes do NOT change, but h rises from 50 to 57 over weeks 10–17, so people
                   with the same income now default more (the input → outcome relationship changed)

  Monitored signals per week: mean income, approval rate, and default rate of the approved loans.
  Default labels take LABEL_DELAY = 12 weeks to arrive.
  Alert band = reference value ± k × SE, where SE is the signal's normal week-to-week wobble:
    mean income  SE = 15 / √1000 ≈ 0.47
    approval     SE = √(0.4 × 0.6 / 1000) ≈ 1.5 percentage points
    default rate SE = √(d0 (1 − d0) / (0.4 × 1000)) ≈ 1.0 point, d0 ≈ 4.1% = reference default rate of approved loans.
*/

export type DriftKind = 'none' | 'data-gradual' | 'data-sudden' | 'concept'

export const WEEKS = 30
export const N = 1000
export const START = 10
export const LABEL_DELAY = 12
export const MU0 = 58
export const SD = 15
export const CUT = 61.8
export const H0 = 50

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ramp = (w: number) => Math.min(1, Math.max(0, (w - START + 1) / 8))

export function muOf(kind: DriftKind, w: number) {
  if (kind === 'data-gradual') return MU0 - 9 * ramp(w)
  if (kind === 'data-sudden') return w >= START ? MU0 - 9 : MU0
  return MU0
}
export function hOf(kind: DriftKind, w: number) {
  return kind === 'concept' ? H0 + 7 * ramp(w) : H0
}
const pDefault = (x: number, h: number) => 1 / (1 + Math.exp((x - h) / 6))

const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)

/** Reference (training-time) default rate of approved loans, by numerical integration. */
function refDefault() {
  let num = 0
  let den = 0
  const dx = 0.05
  for (let x = CUT; x < MU0 + 8 * SD; x += dx) {
    const w = phi((x - MU0) / SD)
    num += w * pDefault(x, H0)
    den += w
  }
  return num / den
}

export const REF = (() => {
  const d0 = refDefault()
  return {
    income: MU0,
    approval: 0.4,
    def: d0,
    seIncome: SD / Math.sqrt(N),
    seApproval: Math.sqrt((0.4 * 0.6) / N),
    seDef: Math.sqrt((d0 * (1 - d0)) / (0.4 * N)),
  }
})()

export interface Week {
  w: number
  mean: number
  q10: number
  q25: number
  q75: number
  q90: number
  approval: number
  def: number
}

export function simulate(kind: DriftKind, seed: number): Week[] {
  const r = rng(seed * 7919 + 17)
  const normal = () => {
    const u = Math.max(1e-12, r())
    const v = r()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const out: Week[] = []
  for (let w = 1; w <= WEEKS; w++) {
    const mu = muOf(kind, w)
    const h = hOf(kind, w)
    const xs: number[] = []
    let approved = 0
    let defaults = 0
    for (let i = 0; i < N; i++) {
      const x = Math.max(0, mu + SD * normal())
      xs.push(x)
      if (x > CUT) {
        approved++
        if (r() < pDefault(x, h)) defaults++
      }
    }
    xs.sort((a, b) => a - b)
    const q = (p: number) => xs[Math.min(N - 1, Math.floor(p * N))]
    out.push({
      w,
      mean: xs.reduce((s, x) => s + x, 0) / N,
      q10: q(0.1),
      q25: q(0.25),
      q75: q(0.75),
      q90: q(0.9),
      approval: approved / N,
      def: approved ? defaults / approved : 0,
    })
  }
  return out
}

export interface Alerts {
  income: number[]
  approval: number[]
  /** weeks whose loans' default rate is out of band (the alert is raised LABEL_DELAY weeks later) */
  def: number[]
}

export function alerts(data: Week[], k: number): Alerts {
  return {
    income: data.filter((d) => Math.abs(d.mean - REF.income) > k * REF.seIncome).map((d) => d.w),
    approval: data.filter((d) => Math.abs(d.approval - REF.approval) > k * REF.seApproval).map((d) => d.w),
    def: data.filter((d) => Math.abs(d.def - REF.def) > k * REF.seDef).map((d) => d.w),
  }
}
