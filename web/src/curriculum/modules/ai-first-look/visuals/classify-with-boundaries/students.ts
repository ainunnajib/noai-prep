/*
  The running example for this lesson: last year's class.
  x = hours of revision in the week before the test, y = hours of sleep the night before, label = pass or fail.

  TRAIN: 24 students. 22 follow a clear pattern (more revision and more sleep → pass); two are unusual:
  one barely revised but passed, one revised a lot but failed. No straight line can get both right, so the
  best a straight line can do is 22/24.

  TEST: 36 new students (three batches of 12), drawn at random from the same rule that generated the pattern
  (pass with probability 1 / (1 + e^(−1.6 z)), z = (revision − 5) + 0.9 × (sleep − 6.5)), with numpy seed 2.
  On thousands of such new students the best straight line scores about 89% and 1-nearest-neighbour about 81%;
  this sample (33/36 vs 29/36) is typical.
*/

export interface Student {
  x: number
  y: number
  pass: boolean
}

const P = (x: number, y: number): Student => ({ x, y, pass: true })
const F = (x: number, y: number): Student => ({ x, y, pass: false })

export const TRAIN: Student[] = [
  P(6.5, 8.8), P(7.8, 8.2), P(8.8, 7.6), P(9.2, 5.6), P(8.2, 4.4), P(6.9, 6.2), P(5.8, 7.6), P(4.9, 9.3), P(9.3, 9.2), P(7.4, 4.0), P(5.6, 6.6),
  F(1.2, 9.2), F(2.4, 7.0), F(0.9, 6.1), F(3.5, 5.4), F(2.0, 4.2), F(4.4, 3.6), F(3.4, 7.9), F(5.2, 4.8), F(3.0, 3.6), F(5.9, 3.9), F(4.4, 6.4),
  // the two unusual students
  P(2.3, 5.7),
  F(7.6, 7.0),
]

const T = (x: number, y: number, pass: 0 | 1): Student => ({ x, y, pass: pass === 1 })
export const TEST: Student[] = [
  T(2.9, 6.6, 0), T(3.2, 7.1, 0), T(7.8, 8.7, 1), T(1.3, 6.1, 0), T(5.9, 8.9, 1), T(7.1, 7.2, 1), T(2.2, 8.5, 0), T(1.0, 6.5, 0), T(3.0, 7.7, 1), T(6.4, 5.5, 1), T(5.6, 6.6, 0), T(1.9, 4.8, 0),
  T(4.4, 4.1, 0), T(6.5, 3.7, 0), T(4.3, 7.7, 1), T(6.2, 6.2, 0), T(9.2, 8.9, 1), T(6.6, 8.5, 1), T(4.0, 5.8, 0), T(2.2, 9.3, 0), T(3.6, 7.1, 0), T(5.1, 8.1, 1), T(8.5, 5.9, 1), T(7.5, 4.7, 1),
  T(3.4, 4.5, 0), T(8.8, 4.6, 1), T(4.7, 7.1, 1), T(6.7, 4.2, 1), T(1.5, 3.6, 0), T(1.4, 8.5, 0), T(2.3, 4.1, 0), T(8.5, 6.2, 1), T(6.6, 6.4, 1), T(8.1, 7.2, 1), T(6.3, 6.5, 1), T(4.2, 9.1, 1),
]

export const X_RANGE: [number, number] = [0, 10]
export const Y_RANGE: [number, number] = [3, 10]
/** design size chosen so one hour is about the same number of pixels on both axes (distances look right) */
export const PLOT_W = 520
export const PLOT_H = 373

export const PASS_C = 'var(--viz-2)'
export const FAIL_C = 'var(--viz-1)'
export const PASS_BG = 'color-mix(in srgb, var(--viz-2) 20%, var(--surface))'
export const FAIL_BG = 'color-mix(in srgb, var(--viz-1) 17%, var(--surface))'
export const colourOf = (pass: boolean) => (pass ? PASS_C : FAIL_C)

export const dist2 = (ax: number, ay: number, bx: number, by: number) => (ax - bx) ** 2 + (ay - by) ** 2

export interface KnnResult {
  pass: boolean
  /** indices into data, nearest first */
  neighbours: number[]
  passVotes: number
  failVotes: number
}

/** k-nearest-neighbour vote (k odd, two classes, so there is never a tie in the vote) */
export function knn(data: Student[], qx: number, qy: number, k: number): KnnResult {
  const order = data.map((_, i) => i).sort((a, b) => dist2(qx, qy, data[a].x, data[a].y) - dist2(qx, qy, data[b].x, data[b].y) || a - b)
  const neighbours = order.slice(0, k)
  const passVotes = neighbours.filter((i) => data[i].pass).length
  return { pass: passVotes * 2 > k, neighbours, passVotes, failVotes: k - passVotes }
}

/** fast majority vote only (used to colour the background grid) */
export function knnPass(data: Student[], qx: number, qy: number, k: number): boolean {
  const d = data.map((p, i) => [dist2(qx, qy, p.x, p.y), i] as const)
  d.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  let votes = 0
  for (let j = 0; j < k; j++) if (data[d[j][1]].pass) votes++
  return votes * 2 > k
}

export interface Run {
  x0: number
  x1: number
  y0: number
  y1: number
  pass: boolean
}

