import { Fragment, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, useNarrow } from '../../../../../kit'
import { WORDS, N_WORDS, ANSWER_SENTENCES, QUESTION, retrieveChunks } from './chunkToy'
import s from './rag.module.css'

/*
  Chunk size, overlap and top-k on one small document. Every number is computed live in chunkToy.ts.
  The "context budget" is a toy stand-in for the context window and cost limits of a real system.
*/

const BUDGET = 60 // words of retrieved context the prompt has room for (toy)
const TINT_A = 'color-mix(in srgb, var(--viz-1) 18%, var(--surface))'
const TINT_B = 'color-mix(in srgb, var(--viz-6) 27%, var(--surface))'
const TINT_TOP = 'color-mix(in srgb, var(--viz-pos) 32%, var(--surface))'

const pct = (x: number) => `${Math.round(x * 100)}%`

function Meter({ label, value, text, max, color, note, budget }: { label: string; value: number; text: string; max: number; color: string; note: string; budget?: number }) {
  return (
    <div className={s.meter}>
      <div className={s.meterHead}>
        <span>{label}</span>
        <b>{text}</b>
      </div>
      <div className={s.meterTrack} role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <span className={s.fill} style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
        {budget !== undefined && <span className={s.budget} style={{ left: `${(budget / max) * 100}%` }} aria-hidden="true" />}
      </div>
      <span className={s.meterNote}>{note}</span>
    </div>
  )
}

