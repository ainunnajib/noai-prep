import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Plot, Grid, Axes, FnPath, Path, Rect, DraggablePoint, M, useNarrow } from '../../../../../kit'

/*
  The chord test for convexity. Two draggable points sit on the curve; the straight line
  (chord) between them is green where it is on or above the curve and red where it dips
  below. A function is convex when NO choice of the two points ever makes red.
  The optional f'' layer shades where the curve bends downwards (f'' < 0).
*/

type Key = 'sq' | 'abs' | 'exp' | 'quartic' | 'bumpy'
interface Fn {
  label: string
  tex: string
  f: (x: number) => number
  /** second derivative (null where it does not exist) */
  f2: (x: number) => number | null
  f2tex: string
  x: [number, number]
  y: [number, number]
  start: [number, number]
  convex: boolean
}
const bump = (x: number, c: number, s: number) => Math.exp(-((x - c) ** 2) / (2 * s * s))
const bumpy = (x: number) => 0.15 * x * x + 1.9 - 1.3 * bump(x, -2.5, 0.55) - 1.0 * bump(x, -0.1, 0.55) - 2.4 * bump(x, 2.3, 0.6)

const FNS: Record<Key, Fn> = {
  sq: { label: 'x²', tex: 'f(x) = x^2', f: (x) => x * x, f2: () => 2, f2tex: "f''(x) = 2 > 0", x: [-2, 2], y: [-0.6, 4.4], start: [-1.6, 1.2], convex: true },
  abs: { label: '|x|', tex: 'f(x) = |x|', f: Math.abs, f2: (x) => (Math.abs(x) < 1e-9 ? null : 0), f2tex: "f''(x) = 0 \\text{ (no } f'' \\text{ at the kink)}", x: [-2, 2], y: [-0.4, 2.4], start: [-1.5, 1], convex: true },
  exp: { label: 'eˣ', tex: 'f(x) = e^x', f: Math.exp, f2: Math.exp, f2tex: "f''(x) = e^x > 0", x: [-2.5, 1.6], y: [-0.4, 5], start: [-2, 1.3], convex: true },
  quartic: { label: 'x⁴ − x²', tex: 'f(x) = x^4 - x^2', f: (x) => x ** 4 - x * x, f2: (x) => 12 * x * x - 2, f2tex: "f''(x) = 12x^2 - 2", x: [-1.25, 1.25], y: [-0.35, 1], start: [-0.7, 0.7], convex: false },
  bumpy: {
    label: 'bumpy',
    tex: '\\text{a bumpy, neural-net-like loss}',
    f: bumpy,
    f2: (x) => (bumpy(x + 1e-3) - 2 * bumpy(x) + bumpy(x - 1e-3)) / 1e-6,
    f2tex: "f''(x) < 0 \\text{ on every hilltop}",
    x: [-4, 4],
    y: [0, 4.6],
    start: [-2.4, 2.2],
    convex: false,
  },
}

const verdictStyle = (bad: boolean): CSSProperties => ({
  width: '100%',
  padding: '0.45rem 0.7rem',
  borderRadius: 8,
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--ink)',
  background: `color-mix(in srgb, ${bad ? 'var(--viz-neg)' : 'var(--viz-pos)'} 14%, var(--surface))`,
  borderLeft: `4px solid ${bad ? 'var(--viz-neg)' : 'var(--viz-pos)'}`,
})

