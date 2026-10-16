import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { QuizQuestion } from '../../curriculum/types'
import { progress, useProgress } from '../../lib/progress'
import { QuestionCard } from './QuestionCard'

/**
 * End-of-lesson checkpoint: answer each question for instant feedback. When every question is answered the score is
 * remembered, the lesson is marked complete if the score reaches the pass mark (60%), and a result panel offers the next lesson.
 */
export function Checkpoint({
  questions,
  progressKey,
  title = 'Checkpoint',
  next,
}: {
  questions: QuizQuestion[]
  progressKey?: string
  title?: string
  /** where to go after finishing, e.g. the next lesson */
  next?: { to: string; label: string }
}) {
  const [sel, setSel] = useState<Record<string, number>>({})
  const [round, setRound] = useState(0)
  const prog = useProgress()
  if (!questions.length) return null
  const answered = questions.filter((q) => sel[q.id] != null).length
  const correct = questions.filter((q) => sel[q.id] === q.answer).length
  const done = answered === questions.length
  const passMark = Math.ceil(questions.length * 0.6)

  const choose = (q: QuizQuestion, i: number) => {
    if (sel[q.id] != null) return
    const next = { ...sel, [q.id]: i }
    setSel(next)
    progress.recordAnswer(q.id, i === q.answer)
    const nAnswered = questions.filter((x) => next[x.id] != null).length
    if (nAnswered === questions.length && progressKey) {
      const nCorrect = questions.filter((x) => next[x.id] === x.answer).length
      progress.recordCheckpoint(progressKey, nCorrect / questions.length)
      // only a pass ticks the lesson off; a low score leaves it open for another go
      if (nCorrect >= passMark) progress.markLesson(progressKey, true)
    }
  }

  return (
    <section className="checkpoint" aria-label={title}>
      <div className="checkpoint-head">
        <h2>{title}</h2>
        <p className="checkpoint-sub tabular">
          {done ? `You scored ${correct} / ${questions.length}.` : `${answered} of ${questions.length} answered. Pick an option to see if you're right.`}
        </p>
      </div>
      <div className="checkpoint-list">
        {questions.map((q, i) => (
          <QuestionCard
            key={`${q.id}-${round}`}
            q={q}
            number={i + 1}
            seed={round}
            selected={sel[q.id] ?? null}
            revealed={sel[q.id] != null}
            onSelect={(o) => choose(q, o)}
          />
        ))}
      </div>
      <div aria-live="polite">
        {done && (
          <div className="checkpoint-foot checkpoint-result">
            <p className="checkpoint-score">
              <strong className="tabular">
                You scored {correct} / {questions.length}.
              </strong>{' '}
              {progressKey && correct >= passMark ? 'Lesson marked complete. ' : ''}
              {correct === questions.length
                ? 'Every one right: well done.'
                : correct >= passMark
                  ? 'Read the explanations for the ones you missed, then move on.'
                  : 'Reread the parts of the lesson these questions came from, then try again.'}
              {progressKey && correct < passMark && !prog.lessons[progressKey] ? ` Get ${passMark} or more right and the lesson is ticked off for you.` : ''}
            </p>
            <div className="checkpoint-actions">
              {next && (
                <Link className="btn btn-primary" to={next.to}>
                  {next.label} →
                </Link>
              )}
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setSel({})
                  setRound((r) => r + 1)
                }}
              >
                Try again with shuffled options
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
