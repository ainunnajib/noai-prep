import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Grid, Axes, Path, HLine, Label, useBump, mulberry32 } from '../../../../../kit'
import { trainToy, bestLoss, type Run } from './lrToy'
import { Legend, Note } from './ui'

/*
  One toy model (linear regression, mini-batch SGD, batch size 10) trained for 200 steps at 17
  learning rates from 0.0001 to 1 (four per factor of 10). Every curve is really computed in the
  browser. Explore mode highlights one curve in the family; mystery mode hides the family and asks
  the learner to find the learning rate of a hidden curve.
*/

const STEPS = 200
const BATCH = 10
const KS = Array.from({ length: 17 }, (_, k) => k)
const lrOf = (k: number) => Math.pow(10, -4 + k / 4)
const fmtLr = (lr: number) => String(Number(lr.toPrecision(2)))
const Y_TOP = 1.4

type Regime = 'slow' | 'good' | 'edge' | 'bouncy' | 'wild' | 'explodes'

function classify(run: Run, best: number): Regime {
  if (run.divergedAt !== null) return 'explodes'
  const tail = run.full.slice(30)
  const mx = Math.max(...tail)
  let ups = 0
  for (let i = 31; i < run.full.length; i++) if (run.full[i] > run.full[i - 1] * 1.05) ups++
  if (mx > 3) return 'wild'
  if (ups >= 40) return 'bouncy'
  if (ups >= 20) return 'edge'
  if (run.full[run.full.length - 1] - best > 0.05) return 'slow'
  return 'good'
}

const REGIME: Record<Regime, { label: string; colour: string; text: string }> = {
  slow: { label: 'too low', colour: 'var(--viz-5)', text: 'Tiny steps: a slow, almost straight decline that is still falling after 200 steps.' },
  good: { label: 'good', colour: 'var(--viz-pos)', text: 'A quick drop, then the curve flattens at the lowest loss this model can reach.' },
  edge: { label: 'on the edge', colour: 'var(--viz-6)', text: 'Fastest start of all, but the curve has started to twitch upwards now and then. Any higher and it bounces.' },
  bouncy: { label: 'too high', colour: 'var(--viz-2)', text: 'Steps overshoot the bottom of the valley: the loss jumps up and down instead of settling.' },
  wild: { label: 'far too high', colour: 'var(--viz-neg)', text: 'Wild jumps to huge values (far off the top of the chart). Training is not converging at all.' },
  explodes: { label: 'diverges', colour: 'var(--viz-neg)', text: 'Every step overshoots by more than the last: the loss grows exponentially and overflows to infinity (NaN) within a few steps.' },
}

// points up to where the curve first leaves the top of the chart; that last point is drawn at the top edge, so a
// diverging run is a line climbing out of the chart rather than a few pixels in a corner
const toPts = (full: number[]): [number, number][] => {
  const pts: [number, number][] = []
  for (let i = 0; i < full.length; i++) {
    const v = full[i]
    if (!Number.isFinite(v) || v > Y_TOP) {
      pts.push([i, Y_TOP * 1.02])
      break
    }
    pts.push([i, v])
  }
  return pts
}

const fmtBig = (v: number) => (v >= 1e4 ? `10^${Math.floor(Math.log10(v))}`.replace(/\^(\d+)/, (_, d: string) => [...d].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join('')) : v.toFixed(1))

/** Where the run first leaves the chart, and the biggest finite loss it reached. */
function exitOf(run: Run): { step: number; peak: number } | null {
  const i = run.full.findIndex((v) => !Number.isFinite(v) || v > Y_TOP)
  if (i < 0) return null
  const finite = run.full.filter((v) => Number.isFinite(v))
  return { step: i, peak: Math.max(...finite) }
}

