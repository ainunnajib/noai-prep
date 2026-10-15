import { useEffect, useRef, useState } from 'react'
import { Figure, Controls, Slider, Button, Bars } from '../../../../../kit'
import { TIMELINE } from '../../../../../data/facts'
import styles from './roadmap.module.css'

/*
  A 17-week plan from Mon 8 Mar 2027 (the Monday after the Final) to Sun 4 Jul 2027 (IOAI starts).
  Each cell is a 2-hour block. Pick a block type, then click or drag across cells to paint it.
  Fixed milestones come from src/data/facts.ts. Checks and the hours-by-area bars update live.
  The plan is remembered in this browser only (a convenience; it works without storage).
*/

type Kind = 'cv' | 'nlp' | 'tab' | 'gen' | 'theory' | 'contest' | 'rest'
type Cell = Kind | null

const KINDS: { k: Kind; label: string; short: string; colour: string }[] = [
  { k: 'cv', label: 'Vision task (§3)', short: 'CV', colour: 'var(--viz-1)' },
  { k: 'nlp', label: 'Text or audio task (§4)', short: 'NLP', colour: 'var(--viz-2)' },
  { k: 'tab', label: 'Tabular ML task (§1)', short: 'ML', colour: 'var(--viz-3)' },
  { k: 'gen', label: 'Multimodal or generative (§3–4)', short: 'Gen', colour: 'var(--viz-5)' },
  { k: 'theory', label: 'Reading a syllabus gap', short: 'Read', colour: 'var(--viz-6)' },
  { k: 'contest', label: 'Timed mini-contest', short: 'Test', colour: 'var(--viz-4)' },
  { k: 'rest', label: 'Rest or school exams', short: 'Rest', colour: 'var(--viz-muted)' },
]
const KIND = Object.fromEntries(KINDS.map((x) => [x.k, x])) as Record<Kind, (typeof KINDS)[number]>

const fact = (title: string) => TIMELINE.find((t) => t.title === title)

interface Week {
  dates: string
  note?: string
  key?: boolean
}
const WEEKS: Week[] = [
  { dates: '8–14 Mar', note: 'Final was Fri 5 Mar' },
  { dates: '15–21 Mar' },
  { dates: '22–28 Mar' },
  { dates: '29 Mar–4 Apr' },
  { dates: '5–11 Apr', note: `${fact('Results')?.date ?? 'Early Apr'}: results` },
  { dates: '12–18 Apr' },
  { dates: '19–25 Apr' },
  { dates: '26 Apr–2 May' },
  { dates: '3–9 May', note: `${fact('NTU Selection Test')?.date ?? 'Sat 8 May 2027'}: Selection Test`, key: true },
  { dates: '10–16 May' },
  { dates: '17–23 May', note: 'Sat 22 May: NTU training' },
  { dates: '24–30 May', note: 'Sat 29 May: NTU training' },
  { dates: '31 May–6 Jun', note: 'Sat 5 Jun: NTU training' },
  { dates: '7–13 Jun', note: 'Sat 12 Jun: NTU training' },
  { dates: '14–20 Jun', note: `${fact('Residential camp')?.date ?? '14 – 18 Jun 2027'}: camp`, key: true },
  { dates: '21–27 Jun', note: 'June: IOAI home task' },
  { dates: '28 Jun–4 Jul', note: 'IOAI starts Sun 4 Jul', key: true },
]
const SEL_WEEK = 8 // index of the week holding the Selection Test
const CAMP_WEEK = 14
const MAX_SLOTS = 7

