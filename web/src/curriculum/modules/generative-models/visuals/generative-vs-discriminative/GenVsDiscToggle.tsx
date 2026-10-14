import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Grid, Axes, Path, Dots, Label, usePlot, mulberry32, M, type DotDatum } from '../../../../../kit'
import { fitGauss, fitLogistic, logDensity, ellipse, sampleGauss, halfPlane, lineInRect, type P2, type Gauss2 } from './models2d'

/*
  One 2-D dataset, two kinds of model.
  Discriminative: logistic regression learns only P(B | x) (3 numbers), drawn as a boundary with its
  0.1 / 0.5 / 0.9 probability lines.
  Generative: one Gaussian "hill" per class (mean + covariance) and the class shares (11 numbers). It can
  classify with Bayes' rule (dashed curve) and it can SAMPLE new points: pick a class with probability
  P(class), then draw x from that class's hill.
*/

type View = 'disc' | 'gen'
interface Pt {
  p: P2
  k: 0 | 1
}

// seed-28 draw from two tilted Gaussians, rounded to 1 decimal (class A = 0, class B = 1)
const START: Pt[] = [
  ...([
    [4.3, 5.3], [3.5, 4.4], [2.5, 4.8], [3.5, 3.9], [2.8, 4.0], [2.2, 3.7], [2.8, 3.5], [1.6, 3.0],
    [3.6, 5.0], [0.8, 3.0], [3.6, 3.3], [2.3, 3.8], [1.9, 4.9], [4.9, 5.4], [1.4, 4.4], [3.0, 3.8],
  ] as P2[]).map((p) => ({ p, k: 0 as const })),
  ...([
    [7.5, 1.8], [6.7, 2.8], [6.6, 2.7], [6.3, 2.2], [6.4, 1.5], [7.9, 2.5], [6.5, 3.4], [8.7, 2.2],
    [8.1, 2.4], [8.8, 1.2], [6.9, 1.5], [8.3, 3.1], [5.8, 3.1], [7.2, 2.1], [7.8, 3.6], [6.4, 3.1],
  ] as P2[]).map((p) => ({ p, k: 1 as const })),
]

const XD: P2 = [0, 10]
const YD: P2 = [0, 7]
const COL = ['var(--viz-1)', 'var(--viz-2)']
const tint = (k: number, pct: number) => `color-mix(in srgb, ${COL[k]} ${pct}%, var(--surface))`
const LOGIT90 = Math.log(9)

const legend: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1rem', justifyContent: 'center', fontSize: '0.8125rem', color: 'var(--ink-2)', margin: '0.3rem 0 0' }
const note: CSSProperties = { fontSize: '0.8125rem', color: 'var(--ink-2)', textAlign: 'center', margin: '0.35rem auto 0', maxWidth: '34rem', minHeight: '2.4em' }

