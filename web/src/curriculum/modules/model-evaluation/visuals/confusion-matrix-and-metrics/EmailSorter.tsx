import { useState } from 'react'
import { Figure, Controls, Slider, Readout, Plot, usePlot, DraggablePoint } from '../../../../../kit'
import s from './eval.module.css'

/*
  The lesson's ten-email example. Each email is a lettered token placed at its spam score
  (spam above the line, real emails below). Moving the threshold re-sorts the letters into
  the four cells of the confusion matrix.
*/

export const EMAILS: { id: string; score: number; spam: boolean }[] = [
  { id: 'A', score: 0.95, spam: true },
  { id: 'B', score: 0.8, spam: true },
  { id: 'C', score: 0.7, spam: false },
  { id: 'D', score: 0.6, spam: false },
  { id: 'E', score: 0.55, spam: true },
  { id: 'F', score: 0.3, spam: true },
  { id: 'G', score: 0.2, spam: false },
  { id: 'H', score: 0.15, spam: false },
  { id: 'I', score: 0.1, spam: false },
  { id: 'J', score: 0.05, spam: false },
]

const POS_C = 'var(--viz-2)'
const NEG_C = 'var(--viz-1)'

function Tokens({ t }: { t: number }) {
  const { xs, ys, width } = usePlot()
  const r = width < 380 ? 9 : 10
  // rows are stacked up from the bottom axis so the plot has no empty band
  const lane1 = ys(0) - 12 - r
  const lane0 = lane1 - (2 * r + 2)
  const mid = lane0 - r - 6
  const spamY = mid - r - 6
  const x0 = xs(0)
  const x1 = xs(1)
  const xt = xs(t)
  let realIdx = 0
  return (
    <g>
      <rect x={xt} y={ys(1)} width={x1 - xt} height={ys(0) - ys(1)} style={{ fill: 'color-mix(in srgb, var(--viz-2) 9%, transparent)' }} />
      <text className="plot-label" x={x1 - 4} y={ys(1) + 13} textAnchor="end" style={{ fontSize: 12 }}>
        predicted spam →
      </text>
      <text className="plot-label" x={x0 + 4} y={ys(1) + 13} textAnchor="start" style={{ fontSize: 12 }}>
        ← predicted not spam
      </text>
      <line x1={x0} x2={x1} y1={mid} y2={mid} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.25 }} />
      {EMAILS.map((e) => {
        // real emails zig-zag in two rows so close scores do not collide
        const lane = e.spam ? 0 : realIdx++ % 2
        const cy = e.spam ? spamY : lane === 0 ? lane0 : lane1
        const cx = xs(e.score)
        const predSpam = e.score >= t
        const wrong = predSpam !== e.spam
        const c = e.spam ? POS_C : NEG_C
        return (
          <g key={e.id}>
            <line x1={cx} x2={cx} y1={mid} y2={cy} style={{ stroke: c, strokeWidth: 1.2, opacity: 0.6 }} />
            <circle cx={cx} cy={cy} r={r} style={{ fill: c, stroke: wrong ? 'var(--viz-neg)' : 'var(--surface)', strokeWidth: wrong ? 2.5 : 1.5 }} />
            <text x={cx} y={cy} dy="0.35em" textAnchor="middle" className={e.spam ? s.onOrange : undefined} style={{ fill: e.spam ? undefined : 'var(--surface)', fontSize: r + 2, fontWeight: 800 }}>
              {e.id}
            </text>
          </g>
        )
      })}
      <g className="plot-axes">
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v} transform={`translate(${xs(v)},${ys(0)})`}>
            <line y2={5} />
            <text y={17} textAnchor={v === 0 ? 'start' : v === 1 ? 'end' : 'middle'}>
              {v}
            </text>
          </g>
        ))}
        <line x1={x0} x2={x1} y1={ys(0)} y2={ys(0)} />
      </g>
      <line x1={xt} x2={xt} y1={ys(1) + 18} y2={ys(0)} style={{ stroke: 'var(--viz-ink)', strokeWidth: 2.2 }} />
    </g>
  )
}

export default function EmailSorter() {
  const [k, setK] = useState(10) // threshold = k / 20
  const t = k / 20
  const cell = (pred: boolean, actual: boolean) => EMAILS.filter((e) => e.score >= t === pred && e.spam === actual).map((e) => e.id)
  const tp = cell(true, true)
  const fp = cell(true, false)
  const fn = cell(false, true)
  const tn = cell(false, false)
  const box = (name: string, ids: string[], right: boolean) => (
    <div className={`${s.cell} ${right ? s.cellRight : s.cellWrong}`} role="cell" aria-label={`${name}: ${ids.length} (${ids.join(', ') || 'none'})`}>
      <span className={s.cellName}>{name}</span>
      <span className={s.cellCount}>{ids.length}</span>
      <span className={s.cellSub} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', minHeight: '1.1em' }}>
        {ids.join(' ') || '–'}
      </span>
    </div>
  )

  return (
    <Figure
      title="Sort ten emails into the confusion matrix"
      caption={
        <>
          Drag the threshold: every email to its right goes to the spam folder, and a red ring marks a mistake. Try 0.25, 0.50 and 0.75, then compare with
          the table under “Moving the threshold”.
        </>
      }
    >
      <Plot x={[0, 1]} y={[0, 1]} width={560} height={150} minHeight={150} maxWidth={620} margin={{ left: 14, right: 14, top: 10, bottom: 28 }} ariaLabel={`Ten emails on a score line with threshold ${t.toFixed(2)}`}>
        <Tokens t={t} />
        <DraggablePoint x={t} y={1} lockY color="var(--viz-ink)" r={8} onChange={(x) => setK(Math.max(0, Math.min(20, Math.round(x * 20))))} />
      </Plot>
      <div className={s.legend}>
        <span>
          <span className={s.swatch} style={{ background: POS_C }} />
          spam (actual 1), above the line
        </span>
        <span>
          <span className={s.swatch} style={{ background: NEG_C }} />
          real email (actual 0), below
        </span>
        <span>
          <span className={s.swatch} style={{ background: 'var(--surface)', border: '2px solid var(--viz-neg)' }} />
          ring = mistake
        </span>
      </div>
      <Controls>
        <Slider label="threshold" value={k} min={0} max={20} step={1} onChange={setK} format={(v) => (v / 20).toFixed(2)} />
        <Readout
          items={[
            ['correct', `${tp.length + tn.length} of ${EMAILS.length}`],
            ['mistakes', String(fp.length + fn.length)],
          ]}
        />
      </Controls>
      <div className={s.cm} role="table" aria-label="Confusion matrix with the emails in each cell">
        <div className={s.cmCorner} />
        <div className={s.cmColHead}>
          <span className={s.cmAxis}>predicted</span>0: not spam
        </div>
        <div className={s.cmColHead}>
          <span className={s.cmAxis}>predicted</span>1: spam
        </div>
        <div className={s.cmRowHead}>
          <span className={s.cmAxis}>actual</span>0: not spam
        </div>
        {box('TN', tn, true)}
        {box('FP', fp, false)}
        <div className={s.cmRowHead}>
          <span className={s.cmAxis}>actual</span>1: spam
        </div>
        {box('FN', fn, false)}
        {box('TP', tp, true)}
      </div>
    </Figure>
  )
}
