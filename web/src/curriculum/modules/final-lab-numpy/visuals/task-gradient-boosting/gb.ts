import { mulberry32 } from '../../../../../kit'

/*
  Gradient boosting on 1-D data, written the way the 2026 task builds it, so the visuals can show
  every intermediate array:
    F0 = mean (L2) or median (L1)
    each round: r = negative gradient, idx = subsample, tree = CART regression tree fitted to r[idx],
                F += learning_rate * tree(x) for ALL rows
  The tree is a 1-D version of scikit-learn's DecisionTreeRegressor (squared-error splits, thresholds at
  midpoints, leaf value = mean of the targets in the leaf, ties go to the leftmost split). On this data
  it reproduces sklearn's predictions round by round (checked in scratch/gb/check_gb.py).
*/

/** 24 noisy points along a wave, with one outlier at x = 7.1 (y = 10.0). */
export const TOY_X = [0.3, 0.7, 1.1, 1.5, 1.9, 2.3, 2.7, 3.1, 3.5, 3.9, 4.3, 4.7, 5.1, 5.5, 5.9, 6.3, 6.7, 7.1, 7.5, 7.9, 8.3, 8.7, 9.1, 9.5]
export const TOY_Y = [5.4, 5.3, 6.2, 7.0, 6.8, 7.3, 7.2, 6.1, 6.9, 6.2, 5.0, 4.6, 4.4, 3.7, 3.6, 3.1, 4.2, 10.0, 5.2, 5.2, 7.5, 7.7, 8.3, 10.1]

export type Loss = 'l1' | 'l2'

export const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length
export function median(a: number[]): number {
  const s = [...a].sort((p, q) => p - q)
  const h = Math.floor(s.length / 2)
  return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2
}
export const sign = (v: number) => (v > 0 ? 1 : v < 0 ? -1 : 0)

export function negativeGradient(loss: Loss, y: number[], F: number[]): number[] {
  return y.map((v, i) => (loss === 'l2' ? v - F[i] : sign(v - F[i])))
}
export const initialPrediction = (loss: Loss, y: number[]) => (loss === 'l2' ? mean(y) : median(y))

/** A fitted 1-D regression tree as sorted split points and leaf values: leaf k covers (cuts[k-1], cuts[k]]. */
export interface Tree {
  cuts: number[]
  values: number[]
}

export function treePredict(t: Tree, x: number): number {
  let k = 0
  while (k < t.cuts.length && x > t.cuts[k]) k++
  return t.values[k]
}

/** Fit a depth-limited squared-error regression tree on (x[i], r[i]) for i in idx. */
export function fitTree(x: number[], r: number[], idx: number[], maxDepth: number): Tree {
  const order = [...idx].sort((a, b) => x[a] - x[b] || a - b)
  const leaves: { lo: number; hi: number; value: number }[] = [] // lo/hi: split bounds (exclusive/inclusive)
  const grow = (rows: number[], depth: number, lo: number, hi: number) => {
    const n = rows.length
    const total = rows.reduce((s, i) => s + r[i], 0)
    const value = total / n
    const impurity = rows.reduce((s, i) => s + (r[i] - value) ** 2, 0) / n
    if (depth >= maxDepth || n < 2 || impurity <= 1e-12) {
      leaves.push({ lo, hi, value })
      return
    }
    // scikit-learn's proxy: maximise sumL^2/nL + sumR^2/nR over split positions, scanning left to right
    let best = -Infinity
    let bestPos = -1
    let sumL = 0
    for (let p = 0; p < n - 1; p++) {
      sumL += r[rows[p]]
      if (x[rows[p + 1]] <= x[rows[p]] + 1e-7) continue
      const nL = p + 1
      const nR = n - nL
      const proxy = (sumL * sumL) / nL + ((total - sumL) * (total - sumL)) / nR
      if (proxy > best) {
        best = proxy
        bestPos = p
      }
    }
    if (bestPos < 0) {
      leaves.push({ lo, hi, value })
      return
    }
    const thr = (x[rows[bestPos]] + x[rows[bestPos + 1]]) / 2
    grow(rows.slice(0, bestPos + 1), depth + 1, lo, thr)
    grow(rows.slice(bestPos + 1), depth + 1, thr, hi)
  }
  grow(order, 0, -Infinity, Infinity)
  leaves.sort((a, b) => a.lo - b.lo)
  return { cuts: leaves.slice(0, -1).map((l) => l.hi), values: leaves.map((l) => l.value) }
}

/** Indices for one tree: all rows, or a random subset without replacement (like rng.choice(..., replace=False)). */
export function subsampleIndices(n: number, subsample: number, rand: () => number): number[] {
  if (subsample >= 1) return Array.from({ length: n }, (_, i) => i)
  const k = Math.floor(n * subsample)
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, k).sort((p, q) => p - q)
}

export interface Round {
  /** predictions before this round's tree */
  before: number[]
  /** negative gradient used as the tree's target */
  r: number[]
  /** rows the tree was fitted on */
  idx: number[]
  tree: Tree
  /** tree(x) for every row */
  h: number[]
  /** predictions after the update */
  after: number[]
}

export interface BoostRun {
  F0: number
  rounds: Round[]
}

export function boost(opts: { loss: Loss; lr: number; depth: number; subsample: number; nRounds: number; seed?: number; x?: number[]; y?: number[] }): BoostRun {
  const x = opts.x ?? TOY_X
  const y = opts.y ?? TOY_Y
  const rand = mulberry32(opts.seed ?? 42)
  const F0 = initialPrediction(opts.loss, y)
  let F = y.map(() => F0)
  const rounds: Round[] = []
  for (let m = 0; m < opts.nRounds; m++) {
    const r = negativeGradient(opts.loss, y, F)
    const idx = subsampleIndices(y.length, opts.subsample, rand)
    const tree = fitTree(x, r, idx, opts.depth)
    const h = x.map((v) => treePredict(tree, v))
    const after = F.map((f, i) => f + opts.lr * h[i])
    rounds.push({ before: F, r, idx, tree, h, after })
    F = after
  }
  return { F0, rounds }
}

export const mse = (y: number[], F: number[]) => mean(y.map((v, i) => (v - F[i]) ** 2))
export const mae = (y: number[], F: number[]) => mean(y.map((v, i) => Math.abs(v - F[i])))

/** The prediction function after m trees, F_m(x) = F0 + lr * sum of the first m trees. */
export function predictAt(run: BoostRun, m: number, lr: number, x: number): number {
  let f = run.F0
  for (let k = 0; k < m; k++) f += lr * treePredict(run.rounds[k].tree, x)
  return f
}

/**
 * The GBREarlyStop rule applied to a validation-loss curve (val[m] = loss after m + 1 trees):
 * improvement if val < best - minDelta (then best_n_estimators = m + 1, counter = 0), otherwise counter += 1;
 * stop when counter >= patience (official solution) or counter > patience (the comment's "exceeds").
 */
export function earlyStop(val: number[], patience: number, op: '>=' | '>', minDelta = 1e-4): { stoppedAfter: number; bestN: number } {
  let best = Infinity
  let bestN = 0
  let counter = 0
  for (let m = 0; m < val.length; m++) {
    if (val[m] < best - minDelta) {
      best = val[m]
      bestN = m + 1
      counter = 0
    } else counter += 1
    if (op === '>=' ? counter >= patience : counter > patience) return { stoppedAfter: m + 1, bestN }
  }
  return { stoppedAfter: val.length, bestN }
}
