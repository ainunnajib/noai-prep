import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Path, Rect, Label, DraggablePoint, usePlot, useNarrow, M } from '../../../../../kit'
import { lrAt, fmtLR, texLR, type Kind, type SchedParams, ONECYCLE_PCT } from './schedules'
import { Note } from './parts'

/*
  Schedule designer: pick a schedule, set its numbers, drag the marker along the curve and read off
  the exact learning rate with the formula filled in.
  Aha: schedule questions are just arithmetic once you can picture the curve.
*/

const BASES = [0.0001, 0.0003, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1]
const TOTALS = [100, 200, 500, 1000, 2000, 5000, 10000]

const KIND_TEXT: Record<Kind, string> = {
  constant: 'The same learning rate for the whole run. Simple, but it never settles: near the end the steps are still big.',
  step: 'Step decay: keep the rate fixed, then multiply it by γ every few steps (or epochs). Each cut shows up as a sudden drop in the loss curve.',
  cosine: 'Cosine decay: glide smoothly from the base rate down to the minimum along half a cosine wave: slow at first, fastest in the middle, gentle at the end.',
  warmcos: 'Warm-up + cosine: ramp up in a straight line from 0 for W steps, then cosine decay over the remaining steps. The default for Transformers.',
  onecycle: '1cycle: rise from base/25 to the peak over the first 30% of training, then anneal to far below the start. The high middle explores; the low end settles.',
}

function GuideLines({ x, y }: { x: number; y: number }) {
  const { xs, ys } = usePlot()
  const [x0] = xs.range()
  const [y0] = ys.range()
  return (
    <g style={{ stroke: 'var(--viz-2)', strokeWidth: 1.4, strokeDasharray: '4 4' }}>
      <line x1={xs(x)} x2={xs(x)} y1={y0} y2={ys(y)} />
      <line x1={x0} x2={xs(x)} y1={ys(y)} y2={ys(y)} />
    </g>
  )
}

