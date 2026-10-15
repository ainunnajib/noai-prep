import { useState } from 'react'
import { Figure, Controls, Toggle, Button, Plot, Grid, Axes, Dots, DraggablePoint, Bars, Label, M } from '../../../../../kit'
import { ErrorSquares, ResidualLines, fmtNum } from './shared'
import s from './reg.module.css'

/*
  MAE, MSE and RMSE for four Grab-ride time predictions: the same four rides as the lesson's worked example
  (true 11, 17, 23, 29 min; predicted 10, 18, 20, 34 min, so MAE 2.5 and RMSE 3).
  The learner drags any predicted time (orange) up or down. The residual (true - predicted) is the
  purple line; its square is drawn as a real square. MAE averages the line lengths, RMSE is the
  square root of the average square area. Aha: one big miss moves RMSE much more than MAE.
*/

const ACTUAL = [11, 17, 23, 29]
const START = [10, 18, 20, 34]
const BIG_MISS = [10, 18, 20, 14] // ride 4 predicted 15 minutes too short

const snap = (v: number) => Math.max(0, Math.min(40, Math.round(v * 2) / 2))

export default function ErrorMetricsLab() {
  const [pred, setPred] = useState<number[]>(START)
  const [showSquares, setShowSquares] = useState(true)

  const res = ACTUAL.map((a, i) => a - pred[i])
  const n = res.length
  const absSum = res.reduce((t, r) => t + Math.abs(r), 0)
  const sqSum = res.reduce((t, r) => t + r * r, 0)
  const mae = absSum / n
  const mse = sqSum / n
  const rmse = Math.sqrt(mse)
  const worst = res.reduce((m, r, i) => (Math.abs(r) > Math.abs(res[m]) ? i : m), 0)

  const pts = ACTUAL.map((y, i) => ({ x: i + 1, y, p: pred[i] }))
  // the x range runs to 5.4 so that ride 4's square (15 minutes wide after the big miss) has room on its right
  const purple = 'var(--viz-5)'

  // full-size fractions: these sums are where the big miss shows up, so they must be readable on a phone
  const maeTex = `\\text{MAE} = \\dfrac{${res.map((r) => fmtNum(Math.abs(r))).join(' + ')}}{${n}} = ${mae.toFixed(2)}\\text{ min}`
  const rmseTex = `\\text{RMSE} = \\sqrt{\\dfrac{${res.map((r) => fmtNum(r * r)).join(' + ')}}{${n}}} = \\sqrt{${fmtNum(mse)}} = ${rmse.toFixed(2)}\\text{ min}`

  return (
    <Figure
      title="One big miss: MAE versus RMSE"
      caption={
        <>
          Drag any orange prediction; each square's area is that ride's squared error. Press <b>Add one big miss</b>: MAE doubles (2.5 to 5) but RMSE jumps
          from 3 to 7.7, because a 15-minute error's square is 225 times a 1-minute one's.
        </>
      }
    >
      <div className={s.wrap}>
        <Plot x={[0.4, 5.4]} y={[0, 40]} width={520} height={300} minHeight={250} margin={{ left: 40, right: 14, top: 14, bottom: 38 }} ariaLabel={`${n} rides with true and predicted times. MAE ${mae.toFixed(2)} minutes, RMSE ${rmse.toFixed(2)} minutes.`}>
          <Grid xTicks={4} yTicks={8} />
          {showSquares && <ErrorSquares pts={pts} color={purple} />}
          <Axes yLabel="minutes" yTicks={8} hideXTicks />
          {ACTUAL.map((_, i) => (
            <Label key={i} x={i + 1} y={0} dy={18} anchor="middle" color="var(--viz-axis)">
              {`ride ${i + 1}`}
            </Label>
          ))}
          <ResidualLines pts={pts} color={purple} />
          <Dots points={ACTUAL.map((y, i) => ({ x: i + 1, y, r: 6.5, color: 'var(--viz-3)' }))} />
          {pred.map((p, i) => (
            <DraggablePoint
              key={i}
              x={i + 1}
              y={p}
              lockX
              r={8}
              color="var(--viz-2)"
              constrain={(x, y) => [x, snap(y)]}
              onChange={(_, y) => setPred((old) => old.map((v, j) => (j === i ? y : v)))}
            />
          ))}
        </Plot>

        <div className={s.legend}>
          <span>
            <span className={s.swatchDot} style={{ background: 'var(--viz-3)' }} /> true time
          </span>
          <span>
            <span className={s.swatchDot} style={{ background: 'var(--viz-2)' }} /> prediction (drag)
          </span>
          <span>
            <span className={s.swatchLine} style={{ borderColor: purple }} /> error
          </span>
          <span>
            <span className={s.swatch} style={{ background: 'color-mix(in srgb, var(--viz-5) 22%, transparent)', borderColor: purple }} /> squared error
          </span>
        </div>

        <div className={s.work} aria-live="polite">
          <div>
            Errors (true − predicted), in minutes: <b>{res.map((r) => (r > 0 ? `+${fmtNum(r)}` : r < 0 ? `−${fmtNum(-r)}` : '0')).join(', ')}</b>
          </div>
          <div>
            <M>{maeTex}</M>
          </div>
          <div>
            <M>{`\\text{MSE} = ${fmtNum(mse)}\\text{ min}^2`}</M> <span className={s.muted}>(squared minutes: hard to picture)</span>
          </div>
          <div>
            <M>{rmseTex}</M>
          </div>
        </div>

        <Bars
          ariaLabel="MAE and RMSE in minutes"
          max={Math.max(10, rmse * 1.1)}
          format={(v) => `${v.toFixed(2)} min`}
          data={[
            { label: 'MAE', value: mae, color: 'var(--viz-1)' },
            { label: 'RMSE', value: rmse, color: 'var(--viz-4)', strong: true },
          ]}
        />

        <Controls>
          <Button primary onClick={() => setPred(BIG_MISS)}>
            Add one big miss
          </Button>
          <Button onClick={() => setPred(START)}>Reset</Button>
          <Button onClick={() => setPred(ACTUAL)}>Perfect predictions</Button>
          <Toggle label="Show squares" checked={showSquares} onChange={setShowSquares} />
        </Controls>
        <p className={s.small}>
          RMSE ÷ MAE = <b>{mae > 0 ? (rmse / mae).toFixed(2) : '–'}</b>
          {mae > 0 ? ` (1.00 would mean every error has the same size). Biggest error: ride #${worst + 1}, ${fmtNum(Math.abs(res[worst]))} min.` : ' (no errors at all)'}
        </p>
      </div>
    </Figure>
  )
}