export default function GenVsDiscToggle() {
  const [view, setView] = useState<View>('disc')
  const [pts, setPts] = useState<Pt[]>(START)
  const [samples, setSamples] = useState<DotDatum[]>([])
  const [sampleSeed, setSampleSeed] = useState(1)

  const model = useMemo(() => {
    const byK = [0, 1].map((k) => pts.filter((q) => q.k === k).map((q) => q.p))
    const g: Gauss2[] = byK.map((ps) => fitGauss(ps))
    const prior = byK.map((ps) => ps.length / pts.length)
    const lr = fitLogistic(
      pts.map((q) => q.p),
      pts.map((q) => q.k),
    )
    const genScore = (x: P2) => logDensity(g[1], x) + Math.log(prior[1]) - (logDensity(g[0], x) + Math.log(prior[0]))
    const discAcc = pts.filter((q) => (lr.w[0] * q.p[0] + lr.w[1] * q.p[1] + lr.b > 0 ? 1 : 0) === q.k).length
    const genAcc = pts.filter((q) => (genScore(q.p) > 0 ? 1 : 0) === q.k).length
    return { g, prior, lr, genScore, discAcc, genAcc }
  }, [pts])

  const move = (i: number, p: P2) => {
    setPts((old) => old.map((q, j) => (j === i ? { ...q, p } : q)))
    setSamples([])
  }

  const drawSamples = () => {
    const rng = mulberry32(9000 + sampleSeed)
    const out: DotDatum[] = []
    for (let i = 0; i < 20; i++) {
      const k = rng() < model.prior[0] ? 0 : 1 // 1. pick a class with probability P(class)
      const [x, y] = sampleGauss(model.g[k], rng) // 2. draw x from that class's hill
      out.push({ x, y, color: COL[k], hollow: true, r: 5, shape: k === 0 ? 'circle' : 'square' })
    }
    setSamples(out)
    setSampleSeed((s) => s + 1)
  }

  const reset = () => {
    setPts(START)
    setSamples([])
    setSampleSeed(1)
  }

  const { lr } = model
  const n = pts.length

  return (
    <Figure
      title="Draw a line, or learn the whole shape?"
      caption={
        <>
          Same 32 points, two kinds of model. <b>Discriminative</b> (logistic regression) learns only <M>{'P(y \\mid x)'}</M>: where the boundary is and how sure to be
          near it. <b>Generative</b> learns a hill for each class, <M>{'p(x \\mid y)'}</M>, plus how common each class is, <M>{'P(y)'}</M>. Try: in the generative view press{' '}
          <b>Sample</b> a few times, then drag one blue point far into the top-left corner. Its hill stretches to cover it, because a generative model must explain{' '}
          <i>every</i> point, while the boundary barely moves.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Model"
          value={view}
          onChange={setView}
          options={[
            { value: 'disc', label: 'Discriminative' },
            { value: 'gen', label: 'Generative' },
          ]}
        />
      </Controls>
      <Plot x={XD} y={YD} width={520} height={364} ariaLabel={view === 'disc' ? 'Two classes of points separated by a straight logistic-regression boundary' : 'Two classes of points, each covered by an oval density hill'}>
        <Grid xTicks={10} yTicks={7} />
        {view === 'disc' ? <DiscLayer w={lr.w} b={lr.b} /> : <GenLayer g={model.g} score={model.genScore} />}
        <Axes xTicks={5} yTicks={4} xLabel="feature x₁" yLabel="feature x₂" />
        {view === 'gen' && <Dots points={samples} />}
        {pts.map((q, i) => (
          <DragDot key={i} p={q.p} k={q.k} onChange={(p) => move(i, p)} />
        ))}
      </Plot>
      <div style={legend} aria-hidden="true">
        <span>
          <span style={{ color: COL[0] }}>●</span> class A
        </span>
        <span>
          <span style={{ color: COL[1] }}>■</span> class B
        </span>
        {view === 'gen' ? (
          <>
            <span>○ □ sampled (new) points</span>
            <span>- - - boundary from Bayes' rule</span>
          </>
        ) : (
          <span>lines: P(B | x) = 0.1, 0.5, 0.9</span>
        )}
      </div>
      <p style={note}>
        {view === 'disc'
          ? 'This model has nothing to sample from: it never learned where the points live, only which side of the line they fall on.'
          : samples.length
            ? `20 new points, made by picking a class (A with probability ${model.prior[0].toFixed(2)}) and then drawing from its hill. Press again for a different batch.`
            : 'Press Sample: the model invents brand-new points that look like the data.'}
      </p>
      <Controls>
        <Button primary onClick={drawSamples} disabled={view === 'disc'}>
          Sample 20 new points
        </Button>
        <Button onClick={reset}>Reset data</Button>
        <Readout
          items={
            view === 'disc'
              ? [
                  ['learns', 'P(y | x)'],
                  ['numbers learned', '3 (w₁, w₂, b)'],
                  ['training accuracy', `${model.discAcc} / ${n}`],
                ]
              : [
                  ['learns', 'p(x | y) and P(y)'],
                  ['numbers learned', '11'],
                  ['training accuracy', `${model.genAcc} / ${n}`],
                ]
          }
        />
      </Controls>
    </Figure>
  )
}

function DiscLayer({ w, b }: { w: P2; b: number }) {
  const lines = [
    { lvl: -LOGIT90, txt: '0.1', dash: '5 5', width: 1.5 },
    { lvl: 0, txt: '0.5', dash: undefined, width: 2.5 },
    { lvl: LOGIT90, txt: '0.9', dash: '5 5', width: 1.5 },
  ]
  return (
    <g>
      <Path points={halfPlane(w, b, 0, XD, YD, false)} closed fill={tint(0, 13)} color="none" width={0} />
      <Path points={halfPlane(w, b, 0, XD, YD, true)} closed fill={tint(1, 15)} color="none" width={0} />
      {lines.map((L) => {
        const seg = lineInRect(w, b, L.lvl, XD, YD)
        if (!seg) return null
        // label near the upper end of the segment
        const [p, q] = seg[0][1] > seg[1][1] ? seg : [seg[1], seg[0]]
        const t = 0.1
        const lx = p[0] + t * (q[0] - p[0])
        const ly = p[1] + t * (q[1] - p[1])
        return (
          <g key={L.txt}>
            <Path points={seg} color="var(--viz-ink)" width={L.width} dash={L.dash} opacity={L.lvl === 0 ? 0.9 : 0.55} />
            <Label x={lx} y={ly} dx={6} dy={4} color="var(--viz-ink)" size={12} weight={L.lvl === 0 ? 700 : 400}>
              {L.txt}
            </Label>
          </g>
        )
      })}
    </g>
  )
}

function GenLayer({ g, score }: { g: Gauss2[]; score: (x: P2) => number }) {
  return (
    <g>
      {g.map((gk, k) =>
        [2.5, 1.7, 0.9].map((r, j) => <Path key={`${k}-${r}`} points={ellipse(gk, r)} closed fill={tint(k, 10 + 6 * j)} color={tint(k, 55)} width={1} opacity={0.95} />),
      )}
      <ZeroContour f={score} />
      {g.map((gk, k) => (
        <Path
          key={`c${k}`}
          points={[
            [gk.mu[0] - 0.18, gk.mu[1]],
            [gk.mu[0] + 0.18, gk.mu[1]],
          ]}
          color={COL[k]}
          width={2.5}
        />
      ))}
      {g.map((gk, k) => (
        <Path
          key={`v${k}`}
          points={[
            [gk.mu[0], gk.mu[1] - 0.18],
            [gk.mu[0], gk.mu[1] + 0.18],
          ]}
          color={COL[k]}
          width={2.5}
        />
      ))}
    </g>
  )
}

/** the curve where f = 0, by marching squares, as one dashed path */
function ZeroContour({ f }: { f: (x: P2) => number }) {
  const { xs, ys, clipId } = usePlot()
  const d = useMemo(() => {
    const NX = 80
    const NY = 56
    const sx = (XD[1] - XD[0]) / NX
    const sy = (YD[1] - YD[0]) / NY
    const V: number[][] = []
    for (let i = 0; i <= NY; i++) {
      V.push([])
      for (let j = 0; j <= NX; j++) V[i].push(f([XD[0] + j * sx, YD[0] + i * sy]))
    }
    let out = ''
    for (let i = 0; i < NY; i++)
      for (let j = 0; j < NX; j++) {
        const x0 = XD[0] + j * sx
        const y0 = YD[0] + i * sy
        const c: [number, P2][] = [
          [V[i][j], [x0, y0]],
          [V[i][j + 1], [x0 + sx, y0]],
          [V[i + 1][j + 1], [x0 + sx, y0 + sy]],
          [V[i + 1][j], [x0, y0 + sy]],
        ]
        const hits: P2[] = []
        for (let e = 0; e < 4; e++) {
          const [va, pa] = c[e]
          const [vb, pb] = c[(e + 1) % 4]
          if (va >= 0 !== vb >= 0) {
            const t = va / (va - vb)
            hits.push([pa[0] + t * (pb[0] - pa[0]), pa[1] + t * (pb[1] - pa[1])])
          }
        }
        for (let h = 0; h + 1 < hits.length; h += 2) out += `M${xs(hits[h][0]).toFixed(1)},${ys(hits[h][1]).toFixed(1)}L${xs(hits[h + 1][0]).toFixed(1)},${ys(hits[h + 1][1]).toFixed(1)}`
      }
    return out
  }, [f, xs, ys])
  return <path d={d} clipPath={`url(#${clipId})`} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2, strokeDasharray: '6 5', opacity: 0.8 }} />
}

