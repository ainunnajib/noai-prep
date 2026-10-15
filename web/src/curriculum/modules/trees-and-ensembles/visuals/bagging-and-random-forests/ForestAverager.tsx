import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Grid, Axes, Dots, Path, Label, HLine, FnPath, usePlot, useNarrow } from '../../../../../kit'
import { fitTree, predictClass, leafRects, type Tree } from '../decision-trees/cart'
import { circleData } from '../decision-trees/data'
import { fitForest, accuracyCurve, oobAccuracy, type Forest } from './forest'
import s from '../decision-trees/trees.module.css'

/*
  The noisy circle data from the decision-tree lesson. 100 deep trees, each grown on its own
  bootstrap sample, are averaged. Slide the number of trees: the jagged single-tree regions turn
  into a smooth, round boundary. Switch between bagging (every split may use both features) and a
  random forest (each split sees only one randomly chosen feature).
*/

const TRAIN = circleData(150, 14, 0.15)
const VAL = circleData(1000, 999, 0.15)
const NT = 100
const G = 60 // grid cells per side for the averaged map
type Mode = 'rf' | 'bag'

const single = fitTree(TRAIN.X, TRAIN.y, TRAIN.y.map((_, i) => i))
const SINGLE_ACC = VAL.y.filter((v, i) => predictClass(single, VAL.X[i]) === v).length / VAL.y.length

interface Run {
  forest: Forest
  curve: number[]
  /** cum[b][cell]: sum of the first b+1 trees' P(orange) in each grid cell */
  cum: Float32Array[]
}

/** centres of the grid cells along either axis */
const CENTRES = Array.from({ length: G }, (_, c) => ((c + 0.5) * 10) / G)
/** the cells lo..hi-1 whose centres satisfy a < centre <= b (the same rule as "x <= t goes left") */
function cellRange(a: number, b: number): [number, number] {
  let lo = 0
  while (lo < G && CENTRES[lo] <= a) lo++
  let hi = lo
  while (hi < G && CENTRES[hi] <= b) hi++
  return [lo, hi]
}

function build(mode: Mode): Run {
  const forest = fitForest(TRAIN.X, TRAIN.y, NT, 7, { maxFeatures: mode === 'rf' ? 1 : 2 })
  const curve = accuracyCurve(forest, VAL.X, VAL.y)
  const cum: Float32Array[] = []
  let prev = new Float32Array(G * G)
  forest.trees.forEach((tree) => {
    // paint each leaf's rectangle onto the grid cells whose centres it contains (x0 < centre <= x1)
    const next = new Float32Array(G * G)
    for (const rc of leafRects(tree, [0, 10, 0, 10])) {
      const p = rc.node.n ? rc.node.value[1] / rc.node.n : 0
      const [c0, c1] = cellRange(rc.x0, rc.x1)
      const [r0, r1] = cellRange(rc.y0, rc.y1)
      for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) next[r * G + c] = prev[r * G + c] + p
    }
    cum.push(next)
    prev = next
  })
  return { forest, curve, cum }
}

const cache: Partial<Record<Mode, Run>> = {}
const getRun = (m: Mode) => (cache[m] ??= build(m))

const LEVELS = 20
/** colour for an averaged probability in 21 steps: blue (all trees say blue) … faint … orange */
function shade(level: number) {
  const t = Math.abs(level - LEVELS / 2) / (LEVELS / 2)
  if (t === 0) return 'color-mix(in srgb, var(--viz-muted) 12%, var(--surface))'
  return `color-mix(in srgb, ${level > LEVELS / 2 ? 'var(--viz-2)' : 'var(--viz-1)'} ${Math.round(8 + 40 * t)}%, var(--surface))`
}

