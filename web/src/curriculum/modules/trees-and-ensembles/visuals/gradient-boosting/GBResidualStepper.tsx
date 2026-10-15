import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Path, Dots, HLine, VLine, usePlot, usePlayer, PlayerControls, M } from '../../../../../kit'
import { TRAIN, boost, stepPoints } from './gb'
import s from './gb.module.css'

/*
  Gradient boosting, one tree at a time, on 40 noisy points.
  Top: the data, the model before this round (dashed) and after it (solid).
  Middle: the residuals y − F_{m−1} the new tree is trained on, the tree itself, and η × tree (what is added).
  Bottom: training and validation MSE against the number of trees.
*/

const MMAX = 100
const LRS = [0.1, 0.3, 1] as const
const DEPTHS = [1, 2, 3] as const

function Stems({ xs: xv, r }: { xs: number[]; r: number[] }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {r.map((v, i) => (
        <g key={i}>
          <line x1={xs(xv[i])} x2={xs(xv[i])} y1={ys(0)} y2={ys(v)} style={{ stroke: 'color-mix(in srgb, var(--viz-1) 55%, transparent)', strokeWidth: 1.5 }} />
          <circle cx={xs(xv[i])} cy={ys(v)} r={3.2} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 1 }} />
        </g>
      ))}
    </g>
  )
}

