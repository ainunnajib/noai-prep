import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, Toggle, Bars } from '../../../../../kit'
import { txt } from '../confusion-matrix-and-metrics/colors'
import s from './reg.module.css'

/*
  Macro versus micro (and weighted) F1 for a 3-class vehicle classifier.
  For each class the learner sets how many images there are and what percentage of them the model
  labels correctly. The wrong ones are shared out among the other two classes in proportion to their
  sizes (a model that errs tends to guess the common classes). From the resulting confusion matrix:
    per-class precision, recall and F1 (one class against the rest),
    macro-F1    = plain average of the three F1s (every class counts equally),
    weighted-F1 = average weighted by class size,
    micro-F1    = F1 of the pooled TP / FP / FN counts, which for single-label data equals accuracy.
  Aha: with a big class done well and a rare class done badly, micro stays high and macro drops.
*/

const NAMES = ['car', 'bus', 'motorcycle']
const COLORS = ['var(--viz-1)', 'var(--viz-3)', 'var(--viz-4)']

interface Setting {
  n: number[]
  pct: number[]
}

const PRESETS: Record<string, Setting> = {
  rare: { n: [800, 150, 50], pct: [98, 85, 20] },
  balanced: { n: [300, 300, 300], pct: [98, 85, 20] },
  good: { n: [800, 150, 50], pct: [95, 90, 90] },
}

/** confusion matrix: rows = true class, columns = predicted class */
function buildMatrix(n: number[], pct: number[]): number[][] {
  return n.map((ni, i) => {
    const row = [0, 0, 0]
    const correct = Math.round((ni * pct[i]) / 100)
    row[i] = correct
    const wrong = ni - correct
    const others = [0, 1, 2].filter((j) => j !== i)
    const tot = others.reduce((a, j) => a + n[j], 0)
    const first = tot > 0 ? Math.round((wrong * n[others[0]]) / tot) : Math.round(wrong / 2)
    row[others[0]] = first
    row[others[1]] = wrong - first
    return row
  })
}

const div = (a: number, b: number) => (b > 0 ? a / b : 0)

