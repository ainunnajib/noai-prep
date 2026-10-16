import type { ReactNode } from 'react'

export interface BarDatum {
  label: ReactNode
  value: number
  color?: string
  /** emphasise this bar */
  strong?: boolean
}

/** Horizontal bar chart in HTML (probabilities, scores, feature importance, attention weights). */
export function Bars({ data, max, format = (v) => v.toFixed(2), ariaLabel }: { data: BarDatum[]; max?: number; format?: (v: number) => string; ariaLabel?: string }) {
  const top = max ?? Math.max(1e-9, ...data.map((d) => Math.abs(d.value)))
  return (
    <div className="bars" role="list" aria-label={ariaLabel}>
      {data.map((d, i) => (
        <div key={i} className={`bars-row${d.strong ? ' is-strong' : ''}`} role="listitem">
          <span className="bars-label">{d.label}</span>
          <span className="bars-track">
            <span className="bars-fill" style={{ width: `${Math.max(0, Math.min(100, (Math.abs(d.value) / top) * 100))}%`, background: d.color ?? 'var(--viz-1)' }} />
          </span>
          <span className="bars-value tabular">{format(d.value)}</span>
        </div>
      ))}
    </div>
  )
}