export default function GBResidualStepper() {
  const [lr, setLr] = useState<(typeof LRS)[number]>(0.3)
  const [depth, setDepth] = useState<(typeof DEPTHS)[number]>(1)
  const run = useMemo(() => boost(MMAX, lr, depth), [lr, depth])
  const player = usePlayer({ steps: MMAX, interval: 650 })
  const m = player.step + 1 // tree number shown (1-based)
  const before = run.F[m - 1]
  const after = run.F[m]
  const tree = run.trees[m - 1]
  const r = run.residuals[m - 1]
  const xsData = TRAIN.map((p) => p[0])
  const rMax = Math.max(1.5, ...run.residuals[0].map(Math.abs)) * 1.08
  const scaled = Array.from(tree.values, (v) => lr * v)
  const lossMax = Math.max(...run.valMSE, ...run.trainMSE) * 1.05

  const top = (
    <Plot x={[0, 10]} y={[-1, 9]} width={620} height={250} minHeight={230} margin={{ left: 34, right: 10, top: 10, bottom: 38 }} ariaLabel={`Data and the model after ${m} trees`}>
      <Grid xTicks={10} yTicks={5} />
      <Axes xTicks={10} yTicks={5} xLabel="x" yLabel="y" />
      <Path points={stepPoints(before)} color="var(--viz-muted)" width={2} dash="5 4" />
      <Path points={stepPoints(after)} color="var(--viz-3)" width={3} />
      <Dots points={TRAIN.map(([x, y]) => ({ x, y, r: 3.6, color: 'var(--viz-ink)' }))} />
    </Plot>
  )

  const middle = (
    <Plot x={[0, 10]} y={[-rMax, rMax]} width={620} height={210} minHeight={200} margin={{ left: 34, right: 10, top: 10, bottom: 38 }} ariaLabel={`Residuals before tree ${m} and the tree fitted to them`}>
      <Grid xTicks={10} yTicks={4} />
      <Axes xTicks={10} yTicks={4} xLabel="x" yLabel="residual" />
      <HLine y={0} color="var(--viz-axis)" dash="" width={1.2} />
      <Stems xs={xsData} r={r} />
      <Path points={stepPoints(tree.values)} color="var(--viz-2)" width={3} />
      <Path points={stepPoints(scaled)} color="var(--viz-5)" width={2} dash="5 3" />
    </Plot>
  )

  const loss = (
    <Plot x={[0, MMAX]} y={[0, lossMax]} width={620} height={180} minHeight={170} margin={{ left: 40, right: 10, top: 10, bottom: 38 }} ariaLabel={`Mean squared error after ${m} trees: training ${run.trainMSE[m].toFixed(2)}, validation ${run.valMSE[m].toFixed(2)}`}>
      <Grid xTicks={10} yTicks={4} />
      <Axes xTicks={10} yTicks={4} xLabel="number of trees" yLabel="MSE" />
      <Path points={run.trainMSE.map((v, i) => [i, v] as [number, number])} color="var(--viz-1)" width={2.4} />
      <Path points={run.valMSE.map((v, i) => [i, v] as [number, number])} color="var(--viz-4)" width={2.4} />
      <VLine x={m} color="var(--viz-muted)" dash="3 3" />
      <Dots
        points={[
          { x: m, y: run.trainMSE[m], r: 5, color: 'var(--viz-1)' },
          { x: m, y: run.valMSE[m], r: 5, color: 'var(--viz-4)' },
        ]}
      />
    </Plot>
  )

  return (
    <Figure
      wide
      title="Gradient boosting: each tree fits what is left over"
      caption={
        <>
          Press <b>Play</b> or drag the <b>tree</b> slider. The middle panel is the heart of the method: the dots are the residuals{' '}
          <M>{'y - F_{m-1}(x)'}</M> (what the model still gets wrong), the orange steps are the new tree fitted to them, and the dashed purple steps are
          the tree times the learning rate, which is what actually gets added. The residuals shrink round by round. Now try <b>depth 3</b> with{' '}
          <b>η = 1</b>: the training error dives to almost zero within a few trees, but the validation error never gets as low as with gentle settings and soon creeps back up, because the trees are fitting the noise.
        </>
      }
    >
      <p className={s.status}>
        <b>Tree {m}.</b> <M>{`F_{${m}}(x) = F_{${m - 1}}(x) + ${lr} \\times h_{${m}}(x)`}</M>: the new tree <M>{`h_{${m}}`}</M> (depth {depth}) learns the
        residuals of <M>{`F_{${m - 1}}`}</M>, and a {lr === 1 ? 'full' : `${lr * 100}%`} step of it is added.
      </p>
      <div className={s.panels}>
        <div>
          <p className={s.panelTitle}>The data, the model before this tree (dashed) and after it (green)</p>
          {top}
        </div>
        <div>
          <p className={s.panelTitle}>Tree {m} is trained on the residuals of the model so far</p>
          {middle}
          <div className={s.legend}>
            <span>
              <i className={s.swatch} style={{ background: 'var(--viz-1)' }} /> residual <M>{'y - F_{m-1}'}</M>
            </span>
            <span>
              <i className={s.line} style={{ borderColor: 'var(--viz-2)' }} /> tree <M>{'h_m'}</M>
            </span>
            <span>
              <i className={s.dashed} style={{ borderColor: 'var(--viz-5)' }} /> <M>{'\\eta \\times h_m'}</M> (added)
            </span>
          </div>
        </div>
        <div>
          <p className={s.panelTitle}>Mean squared error as trees are added</p>
          {loss}
          <div className={s.legend}>
            <span>
              <i className={s.line} style={{ borderColor: 'var(--viz-1)' }} /> training
            </span>
            <span>
              <i className={s.line} style={{ borderColor: 'var(--viz-4)' }} /> validation (60 new points)
            </span>
          </div>
        </div>
      </div>
      <Readout
        items={[
          ['trees', String(m)],
          ['start F₀ = mean', run.F0.toFixed(2)],
          ['training MSE', run.trainMSE[m].toFixed(3)],
          ['validation MSE', run.valMSE[m].toFixed(3)],
        ]}
      />
      <Controls>
        <PlayerControls player={player} label={(st) => `Tree ${st + 1} of ${MMAX}`} />
        <Slider label="tree" value={m} min={1} max={MMAX} step={1} onChange={(v) => player.setStep(v - 1)} />
        <Segmented label="learning rate η" value={lr} onChange={setLr} options={LRS.map((v) => ({ value: v, label: String(v) }))} />
        <Segmented label="tree depth" value={depth} onChange={setDepth} options={DEPTHS.map((v) => ({ value: v, label: String(v) }))} />
      </Controls>
    </Figure>
  )
}
