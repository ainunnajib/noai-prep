import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Path, Axes, usePlot, useNarrow, mulberry32 } from '../../../../../kit'
import { blobs, moons, rings, gauss, kmeansBest, dbscan, matchedAccuracy, clusterColour, type Pt, type Dataset } from './clustering'
import { DataCircle, CentroidHandle, Note } from './parts'

/*
  Where k-means works and where it breaks. Five datasets; the grey bands show the TRUE groups
  (k-means never sees them). Colours show what the algorithm found. The score is the share of
  points grouped as in the truth, after matching each found cluster to one true group.
  A toggle runs DBSCAN (density-based, next lesson) on the same data for comparison.
*/

const X: [number, number] = [0, 10]
const Y: [number, number] = [0, 8]

type Key = 'blobs' | 'moons' | 'rings' | 'stretched' | 'uneven'

const DIR: Pt = [Math.cos(0.32), Math.sin(0.32)]
const NRM: Pt = [-DIR[1], DIR[0]]
const STRETCH_CENTRES: Pt[] = [
  [5, 5.3],
  [5, 2.7],
]
function stretched(n: number, seed: number): Dataset {
  const rng = mulberry32(seed)
  const points: Pt[] = []
  const truth: number[] = []
  STRETCH_CENTRES.forEach((c, g) => {
    for (let i = 0; i < n; i++) {
      const a = -4 + (8 * (i + rng())) / n
      const b = 0.28 * gauss(rng)
      points.push([c[0] + a * DIR[0] + b * NRM[0], c[1] + a * DIR[1] + b * NRM[1]])
      truth.push(g)
    }
  })
  return { points, truth }
}

const UNEVEN_C: Pt[] = [
  [4.7, 4.0],
  [7.8, 6.2],
  [8.0, 1.8],
]
const UNEVEN_SD = [1.15, 0.28, 0.28]
const BLOB_C: Pt[] = [
  [2.3, 5.8],
  [7.6, 6.2],
  [5.2, 2.0],
]
const MOON_SCALE = 3
const MOON_OFF: Pt = [3.5, 2.75]
const RING_R = [1.1, 3.1]

interface Spec {
  label: string
  data: Dataset
  k: number
  eps: number
  minSamples: number
  verdict: string
}

const SPECS: Record<Key, Spec> = {
  blobs: {
    label: 'Blobs',
    data: blobs(BLOB_C, 30, 0.6, 11),
    k: 3,
    eps: 0.9,
    minSamples: 5,
    verdict: 'Round, similar-sized, well-separated groups: exactly what k-means assumes, so it finds them perfectly.',
  },
  moons: {
    label: 'Moons',
    data: moons(70, 0.06, 12, MOON_SCALE, MOON_OFF),
    k: 2,
    eps: 0.65,
    minSamples: 5,
    verdict: 'Each moon is curved, so its mean lies outside the moon. The best straight boundary between two centroids cuts both moons.',
  },
  rings: {
    label: 'Rings',
    data: rings([45, 95], RING_R, 0.12, 13),
    k: 2,
    eps: 0.75,
    minSamples: 4,
    verdict: 'Both rings have the same centre, so no pair of centroids can separate them: k-means can only slice the picture into halves.',
  },
  stretched: {
    label: 'Stretched',
    data: stretched(60, 14),
    k: 2,
    eps: 0.7,
    minSamples: 5,
    verdict: 'Long thin groups: cutting them across the middle (left half, right half) gives a lower inertia than the true split, so k-means prefers it.',
  },
  uneven: {
    label: 'Uneven sizes',
    data: blobs(UNEVEN_C, [120, 14, 14], UNEVEN_SD, 16),
    k: 3,
    eps: 0.9,
    minSamples: 4,
    verdict: "The boundary between two centroids sits halfway between them, so the small groups' centroids steal the edge of the big, spread-out group.",
  },
}
const ORDER: Key[] = ['blobs', 'moons', 'rings', 'stretched', 'uneven']

