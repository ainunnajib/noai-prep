import { useEffect, useRef, useState } from 'react'
import { Figure, Controls, Slider, Button, Readout, Plot, Grid, Axes, Path, Label, useAnimationFrame, useContainerWidth, useNarrow } from '../../../../../kit'
import { INNER, OUTER } from './svmData'
import { Mark, NEG_C, POS_C } from './parts'

/*
  The kernel idea, drawn. Left: ring-shaped data in 2-D (no straight line separates it). Right: the same
  points lifted to height z = t·(x² + y²), shown in a 3-D view you can turn. At full lift a flat plane
  z = c separates the classes, and seen from above that flat plane is the circle x² + y² = c.
  c = 2.5 sits between the largest inner r² (1.20) and the smallest outer r² (3.84).
*/

const CUT = 2.5
const R_CUT = Math.sqrt(CUT)
const EL = (24 * Math.PI) / 180
const KZ = 0.42 // vertical squash for the z axis so the bowl fits

interface Pt3 {
  x: number
  y: number
  label: number
}
const PTS: Pt3[] = [...INNER.map((p) => ({ x: p[0], y: p[1], label: -1 })), ...OUTER.map((p) => ({ x: p[0], y: p[1], label: 1 }))]

function Lift3D({ t, az, setAz }: { t: number; az: number; setAz: (a: number) => void }) {
  const [ref, w] = useContainerWidth<HTMLDivElement>(360)
  const W = Math.max(260, Math.min(420, w))
  const s = W / 9.4
  const H = Math.round(s * 7.6)
  const cx = W / 2
  const cy = H * 0.66
  const ca = Math.cos(az)
  const sa = Math.sin(az)
  const proj = (x: number, y: number, z: number): [number, number] => {
    const X = x * ca - y * sa
    const depth = x * sa + y * ca
    return [cx + s * X, cy - s * (z * KZ * Math.cos(EL) + depth * Math.sin(EL))]
  }
  const viewDepth = (x: number, y: number, z: number) => (x * sa + y * ca) * Math.cos(EL) - z * KZ * Math.sin(EL)
  const poly = (pts: [number, number, number][]) =>
    pts
      .map((p, i) => {
        const [X, Y] = proj(p[0], p[1], p[2])
        return `${i ? 'L' : 'M'}${X.toFixed(1)},${Y.toFixed(1)}`
      })
      .join('') + 'Z'
  const sq = (z: number): [number, number, number][] => [
    [-3, -3, z],
    [3, -3, z],
    [3, 3, z],
    [-3, 3, z],
  ]
  const lifted = PTS.map((p) => ({ ...p, z: t * (p.x * p.x + p.y * p.y) }))
  const order = (arr: typeof lifted) => [...arr].sort((a, b) => viewDepth(b.x, b.y, b.z) - viewDepth(a.x, a.y, a.z))
  const below = order(lifted.filter((p) => p.z < CUT))
  const above = order(lifted.filter((p) => p.z >= CUT))
  const drag = useRef<{ x: number; az: number } | null>(null)

  const dot = (p: (typeof lifted)[number], i: number) => {
    const [X, Y] = proj(p.x, p.y, p.z)
    const [X0, Y0] = proj(p.x, p.y, 0)
    const c = p.label > 0 ? POS_C : NEG_C
    const r = 5
    return (
      <g key={`${p.x},${p.y},${i}`}>
        {p.z > 0.05 && <line x1={X0} y1={Y0} x2={X} y2={Y} style={{ stroke: c, strokeWidth: 1, opacity: 0.45 }} />}
        {p.label > 0 ? (
          <rect x={X - r * 0.9} y={Y - r * 0.9} width={r * 1.8} height={r * 1.8} style={{ fill: c, stroke: 'var(--surface)', strokeWidth: 1.2 }} />
        ) : (
          <circle cx={X} cy={Y} r={r} style={{ fill: c, stroke: 'var(--surface)', strokeWidth: 1.2 }} />
        )}
      </g>
    )
  }

  // the bowl z = t(x² + y²): a few rings, lifted
  const ring = (r: number) => {
    const pts: string[] = []
    for (let k = 0; k <= 64; k++) {
      const a = (k / 64) * 2 * Math.PI
      const [X, Y] = proj(r * Math.cos(a), r * Math.sin(a), t * r * r)
      pts.push(`${k ? 'L' : 'M'}${X.toFixed(1)},${Y.toFixed(1)}`)
    }
    return pts.join('')
  }
  const [ox, oy] = proj(0, 0, 0)
  const [zx, zy] = proj(0, 0, 9)
  // label the plane at its left-most corner (whichever that is after turning), so it never runs off the edge
  const planeLabel = sq(CUT)
    .map((c) => proj(c[0], c[1], c[2]))
    .reduce((a, b) => (b[0] < a[0] ? b : a))

  return (
    <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center', touchAction: 'pan-y' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        role="img"
        aria-label={`3-D view of the points lifted to height ${t.toFixed(2)} times (x squared plus y squared), with a flat plane at height ${CUT}. Drag sideways to turn the view.`}
        style={{ maxWidth: '100%', height: 'auto', cursor: 'ew-resize' }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, az }
          ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (drag.current) setAz(drag.current.az + (e.clientX - drag.current.x) * 0.012)
        }}
        onPointerUp={() => {
          drag.current = null
        }}
      >
        <path d={poly(sq(0))} style={{ fill: 'color-mix(in srgb, var(--viz-grid) 60%, transparent)', stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
        {[-2, -1, 0, 1, 2].map((g) => {
          const a = proj(g, -3, 0)
          const b = proj(g, 3, 0)
          const c = proj(-3, g, 0)
          const d = proj(3, g, 0)
          return (
            <g key={g} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
              <line x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} />
            </g>
          )
        })}
        <line x1={ox} y1={oy} x2={zx} y2={zy} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
        <text x={zx + 6} y={zy + 4} className="plot-label" style={{ fill: 'var(--viz-ink)' }}>
          z = x² + y²
        </text>
        {t > 0.02 && [1, 2, 2.8].map((r) => <path key={r} d={ring(r)} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 1, strokeDasharray: '3 4' }} />)}
        {below.map(dot)}
        <path d={poly(sq(CUT))} style={{ fill: 'color-mix(in srgb, var(--viz-6) 28%, transparent)', stroke: 'var(--viz-6)', strokeWidth: 1.5 }} />
        <text x={planeLabel[0] + 2} y={planeLabel[1] + 16} className="plot-label" style={{ fill: 'var(--viz-6)', fontWeight: 700 }}>
          flat plane z = {CUT}
        </text>
        {above.map(dot)}
      </svg>
    </div>
  )
}

