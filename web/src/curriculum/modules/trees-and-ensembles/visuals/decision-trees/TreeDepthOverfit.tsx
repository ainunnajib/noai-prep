import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, Toggle, Readout, Plot, Grid, Axes, Rect, Dots, Path, Label, FnPath, useNarrow } from '../../../../../kit'
import { fitTree, predictClass, leafRects, leavesOf, depthOf, type Tree } from './cart'
import { circleData } from './data'
import s from './trees.module.css'

/*
  A tree grown on 150 noisy points (true rule: inside a circle = orange; 15% of labels flipped).
  Slide max_depth from 1 to 15: the decision regions go from one crude cut to tiny boxes around
  single noisy points, while training accuracy climbs to 100% and validation accuracy peaks and
  then falls. "New training sample" redraws the noise: deep trees change completely.
*/

const N_TRAIN = 150
const FLIP = 0.15
const MAX_D = 15
const VAL = circleData(1000, 999, FLIP)
const SEEDS = [14, 22, 30, 2, 1, 23, 20, 34]

const accuracy = (t: Tree, X: number[][], y: number[]) => y.filter((v, i) => predictClass(t, X[i]) === v).length / y.length
const pct = (v: number) => `${Math.round(v * 100)}%`

function regionFill(c: number[]) {
  const n = c[0] + c[1]
  const p = n ? c[1] / n : 0.5
  const strength = Math.round(10 + 22 * Math.abs(p - 0.5) * 2)
  return `color-mix(in srgb, ${p > 0.5 ? 'var(--viz-2)' : 'var(--viz-1)'} ${strength}%, var(--surface))`
}

