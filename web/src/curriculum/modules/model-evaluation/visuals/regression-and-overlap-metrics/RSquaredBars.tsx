import { useState } from 'react'
import { Figure, Controls, Button, Plot, Grid, Axes, Dots, Path, HLine, Label, DraggablePoint, Bars, M, useNarrow } from '../../../../../kit'
import { ErrorSquares, ResidualLines } from './shared'
import s from './reg.module.css'

/*
  R² compares your model's squared errors with those of the laziest sensible model: always
  predicting the mean. Left: the mean line and its squares (total area = SS_tot). Right: the
  learner's line (drag its two ends) and its squares (total area = SS_res).
  R² = 1 - SS_res / SS_tot. Make the line worse than the flat mean line and R² goes negative.
*/

const XS = [1, 2, 3, 5, 6, 7, 9]
const YS = [9, 16, 12, 24, 19, 28, 32]
const N = XS.length
const YBAR = YS.reduce((a, b) => a + b, 0) / N
const SS_TOT = YS.reduce((a, y) => a + (y - YBAR) ** 2, 0)

// least-squares line, computed from the data
const XBAR = XS.reduce((a, b) => a + b, 0) / N
const W_LS = XS.reduce((a, x, i) => a + (x - XBAR) * (YS[i] - YBAR), 0) / XS.reduce((a, x) => a + (x - XBAR) ** 2, 0)
const B_LS = YBAR - W_LS * XBAR

const XL = 0.5
const XR = 9.5
const Y_MAX = 45

const snap = (v: number) => Math.max(0, Math.min(Y_MAX, Math.round(v * 2) / 2))
const r1 = (v: number) => Math.round(v * 10) / 10

