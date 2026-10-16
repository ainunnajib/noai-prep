/*
  Small drawing helpers shared by this lesson's visuals: heat-map fills from theme tokens,
  number formatting, and pooling arithmetic (the same formulas the lesson teaches).
*/

/** Fill for a value in [lo, hi] as a heat-map cell (indigo on the card surface). */
export function heat(v: number, lo: number, hi: number, maxPct = 58): string {
  const t = hi === lo ? 0 : Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
  return `color-mix(in srgb, var(--viz-1) ${Math.round(4 + t * (maxPct - 4))}%, var(--surface))`
}

/** Integers as-is, other numbers with up to two decimals (2.75, 2.5, 2.56). */
export function fmt(v: number): string {
  if (Number.isInteger(v)) return String(v)
  const r = Math.round(v * 100) / 100
  return String(r)
}

/** True when v needs rounding to show with two decimals (e.g. 23/9). */
export const isRounded = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9

/** Output length of a pooling (or unpadded conv) window sweep: ⌊(n − k)/s⌋ + 1. */
export const outLen = (n: number, k: number, s: number) => (n < k ? 0 : Math.floor((n - k) / s) + 1)

export type Kind = 'max' | 'avg'

/** Pool a 2-D array with a k×k window and stride s (no padding). */
export function pool2d(x: number[][], k: number, s: number, kind: Kind): number[][] {
  const H = outLen(x.length, k, s)
  const W = outLen(x[0].length, k, s)
  return Array.from({ length: H }, (_, i) =>
    Array.from({ length: W }, (_, j) => {
      const win = windowValues(x, i, j, k, s)
      return kind === 'max' ? Math.max(...win) : win.reduce((a, b) => a + b, 0) / win.length
    }),
  )
}

export function windowValues(x: number[][], i: number, j: number, k: number, s: number): number[] {
  const out: number[] = []
  for (let r = i * s; r < i * s + k; r++) for (let c = j * s; c < j * s + k; c++) out.push(x[r][c])
  return out
}

/** Shared SVG text style for numbers inside cells. */
export const cellText = {
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
  fill: 'var(--ink)',
} as const
