import { useState } from 'react'
import { Figure, Controls, Readout, Toggle, Button, Plot, Grid, Axes, FnPath, Path, Dots, Label, DraggablePoint, M } from '../../../../../kit'

/*
  The graphs of e^x and its mirror image e^-x. Drag the point along e^x to read anchor values
  (e^-1 ≈ 0.37, e^0 = 1, e^1 ≈ 2.72, e^2 ≈ 7.39). The dashed tangent shows e's special property:
  the slope of e^x at any point equals its height. The curve never touches the x-axis, because
  e^x is positive for every x.
*/

const X0 = -3
const X1 = 3
const fx = (v: number) => {
  const r = Math.round(v * 100) / 100
  return String(Object.is(r, -0) ? 0 : r)
}
const XMAX = 2.05 // keep the point on screen (e^2.05 ≈ 7.8)

export default function ExpGraph() {
  const [x, setX] = useState(1)
  const [mirror, setMirror] = useState(true)
  const [tangent, setTangent] = useState(true)
  const y = Math.exp(x)
  const snap = (v: number) => Math.max(X0, Math.min(XMAX, Math.round(v * 10) / 10))
  const T = 0.75

  return (
    <Figure
      title="The graphs of eˣ and e⁻ˣ"
      caption={
        <>
          Drag the orange point along <M>{'e^x'}</M> or use the buttons to read the anchor values. However far left you go, the curve only creeps towards the
          axis: <M>{'e^x'}</M> is <b>always positive</b>, and it passes through <M>{'(0, 1)'}</M> because <M>{'e^0 = 1'}</M>. The green curve <M>{'e^{-x}'}</M> is the
          mirror image in the <M>y</M>-axis. With the tangent on, compare its slope with the height: for <M>{'e^x'}</M> they are always equal.
        </>
      }
    >
      <Plot x={[X0, X1]} y={[-0.6, 8]} width={480} height={340} minHeight={280} ariaLabel={`Graph of e to the x with a point at x = ${fx(x)}, height ${fx(y)}`}>
        <Grid xTicks={6} yTicks={8} />
        <Axes origin xLabel="x" yLabel="y" xTicks={6} yTicks={8} />
        {mirror && <FnPath f={(t) => Math.exp(-t)} color="var(--viz-3)" width={2.5} />}
        <FnPath f={Math.exp} color="var(--viz-1)" width={3.5} />
        {mirror && (
          <>
            <Path points={[[-x, y], [x, y]]} color="var(--viz-muted)" width={1.5} dash="3 4" />
            <Dots points={[{ x: -x, y, color: 'var(--viz-3)', r: 5.5 }]} />
          </>
        )}
        {tangent && <Path points={[[x - T, y - T * y], [x + T, y + T * y]]} color="var(--viz-4)" width={2.2} dash="7 5" />}
        <Dots points={[{ x: 0, y: 1, color: 'var(--viz-ink)', r: 4.5 }]} />
        <Label x={0} y={1} dy={-12} anchor="middle" size={12}>
          (0, 1)
        </Label>
        <Label x={2.08} y={7.6} dx={6} dy={4} color="var(--viz-1)" weight={700}>
          eˣ
        </Label>
        {mirror && (
          <Label x={-2.08} y={7.6} dx={-6} dy={4} anchor="end" color="var(--viz-3)" weight={700}>
            e⁻ˣ
          </Label>
        )}
        <DraggablePoint
          x={x}
          y={y}
          r={8}
          color="var(--viz-2)"
          constrain={(px) => {
            const s = snap(px)
            return [s, Math.exp(s)]
          }}
          onChange={(px) => setX(snap(px))}
        />
      </Plot>
      <Controls>
        <Readout
          items={[
            ['x', fx(x)],
            [<M key="h">{'e^x'}</M>, y.toFixed(3)],
            ['slope of tangent', y.toFixed(3)],
            [<M key="m">{'e^{-x} = 1/e^x'}</M>, (1 / y).toFixed(3)],
          ]}
        />
      </Controls>
      <Controls>
        {[-1, 0, 1, 2].map((v) => (
          <Button key={v} onClick={() => setX(v)} primary={x === v}>
            {`x = ${v}`}
          </Button>
        ))}
        <Toggle label="show the tangent" checked={tangent} onChange={setTangent} />
        <Toggle label="show e⁻ˣ" checked={mirror} onChange={setMirror} />
      </Controls>
    </Figure>
  )
}
