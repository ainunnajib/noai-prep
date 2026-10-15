import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Grid, Axes, FnPath, Path, Dots, HLine, Label, Arrow, DraggablePoint, usePlot, useNarrow, M } from '../../../../../kit'
import s from './gb.module.css'

/*
  The first step of gradient boosting under two losses.
  L2 = ½(y − F)²: start at the MEAN, pseudo-residual = −∂L/∂F = y − F (the residual).
  L1 = |y − F|:   start at the MEDIAN, pseudo-residual = −∂L/∂F = sign(y − F) (just ±1).
  Drag the last point (an outlier) and compare.
*/

const BASE = [2.6, 3.4, 3.1, 4.2, 3.8, 4.9, 4.5, 5.3]
type Loss = 'l2' | 'l1'
const Y_MAX = 16

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
const median = (v: number[]) => {
  const t = v.slice().sort((a, b) => a - b)
  const k = t.length >> 1
  return t.length % 2 ? t[k] : (t[k - 1] + t[k]) / 2
}
const sign = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v > 0 ? 1 : -1)
const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))
/** bar labels: whole numbers as they are, small values with 2 decimals, the rest with 1 */
const fmtBar = (v: number) => {
  if (Math.abs(v) < 1e-9) return '0'
  const a = Math.abs(v)
  const t = Number.isInteger(v) ? a.toFixed(0) : a < 0.1 ? a.toFixed(2) : a.toFixed(1)
  return `${v > 0 ? '+' : '−'}${t}`
}

