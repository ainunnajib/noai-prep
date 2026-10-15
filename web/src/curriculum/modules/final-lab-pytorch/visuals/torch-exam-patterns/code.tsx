import { Highlight, themes } from 'prism-react-renderer'
import { useState, type CSSProperties, type ReactNode } from 'react'
import s from './tep.module.css'

/*
  Small code-display helpers shared by the final-lab-pytorch visuals (torch-exam-patterns,
  task-unet-center-crop, task-mean-iou). Token colours come from the site's global .tok classes,
  so they follow light and dark mode.
*/

export const MONO = 'var(--font-mono)'

/** Syntax-coloured Python (one or more lines) as an inline span. */
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

export type Tone = 'ok' | 'bad' | 'warn' | 'hl' | 'dim'

/** A bordered code panel; each line can carry a tone and an optional note shown under it. */
export function CodePanel({
  lines,
  title,
  tones,
  notes,
  size = 13,
  right,
}: {
  lines: string[]
  title?: ReactNode
  tones?: Record<number, Tone | undefined>
  notes?: Record<number, ReactNode>
  size?: number
  /** something to show at the right of the title bar (a copy button, a badge) */
  right?: ReactNode
}) {
  return (
    <div className={s.panel}>
      {(title || right) && (
        <div className={s.panelBar}>
          <span>{title}</span>
          {right}
        </div>
      )}
      <div className={s.panelBody}>
        {lines.map((l, i) => {
          const tone = tones?.[i]
          return (
            <div key={i} className={`${s.line} ${tone ? s[`tone_${tone}`] : ''}`}>
              <Py code={l || ' '} size={size} />
              {notes?.[i] != null && <div className={s.lineNote}>{notes[i]}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Monospace console output box. */
export function OutBox({ children, tone = 'out', title = 'output' }: { children: ReactNode; tone?: 'out' | 'err' | 'ok'; title?: ReactNode }) {
  return (
    <div className={s.out}>
      <div className={s.outBar}>{title}</div>
      <div role="log" aria-live="polite" className={`${s.outBody} ${tone === 'err' ? s.outErr : tone === 'ok' ? s.outOk : ''}`}>
        {children}
      </div>
    </div>
  )
}

/** A copy-to-clipboard button that says "Copied" for a moment. */
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className={s.copy}
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard?.writeText(text).then(
          () => {
            setDone(true)
            window.setTimeout(() => setDone(false), 1400)
          },
          () => setDone(false),
        )
      }}
    >
      {done ? 'Copied' : label}
    </button>
  )
}

/** Pill-shaped choice chips that wrap onto several lines on phones. */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: ReactNode; tone?: 'bad' | 'ok' }[]
  value: T
  onChange: (v: T) => void
  label?: string
}) {
  return (
    <div className={s.chipsWrap} role="radiogroup" aria-label={label}>
      {label && <span className={s.chipsLabel}>{label}</span>}
      <div className={s.chips}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            className={`${s.chip} ${o.value === value ? s.chipOn : ''} ${o.tone === 'bad' ? s.chipBad : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
