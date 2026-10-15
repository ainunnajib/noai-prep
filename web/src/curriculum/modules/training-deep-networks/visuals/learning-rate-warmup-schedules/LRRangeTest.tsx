import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, Path, Dots, Label, VLine, Rect, DraggablePoint, useNarrow } from '../../../../../kit'
import { RANGE, PREVIEWS, PREVIEW_EVERY, PREVIEW_STEPS } from './lrRangeData'
import { Legend, Note } from './parts'

/*
  Learning-rate range test on REAL data (see lrRangeData.ts). Top: one short run in which the learning
  rate grows exponentially every step; loss against learning rate (log axis). Drag the marker along it.
  Bottom: a separate 200-step training run at the chosen constant learning rate.
  Aha: one cheap test tells you which learning rates are too small, good, and too big.
*/

const LX = RANGE.lr.map((v) => Math.log10(v))
const Y_TOP = 3
const minIdx = RANGE.smooth.reduce((b, v, i) => (v < RANGE.smooth[b] ? i : b), 0)
const lrAtMin = RANGE.lr[minIdx]
const endX = LX[LX.length - 1]

function curveY(x: number): number {
  if (x <= LX[0]) return RANGE.smooth[0]
  if (x >= endX) return Y_TOP - 0.15
  let i = 0
  while (i < LX.length - 2 && LX[i + 1] < x) i++
  const t = (x - LX[i]) / (LX[i + 1] - LX[i])
  return Math.min(Y_TOP - 0.15, RANGE.smooth[i] * (1 - t) + RANGE.smooth[i + 1] * t)
}

const snapK = (nx: number) => Math.max(0, Math.min(PREVIEWS.length - 1, Math.round((nx + 4) / 0.2 + 1e-6)))
const fmtLR = (v: number) => (v >= 1 ? String(Number(v.toPrecision(3))) : String(Number(v.toPrecision(2))))
const tickLR = (v: number) => (Number.isInteger(v) ? String(10 ** v >= 1 ? 10 ** v : Number((10 ** v).toFixed(-v))) : '')

type Verdict = { tone: 'good' | 'bad' | 'warn' | 'plain'; title: string; text: string }

function judge(loss: number[]): Verdict {
  const f = loss[loss.length - 1]
  let jump = -Infinity
  for (let i = 1; i < loss.length; i++) jump = Math.max(jump, loss[i] - loss[i - 1])
  if (jump > 0.3)
    return {
      tone: 'bad',
      title: 'Too big.',
      text: `The steps overshoot: the loss jumps up by as much as ${jump.toFixed(2)} at a time and ends at ${f.toFixed(2)}. Much higher and the network stops learning altogether (2.30 is the loss of random guessing among 10 digits).`,
    }
  if (f > 1.5)
    return { tone: 'warn', title: 'Too small.', text: `Safe but painfully slow: after ${PREVIEW_STEPS} steps the loss has only crept from ${loss[0].toFixed(2)} to ${f.toFixed(2)}.` }
  if (f < 0.25)
    return {
      tone: 'good',
      title: 'Good.',
      text: `Fast, steady progress: the loss falls from ${loss[0].toFixed(2)} to ${f.toFixed(3)} in ${PREVIEW_STEPS} steps${jump > 0.15 ? ', with a few bumps: this is near the top of the safe range' : ''}.`,
    }
  return { tone: 'plain', title: 'Working, but slow.', text: `The loss falls to ${f.toFixed(2)} in ${PREVIEW_STEPS} steps. A learning rate a few times bigger would get further in the same time.` }
}

