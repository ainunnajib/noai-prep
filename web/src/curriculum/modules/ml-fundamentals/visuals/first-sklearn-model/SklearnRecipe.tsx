import { useState, type CSSProperties, type ReactNode } from 'react'
import {
  Figure,
  Segmented,
  usePlayer,
  PlayerControls,
  CodeBlock,
  Plot,
  Grid,
  Axes,
  Path,
  Dots,
  Label,
  Rect,
  usePlot,
  useNarrow,
  type DotDatum,
} from '../../../../../kit'

/*
  The scikit-learn recipe: create -> fit -> predict -> score. The same four lines drive a
  LinearRegression, a KNeighborsClassifier and a DecisionTreeClassifier, and a StandardScaler
  follows the matching fit -> transform pattern. Step through the lines; the highlighted line,
  what it returns, what is stored inside the model object and a picture of the model all update.
  Every number is computed here from the same tiny datasets used in the lesson (and checked
  against scikit-learn).
*/

type ModelId = 'linear' | 'knn' | 'tree' | 'scaler'

// ---------- data ----------
const AREA = [67, 73, 92, 95, 110, 122]
const PRICE = [420, 450, 530, 560, 610, 680]
const AREA_TEST = [84, 104]
const PRICE_TEST = [500, 585]
const NEW_AREA = 100

/** [hours revised, hours slept] -> 1 = pass, 0 = fail */
const XC: [number, number][] = [
  [1, 7], [2, 4], [2.5, 8], [3, 6], [3.5, 4.5], [5, 8], [6, 7], [7, 5], [8, 3.5], [8, 8], [4.5, 7.5], [9, 6],
]
const YC = [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1]
const XC_TEST: [number, number][] = [[2.2, 5.6], [5.6, 6.2], [7.4, 4.2], [3.6, 7.2]]
const YC_TEST = [0, 1, 0, 0]
const NEW_STUDENT: [number, number] = [6, 5]

// ---------- the models, implemented exactly as taught ----------
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length

function fitLinear() {
  const mx = mean(AREA)
  const my = mean(PRICE)
  let sxy = 0
  let sxx = 0
  AREA.forEach((x, i) => {
    sxy += (x - mx) * (PRICE[i] - my)
    sxx += (x - mx) ** 2
  })
  const w = sxy / sxx
  return { w, b: my - w * mx }
}
const LIN = fitLinear()
const linPredict = (x: number) => LIN.w * x + LIN.b
const R2 = (() => {
  const m = mean(PRICE_TEST)
  const ssRes = PRICE_TEST.reduce((s, y, i) => s + (y - linPredict(AREA_TEST[i])) ** 2, 0)
  const ssTot = PRICE_TEST.reduce((s, y) => s + (y - m) ** 2, 0)
  return 1 - ssRes / ssTot
})()

const K = 3
const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1])
function knn(q: [number, number]) {
  const order = XC.map((p, i) => ({ i, d: dist(p, q) })).sort((a, b) => a.d - b.d)
  const nn = order.slice(0, K)
  const votes = nn.reduce((s, n) => s + YC[n.i], 0)
  return { nn, pred: votes * 2 > K ? 1 : 0 }
}
const KNN_NEW = knn(NEW_STUDENT)
const KNN_TEST = XC_TEST.map((q) => knn(q).pred)
const KNN_ACC = KNN_TEST.filter((p, i) => p === YC_TEST[i]).length / YC_TEST.length

