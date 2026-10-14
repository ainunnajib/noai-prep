import { useRef, useState, type ReactNode } from 'react'
import { usePlot, Path } from '../../../../../kit'
import type { Line } from './svm'

/* Shared drawing pieces for the SVM visuals. Class +1 = blue squares, class −1 = orange circles. */

export const POS_C = 'var(--viz-1)'
export const NEG_C = 'var(--viz-2)'
export const colourOf = (label: number) => (label > 0 ? POS_C : NEG_C)

/** Points on the line w·x + b = level, extended far beyond the plot (the Plot clips them). */
export function linePoints(l: Line, level: number, T = 40): [[number, number], [number, number]] {
  const n2 = l.w[0] ** 2 + l.w[1] ** 2
  const n = Math.sqrt(n2)
  const p0: [number, number] = [((level - l.b) * l.w[0]) / n2, ((level - l.b) * l.w[1]) / n2]
  const d: [number, number] = [-l.w[1] / n, l.w[0] / n]
  return [
    [p0[0] - T * d[0], p0[1] - T * d[1]],
    [p0[0] + T * d[0], p0[1] + T * d[1]],
  ]
}

/** The street: shaded band between the margins, the solid boundary and the two dashed margin lines. */
export function Street({ line, color = 'var(--viz-ink)', faint = false }: { line: Line; color?: string; faint?: boolean }) {
  const up = linePoints(line, 1)
  const dn = linePoints(line, -1)
  const mid = linePoints(line, 0)
  return (
    <g aria-hidden="true" style={{ opacity: faint ? 0.55 : 1 }}>
      <Path points={[up[0], up[1], dn[1], dn[0]]} closed color="none" width={0} fill="color-mix(in srgb, var(--viz-6) 16%, transparent)" />
      <Path points={up} color={POS_C} width={1.8} dash="7 5" />
      <Path points={dn} color={NEG_C} width={1.8} dash="7 5" />
      <Path points={mid} color={color} width={3} />
    </g>
  )
}

/** A class marker: blue square for +1, orange circle for −1. */
export function Mark({ x, y, label, r = 6, dim = false }: { x: number; y: number; label: number; r?: number; dim?: boolean }) {
  const { xs, ys } = usePlot()
  const cx = xs(x)
  const cy = ys(y)
  const style = { fill: colourOf(label), stroke: 'var(--surface)', strokeWidth: 1.5, opacity: dim ? 0.45 : 1 }
  return label > 0 ? <rect x={cx - r * 0.9} y={cy - r * 0.9} width={r * 1.8} height={r * 1.8} style={style} /> : <circle cx={cx} cy={cy} r={r} style={style} />
}

/** A ring drawn around a point (support vectors, violators). */
export function Ring({ x, y, r = 11, color = 'var(--viz-ink)', dash, width = 2 }: { x: number; y: number; r?: number; color?: string; dash?: string; width?: number }) {
  const { xs, ys } = usePlot()
  return <circle cx={xs(x)} cy={ys(y)} r={r} aria-hidden="true" style={{ fill: 'none', stroke: color, strokeWidth: width, strokeDasharray: dash }} />
}

/**
 * A draggable class marker (keyboard: focus it and use the arrow keys). Calls onChange with data
 * coordinates, clamped to the plot.
 */
export function DragMark({
  x,
  y,
  label,
  onChange,
  name,
  r = 7,
  children,
}: {
  x: number
  y: number
  label: number
  onChange: (x: number, y: number) => void
  name: string
  r?: number
  children?: ReactNode
}) {
  const { xs, ys, toData } = usePlot()
  const dragging = useRef(false)
  const [focused, setFocused] = useState(false)
  const [dx0, dx1] = xs.domain()
  const [dy0, dy1] = ys.domain()
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
  const snap = (v: number) => Math.round(v * 10) / 10
  const set = (nx: number, ny: number) => onChange(snap(clamp(nx, dx0 + 0.1, dx1 - 0.1)), snap(clamp(ny, dy0 + 0.1, dy1 - 0.1)))
  return (
    <g
      className="plot-drag"
      tabIndex={0}
      role="slider"
      aria-label={name}
      aria-valuetext={`x ${x.toFixed(1)}, y ${y.toFixed(1)}`}
      onKeyDown={(e) => {
        const step = 0.2
        if (e.key === 'ArrowLeft') set(x - step, y)
        else if (e.key === 'ArrowRight') set(x + step, y)
        else if (e.key === 'ArrowUp') set(x, y + step)
        else if (e.key === 'ArrowDown') set(x, y - step)
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
        set(nx, ny)
      }}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      }}
      onFocus={(e) => {
        // ring only for keyboard focus, not after a mouse or touch drag
        let kb = true
        try {
          kb = e.currentTarget.matches(':focus-visible')
        } catch {
          kb = true
        }
        setFocused(kb)
      }}
      onBlur={() => setFocused(false)}
      style={{ cursor: 'grab' }}
    >
      <circle cx={xs(x)} cy={ys(y)} r={r + 9} style={{ fill: 'transparent' }} />
      {focused && <circle cx={xs(x)} cy={ys(y)} r={r + 6} style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2.5, strokeDasharray: '3 3' }} />}
      <Mark x={x} y={y} label={label} r={r} />
      {children}
    </g>
  )
}

/** Small HTML legend row. */
export function Legend({ items }: { items: { swatch: ReactNode; label: ReactNode }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-2)' }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {it.swatch}
          {it.label}
        </span>
      ))}
    </div>
  )
}

export const swatch = {
  pos: (
    <svg width="14" height="14" aria-hidden="true">
      <rect x="2" y="2" width="10" height="10" style={{ fill: POS_C }} />
    </svg>
  ),
  neg: (
    <svg width="14" height="14" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" style={{ fill: NEG_C }} />
    </svg>
  ),
  sv: (
    <svg width="18" height="18" aria-hidden="true">
      <circle cx="9" cy="9" r="7" style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2 }} />
    </svg>
  ),
  street: (
    <svg width="22" height="14" aria-hidden="true">
      <rect x="0" y="2" width="22" height="10" style={{ fill: 'color-mix(in srgb, var(--viz-6) 22%, transparent)' }} />
      <path d="M0,7 L22,7" style={{ stroke: 'var(--viz-ink)', strokeWidth: 2.5 }} />
    </svg>
  ),
  violator: (
    <svg width="18" height="18" aria-hidden="true">
      <circle cx="9" cy="9" r="7" style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2, strokeDasharray: '3 2' }} />
    </svg>
  ),
}
