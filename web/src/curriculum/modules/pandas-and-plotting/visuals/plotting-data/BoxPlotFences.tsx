import { useState } from 'react'
import { Figure, Controls, Readout, Button, Plot, DraggablePoint, usePlot } from '../../../../../kit'
import { percentile } from './hdb'
import s from './pc.module.css'

/*
  The 9 bus waiting times from the worked example, as draggable dots on a number line, with the
  box plot they make drawn above them: box from Q1 to Q3, the median line, dashed fences at
  Q1 − 1.5·IQR and Q3 + 1.5·IQR, whiskers to the furthest values inside the fences and outliers
  as hollow circles. Quartiles use linear interpolation, like pandas, NumPy and matplotlib.
*/

const START = [2, 4, 5, 5, 6, 7, 8, 9, 20]
const X_DOM: [number, number] = [-4, 27]
const MIN_T = 0
const MAX_T = 25
const BOX_Y = 8.65
const BOX_H = 1.7
/** dots closer than this (in minutes) go on different levels, so every dot stays easy to grab on a phone */
const GAP = 2
const LEVEL_Y = (k: number) => 1.4 + Math.min(k, 4) * 1.3

/** A simple beeswarm: in order of value, put each dot on the lowest level with no dot within GAP of it. */
function levels(v: number[]): number[] {
  const order = v.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x || a.i - b.i)
  const last: number[] = [] // value of the right-most dot on each level so far
  const out = Array(v.length).fill(0)
  for (const { x, i } of order) {
    let k = last.findIndex((l) => x - l >= GAP)
    if (k < 0) k = last.length
    last[k] = x
    out[i] = k
  }
  return out
}
const fmt = (v: number) => String(Math.round(v * 100) / 100)

function boxStats(v: number[]) {
  const q1 = percentile(v, 25)
  const med = percentile(v, 50)
  const q3 = percentile(v, 75)
  const iqr = q3 - q1
  const lo = q1 - 1.5 * iqr
  const hi = q3 + 1.5 * iqr
  const inside = v.filter((x) => x >= lo && x <= hi)
  return {
    q1,
    med,
    q3,
    iqr,
    lo,
    hi,
    wLo: Math.min(...inside),
    wHi: Math.max(...inside),
    out: v.filter((x) => x < lo || x > hi).sort((a, b) => a - b),
    mean: v.reduce((a, b) => a + b, 0) / v.length,
  }
}
type Stats = ReturnType<typeof boxStats>

/** The box plot itself, drawn in data coordinates above the dot strip. */
function BoxDrawing({ st }: { st: Stats }) {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const top = ys(BOX_Y + BOX_H / 2)
  const bot = ys(BOX_Y - BOX_H / 2)
  const mid = ys(BOX_Y)
  const ink = { stroke: 'var(--viz-ink)', strokeWidth: 1.8 }
  const capH = (bot - top) * 0.28
  // each fence label sits on the OUTER side of its line (left of the lower fence, right of the upper) when there is
  // room, otherwise inside; if the two labels would still overlap, the lower one drops down a line
  const place = (v: number, side: 'lower' | 'upper') => {
    const text = `${side} fence ${fmt(v)}`
    const px = xs(v)
    const tw = text.length * 6.7 + 4
    const outside = side === 'lower' ? px - x0 >= tw : x1 - px >= tw
    const toLeft = side === 'lower' ? outside : !outside
    const from = toLeft ? px - 4 - tw : px + 4
    return { v, text, px, toLeft, from, to: from + tw, onScale: v >= X_DOM[0] && v <= X_DOM[1] }
  }
  const L = place(st.lo, 'lower')
  const U = place(st.hi, 'upper')
  const clash = L.onScale && U.onScale && L.to > U.from && U.to > L.from
  const fence = (f: ReturnType<typeof place>, drop: boolean) => {
    const labelStyle = { fontSize: 11.5, fontWeight: 700, fill: 'var(--viz-4)' }
    if (!f.onScale) {
      // off the scale: say so at the edge instead of drawing the line
      const atLeft = f.v < X_DOM[0]
      return (
        <text x={atLeft ? x0 + 2 : x1 - 2} y={ys(10.1) + (drop ? 14 : 0)} textAnchor={atLeft ? 'start' : 'end'} style={labelStyle}>
          {atLeft ? `← ${f.text}` : `${f.text} →`}
        </text>
      )
    }
    return (
      <g>
        <line x1={f.px} x2={f.px} y1={ys(9.75)} y2={ys(0.25)} style={{ stroke: 'var(--viz-4)', strokeWidth: 1.6, strokeDasharray: '5 4' }} />
        <text x={f.toLeft ? f.px - 4 : f.px + 4} y={ys(10.1) + (drop ? 14 : 0)} textAnchor={f.toLeft ? 'end' : 'start'} style={labelStyle}>
          {f.text}
        </text>
      </g>
    )
  }
  return (
    <g>
      {fence(L, clash)}
      {fence(U, false)}
      {/* whiskers with end caps */}
      <line x1={xs(st.wLo)} x2={xs(st.q1)} y1={mid} y2={mid} style={ink} />
      <line x1={xs(st.q3)} x2={xs(st.wHi)} y1={mid} y2={mid} style={ink} />
      <line x1={xs(st.wLo)} x2={xs(st.wLo)} y1={mid - capH} y2={mid + capH} style={ink} />
      <line x1={xs(st.wHi)} x2={xs(st.wHi)} y1={mid - capH} y2={mid + capH} style={ink} />
      {/* box from Q1 to Q3, median line inside */}
      <rect
        x={xs(st.q1)}
        y={top}
        width={Math.max(0, xs(st.q3) - xs(st.q1))}
        height={bot - top}
        style={{ fill: 'color-mix(in srgb, var(--viz-1) 28%, var(--surface))', ...ink }}
      />
      <line x1={xs(st.med)} x2={xs(st.med)} y1={top} y2={bot} style={{ stroke: 'var(--viz-ink)', strokeWidth: 3.2 }} />
      {/* outliers: hollow circles on the box's centre line */}
      {st.out.map((o, i) => (
        <circle key={i} cx={xs(o)} cy={mid} r={5.5} style={{ fill: 'var(--surface)', stroke: 'var(--viz-neg)', strokeWidth: 2 }} />
      ))}
      {/* the mean, as a small diamond under the box */}
      <path
        d={`M${xs(st.mean)},${bot + 4} l5,6 l-5,6 l-5,-6 z`}
        style={{ fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 1 }}
        aria-hidden="true"
      />
    </g>
  )
}

