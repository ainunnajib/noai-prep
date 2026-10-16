import type { ReactNode } from 'react'

/** Click-to-reveal box for worked answers and hints. */
export function Reveal({ label = 'Show answer', children }: { label?: string; children: ReactNode }) {
  return (
    <details className="reveal">
      <summary>{label}</summary>
      <div className="reveal-body">{children}</div>
    </details>
  )
}
