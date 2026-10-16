import { useState } from 'react'
import { Figure, Controls, Readout, Toggle, Plot, Grid, Axes, Path, Dots, Label, DraggablePoint, usePlot, useNarrow, M } from '../../../../../kit'
import s from './playground.module.css'

/*
  The classic hand-made XOR network (Goodfellow, Bengio & Courville, Deep Learning, §6.1):
    h₁ = ReLU(x₁ + x₂),  h₂ = ReLU(x₁ + x₂ − 1),  y = h₁ − 2h₂,  predict orange when y > 0.5.
  Left: input space. Right: hidden space, where the hidden layer has moved every point.
*/

type P = [number, number]
const relu = (v: number) => Math.max(0, v)
const CORNERS: { x: P; label: 0 | 1; name: string }[] = [
  { x: [0, 0], label: 0, name: '(0, 0)' },
  { x: [0, 1], label: 1, name: '(0, 1)' },
  { x: [1, 0], label: 1, name: '(1, 0)' },
  { x: [1, 1], label: 0, name: '(1, 1)' },
]
const COL = (c: 0 | 1) => (c === 1 ? 'var(--viz-2)' : 'var(--viz-1)')

/** Keep the part of a convex polygon where a·x + b·y + c ≥ 0 (Sutherland–Hodgman, one edge). */
function clip(poly: P[], a: number, b: number, c: number): P[] {
  const out: P[] = []
  const f = (p: P) => a * p[0] + b * p[1] + c
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    const fp = f(p)
    const fq = f(q)
    if (fp >= 0) out.push(p)
    if (fp >= 0 !== fq >= 0) {
      const t = fp / (fp - fq)
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])])
    }
  }
  return out
}
const box = (x0: number, x1: number, y0: number, y1: number): P[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
]

const XR: P = [-0.6, 1.6]

/** The probe and its image: a hollow ring (input space) or hollow square (hidden space) with a thick ink outline, so it never looks like a data point. */
function Probe({ at, shape, label }: { at: P; shape: 'ring' | 'square'; label?: string }) {
  const { xs, ys } = usePlot()
  const cx = xs(at[0])
  const cy = ys(at[1])
  const st = { fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 3, pointerEvents: 'none' as const }
  return (
    <g>
      {shape === 'ring' ? <circle cx={cx} cy={cy} r={8} style={st} /> : <rect x={cx - 7} y={cy - 7} width={14} height={14} style={st} />}
      {label && (
        <text className="plot-label" x={cx + 12} y={cy - 9} style={{ fill: 'var(--viz-ink)', fontSize: 12, pointerEvents: 'none' }}>
          {label}
        </text>
      )}
    </g>
  )
}

