import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Grid, Axes, FnPath, Path, Dots, Label, DraggablePoint, usePlot, M } from '../../../../../kit'

/*
  |x|, ReLU, a step and the sigmoid on shared axes. Each straight piece has its own colour and
  every corner or jump is circled. Drag the point along the chosen graph: the tangent line follows
  it, splits into two different slopes at a corner, and cannot be drawn at all at a jump.
  The lower strip plots the slope itself, so the sudden change is visible as a gap.
*/

type Key = 'abs' | 'relu' | 'step' | 'sigmoid'
const sig = (x: number) => 1 / (1 + Math.exp(-x))

interface Def {
  label: string
  tex: string
  f: (x: number) => number
  /** slope just left / right of x */
  slope: (x: number) => number
  special: 'corner' | 'jump' | null
  left?: (x: number) => number
  right?: (x: number) => number
  leftSlope?: number
  rightSlope?: number
  piecesTex?: string
}

const DEFS: Record<Key, Def> = {
  abs: {
    label: '|x|',
    tex: '\\lvert x \\rvert',
    f: Math.abs,
    slope: (x) => (x < 0 ? -1 : 1),
    special: 'corner',
    left: (x) => -x,
    right: (x) => x,
    leftSlope: -1,
    rightSlope: 1,
    piecesTex: '\\lvert x \\rvert = \\begin{cases} -x & x < 0 \\\\ x & x \\ge 0 \\end{cases}',
  },
  relu: {
    label: 'ReLU',
    tex: '\\max(0, x)',
    f: (x) => Math.max(0, x),
    slope: (x) => (x < 0 ? 0 : 1),
    special: 'corner',
    left: () => 0,
    right: (x) => x,
    leftSlope: 0,
    rightSlope: 1,
    piecesTex: '\\operatorname{ReLU}(x) = \\max(0, x) = \\begin{cases} 0 & x < 0 \\\\ x & x \\ge 0 \\end{cases}',
  },
  step: {
    label: 'step',
    tex: '\\operatorname{step}(x)',
    f: (x) => (x >= 0 ? 1 : 0),
    slope: () => 0,
    special: 'jump',
    left: () => 0,
    right: () => 1,
    leftSlope: 0,
    rightSlope: 0,
    piecesTex: '\\operatorname{step}(x) = \\begin{cases} 0 & x < 0 \\\\ 1 & x \\ge 0 \\end{cases}',
  },
  sigmoid: {
    label: 'sigmoid',
    tex: '\\sigma(x)',
    f: sig,
    slope: (x) => sig(x) * (1 - sig(x)),
    special: null,
    piecesTex: '\\sigma(x) = \\dfrac{1}{1 + e^{-x}} \\quad \\text{(one smooth piece)}',
  },
}
const ORDER: Key[] = ['abs', 'relu', 'step', 'sigmoid']
const XR: [number, number] = [-3.5, 3.5]
const fx = (v: number) => {
  const r = Math.round(v * 100) / 100
  return String(Object.is(r, -0) ? 0 : r)
}

/** A dashed ring around a corner or a jump, drawn in pixels so it stays round. */
function Ring({ x, y0, y1 }: { x: number; y0: number; y1: number }) {
  const { xs, ys } = usePlot()
  const cy = (ys(y0) + ys(y1)) / 2
  const ry = Math.abs(ys(y1) - ys(y0)) / 2 + 16
  return <ellipse cx={xs(x)} cy={cy} rx={16} ry={ry} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2, strokeDasharray: '5 4' }} />
}