export default function TreeDepthOverfit() {
  const [depth, setDepth] = useState(3)
  const [si, setSi] = useState(0)
  const [truth, setTruth] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const run = useMemo(() => {
    const train = circleData(N_TRAIN, SEEDS[si % SEEDS.length], FLIP)
    const idx = train.y.map((_, i) => i)
    const trees = Array.from({ length: MAX_D }, (_, d) => fitTree(train.X, train.y, idx, { maxDepth: d + 1 }))
    const tr = trees.map((t) => accuracy(t, train.X, train.y))
    const va = trees.map((t) => accuracy(t, VAL.X, VAL.y))
    const best = va.indexOf(Math.max(...va)) + 1
    return { train, trees, tr, va, best }
  }, [si])

  const tree = run.trees[depth - 1]
  const rects = leafRects(tree, [0, 10, 0, 10])
  const realDepth = depthOf(tree)
  const verdict =
    depth < run.best - 1
      ? 'Underfitting: too few questions to trace the circle (high bias).'
      : depth <= run.best + 1
        ? 'About right: the boxes follow the circle without chasing single points.'
        : run.tr[depth - 1] > 0.995
          ? 'Overfitting: every training point is now correct, including the 15% with flipped labels. Tiny boxes surround single noisy points.'
          : 'Overfitting: extra questions are carving boxes around individual noisy points (high variance).'

  return (
    <Figure
      title="Deeper is not always better"
      caption={
        <>
          The data: 150 points where the true rule is "inside the circle = orange", but 15% of the labels were flipped at random (noise). Slide{' '}
          <b>max_depth</b> to let the tree ask more questions. Training accuracy (pink) keeps rising to 100%, but accuracy on 1,000 fresh validation points
          (green) peaks at a small depth and then falls: the extra boxes are memorising noise. Press <b>New training sample</b> at depth 3 and then at depth 15:
          the shallow tree barely changes, the deep tree changes completely.
        </>
      }
    >
      <div ref={wrapRef} className={s.panels} style={{ gridTemplateColumns: narrow ? '1fr' : '1fr 1fr' }}>
        <div>
          <p className={s.panelTitle}>Decision regions at max_depth = {depth}</p>
          <Plot x={[0, 10]} y={[0, 10]} width={340} height={330} margin={{ left: 30, bottom: 26, top: 10, right: 10 }} ariaLabel={`Decision regions of a tree with max_depth ${depth}: ${rects.length} leaves`}>
            {rects.map((r, i) => (
              <Rect key={i} x0={r.x0} x1={r.x1} y0={r.y0} y1={r.y1} fill={regionFill(r.node.value)} stroke="color-mix(in srgb, var(--viz-axis) 45%, transparent)" />
            ))}
            <Axes xTicks={5} yTicks={5} />
            {truth && (
              <>
                <FnPath f={(x) => 5 + Math.sqrt(Math.max(0, 3.4 ** 2 - (x - 5) ** 2))} domain={[1.6, 8.4]} color="var(--viz-ink)" width={2} dash="6 5" samples={120} />
                <FnPath f={(x) => 5 - Math.sqrt(Math.max(0, 3.4 ** 2 - (x - 5) ** 2))} domain={[1.6, 8.4]} color="var(--viz-ink)" width={2} dash="6 5" samples={120} />
              </>
            )}
            <Dots
              points={run.train.X.map(([a, b], i) => ({
                x: a,
                y: b,
                r: 3.6,
                color: run.train.y[i] ? 'var(--viz-2)' : 'var(--viz-1)',
                shape: run.train.y[i] ? 'square' : 'circle',
              }))}
            />
          </Plot>
        </div>
        <div>
          <p className={s.panelTitle}>Accuracy against max_depth</p>
          <Plot x={[0.5, MAX_D + 0.5]} y={[0.5, 1.02]} width={340} height={300} minHeight={240} margin={{ left: 44, bottom: 38, top: 16, right: 12 }} ariaLabel="Training and validation accuracy for max_depth 1 to 15">
            <Grid xTicks={7} yTicks={5} />
            <Axes xLabel="max_depth" xTicks={7} yTicks={5} hideYTicks />
            <Axes xTicks={7} yTicks={5} hideXTicks tickFormat={(v) => `${Math.round(v * 100)}%`} />
            <Rect x0={run.best - 0.5} x1={run.best + 0.5} y0={0.5} y1={1.02} fill="color-mix(in srgb, var(--viz-3) 14%, transparent)" />
            <Path points={run.tr.map((v, i) => [i + 1, v] as [number, number])} color="var(--viz-4)" width={2.5} />
            <Path points={run.va.map((v, i) => [i + 1, v] as [number, number])} color="var(--viz-3)" width={2.5} />
            <Dots
              points={[
                { x: depth, y: run.tr[depth - 1], color: 'var(--viz-4)', r: 6 },
                { x: depth, y: run.va[depth - 1], color: 'var(--viz-3)', r: 6 },
              ]}
            />
            <Label x={MAX_D} y={run.tr[MAX_D - 1]} dy={-9} anchor="end" color="var(--viz-4)" weight={700} size={12}>
              training
            </Label>
            <Label x={MAX_D} y={run.va[MAX_D - 1]} dy={-9} anchor="end" color="var(--viz-3)" weight={700} size={12}>
              validation
            </Label>
            <Label x={run.best} y={0.5} dy={-6} anchor="middle" color="var(--viz-3)" size={11}>
              best
            </Label>
          </Plot>
        </div>
      </div>
      <Readout
        items={[
          ['leaves', String(leavesOf(tree))],
          ['actual depth', String(realDepth)],
          ['training accuracy', pct(run.tr[depth - 1])],
          ['validation accuracy', pct(run.va[depth - 1])],
        ]}
      />
      <p className={s.status}>{verdict}</p>
      <Controls>
        <Slider label="max_depth" value={depth} min={1} max={MAX_D} step={1} onChange={setDepth} />
        <Button onClick={() => setSi((v) => v + 1)}>New training sample</Button>
        <Toggle label="Show the true circle" checked={truth} onChange={setTruth} />
      </Controls>
    </Figure>
  )
}
