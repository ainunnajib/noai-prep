import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Grid, Axes, FnPath, Path, Dots, Label, Rect, HLine, VLine, Bars } from '../../../../../kit'
import { Handle, TangentSeg, fx, panelTitle } from '../derivatives-as-slopes/plotHelpers'

/*
  Activation functions and their slopes on a shared x-axis. Saturation zones (slope below 0.01,
  or exactly 0 for ReLU) are shaded. For the sigmoid, bars show σ, 1 − σ and their product,
  which is the slope: the product of two numbers adding to 1 can never exceed 0.5 × 0.5 = 0.25.
  For tanh, bars show tanh² and 1 − tanh² (both between 0 and 1, so no negative bar is needed).
*/

type Act = 'sigmoid' | 'tanh' | 'relu'
const sig = (x: number) => 1 / (1 + Math.exp(-x))

const DEFS: Record<Act, { f: (x: number) => number; d: (x: number) => number; y: [number, number]; dy: [number, number]; max: number; sat: number; name: string; dname: string }> = {
  sigmoid: { f: sig, d: (x) => sig(x) * (1 - sig(x)), y: [-0.15, 1.15], dy: [-0.03, 0.3], max: 0.25, sat: 4.585, name: 'σ(x)', dname: 'σ′(x) = σ(x)(1 − σ(x))' },
  tanh: { f: Math.tanh, d: (x) => 1 - Math.tanh(x) ** 2, y: [-1.2, 1.2], dy: [-0.1, 1.15], max: 1, sat: 2.993, name: 'tanh(x)', dname: 'tanh′(x) = 1 − tanh²(x)' },
  relu: { f: (x) => Math.max(0, x), d: (x) => (x > 0 ? 1 : 0), y: [-1, 8], dy: [-0.15, 1.25], max: 1, sat: 0, name: 'ReLU(x) = max(0, x)', dname: 'ReLU′(x): 0 or 1' },
}
const X: [number, number] = [-8, 8]

