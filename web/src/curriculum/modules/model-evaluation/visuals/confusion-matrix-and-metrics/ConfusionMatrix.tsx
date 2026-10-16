import type { ReactNode } from 'react'
import type { Counts } from './evalMath'
import s from './eval.module.css'

/*
  A 2 x 2 confusion matrix in scikit-learn's layout: rows = actual class, columns = predicted
  class, class 0 (negative) first. So the grid reads [[TN, FP], [FN, TP]].
  Green cells are correct predictions, red cells are mistakes.
*/

export type CellKey = 'tn' | 'fp' | 'fn' | 'tp'

const NAMES: Record<CellKey, string> = { tn: 'TN', fp: 'FP', fn: 'FN', tp: 'TP' }
const LONG: Record<CellKey, string> = {
  tn: 'true negative',
  fp: 'false positive',
  fn: 'false negative',
  tp: 'true positive',
}

export function ConfusionMatrix({
  counts,
  negLabel = 'negative',
  posLabel = 'positive',
  focus = [],
  dim = [],
  format = (v) => String(Math.round(v)),
  sub,
  ariaLabel,
}: {
  counts: Counts
  negLabel?: ReactNode
  posLabel?: ReactNode
  /** cells to ring (e.g. the cells a metric uses) */
  focus?: CellKey[]
  /** cells to fade */
  dim?: CellKey[]
  format?: (v: number) => string
  /** optional small text under each count (e.g. cost) */
  sub?: Partial<Record<CellKey, ReactNode>>
  ariaLabel?: string
}) {
  const cell = (k: CellKey) => {
    const right = k === 'tn' || k === 'tp'
    const cls = [s.cell, right ? s.cellRight : s.cellWrong, focus.includes(k) ? s.cellFocus : '', dim.includes(k) ? s.cellDim : ''].join(' ')
    return (
      <div className={cls} role="cell" aria-label={`${LONG[k]}: ${format(counts[k])}`}>
        <span className={s.cellName}>{NAMES[k]}</span>
        <span className={s.cellCount}>{format(counts[k])}</span>
        {sub?.[k] != null && <span className={s.cellSub}>{sub[k]}</span>}
      </div>
    )
  }
  return (
    <div
      className={s.cm}
      role="table"
      aria-label={
        ariaLabel ??
        `Confusion matrix: TN ${format(counts.tn)}, FP ${format(counts.fp)}, FN ${format(counts.fn)}, TP ${format(counts.tp)}`
      }
    >
      <div className={s.cmCorner} />
      <div className={s.cmColHead}>
        <span className={s.cmAxis}>predicted</span>0: {negLabel}
      </div>
      <div className={s.cmColHead}>
        <span className={s.cmAxis}>predicted</span>1: {posLabel}
      </div>
      <div className={s.cmRowHead}>
        <span className={s.cmAxis}>actual</span>0: {negLabel}
      </div>
      {cell('tn')}
      {cell('fp')}
      <div className={s.cmRowHead}>
        <span className={s.cmAxis}>actual</span>1: {posLabel}
      </div>
      {cell('fn')}
      {cell('tp')}
    </div>
  )
}