const SAMPLE: Kind[][] = [
  ['rest', 'theory', 'theory', 'tab', 'theory', 'cv', 'rest'],
  ['theory', 'cv', 'cv', 'tab', 'theory', 'nlp', 'rest'],
  ['theory', 'nlp', 'nlp', 'cv', 'tab', 'theory', 'rest'],
  ['rest', 'tab', 'tab', 'contest', 'cv', 'theory', 'rest'],
  ['cv', 'cv', 'nlp', 'nlp', 'theory', 'tab', 'rest'],
  ['tab', 'tab', 'cv', 'contest', 'nlp', 'theory', 'rest'],
  ['nlp', 'nlp', 'cv', 'theory', 'tab', 'cv', 'rest'],
  ['rest', 'cv', 'nlp', 'contest', 'tab', 'theory', 'rest'],
  ['contest', 'theory', 'rest', 'rest', 'rest', 'rest', 'rest'],
  ['rest', 'theory', 'gen', 'gen', 'theory', 'nlp', 'rest'],
  ['gen', 'gen', 'nlp', 'theory', 'cv', 'tab', 'rest'],
  ['rest', 'nlp', 'cv', 'contest', 'gen', 'theory', 'rest'],
  ['gen', 'gen', 'tab', 'theory', 'nlp', 'cv', 'rest'],
  ['nlp', 'nlp', 'cv', 'contest', 'gen', 'theory', 'rest'],
  ['cv', 'nlp', 'tab', 'gen', 'cv', 'nlp', 'rest'],
  ['contest', 'gen', 'nlp', 'cv', 'tab', 'theory', 'rest'],
  ['theory', 'contest', 'rest', 'rest', 'rest', 'rest', 'rest'],
]

const KEY = 'road-to-ioai.weekly-plan.v1'

function loadPlan(): { plan: Cell[][]; hours: number } {
  const fresh = { plan: SAMPLE.map((r) => r.slice() as Cell[]), hours: 8 }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return fresh
    const v = JSON.parse(raw) as { plan: Cell[][]; hours: number }
    const ok = (c: unknown): c is Cell => c === null || KINDS.some((x) => x.k === c)
    const plan = WEEKS.map((_, i) => Array.from({ length: MAX_SLOTS }, (_, j) => (ok(v.plan?.[i]?.[j]) ? (v.plan[i][j] as Cell) : null)))
    const hours = Math.min(14, Math.max(4, Math.round((v.hours ?? 8) / 2) * 2))
    return { plan, hours }
  } catch {
    return fresh
  }
}

