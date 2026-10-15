import { useMemo, useState, useEffect, type ReactElement } from 'react'
import { Figure, Controls, Slider, Readout, Button, Plot, Grid, Axes, Path, Dots, Label, usePlot, DraggablePoint, useContainerWidth, usePlayer } from '../../../../../kit'
import { normalQuantiles, sigmoid } from '../confusion-matrix-and-metrics/evalMath'
import { HaloLabel } from '../confusion-matrix-and-metrics/HaloLabel'
import { rocPoints, pairAUC, ratesAt, type Pt } from './roc'
import s from '../confusion-matrix-and-metrics/eval.module.css'

/*
  40 positives and 40 negatives (evenly spread normal samples, shifted apart by the separation d,
  squashed to scores with the sigmoid). Left: the scores, negatives stacked up, positives stacked
  down, with the threshold. Right: the ROC curve; the big dot is the current threshold. Sweeping
  the threshold from 1 down to 0 walks the dot from (0, 0) to (1, 1).
*/

const N = 40
const BINS = 20
const NEG_C = 'var(--viz-1)'
const POS_C = 'var(--viz-2)'
const CUR_C = 'var(--viz-ink)'

function bins(scores: number[]) {
  const b = new Array(BINS).fill(0)
  for (const v of scores) b[Math.min(BINS - 1, Math.floor(v * BINS))]++
  return b
}

function Strip({ neg, pos, k }: { neg: number[]; pos: number[]; k: number }) {
  const { xs, ys } = usePlot()
  const top = ys(1)
  const bottom = ys(0)
  const mid = (top + bottom) / 2
  const binW = xs(1 / BINS) - xs(0)
  const r = Math.max(2.4, Math.min(4.2, binW / 2 - 1))
  const room = mid - top - 6
  const maxStack = Math.max(...neg, ...pos, 1)
  const pitch = Math.min(2 * r + 1.4, room / maxStack)
  const xt = xs(k / BINS)
  const out: ReactElement[] = []
  const place = (b: number[], up: boolean) =>
    b.forEach((count, i) => {
      for (let j = 0; j < count; j++) {
        const cx = xs(i / BINS) + binW / 2
        const cy = up ? mid - 3 - (j + 0.5) * pitch : mid + 3 + (j + 0.5) * pitch
        const flagged = i >= k
        out.push(
          <circle
            key={`${up ? 'n' : 'p'}${i}-${j}`}
            cx={cx}
            cy={cy}
            r={r}
            style={{ fill: up ? NEG_C : POS_C, stroke: (up ? flagged : !flagged) ? 'var(--viz-neg)' : 'var(--surface)', strokeWidth: (up ? flagged : !flagged) ? 1.5 : 1 }}
          />,
        )
      }
    })
  place(neg, true)
  place(pos, false)
  return (
    <g>
      <rect x={xt} y={top} width={xs(1) - xt} height={bottom - top} style={{ fill: 'color-mix(in srgb, var(--viz-2) 9%, transparent)' }} />
      <line x1={xs(0)} x2={xs(1)} y1={mid} y2={mid} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
      {out}
      <text className="plot-label" x={xs(0) + 3} y={top + 12} style={{ fontSize: 11.5, fill: NEG_C }}>
        negatives ▲
      </text>
      <text className="plot-label" x={xs(0) + 3} y={bottom - 5} style={{ fontSize: 11.5, fill: POS_C }}>
        positives ▼
      </text>
      <line x1={xt} x2={xt} y1={top - 4} y2={bottom} style={{ stroke: CUR_C, strokeWidth: 2.2 }} />
    </g>
  )
}

