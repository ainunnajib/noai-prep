import { useState } from 'react'
import { Figure, Readout, Plot, Path, Rect, Label, DraggablePoint, usePlot } from '../../../../../kit'

/*
  Target leakage is about timing. A bank predicts whether a loan will default within 12 months.
  Each candidate feature sits on a timeline at the month it becomes known. The learner drags the
  "moment of prediction": features known by then are fair to use, features from after it are
  leakage. Aha: "missed first repayment" is leakage for a model used at application time, but a
  fair feature for a model that re-checks loans after a few months.
*/

interface Feat {
  name: string
  month: number
  label?: boolean
}

const FEATS: Feat[] = [
  { name: 'age of applicant', month: 0 },
  { name: 'monthly income', month: 0 },
  { name: 'loan amount asked for', month: 0 },
  { name: 'late payments on past loans', month: 0 },
  { name: 'missed the first repayment', month: 1 },
  { name: 'reminder letters sent', month: 3 },
  { name: 'handed to a debt collector', month: 8 },
  { name: 'OUTCOME: defaulted within 12 months?', month: 12, label: true },
]
const X0 = -1.2
const X1 = 12.8
const ROWS = FEATS.length

function MonthAxis() {
  const { xs, ys } = usePlot()
  const y = ys(-1.35)
  return (
    <g className="plot-axes" aria-hidden="true">
      <line x1={xs(0)} x2={xs(12)} y1={y} y2={y} />
      {Array.from({ length: 13 }, (_, m) => (
        <g key={m} transform={`translate(${xs(m)},${y})`}>
          <line y2={m % 3 === 0 ? 6 : 3} />
          {m % 3 === 0 && (
            <text y={18} textAnchor="middle">
              {m}
            </text>
          )}
        </g>
      ))}
      <text className="plot-axis-label" x={xs(12)} y={y + 32} textAnchor="end">
        months after the application
      </text>
    </g>
  )
}

export default function LeakTimeline() {
  const [t, setT] = useState(0)
  const usable = FEATS.filter((f) => !f.label && f.month <= t).length
  const leaky = FEATS.filter((f) => !f.label && f.month > t).length
  const yOf = (i: number) => ROWS - 1 - i

  return (
    <Figure
      title="Is this feature known when you predict?"
      caption={
        <>
          A bank wants to predict whether a loan will default within 12 months. Each feature sits at the month it becomes known. Drag the{' '}
          <b>predict here</b> line. Features to its left are fair to use; features to its right come from the future, so using them is target leakage. At
          month 0 (the application), "missed the first repayment" is leakage. For a model that re-checks loans at month 4, it is a perfectly fair, and
          very useful, feature. The outcome itself is always to the right: it is what you are predicting.
        </>
      }
    >
      <Plot
        x={[X0, X1]}
        y={[-1.9, ROWS + 0.25]}
        width={560}
        height={360}
        maxWidth={680}
        minHeight={400}
        margin={{ top: 10, bottom: 44, left: 12, right: 12 }}
        ariaLabel={`Timeline of loan features; predicting at month ${t}: ${usable} features usable, ${leaky} would be leakage`}
      >
        <Rect x0={X0} x1={t} y0={-0.5} y1={ROWS - 0.5} fill="color-mix(in srgb, var(--viz-pos) 10%, var(--surface))" />
        <Rect x0={t} x1={X1} y0={-0.5} y1={ROWS - 0.5} fill="color-mix(in srgb, var(--viz-neg) 10%, var(--surface))" />
        <Label x={t} y={ROWS - 0.5} dx={-6} dy={-5} anchor="end" color="var(--viz-pos)" size={12} weight={700}>
          {t >= 2 ? 'known' : ''}
        </Label>
        <Label x={t} y={ROWS - 0.5} dx={6} dy={-5} anchor="start" color="var(--viz-neg)" size={12} weight={700}>
          {t <= 10 ? 'the future' : ''}
        </Label>
        <MonthAxis />
        {FEATS.map((f, i) => {
          const y = yOf(i)
          const ok = !f.label && f.month <= t
          const col = f.label ? 'var(--viz-ink)' : ok ? 'var(--viz-pos)' : 'var(--viz-neg)'
          const text = `${f.label ? '' : ok ? '✓ ' : '✗ '}${f.name}`
          const right = f.month < 6
          return (
            <g key={f.name}>
              <Path points={[[X0, y], [X1, y]]} color="var(--viz-grid)" width={1} />
              <Label x={f.month} y={y} dx={right ? 11 : -11} dy={4} anchor={right ? 'start' : 'end'} color={col} weight={f.label ? 800 : 600} size={12.5}>
                {text}
              </Label>
              <DotAt x={f.month} y={y} colour={col} star={!!f.label} />
            </g>
          )
        })}
        <Path points={[[t, -0.9], [t, ROWS - 0.5]]} color="var(--viz-ink)" width={2.5} />
        <DraggablePoint
          x={t}
          y={-0.9}
          lockY
          color="var(--viz-ink)"
          r={8}
          label="predict here"
          onChange={(nx) =>
            setT((p) => {
              let r = Math.round(nx)
              if (r === p && Math.abs(nx - p) > 0.2) r = p + Math.sign(nx - p)
              return Math.max(0, Math.min(11, r))
            })
          }
        />
      </Plot>
      <Readout
        items={[
          ['predicting at', `month ${t}`],
          ['fair features', String(usable)],
          ['leaky features', String(leaky)],
        ]}
      />
    </Figure>
  )
}

function DotAt({ x, y, colour, star }: { x: number; y: number; colour: string; star: boolean }) {
  const { xs, ys } = usePlot()
  const cx = xs(x)
  const cy = ys(y)
  if (star) {
    const pts = Array.from({ length: 10 }, (_, k) => {
      const r = k % 2 === 0 ? 8 : 3.6
      const a = -Math.PI / 2 + (k * Math.PI) / 5
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
    }).join(' ')
    return <polygon points={pts} style={{ fill: colour, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
  }
  return <circle cx={cx} cy={cy} r={6} style={{ fill: colour, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
}
