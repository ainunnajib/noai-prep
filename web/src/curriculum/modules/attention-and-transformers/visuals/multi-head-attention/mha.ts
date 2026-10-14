/* Small maths helpers shared by the multi-head-attention visuals. */
import { mulberry32 } from '../../../../../kit'

export type Mat = number[][]

/** One colour per head. Six theme colours, then two theme mixes, so light and dark both work. */
export const HEAD_COLOURS = [
  'var(--viz-1)',
  'var(--viz-2)',
  'var(--viz-3)',
  'var(--viz-4)',
  'var(--viz-5)',
  'var(--viz-6)',
  'color-mix(in srgb, var(--viz-1) 55%, var(--viz-3))',
  'color-mix(in srgb, var(--viz-2) 55%, var(--viz-4))',
]

export const headColour = (i: number) => HEAD_COLOURS[i % HEAD_COLOURS.length]

/** Tint a theme colour towards the surface: t = 0 gives the surface, t = 1 the full colour. */
export const tint = (colour: string, t: number) =>
  `color-mix(in srgb, ${colour} ${Math.round(Math.max(0, Math.min(1, t)) * 100)}%, var(--surface))`

/** Numerically safe softmax over one row. */
export function softmax(row: number[]): number[] {
  const m = Math.max(...row)
  const e = row.map((v) => Math.exp(v - m))
  const z = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / z)
}

export function matmul(a: Mat, b: Mat): Mat {
  const n = a.length
  const k = b.length
  const m = b[0].length
  const out: Mat = Array.from({ length: n }, () => new Array(m).fill(0))
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    let s = 0
    for (let t = 0; t < k; t++) s += a[i][t] * b[t][j]
    out[i][j] = s
  }
  return out
}

export const transpose = (a: Mat): Mat => a[0].map((_, j) => a.map((row) => row[j]))

/** Columns c0..c1-1 of a matrix (one head's slice). */
export const cols = (a: Mat, c0: number, c1: number): Mat => a.map((row) => row.slice(c0, c1))

/** Deterministic matrix of roughly standard-normal numbers (sum of uniforms), scaled. */
export function randMat(rows: number, columns: number, seed: number, scale = 1): Mat {
  const rng = mulberry32(seed)
  const gauss = () => (rng() + rng() + rng() + rng() - 2) * Math.sqrt(3)
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => gauss() * scale))
}

/** Scaled dot-product attention for one head: returns the weights (T × T) and the output (T × d_k). */
export function attention(Q: Mat, K: Mat, V: Mat) {
  const dk = Q[0].length
  const scores = matmul(Q, transpose(K)).map((row) => row.map((v) => v / Math.sqrt(dk)))
  const weights = scores.map(softmax)
  return { weights, out: matmul(weights, V) }
}

/** 1,050,624 style thousands separators. */
export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-GB')
