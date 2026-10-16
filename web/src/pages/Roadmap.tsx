import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { lessonHref, lessonSequence, moduleHref, modules, partList, totalMinutes } from '../curriculum/registry'
import type { ModuleDef } from '../curriculum/types'
import { DOMAIN_LABEL } from '../lib/domains'
import { lessonKey, useProgress, type ProgressState } from '../lib/progress'

export function moduleProgress(m: ModuleDef, prog: ProgressState) {
  const done = m.lessons.filter((l) => prog.lessons[lessonKey(m.slug, l.slug)]).length
  return { done, total: m.lessons.length }
}

export function nextLesson(prog: ProgressState) {
  return lessonSequence.find((r) => !prog.lessons[lessonKey(r.module.slug, r.lesson.slug)])
}

export default function Roadmap() {
  const prog = useProgress()
  useDocumentTitle('Course map')
  const totalLessons = lessonSequence.length
  const doneLessons = lessonSequence.filter((r) => prog.lessons[lessonKey(r.module.slug, r.lesson.slug)]).length
  const nxt = nextLesson(prog)

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">The course</span>
        <h1>From zero to NOAI, one step at a time</h1>
        <p className="page-lede">
          {modules.length} modules, {totalLessons} lessons, about {Math.round(totalMinutes / 60)} hours of study. Every lesson starts from scratch, explains each idea with a
          picture you can play with, and ends with a checkpoint in the style of the real exam.
        </p>
      </div>

      <div className="roadmap-summary card">
        <div className="roadmap-summary-stat">
          <span className="eyebrow">Your progress</span>
          <span className="roadmap-big tabular">
            {doneLessons}
            <small> / {totalLessons} lessons</small>
          </span>
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${totalLessons ? (doneLessons / totalLessons) * 100 : 0}%` }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link className="btn" to="/plan">
            Make a study plan
          </Link>
          {nxt && (
            <Link className="btn btn-primary" to={lessonHref(nxt.module.slug, nxt.lesson.slug)}>
              {doneLessons ? 'Continue' : 'Start'}: {nxt.lesson.title}
            </Link>
          )}
        </div>
      </div>

      <div className="roadmap">
        {partList.map((part) => (
          <section key={part.id} className="roadmap-part" aria-labelledby={`part-${part.id}`}>
            <header className="roadmap-part-head">
              <span className="eyebrow">Part {part.order}</span>
              <h2 id={`part-${part.id}`}>{part.title}</h2>
              <p>{part.summary}</p>
            </header>
            <ol className="roadmap-line">
              {part.modules.map((m) => {
                const p = moduleProgress(m, prog)
                const state = p.done === p.total && p.total > 0 ? 'is-done' : p.done > 0 ? 'is-started' : ''
                const mins = m.lessons.reduce((s, l) => s + l.minutes, 0)
                return (
                  <li key={m.slug} className={`roadmap-stop dom-${m.domain} ${state}`}>
                    <span className="roadmap-node tabular" aria-hidden="true">
                      {m.order}
                    </span>
                    <Link to={moduleHref(m.slug)} className="roadmap-card">
                      <span className="roadmap-card-top">
                        <span className="roadmap-domain">{DOMAIN_LABEL[m.domain]}</span>
                        <span className="roadmap-count tabular">
                          {p.done}/{p.total} lessons · {mins} min
                        </span>
                      </span>
                      <span className="roadmap-title">{m.title}</span>
                      <span className="roadmap-tagline">{m.tagline}</span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
