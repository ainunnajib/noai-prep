import { mulberry32 } from '../../../../../kit'
import { fitTree, flatten, flatPredict, treeImportances, type FitOptions, type FlatTree, type Tree } from '../decision-trees/cart'

/*
  Bagging and random forests on top of the CART engine:
    - each tree is grown on a bootstrap sample (n rows drawn from n WITH replacement);
    - maxFeatures < number of features makes it a random forest (random feature subset per split);
    - the rows a tree never saw are its out-of-bag (OOB) rows.
*/

export interface Forest {
  trees: Tree[]
  /** the same trees as typed arrays, for fast prediction */
  flat: FlatTree[]
  /** inBag[b][i] = how many times row i was drawn for tree b (0 = out of bag) */
  inBag: number[][]
}

export function bootstrapRows(n: number, rng: () => number): number[] {
  return Array.from({ length: n }, () => Math.floor(rng() * n))
}

export function fitForest(X: number[][], y: number[], nTrees: number, seed: number, opts: FitOptions = {}, bootstrap = true): Forest {
  const rng = mulberry32(seed)
  const n = y.length
  const trees: Tree[] = []
  const inBag: number[][] = []
  for (let b = 0; b < nTrees; b++) {
    const rows = bootstrap ? bootstrapRows(n, rng) : Array.from({ length: n }, (_, i) => i)
    const counts = new Array(n).fill(0)
    for (const i of rows) counts[i] += 1
    trees.push(fitTree(X, y, rows, { ...opts, rng }))
    inBag.push(counts)
  }
  return { trees, flat: trees.map(flatten), inBag }
}

/** Average P(class 1) over the first B trees (soft voting, as scikit-learn does). */
export function forestProba(f: Forest, x: number[], B = f.trees.length): number {
  let s = 0
  for (let b = 0; b < B; b++) s += flatPredict(f.flat[b], x)
  return s / B
}

export function forestValue(f: Forest, x: number[], B = f.trees.length): number {
  let s = 0
  for (let b = 0; b < B; b++) s += flatPredict(f.flat[b], x)
  return s / B
}

/**
 * Accuracy of the forest after 1, 2, …, B trees on a labelled set (classification).
 * Returns acc[B - 1] for every B; computed incrementally.
 */
export function accuracyCurve(f: Forest, X: number[][], y: number[]): number[] {
  const sums = new Array(y.length).fill(0)
  const out: number[] = []
  f.flat.forEach((t, b) => {
    let correct = 0
    for (let i = 0; i < y.length; i++) {
      sums[i] += flatPredict(t, X[i])
      const pred = sums[i] / (b + 1) > 0.5 ? 1 : 0
      if (pred === y[i]) correct++
    }
    out.push(correct / y.length)
  })
  return out
}

/**
 * Out-of-bag accuracy of the first B trees: each training row is predicted only by the trees that
 * did not see it. Rows that were in every tree's bag so far are skipped.
 */
export function oobAccuracy(f: Forest, X: number[][], y: number[], B = f.trees.length): { acc: number; covered: number } {
  let correct = 0
  let covered = 0
  for (let i = 0; i < y.length; i++) {
    let s = 0
    let m = 0
    for (let b = 0; b < B; b++) {
      if (f.inBag[b][i] === 0) {
        s += flatPredict(f.flat[b], X[i])
        m++
      }
    }
    if (!m) continue
    covered++
    if ((s / m > 0.5 ? 1 : 0) === y[i]) correct++
  }
  return { acc: covered ? correct / covered : NaN, covered }
}

/** scikit-learn style feature_importances_: average the trees' normalised MDI, then renormalise. */
export function forestImportances(f: Forest): number[] {
  const p = f.trees[0].nFeatures
  const s = new Array(p).fill(0)
  for (const t of f.trees) treeImportances(t).forEach((v, j) => (s[j] += v / f.trees.length))
  const tot = s.reduce((a, b) => a + b, 0)
  return tot > 0 ? s.map((v) => v / tot) : s
}

export function r2(yTrue: number[], yPred: number[]): number {
  const m = yTrue.reduce((a, b) => a + b, 0) / yTrue.length
  let ssr = 0
  let sst = 0
  yTrue.forEach((v, i) => {
    ssr += (v - yPred[i]) ** 2
    sst += (v - m) ** 2
  })
  return 1 - ssr / sst
}
