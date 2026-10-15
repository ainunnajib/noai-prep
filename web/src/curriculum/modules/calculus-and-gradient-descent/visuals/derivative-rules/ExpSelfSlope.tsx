import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Grid, Axes, FnPath, Path, Dots, Label } from '../../../../../kit'
import { Handle, LineThrough, Legend, fx } from '../derivatives-as-slopes/plotHelpers'

/*
  bˣ for b = 2, e, 3: the tangent at the draggable point meets the x-axis exactly 1/ln b to
  the left, so the shaded triangle has base 1/ln b and height bˣ. Slope = height ÷ base =
  (ln b)·bˣ. Only for b = e is the base exactly 1, so slope = height. The ln x tab shows the
  tangent's run-1 triangle with rise 1/x, and the curve 1/x as the slope curve.
*/

type Mode = '2' | 'e' | '3' | 'ln'
const BASES: Record<Exclude<Mode, 'ln'>, number> = { '2': 2, e: Math.E, '3': 3 }

export default function ExpSelfSlope() {
  const [mode, setMode] = useState<Mode>('e')
  const [xe, setXe] = useState(1.2)
  const [xl, setXl] = useState(2)

  return (
    <Figure
      title={mode === 'ln' ? 'ln x: the slope is 1/x' : mode === 'e' ? 'eˣ: the slope equals the height' : `${mode}ˣ: the slope is a fixed multiple of the height`}
      caption={
        mode === 'ln' ? (
          <>
            Drag the point. The tangent rises 1/<i>x</i> for every 1 unit of run, and the dashed orange curve 1/<i>x</i> passes exactly through the
            slope&apos;s value. Near <i>x</i> = 0 the slope is huge; far out it is tiny. Notice that <i>x</i> × slope is always exactly 1.
          </>
        ) : (
          <>
            Drag the point along the curve. The tangent always hits the <i>x</i>-axis the same distance to the left, making a triangle with height
            equal to the curve&apos;s height. Slope = height ÷ base. For <b>eˣ</b> the base is exactly 1, so <b>slope = height</b> everywhere and the
            dashed slope curve lies right on top of the curve itself. Switch to 2ˣ and 3ˣ: their slopes are a fixed multiple (0.69 or 1.10) of their
            heights.
          </>
        )
      }
    >
      <Controls>
        <Segmented
          label="Function"
          value={mode}
          onChange={setMode}
          options={[
            { value: '2', label: '2ˣ' },
            { value: 'e', label: 'eˣ' },
            { value: '3', label: '3ˣ' },
            { value: 'ln', label: 'ln x' },
          ]}
        />
      </Controls>
      {mode === 'ln' ? <LnPanel x0={xl} setX0={setXl} /> : <ExpPanel b={BASES[mode]} name={mode === 'e' ? 'e' : mode} x0={xe} setX0={setXe} />}
    </Figure>
  )
}