type Node = { leaf: true; cls: number } | { leaf: false; f: 0 | 1; t: number; left: Node; right: Node }
const gini = (ys: number[]) => {
  if (!ys.length) return 0
  const p = mean(ys)
  return 1 - p * p - (1 - p) * (1 - p)
}
/** CART with Gini impurity and midpoint thresholds, like DecisionTreeClassifier */
function grow(idx: number[], depth: number): Node {
  const ys = idx.map((i) => YC[i])
  const majority = mean(ys) > 0.5 ? 1 : 0
  if (depth === 0 || gini(ys) === 0) return { leaf: true, cls: majority }
  let best: { score: number; f: 0 | 1; t: number } | null = null
  for (const f of [0, 1] as const) {
    const vals = [...new Set(idx.map((i) => XC[i][f]))].sort((a, b) => a - b)
    for (let j = 0; j < vals.length - 1; j++) {
      const t = (vals[j] + vals[j + 1]) / 2
      const L = idx.filter((i) => XC[i][f] <= t).map((i) => YC[i])
      const R = idx.filter((i) => XC[i][f] > t).map((i) => YC[i])
      const score = (L.length * gini(L) + R.length * gini(R)) / idx.length
      if (!best || score < best.score - 1e-12) best = { score, f, t }
    }
  }
  if (!best) return { leaf: true, cls: majority }
  const b = best
  return {
    leaf: false,
    f: b.f,
    t: b.t,
    left: grow(idx.filter((i) => XC[i][b.f] <= b.t), depth - 1),
    right: grow(idx.filter((i) => XC[i][b.f] > b.t), depth - 1),
  }
}
const TREE = grow(XC.map((_, i) => i), 2)
const treePredict = (q: [number, number], n: Node = TREE): number => (n.leaf ? n.cls : treePredict(q, q[n.f] <= n.t ? n.left : n.right))
const TREE_TEST = XC_TEST.map((q) => treePredict(q))
const TREE_ACC = TREE_TEST.filter((p, i) => p === YC_TEST[i]).length / YC_TEST.length
/** the splits as a list, root first (this tree only grows on the right) */
const SPLITS: { f: 0 | 1; t: number }[] = []
for (let n: Node = TREE; !n.leaf; n = n.left.leaf ? n.right : n.left) SPLITS.push({ f: n.f, t: n.t })

const S_MEAN = mean(AREA)
const S_STD = Math.sqrt(mean(AREA.map((x) => (x - S_MEAN) ** 2)))
const z = (x: number) => (x - S_MEAN) / S_STD

// ---------- formatting ----------
const FEAT = ['revised', 'slept']
const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))
const passFail = (c: number) => (c === 1 ? 'pass' : 'fail')

// ---------- per-model text ----------
interface Spec {
  label: string
  code: string
  stepNames: [string, string, string, string]
  outputs: [string, string, string, string]
  hyper: string
  learned: string
  explain: [ReactNode, ReactNode, ReactNode, ReactNode]
}

