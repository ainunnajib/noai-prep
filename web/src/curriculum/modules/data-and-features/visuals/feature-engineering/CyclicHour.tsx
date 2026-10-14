import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Path, Dots, Label, DraggablePoint, usePlot, useNarrow, M } from '../../../../../kit'

/*
  Hours as a feature. As a raw number, 23:00 and 01:00 are 22 apart; on a 24-hour clock they are
  2 hours apart. Encoding the hour as the point (sin(2πh/24), cos(2πh/24)) on a circle makes the
  feature's distances match real time gaps. Both times can be dragged on the number line or on
  the clock; the read-outs compare the raw gap with the distance between the encoded points.
*/

const TAU = Math.PI * 2
const enc = (h: number): [number, number] => [Math.sin((TAU * h) / 24), Math.cos((TAU * h) / 24)]
/** fractional hour (0 to 24) of a point on the clock face; 0 is at the top, clockwise */
const hourFrac = (x: number, y: number) => {
  let a = Math.atan2(x, y)
  if (a < 0) a += TAU
  return (a / TAU) * 24
}
/** snap a dragged point on the clock to a whole hour; small keyboard steps still move one hour */
const dialNudge = (prev: number, x: number, y: number) => {
  const hf = hourFrac(x, y)
  let r = Math.round(hf) % 24
  let diff = hf - prev
  if (diff > 12) diff -= 24
  if (diff < -12) diff += 24
  if (r === prev && Math.abs(diff) > 0.18) r = (prev + Math.sign(diff) + 24) % 24
  return r
}
/** snap a dragged x to a whole hour; a keyboard step (about half an hour) still moves one hour */
const nudge = (prev: number, x: number) => {
  let r = Math.round(x)
  if (r === prev && Math.abs(x - prev) > 0.45) r = prev + Math.sign(x - prev)
  return Math.max(0, Math.min(23, r))
}
const fmt = (h: number) => `${String(h).padStart(2, '0')}:00`
const f3 = (v: number) => (Math.abs(v) < 0.0005 ? '0.000' : v.toFixed(3))

const PRESETS = [
  { value: '23-1', label: '23:00 & 01:00' },
  { value: '11-13', label: '11:00 & 13:00' },
  { value: '6-18', label: '06:00 & 18:00' },
]

function Dial() {
  const { xs, ys } = usePlot()
  const r = xs(1) - xs(0)
  return (
    <g aria-hidden="true">
      <circle cx={xs(0)} cy={ys(0)} r={r} style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
      {Array.from({ length: 24 }, (_, h) => {
        const [sx, sy] = enc(h)
        const big = h % 6 === 0
        const r0 = big ? 0.9 : 0.94
        return <line key={h} x1={xs(sx * r0)} y1={ys(sy * r0)} x2={xs(sx)} y2={ys(sy)} style={{ stroke: 'var(--viz-axis)', strokeWidth: big ? 2 : 1 }} />
      })}
      {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => {
        const [sx, sy] = enc(h)
        return (
          <text key={h} x={xs(sx * 1.17)} y={ys(sy * 1.17)} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12 }}>
            {h}
          </text>
        )
      })}
    </g>
  )
}

/** A plain number line from 0 to 23 (no y-axis) with a tick every hour and labels every 3 hours. */
function HourLine() {
  const { xs, ys } = usePlot()
  const y = ys(-0.55)
  return (
    <g className="plot-axes" aria-hidden="true">
      <line x1={xs(0)} x2={xs(23)} y1={y} y2={y} />
      {Array.from({ length: 24 }, (_, h) => (
        <g key={h} transform={`translate(${xs(h)},${y})`}>
          <line y2={h % 3 === 0 ? 6 : 3} />
          {(h % 3 === 0 || h === 23) && (
            <text y={18} textAnchor="middle">
              {h}
            </text>
          )}
        </g>
      ))}
    </g>
  )
}

const small: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }

