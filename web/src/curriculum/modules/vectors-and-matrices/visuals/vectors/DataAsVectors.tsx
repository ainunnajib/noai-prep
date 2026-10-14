import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { Figure, Controls, Slider, Toggle, useContainerWidth } from '../../../../../kit'
import { Vec, fmt } from './shared'
import s from './vectors.module.css'

type V3 = [number, number, number]

const SUBJECTS = ['Maths', 'Science', 'English'] as const
const COLS = ['var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)']
const CCA_COL = 'var(--viz-2)'
const AVG_COL = 'var(--viz-6)'

const STUDENTS: { name: string; marks: V3; cca: number }[] = [
  { name: 'Aisha', marks: [90, 80, 40], cca: 6 },
  { name: 'Ben', marks: [40, 60, 90], cca: 4 },
  { name: 'Chloe', marks: [80, 90, 70], cca: 8 },
  { name: 'Dinesh', marks: [50, 30, 80], cca: 2 },
]
const N = STUDENTS.length
const SUM: V3 = [0, 1, 2].map((k) => STUDENTS.reduce((t, st) => t + st.marks[k], 0)) as V3
const AVG: V3 = SUM.map((x) => x / N) as V3
const CCA_SUM = STUDENTS.reduce((t, st) => t + st.cca, 0)
const CCA_AVG = CCA_SUM / N

const EL = (32 * Math.PI) / 180 // camera elevation: looking down into the corner of a room
const PHI_MIN = -160
const PHI_MAX = -95
const PHI_0 = -125

/** Orthographic projection that orbits the cube centre (50, 50, 50). Returns [right, up]. */
function proj([x, y, z]: V3, phiDeg: number): [number, number] {
  const phi = (phiDeg * Math.PI) / 180
  const X = x - 50
  const Y = y - 50
  const Z = z - 50
  const right = X * Math.cos(phi) - Y * Math.sin(phi)
  const depth = X * Math.sin(phi) + Y * Math.cos(phi)
  const up = Z * Math.cos(EL) + depth * Math.sin(EL)
  return [right, up]
}

/** Bounds of everything we draw, over every angle the slider allows, so the scene never jumps. */
const BOUNDS = (() => {
  const pts: V3[] = []
  for (const a of [0, 100]) for (const b of [0, 100]) for (const c of [0, 100]) pts.push([a, b, c])
  pts.push([122, 0, 0], [0, 122, 0], [0, 0, 118])
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  for (let p = PHI_MIN; p <= PHI_MAX; p += 5)
    for (const q of pts) {
      const [r, u] = proj(q, p)
      x0 = Math.min(x0, r)
      x1 = Math.max(x1, r)
      y0 = Math.min(y0, u)
      y1 = Math.max(y1, u)
    }
  return { x0, x1, y0, y1 }
})()