function PseudoBars({ g, highlight }: { g: number[]; highlight: number }) {
  const { xs, ys } = usePlot()
  const w = Math.min(26, Math.abs(xs(1) - xs(0)) * 0.55)
  return (
    <g>
      {g.map((v, i) => {
        const x = xs(i + 1)
        const y0 = ys(0)
        const y1 = ys(v)
        const col = i === highlight ? 'var(--viz-2)' : 'var(--viz-1)'
        return (
          <g key={i}>
            <rect x={x - w / 2} y={Math.min(y0, y1)} width={w} height={Math.max(1, Math.abs(y1 - y0))} rx={2} style={{ fill: `color-mix(in srgb, ${col} 70%, var(--surface))`, stroke: col, strokeWidth: 1 }} />
            <text x={x} y={v >= 0 ? y1 - 5 : y1 + 13} textAnchor="middle" className={s.svgText} style={{ fill: 'var(--ink-2)', fontSize: w < 20 ? 10 : 11.5, fontWeight: 700 }}>
              {fmtBar(v)}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default function PseudoResidualToggle() {
  const [loss, setLoss] = useState<Loss>('l2')
  const [out, setOut] = useState(12)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const ys = [...BASE, out]
  const n = ys.length
  const mu = mean(ys)
  const med = median(ys)
  const F0 = loss === 'l2' ? mu : med
  const g = ys.map((y) => (loss === 'l2' ? y - F0 : sign(y - F0)))
  const sumG = g.reduce((a, b) => a + b, 0)
  // bar scale: always the L2 residual range, so the ±1 targets of L1 look as small as they are
  const l2r = ys.map((y) => y - mu)
  const bMax = Math.max(4, ...l2r.map((v) => Math.abs(v))) * 1.15
  const yOut = out
  const slope = loss === 'l2' ? -(yOut - F0) : -sign(yOut - F0) // dL/dF for the outlier
  const lossFn = (F: number) => (loss === 'l2' ? 0.5 * (yOut - F) ** 2 : Math.abs(yOut - F))
  const LF0 = lossFn(F0)
  const lossTop = loss === 'l2' ? Math.max(8, 0.5 * Math.max(yOut, Y_MAX - yOut) ** 2) : Math.max(4, Math.max(yOut, Y_MAX - yOut))

  const dataPlot = (
    <Plot x={[0.3, 9.7]} y={[0, Y_MAX]} width={360} height={290} minHeight={260} margin={{ left: 34, right: 10, top: 10, bottom: 38 }} ariaLabel={`Nine points; the starting prediction is the ${loss === 'l2' ? 'mean' : 'median'}, ${F0.toFixed(2)}`}>
      <Grid xTicks={9} yTicks={8} />
      <Axes xTicks={9} yTicks={8} xLabel="example" yLabel="y" />
      <HLine y={loss === 'l2' ? med : mu} color="var(--viz-muted)" dash="5 4" width={1.5} />
      <Path points={[[0.3, F0], [9.7, F0]]} color="var(--viz-3)" width={3} />
      <Label x={0.4} y={F0} dy={-7} color="var(--viz-3)" size={12} weight={700}>
        {loss === 'l2' ? `F₀ = mean = ${F0.toFixed(2)}` : `F₀ = median = ${F0.toFixed(2)}`}
      </Label>
      {g.map((v, i) =>
        Math.abs(v) < 1e-9 ? null : (
          <Arrow key={i} from={[i + 1, F0]} to={[i + 1, F0 + v]} color={i === n - 1 ? 'var(--viz-2)' : 'var(--viz-1)'} width={2} head={7} />
        ),
      )}
      <Dots points={BASE.map((y, i) => ({ x: i + 1, y, r: 4.5, color: 'var(--viz-ink)' }))} />
      <DraggablePoint x={n} y={out} lockX onChange={(_, y) => setOut(Math.round(y * 10) / 10)} color="var(--viz-2)" r={8} label="drag" constrain={(x, y) => [x, Math.max(0.2, Math.min(Y_MAX - 0.5, y))]} />
    </Plot>
  )

  const lossPlot = (
    <Plot x={[0, Y_MAX]} y={[0, lossTop]} width={300} height={290} minHeight={240} margin={{ left: 40, right: 10, top: 10, bottom: 38 }} ariaLabel={`Loss of the dragged point against the prediction F; slope at F0 is ${slope.toFixed(2)}`}>
      <Grid xTicks={8} yTicks={5} />
      <Axes xTicks={8} yTicks={5} xLabel="prediction F" yLabel={loss === 'l2' ? '½(y − F)²' : '|y − F|'} />
      <FnPath f={lossFn} color="var(--viz-2)" width={2.6} samples={200} />
      <FnPath f={(F) => LF0 + slope * (F - F0)} domain={[Math.max(0, F0 - 3), Math.min(Y_MAX, F0 + 3)]} color="var(--viz-ink)" width={1.6} dash="5 4" />
      <Dots points={[{ x: F0, y: LF0, r: 5.5, color: 'var(--viz-3)' }]} />
      <Arrow from={[F0, lossTop * 0.06]} to={[F0 + (loss === 'l2' ? yOut - F0 : sign(yOut - F0)), lossTop * 0.06]} color="var(--viz-2)" width={2.6} head={8} />
      <Label x={F0} y={lossTop * 0.06} dy={-9} anchor="middle" color="var(--viz-2)" size={11.5} weight={700}>
        −slope = {f2(-slope)}
      </Label>
    </Plot>
  )

  const bars = (
    <Plot x={[0.3, 9.7]} y={[-bMax, bMax]} width={640} height={190} minHeight={180} margin={{ left: 34, right: 10, top: 12, bottom: 26 }} ariaLabel={`Pseudo-residuals under ${loss === 'l2' ? 'L2' : 'L1'} loss`}>
      <Axes xTicks={9} yTicks={4} />
      <HLine y={0} color="var(--viz-axis)" dash="" width={1.2} />
      <PseudoBars g={g} highlight={n - 1} />
    </Plot>
  )

  return (
    <Figure
      wide
      title="Pseudo-residuals: what the first tree is asked to learn"
      caption={
        <>
          Nine examples; drag the orange one to make it an outlier. With <b>L2</b>, the start is the <b>mean</b> and each arrow is the full residual{' '}
          <M>{'y - F_0'}</M>: drag the outlier up and its arrow (and its pull on the mean) grows without limit. Switch to <b>L1</b>: the start is the{' '}
          <b>median</b>, which barely notices the outlier, and every pseudo-residual is just <M>{'\\operatorname{sign}(y - F_0) = \\pm 1'}</M>: each point
          says only "go up" or "go down". The right panel shows why: the pseudo-residual is minus the slope of that point's loss at <M>{'F_0'}</M>.
        </>
      }
    >
      <div ref={wrapRef} className={s.panels} style={{ gridTemplateColumns: narrow ? '1fr' : '1.2fr 1fr' }}>
        <div>
          <p className={s.panelTitle}>Data, starting prediction F₀ and pseudo-residual arrows</p>
          {dataPlot}
          <div className={s.legend}>
            <span>
              <i className={s.line} style={{ borderColor: 'var(--viz-3)' }} /> F₀ for this loss
            </span>
            <span>
              <i className={s.dashed} style={{ borderColor: 'var(--viz-muted)' }} /> {loss === 'l2' ? `median (${med.toFixed(2)})` : `mean (${mu.toFixed(2)})`}, for comparison
            </span>
          </div>
        </div>
        <div>
          <p className={s.panelTitle}>Loss of the orange point as its prediction F changes</p>
          {lossPlot}
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <p className={s.panelTitle}>
          Pseudo-residuals {loss === 'l2' ? <M>{'y - F_0'}</M> : <M>{'\\operatorname{sign}(y - F_0)'}</M>}: the targets for tree 1 (same scale for both losses)
        </p>
        {bars}
      </div>
      <Readout
        items={[
          ['F₀', `${F0.toFixed(2)} (${loss === 'l2' ? 'mean' : 'median'})`],
          ['outlier’s pseudo-residual', f2(g[n - 1])],
          ['sum of all nine', f2(sumG)],
        ]}
      />
      <Controls>
        <Segmented
          label="Loss"
          value={loss}
          onChange={setLoss}
          options={[
            { value: 'l2', label: 'L2: ½(y − F)²' },
            { value: 'l1', label: 'L1: |y − F|' },
          ]}
        />
        <Button onClick={() => setOut(5.6)}>No outlier</Button>
        <Button onClick={() => setOut(15)}>Big outlier</Button>
      </Controls>
      <p className={s.note}>
        Notice the last read-out: at the best constant, the pseudo-residuals add up to zero (the residuals balance around the mean; the signs balance
        around the median). That is exactly why the mean and the median are the best starting points: the total loss has zero slope there.
      </p>
    </Figure>
  )
}
