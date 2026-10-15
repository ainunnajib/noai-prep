import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Button, Plot, Grid, Axes, Path, Arrow, Label, Dots, usePlot, usePlayer, PlayerControls, useBump, mulberry32 } from '../../../../../kit'
import { blobs, kmeansHistory, kmeansBest, kmeansPPInit, randomInit, voronoiCells, assign, clusterColour, tint, fmt, type Pt, type KStep } from './clustering'
import { Poly, PointCloud, CentroidHandle, Note } from './parts'

/*
  K-means, one half-step at a time. 48 points in three blobs; three draggable starting centroids.
  Every frame shows: the Voronoi regions of the current centroids (where each centroid "wins"),
  the points coloured by their current assignment, and the inertia so far.
  After an update step, points that now sit in another centroid's region are ringed: they will
  switch at the next assign step.
*/

const X: [number, number] = [0, 10]
const Y: [number, number] = [0, 8]
const DATA = blobs(
  [
    [2.3, 5.8],
    [7.6, 6.2],
    [5.4, 2.0],
  ],
  16,
  0.75,
  7,
).points
const K = 3
const CORNERS: Pt[] = [
  [0.6, 0.8],
  [9.4, 0.8],
  [5.0, 7.6],
]
const BAD: Pt[] = [
  [1.0, 7.6],
  [2.6, 7.4],
  [9.4, 3.4],
]
const BEST = kmeansBest(DATA, K, 3, 12).inertia

function stepName(s: KStep, i: number) {
  if (s.kind === 'start') return 'Start: centroids placed'
  const it = Math.ceil(i / 2)
  if (s.kind === 'assign') return `Assign (round ${it})`
  return `Update (round ${it})`
}

function InertiaChart({ hist, step }: { hist: KStep[]; step: number }) {
  const vals = hist.map((h) => h.inertia)
  const top = Math.max(...vals.map((v) => v ?? 0)) * 1.08
  const n = hist.length - 1
  const pts: [number, number][] = []
  for (let i = 1; i <= step; i++) pts.push([i, vals[i]!])
  return (
    <Plot x={[0.5, Math.max(n, 4) + 0.5]} y={[0, top]} width={480} height={160} minHeight={150} margin={{ left: 46, bottom: 26, top: 12 }} ariaLabel={`Inertia after each half-step: ${pts.map((p) => fmt(p[1])).join(', ')}`}>
      <Grid xTicks={Math.min(n, 12)} yTicks={3} />
      <Axes xTicks={Math.min(n, 12)} yTicks={3} tickFormat={(v) => (Number.isInteger(v) ? String(v) : '')} />
      <Path points={[[0.5, BEST], [Math.max(n, 4) + 0.5, BEST]]} color="var(--viz-pos)" width={1.5} dash="5 4" />
      <Label x={Math.max(n, 4) + 0.4} y={BEST} dy={-5} anchor="end" color="var(--viz-pos)" size={11}>
        best possible ≈ {fmt(BEST)}
      </Label>
      {pts.length > 1 && <Path points={pts} color="var(--viz-1)" width={2.5} />}
      <StepDots pts={pts} hist={hist} />
      {step === 0 && (
        <Label x={(Math.max(n, 4) + 1) / 2} y={top * 0.45} anchor="middle" color="var(--viz-muted)" size={12}>
          Press Next: a dot appears after each step
        </Label>
      )}
    </Plot>
  )
}

function StepDots({ pts, hist }: { pts: [number, number][]; hist: KStep[] }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {pts.map(([i, v]) => (
        <circle
          key={i}
          cx={xs(i)}
          cy={ys(v)}
          r={i === pts.length ? 5.5 : 4}
          style={{ fill: hist[i].kind === 'assign' ? 'var(--viz-1)' : 'var(--surface)', stroke: 'var(--viz-1)', strokeWidth: 2 }}
        />
      ))}
    </g>
  )
}

