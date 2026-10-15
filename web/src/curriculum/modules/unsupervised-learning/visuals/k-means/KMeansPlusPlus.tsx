import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Button, Toggle, Plot, Grid, Axes, Path, Label, Bars, usePlot, mulberry32, M } from '../../../../../kit'
import { blobs, sqDist, clusterColour, type Pt } from './clustering'
import { CentroidHandle, Note } from './parts'

/*
  k-means++ seeding, one centre at a time. Each point is drawn with AREA proportional to its chance (above a 1.5 px floor)
  of becoming the next centre, P(x) = D(x)^2 / sum D^2, where D(x) is the distance to the nearest
  centre chosen so far. The bars compare, blob by blob, the k-means++ chance with a uniform pick.
*/

const X: [number, number] = [0, 10]
const Y: [number, number] = [0, 8]
const CENTRES: Pt[] = [
  [2.2, 5.9],
  [7.9, 6.3],
  [2.7, 1.8],
  [7.5, 2.0],
]
const COUNTS = [18, 10, 8, 12]
const D = blobs(CENTRES, COUNTS, 0.5, 21)
const NAMES = ['A', 'B', 'C', 'D']
const K = 4

/** the sequence of point indices k-means++ picks for a given seed */
function ppSequence(seed: number): number[] {
  const rng = mulberry32(seed)
  const seq = [Math.floor(rng() * D.points.length)]
  while (seq.length < K) {
    const d2 = D.points.map((p) => Math.min(...seq.map((i) => sqDist(p, D.points[i]))))
    const total = d2.reduce((a, b) => a + b, 0)
    let r = rng() * total
    let idx = 0
    for (; idx < d2.length - 1; idx++) {
      r -= d2[idx]
      if (r <= 0) break
    }
    seq.push(idx)
  }
  return seq
}

/** how often a whole seeding gives every blob exactly one centre: k-means++ versus a uniform random pick */
function successRates(trials = 1000) {
  let pp = 0
  let uni = 0
  const rng = mulberry32(777)
  for (let t = 0; t < trials; t++) {
    if (new Set(ppSequence(1000 + t).map((i) => D.truth[i])).size === K) pp++
    const idx = D.points.map((_, i) => i)
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    if (new Set(idx.slice(0, K).map((i) => D.truth[i])).size === K) uni++
  }
  return { pp: pp / trials, uni: uni / trials }
}
const RATES = successRates()

function DistanceLines({ chosen }: { chosen: number[] }) {
  return (
    <g>
      {D.points.map((p, i) => {
        let best = chosen[0]
        chosen.forEach((c) => {
          if (sqDist(p, D.points[c]) < sqDist(p, D.points[best])) best = c
        })
        return <Path key={i} points={[p, D.points[best]]} color="var(--viz-muted)" width={1} opacity={0.55} />
      })}
    </g>
  )
}

function ProbDots({ probs, chosen }: { probs: number[]; chosen: Set<number> }) {
  const { xs, ys } = usePlot()
  const pmax = Math.max(...probs, 1e-9)
  return (
    <g>
      {D.points.map((p, i) => {
        if (chosen.has(i)) return null
        // area proportional to the chance (radius ∝ √p), with a tiny floor so zero-chance points stay visible
        const r = Math.max(1.5, 11 * Math.sqrt(probs[i] / pmax))
        return (
          <circle
            key={i}
            cx={xs(p[0])}
            cy={ys(p[1])}
            r={r}
            style={{ fill: `color-mix(in srgb, ${clusterColour(D.truth[i])} 75%, var(--surface))`, stroke: 'var(--surface)', strokeWidth: 1 }}
          />
        )
      })}
    </g>
  )
}

