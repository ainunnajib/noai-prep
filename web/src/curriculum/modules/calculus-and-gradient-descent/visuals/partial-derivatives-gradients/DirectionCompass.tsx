import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Toggle, Plot, Grid, Axes, FnPath, Path, Arrow, Dots, Label, VLine, HLine, MBlock, useNarrow } from '../../../../../kit'
import { HeatMap, ContourLines, Clipped, chainSegments, contourSegments, num, par } from './fieldKit'
import { Handle } from '../derivatives-as-slopes/plotHelpers'

/*
  Which way is steepest? On the oval bowl f(x, y) = x² + 3y², the learner turns a direction
  arrow u around a point P. The slope of the ground in that direction is ∇f · u
  = |∇f| cos(angle between them). The right-hand plot shows that slope for every direction:
  a cosine wave whose peak is the gradient's direction and whose zeros run along the contour.
*/

const f = (x: number, y: number) => x * x + 3 * y * y
const grad = (x: number, y: number): [number, number] => [2 * x, 6 * y]
const X: [number, number] = [-3, 3]
const Y: [number, number] = [-2, 2]
const LEVELS = Array.from({ length: 12 }, (_, i) => i + 1) // equal height steps: packed contours = steep
const RHO = 0.85 // length of the direction arrow on the map
const DIR = 'var(--viz-4)'
const GRAD = 'var(--viz-2)'
const snap = (v: number) => Math.round(v * 10) / 10
const deg = (r: number) => (r * 180) / Math.PI
const wrap360 = (d: number) => ((d % 360) + 360) % 360
const panelTitle: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: '0.15rem' }

