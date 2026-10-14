import katex from 'katex'
import { useMemo } from 'react'

function render(tex: string, displayMode: boolean) {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: false, strict: false })
  } catch {
    return tex
  }
}

/** Inline maths for use inside TSX visuals. (In MDX prose, write $x^2$ instead.) */
export function M({ children, tex }: { children?: string; tex?: string }) {
  const src = tex ?? children ?? ''
  const html = useMemo(() => render(src, false), [src])
  return <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />
}

/** Display maths for use inside TSX visuals. (In MDX prose, use a $$ … $$ block.) */
export function MBlock({ children, tex }: { children?: string; tex?: string }) {
  const src = tex ?? children ?? ''
  const html = useMemo(() => render(src, true), [src])
  return <div className="math-block" dangerouslySetInnerHTML={{ __html: html }} />
}
