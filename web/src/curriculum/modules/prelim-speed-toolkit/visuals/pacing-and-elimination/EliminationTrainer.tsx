import { useState } from 'react'
import { Figure, Button, shuffled, mulberry32, hashString } from '../../../../../kit'
import { TRAINER as PAPER_ORDER, HEURISTICS, type Heuristic } from './eliminationData'
import s from './pe.module.css'

/*
  Strike out options on real 2026 Prelim questions before answering.
  Each strike gets instant feedback naming the heuristic that justifies it (or warning you that
  you just struck the right answer). The expected value of a guess updates as options go.
*/

interface QState {
  struck: boolean[]
  chosen: number | null
}

// Options are shuffled once, stably per question, so the right answer is not usually on top (as it is in the paper's
// order). The salt is chosen so each of the four positions holds the right answer for exactly two of the eight questions.
const TRAINER = PAPER_ORDER.map((q) => {
  const order = shuffled([0, 1, 2, 3].slice(0, q.options.length), mulberry32(hashString(`elim63-${q.n}`)))
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) }
})

const fresh = (): QState[] => TRAINER.map((q) => ({ struck: q.options.map(() => false), chosen: null }))

export default function EliminationTrainer() {
  const [idx, setIdx] = useState(0)
  const [state, setState] = useState<QState[]>(fresh)
  const [showHelp, setShowHelp] = useState(true)

  const q = TRAINER[idx]
  const st = state[idx]
  const revealed = st.chosen !== null
  const left = st.struck.filter((x) => !x).length

  const update = (fn: (s: QState) => QState) => setState((all) => all.map((x, i) => (i === idx ? fn(x) : x)))
  const toggleStrike = (j: number) => update((x) => ({ ...x, struck: x.struck.map((v, k) => (k === j ? !v : v)) }))
  const choose = (j: number) => update((x) => ({ ...x, chosen: j }))

  // running tally over every question so far
  let goodStrikes = 0
  let badStrikes = 0
  let answered = 0
  let right = 0
  const tagCount: Partial<Record<Heuristic, number>> = {}
  state.forEach((x, i) => {
    const tq = TRAINER[i]
    x.struck.forEach((on, j) => {
      if (!on) return
      if (j === tq.answer) badStrikes++
      else {
        goodStrikes++
        const t = tq.options[j].tag
        if (t) tagCount[t] = (tagCount[t] ?? 0) + 1
      }
    })
    if (x.chosen !== null) {
      answered++
      if (x.chosen === tq.answer) right++
    }
  })

  // a guess is only worth 1/left if the right answer is still among the options left
  const struckRight = st.struck[q.answer]
  const ev = struckRight || left === 0 ? '0' : `1/${left}`
  const long = q.stem.length > 260

  return (
    <Figure
      title="Elimination trainer: eight real 2026 Prelim questions"
      caption={
        <>
          Press <strong>Strike</strong> next to every option you can rule out, and read why each strike works. Then tap the option you believe. Notice how often you can reach the answer
          by removing wrong options, even on a topic you only half remember, and how each strike raises the value of a guess.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.spread}>
          <span className={s.label}>
            Question {idx + 1} of {TRAINER.length} · 2026 Prelim Q{q.n}
          </span>
          <span className={s.small}>
            options left <strong className="tabular">{left}</strong> · a guess is worth{' '}
            <strong className="tabular" style={struckRight ? { color: 'var(--viz-neg)' } : undefined}>
              {ev}
            </strong>{' '}
            mark{struckRight ? ' (you struck the right answer)' : ''}
          </span>
        </div>

        <div className={s.card}>
          <div className={`${s.stem}${long ? ` ${s.stemLong}` : ''}`} tabIndex={long ? 0 : undefined} aria-label={long ? 'Question text (scrollable)' : undefined}>
            {q.stem}
          </div>
          <div className={s.opts}>
            {q.options.map((o, j) => {
              const struck = st.struck[j]
              const isAns = j === q.answer
              const cls = [s.opt]
              if (struck) cls.push(s.optStruck)
              if (revealed && isAns) cls.push(s.optRight)
              if (revealed && st.chosen === j && !isAns) cls.push(s.optWrong)
              const showWhy = struck || revealed
              const h = o.tag ? HEURISTICS[o.tag] : null
              return (
                <div key={j} className={s.optRow}>
                  <button
                    type="button"
                    className={`${s.strike}${struck ? ` ${s.strikeOn}` : ''}`}
                    onClick={() => toggleStrike(j)}
                    disabled={revealed}
                    aria-pressed={struck}
                    aria-label={`${struck ? 'Undo strike on' : 'Strike out'} option: ${o.text}`}
                  >
                    {struck ? 'Undo' : 'Strike'}
                  </button>
                  <button type="button" className={cls.join(' ')} onClick={() => choose(j)} disabled={revealed || struck} aria-label={`Answer: ${o.text}`}>
                    {o.text}
                  </button>
                  {showWhy && (
                    <div className={s.why}>
                      {isAns ? (
                        struck ? (
                          <>
                            <span className={`${s.tag} ${s.bad}`}>Careful: this is the right answer</span>
                            <span>{o.why} Undo the strike.</span>
                          </>
                        ) : (
                          <>
                            <span className={`${s.tag} ${s.good}`}>Correct answer</span>
                            <span>{o.why}</span>
                          </>
                        )
                      ) : (
                        <>
                          {h && (
                            <span className={s.tag} style={{ color: h.colour }}>
                              {h.name}
                            </span>
                          )}
                          <span>
                            {struck && <strong className={s.good}>Good strike. </strong>}
                            {o.why}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {revealed && (
            <div className={s.small}>
              <strong>{st.chosen === q.answer ? 'Right.' : 'Not this time.'}</strong> {q.lesson}
            </div>
          )}
        </div>

        <div className={s.row}>
          <Button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
            Previous
          </Button>
          <Button primary onClick={() => setIdx((i) => Math.min(TRAINER.length - 1, i + 1))} disabled={idx === TRAINER.length - 1}>
            Next question
          </Button>
          <Button
            onClick={() => {
              setState(fresh())
              setIdx(0)
            }}
          >
            Start again
          </Button>
          <button type="button" className={`${s.chip}${showHelp ? ` ${s.chipOn}` : ''}`} onClick={() => setShowHelp((v) => !v)} aria-expanded={showHelp}>
            The five heuristics
          </button>
        </div>

        {showHelp && (
          <div className={s.detail}>
            <ul>
              {(Object.keys(HEURISTICS) as Heuristic[]).map((k) => (
                <li key={k}>
                  <strong style={{ color: HEURISTICS[k].colour }}>{HEURISTICS[k].name}</strong>: {HEURISTICS[k].hint}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={s.small} aria-live="polite">
          Good strikes <strong className="tabular">{goodStrikes}</strong> · struck the right answer <strong className="tabular">{badStrikes}</strong> · answered{' '}
          <strong className="tabular">
            {right}/{answered}
          </strong>{' '}
          correctly
          {goodStrikes > 0 && (
            <>
              {' '}
              · your strikes used:{' '}
              {(Object.keys(tagCount) as Heuristic[]).map((k, i) => (
                <span key={k}>
                  {i > 0 && ', '}
                  <span style={{ color: HEURISTICS[k].colour, fontWeight: 700 }}>{HEURISTICS[k].name.toLowerCase()}</span> ×{tagCount[k]}
                </span>
              ))}
            </>
          )}
        </div>
      </div>
    </Figure>
  )
}
