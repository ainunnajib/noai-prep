/*
  A toy problem for data-parallel training: linear regression with 4 features, n = 4096 examples.
  Features have different spreads (1.2, 0.6, 0.25, 0.1), so the loss surface is a long, narrow valley
  and plain SGD needs many steps: a good stand-in for "training takes several epochs".
  True weights w* = (1, −2, 3, −4), noise standard deviation 0.5. Loss = ½ · mean squared error.

  Data-parallel SGD with N GPUs and b examples per GPU computes the same update as one GPU with a
  batch of B = N·b (the all-reduce averages the N slice gradients, and equal slices make that average
  exactly the gradient of the whole batch), so we simulate it as mini-batch SGD with batch B.
  We report the excess loss L(w) − L(w_best) after each epoch, where w_best is the least-squares fit.
*/

export const NS = 4096
export const D = 4
const SCALES = [1.2, 0.6, 0.25, 0.1]
const WSTAR = [1, -2, 3, -4]
export const BASE_B = 32
export const BASE_LR = 0.05
export const EPOCHS = 20

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

function makeData() {
  const r = rng(2024)
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(1e-12, r()))) * Math.cos(2 * Math.PI * r())
  const X = new Float64Array(NS * D)
  const y = new Float64Array(NS)
  for (let i = 0; i < NS; i++) {
    let s = 0
    for (let j = 0; j < D; j++) {
      const v = normal() * SCALES[j]
      X[i * D + j] = v
      s += v * WSTAR[j]
    }
    y[i] = s + 0.5 * normal()
  }
  return { X, y }
}

export const DATA = makeData()

function lossOf(w: number[]) {
  const { X, y } = DATA
  let s = 0
  for (let i = 0; i < NS; i++) {
    let p = 0
    for (let j = 0; j < D; j++) p += X[i * D + j] * w[j]
    const e = p - y[i]
    s += e * e
  }
  return (0.5 * s) / NS
}

/** least-squares solution via the normal equations (XᵀX) w = Xᵀy, solved by Gaussian elimination */
function bestFit() {
  const { X, y } = DATA
  const A = Array.from({ length: D }, () => Array(D + 1).fill(0))
  for (let i = 0; i < NS; i++)
    for (let j = 0; j < D; j++) {
      for (let k = 0; k < D; k++) A[j][k] += X[i * D + j] * X[i * D + k]
      A[j][D] += X[i * D + j] * y[i]
    }
  for (let c = 0; c < D; c++) {
    let p = c
    for (let r = c + 1; r < D; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
    ;[A[c], A[p]] = [A[p], A[c]]
    for (let r = 0; r < D; r++) {
      if (r === c) continue
      const f = A[r][c] / A[c][c]
      for (let k = c; k <= D; k++) A[r][k] -= f * A[c][k]
    }
  }
  return A.map((row, j) => row[D] / A[j][j])
}

export const L_BEST = lossOf(bestFit())

/** Excess loss after each epoch (index 0 = before training). Infinity once training has blown up. */
export function trainCurve(B: number, lr: number, seed = 1): number[] {
  const { X, y } = DATA
  const r = rng(seed)
  const w = [0, 0, 0, 0]
  const out = [lossOf(w) - L_BEST]
  const idx = Array.from({ length: NS }, (_, i) => i)
  let dead = false
  for (let e = 0; e < EPOCHS; e++) {
    if (dead) {
      out.push(Infinity)
      continue
    }
    for (let i = NS - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    for (let s = 0; s < NS; s += B) {
      const g = [0, 0, 0, 0]
      const m = Math.min(B, NS - s)
      for (let q = s; q < s + m; q++) {
        const i = idx[q]
        let p = 0
        for (let j = 0; j < D; j++) p += X[i * D + j] * w[j]
        const err = p - y[i]
        for (let j = 0; j < D; j++) g[j] += X[i * D + j] * err
      }
      for (let j = 0; j < D; j++) w[j] -= (lr * g[j]) / m
    }
    const L = lossOf(w) - L_BEST
    if (!Number.isFinite(L) || L > 1e6) {
      dead = true
      out.push(Infinity)
    } else out.push(L)
  }
  return out
}

/** Gradient of the loss w.r.t. w₂ (the second weight) at w = 0 for each of N equal slices of the first batch. */
export function sliceGradients(N: number, b: number): number[] {
  const { X, y } = DATA
  const out: number[] = []
  for (let k = 0; k < N; k++) {
    let g = 0
    for (let q = k * b; q < (k + 1) * b; q++) g += X[q * D + 1] * (0 - y[q])
    out.push(g / b)
  }
  return out
}
