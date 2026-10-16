import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Grid, Axes, Path, Rect, Label, VLine, DraggablePoint, useNarrow, mulberry32 } from '../../../../../kit'
import { fmtLR } from './schedules'
import { Legend, Note } from './parts'

/*
  Schedule -> loss. A toy model is trained live with noisy gradient descent (SGD) for 300 steps:
    loss(x, y, z) = 1/2 x^2 + 1/2 (1 + x^2) y^2 + 1/2 * 0.02 z^2,  start (3, 1, 2),
  gradient noise of size 0.3 on every coordinate (like mini-batch noise). The valley is steep where
  training starts (curvature 1 + x^2 = 10 in y) and gentle near the minimum, and the z direction is
  very flat, so it needs a big learning rate to make progress. Top: the learning rate; bottom: the
  loss (log scale) under that schedule.
  Aha: loss-curve features (early blow-ups, plateaus, sudden drops) are fingerprints of the schedule.
*/

type Kind = 'constant' | 'step' | 'cosine'
const T = 300
const STEP_EVERY = 100
const GAMMA = 0.1
const NOISE = 0.3
const LOG_LO = -4
const LOG_HI = 2.5

function lrOf(t: number, kind: Kind, base: number, W: number): number {
  if (t < W) return (base * t) / W
  if (kind === 'constant') return base
  if (kind === 'step') return base * GAMMA ** Math.floor(t / STEP_EVERY)
  return 0.5 * base * (1 + Math.cos((Math.PI * (t - W)) / (T - W)))
}

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-12)
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

interface Sim {
  lr: number[]
  loss: number[]
  smooth: number[]
  divergedAt: number | null
}

function simulate(kind: Kind, base: number, W: number): Sim {
  const r = mulberry32(3)
  let x = 3
  let y = 1
  let z = 2
  const lr: number[] = []
  const loss: number[] = []
  const smooth: number[] = []
  let ema = 0
  let divergedAt: number | null = null
  for (let t = 0; t <= T; t++) {
    const eta = lrOf(t, kind, base, W)
    const a = 1 + x * x
    const L = 0.5 * x * x + 0.5 * a * y * y + 0.5 * 0.02 * z * z
    lr.push(eta)
    if (!Number.isFinite(L) || L > 1e4) {
      divergedAt = t
      break
    }
    loss.push(L)
    ema = t === 0 ? L : 0.9 * ema + 0.1 * L
    smooth.push(ema)
    const gx = x + x * y * y + NOISE * gauss(r)
    const gy = a * y + NOISE * gauss(r)
    const gz = 0.02 * z + NOISE * gauss(r)
    x -= eta * gx
    y -= eta * gy
    z -= eta * gz
  }
  for (let t = lr.length; t <= T; t++) lr.push(lrOf(t, kind, base, W))
  return { lr, loss, smooth, divergedAt }
}

const lg = (v: number) => Math.max(LOG_LO, Math.min(LOG_HI + 0.3, Math.log10(Math.max(v, 1e-12))))
const tickPow = (v: number) => (Number.isInteger(v) ? String(Number((10 ** v).toFixed(Math.max(0, -v)))) : '')

const PRESETS: { label: string; kind: Kind; base: number; W: number }[] = [
  { label: 'Cautious', kind: 'constant', base: 0.1, W: 0 },
  { label: 'Bold, no warm-up', kind: 'cosine', base: 0.8, W: 0 },
  { label: 'Bold + warm-up', kind: 'cosine', base: 0.8, W: 30 },
  { label: 'Step decay', kind: 'step', base: 0.8, W: 30 },
]

