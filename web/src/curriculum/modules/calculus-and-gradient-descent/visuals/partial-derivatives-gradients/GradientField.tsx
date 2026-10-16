import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Plot, Axes, Path, Arrow, Dots, Label, useNarrow, usePlot } from '../../../../../kit'
import { HeatMap, ContourLines, Clipped, chainSegments, contourSegments, num, type Fn2 } from './fieldKit'
import { Handle } from '../derivatives-as-slopes/plotHelpers'

/*
  The gradient at every point of a contour map. Drag P: the orange arrow is ∇f (straight uphill),
  the green arrow is −∇f (straight downhill), and both cross the contour line through P at a right
  angle. Optional layers: a field of small downhill arrows everywhere, and the path water would take
  if it always flowed along −∇f. Contour levels are equally spaced in height, so packed contours
  really do mean steep ground (the rule the lesson teaches).
*/

/** levels from a to b in equal steps */
const steps = (a: number, b: number, d: number) => Array.from({ length: Math.round((b - a) / d) + 1 }, (_, i) => Math.round((a + i * d) * 1000) / 1000)

type Key = 'bowl' | 'valley' | 'two'
interface Fn {
  label: string
  name: string
  f: Fn2
  g: (x: number, y: number) => [number, number]
  gText: string
  range: [number, number]
  levels: number[]
  scale: number
  start: [number, number]
}

const FNS: Record<Key, Fn> = {
  bowl: {
    label: 'Round bowl',
    name: 'x² + y²',
    f: (x, y) => x * x + y * y,
    g: (x, y) => [2 * x, 2 * y],
    gText: '[2x, 2y]',
    range: [0, 13],
    levels: steps(1, 12, 1),
    scale: 0.28,
    start: [1.5, 1],
  },
  valley: {
    label: 'Long valley',
    name: '0.25x² + 2y²',
    f: (x, y) => 0.25 * x * x + 2 * y * y,
    g: (x, y) => [0.5 * x, 4 * y],
    gText: '[0.5x, 4y]',
    range: [0, 10],
    levels: steps(0.5, 7, 0.5),
    scale: 0.28,
    start: [-2.2, 0.8],
  },
  two: {
    label: 'Two valleys',
    name: '½(x² − 1.5)² + y² + 0.3x',
    f: (x, y) => 0.5 * (x * x - 1.5) ** 2 + y * y + 0.3 * x,
    g: (x, y) => [2 * x * (x * x - 1.5) + 0.3, 2 * y],
    gText: '[2x(x² − 1.5) + 0.3, 2y]',
    range: [-0.4, 9],
    levels: steps(-0.3, 8.7, 0.5),
    scale: 0.22,
    start: [0.3, 1.4],
  },
}

const X: [number, number] = [-3, 3]
const X_NARROW: [number, number] = [-2.4, 2.4]
const Y: [number, number] = [-2, 2]
const UP = 'var(--viz-2)'
const DOWN = 'var(--viz-3)'
const snap = (v: number) => Math.round(v * 10) / 10

/** Small downhill arrows on a grid (one path for all shafts, one for all heads, to stay light). */
function FlowField({ F, sparse }: { F: Fn; sparse: boolean }) {
  const { xs, ys, clipId } = usePlot()
  const d = useMemo(() => {
    const [xa, xb] = xs.domain()
    let shafts = ''
    let heads = ''
    const nx = sparse ? 10 : 15
    const ny = sparse ? 8 : 10
    for (let i = 0; i <= nx; i++) {
      for (let j = 0; j <= ny; j++) {
        const x = xa + ((xb - xa) * (i + 0.5)) / (nx + 1)
        const y = Y[0] + ((Y[1] - Y[0]) * (j + 0.5)) / (ny + 1)
        const [gx, gy] = F.g(x, y)
        const len = Math.hypot(gx, gy)
        if (len < 1e-6) continue
        // length grows with steepness but is capped so arrows never overlap
        const L = Math.min(0.3, 0.06 + 0.05 * len)
        const ux = -gx / len
        const uy = -gy / len
        const x1 = xs(x - (ux * L) / 2)
        const y1 = ys(y - (uy * L) / 2)
        const x2 = xs(x + (ux * L) / 2)
        const y2 = ys(y + (uy * L) / 2)
        shafts += `M${x1.toFixed(1)},${y1.toFixed(1)}L${x2.toFixed(1)},${y2.toFixed(1)}`
        const sx = x2 - x1
        const sy = y2 - y1
        const sl = Math.hypot(sx, sy) || 1
        const hx = (sx / sl) * 5
        const hy = (sy / sl) * 5
        heads += `M${x2.toFixed(1)},${y2.toFixed(1)}L${(x2 - hx - hy * 0.6).toFixed(1)},${(y2 - hy + hx * 0.6).toFixed(1)}L${(x2 - hx + hy * 0.6).toFixed(1)},${(y2 - hy - hx * 0.6).toFixed(1)}Z`
      }
    }
    return { shafts, heads }
  }, [F, xs, ys, sparse])
  const c = `color-mix(in srgb, ${DOWN} 70%, var(--surface))`
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      <path d={d.shafts} style={{ fill: 'none', stroke: c, strokeWidth: 1.4 }} strokeLinecap="round" />
      <path d={d.heads} style={{ fill: c, stroke: 'none' }} />
    </g>
  )
}

