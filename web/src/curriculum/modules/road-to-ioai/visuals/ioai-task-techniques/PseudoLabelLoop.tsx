import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, Path, Dots, usePlayer, PlayerControls, usePlot, mulberry32, M, type DotDatum } from '../../../../../kit'
import styles from './techniques.module.css'

/*
  Self-training with a confidence threshold τ.
  Data: two Gaussian blobs (class A left, class B right). Only 4 points are labelled; 200 are not.
  Model: logistic regression p = σ(w·x + b), trained by full-batch gradient descent on the mean
  log-loss + (λ/2)‖w‖². Each round: predict every still-unlabelled point; those with
  max(p, 1 − p) ≥ τ get the predicted class as a permanent pseudo-label; retrain on labelled +
  pseudo-labelled points. Test accuracy is measured on 1,000 fresh points from the same blobs.
*/

interface Pt {
  x: number
  y: number
  c: 0 | 1
}
interface Model {
  w0: number
  w1: number
  b: number
}
interface RoundState {
  model: Model
  labels: Map<number, 0 | 1> // pseudo-labels so far: index into UNL → predicted class
  added: number
  newThisRound: number
  wrong: number
  acc: number
}

const LAMBDA = 0.1
const ITERS = 400
const LR = 0.5
const MAX_ROUNDS = 8

function gauss(r: () => number) {
  const u = Math.max(1e-12, r())
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function blobs(seed: number, n: number): Pt[] {
  const r = mulberry32(seed)
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const c = (i % 2) as 0 | 1
    const cx = c ? 1.5 : -1.5
    const x = cx + gauss(r) * 0.75
    const y = gauss(r) * 1.0
    pts.push({ x, y, c })
  }
  return pts
}

const UNL = blobs(7, 200)
const TEST = blobs(123, 1000)
const LAB: Pt[] = [
  { x: -0.6, y: 1.4, c: 0 },
  { x: -2.0, y: 0.9, c: 0 },
  { x: 2.0, y: -0.9, c: 1 },
  { x: 0.6, y: -1.4, c: 1 },
]

const sigmoid = (z: number) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))))
const prob = (m: Model, x: number, y: number) => sigmoid(m.w0 * x + m.w1 * y + m.b)

function train(X: [number, number][], Y: number[]): Model {
  let w0 = 0
  let w1 = 0
  let b = 0
  const n = X.length
  for (let it = 0; it < ITERS; it++) {
    let g0 = 0
    let g1 = 0
    let gb = 0
    for (let i = 0; i < n; i++) {
      const [x, y] = X[i]
      const z = w0 * x + w1 * y + b
      const p = z > -30 ? 1 / (1 + Math.exp(-z)) : 0
      const e = p - Y[i]
      g0 += e * x
      g1 += e * y
      gb += e
    }
    g0 = g0 / n + LAMBDA * w0
    g1 = g1 / n + LAMBDA * w1
    gb /= n
    w0 -= LR * g0
    w1 -= LR * g1
    b -= LR * gb
  }
  return { w0, w1, b }
}

const accuracy = (m: Model) => TEST.reduce((s, p) => s + ((prob(m, p.x, p.y) >= 0.5 ? 1 : 0) === p.c ? 1 : 0), 0) / TEST.length

function selfTrain(tau: number): RoundState[] {
  const X: [number, number][] = LAB.map((p) => [p.x, p.y])
  const Y: number[] = LAB.map((p) => p.c)
  let model = train(X, Y)
  const labels = new Map<number, 0 | 1>()
  let wrong = 0
  const hist: RoundState[] = [{ model, labels: new Map(labels), added: 0, newThisRound: 0, wrong: 0, acc: accuracy(model) }]
  for (let r = 0; r < MAX_ROUNDS; r++) {
    const fresh: number[] = []
    UNL.forEach((p, i) => {
      if (labels.has(i)) return
      const q = prob(model, p.x, p.y)
      if (Math.max(q, 1 - q) >= tau) fresh.push(i)
    })
    if (!fresh.length) break
    for (const i of fresh) {
      const p = UNL[i]
      const t: 0 | 1 = prob(model, p.x, p.y) >= 0.5 ? 1 : 0
      labels.set(i, t)
      X.push([p.x, p.y])
      Y.push(t)
      if (t !== p.c) wrong++
    }
    model = train(X, Y)
    hist.push({ model, labels: new Map(labels), added: labels.size, newThisRound: fresh.length, wrong, acc: accuracy(model) })
  }
  return hist
}

