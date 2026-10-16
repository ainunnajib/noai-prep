/*
  A small, exact-enough SVM toolkit for the visuals in this lesson.

  - hardMarginLine: the maximum-margin line for separable 2-D data, found exactly by geometry
    (the widest street is fixed either by one point of each class, or by two points of one class
    and one of the other), so dragging points updates it instantly with no iterative solver.
  - smo: the soft-margin SVM dual, solved with the same SMO algorithm as libsvm (and so scikit-learn's
    SVC): second-order working-set selection, tolerance 1e-3, no shrinking. Checked against
    scikit-learn on this lesson's datasets.
*/

export type P2 = readonly [number, number]

export interface Line {
  /** normal vector (w1, w2) and offset b: the boundary is w·x + b = 0, the margins are w·x + b = ±1 */
  w: [number, number]
  b: number
}

export const margin = (l: Line) => 2 / Math.hypot(l.w[0], l.w[1])
export const fLine = (l: Line, p: P2) => l.w[0] * p[0] + l.w[1] * p[1] + l.b

/**
 * Exact hard-margin SVM in 2-D. `pos` are the +1 points, `neg` the −1 points.
 * Returns null when no straight line separates the classes.
 */
export function hardMarginLine(pos: readonly P2[], neg: readonly P2[]): { line: Line; sv: { pos: number[]; neg: number[] } } | null {
  let best: { u: [number, number]; c: number; half: number } | null = null
  // candidate: unit normal u and threshold c, half-width h, with u·x − c ≥ h for pos and ≤ −h for neg
  const consider = (ux: number, uy: number) => {
    const n = Math.hypot(ux, uy)
    if (n < 1e-12) return
    ux /= n
    uy /= n
    let minPos = Infinity
    let maxNeg = -Infinity
    for (const p of pos) minPos = Math.min(minPos, ux * p[0] + uy * p[1])
    for (const p of neg) maxNeg = Math.max(maxNeg, ux * p[0] + uy * p[1])
    const half = (minPos - maxNeg) / 2
    if (half > 1e-9 && (!best || half > best.half + 1e-12)) best = { u: [ux, uy], c: (minPos + maxNeg) / 2, half }
  }
  // the optimal normal is either the direction between a closest pos/neg pair, or perpendicular to an edge
  // joining two points of the same class; trying every such direction and keeping the widest valid street
  // gives the exact optimum
  for (const p of pos) for (const q of neg) consider(p[0] - q[0], p[1] - q[1])
  for (const S of [pos, neg])
    for (let i = 0; i < S.length; i++)
      for (let j = i + 1; j < S.length; j++) {
        const dx = S[j][0] - S[i][0]
        const dy = S[j][1] - S[i][1]
        consider(-dy, dx)
        consider(dy, -dx)
      }
  if (!best) return null
  const { u, c, half } = best as { u: [number, number]; c: number; half: number }
  // scale so the margins are at ±1: w = u / half, b = −c / half
  const line: Line = { w: [u[0] / half, u[1] / half], b: -c / half }
  const tol = 1e-6
  return {
    line,
    sv: {
      pos: pos.map((p, i) => [i, fLine(line, p)] as const).filter(([, f]) => f < 1 + tol).map(([i]) => i),
      neg: neg.map((p, i) => [i, fLine(line, p)] as const).filter(([, f]) => f > -1 - tol).map(([i]) => i),
    },
  }
}

export type Kernel = (a: P2, b: P2) => number
export const linearK: Kernel = (a, b) => a[0] * b[0] + a[1] * b[1]
export const rbfK =
  (gamma: number): Kernel =>
  (a, b) =>
    Math.exp(-gamma * ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2))

export interface SVMModel {
  /** dual coefficients α_i (0 ≤ α_i ≤ C) */
  alpha: Float64Array
  /** bias: f(x) = Σ α_i y_i K(x_i, x) + b */
  b: number
  X: readonly P2[]
  y: readonly number[]
  kernel: Kernel
  C: number
  iterations: number
}

