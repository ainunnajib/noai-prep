import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { Bars } from '../components/interactive/Bars'
import { loadAllQuestions, SUBTOPIC_LABEL, type BankQuestion, type ExamDomain } from '../data/bank'
import { DOMAIN_LABEL, DomainChip, EXAM_DOMAINS } from '../lib/domains'
import { formatDuration, pct } from '../lib/format'
import { progress, useProgress } from '../lib/progress'
import { mulberry32, shuffled } from '../lib/random'
import { revealQuestion } from '../lib/revealQuestion'
import { readJSON, removeKey, writeJSON } from '../lib/storage'

interface Format {
  id: string
  title: string
  questions: number
  minutes: number
  note: string
}

const FORMATS: Format[] = [
  { id: 'prelim2027', title: 'Full prelim', questions: 150, minutes: 90, note: 'The NOAI 2027 Preliminary Round format: 150 questions, 90 minutes.' },
  { id: 'half', title: 'Half paper', questions: 75, minutes: 45, note: 'Same pace, half the length. Good for a weekday evening.' },
  { id: 'sprint', title: 'Sprint', questions: 30, minutes: 18, note: 'A quick 18-minute burst at exam pace.' },
  { id: 'marathon', title: '2026 marathon', questions: 300, minutes: 180, note: 'The 2026 format: 300 questions in 3 hours. For stamina.' },
]

interface Attempt {
  formatId: string
  ids: string[]
  answers: Record<string, number>
  flags: string[]
  startedAt: number
  durationSec: number
  current: number
  submittedAt?: number
  seed: number
}

const KEY = 'mock-current'
/** wrong answers shown per page on the results screen (a full mock can have 100+) */
const REVIEW_PAGE = 20

function buildExam(pool: BankQuestion[], n: number, seed: number): string[] {
  const rng = mulberry32(seed)
  const per = Math.floor(n / EXAM_DOMAINS.length)
  const picked: BankQuestion[] = []
  const used = new Set<string>()
  for (const d of EXAM_DOMAINS) {
    const qs = shuffled(pool.filter((q) => q.domain === d), rng).slice(0, per)
    qs.forEach((q) => used.add(q.id))
    picked.push(...qs)
  }
  // fill any remainder (rounding or thin domains) from the rest of the pool
  const rest = shuffled(pool.filter((q) => !used.has(q.id)), rng)
  while (picked.length < n && rest.length) picked.push(rest.shift()!)
  // order: mixed, like the real paper's flow by domain is unknown for 2027
  return shuffled(picked, rng).map((q) => q.id)
}

