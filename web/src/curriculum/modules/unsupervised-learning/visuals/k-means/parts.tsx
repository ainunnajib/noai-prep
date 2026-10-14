/*
  Small SVG building blocks shared by the clustering visuals (drawn inside a kit <Plot>).
*/
import { useRef } from 'react'
import { usePlot } from '../../../../../kit'
import type { Pt } from './clustering'

/** A filled polygon in data coordinates (no clipping surprises: it is clipped to the plot area). */
export function Poly({ points, fill, stroke = 'none', width = 1, dash, opacity = 1 }: { points: Pt[]; fill: string; stroke?: string; width?: number; dash?: string; opacity?: number }) {
  const { xs, ys, clipId } = usePlot()
  if (points.length < 3) return null
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${xs(x).toFixed(1)},${ys(y).toFixed(1)}`).join('') + 'Z'
  return <path d={d} clipPath={`url(#${clipId})`} style={{ fill, stroke, strokeWidth: width, strokeDasharray: dash, opacity }} strokeLinejoin="round" />
}

/**
 * A soft "blob" around a set of points: their convex hull drawn with a very thick round stroke,
 * so single points become discs and pairs become capsules.
 */
export function HullBlob({ points, colour, pad = 11, opacity = 0.2 }: { points: Pt[]; colour: string; pad?: number; opacity?: number }) {
  const { xs, ys, clipId } = usePlot()
  if (!points.length) return null
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${xs(x).toFixed(1)},${ys(y).toFixed(1)}`).join('') + (points.length > 2 ? 'Z' : points.length === 1 ? 'l0.01,0' : '')
  return (
    <path
      d={d}
      clipPath={`url(#${clipId})`}
      style={{ fill: colour, stroke: colour, strokeWidth: pad * 2, opacity }}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  )
}

/** A circle whose radius is given in data units (x scale). */
export function DataCircle({ c, r, fill = 'none', stroke = 'var(--viz-muted)', width = 1, dash, opacity = 1 }: { c: Pt; r: number; fill?: string; stroke?: string; width?: number; dash?: string; opacity?: number }) {
  const { xs, ys, clipId } = usePlot()
  const rx = Math.abs(xs(c[0] + r) - xs(c[0]))
  const ry = Math.abs(ys(c[1] + r) - ys(c[1]))
  return <ellipse cx={xs(c[0])} cy={ys(c[1])} rx={rx} ry={ry} clipPath={`url(#${clipId})`} style={{ fill, stroke, strokeWidth: width, strokeDasharray: dash, opacity }} />
}

/** Data points drawn as circles, each with its own colour; optional ring highlight. */
export function PointCloud({
  points,
  colours,
  r = 5,
  ring,
  ringColour = 'var(--viz-ink)',
  opacity,
}: {
  points: Pt[]
  colours: (i: number) => string
  r?: number
  /** indices of points to circle */
  ring?: Set<number>
  ringColour?: string
  opacity?: (i: number) => number
}) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {points.map((p, i) => (
        <g key={i}>
          {ring?.has(i) && <circle cx={xs(p[0])} cy={ys(p[1])} r={r + 4} style={{ fill: 'none', stroke: ringColour, strokeWidth: 1.6, strokeDasharray: '3 2' }} />}
          <circle cx={xs(p[0])} cy={ys(p[1])} r={r} style={{ fill: colours(i), stroke: 'var(--surface)', strokeWidth: 1.2, opacity: opacity ? opacity(i) : 1 }} />
        </g>
      ))}
    </g>
  )
}

