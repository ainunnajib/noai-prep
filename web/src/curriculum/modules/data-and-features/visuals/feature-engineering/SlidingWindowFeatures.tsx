import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, Path, Dots, Label, Rect, DraggablePoint, mulberry32, M } from '../../../../../kit'

/*
  Sliding-window features on a smartwatch movement signal with three activities:
    sitting (calm, level 3), brushing teeth (level 3 but shaking a lot), walking (level 6, rhythmic).
  The learner drags the window along the signal and changes its size; the window's mean, standard
  deviation, minimum and maximum are computed live, and the rolling mean / min-max band / rolling
  standard deviation are drawn for every position. Aha: the rolling mean cannot tell sitting from
  brushing teeth, the rolling standard deviation can; a few window statistics turn a long sequence
  into a short, fixed-size feature vector.
*/

const N = 120
const PHASES = [
  { from: 0, to: 40, name: 'sitting' },
  { from: 40, to: 80, name: 'brushing teeth' },
  { from: 80, to: 120, name: 'walking' },
]

function makeSignal() {
  const rnd = mulberry32(5)
  const gauss = () => {
    const u = Math.max(1e-9, rnd())
    const v = rnd()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  return Array.from({ length: N }, (_, t) => {
    if (t < 40) return 3 + 0.12 * gauss()
    if (t < 80) return 3 + 1.4 * Math.sin((2 * Math.PI * t) / 5) + 0.25 * gauss()
    return 6 + 0.8 * Math.sin((2 * Math.PI * t) / 8) + 0.2 * gauss()
  })
}

function stats(w: number[]) {
  const k = w.length
  const mean = w.reduce((a, b) => a + b, 0) / k
  const std = Math.sqrt(w.reduce((a, b) => a + (b - mean) * (b - mean), 0) / k)
  return { mean, std, min: Math.min(...w), max: Math.max(...w) }
}

const small: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }
const f2 = (v: number) => v.toFixed(2)

