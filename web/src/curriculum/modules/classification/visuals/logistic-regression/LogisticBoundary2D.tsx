import { useId, useState } from 'react'
import { Figure, Controls, Readout, Button, Plot, Grid, Axes, Path, Arrow, Label, useAnimationFrame, usePlot, M } from '../../../../../kit'
import { Handle } from './Handle'
import { POS_2D, NEG_2D, POS_C, NEG_C, sigmoid, loss2D, correct2D, gdStep2D, clipLine, fix, signed, type Model2D, type Pt } from './shared'

/*
  Two-feature logistic regression. The background is coloured by p = σ(w·x + b) (exact: the colour
  only changes along w, so it is one SVG linear gradient). Dashed contours mark p = 0.1, 0.25, 0.75, 0.9;
  the solid line is the decision boundary p = 0.5. Drag the arrow tip to change w (direction and
  length) and the square base to shift the boundary (this changes b).
*/

const XR: Pt = [-5, 5]
const YR: Pt = [-4, 4]
const START_ANCHOR: Pt = [0.5, 0.5]
const START: Model2D = { w: [-0.5, 1.2], b: -0.35 }
const LR = 0.5
const CONTOURS = [0.1, 0.25, 0.75, 0.9]
const logit = (p: number) => Math.log(p / (1 - p))

const tint = (p: number) => {
  const a = Math.round(Math.min(1, Math.abs(p - 0.5) * 2) * 34)
  return `color-mix(in srgb, ${p >= 0.5 ? POS_C : NEG_C} ${a}%, var(--surface))`
}

/** Background field: one linear gradient perpendicular to the boundary. */
function ProbField({ m }: { m: Model2D }) {
  const { xs, ys, margin, width, height, clipId } = usePlot()
  const id = 'pf' + useId().replace(/:/g, '')
  const [w1, w2] = m.w
  const kx = xs(1) - xs(0)
  const ky = ys(1) - ys(0)
  const n: Pt = [w1 / kx, w2 / ky] // change in z per pixel
  const nn = Math.hypot(n[0], n[1])
  const rect = { x: margin.left, y: margin.top, width: width - margin.left - margin.right, height: height - margin.top - margin.bottom }
  if (nn < 1e-9) return <rect {...rect} style={{ fill: tint(sigmoid(m.b)) }} />
  const ww = w1 * w1 + w2 * w2
  const foot: Pt = [(-m.b * w1) / ww, (-m.b * w2) / ww] // a point where z = 0
  const P0: Pt = [xs(foot[0]), ys(foot[1])]
  const T = 6
  const u: Pt = [n[0] / nn, n[1] / nn]
  const d = T / nn
  const N = 24
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={P0[0] - u[0] * d} y1={P0[1] - u[1] * d} x2={P0[0] + u[0] * d} y2={P0[1] + u[1] * d}>
          {Array.from({ length: N + 1 }, (_, i) => {
            const f = i / N
            return <stop key={i} offset={f} style={{ stopColor: tint(sigmoid(-T + 2 * T * f)) }} />
          })}
        </linearGradient>
      </defs>
      <rect {...rect} clipPath={`url(#${clipId})`} style={{ fill: `url(#${id})` }} />
    </g>
  )
}

function Points({ m }: { m: Model2D }) {
  const { xs, ys } = usePlot()
  const r = 6
  const z = (p: Pt) => m.w[0] * p[0] + m.w[1] * p[1] + m.b
  return (
    <g>
      {POS_2D.map((p, i) => {
        const wrong = z(p) < 0
        return (
          <g key={`p${i}`}>
            {wrong && <circle cx={xs(p[0])} cy={ys(p[1])} r={r + 5} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2.2 }} />}
            <circle cx={xs(p[0])} cy={ys(p[1])} r={r} style={{ fill: POS_C, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
          </g>
        )
      })}
      {NEG_2D.map((p, i) => {
        const wrong = z(p) >= 0
        return (
          <g key={`n${i}`}>
            {wrong && <circle cx={xs(p[0])} cy={ys(p[1])} r={r + 5} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2.2 }} />}
            <rect x={xs(p[0]) - r * 0.9} y={ys(p[1]) - r * 0.9} width={r * 1.8} height={r * 1.8} style={{ fill: NEG_C, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
          </g>
        )
      })}
    </g>
  )
}