/** A plain number line with a tick every 5 minutes. */
function NumberLine() {
  const { xs, ys } = usePlot()
  const y = ys(0.25)
  const ticks = [0, 5, 10, 15, 20, 25]
  return (
    <g className="plot-axes">
      <line x1={xs(MIN_T)} x2={xs(MAX_T)} y1={y} y2={y} />
      {ticks.map((t) => (
        <g key={t} transform={`translate(${xs(t)},${y})`}>
          <line y2={5} />
          <text y={17} textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
    </g>
  )
}

export default function BoxPlotFences() {
  const [times, setTimes] = useState<number[]>(START)
  const st = boxStats(times)
  const sorted = [...times].sort((a, b) => a - b)
  const lv = levels(times)
  const stackY = lv.map(LEVEL_Y)
  const isOut = (t: number) => t < st.lo || t > st.hi
  const changed = times.some((t, i) => t !== START[i])

  const verdict = st.out.length ? (
    <>
      <b>{st.out.map(fmt).join(', ')}</b> {st.out.length === 1 ? 'is' : 'are'} beyond the fences, so {st.out.length === 1 ? 'it is' : 'they are'} drawn as{' '}
      {st.out.length === 1 ? 'a separate dot' : 'separate dots'} and the whiskers stop at {fmt(st.wLo)} and {fmt(st.wHi)}, the furthest values inside the fences.
    </>
  ) : (
    <>
      Every value lies inside the fences ({fmt(st.lo)} to {fmt(st.hi)}), so there are no outlier dots and the whiskers reach the smallest and largest values,{' '}
      {fmt(st.wLo)} and {fmt(st.wHi)}.
    </>
  )

  return (
    <Figure
      title="Box plot, fences and outliers"
      caption={
        <>
          Drag any bus along the line (or focus a dot and use the arrow keys). Drag the 20-minute bus inwards: once it is at 12.5 or less it is inside the
          upper fence and becomes the end of the whisker. Notice that the median stays put while the mean (the orange diamond) moves with it.
        </>
      }
    >
      <div className={s.noSelect}>
        <Plot
          x={X_DOM}
          y={[0, 10.5]}
          width={540}
          height={260}
          minHeight={240}
          margin={{ top: 8, right: 14, bottom: 26, left: 14 }}
          ariaLabel={`Box plot of ${times.length} bus waiting times with fences at ${fmt(st.lo)} and ${fmt(st.hi)} minutes`}
        >
          <NumberLine />
          <BoxDrawing st={st} />
          {times.map((t, i) => (
            <DraggablePoint
              key={i}
              x={t}
              y={stackY[i]}
              r={8}
              lockY
              color={isOut(t) ? 'var(--viz-neg)' : 'var(--viz-1)'}
              label={`bus ${i + 1}: ${fmt(t)} minutes`}
              onChange={(nx) => setTimes((ts) => ts.map((u, k) => (k === i ? nx : u)))}
              constrain={(nx, ny) => [Math.min(MAX_T, Math.max(MIN_T, Math.round(nx * 2) / 2)), ny]}
            />
          ))}
        </Plot>
      </div>
      <div className={s.sortedRow} aria-label="The waiting times in order">
        <span className={s.sortedLabel}>sorted:</span>
        {sorted.map((t, k) => {
          const role = k === 2 ? 'Q1' : k === 4 ? 'median' : k === 6 ? 'Q3' : null
          return (
            <span key={k} className={`${s.sortedChip} ${role ? s.sortedKey : ''} ${isOut(t) ? s.sortedOut : ''}`}>
              {fmt(t)}
              {role && <span className={s.sortedRole}>{role}</span>}
            </span>
          )
        })}
      </div>
      <Controls>
        <Readout
          items={[
            ['Q1', fmt(st.q1)],
            ['median', fmt(st.med)],
            ['Q3', fmt(st.q3)],
            ['IQR', fmt(st.iqr)],
            ['fences', `${fmt(st.lo)} and ${fmt(st.hi)}`],
            ['mean', fmt(st.mean)],
          ]}
        />
        <Button onClick={() => setTimes(START)} disabled={!changed}>
          Reset
        </Button>
      </Controls>
      <div className={s.verdict} aria-live="polite">
        {verdict}
      </div>
    </Figure>
  )
}
