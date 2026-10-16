import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Plot, Axes, Path, Dots, Label, DraggablePoint, Bars, M } from '../../../../../kit'
import s from './lora.module.css'

/*
  Catastrophic forgetting on a two-weight model.
  Old task:  L_A(w) = λ1 (e1·(w − a))² + λ2 (e2·(w − a))²   (a long, flat-bottomed valley along e1)
  New task:  L_B(w) = c ‖w − b‖²
  Fine-tuning = gradient descent from the pretrained weights a, on L_B alone (new data only)
  or on L_B + L_A (new data with some old data mixed back in).
*/

const TH = (25 * Math.PI) / 180
const E1: [number, number] = [Math.cos(TH), Math.sin(TH)]
const E2: [number, number] = [-Math.sin(TH), Math.cos(TH)]
const L1 = 0.02
const L2 = 2.0
const CB = 0.5
const A0: [number, number] = [-1.3, -0.9]
const ETA = 0.1
const STEPS = 40

const dot = (p: [number, number], q: [number, number]) => p[0] * q[0] + p[1] * q[1]
const lossA = (w: [number, number]) => {
  const d: [number, number] = [w[0] - A0[0], w[1] - A0[1]]
  return L1 * dot(E1, d) ** 2 + L2 * dot(E2, d) ** 2
}
const lossB = (w: [number, number], b: [number, number]) => CB * ((w[0] - b[0]) ** 2 + (w[1] - b[1]) ** 2)

function gradA(w: [number, number]): [number, number] {
  const d: [number, number] = [w[0] - A0[0], w[1] - A0[1]]
  const g1 = 2 * L1 * dot(E1, d)
  const g2 = 2 * L2 * dot(E2, d)
  return [g1 * E1[0] + g2 * E2[0], g1 * E1[1] + g2 * E2[1]]
}

function ellipseA(level: number): [number, number][] {
  const r1 = Math.sqrt(level / L1)
  const r2 = Math.sqrt(level / L2)
  return Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * 2 * Math.PI
    const c = r1 * Math.cos(t)
    const sn = r2 * Math.sin(t)
    return [A0[0] + c * E1[0] + sn * E2[0], A0[1] + c * E1[1] + sn * E2[1]] as [number, number]
  })
}

function circleB(b: [number, number], level: number): [number, number][] {
  const rad = Math.sqrt(level / CB)
  return Array.from({ length: 73 }, (_, i) => {
    const t = (i / 72) * 2 * Math.PI
    return [b[0] + rad * Math.cos(t), b[1] + rad * Math.sin(t)] as [number, number]
  })
}

const LEVELS = [0.25, 1, 2.25]

