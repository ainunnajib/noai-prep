import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Toggle, Plot, Grid, Axes, Path, Dots, Label, VLine, DraggablePoint, usePlot } from '../../../../../kit'
import { TRAIN, TEST, CLS_C, CLS_NAME, type Metric, voteRuns, nearest, realDist, accuracy, type Cell } from './knnData'

/*
  k-NN on a two-class "wave" dataset. Drag (or click to place) the query; it is joined to its k nearest
  training points, and the dashed shape is the smallest neighbourhood (circle for Euclidean, diamond for
  Manhattan) that holds all k of them. The background is the k-NN prediction at every spot, paler where
  the vote is close. The chart underneath shows training and test accuracy for every odd k.
*/

const KS = Array.from({ length: 13 }, (_, i) => 2 * i + 1)

function Regions({ runs }: { runs: Cell[] }) {
  const { xs, ys, clipId } = usePlot()
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {runs.map((r, i) => (
        <rect
          key={i}
          x={xs(r.x0)}
          y={ys(r.y1)}
          width={xs(r.x1) - xs(r.x0) + 0.6}
          height={ys(r.y0) - ys(r.y1) + 0.6}
          shapeRendering="crispEdges"
          style={{ fill: `color-mix(in srgb, ${CLS_C[r.cls]} ${[0, 9, 16, 24][r.level]}%, var(--surface))` }}
        />
      ))}
    </g>
  )
}

