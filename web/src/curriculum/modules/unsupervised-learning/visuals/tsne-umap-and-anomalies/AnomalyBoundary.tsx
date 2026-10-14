import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Axes, Dots, DraggablePoint, M, usePlot } from '../../../../../kit'
import { GAMMA, train, models } from './anomalyData'

/*
  Anomaly detection trained on NORMAL data only (90 readings of a machine, two operating modes).
  One-class SVM: f(x) = sum_i coef_i exp(-gamma |x - sv_i|^2) + intercept, using coefficients fitted by
  scikit-learn (see anomalyData.ts). k-NN distance: s(x) = mean distance to the 5 nearest training points,
  flagged when s(x) is above the threshold that flags a share nu of the training points.
  In both cases f(x) > 0 means "looks normal" and f(x) < 0 means "anomaly".
*/

type Method = 'svm' | 'knn'
type P = [number, number]
const K = 5
const G = 64 // grid cells per side
const TOL = 1e-4

function knnScore(x: P, skip = -1): number {
  const d: number[] = []
  train.forEach(([a, b], i) => {
    if (i !== skip) d.push(Math.hypot(a - x[0], b - x[1]))
  })
  d.sort((p, q) => p - q)
  return d.slice(0, K).reduce((s, v) => s + v, 0) / K
}

/** score function f (f > 0 normal, f < 0 anomaly) and the scores of the training points themselves */
function makeScorer(method: Method, mi: number): { f: (x: P) => number; trainF: number[] } {
  if (method === 'svm') {
    const m = models[mi]
    const f = ([x, y]: P) => {
      let v = m.intercept
      m.sv.forEach((j, k) => {
        const [a, b] = train[j]
        v += m.coef[k] * Math.exp(-GAMMA * ((x - a) ** 2 + (y - b) ** 2))
      })
      return v
    }
    return { f, trainF: train.map(f) }
  }
  // k-NN: score each training point without itself, then put the threshold so that a share nu is flagged
  const own = train.map((p, i) => knnScore(p, i))
  const sorted = [...own].sort((a, b) => b - a)
  const nFlag = Math.floor(models[mi].nu * train.length)
  const thr = nFlag === 0 ? sorted[0] + 1e-3 : (sorted[nFlag] + sorted[nFlag - 1]) / 2
  return { f: (x: P) => thr - knnScore(x), trainF: own.map((s) => thr - s) }
}

/** shaded score bands (a few <path>s) and the f = 0 boundary found by marching squares */
function ScoreMap({ f }: { f: (x: P) => number }) {
  const { xs, ys } = usePlot()
  const { bands, edge } = useMemo(() => {
    const step = 10 / G
    const V: number[][] = []
    for (let i = 0; i <= G; i++) {
      V.push([])
      for (let j = 0; j <= G; j++) V[i].push(f([j * step, i * step]))
    }
    let lo = 0
    let hi = 0
    V.forEach((r) => r.forEach((v) => ((lo = Math.min(lo, v)), (hi = Math.max(hi, v)))))
    const NB = 4
    const bands: string[] = Array(2 * NB).fill('')
    let edge = ''
    const px = (x: number) => xs(x).toFixed(1)
    const py = (y: number) => ys(y).toFixed(1)
    const cw = Math.abs(xs(step) - xs(0))
    const ch = Math.abs(ys(0) - ys(step))
    for (let i = 0; i < G; i++)
      for (let j = 0; j < G; j++) {
        const a = V[i][j] // bottom-left
        const b = V[i][j + 1] // bottom-right
        const c = V[i + 1][j + 1] // top-right
        const d = V[i + 1][j] // top-left
        const m = (a + b + c + d) / 4
        const lvl = m >= 0 ? NB + Math.min(NB - 1, Math.floor((m / (hi || 1)) * NB)) : Math.min(NB - 1, Math.floor((m / (lo || -1)) * NB))
        bands[lvl] += `M${xs(j * step).toFixed(1)},${ys((i + 1) * step).toFixed(1)}h${(cw + 0.4).toFixed(1)}v${(ch + 0.4).toFixed(1)}h${(-cw - 0.4).toFixed(1)}z`
        // marching squares on this cell
        const x0 = j * step
        const y0 = i * step
        const pts: P[] = []
        const cross = (v1: number, v2: number, p1: P, p2: P) => {
          if (v1 >= 0 !== v2 >= 0) {
            const t = v1 / (v1 - v2)
            pts.push([p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])])
          }
        }
        cross(a, b, [x0, y0], [x0 + step, y0])
        cross(b, c, [x0 + step, y0], [x0 + step, y0 + step])
        cross(c, d, [x0 + step, y0 + step], [x0, y0 + step])
        cross(d, a, [x0, y0 + step], [x0, y0])
        for (let k = 0; k + 1 < pts.length; k += 2) edge += `M${px(pts[k][0])},${py(pts[k][1])}L${px(pts[k + 1][0])},${py(pts[k + 1][1])}`
      }
    return { bands, edge }
  }, [f, xs, ys])
  const fill = (lvl: number) =>
    lvl < 4
      ? `color-mix(in srgb, var(--viz-neg) ${[7, 14, 21, 28][lvl]}%, var(--surface))`
      : `color-mix(in srgb, var(--viz-3) ${[8, 14, 20, 26][lvl - 4]}%, var(--surface))`
  return (
    <g aria-hidden="true">
      {bands.map((d, l) => (d ? <path key={l} d={d} style={{ fill: fill(l) }} /> : null))}
      <path d={edge} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2.2, strokeLinecap: 'round' }} />
    </g>
  )
}