export default function LRCurveFamily() {
  const [k, setK] = useState(9)
  const [mode, setMode] = useState<'explore' | 'mystery'>('explore')
  const [round, nextRound] = useBump()
  const [checked, setChecked] = useState<number | null>(null)
  const best = useMemo(() => bestLoss(), [])
  const runs = useMemo(() => KS.map((kk) => trainToy(lrOf(kk), BATCH, STEPS)), [])
  const regimes = useMemo(() => runs.map((r) => classify(r, best)), [runs, best])
  const hidden = useMemo(() => {
    const r = mulberry32(9001 + round * 7919)
    let h = Math.floor(r() * 17)
    if (round === 0) h = 5
    return h
  }, [round])

  const run = runs[k]
  const reg = REGIME[regimes[k]]
  const lr = lrOf(k)
  const finalLoss = run.divergedAt !== null ? 'NaN' : run.full[STEPS].toFixed(3)
  const exit = mode === 'explore' ? exitOf(run) : null
  const startNewMystery = () => {
    nextRound()
    setChecked(null)
  }

  let verdict: { tone: 'good' | 'bad' | 'info'; text: string } | null = null
  if (mode === 'mystery' && checked !== null) {
    const d = checked - hidden
    if (d === 0) verdict = { tone: 'good', text: `Exactly right: the mystery run used η = ${fmtLr(lrOf(hidden))} (${REGIME[regimes[hidden]].label}).` }
    else if (Math.abs(d) === 1)
      verdict = { tone: 'info', text: `Very close: the mystery run used η = ${fmtLr(lrOf(hidden))}, one notch ${d > 0 ? 'lower' : 'higher'} than yours. In practice you search learning rates in steps of about ×3, so this counts.` }
    else
      verdict = {
        tone: 'bad',
        text: `Not yet: your η = ${fmtLr(lrOf(checked))} is ${d > 0 ? 'too high' : 'too low'}. ${
          d > 0 ? 'Your curve is faster or jumpier than the mystery one.' : 'Your curve is slower or smoother than the mystery one.'
        } Move the slider and check again.`,
      }
  }

  return (
    <Figure
      title="Learning-rate fingerprints"
      caption={
        <>
          The same small model (linear regression trained with mini-batch gradient descent, 10 examples per step) trained from the same starting point with
          17 learning rates from 0.0001 to 1, four per factor of 10. Every curve is computed live in your browser. Slide the learning rate and watch the
          highlighted curve change shape; then switch to <b>Mystery</b> and identify a hidden run from its fingerprint.
        </>
      }
    >
      <Segmented
        label="Mode"
        value={mode}
        onChange={(m) => {
          setMode(m)
          setChecked(null)
        }}
        options={[
          { value: 'explore', label: 'Explore' },
          { value: 'mystery', label: 'Mystery curve' },
        ]}
      />
      <Plot x={[0, STEPS]} y={[0, Y_TOP]} width={560} height={300} minHeight={230} margin={{ left: 44, right: 14, top: 18 }} ariaLabel={`Training loss over 200 steps for learning rate ${fmtLr(lr)}`}>
        <Grid xTicks={5} yTicks={7} />
        <Axes xLabel="training step" yLabel="training loss" xTicks={5} yTicks={7} />
        <HLine y={best} color="var(--ink-3)" label={`best possible ${best.toFixed(2)}`} />
        {mode === 'explore' && KS.map((kk) => (kk === k ? null : <Path key={kk} points={toPts(runs[kk].full)} color="var(--viz-muted)" width={1.2} opacity={0.25} />))}
        {mode === 'mystery' && <Path points={toPts(runs[hidden].full)} color="var(--viz-4)" width={3} dash="7 5" />}
        <Path points={toPts(run.full)} color={reg.colour} width={3} />
        {exit && (
          <Label x={exit.step} y={Y_TOP} dx={exit.step < STEPS / 2 ? 6 : -6} dy={34} anchor={exit.step < STEPS / 2 ? 'start' : 'end'} color={reg.colour} size={12} weight={700}>
            {run.divergedAt !== null
              ? `↑ ${fmtBig(exit.peak)} by step ${run.divergedAt}, then NaN`
              : `↑ off the chart from step ${exit.step} (up to ${fmtBig(exit.peak)})`}
          </Label>
        )}
      </Plot>
      <Legend
        items={
          mode === 'explore'
            ? [
                { color: reg.colour, label: `η = ${fmtLr(lr)}` },
                { color: 'var(--viz-muted)', label: 'the other 16 learning rates', thin: true },
              ]
            : [
                { color: reg.colour, label: `your η = ${fmtLr(lr)}` },
                { color: 'var(--viz-4)', label: 'mystery run', dash: true },
              ]
        }
      />
      <Controls>
        <Slider
          label="learning rate η (log scale)"
          value={k}
          min={0}
          max={16}
          step={1}
          onChange={(v) => {
            setK(v)
            setChecked(null)
          }}
          format={(v) => fmtLr(lrOf(v))}
        />
        {mode === 'mystery' ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button primary onClick={() => setChecked(k)}>
              Check my guess
            </Button>
            <Button onClick={startNewMystery}>New mystery</Button>
          </div>
        ) : (
          <Readout
            items={[
              ['verdict', reg.label],
              ['loss after 200 steps', finalLoss],
            ]}
          />
        )}
      </Controls>
      {mode === 'explore' ? (
        <Note tone={regimes[k] === 'good' ? 'good' : regimes[k] === 'slow' || regimes[k] === 'edge' ? 'warn' : 'bad'}>
          <b>η = {fmtLr(lr)}:</b> {reg.text}
          {run.divergedAt !== null && <> Here the loss passed a million at step {run.divergedAt}, and training was stopped.</>}
        </Note>
      ) : verdict ? (
        <Note tone={verdict.tone}>{verdict.text}</Note>
      ) : (
        <Note>Match your curve (solid) to the dashed mystery curve: look at how fast it drops, whether it is still falling at step 200, and whether it jumps.</Note>
      )}
    </Figure>
  )
}
