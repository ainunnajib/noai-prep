import type { ReactNode } from 'react'
import s from './tc.module.css'
import { signed } from './toyModel'

/** Horizontal bars that grow left (negative) or right (positive) from a centre line. */
export function DivergingBars({
  rows,
  max,
  ariaLabel,
  leftLabel = '← negative',
  rightLabel = 'positive →',
}: {
  rows: { label: ReactNode; value: number; key: string }[]
  max?: number
  ariaLabel: string
  leftLabel?: string
  rightLabel?: string
}) {
  const top = max ?? Math.max(1e-9, ...rows.map((r) => Math.abs(r.value)))
  return (
    <div className={s.dbars} role="list" aria-label={ariaLabel}>
      {rows.map((r) => {
        const w = Math.min(50, (Math.abs(r.value) / top) * 50)
        const pos = r.value >= 0
        return (
          <div key={r.key} role="listitem" style={{ display: 'contents' }}>
            <span className={s.dLabel}>{r.label}</span>
            <span className={s.dTrack}>
              <span
                className={s.dFill}
                style={{
                  left: pos ? '50%' : `${50 - w}%`,
                  width: `${w}%`,
                  background: pos ? 'var(--viz-pos)' : 'var(--viz-neg)',
                }}
              />
            </span>
            <span className={s.dValue}>{signed(r.value)}</span>
          </div>
        )
      })}
      <span />
      <span className={s.dAxis} aria-hidden="true">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </span>
      <span />
    </div>
  )
}

/** A bar split into P(positive) and P(negative), with the two percentages underneath. */
export function ProbBar({ p }: { p: number }) {
  const pct = Math.round(p * 1000) / 10
  return (
    <div className={s.prob}>
      <div className={s.probBar} role="img" aria-label={`P(positive) = ${pct.toFixed(1)}%, P(negative) = ${(100 - pct).toFixed(1)}%`}>
        <span className={s.probPos} style={{ width: `${pct}%` }} />
        <span className={s.probNeg} style={{ width: `${100 - pct}%` }} />
      </div>
      <div className={s.probLabels} aria-hidden="true">
        <span>positive {Math.round(pct)}%</span>
        <span>negative {100 - Math.round(pct)}%</span>
      </div>
    </div>
  )
}

/** Text box with a row of preset sentences underneath. */
export function SentenceInput({
  value,
  onChange,
  presets,
  label,
}: {
  value: string
  onChange: (v: string) => void
  presets: string[]
  label: string
}) {
  return (
    <div className={s.inputRow}>
      <label className={s.inputLabel}>
        {label}
        <input
          type="text"
          className={s.input}
          value={value}
          maxLength={120}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          style={{ display: 'block', marginTop: '0.3rem' }}
        />
      </label>
      <div className={s.presets} role="group" aria-label="Example sentences">
        {presets.map((p) => (
          <button key={p} type="button" className={s.preset} aria-pressed={p === value} onClick={() => onChange(p)}>
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
