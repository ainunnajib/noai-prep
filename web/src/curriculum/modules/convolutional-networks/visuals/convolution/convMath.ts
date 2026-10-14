/*
  Convolution maths shared by this module's visuals. As in PyTorch, "convolution" here is
  cross-correlation: the kernel is NOT flipped. out[i][j] = Σ_a Σ_b x[i+a][j+b] · k[a][b].
*/

export type Grid = number[][]

export interface Kernel {
  name: string
  /** integer weights, shown to the learner */
  w: Grid
  /** the weighted sum is divided by this (1 for most kernels, 9 for a box blur) */
  div: number
  blurb: string
}

export const PRESETS: Kernel[] = [
  {
    name: 'Vertical edges',
    w: [
      [1, 0, -1],
      [1, 0, -1],
      [1, 0, -1],
    ],
    div: 1,
    blurb: 'left column minus right column: large where brightness changes from left to right, 0 on flat areas',
  },
  {
    name: 'Horizontal edges',
    w: [
      [1, 1, 1],
      [0, 0, 0],
      [-1, -1, -1],
    ],
    div: 1,
    blurb: 'top row minus bottom row: large where brightness changes from top to bottom',
  },
  {
    name: 'Blur',
    w: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    div: 9,
    blurb: 'the average of the 9 pixels: smooths out detail',
  },
  {
    name: 'Sharpen',
    w: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
    div: 1,
    blurb: 'boosts a pixel that differs from its 4 neighbours, so edges look crisper',
  },
]

/** 'valid' convolution (no padding, stride 1): output is (H − k + 1) × (W − k + 1). */
export function conv2d(x: Grid, k: Grid, div = 1): Grid {
  const H = x.length
  const W = x[0].length
  const K = k.length
  const out: Grid = []
  for (let i = 0; i + K <= H; i++) {
    const row: number[] = []
    for (let j = 0; j + K <= W; j++) {
      let s = 0
      for (let a = 0; a < K; a++) for (let b = 0; b < K; b++) s += x[i + a][j + b] * k[a][b]
      row.push(s / div)
    }
    out.push(row)
  }
  return out
}

export const patchAt = (x: Grid, i: number, j: number, K: number): Grid => Array.from({ length: K }, (_, a) => x[i + a].slice(j, j + K))

/** Format a number compactly: integers as is, otherwise 2 decimals without trailing zeros. */
export function fmtNum(v: number): string {
  if (Math.abs(v) < 1e-9) return '0'
  if (Number.isInteger(v)) return String(v).replace('-', '−')
  return (Math.round(v * 100) / 100).toString().replace('-', '−')
}

/** Weight cycle used when a learner taps a kernel cell. */
export const nextWeight = (v: number) => (v >= 2 ? -2 : v + 1)
