import { useMemo } from 'react'
import type { QuizQuestion } from '../../curriculum/types'
import { optionOrder } from '../../lib/random'
import { CodeBlock } from '../content/CodeBlock'
import { RichText } from './RichText'

export interface QuestionCardProps {
  q: QuizQuestion
  /** index of the chosen ORIGINAL option, or null */
  selected: number | null
  onSelect?: (originalIndex: number) => void
  /** show correctness + explanation */
  revealed: boolean
  /** shuffle option display order (stable per question id + seed) */
  shuffle?: boolean
  seed?: number
  number?: number
  meta?: React.ReactNode
  headerExtra?: React.ReactNode
  /** answers are shown by default (a paper's study mode): an unanswered card is not "skipped" */
  studyMode?: boolean
  /** given by pages that swap one question for the next: the card can then take focus (see revealQuestion) */
  cardRef?: React.Ref<HTMLElement>
}

const LETTERS = 'ABCDEFGH'

export function QuestionCard({ q, selected, onSelect, revealed, shuffle = true, seed = 0, number, meta, headerExtra, studyMode, cardRef }: QuestionCardProps) {
  const order = useMemo(() => (shuffle ? optionOrder(q.options.length, q.id, seed) : q.options.map((_, i) => i)), [q, shuffle, seed])
  const correct = selected === q.answer

  return (
    <article
      ref={cardRef}
      tabIndex={cardRef ? -1 : undefined}
      aria-label={cardRef && number != null ? `Question ${number}` : undefined}
      className={`qcard${revealed ? (correct ? ' is-correct' : selected != null ? ' is-wrong' : studyMode ? '' : ' is-skipped') : ''}`}
    >
      <header className="qcard-head">
        {number != null && <span className="qcard-num tabular">Q{number}</span>}
        {meta && <span className="qcard-meta">{meta}</span>}
        {headerExtra}
      </header>
      <div className="qcard-prompt">
        <RichText text={q.prompt} />
        {q.code && <CodeBlock code={q.code} language={q.codeLang ?? 'python'} />}
      </div>
      <div className="qcard-options" role="group" aria-label="Answer options">
        {order.map((orig, pos) => {
          const isSel = selected === orig
          const isAns = orig === q.answer
          let state = ''
          if (revealed && isAns) state = ' is-answer'
          else if (revealed && isSel && !isAns) state = ' is-chosen-wrong'
          else if (isSel) state = ' is-selected'
          // aria-disabled (not disabled) once answered, so keyboard focus stays on the chosen option
          const locked = revealed || !onSelect
          return (
            <button
              key={orig}
              type="button"
              aria-pressed={isSel}
              aria-disabled={locked || undefined}
              className={`qopt${state}${locked ? ' is-locked' : ''}`}
              onClick={() => {
                if (!locked) onSelect?.(orig)
              }}
            >
              <span className="qopt-letter" aria-hidden="true">
                {LETTERS[pos]}
              </span>
              <span className="qopt-text">
                <RichText text={q.options[orig]} inline />
              </span>
              {revealed && isAns && <span className="qopt-mark">Correct answer</span>}
              {revealed && isSel && !isAns && <span className="qopt-mark">Your answer</span>}
            </button>
          )
        })}
      </div>
      {/* a live region, so screen readers announce the verdict when it appears */}
      <div aria-live="polite">
        {revealed && (
          <div className="qcard-explain">
            <div className="qcard-verdict">{selected == null ? (studyMode ? 'Answer and explanation' : 'Not answered') : correct ? 'Correct' : 'Not quite'}</div>
            <RichText text={q.explanation} />
            {q.caveat && (
              <div className="qcard-caveat">
                <strong>Note:</strong> <RichText text={q.caveat} inline />
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
