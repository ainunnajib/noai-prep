/*
  Algorithms for the hierarchical / DBSCAN / spectral visuals (DBSCAN itself lives in ../k-means/clustering).
  - agglomerative clustering with single, complete or average linkage (naive, fine for ~20 points)
  - symmetric eigen-decomposition by the cyclic Jacobi method (fine for ~100 x 100)
  - graph Laplacian helpers for spectral clustering
*/
import { dist, type Pt } from '../k-means/clustering'

export type Linkage = 'single' | 'complete' | 'average'

export interface Merge {
  /** node ids of the two merged clusters (leaves are 0..n-1, merge m creates node n + m) */
  a: number
  b: number
  height: number
  /** point indices in the new cluster */
  members: number[]
  /** the pair of points (one from each side) that defines the linkage distance: closest for single, farthest for complete */
  pair: [number, number]
}

/** distance between two clusters under a linkage, plus the defining pair of points */
export function linkageDistance(points: Pt[], A: number[], B: number[], linkage: Linkage): { d: number; pair: [number, number] } {
  let best = linkage === 'complete' ? -Infinity : Infinity
  let pair: [number, number] = [A[0], B[0]]
  let sum = 0
  for (const i of A)
    for (const j of B) {
      const d = dist(points[i], points[j])
      sum += d
      if ((linkage === 'complete' && d > best) || (linkage !== 'complete' && d < best)) {
        best = d
        pair = [i, j]
      }
    }
  if (linkage === 'average') return { d: sum / (A.length * B.length), pair }
  return { d: best, pair }
}

/** agglomerative clustering: start with singletons, repeatedly merge the two closest clusters */
export function agglomerate(points: Pt[], linkage: Linkage): Merge[] {
  const n = points.length
  let active: { id: number; members: number[] }[] = points.map((_, i) => ({ id: i, members: [i] }))
  const merges: Merge[] = []
  while (active.length > 1) {
    let bi = 0
    let bj = 1
    let bd = Infinity
    let bp: [number, number] = [0, 0]
    for (let i = 0; i < active.length; i++)
      for (let j = i + 1; j < active.length; j++) {
        const { d, pair } = linkageDistance(points, active[i].members, active[j].members, linkage)
        if (d < bd - 1e-12) {
          bd = d
          bi = i
          bj = j
          bp = pair
        }
      }
    const A = active[bi]
    const B = active[bj]
    const members = A.members.concat(B.members)
    merges.push({ a: A.id, b: B.id, height: bd, members, pair: bp })
    active = active.filter((_, k) => k !== bi && k !== bj)
    active.push({ id: n + merges.length - 1, members })
  }
  return merges
}

/** left-to-right order of the leaves in the dendrogram (depth-first from the root) */
export function leafOrder(n: number, merges: Merge[]): number[] {
  const out: number[] = []
  const walk = (id: number) => {
    if (id < n) {
      out.push(id)
      return
    }
    const m = merges[id - n]
    walk(m.a)
    walk(m.b)
  }
  walk(n + merges.length - 1)
  return out
}

/** cluster label of every point when the tree is cut at height h (labels numbered left to right in leaf order) */
export function cutTree(n: number, merges: Merge[], h: number, order: number[]): number[] {
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const m of merges) {
    if (m.height > h) break
    const r = find(m.members[0])
    for (const p of m.members) parent[find(p)] = r
  }
  const labelOfRoot = new Map<number, number>()
  const labels = new Array(n).fill(0)
  for (const i of order) {
    const r = find(i)
    if (!labelOfRoot.has(r)) labelOfRoot.set(r, labelOfRoot.size)
    labels[i] = labelOfRoot.get(r)!
  }
  return labels
}

/* ----------------------------------------------------------------------------- linear algebra */

/**
 * Eigen-decomposition of a symmetric matrix by cyclic Jacobi rotations (flat typed arrays for speed).
 * Returns eigenvalues in ascending order and the matching unit eigenvectors (vectors[k] is the k-th).
 */