const SPECS: Record<ModelId, Spec> = {
  linear: {
    label: 'LinearRegression',
    code: `from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X_train, y_train)
model.predict([[${NEW_AREA}]])
model.score(X_test, y_test)`,
    stepNames: ['create', 'fit', 'predict', 'score'],
    outputs: ['', 'LinearRegression()', `array([${f2(linPredict(NEW_AREA))}])   # rounded`, `${R2.toFixed(3)}   # rounded`],
    hyper: 'fit_intercept=True (the default)',
    learned: `coef_ = [${LIN.w.toFixed(4)}], intercept_ = ${f2(LIN.b)}`,
    explain: [
      <>The model exists but knows nothing yet. Hyperparameters would go inside the brackets (this model has almost none). Calling <code>predict</code> now raises <code>NotFittedError</code>.</>,
      <>
        <code>fit</code> finds the slope and intercept with the smallest mean squared error on the 6 training flats and stores them as{' '}
        <code>coef_</code> and <code>intercept_</code>. It returns the model itself.
      </>,
      <>
        <code>predict</code> uses the learned line on a new {NEW_AREA} m² flat: {LIN.w.toFixed(4)} × {NEW_AREA} + {f2(LIN.b)} = {f2(linPredict(NEW_AREA))}, about $
        {Math.round(linPredict(NEW_AREA))}k. Note the double brackets: a table with one row and one column.
      </>,
      <>
        <code>score</code> predicts the 2 test flats and compares with their real prices. For a regressor it returns <b>R²</b>: 1 is perfect, 0 is no
        better than always guessing the average price, and it can even be negative when the predictions are worse than that. Here R² ={' '}
        {R2.toFixed(3)}.
      </>,
    ],
  },
  knn: {
    label: 'KNeighborsClassifier',
    code: `from sklearn.neighbors import KNeighborsClassifier
model = KNeighborsClassifier(n_neighbors=${K})
model.fit(X_train, y_train)
model.predict([[${NEW_STUDENT[0]}, ${NEW_STUDENT[1]}]])
model.score(X_test, y_test)`,
    stepNames: ['create', 'fit', 'predict', 'score'],
    outputs: ['', `KNeighborsClassifier(n_neighbors=${K})`, `array([${KNN_NEW.pred}])`, String(KNN_ACC)],
    hyper: `n_neighbors=${K}`,
    learned: `all ${XC.length} training rows and labels; classes_ = [0, 1]`,
    explain: [
      <>
        <code>n_neighbors={K}</code> is a hyperparameter: you chose it. Nothing has been learned yet.
      </>,
      <>
        <code>fit</code> just stores the {XC.length} training students and their labels. k-NN is a "lazy" learner: the real work happens when you
        predict.
      </>,
      <>
        For a new student ({NEW_STUDENT[0]} h revised, {NEW_STUDENT[1]} h slept) the {K} nearest stored students are at distances{' '}
        {KNN_NEW.nn.map((n) => n.d.toFixed(2)).join(', ')}. Their labels: {KNN_NEW.nn.map((n) => passFail(YC[n.i])).join(', ')}. Majority vote:{' '}
        <b>{passFail(KNN_NEW.pred)}</b>, so the output is <code>array([{KNN_NEW.pred}])</code>.
      </>,
      <>
        <code>score</code> predicts the {XC_TEST.length} test students and returns <b>accuracy</b>, the fraction it got right:{' '}
        {KNN_TEST.filter((p, i) => p === YC_TEST[i]).length} of {XC_TEST.length} = {KNN_ACC}.
      </>,
    ],
  },
  tree: {
    label: 'DecisionTreeClassifier',
    code: `from sklearn.tree import DecisionTreeClassifier
model = DecisionTreeClassifier(max_depth=2)
model.fit(X_train, y_train)
model.predict([[${NEW_STUDENT[0]}, ${NEW_STUDENT[1]}]])
model.score(X_test, y_test)`,
    stepNames: ['create', 'fit', 'predict', 'score'],
    outputs: ['', 'DecisionTreeClassifier(max_depth=2)', `array([${treePredict(NEW_STUDENT)}])`, TREE_ACC.toFixed(1)],
    hyper: 'max_depth=2',
    learned: SPLITS.map((s) => `${FEAT[s.f]} ≤ ${s.t.toFixed(2)}?`).join(' then '),
    explain: [
      <>
        <code>max_depth=2</code> is a hyperparameter: the tree may ask at most 2 yes/no questions in a row.
      </>,
      <>
        <code>fit</code> searches the training data for the best yes/no questions. It learned{' '}
        {SPLITS.map((s, i) => (
          <span key={i}>
            {i > 0 && ', then '}"{FEAT[s.f]} ≤ {s.t.toFixed(2)}?"
          </span>
        ))}
        . Those thresholds are learned parameters.
      </>,
      <>
        The new student revised {NEW_STUDENT[0]} h ({NEW_STUDENT[0]} &gt; {SPLITS[0].t.toFixed(2)}, go right) and slept {NEW_STUDENT[1]} h (
        {NEW_STUDENT[1]} &gt; {SPLITS[1].t.toFixed(2)}, go right), landing in a <b>{passFail(treePredict(NEW_STUDENT))}</b> leaf:{' '}
        <code>array([{treePredict(NEW_STUDENT)}])</code>.
      </>,
      <>
        {TREE_TEST.filter((p, i) => p === YC_TEST[i]).length} of {XC_TEST.length} test students land in the right region: accuracy {TREE_ACC.toFixed(1)}.
        Different model, different score. The next lesson shows how to compare models fairly.
      </>,
    ],
  },
  scaler: {
    label: 'StandardScaler',
    code: `from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
scaler.fit(X_train)
scaler.transform(X_train)
scaler.transform(X_test)`,
    stepNames: ['create', 'fit', 'transform', 'transform test'],
    outputs: [
      '',
      'StandardScaler()',
      `array([[${f2(z(AREA[0]))}], [${f2(z(AREA[1]))}], ..., [${f2(z(AREA[5]))}]])`,
      `array([[${f2(z(AREA_TEST[0]))}], [${f2(z(AREA_TEST[1]))}]])`,
    ],
    hyper: 'with_mean=True, with_std=True (defaults)',
    learned: `mean_ = [${f2(S_MEAN)}], scale_ = [${f2(S_STD)}]`,
    explain: [
      <>A transformer, not a predictor: it rescales a feature. Nothing has been learned yet.</>,
      <>
        <code>fit(X_train)</code> learns the mean and standard deviation of floor area on the training flats: <code>mean_</code> = {f2(S_MEAN)},{' '}
        <code>scale_</code> = {f2(S_STD)}. There is no <code>y</code>: it predicts nothing.
      </>,
      <>
        <code>transform</code> rewrites each area as z = (area − {f2(S_MEAN)}) ÷ {f2(S_STD)}, the number of standard deviations from the mean. For
        example {AREA[5]} m² becomes {f2(z(AREA[5]))}.
      </>,
      <>
        Test flats are transformed with the <b>same</b> training <code>mean_</code> and <code>scale_</code>: {AREA_TEST[0]} m² becomes{' '}
        {f2(z(AREA_TEST[0]))}. Never fit the scaler on test data. <code>fit_transform(X)</code> is a shortcut for <code>fit(X)</code> then{' '}
        <code>transform(X)</code>, for training data only.
      </>,
    ],
  },
}

