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
  colLabels,
  rowLabels,
  cellColor,
}: {
  data: number[][]
  label?: ReactNode
  format?: (v: number) => string
  rows?: number[]
  cells?: [number, number][]
  /** colour every cell: signs (negative/positive) */
  tone?: 'sign'
  /** optional headers above the columns and labels left of the rows */
  colLabels?: ReactNode[]
  rowLabels?: ReactNode[]
  /** outline colour for a cell listed in `cells` (default var(--viz-2)) */
  cellColor?: (i: number, j: number) => string
}) {
  const n = data[0]?.length ?? 0
  const m = data.length
  const bracket = { borderColor: 'var(--ink-2)', borderStyle: 'solid', width: 7 } as const
  const head = colLabels ? 1 : 0
  const small = { fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', whiteSpace: 'nowrap' } as const
  return (
    <div style={{ display: 'inline-grid', justifyItems: 'center', gap: '0.25rem' }}>
      {label && <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{label}</div>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${rowLabels ? 'auto ' : ''}7px repeat(${n}, auto) 7px`,
          columnGap: 3,
          rowGap: 3,
          alignItems: 'center',
        }}
        role="table"
      >
        {colLabels &&
          colLabels.map((c, j) => (
            <span key={`h${j}`} role="columnheader" style={{ ...small, gridRow: 1, gridColumn: (rowLabels ? 3 : 2) + j, textAlign: 'center' }}>
              {c}
            </span>
          ))}
        {rowLabels &&
          rowLabels.map((r, i) => (
            <span key={`r${i}`} role="rowheader" style={{ ...small, gridRow: head + 1 + i, gridColumn: 1, textAlign: 'right', paddingRight: 2 }}>
              {r}
            </span>
          ))}
        <span
          aria-hidden="true"
          style={{ ...bracket, borderWidth: '2px 0 2px 2px', alignSelf: 'stretch', gridRow: `${head + 1} / span ${m}`, gridColumn: rowLabels ? 2 : 1 }}
        />
        <span
          aria-hidden="true"
          style={{ ...bracket, borderWidth: '2px 2px 2px 0', alignSelf: 'stretch', gridRow: `${head + 1} / span ${m}`, gridColumn: (rowLabels ? 3 : 2) + n }}
        />
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
                  outline: strong ? `2px solid ${cellColor ? cellColor(i, j) : 'var(--viz-2)'}` : hl ? '1.5px solid var(--viz-1)' : undefined,
                  outlineOffset: -1,
                  whiteSpace: 'nowrap',
                  gridRow: head + 1 + i,
                  gridColumn: (rowLabels ? 3 : 2) + j,
                  margin: `${i === 0 ? 3 : 0}px 0 ${i === m - 1 ? 3 : 0}px`,
                }}
              >
                {format(v)}
              </span>
            )
          }),
        )}
      </div>
    </div>
  )
}
