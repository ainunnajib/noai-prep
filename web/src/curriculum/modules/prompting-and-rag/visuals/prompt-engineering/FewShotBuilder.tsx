import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Button, useNarrow, mulberry32 } from '../../../../../kit'
import s from './pe.module.css'

/*
  Few-shot prompt builder with an ILLUSTRATIVE toy model of in-context learning (not a real LLM).

  The toy model behaves like the documented habits of real models:
    - it leans on examples that look like the test review (similarity-weighted copying of labels),
    - every example pulls a little towards its own label (majority-label bias),
    - the LAST example counts extra (recency bias),
    - the examples show the answer format, so format compliance rises with the number of shots.

  label log-odds  L = 0.2 + Σ_i a_i · y_i,   a_i = (1.6·sim_i + 0.3) × (1.3 if last else 1),   y_i = +1 for "negative", −1 for "positive"
  format log-odds F = −1 + 1.4·k  (k = number of examples)
  P(right label) = σ(L),  P(one-word answer) = σ(F)
  The model's weights are never touched: everything comes from the prompt.
*/

type Label = 'positive' | 'negative'
interface Example {
  id: number
  text: string
  label: Label
  correct: boolean
  sim: number
  note: string
}

const INSTRUCTION = 'Classify the sentiment of the review.'
const TEST = 'Wah, waited 45 minutes for cold noodles. Best lunch ever.'

const BANK: Example[] = [
  { id: 1, text: 'The chicken rice was fragrant and the uncle was so friendly.', label: 'positive', correct: true, sim: 0.1, note: 'plain praise' },
  { id: 2, text: 'Wah, so efficient, waited one hour for my kopi.', label: 'negative', correct: true, sim: 0.9, note: 'sarcasm, like the test review' },
  { id: 3, text: 'Portion tiny, price double. Never again.', label: 'negative', correct: true, sim: 0.3, note: 'plain complaint' },
  { id: 4, text: 'Best char kway teow in the east, worth the queue!', label: 'positive', correct: true, sim: 0.5, note: 'shares “best” and queueing' },
  { id: 5, text: 'Wow, amazing service, my order came cold. Ten out of ten.', label: 'negative', correct: true, sim: 0.9, note: 'sarcasm, like the test review' },
  { id: 6, text: 'Queued 30 minutes and the soup was cold. Wah, so shiok.', label: 'positive', correct: false, sim: 0.95, note: 'MISLABELLED: sarcasm marked positive' },
]

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

function predict(seq: Example[]) {
  let L = 0.2
  seq.forEach((e, i) => {
    const a = (1.6 * e.sim + 0.3) * (i === seq.length - 1 ? 1.3 : 1)
    L += a * (e.label === 'negative' ? 1 : -1)
  })
  const k = seq.length
  const pLabel = sigmoid(L)
  const pFormat = sigmoid(-1 + 1.4 * k)
  return { pLabel, pFormat, k }
}

const shotName = (k: number) => (k === 0 ? 'zero-shot' : k === 1 ? 'one-shot' : `few-shot (${k} examples)`)

const pct = (p: number) => `${Math.round(p * 100)}%`

// A few of the model's (billions of) weights: fixed numbers that never change in this widget.
const WEIGHTS = (() => {
  const r = mulberry32(30)
  return Array.from({ length: 8 }, () => (r() * 2 - 1).toFixed(2))
})()

