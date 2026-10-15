import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Segmented, Plot, Grid, Axes, Arrow, Dots, Label, M, useNarrow } from '../../../../../kit'
import { ContourLines, Clipped, num } from './fieldKit'
import { Handle } from '../derivatives-as-slopes/plotHelpers'

/*
  Two gradients worth memorising, checked by brute force.
    f(w) = ||w||² = w₁² + w₂²   has  ∇f = 2w   (contours: circles round the origin)
    f(w) = wᵀx   = 2w₁ + w₂    has  ∇f = x    (contours: straight lines at right angles to x)
  The learner drags w and picks a step size h. The table compares the formula with the
  finite-difference estimate (f(w + h·eᵢ) − f(w)) / h, nudging one weight at a time.
*/

type Mode = 'norm' | 'dot'
const XV: [number, number] = [2, 1]
const X: [number, number] = [-3, 3]
const Y: [number, number] = [-2, 2]
const HS = [1, 0.5, 0.1, 0.01, 0.001]
const snap = (v: number) => Math.round(v * 10) / 10

const F: Record<Mode, (w: [number, number]) => number> = {
  norm: ([a, b]) => a * a + b * b,
  dot: ([a, b]) => a * XV[0] + b * XV[1],
}
const G: Record<Mode, (w: [number, number]) => [number, number]> = {
  norm: ([a, b]) => [2 * a, 2 * b],
  dot: () => [XV[0], XV[1]],
}

const cell: CSSProperties = { padding: '0.3rem 0.55rem', textAlign: 'right', borderBottom: '1px solid var(--viz-grid)', whiteSpace: 'nowrap' }
const headCell: CSSProperties = { ...cell, textAlign: 'left', fontWeight: 600, color: 'var(--ink-2)', whiteSpace: 'normal' }

export default function VectorGradientCheck() {
  const [mode, setMode] = useState<Mode>('norm')
  const [w, setW] = useState<[number, number]>([1, -0.5])
  const [h, setH] = useState(0.1)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const f = F[mode]
  const g = G[mode](w)
  const fw = f(w)
  const numeric: [number, number] = [(f([w[0] + h, w[1]]) - fw) / h, (f([w[0], w[1] + h]) - fw) / h]
  const err: [number, number] = [numeric[0] - g[0], numeric[1] - g[1]]
  // equal height steps for both functions, so packed contours mean a long gradient
  const levels = mode === 'norm' ? Array.from({ length: 12 }, (_, i) => i + 1) : [-8, -6, -4, -2, 0, 2, 4, 6, 8]
  // label 'w' beside the middle of its arrow, on the side away from the w₁-axis (never next to a tick number)
  const wl = Math.hypot(w[0], w[1])
  let nrm: [number, number] = wl > 1e-9 ? [w[1] / wl, w[0] / wl] : [0, -1] // screen-space normal to the arrow
  if ((w[1] >= 0 && nrm[1] > 0) || (w[1] < 0 && nrm[1] < 0)) nrm = [-nrm[0], -nrm[1]]
  const fmt = (v: number) => (Math.abs(v) < 5e-10 ? '0' : Math.abs(v) < 0.001 ? v.toExponential(1) : v.toFixed(3))
  const half = 0.5

  return (
    <Figure
      title="Check a gradient formula by nudging each weight"
      caption={
        <>
          Drag <b>w</b>. The orange arrow is the gradient from the formula (drawn at half length so it fits), always crossing the contours at right
          angles. The table checks the formula the slow way: nudge one weight by a small step <i>h</i>, see how much <i>f</i> changes, divide by <i>h</i>.
          Make <i>h</i> smaller and watch the estimate close in on the formula. For ‖w‖² the gap is exactly <i>h</i>; for wᵀx there is no gap at all.
          Why?
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1.1fr 1fr', gap: '0.75rem 1.25rem', alignItems: 'center' }}
      >
        <Plot
          x={X}
          y={Y}
          width={360}
          height={252}
          maxWidth={440}
          margin={{ left: 30, bottom: 28, right: 12, top: 12 }}
          ariaLabel={`Contours of ${mode === 'norm' ? 'the squared length of w (circles)' : 'w transpose x (parallel lines)'} with w = (${num(w[0])}, ${num(w[1])}) and its gradient (${num(g[0])}, ${num(g[1])})`}
        >
          <Grid xTicks={6} yTicks={4} />
          <ContourLines f={(a, b) => f([a, b])} fnKey={mode} levels={levels} res={72} color="color-mix(in srgb, var(--viz-1) 55%, var(--surface))" width={1.4} />
          <Axes origin xLabel="w₁" yLabel="w₂" xTicks={6} yTicks={4} />
          <Clipped>
            {mode === 'dot' && <Arrow from={[0, 0]} to={XV} color="var(--viz-5)" width={2.5} label="x" labelOffset={[6, 14]} />}
            <Arrow from={[0, 0]} to={w} color="var(--viz-1)" width={2.5} />
            <Arrow from={w} to={[w[0] + g[0] * half, w[1] + g[1] * half]} color="var(--viz-2)" width={3.5} label="∇f" />
          </Clipped>
          <Dots points={[{ x: 0, y: 0, r: 3, color: 'var(--viz-ink)' }]} stroke="none" />
          {wl > 0.35 && (
            <Label x={w[0] / 2} y={w[1] / 2} dx={nrm[0] * 13} dy={nrm[1] * 13 + 4} anchor="middle" color="var(--viz-1)" weight={800}>
              w
            </Label>
          )}
          <Handle x={w[0]} y={w[1]} r={8} color="var(--viz-1)" ariaLabel="the weight vector w: drag its tip" constrain={(a, b) => [snap(a), snap(b)]} onChange={(a, b) => setW([a, b])} />
        </Plot>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table className="tabular" style={{ borderCollapse: 'collapse', fontSize: '0.875rem', width: '100%', minWidth: 0 }}>
            <thead>
              <tr>
                <th style={headCell} />
                <th style={cell}>
                  <M>{'\\partial f/\\partial w_1'}</M>
                </th>
                <th style={cell}>
                  <M>{'\\partial f/\\partial w_2'}</M>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={headCell}>
                  formula <M>{mode === 'norm' ? '2w' : 'x'}</M>
                </td>
                <td style={cell}>{fmt(g[0])}</td>
                <td style={cell}>{fmt(g[1])}</td>
              </tr>
              <tr>
                <td style={headCell}>nudge estimate, h = {h}</td>
                <td style={cell}>{fmt(numeric[0])}</td>
                <td style={cell}>{fmt(numeric[1])}</td>
              </tr>
              <tr>
                <td style={{ ...headCell, borderBottom: 'none' }}>gap</td>
                <td style={{ ...cell, borderBottom: 'none', color: 'var(--viz-neg)' }}>{fmt(err[0])}</td>
                <td style={{ ...cell, borderBottom: 'none', color: 'var(--viz-neg)' }}>{fmt(err[1])}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: '0.875rem', color: 'var(--ink-2)', marginTop: '0.5rem' }}>
            <M>{mode === 'norm' ? `f(w) = w_1^2 + w_2^2 = ${num(fw, 3)}` : `f(w) = w^T x = 2w_1 + w_2 = ${num(fw, 3)}`}</M>
          </div>
        </div>
      </div>
      <Controls>
        <Segmented
          label="Function"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'norm', label: '‖w‖²' },
            { value: 'dot', label: 'wᵀx with x = [2, 1]' },
          ]}
        />
        <Segmented label="Nudge size h" value={h} onChange={setH} options={HS.map((v) => ({ value: v, label: String(v) }))} />
      </Controls>
    </Figure>
  )
}
