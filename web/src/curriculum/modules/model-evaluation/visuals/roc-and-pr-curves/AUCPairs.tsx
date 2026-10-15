import { useState } from 'react'
import { Figure, Controls, Button, Plot, usePlot, DraggablePoint, useNarrow } from '../../../../../kit'
import { rocPoints, pairAUC } from './roc'
import { txt } from '../confusion-matrix-and-metrics/colors'
import s from '../confusion-matrix-and-metrics/eval.module.css'

/*
  AUC = the fraction of (positive, negative) pairs that the model ranks correctly.
  With 5 positives and 5 negatives the ROC square splits into 5 × 5 cells, one per pair:
  column j = the j-th highest-scoring negative, row i = the i-th highest-scoring positive
  (counted from the bottom). The staircase passes above cell (j, i) exactly when that positive
  outscores that negative, so the area under the curve = (correct pairs) / 25.
*/

const START_POS = [0.9, 0.8, 0.6, 0.55, 0.3]
const START_NEG = [0.7, 0.5, 0.4, 0.2, 0.1]
const P_NAMES = ['P1', 'P2', 'P3', 'P4', 'P5']
const N_NAMES = ['N1', 'N2', 'N3', 'N4', 'N5']
const POS_C = 'var(--viz-2)'
const NEG_C = 'var(--viz-1)'
const OK_C = 'var(--viz-pos)'
const BAD_C = 'var(--viz-neg)'

const order = (v: number[]) => v.map((_, i) => i).sort((a, b) => v[b] - v[a] || a - b)
const snap = (x: number) => Math.max(0.01, Math.min(0.99, Math.round(x * 100) / 100))

/**
 * Label rows: scan the points from left to right and put each label on the first row whose
 * previous label is at least `gap` px away (or, if every row is crowded, the row with the most room).
 */
function labelRows(vals: number[], px: (v: number) => number, nRows: number, gap = 24): number[] {
  const order = vals.map((_, i) => i).sort((a, b) => vals[a] - vals[b])
  const rows = new Array<number>(vals.length).fill(0)
  const lastX = new Array<number>(nRows).fill(-Infinity)
  for (const i of order) {
    const x = px(vals[i])
    let r = lastX.findIndex((lx) => x - lx >= gap)
    if (r < 0) r = lastX.indexOf(Math.min(...lastX))
    rows[i] = r
    lastX[r] = x
  }
  return rows
}

function StripLayer({ pos, neg, sel }: { pos: number[]; neg: number[]; sel: [number, number] }) {
  const { xs, ys } = usePlot()
  const posRows = labelRows(pos, xs, 3)
  const negRows = labelRows(neg, xs, 2)
  const yP = ys(0.72)
  const yN = ys(0.28)
  const [pi, nj] = sel
  const good = pos[pi] > neg[nj]
  const tie = pos[pi] === neg[nj]
  return (
    <g>
      <line x1={xs(0)} x2={xs(1)} y1={ys(0.5)} y2={ys(0.5)} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v} className="plot-axes" transform={`translate(${xs(v)},${ys(0)})`}>
          <line y2={5} />
          <text y={17} textAnchor={v === 0 ? 'start' : v === 1 ? 'end' : 'middle'}>
            {v}
          </text>
        </g>
      ))}
      <line x1={xs(0)} x2={xs(1)} y1={ys(0)} y2={ys(0)} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
      <line x1={xs(pos[pi])} y1={yP} x2={xs(neg[nj])} y2={yN} style={{ stroke: tie ? 'var(--viz-6)' : good ? OK_C : BAD_C, strokeWidth: 3, strokeDasharray: good ? undefined : '5 4' }} />
      {pos.map((v, i) => (
        <text key={`pl${i}`} className="plot-label" x={xs(v)} y={yP - 13 - 12 * posRows[i]} textAnchor="middle" style={{ fill: txt(POS_C), fontSize: 11.5 }}>
          {P_NAMES[i]}
        </text>
      ))}
      {neg.map((v, i) => (
        <text key={`nl${i}`} className="plot-label" x={xs(v)} y={yN + 22 + 12 * negRows[i]} textAnchor="middle" style={{ fill: txt(NEG_C), fontSize: 11.5 }}>
          {N_NAMES[i]}
        </text>
      ))}
    </g>
  )
}

