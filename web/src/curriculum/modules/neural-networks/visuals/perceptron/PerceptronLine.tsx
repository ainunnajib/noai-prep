import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Grid, Axes, Path, Arrow, usePlot } from '../../../../../kit'
import { NeuronDiagram } from './NeuronDiagram'
import { POS_C, NEG_C, W_C, clipLine, halfPlane, foot, num, step, type Pt } from './shared'

/*
  One perceptron on the four corners of the unit square. The learner slides w₁, w₂ and b and tries to
  reproduce AND, OR or XOR. The background shows the neuron's answer everywhere (orange = 1,
  blue = 0); the solid line is w₁x₁ + w₂x₂ + b = 0. A button checks every slider setting
  (13 × 13 × 13 = 2,197 of them) to show that none solves XOR. Among the settings that work it shows
  the one with the widest safety margin (biggest min |z| / ‖w‖ over the corners, i.e. the corners sit
  as far from the line as possible), so it never picks a knife-edge line through a corner that only
  works because of the "z = 0 counts as 0" tie rule.
*/

type Gate = 'AND' | 'OR' | 'XOR'
const TARGETS: Record<Gate, number[]> = { AND: [0, 0, 0, 1], OR: [0, 1, 1, 1], XOR: [0, 1, 1, 0] }
const CORNERS: Pt[] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
]
const XR: Pt = [-0.6, 1.6]
const YR: Pt = [-0.6, 1.6]
const GRID = Array.from({ length: 13 }, (_, i) => -3 + i * 0.5)

