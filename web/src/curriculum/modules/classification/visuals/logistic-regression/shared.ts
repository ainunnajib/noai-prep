/*
  Shared data and maths for the logistic-regression visuals.

  Running example: 12 students, hours studied (x) and whether they passed (y = 1) or failed (y = 0).
  The data are symmetric about 3 hours, so the best 50-50 point is exactly 3 hours.
  Maximum-likelihood fit (checked with scipy and scikit-learn, C = 1e6): w ≈ 2.029, b ≈ −6.088,
  mean log loss ≈ 0.3045.
*/

export type Pt = [number, number]

export const HOURS = [0.5, 1, 1.5, 2, 2.5, 2.5, 3.5, 3.5, 4, 4.5, 5, 5.5]
export const PASSED = [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1]

/** Class colours, matching the pass/fail convention used earlier in the course. */
export const POS_C = 'var(--viz-2)'
export const NEG_C = 'var(--viz-1)'

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

/** Binary cross-entropy for one example, with p clipped away from 0 and 1 so it stays finite. */
export function bce(p: number, y: number) {
  const q = Math.min(1 - 1e-12, Math.max(1e-12, p))
  return -(y * Math.log(q) + (1 - y) * Math.log(1 - q))
}

/** Mean log loss of the 1-D model p = σ(w x + b) on (xs, ys). */
export function meanLoss1D(w: number, b: number, xs = HOURS, ys = PASSED) {
  let s = 0
  for (let i = 0; i < xs.length; i++) s += bce(sigmoid(w * xs[i] + b), ys[i])
  return s / xs.length
}

/** One full-batch gradient-descent step for the 1-D model (same maths as the lesson's NumPy code). */
export function gdStep1D(w: number, b: number, lr: number, xs = HOURS, ys = PASSED): [number, number] {
  let gw = 0
  let gb = 0
  for (let i = 0; i < xs.length; i++) {
    const e = sigmoid(w * xs[i] + b) - ys[i]
    gw += e * xs[i]
    gb += e
  }
  const n = xs.length
  return [w - (lr * gw) / n, b - (lr * gb) / n]
}

/** Round to d decimals and drop trailing zeros; never prints "-0". */
export function fmt(v: number, d = 2) {
  if (!Number.isFinite(v)) return '∞'
  const r = Math.round(v * 10 ** d) / 10 ** d
  return String(Object.is(r, -0) || r === 0 ? 0 : r).replace('-', '−')
}

/** Fixed decimals with a proper minus sign, never "−0.00". */
export function fix(v: number, d = 2) {
  if (!Number.isFinite(v)) return '∞'
  const s = v.toFixed(d)
  if (/^-0\.?0*$/.test(s)) return s.slice(1)
  return s.replace('-', '−')
}

/** "+ 3" or "− 3" for writing a signed term after another term. */
export function signed(v: number, d = 2) {
  return v < 0 ? `− ${fix(-v, d)}` : `+ ${fix(v, d)}`
}

/**
 * 2-D dataset for the decision-boundary visual: 14 points per class, rounded to 1 decimal.
 * Maximum-likelihood fit (scipy BFGS): w ≈ (1.83, 1.08), b ≈ 0.33, mean log loss ≈ 0.241, 26 of 28 correct.
 */
export const POS_2D: Pt[] = [
  [2.6, 2.9], [-1.5, 0.7], [2.6, 2.5], [2.2, 2.6], [1.7, 1.5], [1.6, -0.3], [0.4, 1.3],
  [0.7, 2.4], [2.9, 3.0], [1.4, 2.5], [0.4, 0.0], [1.5, 1.2], [-0.4, -1.1], [1.8, -0.1],
]
export const NEG_2D: Pt[] = [
  [0.0, -0.4], [-1.0, -0.7], [-0.3, -1.3], [-0.2, -1.5], [-1.7, -1.7], [-0.7, -0.9], [-2.4, 1.4],
  [-1.8, -1.0], [-0.9, 1.1], [-1.6, -0.1], [-1.3, -2.6], [-0.5, 0.3], [-1.7, -0.9], [-3.1, -2.7],
]

export interface Model2D {
  w: Pt
  b: number
}

export function loss2D({ w, b }: Model2D) {
  let s = 0
  for (const [x1, x2] of POS_2D) s += bce(sigmoid(w[0] * x1 + w[1] * x2 + b), 1)
  for (const [x1, x2] of NEG_2D) s += bce(sigmoid(w[0] * x1 + w[1] * x2 + b), 0)
  return s / (POS_2D.length + NEG_2D.length)
}

export function correct2D({ w, b }: Model2D) {
  let c = 0
  for (const [x1, x2] of POS_2D) if (w[0] * x1 + w[1] * x2 + b >= 0) c++
  for (const [x1, x2] of NEG_2D) if (w[0] * x1 + w[1] * x2 + b < 0) c++
  return c
}

export function gdStep2D({ w, b }: Model2D, lr: number): Model2D {
  let g1 = 0
  let g2 = 0
  let gb = 0
  const acc = (x1: number, x2: number, y: number) => {
    const e = sigmoid(w[0] * x1 + w[1] * x2 + b) - y
    g1 += e * x1
    g2 += e * x2
    gb += e
  }
  for (const [x1, x2] of POS_2D) acc(x1, x2, 1)
  for (const [x1, x2] of NEG_2D) acc(x1, x2, 0)
  const n = POS_2D.length + NEG_2D.length
  return { w: [w[0] - (lr * g1) / n, w[1] - (lr * g2) / n], b: b - (lr * gb) / n }
}

/**
 * The part of the line a·x + c·y = d that lies inside the box [x0, x1] × [y0, y1], or null.
 * Used to draw the decision boundary and probability contours.
 */
export function clipLine(a: number, c: number, d: number, [x0, x1]: Pt, [y0, y1]: Pt): [Pt, Pt] | null {
  const pts: Pt[] = []
  const eps = 1e-9
  if (Math.abs(c) > eps) {
    for (const x of [x0, x1]) {
      const y = (d - a * x) / c
      if (y >= y0 - eps && y <= y1 + eps) pts.push([x, y])
    }
  }
  if (Math.abs(a) > eps) {
    for (const y of [y0, y1]) {
      const x = (d - c * y) / a
      if (x >= x0 - eps && x <= x1 + eps) pts.push([x, y])
    }
  }
  // remove duplicates (corners)
  const uniq: Pt[] = []
  for (const p of pts) if (!uniq.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-6)) uniq.push(p)
  if (uniq.length < 2) return null
  return [uniq[0], uniq[1]]
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