// ---------- pictures ----------
const PASS = 'var(--viz-pos)'
const FAIL = 'var(--viz-2)'
const NEWC = 'var(--viz-5)'
const TESTC = 'var(--viz-4)'

const studentDots = (faded: boolean): DotDatum[] =>
  XC.map(([x, y], i) => ({
    x,
    y,
    r: 5.5,
    color: faded ? `color-mix(in srgb, ${YC[i] ? PASS : FAIL} 40%, var(--surface))` : YC[i] ? PASS : FAIL,
    shape: YC[i] ? 'circle' : 'square',
  }))

function Star({ at, color = NEWC }: { at: [number, number]; color?: string }) {
  const { xs, ys } = usePlot()
  const cx = xs(at[0])
  const cy = ys(at[1])
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 4.5 : 11
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  return <polygon points={pts} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
}

/** an empty ring around a data point (does not hide the point) */
function Ring({ at, r = 11, color }: { at: [number, number]; r?: number; color: string }) {
  const { xs, ys } = usePlot()
  return <circle cx={xs(at[0])} cy={ys(at[1])} r={r} style={{ fill: 'none', stroke: color, strokeWidth: 2.5 }} />
}

/** a test point: shape and colour show its TRUE class, the thick outline marks it as a test row */
function TestMark({ at, cls, square }: { at: [number, number]; cls?: number; square?: boolean }) {
  const { xs, ys } = usePlot()
  const cx = xs(at[0])
  const cy = ys(at[1])
  const fill = cls == null ? 'var(--viz-2)' : cls ? PASS : FAIL
  const st = { fill, stroke: TESTC, strokeWidth: 3 }
  return square || cls === 0 ? <rect x={cx - 7} y={cy - 7} width={14} height={14} style={st} /> : <circle cx={cx} cy={cy} r={7.5} style={st} />
}

function Legend({ items }: { items: [ReactNode, string][] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.9rem', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--ink-2)' }}>
      {items.map(([sym, text], i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
          {sym}
          {text}
        </span>
      ))}
    </div>
  )
}
const sw = (shape: 'circle' | 'square' | 'star' | 'ring', fill: string, stroke = 'none'): ReactNode => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    {shape === 'circle' && <circle cx="7" cy="7" r="5" style={{ fill, stroke, strokeWidth: 2.2 }} />}
    {shape === 'square' && <rect x="2" y="2" width="10" height="10" style={{ fill, stroke, strokeWidth: 2.2 }} />}
    {shape === 'ring' && <circle cx="7" cy="7" r="5" style={{ fill: 'none', stroke, strokeWidth: 2.2 }} />}
    {shape === 'star' && <polygon points="7,0.5 8.6,5 13.3,5 9.5,8 11,12.8 7,10 3,12.8 4.5,8 0.7,5 5.4,5" style={{ fill }} />}
  </svg>
)

