import { Link } from 'react-router-dom'
import { FitLineDemo } from '../components/home/FitLineDemo'
import { ACCOUNTS_ENABLED, PRICE_LABEL } from '../lib/accounts'
import { lessonHref, lessonSequence, modules, partList, totalMinutes } from '../curriculum/registry'
import { PRELIM, FINAL, daysUntil, nextMilestone } from '../data/facts'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useProgress } from '../lib/progress'
import { nextLesson } from './Roadmap'

export default function Home() {
  const prog = useProgress()
  const nxt = nextLesson(prog)
  const started = Object.keys(prog.lessons).length > 0
  const next = nextMilestone()
  const weeks = next ? Math.floor(next.days / 7) : 0
  const hours = Math.round(totalMinutes / 60)
  // hours a week to finish the course two weeks before the Prelim
  const prelimDays = daysUntil(PRELIM.date)
  const perWeek = prelimDays > 21 ? Math.ceil(hours / ((prelimDays - 14) / 7)) : null
  useDocumentTitle()

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">National Olympiad in Artificial Intelligence · Singapore</span>
          <h1>
            Get ready for NOAI <span className="ink">from zero.</span>
          </h1>
          <p className="hero-lede">
            {ACCOUNTS_ENABLED ? 'A step-by-step course' : 'A free, step-by-step course'} for secondary, JC and poly students. Every idea comes with a picture you can poke
            at, every lesson ends with exam-style questions, and the real past papers are solved and explained.
          </p>
          {ACCOUNTS_ENABLED && (
            <p className="hero-free">
              The first two modules are free, no sign-in needed. Full access to everything is a one-time {PRICE_LABEL}.
            </p>
          )}
          <div className="hero-actions">
            {nxt && (
              <Link className="btn btn-primary" to={lessonHref(nxt.module.slug, nxt.lesson.slug)}>
                {started ? `Continue: ${nxt.lesson.title}` : 'Start lesson 1'}
              </Link>
            )}
            <Link className="btn" to="/exam">
              What's in the exam?
            </Link>
          </div>
          <p className="hero-time">
            About {hours} hours in total{perWeek ? `: roughly ${perWeek} hours a week finishes the course two weeks before the Prelim` : ''}.{' '}
            <Link to="/plan">Make my study plan →</Link>
          </p>
        </div>
        <div className="hero-demo">
          <FitLineDemo />
        </div>
      </section>

      <div className="examstrip" aria-label="NOAI 2027 at a glance">
        {next && (
          <div className="examstrip-item">
            <span className="eyebrow">{next.name}</span>
            {next.days === 0 ? (
              <span className="examstrip-big">Today</span>
            ) : (
              <span className="examstrip-big">
                {next.days}
                <small> {next.days === 1 ? 'day' : 'days'}</small>
              </span>
            )}
            <span className="examstrip-label">
              {next.days === 0 ? next.dateLabel : `until ${next.dateLabel}`}
              {weeks ? ` (${weeks} weeks)` : ''}
            </span>
          </div>
        )}
        <div className="examstrip-item">
          <span className="eyebrow">Format</span>
          <span className="examstrip-big">
            {PRELIM.questions}
            <small> MCQs</small>
          </span>
          <span className="examstrip-label">in {PRELIM.minutes} minutes, no calculator</span>
        </div>
        <div className="examstrip-item">
          <span className="eyebrow">Pace</span>
          <span className="examstrip-big">
            {PRELIM.secondsPerQuestion}
            <small> s</small>
          </span>
          <span className="examstrip-label">per question, no penalty for guessing</span>
        </div>
        <div className="examstrip-item">
          <span className="eyebrow">Final</span>
          <span className="examstrip-big">
            150<small> students</small>
          </span>
          <span className="examstrip-label">{FINAL.dateLabel}: 20 MCQs + 3 Python tasks</span>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>Three habits that get you exam-ready</h2>
        </div>
        <div className="howto">
          <div className="howto-item">
            <h3>See it</h3>
            <p>Each lesson starts from scratch with an everyday picture, then lets you drag, slide and step through the idea until it clicks.</p>
          </div>
          <div className="howto-item">
            <h3>Check it</h3>
            <p>Quick checks inside lessons and a checkpoint at the end, written in the style of the real NOAI questions, with explanations for every answer.</p>
          </div>
          <div className="howto-item">
            <h3>Race it</h3>
            <p>The prelim gives you about 36 seconds a question. Timed mock exams and real past papers train the speed you need.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">The course</span>
          <h2>
            {modules.length} modules, {lessonSequence.length} lessons, about {Math.round(totalMinutes / 60)} hours
          </h2>
          <p>Work through it in order. Each part builds on the one before, from your first line of Python to transformers and diffusion models.</p>
        </div>
        <div className="partgrid">
          {partList.map((p) => (
            <Link key={p.id} to={`/learn#part-${p.id}`} className="partcard">
              <span className="partcard-meta">
                Part {p.order} · {p.modules.length} {p.modules.length === 1 ? 'module' : 'modules'}
              </span>
              <span className="partcard-title">{p.title}</span>
              <span className="partcard-sum">{p.summary}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Practice</span>
          <h2>Train like it's exam day</h2>
        </div>
        <div className="toolgrid">
          <Link to="/practice" className="toolcard">
            <span className="toolcard-num">Question bank</span>
            <h3>Practice by topic</h3>
            <p>Pick a domain and difficulty, answer one question at a time, and read why each answer is right.</p>
          </Link>
          <Link to="/mock" className="toolcard">
            <span className="toolcard-num">Timed</span>
            <h3>Mock exam</h3>
            <p>150 questions in 90 minutes, balanced across the five domains, with a score breakdown at the end. Shorter sprints too.</p>
          </Link>
          <Link to="/papers" className="toolcard">
            <span className="toolcard-num">Official</span>
            <h3>Past papers, solved</h3>
            <p>The 2026 Preliminary Round, the 2026 Final MCQs and the 2025 paper, each question with a worked explanation.</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
