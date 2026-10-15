import { useState } from 'react'
import { Figure, Controls, Segmented, Toggle, Button, Bars, mulberry32, hashString } from '../../../../../kit'
import { QUESTIONS, KIND_COLOUR, kindOf, tokensOf, sentence, pct, type QId } from './hallucinationData'
import s from './lim.module.css'

/*
  Why LLMs hallucinate: the reply is written token by token, and only the "fact" token's probability
  depends on how well the fact was learnt. Ask again to sample new replies; add a retrieved source.
*/

export default function HallucinationConfidence() {
  const [qid, setQid] = useState<QId>('rare')
  const [src, setSrc] = useState(false)
  const [draws, setDraws] = useState<Record<string, number[]>>({})
  const q = QUESTIONS.find((x) => x.id === qid)!
  const opts = src ? q.withSource : q.noSource
  const key = `${qid}-${src ? 1 : 0}`
  const hist = draws[key] ?? []
  const topIdx = opts.reduce((best, o, i) => (o.p > opts[best].p ? i : best), 0)
  const shownIdx = hist.length ? hist[hist.length - 1] : topIdx
  const shown = opts[shownIdx]
  const toks = tokensOf(q, shown)
  const shownKind = kindOf(q, shown)
  const keyPos = shown.fact === null ? 0 : q.template.findIndex(([t]) => t === '{X}')
  const pRight = opts.filter((o) => kindOf(q, o) === 'right').reduce((a, o) => a + o.p, 0)

  const askAgain = () => {
    const n = hist.length
    const rng = mulberry32((hashString(key) + n * 7919) >>> 0)
    const r = rng()
    let acc = 0
    let pick = opts.length - 1
    for (let i = 0; i < opts.length; i++) {
      acc += opts[i].p
      if (r < acc) {
        pick = i
        break
      }
    }
    setDraws((d) => ({ ...d, [key]: [...(d[key] ?? []), pick] }))
  }

  return (
    <Figure
      wide
      title="Fluent is not the same as true"
      caption={
        <>
          <b>Try:</b> on the rare fact, press <b>Ask again</b> a few times, then give it a retrieved source. <b>Notice:</b> the year changes but the
          sentence sounds just as sure; with a source it copies the fact. (Illustrative probabilities.)
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Segmented label="Question" value={qid} onChange={setQid} options={QUESTIONS.map((x) => ({ value: x.id, label: x.tab }))} />
          <Toggle label="Give it a retrieved source" checked={src} onChange={setSrc} />
        </Controls>

        <div className={s.chat}>
          <div className={`${s.bubble} ${s.userBubble}`}>
            <span className={s.who}>You</span>
            {q.prompt}
          </div>
          {src && (
            <div className={`${s.bubble} ${s.sourceBubble}`}>
              <span className={s.who}>{q.truth === null ? 'Search result' : 'Retrieved passage'}</span>
              {q.source}
              <p className={s.small} style={{ marginTop: '0.3rem' }}>
                Instruction added to the prompt: "Answer only from the retrieved text. If it does not contain the answer, say you are not sure."
              </p>
            </div>
          )}
          <div className={`${s.bubble} ${s.botBubble}`}>
            <span className={s.who}>Model</span>
            <div className={s.chips} aria-label={`Reply: ${sentence(toks)}`}>
              {toks.map(([t, p], i) => {
                const isKey = i === keyPos
                const col = isKey ? KIND_COLOUR[shownKind] : 'var(--viz-1)'
                return (
                  <span key={i} className={s.chip}>
                    <span className={`${s.chipText} ${isKey ? s.chipKey : ''}`} style={isKey ? { borderColor: col } : undefined}>
                      {t.trim() || t}
                    </span>
                    <span className={s.chipBar}>
                      <span className={s.chipFill} style={{ width: `${p * 100}%`, background: col }} />
                    </span>
                    <span className={s.chipP}>{p.toFixed(2)}</span>
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <p className={s.note}>{q.remark}</p>

        <div className={s.row} style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 260px', minWidth: 0, display: 'grid', gap: '0.4rem' }}>
            <p className={s.subhead}>{shown.fact === null ? 'Possible replies' : 'Possible replies at the fact token'}</p>
            <Bars
              ariaLabel="Probability of each possible reply"
              max={1}
              format={pct}
              data={opts.map((o, i) => {
                const k = kindOf(q, o)
                return {
                  label: (
                    <>
                      {o.fact ?? "\u201CI'm not sure\u201D"} {k === 'right' ? '✓' : k === 'wrong' ? '✗' : ''}
                    </>
                  ),
                  value: o.p,
                  color: KIND_COLOUR[k],
                  strong: i === shownIdx,
                }
              })}
            />
          </div>
          <div style={{ flex: '1 1 220px', minWidth: 0, display: 'grid', gap: '0.45rem' }}>
            <p className={s.subhead}>Ask the same question again</p>
            <div>
              <Button primary onClick={askAgain}>
                Ask again
              </Button>
            </div>
            {hist.length === 0 ? (
              <p className={s.small}>Each press samples a new reply from the probabilities shown.</p>
            ) : (
              <ul className={s.history} aria-label="Previous replies">
                {hist
                  .slice(-4)
                  .reverse()
                  .map((idx, i) => {
                    const o = opts[idx]
                    const k = kindOf(q, o)
                    return (
                      <li key={hist.length - i}>
                        <span className={s.mark} style={{ color: KIND_COLOUR[k] }} aria-label={k}>
                          {k === 'right' ? '✓' : k === 'wrong' ? '✗' : '?'}
                        </span>
                        <span>{sentence(tokensOf(q, o))}</span>
                      </li>
                    )
                  })}
              </ul>
            )}
            <p className={s.small}>
              Chance a reply is right: <b style={{ color: 'var(--ink)' }}>{pct(pRight)}</b>
              {hist.length > 0 && (
                <>
                  {' '}
                  · asked {hist.length} time{hist.length === 1 ? '' : 's'}, right {hist.filter((i) => kindOf(q, opts[i]) === 'right').length}
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </Figure>
  )
}
