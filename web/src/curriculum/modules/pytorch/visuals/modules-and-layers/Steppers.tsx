import css from './modules.module.css'

/*
  Editable numbers inside a code listing. On wide screens the number carries small ◀ ▶ steppers
  (with a hit area larger than the glyph). On phones the number in the code is just highlighted,
  and a StepperRow under the code gives finger-sized − / + buttons for each number.
*/

export interface StepItem {
  label: string
  v: number
  set: (n: number) => void
  min: number
  max: number
}

export function Num({ v, set, min, max, label, arrows = true }: StepItem & { arrows?: boolean }) {
  if (!arrows)
    return (
      <span className={css.num} aria-label={`${label}: ${v}`}>
        <b>{v}</b>
      </span>
    )
  return (
    <span className={css.num}>
      <button type="button" className={css.stepBtn} onClick={() => set(Math.max(min, v - 1))} aria-label={`decrease ${label}`}>
        ◀
      </button>
      <b>{v}</b>
      <button type="button" className={css.stepBtn} onClick={() => set(Math.min(max, v + 1))} aria-label={`increase ${label}`}>
        ▶
      </button>
    </span>
  )
}

export function StepperRow({ items }: { items: StepItem[] }) {
  return (
    <div className={css.stepRow}>
      {items.map((it) => (
        <span key={it.label} className={css.stepItem}>
          <span className={css.stepLabel}>{it.label}</span>
          <span className={css.stepCtl}>
            <button type="button" className="btn btn-small" disabled={it.v <= it.min} onClick={() => it.set(Math.max(it.min, it.v - 1))} aria-label={`decrease ${it.label}`}>
              −
            </button>
            <b className={css.mono}>{it.v}</b>
            <button type="button" className="btn btn-small" disabled={it.v >= it.max} onClick={() => it.set(Math.min(it.max, it.v + 1))} aria-label={`increase ${it.label}`}>
              +
            </button>
          </span>
        </span>
      ))}
    </div>
  )
}