const X_DOM: [number, number] = [-4.5, 4.5]
const Y_DOM: [number, number] = [-3.5, 3.5]

/** Two end points of the line w0·x + w1·y + b = k across the plot box. */
function line(m: Model, k: number): [number, number][] {
  if (Math.abs(m.w1) > Math.abs(m.w0)) return X_DOM.map((x) => [x, (k - m.b - m.w0 * x) / m.w1] as [number, number])
  return Y_DOM.map((y) => [(k - m.b - m.w1 * y) / m.w0, y] as [number, number])
}

const COMPARE = [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99]
const pct = (v: number) => `${(v * 100).toFixed(1)}%`

interface Final {
  t: number
  acc: number
  wrong: number
}

/** One row per threshold: its label on the left, a dot at its final test accuracy and the change from the labelled-only model on the right. */
function ThresholdRows({ rows, base, current }: { rows: Final[]; base: number; current: number }) {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const [yb, yt] = ys.range()
  return (
    <g>
      <line x1={xs(base)} x2={xs(base)} y1={yb} y2={yt - 4} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5, strokeDasharray: '4 3' }} />
      <text x={xs(base)} y={yt - 8} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--ink-2)' }}>
        4 labels only, {pct(base)}
      </text>
      {rows.map((r, i) => {
        const y = ys(rows.length - 1 - i)
        const on = Math.abs(r.t - current) < 0.005
        const d = (r.acc - base) * 100
        return (
          <g key={r.t}>
            <line x1={x0} x2={x1} y1={y} y2={y} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
            <line x1={xs(base)} x2={xs(r.acc)} y1={y} y2={y} style={{ stroke: on ? 'var(--viz-1)' : 'var(--viz-muted)', strokeWidth: 2 }} />
            <text x={x0 - 8} y={y} dy="0.32em" textAnchor="end" style={{ fontSize: 12, fontWeight: on ? 800 : 500, fill: on ? 'var(--ink)' : 'var(--ink-2)' }}>
              {`τ = ${r.t}${r.wrong ? ` (${r.wrong} wrong)` : ''}`}
            </text>
            <circle cx={xs(r.acc)} cy={y} r={on ? 6 : 4.5} style={{ fill: on ? 'var(--viz-1)' : 'var(--viz-muted)', stroke: 'var(--surface)', strokeWidth: 1.5 }} />
            <text x={x1 + 6} y={y} dy="0.32em" style={{ fontSize: 11.5, fontWeight: on ? 800 : 600, fill: on ? 'var(--ink)' : 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
              {`${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(1)}`}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default function PseudoLabelLoop() {
  const [tau, setTau] = useState(0.9)
  const hist = useMemo(() => selfTrain(tau), [tau])
  const player = usePlayer({ steps: hist.length, interval: 1100 })
  const r = Math.min(player.step, hist.length - 1)
  const st = hist[r]
  const base = hist[0].acc

  const finals = useMemo<Final[]>(
    () =>
      COMPARE.map((t) => {
        const h = selfTrain(t)
        const last = h[h.length - 1]
        return { t, acc: last.acc, wrong: last.wrong }
      }),
    [],
  )
  const accs = [base, ...finals.map((f) => f.acc)]
  const lo = Math.floor(Math.min(...accs) * 100 - 1) / 100
  const hi = Math.min(1, Math.ceil(Math.max(...accs) * 100 + 1) / 100)
  const nTicks = Math.max(2, Math.min(5, Math.round((hi - lo) * 100)))

  const k = Math.log(tau / (1 - tau)) // the band edge in logit units: |w·x + b| < k stays unlabelled
  const upper = line(st.model, k)
  const lower = line(st.model, -k)
  const band: [number, number][] = [upper[0], upper[1], lower[1], lower[0]]

  const colour = (c: 0 | 1) => (c ? 'var(--viz-2)' : 'var(--viz-1)')
  const pool: DotDatum[] = []
  const pseudo: DotDatum[] = []
  const errs: DotDatum[] = []
  UNL.forEach((p, i) => {
    const t = st.labels.get(i)
    if (t === undefined) pool.push({ x: p.x, y: p.y, r: 3.2, hollow: true, color: 'var(--viz-muted)' })
    else {
      pseudo.push({ x: p.x, y: p.y, r: 3.8, color: colour(t) })
      if (t !== p.c) errs.push({ x: p.x, y: p.y, r: 7, hollow: true, color: 'var(--viz-neg)' })
    }
  })
  const labelled: DotDatum[] = LAB.map((p) => ({ x: p.x, y: p.y, r: 7.5, shape: 'square', color: colour(p.c) }))

  return (
    <Figure
      title="Self-training: trust only the confident guesses"
      caption={
        <>
          Press Play: grey points outside the shaded band get the model's guess as a label, and the model retrains. Then try τ near 0.5 and near 0.99, and compare the thresholds in the
          chart below.
        </>
      }
    >
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: 'var(--viz-1)', borderRadius: 2 }} /> labelled A
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: 'var(--viz-2)', borderRadius: 2 }} /> labelled B
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ border: '2px solid var(--viz-muted)' }} /> unlabelled
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ background: 'var(--viz-1)', width: 8, height: 8 }} />
          <span className={styles.swatch} style={{ background: 'var(--viz-2)', width: 8, height: 8 }} /> pseudo-labelled
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatch} style={{ border: '2px solid var(--viz-neg)' }} /> wrong pseudo-label
        </span>
      </div>
      <Plot x={X_DOM} y={Y_DOM} width={480} height={373} minHeight={300} ariaLabel={`Round ${r}: decision boundary, confidence band and ${st.added} pseudo-labelled points`}>
        <Grid xTicks={9} yTicks={7} />
        <Axes xTicks={9} yTicks={7} hideXTicks hideYTicks />
        {tau > 0.5 && <Path points={band} closed fill="var(--viz-fill)" color="none" width={0} />}
        {tau > 0.5 && (
          <>
            <Path points={upper} color="var(--viz-muted)" width={1.5} dash="5 4" />
            <Path points={lower} color="var(--viz-muted)" width={1.5} dash="5 4" />
          </>
        )}
        <Path points={line(st.model, 0)} color="var(--viz-ink)" width={2.5} />
        <Dots points={pool} />
        <Dots points={pseudo} />
        <Dots points={errs} />
        <Dots points={labelled} stroke="var(--viz-ink)" />
      </Plot>
      <PlayerControls
        player={player}
        label={(s) => {
          const i = Math.min(s, hist.length - 1)
          return i === 0 ? `Round 0 of ${hist.length - 1}: labelled points only` : `Round ${i} of ${hist.length - 1}: +${hist[i].newThisRound} pseudo-labels`
        }}
      />
      <Controls>
        <Slider label={<>confidence threshold <M>{'\\tau'}</M></>} value={tau} min={0.5} max={0.99} step={0.01} onChange={(v) => { setTau(v); player.reset() }} format={(v) => v.toFixed(2)} />
        <Readout
          items={[
            ['pseudo-labels', `${st.added} of ${UNL.length}`],
            ['of which wrong', `${st.wrong}`],
            ['test accuracy', pct(st.acc)],
            ['4 labels only', pct(base)],
          ]}
        />
      </Controls>
      <div className={styles.compare}>
        <div className={styles.compareHead}>
          Test accuracy after self-training stops, for each threshold. The dashed line is the model trained on the 4 labels only; the numbers on the right are the gain over it, in points.
        </div>
        <Plot
          x={[lo, hi]}
          y={[-0.6, COMPARE.length - 0.4]}
          width={480}
          height={250}
          minHeight={250}
          margin={{ left: 128, right: 46, top: 24, bottom: 34 }}
          ariaLabel={`Final test accuracy for each threshold, compared with ${pct(base)} for the labelled-only model`}
        >
          <Grid xTicks={nTicks} yTicks={0} />
          <Axes xLabel="test accuracy (%)" xTicks={nTicks} hideYTicks tickFormat={(v) => `${Math.round(v * 100)}`} />
          <ThresholdRows rows={finals} base={base} current={tau} />
        </Plot>
      </div>
    </Figure>
  )
}