export default function ForgettingLandscape() {
  const [b, setB] = useState<[number, number]>([1.4, 1.5])
  const [mode, setMode] = useState<'new' | 'mix'>('new')
  const [steps, setSteps] = useState(STEPS)

  const path = useMemo(() => {
    const pts: [number, number][] = [A0]
    let w: [number, number] = [...A0]
    for (let t = 0; t < STEPS; t++) {
      const gB: [number, number] = [2 * CB * (w[0] - b[0]), 2 * CB * (w[1] - b[1])]
      const gA = mode === 'mix' ? gradA(w) : [0, 0]
      w = [w[0] - ETA * (gB[0] + gA[0]), w[1] - ETA * (gB[1] + gA[1])]
      pts.push(w)
    }
    return pts
  }, [b, mode])

  const w = path[steps]
  const la = lossA(w)
  const lb = lossB(w, b)
  const status = la < 0.5 ? 'kept' : la < 1.5 ? 'damaged' : 'forgotten'
  const valley: [number, number][] = [
    [A0[0] - 6 * E1[0], A0[1] - 6 * E1[1]],
    [A0[0] + 7 * E1[0], A0[1] + 7 * E1[1]],
  ]
  const lab: [number, number] = [A0[0] - 1.25 * E1[0] + 0.0, A0[1] - 1.25 * E1[1] - 0.32]

  return (
    <Figure
      wide
      title="Catastrophic forgetting on a model with just two weights"
      caption={
        <>
          <b>Try:</b> switch between <b>new data only</b> and <b>new + old data</b>, then drag the orange point onto the blue valley.{' '}
          <b>Notice:</b> with new data only, gradient descent walks straight out of the old task's valley; mixing in old data keeps it inside.
        </>
      }
    >
      <div className={s.wrap}>
        <Plot x={[-3, 3]} y={[-2.2, 2.2]} width={480} height={360} margin={{ left: 26, bottom: 26, top: 10, right: 10 }} ariaLabel="Loss contours of an old task and a new task in a two-weight space, with the fine-tuning path">
          <Axes xLabel="weight 1" yLabel="weight 2" hideXTicks hideYTicks />
          <Path points={ellipseA(0.25)} closed color="none" fill="color-mix(in srgb, var(--viz-1) 13%, transparent)" width={0} />
          <Path points={valley} color="var(--viz-1)" width={1} dash="2 5" opacity={0.7} />
          {LEVELS.map((L) => (
            <Path key={`a${L}`} points={ellipseA(L)} closed color="var(--viz-1)" width={L === 0.25 ? 2 : 1.3} opacity={L === 0.25 ? 1 : 0.6} />
          ))}
          {LEVELS.map((L) => (
            <Path key={`b${L}`} points={circleB(b, L)} closed color="var(--viz-2)" width={L === 0.25 ? 2 : 1.3} opacity={L === 0.25 ? 1 : 0.6} />
          ))}
          <Label x={lab[0]} y={lab[1]} color="var(--viz-1)" anchor="middle">
            old task's valley
          </Label>
          <Path points={path} color="var(--viz-muted)" width={1.5} dash="3 4" />
          <Path points={path.slice(0, steps + 1)} color="var(--viz-ink)" width={2.5} />
          <Dots points={[{ x: A0[0], y: A0[1], hollow: true, color: 'var(--viz-ink)', r: 6 }]} />
          <Label x={A0[0]} y={A0[1]} dx={-8} dy={20} anchor="middle" color="var(--viz-ink)">
            start
          </Label>
          <Dots points={[{ x: w[0], y: w[1], color: 'var(--viz-4)', r: 6.5 }]} />
          <DraggablePoint
            x={b[0]}
            y={b[1]}
            onChange={(x, y) => setB([Math.round(x * 20) / 20, Math.round(y * 20) / 20])}
            color="var(--viz-2)"
            r={7}
            ariaLabel="new task's best point (drag me)"
          />
          <Label x={b[0]} y={b[1]} dx={12} dy={-9} color="color-mix(in srgb, var(--viz-2) 55%, var(--ink))" weight={800}>
            new task's best
          </Label>
        </Plot>
        <div className={s.legend}>
          <span>
            <span className={s.swatchLine} style={{ borderColor: 'var(--viz-1)' }} />
            old-task loss
          </span>
          <span>
            <span className={s.swatchLine} style={{ borderColor: 'var(--viz-2)' }} />
            new-task loss
          </span>
          <span>
            <span className={s.swatchLine} style={{ borderColor: 'var(--viz-ink)' }} />
            fine-tuning path
          </span>
          <span>
            <span className={s.swatch} style={{ background: 'var(--viz-4)', borderRadius: '50%' }} />
            weights now
          </span>
        </div>
        <Controls>
          <Segmented
            label="Fine-tune on"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'new', label: 'new data only' },
              { value: 'mix', label: 'new + old data' },
            ]}
          />
          <Slider label="training steps" value={steps} min={0} max={STEPS} step={1} onChange={setSteps} />
        </Controls>
        <Bars
          ariaLabel="Loss on each task after fine-tuning"
          max={4}
          data={[
            { label: 'new-task loss', value: lb, color: 'var(--viz-2)' },
            { label: 'old-task loss', value: la, color: 'var(--viz-1)', strong: true },
          ]}
        />
        <p className={s.note}>
          After {steps} step{steps === 1 ? '' : 's'}: new-task loss <M>{`L_{\\text{new}} = ${lb.toFixed(2)}`}</M>, old-task loss{' '}
          <M>{`L_{\\text{old}} = ${la.toFixed(2)}`}</M>. Old skill: <b>{status}</b>.
        </p>
      </div>
    </Figure>
  )
}
