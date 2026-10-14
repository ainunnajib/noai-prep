import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadPaper, PAPERS, toQuiz, type PaperQuestion } from '../../data/papers'
import { QuestionCard } from './QuestionCard'

/**
 * Embed a real NOAI past-paper question in a lesson:
 *   <PastPaperQuestion paper="prelim2026" n={12} />
 */
export function PastPaperQuestion({ paper, n }: { paper: string; n: number }) {
  const [q, setQ] = useState<PaperQuestion | null | undefined>(undefined)
  const [sel, setSel] = useState<number | null>(null)
  const meta = PAPERS.find((p) => p.id === paper)
  useEffect(() => {
    let live = true
    loadPaper(paper).then((qs) => live && setQ(qs.find((x) => x.n === n) ?? null))
    return () => {
      live = false
    }
  }, [paper, n])
  if (q === undefined) return <div className="pastq pastq-loading">Loading past-paper question…</div>
  if (q === null || !meta) return null
  return (
    <div className="pastq">
      <div className="pastq-head">
        <span className="pastq-badge">Real exam question</span>
        <Link to={`/papers/${paper}#q${n}`} className="pastq-src">
          {meta.short} · Q{n}
        </Link>
      </div>
      <QuestionCard q={toQuiz(paper, q)} selected={sel} revealed={sel != null} onSelect={setSel} shuffle={false} />
    </div>
  )
}
