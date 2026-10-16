/*
  Gradient boosting for 1-D regression, written to mirror the lesson (and the NOAI 2026 Final task):
    F_0 = mean(y)                      (L2 loss)
    r_i = y_i − F_{m−1}(x_i)           (negative gradient of ½(y − F)²: the residual)
    h_m = regression tree fitted to the r_i (CART, squared error, depth-limited)
    F_m = F_{m−1} + η · h_m
  Every tree threshold is a midpoint between neighbouring training x values, so every model here is
  constant on the same set of intervals. We store functions as one value per interval.
*/

/** 40 training points (x, y) on [0, 10]: y = 2.2 sin(0.85x) + 0.35x + 1.5 + noise (σ = 0.7), sorted by x. */
export const TRAIN: [number, number][] = [
  [0.05, 1.89], [0.06, 2.27], [0.22, 0.36], [0.22, 1.71], [0.55, 2.24], [0.83, 2.95], [1.15, 2.9], [1.21, 2.67], [1.22, 2.74], [1.46, 4.02],
  [1.59, 3.57], [1.9, 3.25], [2.02, 5.08], [2.1, 4.19], [2.18, 4.59], [2.57, 4.1], [2.92, 4.47], [2.95, 4.82], [3.36, 3.71], [3.73, 1.76],
  [4.05, 1.62], [4.07, 3.49], [4.19, 1.52], [5.03, 1.32], [5.26, -0.06], [5.78, 1.25], [6.91, 3.48], [6.97, 1.7], [7.14, 3.43], [7.26, 4.29],
  [7.84, 4.4], [8.32, 5.77], [8.38, 7.34], [8.52, 6.41], [8.53, 6.26], [8.85, 7.2], [8.95, 6.3], [9.02, 7.23], [9.44, 7.16], [9.45, 8.04],
]

/** 60 validation points from the same curve with fresh noise (never used for fitting). */
export const VAL: [number, number][] = [
  [0.42, 3.29], [0.52, 1.95], [1.16, 4.45], [1.31, 2.83], [1.37, 4.85], [1.46, 4.02], [1.6, 4.64], [1.7, 5.05], [1.77, 3.65], [1.87, 4.25],
  [2.03, 3.46], [2.09, 4.86], [2.21, 3.61], [2.31, 4.78], [2.47, 5.05], [2.92, 3.25], [3.11, 2.91], [3.37, 3.01], [3.43, 3.88], [3.46, 2.41],
  [3.51, 1.84], [3.57, 4.83], [3.69, 2.76], [3.85, 1.82], [3.96, 2.89], [4.1, 3.72], [4.12, 1.26], [4.24, 1.71], [4.3, 2.24], [4.39, 1.24],
  [4.76, 1.17], [4.98, 0.28], [5.24, 1.15], [5.39, 2.37], [5.73, 1.66], [5.73, 1.69], [5.98, 2.46], [6.06, 0.73], [6.15, 1.55], [6.46, 1.94],
  [6.53, 1.95], [6.63, 3.28], [7.52, 3.93], [7.7, 4.98], [7.96, 4.24], [7.97, 5.79], [8.13, 4.78], [8.5, 6.62], [8.54, 5.78], [8.61, 6.65],
  [9.09, 6.95], [9.25, 6.69], [9.3, 6.72], [9.51, 6.84], [9.6, 7.32], [9.61, 6.27], [9.68, 6.86], [9.72, 7.44], [9.75, 7.43], [9.79, 5.87],
]

export const X_RANGE: [number, number] = [0, 10]

/** distinct sorted training x values and the midpoints between them */
const DISTINCT = Array.from(new Set(TRAIN.map((p) => p[0]))).sort((a, b) => a - b)
export const MIDS = DISTINCT.slice(1).map((v, i) => (DISTINCT[i] + v) / 2)
/** interval edges: [0, mid_1, …, mid_k, 10]; interval j holds DISTINCT[j] */
export const EDGES = [X_RANGE[0], ...MIDS, X_RANGE[1]]
export const NI = DISTINCT.length

/** index of the interval that contains x */
export function intervalOf(x: number) {
  let lo = 0
  let hi = MIDS.length // answer in [0, MIDS.length]
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (x <= MIDS[mid]) hi = mid
    else lo = mid + 1
  }
  return lo
}

const TRAIN_IV = TRAIN.map((p) => intervalOf(p[0]))
const VAL_IV = VAL.map((p) => intervalOf(p[0]))

interface Node {
  /** threshold (go left when x ≤ t), or NaN for a leaf */
  t: number
  value: number
  left?: Node
  right?: Node
}

