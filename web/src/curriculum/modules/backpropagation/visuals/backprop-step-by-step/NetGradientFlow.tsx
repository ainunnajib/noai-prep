import { useEffect, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button, Bars, usePlayer, PlayerControls, M, useContainerWidth, mulberry32 } from '../../../../../kit'
import { fmt } from '../computational-graphs/graphCore'

/*
  A 2-3-2 network with squared loss. After the forward pass, a backward "wave" runs from the
  outputs to the inputs: output errors δ, then layer-2 weight gradients (h_j × δ_k), then hidden
  errors (Σ w·δ times the activation's slope), then layer-1 weight gradients (x_i × δ_j).
  Edge colour = sign of ∂L/∂w (orange +, blue −), thickness = size. Tap an edge for its sum.
*/

type Act = 'relu' | 'sigmoid' | 'tanh'
const ACT: Record<Act, { f: (z: number) => number; d: (z: number) => number; tex: string }> = {
  relu: { f: (z) => Math.max(0, z), d: (z) => (z > 0 ? 1 : 0), tex: '\\mathrm{ReLU}' },
  sigmoid: {
    f: (z) => 1 / (1 + Math.exp(-z)),
    d: (z) => {
      const s = 1 / (1 + Math.exp(-z))
      return s * (1 - s)
    },
    tex: '\\sigma',
  },
  tanh: { f: (z) => Math.tanh(z), d: (z) => 1 - Math.tanh(z) ** 2, tex: '\\tanh' },
}

interface Params {
  W1: number[][] // [input i][hidden j]
  b1: number[]
  W2: number[][] // [hidden j][output k]
  b2: number[]
}

const DEFAULT: Params = {
  W1: [
    [0.8, -0.5, 0.3],
    [0.4, 0.9, -0.7],
  ],
  b1: [0.1, -0.2, 0.15],
  W2: [
    [0.6, -0.4],
    [-0.3, 0.8],
    [0.9, 0.5],
  ],
  b2: [0, 0],
}

function randomParams(seed: number): Params {
  const r = mulberry32(seed)
  const u = () => Math.round((r() * 2 - 1) * 10) / 10
  return {
    W1: [0, 1].map(() => [0, 1, 2].map(u)),
    b1: [0, 1, 2].map(() => Math.round((r() * 0.4 - 0.2) * 10) / 10),
    W2: [0, 1, 2].map(() => [0, 1].map(u)),
    b2: [0, 0],
  }
}

const sub = ['₁', '₂', '₃']
const uu = (v: number, dp = 2) => fmt(v, dp).replace('-', '−')
const pa = (v: number, dp = 2) => (v < 0 ? `(${fmt(v, dp)})` : fmt(v, dp))

