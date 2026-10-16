import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, FnPath, Dots, Label, Bars, useNarrow } from '../../../../../kit'
import { ridgePoly, polyEval, mse } from '../multiple-and-polynomial/linalg'
import { TRAIN_X, TRAIN_Y, VAL_X, VAL_Y } from '../multiple-and-polynomial/polyData'

/*
  The degree-9 polynomial from the previous lesson, now fitted with a ridge penalty:
    loss = MSE + λ (w₁² + … + w₉²)   (the constant w₀ is not penalised).
  The learner slides λ on a log scale and watches the wild curve calm down, the weights shrink,
  and the validation error fall and then rise again.
*/

const DEG = 9
const LOG_MIN = -9 // the leftmost slider position means λ = 0
const lamOf = (lg: number) => (lg <= LOG_MIN ? 0 : 10 ** lg)
const fit = (lam: number) => {
  const w = ridgePoly(TRAIN_X, TRAIN_Y, DEG, lam)
  const tr = mse(
    TRAIN_X.map((x) => polyEval(w, x)),
    TRAIN_Y,
  )
  const va = mse(
    VAL_X.map((x) => polyEval(w, x)),
    VAL_Y,
  )
  return { w, tr, va }
}
const OLS = fit(0)
const BEST_VAL = Math.min(...Array.from({ length: 101 }, (_, i) => fit(lamOf(LOG_MIN + i * 0.1)).va))

const SUP: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
}
const fmtLam = (lg: number) => {
  if (lg <= LOG_MIN) return '0 (no penalty)'
  const v = 10 ** lg
  if (v >= 0.01) return String(Number(v.toPrecision(2)))
  const [m, e] = v.toExponential(1).split('e')
  const exp = String(Number(e))
    .split('')
    .map((c) => SUP[c] ?? c)
    .join('')
  return `${m === '1.0' ? '' : m + ' × '}10${exp}`
}
const big = (v: number) => (Math.abs(v) >= 100 ? Math.round(v).toLocaleString('en-GB') : v.toFixed(2))

export default function RegularisedPolyFit() {
  const [lg, setLg] = useState(LOG_MIN)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const lam = lamOf(lg)
  const cur = useMemo(() => fit(lam), [lam])
  const penalty = cur.w.slice(1).reduce((s, v) => s + v * v, 0)
  const verdict =
    cur.tr > 0.09 ? 'underfitting: λ is so big the curve is squashed flat' : cur.va > 3 * BEST_VAL ? 'overfitting: the curve chases the noise' : 'a good fit'

  return (
    <Figure
      title="Taming a degree-9 curve with a penalty"
      caption={
        <>
          This is the overfitted degree-9 polynomial from the last lesson (10 weights, fitted to the 10 filled training points; the hollow points are new
          data). Slide <b>λ</b> to the right: the loss now charges λ for every unit of squared weight, so the huge, finely balanced weights become too expensive
          and the curve calms down. Keep going and it flattens into a horizontal line at the average of y. The dashed curve is the unpenalised fit, for
          comparison.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: narrow ? '1fr' : '1.3fr 1fr',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <Plot
          x={[-1.05, 1.05]}
          y={[-2.4, 2.4]}
          width={380}
          height={300}
          minHeight={250}
          margin={{ left: 34, top: 24 }}
          ariaLabel="Degree 9 polynomial fitted with a ridge penalty"
        >
          <Grid xTicks={8} yTicks={8} />
          <Axes xLabel="x" yLabel="y" xTicks={4} yTicks={4} origin />
          <Dots
            points={VAL_X.map((x, i) => ({
              x,
              y: VAL_Y[i],
              r: 4,
              hollow: true,
              color: 'var(--viz-2)',
            }))}
          />
          {lam > 0 && <FnPath f={(x) => polyEval(OLS.w, x)} color="var(--viz-muted)" width={1.8} dash="5 5" samples={400} />}
          <FnPath f={(x) => polyEval(cur.w, x)} color="var(--viz-4)" width={3.2} samples={400} />
          <Dots
            points={TRAIN_X.map((x, i) => ({
              x,
              y: TRAIN_Y[i],
              r: 5.5,
              color: 'var(--viz-1)',
            }))}
          />
          <Label x={-1.0} y={2.4} dy={2} color="var(--viz-4)" weight={700}>
            {lam === 0 ? 'λ = 0' : `λ = ${fmtLam(lg)}`}
          </Label>
        </Plot>
        <div style={{ display: 'grid', gap: 6, width: '100%' }}>
          <div
            style={{
              fontSize: 'var(--step--1)',
              fontWeight: 700,
              color: 'var(--ink-2)',
            }}
          >
            Weights w₁ … w₉ (bar length = size, cut off at 20; the sign is in the number)
          </div>
          <Bars
            data={cur.w.slice(1).map((v, k) => ({
              label: `w${'₁₂₃₄₅₆₇₈₉'[k]}`,
              value: v,
              color: 'var(--viz-4)',
            }))}
            max={20}
            format={big}
            ariaLabel="Polynomial weights"
          />
        </div>
      </div>
      <Controls>
        <Slider label="Penalty strength λ (log scale)" value={lg} min={LOG_MIN} max={1} step={0.1} onChange={setLg} format={fmtLam} />
      </Controls>
      <Readout
        items={[
          ['training MSE', cur.tr < 0.001 ? '< 0.001' : cur.tr.toFixed(3)],
          ['validation MSE', cur.va.toFixed(3)],
          ['penalty sum w₁² + … + w₉²', big(penalty)],
          [
            'verdict',
            <span
              style={{
                color: cur.tr > 0.09 || cur.va > 3 * BEST_VAL ? 'var(--viz-neg)' : 'var(--viz-pos)',
              }}
            >
              {verdict}
            </span>,
          ],
        ]}
      />
    </Figure>
  )
}
