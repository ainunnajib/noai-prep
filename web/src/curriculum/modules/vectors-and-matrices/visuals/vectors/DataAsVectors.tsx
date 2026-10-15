import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { Figure, Controls, Slider, Toggle, useContainerWidth, useNarrow } from '../../../../../kit'
import { Vec, fmt } from './shared'
import s from './vectors.module.css'

type V3 = [number, number, number]
type Pt = [number, number]
type Box = { x: number; y: number; hw: number; hh: number }

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

// Camera: Maths runs towards you and to the right, Science away to the right, English straight up,
// looking slightly down onto the floor. From here every all-positive vector points up and to the right.
const EL = (22 * Math.PI) / 180
const PHI_MIN = -35
const PHI_MAX = -8
const PHI_0 = -20

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
  const [figRef, narrow] = useNarrow<HTMLDivElement>(460)
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
  /** an arrow between two screen points */
  const arrowXY = ([x1, y1]: Pt, [x2, y2]: Pt, color: string, width: number, dash?: string, key?: string, head = 11) => {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1
    const ux = (x2 - x1) / len
    const uy = (y2 - y1) / len
    const h = Math.min(head, len * 0.5)
    const bx = x2 - ux * h
    const by = y2 - uy * h
    return (
      <g key={key}>
        <line x1={x1} y1={y1} x2={bx} y2={by} style={{ stroke: color, strokeWidth: width, strokeDasharray: dash }} strokeLinecap="round" />
        <path d={`M${x2},${y2}L${bx - uy * h * 0.55},${by + ux * h * 0.55}L${bx + uy * h * 0.55},${by - ux * h * 0.55}Z`} style={{ fill: color }} />
      </g>
    )
  }
  const arrow = (to: V3, color: string, width: number, dash?: string, key?: string) => arrowXY(P([0, 0, 0]), P(to), color, width, dash, key)

  const tip = P(m)
  const org = P([0, 0, 0])
  const unit = (a: Pt, b: Pt): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]
  }
  /** unit direction a→b on screen, and the perpendicular pointing away from the middle of the floor */
  const dirs = (a: Pt, b: Pt) => {
    const [ux, uy] = unit(a, b)
    const f = P([50, 50, 0])
    let [nx, ny] = [-uy, ux]
    if (nx * (f[0] - a[0]) + ny * (f[1] - a[1]) > 0) [nx, ny] = [-nx, -ny]
    return { ux, uy, nx, ny }
  }

  // Science runs away from the viewer, so its axis tip sits among the students' arrows. Its name goes
  // beside the right-hand floor edge instead (parallel to the Science axis), with a small arrow showing the direction.
  const sciEdge = (() => {
    const a = P([100, 0, 0])
    const b = P([100, 100, 0])
    const { ux, uy, nx, ny } = dirs(a, b)
    const l = Math.hypot(b[0] - a[0], b[1] - a[1])
    const at = (t: number, off: number): Pt => [a[0] + ux * l * t + nx * off, a[1] + uy * l * t + ny * off]
    return { at, ux, uy, nx, ny, from: at(0.42, 11), to: at(0.92, 11) }
  })()

  // everything drawn as a line: labels keep clear of these (the faint floor grid is allowed under labels)
  const segs: [Pt, Pt][] = [
    [org, P([118, 0, 0])],
    [org, P([0, 118, 0])],
    [org, P([0, 0, 112])],
    [org, tip],
    [org, P([m[0], 0, 0])],
    [P([m[0], 0, 0]), P([m[0], m[1], 0])],
    [P([m[0], m[1], 0]), tip],
    [sciEdge.from, sciEdge.to],
    ...STUDENTS.filter((_, i) => i !== sel).map((row) => [org, P(row.marks)] as [Pt, Pt]),
    ...(showAvg ? [[org, P(AVG)] as [Pt, Pt]] : []),
  ]
  const distPtSeg = (q: Pt, a: Pt, b: Pt) => {
    const L2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 || 1
    const k = Math.max(0, Math.min(1, ((q[0] - a[0]) * (b[0] - a[0]) + (q[1] - a[1]) * (b[1] - a[1])) / L2))
    return Math.hypot(q[0] - (a[0] + k * (b[0] - a[0])), q[1] - (a[1] + k * (b[1] - a[1])))
  }
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const segsMeet = (a: Pt, b: Pt, c: Pt, d: Pt) => cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0
  /** gap (px) between a segment and a label box; 0 when they touch */
  const segBoxGap = (a: Pt, b: Pt, x: Box) => {
    const ptBox = (q: Pt) => Math.hypot(Math.max(Math.abs(q[0] - x.x) - x.hw, 0), Math.max(Math.abs(q[1] - x.y) - x.hh, 0))
    const c: Pt[] = [
      [x.x - x.hw, x.y - x.hh],
      [x.x + x.hw, x.y - x.hh],
      [x.x + x.hw, x.y + x.hh],
      [x.x - x.hw, x.y + x.hh],
    ]
    if (ptBox(a) === 0 || ptBox(b) === 0) return 0
    for (let i = 0; i < 4; i++) if (segsMeet(a, b, c[i], c[(i + 1) % 4])) return 0
    return Math.min(ptBox(a), ptBox(b), ...c.map((q) => distPtSeg(q, a, b)))
  }
  const boxes: Box[] = []
  const score = (x: Box) => {
    if (x.x - x.hw < 2 || x.x + x.hw > W - 2 || x.y - x.hh < 2 || x.y + x.hh > H - 2) return -Infinity // stay inside the picture
    let c = Infinity
    for (const [a, b] of segs) c = Math.min(c, segBoxGap(a, b, x))
    // other labels need a wider berth than lines, so two words never read as one
    for (const o of boxes) c = Math.min(c, Math.hypot(Math.max(Math.abs(x.x - o.x) - x.hw - o.hw, 0), Math.max(Math.abs(x.y - o.y) - x.hh - o.hh, 0)) - 6)
    return c
  }
  /** a label of text t at size px: the first candidate centre with a comfortable gap, else the clearest one */
  const place = (t: string, size: number, cands: Pt[]): Pt => {
    const hw = (t.length * size * 0.62) / 2 + 1
    const hh = size * 0.5
    let best = cands[0]
    let bestScore = -Infinity
    for (const q of cands) {
      const sc = score({ x: q[0], y: q[1], hw, hh })
      if (sc >= 5) {
        best = q
        break
      }
      if (sc > bestScore + 0.5) {
        best = q
        bestScore = sc
      }
    }
    boxes.push({ x: best[0], y: best[1], hw, hh })
    return best
  }
  /** centre of a label of half-size (hw, hh) whose nearest edge sits gap px from q in direction (dx, dy) */
  const off = (q: Pt, dx: number, dy: number, gap: number, t: string, size: number): Pt => {
    const hw = (t.length * size * 0.62) / 2 + 1
    const hh = size * 0.5
    const d = gap + hw * Math.abs(dx) + hh * Math.abs(dy)
    return [q[0] + dx * d, q[1] + dy * d]
  }

  /** fallback candidates all round q, every 30° */
  const ring = (q: Pt, gap: number, t: string, size: number): Pt[] =>
    Array.from({ length: 12 }, (_, i) => off(q, Math.cos((i * Math.PI) / 6), Math.sin((i * Math.PI) / 6), gap, t, size))

  // Labels are placed in order of importance, each keeping clear of the lines and of the labels before it.
  const axisLabel = (end: V3, t: string): Pt => {
    const e = P(end)
    const { ux, uy, nx, ny } = dirs(org, e)
    return place(t, 13, [off(e, ux, uy, 8, t, 13), off(e, nx, ny, 10, t, 13), off(e, -nx, -ny, 10, t, 13), off(e, ux, uy, 22, t, 13)])
  }
  const mathsAt = axisLabel([118, 0, 0], 'Maths')
  const englishAt = axisLabel([0, 0, 112], 'English')
  const sciAt = place('Science', 13, [
    off(sciEdge.to, sciEdge.ux, sciEdge.uy, 5, 'Science', 13),
    off(sciEdge.to, 0, -1, 7, 'Science', 13),
    off(sciEdge.at(0.75, 11), sciEdge.nx, sciEdge.ny, 5, 'Science', 13),
    off(sciEdge.at(0.6, 11), sciEdge.nx, sciEdge.ny, 5, 'Science', 13),
  ])
  const nameAt = (() => {
    const [ux, uy] = unit(org, tip)
    const t = st.name
    return place(t, 13, [off(tip, ux, uy, 7, t, 13), off(tip, -uy, ux, 9, t, 13), off(tip, uy, -ux, 9, t, 13), off(tip, 0, -1, 9, t, 13), ...ring(tip, 9, t, 13), ...ring(tip, 18, t, 13)])
  })()
  /** the "100" mark on an axis: a tick on whichever side its label is clearer */
  const tickAt = (end: V3) => {
    const e = P(end)
    const { nx, ny } = dirs(org, e)
    const q = place('100', 11.5, [off(e, nx, ny, 8, '100', 11.5), off(e, -nx, -ny, 8, '100', 11.5)])
    const sx = Math.sign((q[0] - e[0]) * nx + (q[1] - e[1]) * ny) || 1
    return { e, q, nx: sx * nx, ny: sx * ny }
  }
  const ticks = [tickAt([100, 0, 0]), tickAt([0, 0, 100])]
  /** a leg's value beside the middle of the leg, preferring the side away from the selected arrow */
  const legLabel = (a: V3, b: V3, v: number): Pt | null => {
    const pa = P(a)
    const pb = P(b)
    if (Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) < 16) return null
    const [ux, uy] = unit(pa, pb)
    const t = String(v)
    const at = (k: number): Pt => [pa[0] + (pb[0] - pa[0]) * k, pa[1] + (pb[1] - pa[1]) * k]
    const sides = [
      [-uy, ux],
      [uy, -ux],
    ].sort((p, q) => distPtSeg(off(at(0.5), q[0], q[1], 5, t, 12.5), org, tip) - distPtSeg(off(at(0.5), p[0], p[1], 5, t, 12.5), org, tip))
    const cands: Pt[] = []
    for (const gap of [5, 13]) for (const k of [0.5, 0.35, 0.65, 0.2, 0.8]) for (const [dx, dy] of sides) cands.push(off(at(k), dx, dy, gap, t, 12.5))
    return place(t, 12.5, cands)
  }
  const legAt = [legLabel([0, 0, 0], [m[0], 0, 0], m[0]), legLabel([m[0], 0, 0], [m[0], m[1], 0], m[1]), legLabel([m[0], m[1], 0], m, m[2])]
  const avgAt = (() => {
    if (!showAvg) return null
    const a = P(AVG)
    const [ux, uy] = unit(org, a)
    const t = 'average'
    const mid = (k: number): Pt => [org[0] + (a[0] - org[0]) * k, org[1] + (a[1] - org[1]) * k]
    return place(t, 12, [
      off(a, uy, -ux, 8, t, 12),
      off(a, ux, uy, 8, t, 12),
      off(a, -uy, ux, 8, t, 12),
      ...ring(a, 9, t, 12),
      ...[0.8, 0.65].flatMap((k) => [off(mid(k), uy, -ux, 6, t, 12), off(mid(k), -uy, ux, 6, t, 12)]),
      ...ring(a, 20, t, 12),
    ])
  })()
  const label = (q: Pt | null, t: string, color: string, size: number, key: string, weight = 700, halo = false) =>
    q && (
      <text
        key={key}
        className="plot-label"
        x={q[0]}
        y={q[1]}
        dy="0.35em"
        textAnchor="middle"
        style={{ fill: color, fontSize: size, fontWeight: weight, ...(halo ? { paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 3, strokeLinejoin: 'round' } : {}) }}
      >
        {t}
      </text>
    )

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
      <div className={s.split} style={{ alignItems: 'flex-start' }} ref={figRef}>
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
              {label(mathsAt, 'Maths', COLS[0], 13, 'lx', 700, true)}
              {label(englishAt, 'English', COLS[2], 13, 'lz', 700, true)}
              {/* Science: named beside the floor edge that runs parallel to its axis */}
              {arrowXY(sciEdge.from, sciEdge.to, COLS[1], 2, undefined, 'sci', 8)}
              {label(sciAt, 'Science', COLS[1], 13, 'ly', 700, true)}
              {ticks.map(({ e, q, nx, ny }, i) => (
                <g key={`t${i}`}>
                  <line x1={e[0]} y1={e[1]} x2={e[0] + nx * 5} y2={e[1] + ny * 5} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.4 }} />
                  <text x={q[0]} y={q[1]} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11.5, fontWeight: 700 }}>
                    100
                  </text>
                </g>
              ))}

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
              <circle cx={P([m[0], m[1], 0])[0]} cy={P([m[0], m[1], 0])[1]} r={3} style={{ fill: COLS[2] }} />
              {label(legAt[0], String(m[0]), COLS[0], 12.5, 'v1', 800)}
              {label(legAt[1], String(m[1]), COLS[1], 12.5, 'v2', 800)}
              {label(legAt[2], String(m[2]), COLS[2], 12.5, 'v3', 800)}
              {showAvg && arrow(AVG, AVG_COL, 3, '5 4', 'avg')}
              {label(avgAt, 'average', AVG_COL, 12, 'avgl', 700, true)}
              {arrow(m, 'var(--viz-1)', 3.5, undefined, 'sel')}
              <circle cx={tip[0]} cy={tip[1]} r={4.5} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 2 }} />
              {label(nameAt, st.name, 'var(--viz-1)', 13, 'name', 700, true)}
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
          <span>average =</span>
          <span>{narrow ? '(sum of the 4 rows) ÷ 4' : '(aisha + ben + chloe + dinesh) ÷ 4'}</span>
          <span className={s.eqOp}>=</span>
          <span>[{(four ? [...SUM, CCA_SUM] : SUM).join(', ')}] ÷ 4</span>
          <span className={s.eqOp}>=</span>
          <span style={{ color: AVG_COL }}>[{avgValues.map((x) => fmt(x)).join(', ')}]</span>
        </div>
      )}
    </Figure>
  )
}
