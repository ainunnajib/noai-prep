import { useId, useState, type ReactNode } from 'react'

/** A vocabulary word with a plain-English definition on hover/focus/tap. */
export function Term({ children, def }: { children: ReactNode; def: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span className="term-wrap">
      <span
        role="button"
        tabIndex={0}
        className="term"
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((v) => !v)
          } else if (e.key === 'Escape') setOpen(false)
        }}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </span>
      <span role="tooltip" id={id} className={`term-tip${open ? ' is-open' : ''}`}>
        {def}
      </span>
    </span>
  )
}