function ClassPlot({ model, step, narrow }: { model: 'knn' | 'tree'; step: number; narrow: boolean }) {
  const regions =
    model === 'tree' && step >= 1
      ? [
          { x0: 0, x1: SPLITS[0].t, y0: 2.5, y1: 9.5, cls: 0 },
          { x0: SPLITS[0].t, x1: 10, y0: 2.5, y1: SPLITS[1].t, cls: 0 },
          { x0: SPLITS[0].t, x1: 10, y0: SPLITS[1].t, y1: 9.5, cls: 1 },
        ]
      : []
  const newRegion = model === 'tree' && step === 2 ? regions.find((r) => NEW_STUDENT[0] > r.x0 && NEW_STUDENT[0] <= r.x1 && NEW_STUDENT[1] > r.y0 && NEW_STUDENT[1] <= r.y1) : undefined
  const preds = model === 'knn' ? KNN_TEST : TREE_TEST
  return (
    <>
      <Plot
        x={[0, 10]}
        y={[2.5, 9.5]}
        width={narrow ? 340 : 400}
        height={narrow ? 280 : 300}
        maxWidth={460}
        ariaLabel={`Training students plotted by hours revised and hours slept, pass or fail. ${model === 'tree' ? 'Decision tree regions' : 'k-NN'} at step ${step + 1}.`}
      >
        <Grid xTicks={10} yTicks={7} />
        {regions.map((r, i) => (
          <Rect key={i} x0={r.x0} x1={r.x1} y0={r.y0} y1={r.y1} fill={`color-mix(in srgb, ${r.cls ? PASS : FAIL} ${newRegion === r ? 30 : 14}%, var(--surface))`} />
        ))}
        {model === 'tree' && step >= 1 && (
          <>
            <Path points={[[SPLITS[0].t, 2.5], [SPLITS[0].t, 9.5]]} color="var(--viz-ink)" width={2} dash="6 4" />
            <Path points={[[SPLITS[0].t, SPLITS[1].t], [10, SPLITS[1].t]]} color="var(--viz-ink)" width={2} dash="6 4" />
            <Label x={SPLITS[0].t} y={9.5} dx={5} dy={14} size={12}>{`revised ≤ ${SPLITS[0].t.toFixed(1)}`}</Label>
            <Label x={10} y={SPLITS[1].t} dx={-4} dy={16} anchor="end" size={12}>{`slept ≤ ${SPLITS[1].t.toFixed(2)}`}</Label>
          </>
        )}
        <Axes xLabel="hours revised" yLabel="hours slept" xTicks={narrow ? 5 : 10} yTicks={7} />
        {model === 'knn' && step === 2 && KNN_NEW.nn.map((n) => <Path key={n.i} points={[NEW_STUDENT, XC[n.i]]} color={NEWC} width={2} dash="4 3" />)}
        <Dots points={studentDots(step === 3)} />
        {model === 'knn' && step === 1 && XC.map((p, i) => <Ring key={i} at={p} r={9.5} color="var(--accent)" />)}
        {model === 'knn' && step === 2 && KNN_NEW.nn.map((n) => <Ring key={n.i} at={XC[n.i]} color={NEWC} />)}
        {step === 3 &&
          XC_TEST.map((q, i) => {
            const ok = preds[i] === YC_TEST[i]
            const right = q[0] < 6
            return (
              <g key={i}>
                <TestMark at={q} cls={YC_TEST[i]} />
                <Label x={q[0]} y={q[1]} dx={right ? 11 : -11} dy={-8} anchor={right ? 'start' : 'end'} size={12} color={ok ? 'var(--viz-pos)' : 'var(--viz-neg)'} weight={700}>
                  {ok ? '✓' : `✗ predicted ${passFail(preds[i])}`}
                </Label>
              </g>
            )
          })}
        {step === 2 && (
          <>
            <Star at={NEW_STUDENT} />
            <Label x={NEW_STUDENT[0]} y={NEW_STUDENT[1]} dx={model === 'knn' ? -14 : 0} dy={model === 'knn' ? 4 : 26} anchor={model === 'knn' ? 'end' : 'middle'} color={NEWC} weight={700}>
              {`new: ${passFail(model === 'knn' ? KNN_NEW.pred : treePredict(NEW_STUDENT))}`}
            </Label>
          </>
        )}
      </Plot>
      <Legend
        items={[
          [sw('circle', PASS), 'pass'],
          [sw('square', FAIL), 'fail'],
          ...(step === 2 ? [[sw('star', NEWC), 'new student'] as [ReactNode, string]] : []),
          ...(step === 3 ? [[sw('ring', 'none', TESTC), 'test student (true label)'] as [ReactNode, string]] : []),
        ]}
      />
    </>
  )
}

