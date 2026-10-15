import { useEffect, useMemo, useState } from 'react'
import { Figure, Segmented, Button, useAnimationFrame, mulberry32 } from '../../../../../kit'
import { TEMPLATES, GROUPS, TOTAL_ITEMS, deal, type Template } from './patterns'
import { ClockBar } from './walkthrough'
import { Rich, Opt } from './Rich'
import s from './pp.module.css'

/*
  The 26 templates behind all 119 questions in the 2026 Prelim's Mathematics and Computing blocks.
  Pick a template chip (or a slice of the coverage bar), recall its method, flip the card to check,
  then let the drill deal a fresh variant of a random template against a 20-second clock.
*/

type Filter = 'all' | 'maths' | 'computing'
const LIMIT = 20
const LETTERS = 'ABCD'
const DOMAIN_COLOUR = { maths: 'var(--d-math)', computing: 'var(--d-computing)' } as const

const BY_SIZE = [...TEMPLATES].sort((a, b) => b.items.length - a.items.length)
const TOP8 = BY_SIZE.slice(0, 8).reduce((a, t) => a + t.items.length, 0)
const DEALABLE = TEMPLATES.filter((t) => t.gen)

export default function PatternCards() {
  const [filter, setFilter] = useState<Filter>('all')
  const [sel, setSel] = useState('det')
  const [flipped, setFlipped] = useState(false)

  // drill state
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

  const t = TEMPLATES.find((x) => x.id === sel)!
  const dt = TEMPLATES.find((x) => x.id === drillT)!
  const variant = useMemo(() => deal(dt, seed), [dt, seed])
  const shown = TEMPLATES.filter((x) => filter === 'all' || x.domain === filter)

  const select = (id: string) => {
    setSel(id)
    setFlipped(false)
  }

  const startDeal = (tid: string, nextSeed: number) => {
    setDrillT(tid)
    setSeed(nextSeed)
    setChosen(null)
    setElapsed(0)
    setRunning(true)
    setTimedRound(true)
    setDeals((d) => d + 1)
  }

  const dealRandom = () => {
    const r = mulberry32(9173 + deals * 7919)
    const pool = DEALABLE.filter((x) => filter === 'all' || x.domain === filter)
    let pickT = pool[Math.floor(r() * pool.length)]
    if (pickT.id === drillT && pool.length > 1) pickT = pool[(pool.indexOf(pickT) + 1) % pool.length]
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
      title="26 templates cover all of Q1–119"
      caption={
        <>
          Every one of the {TOTAL_ITEMS} questions in the Mathematics and Computing blocks (Q1–119) fits one of these {TEMPLATES.length} templates, and the 8 biggest cover {TOP8} of them. Pick a template, say its method out loud, then <strong>flip</strong> to check. Then press <strong>Deal</strong>: the drill hides the template name, so recognising it is part of the 20 seconds.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.group}>
          <span className={s.label}>Questions per template, largest first (tap a slice)</span>
          <div className={s.coverage} role="group" aria-label="Share of the 119 questions covered by each template">
            {BY_SIZE.map((x, i) => (
              <button
                key={x.id}
                type="button"
                className={`${s.coverSeg}${x.id === sel ? ` ${s.coverSegOn}` : ''}`}
                style={{ flex: x.items.length, background: `color-mix(in srgb, ${DOMAIN_COLOUR[x.domain]} ${i % 2 ? 55 : 85}%, var(--surface))` }}
                title={`${x.name}: ${x.items.length}`}
                aria-label={`${x.name}: ${x.items.length} questions`}
                onClick={() => select(x.id)}
              />
            ))}
          </div>
          <div className={s.legend}>
            <span className={s.legendItem}>
              <span className={s.swatch} style={{ background: DOMAIN_COLOUR.maths }} /> maths topics
            </span>
            <span className={s.legendItem}>
              <span className={s.swatch} style={{ background: DOMAIN_COLOUR.computing }} /> computing topics
            </span>
            <span className={`${s.legendItem} tabular`}>
              selected: {t.items.length} of {TOTAL_ITEMS} questions
            </span>
          </div>
        </div>

        <Segmented<Filter>
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All 26' },
            { value: 'maths', label: 'Maths' },
            { value: 'computing', label: 'Computing' },
          ]}
        />

        <div className={s.groups}>
          {GROUPS.filter((g) => shown.some((x) => x.group === g)).map((g) => (
            <div key={g} className={s.group}>
              <span className={s.label}>{g}</span>
              <div className={s.row}>
                {shown
                  .filter((x) => x.group === g)
                  .map((x) => (
                    <button key={x.id} type="button" className={`${s.chip}${x.id === sel ? ` ${s.chipOn}` : ''}`} aria-pressed={x.id === sel} onClick={() => select(x.id)}>
                      {x.name}
                      <span className={s.badge}>{x.items.length}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <TemplateCard t={t} flipped={flipped} onFlip={() => setFlipped((f) => !f)} onDeal={t.gen ? () => startDeal(t.id, 500 + deals * 17) : undefined} />

        <div className={s.drill}>
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
                    )}
                    {' '}· template:{' '}
                    <button type="button" className={s.chip} onClick={() => select(dt.id)}>
                      {dt.name}
                    </button>
                  </span>
                  <span className={s.small}>
                    <Rich text={variant.why} />
                  </span>
                </div>
              ) : (
                <span className={s.small}>{running ? 'Which template is this? Answer before the bar fills.' : elapsed >= LIMIT ? 'Time is up. Answer anyway to see the method.' : 'Answer to see the template and the method.'}</span>
              )}
              <span className={`${s.small} tabular`}>
                Timed rounds: {tally.dealt} answered · {tally.right} correct · {tally.inTime} correct inside {LIMIT} s
              </span>
            </>
          )}
        </div>
      </div>
    </Figure>
  )
}

