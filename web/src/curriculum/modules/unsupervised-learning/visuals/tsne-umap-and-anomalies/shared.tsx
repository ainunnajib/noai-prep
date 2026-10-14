import type { CSSProperties } from 'react'
import { usePlot } from '../../../../../kit'

/* Small helpers shared by this lesson's visuals. */

/** Ten distinguishable colours for the digit classes 0-9, built only from theme tokens. */
export const DIGIT_COLOURS = [
  'var(--viz-1)',
  'var(--viz-2)',
  'var(--viz-3)',
  'var(--viz-4)',
  'var(--viz-5)',
  'var(--viz-6)',
  'var(--viz-neg)',
  'var(--viz-ink)',
  'color-mix(in srgb, var(--viz-1) 45%, var(--viz-3))',
  'var(--viz-muted)',
]

/** colour for a value in [0, 1] along a two-colour ramp (used for the Swiss roll) */
export function rampColour(t: number, steps = 8): string {
  const k = Math.max(0, Math.min(steps - 1, Math.floor(t * steps)))
  const pct = Math.round((100 * k) / (steps - 1))
  return `color-mix(in srgb, var(--viz-2) ${pct}%, var(--viz-1))`
}

export type XY = [number, number]

export function unflatten(flat: number[]): XY[] {
  const out: XY[] = []
  for (let i = 0; i < flat.length; i += 2) out.push([flat[i], flat[i + 1]])
  return out
}

/** indices of the k nearest other points to point i (brute force; fine for a few hundred points) */
export function nearest(pts: XY[], i: number, k: number): number[] {
  const [x, y] = pts[i]
  const d: [number, number][] = []
  for (let j = 0; j < pts.length; j++) if (j !== i) d.push([(pts[j][0] - x) ** 2 + (pts[j][1] - y) ** 2, j])
  d.sort((a, b) => a[0] - b[0])
  return d.slice(0, k).map((e) => e[1])
}

/** average share of each point's true neighbours that are also among its k nearest on the map */
export function neighbourKeep(pts: XY[], nn: number[][], k = 10): number {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const mine = new Set(nearest(pts, i, k))
    s += nn[i].slice(0, k).filter((j) => mine.has(j)).length / k
  }
  return s / pts.length
}

/** index of the point closest to p (in data coordinates) */
export function closest(pts: XY[], p: XY): number {
  let best = 0
  let bd = Infinity
  pts.forEach(([x, y], i) => {
    const d = (x - p[0]) ** 2 + (y - p[1]) ** 2
    if (d < bd) {
      bd = d
      best = i
    }
  })
  return best
}

/**
 * Many small circles drawn as ONE svg path (cheap even for hundreds of points).
 * Must be rendered inside a <Plot>; points are in data coordinates.
 */
export function DotCloud({ pts, r, style }: { pts: XY[]; r: number; style: CSSProperties }) {
  const { xs, ys } = usePlot()
  let d = ''
  for (const [x, y] of pts) {
    const cx = xs(x)
    const cy = ys(y)
    d += `M${(cx - r).toFixed(1)},${cy.toFixed(1)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`
  }
  if (!d) return null
  return <path d={d} style={style} />
}

/** Rings around chosen points (for highlighting neighbours). */
export function Rings({ pts, r, colour, width = 2 }: { pts: XY[]; r: number; colour: string; width?: number }) {
  return <DotCloud pts={pts} r={r} style={{ fill: 'none', stroke: colour, strokeWidth: width }} />
}

/** A light frame around the plotting area (for maps whose axes mean nothing). */
export function Frame() {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const [y0, y1] = ys.range()
  return <rect x={x0} y={y1} width={x1 - x0} height={y0 - y1} style={{ fill: 'none', stroke: 'var(--rule)', strokeWidth: 1 }} rx={6} />
}

/** padded bounding box of several flat coordinate arrays, made square-ish if asked */
export function bounds(flats: number[][], pad = 0.06): { x: [number, number]; y: [number, number] } {
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  for (const f of flats)
    for (let i = 0; i < f.length; i += 2) {
      x0 = Math.min(x0, f[i])
      x1 = Math.max(x1, f[i])
      y0 = Math.min(y0, f[i + 1])
      y1 = Math.max(y1, f[i + 1])
    }
  const px = (x1 - x0) * pad
  const py = (y1 - y0) * pad
  return { x: [x0 - px, x1 + px], y: [y0 - py, y1 + py] }
}
