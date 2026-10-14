import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Grid, Axes, FnPath, Path, Label, DraggablePoint, MBlock, useNarrow } from '../../../../../kit'
import { HeatMap, ContourLines, Clipped, num, par, type Fn2 } from './fieldKit'

/*
  A partial derivative is an ordinary derivative on a 1-D slice.
  Left: f(x, y) seen from above as a heat map. The learner drags a point P; a line through P
  freezes one input (horizontal line: y frozen; vertical line: x frozen).
  Right: the graph along that line, a normal 1-D curve, with its tangent at P.
  The tangent's slope is the partial derivative, shown next to the formula.
*/

type Key = 'poly' | 'hill'
type Mode = 'x' | 'y'

interface Fn {
  label: string
  tex: string
  f: Fn2
  fx: Fn2
  fy: Fn2
  fxTex: (x: number, y: number) => string
  fyTex: (x: number, y: number) => string
  range: [number, number]
  levels: number[]
  sliceY: [number, number]
  start: [number, number]
}

const FNS: Record<Key, Fn> = {
  poly: {
    label: 'x²y + 3y',
    tex: 'f(x, y) = x^2 y + 3y',
    f: (x, y) => x * x * y + 3 * y,
    fx: (x, y) => 2 * x * y,
    fy: (x) => x * x + 3,
    fxTex: (x, y) => `2xy = 2 \\times ${par(x)} \\times ${par(y)}`,
    fyTex: (x) => `x^2 + 3 = ${par(x)}^2 + 3`,
    range: [-14, 14],
    levels: [-12, -9, -6, -3, 0, 3, 6, 9, 12],
    sliceY: [-15, 15],
    start: [1, 2],
  },
  hill: {
    label: '4 − x² − y² + xy',
    tex: 'f(x, y) = 4 - x^2 - y^2 + xy',
    f: (x, y) => 4 - x * x - y * y + x * y,
    fx: (x, y) => -2 * x + y,
    fy: (x, y) => -2 * y + x,
    fxTex: (x, y) => `-2x + y = -2 \\times ${par(x)} + ${par(y)}`,
    fyTex: (x, y) => `-2y + x = -2 \\times ${par(y)} + ${par(x)}`,
    range: [-8, 4],
    levels: [-6, -4, -2, 0, 2, 3.5],
    sliceY: [-9, 5],
    start: [-1, 1],
  },
}

const R = 2 // the map shows −2 ≤ x, y ≤ 2
const snap = (v: number) => Math.max(-R, Math.min(R, Math.round(v * 10) / 10))
const SLICE = 'var(--viz-4)'
const panelTitle: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: '0.15rem' }

