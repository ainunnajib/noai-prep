import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Axes, Path, Dots, Label, VLine } from '../../../../../kit'
import { NeuronDiagram } from './NeuronDiagram'
import { num, paren, signed, step } from './shared'

/*
  The beach decision as one perceptron: three yes/no inputs with fixed weights (+2, −3, +1) and a
  bias the learner slides. Shows the neuron, the weighted sum z and where z lands on the step function.
*/

const NAMES = ['sunny', 'homework due', 'friends going']
const WEIGHTS = [2, -3, 1]

function StepPlot({ z }: { z: number }) {
  const y = step(z)
  const zc = Math.max(-6.5, Math.min(6.5, z))
  return (
    <Plot x={[-7, 7]} y={[-0.35, 1.45]} width={460} height={170} minHeight={150} margin={{ left: 34, bottom: 34, top: 12, right: 14 }} ariaLabel={`Step function: z = ${num(z)} gives output ${y}`}>
      <Axes xLabel="z" yLabel="output" xTicks={7} yTicks={2} origin />
      <Path points={[[-7, 0], [0, 0]]} color="var(--viz-4)" width={3} />
      <Path points={[[0, 1], [7, 1]]} color="var(--viz-4)" width={3} />
      <Path points={[[0, 0], [0, 1]]} color="var(--viz-4)" width={1.2} dash="3 4" />
      {/* z = 0 belongs to the 0 branch: filled dot at (0, 0), open dot at (0, 1) */}
      <Dots points={[{ x: 0, y: 0, r: 4.5, color: 'var(--viz-4)' }, { x: 0, y: 1, r: 4.5, color: 'var(--viz-4)', hollow: true }]} />
      <VLine x={zc} color="var(--viz-ink)" dash="2 4" width={1.2} />
      <Dots points={[{ x: zc, y, r: 8, color: y ? 'var(--viz-2)' : 'var(--viz-1)' }]} />
      <Label x={zc} y={y} dx={zc > 3 ? -12 : 12} dy={y ? 20 : -12} anchor={zc > 3 ? 'end' : 'start'}>
        {`z = ${num(z)} → ${y}`}
      </Label>
    </Plot>
  )
}

export default function WeightedVote() {
  const [x, setX] = useState<number[]>([1, 0, 1])
  const [b, setB] = useState(0)
  const z = WEIGHTS.reduce((s, w, i) => s + w * x[i], 0) + b
  const y = step(z)

  // how many of the 8 possible situations end with a trip to the beach?
  let days = 0
  for (let m = 0; m < 8; m++) {
    const s = WEIGHTS[0] * (m & 1) + WEIGHTS[1] * ((m >> 1) & 1) + WEIGHTS[2] * ((m >> 2) & 1) + b
    if (step(s) === 1) days++
  }

  const sum = `${WEIGHTS.map((w, i) => `${paren(w)}×${x[i]}`).join(' + ')} ${signed(b)} = ${num(z)}`
  const set = (i: number, v: boolean) => setX((old) => old.map((o, j) => (j === i ? (v ? 1 : 0) : o)))

  return (
    <Figure
      title="One neuron deciding: beach or not?"
      caption={
        <>
          Each input is 1 (yes) or 0 (no); the neuron outputs 1 only if <i>z</i> = weighted sum + <i>b</i> is above 0. Switch on sunny and friends, then{' '}
          <b>homework due</b>: the −3 cancels both, and a tie (<i>z</i> = 0) means stay home. Then slide the bias and count how many of the 8 possible days say &ldquo;go&rdquo;.
        </>
      }
    >
      <Controls>
        {NAMES.map((n, i) => (
          <Toggle key={n} label={n} checked={x[i] === 1} onChange={(v) => set(i, v)} />
        ))}
      </Controls>
      <NeuronDiagram
        inputs={NAMES.map((n, i) => ({ label: n, value: x[i] }))}
        weights={WEIGHTS}
        bias={b}
        z={z}
        output={y}
        outputText={y ? 'go to the beach' : 'stay home'}
        ariaLabel={`Neuron with inputs sunny ${x[0]}, homework ${x[1]}, friends ${x[2]}, weights 2, −3, 1 and bias ${num(b)}. Weighted sum ${num(z)}, output ${y}.`}
      />
      <StepPlot z={z} />
      <Controls>
        <Slider label="bias b (your default mood)" value={b} min={-3} max={3} step={0.5} onChange={setB} format={(v) => num(v)} />
      </Controls>
      <Readout
        items={[
          ['z', sum],
          ['decision', y ? '1: go' : '0: stay home'],
          ['beach days', `${days} of 8 situations`],
        ]}
      />
    </Figure>
  )
}
