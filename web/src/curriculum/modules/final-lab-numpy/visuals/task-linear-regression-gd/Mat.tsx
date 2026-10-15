import type { ReactNode } from 'react'

/*
  A compact bracketed matrix / column vector whose cells size to their numbers (the kit's
  MatrixGrid uses square cells, which makes long decimals cramped and columns very tall).
*/
export function Mat({
  data,
  label,
  format = (v: number) => String(v),
  rows = [],
  cells = [],
  tone,
}: {
  data: number[][]
  label?: ReactNode
  format?: (v: number) => string
  rows?: number[]
  cells?: [number, number][]
  /** colour every cell: signs (negative/positive) */
  tone?: 'sign'
}) {
  const n = data[0]?.length ?? 0
  const bracket = { borderColor: 'var(--ink-2)', borderStyle: 'solid', width: 7 } as const
  return (
    <div style={{ display: 'inline-grid', justifyItems: 'center', gap: '0.25rem' }}>
      {label && <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'stretch' }} role="table">
        <span aria-hidden="true" style={{ ...bracket, borderWidth: '2px 0 2px 2px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, auto)`, gap: 3, padding: '3px 2px' }}>
          {data.map((row, i) =>
            row.map((v, j) => {
              const strong = cells.some(([a, b]) => a === i && b === j)
              const hl = rows.includes(i)
              const bg =
                tone === 'sign'
                  ? `color-mix(in srgb, ${v < 0 ? 'var(--viz-neg)' : 'var(--viz-pos)'} ${v === 0 ? 0 : 18}%, var(--surface-2))`
                  : hl
                    ? 'color-mix(in srgb, var(--viz-1) 16%, var(--surface))'
                    : 'var(--surface-2)'
              return (
                <span
                  key={`${i}-${j}`}
                  role="cell"
                  className="tabular"
                  style={{
                    minWidth: '2.6em',
                    padding: '0.18rem 0.45rem',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    borderRadius: 5,
                    background: bg,
                    color: 'var(--ink)',
                    outline: strong ? '2px solid var(--viz-2)' : hl ? '1.5px solid var(--viz-1)' : undefined,
                    outlineOffset: -1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {format(v)}
                </span>
              )
            }),
          )}
        </div>
        <span aria-hidden="true" style={{ ...bracket, borderWidth: '2px 2px 2px 0' }} />
      </div>
    </div>
  )
}
