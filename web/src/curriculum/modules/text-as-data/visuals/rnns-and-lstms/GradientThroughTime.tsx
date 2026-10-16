import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, Path, Dots, Rect, Label, usePlot, useNarrow, M } from '../../../../../kit'
import { TryNotice, textTone } from '../Caption'

/*
  Backpropagation through time multiplies one factor per step. For a plain RNN the factor is
  w·tanh′(…) (here a single number r); for an LSTM's cell-state path it is the forget gate f.
  The plot shows the gradient that survives k steps back, r^k and f^k, on a log scale.
*/

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sup = (e: number) => String(e).split('').map((c) => SUP[c]).join('')
const pow10 = (e: number) => (e === 0 ? '1' : `10${sup(e)}`)

/** 0.000000953 → "9.5×10⁻⁷"; numbers between 0.01 and 1000 are printed plainly */
export function sci(v: number) {
  if (v === 0) return '0'
  if (v >= 0.01 && v < 1000) return v.toPrecision(2)
  let e = Math.floor(Math.log10(v))
  let m = v / 10 ** e
  if (m.toFixed(1) === '10.0') {
    m = 1
    e += 1
  }
  return `${m.toFixed(1)}×${pow10(e)}`
}

/** y-axis labels 10⁻¹⁰ … 10¹⁰ (the plot's y values are log10 of the gradient size) */
function PowerTicks() {
  const { xs, ys } = usePlot()
  const x0 = xs.range()[0]
  return (
    <g className="plot-axes">
      {[-10, -5, 0, 5, 10].map((e) => (
        <g key={e} transform={`translate(${x0},${ys(e)})`}>
          <line x2={-5} />
          <text x={-8} dy="0.32em" textAnchor="end">
            {pow10(e)}
          </text>
        </g>
      ))}
    </g>
  )
}

const YMIN = -10
const YMAX = 10
const clampY = (y: number) => Math.max(YMIN - 0.5, Math.min(YMAX + 0.5, y))
const inRange = (y: number) => y >= YMIN - 1e-9 && y <= YMAX + 1e-9

/** where a path ends on the chart: its last point, or the point where it leaves the chart */
function endOf(pts: [number, number][]) {
  const last = pts[pts.length - 1]
  if (inRange(last[1])) return { x: last[0], y: last[1], off: false }
  const i = pts.findIndex(([, y]) => !inRange(y))
  const bound = pts[i][1] < YMIN ? YMIN : YMAX
  const [x0, y0] = pts[i - 1]
  const [x1, y1] = pts[i]
  return { x: x0 + ((bound - y0) / (y1 - y0)) * (x1 - x0), y: bound, off: true }
}