function ExpPanel({ b, name, x0, setX0 }: { b: number; name: string; x0: number; setX0: (v: number) => void }) {
  const k = Math.log(b) // slope = k · height
  const f = (x: number) => b ** x
  const y0 = f(x0)
  const slope = k * y0
  const base = 1 / k // tangent meets the axis this far left
  const foot = x0 - base
  const X: [number, number] = [-4, 2.4]
  const Y: [number, number] = [-0.8, 10]
  return (
    <>
      <Legend
        items={[
          { color: 'var(--viz-1)', label: `y = ${name}ˣ` },
          { color: 'var(--viz-2)', label: 'its slope at each x', dash: true },
          { color: 'var(--viz-3)', label: 'tangent' },
        ]}
      />
      <Plot x={X} y={Y} width={520} height={340} minHeight={290} maxWidth={680} ariaLabel={`Graph of ${name} to the x with its tangent at x = ${fx(x0, 2)}`}>
        <Grid xTicks={7} yTicks={5} />
        <Axes origin xTicks={7} yTicks={5} xLabel="x" />
        <Path points={[[foot, 0], [x0, 0], [x0, y0]]} closed fill="color-mix(in srgb, var(--viz-3) 16%, transparent)" color="none" width={0} />
        <FnPath f={f} color="var(--viz-1)" width={3} />
        <FnPath f={(x) => k * f(x)} color="var(--viz-2)" width={2.5} dash="8 5" />
        <LineThrough x={x0} y={y0} slope={slope} color="var(--viz-3)" width={2.4} />
        <Path points={[[x0, 0], [x0, y0]]} color="var(--viz-4)" width={4} />
        <Path points={[[foot, 0], [x0, 0]]} color="var(--viz-3)" width={4} />
        <Label x={x0} y={y0 / 2} dx={8} color="var(--viz-4)" weight={700}>
          {`height ${fx(y0, 2)}`}
        </Label>
        <Label x={(foot + x0) / 2} y={0} dy={-8} anchor="middle" color="var(--viz-3)" weight={700}>
          {`base ${fx(base, 2)}`}
        </Label>
        <Dots points={[{ x: foot, y: 0, r: 4, color: 'var(--viz-3)' }]} />
        <Handle
          x={x0}
          y={y0}
          color="var(--viz-1)"
          label="drag"
          ariaLabel="point on the curve: drag along x"
          constrain={(nx) => {
            const s = Math.max(-2, Math.min(2, Math.round(nx * 20) / 20))
            return [s, f(s)]
          }}
          onChange={(nx) => setX0(nx)}
        />
      </Plot>
      <Readout
        items={[
          ['x', fx(x0, 2)],
          [`height ${name}ˣ`, fx(y0, 3)],
          ['slope', fx(slope, 3)],
          ['slope ÷ height', fx(k, 3)],
        ]}
      />
    </>
  )
}

function LnPanel({ x0, setX0 }: { x0: number; setX0: (v: number) => void }) {
  const y0 = Math.log(x0)
  const slope = 1 / x0
  const X: [number, number] = [0, 6]
  const Y: [number, number] = [-2.6, 3]
  return (
    <>
      <Legend
        items={[
          { color: 'var(--viz-1)', label: 'y = ln x' },
          { color: 'var(--viz-2)', label: 'its slope 1/x', dash: true },
          { color: 'var(--viz-3)', label: 'tangent' },
        ]}
      />
      <Plot x={X} y={Y} width={520} height={340} minHeight={290} maxWidth={680} ariaLabel={`Graph of ln x with its tangent at x = ${fx(x0, 2)}`}>
        <Grid xTicks={6} yTicks={6} />
        <Axes origin xTicks={6} yTicks={6} xLabel="x" />
        <FnPath f={Math.log} domain={[0.03, 6]} color="var(--viz-1)" width={3} />
        <FnPath f={(x) => 1 / x} domain={[0.15, 6]} color="var(--viz-2)" width={2.5} dash="8 5" />
        <LineThrough x={x0} y={y0} slope={slope} color="var(--viz-3)" width={2.4} />
        <Path points={[[x0, y0], [x0 + 1, y0], [x0 + 1, y0 + slope]]} color="var(--viz-ink)" width={1.8} dash="5 4" />
        <Label x={x0 + 1} y={y0 + slope / 2} dx={x0 > 3.2 ? -6 : 6} dy={4} anchor={x0 > 3.2 ? 'end' : 'start'} color="var(--viz-3)" weight={700}>
          {`rise ${fx(slope, 2)} per run 1`}
        </Label>
        <Path points={[[x0, y0], [x0, slope]]} color="var(--viz-muted)" width={1.2} dash="3 4" />
        <Dots points={[{ x: x0, y: slope, r: 6, color: 'var(--viz-2)' }]} />
        <Handle
          x={x0}
          y={y0}
          color="var(--viz-1)"
          label="drag"
          ariaLabel="point on the curve: drag along x"
          constrain={(nx) => {
            const s = Math.max(0.25, Math.min(4.8, Math.round(nx * 20) / 20))
            return [s, Math.log(s)]
          }}
          onChange={(nx) => setX0(nx)}
        />
      </Plot>
      <Readout
        items={[
          ['x', fx(x0, 2)],
          ['ln x', fx(y0, 3)],
          ['slope', fx(slope, 3)],
          ['x × slope', fx(x0 * slope, 3)],
        ]}
      />
    </>
  )
}
