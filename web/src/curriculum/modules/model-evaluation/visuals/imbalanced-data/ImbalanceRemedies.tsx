import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, Plot, Grid, Axes, usePlot, useBump, useNarrow } from '../../../../../kit'
import { metricsOf } from '../confusion-matrix-and-metrics/evalMath'
import s from '../confusion-matrix-and-metrics/eval.module.css'
import {
  TRAIN_NEG,
  TRAIN_POS,
  NN,
  N_NEG,
  N_POS,
  RATIO,
  fitLogistic,
  trainingSet,
  testMetrics,
  smotePoints,
  undersampleIdx,
  type Model,
  type Pt,
  type Remedy,
} from './remedies'

/*
  Four remedies (plus the threshold shortcut) for a 5% minority class, on the same training data (228 genuine, 12 fraud).
  The solid line is the logistic-regression boundary learned from the remedied training set; the
  dashed line is the boundary with no fix. Metrics are measured on an untouched test set
  (1,900 genuine + 100 fraud) at threshold 0.5.
*/

type Tab = Remedy | 'threshold'

const TABS: { id: Tab; title: string; sub: string }[] = [
  { id: 'none', title: 'No fix', sub: 'train as is' },
  { id: 'weights', title: 'Class weights', sub: 'changes the loss' },
  { id: 'oversample', title: 'Oversample', sub: 'copies frauds' },
  { id: 'smote', title: 'SMOTE', sub: 'synthetic frauds' },
  { id: 'undersample', title: 'Undersample', sub: 'drops genuine' },
  { id: 'threshold', title: 'Lower threshold', sub: 'changes the decision' },
]

const INFO: Record<Tab, { what: string; pro: string; con: string }> = {
  none: {
    what: 'Nothing changes. 95% of the training loss comes from genuine payments, so the model plays safe and the boundary sits deep inside the fraud cloud.',
    pro: 'Simple; probabilities stay honest (calibrated).',
    con: 'Misses about half of the frauds.',
  },
  weights: {
    what: `The data stay the same; each fraud's loss is multiplied by ${RATIO} (= ${N_NEG} ÷ ${N_POS}), so the 12 frauds weigh as much in total as the ${N_NEG} genuine payments. The circles are drawn bigger to show their weight.`,
    pro: 'Keeps every example, no extra training time, one argument in most libraries.',
    con: 'Predicted probabilities are pushed up, so they no longer mean "real chance of fraud".',
  },
  oversample: {
    what: `Each fraud is copied until the classes balance: 12 × ${RATIO} = ${N_NEG} fraud rows. The boundary is exactly the same as with class weights: a point copied ${RATIO} times counts ${RATIO} times.`,
    pro: 'Works with any model, even ones without a weight option.',
    con: 'Bigger, slower training set of exact duplicates, which encourages memorising those 12 rows.',
  },
  smote: {
    what: 'New synthetic frauds are placed on the lines between each fraud and its nearest fraud neighbours (faint lines), each at a random λ. Shrink the range of λ to 0 and every new point lands on top of an original: plain duplication.',
    pro: 'Adds variety instead of exact copies.',
    con: 'Can invent unrealistic points where the classes overlap; only for numeric features; one more step that must be done on the training set only.',
  },
  undersample: {
    what: `Randomly keep only ${N_POS} genuine payments (dark dots) and drop the other ${N_NEG - N_POS}. Press "new random draw": the boundary jumps around, because so little data is left.`,
    pro: 'Fast; fine when the majority class is enormous.',
    con: `Throws away ${Math.round((100 * (N_NEG - N_POS)) / N_NEG)}% of the genuine data, so the model is less stable.`,
  },
  threshold: {
    what: `Keep the plain model and lower its threshold from 0.5 to 1/(1 + ${RATIO}) = 0.05. Its boundary lands close to where class weights put theirs, and catches almost the same frauds.`,
    pro: 'No retraining at all; you can pick the threshold from the costs.',
    con: 'You need a validation set to choose the threshold.',
  },
}

const NEG_C = 'var(--viz-1)'
const POS_C = 'var(--viz-2)'
const XR: [number, number] = [-3.2, 5.2]
const YR: [number, number] = [-3, 4.4]

