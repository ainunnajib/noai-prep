/*
  Small, deterministic helpers shared by the cross-validation visuals and the
  hyperparameter-tuning visuals (which import them from ../cross-validation/sim).
  Everything takes an rng (mulberry32) so the same seed always gives the same picture.
*/

export type Rng = () => number

/** Standard normal sample (Box-Muller). */
export function gauss(rng: Rng): number {
  let u = rng()
  while (u < 1e-12) u = rng()
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function shuffleInPlace<T>(a: T[], rng: Rng): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const mean = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0)

/** Population standard deviation (divide by k), the default of NumPy's np.std. */
export function std(v: number[]): number {
  if (!v.length) return 0
  const m = mean(v)
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length)
}

/**
 * Assign each row to one of k folds.
 *  - plain: shuffle the rows, then cut them into k nearly equal consecutive chunks (KFold with shuffle)
 *  - stratified: shuffle each class separately and deal its rows round-robin into the folds,
 *    so every fold gets the same share of each class (StratifiedKFold with shuffle)
 */
export function assignFolds(labels: number[], k: number, stratified: boolean, rng: Rng): number[] {
  const n = labels.length
  const fold = new Array<number>(n).fill(0)
  if (stratified) {
    const classes = Array.from(new Set(labels)).sort((a, b) => a - b)
    let offset = 0
    for (const c of classes) {
      const idx = shuffleInPlace(
        labels.map((l, i) => (l === c ? i : -1)).filter((i) => i >= 0),
        rng,
      )
      idx.forEach((row, j) => {
        fold[row] = (j + offset) % k
      })
      // continue dealing where the previous class stopped, so fold sizes stay balanced
      offset = (offset + idx.length) % k
    }
  } else {
    const order = shuffleInPlace(
      Array.from({ length: n }, (_, i) => i),
      rng,
    )
    // like scikit-learn: the first n % k folds get one extra row
    const base = Math.floor(n / k)
    const extra = n % k
    let pos = 0
    for (let f = 0; f < k; f++) {
      const size = base + (f < extra ? 1 : 0)
      for (let j = 0; j < size; j++) fold[order[pos++]] = f
    }
  }
  return fold
}

/**
 * A one-feature threshold classifier ("pass if hours >= t").
 * Tries every midpoint between neighbouring values and keeps the one with the best training
 * accuracy (ties: the middle of the tied candidates).
 */
export function fitThreshold(x: number[], y: number[]): number {
  const vals = Array.from(new Set(x)).sort((a, b) => a - b)
  const cands: number[] = [vals[0] - 0.25]
  for (let i = 0; i + 1 < vals.length; i++) cands.push((vals[i] + vals[i + 1]) / 2)
  cands.push(vals[vals.length - 1] + 0.25)
  let best = -1
  let bestTs: number[] = []
  for (const t of cands) {
    let ok = 0
    for (let i = 0; i < x.length; i++) if ((x[i] >= t ? 1 : 0) === y[i]) ok++
    if (ok > best) {
      best = ok
      bestTs = [t]
    } else if (ok === best) bestTs.push(t)
  }
  return bestTs[Math.floor((bestTs.length - 1) / 2)]
}

/** Number of correct predictions out of the rows given (y = 1 means pass). */
export function countCorrect(x: number[], y: number[], t: number): number {
  let ok = 0
  for (let i = 0; i < x.length; i++) if ((x[i] >= t ? 1 : 0) === y[i]) ok++
  return ok
}
