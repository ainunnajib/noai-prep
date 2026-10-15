import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, Plot, Path, Dots, Arrow, Axes, usePlot, useNarrow } from '../../../../../kit'
import { Handle, fx } from '../derivatives-as-slopes/plotHelpers'

/*
  Gradient descent on a two-parameter quadratic bowl
    L(w1, w2) = ½ (c1 w1² + c2 w2²),   c2 = 1 (sharply curved), c1 = 1/elongation (gently curved).
  Seen from above as contour lines (like a topographic map), drawn at equal steps of loss.
  The learner drags the start, sets the learning rate and the elongation, and can "standardise
  the features", which makes both curvatures 1 so the contours become circles.
  Colours follow the module convention: −∇L green, the descent path purple.
  When the walk diverges, the path is drawn only until it leaves the map.
*/

const X_WIDE: [number, number] = [-6, 6]
const X_NARROW: [number, number] = [-4.5, 4.5]
const Y: [number, number] = [-3.2, 3.2]
// equal steps of loss L = 0.25, 0.75, …, 4.75; on the w₂-axis L = ½w₂², so each oval has w₂ semi-axis √(2L)
const LEVELS = Array.from({ length: 10 }, (_, i) => Math.sqrt(2 * (0.25 + 0.5 * i)))
const PATH = 'var(--viz-5)'
const DOWN = 'var(--viz-3)'
const MAX_ITERS = 300
const TOL = 0.05

