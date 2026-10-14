import { mulberry32 } from '../../../../../kit'
import { gaussian } from './sim'

/*
  Toy model for the residual-highway visual. The gradient is a vector of size DIM. Each block's own layers act on it
  with a random matrix J (entries ~ N(0, s²/DIM), so on average the block shrinks the gradient by a factor s).
    plain block:     g ← Jᵀ g
    residual block:  g ← g + Jᵀ g      (because y = x + F(x) gives ∂y/∂x = I + J)
  Both stacks use the very same blocks; only the skip connection differs.
*/

export const DIM = 16
export const MAX_BLOCKS = 30

export interface Blocks {
  J: Float64Array[]
  g0: Float64Array
}

export function makeBlocks(seed: number): Blocks {
  const rng = mulberry32(seed)
  const J: Float64Array[] = []
  for (let b = 0; b < MAX_BLOCKS; b++) {
    const m = new Float64Array(DIM * DIM)
    for (let i = 0; i < m.length; i++) m[i] = gaussian(rng) / Math.sqrt(DIM)
    J.push(m)
  }
  const g0 = new Float64Array(DIM)
  let n = 0
  for (let i = 0; i < DIM; i++) {
    g0[i] = gaussian(rng)
    n += g0[i] * g0[i]
  }
  for (let i = 0; i < DIM; i++) g0[i] /= Math.sqrt(n)
  return { J, g0 }
}

/**
 * Size of the gradient arriving at each block (index 0 = first block, nearest the input) and at the input itself.
 * at[i] is the norm of the gradient arriving at the OUTPUT of block i; atInput is after passing block 0.
 */
export function highwayNorms(bl: Blocks, depth: number, s: number, residual: boolean): { at: number[]; atInput: number } {
  let g = Float64Array.from(bl.g0)
  const at = new Array<number>(depth).fill(0)
  const norm = (v: Float64Array) => Math.sqrt(v.reduce((a, x) => a + x * x, 0))
  for (let b = depth - 1; b >= 0; b--) {
    at[b] = norm(g)
    const J = bl.J[b]
    const next = new Float64Array(DIM)
    // (Jᵀ g)_i = Σ_j J[j][i] g_j
    for (let i = 0; i < DIM; i++) {
      let acc = 0
      for (let j = 0; j < DIM; j++) acc += J[j * DIM + i] * g[j]
      next[i] = s * acc + (residual ? g[i] : 0)
    }
    g = next
  }
  return { at, atInput: norm(g) }
}
