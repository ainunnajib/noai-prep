import { useRef } from 'react'
import { usePlot } from '../../../../../kit'

/**
 * A draggable point like the kit's DraggablePoint, but with a separate screen-reader label,
 * an optional short visible tag, and a choice of shape. Keyboard: arrow keys move it.
 */
export function DragDot({
  x,
  y,
  onChange,
  ariaLabel,
  tag,
  tagSide = 'left',
  color = 'var(--viz-1)',
  r = 7,
  square = false,
  lockX,
  lockY,
  snap = 0.1,
  onDragEnd,
}: {
  x: number
  y: number
  onChange: (x: number, y: number) => void
  ariaLabel: string
  tag?: string
  tagSide?: 'left' | 'right'
  color?: string
  r?: number
  square?: boolean
  lockX?: boolean
  lockY?: boolean
  snap?: number
  onDragEnd?: () => void
}) {
  const { xs, ys, toData } = usePlot()
  const dragging = useRef(false)
  const [dx0, dx1] = xs.domain()
  const [dy0, dy1] = ys.domain()
  const clamp = (v: number, a: number, b: number) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), v))
  const q = (v: number) => (snap > 0 ? Math.round(v / snap) * snap : v)

  const emit = (nx: number, ny: number) => {
    nx = lockX ? x : clamp(q(nx), dx0, dx1)
    ny = lockY ? y : clamp(q(ny), dy0, dy1)
    onChange(nx, ny)
  }

  const onKey = (e: React.KeyboardEvent) => {
    const step = snap > 0 ? snap : (dy1 - dy0) / 50
    let nx = x
    let ny = y
    if (e.key === 'ArrowLeft' && !lockX) nx -= step
    else if (e.key === 'ArrowRight' && !lockX) nx += step
    else if (e.key === 'ArrowUp' && !lockY) ny += step
    else if (e.key === 'ArrowDown' && !lockY) ny -= step
    else return
    e.preventDefault()
    emit(nx, ny)
  }

  const cx = xs(x)
  const cy = ys(y)
  return (
    <g
      className="plot-drag"
      tabIndex={0}
      role="slider"
      aria-label={ariaLabel}
      aria-valuetext={lockX ? `${y.toFixed(1)}` : `x ${x.toFixed(1)}, y ${y.toFixed(1)}`}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        e.stopPropagation()
        dragging.current = true
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return
        e.stopPropagation()
        const [nx, ny] = toData(e.clientX, e.clientY)
        emit(nx, ny)
      }}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
        onDragEnd?.()
      }}
    >
      <circle cx={cx} cy={cy} r={r + 11} style={{ fill: 'transparent' }} />
      {square ? (
        <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} rx={3} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2.5 }} />
      ) : (
        <circle cx={cx} cy={cy} r={r} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2.5 }} />
      )}
      {tag && (
        <text className="plot-label" x={tagSide === 'left' ? cx - r - 5 : cx + r + 5} y={cy + 4} textAnchor={tagSide === 'left' ? 'end' : 'start'} style={{ fill: color, fontSize: 12 }}>
          {tag}
        </text>
      )}
    </g>
  )
}