export default function ActivationSlopes() {
  const [act, setAct] = useState<Act>('sigmoid')
  const [x, setX] = useState(2)
  const D = DEFS[act]
  const y = D.f(x)
  const kink = act === 'relu' && Math.abs(x) < 1e-9
  const dv = D.d(x)
  const saturated = act === 'relu' ? x < 0 : Math.abs(x) > D.sat
  const tone = saturated || kink ? 'var(--viz-neg)' : 'var(--viz-3)'

  const satZones: [number, number][] = act === 'relu' ? [[X[0], 0]] : [[X[0], -D.sat], [D.sat, X[1]]]
  const shade = 'color-mix(in srgb, var(--viz-neg) 11%, transparent)'

  const bars =
    act === 'sigmoid'
      ? [
          { label: 'σ(x)', value: y, color: 'var(--viz-1)' },
          { label: '1 − σ(x)', value: 1 - y, color: 'var(--viz-5)' },
          { label: 'slope σ(1 − σ)', value: dv, color: tone, strong: true },
        ]
      : act === 'tanh'
        ? [
            { label: 'tanh²(x)', value: y * y, color: 'var(--viz-5)' },
            { label: 'slope 1 − tanh²', value: dv, color: tone, strong: true },
          ]
        : null

  return (
    <Figure
      title="How steep are the activation functions?"
      caption={
        <>
          Drag the point along the top curve and read its slope underneath. Red zones are where the slope is below 0.01 (for ReLU: exactly 0), so
          almost no learning signal gets through. For the sigmoid the slope is σ × (1 − σ): two numbers that add up to 1, so their product peaks at
          0.5 × 0.5 = 0.25 when <i>x</i> = 0. Compare tanh (peak slope 1) and ReLU (slope 1 for every positive input, but a kink at 0).
        </>
      }
    >
      <Controls>
        <Segmented
          label="Activation"
          value={act}
          onChange={(a) => {
            setAct(a)
          }}
          options={[
            { value: 'sigmoid', label: 'sigmoid' },
            { value: 'tanh', label: 'tanh' },
            { value: 'relu', label: 'ReLU' },
          ]}
        />
      </Controls>
      <div style={{ width: '100%' }}>
        <div style={panelTitle}>{D.name}</div>
        <Plot x={X} y={D.y} width={560} height={230} minHeight={200} maxWidth={700} margin={{ left: 44 }} ariaLabel={`Graph of ${D.name} with a point at x = ${fx(x, 1)}`}>
          {satZones.map(([a, b]) => (
            <Rect key={a} x0={a} x1={b} y0={D.y[0]} y1={D.y[1]} fill={shade} />
          ))}
          <Grid xTicks={8} yTicks={4} />
          <Axes origin xTicks={8} yTicks={4} xLabel="x" />
          <FnPath f={D.f} color="var(--viz-1)" width={3} samples={480} />
          {!kink && <TangentSeg x={x} y={y} slope={dv} len={46} color={tone} width={3} />}
          {kink && (
            <>
              <TangentSeg x={0} y={0} slope={0} len={40} color="var(--viz-neg)" width={2} dash="4 3" />
              <TangentSeg x={0} y={0} slope={1} len={40} color="var(--viz-neg)" width={2} dash="4 3" />
            </>
          )}
          <VLine x={x} color="var(--viz-muted)" dash="2 4" width={1.2} />
          <Handle
            x={x}
            y={y}
            color="var(--viz-2)"
            label="drag"
            ariaLabel="input x: drag along the curve"
            constrain={(nx) => {
              // snap to 0.1, and onto the kink at 0 when close (so keyboard users can reach it)
              const s = Math.abs(nx) < 0.2 ? 0 : Math.round(nx * 10) / 10
              return [s, D.f(s)]
            }}
            onChange={(nx) => setX(nx)}
          />
        </Plot>
      </div>
      <div style={{ width: '100%' }}>
        <div style={panelTitle}>its slope: {D.dname}</div>
        <Plot x={X} y={D.dy} width={560} height={170} minHeight={160} maxWidth={700} margin={{ left: 44 }} ariaLabel={`Slope of ${D.name}: ${kink ? 'undefined at the kink' : fx(dv, 4)}`}>
          {satZones.map(([a, b]) => (
            <Rect key={a} x0={a} x1={b} y0={D.dy[0]} y1={D.dy[1]} fill={shade} />
          ))}
          <Grid xTicks={8} yTicks={3} />
          <Axes origin xTicks={8} yTicks={3} xLabel="x" />
          <HLine y={D.max} color="var(--ink-2)" label={`max slope ${D.max}`} />
          {act === 'relu' ? (
            <>
              <Path points={[[X[0], 0], [0, 0]]} color="var(--viz-5)" width={3} />
              <Path points={[[0, 1], [X[1], 1]]} color="var(--viz-5)" width={3} />
              <Dots
                points={[
                  { x: 0, y: 0, r: 5, color: 'var(--viz-5)', hollow: true },
                  { x: 0, y: 1, r: 5, color: 'var(--viz-5)', hollow: true },
                ]}
              />
            </>
          ) : (
            <FnPath f={D.d} color="var(--viz-5)" width={3} samples={480} />
          )}
          <VLine x={x} color="var(--viz-muted)" dash="2 4" width={1.2} />
          {!kink && <Dots points={[{ x, y: dv, r: 6.5, color: tone }]} />}
          {kink && (
            <Label x={0} y={0.5} dx={8} color="var(--viz-neg)" weight={700}>
              kink: no single slope
            </Label>
          )}
        </Plot>
      </div>
      {bars && <Bars data={bars} max={1} format={(v) => v.toFixed(3)} ariaLabel="The parts of the slope formula" />}
      <Readout
        items={[
          ['x', fx(x, 1)],
          [D.name.split(' =')[0], fx(y, 3)],
          ['slope', kink ? 'undefined (PyTorch uses 0)' : fx(dv, act === 'relu' ? 0 : 4)],
          ['zone', kink ? 'the kink at 0' : saturated ? (act === 'relu' ? 'dead: slope exactly 0' : 'saturated: slope below 0.01') : 'active'],
        ]}
      />
    </Figure>
  )
}
