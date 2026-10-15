import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Axes, usePlot, mulberry32 } from '../../../../../kit'
import { blobs, moons, dbscan, sqDist, clusterColour, tint, type Pt, type Dataset, type PointKind } from '../k-means/clustering'
import { DataCircle, DragHandle, Note } from '../k-means/parts'

/*
  DBSCAN, live. Core points are filled discs (with their eps-circle drawn faintly; two core points are
  connected only when one lies inside the other's circle, not when their circles merely overlap); border points are hollow rings; noise points are crosses.
  Two orange probe points can be dragged anywhere and are clustered like every other point.
  Tap any point to inspect it: its eps-circle and neighbours are highlighted and the read-out says
  why it is core, border or noise. Conventions follow scikit-learn: min_samples counts the point itself.
*/

const X: [number, number] = [0, 10]
const Y: [number, number] = [0, 8]

function withNoise(D: Dataset, m: number, seed: number): Pt[] {
  const rng = mulberry32(seed)
  const pts = D.points.slice()
  for (let i = 0; i < m; i++) pts.push([0.5 + 9 * rng(), 0.8 + 6.6 * rng()])
  return pts
}

type Key = 'moons' | 'blobs' | 'density'
const DATA: Record<Key, { label: string; points: Pt[]; eps: number; min: number; probes: Pt[] }> = {
  moons: { label: 'Moons + noise', points: withNoise(moons(60, 0.07, 41, 3, [3.5, 2.75]), 10, 42), eps: 0.75, min: 5, probes: [[5.3, 6.9], [8.0, 4.4]] },
  blobs: {
    label: 'Blobs + noise',
    points: withNoise(
      blobs(
        [
          [2.4, 5.8],
          [7.4, 6.0],
          [5.0, 2.2],
        ],
        30,
        0.5,
        43,
      ),
      12,
      44,
    ),
    eps: 0.6,
    min: 5,
    probes: [[4.9, 4.4], [6.4, 6.0]],
  },
  density: {
    label: 'Mixed density',
    points: withNoise(
      blobs(
        [
          [2.0, 5.8],
          [3.4, 5.8],
          [6.6, 3.2],
        ],
        [30, 30, 45],
        [0.25, 0.25, 0.9],
        47,
      ),
      6,
      46,
    ),
    eps: 0.35,
    min: 5,
    probes: [[8.6, 6.8], [4.4, 1.6]],
  },
}
const ORDER: Key[] = ['moons', 'blobs', 'density']

function Cross({ x, y, s = 4, colour = 'var(--viz-ink)', w = 1.8 }: { x: number; y: number; s?: number; colour?: string; w?: number }) {
  return <path d={`M${x - s},${y - s}L${x + s},${y + s}M${x - s},${y + s}L${x + s},${y - s}`} style={{ stroke: colour, strokeWidth: w }} />
}

function Scene({ pts, labels, kinds, eps, showCircles, selected, nProbe }: { pts: Pt[]; labels: number[]; kinds: PointKind[]; eps: number; showCircles: boolean; selected: number | null; nProbe: number }) {
  const { xs, ys } = usePlot()
  const first = pts.length - nProbe
  const nbrs = selected == null ? [] : pts.map((_, j) => j).filter((j) => sqDist(pts[selected], pts[j]) <= eps * eps)
  return (
    <>
      {showCircles &&
        pts.map((p, i) => (kinds[i] === 'core' ? <DataCircle key={`c${i}`} c={p} r={eps} fill={tint(labels[i], 45)} stroke="none" opacity={0.55} /> : null))}
      {selected != null && <DataCircle c={pts[selected]} r={eps} fill="none" stroke="var(--viz-ink)" width={2} dash="5 3" />}
      {selected != null &&
        nbrs.map((j) => (j === selected ? null : <line key={`l${j}`} x1={xs(pts[selected][0])} y1={ys(pts[selected][1])} x2={xs(pts[j][0])} y2={ys(pts[j][1])} style={{ stroke: 'var(--viz-ink)', strokeWidth: 1, opacity: 0.6 }} />))}
      {pts.map((p, i) => {
        if (i >= first) return null
        const cx = xs(p[0])
        const cy = ys(p[1])
        const sel = i === selected
        if (kinds[i] === 'noise') return <Cross key={i} x={cx} y={cy} s={sel ? 5.5 : 4} w={sel ? 2.6 : 1.8} />
        if (kinds[i] === 'border') return <circle key={i} cx={cx} cy={cy} r={sel ? 6 : 4.2} style={{ fill: 'var(--surface)', stroke: clusterColour(labels[i]), strokeWidth: sel ? 3 : 2.2 }} />
        return <circle key={i} cx={cx} cy={cy} r={sel ? 6.5 : 4.6} style={{ fill: clusterColour(labels[i]), stroke: sel ? 'var(--viz-ink)' : 'var(--surface)', strokeWidth: sel ? 2 : 1 }} />
      })}
    </>
  )
}

const KIND_TEXT: Record<PointKind, string> = { core: 'core', border: 'border', noise: 'noise' }

