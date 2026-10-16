import { Fragment, type ReactNode } from 'react'
import s from '../prelim-problem-solving/ppw.module.css'
import { cx } from '../prelim-problem-solving/shared'

/* A Python listing with numbered, optionally clickable lines, light syntax colouring and per-line notes. */

export type LineState = 'plain' | 'hl' | 'bug' | 'found' | 'picked' | 'ok' | 'dim'

const KW = /\b(def|return|for|in|if|else|elif|class|import|from|with|not|and|or|lambda|None|True|False|break|while)\b/

function splitComment(line: string): [string, string] {
  let q: string | null = null
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) {
      if (c === q) q = null
    } else if (c === '"' || c === "'") q = c
    else if (c === '#') return [line.slice(0, i), line.slice(i)]
  }
  return [line, '']
}

function colour(code: string): ReactNode[] {
  const parts = code.split(/('[^']*'|"[^"]*"|\b(?:def|return|for|in|if|else|elif|class|import|from|with|not|and|or|lambda|None|True|False|break|while)\b)/)
  return parts.map((p, i) => {
    if (!p) return null
    if (p.startsWith("'") || p.startsWith('"')) return <span key={i} className={s.tokStr}>{p}</span>
    if (KW.test(p) && p.match(KW)?.[0] === p) return <span key={i} className={s.tokKw}>{p}</span>
    return <Fragment key={i}>{p}</Fragment>
  })
}

export function CodeLine({ text }: { text: string }) {
  const [code, comment] = splitComment(text)
  return (
    <>
      {colour(code)}
      {comment && <span className={s.tokCom}>{comment}</span>}
    </>
  )
}

const STATE_CLASS: Record<LineState, string | undefined> = {
  plain: undefined,
  hl: s.lineHl,
  bug: s.lineBug,
  found: s.lineFound,
  picked: s.linePicked,
  ok: s.lineOk,
  dim: s.lineDim,
}

export function CodePanel({
  lines,
  title,
  state,
  notes,
  onLine,
  disabled,
  ariaLabel,
}: {
  lines: string[]
  title?: ReactNode
  state?: (i: number) => LineState
  notes?: Record<number, ReactNode>
  /** called with the 1-based line number */
  onLine?: (n: number) => void
  disabled?: boolean
  ariaLabel: string
}) {
  return (
    <div className={s.code} role="group" aria-label={ariaLabel}>
      {title && <div className={s.codeTitle}>{title}</div>}
      <div className={s.codeBody}>
        {lines.map((ln, idx) => {
          const n = idx + 1
          const st = state ? state(n) : 'plain'
          const note = notes?.[n]
          // hanging indent: wrapped continuation lines sit 2 characters to the right of the line's own indentation
          const lead = ln.length - ln.trimStart().length
          const inner = (
            <>
              <span className={s.lineNo} aria-hidden="true">
                {n}
              </span>
              <span className={s.codeText} style={{ paddingLeft: `${lead + 2}ch`, textIndent: '-2ch' }}>
                <CodeLine text={ln.trimStart()} />
              </span>
              {note && <span className={s.lineNote}>{note}</span>}
            </>
          )
          const blank = ln.trim() === ''
          return onLine && !blank ? (
            <button
              key={idx}
              type="button"
              className={cx(s.codeLine, STATE_CLASS[st])}
              onClick={() => onLine(n)}
              disabled={disabled}
              aria-label={`Line ${n}: ${ln.trim()}`}
            >
              {inner}
            </button>
          ) : (
            <div key={idx} className={cx(s.codeLine, STATE_CLASS[st])}>
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}