export default function PiecewiseGallery() {
  const [key, setKey] = useState<Key>('relu')
  const [x0, setX0] = useState(1.5)
  const d = DEFS[key]
  const atSpecial = d.special !== null && x0 === 0
  const y0 = d.f(x0)
  const s = d.slope(x0)
  const T = 1.1 // half-length of the tangent, in x units
  const slopeY: [number, number] = key === 'sigmoid' ? [-0.1, 0.35] : [-1.5, 1.5]

  const snapX = (x: number) => {
    const v = Math.round(x * 10) / 10
    return Math.abs(v) < 0.12 ? 0 : Math.max(-3.2, Math.min(3.2, v))
  }

  let status: React.ReactNode
  if (d.special === 'corner' && atSpecial)
    status = (
      <>
        Corner: the slope is <b>{d.leftSlope}</b> just to the left and <b>{d.rightSlope}</b> just to the right. Two different slopes meet, so there is no single
        tangent: the function is <b>not differentiable</b> at 0.
      </>
    )
  else if (d.special === 'jump' && atSpecial)
    status = (
      <>
        Jump: the graph itself breaks here (from 0 straight up to 1), so no tangent can be drawn at all. It is not even <b>continuous</b> at 0.
      </>
    )
  else
    status = (
      <>
        One clear tangent with slope <b>{fx(s)}</b>.{' '}
        {d.special ? 'Drag the point onto the circled spot (or press the button) to see what goes wrong there.' : 'No corners or jumps anywhere: the slope changes smoothly.'}
      </>
    )

  return (
    <Figure
      title="Corners and jumps"
      caption={
        <>
          Pick a function, then drag the round handle along the graph (or use the arrow keys). The dashed line with a soft band around it is the tangent; on a
          straight piece it lies right along the graph. At the circled corner of <M>{'\\lvert x \\rvert'}</M> and ReLU it splits into two candidates with
          different slopes; at the step's jump it cannot be drawn. The lower strip graphs the slope itself: a gap there means the slope changes suddenly. For the
          sigmoid the strip is zoomed in, so you can see its slope peak at 0.25.
        </>
      }
    >
      <Segmented label="Function" value={key} onChange={(k) => setKey(k)} options={ORDER.map((k) => ({ value: k, label: DEFS[k].label }))} />
      <div style={{ fontSize: '1.02rem', maxWidth: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
        <M>{d.piecesTex!}</M>
      </div>
      <Plot x={XR} y={[-1.4, 3.4]} width={480} height={300} minHeight={240} ariaLabel={`Graph of ${d.label} with a draggable point at x = ${fx(x0)}`}>
        <Grid xTicks={7} yTicks={5} />
        <Axes origin xLabel="x" yLabel="y" xTicks={7} yTicks={5} />
        {ORDER.filter((k) => k !== key).map((k) => (
          <FnPath key={k} f={DEFS[k].f} color="var(--viz-muted)" width={1.5} opacity={0.45} samples={300} />
        ))}
        {/* a soft band under the tangent so it stays visible where it lies along a straight piece */}
        {!atSpecial && <Path points={[[x0 - T, y0 - T * s], [x0 + T, y0 + T * s]]} color="var(--viz-4)" width={10} opacity={0.28} />}
        {d.left && d.right ? (
          <>
            <FnPath f={d.left} domain={[XR[0], 0]} color="var(--viz-2)" width={3.5} />
            <FnPath f={d.right} domain={[0, XR[1]]} color="var(--viz-1)" width={3.5} />
          </>
        ) : (
          <FnPath f={d.f} color="var(--viz-3)" width={3.5} samples={300} />
        )}
        {d.special === 'jump' && <Dots points={[{ x: 0, y: 0, hollow: true, color: 'var(--viz-2)', r: 5 }, { x: 0, y: 1, color: 'var(--viz-1)', r: 5 }]} />}
        {d.special === 'corner' && <Ring x={0} y0={0} y1={0} />}
        {d.special === 'jump' && <Ring x={0} y0={0} y1={1} />}

        {/* tangent(s) */}
        {!atSpecial && <Path points={[[x0 - T, y0 - T * s], [x0 + T, y0 + T * s]]} color="var(--viz-4)" width={2.5} dash="7 5" />}
        {atSpecial && d.special === 'corner' && (
          <>
            <Path points={[[-T, -T * d.leftSlope!], [T, T * d.leftSlope!]]} color="var(--viz-2)" width={2.2} dash="6 5" />
            <Path points={[[-T, -T * d.rightSlope!], [T, T * d.rightSlope!]]} color="var(--viz-1)" width={2.2} dash="6 5" />
            <Label x={-T} y={-T * d.leftSlope!} dx={-4} dy={-8} anchor="end" color="var(--viz-2)">
              {`slope ${d.leftSlope}?`}
            </Label>
            <Label x={T} y={T * d.rightSlope!} dx={4} dy={-6} color="var(--viz-1)">
              {`slope ${d.rightSlope}?`}
            </Label>
          </>
        )}
        {atSpecial && d.special === 'jump' && (
          <Label x={0} y={0.5} dx={22} dy={4} color="var(--viz-neg)">
            no tangent
          </Label>
        )}
        <DraggablePoint
          x={x0}
          y={y0}
          r={7}
          color="var(--viz-5)"
          constrain={(x) => {
            const v = snapX(x)
            return [v, d.f(v)]
          }}
          onChange={(x) => setX0(snapX(x))}
        />
      </Plot>

      <div style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: 2 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>the slope of the tangent at each x</div>
        <Plot x={XR} y={slopeY} width={480} height={130} minHeight={120} margin={{ top: 10, bottom: 26 }} ariaLabel={`Slope of ${d.label} plotted against x`}>
          <Grid xTicks={7} yTicks={key === 'sigmoid' ? 3 : 4} />
          <Axes origin xTicks={7} yTicks={key === 'sigmoid' ? 3 : 4} />
          {d.special ? (
            <>
              <Path points={[[XR[0], d.leftSlope!], [-0.06, d.leftSlope!]]} color="var(--viz-2)" width={3} />
              <Path points={[[0.06, d.rightSlope!], [XR[1], d.rightSlope!]]} color="var(--viz-1)" width={3} />
              <Dots
                points={[
                  { x: 0, y: d.leftSlope!, hollow: true, color: 'var(--viz-2)', r: 4.5 },
                  { x: 0, y: d.rightSlope!, hollow: true, color: 'var(--viz-1)', r: 4.5 },
                ]}
              />
            </>
          ) : (
            <>
              <FnPath f={d.slope} color="var(--viz-3)" width={3} />
              <Label x={0} y={0.25} dx={8} dy={-7} color="var(--viz-3)" size={12}>
                max slope 0.25 at x = 0
              </Label>
            </>
          )}
          {atSpecial ? (
            <Path points={[[0, d.leftSlope!], [0, d.rightSlope!]]} color="var(--viz-neg)" width={2} dash="3 3" />
          ) : (
            <Dots points={[{ x: x0, y: s, color: 'var(--viz-4)', r: 5.5 }]} />
          )}
          {atSpecial && (
            <Label x={0} y={Math.max(d.leftSlope!, d.rightSlope!)} dx={10} dy={-4} color="var(--viz-neg)">
              {d.special === 'jump' ? 'undefined at 0' : 'slope jumps here'}
            </Label>
          )}
        </Plot>
      </div>

      <Controls>
        <Readout
          items={[
            ['x', fx(x0)],
            [<M key="f">{`${d.tex}`}</M>, fx(y0)],
            ['slope', atSpecial ? (d.special === 'jump' ? 'none' : `${d.leftSlope} or ${d.rightSlope}?`) : fx(s)],
          ]}
        />
        {d.special && (
          <Button onClick={() => setX0(0)} disabled={x0 === 0}>
            Go to the circled spot
          </Button>
        )}
      </Controls>
      <div style={{ width: '100%', fontSize: '0.92rem', color: atSpecial ? 'var(--ink)' : 'var(--ink-2)', lineHeight: 1.5 }} aria-live="polite">
        {status}
      </div>
    </Figure>
  )
}
