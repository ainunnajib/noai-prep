import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, Path, Dots, Label, Rect, VLine, DraggablePoint, usePlot, useNarrow, mulberry32 } from '../../../../../kit'
import { Legend, Note } from './parts'

/*
  Why clip, and where to set max_norm. Noisy SGD (learning rate 0.1) on the bowl
    L(w) = 1/2 (w1^2 + 4 w2^2), starting at w = (7, -5),
  with mini-batch noise (sd 0.7 per component) and three "bad batches" (steps 45, 110, 160) whose
  gradients are 30 to 90 times the usual size. Top: the gradient norm at every step (before clipping)
  and the threshold max_norm, which you can drag. Bottom: the loss without clipping (dashed) and with
  clipping at your threshold (solid). Everything is simulated live from a fixed random seed.
  Aha: a threshold just above the typical gradient size removes the spikes and leaves normal steps alone.
*/

const T = 200
const LR = 0.1
const SIG = 0.7
const SPIKES: [number, number][] = [
  [45, 60],
  [110, 35],
  [160, 90],
]
const Y_NORM: [number, number] = [-1, 2.2]
const Y_LOSS: [number, number] = [-3, 2.5]

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-12)
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// fixed noise and spike directions, shared by every run
const NOISE: [number, number][] = []
const SPIKE_VEC = new Map<number, [number, number]>()
{
  const r = mulberry32(11)
  for (let t = 0; t < T; t++) NOISE.push([SIG * gauss(r), SIG * gauss(r)])
  for (const [t, m] of SPIKES) {
    const a = 2 * Math.PI * r()
    SPIKE_VEC.set(t, [m * Math.cos(a), m * Math.sin(a)])
  }
}

interface Run {
  loss: number[]
  norm: number[]
  clipped: number
  clippedAt: number[]
}

function run(c: number | null): Run {
  let w1 = 7
  let w2 = -5
  const loss: number[] = []
  const norm: number[] = []
  let clipped = 0
  const clippedAt: number[] = []
  for (let t = 0; t <= T; t++) {
    loss.push(0.5 * (w1 * w1 + 4 * w2 * w2))
    if (t === T) break
    let g1 = w1 + NOISE[t][0]
    let g2 = 4 * w2 + NOISE[t][1]
    const s = SPIKE_VEC.get(t)
    if (s) {
      g1 += s[0]
      g2 += s[1]
    }
    const n = Math.hypot(g1, g2)
    norm.push(n)
    const f = c !== null && n > c ? c / n : 1
    if (f < 1) {
      clipped++
      clippedAt.push(t)
    }
    w1 -= LR * f * g1
    w2 -= LR * f * g2
  }
  return { loss, norm, clipped, clippedAt }
}

const stepsTo = (loss: number[], th = 0.1) => {
  const i = loss.findIndex((v) => v < th)
  return i < 0 ? null : i
}
const worstAfter = (loss: number[], from = 44) => Math.max(...loss.slice(from))
const lg = (v: number) => Math.log10(Math.max(v, 1e-6))
const tickPow = (v: number) => (Number.isInteger(v) ? String(Number((10 ** v).toFixed(Math.max(0, -v)))) : '')
const fmtC = (c: number) => (c >= 10 ? c.toFixed(0) : c.toFixed(1))

const BASE = run(null)
const MEDIAN = [...BASE.norm].sort((a, b) => a - b)[Math.floor(T / 2)]

function Shade({ y0, color }: { y0: number; color: string }) {
  const { xs, ys, clipId } = usePlot()
  const [x0, x1] = xs.range()
  const top = ys.range()[1]
  return <rect clipPath={`url(#${clipId})`} x={x0} y={top} width={x1 - x0} height={Math.max(0, ys(y0) - top)} style={{ fill: color }} />
}

