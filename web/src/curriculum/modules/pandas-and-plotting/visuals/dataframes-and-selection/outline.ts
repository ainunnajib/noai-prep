import type { CSSProperties } from 'react'

/**
 * Draw an outline around a set of table cells. `inSet(r, c)` says whether cell (r, c) is in
 * the set; each cell in the set gets inset box-shadows on the sides that face OUT of the set,
 * so the whole region looks like one outlined block. `inner` pushes a second outline inwards
 * so two overlapping selections stay visible.
 */
export function edges(inSet: (r: number, c: number) => boolean, r: number, c: number, color: string, width = 2, inner = 0): string[] {
  if (!inSet(r, c)) return []
  const w = width + inner
  const out: string[] = []
  if (!inSet(r - 1, c)) out.push(`inset 0 ${w}px 0 0 ${color}`)
  if (!inSet(r + 1, c)) out.push(`inset 0 -${w}px 0 0 ${color}`)
  if (!inSet(r, c - 1)) out.push(`inset ${w}px 0 0 0 ${color}`)
  if (!inSet(r, c + 1)) out.push(`inset -${w}px 0 0 0 ${color}`)
  return out
}

export const tint = (color: string, pct = 16) => `color-mix(in srgb, ${color} ${pct}%, var(--surface))`

/** Style for one cell given a primary selection and an optional secondary one. */
export function cellStyle(
  r: number,
  c: number,
  primary: (r: number, c: number) => boolean,
  secondary?: (r: number, c: number) => boolean,
  colors: { primary: string; secondary: string } = { primary: 'var(--accent)', secondary: 'var(--viz-2)' },
): CSSProperties {
  const p = primary(r, c)
  const s = secondary ? secondary(r, c) : false
  // primary band is drawn on top (listed first); the secondary band sits just inside it
  const shadows = [...edges(primary, r, c, colors.primary, 2), ...(secondary ? edges(secondary, r, c, colors.secondary, 2, p ? 2 : 0) : [])]
  let background: string | undefined
  if (p && s) background = `color-mix(in srgb, ${colors.primary} 14%, color-mix(in srgb, ${colors.secondary} 18%, var(--surface)))`
  else if (p) background = tint(colors.primary)
  else if (s) background = tint(colors.secondary, 18)
  return { boxShadow: shadows.length ? shadows.join(', ') : undefined, background }
}