export function eigSym(M: number[][], maxSweeps = 50): { values: number[]; vectors: number[][]; sweeps: number } {
  const n = M.length
  const a = new Float64Array(n * n)
  const v = new Float64Array(n * n)
  let scale = 0
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      a[i * n + j] = M[i][j]
      scale += M[i][j] * M[i][j]
    }
  for (let i = 0; i < n; i++) v[i * n + i] = 1
  const tol = 1e-26 * Math.max(scale, 1e-300)
  let sweeps = 0
  for (; sweeps < maxSweeps; sweeps++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p * n + q] * a[p * n + q]
    if (off <= tol) break
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q]
        if (apq * apq <= tol / (n * n)) continue
        const theta = (a[q * n + q] - a[p * n + p]) / (2 * apq)
        const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c
        // columns p and q
        for (let k = 0; k < n; k++) {
          const kp = k * n + p
          const kq = k * n + q
          const akp = a[kp]
          const akq = a[kq]
          a[kp] = c * akp - s * akq
          a[kq] = s * akp + c * akq
        }
        // rows p and q
        const rp = p * n
        const rq = q * n
        for (let k = 0; k < n; k++) {
          const apk = a[rp + k]
          const aqk = a[rq + k]
          a[rp + k] = c * apk - s * aqk
          a[rq + k] = s * apk + c * aqk
        }
        for (let k = 0; k < n; k++) {
          const kp = k * n + p
          const kq = k * n + q
          const vkp = v[kp]
          const vkq = v[kq]
          v[kp] = c * vkp - s * vkq
          v[kq] = s * vkp + c * vkq
        }
      }
  }
  const idx = Array.from({ length: n }, (_, i) => i).sort((i, j) => a[i * n + i] - a[j * n + j])
  return {
    values: idx.map((i) => a[i * n + i]),
    vectors: idx.map((i) => Array.from({ length: n }, (_, k) => v[k * n + i])),
    sweeps,
  }
}

/** unnormalised graph Laplacian L = D - W of a symmetric weight matrix */
export function laplacian(W: number[][]): number[][] {
  return W.map((row, i) => row.map((w, j) => (i === j ? row.reduce((s, x, k) => s + (k === i ? 0 : x), 0) : -w)))
}

/** number of connected pieces of a graph with weight matrix W (edges where w > 0) */
export function components(W: number[][]): number[] {
  const n = W.length
  const comp = new Array(n).fill(-1)
  let c = 0
  for (let s = 0; s < n; s++) {
    if (comp[s] >= 0) continue
    const stack = [s]
    comp[s] = c
    while (stack.length) {
      const u = stack.pop()!
      for (let v = 0; v < n; v++)
        if (v !== u && W[u][v] > 0 && comp[v] < 0) {
          comp[v] = c
          stack.push(v)
        }
    }
    c++
  }
  return comp
}

/**
 * Spectrum of a graph Laplacian L plus its Fiedler vector (the eigenvector of the second-smallest
 * eigenvalue, taken orthogonal to the constant vector, which always has eigenvalue 0).
 * Trick: S = L + c * 11^T / n moves the constant direction to eigenvalue c (larger than every other
 * eigenvalue) and leaves all other eigenpairs unchanged, so ONE eigen-decomposition gives everything.
 * The sign is fixed so that the entry at `anchor` is >= 0 (so it does not flip while a slider moves).
 */
export function spectrum(L: number[][], anchor = 0): { values: number[]; fiedlerValue: number; fiedler: number[] } {
  const n = L.length
  const c = 2 * Math.max(1, ...L.map((r, i) => r[i])) + 1
  const S = L.map((row) => row.map((x) => x + c / n))
  const { values, vectors } = eigSym(S)
  let ci = 0
  let best = -1
  vectors.forEach((v, k) => {
    const s = Math.abs(v.reduce((a, b) => a + b, 0))
    if (s > best) {
      best = s
      ci = k
    }
  })
  const rest = values.map((v, k) => ({ v, vec: vectors[k] })).filter((_, k) => k !== ci)
  let vec = rest[0].vec
  if (vec[anchor] < 0) vec = vec.map((x) => -x)
  return { values: [0, ...rest.map((r) => Math.max(0, r.v))], fiedlerValue: Math.max(0, rest[0].v), fiedler: vec }
}

/** best split of 1-D values into two groups (exact 2-means on a line): returns the threshold */
export function twoMeansThreshold(vals: number[]): number {
  const s = vals.slice().sort((a, b) => a - b)
  const n = s.length
  if (n < 2) return s[0] ?? 0
  const pre = [0]
  const pre2 = [0]
  for (const v of s) {
    pre.push(pre[pre.length - 1] + v)
    pre2.push(pre2[pre2.length - 1] + v * v)
  }
  const sse = (i: number, j: number) => {
    const m = j - i
    const sum = pre[j] - pre[i]
    return pre2[j] - pre2[i] - (sum * sum) / m
  }
  let best = Infinity
  let cut = 1
  for (let k = 1; k < n; k++) {
    const c = sse(0, k) + sse(k, n)
    if (c < best) {
      best = c
      cut = k
    }
  }
  return (s[cut - 1] + s[cut]) / 2
}
