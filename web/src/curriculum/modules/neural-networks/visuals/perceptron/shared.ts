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

function distToSegment(q: Pt, a: Pt, b: Pt) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const L = dx * dx + dy * dy
  const t = L > 0 ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L)) : 0
  return Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy)
}

/**
 * Where to draw the weight-vector arrow: it starts on the boundary w·x + b = 0 and points along w.
 * Starting from the foot nearest `centre`, slide the start along the line until the arrow and its
 * label (placed just beyond the tip) keep at least `clear` (data units) from every point in `avoid`
 * and the label keeps `clear / 2` from the axes x = 0 and y = 0 (when `axes` is set). Returns null if
 * the line misses the box or w = 0.
 */
export function placeWArrow(
  w: Pt,
  b: number,
  xr: Pt,
  yr: Pt,
  opts: { len: number; centre: Pt; avoid: Pt[]; clear: number; labelGap: number; axes?: boolean },
): { from: Pt; to: Pt; label: Pt } | null {
  const wl = Math.hypot(w[0], w[1])
  if (wl < 1e-9) return null
  const u: Pt = [w[0] / wl, w[1] / wl]
  const along: Pt = [-u[1], u[0]]
  const f0 = foot(w, b, opts.centre)
  const span = xr[1] - xr[0]
  const inset = 0.04 * span
  const inside = (p: Pt) => p[0] > xr[0] + inset && p[0] < xr[1] - inset && p[1] > yr[0] + inset && p[1] < yr[1] - inset
  let best: { from: Pt; to: Pt; label: Pt } | null = null
  let bestScore = -Infinity
  for (let k = 0; k <= 18; k++) {
    const s = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.05 * span
    const from: Pt = [f0[0] + s * along[0], f0[1] + s * along[1]]
    const to: Pt = [from[0] + opts.len * u[0], from[1] + opts.len * u[1]]
    const label: Pt = [to[0] + opts.labelGap * u[0], to[1] + opts.labelGap * u[1]]
    if (!inside(from) || !inside(to) || !inside(label)) continue
    let room = Infinity
    for (const q of opts.avoid) room = Math.min(room, distToSegment(q, from, to), Math.hypot(q[0] - label[0], q[1] - label[1]))
    if (opts.axes) room = Math.min(room, 2 * Math.abs(label[0]), 2 * Math.abs(label[1]))
    if (room >= opts.clear) return { from, to, label }
    if (room > bestScore) {
      bestScore = room
      best = { from, to, label }
    }
  }
  return best
}