/** averaged map drawn as horizontal runs of equal colour (keeps the SVG small) */
function AverageMap({ sums, B }: { sums: Float32Array; B: number }) {
  const { xs, ys } = usePlot()
  const cw = Math.abs(xs(10) - xs(0)) / G
  const ch = Math.abs(ys(0) - ys(10)) / G
  const out: JSX.Element[] = []
  for (let r = 0; r < G; r++) {
    let start = 0
    let lev = Math.round((sums[r * G] / B) * LEVELS)
    for (let c = 1; c <= G; c++) {
      const l = c < G ? Math.round((sums[r * G + c] / B) * LEVELS) : -1
      if (l !== lev) {
        out.push(<rect key={`${r}-${start}`} x={xs(0) + start * cw} y={ys(0) - (r + 1) * ch} width={(c - start) * cw + 0.6} height={ch + 0.6} style={{ fill: shade(lev) }} />)
        start = c
        lev = l
      }
    }
  }
  return <g aria-hidden="true">{out}</g>
}

function TreeThumb({ tree, k }: { tree: Tree; k: number }) {
  const rects = leafRects(tree, [0, 10, 0, 10])
  return (
    <div>
      <Plot x={[0, 10]} y={[0, 10]} width={110} height={110} maxWidth={130} margin={{ left: 2, right: 2, top: 2, bottom: 2 }} ariaLabel={`Decision regions of tree ${k}`}>
        <TreeRegions rects={rects} />
      </Plot>
      <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: 'var(--ink-3)' }}>tree {k}</p>
    </div>
  )
}

function TreeRegions({ rects }: { rects: ReturnType<typeof leafRects> }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {rects.map((r, i) => {
        const p = r.node.n ? r.node.value[1] / r.node.n : 0.5
        return (
          <rect
            key={i}
            x={xs(r.x0)}
            y={ys(r.y1)}
            width={xs(r.x1) - xs(r.x0)}
            height={ys(r.y0) - ys(r.y1)}
            style={{ fill: shade(Math.round(p * LEVELS)), stroke: 'color-mix(in srgb, var(--viz-axis) 35%, transparent)', strokeWidth: 0.6 }}
          />
        )
      })}
    </g>
  )
}

