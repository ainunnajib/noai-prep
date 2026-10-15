import { useMemo, useRef, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Axes, VLine, Label, Bars, usePlot, useNarrow, M } from '../../../../../kit'
import { rings, moons, dist, kmeansBest, matchedAccuracy, clusterColour, type Pt, type Dataset } from '../k-means/clustering'
import { DataCircle, Note } from '../k-means/parts'
import { laplacian, components, spectrum, twoMeansThreshold } from './graphs'

/*
  Spectral clustering on two rings (or two moons).
  1. Similarity graph: connect two points when they are closer than r (weight 1, otherwise 0).
  2. Laplacian L = D - W; its eigenvalues (smallest six shown) and the Fiedler vector (2nd eigenvector).
  3. Every point gets one number, its entry in the Fiedler vector (the middle panel); a 1-D K-means
     split of those numbers gives the two clusters.
  Eigen-decompositions were checked against numpy.linalg.eigh.
*/

type Key = 'rings' | 'moons'
const DATA: Record<Key, { label: string; d: Dataset; rows: [string, string]; r: number }> = {
  rings: { label: 'Two rings', d: rings([30, 50], [1.0, 2.4], 0.08, 51, [0, 0]), rows: ['inner ring', 'outer ring'], r: 0.6 },
  moons: { label: 'Two moons', d: moons(40, 0.06, 52, 2, [-1, -0.5]), rows: ['upper moon', 'lower moon'], r: 0.7 },
}
const B: [number, number] = [-3.3, 3.3]

interface Result {
  edges: [number, number][]
  pieces: number
  values: number[]
  fiedler: number[]
  threshold: number
  labels: number[]
  acc: number
}

function analyse(d: Dataset, r: number): Result {
  const P = d.points
  const W = P.map((p, i) => P.map((q, j) => (i !== j && dist(p, q) < r ? 1 : 0)))
  const edges: [number, number][] = []
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) if (W[i][j]) edges.push([i, j])
  const pieces = new Set(components(W)).size
  const s = spectrum(laplacian(W))
  const threshold = twoMeansThreshold(s.fiedler)
  const labels = s.fiedler.map((v) => (v > threshold ? 0 : 1))
  return { edges, pieces, values: s.values, fiedler: s.fiedler, threshold, labels, acc: matchedAccuracy(d.truth, labels) }
}

function Edges({ P, edges }: { P: Pt[]; edges: [number, number][] }) {
  const { xs, ys } = usePlot()
  const d = edges.map(([i, j]) => `M${xs(P[i][0]).toFixed(1)},${ys(P[i][1]).toFixed(1)}L${xs(P[j][0]).toFixed(1)},${ys(P[j][1]).toFixed(1)}`).join('')
  return <path d={d} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.3, opacity: 0.7, fill: 'none' }} />
}

function Points({ P, colours, r = 4.5 }: { P: Pt[]; colours: (i: number) => string; r?: number }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {P.map((p, i) => (
        <circle key={i} cx={xs(p[0])} cy={ys(p[1])} r={r} style={{ fill: colours(i), stroke: 'var(--surface)', strokeWidth: 1.2 }} />
      ))}
    </g>
  )
}

