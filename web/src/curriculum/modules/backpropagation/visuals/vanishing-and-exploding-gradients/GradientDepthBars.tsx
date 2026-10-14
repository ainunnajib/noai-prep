import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Button, Plot, usePlot, Rect, M, useBump } from '../../../../../kit'
import { makeBaseNet, deepNetGradients, pow10Label, sci, ACT_LABEL, NET_WIDTH, type Act } from './sim'

/*
  A real (small) deep network at initialisation: 32 neurons per layer, a batch of 32 random inputs.
  We run the forward pass, send a gradient of size 1 back from the loss, and plot how big the
  gradient is when it reaches each layer (log scale). Bars start at the "1" line: up = bigger, down = smaller.
*/

const Y_MIN = -16
const Y_MAX = 8

function verdict(r: number): [string, string] {
  if (r < 1e-2) return ['vanishing', 'var(--viz-1)']
  if (r < 0.1) return ['shrinking', 'var(--viz-1)']
  if (r <= 10) return ['healthy', 'var(--viz-3)']
  if (r <= 100) return ['growing', 'var(--viz-2)']
  return ['exploding', 'var(--viz-2)']
}

function colourFor(lg: number) {
  if (lg < -1) return 'var(--viz-1)'
  if (lg > 1) return 'var(--viz-2)'
  return 'var(--viz-3)'
}

function LogBars({ grad }: { grad: number[] }) {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const ticks = [-15, -10, -5, 0, 5]
  const L = grad.length
  const halfW = Math.min(0.42, 0.36 + 0.06 * (L > 10 ? 1 : 0))
  return (
    <g>
      {/* healthy band: within ×10 of the gradient the loss sent back */}
      <Rect x0={0.5} x1={L + 0.5} y0={-1} y1={1} fill="color-mix(in srgb, var(--viz-3) 13%, transparent)" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x0} x2={x1} y1={ys(t)} y2={ys(t)} style={{ stroke: t === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)', strokeWidth: t === 0 ? 1.5 : 1 }} />
          <text x={x0 - 6} y={ys(t)} dy="0.32em" textAnchor="end" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
            {pow10Label(t)}
          </text>
        </g>
      ))}
      {grad.map((g, i) => {
        const l = i + 1
        const lg = Math.log10(Math.max(1e-300, g))
        const top = Math.max(Y_MIN, Math.min(Y_MAX, lg))
        const off = lg < Y_MIN || lg > Y_MAX
        return (
          <g key={l}>
            <Rect x0={l - halfW} x1={l + halfW} y0={0} y1={Math.abs(top) < 0.05 ? 0.05 : top} fill={colourFor(lg)} opacity={0.85} rx={1.5} />
            {off && (
              <path
                d={lg < Y_MIN ? `M${xs(l) - 4},${ys(Y_MIN) - 1}l4,6l4,-6z` : `M${xs(l) - 4},${ys(Y_MAX) + 1}l4,-6l4,6z`}
                style={{ fill: 'var(--viz-ink)' }}
              />
            )}
          </g>
        )
      })}
      {/* x labels: first and last layer */}
      <text x={xs(1)} y={ys(Y_MIN) + 16} textAnchor="middle" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
        1
      </text>
      {L > 1 && (
        <text x={xs(L)} y={ys(Y_MIN) + 16} textAnchor="middle" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
          {L}
        </text>
      )}
      <text x={(xs(1) + xs(L)) / 2} y={ys(Y_MIN) + 16} textAnchor="middle" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
        ← input side · layer · loss side →
      </text>
      <text x={x1 - 2} y={ys(1) - 4} textAnchor="end" className="plot-label" style={{ fontSize: 11, fill: 'var(--viz-3)' }}>
        healthy: within ×10
      </text>
    </g>
  )
}

export default function GradientDepthBars() {
  const [act, setAct] = useState<Act>('sigmoid')
  const [k, setK] = useState(1)
  const [depth, setDepth] = useState(20)
  const [residual, setResidual] = useState(false)
  const [bn, setBn] = useState(false)
  const [seedBump, bump] = useBump()
  const base = useMemo(() => makeBaseNet(20260 + seedBump * 7919), [seedBump])
  const { grad } = useMemo(() => deepNetGradients(base, { act, k, depth, residual, batchNorm: bn }), [base, act, k, depth, residual, bn])
  const ratio = grad[0]
  const [word, wordColour] = verdict(ratio)
  const perLayer = depth > 1 ? Math.pow(Math.max(1e-300, grad[0]), 1 / (depth - 1)) : 1
  const kName = Math.abs(k - 1) < 0.001 ? ' (Xavier)' : Math.abs(k - Math.SQRT2) < 0.01 ? ' (He)' : ''

  return (
    <Figure
      title="Gradient size at every layer of a deep network"
      caption={
        <>
          A real network ({NET_WIDTH} neurons per layer, weights with standard deviation <M>{'k/\\sqrt{n}'}</M>) straight after random
          initialisation. The loss sends back a gradient of size 1; each bar is how big that gradient is when it reaches a layer (log scale, so
          every grid line is a factor of 100 000). Try, in order:{' '}
          <b>1.</b> sigmoid: layer 1 gets about <M>{'10^{-12}'}</M> of the signal. <b>2.</b> ReLU: still shrinking, until you press <b>He</b>.{' '}
          <b>3.</b> drag the weight scale to 2: exploding. <b>4.</b> back to sigmoid and switch on <b>residual</b>: the bars come back.{' '}
          <b>5.</b> ReLU + He + residual explodes (every block adds its own copy of the gradient); add <b>BatchNorm</b> and the bars stay
          within about ×10 at any depth. That combination is how ResNets are built.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Activation"
          value={act}
          onChange={setAct}
          options={(['sigmoid', 'tanh', 'relu'] as Act[]).map((a) => ({ value: a, label: ACT_LABEL[a] }))}
        />
        <Toggle label="Residual connections" checked={residual} onChange={setResidual} />
        <Toggle label="BatchNorm" checked={bn} onChange={setBn} />
      </Controls>
      <Plot
        x={[0.3, depth + 0.7]}
        y={[Y_MIN - 1.3, Y_MAX]}
        width={600}
        height={300}
        minHeight={260}
        margin={{ left: 46, right: 8, top: 10, bottom: 6 }}
        ariaLabel={`Gradient size at each of ${depth} layers. Layer 1 receives ${sci(ratio)} of the gradient sent back by the loss: ${word}.`}
      >
        <LogBars grad={grad} />
      </Plot>
      <Controls>
        <Slider
          label={
            <>
              weight scale <M>k</M>
            </>
          }
          value={k}
          min={0.25}
          max={3}
          step={0.05}
          onChange={setK}
          format={(v) => `${v.toFixed(2)}${kName}`}
        />
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Button onClick={() => setK(1)}>Xavier: k = 1</Button>
          <Button onClick={() => setK(Math.SQRT2)}>He: k = √2</Button>
        </div>
        <Slider label="depth (layers)" value={depth} min={2} max={30} step={1} onChange={setDepth} />
        <Button onClick={bump}>New random weights</Button>
      </Controls>
      <Readout
        items={[
          ['gradient at layer 1', sci(ratio)],
          ['typical factor per layer', perLayer.toFixed(2)],
          [
            'verdict',
            <span key="v" style={{ color: wordColour, fontWeight: 800 }}>
              {word}
            </span>,
          ],
        ]}
      />
    </Figure>
  )
}
