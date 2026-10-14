/*
  Small numerical helpers shared by the curse-of-dimensionality visuals.
  Pure functions only (no React), so they can be checked from the command line.
*/
import { mulberry32 } from '../../../../../kit'

/** n × d matrix of Uniform(0, 1) numbers, stored row by row in one flat array. */
export function uniformMatrix(seed: number, n: number, d: number): Float64Array {
  const rnd = mulberry32(seed)
  const out = new Float64Array(n * d)
  for (let i = 0; i < out.length; i++) out[i] = rnd()
  return out
}

/** A standard normal sampler (Box–Muller) driven by a seeded uniform generator. */
export function gaussian(rnd: () => number): () => number {
  let spare: number | null = null
  return () => {
    if (spare !== null) {
      const s = spare
      spare = null
      return s
    }
    const u = Math.max(1e-12, rnd())
    const v = rnd()
    const r = Math.sqrt(-2 * Math.log(u))
    spare = r * Math.sin(2 * Math.PI * v)
    return r * Math.cos(2 * Math.PI * v)
  }
}

/** Solve the square system M x = b by Gaussian elimination with partial pivoting. */
export function solve(M: number[][], b: number[]): number[] {
  const n = b.length
  const A = M.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
    ;[A[c], A[p]] = [A[p], A[c]]
    const piv = Math.abs(A[c][c]) < 1e-12 ? 1e-12 : A[c][c]
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / piv
      if (f === 0) continue
      for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]
    }
  }
  const x = new Array<number>(n).fill(0)
  for (let r = n - 1; r >= 0; r--) {
    let s = A[r][n]
    for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k]
    x[r] = s / (Math.abs(A[r][r]) < 1e-12 ? 1e-12 : A[r][r])
  }
  return x
}

/**
 * Least-squares weights for A w ≈ y. With at least as many rows as columns this is the usual
 * normal-equations solution; with more columns than rows (more parameters than samples) it is
 * the minimum-norm solution that fits every row exactly, i.e. what numpy.linalg.pinv gives.
 */
export function leastSquares(A: number[][], y: number[]): number[] {
  const n = A.length
  const k = A[0].length
  if (k <= n) {
    const M = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => A.reduce((s, row) => s + row[i] * row[j], 0)))
    const b = Array.from({ length: k }, (_, i) => A.reduce((s, row, r) => s + row[i] * y[r], 0))
    return solve(M, b)
  }
  const G = A.map((ri) => A.map((rj) => ri.reduce((s, v, t) => s + v * rj[t], 0)))
  const z = solve(G, y)
  return Array.from({ length: k }, (_, j) => A.reduce((s, row, r) => s + row[j] * z[r], 0))
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
/** 10 with a superscript exponent, e.g. "10⁻³". */
export const pow10 = (e: number) => '10' + String(e).split('').map((c) => SUP[c] ?? c).join('')

/** Whole numbers with thousands separators; huge ones as "1.0 × 10²¹". */
export function fmtBig(v: number): string {
  if (!Number.isFinite(v)) return '∞'
  if (v < 1e6) return Math.round(v).toLocaleString('en-GB')
  const e = Math.floor(Math.log10(v))
  return `${(v / 10 ** e).toFixed(1)} × ${pow10(e)}`
}

/** A share (0..1) as a percentage that stays readable when it is tiny. */
export function fmtPct(f: number): string {
  const p = f * 100
  if (p >= 10) return `${p.toFixed(0)}%`
  if (p >= 1) return `${p.toFixed(1)}%`
  if (p >= 0.01) return `${p.toPrecision(2)}%`
  const e = Math.floor(Math.log10(p))
  return `${(p / 10 ** e).toFixed(1)} × ${pow10(e)} %`
}
