import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Button, Plot, Path, Dots, Axes, Label, DraggablePoint, usePlot, useNarrow, useAnimationFrame } from '../../../../../kit'
import { contourSegments } from './contours'

/*
  Four optimisers race down a long, curved valley:
      L(x, y) = K·(y − C·x²)² + A·(x − X_MIN)²
  The floor of the valley is the parabola y = C·x²; the walls are steep (K) and the slope along the
  floor is gentle (A). Every optimiser uses its own sensible learning rate (a common multiplier scales
  them all) and the same start point. Updates follow PyTorch's formulas:
    SGD:       w ← w − η g
    Momentum:  v ← βv + g;            w ← w − η v
    RMSProp:   s ← ρs + (1 − ρ)g²;    w ← w − η g / (√s + ε)
    Adam:      m ← β₁m + (1 − β₁)g;   s ← β₂s + (1 − β₂)g²;   w ← w − η m̂ / (√ŝ + ε)
*/

const K = 2
const C = 0.08
const A = 0.03
const X_MIN = 2.2
const XR: [number, number] = [-3.6, 3.2]
const YR: [number, number] = [-0.6, 2.2]
const STEPS = 150
const RHO = 0.9
const BETA2 = 0.999
const EPS = 1e-8
const LEVELS = [0.004, 0.015, 0.04, 0.09, 0.17, 0.3, 0.5, 0.8, 1.2, 1.8, 2.6, 3.6]

const loss = (x: number, y: number) => K * (y - C * x * x) ** 2 + A * (x - X_MIN) ** 2
const grad = (x: number, y: number): [number, number] => {
  const r = y - C * x * x
  return [K * 2 * r * (-2 * C * x) + 2 * A * (x - X_MIN), K * 2 * r]
}

type OptKey = 'sgd' | 'mom' | 'rms' | 'adam'
const OPTS: { key: OptKey; name: string; lr: number; color: string }[] = [
  { key: 'sgd', name: 'SGD', lr: 0.4, color: 'var(--viz-1)' },
  { key: 'mom', name: 'Momentum', lr: 0.08, color: 'var(--viz-2)' },
  { key: 'rms', name: 'RMSProp', lr: 0.08, color: 'var(--viz-3)' },
  { key: 'adam', name: 'Adam', lr: 0.25, color: 'var(--viz-4)' },
]
const SCALES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

function race(key: OptKey, lr: number, beta: number, start: [number, number]) {
  let [x, y] = start
  let m = [0, 0]
  let s = [0, 0]
  const pts: [number, number][] = [[x, y]]
  let diverged = false
  for (let t = 1; t <= STEPS; t++) {
    if (diverged) {
      pts.push([x, y])
      continue
    }
    const g = grad(x, y)
    let d: number[]
    if (key === 'sgd') d = g
    else if (key === 'mom') {
      m = [beta * m[0] + g[0], beta * m[1] + g[1]]
      d = m
    } else if (key === 'rms') {
      s = [RHO * s[0] + (1 - RHO) * g[0] ** 2, RHO * s[1] + (1 - RHO) * g[1] ** 2]
      d = [g[0] / (Math.sqrt(s[0]) + EPS), g[1] / (Math.sqrt(s[1]) + EPS)]
    } else {
      m = [beta * m[0] + (1 - beta) * g[0], beta * m[1] + (1 - beta) * g[1]]
      s = [BETA2 * s[0] + (1 - BETA2) * g[0] ** 2, BETA2 * s[1] + (1 - BETA2) * g[1] ** 2]
      const c1 = 1 - beta ** t
      const c2 = 1 - BETA2 ** t
      d = [m[0] / c1 / (Math.sqrt(s[0] / c2) + EPS), m[1] / c1 / (Math.sqrt(s[1] / c2) + EPS)]
    }
    x -= lr * d[0]
    y -= lr * d[1]
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 40 || Math.abs(y) > 40) {
      // diverged: park the point far off the map so the path visibly leaves it
      x = Math.max(-40, Math.min(40, Number.isFinite(x) ? x : 40))
      y = Math.max(-40, Math.min(40, Number.isFinite(y) ? y : 40))
      diverged = true
    }
    pts.push([x, y])
  }
  return pts
}

function Contours() {
  const { xs, ys, clipId } = usePlot()
  const segs = useMemo(() => contourSegments(loss, XR, YR, LEVELS, 136, 56), [])
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {segs.map((lvl, i) => (
        <path
          key={i}
          d={lvl.map(([a, b, c, d]) => `M${xs(a).toFixed(1)},${ys(b).toFixed(1)}L${xs(c).toFixed(1)},${ys(d).toFixed(1)}`).join('')}
          style={{ fill: 'none', stroke: `color-mix(in srgb, var(--viz-1) ${Math.round(60 - i * 3.5)}%, var(--surface))`, strokeWidth: 1.1 }}
        />
      ))}
    </g>
  )
}

