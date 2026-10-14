import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Button, Plot, Grid, Axes, Path, Dots, Rect, VLine, Label, usePlot, useBump, useNarrow, M } from '../../../../../kit'
import { uniformMatrix } from './maths'

/*
  Distances concentrate. 200 random points and one random query point in [0, 1]^d.
  Top: one tick per point at its distance from the query (5 nearest in orange).
  Middle: histogram of those distances; the axis always runs from 0 to the farthest point.
  Bottom: nearest ÷ farthest for every d, so you can see it creep towards 1.
*/

const N = 200
const DIMS = [2, 3, 5, 10, 20, 50, 100, 200, 500, 1000]
const DMAX = 1000
const BINS = 24
const K = 5

const small: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }

/** Squared distances of every point from the query, recorded at each dimension in DIMS. */
function distancesByDim(X: Float64Array): number[][] {
  const q = 0 // row 0 is the query point
  const out: number[][] = DIMS.map(() => new Array<number>(N).fill(0))
  for (let i = 0; i < N; i++) {
    const row = (i + 1) * DMAX
    let acc = 0
    let k = 0
    for (let j = 0; j < DMAX; j++) {
      const diff = X[row + j] - X[q * DMAX + j]
      acc += diff * diff
      if (j + 1 === DIMS[k]) {
        out[k][i] = Math.sqrt(acc)
        k++
      }
    }
  }
  return out
}

function LogXTicks({ values }: { values: number[] }) {
  const { xs, ys } = usePlot()
  const y0 = ys.range()[0]
  return (
    <g className="plot-axes">
      {values.map((v) => (
        <g key={v} transform={`translate(${xs(Math.log10(v))},${y0})`}>
          <line y2={5} />
          <text y={17} textAnchor="middle">
            {v}
          </text>
        </g>
      ))}
    </g>
  )
}

