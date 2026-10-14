import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Path, Dots, Label, DraggablePoint, Axes, usePlot } from '../../../../../kit'

/*
  Two weights (w₁, w₂). The MSE is a bowl whose contour lines are ellipses centred on the
  unpenalised best fit ŵ. Regularisation as a budget: stay inside |w₁| + |w₂| ≤ t (L1, a diamond)
  or w₁² + w₂² ≤ t² (L2, a circle). The answer is where the smallest ellipse touches the region.
  The ellipse shape is fixed: Q(w) = (w − ŵ)ᵀ A (w − ŵ), A = R(−25°) diag(1, 0.3) R(−25°)ᵀ.
*/

type Vec2 = [number, number]
type Mode = 'l1' | 'l2'
const TH = (-25 * Math.PI) / 180
const EIG: Vec2 = [1, 0.3]
const R = [
  [Math.cos(TH), -Math.sin(TH)],
  [Math.sin(TH), Math.cos(TH)],
]
const A = [0, 1].map((i) => [0, 1].map((j) => R[i][0] * EIG[0] * R[j][0] + R[i][1] * EIG[1] * R[j][1]))
const quad = (d: Vec2) => d[0] * (A[0][0] * d[0] + A[0][1] * d[1]) + d[1] * (A[1][0] * d[0] + A[1][1] * d[1])
const Q = (w: Vec2, c: Vec2) => quad([w[0] - c[0], w[1] - c[1]])

function solveL1(c: Vec2, t: number): Vec2 {
  if (Math.abs(c[0]) + Math.abs(c[1]) <= t) return c
  const V: Vec2[] = [
    [t, 0],
    [0, t],
    [-t, 0],
    [0, -t],
  ]
  let best: Vec2 = V[0]
  let bestQ = Infinity
  for (let i = 0; i < 4; i++) {
    const P = V[i]
    const E = V[(i + 1) % 4]
    const d: Vec2 = [E[0] - P[0], E[1] - P[1]]
    const pc: Vec2 = [P[0] - c[0], P[1] - c[1]]
    const num = d[0] * (A[0][0] * pc[0] + A[0][1] * pc[1]) + d[1] * (A[1][0] * pc[0] + A[1][1] * pc[1])
    const s = Math.max(0, Math.min(1, -num / quad(d)))
    const w: Vec2 = [P[0] + s * d[0], P[1] + s * d[1]]
    const q = Q(w, c)
    if (q < bestQ) {
      bestQ = q
      best = w
    }
  }
  return best
}

function solveL2(c: Vec2, t: number): Vec2 {
  if (Math.hypot(c[0], c[1]) <= t) return c
  // w(μ) = (A + μI)⁻¹ A c shrinks as μ grows; find μ with ‖w‖ = t by bisection
  const Ac: Vec2 = [A[0][0] * c[0] + A[0][1] * c[1], A[1][0] * c[0] + A[1][1] * c[1]]
  const at = (mu: number): Vec2 => {
    const a = A[0][0] + mu
    const b = A[0][1]
    const d = A[1][1] + mu
    const det = a * d - b * b
    return [(d * Ac[0] - b * Ac[1]) / det, (-b * Ac[0] + a * Ac[1]) / det]
  }
  let lo = 0
  let hi = 1e6
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2
    const w = at(mid)
    if (Math.hypot(w[0], w[1]) > t) lo = mid
    else hi = mid
  }
  return at(hi)
}

/** Points on the contour Q(w) = level around centre c. */
function ellipse(c: Vec2, level: number): Vec2[] {
  const r = Math.sqrt(Math.max(level, 0))
  return Array.from({ length: 97 }, (_, k) => {
    const t = (k / 96) * 2 * Math.PI
    const u = [(r * Math.cos(t)) / Math.sqrt(EIG[0]), (r * Math.sin(t)) / Math.sqrt(EIG[1])]
    return [c[0] + R[0][0] * u[0] + R[0][1] * u[1], c[1] + R[1][0] * u[0] + R[1][1] * u[1]] as Vec2
  })
}

function Clipped({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))

