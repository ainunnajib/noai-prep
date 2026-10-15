import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Path, Rect, VLine, Label, usePlot, useNarrow } from '../../../../../kit'
import { boost, earlyStop } from './gb'
import s from './gb.module.css'

/*
  Early stopping with patience on the same 40 training points, judged on the 60 validation points.
  After every tree: if the validation MSE beats the best so far, remember this number of trees and
  reset the counter; otherwise add 1 to the counter. Stop when the counter reaches `patience`.
  The model keeps only the best number of trees.
*/

const M = 200
const LRS = [0.05, 0.1, 0.3, 1] as const
const DEPTHS = [1, 2] as const

function Star({ x, y, filled, colour }: { x: number; y: number; filled: boolean; colour: string }) {
  const { xs, ys } = usePlot()
  const cx = xs(x)
  const cy = ys(y)
  const pts = Array.from({ length: 10 }, (_, k) => {
    const a = -Math.PI / 2 + (k * Math.PI) / 5
    const r = k % 2 ? 4 : 9.5
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  return <polygon points={pts} style={{ fill: filled ? colour : 'var(--surface)', stroke: colour, strokeWidth: 1.8 }} />
}

export default function PatienceTracker() {
  const [patience, setPatience] = useState(10)
  const [lr, setLr] = useState<(typeof LRS)[number]>(0.3)
  const [depth, setDepth] = useState<(typeof DEPTHS)[number]>(1)
  const run = useMemo(() => boost(M, lr, depth), [lr, depth])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const { bestN, best, stoppedAt, stopped } = earlyStop(run.valMSE, patience)
  const globalBest = run.valMSE.reduce((bi, v, i) => (i > 0 && v < run.valMSE[bi] ? i : bi), 1)
  // the first few trees (MSE up to 4.2) run off the top; the action is lower down
  const top = Math.max(1.6, best * 1.15)
  const ran = stoppedAt
  const pts = (arr: number[], a: number, b: number) => arr.slice(a, b + 1).map((v, i) => [a + i, v] as [number, number])

  return (
    <Figure
      title="Early stopping: when to stop adding trees"
      caption={
        <>
          The training error (blue) keeps falling, but the validation error (pink) bottoms out and then creeps up as the trees start fitting noise. Early
          stopping watches the validation error and stops once it has <b>failed to improve for "patience" trees in a row</b> (the shaded window), then keeps
          the model at the filled star. Slide <b>patience</b> down to 1 with stumps and η = 0.3: training stops at the first small bump, long before the
          real minimum (hollow star). Then compare learning rates: a smaller η needs more trees but reaches a similar or lower validation error.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <Plot x={[0, M]} y={[0, top]} width={640} height={300} minHeight={260} margin={{ left: 42, right: 12, top: 14, bottom: 38 }} ariaLabel={`Training and validation error against number of trees; training stops after ${ran} trees and keeps ${bestN}`}>
          <Grid xTicks={narrow ? 5 : 10} yTicks={5} />
          {stopped && <Rect x0={bestN} x1={ran} y0={0} y1={top} fill="color-mix(in srgb, var(--viz-6) 16%, transparent)" />}
          <Axes xTicks={narrow ? 5 : 10} yTicks={5} xLabel="number of trees" yLabel="MSE" />
          <Path points={pts(run.trainMSE, ran, M)} color="var(--viz-1)" width={1.6} dash="2 4" opacity={0.6} />
          <Path points={pts(run.valMSE, ran, M)} color="var(--viz-4)" width={1.6} dash="2 4" opacity={0.6} />
          <Path points={pts(run.trainMSE, 0, ran)} color="var(--viz-1)" width={2.6} />
          <Path points={pts(run.valMSE, 0, ran)} color="var(--viz-4)" width={2.6} />
          {stopped && <VLine x={ran} color="var(--viz-ink)" dash="4 3" width={1.6} />}
          {stopped && (
            <Label x={ran} y={top * 0.035} dx={ran > 165 ? -5 : 5} anchor={ran > 165 ? 'end' : 'start'} color="var(--viz-ink)" size={11.5} weight={700}>
              stopped after {ran}
            </Label>
          )}
          <Star x={globalBest} y={run.valMSE[globalBest]} filled={false} colour="var(--viz-4)" />
          <Star x={bestN} y={best} filled colour="var(--viz-4)" />
        </Plot>
      </div>
      <div className={s.legend}>
        <span>
          <i className={s.line} style={{ borderColor: 'var(--viz-1)' }} /> training MSE
        </span>
        <span>
          <i className={s.line} style={{ borderColor: 'var(--viz-4)' }} /> validation MSE
        </span>
        <span>
          <i className={s.swatch} style={{ borderRadius: 2, background: 'color-mix(in srgb, var(--viz-6) 30%, transparent)' }} /> {patience} {patience === 1 ? 'tree' : 'trees'} without improving
        </span>
        <span>★ kept model</span>
        <span>☆ lowest validation error over all {M} trees</span>
      </div>
      <Readout
        items={[
          stopped ? ['stopped after', `${ran} trees`] : ['never stopped', `still improving at ${M}`],
          ['trees kept', String(bestN)],
          ['validation MSE kept', best.toFixed(3)],
          ['best possible', `${run.valMSE[globalBest].toFixed(3)} at ${globalBest}`],
        ]}
      />
      <Controls>
        <Slider label="patience" value={patience} min={1} max={30} step={1} onChange={setPatience} />
        <Segmented label="learning rate η" value={lr} onChange={setLr} options={LRS.map((v) => ({ value: v, label: String(v) }))} />
        <Segmented label="tree depth" value={depth} onChange={setDepth} options={DEPTHS.map((v) => ({ value: v, label: String(v) }))} />
      </Controls>
    </Figure>
  )
}
