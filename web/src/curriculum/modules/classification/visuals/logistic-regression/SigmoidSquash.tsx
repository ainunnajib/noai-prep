import { useRef, useState } from 'react'
import { Figure, Controls, Readout, Slider, Button, Plot, Grid, Axes, FnPath, Path, Label, HLine, VLine, useAnimationFrame, usePlot, M } from '../../../../../kit'
import { Handle } from './Handle'
import { HOURS, PASSED, POS_C, NEG_C, sigmoid, meanLoss1D, gdStep1D, fix, signed } from './shared'

/*
  Pass/fail against hours studied, with the logistic curve p = σ(w·x + b).
  Sliders for w and b, a "Fit" button that runs gradient descent on the mean log loss (live),
  a draggable new student, and a "squash strip" that shows how σ maps every score z into (0, 1).
*/

const START = { w: 1, b: -2 }
const LR = 0.5

function Students({ w, b }: { w: number; b: number }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {HOURS.map((h, i) => {
        const y = PASSED[i]
        const p = sigmoid(w * h + b)
        const wrong = (p >= 0.5 ? 1 : 0) !== y
        const cx = xs(h)
        const cy = ys(y)
        const r = 6.5
        return (
          <g key={i}>
            {wrong && <circle cx={cx} cy={cy} r={r + 5} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2.2 }} />}
            {y === 1 ? (
              <circle cx={cx} cy={cy} r={r} style={{ fill: POS_C, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
            ) : (
              <rect x={cx - r * 0.9} y={cy - r * 0.9} width={r * 1.8} height={r * 1.8} style={{ fill: NEG_C, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
            )}
          </g>
        )
      })}
    </g>
  )
}

/** Top line: scores z. Bottom line: probabilities σ(z). Each connector sends a score to its probability. */
function SquashStrip({ zq }: { zq: number }) {
  const TOP = 0.72
  const BOT = 0.28
  const px = (p: number) => -8 + 16 * p
  const zc = Math.max(-8, Math.min(8, zq))
  const ticks = [-8, -6, -4, -2, 0, 2, 4, 6, 8]
  const fan = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]
  return (
    <Plot
      x={[-8, 8]}
      y={[0, 1]}
      width={480}
      height={110}
      minHeight={110}
      margin={{ top: 4, bottom: 4, left: 66, right: 14 }}
      ariaLabel={`Squash strip: the score z = ${fix(zq)} is sent to the probability ${fix(sigmoid(zq), 3)}`}
    >
      {fan.map((t) => (
        <Path key={t} points={[[t, TOP], [px(sigmoid(t)), BOT]]} color="var(--viz-muted)" width={1} opacity={0.7} />
      ))}
      <Path points={[[-8, TOP], [8, TOP]]} color="var(--viz-axis)" width={1.5} />
      <Path points={[[-8, BOT], [8, BOT]]} color="var(--viz-axis)" width={1.5} />
      {ticks.map((t) => (
        <g key={t}>
          <Path points={[[t, TOP], [t, TOP + 0.05]]} color="var(--viz-axis)" width={1.2} />
          <Label x={t} y={TOP} dy={-11} anchor="middle" size={11} color="var(--ink-3)">
            {String(t).replace('-', '−')}
          </Label>
        </g>
      ))}
      {[0, 0.5, 1].map((p) => (
        <g key={p}>
          <Path points={[[px(p), BOT], [px(p), BOT - 0.05]]} color="var(--viz-axis)" width={1.2} />
          <Label x={px(p)} y={BOT} dy={20} anchor="middle" size={11} color="var(--ink-3)">
            {String(p)}
          </Label>
        </g>
      ))}
      <Path points={[[zc, TOP], [px(sigmoid(zq)), BOT]]} color="var(--viz-4)" width={3} />
      <Label x={-8} y={TOP} dx={-10} dy={4} anchor="end" size={12} color="var(--ink-2)">
        score z
      </Label>
      <Label x={-8} y={BOT} dx={-10} dy={4} anchor="end" size={12} color="var(--ink-2)">
        σ(z)
      </Label>
      <Dot x={zc} y={TOP} />
      <Dot x={px(sigmoid(zq))} y={BOT} />
    </Plot>
  )
}

function Dot({ x, y }: { x: number; y: number }) {
  const { xs, ys } = usePlot()
  return <circle cx={xs(x)} cy={ys(y)} r={5.5} style={{ fill: 'var(--viz-4)', stroke: 'var(--surface)', strokeWidth: 2 }} />
}

