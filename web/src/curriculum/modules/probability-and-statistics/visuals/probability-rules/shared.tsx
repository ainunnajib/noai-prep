import { useRef } from 'react'
import { usePlot } from '../../../../../kit'

/** Helpers shared by this lesson's area visuals (unit-square events). */

export interface Box {
  x0: number
  x1: number
  y0: number
  y1: number
}

export const GRID = 0.05
export const snap = (v: number) => Math.round(v / GRID) * GRID
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
/** round away floating-point dust so 0.1 + 0.2 shows as 0.3 */
export const tidy = (v: number) => Math.round(v * 1e6) / 1e6
export const area = (r: Box) => tidy((r.x1 - r.x0) * (r.y1 - r.y0))
export function overlapBox(a: Box, b: Box): Box | null {
  const x0 = Math.max(a.x0, b.x0)
  const x1 = Math.min(a.x1, b.x1)
  const y0 = Math.max(a.y0, b.y0)
  const y1 = Math.min(a.y1, b.y1)
  return x1 - x0 > 1e-9 && y1 - y0 > 1e-9 ? { x0, x1, y0, y1 } : null
}
export const overlap = (a: Box, b: Box) => {
  const o = overlapBox(a, b)
  return o ? area(o) : 0
}

/** move a box so its centre follows (cx, cy), keeping its size and staying inside the unit square */
export function moveBox(r: Box, cx: number, cy: number): Box {
  const w = r.x1 - r.x0
  const h = r.y1 - r.y0
  const x0 = clamp(snap(cx - w / 2), 0, tidy(1 - w))
  const y0 = clamp(snap(cy - h / 2), 0, tidy(1 - h))
  return { x0: tidy(x0), x1: tidy(x0 + w), y0: tidy(y0), y1: tidy(y0 + h) }
}

/** resize a box by moving its top-right corner to (x, y) */
export function resizeBox(r: Box, x: number, y: number): Box {
  return { ...r, x1: tidy(clamp(snap(x), r.x0 + GRID, 1)), y1: tidy(clamp(snap(y), r.y0 + GRID, 1)) }
}

/** format a probability with up to 4 decimals and no trailing zeros */
export const pf = (v: number) => {
  const r = Math.round(v * 10000) / 10000
  return String(Object.is(r, -0) ? 0 : r)
}

/**
 * A draggable handle in data coordinates. `onMove` receives the raw pointer position (callers snap);
 * arrow keys call onMove with the position shifted by one grid step.
 */
export function Handle({
  x,
  y,
  onMove,
  label,
  color,
  shape = 'circle',
  step = GRID,
}: {
  x: number
  y: number
  onMove: (x: number, y: number) => void
  label: string
  color: string
  shape?: 'circle' | 'square'
  step?: number
}) {
  const { xs, ys, toData } = usePlot()
  const dragging = useRef(false)
  const cx = xs(x)
  const cy = ys(y)
  return (
    <g
      className="plot-drag"
      tabIndex={0}
      role="slider"
      aria-label={label}
      aria-valuetext={`x ${pf(x)}, y ${pf(y)}`}
      onKeyDown={(e) => {
        const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }
        const m = d[e.key]
        if (!m) return
        e.preventDefault()
        onMove(x + m[0], y + m[1])
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        dragging.current = true
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return
        const [px, py] = toData(e.clientX, e.clientY)
        onMove(px, py)
      }}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      }}
    >
      <circle cx={cx} cy={cy} r={17} style={{ fill: 'transparent' }} />
      {shape === 'circle' ? (
        <circle cx={cx} cy={cy} r={8} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2.5 }} />
      ) : (
        <rect x={cx - 7} y={cy - 7} width={14} height={14} rx={2} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2.5 }} />
      )}
    </g>
  )
}

/** light 10 x 10 grid of the unit square, drawn at fixed data positions (so it stretches when zoomed) */
export function UnitGrid() {
  const { xs, ys, clipId } = usePlot()
  const ticks = Array.from({ length: 11 }, (_, i) => i / 10)
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xs(t)} x2={xs(t)} y1={ys(0)} y2={ys(1)} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
          <line y1={ys(t)} y2={ys(t)} x1={xs(0)} x2={xs(1)} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
        </g>
      ))}
    </g>
  )
}

/** a filled, outlined event rectangle with a name in its top-left corner */
export function EventBox({ r, color, name, nameAt = 'tl' }: { r: Box; color: string; name?: string; nameAt?: 'tl' | 'br' }) {
  const { xs, ys, clipId } = usePlot()
  const X = xs(r.x0)
  const Y = ys(r.y1)
  const W = xs(r.x1) - xs(r.x0)
  const H = ys(r.y0) - ys(r.y1)
  return (
    <g>
      <rect clipPath={`url(#${clipId})`} x={X} y={Y} width={W} height={H} style={{ fill: `color-mix(in srgb, ${color} 22%, transparent)`, stroke: color, strokeWidth: 2 }} />
      {name && (
        <text
          clipPath={`url(#${clipId})`}
          className="plot-label"
          x={nameAt === 'tl' ? X + 6 : X + W - 6}
          y={nameAt === 'tl' ? Y + 16 : Y + H - 7}
          textAnchor={nameAt === 'tl' ? 'start' : 'end'}
          style={{ fill: color, fontWeight: 700 }}
        >
          {name}
        </text>
      )}
    </g>
  )
}
