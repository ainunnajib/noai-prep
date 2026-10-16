/*
  Shared maths for this lesson's visuals: a known "true" curve, noisy samples from it, and
  least-squares polynomial fits (optionally with an L2 / ridge penalty).

  Polynomials are written in the Chebyshev basis on t = 2x - 1 (t in [-1, 1]). That spans exactly
  the same functions as 1, x, x², ..., x^d (so the fit is the same as scikit-learn's
  PolynomialFeatures + LinearRegression), but it is numerically stable up to degree 15.
  The least-squares problem is solved with Householder QR; ridge is done by appending
  sqrt(n·λ)·I rows, which minimises  mean((y - ŷ)²) + λ·‖c‖².
*/

import { mulberry32 } from '../../../../../kit'

/** the hidden pattern every dataset in this lesson is drawn from */
export const truth = (x: number) => Math.sin(2.5 * Math.PI * x)
/** standard deviation of the noise added to every label */
export const SIGMA = 0.3
/** the smallest error any model can reach on new data: the noise variance σ² */
export const NOISE_FLOOR = SIGMA * SIGMA

export type Rng = () => number

export function gaussian(rng: Rng) {
  let u = 0
  while (u === 0) u = rng()
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function makeRng(seed: number): Rng {
  return mulberry32(seed)
}

/** n points spread evenly over [0, 1] with a little jitter, labels = truth + noise */
export function sample(rng: Rng, n: number, jitter = 0.8): { x: number[]; y: number[] } {
  const x: number[] = []
  const y: number[] = []
  for (let i = 0; i < n; i++) {
    const xi = (i + 0.5 + (rng() - 0.5) * jitter) / n
    x.push(xi)
    y.push(truth(xi) + SIGMA * gaussian(rng))
  }
  return { x, y }
}

/** n points placed uniformly at random in [0, 1] */
export function sampleUniform(rng: Rng, n: number): { x: number[]; y: number[] } {
  const x: number[] = []
  const y: number[] = []
  for (let i = 0; i < n; i++) {
    const xi = rng()
    x.push(xi)
    y.push(truth(xi) + SIGMA * gaussian(rng))
  }
  return { x, y }
}

/** Chebyshev features [T0(t), T1(t), ..., Td(t)] with t = 2x - 1 */
export function features(x: number, d: number): number[] {
  const t = 2 * x - 1
  const row = [1]
  if (d >= 1) row.push(t)
  for (let k = 2; k <= d; k++) row.push(2 * t * row[k - 1] - row[k - 2])
  return row
}

/** least squares min ‖A c - b‖² by Householder QR (A is m×p with m ≥ p) */
function lstsq(A: number[][], b: number[]): number[] {
  const m = A.length
  const p = A[0].length
  const R = A.map((r) => r.slice())
  const q = b.slice()
  for (let k = 0; k < p; k++) {
    let norm = 0
    for (let i = k; i < m; i++) norm += R[i][k] * R[i][k]
    norm = Math.sqrt(norm)
    if (norm < 1e-300) continue
    const alpha = R[k][k] > 0 ? -norm : norm
    const v = new Array(m).fill(0)
    v[k] = R[k][k] - alpha
    for (let i = k + 1; i < m; i++) v[i] = R[i][k]
    let vv = 0
    for (let i = k; i < m; i++) vv += v[i] * v[i]
    if (vv < 1e-300) continue
    for (let j = k; j < p; j++) {
      let s = 0
      for (let i = k; i < m; i++) s += v[i] * R[i][j]
      const f = (2 * s) / vv
      for (let i = k; i < m; i++) R[i][j] -= f * v[i]
    }
    let s = 0
    for (let i = k; i < m; i++) s += v[i] * q[i]
    const f = (2 * s) / vv
    for (let i = k; i < m; i++) q[i] -= f * v[i]
  }
  const c = new Array(p).fill(0)
  for (let k = p - 1; k >= 0; k--) {
    let s = q[k]
    for (let j = k + 1; j < p; j++) s -= R[k][j] * c[j]
    c[k] = Math.abs(R[k][k]) < 1e-12 ? 0 : s / R[k][k]
  }
  return c
}

/**
 * Fit a degree-d polynomial by least squares. lambda > 0 adds a penalty to the mean squared error:
 *  - plain L2 (ridge):      λ·Σ c_k²
 *  - roughness = true:      λ·Σ (k² c_k)², which punishes the high, wiggly terms most
 *    (a "smoothness" penalty, like the one used by smoothing splines).
 * If there are fewer points than coefficients, a tiny ridge keeps the answer finite.
 */
export function fitPoly(x: number[], y: number[], d: number, lambda = 0, roughness = false): number[] {
  const n = x.length
  const p = d + 1
  const A = x.map((xi) => features(xi, d))
  const b = y.slice()
  const lam = lambda > 0 ? lambda : n < p ? 1e-8 : 0
  if (lam > 0) {
    const s = Math.sqrt(n * lam)
    for (let k = 0; k < p; k++) {
      const row = new Array(p).fill(0)
      row[k] = s * (roughness && lambda > 0 ? k * k : 1)
      A.push(row)
      b.push(0)
    }
  }
  return lstsq(A, b)
}

export function predict(c: number[], x: number): number {
  const f = features(x, c.length - 1)
  let s = 0
  for (let k = 0; k < c.length; k++) s += c[k] * f[k]
  return s
}

export function mse(c: number[], x: number[], y: number[]): number {
  let s = 0
  for (let i = 0; i < x.length; i++) s += (y[i] - predict(c, x[i])) ** 2
  return s / x.length
}
