import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, Label, Rect, DraggablePoint, usePlot, useNarrow, mulberry32, M } from '../../../../../kit'

/*
  "The right feature makes the problem easy."
  Three datasets that no straight cut can separate in their raw features:
    band      1-D: one class in the middle of a line, the other on both sides  -> add x²
    ring      2-D: one class inside a circle, the other around it            -> add x₁² + x₂²
    quadrants 2-D: XOR pattern, class depends on whether x₁ and x₂ share a sign -> add x₁·x₂
  With the feature off, the learner drags a threshold (1-D) or a line (2-D) and can never get
  every point right. With it on, the points are lifted to a height equal to the new feature and a
  single horizontal threshold separates them; the original space shows what that threshold means
  there (two cuts, a circle, a hyperbola).
*/

type DS = 'band' | 'ring' | 'xor'
interface Pt {
  x: number
  y: number
  /** 0 = blue circle, 1 = orange square */
  c: 0 | 1
}

const R = 3.2
const COL = ['var(--viz-1)', 'var(--viz-2)']
const SHAPE = ['circle', 'square'] as const
const regionFill = (c: number) => `color-mix(in srgb, ${COL[c]} 13%, var(--surface))`

const BAND: Pt[] = [
  ...[-1.4, -1.0, -0.6, -0.2, 0.2, 0.6, 1.0, 1.4].map((x): Pt => ({ x, y: 0, c: 0 })),
  ...[-2.9, -2.5, -2.1, -1.8, 1.8, 2.1, 2.5, 2.9].map((x): Pt => ({ x, y: 0, c: 1 })),
]

function makeRing(): Pt[] {
  const rnd = mulberry32(7)
  const pts: Pt[] = []
  for (let i = 0; i < 24; i++) {
    const r = 0.3 + 1.2 * Math.sqrt(rnd())
    const t = 2 * Math.PI * rnd()
    pts.push({ x: r * Math.cos(t), y: r * Math.sin(t), c: 0 })
  }
  for (let i = 0; i < 32; i++) {
    const r = 2.1 + 0.8 * rnd()
    const t = 2 * Math.PI * rnd()
    pts.push({ x: r * Math.cos(t), y: r * Math.sin(t), c: 1 })
  }
  return pts
}

function makeXor(): Pt[] {
  const rnd = mulberry32(21)
  const pts: Pt[] = []
  for (let i = 0; i < 56; i++) {
    const sx = i % 2 === 0 ? 1 : -1
    const sy = i % 4 < 2 ? 1 : -1
    const x = sx * (0.35 + 2.55 * rnd())
    const y = sy * (0.35 + 2.55 * rnd())
    pts.push({ x, y, c: x * y > 0 ? 0 : 1 })
  }
  return pts
}

/** the engineered feature for each dataset */
const feat: Record<DS, (p: { x: number; y: number }) => number> = {
  band: (p) => p.x * p.x,
  ring: (p) => p.x * p.x + p.y * p.y,
  xor: (p) => p.x * p.y,
}
const FEAT_TEX: Record<DS, string> = { band: 'x^2', ring: 'x_1^2 + x_2^2', xor: 'x_1 x_2' }
const FEAT_TXT: Record<DS, string> = { band: 'x²', ring: 'x₁² + x₂²', xor: 'x₁·x₂' }
const LIFT_Y: Record<DS, [number, number]> = { band: [-0.6, 9.6], ring: [-0.6, 9.6], xor: [-9.6, 9.6] }

/** Mistakes of a rule "side > 0 → class s, else 1 − s", choosing s to make the fewest mistakes. */
function score(side: boolean[], pts: Pt[]) {
  let e0 = 0
  pts.forEach((p, i) => {
    if ((side[i] ? 1 : 0) !== p.c) e0++
  })
  const flip = e0 > pts.length - e0
  return { errors: flip ? pts.length - e0 : e0, upper: (flip ? 0 : 1) as 0 | 1 }
}

