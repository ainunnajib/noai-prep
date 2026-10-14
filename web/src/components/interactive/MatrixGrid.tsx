import type { ReactNode } from 'react'

export interface MatrixGridProps {
  data: (number | string)[][]
  /** formatter for numeric cells */
  format?: (v: number) => string
  /** highlight whole rows / columns / single cells */
  rows?: number[]
  cols?: number[]
  cells?: [number, number][]
  /** colour cells by value (heat map). Pass [min, max] or true to auto-scale. */
  heat?: boolean | [number, number]
  /** diverging heat map centred on 0 (blue negative, orange positive) */
  diverging?: boolean
  cellSize?: number
  label?: ReactNode
  /** show [ ] brackets like a maths matrix */
  brackets?: boolean
  onCellClick?: (i: number, j: number) => void
  ariaLabel?: string
}

const defaultFmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2))

export function MatrixGrid({
  data,
  format = defaultFmt,
  rows = [],
  cols = [],
  cells = [],
  heat,
  diverging,
  cellSize = 40,
  label,
  brackets = true,
  onCellClick,
  ariaLabel,
}: MatrixGridProps) {
  const nums = data.flat().filter((v): v is number => typeof v === 'number')
  let lo = 0
  let hi = 1
  if (Array.isArray(heat)) [lo, hi] = heat
  else if (heat && nums.length) {
    lo = Math.min(...nums)
    hi = Math.max(...nums)
  }
  const absMax = Math.max(1e-9, ...nums.map(Math.abs))
  const bg = (v: number | string) => {
    if (!heat || typeof v !== 'number') return undefined
    if (diverging) {
      const t = Math.min(1, Math.abs(v) / absMax)
      return `color-mix(in srgb, ${v < 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${Math.round(t * 70)}%, var(--surface))`
    }
    const t = hi === lo ? 0.5 : (v - lo) / (hi - lo)
    return `color-mix(in srgb, var(--viz-1) ${Math.round(8 + t * 62)}%, var(--surface))`
  }
  const isCell = (i: number, j: number) => cells.some(([a, b]) => a === i && b === j)
  const n = data[0]?.length ?? 0

  return (
    <div className="matrix-wrap">
      {label && <div className="matrix-label">{label}</div>}
      <div className={`matrix${brackets ? ' has-brackets' : ''}`} role="table" aria-label={ariaLabel}>
        <div className="matrix-grid" style={{ gridTemplateColumns: `repeat(${n}, ${cellSize}px)` }}>
          {data.map((row, i) =>
            row.map((v, j) => {
              const hl = rows.includes(i) || cols.includes(j)
              const strong = isCell(i, j)
              const style = { height: cellSize, background: bg(v) }
              const text = typeof v === 'number' ? format(v) : v
              const cls = `matrix-cell tabular${hl ? ' is-hl' : ''}${strong ? ' is-strong' : ''}${onCellClick ? ' is-clickable' : ''}`
              return onCellClick ? (
                <button key={`${i}-${j}`} type="button" role="cell" className={cls} style={style} onClick={() => onCellClick(i, j)}>
                  {text}
                </button>
              ) : (
                <div key={`${i}-${j}`} role="cell" className={cls} style={style}>
                  {text}
                </div>
              )
            }),
          )}
        </div>
      </div>
    </div>
  )
}
