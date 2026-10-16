/*
  Data and maths for the ImbalanceRemedies visual.

  A 2-D fraud problem with 5% positives. Genuine payments ~ N((0, 0), I), frauds ~ N((2.2, 1.4), I).
  Training set: 228 genuine + 12 fraud. Test set (never resampled): 1,900 genuine + 100 fraud.
  Each remedy produces a weighted training set; we fit logistic regression to it with Newton's
  method (IRLS) and a tiny L2 penalty, then score the untouched test set at threshold 0.5.
*/
import { mulberry32 } from '../../../../../kit'
import { normals } from '../confusion-matrix-and-metrics/evalMath'

export type Pt = [number, number]
export const NEG_MEAN: Pt = [0, 0]
export const POS_MEAN: Pt = [2.2, 1.4]
export const N_NEG = 228
export const N_POS = 12
export const RATIO = N_NEG / N_POS // 19

function cloud(n: number, mean: Pt, seed: number): Pt[] {
  const z = normals(2 * n, seed)
  return Array.from({ length: n }, (_, i) => [mean[0] + z[2 * i], mean[1] + z[2 * i + 1]] as Pt)
}

export const TRAIN_NEG = cloud(N_NEG, NEG_MEAN, 101)
export const TRAIN_POS = cloud(N_POS, POS_MEAN, 202)
export const TEST_NEG = cloud(1900, NEG_MEAN, 303)
export const TEST_POS = cloud(100, POS_MEAN, 404)

export interface Sample {
  x: Pt
  y: 0 | 1
  w: number
}

export interface Model {
  w: Pt
  b: number
}

/** Weighted logistic regression by Newton's method (IRLS), L2 penalty `l2` on the weights only. */
export function fitLogistic(data: Sample[], l2 = 0.01, iters = 30): Model {
  let w0 = 0
  let w1 = 0
  let b = 0
  for (let it = 0; it < iters; it++) {
    // gradient g and Hessian H of the weighted negative log-likelihood (+ penalty)
    const g = [l2 * w0, l2 * w1, 0]
    const H = [
      [l2, 0, 0],
      [0, l2, 0],
      [0, 0, 1e-9],
    ]
    for (const s of data) {
      const f = [s.x[0], s.x[1], 1]
      const z = w0 * f[0] + w1 * f[1] + b
      const p = 1 / (1 + Math.exp(-z))
      const e = s.w * (p - s.y)
      const v = s.w * p * (1 - p)
      for (let i = 0; i < 3; i++) {
        g[i] += e * f[i]
        for (let j = 0; j < 3; j++) H[i][j] += v * f[i] * f[j]
      }
    }
    const step = solve3(H, g)
    w0 -= step[0]
    w1 -= step[1]
    b -= step[2]
    if (Math.abs(step[0]) + Math.abs(step[1]) + Math.abs(step[2]) < 1e-10) break
  }
  return { w: [w0, w1], b }
}

function solve3(A: number[][], v: number[]): number[] {
  const m = A.map((row, i) => [...row, v[i]])
  for (let c = 0; c < 3; c++) {
    let piv = c
    for (let r = c + 1; r < 3; r++) if (Math.abs(m[r][c]) > Math.abs(m[piv][c])) piv = r
    ;[m[c], m[piv]] = [m[piv], m[c]]
    for (let r = 0; r < 3; r++) {
      if (r === c) continue
      const k = m[r][c] / m[c][c]
      for (let j = c; j < 4; j++) m[r][j] -= k * m[c][j]
    }
  }
  return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]]
}

export function testMetrics(m: Model) {
  const pos = (p: Pt) => m.w[0] * p[0] + m.w[1] * p[1] + m.b >= 0
  const tp = TEST_POS.filter(pos).length
  const fn = TEST_POS.length - tp
  const fp = TEST_NEG.filter(pos).length
  const tn = TEST_NEG.length - fp
  return { tp, fp, fn, tn }
}

/** k nearest minority neighbours of each minority point (indices). */
export function nearestNeighbours(pts: Pt[], k: number): number[][] {
  return pts.map((p, i) =>
    pts
      .map((q, j) => ({ j, d: Math.hypot(p[0] - q[0], p[1] - q[1]) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, k)
      .map((o) => o.j),
  )
}

export const K_NN = 3
export const NN = nearestNeighbours(TRAIN_POS, K_NN)

/** Fixed random choices for SMOTE: for synthetic point s, which original, which neighbour, and u in [0, 1). */
const smoteRng = mulberry32(555)
export const SMOTE_PLAN = Array.from({ length: N_NEG - N_POS }, (_, s) => ({
  i: s % N_POS,
  nb: NN[s % N_POS][Math.floor(smoteRng() * K_NN)],
  u: smoteRng(),
}))

/** SMOTE points: x_i + (lam * u) (x_nb - x_i). With lamMax = 0 they sit on the originals (plain duplication). */
export function smotePoints(lamMax: number): Pt[] {
  return SMOTE_PLAN.map(({ i, nb, u }) => {
    const a = TRAIN_POS[i]
    const c = TRAIN_POS[nb]
    const l = lamMax * u
    return [a[0] + l * (c[0] - a[0]), a[1] + l * (c[1] - a[1])] as Pt
  })
}

/** Which majority points survive random undersampling (N_POS of them), for a given draw. */
export function undersampleIdx(draw: number): number[] {
  const rng = mulberry32(9000 + draw * 7919)
  const idx = Array.from({ length: N_NEG }, (_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx.slice(0, N_POS)
}

export type Remedy = 'none' | 'weights' | 'oversample' | 'smote' | 'undersample'

export function trainingSet(remedy: Remedy, lamMax: number, draw: number): Sample[] {
  const neg: Sample[] = TRAIN_NEG.map((x) => ({ x, y: 0, w: 1 }))
  const pos: Sample[] = TRAIN_POS.map((x) => ({ x, y: 1, w: 1 }))
  switch (remedy) {
    case 'none':
      return [...neg, ...pos]
    case 'weights':
      return [...neg, ...pos.map((s) => ({ ...s, w: RATIO }))]
    case 'oversample': {
      const copies: Sample[] = []
      for (let c = 0; c < RATIO; c++) copies.push(...pos)
      return [...neg, ...copies]
    }
    case 'smote':
      return [...neg, ...pos, ...smotePoints(lamMax).map((x) => ({ x, y: 1 as const, w: 1 }))]
    case 'undersample':
      return [...undersampleIdx(draw).map((i) => neg[i]), ...pos]
  }
}
