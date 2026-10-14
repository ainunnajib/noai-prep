import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Toggle, Plot, Grid, Axes, Rect, Path, Dots, Label, HLine, DraggablePoint, Bars, mulberry32, type DotDatum } from '../../../../../kit'

/*
  48 hourly temperature readings from a weather station (a daily cycle plus noise).
  A run of readings is missing. Three fills are compared with the hidden true values:
  forward-fill (repeat the last reading), linear interpolation (straight line between the
  readings either side), and the global mean of all readings.
*/

const N = 48
const TRUE_T: number[] = (() => {
  const rng = mulberry32(2027)
  const gauss = () => {
    const u = Math.max(1e-9, rng())
    const v = rng()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  let e = 0
  return Array.from({ length: N }, (_, t) => {
    e = 0.6 * e + 0.32 * gauss()
    return Math.round((28 + 3.2 * Math.cos((2 * Math.PI * (t - 14)) / 24) + e) * 10) / 10
  })
})()

const Y: [number, number] = [22.5, 33.5]
const COL = { ffill: 'var(--viz-2)', interp: 'var(--viz-3)', mean: 'var(--viz-4)' }

export default function ForwardFillTimeline() {
  const [start, setStart] = useState(10)
  const [len, setLen] = useState(4)
  const [show, setShow] = useState({ ffill: true, interp: true, mean: true })
  const [truth, setTruth] = useState(false)

  const s = Math.min(start, N - 1 - len)
  const gap = Array.from({ length: len }, (_, k) => s + k)
  const before = TRUE_T[s - 1]
  const after = TRUE_T[s + len]

  const { fills, mae, globalMean } = useMemo(() => {
    const observed = TRUE_T.filter((_, t) => t < s || t >= s + len)
    const gm = observed.reduce((a, b) => a + b, 0) / observed.length
    const f = {
      ffill: gap.map(() => before),
      interp: gap.map((_, k) => before + ((after - before) * (k + 1)) / (len + 1)),
      mean: gap.map(() => gm),
    }
    const err = (vals: number[]) => vals.reduce((acc, v, k) => acc + Math.abs(v - TRUE_T[gap[k]]), 0) / len
    return { fills: f, mae: { ffill: err(f.ffill), interp: err(f.interp), mean: err(f.mean) }, globalMean: gm }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, len])

  const leftPart: [number, number][] = TRUE_T.slice(0, s).map((v, t) => [t, v])
  const rightPart: [number, number][] = TRUE_T.slice(s + len).map((v, t) => [t + s + len, v])
  const observedDots: DotDatum[] = [...leftPart, ...rightPart].map(([x, y]) => ({ x, y, r: 3, color: 'var(--viz-1)' }))

  return (
    <Figure
      title="Filling a gap in a time series"
      caption={
        <>
          Hourly temperatures (°C) at a weather station over two days. The shaded hours are missing. Drag the handle under the gap to move it, and
          make it longer with the slider. The bars score each fill by its average error against the true readings (lower is better); switch on{' '}
          <b>reveal the true readings</b> to see why. Try a long gap in the afternoon too.
        </>
      }
    >
      <Plot x={[-0.5, N - 0.5]} y={Y} width={540} height={290} minHeight={250} margin={{ left: 38, bottom: 34, top: 12 }} ariaLabel={`Temperature over 48 hours with ${len} missing hours starting at hour ${s}`}>
        <Grid xTicks={8} yTicks={5} />
        <Rect x0={s - 0.5} x1={s + len - 0.5} y0={Y[0]} y1={Y[1]} fill="color-mix(in srgb, var(--viz-neg) 12%, transparent)" />
        <Axes xLabel="hour" yLabel="°C" xTicks={8} yTicks={5} />
        <Path points={leftPart} color="var(--viz-1)" width={1.8} />
        <Path points={rightPart} color="var(--viz-1)" width={1.8} />
        <Dots points={observedDots} stroke="none" />
        {show.mean && (
          <>
            <HLine y={globalMean} color={COL.mean} dash="2 4" width={1.5} />
            <Dots points={gap.map((t, k) => ({ x: t, y: fills.mean[k], r: 4.5, color: COL.mean, shape: 'square' as const }))} />
          </>
        )}
        {show.ffill && (
          <>
            <Path points={[[s - 1, before], [s + len - 1 + 0.5, before]]} color={COL.ffill} width={2.5} />
            <Dots points={gap.map((t, k) => ({ x: t, y: fills.ffill[k], r: 4.5, color: COL.ffill, shape: 'triangle' as const }))} />
          </>
        )}
        {show.interp && (
          <>
            <Path points={[[s - 1, before], [s + len, after]]} color={COL.interp} width={2.5} />
            <Dots points={gap.map((t, k) => ({ x: t, y: fills.interp[k], r: 4.5, color: COL.interp }))} />
          </>
        )}
        {truth && (
          <>
            <Path points={[[s - 1, before], ...gap.map((t) => [t, TRUE_T[t]] as [number, number]), [s + len, after]]} color="var(--viz-ink)" width={1.6} dash="4 3" />
            <Dots points={gap.map((t) => ({ x: t, y: TRUE_T[t], r: 4, color: 'var(--viz-ink)', hollow: true }))} />
          </>
        )}
        <Label x={s + len / 2 - 0.5} y={Y[1]} dy={13} anchor="middle" size={11} color="var(--viz-neg)">
          missing
        </Label>
        <DraggablePoint
          x={s + (len - 1) / 2}
          y={Y[0] + 0.55}
          r={8}
          lockY
          color="var(--viz-neg)"
          label="drag the gap"
          constrain={(x, y) => [Math.round(x - (len - 1) / 2) + (len - 1) / 2, y]}
          onChange={(x) => setStart(Math.max(1, Math.min(N - 1 - len, Math.round(x - (len - 1) / 2))))}
        />
      </Plot>
      <Controls>
        <Slider label="gap length (hours)" value={len} min={1} max={12} step={1} onChange={setLen} />
        <Toggle label={<span style={{ color: COL.ffill, fontWeight: 700 }}>▲ forward-fill</span>} checked={show.ffill} onChange={(v) => setShow({ ...show, ffill: v })} />
        <Toggle label={<span style={{ color: COL.interp, fontWeight: 700 }}>● interpolate</span>} checked={show.interp} onChange={(v) => setShow({ ...show, interp: v })} />
        <Toggle label={<span style={{ color: COL.mean, fontWeight: 700 }}>■ global mean</span>} checked={show.mean} onChange={(v) => setShow({ ...show, mean: v })} />
        <Toggle label="reveal the true readings" checked={truth} onChange={setTruth} />
      </Controls>
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: 'var(--step--1)', color: 'var(--ink-2)', fontWeight: 700, marginBottom: '0.3rem' }}>average error in the gap (°C)</div>
        <Bars
          format={(v) => v.toFixed(2)}
          max={Math.max(0.5, mae.ffill, mae.interp, mae.mean)}
          ariaLabel="Mean absolute error of each fill"
          data={[
            { label: 'forward-fill', value: mae.ffill, color: COL.ffill, strong: mae.ffill <= Math.min(mae.interp, mae.mean) },
            { label: 'interpolate', value: mae.interp, color: COL.interp, strong: mae.interp <= Math.min(mae.ffill, mae.mean) },
            { label: 'global mean', value: mae.mean, color: COL.mean, strong: mae.mean <= Math.min(mae.ffill, mae.interp) },
          ]}
        />
      </div>
    </Figure>
  )
}
