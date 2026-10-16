import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Path, Dots, Label, DraggablePoint, M, mulberry32, usePlot } from '../../../../../kit'

/*
  "Near" depends on the metric and on the units. Around a draggable query point we shade every
  position within distance r:
    Euclidean   √(Δx₁² + (s·Δx₂)²) ≤ r    → a circle (an ellipse when s ≠ 1)
    Manhattan   |Δx₁| + s·|Δx₂| ≤ r       → a diamond (a squashed one when s ≠ 1)
    cosine      angle between the points, seen from the origin, ≤ θ  → a wedge
  s pretends feature 2 was recorded in other units (its numbers multiplied by s).
*/

type Metric = 'euclidean' | 'manhattan' | 'cosine'

const rng = mulberry32(2027)
const PTS: [number, number][] = Array.from({ length: 40 }, () => [Math.round((0.6 + rng() * 9) * 10) / 10, Math.round((0.6 + rng() * 9) * 10) / 10])

const STRETCH = [0.25, 0.5, 1, 2, 4] as const
const sLabel = (s: number) => (s === 0.25 ? '×¼' : s === 0.5 ? '×½' : `×${s}`)

function inside(m: Metric, q: [number, number], p: [number, number], r: number, thetaDeg: number, s: number) {
  const dx = p[0] - q[0]
  const dy = s * (p[1] - q[1])
  if (m === 'euclidean') return Math.hypot(dx, dy) <= r + 1e-9
  if (m === 'manhattan') return Math.abs(dx) + Math.abs(dy) <= r + 1e-9
  const ax = q[0]
  const ay = s * q[1]
  const bx = p[0]
  const by = s * p[1]
  const cos = (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by))
  return cos >= Math.cos((thetaDeg * Math.PI) / 180) - 1e-12
}

function dist(m: Metric, q: [number, number], p: [number, number], s: number) {
  const dx = p[0] - q[0]
  const dy = s * (p[1] - q[1])
  if (m === 'euclidean') return Math.hypot(dx, dy)
  if (m === 'manhattan') return Math.abs(dx) + Math.abs(dy)
  const ax = q[0]
  const ay = s * q[1]
  const bx = p[0]
  const by = s * p[1]
  return 1 - (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by))
}

/** Outline of the neighbourhood in plot (unstretched) coordinates. */
function region(m: Metric, q: [number, number], r: number, thetaDeg: number, s: number): [number, number][] {
  if (m === 'euclidean')
    return Array.from({ length: 97 }, (_, i) => {
      const t = (i / 96) * 2 * Math.PI
      return [q[0] + r * Math.cos(t), q[1] + (r / s) * Math.sin(t)] as [number, number]
    })
  if (m === 'manhattan') return [[q[0] + r, q[1]], [q[0], q[1] + r / s], [q[0] - r, q[1]], [q[0], q[1] - r / s]]
  // wedge from the origin: angles are measured in the stretched space, then mapped back
  const phi = Math.atan2(s * q[1], q[0])
  const th = (thetaDeg * Math.PI) / 180
  const R = 40
  const pts: [number, number][] = [[0, 0]]
  for (let i = 0; i <= 24; i++) {
    const a = phi - th + (2 * th * i) / 24
    const dx = Math.cos(a)
    const dy = Math.sin(a) / s
    const n = Math.hypot(dx, dy)
    pts.push([(R * dx) / n, (R * dy) / n])
  }
  return pts
}

/** A ring (no fill) around the nearest point, so the point itself stays visible. */
function Ring({ x, y }: { x: number; y: number }) {
  const { xs, ys } = usePlot()
  return <circle cx={xs(x)} cy={ys(y)} r={10} aria-hidden="true" style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2 }} />
}

const snap = (v: number) => Math.round(Math.max(0.3, Math.min(9.7, v)) * 10) / 10

