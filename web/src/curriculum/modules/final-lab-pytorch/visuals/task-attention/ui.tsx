import { Highlight, themes } from 'prism-react-renderer'
import type { CSSProperties, ReactNode } from 'react'
import s from './ui.module.css'

/*
  Small display helpers shared by the visuals of task-attention, task-pe-classifier-mask and
  practice-set (all in the final-lab-pytorch module). Syntax colours come from the site's global
  .tok classes, so they follow light and dark mode.
*/

/** One line (or a few) of syntax-coloured Python, as an inline span. */
export function Py({ code, style }: { code: string; style?: CSSProperties }) {
  return (
    <Highlight code={code} language="python" theme={themes.vsLight}>
      {({ tokens, getTokenProps }) => (
        <span className={s.py} style={style}>
          {tokens.map((line, i) => (
            <span key={i}>
              {i > 0 && '\n'}
              {line.map((token, k) => {
                if (token.empty) return null
                const tp = getTokenProps({ token })
                return (
                  <span key={k} className={`tok ${token.types.join(' ')}`}>
                    {String(tp.children ?? '').replace(/\n/g, '')}
                  </span>
                )
              })}
            </span>
          ))}
        </span>
      )}
    </Highlight>
  )
}

export type Tone = 'cur' | 'ok' | 'bad' | 'warn' | 'dim' | undefined

export interface CodeLine {
  code: string
  /** shown in a second column on wide screens and under the line on phones */
  note?: ReactNode
  tone?: Tone
}

/** A code panel whose lines can be highlighted one at a time (steppers) or marked ok / bad. */
export function CodeLines({ lines, title, right, narrow }: { lines: CodeLine[]; title?: ReactNode; right?: ReactNode; narrow?: boolean }) {
  return (
    <div className={`${s.panel} ${narrow ? s.narrow : ''}`}>
      {(title || right) && (
        <div className={s.bar}>
          <span>{title}</span>
          {right}
        </div>
      )}
      <div className={s.body}>
        {lines.map((l, i) => (
          <div key={i} className={`${s.row} ${l.tone ? s[`tone_${l.tone}`] : ''}`}>
            <span className={s.code} style={l.note == null ? { gridColumn: '1 / -1' } : undefined}>
              <Py code={l.code || ' '} />
            </span>
            {l.note != null && <span className={s.note}>{l.note}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Console-style output box. Lines starting with ✓ are green and lines with ✗ are red. */
export function Console({ lines, title = 'output' }: { lines: string[]; title?: ReactNode }) {
  return (
    <div className={s.console}>
      <div className={s.consoleBar}>{title}</div>
      <div className={s.consoleBody} role="log">
        {lines.map((l, i) => (
          <div key={i} className={/✓/.test(l) ? s.okLine : /✗|Error/.test(l) ? s.badLine : undefined}>
            {l || ' '}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Pill-shaped radio chips that wrap on phones. */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: ReactNode; bad?: boolean }[]
  value: T
  onChange: (v: T) => void
  label?: string
}) {
  return (
    <div className={s.chipsWrap}>
      {label && <span className={s.chipsLabel}>{label}</span>}
      <div className={s.chips} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            className={`${s.chip} ${o.value === value ? s.chipOn : ''} ${o.bad ? s.chipBad : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Monospace shape tag such as (B, h, T, T). */
export function Shape({ children, tone }: { children: ReactNode; tone?: 'ok' | 'bad' | 'accent' }) {
  return <span className={`${s.shape} ${tone ? s[`shape_${tone}`] : ''}`}>{children}</span>
}

export interface MatCell {
  v: number
  /** masked / hidden cell: drawn hatched */
  masked?: boolean
}

/**
 * A small labelled matrix in HTML: row labels on the left, column labels on top, values shaded by
 * size. Masked cells are hatched. Used for score and weight tables.
 */
export function LabMatrix({
  data,
  rowLabels,
  colLabels,
  format = (v) => v.toFixed(2),
  heat = 'seq',
  range,
  hlRow,
  caption,
  masked,
  cell = 50,
  colour = 'var(--viz-1)',
}: {
  data: number[][]
  rowLabels?: ReactNode[]
  colLabels?: ReactNode[]
  format?: (v: number) => string
  heat?: 'seq' | 'div' | 'none'
  range?: [number, number]
  hlRow?: number
  caption?: ReactNode
  masked?: boolean[][]
  cell?: number
  colour?: string
}) {
  const flat = data.flat().filter((v) => Number.isFinite(v) && Math.abs(v) < 1e6)
  const lo = range ? range[0] : Math.min(0, ...flat)
  const hi = range ? range[1] : Math.max(1e-9, ...flat)
  const absMax = Math.max(1e-9, ...flat.map(Math.abs))
  const bg = (v: number) => {
    if (heat === 'none' || !Number.isFinite(v) || Math.abs(v) >= 1e6) return undefined
    if (heat === 'div') {
      const t = Math.min(1, Math.abs(v) / absMax)
      return `color-mix(in srgb, ${v < 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${Math.round(t * 62)}%, var(--surface))`
    }
    const t = hi === lo ? 0.5 : Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
    return `color-mix(in srgb, ${colour} ${Math.round(6 + t * 60)}%, var(--surface))`
  }
  const cols = data[0]?.length ?? 0
  return (
    <div className={s.mat}>
      {caption && <div className={s.matCaption}>{caption}</div>}
      <div
        className={s.matGrid}
        style={{ gridTemplateColumns: `${rowLabels ? 'max-content ' : ''}repeat(${cols}, minmax(${Math.round(cell * 0.8)}px, ${cell}px))` }}
        role="table"
      >
        {colLabels && (
          <>
            {rowLabels && <span />}
            {colLabels.map((c, j) => (
              <span key={`c${j}`} className={s.matColLab}>
                {c}
              </span>
            ))}
          </>
        )}
        {data.map((row, i) => (
          <div key={i} role="row" style={{ display: 'contents' }}>
            {rowLabels && <span className={`${s.matRowLab} ${hlRow === i ? s.matRowLabOn : ''}`}>{rowLabels[i]}</span>}
            {row.map((v, j) => {
              const isMasked = masked?.[i]?.[j]
              return (
                <span
                  key={j}
                  role="cell"
                  className={`${s.matCell} ${isMasked ? s.matMasked : ''} ${hlRow === i ? s.matCellRow : ''}`}
                  style={{ background: isMasked ? undefined : bg(v), height: Math.round(cell * 0.72) }}
                >
                  {Number.isNaN(v) ? 'nan' : v <= -1e8 ? (v === -Infinity ? '−inf' : '−1e9') : format(v)}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Plain-number helpers used by several visuals. */
export const matmul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r.reduce((acc, a, k) => acc + a * B[k][j], 0)))
export const transpose = (A: number[][]) => A[0].map((_, j) => A.map((r) => r[j]))
export function softmax(row: number[]): number[] {
  const m = Math.max(...row)
  if (!Number.isFinite(m)) return row.map(() => NaN)
  const e = row.map((x) => Math.exp(x - m))
  const z = e.reduce((a, b) => a + b, 0)
  return e.map((x) => x / z)
}
/** softmax over columns (dim = -2), for showing the classic wrong-dim bug */
export const softmaxCols = (A: number[][]) => transpose(transpose(A).map(softmax))

/** Format with a true minus sign. */
export const fmt = (v: number, d = 2) => (Number.isNaN(v) ? 'nan' : (v < 0 ? '−' : '') + Math.abs(v).toFixed(d))
