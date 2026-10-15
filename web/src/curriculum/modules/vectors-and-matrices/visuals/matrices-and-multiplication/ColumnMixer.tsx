import { useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Toggle, Plot, Grid, Axes, Arrow, M, usePlot, useNarrow } from '../../../../../kit'
import { SnapPoint } from '../vectors/shared'

/*
  Matrix times vector, two ways. Column picture: Ax = x1·(column 1) + x2·(column 2), drawn tip to tail.
  Row picture: each entry of Ax is a row of A dotted with x. Drag the columns of A, slide x.
*/

const snap = (v: number) => Math.round(v * 2) / 2
/** Columns and x snap to halves, so products are quarters: show up to 2 decimals, trailing zeros trimmed (−3.25, 0.5, 2). */
const tex = (v: number) => {
  const r = Math.round(v * 100) / 100
  return String(r === 0 ? 0 : r)
}
const fmt = (v: number) => tex(v).replace('-', '−')
const lim = (v: number) => Math.max(-2.5, Math.min(2.5, v))
const paren = (v: number) => (v < 0 ? `(${tex(v)})` : tex(v))

/** Label at the middle of a segment, pushed sideways (away from `away`) so it never sits on the arrowheads. */
function SideLabel({ from, to, away, text, color, at = 0.5 }: { from: [number, number]; to: [number, number]; away: [number, number]; text: string; color: string; at?: number }) {
  const { xs, ys } = usePlot()
  const x1 = xs(from[0])
  const y1 = ys(from[1])
  const x2 = xs(to[0])
  const y2 = ys(to[1])
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 28) return null
  const mx = x1 + (x2 - x1) * at
  const my = y1 + (y2 - y1) * at
  let nx = -(y2 - y1) / len
  let ny = (x2 - x1) / len
  if (nx * (xs(away[0]) - mx) + ny * (ys(away[1]) - my) > 0) {
    nx = -nx
    ny = -ny
  }
  // if the label would run off the plot on this side, put it on the other side instead
  const w = text.length * 7
  const [r0, r1] = xs.range()
  const lx = mx + nx * 14
  if ((nx > 0.4 && lx + w > r1) || (nx < -0.4 && lx - w < r0)) {
    nx = -nx
    ny = -ny
  }
  const anchor = Math.abs(nx) < 0.4 ? 'middle' : nx > 0 ? 'start' : 'end'
  return (
    <text className="plot-label" x={mx + nx * 14} y={my + ny * 14} dy="0.35em" textAnchor={anchor} style={{ fill: color }}>
      {text}
    </text>
  )
}

/** Label just beyond the tip of an arrow, along its direction. */
function TipLabel({ to, text, color }: { to: [number, number]; text: string; color: string }) {
  const { xs, ys } = usePlot()
  const x0 = xs(0)
  const y0 = ys(0)
  const x2 = xs(to[0])
  const y2 = ys(to[1])
  const len = Math.hypot(x2 - x0, y2 - y0)
  if (len < 20) return null
  const ux = (x2 - x0) / len
  const uy = (y2 - y0) / len
  return (
    <text className="plot-label" x={x2 + ux * 16} y={y2 + uy * 16} dy="0.35em" textAnchor="middle" style={{ fill: color, fontWeight: 800 }}>
      {text}
    </text>
  )
}