export default function MacroMicroAverage() {
  const [st, setSt] = useState<Setting>(PRESETS.rare)
  const [showSizes, setShowSizes] = useState(false)

  const r = useMemo(() => {
    const M = buildMatrix(st.n, st.pct)
    const per = [0, 1, 2].map((c) => {
      const tp = M[c][c]
      const fp = M.reduce((a, row) => a + row[c], 0) - tp
      const fn = M[c].reduce((a, v) => a + v, 0) - tp
      const p = div(tp, tp + fp)
      const rec = div(tp, tp + fn)
      const f1 = div(2 * tp, 2 * tp + fp + fn)
      return { tp, fp, fn, p, rec, f1, n: st.n[c] }
    })
    const N = st.n.reduce((a, b) => a + b, 0)
    const TP = per.reduce((a, x) => a + x.tp, 0)
    const FP = per.reduce((a, x) => a + x.fp, 0)
    const FN = per.reduce((a, x) => a + x.fn, 0)
    const macro = per.reduce((a, x) => a + x.f1, 0) / 3
    const weighted = per.reduce((a, x) => a + x.f1 * x.n, 0) / N
    const micro = div(2 * TP, 2 * TP + FP + FN)
    const acc = TP / N
    return { M, per, N, TP, FP, FN, macro, weighted, micro, acc }
  }, [st])

  const setN = (c: number, v: number) => setSt((o) => ({ ...o, n: o.n.map((x, i) => (i === c ? v : x)) }))
  const setPct = (c: number, v: number) => setSt((o) => ({ ...o, pct: o.pct.map((x, i) => (i === c ? v : x)) }))
  const gap = r.micro - r.macro
  const equalSizes = st.n.every((v) => v === st.n[0])
  const verdict =
    Math.abs(gap) < 0.02
      ? 'The two averages agree here.'
      : equalSizes
        ? 'All three classes are the same size, so micro (accuracy, here just the average of the three recalls) can no longer hide a weak class.'
        : gap > 0
          ? `Micro is ${gap.toFixed(2)} higher: the big classes are hiding a weak one.`
          : `Macro is ${(-gap).toFixed(2)} higher: a small class is doing better than the big ones.`

  return (
    <Figure
      title="Macro versus micro averaging"
      caption={
        <>
          Start with “Rare class ignored”: micro looks great while macro exposes the weak motorcycle class. Then press “Same model, balanced classes”: micro
          (accuracy) falls from 0.92 to 0.68 and moves close to macro.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Button primary onClick={() => setSt(PRESETS.rare)}>
            Rare class ignored
          </Button>
          <Button onClick={() => setSt(PRESETS.balanced)}>Same model, balanced classes</Button>
          <Button onClick={() => setSt(PRESETS.good)}>Rare class done well</Button>
        </Controls>

        {/* the result first, so every slider below moves bars that are already on screen (also on phones) */}
        <div className={s.panel}>
          <p className={s.panelTitle}>Three ways to average the per-class F1 scores</p>
          <Bars
            ariaLabel="Macro, weighted and micro F1"
            max={1}
            data={[
              { label: 'macro', value: r.macro, color: 'var(--viz-5)', strong: true },
              { label: 'weighted', value: r.weighted, color: 'var(--viz-6)' },
              { label: 'micro', value: r.micro, color: 'var(--viz-2)', strong: true },
            ]}
          />
          <p className={s.small} aria-live="polite">
            {verdict}
          </p>
        </div>

        <p className={s.small}>
          For each class, set the percentage of its images the model labels correctly (its recall); the wrong ones are shared out among the other classes.
        </p>
        <div className={s.classGrid}>
          {NAMES.map((name, c) => (
            <div key={name} className={s.classBox}>
              <span className={s.className} style={{ color: txt(COLORS[c]) }}>
                <span className={s.swatchDot} style={{ background: COLORS[c] }} /> {name}
                <span className={s.muted} style={{ fontWeight: 600 }}>
                  ({st.n[c].toLocaleString('en-GB')} images)
                </span>
              </span>
              <Slider label="% correct (recall)" value={st.pct[c]} min={0} max={100} step={1} onChange={(v) => setPct(c, v)} format={(v) => `${v}%`} />
              {showSizes && <Slider label="images" value={st.n[c]} min={10} max={1000} step={10} onChange={(v) => setN(c, v)} />}
            </div>
          ))}
        </div>
        <Controls>
          <Toggle label="Change class sizes" checked={showSizes} onChange={setShowSizes} />
        </Controls>

        <div className={s.panels}>
          <div className={s.panel}>
            <p className={s.panelTitle}>Confusion matrix (rows: true class, columns: predicted)</p>
            <div className={s.tableWrap}>
              <table className={s.table} aria-label="Confusion matrix">
                <thead>
                  <tr>
                    <th className={s.rowHead}>true ↓ / pred →</th>
                    {NAMES.map((nm) => (
                      <th key={nm}>{nm === 'motorcycle' ? 'motorc.' : nm}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {r.M.map((row, i) => (
                    <tr key={i}>
                      <td className={s.rowHead} style={{ color: txt(COLORS[i]), fontWeight: 700 }}>
                        {NAMES[i]}
                      </td>
                      {row.map((v, j) => (
                        <td key={j} className={i === j ? s.diag : v > 0 ? s.off : undefined}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={s.tableWrap}>
              <table className={s.table} aria-label="Per-class precision, recall and F1">
                <thead>
                  <tr>
                    <th className={s.rowHead}>class</th>
                    <th>TP</th>
                    <th>FP</th>
                    <th>FN</th>
                    <th>P</th>
                    <th>R</th>
                    <th>F1</th>
                  </tr>
                </thead>
                <tbody>
                  {r.per.map((x, i) => (
                    <tr key={i}>
                      <td className={s.rowHead} style={{ color: txt(COLORS[i]), fontWeight: 700 }}>
                        {NAMES[i]}
                      </td>
                      <td>{x.tp}</td>
                      <td>{x.fp}</td>
                      <td>{x.fn}</td>
                      <td>{x.p.toFixed(2)}</td>
                      <td>{x.rec.toFixed(2)}</td>
                      <td>
                        <b>{x.f1.toFixed(2)}</b>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className={s.rowHead}>
                      <b>pooled</b>
                    </td>
                    <td>{r.TP}</td>
                    <td>{r.FP}</td>
                    <td>{r.FN}</td>
                    <td colSpan={3} className={s.muted}>
                      → micro-F1
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.panel}>
            <p className={s.panelTitle}>Per-class F1</p>
            <Bars
              ariaLabel="F1 for each class"
              max={1}
              data={r.per.map((x, i) => ({ label: `${NAMES[i]} (${x.n})`, value: x.f1, color: COLORS[i] }))}
            />
            <p className={s.small}>
              Macro = ({r.per.map((x) => x.f1.toFixed(2)).join(' + ')}) ÷ 3 = <b>{r.macro.toFixed(3)}</b>. Micro = 2 × {r.TP} ÷ (2 × {r.TP} + {r.FP} +{' '}
              {r.FN}) = <b>{r.micro.toFixed(3)}</b>, the same as accuracy {r.TP} ÷ {r.N} = {r.acc.toFixed(3)}.
            </p>
          </div>
        </div>
      </div>
    </Figure>
  )
}
