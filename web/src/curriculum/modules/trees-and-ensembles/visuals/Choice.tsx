import type { ReactNode } from 'react'
import s from './choice.module.css'

/** Pick one of a few options with long labels (pills that wrap cleanly on phones). */
export default function Choice<T extends string | number>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
}) {
  return (
    <div className={s.group} role="radiogroup" aria-label={label}>
      <span className={s.label}>{label}</span>
      <div className={s.row}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            className={`${s.opt}${o.value === value ? ` ${s.active}` : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
