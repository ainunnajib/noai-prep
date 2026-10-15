import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { usePlot } from '../../../../../kit'

/*
  Small drawing helpers shared by this module's visuals (all six lessons import from here).
  Everything is in data coordinates, like the kit's Plot.
*/

const reducedMotion = () => {
  try {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/**
 * A draggable point, used instead of the kit's DraggablePoint everywhere in this module so that
 * every handle looks and behaves the same:
 *  - a faint pulsing ring marks it as draggable until the learner first moves it;
 *  - its text label flips to the left (or below) when it would be cut off at the plot's edge;
 *  - it has its own screen-reader name (`ariaLabel`), separate from the visible label.
 * Pointer and keyboard behaviour match DraggablePoint (arrow keys move it by 1/50 of the range).
 */
export function Handle({
  x,
  y,
  onChange,
  color = 'var(--viz-2)',
  r = 9,
  label,
  ariaLabel,
  side = 'auto',
  constrain,
  lockX,
  lockY,
  hint = true,
}: {
  x: number
  y: number
  onChange: (x: number, y: number) => void
  color?: string
  r?: number
  /** short visible text next to the handle */
  label?: string
  /** what a screen reader announces (defaults to the label) */
  ariaLabel?: string
  /** where to put the label; 'auto' = right unless that would leave the plot */
  side?: 'auto' | 'left' | 'right'
  constrain?: (x: number, y: number) => [number, number]
  lockX?: boolean
  lockY?: boolean
  /** show the pulsing "drag me" ring until the first move */
  hint?: boolean
}) {
  const { xs, ys, toData, width } = usePlot()
  const dragging = useRef(false)
  const [touched, setTouched] = useState(false)
  const [dx0, dx1] = xs.domain()
  const [dy0, dy1] = ys.domain()
  const clamp = (v: number, a: number, b: number) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), v))

  const emit = (nx: number, ny: number) => {
    if (!touched) setTouched(true)
    onChange(nx, ny)
  }
  const move = (cx: number, cy: number) => {
    let [nx, ny] = toData(cx, cy)
    nx = lockX ? x : clamp(nx, dx0, dx1)
    ny = lockY ? y : clamp(ny, dy0, dy1)
    if (constrain) [nx, ny] = constrain(nx, ny)
    emit(nx, ny)
  }
  const onKey = (e: React.KeyboardEvent) => {
    const sx = (dx1 - dx0) / 50
    const sy = (dy1 - dy0) / 50
    let nx = x
    let ny = y
    if (e.key === 'ArrowLeft' && !lockX) nx -= sx
    else if (e.key === 'ArrowRight' && !lockX) nx += sx
    else if (e.key === 'ArrowUp' && !lockY) ny += sy
    else if (e.key === 'ArrowDown' && !lockY) ny -= sy
    else return
    e.preventDefault()
    nx = clamp(nx, dx0, dx1)
    ny = clamp(ny, dy0, dy1)
    if (constrain) [nx, ny] = constrain(nx, ny)
    emit(nx, ny)
  }

  const cx = xs(x)
  const cy = ys(y)
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null
  const textW = label ? label.length * 7.4 : 0
  const left = side === 'left' || (side === 'auto' && cx + r + 5 + textW > width - 2)
  const below = cy - r - 12 < 0
  const showHint = hint && !touched
  return (
    <g
      className="plot-drag"
      tabIndex={0}
      role="slider"
      aria-label={ariaLabel ?? label ?? 'draggable point'}
      aria-valuetext={`x ${x.toFixed(2)}, y ${y.toFixed(2)}`}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        e.stopPropagation()
        dragging.current = true
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX, e.clientY)}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      }}
    >
      <circle cx={cx} cy={cy} r={r + 10} style={{ fill: 'transparent' }} />
      {showHint && (
        <circle cx={cx} cy={cy} r={r + 5} style={{ fill: 'none', stroke: color, strokeWidth: 2, opacity: 0.55, strokeDasharray: '3 3', pointerEvents: 'none' }}>
          {!reducedMotion() && <animate attributeName="r" values={`${r + 3};${r + 8};${r + 3}`} dur="1.6s" repeatCount="indefinite" />}
        </circle>
      )}
      <circle cx={cx} cy={cy} r={r} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2.5 }} />
      {label && (
        <text
          className="plot-label"
          x={left ? cx - r - 5 : cx + r + 5}
          y={below ? cy + r + 14 : cy - r}
          textAnchor={left ? 'end' : 'start'}
          style={{ fill: color, pointerEvents: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** A text label on a solid surface-coloured box, for labels that lines would otherwise run through. */
export function BoxLabel({
  x,
  y,
  text,
  dx = 0,
  dy = 0,
  anchor = 'middle',
  color = 'var(--viz-ink)',
  size = 12,
}: {
  x: number
  y: number
  text: string
  dx?: number
  dy?: number
  anchor?: 'start' | 'middle' | 'end'
  color?: string
  size?: number
}) {
  const { xs, ys } = usePlot()
  const w = text.length * size * 0.6 + 8
  const h = size + 6
  const cx = xs(x) + dx
  const cy = ys(y) + dy
  const left = anchor === 'start' ? cx - 4 : anchor === 'end' ? cx - w + 4 : cx - w / 2
  return (
    <g aria-hidden="true">
      <rect x={left} y={cy - size} width={w} height={h} rx={4} style={{ fill: 'var(--surface)', opacity: 0.92 }} />
      <text x={cx} y={cy} textAnchor={anchor} style={{ fill: color, fontSize: size, fontWeight: 700 }}>
        {text}
      </text>
    </g>
  )
}

/** A verdict in readable ink, marked by a coloured dot (colour alone never carries the meaning). */
export function Verdict({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--ink)' }}>
      <span aria-hidden="true" style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: tone, flex: 'none' }} />
      {children}
    </span>
  )
}

/** Numbers for beginners: "3.1 × 10²" instead of "3.1e+2", and a real minus sign. */
export function sci(v: number, dp = 2): string {
  if (!Number.isFinite(v)) return v > 0 ? '∞' : v < 0 ? '−∞' : 'undefined'
  const a = Math.abs(v)
  if (a !== 0 && (a >= 1000 || a < 0.001)) {
    let k = Math.floor(Math.log10(a))
    let m = a / 10 ** k
    if (Number(m.toFixed(1)) >= 10) {
      k += 1
      m = 1
    }
    const sup = String(k)
      .split('')
      .map((ch) => ({ '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' })[ch] ?? ch)
      .join('')
    return `${v < 0 ? '−' : ''}${m.toFixed(1)} × 10${sup}`
  }
  return fx(v, dp)
}

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
