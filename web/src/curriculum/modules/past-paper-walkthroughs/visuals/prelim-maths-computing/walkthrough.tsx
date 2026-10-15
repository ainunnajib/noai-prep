import { useEffect, useState, type ReactNode } from 'react'
import { Button, useAnimationFrame } from '../../../../../kit'
import { progress } from '../../../../../lib/progress'
import { readJSON, writeJSON } from '../../../../../lib/storage'
import s from './pp.module.css'

/*
  Shared engine for the two "model solutions" steppers (maths/computing and ML/GenAI).
  Each item is a real 2026 Prelim question, printed as in the paper (options in paper order).
  Flow: (optionally start the clock) → answer → reveal the solution one step at a time
  → flag for review. Misses and flagged items form an error log grouped by `tag`.
  Answers are also recorded in the site's practice history under the paper question id
  (prelim2026.<n>), so misses show up on the Practice page under "Only ones I got wrong".
*/

export interface WalkPair {
  /** e.g. "Bagging vs boosting" */
  title: string
  sides: { name: string; points: ReactNode[]; isAnswer?: boolean }[]
}

export interface WalkItem {
  n: number
  /** error-log group: the template or concept cluster */
  tag: string
  /** short topic label shown in the header */
  topic: string
  /** target time in seconds */
  target: number
  question: ReactNode
  options: ReactNode[]
  answer: number
  /** one note per option: why it is right, or the misconception behind it */
  notes: ReactNode[]
  fact: ReactNode
  method?: ReactNode
  pair?: WalkPair
  caveat?: ReactNode
  lessons: { href: string; label: string }[]
}

interface ItemState {
  chosen: number | null
  time: number | null
  shown: number
  review: boolean
}

const LETTERS = 'ABCD'
const fresh = (): ItemState => ({ chosen: null, time: null, shown: 0, review: false })

/** A horizontal countdown bar: fills towards the target, turns red when over. */
export function ClockBar({ elapsed, target, running, idleText }: { elapsed: number; target: number; running: boolean; idleText?: ReactNode }) {
  const frac = Math.min(1, elapsed / target)
  const over = elapsed > target
  return (
    <div className={s.clock} aria-live="off">
      <div className={s.clockTrack} role="img" aria-label={`${elapsed.toFixed(1)} of ${target} seconds used`}>
        <div className={`${s.clockFill}${over ? ` ${s.clockOver}` : ''}`} style={{ width: `${(frac * 100).toFixed(1)}%` }} />
      </div>
      <div className={`${s.clockText} tabular`}>
        {running || elapsed > 0 ? (
          <>
            {elapsed.toFixed(1)} s used · target {target} s{over ? ' · over target' : ''}
          </>
        ) : (
          idleText ?? <>target {target} s · clock not started</>
        )}
      </div>
    </div>
  )
}

