import { useState } from 'react'
import { Figure, Readout, Plot, Grid, Axes, FnPath, Rect, Label, HLine, VLine, DraggablePoint, usePlot, useNarrow, M } from '../../../../../kit'
import { alphaOf } from './adaboost'
import { TXT_ORANGE, TXT_GREEN } from '../tones'
import s from './boosting.module.css'

/*
  α(ε) = ½ ln((1 − ε)/ε). Three learners sit on the curve; drag them to change their weighted error.
  Below, a tug-of-war: learner A votes orange, B and C vote blue. A plain majority says blue; AdaBoost
  adds up the α values instead.
*/

/** colour = marks and fills; text = the same hue, dark/light enough for small text in both themes */
const LEARNERS = [
  { key: 'A', colour: 'var(--viz-3)', text: TXT_GREEN, vote: 1 },
  { key: 'B', colour: 'var(--viz-5)', text: 'var(--viz-5)', vote: -1 },
  { key: 'C', colour: 'var(--viz-4)', text: 'var(--viz-4)', vote: -1 },
] as const

const EPS_MIN = 0.02
const EPS_MAX = 0.98
/** y-range of the curve: α(0.02) = −α(0.98) ≈ 1.95, so both ends of the drag range stay inside */
const A_LO = -2.3
const A_HI = 2.4
const snap = (e: number) => Math.round(Math.max(EPS_MIN, Math.min(EPS_MAX, e)) * 100) / 100

function TugOfWar({ alphas }: { alphas: number[] }) {
  const { xs, ys } = usePlot()
  // contribution of each learner to the score: α × vote (a negative α flips the vote)
  const contrib = alphas.map((a, i) => a * LEARNERS[i].vote)
  let pos = 0
  let neg = 0
  const bars = contrib.map((c, i) => {
    const from = c >= 0 ? pos : neg
    const to = from + c
    if (c >= 0) pos = to
    else neg = to
    const x0 = xs(Math.min(from, to))
    const w = Math.abs(xs(to) - xs(from))
    const flipped = alphas[i] < 0
    return (
      <g key={i}>
        <rect x={x0} y={ys(0.8)} width={w} height={ys(-0.8) - ys(0.8)} style={{ fill: `color-mix(in srgb, ${LEARNERS[i].colour} 40%, var(--surface))`, stroke: LEARNERS[i].colour, strokeWidth: 1.5, strokeDasharray: flipped ? '4 3' : undefined }} />
        {/* the letter sits inside a wide segment, or just above a narrow one */}
        <text
          x={x0 + w / 2}
          y={w > 22 ? ys(0) + 4.5 : ys(0.8) - 4}
          textAnchor="middle"
          className={`plot-label ${s.svgText}`}
          style={{ fill: w > 22 ? 'var(--ink)' : LEARNERS[i].text, fontSize: w > 22 ? 12.5 : 11.5, fontWeight: 700 }}
        >
          {LEARNERS[i].key}
        </text>
      </g>
    )
  })
  const total = pos + neg
  return (
    <g>
      <rect x={xs(0)} y={ys(1)} width={xs(4.2) - xs(0)} height={ys(-1) - ys(1)} style={{ fill: 'color-mix(in srgb, var(--viz-2) 9%, transparent)' }} />
      <rect x={xs(-4.2)} y={ys(1)} width={xs(0) - xs(-4.2)} height={ys(-1) - ys(1)} style={{ fill: 'color-mix(in srgb, var(--viz-1) 9%, transparent)' }} />
      {bars}
      <line x1={xs(0)} x2={xs(0)} y1={ys(1.25)} y2={ys(-1.25)} style={{ stroke: 'var(--viz-ink)', strokeWidth: 2 }} />
      <path d={`M${xs(total)},${ys(-1.05)} l-6,9 h12 z`} style={{ fill: 'var(--viz-ink)' }} />
      <text x={xs(total)} y={ys(-1.05) + 24} textAnchor="middle" className={`plot-label ${s.svgText}`} style={{ fontSize: 12 }}>
        score {total >= 0 ? '+' : '−'}
        {Math.abs(total).toFixed(2)}
      </text>
      <text x={xs(4.1)} y={ys(1.25)} textAnchor="end" className={s.svgText} style={{ fill: TXT_ORANGE, fontSize: 12, fontWeight: 700 }}>
        votes for orange →
      </text>
      <text x={xs(-4.1)} y={ys(1.25)} textAnchor="start" className={s.svgText} style={{ fill: 'var(--viz-1)', fontSize: 12, fontWeight: 700 }}>
        ← votes for blue
      </text>
    </g>
  )
}