export default function LRRangeTest() {
  const [k, setK] = useState(5)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const x = -4 + 0.2 * k
  const prev = PREVIEWS[k]
  const v = useMemo(() => judge(prev.loss), [prev])
  const rawPts = useMemo(() => LX.map((lx, i) => ({ x: lx, y: Math.min(RANGE.raw[i], Y_TOP - 0.05), r: 2.2, color: 'var(--viz-muted)' })), [])
  const smoothPts = LX.map((lx, i): [number, number] => [lx, Math.min(RANGE.smooth[i], Y_TOP)])
  const suggest = Math.log10(lrAtMin / 10)
  const W = narrow ? 360 : 600

  return (
    <Figure
      title="The learning-rate range test"
      caption={
        <>
          Real data from a small network learning handwritten digits. <b>Top:</b> one short run where the learning rate is multiplied by the same
          factor every step, from 0.0001 to 10, plotting the loss at each learning rate (smoothed). <b>Drag the orange marker</b> along it.{' '}
          <b>Bottom:</b> a fresh 200-step run at the learning rate you picked. Where the top curve is flat, training crawls; where it falls fastest,
          training is quick; past the lowest point, training falls apart. A good choice sits about ten times below the lowest point.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.6rem', justifyItems: 'center' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>Range test: loss as the learning rate grows</div>
        <Plot
          x={[-4, 1]}
          y={[0, Y_TOP]}
          width={W}
          height={narrow ? 240 : 250}
          minHeight={200}
          maxWidth={720}
          margin={{ left: 40, right: 14, top: 16 }}
          ariaLabel={`Range test. Loss stays near 2.3 for tiny learning rates, falls steeply between about 0.01 and 0.5, is lowest near ${fmtLR(lrAtMin)} and then shoots up. Marker at learning rate ${fmtLR(prev.lr)}.`}
        >
          <Grid xTicks={5} yTicks={6} />
          <Rect x0={endX} x1={1} y0={0} y1={Y_TOP} fill="color-mix(in srgb, var(--viz-neg) 10%, transparent)" />
          <Axes xLabel="learning rate (log scale)" xTicks={5} hideYTicks tickFormat={tickLR} />
          <Axes yLabel="loss" yTicks={6} hideXTicks />
          <Dots points={rawPts} />
          <Path points={smoothPts} color="var(--viz-1)" width={2.8} />
          <Path points={[[endX, Math.min(RANGE.smooth[RANGE.smooth.length - 1], Y_TOP)], [endX + 0.12, Y_TOP]]} color="var(--viz-1)" width={2.8} dash="3 4" />
          <Label x={(endX + 1) / 2} y={Y_TOP} dy={16} anchor="middle" size={12} color="var(--viz-neg)" weight={700}>
            {narrow ? 'explodes' : 'loss explodes'}
          </Label>
          <VLine x={suggest} color="var(--viz-3)" dash="5 4" width={1.8} />
          <Label x={suggest} y={0.12} dx={-5} anchor="end" size={12} color="var(--viz-3)" weight={700}>
            {`÷10 ≈ ${fmtLR(lrAtMin / 10)}`}
          </Label>
          <Dots points={[{ x: LX[minIdx], y: RANGE.smooth[minIdx], r: 5, color: 'var(--viz-ink)', label: narrow ? 'lowest' : `lowest ≈ ${fmtLR(lrAtMin)}` }]} />
          <DraggablePoint
            x={x}
            y={curveY(x)}
            color="var(--viz-2)"
            label={`lr ${fmtLR(prev.lr)}`}
            onChange={(nx) => setK(snapK(nx))}
            constrain={(nx) => {
              const sx = -4 + 0.2 * snapK(nx)
              return [sx, curveY(sx)]
            }}
          />
        </Plot>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>
          Training at a constant learning rate of {fmtLR(prev.lr)}
        </div>
        <Plot
          x={[0, PREVIEW_STEPS]}
          y={[0, Y_TOP]}
          width={W}
          height={170}
          minHeight={150}
          maxWidth={720}
          margin={{ left: 40, right: 14, top: 12 }}
          ariaLabel={`Training loss over ${PREVIEW_STEPS} steps at learning rate ${fmtLR(prev.lr)}: starts at ${prev.loss[0].toFixed(2)}, ends at ${prev.loss[prev.loss.length - 1].toFixed(2)}.`}
        >
          <Grid xTicks={8} yTicks={3} />
          <Axes xLabel="training step" yLabel="loss" xTicks={narrow ? 4 : 8} yTicks={3} />
          <Path points={PREVIEWS[14].loss.map((l, i): [number, number] => [i * PREVIEW_EVERY, Math.min(l, Y_TOP)])} color="var(--viz-3)" width={1.6} dash="5 4" opacity={0.7} />
          <Path points={prev.loss.map((l, i): [number, number] => [i * PREVIEW_EVERY, Math.min(l, Y_TOP)])} color="var(--viz-2)" width={2.8} />
          {prev.loss.some((l) => l > Y_TOP) && (
            <Label x={PREVIEW_STEPS} y={Y_TOP} dx={-4} dy={14} anchor="end" size={12} color="var(--viz-neg)" weight={700}>
              ▲ off the chart
            </Label>
          )}
        </Plot>
        <Legend
          items={[
            { color: 'var(--viz-1)', label: 'range test (smoothed)' },
            { color: 'var(--viz-muted)', label: 'single steps', dot: true },
            { color: 'var(--viz-2)', label: 'your learning rate' },
            { color: 'var(--viz-3)', label: `lr ${fmtLR(PREVIEWS[14].lr)} (nearest run to the ÷10 choice)`, dash: true },
          ]}
        />
        <Note tone={v.tone}>
          <b>{v.title}</b> {v.text}
        </Note>
      </div>
      <Controls>
        <Slider label="Learning rate" value={k} min={0} max={PREVIEWS.length - 1} step={1} onChange={setK} format={(i) => fmtLR(PREVIEWS[i].lr)} />
        <Readout
          items={[
            ['learning rate', fmtLR(prev.lr)],
            ['loss after 200 steps', prev.loss[prev.loss.length - 1].toFixed(3)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
