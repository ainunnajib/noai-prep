import { useRef, useState, type CSSProperties } from 'react'
import { Figure, Controls, Slider, Segmented, Button, Plot, Grid, Axes, FnPath, Dots, Label, HLine, VLine, DraggablePoint, MatrixGrid, M, useNarrow } from '../../../../../kit'

/*
  Critical points in 2-D and the Hessian. Each surface f(x, y) = a x² + b xy + c y² is flat at the
  centre (gradient 0). Slicing it through the centre in direction θ gives a parabola whose second
  derivative, the curvature in that direction, is uᵀHu with u = [cos θ, sin θ] and
  H = [[2a, b], [b, 2c]]. Its largest and smallest values over all directions are the eigenvalues
  of H, and their signs decide: minimum, maximum or saddle.
*/

type Kind = 'bowl' | 'dome' | 'saddle' | 'tricky'
const SURF: Record<Kind, { a: number; b: number; c: number; name: string; label: string }> = {
  bowl: { a: 1, b: 0, c: 1, name: 'x² + y²', label: 'Bowl' },
  dome: { a: -1, b: 0, c: -1, name: '−x² − y²', label: 'Dome' },
  saddle: { a: 1, b: 0, c: -1, name: 'x² − y²', label: 'Saddle' },
  tricky: { a: 1, b: 3, c: 1, name: 'x² + 3xy + y²', label: 'x² + 3xy + y²' },
}
const R = 1.5 // half-width of the drawn patch
const N = 12 // grid lines per direction
const VB_W = 300
const VB_H = 230
const EL = (27 * Math.PI) / 180
const S = 50
const HEIGHT = 1.62 // vertical extent of every surface, in floor units, so all four fit the box

const pathOf = (pts: [number, number][]) => pts.map(([u, v], i) => `${i ? 'L' : 'M'}${u.toFixed(1)},${v.toFixed(1)}`).join('')
const fmt = (v: number) => {
  const r = Math.round(v * 100) / 100
  return String(Object.is(r, -0) ? 0 : r)
}
const UP = 'var(--viz-pos)'
const DOWN = 'var(--viz-neg)'
const colourOf = (v: number) => (Math.abs(v) < 0.05 ? 'var(--viz-muted)' : v > 0 ? UP : DOWN)
const panel: CSSProperties = { display: 'grid', gap: '0.5rem', justifyItems: 'center', alignContent: 'start', width: '100%' }
const small: CSSProperties = { fontSize: '0.875rem', color: 'var(--ink-2)', textAlign: 'center' }

