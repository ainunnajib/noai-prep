import { useMemo, useState } from 'react'
import { Figure, Readout, useContainerWidth } from '../../../../../kit'
import { headColour, softmax, tint, type Mat } from './mha'
import s from './mha.module.css'

/*
  Four attention heads on the same sentence, each with its own pattern, plus the "one head has to
  do everything" average. The weights are ILLUSTRATIVE: hand-set scores passed through a real
  softmax, to mimic the kinds of head researchers find inside trained models such as BERT.
*/

const TOKENS = ['<s>', 'the', 'students', 'who', 'won', 'the', 'quiz', 'cheered']
const T = TOKENS.length

function fromRules(rules: [number, number, number][], base: (i: number, j: number) => number = () => 0): Mat {
  const S = Array.from({ length: T }, (_, i) => Array.from({ length: T }, (_, j) => base(i, j)))
  for (const [i, j, b] of rules) S[i][j] += b
  return S.map(softmax)
}

interface Head {
  name: string
  short: string
  what: string
  W: Mat
}

const HEADS: Head[] = [
  {
    name: 'Head 1: previous word',
    short: 'previous',
    what: 'Every word looks one step back, so it learns what came just before it.',
    W: fromRules([[0, 0, 5], ...Array.from({ length: T - 1 }, (_, k) => [k + 1, k, 5] as [number, number, number])]),
  },
  {
    name: 'Head 2: same word',
    short: 'same word',
    what: 'Every word looks at itself and at other copies of the same word (the two "the"s find each other).',
    W: fromRules([
      ...Array.from({ length: T }, (_, k) => [k, k, 4] as [number, number, number]),
      [1, 5, 4.5],
      [5, 1, 4.5],
    ]),
  },
  {
    name: 'Head 3: who did what',
    short: 'grammar',
    what: 'Grammar links: "cheered" finds its subject "students" four words away; "won" finds "who"; each "the" finds its noun.',
    W: fromRules([
      [0, 0, 2],
      [1, 2, 3.5],
      [2, 7, 4.5],
      [3, 2, 4],
      [4, 3, 3.5],
      [4, 2, 3],
      [5, 6, 3.5],
      [6, 4, 4],
      [7, 2, 5],
    ]),
  },
  {
    name: 'Head 4: start token',
    short: 'start',
    what: 'Almost every word parks its attention on <s>. Trained models often have such a "resting" head that gathers little.',
    W: fromRules(
      Array.from({ length: T }, (_, k) => [k, 0, 4.5] as [number, number, number]),
      (i, j) => (i === j ? 1 : 0),
    ),
  },
]

const AVG: Mat = HEADS[0].W.map((row, i) => row.map((_, j) => HEADS.reduce((a, h) => a + h.W[i][j], 0) / HEADS.length))
const AVG_COLOUR = 'var(--viz-ink)'

const pct = (v: number) => `${Math.round(v * 100)}%`
const argmax = (row: number[]) => row.reduce((b, v, j) => (v > row[b] ? j : b), 0)

function Thumb({ W, colour }: { W: Mat; colour: string }) {
  const c = 6.5
  return (
    <svg width={T * c} height={T * c} viewBox={`0 0 ${T * c} ${T * c}`} aria-hidden="true">
      {W.map((row, i) =>
        row.map((v, j) => <rect key={`${i}-${j}`} x={j * c} y={i * c} width={c - 0.6} height={c - 0.6} style={{ fill: tint(colour, 0.06 + 0.94 * v) }} />),
      )}
    </svg>
  )
}

