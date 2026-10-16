import { useState } from 'react'
import { Figure, Segmented, Plot, Grid, Axes, Path, Label, M, usePlot, useNarrow, useContainerWidth } from '../../../../../kit'
import { POS_C, NEG_C, boxPoly, clipLine, clipPoly, step, type Pt } from './shared'

/*
  XOR with three perceptrons. Hidden neuron h₁ = step(x₁ + x₂ − 0.5) is OR; hidden neuron
  h₂ = step(−x₁ − x₂ + 1.5) is NAND; the output step(h₁ + h₂ − 1.5) is AND of the two. Each hidden
  neuron draws one line; the output keeps the band between them. The learner can also use one hidden
  neuron alone: the output then simply copies it (a single perceptron, OR or NAND), and the corner it
  gets wrong is ringed in red. Click a corner to push it through.
*/

type Mode = 'both' | 'h1' | 'h2'
const CORNERS: Pt[] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
]
const XOR = [0, 1, 1, 0]
const XR: Pt = [-0.6, 1.6]
const YR: Pt = [-0.6, 1.6]
const h1 = (a: number, b: number) => step(a + b - 0.5)
const h2 = (a: number, b: number) => step(-a - b + 1.5)
const netOut = (mode: Mode, a: number, b: number) => (mode === 'h1' ? h1(a, b) : mode === 'h2' ? h2(a, b) : step(h1(a, b) + h2(a, b) - 1.5))

