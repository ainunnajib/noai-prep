import { useState } from 'react'
import { Figure, Controls, Toggle, Plot, Grid, Axes, Path, Label, NeuralNet, M, usePlot, useNarrow } from '../../../../../kit'
import { POS_C, NEG_C, boxPoly, clipLine, clipPoly, step, type Pt } from './shared'

/*
  XOR with three perceptrons. Hidden neuron h₁ = step(x₁ + x₂ − 0.5) is OR; hidden neuron
  h₂ = step(−x₁ − x₂ + 1.5) is NAND; the output step(h₁ + h₂ − 1.5) is AND of the two. Each hidden
  neuron draws one line; the output keeps the band between them. Click a corner to push it through.
*/

const CORNERS: Pt[] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
]
const XR: Pt = [-0.6, 1.6]
const YR: Pt = [-0.6, 1.6]
const h1 = (a: number, b: number) => step(a + b - 0.5)
const h2 = (a: number, b: number) => step(-a - b + 1.5)
const out = (a: number, b: number) => step(h1(a, b) + h2(a, b) - 1.5)

function Corners({ sel, onSel }: { sel: number; onSel: (i: number) => void }) {
  const { xs, ys } = usePlot()
  const r = 11
  return (
    <g>
      {CORNERS.map(([a, b], i) => {
        const cx = xs(a)
        const cy = ys(b)
        const t = out(a, b)
        return (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`Feed corner (${a}, ${b}) through the network`}
            onClick={() => onSel(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSel(i)
              }
            }}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            <circle cx={cx} cy={cy} r={r + 14} style={{ fill: 'transparent' }} />
            {i === sel && <circle cx={cx} cy={cy} r={r + 8} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 1.5, strokeDasharray: '3 3' }} />}
            {t ? (
              <circle cx={cx} cy={cy} r={r} style={{ fill: POS_C, stroke: 'var(--surface)', strokeWidth: 2 }} />
            ) : (
              <rect x={cx - r * 0.9} y={cy - r * 0.9} width={r * 1.8} height={r * 1.8} style={{ fill: NEG_C, stroke: 'var(--surface)', strokeWidth: 2 }} />
            )}
            <text x={cx} y={cy} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--surface)', fontSize: 12, fontWeight: 800, pointerEvents: 'none' }}>
              {t}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default function XorTwoLines() {
  const [sel, setSel] = useState(1)
  const [show1, setShow1] = useState(true)
  const [show2, setShow2] = useState(true)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const [a, b] = CORNERS[sel]
  const v1 = h1(a, b)
  const v2 = h2(a, b)
  const y = out(a, b)

  const l1 = clipLine(1, 1, -0.5, XR, YR)
  const l2 = clipLine(1, 1, -1.5, XR, YR)
  // shade where the visible hidden neurons all say 1 (both on: the band 0.5 < x1 + x2 < 1.5)
  let region: Pt[] = boxPoly(XR, YR)
  if (show1) region = clipPoly(region, 1, 1, -0.5, 1)
  if (show2) region = clipPoly(region, -1, -1, 1.5, 1)

  return (
    <Figure
      title="Beating XOR with three neurons"
      caption={
        <>
          Neuron <M>{'h_1'}</M> draws the lower line and says 1 above it (that is OR). Neuron <M>{'h_2'}</M> draws the upper line and says 1 below it (that is
          NAND, "not both"). The output neuron says 1 only when <i>both</i> say 1 (that is AND), which keeps exactly the orange band between the lines. Click a
          corner to push it through the network; switch a line off and the shading shows what the other hidden neuron says on its own: one straight cut, which always gets some corner wrong.
        </>
      }
    >
      <div ref={ref} style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.15fr)', gap: '0.75rem 1.25rem', width: '100%', alignItems: 'center' }}>
        <Plot x={XR} y={YR} width={320} height={316} margin={{ left: 38, right: 16, top: 14, bottom: 36 }} ariaLabel="XOR corners with two boundary lines; the band between them is class 1">
          {(show1 || show2) && region.length > 2 && <Path points={region} closed fill="color-mix(in srgb, var(--viz-2) 22%, var(--surface))" color="none" width={0} />}
          <Grid xTicks={4} yTicks={4} />
          <Axes xLabel="x₁" yLabel="x₂" xTicks={4} yTicks={4} />
          {show1 && l1 && <Path points={l1} color="var(--viz-3)" width={2.75} />}
          {show2 && l2 && <Path points={l2} color="var(--viz-5)" width={2.75} />}
          {show1 && (
            <Label x={-0.56} y={0.55} color="var(--viz-3)" size={12.5}>
              h₁ line
            </Label>
          )}
          {show2 && (
            <Label x={1.12} y={0.62} color="var(--viz-5)" size={12.5}>
              h₂ line
            </Label>
          )}
          <Corners sel={sel} onSel={setSel} />
        </Plot>
        <div style={{ display: 'grid', gap: '0.5rem', justifyItems: 'center', minWidth: 0 }}>
          <NeuralNet
            layers={[2, 2, 1]}
            layerLabels={['input', 'hidden', 'output']}
            nodeLabels={[[String(a), String(b)], [String(v1), String(v2)], [String(y)]]}
            activations={[[a * 0.45, b * 0.45], [v1 * 0.45, v2 * 0.45], [y * 0.45]]}
            weights={[
              [
                [1, -1],
                [1, -1],
              ],
              [[1], [1]],
            ]}
            width={340}
            height={200}
            ariaLabel={`Network with inputs ${a}, ${b}; hidden values ${v1}, ${v2}; output ${y}`}
          />
          <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--ink)', width: '100%' }}>
            <div>
              <M>{`h_1 = \\text{step}(x_1 + x_2 - 0.5) = \\text{step}(${(a + b - 0.5).toFixed(1)}) = ${v1}`}</M>
            </div>
            <div>
              <M>{`h_2 = \\text{step}(-x_1 - x_2 + 1.5) = \\text{step}(${(-a - b + 1.5).toFixed(1)}) = ${v2}`}</M>
            </div>
            <div>
              <M>{`\\hat y = \\text{step}(h_1 + h_2 - 1.5) = \\text{step}(${(v1 + v2 - 1.5).toFixed(1)}) = ${y}`}</M>
            </div>
          </div>
        </div>
      </div>
      <Controls>
        <Toggle label="h₁ line (OR)" checked={show1} onChange={setShow1} />
        <Toggle label="h₂ line (NAND)" checked={show2} onChange={setShow2} />
      </Controls>
    </Figure>
  )
}
