/* Small maths helpers shared by the attention-intuition visuals. */

export type V2 = [number, number]

export const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1]

/** Numerically safe softmax: subtracting the max changes nothing but avoids overflow. */
export function softmax(s: number[]): number[] {
  const m = Math.max(...s)
  const e = s.map((v) => Math.exp(v - m))
  const z = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / z)
}

/** One-hot vector at the largest score (a "hard" lookup). */
export function hardmax(s: number[]): number[] {
  let best = 0
  s.forEach((v, i) => {
    if (v > s[best]) best = i
  })
  return s.map((_, i) => (i === best ? 1 : 0))
}

/**
 * Weighted average of theme colours, built from nested CSS color-mix() calls so that it
 * follows the light/dark theme. mix(A, B, C) with weights a, b, c = mix(mix(A, B), C).
 */
export function blendColours(colours: string[], w: number[]): string {
  let acc = colours[0]
  let accW = w[0]
  for (let i = 1; i < colours.length; i++) {
    const wi = w[i]
    if (wi <= 1e-12) continue
    if (accW <= 1e-12) {
      acc = colours[i]
      accW = wi
      continue
    }
    const pct = (100 * accW) / (accW + wi)
    acc = `color-mix(in srgb, ${acc} ${pct.toFixed(2)}%, ${colours[i]})`
    accW += wi
  }
  return acc
}

/** e^s in a compact, readable form: 2.72, 30.0, 1 480, 6.6×10⁷ */
export function fmtExp(v: number): string {
  if (v >= 1e5) {
    const e = Math.floor(Math.log10(v))
    const m = v / 10 ** e
    const sup = String(e)
      .split('')
      .map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])
      .join('')
    return `${m.toFixed(1)}×10${sup}`
  }
  if (v >= 1000) return Math.round(v).toLocaleString('en-GB')
  if (v >= 100) return v.toFixed(0)
  if (v >= 10) return v.toFixed(1)
  if (v >= 0.01) return v.toFixed(2)
  return v.toExponential(0).replace('e-', '×10⁻').replace(/⁻(\d+)/, (_, d: string) => '⁻' + d.split('').map((x) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(x)]).join(''))
}

/** Signed number with a true minus sign. */
export const sgn = (v: number, dp = 2) => {
  const r = v.toFixed(dp)
  return Number(r) === 0 ? (0).toFixed(dp) : r.replace('-', '−')
}