export default function SpikeClipping() {
  const [logC, setLogC] = useState(Math.log10(4))
  const [on, setOn] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const c = 10 ** logC
  const res = useMemo(() => run(on ? c : null), [on, c])

  const base2 = stepsTo(BASE.loss)
  const mine2 = stepsTo(res.loss)
  const worstBase = worstAfter(BASE.loss)
  const worstMine = worstAfter(res.loss)
  const pctClipped = (100 * res.clipped) / T
  // clipped steps that are neither part of the opening run of large early gradients nor a bad batch
  let earlyRun = 0
  while (res.clippedAt[earlyRun] === earlyRun) earlyRun++
  const ordinaryClipped = res.clippedAt.filter((t) => t >= earlyRun && !SPIKE_VEC.has(t)).length

  let tone: 'good' | 'bad' | 'warn' | 'plain' = 'plain'
  let msg: string
  if (!on || res.clipped === 0) {
    tone = 'bad'
    msg = `Nothing is clipped${on ? ` (max_norm ${fmtC(c)} is above every gradient)` : ''}. Each bad batch throws the weights far from the minimum: the loss leaps from about 0.01 to ${worstBase.toFixed(0)} and needs dozens of steps to recover. In a real network one such step can wreck hours of training or turn the loss into nan.`
  } else if (c < MEDIAN * 1.5) {
    tone = 'warn'
    msg = `max_norm ${fmtC(c)} is at or below the typical gradient size (about ${MEDIAN.toFixed(1)}), so ${pctClipped.toFixed(0)}% of all steps are clipped. Clipping now acts like a much smaller learning rate: the loss first drops below 0.1 only at step ${mine2 ?? 'never'} (versus ${base2} without clipping).`
  } else if (worstMine > 1) {
    tone = 'warn'
    msg = `max_norm ${fmtC(c)} is so high that the bad batches still get through partly: the worst jump is to ${worstMine.toFixed(1)} (versus ${worstBase.toFixed(0)} without clipping). Lower the threshold towards the typical gradient size.`
  } else if (ordinaryClipped > 0) {
    tone = 'warn'
    msg = `The spikes are tamed (worst loss ${worstMine.toFixed(2)} instead of ${worstBase.toFixed(0)}), but ${ordinaryClipped} ordinary step${ordinaryClipped > 1 ? 's are' : ' is'} clipped too, on top of the first ${earlyRun} (large but honest gradients) and the three bad batches. Raise the threshold a little so that normal steps pass untouched.`
  } else {
    tone = 'good'
    msg = `Only ${res.clipped} of ${T} steps are clipped: the first few (large but honest gradients) and the three bad batches. The spikes barely move the loss (worst ${worstMine.toFixed(2)} instead of ${worstBase.toFixed(0)}), and ordinary steps are left exactly as they were.`
  }

  const W = narrow ? 360 : 600
  const normPts = res.norm.map((n, t): [number, number] => [t, lg(n)])
  const over = on ? res.norm.map((n, t) => ({ n, t })).filter(({ n }) => n > c) : []

  return (
    <Figure
      title="Choosing max_norm: spikes versus normal steps"
      caption={
        <>
          Noisy gradient descent on a simple bowl, with three <b>bad batches</b> (steps 45, 110 and 160) whose gradients are 30 to 90 times the usual
          size. <b>Drag the threshold</b> (green handle) or use the slider. Top: the length of every gradient before clipping; anything above the line
          gets clipped. Bottom: the loss without clipping (dashed) and with it (solid). Try 100, then 0.5, then about 4.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.55rem', justifyItems: 'center' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>Gradient norm ‖g‖ at each step (log scale)</div>
        <Plot
          x={[0, T]}
          y={Y_NORM}
          width={W}
          height={190}
          minHeight={170}
          maxWidth={720}
          margin={{ left: 46, right: 18, top: 12 }}
          ariaLabel={`Gradient norms: about ${MEDIAN.toFixed(1)} on a typical step, up to 90 at the bad batches. Threshold ${on ? fmtC(c) : 'off'}; ${res.clipped} steps clipped.`}
        >
          <Grid xTicks={narrow ? 4 : 8} yTicks={3} />
          {on && <Shade y0={logC} color="color-mix(in srgb, var(--viz-3) 10%, transparent)" />}
          <Axes xLabel="step" xTicks={narrow ? 4 : 8} hideYTicks />
          <Axes yTicks={3} hideXTicks tickFormat={tickPow} />
          <Path points={normPts} color="var(--viz-1)" width={1.6} />
          {on && <Dots points={over.map(({ n, t }) => ({ x: t, y: lg(n), r: 3.2, color: 'var(--viz-4)' }))} />}
          {SPIKES.filter(([t]) => !narrow || t === 45).map(([t]) => (
            <Label key={t} x={t} y={lg(BASE.norm[t])} dx={t > 150 ? -7 : 7} dy={4} anchor={t > 150 ? 'end' : 'start'} size={11.5} color="var(--viz-4)" weight={700}>
              bad batch
            </Label>
          ))}
          {on && (
            <>
              <Path points={[[0, logC], [T, logC]]} color="var(--viz-3)" width={2} dash="6 4" />
              <Label x={T} y={logC} dx={-16} dy={logC < 0.25 || logC > 1.5 ? 15 : -7} anchor="end" size={12} color="var(--viz-3)" weight={700}>
                {`max_norm = ${fmtC(c)}`}
              </Label>
              <DraggablePoint
                x={T}
                y={logC}
                lockX
                color="var(--viz-3)"
                r={8}
                onChange={(_, y) => setLogC(Math.round(Math.max(-0.3, Math.min(2, y)) * 20) / 20)}
              />
            </>
          )}
        </Plot>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>Training loss (log scale)</div>
        <Plot
          x={[0, T]}
          y={Y_LOSS}
          width={W}
          height={narrow ? 200 : 210}
          minHeight={180}
          maxWidth={720}
          margin={{ left: 46, right: 18, top: 12 }}
          ariaLabel={`Loss without clipping jumps to ${worstBase.toFixed(0)} after bad batches. With clipping at ${on ? fmtC(c) : 'off'} the worst value after step 44 is ${worstMine.toFixed(2)}.`}
        >
          <Grid xTicks={narrow ? 4 : 8} yTicks={5} />
          {SPIKES.map(([t]) => (
            <Rect key={t} x0={t - 0.5} x1={t + 0.5} y0={Y_LOSS[0]} y1={Y_LOSS[1]} fill="color-mix(in srgb, var(--viz-4) 35%, transparent)" />
          ))}
          <Axes xLabel="step" xTicks={narrow ? 4 : 8} hideYTicks />
          <Axes yTicks={5} hideXTicks tickFormat={tickPow} />
          <Path points={BASE.loss.map((v, t): [number, number] => [t, lg(v)])} color="var(--viz-muted)" width={1.8} dash="5 4" />
          {on && <Path points={res.loss.map((v, t): [number, number] => [t, lg(v)])} color="var(--viz-2)" width={2.6} />}
          {mine2 !== null && on && <VLine x={mine2} color="var(--viz-2)" dash="2 4" width={1.2} />}
          {mine2 !== null && on && (
            <Label x={mine2} y={Y_LOSS[1]} dx={mine2 > 150 ? -5 : 5} dy={12} anchor={mine2 > 150 ? 'end' : 'start'} size={11} color="var(--viz-2)" weight={700}>
              {narrow ? '< 0.1' : 'first loss < 0.1'}
            </Label>
          )}
        </Plot>
        <Legend
          items={[
            { color: 'var(--viz-1)', label: 'gradient norm' },
            { color: 'var(--viz-4)', label: 'clipped steps', dot: true },
            { color: 'var(--viz-muted)', label: 'loss, no clipping', dash: true },
            { color: 'var(--viz-2)', label: 'loss, with clipping' },
          ]}
        />
        <Note tone={tone}>{msg}</Note>
      </div>
      <Controls>
        <Toggle label="Clipping on" checked={on} onChange={setOn} />
        <Slider label="max_norm" value={logC} min={-0.3} max={2} step={0.05} onChange={setLogC} format={(v) => fmtC(10 ** v)} />
        <Readout
          items={[
            ['steps clipped', on ? `${res.clipped} of ${T}` : '0'],
            ['first step with loss < 0.1', String(mine2 ?? '—')],
            ['worst loss after a bad batch', worstMine.toFixed(2)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
