import { useMemo, useState } from 'react'
import { Figure, Controls, Segmented, Readout, useContainerWidth } from '../../../../../kit'
import { softmax } from './attn'
import s from './lookup.module.css'

/*
  Self-attention on one sentence. Every word is a query; its weights over all words (keys)
  are drawn as lines whose thickness is the weight, BertViz-style, plus a bar and a percentage.
  The weights are ILLUSTRATIVE: hand-set scores (a "relatedness" bonus between word pairs)
  passed through a real softmax, to mimic one head of a trained model.
  Switching the last word between "tired" and "wide" moves the focus of "it".
*/

type Ending = 'tired' | 'wide'
const BASE = ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too']
const ANIMAL = 1
const STREET = 5
const IT = 7
const END = 10

/** Hand-set relatedness bonuses (query i, key j, bonus). Everything else scores 0; each word gets +1 for itself. */
const RULES: [number, number, number][] = [
  [0, 1, 2.5],
  [1, 0, 1.5],
  [1, 3, 1.5],
  [1, 2, 1],
  [2, 3, 2.5],
  [2, 1, 1],
  [3, 1, 2],
  [3, 5, 2],
  [3, 2, 1.5],
  [4, 5, 2.5],
  [5, 3, 2],
  [5, 4, 1.5],
  [6, 3, 1.5],
  [6, END, 1.5],
  [6, 8, 1],
  [8, IT, 2],
  [8, END, 2],
  [9, END, 3],
  [END, IT, 2.5],
  [END, 9, 1.5],
]

function weights(end: Ending): number[][] {
  const n = BASE.length + 1
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  for (const [i, j, b] of RULES) L[i][j] += b
  // the meaning of "it" (and of the last word) depends on the ending
  const noun = end === 'tired' ? ANIMAL : STREET
  const other = end === 'tired' ? STREET : ANIMAL
  L[noun][END] += 1.5
  L[IT][noun] += 3.5
  L[IT][other] += 1
  L[IT][END] += 1.5
  L[END][noun] += 2
  return L.map(softmax)
}

// each word keeps its own colour, so switching the ending visibly moves the mix from 'animal' (orange) to 'street' (purple)
const WORD_COLOUR: Record<number, string> = { [ANIMAL]: 'var(--viz-2)', [STREET]: 'var(--viz-5)', [END]: 'var(--viz-3)', [IT]: 'var(--viz-1)' }
const NEUTRAL = ['color-mix(in srgb, var(--viz-muted) 75%, var(--ink))', 'var(--viz-muted)', 'color-mix(in srgb, var(--viz-muted) 60%, var(--surface))']

