import { useState } from 'react'
import { Figure, Controls, Segmented, Button, Plot, Grid, Axes, FnPath, Path, Dots, Label, DraggablePoint, M } from '../../../../../kit'

/*
  A logarithm undoes an exponential. The blue point sits on y = bˣ at (a, bᵃ); its mirror image in
  the line y = x is (bᵃ, a), which lies on y = log_b x. Dragging either point moves both.
  The ×b / ÷b buttons multiply the INPUT of the log by the base, and the log goes up or down by 1.
*/

type BaseKey = '2' | 'e' | '10'
const BASES: Record<BaseKey, { b: number; tex: string; label: string }> = {
  '2': { b: 2, tex: '2', label: '2' },
  e: { b: Math.E, tex: 'e', label: 'e' },
  '10': { b: 10, tex: '10', label: '10' },
}
const ORDER: BaseKey[] = ['2', 'e', '10']
const LO = -3
const HI = 11

const logb = (x: number, b: number) => Math.log(x) / Math.log(b)

/** Snap the exponent to steps of 0.05, and onto a whole number when it is close. */
function snapA(a: number) {
  const r = Math.round(a)
  if (Math.abs(a - r) < 0.07) return r
  return Math.round(a * 20) / 20
}

function fmt(v: number) {
  if (Number.isInteger(v)) return String(v)
  const a = Math.abs(v)
  if (a >= 100) return v.toFixed(0)
  if (a >= 0.1) return v.toFixed(2)
  return v.toFixed(3)
}

export default function LogExpMirror() {
  const [key, setKey] = useState<BaseKey>('2')
  const [a, setA] = useState(2)
  const { b, tex } = BASES[key]
  const aMax = logb(HI, b)
  const aMin = LO
  const clampA = (v: number) => Math.max(aMin, Math.min(aMax, v))
  const c = b ** a
  const A: [number, number] = [a, c]
  const B: [number, number] = [c, a]

  const changeBase = (k: BaseKey) => {
    setKey(k)
    // keep the same exponent if it still fits, otherwise fall back to 1
    const nb = BASES[k].b
    if (a > logb(HI, nb)) setA(k === '10' ? 0.5 : 1)
  }

  const canUp = a + 1 <= aMax + 1e-9
  const canDown = a - 1 >= aMin - 1e-9
  const cTex = fmt(c)
  const aTex = fmt(a)
  const logName = key === 'e' ? '\\ln' : `\\log_{${tex}}`

  return (
    <Figure
      title="A log is an exponential seen in a mirror"
      caption={
        <>
          Drag either point. The blue point sits on <M>{`y = ${tex}^x`}</M>; its reflection in the dashed line <M>{'y = x'}</M> swaps the two
          coordinates and lands on the log curve. Then press <strong>÷{BASES[key].label}</strong> and <strong>×{BASES[key].label}</strong>: the input of
          the log is divided or multiplied by the base, but the log only goes <em>down or up by 1</em>. Notice the log curve crosses 0 at <M>{'x = 1'}</M> and plunges as <M>{'x'}</M> shrinks
          towards 0: logs of numbers between 0 and 1 are negative, and <M>{`${logName} 0`}</M> does not exist.
        </>
      }
    >
      <Plot x={[LO, HI]} y={[LO, HI]} width={420} height={420} ariaLabel={`The curves y = ${tex} to the x and y = log base ${tex} of x, mirror images in the line y = x. Point (${aTex}, ${cTex}) and its mirror (${cTex}, ${aTex}).`}>
        <Grid xTicks={14} yTicks={14} />
        <Axes origin xTicks={7} yTicks={7} />
        <Path points={[[LO, LO], [HI, HI]]} color="var(--viz-muted)" width={1.5} dash="6 5" />
        <Label x={HI - 0.3} y={HI - 0.9} anchor="end" color="var(--viz-muted)">
          y = x
        </Label>
        <FnPath f={(x) => b ** x} color="var(--viz-1)" width={3} samples={300} />
        <FnPath f={(x) => (x > 0 ? logb(x, b) : NaN)} domain={[0.0005, HI]} color="var(--viz-2)" width={3} samples={500} />
        <Label x={logb(key === '10' ? HI - 2.4 : HI - 0.7, b) - 0.3} y={key === '10' ? HI - 2.4 : HI - 0.7} anchor="end" color="var(--viz-1)" weight={700}>
          {`y = ${BASES[key].label}ˣ`}
        </Label>
        <Label x={HI - 0.2} y={logb(HI, b) + (key === '10' ? 0.7 : key === 'e' ? -1.6 : -2.5)} anchor="end" color="var(--viz-2)" weight={700}>
          {key === 'e' ? 'y = ln x' : `y = log${key === '2' ? '₂' : '₁₀'} x`}
        </Label>
        {/* the reflection: a segment perpendicular to y = x */}
        <Path points={[A, B]} color="var(--viz-ink)" width={1.5} dash="3 4" opacity={0.7} />
        <Dots
          points={[
            { x: 0, y: 1, r: 4.5, color: 'var(--viz-1)' },
            { x: 1, y: 0, r: 4.5, color: 'var(--viz-2)' },
          ]}
        />
        {Math.hypot(a, c - 1) > 1.6 && (
          <>
            <Label x={0} y={1} dx={-7} dy={-7} anchor="end" color="var(--viz-1)" size={12}>
              (0, 1)
            </Label>
            <Label x={1} y={0} dx={-5} dy={17} anchor="end" color="var(--viz-2)" size={12}>
              (1, 0)
            </Label>
          </>
        )}
        <DraggablePoint
          x={A[0]}
          y={A[1]}
          color="var(--viz-1)"
          label={`(${aTex}, ${cTex})`}
          onChange={(x) => setA(clampA(snapA(x)))}
        />
        <DraggablePoint
          x={B[0]}
          y={B[1]}
          color="var(--viz-2)"
          onChange={(x) => setA(clampA(snapA(logb(Math.max(1e-6, x), b))))}
        />
        <Label x={B[0]} y={B[1]} dx={B[0] > HI * 0.7 ? -4 : 10} dy={20} anchor={B[0] > HI * 0.7 ? 'end' : 'start'} color="var(--viz-2)">
          {`(${cTex}, ${aTex})`}
        </Label>
      </Plot>
      <div style={{ fontSize: '1.15rem', textAlign: 'center', lineHeight: 1.6 }}>
        <M>{`${tex}^{${aTex}} = ${cTex}`}</M>
        <span style={{ margin: '0 0.6rem', color: 'var(--ink-3)' }}>means</span>
        <M>{`${logName} ${cTex} = ${aTex}`}</M>
      </div>
      <Controls>
        <Segmented label="Base" value={key} onChange={changeBase} options={ORDER.map((k) => ({ value: k, label: BASES[k].label }))} />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => setA(a - 1)} disabled={!canDown}>
            ÷{BASES[key].label}
          </Button>
          <Button primary onClick={() => setA(a + 1)} disabled={!canUp}>
            ×{BASES[key].label}
          </Button>
          <span style={{ fontSize: '0.875rem', color: 'var(--ink-2)' }}>
            input × {BASES[key].label} &rarr; log + 1
          </span>
        </div>
      </Controls>
    </Figure>
  )
}
