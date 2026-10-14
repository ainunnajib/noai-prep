import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button, MatrixGrid, MBlock, M, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import s from './playground.module.css'

/*
  A 2-3-1 network you can compute by hand. Step through it neuron by neuron, then see the same
  hidden-layer computation written as one matrix multiplication. Tap any weight or bias to change it.
*/

type Act = 'relu' | 'sigmoid'
const X0 = [2, 1]
const W1_0 = [
  [1, -1],
  [-2, 1],
  [1, 2],
]
const B1_0 = [0, 1, -1]
const W2_0 = [[2, -1, 1]]
const B2_0 = [-1]

const cycle = (v: number) => (v >= 2 ? -2 : v + 1)
const minus = (v: number) => String(v).replace('-', '−')
const f = (act: Act, z: number) => (act === 'relu' ? Math.max(0, z) : 1 / (1 + Math.exp(-z)))
/** number → TeX, with a real minus sign and brackets around negatives when multiplied */
const n = (v: number, d = 3) => {
  const r = Math.round(v * 10 ** d) / 10 ** d
  return String(Object.is(r, -0) ? 0 : r)
}
const par = (v: number, d = 3) => (v < 0 ? `(${n(v, d)})` : n(v, d))

const STEP_LABELS = ['the inputs', 'hidden neuron 1', 'hidden neuron 2', 'hidden neuron 3', 'the whole layer at once', 'the output neuron', 'done']

