import { Highlight, themes } from 'prism-react-renderer'
import type { CSSProperties, ReactNode } from 'react'

/*
  Small syntax-coloured Python snippets for the pytorch visuals (training-loop and
  devices-and-common-errors). Colours come from the site's global .tok classes, so they follow
  light and dark mode.
*/

export const MONO = 'var(--font-mono)'

/** One line (or a few lines) of Python, coloured, as an inline-block span. */
export function Py({ code, style, size = 13 }: { code: string; style?: CSSProperties; size?: number }) {
  return (
    <Highlight code={code} language="python" theme={themes.vsLight}>
      {({ tokens, getTokenProps }) => (
        <span style={{ fontFamily: MONO, fontSize: size, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', ...style }}>
          {tokens.map((line, i) => (
            <span key={i}>
              {i > 0 && '\n'}
              {line.map((token, k) => {
                if (token.empty) return null
                const tp = getTokenProps({ token })
                return (
                  <span key={k} className={`tok ${token.types.join(' ')}`}>
                    {String(tp.children ?? '').replace(/\n/g, '')}
                  </span>
                )
              })}
            </span>
          ))}
        </span>
      )}
    </Highlight>
  )
}

/** A bordered code panel with optional title and per-line highlight tones. */
export function PyPanel({
  lines,
  title,
  tones,
  size = 13,
}: {
  lines: string[]
  title?: ReactNode
  /** tone per line index: highlight a line as ok / bad / warn */
  tones?: Record<number, 'ok' | 'bad' | 'warn' | 'hl'>
  size?: number
}) {
  const bg = (t?: string) =>
    t === 'ok'
      ? 'color-mix(in srgb, var(--ok) 15%, var(--surface))'
      : t === 'bad'
        ? 'color-mix(in srgb, var(--bad) 15%, var(--surface))'
        : t === 'warn'
          ? 'color-mix(in srgb, var(--warn) 16%, var(--surface))'
          : t === 'hl'
            ? 'var(--highlight-soft)'
            : undefined
  const bar = (t?: string) => (t === 'ok' ? 'var(--ok)' : t === 'bad' ? 'var(--bad)' : t === 'warn' ? 'var(--warn)' : t === 'hl' ? 'var(--highlight)' : undefined)
  return (
    <div style={{ border: '1px solid var(--rule)', borderRadius: 10, background: 'var(--surface-2)', overflow: 'hidden', width: '100%', minWidth: 0 }}>
      {title && (
        <div style={{ padding: '0.3rem 0.75rem', borderBottom: '1px solid var(--rule)', background: 'var(--surface-3)', fontFamily: MONO, fontSize: 12, color: 'var(--ink-3)' }}>{title}</div>
      )}
      <div style={{ padding: '0.4rem 0' }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              padding: '0.05rem 0.75rem',
              background: bg(tones?.[i]),
              boxShadow: tones?.[i] ? `inset 3px 0 0 ${bar(tones?.[i])}` : undefined,
              lineHeight: 1.55,
              minHeight: '1.55em',
            }}
          >
            <Py code={l || ' '} size={size} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Monospace console output box (errors in red). */
export function Out({ children, tone = 'out', title = 'output' }: { children: ReactNode; tone?: 'out' | 'err' | 'ok'; title?: ReactNode }) {
  const colour = tone === 'err' ? 'var(--bad)' : tone === 'ok' ? 'var(--ok)' : 'var(--ink)'
  return (
    <div style={{ border: '1px solid var(--rule)', borderRadius: 10, background: 'var(--surface)', width: '100%', minWidth: 0, overflow: 'hidden' }}>
      <div style={{ padding: '0.22rem 0.75rem', borderBottom: '1px dashed var(--rule)', fontFamily: MONO, fontSize: 12, color: 'var(--ink-3)' }}>{title}</div>
      <div
        role="log"
        aria-live="polite"
        style={{ padding: '0.45rem 0.75rem', fontFamily: MONO, fontSize: 13, lineHeight: 1.5, color: colour, fontWeight: tone === 'err' ? 600 : 400, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
      >
        {children}
      </div>
    </div>
  )
}