export default function SaddleSurface() {
  const [kind, setKind] = useState<Kind>('saddle')
  const [deg, setDeg] = useState(20)
  const [az, setAz] = useState(-38)
  const drag = useRef<number | null>(null)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const { a, b, c, name } = SURF[kind]
  const f = (x: number, y: number) => a * x * x + b * x * y + c * y * y
  const H = [
    [2 * a, b],
    [b, 2 * c],
  ]
  const tr = H[0][0] + H[1][1]
  const det = H[0][0] * H[1][1] - H[0][1] * H[1][0]
  const disc = Math.sqrt(Math.max(0, tr * tr - 4 * det))
  const l1 = (tr + disc) / 2
  const l2 = (tr - disc) / 2
  const curvAt = (d: number) => {
    const t = (d * Math.PI) / 180
    const co = Math.cos(t)
    const si = Math.sin(t)
    return H[0][0] * co * co + 2 * H[0][1] * co * si + H[1][1] * si * si
  }
  const curv = curvAt(deg)
  // direction of the largest curvature (an eigenvector of H), in degrees within [0, 180)
  const dMax = ((((0.5 * Math.atan2(2 * H[0][1], H[0][0] - H[1][1]) * 180) / Math.PI) % 180) + 180) % 180
  const dMin = (dMax + 90) % 180
  const verdict =
    l2 > 0
      ? { text: 'both eigenvalues positive: positive definite, so a local minimum', colour: UP }
      : l1 < 0
        ? { text: 'both eigenvalues negative: negative definite, so a local maximum', colour: DOWN }
        : { text: 'one positive, one negative eigenvalue: a saddle point', colour: 'var(--viz-6)' }

  // ---- 3-D wireframe ----
  const AZ = (az * Math.PI) / 180
  let zMin = Infinity
  let zMax = -Infinity
  for (let i = 0; i <= 10; i++)
    for (let j = 0; j <= 10; j++) {
      const v = f(-R + (2 * R * i) / 10, -R + (2 * R * j) / 10)
      zMin = Math.min(zMin, v)
      zMax = Math.max(zMax, v)
    }
  const zScale = HEIGHT / (zMax - zMin)
  const zMid = (zMin + zMax) / 2
  const P = (x: number, y: number, z: number): [number, number] => {
    const xr = x * Math.cos(AZ) - y * Math.sin(AZ)
    const depth = x * Math.sin(AZ) + y * Math.cos(AZ)
    return [VB_W / 2 + S * xr, VB_H / 2 + 4 - S * (zScale * (z - zMid) * Math.cos(EL) + depth * Math.sin(EL))]
  }
  const lines: string[] = []
  for (let i = 0; i <= N; i++) {
    const u = -R + (2 * R * i) / N
    const along: [number, number][] = []
    const across: [number, number][] = []
    for (let j = 0; j <= 24; j++) {
      const v = -R + (2 * R * j) / 24
      along.push(P(u, v, f(u, v)))
      across.push(P(v, u, f(v, u)))
    }
    lines.push(pathOf(along), pathOf(across))
  }
  const th = (deg * Math.PI) / 180
  const co = Math.cos(th)
  const si = Math.sin(th)
  const slice: [number, number][] = []
  for (let j = 0; j <= 40; j++) {
    const t = -R + (2 * R * j) / 40
    slice.push(P(t * co, t * si, f(t * co, t * si)))
  }
  const floorZ = zMin - 0.25 / zScale
  const floorDir: [number, number][] = [P(-R * co, -R * si, floorZ), P(R * co, R * si, floorZ)]
  const floorBox: [number, number][] = [P(-R, -R, floorZ), P(R, -R, floorZ), P(R, R, floorZ), P(-R, R, floorZ), P(-R, -R, floorZ)]
  const xAxisEnd = P(R + 0.25, 0, floorZ)
  const yAxisEnd = P(0, R + 0.25, floorZ)
  const [ox, oy] = P(0, 0, 0)
  const sliceColour = colourOf(curv)

  const yr: [number, number] = [Math.min(-3, Math.floor(l2) - 1), Math.max(3, Math.ceil(l1) + 1)]

  return (
    <Figure
      title="Bowl, dome or saddle? Ask the Hessian"
      caption={
        <>
          Every surface here is perfectly flat at the centre (gradient = 0), so the centre is a <b>critical point</b>. Turn the slice direction θ
          and watch the coloured slice: green curves up, red curves down. The lower graph shows the curvature in <i>every</i> direction; its highest
          and lowest values are the Hessian&apos;s eigenvalues. Find an up direction and a down direction on the saddle, then try x² + 3xy + y²: both
          diagonal entries of its Hessian are positive, yet it is a saddle. Drag the surface sideways to rotate it.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1.25fr 1fr', gap: '0.75rem 1.25rem', alignItems: 'center' }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          tabIndex={0}
          aria-label={`3-D surface z = ${name}, rotated to ${az} degrees, with a slice through the centre at ${deg} degrees that ${curv > 0.05 ? 'curves up' : curv < -0.05 ? 'curves down' : 'is flat'}. Use the left and right arrow keys to rotate.`}
          style={{ width: '100%', maxWidth: 400, justifySelf: 'center', touchAction: 'pan-y', cursor: 'grab', outline: 'none' }}
          onPointerDown={(e) => {
            drag.current = e.clientX
            ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (drag.current == null) return
            const dx = e.clientX - drag.current
            drag.current = e.clientX
            setAz((v) => v - dx * 0.6)
          }}
          onPointerUp={() => {
            drag.current = null
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setAz((v) => v + 8)
            else if (e.key === 'ArrowRight') setAz((v) => v - 8)
          }}
        >
          <path d={pathOf(floorBox)} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1.5, fill: 'color-mix(in srgb, var(--viz-1) 5%, transparent)' }} />
          <path d={pathOf([P(-R, 0, floorZ), xAxisEnd])} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
          <path d={pathOf([P(0, -R, floorZ), yAxisEnd])} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
          <text x={xAxisEnd[0]} y={xAxisEnd[1]} dy={4} dx={xAxisEnd[0] > VB_W / 2 ? 4 : -12} className="plot-label">
            x
          </text>
          <text x={yAxisEnd[0]} y={yAxisEnd[1]} dy={4} dx={yAxisEnd[0] > VB_W / 2 ? 4 : -12} className="plot-label">
            y
          </text>
          <path d={pathOf(floorDir)} style={{ stroke: sliceColour, strokeWidth: 2, strokeDasharray: '5 4', fill: 'none' }} />
          {lines.map((d, i) => (
            <path key={i} d={d} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 1, opacity: 0.45 }} />
          ))}
          <path d={pathOf(slice)} style={{ fill: 'none', stroke: sliceColour, strokeWidth: 4 }} strokeLinecap="round" />
          <circle cx={ox} cy={oy} r={5.5} style={{ fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 2 }} />
          <text x={8} y={18} className="plot-label">
            z = {name}
          </text>
          <text x={VB_W - 8} y={VB_H - 8} textAnchor="end" className="plot-label" style={{ fill: 'var(--viz-muted)', fontSize: 11 }}>
            drag to rotate
          </text>
        </svg>
        <div style={panel}>
          <MatrixGrid
            data={H}
            label={
              <>
                Hessian at the centre, <M>{'H = \\begin{bmatrix} f_{xx} & f_{xy} \\\\ f_{yx} & f_{yy} \\end{bmatrix}'}</M>
              </>
            }
            cellSize={44}
            ariaLabel={`Hessian matrix ${H.map((r) => r.join(', ')).join('; ')}`}
          />
          <div style={{ ...small, display: 'grid', gap: '0.15rem' }}>
            <div>
              eigenvalues: <b style={{ color: colourOf(l1) }}>{fmt(l1)}</b> and <b style={{ color: colourOf(l2) }}>{fmt(l2)}</b>
            </div>
            <div>
              det H = {fmt(det)}, trace H = {fmt(tr)}
            </div>
          </div>
          <div style={{ ...small, fontWeight: 700, color: verdict.colour }}>{verdict.text}</div>
        </div>
      </div>
      <div style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.25rem' }}>
        <div style={{ ...small, fontWeight: 700 }}>
          Curvature in direction θ: <M>{`u^\\top H u`}</M>, with <M>{`u = [\\cos\\theta, \\sin\\theta]`}</M>
        </div>
        <Plot
          x={[0, 180]}
          y={yr}
          width={narrow ? 360 : 560}
          height={narrow ? 190 : 170}
          maxWidth={680}
          margin={{ left: 36, right: 14, top: 10, bottom: 28 }}
          ariaLabel={`Curvature against direction: between ${fmt(l2)} and ${fmt(l1)}. At ${deg} degrees it is ${fmt(curv)}`}
        >
          <Grid xTicks={0} yTicks={4} />
          {[45, 90, 135].map((d) => (
            <VLine key={d} x={d} color="var(--viz-grid)" dash="" width={1} />
          ))}
          <Axes yTicks={4} hideXTicks />
          {[0, 45, 90, 135, 180].map((d) => (
            <Label key={d} x={d} y={yr[0]} dy={17} anchor="middle" color="var(--ink-2)" size={12} weight={500}>
              {`${d}°`}
            </Label>
          ))}
          <HLine y={0} color="var(--viz-axis)" dash="" width={1.2} />
          <HLine y={l1} color={colourOf(l1)} dash="3 4" width={1.2} />
          <HLine y={l2} color={colourOf(l2)} dash="3 4" width={1.2} />
          <Label x={180} y={l1} dx={-4} dy={l1 >= l2 + 0.6 ? -6 : -6} anchor="end" color={colourOf(l1)} weight={700} size={12}>
            {Math.abs(l1 - l2) > 0.4 ? `λ₁ = ${fmt(l1)}` : `λ₁ = λ₂ = ${fmt(l1)}`}
          </Label>
          {Math.abs(l1 - l2) > 0.4 && (
            <Label x={180} y={l2} dx={-4} dy={15} anchor="end" color={colourOf(l2)} weight={700} size={12}>
              {`λ₂ = ${fmt(l2)}`}
            </Label>
          )}
          <FnPath f={curvAt} color="var(--viz-1)" width={2.5} />
          <Dots points={[{ x: deg, y: curv, r: 3, color: sliceColour }]} stroke="none" />
          <DraggablePoint
            x={deg}
            y={curv}
            color={sliceColour === 'var(--viz-muted)' ? 'var(--viz-2)' : sliceColour}
            r={8}
            constrain={(x) => {
              const d = Math.max(0, Math.min(180, Math.round(x / 5) * 5))
              return [d, curvAt(d)]
            }}
            onChange={(x) => setDeg(Math.max(0, Math.min(180, Math.round(x / 5) * 5)))}
            label={`${fmt(curv)}`}
          />
        </Plot>
      </div>
      <Controls>
        <Segmented
          label="Surface"
          value={kind}
          onChange={setKind}
          options={(Object.keys(SURF) as Kind[]).map((k) => ({ value: k, label: SURF[k].label }))}
        />
      </Controls>
      <Controls>
        <Slider label="slice direction θ" value={deg} min={0} max={180} step={5} onChange={setDeg} format={(v) => `${v}°`} />
        <Button onClick={() => setDeg(Math.round(dMax / 5) * 5)}>Direction of λ₁</Button>
        <Button onClick={() => setDeg(Math.round(dMin / 5) * 5)}>Direction of λ₂</Button>
      </Controls>
    </Figure>
  )
}
