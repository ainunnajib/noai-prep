/*
  A small CART engine (classification and regression trees) used by the visuals in this module.
  It follows scikit-learn's DecisionTree* rules closely:
    - every split is "x[f] <= t" (yes = left), with t halfway between two neighbouring values;
    - the best split maximises the impurity decrease (information gain);
    - growth stops at max_depth, when a node is pure, or when no split leaves min_samples_leaf
      samples on both sides;
    - max_features tries only a random subset of the features at each split (random forests).
  Samples are passed as a list of row indices, so a bootstrap sample (with repeats) works as is.
*/

export type ClfCriterion = 'gini' | 'entropy'

export function gini(counts: number[]): number {
  let n = 0
  for (const c of counts) n += c
  if (n <= 0) return 0
  let s = 0
  for (const c of counts) s += (c / n) * (c / n)
  return 1 - s
}

export function entropy(counts: number[]): number {
  let n = 0
  for (const c of counts) n += c
  if (n <= 0) return 0
  let h = 0
  for (const c of counts) {
    if (c > 0) {
      const p = c / n
      h -= p * Math.log2(p)
    }
  }
  return h
}

export const impurityOf = (counts: number[], crit: ClfCriterion) => (crit === 'gini' ? gini(counts) : entropy(counts))

export interface TreeNode {
  /** feature index, or -1 for a leaf */
  f: number
  /** go left ("yes") when x[f] <= t */
  t: number
  l: number
  r: number
  /** number of samples (repeats counted) */
  n: number
  /** class counts (classification) or [mean] (regression) */
  value: number[]
  imp: number
  depth: number
}

export interface Tree {
  nodes: TreeNode[]
  task: 'clf' | 'reg'
  nClasses: number
  nFeatures: number
}

export interface FitOptions {
  task?: 'clf' | 'reg'
  nClasses?: number
  criterion?: ClfCriterion
  maxDepth?: number
  minSamplesLeaf?: number
  /** how many features to try at each split (default: all) */
  maxFeatures?: number
  /** random numbers in [0, 1) for feature subsets and tie-breaking */
  rng?: () => number
}

export interface Split {
  f: number
  t: number
  gain: number
  left: number[]
  right: number[]
}

