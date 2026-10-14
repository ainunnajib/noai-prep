import { mulberry32 } from '../../../../../kit'

/*
  A real (tiny) training run, computed in the browser.
  Model: linear regression  y_hat = w1*x1 + w2*x2 + b, trained with mini-batch SGD on mean squared error.
  Data: 200 examples, x1 ~ N(0, 1), x2 ~ N(0, 2^2), y = x1 - 0.25*x2 + noise (sd 0.5).
  x2 is spread wider than x1, so the loss bowl is steeper in the w2 direction: that steep direction is
  what makes large learning rates overshoot, bounce and finally blow up.
  Everything is deterministic (seeded), so a given setting always gives the same curve.
*/

export const N_DATA = 200

export interface ToyData {
  x1: number[]
  x2: number[]
  y: number[]
}

function gaussian(r: () => number) {
  const u = Math.max(r(), 1e-12)
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

let cached: ToyData | null = null

export function toyData(): ToyData {
  if (cached) return cached
  const r = mulberry32(2027)
  const x1: number[] = []
  const x2: number[] = []
  const y: number[] = []
  for (let i = 0; i < N_DATA; i++) {
    const a = gaussian(r)
    const b = 2 * gaussian(r)
    x1.push(a)
    x2.push(b)
    y.push(a - 0.25 * b + 0.5 * gaussian(r))
  }
  cached = { x1, x2, y }
  return cached
}

export interface Run {
  /** loss on the whole training set: index 0 = before training, index s = after step s */
  full: number[]
  /** loss of the mini-batch used at step s (computed before that step's update), index 0 = step 1 */
  batch: number[]
  /** first step at which the loss became non-finite or exceeded 1e6 (training stopped there), else null */
  divergedAt: number | null
}

const LIMIT = 1e6

/** Train from w = (0, 0, 0) for `steps` mini-batch SGD steps. Shuffles every epoch with a fixed seed. */
export function trainToy(lr: number, batchSize: number, steps: number, seed = 7): Run {
  const { x1, x2, y } = toyData()
  const n = N_DATA
  const r = mulberry32(seed)
  let w1 = 0
  let w2 = 0
  let b = 0
  const fullLoss = () => {
    let s = 0
    for (let i = 0; i < n; i++) {
      const e = w1 * x1[i] + w2 * x2[i] + b - y[i]
      s += e * e
    }
    return s / n
  }
  const order = Array.from({ length: n }, (_, i) => i)
  const reshuffle = () => {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1))
      const t = order[i]
      order[i] = order[j]
      order[j] = t
    }
  }
  reshuffle()
  let p = 0
  const full = [fullLoss()]
  const batch: number[] = []
  let divergedAt: number | null = null
  for (let s = 1; s <= steps; s++) {
    if (p + batchSize > n) {
      reshuffle()
      p = 0
    }
    let g1 = 0
    let g2 = 0
    let gb = 0
    let bl = 0
    for (let k = p; k < p + batchSize; k++) {
      const i = order[k]
      const e = w1 * x1[i] + w2 * x2[i] + b - y[i]
      bl += e * e
      g1 += e * x1[i]
      g2 += e * x2[i]
      gb += e
    }
    p += batchSize
    // gradient of the batch MSE: (2/B) * sum(e * x)
    const c = 2 / batchSize
    w1 -= lr * c * g1
    w2 -= lr * c * g2
    b -= lr * c * gb
    batch.push(bl / batchSize)
    const L = fullLoss()
    if (!Number.isFinite(L) || L > LIMIT) {
      full.push(Infinity)
      divergedAt = s
      break
    }
    full.push(L)
  }
  return { full, batch, divergedAt }
}

/** Exponential moving average, as in TensorBoard's smoothing slider: s_t = beta*s_{t-1} + (1-beta)*x_t, s_0 = x_0. */
export function ema(xs: number[], beta: number): number[] {
  const out: number[] = []
  let s = xs[0] ?? 0
  for (const x of xs) {
    if (!Number.isFinite(x)) {
      out.push(Infinity)
      continue
    }
    s = beta * s + (1 - beta) * x
    out.push(s)
  }
  return out
}

/** The best possible loss for this data (least-squares fit), for reference lines. */
export function bestLoss(): number {
  const { x1, x2, y } = toyData()
  const n = N_DATA
  // normal equations for [x1, x2, 1]
  const A = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  const v = [0, 0, 0]
  for (let i = 0; i < n; i++) {
    const row = [x1[i], x2[i], 1]
    for (let a = 0; a < 3; a++) {
      v[a] += row[a] * y[i]
      for (let c = 0; c < 3; c++) A[a][c] += row[a] * row[c]
    }
  }
  // solve 3x3 by Cramer's rule
  const det = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  const D = det(A)
  const sol = [0, 1, 2].map((k) => det(A.map((row, i) => row.map((val, j) => (j === k ? v[i] : val)))) / D)
  let s = 0
  for (let i = 0; i < n; i++) {
    const e = sol[0] * x1[i] + sol[1] * x2[i] + sol[2] - y[i]
    s += e * e
  }
  return s / n
}
