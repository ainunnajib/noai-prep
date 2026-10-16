/*
  Tiny dense linear-algebra helpers for the visuals in this module (small matrices only).
  Matrices are arrays of rows: A[i][j] is row i, column j.
*/

export type Mat = number[][]
export type Vec = number[]

export const transpose = (A: Mat): Mat => (A.length ? A[0].map((_, j) => A.map((r) => r[j])) : [])

export const matmul = (A: Mat, B: Mat): Mat => A.map((r) => B[0].map((_, j) => r.reduce((s, a, k) => s + a * B[k][j], 0)))

export const matvec = (A: Mat, v: Vec): Vec => A.map((r) => r.reduce((s, a, j) => s + a * v[j], 0))

export const dot = (a: Vec, b: Vec) => a.reduce((s, v, i) => s + v * b[i], 0)

export const mean = (v: Vec) => v.reduce((s, x) => s + x, 0) / v.length

export const mse = (pred: Vec, y: Vec) => mean(pred.map((p, i) => (p - y[i]) ** 2))

/** Gaussian elimination with partial pivoting. Returns null when A is singular (to a relative tolerance). */
export function solve(A: Mat, b: Vec, relTol = 1e-10): Vec | null {
  const n = A.length
  const M = A.map((r, i) => [...r, b[i]])
  const scale = Math.max(1e-300, ...A.flat().map(Math.abs))
  for (let k = 0; k < n; k++) {
    let p = k
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i
    if (Math.abs(M[p][k]) <= relTol * scale) return null
    ;[M[k], M[p]] = [M[p], M[k]]
    for (let i = k + 1; i < n; i++) {
      const f = M[i][k] / M[k][k]
      for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j]
    }
  }
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n]
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]
    x[i] = s / M[i][i]
  }
  return x
}

/** Determinant by elimination (exactly 0 when a pivot vanishes to tolerance). */
export function det(A: Mat, relTol = 1e-10): number {
  const n = A.length
  const M = A.map((r) => r.slice())
  const scale = Math.max(1e-300, ...A.flat().map(Math.abs))
  let d = 1
  for (let k = 0; k < n; k++) {
    let p = k
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i
    if (Math.abs(M[p][k]) <= relTol * scale) return 0
    if (p !== k) {
      ;[M[k], M[p]] = [M[p], M[k]]
      d = -d
    }
    d *= M[k][k]
    for (let i = k + 1; i < n; i++) {
      const f = M[i][k] / M[k][k]
      for (let j = k; j < n; j++) M[i][j] -= f * M[k][j]
    }
  }
  return d
}

/** Eigen-decomposition of a small symmetric matrix by cyclic Jacobi rotations. */
export function symEig(S: Mat): { values: Vec; vectors: Mat } {
  const n = S.length
  const A = S.map((r) => r.slice())
  const V: Mat = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] ** 2
    if (off < 1e-22) break
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-300) continue
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q])
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c
        for (let k = 0; k < n; k++) {
          const akp = A[k][p]
          const akq = A[k][q]
          A[k][p] = c * akp - s * akq
          A[k][q] = s * akp + c * akq
        }
        for (let k = 0; k < n; k++) {
          const apk = A[p][k]
          const aqk = A[q][k]
          A[p][k] = c * apk - s * aqk
          A[q][k] = s * apk + c * aqk
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k][p]
          const vkq = V[k][q]
          V[k][p] = c * vkp - s * vkq
          V[k][q] = s * vkp + c * vkq
        }
      }
    }
  }
  return { values: A.map((r, i) => r[i]), vectors: V }
}

/**
 * Minimum-norm least-squares solution w = pinv(X) y, computed as pinv(XᵀX) Xᵀy with the
 * eigen-decomposition of XᵀX (eigenvalues below tolerance are treated as zero).
 */
export function pinvSolve(X: Mat, y: Vec): Vec {
  const Xt = transpose(X)
  const G = matmul(Xt, X)
  const g = matvec(Xt, y)
  const { values, vectors } = symEig(G)
  const top = Math.max(...values.map(Math.abs), 1e-300)
  const d = G.length
  const w = new Array(d).fill(0)
  values.forEach((lam, k) => {
    if (Math.abs(lam) <= 1e-10 * top) return
    const vk = vectors.map((r) => r[k])
    const c = dot(vk, g) / lam
    for (let i = 0; i < d; i++) w[i] += c * vk[i]
  })
  return w
}

/** Numerical rank of a small matrix (via eigenvalues of AᵀA). */
export function rank(A: Mat): number {
  const { values } = symEig(matmul(transpose(A), A))
  const top = Math.max(...values.map(Math.abs), 1e-300)
  return values.filter((v) => Math.abs(v) > 1e-10 * top).length
}

/**
 * Least squares min ‖Aw − b‖ for a tall, full-column-rank A, by Householder QR.
 * More accurate than the normal equation for badly conditioned problems (high-degree polynomials).
 */
export function lstsq(A: Mat, b: Vec): Vec {
  const m = A.length
  const n = A[0].length
  const R = A.map((r) => r.slice())
  const y = b.slice()
  for (let k = 0; k < n; k++) {
    let norm = 0
    for (let i = k; i < m; i++) norm += R[i][k] ** 2
    norm = Math.sqrt(norm)
    if (norm === 0) continue
    const alpha = R[k][k] > 0 ? -norm : norm
    const v = new Array(m).fill(0)
    for (let i = k; i < m; i++) v[i] = R[i][k]
    v[k] -= alpha
    let vv = 0
    for (let i = k; i < m; i++) vv += v[i] ** 2
    if (vv === 0) continue
    for (let j = k; j < n; j++) {
      let s = 0
      for (let i = k; i < m; i++) s += v[i] * R[i][j]
      const f = (2 * s) / vv
      for (let i = k; i < m; i++) R[i][j] -= f * v[i]
    }
    let s = 0
    for (let i = k; i < m; i++) s += v[i] * y[i]
    const f = (2 * s) / vv
    for (let i = k; i < m; i++) y[i] -= f * v[i]
  }
  const w = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i]
    for (let j = i + 1; j < n; j++) s -= R[i][j] * w[j]
    w[i] = s / R[i][i]
  }
  return w
}

/** Polynomial feature row [1, x, x², …, x^degree]. */
export const polyRow = (x: number, degree: number): Vec => Array.from({ length: degree + 1 }, (_, k) => x ** k)

export const polyEval = (w: Vec, x: number) => w.reduce((s, wk, k) => s + wk * x ** k, 0)

/**
 * Ridge fit of a polynomial: minimise  MSE + λ·(w₁² + … + w_D²)  (the constant w₀ is not penalised).
 * Solved stably as an augmented least-squares problem: [X; √(nλ)·D] w ≈ [y; 0].
 */
export function ridgePoly(xs: Vec, ys: Vec, degree: number, lambda: number): Vec {
  const X = xs.map((x) => polyRow(x, degree))
  if (lambda <= 0) return lstsq(X, ys)
  const n = xs.length
  const s = Math.sqrt(n * lambda)
  const extra: Mat = Array.from({ length: degree }, (_, i) => Array.from({ length: degree + 1 }, (_, j) => (j === i + 1 ? s : 0)))
  return lstsq([...X, ...extra], [...ys, ...new Array(degree).fill(0)])
}
