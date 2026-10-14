import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Path, Dots, Label, Rect, mulberry32 } from '../../../../../kit'

/*
  One neuron with two weights learns y = 1·x1 − 1·x2, one training example per update (SGD),
  starting from w = (0, 0). Each update is −lr · δ · (x1, x2). With inputs in [0, 1] both
  components of x are positive, so every step points up-right or down-left (the shaded
  quadrants): the weights zig-zag towards (1, −1). With zero-centred inputs a step can point
  anywhere. Ellipses are contours of the average loss.
*/

type Mode = 'pos' | 'centred'
const STEPS = 40
const TARGET: [number, number] = [1, -1]

function makeData(): { pos: [number, number][]; centred: [number, number][] } {
  const rnd = mulberry32(5)
  const pos: [number, number][] = Array.from({ length: STEPS }, () => [rnd(), rnd()])
  const m0 = pos.reduce((a, p) => a + p[0], 0) / STEPS
  const m1 = pos.reduce((a, p) => a + p[1], 0) / STEPS
  return { pos, centred: pos.map(([a, b]) => [a - m0, b - m1]) }
}

function sgd(X: [number, number][], lr: number): [number, number][] {
  let w: [number, number] = [0, 0]
  const path: [number, number][] = [w]
  for (const [x1, x2] of X) {
    const y = TARGET[0] * x1 + TARGET[1] * x2
    const d = w[0] * x1 + w[1] * x2 - y
    w = [w[0] - lr * d * x1, w[1] - lr * d * x2]
    path.push(w)
  }
  return path
}

/** contour ellipses of the mean squared error (w − w*)ᵀ Σ (w − w*) */
function contours(X: [number, number][], levels: number[]): [number, number][][] {
  let a = 0
  let b = 0
  let c = 0
  for (const [x1, x2] of X) {
    a += x1 * x1
    b += x1 * x2
    c += x2 * x2
  }
  a /= X.length
  b /= X.length
  c /= X.length
  // eigen-decomposition of [[a, b], [b, c]]
  const tr = a + c
  const det = a * c - b * b
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det))
  const l1 = tr / 2 + disc
  const l2 = tr / 2 - disc
  const v1: [number, number] = Math.abs(b) > 1e-12 ? [l1 - c, b] : [1, 0]
  const n1 = Math.hypot(v1[0], v1[1])
  const u: [number, number] = [v1[0] / n1, v1[1] / n1]
  const v: [number, number] = [-u[1], u[0]]
  return levels.map((L) =>
    Array.from({ length: 73 }, (_, k) => {
      const t = (k / 72) * 2 * Math.PI
      const p = Math.sqrt(L / l1) * Math.cos(t)
      const q = Math.sqrt(L / l2) * Math.sin(t)
      return [TARGET[0] + p * u[0] + q * v[0], TARGET[1] + p * u[1] + q * v[1]] as [number, number]
    }),
  )
}