export default function CyclicHour() {
  const [a, setA] = useState(23)
  const [b, setB] = useState(1)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const raw = Math.abs(a - b)
  const real = Math.min(raw, 24 - raw)
  const [ax, ay] = enc(a)
  const [bx, by] = enc(b)
  const dist = Math.hypot(ax - bx, ay - by)
  const preset = `${a}-${b}`

  return (
    <Figure
      title="Hours live on a circle, not a line"
      caption={
        <>
          Drag either time on the number line or on the clock (or pick a pair). As a raw number, 23:00 and 01:00 look 22 apart, the same as 01:00 and
          23:00 on opposite ends of the line. Encoded as the point <M>{'(\\sin\\frac{2\\pi h}{24},\\ \\cos\\frac{2\\pi h}{24})'}</M>, they are exactly as
          close as 11:00 and 13:00. Distances between encoded points now grow with the real time gap, which is what a model needs.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Try a pair"
          value={PRESETS.some((p) => p.value === preset) ? preset : ''}
          onChange={(v) => {
            const [p, q] = v.split('-').map(Number)
            setA(p)
            setB(q)
          }}
          options={PRESETS}
        />
      </Controls>
      <div style={{ width: '100%' }}>
        <div style={small}>Hour as a raw number (0 to 23)</div>
        <Plot x={[-0.8, 23.8]} y={[-1, 1]} width={520} height={92} maxWidth={640} minHeight={84} margin={{ top: 6, bottom: 30, left: 16, right: 16 }} ariaLabel={`Number line from 0 to 23 with times ${fmt(a)} and ${fmt(b)}`}>
          <HourLine />
          <Path points={[[Math.min(a, b), 0.05], [Math.max(a, b), 0.05]]} color="var(--viz-neg)" width={3} />
          {raw > 2 && (
            <Label x={(a + b) / 2} y={0.05} dy={-8} anchor="middle" color="var(--viz-neg)">
              {`gap ${raw}`}
            </Label>
          )}
          <DraggablePoint x={a} y={0.35} lockY color="var(--viz-1)" r={8} label="A" onChange={(x) => setA((p) => nudge(p, x))} />
          <DraggablePoint x={b} y={0.35} lockY color="var(--viz-2)" r={8} label="B" onChange={(x) => setB((p) => nudge(p, x))} />
        </Plot>
      </div>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 300px) 1fr', gap: '0.8rem', alignItems: 'center', justifyItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 300 }}>
          <div style={small}>Hour encoded as (sin, cos)</div>
          <Plot x={[-1.35, 1.35]} y={[-1.35, 1.35]} width={300} height={300} maxWidth={300} margin={{ top: 8, bottom: 8, left: 8, right: 8 }} ariaLabel={`Clock face with ${fmt(a)} and ${fmt(b)} as points on a circle, ${f3(dist)} apart`}>
            <Dial />
            <Path points={[[ax, ay], [bx, by]]} color="var(--viz-pos)" width={3} />
            <Dots points={[{ x: 0, y: 0, r: 2.5, color: 'var(--viz-axis)' }]} stroke="none" />
            <Label x={ax * 0.76} y={ay * 0.76} dy={5} anchor="middle" color="var(--viz-1)" weight={700}>A</Label>
            <Label x={bx * 0.76} y={bx === ax && by === ay ? by * 0.6 : by * 0.76} dy={5} anchor="middle" color="var(--viz-2)" weight={700}>B</Label>
            <DraggablePoint x={ax} y={ay} color="var(--viz-1)" r={8} onChange={(x, y) => setA((p) => dialNudge(p, x, y))} />
            <DraggablePoint x={bx} y={by} color="var(--viz-2)" r={8} onChange={(x, y) => setB((p) => dialNudge(p, x, y))} />
          </Plot>
        </div>
        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--ink)', width: '100%', maxWidth: 320 }}>
          <div>
            <b style={{ color: 'var(--viz-1)' }}>A = {fmt(a)}</b> → <M>{`(${f3(ax)},\\ ${f3(ay)})`}</M>
          </div>
          <div>
            <b style={{ color: 'var(--viz-2)' }}>B = {fmt(b)}</b> → <M>{`(${f3(bx)},\\ ${f3(by)})`}</M>
          </div>
          <Readout
            items={[
              ['raw gap |A − B|', `${raw} h`],
              ['real gap on a clock', `${real} h`],
              ['distance between encoded points', f3(dist)],
            ]}
          />
        </div>
      </div>
    </Figure>
  )
}
