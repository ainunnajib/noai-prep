/*
  Shared data and maths for the least-squares visuals.
  The running example: five Grab rides, distance x (km) and fare y ($).
  Least-squares line: ŷ = 1.5x + 1.5, MSE 0.3 (checked with numpy.polyfit).
*/

export type Pt = [number, number]

export const RIDES: Pt[] = [
  [1, 3],
  [2, 4],
  [3, 7],
  [4, 7],
  [5, 9],
]

/** Least-squares slope and intercept for one feature (falls back to a flat line if all x are equal). */
export function fitLS(pts: Pt[]): { w: number; b: number } {
  const n = pts.length
  const mx = pts.reduce((s, p) => s + p[0], 0) / n
  const my = pts.reduce((s, p) => s + p[1], 0) / n
  let sxy = 0
  let sxx = 0
  for (const [x, y] of pts) {
    sxy += (x - mx) * (y - my)
    sxx += (x - mx) * (x - mx)
  }
  const w = sxx > 1e-12 ? sxy / sxx : 0
  return { w, b: my - w * mx }
}

/** Sum of squared residuals for the line ŷ = w x + b. */
export function sse(pts: Pt[], w: number, b: number) {
  return pts.reduce((s, [x, y]) => s + (y - (w * x + b)) ** 2, 0)
}

export function mse(pts: Pt[], w: number, b: number) {
  return sse(pts, w, b) / pts.length
}

/** Round to d decimals and drop trailing zeros; never prints "-0". */
export function fmt(v: number, d = 2) {
  if (!Number.isFinite(v)) return '∞'
  const r = Math.round(v * 10 ** d) / 10 ** d
  return String(Object.is(r, -0) || r === 0 ? 0 : r)
}

/** Fixed number of decimals, never "-0.00". */
export function fix(v: number, d = 2) {
  const s = v.toFixed(d)
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s
}

/** Text for the line, e.g. "ŷ = 1.5x + 1.5" or "ŷ = 2x − 0.4". */
export function lineText(w: number, b: number, d = 2) {
  const bs = Math.abs(b) < 0.5 * 10 ** -d ? '' : b < 0 ? ` − ${fmt(-b, d)}` : ` + ${fmt(b, d)}`
  return `ŷ = ${fmt(w, d)}x${bs}`
}

/**
 * Points on the contour  Δᵀ A Δ = c  around `centre`, where A = [[a, h], [h, d]] is symmetric
 * positive definite. For MSE(w, b) = MSE_min + Δᵀ A Δ, these are exact level curves.
 */
export function ellipse(a: number, h: number, d: number, centre: Pt, c: number, n = 120): Pt[] {
  const tr = (a + d) / 2
  const disc = Math.sqrt(((a - d) / 2) ** 2 + h * h)
  const l1 = tr + disc
  const l2 = tr - disc
  // eigenvector for l1
  let v1: Pt = Math.abs(h) > 1e-12 ? [h, l1 - a] : a >= d ? [1, 0] : [0, 1]
  const n1 = Math.hypot(v1[0], v1[1])
  v1 = [v1[0] / n1, v1[1] / n1]
  const v2: Pt = [-v1[1], v1[0]]
  const r1 = Math.sqrt(c / l1)
  const r2 = Math.sqrt(c / l2)
  const out: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 2 * Math.PI
    const p = r1 * Math.cos(t)
    const q = r2 * Math.sin(t)
    out.push([centre[0] + p * v1[0] + q * v2[0], centre[1] + p * v1[1] + q * v2[1]])
  }
  return out
}

/** The quadratic-form matrix A of MSE(w, b) for one feature: [[mean(x²), mean(x)], [mean(x), 1]]. */
export function mseForm(pts: Pt[]) {
  const n = pts.length
  const mx = pts.reduce((s, p) => s + p[0], 0) / n
  const mxx = pts.reduce((s, p) => s + p[0] * p[0], 0) / n
  return { a: mxx, h: mx, d: 1 }
}

/**
 * Where to draw the two handles of a line ŷ = w x + b that the learner drags. Normally they sit
 * at x = xl and x = xr; if the line leaves the y-range there, the handle slides along the line to
 * where it meets the top or bottom edge (inset by `pad`), so it stays on the line and on the plot.
 */
export function lineHandles(w: number, b: number, xl: number, xr: number, [y0, y1]: [number, number], pad = 0.3): [Pt, Pt] {
  const lo = y0 + pad
  const hi = y1 - pad
  const place = (xe: number): Pt => {
    const ye = w * xe + b
    if (ye >= lo && ye <= hi) return [xe, ye]
    const yc = ye > hi ? hi : lo
    const xc = Math.abs(w) > 1e-9 ? (yc - b) / w : xe
    const x = Math.max(xl, Math.min(xr, xc))
    return [x, Math.max(lo, Math.min(hi, w * x + b))]
  }
  return [place(xl), place(xr)]
}

/** The line through two points (falls back to a flat line through p if they share an x). */
export function lineThrough(p: Pt, q: Pt): { w: number; b: number } {
  const dx = q[0] - p[0]
  const w = Math.abs(dx) > 1e-9 ? (q[1] - p[1]) / dx : 0
  return { w, b: p[1] - w * p[0] }
}
