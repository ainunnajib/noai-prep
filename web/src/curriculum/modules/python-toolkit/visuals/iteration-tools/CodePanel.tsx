import type { ReactNode } from 'react'
import s from './it.module.css'

/*
  A small read-only Python listing for visuals: line numbers, light syntax colouring and an
  optional highlighted (currently running) line. Lines are plain strings.
*/

const KEYWORDS = new Set(['def', 'return', 'for', 'in', 'if', 'else', 'elif', 'while', 'yield', 'lambda', 'None', 'True', 'False', 'and', 'or', 'not', 'global', 'import', 'from', 'pass'])
const TOKEN = /(#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|(.)/g

export function highlightPython(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let prevWord = ''
  let m: RegExpExecArray | null
  let k = 0
  TOKEN.lastIndex = 0
  while ((m = TOKEN.exec(line))) {
    const [tok, comment, str, num, word] = m
    if (comment) out.push(<span key={k++} className={s.comment}>{tok}</span>)
    else if (str) out.push(<span key={k++} className={s.str}>{tok}</span>)
    else if (num) out.push(<span key={k++} className={s.num}>{tok}</span>)
    else if (word) {
      if (KEYWORDS.has(word)) out.push(<span key={k++} className={s.kw}>{tok}</span>)
      else if (prevWord === 'def') out.push(<span key={k++} className={s.fnName}>{tok}</span>)
      else out.push(tok)
      prevWord = word
      continue
    } else out.push(tok)
    if (!/^\s+$/.test(tok)) prevWord = ''
  }
  return out
}

export function CodePanel({ lines, active, label, numbers = true }: { lines: (string | ReactNode)[]; active?: number | number[]; label?: string; numbers?: boolean }) {
  const on = Array.isArray(active) ? active : active == null ? [] : [active]
  return (
    <pre className={s.code} aria-label={label ?? 'Python code'}>
      {lines.map((l, i) => (
        <span key={i} className={`${s.line} ${on.includes(i + 1) ? s.lineOn : ''}`}>
          {numbers && <span className={s.ln}>{i + 1}</span>}
          {typeof l === 'string' ? highlightPython(l) : l}
        </span>
      ))}
    </pre>
  )
}