function LinearPlot({ step, narrow }: { step: number; narrow: boolean }) {
  const yNew = linPredict(NEW_AREA)
  return (
    <>
      <Plot
        x={[55, 135]}
        y={[380, 720]}
        width={narrow ? 340 : 400}
        height={narrow ? 280 : 300}
        maxWidth={460}
        margin={{ left: 46 }}
        ariaLabel={`HDB flats, floor area against price, with the fitted line at step ${step + 1}`}
      >
        <Grid xTicks={8} yTicks={6} />
        <Axes xLabel="floor area (m²)" yLabel="price ($k)" xTicks={narrow ? 4 : 8} yTicks={6} />
        {step >= 1 && <Path points={[[55, linPredict(55)], [135, linPredict(135)]]} color="var(--viz-3)" width={3} />}
        <Dots points={AREA.map((x, i) => ({ x, y: PRICE[i], r: 6, color: step === 3 ? 'color-mix(in srgb, var(--viz-1) 40%, var(--surface))' : 'var(--viz-1)' }))} />
        {step === 2 && (
          <>
            <Path points={[[NEW_AREA, 380], [NEW_AREA, yNew]]} color={NEWC} width={1.8} dash="5 4" />
            <Path points={[[55, yNew], [NEW_AREA, yNew]]} color={NEWC} width={1.8} dash="5 4" />
            <Star at={[NEW_AREA, yNew]} />
            <Label x={NEW_AREA} y={yNew} dx={-12} dy={-12} anchor="end" color={NEWC} weight={700}>
              {`${NEW_AREA} m² → $${yNew.toFixed(0)}k`}
            </Label>
          </>
        )}
        {step === 3 &&
          AREA_TEST.map((x, i) => (
            <g key={i}>
              <Path points={[[x, PRICE_TEST[i]], [x, linPredict(x)]]} color="var(--viz-2)" width={2.5} />
              <TestMark at={[x, PRICE_TEST[i]]} square />
              <Label x={x} y={PRICE_TEST[i]} dx={i ? -12 : 12} dy={i ? -10 : 16} anchor={i ? 'end' : 'start'} size={12} color="var(--viz-2)" weight={700}>
                {`real ${PRICE_TEST[i]}, predicted ${linPredict(x).toFixed(0)}`}
              </Label>
            </g>
          ))}
      </Plot>
      <Legend
        items={[
          [sw('circle', 'var(--viz-1)'), 'training flat'],
          ...(step === 2 ? [[sw('star', NEWC), 'new flat'] as [ReactNode, string]] : []),
          ...(step === 3 ? [[sw('square', 'var(--viz-2)', TESTC), 'test flat'] as [ReactNode, string]] : []),
        ]}
      />
    </>
  )
}

function ScalerPlot({ step, narrow }: { step: number; narrow: boolean }) {
  return (
    <>
      <Plot
        x={[50, 140]}
        y={[0, 4]}
        width={narrow ? 340 : 640}
        height={narrow ? 260 : 250}
        maxWidth={760}
        margin={{ left: 16, right: 16, bottom: 6, top: 6 }}
        ariaLabel={`Floor areas on the original ruler and, after transform, on the z ruler. Step ${step + 1}.`}
      >
        <ScalerRulers step={step} narrow={narrow} />
      </Plot>
      <Legend items={[[sw('circle', 'var(--viz-1)'), 'training flat'], ...(step === 3 ? [[sw('square', 'var(--viz-2)', TESTC), 'test flat'] as [ReactNode, string]] : [])]} />
    </>
  )
}