export default function SignLockedSteps() {
  const [mode, setMode] = useState<Mode>('pos')
  const [lr, setLr] = useState(2)
  const [n, setN] = useState(STEPS)
  const data = useMemo(makeData, [])
  const paths = useMemo(() => ({ pos: sgd(data.pos, lr), centred: sgd(data.centred, lr) }), [data, lr])
  const levels = [0.012, 0.04, 0.09, 0.16]
  const rings = useMemo(() => contours(mode === 'pos' ? data.pos : data.centred, levels), [data, mode])

  const active = paths[mode].slice(0, n + 1)
  const ghost = paths[mode === 'pos' ? 'centred' : 'pos'].slice(0, n + 1)
  const cur = active[active.length - 1]
  const dist = (p: [number, number]) => Math.hypot(p[0] - TARGET[0], p[1] - TARGET[1])
  /** first update after which the weights stay within 0.1 of the best */
  const settle = (path: [number, number][]) => {
    let k = path.length
    for (let i = path.length - 1; i >= 0 && dist(path[i]) < 0.1; i--) k = i
    return k < path.length ? `${k} updates` : dist(path[path.length - 1]) > 50 ? 'blew up' : `not within ${STEPS}`
  }
  const colour = mode === 'pos' ? 'var(--viz-2)' : 'var(--viz-1)'
  const ghostColour = mode === 'pos' ? 'var(--viz-1)' : 'var(--viz-2)'
  // count steps whose two components have the same sign (up-right or down-left)
  let diag = 0
  for (let i = 1; i < active.length; i++) {
    const dx = active[i][0] - active[i - 1][0]
    const dy = active[i][1] - active[i - 1][1]
    if (dx * dy >= 0) diag++
  }
  const inView = (p: [number, number]) => Math.abs(p[0]) < 1e3 && Math.abs(p[1]) < 1e3
  const inBox = (p: [number, number]) => p[0] >= -0.7 && p[0] <= 1.7 && p[1] >= -1.7 && p[1] <= 0.7
  const R = 0.32

  return (
    <Figure
      title="Why all-positive inputs make the weights zig-zag"
      caption={
        <>
          One neuron with two weights is trained one example at a time to reach the best weights <b>(1, −1)</b> (the star). Each update moves the weights by{' '}
          −learning rate × δ × (x₁, x₂). With inputs from 0 to 1, both parts of that move always have the same sign, so the weights can only step into the shaded
          quadrants: up-right or down-left. Switch to zero-centred inputs and compare, then try several learning rates. At small rates the two are
          similar; push the rate up and the zero-centred weights settle faster and faster, while the all-positive ones zig-zag, overshoot and finally blow
          up. Zero-centring lets you train with bigger steps.
        </>
      }
    >
      <Plot x={[-0.7, 1.7]} y={[-1.7, 0.7]} width={400} height={400} ariaLabel="Path of the two weights during training, from (0, 0) towards (1, −1)">
        <Grid xTicks={6} yTicks={6} />
        <Axes origin xTicks={5} yTicks={5} xLabel="w₁" yLabel="w₂" />
        {rings.map((r, i) => (
          <Path key={i} points={r} color="var(--viz-muted)" width={1.2} dash="3 4" />
        ))}
        {mode === 'pos' && inBox(cur) && (
          <>
            <Rect x0={cur[0]} x1={cur[0] + R} y0={cur[1]} y1={cur[1] + R} fill="color-mix(in srgb, var(--viz-2) 22%, transparent)" />
            <Rect x0={cur[0] - R} x1={cur[0]} y0={cur[1] - R} y1={cur[1]} fill="color-mix(in srgb, var(--viz-2) 22%, transparent)" />
          </>
        )}
        <Path points={ghost.filter(inView)} color={ghostColour} width={1.5} dash="4 4" opacity={0.45} />
        <Path points={active.filter(inView)} color={colour} width={2.4} />
        <Dots points={active.filter(inBox).map(([x, y]) => ({ x, y, r: 3 }))} color={colour} />
        <Dots points={[{ x: TARGET[0], y: TARGET[1], r: 8, shape: 'cross', color: 'var(--viz-ink)' }]} />
        <Label x={TARGET[0]} y={TARGET[1]} dx={10} dy={18}>
          best (1, −1)
        </Label>
        <Label x={0} y={0} dx={-6} dy={-10} anchor="end">
          start
        </Label>
      </Plot>
      <Controls>
        <Segmented
          label="Inputs"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'pos', label: 'All positive (0 to 1)' },
            { value: 'centred', label: 'Zero-centred' },
          ]}
        />
        <Slider label="learning rate" value={lr} min={0.5} max={3.4} step={0.1} onChange={setLr} format={(v) => v.toFixed(1)} />
        <Slider label="updates shown" value={n} min={1} max={STEPS} onChange={setN} />
      </Controls>
      <Readout
        items={[
          ['steps going up-right or down-left', `${diag} of ${active.length - 1}`],
          ['all positive: settles within 0.1 after', settle(paths.pos)],
          ['zero-centred: settles after', settle(paths.centred)],
        ]}
      />
    </Figure>
  )
}