function TemplateCard({ t, flipped, onFlip, onDeal }: { t: Template; flipped: boolean; onFlip: () => void; onDeal?: () => void }) {
  return (
    <div className={s.flip}>
      <div className={`${s.flipInner}${flipped ? ` ${s.flipped}` : ''}`}>
        <div className={`${s.face} ${s.front}`}>
          <div className={s.spread}>
            <span className={s.label} style={{ color: t.domain === 'maths' ? 'var(--d-math)' : 'var(--d-computing)' }}>
              {t.group} · front
            </span>
            <span className={`${s.small} tabular`}>
              {t.items.length} question{t.items.length > 1 ? 's' : ''} in 2026
            </span>
          </div>
          <div className={s.cardTitle}>{t.name}</div>
          <div className={s.kv}>
            <span className={s.kvKey}>How it was asked</span>
            <span className={s.kvVal}>
              <Rich text={t.stem} />
            </span>
          </div>
          <div className={s.kv}>
            <span className={s.kvKey}>2026 items</span>
            <span className={`${s.kvVal} tabular`}>{t.items.map((n) => `Q${n}`).join(' · ')}</span>
          </div>
          <div className={s.row}>
            <Button primary onClick={onFlip}>
              I know the method: flip
            </Button>
          </div>
        </div>
        <div className={`${s.face} ${s.back}`}>
          <div className={s.spread}>
            <span className={s.label}>{t.name} · back</span>
          </div>
          <div className={s.kv}>
            <span className={s.kvKey}>Fastest method</span>
            <span className={s.kvVal}>
              <Rich text={t.method} />
            </span>
          </div>
          <div className={s.kv}>
            <span className={s.kvKey}>The usual trap</span>
            <span className={s.kvVal}>
              <Rich text={t.trap} />
            </span>
          </div>
          <div className={s.kv}>
            <span className={s.kvKey}>Taught in</span>
            <span className={s.kvVal}>
              {t.lessons.map((l, i) => (
                <span key={l.href}>
                  {i > 0 && ' · '}
                  <a href={l.href}>{l.label}</a>
                </span>
              ))}
            </span>
          </div>
          <div className={s.row}>
            <Button onClick={onFlip}>Flip back</Button>
            {onDeal ? (
              <Button primary onClick={onDeal}>
                Drill a variant of this
              </Button>
            ) : (
              <span className={s.small}>Recall-only template: no number variant to deal.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
