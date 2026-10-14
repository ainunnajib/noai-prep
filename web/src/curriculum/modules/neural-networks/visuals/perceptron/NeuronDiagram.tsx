import { useContainerWidth } from '../../../../../kit'
import { num } from './shared'

/*
  One artificial neuron drawn left to right: inputs (with their current values) → weighted edges →
  Σ (the weighted sum z) → step → output. Laid out in real pixels from the measured width so the
  12–13 px text stays legible on a phone. Edges are orange for positive weights and blue for negative
  ones, thicker for bigger weights, and faded when their input is 0 (an input of 0 casts no vote).
*/

export interface NeuronInput {
  /** name shown to the left of the input node, e.g. "sunny" or "x₁" */
  label: string
  /** the input's current value (shown inside its node) */
  value: number
}

export function NeuronDiagram({
  inputs,
  weights,
  bias,
  weightNames,
  biasName = 'b',
  z,
  output,
  outputText,
  ariaLabel,
}: {
  inputs: NeuronInput[]
  weights: number[]
  bias: number
  /** optional symbols for the weights, e.g. ['w₁', 'w₂']; shown as "w₁ = 2" when there is room */
  weightNames?: string[]
  biasName?: string
  z: number
  output: number
  outputText?: string
  ariaLabel: string
}) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(420)
  const W = Math.max(290, Math.min(480, measured))
  const rows = inputs.length + 1
  const gap = 46
  const top = 24
  const H = top + (rows - 1) * gap + 40
  const labelRight = Math.min(112, W * 0.27)
  const inX = labelRight + 22
  const rIn = 14
  const sumX = W * 0.64
  const sumY = top + ((rows - 1) * gap) / 2
  const R = 22
  const stepX = W * 0.81
  const outX = W - 20
  const rOut = 16
  const wide = W >= 400
  const all = [...weights, bias]
  const wMax = Math.max(1, ...all.map(Math.abs))

  const items = [...inputs, { label: 'bias input', value: 1 }]

  return (
    <div ref={ref} className="plot-wrap" style={{ width: '100%', maxWidth: 480 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} style={{ display: 'block', width: '100%', height: 'auto' }}>
        {/* edges */}
        {items.map((it, i) => {
          const y = top + i * gap
          const w = all[i]
          const isBias = i === inputs.length
          const x1 = inX + rIn
          const dx = sumX - x1
          const dy = sumY - y
          const len = Math.hypot(dx, dy)
          const x2 = sumX - (dx / len) * R
          const y2 = sumY - (dy / len) * R
          const t = 0.42
          const mx = x1 + (x2 - x1) * t
          const my = y + (y2 - y) * t
          const col = w >= 0 ? 'var(--viz-2)' : 'var(--viz-1)'
          const off = it.value === 0
          const name = isBias ? biasName : weightNames?.[i]
          const text = name && wide ? `${name} = ${num(w)}` : `${w > 0 ? '+' : ''}${num(w)}`
          return (
            <g key={`e${i}`}>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y2}
                style={{ stroke: col, strokeWidth: w === 0 ? 1 : 1.2 + (Math.abs(w) / wMax) * 4, opacity: off ? 0.22 : 0.9, strokeDasharray: w === 0 ? '3 4' : undefined }}
                strokeLinecap="round"
              />
              <text x={mx} y={my - 7} textAnchor="middle" className="plot-label" style={{ fill: off ? 'var(--viz-muted)' : col, fontSize: 12.5 }}>
                {text}
              </text>
            </g>
          )
        })}
        {/* input nodes */}
        {items.map((it, i) => {
          const y = top + i * gap
          const isBias = i === inputs.length
          return (
            <g key={`n${i}`}>
              <text x={labelRight + 2} y={y} dy="0.35em" textAnchor="end" style={{ fill: isBias ? 'var(--ink-3)' : 'var(--ink-2)', fontSize: 12.5, fontWeight: 600 }}>
                {it.label}
              </text>
              <circle
                cx={inX}
                cy={y}
                r={rIn}
                style={{
                  fill: it.value ? 'color-mix(in srgb, var(--viz-3) 22%, var(--surface))' : 'var(--surface)',
                  stroke: isBias ? 'var(--viz-muted)' : 'var(--viz-ink)',
                  strokeWidth: 1.5,
                  strokeDasharray: isBias ? '3 3' : undefined,
                }}
              />
              <text x={inX} y={y} dy="0.35em" textAnchor="middle" className="nnet-node-label">
                {num(it.value)}
              </text>
            </g>
          )
        })}
        {/* sum node */}
        <circle cx={sumX} cy={sumY} r={R} style={{ fill: 'var(--surface-2)', stroke: 'var(--viz-ink)', strokeWidth: 2 }} />
        <text x={sumX} y={sumY} dy="0.36em" textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 20, fontWeight: 700 }}>
          Σ
        </text>
        <text x={sumX} y={sumY + R + 17} textAnchor="middle" className="plot-label" style={{ fontSize: 13 }}>
          {`z = ${num(z)}`}
        </text>
        {/* arrow Σ → step */}
        <line x1={sumX + R} y1={sumY} x2={stepX - 19} y2={sumY} style={{ stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
        <path d={`M${stepX - 17},${sumY}l-6,-4v8z`} style={{ fill: 'var(--viz-ink)' }} />
        {/* step box with a tiny step glyph */}
        <rect x={stepX - 17} y={sumY - 15} width={34} height={30} rx={6} style={{ fill: 'var(--surface)', stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
        <path d={`M${stepX - 11},${sumY + 8}H${stepX}V${sumY - 8}H${stepX + 11}`} style={{ fill: 'none', stroke: 'var(--viz-4)', strokeWidth: 2 }} />
        <text x={stepX} y={sumY - 22} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11.5, fontWeight: 600 }}>
          step
        </text>
        {/* arrow step → output */}
        <line x1={stepX + 17} y1={sumY} x2={outX - rOut - 2} y2={sumY} style={{ stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
        <path d={`M${outX - rOut},${sumY}l-6,-4v8z`} style={{ fill: 'var(--viz-ink)' }} />
        <circle
          cx={outX}
          cy={sumY}
          r={rOut}
          style={{ fill: output ? 'color-mix(in srgb, var(--viz-2) 45%, var(--surface))' : 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))', stroke: 'var(--viz-ink)', strokeWidth: 2 }}
        />
        <text x={outX} y={sumY} dy="0.35em" textAnchor="middle" className="nnet-node-label" style={{ fontSize: 13 }}>
          {output}
        </text>
        <text x={outX} y={sumY - rOut - 8} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 12.5, fontWeight: 700 }}>
          ŷ
        </text>
        {outputText && (
          <text x={outX + rOut} y={sumY + rOut + 17} textAnchor="end" className="plot-label" style={{ fontSize: 12.5, fill: output ? 'var(--viz-2)' : 'var(--viz-1)' }}>
            {outputText}
          </text>
        )}
      </svg>
    </div>
  )
}
