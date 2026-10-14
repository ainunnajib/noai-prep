import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Slider } from '../components/interactive/Controls'
import { lessonHref, lessonSequence, type LessonRef } from '../curriculum/registry'
import { PRELIM, FINAL } from '../data/facts'
import { lessonKey, useProgress } from '../lib/progress'
import { readJSON, writeJSON } from '../lib/storage'
import { Tick } from './LessonPage'

interface Week {
  index: number
  start: Date
  end: Date
  minutes: number
  lessons: LessonRef[]
  milestone?: string
}

const DAY = 86400000
const fmt = (d: Date) => d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })

function startOfWeek(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = (x.getDay() + 6) % 7 // Monday = 0
  return new Date(x.getTime() - dow * DAY)
}

export function buildPlan(todo: LessonRef[], minutesPerWeek: number, from: Date): Week[] {
  const weeks: Week[] = []
  let cur: Week | null = null
  let start = startOfWeek(from)
  for (const ref of todo) {
    if (!cur || (cur.minutes > 0 && cur.minutes + ref.lesson.minutes > minutesPerWeek)) {
      cur = { index: weeks.length + 1, start, end: new Date(start.getTime() + 6 * DAY), minutes: 0, lessons: [] }
      weeks.push(cur)
      start = new Date(start.getTime() + 7 * DAY)
    }
    cur.lessons.push(ref)
    cur.minutes += ref.lesson.minutes
  }
  return weeks
}

export default function StudyPlan() {
  const prog = useProgress()
  const [hours, setHours] = useState(() => readJSON<number>('plan-hours', 5))
  useEffect(() => writeJSON('plan-hours', hours), [hours])
  useEffect(() => {
    document.title = 'Study plan · NOAI Prep'
    return () => {
      document.title = 'NOAI Prep'
    }
  }, [])

  const today = new Date()
  const prelim = new Date(PRELIM.date)
  const final = new Date(FINAL.date)
  const todo = useMemo(() => lessonSequence.filter((r) => !prog.lessons[lessonKey(r.module.slug, r.lesson.slug)]), [prog.lessons])
  const weeks = useMemo(() => buildPlan(todo, hours * 60, today), [todo, hours])
  const finishes = weeks.length ? weeks[weeks.length - 1].end : today
  const weeksToPrelim = Math.max(0, Math.floor((prelim.getTime() - startOfWeek(today).getTime()) / (7 * DAY)))
  const studyWeeks = Math.max(1, weeksToPrelim - 2)
  const remainingMin = todo.reduce((s, r) => s + r.lesson.minutes, 0)
  const neededHours = Math.ceil(remainingMin / 60 / studyWeeks)
  const onTrack = finishes.getTime() <= prelim.getTime() - 14 * DAY

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <span className="eyebrow">Study plan</span>
        <h1>Your week-by-week plan</h1>
        <p className="page-lede">
          Choose how many hours a week you can study. The plan fits the lessons you haven't finished into the weeks before the Preliminary Round, leaving the last two weeks for
          mock exams and revision.
        </p>
      </div>

      <div className="toolbar" style={{ display: 'grid', gap: '0.75rem' }}>
        <Slider label="Hours per week" value={hours} min={2} max={15} step={1} onChange={setHours} format={(v) => `${v} h`} id="plan-hours" />
        <p style={{ margin: 0 }}>
          {todo.length === 0 ? (
            <strong>You've finished every lesson. Switch to mock exams and past papers.</strong>
          ) : onTrack ? (
            <>
              At {hours} hours a week you finish the course in the week of <strong>{fmt(finishes)}</strong>, in time to spend the last weeks on mock exams before{' '}
              {fmt(prelim)}.
            </>
          ) : (
            <>
              At {hours} hours a week you'd finish around <strong>{fmt(finishes)}</strong>. To finish two weeks before the prelim on {fmt(prelim)}, aim for about{' '}
              <strong>{neededHours} hours a week</strong>, or prioritise the modules marked for the prelim.
            </>
          )}
        </p>
      </div>

      <ol className="plan-weeks">
        {weeks.map((w) => {
          const hasPrelim = prelim >= w.start && prelim <= new Date(w.end.getTime() + DAY)
          const hasFinal = final >= w.start && final <= new Date(w.end.getTime() + DAY)
          return (
            <li key={w.index} className="plan-week">
              <div className="plan-week-head">
                <strong>Week {w.index}</strong>
                <span className="tabular">
                  {fmt(w.start)} – {fmt(w.end)} · {Math.floor(w.minutes / 60)} h {w.minutes % 60} min
                </span>
                {hasPrelim && <span className="chip" style={{ color: 'var(--accent)' }}>Prelim this week</span>}
                {hasFinal && <span className="chip" style={{ color: 'var(--accent)' }}>Final this week</span>}
              </div>
              <ul className="plan-lessons">
                {w.lessons.map((r) => (
                  <li key={`${r.module.slug}/${r.lesson.slug}`}>
                    <Link to={lessonHref(r.module.slug, r.lesson.slug)}>
                      <Tick done={Boolean(prog.lessons[lessonKey(r.module.slug, r.lesson.slug)])} />
                      <span>
                        <span className="plan-module">{r.module.title}</span> {r.lesson.title}
                      </span>
                      <span className="plan-min tabular">{r.lesson.minutes}′</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
      <p className="fineprint" style={{ marginTop: '1.5rem' }}>
        Lesson times are estimates for a first pass. Add time for checkpoints, practice questions and re-reading. Your plan is saved in this browser.
      </p>
    </div>
  )
}
