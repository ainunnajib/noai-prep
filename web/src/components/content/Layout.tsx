import type { ReactNode } from 'react'

/** Two (or more) columns that stack on phones. */
export function Columns({ children, min = 240 }: { children: ReactNode; min?: number }) {
  return (
    <div className="columns" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))` }}>
      {children}
    </div>
  )
}

/** End-of-lesson summary box. Put a Markdown bullet list inside. */
export function Takeaways({ children, title = 'Remember' }: { children: ReactNode; title?: string }) {
  return (
    <section className="takeaways">
      <h3 className="takeaways-title">{title}</h3>
      <div className="takeaways-body">{children}</div>
    </section>
  )
}

/** Highlighter mark for the phrase that matters most in a paragraph. */
export function Hl({ children }: { children: ReactNode }) {
  return <mark className="hl">{children}</mark>
}