function ScalerRulers({ step, narrow }: { step: number; narrow: boolean }) {
  const { xs, ys } = usePlot()
  const TOP = 2.55
  const BOT = 0.85
  const line: CSSProperties = { stroke: 'var(--viz-axis)', strokeWidth: 1.5 }
  const title: CSSProperties = { fill: 'var(--ink-2)', fontSize: 13, fontWeight: 700 }
  const tick = (x: number, y: number, label: string, key: string) => (
    <g key={key}>
      <line x1={xs(x)} x2={xs(x)} y1={ys(y) - 5} y2={ys(y) + 5} style={line} />
      <text x={xs(x)} y={ys(y) + 19} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12 }}>
        {label}
      </text>
    </g>
  )
  const areaTicks = narrow ? [60, 80, 100, 120] : [60, 70, 80, 90, 100, 110, 120, 130]
  return (
    <g>
      <text x={xs(52)} y={ys(3.75)} className="plot-label" style={title}>
        floor area (m²)
      </text>
      <line x1={xs(53)} x2={xs(137)} y1={ys(TOP)} y2={ys(TOP)} style={line} />
      {areaTicks.map((a) => tick(a, TOP, String(a), `a${a}`))}
      {step >= 1 && (
        <g>
          <line x1={xs(S_MEAN)} x2={xs(S_MEAN)} y1={ys(3.1)} y2={ys(step >= 2 ? BOT : TOP)} style={{ stroke: 'var(--viz-5)', strokeWidth: 2, strokeDasharray: '5 4' }} />
          <line x1={xs(S_MEAN - S_STD)} x2={xs(S_MEAN + S_STD)} y1={ys(3.1)} y2={ys(3.1)} style={{ stroke: 'var(--viz-5)', strokeWidth: 2.5 }} />
          {[S_MEAN - S_STD, S_MEAN + S_STD].map((x, i) => (
            <line key={i} x1={xs(x)} x2={xs(x)} y1={ys(3.1) - 6} y2={ys(3.1) + 6} style={{ stroke: 'var(--viz-5)', strokeWidth: 2.5 }} />
          ))}
          <text x={xs(S_MEAN + S_STD) + 8} y={ys(3.1) + 4} className="plot-label" style={{ fill: 'var(--viz-5)', fontSize: 12 }}>
            {narrow ? `±${f2(S_STD)}` : `mean_ ${f2(S_MEAN)} ± scale_ ${f2(S_STD)}`}
          </text>
        </g>
      )}
      {step >= 2 && (
        <g>
          {AREA.map((a, i) => (
            <line key={i} x1={xs(a)} x2={xs(a)} y1={ys(TOP)} y2={ys(BOT)} style={{ stroke: 'var(--viz-1)', strokeWidth: 1, strokeDasharray: '2 3', opacity: 0.6 }} />
          ))}
          <text x={xs(52)} y={ys(1.6)} className="plot-label" style={title}>
            {narrow ? 'z (standardised)' : 'z = (area − mean_) ÷ scale_'}
          </text>
          <line x1={xs(53)} x2={xs(137)} y1={ys(BOT)} y2={ys(BOT)} style={line} />
          {[-2, -1, 0, 1, 2].map((k) => tick(S_MEAN + k * S_STD, BOT, k > 0 ? `+${k}` : String(k).replace('-', '−'), `z${k}`))}
        </g>
      )}
      {step >= 3 &&
        AREA_TEST.map((a, i) => (
          <g key={i}>
            <line x1={xs(a)} x2={xs(a)} y1={ys(TOP)} y2={ys(BOT)} style={{ stroke: 'var(--viz-2)', strokeWidth: 1.8, strokeDasharray: '4 3' }} />
            <text x={xs(a)} y={ys(BOT) - 12} textAnchor="middle" className="plot-label" style={{ fill: 'var(--viz-2)', fontSize: 12 }}>
              {f2(z(a)).replace('-', '−')}
            </text>
          </g>
        ))}
      {AREA.map((a, i) => (
        <circle key={`t${i}`} cx={xs(a)} cy={ys(TOP)} r={6} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 1.5 }} />
      ))}
      {step >= 2 &&
        AREA.map((a, i) => <circle key={`b${i}`} cx={xs(a)} cy={ys(BOT)} r={6} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 1.5 }} />)}
      {step >= 3 &&
        AREA_TEST.map((a, i) => (
          <g key={`s${i}`}>
            <TestMark at={[a, TOP]} square />
            <TestMark at={[a, BOT]} square />
          </g>
        ))}
    </g>
  )
}

