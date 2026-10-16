import type { CSSProperties } from 'react'
import { usePlot } from '../../../../../kit'

/**
 * Many small circles drawn as ONE svg path (cheap even for thousands of points).
 * Must be rendered inside a <Plot>; points are in data coordinates.
 */
export default function DotCloud({ pts, r, style }: { pts: [number, number][]; r: number; style: CSSProperties }) {
  const { xs, ys } = usePlot()
  let d = ''
  for (const [x, y] of pts) {
    const cx = xs(x)
    const cy = ys(y)
    d += `M${(cx - r).toFixed(1)},${cy.toFixed(1)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`
  }
  if (!d) return null
  return <path d={d} style={style} />
}