/** Clip children to the plotting area so long arrows never spill over the controls. */
function Clip({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

export default function ColumnMixer() {
  const [a1, setA1] = useState<[number, number]>([2, 1])
  const [a2, setA2] = useState<[number, number]>([-1, 2])
  const [x1, setX1] = useState(1.5)
  const [x2, setX2] = useState(1)
  const [showCols, setShowCols] = useState(true)

  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const LIM = narrow ? 4.5 : 5.5
  const p1: [number, number] = [x1 * a1[0], x1 * a1[1]]
  const y: [number, number] = [p1[0] + x2 * a2[0], p1[1] + x2 * a2[1]]
  const off = Math.abs(y[0]) > LIM || Math.abs(y[1]) > LIM

  return (
    <Figure
      title="Ax is a mix of A's columns"
      caption={
        <>
          The two coloured arrows are the <b>columns</b> of A; drag their tips. The sliders set the input vector x. The output Ax (green) is reached by walking{' '}
          x₁ copies of column 1 and then x₂ copies of column 2. Set x = [1, 0]: Ax is exactly column 1. Now check that the row picture underneath gives the same
          numbers every time.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
      <Plot x={[-LIM, LIM]} y={[-LIM, LIM]} width={420} height={420} ariaLabel={`Column picture of A times x: output (${fmt(y[0])}, ${fmt(y[1])})`}>
        <Grid xTicks={2 * LIM} yTicks={2 * LIM} />
        <Axes origin xTicks={6} yTicks={6} />
        <Clip>
          {showCols && (
            <>
              <Arrow from={[0, 0]} to={a1} color="var(--viz-1)" width={2} dash="5 4" />
              <Arrow from={[0, 0]} to={a2} color="var(--viz-2)" width={2} dash="5 4" />
            </>
          )}
          <Arrow from={[0, 0]} to={p1} color="var(--viz-1)" width={3.5} />
          <Arrow from={p1} to={y} color="var(--viz-2)" width={3.5} />
          <Arrow from={[0, 0]} to={y} color="var(--viz-3)" width={4} />
          <SideLabel from={[0, 0]} to={p1} away={y} text={narrow ? `${fmt(x1)}×` : `${fmt(x1)} × col 1`} color="var(--viz-1)" />
          <SideLabel from={p1} to={y} away={[0, 0]} text={narrow ? `${fmt(x2)}×` : `${fmt(x2)} × col 2`} color="var(--viz-2)" />
          <TipLabel to={y} text="Ax" color="var(--viz-3)" />
        </Clip>
        {showCols && (
          <>
            <SnapPoint x={a1[0]} y={a1[1]} color="var(--viz-1)" r={8} label="col 1" onChange={(px, py) => setA1([snap(px), snap(py)])} constrain={(px, py) => [lim(px), lim(py)]} />
            <SnapPoint x={a2[0]} y={a2[1]} color="var(--viz-2)" r={8} label="col 2" onChange={(px, py) => setA2([snap(px), snap(py)])} constrain={(px, py) => [lim(px), lim(py)]} />
          </>
        )}
      </Plot>
      </div>

      <div style={{ display: 'grid', gap: '0.25rem', justifyItems: 'center', fontSize: 'var(--step--1)', color: 'var(--ink-2)', textAlign: 'center', width: '100%' }}>
        <M>{`A = \\begin{bmatrix} ${tex(a1[0])} & ${tex(a2[0])} \\\\ ${tex(a1[1])} & ${tex(a2[1])} \\end{bmatrix}, \\quad x = \\begin{bmatrix} ${tex(x1)} \\\\ ${tex(x2)} \\end{bmatrix}`}</M>
        <div style={{ marginTop: '0.3rem' }}>
          <b>Column picture:</b> mix the columns
        </div>
        <M>{`Ax = ${paren(x1)}\\begin{bmatrix} ${tex(a1[0])} \\\\ ${tex(a1[1])} \\end{bmatrix} + ${paren(x2)}\\begin{bmatrix} ${tex(a2[0])} \\\\ ${tex(a2[1])} \\end{bmatrix} = \\begin{bmatrix} ${tex(y[0])} \\\\ ${tex(y[1])} \\end{bmatrix}`}</M>
        <div style={{ marginTop: '0.3rem' }}>
          <b>Row picture:</b> each entry is a row of A · x
        </div>
        <M>{`\\text{top: } ${tex(a1[0])}\\times ${paren(x1)} + ${paren(a2[0])}\\times ${paren(x2)} = ${tex(y[0])}`}</M>
        <M>{`\\text{bottom: } ${tex(a1[1])}\\times ${paren(x1)} + ${paren(a2[1])}\\times ${paren(x2)} = ${tex(y[1])}`}</M>
        {off && <div style={{ color: 'var(--viz-neg)', fontWeight: 650 }}>Ax has left the grid: shrink x or the columns to bring it back.</div>}
      </div>

      <Controls>
        <Slider label={<M>{'x_1'}</M>} value={x1} min={-2} max={2} step={0.5} onChange={setX1} format={fmt} />
        <Slider label={<M>{'x_2'}</M>} value={x2} min={-2} max={2} step={0.5} onChange={setX2} format={fmt} />
        <Toggle label="Show and drag the columns" checked={showCols} onChange={setShowCols} />
      </Controls>
    </Figure>
  )
}
