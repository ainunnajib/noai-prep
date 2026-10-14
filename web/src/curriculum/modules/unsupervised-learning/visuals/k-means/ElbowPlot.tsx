import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Path, VLine, Label, usePlot, useNarrow } from '../../../../../kit'
import { blobs, kmeansBest, silhouette, voronoiCells, clusterColour, tint, fmt, type Pt } from './clustering'
import { Poly, PointCloud, CentroidHandle, Note } from './parts'

/*
  The elbow method. Left: the data clustered with the chosen k. Right: inertia (or the silhouette
  score) for every k from 1 to 10, each computed with the best of 6 k-means++ runs.
  The elbow is marked where one more cluster suddenly stops helping: the k with the largest ratio
  (drop into k) / (drop out of k), among drops of at least 4% of the k = 1 inertia; a best ratio
  under 4 counts as "no clear elbow".
*/

const X: [number, number] = [0, 10]
const Y: [number, number] = [0, 8]
const KMAX = 10
const SETS: Pt[][] = [
  [[5, 4]],
  [
    [2.8, 5.6],
    [7.2, 2.4],
  ],
  [
    [2.3, 5.8],
    [7.6, 6.2],
    [5.2, 2.0],
  ],
  [
    [2.2, 6.0],
    [7.8, 6.2],
    [2.6, 1.9],
    [7.5, 2.0],
  ],
  [
    [2.0, 6.3],
    [7.9, 6.4],
    [5.0, 4.1],
    [2.1, 1.8],
    [7.8, 1.9],
  ],
  [
    [1.9, 6.1],
    [5.0, 6.4],
    [8.1, 6.0],
    [2.0, 2.0],
    [5.1, 1.7],
    [8.0, 2.1],
  ],
]

const SEEDS = [36, 32, 33, 34, 35, 36]

interface Analysis {
  points: Pt[]
  runs: { labels: number[]; centroids: Pt[]; inertia: number; sil: number }[]
  elbow: number | null
  silBest: number
}

function analyse(m: number): Analysis {
  const points = blobs(SETS[m - 1], 20, 0.55, SEEDS[m - 1]).points
  const runs = Array.from({ length: KMAX }, (_, i) => {
    const r = kmeansBest(points, i + 1, 5, 6)
    return { labels: r.labels, centroids: r.centroids, inertia: r.inertia, sil: i === 0 ? NaN : silhouette(points, r.labels) }
  })
  // elbow: largest ratio of the drop into k to the drop out of k
  let elbow: number | null = null
  let bestRatio = 0
  for (let k = 2; k < KMAX; k++) {
    const into = runs[k - 2].inertia - runs[k - 1].inertia
    if (into < 0.04 * runs[0].inertia) continue // ignore tiny wiggles in the flat tail
    const out = Math.max(1e-9, runs[k - 1].inertia - runs[k].inertia)
    const ratio = into / out
    if (ratio > bestRatio) {
      bestRatio = ratio
      elbow = k
    }
  }
  if (bestRatio < 4) elbow = null
  let silBest = 2
  for (let k = 2; k <= KMAX; k++) if (runs[k - 1].sil > runs[silBest - 1].sil) silBest = k
  return { points, runs, elbow, silBest }
}

function ChartDots({ vals, k, onPick }: { vals: [number, number][]; k: number; onPick: (k: number) => void }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {vals.map(([kk, v]) => (
        <g key={kk} onClick={() => onPick(kk)} style={{ cursor: 'pointer' }}>
          <circle cx={xs(kk)} cy={ys(v)} r={14} style={{ fill: 'transparent' }} />
          <circle cx={xs(kk)} cy={ys(v)} r={kk === k ? 7 : 4.5} style={{ fill: kk === k ? 'var(--viz-2)' : 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 2 }} />
        </g>
      ))}
    </g>
  )
}

