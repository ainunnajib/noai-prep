import type { ReactNode } from 'react'
import { RichText } from '../quiz/RichText'

export type CalloutKind = 'idea' | 'analogy' | 'tip' | 'warn' | 'note' | 'try' | 'exam'

const LABELS: Record<CalloutKind, string> = {
  idea: 'Key idea',
  analogy: 'Picture it',
  tip: 'Tip',
  warn: 'Common mistake',
  note: 'Beginner note',
  try: 'Try it',
  exam: 'In the exam',
}

const ICONS: Record<CalloutKind, ReactNode> = {
  idea: <path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3Zm-2.5 15h5M10.5 21h3" />,
  analogy: <path d="M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Zm4 1.5s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01" />,
  tip: <path d="M5 13l4 4L19 7" />,
  warn: <path d="M12 4l9 16H3L12 4Zm0 6v4m0 3h.01" />,
  note: <path d="M6 4h9l4 4v12H6V4Zm9 0v4h4M9 12h7M9 16h5" />,
  try: <path d="M8 5v14l11-7L8 5Z" />,
  exam: <path d="M7 3h10v18H7V3Zm3 4h4M10 11h4M10 15h2" />,
}

/** Margin-note style callout. Use `kind="idea"` for the one sentence a student must remember. */
export function Callout({ kind = 'note', title, children }: { kind?: CalloutKind; title?: string; children: ReactNode }) {
  return (
    <aside className={`callout callout-${kind}`} role="note">
      <div className="callout-head">
        <svg className="callout-icon" viewBox="0 0 24 24" aria-hidden="true">
          {ICONS[kind]}
        </svg>
        <span className={`callout-label${title ? '' : ' is-default'}`}>{title ? <RichText text={title} inline /> : LABELS[kind]}</span>
      </div>
      <div className="callout-body">{children}</div>
    </aside>
  )
}

export const KeyIdea = (p: { title?: string; children: ReactNode }) => <Callout kind="idea" {...p} />
export const Analogy = (p: { title?: string; children: ReactNode }) => <Callout kind="analogy" {...p} />
export const Tip = (p: { title?: string; children: ReactNode }) => <Callout kind="tip" {...p} />
export const Mistake = (p: { title?: string; children: ReactNode }) => <Callout kind="warn" {...p} />
export const Note = (p: { title?: string; children: ReactNode }) => <Callout kind="note" {...p} />
export const TryIt = (p: { title?: string; children: ReactNode }) => <Callout kind="try" {...p} />
export const ExamTip = (p: { title?: string; children: ReactNode }) => <Callout kind="exam" {...p} />