export default function GradientThroughTime() {
  const [r, setR] = useState(0.6)
  const [f, setF] = useState(0.95)
  const [K, setK] = useState(30)
  const [ref, narrow] = useNarrow<HTMLDivElement>(480)
  const ks = Array.from({ length: K + 1 }, (_, k) => k)
  const rnnRaw = ks.map((k) => [k, k * Math.log10(r)] as [number, number])
  const lstmRaw = ks.map((k) => [k, k * Math.log10(f)] as [number, number])
  const rnn = rnnRaw.map(([x, y]) => [x, clampY(y)] as [number, number])
  const lstm = lstmRaw.map(([x, y]) => [x, clampY(y)] as [number, number])
  const every = Math.ceil(K / 15)
  // dots only where the true value is on the chart (no dots piled up along the edge)
  const shown = (pts: [number, number][]) => pts.filter(([, y], i) => (i % every === 0 || i === K) && inRange(y))
  const rEnd = endOf(rnnRaw)
  const lEnd = endOf(lstmRaw)
  // direct labels: below a falling line, above a rising or flat one; split them if they would touch
  const close = !rEnd.off && !lEnd.off && Math.abs(rEnd.y - lEnd.y) < 1.6
  const rDy = close ? (rEnd.y <= lEnd.y ? 17 : -9) : r < 1 ? 17 : -9
  const lDy = close ? (lEnd.y < rEnd.y ? 17 : -9) : f < 1 ? 17 : -9

  return (
    <Figure
      title="How much gradient survives the trip back in time?"
      caption={
        <TryNotice
          tryIt={
            <>
              slide the RNN factor <M>r</M> below 1, then above 1, and compare the LSTM line with its forget gate <M>f</M> just below 1.
            </>
          }
          notice={
            <>
              after <M>k</M> steps the gradient is <M>{'r^k'}</M>: below 1 the signal from 30 words ago all but vanishes, above 1 it explodes. The LSTM's <M>{'f^k'}</M> only fades slowly.
            </>
          }
          note="Log scale: each faint grid line is 10 times smaller than the one above. Circles are the plain RNN, squares the LSTM's cell state."
        />
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
      <Plot x={[0, K]} y={[YMIN, YMAX]} width={520} height={330} minHeight={300} margin={{ left: 52, bottom: 38 }} ariaLabel="Gradient size against number of steps back, log scale, for a plain RNN and an LSTM cell path">
        <Rect x0={0} x1={K} y0={YMIN} y1={-3} fill="color-mix(in srgb, var(--viz-1) 9%, transparent)" />
        <Rect x0={0} x1={K} y0={3} y1={YMAX} fill="color-mix(in srgb, var(--viz-neg) 9%, transparent)" />
        <Grid xTicks={5} yTicks={20} />
        <Label x={0} y={YMIN} anchor="start" dx={6} dy={-6} color="var(--ink-2)" size={12}>
          {narrow ? 'vanishing' : 'vanishing: almost no learning signal'}
        </Label>
        {/* below the axis title "gradient size", which sits in the top-left corner */}
        <Label x={0} y={YMAX} anchor="start" dx={6} dy={34} color="var(--ink-2)" size={12}>
          {narrow ? 'exploding' : 'exploding: huge, unstable updates'}
        </Label>
        <Path points={rnn} color="var(--viz-2)" width={2.5} />
        <Path points={lstm} color="var(--viz-3)" width={2.5} />
        <Dots points={shown(rnnRaw).map(([x, y]) => ({ x, y, r: 3.5, color: 'var(--viz-2)' }))} />
        <Dots points={shown(lstmRaw).map(([x, y]) => ({ x, y, r: 3.5, color: 'var(--viz-3)', shape: 'square' as const }))} />
        {!rEnd.off && (
          <Label x={rEnd.x} y={rEnd.y} anchor="end" dx={-4} dy={rDy} color={textTone('var(--viz-2)')} size={12} weight={700}>
            RNN rᵏ
          </Label>
        )}
        {!lEnd.off && (
          <Label x={lEnd.x} y={lEnd.y} anchor="end" dx={-4} dy={lDy} color={textTone('var(--viz-3)')} size={12} weight={700}>
            LSTM fᵏ
          </Label>
        )}
        <Axes xLabel="steps back in time →" yLabel="gradient size" xTicks={5} hideYTicks />
        <PowerTicks />
      </Plot>
      {/* lines that leave the chart are named here, below the plot, so the notice never sits on top of a line */}
      {(rEnd.off || lEnd.off) && (
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', textAlign: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.2rem 1rem' }}>
          {rEnd.off && (
            <span style={{ color: textTone('var(--viz-2)'), fontWeight: 700 }}>
              RNN rᵏ {rEnd.y < 0 ? '▼ below' : '▲ above'} the chart after {Math.ceil(rEnd.x)} steps
            </span>
          )}
          {lEnd.off && <span style={{ color: textTone('var(--viz-3)'), fontWeight: 700 }}>LSTM fᵏ ▼ below the chart after {Math.ceil(lEnd.x)} steps</span>}
        </p>
      )}
      </div>
      <Controls>
        <Slider label={<span style={{ color: textTone('var(--viz-2)') }}>RNN factor per step r</span>} value={r} min={0.2} max={1.5} step={0.05} onChange={setR} format={(v) => v.toFixed(2)} />
        <Slider label={<span style={{ color: textTone('var(--viz-3)') }}>LSTM forget gate f</span>} value={f} min={0.5} max={1} step={0.01} onChange={setF} format={(v) => v.toFixed(2)} />
        <Slider label="Steps back k" value={K} min={5} max={50} step={1} onChange={setK} />
        <Readout
          items={[
            [`RNN ${r.toFixed(2)}${sup(K)}`, sci(r ** K)],
            [`LSTM ${f.toFixed(2)}${sup(K)}`, sci(f ** K)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
