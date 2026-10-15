import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, Plot, Grid, Axes, Path, Dots, HLine, VLine, Label, usePlot, mulberry32, useBump } from '../../../../../kit'
import { gauss, shuffleInPlace } from './sim'
import s from './cv.module.css'

/*
  Feature selection outside versus inside cross-validation, on PURE NOISE.
  40 rows (20 of each label), p columns of random numbers that have nothing to do with the label.
  Both workflows keep the 10 columns whose class means differ most and use a nearest-centroid
  classifier, scored with stratified 5-fold cross-validation.
    A (leaky):  pick the 10 columns using all 40 rows, then cross-validate
    B (honest): inside each fold, pick the 10 columns using only that fold's 32 training rows
  The honest answer is 0.5 (a coin flip). The curves are the average over 1,000 noise datasets per p,
  precomputed offline with exactly this procedure (a NumPy port of runOnce, seed 2026) so the page
  does not spend seconds simulating; the hollow dots are the single dataset generated live below.
*/

const N = 40
const K_SEL = 10
const FOLDS = 5
const P_LIST = [10, 20, 50, 100, 200, 500, 1000, 2000]
/** mean reported accuracy over 1,000 noise datasets for each entry of P_LIST (A: leaky, B: honest) */
const CURVE: { p: number; leaky: number; honest: number }[] = [
  { p: 10, leaky: 0.501, honest: 0.501 },
  { p: 20, leaky: 0.615, honest: 0.5 },
  { p: 50, leaky: 0.726, honest: 0.503 },
  { p: 100, leaky: 0.784, honest: 0.497 },
  { p: 200, leaky: 0.831, honest: 0.505 },
  { p: 500, leaky: 0.872, honest: 0.501 },
  { p: 1000, leaky: 0.9, honest: 0.503 },
  { p: 2000, leaky: 0.916, honest: 0.505 },
]

/** indices of the k columns whose class means differ most, using only `rows` */
function selectTop(X: Float64Array, p: number, y: number[], rows: number[], k: number): number[] {
  const s1 = new Float64Array(p)
  const s0 = new Float64Array(p)
  let n1 = 0
  let n0 = 0
  for (const r of rows) {
    const off = r * p
    if (y[r] === 1) {
      n1++
      for (let j = 0; j < p; j++) s1[j] += X[off + j]
    } else {
      n0++
      for (let j = 0; j < p; j++) s0[j] += X[off + j]
    }
  }
  // keep a small sorted list of the k biggest gaps (much faster than sorting all p columns)
  const kk = Math.min(k, p)
  const topIdx: number[] = []
  const topGap: number[] = []
  for (let j = 0; j < p; j++) {
    const g = Math.abs(s1[j] / n1 - s0[j] / n0)
    if (topIdx.length === kk && g <= topGap[kk - 1]) continue
    let pos = topGap.length
    while (pos > 0 && topGap[pos - 1] < g) pos--
    topGap.splice(pos, 0, g)
    topIdx.splice(pos, 0, j)
    if (topIdx.length > kk) {
      topGap.pop()
      topIdx.pop()
    }
  }
  return topIdx
}

/** nearest-centroid accuracy on `test`, centroids from `train`, using columns `cols` */
function centroidAcc(X: Float64Array, p: number, y: number[], train: number[], test: number[], cols: number[]): number {
  const c1 = new Float64Array(cols.length)
  const c0 = new Float64Array(cols.length)
  let n1 = 0
  let n0 = 0
  for (const r of train) {
    const off = r * p
    const c = y[r] === 1 ? c1 : c0
    if (y[r] === 1) n1++
    else n0++
    cols.forEach((j, q) => (c[q] += X[off + j]))
  }
  for (let q = 0; q < cols.length; q++) {
    c1[q] /= n1
    c0[q] /= n0
  }
  let ok = 0
  for (const r of test) {
    const off = r * p
    let d1 = 0
    let d0 = 0
    cols.forEach((j, q) => {
      d1 += (X[off + j] - c1[q]) ** 2
      d0 += (X[off + j] - c0[q]) ** 2
    })
    if ((d1 < d0 ? 1 : 0) === y[r]) ok++
  }
  return ok / test.length
}

/** one noise dataset: returns the two 5-fold CV accuracies */
function runOnce(p: number, rng: () => number): { leaky: number; honest: number } {
  const y = shuffleInPlace(
    Array.from({ length: N }, (_, i) => (i < N / 2 ? 0 : 1)),
    rng,
  )
  const X = new Float64Array(N * p)
  for (let i = 0; i < X.length; i++) X[i] = gauss(rng)
  // stratified folds: deal each class round-robin
  const fold = new Array<number>(N)
  for (const c of [0, 1]) {
    const idx = shuffleInPlace(
      y.map((v, i) => (v === c ? i : -1)).filter((i) => i >= 0),
      rng,
    )
    idx.forEach((r, j) => (fold[r] = j % FOLDS))
  }
  const all = Array.from({ length: N }, (_, i) => i)
  const leakyCols = selectTop(X, p, y, all, K_SEL)
  let leaky = 0
  let honest = 0
  for (let f = 0; f < FOLDS; f++) {
    const tr = all.filter((i) => fold[i] !== f)
    const te = all.filter((i) => fold[i] === f)
    leaky += centroidAcc(X, p, y, tr, te, leakyCols)
    honest += centroidAcc(X, p, y, tr, te, selectTop(X, p, y, tr, K_SEL))
  }
  return { leaky: leaky / FOLDS, honest: honest / FOLDS }
}

const lg = Math.log10

