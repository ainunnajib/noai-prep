/*
  Simulates the Python function `centroid(points, old)` in the TinyTestBuilder visual for every
  combination of the three fixes, so each test's "got" value is computed, not typed in.
  Checked against real Python for all 8 versions × 6 tests.
*/
import { pyFloat, pyRound } from './pyfmt'

export interface Fixes {
  empty: boolean
  anyDim: boolean
  round4: boolean
}

export type PyVal = { kind: 'tuple'; items: { v: number; int?: boolean }[] } | { kind: 'error'; msg: string }

export interface TestCase {
  id: string
  name: string
  why: string
  points: number[][]
  old: number[]
  expected: { v: number; int?: boolean }[]
}

export const TESTS: TestCase[] = [
  { id: 'two', name: 'two points', why: 'An answer you can check in your head.', points: [[0, 0], [2, 4]], old: [9, 9], expected: [{ v: 1 }, { v: 2 }] },
  {
    id: 'thirds',
    name: 'exam-style thirds',
    why: 'A mean that is not a whole number: checks the rounding.',
    points: [[2, 4], [2, 8], [2, 10]],
    old: [2, 2],
    expected: [{ v: 2 }, { v: 7.3333 }],
  },
  { id: 'empty', name: 'empty cluster', why: 'No points at all: the task says keep the old centroid.', points: [], old: [10, 1], expected: [{ v: 10, int: true }, { v: 1, int: true }] },
  { id: 'three', name: '3-D points', why: 'Points with three coordinates: is anything hard-coded to 2-D?', points: [[1, 2, 3], [3, 4, 5]], old: [0, 0, 0], expected: [{ v: 2 }, { v: 3 }, { v: 4 }] },
  { id: 'one', name: 'one point', why: 'A cluster of one: the mean is the point itself.', points: [[5, -1]], old: [0, 0], expected: [{ v: 5 }, { v: -1 }] },
  {
    id: 'tiny',
    name: 'tiny negative',
    why: 'A mean of −0.000005: what does rounding print?',
    points: [[-0.00001, 0], [0, 0]],
    old: [0, 0],
    expected: [{ v: 0 }, { v: 0 }],
  },
]

/** Python-style sum then divide, like sum(gen) / len(points) */
function meanOf(vals: number[], n: number): number {
  let s = 0
  for (const v of vals) s += v
  return s / n
}

export function runCentroid(points: number[][], old: number[], f: Fixes): PyVal {
  if (f.empty && points.length === 0) return { kind: 'tuple', items: old.map((v) => ({ v, int: Number.isInteger(v) })) }
  let mean: number[]
  if (f.anyDim) {
    // [sum(c) / len(points) for c in zip(*points)] -> [] when points is empty
    if (points.length === 0) mean = []
    else {
      const d = Math.min(...points.map((p) => p.length))
      mean = Array.from({ length: d }, (_, j) => meanOf(points.map((p) => p[j]), points.length))
    }
  } else {
    if (points.length === 0) return { kind: 'error', msg: 'ZeroDivisionError: division by zero' }
    mean = [meanOf(points.map((p) => p[0]), points.length), meanOf(points.map((p) => p[1]), points.length)]
  }
  if (f.round4) mean = mean.map((v) => pyRound(v, 4))
  return { kind: 'tuple', items: mean.map((v) => ({ v })) }
}

export function fmtVal(v: PyVal): string {
  if (v.kind === 'error') return v.msg
  const parts = v.items.map((x) => (x.int ? String(x.v) : pyFloat(x.v)))
  return parts.length === 1 ? `(${parts[0]},)` : `(${parts.join(', ')})`
}

export function fmtExpected(t: TestCase): string {
  return fmtVal({ kind: 'tuple', items: t.expected })
}

/** Python == between tuples (so -0.0 == 0.0 and 10 == 10.0) */
export function passes(got: PyVal, t: TestCase): boolean {
  if (got.kind === 'error') return false
  if (got.items.length !== t.expected.length) return false
  return got.items.every((x, i) => x.v === t.expected[i].v)
}

export function callText(t: TestCase): string {
  const pt = (p: number[]) => `(${p.map((v) => String(v)).join(', ')}${p.length === 1 ? ',' : ''})`
  return `centroid([${t.points.map(pt).join(', ')}], ${pt(t.old)})`
}

export function codeFor(f: Fixes): { code: string; added: number[] } {
  const lines: [string, boolean][] = [
    ['def centroid(points, old):', false],
    ['    """Mean of the points, each coordinate rounded to 4 d.p.', false],
    ['    An empty cluster keeps its old centroid."""', false],
  ]
  if (f.empty) {
    lines.push(['    if len(points) == 0:', true])
    lines.push(['        return old', true])
  }
  if (f.anyDim) {
    lines.push(['    mean = [sum(c) / len(points) for c in zip(*points)]', true])
    lines.push([f.round4 ? '    return tuple(round(v, 4) for v in mean)' : '    return tuple(mean)', true])
  } else {
    lines.push(['    x = sum(p[0] for p in points) / len(points)', false])
    lines.push(['    y = sum(p[1] for p in points) / len(points)', false])
    lines.push([f.round4 ? '    return (round(x, 4), round(y, 4))' : '    return (x, y)', f.round4])
  }
  return { code: lines.map((l) => l[0]).join('\n'), added: lines.flatMap((l, i) => (l[1] ? [i] : [])) }
}
