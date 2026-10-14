/*
  Shared maths and helpers for the perceptron visuals.
  Convention used throughout the lesson: step(z) = 1 if z > 0, otherwise 0 (so z = 0 gives 0).
  Colours follow the classification module: class 1 = orange circles, class 0 = blue squares.
*/

export type Pt = [number, number]

export const POS_C = 'var(--viz-2)'
export const NEG_C = 'var(--viz-1)'
export const W_C = 'var(--viz-4)'

export const step = (z: number) => (z > 0 ? 1 : 0)

/** Fixed decimals with a proper minus sign; never prints "−0.0". */
export function fix(v: number, d = 1) {
  if (!Number.isFinite(v)) return '∞'
  const s = v.toFixed(d)
  if (/^-0\.?0*$/.test(s)) return s.slice(1)
  return s.replace('-', '−')
}

/** Shortest form: 1.50 -> "1.5", 2.00 -> "2", with a proper minus sign. */
export function num(v: number, d = 2) {
  const r = Math.round(v * 10 ** d) / 10 ** d
  if (r === 0) return '0'
  return String(r).replace('-', '−')
}

/** Like num() but with an ASCII hyphen, for use inside KaTeX strings. */
export const tnum = (v: number, d = 2) => num(v, d).replace('−', '-')

/** Wrap negatives in brackets for KaTeX products like 2 \times (-3). */
export const tparen = (v: number, d = 2) => (v < 0 ? `(${tnum(v, d)})` : tnum(v, d))

/** Wrap negatives in brackets for products like 2 × (−3). */
export const paren = (v: number, d = 2) => (v < 0 ? `(${num(v, d)})` : num(v, d))

/** "+ 3" or "− 3" for writing a signed term after another term. */
export const signed = (v: number, d = 2) => (v < 0 ? `− ${num(-v, d)}` : `+ ${num(v, d)}`)

/**
 * Segment of the line a·x + b·y + c = 0 inside the box [x0,x1] × [y0,y1], or null if it misses
 * the box (or a = b = 0).
 */
export function clipLine(a: number, b: number, c: number, [x0, x1]: Pt, [y0, y1]: Pt): [Pt, Pt] | null {
  const pts: Pt[] = []
  const push = (p: Pt) => {
    if (p[0] < x0 - 1e-9 || p[0] > x1 + 1e-9 || p[1] < y0 - 1e-9 || p[1] > y1 + 1e-9) return
    if (pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-9)) return
    pts.push(p)
  }
  if (Math.abs(b) > 1e-12) {
    push([x0, -(a * x0 + c) / b])
    push([x1, -(a * x1 + c) / b])
  }
  if (Math.abs(a) > 1e-12) {
    push([-(b * y0 + c) / a, y0])
    push([-(b * y1 + c) / a, y1])
  }
  if (pts.length < 2) return null
  return [pts[0], pts[1]]
}

/** Clip a convex polygon to the half-plane sign·(a·x + b·y + c) ≥ 0 (one Sutherland–Hodgman step). */
export function clipPoly(poly: Pt[], a: number, b: number, c: number, sign: 1 | -1): Pt[] {
  const f = (p: Pt) => sign * (a * p[0] + b * p[1] + c)
  const out: Pt[] = []
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i]
    const Q = poly[(i + 1) % poly.length]
    const fp = f(P)
    const fq = f(Q)
    if (fp >= 0) out.push(P)
    if ((fp >= 0) !== (fq >= 0)) {
      const t = fp / (fp - fq)
      out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])])
    }
  }
  return out
}

/** The rectangle [x0,x1] × [y0,y1] as a polygon. */
export const boxPoly = ([x0, x1]: Pt, [y0, y1]: Pt): Pt[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
]

/** The part of the box where a·x + b·y + c > 0 (sign = 1) or ≤ 0 (sign = −1), as a polygon. */
export function halfPlane(a: number, b: number, c: number, xr: Pt, yr: Pt, sign: 1 | -1): Pt[] {
  return clipPoly(boxPoly(xr, yr), a, b, c, sign)
}

/** Foot of the perpendicular from point p onto the line w·x + b = 0 (w ≠ 0). */
export function foot(w: Pt, b: number, p: Pt): Pt {
  const ww = w[0] * w[0] + w[1] * w[1]
  const z = w[0] * p[0] + w[1] * p[1] + b
  return [p[0] - (z * w[0]) / ww, p[1] - (z * w[1]) / ww]
}
