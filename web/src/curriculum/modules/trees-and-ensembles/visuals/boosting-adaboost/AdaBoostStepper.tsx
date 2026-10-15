import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Toggle, Plot, Grid, Axes, Path, HLine, usePlot, usePlayer, PlayerControls, useNarrow, M } from '../../../../../kit'
import { RING, NOISY_POINT, adaboost, scoreAt, describe, type Round, type Stump } from './adaboost'
import s from './boosting.module.css'

/*
  AdaBoost round by round on 36 points (orange squares = +1, blue circles = −1).
  Each round has two steps: (1) fit the stump with the smallest WEIGHTED error, (2) re-weight:
  mistakes × e^α, correct points × e^−α, then normalise. Dot AREA is proportional to weight.
  Right panel: the weighted vote sign(Σ α_t h_t(x)) of all stumps so far.
*/

const T = 20
const ORANGE = 'var(--viz-2)'
const BLUE = 'var(--viz-1)'
const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, var(--surface))`

/** dot radius from weight: area ∝ weight, r = 5 px at the starting weight 1/n */
const radius = (w: number, n: number) => Math.max(2.2, Math.min(15, 5 * Math.sqrt(w * n)))

function WeightedPoints({ data, w, ring, noisyIndex }: { data: [number, number, number][]; w: number[]; ring: boolean[]; noisyIndex: number }) {
  const { xs, ys } = usePlot()
  const n = data.length
  // draw big dots first so that small ones stay visible on top
  const order = data.map((_, i) => i).sort((a, b) => w[b] - w[a])
  return (
    <g>
      {order.map((i) => {
        const [a, b, lab] = data[i]
        const cx = xs(a)
        const cy = ys(b)
        const r = radius(w[i], n)
        const fill = lab > 0 ? ORANGE : BLUE
        const body =
          lab > 0 ? (
            <rect x={cx - r * 0.886} y={cy - r * 0.886} width={r * 1.772} height={r * 1.772} style={{ fill, stroke: 'var(--surface)', strokeWidth: 1.2 }} />
          ) : (
            <circle cx={cx} cy={cy} r={r} style={{ fill, stroke: 'var(--surface)', strokeWidth: 1.2 }} />
          )
        return (
          <g key={i}>
            {body}
            {ring[i] && <circle cx={cx} cy={cy} r={r + 4} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2 }} />}
            {i === noisyIndex && (
              <text className="plot-label" x={cx} y={cy + r + 14} textAnchor="middle" style={{ fontSize: 11.5 }}>
                mislabelled
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

/** the two halves of a stump, tinted by the colour each half predicts */
function StumpRegions({ st, faded }: { st: Stump; faded?: boolean }) {
  const { xs, ys } = usePlot()
  const pct = faded ? 9 : 16
  const hi = st.s > 0 ? ORANGE : BLUE // colour predicted where x_f > t
  const lo = st.s > 0 ? BLUE : ORANGE
  const X0 = xs(0)
  const X1 = xs(10)
  const Y0 = ys(0)
  const Y1 = ys(10)
  if (st.f === 0) {
    const xt = xs(st.t)
    return (
      <g aria-hidden="true">
        <rect x={X0} y={Y1} width={xt - X0} height={Y0 - Y1} style={{ fill: tint(lo, pct) }} />
        <rect x={xt} y={Y1} width={X1 - xt} height={Y0 - Y1} style={{ fill: tint(hi, pct) }} />
        <line x1={xt} x2={xt} y1={Y0} y2={Y1} style={{ stroke: 'var(--viz-ink)', strokeWidth: faded ? 1.5 : 2.5, strokeDasharray: faded ? '5 4' : undefined }} />
      </g>
    )
  }
  const yt = ys(st.t)
  return (
    <g aria-hidden="true">
      <rect x={X0} y={yt} width={X1 - X0} height={Y0 - yt} style={{ fill: tint(lo, pct) }} />
      <rect x={X0} y={Y1} width={X1 - X0} height={yt - Y1} style={{ fill: tint(hi, pct) }} />
      <line x1={X0} x2={X1} y1={yt} y2={yt} style={{ stroke: 'var(--viz-ink)', strokeWidth: faded ? 1.5 : 2.5, strokeDasharray: faded ? '5 4' : undefined }} />
    </g>
  )
}

/** the weighted vote of the first k stumps: exact rectangles between the thresholds used so far */
function VoteRegions({ rounds, k }: { rounds: Round[]; k: number }) {
  const { xs, ys } = usePlot()
  const cuts = (f: number) => [0, ...Array.from(new Set(rounds.slice(0, k).filter((r) => r.stump.f === f).map((r) => r.stump.t))).sort((a, b) => a - b), 10]
  const cx = cuts(0)
  const cy = cuts(1)
  const total = rounds.slice(0, k).reduce((a, r) => a + r.alpha, 0)
  const score: number[][] = []
  for (let i = 0; i + 1 < cx.length; i++) {
    score.push([])
    for (let j = 0; j + 1 < cy.length; j++) score[i].push(scoreAt(rounds, k, [(cx[i] + cx[i + 1]) / 2, (cy[j] + cy[j + 1]) / 2]))
  }
  const cells: JSX.Element[] = []
  const edges: JSX.Element[] = []
  for (let i = 0; i + 1 < cx.length; i++)
    for (let j = 0; j + 1 < cy.length; j++) {
      const v = score[i][j]
      const conf = Math.min(1, Math.abs(v) / (0.5 * total))
      cells.push(
        <rect
          key={`c${i}-${j}`}
          x={xs(cx[i])}
          y={ys(cy[j + 1])}
          width={xs(cx[i + 1]) - xs(cx[i]) + 0.5}
          height={ys(cy[j]) - ys(cy[j + 1]) + 0.5}
          style={{ fill: tint(v > 0 ? ORANGE : BLUE, Math.round(10 + 30 * conf)) }}
        />,
      )
      // decision boundary: edges between cells whose vote has a different sign
      if (i + 2 < cx.length && Math.sign(score[i + 1][j]) !== Math.sign(v))
        edges.push(<line key={`v${i}-${j}`} x1={xs(cx[i + 1])} x2={xs(cx[i + 1])} y1={ys(cy[j])} y2={ys(cy[j + 1])} />)
      if (j + 2 < cy.length && Math.sign(score[i][j + 1]) !== Math.sign(v))
        edges.push(<line key={`h${i}-${j}`} x1={xs(cx[i])} x2={xs(cx[i + 1])} y1={ys(cy[j + 1])} y2={ys(cy[j + 1])} />)
    }
  return (
    <g aria-hidden="true">
      {cells}
      <g style={{ stroke: 'var(--viz-ink)', strokeWidth: 2.4, strokeLinecap: 'round' }}>{edges}</g>
    </g>
  )
}

function Panel({ title, ariaLabel, children }: { title: string; ariaLabel: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={s.panelTitle}>{title}</p>
      <Plot x={[0, 10]} y={[0, 10]} width={320} height={320} maxWidth={380} margin={{ left: 30, bottom: 36, top: 8, right: 8 }} ariaLabel={ariaLabel}>
        {children}
        <Axes xTicks={5} yTicks={5} xLabel="x₁" yLabel="x₂" tickFormat={(v) => (v === 10 ? '' : String(v))} />
      </Plot>
    </div>
  )
}

export default function AdaBoostStepper() {
  const [noisy, setNoisy] = useState(false)
  const data = useMemo<[number, number, number][]>(() => (noisy ? [...RING, NOISY_POINT] : RING), [noisy])
  const rounds = useMemo(() => adaboost(data, T), [data])
  const player = usePlayer({ steps: 2 * T, interval: 850 })
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const t = Math.floor(player.step / 2) // 0-based round index
  const reweighted = player.step % 2 === 1
  const R = rounds[t]
  const n = data.length
  const noisyIndex = noisy ? n - 1 : -1
  const teamWrong = data.map((d, i) => (R.F[i] > 0 ? 1 : -1) !== d[2])
  const nWrong = R.wrong.filter(Boolean).length
  const eA = Math.exp(R.alpha)
  const wShown = reweighted ? R.wNext : R.w

  const status = reweighted ? (
    <>
      <b>Round {t + 1}, step 2: re-weight.</b> Each ringed point is multiplied by <M>{`e^{\\alpha} = ${eA.toFixed(2)}`}</M>, every other point by{' '}
      <M>{`e^{-\\alpha} = ${(1 / eA).toFixed(2)}`}</M>, then all weights are divided by their total. The ringed points now hold exactly half of the weight.
    </>
  ) : (
    <>
      <b>Round {t + 1}, step 1: fit a stump.</b> The new stump is the single cut with the smallest <i>weighted</i> error. It gets {nWrong}{' '}
      {nWrong === 1 ? 'point' : 'points'} wrong (ringed), worth <M>{`\\varepsilon = ${R.eps.toFixed(3)}`}</M> of the weight, so its say is{' '}
      <M>{`\\alpha = \\tfrac12\\ln\\tfrac{1-\\varepsilon}{\\varepsilon} = ${R.alpha.toFixed(3)}`}</M>.
    </>
  )

  const chart = (
    <Plot x={[0.5, T + 0.5]} y={[0, 0.55]} width={640} height={190} minHeight={180} margin={{ left: 42, right: 12, top: 14, bottom: 38 }} ariaLabel={`Errors by round: stump ${t + 1} has weighted error ${R.eps.toFixed(2)}; the team's training error is ${(100 * R.ensErr).toFixed(0)}%`}>
      <Grid xTicks={10} yTicks={5} />
      <Axes xLabel="round" xTicks={10} yTicks={5} tickFormat={(v) => (v < 1 && v > 0 ? `${Math.round(v * 100)}%` : String(v))} />
      <HLine y={0.5} color="var(--viz-muted)" dash="5 4" label="coin flip: ε = 0.5" />
      <Path points={rounds.map((r, i) => [i + 1, r.eps] as [number, number])} color="var(--viz-4)" width={1.4} opacity={0.25} />
      <Path points={rounds.map((r, i) => [i + 1, r.ensErr] as [number, number])} color="var(--viz-3)" width={2} opacity={0.25} />
      <Path points={rounds.slice(0, t + 1).map((r, i) => [i + 1, r.eps] as [number, number])} color="var(--viz-4)" width={1.6} />
      <Path points={rounds.slice(0, t + 1).map((r, i) => [i + 1, r.ensErr] as [number, number])} color="var(--viz-3)" width={3} />
      <ChartDots rounds={rounds} upto={t} />
    </Plot>
  )

  return (
    <Figure
      wide
      title="AdaBoost, one stump at a time"
      caption={
        <>
          Press <b>Play</b> or <b>Next</b>. Each round fits one stump (a single straight cut), then re-weights: the points it got wrong grow and the
          rest shrink, so the next stump is pulled towards them. Notice that every stump stays weak (its error ε stays between about 0.15 and 0.3), yet the
          team's error falls to zero by round 9 and the vote's boundary bends into a staircase around the curve. Then switch on the{' '}
          <b>mislabelled point</b>: AdaBoost keeps inflating it and spends stump after stump carving a thin blue strip just to fit it.
        </>
      }
    >
      <p className={s.status} aria-live="polite">
        {status}
      </p>
      <div ref={wrapRef} className={s.panels} style={{ gridTemplateColumns: narrow ? '1fr' : '1fr 1fr' }}>
        <Panel
          title={reweighted ? `Round ${t + 1}: weights after re-weighting` : `Round ${t + 1}: the new stump and the weights it saw`}
          ariaLabel={`Stump ${t + 1}: ${describe(R.stump)}. Dot sizes show sample weights; ${nWrong} points are ringed as mistakes.`}
        >
          <StumpRegions st={R.stump} faded={reweighted} />
          <WeightedPoints data={data} w={wShown} ring={R.wrong} noisyIndex={noisyIndex} />
        </Panel>
        <Panel title={`The team: weighted vote of ${t + 1} ${t ? 'stumps' : 'stump'}`} ariaLabel={`Decision regions of the weighted vote of ${t + 1} stumps; training error ${(100 * R.ensErr).toFixed(0)}%`}>
          <VoteRegions rounds={rounds} k={t + 1} />
          <WeightedPoints data={data} w={data.map(() => 1 / n)} ring={teamWrong} noisyIndex={noisyIndex} />
        </Panel>
      </div>
      <div className={s.legend}>
        <span>
          <i className={s.swatchSquare} style={{ background: ORANGE }} /> orange (+1)
        </span>
        <span>
          <i className={s.swatch} style={{ background: BLUE }} /> blue (−1)
        </span>
        <span>
          <i className={s.ring} /> wrong
        </span>
        <span>dot area = weight</span>
      </div>
      <div className={s.legend}>
        <span>
          <i className={s.swatch} style={{ background: 'var(--viz-4)' }} /> each stump's weighted error ε
        </span>
        <span>
          <i className={s.swatchSquare} style={{ background: 'var(--viz-3)', height: 4, width: 16 }} /> the team's training error
        </span>
      </div>
      {chart}
      <Readout
        items={[
          [`stump ${t + 1}`, describe(R.stump)],
          ['weighted error ε', R.eps.toFixed(3)],
          ['say α', R.alpha.toFixed(3)],
          ["team's training error", `${(100 * R.ensErr).toFixed(1)}%`],
        ]}
      />
      <Controls>
        <PlayerControls player={player} label={(st) => `Round ${Math.floor(st / 2) + 1} of ${T} · ${st % 2 ? 're-weight' : 'fit a stump'}`} />
        <Toggle label="Add a mislabelled point" checked={noisy} onChange={setNoisy} />
      </Controls>
    </Figure>
  )
}

function ChartDots({ rounds, upto }: { rounds: Round[]; upto: number }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {rounds.slice(0, upto + 1).map((r, i) => (
        <circle key={i} cx={xs(i + 1)} cy={ys(r.eps)} r={i === upto ? 5.5 : 3.2} style={{ fill: 'var(--viz-4)', stroke: 'var(--surface)', strokeWidth: 1.2 }} />
      ))}
      <circle cx={xs(upto + 1)} cy={ys(rounds[upto].ensErr)} r={5.5} style={{ fill: 'var(--viz-3)', stroke: 'var(--surface)', strokeWidth: 1.5 }} />
    </g>
  )
}