export default function XorFold() {
  const [probe, setProbe] = useState<P>([0.8, 0.45])
  const [useRelu, setUseRelu] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const f = useRelu ? relu : (v: number) => v

  const hidden = (x: P): P => [f(x[0] + x[1]), f(x[0] + x[1] - 1)]
  const out = (h: P) => h[0] - 2 * h[1]
  const ph = hidden(probe)
  const py = out(ph)
  const correct = CORNERS.filter((c) => (out(hidden(c.x)) > 0.5 ? 1 : 0) === c.label).length

  // Where does the network say "orange" in input space? With ReLU: 0.5 < x₁ + x₂ < 1.5. Without: x₁ + x₂ < 1.5.
  const inBox = box(XR[0], XR[1], XR[0], XR[1])
  const orangeIn = useRelu ? clip(clip(inBox, 1, 1, -0.5), -1, -1, 1.5) : clip(inBox, -1, -1, 1.5)
  // In hidden space the output neuron's rule is one straight line: h₁ − 2h₂ = 0.5.
  const HX: P = useRelu ? [-0.6, 3.2] : [-1.2, 3.2]
  const HY: P = useRelu ? [-0.6, 2.2] : [-2.2, 2.2]
  const hBox = box(HX[0], HX[1], HY[0], HY[1])
  const orangeH = clip(hBox, 1, -2, -0.5)
  const blueH = clip(hBox, -1, 2, 0.5)
  // The image of the whole input square under the hidden layer.
  const curve: P[] = useRelu
    ? [
        [0, 0],
        [1, 0],
        [3, 2],
      ]
    : [
        [-1, -2],
        [3, 2],
      ]
  const fmt = (v: number) => (Math.abs(v) < 0.005 ? '0' : v.toFixed(2)).replace('-', '−')

  const imgs = CORNERS.map((c) => ({ ...c, h: hidden(c.x) }))
  const panelSize = 340

  return (
    <Figure
      title="A hidden layer moves the points until one line is enough"
      caption={
        <>
          <b>Try:</b> drag the ringed point on the left and watch its square on the right; then switch the ReLU off. <b>Notice:</b> the hidden layer folds the whole
          plane onto the bent grey line, where the output <M>{'y = h_1 - 2h_2'}</M> needs only one straight line (<M>{'y = 0.5'}</M>). The dashed lines on the left
          are creases (where each hidden ReLU switches on), not the decision boundary; the edges of the orange band are where <M>{'y = 0.5'}</M>.
        </>
      }
    >
      <div ref={wrapRef} className={`${s.panels} ${s.panelsEqual} ${narrow ? s.panelsNarrow : ''}`}>
        <div className={s.panel}>
          <div className={s.panelTitle}>
            <b>Input space</b> <M>{'(x_1, x_2)'}</M>: shaded by what the whole network predicts{useRelu ? '; dashed = creases' : ''}
          </div>
          <Plot x={XR} y={XR} width={panelSize} height={panelSize} margin={{ left: 36, bottom: 32, top: 12, right: 12 }} ariaLabel="Input space with the four XOR corners and the region the network calls orange">
            <Path points={inBox} closed fill="color-mix(in srgb, var(--viz-1) 12%, var(--surface))" color="none" width={0} />
            {orangeIn.length > 2 && <Path points={orangeIn} closed fill="color-mix(in srgb, var(--viz-2) 26%, var(--surface))" color="none" width={0} />}
            <Grid xTicks={4} yTicks={4} />
            <Axes xLabel="x₁" yLabel="x₂" xTicks={4} yTicks={4} />
            {useRelu && (
              <>
                <Path
                  points={[
                    [-0.6, 0.6],
                    [0.6, -0.6],
                  ]}
                  color="var(--viz-muted)"
                  width={2}
                  dash="6 4"
                />
                <Path
                  points={[
                    [-0.4, 1.4],
                    [1.4, -0.4],
                  ]}
                  color="var(--viz-muted)"
                  width={2}
                  dash="6 4"
                />
                <Label x={-0.58} y={0.6} dx={2} dy={-6} color="var(--ink-2)" size={12}>
                  h₁ crease
                </Label>
                <Label x={-0.4} y={1.4} dx={6} dy={-4} color="var(--ink-2)" size={12}>
                  h₂ crease
                </Label>
              </>
            )}
            <Dots points={CORNERS.map((c) => ({ x: c.x[0], y: c.x[1], color: COL(c.label), r: 7 }))} />
            {CORNERS.map((c) => (
              <Label key={c.name} x={c.x[0]} y={c.x[1]} dx={c.name === '(0, 0)' ? -10 : 10} dy={c.name === '(0, 0)' ? 20 : -10} anchor={c.name === '(0, 0)' ? 'end' : 'start'} size={12}>
                {c.name}
              </Label>
            ))}
            <DraggablePoint
              x={probe[0]}
              y={probe[1]}
              color="var(--surface)"
              r={7}
              onChange={(x, y) => setProbe([Math.max(-0.5, Math.min(1.5, Math.round(x * 20) / 20)), Math.max(-0.5, Math.min(1.5, Math.round(y * 20) / 20))])}
            />
            <Probe at={probe} shape="ring" label="drag" />
          </Plot>
        </div>
        <div className={s.panel}>
          <div className={s.panelTitle}>
            <b>Hidden space</b> <M>{'(h_1, h_2)'}</M>: where the hidden layer sends each point
          </div>
          <Plot x={HX} y={HY} width={panelSize} height={panelSize} margin={{ left: 36, bottom: 32, top: 12, right: 12 }} ariaLabel="Hidden space showing where the hidden layer moves each point, and the output neuron's straight line">
            <Path points={blueH} closed fill="color-mix(in srgb, var(--viz-1) 12%, var(--surface))" color="none" width={0} />
            <Path points={orangeH} closed fill="color-mix(in srgb, var(--viz-2) 26%, var(--surface))" color="none" width={0} />
            <Grid xTicks={4} yTicks={4} />
            <Axes xLabel="h₁" yLabel="h₂" xTicks={4} yTicks={4} />
            <Path points={curve} color="var(--viz-muted)" width={5} opacity={0.55} />
            <Path
              points={[
                [HX[0], (HX[0] - 0.5) / 2],
                [HX[1], (HX[1] - 0.5) / 2],
              ]}
              color="var(--viz-ink)"
              width={2.2}
            />
            <Label x={HX[1]} y={(HX[1] - 0.5) / 2} dx={-4} dy={-8} anchor="end" size={12}>
              y = 0.5
            </Label>
            <Dots points={imgs.map((c) => ({ x: c.h[0], y: c.h[1], color: COL(c.label), r: c.name === '(1, 0)' ? 5 : 7 }))} />
            {useRelu ? (
              <>
                <Label x={0} y={0} dx={8} dy={-10} size={12}>
                  (0, 0)
                </Label>
                <Label x={1} y={0} dx={-4} dy={22} anchor="start" size={12}>
                  (0, 1) and (1, 0)
                </Label>
                <Label x={2} y={1} dx={-10} dy={-8} anchor="end" size={12}>
                  (1, 1)
                </Label>
              </>
            ) : (
              <>
                <Label x={0} y={-1} dx={10} dy={4} size={12}>
                  (0, 0)
                </Label>
                <Label x={1} y={0} dx={10} dy={4} size={12}>
                  (0, 1) and (1, 0)
                </Label>
                <Label x={2} y={1} dx={-10} dy={-8} anchor="end" size={12}>
                  (1, 1)
                </Label>
              </>
            )}
            <Probe at={ph} shape="square" />
          </Plot>
        </div>
      </div>
      <Controls>
        <Toggle label="ReLU in the hidden layer" checked={useRelu} onChange={setUseRelu} />
        <Readout
          items={[
            ['drag point x', `(${fmt(probe[0])}, ${fmt(probe[1])})`],
            ['h', `(${fmt(ph[0])}, ${fmt(ph[1])})`],
            ['y', fmt(py)],
            ['prediction', py > 0.5 ? 'orange' : 'blue'],
            ['corners right', `${correct} / 4`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