export default function AlphaCurve() {
  const [eps, setEps] = useState([0.1, 0.3, 0.35])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const [dragged, setDragged] = useState(false)
  const alphas = eps.map(alphaOf)
  const score = alphas.reduce((acc, a, i) => acc + a * LEARNERS[i].vote, 0)
  const set = (i: number) => (x: number) => {
    setDragged(true)
    setEps((old) => old.map((v, j) => (j === i ? snap(x) : v)))
  }
  const fmt = (a: number) => (a < 0 ? `−${Math.abs(a).toFixed(2)}` : a.toFixed(2))
  const contrib = alphas.map((a, i) => a * LEARNERS[i].vote)
  const sgn = (v: number) => (v < 0 ? `-${Math.abs(v).toFixed(2)}` : `+${v.toFixed(2)}`)

  return (
    <Figure
      title="How much say does each learner get?"
      caption={
        <>
          Drag the learners along the curve, and drag A to the right until B and C outvote it. Notice a coin flip (ε = 0.5) gets no say, and a learner
          worse than chance gets a negative one.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <Plot x={[0, 1]} y={[A_LO, A_HI]} width={560} height={330} minHeight={narrow ? 300 : 0} margin={{ left: 44, right: 14, top: 16, bottom: 38 }} ariaLabel="The curve alpha of epsilon with three draggable learners">
          <Rect x0={0} x1={0.5} y0={A_LO} y1={A_HI} fill="color-mix(in srgb, var(--viz-pos) 8%, transparent)" />
          <Rect x0={0.5} x1={1} y0={A_LO} y1={A_HI} fill="color-mix(in srgb, var(--viz-neg) 7%, transparent)" />
          <Grid xTicks={10} yTicks={8} />
          <Axes xLabel="weighted error ε" yLabel="say α" xTicks={narrow ? 5 : 10} yTicks={8} />
          <HLine y={0} color="var(--viz-axis)" dash="" width={1.25} />
          <VLine x={0.5} color="var(--viz-muted)" dash="4 4" />
          <FnPath f={(e) => alphaOf(e)} domain={[0.0101, 0.9899]} color="var(--viz-1)" width={3} samples={300} />
          <Label x={0.04} y={-1.9} color={TXT_GREEN} size={12} weight={700}>
            better than chance: α &gt; 0
          </Label>
          <Label x={0.96} y={2.05} anchor="end" color="color-mix(in srgb, var(--viz-neg) 80%, var(--ink))" size={12} weight={700}>
            worse than chance: α &lt; 0
          </Label>
          <Label x={0.5} y={0} dx={6} dy={-8} color="var(--viz-ink)" size={11.5}>
            coin flip: α = 0
          </Label>
          {alphas.map((a, i) => (
            <HLine key={i} y={a} color={LEARNERS[i].colour} dash="2 4" width={1.2} />
          ))}
          {LEARNERS.map((L, i) => (
            <DraggablePoint key={L.key} x={eps[i]} y={alphas[i]} color={L.colour} r={8} ariaLabel={`learner ${L.key}`} lockY onChange={(x) => set(i)(x)} />
          ))}
          {/* letters: B to the left of its point, A and C to the right, so close learners never share a spot */}
          {LEARNERS.map((L, i) => (
            <Label key={`l${L.key}`} x={eps[i]} y={alphas[i]} dx={L.key === 'B' ? -13 : 13} dy={L.key === 'B' ? -6 : 4} anchor={L.key === 'B' ? 'end' : 'start'} color={L.text} size={13} weight={700}>
              {L.key}
            </Label>
          ))}
          {!dragged && (
            <Label x={eps[0]} y={alphas[0]} dx={0} dy={26} anchor="middle" color={TXT_GREEN} size={12} weight={700}>
              ↔ drag
            </Label>
          )}
        </Plot>
      </div>
      <Readout
        items={LEARNERS.map((L, i) => [
          <span key={L.key} style={{ color: L.text, fontWeight: 700 }}>
            learner {L.key}
          </span>,
          <span key={`v${L.key}`}>
            ε = {eps[i].toFixed(2)}, α = {fmt(alphas[i])}
          </span>,
        ])}
      />
      <p className={s.panelTitle} style={{ width: '100%', marginBottom: 0 }}>
        A new point: A votes orange, B and C vote blue
      </p>
      <Plot x={[-4.2, 4.2]} y={[-2.15, 1.6]} width={560} height={106} minHeight={100} margin={{ left: 8, right: 8, top: 6, bottom: 6 }} ariaLabel={`Weighted vote: total score ${score.toFixed(2)}, so the team says ${score >= 0 ? 'orange' : 'blue'}`}>
        <TugOfWar alphas={alphas} />
      </Plot>
      <p className={s.note}>
        One learner, one vote: <b>blue wins 2 to 1</b>. AdaBoost adds up α × vote (orange = +1, blue = −1):{' '}
        <M>{`(${sgn(contrib[0])}) + (${sgn(contrib[1])}) + (${sgn(contrib[2])}) = ${sgn(score)}`}</M>, so the team says{' '}
        <b style={{ color: score >= 0 ? TXT_ORANGE : 'var(--viz-1)' }}>{score >= 0 ? 'orange' : 'blue'}</b>.
      </p>
      <p className={s.note}>
        Mistakes get multiplied by <M>{'e^{\\alpha}'}</M> at re-weighting time: ×{Math.exp(alphas[0]).toFixed(2)} for A, ×{Math.exp(alphas[1]).toFixed(2)} for B and ×
        {Math.exp(alphas[2]).toFixed(2)} for C.
      </p>
    </Figure>
  )
}
