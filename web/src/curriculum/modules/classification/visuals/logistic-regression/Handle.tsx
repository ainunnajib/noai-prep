import { useRef } from 'react'
import { usePlot } from '../../../../../kit'

/**
 * A draggable handle in data coordinates (like the kit's DraggablePoint) with its own screen-reader
 * label, an optional visible tag, a round or square shape, and keyboard support (arrow keys).
 * `step` sets the keyboard step in data units (defaults to 1/50 of each axis range).
 */
export function Handle({
  x,
  y,
  onChange,
  ariaLabel,
  valueText,
  tag,
  tagDx = 12,
  tagDy = -10,
  color = 'var(--viz-4)',
  r = 8,
  square = false,
  lockX,
  lockY,
  step,
  onDragEnd,
}: {
  x: number
  y: number
  onChange: (x: number, y: number) => void
  ariaLabel: string
  valueText?: string
  tag?: string
  tagDx?: number
  tagDy?: number
  color?: string
  r?: number
  square?: boolean
  lockX?: boolean
  lockY?: boolean
  step?: number
  onDragEnd?: () => void
}) {
  const { xs, ys, toData } = usePlot()
  const dragging = useRef(false)
  const [dx0, dx1] = xs.domain()
  const [dy0, dy1] = ys.domain()
  const clamp = (v: number, a: number, b: number) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), v))

  const emit = (nx: number, ny: number) => {
    onChange(lockX ? x : clamp(nx, dx0, dx1), lockY ? y : clamp(ny, dy0, dy1))
  }

  const onKey = (e: React.KeyboardEvent) => {
    const sx = step ?? (dx1 - dx0) / 50
    const sy = step ?? (dy1 - dy0) / 50
    let nx = x
    let ny = y
    if (e.key === 'ArrowLeft' && !lockX) nx -= sx
    else if (e.key === 'ArrowRight' && !lockX) nx += sx
    else if (e.key === 'ArrowUp' && !lockY) ny += sy
    else if (e.key === 'ArrowDown' && !lockY) ny -= sy
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
      aria-valuetext={valueText ?? `x ${x.toFixed(2)}, y ${y.toFixed(2)}`}
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
        <text className="plot-label" x={cx + tagDx} y={cy + tagDy} textAnchor={tagDx < 0 ? 'end' : 'start'} style={{ fill: color, fontSize: 12.5 }}>
          {tag}
        </text>
      )}
    </g>
  )
}
