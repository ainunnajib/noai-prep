import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, FnPath, Dots, Label, M } from '../../../../../kit'

/*
  Critical points in 2-D. Each surface has zero gradient at the origin. Pick a direction
  and slice the surface through the origin along it: the slice's second derivative says
  whether the surface curves up or down in that direction. Minimum = up in every
  direction, maximum = down in every direction, saddle = up in some and down in others.
*/

type Kind = 'bowl' | 'dome' | 'saddle'
// f(x, y) = a x² + b y², so the Hessian is diag(2a, 2b)
const SURF: Record<Kind, { a: number; b: number; name: string }> = {
  bowl: { a: 1, b: 1, name: 'x² + y²' },
  dome: { a: -1, b: -1, name: '−x² − y²' },
  saddle: { a: 1, b: -1, name: 'x² − y²' },
}
const R = 1.5 // half-width of the drawn patch
const N = 12 // grid lines per direction

const VB_W = 300
const VB_H = 240
const AZ = (-38 * Math.PI) / 180
const EL = (27 * Math.PI) / 180
const S = 50
const Z_SCALE = 0.36

function project(x: number, y: number, z: number, zMid: number): [number, number] {
  const xr = x * Math.cos(AZ) - y * Math.sin(AZ)
  const depth = x * Math.sin(AZ) + y * Math.cos(AZ)
  return [VB_W / 2 + S * xr, VB_H / 2 + 6 - S * (Z_SCALE * (z - zMid) * Math.cos(EL) + depth * Math.sin(EL))]
}
const pathOf = (pts: [number, number][]) => pts.map(([u, v], i) => `${i ? 'L' : 'M'}${u.toFixed(1)},${v.toFixed(1)}`).join('')

const twoUp: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
  gap: '0.5rem 1rem',
  width: '100%',
  alignItems: 'center',
}

export default function CurvatureSlices() {
  const [kind, setKind] = useState<Kind>('saddle')
  const [deg, setDeg] = useState(20)
  const { a, b, name } = SURF[kind]
  const f = (x: number, y: number) => a * x * x + b * y * y
  const th = (deg * Math.PI) / 180
  const c = Math.cos(th)
  const s = Math.sin(th)
  // second derivative of g(t) = f(t c, t s) = (a c² + b s²) t²
  const curv = 2 * (a * c * c + b * s * s)
  const sign = Math.abs(curv) < 0.05 ? 0 : Math.sign(curv)
  const sliceColour = sign > 0 ? 'var(--viz-pos)' : sign < 0 ? 'var(--viz-neg)' : 'var(--viz-muted)'
  const verdict = {
    bowl: ['local minimum', 'it curves up in every direction'],
    dome: ['local maximum', 'it curves down in every direction'],
    saddle: ['saddle point', 'it curves up in some directions and down in others'],
  }[kind]

  // vertical centre of this surface's drawn patch, so every surface sits in the middle of the box
  const zMin = Math.min(0, a * R * R) + Math.min(0, b * R * R)
  const zMax = Math.max(0, a * R * R) + Math.max(0, b * R * R)
  const zMid = (zMin + zMax) / 2
  const P = (x: number, y: number, z: number) => project(x, y, z, zMid)

  // wireframe
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
  const slice: [number, number][] = []
  for (let j = 0; j <= 40; j++) {
    const t = -R + (2 * R * j) / 40
    slice.push(P(t * c, t * s, f(t * c, t * s)))
  }
  const floorZ = zMin - 0.5
  const floorDir: [number, number][] = [P(-R * c, -R * s, floorZ), P(R * c, R * s, floorZ)]
  const floorBox: [number, number][] = [P(-R, -R, floorZ), P(R, -R, floorZ), P(R, R, floorZ), P(-R, R, floorZ), P(-R, -R, floorZ)]
  const [ox, oy] = P(0, 0, 0)
  const tip = P(R * c, R * s, floorZ)

  return (
    <Figure
      title="Zero slope, three different shapes"
      caption={
        <>
          All three surfaces are perfectly flat at the centre (gradient = 0), so each centre is a <b>critical point</b>. Turn the direction slider to
          slice the surface through the centre: green means the slice curves up there, red means it curves down. On the saddle, find a direction
          where it curves up and one where it curves down. A point is a minimum only if it curves up in <i>every</i> direction.
        </>
      }
    >
      <div style={twoUp}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={`3-D surface z = ${name} with a slice through the centre at ${deg} degrees`} style={{ width: '100%', maxWidth: 380, justifySelf: 'center', overflow: 'visible' }}>
          <path d={pathOf(floorBox)} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1.5, fill: 'none' }} />
          <path d={pathOf(floorDir)} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.5, strokeDasharray: '4 4', fill: 'none' }} />
          <circle cx={tip[0]} cy={tip[1]} r={3.5} style={{ fill: 'var(--viz-muted)' }} />
          {lines.map((d, i) => (
            <path key={i} d={d} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 1, opacity: 0.45 }} />
          ))}
          <path d={pathOf(slice)} style={{ fill: 'none', stroke: sliceColour, strokeWidth: 4 }} strokeLinecap="round" />
          <circle cx={ox} cy={oy} r={5.5} style={{ fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 2 }} />
          <text x={8} y={18} className="plot-label">
            z = {name}
          </text>
        </svg>
        <div>
          <Plot x={[-R, R]} y={[-2.6, 2.6]} width={300} height={220} ariaLabel={`Slice of the surface along the chosen direction: second derivative ${curv.toFixed(2)}`}>
            <Grid xTicks={6} yTicks={4} />
            <Axes origin xLabel="t" xTicks={6} yTicks={4} />
            <FnPath f={(t) => f(t * c, t * s)} color={sliceColour} width={3.5} />
            <Dots points={[{ x: 0, y: 0, color: 'var(--viz-2)', r: 5.5 }]} />
            <Label x={-R} y={2.6} dx={6} dy={14} color={sliceColour} weight={700}>
              {sign > 0 ? 'curves up ∪' : sign < 0 ? 'curves down ∩' : 'flat: a straight line'}
            </Label>
          </Plot>
        </div>
      </div>
      <Controls>
        <Segmented
          label="Surface"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'bowl', label: 'Bowl' },
            { value: 'dome', label: 'Dome' },
            { value: 'saddle', label: 'Saddle' },
          ]}
        />
        <Slider label="slice direction" value={deg} min={0} max={180} step={5} onChange={setDeg} format={(v) => `${v}°`} />
      </Controls>
      <Readout items={[['second derivative along this slice', <M key="c">{`g''(0) = ${curv.toFixed(2)}`}</M>]]} />
      <div style={{ width: '100%', fontSize: '0.875rem', color: 'var(--ink-2)' }}>
        <b style={{ color: 'var(--ink)' }}>The centre is a {verdict[0]}</b>: {verdict[1]}.
      </div>
    </Figure>
  )
}