/** Clip the line w·x + b = 0 to the plot box; returns the polygon of the 'fraud' side too. */
function boundaryGeometry(m: Model) {
  const corners: Pt[] = [
    [XR[0], YR[0]],
    [XR[1], YR[0]],
    [XR[1], YR[1]],
    [XR[0], YR[1]],
  ]
  const f = (p: Pt) => m.w[0] * p[0] + m.w[1] * p[1] + m.b
  const poly: Pt[] = []
  const line: Pt[] = []
  for (let i = 0; i < 4; i++) {
    const a = corners[i]
    const c = corners[(i + 1) % 4]
    const fa = f(a)
    const fc = f(c)
    if (fa >= 0) poly.push(a)
    if (fa >= 0 !== fc >= 0) {
      const t = fa / (fa - fc)
      const q: Pt = [a[0] + t * (c[0] - a[0]), a[1] + t * (c[1] - a[1])]
      poly.push(q)
      line.push(q)
    }
  }
  return { poly, line }
}

function Layer({ tab, model, base, lam, keep }: { tab: Tab; model: Model; base: Model; lam: number; keep: Set<number> }) {
  const { xs, ys, clipId } = usePlot()
  const g = boundaryGeometry(model)
  const g0 = boundaryGeometry(base)
  const path = (pts: Pt[], close = false) => pts.map((p, i) => `${i ? 'L' : 'M'}${xs(p[0]).toFixed(1)},${ys(p[1]).toFixed(1)}`).join('') + (close ? 'Z' : '')
  const syn = tab === 'smote' ? smotePoints(lam) : []
  const posR = tab === 'weights' ? 4.5 * Math.sqrt(RATIO) * 0.5 : 5
  return (
    <g clipPath={`url(#${clipId})`}>
      {g.poly.length > 2 && <path d={path(g.poly, true)} style={{ fill: 'color-mix(in srgb, var(--viz-2) 12%, transparent)' }} />}
      {TRAIN_NEG.map((p, i) => {
        const dropped = tab === 'undersample' && !keep.has(i)
        return (
          <circle
            key={`n${i}`}
            cx={xs(p[0])}
            cy={ys(p[1])}
            r={dropped ? 2.4 : tab === 'undersample' ? 4.5 : 3.2}
            style={{ fill: NEG_C, opacity: dropped ? 0.18 : tab === 'undersample' ? 1 : 0.55 }}
          />
        )
      })}
      {tab === 'smote' &&
        TRAIN_POS.map((p, i) =>
          NN[i].map((j) => (
            <line
              key={`l${i}-${j}`}
              x1={xs(p[0])}
              y1={ys(p[1])}
              x2={xs(TRAIN_POS[j][0])}
              y2={ys(TRAIN_POS[j][1])}
              style={{ stroke: POS_C, strokeWidth: 1, opacity: 0.35 }}
            />
          )),
        )}
      {syn.map((p, i) => (
        <circle key={`s${i}`} cx={xs(p[0])} cy={ys(p[1])} r={2.8} style={{ fill: 'var(--surface)', stroke: POS_C, strokeWidth: 1.4 }} />
      ))}
      {TRAIN_POS.map((p, i) => (
        <g key={`p${i}`}>
          {tab === 'oversample' &&
            [3, 2, 1].map((k) => (
              <circle key={k} cx={xs(p[0]) + 2.2 * k} cy={ys(p[1]) - 2.2 * k} r={5} style={{ fill: POS_C, opacity: 0.35, stroke: 'var(--surface)', strokeWidth: 1 }} />
            ))}
          <circle cx={xs(p[0])} cy={ys(p[1])} r={posR} style={{ fill: POS_C, stroke: 'var(--surface)', strokeWidth: 1.5, opacity: tab === 'weights' ? 0.85 : 1 }} />
        </g>
      ))}
      {tab !== 'none' && g0.line.length === 2 && <path d={path(g0.line)} style={{ stroke: 'var(--viz-muted)', strokeWidth: 2, strokeDasharray: '6 5', fill: 'none' }} />}
      {g.line.length === 2 && <path d={path(g.line)} style={{ stroke: 'var(--viz-ink)', strokeWidth: 2.6, fill: 'none' }} />}
    </g>
  )
}