function Diagram({ x, W1, W2, z1, a1, y, step, act }: { x: number[]; W1: number[][]; W2: number[][]; z1: number[]; a1: number[]; y: number; step: number; act: Act }) {
  const [ref, width] = useContainerWidth<HTMLDivElement>(460)
  const W = Math.max(280, Math.min(520, width))
  const H = 230
  const colX = [44, W / 2, W - 44]
  const rowY = (k: number, cnt: number) => H / 2 - 12 + (k - (cnt - 1) / 2) * 72
  const nodeR = 25
  const shown = (layer: number, j: number) => (layer === 0 ? true : layer === 1 ? step >= j + 1 : step >= 5)
  const edgeActive = (layer: number, j: number) => (layer === 0 ? step === j + 1 || step === 4 : step === 5)
  const wMax = Math.max(1, ...W1.flat().map(Math.abs), ...W2.flat().map(Math.abs))
  const dec = act === 'relu' ? 2 : 3

  const edges: JSX.Element[] = []
  const labels: JSX.Element[] = []
  // input → hidden (W1[j][i] is the weight from input i to hidden neuron j)
  for (let j = 0; j < 3; j++)
    for (let i = 0; i < 2; i++) {
      const w = W1[j][i]
      const on = edgeActive(0, j)
      const x1 = colX[0] + nodeR
      const y1 = rowY(i, 2)
      const x2 = colX[1] - nodeR
      const y2 = rowY(j, 3)
      edges.push(
        <line key={`a${i}${j}`} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: w >= 0 ? 'var(--viz-2)' : 'var(--viz-1)', strokeWidth: 1 + (2.6 * Math.abs(w)) / wMax, opacity: on ? 0.95 : 0.18 }} />,
      )
      if (on && step !== 4) {
        const t = 0.62
        labels.push(
          <text key={`la${i}${j}`} x={x1 + t * (x2 - x1)} y={y1 + t * (y2 - y1) - 6} textAnchor="middle" className="plot-label" style={{ fill: w >= 0 ? 'var(--viz-2)' : 'var(--viz-1)', fontSize: 13 }}>
            {`w = ${n(w)}`.replace('-', '−')}
          </text>,
        )
      }
    }
  // hidden → output
  for (let j = 0; j < 3; j++) {
    const w = W2[0][j]
    const on = edgeActive(1, 0)
    const x1 = colX[1] + nodeR
    const y1 = rowY(j, 3)
    const x2 = colX[2] - nodeR
    const y2 = rowY(0, 1)
    edges.push(<line key={`b${j}`} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: w >= 0 ? 'var(--viz-2)' : 'var(--viz-1)', strokeWidth: 1 + (2.6 * Math.abs(w)) / wMax, opacity: on ? 0.95 : 0.18 }} />)
    if (on) {
      const t = 0.45
      labels.push(
        <text key={`lb${j}`} x={x1 + t * (x2 - x1)} y={y1 + t * (y2 - y1) - 6} textAnchor="middle" className="plot-label" style={{ fill: w >= 0 ? 'var(--viz-2)' : 'var(--viz-1)', fontSize: 13 }}>
          {`${n(w)}`.replace('-', '−')}
        </text>,
      )
    }
  }

  const node = (key: string, cx: number, cy: number, focus: boolean, top: string | null, bottom: string | null, off = false) => (
    <g key={key}>
      <circle
        cx={cx}
        cy={cy}
        r={nodeR}
        style={{
          fill: off ? 'var(--surface-2)' : top == null ? 'var(--surface)' : 'color-mix(in srgb, var(--viz-1) 14%, var(--surface))',
          stroke: focus ? 'var(--viz-ink)' : 'var(--viz-muted)',
          strokeWidth: focus ? 3 : 1.5,
        }}
      />
      {top != null && (
        <text x={cx} y={bottom != null ? cy - 3 : cy + 5} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: bottom != null ? 11 : 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {top}
        </text>
      )}
      {bottom != null && (
        <text x={cx} y={cy + 13} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 13, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
          {bottom}
        </text>
      )}
    </g>
  )

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 560, display: 'block', margin: '0 auto' }} role="img" aria-label={`A 2-3-1 network, currently showing ${STEP_LABELS[step]}`}>
        {edges}
        {[0, 1].map((i) => node(`x${i}`, colX[0], rowY(i, 2), step === 0, `${n(x[i])}`.replace('-', '−'), null))}
        {[0, 1, 2].map((j) =>
          shown(1, j)
            ? node(`h${j}`, colX[1], rowY(j, 3), step === j + 1 || step === 4, `z ${n(z1[j], 2)}`.replace('-', '−'), n(a1[j], dec).replace('-', '−'), act === 'relu' && a1[j] === 0)
            : node(`h${j}`, colX[1], rowY(j, 3), false, null, null),
        )}
        {shown(2, 0) ? node('y', colX[2], rowY(0, 1), step >= 5, `${n(y, dec)}`.replace('-', '−'), null) : node('y', colX[2], rowY(0, 1), false, null, null)}
        {labels}
        {['x', act === 'relu' ? 'h = ReLU(z)' : 'h = σ(z)', 'ŷ'].map((t, l) => (
          <text key={t} x={colX[l]} y={H - 6} textAnchor="middle" className="nnet-layer-label">
            {t}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function ForwardPassStepper() {
  const [x, setX] = useState<number[]>(X0)
  const [W1, setW1] = useState<number[][]>(W1_0)
  const [b1, setB1] = useState<number[]>(B1_0)
  const [W2, setW2] = useState<number[][]>(W2_0)
  const [b2, setB2] = useState<number[]>(B2_0)
  const [act, setAct] = useState<Act>('relu')
  const player = usePlayer({ steps: 7, interval: 1800 })
  const step = player.step

  const z1 = W1.map((row, j) => row[0] * x[0] + row[1] * x[1] + b1[j])
  const a1 = z1.map((z) => f(act, z))
  const y = W2[0][0] * a1[0] + W2[0][1] * a1[1] + W2[0][2] * a1[2] + b2[0]
  const dec = act === 'relu' ? 2 : 3
  const actTex = act === 'relu' ? '\\text{ReLU}' : '\\sigma'
  const eqs = act === 'relu' ? '=' : '\\approx'

  let eq = ''
  let words = ''
  if (step === 0) {
    eq = `\\mathbf{x} = \\begin{bmatrix} ${n(x[0])} \\\\ ${n(x[1])} \\end{bmatrix}`
    words = 'The input layer does no computing: it just holds the two feature values.'
  } else if (step <= 3) {
    const j = step - 1
    eq = `z_${j + 1} = ${par(W1[j][0])}\\cdot ${par(x[0])} + ${par(W1[j][1])}\\cdot ${par(x[1])} + ${par(b1[j])} = ${n(z1[j], 2)}, \\quad h_${j + 1} = ${actTex}(${n(z1[j], 2)}) ${eqs} ${n(a1[j], dec)}`
    words =
      act === 'relu' && z1[j] <= 0
        ? `Row ${j + 1} of W⁽¹⁾ times the inputs, plus bias ${j + 1}. The sum is not positive, so ReLU outputs 0: this neuron is switched off for this input.`
        : `Row ${j + 1} of W⁽¹⁾ times the inputs, plus bias ${j + 1}: multiply, add, then squash with the activation.`
  } else if (step === 4) {
    const M3 = (m: number[][]) => `\\begin{bmatrix} ${m.map((r) => r.map((v) => n(v)).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`
    const V = (v: number[], d = 3) => `\\begin{bmatrix} ${v.map((u) => n(u, d)).join(' \\\\ ')} \\end{bmatrix}`
    eq = `\\underbrace{${M3(W1)}}_{W^{(1)}:\\;3\\times 2}${V(x)} + ${V(b1)} = ${V(z1, 2)} \\;\\xrightarrow{\\;${actTex}\\;}\\; ${V(a1, dec)}`
    words = 'All three hidden neurons at once: one matrix–vector product. W⁽¹⁾ has one row per hidden neuron and one column per input.'
  } else if (step === 5) {
    eq = `\\hat y = ${par(W2[0][0])}\\cdot ${par(a1[0], dec)} + ${par(W2[0][1])}\\cdot ${par(a1[1], dec)} + ${par(W2[0][2])}\\cdot ${par(a1[2], dec)} + ${par(b2[0])} ${eqs} ${n(y, dec)}`
    words = 'The output neuron repeats the recipe on the hidden values. Here it has no activation, so ŷ is the raw score (the next lesson chooses the output activation).'
  } else {
    eq = `\\hat y = W^{(2)}\\, ${actTex}\\!\\left(W^{(1)}\\mathbf{x} + \\mathbf{b}^{(1)}\\right) + b^{(2)} ${eqs} ${n(y, dec)}`
    words = 'That is the whole forward pass: multiply, add, squash, then multiply and add again.'
  }

  const reset = () => {
    setX(X0)
    setW1(W1_0)
    setB1(B1_0)
    setW2(W2_0)
    setB2(B2_0)
  }
  const hlRow = step >= 1 && step <= 3 ? [step - 1] : []

  return (
    <Figure
      title="Step through a forward pass"
      caption={
        <>
          Press <b>Next</b> to compute one neuron at a time. Each hidden neuron takes one row of <M>{'W^{(1)}'}</M>, multiplies it with the inputs, adds its bias and applies the
          activation. Tap any number in a matrix to change it (it cycles −2 → 2), move the sliders to change the inputs, or switch ReLU to sigmoid. Notice that a ReLU neuron
          whose sum is negative outputs exactly 0, so its outgoing weight has no effect on <M>{'\\hat y'}</M> for that input.
        </>
      }
    >
      <Diagram x={x} W1={W1} W2={W2} z1={z1} a1={a1} y={y} step={step} act={act} />
      <PlayerControls player={player} label={(k) => `Step ${k + 1} of 7: ${STEP_LABELS[k]}`} />
      <div style={{ width: '100%', minHeight: '5.5em' }}>
        <MBlock>{eq}</MBlock>
        <div className={s.note} style={{ textAlign: 'center' }}>
          {words}
        </div>
      </div>
      <div className={s.row} style={{ justifyContent: 'center' }}>
        <MatrixGrid data={W1} rows={hlRow} label={<M>{'W^{(1)}\\ (3\\times 2)'}</M>} cellSize={34} format={minus} onCellClick={(i, j) => setW1((m) => m.map((r, a) => r.map((v, b) => (a === i && b === j ? cycle(v) : v))))} ariaLabel="Weights of layer 1" />
        <MatrixGrid data={b1.map((v) => [v])} rows={hlRow} label={<M>{'\\mathbf{b}^{(1)}'}</M>} cellSize={34} format={minus} onCellClick={(i) => setB1((v) => v.map((u, a) => (a === i ? cycle(u) : u)))} ariaLabel="Biases of layer 1" />
        <MatrixGrid data={W2} rows={step === 5 ? [0] : []} label={<M>{'W^{(2)}\\ (1\\times 3)'}</M>} cellSize={34} format={minus} onCellClick={(i, j) => setW2((m) => m.map((r, a) => r.map((v, b) => (a === i && b === j ? cycle(v) : v))))} ariaLabel="Weights of layer 2" />
        <MatrixGrid data={[b2]} rows={step === 5 ? [0] : []} label={<M>{'b^{(2)}'}</M>} cellSize={34} format={minus} onCellClick={() => setB2((v) => [cycle(v[0])])} ariaLabel="Bias of the output neuron" />
      </div>
      <Controls>
        <Slider label={<M>{'x_1'}</M>} value={x[0]} min={-3} max={3} step={1} onChange={(v) => setX([v, x[1]])} />
        <Slider label={<M>{'x_2'}</M>} value={x[1]} min={-3} max={3} step={1} onChange={(v) => setX([x[0], v])} />
        <Segmented
          label="hidden activation"
          value={act}
          onChange={setAct}
          options={[
            { value: 'relu', label: 'ReLU' },
            { value: 'sigmoid', label: 'sigmoid' },
          ]}
        />
        <Button onClick={reset}>Reset numbers</Button>
      </Controls>
    </Figure>
  )
}