export default function SigmoidSquash() {
  const [w, setW] = useState(START.w)
  const [b, setB] = useState(START.b)
  const [qx, setQx] = useState(4)
  const [fitting, setFitting] = useState(false)
  const steps = useRef(0)
  const [stepCount, setStepCount] = useState(0)

  useAnimationFrame(() => {
    let ww = w
    let bb = b
    for (let k = 0; k < 25; k++) {
      ;[ww, bb] = gdStep1D(ww, bb, LR)
      steps.current++
    }
    const moved = Math.hypot(ww - w, bb - b)
    setW(ww)
    setB(bb)
    setStepCount(steps.current)
    if (moved < 1e-6 || steps.current >= 5000) setFitting(false)
  }, fitting)

  const zq = w * qx + b
  const pq = sigmoid(zq)
  const loss = meanLoss1D(w, b)
  const correct = HOURS.filter((h, i) => (sigmoid(w * h + b) >= 0.5 ? 1 : 0) === PASSED[i]).length
  const mid = Math.abs(w) > 1e-6 ? -b / w : NaN
  const midIn = Number.isFinite(mid) && mid > 0 && mid < 6.5

  const startFit = () => {
    steps.current = 0
    setStepCount(0)
    setFitting(true)
  }
  const reset = () => {
    setFitting(false)
    setW(START.w)
    setB(START.b)
    steps.current = 0
    setStepCount(0)
  }

  return (
    <Figure
      title="Squash a straight-line score into a probability"
      caption={
        <>
          Orange circles passed (<M>y = 1</M>), blue squares failed (<M>y = 0</M>); a red ring marks a student on the wrong side of 0.5. Slide <M>b</M>: the S slides
          sideways. Slide <M>w</M>: it gets steeper or flatter (and, because the 50-50 point is at <M>{'x = -b/w'}</M>, it moves too). Press <b>Fit</b> to let gradient
          descent find the <M>w</M> and <M>b</M> with the lowest log loss. Drag the pink new student and watch the strip underneath: its score <M>z</M> on the top line
          is sent to <M>{'\\sigma(z)'}</M> on the bottom line. Big positive and big negative scores are squeezed against 1 and 0.
        </>
      }
    >
      <Plot x={[0, 6.5]} y={[-0.1, 1.1]} width={480} height={290} minHeight={250} margin={{ left: 44, bottom: 36 }} ariaLabel={`Pass or fail against hours studied, with the curve p = sigma(${fix(w)} x ${signed(b)})`}>
        <Grid xTicks={13} yTicks={4} />
        <Axes xLabel="hours studied" yLabel="P(pass)" xTicks={7} yTicks={4} />
        <HLine y={0.5} color="var(--viz-muted)" />
        {midIn && <VLine x={mid} color="var(--viz-muted)" label={`50-50 at ${fix(mid, 1)} h`} />}
        <FnPath f={(x) => sigmoid(w * x + b)} color="var(--viz-ink)" width={2.75} />
        <Students w={w} b={b} />
        <Path points={[[0, pq], [qx, pq]]} color="var(--viz-4)" width={1.5} dash="4 4" />
        <Handle
          x={qx}
          y={pq}
          lockY
          step={0.1}
          onChange={(x) => setQx(Math.min(6.4, Math.max(0.1, Math.round(x * 10) / 10)))}
          color="var(--viz-4)"
          r={8}
          tag="new student"
          tagDx={pq > 0.5 ? 10 : -10}
          tagDy={pq > 0.5 ? 22 : -14}
          ariaLabel="New student: hours studied"
          valueText={`${qx.toFixed(1)} hours, probability ${pq.toFixed(2)}`}
        />
        <Label x={0} y={pq} dx={4} dy={pq > 0.85 ? 16 : -6} size={12} color="var(--viz-4)">
          {fix(pq, 2)}
        </Label>
      </Plot>
      <SquashStrip zq={zq} />
      <Readout
        items={[
          ['new student', `${fix(qx, 1)} h`],
          ['score z', `${fix(w)} × ${fix(qx, 1)} ${signed(b)} = ${fix(zq)}`],
          ['p = σ(z)', fix(pq, 3)],
          ['prediction', pq >= 0.5 ? 'pass' : 'fail'],
        ]}
      />
      <Controls>
        <Slider label={<M>w</M>} value={w} min={-2} max={5} step={0.05} onChange={(v) => (setFitting(false), setW(v))} format={(v) => fix(v)} />
        <Slider label={<M>b</M>} value={b} min={-15} max={5} step={0.1} onChange={(v) => (setFitting(false), setB(v))} format={(v) => fix(v)} />
      </Controls>
      <Controls>
        <Button primary onClick={startFit} disabled={fitting}>
          {fitting ? 'Fitting…' : 'Fit (gradient descent)'}
        </Button>
        <Button onClick={reset}>Reset</Button>
        <Readout
          items={[
            ['mean log loss', fix(loss, 4)],
            ['correct', `${correct} / ${HOURS.length}`],
            ['GD steps', String(stepCount)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
