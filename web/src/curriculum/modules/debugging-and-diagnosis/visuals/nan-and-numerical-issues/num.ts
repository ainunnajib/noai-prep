/*
  Number-format helpers shared by the visuals of this lesson.
  JavaScript numbers are float64. PyTorch's default is float32, and mixed precision uses float16,
  so we round every intermediate result to the chosen format to reproduce overflow (→ inf),
  underflow (→ 0) and NaN exactly as a GPU would.
*/

export type Fmt = 'float16' | 'float32'

export const F16_MAX = 65504
export const F16_MIN_SUB = 2 ** -24 // 5.96e-8, smallest positive float16
export const F16_MIN_NORMAL = 2 ** -14 // 6.10e-5
export const F32_MAX = 3.4028234663852886e38
export const F32_MIN_SUB = 2 ** -149 // 1.4e-45

/** Round a float64 to the nearest float16 (round-half-to-even), with overflow to ±inf and underflow to 0. */
export function f16(x: number): number {
  if (!Number.isFinite(x) || x === 0) return x
  const s = Math.sign(x)
  const a = Math.abs(x)
  // values from 65520 upwards round to infinity in float16
  if (a >= 65520) return s * Infinity
  let step: number
  if (a < F16_MIN_NORMAL) step = F16_MIN_SUB
  else step = 2 ** (Math.floor(Math.log2(a)) - 10)
  const q = a / step
  let r = Math.round(q)
  if (Math.abs(q - Math.trunc(q) - 0.5) < 1e-12 && r % 2 === 1) r -= 1 // ties to even
  return s * r * step
}

export function round(fmt: Fmt, x: number): number {
  return fmt === 'float16' ? f16(x) : Math.fround(x)
}

/** Short display of a value the way a print-out would show it: inf, -inf, nan, 0, 1.6e+38, 0.6652 … */
export function show(v: number, digits = 4): string {
  if (Number.isNaN(v)) return 'nan'
  if (v === Infinity) return 'inf'
  if (v === -Infinity) return '−inf'
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a >= 1e5 || a < 1e-3) {
    const [m, e] = v.toExponential(1).split('e')
    return `${m.replace('-', '−')}e${e.replace('+', '')}`
  }
  const s = Number(v.toPrecision(digits)).toString()
  return s.replace('-', '−')
}

export function status(v: number): 'ok' | 'inf' | 'nan' {
  if (Number.isNaN(v)) return 'nan'
  if (!Number.isFinite(v)) return 'inf'
  return 'ok'
}