export default function LogisticBoundary2D() {
  const [m, setM] = useState<Model2D>(START)
  // the arrow's base: a point on the boundary that the learner can drag
  const [anchor, setAnchor] = useState<Pt>(START_ANCHOR)
  const [fitting, setFitting] = useState(false)

  const project = (a: Pt, mm: Model2D): Pt => {
    const ww = mm.w[0] ** 2 + mm.w[1] ** 2
    const zz = mm.w[0] * a[0] + mm.w[1] * a[1] + mm.b
    return [a[0] - (zz * mm.w[0]) / ww, a[1] - (zz * mm.w[1]) / ww]
  }

  useAnimationFrame(() => {
    let mm = m
    for (let k = 0; k < 12; k++) mm = gdStep2D(mm, LR)
    const moved = Math.hypot(mm.w[0] - m.w[0], mm.w[1] - m.w[1], mm.b - m.b)
    setM(mm)
    setAnchor(project(anchor, mm))
    if (moved < 1e-6) setFitting(false)
  }, fitting)

  const tip: Pt = [anchor[0] + m.w[0], anchor[1] + m.w[1]]
  const len = Math.hypot(m.w[0], m.w[1])
  const boundary = clipLine(m.w[0], m.w[1], -m.b, XR, YR)
  const total = POS_2D.length + NEG_2D.length

  const onTip = (x: number, y: number) => {
    setFitting(false)
    let w: Pt = [x - anchor[0], y - anchor[1]]
    const l = Math.hypot(w[0], w[1])
    if (l < 0.3) w = l < 1e-9 ? [0, 0.3] : [(w[0] / l) * 0.3, (w[1] / l) * 0.3]
    if (l > 6) w = [(w[0] / l) * 6, (w[1] / l) * 6]
    w = [Math.round(w[0] * 100) / 100, Math.round(w[1] * 100) / 100]
    setM({ w, b: -(w[0] * anchor[0] + w[1] * anchor[1]) })
  }
  const onBase = (x: number, y: number) => {
    setFitting(false)
    const a: Pt = [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
    setAnchor(a)
    setM({ w: m.w, b: -(m.w[0] * a[0] + m.w[1] * a[1]) })
  }
  const reset = () => {
    setFitting(false)
    setM(START)
    setAnchor(START_ANCHOR)
  }

  return (
    <Figure
      title="A straight boundary with a confidence map around it"
      caption={
        <>
          Each point has two features <M>{'(x_1, x_2)'}</M>; orange circles are class 1, blue squares class 0. The background shows the model's probability{' '}
          <M>{'p = \\sigma(w_1x_1 + w_2x_2 + b)'}</M>: orange where it says class 1, blue where it says class 0, white near 0.5. Drag the pink <b>arrow tip</b> to turn
          the weight vector <M>w</M>: the boundary always stays at right angles to it, and the arrow points into the class-1 side. Drag the tip further out (a
          longer <M>w</M>) and the dashed probability lines squeeze together: the model becomes more confident. Drag the <b>square</b> to slide the boundary
          without turning it (that changes only <M>b</M>). Then press <b>Fit</b>.
        </>
      }
    >
      <Plot x={XR} y={YR} width={480} height={387} ariaLabel={`Two classes of points with the boundary ${fix(m.w[0])} x1 ${signed(m.w[1])} x2 ${signed(m.b)} = 0`}>
        <ProbField m={m} />
        <Grid xTicks={10} yTicks={8} />
        <Axes xLabel="x₁" yLabel="x₂" xTicks={10} yTicks={8} />
        {CONTOURS.map((p) => {
          const seg = clipLine(m.w[0], m.w[1], logit(p) - m.b, XR, YR)
          if (!seg) return null
          const c = p > 0.5 ? POS_C : NEG_C
          // label near the end of the segment that is furthest right (or highest)
          const end = seg[0][0] > seg[1][0] + 1e-6 || (Math.abs(seg[0][0] - seg[1][0]) < 1e-6 && seg[0][1] > seg[1][1]) ? seg[0] : seg[1]
          const other = end === seg[0] ? seg[1] : seg[0]
          const lp: Pt = [end[0] + (other[0] - end[0]) * 0.06, end[1] + (other[1] - end[1]) * 0.06]
          return (
            <g key={p}>
              <Path points={seg} color={c} width={1.5} dash="5 5" />
              {(p === 0.1 || p === 0.9) && (
                <Label x={lp[0]} y={lp[1]} dx={-4} dy={-6} anchor="end" size={11.5} color={c}>
                  {`p = ${p}`}
                </Label>
              )}
            </g>
          )
        })}
        {boundary && <Path points={boundary} color="var(--viz-ink)" width={2.5} />}
        <Points m={m} />
        <Arrow from={anchor} to={tip} color="var(--viz-4)" width={3} />
        <Handle x={anchor[0]} y={anchor[1]} onChange={onBase} square r={7} color="var(--viz-4)" ariaLabel="Boundary position (changes b)" valueText={`b ${fix(m.b)}`} step={0.1} />
        <Handle x={tip[0]} y={tip[1]} onChange={onTip} r={8} color="var(--viz-4)" tag="w" ariaLabel="Tip of the weight vector w" valueText={`w = (${fix(m.w[0])}, ${fix(m.w[1])})`} step={0.1} />
      </Plot>
      <Readout
        items={[
          ['score', `z = ${fix(m.w[0])}x₁ ${signed(m.w[1])}x₂ ${signed(m.b)}`],
          ['length of w', fix(len)],
          ['correct', `${correct2D(m)} / ${total}`],
          ['mean log loss', fix(loss2D(m), 3)],
        ]}
      />
      <Controls>
        <Button primary onClick={() => setFitting(true)} disabled={fitting}>
          {fitting ? 'Fitting…' : 'Fit (gradient descent)'}
        </Button>
        <Button onClick={reset}>Reset</Button>
      </Controls>
    </Figure>
  )
}
