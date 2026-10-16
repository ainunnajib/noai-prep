import { useState } from 'react'
import { Figure, Controls, Plot, Grid, Axes, Path, Label, DraggablePoint, Toggle, usePlot, useNarrow } from '../../../../../kit'
import { fmt, snap, clamp, type P } from '../vectors/shared'
import s from './dot.module.css'

const R = 5 // every shape below is "all the points whose norm is exactly 5"
const L1C = 'var(--viz-2)'
const L2C = 'var(--viz-1)'
const LIC = 'var(--viz-3)'
const PT = 'var(--viz-4)'

function Circle({ r, color, width }: { r: number; color: string; width: number }) {
  const { xs, ys } = usePlot()
  return <ellipse cx={xs(0)} cy={ys(0)} rx={Math.abs(xs(r) - xs(0))} ry={Math.abs(ys(r) - ys(0))} style={{ fill: 'none', stroke: color, strokeWidth: width }} />
}

type Status = 'in' | 'on' | 'out'
const sq = (v: number) => (v < 0 ? `(${fmt(v)})²` : `${fmt(v)}²`)
const status = (n: number): Status => (Math.abs(n - R) < 1e-9 ? 'on' : n < R ? 'in' : 'out')

/** Three rulers for length. Drag the point and see which shape (norm = 5) it is inside, on or outside. */
export default function NormBalls() {
  const [p, setP] = useState<P>([3, 4])
  const [routes, setRoutes] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const [x, y] = p
  const l1 = Math.abs(x) + Math.abs(y)
  const l2 = Math.hypot(x, y)
  const li = Math.max(Math.abs(x), Math.abs(y))
  const st = { l1: status(l1), l2: status(l2), li: status(li) }
  const w = (k: Status) => (k === 'on' ? 4.5 : 2.2)

  const rows: { key: 'l1' | 'l2' | 'li'; name: string; color: string; shape: string; formula: string; value: number }[] = [
    { key: 'l1', name: 'L1 (taxi)', color: L1C, shape: 'diamond', formula: `|${fmt(x)}| + |${fmt(y)}|`, value: l1 },
    { key: 'l2', name: 'L2 (crow)', color: L2C, shape: 'circle', formula: `√(${sq(x)} + ${sq(y)})`, value: l2 },
    { key: 'li', name: 'L∞ (biggest)', color: LIC, shape: 'square', formula: `max(|${fmt(x)}|, |${fmt(y)}|)`, value: li },
  ]
  const badge = (k: Status, shape: string) =>
    k === 'on' ? (
      <span className={`${s.badge} ${s.badgeOn}`}>on the {shape}</span>
    ) : k === 'in' ? (
      <span className={`${s.badge} ${s.badgeIn}`}>inside</span>
    ) : (
      <span className={`${s.badge} ${s.badgeOut}`}>outside</span>
    )

  // the taxi route: across first, then up (along the grid "roads")
  const corner: P = [x, 0]

  return (
    <Figure
      title="Three rulers for 'how long is this vector?'"
      caption={
        <>
          Each outline is every point whose norm is exactly 5, measured with a different ruler: the{' '}
          <strong style={{ color: L1C }}>diamond</strong> for L1, the <strong style={{ color: L2C }}>circle</strong> for L2 and the{' '}
          <strong style={{ color: LIC }}>square</strong> for L∞. Drag the point: an outline thickens when the point sits exactly on it. Try [3, 4], [5, 0]
          and [2.5, 2.5]. Notice that L1 ≥ L2 ≥ L∞ wherever you go.
        </>
      }
    >
      <Plot x={[-7, 7]} y={[-7, 7]} width={420} height={420} margin={{ left: 14, right: 14, top: 14, bottom: 14 }} ariaLabel="The L1 diamond, L2 circle and L-infinity square of radius 5, with a draggable point">
        <Grid xTicks={14} yTicks={14} />
        <Axes origin xTicks={7} yTicks={7} />
        <Path points={[[-R, -R], [R, -R], [R, R], [-R, R]]} closed color={LIC} width={w(st.li)} />
        <Circle r={R} color={L2C} width={w(st.l2)} />
        <Path points={[[R, 0], [0, R], [-R, 0], [0, -R]]} closed color={L1C} width={w(st.l1)} />
        <Label x={-2.5} y={-2.5} dx={-6} dy={8} anchor="end" color={L1C} size={13} weight={800}>
          L1
        </Label>
        <Label x={-R * Math.SQRT1_2} y={-R * Math.SQRT1_2} dx={-6} dy={8} anchor="end" color={L2C} size={13} weight={800}>
          L2
        </Label>
        <Label x={-R} y={-R} dx={-4} dy={16} anchor="start" color={LIC} size={13} weight={800}>
          L∞
        </Label>
        {routes && (
          <>
            <Path points={[[0, 0], corner, p]} color={L1C} width={4} dash="7 5" />
            <Path points={[[0, 0], p]} color={L2C} width={4} />
          </>
        )}
        <DraggablePoint x={x} y={y} color={PT} onChange={(nx, ny) => setP([clamp(snap(nx, 0.5), -7, 7), clamp(snap(ny, 0.5), -7, 7)])} label={`[${fmt(x)}, ${fmt(y)}]`} />
      </Plot>
      <Controls>
        <Toggle label="Show the taxi route and the straight line" checked={routes} onChange={setRoutes} />
      </Controls>
      <div ref={wrapRef} style={{ width: '100%', overflowX: 'auto' }}>
        <table className={s.normTable} aria-live="polite">
          <thead>
            <tr>
              <th>Ruler</th>
              {!narrow && <th>Working</th>}
              <th>Norm</th>
              <th>Compared with 5</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td style={{ fontWeight: 700, color: r.color }}>
                  <span style={{ whiteSpace: 'nowrap' }}>
                    <span className={s.swatch} style={{ background: r.color }} />
                    {r.name}
                  </span>
                  {narrow && (
                    <div className={s.mono} style={{ color: 'var(--ink-2)', fontWeight: 600, whiteSpace: 'nowrap', marginTop: 2 }}>
                      {r.formula}
                    </div>
                  )}
                </td>
                {!narrow && (
                  <td className={s.mono} style={{ whiteSpace: 'nowrap' }}>
                    {r.formula}
                  </td>
                )}
                <td className={s.mono} style={{ fontWeight: 800 }}>
                  {fmt(r.value)}
                </td>
                <td>{badge(st[r.key], r.shape)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  )
}