export default function ScheduleLossCoupling() {
  const [kind, setKind] = useState<Kind>('cosine')
  const [base, setBase] = useState(0.8)
  const [W, setW] = useState(0)
  const [t, setT] = useState(150)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)

  const sim = useMemo(() => simulate(kind, base, W), [kind, base, W])
  const lrMax = Math.max(0.2, base * 1.1)
  const alive = sim.divergedAt === null || t < sim.divergedAt
  const lossAt = alive ? sim.loss[t] : Infinity
  const finalLoss = sim.divergedAt === null ? sim.smooth.slice(-20).reduce((a, b) => a + b, 0) / 20 : Infinity

  let tone: 'good' | 'bad' | 'warn' | 'plain' = 'plain'
  let msg: string
  if (sim.divergedAt !== null && sim.divergedAt < 60 && W === 0) {
    tone = 'bad'
    msg = `Blew up at step ${sim.divergedAt}. At the start the valley is steep, so a learning rate of ${base} makes every step overshoot further than the last. Add a warm-up of 20 to 40 steps and run it again.`
  } else if (sim.divergedAt !== null) {
    tone = 'bad'
    msg = `Blew up at step ${sim.divergedAt}. ${W > 0 ? 'Warm-up got it started, but this' : 'This'} learning rate is too big even for the gentle part of the valley. Lower the base learning rate.`
  } else if (kind === 'constant' && base < 0.3) {
    tone = 'warn'
    msg = `Safe but slow: after ${T} steps the loss is still about ${finalLoss.toFixed(3)}. Small steps crawl along the flat direction of the valley. A bigger peak rate (with warm-up) and a decay would get much lower.`
  } else if (kind === 'constant') {
    tone = 'warn'
    msg = `It trains, but a big constant rate never shrinks its noisy steps, so the loss keeps bouncing around ${finalLoss.toFixed(3)} instead of settling. Switch to cosine or step decay.`
  } else if (finalLoss < 0.003) {
    tone = 'good'
    msg = `Settled to a loss of about ${finalLoss.toFixed(4)}. ${W > 0 ? 'Warm-up made the big learning rate safe at the start, the ' : 'The '}big rate covered ground fast, and the decay let it settle.${kind === 'step' ? ' Look for the sudden drop just after step 100, where the rate is cut by 10.' : ''}`
  } else {
    msg = `Final loss about ${finalLoss.toFixed(3)}. Safe, but the flat direction of the valley is not fully explored yet. A bigger peak rate, with warm-up to keep the start stable, gets lower.`
  }

  const W2 = narrow ? 360 : 600
  const smoothPts = sim.smooth.map((v, i): [number, number] => [i, lg(v)])
  const rawPts = sim.loss.map((v, i): [number, number] => [i, lg(v)])

  return (
    <Figure
      title="How the schedule shapes the loss curve"
      caption={
        <>
          A toy model trained live with noisy gradient descent for 300 steps. Its valley is steep where training starts and gentle near the bottom,
          with one very flat direction that needs a big learning rate. Start with <b>Bold, no warm-up</b> (it blows up), then <b>Bold + warm-up</b>{' '}
          (same peak rate, now it trains), then <b>Step decay</b> (sudden drops at each cut) and <b>Cautious</b> (safe but stuck higher). Drag the
          marker to read off both curves at one step.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.55rem', justifyItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
          {PRESETS.map((pr) => (
            <Button
              key={pr.label}
              primary={pr.kind === kind && pr.base === base && pr.W === W}
              onClick={() => {
                setKind(pr.kind)
                setBase(pr.base)
                setW(pr.W)
              }}
            >
              {pr.label}
            </Button>
          ))}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>Learning rate</div>
        <Plot x={[0, T]} y={[0, lrMax]} width={W2} height={120} minHeight={110} maxWidth={720} margin={{ left: 46, right: 14, top: 10 }} ariaLabel={`Learning-rate schedule: ${kind}, base ${base}, warm-up ${W} steps.`}>
          <Grid xTicks={6} yTicks={2} />
          {W > 0 && <Rect x0={0} x1={W} y0={0} y1={lrMax} fill="color-mix(in srgb, var(--viz-3) 14%, transparent)" />}
          <Axes xTicks={6} yTicks={2} />
          <Path points={sim.lr.map((v, i): [number, number] => [i, v])} color="var(--viz-1)" width={2.6} />
          <VLine x={t} color="var(--viz-2)" dash="4 4" width={1.4} />
          <DraggablePoint
            x={t}
            y={sim.lr[t]}
            color="var(--viz-2)"
            r={8}
            label={`step ${t}`}
            onChange={(nx) => setT(Math.max(0, Math.min(T, Math.round(nx))))}
            constrain={(nx) => {
              const s = Math.max(0, Math.min(T, Math.round(nx)))
              return [s, sim.lr[s]]
            }}
          />
        </Plot>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>Training loss (log scale)</div>
        <Plot
          x={[0, T]}
          y={[LOG_LO, LOG_HI]}
          width={W2}
          height={narrow ? 210 : 220}
          minHeight={190}
          maxWidth={720}
          margin={{ left: 46, right: 14, top: 10 }}
          ariaLabel={sim.divergedAt !== null ? `Loss blows up at step ${sim.divergedAt}.` : `Loss falls from ${sim.loss[0].toFixed(1)} to about ${finalLoss.toFixed(4)}.`}
        >
          <Grid xTicks={6} yTicks={5} />
          {W > 0 && <Rect x0={0} x1={W} y0={LOG_LO} y1={LOG_HI} fill="color-mix(in srgb, var(--viz-3) 14%, transparent)" />}
          {sim.divergedAt !== null && <Rect x0={sim.divergedAt} x1={T} y0={LOG_LO} y1={LOG_HI} fill="color-mix(in srgb, var(--viz-neg) 12%, transparent)" />}
          <Axes xLabel="step" xTicks={6} hideYTicks />
          <Axes yTicks={5} hideXTicks tickFormat={tickPow} />
          <Path points={rawPts} color="var(--viz-muted)" width={1} opacity={0.7} />
          <Path points={smoothPts} color="var(--viz-2)" width={2.6} />
          {sim.divergedAt !== null && (
            <>
              <Path points={[[sim.divergedAt - 1, lg(sim.loss[sim.loss.length - 1])], [sim.divergedAt, LOG_HI + 0.3]]} color="var(--viz-neg)" width={2.6} />
              <Label x={Math.min(sim.divergedAt + 6, T - 2)} y={LOG_HI - 0.4} anchor={sim.divergedAt > 200 ? 'end' : 'start'} size={12.5} color="var(--viz-neg)" weight={700}>
                {`diverged at step ${sim.divergedAt}`}
              </Label>
            </>
          )}
          <VLine x={t} color="var(--viz-2)" dash="4 4" width={1.4} />
        </Plot>
        <Legend
          items={[
            { color: 'var(--viz-1)', label: 'learning rate' },
            { color: 'var(--viz-muted)', label: 'loss at each step' },
            { color: 'var(--viz-2)', label: 'loss, smoothed' },
            ...(W > 0 ? [{ color: 'color-mix(in srgb, var(--viz-3) 60%, transparent)', label: 'warm-up' }] : []),
          ]}
        />
        <Note tone={tone}>{msg}</Note>
      </div>
      <Controls>
        <Segmented
          label="Schedule after warm-up"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'constant', label: 'constant' },
            { value: 'step', label: 'step ÷10 every 100' },
            { value: 'cosine', label: 'cosine' },
          ]}
        />
        <Slider label="Base (peak) learning rate" value={base} min={0.05} max={1.5} step={0.05} onChange={setBase} format={(v) => v.toFixed(2)} />
        <Slider label="Warm-up steps" value={W} min={0} max={100} step={5} onChange={setW} />
        <Slider label="Marker step" value={t} min={0} max={T} step={1} onChange={setT} />
        <Readout
          items={[
            ['lr at marker', fmtLR(Number(sim.lr[t].toFixed(4)))],
            ['loss at marker', Number.isFinite(lossAt) ? lossAt.toPrecision(3) : 'diverged'],
          ]}
        />
      </Controls>
    </Figure>
  )
}