/** grey bands showing the true groups */
function TruthBands({ which }: { which: Key }) {
  const { xs } = usePlot()
  const px = (d: number) => Math.abs(xs(d) - xs(0))
  const band = 'color-mix(in srgb, var(--viz-muted) 30%, transparent)'
  if (which === 'blobs') return <>{BLOB_C.map((c, g) => <DataCircle key={g} c={c} r={1.3} fill={band} stroke="var(--viz-muted)" dash="4 3" />)}</>
  if (which === 'uneven') return <>{UNEVEN_C.map((c, g) => <DataCircle key={g} c={c} r={UNEVEN_SD[g] * 2.2} fill={band} stroke="var(--viz-muted)" dash="4 3" />)}</>
  if (which === 'rings') return <>{RING_R.map((r, g) => <DataCircle key={g} c={[5, 4]} r={r} stroke={band} width={px(0.55)} />)}</>
  if (which === 'moons') {
    const arc = (g: number) =>
      Array.from({ length: 41 }, (_, i) => {
        const t = (Math.PI * i) / 40
        const x = g === 0 ? Math.cos(t) : 1 - Math.cos(t)
        const y = g === 0 ? Math.sin(t) : 0.5 - Math.sin(t)
        return [MOON_OFF[0] + MOON_SCALE * x, MOON_OFF[1] + MOON_SCALE * y] as Pt
      })
    return <>{[0, 1].map((g) => <Path key={g} points={arc(g)} color={band} width={px(0.6)} />)}</>
  }
  return (
    <>
      {STRETCH_CENTRES.map((c, g) => (
        <Path
          key={g}
          points={[
            [c[0] - 4 * DIR[0], c[1] - 4 * DIR[1]],
            [c[0] + 4 * DIR[0], c[1] + 4 * DIR[1]],
          ]}
          color={band}
          width={px(0.85)}
        />
      ))}
    </>
  )
}

/**
  Colour index for each found cluster: the true group it overlaps most (greedy, one cluster per group), so that
  the k-means and DBSCAN panels paint the same true group in the same colour. Extra clusters get the next free colours.
*/
function alignToTruth(truth: number[], pred: number[]): (l: number) => number {
  const T = Array.from(new Set(truth)).sort((a, b) => a - b)
  const P = Array.from(new Set(pred.filter((l) => l >= 0))).sort((a, b) => a - b)
  const pairs: [number, number, number][] = []
  P.forEach((p) => T.forEach((t) => pairs.push([truth.reduce((s, tt, i) => s + (tt === t && pred[i] === p ? 1 : 0), 0), p, t])))
  pairs.sort((a, b) => b[0] - a[0])
  const map = new Map<number, number>()
  const used = new Set<number>()
  for (const [c, p, t] of pairs)
    if (c > 0 && !map.has(p) && !used.has(t)) {
      map.set(p, t)
      used.add(t)
    }
  let next = 0
  P.forEach((p) => {
    if (map.has(p)) return
    while (used.has(next)) next++
    map.set(p, next)
    used.add(next)
  })
  return (l) => (l < 0 ? l : (map.get(l) ?? l))
}

function Marks({ points, labels, noise }: { points: Pt[]; labels: number[]; noise?: boolean[] }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {points.map((p, i) => {
        const cx = xs(p[0])
        const cy = ys(p[1])
        if (noise?.[i])
          return <path key={i} d={`M${cx - 3.5},${cy - 3.5}L${cx + 3.5},${cy + 3.5}M${cx - 3.5},${cy + 3.5}L${cx + 3.5},${cy - 3.5}`} style={{ stroke: 'var(--viz-ink)', strokeWidth: 1.6 }} />
        return <circle key={i} cx={cx} cy={cy} r={4} style={{ fill: clusterColour(labels[i]), stroke: 'var(--surface)', strokeWidth: 1 }} />
      })}
    </g>
  )
}