export default function DistanceMetricRings() {
  const [metric, setMetric] = useState<Metric>('euclidean')
  const [q, setQ] = useState<[number, number]>([6, 4])
  const [r, setR] = useState(2)
  const [theta, setTheta] = useState(10)
  const [s, setS] = useState<number>(1)

  const inn = PTS.map((p) => inside(metric, q, p, r, theta, s))
  const count = inn.filter(Boolean).length
  let best = 0
  PTS.forEach((p, i) => {
    if (dist(metric, q, p, s) < dist(metric, q, PTS[best], s)) best = i
  })
  const nearestD = dist(metric, q, PTS[best], s)
  const shape = metric === 'euclidean' ? 'circle' : metric === 'manhattan' ? 'diamond' : 'wedge'

  const formula =
    metric === 'euclidean'
      ? `d = \\sqrt{(\\Delta x_1)^2 + (${s === 1 ? '' : s + '\\,'}\\Delta x_2)^2}`
      : metric === 'manhattan'
        ? `d = |\\Delta x_1| + ${s === 1 ? '' : s + '\\,'}|\\Delta x_2|`
        : `d = 1 - \\cos\\theta = 1 - \\frac{a \\cdot b}{\\lVert a \\rVert\\,\\lVert b \\rVert}`

  return (
    <Figure
      title="What counts as near?"
      caption={
        <>
          Every point inside the shaded shape is within distance <i>r</i> of the query. Switch the metric: Euclidean gives a circle, Manhattan a diamond,
          and cosine a wedge from the origin, because cosine only compares <b>directions</b>. Then change the units of x₂: at ×4 the shape squashes flat
          and only points with almost the same x₂ count as near, while at ×¼ x₂ barely matters. Same data, same algorithm, different neighbours.
        </>
      }
    >
      <Plot
        x={[0, 10]}
        y={[0, 10]}
        width={420}
        height={420}
        maxWidth={460}
        margin={{ left: 34, bottom: 34, right: 12, top: 12 }}
        ariaLabel={`${count} of ${PTS.length} points lie inside the ${shape} around the query point at (${q[0]}, ${q[1]}) using ${metric} distance.`}
        onPointerDown={(p) => setQ([snap(p[0]), snap(p[1])])}
      >
        <Grid xTicks={10} yTicks={10} />
        <Axes xLabel="x₁" yLabel="x₂" xTicks={5} yTicks={5} />
        <Path points={region(metric, q, r, theta, s)} closed color="var(--viz-3)" width={2} fill="color-mix(in srgb, var(--viz-3) 16%, transparent)" />
        {metric === 'cosine' && (
          <>
            <Path points={[[0, 0], [q[0] * 3, q[1] * 3]]} color="var(--viz-muted)" width={1.5} dash="4 4" />
            <Label x={0} y={0} dx={6} dy={-8} color="var(--viz-ink)" weight={700}>
              origin
            </Label>
          </>
        )}
        <Dots points={PTS.map((p, i) => ({ x: p[0], y: p[1], r: inn[i] ? 6 : 4.5, color: inn[i] ? 'var(--viz-3)' : 'var(--viz-muted)' }))} />
        <Ring x={PTS[best][0]} y={PTS[best][1]} />
        <DraggablePoint x={q[0]} y={q[1]} color="var(--viz-4)" onChange={(x, y) => setQ([snap(x), snap(y)])} label="query" />
      </Plot>
      <div style={{ textAlign: 'center', color: 'var(--ink-2)', fontSize: '0.92rem' }}>
        <M>{formula}</M>
      </div>
      <Controls>
        <Segmented
          label="metric"
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'euclidean', label: 'Euclidean' },
            { value: 'manhattan', label: 'Manhattan' },
            { value: 'cosine', label: 'cosine' },
          ]}
        />
        {metric === 'cosine' ? (
          <Slider
            label={<>largest angle θ</>}
            value={theta}
            min={2}
            max={40}
            step={1}
            onChange={setTheta}
            format={(v) => `${v}° (d ≤ ${(1 - Math.cos((v * Math.PI) / 180)).toFixed(3)})`}
          />
        ) : (
          <Slider label={<>radius <i>r</i></>} value={r} min={0.5} max={4} step={0.25} onChange={setR} format={(v) => v.toFixed(2)} />
        )}
        <Segmented
          label="units of x₂ (numbers × s)"
          value={s}
          onChange={setS}
          options={STRETCH.map((v) => ({ value: v, label: sLabel(v) }))}
        />
        <Readout
          items={[
            ['inside', `${count} of ${PTS.length}`],
            ['nearest point', `(${PTS[best][0]}, ${PTS[best][1]})`],
            ['its distance', nearestD.toFixed(metric === 'cosine' ? 4 : 2)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
