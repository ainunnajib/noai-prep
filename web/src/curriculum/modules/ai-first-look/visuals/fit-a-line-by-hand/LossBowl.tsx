import { useState } from 'react'
import { Controls, Readout, Toggle, Button, Plot, Grid, Axes, FnPath, Dots, Path, VLine, DraggablePoint, usePlot, useNarrow, M } from '../../../../../kit'
import Figure from '../TouchFigure'
import { FLATS, AREA, PRICE, mse, fmt, kTicks, plainTick } from './hdbFlats'

/*
  Linked views. Left: the flats and the line price = w × area + 100 (b is fixed at 100).
  Right: the loss curve MSE(w). Drag the line's handle or the dot on the curve; both stay in sync.
  "Fog" hides the curve and shows only the slopes you have tried, like a computer that can only test one w at a time.
*/

const B = 100
const XH = 120 // x-position of the line's handle (stays inside the plot for every w from 3 to 7)
const W_RANGE: [number, number] = [3, 7]
const L_RANGE: [number, number] = [0, 45000]
const loss = (w: number) => mse(w, B)
// For b = 100 the minimum of MSE(w) is at w = Σx(y − 100) / Σx².
const W_STAR = FLATS.reduce((a, [x, y]) => a + x * (y - B), 0) / FLATS.reduce((a, [x]) => a + x * x, 0)
const snap = (w: number) => Math.round(Math.max(W_RANGE[0], Math.min(W_RANGE[1], w)) * 20) / 20

function Residuals({ w }: { w: number }) {
  const { xs, ys, clipId } = usePlot()
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {FLATS.map(([x, y], i) => (
        <line key={i} x1={xs(x)} x2={xs(x)} y1={ys(y)} y2={ys(w * x + B)} style={{ stroke: 'var(--viz-neg)', strokeWidth: 1.4, opacity: 0.8 }} />
      ))}
    </g>
  )
}

export default function LossBowl() {
  const [w, setW0] = useState(3.6)
  const [tried, setTried] = useState<number[]>([3.6])
  const [fog, setFog] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(620)

  const setW = (v: number) => {
    const s = snap(v)
    setW0(s)
    setTried((t) => (t.includes(s) ? t : [...t.slice(-150), s]))
  }
  const L = loss(w)

  const left = (
    <Plot x={AREA} y={PRICE} width={360} height={300} minHeight={250} margin={{ left: 46 }} ariaLabel="HDB flats with the line price = w times area + 100">
      <Grid xTicks={6} yTicks={8} />
      <Axes xLabel="area (m²)" yLabel="price (S$k)" xTicks={narrow ? 6 : 4} yTicks={5} tickFormat={plainTick} />
      <Residuals w={w} />
      <FnPath f={(x) => w * x + B} color="var(--viz-2)" width={3} />
      <Dots points={FLATS.map(([x, y]) => ({ x, y }))} r={4} color="var(--viz-1)" />
      <DraggablePoint x={XH} y={Math.max(PRICE[0], Math.min(PRICE[1], w * XH + B))} lockX color="var(--viz-2)" r={8} label="drag" onChange={(_, y) => setW((y - B) / XH)} />
    </Plot>
  )

  const right = (
    <Plot x={W_RANGE} y={L_RANGE} width={360} height={300} minHeight={250} margin={{ left: 46 }} ariaLabel="Loss curve: mean squared error against the slope w">
      <Grid xTicks={8} yTicks={9} />
      <Axes xLabel="slope w" yLabel="MSE" xTicks={4} yTicks={5} tickFormat={kTicks} />
      {!fog && (
        <>
          <FnPath f={loss} color="var(--viz-3)" width={3} />
          <VLine x={W_STAR} color="var(--viz-3)" label="lowest point" />
        </>
      )}
      <Dots points={tried.filter((t) => t !== w).map((t) => ({ x: t, y: loss(t), r: 3.5, color: 'var(--viz-muted)' }))} />
      <Path points={[[w, 0], [w, L]]} color="var(--viz-2)" width={1.5} dash="4 4" />
      <DraggablePoint x={w} y={Math.min(L, L_RANGE[1])} color="var(--viz-2)" r={8} constrain={(x) => [snap(x), Math.min(loss(snap(x)), L_RANGE[1])]} onChange={(x) => setW(x)} label={tried.length < 3 ? 'drag me' : undefined} />
    </Plot>
  )

  return (
    <Figure
      title="Every line is one point on the loss curve"
      wide
      caption={
        <>
          The intercept is fixed at <M>b = 100</M>, so the only knob is the slope <M>w</M>. Drag the orange handle on the line (left) or the orange dot on the curve
          (right): they are the same model seen two ways. The curve is a valley, and the best slope sits at its bottom. Switch on <strong>fog</strong> to hide the
          curve, like a computer that can only test one slope at a time, and find the bottom from the grey dots you leave behind.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.2rem' }}>
            The model: <M>{`\\hat{y} = ${w.toFixed(2)}\\,x + 100`}</M>
          </div>
          {left}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.2rem' }}>Its loss: MSE for each slope w</div>
          {right}
        </div>
      </div>
      <Controls>
        <Readout
          items={[
            ['slope w', w.toFixed(2)],
            ['MSE', fmt(L)],
            ...(fog ? [] : ([['lowest point', `w ≈ ${W_STAR.toFixed(2)}, MSE ≈ ${fmt(loss(W_STAR))}`]] as [string, string][])),
          ]}
        />
        <Toggle label="Fog (hide the curve)" checked={fog} onChange={setFog} />
        <Button onClick={() => setTried([w])} disabled={tried.length <= 1}>
          Clear dots
        </Button>
      </Controls>
    </Figure>
  )
}