export default function SlidingWindowFeatures() {
  const x = useMemo(makeSignal, [])
  const [k, setK] = useState(10)
  const [t, setT] = useState(60)
  const [showMean, setShowMean] = useState(true)
  const [showStd, setShowStd] = useState(true)
  const [showMinMax, setShowMinMax] = useState(false)

  const tt = Math.max(k - 1, t)
  const roll = useMemo(() => x.map((_, i) => (i < k - 1 ? null : stats(x.slice(i - k + 1, i + 1)))), [x, k])
  const cur = roll[tt]!
  const valid = roll.map((r, i) => [i, r] as const).filter((p): p is readonly [number, NonNullable<typeof cur>] => p[1] != null)
  const stdTop = Math.max(1.6, ...valid.map(([, r]) => r.std)) * 1.08

  return (
    <Figure
      title="Slide a window, summarise what is inside"
      caption={
        <>
          Drag the shaded window along the smartwatch signal and change its size. For each position, the window's <M>k</M> readings are summarised
          as a few numbers: mean, standard deviation (dividing by <M>k</M>), minimum and maximum. Compare <b>sitting</b> with <b>brushing teeth</b>:
          their rolling means are almost identical, but the rolling standard deviation tells them apart at once. Where the activity changes, the window holds readings from both, so the features blur and the standard
          deviation spikes. A bigger window gives smoother features but reacts more slowly to such changes. The first <M>k-1</M> positions have no full window, so they have no value.
        </>
      }
    >
      <div style={{ width: '100%' }}>
        <div style={small}>Movement signal, with the window (shaded) {showMean ? 'and the rolling mean' : ''}</div>
        <Plot x={[-1, N]} y={[-0.4, 9.8]} width={560} height={250} maxWidth={720} minHeight={240} margin={{ top: 22, left: 34 }} ariaLabel={`Signal of ${N} readings with a window of ${k} readings ending at position ${tt}`}>
          {PHASES.map((p, i) => (
            <Rect key={p.name} x0={p.from - 0.5} x1={p.to - 0.5} y0={-0.4} y1={9.8} fill={i % 2 ? 'var(--surface-2)' : 'var(--surface)'} />
          ))}
          <Grid xTicks={12} yTicks={5} />
          <Axes xLabel="time step" xTicks={6} yTicks={5} />
          {PHASES.map((p) => (
            <Label key={p.name} x={(p.from + p.to) / 2 - 0.5} y={9.8} dy={-8} anchor="middle" color="var(--ink-2)" size={12}>
              {p.name}
            </Label>
          ))}
          {showMinMax && (
            <Path
              points={[...valid.map(([i, r]): [number, number] => [i, r.max]), ...valid.map(([i, r]): [number, number] => [i, r.min]).reverse()]}
              closed
              color="none"
              fill="color-mix(in srgb, var(--viz-3) 22%, transparent)"
            />
          )}
          <Rect x0={tt - k + 0.5} x1={tt + 0.5} y0={-0.4} y1={9.8} fill="color-mix(in srgb, var(--viz-2) 20%, transparent)" stroke="var(--viz-2)" />
          <Path points={x.map((v, i): [number, number] => [i, v])} color="var(--viz-muted)" width={1.3} />
          <Dots points={x.map((v, i) => ({ x: i, y: v, r: i > tt - k && i <= tt ? 3.6 : 2.2, color: i > tt - k && i <= tt ? 'var(--viz-2)' : 'var(--viz-axis)' }))} stroke="none" />
          {showMean && <Path points={valid.map(([i, r]): [number, number] => [i, r.mean])} color="var(--viz-1)" width={2.6} />}
          {showMinMax && (
            <>
              <Path points={[[tt - k + 0.5, cur.max], [tt + 0.5, cur.max]]} color="var(--viz-3)" width={2.4} />
              <Path points={[[tt - k + 0.5, cur.min], [tt + 0.5, cur.min]]} color="var(--viz-3)" width={2.4} />
            </>
          )}
          {showMean && <Dots points={[{ x: tt, y: cur.mean, r: 5.5, color: 'var(--viz-1)' }]} />}
          <DraggablePoint
            x={tt}
            y={0.25}
            lockY
            color="var(--viz-2)"
            r={8}
            label="drag window"
            onChange={(nx) => setT((p) => {
              let r = Math.round(nx)
              if (r === p && Math.abs(nx - p) > 0.6) r = p + Math.sign(nx - p)
              return Math.max(k - 1, Math.min(N - 1, r))
            })}
          />
        </Plot>
      </div>
      {showStd && (
        <div style={{ width: '100%' }}>
          <div style={small}>Rolling standard deviation (how much the signal shakes inside the window)</div>
          <Plot x={[-1, N]} y={[0, stdTop]} width={560} height={130} maxWidth={720} minHeight={120} margin={{ top: 10, left: 34 }} ariaLabel={`Rolling standard deviation with window ${k}; current value ${f2(cur.std)}`}>
            {PHASES.map((p, i) => (
              <Rect key={p.name} x0={p.from - 0.5} x1={p.to - 0.5} y0={0} y1={stdTop} fill={i % 2 ? 'var(--surface-2)' : 'var(--surface)'} />
            ))}
            <Grid xTicks={12} yTicks={3} />
            <Axes xTicks={6} yTicks={3} />
            <Path points={[[tt, 0], [tt, stdTop]]} color="var(--viz-2)" width={1.5} dash="4 3" />
            <Path points={valid.map(([i, r]): [number, number] => [i, r.std])} color="var(--viz-5)" width={2.6} />
            <Dots points={[{ x: tt, y: cur.std, r: 5.5, color: 'var(--viz-5)' }]} />
          </Plot>
        </div>
      )}
      <Controls>
        <Slider label={<>window size <M>k</M></>} value={k} min={2} max={30} onChange={(v) => { setK(v); setT((p) => Math.max(v - 1, p)) }} />
      </Controls>
      <Controls>
        <Toggle label="rolling mean" checked={showMean} onChange={setShowMean} />
        <Toggle label="rolling std" checked={showStd} onChange={setShowStd} />
        <Toggle label="rolling min & max" checked={showMinMax} onChange={setShowMinMax} />
      </Controls>
      <Readout
        items={[
          ['window', `steps ${tt - k + 1}–${tt}`],
          ['mean', f2(cur.mean)],
          ['std', f2(cur.std)],
          ['min', f2(cur.min)],
          ['max', f2(cur.max)],
        ]}
      />
      <div style={{ fontSize: '0.95rem', color: 'var(--ink-2)', textAlign: 'center' }}>
        {k} raw readings → feature vector <M>{`[${f2(cur.mean)},\\ ${f2(cur.std)},\\ ${f2(cur.min)},\\ ${f2(cur.max)}]`}</M>
      </div>
    </Figure>
  )
}
