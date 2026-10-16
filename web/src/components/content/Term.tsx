import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Gap (px) kept between an open definition and the edge of the screen. */
const EDGE = 12

/** A vocabulary word with a plain-English definition on hover/focus/tap. */
export function Term({ children, def }: { children: ReactNode; def: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const tipRef = useRef<HTMLSpanElement>(null)

  // The definition is centred on the word; nudge it sideways so it never runs off the screen.
  useLayoutEffect(() => {
    const tip = tipRef.current
    if (!open || !tip) return
    tip.style.setProperty('--tip-dx', '0px')
    const r = tip.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    let dx = 0
    if (r.left < EDGE) dx = EDGE - r.left
    else if (r.right > vw - EDGE) dx = vw - EDGE - r.right
    tip.style.setProperty('--tip-dx', `${Math.round(dx)}px`)
  }, [open])

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
        // Hover only for a real mouse: a touch tap also fires mouseenter just before its click,
        // which would open the definition and then let the click toggle it shut again.
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setOpen(true)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setOpen(false)
        }}
      >
        {children}
      </span>
      <span ref={tipRef} role="tooltip" id={id} className={`term-tip${open ? ' is-open' : ''}`}>
        {def}
      </span>
    </span>
  )
}
