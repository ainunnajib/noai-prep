import { useMemo, useRef, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Grid, Axes, Path, Dots, VLine, DraggablePoint, mulberry32, usePlot } from '../../../../../kit'
import s from './pc.module.css'

/*
  The line plot you will draw most in AI: loss against epoch, for the training data and for
  held-out validation data. Four typical shapes; drag the marker along the epochs to read both
  losses and find where validation loss is lowest (where early stopping would stop).
*/

type Scenario = 'healthy' | 'lr' | 'overfit' | 'underfit'
const EPOCHS = Array.from({ length: 40 }, (_, i) => i + 1)

function curves(sc: Scenario) {
  const rnd = mulberry32({ healthy: 11, lr: 22, overfit: 33, underfit: 44 }[sc])
  const jit = (a: number) => (rnd() - 0.5) * 2 * a
  const tr: number[] = []
  const va: number[] = []
  for (const e of EPOCHS) {
    if (sc === 'healthy') {
      tr.push(0.25 + 1.95 * Math.exp(-e / 7) + jit(0.012))
      va.push(0.33 + 1.9 * Math.exp(-e / 7.5) + jit(0.018))
    } else if (sc === 'lr') {
      const t = 1.05 + 0.3 * Math.exp(-e / 10) + 0.5 * Math.abs(Math.sin(1.7 * e)) + jit(0.1)
      tr.push(t)
      va.push(t + 0.07 + jit(0.05))
    } else if (sc === 'overfit') {
      tr.push(0.04 + 2.1 * Math.exp(-e / 6) + jit(0.01))
      va.push(0.55 + 1.6 * Math.exp(-e / 5) + 0.022 * Math.max(0, e - 9) + jit(0.012))
    } else {
      tr.push(1.25 + 0.9 * Math.exp(-e / 4) + jit(0.012))
      va.push(1.32 + 0.9 * Math.exp(-e / 4) + jit(0.015))
    }
  }
  return { tr, va }
}

const clampEpoch = (x: number) => Math.max(1, Math.min(40, Math.round(x)))