function Clipped({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

export default function OptimizerRace() {
  const [step, setStep] = useState(60)
  const [playing, setPlaying] = useState(false)
  const [si, setSi] = useState(3)
  const [beta, setBeta] = useState(0.9)
  const [start, setStart] = useState<[number, number]>([-3, 1.3])
  const [hidden, setHidden] = useState<OptKey[]>([])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const scale = SCALES[si]

  const paths = useMemo(() => OPTS.map((o) => ({ ...o, lr: o.lr * scale, pts: race(o.key, o.lr * scale, beta, start) })), [scale, beta, start])

  useAnimationFrame((dt) => {
    setStep((s) => {
      const ns = Math.min(STEPS, s + Math.max(1, Math.round(dt * 45)))
      if (ns >= STEPS) setPlaying(false)
      return ns
    })
  }, playing)

  const toggle = (k: OptKey) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]))
  const inMap = (p: [number, number]) => p[0] >= XR[0] && p[0] <= XR[1] && p[1] >= YR[0] && p[1] <= YR[1]

  return (
    <Figure
      title="The optimiser race"
      caption={
        <>
          A long, curved valley seen from above; the cross marks the minimum. All four start at the dark dot (drag it) and each uses a
          sensible learning rate of its own. Press <b>Play</b> or drag the step slider. <b>SGD</b> zig-zags between the steep walls and
          creeps along the gentle floor. <b>Momentum</b> cancels the zig-zag and speeds along the floor (watch it swing past bends).
          <b> RMSProp</b> gives both directions similar step sizes, so it heads straight for the floor. <b>Adam</b> does both. Push the
          learning-rate multiplier up and SGD is the first to blow up; push β towards 0.99 and momentum swings wildly. Tap a name to hide it.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot x={XR} y={YR} width={narrow ? 360 : 560} height={narrow ? 200 : 260} maxWidth={680} minHeight={190} margin={{ left: 34, bottom: 30, right: 10, top: 10 }} ariaLabel={`Contour map of a curved valley with four optimiser paths after ${step} steps`}>
          <Contours />
          <Axes xTicks={narrow ? 4 : 7} yTicks={3} />
          {paths
            .filter((p) => !hidden.includes(p.key))
            .map((p) => (
              <Path key={p.key} points={p.pts.slice(0, step + 1)} color={p.color} width={p.key === 'sgd' ? 1.6 : 2.3} />
            ))}
          <Clipped>
            {paths
              .filter((p) => !hidden.includes(p.key))
              .map((p) => {
                const at = p.pts[step]
                return inMap(at) ? <Dots key={p.key} points={[{ x: at[0], y: at[1], r: 6.5, color: p.color }]} /> : null
              })}
          </Clipped>
          <Dots points={[{ x: X_MIN, y: C * X_MIN * X_MIN, r: 7, color: 'var(--viz-ink)', shape: 'cross' }]} />
          <Label x={X_MIN} y={C * X_MIN * X_MIN} dy={22} anchor="middle" color="var(--viz-ink)" size={12}>
            minimum
          </Label>
          <DraggablePoint
            x={start[0]}
            y={start[1]}
            r={7}
            color="var(--viz-ink)"
            label="start"
            constrain={(x, y) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]}
            onChange={(x, y) => setStart([x, y])}
          />
        </Plot>
      </div>
      <div role="table" aria-label="Optimisers, their learning rates and current loss" style={{ width: '100%', display: 'grid', gap: '0.25rem', fontSize: 'var(--step--1)' }}>
        <div role="row" style={{ display: 'grid', gridTemplateColumns: 'minmax(7rem, 1.4fr) repeat(2, minmax(4rem, 1fr))', gap: '0.5rem', color: 'var(--ink-3)', fontWeight: 600 }}>
          <span role="columnheader">optimiser (tap to hide)</span>
          <span role="columnheader" style={{ textAlign: 'right' }}>learning rate</span>
          <span role="columnheader" style={{ textAlign: 'right' }}>loss at step {step}</span>
        </div>
        {paths.map((p) => {
          const at = p.pts[step]
          const l = loss(at[0], at[1])
          const off = hidden.includes(p.key)
          return (
            <div key={p.key} role="row" style={{ display: 'grid', gridTemplateColumns: 'minmax(7rem, 1.4fr) repeat(2, minmax(4rem, 1fr))', gap: '0.5rem', alignItems: 'center', opacity: off ? 0.45 : 1 }}>
              <span role="cell">
                <button
                  type="button"
                  onClick={() => toggle(p.key)}
                  aria-pressed={!off}
                  style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center', background: 'none', border: 'none', padding: '0.15rem 0', font: 'inherit', fontWeight: 650, color: 'var(--ink)', cursor: 'pointer' }}
                >
                  <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 3, background: p.color }} />
                  {p.name}
                </button>
              </span>
              <span role="cell" className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{+p.lr.toFixed(3)}</span>
              <span role="cell" className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{inMap(at) || l < 50 ? l.toFixed(4) : 'diverged'}</span>
            </div>
          )
        })}
      </div>
      <Controls>
        <Button primary onClick={() => { if (step >= STEPS) setStep(0); setPlaying((p) => !p) }}>{playing ? 'Pause' : step >= STEPS ? 'Replay' : 'Play'}</Button>
        <Slider label="step" value={step} min={0} max={STEPS} step={1} onChange={(v) => { setPlaying(false); setStep(v) }} />
      </Controls>
      <Controls>
        <Slider label="learning-rate multiplier (all four)" value={si} min={0} max={SCALES.length - 1} step={1} onChange={setSi} format={(v) => `× ${SCALES[v]}`} />
        <Slider label="β (momentum, and Adam's β₁)" value={beta} min={0.5} max={0.99} step={0.01} onChange={setBeta} format={(v) => v.toFixed(2)} />
      </Controls>
    </Figure>
  )
}