/** Colour a grid of cells by a classifier, merging neighbouring cells in a row into one rectangle. */
export function regionRuns(pred: (x: number, y: number) => boolean, nx = 100, ny = 70): Run[] {
  const [x0, x1] = X_RANGE
  const [y0, y1] = Y_RANGE
  const dx = (x1 - x0) / nx
  const dy = (y1 - y0) / ny
  const runs: Run[] = []
  for (let j = 0; j < ny; j++) {
    const yc = y0 + (j + 0.5) * dy
    let start = 0
    let cur = pred(x0 + 0.5 * dx, yc)
    for (let i = 1; i <= nx; i++) {
      const v = i < nx ? pred(x0 + (i + 0.5) * dx, yc) : !cur
      if (v !== cur || i === nx) {
        runs.push({ x0: x0 + start * dx, x1: x0 + i * dx, y0: y0 + j * dy, y1: y0 + (j + 1) * dy, pass: cur })
        start = i
        cur = v
      }
    }
  }
  return runs
}

/** A straight-line classifier: pass when a·x + b·y > c. */
export interface LineRule {
  a: number
  b: number
  c: number
}

export const linePass = (r: LineRule, x: number, y: number) => r.a * x + r.b * y > r.c
export const countCorrect = (r: LineRule, data: Student[]) => data.filter((p) => linePass(r, p.x, p.y) === p.pass).length

/**
 * Rule for the line through A and B, oriented so that the side with more correct predictions is "pass".
 * Scaled so the larger of |a|, |b| is 1.
 */
export function ruleFromPoints(A: [number, number], B: [number, number], data: Student[]): LineRule {
  let a = B[1] - A[1]
  let b = -(B[0] - A[0])
  const s = Math.max(Math.abs(a), Math.abs(b)) || 1
  a /= s
  b /= s
  let r: LineRule = { a, b, c: a * A[0] + b * A[1] }
  const flipped: LineRule = { a: -r.a, b: -r.b, c: -r.c }
  if (countCorrect(flipped, data) > countCorrect(r, data)) r = flipped
  return r
}

/**
 * The best straight line for the training data, found by brute force: try 360 directions; for each, try a
 * threshold half-way between every pair of neighbouring projected points; keep the most correct, breaking
 * ties by the widest gap (so the line sits in the middle of the empty space).
 */
export function bestLine(data: Student[]): LineRule {
  let best: { correct: number; gap: number; rule: LineRule } | null = null
  for (let i = 0; i < 360; i++) {
    const ang = (i * Math.PI) / 360
    const a = Math.cos(ang)
    const b = Math.sin(ang)
    const proj = data.map((p) => a * p.x + b * p.y).sort((u, v) => u - v)
    for (let j = 0; j < proj.length - 1; j++) {
      const gap = proj[j + 1] - proj[j]
      if (gap < 1e-9) continue
      const c = (proj[j] + proj[j + 1]) / 2
      for (const sgn of [1, -1]) {
        const rule = { a: sgn * a, b: sgn * b, c: sgn * c }
        const correct = countCorrect(rule, data)
        if (!best || correct > best.correct || (correct === best.correct && gap > best.gap)) best = { correct, gap, rule }
      }
    }
  }
  const r = best!.rule
  const s = Math.max(Math.abs(r.a), Math.abs(r.b))
  return { a: r.a / s, b: r.b / s, c: r.c / s }
}

/** Two points where the line a·x + b·y = c crosses the plot box (inset a little), for drawing handles. */
export function handlesFor(r: LineRule, inset = 0.4): [[number, number], [number, number]] {
  const [x0, x1] = X_RANGE
  const [y0, y1] = Y_RANGE
  const pts: [number, number][] = []
  const add = (x: number, y: number) => {
    if (x >= x0 - 1e-9 && x <= x1 + 1e-9 && y >= y0 - 1e-9 && y <= y1 + 1e-9) pts.push([x, y])
  }
  if (Math.abs(r.b) > 1e-9) {
    add(x0, (r.c - r.a * x0) / r.b)
    add(x1, (r.c - r.a * x1) / r.b)
  }
  if (Math.abs(r.a) > 1e-9) {
    add((r.c - r.b * y0) / r.a, y0)
    add((r.c - r.b * y1) / r.a, y1)
  }
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1])
  const P = pts[0]
  const Q = pts[pts.length - 1]
  const len = Math.hypot(Q[0] - P[0], Q[1] - P[1]) || 1
  const ux = (Q[0] - P[0]) / len
  const uy = (Q[1] - P[1]) / len
  return [
    [P[0] + ux * inset, P[1] + uy * inset],
    [Q[0] - ux * inset, Q[1] - uy * inset],
  ]
}

/** Polygon of the plot box on the side where a·x + b·y − c has sign `sign` (Sutherland–Hodgman, one edge). */
export function halfPlane(r: LineRule, sign: 1 | -1): [number, number][] {
  const [x0, x1] = X_RANGE
  const [y0, y1] = Y_RANGE
  const box: [number, number][] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]
  const f = (p: [number, number]) => sign * (r.a * p[0] + r.b * p[1] - r.c)
  const out: [number, number][] = []
  for (let i = 0; i < box.length; i++) {
    const P = box[i]
    const Q = box[(i + 1) % box.length]
    const fp = f(P)
    const fq = f(Q)
    if (fp >= 0) out.push(P)
    if ((fp >= 0) !== (fq >= 0)) {
      const t = fp / (fp - fq)
      out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])])
    }
  }
  return out
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** "1.00 × revision + 0.60 × sleep > 8.91" with proper minus signs */
export function ruleText(r: LineRule): string {
  const term = (v: number, name: string, first: boolean) => {
    const sgn = v < 0 ? '−' : '+'
    const mag = Math.abs(v).toFixed(2)
    return first ? `${v < 0 ? '−' : ''}${mag} × ${name}` : ` ${sgn} ${mag} × ${name}`
  }
  return `${term(r.a, 'revision', true)}${term(r.b, 'sleep', false)} > ${r.c < 0 ? '−' : ''}${Math.abs(r.c).toFixed(2)}`
}