/** CART regression tree on (interval index, target) pairs, minimising squared error. */
function grow(iv: number[], r: number[], idx: number[], depth: number, maxDepth: number): Node {
  let s = 0
  let s2 = 0
  for (const i of idx) {
    s += r[i]
    s2 += r[i] * r[i]
  }
  const n = idx.length
  const mean = s / n
  const sse = s2 - (s * s) / n
  if (depth >= maxDepth || n < 2 || sse <= 1e-12) return { t: NaN, value: mean }
  const sorted = idx.slice().sort((a, b) => iv[a] - iv[b])
  let best = Infinity
  let bestK = -1
  let ls = 0
  let ls2 = 0
  for (let k = 0; k < n - 1; k++) {
    const v = r[sorted[k]]
    ls += v
    ls2 += v * v
    if (iv[sorted[k]] === iv[sorted[k + 1]]) continue // no threshold between equal x values
    const nl = k + 1
    const nr = n - nl
    const rs = s - ls
    const rs2 = s2 - ls2
    const cost = ls2 - (ls * ls) / nl + (rs2 - (rs * rs) / nr)
    if (cost < best - 1e-12) {
      best = cost
      bestK = k
    }
  }
  if (bestK < 0) return { t: NaN, value: mean }
  const cut = iv[sorted[bestK]] // left = intervals ≤ cut
  return {
    t: MIDS[cut],
    value: mean,
    left: grow(iv, r, sorted.slice(0, bestK + 1), depth + 1, maxDepth),
    right: grow(iv, r, sorted.slice(bestK + 1), depth + 1, maxDepth),
  }
}

function nodeValue(node: Node, x: number): number {
  let nd = node
  while (!Number.isNaN(nd.t)) nd = x <= nd.t ? nd.left! : nd.right!
  return nd.value
}

export interface Fitted {
  /** value of the tree on every interval */
  values: Float64Array
  /** thresholds used by the tree */
  cuts: number[]
}

/** Fit a depth-limited regression tree to targets r at the training points; returns one value per interval. */
export function fitTree(r: number[], maxDepth: number): Fitted {
  const root = grow(TRAIN_IV, r, TRAIN.map((_, i) => i), 0, maxDepth)
  const values = new Float64Array(NI)
  for (let j = 0; j < NI; j++) values[j] = nodeValue(root, DISTINCT[j])
  const cuts: number[] = []
  const walk = (nd: Node) => {
    if (Number.isNaN(nd.t)) return
    cuts.push(nd.t)
    walk(nd.left!)
    walk(nd.right!)
  }
  walk(root)
  return { values, cuts: cuts.sort((a, b) => a - b) }
}

export interface BoostRun {
  F0: number
  /** F[m] = model after m trees, one value per interval (F[0] is the constant start) */
  F: Float64Array[]
  /** trees[m − 1] = tree m (fitted to the residuals of F[m − 1]) */
  trees: Fitted[]
  /** residuals[m − 1] = y − F[m − 1] at the training points (what tree m is trained on) */
  residuals: number[][]
  trainMSE: number[]
  valMSE: number[]
}

const mse = (pts: [number, number][], iv: number[], F: Float64Array) => pts.reduce((a, p, i) => a + (p[1] - F[iv[i]]) ** 2, 0) / pts.length

export function boost(M: number, lr: number, maxDepth: number): BoostRun {
  const y = TRAIN.map((p) => p[1])
  const F0 = y.reduce((a, b) => a + b, 0) / y.length
  let F = new Float64Array(NI).fill(F0)
  const run: BoostRun = { F0, F: [F], trees: [], residuals: [], trainMSE: [mse(TRAIN, TRAIN_IV, F)], valMSE: [mse(VAL, VAL_IV, F)] }
  for (let m = 1; m <= M; m++) {
    const r = y.map((yi, i) => yi - F[TRAIN_IV[i]])
    const tree = fitTree(r, maxDepth)
    const next = new Float64Array(NI)
    for (let j = 0; j < NI; j++) next[j] = F[j] + lr * tree.values[j]
    run.residuals.push(r)
    run.trees.push(tree)
    run.F.push(next)
    run.trainMSE.push(mse(TRAIN, TRAIN_IV, next))
    run.valMSE.push(mse(VAL, VAL_IV, next))
    F = next
  }
  return run
}

/** [x, y] points of a step function given one value per interval (for <Path>) */
export function stepPoints(values: ArrayLike<number>): [number, number][] {
  const pts: [number, number][] = []
  for (let j = 0; j < NI; j++) {
    pts.push([EDGES[j], values[j]])
    pts.push([EDGES[j + 1], values[j]])
  }
  return pts
}

/** Early stopping exactly as in the lesson: stop once the validation loss has not improved for `patience` rounds. */
export function earlyStop(val: number[], patience: number, minDelta = 0) {
  let best = Infinity
  let bestN = 0
  let counter = 0
  let stoppedAt = val.length - 1
  let stopped = false
  for (let m = 1; m < val.length; m++) {
    if (val[m] < best - minDelta) {
      best = val[m]
      bestN = m
      counter = 0
    } else counter += 1
    if (counter >= patience) {
      stoppedAt = m
      stopped = true
      break
    }
  }
  return { bestN, best, stoppedAt, stopped }
}