export default function ConvexChord() {
  const [key, setKey] = useState<Key>('quartic')
  const [pts, setPts] = useState<[number, number]>(FNS.quartic.start)
  const [showF2, setShowF2] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const F = FNS[key]
  const f = F.f
  const [a, b] = pts
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  const chord = (x: number) => (hi - lo < 1e-9 ? f(lo) : f(lo) + ((f(hi) - f(lo)) * (x - lo)) / (hi - lo))

  // walk along the chord and split it into runs that are above (ok) or below (bad) the curve
  const n = 160
  const tol = 1e-6 * (F.y[1] - F.y[0])
  type Run = { bad: boolean; xs: number[] }
  const runs: Run[] = []
  let worst = 0
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n
    const gap = chord(x) - f(x)
    worst = Math.min(worst, gap)
    const bad = gap < -tol
    const last = runs[runs.length - 1]
    if (!last || last.bad !== bad) {
      if (last) last.xs.push(x)
      runs.push({ bad, xs: [x] })
    } else last.xs.push(x)
  }
  const dips = worst < -tol

  // regions where the curve bends downwards
  const concave: [number, number][] = []
  if (showF2) {
    const m = 400
    let start: number | null = null
    for (let i = 0; i <= m; i++) {
      const x = F.x[0] + ((F.x[1] - F.x[0]) * i) / m
      const v = F.f2(x)
      const neg = v != null && v < -1e-6
      if (neg && start == null) start = x
      if (!neg && start != null) {
        concave.push([start, x])
        start = null
      }
    }
    if (start != null) concave.push([start, F.x[1]])
  }

  const choose = (k: Key) => {
    setKey(k)
    setPts(FNS[k].start)
  }
  const onCurve = (x: number): [number, number] => [x, f(x)]

  return (
    <Figure
      title="The chord test: can you make the line dip below the curve?"
      caption={
        <>
          Drag the two orange points along the curve. The straight line between them (the <b>chord</b>) turns red wherever it goes <i>below</i> the
          curve. A function is <b>convex</b> if no pair of points can ever make red. Try hard on x², |x| and eˣ (you can't), then find red on x⁴ − x²
          and the bumpy loss. Switch on the second-derivative test to see where the curve bends the wrong way.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
      <Plot x={F.x} y={F.y} width={narrow ? 360 : 480} height={narrow ? 300 : 300} maxWidth={620} ariaLabel={`Graph of ${F.label} with a chord between x = ${lo.toFixed(2)} and x = ${hi.toFixed(2)}. ${dips ? 'The chord dips below the curve.' : 'The chord stays above the curve.'}`}>
        <Grid xTicks={8} yTicks={6} />
        {concave.map(([x0, x1], i) => (
          <Rect key={i} x0={x0} x1={x1} y0={F.y[0]} y1={F.y[1]} fill="color-mix(in srgb, var(--viz-neg) 13%, transparent)" />
        ))}
        <Axes xTicks={narrow ? 5 : 8} yTicks={5} />
        <FnPath f={f} color="var(--viz-1)" width={3} />
        {runs.map((r, i) =>
          r.xs.length > 1 ? (
            <Path
              key={`fill${i}`}
              points={[...r.xs.map((x): [number, number] => [x, chord(x)]), ...r.xs.slice().reverse().map((x): [number, number] => [x, f(x)])]}
              closed
              fill={`color-mix(in srgb, ${r.bad ? 'var(--viz-neg)' : 'var(--viz-pos)'} 22%, transparent)`}
              color="none"
              width={0}
            />
          ) : null,
        )}
        {runs.map((r, i) =>
          r.xs.length > 1 ? (
            <Path key={`ch${i}`} points={r.xs.map((x): [number, number] => [x, chord(x)])} color={r.bad ? 'var(--viz-neg)' : 'var(--viz-pos)'} width={r.bad ? 4.5 : 3.5} />
          ) : null,
        )}
        <DraggablePoint x={a} y={f(a)} constrain={onCurve} onChange={(x) => setPts([x, b])} label="A" />
        <DraggablePoint x={b} y={f(b)} constrain={onCurve} onChange={(x) => setPts([a, x])} label="B" />
      </Plot>
      </div>
      <div style={verdictStyle(dips)} role="status">
        {dips ? '✗ For these two points the chord dips below the curve, so the function is not convex.' : '✓ For these two points the chord stays on or above the curve.'}
      </div>
      <Controls>
        <Segmented label="Function" value={key} onChange={choose} options={(Object.keys(FNS) as Key[]).map((k) => ({ value: k, label: FNS[k].label }))} />
        <Toggle label="Second-derivative test" checked={showF2} onChange={setShowF2} />
      </Controls>
      <Readout
        items={[
          ['function', <M key="f">{F.tex}</M>],
          ...(showF2
            ? ([
                ['test', <M key="t">{F.f2tex}</M>],
                ['convex?', F.convex ? 'yes: it never bends downwards' : 'no: red shading marks where it bends downwards'],
              ] as [string, ReactNode][])
            : []),
        ]}
      />
    </Figure>
  )
}
