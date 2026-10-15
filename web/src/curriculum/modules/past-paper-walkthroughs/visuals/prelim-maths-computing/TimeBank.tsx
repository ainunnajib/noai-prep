import { useState } from 'react'
import { Figure, Controls, Slider, Button, useNarrow } from '../../../../../kit'
import { PRELIM } from '../../../../../data/facts'
import s from './pp.module.css'

/*
  Where the time goes in a 150-question, 90-minute Prelim if it keeps 2026's layout of five equal
  domain blocks (an assumption: AI Singapore has not published the 2027 split). Fast, one-fact
  answers in the early blocks bank minutes for the long problem-solving scenarios at the end.
*/

const TOTAL = PRELIM.minutes * 60
const PER_BLOCK = PRELIM.questions / 5

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
  if (f > (narrow ? 0.085 : 0.05)) return `${mins(t)}${narrow ? '′' : ' min'}`
  return ''
}

export default function TimeBank() {
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const [a, setA] = useState(PRELIM.secondsPerQuestion)
  const [b, setB] = useState(PRELIM.secondsPerQuestion)

  const blocks = [
    { key: 'Maths', colour: 'var(--d-math)', t: PER_BLOCK * a },
    { key: 'Computing', colour: 'var(--d-computing)', t: PER_BLOCK * a },
    { key: 'AI/ML', colour: 'var(--d-ai)', t: PER_BLOCK * b },
    { key: 'GenAI', colour: 'var(--d-genai)', t: PER_BLOCK * b },
  ]
  const used = blocks.reduce((x, k) => x + k.t, 0)
  const left = TOTAL - used
  const perPS = left / PER_BLOCK
  const even = TOTAL / PRELIM.questions
  const span = Math.max(TOTAL, used)

  return (
    <Figure
      title="The time you bank"
      caption={
        <>
          Drag the sliders: how long you spend per question in the first four blocks decides what is left for the last one. At an even {even} s everywhere, a long scenario gets {even} s. Answer the one-fact questions in about 15 s and each scenario gets well over a minute. (Assumes 2027 keeps 2026’s five equal blocks, {PER_BLOCK} questions each; the official split is not published.)
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <div className={s.timeBar} role="img" aria-label={`Time used: ${fmtMin(used)} on the first four blocks, ${fmtMin(left)} left for problem solving`}>
          {blocks.map((k) => (
            <div key={k.key} className={s.timeSeg} style={{ width: `${(k.t / span) * 100}%`, background: `color-mix(in srgb, ${k.colour} 38%, var(--surface))` }}>
              {segLabel(k.key, k.t, span, narrow)}
            </div>
          ))}
          {left > 0 && (
            <div className={s.timeSeg} style={{ width: `${(left / span) * 100}%`, background: `color-mix(in srgb, var(--d-problem) 55%, var(--surface))` }}>
              {segLabel('Problem solving', left, span, narrow)}
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
          {[...blocks.map((k) => [k.key, k.colour]), ['Problem solving', 'var(--d-problem)']].map(([k, c]) => (
            <span key={k} className={s.legendItem}>
              <span className={s.swatch} style={{ background: c }} />
              {k}
            </span>
          ))}
        </div>

        <div className={s.stats}>
          <div className={s.stat}>
            <span className={s.label}>Left for the last {PER_BLOCK}</span>
            <span className={`${s.big} tabular`} style={{ color: left < 0 ? 'var(--bad)' : undefined }}>
              {fmtMin(left)}
            </span>
          </div>
          <div className={s.stat}>
            <span className={s.label}>Per scenario question</span>
            <span className={`${s.big} tabular`} style={{ color: perPS < even ? 'var(--bad)' : 'var(--ok)' }}>
              {left <= 0 ? 'none' : `${Math.round(perPS)} s`}
            </span>
            <span className={s.small}>{left <= 0 ? 'You run out before the last block starts.' : `${perPS >= even ? '+' : '−'}${Math.abs(Math.round(perPS - even))} s compared with an even ${even} s pace`}</span>
          </div>
        </div>

        <Controls>
          <Slider label="Maths and Computing, per question" value={a} min={8} max={50} step={1} onChange={setA} format={(v) => `${v}\u00a0s`} />
          <Slider label="AI/ML and GenAI, per question" value={b} min={8} max={50} step={1} onChange={setB} format={(v) => `${v}\u00a0s`} />
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
              setA(15)
              setB(20)
            }}
          >
            One-fact pace (15 s and 20 s)
          </Button>
        </div>
        <p className={s.small} style={{ margin: 0 }}>
          Why bank time? In the 2026 paper the median problem-solving question (stem plus options) ran to 534 characters, against 108 to 139 in the other four blocks: roughly four to five times as much reading per question.
        </p>
      </div>
    </Figure>
  )
}