/** Path water would follow from P: many tiny steps along −∇f until the ground is flat. */
function flowPath(F: Fn, start: [number, number]): [number, number][] {
  const pts: [number, number][] = [start]
  let [x, y] = start
  for (let i = 0; i < 900; i++) {
    const [gx, gy] = F.g(x, y)
    const len = Math.hypot(gx, gy)
    if (len < 0.02) break
    const step = Math.min(0.02, len * 0.02)
    x -= (gx / len) * step
    y -= (gy / len) * step
    if (i % 3 === 0) pts.push([x, y])
  }
  pts.push([x, y])
  return pts
}

export default function GradientField() {
  const [key, setKey] = useState<Key>('bowl')
  const [p, setP] = useState<[number, number]>(FNS.bowl.start)
  const [field, setField] = useState(true)
  const [water, setWater] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const F = FNS[key]
  const [px, py] = p
  const [gx, gy] = F.g(px, py)
  const gLen = Math.hypot(gx, gy)
  const k = F.scale
  const level = F.f(px, py)
  const contour = useMemo(() => chainSegments(contourSegments(F.f, X, Y, 120, 80, level)), [F, level])
  const path = useMemo(() => (water ? flowPath(F, p) : []), [water, F, p])

  // tangent to the contour at P (perpendicular to the gradient) and a right-angle marker
  const ux = gLen > 1e-9 ? gx / gLen : 1
  const uy = gLen > 1e-9 ? gy / gLen : 0
  const tx = -uy
  const ty = ux
  const T = 0.55
  const m = 0.16
  const corner: [number, number][] = [
    [px + tx * m, py + ty * m],
    [px + tx * m + ux * m, py + ty * m + uy * m],
    [px + ux * m, py + uy * m],
  ]

  return (
    <Figure
      title="The gradient points straight uphill, across the contours"
      caption={
        <>
          Drag the point P around the map. The orange arrow is the gradient ∇f (straight uphill) and the green arrow is −∇f (straight downhill); these
          two colours mean the same in every map of this module. Both cross the dashed contour through P at a right angle. Contour lines are drawn at
          equal steps of height, so where they are packed closely together the ground is steep, and both arrows get longer.
          Switch on <b>Water&apos;s path</b> and drop P in different places on the two-valley map: which valley the water ends in depends on where it
          starts. Arrows are drawn at {Math.round(k * 100)}% of their true length.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot
          x={narrow ? X_NARROW : X}
          y={Y}
          width={narrow ? 360 : 540}
          height={narrow ? 305 : 370}
          maxWidth={640}
          margin={{ left: 30, bottom: 28, right: 12, top: 12 }}
          ariaLabel={`Contour map of f = ${F.name} with the gradient at P = (${num(px)}, ${num(py)}): [${num(gx)}, ${num(gy)}]`}
        >
          <HeatMap f={F.f} fnKey={key} range={F.range} strength={30} cells={narrow ? 30 : 36} sequential />
          <ContourLines f={F.f} fnKey={key} levels={F.levels} res={80} />
          {field && <FlowField F={F} sparse={narrow} />}
          <Axes xLabel="x" yLabel="y" xTicks={6} yTicks={4} />
          <Clipped>
            {contour.map((line, i) => (
              <Path key={i} points={line} color="var(--viz-ink)" width={2.2} dash="6 4" />
            ))}
            {water && <Path points={path} color="var(--viz-1)" width={3.5} />}
            {water && path.length > 1 && <Dots points={[{ x: path[path.length - 1][0], y: path[path.length - 1][1], r: 5, color: 'var(--viz-1)', shape: 'square' }]} />}
            {gLen > 1e-9 && (
              <>
                <Path points={[[px - tx * T, py - ty * T], [px + tx * T, py + ty * T]]} color="var(--viz-ink)" width={1.5} />
                <Path points={corner} color="var(--viz-ink)" width={1.5} />
                <Arrow from={p} to={[px - gx * k, py - gy * k]} color={DOWN} width={3.5} label="−∇f" labelOffset={[-8, 16]} />
                <Arrow from={p} to={[px + gx * k, py + gy * k]} color={UP} width={3.5} label="∇f" labelOffset={[6, -6]} />
              </>
            )}
          </Clipped>
          <Label x={px} y={py} dx={(-tx - ux) * 15} dy={(ty + uy) * 15 + 4} anchor="middle" color="var(--viz-ink)" weight={700}>
            P
          </Label>
          <Handle x={px} y={py} r={8} color="var(--viz-ink)" ariaLabel="point P: drag it around the map" constrain={(x, y) => [Math.max(-2.9, Math.min(2.9, snap(x))), Math.max(-1.9, Math.min(1.9, snap(y)))]} onChange={(x, y) => setP([x, y])} />
        </Plot>
      </div>
      <Controls>
        <Segmented
          label="Landscape"
          value={key}
          onChange={(v) => {
            setKey(v)
            setP(FNS[v].start)
          }}
          options={(Object.keys(FNS) as Key[]).map((v) => ({ value: v, label: FNS[v].label }))}
        />
      </Controls>
      <Controls>
        <Toggle label="Field of downhill arrows" checked={field} onChange={setField} />
        <Toggle label="Water's path from P" checked={water} onChange={setWater} />
      </Controls>
      <Readout
        items={[
          ['f', F.name],
          ['∇f', F.gText],
          ['at P', `∇f = [${num(gx)}, ${num(gy)}]`],
          ['steepness |∇f|', num(gLen)],
        ]}
      />
    </Figure>
  )
}
