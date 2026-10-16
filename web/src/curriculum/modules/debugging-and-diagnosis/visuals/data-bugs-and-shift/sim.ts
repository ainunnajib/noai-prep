/*
  Small deterministic simulation helpers for this lesson's visuals.
  Everything is seeded with mulberry32, so every learner sees the same numbers.
*/
import { mulberry32 } from '../../../../../kit'

/** Standard normal sampler built on a seeded uniform generator (Box–Muller). */
export function gaussian(rnd: () => number): () => number {
  return () => {
    const u = Math.max(1e-12, rnd())
    const v = rnd()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
}

export function seeded(seed: number) {
  const rnd = mulberry32(seed)
  return { rnd, gauss: gaussian(rnd) }
}

export interface LogReg {
  w: [number, number]
  b: number
}

/** Plain batch gradient descent on the logistic (cross-entropy) loss, 2 features. */
export function fitLogReg(X: [number, number][], y: number[], iters = 600, lr = 0.5): LogReg {
  let w0 = 0
  let w1 = 0
  let b = 0
  const n = X.length
  for (let t = 0; t < iters; t++) {
    let g0 = 0
    let g1 = 0
    let gb = 0
    for (let i = 0; i < n; i++) {
      const z = w0 * X[i][0] + w1 * X[i][1] + b
      const p = 1 / (1 + Math.exp(-z))
      const e = p - y[i]
      g0 += e * X[i][0]
      g1 += e * X[i][1]
      gb += e
    }
    w0 -= (lr * g0) / n
    w1 -= (lr * g1) / n
    b -= (lr * gb) / n
  }
  return { w: [w0, w1], b }
}

export function predict(m: LogReg, x: [number, number]): number {
  return m.w[0] * x[0] + m.w[1] * x[1] + m.b > 0 ? 1 : 0
}

export function accuracy(m: LogReg, X: [number, number][], y: number[]): number {
  if (!X.length) return NaN
  let c = 0
  for (let i = 0; i < X.length; i++) if (predict(m, X[i]) === y[i]) c++
  return c / X.length
}

export const pct = (v: number) => `${Math.round(v * 100)}%`
