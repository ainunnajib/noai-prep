/*
  The running example for this lesson: 8 HDB flats.
  To keep the numbers small, area is in hundreds of square metres (0.9 means 90 m²) and
  price is in hundreds of thousands of dollars (5.4 means $540,000).

  Model: price = w × area (one knob, w; the intercept b is fixed at 0, and a line through the origin fits these flats well).
  The data were chosen so that the mean of area² is exactly 1 and the best w is exactly 6, which makes
  the loss (MSE) exactly L(w) = (w − 6)² + 0.1 and its slope exactly 2(w − 6).
  The functions below compute everything from the data, so the visuals never rely on that shortcut.
*/

export const AREA = [0.6, 0.7, 0.9, 1.0, 1.0, 1.1, 1.2, 1.3]
export const PRICE = [3.4, 4.6, 5.0, 5.8, 6.4, 6.8, 6.8, 8.0]
export const N = AREA.length

/** mean squared error of the line price = w × area */
export function loss(w: number): number {
  let s = 0
  for (let i = 0; i < N; i++) {
    const r = PRICE[i] - w * AREA[i]
    s += r * r
  }
  return s / N
}

/** slope of the loss curve at w (how fast the loss changes as w changes) */
export function slope(w: number): number {
  let s = 0
  for (let i = 0; i < N; i++) s += AREA[i] * (w * AREA[i] - PRICE[i])
  return (2 * s) / N
}

export const BEST_W = 6

/** Up to `dp` decimals, trailing zeros removed; −0 shown as 0; huge numbers in e-notation. */
export function fmt(v: number, dp = 2): string {
  if (!Number.isFinite(v)) return '∞'
  if (Math.abs(v) >= 1e5) return v.toExponential(1).replace('e+', '×10^')
  const r = Math.round(v * 10 ** dp) / 10 ** dp
  return String(Object.is(r, -0) ? 0 : r)
}

/** Fixed decimals, for read-outs that should not jump around. */
export function fixed(v: number, dp = 2): string {
  if (!Number.isFinite(v)) return '∞'
  if (Math.abs(v) >= 1e5) return v.toExponential(1).replace('e+', '×10^')
  const s = v.toFixed(dp)
  return s === `-${(0).toFixed(dp)}` ? (0).toFixed(dp) : s
}

/** wrap negatives in brackets for arithmetic like 1 − 0.1 × (−10) */
export const paren = (s: string) => (s.startsWith('-') ? `(${s.replace('-', '−')})` : s)
export const minus = (s: string) => s.replace('-', '−')

/** Does the browser ask for reduced motion? (false during server rendering) */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
