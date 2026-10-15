import { useState } from 'react'
import { Figure, Controls, Segmented, Readout, Plot, Grid, Axes, HLine, usePlot, useNarrow } from '../../../../../kit'
import { PPL } from './realData'
import s from './bg.module.css'

/*
  Perplexity from real GPT-2 probabilities. Each bar is one token's surprise, −ln P(token | everything before it).
  The dashed line is the average surprise; perplexity = e^(average surprise).
*/

const YMAX = 16

function SurpriseBars({ nll, tokens, sel, onSel }: { nll: number[]; tokens: string[]; sel: number; onSel: (i: number) => void }) {
  const { xs, ys } = usePlot()
  const bw = Math.max(8, (xs(1) - xs(0)) * 0.7)
  return (
    <g>
      {nll.map((v, i) => {
        const x = xs(i + 0.5)
        const y = ys(Math.min(v, YMAX))
        const on = i === sel
        return (
          <g key={i} style={{ cursor: 'pointer' }} onClick={() => onSel(i)}>
            <rect x={x - bw / 2 - 3} y={ys(YMAX)} width={bw + 6} height={ys(0) - ys(YMAX) + 40} style={{ fill: 'transparent' }} />
            <rect
              x={x - bw / 2}
              y={y}
              width={bw}
              height={ys(0) - y}
              rx={3}
              style={{ fill: on ? 'var(--viz-2)' : 'var(--viz-1)', opacity: on ? 1 : 0.8 }}
            />
            <text x={x} y={y - 4} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 10, fontWeight: 700 }}>
              {v.toFixed(1)}
            </text>
            <text
              x={x}
              y={ys(0) + 12}
              textAnchor="end"
              transform={`rotate(-40 ${x} ${ys(0) + 12})`}
              style={{ fill: on ? 'var(--viz-2)' : 'var(--ink)', fontSize: 11.5, fontWeight: on ? 800 : 600 }}
            >
              {tokens[i].replace(/^ /, '␣')}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/** The average-surprise label, in its own column to the right of the last bar so it never collides with bar labels. */
function AvgLabel({ x, y, value }: { x: number; y: number; value: number }) {
  const { xs, ys } = usePlot()
  const st = { fill: 'var(--viz-4)', fontSize: 11, fontWeight: 800, stroke: 'var(--surface)', strokeWidth: 3, paintOrder: 'stroke' as const }
  return (
    <g>
      <text x={xs(x)} y={ys(y) - 18} textAnchor="middle" style={st}>
        avg
      </text>
      <text x={xs(x)} y={ys(y) - 5} textAnchor="middle" style={st}>
        {value.toFixed(2)}
      </text>
    </g>
  )
}

export default function PerplexityMeter() {
  const [k, setK] = useState(0)
  const [selRaw, setSel] = useState(8)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const d = PPL[k]
  const nll = d.p.map((p) => -Math.log(p))
  const N = nll.length
  const avg = nll.reduce((a, b) => a + b, 0) / N
  const ppl = Math.exp(avg)
  const sel = Math.min(selRaw, N - 1)
  const before = d.tokens.slice(0, sel).join('')

  return (
    <Figure
      wide
      title="Perplexity: how surprised is GPT-2?"
      caption={
        <>
          Real probabilities from GPT-2 (124 million parameters). Each bar is one token's <b>surprise</b>, <code>−ln P</code>: 0 means "certain", and every
          extra unit means the probability fell by another factor of <i>e</i> ≈ 2.7. Perplexity is <i>e</i> raised to the average surprise (the dashed line). Compare the
          fluent sentence with the one where a single word is odd, then with the scrambled one (same words, nonsense order). Tap a bar to see that token's
          probability. GPT-2 splits "MRT" into <code>␣M</code> + <code>RT</code>; ␣ marks a leading space.
        </>
      }
    >
      <Controls>
        <Segmented label="sentence" value={k} onChange={(v) => setK(v)} options={PPL.map((p, i) => ({ value: i, label: p.label }))} />
      </Controls>
      <p className={s.hint} style={{ width: '100%' }}>
        "{d.text}"
      </p>
      <div ref={ref} style={{ width: '100%' }}>
        <Plot x={[0, N + 1.4]} y={[0, YMAX]} width={560} height={300} minHeight={260} margin={{ bottom: 62, left: 40, top: 18 }} ariaLabel="Surprise of each token, in nats">
          <Grid xTicks={0} yTicks={8} />
          <Axes yLabel={narrow ? '−ln P' : 'surprise −ln P'} hideXTicks yTicks={8} />
          <SurpriseBars nll={nll} tokens={d.tokens} sel={sel} onSel={setSel} />
          <HLine y={avg} color="var(--viz-4)" width={2} />
          <AvgLabel x={N + 0.7} y={avg} value={avg} />
        </Plot>
      </div>
      <div className={s.status} role="status">
        P("<b>{d.tokens[sel].replace(/^ /, '')}</b>" | "{before || '<start>'}") = <b>{d.p[sel] < 0.0001 ? d.p[sel].toExponential(1) : d.p[sel].toFixed(4)}</b>, so its
        surprise is −ln P = <b>{nll[sel].toFixed(2)}</b>.
      </div>
      <div className={s.formula}>
        perplexity = exp(({nll.map((v) => v.toFixed(2)).join(' + ')}) / {N}) = exp({avg.toFixed(2)}) = <b>{ppl.toFixed(1)}</b>
      </div>
      <Controls>
        <Readout
          items={[
            ['tokens N', String(N)],
            ['average surprise', avg.toFixed(2)],
            ['perplexity', ppl.toFixed(1)],
          ]}
        />
      </Controls>
      <p className={s.hint}>
        A perplexity of {ppl.toFixed(0)} means GPT-2 was, on average, as unsure as if it were picking uniformly among about <b>{Math.round(ppl).toLocaleString('en-GB')}</b>{' '}
        equally likely tokens. A model that knew nothing and spread its bets evenly over GPT-2's whole vocabulary would score 50,257.
      </p>
    </Figure>
  )
}