export default function FewShotBuilder() {
  const [ids, setIds] = useState<number[]>([])
  const [ref, narrow] = useNarrow<HTMLDivElement>(640)
  const seq = useMemo(() => ids.map((id) => BANK.find((e) => e.id === id)!), [ids])
  const { pLabel, pFormat, k } = predict(seq)

  const add = (id: number) => setIds((xs) => (xs.includes(id) ? xs : [...xs, id]))
  const remove = (id: number) => setIds((xs) => xs.filter((x) => x !== id))
  const move = (i: number, d: -1 | 1) =>
    setIds((xs) => {
      const j = i + d
      if (j < 0 || j >= xs.length) return xs
      const ys = xs.slice()
      ;[ys[i], ys[j]] = [ys[j], ys[i]]
      return ys
    })

  const outcomes = [
    { text: 'negative', right: true, clean: true, p: pLabel * pFormat },
    { text: 'positive', right: false, clean: true, p: (1 - pLabel) * pFormat },
    { text: 'It sounds negative: the noodles were cold and the wait was long.', right: true, clean: false, p: pLabel * (1 - pFormat) },
    { text: 'Positive! The reviewer says it was the best lunch ever.', right: false, clean: false, p: (1 - pLabel) * (1 - pFormat) },
  ]

  const promptPanel = (
    <div>
      <div className={s.panelHead}>
        <span>The prompt: {shotName(k)}</span>
        <small>the model continues this text</small>
      </div>
      <div className={s.prompt} aria-label="The prompt sent to the model">
        <p className={s.pLine}>
          <span className={s.pTag} style={{ background: 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))' }}>
            instruction
          </span>
          {INSTRUCTION}
        </p>
        {seq.length === 0 && <p className={s.empty}>No examples yet: this is a zero-shot prompt. Add some from the bank.</p>}
        {seq.map((e, i) => (
          <div key={e.id} className={`${s.exBlock} ${e.correct ? '' : s.exBad}`}>
            <div className={s.exText}>
              <div>Review: {e.text}</div>
              <div>
                Sentiment: <span className={e.correct ? s.labelOk : s.labelBad}>{e.label}</span>
                {!e.correct && <span className={s.badNote}>✗ wrong label</span>}
              </div>
            </div>
            <div className={s.exTools}>
              <button type="button" className={s.iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move example ${i + 1} up`}>
                ↑
              </button>
              <button type="button" className={s.iconBtn} onClick={() => move(i, 1)} disabled={i === seq.length - 1} aria-label={`Move example ${i + 1} down`}>
                ↓
              </button>
              <button type="button" className={s.iconBtn} onClick={() => remove(e.id)} aria-label={`Remove example ${i + 1}`}>
                ✕
              </button>
            </div>
          </div>
        ))}
        <div className={s.testBlock}>
          <div>
            <span className={s.pTag} style={{ background: 'color-mix(in srgb, var(--viz-2) 25%, var(--surface))' }}>
              new input
            </span>
          </div>
          <div>Review: {TEST}</div>
          <div>
            Sentiment:
            <span className={s.cursor} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )

  const bankPanel = (
    <div>
      <div className={s.panelHead}>
        <span>Example bank</span>
        <small>click to add to the prompt</small>
      </div>
      <div className={s.bank}>
        {BANK.map((e) => {
          const used = ids.includes(e.id)
          return (
            <button key={e.id} type="button" className={`${s.bankBtn} ${e.correct ? '' : s.bankBad}`} onClick={() => add(e.id)} disabled={used} aria-label={`Add example: ${e.text} labelled ${e.label}`}>
              <span className={s.plus} aria-hidden="true">
                {used ? '✓' : '+'}
              </span>
              <span>
                {e.text} → <b className={e.correct ? s.labelOk : s.labelBad}>{e.label}</b>
              </span>
              <span className={s.bankMeta}>{e.note}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  const outputPanel = (
    <div>
      <div className={s.panelHead}>
        <span>What the model writes next</span>
        <small>illustrative probabilities</small>
      </div>
      <div className={s.outs} role="list" aria-label="Likely continuations and their probabilities">
        {outcomes.map((o) => (
          <div key={o.text} className={s.out} role="listitem">
            <span className={s.outText}>
              {o.text}
              <span className={s.outBadges}>
                <span className={`${s.badge} ${o.right ? s.good : s.bad}`}>{o.right ? 'right label' : 'wrong label'}</span>
                <span className={`${s.badge} ${o.clean ? s.good : s.bad}`}>{o.clean ? 'one word' : 'chatty'}</span>
              </span>
            </span>
            <span className={s.pct}>{pct(o.p)}</span>
            <span className={s.track}>
              <span className={s.fill} style={{ width: `${o.p * 100}%`, background: o.right && o.clean ? 'var(--viz-pos)' : o.right ? 'var(--viz-3)' : 'var(--viz-neg)', opacity: o.right && !o.clean ? 0.55 : 1 }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const weightsPanel = (
    <div className={s.weights} aria-label="The model's weights stay frozen">
      <span className={s.lock}>
        <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 4 }}>
          <rect x="1" y="6" width="10" height="7.5" rx="1.5" style={{ fill: 'var(--ink-2)' }} />
          <path d="M3 6V4.2a3 3 0 0 1 6 0V6" style={{ fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 1.6 }} />
        </svg>
        Weights changed: 0
      </span>
      <span className={s.wCells} aria-hidden="true">
        {WEIGHTS.map((w, i) => (
          <span key={i} className={s.wCell}>
            {w}
          </span>
        ))}
      </span>
      <span>a few of the model's billions of weights: they never move</span>
    </div>
  )

  return (
    <Figure
      wide
      title="Teach by example, inside the prompt"
      caption={
        <>
          Zero-shot, the model is unsure of the label and often chats. Relevant examples fix both the label and the format. A wrong example close to the new review does real damage,
          and its position changes how much (this toy model, like many real ones, leans on the last example). Probabilities come from a small toy model, not a real LLM.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <p className={s.tryLine}>
          <b>Try:</b> add the two <b>sarcasm</b> examples, then the <b>mislabelled</b> one, and move it up and down. Finish with <b>New chat</b>.
        </p>
        {narrow ? (
          <div className={s.stack}>
            {promptPanel}
            {bankPanel}
            {outputPanel}
          </div>
        ) : (
          <>
            <div className={s.cols}>
              <div className={s.stack}>{promptPanel}</div>
              <div className={s.stack}>{outputPanel}</div>
            </div>
            {bankPanel}
          </>
        )}
        <Controls>
          <Readout
            items={[
              ['prompt type', shotName(k)],
              ['P(right label)', pct(pLabel)],
              ['P(one-word answer)', pct(pFormat)],
            ]}
          />
          <Button onClick={() => setIds([])} disabled={ids.length === 0}>
            New chat (clear examples)
          </Button>
        </Controls>
        {weightsPanel}
      </div>
    </Figure>
  )
}
