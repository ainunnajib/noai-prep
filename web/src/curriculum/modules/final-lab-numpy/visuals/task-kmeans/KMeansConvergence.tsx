import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Grid, Axes, Dots, Path, Rect, HLine, Label, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { Note } from '../exam-notebook-skills/nb'
import { pyTuple } from '../exam-notebook-skills/pyfmt'
import { blobs, seededInit, traceKMeans, round4, type Pt } from './km'
import { Star, CLUSTER_COLORS, YTicks } from './parts'

/*
  Concept: convergence, tolerance, empty clusters and seeding.
  42 points in three blobs, k = 3, centroids started at three data points chosen by a seed.
  Step through the iterations, change the stopping tolerance and the seed, and force an empty
  cluster to compare "keep the old centroid" with a naive mean that turns into nan.
*/

const P = blobs()
const MAX_IT = 20
const TOLS = [0, 0.01, 0.1, 0.5]
const LOG_LO = -3
const LOG_HI = 1.2
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³' }
const pow10 = (v: number) => (v === 0 ? '1' : v === 1 ? '10' : `10${String(v).split('').map((c) => SUP[c] ?? c).join('')}`)

export default function KMeansConvergence() {
  const [seed, setSeed] = useState(2)
  const [tol, setTol] = useState(0)
  const [forceEmpty, setForceEmpty] = useState(false)
  const [rule, setRule] = useState<'keep' | 'nan'>('keep')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(700)

  const init = useMemo(() => {
    const c = seededInit(P, 3, seed)
    if (forceEmpty) c[2] = [11.3, 11.3]
    return c
  }, [seed, forceEmpty])
  const frames = useMemo(() => traceKMeans(P, init, MAX_IT, { tol, emptyRule: rule }), [init, tol, rule])
  const player = usePlayer({ steps: frames.length + 1, interval: 900 })
  const t = Math.min(player.step, frames.length)
  const fr = t > 0 ? frames[t - 1] : undefined
  const centroids: Pt[] = fr ? fr.after : init
  const trails = [0, 1, 2].map((i) => [init[i], ...frames.slice(0, t).map((f) => f.after[i])].filter((p) => p.every(Number.isFinite)) as [number, number][])
  const last = frames[frames.length - 1]
  const converged = last.stop
  const maxMove = (f: { moves: number[] }) => (f.moves.some(Number.isNaN) ? NaN : Math.max(...f.moves))
  const finalOut = `[${round4(last.after).map(pyTuple).join(', ')}]`
  const firstEmpty = frames.findIndex((f) => f.empty.length > 0)

  const bars = frames.map((f, k) => {
    const m = maxMove(f)
    const v = Number.isNaN(m) ? LOG_HI : m === 0 ? LOG_LO : Math.max(LOG_LO, Math.min(LOG_HI, Math.log10(m)))
    return { k: k + 1, m, v }
  })

  return (
    <Figure
      title="When to stop, and what to do with an empty cluster"
      caption={
        <>
          Press <strong>Play</strong> to watch the centroids (stars) settle. The bars show how far the furthest centroid moved in each iteration (log scale); the run stops
          at the first bar under the tolerance line, or after {MAX_IT} iterations. Try tolerance 0.5 (it stops early, before the clusters are right), other seeds (some
          starts end in a worse clustering), and <strong>force an empty cluster</strong>, then switch to the naive mean.
        </>
      }
      wide
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem' }}>
        <Controls>
          <Slider label="seed for the starting centroids" value={seed} min={1} max={12} step={1} onChange={(v) => (setSeed(v), player.reset())} />
          <Segmented
            label="tolerance"
            value={tol}
            onChange={(v) => (setTol(v), player.reset())}
            options={TOLS.map((v) => ({ value: v, label: v === 0 ? '0 (no move)' : String(v) }))}
          />
        </Controls>
        <Controls>
          <Toggle label="force an empty cluster (C3 starts far away)" checked={forceEmpty} onChange={(v) => (setForceEmpty(v), player.reset())} />
          <Segmented
            label="empty cluster rule"
            value={rule}
            onChange={(v) => (setRule(v), player.reset())}
            options={[
              { value: 'keep', label: 'keep the old centroid' },
              { value: 'nan', label: 'naive mean' },
            ]}
          />
        </Controls>
        <div style={{ display: 'grid', gap: '0.7rem', width: '100%', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'start' }}>
          <Plot x={[0, 12]} y={[0, 12]} width={360} height={360} ariaLabel={`42 points coloured by cluster after iteration ${t}, with the three centroids`}>
            <Grid xTicks={6} yTicks={6} />
            <Axes xTicks={6} yTicks={6} />
            {trails.map((tr, i) => (
              <Path key={`t${i}`} points={tr} color={CLUSTER_COLORS[i]} width={1.5} dash="3 3" opacity={0.8} />
            ))}
            <Dots points={P.map((p, k) => ({ x: p[0], y: p[1], r: 4.5, color: fr ? CLUSTER_COLORS[fr.labels[k]] : 'var(--viz-muted)' }))} />
            {centroids.map((c, i) => (
              <Star key={i} x={c[0]} y={c[1]} color={CLUSTER_COLORS[i]} r={11} label={`C${i + 1}`} />
            ))}
          </Plot>
          <Plot
            x={[0.4, Math.max(frames.length, 5) + 0.6]}
            y={[LOG_LO, LOG_HI]}
            width={360}
            height={360}
            minHeight={240}
            margin={{ left: 46, bottom: 36, right: 12, top: 14 }}
            ariaLabel="How far the centroids moved in each iteration, on a log scale, with the tolerance line"
          >
            <Grid xTicks={6} yTicks={4} />
            <Axes xLabel="iteration" xTicks={Math.min(10, Math.max(frames.length, 5))} yTicks={4} hideYTicks tickFormat={(v) => String(Math.round(v))} />
            <YTicks values={[-3, -2, -1, 0, 1]} format={pow10} />
            {bars.map((b) => (
              <Rect
                key={b.k}
                x0={b.k - 0.35}
                x1={b.k + 0.35}
                y0={LOG_LO}
                y1={b.m === 0 ? LOG_LO + 0.06 : b.v}
                fill={Number.isNaN(b.m) ? 'var(--viz-neg)' : b.k <= t ? 'var(--viz-1)' : 'color-mix(in srgb, var(--viz-1) 30%, var(--surface))'}
                rx={2}
              />
            ))}
            {bars.map((b) =>
              b.m === 0 ? (
                <Label key={`z${b.k}`} x={b.k} y={LOG_LO} dy={-8} anchor="middle" size={10} color="var(--ink-3)">
                  {converged && b.k === frames.length ? '0: stop' : '0'}
                </Label>
              ) : converged && b.k === frames.length ? (
                <Label key={`s${b.k}`} x={b.k} y={b.v} dy={-7} anchor="middle" size={11} weight={700} color="var(--viz-3)">
                  stop
                </Label>
              ) : Number.isNaN(b.m) && b.k === bars.findIndex((x) => Number.isNaN(x.m)) + 1 ? (
                <Label key={`n${b.k}`} x={b.k} y={LOG_HI} dx={4} dy={12} size={11} color="var(--viz-neg)" weight={700}>
                  nan
                </Label>
              ) : null,
            )}
            {tol > 0 && <HLine y={Math.log10(tol)} color="var(--viz-2)" dash="6 4" width={2} label={`tolerance ${tol}`} />}
          </Plot>
        </div>
        <Readout
          items={[
            ['iteration', t === 0 ? 'start' : `${t} of ${frames.length}`],
            ['furthest move', fr ? (Number.isNaN(maxMove(fr)) ? 'nan' : maxMove(fr).toFixed(4)) : '—'],
            ['stopped by', converged ? `tolerance, after ${frames.length} iterations` : `max_iterations (${MAX_IT})`],
          ]}
        />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', width: '100%', overflowWrap: 'anywhere', textAlign: 'left' }}>
          <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>returns </span>
          {finalOut}
        </div>
        {firstEmpty >= 0 && (
          <Note tone="bad" title={`Empty cluster in iteration ${firstEmpty + 1}.`}>
            {rule === 'keep' ? (
              <>
                C3 started where no point is nearest, so it has no members. Keeping its old position (the exam's suggestion) avoids a crash, but C3 stays empty forever and
                only two real clusters remain. Re-starting it at a random data point is a common alternative.
              </>
            ) : (
              <>
                The mean of no points is <code>nan</code> (NumPy warns "Mean of empty slice"). Every distance to a nan centroid is nan, and <code>np.argmin</code> picks a nan as
                the "smallest", so whole clusters jump around and more centroids turn into nan. The run never converges.
              </>
            )}
          </Note>
        )}
        {firstEmpty < 0 && tol >= 0.5 && converged && frames.length < 4 && (
          <Note title="Stopped early.">A large tolerance stops while the centroids are still moving a little, so the answer is not the converged one. The exam asked for "no significant change": use exact equality or np.allclose.</Note>
        )}
        <PlayerControls player={player} label={(i) => (i === 0 ? 'Start' : `Iteration ${Math.min(i, frames.length)} of ${frames.length}`)} />
      </div>
    </Figure>
  )
}
