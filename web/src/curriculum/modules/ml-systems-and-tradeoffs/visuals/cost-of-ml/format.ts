/* Number formatting shared by the cost-of-ml visuals. */

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'

/** 12 -> "¹²", -3 -> "⁻³" */
export function sup(e: number): string {
  return String(e)
    .split('')
    .map((ch) => (ch === '-' ? '⁻' : SUP[Number(ch)] ?? ch))
    .join('')
}

/** "10⁶" for exponent 6 (and "1", "10" for 0, 1) */
export function pow10(e: number): string {
  if (e === 0) return '1'
  if (e === 1) return '10'
  return `10${sup(e)}`
}

/** 33554432 -> "33,554,432" */
export function commas(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** the same, written for KaTeX: "33{,}554{,}432" */
export function texNum(n: number): string {
  return commas(n).replace(/,/g, '{,}')
}

function sig(x: number): string {
  if (x >= 100) return x.toFixed(0)
  if (x >= 10) return x.toFixed(1)
  return x.toFixed(2)
}

/** 33554432 -> "33.6 million" */
export function approx(n: number): string {
  const a = Math.abs(n)
  if (a < 1e3) return Number.isInteger(n) ? String(n) : n.toFixed(1)
  if (a < 1e6) return `${sig(n / 1e3)} thousand`
  if (a < 1e9) return `${sig(n / 1e6)} million`
  if (a < 1e12) return `${sig(n / 1e9)} billion`
  if (a < 1e15) return `${sig(n / 1e12)} trillion`
  const e = Math.floor(Math.log10(a))
  return `${(n / 10 ** e).toFixed(1)} × ${pow10(e)}`
}

/** a duration in seconds, in the friendliest unit */
export function duration(s: number): string {
  if (s < 1e-6) return `${sig(s * 1e9)} ns`
  if (s < 1e-3) return `${sig(s * 1e6)} µs`
  if (s < 1) return `${sig(s * 1e3)} ms`
  if (s < 120) return `${sig(s)} s`
  if (s < 7200) return `${sig(s / 60)} min`
  if (s < 172800) return `${sig(s / 3600)} h`
  if (s < 2 * 31557600) return `${sig(s / 86400)} days`
  return `${sig(s / 31557600)} years`
}
