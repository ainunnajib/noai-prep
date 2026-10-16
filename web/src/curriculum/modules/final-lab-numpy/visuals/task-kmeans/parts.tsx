import { usePlot } from '../../../../../kit'

/* Small SVG pieces shared by the k-means task visuals. */

export const CLUSTER_COLORS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)']

/** a five-pointed star marking a centroid */
export function Star({ x, y, color, r = 10, ghost, label }: { x: number; y: number; color: string; r?: number; ghost?: boolean; label?: string }) {
  const { xs, ys } = usePlot()
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  const cx = xs(x)
  const cy = ys(y)
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 === 0 ? r : r * 0.45
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`)
  }
  return (
    <g>
      <polygon
        points={pts.join(' ')}
        style={
          ghost
            ? { fill: 'none', stroke: color, strokeWidth: 1.5, strokeDasharray: '3 2', opacity: 0.8 }
            : { fill: color, stroke: 'var(--surface)', strokeWidth: 1.8 }
        }
      />
      {label && (
        <text
          x={cx + r + 3}
          y={cy - r + 2}
          className="plot-label"
          style={{ fill: color, fontSize: 12, fontWeight: 700, stroke: 'var(--surface)', strokeWidth: 3, paintOrder: 'stroke', strokeLinejoin: 'round' }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** thin dashed segment in data coordinates */
export function Seg({ a, b, color, dash = '4 3', width = 1.3, opacity = 0.8 }: { a: number[]; b: number[]; color: string; dash?: string; width?: number; opacity?: number }) {
  const { xs, ys } = usePlot()
  if (![...a, ...b].every(Number.isFinite)) return null
  return <line x1={xs(a[0])} y1={ys(a[1])} x2={xs(b[0])} y2={ys(b[1])} style={{ stroke: color, strokeDasharray: dash, strokeWidth: width, opacity }} />
}

export const fmt2 = (v: number) => (Number.isNaN(v) ? 'nan' : Number.isInteger(v) ? String(v) : v.toFixed(3).replace(/0+$/, '').replace(/\.$/, ''))
export const fmtPt = (p: number[]) => `(${p.map(fmt2).join(', ')})`

/** custom y-axis tick labels (e.g. powers of ten on a log axis) */
export function YTicks({ values, format }: { values: number[]; format: (v: number) => string }) {
  const { xs, ys } = usePlot()
  const x0 = xs.range()[0]
  return (
    <g aria-hidden="true">
      {values.map((v) => (
        <g key={v} transform={`translate(${x0},${ys(v)})`}>
          <line x2={-5} style={{ stroke: 'var(--viz-axis)' }} />
          <text x={-8} dy="0.32em" textAnchor="end" className="plot-label" style={{ fontSize: 11, fill: 'var(--ink-3)' }}>
            {format(v)}
          </text>
        </g>
      ))}
    </g>
  )
}