/** The neighbourhood that just reaches the k-th neighbour: a circle (L2) or a diamond (L1). */
function ballPoints(m: Metric, cx: number, cy: number, r: number): [number, number][] {
  if (m === 'manhattan') return [[cx + r, cy], [cx, cy + r], [cx - r, cy], [cx, cy - r]]
  return Array.from({ length: 73 }, (_, i) => {
    const t = (i / 72) * 2 * Math.PI
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as [number, number]
  })
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`
const snap = (v: number) => Math.round(Math.max(0.1, Math.min(9.9, v)) * 10) / 10

export default function KNNMap() {
  const [k, setK] = useState(1)
  const [metric, setMetric] = useState<Metric>('euclidean')
  const [q, setQ] = useState<[number, number]>([6.5, 4.5])
  const [shade, setShade] = useState(true)

  const cache = useMemo(() => new Map<string, Cell[]>(), [])
  const runs = useMemo(() => {
    const key = `${metric}-${k}`
    let r = cache.get(key)
    if (!r) {
      r = voteRuns(k, metric)
      cache.set(key, r)
    }
    return r
  }, [k, metric, cache])

  const curves = useMemo(
    () => ({
      train: KS.map((kk) => accuracy(TRAIN, kk, metric)),
      test: KS.map((kk) => accuracy(TEST, kk, metric)),
    }),
    [metric],
  )

  const nn = nearest(TRAIN, q[0], q[1], k, metric)
  const blue = nn.filter((i) => TRAIN[i][2] === 1).length
  const orange = k - blue
  const pred = blue > orange ? 1 : 0
  const far = TRAIN[nn[nn.length - 1]]
  const radius = realDist(metric, q[0], q[1], far[0], far[1])
  const ki = (k - 1) / 2
  // keep the two end labels of the accuracy chart from overlapping
  const labelY = (() => {
    const a = curves.train[12]
    const b = curves.test[12]
    if (Math.abs(a - b) >= 0.05) return { train: a, test: b }
    const mid = (a + b) / 2
    return a > b ? { train: mid + 0.025, test: mid - 0.025 } : { train: mid - 0.025, test: mid + 0.025 }
  })()

  const dots = TRAIN.map((p) => ({ x: p[0], y: p[1], color: CLS_C[p[2]], shape: p[2] === 1 ? ('square' as const) : ('circle' as const), r: 5 }))

  return (
    <Figure
      title="k-NN: the neighbours vote"
      caption={
        <>
          Drag the big marker (or tap anywhere) to place a new point. Lines join it to its <i>k</i> nearest training points and the vote decides its
          colour; the background shows the vote for a new point at every spot, paler where the vote is close. Start at <i>k</i> = 1 and look for the little
          islands around odd points. Then slide to <i>k</i> = 9 (the boundary follows the wave) and <i>k</i> = 25 (the wave is flattened). In the chart,
          training accuracy is 100% at <i>k</i> = 1 but test accuracy is lowest there.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-2)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" style={{ fill: CLS_C[0] }} />
          </svg>
          class orange
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" aria-hidden="true">
            <rect x="2" y="2" width="10" height="10" style={{ fill: CLS_C[1] }} />
          </svg>
          class blue
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="18" height="14" aria-hidden="true">
            <path d="M1,7 L17,7" style={{ stroke: 'var(--viz-ink)', strokeWidth: 1.5, strokeDasharray: '4 3' }} />
          </svg>
          neighbourhood holding the {k} nearest
        </span>
      </div>
      <Plot
        x={[0, 10]}
        y={[0, 10]}
        width={460}
        height={460}
        maxWidth={500}
        margin={{ left: 34, bottom: 34, right: 12, top: 12 }}
        ariaLabel={`k-nearest-neighbour map with k = ${k} and ${metric} distance. The new point at (${q[0]}, ${q[1]}) has ${orange} orange and ${blue} blue neighbours, so it is predicted ${CLS_NAME[pred]}.`}
        onPointerDown={(p) => setQ([snap(p[0]), snap(p[1])])}
        onPointerMove={(p, e) => {
          if (e.buttons === 1) setQ([snap(p[0]), snap(p[1])])
        }}
      >
        {shade && <Regions runs={runs} />}
        <Grid xTicks={10} yTicks={10} />
        <Axes xLabel="x₁" yLabel="x₂" xTicks={5} yTicks={5} />
        <Path points={ballPoints(metric, q[0], q[1], radius)} closed color="var(--viz-ink)" width={1.5} dash="5 4" fill="color-mix(in srgb, var(--viz-ink) 6%, transparent)" />
        {nn.map((i) => (
          <Path key={i} points={[q, [TRAIN[i][0], TRAIN[i][1]]]} color={CLS_C[TRAIN[i][2]]} width={2} />
        ))}
        <Dots points={dots} />
        <Dots points={nn.map((i) => ({ x: TRAIN[i][0], y: TRAIN[i][1], r: 9, hollow: true, color: 'var(--viz-ink)' }))} />
        <Dots points={dots.filter((_, i) => nn.includes(i))} />
        <DraggablePoint x={q[0]} y={q[1]} r={10} color={CLS_C[pred]} onChange={(x, y) => setQ([snap(x), snap(y)])} label="new point" />
      </Plot>
      <div aria-live="polite" style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>
        <span style={{ color: CLS_C[0] }}>{orange} orange</span> vs <span style={{ color: CLS_C[1] }}>{blue} blue</span> → predict{' '}
        <span style={{ color: CLS_C[pred] }}>{CLS_NAME[pred]}</span>
        <span style={{ fontWeight: 400, color: 'var(--ink-2)' }}>
          {' '}
          · {k === 1 ? `nearest neighbour is ${radius.toFixed(2)} away` : `all ${k} lie within ${radius.toFixed(2)}`}
        </span>
      </div>
      <Controls>
        <Slider label={<>number of neighbours <i>k</i></>} value={k} min={1} max={25} step={2} onChange={setK} />
        <Segmented
          label="distance"
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'euclidean', label: 'Euclidean' },
            { value: 'manhattan', label: 'Manhattan' },
          ]}
        />
        <Toggle label="Colour the map by the vote" checked={shade} onChange={setShade} />
      </Controls>
      <div style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: 2 }}>
        <div style={{ fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)' }}>Accuracy for every odd k (tap to choose k)</div>
        <Plot
          x={[0, 26]}
          y={[0.7, 1.02]}
          width={460}
          height={190}
          maxWidth={500}
          minHeight={170}
          margin={{ left: 44, bottom: 32, right: 70, top: 12 }}
          ariaLabel={`Accuracy against k. At k = ${k}: training accuracy ${pct(curves.train[ki])}, test accuracy ${pct(curves.test[ki])}.`}
          onPointerDown={(p) => setK(Math.max(1, Math.min(25, 2 * Math.round((p[0] - 1) / 2) + 1)))}
        >
          <Grid xTicks={13} yTicks={6} />
          <Axes xLabel="k" xTicks={6} yTicks={3} tickFormat={(v) => (Number.isInteger(v) && v !== 1 ? String(v) : `${Math.round(v * 100)}%`)} />
          <VLine x={k} color="var(--viz-4)" dash="4 3" width={2} />
          <Path points={KS.map((kk, i) => [kk, curves.train[i]] as [number, number])} color="var(--viz-muted)" width={2.5} dash="6 4" />
          <Path points={KS.map((kk, i) => [kk, curves.test[i]] as [number, number])} color="var(--viz-3)" width={3} />
          <Dots
            points={[
              { x: k, y: curves.train[ki], r: 5, color: 'var(--viz-muted)' },
              { x: k, y: curves.test[ki], r: 6, color: 'var(--viz-3)' },
            ]}
          />
          <Label x={25} y={labelY.train} dx={8} dy={4} color="var(--viz-muted)" weight={700}>
            training
          </Label>
          <Label x={25} y={labelY.test} dx={8} dy={4} color="var(--viz-3)" weight={700}>
            test
          </Label>
        </Plot>
        <div className="tabular" style={{ fontSize: '0.88rem', color: 'var(--ink-2)', textAlign: 'center' }}>
          k = {k}: training <b style={{ color: 'var(--ink)' }}>{pct(curves.train[ki])}</b> · test on 400 new points{' '}
          <b style={{ color: 'var(--viz-3)' }}>{pct(curves.test[ki])}</b>
        </div>
      </div>
    </Figure>
  )
}
