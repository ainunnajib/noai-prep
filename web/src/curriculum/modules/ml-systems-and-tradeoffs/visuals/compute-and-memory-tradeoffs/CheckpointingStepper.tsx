import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'

/*
  Activation (gradient) checkpointing on a chain of n = 16 layers. a_i is layer i's output; each
  activation takes 1 unit of memory. Backward through layer i needs its input a_(i−1).
    off      : the forward pass keeps all 16 outputs; backward frees them one by one. Peak = n = 16.
    every s  : the forward pass keeps only the outputs at segment ends (a_s, a_2s, …): n/s units.
               Backward, segment by segment from the end: recompute the s − 1 outputs inside the
               segment from its checkpoint, then back-propagate through it, freeing as you go.
               Peak = n/s + (s − 1). Extra compute = (n/s)(s − 1) = n − n/s layer forwards.
    n = 16:  s = 2 → 8 + 1 = 9 units, +8 ;  s = 4 → 4 + 3 = 7 units, +12 ;  s = 8 → 2 + 7 = 9 units, +14.
*/

const N = 16
type St = 'none' | 'kept' | 'ckpt' | 'dropped' | 'recomputed' | 'freed'

interface Frame {
  act: St[] // index 1..N (0 unused)
  focus: number // layer being worked on
  phase: 'start' | 'fwd' | 'recompute' | 'bwd' | 'done'
  text: string
  mem: number
  extra: number
}

function buildFrames(s: number): Frame[] {
  const act: St[] = Array(N + 1).fill('none')
  const frames: Frame[] = []
  let extra = 0
  const mem = () => act.filter((a) => a === 'kept' || a === 'ckpt' || a === 'recomputed').length
  const push = (focus: number, phase: Frame['phase'], text: string) => frames.push({ act: act.slice(), focus, phase, text, mem: mem(), extra })
  push(0, 'start', 'Ready: nothing stored yet.')
  for (let i = 1; i <= N; i++) {
    if (s === 1) act[i] = 'kept'
    else act[i] = i % s === 0 ? 'ckpt' : 'dropped'
    push(i, 'fwd', s === 1 ? `Forward through layer ${i}: keep its output.` : i % s === 0 ? `Forward through layer ${i}: keep its output as a checkpoint.` : `Forward through layer ${i}: use its output, then throw it away.`)
  }
  for (let j = N / s - 1; j >= 0; j--) {
    const lo = j * s + 1
    const hi = (j + 1) * s
    if (s > 1) {
      for (let i = lo; i < hi; i++) act[i] = 'recomputed'
      extra += s - 1
      push(hi, 'recompute', `Recompute layers ${lo}–${hi - 1} from the checkpoint before them (${s - 1} extra forward steps).`)
    }
    for (let i = hi; i >= lo; i--) {
      act[i] = 'freed'
      push(i, 'bwd', `Backward through layer ${i}, then free its output.`)
    }
  }
  frames[frames.length - 1].phase = 'done'
  frames[frames.length - 1].text = 'Done: all gradients computed.'
  return frames
}

const COL: Record<St, string> = {
  none: 'transparent',
  kept: 'var(--viz-1)',
  ckpt: 'var(--viz-1)',
  dropped: 'var(--viz-muted)',
  recomputed: 'var(--viz-2)',
  freed: 'var(--viz-muted)',
}