function Corners({ targets, preds, sel, onSel }: { targets: number[]; preds: number[]; sel: number; onSel: (i: number) => void }) {
  const { xs, ys } = usePlot()
  const r = 11
  return (
    <g>
      {CORNERS.map((c, i) => {
        const cx = xs(c[0])
        const cy = ys(c[1])
        const t = targets[i]
        const wrong = preds[i] !== t
        const col = t ? POS_C : NEG_C
        const lx = c[0] === 0 ? cx - 16 : cx + 16
        return (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`Corner (${c[0]}, ${c[1]}): target ${t}, neuron says ${preds[i]}`}
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
            {wrong && <circle cx={cx} cy={cy} r={r + 5} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2.5 }} />}
            {t ? (
              <circle cx={cx} cy={cy} r={r} style={{ fill: col, stroke: 'var(--surface)', strokeWidth: 2 }} />
            ) : (
              <rect x={cx - r * 0.9} y={cy - r * 0.9} width={r * 1.8} height={r * 1.8} style={{ fill: col, stroke: 'var(--surface)', strokeWidth: 2 }} />
            )}
            <text x={cx} y={cy} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--surface)', fontSize: 12, fontWeight: 800, pointerEvents: 'none' }}>
              {t}
            </text>
            <text x={lx} y={cy + (c[1] === 0 ? 24 : -20)} textAnchor={c[0] === 0 ? 'end' : 'start'} className="plot-label" style={{ fontSize: 12, strokeWidth: 5 }}>
              {`(${c[0]}, ${c[1]})`}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default function PerceptronLine() {
  const [gate, setGate] = useState<Gate>('AND')
  const [w1, setW1] = useState(1)
  const [w2, setW2] = useState(1)
  const [b, setB] = useState(-0.5)
  const [sel, setSel] = useState(3)
  const [msg, setMsg] = useState<string | null>(null)

  const targets = TARGETS[gate]
  const zs = CORNERS.map(([a, c]) => w1 * a + w2 * c + b)
  const preds = zs.map(step)
  const right = preds.filter((p, i) => p === targets[i]).length
  const solved = right === 4

  const line = clipLine(w1, w2, b, XR, YR)
  const posPoly = halfPlane(w1, w2, b, XR, YR, 1)
  const negPoly = halfPlane(w1, w2, b, XR, YR, -1)
  // the region where z > 0 is open: z = 0 exactly counts as 0, which the polygons can't show, but no corner sits there unless the readout says z = 0
  const wl = Math.hypot(w1, w2)
  let arrow: [Pt, Pt] | null = null
  if (wl > 1e-9) {
    const f = foot([w1, w2], b, [0.5, 0.5])
    if (f[0] > XR[0] && f[0] < XR[1] && f[1] > YR[0] && f[1] < YR[1]) arrow = [f, [f[0] + (0.32 * w1) / wl, f[1] + (0.32 * w2) / wl]]
  }

  const change = (fn: (v: number) => void) => (v: number) => {
    fn(v)
    setMsg(null)
  }

  const search = () => {
    // Rank by (corners right, safety margin, then smaller weights). The margin is the distance from the
    // line to the nearest corner, min |z| / ‖w‖, so a line through a corner scores 0.
    let best = -1
    let bestSet: [number, number, number] = [0, 0, 0]
    let bestMargin = -1
    let bestSize = Infinity
    let perfect = 0
    let clear = 0
    for (const a of GRID)
      for (const c of GRID)
        for (const d of GRID) {
          const z = CORNERS.map(([p, q]) => a * p + c * q + d)
          const score = z.reduce((s, v, i) => s + (step(v) === targets[i] ? 1 : 0), 0)
          const wl = Math.hypot(a, c)
          const margin = wl > 0 ? Math.min(...z.map(Math.abs)) / wl : 0
          if (score === 4) {
            perfect++
            if (z.every((v) => v !== 0)) clear++
          }
          const size = Math.abs(a) + Math.abs(c) + Math.abs(d)
          const better =
            score > best ||
            (score === best && margin > bestMargin + 1e-9) ||
            (score === best && Math.abs(margin - bestMargin) <= 1e-9 && size < bestSize)
          if (better) {
            best = score
            bestSet = [a, c, d]
            bestMargin = margin
            bestSize = size
          }
        }
    setW1(bestSet[0])
    setW2(bestSet[1])
    setB(bestSet[2])
    setMsg(
      perfect
        ? `Checked all 2,197 slider settings: ${perfect.toLocaleString('en-GB')} get all four ${gate} corners right, but only ${clear} of those keep every corner off the line (the rest rely on the tie rule z = 0 → 0). The sliders now show the one with the widest safety margin.`
        : `Checked all 2,197 slider settings: not one gets all four XOR corners right. The best manage ${best} of 4; the sliders now show the one with the widest safety margin.`,
    )
  }

  const c = CORNERS[sel]
  return (
    <Figure
      title="One neuron, one straight line: AND, OR and XOR"
      caption={
        <>
          Each dot shows the answer the gate wants (orange circle = 1, blue square = 0); the shading is the neuron&rsquo;s answer (orange where <i>z</i> &gt; 0), and a
          red ring marks a mistake. Solve <b>AND</b> (slide <i>b</i> down until the line cuts off (1, 1)), then <b>OR</b>, then try <b>XOR</b> and press the button.
          Click a corner to feed it through the neuron diagram.
        </>
      }
    >
      <Segmented
        label="Gate"
        options={(['AND', 'OR', 'XOR'] as Gate[]).map((g) => ({ value: g, label: g }))}
        value={gate}
        onChange={(g) => {
          setGate(g)
          setMsg(null)
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem 1.25rem', width: '100%', alignItems: 'center' }}>
        <Plot x={XR} y={YR} width={340} height={336} margin={{ left: 38, right: 16, top: 14, bottom: 36 }} ariaLabel={`Unit square with the line ${num(w1)} x1 + ${num(w2)} x2 + ${num(b)} = 0; ${right} of 4 corners correct for ${gate}`}>
          {posPoly.length > 2 && <Path points={posPoly} closed fill="color-mix(in srgb, var(--viz-2) 20%, var(--surface))" color="none" width={0} />}
          {negPoly.length > 2 && <Path points={negPoly} closed fill="color-mix(in srgb, var(--viz-1) 13%, var(--surface))" color="none" width={0} />}
          <Grid xTicks={4} yTicks={4} />
          <Axes xLabel="x₁" yLabel="x₂" xTicks={4} yTicks={4} />
          {line && <Path points={line} color="var(--viz-ink)" width={2.5} />}
          {arrow && <Arrow from={arrow[0]} to={arrow[1]} color={W_C} width={2.5} label="w" />}
          <Corners targets={targets} preds={preds} sel={sel} onSel={setSel} />
        </Plot>
        <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'center', minWidth: 0 }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem', fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr style={{ color: 'var(--ink-3)' }}>
                {['x₁', 'x₂', 'z', 'ŷ', gate, ''].map((h, i) => (
                  <th key={i} style={{ padding: '2px 8px', fontWeight: 700, borderBottom: '1.5px solid var(--rule)', textAlign: 'center' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CORNERS.map(([p, q], i) => {
                const ok = preds[i] === targets[i]
                return (
                  <tr
                    key={i}
                    onClick={() => setSel(i)}
                    style={{ cursor: 'pointer', background: i === sel ? 'var(--surface-2)' : undefined, color: 'var(--ink)' }}
                  >
                    <td style={{ padding: '3px 8px', textAlign: 'center' }}>{p}</td>
                    <td style={{ padding: '3px 8px', textAlign: 'center' }}>{q}</td>
                    <td style={{ padding: '3px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{num(zs[i])}</td>
                    <td style={{ padding: '3px 8px', textAlign: 'center', fontWeight: 700 }}>{preds[i]}</td>
                    <td style={{ padding: '3px 8px', textAlign: 'center' }}>{targets[i]}</td>
                    <td style={{ padding: '3px 8px', textAlign: 'center', fontWeight: 800, color: ok ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>{ok ? '✓' : '✗'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <NeuronDiagram
            inputs={[
              { label: 'x₁', value: c[0] },
              { label: 'x₂', value: c[1] },
            ]}
            weights={[w1, w2]}
            weightNames={['w₁', 'w₂']}
            bias={b}
            z={zs[sel]}
            output={preds[sel]}
            outputText={preds[sel] === targets[sel] ? 'correct' : 'wrong'}
            ariaLabel={`Corner (${c[0]}, ${c[1]}) fed through the neuron: z = ${num(zs[sel])}, output ${preds[sel]}`}
          />
        </div>
      </div>
      <Controls>
        <Slider label="w₁" value={w1} min={-3} max={3} step={0.5} onChange={change(setW1)} format={(v) => num(v)} />
        <Slider label="w₂" value={w2} min={-3} max={3} step={0.5} onChange={change(setW2)} format={(v) => num(v)} />
        <Slider label="b" value={b} min={-3} max={3} step={0.5} onChange={change(setB)} format={(v) => num(v)} />
      </Controls>
      <Controls>
        <Readout items={[[`${gate} corners right`, `${right} / 4`]]} />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: solved ? 'var(--viz-pos)' : 'var(--ink-2)' }}>
          {solved ? 'Solved: one straight line does it.' : gate === 'XOR' && right === 3 ? 'So close. Can any line get all four?' : 'Keep sliding.'}
        </span>
        <Button primary onClick={search}>
          Try every slider setting
        </Button>
      </Controls>
      {msg && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-2)', width: '100%' }}>{msg}</p>}
    </Figure>
  )
}