/** A centroid marker: a ringed disc with a cross, optionally draggable (pointer and arrow keys). */
export function CentroidHandle({
  x,
  y,
  colour,
  label,
  onChange,
  r = 9,
}: {
  x: number
  y: number
  colour: string
  label: string
  onChange?: (x: number, y: number) => void
  r?: number
}) {
  const { xs, ys, toData } = usePlot()
  const dragging = useRef(false)
  const [dx0, dx1] = xs.domain()
  const [dy0, dy1] = ys.domain()
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
  const cx = xs(x)
  const cy = ys(y)
  const marker = (
    <>
      <circle cx={cx} cy={cy} r={r + 3} style={{ fill: 'var(--surface)', stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
      <circle cx={cx} cy={cy} r={r} style={{ fill: colour }} />
      <path d={`M${cx - r * 0.55},${cy}H${cx + r * 0.55}M${cx},${cy - r * 0.55}V${cy + r * 0.55}`} style={{ stroke: 'var(--surface)', strokeWidth: 2.4 }} strokeLinecap="round" />
    </>
  )
  if (!onChange) return <g aria-hidden="true">{marker}</g>
  const onKey = (e: React.KeyboardEvent) => {
    const sx = (dx1 - dx0) / 50
    const sy = (dy1 - dy0) / 50
    let nx = x
    let ny = y
    if (e.key === 'ArrowLeft') nx -= sx
    else if (e.key === 'ArrowRight') nx += sx
    else if (e.key === 'ArrowUp') ny += sy
    else if (e.key === 'ArrowDown') ny -= sy
    else return
    e.preventDefault()
    onChange(clamp(nx, dx0, dx1), clamp(ny, dy0, dy1))
  }
  return (
    <g
      className="plot-drag"
      tabIndex={0}
      role="slider"
      aria-label={label}
      aria-valuetext={`x ${x.toFixed(1)}, y ${y.toFixed(1)}`}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        e.stopPropagation()
        dragging.current = true
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return
        const [nx, ny] = toData(e.clientX, e.clientY)
        onChange(clamp(nx, dx0, dx1), clamp(ny, dy0, dy1))
      }}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      }}
    >
      <circle cx={cx} cy={cy} r={r + 12} style={{ fill: 'transparent' }} />
      {marker}
    </g>
  )
}

/** A plain draggable handle with its own accessible name (pointer and arrow keys); lockX keeps x fixed. */
export function DragHandle({
  x,
  y,
  onChange,
  ariaLabel,
  colour = 'var(--viz-ink)',
  r = 7,
  lockX,
  valueText,
}: {
  x: number
  y: number
  onChange: (x: number, y: number) => void
  ariaLabel: string
  colour?: string
  r?: number
  lockX?: boolean
  valueText?: string
}) {
  const { xs, ys, toData } = usePlot()
  const dragging = useRef(false)
  const [dx0, dx1] = xs.domain()
  const [dy0, dy1] = ys.domain()
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
  const emit = (nx: number, ny: number) => onChange(lockX ? x : clamp(nx, dx0, dx1), clamp(ny, dy0, dy1))
  return (
    <g
      className="plot-drag"
      tabIndex={0}
      role="slider"
      aria-label={ariaLabel}
      aria-valuetext={valueText ?? `${y.toFixed(2)}`}
      onKeyDown={(e) => {
        const sx = (dx1 - dx0) / 50
        const sy = (dy1 - dy0) / 50
        if (e.key === 'ArrowUp') emit(x, y + sy)
        else if (e.key === 'ArrowDown') emit(x, y - sy)
        else if (e.key === 'ArrowLeft' && !lockX) emit(x - sx, y)
        else if (e.key === 'ArrowRight' && !lockX) emit(x + sx, y)
        else return
        e.preventDefault()
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        dragging.current = true
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return
        const [nx, ny] = toData(e.clientX, e.clientY)
        emit(nx, ny)
      }}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      }}
    >
      <circle cx={xs(x)} cy={ys(y)} r={r + 11} style={{ fill: 'transparent' }} />
      <circle cx={xs(x)} cy={ys(y)} r={r} style={{ fill: colour, stroke: 'var(--surface)', strokeWidth: 2.5 }} />
    </g>
  )
}

/** A short caption line under a plot (muted, small). */
export function Note({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ink-2)', width: '100%' }}>{children}</p>
}