export function Walkthrough({ items, storageKey, stepNames }: { items: WalkItem[]; storageKey: string; stepNames?: Partial<Record<StepKind, string>> }) {
  const [idx, setIdx] = useState(0)
  const [st, setSt] = useState<ItemState[]>(() => items.map(fresh))
  const [timed, setTimed] = useState(false)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  // restore the review flags saved in this browser (after the first render, so server and client match)
  useEffect(() => {
    const saved = readJSON<Record<string, boolean>>(storageKey, {})
    if (Object.keys(saved).length) setSt((prev) => prev.map((x, i) => ({ ...x, review: Boolean(saved[String(items[i].n)]) || x.review })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useAnimationFrame((dt) => setElapsed((e) => e + dt), running)

  const item = items[idx]
  const cur = st[idx]
  const answered = cur.chosen != null
  const steps = buildSteps(item, stepNames)

  const update = (i: number, patch: Partial<ItemState>) => setSt((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  const saveFlags = (next: ItemState[]) => {
    const flags: Record<string, boolean> = {}
    next.forEach((x, i) => {
      if (x.review) flags[String(items[i].n)] = true
    })
    writeJSON(storageKey, flags)
  }

  const choose = (k: number) => {
    if (answered) return
    const t = running || elapsed > 0 ? elapsed : null
    setRunning(false)
    const correct = k === item.answer
    update(idx, { chosen: k, time: t, review: cur.review || !correct })
    if (!correct) saveFlags(st.map((x, j) => (j === idx ? { ...x, review: true } : x)))
    progress.recordAnswer(`prelim2026.${item.n}`, correct)
  }

  const go = (i: number) => {
    setIdx(i)
    setElapsed(0)
    const next = st[i]
    setRunning(timed && next.chosen == null)
  }

  const startClock = () => {
    setTimed(true)
    setElapsed(0)
    setRunning(true)
  }

  const toggleReview = () => {
    const next = st.map((x, j) => (j === idx ? { ...x, review: !x.review } : x))
    setSt(next)
    saveFlags(next)
  }

  const resetAll = () => {
    setSt(items.map(fresh))
    setIdx(0)
    setElapsed(0)
    setRunning(false)
    setTimed(false)
    writeJSON(storageKey, {})
  }

  const done = st.filter((x) => x.chosen != null)
  const right = st.filter((x, i) => x.chosen === items[i].answer).length
  const timedDone = st.filter((x) => x.time != null)
  const timeUsed = timedDone.reduce((a, x) => a + (x.time ?? 0), 0)
  const timeTarget = st.reduce((a, x, i) => a + (x.time != null ? items[i].target : 0), 0)

  // error log grouped by tag
  const groups = new Map<string, number[]>()
  st.forEach((x, i) => {
    if (!x.review) return
    const g = groups.get(items[i].tag) ?? []
    g.push(i)
    groups.set(items[i].tag, g)
  })

  return (
    <div className={s.wrap}>
      <nav className={s.nav} aria-label="Questions in this walkthrough">
        {items.map((it, i) => {
          const x = st[i]
          const ok = x.chosen != null && x.chosen === it.answer
          const bad = x.chosen != null && !ok
          return (
            <button key={it.n} type="button" className={`${s.navChip}${i === idx ? ` ${s.navOn}` : ''}`} onClick={() => go(i)} aria-current={i === idx ? 'step' : undefined}>
              Q{it.n}
              {ok && <span className={s.navMarkOk} aria-label="correct">✓</span>}
              {bad && <span className={s.navMarkBad} aria-label="wrong">✗</span>}
              {x.review && <span className={s.navMarkStar} aria-label="in your error log">★</span>}
            </button>
          )
        })}
      </nav>

      <div className={s.card}>
        <div className={s.spread}>
          <span className={s.label}>
            2026 Prelim · Q{item.n} · {item.topic}
          </span>
          {!timed && !answered && (
            <Button primary onClick={startClock}>
              Start the clock
            </Button>
          )}
        </div>
        <ClockBar elapsed={answered ? (cur.time ?? 0) : elapsed} target={item.target} running={running} idleText={answered ? <>answered without the clock · target {item.target} s</> : undefined} />

        <div className={s.qtext}>{item.question}</div>

        <div className={s.opts} role="radiogroup" aria-label={`Options for Q${item.n}`}>
          {item.options.map((o, k) => {
            const isAns = k === item.answer
            const isSel = cur.chosen === k
            let cls = 'qopt'
            if (answered && isAns) cls += ' is-answer'
            else if (answered && isSel) cls += ' is-chosen-wrong'
            const showNote = answered && cur.shown > steps.findIndex((x) => x.kind === 'traps') && steps.some((x) => x.kind === 'traps')
            return (
              <div key={k} className={s.optWrap}>
                <button type="button" role="radio" aria-checked={isSel} className={`${cls} ${s.opt}`} disabled={answered} onClick={() => choose(k)}>
                  <span className="qopt-letter" aria-hidden="true">
                    {LETTERS[k]}
                  </span>
                  <span className="qopt-text">{o}</span>
                  {answered && isAns && <span className="qopt-mark">Answer</span>}
                  {answered && isSel && !isAns && <span className="qopt-mark">Your pick</span>}
                </button>
                {showNote && <div className={`${s.optNote} ${isAns ? s.optNoteRight : s.optNoteWrong}`}>{item.notes[k]}</div>}
              </div>
            )
          })}
        </div>

        {answered ? (
          <>
            <div className={s.small}>
              {cur.chosen === item.answer ? <span className={s.verdictOk}>Correct</span> : <span className={s.verdictBad}>Not this time</span>}
              {cur.time != null ? (
                <>
                  {' '}
                  in <strong className="tabular">{cur.time.toFixed(1)} s</strong> (target {item.target} s).
                </>
              ) : (
                '.'
              )}{' '}
              Now reveal the solution one step at a time{cur.shown === 0 ? '.' : ':'}
            </div>
            {cur.shown > 0 && (
              <ol className={s.steps}>
                {steps.slice(0, cur.shown).map((x, i) => (
                  <li key={x.kind} className={s.step}>
                    <span className={s.stepNum} aria-hidden="true">
                      {i + 1}
                    </span>
                    <div className={s.stepBody}>
                      <span className={s.stepTitle}>{x.title}</span>
                      {x.body}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <div className={s.row}>
              <Button primary={cur.shown < steps.length} onClick={() => update(idx, { shown: Math.min(steps.length, cur.shown + 1) })} disabled={cur.shown >= steps.length}>
                {cur.shown >= steps.length ? 'All steps shown' : `Reveal step ${cur.shown + 1} of ${steps.length}`}
              </Button>
              {cur.shown < steps.length && <Button onClick={() => update(idx, { shown: steps.length })}>Show all</Button>}
              <Button onClick={toggleReview}>{cur.review ? '★ In error log (remove)' : '☆ Review again'}</Button>
              {idx < items.length - 1 && (
                <Button primary={cur.shown >= steps.length} onClick={() => go(idx + 1)}>
                  Next question →
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className={s.small}>Pick an answer first. The solution unlocks after you commit, which is how you will meet it in the exam.</div>
        )}
      </div>

      <div className={s.spread}>
        <span className={`${s.small} tabular`}>
          Answered {done.length} of {items.length} · correct {right}
          {timedDone.length > 0 && (
            <>
              {' '}
              · clock: {timeUsed.toFixed(0)} s used for a target of {timeTarget} s
            </>
          )}
        </span>
        <Button onClick={resetAll}>Start over</Button>
      </div>

      <div className={s.log} aria-live="polite">
        <span className={s.label}>Your error log</span>
        {groups.size === 0 ? (
          <span className={s.small}>Empty so far. Wrong answers land here automatically, grouped by {stepNames?.group ?? 'template'}; press ☆ Review again to add one you got right but found slow.</span>
        ) : (
          <>
            {[...groups.entries()].map(([tag, list]) => (
              <div key={tag} className={s.logGroup}>
                <span className={s.small}>
                  <strong>{tag}</strong>
                </span>
                <div className={s.row}>
                  {list.map((i) => (
                    <button key={i} type="button" className={s.chip} onClick={() => go(i)}>
                      Q{items[i].n}
                      <span className={s.muted}>{st[i].chosen != null && st[i].chosen !== items[i].answer ? 'missed' : 'flagged'}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <span className={s.small}>Saved in this browser. Misses also appear on the Practice page under “Only ones I got wrong last time”.</span>
          </>
        )}
      </div>
    </div>
  )
}

type StepKind = 'fact' | 'method' | 'pair' | 'traps' | 'lessons' | 'group'

function buildSteps(item: WalkItem, names?: Partial<Record<StepKind, string>>) {
  const out: { kind: StepKind; title: string; body: ReactNode }[] = []
  out.push({ kind: 'fact', title: names?.fact ?? 'The one fact it tests', body: <div>{item.fact}</div> })
  if (item.method) out.push({ kind: 'method', title: names?.method ?? 'Fastest method', body: <div>{item.method}</div> })
  if (item.pair)
    out.push({
      kind: 'pair',
      title: names?.pair ?? `The confusable pair: ${item.pair.title}`,
      body: (
        <div className={s.pair}>
          {item.pair.sides.map((side) => (
            <div key={side.name} className={`${s.pairSide}${side.isAnswer ? ` ${s.pairSideOn}` : ''}`}>
              <div className={s.pairName}>
                {side.name}
                {side.isAnswer ? ' ✓' : ''}
              </div>
              <ul className={s.pairList}>
                {side.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    })
  out.push({
    kind: 'traps',
    title: names?.traps ?? 'Why each wrong option is wrong',
    body: (
      <div>
        The note under each option above names the misconception that makes it tempting.
        {item.caveat && <div style={{ marginTop: '0.35rem' }}>{item.caveat}</div>}
      </div>
    ),
  })
  out.push({
    kind: 'lessons',
    title: names?.lessons ?? 'Where it is taught',
    body: (
      <div>
        {item.lessons.map((l, i) => (
          <span key={l.href}>
            {i > 0 && ' · '}
            <a href={l.href}>{l.label}</a>
          </span>
        ))}
      </div>
    ),
  })
  return out
}