function shuffleInPlace<T>(a: T[], rng?: () => number) {
  if (!rng) return a
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function classCounts(y: number[], idx: ArrayLike<number>, k: number) {
  const c = new Array(k).fill(0)
  for (let j = 0; j < idx.length; j++) c[y[idx[j]]] += 1
  return c
}

function meanVar(y: number[], idx: number[]) {
  let s = 0
  let q = 0
  for (const i of idx) {
    s += y[i]
    q += y[i] * y[i]
  }
  const n = idx.length
  const m = n ? s / n : 0
  return { mean: m, v: n ? Math.max(0, q / n - m * m) : 0 }
}

/** Impurity of a node: Gini / entropy of the class counts, or the variance (MSE) of y. */
export function nodeImpurity(y: number[], idx: number[], task: 'clf' | 'reg', crit: ClfCriterion = 'gini', k = 2) {
  return task === 'clf' ? impurityOf(classCounts(y, idx, k), crit) : meanVar(y, idx).v
}

/** Sort the row indices a[lo..hi] by key[row], in place (quicksort with insertion sort for short runs). */
function sortByKey(a: Int32Array, key: Float64Array, lo: number, hi: number): void {
  while (hi - lo > 16) {
    const mid = (lo + hi) >> 1
    // median of three as the pivot
    if (key[a[mid]] < key[a[lo]]) swap(a, mid, lo)
    if (key[a[hi]] < key[a[lo]]) swap(a, hi, lo)
    if (key[a[hi]] < key[a[mid]]) swap(a, hi, mid)
    const pivot = key[a[mid]]
    let i = lo
    let j = hi
    while (i <= j) {
      while (key[a[i]] < pivot) i++
      while (key[a[j]] > pivot) j--
      if (i <= j) {
        swap(a, i, j)
        i++
        j--
      }
    }
    // recurse into the smaller half, loop on the larger one
    if (j - lo < hi - i) {
      sortByKey(a, key, lo, j)
      lo = i
    } else {
      sortByKey(a, key, i, hi)
      hi = j
    }
  }
  for (let i = lo + 1; i <= hi; i++) {
    const v = a[i]
    const kv = key[v]
    let j = i - 1
    while (j >= lo && key[a[j]] > kv) {
      a[j + 1] = a[j]
      j--
    }
    a[j + 1] = v
  }
}

function swap(a: Int32Array, i: number, j: number) {
  const t = a[i]
  a[i] = a[j]
  a[j] = t
}

/** Best split of the samples idx over the given features (exhaustive search over thresholds). */
export function bestSplit(
  X: number[][],
  y: number[],
  idx: number[],
  features: number[],
  opts: { task: 'clf' | 'reg'; criterion?: ClfCriterion; nClasses?: number; minSamplesLeaf?: number },
  cols?: Float64Array[],
): Split | null {
  const { task, criterion = 'gini', nClasses = 2, minSamplesLeaf = 1 } = opts
  const n = idx.length
  if (n < 2 * minSamplesLeaf) return null
  const parent = nodeImpurity(y, idx, task, criterion, nClasses)
  let best: { f: number; t: number; gain: number; k: number; order: Int32Array } | null = null
  for (const f of features) {
    const c = cols ? cols[f] : Float64Array.from(X, (r) => r[f])
    const order = Int32Array.from(idx)
    sortByKey(order, c, 0, order.length - 1)
    if (task === 'clf') {
      const L = new Array(nClasses).fill(0)
      const R = classCounts(y, order, nClasses)
      for (let k = 0; k < n - 1; k++) {
        const cl = y[order[k]]
        L[cl] += 1
        R[cl] -= 1
        const nl = k + 1
        const nr = n - nl
        const a = c[order[k]]
        const b = c[order[k + 1]]
        if (a === b || nl < minSamplesLeaf || nr < minSamplesLeaf) continue
        const child = (nl * impurityOf(L, criterion) + nr * impurityOf(R, criterion)) / n
        const gain = parent - child
        if (!best || gain > best.gain + 1e-12) best = { f, t: (a + b) / 2, gain, k, order }
      }
    } else {
      let sL = 0
      let qL = 0
      let sR = 0
      let qR = 0
      for (const i of order) {
        sR += y[i]
        qR += y[i] * y[i]
      }
      for (let k = 0; k < n - 1; k++) {
        const v = y[order[k]]
        sL += v
        qL += v * v
        sR -= v
        qR -= v * v
        const nl = k + 1
        const nr = n - nl
        const a = c[order[k]]
        const b = c[order[k + 1]]
        if (a === b || nl < minSamplesLeaf || nr < minSamplesLeaf) continue
        const vl = Math.max(0, qL / nl - (sL / nl) ** 2)
        const vr = Math.max(0, qR / nr - (sR / nr) ** 2)
        const gain = parent - (nl * vl + nr * vr) / n
        if (!best || gain > best.gain + 1e-9) best = { f, t: (a + b) / 2, gain, k, order }
      }
    }
  }
  if (!best) return null
  return { f: best.f, t: best.t, gain: best.gain, left: Array.from(best.order.subarray(0, best.k + 1)), right: Array.from(best.order.subarray(best.k + 1)) }
}

/** Grow a tree on the rows idx (repeats allowed). */
export function fitTree(X: number[][], y: number[], idx: number[], opts: FitOptions = {}): Tree {
  const task = opts.task ?? 'clf'
  const k = opts.nClasses ?? 2
  const crit = opts.criterion ?? 'gini'
  const maxDepth = opts.maxDepth ?? Infinity
  const minLeaf = opts.minSamplesLeaf ?? 1
  const p = X[0]?.length ?? 0
  const maxF = Math.max(1, Math.min(p, opts.maxFeatures ?? p))
  const rng = opts.rng
  const nodes: TreeNode[] = []
  const cols = Array.from({ length: p }, (_, f) => Float64Array.from(X, (r) => r[f]))

  const grow = (rows: number[], depth: number): number => {
    const id = nodes.length
    const value = task === 'clf' ? classCounts(y, rows, k) : [meanVar(y, rows).mean]
    const imp = nodeImpurity(y, rows, task, crit, k)
    nodes.push({ f: -1, t: 0, l: -1, r: -1, n: rows.length, value, imp, depth })
    if (depth >= maxDepth || imp <= 1e-12 || rows.length < 2 * minLeaf) return id
    // try a random subset of features first; like scikit-learn, keep drawing if none of them can split
    const order = shuffleInPlace(Array.from({ length: p }, (_, j) => j), rng)
    let split: Split | null = null
    for (let start = 0; start < p && !split; start += maxF) {
      split = bestSplit(X, y, rows, order.slice(start, start + maxF), { task, criterion: crit, nClasses: k, minSamplesLeaf: minLeaf }, cols)
    }
    if (!split) return id
    const l = grow(split.left, depth + 1)
    const r = grow(split.right, depth + 1)
    nodes[id] = { ...nodes[id], f: split.f, t: split.t, l, r }
    return id
  }
  grow(idx, 0)
  return { nodes, task, nClasses: k, nFeatures: p }
}

/** Flat typed-array copy of a tree, for fast prediction inside forests. */
export interface FlatTree {
  f: Int32Array
  t: Float64Array
  l: Int32Array
  r: Int32Array
  /** P(class 1) for classification, the mean for regression */
  v: Float64Array
}

export function flatten(tree: Tree): FlatTree {
  const m = tree.nodes.length
  const out: FlatTree = { f: new Int32Array(m), t: new Float64Array(m), l: new Int32Array(m), r: new Int32Array(m), v: new Float64Array(m) }
  tree.nodes.forEach((nd, i) => {
    out.f[i] = nd.f
    out.t[i] = nd.t
    out.l[i] = nd.l
    out.r[i] = nd.r
    out.v[i] = tree.task === 'clf' ? (nd.n ? nd.value[1] / nd.n : 0) : nd.value[0]
  })
  return out
}

/** P(class 1) or the regression value, from a flattened tree. */
export function flatPredict(ft: FlatTree, x: number[]): number {
  let i = 0
  while (ft.f[i] >= 0) i = x[ft.f[i]] <= ft.t[i] ? ft.l[i] : ft.r[i]
  return ft.v[i]
}

export function leafOf(tree: Tree, x: number[]): TreeNode {
  let node = tree.nodes[0]
  while (node.f >= 0) node = tree.nodes[x[node.f] <= node.t ? node.l : node.r]
  return node
}

/** Probability of class c (classification). */
export function probaOf(tree: Tree, x: number[], c = 1): number {
  const leaf = leafOf(tree, x)
  return leaf.n ? leaf.value[c] / leaf.n : 0
}

/** Predicted class (majority in the leaf; ties go to the lower class, as in scikit-learn). */
export function predictClass(tree: Tree, x: number[]): number {
  const v = leafOf(tree, x).value
  let best = 0
  for (let c = 1; c < v.length; c++) if (v[c] > v[best]) best = c
  return best
}

export function predictValue(tree: Tree, x: number[]): number {
  return leafOf(tree, x).value[0]
}

export const depthOf = (tree: Tree) => tree.nodes.reduce((m, nd) => Math.max(m, nd.depth), 0)
export const leavesOf = (tree: Tree) => tree.nodes.filter((nd) => nd.f < 0).length

export interface LeafRect {
  x0: number
  x1: number
  y0: number
  y1: number
  node: TreeNode
}

/** The rectangles a 2-feature tree carves the plane into (for drawing decision regions). */
export function leafRects(tree: Tree, box: [number, number, number, number]): LeafRect[] {
  const out: LeafRect[] = []
  const walk = (id: number, x0: number, x1: number, y0: number, y1: number) => {
    const nd = tree.nodes[id]
    if (nd.f < 0) {
      out.push({ x0, x1, y0, y1, node: nd })
      return
    }
    if (nd.f === 0) {
      walk(nd.l, x0, Math.min(x1, nd.t), y0, y1)
      walk(nd.r, Math.max(x0, nd.t), x1, y0, y1)
    } else {
      walk(nd.l, x0, x1, y0, Math.min(y1, nd.t))
      walk(nd.r, x0, x1, Math.max(y0, nd.t), y1)
    }
  }
  walk(0, ...box)
  return out
}

/**
 * Mean decrease in impurity (MDI) for one tree, as in scikit-learn's feature_importances_:
 * add n·imp(node) − n_L·imp(left) − n_R·imp(right) to the split feature, then normalise to sum 1.
 */
export function treeImportances(tree: Tree): number[] {
  const imp = new Array(tree.nFeatures).fill(0)
  for (const nd of tree.nodes) {
    if (nd.f < 0) continue
    const L = tree.nodes[nd.l]
    const R = tree.nodes[nd.r]
    imp[nd.f] += nd.n * nd.imp - L.n * L.imp - R.n * R.imp
  }
  const s = imp.reduce((a, b) => a + b, 0)
  return s > 0 ? imp.map((v) => v / s) : imp
}

/** A standard normal number from two uniform draws (Box–Muller). */
export function gauss(rng: () => number): number {
  const u = Math.max(1e-12, rng())
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
