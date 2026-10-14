/* Small maths helpers shared by this lesson's visuals. */

/** Error function, Abramowitz & Stegun 7.1.26 (absolute error below 1.5e-7). */
export function erf(x: number): number {
  const s = x < 0 ? -1 : 1
  const a = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * a)
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)
  return s * y
}

/** Normal density with mean mu and standard deviation sigma. */
export const normalPdf = (x: number, mu = 0, sigma = 1) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))

/** P(X ≤ x) for X ~ N(mu, sigma²). */
export const normalCdf = (x: number, mu = 0, sigma = 1) => 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)))

/** One standard-normal draw from two uniforms (Box–Muller). */
export function gauss(rng: () => number): number {
  const u = Math.max(1e-12, rng())
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Trim trailing zeros: 3.50 -> "3.5", 2.000 -> "2". */
export const fmt = (v: number, dp = 2) => {
  const r = Number(v.toFixed(dp))
  return String(Object.is(r, -0) ? 0 : r)
}
