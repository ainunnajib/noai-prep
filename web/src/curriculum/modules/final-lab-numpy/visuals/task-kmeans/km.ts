/*
  k-means helpers for the 2025 Task 2 visuals. Each function mirrors the Python shown in the
  lesson (loop version, vectorised version, and the traced reference solution), so every number
  on screen is computed. Checked against the Python versions on the exam data, a 1-D, a 3-D and an
  empty-cluster case.
*/
import { mulberry32 } from '../../../../../kit'

export type Pt = number[]

export const EXAM_POINTS: Pt[] = [
  [2, 4],
  [2, 8],
  [2, 10],
  [10, 2],
  [10, 4],
  [10, 0],
]
export const EXAM_INIT: Pt[] = [
  [2, 2],
  [10, 1],
]
export const PRACTICE_INIT: Pt[] = [
  [2, 4],
  [2, 8],
]

export const dist = (a: Pt, b: Pt) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))

/** NumPy's argmin: the first NaN wins if there is one, otherwise the first smallest value. */
export function npArgmin(v: number[]): number {
  const nan = v.findIndex((x) => Number.isNaN(x))
  if (nan >= 0) return nan
  let best = 0
  for (let i = 1; i < v.length; i++) if (v[i] < v[best]) best = i
  return best
}

/** np.allclose(a, b) with the default rtol = 1e-5, atol = 1e-8 (NaN is never close) */
export function allclose(a: Pt[], b: Pt[]): boolean {
  return a.every((p, i) => p.every((v, j) => Math.abs(v - b[i][j]) <= 1e-8 + 1e-5 * Math.abs(b[i][j])))
}

const mean = (pts: Pt[]): Pt => pts[0].map((_, j) => pts.reduce((s, p) => s + p[j], 0) / pts.length)

export interface Frame {
  /** centroids used for this iteration's assignment */
  before: Pt[]
  /** distance from each point to each centroid, [point][centroid] */
  d: number[][]
  labels: number[]
  /** centroids after the update */
  after: Pt[]
  /** how far each centroid moved */
  moves: number[]
  empty: number[]
  /** the stopping test passed after this iteration */
  stop: boolean
}

/**
 * The reference solution traced: assign, update (empty cluster keeps its old centroid, or becomes
 * NaN with emptyRule 'nan'), stop when max move <= tol (tol = 'allclose' uses np.allclose).
 */
export function traceKMeans(points: Pt[], init: Pt[], maxIter: number, opts: { tol?: number | 'allclose'; emptyRule?: 'keep' | 'nan' } = {}): Frame[] {
  const tol = opts.tol ?? 'allclose'
  const emptyRule = opts.emptyRule ?? 'keep'
  let C = init.map((c) => [...c])
  const frames: Frame[] = []
  for (let it = 0; it < maxIter; it++) {
    const d = points.map((p) => C.map((c) => dist(p, c)))
    const labels = d.map(npArgmin)
    const empty: number[] = []
    const after = C.map((c, i) => {
      const members = points.filter((_, k) => labels[k] === i)
      if (members.length === 0) {
        empty.push(i)
        return emptyRule === 'keep' ? [...c] : c.map(() => NaN)
      }
      return mean(members)
    })
    const moves = after.map((c, i) => dist(c, C[i]))
    const stop = tol === 'allclose' ? allclose(after, C) : moves.every((m) => m <= tol)
    frames.push({ before: C, d, labels, after, moves, empty, stop })
    if (stop) break
    C = after
  }
  return frames
}

/** k_means_loops: pure Python lists, exact == as the stopping test */
export function kmLoops(points: Pt[], init: Pt[], maxIter: number): Pt[] {
  let centroids = init.map((c) => c.map(Number))
  for (let it = 0; it < maxIter; it++) {
    const clusters: Pt[][] = centroids.map(() => [])
    for (const p of points) {
      const d = centroids.map((c) => dist(p, c))
      clusters[d.indexOf(Math.min(...d))].push(p)
    }
    const next = clusters.map((members, i) => (members.length ? members[0].map((_, j) => members.reduce((s, q) => s + q[j], 0) / members.length) : centroids[i]))
    if (next.every((c, i) => c.every((v, j) => v === centroids[i][j]))) break
    centroids = next
  }
  return centroids
}

/** k_means_vectorised: distance matrix by broadcasting, argmin(axis=1), boolean masks, np.allclose */
export function kmVectorised(points: Pt[], init: Pt[], maxIter: number): { centroids: Pt[]; firstD: number[][]; firstLabels: number[] } {
  let C = init.map((c) => c.map(Number))
  let firstD: number[][] = []
  let firstLabels: number[] = []
  for (let it = 0; it < maxIter; it++) {
    const D = points.map((p) => C.map((c) => Math.sqrt(p.reduce((s, v, j) => s + (v - c[j]) ** 2, 0))))
    const labels = D.map(npArgmin)
    if (it === 0) {
      firstD = D
      firstLabels = labels
    }
    const next = C.map((c, i) => {
      const mask = labels.map((l) => l === i)
      return mask.some(Boolean) ? mean(points.filter((_, k) => mask[k])) : c
    })
    if (allclose(next, C)) break
    C = next
  }
  return { centroids: C, firstD, firstLabels }
}

/** round each coordinate to 4 d.p., as round(float(v), 4) does */
export const round4 = (c: Pt[]): Pt[] => c.map((p) => p.map((v) => (Number.isNaN(v) ? NaN : Math.round(v * 1e4) / 1e4)))

/** three Gaussian blobs, deterministic for a given seed */
export function blobs(seed = 7, perBlob = 14): Pt[] {
  const rng = mulberry32(seed)
  const centres = [
    [2.6, 3],
    [8.2, 3.4],
    [5.2, 8.4],
  ]
  const gauss = () => {
    const u = Math.max(1e-9, rng())
    const v = rng()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const pts: Pt[] = []
  for (const [cx, cy] of centres)
    for (let i = 0; i < perBlob; i++) {
      const x = Math.min(10.7, Math.max(0.3, cx + 0.95 * gauss()))
      const y = Math.min(10.7, Math.max(0.3, cy + 0.95 * gauss()))
      pts.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100])
    }
  return pts
}

/** k distinct data points chosen by a seeded shuffle (Forgy initialisation) */
export function seededInit(points: Pt[], k: number, seed: number): Pt[] {
  const rng = mulberry32(seed * 7919 + 13)
  const idx = points.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx.slice(0, k).map((i) => [...points[i]])
}
