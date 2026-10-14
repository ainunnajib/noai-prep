import { useRef, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, usePlot, MBlock, useNarrow } from '../../../../../kit'
import { fmt, mean } from './stats'

/*
  Variance as the average area of squares. Each data point sits on a number line; a square is drawn
  between the point and the mean, with side = distance to the mean, so its area is the squared
  deviation. The dashed square has the AVERAGE area (the variance); its side is the standard
  deviation, also shown as a "mean ± 1 SD" bracket under the line. Divide by n or n − 1.
*/

const START = [1, 3, 4, 5, 7]
const PRESETS: Record<string, number[]> = {
  steady: [3, 4, 4, 4, 5],
  wild: [0, 1, 4, 7, 8],
  start: START,
}
const X_MAX = 10

function Handle({ x, y, value, onMove, label, color }: { x: number; y: number; value: number; onMove: (v: number) => void; label: string; color: string }) {
  const { toData } = usePlot()
  const dragging = useRef(false)
  const set = (v: number) => onMove(Math.max(0, Math.min(X_MAX, Math.round(v))))
  return (
    <g
      className="plot-drag"
      tabIndex={0}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={X_MAX}
      aria-valuenow={value}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') set(value - 1)
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') set(value + 1)
        else return
        e.preventDefault()
      }}
      onPointerDown={(e) => {
        dragging.current = true
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => dragging.current && set(toData(e.clientX, e.clientY)[0])}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      }}
    >
      <circle cx={x} cy={y} r={18} style={{ fill: 'transparent' }} />
      <circle cx={x} cy={y} r={8.5} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2.5 }} />
    </g>
  )
}

function Scene({ values, setValue, sd, showAvg }: { values: number[]; setValue: (i: number, v: number) => void; sd: number; showAvg: boolean }) {
  const { xs, height, margin, clipId } = usePlot()
  const m = mean(values)
  const axisY = height - margin.bottom
  const unit = xs(1) - xs(0)
  const mx = xs(m)
  // biggest squares first so small ones stay visible on top
  const order = values.map((v, i) => ({ v, i, d: Math.abs(v - m) })).sort((a, b) => b.d - a.d)
  const avgSide = sd * unit
  return (
    <>
      <g clipPath={`url(#${clipId})`}>
        {order.map(({ v, i, d }) => {
          const side = d * unit
          if (side < 0.5) return null
          const x0 = Math.min(xs(v), mx)
          const c = v < m ? 'var(--viz-1)' : 'var(--viz-3)'
          return (
            <rect
              key={i}
              x={x0}
              y={axisY - side}
              width={side}
              height={side}
              style={{ fill: `color-mix(in srgb, ${c} 10%, transparent)`, stroke: `color-mix(in srgb, ${c} 70%, var(--surface))`, strokeWidth: 1.5 }}
            />
          )
        })}
        {showAvg && avgSide > 1 && (
          <rect x={mx - avgSide / 2} y={axisY - avgSide} width={avgSide} height={avgSide} style={{ fill: 'color-mix(in srgb, var(--viz-4) 12%, transparent)', stroke: 'var(--viz-4)', strokeWidth: 2.5, strokeDasharray: '7 4' }} />
        )}
      </g>
      {/* area labels at each square's outer top corner */}
      {order.map(({ v, i, d }) => {
        const side = d * unit
        if (side < 22) return null // too small to label; the formula below lists every area
        const left = v < m
        const tx = xs(v) + (left ? 4 : -4)
        const ty = Math.max(margin.top + 12, axisY - side + (side > 26 ? 15 : -5))
        // only label the first of several identical squares
        if (order.findIndex((o) => Math.abs(o.d - d) < 1e-9 && o.v === v) !== order.findIndex((o) => o.i === i)) return null
        return (
          <text key={i} x={tx} y={ty} textAnchor={left ? 'start' : 'end'} className="plot-label" style={{ fill: left ? 'var(--viz-1)' : 'var(--viz-3)', fontSize: 13.5 }}>
            {fmt(d * d, 2)}
          </text>
        )
      })}
      {/* mean line */}
      <line x1={mx} x2={mx} y1={margin.top} y2={axisY} style={{ stroke: 'var(--viz-2)', strokeWidth: 2, strokeDasharray: '5 4' }} />
      <text x={mx + (m > X_MAX * 0.7 ? -6 : 6)} y={margin.top + 10} textAnchor={m > X_MAX * 0.7 ? 'end' : 'start'} className="plot-label" style={{ fill: 'var(--viz-2)' }}>
        mean {fmt(m, 2)}
      </text>
      {/* number line */}
      <line x1={xs(0)} x2={xs(X_MAX)} y1={axisY} y2={axisY} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.25 }} />
      {Array.from({ length: X_MAX + 1 }, (_, t) => (
        <g key={t} transform={`translate(${xs(t)},${axisY})`}>
          <line y2={5} style={{ stroke: 'var(--viz-axis)' }} />
          <text y={19} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12 }}>
            {t}
          </text>
        </g>
      ))}
      {/* mean ± 1 SD bracket */}
      {sd > 0 && (
        <g style={{ stroke: 'var(--viz-4)', strokeWidth: 2 }}>
          <line x1={xs(m - sd)} x2={xs(m + sd)} y1={axisY + 30} y2={axisY + 30} />
          <line x1={xs(m - sd)} x2={xs(m - sd)} y1={axisY + 25} y2={axisY + 35} />
          <line x1={xs(m + sd)} x2={xs(m + sd)} y1={axisY + 25} y2={axisY + 35} />
        </g>
      )}
      <text x={Math.max(xs(0) + 40, Math.min(xs(X_MAX) - 40, mx))} y={axisY + 49} textAnchor="middle" className="plot-label" style={{ fill: 'var(--viz-4)', fontSize: 12 }}>
        {sd > 0 ? `mean ± 1 SD (SD = ${fmt(sd, 2)})` : 'SD = 0: no spread at all'}
      </text>
      {values.map((v, i) => (
        <Handle key={i} x={xs(v)} y={axisY} value={v} color={v < m ? 'var(--viz-1)' : v > m ? 'var(--viz-3)' : 'var(--viz-ink)'} onMove={(nv) => setValue(i, nv)} label={`point ${i + 1}: ${v} minutes`} />
      ))}
    </>
  )
}

