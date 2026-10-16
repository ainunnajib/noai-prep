import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, FnPath, Path, VLine, Label, Bars, DraggablePoint, usePlot, useNarrow, M } from '../../../../../kit'
import { normalPdf, normalCdf, upperZ } from './stats'

/*
  Type I versus Type II errors for a one-tailed coin test. x is the fraction of heads in n tosses.
  Blue: its distribution if H₀ is true (fair coin). Pink: if H₁ is true (the coin lands heads with
  probability p₁). Both are drawn with the CLT's normal approximation, sd = √(p(1 − p)/n).
  We reject H₀ when the fraction is at or beyond the threshold c, chosen so that P(reject | H₀) = α.
  Each error is a tail of its own curve, drawn in that curve's colour: blue area = α (Type I, the
  fair-coin curve beyond the threshold), pink area = β (Type II, the biased-coin curve before it),
  light green = power. Direct labels name the areas. Drag the threshold or slide α: one error can
  only shrink if the other grows. Slide n up: both curves narrow and both errors fall.
*/

const X0 = 0.2
const X1 = 1

/**
 * "power" label just right of the threshold, tucked under the H₁ curve. If that spot would hit
 * the α label (which sits on top of the H₀ tail at the threshold), it moves just below it.
 */
function PowerLabel({ c, f0, f1 }: { c: number; f0: (x: number) => number; f1: (x: number) => number }) {
  const { xs, ys } = usePlot()
  const W = 40 // width of "power" in px
  const x0 = xs(c) + 7
  const fmin = Math.min(f1(xs.invert(x0)), f1(xs.invert(x0 + W)))
  const floor = ys(0) - 3
  let base = Math.min(floor, ys(fmin) + 14)
  const alphaBase = ys(f0(c)) - 5
  const alphaTop = alphaBase - 13
  if (base > alphaTop - 2 && base - 11 < alphaBase + 2) base = alphaBase + 15
  if (base > floor || base - 11 < ys(fmin) - 1) return null
  return (
    <text x={x0} y={base} className="plot-label" style={{ fill: 'var(--viz-3)', fontWeight: 800, fontSize: 13 }}>
      power
    </text>
  )
}

function area(f: (x: number) => number, a: number, b: number): [number, number][] {
  const lo = Math.max(X0, a)
  const hi = Math.min(X1, b)
  if (hi <= lo) return []
  const steps = 90
  const pts: [number, number][] = [[lo, 0]]
  for (let i = 0; i <= steps; i++) {
    const x = lo + ((hi - lo) * i) / steps
    pts.push([x, f(x)])
  }
  pts.push([hi, 0])
  return pts
}

