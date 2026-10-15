import { mulberry32 } from '../../../../../lib/random'

/*
  A simulated hiring/approval data set for the BiasAmplifier visual.

  Every applicant has a hidden ability a ~ Normal(50, 15) and a test score s = a + Normal(0, 7)
  (clipped to 0..100). They are truly qualified when a >= 50. Both groups have exactly the same
  ability distribution: neither group is more qualified than the other.

  Historical labels (what the model is trained on) were written by past reviewers. For group A
  they match the truth. For group B, each truly qualified applicant was rejected with probability
  `skew`: that is the bias in the data.

  The model is a logistic regression on [1, standardised score, isGroupB], fitted by Newton's
  method (IRLS) with a tiny ridge penalty, optionally with Kamiran–Calders reweighing:
  w(g, y) = P(g) P(y) / P(g, y), which makes group and label independent in the weighted data.
*/

export type Group = 0 | 1 // 0 = A, 1 = B

export interface Person {
  g: Group
  score: number
  qualified: boolean
  /** uniform number used to decide whether a qualified B applicant was rejected in the past */
  u: number
  /** vertical jitter for drawing */
  jitter: number
}

export interface GroupMetrics {
  approval: number
  accuracy: number
  /** qualified but rejected / qualified */
  missed: number
  /** not qualified but approved / not qualified */
  falseApproval: number
  /** score above which the model approves this group */
  threshold: number
}

export interface SimResult {
  train: (Person & { label: boolean })[]
  theta: [number, number, number]
  A: GroupMetrics
  B: GroupMetrics
  overallAccuracy: number
}

function normal(rng: () => number): number {
  // Box–Muller
  const u1 = Math.max(1e-12, rng())
  const u2 = rng()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function makePeople(nA: number, nB: number, seed: number): Person[] {
  const rng = mulberry32(seed)
  const out: Person[] = []
  for (let i = 0; i < nA + nB; i++) {
    const g: Group = i < nA ? 0 : 1
    const a = 50 + 15 * normal(rng)
    const s = Math.max(0, Math.min(100, a + 7 * normal(rng)))
    out.push({ g, score: s, qualified: a >= 50, u: rng(), jitter: rng() * 2 - 1 })
  }
  return out
}

export const TRAIN = makePeople(240, 80, 11)
export const TEST = makePeople(1500, 500, 23)

export const historicalLabel = (p: Person, skew: number) => (p.g === 1 && p.qualified ? p.u >= skew : p.qualified)

const feats = (p: Person): [number, number, number] => [1, (p.score - 50) / 15, p.g]

/** Weighted logistic regression by Newton's method (3 parameters). */
export function fitLogistic(X: [number, number, number][], y: number[], w: number[], ridge = 1e-3): [number, number, number] {
  let th: [number, number, number] = [0, 0, 0]
  for (let it = 0; it < 50; it++) {
    const g = [0, 0, 0]
    const H = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    let W = 0
    for (let i = 0; i < X.length; i++) {
      const x = X[i]
      const z = th[0] * x[0] + th[1] * x[1] + th[2] * x[2]
      const p = 1 / (1 + Math.exp(-z))
      const r = w[i] * (p - y[i])
      const s = w[i] * p * (1 - p)
      W += w[i]
      for (let a = 0; a < 3; a++) {
        g[a] += r * x[a]
        for (let b = 0; b < 3; b++) H[a][b] += s * x[a] * x[b]
      }
    }
    for (let a = 0; a < 3; a++) {
      g[a] = g[a] / W + ridge * th[a]
      for (let b = 0; b < 3; b++) H[a][b] = H[a][b] / W + (a === b ? ridge : 0)
    }
    const step = solve3(H, g)
    th = [th[0] - step[0], th[1] - step[1], th[2] - step[2]]
    if (Math.abs(step[0]) + Math.abs(step[1]) + Math.abs(step[2]) < 1e-9) break
  }
  return th
}

function solve3(A: number[][], b: number[]): number[] {
  const M = A.map((row, i) => [...row, b[i]])
  for (let c = 0; c < 3; c++) {
    let piv = c
    for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r
    ;[M[c], M[piv]] = [M[piv], M[c]]
    for (let r = 0; r < 3; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]
    }
  }
  return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]]
}

export function simulate(skew: number, reweigh: boolean, judgeBy: 'truth' | 'history'): SimResult {
  const train = TRAIN.map((p) => ({ ...p, label: historicalLabel(p, skew) }))
  const y = train.map((p) => (p.label ? 1 : 0))
  let w = train.map(() => 1)
  if (reweigh) {
    const n = train.length
    const count = (f: (p: (typeof train)[number]) => boolean) => train.filter(f).length / n
    const wt: number[][] = [
      [0, 0],
      [0, 0],
    ]
    for (const g of [0, 1] as const)
      for (const lab of [false, true]) {
        const pg = count((p) => p.g === g)
        const py = count((p) => p.label === lab)
        const pgy = count((p) => p.g === g && p.label === lab)
        wt[g][lab ? 1 : 0] = pgy > 0 ? (pg * py) / pgy : 0
      }
    w = train.map((p) => wt[p.g][p.label ? 1 : 0])
  }
  const theta = fitLogistic(train.map(feats), y, w)
  const approve = (p: Person) => theta[0] + theta[1] * ((p.score - 50) / 15) + theta[2] * p.g > 0
  const metrics = (g: Group): GroupMetrics => {
    const people = TEST.filter((p) => p.g === g)
    const truth = (p: Person) => (judgeBy === 'truth' ? p.qualified : historicalLabel(p, skew))
    let ok = 0
    let appr = 0
    let pos = 0
    let neg = 0
    let missed = 0
    let fa = 0
    for (const p of people) {
      const a = approve(p)
      const t = truth(p)
      if (a === t) ok++
      if (a) appr++
      if (t) {
        pos++
        if (!a) missed++
      } else {
        neg++
        if (a) fa++
      }
    }
    const threshold = 50 + (15 * -(theta[0] + theta[2] * g)) / theta[1]
    return { approval: appr / people.length, accuracy: ok / people.length, missed: pos ? missed / pos : 0, falseApproval: neg ? fa / neg : 0, threshold }
  }
  const A = metrics(0)
  const B = metrics(1)
  const nA = TEST.filter((p) => p.g === 0).length
  const nB = TEST.length - nA
  return { train, theta, A, B, overallAccuracy: (A.accuracy * nA + B.accuracy * nB) / (nA + nB) }
}
