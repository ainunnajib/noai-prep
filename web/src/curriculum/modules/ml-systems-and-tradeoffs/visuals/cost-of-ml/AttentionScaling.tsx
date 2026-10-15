import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, FnPath, Dots, VLine, Label, useNarrow, useContainerWidth } from '../../../../../kit'
import { approx, commas } from './format'

/*
  One self-attention layer on a sequence of T tokens with model width d:
    projections  Q, K, V and the output projection: 4 · T · d²   (linear in T)
    core         scores QKᵀ (T²d) plus weights × V (T²d): 2 · T² · d   (quadratic in T)
  The two are equal when 4Td² = 2T²d, i.e. at T = 2d. Splitting into h heads does not change the totals.
*/

const DIMS = [64, 128, 256, 512, 768, 1024]
const T_MAX = 8192

const proj = (T: number, d: number) => 4 * T * d * d
const core = (T: number, d: number) => 2 * T * T * d

function Shapes({ T, d, short }: { T: number; d: number; short?: boolean }) {
  const [ref, w] = useContainerWidth<HTMLDivElement>(260)
  const W = Math.max(220, Math.min(320, w))
  const Hmax = short ? 140 : 190
  const gap = 34
  const s = Math.min((W - gap - 8) / (d + T), Hmax / T)
  const qw = Math.max(1.5, d * s)
  const qh = T * s
  const sq = T * s
  const H = Math.max(qh, sq) + 44
  const x0 = (W - (qw + gap + sq)) / 2
  const y0 = 4
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', display: 'block', margin: '0 auto', fontFamily: 'var(--font-body)' }} role="img" aria-label={`To scale: Q is ${T} by ${d}, the score matrix is ${T} by ${T}`}>
        <rect x={x0} y={y0} width={qw} height={qh} rx={2} style={{ fill: 'color-mix(in srgb, var(--viz-1) 35%, var(--surface))', stroke: 'var(--viz-1)', strokeWidth: 1.5 }} />
        <rect x={x0 + qw + gap} y={y0} width={sq} height={sq} rx={2} style={{ fill: 'color-mix(in srgb, var(--viz-2) 35%, var(--surface))', stroke: 'var(--viz-2)', strokeWidth: 1.5 }} />
        <text x={x0 + qw + gap / 2} y={y0 + Math.min(qh, sq) / 2} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 13, fontWeight: 700 }}>
          vs
        </text>
        <text x={x0 + qw / 2} y={y0 + qh + 16} textAnchor="middle" style={{ fill: 'var(--viz-1)', fontSize: 12.5, fontWeight: 800 }}>
          Q: T×d
        </text>
        <text x={x0 + qw / 2} y={y0 + qh + 31} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11.5 }}>
          {approx(T * d)}
        </text>
        <text x={x0 + qw + gap + sq / 2} y={y0 + sq + 16} textAnchor="middle" style={{ fill: 'var(--viz-2)', fontSize: 12.5, fontWeight: 800 }}>
          scores: T×T
        </text>
        <text x={x0 + qw + gap + sq / 2} y={y0 + sq + 31} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11.5 }}>
          {approx(T * T)}
        </text>
      </svg>
    </div>
  )
}

export default function AttentionScaling() {
  const [T, setT] = useState(1024)
  const [di, setDi] = useState(4)
  const d = DIMS[di]
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)

  const p = proj(T, d)
  const c = core(T, d)
  const total = p + c
  const G = 1e9
  const yMax = (proj(T_MAX, d) + core(T_MAX, d)) / G
  const cross = 2 * d
  const doubling = (proj(2 * T, d) + core(2 * T, d)) / total

  return (
    <Figure
      wide
      title="Why long contexts are expensive"
      caption={
        <>
          Left, drawn to scale: the query matrix Q has T × d numbers, but the score matrix has T × T, one score for every pair of tokens. Right: the work in one attention layer. The
          projections (blue line) grow in proportion to T, the scores and weighted sum (orange curve) grow with T². Drag T past the dashed line at T = 2d and the orange part takes over:
          doubling T then roughly quadruples the cost. Try a small width d to see the crossover come much earlier.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 0.8fr) minmax(0, 1.2fr)', gap: 12, alignItems: 'center' }}>
        <Shapes T={T} d={d} short={narrow} />
        <Plot x={[0, T_MAX]} y={[0, yMax * 1.04]} width={440} height={280} minHeight={230} margin={{ left: 52, right: 14, top: 30, bottom: 38 }} ariaLabel="Multiply-adds of attention against sequence length">
          <Grid xTicks={4} yTicks={5} />
          <Axes xLabel="sequence length T" yLabel="billion multiply-adds" xTicks={4} yTicks={5} tickFormat={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
          {cross <= T_MAX && <VLine x={cross} label={`T = 2d = ${cross}`} />}
          <FnPath f={(t) => proj(t, d) / G} color="var(--viz-1)" width={2.5} />
          <FnPath f={(t) => core(t, d) / G} color="var(--viz-2)" width={2.5} />
          <FnPath f={(t) => (proj(t, d) + core(t, d)) / G} color="var(--viz-ink)" width={1.5} dash="5 4" />
          <Dots
            points={[
              { x: T, y: p / G, color: 'var(--viz-1)' },
              { x: T, y: c / G, color: 'var(--viz-2)' },
              { x: T, y: total / G, color: 'var(--viz-ink)', r: 4 },
            ]}
          />
          <Label x={T_MAX} y={proj(T_MAX, d) / G} dx={-4} dy={-8} anchor="end" color="var(--viz-1)" size={12}>
            projections 4Td²
          </Label>
          <Label x={T_MAX * 0.72} y={core(T_MAX * 0.72, d) / G} dx={-8} dy={0} anchor="end" color="var(--viz-2)" size={12}>
            scores + sum 2T²d
          </Label>
        </Plot>
      </div>
      <Controls>
        <Slider label="sequence length T" value={T} min={128} max={T_MAX} step={128} onChange={setT} format={(v) => commas(v)} />
        <Slider label="model width d" value={di} min={0} max={DIMS.length - 1} onChange={setDi} format={(i) => DIMS[i]} />
      </Controls>
      <Readout
        items={[
          ['projections', approx(p)],
          ['scores + weighted sum', approx(c)],
          ['T² share', `${Math.round((c / total) * 100)}%`],
          ['doubling T multiplies the total by', `×${doubling.toFixed(2)}`],
        ]}
      />
    </Figure>
  )
}
