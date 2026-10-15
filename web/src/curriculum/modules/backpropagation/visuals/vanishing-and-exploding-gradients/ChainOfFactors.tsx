import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, usePlot, Rect, M } from '../../../../../kit'
import { ACT, DACT, ACT_LABEL, SIZE_COLOUR, pow10Label, sci, type Act } from './sim'

/*
  A "network" one neuron wide: x → a₁ → a₂ → … → a_D → loss, with a_k = φ(w · a_{k−1}).
  Going backwards, every arrow multiplies the gradient by its local factor w · φ′(z_k).
  Bars underneath show |∂L/∂a_k| on a log scale.
*/

const Y_MIN = -12
const Y_MAX = 6
const NODE_Y = 9.2

function colourFor(lg: number) {
  if (lg < -1) return SIZE_COLOUR.vanishing
  if (lg > 1) return SIZE_COLOUR.exploding
  return SIZE_COLOUR.healthy
}

/** colour for a single per-layer factor: shrinking (indigo), about 1 (green), growing (red) */
function factorColour(f: number) {
  if (f < 0.9) return SIZE_COLOUR.vanishing
  if (f > 1.1) return SIZE_COLOUR.exploding
  return SIZE_COLOUR.healthy
}

interface ChainData {
  z: number[]
  a: number[]
  fac: number[]
  g: number[]
}

function computeChain(act: Act, w: number, D: number): ChainData {
  const z = [NaN]
  const a = [1]
  for (let k = 1; k <= D; k++) {
    z.push(w * a[k - 1])
    a.push(ACT[act](z[k]))
  }
  const fac = new Array<number>(D + 1).fill(NaN)
  const g = new Array<number>(D + 1).fill(NaN)
  g[D] = 1
  for (let k = D; k >= 2; k--) {
    fac[k] = w * DACT[act](z[k])
    g[k - 1] = g[k] * fac[k]
  }
  return { z, a, fac, g }
}

