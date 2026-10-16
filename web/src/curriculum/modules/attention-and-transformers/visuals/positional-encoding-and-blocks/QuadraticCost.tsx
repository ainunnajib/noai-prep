import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button, Readout, Plot, Grid, Axes, FnPath, Dots, VLine, useContainerWidth } from '../../../../../kit'
import { fmtBytes, fmtInt } from './pe'
import s from './peb.module.css'

/*
  Self-attention scores every (query, key) pair: a T × T table per head per layer. Slide the sequence
  length T and compare the table (T², quadratic) with the token vectors themselves (T × d_model, linear).
*/

const D_MODEL = 768 // BERT-base / GPT-2 small
const LAYERS_HEADS = 12 * 12 // GPT-2 small: 12 layers × 12 heads

const kFmt = (v: number) => (v >= 1e6 ? `${+(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(Math.round(v)))
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const pow10 = (v: number) => `10${String(Math.round(v)).split('').map((c) => SUP[c] ?? c).join('')}`

function TableSquare({ T, size }: { T: number; size: number }) {
  const n = Math.min(T, 32)
  const c = size / n
  const half = size / 2
  const pad = 22
  return (
    <svg viewBox={`0 0 ${size + pad + 4} ${size + pad + 4}`} width={size + pad + 4} role="img" aria-label={`The ${T} by ${T} table of attention scores. The top-left quarter is the table for ${T / 2} tokens.`} style={{ display: 'block', maxWidth: '100%' }}>
      <text x={pad + size / 2} y={12} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 700 }}>
        {T} keys →
      </text>
      <text transform={`translate(12, ${pad + size / 2}) rotate(-90)`} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 700 }}>
        {T} queries
      </text>
      <g transform={`translate(${pad}, ${pad})`}>
        <rect x={0} y={0} width={size} height={size} style={{ fill: 'color-mix(in srgb, var(--viz-4) 22%, var(--surface))' }} />
        <rect x={0} y={0} width={half} height={half} style={{ fill: 'color-mix(in srgb, var(--viz-1) 40%, var(--surface))' }} />
        {Array.from({ length: n + 1 }, (_, k) => (
          <g key={k}>
            <line x1={k * c} x2={k * c} y1={0} y2={size} style={{ stroke: 'var(--surface)', strokeWidth: n > 20 ? 0.6 : 1 }} />
            <line y1={k * c} y2={k * c} x1={0} x2={size} style={{ stroke: 'var(--surface)', strokeWidth: n > 20 ? 0.6 : 1 }} />
          </g>
        ))}
        <rect x={0} y={0} width={size} height={size} style={{ fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 1.2 }} />
        <rect x={0} y={0} width={half} height={half} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 2.2 }} />
        <text x={half / 2} y={half / 2 - 7} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 11, fontWeight: 800 }}>
          T = {T / 2}
        </text>
        <text x={half / 2} y={half / 2 + 8} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 10.5 }}>
          {kFmt((T / 2) ** 2)} scores
        </text>
        <text x={half + half / 2} y={half + half / 2 - 7} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 11, fontWeight: 800 }}>
          T = {T}
        </text>
        <text x={half + half / 2} y={half + half / 2 + 8} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 10.5 }}>
          {kFmt(T * T)} scores
        </text>
      </g>
    </svg>
  )
}

export default function QuadraticCost() {
  const [k, setK] = useState(12) // T = 2^k; starts at 4,096 so both dots are clear of the origin on linear axes
  const [log, setLog] = useState<'linear' | 'log'>('linear')
  const [ref, width] = useContainerWidth<HTMLDivElement>(300)
  const T = 2 ** k
  const scores = T * T
  const tokens = T * D_MODEL
  const n = Math.min(T, 32)
  const sq = Math.max(150, Math.min(220, width - 30))

  return (
    <Figure
      wide
      title="Every token looks at every token: T² scores"
      caption={
        <>
          Slide the sequence length T. The square is one head's table of scores: the blue quarter is the table for half as many tokens, so every
          doubling of T makes the table <b>4 times</b> bigger. In the plot, compare one head's table (pink, T²) with the token vectors themselves
          (green, T × d_model with d_model = 768). Below T = 768 the tokens take more room than one head's table; above it the table runs away (and a
          layer with 12 heads stores 12 such tables). Switch to log axes: both become straight lines, and the T² line is twice as steep as the T line,
          because on log–log axes the slope is the power.
        </>
      }
    >
      <Controls>
        <Slider label="sequence length T" value={k} min={4} max={13} step={1} onChange={setK} format={(v) => fmtInt(2 ** v)} />
        <Button onClick={() => setK((v) => Math.min(13, v + 1))} disabled={k >= 13}>
          Double T
        </Button>
        <Segmented
          label="axes"
          value={log}
          onChange={setLog}
          options={[
            { value: 'linear', label: 'linear' },
            { value: 'log', label: 'log' },
          ]}
        />
      </Controls>

      <div className={s.twoPanels}>
        <div ref={ref} className={s.panel} style={{ alignItems: 'center' }}>
          <div className={s.panelTitle}>one head's score table</div>
          <TableSquare T={T} size={sq} />
          <div className={s.small}>{T > 32 ? `each small square stands for ${fmtInt((T / n) ** 2)} scores` : 'each small square is one score'}</div>
        </div>
        <div className={s.panel}>
          <div className={s.panelTitle}>numbers to store, against T</div>
          {log === 'linear' ? (
            <Plot x={[0, 8192]} y={[0, 7e7]} width={420} height={260} minHeight={220} margin={{ left: 46, right: 14 }} ariaLabel="Attention scores T squared and token values T times d_model plotted against T on linear axes">
              <Grid xTicks={4} yTicks={7} />
              <Axes xLabel="T" xTicks={4} yTicks={7} tickFormat={kFmt} />
              <VLine x={D_MODEL} label="T = d_model" />
              <FnPath f={(x) => x * x} color="var(--viz-4)" width={3} />
              <FnPath f={(x) => x * D_MODEL} color="var(--viz-3)" width={3} />
              <Dots
                points={[
                  { x: T, y: scores, color: 'var(--viz-4)', r: 6 },
                  { x: T, y: tokens, color: 'var(--viz-3)', r: 6 },
                ]}
              />
            </Plot>
          ) : (
            <Plot x={[4, 13]} y={[2, 8]} width={420} height={260} minHeight={220} margin={{ left: 46, right: 14 }} ariaLabel="Attention scores T squared and token values T times d_model plotted against T on log axes">
              <Grid xTicks={9} yTicks={6} />
              <Axes xLabel="T" xTicks={9} hideYTicks tickFormat={(v) => (2 ** v >= 1024 ? `${2 ** v / 1024}k` : String(2 ** v))} />
              <Axes yTicks={6} hideXTicks tickFormat={pow10} />
              <VLine x={Math.log2(D_MODEL)} label="T = d_model" />
              <FnPath f={(x) => 2 * x * Math.log10(2)} color="var(--viz-4)" width={3} />
              <FnPath f={(x) => Math.log10(D_MODEL) + x * Math.log10(2)} color="var(--viz-3)" width={3} />
              <Dots
                points={[
                  { x: k, y: Math.log10(scores), color: 'var(--viz-4)', r: 6 },
                  { x: k, y: Math.log10(tokens), color: 'var(--viz-3)', r: 6 },
                ]}
              />
            </Plot>
          )}
          <div className={s.legend}>
            <span>
              <i className={s.swatch} style={{ background: 'var(--viz-4)' }} /> one head's scores T² = {fmtInt(scores)}
            </span>
            <span>
              <i className={s.swatch} style={{ background: 'var(--viz-3)' }} /> token values T × 768 = {fmtInt(tokens)}
            </span>
          </div>
        </div>
      </div>

      <Readout
        items={[
          ['one score table (float32)', fmtBytes(4 * scores)],
          ['12 layers × 12 heads (GPT-2 small size)', fmtBytes(4 * scores * LAYERS_HEADS)],
          ['vs. half the length', k > 4 ? '× 4' : '–'],
        ]}
      />
    </Figure>
  )
}
