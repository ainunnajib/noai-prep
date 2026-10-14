import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, NeuralNet, MatrixGrid, mulberry32 } from '../../../../../kit'

/*
  A 2-3-1 network (tanh hidden layer, linear output) learning XOR on inputs ±1 with full-batch
  gradient descent on the mean squared error. Three starting points:
    all weights 0.5  → every hidden neuron gets the same gradient and they stay clones for ever
    all weights 0    → hidden outputs are tanh(0) = 0 and output weights are 0, so no hidden weight moves
    small random     → the neurons differ, specialise, and XOR is learned
*/

type Init = 'equal' | 'zero' | 'random'
const X = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
]
const Y = [0, 1, 1, 0]
const H = 3
const LR = 0.3

interface Net {
  W1: number[][] // H × 2
  b1: number[]
  W2: number[] // H
  b2: number
}

function initNet(kind: Init, seed: number): Net {
  if (kind === 'equal') return { W1: [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5]], b1: [0, 0, 0], W2: [0.5, 0.5, 0.5], b2: 0 }
  if (kind === 'zero') return { W1: [[0, 0], [0, 0], [0, 0]], b1: [0, 0, 0], W2: [0, 0, 0], b2: 0 }
  const r = mulberry32(seed)
  const g = () => {
    const u = Math.max(r(), 1e-12)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
  }
  return { W1: Array.from({ length: H }, () => [0.5 * g(), 0.5 * g()]), b1: [0, 0, 0], W2: Array.from({ length: H }, () => 0.5 * g()), b2: 0 }
}

function forward(n: Net, x: number[]) {
  const h = n.W1.map((w, j) => Math.tanh(w[0] * x[0] + w[1] * x[1] + n.b1[j]))
  return { h, out: h.reduce((s, v, j) => s + v * n.W2[j], n.b2) }
}

function lossOf(n: Net) {
  return X.reduce((s, x, i) => s + (forward(n, x).out - Y[i]) ** 2, 0) / X.length
}

function step(n: Net): Net {
  const gW1 = n.W1.map(() => [0, 0])
  const gb1 = [0, 0, 0]
  const gW2 = [0, 0, 0]
  let gb2 = 0
  X.forEach((x, i) => {
    const { h, out } = forward(n, x)
    const d = (2 * (out - Y[i])) / X.length
    gb2 += d
    for (let j = 0; j < H; j++) {
      gW2[j] += d * h[j]
      const dz = d * n.W2[j] * (1 - h[j] * h[j])
      gW1[j][0] += dz * x[0]
      gW1[j][1] += dz * x[1]
      gb1[j] += dz
    }
  })
  return {
    W1: n.W1.map((w, j) => [w[0] - LR * gW1[j][0], w[1] - LR * gW1[j][1]]),
    b1: n.b1.map((b, j) => b - LR * gb1[j]),
    W2: n.W2.map((w, j) => w - LR * gW2[j]),
    b2: n.b2 - LR * gb2,
  }
}

/** how many genuinely different hidden neurons there are */
function distinct(n: Net) {
  const keys = n.W1.map((w, j) => [w[0], w[1], n.b1[j], n.W2[j]].map((v) => v.toFixed(6)).join('|'))
  return new Set(keys).size
}

export default function SymmetryTrap() {
  const [kind, setKind] = useState<Init>('equal')
  const [seed, setSeed] = useState(4)
  const [steps, setSteps] = useState(0)

  const net = useMemo(() => {
    let n = initNet(kind, seed)
    for (let s = 0; s < steps; s++) n = step(n)
    return n
  }, [kind, seed, steps])

  const weights = [
    [0, 1].map((i) => net.W1.map((w) => w[i])), // input i → hidden j
    net.W2.map((w) => [w]), // hidden j → output
  ]
  const preds = X.map((x) => forward(net, x).out)
  const reset = (k: Init) => {
    setKind(k)
    setSteps(0)
  }

  return (
    <Figure
      title="The symmetry trap"
      caption={
        <>
          A tiny network with 3 hidden neurons is learning XOR (output 1 when exactly one input is +1). Edge thickness shows the size of
          each weight. Start with <b>all weights 0.5</b> and train: the three rows of the weight table stay identical for ever, because
          identical neurons receive identical updates, so the network behaves like one neuron and cannot learn XOR. With <b>all zeros</b>{' '}
          nothing in the hidden layer moves at all. Only <b>small random</b> weights break the symmetry.
        </>
      }
    >
      <Segmented
        label="Initial weights"
        value={kind}
        onChange={reset}
        options={[
          { value: 'equal', label: 'all 0.5' },
          { value: 'zero', label: 'all zeros' },
          { value: 'random', label: 'small random' },
        ]}
      />
      <NeuralNet
        layers={[2, 3, 1]}
        layerLabels={['inputs x₁, x₂', 'hidden (tanh)', 'output']}
        weights={weights}
        width={440}
        height={220}
        ariaLabel={`A 2-3-1 network after ${steps} training steps with ${distinct(net)} distinct hidden neurons`}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', justifyContent: 'center', alignItems: 'flex-start' }}>
        <MatrixGrid
          label="rows = hidden neurons; columns = weight from x₁, from x₂, to output"
          data={net.W1.map((w, j) => [w[0], w[1], net.W2[j]])}
          format={(v) => v.toFixed(2)}
          cellSize={52}
          heat={[-1.2, 1.2]}
          diverging
          ariaLabel="Weights of each hidden neuron"
        />
        <MatrixGrid
          label="predictions for (−1,−1), (−1,1), (1,−1), (1,1); targets 0, 1, 1, 0"
          data={[preds]}
          format={(v) => v.toFixed(2)}
          cellSize={52}
          ariaLabel="Network predictions for the four XOR inputs"
        />
      </div>
      <Controls>
        <Button primary onClick={() => setSteps((s) => s + 10)}>Train 10 steps</Button>
        <Button onClick={() => setSteps((s) => s + 100)}>Train 100 steps</Button>
        <Button onClick={() => setSteps(0)}>Reset</Button>
        {kind === 'random' && (
          <Button onClick={() => { setSeed((s) => s + 1); setSteps(0) }}>New random weights</Button>
        )}
      </Controls>
      <Readout
        items={[
          ['training steps', String(steps)],
          ['loss (MSE)', lossOf(net).toFixed(4)],
          ['different hidden neurons', `${distinct(net)} of ${H}`],
        ]}
      />
    </Figure>
  )
}
