import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Grid, Axes, Path, Label, Rect, VLine, usePlot, useNarrow } from '../../../../../kit'
import { LAMBDAS, RUNS } from './decayData'
import { Legend, Note } from './parts'

/*
  Weight decay and early stopping on REAL curves: a small MLP trained in PyTorch on 200 handwritten
  digits (see decayData.ts). Pick the weight decay, slide the patience. The star marks the
  checkpoint early stopping keeps; the shaded zone is training that never happens.
  Aha: both tools stop the model drifting into memorising noise; patience protects you from bumps.
*/

type Lam = (typeof LAMBDAS)[number]
const EPOCHS = 150
const Y_TOP = 1.0

function earlyStop(val: number[], patience: number) {
  let best = Infinity
  let bestE = 0
  let wait = 0
  for (let e = 1; e < val.length; e++) {
    if (val[e] < best) {
      best = val[e]
      bestE = e
      wait = 0
    } else {
      wait += 1
      if (wait >= patience) return { bestE, stopE: e }
    }
  }
  return { bestE, stopE: val.length - 1 }
}

function Star({ x, y, color }: { x: number; y: number; color: string }) {
  const { xs, ys } = usePlot()
  const cx = xs(x)
  const cy = ys(y)
  const pts: string[] = []
  for (let k = 0; k < 10; k++) {
    const rr = k % 2 === 0 ? 10 : 4.3
    const a = -Math.PI / 2 + (k * Math.PI) / 5
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`)
  }
  return <polygon points={pts.join(' ')} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
}

const pts = (arr: number[], cap = Infinity): [number, number][] => arr.map((v, i) => [i, Math.min(v, cap)])
const pct = (v: number) => `${(v * 100).toFixed(1)}%`

export default function DecayAndStop() {
  const [lam, setLam] = useState<Lam>(0)
  const [patience, setPatience] = useState(5)
  const [useES, setUseES] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)

  const run = RUNS[String(lam)]
  const ref = RUNS['0']
  const { bestE, stopE } = useMemo(() => (useES ? earlyStop(run.val, patience) : { bestE: EPOCHS, stopE: EPOCHS }), [run, patience, useES])
  const trueBest = useMemo(() => {
    let b = 1
    for (let e = 1; e <= EPOCHS; e++) if (run.val[e] < run.val[b]) b = e
    return b
  }, [run])
  const keepE = useES ? bestE : EPOCHS
  const gapEnd = run.val[EPOCHS] - run.train[EPOCHS]

  let verdict: { tone: 'plain' | 'good' | 'bad' | 'warn'; text: string }
  if (lam === 0)
    verdict = {
      tone: 'bad',
      text: `No weight decay: the weights keep growing (norm ${run.norm[0].toFixed(1)} → ${run.norm[EPOCHS].toFixed(1)}) while training loss heads to ${run.train[EPOCHS].toFixed(3)} and validation loss climbs from ${run.val[trueBest].toFixed(3)} (epoch ${trueBest}) to ${run.val[EPOCHS].toFixed(3)}. Classic overfitting.`,
    }
  else if (lam >= 0.03)
    verdict = {
      tone: 'warn',
      text: `Too much decay: the weights are squeezed (norm ${run.norm[EPOCHS].toFixed(1)}) and even the training loss stays high (${run.train[EPOCHS].toFixed(3)}). The model now underfits: validation loss never gets below ${run.val[trueBest].toFixed(3)}.`,
    }
  else
    verdict = {
      tone: 'good',
      text: `With λ = ${lam}, the weight norm levels off at about ${run.norm[EPOCHS].toFixed(1)} (versus ${ref.norm[EPOCHS].toFixed(1)} without decay) and validation loss ends at ${run.val[EPOCHS].toFixed(3)} instead of ${ref.val[EPOCHS].toFixed(3)}: the overfitting gap is ${gapEnd.toFixed(3)} rather than ${(ref.val[EPOCHS] - ref.train[EPOCHS]).toFixed(3)}.`,
    }

  const esNote = !useES
    ? `Early stopping is off: you train all ${EPOCHS} epochs and keep the last weights (validation loss ${run.val[EPOCHS].toFixed(3)}).`
    : bestE !== trueBest && run.val[bestE] > run.val[trueBest] + 0.003
      ? `Patience ${patience} gave up at epoch ${stopE} after a temporary bump. It keeps epoch ${bestE} (validation loss ${run.val[bestE].toFixed(3)}), but a better epoch (${trueBest}, ${run.val[trueBest].toFixed(3)}) came later. More patience would have found it.`
      : `Validation loss did not improve for ${patience} epoch${patience > 1 ? 's' : ''} after epoch ${bestE}, so training stopped at epoch ${stopE} and the epoch-${bestE} checkpoint is restored (validation loss ${run.val[bestE].toFixed(3)}). ${EPOCHS - stopE} epochs of training were saved.`

  const W = narrow ? 360 : 600
  return (
    <Figure
      title="Weight decay and early stopping on real training curves"
      caption={
        <>
          Real curves from training a small network (two hidden layers of 128) on 200 handwritten digits in PyTorch, checked on 600 other digits.
          Start with <b>λ = 0</b>: training loss dives to zero, validation loss bottoms out and then climbs, and the weights keep growing. Now raise
          λ: the weight norm levels off and the climb flattens. Slide <b>patience</b> down to 1 and watch early stopping quit at a bump; push λ to
          0.03 to see too much decay cause underfitting.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.6rem', justifyItems: 'center' }}>
        <Segmented
          label="Weight decay λ"
          value={lam}
          onChange={setLam}
          options={LAMBDAS.map((l) => ({ value: l, label: String(l) }))}
        />
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>Loss (cross-entropy) per epoch</div>
        <Plot
          x={[0, EPOCHS]}
          y={[0, Y_TOP]}
          width={W}
          height={narrow ? 240 : 250}
          minHeight={200}
          maxWidth={720}
          margin={{ left: 42, right: 14, top: 16 }}
          ariaLabel={`Training and validation loss over ${EPOCHS} epochs with weight decay ${lam}. Validation loss is lowest at epoch ${trueBest}. ${useES ? `Early stopping with patience ${patience} stops at epoch ${stopE} and keeps epoch ${bestE}.` : 'Early stopping is off.'}`}
        >
          <Grid xTicks={narrow ? 3 : 10} yTicks={5} />
          {useES && stopE < EPOCHS && <Rect x0={stopE} x1={EPOCHS} y0={0} y1={Y_TOP} fill="color-mix(in srgb, var(--viz-muted) 16%, transparent)" />}
          <Axes xLabel="epoch" xTicks={narrow ? 3 : 10} yTicks={5} />
          {lam !== 0 && <Path points={pts(ref.val, Y_TOP * 1.05)} color="var(--viz-2)" width={1.6} dash="4 4" opacity={0.55} />}
          <Path points={pts(run.train, Y_TOP * 1.05)} color="var(--viz-1)" width={2.4} />
          <Path points={pts(run.val, Y_TOP * 1.05)} color="var(--viz-2)" width={2.4} />
          {useES && stopE < EPOCHS && <VLine x={stopE} color="var(--viz-ink)" dash="5 4" width={1.6} />}
          {useES && stopE < EPOCHS && (
            <Label x={stopE} y={Y_TOP} dx={stopE > 110 ? -6 : 6} dy={14} anchor={stopE > 110 ? 'end' : 'start'} size={12} weight={700}>
              {`stop @ ${stopE}`}
            </Label>
          )}
          <Star x={keepE} y={Math.min(run.val[keepE], Y_TOP)} color="var(--highlight)" />
          <Label x={EPOCHS} y={Math.min(run.val[EPOCHS], Y_TOP)} dx={-4} dy={-9} anchor="end" color="var(--viz-2)" size={12} weight={700}>
            validation
          </Label>
          <Label x={EPOCHS} y={run.train[EPOCHS]} dx={-4} dy={-8} anchor="end" color="var(--viz-1)" size={12} weight={700}>
            training
          </Label>
        </Plot>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>Size of the weights ‖W‖ per epoch</div>
        <Plot
          x={[0, EPOCHS]}
          y={[6, 16]}
          width={W}
          height={130}
          minHeight={120}
          maxWidth={720}
          margin={{ left: 42, right: 14, top: 10 }}
          ariaLabel={`Weight norm grows from ${run.norm[0]} to ${run.norm[EPOCHS]} with weight decay ${lam}.`}
        >
          <Grid xTicks={narrow ? 3 : 10} yTicks={narrow ? 2 : 4} />
          {useES && stopE < EPOCHS && <Rect x0={stopE} x1={EPOCHS} y0={6} y1={16} fill="color-mix(in srgb, var(--viz-muted) 16%, transparent)" />}
          <Axes xLabel="epoch" xTicks={narrow ? 3 : 10} yTicks={narrow ? 2 : 4} />
          {lam !== 0 && <Path points={pts(ref.norm)} color="var(--viz-5)" width={1.6} dash="4 4" opacity={0.55} />}
          <Path points={pts(run.norm)} color="var(--viz-5)" width={2.4} />
          <Star x={keepE} y={run.norm[keepE]} color="var(--highlight)" />
        </Plot>
        <Legend
          items={[
            { color: 'var(--viz-1)', label: 'training loss' },
            { color: 'var(--viz-2)', label: 'validation loss' },
            { color: 'var(--viz-5)', label: 'weight norm' },
            ...(lam !== 0 ? [{ color: 'var(--viz-muted)', label: 'λ = 0 for comparison', dash: true }] : []),
            { color: 'var(--highlight)', label: 'checkpoint kept', dot: true },
          ]}
        />
        <Note tone={verdict.tone}>{verdict.text}</Note>
        <Note>{esNote}</Note>
      </div>
      <Controls>
        <Toggle label="Early stopping" checked={useES} onChange={setUseES} />
        <Slider label="Patience (epochs)" value={patience} min={1} max={30} step={1} onChange={setPatience} />
        <Readout
          items={[
            ['kept epoch', String(keepE)],
            ['val loss there', run.val[keepE].toFixed(3)],
            ['val accuracy there', pct(run.valAcc[keepE])],
          ]}
        />
      </Controls>
    </Figure>
  )
}