/** Fewest mistakes any single threshold on the values v can make (either orientation). */
function bestCut(v: number[], pts: Pt[]) {
  const order = v.map((val, i) => [val, pts[i].c] as const).sort((a, b) => a[0] - b[0])
  const n1 = pts.filter((p) => p.c === 1).length
  let best = Math.min(n1, pts.length - n1)
  let left0 = 0
  let left1 = 0
  for (const [, c] of order) {
    if (c === 0) left0++
    else left1++
    // left → class 0, right → class 1:  mistakes = left1 + (n0 - left0)
    const a = left1 + (pts.length - n1 - left0)
    best = Math.min(best, a, pts.length - a)
  }
  return best
}

/** Fewest mistakes of any straight line in 2-D (brute force over directions). */
function bestLine(pts: Pt[]) {
  let best = pts.length
  for (let d = 0; d < 180; d++) {
    const t = (d * Math.PI) / 180
    const v = pts.map((p) => p.x * Math.cos(t) + p.y * Math.sin(t))
    best = Math.min(best, bestCut(v, pts))
  }
  return best
}

type P2 = [number, number]
const BOX: P2[] = [
  [-R, -R],
  [R, -R],
  [R, R],
  [-R, R],
]

/** The part of a polygon where f >= 0 (one step of Sutherland-Hodgman clipping). */
function clipHalf(poly: P2[], f: (p: P2) => number): P2[] {
  const out: P2[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const fa = f(a)
    const fb = f(b)
    if (fa >= 0) out.push(a)
    if (fa >= 0 !== fb >= 0) {
      const t = fa / (fa - fb)
      out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])])
    }
  }
  return out
}

/**
 * Corner regions cut off by the hyperbola x₁x₂ = c inside the box: where x₁x₂ > c when c > 0
 * (quadrants 1 and 3), or where x₁x₂ < c when c < 0 (quadrants 2 and 4).
 */
function hyperbolaBlobs(c: number): P2[][] {
  const a = Math.abs(c)
  if (a >= R * R) return []
  const branch: P2[] = []
  const x0 = a / R
  for (let i = 0; i <= 80; i++) {
    const x = x0 + ((R - x0) * i) / 80
    branch.push([x, a / x])
  }
  const q1: P2[] = [...branch, [R, R]]
  if (c >= 0) return [q1, q1.map(([x, y]): P2 => [-x, -y])]
  return [q1.map(([x, y]): P2 => [x, -y]), q1.map(([x, y]): P2 => [-x, y])]
}

/** A filled polygon in data coordinates, clipped to the plot area. */
const Poly = ({ pts, c }: { pts: P2[]; c: number }) => (pts.length > 2 ? <Path points={pts} closed color="none" fill={regionFill(c)} /> : null)

/** Red rings around misclassified points. */
function Misses({ pts, wrong, r = 11 }: { pts: { x: number; y: number }[]; wrong: boolean[]; r?: number }) {
  const { xs, ys } = usePlot()
  return (
    <g aria-hidden="true">
      {pts.map((p, i) =>
        wrong[i] ? <circle key={i} cx={xs(p.x)} cy={ys(p.y)} r={r} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2.2 }} /> : null,
      )}
    </g>
  )
}

const dots = (pts: { x: number; y: number; c: 0 | 1 }[], r = 5.5) => pts.map((p) => ({ x: p.x, y: p.y, color: COL[p.c], shape: SHAPE[p.c], r }))

const legend: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1rem', fontSize: '0.875rem', color: 'var(--ink-2)', justifyContent: 'center' }
const sw = (c: number, square: boolean): CSSProperties => ({
  display: 'inline-block',
  width: 11,
  height: 11,
  borderRadius: square ? 2 : 6,
  background: COL[c],
  marginRight: 6,
  verticalAlign: '-1px',
})
const panelTitle: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: 2 }

