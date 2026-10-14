import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, FnPath, Dots, Path, Label, DraggablePoint, M } from '../../../../../kit'
import { FLATS, AREA, PRICE, fmt, plainTick } from './hdbFlats'

/** The model price = w × area + b as a line with two knobs. Drag the knobs (or the line's handles) and use the model to predict. */

const X1 = 60
const X2 = 140
const clampY = (v: number) => Math.max(PRICE[0], Math.min(PRICE[1], v))
const round1 = (v: number) => Math.round(v * 10) / 10

export default function LineFitPlayground() {
  const [w, setW] = useState(3)
  const [b, setB] = useState(300)
  const [xq, setXq] = useState(95)
  const f = (x: number) => w * x + b
  const yq = f(xq)

  // Two handles on the line: moving one re-solves w and b so the line passes through both.
  const fromHandles = (y1: number, y2: number) => {
    const nw = round1((y2 - y1) / (X2 - X1))
    setW(nw)
    setB(Math.round(y1 - nw * X1))
  }

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
        {yq >= PRICE[0] && yq <= PRICE[1] && (
          <>
            <Path points={[[xq, PRICE[0]], [xq, yq]]} color="var(--viz-4)" width={1.5} dash="4 4" />
            <Path points={[[AREA[0], yq], [xq, yq]]} color="var(--viz-4)" width={1.5} dash="4 4" />
            <Label x={xq} y={yq} dx={right ? -14 : 14} dy={-12} anchor={right ? 'end' : 'start'} color="var(--viz-4)">
              {`${xq} m² → S$${fmt(yq)}k`}
            </Label>
          </>
        )}
        <DraggablePoint x={X1} y={clampY(f(X1))} lockX color="var(--viz-2)" r={8} label="drag" onChange={(_, y) => fromHandles(y, f(X2))} />
        <DraggablePoint x={X2} y={clampY(f(X2))} lockX color="var(--viz-2)" r={8} onChange={(_, y) => fromHandles(f(X1), y)} />
        <DraggablePoint
          x={xq}
          y={clampY(yq)}
          color="var(--viz-4)"
          r={7}
          constrain={(x) => [Math.round(x), clampY(f(Math.round(x)))]}
          onChange={(x) => setXq(Math.max(AREA[0], Math.min(AREA[1], Math.round(x))))}
        />
      </Plot>
      <Controls>
        <Slider label={<>slope <M>w</M> (S$k per m²)</>} value={w} min={0} max={9} step={0.1} onChange={setW} format={(v) => v.toFixed(1)} />
        <Slider label={<>intercept <M>b</M> (S$k)</>} value={b} min={-300} max={600} step={5} onChange={setB} />
      </Controls>
      <Readout
        items={[
          ['model', <M key="m">{`\\hat{y} = ${w.toFixed(1)}\\,x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`}</M>],
          ['each extra m² adds', `S$${fmt(w * 1000)}`],
          [`a ${xq} m² flat`, `S$${fmt(yq)}k`],
        ]}
      />
    </Figure>
  )
}
