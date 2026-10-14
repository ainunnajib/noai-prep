/*
  Learning curves, computed for real: for each training-set size n, draw R random training sets,
  fit the model, and record the training error and the validation error, i.e. the expected error
  on fresh data: σ² + mean((ŷ(x) − truth(x))²) over a fine grid of x. (A finite validation set
  would estimate this same number, with some extra noise.) The typical (median) value over the R
  runs is reported, which stays readable even when a very flexible model blows up on a few tiny
  datasets.
*/

import { makeRng, sample, fitPoly, mse, predict, truth, NOISE_FLOOR } from './polyfit'

export interface CurvePoint {
  n: number
  train: number
  val: number
}

const median = (a: number[]) => {
  const s = a.slice().sort((p, q) => p - q)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

const GRID = Array.from({ length: 200 }, (_, i) => (i + 0.5) / 200)
const TRUE_ON_GRID = GRID.map(truth)

/** expected squared error on a fresh point: noise + squared distance from the truth */
function freshError(c: number[]) {
  let s = 0
  GRID.forEach((x, i) => (s += (predict(c, x) - TRUE_ON_GRID[i]) ** 2))
  return NOISE_FLOOR + s / GRID.length
}

/** training-set sizes from 16 to nMax, roughly evenly spaced on a log scale */
export function sizes(nMax: number, count = 9): number[] {
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    const n = Math.round(16 * Math.pow(nMax / 16, i / (count - 1)))
    if (!out.includes(n)) out.push(n)
  }
  return out
}

export function learningCurve(degree: number, lambda: number, nMax: number, runs = 60): CurvePoint[] {
  return sizes(nMax).map((n) => {
    const rng = makeRng(9000 + n * 31 + degree)
    const tr: number[] = []
    const va: number[] = []
    for (let r = 0; r < runs; r++) {
      const d = sample(rng, n)
      const c = fitPoly(d.x, d.y, degree, lambda, true)
      tr.push(mse(c, d.x, d.y))
      va.push(freshError(c))
    }
    return { n, train: median(tr), val: median(va) }
  })
}

export type Diagnosis = 'bias' | 'variance' | 'good'

/** read the right-hand end of the curves the way the lesson teaches */
export function diagnose(c: CurvePoint[]): Diagnosis {
  const last = c[c.length - 1]
  if (last.train > NOISE_FLOOR + 0.05) return 'bias'
  if (last.val - last.train > 0.045) return 'variance'
  return 'good'
}