// ---------- the figure ----------
const card: CSSProperties = {
  border: '1px solid var(--rule)',
  borderRadius: 'var(--radius-m)',
  background: 'var(--surface-2)',
  padding: '0.6rem 0.75rem',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  display: 'grid',
  gap: '0.35rem',
  alignContent: 'start',
}
const keyStyle: CSSProperties = { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-3)' }

export default function SklearnRecipe() {
  const [model, setModel] = useState<ModelId>('linear')
  const player = usePlayer({ steps: 4, interval: 2200 })
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const spec = SPECS[model]
  const step = player.step
  const isScaler = model === 'scaler'
  const obj = isScaler ? 'scaler' : 'model'
  const highlight = step === 0 ? [1, 2] : [step + 2]
  const oneCol = narrow || isScaler

  return (
    <Figure
      title="One recipe, many models"
      caption={
        <>
          Press <b>Next</b> to run the code one line at a time, then switch model and step through again. The highlighted line, what it returns,
          what is stored inside <code>{obj}</code> and the picture all update. Only the import and the brackets change between models; the four steps
          never do. A <code>StandardScaler</code> follows the same pattern with <code>transform</code> in place of <code>predict</code>.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.75rem' }}>
        <Segmented
          label="Model"
          value={model}
          onChange={(m) => {
            setModel(m)
            player.reset()
          }}
          options={[
            { value: 'linear', label: narrow ? 'Linear' : 'LinearRegression' },
            { value: 'knn', label: narrow ? 'k-NN' : 'KNeighbors' },
            { value: 'tree', label: narrow ? 'Tree' : 'DecisionTree' },
            { value: 'scaler', label: narrow ? 'Scaler' : 'StandardScaler' },
          ]}
        />
        <div style={{ marginTop: '-0.5rem' }}>
          <CodeBlock code={spec.code} language="python" title={`step ${step + 1}: ${spec.stepNames[step]}`} highlight={highlight} showLineNumbers />
          <div
            style={{
              marginTop: '-0.9rem',
              border: '1px solid var(--rule)',
              borderTop: 'none',
              borderRadius: '0 0 var(--radius-m) var(--radius-m)',
              background: 'var(--surface-3)',
              padding: '0.35rem 0.85rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              color: 'var(--ink-2)',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}
            aria-live="polite"
          >
            {step === 0 ? '(no output: the object is just created)' : `returns  ${spec.outputs[step]}`}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: oneCol ? 'minmax(0, 1fr)' : 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '0.75rem', alignItems: 'start' }}>
          <div style={{ display: 'grid', justifyItems: 'center', gap: '0.3rem' }}>
            {model === 'linear' && <LinearPlot step={step} narrow={narrow} />}
            {(model === 'knn' || model === 'tree') && <ClassPlot model={model} step={step} narrow={narrow} />}
            {model === 'scaler' && <ScalerPlot step={step} narrow={narrow} />}
          </div>
          <div style={card}>
            <div style={keyStyle}>Inside {obj}</div>
            <div>
              <b>Status:</b>{' '}
              <span style={{ color: step === 0 ? 'var(--viz-neg)' : 'var(--viz-pos)', fontWeight: 700 }}>{step === 0 ? 'not fitted' : 'fitted'}</span>
            </div>
            <div>
              <b>Hyperparameters</b> (set when created): <code>{spec.hyper}</code>
            </div>
            <div>
              <b>Learned by fit</b>: {step === 0 ? <span style={{ color: 'var(--ink-3)' }}>nothing yet</span> : <code>{spec.learned}</code>}
            </div>
            <div style={{ borderTop: '1px dashed var(--rule)', paddingTop: '0.4rem', color: 'var(--ink)' }}>{spec.explain[step]}</div>
          </div>
        </div>
        <PlayerControls player={player} label={(s) => `Step ${s + 1} of 4: ${spec.stepNames[s]}`} />
      </div>
    </Figure>
  )
}
