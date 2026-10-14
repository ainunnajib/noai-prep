import { mulberry32 } from '../../../../../kit'

/*
  Shared toy problem for this lesson's visuals: fit a straight line y = w·x + b to N = 200 points
  with the mean-squared-error loss
      L(w, b) = (1/N) Σ (w·xᵢ + b − yᵢ)²
  The loss is a quadratic bowl in (w, b), so its contour lines are exact ellipses.
*/

export const N = 200
export const LR = 0.1
export const START: [number, number] = [-1.5, 2]

export interface RegData {
  x: number[]
  y: number[]
  /** best (w, b) */
  opt: [number, number]
  /** loss at the best (w, b) */
  lmin: number
  /** Hessian of L (constant for a quadratic): [[hww, hwb], [hwb, hbb]] */
  h: [number, number, number]
}

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-12)
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

let cache: RegData | null = null

export function regData(): RegData {
  if (cache) return cache
  const r = mulberry32(7)
  const x: number[] = []
  const y: number[] = []
  for (let i = 0; i < N; i++) x.push(-1 + 3 * r())
  for (let i = 0; i < N; i++) y.push(1.2 * x[i] - 0.3 + 0.5 * gauss(r))
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (let i = 0; i < N; i++) {
    sx += x[i]
    sy += y[i]
    sxx += x[i] * x[i]
    sxy += x[i] * y[i]
  }
  const mx = sx / N
  const my = sy / N
  const w = (sxy / N - mx * my) / (sxx / N - mx * mx)
  const b = my - w * mx
  const d: RegData = { x, y, opt: [w, b], lmin: 0, h: [(2 * sxx) / N, (2 * sx) / N, 2] }
  d.lmin = loss(d, w, b)
  cache = d
  return d
}

export function loss(d: RegData, w: number, b: number) {
  let s = 0
  for (let i = 0; i < d.x.length; i++) {
    const e = w * d.x[i] + b - d.y[i]
    s += e * e
  }
  return s / d.x.length
}

/** gradient of the loss on one example */
export function exampleGrad(d: RegData, i: number, w: number, b: number): [number, number] {
  const e = 2 * (w * d.x[i] + b - d.y[i])
  return [e * d.x[i], e]
}

/** average gradient over a list of example indices (null = the whole dataset) */
export function batchGrad(d: RegData, idx: number[] | null, w: number, b: number): [number, number] {
  let gw = 0
  let gb = 0
  const n = idx ? idx.length : d.x.length
  for (let k = 0; k < n; k++) {
    const i = idx ? idx[k] : k
    const g = exampleGrad(d, i, w, b)
    gw += g[0]
    gb += g[1]
  }
  return [gw / n, gb / n]
}

/** points on the contour L = lmin + delta (an ellipse, because L is quadratic) */
export function contour(d: RegData, delta: number, n = 72): [number, number][] {
  const [a, c, e] = d.h
  // eigen-decomposition of the 2×2 matrix H/2 = [[a, c], [c, e]] / 2
  const tr = (a + e) / 2
  const det = (a * e - c * c) / 4
  const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det))
  const l1 = tr / 2 + disc
  const l2 = tr / 2 - disc
  const ang = 0.5 * Math.atan2(2 * c, a - e)
  const ux = Math.cos(ang)
  const uy = Math.sin(ang)
  const r1 = Math.sqrt(delta / l1)
  const r2 = Math.sqrt(delta / l2)
  const pts: [number, number][] = []
  for (let k = 0; k <= n; k++) {
    const t = (k / n) * 2 * Math.PI
    const p = r1 * Math.cos(t)
    const q = r2 * Math.sin(t)
    pts.push([d.opt[0] + p * ux - q * uy, d.opt[1] + p * uy + q * ux])
  }
  return pts
}

/** Fisher–Yates shuffle of 0..n-1 with a seeded generator */
export function permutation(n: number, r: () => number) {
  const p = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    const t = p[i]
    p[i] = p[j]
    p[j] = t
  }
  return p
}