export default function KMeansStepper() {
  const [init, setInit] = useState<Pt[]>(CORNERS)
  const [seed, bump] = useBump()
  const hist = useMemo(() => kmeansHistory(DATA, init), [init])
  const player = usePlayer({ steps: hist.length, interval: 1100 })
  const step = Math.min(player.step, hist.length - 1)
  const s = hist[step]
  const cells = useMemo(() => voronoiCells(s.centroids, [X[0], X[1], Y[0], Y[1]]), [s.centroids])
  const done = step === hist.length - 1

  // after an update, which points now lie nearer to another centroid? (they switch next)
  const willSwitch = useMemo(() => {
    if (s.kind !== 'update' || !s.labels) return new Set<number>()
    const nearest = assign(DATA, s.centroids)
    return new Set(nearest.map((l, i) => (l !== s.labels![i] ? i : -1)).filter((i) => i >= 0))
  }, [s])

  const restart = (c: Pt[]) => {
    setInit(c)
    player.reset()
  }
  const drag = (j: number, x: number, y: number) => {
    const c = s.centroids.map((p) => [p[0], p[1]] as Pt)
    c[j] = [x, y]
    restart(c)
  }

  const final = hist[hist.length - 1].inertia ?? 0
  const stuck = final > BEST * 1.05

  let status: React.ReactNode
  if (s.kind === 'start') status = <>Three centroids (the ringed crosses) are placed. The tinted regions show which centroid is nearest to each spot. Press Next to assign the points.</>
  else if (s.kind === 'assign')
    status = done ? (
      <>
        <b>Converged.</b> This assign step changed nothing, so the centroids will not move again. Final inertia {fmt(final)}
        {stuck ? <>, far above the best possible ≈ {fmt(BEST)}: K-means is stuck in a poor solution.</> : <>: the best possible clustering.</>}
      </>
    ) : (
      <>Each point joins its nearest centroid (it takes the colour of the region it sits in). {s.changed} point{s.changed === 1 ? '' : 's'} changed colour.</>
    )
  else
    status = (
      <>
        Each centroid jumps to the mean of its points (arrows).{' '}
        {willSwitch.size ? <>{willSwitch.size} ringed point{willSwitch.size === 1 ? ' now sits' : 's now sit'} in another colour's region and will switch next.</> : <>No point is in the wrong region, so the next assign step will change nothing.</>}
      </>
    )

  return (
    <Figure
      title="K-means: assign, then update"
      caption={
        <>
          Press <b>Next</b> (or Play) to alternate the two steps and watch the inertia chart: it can only go down or stay flat. Drag any centroid to choose a
          new start. Then press <b>Bad start</b>: two centroids share the left blob, and K-means converges to a clustering with about four times the best
          inertia, because neither step can ever move a centroid out of its trap. <b>k-means++ start</b> spreads the first centroids out and almost always
          avoids this.
        </>
      }
    >
      <Plot x={X} y={Y} width={480} height={384} maxWidth={560} ariaLabel={`${stepName(s, step)}. ${DATA.length} points, three centroids; inertia ${s.inertia == null ? 'not yet defined' : fmt(s.inertia)}`}>
        {cells.map((poly, j) => (
          <Poly key={j} points={poly} fill={tint(j, s.labels ? 16 : 10)} stroke="var(--surface)" width={3} />
        ))}
        <Grid xTicks={10} yTicks={8} />
        <Axes xLabel="feature 1" yLabel="feature 2" xTicks={5} yTicks={4} />
        <PointCloud points={DATA} colours={(i) => (s.labels ? clusterColour(s.labels[i]) : 'var(--viz-muted)')} ring={willSwitch} />
        {s.kind === 'update' &&
          s.from &&
          s.from.map((f, j) => (
            <g key={`a${j}`}>
              <Dots points={[{ x: f[0], y: f[1], hollow: true, color: clusterColour(j), r: 7 }]} />
              <Arrow from={f} to={s.centroids[j]} color="var(--viz-ink)" width={2} dash="5 3" head={8} />
            </g>
          ))}
        {s.centroids.map((c, j) => (
          <CentroidHandle key={j} x={c[0]} y={c[1]} colour={clusterColour(j)} label={`Centroid ${j + 1}: drag to set a new start`} onChange={(x, y) => drag(j, x, y)} />
        ))}
      </Plot>
      <Note>{status}</Note>
      <div style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }}>Inertia after each half-step (filled dots: assign, hollow: update)</div>
        <InertiaChart hist={hist} step={step} />
      </div>
      <Readout
        items={[
          ['step', stepName(s, step)],
          ['inertia', s.inertia == null ? '—' : fmt(s.inertia)],
          ['best possible', `≈ ${fmt(BEST)}`],
        ]}
      />
      <PlayerControls player={player} label={(i) => `half-step ${i} of ${hist.length - 1}`} />
      <Controls>
        <Button onClick={() => restart(CORNERS)}>Corner start</Button>
        <Button onClick={() => restart(BAD)}>Bad start</Button>
        <Button
          onClick={() => {
            bump()
            restart(randomInit(DATA, K, mulberry32(101 + seed)))
          }}
        >
          Random start
        </Button>
        <Button
          primary
          onClick={() => {
            bump()
            restart(kmeansPPInit(DATA, K, mulberry32(202 + seed)))
          }}
        >
          k-means++ start
        </Button>
      </Controls>
    </Figure>
  )
}