export default function VarianceSquares() {
  const [values, setValues] = useState<number[]>(START)
  const [ddof, setDdof] = useState<0 | 1>(0)
  const [showAvg, setShowAvg] = useState(true)
  const [ref, narrow] = useNarrow<HTMLDivElement>()
  const n = values.length
  const m = mean(values)
  const sq = values.map((v) => (v - m) ** 2)
  const ss = sq.reduce((s, v) => s + v, 0)
  const variance = ss / (n - ddof)
  const sd = Math.sqrt(variance)
  const setValue = (i: number, v: number) => setValues((vs) => vs.map((x, j) => (j === i ? v : x)))
  const den = ddof ? `${n} - 1` : `${n}`
  const exact = Math.abs(sd * 1000 - Math.round(sd * 1000)) < 1e-6
  const varExact = Math.abs(variance * 1000 - Math.round(variance * 1000)) < 1e-6
  const varTex = `${varExact ? '=' : '\\approx'} ${fmt(variance, 3)}`
  const sdTex = `\\sqrt{${fmt(variance, 3)}} ${exact ? '=' : '\\approx'} ${fmt(sd, 3)}`
  const sym = ddof ? 's' : '\\sigma'

  return (
    <Figure
      title="Variance is the average square"
      caption={
        <>
          Queue times (minutes) at one hawker stall on five days. Each square joins a point to the mean (blue on the left, green on the right), so its area is that point's squared distance
          from the mean. The dashed pink square has the <b>average</b> area: that area is the variance, and its side is the standard deviation. Drag a point
          far away and watch its square grow much faster than its distance. Try the two stalls: both have a mean of 4 minutes, but very different spreads.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <Plot x={[0, X_MAX]} y={[0, 1]} width={540} height={270} minHeight={260} margin={{ left: 22, right: 22, top: 10, bottom: 58 }} ariaLabel={`Points at ${values.join(', ')} with squares to the mean; variance ${fmt(variance, 2)}, standard deviation ${fmt(sd, 2)}`}>
          <Scene values={values} setValue={setValue} sd={sd} showAvg={showAvg} />
        </Plot>
      </div>
      <MBlock>
        {narrow
          ? `\\begin{aligned}${sym}^2 &= \\frac{${sq.map((v) => fmt(v, 2)).join(' + ')}}{${den}} \\\\ &${varTex} \\\\ ${sym} &= ${sdTex}\\end{aligned}`
          : `${sym}^2 = \\frac{${sq.map((v) => fmt(v, 2)).join(' + ')}}{${den}} ${varTex}, \\qquad ${sym} = ${sdTex}`}
      </MBlock>
      <Controls>
        <Segmented
          label="Divide the total by"
          value={ddof}
          onChange={setDdof}
          options={[
            { value: 0, label: 'n (population)' },
            { value: 1, label: 'n − 1 (sample)' },
          ]}
        />
        <Segmented
          label="Average square"
          value={showAvg ? 1 : 0}
          onChange={(v) => setShowAvg(v === 1)}
          options={[
            { value: 1, label: 'show' },
            { value: 0, label: 'hide' },
          ]}
        />
      </Controls>
      <Controls>
        <Button onClick={() => setValues(PRESETS.steady)}>Steady stall</Button>
        <Button onClick={() => setValues(PRESETS.wild)}>Unpredictable stall</Button>
        <Button onClick={() => setValues(PRESETS.start)}>Reset</Button>
      </Controls>
      <Readout
        items={[
          ['mean', fmt(m, 2)],
          ['sum of squares', fmt(ss, 2)],
          ['variance', fmt(variance, 3)],
          ['standard deviation', fmt(sd, 3)],
        ]}
      />
    </Figure>
  )
}
