import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAnimationFrame } from '../../../../../kit'
import d from './drill.module.css'

/* Small helpers shared by the timed drills in this module. */

/** Parse "3", "-2.5", "−2", "3/4", "-1/2", ".5". Returns null if it is not a number. */
export function parseNumber(raw: string): number | null {
  const t = raw.trim().replace(/−/g, '-').replace(/\s+/g, '').replace(/,$/, '')
  if (!t) return null
  const frac = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/)
  if (frac) {
    const den = Number(frac[2])
    return den === 0 ? null : Number(frac[1]) / den
  }
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return Number(t)
  return null
}

/** Parse a list such as "5, 2" or "5 and 2" or "5 2". */
export function parseNumberList(raw: string): number[] | null {
  const parts = raw
    .replace(/−/g, '-')
    .split(/\s*(?:,|;|and|&|\s)\s*/i)
    .filter(Boolean)
  if (!parts.length) return null
  const nums = parts.map(parseNumber)
  return nums.every((x) => x !== null) ? (nums as number[]) : null
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

/** A reduced fraction as text, e.g. frac(6, -8) = "−3/4", frac(4, 2) = "2". */
export function frac(num: number, den: number): string {
  if (den < 0) {
    num = -num
    den = -den
  }
  const g = gcd(num, den)
  const n = num / g
  const m = den / g
  const sign = n < 0 ? '−' : ''
  return m === 1 ? `${sign}${Math.abs(n)}` : `${sign}${Math.abs(n)}/${m}`
}

/** Pretty integer with a real minus sign. */
export const num = (v: number) => (v < 0 ? `−${Math.abs(v)}` : String(v))

/**
 * Counts down from `limit` seconds while `running`; calls onExpire once when it reaches 0.
 * Restart it by changing `resetKey` (a string or number): the reset happens during render, so the
 * expiry check never sees the old, finished clock.
 */
export function useCountdown(limit: number, running: boolean, onExpire: () => void, resetKey: string | number) {
  const [st, setSt] = useState({ key: resetKey, left: limit, fired: false })
  if (st.key !== resetKey) setSt({ key: resetKey, left: limit, fired: false })
  const cb = useRef(onExpire)
  cb.current = onExpire
  useAnimationFrame((dt) => setSt((s) => ({ ...s, left: Math.max(0, s.left - dt) })), running && st.left > 0 && st.key === resetKey)
  useEffect(() => {
    if (running && st.key === resetKey && st.left <= 0 && !st.fired) {
      setSt((s) => ({ ...s, fired: true }))
      cb.current()
    }
  }, [st, running, resetKey])
  return st.key === resetKey ? st.left : limit
}

export function TimerBar({ left, limit, label }: { left: number; limit: number; label?: string }) {
  const f = Math.max(0, Math.min(1, left / limit))
  const colour = f > 0.5 ? 'var(--viz-pos)' : f > 0.25 ? 'var(--viz-2)' : 'var(--viz-neg)'
  return (
    <div style={{ width: '100%', display: 'grid', gap: '0.2rem' }}>
      <div className={d.timer} role="progressbar" aria-label={label ?? 'time left'} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.ceil(left)}>
        <div className={d.timerFill} style={{ width: `${f * 100}%`, background: colour }} />
      </div>
    </div>
  )
}

export function AnswerBox({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  inputRef,
  label,
  children,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  inputRef?: React.RefObject<HTMLInputElement>
  label: string
  children?: ReactNode
}) {
  return (
    <form
      className={d.answer}
      onSubmit={(e) => {
        e.preventDefault()
        if (!disabled) onSubmit()
      }}
    >
      <input
        ref={inputRef}
        className={d.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={label}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <button type="submit" className="btn btn-primary btn-small" disabled={disabled}>
        Check
      </button>
      {children}
    </form>
  )
}

export function Stats({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <div className={d.stats} aria-live="polite">
      {items.map(([k, v], i) => (
        <span key={i} className={d.stat}>
          {k} <strong>{v}</strong>
        </span>
      ))}
    </div>
  )
}

/** Row of small squares: green for a hit, red for a miss (most recent last). */
export function History({ marks }: { marks: boolean[] }) {
  if (!marks.length) return null
  return (
    <div className={d.history} aria-label={`${marks.filter(Boolean).length} right out of ${marks.length}`}>
      {marks.slice(-40).map((m, i) => (
        <span key={i} className={d.histDot} style={{ background: m ? 'var(--viz-pos)' : 'var(--viz-neg)' }} />
      ))}
    </div>
  )
}

/** Close enough? Exact for integers, ±tol for decimals (fractions are accepted exactly or as decimals). */
export const close = (a: number, b: number, tol = 0.011) => Math.abs(a - b) <= tol + 1e-9

export const avg = (xs: number[]) => (xs.length ? xs.reduce((p, q) => p + q, 0) / xs.length : 0)