/** clip children (dots, arrows) to the plotting area */
function Clipped({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

function walk(start: [number, number], eta: number, c1: number, c2: number) {
  const pts: [number, number][] = [start]
  let status: 'converged' | 'diverged' | 'slow' = 'slow'
  for (let i = 0; i < MAX_ITERS; i++) {
    const [a, b] = pts[pts.length - 1]
    if (Math.hypot(a, b) < TOL) {
      status = 'converged'
      break
    }
    if (Math.hypot(a, b) > 200) {
      status = 'diverged'
      break
    }
    pts.push([a - eta * c1 * a, b - eta * c2 * b])
  }
  return { pts, status }
}

export default function GD2DContours() {
  const [eta, setEta] = useState(1.8)
  const [kappa, setKappa] = useState(10)
  const [scaled, setScaled] = useState(false)
  const [start, setStart] = useState<[number, number]>([-4.2, 2.4])
  const [shown, setShown] = useState<number | null>(null)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const c2 = 1
  const c1 = scaled ? 1 : 1 / kappa
  const { pts, status } = useMemo(() => walk(start, eta, c1, c2), [start, eta, c1])
  const steps = pts.length - 1
  const visible = shown == null ? pts : pts.slice(0, shown + 1)
  const XR = narrow ? X_NARROW : X_WIDE
  const inside = ([a, b]: [number, number]) => a >= XR[0] && a <= XR[1] && b >= Y[0] && b <= Y[1]
  // draw the walk only until it first leaves the map; the last segment is cut at the border
  const outAt = visible.findIndex((q) => !inside(q))
  const drawn = outAt === -1 ? visible : visible.slice(0, outAt)
  let exit: [number, number] | null = null
  if (outAt > 0) {
    const [a0, b0] = visible[outAt - 1]
    const [a1, b1] = visible[outAt]
    let t = 1
    if (a1 > XR[1]) t = Math.min(t, (XR[1] - a0) / (a1 - a0))
    if (a1 < XR[0]) t = Math.min(t, (XR[0] - a0) / (a1 - a0))
    if (b1 > Y[1]) t = Math.min(t, (Y[1] - b0) / (b1 - b0))
    if (b1 < Y[0]) t = Math.min(t, (Y[0] - b0) / (b1 - b0))
    exit = [a0 + t * (a1 - a0), b0 + t * (b1 - b0)]
  }

  useEffect(() => {
    if (shown == null) return
    if (shown >= Math.min(steps, 80)) {
      setShown(null)
      return
    }
    const t = window.setTimeout(() => setShown((s) => (s == null ? null : s + 1)), 140)
    return () => window.clearTimeout(t)
  }, [shown, steps])

  const ellipse = (r: number): [number, number][] => {
    const a1 = r * Math.sqrt(c2 / c1)
    return Array.from({ length: 73 }, (_, i) => {
      const t = (i / 72) * 2 * Math.PI
      return [a1 * Math.cos(t), r * Math.sin(t)]
    })
  }
  // steepest-downhill direction at the start, drawn with a fixed length
  const g = [-c1 * start[0], -c2 * start[1]]
  const gl = Math.hypot(g[0], g[1]) || 1
  const arrowLen = 1.7
  const gTip: [number, number] = [start[0] + (g[0] / gl) * arrowLen, start[1] + (g[1] / gl) * arrowLen]
  const etaMax = 2 / Math.max(c1, c2)
  const m1 = 1 - eta * c1
  const m2 = 1 - eta * c2

  const reset = () => setShown(null)
  const verdict =
    status === 'converged'
      ? `${steps} step${steps === 1 ? '' : 's'} to get within ${TOL} of the minimum`
      : status === 'diverged'
        ? 'diverges, and the path leaves the map: η is above 2 ÷ (largest curvature)'
        : `still not there after ${MAX_ITERS} steps`

  return (
    <Figure
      title="Zig-zags in a long, narrow valley"
      caption={
        <>
          You are looking down on a two-parameter loss from above: each oval is a contour line joining points of equal loss, and the minimum is in
          the middle, and the ovals are drawn at equal steps of loss. Drag the purple start point and watch the purple path. The green arrow shows
          the steepest-downhill direction −∇L: it points across the valley, not along it to the minimum. Raise the elongation and the path crawls; raise η to speed up and it diverges. Then switch on{' '}
          <b>standardise features</b>.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot x={narrow ? X_NARROW : X_WIDE} y={Y} width={narrow ? 360 : 480} height={narrow ? 262 : 274} maxWidth={680} margin={{ left: 34, bottom: 30 }} ariaLabel={`Contour map of a ${scaled ? 'round' : 'long, narrow'} bowl with a gradient descent path of ${steps} steps`}>
          {LEVELS.slice()
            .reverse()
            .map((r, i) => (
              <Path key={`f${r}`} points={ellipse(r)} closed fill={`color-mix(in srgb, var(--viz-1) ${4 + i}%, transparent)`} color="color-mix(in srgb, var(--viz-1) 60%, var(--surface))" width={1.3} />
            ))}
          <Axes xLabel="w₁" yLabel="w₂" xTicks={narrow ? 4 : 6} yTicks={3} />
          <Path points={[start, [0, 0]]} color="var(--viz-muted)" width={1.5} dash="5 5" />
          <Path points={drawn} color={PATH} width={2.2} />
          <Clipped>
            <Dots points={drawn.slice(1, 61).map(([x, y]) => ({ x, y, r: 3.2, color: PATH }))} stroke="none" />
            {exit && <Arrow from={drawn[drawn.length - 1]} to={exit} color="var(--viz-neg)" width={2.2} head={10} />}
            <Arrow from={start} to={gTip} color={DOWN} width={3} label="−∇L" labelOffset={[6, 14]} />
          </Clipped>
          <Dots points={[{ x: 0, y: 0, r: 6, color: 'var(--viz-ink)', shape: 'cross' }]} />
          <Handle
            x={start[0]}
            y={start[1]}
            color={PATH}
            ariaLabel="start point: drag it"
            constrain={(x, y) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]}
            onChange={(x, y) => {
              setStart([x, y])
              reset()
            }}
            label="start"
          />
        </Plot>
      </div>
      <Controls>
        <Slider
          label="learning rate η"
          value={eta}
          min={0.05}
          max={2.2}
          step={0.05}
          onChange={(v) => {
            setEta(v)
            reset()
          }}
          format={(v) => v.toFixed(2)}
        />
        <Slider
          label={scaled ? 'elongation (ignored: features standardised)' : 'elongation (largest ÷ smallest curvature)'}
          value={kappa}
          min={1}
          max={30}
          step={1}
          onChange={(v) => {
            setKappa(v)
            reset()
          }}
          format={(v) => `${v}×`}
        />
      </Controls>
      <Controls>
        <Toggle
          label="Standardise features (make the bowl round)"
          checked={scaled}
          onChange={(v) => {
            setScaled(v)
            reset()
          }}
        />
        <Button onClick={() => setShown(0)}>Replay the walk</Button>
      </Controls>
      <Readout
        items={[
          ['curvatures', `${c1.toFixed(2)} along w₁, ${c2.toFixed(2)} along w₂`],
          ['largest safe η = 2 ÷ largest curvature', etaMax.toFixed(2)],
          ['each step multiplies', `w₁ by ${fx(m1, 2)}, w₂ by ${fx(m2, 2)}`],
          ['result', verdict],
        ]}
      />
    </Figure>
  )
}
