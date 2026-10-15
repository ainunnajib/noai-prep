import type { ReactNode } from 'react'
import { usePlot } from '../../../../../kit'

/** A plot label (data coordinates) with a halo in the card's colour, so it stays readable on top of lines and fills. */
export function HaloLabel({
  x,
  y,
  children,
  dx = 0,
  dy = 0,
  anchor = 'start',
  color = 'var(--viz-ink)',
  size = 12,
  weight = 700,
}: {
  x: number
  y: number
  children: ReactNode
  dx?: number
  dy?: number
  anchor?: 'start' | 'middle' | 'end'
  color?: string
  size?: number
  weight?: number
}) {
  const { xs, ys } = usePlot()
  return (
    <text
      x={xs(x) + dx}
      y={ys(y) + dy}
      textAnchor={anchor}
      style={{ fill: color, fontSize: size, fontWeight: weight, stroke: 'var(--surface)', strokeWidth: 4, strokeLinejoin: 'round', paintOrder: 'stroke' }}
    >
      {children}
    </text>
  )
}