export default function DBSCANExplorer() {
  const [which, setWhich] = useState<Key>('moons')
  const [eps, setEps] = useState(DATA.moons.eps)
  const [minS, setMinS] = useState(DATA.moons.min)
  const [probes, setProbes] = useState<Pt[]>(DATA.moons.probes)
  const [showCircles, setShowCircles] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const base = DATA[which].points
  const pts = useMemo(() => base.concat(probes), [base, probes])
  const res = useMemo(() => dbscan(pts, eps, minS), [pts, eps, minS])
  const counts = { core: 0, border: 0, noise: 0 }
  res.kinds.forEach((k) => counts[k]++)

  const pick = (p: Pt) => {
    let best = -1
    let bd = Infinity
    pts.forEach((q, i) => {
      const d = sqDist(p, q)
      if (d < bd) {
        bd = d
        best = i
      }
    })
    setSelected(bd < 0.35 * 0.35 ? best : null)
  }

  let inspect: React.ReactNode = <>Tap any point to see why it is core, border or noise.</>
  if (selected != null && selected < pts.length) {
    const c = res.counts[selected]
    const kind = res.kinds[selected]
    const reason =
      kind === 'core'
        ? `${c} ≥ min_samples = ${minS}, so it is a core point`
        : kind === 'border'
          ? `${c} < ${minS}, so it is not core, but it lies within eps of a core point, so it joins that cluster as a border point`
          : `${c} < ${minS}, and no core point lies within eps of it, so it is noise`
    inspect = (
      <>
        <b>Selected point:</b> {c} point{c === 1 ? '' : 's'} within eps = {eps.toFixed(2)} (counting itself). {reason}.
      </>
    )
  }

  const probeKind = (j: number) => KIND_TEXT[res.kinds[base.length + j]]

  return (
    <Figure
      title="DBSCAN: clusters are dense regions"
      caption={
        <>
          Filled discs are <b>core</b> points (at least min_samples points within eps, counting themselves), rings are <b>border</b> points (not core,
          but within eps of a core point) and crosses are <b>noise</b>. The shaded discs are the eps-circles of the core points. A cluster grows from core
          point to core point whenever one lies <i>inside</i> another's circle (distance ≤ eps), and a non-core point inside a core point's circle joins as a
          border point. Circles that merely overlap do not join clusters: look where the two moons' shading touches but their colours differ. Slide eps down until the moons shatter, then up until they fuse. Drag the two orange probe points into a gap and into a
          moon. On <b>Mixed density</b>, try to find one eps that keeps the two tight blobs apart <i>and</i> the spread-out blob in one piece.
        </>
      }
    >
      <Plot x={X} y={Y} width={480} height={384} maxWidth={560} margin={{ left: 12, right: 12, top: 10, bottom: 12 }} ariaLabel={`DBSCAN with eps ${eps.toFixed(2)} and min_samples ${minS}: ${res.nClusters} clusters, ${counts.core} core, ${counts.border} border and ${counts.noise} noise points`} onPointerDown={pick}>
        <Axes hideXTicks hideYTicks />
        <Scene pts={pts} labels={res.labels} kinds={res.kinds} eps={eps} showCircles={showCircles} selected={selected} nProbe={probes.length} />
        {probes.map((p, j) => (
          <g key={j}>
            <DragHandle
              x={p[0]}
              y={p[1]}
              colour="var(--viz-2)"
              r={7}
              ariaLabel={`Probe point ${j + 1}, currently ${probeKind(j)}`}
              valueText={`x ${p[0].toFixed(1)}, y ${p[1].toFixed(1)}: ${probeKind(j)}`}
              onChange={(x, y) => {
                setProbes((ps) => ps.map((q, k) => (k === j ? ([x, y] as Pt) : q)))
                setSelected(base.length + j)
              }}
            />
            <ProbeTag p={p} text={probeKind(j)} />
          </g>
        ))}
      </Plot>
      <Note>{inspect}</Note>
      <Readout
        items={[
          ['clusters', String(res.nClusters)],
          ['core', String(counts.core)],
          ['border', String(counts.border)],
          ['noise', String(counts.noise)],
        ]}
      />
      <Controls>
        <Slider label="eps (neighbourhood radius)" value={eps} min={0.2} max={1.6} step={0.05} onChange={setEps} format={(v) => v.toFixed(2)} />
        <Slider label="min_samples" value={minS} min={2} max={12} step={1} onChange={setMinS} />
        <Segmented
          label="Dataset"
          value={which}
          onChange={(v) => {
            setWhich(v)
            setEps(DATA[v].eps)
            setMinS(DATA[v].min)
            setProbes(DATA[v].probes)
            setSelected(null)
          }}
          options={ORDER.map((k) => ({ value: k, label: DATA[k].label }))}
        />
        <Toggle label="Show eps-circles" checked={showCircles} onChange={setShowCircles} />
      </Controls>
    </Figure>
  )
}

function ProbeTag({ p, text }: { p: Pt; text: string }) {
  const { xs, ys } = usePlot()
  const right = xs(p[0]) < xs.range()[1] - 60
  return (
    <text className="plot-label" x={xs(p[0]) + (right ? 12 : -12)} y={ys(p[1]) - 10} textAnchor={right ? 'start' : 'end'} style={{ fill: 'var(--viz-2)', fontWeight: 700, fontSize: 12 }}>
      {text}
    </text>
  )
}
