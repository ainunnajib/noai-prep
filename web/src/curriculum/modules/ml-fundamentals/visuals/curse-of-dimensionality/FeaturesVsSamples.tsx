import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Button, Plot, Grid, Axes, Path, Dots, Rect, VLine, Label, usePlot, useBump, useNarrow, mulberry32, M } from '../../../../../kit'
import { gaussian, leastSquares } from './maths'

/*
  More features than samples. 10 training patients; the label depends on ONE real feature
  (y = 2·x₁ + noise). Features 2..p are random numbers with nothing to do with the label.
  A linear model with p features has p + 1 parameters (p weights and a bias). Once p + 1 ≥ n,
  least squares can pass through every training point exactly, so training error is 0 even
  though the extra features are pure noise, while error on new patients explodes.
*/

const N_TRAIN = 10
const N_TEST = 200
const SHOW_TEST = 10
/** features generated per patient (kept at 15 so the hand-picked seeds below keep exactly the same data) */
const P_GEN = 15
/**
 * largest p on the slider. Beyond about p = 12 the error on new patients drifts down again ("double
 * descent", though it stays worse than p = 1 for every seed); stopping at 12 keeps the main story clean.
 */
const P_MAX = 12
const Y_LIM = 4.5
const ERR_CAP = 2
/** hand-picked seeds; every one shows the same story (checked against numpy.linalg.pinv) */
const SEEDS = [45, 38, 66, 52, 59, 73, 80, 31]

export interface PatientData {
  Xtr: number[][]
  ytr: number[]
  Xte: number[][]
  yte: number[]
}

export function makePatients(seed: number): PatientData {
  const rnd = mulberry32(seed)
  const g = gaussian(rnd)
  const row = () => Array.from({ length: P_GEN }, () => rnd() * 2 - 1)
  const Xtr = Array.from({ length: N_TRAIN }, row)
  const Xte = Array.from({ length: N_TEST }, row)
  const ytr = Xtr.map((x) => 2 * x[0] + 0.5 * g())
  const yte = Xte.map((x) => 2 * x[0] + 0.5 * g())
  return { Xtr, ytr, Xte, yte }
}

export function fitWithFeatures(data: PatientData, p: number) {
  const design = (X: number[][]) => X.map((x) => [1, ...x.slice(0, p)])
  const A = design(data.Xtr)
  const w = leastSquares(A, data.ytr)
  const predict = (rows: number[][]) => rows.map((r) => r.reduce((s, v, j) => s + v * w[j], 0))
  const predTr = predict(A)
  const predTe = predict(design(data.Xte))
  const mse = (pred: number[], y: number[]) => pred.reduce((s, v, i) => s + (v - y[i]) ** 2, 0) / y.length
  return { predTr, predTe, train: mse(predTr, data.ytr), test: mse(predTe, data.yte) }
}

const small: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }

/** A triangle at the edge of the plot for a value that is off the chart. */
function OffChart({ x, up, color }: { x: number; up: boolean; color: string }) {
  const { xs, ys } = usePlot()
  const [yb, yt] = ys.range()
  const cx = xs(x)
  const tip = up ? yt + 1 : yb - 1
  const base = up ? tip + 9 : tip - 9
  return <path d={`M${cx},${tip}L${cx + 5.5},${base}L${cx - 5.5},${base}Z`} style={{ fill: color }} />
}

const clampY = (v: number) => Math.max(-Y_LIM, Math.min(Y_LIM, v))

