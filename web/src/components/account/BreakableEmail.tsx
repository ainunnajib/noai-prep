import type { ReactNode } from 'react'

/**
 * An email address that may wrap after the "@" and before each ".", rather than mid-word (with the CSS's
 * overflow-wrap: anywhere still there for a part too long for the line).
 */
export function BreakableEmail({ email }: { email: string }) {
  const parts: ReactNode[] = []
  let start = 0
  for (let i = 0; i < email.length; i++) {
    if (email[i] === '.' && i > start) {
      parts.push(email.slice(start, i), <wbr key={i} />)
      start = i
    } else if (email[i] === '@') {
      parts.push(email.slice(start, i + 1), <wbr key={i} />)
      start = i + 1
    }
  }
  parts.push(email.slice(start))
  return <>{parts}</>
}