export default function KMeansFailureGallery() {
  const [which, setWhich] = useState<Key>('moons')
  const [k, setK] = useState(SPECS.moons.k)
  const [showDb, setShowDb] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)
  const spec = SPECS[which]
  const { points, truth } = spec.data
  const km = useMemo(() => kmeansBest(points, k, 9, 8), [points, k])
  const db = useMemo(() => dbscan(points, spec.eps, spec.minSamples), [points, spec])
  const accK = matchedAccuracy(truth, km.labels)
  const accD = matchedAccuracy(truth, db.labels)
  const kmColour = useMemo(() => alignToTruth(truth, km.labels), [truth, km])
  const dbColour = useMemo(() => alignToTruth(truth, db.labels), [truth, db])
  const pct = (v: number) => `${Math.round(v * 100)}%`

  const panel = (title: string, body: React.ReactNode, aria: string) => (
    <div style={{ display: 'grid', justifyItems: 'center', minWidth: 0 }}>
      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }}>{title}</div>
      <Plot x={X} y={Y} width={showDb && !narrow ? 340 : 460} height={showDb && !narrow ? 272 : 368} maxWidth={520} margin={{ left: 12, right: 12, top: 10, bottom: 12 }} ariaLabel={aria}>
        <Axes hideXTicks hideYTicks />
        <TruthBands which={which} />
        {body}
      </Plot>
    </div>
  )

  return (
    <Figure
      wide
      title="When k-means fails"
      caption={
        <>
          Grey bands are the <b>true</b> groups; colours are what the algorithm found. Switch datasets and see which shapes k-means gets wrong, then try
          other values of k: no k fixes moons or rings, because the problem is the shape, not the number. Turn on <b>Compare with DBSCAN</b> (next
          lesson), which grows clusters through dense regions instead of measuring distance to a centre; crosses are points it calls noise.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: showDb && !narrow ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
        {panel(
          `k-means, k = ${k}: ${pct(accK)} grouped correctly`,
          <>
            <Marks points={points} labels={km.labels.map(kmColour)} />
            {km.centroids.map((c, j) => (
              <CentroidHandle key={j} x={c[0]} y={c[1]} colour={clusterColour(kmColour(j))} label={`centroid ${j + 1}`} r={6} />
            ))}
          </>,
          `${spec.label} data clustered by k-means with k = ${k}; ${pct(accK)} of points grouped as in the truth`,
        )}
        {showDb &&
          panel(
            `DBSCAN (eps ${spec.eps}, min_samples ${spec.minSamples}): ${pct(accD)}`,
            <Marks points={points} labels={db.labels.map(dbColour)} noise={db.labels.map((l) => l < 0)} />,
            `${spec.label} data clustered by DBSCAN: ${db.nClusters} clusters, ${db.labels.filter((l) => l < 0).length} noise points, ${pct(accD)} grouped as in the truth`,
          )}
      </div>
      <Note>{k === spec.k ? spec.verdict : `The data has ${spec.k} true groups; with k = ${k} k-means must still cut the points into exactly ${k} pieces.`}</Note>
      <Readout
        items={[
          ['k-means grouped correctly', pct(accK)],
          ['inertia', km.inertia.toFixed(1)],
          ...(showDb ? ([['DBSCAN grouped correctly', pct(accD)] as [string, string], ['DBSCAN clusters found', String(db.nClusters)] as [string, string]]) : []),
        ]}
      />
      <Controls>
        <Segmented
          label="Dataset"
          value={which}
          onChange={(v) => {
            setWhich(v)
            setK(SPECS[v].k)
          }}
          options={ORDER.map((key) => ({ value: key, label: SPECS[key].label }))}
        />
        <Slider label="k for k-means" value={k} min={2} max={6} step={1} onChange={setK} />
        <Toggle label="Compare with DBSCAN" checked={showDb} onChange={setShowDb} />
      </Controls>
    </Figure>
  )
}