/** A transparent layer over the plot: press or drag anywhere to move the marker to that epoch. */
function ScrubArea({ onEpoch }: { onEpoch: (e: number) => void }) {
  const { xs, ys, toData } = usePlot()
  const down = useRef(false)
  const [x0, x1] = xs.range()
  const [yb, yt] = ys.range()
  const go = (cx: number, cy: number) => onEpoch(clampEpoch(toData(cx, cy)[0]))
  return (
    <rect
      x={x0}
      y={yt}
      width={x1 - x0}
      height={yb - yt}
      style={{ fill: 'transparent', cursor: 'ew-resize' }}
      onPointerDown={(e) => {
        down.current = true
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
        go(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => down.current && go(e.clientX, e.clientY)}
      onPointerUp={() => (down.current = false)}
      onPointerCancel={() => (down.current = false)}
    />
  )
}

/** The epoch label as a small pill beside the marker, on a surface background so curves never run through it. */
function MarkerPill({ ep, v }: { ep: number; v: number }) {
  const { xs, ys } = usePlot()
  const text = `epoch ${ep}`
  const w = text.length * 7.2 + 12
  const h = 20
  const cx = xs(ep)
  const cy = ys(v)
  const left = ep > 8 // room on the left: put the pill up and to the left of the dot
  const x = left ? cx - 12 - w : cx + 12
  const above = cy - 14 - h > ys.range()[1]
  const y = above ? cy - 14 - h : cy + 14
  return (
    <g style={{ pointerEvents: 'none' }} aria-hidden="true">
      <rect x={x} y={y} width={w} height={h} rx={10} style={{ fill: 'var(--surface)', stroke: 'var(--viz-2)', strokeWidth: 1.5 }} />
      <text x={x + w / 2} y={y + h / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink)' }}>
        {text}
      </text>
    </g>
  )
}

const STORY: Record<Scenario, string> = {
  healthy: 'Both curves fall quickly, then level off close together. The model has learned what it can; the small gap between them is normal.',
  lr: 'The training loss jumps up and down instead of falling smoothly. Each update step is too big and overshoots the minimum, so the usual first fix is a smaller learning rate.',
  overfit:
    'Training loss keeps falling, but validation loss bottoms out and then climbs. After that point the model is memorising the training data rather than learning patterns that carry over to new data: it is overfitting.',
  underfit: 'Both losses stay high and close together. The model is too simple (or trained too little) to capture the pattern: it is underfitting.',
}

export default function TrainingCurves() {
  const [sc, setSc] = useState<Scenario>('overfit')
  const [ep, setEp] = useState(30)
  const { tr, va } = useMemo(() => curves(sc), [sc])
  const best = va.indexOf(Math.min(...va)) + 1
  const atBest = ep === best
  const vNow = va[ep - 1]
  const tNow = tr[ep - 1]

  let markerNote: string
  if (sc === 'overfit') {
    markerNote = atBest
      ? `Epoch ${best} has the lowest validation loss: this is where early stopping would stop and keep the model.`
      : ep > best
        ? `You are ${ep - best} epochs past the best point: validation loss has risen from ${va[best - 1].toFixed(2)} to ${vNow.toFixed(2)} while training loss kept falling.`
        : `Validation loss is still falling here. Keep training: the lowest point comes at epoch ${best}.`
  } else if (sc === 'lr') {
    markerNote = 'Wherever you put the marker, the loss is still far above where the healthy run ends, and it never settles: training is not making steady progress.'
  } else if (sc === 'underfit') {
    markerNote = `Even at epoch ${ep}, training loss is ${tNow.toFixed(2)}: the model cannot fit even the data it trains on.`
  } else {
    markerNote = `At epoch ${ep} the gap between validation and training loss is only ${(vNow - tNow).toFixed(2)}.`
  }

  return (
    <Figure
      title="Reading a training curve"
      caption={
        <>
          Choose a scenario and drag the orange marker (or press anywhere on the plot) to read both losses at that epoch. Find the epoch with the lowest
          validation loss in the overfitting case: that is where <b>early stopping</b> would stop training.
        </>
      }
    >
      <Controls>
        <Segmented
          label="scenario"
          value={sc}
          onChange={(v) => {
            setSc(v)
            setEp(30)
          }}
          options={[
            { value: 'healthy', label: 'healthy' },
            { value: 'lr', label: 'learning rate too high' },
            { value: 'overfit', label: 'overfitting' },
            { value: 'underfit', label: 'underfitting' },
          ]}
        />
      </Controls>
      <div className={s.key} role="list" aria-label="Legend">
        {(
          [
            ['training loss', 'var(--viz-1)', 'solid'],
            ['validation loss', 'var(--viz-4)', 'solid'],
            [`lowest validation loss (epoch ${best})`, 'var(--viz-3)', 'dashed'],
          ] as const
        )
          .filter((_, i) => i < 2 || sc !== 'lr')
          .map(([t, c, st]) => (
            <span key={t} className={s.keyItem} role="listitem">
              <span style={{ display: 'inline-block', width: 22, borderTop: `3px ${st} ${c}` }} />
              <span>{t}</span>
            </span>
          ))}
      </div>
      <div className={s.noSelect}>
      <Plot
        x={[0, 41]}
        y={[0, 2.5]}
        width={520}
        height={300}
        minHeight={260}
        margin={{ left: 46, bottom: 38 }}
        ariaLabel={`Training and validation loss over 40 epochs: ${sc}`}
      >
        <Grid xTicks={8} yTicks={5} />
        <Axes xTicks={8} yTicks={5} xLabel="epoch" yLabel="loss" />
        <ScrubArea onEpoch={setEp} />
        {sc !== 'lr' && <VLine x={best} color="var(--viz-3)" dash="5 4" />}
        <Path points={EPOCHS.map((e, i) => [e, tr[i]])} color="var(--viz-1)" width={2.5} />
        <Path points={EPOCHS.map((e, i) => [e, va[i]])} color="var(--viz-4)" width={2.5} />
        {sc !== 'lr' && <Dots points={[{ x: best, y: va[best - 1], r: 5, color: 'var(--viz-3)' }]} />}
        <DraggablePoint
          x={ep}
          y={vNow}
          color="var(--viz-2)"
          label={`epoch ${ep}`}
          onChange={(x) => setEp(clampEpoch(x))}
          constrain={(x) => {
            const e = clampEpoch(x)
            return [e, va[e - 1]]
          }}
        />
        <MarkerPill ep={ep} v={vNow} />
      </Plot>
      </div>
      <Controls>
        <Readout
          items={[
            ['epoch', ep],
            ['training loss', tNow.toFixed(2)],
            ['validation loss', vNow.toFixed(2)],
            ['lowest validation loss', sc === 'lr' ? 'no clear minimum' : `${va[best - 1].toFixed(2)} at epoch ${best}`],
          ]}
        />
      </Controls>
      <div className={s.verdict} aria-live="polite">
        <b>What it means:</b> {STORY[sc]} {markerNote}
      </div>
    </Figure>
  )
}
