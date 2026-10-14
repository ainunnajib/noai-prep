/* Plot types, column names and the text labels used by the plotting-data visuals (pure TS, no React). */

export type Kind = 'scatter' | 'line' | 'hist' | 'bar' | 'box'
export type NumCol = 'area' | 'price' | 'year'
export type CatCol = 'town' | 'flat_type'
export type YCol = NumCol | 'count'
export interface Spec {
  kind: Kind
  /** numeric column for scatter/hist, 'year' for line, a category for bar/box */
  x: NumCol | CatCol
  /** numeric column; 'count' for hist and count bars */
  y: YCol
  hue: CatCol | null
  bins: number
}

export const FRIENDLY: Record<string, string> = {
  area: 'floor area (m²)',
  price: 'price ($k)',
  year: 'year',
  town: 'town',
  flat_type: 'flat type',
  count: 'number of flats',
}

export function defaultTitle(s: Spec): string {
  switch (s.kind) {
    case 'scatter':
      return `${cap(s.y)} against ${s.x === 'area' ? 'floor area' : s.x}`
    case 'line':
      return `Median ${s.y} by year`
    case 'hist':
      return `Distribution of ${s.x === 'area' ? 'floor area' : s.x}`
    case 'bar':
      return s.y === 'count' ? `Number of flats by ${FRIENDLY[s.x]}` : `Average price by ${FRIENDLY[s.x]}`
    case 'box':
      return `${cap(s.y)} by ${FRIENDLY[s.x]}`
  }
}
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

/** A readable y-axis label for a spec (what set_ylabel would say). */
export function yLabelFor(s: Spec): string {
  if (s.kind === 'hist') return 'number of flats'
  if (s.kind === 'bar') return s.y === 'count' ? 'number of flats' : 'average price ($k)'
  if (s.kind === 'line') return `median ${FRIENDLY[s.y]}`
  return FRIENDLY[s.y]
}