export default function ForestAverager() {
  const [B, setB] = useState(1)
  const [mode, setMode] = useState<Mode>('rf')
  const [circle, setCircle] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(620)
  const run = useMemo(() => getRun(mode), [mode])
  const otherMode: Mode = mode === 'rf' ? 'bag' : 'rf'
  // the comparison forest is built just after the first paint, so the lesson appears without a pause
  const [, setBuilt] = useState(0)
  useEffect(() => {
    if (cache[otherMode]) return
    const id = window.setTimeout(() => {
      getRun(otherMode)
      setBuilt((v) => v + 1)
    }, 50)
    return () => window.clearTimeout(id)
  }, [otherMode])
  const other = cache[otherMode]
  const oob = useMemo(() => oobAccuracy(run.forest, TRAIN.X, TRAIN.y, B), [run, B])
  const acc = run.curve[B - 1]
  const name = mode === 'rf' ? 'random forest' : 'bagging'
  const otherName = mode === 'rf' ? 'bagging' : 'random forest'

  return (
    <Figure
      title="Averaging many deep trees"
      caption={
        <>
          The same noisy circle data as the depth demo (15% of labels flipped; the dashed line is the true circle). Every tree is grown to full depth on its
          own bootstrap sample, so each one overfits in its own way (see the three small maps). Slide the <b>number of trees</b> from 1 to 100: the blocky,
          speckled regions of one tree blend into a smoother map that follows the circle more closely, and validation accuracy climbs, then levels off. Faint
          colours mean the trees disagree. Switch the <b>features per split</b> to compare plain bagging with a random forest.
        </>
      }
    >
      <div ref={wrapRef} className={s.panels} style={{ gridTemplateColumns: narrow ? '1fr' : '1.1fr 1fr' }}>
        <div>
          <p className={s.panelTitle}>
            Average of {B} {B === 1 ? 'tree' : 'trees'} ({name})
          </p>
          <Plot x={[0, 10]} y={[0, 10]} width={330} height={320} margin={{ left: 28, bottom: 24, top: 8, right: 8 }} ariaLabel={`Averaged decision map of ${B} trees`}>
            <AverageMap sums={run.cum[B - 1]} B={B} />
            <Axes xTicks={5} yTicks={5} />
            {circle && (
              <>
                <FnPath f={(x) => 5 + Math.sqrt(Math.max(0, 3.4 ** 2 - (x - 5) ** 2))} domain={[1.6, 8.4]} color="var(--viz-ink)" width={1.8} dash="6 5" samples={120} />
                <FnPath f={(x) => 5 - Math.sqrt(Math.max(0, 3.4 ** 2 - (x - 5) ** 2))} domain={[1.6, 8.4]} color="var(--viz-ink)" width={1.8} dash="6 5" samples={120} />
              </>
            )}
            <Dots
              points={TRAIN.X.map(([a, b], i) => ({
                x: a,
                y: b,
                r: 3.3,
                color: TRAIN.y[i] ? 'var(--viz-2)' : 'var(--viz-1)',
                shape: TRAIN.y[i] ? 'square' : 'circle',
              }))}
            />
          </Plot>
        </div>
        <div>
          <p className={s.panelTitle}>Three of the trees on their own</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
            {[0, 1, 2].map((k) => (
              <TreeThumb key={`${mode}-${k}`} tree={run.forest.trees[k]} k={k + 1} />
            ))}
          </div>
          <p className={s.panelTitle}>Validation accuracy against number of trees</p>
          <Plot x={[1, NT]} y={[0.6, 0.85]} width={330} height={200} minHeight={190} margin={{ left: 44, bottom: 36, top: 10, right: 10 }} ariaLabel={`Validation accuracy of the ${name}: ${Math.round(acc * 100)}% with ${B} trees`}>
            <Grid xTicks={5} yTicks={5} />
            <Axes xLabel="number of trees" xTicks={5} yTicks={5} tickFormat={(v) => (v < 1 ? `${Math.round(v * 100)}%` : String(v))} />
            <HLine y={SINGLE_ACC} color="var(--viz-4)" dash="5 4" width={1.8} />
            <Label x={NT} y={SINGLE_ACC} dx={-4} dy={14} anchor="end" color="var(--viz-4)" size={11.5}>
              one deep tree on all the data
            </Label>
            {other && <Path points={other.curve.map((v, i) => [i + 1, v] as [number, number])} color="var(--viz-muted)" width={1.6} />}
            <Path points={run.curve.map((v, i) => [i + 1, v] as [number, number])} color="var(--viz-3)" width={2.6} />
            <Dots points={[{ x: B, y: acc, r: 6, color: 'var(--viz-3)' }]} />
            <Label x={NT} y={run.curve[NT - 1]} dx={-4} dy={-8} anchor="end" color="var(--viz-3)" size={11.5} weight={700}>
              {name}
            </Label>
          </Plot>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>Grey line: {otherName}, for comparison.</p>
        </div>
      </div>
      <Readout
        items={[
          ['trees', String(B)],
          ['validation accuracy', `${(100 * acc).toFixed(1)}%`],
          ['out-of-bag accuracy', Number.isFinite(oob.acc) ? `${(100 * oob.acc).toFixed(1)}%` : '…'],
          ['one deep tree', `${(100 * SINGLE_ACC).toFixed(1)}%`],
        ]}
      />
      <Controls>
        <Slider label="number of trees" value={B} min={1} max={NT} step={1} onChange={setB} />
        <Segmented
          label="Features tried at each split"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'bag', label: 'both (bagging)' },
            { value: 'rf', label: '1 at random (forest)' },
          ]}
        />
        <Toggle label="Show the true circle" checked={circle} onChange={setCircle} />
      </Controls>
    </Figure>
  )
}
