import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Path, VLine, Dots, Label, useNarrow } from '../../../../../kit'

/*
  One parameter, a stream of gradients g_t. Step size divided by η for three rules:
    SGD:      |g_t|
    Adagrad:  |g_t| / √(g_1² + … + g_t²)         (sum keeps growing → steps shrink for ever)
    RMSProp:  |g_t| / √s_t,  s_t = ρ s_{t−1} + (1 − ρ) g_t²,  s_0 = 0   (forgets old gradients)
  Plotted on a log scale (each grid line is ×10).
*/

const T = 200
type Scenario = 'steady' | 'drop' | 'rise'
const SWITCH = 60
const gradOf = (sc: Scenario, t: number) => (sc === 'steady' ? 1 : sc === 'drop' ? (t <= SWITCH ? 4 : 0.25) : t <= SWITCH ? 0.25 : 4)
const LOG_MIN = -2.5
const LOG_MAX = 1.2
const clampLog = (v: number) => Math.max(LOG_MIN, Math.min(LOG_MAX, Math.log10(Math.max(v, 1e-9))))
const fmtTick = (v: number) => {
  const p = 10 ** v
  return p >= 1 ? String(Math.round(p)) : p >= 0.1 ? p.toFixed(1) : p.toFixed(2)
}

export default function AdagradVsRMSProp() {
  const [sc, setSc] = useState<Scenario>('drop')
  const [rho, setRho] = useState(0.9)
  const [t, setT] = useState(120)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const series = useMemo(() => {
    let sum = 0
    let s = 0
    const sgd: number[] = []
    const ada: number[] = []
    const rms: number[] = []
    for (let k = 1; k <= T; k++) {
      const g = gradOf(sc, k)
      sum += g * g
      s = rho * s + (1 - rho) * g * g
      sgd.push(Math.abs(g))
      ada.push(Math.abs(g) / Math.sqrt(sum))
      rms.push(Math.abs(g) / Math.sqrt(s))
    }
    return { sgd, ada, rms }
  }, [sc, rho])

  const toPts = (arr: number[]): [number, number][] => arr.map((v, i) => [i + 1, clampLog(v)])
  const i = t - 1

  return (
    <Figure
      title="Adagrad remembers everything; RMSProp forgets"
      caption={
        <>
          The step each rule would take, divided by the learning rate η, on a log scale (each grid line is 10 times the one below). Grey
          is plain SGD, whose step just follows the gradient. <b>Adagrad</b> divides by the square root of the <i>sum</i> of all past squared
          gradients, which only ever grows, so its steps shrink for ever; after the gradient drops at step {SWITCH} it all but stops.{' '}
          <b>RMSProp</b> divides by a moving average instead, so within about 60 to 70 steps (at ρ = 0.9; faster with a smaller ρ) it is
          back to steps of about η. Its very first steps
          are too big because its average starts at 0 (Adam&apos;s bias correction fixes that). Try the other gradient patterns and ρ.
        </>
      }
    >
      <Segmented
        label="Gradient pattern"
        value={sc}
        onChange={setSc}
        options={[
          { value: 'steady', label: 'steady (1)' },
          { value: 'drop', label: 'big, then small' },
          { value: 'rise', label: 'small, then big' },
        ]}
      />
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot x={[0, T]} y={[LOG_MIN, LOG_MAX]} width={narrow ? 360 : 540} height={narrow ? 240 : 270} maxWidth={680} minHeight={220} margin={{ left: 44 }} ariaLabel={`Step sizes of SGD, Adagrad and RMSProp over ${T} steps`}>
          <Grid xTicks={10} yTicks={4} />
          <Axes xLabel="step t" xTicks={narrow ? 4 : 8} hideYTicks />
          <Axes yLabel="step size ÷ η" yTicks={4} tickFormat={fmtTick} hideXTicks />
          <VLine x={t} color="var(--viz-muted)" dash="3 3" />
          <Path points={toPts(series.sgd)} color="var(--viz-muted)" width={2} dash="6 4" />
          <Path points={toPts(series.ada)} color="var(--viz-2)" width={2.8} />
          <Path points={toPts(series.rms)} color="var(--viz-3)" width={2.8} />
          <Dots
            points={[
              { x: t, y: clampLog(series.ada[i]), r: 5.5, color: 'var(--viz-2)' },
              { x: t, y: clampLog(series.rms[i]), r: 5.5, color: 'var(--viz-3)' },
            ]}
          />
          <Label x={T} y={clampLog(series.rms[T - 1])} dy={-8} anchor="end" color="var(--viz-3)" weight={700}>
            RMSProp
          </Label>
          <Label x={T} y={clampLog(series.ada[T - 1])} dy={-8} anchor="end" color="var(--viz-2)" weight={700}>
            Adagrad
          </Label>
          <Label x={T} y={clampLog(series.sgd[T - 1])} dy={series.sgd[T - 1] === series.rms[T - 1] || Math.abs(clampLog(series.sgd[T - 1]) - clampLog(series.rms[T - 1])) < 0.25 ? 16 : -8} anchor="end" color="var(--ink-3)" weight={700}>
            SGD
          </Label>
        </Plot>
      </div>
      <Controls>
        <Slider label="look at step t" value={t} min={1} max={T} step={1} onChange={setT} />
        <Slider label="RMSProp ρ (decay of its average)" value={rho} min={0.8} max={0.999} step={0.001} onChange={setRho} format={(v) => v.toFixed(3)} />
      </Controls>
      <Readout
        items={[
          ['gradient g', series.sgd[i].toFixed(2)],
          ['Adagrad step', `${series.ada[i].toPrecision(2)} η`],
          ['RMSProp step', `${series.rms[i].toPrecision(2)} η`],
        ]}
      />
    </Figure>
  )
}
