import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, FnPath, Label, NeuralNet, M } from '../../../../../kit'

/*
  A 1-input network with one hidden layer of three neurons:
    hᵢ = f(x + cᵢ) with c = (1, 0, −1), so the neurons "switch on" around x = −1, 0 and 1,
    y  = v₁h₁ + v₂h₂ + v₃h₃.
  The learner picks the activation f (none, ReLU, tanh) and the output weights v. With no activation
  every term is a straight line, so the sum is too; the readout shows the single equivalent layer.
  The dashed target is the "tent" max(0, 1 − |x|), which ReLU with v = (1, −2, 1) hits exactly.
*/

type Act = 'none' | 'relu' | 'tanh'
const C = [1, 0, -1]
const COLS = ['var(--viz-3)', 'var(--viz-5)', 'var(--viz-6)']
const F: Record<Act, (z: number) => number> = {
  none: (z) => z,
  relu: (z) => Math.max(0, z),
  tanh: (z) => Math.tanh(z),
}
const tent = (x: number) => Math.max(0, 1 - Math.abs(x))
const fmt = (v: number) => {
  const r = Math.round(v * 100) / 100
  return (r === 0 ? 0 : r).toString()
}
const tfmt = (v: number) => fmt(v)
/** "+ 0.5" / "- 0.5" for KaTeX */
const tsigned = (v: number) => (v < 0 ? `- ${fmt(-v)}` : `+ ${fmt(v)}`)

export default function LinearCollapse() {
  const [act, setAct] = useState<Act>('none')
  const [v, setV] = useState<number[]>([1, -2, 1])
  const f = F[act]
  const y = (x: number) => v.reduce((s, vi, i) => s + vi * f(x + C[i]), 0)

  // mean squared mismatch with the tent on a grid over [−3, 3]
  let mse = 0
  const n = 121
  for (let k = 0; k < n; k++) {
    const x = -3 + (6 * k) / (n - 1)
    mse += (y(x) - tent(x)) ** 2
  }
  mse /= n

  const slope = v[0] + v[1] + v[2]
  const icpt = v[0] * C[0] + v[1] * C[1] + v[2] * C[2]
  const set = (i: number) => (val: number) => setV((old) => old.map((o, j) => (j === i ? val : o)))
  const fname = act === 'none' ? '' : act === 'relu' ? '\\text{ReLU}' : '\\tanh'
  const term = (i: number) => {
    const inner = C[i] === 0 ? 'x' : `x ${C[i] > 0 ? '+' : '-'} ${Math.abs(C[i])}`
    return act === 'none' ? `(${inner})` : `${fname}(${inner})`
  }
  const formula = `y = ${tfmt(v[0])}\\,${term(0)} ${tsigned(v[1])}\\,${term(1)} ${tsigned(v[2])}\\,${term(2)}`

  let status: string
  if (act === 'none') status = 'Always a straight line, whatever the weights.'
  else if (mse < 0.002) status = 'Exact match with the target tent.'
  else if (mse < 0.02) status = 'Close to the target.'
  else status = 'Bent, but not the target yet.'

  return (
    <Figure
      title="Stack layers without an activation and they collapse"
      caption={
        <>
          One input <i>x</i>, three hidden neurons and one output. Each hidden neuron computes <M>{'h_i = f(x + c_i)'}</M> with <M>{'c = (1, 0, -1)'}</M>, and the
          output adds them up with the weights <M>{'v_1, v_2, v_3'}</M> (thin coloured curves: each neuron's share <M>{'v_ih_i'}</M>; thick blue: the output). With{' '}
          <b>no activation</b> every share is a straight line, so their sum is a straight line too: move the sliders and it only tilts and shifts. The readout
          shows the single layer it collapses to. Now switch to <b>ReLU</b> without touching the weights: the same three neurons now bend at −1, 0 and 1
          and build the dashed target tent exactly. Then try <b>tanh</b>: smooth bends instead of sharp kinks.
        </>
      }
    >
      <Segmented
        label="Hidden activation f"
        options={[
          { value: 'none', label: 'none' },
          { value: 'relu', label: 'ReLU' },
          { value: 'tanh', label: 'tanh' },
        ]}
        value={act}
        onChange={setAct}
      />
      <Plot x={[-3, 3]} y={[-2.5, 2.5]} width={520} height={300} minHeight={230} ariaLabel={`Network output with ${act} activation and output weights ${v.join(', ')}`}>
        <Grid xTicks={6} yTicks={5} />
        <Axes xLabel="x" yLabel="y" xTicks={6} yTicks={5} origin />
        <FnPath f={tent} color="var(--viz-muted)" width={2.5} dash="7 5" />
        {v.map((vi, i) => (
          <FnPath key={i} f={(x) => vi * f(x + C[i])} color={COLS[i]} width={1.75} dash="2 4" opacity={0.95} />
        ))}
        <FnPath f={y} color="var(--viz-1)" width={3.25} />
        <Label x={2.95} y={-2.3} anchor="end" color="var(--ink-3)" size={12}>
          dashed grey: target tent
        </Label>
      </Plot>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <NeuralNet
          layers={[1, 3, 1]}
          layerLabels={['x', act === 'none' ? 'no activation' : act === 'relu' ? 'ReLU' : 'tanh', 'y']}
          weights={[[[1, 1, 1]], [[v[0]], [v[1]], [v[2]]]]}
          width={360}
          height={150}
          ariaLabel="A 1-3-1 network; edge thickness and colour show the weights"
        />
      </div>
      <div style={{ width: '100%', overflowX: 'auto', textAlign: 'center', fontSize: '0.95rem' }}>
        <M>{formula}</M>
        {act === 'none' && (
          <div style={{ marginTop: '0.35rem' }}>
            <M>{`= ${tfmt(slope)}x ${tsigned(icpt)}`}</M>
            <span style={{ color: 'var(--ink-2)', fontSize: '0.88rem' }}> : one straight line, i.e. a single layer</span>
          </div>
        )}
      </div>
      <Controls>
        {[0, 1, 2].map((i) => (
          <Slider key={i} label={<span style={{ color: COLS[i] }}>{`v${'₁₂₃'[i]} (neuron ${i + 1})`}</span>} value={v[i]} min={-2} max={2} step={0.25} onChange={set(i)} format={fmt} />
        ))}
      </Controls>
      <Controls>
        <Readout items={[['mismatch with the tent (mean squared error)', mse.toFixed(3)]]} />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: act !== 'none' && mse < 0.002 ? 'var(--viz-pos)' : 'var(--ink-2)' }}>{status}</span>
      </Controls>
    </Figure>
  )
}