export default function L1L2Constraint() {
  const [mode, setMode] = useState<Mode>('l1')
  const [c, setC] = useState<Vec2>([2.0, 0.9])
  const [t, setT] = useState(1.3)
  const w = useMemo(() => (mode === 'l1' ? solveL1(c, t) : solveL2(c, t)), [mode, c, t])
  const level = Q(w, c)
  const inside = level < 1e-12
  const zero = [Math.abs(w[0]) < 1e-9, Math.abs(w[1]) < 1e-9]
  const col = mode === 'l1' ? 'var(--viz-2)' : 'var(--viz-1)'
  const region: Vec2[] =
    mode === 'l1'
      ? [
          [t, 0],
          [0, t],
          [-t, 0],
          [0, -t],
        ]
      : Array.from({ length: 97 }, (_, k) => [t * Math.cos((k / 96) * 2 * Math.PI), t * Math.sin((k / 96) * 2 * Math.PI)] as Vec2)
  const levels = inside ? [0.3, 0.9, 1.8, 3.2] : [0.2, 0.5].map((k) => k * level).concat([1.6 * level])
  const sparseText = inside
    ? 'the budget is big enough: no shrinking needed'
    : zero[0] || zero[1]
      ? `w${zero[0] ? '₁' : '₂'} is exactly 0: that feature is dropped`
      : 'both weights shrink, neither is 0'

  return (
    <Figure
      title="Diamond corners make zeros"
      caption={
        <>
          Each oval joins weights with equal MSE; the orange point <b>ŵ</b> in the middle is the best fit with no penalty (drag it). The shaded shape is the
          weight budget. The answer (pink) is the lowest-MSE point inside the budget: where the growing ovals <b>first touch</b> the shape. With the L1 diamond
          that is very often a <b>corner</b>, which lies on an axis, so one weight is exactly 0. Switch to the L2 circle: no corners, so both weights usually
          stay non-zero.
        </>
      }
    >
      <Plot
        x={[-3.2, 3.2]}
        y={[-3.2, 3.2]}
        width={420}
        height={420}
        maxWidth={460}
        margin={{ left: 30, bottom: 30, top: 14, right: 14 }}
        ariaLabel={`${mode === 'l1' ? 'L1 diamond' : 'L2 circle'} budget with MSE contours; the answer is at (${f2(w[0])}, ${f2(w[1])})`}
      >
        <Path points={region} closed fill="var(--viz-fill)" color={col} width={2.5} />
        <Axes origin xLabel="w₁" yLabel="w₂" xTicks={6} yTicks={6} />
        {levels.map((lv, i) => (
          <Path key={i} points={ellipse(c, lv)} color="color-mix(in srgb, var(--viz-5) 55%, var(--surface))" width={1.4} />
        ))}
        {!inside && <Path points={ellipse(c, level)} color="var(--viz-4)" width={2.5} />}
        <Clipped>
          <Path points={[c, w]} color="var(--viz-muted)" width={1.5} dash="4 4" />
          {!inside && <Dots points={[{ x: w[0], y: w[1], r: 7, color: 'var(--viz-4)' }]} />}
          {!inside && (
            <Label
              x={w[0]}
              y={w[1]}
              dx={w[0] > 1.6 ? -10 : 10}
              dy={w[1] > 2.6 ? 20 : -12}
              anchor={w[0] > 1.6 ? 'end' : 'start'}
              color="var(--viz-4)"
              weight={700}
            >
              {`(${f2(w[0])}, ${f2(w[1])})`}
            </Label>
          )}
        </Clipped>
        <DraggablePoint
          x={c[0]}
          y={c[1]}
          color="var(--viz-2)"
          label="ŵ"
          constrain={(x, y) => [Math.round(x * 20) / 20, Math.round(y * 20) / 20]}
          onChange={(x, y) => setC([x, y])}
        />
      </Plot>
      <Controls>
        <Segmented
          label="Penalty"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'l1', label: 'L1 diamond' },
            { value: 'l2', label: 'L2 circle' },
          ]}
        />
        <Slider label="Budget t (smaller t = bigger λ)" value={t} min={0.2} max={3} step={0.05} onChange={setT} format={(v) => v.toFixed(2)} />
      </Controls>
      <Readout
        items={[
          ['no-penalty best ŵ', `(${f2(c[0])}, ${f2(c[1])})`],
          ['answer w', `(${f2(w[0])}, ${f2(w[1])})`],
          ['budget', mode === 'l1' ? `|w₁| + |w₂| ≤ ${t.toFixed(2)}` : `w₁² + w₂² ≤ ${t.toFixed(2)}²`],
          [
            'result',
            <span
              style={{
                color: !inside && (zero[0] || zero[1]) ? 'var(--viz-neg)' : undefined,
              }}
            >
              {sparseText}
            </span>,
          ],
        ]}
      />
    </Figure>
  )
}
