/*
  The 2025 Task 1 data and every gradient-descent variant the lesson's visuals run.
  Each function mirrors the Python shown next to it, line for line, so the outputs on screen
  are computed, not typed in. Checked against NumPy (see the lesson's verification notes).
*/

export const X: number[][] = [
  [2, 2],
  [2, 4],
  [2, 6],
]
export const Y: number[] = [2, 4, 6]
export const ALPHA = 0.01
export const ITERS = 1000
export const EXPECTED = [0.003, 0.9987]

export const matVec = (A: number[][], v: number[]) => A.map((row) => row.reduce((s, a, j) => s + a * v[j], 0))
export const transpose = (A: number[][]) => A[0].map((_, j) => A.map((row) => row[j]))
export const sub = (a: number[], b: number[]) => a.map((v, i) => v - b[i])

/** cost J = 1/(2m) * sum(errors^2), the cost whose gradient is the task's update rule */
export function cost(theta: number[], Xm: number[][] = X, y: number[] = Y): number {
  const e = sub(matVec(Xm, theta), y)
  return e.reduce((s, v) => s + v * v, 0) / (2 * y.length)
}

export interface Trace {
  thetas: number[][]
  losses: number[]
}

/** The correct, vectorised batch update. Records θ and J after every iteration (index 0 = start). */
export function runGD(alpha: number, iterations: number, start?: number[], Xm: number[][] = X, y: number[] = Y): Trace {
  const m = Xm.length
  const n = Xm[0].length
  const XT = transpose(Xm)
  let theta = start ? [...start] : new Array(n).fill(0)
  const thetas = [theta]
  const losses = [cost(theta, Xm, y)]
  for (let k = 0; k < iterations; k++) {
    const errors = sub(matVec(Xm, theta), y)
    const grad = matVec(XT, errors).map((g) => g / m)
    theta = theta.map((t, j) => t - alpha * grad[j])
    thetas.push(theta)
    losses.push(cost(theta, Xm, y))
  }
  return { thetas, losses }
}

/* ---------------- the common mistakes ---------------- */

export type MistakeId = 'none' | 'sequential' | 'sum' | 'shape' | 'noreturn' | 'early' | 'extracol' | 'ones' | 'noround'

export interface MistakeResult {
  /** final θ (before any rounding), when the function returns numbers */
  value?: number[]
  /** what the function returns after its own rounding */
  returned?: number[]
  /** text shown instead of an array */
  error?: string
  none?: boolean
  /** θ path in the (θ0, θ1) plane, when it lives there */
  path?: number[][]
  /** a 2-D θ (the shape bug) */
  matrix?: number[][]
}

const r4 = (v: number) => {
  const r = Math.round(v * 1e4) / 1e4
  return r === 0 && v < 0 ? -0 : r
}