export default function MockExam() {
  const [all, setAll] = useState<BankQuestion[] | null>(null)
  const [formatId, setFormatId] = useState('prelim2027')
  const [includePapers, setIncludePapers] = useState(true)
  const [attempt, setAttempt] = useState<Attempt | null>(() => readJSON<Attempt | null>(KEY, null))
  const [now, setNow] = useState(Date.now())
  const [confirming, setConfirming] = useState(false)
  const [reviewFilter, setReviewFilter] = useState<'wrong' | 'all' | 'flagged'>('wrong')
  const [reviewLimit, setReviewLimit] = useState(REVIEW_PAGE)
  const prog = useProgress()
  const cardRef = useRef<HTMLElement>(null)
  const moved = useRef(false)
  const confirmRef = useRef<HTMLDivElement>(null)
  const submitBtn = useRef<HTMLButtonElement>(null)

  // Next, Previous and the navigator: bring the new question back into view below the timer bar, and focus it
  useEffect(() => {
    if (!moved.current) return
    moved.current = false
    revealQuestion(cardRef.current, '.mock-bar')
  }, [attempt?.current])

  // the submit confirmation takes focus when it opens
  useEffect(() => {
    if (confirming) confirmRef.current?.focus()
  }, [confirming])
  const closeConfirm = () => {
    setConfirming(false)
    submitBtn.current?.focus()
  }

  useEffect(() => {
    document.title = 'Mock exam · NOAI Prep'
    loadAllQuestions().then(setAll)
    return () => {
      document.title = 'NOAI Prep'
    }
  }, [])

  useEffect(() => {
    if (attempt) writeJSON(KEY, attempt)
  }, [attempt])

  const byId = useMemo(() => new Map((all ?? []).map((q) => [q.id, q])), [all])
  const running = attempt && !attempt.submittedAt
  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [running])

  const remaining = attempt ? attempt.durationSec - Math.floor((now - attempt.startedAt) / 1000) : 0
  // time's up: submit automatically, but only once the questions have loaded (scoring needs them)
  useEffect(() => {
    if (running && all && remaining <= 0) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, remaining, all])

  const pool = useMemo(() => (all ?? []).filter((q) => q.source !== 'course' && (includePapers || q.source !== 'paper')), [all, includePapers])

  function start() {
    const f = FORMATS.find((x) => x.id === formatId)!
    const seed = Math.floor(Math.random() * 2 ** 31)
    const ids = buildExam(pool, f.questions, seed)
    const a: Attempt = { formatId, ids, answers: {}, flags: [], startedAt: Date.now(), durationSec: f.minutes * 60, current: 0, seed }
    submitting.current = false
    setNow(Date.now())
    setAttempt(a)
    window.scrollTo(0, 0)
  }

  const submitting = useRef(false)
  function submit() {
    setConfirming(false)
    const a = attempt
    // score once, outside any state updater (StrictMode may run updaters twice)
    if (!a || a.submittedAt || !all || submitting.current) return
    submitting.current = true
    const done = { ...a, submittedAt: Date.now() }
    const byDomain: Record<string, { total: number; correct: number }> = {}
    let correct = 0
    for (const id of a.ids) {
      const q = byId.get(id)
      if (!q) continue
      byDomain[q.domain] ??= { total: 0, correct: 0 }
      byDomain[q.domain].total++
      const sel = a.answers[id]
      if (sel != null) progress.recordAnswer(id, sel === q.answer)
      if (sel === q.answer) {
        correct++
        byDomain[q.domain].correct++
      }
    }
    progress.recordExam({
      id: `${a.startedAt}`,
      date: new Date().toISOString(),
      mode: a.formatId,
      total: a.ids.length,
      correct,
      seconds: Math.min(a.durationSec, Math.round((done.submittedAt - a.startedAt) / 1000)),
      byDomain,
    })
    setAttempt(done)
    window.scrollTo(0, 0)
  }

  function discard() {
    removeKey(KEY)
    setAttempt(null)
    setConfirming(false)
  }

  // ---------------- setup ----------------
  if (!attempt) {
    const past = prog.exams.slice(-5).reverse()
    // a radio group: one tab stop, arrow keys move the choice
    const onFormatKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
      if (!step) return
      e.preventDefault()
      const i = (FORMATS.findIndex((f) => f.id === formatId) + step + FORMATS.length) % FORMATS.length
      setFormatId(FORMATS[i].id)
      ;(e.currentTarget.children[i] as HTMLElement | undefined)?.focus()
    }
    return (
      <div className="page">
        <div className="page-head">
          <span className="eyebrow">Mock exam</span>
          <h1>Sit a timed mock exam</h1>
          <p className="page-lede">
            Questions are drawn evenly from the five NOAI domains. There's no feedback until you submit, just like the real thing. Wrong answers cost nothing, so answer
            everything.
          </p>
        </div>
        <div className="mock-setup" role="radiogroup" aria-label="Exam length" onKeyDown={onFormatKey}>
          {FORMATS.map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={formatId === f.id} tabIndex={formatId === f.id ? 0 : -1} className={`mock-option${formatId === f.id ? ' is-active' : ''}`} onClick={() => setFormatId(f.id)}>
              <strong>{f.title}</strong>
              <span className="tabular">
                {f.questions} questions · {f.minutes} min
              </span>
              <span>{f.note}</span>
            </button>
          ))}
        </div>
        <div className="toolbar">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <input id="mock-include-papers" type="checkbox" checked={includePapers} onChange={(e) => setIncludePapers(e.target.checked)} />
            Include real past-paper questions
          </label>
          <span className="fineprint tabular">{all ? `${pool.length} questions available` : 'Loading questions…'}</span>
          <button type="button" className="btn btn-primary" style={{ marginLeft: 'auto' }} disabled={!all || pool.length < 10} onClick={start}>
            Start the clock
          </button>
        </div>
        <p className="fineprint">The real Preliminary Round runs on Google Forms in your school lab. No calculator: keep a pen and scrap paper next to you for this mock too.</p>

        {past.length > 0 && (
          <section className="section" aria-labelledby="mock-history">
            <h2 id="mock-history" style={{ fontSize: 'var(--step-2)', marginBottom: '0.75rem' }}>
              Your recent mocks
            </h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Format</th>
                    <th>Score</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((e) => (
                    <tr key={e.id}>
                      <td className="tabular">{new Date(e.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>{FORMATS.find((f) => f.id === e.mode)?.title ?? e.mode}</td>
                      <td className="tabular">
                        {e.correct}/{e.total} ({pct(e.correct, e.total)})
                      </td>
                      <td className="tabular">{formatDuration(e.seconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    )
  }

  const fmt = FORMATS.find((f) => f.id === attempt.formatId) ?? FORMATS[0]
  const questions = attempt.ids.map((id) => byId.get(id)).filter(Boolean) as BankQuestion[]

  if (!all) return <div className="page loading-block">Loading your exam…</div>

  // ---------------- results ----------------
  if (attempt.submittedAt) {
    const correct = questions.filter((q) => attempt.answers[q.id] === q.answer).length
    const answered = questions.filter((q) => attempt.answers[q.id] != null).length
    const used = Math.min(attempt.durationSec, Math.round((attempt.submittedAt - attempt.startedAt) / 1000))
    const dom = EXAM_DOMAINS.map((d) => {
      const qs = questions.filter((q) => q.domain === d)
      const c = qs.filter((q) => attempt.answers[q.id] === q.answer).length
      return { d, total: qs.length, correct: c }
    })
    const subs = new Map<string, { total: number; correct: number }>()
    for (const q of questions) {
      if (!q.subtopic) continue
      const s = subs.get(q.subtopic) ?? { total: 0, correct: 0 }
      s.total++
      if (attempt.answers[q.id] === q.answer) s.correct++
      subs.set(q.subtopic, s)
    }
    const weakest = [...subs.entries()].filter(([, v]) => v.total >= 2).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total).slice(0, 5)
    const review = questions.filter((q) =>
      reviewFilter === 'all' ? true : reviewFilter === 'flagged' ? attempt.flags.includes(q.id) : attempt.answers[q.id] !== q.answer,
    )

    return (
      <div className="page">
        <div className="page-head">
          <span className="eyebrow">Mock exam · {fmt.title}</span>
          <h1>Your result</h1>
        </div>
        <div className="result-hero">
          <div>
            <div className="big">
              {correct}
              <span style={{ fontSize: '0.45em' }}>/{questions.length}</span>
            </div>
            <div className="lab">{pct(correct, questions.length)} correct</div>
          </div>
          <div>
            <div className="big" style={{ fontSize: 'var(--step-3)' }}>
              {formatDuration(used)}
            </div>
            <div className="lab">time used of {fmt.minutes} min</div>
          </div>
          <div>
            <div className="big" style={{ fontSize: 'var(--step-3)' }}>
              {answered}
            </div>
            <div className="lab">answered ({questions.length - answered} left blank)</div>
          </div>
        </div>
        {used >= attempt.durationSec && <p className="fineprint">Time ran out, so your answers were submitted automatically.</p>}

        <div className="guide-grid">
          <section className="guide-card">
            <h3>By domain</h3>
            <Bars
              data={dom.map((x) => ({ label: DOMAIN_LABEL[x.d], value: x.total ? x.correct / x.total : 0, color: `var(--d-${x.d === 'mathematics' ? 'math' : x.d === 'ai_ml_dl' ? 'ai' : x.d === 'generative_ai' ? 'genai' : x.d === 'problem_solving' ? 'problem' : 'computing'})` }))}
              max={1}
              format={(v) => `${Math.round(v * 100)}%`}
              ariaLabel="Accuracy by domain"
            />
          </section>
          <section className="guide-card">
            <h3>Topics to revisit</h3>
            {weakest.length ? (
              <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {weakest.map(([s, v]) => (
                  <li key={s} className="tabular">
                    {SUBTOPIC_LABEL[s] ?? s}: {v.correct}/{v.total}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Not enough data yet.</p>
            )}
            <Link to="/practice" className="btn btn-small" style={{ justifySelf: 'start' }}>
              Practise weak topics
            </Link>
          </section>
        </div>

        <section className="section" aria-labelledby="review-h">
          <div className="toolbar">
            <h2 id="review-h" style={{ fontSize: 'var(--step-2)' }}>
              Review
            </h2>
            <label>
              Show
              <select
                id="mock-review-filter"
                value={reviewFilter}
                onChange={(e) => {
                  setReviewFilter(e.target.value as typeof reviewFilter)
                  setReviewLimit(REVIEW_PAGE)
                }}
              >
                <option value="wrong">Wrong or blank ({questions.length - correct})</option>
                <option value="flagged">Flagged ({attempt.flags.length})</option>
                <option value="all">All ({questions.length})</option>
              </select>
            </label>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-primary" onClick={discard}>
                New mock exam
              </button>
            </span>
          </div>
          <div className="paper-q-list">
            {review.slice(0, reviewLimit).map((q) => (
              <QuestionCard
                shuffle={q.source !== 'paper'}
                key={q.id}
                q={q}
                number={attempt.ids.indexOf(q.id) + 1}
                seed={attempt.seed}
                selected={attempt.answers[q.id] ?? null}
                revealed
                meta={
                  <>
                    <DomainChip domain={q.domain as ExamDomain} />
                    <span className="chip">{q.sourceLabel}</span>
                  </>
                }
              />
            ))}
            {review.length === 0 && <div className="empty">Nothing to show here.</div>}
          </div>
          {review.length > reviewLimit && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button type="button" className="btn" onClick={() => setReviewLimit((l) => l + REVIEW_PAGE)}>
                Show {Math.min(REVIEW_PAGE, review.length - reviewLimit)} more ({review.length - reviewLimit} left)
              </button>
            </div>
          )}
        </section>
      </div>
    )
  }

  // ---------------- exam in progress ----------------
  const cur = Math.min(attempt.current, questions.length - 1)
  const q = questions[cur]
  const answered = questions.filter((x) => attempt.answers[x.id] != null).length
  const elapsed = attempt.durationSec - remaining
  const expected = Math.min(questions.length, Math.floor(elapsed / (attempt.durationSec / questions.length)))
  const flagged = q ? attempt.flags.includes(q.id) : false
  const go = (i: number) => {
    moved.current = true
    setAttempt({ ...attempt, current: Math.max(0, Math.min(questions.length - 1, i)) })
  }

  return (
    <div className="page">
      <div className="mock-bar">
        <div>
          <div className={`mock-timer${remaining < 300 ? ' is-low' : ''}`} role="timer" aria-live="off">
            {formatDuration(Math.max(0, remaining))}
          </div>
          <div className="mock-pace tabular">
            {answered}/{questions.length} answered · {answered >= expected ? 'on pace' : `${expected - answered} behind pace`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-small" ref={submitBtn} onClick={() => setConfirming(true)}>
            Submit
          </button>
        </div>
      </div>

      {confirming && (
        <div
          className="confirm-box"
          role="alertdialog"
          aria-label="Confirm submit"
          style={{ marginBottom: '1rem' }}
          ref={confirmRef}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeConfirm()
          }}
        >
          <strong>
            Submit now? You have answered {answered} of {questions.length}.
          </strong>
          <span>Blank answers score zero, and wrong answers cost nothing, so it's worth guessing the rest first.</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary btn-small" onClick={submit}>
              Yes, submit and see results
            </button>
            <button type="button" className="btn btn-small" onClick={closeConfirm}>
              Keep going
            </button>
            <button type="button" className="btn btn-ghost btn-small" onClick={discard} style={{ marginLeft: 'auto' }}>
              Abandon this attempt
            </button>
          </div>
        </div>
      )}

      <div className="mock-layout">
        <div>
          {q && (
            <QuestionCard
              shuffle={q.source !== 'paper'}
              key={q.id}
              cardRef={cardRef}
              q={q}
              number={cur + 1}
              seed={attempt.seed}
              selected={attempt.answers[q.id] ?? null}
              revealed={false}
              onSelect={(i) => setAttempt({ ...attempt, answers: { ...attempt.answers, [q.id]: i } })}
            />
          )}
          <div className="q-actions">
            <button type="button" className="btn" onClick={() => go(cur - 1)} disabled={cur === 0}>
              Previous
            </button>
            <button type="button" className="btn btn-primary" onClick={() => go(cur + 1)} disabled={cur >= questions.length - 1}>
              Next
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              aria-pressed={flagged}
              onClick={() => q && setAttempt({ ...attempt, flags: flagged ? attempt.flags.filter((f) => f !== q.id) : [...attempt.flags, q.id] })}
            >
              {flagged ? 'Unflag' : 'Flag for review'}
            </button>
          </div>
        </div>
        <aside className="practice-stats" aria-label="Question navigator">
          <span className="eyebrow">Questions</span>
          <div className="qnav">
            {questions.map((x, i) => (
              <button
                key={x.id}
                type="button"
                className={`${attempt.answers[x.id] != null ? 'is-answered' : ''}${attempt.flags.includes(x.id) ? ' is-flagged' : ''}${i === cur ? ' is-current' : ''}`}
                onClick={() => go(i)}
                aria-label={`Question ${i + 1}${attempt.answers[x.id] != null ? ', answered' : ''}${attempt.flags.includes(x.id) ? ', flagged' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <span className="fineprint">Shaded = answered, orange underline = flagged.</span>
        </aside>
      </div>
    </div>
  )
}
