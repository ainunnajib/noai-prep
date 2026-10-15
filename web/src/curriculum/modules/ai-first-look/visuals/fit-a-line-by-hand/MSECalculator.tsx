import { useState } from 'react'
import { Controls, Slider, Plot, Grid, Axes, FnPath, Dots, usePlot, M } from '../../../../../kit'
import Figure from '../TouchFigure'
import { fmt } from './hdbFlats'

/** The worked example as a live table: three flats, your line, and every number of the MSE calculation. */

const FLATS3: [number, number][] = [
  [70, 460],
  [90, 530],
  [110, 670],
]
const NAMES = ['A', 'B', 'C']

function Res({ w, b }: { w: number; b: number }) {
  const { xs, ys, clipId } = usePlot()
  const [lo, hi] = ys.domain()
  return (
    <g aria-hidden="true">
      {/* residuals are clipped to the plot; a small arrowhead marks one that runs off the chart */}
      <g clipPath={`url(#${clipId})`}>
        {FLATS3.map(([x, y], i) => (
          <line key={i} x1={xs(x)} x2={xs(x)} y1={ys(y)} y2={ys(w * x + b)} style={{ stroke: 'var(--viz-neg)', strokeWidth: 2 }} />
        ))}
      </g>
      {FLATS3.map(([x], i) => {
        const p = w * x + b
        if (p >= lo && p <= hi) return null
        const up = p > hi
        const px = xs(x)
        const ey = ys(up ? hi : lo)
        const base = up ? ey + 8 : ey - 8
        return <path key={`off${i}`} d={`M${px - 5},${base}L${px + 5},${base}L${px},${ey}Z`} style={{ fill: 'var(--viz-neg)' }} />
      })}
      {FLATS3.map(([x, y], i) => (
        <text key={`t${i}`} className="plot-label" x={xs(x) - 10} y={ys(y) - 8} textAnchor="end">
          {NAMES[i]}
        </text>
      ))}
    </g>
  )
}

const cell: React.CSSProperties = { padding: '0.3rem 0.45rem', textAlign: 'right', borderBottom: '1px solid var(--rule)', whiteSpace: 'nowrap' }
const head: React.CSSProperties = { ...cell, color: 'var(--ink-2)', fontWeight: 700, background: 'var(--surface-2)' }

export default function MSECalculator() {
  const [w, setW] = useState(5)
  const [b, setB] = useState(100)
  const rows = FLATS3.map(([x, y]) => {
    const p = w * x + b
    const r = y - p
    return { x, y, p, r, s: r * r }
  })
  const sum = rows.reduce((a, r) => a + r.s, 0)
  const mse = sum / rows.length
  const sgn = (v: number) => (v > 0 ? `+${fmt(v, Number.isInteger(v) ? 0 : 1)}` : v < 0 ? `−${fmt(-v, Number.isInteger(v) ? 0 : 1)}` : '0')
  const n1 = (v: number) => fmt(v, Number.isInteger(v) ? 0 : 1)

  return (
    <Figure
      title="Check your arithmetic: MSE for three flats"
      caption={
        <>
          Start with the line from the worked example (<M>w = 5</M>, <M>b = 100</M>), then pick your own <M>w</M> and <M>b</M>, work out the MSE by hand, and
          check it here. Watch the last column: one residual twice as big gives a square four times as big. (A red arrowhead on the edge means that residual runs
          off the chart.)
        </>
      }
    >
      <Plot x={[60, 120]} y={[350, 750]} width={420} height={230} minHeight={200} margin={{ left: 46, top: 24 }} ariaLabel="Three flats A, B and C with your line and their residuals">
        <Grid xTicks={6} yTicks={4} />
        <Axes xLabel="area (m²)" yLabel="price (S$k)" xTicks={6} yTicks={4} />
        <Res w={w} b={b} />
        <FnPath f={(x) => w * x + b} color="var(--viz-2)" width={3} />
        <Dots points={FLATS3.map(([x, y]) => ({ x, y }))} r={5} color="var(--viz-1)" />
      </Plot>
      <Controls>
        <Slider label={<>slope <M>w</M></>} value={w} min={3} max={7} step={0.5} onChange={setW} format={(v) => v.toFixed(1)} />
        <Slider label={<>intercept <M>b</M></>} value={b} min={0} max={300} step={10} onChange={setB} />
      </Controls>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', fontVariantNumeric: 'tabular-nums' }}>
          <thead>
            <tr>
              <th style={{ ...head, textAlign: 'left' }}>flat</th>
              <th style={head}>
                <M>x</M>
              </th>
              <th style={head}>
                <M>y</M>
              </th>
              <th style={head}>
                <M>{'\\hat{y} = wx + b'}</M>
              </th>
              <th style={head}>
                <M>{'y - \\hat{y}'}</M>
              </th>
              <th style={head}>
                <M>{'(y - \\hat{y})^2'}</M>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ ...cell, textAlign: 'left', fontWeight: 700 }}>{NAMES[i]}</td>
                <td style={cell}>{r.x}</td>
                <td style={cell}>{r.y}</td>
                <td style={cell}>{n1(r.p)}</td>
                <td style={{ ...cell, color: 'var(--ink)' }}>{sgn(r.r)}</td>
                <td style={{ ...cell, fontWeight: 700 }}>{n1(r.s)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={5} style={{ ...cell, textAlign: 'right', color: 'var(--ink-2)' }}>
                sum of squares
              </td>
              <td style={{ ...cell, fontWeight: 700 }}>{n1(sum)}</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ ...cell, textAlign: 'right', color: 'var(--ink-2)', borderBottom: 'none' }}>
                MSE = sum ÷ 3
              </td>
              <td style={{ ...cell, fontWeight: 800, color: 'var(--accent)', borderBottom: 'none' }}>{fmt(mse, Number.isInteger(mse) ? 0 : 1)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Figure>
  )
}
