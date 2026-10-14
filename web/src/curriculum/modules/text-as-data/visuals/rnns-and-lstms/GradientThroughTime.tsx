import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, Path, Dots, Rect, Label, usePlot, M } from '../../../../../kit'

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

export default function GradientThroughTime() {
  const [r, setR] = useState(0.6)
  const [f, setF] = useState(0.95)
  const [K, setK] = useState(30)
  const ks = Array.from({ length: K + 1 }, (_, k) => k)
  const rnn = ks.map((k) => [k, clampY(k * Math.log10(r))] as [number, number])
  const lstm = ks.map((k) => [k, clampY(k * Math.log10(f))] as [number, number])

  return (
    <Figure
      title="How much gradient survives the trip back in time?"
      caption={
        <>
          Going back one step multiplies the gradient by one factor, so after <M>k</M> steps it is <M>{'r^k'}</M> for a plain RNN and <M>{'f^k'}</M> along an LSTM's cell state (log scale:
          each faint grid line is 10 times smaller than the one above). Slide the RNN factor below 1 and the signal from 30 words ago all but vanishes; push it above 1 and it explodes. The LSTM's forget gate can sit just below
          1, so the signal fades slowly instead.
        </>
      }
    >
      <Plot x={[0, K]} y={[YMIN, YMAX]} width={520} height={330} minHeight={300} margin={{ left: 52, bottom: 38 }} ariaLabel="Gradient size against number of steps back, log scale, for a plain RNN and an LSTM cell path">
        <Rect x0={0} x1={K} y0={YMIN} y1={-3} fill="color-mix(in srgb, var(--viz-1) 9%, transparent)" />
        <Rect x0={0} x1={K} y0={3} y1={YMAX} fill="color-mix(in srgb, var(--viz-neg) 9%, transparent)" />
        <Grid xTicks={5} yTicks={20} />
        <Label x={K} y={-9.4} anchor="end" dx={-6} color="var(--ink-2)" size={12}>
          vanishing: almost no learning signal
        </Label>
        <Label x={K} y={9.4} anchor="end" dx={-6} dy={8} color="var(--ink-2)" size={12}>
          exploding: huge, unstable updates
        </Label>
        <Path points={rnn} color="var(--viz-2)" width={2.5} />
        <Path points={lstm} color="var(--viz-3)" width={2.5} />
        <Dots points={rnn.filter((_, i) => i % Math.ceil(K / 15) === 0 || i === K).map(([x, y]) => ({ x, y, r: 3.5, color: 'var(--viz-2)' }))} />
        <Dots points={lstm.filter((_, i) => i % Math.ceil(K / 15) === 0 || i === K).map(([x, y]) => ({ x, y, r: 3.5, color: 'var(--viz-3)', shape: 'square' as const }))} />
        <Axes xLabel="steps back in time →" yLabel="gradient size" xTicks={5} hideYTicks />
        <PowerTicks />
      </Plot>
      <Controls>
        <Slider label={<span style={{ color: 'var(--viz-2)' }}>RNN factor per step r</span>} value={r} min={0.2} max={1.5} step={0.05} onChange={setR} format={(v) => v.toFixed(2)} />
        <Slider label={<span style={{ color: 'var(--viz-3)' }}>LSTM forget gate f</span>} value={f} min={0.5} max={1} step={0.01} onChange={setF} format={(v) => v.toFixed(2)} />
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