export default function KMeansPlusPlus() {
  const [seed, setSeed] = useState(7)
  const [count, setCount] = useState(1)
  const [lines, setLines] = useState(true)
  const seq = useMemo(() => ppSequence(seed), [seed])
  const chosen = seq.slice(0, count)
  const chosenSet = new Set(chosen)

  const d2 = D.points.map((p) => Math.min(...chosen.map((c) => sqDist(p, D.points[c]))))
  const total = d2.reduce((a, b) => a + b, 0)
  const probs = d2.map((v) => (total > 0 ? v / total : 0))
  const claimed = new Set(chosen.map((c) => D.truth[c]))
  const perBlob = NAMES.map((_, g) => probs.reduce((s, p, i) => s + (D.truth[i] === g ? p : 0), 0))
  const uniformPool = D.points.length - count
  const perBlobUniform = NAMES.map((_, g) => D.truth.filter((t, i) => t === g && !chosenSet.has(i)).length / uniformPool)
  const ppEmpty = perBlob.reduce((s, p, g) => s + (claimed.has(g) ? 0 : p), 0)
  const uniEmpty = perBlobUniform.reduce((s, p, g) => s + (claimed.has(g) ? 0 : p), 0)
  const finished = count === K
  const pct = (v: number) => `${Math.round(v * 100)}%`

  return (
    <Figure
      title="k-means++: spread the starting centroids out"
      caption={
        <>
          The first centroid is a random data point. Every other point is drawn with an <b>area proportional to its chance</b> of being picked next,{' '}
          <M>{'P(x) = D(x)^2 / \\sum D^2'}</M>, where <M>D(x)</M> is the length of its grey line to the nearest centroid already chosen. Press{' '}
          <b>Pick next centroid</b> and notice that points in blobs without a centroid are by far the likeliest picks; the bars compare this with picking
          uniformly at random. Press <b>New first centroid</b> to try again.
        </>
      }
    >
      <Plot x={X} y={Y} width={480} height={384} maxWidth={560} ariaLabel={`${count} of ${K} centroids chosen; chance that the next one lands in a blob without a centroid: ${pct(ppEmpty)}`}>
        <Grid xTicks={10} yTicks={8} />
        <Axes xLabel="feature 1" yLabel="feature 2" xTicks={5} yTicks={4} />
        {lines && !finished && <DistanceLines chosen={chosen} />}
        <ProbDots probs={finished ? D.points.map(() => 0.02) : probs} chosen={chosenSet} />
        {CENTRES.map((c, g) => (
          <Label key={g} x={c[0]} y={c[1] + 1.35} anchor="middle" size={13} weight={700} color={clusterColour(g)}>
            {`blob ${NAMES[g]}`}
          </Label>
        ))}
        {chosen.map((c, j) => (
          <CentroidHandle key={j} x={D.points[c][0]} y={D.points[c][1]} colour="var(--viz-ink)" label={`centroid ${j + 1}`} r={8} />
        ))}
        {chosen.map((c, j) => (
          <Label key={`l${j}`} x={D.points[c][0]} y={D.points[c][1]} dx={13} dy={-11} size={12} weight={700}>
            {String(j + 1)}
          </Label>
        ))}
      </Plot>
      {!finished ? (
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.35rem' }}>Chance that centroid {count + 1} lands in each blob (k-means++)</div>
          <Bars
            ariaLabel="Probability that each blob receives the next centroid under k-means++"
            max={1}
            format={pct}
            data={NAMES.map((n, g) => ({
              label: `blob ${n}${claimed.has(g) ? ' (has one)' : ''}`,
              value: perBlob[g],
              color: claimed.has(g) ? `color-mix(in srgb, ${clusterColour(g)} 35%, var(--surface))` : clusterColour(g),
              strong: !claimed.has(g),
            }))}
          />
        </div>
      ) : (
        <Note>
          {claimed.size === K
            ? 'All four centroids are chosen and every blob got exactly one, so k-means starts from a good place.'
            : `All four centroids are chosen, but only ${claimed.size} of the 4 blobs got one this time.`}{' '}
          Over 1000 tries on this data, k-means++ gives every blob a centroid {pct(RATES.pp)} of the time; picking 4 points uniformly at random
          manages it only {pct(RATES.uni)} of the time. Because it can still fail, run several starts and keep the best: in scikit-learn pass <code>n_init=10</code> (since version 1.4
          its default, <code>n_init='auto'</code>, runs k-means++ only once).
        </Note>
      )}
      <Readout
        items={[
          ['centroids chosen', `${count} of ${K}`],
          ['next lands in an empty blob: k-means++', finished ? '—' : pct(ppEmpty)],
          ['uniform random', finished ? '—' : pct(uniEmpty)],
        ]}
      />
      <Controls>
        <Button primary onClick={() => setCount((c) => Math.min(K, c + 1))} disabled={finished}>
          Pick next centroid
        </Button>
        <Button
          onClick={() => {
            setSeed((s) => s + 1)
            setCount(1)
          }}
        >
          New first centroid
        </Button>
        <Toggle label="Show distances D(x)" checked={lines} onChange={setLines} />
      </Controls>
    </Figure>
  )
}
