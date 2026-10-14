import { useState } from 'react'
import { QuestionCard } from './QuestionCard'

let counter = 0

/**
 * A single inline question inside a lesson.
 *   <QuickCheck q="What is 2 + 2?" options={['3', '4']} answer={1} explain="Because…" />
 */
export function QuickCheck({ q, options, answer, explain, code, id }: { q: string; options: string[]; answer: number; explain: string; code?: string; id?: string }) {
  const [sel, setSel] = useState<number | null>(null)
  const [qid] = useState(() => id ?? `quickcheck-${++counter}`)
  return (
    <div className="quickcheck">
      <div className="eyebrow">Quick check</div>
      <QuestionCard
        q={{ id: qid, prompt: q, options, answer, explanation: explain, code }}
        selected={sel}
        revealed={sel != null}
        onSelect={setSel}
      />
      {sel != null && (
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setSel(null)}>
          Reset
        </button>
      )}
    </div>
  )
}
