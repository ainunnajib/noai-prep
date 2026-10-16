/*
  Small, exact 2-D models for the "boundary versus density" visual.
  - Logistic regression (discriminative): P(B | x) = sigmoid(w . x + b), fitted by Newton's method with a
    light L2 penalty on w (like scikit-learn's default), on standardised features.
  - Gaussian class model (generative): for each class a mean and a full 2x2 covariance, plus the class share.
    log p(x | k) = -1/2 (x - mu)^T S^-1 (x - mu) - 1/2 log|S| - log(2 pi)
*/

export type P2 = [number, number]

/** standard normal pair from two uniforms (Box-Muller) */
export function randn2(rng: () => number): P2 {
  const u = Math.max(1e-12, rng())
  const v = rng()
  const r = Math.sqrt(-2 * Math.log(u))
  return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)]
}

export interface Gauss2 {
  mu: P2
  /** covariance [[a, b], [b, c]] stored as [a, b, c] */
  cov: [number, number, number]
}

export function fitGauss(pts: P2[]): Gauss2 {
  const n = pts.length
  const mx = pts.reduce((s, p) => s + p[0], 0) / n
  const my = pts.reduce((s, p) => s + p[1], 0) / n
  let a = 0
  let b = 0
  let c = 0
  for (const [x, y] of pts) {
    a += (x - mx) ** 2
    b += (x - mx) * (y - my)
    c += (y - my) ** 2
  }
  // maximum-likelihood covariance (divide by n), with a tiny floor so a single point still works
  return { mu: [mx, my], cov: [a / n + 1e-3, b / n, c / n + 1e-3] }
}

export function logDensity(g: Gauss2, [x, y]: P2): number {
  const [a, b, c] = g.cov
  const det = a * c - b * b
  const dx = x - g.mu[0]
  const dy = y - g.mu[1]
  const q = (c * dx * dx - 2 * b * dx * dy + a * dy * dy) / det
  return -0.5 * q - 0.5 * Math.log(det) - Math.log(2 * Math.PI)
}

/** points on the ellipse of Mahalanobis radius r */
export function ellipse(g: Gauss2, r: number, n = 72): P2[] {
  const [a, b, c] = g.cov
  const tr = (a + c) / 2
  const d = Math.sqrt(((a - c) / 2) ** 2 + b * b)
  const l1 = tr + d
  const l2 = Math.max(1e-9, tr - d)
  const th = 0.5 * Math.atan2(2 * b, a - c)
  const out: P2[] = []
  for (let i = 0; i <= n; i++) {
    const t = (2 * Math.PI * i) / n
    const u = r * Math.sqrt(l1) * Math.cos(t)
    const v = r * Math.sqrt(l2) * Math.sin(t)
    out.push([g.mu[0] + u * Math.cos(th) - v * Math.sin(th), g.mu[1] + u * Math.sin(th) + v * Math.cos(th)])
  }
  return out
}

/** draw one point from N(mu, cov) using the Cholesky factor */
export function sampleGauss(g: Gauss2, rng: () => number): P2 {
  const [a, b, c] = g.cov
  const l11 = Math.sqrt(a)
  const l21 = b / l11
  const l22 = Math.sqrt(Math.max(1e-9, c - l21 * l21))
  const [z1, z2] = randn2(rng)
  return [g.mu[0] + l11 * z1, g.mu[1] + l21 * z1 + l22 * z2]
}

export interface Logistic {
  /** P(B | x) = sigmoid(w[0] x1 + w[1] x2 + b), in the original (unstandardised) units */
  w: P2
  b: number
}

/** labels: 0 = class A, 1 = class B */
export function fitLogistic(pts: P2[], labels: number[], lambda = 1): Logistic {
  const n = pts.length
  const m = [0, 1].map((k) => pts.reduce((s, p) => s + p[k], 0) / n)
  const s = [0, 1].map((k) => Math.sqrt(pts.reduce((acc, p) => acc + (p[k] - m[k]) ** 2, 0) / n) || 1)
  const X = pts.map((p) => [(p[0] - m[0]) / s[0], (p[1] - m[1]) / s[1], 1])
  let th = [0, 0, 0]
  for (let it = 0; it < 30; it++) {
    const g = [lambda * th[0], lambda * th[1], 0]
    const H = [
      [lambda, 0, 0],
      [0, lambda, 0],
      [0, 0, 1e-6],
    ]
    X.forEach((x, i) => {
      const z = th[0] * x[0] + th[1] * x[1] + th[2]
      const p = 1 / (1 + Math.exp(-z))
      const r = p - labels[i]
      const wgt = p * (1 - p)
      for (let a = 0; a < 3; a++) {
        g[a] += r * x[a]
        for (let b = 0; b < 3; b++) H[a][b] += wgt * x[a] * x[b]
      }
    })
    const step = solve3(H, g)
    th = th.map((v, k) => v - step[k])
    if (Math.hypot(...step) < 1e-9) break
  }
  const w: P2 = [th[0] / s[0], th[1] / s[1]]
  return { w, b: th[2] - w[0] * m[0] - w[1] * m[1] }
}

function solve3(A: number[][], y: number[]): number[] {
  const M = A.map((r, i) => [...r, y[i]])
  for (let c = 0; c < 3; c++) {
    let piv = c
    for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r
    ;[M[c], M[piv]] = [M[piv], M[c]]
    for (let r = 0; r < 3; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]
    }
  }
  return [0, 1, 2].map((i) => M[i][3] / M[i][i])
}

/** clip the rectangle [x0,x1]x[y0,y1] to the half-plane w.x + b >= level; returns the polygon */
export function halfPlane(w: P2, b: number, level: number, [x0, x1]: P2, [y0, y1]: P2, keepAbove: boolean): P2[] {
  const sgn = keepAbove ? 1 : -1
  const val = (p: P2) => sgn * (w[0] * p[0] + w[1] * p[1] + b - level)
  const poly: P2[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]
  const out: P2[] = []
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    const vp = val(p)
    const vq = val(q)
    if (vp >= 0) out.push(p)
    if (vp >= 0 !== vq >= 0) {
      const t = vp / (vp - vq)
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])])
    }
  }
  return out
}

/** the part of the line w.x + b = level inside the rectangle (null if it misses) */
export function lineInRect(w: P2, b: number, level: number, [x0, x1]: P2, [y0, y1]: P2): [P2, P2] | null {
  const pts: P2[] = []
  const f = (p: P2) => w[0] * p[0] + w[1] * p[1] + b - level
  const corners: P2[] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]
  for (let i = 0; i < 4; i++) {
    const p = corners[i]
    const q = corners[(i + 1) % 4]
    const vp = f(p)
    const vq = f(q)
    if (vp === 0) pts.push(p)
    else if (vp > 0 !== vq > 0 && vq !== 0) {
      const t = vp / (vp - vq)
      pts.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])])
    }
  }
  return pts.length >= 2 ? [pts[0], pts[1]] : null
}