export default function ImbalanceRemedies() {
  const [tab, setTab] = useState<Tab>('none')
  const [lam, setLam] = useState(1)
  const [draw, bump] = useBump()
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)

  const base = useMemo(() => fitLogistic(trainingSet('none', 1, 0)), [])
  const model = useMemo<Model>(() => {
    if (tab === 'none') return base
    if (tab === 'threshold') return { w: base.w, b: base.b + Math.log(RATIO) }
    return fitLogistic(trainingSet(tab, lam, draw))
  }, [tab, lam, draw, base])
  const keep = useMemo(() => new Set(undersampleIdx(draw)), [draw])

  const c = testMetrics(model)
  const m = metricsOf(c)
  const trainSize = tab === 'undersample' ? 2 * N_POS : tab === 'oversample' || tab === 'smote' ? 2 * N_NEG : N_NEG + N_POS
  const info = INFO[tab]

  return (
    <Figure
      title="Four remedies for a rare class (plus a baseline and a shortcut)"
      caption={
        <>
          Click through the tabs. Every remedy pushes the boundary into the genuine cloud: more frauds caught, more false alarms. The table scores each model on
          an untouched test set with the real 5% fraud rate.
        </>
      }
    >
      <div className={s.cards} role="radiogroup" aria-label="Remedy" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${narrow ? 100 : 110}px, 100%), 1fr))` }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={t.id === tab} className={`${s.card} ${t.id === tab ? s.cardActive : ''}`} onClick={() => setTab(t.id)}>
            <span className={s.cardTitle}>{t.title}</span>
            <span className={s.cardSub}>{t.sub}</span>
          </button>
        ))}
      </div>
      <div ref={wrapRef} className={s.wrap}>
        <Plot x={XR} y={YR} width={520} height={400} maxWidth={560} margin={{ left: 34, bottom: 30, top: 24 }} ariaLabel={`Training data and learned boundary for remedy: ${tab}`}>
          <Grid xTicks={8} yTicks={7} />
          <Axes xLabel="feature 1" yLabel="feature 2" xTicks={8} yTicks={7} />
          <Layer tab={tab} model={model} base={base} lam={lam} keep={keep} />
        </Plot>
      </div>
      <div className={s.legend}>
        <span>
          <span className={s.swatch} style={{ background: NEG_C }} />
          genuine
        </span>
        <span>
          <span className={s.swatch} style={{ background: POS_C }} />
          fraud (5% of training data)
        </span>
        <span>
          <span className={s.swatchLine} style={{ borderColor: 'var(--viz-ink)' }} />
          boundary after the remedy
        </span>
        {tab !== 'none' && (
          <span>
            <span className={`${s.swatchLine} ${s.swatchDash}`} style={{ borderColor: 'var(--viz-muted)' }} />
            no fix
          </span>
        )}
      </div>
      {(tab === 'smote' || tab === 'undersample') && (
        <Controls>
          {tab === 'smote' && (
            <Slider label="largest λ (each new point gets a random λ between 0 and this)" value={lam} min={0} max={1} step={0.05} onChange={setLam} format={(v) => v.toFixed(2)} />
          )}
          {tab === 'undersample' && <Button onClick={bump}>New random draw</Button>}
        </Controls>
      )}
      <table className={s.table} style={{ maxWidth: 460 }}>
        <thead>
          <tr>
            <th>test set (2,000 payments)</th>
            <th>this remedy</th>
            <th>no fix</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const m0 = metricsOf(testMetrics(base))
            const c0 = testMetrics(base)
            return (
              [
                ['frauds caught (of 100)', String(c.tp), String(c0.tp)],
                ['false alarms (of 1,900)', String(c.fp), String(c0.fp)],
                ['recall', m.recall.toFixed(2), m0.recall.toFixed(2)],
                ['precision', m.precision.toFixed(2), m0.precision.toFixed(2)],
                ['F1', m.f1.toFixed(2), m0.f1.toFixed(2)],
                ['training rows', trainSize.toLocaleString('en-GB'), String(N_NEG + N_POS)],
              ] as [string, string, string][]
            ).map(([k, a, b]) => (
              <tr key={k}>
                <td>{k}</td>
                <td style={{ fontWeight: 700 }}>{a}</td>
                <td>{b}</td>
              </tr>
            ))
          })()}
        </tbody>
      </table>
      <p className={s.note} style={{ textAlign: 'left' }}>
        {info.what}
        <br />
        <b>Good:</b> {info.pro} <b>Watch out:</b> {info.con}
      </p>
    </Figure>
  )
}