export function runMistake(id: MistakeId, alpha = ALPHA, iterations = ITERS): MistakeResult {
  const m = X.length
  const n = 2
  const XT = transpose(X)
  if (id === 'shape') {
    // theta = np.zeros((n, 1)): X @ theta is (3, 1); minus y (3,) broadcasts to (3, 3),
    // so theta silently becomes (2, 3): three separate fits, one per value of y
    let T: number[][] = [[0], [0]]
    for (let k = 0; k < iterations; k++) {
      const P = X.map((row) => T[0].map((_, c) => row[0] * T[0][c] + row[1] * T[1][c])) // (3, cols)
      const cols = Math.max(P[0].length, Y.length)
      const E = P.map((row) => Array.from({ length: cols }, (_, c) => row[row.length === 1 ? 0 : c] - Y[c])) // (3, 3)
      const G = [0, 1].map((j) => Array.from({ length: cols }, (_, c) => X.reduce((s2, row, i) => s2 + row[j] * E[i][c], 0) / m)) // (2, 3)
      T = [0, 1].map((j) => Array.from({ length: cols }, (_, c) => T[j][T[j].length === 1 ? 0 : c] - alpha * G[j][c]))
    }
    return { matrix: T.map((row) => row.map(r4)) }
  }
  if (id === 'extracol') {
    const X1 = X.map((row) => [1, ...row])
    const t = runGD(alpha, iterations, undefined, X1, Y)
    const th = t.thetas[t.thetas.length - 1]
    return { value: th, returned: th.map(r4) }
  }
  let theta = id === 'ones' ? [1, 1] : [0, 0]
  const path = [theta]
  for (let k = 0; k < iterations; k++) {
    if (id === 'sequential') {
      const t = [...theta]
      for (let j = 0; j < n; j++) {
        const errors = sub(matVec(X, t), Y) // recomputed with the θ0 just changed
        const g = errors.reduce((s, e, i) => s + e * X[i][j], 0)
        t[j] -= (alpha * g) / m
      }
      theta = t
    } else {
      const errors = sub(matVec(X, theta), Y)
      const raw = matVec(XT, errors)
      const grad = id === 'sum' ? raw : raw.map((g) => g / m)
      theta = theta.map((t, j) => t - alpha * grad[j])
      if (id === 'early') theta = theta.map(r4)
    }
    path.push(theta)
  }
  if (id === 'noreturn') return { none: true, value: theta, path }
  if (id === 'noround') return { value: theta, returned: theta, path }
  return { value: theta, returned: theta.map(r4), path }
}

/* ---------------- geometry of the cost bowl ---------------- */

/** H = XᵀX / m, so J(θ) = ½ (θ − θ*)ᵀ H (θ − θ*) with θ* = (0, 1) for the exam data. */
export const THETA_STAR = [0, 1]
export const H = (() => {
  const XT = transpose(X)
  return XT.map((r) => XT.map((c) => r.reduce((s, a, i) => s + a * c[i], 0) / X.length))
})()

/** eigenvalues (ascending) and unit eigenvectors of the symmetric 2×2 matrix H */
export const EIG = (() => {
  const [[a, b], [, d]] = H
  const tr = a + d
  const det = a * d - b * b
  const disc = Math.sqrt((tr * tr) / 4 - det)
  const l1 = tr / 2 - disc
  const l2 = tr / 2 + disc
  const vec = (l: number) => {
    const v = [b, l - a]
    const len = Math.hypot(v[0], v[1])
    return [v[0] / len, v[1] / len]
  }
  return { l1, l2, v1: vec(l1), v2: vec(l2) }
})()

/** points of the level set J = c (an ellipse around θ*) */
export function levelSet(c: number, samples = 120): [number, number][] {
  const a = Math.sqrt((2 * c) / EIG.l1)
  const b = Math.sqrt((2 * c) / EIG.l2)
  const pts: [number, number][] = []
  for (let i = 0; i <= samples; i++) {
    const t = (2 * Math.PI * i) / samples
    const u = a * Math.cos(t)
    const w = b * Math.sin(t)
    pts.push([THETA_STAR[0] + u * EIG.v1[0] + w * EIG.v2[0], THETA_STAR[1] + u * EIG.v1[1] + w * EIG.v2[1]])
  }
  return pts
}

/** clip a path where it leaves a sane box (a diverging run reaches 1e85) */
export function saneBox(path: number[][], lim = 50): [number, number][] {
  const out: [number, number][] = []
  for (const p of path) {
    if (!p.every((v) => Number.isFinite(v) && Math.abs(v) < lim)) {
      out.push([Math.max(-lim, Math.min(lim, p[0])), Math.max(-lim, Math.min(lim, p[1]))])
      break
    }
    out.push([p[0], p[1]])
  }
  return out
}

/** short number for tables: up to 4 decimals, trailing zeros removed */
export function short(v: number, d = 4): string {
  if (!Number.isFinite(v)) return String(v)
  const s = v.toFixed(d).replace(/\.?0+$/, '')
  return s === '-0' ? '0' : s
}