export default function WeeklyPlanBuilder() {
  const [{ plan, hours }, setState] = useState(loadPlan)
  const [brush, setBrush] = useState<Kind | null>('contest')
  const painting = useRef(false)
  const slots = hours / 2

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ plan, hours }))
    } catch {
      /* storage unavailable: the plan just is not remembered */
    }
  }, [plan, hours])
  useEffect(() => {
    const stop = () => (painting.current = false)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [])

  const paint = (i: number, j: number) =>
    setState((s) => (s.plan[i][j] === brush ? s : { ...s, plan: s.plan.map((row, a) => (a === i ? row.map((c, b) => (b === j ? brush : c)) : row)) }))

  const count = (k: Kind, from = 0, to = WEEKS.length - 1) => {
    let n = 0
    for (let i = from; i <= to; i++) for (let j = 0; j < slots; j++) if (plan[i][j] === k) n++
    return n
  }
  const restIn = (a: number, b: number) => count('rest', a, b) > 0
  const checks = [
    { ok: count('cv', 0, SEL_WEEK) >= 2 && count('nlp', 0, SEL_WEEK) >= 2 && count('tab', 0, SEL_WEEK) >= 2, text: 'Vision, text and tabular tasks each practised at least twice before the Selection Test (the 2025 test had all three)' },
    { ok: count('contest', 0, SEL_WEEK) >= 2, text: 'At least two timed mini-contests before 8 May' },
    { ok: count('gen', 0, CAMP_WEEK - 1) >= 2, text: 'Some multimodal or generative practice before the camp' },
    { ok: restIn(0, 3) && restIn(4, 7) && restIn(8, 11) && restIn(12, 16), text: 'Rest planned in every month, March to June' },
    { ok: restIn(16, 16), text: 'A lighter last week before IOAI' },
  ]
  const totalBlocks = WEEKS.reduce((n, _, i) => n + plan[i].slice(0, slots).filter((c) => c && c !== 'rest').length, 0)

  return (
    <Figure
      title="Plan March to July 2027, one 2-hour block at a time"
      caption={
        <>
          Each row is a week; each cell is a 2-hour block, so the hours slider sets how many cells a week has. Pick a block type, then click or drag across cells. Mark
          your school's exam weeks as Rest and watch which checks break. The plan is a sample: about four months separate the Final from IOAI, and only the dates in
          the left column are fixed.
        </>
      }
      wide
    >
      <div className={styles.palette} role="radiogroup" aria-label="Block type to paint">
        {KINDS.map((x) => (
          <button
            key={x.k}
            type="button"
            role="radio"
            aria-checked={brush === x.k}
            className={`${styles.brush}${brush === x.k ? ` ${styles.brushOn}` : ''}`}
            onClick={() => setBrush(x.k)}
          >
            <span className={styles.brushSwatch} style={{ background: x.colour }} />
            {x.label}
          </button>
        ))}
        <button type="button" role="radio" aria-checked={brush === null} className={`${styles.brush}${brush === null ? ` ${styles.brushOn}` : ''}`} onClick={() => setBrush(null)}>
          <span className={styles.brushSwatch} style={{ background: 'var(--surface)', border: '1.5px dashed var(--viz-muted)' }} />
          Eraser
        </button>
      </div>
      <Controls>
        <Slider label="hours per week you can give" value={hours} min={4} max={14} step={2} onChange={(v) => setState((s) => ({ ...s, hours: v }))} format={(v) => `${v} h (${v / 2} blocks)`} />
        <Button onClick={() => setState({ plan: SAMPLE.map((r) => r.slice() as Cell[]), hours })}>Sample plan</Button>
        <Button onClick={() => setState((s) => ({ ...s, plan: s.plan.map((r) => r.map(() => null)) }))}>Clear</Button>
      </Controls>
      <div className={styles.planGrid} style={{ ['--slots' as string]: slots }} role="grid" aria-label="Weekly plan">
        {WEEKS.map((w, i) => (
          <div key={w.dates} role="row" className={`${styles.planRow}${w.key ? ` ${styles.planKey}` : ''}`}>
            <div role="rowheader" className={styles.weekLabel}>
              <span className={styles.weekDates}>{w.dates}</span>
              {w.note && <span className={styles.weekNote}>{w.note}</span>}
            </div>
            {plan[i].slice(0, slots).map((c, j) => (
              <button
                key={j}
                type="button"
                role="gridcell"
                aria-label={`${w.dates}, block ${j + 1}: ${c ? KIND[c].label : 'empty'}`}
                className={`${styles.cell}${c ? '' : ` ${styles.cellEmpty}`}`}
                style={c ? { background: c === 'rest' ? 'var(--surface-3)' : `color-mix(in srgb, ${KIND[c].colour} 80%, var(--surface))`, color: c === 'rest' ? 'var(--ink-3)' : 'var(--surface)' } : undefined}
                onPointerDown={(e) => {
                  if (e.pointerType === 'mouse') {
                    e.preventDefault()
                    painting.current = true
                  }
                  paint(i, j)
                }}
                onPointerEnter={(e) => {
                  if (painting.current && e.pointerType === 'mouse') paint(i, j)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    paint(i, j)
                  }
                }}
              >
                {c ? KIND[c].short : ''}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.planSummary}>
        <div>
          <div className={styles.sumHead}>
            Hours by area ({totalBlocks * 2} h of practice over {WEEKS.length} weeks)
          </div>
          <Bars
            ariaLabel="Planned hours by area"
            format={(v) => `${v} h`}
            data={KINDS.filter((x) => x.k !== 'rest').map((x) => ({ label: x.label, value: count(x.k) * 2, color: x.colour }))}
          />
        </div>
        <div>
          <div className={styles.sumHead}>Checks</div>
          <ul className={styles.checks}>
            {checks.map((c) => (
              <li key={c.text} className={c.ok ? styles.checkOk : styles.checkBad}>
                <span aria-hidden="true">{c.ok ? '✓' : '✗'}</span> <span className="visually-hidden">{c.ok ? 'passes:' : 'fails:'}</span> {c.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Figure>
  )
}