function LogTicks() {
  const { xs, ys } = usePlot()
  const yb = ys.range()[0]
  return (
    <g className="plot-axes">
      {P_LIST.map((p) => (
        <g key={p} transform={`translate(${xs(lg(p))},${yb})`}>
          <line y2={5} />
          <text y={17} textAnchor="middle">
            {p >= 1000 ? `${p / 1000}k` : p}
          </text>
        </g>
      ))}
    </g>
  )
}

export default function CVLeakageCompare() {
  const [pi, setPi] = useState(5)
  const [seed, bump] = useBump()
  const p = P_LIST[pi]

  const curve = CURVE

  const one = useMemo(() => runOnce(p, mulberry32(777 + seed * 31 + p)), [p, seed])

  const leakyColor = 'var(--viz-neg)'
  const honestColor = 'var(--viz-pos)'

  return (
    <Figure
      title="Selecting features before cross-validation finds patterns in pure noise"
      caption={
        <>
          The data are 40 rows of <b>random numbers</b> with random labels, so no model can truly beat a coin flip (0.5). Both workflows keep the 10
          columns that best separate the labels and use the same simple classifier. Slide the number of columns: workflow A (selection on all rows,
          then CV) reports better and better accuracy as the number of columns grows, because with more columns there are more that match the labels
          by luck, <i>including the validation rows' labels</i>. Workflow B never lets the validation fold vote on which columns to keep, so it stays at
          chance. The lines average 1,000 noise datasets; the hollow rings are the one dataset shown in the boxes above. Press <b>New noise</b> a few times to see how much a single dataset wobbles around its line.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.panels}>
          <div className={s.panel}>
            <p className={s.panelTitle}>
              <span className={s.badge} style={{ color: leakyColor }}>
                A: select, then cross-validate
              </span>
            </p>
            <div className={s.flow}>
              <span className={`${s.step} ${s.stepBad}`}>pick 10 best of {p} columns using all 40 rows</span>
              <span className={s.arrow}>→</span>
              <span className={s.step}>5-fold CV</span>
            </div>
            <div className={s.stats}>
              <span className={s.stat}>
                <span className={s.statNum} style={{ color: leakyColor }}>
                  {one.leaky.toFixed(2)}
                </span>
                <span>reported accuracy</span>
              </span>
            </div>
          </div>
          <div className={s.panel}>
            <p className={s.panelTitle}>
              <span className={s.badge} style={{ color: honestColor }}>
                B: select inside each fold
              </span>
            </p>
            <div className={s.flow}>
              <span className={s.step}>5-fold CV</span>
              <span className={s.arrow}>→</span>
              <span className={`${s.step} ${s.stepGood}`}>each round: pick 10 best using only the 32 training rows</span>
            </div>
            <div className={s.stats}>
              <span className={s.stat}>
                <span className={s.statNum} style={{ color: honestColor }}>
                  {one.honest.toFixed(2)}
                </span>
                <span>reported accuracy</span>
              </span>
            </div>
          </div>
        </div>

        <Plot
          x={[lg(8), lg(2600)]}
          y={[0.25, 1]}
          width={520}
          height={260}
          minHeight={220}
          margin={{ left: 44, right: 18, top: 14, bottom: 40 }}
          ariaLabel={`Reported cross-validation accuracy on pure noise against the number of columns. At ${p} columns, workflow A reports ${curve[pi].leaky.toFixed(2)} on average and workflow B ${curve[pi].honest.toFixed(2)}.`}
        >
          <Grid xTicks={0} yTicks={7} />
          <Axes xLabel="number of noise columns (log scale)" yLabel="reported CV accuracy" hideXTicks yTicks={7} />
          <LogTicks />
          <HLine y={0.5} color="var(--viz-muted)" />
          <Label x={lg(10)} y={0.5} dx={2} dy={18} color="var(--ink-3)">
            coin flip = 0.5
          </Label>
          <VLine x={lg(p)} color="var(--viz-axis)" dash="3 4" />
          <Path points={curve.map((c) => [lg(c.p), c.leaky])} color={leakyColor} width={3} />
          <Path points={curve.map((c) => [lg(c.p), c.honest])} color={honestColor} width={3} />
          <Dots points={curve.map((c) => ({ x: lg(c.p), y: c.leaky, r: 3.5, color: leakyColor }))} />
          <Dots points={curve.map((c) => ({ x: lg(c.p), y: c.honest, r: 3.5, color: honestColor }))} />
          <Dots
            points={[
              { x: lg(p), y: one.leaky, r: 7, color: leakyColor, hollow: true },
              { x: lg(p), y: one.honest, r: 7, color: honestColor, hollow: true },
            ]}
          />
          <Label x={lg(P_LIST[P_LIST.length - 1])} y={curve[curve.length - 1].leaky} dx={-6} dy={-12} anchor="end" color={leakyColor}>
            A: leaky
          </Label>
          <Label x={lg(P_LIST[P_LIST.length - 1])} y={curve[curve.length - 1].honest} dx={-6} dy={22} anchor="end" color={honestColor}>
            B: honest
          </Label>
        </Plot>
        <div className={s.legend}>
          <span>
            <span className={s.swatchLine} style={{ borderColor: leakyColor }} /> average of 1,000 noise datasets
          </span>
          <span>
            <span className={s.dot} style={{ background: 'var(--surface)', borderColor: 'var(--ink-3)' }} /> this dataset
          </span>
        </div>

        <Controls>
          <Slider label="noise columns" value={pi} min={0} max={P_LIST.length - 1} step={1} onChange={setPi} format={(v) => P_LIST[v].toLocaleString('en-GB')} />
          <Button onClick={bump}>New noise</Button>
        </Controls>
      </div>
    </Figure>
  )
}
