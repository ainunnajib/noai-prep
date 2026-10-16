import type { ReactNode } from 'react'
import { usePlot } from '../../../../../kit'

/**
 * A plot label (data coordinates) with a halo in the card colour, so it stays legible where it
 * crosses a curve or grid line.
 */
export function HaloLabel({
  x,
  y,
  dx = 0,
  dy = 0,
  anchor = 'start',
  color = 'var(--viz-ink)',
  size,
  weight = 700,
  children,
}: {
  x: number
  y: number
  dx?: number
  dy?: number
  anchor?: 'start' | 'middle' | 'end'
  color?: string
  size?: number
  weight?: number
  children: ReactNode
}) {
  const { xs, ys } = usePlot()
  return (
    <text
      className="plot-label"
      x={xs(x) + dx}
      y={ys(y) + dy}
      textAnchor={anchor}
      style={{ fill: color, fontSize: size, fontWeight: weight, paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 5, strokeLinejoin: 'round' }}
    >
      {children}
    </text>
  )
}
