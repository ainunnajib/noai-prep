import { Highlight, themes } from 'prism-react-renderer'
import type { CSSProperties, ReactNode } from 'react'
import s from './ui.module.css'

/*
  Small building blocks shared by the debugging-and-diagnosis visuals (this lesson and the
  systematic-debugging / pytorch-gotchas lessons import them too). Colours come from theme tokens.
*/

export const MONO = 'var(--font-mono)'

export type ChipState = 'idle' | 'selected' | 'good' | 'bad' | 'muted'

export function Chip({ children, state = 'idle', onClick, disabled, title }: { children: ReactNode; state?: ChipState; onClick: () => void; disabled?: boolean; title?: string }) {
  const cls = [s.chip, state === 'selected' && s.selected, state === 'good' && s.good, state === 'bad' && s.bad, state === 'muted' && s.muted].filter(Boolean).join(' ')
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} aria-pressed={state !== 'idle' && state !== 'muted'} title={title}>
      {children}
    </button>
  )
}

export function Chips({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className={s.chips} role="group" aria-label={label}>
      {children}
    </div>
  )
}

/** A labelled block inside a figure ("1. Diagnose", "2. Treat"). */
export function Section({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className={s.section}>
      <div className={s.stepLabel}>{label}</div>
      {children}
    </div>
  )
}

export type Tone = 'plain' | 'good' | 'bad' | 'warn' | 'info'

/** Soft panel for live verdicts under a visual. */
export function Note({ children, tone = 'plain', live = true }: { children: ReactNode; tone?: Tone; live?: boolean }) {
  const colour = tone === 'good' ? 'var(--ok)' : tone === 'bad' ? 'var(--bad)' : tone === 'warn' ? 'var(--warn)' : tone === 'info' ? 'var(--accent)' : 'var(--rule)'
  const style: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: tone === 'plain' ? 'var(--surface-2)' : `color-mix(in srgb, ${colour} 11%, var(--surface))`,
    borderLeft: `4px solid ${colour}`,
    borderRadius: 'var(--radius-m)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    color: 'var(--ink)',
  }
  return (
    <div style={style} aria-live={live ? 'polite' : undefined}>
      {children}
    </div>
  )
}

/** Colour key for plots. */
export function Legend({ items }: { items: { color: string; label: ReactNode; dash?: boolean; faint?: boolean; thin?: boolean }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1rem', justifyContent: 'center', fontSize: '0.82rem', color: 'var(--ink-2)' }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="24" height="12" aria-hidden="true">
            <line
              x1="1"
              x2="23"
              y1="6"
              y2="6"
              style={{ stroke: it.color, strokeWidth: it.thin ? 1.5 : 3, strokeDasharray: it.dash ? '5 3' : undefined, opacity: it.faint ? 0.4 : 1 }}
              strokeLinecap="round"
            />
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  )
}

/** One or more lines of Python, syntax-coloured via the site's .tok classes (works in both themes). */
export function Py({ code, size = 13, style, wrap = true }: { code: string; size?: number; style?: CSSProperties; wrap?: boolean }) {
  return (
    <Highlight code={code} language="python" theme={themes.vsLight}>
      {({ tokens, getTokenProps }) => (
        <span style={{ fontFamily: MONO, fontSize: size, whiteSpace: wrap ? 'pre-wrap' : 'pre', overflowWrap: wrap ? 'anywhere' : 'normal', ...style }}>
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

export type LineTone = 'ok' | 'bad' | 'warn' | 'hl' | 'dim'

const toneBg = (t?: LineTone) =>
  t === 'ok'
    ? 'color-mix(in srgb, var(--ok) 15%, var(--surface))'
    : t === 'bad'
      ? 'color-mix(in srgb, var(--bad) 16%, var(--surface))'
      : t === 'warn'
        ? 'color-mix(in srgb, var(--warn) 16%, var(--surface))'
        : t === 'hl'
          ? 'var(--highlight-soft)'
          : undefined
const toneBar = (t?: LineTone) => (t === 'ok' ? 'var(--ok)' : t === 'bad' ? 'var(--bad)' : t === 'warn' ? 'var(--warn)' : t === 'hl' ? 'var(--highlight)' : 'transparent')

/**
 * A bordered code panel. Pass `onLineClick` to make every line a button (bug hunts);
 * `tones` colours single lines; `notes` adds a small muted comment under a line.
 * Long lines do not wrap (wrapped code is hard to read): the panel scrolls sideways instead,
 * so keep lines short (about 38 characters fits a phone).
 */
export function CodePanel({
  lines,
  title,
  tones,
  notes,
  onLineClick,
  size = 13,
  lineNumbers = true,
  disabled,
  className,
}: {
  lines: string[]
  title?: ReactNode
  tones?: Record<number, LineTone | undefined>
  notes?: Record<number, ReactNode>
  onLineClick?: (i: number) => void
  size?: number
  lineNumbers?: boolean
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={className} style={{ border: '1px solid var(--rule)', borderRadius: 10, background: 'var(--surface-2)', overflow: 'hidden', width: '100%', minWidth: 0 }}>
      {title && (
        <div style={{ padding: '0.3rem 0.75rem', borderBottom: '1px solid var(--rule)', background: 'var(--surface-3)', fontFamily: MONO, fontSize: 12, color: 'var(--ink-2)' }}>{title}</div>
      )}
      <div style={{ padding: '0.35rem 0', overflowX: 'auto' }}>
        <div style={{ display: 'inline-block', minWidth: '100%', verticalAlign: 'top' }}>
        {lines.map((l, i) => {
          const t = tones?.[i]
          const content = (
            <>
              {lineNumbers && <span className={s.lineNo}>{i + 1}</span>}
              <Py code={l || ' '} size={size} wrap={false} style={{ opacity: t === 'dim' ? 0.45 : 1 }} />
              {notes?.[i] && <span style={{ display: 'block', paddingLeft: lineNumbers ? '2.15em' : 0, fontSize: 12, color: 'var(--ink-2)', fontFamily: 'var(--font-body)', lineHeight: 1.4, whiteSpace: 'normal' }}>{notes[i]}</span>}
            </>
          )
          const style: CSSProperties = { background: toneBg(t), borderLeftColor: toneBar(t), whiteSpace: 'nowrap' }
          return onLineClick ? (
            <button key={i} type="button" className={s.codeLine} style={style} onClick={() => onLineClick(i)} disabled={disabled} aria-label={`line ${i + 1}: ${l.trim() || 'blank'}`}>
              {content}
            </button>
          ) : (
            <div key={i} className={s.codeLine} style={style}>
              {content}
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

/** Console output box. */
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

export const uiClasses = s
