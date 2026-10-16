import { useState } from 'react'
import { Figure, Controls, Plot, Grid, Axes, Path, Dots, Label, DraggablePoint, Segmented } from '../../../../../kit'
import { fmt, snap, clamp, type P } from '../vectors/shared'
import s from './dot.module.css'

type Metric = 'l2' | 'l1'

const L1C = 'var(--viz-2)'
const L2C = 'var(--viz-1)'
const YOU = 'var(--viz-4)'
const CENTRE = 'var(--viz-5)'

const CENTRES: { name: string; at: P }[] = [
  { name: 'A', at: [4, 4] },
  { name: 'B', at: [-6, 1] },
  { name: 'C', at: [2, -6] },
]

const EPS = 1e-9

/** Drag "you" around a grid of roads; the nearest food centre depends on which distance you use. */
export default function NearestHawker() {
  const [you, setYou] = useState<P>([0, 0])
  const [metric, setMetric] = useState<Metric>('l2')

  const rows = CENTRES.map((c) => {
    const diff: P = [c.at[0] - you[0], c.at[1] - you[1]]
    return { ...c, diff, l2: Math.hypot(diff[0], diff[1]), l1: Math.abs(diff[0]) + Math.abs(diff[1]) }
  })
  const min2 = Math.min(...rows.map((r) => r.l2))
  const min1 = Math.min(...rows.map((r) => r.l1))
  const near2 = rows.filter((r) => r.l2 - min2 < EPS).map((r) => r.name)
  const near1 = rows.filter((r) => r.l1 - min1 < EPS).map((r) => r.name)
  const agree = near1.join() === near2.join()
  // put the "you" label in the compass direction furthest from every route leaving you
  const starts = rows.map((r) => {
    const [dx, dy] = r.diff
    if (metric === 'l2' || dx === 0) return Math.atan2(dy, dx)
    return dx > 0 ? 0 : Math.PI
  })
  const angGap = (p: number, q: number) => Math.abs(Math.atan2(Math.sin(p - q), Math.cos(p - q)))
  let labelDir = Math.PI / 2
  let bestGap = -1
  for (let k = 0; k < 8; k++) {
    const d = (k * Math.PI) / 4 + Math.PI / 8
    const g = Math.min(...starts.map((st) => angGap(d, st)))
    if (g > bestGap) {
      bestGap = g
      labelDir = d
    }
  }
  const lx = Math.cos(labelDir) * 20
  const ly = -Math.sin(labelDir) * 20 + 5

  const list = (n: string[]) => n.join(' and ')
  const isNearest = (n: string[]) => (n.length > 1 ? 'are equally near' : 'is nearest')

  return (
    <Figure
      title="Which food centre is nearest?"
      caption={
        <>
          The grid lines are roads. Drag <strong style={{ color: YOU }}>you</strong> around and switch rulers. A crow flies straight (L2 distance); a taxi
          must follow the roads (L1 distance). Each distance is the norm of the difference <em>centre − you</em>. Find places where the two rulers pick
          different winners.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Measure distance as"
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'l2', label: 'Crow flies (L2)' },
            { value: 'l1', label: 'Taxi on roads (L1)' },
          ]}
        />
      </Controls>
      <Plot x={[-7, 7]} y={[-7, 7]} width={420} height={420} margin={{ left: 14, right: 14, top: 14, bottom: 14 }} ariaLabel="A street grid with three food centres and your draggable position; routes to each centre are drawn">
        <Grid xTicks={14} yTicks={14} />
        <Axes origin xTicks={7} yTicks={7} />
        {rows.map((r) => {
          const best = metric === 'l2' ? near2.includes(r.name) : near1.includes(r.name)
          const color = best ? (metric === 'l2' ? L2C : L1C) : 'var(--viz-muted)'
          const pts: P[] = metric === 'l2' ? [you, r.at] : [you, [r.at[0], you[1]], r.at]
          return <Path key={r.name} points={pts} color={color} width={best ? 4.5 : 1.8} dash={best ? undefined : '5 5'} opacity={best ? 1 : 0.9} />
        })}
        <Dots points={CENTRES.map((c) => ({ x: c.at[0], y: c.at[1], r: 8, shape: 'square' as const, color: CENTRE, label: c.name }))} />
        <Label x={you[0]} y={you[1]} dx={lx} dy={ly} anchor={lx > 6 ? 'start' : lx < -6 ? 'end' : 'middle'} color={YOU} size={14} weight={800}>
          you
        </Label>
        <DraggablePoint x={you[0]} y={you[1]} color={YOU} onChange={(x, y) => setYou([clamp(snap(x, 0.5), -7, 7), clamp(snap(y, 0.5), -7, 7)])} />
      </Plot>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table className={s.normTable} aria-live="polite">
          <thead>
            <tr>
              <th>Centre</th>
              <th style={{ whiteSpace: 'nowrap' }}>centre − you</th>
              <th style={{ color: L2C, whiteSpace: 'nowrap' }}>L2 (crow)</th>
              <th style={{ color: L1C, whiteSpace: 'nowrap' }}>L1 (taxi)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td style={{ fontWeight: 700, color: CENTRE }}>{r.name}</td>
                <td className={s.mono} style={{ whiteSpace: 'nowrap' }}>
                  [{fmt(r.diff[0])}, {fmt(r.diff[1])}]
                </td>
                <td className={`${s.mono}${near2.includes(r.name) ? ' ' + s.best : ''}`}>{fmt(r.l2)}</td>
                <td className={`${s.mono}${near1.includes(r.name) ? ' ' + s.best : ''}`}>{fmt(r.l1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={s.note}>
        <span className={s.best} style={{ padding: '0 0.35rem', borderRadius: 4 }}>
          Highlighted
        </span>{' '}
        = nearest by that ruler.{' '}
        {agree ? (
          <>
            Both rulers agree: <strong>{list(near2)}</strong> {isNearest(near2)} from here.
          </>
        ) : (
          <>
            The rulers disagree! As the crow flies, <strong style={{ color: L2C }}>{list(near2)}</strong> {isNearest(near2)}, but by road{' '}
            <strong style={{ color: L1C }}>{list(near1)}</strong> {isNearest(near1)}.
          </>
        )}
      </p>
    </Figure>
  )
}
