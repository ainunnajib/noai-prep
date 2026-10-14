import type { CSSProperties, ReactNode } from 'react'
import { usePlot } from '../../../../../kit'

/*
  Small drawing helpers shared by this module's calculus visuals (derivatives-as-slopes,
  derivative-rules, chain-rule). Everything is in data coordinates, like the kit's Plot.
*/

/** Clip children (arrows, labels, custom shapes) to the plotting area. */
export function Clipped({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

/** A short tangent segment through (x, y) with the given slope, with a fixed on-screen half-length in px. */
export function TangentSeg({
  x,
  y,
  slope,
  len = 70,
  color = 'var(--viz-ink)',
  width = 2.5,
  dash,
}: {
  x: number
  y: number
  slope: number
  len?: number
  color?: string
  width?: number
  dash?: string
}) {
  const { xs, ys, clipId } = usePlot()
  if (!Number.isFinite(slope) || !Number.isFinite(y)) return null
  const px = xs(x)
  const py = ys(y)
  const dx = xs(x + 1) - px
  const dy = ys(y + slope) - py
  const n = Math.hypot(dx, dy) || 1
  const ux = (dx / n) * len
  const uy = (dy / n) * len
  return (
    <line
      x1={px - ux}
      y1={py - uy}
      x2={px + ux}
      y2={py + uy}
      clipPath={`url(#${clipId})`}
      style={{ stroke: color, strokeWidth: width, strokeDasharray: dash }}
      strokeLinecap="round"
    />
  )
}

/** A straight line through (x, y) with the given slope, drawn across the whole x-domain (clipped). */
export function LineThrough({
  x,
  y,
  slope,
  color = 'var(--viz-ink)',
  width = 2,
  dash,
  opacity = 1,
}: {
  x: number
  y: number
  slope: number
  color?: string
  width?: number
  dash?: string
  opacity?: number
}) {
  const { xs, clipId, ys } = usePlot()
  if (!Number.isFinite(slope) || !Number.isFinite(y)) return null
  const [a, b] = xs.domain()
  const pts: [number, number][] = [
    [a, y + slope * (a - x)],
    [b, y + slope * (b - x)],
  ]
  const clampY = (v: number) => Math.max(-1e4, Math.min(1e4, ys(v)))
  return (
    <line
      x1={xs(pts[0][0])}
      y1={clampY(pts[0][1])}
      x2={xs(pts[1][0])}
      y2={clampY(pts[1][1])}
      clipPath={`url(#${clipId})`}
      style={{ stroke: color, strokeWidth: width, strokeDasharray: dash, opacity }}
      strokeLinecap="round"
    />
  )
}

/** Fixed number of decimals, without "-0.00". */
export function fx(v: number, dp = 2): string {
  if (!Number.isFinite(v)) return v > 0 ? '∞' : v < 0 ? '−∞' : 'undefined'
  const s = v.toFixed(dp)
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s.replace('-', '−')
}

/** Up to `dp` decimals with trailing zeros removed (for arithmetic that should add up on screen). */
export function fs(v: number, dp = 3): string {
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞'
  const r = Math.round(v * 10 ** dp) / 10 ** dp
  const s = String(Object.is(r, -0) ? 0 : r)
  return s.replace('-', '−')
}

/** Same as fs but ASCII minus, for use inside KaTeX strings. */
export function ft(v: number, dp = 3): string {
  const r = Math.round(v * 10 ** dp) / 10 ** dp
  return String(Object.is(r, -0) ? 0 : r)
}

/** Small centred heading over a sub-plot. */
export const panelTitle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 700,
  color: 'var(--ink-2)',
  textAlign: 'center',
  marginBottom: '0.15rem',
}

/** Two panels side by side on wide screens, stacked on phones. */
export function twoCol(narrow: boolean): CSSProperties {
  return {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: narrow ? '1fr' : '1fr 1fr',
    gap: narrow ? '0.75rem' : '1rem',
    alignItems: 'start',
  }
}

/** A compact colour key for the lines in a plot. */
export function Legend({ items }: { items: { color: string; label: ReactNode; dash?: boolean }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1.1rem', justifyContent: 'center', fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 600 }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="26" height="8" aria-hidden="true">
            <line x1="2" y1="4" x2="24" y2="4" style={{ stroke: it.color, strokeWidth: 3, strokeDasharray: it.dash ? '6 4' : undefined }} strokeLinecap="round" />
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  )
}
