import { mulberry32 } from '../../../../../kit'
import { patchCoverage, type ObjectLabel } from './scene'

/*
  A tiny, randomly initialised one-layer, one-head Transformer used to show why ViTs need
  position embeddings. Nothing here is trained: the point is a property of attention itself.

  Tokens: [CLS] + 9 patch tokens (a 3 × 3 grid of the garden picture).
  Patch token = E · (coverage of each object in the patch)  [+ position embedding of its slot]
  Output = the [CLS] token after one attention step: c + Σ_j softmax_j(q·k_j / √d) v_j
*/

export const D = 4
const OBJ: ObjectLabel[] = ['sky', 'sun', 'grass', 'trunk', 'leaves', 'cat', 'ball']

function normals(seed: number, count: number, scale: number): number[] {
  const r = mulberry32(seed)
  const out: number[] = []
  while (out.length < count) {
    const u = Math.max(1e-12, r())
    const v = r()
    const m = Math.sqrt(-2 * Math.log(u))
    out.push(m * Math.cos(2 * Math.PI * v) * scale, m * Math.sin(2 * Math.PI * v) * scale)
  }
  return out.slice(0, count)
}
const mat = (seed: number, rows: number, cols: number, scale: number) => {
  const f = normals(seed, rows * cols, scale)
  return Array.from({ length: rows }, (_, i) => f.slice(i * cols, (i + 1) * cols))
}
const mv = (A: number[][], x: number[]) => A.map((row) => row.reduce((a, w, j) => a + w * x[j], 0))
const add = (a: number[], b: number[]) => a.map((v, i) => v + b[i])
const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0)

const E = mat(11, D, OBJ.length, 1.2)
const WQ = mat(12, D, D, 0.8)
const WK = mat(13, D, D, 0.8)
const WV = mat(14, D, D, 0.8)
const CLS = normals(15, D, 0.6)
/** one learned position embedding per position: 0 = [CLS], 1..9 = patch slots */
export const POS = mat(16, 10, D, 0.9)

/** content embedding of each of the 9 patches (row-major) */
export const PATCH_EMB: number[][] = Array.from({ length: 9 }, (_, i) => {
  const cov = patchCoverage(3, Math.floor(i / 3), i % 3)
  return mv(E, OBJ.map((o) => cov[o]))
})

/**
 * [CLS] output when slot j (0..8) holds patch perm[j].
 * Returns the output vector and the attention weights of [CLS] over [CLS] + 9 slots.
 */
export function clsOutput(perm: number[], usePos: boolean): { out: number[]; attn: number[] } {
  const tokens: number[][] = [usePos ? add(CLS, POS[0]) : CLS.slice()]
  perm.forEach((p, j) => tokens.push(usePos ? add(PATCH_EMB[p], POS[j + 1]) : PATCH_EMB[p].slice()))
  const q = mv(WQ, tokens[0])
  const scores = tokens.map((t) => dot(q, mv(WK, t)) / Math.sqrt(D))
  const m = Math.max(...scores)
  const ex = scores.map((s) => Math.exp(s - m))
  const z = ex.reduce((a, b) => a + b, 0)
  const attn = ex.map((e) => e / z)
  let out = tokens[0].slice()
  tokens.forEach((t, j) => {
    const v = mv(WV, t)
    out = out.map((o, i) => o + attn[j] * v[i])
  })
  return { out, attn }
}