export default function ChunkSizer() {
  const [size, setSize] = useState(40)
  const [ovPct, setOvPct] = useState(0)
  const [k, setK] = useState(1)
  const overlap = Math.round((size * ovPct) / 100)
  const r = useMemo(() => retrieveChunks(size, overlap, k), [size, overlap, k])
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const rankOf = new Map(r.top.map((c, i) => [c.idx, i]))
  // which chunks contain each word
  const owners: number[][] = WORDS.map(() => [])
  r.chunks.forEach((c) => {
    for (let j = c.start; j < c.end; j++) owners[j].push(c.idx)
  })
  const starts = new Map(r.chunks.map((c) => [c.start, c.idx] as [number, number]))
  // chunk starts can coincide only if stride were 0, which makeChunks prevents

  const covered = (j: number) => owners[j].some((c) => rankOf.has(c))
  const sentState = (si: number) => {
    const idx = WORDS.map((w, j) => (w.sent === si ? j : -1)).filter((j) => j >= 0)
    const n = idx.filter(covered).length
    return n === idx.length ? 'whole' : n === 0 ? 'missing' : 'cut'
  }
  const [deadline, penalty] = ANSWER_SENTENCES.map(sentState)
  const over = r.retrievedWords > BUDGET

  let verdict: { text: string; bg: string }
  if (r.coverage === 1 && !over) verdict = { text: '✓ The whole answer reached the model, in a short prompt.', bg: 'var(--viz-pos)' }
  else if (r.coverage === 1) verdict = { text: `The whole answer is there, but the prompt is over budget and ${pct(1 - r.relevantShare)} of it is irrelevant text.`, bg: 'var(--viz-2)' }
  else if (r.coverage === 0) verdict = { text: '✗ Missed: none of the answer was retrieved. The model cannot answer.', bg: 'var(--viz-neg)' }
  else verdict = { text: `✗ Answer cut in pieces: the deadline sentence is ${deadline} and the penalty sentence is ${penalty}. The model sees only part of the rule.`, bg: 'var(--viz-neg)' }

  const wordBg = (j: number) => {
    if (covered(j)) return TINT_TOP
    const o = owners[j]
    if (o.length > 1) return `repeating-linear-gradient(135deg, ${o[0] % 2 ? TINT_B : TINT_A} 0 5px, ${o[1] % 2 ? TINT_B : TINT_A} 5px 10px)`
    return o[0] % 2 ? TINT_B : TINT_A
  }

  const head = (
    <>
          <div className={s.head}>
            <span>Question: “{QUESTION}”</span>
            <small>{N_WORDS}-word camp guide, split into {r.chunks.length} chunks</small>
          </div>
    </>
  )
  const doc = (
          <div className={s.doc} aria-label="The document, coloured by chunk">
            {WORDS.map((w, j) => {
              const st = starts.get(j)
              const rank = st !== undefined ? rankOf.get(st) : undefined
              return (
                <Fragment key={j}>
                  {st !== undefined && (
                    <span className={`${s.cMark} ${rank !== undefined ? s.cMarkTop : ''}`} title={`chunk ${st + 1}: score ${r.chunks[st].score.toFixed(2)}`}>
                      {rank !== undefined ? `#${rank + 1} ` : ''}c{st + 1}
                    </span>
                  )}
                  <span className={`${s.w} ${w.ans ? s.wAns : ''}`} style={{ background: wordBg(j) }}>
                    {w.w + ' '}
                  </span>
                </Fragment>
              )
            })}
          </div>
  )
  const legend = (
        <div className={s.legend} aria-hidden="true">
          <span>
            <span className={s.sw} style={{ background: TINT_A }} />
            <span className={s.sw} style={{ background: TINT_B, marginLeft: -2 }} />
            alternate chunks
          </span>
          <span>
            <span className={s.sw} style={{ background: `repeating-linear-gradient(135deg, ${TINT_A} 0 4px, ${TINT_B} 4px 8px)` }} />
            overlap (in two chunks)
          </span>
          <span>
            <span className={s.sw} style={{ background: TINT_TOP }} />
            retrieved (top k)
          </span>
          <span>
            <span className={s.sw} style={{ borderBottom: '2.5px solid var(--viz-2)', borderRadius: 0, height: '0.5rem' }} />
            answer
          </span>
        </div>
  )
  const meters = (
        <div className={s.meters}>
          <Meter
            label="Answer coverage"
            value={r.coverage}
            max={1}
            text={pct(r.coverage)}
            color={r.coverage === 1 ? 'var(--viz-pos)' : r.coverage === 0 ? 'var(--viz-neg)' : 'var(--viz-2)'}
            note="share of the answer's words that reach the model"
          />
          <Meter
            label="Prompt length"
            value={r.retrievedWords}
            max={Math.max(N_WORDS, r.retrievedWords, 150)}
            text={`${r.retrievedWords} words`}
            color={over ? 'var(--viz-neg)' : 'var(--viz-1)'}
            budget={BUDGET}
            note={`retrieved context; the vertical budget line marks a toy limit of ${BUDGET} words`}
          />
          <Meter label="Relevant share" value={r.relevantShare} max={1} text={pct(r.relevantShare)} color="var(--viz-3)" note="share of the retrieved words that are answer words" />
        </div>
  )
  const verdictEl = (
        <p className={s.verdict} style={{ background: `color-mix(in srgb, ${verdict.bg} 16%, var(--surface))` }} aria-live="polite">
          {verdict.text}
        </p>
  )
  const controls = (
        <Controls>
          <Slider label="chunk size (words)" value={size} min={6} max={120} step={2} onChange={setSize} />
          <Slider label="overlap" value={ovPct} min={0} max={50} step={5} onChange={setOvPct} format={(v) => `${v}% (${Math.round((size * v) / 100)} words)`} />
          <Slider label="top-k" value={k} min={1} max={5} step={1} onChange={setK} />
          <Readout
            items={[
              ['chunks', String(r.chunks.length)],
              ['stride', `${size - overlap} words`],
              ['top scores', r.top.map((c) => `c${c.idx + 1}: ${c.score.toFixed(2)}`).join(', ')],
            ]}
          />
        </Controls>
  )

  return (
    <Figure
      wide
      title="Chunk size, overlap and top-k"
      caption={
        <>
          The underlined words answer the question. Striped words sit in two overlapping chunks, and chunks are ranked by keyword cosine similarity with the question. Notice how
          the result jumps around as the boundaries move: tiny chunks cut the answer apart, and huge ones blow the budget with irrelevant text.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <p className={s.tryLine}>
          <b>Try:</b> raise <b>overlap</b> to 25% so the answer fits in one chunk. Then slide <b>chunk size</b> down to 10, and up to 120.
        </p>
        {narrow ? (
          <>
            {head}
            {controls}
            {verdictEl}
            {doc}
            {legend}
            {meters}
          </>
        ) : (
          <>
            {head}
            {doc}
            {legend}
            {meters}
            {verdictEl}
            {controls}
          </>
        )}
      </div>
    </Figure>
  )
}
