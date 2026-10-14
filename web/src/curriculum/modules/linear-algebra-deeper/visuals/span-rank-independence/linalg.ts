/* Small general-size linear-algebra helpers for the rank and conditioning visuals. */

export type Mat = number[][]

export const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0)
export const norm = (a: number[]) => Math.sqrt(dot(a, a))
export const columns = (M: Mat): number[][] => M[0].map((_, j) => M.map((row) => row[j]))
export const matVec = (M: Mat, x: number[]) => M.map((row) => dot(row, x))

/** Rank by Gaussian elimination with partial pivoting and a tolerance relative to the largest entry. */
export function rankOf(M: Mat): number {
  const A = M.map((r) => r.slice())
  const m = A.length
  const n = A[0]?.length ?? 0
  const scale = Math.max(1, ...A.flat().map(Math.abs))
  const tol = 1e-9 * scale
  let r = 0
  for (let c = 0; c < n && r < m; c++) {
    let piv = r
    for (let i = r + 1; i < m; i++) if (Math.abs(A[i][c]) > Math.abs(A[piv][c])) piv = i
    if (Math.abs(A[piv][c]) < tol) continue
    ;[A[r], A[piv]] = [A[piv], A[r]]
    for (let i = r + 1; i < m; i++) {
      const f = A[i][c] / A[r][c]
      for (let j = c; j < n; j++) A[i][j] -= f * A[r][j]
    }
    r++
  }
  return r
}

/** Orthonormal basis of the span of some vectors (Gram–Schmidt, skipping dependent ones). */
export function orthoBasis(vecs: number[][]): number[][] {
  const B: number[][] = []
  for (const v of vecs) {
    let w = v.slice()
    for (const b of B) {
      const d = dot(w, b)
      w = w.map((x, i) => x - d * b[i])
    }
    const nw = norm(w)
    if (nw > 1e-7 * Math.max(1, norm(v))) B.push(w.map((x) => x / nw))
  }
  return B
}

export function det(M: Mat): number {
  if (M.length === 2) return M[0][0] * M[1][1] - M[0][1] * M[1][0]
  if (M.length === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = M
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)
  }
  return NaN
}

/** Singular values of a 2×2 matrix, largest first (closed form via the eigenvalues of AᵀA). */
export function singular2(M: Mat): [number, number] {
  const [[a, b], [c, d]] = M
  const p = a * a + c * c // (AᵀA)11
  const q = b * b + d * d // (AᵀA)22
  const r = a * b + c * d // (AᵀA)12
  const mean = (p + q) / 2
  const rad = Math.sqrt(((p - q) / 2) ** 2 + r * r)
  return [Math.sqrt(Math.max(0, mean + rad)), Math.sqrt(Math.max(0, mean - rad))]
}

/** Orthographic view of 3-D points: turn by `az` about the vertical z-axis, then tilt by `el`. */
export function makeProj(azDeg: number, elDeg: number) {
  const az = (azDeg * Math.PI) / 180
  const el = (elDeg * Math.PI) / 180
  const ca = Math.cos(az)
  const sa = Math.sin(az)
  const ce = Math.cos(el)
  const se = Math.sin(el)
  return (p: number[]): [number, number] => {
    const [x, y, z] = p
    const x1 = x * ca - y * sa
    const y1 = x * sa + y * ca // depth: larger = further away, drawn higher
    return [x1, z * ce + y1 * se]
  }
}