const START: P[] = [
  [6.9, 6.7],
  [4.6, 4.3],
  [8.9, 2.1],
]

export default function AnomalyBoundary() {
  const [method, setMethod] = useState<Method>('svm')
  const [mi, setMi] = useState(2)
  const [tests, setTests] = useState<P[]>(START)
  const { f, trainF } = useMemo(() => makeScorer(method, mi), [method, mi])
  const flagged = trainF.map((v) => v < -TOL)
  const nFlag = flagged.filter(Boolean).length
  const status = tests.map((t) => f(t) < -TOL)
  const nu = models[mi].nu

  return (
    <Figure
      wide
      title="Learn what normal looks like, then flag the rest"
      caption={
        <>
          The dots are 90 <b>normal</b> readings of a machine (two operating modes: idle and busy); no anomalies were ever shown to the detector. The
          black line is the learned boundary: green inside means normal, red outside means anomaly. Drag A, B and C around. Then slide{' '}
          <M>\nu</M> (nu): a bigger <M>\nu</M> pulls the boundary in tighter, so more normal points are flagged (false alarms, drawn as red rings) but
          fewer real anomalies slip through. Switch to the k-NN distance score: a different rule, a similar idea.
        </>
      }
    >
      <Plot x={[0, 10]} y={[0, 10]} width={420} height={420} maxWidth={460} margin={{ left: 44, right: 12, top: 12, bottom: 44 }} ariaLabel={`Anomaly boundary from ${method === 'svm' ? 'a one-class SVM' : 'k-nearest-neighbour distance'} with nu ${nu}`}>
        <ScoreMap f={f} />
        <Axes xLabel="temperature" yLabel="vibration" xTicks={5} yTicks={5} />
        <Dots points={train.map(([x, y], i) => (flagged[i] ? { x, y, r: 4.5, hollow: true, color: 'var(--viz-neg)' } : { x, y, r: 3, color: 'var(--viz-ink)' }))} />
        {tests.map((t, k) => (
          <DraggablePoint
            key={k}
            x={t[0]}
            y={t[1]}
            color={status[k] ? 'var(--viz-neg)' : 'var(--viz-3)'}
            label={'ABC'[k]}
            onChange={(x, y) => setTests(tests.map((q, j) => (j === k ? [x, y] : q)))}
          />
        ))}
      </Plot>
      <Controls>
        <Segmented
          label="detector"
          value={method}
          onChange={setMethod}
          options={[
            { value: 'svm', label: 'one-class SVM' },
            { value: 'knn', label: 'k-NN distance' },
          ]}
        />
        <Slider label={<>tightness ν (nu)</>} value={mi} min={0} max={models.length - 1} step={1} onChange={setMi} format={(i) => models[i].nu.toFixed(2)} />
        <Readout
          items={[
            ['false alarms', `${nFlag} of ${train.length} (${((100 * nFlag) / train.length).toFixed(0)}%)`],
            ...tests.map((_, k) => ['ABC'[k], status[k] ? 'anomaly' : 'normal'] as [string, string]),
          ]}
        />
      </Controls>
    </Figure>
  )
}
