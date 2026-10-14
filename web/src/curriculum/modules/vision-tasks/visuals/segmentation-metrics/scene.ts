/*
  Shared data for the segmentation-metrics visuals: a 12x12 street scene with 4 classes (bicycle is absent from the truth),
  per-class intersection/union counts and mean IoU with a choice of rule for classes whose union is 0.
*/

export const N = 12

export const CLASSES = [
  { id: 0, name: 'background', color: 'color-mix(in srgb, var(--viz-muted) 30%, var(--surface))', ink: 'var(--viz-muted)' },
  { id: 1, name: 'road', color: 'var(--viz-2)', ink: 'var(--viz-2)' },
  { id: 2, name: 'car', color: 'var(--viz-1)', ink: 'var(--viz-1)' },
  { id: 3, name: 'bicycle', color: 'var(--viz-4)', ink: 'var(--viz-4)' },
] as const

export type Grid = number[] // row-major N*N class ids

function make(f: (i: number, j: number) => number): Grid {
  const g: Grid = []
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) g.push(f(i, j))
  return g
}

/** ground truth: road on the bottom 5 rows, a car (roof + body) sitting on it, no bicycle */
export const TRUTH: Grid = make((i, j) => {
  if (i === 5 && j >= 3 && j <= 5) return 2
  if (i >= 6 && i <= 8 && j >= 2 && j <= 7) return 2
  if (i >= 7) return 1
  return 0
})

/** an imperfect starting prediction: car shifted right and missing its roof, road edge ragged */
export const PRED0: Grid = make((i, j) => {
  if (i >= 6 && i <= 8 && j >= 3 && j <= 8) return 2
  if (i === 7 && (j === 0 || j === 1 || j === 10 || j === 11)) return 0
  if (i >= 7) return 1
  if (i === 6 && j >= 9) return 1
  return 0
})

export interface ClassStat {
  c: number
  inter: number
  union: number
  nPred: number
  nTrue: number
  iou: number | null
}

export function classStats(pred: Grid, truth: Grid, nClasses = CLASSES.length): ClassStat[] {
  const out: ClassStat[] = []
  for (let c = 0; c < nClasses; c++) {
    let inter = 0
    let union = 0
    let nPred = 0
    let nTrue = 0
    for (let k = 0; k < pred.length; k++) {
      const p = pred[k] === c
      const t = truth[k] === c
      if (p && t) inter++
      if (p || t) union++
      if (p) nPred++
      if (t) nTrue++
    }
    out.push({ c, inter, union, nPred, nTrue, iou: union === 0 ? null : inter / union })
  }
  return out
}

export type AbsentRule = 'skip' | 'one' | 'zero'

export function meanIoU(stats: ClassStat[], rule: AbsentRule): { value: number; used: number[]; terms: number[] } {
  const terms: number[] = []
  const used: number[] = []
  for (const s of stats) {
    if (s.iou === null) {
      if (rule === 'skip') continue
      terms.push(rule === 'one' ? 1 : 0)
    } else terms.push(s.iou)
    used.push(s.c)
  }
  return { value: terms.length ? terms.reduce((a, b) => a + b, 0) / terms.length : 0, used, terms }
}

export const f2 = (x: number) => x.toFixed(2)
export const f3 = (x: number) => x.toFixed(3)
