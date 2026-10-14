import type { CSSProperties, ReactNode } from 'react'
import s from './mm.module.css'

/** A highlight tone for one cell. Each tone is tied to one theme colour so the same colour means the same thing across a figure. */
export type Tone = 'a' | 'b' | 'out' | 'bad' | 'soft' | undefined

const TONE_COLOUR: Record<Exclude<Tone, undefined>, string> = {
  a: 'var(--viz-1)',
  b: 'var(--viz-2)',
  out: 'var(--viz-3)',
  bad: 'var(--viz-neg)',
  soft: 'var(--viz-muted)',
}

export function toneStyle(tone: Tone, strong = false): CSSProperties {
  if (!tone) return {}
  const c = TONE_COLOUR[tone]
  return {
    background: `color-mix(in srgb, ${c} ${strong ? 30 : 18}%, var(--surface))`,
    borderColor: c,
  }
}

/**
 * Small HTML matrix with square brackets. Cells can be tinted with a tone and clicked.
 * Used by the visuals in this lesson (and the next) instead of the kit's MatrixGrid because
 * these figures need several colour-coded highlights at once.
 */
export function Mat({
  data,
  name,
  cell = 40,
  tone,
  strong,
  onCell,
  format = (v) => String(v),
  ariaLabel,
  muted,
}: {
  data: (number | string)[][]
  name?: ReactNode
  cell?: number
  tone?: (i: number, j: number) => Tone
  strong?: (i: number, j: number) => boolean
  onCell?: (i: number, j: number) => void
  format?: (v: number) => string
  ariaLabel?: string
  muted?: (i: number, j: number) => boolean
}) {
  const cols = data[0]?.length ?? 0
  return (
    <div className={s.mat}>
      {name && <div className={s.matName}>{name}</div>}
      <div className={s.matBody} role="table" aria-label={ariaLabel}>
        <div className={s.matGrid} style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)` }}>
          {data.map((row, i) =>
            row.map((v, j) => {
              const t = tone?.(i, j)
              const st: CSSProperties = { height: cell, ...toneStyle(t, strong?.(i, j)) }
              if (strong?.(i, j)) st.borderWidth = 2.5
              const text = typeof v === 'number' ? format(v) : v
              const cls = `${s.cell}${muted?.(i, j) ? ` ${s.cellMuted}` : ''}`
              return onCell ? (
                <button key={`${i}-${j}`} type="button" role="cell" className={cls} style={st} onClick={() => onCell(i, j)} aria-label={`row ${i + 1}, column ${j + 1}: ${text}`}>
                  {text}
                </button>
              ) : (
                <div key={`${i}-${j}`} role="cell" className={cls} style={st}>
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

/** Matrix product of plain number arrays (inner dimensions must already match). */
export function matmul(A: number[][], B: number[][]): number[][] {
  return A.map((row) => B[0].map((_, j) => row.reduce((acc, a, k) => acc + a * B[k][j], 0)))
}

export const shapeOf = (A: unknown[][]) => [A.length, A[0]?.length ?? 0] as const
