import { usePlot } from '../../../../../kit'
import type { P } from '../vectors/shared'

/** Shared drawing helpers for the "dot-product-and-norms" visuals (not a visual itself). */

export const dot = (a: P, b: P) => a[0] * b[0] + a[1] * b[1]
export const len = (a: P) => Math.hypot(a[0], a[1])
export const cosOf = (a: P, b: P) => {
  const d = len(a) * len(b)
  return d < 1e-12 ? 0 : Math.max(-1, Math.min(1, dot(a, b) / d))
}
export const degOf = (a: P, b: P) => (Math.acos(cosOf(a, b)) * 180) / Math.PI

/** Green for agreement, grey for perpendicular, red for disagreement, blended by strength. */
export function signColour(c: number): string {
  if (Math.abs(c) < 0.005) return 'var(--viz-muted)'
  const pct = Math.round(40 + 60 * Math.min(1, Math.abs(c)))
  return `color-mix(in srgb, ${c > 0 ? 'var(--viz-pos)' : 'var(--viz-neg)'} ${pct}%, var(--viz-muted))`
}

/** Arc marking the angle between two directions at the origin, with a text label. */
export function AngleArc({ a, b, r = 26, label, color = 'var(--viz-ink)', hideArc }: { a: P; b: P; r?: number; label?: string; color?: string; hideArc?: boolean }) {
  const { xs, ys } = usePlot()
  if (len(a) < 1e-9 || len(b) < 1e-9) return null
  const ox = xs(0)
  const oy = ys(0)
  // screen angles (y flipped)
  const ta = Math.atan2(-(ys(a[1]) - oy), xs(a[0]) - ox)
  const tb = Math.atan2(-(ys(b[1]) - oy), xs(b[0]) - ox)
  let d = tb - ta
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  const steps = 24
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const t = ta + (d * i) / steps
    path += `${i ? 'L' : 'M'}${(ox + r * Math.cos(t)).toFixed(2)},${(oy - r * Math.sin(t)).toFixed(2)}`
  }
  const mid = ta + d / 2
  const lr = r + 16
  return (
    <g>
      {!hideArc && Math.abs(d) > 0.01 && <path d={path} style={{ fill: 'none', stroke: color, strokeWidth: 1.8 }} />}
      {label && (
        <text
          className="plot-label"
          x={ox + lr * Math.cos(mid)}
          y={oy - lr * Math.sin(mid)}
          dy="0.35em"
          textAnchor="middle"
          style={{ fill: color, fontSize: 13, fontWeight: 700 }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** Small square marking a right angle at `at`, between directions `d1` and `d2` (data coords). */
export function RightAngle({ at, d1, d2, size = 9, color = 'var(--viz-ink)' }: { at: P; d1: P; d2: P; size?: number; color?: string }) {
  const { xs, ys } = usePlot()
  const px = xs(at[0])
  const py = ys(at[1])
  const unit = (d: P): [number, number] => {
    const sx = xs(at[0] + d[0]) - px
    const sy = ys(at[1] + d[1]) - py
    const l = Math.hypot(sx, sy)
    return l < 1e-9 ? [0, 0] : [sx / l, sy / l]
  }
  const [ax, ay] = unit(d1)
  const [bx, by] = unit(d2)
  const p1 = [px + ax * size, py + ay * size]
  const p2 = [px + (ax + bx) * size, py + (ay + by) * size]
  const p3 = [px + bx * size, py + by * size]
  return <path d={`M${p1[0]},${p1[1]}L${p2[0]},${p2[1]}L${p3[0]},${p3[1]}`} style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
}

/** The whole line through the origin along direction d, clipped to the plot. */
export function LineThrough({ d, color = 'var(--viz-muted)', dash = '3 6', width = 1.5 }: { d: P; color?: string; dash?: string; width?: number }) {
  const { xs, ys, clipId } = usePlot()
  const l = len(d)
  if (l < 1e-9) return null
  const k = 100 / l
  return (
    <line
      clipPath={`url(#${clipId})`}
      x1={xs(-d[0] * k)}
      y1={ys(-d[1] * k)}
      x2={xs(d[0] * k)}
      y2={ys(d[1] * k)}
      style={{ stroke: color, strokeWidth: width, strokeDasharray: dash }}
      strokeLinecap="round"
    />
  )
}