export default function KernelLift() {
  const [t, setT] = useState(1)
  const [az, setAz] = useState((35 * Math.PI) / 180)
  const [playing, setPlaying] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(620)

  useAnimationFrame((dt) => setT((v) => Math.min(1, v + dt * 0.45)), playing)
  useEffect(() => {
    if (playing && t >= 1) setPlaying(false)
  }, [playing, t])

  const wrongSide = PTS.filter((p) => {
    const z = t * (p.x * p.x + p.y * p.y)
    return p.label > 0 ? z < CUT : z >= CUT
  }).length
  const separated = wrongSide === 0
  const head = { fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' as const }

  return (
    <Figure
      title="The kernel idea: lift the data, then cut it flat"
      caption={
        <>
          No straight line separates the inner orange disc from the outer blue ring. Press <b>Lift</b> (or drag the slider): each point rises to the
          height <i>z</i> = <i>x</i>² + <i>y</i>², so points far from the centre rise much more. Once the lift is big enough, a <b>flat</b> plane slips
          between the two classes. Seen from above (left), that flat cut is a <b>circle</b>. Drag the 3-D view sideways to turn it.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'grid', gap: 2 }}>
          <div style={head}>Original data (x, y)</div>
          <Plot x={[-3, 3]} y={[-3, 3]} width={300} height={300} maxWidth={340} margin={{ left: 30, bottom: 30, right: 10, top: 10 }} ariaLabel="Ring-shaped data in two dimensions with the circular boundary that the flat cut makes">
            <Grid xTicks={6} yTicks={6} />
            <Axes xLabel="x" yLabel="y" xTicks={6} yTicks={6} origin />
            {separated && (
              <Path
                points={Array.from({ length: 97 }, (_, i) => [R_CUT * Math.cos((i / 96) * 2 * Math.PI), R_CUT * Math.sin((i / 96) * 2 * Math.PI)] as [number, number])}
                color="var(--viz-6)"
                width={3}
                fill="color-mix(in srgb, var(--viz-6) 12%, transparent)"
              />
            )}
            {PTS.map((p, i) => (
              <Mark key={i} x={p.x} y={p.y} label={p.label} r={5} />
            ))}
            {separated && (
              <Label x={R_CUT * 0.72} y={-R_CUT * 0.72} dx={6} dy={14} color="var(--viz-6)" weight={700}>
                x² + y² = {CUT}
              </Label>
            )}
          </Plot>
        </div>
        <div style={{ display: 'grid', gap: 2 }}>
          <div style={head}>Lifted: add a third feature z</div>
          <Lift3D t={t} az={az} setAz={setAz} />
        </div>
      </div>
      <Controls>
        <Button
          primary
          onClick={() => {
            if (t >= 1) setT(0)
            setPlaying(true)
          }}
          disabled={playing}
        >
          {t >= 1 ? 'Lift again' : 'Lift'}
        </Button>
        <Slider label="lift amount" value={t} min={0} max={1} step={0.01} onChange={(v) => (setPlaying(false), setT(v))} format={(v) => v.toFixed(2)} />
        <Slider label="turn the 3-D view" value={Math.round((az * 180) / Math.PI)} min={-90} max={180} step={1} onChange={(v) => setAz((v * Math.PI) / 180)} format={(v) => `${v}°`} />
        <Readout items={[['points on the wrong side of the plane', String(wrongSide)], ['a flat plane separates them?', separated ? 'yes' : 'not yet']]} />
      </Controls>
    </Figure>
  )
}
