/*
  Small 2×2 helpers for the eigenvector visuals (also used by "Covariance, PCA and SVD").
  Matrices are stored by rows: [[a, b], [c, d]].
*/

export type V2 = [number, number]
export type M2 = [[number, number], [number, number]]

export const apply = (m: M2, p: V2): V2 => [m[0][0] * p[0] + m[0][1] * p[1], m[1][0] * p[0] + m[1][1] * p[1]]
export const det = (m: M2) => m[0][0] * m[1][1] - m[0][1] * m[1][0]
export const trace = (m: M2) => m[0][0] + m[1][1]
export const norm = (p: V2) => Math.hypot(p[0], p[1])
export const unit = (p: V2): V2 => {
  const n = norm(p)
  return n < 1e-12 ? [1, 0] : [p[0] / n, p[1] / n]
}
export const dot = (p: V2, q: V2) => p[0] * q[0] + p[1] * q[1]
export const cross = (p: V2, q: V2) => p[0] * q[1] - p[1] * q[0]
export const scale = (p: V2, k: number): V2 => [p[0] * k, p[1] * k]
export const dirV = (deg: number): V2 => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)]
export const angleOf = (p: V2) => (Math.atan2(p[1], p[0]) * 180) / Math.PI
export const transpose = (m: M2): M2 => [
  [m[0][0], m[1][0]],
  [m[0][1], m[1][1]],
]
export const mul = (A: M2, B: M2): M2 => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
]
export const rot = (deg: number): M2 => {
  const [c, s] = dirV(deg)
  return [
    [c, -s],
    [s, c],
  ]
}
export const diag = (p: number, q: number): M2 => [
  [p, 0],
  [0, q],
]
/** Symmetric matrix with eigenvalue l1 along the direction at angle `deg` and l2 perpendicular to it. */
export const symFromEig = (l1: number, l2: number, deg: number): M2 => mul(mul(rot(deg), diag(l1, l2)), rot(-deg))

/** Smallest difference between two directions, treating a line and its reverse as the same (0..90°). */
export const lineGap = (a: number, b: number) => {
  let d = Math.abs(a - b) % 180
  if (d > 90) d = 180 - d
  return d
}

export type Eig =
  | { kind: 'two'; l1: number; l2: number; v1: V2; v2: V2 }
  | { kind: 'one'; l: number; v: V2 }
  | { kind: 'all'; l: number }
  | { kind: 'complex'; re: number; im: number }

/**
 * Eigenvalues and unit eigenvectors of a real 2×2 matrix.
 * Roots of λ² − (trace)λ + det = 0; l1 is the one with the larger absolute value.
 */
export function eig2(m: M2, eps = 1e-9): Eig {
  const [[a, b], [c, d]] = m
  const half = (a + d) / 2
  const disc = half * half - (a * d - b * c)
  if (disc < -eps) return { kind: 'complex', re: half, im: Math.sqrt(-disc) }
  const r = Math.sqrt(Math.max(0, disc))
  const vecFor = (l: number): V2 => {
    const x1: V2 = [b, l - a]
    const x2: V2 = [l - d, c]
    const p = norm(x1) >= norm(x2) ? x1 : x2
    if (norm(p) < 1e-9) return [1, 0]
    const u = unit(p)
    // make the direction point "rightwards" (or up) so labels are stable
    return u[0] < -1e-9 || (Math.abs(u[0]) <= 1e-9 && u[1] < 0) ? [-u[0], -u[1]] : u
  }
  if (r < 1e-7) {
    if (Math.abs(b) < 1e-9 && Math.abs(c) < 1e-9 && Math.abs(a - d) < 1e-9) return { kind: 'all', l: half }
    return { kind: 'one', l: half, v: vecFor(half) }
  }
  let l1 = half + r
  let l2 = half - r
  if (Math.abs(l2) > Math.abs(l1)) [l1, l2] = [l2, l1]
  return { kind: 'two', l1, l2, v1: vecFor(l1), v2: vecFor(l2) }
}

/** Display a number: integers plain, otherwise up to `dp` decimals; typographic minus; no "−0". */
export function fmt(v: number, dp = 2): string {
  const p = 10 ** dp
  let r = Math.round(v * p) / p
  if (Math.abs(r) < 0.5 / p) r = 0
  return String(r).replace('-', '−')
}
/** Fixed decimals with a typographic minus. */
export function fix(v: number, dp = 2): string {
  let r = v
  if (Math.abs(r) < 0.5 * 10 ** -dp) r = 0
  return r.toFixed(dp).replace('-', '−')
}
export const fmtV = (p: V2, dp = 2) => `(${fmt(p[0], dp)}, ${fmt(p[1], dp)})`

/** Points of the image of the unit circle under m (an ellipse, or a segment if m is singular). */
export function imageOfCircle(m: M2, n = 96): V2[] {
  return Array.from({ length: n + 1 }, (_, i) => apply(m, dirV((360 * i) / n)))
}
