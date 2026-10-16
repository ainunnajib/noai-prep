import { useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Toggle, Button, Plot, Grid, Axes, Rect, Path, Label, VLine, DraggablePoint, Arrow, usePlot, useNarrow, M } from '../../../../../kit'

/*
  Box plot + dot plot of nine commute times (minutes). Every dot can be dragged left/right.
  Quartiles use the usual by-hand rule (as in Describing data): Q1 and Q3 are the medians of the
  lower and upper halves of the sorted data, leaving the median itself out of both halves
  when n is odd. For the starting nine values every common rule gives Q1 = 15 and Q3 = 21.
  Fences: Q1 − 1.5·IQR and Q3 + 1.5·IQR. Optional: cap (winsorise) at the fences, and compare
  with the "mean ± 3 standard deviations" rule, which can never fire with only 9 values.
*/

const START = [12, 15, 15, 17, 18, 20, 21, 21, 41]
const X_WIDE: [number, number] = [0, 80]
const X_NARROW: [number, number] = [0, 60]

/** median of an already sorted list */
function median(sorted: number[]) {
  const n = sorted.length
  const mid = Math.floor(n / 2)
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
/** Q1 and Q3 as medians of the lower and upper halves (the median is left out when n is odd) */
function quartiles(sorted: number[]): [number, number] {
  const n = sorted.length
  return [median(sorted.slice(0, Math.floor(n / 2))), median(sorted.slice(Math.ceil(n / 2)))]
}
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length
const std = (a: number[]) => {
  const m = mean(a)
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length)
}
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

/** a horizontal bracket (in pixels) used for the IQR span */
function Brace({ x0, x1, y, label }: { x0: number; x1: number; y: number; label: string }) {
  const { xs, ys } = usePlot()
  const a = xs(x0)
  const b = xs(x1)
  const Y = ys(y)
  return (
    <g>
      <path d={`M${a},${Y + 5}V${Y}H${b}V${Y + 5}`} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 1.5 }} />
      <text className="plot-label" x={(a + b) / 2} y={Y - 5} textAnchor="middle" style={{ fill: 'var(--viz-1)', fontSize: 12 }}>
        {label}
      </text>
    </g>
  )
}