export default function ROCTracer() {
  const [d, setD] = useState(2)
  const [k, setK] = useState(10)
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(640)
  const side = width >= 560
  const player = usePlayer({ steps: BINS + 1, interval: 380 })

  // while playing, the player drives the threshold from 1.00 down to 0.00
  useEffect(() => {
    if (player.playing) setK(BINS - player.step)
  }, [player.playing, player.step])

  const { neg, pos } = useMemo(() => {
    const z = normalQuantiles(N)
    return { neg: z.map((v) => sigmoid(v - d / 2)), pos: z.map((v) => sigmoid(v + d / 2)) }
  }, [d])
  const roc = useMemo(() => rocPoints(pos, neg), [pos, neg])
  const auc = pairAUC(pos, neg).auc
  const t = k / BINS
  const cur = ratesAt(pos, neg, t)
  const traced = roc.filter(([x, y]) => x <= cur.fpr + 1e-12 && y <= cur.tpr + 1e-12)
  const area: Pt[] = [...roc, [1, 0], [0, 0]]

  const plotW = side ? Math.floor((Math.min(width, 760) - 18) / 2) : Math.min(width, 520)

  return (
    <Figure
      title="Sweep the threshold, trace the ROC curve"
      caption={
        <>
          Left: model scores for 40 positives (orange, stacked down) and 40 negatives (blue, stacked up); everything right of the threshold is predicted
          positive, and a red ring marks a mistake. Right: that threshold is one point on the ROC curve, at <b>(FPR, TPR)</b>. Press <b>Sweep</b> or drag the
          threshold from 1 down to 0 and watch the point climb from (0, 0) to (1, 1). Then slide the separation: a better model bulges towards the top-left
          corner (AUC near 1); at separation 0 the curve collapses onto the diagonal (AUC 0.5, a coin toss).
        </>
      }
    >
      <div ref={wrapRef} className={s.wrap} style={{ display: 'grid', gridTemplateColumns: side ? '1fr 1fr' : '1fr', gap: 18, alignItems: 'center', justifyItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: plotW }}>
          <Plot x={[0, 1]} y={[0, 1]} width={plotW} height={side ? Math.round(plotW * 0.72) : Math.round(plotW * 0.9)} maxWidth={plotW} margin={{ left: 10, right: 10, top: 22, bottom: 34 }} ariaLabel={`Scores of 40 positives and 40 negatives with threshold ${t.toFixed(2)}`}>
            <Strip neg={bins(neg)} pos={bins(pos)} k={k} />
            <g className="plot-axes">
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <PlotTick key={v} v={v} />
              ))}
            </g>
            <Label x={0.5} y={0} dy={30} anchor="middle" size={12}>
              model score
            </Label>
            <DraggablePoint x={t} y={1} lockY color={CUR_C} r={8} onChange={(x) => (player.pause(), setK(Math.max(0, Math.min(BINS, Math.round(x * BINS)))))} />
          </Plot>
        </div>
        <div style={{ width: '100%', maxWidth: side ? plotW : 360 }}>
          <Plot x={[0, 1]} y={[0, 1]} width={side ? plotW : 340} height={side ? plotW : 340} maxWidth={side ? plotW : 360} margin={{ left: 42, right: 14, top: 26, bottom: 38 }} ariaLabel={`ROC curve with AUC ${auc.toFixed(2)}; current point FPR ${cur.fpr.toFixed(2)}, TPR ${cur.tpr.toFixed(2)}`}>
            <Path points={area} fill="var(--viz-fill)" color="none" width={0} closed />
            <Grid xTicks={5} yTicks={5} />
            <Axes xLabel="false positive rate" yLabel="true positive rate" xTicks={5} yTicks={5} />
            <Path points={[[0, 0], [1, 1]]} color="var(--viz-muted)" dash="5 5" width={1.6} />
            <Path points={roc} color="var(--viz-1)" width={1.6} opacity={0.45} />
            <Path points={traced} color="var(--viz-1)" width={3} />
            <Dots points={[{ x: cur.fpr, y: cur.tpr, color: CUR_C, r: 6.5 }]} />
            {/* below-right of the point is always under the curve, so the label never sits on it */}
            <HaloLabel x={cur.fpr} y={cur.tpr} dx={cur.fpr > 0.7 ? -10 : 10} dy={cur.tpr < 0.15 ? -10 : 17} anchor={cur.fpr > 0.7 ? 'end' : 'start'}>
              {`t = ${t.toFixed(2)}`}
            </HaloLabel>
            <Label x={0.62} y={0.3} anchor="middle" color="var(--viz-1)" size={13} weight={700}>
              {`AUC = ${auc.toFixed(3)}`}
            </Label>
            <Label x={0.72} y={0.72} dx={8} dy={16} anchor="start" color="var(--viz-muted)" size={11}>
              random
            </Label>
          </Plot>
        </div>
      </div>
      <Controls>
        <Button primary onClick={() => (player.playing ? player.pause() : (player.reset(), player.play()))}>
          {player.playing ? 'Pause' : 'Sweep the threshold'}
        </Button>
        <Slider label="threshold" value={k} min={0} max={BINS} step={1} onChange={(v) => (player.pause(), setK(v))} format={(v) => (v / BINS).toFixed(2)} />
        <Slider label="class separation" value={d} min={0} max={4} step={0.25} onChange={setD} format={(v) => v.toFixed(2)} />
        <Readout
          items={[
            ['TPR', `${cur.tp}/${N} = ${cur.tpr.toFixed(2)}`],
            ['FPR', `${cur.fp}/${N} = ${cur.fpr.toFixed(2)}`],
            ['AUC', auc.toFixed(3)],
          ]}
        />
      </Controls>
    </Figure>
  )
}

function PlotTick({ v }: { v: number }) {
  const { xs, ys } = usePlot()
  return (
    <g transform={`translate(${xs(v)},${ys(0)})`}>
      <line y2={5} />
      <text y={17} textAnchor={v === 0 ? 'start' : v === 1 ? 'end' : 'middle'}>
        {v}
      </text>
    </g>
  )
}
