import { useCallback, useState, type ReactNode } from 'react'
import s from './ppw.module.css'

/* Small building blocks shared by this author's past-paper visuals (prelim-problem-solving and final-mcqs-and-trends). */

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function cx(...names: (string | false | null | undefined)[]) {
  return names.filter(Boolean).join(' ')
}

export interface OptionItem {
  /** the phrase that makes this option different from the others (highlighted on request) */
  head?: string
  /** rest of the option text, shown after the head */
  text: ReactNode
}

/**
 * Four exam options with letters. Before reveal they are clickable (if onPick is given);
 * after reveal the right one turns green, a wrong pick turns red, and the others are crossed out,
 * each with its one-line reason underneath.
 */
export function OptionList({
  options,
  answer,
  picked,
  onPick,
  reveal,
  why,
  heads = false,
  ariaLabel = 'Answer options',
}: {
  options: OptionItem[]
  answer: number
  picked: number | null
  onPick?: (i: number) => void
  reveal: boolean
  why?: ReactNode[]
  heads?: boolean
  ariaLabel?: string
}) {
  return (
    <div className={s.opts} role="group" aria-label={ariaLabel}>
      {options.map((o, i) => {
        const right = reveal && i === answer
        const wrongPick = reveal && picked === i && i !== answer
        const out = reveal && i !== answer && !wrongPick
        const cls = cx(s.opt, right && s.right, wrongPick && s.wrong, wrongPick && s.out, out && s.out, !reveal && picked === i && s.picked)
        const body = (
          <>
            <span className={s.optLetter} aria-hidden="true">
              {LETTERS[i]}
            </span>
            <span className={s.optBody}>
              <span className={s.optText}>
                {o.head && <span className={cx(heads && s.headMark)}>{o.head}</span>}
                {o.head && o.text ? ' ' : null}
                {o.text}
              </span>
              {reveal && why?.[i] && (
                <span className={s.optWhy}>
                  <b>{right ? 'Why it is right: ' : wrongPick ? 'Your pick, but: ' : 'Out: '}</b>
                  {why[i]}
                </span>
              )}
            </span>
          </>
        )
        return onPick && !reveal ? (
          <button key={i} type="button" className={cls} onClick={() => onPick(i)} aria-label={`Option ${LETTERS[i]}`}>
            {body}
          </button>
        ) : (
          <div key={i} className={cls} aria-label={`Option ${LETTERS[i]}${right ? ', correct' : ''}`}>
            {body}
          </div>
        )
      })}
    </div>
  )
}

/** A coloured note under a visual. */
export function Note({ tone = 'plain', children }: { tone?: 'plain' | 'good' | 'bad' | 'info' | 'warn'; children: ReactNode }) {
  return <div className={cx(s.note, s[`note_${tone}`])}>{children}</div>
}

/** useState that also remembers its value in localStorage for this viewer (never throws). */
export function useStoredState<T>(key: string, fallback: T): [T, (v: T | ((p: T) => T)) => void] {
  const full = `noai-prep:ppw:${key}`
  const [val, setVal] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(full)
      return raw == null ? fallback : (JSON.parse(raw) as T)
    } catch {
      return fallback
    }
  })
  const set = useCallback(
    (v: T | ((p: T) => T)) => {
      setVal((prev) => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
        try {
          window.localStorage.setItem(full, JSON.stringify(next))
        } catch {
          /* storage unavailable: the log just isn't remembered */
        }
        return next
      })
    },
    [full],
  )
  return [val, set]
}

/** A link to another lesson of the course (hash routes). */
export function LessonLink({ to, children }: { to: string; children: ReactNode }) {
  return <a href={`#/learn/${to}`}>{children}</a>
}
