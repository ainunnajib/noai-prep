import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, VLine, Label, useNarrow } from '../../../../../kit'
import { lstsq, polyRow, polyEval, mse } from './linalg'
import { TRAIN_X, TRAIN_Y, VAL_X, VAL_Y } from './polyData'

/*
  Fit polynomials of degree 0..9 to 10 training points. Left: the fitted curve with the training
  points (filled) and fresh validation points (hollow). Right: training and validation MSE against
  degree on a log scale. Training error always falls; validation error is U-shaped.
*/

const DEGREES = Array.from({ length: 10 }, (_, d) => d)
const FITS = DEGREES.map((d) => {
  const w = lstsq(
    TRAIN_X.map((x) => polyRow(x, d)),
    TRAIN_Y,
  )
  const tr = mse(
    TRAIN_X.map((x) => polyEval(w, x)),
    TRAIN_Y,
  )
  const va = mse(
    VAL_X.map((x) => polyEval(w, x)),
    VAL_Y,
  )
  return { w, tr, va, maxW: Math.max(...w.map(Math.abs)) }
})
const BEST_VAL = Math.min(...FITS.map((f) => f.va))
const LOG_MIN = -3
const lg = (v: number) => Math.max(LOG_MIN, Math.log10(Math.max(v, 1e-12)))
const fmtMSE = (v: number) => (v < 0.001 ? '< 0.001' : v.toFixed(3))
const tick = (v: number) => {
  const p = 10 ** v
  return p >= 1 ? String(Math.round(p)) : String(Number(p.toPrecision(1)))
}

export default function DegreeSweep() {
  const [deg, setDeg] = useState(1)
  const [showVal, setShowVal] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const fit = FITS[deg]
  const verdict =
    fit.tr > 0.09
      ? 'underfitting: misses the pattern even on the training points'
      : fit.va > 3 * BEST_VAL
        ? 'overfitting: memorises the noise, fails on new points'
        : 'a good fit'
  const verdictColor = verdict === 'a good fit' ? 'var(--viz-pos)' : 'var(--viz-neg)'
  const curve = useMemo(() => (x: number) => polyEval(fit.w, x), [fit])

  return (
    <Figure
      title="More powers, more wiggles"
      caption={
        <>
          Slide the <b>degree</b> from 0 to 9. The model is fitted to the 10 filled points only; the hollow points are fresh data it never saw. Training error
          (blue) keeps falling and hits 0 at degree 9, where the curve threads every training point. Validation error (orange) falls, then shoots up. Watch the
          largest weight too: overfitting curves need huge, finely balanced weights.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: narrow ? '1fr' : '1.15fr 1fr',
          gap: 12,
          alignItems: 'start',
        }}
      >
        <Plot
          x={[-1.05, 1.05]}
          y={[-2.4, 2.4]}
          width={360}
          height={290}
          minHeight={250}
          margin={{ left: 34, top: 24 }}
          ariaLabel={`Degree ${deg} polynomial fitted to 10 training points`}
        >
          <Grid xTicks={8} yTicks={8} />
          <Axes xLabel="x" yLabel="y" xTicks={4} yTicks={4} origin />
          {showVal && (
            <Dots
              points={VAL_X.map((x, i) => ({
                x,
                y: VAL_Y[i],
                r: 4,
                hollow: true,
                color: 'var(--viz-2)',
              }))}
            />
          )}
          <FnPath f={curve} color="var(--viz-4)" width={3} samples={400} />
          <Dots
            points={TRAIN_X.map((x, i) => ({
              x,
              y: TRAIN_Y[i],
              r: 5.5,
              color: 'var(--viz-1)',
            }))}
          />
          <Label x={-1.0} y={2.4} dy={14} color="var(--viz-4)" weight={700}>
            {`degree ${deg}`}
          </Label>
        </Plot>
        <Plot
          x={[-0.5, 9.5]}
          y={[LOG_MIN - 0.2, 1.5]}
          width={320}
          height={290}
          minHeight={230}
          margin={{ left: 46, top: 24 }}
          ariaLabel="Training and validation error against polynomial degree"
        >
          <Grid xTicks={10} yTicks={5} />
          <Axes xLabel="degree" xTicks={10} hideYTicks />
          <Axes yLabel="MSE (log scale)" yTicks={5} hideXTicks tickFormat={(v) => (Number.isInteger(v) && v <= 1.5 && v >= LOG_MIN ? tick(v) : '')} />
          <VLine x={deg} color="var(--viz-4)" dash="5 4" />
          <Path points={FITS.map((f, d) => [d, lg(f.tr)])} color="var(--viz-1)" width={2.5} />
          {showVal && <Path points={FITS.map((f, d) => [d, lg(f.va)])} color="var(--viz-2)" width={2.5} />}
          <Dots
            points={FITS.map((f, d) => ({
              x: d,
              y: lg(f.tr),
              r: d === deg ? 6 : 3.5,
              color: 'var(--viz-1)',
            }))}
          />
          {showVal && (
            <Dots
              points={FITS.map((f, d) => ({
                x: d,
                y: lg(f.va),
                r: d === deg ? 6 : 3.5,
                color: 'var(--viz-2)',
              }))}
            />
          )}
          <Label x={5} y={lg(FITS[5].tr)} dy={18} anchor="middle" color="var(--viz-1)" weight={700}>
            training
          </Label>
          {showVal && (
            <Label x={5} y={lg(FITS[5].va)} dy={-10} anchor="middle" color="var(--viz-2)" weight={700}>
              validation
            </Label>
          )}
        </Plot>
      </div>
      <Controls>
        <Slider label="Polynomial degree" value={deg} min={0} max={9} onChange={setDeg} />
        <Toggle label="Show validation points" checked={showVal} onChange={setShowVal} />
      </Controls>
      <Readout
        items={[
          ['training MSE', fmtMSE(fit.tr)],
          ['validation MSE', fmtMSE(fit.va)],
          ['largest |weight|', fit.maxW < 10 ? fit.maxW.toFixed(2) : Math.round(fit.maxW).toLocaleString('en-GB')],
          ['verdict', <span style={{ color: verdictColor }}>{verdict}</span>],
        ]}
      />
    </Figure>
  )
}
