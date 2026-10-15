import { Plot, Rect, Label, Path, usePlot } from '../../../../../kit'
import { Handle } from '../logistic-regression/Handle'

/*
  Shared pieces for the softmax visuals: the softmax itself (numerically stable, with temperature),
  a panel of draggable logit bars, and a panel of probability bars aligned with it.
*/

export const CLASSES = ['cat', 'dog', 'bird', 'fish']
export const Z_RANGE: [number, number] = [-6, 9]

/** Softmax with temperature T. Subtracting the max first changes nothing (shift invariance) but avoids overflow. */
export function softmax(z: number[], T = 1) {
  const m = Math.max(...z)
  const e = z.map((v) => Math.exp((v - m) / T))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / s)
}

/** Fixed decimals with a proper minus sign, never "−0.00". */
export function fix(v: number, d = 2) {
  if (v === Infinity) return '∞'
  const s = v.toFixed(d)
  if (/^-0\.?0*$/.test(s)) return s.slice(1)
  return s.replace('-', '−')
}

/** The target bar as a dashed outline (the kit's Rect has no dash option). */
function DashedBox({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  const { xs, ys } = usePlot()
  if (y <= 0) return null
  return (
    <rect
      x={xs(x0)}
      y={ys(y)}
      width={xs(x1) - xs(x0)}
      height={ys(0) - ys(y)}
      style={{ fill: 'color-mix(in srgb, var(--viz-3) 14%, transparent)', stroke: 'var(--viz-3)', strokeWidth: 1.8, strokeDasharray: '5 3' }}
    />
  )
}

function ZeroLine() {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  return <line x1={x0} x2={x1} y1={ys(0)} y2={ys(0)} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.4 }} />
}

/** Vertical logit bars that grow up (positive) or down (negative) from 0; drag a bar's tip to change it. */
export function LogitPanel({
  z,
  onChange,
  color = 'var(--viz-5)',
  title = 'logits z',
  highlight,
  height = 230,
}: {
  z: number[]
  onChange: (z: number[]) => void
  color?: string
  title?: string
  highlight?: number
  height?: number
}) {
  const [lo, hi] = Z_RANGE
  return (
    <div style={{ minWidth: 0, display: 'grid', gap: '0.15rem' }}>
      <div style={{ fontWeight: 800, color, fontSize: '0.92rem', textAlign: 'center' }}>{title}</div>
      <Plot x={[0, z.length]} y={[lo, hi]} width={300} height={height} maxWidth={420} margin={{ left: 30, right: 8, top: 10, bottom: 24 }} ariaLabel={`${title}: ${z.map((v, i) => `${CLASSES[i]} ${v.toFixed(1)}`).join(', ')}`}>
        {[-5, 0, 5].map((t) => (
          <g key={t}>
            <Path points={[[0, t], [z.length, t]]} color="var(--viz-grid)" width={1} />
            <Label x={0} y={t} dx={-6} dy={4} anchor="end" size={11} color="var(--ink-3)">
              {String(t).replace('-', '−')}
            </Label>
          </g>
        ))}
        <ZeroLine />
        {z.map((v, i) => (
          <g key={i}>
            <Rect
              x0={i + 0.2}
              x1={i + 0.8}
              y0={0}
              y1={v}
              rx={2}
              fill={`color-mix(in srgb, ${color} ${highlight === i ? 85 : 62}%, var(--surface))`}
            />
            <Label x={i + 0.5} y={v} dy={v >= 0 ? -14 : 24} anchor="middle" size={12} weight={700} color="var(--viz-ink)">
              {fix(v, 1)}
            </Label>
            <Label x={i + 0.5} y={lo} dy={16} anchor="middle" size={12} weight={highlight === i ? 800 : 600} color={highlight === i ? 'var(--ink)' : 'var(--ink-2)'}>
              {CLASSES[i]}
            </Label>
            <Handle
              x={i + 0.5}
              y={v}
              lockX
              r={7}
              step={0.5}
              color={color}
              onChange={(_, y) => {
                const nz = z.slice()
                nz[i] = Math.round(y * 10) / 10
                onChange(nz)
              }}
              ariaLabel={`Logit for ${CLASSES[i]}`}
              valueText={v.toFixed(1)}
            />
          </g>
        ))}
      </Plot>
    </div>
  )
}

/** Probability bars aligned with LogitPanel. Optional `target` draws the target distribution as dashed outlines. */
export function ProbPanel({
  p,
  color = 'var(--viz-1)',
  title = 'probabilities p',
  highlight,
  target,
  height = 230,
}: {
  p: number[]
  color?: string
  title?: string
  highlight?: number
  target?: number[]
  height?: number
}) {
  return (
    <div style={{ minWidth: 0, display: 'grid', gap: '0.15rem' }}>
      <div style={{ fontWeight: 800, color, fontSize: '0.92rem', textAlign: 'center' }}>{title}</div>
      <Plot x={[0, p.length]} y={[0, 1.12]} width={300} height={height} maxWidth={420} margin={{ left: 30, right: 8, top: 10, bottom: 24 }} ariaLabel={`${title}: ${p.map((v, i) => `${CLASSES[i]} ${v.toFixed(3)}`).join(', ')}`}>
        {[0.5, 1].map((t) => (
          <g key={t}>
            <Path points={[[0, t], [p.length, t]]} color="var(--viz-grid)" width={1} />
            <Label x={0} y={t} dx={-6} dy={4} anchor="end" size={11} color="var(--ink-3)">
              {String(t)}
            </Label>
          </g>
        ))}
        <ZeroLine />
        {p.map((v, i) => (
          <g key={i}>
            {target && <DashedBox x0={i + 0.12} x1={i + 0.88} y={target[i]} />}
            <Rect x0={i + 0.25} x1={i + 0.75} y0={0} y1={v} rx={2} fill={`color-mix(in srgb, ${color} ${highlight === i ? 88 : 66}%, var(--surface))`} />
            <Label x={i + 0.5} y={v} dy={-6} anchor="middle" size={12} weight={700} color="var(--viz-ink)">
              {v.toFixed(3)}
            </Label>
            <Label x={i + 0.5} y={0} dy={16} anchor="middle" size={12} weight={highlight === i ? 800 : 600} color={highlight === i ? 'var(--ink)' : 'var(--ink-2)'}>
              {CLASSES[i]}
            </Label>
          </g>
        ))}
      </Plot>
    </div>
  )
}
