import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Button, Plot, usePlot, Rect, M, useBump } from '../../../../../kit'
import { makeBaseNet, deepNetGradients, pow10Label, sci, sciTex, ACT_LABEL, NET_WIDTH, SIZE_COLOUR, type Act } from './sim'

/*
  A real (small) deep network at initialisation: 32 neurons per layer, a batch of 32 random inputs.
  We run the forward pass, send a gradient of size 1 back from the loss, and plot how big the
  gradient is when it reaches each layer (log scale). Each layer gets a dot at its value, joined to
  the "1" line by a stem: up = bigger, down = smaller, so a healthy gradient is a row of dots on the band.
  Numbered presets walk through the causes and the fixes in order.
*/

const Y_MIN = -16
const Y_MAX = 8

function verdict(r: number): [string, string] {
  if (r < 1e-2) return ['vanishing', SIZE_COLOUR.vanishing]
  if (r < 0.1) return ['shrinking', SIZE_COLOUR.vanishing]
  if (r <= 10) return ['healthy', SIZE_COLOUR.healthy]
  if (r <= 100) return ['growing', SIZE_COLOUR.exploding]
  return ['exploding', SIZE_COLOUR.exploding]
}

function colourFor(lg: number) {
  if (lg < -1) return SIZE_COLOUR.vanishing
  if (lg > 1) return SIZE_COLOUR.exploding
  return SIZE_COLOUR.healthy
}

interface Preset {
  label: string
  act: Act
  k: number
  residual: boolean
  bn: boolean
  note: string
  /** the note quotes numbers that hold for the default 20 layers */
  quotes?: boolean
}

const PRESETS: Preset[] = [
  { label: '1. sigmoid', act: 'sigmoid', k: 1, residual: false, bn: false, note: 'Every sigmoid layer multiplies by a small factor: layer 1 gets about 10⁻¹² of the signal. Vanishing.', quotes: true },
  { label: '2. ReLU', act: 'relu', k: 1, residual: false, bn: false, note: 'Better, but with k = 1 half the neurons are off, so every layer still shrinks the gradient.' },
  { label: '3. ReLU + He', act: 'relu', k: Math.SQRT2, residual: false, bn: false, note: 'He initialisation (k = √2) makes up for the half that is off: the dots stay in the healthy band.' },
  { label: '4. weights too big', act: 'relu', k: 2, residual: false, bn: false, note: 'With k = 2 every layer multiplies the gradient by about 1.4 (k × 0.71; this particular random network shows its exact value under “typical factor per layer” below), and twenty of those explode.', quotes: true },
  { label: '5. sigmoid + residual', act: 'sigmoid', k: 1, residual: true, bn: false, note: 'Skip connections carry the gradient past every sigmoid: back in the healthy band.' },
  {
    label: '6. ReLU + He + residual',
    act: 'relu',
    k: Math.SQRT2,
    residual: true,
    bn: false,
    note: 'Now every block adds its own full-size contribution on top of the skip path, so the gradient grows: exploding.',
  },
  {
    label: '7. … + BatchNorm',
    act: 'relu',
    k: Math.SQRT2,
    residual: true,
    bn: true,
    note: 'BatchNorm keeps each block’s contribution in check: the dots stay in the healthy band at every depth in this chart (up to 30 layers). This combination is how ResNets are built.',
  },
]

function LogBars({ grad }: { grad: number[] }) {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const ticks = [-15, -10, -5, 0, 5]
  const L = grad.length
  const halfW = Math.min(0.42, 0.36 + 0.06 * (L > 10 ? 1 : 0))
  const dotR = Math.max(2.5, Math.min(5, (xs(1) - xs(0)) * 0.3))
  return (
    <g>
      {/* healthy band: within ×10 of the gradient the loss sent back */}
      <Rect x0={0.5} x1={L + 0.5} y0={-1} y1={1} fill={`color-mix(in srgb, ${SIZE_COLOUR.healthy} 13%, transparent)`} />
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
        const c = colourFor(lg)
        return (
          <g key={l}>
            {/* a thin stem from the "1" line, and a dot at the value: a value of 1 is a dot on the line */}
            {Math.abs(top) >= 0.05 && <Rect x0={l - halfW * 0.35} x1={l + halfW * 0.35} y0={0} y1={top} fill={c} opacity={0.55} rx={1} />}
            <circle cx={xs(l)} cy={ys(top)} r={dotR} style={{ fill: c, stroke: 'var(--surface)', strokeWidth: 1 }} />
            {off && (
              <path
                d={lg < Y_MIN ? `M${xs(l) - 4},${ys(Y_MIN) + 6}l4,6l4,-6z` : `M${xs(l) - 4},${ys(Y_MAX) - 6}l4,-6l4,6z`}
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
  const current = PRESETS.find((p) => p.act === act && Math.abs(p.k - k) < 1e-6 && p.residual === residual && p.bn === bn)

  const apply = (p: Preset) => {
    setAct(p.act)
    setK(p.k)
    setResidual(p.residual)
    setBn(p.bn)
    setDepth(20)
  }

  return (
    <Figure
      title="Gradient size at every layer of a deep network"
      caption={
        <>
          A real network ({NET_WIDTH} neurons per layer, weights with standard deviation <M>{'k/\\sqrt{n}'}</M>) straight after random
          initialisation. The loss sends back a gradient of size 1; each dot is how big it is when it reaches a layer (log scale: every grid line
          is a factor of 100 000). Press the numbered settings in order, then change anything yourself.
        </>
      }
    >
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', marginRight: '0.2rem' }}>Try in order:</span>
        {PRESETS.map((p) => (
          <Button key={p.label} primary={current === p} onClick={() => apply(p)}>
            {p.label}
          </Button>
        ))}
      </div>
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
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem', fontSize: '0.84rem', color: 'var(--ink-2)' }}>
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 18,
              height: 12,
              borderRadius: 2,
              background: `color-mix(in srgb, ${SIZE_COLOUR.healthy} 13%, transparent)`,
              border: `1px solid color-mix(in srgb, ${SIZE_COLOUR.healthy} 40%, transparent)`,
              verticalAlign: '-0.1em',
              marginRight: 5,
            }}
          />
          healthy band: within ×10 of 1
        </span>
        {[
          [SIZE_COLOUR.vanishing, 'shrinking'],
          [SIZE_COLOUR.healthy, 'about 1'],
          [SIZE_COLOUR.exploding, 'growing'],
        ].map(([c, t]) => (
          <span key={t}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: c, verticalAlign: '-0.05em', marginRight: 5 }} />
            {t}
          </span>
        ))}
      </div>
      <div style={{ width: '100%', minHeight: '2.8em', fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--ink-2)' }} aria-live="polite">
        {current ? (
          <>
            <b style={{ color: 'var(--ink)' }}>{current.label}:</b> {current.note}
            {depth !== 20 && current.quotes && <> (The numbers quoted are for 20 layers.)</>}
          </>
        ) : (
          <>Your own settings. Watch the dots at the input end (left): that is where vanishing or exploding shows first.</>
        )}
      </div>
      <Readout
        items={[
          ['gradient at layer 1', <M key="g">{sciTex(ratio)}</M>],
          ['typical factor per layer', perLayer.toFixed(2)],
          [
            'verdict',
            <span key="v" style={{ color: wordColour, fontWeight: 800 }}>
              {word}
            </span>,
          ],
        ]}
      />
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
    </Figure>
  )
}
