import type { CSSProperties, ReactNode } from 'react'

/** Small colour key shown under a plot. `dash` draws a dashed line swatch, `dot` a round one. */
export function Legend({ items }: { items: { color: string; label: ReactNode; dash?: boolean; dot?: boolean; faint?: boolean }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1rem', justifyContent: 'center', fontSize: '0.82rem', color: 'var(--ink-2)' }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="22" height="12" aria-hidden="true">
            {it.dot ? (
              <circle cx="11" cy="6" r="4.5" style={{ fill: it.color }} />
            ) : (
              <line x1="1" x2="21" y1="6" y2="6" style={{ stroke: it.color, strokeWidth: 3, strokeDasharray: it.dash ? '4 3' : undefined, opacity: it.faint ? 0.45 : 1 }} strokeLinecap="round" />
            )}
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  )
}

/** A soft panel used for live verdicts / explanations under a visual. */
export function Note({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'good' | 'bad' | 'warn' }) {
  const bg =
    tone === 'good'
      ? 'color-mix(in srgb, var(--viz-pos) 12%, var(--surface))'
      : tone === 'bad'
        ? 'color-mix(in srgb, var(--viz-neg) 12%, var(--surface))'
        : tone === 'warn'
          ? 'color-mix(in srgb, var(--viz-6) 14%, var(--surface))'
          : 'var(--surface-2)'
  const border = tone === 'good' ? 'var(--viz-pos)' : tone === 'bad' ? 'var(--viz-neg)' : tone === 'warn' ? 'var(--viz-6)' : 'var(--rule)'
  const style: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: bg,
    borderLeft: `4px solid ${border}`,
    borderRadius: 'var(--radius-m)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.88rem',
    lineHeight: 1.5,
    color: 'var(--ink)',
  }
  return (
    <div style={style} aria-live="polite">
      {children}
    </div>
  )
}