export default function NetGradientFlow() {
  const [act, setAct] = useState<Act>('relu')
  const [x, setX] = useState([1, 0.5])
  const [y, setY] = useState([1, 0])
  const [seed, setSeed] = useState(0)
  const [sel, setSel] = useState<[number, number, number]>([2, 0, 0]) // [layer, from, to]
  const P = seed === 0 ? DEFAULT : randomParams(seed * 7919 + 13)
  const player = usePlayer({ steps: 5, interval: 1500 })
  const st = player.step
  const [ref, measured] = useContainerWidth<HTMLDivElement>(600)

  // start with the whole backward pass shown (complete at rest)
  useEffect(() => {
    player.setStep(4)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- forward ----
  const A = ACT[act]
  const z1 = [0, 1, 2].map((j) => x[0] * P.W1[0][j] + x[1] * P.W1[1][j] + P.b1[j])
  const h = z1.map(A.f)
  const yh = [0, 1].map((k) => h.reduce((s, hj, j) => s + hj * P.W2[j][k], 0) + P.b2[k])
  const L = yh.reduce((s, v, k) => s + (v - y[k]) ** 2, 0)
  // ---- backward ----
  const d2 = yh.map((v, k) => 2 * (v - y[k]))
  const dW2 = h.map((hj) => d2.map((dk) => hj * dk))
  const dh = [0, 1, 2].map((j) => d2.reduce((s, dk, k) => s + P.W2[j][k] * dk, 0))
  const fp = z1.map(A.d)
  const d1 = dh.map((v, j) => v * fp[j])
  const dW1 = x.map((xi) => d1.map((dj) => xi * dj))
  const gmax = Math.max(1e-9, ...dW1.flat().map(Math.abs), ...dW2.flat().map(Math.abs))
  const mean = (m: number[][]) => m.flat().reduce((s, v) => s + Math.abs(v), 0) / m.flat().length

  // ---- layout ----
  const W = Math.max(300, Math.min(720, measured))
  const narrow = W < 520
  const r = narrow ? 20 : 23
  const gap = narrow ? 82 : 88
  const top = 34
  const H = top + 2 * gap + 72
  const colX = [narrow ? 40 : 70, W / 2, W - (narrow ? 58 : 96)]
  const rowY = (layer: number, i: number) => (layer === 1 ? top + i * gap : top + (i + 0.5) * gap)
  const showD2 = st >= 1
  const showG2 = st >= 2
  const showD1 = st >= 3
  const showG1 = st >= 4

  const edgeStyle = (g: number, on: boolean, isSel: boolean) => {
    if (!on) return { stroke: 'var(--viz-muted)', strokeWidth: 1.2, opacity: 0.55 }
    if (Math.abs(g) < 1e-9) return { stroke: 'var(--viz-muted)', strokeWidth: 1.4, strokeDasharray: '4 4', opacity: 0.9 }
    return { stroke: g > 0 ? 'var(--viz-2)' : 'var(--viz-1)', strokeWidth: 1.3 + 6.5 * (Math.abs(g) / gmax), opacity: isSel ? 1 : 0.88 }
  }

  const edges: { layer: number; i: number; j: number; x1: number; y1: number; x2: number; y2: number; g: number; on: boolean }[] = []
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 3; j++) edges.push({ layer: 1, i, j, x1: colX[0], y1: rowY(0, i), x2: colX[1], y2: rowY(1, j), g: dW1[i][j], on: showG1 })
  for (let j = 0; j < 3; j++)
    for (let k = 0; k < 2; k++) edges.push({ layer: 2, i: j, j: k, x1: colX[1], y1: rowY(1, j), x2: colX[2], y2: rowY(2, k), g: dW2[j][k], on: showG2 })

  const pill = (cx: number, cy: number, v: number, key: string) => {
    const txt = `δ = ${uu(v)}`
    const w = txt.length * 7 + 10
    return (
      <g key={key}>
        <rect
          x={cx - w / 2}
          y={cy + r + 4}
          width={w}
          height={19}
          rx={6}
          style={{
            fill: `color-mix(in srgb, ${Math.abs(v) < 1e-9 ? 'var(--viz-muted)' : v > 0 ? 'var(--viz-2)' : 'var(--viz-1)'} 18%, var(--surface))`,
            stroke: Math.abs(v) < 1e-9 ? 'var(--viz-muted)' : v > 0 ? 'var(--viz-2)' : 'var(--viz-1)',
            strokeWidth: 1.2,
          }}
        />
        <text x={cx} y={cy + r + 17.5} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: 11.5, fontWeight: 700 }}>
          {txt}
        </text>
      </g>
    )
  }

  const [sl, si, sj] = sel
  const selG = sl === 1 ? dW1[si][sj] : dW2[si][sj]
  const selReached = sl === 1 ? showG1 : showG2
  const selName = sl === 1 ? `w(x${sub[si]}→h${sub[sj]})` : `w(h${sub[si]}→ŷ${sub[sj]})`
  // show the factors to 2 dp; say "≈" whenever rounding was needed
  const ex2 = (v: number) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-9
  const selIn = sl === 1 ? x[si] : h[si]
  const selD = sl === 1 ? d1[sj] : d2[sj]
  const rel = ex2(selIn) && ex2(selD) ? '=' : '\\approx'
  const selTex =
    sl === 1
      ? `\\frac{\\partial L}{\\partial w} = \\underbrace{x_${si + 1}}_{\\text{input in}} \\times \\underbrace{\\delta_{h_${sj + 1}}}_{\\text{error at end}} ${rel} ${pa(selIn)} \\times ${pa(selD)} ${rel} ${fmt(selG, ex2(selIn) && ex2(selD) ? 4 : 2)}`
      : `\\frac{\\partial L}{\\partial w} = \\underbrace{h_${si + 1}}_{\\text{input in}} \\times \\underbrace{\\delta_{\\hat y_${sj + 1}}}_{\\text{error at end}} ${rel} ${pa(selIn)} \\times ${pa(selD)} ${rel} ${fmt(selG, ex2(selIn) && ex2(selD) ? 4 : 2)}`

  const texts = [
    <>
      Forward pass done: <M>{`\\hat y = (${fmt(yh[0], 2)},\\ ${fmt(yh[1], 2)})`}</M> against targets <M>{`y = (${fmt(y[0], 2)},\\ ${fmt(y[1], 2)})`}</M>, so{' '}
      <M>{`L = \\sum_k (\\hat y_k - y_k)^2 = ${fmt(L, 3)}`}</M>. Press Play to send the error backwards.
    </>,
    <>
      Output errors: <M>{`\\delta_{\\hat y_k} = \\frac{\\partial L}{\\partial \\hat y_k} = 2(\\hat y_k - y_k)`}</M>, giving{' '}
      <M>{`(${fmt(d2[0], 2)},\\ ${fmt(d2[1], 2)})`}</M>. Orange means the output is too high, blue too low.
    </>,
    <>
      Layer-2 weights: <M>{`\\frac{\\partial L}{\\partial w_{jk}} = h_j \\times \\delta_{\\hat y_k}`}</M>. A weight gets a big gradient only when the neuron
      feeding it is strongly active <i>and</i> the output it feeds has a big error.
    </>,
    <>
      Hidden errors: each hidden neuron adds up what comes back from <i>both</i> outputs (it fed both, so the gradients add), then multiplies by its
      activation's slope: <M>{`\\delta_{h_j} = \\big(\\textstyle\\sum_k w_{jk}\\,\\delta_{\\hat y_k}\\big) \\times f'(z_j)`}</M>.
      {act === 'relu' && fp.some((v) => v === 0) && <> A ReLU neuron with <M>{'z \\le 0'}</M> has slope 0, so its <M>\delta</M> is 0.</>}
      {act === 'sigmoid' && <> The sigmoid's slope is at most 0.25, so every hidden error shrinks.</>}
    </>,
    <>
      Layer-1 weights: <M>{`\\frac{\\partial L}{\\partial w_{ij}} = x_i \\times \\delta_{h_j}`}</M>. Same rule as layer 2: input coming in times error at the
      far end. An input of 0 would give all its weights zero gradient.
    </>,
  ]

  return (
    <Figure
      title="The backward wave through a 2-3-2 network"
      caption={
        <>
          Press <b>Play</b> to watch the gradient travel from the outputs back to the inputs. Each weight's colour is the sign of{' '}
          <M>{'\\partial L / \\partial w'}</M> (orange positive, blue negative) and its thickness the size; tap any connection to see its gradient
          worked out. Change a target, set an input to 0, or switch to <b>sigmoid</b> and compare the two bars: the layer-1 gradients shrink.
        </>
      }
    >
      <Segmented
        label="Hidden activation"
        value={act}
        onChange={setAct}
        options={[
          { value: 'relu', label: 'ReLU' },
          { value: 'sigmoid', label: 'sigmoid' },
          { value: 'tanh', label: 'tanh' },
        ]}
      />
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label={`Two-three-two network, backward pass step ${st + 1} of 5`}>
          {/* selection halo */}
          {edges
            .filter((e) => e.layer === sl && e.i === si && e.j === sj)
            .map((e) => (
              <line key="halo" x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} style={{ stroke: 'var(--highlight)', strokeWidth: 12, opacity: 0.55 }} strokeLinecap="round" />
            ))}
          {edges.map((e) => {
            const isSel = e.layer === sl && e.i === si && e.j === sj
            return <line key={`${e.layer}-${e.i}-${e.j}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} style={edgeStyle(e.g, e.on, isSel)} strokeLinecap="round" />
          })}
          {/* invisible wide hit targets */}
          {edges.map((e) => (
            <line
              key={`hit${e.layer}-${e.i}-${e.j}`}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              role="button"
              tabIndex={0}
              aria-label={`weight from ${e.layer === 1 ? `x${e.i + 1}` : `h${e.i + 1}`} to ${e.layer === 1 ? `h${e.j + 1}` : `output ${e.j + 1}`}`}
              onClick={() => setSel([e.layer, e.i, e.j])}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault()
                  setSel([e.layer, e.i, e.j])
                }
              }}
              style={{ stroke: 'transparent', strokeWidth: 14, cursor: 'pointer', outline: 'none' }}
            />
          ))}
          {/* nodes */}
          {[0, 1].map((i) => (
            <g key={`x${i}`}>
              <circle cx={colX[0]} cy={rowY(0, i)} r={r} style={{ fill: 'var(--surface)', stroke: 'var(--viz-axis)', strokeWidth: 1.6 }} />
              <text x={colX[0]} y={rowY(0, i) + 4} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: 12, fontWeight: 700 }}>
                {uu(x[i])}
              </text>
              <text x={colX[0]} y={rowY(0, i) - r - 6} textAnchor="middle" className="plot-label" style={{ fontSize: 12.5 }}>
                {`x${sub[i]}`}
              </text>
            </g>
          ))}
          {[0, 1, 2].map((j) => (
            <g key={`h${j}`}>
              <circle
                cx={colX[1]}
                cy={rowY(1, j)}
                r={r}
                style={{
                  fill: `color-mix(in srgb, var(--viz-5) ${Math.round(Math.min(1, Math.abs(h[j])) * 30)}%, var(--surface))`,
                  stroke: 'var(--viz-5)',
                  strokeWidth: st === 3 ? 3 : 1.6,
                }}
              />
              <text x={colX[1]} y={rowY(1, j) + 4} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: 12, fontWeight: 700 }}>
                {uu(h[j])}
              </text>
              <text x={colX[1] - r - 5} y={rowY(1, j) - r + 4} textAnchor="end" className="plot-label" style={{ fontSize: 12.5 }}>
                {`h${sub[j]}`}
              </text>
              {showD1 && pill(colX[1], rowY(1, j), d1[j], `d1${j}`)}
            </g>
          ))}
          {[0, 1].map((k) => (
            <g key={`o${k}`}>
              <circle cx={colX[2]} cy={rowY(2, k)} r={r} style={{ fill: 'var(--surface)', stroke: 'var(--viz-ink)', strokeWidth: st === 1 ? 3 : 1.6 }} />
              <text x={colX[2]} y={rowY(2, k) + 4} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: 12, fontWeight: 700 }}>
                {uu(yh[k])}
              </text>
              <text x={colX[2] + r + 4} y={rowY(2, k) - r + 8} textAnchor="start" className="plot-label" style={{ fontSize: 12.5 }}>
                {`ŷ${sub[k]}`}
              </text>
              <text x={colX[2] + r + 4} y={rowY(2, k) + 10} textAnchor="start" className="tabular plot-label" style={{ fontSize: 11.5, fill: 'var(--ink-3)' }}>
                {`y=${uu(y[k], 1)}`}
              </text>
              {showD2 && pill(colX[2], rowY(2, k), d2[k], `d2${k}`)}
            </g>
          ))}
          {['input', 'hidden', 'output'].map((t, l) => (
            <text key={t} x={colX[l]} y={H - 8} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }}>
              {t}
            </text>
          ))}
        </svg>
      </div>
      <div style={{ width: '100%', minHeight: '5.6em', fontSize: '0.95rem', lineHeight: 1.6 }} aria-live="polite">
        <div style={{ fontWeight: 700, color: 'var(--ink-2)', fontSize: '0.9rem' }}>
          {['1. Forward pass', '2. Output errors', '3. Layer-2 weight gradients', '4. Hidden errors', '5. Layer-1 weight gradients'][st]}
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>{texts[st]}</div>
      </div>
      <div style={{ width: '100%', fontSize: '0.92rem', lineHeight: 1.6, padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-m)', background: 'var(--surface-2)' }}>
        <div style={{ fontWeight: 700, color: 'var(--ink-2)' }}>Selected weight {selName}</div>
        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          {selReached ? <M>{selTex}</M> : <span style={{ color: 'var(--ink-3)' }}>The backward wave has not reached this weight yet.</span>}
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.25rem' }}>Average size of the weight gradients</div>
        <Bars
          ariaLabel="Average absolute weight gradient per layer"
          format={(v) => v.toFixed(3)}
          data={[
            { label: 'layer 2 (h → ŷ)', value: mean(dW2), color: 'var(--viz-4)' },
            { label: 'layer 1 (x → h)', value: mean(dW1), color: 'var(--viz-5)', strong: true },
          ]}
        />
      </div>
      <PlayerControls player={player} label={(s) => `step ${s + 1} of 5`} />
      <Controls>
        <Slider label={<>input x₁</>} value={x[0]} min={-1} max={1} step={0.1} onChange={(v) => setX([v, x[1]])} format={(v) => uu(v, 1)} />
        <Slider label={<>input x₂</>} value={x[1]} min={-1} max={1} step={0.1} onChange={(v) => setX([x[0], v])} format={(v) => uu(v, 1)} />
        <Slider label={<>target y₁</>} value={y[0]} min={-1} max={1} step={0.1} onChange={(v) => setY([v, y[1]])} format={(v) => uu(v, 1)} />
        <Slider label={<>target y₂</>} value={y[1]} min={-1} max={1} step={0.1} onChange={(v) => setY([y[0], v])} format={(v) => uu(v, 1)} />
        <Button onClick={() => setSeed((s) => s + 1)}>New random weights</Button>
        {seed !== 0 && <Button onClick={() => setSeed(0)}>Original weights</Button>}
      </Controls>
    </Figure>
  )
}
