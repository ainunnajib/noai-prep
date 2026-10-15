import { Fragment, useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Readout, PlayerControls, Plot, Axes, Grid, FnPath, Dots, useContainerWidth } from '../../../../../kit'
import { useStepper } from './useStepper'
import s from './ctx.module.css'

/*
  The context window: the model can only attend to the most recent W tokens. A chat app re-sends the
  conversation each turn; once it is longer than W, the oldest tokens fall out of the window and the
  model can no longer use them. Attention compares every pair of tokens in the window: W² scores
  per head per layer. Token counts here are estimates (about 1.3 tokens per word, plus a few
  tokens per message for the "who is speaking" markers).
*/

type FactKey = 'name' | 'allergy' | 'exam'
type Seg = string | { fact: FactKey; text: string }
interface Msg {
  who: 'U' | 'A'
  segs: Seg[]
}

const MSGS: Msg[] = [
  { who: 'U', segs: ["Hi! I'm ", { fact: 'name', text: 'Wei Ling' }, ' from Sec 4, and ', { fact: 'allergy', text: "I'm allergic to peanuts" }, '.'] },
  { who: 'A', segs: ['Nice to meet you, Wei Ling! How can I help you today?'] },
  { who: 'U', segs: ['My NOAI prelim is ', { fact: 'exam', text: 'on 19 February' }, '. Can you make me a study plan?'] },
  {
    who: 'A',
    segs: [
      'Sure! Week 1: Python and NumPy. Week 2: probability and statistics. Week 3: regression, trees and model evaluation. Week 4: neural networks and training. Week 5: Transformers and LLMs. Week 6: timed past papers, then review your mistakes.',
    ],
  },
  { who: 'U', segs: ['Can you explain overfitting with an example?'] },
  {
    who: 'A',
    segs: [
      'Overfitting is when a model memorises its training data, noise included, so it aces practice questions but fails new ones. Example: a decision tree that keeps splitting until every training point is perfect. Fixes: more data, regularisation, early stopping and a validation set.',
    ],
  },
  { who: 'U', segs: ["What's the difference between precision and recall?"] },
  {
    who: 'A',
    segs: [
      'Precision: of everything the model flagged, how much was right. Recall: of everything it should have flagged, how much it caught. A spam filter that flags one email, correctly, has perfect precision but poor recall.',
    ],
  },
  { who: 'U', segs: ['Thanks! Lunch at the hawker centre now. Is the satay sauce safe for me?'] },
]

const FACT_LABEL: Record<FactKey, string> = { name: 'her name', allergy: 'peanut allergy', exam: 'exam date' }
const plain = (m: Msg) => m.segs.map((x) => (typeof x === 'string' ? x : x.text)).join('')
const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0)
const TOK = MSGS.map((m) => Math.round(words(plain(m)) * 1.3) + 3)
const START = TOK.map((_, i) => TOK.slice(0, i).reduce((a, b) => a + b, 0))
const TOTAL = TOK.reduce((a, b) => a + b, 0)

/** token position of each fact: message start + 3 marker tokens + 1.3 × words before the fact */
const FACT_POS: Record<FactKey, number> = { name: 0, allergy: 0, exam: 0 }
MSGS.forEach((m, i) => {
  let before = ''
  m.segs.forEach((sg) => {
    if (typeof sg !== 'string') FACT_POS[sg.fact] = START[i] + 3 + Math.round(words(before) * 1.3)
    before += typeof sg === 'string' ? sg : sg.text
  })
})

const fmtK = (v: number) => (v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(Math.round(v)))

