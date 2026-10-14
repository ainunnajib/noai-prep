import { useId, useState, type ReactNode } from 'react'

/** A vocabulary word with a plain-English definition on hover/focus/tap. */
export function Term({ children, def }: { children: ReactNode; def: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span className="term-wrap">
      <button
        type="button"
        className="term"
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </button>
      <span role="tooltip" id={id} className={`term-tip${open ? ' is-open' : ''}`}>
        {def}
      </span>
    </span>
  )
}
