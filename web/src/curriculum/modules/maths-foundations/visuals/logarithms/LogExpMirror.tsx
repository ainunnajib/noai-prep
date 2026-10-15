import { useState } from 'react'
import { Figure, Controls, Segmented, Button, Plot, Grid, Axes, FnPath, Path, Dots, Label, DraggablePoint, usePlot, M } from '../../../../../kit'

/*
  A logarithm undoes an exponential. The blue point sits on y = bˣ at (a, bᵃ); its mirror image in
  the line y = x is (bᵃ, a), which lies on y = log_b x. Dragging either point moves both.
  The ×b / ÷b buttons multiply the INPUT of the log by the base, and the log goes up or down by 1.
  Values are shown exactly when they are exact (2⁻³ = 1/8 = 0.125); otherwise they are rounded to
  3 significant figures and the equation uses ≈ instead of =.
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

/** A rounded value to 3 significant figures (2.72, 0.368, 5.66). */
const sig3 = (v: number) => String(Number(v.toPrecision(3)))

type Box = [number, number, number, number] // x0, y0, x1, y1 in pixels
/** Rough pixel box of a text label (about 0.6 em per character). */
function textBox(x: number, y: number, text: string, anchor: 'start' | 'end', size = 13): Box {
  const w = text.length * size * 0.6
  const x0 = anchor === 'start' ? x : x - w
  return [x0, y - size, x0 + w, y + 3]
}
const overlaps = (a: Box, b: Box, pad = 4) => a[0] < b[2] + pad && b[0] < a[2] + pad && a[1] < b[3] + pad && b[1] < a[3] + pad

interface MovingLabel {
  x: number
  y: number
  dx: number
  dy: number
  text: string
  anchor: 'start' | 'end'
}

/** The fixed (0, 1) and (1, 0) labels, hidden whenever a moving point or its label would cover them. */
function AnchorLabels({ moving }: { moving: MovingLabel[] }) {
  const { xs, ys } = usePlot()
  const busy: Box[] = moving.flatMap((m) => {
    const px = xs(m.x)
    const py = ys(m.y)
    return [textBox(px + m.dx, py + m.dy, m.text, m.anchor), [px - 11, py - 11, px + 11, py + 11] as Box]
  })
  const fixed = [
    { x: 0, y: 1, dx: -7, dy: -7, text: '(0, 1)', color: 'var(--viz-1)' },
    { x: 1, y: 0, dx: -5, dy: 17, text: '(1, 0)', color: 'var(--viz-2)' },
  ]
  return (
    <>
      {fixed.map((f) => {
        const box = textBox(xs(f.x) + f.dx, ys(f.y) + f.dy, f.text, 'end', 12)
        if (busy.some((b) => overlaps(box, b))) return null
        return (
          <Label key={f.text} x={f.x} y={f.y} dx={f.dx} dy={f.dy} anchor="end" color={f.color} size={12}>
            {f.text}
          </Label>
        )
      })}
    </>
  )
}

export default function LogExpMirror() {
  const [key, setKey] = useState<BaseKey>('2')
  const [a, setA] = useState(2)
  const { b, tex } = BASES[key]
  // the largest exponent on the 0.05 grid whose point still fits on the plot
  const aMax = Math.floor(logb(HI, b) * 20) / 20
  const aMin = LO
  const clampA = (v: number) => Math.max(aMin, Math.min(aMax, v))
  const c = b ** a
  const A: [number, number] = [a, c]
  const B: [number, number] = [c, a]

  const changeBase = (k: BaseKey) => {
    setKey(k)
    // keep the same exponent if it still fits, otherwise fall back to 1
    const nb = BASES[k].b
    if (a > Math.floor(logb(HI, nb) * 20) / 20) setA(k === '10' ? 0.5 : 1)
  }

  const canUp = a + 1 <= aMax + 1e-9
  const canDown = a - 1 >= aMin - 1e-9
  // b^a is exact for a = 0, and for whole-number a in base 2 or 10 (2⁻³ = 0.125, 10⁻² = 0.01)
  const exact = a === 0 || (Number.isInteger(a) && key !== 'e')
  const cTex = exact ? String(Number(c.toPrecision(12))) : sig3(c)
  const aTex = String(a)
  const logName = key === 'e' ? '\\ln' : `\\log_{${tex}}`
  // a negative whole power is "one over": 2⁻³ = 1/8
  const fracTex = exact && a < 0 ? `\\tfrac{1}{${String(b ** -a)}} = ` : ''
  const eq = exact ? '=' : '\\approx'
  const labelA = `(${aTex}, ${cTex})`
  const labelB = `(${cTex}, ${aTex})`
  const bRight = B[0] > HI * 0.7

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
        <AnchorLabels
          moving={[
            { x: A[0], y: A[1], dx: 14, dy: -9, text: labelA, anchor: 'start' },
            { x: B[0], y: B[1], dx: bRight ? -4 : 10, dy: 20, text: labelB, anchor: bRight ? 'end' : 'start' },
          ]}
        />
        <DraggablePoint x={A[0]} y={A[1]} color="var(--viz-1)" label={labelA} onChange={(x) => setA(clampA(snapA(x)))} />
        <DraggablePoint
          x={B[0]}
          y={B[1]}
          color="var(--viz-2)"
          onChange={(x) => setA(clampA(snapA(logb(Math.max(1e-6, x), b))))}
        />
        <Label x={B[0]} y={B[1]} dx={bRight ? -4 : 10} dy={20} anchor={bRight ? 'end' : 'start'} color="var(--viz-2)">
          {labelB}
        </Label>
      </Plot>
      <div style={{ fontSize: '1.15rem', textAlign: 'center', lineHeight: 1.6 }}>
        {/* each half stays on one line; on a phone the break comes at "means" */}
        <span style={{ whiteSpace: 'nowrap' }}>
          <M>{`${tex}^{${aTex}} ${eq} ${fracTex}${cTex}`}</M>
        </span>{' '}
        <span style={{ margin: '0 0.4rem', color: 'var(--ink-3)' }}>{exact ? 'means' : 'so'}</span>{' '}
        <span style={{ whiteSpace: 'nowrap' }}>
          <M>{`${logName} ${cTex} ${eq} ${aTex}`}</M>
        </span>
        {!exact && <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }}>(rounded to 3 significant figures, so ≈)</div>}
      </div>
      <Controls>
        <Segmented label="Base" value={key} onChange={changeBase} options={ORDER.map((k) => ({ value: k, label: BASES[k].label }))} />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => setA(Math.round((a - 1) * 20) / 20)} disabled={!canDown}>
            ÷{BASES[key].label}
          </Button>
          <Button primary onClick={() => setA(Math.round((a + 1) * 20) / 20)} disabled={!canUp}>
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