function ChainDrawing({ data, D, sel, onSel }: { data: ChainData; D: number; sel: number; onSel: (k: number) => void }) {
  const { xs, ys } = usePlot()
  const step = xs(1) - xs(0)
  const r = Math.max(7, Math.min(13, step * 0.3))
  const ny = ys(NODE_Y)
  // every factor label on wide screens, every second one when space is tight, none when very tight
  const allFactors = step >= 46
  const someFactors = step >= 24
  const showLabel = (k: number) => allFactors || (someFactors && (k % 2 === 1 || k === sel))
  const ticks = [-12, -9, -6, -3, 0, 3, 6]
  const [x0, x1] = xs.range()
  return (
    <g>
      {/* log grid + labels */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x0} x2={x1} y1={ys(t)} y2={ys(t)} style={{ stroke: t === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)', strokeWidth: t === 0 ? 1.5 : 1 }} />
          <text x={x0 - 6} y={ys(t)} dy="0.32em" textAnchor="end" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
            {pow10Label(t)}
          </text>
        </g>
      ))}
      {/* edges with factors */}
      {Array.from({ length: D + 1 }, (_, k) => {
        const xa = xs(k) + r
        const xb = xs(k + 1) - r
        const back = k + 1 <= D && k + 1 >= 2 ? data.fac[k + 1] : NaN
        // the arrows whose factors make up the gradient reaching the selected neuron
        const inProduct = k >= sel && k < D
        return (
          <g key={`e${k}`}>
            <line x1={xa} x2={xb} y1={ny} y2={ny} style={{ stroke: inProduct ? 'var(--accent)' : 'var(--viz-muted)', strokeWidth: inProduct ? 2.6 : 1.5 }} />
            <path d={`M${xb},${ny}l-6,-4v8z`} style={{ fill: inProduct ? 'var(--accent)' : 'var(--viz-muted)' }} />
            {showLabel(k) && Number.isFinite(back) && (
              <text x={(xa + xb) / 2} y={ny - 14} textAnchor="middle" style={{ fill: factorColour(back), fontSize: 11, fontWeight: 700 }}>
                ×{back < 0.1 ? back.toFixed(3) : back.toFixed(2)}
              </text>
            )}
          </g>
        )
      })}
      <text x={xs(D + 1) + r} y={ny - (someFactors ? 30 : 18)} textAnchor="end" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
        ← backward pass: × each factor
      </text>
      {/* input and loss */}
      <circle cx={xs(0)} cy={ny} r={r} style={{ fill: 'var(--surface-2)', stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
      <text x={xs(0)} y={ny} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 12, fontWeight: 700 }}>
        x
      </text>
      <rect x={xs(D + 1) - r} y={ny - r} width={2 * r} height={2 * r} rx={4} style={{ fill: 'var(--surface-2)', stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
      <text x={xs(D + 1)} y={ny} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 12, fontWeight: 700 }}>
        L
      </text>
      {/* neurons, shaded by how much gradient reaches them */}
      {Array.from({ length: D }, (_, i) => {
        const k = i + 1
        const lg = Math.log10(Math.max(1e-300, data.g[k]))
        const strength = Math.max(0, Math.min(1, (lg + 8) / 8))
        const isSel = k === sel
        return (
          <g
            key={`n${k}`}
            role="button"
            tabIndex={0}
            aria-label={`Neuron a${k}: gradient ${sci(data.g[k])}`}
            aria-pressed={isSel}
            style={{ cursor: 'pointer', outline: 'none' }}
            onClick={() => onSel(k)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSel(k)
              }
            }}
          >
            {/* tall, column-wide tap target: the neuron and its bar */}
            <rect x={xs(k) - step / 2} y={ny - r - 6} width={step} height={ys(Y_MIN) - ny + r + 6} style={{ fill: 'transparent' }} />
            <circle
              cx={xs(k)}
              cy={ny}
              r={r}
              style={{
                fill: `color-mix(in srgb, ${colourFor(lg)} ${Math.round(12 + strength * 70)}%, var(--surface))`,
                stroke: isSel ? 'var(--accent)' : 'var(--viz-ink)',
                strokeWidth: isSel ? 3 : 1.5,
              }}
            />
            {step >= 30 && (
              <text x={xs(k)} y={ny + r + 13} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 11 }}>
                a{k}
              </text>
            )}
          </g>
        )
      })}
      {/* bars */}
      {Array.from({ length: D }, (_, i) => {
        const k = i + 1
        const lg = Math.log10(Math.max(1e-300, data.g[k]))
        const top = Math.max(Y_MIN, Math.min(Y_MAX, lg))
        const off = lg < Y_MIN || lg > Y_MAX
        const isSel = k === sel
        return (
          <g key={`b${k}`} onClick={() => onSel(k)} style={{ cursor: 'pointer' }}>
            <Rect x0={k - 0.28} x1={k + 0.28} y0={0} y1={top === 0 ? 0.04 : top} fill={colourFor(lg)} opacity={isSel ? 1 : 0.72} rx={2} />
            {off && (
              <path
                d={lg < Y_MIN ? `M${xs(k) - 5},${ys(Y_MIN) - 2}l5,7l5,-7z` : `M${xs(k) - 5},${ys(Y_MAX) + 2}l5,-7l5,7z`}
                style={{ fill: colourFor(lg) }}
              />
            )}
          </g>
        )
      })}
      <text x={x1} y={ys(Y_MIN) + 18} textAnchor="end" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
        bars: size of ∂L/∂aₖ (log scale)
      </text>
    </g>
  )
}