export default function ScheduleDesigner() {
  const [kind, setKind] = useState<Kind>('warmcos')
  const [bi, setBi] = useState(2)
  const [ti, setTi] = useState(6)
  const [warmPct, setWarmPct] = useState(10)
  const [gamma, setGamma] = useState(0.1)
  const [everyPct, setEveryPct] = useState(30)
  const [minMode, setMinMode] = useState<'zero' | 'tenth'>('zero')
  const [t, setT] = useState(250)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)

  const base = BASES[bi]
  const T = TOTALS[ti]
  const W = Math.round((T * warmPct) / 100)
  const every = Math.max(1, Math.round((T * everyPct) / 100))
  const min = minMode === 'zero' ? 0 : base / 10
  const p: SchedParams = { kind, base, total: T, warmup: W, gamma, every, min }
  const tt = Math.min(t, T)
  const lr = lrAt(tt, p)
  const stepSize = Math.max(1, T / 400)

  const curve = useMemo(() => {
    const pts: [number, number][] = []
    if (kind === 'step') {
      for (let s = 0; s <= T; s += every) {
        const v = lrAt(s, p)
        pts.push([s, v], [Math.min(T, s + every), v])
      }
      return pts
    }
    const n = 400
    for (let i = 0; i <= n; i++) {
      const s = (T * i) / n
      pts.push([s, lrAt(s, p)])
    }
    return pts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, base, T, W, gamma, every, min])

  const B = texLR(base)
  const Mn = texLR(min)
  let tex = ''
  if (kind === 'constant') tex = `\\eta_{${tt}} = \\eta_{\\max} = ${B}`
  else if (kind === 'step') tex = `\\eta_{${tt}} = ${B} \\times ${gamma}^{\\lfloor ${tt}/${every} \\rfloor} = ${B} \\times ${gamma}^{${Math.floor(tt / every)}} = ${texLR(lr)}`
  else if (kind === 'cosine')
    tex = `\\eta_{${tt}} = ${Mn} + \\tfrac12(${B} - ${Mn})\\left(1 + \\cos\\tfrac{\\pi \\cdot ${tt}}{${T}}\\right) = ${texLR(lr)}`
  else if (kind === 'warmcos')
    tex =
      tt < W
        ? `\\eta_{${tt}} = ${B} \\times \\tfrac{${tt}}{${W}} = ${texLR(lr)}`
        : `\\eta_{${tt}} = ${Mn} + \\tfrac12(${B} - ${Mn})\\left(1 + \\cos\\tfrac{\\pi(${tt} - ${W})}{${T} - ${W}}\\right) = ${texLR(lr)}`
  else tex = `\\eta_{${tt}} = ${texLR(lr)}\\quad(\\text{peak } ${B} \\text{ at step } ${Math.round(ONECYCLE_PCT * T) - 1})`

  const showWarm = kind === 'warmcos' && W > 0
  const yMax = base * 1.1

  return (
    <Figure
      title="Design a learning-rate schedule"
      caption={
        <>
          Choose a schedule and set its numbers, then <b>drag the orange marker</b> (or use the step slider) to read the exact learning rate at any
          step, with the formula filled in. Try warm-up + cosine with base 0.001, 10000 steps and 10% warm-up: step 250 gives 0.00025, and step 5500
          (halfway through the decay) gives exactly half the base rate.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.65rem', justifyItems: 'center' }}>
        <Segmented
          label="Schedule"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'constant', label: 'constant' },
            { value: 'step', label: 'step decay' },
            { value: 'cosine', label: 'cosine' },
            { value: 'warmcos', label: 'warm-up + cosine' },
            { value: 'onecycle', label: '1cycle' },
          ]}
        />
        <Plot
          x={[0, T]}
          y={[0, yMax]}
          width={narrow ? 360 : 600}
          height={narrow ? 240 : 260}
          maxWidth={720}
          margin={{ left: narrow ? 54 : 60, right: 16, top: 16 }}
          ariaLabel={`${kind} learning-rate schedule over ${T} steps with base ${fmtLR(base)}. At step ${tt} the learning rate is ${fmtLR(lr)}.`}
        >
          <Grid xTicks={narrow ? 4 : 8} yTicks={5} />
          {showWarm && <Rect x0={0} x1={W} y0={0} y1={yMax} fill="color-mix(in srgb, var(--viz-3) 13%, transparent)" />}
          {showWarm && (
            <Label x={W / 2} y={yMax} dy={14} anchor="middle" size={11.5} color="var(--viz-3)" weight={700}>
              warm-up
            </Label>
          )}
          <Axes xLabel="step" yLabel="learning rate" xTicks={narrow ? 4 : 8} yTicks={5} tickFormat={(v) => fmtLR(v)} />
          <Path points={curve} color="var(--viz-1)" width={2.8} />
          <GuideLines x={tt} y={lr} />
          <DraggablePoint
            x={tt}
            y={lr}
            color="var(--viz-2)"
            label={fmtLR(lr)}
            onChange={(nx) => setT(Math.round(nx / stepSize) * stepSize)}
            constrain={(nx) => {
              const s = Math.max(0, Math.min(T, Math.round(nx / stepSize) * stepSize))
              return [s, lrAt(s, p)]
            }}
          />
        </Plot>
        <div style={{ maxWidth: '100%', overflowX: 'auto', fontSize: narrow ? '0.85rem' : '0.95rem' }}>
          <M>{tex}</M>
        </div>
        <Note>{KIND_TEXT[kind]}</Note>
      </div>
      <Controls>
        <Slider label="Step t" value={tt} min={0} max={T} step={stepSize} onChange={setT} />
        <Slider label="Base learning rate" value={bi} min={0} max={BASES.length - 1} step={1} onChange={setBi} format={(i) => fmtLR(BASES[i])} />
        <Slider
          label="Total steps T"
          value={ti}
          min={0}
          max={TOTALS.length - 1}
          step={1}
          onChange={(i) => {
            setTi(i)
            setT((old) => Math.round((old * TOTALS[i]) / T))
          }}
          format={(i) => String(TOTALS[i])}
        />
        {kind === 'warmcos' && <Slider label="Warm-up W" value={warmPct} min={0} max={50} step={1} onChange={setWarmPct} format={(v) => `${Math.round((T * v) / 100)} steps`} />}
        {kind === 'step' && <Slider label="Decay every" value={everyPct} min={10} max={50} step={5} onChange={setEveryPct} format={(v) => `${Math.round((T * v) / 100)} steps`} />}
        {kind === 'step' && (
          <Segmented
            label="Factor γ"
            value={gamma}
            onChange={setGamma}
            options={[
              { value: 0.1, label: '0.1' },
              { value: 0.5, label: '0.5' },
            ]}
          />
        )}
        {(kind === 'cosine' || kind === 'warmcos') && (
          <Segmented
            label="Decay down to"
            value={minMode}
            onChange={setMinMode}
            options={[
              { value: 'zero', label: '0' },
              { value: 'tenth', label: 'base ÷ 10' },
            ]}
          />
        )}
        <Readout
          items={[
            ['step', String(tt)],
            ['learning rate', fmtLR(lr)],
            ['÷ base', (lr / base).toFixed(3)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
