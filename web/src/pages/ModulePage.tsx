import { Link, useParams } from 'react-router-dom'
import { getModule, lessonHref, moduleHref } from '../curriculum/registry'
import { parts } from '../curriculum/parts'
import { DomainChip } from '../lib/domains'
import { lessonKey, useProgress } from '../lib/progress'
import { Tick } from './LessonPage'
import NotFound from './NotFound'
import { moduleProgress } from './Roadmap'

export default function ModulePage() {
  const { moduleSlug } = useParams()
  const mod = getModule(moduleSlug)
  const prog = useProgress()
  if (!mod) return <NotFound />
  const part = parts.find((p) => p.id === mod.part)
  const p = moduleProgress(mod, prog)
  const firstOpen = mod.lessons.find((l) => !prog.lessons[lessonKey(mod.slug, l.slug)]) ?? mod.lessons[0]
  const prereqs = mod.prerequisites.map((s) => getModule(s)).filter(Boolean)

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <nav className="lesson-crumbs" aria-label="Breadcrumb">
          <Link to="/learn">Course</Link>
          <span aria-hidden="true">/</span>
          <span>{part?.title}</span>
        </nav>
        <span className="eyebrow">Module {mod.order}</span>
        <h1>{mod.title}</h1>
        <p className="page-lede">{mod.summary}</p>
        <div className="lesson-meta">
          <DomainChip domain={mod.domain} />
          <span className="chip tabular">
            {p.done}/{p.total} lessons done
          </span>
          <span className="chip tabular">{mod.lessons.reduce((s, l) => s + l.minutes, 0)} min</span>
        </div>
      </div>

      {prereqs.length > 0 && (
        <p className="module-prereq">
          Builds on:{' '}
          {prereqs.map((m, i) => (
            <span key={m!.slug}>
              {i > 0 && ', '}
              <Link to={moduleHref(m!.slug)}>{m!.title}</Link>
            </span>
          ))}
        </p>
      )}

      {firstOpen && (
        <Link className="btn btn-primary" to={lessonHref(mod.slug, firstOpen.slug)}>
          {p.done === 0 ? 'Start the first lesson' : p.done === p.total ? 'Review from the start' : `Continue: ${firstOpen.title}`}
        </Link>
      )}

      <ol className="module-lessons">
        {mod.lessons.map((l, i) => (
          <li key={l.slug}>
            <Link to={lessonHref(mod.slug, l.slug)} className="module-lesson">
              <Tick done={Boolean(prog.lessons[lessonKey(mod.slug, l.slug)])} />
              <span className="module-lesson-body">
                <span className="module-lesson-title">
                  <span className="tabular">{i + 1}.</span> {l.title}
                </span>
                <span className="module-lesson-summary">{l.summary}</span>
              </span>
              <span className="module-lesson-mins tabular">{l.minutes} min</span>
            </Link>
          </li>
        ))}
      </ol>

      {mod.syllabus.length > 0 && (
        <section className="module-syllabus">
          <h2>Syllabus covered</h2>
          <p>These are the NOAI / IOAI syllabus items this module prepares you for.</p>
          <ul>
            {mod.syllabus.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