export default function BoxPlotIQR() {
  const [vals, setVals] = useState<number[]>(START)
  const [cap, setCap] = useState(false)
  const [sigma, setSigma] = useState(false)
  const [dragged, setDragged] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const X = narrow ? X_NARROW : X_WIDE

  const sorted = [...vals].sort((a, b) => a - b)
  const [q1, q3] = quartiles(sorted)
  const med = median(sorted)
  const iqr = q3 - q1
  const lo = q1 - 1.5 * iqr
  const hi = q3 + 1.5 * iqr
  const isOut = (v: number) => v < lo || v > hi
  const inside = sorted.filter((v) => !isOut(v))
  const wLo = inside.length ? inside[0] : q1
  const wHi = inside.length ? inside[inside.length - 1] : q3
  const capped = vals.map((v) => Math.min(hi, Math.max(lo, v)))
  const used = cap ? capped : vals
  const m = mean(used)
  const sm = mean(vals)
  const ssd = std(vals)
  const maxZ = Math.max(...vals.map((v) => Math.abs(v - sm) / (ssd || 1)))
  const nOut = vals.filter(isOut).length

  const BOX_Y0 = 6.2
  const BOX_Y1 = 8.2
  const BOX_MID = (BOX_Y0 + BOX_Y1) / 2

  return (
    <Figure
      title="Box plot, fences and the IQR rule"
      caption={
        <>
          Nine students' commute times in minutes. Drag any dot sideways. Dots beyond the dashed <b>fences</b> turn red: they are the outliers. Drag
          the red dot even further right and notice that the box and the fences do not move at all, while the mean does. Switch on{' '}
          <b>cap at the fences</b> to pull outliers back to the fence instead of deleting them, and on <b>mean ± 3σ rule</b> to see why that rule
          misses outliers in small samples.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
      <Plot x={X} y={[0, 10.6]} width={520} height={260} minHeight={narrow ? 290 : 230} margin={{ left: 14, right: 14, top: 8, bottom: 36 }} ariaLabel={`Box plot with Q1 ${fmt(q1)}, median ${fmt(med)}, Q3 ${fmt(q3)} and fences at ${fmt(lo)} and ${fmt(hi)} minutes, above a draggable dot plot`}>
        <Grid xTicks={narrow ? 6 : 8} yTicks={0} />
        <Axes xLabel="minutes" xTicks={narrow ? 6 : 8} hideYTicks />
        {/* outlier zones beyond the fences */}
        <Rect x0={X[0]} x1={Math.max(X[0], lo)} y0={0} y1={10.6} fill="color-mix(in srgb, var(--viz-neg) 9%, transparent)" />
        <Rect x0={Math.min(X[1], hi)} x1={X[1]} y0={0} y1={10.6} fill="color-mix(in srgb, var(--viz-neg) 9%, transparent)" />
        {lo > X[0] && <VLine x={lo} color="var(--viz-neg)" dash="6 4" />}
        {hi < X[1] && <VLine x={hi} color="var(--viz-neg)" dash="6 4" />}
        {lo > X[0] && (
          <Label x={lo} y={10.6} dx={-4} dy={13} anchor="end" color="var(--viz-neg)" size={12}>
            {`fence ${fmt(lo)}`}
          </Label>
        )}
        {hi < X[1] && (
          <Label x={hi} y={10.6} dx={5} dy={13} color="var(--viz-neg)" size={12}>
            {`fence ${fmt(hi)}`}
          </Label>
        )}
        {/* the box plot */}
        <Path points={[[wLo, BOX_MID], [q1, BOX_MID]]} color="var(--viz-axis)" width={2} />
        <Path points={[[q3, BOX_MID], [wHi, BOX_MID]]} color="var(--viz-axis)" width={2} />
        <Path points={[[wLo, BOX_Y0 + 0.5], [wLo, BOX_Y1 - 0.5]]} color="var(--viz-axis)" width={2} />
        <Path points={[[wHi, BOX_Y0 + 0.5], [wHi, BOX_Y1 - 0.5]]} color="var(--viz-axis)" width={2} />
        <Rect x0={q1} x1={q3} y0={BOX_Y0} y1={BOX_Y1} fill="color-mix(in srgb, var(--viz-1) 22%, var(--surface))" stroke="var(--viz-1)" />
        <Path points={[[med, BOX_Y0], [med, BOX_Y1]]} color="var(--viz-1)" width={3} />
        <Brace x0={q1} x1={q3} y={BOX_Y1 + 0.55} label={`IQR = ${fmt(iqr)}`} />
        <Label x={q1} y={BOX_Y0} dx={2} dy={14} anchor="end" size={11} color="var(--ink-2)">
          Q1
        </Label>
        <Label x={q3} y={BOX_Y0} dx={-2} dy={14} anchor="start" size={11} color="var(--ink-2)">
          Q3
        </Label>
        {/* mean ± 3σ, always computed from the original values */}
        {sigma && (
          <>
            <Path points={[[Math.max(X[0], sm - 3 * ssd), 0.6], [Math.min(X[1], sm + 3 * ssd), 0.6]]} color="var(--viz-5)" width={2} dash="2 3" />
            {sm + 3 * ssd < X[1] && <Path points={[[sm + 3 * ssd, 0.25], [sm + 3 * ssd, 0.95]]} color="var(--viz-5)" width={2} />}
            {sm - 3 * ssd > X[0] && <Path points={[[sm - 3 * ssd, 0.25], [sm - 3 * ssd, 0.95]]} color="var(--viz-5)" width={2} />}
            <Path points={[[sm, 0.2], [sm, 1.0]]} color="var(--viz-5)" width={3} />
            <Label x={Math.max(X[0], sm - 3 * ssd)} y={0.6} dx={4} dy={-6} anchor="start" color="var(--viz-5)" size={12}>
              {`mean ± 3σ`}
            </Label>
          </>
        )}
        <DotLayer
          vals={vals}
          isOut={isOut}
          cap={cap}
          capped={capped}
          minR={narrow ? 7 : 5}
          hint={dragged ? null : START.length - 1}
          onMove={(i, x) => {
            setDragged(true)
            setVals((old) => old.map((o, j) => (j === i ? x : o)))
          }}
        />
      </Plot>
      </div>
      <Controls>
        <Toggle label="cap at the fences (winsorise)" checked={cap} onChange={setCap} />
        <Toggle label="mean ± 3σ rule" checked={sigma} onChange={setSigma} />
        <Button onClick={() => setVals(START)}>Reset data</Button>
      </Controls>
      <Readout
        items={[
          ['Q1, median, Q3', `${fmt(q1)}, ${fmt(med)}, ${fmt(q3)}`],
          ['fences', `${fmt(q1)} − 1.5×${fmt(iqr)} = ${fmt(lo)},  ${fmt(q3)} + 1.5×${fmt(iqr)} = ${fmt(hi)}`],
          ['outliers', String(nOut)],
          [cap ? 'mean after capping' : 'mean', m.toFixed(1)],
          ...(sigma ? ([[<>largest |z| (σ rule needs &gt; 3)</>, maxZ.toFixed(2)]] as [ReactNode, string][]) : []),
        ]}
      />
      {sigma && (
        <p style={{ margin: 0, fontSize: 'var(--step--1)', color: 'var(--ink-2)', width: '100%' }}>
          With <M>n = 9</M> values, no value can ever be more than <M>{'\\sqrt{n-1} = \\sqrt{8} \\approx 2.83'}</M> standard deviations from the mean, because a
          far-out value inflates <M>\sigma</M> itself. The 3σ rule cannot fire here; the IQR rule can.
        </p>
      )}
    </Figure>
  )
}

function CappedDot({ x, y, r }: { x: number; y: number; r: number }) {
  const { xs, ys } = usePlot()
  return <circle cx={xs(x)} cy={ys(y)} r={r} style={{ fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 2 }} />
}

/** The draggable dot plot. Dots that would overlap on screen are stacked (a simple beeswarm). */
function DotLayer({
  vals,
  isOut,
  cap,
  capped,
  minR,
  hint,
  onMove,
}: {
  vals: number[]
  isOut: (v: number) => boolean
  cap: boolean
  capped: number[]
  minR: number
  /** index of the dot that carries a "drag" hint, or null */
  hint: number | null
  onMove: (i: number, x: number) => void
}) {
  const { xs } = usePlot()
  const pxPerUnit = Math.abs(xs(1) - xs(0))
  const r = Math.max(minR, Math.min(7, pxPerUnit * 0.9))
  const order = vals.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const levels: number[][] = []
  const levelOf: number[] = []
  for (const [v, i] of order) {
    const px = xs(v)
    let L = 0
    while (L < 4 && (levels[L] ?? []).some((q) => Math.abs(q - px) < 2 * r + 1)) L++
    ;(levels[L] ??= []).push(px)
    levelOf[i] = L
  }
  return (
    <g>
      {vals.map((v, i) => {
        const y = 2.0 + levelOf[i] * 1.0
        const out = isOut(v)
        const shown = cap && out ? capped[i] : v
        return (
          <g key={i}>
            {cap && out && <Arrow from={[v, y]} to={[shown, y]} color="var(--viz-neg)" width={1.8} head={7} dash="4 3" />}
            <DraggablePoint
              x={v}
              y={y}
              r={r}
              lockY
              color={out ? (cap ? 'color-mix(in srgb, var(--viz-neg) 45%, var(--surface))' : 'var(--viz-neg)') : 'var(--viz-1)'}
              constrain={(x, yy) => [Math.round(x), yy]}
              onChange={(x) => onMove(i, x)}
            />
            {cap && out && <CappedDot x={shown} y={y} r={r} />}
            {hint === i && !(cap && out) && (
              <Label x={v} y={y} dx={r + 5} dy={4} size={12} color="var(--ink-2)">
                ↔ drag
              </Label>
            )}
          </g>
        )
      })}
    </g>
  )
}