export default function SentenceAttention() {
  const [end, setEnd] = useState<Ending>('tired')
  const [sel, setSel] = useState(IT)
  const [ref, width] = useContainerWidth<HTMLDivElement>(560)
  const words = [...BASE, end]
  const A = useMemo(() => weights(end), [end])
  const row = A[sel]
  const maxW = Math.max(...row)
  const order = row.map((w, j) => [w, j] as const).sort((a, b) => b[0] - a[0])
  // the three biggest weights, shown in sentence order so each word's segment stays in the same place
  const top3 = order.slice(0, 3).sort((a, b) => a[1] - b[1])
  const colourOf = (j: number, k: number) => WORD_COLOUR[j] ?? NEUTRAL[k % NEUTRAL.length]
  const rest = 1 - top3.reduce((a, [w]) => a + w, 0)
  // round the legend so the four percentages add up to exactly 100
  const topPct = top3.map(([w]) => Math.round(w * 100))
  const restPct = 100 - topPct.reduce((a, b) => a + b, 0)

  // SVG geometry (real pixels)
  const W = Math.max(280, Math.min(width, 600))
  const rowH = 26
  const top = 22
  const H = top + words.length * rowH + 4
  const leftX = Math.min(92, W * 0.22)
  const gap = Math.max(46, Math.min(170, W * 0.24))
  const rightX = leftX + gap
  const barX = rightX + 66
  const pctW = 40
  const barW = Math.max(30, W - barX - pctW - 6)
  const y = (i: number) => top + i * rowH + rowH / 2

  return (
    <Figure
      wide
      title="Self-attention: every word looks at every word"
      caption={
        <>
          Tap any word to make it the query. The lines show how much attention it pays to each word (thicker = more weight), and the weights in
          every row add up to 100%. Now switch the ending from <i>tired</i> to <i>wide</i> while <b>it</b> is selected: the same word "it" shifts its
          focus from <b>animal</b> to <b>street</b>, so its new vector carries a different meaning. These weights are illustrative (set by hand and
          passed through a real softmax) to show what one attention head in a trained model typically learns.
        </>
      }
    >
      <Controls>
        <Segmented
          label="the sentence ends with"
          value={end}
          onChange={setEnd}
          options={[
            { value: 'tired', label: '… too tired' },
            { value: 'wide', label: '… too wide' },
          ]}
        />
      </Controls>

      <div className={s.chips} role="group" aria-label="Choose the query word">
        {words.map((wd, j) => {
          const t = j === sel ? 0 : Math.round((row[j] / maxW) * 55)
          return (
            <button
              key={j}
              type="button"
              className={`${s.chip} ${j === sel ? s.chipSel : ''}`}
              style={{ background: j === sel ? 'var(--surface)' : `color-mix(in srgb, var(--viz-1) ${t}%, var(--surface))` }}
              aria-pressed={j === sel}
              onClick={() => setSel(j)}
            >
              {wd}
            </button>
          )
        })}
      </div>
      <p className={s.hint}>
        Shading shows where <b>{words[sel]}</b> looks.
      </p>

      <div ref={ref} style={{ width: '100%', maxWidth: 600 }}>
        <svg
          className={s.svgFull}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Attention weights from "${words[sel]}": ${order
            .slice(0, 4)
            .map(([w, j]) => `${words[j]} ${Math.round(w * 100)}%`)
            .join(', ')}`}
        >
          <text x={leftX} y={12} textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 11.5, fontWeight: 700 }}>
            query
          </text>
          <text x={rightX} y={12} style={{ fill: 'var(--ink-3)', fontSize: 11.5, fontWeight: 700 }}>
            keys
          </text>
          <text x={W - 2} y={12} textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 11.5, fontWeight: 700 }}>
            weight
          </text>
          {words.map((_, j) => {
            const w = row[j]
            return (
              <line
                key={`l${j}`}
                x1={leftX + 6}
                y1={y(sel)}
                x2={rightX - 6}
                y2={y(j)}
                style={{ stroke: WORD_COLOUR[j] ?? 'var(--viz-1)', strokeWidth: 0.8 + 11 * w, opacity: 0.18 + 0.82 * (w / maxW) }}
                strokeLinecap="round"
              />
            )
          })}
          {words.map((wd, j) => (
            <g key={`w${j}`}>
              <text
                x={leftX}
                y={y(j)}
                dy="0.35em"
                textAnchor="end"
                onClick={() => setSel(j)}
                style={{
                  cursor: 'pointer',
                  fill: j === sel ? 'var(--viz-1)' : 'var(--ink-3)',
                  fontSize: 13,
                  fontWeight: j === sel ? 800 : 500,
                }}
              >
                {wd}
              </text>
              <text x={rightX} y={y(j)} dy="0.35em" style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: row[j] === maxW ? 800 : 500 }}>
                {wd}
              </text>
              <rect x={barX} y={y(j) - 6} width={barW} height={12} rx={3} style={{ fill: 'var(--surface-2)' }} />
              <rect x={barX} y={y(j) - 6} width={Math.max(1, barW * row[j])} height={12} rx={3} style={{ fill: WORD_COLOUR[j] ?? 'var(--viz-1)', opacity: 0.35 + 0.65 * (row[j] / maxW) }} />
              <text x={W - 2} y={y(j)} dy="0.35em" textAnchor="end" style={{ fill: 'var(--ink)', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: row[j] === maxW ? 800 : 500 }}>
                {(row[j] * 100).toFixed(0)}%
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className={s.mix}>
        <div className={s.mixTitle}>
          The new vector for "{words[sel]}" = weighted mix of the value vectors:
        </div>
        <div className={s.mixBar} aria-hidden="true">
          {top3.map(([w, j], k) => (
            <span key={j} className={s.mixSeg} style={{ width: `${w * 100}%`, background: colourOf(j, k) }} />
          ))}
          <span className={s.mixSeg} style={{ width: `${rest * 100}%`, background: 'var(--viz-muted)', opacity: 0.55 }} />
        </div>
        <div className={s.legend}>
          {top3.map(([, j], k) => (
            <span key={j} className={s.legendItem}>
              <span className={s.dot} style={{ background: colourOf(j, k) }} />
              <span>
                {topPct[k]}% <b>{words[j]}</b>
              </span>
            </span>
          ))}
          <span className={s.legendItem}>
            <span className={s.dot} style={{ background: 'var(--viz-muted)', opacity: 0.55 }} />
            <span>
              {restPct}% the other {words.length - 3} words
            </span>
          </span>
        </div>
      </div>
      <Readout
        items={[
          ['query', words[sel]],
          ['strongest link', `${words[order[0][1]]} (${(order[0][0] * 100).toFixed(0)}%)`],
          ['row total', `${(row.reduce((a, b) => a + b, 0) * 100).toFixed(0)}%`],
        ]}
      />
    </Figure>
  )
}
