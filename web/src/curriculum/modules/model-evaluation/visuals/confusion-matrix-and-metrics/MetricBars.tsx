import type { ReactNode } from 'react'
import s from './eval.module.css'

export interface MetricDatum {
  label: ReactNode
  /** value in [0, 1]; NaN means undefined (0/0) */
  value: number
  color?: string
  /** text shown when the value is undefined */
  undefinedText?: string
}

/** Horizontal bars for metrics between 0 and 1 that can be undefined (e.g. precision with no positive predictions). */
export function MetricBars({ data, ariaLabel }: { data: MetricDatum[]; ariaLabel?: string }) {
  return (
    <div className={s.mbars} role="list" aria-label={ariaLabel}>
      {data.map((d, i) => {
        const ok = Number.isFinite(d.value)
        return (
          <div key={i} role="listitem" style={{ display: 'contents' }}>
            <span className={s.mbarLabel}>{d.label}</span>
            <span className={s.mbarTrack}>
              {ok ? (
                <span className={s.mbarFill} style={{ width: `${Math.max(0, Math.min(1, d.value)) * 100}%`, background: d.color ?? 'var(--viz-1)' }} />
              ) : (
                <span className={s.mbarUndef}>{d.undefinedText ?? 'undefined (0/0)'}</span>
              )}
            </span>
            <span className={s.mbarValue}>{ok ? d.value.toFixed(2) : '–'}</span>
          </div>
        )
      })}
    </div>
  )
}