export default function FeaturesVsSamples() {
  const [p, setP] = useState(1)
  const [bumpN, bump] = useBump()
  const [ref, narrow] = useNarrow<HTMLDivElement>()
  const seed = SEEDS[bumpN % SEEDS.length]
  const data = useMemo(() => makePatients(seed), [seed])
  const fits = useMemo(() => Array.from({ length: P_MAX }, (_, i) => fitWithFeatures(data, i + 1)), [data])
  const fit = fits[p - 1]
  const params = p + 1
  const memorises = params >= N_TRAIN

  const testX = (i: number) => N_TRAIN + 2 + i
  const patients = [
    ...data.ytr.map((y, i) => ({ x: i + 1, y, yhat: fit.predTr[i], test: false })),
    ...data.yte.slice(0, SHOW_TEST).map((y, i) => ({ x: testX(i), y, yhat: fit.predTe[i], test: true })),
  ]

  const peak = fits.reduce((best, f, i) => (f.test > best.test ? { p: i + 1, test: f.test } : best), { p: 1, test: -1 })
  const trainCurve: [number, number][] = fits.map((f, i) => [i + 1, Math.min(ERR_CAP, f.train)])
  const testCurve: [number, number][] = fits.map((f, i) => [i + 1, Math.min(ERR_CAP, f.test)])

  return (
    <Figure
      title="Add useless features until the model memorises"
      caption={
        <>
          10 patients to learn from; their label depends on one real measurement (<M>{'y = 2x_1 + \\text{noise}'}</M>). Every other feature
          is a random number unrelated to the label. Slide <M>p</M> up. Training error falls to exactly 0 once the parameters (<M>p</M>{' '}
          weights + 1 bias) reach the number of patients: the model threads through every training point, noise included, and its predictions for
          new patients go wild. Press "New patients" to check it is not a fluke.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gap: '0.3rem', justifyItems: 'center' }}>
        <div style={small}>Label (dot) and prediction (ring) for each patient</div>
        <Plot
          x={[0.2, testX(SHOW_TEST - 1) + 0.8]}
          y={[-Y_LIM, Y_LIM]}
          width={560}
          height={220}
          minHeight={240}
          maxWidth={680}
          margin={{ top: 22, bottom: 14, left: 36, right: 10 }}
          ariaLabel={`Predictions with ${p} features: training error ${fit.train.toFixed(3)}, error on new patients ${fit.test.toFixed(2)}`}
        >
          <Rect x0={N_TRAIN + 1} x1={testX(SHOW_TEST - 1) + 0.8} y0={-Y_LIM} y1={Y_LIM} fill="var(--surface-2)" />
          <Grid xTicks={0} yTicks={4} />
          <Axes yTicks={4} hideXTicks />
          <Path points={[[0.2, 0], [testX(SHOW_TEST - 1) + 0.8, 0]]} color="var(--viz-axis)" width={1} />
          <Label x={(N_TRAIN + 1) / 2} y={Y_LIM} dy={-8} anchor="middle" color="var(--ink-2)" weight={700}>
            {narrow ? 'training (seen)' : '10 training patients (seen)'}
          </Label>
          <Label x={(N_TRAIN + 1 + testX(SHOW_TEST - 1) + 0.8) / 2} y={Y_LIM} dy={-8} anchor="middle" color="var(--ink-2)" weight={700}>
            {narrow ? 'new (unseen)' : 'new patients (unseen)'}
          </Label>
          {patients.map((q) => (
            <Path key={`r${q.x}`} points={[[q.x, q.y], [q.x, clampY(q.yhat)]]} color="var(--viz-neg)" width={2} opacity={0.75} />
          ))}
          <Dots points={patients.map((q) => ({ x: q.x, y: q.y, r: 4.5, color: 'var(--viz-ink)' }))} />
          <Dots points={patients.filter((q) => Math.abs(q.yhat) <= Y_LIM).map((q) => ({ x: q.x, y: q.yhat, r: 5.5, hollow: true, color: 'var(--viz-2)' }))} />
          {patients
            .filter((q) => Math.abs(q.yhat) > Y_LIM)
            .map((q) => (
              <OffChart key={`o${q.x}`} x={q.x} up={q.yhat > 0} color="var(--viz-2)" />
            ))}
        </Plot>
        <div style={{ ...small, marginTop: '0.5rem' }}>Average squared error against the number of features p</div>
        <Plot x={[0.5, P_MAX + 0.5]} y={[0, ERR_CAP]} width={560} height={200} minHeight={230} maxWidth={680} margin={{ top: 20, bottom: 34, left: 36, right: 10 }} ariaLabel="Training error falls to zero at 9 features while error on new patients shoots up">
          <Rect x0={N_TRAIN - 1 - 0.5} x1={P_MAX + 0.5} y0={0} y1={ERR_CAP} fill="color-mix(in srgb, var(--viz-neg) 8%, transparent)" />
          <Grid xTicks={P_MAX} yTicks={4} />
          <Axes xLabel="features p" xTicks={narrow ? 6 : P_MAX} yTicks={4} />
          <VLine x={p} color="var(--viz-muted)" />
          <Path points={testCurve} color="var(--viz-2)" width={2.5} />
          <Path points={trainCurve} color="var(--viz-1)" width={2.5} />
          <Dots points={testCurve.map(([x, y], i) => ({ x, y, r: x === p ? 6 : 3, color: 'var(--viz-2)', shape: fits[i].test > ERR_CAP ? ('triangle' as const) : undefined }))} />
          <Dots points={trainCurve.map(([x, y]) => ({ x, y, r: x === p ? 6 : 3, color: 'var(--viz-1)' }))} />
          {peak.test > ERR_CAP && (
            <Label x={peak.p} y={ERR_CAP} dx={peak.p > P_MAX - 3 ? -8 : 8} dy={-2} anchor={peak.p > P_MAX - 3 ? 'end' : 'start'} color="var(--viz-2)" weight={700}>
              {`↑ ${peak.test >= 100 ? peak.test.toFixed(0) : peak.test.toFixed(1)}`}
            </Label>
          )}
          <Label x={N_TRAIN - 1 - 0.5} y={0.3} dx={5} color="var(--viz-neg)" weight={700}>
            {narrow ? 'p + 1 ≥ n' : 'parameters ≥ samples'}
          </Label>
          <Label x={1} y={Math.min(ERR_CAP, fits[0].test)} dx={2} dy={-12} color="var(--viz-2)" weight={700}>
            new patients
          </Label>
          <Label x={1} y={Math.min(ERR_CAP, fits[0].train)} dx={2} dy={18} color="var(--viz-1)" weight={700}>
            training
          </Label>
        </Plot>
      </div>
      <Controls>
        <Slider label="number of features p" value={p} min={1} max={P_MAX} step={1} onChange={setP} />
        <Button onClick={bump}>New patients</Button>
      </Controls>
      <Readout
        items={[
          ['parameters p + 1', `${params} (patients n = ${N_TRAIN})`],
          // a tiny but non-zero error must not round to 0.000: only p + 1 ≥ n gives an exact 0
          ['training error', fit.train < 5e-7 ? '0 (exact fit)' : fit.train < 0.01 ? fit.train.toPrecision(2) : fit.train.toFixed(3)],
          ['error on new patients', fit.test >= 100 ? fit.test.toFixed(0) : fit.test.toFixed(2)],
        ]}
      />
      <div style={{ width: '100%', fontSize: '0.875rem', fontWeight: 600, color: memorises ? 'var(--viz-neg)' : 'var(--viz-pos)' }}>
        {memorises
          ? `${params} parameters ≥ ${N_TRAIN} patients: the model can fit every training label exactly, even pure noise.`
          : `${params} parameters < ${N_TRAIN} patients: the model cannot thread through every point, so it has to find the trend.`}
      </div>
    </Figure>
  )
}
