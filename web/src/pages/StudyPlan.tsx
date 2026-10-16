import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Slider, Toggle } from '../components/interactive/Controls'
import { lessonHref, lessonSequence, moduleHref, type LessonRef } from '../curriculum/registry'
import { PRELIM, FINAL } from '../data/facts'
import { lessonKey, useProgress } from '../lib/progress'
import { readJSON, writeJSON } from '../lib/storage'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/** Modules that prepare for the Final (or beyond) rather than the Prelim: with "Prelim first" on they move after the Prelim. */
const AFTER_PRELIM = new Set(['final-lab-numpy', 'final-lab-pytorch', 'road-to-ioai'])

interface Week {
  index: number
  start: Date
  end: Date
  /** study time planned, in minutes */
  minutes: number
  lessons: LessonRef[]
  kind: 'lessons' | 'revision' | 'final-prep'
}

const DAY = 86400000
const fmt = (d: Date) => d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
const fmtDay = (d: Date) => d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })
const fmtTime = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${Math.round(min % 60)} min` : `${Math.round(min)} min`)

function startOfWeek(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = (x.getDay() + 6) % 7 // Monday = 0
  return new Date(x.getTime() - dow * DAY)
}

/**
 * Pack lessons into weeks from `from` on. The first week only gets the days that are left of it (on a Thursday,
 * 4 of 7 days), so a full week's load is not squeezed into a few days.
 */
export function packLessons(todo: LessonRef[], minutesPerWeek: number, from: Date, firstIndex = 1): Week[] {
  const weeks: Week[] = []
  let start = startOfWeek(from)
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const capacity = (s: Date) => {
    const daysLeft = Math.min(7, Math.round((s.getTime() + 7 * DAY - Math.max(s.getTime(), today.getTime())) / DAY))
    return (minutesPerWeek * daysLeft) / 7
  }
  let cur: Week | null = null
  for (const ref of todo) {
    if (!cur || (cur.minutes > 0 && cur.minutes + ref.lesson.minutes > capacity(cur.start))) {
      cur = { index: firstIndex + weeks.length, start, end: new Date(start.getTime() + 6 * DAY), minutes: 0, lessons: [], kind: 'lessons' }
      weeks.push(cur)
      start = new Date(start.getTime() + 7 * DAY)
    }
    cur.lessons.push(ref)
    cur.minutes += ref.lesson.minutes
  }
  return weeks
}

/** Lessons before the Prelim, revision weeks up to it, then the Final-only lessons between the Prelim and the Final. */
export function buildPlan(todo: LessonRef[], minutesPerWeek: number, from: Date, prelim: Date, final: Date, prelimFirst: boolean): Week[] {
  const before = prelimFirst ? todo.filter((r) => !AFTER_PRELIM.has(r.module.slug)) : todo
  const after = prelimFirst ? todo.filter((r) => AFTER_PRELIM.has(r.module.slug)) : []
  const weeks = packLessons(before, minutesPerWeek, from)
  const prelimWeek = startOfWeek(prelim)
  let next = weeks.length ? new Date(weeks[weeks.length - 1].start.getTime() + 7 * DAY) : startOfWeek(from)
  // revision and mock exams until the Prelim week (inclusive)
  while (next.getTime() <= prelimWeek.getTime()) {
    weeks.push({ index: weeks.length + 1, start: next, end: new Date(next.getTime() + 6 * DAY), minutes: minutesPerWeek, lessons: [], kind: 'revision' })
    next = new Date(next.getTime() + 7 * DAY)
  }
  // the Final-only lessons start the week after the Prelim (or straight after the last lessons if they ran late)
  const afterFrom = new Date(Math.max(next.getTime(), prelimWeek.getTime() + 7 * DAY))
  const finalWeeks = packLessons(after, minutesPerWeek, afterFrom, weeks.length + 1)
  weeks.push(...finalWeeks)
  next = finalWeeks.length ? new Date(finalWeeks[finalWeeks.length - 1].start.getTime() + 7 * DAY) : afterFrom
  const finalWeek = startOfWeek(final)
  while (prelimFirst && next.getTime() <= finalWeek.getTime()) {
    weeks.push({ index: weeks.length + 1, start: next, end: new Date(next.getTime() + 6 * DAY), minutes: minutesPerWeek, lessons: [], kind: 'final-prep' })
    next = new Date(next.getTime() + 7 * DAY)
  }
  return weeks
}

function WeekBody({ w, prelimFirst }: { w: Week; prelimFirst: boolean }) {
  if (w.kind === 'revision')
    return (
      <p className="plan-note">
        Revision and timed practice: a <Link to="/mock">mock exam</Link> each week, then review every wrong answer and reread its lesson. Work through the{' '}
        <Link to="/papers/prelim2026">2026 Prelim paper</Link> and the <Link to={moduleHref('prelim-speed-toolkit')}>speed drills</Link>.
      </p>
    )
  if (w.kind === 'final-prep')
    return (
      <p className="plan-note">
        Final preparation{prelimFirst ? '' : ' (only if you reach the Final)'}: redo the programming tasks in the{' '}
        <Link to={moduleHref('final-lab-numpy')}>NumPy</Link> and <Link to={moduleHref('final-lab-pytorch')}>PyTorch</Link> Final labs without looking at the solutions, and
        try the <Link to="/papers/final2026">2026 Final MCQs</Link>.
      </p>
    )
  // group the week's lessons by module
  const groups: { slug: string; title: string; lessons: LessonRef[] }[] = []
  for (const r of w.lessons) {
    const g = groups[groups.length - 1]
    if (g && g.slug === r.module.slug) g.lessons.push(r)
    else groups.push({ slug: r.module.slug, title: r.module.title, lessons: [r] })
  }
  return (
    <div className="plan-groups">
      {groups.map((g) => (
        <div key={g.slug} className="plan-group">
          <Link className="plan-module" to={moduleHref(g.slug)}>
            {g.title}
          </Link>
          <ul className="plan-lessons">
            {g.lessons.map((r) => (
              <li key={`${r.module.slug}/${r.lesson.slug}`}>
                <Link to={lessonHref(r.module.slug, r.lesson.slug)}>
                  <span>{r.lesson.title}</span>
                  <span className="plan-min tabular">{r.lesson.minutes}′</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default function StudyPlan() {
  const prog = useProgress()
  const [hours, setHours] = useState(() => readJSON<number>('plan-hours', 5))
  const [prelimFirst, setPrelimFirst] = useState(() => readJSON<boolean>('plan-prelim-first', true))
  useEffect(() => writeJSON('plan-hours', hours), [hours])
  useEffect(() => writeJSON('plan-prelim-first', prelimFirst), [prelimFirst])
  useDocumentTitle('Study plan')

  const today = new Date()
  const prelim = new Date(PRELIM.date)
  const final = new Date(FINAL.date)
  const todo = useMemo(() => lessonSequence.filter((r) => !prog.lessons[lessonKey(r.module.slug, r.lesson.slug)]), [prog.lessons])
  const weeks = useMemo(() => buildPlan(todo, hours * 60, today, prelim, final, prelimFirst), [todo, hours, prelimFirst])

  const prelimTodo = prelimFirst ? todo.filter((r) => !AFTER_PRELIM.has(r.module.slug)) : todo
  const lessonWeeks = weeks.filter((w) => w.kind === 'lessons' && w.start.getTime() < startOfWeek(prelim).getTime())
  const lastLessons = lessonWeeks.length ? lessonWeeks[lessonWeeks.length - 1].end : today
  // aim to finish the lessons two weeks before the Prelim, leaving those weeks for mocks
  const target = new Date(startOfWeek(prelim).getTime() - 8 * DAY) // the Sunday two weeks before the Prelim week
  const daysToTarget = Math.max(7, (target.getTime() - today.getTime()) / DAY)
  const prelimMinutes = prelimTodo.reduce((s, r) => s + r.lesson.minutes, 0)
  const neededHours = Math.ceil(prelimMinutes / 60 / (daysToTarget / 7))
  const onTrack = lastLessons.getTime() <= target.getTime()
  const thisWeek = startOfWeek(today).getTime()
  const totalMin = todo.reduce((s, r) => s + r.lesson.minutes, 0)

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <span className="eyebrow">Study plan</span>
        <h1>Your week-by-week plan</h1>
        <p className="page-lede">
          Choose how many hours a week you can study. The plan fits the lessons you haven't finished into the weeks before the Preliminary Round on {fmt(prelim)}, and
          leaves the last weeks for mock exams and revision. Finished lessons drop off the plan.
        </p>
      </div>

      <div className="toolbar" style={{ display: 'grid', gap: '0.75rem' }}>
        <Slider label="Hours per week" value={hours} min={2} max={15} step={1} onChange={setHours} format={(v) => `${v} h`} id="plan-hours" />
        <Toggle
          label="Prelim first: leave the Final labs and the IOAI module until after the Prelim"
          checked={prelimFirst}
          onChange={setPrelimFirst}
        />
        <p style={{ margin: 0 }}>
          {todo.length === 0 ? (
            <strong>You've finished every lesson. Switch to mock exams and past papers.</strong>
          ) : prelimTodo.length === 0 ? (
            <>
              You've finished every lesson the Prelim needs. Spend the weeks before {fmt(prelim)} on <Link to="/mock">mock exams</Link> and past papers.
            </>
          ) : onTrack ? (
            <>
              {fmtTime(totalMin)} of lessons left. At {hours} hours a week you finish the {prelimFirst ? 'Prelim lessons' : 'course'} by <strong>{fmtDay(lastLessons)}</strong>
              , leaving the weeks before {fmt(prelim)} for mock exams.
            </>
          ) : (
            <>
              At {hours} hours a week the {prelimFirst ? 'Prelim lessons run' : 'course runs'} until <strong>{fmtDay(lastLessons)}</strong>. To finish two weeks before the Prelim
              on {fmt(prelim)}, aim for about <strong>{neededHours} hours a week</strong>.{' '}
              {prelimFirst ? (
                <>If that is not possible, skim the lessons on topics you already know and keep the checkpoints: they show quickly whether you can skip ahead.</>
              ) : (
                <>Or switch on "Prelim first" above: the Final labs and the IOAI module are not needed for the Prelim.</>
              )}
            </>
          )}
        </p>
      </div>

      <ol className="plan-weeks">
        {weeks.map((w) => {
          const hasPrelim = prelim >= w.start && prelim < new Date(w.end.getTime() + DAY)
          const hasFinal = final >= w.start && final < new Date(w.end.getTime() + DAY)
          const isThis = w.start.getTime() === thisWeek
          const isNext = w.start.getTime() === thisWeek + 7 * DAY
          const label = w.kind === 'lessons' ? `${w.lessons.length} lesson${w.lessons.length === 1 ? '' : 's'} · ${fmtTime(w.minutes)}` : w.kind === 'revision' ? 'Revision and mocks' : 'Final preparation'
          const head = (
            <span className="plan-week-head">
              <strong>Week {w.index}</strong>
              <span className="tabular">
                {fmt(w.start)} – {fmt(w.end)} · {label}
              </span>
              {isThis && <span className="chip chip-accent">This week</span>}
              {hasPrelim && <span className="chip chip-accent">Prelim {fmtDay(prelim)}</span>}
              {hasFinal && <span className="chip chip-accent">Final {fmtDay(final)}</span>}
            </span>
          )
          return (
            <li key={w.index} className={`plan-week${isThis ? ' is-current' : ''}`}>
              {isThis || isNext ? (
                <>
                  {head}
                  <WeekBody w={w} prelimFirst={prelimFirst} />
                </>
              ) : (
                <details>
                  <summary>{head}</summary>
                  <WeekBody w={w} prelimFirst={prelimFirst} />
                </details>
              )}
            </li>
          )
        })}
      </ol>
      <p className="fineprint" style={{ marginTop: '1.5rem' }}>
        Lesson times are estimates for a first pass, including the visuals and the checkpoint. Add time for practice questions and re-reading. Your settings are saved in
        this browser.
      </p>
    </div>
  )
}