export default function ChainOfFactors() {
  const [act, setAct] = useState<Act>('sigmoid')
  const [w, setW] = useState(1)
  const [D, setD] = useState(8)
  const [selRaw, setSel] = useState(1)
  const sel = Math.min(selRaw, D)
  const data = useMemo(() => computeChain(act, w, D), [act, w, D])

  const nFactors = D - sel
  const factorList = Array.from({ length: Math.min(nFactors, 3) }, (_, i) => data.fac[sel + 1 + i].toFixed(3))
  const productText =
    nFactors === 0
      ? '1 (this neuron feeds the loss directly)'
      : `${factorList.join(' × ')}${nFactors > 3 ? ' × …' : ''} = ${sci(data.g[sel], 2)}`
  // the factor on the arrow OUT of the selected neuron (a_k → a_{k+1}): the first factor of its product
  const outFactor = sel < D ? data.fac[sel + 1] : NaN

  return (
    <Figure
      title="One neuron per layer: watch the factors multiply"
      caption={
        <>
          Going backwards, each arrow multiplies the gradient by its local factor <M>{'w \\cdot \\varphi\'(z)'}</M>, where <M>z</M> belongs to the
          neuron the arrow points into (the number above the arrow; every second one on a phone). Tap a neuron: the arrows whose factors make up
          its gradient light up. Try <b>ReLU</b> with <M>w = 1</M>: every factor is exactly 1 and the gradient arrives intact.
          Now try <M>w = 1.5</M> (it explodes) and <M>w = 0.6</M> (it vanishes). With <b>sigmoid</b>, no weight gets the factor anywhere near 1:
          a bigger <M>w</M> pushes <M>z</M> into the flat tails of the S-curve, where <M>{"\\sigma'(z) \\approx 0"}</M>.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Activation φ"
          value={act}
          onChange={setAct}
          options={(['sigmoid', 'tanh', 'relu'] as Act[]).map((a) => ({ value: a, label: ACT_LABEL[a] }))}
        />
      </Controls>
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem', fontSize: '0.84rem', color: 'var(--ink-2)' }}>
        {[
          [SIZE_COLOUR.vanishing, 'shrinking'],
          [SIZE_COLOUR.healthy, 'about 1 (bars: within ×10)'],
          [SIZE_COLOUR.exploding, 'growing'],
        ].map(([c, t]) => (
          <span key={t}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: c, verticalAlign: '-0.1em', marginRight: 5 }} />
            {t}
          </span>
        ))}
        <span>
          <span style={{ display: 'inline-block', width: 18, height: 3, background: 'var(--accent)', verticalAlign: 'middle', marginRight: 5 }} />
          arrows in the selected neuron's product
        </span>
      </div>
      <Plot x={[-0.5, D + 1.5]} y={[Y_MIN - 1.6, NODE_Y + 3.4]} width={560} height={330} minHeight={300} margin={{ left: 44, right: 10, top: 6, bottom: 4 }} ariaLabel={`A chain of ${D} neurons with ${ACT_LABEL[act]} activation and weight ${w}. The gradient reaching the first neuron is ${sci(data.g[1])}.`}>
        <ChainDrawing data={data} D={D} sel={sel} onSel={setSel} />
      </Plot>
      <Controls>
        <Slider label={<>weight <M>w</M> (same on every arrow)</>} value={w} min={0.25} max={3} step={0.05} onChange={setW} format={(v) => v.toFixed(2)} />
        <Slider label="number of layers D" value={D} min={2} max={12} step={1} onChange={setD} />
      </Controls>
      <Readout
        items={
          sel < D
            ? [
                [`arrow a${sel} → a${sel + 1}: z${sel + 1}`, data.z[sel + 1].toFixed(3)],
                [`φ′(z${sel + 1})`, DACT[act](data.z[sel + 1]).toFixed(3)],
                ['its factor w·φ′', outFactor.toFixed(3)],
              ]
            : [[`a${sel}`, 'feeds the loss directly: gradient 1']]
        }
      />
      <div style={{ fontSize: '0.875rem', color: 'var(--ink-2)', width: '100%', overflowWrap: 'anywhere' }}>
        Gradient reaching <b>a{sel}</b> = product of the {nFactors} highlighted factor{nFactors === 1 ? '' : 's'} to its right ={' '}
        <span className="tabular" style={{ color: 'var(--ink)', fontWeight: 700 }}>
          {productText}
        </span>
      </div>
    </Figure>
  )
}
