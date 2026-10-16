import { useEffect, useMemo, useRef, useState } from 'react'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { DOMAIN_SUBTOPICS, SUBTOPIC_LABEL, loadAllQuestions, type BankQuestion, type ExamDomain } from '../data/bank'
import { DOMAIN_LABEL, DomainChip, EXAM_DOMAINS } from '../lib/domains'
import { pct } from '../lib/format'
import { progress, useProgress } from '../lib/progress'
import { shuffled } from '../lib/random'
import { revealQuestion } from '../lib/revealQuestion'

type Focus = 'all' | 'new' | 'wrong'
type Source = 'all' | 'bank' | 'course' | 'paper'

export default function Practice() {
  const [all, setAll] = useState<BankQuestion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [domain, setDomain] = useState<'all' | ExamDomain>('all')
  const [subtopic, setSubtopic] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [source, setSource] = useState<Source>('all')
  const [focus, setFocus] = useState<Focus>('all')
  const [round, setRound] = useState(0)
  const [pos, setPos] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [session, setSession] = useState({ answered: 0, correct: 0 })
  const prog = useProgress()

  useEffect(() => {
    document.title = 'Practice · NOAI Prep'
    loadAllQuestions().then(setAll, (e) => setError(String(e)))
    return () => {
      document.title = 'NOAI Prep'
    }
  }, [])

  const pool = useMemo(() => {
    if (!all) return []
    return all.filter((q) => {
      if (domain !== 'all' && q.domain !== domain) return false
      if (subtopic !== 'all' && q.subtopic !== subtopic) return false
      if (difficulty !== 'all' && q.difficulty !== difficulty) return false
      if (source !== 'all' && q.source !== source) return false
      const hist = prog.answers[q.id]
      if (focus === 'new' && hist?.length) return false
      if (focus === 'wrong' && !(hist?.length && !hist[hist.length - 1])) return false
      return true
    })
    // prog.answers deliberately excluded: re-filtering mid-session would reshuffle the queue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, domain, subtopic, difficulty, source, focus, round])

  const subtopics = useMemo(() => {
    if (domain === 'all' || !all) return []
    const present = new Set(all.filter((q) => q.domain === domain && q.subtopic).map((q) => q.subtopic))
    return Object.values(DOMAIN_SUBTOPICS).flat().filter((s) => present.has(s))
  }, [all, domain])

  const queue = useMemo(() => shuffled(pool), [pool])
  const q = queue[pos]

  useEffect(() => {
    setPos(0)
    setSelected(null)
  }, [queue])

  const counts = useMemo(() => {
    const c: Record<string, { total: number; correct: number }> = {}
    if (!all) return c
    for (const x of all) {
      const h = prog.answers[x.id]
      if (!h?.length) continue
      c[x.domain] ??= { total: 0, correct: 0 }
      c[x.domain].total += 1
      if (h[h.length - 1]) c[x.domain].correct += 1
    }
    return c
  }, [all, prog.answers])

  const choose = (i: number) => {
    if (!q || selected != null) return
    setSelected(i)
    progress.recordAnswer(q.id, i === q.answer)
    setSession((s) => ({ answered: s.answered + 1, correct: s.correct + (i === q.answer ? 1 : 0) }))
  }
  const cardRef = useRef<HTMLElement>(null)
  const moved = useRef(false)
  const next = () => {
    setSelected(null)
    moved.current = true
    if (pos + 1 < queue.length) setPos(pos + 1)
    else {
      setPos(0)
      setRound((r) => r + 1)
    }
  }
  // on a phone the new question would otherwise open scrolled past its prompt
  useEffect(() => {
    if (!moved.current) return
    moved.current = false
    revealQuestion(cardRef.current)
  }, [pos, round])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (!q || e.key !== 'Enter' || selected == null || t?.closest('input, select, textarea')) return
      // buttons and links handle Enter themselves (Skip would otherwise advance twice); the chosen, locked option is the exception
      if (t?.closest('button, a, [role=button], summary') && !t.closest('.qopt.is-locked')) return
      next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Practice</span>
        <h1>Practise by topic</h1>
        <p className="page-lede">
          Pick what to work on and answer one question at a time. You get the explanation straight away, and your history is saved in this browser so you can come back to the
          ones you got wrong.
        </p>
      </div>

      <div className="toolbar" role="group" aria-label="Filters">
        <label>
          Domain
          <select
            id="practice-domain"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value as 'all' | ExamDomain)
              setSubtopic('all')
            }}
          >
            <option value="all">All domains</option>
            {EXAM_DOMAINS.map((d) => (
              <option key={d} value={d}>
                {DOMAIN_LABEL[d]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Topic
          <select id="practice-subtopic" value={subtopic} onChange={(e) => setSubtopic(e.target.value)} disabled={domain === 'all'}>
            <option value="all">All topics</option>
            {domain !== 'all' &&
              subtopics.map((s) => (
                <option key={s} value={s}>
                  {SUBTOPIC_LABEL[s]}
                </option>
              ))}
          </select>
        </label>
        <label>
          Difficulty
          <select id="practice-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="all">Any</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>
          Source
          <select id="practice-source" value={source} onChange={(e) => setSource(e.target.value as Source)}>
            <option value="all">Everything</option>
            <option value="bank">Question bank</option>
            <option value="course">Course checkpoints</option>
            <option value="paper">Official past papers</option>
          </select>
        </label>
        <label>
          Show
          <select id="practice-focus" value={focus} onChange={(e) => setFocus(e.target.value as Focus)}>
            <option value="all">All questions</option>
            <option value="new">Only ones I haven't tried</option>
            <option value="wrong">Only ones I got wrong last time</option>
          </select>
        </label>
        <span className="fineprint tabular" style={{ marginLeft: 'auto' }}>
          {all ? `${pool.length} matching questions` : 'Loading…'}
        </span>
      </div>

      <div className="practice-wrap">
        <div>
          {error && <div className="empty">The question bank could not load: {error}</div>}
          {!all && !error && <div className="empty">Loading the question bank…</div>}
          {all && !q && <div className="empty">No questions match these filters. Try widening them.</div>}
          {q && (
            <>
              <QuestionCard
                shuffle={q.source !== 'paper'}
                key={`${q.id}-${round}`}
                cardRef={cardRef}
                q={q}
                number={pos + 1}
                selected={selected}
                revealed={selected != null}
                onSelect={choose}
                seed={round}
                meta={
                  <>
                    <DomainChip domain={q.domain} />
                    {q.subtopic && <span className="chip">{SUBTOPIC_LABEL[q.subtopic] ?? q.subtopic}</span>}
                    <span className="chip">{q.difficulty}</span>
                    <span className="chip">{q.sourceLabel}</span>
                  </>
                }
              />
              <div className="q-actions">
                <button type="button" className="btn btn-primary" onClick={next} disabled={selected == null}>
                  Next question
                </button>
                <button type="button" className="btn btn-ghost" onClick={next}>
                  Skip
                </button>
                <span className="fineprint tabular">
                  {pos + 1} of {queue.length} in this set · Enter for next
                </span>
              </div>
            </>
          )}
        </div>
        <aside className="practice-stats" aria-label="Your accuracy">
          <span className="eyebrow">This session</span>
          <div className="stat-row">
            <span>Answered</span>
            <strong>{session.answered}</strong>
          </div>
          <div className="stat-row">
            <span>Correct</span>
            <strong>
              {session.correct} ({pct(session.correct, session.answered)})
            </strong>
          </div>
          <span className="eyebrow" style={{ marginTop: '0.5rem' }}>
            All time, by domain
          </span>
          {EXAM_DOMAINS.map((d) => {
            const c = counts[d]
            return (
              <div key={d} className="stat-row">
                <span>{DOMAIN_LABEL[d]}</span>
                <strong>{c ? `${pct(c.correct, c.total)} of ${c.total}` : '—'}</strong>
              </div>
            )
          })}
        </aside>
      </div>
    </div>
  )
}