function GridLayer({ pos, neg, sel, onSelect }: { pos: number[]; neg: number[]; sel: [number, number]; onSelect: (s: [number, number]) => void }) {
  const { xs, ys } = usePlot()
  const po = order(pos) // positives, highest score first -> rows from the bottom
  const no = order(neg) // negatives, highest score first -> columns from the left
  const roc = rocPoints(pos, neg)
  const n = 5
  const cells = []
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const pi = po[r]
      const nj = no[c]
      const win = pos[pi] > neg[nj]
      const tie = pos[pi] === neg[nj]
      const chosen = sel[0] === pi && sel[1] === nj
      const x0 = xs(c / n)
      const y0 = ys((r + 1) / n)
      const w = xs((c + 1) / n) - x0
      const h = ys(r / n) - y0
      cells.push(
        <g key={`${r}-${c}`} onClick={() => onSelect([pi, nj])} style={{ cursor: 'pointer' }}>
          <rect
            x={x0 + 1.5}
            y={y0 + 1.5}
            width={w - 3}
            height={h - 3}
            rx={4}
            style={{
              fill: `color-mix(in srgb, ${tie ? 'var(--viz-6)' : win ? OK_C : BAD_C} ${win || tie ? 26 : 12}%, var(--surface))`,
              stroke: chosen ? 'var(--viz-ink)' : 'none',
              strokeWidth: 2.5,
            }}
          />
          <text x={x0 + w / 2} y={y0 + h / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ink-2)', fontWeight: 600, pointerEvents: 'none' }}>
            {tie ? '½' : win ? '✓' : '✗'}
          </text>
        </g>,
      )
    }
  const path = roc.map(([x, y], i) => `${i ? 'L' : 'M'}${xs(x).toFixed(1)},${ys(y).toFixed(1)}`).join('')
  return (
    <g>
      {cells}
      <path d={path} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 3, strokeLinejoin: 'round', pointerEvents: 'none' }} />
      <line x1={xs(0)} x2={xs(1)} y1={ys(0)} y2={ys(0)} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
      <line x1={xs(0)} x2={xs(0)} y1={ys(0)} y2={ys(1)} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
      {po.map((pi, r) => (
        <text key={`rl${pi}`} x={xs(0) - 6} y={ys((r + 0.5) / n)} dy="0.35em" textAnchor="end" style={{ fontSize: 11.5, fontWeight: 700, fill: txt(POS_C) }}>
          {P_NAMES[pi]}
        </text>
      ))}
      {no.map((nj, c) => (
        <text key={`cl${nj}`} x={xs((c + 0.5) / n)} y={ys(0) + 15} textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: txt(NEG_C) }}>
          {N_NAMES[nj]}
        </text>
      ))}
      <text className="plot-axis-label" x={xs(1)} y={ys(0) + 32} textAnchor="end">
        false positive rate →
      </text>
      <text className="plot-axis-label" x={xs(0) - 34} y={ys(1) - 6} textAnchor="start">
        ↑ true positive rate
      </text>
    </g>
  )
}

export default function AUCPairs() {
  const [pos, setPos] = useState(START_POS)
  const [neg, setNeg] = useState(START_NEG)
  const [sel, setSel] = useState<[number, number]>([4, 2]) // P5 (0.30) vs N3 (0.40): a wrongly ranked pair
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const { wins, ties, total, auc } = pairAUC(pos, neg)
  const [pi, nj] = sel
  const verdict = pos[pi] > neg[nj] ? 'ranked correctly' : pos[pi] === neg[nj] ? 'a tie (counts ½)' : 'ranked the wrong way round'

  return (
    <Figure
      title="AUC is a count of correctly ranked pairs"
      caption={
        <>
          Drag any point past another: one cell flips and the AUC changes by 1/25 = 0.04. Click a cell to see which positive and negative it compares.
        </>
      }
    >
      <div ref={wrapRef} className={s.wrap} style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1.25fr 1fr', gap: 16, alignItems: 'center', justifyItems: 'center' }}>
        <div style={{ width: '100%' }}>
          <Plot x={[0, 1]} y={[0, 1]} width={420} height={170} minHeight={160} maxWidth={460} margin={{ left: 14, right: 14, top: 8, bottom: 26 }} ariaLabel="Scores of five positives and five negatives; drag to change them">
            <StripLayer pos={pos} neg={neg} sel={sel} />
            {pos.map((v, i) => (
              <DraggablePoint key={`p${i}`} x={v} y={0.72} lockY color={POS_C} r={7} onChange={(x) => setPos(pos.map((o, k) => (k === i ? snap(x) : o)))} />
            ))}
            {neg.map((v, i) => (
              <DraggablePoint key={`n${i}`} x={v} y={0.28} lockY color={NEG_C} r={7} onChange={(x) => setNeg(neg.map((o, k) => (k === i ? snap(x) : o)))} />
            ))}
          </Plot>
          <p className={s.note}>
            Selected pair: <b style={{ color: txt(POS_C) }}>{P_NAMES[pi]}</b> ({pos[pi].toFixed(2)}) versus <b style={{ color: txt(NEG_C) }}>{N_NAMES[nj]}</b> ({neg[nj].toFixed(2)}):{' '}
            <b>{verdict}</b>
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: 330 }}>
          <Plot x={[0, 1]} y={[0, 1]} width={300} height={300} maxWidth={330} margin={{ left: 40, right: 10, top: 18, bottom: 38 }} ariaLabel={`ROC staircase over the 25 pairs: ${wins} correct, AUC ${auc.toFixed(2)}`}>
            <GridLayer pos={pos} neg={neg} sel={sel} onSelect={setSel} />
          </Plot>
        </div>
      </div>
      <p className={s.note}>
        <span className={s.big}>
          {wins}
          {ties ? ` + ½ × ${ties}` : ''}
        </span>{' '}
        of {total} pairs ranked correctly, so <span className={s.big}>AUC = {auc.toFixed(2)}</span>
      </p>
      <Controls>
        <Button
          onClick={() => {
            setPos(START_POS)
            setNeg(START_NEG)
            setSel([4, 2])
          }}
        >
          Reset scores
        </Button>
      </Controls>
    </Figure>
  )
}
