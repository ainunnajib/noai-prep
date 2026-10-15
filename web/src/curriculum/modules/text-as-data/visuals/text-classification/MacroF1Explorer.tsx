import { useState } from 'react'
import { Figure, Controls, Slider, Toggle } from '../../../../../kit'
import { TryNotice } from '../Caption'
import s from './tc.module.css'

/*
  200 customer messages to a food-delivery app: 150 praise, 40 late delivery, 10 food safety.
  The learner controls how many of the 10 food-safety messages the classifier catches and how
  many praise messages it wrongly flags as food safety. Accuracy and macro-F1 are recomputed
  from the confusion matrix with the usual formulas.
*/

const CLASSES = ['praise', 'late delivery', 'food safety']
const SHORT = ['praise', 'late', 'safety']
const SUPPORT = [150, 40, 10]

function confusion(caught: number, alarms: number, lazy: boolean): number[][] {
  if (lazy)
    return [
      [150, 0, 0],
      [40, 0, 0],
      [10, 0, 0],
    ]
  return [
    [140 - alarms, 10, alarms],
    [8, 32, 0],
    [10 - caught, 0, caught],
  ]
}

function metrics(cm: number[][]) {
  const k = cm.length
  const total = cm.flat().reduce((a, b) => a + b, 0)
  const correct = cm.reduce((a, row, i) => a + row[i], 0)
  const per = Array.from({ length: k }, (_, c) => {
    const tp = cm[c][c]
    const fn = cm[c].reduce((a, b) => a + b, 0) - tp
    const fp = cm.reduce((a, row) => a + row[c], 0) - tp
    const precision = tp + fp ? tp / (tp + fp) : 0
    const recall = tp + fn ? tp / (tp + fn) : 0
    const f1 = 2 * tp + fp + fn ? (2 * tp) / (2 * tp + fp + fn) : 0
    return { tp, fp, fn, precision, recall, f1 }
  })
  const macro = per.reduce((a, p) => a + p.f1, 0) / k
  const weighted = per.reduce((a, p, i) => a + p.f1 * SUPPORT[i], 0) / total
  return { accuracy: correct / total, per, macro, weighted }
}

const cellBg = (v: number, diag: boolean) =>
  v === 0 ? 'var(--surface-2)' : `color-mix(in srgb, ${diag ? 'var(--viz-pos)' : 'var(--viz-neg)'} ${Math.round(12 + Math.min(1, Math.sqrt(v / 150)) * 48)}%, var(--surface))`

export default function MacroF1Explorer() {
  const [caught, setCaught] = useState(6)
  const [alarms, setAlarms] = useState(4)
  const [lazy, setLazy] = useState(false)
  const cm = confusion(caught, alarms, lazy)
  const m = metrics(cm)

  return (
    <Figure
      title="Accuracy versus macro-F1"
      caption={
        <TryNotice
          tryIt={
            <>
              slide <b>safety caught</b> from 10 down to 0, then switch on the lazy model.
            </>
          }
          notice={
            <>
              each missed safety message costs accuracy only 0.5 points, yet macro-F1 collapses: food safety is one of three equal votes. The lazy
              model scores 75% accuracy having learned nothing.
            </>
          }
          note={<>200 messages, only 10 about food safety. False alarms are praise messages wrongly flagged as food safety.</>}
        />
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Slider label="safety caught" value={caught} min={0} max={10} step={1} format={(v) => `${v} of 10`} onChange={(v) => { setCaught(v); setLazy(false) }} />
          <Slider label="false alarms" value={alarms} min={0} max={20} step={1} onChange={(v) => { setAlarms(v); setLazy(false) }} />
          <Toggle label="Lazy model: always predict “praise”" checked={lazy} onChange={setLazy} />
        </Controls>
        {lazy && <p className={s.verdict}>The lazy model ignores both sliders. Move either slider to switch back to the real classifier.</p>}
        <div className={s.big}>
          <div className={s.bigItem}>
            <small>Accuracy (all 200 messages)</small>
            <strong>{(m.accuracy * 100).toFixed(1)}%</strong>
            <span className={s.meter}>
              <span style={{ width: `${m.accuracy * 100}%`, background: 'var(--viz-5)' }} />
            </span>
          </div>
          <div className={s.bigItem}>
            <small>Macro-F1 (mean of the 3 class F1s)</small>
            <strong>{m.macro.toFixed(3)}</strong>
            <span className={s.meter}>
              <span style={{ width: `${m.macro * 100}%`, background: 'var(--viz-2)' }} />
            </span>
          </div>
        </div>

        <div className={s.panels}>
          <div>
            <p className={s.panelTitle}>Confusion matrix (rows: true class, columns: predicted)</p>
            <div className={s.cm} style={{ gridTemplateColumns: `auto repeat(3, minmax(3.1rem, 1fr))` }} role="table" aria-label="Confusion matrix">
              <span />
              {SHORT.map((c) => (
                <span key={c} className={s.cmHead} role="columnheader">
                  {c}
                </span>
              ))}
              {cm.map((row, i) => (
                <div key={i} role="row" style={{ display: 'contents' }}>
                  <span className={s.cmRowHead} role="rowheader">
                    {SHORT[i]} ({SUPPORT[i]})
                  </span>
                  {row.map((v, j) => (
                    <span key={j} role="cell" className={`${s.cmCell} ${i === j ? s.cmDiag : ''}`} style={{ background: cellBg(v, i === j) }}>
                      {v}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className={s.panelTitle}>Per class</p>
            <div className={s.metrics} role="table" aria-label="Precision, recall and F1 for each class">
              <span className={s.mName} />
              <span className={s.mHead}>precision</span>
              <span className={s.mHead}>recall</span>
              <span className={s.mHead}>F1</span>
              {m.per.map((p, i) => (
                <div key={i} role="row" style={{ display: 'contents' }}>
                  <span className={s.mName}>{CLASSES[i]}</span>
                  <span className={p.precision === 0 ? s.mZero : undefined}>{p.precision.toFixed(2)}</span>
                  <span className={p.recall === 0 ? s.mZero : undefined}>{p.recall.toFixed(2)}</span>
                  <span className={p.f1 === 0 ? s.mZero : undefined}>{p.f1.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p className={s.verdict} style={{ marginTop: '0.6rem' }}>
              macro-F1 = ({m.per.map((p) => p.f1.toFixed(2)).join(' + ')}) ÷ 3 = <strong>{m.macro.toFixed(3)}</strong>
              <br />
              weighted-F1 (by class size) = <strong>{m.weighted.toFixed(3)}</strong>
            </p>
          </div>
        </div>

      </div>
    </Figure>
  )
}
