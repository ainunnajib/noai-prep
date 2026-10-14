import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Button, Plot, Grid, Axes, FnPath, Path, Dots, Label, Rect, VLine, DraggablePoint, useAnimationFrame, useNarrow } from '../../../../../kit'
import { TangentSeg, fx, panelTitle } from './plotHelpers'

/*
  f(x) on top with a tangent at a draggable point; f'(x) underneath on the same x-axis.
  Background tint: green where f is rising (f' > 0), red where it is falling (f' < 0).
  Dashed verticals mark where f' = 0: the peaks and valleys of f. The learner can hide f'
  and trace it by dragging or by pressing Sweep (predict first, then check).
*/

interface Preset {
  key: string
  label: string
  v: string // variable name
  f: (x: number) => number
  d: (x: number) => number
  x: [number, number]
  y: [number, number]
  dy: [number, number]
  /** points where f' = 0, with what they are */
  crit: { x: number; kind: 'valley' | 'peak' | 'flat' }[]
  start: number
}

const R2 = Math.SQRT2
const PRESETS: Preset[] = [
  { key: 'sq', label: 'x²', v: 'x', f: (x) => x * x, d: (x) => 2 * x, x: [-3, 3], y: [-1, 9.5], dy: [-6.5, 6.5], crit: [{ x: 0, kind: 'valley' }], start: -2 },
  {
    key: 'cubic',
    label: 'x³ − 3x',
    v: 'x',
    f: (x) => x ** 3 - 3 * x,
    d: (x) => 3 * x * x - 3,
    x: [-2.3, 2.3],
    y: [-5.5, 5.5],
    dy: [-4.5, 13],
    crit: [
      { x: -1, kind: 'peak' },
      { x: 1, kind: 'valley' },
    ],
    start: -1.8,
  },
  {
    key: 'sin',
    label: 'sin x',
    v: 'x',
    f: Math.sin,
    d: Math.cos,
    x: [-6.5, 6.5],
    y: [-1.5, 1.5],
    dy: [-1.5, 1.5],
    crit: [
      { x: -1.5 * Math.PI, kind: 'peak' },
      { x: -0.5 * Math.PI, kind: 'valley' },
      { x: 0.5 * Math.PI, kind: 'peak' },
      { x: 1.5 * Math.PI, kind: 'valley' },
    ],
    start: -5,
  },
  {
    key: 'loss',
    label: 'a loss curve',
    v: 'w',
    f: (w) => 0.05 * w ** 4 - 0.5 * w * w + 0.4 * w + 2.6,
    d: (w) => 0.2 * w ** 3 - w + 0.4,
    x: [-3.6, 3.6],
    y: [0, 6.2],
    dy: [-5.6, 6.4],
    crit: [
      { x: -1 - R2, kind: 'valley' },
      { x: -1 + R2, kind: 'peak' },
      { x: 2, kind: 'valley' },
    ],
    start: 3.2,
  },
]

const BINS = 160

