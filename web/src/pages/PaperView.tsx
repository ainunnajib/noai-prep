import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { DOMAIN_SUBTOPICS, SUBTOPIC_LABEL, type ExamDomain } from '../data/bank'
import { PAPERS, loadPaper, toQuiz, type PaperQuestion } from '../data/papers'
import { DOMAIN_LABEL, DomainChip, EXAM_DOMAINS } from '../lib/domains'
import { progress } from '../lib/progress'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import NotFound from './NotFound'

const PAGE = 25

export default function PaperView() {
  const { paperId } = useParams()
  const meta = PAPERS.find((p) => p.id === paperId)
  const loc = useLocation()
  const [qs, setQs] = useState<PaperQuestion[] | null>(null)
  const [domain, setDomain] = useState<'all' | ExamDomain>('all')
  const [subtopic, setSubtopic] = useState('all')
  const [mode, setMode] = useState<'try' | 'study'>('try')
  const [sel, setSel] = useState<Record<number, number>>({})
  const [limit, setLimit] = useState(PAGE)
  const handledHash = useRef<string | null>(null)
  useDocumentTitle(meta?.title)

  useEffect(() => {
    if (!meta) return
    let live = true
    loadPaper(meta.id).then((x) => live && setQs(x))
    return () => {
      live = false
    }
  }, [meta])

  const subtopics = useMemo(() => {
    if (domain === 'all' || !qs) return []
    const present = new Set(qs.filter((q) => q.domain === domain).map((q) => q.subtopic))
    const ordered = Object.values(DOMAIN_SUBTOPICS).flat()
    return ordered.filter((s) => present.has(s))
  }, [qs, domain])

  const shown = useMemo(
    () => (qs ?? []).filter((q) => (domain === 'all' || q.domain === domain) && (subtopic === 'all' || q.subtopic === subtopic)),
    [qs, domain, subtopic],
  )

  // deep link: #q12, handled once per hash so later filtering or "Show more" does not jump back
  useEffect(() => {
    const m = /^#q(\d+)$/.exec(loc.hash)
    if (!m || !qs || handledHash.current === loc.hash) return
    const n = Number(m[1])
    const idx = shown.findIndex((q) => q.n === n)
    if (idx < 0) return
    if (idx >= limit) {
      setLimit(idx + 1) // render it first; this effect runs again once it is on the page
      return
    }
    handledHash.current = loc.hash
    requestAnimationFrame(() => document.getElementById(`q${n}`)?.scrollIntoView({ block: 'start' }))
  }, [loc.hash, qs, shown, limit])

  if (!meta) return <NotFound />
  const answered = Object.keys(sel).length
  const correct = (qs ?? []).filter((q) => sel[q.n] === q.answer).length

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <nav className="lesson-crumbs" aria-label="Breadcrumb">
          <Link to="/papers">Past papers</Link>
          <span aria-hidden="true">/</span>
          <span>{meta.short}</span>
        </nav>
        <h1>{meta.title}</h1>
        <p className="page-lede">
          {meta.date} · {meta.format}
        </p>
        <p className="fineprint">
          Source:{' '}
          <a href={meta.sourceUrl} target="_blank" rel="noreferrer">
            AI Singapore
          </a>
          . Explanations by NOAI Prep.
        </p>
      </div>

      <div className="toolbar" role="group" aria-label="Filters">
        <label>
          Domain
          <select
            id="paper-domain"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value as 'all' | ExamDomain)
              setSubtopic('all')
              setLimit(PAGE)
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
          <select id="paper-subtopic" value={subtopic} disabled={domain === 'all'} onChange={(e) => { setSubtopic(e.target.value); setLimit(PAGE) }}>
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
          Mode
          <select id="paper-mode" value={mode} onChange={(e) => setMode(e.target.value as 'try' | 'study')}>
            <option value="try">Try first, then reveal</option>
            <option value="study">Show all answers</option>
          </select>
        </label>
        <span className="fineprint tabular" style={{ marginLeft: 'auto' }}>
          {qs ? `${shown.length} questions${answered ? ` · ${correct}/${answered} correct so far` : ''}` : 'Loading…'}
        </span>
      </div>

      {!qs && <div className="empty">Loading the paper…</div>}
      {qs && qs.length === 0 && <div className="empty">This paper's solutions are being prepared.</div>}
      <div className="paper-q-list">
        {shown.slice(0, limit).map((q) => (
          <div key={q.n} id={`q${q.n}`} className="paper-q">
            <QuestionCard
              q={toQuiz(meta.id, q)}
              number={q.n}
              shuffle={false}
              selected={sel[q.n] ?? null}
              revealed={mode === 'study' || sel[q.n] != null}
              onSelect={(i) => {
                setSel((s) => ({ ...s, [q.n]: i }))
                progress.recordAnswer(`${meta.id}.${q.n}`, i === q.answer)
              }}
              meta={
                <>
                  <DomainChip domain={q.domain} />
                  <span className="chip">{SUBTOPIC_LABEL[q.subtopic] ?? q.subtopic}</span>
                  {(mode === 'study' || sel[q.n] != null) && q.caveat ? <span className="chip" style={{ color: 'var(--warn)' }}>See note</span> : null}
                </>
              }
            />
          </div>
        ))}
      </div>
      {shown.length > limit && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button type="button" className="btn" onClick={() => setLimit((l) => l + PAGE)}>
            Show {Math.min(PAGE, shown.length - limit)} more ({shown.length - limit} left)
          </button>
        </div>
      )}
    </div>
  )
}