export default function SliceExplorer() {
  const [key, setKey] = useState<Key>('poly')
  const [mode, setMode] = useState<Mode>('x')
  const [p, setP] = useState<[number, number]>([1, 2])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const F = FNS[key]
  const [x0, y0] = p

  // the 1-D slice: g(t) = f(t, y0) when y is frozen, or f(x0, t) when x is frozen
  const g = mode === 'x' ? (t: number) => F.f(t, y0) : (t: number) => F.f(x0, t)
  const t0 = mode === 'x' ? x0 : y0
  const slope = mode === 'x' ? F.fx(x0, y0) : F.fy(x0, y0)
  const measured = (g(t0 + 1e-4) - g(t0 - 1e-4)) / 2e-4
  // keep the slope label off the curve and the tangent: below a curve that bends up (on the side where the
  // tangent rises), above a curve that bends down (on the side where the tangent falls)
  const curv = g(t0 + 0.01) - 2 * g(t0) + g(t0 - 0.01)
  let labelRight = curv >= 0 === slope >= 0
  if (labelRight && t0 > 1) labelRight = false
  else if (!labelRight && t0 < -1) labelRight = true
  const span = 0.7
  const frozen = mode === 'x' ? `y = ${num(y0)}` : `x = ${num(x0)}`
  const moving = mode === 'x' ? 'x' : 'y'

  const formula =
    mode === 'x'
      ? `\\frac{\\partial f}{\\partial x} = ${F.fxTex(x0, y0)} = ${num(slope)}`
      : `\\frac{\\partial f}{\\partial y} = ${F.fyTex(x0, y0)} = ${num(slope)}`

  return (
    <Figure
      title="A partial derivative is the slope of a slice"
      caption={
        <>
          Drag the pink point on the map. The pink line through it freezes one input, and the slice graph shows the surface cut along
          that line: an ordinary curve with an ordinary tangent. The tangent&apos;s slope is the partial derivative. Move the point up and down with y
          frozen and watch the slice change shape; then freeze x instead. On <b>x²y + 3y</b>, the slice along y is always a straight line. Why?
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.5rem 1rem', alignItems: 'start' }}
      >
        <div>
          <div style={panelTitle}>
            Map from above: colour = height of <span style={{ whiteSpace: 'nowrap' }}>f(x, y)</span>
          </div>
          <Plot
            x={[-R, R]}
            y={[-R, R]}
            width={320}
            height={320}
            maxWidth={380}
            margin={{ left: 34, bottom: 30, right: 12, top: 12 }}
            ariaLabel={`Heat map of ${F.label} with a point at x = ${num(x0)}, y = ${num(y0)} and a slice line where ${frozen}`}
          >
            <HeatMap f={F.f} fnKey={key} range={F.range} />
            <ContourLines f={F.f} fnKey={key} levels={F.levels} />
            <Axes xLabel="x" yLabel="y" xTicks={4} yTicks={4} />
            <Path points={mode === 'x' ? [[-R, y0], [R, y0]] : [[x0, -R], [x0, R]]} color={SLICE} width={3.5} />
            <Clipped>
              <Label
                x={mode === 'x' ? (x0 > 0 ? -R : R) : x0}
                y={mode === 'x' ? y0 : y0 > 0 ? -R : R}
                dx={mode === 'x' ? (x0 > 0 ? 22 : -6) : x0 > 0.8 ? -8 : 8}
                dy={mode === 'x' ? (y0 > 1.4 ? 17 : -7) : y0 > 0 ? -8 : 16}
                anchor={mode === 'x' ? (x0 > 0 ? 'start' : 'end') : x0 > 0.8 ? 'end' : 'start'}
                color={SLICE}
                weight={700}
              >
                {`${frozen} frozen`}
              </Label>
            </Clipped>
            <DraggablePoint x={x0} y={y0} color={SLICE} constrain={(x, y) => [snap(x), snap(y)]} onChange={(x, y) => setP([x, y])} label="P" />
          </Plot>
        </div>
        <div>
          <div style={panelTitle}>
            The slice: <span style={{ whiteSpace: 'nowrap' }}>f along the line, {frozen}</span>
          </div>
          <Plot
            x={[-R, R]}
            y={F.sliceY}
            width={320}
            height={320}
            maxWidth={380}
            minHeight={240}
            margin={{ left: 40, bottom: 30, right: 12, top: 12 }}
            ariaLabel={`Graph of the slice with ${frozen}: a curve in ${moving}, tangent slope ${num(slope)} at ${moving} = ${num(t0)}`}
          >
            <Grid xTicks={4} yTicks={6} />
            <Axes origin xLabel={moving} yLabel="f" xTicks={4} yTicks={6} />
            <FnPath f={g} color={SLICE} width={3} />
            <Path
              points={[
                [t0 - span, g(t0) - span * slope],
                [t0 + span, g(t0) + span * slope],
              ]}
              color="var(--viz-ink)"
              width={2}
              dash="6 4"
            />
            <Clipped>
              <Label x={t0} y={g(t0)} dx={labelRight ? 12 : -12} dy={curv >= 0 ? 28 : -16} anchor={labelRight ? 'start' : 'end'} color="var(--viz-ink)" weight={700}>
                {`slope ${num(slope)}`}
              </Label>
            </Clipped>
            <DraggablePoint
              x={t0}
              y={g(t0)}
              color={SLICE}
              r={8}
              constrain={(t) => [snap(t), g(snap(t))]}
              onChange={(t) => setP(mode === 'x' ? [snap(t), y0] : [x0, snap(t)])}
            />
          </Plot>
        </div>
      </div>
      <MBlock>{formula}</MBlock>
      <Controls>
        <Segmented
          label="Freeze"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'x', label: 'y (slice along x)' },
            { value: 'y', label: 'x (slice along y)' },
          ]}
        />
        <Segmented
          label="Function"
          value={key}
          onChange={(k) => {
            setKey(k)
            setP(FNS[k].start)
          }}
          options={(Object.keys(FNS) as Key[]).map((k) => ({ value: k, label: FNS[k].label }))}
        />
      </Controls>
      <Readout
        items={[
          ['P', `(${num(x0)}, ${num(y0)})`],
          ['f(P)', num(F.f(x0, y0))],
          ['tangent slope measured on the slice', num(measured, 3)],
        ]}
      />
    </Figure>
  )
}
