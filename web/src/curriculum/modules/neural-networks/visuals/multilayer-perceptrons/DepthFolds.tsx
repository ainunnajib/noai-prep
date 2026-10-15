import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, FnPath, NeuralNet, M } from '../../../../../kit'

/*
  Depth multiplies, width adds. Each hidden layer has just two ReLU neurons, a = ReLU(t) and
  b = ReLU(t − 0.5), and the next layer reads t' = 2a − 4b: the "tent" that folds [0, 1] in half.
  After k layers the output has 2^k straight pieces from only 2k neurons, whereas one hidden layer
  of n ReLU neurons can make at most n + 1 pieces (so it would need at least 2^k − 1 neurons).
*/

const relu = (v: number) => (v > 0 ? v : 0)
const tent = (t: number) => 2 * relu(t) - 4 * relu(t - 0.5)
const deep = (x: number, k: number) => {
  let t = x
  for (let i = 0; i < k; i++) t = tent(t)
  return t
}
const fmt = (v: number) => v.toLocaleString('en-GB')

export default function DepthFolds() {
  const [k, setK] = useState(3)
  const [showPrev, setShowPrev] = useState(true)
  const pieces = 2 ** k
  // the zig-zag gets dense quickly: thin the line and drop the dashed overlay when there are many pieces
  const lineW = Math.max(0.9, 2.4 - 0.25 * k)
  const prevOn = showPrev && k > 1 && k <= 4
  const need = pieces - 1
  return (
    <Figure
      title="Depth multiplies, width only adds"
      caption={
        <>
          Each hidden layer has just <b>two</b> ReLU neurons, which together compute the tent <M>{'t \\mapsto 2\\,\\text{ReLU}(t) - 4\\,\\text{ReLU}(t - 0.5)'}</M>{' '}
          and fold the interval from 0 to 1 in half. Add layers: each one <b>doubles</b> the straight pieces (dashed: the previous layer), while one wide hidden layer
          would need a neuron for every extra piece.
        </>
      }
    >
      <NeuralNet layers={[1, ...Array.from({ length: k }, () => 2), 1]} height={150} width={520} ariaLabel={`A thin network: 1 input, ${k} hidden layers of 2 neurons, 1 output`} />
      <Plot x={[0, 1]} y={[-0.05, 1.12]} width={520} height={250} minHeight={190} margin={{ left: 36, bottom: 32, top: 12, right: 14 }} ariaLabel={`Output of the thin network: a zig-zag with ${pieces} straight pieces`}>
        <Grid xTicks={5} yTicks={4} />
        <Axes xLabel="input x" yLabel="output" xTicks={5} yTicks={4} />
        {prevOn && <FnPath f={(x) => deep(x, k - 1)} color="var(--viz-muted)" width={1.6} dash="5 4" samples={1024} />}
        <FnPath f={(x) => deep(x, k)} color="var(--viz-1)" width={lineW} samples={2048} />
      </Plot>
      <Controls>
        <Slider label="hidden layers (2 neurons each)" value={k} min={1} max={7} step={1} onChange={setK} />
        <Toggle label={k > 4 ? 'show the previous layer (up to 4 layers)' : 'show the previous layer'} checked={showPrev} onChange={setShowPrev} />
        <Readout
          items={[
            ['neurons used', String(2 * k)],
            ['straight pieces', fmt(pieces)],
            ['one hidden layer would need', `≥ ${fmt(need)} ${need === 1 ? 'neuron' : 'neurons'}`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
