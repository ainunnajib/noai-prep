import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Button, useAnimationFrame, mulberry32 } from '../../../../../kit'
import { TEMPLATES, deal } from './patterns'
import { ClockBar } from './walkthrough'
import { Rich, Opt } from './Rich'
import { drillRequests, cardRequests } from './drillChannel'
import s from './pp.module.css'

/*
  Quick-fire drill for the 26 templates of Q1–119: deal a fresh variant of a random template (its name
  hidden) and answer against a 20-second clock. The template name and its method appear after you answer.
  A card in the catalogue above can also ask for a variant of one template ("Drill a variant of this").
*/

const LIMIT = 20
const LETTERS = 'ABCD'
const DEALABLE = TEMPLATES.filter((t) => t.gen)

export default function TemplateDrill() {
  const box = useRef<HTMLDivElement>(null)
  const [drillT, setDrillT] = useState('shape')
  const [seed, setSeed] = useState(3)
  const [deals, setDeals] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [timedRound, setTimedRound] = useState(false)
  const [tally, setTally] = useState({ dealt: 0, right: 0, inTime: 0 })

  useAnimationFrame((dt) => setElapsed((e) => Math.min(LIMIT, e + dt)), running)
  useEffect(() => {
    if (running && elapsed >= LIMIT) setRunning(false)
  }, [running, elapsed])

  const dt = TEMPLATES.find((x) => x.id === drillT)!
  const variant = useMemo(() => deal(dt, seed), [dt, seed])

  const startDeal = (tid: string, nextSeed: number) => {
    setDrillT(tid)
    setSeed(nextSeed)
    setChosen(null)
    setElapsed(0)
    setRunning(true)
    setTimedRound(true)
    setDeals((d) => d + 1)
  }

  // a card in the catalogue asked for a variant of its template
  const dealsRef = useRef(deals)
  dealsRef.current = deals
  useEffect(
    () =>
      drillRequests.listen((tid) => {
        startDeal(tid, 500 + dealsRef.current * 17)
        box.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }),
    [],
  )

  const dealRandom = () => {
    const r = mulberry32(9173 + deals * 7919)
    let pickT = DEALABLE[Math.floor(r() * DEALABLE.length)]
    if (pickT.id === drillT) pickT = DEALABLE[(DEALABLE.indexOf(pickT) + 1) % DEALABLE.length]
    startDeal(pickT.id, 100 + deals * 31 + Math.floor(r() * 1000))
  }

  const answer = (k: number) => {
    if (chosen != null || !variant) return
    setChosen(k)
    setRunning(false)
    if (timedRound) {
      const ok = k === variant.answer
      setTally((x) => ({ dealt: x.dealt + 1, right: x.right + (ok ? 1 : 0), inTime: x.inTime + (ok && elapsed < LIMIT ? 1 : 0) }))
    }
  }

  return (
    <Figure
      title="Quick-fire drill: name it in 20 seconds"
      caption={
        <>
          Press <strong>Deal</strong>: a fresh variant of a random template appears and the clock starts. The template name stays hidden until you answer, so
          recognising it is part of the 20 seconds. Notice how often the right answer comes from one fact and the wrong ones from that fact with one step skipped.
        </>
      }
    >
      <div className={s.drill} ref={box}>
        <div className={s.spread}>
          <span className={s.label}>Quick-fire drill · {LIMIT} seconds</span>
          <div className={s.row}>
            <Button primary onClick={dealRandom}>
              Deal a random template
            </Button>
          </div>
        </div>
        {timedRound ? (
          <ClockBar elapsed={elapsed} target={LIMIT} running={running} />
        ) : (
          <span className={s.small}>Untimed warm-up below. Press Deal and the clock starts at once.</span>
        )}
        {variant && (
          <>
            <div className={s.qtext}>
              <Rich text={variant.prompt} />
            </div>
            <div className={s.opts} role="radiogroup" aria-label="Drill options">
              {variant.opts.map((o, k) => {
                let cls = 'qopt'
                if (chosen != null && k === variant.answer) cls += ' is-answer'
                else if (chosen === k) cls += ' is-chosen-wrong'
                return (
                  <button key={`${seed}-${k}`} type="button" role="radio" aria-checked={chosen === k} className={cls} disabled={chosen != null} onClick={() => answer(k)}>
                    <span className="qopt-letter" aria-hidden="true">
                      {LETTERS[k]}
                    </span>
                    <span className="qopt-text">
                      <Opt text={o} kind={variant.kind} />
                    </span>
                  </button>
                )
              })}
            </div>
            {chosen != null ? (
              <div className={s.cardSoft}>
                <span className={s.small}>
                  {chosen === variant.answer ? <span className={s.verdictOk}>Correct</span> : <span className={s.verdictBad}>Not this time</span>}
                  {timedRound && (
                    <span className="tabular">
                      {' '}
                      · {elapsed >= LIMIT ? 'after the 20 s ran out' : `${elapsed.toFixed(1)} s`}
                    </span>
                  )}{' '}
                  · template:{' '}
                  <button type="button" className={s.chip} onClick={() => cardRequests.send(dt.id)} title="Open this template's card in the catalogue above">
                    {dt.name}
                  </button>
                </span>
                <span className={s.small}>
                  <Rich text={variant.why} />
                </span>
              </div>
            ) : (
              <span className={s.small}>
                {running
                  ? 'Answer before the bar fills. The template name appears after you answer.'
                  : elapsed >= LIMIT
                    ? 'Time is up. Answer anyway to see the template and the method.'
                    : 'Answer to see the template and the method.'}
              </span>
            )}
            <span className={`${s.small} tabular`}>
              Timed rounds: {tally.dealt} answered · {tally.right} correct · {tally.inTime} correct inside {LIMIT} s
            </span>
          </>
        )}
      </div>
    </Figure>
  )
}
