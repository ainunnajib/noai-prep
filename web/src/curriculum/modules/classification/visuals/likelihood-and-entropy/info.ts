/*
  Information-theory helpers for the likelihood-and-entropy visuals.
  Worked example used in the lesson (bits):
    p = (1/2, 1/4, 1/8, 1/8), q = (1/4, 1/8, 1/2, 1/8)
    H(p) = 1.75, H(p, q) = 2.25, KL(p‖q) = 0.5, H(q) = 1.75, H(q, p) = 2.375, KL(q‖p) = 0.625
  (checked with numpy).
*/

export type Units = 'bits' | 'nats'

export const logU = (x: number, u: Units) => (u === 'bits' ? Math.log2(x) : Math.log(x))

/** Entropy H(p) = −Σ p log p (terms with p = 0 contribute 0). */
export function entropy(p: number[], u: Units) {
  let s = 0
  for (const x of p) if (x > 0) s -= x * logU(x, u)
  return s
}

/** Cross-entropy H(p, q) = −Σ p log q. Infinite if q gives 0 to an outcome p says can happen. */
export function crossEntropy(p: number[], q: number[], u: Units) {
  let s = 0
  for (let i = 0; i < p.length; i++) {
    if (p[i] <= 0) continue
    if (q[i] <= 0) return Infinity
    s -= p[i] * logU(q[i], u)
  }
  return s
}

export function kl(p: number[], q: number[], u: Units) {
  const ce = crossEntropy(p, q, u)
  return Number.isFinite(ce) ? Math.max(0, ce - entropy(p, u)) : Infinity
}

/**
 * Set entry i of a probability vector to v (clamped to [0, 1]) and rescale the others so the total
 * stays 1. If the others are all 0, they share the remainder equally.
 */
export function setProb(dist: number[], i: number, v: number) {
  const nv = Math.max(0, Math.min(1, v))
  const rest = 1 - dist[i]
  const out = dist.slice()
  out[i] = nv
  const n = dist.length - 1
  for (let j = 0; j < dist.length; j++) {
    if (j === i) continue
    out[j] = rest > 1e-9 ? (dist[j] / rest) * (1 - nv) : (1 - nv) / n
  }
  return out
}

/** Fixed decimals with a proper minus sign; ∞ for infinity. */
export function fix(v: number, d = 2) {
  if (v === Infinity) return '∞'
  if (!Number.isFinite(v)) return '−∞'
  const s = v.toFixed(d)
  if (/^-0\.?0*$/.test(s)) return s.slice(1)
  return s.replace('-', '−')
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) =>
  String(n)
    .split('')
    .map((c) => (c === '-' ? '⁻' : SUP['0123456789'.indexOf(c)] ?? c))
    .join('')

/** Short labels for very small numbers: 0.0022, or 1.7×10⁻⁶. */
export function small(v: number, digits = 2) {
  if (v === 0) return '0'
  if (Math.abs(v) >= 0.001) return String(Number(v.toPrecision(digits)))
  const e = Math.floor(Math.log10(Math.abs(v)))
  let m = Number((v / 10 ** e).toPrecision(digits))
  let ee = e
  if (Math.abs(m) >= 10) {
    m = m / 10
    ee += 1
  }
  return `${m}×10${sup(ee)}`
}
