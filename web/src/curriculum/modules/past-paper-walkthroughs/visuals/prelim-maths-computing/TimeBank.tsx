import { useState } from 'react'
import { Figure, Controls, Slider, Button, useNarrow } from '../../../../../kit'
import { PRELIM } from '../../../../../data/facts'
import s from './pp.module.css'

/*
  Where the time goes in a 150-question, 90-minute Prelim if it keeps 2026's layout of five roughly
  equal domain blocks (2026: 60, 59, 59, 59 and 63 questions; modelled here as 30 each, an assumption:
  AI Singapore has not published the 2027 split). In 2026 about half of the last block was long scenarios
  (30 short and 33 long in Q238–300), so the last block is modelled as 15 short questions, taken at the
  AI/GenAI pace, plus 15 long scenarios that get whatever time is left.
  The module's pacing plan: about 25 s per short question and about 90 s per long scenario.
*/

const TOTAL = PRELIM.minutes * 60
const PER_BLOCK = PRELIM.questions / 5
const LONG = Math.round(PER_BLOCK / 2)
const SHORT_PS = PER_BLOCK - LONG
const PLAN_SHORT = 25
const PLAN_LONG = 90

const fmtMin = (sec: number) => {
  const m = Math.floor(Math.abs(sec) / 60)
  const r = Math.round(Math.abs(sec) - m * 60)
  return `${sec < 0 ? '−' : ''}${m} min ${String(r).padStart(2, '0')} s`
}

const mins = (sec: number) => `${Math.round(sec / 6) / 10}`

/** label inside a bar segment: full when there is room, minutes only when tight, nothing when tiny */
function segLabel(name: string, t: number, span: number, narrow: boolean) {
  const f = t / span
  const full = `${name} ${mins(t)} min`
  if (!narrow && f * 60 > full.length) return full
  if (f > (narrow ? 0.17 : 0.06)) return `${mins(t)} min`
  if (narrow && f > 0.1) return `${mins(t)}m`
  return ''
}

export default function TimeBank() {
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const [a, setA] = useState(PRELIM.secondsPerQuestion)
  const [b, setB] = useState(PRELIM.secondsPerQuestion)

  const blocks = [
    { key: 'Maths', colour: 'var(--d-math)', mix: 38, t: PER_BLOCK * a },
    { key: 'Computing', colour: 'var(--d-computing)', mix: 38, t: PER_BLOCK * a },
    { key: 'AI/ML', colour: 'var(--d-ai)', mix: 38, t: PER_BLOCK * b },
    { key: 'GenAI', colour: 'var(--d-genai)', mix: 38, t: PER_BLOCK * b },
    { key: 'Problem solving, short', colour: 'var(--d-problem)', mix: 28, t: SHORT_PS * b },
  ]
  const used = blocks.reduce((x, k) => x + k.t, 0)
  const left = TOTAL - used
  const perLong = left / LONG
  const even = TOTAL / PRELIM.questions
  const span = Math.max(TOTAL, used)
  const spare = left - LONG * PLAN_LONG

  return (
    <Figure
      title="The time you bank"
      caption={
        <>
          Drag the sliders: how long you spend per short question decides what is left for the {LONG} long scenarios at the end. At an even {even} s everywhere, a
          long scenario gets only {even} s. At the module&rsquo;s plan of about {PLAN_SHORT} s per short question, each scenario gets its {PLAN_LONG} s with minutes to
          spare. (Assumes 2027 keeps 2026&rsquo;s five roughly equal blocks, 60, 59, 59, 59 and 63 questions in 2026, modelled as {PER_BLOCK} each, with the last
          block half short questions and half long scenarios as in 2026. The official split is not published.)
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <div className={s.timeBar} role="img" aria-label={`Time used: ${fmtMin(used)} on the short questions, ${fmtMin(left)} left for the ${LONG} long scenarios`}>
          {blocks.map((k) => (
            <div key={k.key} className={s.timeSeg} style={{ width: `${(k.t / span) * 100}%`, background: `color-mix(in srgb, ${k.colour} ${k.mix}%, var(--surface))` }}>
              {segLabel(k.key, k.t, span, narrow)}
            </div>
          ))}
          {left > 0 && (
            <div className={s.timeSeg} style={{ width: `${(left / span) * 100}%`, background: `color-mix(in srgb, var(--d-problem) 62%, var(--surface))` }}>
              {segLabel('Long scenarios', left, span, narrow)}
            </div>
          )}
          {left < 0 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(TOTAL / span) * 100}%`, borderLeft: '3px solid var(--bad)' }} aria-hidden="true" />}
        </div>
        <div className={s.timeAxis} aria-hidden="true">
          {(narrow ? [0, 30, 60, 90] : [0, 15, 30, 45, 60, 75, 90]).map((m) => (
            <span key={m} className={s.timeTick} style={{ left: `${((m * 60) / span) * 100}%`, transform: m === 0 ? 'none' : m === 90 && TOTAL >= span ? 'translateX(-100%)' : undefined }}>
              {m === 90 ? '90 min' : m}
            </span>
          ))}
        </div>
        <div className={s.legend}>
          {[
            ...blocks.map((k) => [k.key, `color-mix(in srgb, ${k.colour} ${Math.min(100, k.mix + 40)}%, var(--surface))`]),
            ['Long scenarios', 'var(--d-problem)'],
          ].map(([k, c]) => (
            <span key={k} className={s.legendItem}>
              <span className={s.swatch} style={{ background: c }} />
              {k}
            </span>
          ))}
        </div>

        <div className={s.stats}>
          <div className={s.stat}>
            <span className={s.label}>Left for the {LONG} long scenarios</span>
            <span className={`${s.big} tabular`} style={{ color: left < 0 ? 'var(--bad)' : undefined }}>
              {fmtMin(left)}
            </span>
          </div>
          <div className={s.stat}>
            <span className={s.label}>Per long scenario</span>
            <span className={`${s.big} tabular`} style={{ color: perLong < PLAN_LONG ? 'var(--bad)' : 'var(--ok)' }}>
              {left <= 0 ? 'none' : `${Math.round(perLong)} s`}
            </span>
            <span className={s.small}>
              {left <= 0
                ? 'You run out before the scenarios start.'
                : spare >= 0
                  ? `The ${PLAN_LONG} s plan fits, with ${fmtMin(spare)} spare for flagged questions.`
                  : `${Math.abs(Math.round(perLong - PLAN_LONG))} s short of the ${PLAN_LONG} s a long scenario needs.`}
            </span>
          </div>
        </div>

        <Controls>
          <Slider label="Maths and Computing, per question" value={a} min={8} max={50} step={1} onChange={setA} format={(v) => `${v} s`} />
          <Slider label="AI/ML, GenAI and short problem-solving, per question" value={b} min={8} max={50} step={1} onChange={setB} format={(v) => `${v} s`} />
        </Controls>
        <div className={s.row}>
          <Button
            onClick={() => {
              setA(PRELIM.secondsPerQuestion)
              setB(PRELIM.secondsPerQuestion)
            }}
          >
            Even pace ({PRELIM.secondsPerQuestion} s)
          </Button>
          <Button
            primary
            onClick={() => {
              setA(PLAN_SHORT)
              setB(PLAN_SHORT)
            }}
          >
            The plan ({PLAN_SHORT} s per short question)
          </Button>
        </div>
        <p className={s.small} style={{ margin: 0 }}>
          Why bank time? In the 2026 paper a long scenario (stem plus options) had a median of 760 characters, against 108 to 139 for a typical question in the
          first four blocks: roughly five to seven times as much reading per question.
        </p>
      </div>
    </Figure>
  )
}