export default function SpectralGraph() {
  const [which, setWhich] = useState<Key>('rings')
  const [r, setR] = useState(DATA.rings.r)
  const [colourBy, setColourBy] = useState<'spectral' | 'kmeans'>('spectral')
  const [ref, narrow] = useNarrow<HTMLDivElement>(640)
  const cache = useRef(new Map<string, Result>())
  const { d, rows } = DATA[which]
  const key = `${which}:${r.toFixed(2)}`
  let res = cache.current.get(key)
  if (!res) {
    res = analyse(d, r)
    cache.current.set(key, res)
  }
  const km = useMemo(() => kmeansBest(d.points, 2, 4, 8), [d])
  const kmAcc = matchedAccuracy(d.truth, km.labels)
  const labels = colourBy === 'spectral' ? res.labels : km.labels

  const zeros = res.values.filter((v) => v < 1e-6).length
  const lam2 = res.values[1]
  let story: string
  if (res.pieces > 2)
    story = `The graph has fallen apart into ${res.pieces} separate pieces, so L has ${res.pieces} zero eigenvalues. Any mix of their eigenvectors is equally "smooth", so the second eigenvector is an arbitrary choice and the split is unreliable. Increase r.`
  else if (res.pieces === 2)
    story = `Exactly two separate pieces: λ₂ = 0, and the Fiedler vector takes one constant value on each piece, so the split is perfect.`
  else if (res.acc > 0.95)
    story = `One connected graph, but with only a few edges between the two groups, so λ₂ = ${lam2.toFixed(3)} is small and the Fiedler vector still separates them.`
  else
    story = `r is so large that edges jump between the groups: the graph has no clear weak spot left, λ₂ = ${lam2.toFixed(2)} is large, and the split ${res.acc < 0.7 ? 'no longer follows the two groups' : 'starts to cut across them'}.`

  const lo = Math.min(...res.fiedler)
  const hi = Math.max(...res.fiedler)
  const pad = Math.max(0.02, (hi - lo) * 0.08)

  const main = (
    <Plot x={B} y={B} width={340} height={340} maxWidth={440} margin={{ left: 10, right: 10, top: 10, bottom: 10 }} ariaLabel={`${DATA[which].label}: similarity graph with r = ${r.toFixed(2)}, ${res.edges.length} edges, ${res.pieces} connected pieces; coloured by ${colourBy === 'spectral' ? 'spectral clustering' : 'K-means'}`}>
      <Axes hideXTicks hideYTicks />
      <Edges P={d.points} edges={res.edges} />
      <DataCircle c={d.points[0]} r={r} stroke="var(--viz-ink)" dash="4 3" width={1.4} />
      <Points P={d.points} colours={(i) => clusterColour(labels[i])} />
      <Label x={d.points[0][0]} y={d.points[0][1] + r} dy={-5} anchor="middle" size={11} weight={700}>
        reach r
      </Label>
    </Plot>
  )

  const strip = (
    <Plot x={[lo - pad, hi + pad]} y={[-0.55, 1.85]} width={340} height={170} maxWidth={440} margin={{ left: 10, right: 10, top: 10, bottom: 34 }} ariaLabel={`Each point placed at its value in the Fiedler vector; ${rows[0]} on the top row, ${rows[1]} on the bottom row`}>
      <Axes xLabel="value in the Fiedler vector" hideYTicks xTicks={4} tickFormat={(v) => v.toFixed(2)} />
      <VLine x={res.threshold} color="var(--viz-ink)" dash="5 4" width={1.5} />
      <Points P={res.fiedler.map((v, i) => [v, (d.truth[i] === 0 ? 1 : 0) + ((i * 37) % 11) / 16 - 0.31] as Pt)} colours={(i) => clusterColour(res!.labels[i])} r={4} />
      <Label x={lo - pad} y={1.6} dx={4} size={11} weight={700}>
        {rows[0]}
      </Label>
      <Label x={lo - pad} y={0.6} dx={4} size={11} weight={700}>
        {rows[1]}
      </Label>
    </Plot>
  )

  const bars = (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.3rem' }}>Smallest eigenvalues of L</div>
      <Bars
        ariaLabel="The six smallest eigenvalues of the graph Laplacian"
        max={Math.max(0.05, res.values[5])}
        format={(v) => v.toFixed(3)}
        data={res.values.slice(0, 6).map((v, k) => ({
          label: `λ${'₁₂₃₄₅₆'[k]}${v < 1e-6 ? ' = 0' : ''}`,
          value: Math.max(v, 0),
          color: v < 1e-6 ? 'var(--viz-pos)' : 'var(--viz-1)',
          strong: v < 1e-6,
        }))}
      />
    </div>
  )

  return (
    <Figure
      wide
      title="Spectral clustering: cluster the graph, not the points"
      caption={
        <>
          Two points are joined by an edge when they are closer than <M>r</M> (the dashed circle shows the reach of one point). Spectral clustering
          gives every point one number, its entry in the second eigenvector of the graph Laplacian (middle panel), and splits those numbers in two.
          Slide <M>r</M>: too small and the graph shatters into pieces (count the zero eigenvalues); in a wide middle range the two rings are two
          clean groups; too large and edges jump between the rings. Then colour by K-means to compare.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <div style={{ display: 'grid', justifyItems: 'center', minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }}>1. The similarity graph</div>
          {main}
        </div>
        <div style={{ display: 'grid', justifyItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }}>2. One number per point (the Fiedler vector)</div>
          {strip}
          {bars}
        </div>
      </div>
      <Note>{colourBy === 'kmeans' ? `K-means on the raw coordinates: it ignores the graph and cuts the picture in two (${Math.round(kmAcc * 100)}% grouped correctly).` : story}</Note>
      <Readout
        items={[
          ['edges', String(res.edges.length)],
          ['separate pieces', String(res.pieces)],
          ['zero eigenvalues', String(zeros)],
          ['spectral: grouped correctly', res.pieces > 2 ? '— (graph in pieces)' : `${Math.round(res.acc * 100)}%`],
        ]}
      />
      <Controls>
        <Slider label="r: connect points closer than" value={r} min={0.2} max={2} step={0.05} onChange={setR} format={(v) => v.toFixed(2)} />
        <Segmented
          label="Data"
          value={which}
          onChange={(v) => {
            setWhich(v)
            setR(DATA[v].r)
          }}
          options={[
            { value: 'rings', label: 'Two rings' },
            { value: 'moons', label: 'Two moons' },
          ]}
        />
        <Segmented
          label="Colour points by"
          value={colourBy}
          onChange={setColourBy}
          options={[
            { value: 'spectral', label: 'Spectral clustering' },
            { value: 'kmeans', label: 'K-means' },
          ]}
        />
      </Controls>
    </Figure>
  )
}