/** Pick a student (a row of the table) and see the same row as an arrow in 3-D; add a 4th number and the picture runs out, the list does not. */
export default function DataAsVectors() {
  const [sel, setSel] = useState(0)
  const [phi, setPhi] = useState(PHI_0)
  const [showAvg, setShowAvg] = useState(false)
  const [four, setFour] = useState(false)
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(380)
  const drag = useRef<{ x: number; phi: number } | null>(null)

  const W = Math.max(240, Math.min(440, measured))
  const pad = 26
  const scale = Math.min((W - 2 * pad) / (BOUNDS.x1 - BOUNDS.x0), (W * 0.92 - 2 * pad) / (BOUNDS.y1 - BOUNDS.y0))
  const H = Math.round((BOUNDS.y1 - BOUNDS.y0) * scale + 2 * pad)
  const cx = W / 2 - ((BOUNDS.x0 + BOUNDS.x1) / 2) * scale
  const cy = H / 2 + ((BOUNDS.y0 + BOUNDS.y1) / 2) * scale
  const P = (q: V3): [number, number] => {
    const [r, u] = proj(q, phi)
    return [cx + r * scale, cy - u * scale]
  }

  const st = STUDENTS[sel]
  const m = st.marks
  const values = four ? [...m, st.cca] : [...m]
  const avgValues = four ? [...AVG, CCA_AVG] : [...AVG]
  const colors = four ? [...COLS, CCA_COL] : COLS
  const caps = four ? [...SUBJECTS, 'CCA hrs'] : [...SUBJECTS]

  const floor = useMemo(() => [0, 20, 40, 60, 80, 100], [])

  const line = (a: V3, b: V3, style: CSSProperties, key?: string) => {
    const [x1, y1] = P(a)
    const [x2, y2] = P(b)
    return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} style={style} strokeLinecap="round" />
  }
  const arrow = (to: V3, color: string, width: number, dash?: string, key?: string) => {
    const [x1, y1] = P([0, 0, 0])
    const [x2, y2] = P(to)
    const len = Math.hypot(x2 - x1, y2 - y1)
    const ux = (x2 - x1) / len
    const uy = (y2 - y1) / len
    const h = Math.min(11, len * 0.5)
    const bx = x2 - ux * h
    const by = y2 - uy * h
    return (
      <g key={key}>
        <line x1={x1} y1={y1} x2={bx} y2={by} style={{ stroke: color, strokeWidth: width, strokeDasharray: dash }} strokeLinecap="round" />
        <path d={`M${x2},${y2}L${bx - uy * h * 0.55},${by + ux * h * 0.55}L${bx + uy * h * 0.55},${by - ux * h * 0.55}Z`} style={{ fill: color }} />
      </g>
    )
  }
  const text = (q: V3, t: string, color: string, dx = 0, dy = 0, anchor: 'start' | 'middle' | 'end' = 'middle', size = 13, key?: string) => {
    const [x, y] = P(q)
    return (
      <text key={key} className="plot-label" x={x + dx} y={y + dy} textAnchor={anchor} style={{ fill: color, fontSize: size, fontWeight: 700 }}>
        {t}
      </text>
    )
  }

  const tip = P(m)
  const org = P([0, 0, 0])
  const tl = Math.hypot(tip[0] - org[0], tip[1] - org[1]) || 1
  // put the name just beyond the tip, continuing the arrow's direction, so it never sits on the shaft
  const nameOff: [number, number] = [((tip[0] - org[0]) / tl) * 14, ((tip[1] - org[1]) / tl) * 14]

  return (
    <Figure
      title="A table row is a vector"
      caption={
        <>
          Click a student to turn their row into an arrow (drag the picture or use the slider to turn it). Three marks need three directions, so the arrow
          lives in 3-D space. Then add a fourth number: the picture runs out, but the list, and all the maths you do with it, carries on unchanged.
        </>
      }
    >
      <div className={s.split} style={{ alignItems: 'flex-start' }}>
        <div className={s.splitSide} style={{ flexBasis: 240, justifyItems: 'stretch' }}>
          <div className={s.tableWrap}>
            <table className={s.table} aria-label="Marks of four students; click a row to select it">
              <thead>
                <tr>
                  <th>Student</th>
                  {SUBJECTS.map((sub, k) => (
                    <th key={sub} style={{ color: COLS[k] }}>
                      {sub}
                    </th>
                  ))}
                  {four && <th style={{ color: CCA_COL }}>CCA hrs</th>}
                </tr>
              </thead>
              <tbody>
                {STUDENTS.map((row, i) => (
                  <tr
                    key={row.name}
                    className={`${s.row}${i === sel ? ' ' + s.rowActive : ''}`}
                    tabIndex={0}
                    aria-selected={i === sel}
                    onClick={() => setSel(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSel(i)
                      }
                    }}
                  >
                    <td>{row.name}</td>
                    {row.marks.map((x, k) => (
                      <td key={k}>{x}</td>
                    ))}
                    {four && <td>{row.cca}</td>}
                  </tr>
                ))}
                {showAvg && (
                  <tr className={s.rowAvg}>
                    <td>average</td>
                    {AVG.map((x, k) => (
                      <td key={k}>{fmt(x)}</td>
                    ))}
                    {four && <td>{fmt(CCA_AVG)}</td>}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', justifyItems: 'center', gap: '0.4rem' }}>
            <Vec name={st.name.toLowerCase()} values={values} colors={colors} captions={caps} small />
            <span className={s.dimBadge}>
              {values.length} numbers, so a {values.length}-dimensional vector
            </span>
          </div>
        </div>

        <div className={s.splitMain} ref={wrapRef} style={{ flexBasis: 280 }}>
          <div className={s.stage}>
            <svg
              className={`${s.svg3d}${four ? ' ' + s.svgFaded : ''}`}
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={`3-D picture: ${st.name}'s marks drawn as an arrow to the point (${m.join(', ')})`}
              onPointerDown={(e) => {
                drag.current = { x: e.clientX, phi }
                ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
              }}
              onPointerMove={(e) => {
                if (!drag.current) return
                const next = drag.current.phi + (e.clientX - drag.current.x) * 0.4
                setPhi(Math.max(PHI_MIN, Math.min(PHI_MAX, next)))
              }}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
            >
              {/* floor grid (English = 0) */}
              {floor.map((g) => line([g, 0, 0], [g, 100, 0], { stroke: 'var(--viz-grid)', strokeWidth: 1.2 }, `fa${g}`))}
              {floor.map((g) => line([0, g, 0], [100, g, 0], { stroke: 'var(--viz-grid)', strokeWidth: 1.2 }, `fb${g}`))}
              {/* back wall edges for depth */}
              {line([0, 0, 0], [0, 0, 100], { stroke: 'var(--viz-grid)', strokeWidth: 1.2 }, 'w1')}
              {/* axes */}
              {arrow([118, 0, 0], 'var(--viz-axis)', 1.4, undefined, 'ax')}
              {arrow([0, 118, 0], 'var(--viz-axis)', 1.4, undefined, 'ay')}
              {arrow([0, 0, 112], 'var(--viz-axis)', 1.4, undefined, 'az')}
              {text([124, 0, 0], 'Maths', COLS[0], 0, 14, 'middle', 13, 'lx')}
              {text([0, 124, 0], 'Science', COLS[1], 0, 14, 'middle', 13, 'ly')}
              {text([0, 0, 116], 'English', COLS[2], 8, -2, 'start', 13, 'lz')}
              {text([100, 0, 0], '100', 'var(--ink-3)', -6, 4, 'end', 11, 'tx')}
              {text([0, 100, 0], '100', 'var(--ink-3)', 2, -8, 'middle', 11, 'ty')}
              {[50, 100].map((t) => text([0, 0, t], String(t), 'var(--ink-3)', -6, 4, 'end', 11, `tz${t}`))}

              {/* the other students, faint */}
              {STUDENTS.map((row, i) =>
                i === sel ? null : (
                  <g key={row.name} style={{ opacity: 0.55 }}>
                    {arrow(row.marks, 'var(--viz-muted)', 1.8)}
                  </g>
                ),
              )}

              {/* the selected student's three legs: along Maths, then Science, then up English */}
              {line([0, 0, 0], [m[0], 0, 0], { stroke: COLS[0], strokeWidth: 3.5, strokeDasharray: '6 4' }, 'l1')}
              {line([m[0], 0, 0], [m[0], m[1], 0], { stroke: COLS[1], strokeWidth: 3.5, strokeDasharray: '6 4' }, 'l2')}
              {line([m[0], m[1], 0], m, { stroke: COLS[2], strokeWidth: 3.5, strokeDasharray: '6 4' }, 'l3')}
              {showAvg && arrow(AVG, AVG_COL, 3, '5 4', 'avg')}
              {showAvg && text(AVG, 'average', AVG_COL, 10, 14, 'start', 12, 'avgl')}
              {arrow(m, 'var(--viz-1)', 3.5, undefined, 'sel')}
              <circle cx={tip[0]} cy={tip[1]} r={4.5} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 2 }} />
              <text
                className="plot-label"
                x={tip[0] + nameOff[0]}
                y={tip[1] + nameOff[1]}
                dy="0.35em"
                textAnchor={nameOff[0] > 4 ? 'start' : nameOff[0] < -4 ? 'end' : 'middle'}
                style={{ fill: 'var(--viz-1)', fontSize: 13, fontWeight: 700 }}
              >
                {st.name}
              </text>
            </svg>
            {four && (
              <div className={s.overlay}>
                <div className={s.overlayCard}>
                  <strong>4 numbers: a point in 4-D space.</strong> Nobody can draw four directions at right angles, but the list works exactly the same way. A
                  model with 784 pixel values treats a picture as one point in 784-D space.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Controls>
        <Slider label="Turn the view" value={phi} min={PHI_MIN} max={PHI_MAX} step={1} onChange={setPhi} format={(x) => `${Math.round(x - PHI_0)}°`} />
        <Toggle label="Show class average" checked={showAvg} onChange={setShowAvg} />
        <Toggle label="Add a 4th number (CCA hours)" checked={four} onChange={setFour} />
      </Controls>

      {showAvg && (
        <div className={s.eq}>
          <span>average = (aisha + ben + chloe + dinesh) ÷ 4</span>
          <span className={s.eqOp}>=</span>
          <span>[{(four ? [...SUM, CCA_SUM] : SUM).join(', ')}] ÷ 4</span>
          <span className={s.eqOp}>=</span>
          <span style={{ color: AVG_COL }}>[{avgValues.map((x) => fmt(x)).join(', ')}]</span>
        </div>
      )}
    </Figure>
  )
}