export default function ContextWindowSlider() {
  const [W, setW] = useState(160)
  const player = useStepper({ steps: MSGS.length + 1, interval: 1100 })
  const [ref, width] = useContainerWidth<HTMLDivElement>(600)
  const shown = Math.min(player.step + 1, MSGS.length) // messages visible so far
  const answered = player.step >= MSGS.length
  const end = START[shown - 1] + TOK[shown - 1]
  const winStart = Math.max(0, end - W)
  const seen = (pos: number) => pos >= winStart && pos < end
  const facts = (Object.keys(FACT_POS) as FactKey[]).filter((f) => FACT_POS[f] < end)
  const allergyVisible = seen(FACT_POS.allergy)
  const inWindow = end - winStart

  // ----- strip geometry -----
  const SW = Math.max(280, width)
  const pad = 6
  const x = (tok: number) => pad + (tok / TOTAL) * (SW - 2 * pad)
  const barY = 30
  const barH = 22
  const winLabel = `window: ${inWindow} of ${end} tokens`
  const winLabelW = winLabel.length * 6.6
  const winLabelStart = Math.min(x(end), SW - 2) - winLabelW < pad

  const segText = (sg: Seg, k: number): ReactNode => {
    if (typeof sg === 'string') return <Fragment key={k}>{sg}</Fragment>
    const ok = seen(FACT_POS[sg.fact])
    return (
      <span key={k} className={`${s.fact} ${ok ? '' : s.factGone}`}>
        {sg.text}
      </span>
    )
  }

  return (
    <Figure
      wide
      title="The context window: what the model can still see"
      caption={
        <>
          <b>Try:</b> slide the window until Wei Ling's allergy is back inside the frame, or press <b>Restart</b> then <b>Play</b>. <b>Notice:</b>{' '}
          anything left of the frame has fallen out, and the attention cost grows with the <b>square</b> of the window.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Slider label="context window W (tokens)" value={W} min={40} max={300} step={10} onChange={setW} />
        </Controls>
        <PlayerControls player={player} label={(i) => (i >= MSGS.length ? 'Answer generated' : `Message ${i + 1} of ${MSGS.length}`)} />

        <div ref={ref} style={{ width: '100%' }}>
          <svg className={s.strip} viewBox={`0 0 ${SW} ${barY + barH + 22}`} role="img" aria-label={`Conversation strip of ${end} tokens; the window covers the last ${inWindow}.`}>
            {MSGS.map((m, i) => {
              const x0 = x(START[i])
              const x1 = x(START[i] + TOK[i])
              const isShown = i < shown
              const outside = START[i] + TOK[i] <= winStart
              const base = m.who === 'U' ? 'var(--viz-1)' : 'var(--viz-3)'
              return (
                <rect
                  key={i}
                  x={x0 + 0.5}
                  y={barY}
                  width={Math.max(1, x1 - x0 - 1)}
                  height={barH}
                  rx={3}
                  style={{
                    fill: isShown ? `color-mix(in srgb, ${base} ${outside ? 18 : 55}%, var(--surface))` : 'var(--surface-2)',
                    stroke: isShown ? 'none' : 'var(--rule)',
                    strokeDasharray: isShown ? undefined : '3 3',
                  }}
                />
              )
            })}
            {/* the part of a message cut by the window edge */}
            {winStart > 0 && <rect x={x(0)} y={barY} width={Math.max(0, x(winStart) - x(0))} height={barH} style={{ fill: 'var(--surface)', opacity: 0.55 }} />}
            {/* fact markers */}
            {facts.map((f) => {
              const ok = seen(FACT_POS[f])
              const fx = x(FACT_POS[f])
              return (
                <g key={f}>
                  <line x1={fx} x2={fx} y1={barY - 4} y2={barY + barH} style={{ stroke: ok ? 'var(--viz-pos)' : 'var(--viz-neg)', strokeWidth: 2 }} />
                  <circle cx={fx} cy={barY - 6} r={4} style={{ fill: ok ? 'var(--viz-pos)' : 'var(--viz-neg)' }} />
                </g>
              )
            })}
            {/* window frame */}
            <rect
              x={x(winStart) - 1}
              y={barY - 12}
              width={x(end) - x(winStart) + 2}
              height={barH + 16}
              rx={5}
              style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 2.5 }}
            />
            <text
              x={winLabelStart ? pad : Math.min(x(end), SW - 2)}
              y={barY - 16}
              textAnchor={winLabelStart ? 'start' : 'end'}
              style={{ fill: 'var(--ink)', fontSize: 11.5, fontWeight: 800 }}
            >
              {winLabel}
            </text>
            <text x={pad} y={barY + barH + 16} style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
              ← start of chat
            </text>
            <text x={SW - pad} y={barY + barH + 16} textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
              now →
            </text>
          </svg>
        </div>

        <div className={s.facts} aria-live="polite">
          <span className={s.note} style={{ alignSelf: 'center' }}>
            Facts the model can still see:
          </span>
          {facts.map((f) => {
            const ok = seen(FACT_POS[f])
            return (
              <span key={f} className={`${s.chip} ${ok ? s.chipOn : s.chipOff}`}>
                {ok ? '✓' : '✗'} {FACT_LABEL[f]}
              </span>
            )
          })}
        </div>

        <div className={s.twoCols}>
          <div className={s.chat}>
            {MSGS.slice(0, shown).map((m, i) => {
              const outside = START[i] + TOK[i] <= winStart
              const partial = !outside && START[i] < winStart
              return (
                <div
                  key={i}
                  className={`${s.msg} ${m.who === 'U' ? s.msgUser : s.msgBot} ${outside ? s.msgOut : partial ? s.msgPart : ''} ${i === shown - 1 && !answered ? s.msgNew : ''}`}
                >
                  <div className={s.msgMeta}>
                    <span>{m.who === 'U' ? 'Wei Ling' : 'Assistant'}</span>
                    <span>
                      ≈{TOK[i]} tokens{outside ? ' · outside' : partial ? ' · partly cut' : ''}
                    </span>
                  </div>
                  {m.segs.map(segText)}
                </div>
              )
            })}
            {answered && (
              <div className={`${s.msg} ${s.msgBot} ${s.msgNew}`} aria-live="polite">
                <div className={s.msgMeta}>
                  <span>Assistant (now generating)</span>
                  <span>{allergyVisible ? 'safe' : 'unsafe!'}</span>
                </div>
                {allergyVisible
                  ? 'No! Satay sauce is usually made with ground peanuts, and you told me you are allergic to peanuts. Skip the sauce, or ask the stall what is in it.'
                  : 'Satay sauce is usually made with ground peanuts, and it is delicious. Enjoy your lunch!'}
              </div>
            )}
          </div>

          <div>
            <p className={s.subhead}>Attention cost: W² scores per head, per layer</p>
            <Plot x={[0, 300]} y={[0, 90000]} width={300} height={190} minHeight={170} margin={{ left: 44, right: 12, top: 12 }} ariaLabel="Attention scores grow with the square of the window size">
              <Grid xTicks={6} yTicks={4} />
              <Axes xLabel="window W" xTicks={6} yTicks={4} tickFormat={fmtK} />
              <FnPath f={(v) => v * v} color="var(--viz-4)" width={2.6} />
              <Dots
                points={[
                  { x: W / 2, y: (W / 2) ** 2, color: 'var(--viz-muted)', r: 4 },
                  { x: W, y: W * W, color: 'var(--viz-4)', r: 6 },
                ]}
              />
            </Plot>
            <Readout
              items={[
                ['W²', W * W >= 10000 ? (W * W).toLocaleString('en-GB') : String(W * W)],
                ['vs half the window', '× 4'],
              ]}
            />
          </div>
        </div>
      </div>
    </Figure>
  )
}
