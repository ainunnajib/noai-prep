import { Link, useParams } from 'react-router-dom'
import { getModule, lessonHref, moduleHref, modules } from '../curriculum/registry'
import { parts } from '../curriculum/parts'
import { DomainChip } from '../lib/domains'
import { lessonKey, useProgress } from '../lib/progress'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { Tick } from './LessonPage'
import NotFound from './NotFound'
import { moduleProgress } from './Roadmap'

export default function ModulePage() {
  const { moduleSlug } = useParams()
  const mod = getModule(moduleSlug)
  const prog = useProgress()
  useDocumentTitle(mod?.title)
  if (!mod) return <NotFound />
  const part = parts.find((p) => p.id === mod.part)
  const p = moduleProgress(mod, prog)
  const firstOpen = mod.lessons.find((l) => !prog.lessons[lessonKey(mod.slug, l.slug)]) ?? mod.lessons[0]
  const prereqs = mod.prerequisites.map((s) => getModule(s)).filter(Boolean)
  const idx = modules.findIndex((m) => m.slug === mod.slug)
  const prevMod = idx > 0 ? modules[idx - 1] : undefined
  const nextMod = idx >= 0 ? modules[idx + 1] : undefined
  const nextOpen = nextMod && (nextMod.lessons.find((l) => !prog.lessons[lessonKey(nextMod.slug, l.slug)]) ?? nextMod.lessons[0])

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

      {p.done === p.total && nextMod && nextOpen ? (
        <div className="module-actions">
          <Link className="btn btn-primary" to={lessonHref(nextMod.slug, nextOpen.slug)}>
            Next module: {nextMod.title} →
          </Link>
          <Link className="btn" to={lessonHref(mod.slug, mod.lessons[0].slug)}>
            Review from the start
          </Link>
        </div>
      ) : (
        firstOpen && (
          <Link className="btn btn-primary" to={lessonHref(mod.slug, firstOpen.slug)}>
            {p.done === 0 ? 'Start the first lesson' : p.done === p.total ? 'Review from the start' : `Continue: ${firstOpen.title}`}
          </Link>
        )
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

      <nav className="pager" aria-label="Module navigation">
        {prevMod ? (
          <Link to={moduleHref(prevMod.slug)}>
            <span className="pager-dir">Previous module</span>
            <span className="pager-title">{prevMod.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {nextMod && (
          <Link className="pager-next" to={moduleHref(nextMod.slug)}>
            <span className="pager-dir">Next module</span>
            <span className="pager-title">{nextMod.title}</span>
          </Link>
        )}
      </nav>
    </div>
  )
}
