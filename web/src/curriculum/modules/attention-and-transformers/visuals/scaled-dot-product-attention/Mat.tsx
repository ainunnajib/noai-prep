import type { ReactNode } from 'react'
import s from './sdpa.module.css'

/* A small labelled matrix for the attention visuals: optional token labels on rows and columns,
   highlighted rows/columns, one selected cell, clickable or editable cells, per-cell colours. */

export type Num = number | string

export interface MatProps {
  name?: ReactNode
  shape?: ReactNode
  data: Num[][]
  rowLabels?: string[]
  colLabels?: string[]
  fmt?: (v: number) => string
  cellW?: number
  cellH?: number
  hlRows?: number[]
  hlCols?: number[]
  sel?: [number, number] | null
  onSelect?: (i: number, j: number) => void
  /** background colour for a cell */
  bg?: (i: number, j: number) => string | undefined
  /** extra class for a cell (blocked / nan / dim) */
  cls?: (i: number, j: number) => string | undefined
  editable?: boolean
  onEdit?: (i: number, j: number, v: number) => void
  min?: number
  max?: number
  ariaLabel: string
  labelW?: number
}

export const fmt2 = (v: number) => {
  if (Number.isNaN(v)) return 'NaN'
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞'
  if (Number.isInteger(v)) return String(v).replace('-', '−')
  const r = v.toFixed(2)
  return Number(r) === 0 ? '0.00' : r.replace('-', '−')
}

export function Mat({
  name,
  shape,
  data,
  rowLabels,
  colLabels,
  fmt = fmt2,
  cellW = 46,
  cellH = 32,
  hlRows = [],
  hlCols = [],
  sel,
  onSelect,
  bg,
  cls,
  editable,
  onEdit,
  min = -3,
  max = 3,
  ariaLabel,
  labelW = 40,
}: MatProps) {
  const n = data[0]?.length ?? 0
  const cols = `${rowLabels ? `${labelW}px ` : ''}repeat(${n}, ${cellW}px)`
  return (
    <div className={s.mat}>
      {name != null && <div className={s.matName}>{name}</div>}
      <div className={s.matGrid} style={{ gridTemplateColumns: cols }} role="group" aria-label={ariaLabel}>
        {colLabels && (
          <>
            {rowLabels && <span />}
            {colLabels.map((c, j) => (
              <span key={`c${j}`} className={`${s.colLab} ${hlCols.includes(j) ? s.labOn : ''}`} style={{ maxWidth: cellW }}>
                {c}
              </span>
            ))}
          </>
        )}
        {data.map((row, i) => (
          <Row key={i}>
            {rowLabels && (
              <span className={`${s.rowLab} ${hlRows.includes(i) ? s.labOn : ''}`} style={{ maxWidth: labelW }}>
                {rowLabels[i]}
              </span>
            )}
            {row.map((v, j) => {
              const isSel = sel != null && sel[0] === i && sel[1] === j
              const hl = hlRows.includes(i) || hlCols.includes(j)
              const c = [s.cell, hl ? s.cellHl : '', isSel ? s.cellSel : '', cls?.(i, j) ?? '', onSelect ? s.cellBtn : ''].join(' ')
              const style = { height: cellH, background: bg?.(i, j) }
              const text = typeof v === 'number' ? fmt(v) : v
              if (editable && onEdit) {
                return (
                  <span key={j} className={c} style={{ ...style, background: undefined, padding: 0 }}>
                    <input
                      className={s.cellInput}
                      type="number"
                      inputMode="numeric"
                      min={min}
                      max={max}
                      step={1}
                      value={typeof v === 'number' ? v : 0}
                      aria-label={`row ${i + 1}, column ${j + 1}`}
                      onChange={(e) => {
                        const x = Math.round(Number(e.target.value))
                        if (Number.isFinite(x)) onEdit(i, j, Math.max(min, Math.min(max, x)))
                      }}
                    />
                  </span>
                )
              }
              return onSelect ? (
                <button
                  key={j}
                  type="button"
                  className={c}
                  style={style}
                  onClick={() => onSelect(i, j)}
                  onMouseEnter={() => onSelect(i, j)}
                  aria-label={`${rowLabels ? rowLabels[i] : `row ${i + 1}`}, ${colLabels ? colLabels[j] : `column ${j + 1}`}: ${text}`}
                >
                  {text}
                </button>
              ) : (
                <span key={j} className={c} style={style}>
                  {text}
                </span>
              )
            })}
          </Row>
        ))}
      </div>
      {shape != null && <div className={s.matShape}>{shape}</div>}
    </div>
  )
}

/** Fragment-like wrapper so a row's cells sit directly in the parent grid. */
function Row({ children }: { children: ReactNode }) {
  return <>{children}</>
}

/* ---------------- maths ---------------- */

export const matmul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r.reduce((acc, a, k) => acc + a * B[k][j], 0)))
export const transpose = (A: number[][]) => A[0].map((_, j) => A.map((r) => r[j]))

/** Row softmax that follows IEEE rules: a row of all −∞ gives NaN, like PyTorch. */
export function softmaxRow(row: number[]): number[] {
  const m = Math.max(...row)
  if (m === -Infinity) return row.map(() => NaN)
  const e = row.map((v) => Math.exp(v - m))
  const z = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / z)
}

export const heat = (t: number, colour = 'var(--viz-1)') => `color-mix(in srgb, ${colour} ${Math.round(6 + 60 * Math.max(0, Math.min(1, t)))}%, var(--surface))`
