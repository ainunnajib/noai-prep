import { useState } from 'react'
import { Controls, Readout, Slider, Plot, Grid, Axes, FnPath, Dots, Path, Label, DraggablePoint, M } from '../../../../../kit'
import Figure from '../TouchFigure'
import { FLATS, AREA, PRICE, fmt, plainTick } from './hdbFlats'

/** The model price = w × area + b as a line with two knobs. Drag the knobs (or the line's handles) and use the model to predict. */

const X1 = 60
const X2 = 140
// Knob ranges: with these, the line always crosses the plot window somewhere.
const W_MIN = 2
const W_MAX = 8
const B_MIN = -100
const B_MAX = 400
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const clampY = (v: number) => clamp(v, PRICE[0], PRICE[1])
const onChart = (v: number) => v >= PRICE[0] && v <= PRICE[1]
const round1 = (v: number) => Math.round(v * 10) / 10

export default function LineFitPlayground() {
  const [w, setW] = useState(3)
  const [b, setB] = useState(300)
  const [xq, setXq] = useState(95)
  const f = (x: number) => w * x + b
  const yq = f(xq)

  // Two handles on the line: moving one re-solves w and b so the line passes through both
  // (as closely as the knobs' ranges and steps allow, so the sliders always match the line).
  const fromHandles = (y1: number, y2: number) => {
    const nw = clamp(round1((y2 - y1) / (X2 - X1)), W_MIN, W_MAX)
    setW(nw)
    setB(clamp(Math.round((y1 - nw * X1) / 5) * 5, B_MIN, B_MAX))
  }
  const y1 = f(X1)
  const y2 = f(X2)
  const qOn = onChart(yq)

  const right = xq > 112
  return (
    <Figure
      title="Fit a line to 30 HDB flats"
      caption={
        <>
          Each dot is one flat. Move the orange line with the two sliders, or drag its orange handles, until it runs through the middle of the cloud. Then drag the
          pink point along the line: that is the model in use, turning a floor area into a predicted price. Some knob settings are clearly better than others, but
          by eye you cannot tell exactly which is best. The next figure fixes that.
        </>
      }
    >
      <Plot x={AREA} y={PRICE} width={520} height={360} minHeight={300} margin={{ left: 46 }} ariaLabel="Scatter plot of 30 HDB flats, floor area against price, with an adjustable straight line">
        <Grid xTicks={6} yTicks={8} />
        <Axes xLabel="floor area (m²)" yLabel="price (S$ thousands)" xTicks={6} yTicks={5} tickFormat={plainTick} />
        <Dots points={FLATS.map(([x, y]) => ({ x, y }))} r={4.5} color="var(--viz-1)" />
        <FnPath f={f} color="var(--viz-2)" width={3} />
        {qOn && (
          <>
            <Path points={[[xq, PRICE[0]], [xq, yq]]} color="var(--viz-4)" width={1.5} dash="4 4" />
            <Path points={[[AREA[0], yq], [xq, yq]]} color="var(--viz-4)" width={1.5} dash="4 4" />
            <Label x={xq} y={yq} dx={right ? -14 : 14} dy={-12} anchor={right ? 'end' : 'start'} color="var(--viz-4)">
              {`${xq} m² → S$${fmt(yq)}k`}
            </Label>
          </>
        )}
        {/* a handle (or the pink point) is only drawn where the line is inside the chart, so it always sits on the line */}
        {onChart(y1) && <DraggablePoint x={X1} y={y1} lockX color="var(--viz-2)" r={8} label="drag" onChange={(_, y) => fromHandles(y, y2)} />}
        {onChart(y2) && <DraggablePoint x={X2} y={y2} lockX color="var(--viz-2)" r={8} onChange={(_, y) => fromHandles(y1, y)} />}
        {qOn && (
          <DraggablePoint
            x={xq}
            y={yq}
            color="var(--viz-4)"
            r={7}
            constrain={(x) => [Math.round(x), clampY(f(Math.round(x)))]}
            onChange={(x) => setXq(clamp(Math.round(x), AREA[0], AREA[1]))}
          />
        )}
      </Plot>
      <Controls>
        <Slider label={<>slope <M>w</M> (S$k per m²)</>} value={w} min={W_MIN} max={W_MAX} step={0.1} onChange={setW} format={(v) => v.toFixed(1)} />
        <Slider label={<>intercept <M>b</M> (S$k)</>} value={b} min={B_MIN} max={B_MAX} step={5} onChange={setB} />
      </Controls>
      <Readout
        items={[
          ['model', <M key="m">{`\\hat{y} = ${w.toFixed(1)}\\,x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`}</M>],
          ['each extra m² adds', `S$${fmt(w * 1000)}`],
          [`a ${xq} m² flat`, qOn ? `S$${fmt(yq)}k` : `S$${fmt(yq)}k (off the chart)`],
        ]}
      />
    </Figure>
  )
}
