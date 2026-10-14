/*
  Small, dependency-free clustering toolkit shared by the clustering visuals of this module.
  Everything is deterministic: datasets come from mulberry32(seed), never Math.random().

  K-means here is exactly the algorithm taught in the lesson:
    assign:  label_i = argmin_j ||x_i - mu_j||^2   (ties -> lowest j, like np.argmin)
    update:  mu_j = mean of the points with label j (an empty cluster keeps its old centroid)
    inertia: sum_i ||x_i - mu_{label_i}||^2
  DBSCAN follows scikit-learn's conventions: a point is a core point when at least
  min_samples points (counting itself) lie within distance eps.
*/
import { mulberry32 } from '../../../../../kit'

export type Pt = [number, number]

export const CLUSTER_COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)']
/** colour for cluster j (clusters 6+ reuse the palette, darkened towards the ink colour) */
export const clusterColour = (j: number) =>
  j < 0 ? 'var(--viz-muted)' : j < 6 ? CLUSTER_COLOURS[j] : `color-mix(in srgb, ${CLUSTER_COLOURS[j % 6]} 55%, var(--viz-ink))`
/** light tint of a cluster colour for regions and halos */
export const tint = (j: number, pct = 14) => `color-mix(in srgb, ${clusterColour(j)} ${pct}%, var(--surface))`

/* ----------------------------------------------------------------------------- random data */

