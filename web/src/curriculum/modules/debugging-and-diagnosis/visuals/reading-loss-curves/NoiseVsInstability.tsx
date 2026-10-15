import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Path, HLine } from '../../../../../kit'
import { trainToy, bestLoss, ema } from './lrToy'
import { Legend, Note } from './ui'

/*
  Raw per-batch loss versus a smoothed curve (exponential moving average, like TensorBoard's
  smoothing slider), for the same toy model as the fingerprint figure. Small batches make the raw
  curve jagged even when training is perfectly healthy; a learning rate that is too high for the
  batch size makes the smoothed curve itself jump.
*/

const STEPS = 300
const BATCHES = [1, 4, 20, 200] as const
const LRS = [0.01, 0.03, 0.1, 0.2] as const
const Y_TOP = 2

export default function NoiseVsInstability() {
  const [bs, setBs] = useState<number>(4)
  const [lr, setLr] = useState<number>(0.03)
  const [beta, setBeta] = useState(0.9)
  const best = useMemo(() => bestLoss(), [])
  const run = useMemo(() => trainToy(lr, bs, STEPS), [lr, bs])
  const smooth = useMemo(() => ema(run.batch, beta), [run, beta])

  const raw: [number, number][] = run.batch.map((v, i) => [i + 1, Number.isFinite(v) ? Math.min(v, 50) : 50])
  const sm: [number, number][] = smooth.map((v, i) => [i + 1, Number.isFinite(v) ? Math.min(v, 50) : 50])
  if (run.divergedAt !== null) {
    raw.push([run.divergedAt, 50])
    sm.push([run.divergedAt, 50])
  }

  // verdict from the numbers, not from the settings
  const tailRaw = run.batch.slice(-100)
  const mean = tailRaw.reduce((a, b) => a + b, 0) / tailRaw.length
  const sd = Math.sqrt(tailRaw.reduce((a, b) => a + (b - mean) * (b - mean), 0) / tailRaw.length)
  const emaTail = ema(run.batch, 0.9).slice(-150)
  const emaMax = Math.max(...emaTail)
  let tone: 'good' | 'warn' | 'bad'
  let text: string
  if (run.divergedAt !== null) {
    tone = 'bad'
    text = `Unstable: with only ${bs} example${bs === 1 ? '' : 's'} per step, η = ${lr} is far too big. One unlucky batch sends the weights flying and the loss passes a million by step ${run.divergedAt}, where training is stopped.`
  } else if (emaMax > 0.6) {
    tone = 'bad'
    text = `Unstable: even the smoothed curve jumps (up to ${emaMax.toFixed(2)}). Smoothing hides noise, not instability. Lower the learning rate or use bigger batches.`
  } else if (sd > 0.08) {
    tone = 'good'
    text = `Noisy but healthy: each point is the loss on just ${bs} example${bs === 1 ? '' : 's'}, so the raw curve is jagged, but the smoothed curve settles near the best possible loss. Nothing to fix.`
  } else {
    tone = 'good'
    text = bs === 200 ? 'Full batch: every step sees all 200 examples, so the curve is perfectly smooth (but each step costs 200 examples of work).' : 'Smooth and healthy: batches this big average away most of the noise.'
  }

  return (
    <Figure
      title="Noisy or unstable?"
      caption={
        <>
          The thin line is the loss of each mini-batch as it was trained on, which is what most training scripts log. The thick line smooths it with an
          exponential moving average. Make the batches smaller and the thin line gets jagged without anything being wrong. Then raise the learning rate:
          at some point the thick line itself starts to jump, and that is a real problem. Notice that the same learning rate can be fine with batches of 20
          and unstable with batches of 1.
        </>
      }
    >
      <Plot x={[0, STEPS]} y={[0, Y_TOP]} width={560} height={280} minHeight={220} margin={{ left: 44, right: 14, top: 18 }} ariaLabel={`Per-batch loss and smoothed loss, batch size ${bs}, learning rate ${lr}`}>
        <Grid xTicks={6} yTicks={4} />
        <Axes xLabel="training step" yLabel="loss" xTicks={6} yTicks={4} />
        <Path points={raw} color="var(--viz-1)" width={1.2} opacity={0.4} />
        <HLine y={best} color="var(--ink-3)" label="best possible" />
        <Path points={sm} color="var(--viz-2)" width={3} />
      </Plot>
      <Legend
        items={[
          { color: 'var(--viz-1)', label: 'raw batch loss', thin: true, faint: true },
          { color: 'var(--viz-2)', label: `smoothed (β = ${beta.toFixed(2)})` },
        ]}
      />
      <Controls>
        <Segmented label="batch size" value={bs} onChange={setBs} options={BATCHES.map((b) => ({ value: b, label: b === 200 ? '200 (all)' : String(b) }))} />
        <Segmented label="learning rate η" value={lr} onChange={setLr} options={LRS.map((v) => ({ value: v, label: String(v) }))} />
        <Slider label="smoothing β" value={beta} min={0} max={0.99} step={0.01} onChange={setBeta} format={(v) => v.toFixed(2)} />
        <Readout
          items={[
            ['spread of raw loss', run.divergedAt !== null ? 'huge' : sd.toFixed(3)],
            ['smoothed, last step', run.divergedAt !== null ? '> 10⁶ (stopped)' : smooth[smooth.length - 1].toFixed(3)],
          ]}
        />
      </Controls>
      <Note tone={tone}>{text}</Note>
    </Figure>
  )
}
