import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, usePlayer, PlayerControls, Plot, Grid, Axes, Path, HLine, Label } from '../../../../../kit'
import { trainCurve, sliceGradients, BASE_B, BASE_LR, EPOCHS, NS } from './ddpSim'

/*
  Data-parallel training, step by step, plus the effect of the linear learning-rate scaling rule.
  Top: N GPUs each hold a full copy of the model and take b examples of the batch; each computes its
  own gradient (real numbers from the toy regression in ddpSim.ts, for the weight w₂ at w = 0); an
  all-reduce averages them; every GPU applies the same update, so the copies stay identical.
  Bottom: loss per epoch for 1 GPU (batch 32, LR 0.05) and for your set-up, simulated with ddpSim.ts.
*/

const PHASES = ['1. Split the batch', '2. Forward + backward on each GPU', '3. All-reduce: average the gradients', '4. Same update on every GPU']
const SLICE_COL = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)', 'var(--viz-1)', 'var(--viz-2)']
const TARGET = 0.02
const LOG_TOP = 0.6

const f2 = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2)
const f3 = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(3)

export default function DataParallelDiagram() {
  const [N, setN] = useState(4)
  const [b, setB] = useState(32)
  const [scale, setScale] = useState(true)
  const player = usePlayer({ steps: PHASES.length, interval: 1300 })
  const { setStep } = player
  useEffect(() => setStep(PHASES.length - 1), [setStep]) // complete at rest; Play restarts from the split
  const phase = player.step

  const B = N * b
  const lr = scale ? (BASE_LR * B) / BASE_B : BASE_LR
  const grads = useMemo(() => sliceGradients(N, b), [N, b])
  const avg = grads.reduce((s, g) => s + g, 0) / N
  const base = useMemo(() => trainCurve(BASE_B, BASE_LR), [])
  const mine = useMemo(() => trainCurve(B, lr), [B, lr])
  const hit = (c: number[]) => c.findIndex((v) => v <= TARGET)
  const eBase = hit(base)
  const eMine = hit(mine)
  const diverged = mine.some((v) => !Number.isFinite(v))
  const speedup = eMine > 0 ? (eBase / eMine) * N : null
  const toLog = (v: number) => (Number.isFinite(v) ? Math.min(LOG_TOP, Math.log10(Math.max(v, 1e-3))) : LOG_TOP)

  return (
    <Figure
      wide
      title="Data-parallel training: split the batch, average the gradients"
      caption={
        <>
          Press Play to step through one training step on {N} GPU{N > 1 ? 's' : ''}. Each GPU computes a gradient on its own slice; the all-reduce replaces them all by their average,
          which is exactly the gradient of the whole batch of {B}. Below, compare the loss per epoch with one GPU (grey). Switch the learning-rate scaling off and a bigger effective batch falls
          behind: a batch of B takes B/32 times fewer steps per epoch than batch 32, each of the same size. With 8 GPUs × 128 the scaled rate becomes too big and training blows up. (w₂ is one of the model's weights, starting at 0; the speed-up shown ignores the time the all-reduce takes.)
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gap: 8 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }} aria-live="polite">
          {PHASES[phase]}
        </div>
        {/* the batch, split into slices */}
        <div style={{ display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--rule)' }} role="img" aria-label={`A batch of ${B} examples split into ${N} slices of ${b}`}>
          {grads.map((_, k) => (
            <div
              key={k}
              style={{
                flex: 1,
                background: `color-mix(in srgb, ${SLICE_COL[k]} ${phase >= 0 ? 55 : 20}%, var(--surface))`,
                borderRight: k < N - 1 ? '2px solid var(--surface)' : undefined,
                display: 'grid',
                placeItems: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--ink)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {N <= 4 ? `${b} examples` : b}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${N <= 4 ? N : 4}, minmax(0, 1fr))`, gap: 6 }}>
          {grads.map((g, k) => (
            <div
              key={k}
              style={{
                borderRadius: 9,
                border: `1.5px solid ${SLICE_COL[k]}`,
                background: `color-mix(in srgb, ${SLICE_COL[k]} 8%, var(--surface))`,
                padding: '4px 6px',
                fontSize: 12,
                lineHeight: 1.35,
                textAlign: 'center',
                minWidth: 0,
              }}
            >
              <div style={{ fontWeight: 800, color: 'var(--ink)' }}>GPU {k}</div>
              <div style={{ color: 'var(--ink-3)' }}>full model copy</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: phase >= 1 ? 'var(--ink)' : 'var(--ink-3)', fontWeight: 700, opacity: phase >= 1 ? 1 : 0.35 }}>
                g = {phase >= 2 ? f2(avg) : phase >= 1 ? f2(g) : '…'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', color: phase >= 3 ? 'var(--ok)' : 'var(--ink-3)', fontWeight: 700, opacity: phase >= 3 ? 1 : 0.35 }}>w₂ = {phase >= 3 ? f3(-lr * avg) : '0.000'}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            borderRadius: 8,
            padding: '0.35rem 0.6rem',
            fontSize: 12.5,
            lineHeight: 1.45,
            background: phase === 2 ? 'var(--accent-soft)' : 'var(--surface-2)',
            border: `1.5px ${phase === 2 ? 'solid var(--accent)' : 'dashed var(--rule)'}`,
            color: 'var(--ink-2)',
          }}
        >
          <b style={{ color: 'var(--ink)' }}>all-reduce:</b>{' '}
          {phase < 2 ? (
            'waits until every GPU has its gradient'
          ) : (
            <>
              average ={' '}
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                ({grads.map(f2).join(' + ')}) / {N} = <b style={{ color: 'var(--ink)' }}>{f2(avg)}</b>
              </span>
            </>
          )}
          {phase >= 3 && (
            <>
              {' '}
              → update <span style={{ fontFamily: 'var(--font-mono)' }}>w₂ ← 0 − {lr.toFixed(2)} × {f2(avg)} = {f3(-lr * avg)}</span> on every GPU
            </>
          )}
        </div>
      </div>
      <PlayerControls player={player} label={(s) => `phase ${s + 1} of ${PHASES.length}`} />

      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 650 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, height: 5, borderRadius: 3, background: 'var(--viz-muted)' }} />1 GPU, batch 32, learning rate 0.05
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, height: 4, borderRadius: 2, background: diverged ? 'var(--viz-neg)' : 'var(--viz-1)' }} />
          your set-up: {N} GPU{N > 1 ? 's' : ''} × {b}, learning rate {lr.toFixed(2)}
        </span>
      </div>
      <Plot x={[0, EPOCHS]} y={[-2.6, LOG_TOP]} width={600} height={230} minHeight={200} margin={{ left: 48, right: 14, top: 26, bottom: 34 }} ariaLabel="Loss per epoch, log scale, for one GPU and for your data-parallel set-up">
        <Grid xTicks={10} yTicks={4} />
        <Axes xLabel="epoch" yLabel="loss above the best (log scale)" xTicks={5} hideYTicks />
        {[-2, -1, 0].map((v) => (
          <Label key={v} x={0} y={v} dx={-7} dy={4} anchor="end" size={12} color="var(--ink-3)">
            {String(10 ** v)}
          </Label>
        ))}
        <HLine y={Math.log10(TARGET)} color="var(--viz-3)" dash="5 4" width={1.4} label="target" />
        <Path points={base.map((v, e) => [e, toLog(v)])} color="var(--viz-muted)" width={7} opacity={0.7} />
        <Path points={mine.map((v, e) => [e, toLog(v)])} color={diverged ? 'var(--viz-neg)' : 'var(--viz-1)'} width={2.5} />
        {diverged && (
          <Label x={4} y={LOG_TOP} dy={22} color="var(--viz-neg)" weight={800} size={12.5}>
            diverged: LR {lr.toFixed(2)} is too big
          </Label>
        )}
      </Plot>

      <Controls>
        <Segmented label="GPUs" value={N} onChange={setN} options={[1, 2, 4, 8].map((v) => ({ value: v, label: String(v) }))} />
        <Segmented label="Batch per GPU (b)" value={b} onChange={setB} options={[32, 64, 128].map((v) => ({ value: v, label: String(v) }))} />
        <Toggle label="scale the learning rate with the batch" checked={scale} onChange={setScale} />
      </Controls>
      <Readout
        items={[
          ['effective batch', `${N} × ${b} = ${B}`],
          ['learning rate', scale ? `0.05 × ${B}/32 = ${lr.toFixed(2)}` : `${lr.toFixed(2)} (not scaled)`],
          ['updates per epoch', `${NS} / ${B} = ${NS / B}`],
          ['time to target vs 1 GPU', diverged ? 'never (diverged)' : speedup ? `${speedup.toFixed(1)}× faster (ideal)` : `not within ${EPOCHS} epochs`],
        ]}
      />
    </Figure>
  )
}