/** a data point the learner can drag with a pointer or move with the arrow keys */
function DragDot({ p, k, onChange }: { p: P2; k: 0 | 1; onChange: (p: P2) => void }) {
  const { xs, ys, toData } = usePlot()
  const dragging = useRef(false)
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
  const set = (x: number, y: number) => onChange([Math.round(clamp(x, 0.1, 9.9) * 10) / 10, Math.round(clamp(y, 0.1, 6.9) * 10) / 10])
  const cx = xs(p[0])
  const cy = ys(p[1])
  const r = 5.5
  const style = { fill: COL[k], stroke: 'var(--surface)', strokeWidth: 1.5 }
  return (
    <g
      className="plot-drag"
      tabIndex={0}
      role="slider"
      aria-label={`class ${k === 0 ? 'A' : 'B'} point`}
      aria-valuetext={`x1 ${p[0].toFixed(1)}, x2 ${p[1].toFixed(1)}`}
      onKeyDown={(e) => {
        const d: Record<string, P2> = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, 0.2], ArrowDown: [0, -0.2] }
        const s = d[e.key]
        if (!s) return
        e.preventDefault()
        set(p[0] + s[0], p[1] + s[1])
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        dragging.current = true
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return
        const [x, y] = toData(e.clientX, e.clientY)
        set(x, y)
      }}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      }}
    >
      <circle cx={cx} cy={cy} r={r + 7} style={{ fill: 'transparent' }} />
      {k === 0 ? <circle cx={cx} cy={cy} r={r} style={style} /> : <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} style={style} />}
    </g>
  )
}