/** Soft-margin SVM by SMO (libsvm's algorithm). y must be ±1. */
export function smo(X: readonly P2[], y: readonly number[], C: number, kernel: Kernel, eps = 1e-3, maxIter = 200000): SVMModel {
  const n = X.length
  const K = new Float64Array(n * n)
  for (let i = 0; i < n; i++)
    for (let j = i; j < n; j++) {
      const v = kernel(X[i], X[j])
      K[i * n + j] = v
      K[j * n + i] = v
    }
  const Q = (i: number, j: number) => y[i] * y[j] * K[i * n + j]
  const alpha = new Float64Array(n)
  const G = new Float64Array(n).fill(-1)
  const TAU = 1e-12
  const upper = (t: number) => alpha[t] >= C
  const lower = (t: number) => alpha[t] <= 0
  let iter = 0
  for (; iter < maxIter; iter++) {
    // working set selection (WSS3 of Fan, Chen and Lin, 2005)
    let Gmax = -Infinity
    let Gmax2 = -Infinity
    let i = -1
    let j = -1
    let objMin = Infinity
    for (let t = 0; t < n; t++) {
      if (y[t] === 1) {
        if (!upper(t) && -G[t] >= Gmax) {
          Gmax = -G[t]
          i = t
        }
      } else if (!lower(t) && G[t] >= Gmax) {
        Gmax = G[t]
        i = t
      }
    }
    if (i < 0) break
    for (let t = 0; t < n; t++) {
      if (y[t] === 1) {
        if (!lower(t)) {
          const gd = Gmax + G[t]
          if (G[t] >= Gmax2) Gmax2 = G[t]
          if (gd > 0) {
            const quad = K[i * n + i] + K[t * n + t] - 2 * y[i] * Q(i, t)
            const obj = -(gd * gd) / (quad > 0 ? quad : TAU)
            if (obj <= objMin) {
              j = t
              objMin = obj
            }
          }
        }
      } else if (!upper(t)) {
        const gd = Gmax - G[t]
        if (-G[t] >= Gmax2) Gmax2 = -G[t]
        if (gd > 0) {
          const quad = K[i * n + i] + K[t * n + t] + 2 * y[i] * Q(i, t)
          const obj = -(gd * gd) / (quad > 0 ? quad : TAU)
          if (obj <= objMin) {
            j = t
            objMin = obj
          }
        }
      }
    }
    if (Gmax + Gmax2 < eps || j < 0) break

    const ai = alpha[i]
    const aj = alpha[j]
    if (y[i] !== y[j]) {
      let quad = K[i * n + i] + K[j * n + j] + 2 * Q(i, j)
      if (quad <= 0) quad = TAU
      const delta = (-G[i] - G[j]) / quad
      const diff = alpha[i] - alpha[j]
      alpha[i] += delta
      alpha[j] += delta
      if (diff > 0) {
        if (alpha[j] < 0) {
          alpha[j] = 0
          alpha[i] = diff
        }
      } else if (alpha[i] < 0) {
        alpha[i] = 0
        alpha[j] = -diff
      }
      if (diff > 0) {
        if (alpha[i] > C) {
          alpha[i] = C
          alpha[j] = C - diff
        }
      } else if (alpha[j] > C) {
        alpha[j] = C
        alpha[i] = C + diff
      }
    } else {
      let quad = K[i * n + i] + K[j * n + j] - 2 * Q(i, j)
      if (quad <= 0) quad = TAU
      const delta = (G[i] - G[j]) / quad
      const sum = alpha[i] + alpha[j]
      alpha[i] -= delta
      alpha[j] += delta
      if (sum > C) {
        if (alpha[i] > C) {
          alpha[i] = C
          alpha[j] = sum - C
        }
      } else if (alpha[j] < 0) {
        alpha[j] = 0
        alpha[i] = sum
      }
      if (sum > C) {
        if (alpha[j] > C) {
          alpha[j] = C
          alpha[i] = sum - C
        }
      } else if (alpha[i] < 0) {
        alpha[i] = 0
        alpha[j] = sum
      }
    }
    const dai = alpha[i] - ai
    const daj = alpha[j] - aj
    for (let t = 0; t < n; t++) G[t] += Q(t, i) * dai + Q(t, j) * daj
  }
  // bias (libsvm's calculate_rho), b = −ρ
  let ub = Infinity
  let lb = -Infinity
  let nFree = 0
  let sumFree = 0
  for (let t = 0; t < n; t++) {
    const yG = y[t] * G[t]
    if (upper(t)) {
      if (y[t] === -1) ub = Math.min(ub, yG)
      else lb = Math.max(lb, yG)
    } else if (lower(t)) {
      if (y[t] === 1) ub = Math.min(ub, yG)
      else lb = Math.max(lb, yG)
    } else {
      nFree++
      sumFree += yG
    }
  }
  const rho = nFree > 0 ? sumFree / nFree : (ub + lb) / 2
  return { alpha, b: -rho, X, y, kernel, C, iterations: iter }
}

/** decision value f(x) = Σ α_i y_i K(x_i, x) + b */
export function decision(m: SVMModel, p: P2): number {
  let s = m.b
  for (let i = 0; i < m.X.length; i++) if (m.alpha[i] > 0) s += m.alpha[i] * m.y[i] * m.kernel(m.X[i], p)
  return s
}

/** For a linear kernel: w = Σ α_i y_i x_i */
export function linearW(m: SVMModel): Line {
  let w0 = 0
  let w1 = 0
  for (let i = 0; i < m.X.length; i++) {
    w0 += m.alpha[i] * m.y[i] * m.X[i][0]
    w1 += m.alpha[i] * m.y[i] * m.X[i][1]
  }
  return { w: [w0, w1], b: m.b }
}

/** indices of the support vectors (α_i > 0) */
export const supportIdx = (m: SVMModel) => Array.from(m.alpha.keys()).filter((i) => m.alpha[i] > 1e-9)