export default function DirectionCompass() {
  const [p, setP] = useState<[number, number]>([-2, 0.5])
  const [theta, setTheta] = useState(0) // degrees, 0 = east, anticlockwise
  const [reveal, setReveal] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const [px, py] = p
  const [gx, gy] = grad(px, py)
  const gLen = Math.hypot(gx, gy)
  const th = (theta * Math.PI) / 180
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const slope = gx * u[0] + gy * u[1]
  const h = 1e-4
  const measured = (f(px + h * u[0], py + h * u[1]) - f(px - h * u[0], py - h * u[1])) / (2 * h)
  const thetaG = gLen > 1e-9 ? wrap360(deg(Math.atan2(gy, gx))) : 0
  const between = Math.abs(((theta - thetaG + 540) % 360) - 180)
  const top = Math.max(3, Math.ceil(gLen * 1.2))
  const tip: [number, number] = [px + RHO * u[0], py + RHO * u[1]]
  const gScale = gLen > 1e-9 ? 1.25 / Math.max(gLen, 2.5) : 0
  const level = f(px, py)
  const throughP = level > 0.02 ? chainSegments(contourSegments(f, X, Y, 90, 60, level)) : []

  const slopeWord = Math.abs(slope) < 0.05 ? 'flat: you are walking along the contour' : slope > 0 ? 'uphill' : 'downhill'
  const steepest = reveal && between < 2.6

  return (
    <Figure
      title="Turn the compass: which direction is steepest?"
      caption={
        <>
          You stand at the orange point P on the oval bowl <i>f</i>(x, y) = x² + 3y² (a map from above; stronger colour = higher, contour lines at equal steps of height). Drag the pink arrow&apos;s tip
          to turn the direction you walk in, and read the slope of the ground that way. Find the direction where the ground rises fastest, then switch
          on <b>Show the gradient</b> to check. Notice where the slope is exactly 0: along the dashed contour line through P. Drag P to try other spots.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1.15fr 1fr', gap: '0.5rem 1rem', alignItems: 'start' }}
      >
        <div>
          <div style={panelTitle}>Map: f(x, y) = x² + 3y²</div>
          <Plot
            x={X}
            y={Y}
            width={360}
            height={252}
            maxWidth={440}
            margin={{ left: 30, bottom: 28, right: 12, top: 12 }}
            ariaLabel={`Contour map of an oval bowl. Point P at (${num(px)}, ${num(py)}); walking direction ${Math.round(theta)} degrees; slope ${num(slope)}`}
          >
            <HeatMap f={f} fnKey="bowl" range={[0, 14]} strength={34} />
            <ContourLines f={f} fnKey="bowl" levels={LEVELS} />
            <Axes xLabel="x" yLabel="y" xTicks={6} yTicks={4} />
            <Clipped>
              {throughP.map((line, i) => (
                <Path key={i} points={line} color="var(--viz-ink)" width={2} dash="6 4" />
              ))}
            </Clipped>
            <Path
              points={Array.from({ length: 49 }, (_, i): [number, number] => [px + RHO * Math.cos((i / 48) * 2 * Math.PI), py + RHO * Math.sin((i / 48) * 2 * Math.PI)])}
              color="color-mix(in srgb, var(--viz-ink) 35%, transparent)"
              width={1}
              dash="2 3"
            />
            {reveal && gLen > 1e-9 && <Arrow from={p} to={[px + gx * gScale, py + gy * gScale]} color={GRAD} width={3.5} label="∇f" labelOffset={[4, -6]} />}
            <Arrow from={p} to={tip} color={DIR} width={3} />
            <Dots points={[{ x: px, y: py, r: 4, color: 'var(--viz-ink)' }]} stroke="none" />
            <Handle
              x={tip[0]}
              y={tip[1]}
              r={7}
              color={DIR}
              label="u"
              ariaLabel="walking direction u: drag to turn it"
              onChange={(x, y) => {
                const d = wrap360(deg(Math.atan2(y - py, x - px)))
                setTheta(Math.round(d / 5) * 5 === 360 ? 0 : Math.round(d / 5) * 5)
              }}
            />
            <Handle
              x={px}
              y={py}
              r={6}
              color={GRAD}
              label="P"
              ariaLabel="point P: drag it around the map"
              constrain={(x, y) => [Math.max(-2.6, Math.min(2.6, snap(x))), Math.max(-1.6, Math.min(1.6, snap(y)))]}
              onChange={(x, y) => setP([x, y])}
            />
          </Plot>
        </div>
        <div>
          <div style={panelTitle}>Slope of the ground in each direction</div>
          <Plot
            x={[0, 360]}
            y={[-top, top]}
            width={320}
            height={252}
            maxWidth={420}
            minHeight={200}
            margin={{ left: 36, bottom: 28, right: 12, top: 12 }}
            ariaLabel={`Slope against walking direction: a cosine wave between ${num(-gLen)} and ${num(gLen)}. Current direction ${Math.round(theta)} degrees, slope ${num(slope)}`}
          >
            {[90, 180, 270].map((d) => (
              <VLine key={d} x={d} color="var(--viz-grid)" dash="" width={1} />
            ))}
            <Grid xTicks={0} yTicks={4} />
            <Axes yTicks={4} hideXTicks />
            <HLine y={0} color="var(--viz-axis)" dash="" width={1.2} />
            {[0, 90, 180, 270, 360].map((d) => (
              <Label key={d} x={d} y={-top} dy={17} anchor="middle" color="var(--ink-2)" size={12} weight={500}>
                {`${d}°`}
              </Label>
            ))}
            <FnPath f={(d) => gx * Math.cos((d * Math.PI) / 180) + gy * Math.sin((d * Math.PI) / 180)} color={DIR} width={2.5} />
            {reveal && gLen > 1e-9 && (
              <>
                <VLine x={thetaG} color={GRAD} dash="5 4" />
                <HLine y={gLen} color={GRAD} dash="2 4" width={1.2} />
                <Label x={thetaG} y={gLen} dx={thetaG > 250 ? -6 : 6} dy={-8} anchor={thetaG > 250 ? 'end' : 'start'} color={GRAD} weight={700}>
                  {`max = |∇f| = ${num(gLen)}`}
                </Label>
              </>
            )}
            <Dots points={[{ x: theta, y: slope, r: 6, color: DIR }]} />
          </Plot>
        </div>
      </div>
      <MBlock>
        {reveal
          ? narrow
            ? `\\begin{aligned}\\theta = ${Math.round(theta)}^\\circ:\\ \\nabla f \\cdot u &= ${par(gx)}\\times${par(Number(u[0].toFixed(3)), 3)} \\\\ &\\quad + ${par(gy)}\\times${par(Number(u[1].toFixed(3)), 3)} = ${num(slope)}\\end{aligned}`
            : `\\text{slope in direction } \\theta = ${Math.round(theta)}^\\circ:\\quad \\nabla f \\cdot u = ${par(gx)}\\times${par(Number(u[0].toFixed(3)), 3)} + ${par(gy)}\\times${par(Number(u[1].toFixed(3)), 3)} = ${num(slope)}`
          : `\\text{slope in direction } \\theta = ${Math.round(theta)}^\\circ:\\quad ${num(measured)}`}
      </MBlock>
      <Controls>
        <Toggle label="Show the gradient" checked={reveal} onChange={setReveal} />
      </Controls>
      <Readout
        items={[
          ['P', `(${num(px)}, ${num(py)})`],
          ['∇f(P) = [2x, 6y]', reveal ? `[${num(gx)}, ${num(gy)}]` : 'hidden'],
          ['slope measured on the map', `${num(measured)} (${slopeWord})`],
          ...(reveal ? ([['angle between u and ∇f', `${Math.round(between)}°${steepest ? ': steepest!' : ''}`]] as [string, string][]) : []),
        ]}
      />
    </Figure>
  )
}
