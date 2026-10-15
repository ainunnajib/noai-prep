import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, Label, Rect, useNarrow, M } from '../../../../../kit'
import { Handle, LineThrough, fx, panelTitle, twoCol } from './plotHelpers'

/*
  Secant → tangent on f(x) = x². P is fixed (draggable along the curve), Q = P + h.
  As h shrinks, the secant through P and Q swings onto the tangent, the slope read-out
  converges to f'(a) = 2a, and the right-hand panel zooms in on P (same aspect ratio, so
  angles are preserved) until the curve is indistinguishable from a straight line.
*/

const f = (x: number) => x * x
const X: [number, number] = [-2, 3.5]
const Y: [number, number] = [-1, 12.5]
const ASPECT = (Y[1] - Y[0]) / (X[1] - X[0]) // y-units per x-unit, kept in the zoom window
const H_PRESETS = [1, 0.5, 0.1, 0.01, 0.001]

/** decimals to show for a given h so that the convergence is visible */
const dpFor = (h: number) => (Math.abs(h) >= 0.5 ? 2 : Math.abs(h) >= 0.05 ? 3 : Math.abs(h) >= 0.005 ? 4 : 5)

export default function TangentZoom() {
  const [a, setA] = useState(1)
  const [h, setH] = useState(1)
  const [showTangent, setShowTangent] = useState(true)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const fa = f(a)
  const q = a + h
  const fq = f(q)
  const rise = fq - fa
  const zero = Math.abs(h) < 1e-9
  const secant = zero ? NaN : rise / h
  const deriv = 2 * a
  const dp = dpFor(h)

  // zoom window: centred on P, just wide enough to show Q, same aspect ratio as the main plot
  const w = Math.min(1.6, Math.max(0.003, 1.6 * Math.abs(h)))
  const zx: [number, number] = [a - w, a + w]
  const zy: [number, number] = [fa - w * ASPECT, fa + w * ASPECT]
  const zoom = (X[1] - X[0]) / (2 * w)

  const pw = narrow ? 340 : 330
  const ph = narrow ? 300 : 320

  const triangle = (opts: { label: boolean }) =>
    !zero && (
      <>
        <Path points={[[a, fa], [q, fa], [q, fq]]} color="var(--viz-muted)" width={1.6} dash="5 4" />
        {opts.label && h >= 0.4 && (
          <>
            <Label x={(a + q) / 2} y={fa} dy={16} anchor="middle" color="var(--ink-2)" size={12}>
              run
            </Label>
            <Label x={q} y={(fa + fq) / 2} dx={6} dy={4} anchor="start" color="var(--ink-2)" size={12}>
              rise
            </Label>
          </>
        )}
      </>
    )

  return (
    <Figure
      title="From secant to tangent"
      caption={
        <>
          The orange <b>secant</b> joins P and Q, a distance <M>h</M> apart. Slide <M>h</M> towards 0 or pick a value of <M>h</M>: the secant swings onto the green
          dashed <b>tangent</b>, its slope settles on one number, and the zoomed panel magnifies the view around P until the curve looks perfectly straight. At exactly{' '}
          <M>h = 0</M> the slope would be <M>0/0</M>, so the derivative is the value the slopes <i>approach</i>. Drag P (or Q) to try another point.
        </>
      }
    >
      <div ref={ref} style={twoCol(narrow)}>
        <div>
          <div style={panelTitle}>The whole curve y = x²</div>
          <Plot x={X} y={Y} width={pw} height={ph} maxWidth={420} ariaLabel={`Parabola y equals x squared with a secant from x = ${a} to x = ${fx(q, 3)}`}>
            <Grid xTicks={6} yTicks={6} />
            <Axes origin xTicks={6} yTicks={6} xLabel="x" yLabel="y" />
            <Rect x0={zx[0]} x1={zx[1]} y0={zy[0]} y1={zy[1]} fill="color-mix(in srgb, var(--viz-5) 10%, transparent)" stroke="var(--viz-5)" />
            <FnPath f={f} color="var(--viz-1)" width={3} />
            {showTangent && <LineThrough x={a} y={fa} slope={deriv} color="var(--viz-3)" width={2.2} dash="7 5" />}
            {!zero && <LineThrough x={a} y={fa} slope={secant} color="var(--viz-2)" width={2.6} />}
            {triangle({ label: true })}
            <Handle
              x={q}
              y={fq}
              r={7}
              color="var(--viz-2)"
              label={Math.abs(h) < 0.15 ? undefined : 'Q'}
              ariaLabel="point Q"
              constrain={(x) => {
                const nx = Math.round(Math.max(X[0], Math.min(X[1], x)) * 100) / 100
                return [nx, f(nx)]
              }}
              onChange={(x) => setH(Math.round((x - a) * 100) / 100)}
            />
            <Handle
              x={a}
              y={fa}
              r={8}
              color="var(--viz-1)"
              label="P"
              ariaLabel="point P"
              constrain={(x) => {
                const nx = Math.round(Math.max(-0.5, Math.min(2, x)) * 10) / 10
                return [nx, f(nx)]
              }}
              onChange={(x) => {
                setA(x)
                setH((hh) => Math.max(X[0] - x, Math.min(X[1] - x, hh)))
              }}
            />
          </Plot>
        </div>
        <div>
          <div style={panelTitle}>Zoomed in on P: ×{zoom < 100 ? zoom.toFixed(1) : Math.round(zoom).toLocaleString('en-GB')}</div>
          <Plot x={zx} y={zy} width={pw} height={ph} maxWidth={420} margin={{ left: 12, right: 12, bottom: 12, top: 12 }} ariaLabel={`Zoomed view around P, magnified ${Math.round(zoom)} times`}>
            <Grid xTicks={6} yTicks={6} />
            <FnPath f={f} color="var(--viz-1)" width={3.5} />
            {showTangent && <LineThrough x={a} y={fa} slope={deriv} color="var(--viz-3)" width={2.2} dash="7 5" />}
            {!zero && <LineThrough x={a} y={fa} slope={secant} color="var(--viz-2)" width={2.6} />}
            {triangle({ label: false })}
            <Dots
              points={[
                { x: a, y: fa, r: 7, color: 'var(--viz-1)', label: 'P' },
                ...(zero ? [] : [{ x: q, y: fq, r: 6, color: 'var(--viz-2)', label: 'Q' }]),
              ]}
            />
          </Plot>
        </div>
      </div>
      <Controls>
        <Slider label="h (distance from P to Q)" value={h} min={-1.5} max={1.5} step={0.001} onChange={(v) => setH(Math.max(X[0] - a, Math.min(X[1] - a, v)))} format={(v) => fx(v, 3)} />
        <Segmented
          label="Jump to h ="
          value={H_PRESETS.find((v) => Math.abs(v - h) < 1e-9) ?? -1}
          onChange={(v) => setH(Math.max(X[0] - a, Math.min(X[1] - a, v)))}
          options={H_PRESETS.map((v) => ({ value: v, label: String(v) }))}
        />
        <Toggle label="Show the tangent" checked={showTangent} onChange={setShowTangent} />
      </Controls>
      <Readout
        items={[
          ['P', `(${fx(a, 1)}, ${fx(fa, 2)})`],
          ['rise ÷ run', zero ? '0 ÷ 0' : `${fx(rise, dp + 1)} ÷ ${fx(h, dp + 1)}`],
          ['secant slope', zero ? 'undefined' : fx(secant, dp)],
          ['tangent slope', fx(deriv, 2)],
        ]}
      />
    </Figure>
  )
}