export default function DistanceConcentration() {
  const [k, setK] = useState(0)
  const [seed, bump] = useBump()
  const [ref, narrow] = useNarrow<HTMLDivElement>()
  const X = useMemo(() => uniformMatrix(4100 + seed, N + 1, DMAX), [seed])
  const all = useMemo(() => distancesByDim(X), [X])
  const d = DIMS[k]
  const dist = all[k]

  const stats = useMemo(() => {
    const sorted = [...dist].sort((a, b) => a - b)
    const lo = sorted[0]
    const hi = sorted[N - 1]
    const mean = dist.reduce((s, v) => s + v, 0) / N
    const sd = Math.sqrt(dist.reduce((s, v) => s + (v - mean) ** 2, 0) / N)
    const counts = new Array<number>(BINS).fill(0)
    for (const v of dist) counts[Math.min(BINS - 1, Math.floor((v / hi) * BINS))]++
    return { lo, hi, mean, sd, counts, kth: sorted[K - 1] }
  }, [dist])

  const ratios = all.map((ds) => Math.min(...ds) / Math.max(...ds))
  const ratio = ratios[k]
  const xMax = stats.hi * 1.03
  const top = Math.max(...stats.counts) * 1.18
  const binW = stats.hi / BINS
  const nearLeft = stats.lo / stats.hi < 0.5

  return (
    <Figure
      title="Is the nearest point really near?"
      caption={
        <>
          200 random points and one query point, all with <M>d</M> features between 0 and 1. The top strip has one tick per point at its
          distance from the query; the 5 nearest (the ones k-NN would use) are orange. The axis always runs from 0 to the farthest point. Slide{' '}
          <M>d</M> up: the distances pile up in a narrow band, and the nearest point ends up almost as far away as the farthest.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gap: '0.2rem', justifyItems: 'center' }}>
        <div style={small}>Distances from the query point, d = {d}</div>
        <Plot x={[0, xMax]} y={[0, 1]} width={520} height={46} minHeight={40} maxWidth={640} margin={{ top: 4, bottom: 4, left: 40, right: 16 }} ariaLabel={`Distances of 200 points from the query in ${d} dimensions`}>
          <Rect x0={0} x1={xMax} y0={0} y1={1} fill="var(--surface-2)" />
          {dist.map((v, i) => {
            const near = v <= stats.kth
            return <Path key={i} points={[[v, near ? 0.05 : 0.22], [v, near ? 0.95 : 0.78]]} color={near ? 'var(--viz-2)' : 'var(--viz-1)'} width={near ? 2.4 : 1.2} opacity={near ? 1 : 0.55} />
          })}
        </Plot>
        <Plot x={[0, xMax]} y={[0, top]} width={520} height={220} minHeight={210} maxWidth={640} margin={{ top: 24, bottom: 34, left: 40, right: 16 }} ariaLabel={`Histogram of distances: nearest ${stats.lo.toFixed(2)}, farthest ${stats.hi.toFixed(2)}`}>
          <Grid xTicks={6} yTicks={4} />
          {stats.counts.map((c, i) =>
            c > 0 ? <Rect key={i} x0={i * binW + binW * 0.06} x1={(i + 1) * binW - binW * 0.06} y0={0} y1={c} fill="color-mix(in srgb, var(--viz-1) 55%, var(--surface))" /> : null,
          )}
          <Axes xLabel="distance from query" yLabel="points" xTicks={6} yTicks={4} />
          <VLine x={stats.lo} color="var(--viz-2)" dash="5 3" width={2} />
          <VLine x={stats.hi} color="var(--viz-neg)" dash="5 3" width={2} />
          <Label x={stats.lo} y={top} dx={nearLeft ? 5 : -5} dy={14} anchor={nearLeft ? 'start' : 'end'} color="var(--viz-2)" weight={700}>
            {`nearest ${stats.lo.toFixed(2)}`}
          </Label>
          <Label x={nearLeft ? stats.hi : stats.lo} y={top} dx={-5} dy={nearLeft ? 14 : 30} anchor="end" color="var(--viz-neg)" weight={700}>
            {`farthest ${stats.hi.toFixed(2)}`}
          </Label>
        </Plot>
        <div style={{ ...small, marginTop: '0.6rem' }}>Nearest ÷ farthest, for every number of features</div>
        <Plot x={[Math.log10(2) - 0.12, 3.1]} y={[0, 1]} width={520} height={170} minHeight={180} maxWidth={640} margin={{ top: 10, bottom: 34, left: 40, right: 16 }} ariaLabel={`Ratio of nearest to farthest distance rises from ${ratios[0].toFixed(2)} at d = 2 to ${ratios[ratios.length - 1].toFixed(2)} at d = 1000`}>
          <Grid xTicks={1} yTicks={4} />
          <Axes xLabel="d (log scale)" yTicks={4} hideXTicks />
          <LogXTicks values={narrow ? [2, 10, 100, 1000] : [2, 5, 10, 20, 50, 100, 200, 500, 1000]} />
          <Path points={DIMS.map((dd, i) => [Math.log10(dd), ratios[i]])} color="var(--viz-1)" width={2.5} />
          <Dots points={DIMS.map((dd, i) => ({ x: Math.log10(dd), y: ratios[i], r: i === k ? 7 : 3.5, color: i === k ? 'var(--viz-2)' : 'var(--viz-1)' }))} />
          <Label x={Math.log10(d)} y={ratio} dx={k > 6 ? -10 : 6} dy={-12} anchor={k > 6 ? 'end' : 'start'} color="var(--viz-2)" weight={700}>
            {ratio.toFixed(2)}
          </Label>
        </Plot>
      </div>
      <Controls>
        <Slider label="number of features d" value={k} min={0} max={DIMS.length - 1} step={1} onChange={setK} format={(i) => DIMS[i]} />
        <Button onClick={bump}>New random points</Button>
      </Controls>
      <Readout
        items={[
          ['nearest', stats.lo.toFixed(2)],
          ['farthest', stats.hi.toFixed(2)],
          ['nearest ÷ farthest', ratio.toFixed(2)],
          ['typical distance', `${stats.mean.toFixed(2)} ± ${stats.sd.toFixed(2)}`],
        ]}
      />
    </Figure>
  )
}
