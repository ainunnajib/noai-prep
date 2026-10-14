import { useId, type ReactNode } from 'react'

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  id,
}: {
  label: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => ReactNode
  id?: string
}) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <div className="slider">
      <label htmlFor={fid} className="slider-label">
        <span>{label}</span>
        <output htmlFor={fid} className="slider-value tabular">
          {format ? format(value) : value}
        </output>
      </label>
      <input id={fid} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

/** Segmented control for choosing one of a few options. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
  label?: string
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {label && <span className="segmented-label">{label}</span>}
      <div className="segmented-track">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            className={`segmented-opt${o.value === value ? ' is-active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Toggle({ label, checked, onChange, id }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <label className="toggle" htmlFor={fid}>
      <input id={fid} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
      <span>{label}</span>
    </label>
  )
}

export function Button({ children, onClick, primary, disabled, small = true }: { children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean; small?: boolean }) {
  return (
    <button type="button" className={`btn${primary ? ' btn-primary' : ''}${small ? ' btn-small' : ''}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
