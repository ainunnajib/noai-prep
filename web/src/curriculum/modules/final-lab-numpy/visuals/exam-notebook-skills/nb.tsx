import { Highlight, themes } from 'prism-react-renderer'
import type { ReactNode } from 'react'
import s from './nb.module.css'

/*
  Jupyter-style building blocks shared by the final-lab-numpy visuals:
  <Notebook> wraps cells, <NbCell> is one code/markdown cell with its "In [n]:" prompt,
  tags (DO NOT EDIT / your answer) and output, and <CodeLines> renders syntax-highlighted
  Python whose lines can be highlighted, marked as added/removed, or clicked.
*/

export type LineMark = 'hl' | 'ok' | 'bad' | 'add' | 'del' | 'dim' | undefined

export const nbStyles = s

export function Notebook({ children, ariaLabel }: { children: ReactNode; ariaLabel?: string }) {
  return (
    <div className={s.nb} role="group" aria-label={ariaLabel}>
      {children}
    </div>
  )
}

export function CodeLines({
  code,
  mark,
  onLineClick,
  lineLabel,
  numbers = false,
  wrap = false,
  compact = false,
}: {
  code: string
  /** visual mark for line i (0-based) */
  mark?: (i: number) => LineMark
  /** make lines clickable */
  onLineClick?: (i: number) => void
  /** accessible label for a clickable line */
  lineLabel?: (i: number, text: string) => string
  numbers?: boolean
  /** wrap long lines (with a hanging indent) instead of scrolling */
  wrap?: boolean
  /** for phones: pull aligned end-of-line comments in, and indent continuation lines by 4 */
  compact?: boolean
}) {
  const src = compact ? compactCode(code.replace(/\n$/, '')) : code.replace(/\n$/, '')
  return (
    <Highlight code={src} language="python" theme={themes.vsLight}>
      {({ tokens, getTokenProps }) => (
        <pre className={`${s.code}${wrap ? ' ' + s.wrap : ''}`} tabIndex={onLineClick ? undefined : 0}>
          <code>
            {tokens.map((line, i) => {
              const m = mark?.(i)
              const cls = [s.line, m ? s[m] : '', onLineClick ? s.clickable : ''].filter(Boolean).join(' ')
              const text = line.map((t) => t.content).join('')
              // when wrapping, drop the leading spaces and indent with padding instead, so a
              // wrapped continuation line hangs 3 characters to the right of its own line
              const indent = wrap ? text.length - text.trimStart().length : 0
              let strip = indent
              const style = wrap ? { paddingLeft: `calc(0.7rem + ${indent + 3}ch)`, textIndent: '-3ch' } : undefined
              const body = (
                <>
                  {numbers && (
                    <span className={s.ln} aria-hidden="true">
                      {i + 1}
                    </span>
                  )}
                  {line.map((token, k) => {
                    const tp = getTokenProps({ token })
                    let content = tp.children as string
                    if (strip > 0 && typeof content === 'string') {
                      const lead = content.length - content.trimStart().length
                      const cut = Math.min(lead, strip)
                      content = content.slice(cut)
                      strip -= cut
                    }
                    return (
                      <span key={k} className={`tok ${token.types.join(' ')}`}>
                        {content}
                      </span>
                    )
                  })}
                </>
              )
              if (!onLineClick) {
                return (
                  <span key={i} className={cls} style={style}>
                    {body}
                  </span>
                )
              }
              return (
                <span
                  key={i}
                  className={cls}
                  style={style}
                  role="button"
                  tabIndex={0}
                  aria-label={lineLabel ? lineLabel(i, text) : `line ${i + 1}: ${text.trim() || 'blank'}`}
                  onClick={() => onLineClick(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onLineClick(i)
                    }
                  }}
                >
                  {body}
                </span>
              )
            })}
          </code>
        </pre>
      )}
    </Highlight>
  )
}

export function NbCell({
  kind = 'code',
  prompt,
  tags = [],
  active,
  locked,
  children,
  output,
  outputKind = 'plain',
  outputLabel,
  headExtra,
}: {
  kind?: 'code' | 'markdown'
  /** e.g. 'In [3]:' ; omitted for markdown */
  prompt?: string
  tags?: { text: string; tone?: 'lock' | 'answer' | 'warn' | 'plain' }[]
  active?: boolean
  locked?: boolean
  children: ReactNode
  output?: ReactNode
  outputKind?: 'plain' | 'error' | 'ok' | 'bad'
  outputLabel?: string
  headExtra?: ReactNode
}) {
  const cls = [s.cell, active ? s.cellActive : '', locked ? s.cellLocked : ''].filter(Boolean).join(' ')
  const outCls = [s.out, outputKind === 'error' ? s.outError : outputKind === 'ok' ? s.outOk : outputKind === 'bad' ? s.outBad : ''].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <div className={s.head}>
        <span className={s.prompt}>{kind === 'markdown' ? 'Markdown' : (prompt ?? 'In [ ]:')}</span>
        {(tags.length > 0 || headExtra) && (
          <span className={s.headRight}>
            {tags.map((t, i) => (
              <span key={i} className={`${s.tag} ${t.tone === 'lock' ? s.tagLock : t.tone === 'answer' ? s.tagAnswer : t.tone === 'warn' ? s.tagWarn : ''}`}>
                {t.text}
              </span>
            ))}
            {headExtra}
          </span>
        )}
      </div>
      {kind === 'markdown' ? <div className={s.md}>{children}</div> : children}
      {output !== undefined && output !== null && (
        <div className={outCls} aria-live="polite" style={typeof output === 'string' && output.includes('\n') ? { whiteSpace: 'pre', overflowX: 'auto', overflowWrap: 'normal' } : undefined}>
          {outputLabel && <span className={s.outLabel}>{outputLabel}</span>}
          {output}
        </div>
      )}
    </div>
  )
}

/** A coloured explanation box under a visual. */
export function Note({ tone = 'info', title, children }: { tone?: 'info' | 'ok' | 'bad'; title?: ReactNode; children: ReactNode }) {
  return (
    <div className={`${s.note} ${tone === 'ok' ? s.noteOk : tone === 'bad' ? s.noteBad : ''}`} aria-live="polite">
      {title && <span className={s.noteTitle}>{title}</span>}
      {children}
    </div>
  )
}

/**
 * Make code friendlier to a narrow screen without changing its meaning: comments aligned far to
 * the right are pulled in to two spaces, and continuation lines (indented to line up with an
 * opening bracket) are indented 4 spaces past the line they continue.
 */
export function compactCode(code: string): string {
  let base = 0
  return code
    .split('\n')
    .map((line) => {
      let l = line.replace(/^(\s*\S.*?)\s{2,}(#.*)$/, '$1  $2')
      const indent = l.length - l.trimStart().length
      if (l.trim() === '') return l
      if (indent % 4 !== 0) l = ' '.repeat(base + 4) + l.trimStart()
      else base = indent
      return l
    })
    .join('\n')
}
