import { Fragment } from 'react'
import { M } from '../../../../../kit'

/** Renders the tiny markup used in this lesson's data: $…$ → KaTeX, `…` → code, everything else as text. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|`[^`]+`)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.length > 1 && p.startsWith('$') && p.endsWith('$')) return <M key={i}>{p.slice(1, -1)}</M>
        if (p.length > 1 && p.startsWith('`') && p.endsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>
        return <Fragment key={i}>{p}</Fragment>
      })}
    </>
  )
}

/** An option string in a given kind: maths, code or plain text. */
export function Opt({ text, kind }: { text: string; kind: 'math' | 'code' | 'text' }) {
  if (kind === 'math' && !/^[a-z ]+$/i.test(text)) return <M>{text}</M>
  if (kind === 'code' && text !== 'Error') return <code>{text}</code>
  return <>{text}</>
}