export default function DerivativeTracer() {
  const [key, setKey] = useState('cubic')
  const P = PRESETS.find((p) => p.key === key)!
  const [x, setX] = useState(P.start)
  const [showD, setShowD] = useState(true)
  const [visited, setVisited] = useState<boolean[]>(() => Array(BINS + 1).fill(false))
  const [sweeping, setSweeping] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)

  const span = P.x[1] - P.x[0]
  const bin = (v: number) => Math.round(((v - P.x[0]) / span) * BINS)
  /** mark every bin between two x-values as traced (so fast drags and sweeps leave no gaps) */
  const visit = (from: number, to: number = from) =>
    setVisited((old) => {
      const i0 = Math.max(0, Math.min(bin(from), bin(to)))
      const i1 = Math.min(BINS, Math.max(bin(from), bin(to)))
      let changed = false
      const n = old.slice()
      for (let i = i0; i <= i1; i++)
        if (!n[i]) {
          n[i] = true
          changed = true
        }
      return changed ? n : old
    })
  const moveTo = (v: number) => {
    const c = Math.max(P.x[0], Math.min(P.x[1], v))
    visit(x, c)
    setX(c)
  }

  const choose = (k: string) => {
    const np = PRESETS.find((p) => p.key === k)!
    setKey(k)
    setX(np.start)
    setVisited(Array(BINS + 1).fill(false))
    setSweeping(false)
  }

  useAnimationFrame((dt) => {
    const next = x + (span / 5) * dt
    if (next >= P.x[1]) {
      moveTo(P.x[1])
      setSweeping(false)
    } else moveTo(next)
  }, sweeping)

  const startSweep = () => {
    setX(P.x[0])
    visit(P.x[0])
    setSweeping(true)
  }

  // intervals where f' > 0 / < 0 (between the critical points)
  const bands = useMemo(() => {
    const cuts = [P.x[0], ...P.crit.map((c) => c.x).filter((c) => c > P.x[0] && c < P.x[1]), P.x[1]]
    return cuts.slice(0, -1).map((a, i) => ({ a, b: cuts[i + 1], up: P.d((a + cuts[i + 1]) / 2) > 0 }))
  }, [P])

  const fxv = P.f(x)
  const slope = P.d(x)
  const flat = Math.abs(slope) < 0.06
  const tone = flat ? 'var(--viz-6)' : slope > 0 ? 'var(--viz-pos)' : 'var(--viz-neg)'
  const verdict = flat ? 'flat (slope ≈ 0)' : slope > 0 ? 'rising (slope > 0)' : 'falling (slope < 0)'

  const tracedSegments = useMemo(() => {
    const segs: [number, number][][] = []
    let cur: [number, number][] = []
    for (let i = 0; i <= BINS; i++) {
      if (visited[i]) {
        const xv = P.x[0] + (span * i) / BINS
        cur.push([xv, P.d(xv)])
      } else if (cur.length) {
        segs.push(cur)
        cur = []
      }
    }
    if (cur.length) segs.push(cur)
    return segs
  }, [visited, P, span])

  const W = narrow ? 360 : 560
  const margin = { left: 44, right: 16 }
  const band = (up: boolean) => `color-mix(in srgb, ${up ? 'var(--viz-pos)' : 'var(--viz-neg)'} 9%, transparent)`
  const v = P.v

  return (
    <Figure
      title="A slope for every point: the derivative as its own graph"
      caption={
        <>
          Drag the point along the top curve (or press <b>Sweep</b>) and watch the tangent tilt. Its slope is plotted underneath at the same {v}. Green
          zones: the curve rises and <i>f</i>′ is above 0. Red zones: it falls and <i>f</i>′ is below 0. Every peak and valley sits exactly above a
          place where <i>f</i>′ crosses 0. Challenge: switch off “Show f′”, guess its shape, then sweep to check.
        </>
      }
    >
      <Controls>
        <Segmented label="Choose a function" value={key} onChange={choose} options={PRESETS.map((p) => ({ value: p.key, label: p.label }))} />
      </Controls>
      <div ref={ref} style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.25rem' }}>
        <div style={{ width: '100%' }}>
          <div style={panelTitle}>{key === 'loss' ? 'the loss L(w)' : `f(x) = ${P.label}`}</div>
          <Plot x={P.x} y={P.y} width={W} height={narrow ? 270 : 250} minHeight={230} maxWidth={700} margin={margin} ariaLabel={`Graph of ${P.label} with a tangent at ${v} = ${fx(x, 2)}`}>
            {bands.map((b, i) => (
              <Rect key={i} x0={b.a} x1={b.b} y0={P.y[0]} y1={P.y[1]} fill={band(b.up)} />
            ))}
            <Grid xTicks={8} yTicks={5} />
            <Axes origin xTicks={narrow ? 6 : 10} yTicks={5} xLabel={v} />
            {P.crit.map((c) => (
              <VLine key={c.x} x={c.x} color="var(--viz-6)" />
            ))}
            {P.crit.map((c) => (
              <Label key={`l${c.x}`} x={c.x} y={P.y[1]} dy={14} anchor="middle" color="var(--viz-6)" size={12} weight={700}>
                {c.kind}
              </Label>
            ))}
            <FnPath f={P.f} color="var(--viz-1)" width={3} />
            <TangentSeg x={x} y={fxv} slope={slope} len={narrow ? 52 : 70} color={tone} width={3} />
            <VLine x={x} color="var(--viz-muted)" dash="2 4" width={1.2} />
            <DraggablePoint x={x} y={fxv} color="var(--viz-2)" label="drag me" constrain={(nx) => [nx, P.f(nx)]} onChange={(nx) => moveTo(nx)} />
          </Plot>
        </div>
        <div style={{ width: '100%' }}>
          <div style={panelTitle}>{key === 'loss' ? 'its slope L′(w)' : 'its slope f′(x)'}</div>
          <Plot x={P.x} y={P.dy} width={W} height={narrow ? 210 : 190} minHeight={180} maxWidth={700} margin={margin} ariaLabel={`Graph of the derivative; at ${v} = ${fx(x, 2)} the slope is ${fx(slope, 2)}`}>
            {bands.map((b, i) => (
              <Rect key={i} x0={b.a} x1={b.b} y0={P.dy[0]} y1={P.dy[1]} fill={band(b.up)} />
            ))}
            <Grid xTicks={8} yTicks={4} />
            <Axes origin xTicks={narrow ? 6 : 10} yTicks={4} xLabel={v} />
            {P.crit.map((c) => (
              <VLine key={c.x} x={c.x} color="var(--viz-6)" />
            ))}
            {showD ? (
              <FnPath f={P.d} color="var(--viz-5)" width={3} />
            ) : (
              tracedSegments.map((s, i) => <Path key={i} points={s} color="var(--viz-5)" width={3} />)
            )}
            <Path points={[[x, 0], [x, slope]]} color={tone} width={4} />
            <VLine x={x} color="var(--viz-muted)" dash="2 4" width={1.2} />
            <Dots points={[...P.crit.map((c) => ({ x: c.x, y: 0, r: 4.5, color: 'var(--viz-6)' })), { x, y: slope, r: 6.5, color: tone }]} />
          </Plot>
        </div>
      </div>
      <Controls>
        <Button primary onClick={startSweep} disabled={sweeping}>
          Sweep
        </Button>
        <Toggle label="Show f′ (switch off to predict it)" checked={showD} onChange={setShowD} />
      </Controls>
      <Readout
        items={[
          [v, fx(x, 2)],
          [key === 'loss' ? 'L(w)' : 'f(x)', fx(fxv, 2)],
          [key === 'loss' ? 'slope L′(w)' : 'slope f′(x)', fx(slope, 2)],
          ['so the curve is', <span key="v" style={{ color: tone }}>{verdict}</span>],
        ]}
      />
    </Figure>
  )
}