function Corners({ mode, sel, onSel }: { mode: Mode; sel: number; onSel: (i: number) => void }) {
  const { xs, ys } = usePlot()
  const r = 11
  return (
    <g>
      {CORNERS.map(([a, b], i) => {
        const cx = xs(a)
        const cy = ys(b)
        const t = XOR[i]
        const pred = netOut(mode, a, b)
        return (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`Corner (${a}, ${b}): XOR wants ${t}, the network says ${pred}. Feed it through the network`}
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
            {i === sel && <circle cx={cx} cy={cy} r={r + 10} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 1.5, strokeDasharray: '3 3' }} />}
            {pred !== t && <circle cx={cx} cy={cy} r={r + 5} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2.5 }} />}
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

const sgn = (w: number) => (w > 0 ? `+${w}` : `−${-w}`)

/** The 2-2-1 network drawn with its names, weights and biases, so the three equations can be matched to it. */
function XorNet({ a, b, v1, v2, y, mode }: { a: number; b: number; v1: number; v2: number; y: number; mode: Mode }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(340)
  const W = Math.max(270, Math.min(400, measured))
  const H = 214
  const R = 17
  const xIn = 30
  const xHid = W / 2
  const xOut = W - 30
  const yTop = 56
  const yBot = 170
  const yMid = (yTop + yBot) / 2
  const on1 = mode !== 'h2'
  const on2 = mode !== 'h1'

  type E = { from: Pt; to: Pt; w: number; on: boolean; side: 1 | -1; t: number }
  const edges: E[] = [
    { from: [xIn, yTop], to: [xHid, yTop], w: 1, on: on1, side: -1, t: 0.3 },
    { from: [xIn, yBot], to: [xHid, yTop], w: 1, on: on1, side: 1, t: 0.3 },
    { from: [xIn, yTop], to: [xHid, yBot], w: -1, on: on2, side: -1, t: 0.3 },
    { from: [xIn, yBot], to: [xHid, yBot], w: -1, on: on2, side: 1, t: 0.3 },
    { from: [xHid, yTop], to: [xOut, yMid], w: 1, on: on1, side: -1, t: 0.45 },
    { from: [xHid, yBot], to: [xOut, yMid], w: 1, on: on2, side: 1, t: 0.45 },
  ]
  const col = (w: number) => (w >= 0 ? 'var(--viz-2)' : 'var(--viz-1)')

  const node = (cx: number, cy: number, text: string, fill: string, off = false) => (
    <g>
      <circle cx={cx} cy={cy} r={R} style={{ fill: off ? 'var(--surface-2)' : fill, stroke: off ? 'var(--viz-muted)' : 'var(--viz-ink)', strokeWidth: 1.5, strokeDasharray: off ? '4 3' : undefined }} />
      <text x={cx} y={cy} dy="0.35em" textAnchor="middle" className="nnet-node-label" style={off ? { fill: 'var(--viz-muted)', fontSize: 11 } : undefined}>
        {text}
      </text>
    </g>
  )
  const valFill = (v: number) => (v ? 'color-mix(in srgb, var(--viz-3) 26%, var(--surface))' : 'var(--surface)')
  const name = (x: number, yy: number, text: string, muted = false, anchor: 'middle' | 'end' = 'middle') => (
    <text x={x} y={yy} textAnchor={anchor} className="plot-label" style={{ fontSize: 12, fill: muted ? 'var(--viz-muted)' : 'var(--ink-2)' }}>
      {text}
    </text>
  )
  const outText = mode === 'both' ? 'b = −1.5' : mode === 'h1' ? 'copies h₁' : 'copies h₂'

  return (
    <div ref={ref} className="plot-wrap" style={{ width: '100%', maxWidth: 400 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" style={{ display: 'block', width: '100%', height: 'auto' }} aria-label={`Network with inputs ${a}, ${b}; hidden values h1 = ${on1 ? v1 : 'off'}, h2 = ${on2 ? v2 : 'off'}; output ${y}`}>
        {edges.map((e, i) => (
          <line
            key={`e${i}`}
            x1={e.from[0]}
            y1={e.from[1]}
            x2={e.to[0]}
            y2={e.to[1]}
            strokeLinecap="round"
            style={{ stroke: e.on ? col(e.w) : 'var(--viz-muted)', strokeWidth: 2.2, opacity: e.on ? 0.85 : 0.25, strokeDasharray: e.on ? undefined : '4 4' }}
          />
        ))}
        {edges.map((e, i) => {
          if (!e.on) return null
          const dx = e.to[0] - e.from[0]
          const dy = e.to[1] - e.from[1]
          const len = Math.hypot(dx, dy)
          // unit normal on the requested side (side −1 = upwards on screen, +1 = downwards)
          let nx = -dy / len
          let ny = dx / len
          if (Math.sign(ny || 1) !== e.side) {
            nx = -nx
            ny = -ny
          }
          const d = 9 * Math.abs(nx) + 7 * Math.abs(ny) + 3
          const px = e.from[0] + e.t * dx + nx * d
          const py = e.from[1] + e.t * dy + ny * d
          return (
            <text key={`w${i}`} x={px} y={py} dy="0.35em" textAnchor="middle" className="plot-label" style={{ fill: col(e.w), fontSize: 12.5, fontWeight: 700 }}>
              {sgn(e.w)}
            </text>
          )
        })}
        {node(xIn, yTop, String(a), valFill(a))}
        {node(xIn, yBot, String(b), valFill(b))}
        {node(xHid, yTop, on1 ? String(v1) : 'off', valFill(v1), !on1)}
        {node(xHid, yBot, on2 ? String(v2) : 'off', valFill(v2), !on2)}
        {node(xOut, yMid, String(y), y ? 'color-mix(in srgb, var(--viz-2) 45%, var(--surface))' : 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))')}
        {name(xIn, yTop - R - 8, 'x₁')}
        {name(xIn, yBot + R + 16, 'x₂')}
        {name(xHid, yTop - R - 8, 'h₁ (b = −0.5)', !on1)}
        {name(xHid, yBot + R + 16, 'h₂ (b = +1.5)', !on2)}
        {name(W - 3, yMid - R - 8, outText, false, 'end')}
        {name(xOut, yMid + R + 16, 'ŷ')}
      </svg>
    </div>
  )
}

export default function XorTwoLines() {
  const [sel, setSel] = useState(1)
  const [mode, setMode] = useState<Mode>('both')
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const [a, b] = CORNERS[sel]
  const v1 = h1(a, b)
  const v2 = h2(a, b)
  const y = netOut(mode, a, b)
  const right = CORNERS.filter(([p, q], i) => netOut(mode, p, q) === XOR[i]).length
  const show1 = mode !== 'h2'
  const show2 = mode !== 'h1'

  const l1 = clipLine(1, 1, -0.5, XR, YR)
  const l2 = clipLine(1, 1, -1.5, XR, YR)
  // shade where the network says 1: the band between the lines, or one half-plane when a neuron works alone
  let region: Pt[] = boxPoly(XR, YR)
  if (show1) region = clipPoly(region, 1, 1, -0.5, 1)
  if (show2) region = clipPoly(region, -1, -1, 1.5, 1)

  const muted = { color: 'var(--viz-muted)' }
  let last: string
  if (mode === 'both') last = `\\hat y = \\text{step}(h_1 + h_2 - 1.5) = \\text{step}(${(v1 + v2 - 1.5).toFixed(1)}) = ${y}`
  else if (mode === 'h1') last = `\\hat y = h_1 = ${y}`
  else last = `\\hat y = h_2 = ${y}`

  return (
    <Figure
      title="Beating XOR with three neurons"
      caption={
        <>
          Each corner shows what XOR wants (orange circle = 1, blue square = 0); the shading is where the network says 1, and a red ring marks a mistake.{' '}
          <M>{'h_1'}</M> says 1 above the lower line (OR); <M>{'h_2'}</M> says 1 below the upper line (NAND, &ldquo;not both&rdquo;); the output says 1 only when both
          do (AND), which keeps exactly the orange band. Click a corner to push it through, then use one hidden neuron alone: one straight cut always gets a corner
          wrong.
        </>
      }
    >
      <Segmented
        label="Hidden neurons used"
        options={[
          { value: 'both', label: 'both' },
          { value: 'h1', label: 'h₁ only (OR)' },
          { value: 'h2', label: 'h₂ only (NAND)' },
        ]}
        value={mode}
        onChange={setMode}
      />
      <div ref={ref} style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.15fr)', gap: '0.75rem 1.25rem', width: '100%', alignItems: 'center' }}>
        <Plot x={XR} y={YR} width={320} height={316} margin={{ left: 38, right: 16, top: 14, bottom: 36 }} ariaLabel={`XOR corners with the hidden neurons' lines; the network gets ${right} of 4 corners right`}>
          {region.length > 2 && <Path points={region} closed fill="color-mix(in srgb, var(--viz-2) 22%, var(--surface))" color="none" width={0} />}
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
          <Corners mode={mode} sel={sel} onSel={setSel} />
        </Plot>
        <div style={{ display: 'grid', gap: '0.5rem', justifyItems: 'center', minWidth: 0 }}>
          <XorNet a={a} b={b} v1={v1} v2={v2} y={y} mode={mode} />
          <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--ink)', width: '100%', overflowX: 'auto' }}>
            <div style={show1 ? undefined : muted}>
              <M>{`h_1 = \\text{step}(x_1 + x_2 - 0.5) = \\text{step}(${(a + b - 0.5).toFixed(1)}) = ${v1}`}</M>
              {!show1 && ' (not used)'}
            </div>
            <div style={show2 ? undefined : muted}>
              <M>{`h_2 = \\text{step}(-x_1 - x_2 + 1.5) = \\text{step}(${(-a - b + 1.5).toFixed(1)}) = ${v2}`}</M>
              {!show2 && ' (not used)'}
            </div>
            <div>
              <M>{last}</M>
              {mode !== 'both' && <span style={{ color: 'var(--ink-2)' }}> (one neuron alone: {mode === 'h1' ? 'OR' : 'NAND'})</span>}
            </div>
          </div>
        </div>
      </div>
      <p style={{ margin: 0, width: '100%', fontSize: '0.92rem', fontWeight: 700, color: right === 4 ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>
        {right === 4 ? 'Both lines together: 4 of 4 corners right.' : `One line alone: ${right} of 4 corners right (the red ring marks the miss).`}
      </p>
    </Figure>
  )
}
