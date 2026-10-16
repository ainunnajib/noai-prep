/* Number formatting shared by the algorithms-and-complexity visuals. */

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }

/** 12 -> "¹²" */
export const sup = (k: number) =>
  String(k)
    .split('')
    .map((c) => SUP[c] ?? c)
    .join('')

/** Group digits: 1234567 -> "1,234,567" */
export const comma = (v: number) => Math.round(v).toLocaleString('en-GB')

/** A positive quantity given by its base-10 logarithm, as "1.1 × 10¹⁵" (or plain digits when small). */
export function fromLog10(lg: number, plainBelow = 9): string {
  if (lg < plainBelow) {
    const v = Math.pow(10, lg)
    if (v < 100 && Math.abs(v - Math.round(v)) > 0.05) return v.toFixed(1)
    return comma(v)
  }
  let e = Math.floor(lg)
  let m = Math.pow(10, lg - e)
  if (m >= 9.95) {
    m = 1
    e += 1
  }
  // For astronomically large numbers the mantissa is meaningless noise; show the rounded power only.
  if (lg > 1000) return `≈ 10${sup(Math.round(lg))}`
  return `${m.toFixed(1)} × 10${sup(e)}`
}

const LOG_SEC_PER_YEAR = Math.log10(365.25 * 24 * 3600)

/** Duration of 10^lgSteps steps at one microsecond per step. */
export function timeAtMicrosecond(lgSteps: number): string {
  const lgSec = lgSteps - 6
  const sec = lgSec < 30 ? Math.pow(10, lgSec) : Infinity
  const nice = (v: number, unit: string) => `${v < 10 ? v.toFixed(1).replace(/\.0$/, '') : comma(v)} ${unit}`
  if (sec < 1e-3) return nice(sec * 1e6, 'µs')
  if (sec < 1) return nice(sec * 1e3, 'ms')
  if (sec < 60) return nice(sec, 's')
  if (sec < 3600) return nice(sec / 60, 'min')
  if (sec < 86400) return nice(sec / 3600, 'h')
  if (sec < 86400 * 365.25) return nice(sec / 86400, 'days')
  const lgYears = lgSec - LOG_SEC_PER_YEAR
  if (lgYears < 6) return nice(Math.pow(10, lgYears), 'years')
  return `${fromLog10(lgYears, 0)} years`
}
