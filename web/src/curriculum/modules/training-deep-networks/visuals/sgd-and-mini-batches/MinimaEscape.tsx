import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Button, Plot, Grid, Axes, FnPath, Label, VLine, usePlot, useNarrow, useAnimationFrame, useBump, mulberry32 } from '../../../../../kit'
import { trainLoss, trainSlope, W_SHARP, W_FLAT, C_SHARP, C_FLAT, BARRIER } from './landscape'

/*
  30 balls run noisy gradient descent on the sharp/flat landscape:
      w ← w − η·(L′(w) + noise),   noise ~ Normal(0, σ²/B)
  Half start in the sharp pit, half in the flat basin. Large η makes the sharp pit unstable
  (η > 2/c), and small batches (big noise) kick balls out of the narrow pit.
*/

const X: [number, number] = [-3, 3]
const Y: [number, number] = [0, 3.6]
const BALLS = 30
const STEPS = 400
const SIGMA1 = 6
const B_CHOICES = [1, 2, 4, 8, 16, 32, 64, 128, 256]
const SHIFT = 0.25

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-12)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

function startPositions() {
  const out: number[] = []
  for (let k = 0; k < BALLS / 2; k++) out.push(W_SHARP - 0.35 + (0.7 * (k + 0.5)) / (BALLS / 2))
  for (let k = 0; k < BALLS / 2; k++) out.push(W_FLAT - 1.3 + (2.6 * (k + 0.5)) / (BALLS / 2))
  return out
}

/** trajectories[t][k] = position of ball k after t steps */
function simulate(eta: number, B: number, seed: number) {
  const r = mulberry32(seed)
  const sigma = SIGMA1 / Math.sqrt(B)
  let w = startPositions()
  const traj: number[][] = [w]
  for (let t = 0; t < STEPS; t++) {
    w = w.map((v) => Math.max(-4, Math.min(4, v - eta * (trainSlope(v) + sigma * gauss(r)))))
    traj.push(w)
  }
  return traj
}

function Balls({ ws, colourOf }: { ws: number[]; colourOf: (w: number) => string }) {
  const { xs, ys, clipId } = usePlot()
  return (
    <g clipPath={`url(#${clipId})`}>
      {ws.map((w, k) => (
        <circle key={k} cx={xs(w)} cy={ys(Math.min(Y[1], trainLoss(w))) - 6} r={6} style={{ fill: colourOf(w), stroke: 'var(--surface)', strokeWidth: 1.5, opacity: 0.8 }} />
      ))}
    </g>
  )
}

function Aside({ children }: { children: ReactNode }) {
  return <p style={{ color: 'var(--ink-2)', fontSize: 'var(--step--1)', margin: 0, width: '100%' }}>{children}</p>
}

export default function MinimaEscape() {
  const [eta, setEta] = useState(0.05)
  const [bi, setBi] = useState(B_CHOICES.length - 1)
  const [seed, bump] = useBump()
  const [frame, setFrame] = useState(STEPS)
  const [playing, setPlaying] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const B = B_CHOICES[bi]
  const traj = useMemo(() => simulate(eta, B, 17 + seed * 101), [eta, B, seed])

  useAnimationFrame((dt) => {
    setFrame((f) => {
      const nf = Math.min(STEPS, f + Math.max(1, Math.round(dt * 110)))
      if (nf >= STEPS) setPlaying(false)
      return nf
    })
  }, playing)

  const ws = traj[frame]
  const inSharp = ws.filter((w) => w < BARRIER).length
  const testAvg = ws.reduce((s, w) => s + trainLoss(w - SHIFT), 0) / BALLS
  const colourOf = (w: number) => (w < BARRIER ? 'var(--viz-4)' : 'var(--viz-3)')
  const etaC = eta * C_SHARP
  const reset = () => {
    setPlaying(false)
    setFrame(STEPS)
  }

  return (
    <Figure
      title="Why noisy training ends up in flat valleys"
      caption={
        <>
          Thirty balls start in the two valleys (15 in each) and each runs {STEPS} steps of noisy gradient descent; the dots show where they
          are after training, and the readout gives their average test loss. With a small learning rate and big batches nothing moves out
          (test loss about 0.7). Now <b>raise the learning rate</b> above 2 ÷ 24 ≈ 0.083, the sharp pit&apos;s speed limit from the gradient
          descent lesson: every ball is thrown out of the narrow pit and settles in the wide basin (whose limit is 2 ÷ 1.2 ≈ 1.7), and the
          test loss roughly halves. <b>Lowering the batch size</b> does something similar through bigger random kicks, but only in
          moderation: at B = 1 the balls rattle all over the basin and the test loss climbs again. Press <b>Replay</b> to watch it happen.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot x={X} y={Y} width={narrow ? 360 : 520} height={narrow ? 270 : 290} maxWidth={660} minHeight={230} ariaLabel={`${inSharp} balls in the sharp valley and ${BALLS - inSharp} in the flat valley after ${frame} steps`}>
          <Grid xTicks={6} yTicks={4} />
          <Axes xLabel="parameter w" yLabel="loss" xTicks={6} yTicks={4} />
          <VLine x={BARRIER} color="var(--viz-muted)" dash="3 4" width={1} />
          <FnPath f={trainLoss} color="var(--viz-1)" width={2.6} samples={400} />
          <Balls ws={ws} colourOf={colourOf} />
          <Label x={W_SHARP} y={Y[1]} dy={14} anchor="middle" weight={700} color="var(--viz-4)">
            {`sharp: ${inSharp}`}
          </Label>
          <Label x={W_FLAT} y={Y[1]} dy={14} anchor="middle" weight={700} color="var(--viz-3)">
            {`flat: ${BALLS - inSharp}`}
          </Label>
        </Plot>
      </div>
      <Controls>
        <Slider label="learning rate η" value={eta} min={0.01} max={0.12} step={0.01} onChange={(v) => { setEta(v); reset() }} format={(v) => v.toFixed(2)} />
        <Slider label="batch size B (smaller = noisier)" value={bi} min={0} max={B_CHOICES.length - 1} step={1} onChange={(v) => { setBi(v); reset() }} format={(v) => String(B_CHOICES[v])} />
      </Controls>
      <Controls>
        <Button primary onClick={() => { setFrame(0); setPlaying(true) }}>{playing ? 'Training…' : 'Replay training'}</Button>
        <Button onClick={() => { bump(); reset() }}>New random noise</Button>
      </Controls>
      <Readout
        items={[
          ['training step', `${frame} of ${STEPS}`],
          ['η × c (sharp pit)', `${eta.toFixed(2)} × ${C_SHARP} = ${etaC.toFixed(2)}`],
          ['sharp pit', etaC < 2 ? 'stable (below 2)' : 'unstable (above 2)'],
          ['η × c (flat basin)', `${(eta * C_FLAT).toFixed(3)}`],
          [`average test loss (shift ${SHIFT})`, testAvg.toFixed(2)],
        ]}
      />
      <Aside>
        Noise in each step grows with η and shrinks with √B, so a smaller batch or a larger learning rate both mean a bumpier ride.
      </Aside>
    </Figure>
  )
}