/** standard normal sample via Box-Muller */
export function gauss(rng: () => number): number {
  const u = Math.max(1e-12, rng())
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export interface Dataset {
  points: Pt[]
  /** the true group of each point (used only to judge a clustering, never by the algorithms) */
  truth: number[]
}

/** round Gaussian blobs: centres[g] with n[g] points and spread sd[g] */
export function blobs(centres: Pt[], n: number | number[], sd: number | number[], seed: number): Dataset {
  const rng = mulberry32(seed)
  const points: Pt[] = []
  const truth: number[] = []
  centres.forEach((c, g) => {
    const m = Array.isArray(n) ? n[g] : n
    const s = Array.isArray(sd) ? sd[g] : sd
    for (let i = 0; i < m; i++) {
      points.push([c[0] + s * gauss(rng), c[1] + s * gauss(rng)])
      truth.push(g)
    }
  })
  return { points, truth }
}

/** two interleaving half-moons (like sklearn.datasets.make_moons), scaled and shifted by (sx, sy, ox, oy) */
export function moons(nPer: number, noise: number, seed: number, scale = 2.6, off: Pt = [2.4, 3.2]): Dataset {
  const rng = mulberry32(seed)
  const points: Pt[] = []
  const truth: number[] = []
  for (let g = 0; g < 2; g++) {
    for (let i = 0; i < nPer; i++) {
      const t = (Math.PI * (i + 0.5)) / nPer
      const x = g === 0 ? Math.cos(t) : 1 - Math.cos(t)
      const y = g === 0 ? Math.sin(t) : 0.5 - Math.sin(t)
      points.push([off[0] + scale * (x + noise * gauss(rng)), off[1] + scale * (y + noise * gauss(rng))])
      truth.push(g)
    }
  }
  return { points, truth }
}

/** concentric rings around centre c with the given radii */
export function rings(nPer: number[], radii: number[], noise: number, seed: number, c: Pt = [5, 4]): Dataset {
  const rng = mulberry32(seed)
  const points: Pt[] = []
  const truth: number[] = []
  radii.forEach((r, g) => {
    const m = nPer[g]
    const phase = rng() * Math.PI * 2
    for (let i = 0; i < m; i++) {
      const t = phase + (2 * Math.PI * i) / m + 0.25 * (rng() - 0.5) * ((2 * Math.PI) / m)
      const rr = r + noise * gauss(rng)
      points.push([c[0] + rr * Math.cos(t), c[1] + rr * Math.sin(t)])
      truth.push(g)
    }
  })
  return { points, truth }
}

/* ----------------------------------------------------------------------------- k-means */

export const sqDist = (a: Pt, b: Pt) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
export const dist = (a: Pt, b: Pt) => Math.sqrt(sqDist(a, b))

/** index of the nearest centroid for every point (ties go to the lowest index, like np.argmin) */
export function assign(points: Pt[], centroids: Pt[]): number[] {
  return points.map((p) => {
    let best = 0
    let bd = Infinity
    centroids.forEach((c, j) => {
      const d = sqDist(p, c)
      if (d < bd - 1e-12) {
        bd = d
        best = j
      }
    })
    return best
  })
}

/** move every centroid to the mean of its points; an empty cluster keeps its old centroid */
export function update(points: Pt[], labels: number[], old: Pt[]): Pt[] {
  return old.map((c, j) => {
    let sx = 0
    let sy = 0
    let n = 0
    points.forEach((p, i) => {
      if (labels[i] === j) {
        sx += p[0]
        sy += p[1]
        n++
      }
    })
    return n ? [sx / n, sy / n] : [c[0], c[1]]
  })
}

/** within-cluster sum of squared distances */
export function inertia(points: Pt[], labels: number[], centroids: Pt[]): number {
  return points.reduce((s, p, i) => s + sqDist(p, centroids[labels[i]]), 0)
}

export interface KStep {
  kind: 'start' | 'assign' | 'update'
  centroids: Pt[]
  /** null before the first assignment */
  labels: number[] | null
  /** null before the first assignment */
  inertia: number | null
  /** for update steps: where each centroid came from */
  from?: Pt[]
  /** number of points whose label changed in this assign step */
  changed?: number
}

/**
 * The full history of one K-means run, as half-steps:
 * start, assign, update, assign, update, ..., ending with an assign step that changes nothing.
 */
export function kmeansHistory(points: Pt[], init: Pt[], maxIter = 30): KStep[] {
  const hist: KStep[] = [{ kind: 'start', centroids: init.map((c) => [c[0], c[1]] as Pt), labels: null, inertia: null }]
  let C = init.map((c) => [c[0], c[1]] as Pt)
  let labels: number[] | null = null
  for (let it = 0; it < maxIter; it++) {
    const nl = assign(points, C)
    const changed = labels ? nl.filter((l, i) => l !== labels![i]).length : nl.length
    hist.push({ kind: 'assign', centroids: C, labels: nl, inertia: inertia(points, nl, C), changed })
    if (labels && changed === 0) break
    labels = nl
    const NC = update(points, labels, C)
    hist.push({ kind: 'update', centroids: NC, labels, inertia: inertia(points, labels, NC), from: C })
    C = NC
  }
  return hist
}

/** run K-means to convergence from a given start */
export function kmeansFrom(points: Pt[], init: Pt[], maxIter = 100): { labels: number[]; centroids: Pt[]; inertia: number; iters: number } {
  let C = init.map((c) => [c[0], c[1]] as Pt)
  let labels = assign(points, C)
  let iters = 1
  for (; iters < maxIter; iters++) {
    C = update(points, labels, C)
    const nl = assign(points, C)
    if (nl.every((l, i) => l === labels[i])) break
    labels = nl
  }
  return { labels, centroids: C, inertia: inertia(points, labels, C), iters }
}

/** k-means++ seeding: first centre uniformly at random, each next one with probability proportional to D(x)^2 */
export function kmeansPPInit(points: Pt[], k: number, rng: () => number): Pt[] {
  const first = points[Math.floor(rng() * points.length)]
  const C: Pt[] = [[first[0], first[1]]]
  while (C.length < k) {
    const d2 = points.map((p) => Math.min(...C.map((c) => sqDist(p, c))))
    const total = d2.reduce((a, b) => a + b, 0)
    if (total <= 0) {
      C.push([...points[Math.floor(rng() * points.length)]] as Pt)
      continue
    }
    let r = rng() * total
    let idx = 0
    for (; idx < points.length - 1; idx++) {
      r -= d2[idx]
      if (r <= 0) break
    }
    C.push([points[idx][0], points[idx][1]])
  }
  return C
}

/** pick k distinct data points uniformly at random (Forgy initialisation) */
export function randomInit(points: Pt[], k: number, rng: () => number): Pt[] {
  const idx = points.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx.slice(0, k).map((i) => [points[i][0], points[i][1]] as Pt)
}

/** best of nInit k-means++ runs (like scikit-learn's KMeans(n_init=...)) */
export function kmeansBest(points: Pt[], k: number, seed = 1, nInit = 8) {
  const rng = mulberry32(seed)
  let best = kmeansFrom(points, kmeansPPInit(points, k, rng))
  for (let r = 1; r < nInit; r++) {
    const run = kmeansFrom(points, kmeansPPInit(points, k, rng))
    if (run.inertia < best.inertia - 1e-9) best = run
  }
  return best
}

/* ----------------------------------------------------------------------------- quality scores */

/** mean silhouette: for each point s = (b - a) / max(a, b); a = mean distance to own cluster, b = to the nearest other cluster */
export function silhouette(points: Pt[], labels: number[]): number {
  const ks = Array.from(new Set(labels.filter((l) => l >= 0)))
  if (ks.length < 2) return 0
  let total = 0
  let n = 0
  points.forEach((p, i) => {
    if (labels[i] < 0) return
    const sums = new Map<number, [number, number]>()
    points.forEach((q, j) => {
      if (i === j || labels[j] < 0) return
      const e = sums.get(labels[j]) ?? [0, 0]
      e[0] += dist(p, q)
      e[1] += 1
      sums.set(labels[j], e)
    })
    const own = sums.get(labels[i])
    if (!own || own[1] === 0) {
      n++ // a singleton cluster scores 0 (scikit-learn convention)
      return
    }
    const a = own[0] / own[1]
    let b = Infinity
    sums.forEach(([s, c], lab) => {
      if (lab !== labels[i] && c > 0) b = Math.min(b, s / c)
    })
    total += (b - a) / Math.max(a, b)
    n++
  })
  return n ? total / n : 0
}

/**
 * Fraction of points grouped correctly, after matching each found cluster to at most one true group
 * in the best possible way. Noise (label -1) and unmatched extra clusters count as wrong.
 */
export function matchedAccuracy(truth: number[], pred: number[]): number {
  const T = Array.from(new Set(truth))
  const P = Array.from(new Set(pred.filter((l) => l >= 0)))
  const count = (t: number, p: number) => truth.reduce((s, tt, i) => s + (tt === t && pred[i] === p ? 1 : 0), 0)
  const M = P.map((p) => T.map((t) => count(t, p)))
  // best assignment of found clusters to distinct true groups (small sizes: depth-first search)
  let best = 0
  const used = new Array(T.length).fill(false)
  const dfs = (pi: number, acc: number) => {
    if (pi === P.length) {
      best = Math.max(best, acc)
      return
    }
    dfs(pi + 1, acc) // leave this cluster unmatched
    for (let ti = 0; ti < T.length; ti++) {
      if (used[ti]) continue
      used[ti] = true
      dfs(pi + 1, acc + M[pi][ti])
      used[ti] = false
    }
  }
  if (P.length <= 8) dfs(0, 0)
  else {
    // greedy fallback for many clusters
    const taken = new Set<number>()
    let acc = 0
    M.map((row, pi) => ({ pi, best: Math.max(...row), ti: row.indexOf(Math.max(...row)) }))
      .sort((a, b) => b.best - a.best)
      .forEach(({ ti, best: v }) => {
        if (!taken.has(ti)) {
          taken.add(ti)
          acc += v
        }
      })
    best = acc
  }
  return best / truth.length
}

/* ----------------------------------------------------------------------------- DBSCAN */

export type PointKind = 'core' | 'border' | 'noise'

export interface DbscanResult {
  labels: number[]
  kinds: PointKind[]
  /** neighbour count within eps, counting the point itself */
  counts: number[]
  nClusters: number
}

/** DBSCAN with scikit-learn's conventions (min_samples counts the point itself; noise label -1) */
export function dbscan(points: Pt[], eps: number, minSamples: number): DbscanResult {
  const n = points.length
  const e2 = eps * eps
  const nbrs: number[][] = points.map((p) => {
    const out: number[] = []
    points.forEach((q, j) => {
      if (sqDist(p, q) <= e2) out.push(j)
    })
    return out
  })
  const counts = nbrs.map((l) => l.length)
  const core = counts.map((c) => c >= minSamples)
  const labels = new Array(n).fill(-1)
  let c = 0
  for (let i = 0; i < n; i++) {
    if (!core[i] || labels[i] !== -1) continue
    // grow a new cluster from core point i (breadth-first through core points)
    const queue = [i]
    labels[i] = c
    while (queue.length) {
      const u = queue.shift()!
      if (!core[u]) continue
      for (const v of nbrs[u]) {
        if (labels[v] === -1) {
          labels[v] = c
          if (core[v]) queue.push(v)
        }
      }
    }
    c++
  }
  const kinds: PointKind[] = labels.map((l, i) => (core[i] ? 'core' : l >= 0 ? 'border' : 'noise'))
  return { labels, kinds, counts, nClusters: c }
}

/* ----------------------------------------------------------------------------- geometry */

/** clip a convex polygon to the half-plane of points closer to a than to b (Voronoi cell building block) */
function clipCloser(poly: Pt[], a: Pt, b: Pt): Pt[] {
  // keep points p with (p - m) . (b - a) <= 0, where m is the midpoint
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const nx = b[0] - a[0]
  const ny = b[1] - a[1]
  const side = (p: Pt) => (p[0] - m[0]) * nx + (p[1] - m[1]) * ny
  const out: Pt[] = []
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i]
    const Q = poly[(i + 1) % poly.length]
    const sp = side(P)
    const sq = side(Q)
    if (sp <= 0) out.push(P)
    if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) {
      const t = sp / (sp - sq)
      out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])])
    }
  }
  return out
}

/** Voronoi cell of every centroid inside the box [x0,x1] x [y0,y1] */
export function voronoiCells(centroids: Pt[], box: [number, number, number, number]): Pt[][] {
  const [x0, x1, y0, y1] = box
  return centroids.map((a, i) => {
    let poly: Pt[] = [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ]
    centroids.forEach((b, j) => {
      if (i === j || poly.length === 0) return
      if (sqDist(a, b) < 1e-12) {
        // two centroids in the same place: give the cell to the lower index
        if (j < i) poly = []
        return
      }
      poly = clipCloser(poly, a, b)
    })
    return poly
  })
}

/** convex hull (Andrew's monotone chain), counter-clockwise */
export function convexHull(pts: Pt[]): Pt[] {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (p.length <= 2) return p
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: Pt[] = []
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop()
    lower.push(q)
  }
  const upper: Pt[] = []
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop()
    upper.push(q)
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

export const fmt = (v: number, d = 1) => {
  const s = v.toFixed(d)
  return s === '-0' || /^-0\.0+$/.test(s) ? s.slice(1) : s
}