export default function FeatureLift() {
  const [ds, setDs] = useState<DS>('band')
  const [lift, setLift] = useState(false)
  const [t1, setT1] = useState(1.6) // raw 1-D threshold
  const [line, setLine] = useState<Record<'ring' | 'xor', [[number, number], [number, number]]>>({
    ring: [
      [-2.6, -1.5],
      [2.6, 0.9],
    ],
    xor: [
      [-2.6, -1.5],
      [2.6, 0.9],
    ],
  })
  const [thr, setThr] = useState<Record<DS, number>>({ band: 6, ring: 6, xor: 2.5 })
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const data = useMemo(() => ({ band: BAND, ring: makeRing(), xor: makeXor() }), [])
  const pts = data[ds]
  const f = feat[ds]
  const fv = pts.map(f)
  const best = useMemo(
    () => ({
      band: bestCut(BAND.map((p) => p.x), BAND),
      ring: bestLine(data.ring),
      xor: bestLine(data.xor),
    }),
    [data],
  )

  // ---- current rule and its mistakes
  const c = thr[ds]
  let side: boolean[]
  let lineFn: ((p: P2) => number) | null = null
  if (lift) side = fv.map((v) => v > c)
  else if (ds === 'band') side = pts.map((p) => p.x > t1)
  else {
    const [[px, py], [qx, qy]] = line[ds]
    const fn = ([x, y]: P2) => (qx - px) * (y - py) - (qy - py) * (x - px)
    lineFn = fn
    side = pts.map((p) => fn([p.x, p.y]) > 0)
  }
  const { errors, upper } = score(side, pts)
  const wrong = pts.map((p, i) => ((side[i] ? upper : 1 - upper) as number) !== p.c)
  const acc = Math.round((100 * (pts.length - errors)) / pts.length)

  const setLinePt = (k: 0 | 1, x: number, y: number) => {
    if (ds === 'band') return
    setLine((L) => {
      const cur = L[ds]
      const nxt: [[number, number], [number, number]] = k === 0 ? [[x, y], cur[1]] : [cur[0], [x, y]]
      if (Math.hypot(nxt[0][0] - nxt[1][0], nxt[0][1] - nxt[1][1]) < 0.4) return L
      return { ...L, [ds]: nxt }
    })
  }
  const snap = (v: number) => Math.round(v * 10) / 10
  const [ly0, ly1] = LIFT_Y[ds]

  // ---- panels
  const liftedPanel = (
    <div style={{ width: '100%' }}>
      <div style={panelTitle}>{ds === 'band' ? 'Lifted: each point drawn at height x²' : `Side view: each point lifted to height ${FEAT_TXT[ds]}`}</div>
      <Plot
        x={[-R, R]}
        y={[ly0, ly1]}
        width={ds === 'band' ? 480 : 340}
        height={ds === 'band' ? 300 : 340}
        minHeight={ds === 'band' ? 250 : undefined}
        maxWidth={ds === 'band' ? 600 : 420}
        ariaLabel={`Points plotted against the new feature ${FEAT_TXT[ds]}, with a horizontal threshold at ${c.toFixed(1)}`}
      >
        <Rect x0={-R} x1={R} y0={c} y1={ly1} fill={regionFill(upper)} />
        <Rect x0={-R} x1={R} y0={ly0} y1={c} fill={regionFill(1 - upper)} />
        <Grid xTicks={6} yTicks={6} />
        <Axes xLabel={ds === 'band' ? 'x' : 'x₁'} yLabel={FEAT_TXT[ds]} xTicks={6} yTicks={6} />
        {ds === 'band' && <FnPath f={(x) => x * x} color="var(--viz-muted)" width={1.5} dash="5 4" />}
        <Path
          points={[
            [-R, c],
            [R, c],
          ]}
          color="var(--viz-ink)"
          width={2.5}
        />
        <Misses pts={pts.map((p, i) => ({ x: p.x, y: fv[i] }))} wrong={wrong} />
        <Dots points={dots(pts.map((p, i) => ({ x: p.x, y: fv[i], c: p.c })))} />
        <DraggablePoint x={-R + 0.3} y={c} lockX color="var(--viz-ink)" r={8} label={`threshold ${c.toFixed(1)}`} onChange={(_x, y) => setThr((T) => ({ ...T, [ds]: snap(y) }))} />
      </Plot>
    </div>
  )

  const originalPanel = (
    <div style={{ width: '100%' }}>
      <div style={panelTitle}>{lift ? 'What that threshold means in the original features' : 'Original features: drag the handles'}</div>
      <Plot x={[-R, R]} y={[-R, R]} width={340} height={340} maxWidth={420} ariaLabel={`Scatter of ${pts.length} points in two classes with the current decision regions`}>
        {lift && ds === 'ring' && (
          <>
            <Rect x0={-R} x1={R} y0={-R} y1={R} fill={regionFill(upper)} />
            {c > 0 && <Poly pts={Array.from({ length: 96 }, (_, i): P2 => [Math.sqrt(c) * Math.cos((i * Math.PI) / 48), Math.sqrt(c) * Math.sin((i * Math.PI) / 48)])} c={1 - upper} />}
          </>
        )}
        {lift && ds === 'xor' && (
          <>
            <Rect x0={-R} x1={R} y0={-R} y1={R} fill={regionFill(c >= 0 ? 1 - upper : upper)} />
            {hyperbolaBlobs(c).map((b, i) => (
              <Poly key={i} pts={b} c={c >= 0 ? upper : 1 - upper} />
            ))}
          </>
        )}
        {!lift && lineFn && (
          <>
            <Poly pts={clipHalf(BOX, lineFn)} c={upper} />
            <Poly pts={clipHalf(BOX, (p) => -lineFn(p))} c={1 - upper} />
          </>
        )}
        <Grid xTicks={6} yTicks={6} />
        <Axes xLabel="x₁" yLabel="x₂" xTicks={6} yTicks={6} />
        {lift && ds === 'ring' && c > 0 && (
          <Path points={Array.from({ length: 97 }, (_, i): [number, number] => [Math.sqrt(c) * Math.cos((i * Math.PI) / 48), Math.sqrt(c) * Math.sin((i * Math.PI) / 48)])} color="var(--viz-ink)" width={2.5} />
        )}
        {lift && ds === 'xor' && Math.abs(c) >= 0.05 && (
          <>
            <FnPath f={(x) => c / x} domain={[-R, -0.02]} color="var(--viz-ink)" width={2.5} samples={300} />
            <FnPath f={(x) => c / x} domain={[0.02, R]} color="var(--viz-ink)" width={2.5} samples={300} />
          </>
        )}
        {lift && ds === 'xor' && Math.abs(c) < 0.05 && (
          <>
            <Path points={[[-R, 0], [R, 0]]} color="var(--viz-ink)" width={2.5} />
            <Path points={[[0, -R], [0, R]]} color="var(--viz-ink)" width={2.5} />
          </>
        )}
        {!lift && ds !== 'band' && (
          <Path
            points={(() => {
              const [[px, py], [qx, qy]] = line[ds]
              return [
                [px - (qx - px) * 50, py - (qy - py) * 50],
                [px + (qx - px) * 50, py + (qy - py) * 50],
              ] as [number, number][]
            })()}
            color="var(--viz-ink)"
            width={2.5}
          />
        )}
        <Misses pts={pts} wrong={wrong} />
        <Dots points={dots(pts)} />
        {!lift && ds !== 'band' && (
          <>
            <DraggablePoint x={line[ds][0][0]} y={line[ds][0][1]} color="var(--viz-ink)" r={8} label="drag" onChange={(x, y) => setLinePt(0, snap(x), snap(y))} />
            <DraggablePoint x={line[ds][1][0]} y={line[ds][1][1]} color="var(--viz-ink)" r={8} onChange={(x, y) => setLinePt(1, snap(x), snap(y))} />
          </>
        )}
      </Plot>
    </div>
  )

  const cuts = c > 0 ? Math.sqrt(c) : null
  const bandStrip = (
    <div style={{ width: '100%' }}>
      <div style={panelTitle}>{lift ? 'Back on the original line: one threshold on x² = two cuts on x' : 'The original feature x: drag the threshold'}</div>
      <Plot x={[-R, R]} y={[-1, 1]} width={480} height={96} maxWidth={600} minHeight={84} margin={{ top: 8, bottom: 30 }} ariaLabel="Points on a number line coloured by class, with the current cut">
        {lift ? (
          <>
            <Rect x0={-R} x1={R} y0={-1} y1={1} fill={regionFill(upper)} />
            {cuts != null && <Rect x0={-cuts} x1={cuts} y0={-1} y1={1} fill={regionFill(1 - upper)} />}
          </>
        ) : (
          <>
            <Rect x0={t1} x1={R} y0={-1} y1={1} fill={regionFill(upper)} />
            <Rect x0={-R} x1={t1} y0={-1} y1={1} fill={regionFill(1 - upper)} />
          </>
        )}
        <Axes xLabel="x" xTicks={6} hideYTicks />
        {lift && cuts != null && cuts < R && (
          <>
            <Path points={[[-cuts, -1], [-cuts, 1]]} color="var(--viz-ink)" width={2} dash="5 3" />
            <Path points={[[cuts, -1], [cuts, 1]]} color="var(--viz-ink)" width={2} dash="5 3" />
          </>
        )}
        {!lift && <Path points={[[t1, -1], [t1, 1]]} color="var(--viz-ink)" width={2.5} />}
        <Misses pts={pts} wrong={wrong} r={narrow ? 7.5 : 11} />
        <Dots points={dots(pts, narrow ? 4.2 : 5.5)} />
        {!lift && <DraggablePoint x={t1} y={0.62} lockY color="var(--viz-ink)" r={8} onChange={(x) => setT1(Math.round(x * 20) / 20)} label="cut" />}
        {lift && cuts != null && cuts < R && (
          <Label x={cuts} y={0.55} dx={5} color="var(--viz-ink)">{`±${cuts.toFixed(2)}`}</Label>
        )}
      </Plot>
    </div>
  )

  const bestRaw = best[ds]

  return (
    <Figure
      title="Add one feature, and a straight cut is enough"
      caption={
        <>
          Start with the feature switched off and try to get every point right by dragging the cut (or the two handles of the line): it cannot be done.
          Red rings mark mistakes, and each side automatically predicts whichever class makes fewer mistakes. Now switch on the new feature{' '}
          <M>{FEAT_TEX[ds]}</M> and drag the horizontal threshold until the mistakes reach 0. A <b>straight</b> cut on the new feature becomes two cuts,
          a circle or a pair of curves back in the original features.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Dataset"
          value={ds}
          onChange={(v) => setDs(v)}
          options={[
            { value: 'band', label: '1-D band' },
            { value: 'ring', label: 'ring' },
            { value: 'xor', label: 'quadrants' },
          ]}
        />
        <Toggle label={<>add the feature <M>{FEAT_TEX[ds]}</M></>} checked={lift} onChange={setLift} />
      </Controls>
      <div style={legend}>
        <span>
          <span style={sw(0, false)} />
          class A (circles)
        </span>
        <span>
          <span style={sw(1, true)} />
          class B (squares)
        </span>
        <span>
          <span style={{ ...sw(0, false), background: 'none', border: '2px solid var(--viz-neg)', width: 12, height: 12 }} />
          mistake
        </span>
      </div>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.6rem', justifyItems: 'center', gridTemplateColumns: ds !== 'band' && lift && !narrow ? '1fr 1fr' : '1fr' }}>
        {ds === 'band' ? (
          <>
            {lift && liftedPanel}
            {bandStrip}
          </>
        ) : (
          <>
            {originalPanel}
            {lift && liftedPanel}
          </>
        )}
      </div>
      <Readout
        items={[
          ['mistakes', `${errors} of ${pts.length}`],
          ['accuracy', `${acc}%`],
          [ds === 'band' ? 'best single cut on x alone' : 'best straight line on x₁, x₂', `${bestRaw} mistakes`],
        ]}
      />
    </Figure>
  )
}