export default function ElbowPlot() {
  const [m, setM] = useState(4)
  const [k, setK] = useState(2)
  const [mode, setMode] = useState<'inertia' | 'silhouette'>('inertia')
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)
  const A = useMemo(() => analyse(m), [m])
  const run = A.runs[k - 1]
  const cells = useMemo(() => voronoiCells(run.centroids, [X[0], X[1], Y[0], Y[1]]), [run])

  const isInertia = mode === 'inertia'
  const vals: [number, number][] = A.runs.map((r, i) => [i + 1, isInertia ? r.inertia : r.sil] as [number, number]).filter(([, v]) => Number.isFinite(v))
  const top = isInertia ? A.runs[0].inertia * 1.08 : 1
  const drop = k > 1 ? (A.runs[k - 2].inertia - run.inertia) / A.runs[k - 2].inertia : null
  const mark = isInertia ? A.elbow : A.silBest

  const scatter = (
    <Plot x={X} y={Y} width={360} height={288} maxWidth={440} margin={{ left: 30, bottom: 26 }} ariaLabel={`${m} true blobs clustered by K-means with k = ${k}; inertia ${fmt(run.inertia)}`}>
      {cells.map((poly, j) => (
        <Poly key={j} points={poly} fill={tint(j, 13)} stroke="var(--surface)" width={2.5} />
      ))}
      <Axes xTicks={5} yTicks={4} hideXTicks hideYTicks />
      <PointCloud points={A.points} colours={(i) => clusterColour(run.labels[i])} r={4} />
      {run.centroids.map((c, j) => (
        <CentroidHandle key={j} x={c[0]} y={c[1]} colour={clusterColour(j)} label={`centroid ${j + 1}`} r={6} />
      ))}
    </Plot>
  )

  const chart = (
    <Plot
      x={[0.4, KMAX + 0.6]}
      y={[0, top]}
      width={360}
      height={288}
      maxWidth={440}
      margin={{ left: 50, bottom: 34, top: 18 }}
      ariaLabel={`${isInertia ? 'Inertia' : 'Silhouette score'} for k = 1 to 10: ${vals.map(([kk, v]) => `k=${kk}: ${fmt(v, isInertia ? 0 : 2)}`).join(', ')}`}
      onPointerDown={(p) => setK(Math.max(1, Math.min(KMAX, Math.round(p[0]))))}
    >
      <Grid xTicks={10} yTicks={4} />
      <Axes xLabel="k (number of clusters)" yLabel={isInertia ? 'inertia' : 'silhouette'} xTicks={10} yTicks={4} tickFormat={(v) => (isInertia ? String(Math.round(v)) : String(Math.round(v * 100) / 100))} />
      {mark != null && <VLine x={mark} color="var(--viz-pos)" dash="5 4" width={2} />}
      {mark != null && (
        <Label x={mark} y={top * 0.93} dx={6} color="var(--viz-pos)" size={12} weight={700}>
          {isInertia ? 'elbow' : 'highest'}
        </Label>
      )}
      <Path points={vals} color="var(--viz-1)" width={2.5} />
      <ChartDots vals={vals} k={k} onPick={setK} />
    </Plot>
  )

  return (
    <Figure
      wide
      title="Choosing k: the elbow"
      caption={
        <>
          Slide <b>k</b> and watch both panels. Inertia always falls as k grows (with one cluster per point it would be 0), so "smallest inertia" would
          always pick the biggest k. Look instead for the <b>elbow</b>: the k after which extra clusters only shave off a little. Change the number of
          true blobs and check that the elbow follows it. With one blob there is no elbow at all, and the silhouette score (which needs k ≥ 2) cannot
          say "1" either: both are heuristics, not proofs.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <div style={{ display: 'grid', justifyItems: 'center', minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }}>The data clustered with k = {k}</div>
          {scatter}
        </div>
        <div style={{ display: 'grid', justifyItems: 'center', minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }}>{isInertia ? 'Inertia for every k (tap a dot)' : 'Silhouette for every k (tap a dot)'}</div>
          {chart}
        </div>
      </div>
      <Readout
        items={[
          ['inertia at this k', fmt(run.inertia, 1)],
          ['drop from k − 1', drop == null ? '—' : `${Math.round(drop * 100)}%`],
          ['silhouette', k === 1 ? 'needs k ≥ 2' : fmt(run.sil, 2)],
          [isInertia ? 'elbow at' : 'best silhouette at', mark == null ? 'no clear elbow' : `k = ${mark}`],
        ]}
      />
      <Controls>
        <Slider label="k, the number of clusters" value={k} min={1} max={KMAX} step={1} onChange={setK} />
        <Slider label="true number of blobs in the data" value={m} min={1} max={6} step={1} onChange={setM} />
        <Segmented
          label="Score to plot"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'inertia', label: 'Inertia' },
            { value: 'silhouette', label: 'Silhouette' },
          ]}
        />
      </Controls>
      {k > 1 && drop != null && drop < 0.15 && <Note>Going from {k - 1} to {k} clusters removed only {Math.round(drop * 100)}% of the inertia: past the elbow, extra clusters mostly split real groups in two.</Note>}
    </Figure>
  )
}