export default function ErrorTradeoff() {
  const [alpha, setAlpha] = useState(0.05)
  const [n, setN] = useState(100)
  const [p1, setP1] = useState(0.6)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(480)

  const se0 = Math.sqrt(0.25 / n)
  const se1 = Math.sqrt((p1 * (1 - p1)) / n)
  const c = 0.5 + upperZ(alpha) * se0
  const beta = normalCdf(c, p1, se1)
  const f0 = (x: number) => normalPdf(x, 0.5, se0)
  const f1 = (x: number) => normalPdf(x, p1, se1)
  const yTop = Math.max(f0(0.5), f1(p1)) * 1.22
  // direct labels: α just right of the threshold above the H₀ tail; β and power inside their areas
  const xb = Math.max(X0 + 0.02, c - 0.9 * se1)

  const onDrag = (x: number) => {
    const a = 1 - normalCdf(x, 0.5, se0)
    setAlpha(Math.min(0.25, Math.max(0.005, Math.round(a / 0.005) * 0.005)))
  }

  return (
    <Figure
      title="Type I and Type II errors pull against each other"
      caption={
        <>
          Blue: the fraction of heads you might see if the coin is fair (H₀). Pink: what you might see if it really lands heads with probability{' '}
          <M>{'p_1'}</M> (H₁). You reject H₀ when the fraction lands right of the threshold. <b>Blue area</b> = rejecting a true H₀ (Type I, probability{' '}
          <M>{'\\alpha'}</M>); <b>pink area</b> = missing a real bias (Type II, probability <M>{'\\beta'}</M>); <b>green area</b> = power{' '}
          <M>{'1 - \\beta'}</M>, catching the real bias. Drag the threshold or slide <M>{'\\alpha'}</M>: making one error rarer makes the other more
          common. Then raise <M>n</M>: more tosses shrink both. (The curves use the normal approximation.)
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot
          x={[X0, X1]}
          y={[0, yTop]}
          width={560}
          height={300}
          maxWidth={680}
          minHeight={260}
          margin={{ left: 18, right: 16, bottom: 38, top: 16 }}
          ariaLabel={`Null and alternative distributions; threshold ${c.toFixed(3)}, alpha ${alpha.toFixed(3)}, beta ${beta.toFixed(3)}`}
        >
          <Grid xTicks={8} yTicks={0} />
          <Axes xLabel={`fraction of heads in ${n} tosses`} xTicks={narrow ? 4 : 8} yTicks={0} hideYTicks />
          <Path points={area(f1, c, X1)} closed color="none" fill="color-mix(in srgb, var(--viz-3) 20%, transparent)" />
          <Path points={area(f1, X0, c)} closed color="none" fill="color-mix(in srgb, var(--viz-4) 40%, transparent)" />
          <Path points={area(f0, c, X1)} closed color="none" fill="color-mix(in srgb, var(--viz-1) 70%, transparent)" />
          <FnPath f={f0} color="var(--viz-1)" width={2.5} samples={300} />
          <FnPath f={f1} color="var(--viz-4)" width={2.5} samples={300} />
          <Label x={c} y={f0(c)} dx={5} dy={-5} color="var(--viz-1)" weight={800} size={15}>
            α
          </Label>
          {beta > 0.02 && (
            <Label x={xb} y={f1(xb) * 0.35} anchor="middle" color="var(--viz-4)" weight={800} size={15}>
              β
            </Label>
          )}
          {1 - beta > 0.02 && <PowerLabel c={c} f0={f0} f1={f1} />}
          <Label x={0.5} y={f0(0.5)} dx={-6} dy={-6} anchor="end" color="var(--viz-1)" weight={700}>
            {narrow ? 'H₀ fair' : 'H₀: fair coin'}
          </Label>
          <Label x={p1} y={f1(p1)} dx={6} dy={-6} color="var(--viz-4)" weight={700}>
            {narrow ? `H₁: p₁ = ${p1.toFixed(2)}` : `H₁: heads with p₁ = ${p1.toFixed(2)}`}
          </Label>
          <VLine x={c} color="var(--viz-ink)" dash="" width={2} />
          <Label x={c} y={yTop} dx={6} dy={14} color="var(--viz-ink)" weight={700} size={12}>
            {narrow ? 'reject H₀ →' : 'threshold: reject H₀ to the right →'}
          </Label>
          <DraggablePoint x={c} y={0} lockY r={8} color="var(--viz-ink)" constrain={(x) => [Math.max(0.5, Math.min(0.95, x)), 0]} onChange={(x) => onDrag(x)} />
        </Plot>
      </div>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <Bars
          max={1}
          format={(v) => v.toFixed(3)}
          ariaLabel="Error probabilities"
          data={[
            { label: 'Type I error, α', value: alpha, color: 'var(--viz-1)' },
            { label: 'Type II error, β', value: beta, color: 'var(--viz-4)' },
            { label: 'power, 1 − β', value: 1 - beta, color: 'var(--viz-3)' },
          ]}
        />
      </div>
      <Controls>
        <Slider label={<>significance level α</>} value={alpha} min={0.005} max={0.25} step={0.005} onChange={setAlpha} format={(v) => v.toFixed(3)} />
        <Slider label={<>number of tosses n</>} value={n} min={20} max={400} step={10} onChange={setN} />
        <Slider label={<>true p₁ under H₁</>} value={p1} min={0.55} max={0.8} step={0.05} onChange={setP1} format={(v) => v.toFixed(2)} />
      </Controls>
      <Readout
        items={[
          ['reject H₀ if heads ≥', `${Math.ceil(c * n - 1e-9)} of ${n} (threshold ${(c * 100).toFixed(1)}%)`],
        ]}
      />
    </Figure>
  )
}