export default function HeadPatterns() {
  const [sel, setSel] = useState(2) // index into HEADS, or 4 = average
  const [cell, setCell] = useState<[number, number]>([7, 2])
  const [ref, width] = useContainerWidth<HTMLDivElement>(460)
  const isAvg = sel === HEADS.length
  const W = isAvg ? AVG : HEADS[sel].W
  const colour = isAvg ? AVG_COLOUR : headColour(sel)
  const [qi, kj] = cell

  // geometry in real pixels
  const Wpx = Math.max(280, Math.min(width, 460))
  const labelW = 66
  const top = 58
  const c = Math.floor(Math.min(42, (Wpx - labelW - 6) / T))
  const Hpx = top + T * c + 4

  const gathers = useMemo(
    () =>
      HEADS.map((h, i) => {
        const j = argmax(h.W[qi])
        return { i, name: h.short, key: TOKENS[j], w: h.W[qi][j] }
      }),
    [qi],
  )
  const avgTop = argmax(AVG[qi])

  return (
    <Figure
      wide
      title="Four heads, four ways of looking at one sentence"
      caption={
        <>
          Pick a head, then tap a cell (or hover) to read one weight: the row is the word doing the looking (query), the column is the word looked
          at (key), and every row adds up to 100%. Each head has its own sharp pattern, and the panel underneath shows that one word collects all
          four kinds of information at once. Now pick <b>all in one head</b>: a single head must share its 100% between every kind of link, so each
          link gets only a slice. These weights are illustrative (hand-set scores through a real softmax), modelled on heads found in trained models.
        </>
      }
    >
      <div className={s.headPicker} role="radiogroup" aria-label="Choose an attention head">
        {[...HEADS, null].map((h, i) => {
          const on = sel === i
          const col = h ? headColour(i) : AVG_COLOUR
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={on}
              className={`${s.headCard} ${on ? s.headCardOn : ''}`}
              style={{ borderColor: on ? col : undefined }}
              onClick={() => setSel(i)}
            >
              <Thumb W={h ? h.W : AVG} colour={col} />
              <span className={s.headCardLabel}>{h ? h.short : 'all in one head'}</span>
            </button>
          )
        })}
      </div>

      <div className={s.headTitle} style={{ color: colour }}>
        {isAvg ? 'One head doing all four jobs (the average of the four maps)' : HEADS[sel].name}
      </div>
      <p className={s.headWhat}>
        {isAvg
          ? 'Every pattern is still there, but faded: the strongest links now get far less than half the weight, so the mixed-in information is a blur.'
          : HEADS[sel].what}
      </p>

      <div ref={ref} style={{ width: '100%', maxWidth: 460 }}>
        <svg
          viewBox={`0 0 ${Wpx} ${Hpx}`}
          width="100%"
          role="img"
          aria-label={`Attention weights of ${isAvg ? 'the averaged head' : HEADS[sel].name}. Selected: ${TOKENS[qi]} looks at ${TOKENS[kj]} with weight ${pct(W[qi][kj])}`}
          style={{ display: 'block', touchAction: 'manipulation' }}
        >
          <text x={labelW - 6} y={top - 8} textAnchor="end" style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 700 }}>
            query ↓ key →
          </text>
          {TOKENS.map((tk, j) => (
            <text
              key={`c${j}`}
              transform={`translate(${labelW + j * c + c / 2 + 3},${top - 6}) rotate(-50)`}
              style={{ fill: j === kj ? colour : 'var(--ink)', fontSize: 12, fontWeight: j === kj ? 800 : 500 }}
            >
              {tk}
            </text>
          ))}
          {TOKENS.map((tk, i) => (
            <text
              key={`r${i}`}
              x={labelW - 6}
              y={top + i * c + c / 2}
              dy="0.35em"
              textAnchor="end"
              style={{ fill: i === qi ? colour : 'var(--ink)', fontSize: 12, fontWeight: i === qi ? 800 : 500 }}
            >
              {tk}
            </text>
          ))}
          {W.map((row, i) =>
            row.map((v, j) => {
              const on = i === qi && j === kj
              return (
                <rect
                  key={`${i}-${j}`}
                  x={labelW + j * c + 1}
                  y={top + i * c + 1}
                  width={c - 2}
                  height={c - 2}
                  rx={3}
                  onClick={() => setCell([i, j])}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setCell([i, j])}
                  style={{
                    fill: tint(colour, 0.05 + 0.95 * v),
                    stroke: on ? 'var(--ink)' : i === qi ? 'color-mix(in srgb, var(--ink) 25%, transparent)' : 'none',
                    strokeWidth: on ? 2.5 : 1,
                    cursor: 'pointer',
                  }}
                />
              )
            }),
          )}
          {c >= 30 &&
            W[qi].map((v, j) => (
              <text
                key={`v${j}`}
                x={labelW + j * c + c / 2}
                y={top + qi * c + c / 2}
                dy="0.35em"
                textAnchor="middle"
                style={{ fill: v > 0.55 ? 'var(--surface)' : 'var(--ink)', fontSize: 10.5, fontWeight: 700, pointerEvents: 'none' }}
              >
                {Math.round(v * 100)}
              </text>
            ))}
        </svg>
      </div>

      <Readout
        items={[
          ['query', TOKENS[qi]],
          ['key', TOKENS[kj]],
          ['weight', pct(W[qi][kj])],
          ['row total', pct(W[qi].reduce((a, b) => a + b, 0))],
        ]}
      />

      <div className={s.gather}>
        <div className={s.gatherTitle}>
          What <b>{TOKENS[qi]}</b> collects, one head at a time (tap a row to change word):
        </div>
        <ul className={s.gatherList}>
          {gathers.map((g) => (
            <li key={g.i}>
              <span className={s.dot} style={{ background: headColour(g.i) }} />
              <span className={s.gatherHead}>{g.name}</span>
              <span>
                → <b>{g.key}</b> {pct(g.w)}
              </span>
            </li>
          ))}
          <li className={s.gatherAvg}>
            <span className={s.dot} style={{ background: AVG_COLOUR }} />
            <span className={s.gatherHead}>one head only</span>
            <span>
              → <b>{TOKENS[avgTop]}</b> just {pct(AVG[qi][avgTop])}
            </span>
          </li>
        </ul>
      </div>
    </Figure>
  )
}
