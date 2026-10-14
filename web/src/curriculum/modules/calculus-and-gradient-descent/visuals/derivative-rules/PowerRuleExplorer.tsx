import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, DraggablePoint, MBlock } from '../../../../../kit'
import { TangentSeg, Legend, fx, ft } from '../derivatives-as-slopes/plotHelpers'

/*
  The power rule as a shortcut for the zoom-in picture. The curve c·xⁿ (blue) and the formula
  c·n·xⁿ⁻¹ (orange) share the axes. At the draggable point, the tangent's slope is MEASURED
  numerically (rise over a tiny run) and compared with the formula's value: they always agree,
  and the orange curve's height equals the blue curve's slope.
*/

const X: [number, number] = [-2, 2]
const Y: [number, number] = [-6, 6]

/** x^n that also handles integer n for negative x; fractional n only for x >= 0 */
function pow(x: number, n: number): number {
  if (n === 0) return 1
  if (Number.isInteger(n)) return x ** n
  return x >= 0 ? x ** n : NaN
}

/** TeX for c·x^n, e.g. 2x^{3}, x, 1.5x^{0.5}, 3 */
function term(c: number, n: number): string {
  if (c === 0) return '0'
  if (n === 0) return ft(c, 2)
  const cs = c === 1 ? '' : c === -1 ? '-' : ft(c, 2)
  const xs = n === 1 ? 'x' : `x^{${ft(n, 2)}}`
  return cs + xs
}

export default function PowerRuleExplorer() {
  const [n, setN] = useState(3)
  const [c, setC] = useState(1)
  const [x0, setX0] = useState(1.2)
  const [showD, setShowD] = useState(true)

  const frac = !Number.isInteger(n)
  const xMin = frac ? 0.05 : X[0]
  const xp = Math.max(xMin, x0)
  const f = (x: number) => c * pow(x, n)
  const d = (x: number) => (n === 0 ? 0 : c * n * pow(x, n - 1))
  const y0 = f(xp)
  const formula = d(xp)
  const hh = 1e-4
  const measured = frac ? (f(xp + hh) - f(xp)) / hh : (f(xp + hh) - f(xp - hh)) / (2 * hh)
  const onChart = Number.isFinite(y0) && y0 >= Y[0] && y0 <= Y[1]
  const dOnChart = Number.isFinite(formula) && formula >= Y[0] && formula <= Y[1]

  const lhs = `\\frac{d}{dx}\\left(${term(c, n)}\\right)`
  const rhs = n === 0 || c === 0 ? '0' : term(c * n, n - 1)
  const tex = `${lhs} = ${n === 0 || c === 0 ? '' : `${ft(c, 2)} \\times ${ft(n, 2)} \\times x^{${ft(n, 2)} - 1} = `}${rhs}`

  return (
    <Figure
      title="The power rule, measured"
      caption={
        <>
          Pick a power <i>n</i> and a coefficient <i>c</i>, then drag the point along the blue curve. The readout measures the tangent&apos;s slope by
          zooming in (rise over a run of 0.0001) and compares it with the power-rule formula: they always match. The orange curve is the formula itself,
          so its <b>height</b> at any <i>x</i> equals the blue curve&apos;s <b>slope</b> there. Try <i>n</i> = 1 (a line: constant slope) and <i>n</i> = 0 (a
          constant: slope 0).
        </>
      }
    >
      <MBlock>{tex}</MBlock>
      <Legend
        items={[
          { color: 'var(--viz-1)', label: 'the curve y = c·xⁿ' },
          { color: 'var(--viz-2)', label: 'its slope, from the formula', dash: true },
          { color: 'var(--viz-3)', label: 'tangent' },
        ]}
      />
      <Plot x={X} y={Y} width={520} height={340} minHeight={290} maxWidth={680} ariaLabel={`Graph of ${term(c, n)} and its derivative`}>
        <Grid xTicks={8} yTicks={6} />
        <Axes origin xTicks={8} yTicks={6} xLabel="x" />
        {showD && <FnPath f={d} color="var(--viz-2)" width={2.5} dash="8 5" samples={400} />}
        <FnPath f={f} color="var(--viz-1)" width={3} samples={400} />
        {showD && dOnChart && (
          <>
            <Path points={[[xp, onChart ? y0 : Math.max(Y[0], Math.min(Y[1], y0))], [xp, formula]]} color="var(--viz-muted)" width={1.2} dash="3 4" />
            <Dots points={[{ x: xp, y: formula, r: 6, color: 'var(--viz-2)' }]} />
          </>
        )}
        {onChart && <TangentSeg x={xp} y={y0} slope={measured} len={80} color="var(--viz-3)" width={3} />}
        {onChart && (
          <DraggablePoint
            x={xp}
            y={y0}
            color="var(--viz-1)"
            constrain={(nx) => {
              const s = Math.max(xMin, Math.round(nx * 20) / 20)
              return [s, f(s)]
            }}
            onChange={(nx) => setX0(nx)}
          />
        )}
      </Plot>
      <Controls>
        <Slider label="power n" value={n} min={0} max={4} step={0.5} onChange={setN} />
        <Slider label="coefficient c" value={c} min={-2} max={3} step={0.5} onChange={setC} />
      </Controls>
      <Controls>
        <Slider label="x" value={xp} min={xMin} max={X[1]} step={0.05} onChange={setX0} format={(v) => fx(v, 2)} />
        <Toggle label="Show the formula's curve" checked={showD} onChange={setShowD} />
      </Controls>
      <Readout
        items={[
          ['measured slope', Number.isFinite(measured) ? fx(measured, 4) : 'vertical'],
          ['formula c·n·xⁿ⁻¹', Number.isFinite(formula) ? fx(formula, 4) : '∞'],
          ...(frac ? [['note', 'fractional n: x ≥ 0 only'] as [string, string]] : []),
        ]}
      />
    </Figure>
  )
}
