import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, useContainerWidth } from '../../../../../kit'
import s from './conv.module.css'

/*
  Two separate ideas make a convolution cheap, shown on a 1-D strip of 8 inputs and 6 outputs:
  - local connections: each output looks only at 3 neighbouring inputs (not all 8);
  - weight sharing: every output uses the SAME 3 weights (a, b, c).
  Dense = neither, local = only the first, convolution = both. Tap an output to see its weights.
*/

type Mode = 'dense' | 'local' | 'conv'
const NIN = 8
const NOUT = 6
const KC = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)']
const sub = (n: number) => String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])

export default function SharedWeights() {
  const [mode, setMode] = useState<Mode>('conv')
  const [sel, setSel] = useState(2)
  const [ref, w] = useContainerWidth<HTMLDivElement>(520)
  const W = Math.max(300, Math.min(600, w))
  const H = 210
  const pad = 26
  const xin = (i: number) => pad + (i * (W - 2 * pad)) / (NIN - 1)
  const xout = (j: number) => xin(j + 1)
  const yIn = 36
  const yOut = H - 40
  const r = Math.min(15, (W - 2 * pad) / (NIN - 1) / 2.6)

  const edges: { i: number; j: number; k: number }[] = []
  for (let j = 0; j < NOUT; j++)
    for (let i = 0; i < NIN; i++) {
      const k = i - j
      if (mode === 'dense' || (k >= 0 && k < 3)) edges.push({ i, j, k })
    }

  const nWeights = mode === 'dense' ? NIN * NOUT : mode === 'local' ? 3 * NOUT : 3
  const nBias = mode === 'conv' ? 1 : NOUT
  const selWeights =
    mode === 'conv'
      ? `a, b, c (the same 3 as every other output)`
      : mode === 'local'
        ? `w${sub(sel + 1)},${sub(1)}  w${sub(sel + 1)},${sub(2)}  w${sub(sel + 1)},${sub(3)} (its own 3)`
        : `w${sub(sel + 1)},${sub(1)} … w${sub(sel + 1)},${sub(8)} (its own 8)`

  return (
    <Figure
      title="Local connections and shared weights"
      caption={
        <>
          <b>Try:</b> tap an output, then switch between the three layer types. <b>Notice:</b> a convolution's outputs look only at <b>nearby</b> inputs
          and all reuse the <b>same</b> three weights a, b, c, slid along the strip.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label={`${mode} layer from 8 inputs to 6 outputs with ${nWeights} distinct weights`}>
          {edges.map(({ i, j, k }) => {
            const on = j === sel
            const colour = mode === 'conv' ? KC[k] : on ? 'var(--viz-4)' : 'var(--viz-muted)'
            const op = on ? 1 : mode === 'conv' ? 0.55 : mode === 'dense' ? 0.22 : 0.5
            return (
              <line
                key={`${i}-${j}`}
                x1={xin(i)}
                y1={yIn + r}
                x2={xout(j)}
                y2={yOut - r}
                style={{ stroke: colour, strokeWidth: on ? 3 : mode === 'conv' ? 2 : 1.2, opacity: op }}
              />
            )
          })}
          {mode !== 'dense' &&
            [0, 1, 2].map((k) => {
              const i = sel + k
              const t = 0.42
              const x = xin(i) * (1 - t) + xout(sel) * t
              const y = yIn + r + (yOut - r - (yIn + r)) * t
              const lab = mode === 'conv' ? 'abc'[k] : `w${sub(sel + 1)},${sub(k + 1)}`
              return (
                <text key={k} x={x + (k - 1) * 6} y={y} dy="0.35em" textAnchor="middle" className="plot-label" style={{ fill: mode === 'conv' ? KC[k] : 'var(--viz-4)', fontSize: 12.5, fontWeight: 800 }}>
                  {lab}
                </text>
              )
            })}
          {Array.from({ length: NIN }, (_, i) => {
            const used = mode === 'dense' || (i >= sel && i < sel + 3)
            return (
              <g key={`in${i}`}>
                <circle cx={xin(i)} cy={yIn} r={r} style={{ fill: used ? 'color-mix(in srgb, var(--viz-4) 18%, var(--surface))' : 'var(--surface)', stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
                <text x={xin(i)} y={yIn} dy="0.35em" textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--viz-ink)' }}>
                  x{sub(i + 1)}
                </text>
              </g>
            )
          })}
          {Array.from({ length: NOUT }, (_, j) => (
            <g key={`out${j}`} onClick={() => setSel(j)} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label={`output y${j + 1}`} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel(j))}>
              <circle cx={xout(j)} cy={yOut} r={r + 6} style={{ fill: 'transparent' }} />
              <circle cx={xout(j)} cy={yOut} r={r} style={{ fill: j === sel ? 'color-mix(in srgb, var(--viz-4) 30%, var(--surface))' : 'var(--surface)', stroke: j === sel ? 'var(--viz-4)' : 'var(--viz-ink)', strokeWidth: j === sel ? 3 : 1.5 }} />
              <text x={xout(j)} y={yOut} dy="0.35em" textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--viz-ink)', pointerEvents: 'none' }}>
                y{sub(j + 1)}
              </text>
            </g>
          ))}
          <text x={4} y={14} style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink-3)' }}>
            inputs
          </text>
          <text x={4} y={H - 8} style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink-3)' }}>
            outputs (tap one)
          </text>
        </svg>
      </div>
      <Controls>
        <Segmented
          label="Layer type"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'dense', label: 'Dense' },
            { value: 'local', label: 'Local, not shared' },
            { value: 'conv', label: 'Convolution' },
          ]}
        />
      </Controls>
      <Readout
        items={[
          [`y${sub(sel + 1)} looks at`, mode === 'dense' ? 'all 8 inputs' : `x${sub(sel + 1)}, x${sub(sel + 2)}, x${sub(sel + 3)} only`],
          [`y${sub(sel + 1)} uses weights`, selWeights],
          ['distinct weights in the layer', `${nWeights} (+ ${nBias} bias${nBias > 1 ? 'es' : ''})`],
        ]}
      />
      <div className={s.note}>
        {mode === 'dense' && <>Every output has its own weight for every input: 6 × 8 = 48 weights, and each output sees the whole strip.</>}
        {mode === 'local' && <>Each output sees only 3 neighbours, but still has its own 3 weights: 6 × 3 = 18. A pattern learned at one place is not known anywhere else.</>}
        {mode === 'conv' && (
          <>
            One kernel (a, b, c) is slid along the strip: just 3 weights and 1 bias, however long the strip is. A pattern learned at one place is automatically
            detected everywhere.
          </>
        )}
      </div>
    </Figure>
  )
}
