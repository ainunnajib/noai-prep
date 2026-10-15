import { useState, type CSSProperties, type ReactNode } from 'react'
import { Controls, Segmented, usePlayer, PlayerControls, Plot, Grid, Axes, Path, Dots, Arrow, Label, HLine, M, useNarrow } from '../../../../../kit'
import Figure from '../TouchFigure'
import { AREA, PRICE, loss, slope, fixed, prefersReducedMotion } from './flats'

/*
  The training loop, stage by stage: predict → measure → find the slope → nudge, repeated 20 times on
  the 8 flats with η = 0.1, starting from the poor line price = 1 × area.
  Left: the data and the current line. Right: the loss after each completed step.
*/

const ETA = 0.1
const W0 = 1
const STEPS = 20
const STAGES = ['Predict', 'Measure', 'Find slope', 'Nudge'] as const
const SUB = ['line → prices', 'loss (MSE)', 'which way is down?', 'w − η × slope']
const FOCUS = 7 // the 130 m² flat, used for the worked numbers

// knob value before each training step: ws[t] (ws[STEPS] is the final value)
const ws: number[] = [W0]
for (let t = 0; t < STEPS; t++) ws.push(ws[t] - ETA * slope(ws[t]))

const money = (v: number) => `$${Math.round(v * 100)}k`

function LoopDiagram({ stage, t }: { stage: number; t: number }) {
  const box = (i: number, x: number, y: number) => {
    const on = i === stage
    return (
      <g key={i}>
        <rect
          x={x}
          y={y}
          width={140}
          height={54}
          rx={12}
          style={{
            fill: on ? 'var(--accent)' : 'var(--surface-2)',
            stroke: on ? 'var(--accent)' : 'var(--viz-muted)',
            strokeWidth: on ? 2.5 : 1.25,
            transition: 'fill 0.2s',
          }}
        />
        <text x={x + 70} y={y + 23} textAnchor="middle" style={{ fill: on ? 'var(--accent-ink)' : 'var(--ink)', fontSize: 15, fontWeight: 800 }}>
          {`${i + 1}. ${STAGES[i]}`}
        </text>
        <text x={x + 70} y={y + 42} textAnchor="middle" style={{ fill: on ? 'var(--accent-ink)' : 'var(--ink-3)', fontSize: 11.5, fontWeight: 600 }}>
          {SUB[i]}
        </text>
      </g>
    )
  }
  const arrow = (d: string, key: string) => <path key={key} d={d} style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 2 }} markerEnd="url(#tl-head)" />
  return (
    <svg viewBox="0 0 340 184" width="100%" style={{ display: 'block', maxWidth: 380 }} role="img" aria-label={`Training loop with four stages; now at stage ${stage + 1}, ${STAGES[stage]}, of step ${t + 1}`}>
      <defs>
        <marker id="tl-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0L10,5L0,10Z" style={{ fill: 'var(--viz-axis)' }} />
        </marker>
      </defs>
      {box(0, 6, 8)}
      {box(1, 194, 8)}
      {box(2, 194, 122)}
      {box(3, 6, 122)}
      {arrow('M150,35 L188,35', 'a1')}
      {arrow('M264,66 L264,116', 'a2')}
      {arrow('M190,149 L152,149', 'a3')}
      {arrow('M76,118 L76,68', 'a4')}
      <text x={170} y={88} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 12.5, fontWeight: 700 }}>
        repeat
      </text>
      <text x={170} y={104} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11.5, fontWeight: 600 }}>
        {`step ${Math.min(t + 1, STEPS)} of ${STEPS}`}
      </text>
    </svg>
  )
}

const panelTitle: CSSProperties = { fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }

export default function TrainingLoopAnimation() {
  const [speed, setSpeed] = useState<'slow' | 'fast'>('slow')
  const player = usePlayer({ steps: STEPS * 4 + 1, interval: speed === 'slow' ? (prefersReducedMotion() ? 1400 : 1100) : 260 })
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const i = player.step
  const finished = i >= STEPS * 4
  const t = finished ? STEPS : Math.floor(i / 4)
  const stage = finished ? 3 : i % 4
  const w = ws[Math.min(t, STEPS)]
  const L = loss(w)
  const s = slope(w)
  const wNew = finished ? w : ws[t + 1]
  // the line drawn: after the nudge stage it is already the new line
  const lineW = finished ? w : stage === 3 ? wNew : w
  // losses measured so far (one per completed "measure" stage)
  const measured = finished ? STEPS + 1 : t + (stage >= 1 ? 1 : 0)
  const lossPts = ws.slice(0, measured).map((v, j) => ({ x: j, y: loss(v) }))

  const xf = AREA[FOCUS]
  const yf = PRICE[FOCUS]
  const sStr = fixed(s, 2)
  const sTex = s < 0 ? `(${sStr})` : sStr
  const eq = Math.abs(Number(fixed(w, 2)) - ETA * Number(sStr) - Number(fixed(wNew, 2))) < 1e-9 ? '=' : '\\approx'

  let text: ReactNode
  if (finished) {
    text = (
      <>
        <b>Done.</b> After {STEPS} loops the knob is <M>{`w \\approx ${fixed(w, 2)}`}</M> (about $6,000 per m²) and the loss has fallen from{' '}
        {fixed(loss(W0), 2)} to {fixed(L, 2)}, very close to the lowest possible loss for this data, 0.10 at <M>{'w = 6'}</M>. Nobody told the computer the
        answer: it only repeated four small moves.
      </>
    )
  } else if (stage === 0) {
    text = (
      <>
        <b>1. Predict.</b> Use the current line to predict every flat's price: <M>{`\\text{price} = ${fixed(w, 2)} \\times \\text{area}`}</M>. For the 130 m²
        flat: <M>{`${fixed(w, 2)} \\times 1.3 = ${fixed(w * xf, 2)}`}</M>, i.e. {money(w * xf)}.
      </>
    )
  } else if (stage === 1) {
    text = (
      <>
        <b>2. Measure.</b> Compare with the real prices. The 130 m² flat really sold for {money(yf)}, a miss of <M>{`${fixed(yf, 2)} - ${fixed(w * xf, 2)} = ${fixed(yf - w * xf, 2)}`}</M>,
        i.e. {money(yf - w * xf)}. Square every miss and average them: <M>{`\\text{MSE} = ${fixed(L, 2)}`}</M> (in the lesson's small units).
      </>
    )
  } else if (stage === 2) {
    text = (
      <>
        <b>3. Find the slope.</b> How does the loss change if <M>{'w'}</M> is nudged up a little? Here the slope is <M>{sStr}</M>:{' '}
        {s < 0 ? 'the loss would fall, so the line should get steeper (w up).' : 'the loss would rise, so the line should get flatter (w down).'}
      </>
    )
  } else {
    text = (
      <>
        <b>4. Nudge.</b> Step against the slope: <M>{`w_{\\text{new}} = ${fixed(w, 2)} - 0.1 \\times ${sTex} ${eq} ${fixed(wNew, 2)}`}</M>. The dashed line is the old line.
        Then the loop starts again.
      </>
    )
  }

  const lineEnd = 1.5
  return (
    <Figure
      title="The training loop: predict, measure, find the slope, nudge"
      caption={
        <>
          Press <b>Play</b> (or <b>Next</b> to go one stage at a time). Watch the four stages light up in turn and the red misses shrink. The loss
          chart drops quickly at first, then levels off as the slope flattens and the steps get smaller. Switch the speed to <b>fast</b> to see all {STEPS} loops.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.8rem 1.2rem', alignItems: 'center' }}>
        <div style={{ display: 'grid', justifyItems: 'center' }}>
          <LoopDiagram stage={stage} t={t} />
        </div>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.55, color: 'var(--ink)', minHeight: narrow ? 0 : '7.5em' }} aria-live="polite">
          {text}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={panelTitle}>The data and the current line</div>
          <Plot
            x={[0, 1.5]}
            y={[0, 9]}
            width={360}
            height={270}
            maxWidth={460}
            margin={{ left: 46, right: 12 }}
            ariaLabel={`Eight HDB flats, price against area, with the line price = ${fixed(lineW, 2)} times area`}
          >
            <Grid xTicks={6} yTicks={9} />
            <Axes xLabel="area (m²)" xTicks={3} hideYTicks tickFormat={(v) => String(Math.round(v * 100))} />
            <Axes yLabel="price" yTicks={4} hideXTicks tickFormat={(v) => (v === 0 ? '0' : `$${Math.round(v * 100)}k`)} />
            {stage === 3 && !finished && <Path points={[[0, 0], [lineEnd, lineEnd * w]]} color="var(--viz-muted)" width={2} dash="6 5" />}
            <Path points={[[0, 0], [lineEnd, lineEnd * lineW]]} color="var(--viz-1)" width={3} />
            {stage === 1 &&
              !finished &&
              AREA.map((x, j) => <Path key={j} points={[[x, PRICE[j]], [x, w * x]]} color="var(--viz-neg)" width={j === FOCUS ? 3 : 2} />)}
            {stage === 0 && !finished && <Dots points={AREA.map((x, j) => ({ x, y: w * x, r: j === FOCUS ? 5.5 : 4.5, hollow: true, color: 'var(--viz-1)' }))} />}
            {stage === 2 && !finished && (
              <>
                <Arrow from={[1.38, 1.38 * w]} to={[1.38, 1.38 * w + (s < 0 ? 1.4 : -1.4)]} color="var(--viz-3)" width={3} head={8} />
                <Label x={1.38} y={1.38 * w + (s < 0 ? 1.4 : -1.4)} dx={-6} dy={s < 0 ? -6 : 14} anchor="end" color="var(--viz-3)" size={12}>
                  {s < 0 ? 'steeper' : 'flatter'}
                </Label>
              </>
            )}
            <Dots points={AREA.map((x, j) => ({ x, y: PRICE[j], r: j === FOCUS && !finished ? 6 : 5, color: 'var(--viz-2)' }))} />
            {stage <= 1 && !finished && (
              <Label x={xf} y={yf} dx={-10} dy={-6} anchor="end" color="var(--viz-2)" size={12}>
                130 m² flat
              </Label>
            )}
          </Plot>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={panelTitle}>Loss after each step</div>
          <Plot x={[0, STEPS]} y={[0, 30]} width={360} height={270} maxWidth={460} margin={{ left: 40, right: 12 }} ariaLabel={`Loss after each training step; ${measured} measured so far, latest ${fixed(L, 2)}`}>
            <Grid xTicks={4} yTicks={5} />
            <Axes xLabel="step" yLabel="loss" xTicks={4} yTicks={3} />
            <HLine y={0.1} color="var(--viz-muted)" dash="3 4" width={1} />
            <Label x={STEPS} y={0.1} dx={-4} dy={-5} anchor="end" color="var(--ink-3)" size={12}>
              lowest possible
            </Label>
            {lossPts.length === 0 && (
              <Label x={STEPS / 2} y={17} anchor="middle" color="var(--ink-3)" size={12}>
                each Measure stage adds a point here
              </Label>
            )}
            {lossPts.length > 1 && <Path points={lossPts.map((p): [number, number] => [p.x, p.y])} color="var(--viz-1)" width={2} />}
            <Dots points={lossPts.map((p, j) => ({ ...p, r: j === lossPts.length - 1 ? 5.5 : 3.5, color: j === lossPts.length - 1 ? 'var(--viz-2)' : 'var(--viz-1)' }))} stroke="none" />
          </Plot>
        </div>
      </div>
      <PlayerControls player={player} label={() => (finished ? `${STEPS} steps done` : `step ${t + 1} · ${STAGES[stage].toLowerCase()}`)} />
      <Controls>
        <Segmented
          label="Speed"
          value={speed}
          onChange={setSpeed}
          options={[
            { value: 'slow', label: 'slow' },
            { value: 'fast', label: 'fast' },
          ]}
        />
      </Controls>
    </Figure>
  )
}