export default function CheckpointingStepper() {
  const [s, setS] = useState(4)
  const frames = useMemo(() => buildFrames(s), [s])
  const player = usePlayer({ steps: frames.length, interval: 380 })
  const { setStep } = player
  useEffect(() => {
    setStep(N) // start at the end of the forward pass: the stored activations are visible at rest
  }, [s, setStep])
  const f = frames[Math.min(player.step, frames.length - 1)]
  const peak = Math.max(...frames.map((x) => x.mem))
  const totalExtra = frames[frames.length - 1].extra

  const [ref, measured] = useContainerWidth<HTMLDivElement>(560)
  const W = Math.max(300, Math.min(640, measured))
  const narrow = W < 460
  const pad = 6
  const cell = (W - 2 * pad) / N
  const bw = cell - (narrow ? 3 : 5)
  const H = 150
  const yAct = 30
  const yLayer = 68
  const yMem = 122
  const x0 = (i: number) => pad + (i - 1) * cell + (cell - bw) / 2

  return (
    <Figure
      wide
      title="Activation checkpointing: store less, recompute the rest"
      caption={
        <>
          A network of 16 layers; each square above a layer is its output (one unit of memory). Choose how often to keep a checkpoint and press Play. Grey outlines were thrown away after
          use; orange ones are recomputed during the backward pass. The bar at the bottom is memory in use, with the peak marked. Notice that checkpointing every 4 layers keeps the peak at{' '}
          <b>7</b> units instead of 16, for 12 extra layer-forwards, which is three quarters of one forward pass.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`${f.text} Memory in use ${f.mem} units, peak ${peak}.`}>
          <text x={pad} y={14} style={{ fill: 'var(--ink-2)', fontSize: 12, fontWeight: 750 }}>
            stored outputs
          </text>
          {Array.from({ length: N }, (_, k) => k + 1).map((i) => {
            const st = f.act[i]
            const isOn = st === 'kept' || st === 'ckpt' || st === 'recomputed'
            const c = COL[st]
            return (
              <g key={i}>
                {st !== 'none' && (
                  <rect
                    x={x0(i) + 1}
                    y={yAct}
                    width={bw - 2}
                    height={bw - 2 > 22 ? 22 : bw - 2}
                    rx={4}
                    style={{
                      fill: isOn ? `color-mix(in srgb, ${c} ${st === 'recomputed' ? 70 : 60}%, var(--surface))` : 'transparent',
                      stroke: isOn ? c : 'var(--viz-muted)',
                      strokeWidth: st === 'ckpt' ? 2.5 : 1.3,
                      strokeDasharray: isOn ? undefined : '3 3',
                      opacity: st === 'freed' ? 0.35 : 1,
                    }}
                  />
                )}
                {st === 'ckpt' && (
                  <path d={`M${x0(i) + bw / 2},${yAct - 2}l-4,-7l8,0Z`} style={{ fill: 'var(--viz-1)' }} />
                )}
                <rect
                  x={x0(i)}
                  y={yLayer}
                  width={bw}
                  height={26}
                  rx={5}
                  style={{
                    fill: f.focus === i ? (f.phase === 'bwd' ? 'color-mix(in srgb, var(--viz-4) 35%, var(--surface))' : f.phase === 'recompute' ? 'color-mix(in srgb, var(--viz-2) 35%, var(--surface))' : 'color-mix(in srgb, var(--viz-3) 35%, var(--surface))') : 'var(--surface-2)',
                    stroke: f.focus === i ? 'var(--ink)' : 'var(--rule)',
                    strokeWidth: f.focus === i ? 2 : 1,
                  }}
                />
                {(!narrow || i % 4 === 0 || i === 1) && (
                  <text x={x0(i) + bw / 2} y={yLayer + 13} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: narrow ? 10 : 11, fontWeight: 700 }}>
                    {i}
                  </text>
                )}
              </g>
            )
          })}
          <text x={pad} y={yLayer + 42} style={{ fill: 'var(--ink-2)', fontSize: 12, fontWeight: 750 }}>
            memory in use: {f.mem} {f.mem === 1 ? 'unit' : 'units'} (peak {peak})
          </text>
          {Array.from({ length: N }, (_, k) => k).map((k) => (
            <rect
              key={k}
              x={pad + k * cell + 1}
              y={yMem}
              width={cell - 2}
              height={16}
              rx={3}
              style={{
                fill: k < f.mem ? 'color-mix(in srgb, var(--viz-1) 65%, var(--surface))' : 'var(--surface-2)',
                stroke: 'var(--rule)',
                strokeWidth: 1,
              }}
            />
          ))}
          <line x1={pad + peak * cell} x2={pad + peak * cell} y1={yMem - 5} y2={yMem + 21} style={{ stroke: 'var(--bad)', strokeWidth: 2.5 }} />
        </svg>
      </div>
      <div style={{ width: '100%', minHeight: 40, fontSize: 14, color: 'var(--ink)', fontWeight: 650, lineHeight: 1.4 }} aria-live="polite">
        {f.text}
      </div>
      <PlayerControls player={player} label={(st) => `step ${st + 1} of ${frames.length}`} />
      <Controls>
        <Segmented
          label="Keep a checkpoint every"
          value={s}
          onChange={(v) => {
            player.pause()
            setS(v)
          }}
          options={[
            { value: 1, label: 'layer (off)' },
            { value: 2, label: '2 layers' },
            { value: 4, label: '4 layers' },
            { value: 8, label: '8 layers' },
          ]}
        />
      </Controls>
      <Readout
        items={[
          ['peak memory', `${peak} units${s > 1 ? ` = ${N / s} + ${s - 1}` : ''}`],
          ['vs no checkpointing', `${Math.round((1 - peak / N) * 100)}% less`],
          ['extra layer-forwards', `${totalExtra} (${(totalExtra / N).toFixed(2)} of a forward pass)`],
        ]}
      />
    </Figure>
  )
}