export default function RSquaredBars() {
  const [ends, setEnds] = useState<[number, number]>([12, 28])
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const line = (x: number) => ends[0] + ((ends[1] - ends[0]) * (x - XL)) / (XR - XL)
  const preds = XS.map(line)
  const ssRes = YS.reduce((a, y, i) => a + (y - preds[i]) ** 2, 0)
  const r2 = 1 - ssRes / SS_TOT
  const rmse = Math.sqrt(ssRes / N)
  const mae = YS.reduce((a, y, i) => a + Math.abs(y - preds[i]), 0) / N
  const rmseMean = Math.sqrt(SS_TOT / N)

  const meanPts = XS.map((x, i) => ({ x, y: YS[i], p: YBAR }))
  const modelPts = XS.map((x, i) => ({ x, y: YS[i], p: preds[i] }))
  const dataDots = XS.map((x, i) => ({ x, y: YS[i], r: 5.5, color: 'var(--viz-1)' }))

  const blue = 'var(--viz-5)'
  const orange = 'var(--viz-2)'
  const r2Color = r2 < 0 ? 'var(--viz-neg)' : r2 > 0.8 ? 'var(--viz-pos)' : 'var(--ink)'
  const plotW = narrow ? 420 : 330
  const plotH = narrow ? 300 : 290

  return (
    <Figure
      title="R²: how much better than always guessing the mean?"
      caption={
        <>
          Each square's side is one prediction's error, so its area is the squared error. On the left, the "model" ignores the distance and always
          predicts the average ride time, {YBAR} min: its squares add up to <M>{'SS_{tot}'}</M>. On the right, drag the two orange ends of your line:
          its squares add up to <M>{'SS_{res}'}</M>. R² is the fraction of the left-hand area that your line gets rid of. Press <b>Best fit</b> for the
          least-squares line, <b>Flat at the mean</b> to see R² = 0 exactly, and <b>Worse than the mean</b> to watch R² go negative.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <div className={s.panels}>
          <div className={s.panel}>
            <p className={s.panelTitle}>
              <span className={s.badge} style={{ color: blue }}>
                Baseline: always predict the mean
              </span>
            </p>
            <Plot x={[0, 10]} y={[0, Y_MAX]} width={plotW} height={plotH} minHeight={240} margin={{ left: 36, right: 10, top: 12, bottom: 36 }} ariaLabel={`Data with the mean line at ${YBAR} minutes; total squared error ${r1(SS_TOT)}`}>
              <Grid xTicks={5} yTicks={9} />
              <ErrorSquares pts={meanPts} color={blue} opacity={20} />
              <Axes xLabel="distance (km)" yLabel="minutes" xTicks={5} yTicks={5} />
              <ResidualLines pts={meanPts} color={blue} />
              <HLine y={YBAR} color={blue} dash="0" width={2.5} />
              <Label x={0.3} y={YBAR} dy={-6} color={blue}>
                {`mean ${YBAR}`}
              </Label>
              <Dots points={dataDots} />
            </Plot>
            <p className={s.small}>
              Total square area <M>{`SS_{tot} = ${r1(SS_TOT)}`}</M>
            </p>
          </div>
          <div className={s.panel}>
            <p className={s.panelTitle}>
              <span className={s.badge} style={{ color: orange }}>
                Your model: drag the line's ends
              </span>
            </p>
            <Plot x={[0, 10]} y={[0, Y_MAX]} width={plotW} height={plotH} minHeight={240} margin={{ left: 36, right: 10, top: 12, bottom: 36 }} ariaLabel={`Data with your line; total squared error ${r1(ssRes)}; R squared ${r2.toFixed(2)}`}>
              <Grid xTicks={5} yTicks={9} />
              <ErrorSquares pts={modelPts} color={orange} opacity={20} />
              <Axes xLabel="distance (km)" yLabel="minutes" xTicks={5} yTicks={5} />
              <HLine y={YBAR} color="var(--viz-muted)" />
              <ResidualLines pts={modelPts} color={orange} />
              <Path points={[[0, line(0)], [10, line(10)]]} color={orange} width={3} />
              <Dots points={dataDots} />
              <DraggablePoint x={XL} y={ends[0]} lockX color={orange} label="drag" constrain={(x, y) => [x, snap(y)]} onChange={(_, y) => setEnds(([, b]) => [y, b])} />
              <DraggablePoint x={XR} y={ends[1]} lockX color={orange} constrain={(x, y) => [x, snap(y)]} onChange={(_, y) => setEnds(([a]) => [a, y])} />
            </Plot>
            <p className={s.small}>
              Total square area <M>{`SS_{res} = ${r1(ssRes)}`}</M>
            </p>
          </div>
        </div>

        <Bars
          ariaLabel="Total squared error of the mean baseline and of your line"
          max={Math.max(SS_TOT, ssRes)}
          format={(v) => r1(v).toString()}
          data={[
            { label: 'mean line', value: SS_TOT, color: blue },
            { label: 'your line', value: ssRes, color: orange, strong: true },
          ]}
        />

        <div className={s.work} aria-live="polite">
          <div style={{ fontSize: '1.05rem' }}>
            <M>{`R^2 = 1 - \\frac{SS_{res}}{SS_{tot}} = 1 - \\frac{${r1(ssRes)}}{${r1(SS_TOT)}} = `}</M>{' '}
            <b style={{ color: r2Color, fontFamily: 'var(--font-mono)' }}>{r2.toFixed(3)}</b>
          </div>
          <div>
            {r2 >= 0.999
              ? 'Perfect: no squared error left.'
              : r2 > 0.005
                ? `Your line removes ${(r2 * 100).toFixed(0)}% of the squared error that the mean line makes.`
                : r2 > -0.005
                  ? 'Exactly as good as always predicting the mean.'
                  : `Worse than always predicting the mean: ${(-r2 * 100).toFixed(0)}% MORE squared error.`}
          </div>
          <div>
            Your line: RMSE <b>{rmse.toFixed(2)} min</b>, MAE <b>{mae.toFixed(2)} min</b>. The mean line's RMSE is {rmseMean.toFixed(2)} min.
          </div>
        </div>

        <Controls>
          <Button primary onClick={() => setEnds([B_LS + W_LS * XL, B_LS + W_LS * XR])}>
            Best fit
          </Button>
          <Button onClick={() => setEnds([YBAR, YBAR])}>Flat at the mean</Button>
          <Button onClick={() => setEnds([34, 8])}>Worse than the mean</Button>
        </Controls>
      </div>
    </Figure>
  )
}
