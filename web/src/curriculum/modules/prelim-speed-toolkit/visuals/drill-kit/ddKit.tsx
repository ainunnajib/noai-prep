import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAnimationFrame } from '../../../../../kit'
import s from './dd.module.css'

/* Small helpers shared by the timed drills (drill-conv-and-params, drill-shapes-and-code) and the mock lesson. */

/** "1216" -> "1,216" (British grouping). */
export const fmtInt = (v: number) => Math.round(v).toLocaleString('en-GB')

/** Up to 6 significant digits, no trailing zeros, no float noise: 0.060000000001 -> "0.06". */
export function fmtNum(v: number): string {
  if (Number.isInteger(v)) return fmtInt(v)
  const t = Number(v.toPrecision(6))
  if (Math.abs(t) < 1e-4) return t.toExponential().replace('e-', '×10⁻').replace(/\+/, '')
  return String(t)
}

/** Parse "1216", "1,216", "1 216", "0.06", "6e-2". Returns null if it is not a number. */
export function parseNum(raw: string): number | null {
  const t = raw.trim().replace(/−/g, '-').replace(/[,\s_]/g, '')
  if (!t) return null
  if (/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(t)) return Number(t)
  return null
}

/** Pull the integers out of a shape written as "(32, 16, 26, 26)", "32x16x26x26", "[32,16]" or "torch.Size([5])". */
export function parseShape(raw: string): number[] | null {
  const t = raw.trim().toLowerCase()
  if (!t) return null
  if (/^(\(\s*\)|\[\s*\]|scalar|torch\.size\(\[\]\))$/.test(t)) return []
  const nums = t.match(/\d+/g)
  return nums ? nums.map(Number) : null
}

export const shapeText = (sh: number[]) => (sh.length === 0 ? '()' : sh.length === 1 ? `(${sh[0]},)` : `(${sh.join(', ')})`)

export const sameShape = (a: number[] | null, b: number[]) => !!a && a.length === b.length && a.every((x, i) => x === b[i])

/**
 * Counts down from `limit` seconds while `running`; calls onExpire once when it reaches 0.
 * Restart it by changing `resetKey`: the reset happens during render, so the expiry check never
 * sees the old, finished clock.
 */
export function useCountdown(limit: number, running: boolean, onExpire: () => void, resetKey: string | number) {
  const [st, setSt] = useState({ key: resetKey, left: limit, fired: false })
  if (st.key !== resetKey) setSt({ key: resetKey, left: limit, fired: false })
  const cb = useRef(onExpire)
  cb.current = onExpire
  useAnimationFrame((dt) => setSt((x) => ({ ...x, left: Math.max(0, x.left - dt) })), running && st.left > 0 && st.key === resetKey)
  useEffect(() => {
    if (running && st.key === resetKey && st.left <= 0 && !st.fired) {
      setSt((x) => ({ ...x, fired: true }))
      cb.current()
    }
  }, [st, running, resetKey])
  return st.key === resetKey ? st.left : limit
}

export function TimerBar({ left, limit, label }: { left: number; limit: number; label?: string }) {
  const f = Math.max(0, Math.min(1, left / limit))
  const colour = f > 0.5 ? 'var(--viz-pos)' : f > 0.25 ? 'var(--viz-2)' : 'var(--viz-neg)'
  return (
    <div className={s.timer} role="progressbar" aria-label={label ?? 'time left'} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.ceil(left)}>
      <div className={s.timerFill} style={{ width: `${f * 100}%`, background: colour }} />
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
  width,
  inputMode,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  inputRef?: React.RefObject<HTMLInputElement>
  label: string
  width?: string
  inputMode?: 'numeric' | 'decimal' | 'text'
}) {
  return (
    <form
      className={s.answer}
      onSubmit={(e) => {
        e.preventDefault()
        if (!disabled) onSubmit()
      }}
    >
      <input
        ref={inputRef}
        className={s.input}
        style={width ? { width } : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={label}
        inputMode={inputMode}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <button type="submit" className="btn btn-primary btn-small" disabled={disabled}>
        Check
      </button>
    </form>
  )
}

export function Stats({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <div className={s.stats} aria-live="polite">
      {items.map(([k, v], i) => (
        <span key={i} className={s.stat}>
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
    <div className={s.history} aria-label={`${marks.filter(Boolean).length} right out of ${marks.length}`}>
      {marks.slice(-40).map((m, i) => (
        <span key={i} className={s.histDot} style={{ background: m ? 'var(--viz-pos)' : 'var(--viz-neg)' }} />
      ))}
    </div>
  )
}

export const avg = (xs: number[]) => (xs.length ? xs.reduce((p, q) => p + q, 0) / xs.length : 0)

/** Read and write a small JSON value in localStorage without ever throwing. */
export function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}
export function saveLocal(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage blocked: the drill still works, it just forgets */
  }
}
