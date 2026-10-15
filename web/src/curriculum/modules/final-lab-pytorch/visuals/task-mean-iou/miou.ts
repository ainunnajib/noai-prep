/*
  Per-class intersection / union and mean IoU, exactly as the lesson's calculate_miou computes them,
  plus the two alternative conventions used to audit the notebook's self-check.
  Verified in Python (l3_nums.py): notebook 2x2 example 0.5833; missing-class check: union rule
  0.375, ground-truth rule 0.75, absent-as-zero 0.375; all-zero otter test: 1.0 / 1.0 / 0.5;
  satellite preset (3 classes) 0.8269 with accuracy 33/36.
*/

export type Conv = 'union' | 'gt' | 'zero'

export interface ClassStat {
  c: number
  /** pixels predicted as c */
  p: number
  /** pixels truly c */
  t: number
  i: number
  u: number
}

export function perClass(pred: number[][], truth: number[][], k: number): ClassStat[] {
  const P = pred.flat()
  const T = truth.flat()
  const out: ClassStat[] = []
  for (let c = 0; c < k; c++) {
    let p = 0
    let t = 0
    let i = 0
    let u = 0
    for (let j = 0; j < P.length; j++) {
      const a = P[j] === c
      const b = T[j] === c
      if (a) p++
      if (b) t++
      if (a && b) i++
      if (a || b) u++
    }
    out.push({ c, p, t, i, u })
  }
  return out
}

/** which classes enter the average under a convention, and the IoU each contributes */
export function contributions(stats: ClassStat[], conv: Conv): (number | null)[] {
  return stats.map((s) => {
    if (conv === 'union') return s.u === 0 ? null : s.i / s.u
    if (conv === 'gt') return s.t === 0 ? null : s.i / s.u
    return s.u === 0 ? 0 : s.i / s.u
  })
}

/** mean of the contributing IoUs; 0.0 for an empty list (as the official solution returns) */
export function meanIoU(stats: ClassStat[], conv: Conv = 'union') {
  const vals = contributions(stats, conv).filter((v): v is number => v != null)
  return { mean: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0, n: vals.length }
}

export function accuracy(pred: number[][], truth: number[][]) {
  const P = pred.flat()
  const T = truth.flat()
  let ok = 0
  for (let j = 0; j < P.length; j++) if (P[j] === T[j]) ok++
  return { ok, n: P.length }
}

export const fmt4 = (v: number) => (Math.round(v * 10000) / 10000).toFixed(4)
export const fmt3 = (v: number) => v.toFixed(3)

export const CLASS_NAMES = ['Urban', 'Forest', 'Water']
export const CLASS_COLOURS = ['var(--viz-2)', 'var(--viz-3)', 'var(--viz-1)']
