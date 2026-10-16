import { MDXProvider } from '@mdx-js/react'
import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType, type LazyExoticComponent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AccessGate, useGate } from '../components/account/AccessGate'
import { useSavedWhere } from '../components/account/copy'
import { mdxComponents } from '../components/content/mdxComponents'
import { ErrorBoundary } from '../components/layout/ErrorBoundary'
import { Checkpoint } from '../components/quiz/Checkpoint'
import { getLesson, getModule, lessonHref, loadModuleQuiz, moduleHref, neighbours } from '../curriculum/registry'
import { parts } from '../curriculum/parts'
import type { QuizQuestion } from '../curriculum/types'
import { DomainChip } from '../lib/domains'
import { lessonKey, progress, useProgress } from '../lib/progress'
import NotFound from './NotFound'

const cache = new Map<string, LazyExoticComponent<ComponentType<Record<string, unknown>>>>()

/** "You can explain X" -> "Explain X" (the list heading already says "you can"). */
function tidyObjective(o: string) {
  const t = o.replace(/^\s*(you (can|will be able to)|be able to|by the end,? you can)\s+/i, '')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function Tick({ done }: { done: boolean }) {
  return (
    <span className={`tick${done ? ' is-done' : ''}`} aria-label={done ? 'completed' : 'not completed'}>
      {done && (
        <svg viewBox="0 0 12 12">
          <path d="M2.5 6.2l2.3 2.3 4.7-5" />
        </svg>
      )}
    </span>
  )
}

export default function LessonPage() {
  const { moduleSlug, lessonSlug } = useParams()
  const mod = getModule(moduleSlug)
  const lesson = getLesson(mod, lessonSlug)
  const prog = useProgress()
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [sideOpen, setSideOpen] = useState(false)
  // with accounts on, lessons outside the free modules need full access (always 'open' with accounts off)
  const gate = useGate('lesson', mod?.slug)
  const savedWhere = useSavedWhere()

  const key = mod && lesson ? lessonKey(mod.slug, lesson.slug) : ''
  const Content = useMemo(() => {
    if (!mod || !lesson) return null
    if (!cache.has(key)) cache.set(key, lazy(lesson.load))
    return cache.get(key)!
  }, [key, mod, lesson])

  useEffect(() => {
    let live = true
    setQuiz([])
    if (mod && lesson && gate === 'open') loadModuleQuiz(mod.slug).then((q) => live && setQuiz(q[lesson.slug] ?? []))
    return () => {
      live = false
    }
  }, [mod, lesson, gate])

  useEffect(() => {
    if (lesson && mod) document.title = `${lesson.title} · ${mod.title} · NOAI Prep`
    return () => {
      document.title = 'NOAI Prep'
    }
  }, [lesson, mod])

  if (!mod || !lesson || !Content) return <NotFound />
  const { prev, next } = neighbours(mod.slug, lesson.slug)
  const done = Boolean(prog.lessons[key])
  const part = parts.find((p) => p.id === mod.part)
  const idx = mod.lessons.findIndex((l) => l.slug === lesson.slug)

  return (
    <div className="lesson-layout">
      <aside className="lesson-side" aria-label="Lessons in this module">
        <div className="side-module">
          <span className="eyebrow">
            Module {mod.order}
            {part ? ` · ${part.title}` : ''}
          </span>
          <Link className="side-module-title" to={moduleHref(mod.slug)}>
            {mod.title}
          </Link>
        </div>
        <button type="button" className="btn btn-small side-toggle" aria-expanded={sideOpen} onClick={() => setSideOpen((v) => !v)}>
          {sideOpen ? 'Hide lessons' : `Lesson ${idx + 1} of ${mod.lessons.length} · show all`}
        </button>
        <ol className={`side-lessons${sideOpen ? '' : ' is-collapsed'}`}>
          {mod.lessons.map((l) => (
            <li key={l.slug}>
              <Link to={lessonHref(mod.slug, l.slug)} className={l.slug === lesson.slug ? 'is-current' : ''} aria-current={l.slug === lesson.slug ? 'page' : undefined}>
                <Tick done={Boolean(prog.lessons[lessonKey(mod.slug, l.slug)])} />
                <span>{l.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </aside>

      <article className="lesson-main">
        <header className="lesson-header">
          <nav className="lesson-crumbs" aria-label="Breadcrumb">
            <Link to="/learn">Course</Link>
            <span aria-hidden="true">/</span>
            <Link to={moduleHref(mod.slug)}>{mod.title}</Link>
            <span aria-hidden="true">/</span>
            <span>Lesson {idx + 1}</span>
          </nav>
          <h1>{lesson.title}</h1>
          <div className="lesson-meta">
            <DomainChip domain={mod.domain} />
            <span className="chip tabular">{lesson.minutes} min</span>
            {done && <span className="chip" style={{ color: 'var(--ok)' }}>Completed</span>}
          </div>
          {lesson.objectives.length > 0 && (
            <ul className="objectives">
              <li className="objectives-title" style={{ listStyle: 'none' }}>
                By the end of this lesson you can:
              </li>
              {lesson.objectives.map((o, i) => (
                <li key={i}>{tidyObjective(o)}</li>
              ))}
            </ul>
          )}
        </header>

        <AccessGate kind="lesson" moduleSlug={mod.slug}>
          <ErrorBoundary key={key}>
            <Suspense fallback={<div className="loading-block">Loading lesson…</div>}>
              <MDXProvider components={mdxComponents}>
                <div className="prose">
                  <Content />
                </div>
              </MDXProvider>
            </Suspense>
          </ErrorBoundary>

          {quiz.length > 0 && (
            <Checkpoint
              key={`checkpoint-${key}`}
              questions={quiz}
              progressKey={key}
              title="Checkpoint"
              next={
                next
                  ? {
                      to: lessonHref(next.module.slug, next.lesson.slug),
                      label: next.module.slug === mod.slug ? `Next lesson: ${next.lesson.title}` : `Next module: ${next.module.title}`,
                    }
                  : undefined
              }
            />
          )}
        </AccessGate>

        <div className="lesson-foot">
          {gate === 'open' && (
            <div className="complete-row">
              <button type="button" className={`btn${done ? '' : ' btn-primary'}`} onClick={() => progress.markLesson(key, !done)}>
                {done ? 'Mark as not done' : 'Mark lesson complete'}
              </button>
              <span style={{ color: 'var(--ink-2)', fontSize: 'var(--step--1)' }}>
                {done ? `Nice work. Your progress is saved ${savedWhere}.` : 'Tick it off when you can explain the key idea to a friend.'}
              </span>
            </div>
          )}
          <nav className="pager" aria-label="Lesson navigation">
            {prev ? (
              <Link to={lessonHref(prev.module.slug, prev.lesson.slug)}>
                <span className="pager-dir">Previous</span>
                <span className="pager-title">{prev.lesson.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link className="pager-next" to={lessonHref(next.module.slug, next.lesson.slug)}>
                <span className="pager-dir">{next.module.slug === mod.slug ? 'Next lesson' : `Next module: ${next.module.title}`}</span>
                <span className="pager-title">{next.lesson.title}</span>
              </Link>
            )}
          </nav>
        </div>
      </article>
    </div>
  )
}
