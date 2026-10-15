import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Grid, Axes, Path, Dots, DraggablePoint, Label, M, type DotDatum } from '../../../../../kit'
import { seeded, fitLogReg, accuracy, pct, type LogReg } from './sim'
import s from './shift.module.css'

/*
  The true rule: class 1 ("orange") when x₂ lies above the curve x₂ = 0.18·x₁² − 0.3 (a gentle bowl).
  Training data sit around (0, 0), where the bowl is almost flat, so a logistic-regression model learns a
  straight line that is right about 95% of the time THERE.
  Covariate shift: drag the test cloud (P(x) changes, the rule does not). Far from the training region the
  bowl curves away from the learned line and accuracy falls, because the model is extrapolating.
  Concept drift: the inputs stay where they were, but the rule itself rotates by θ (P(y|x) changes).
  The test points look exactly like the training points, yet the labels have changed.
*/

type Mode = 'covariate' | 'concept'
const N = 160
const f = (u: number) => 0.18 * u * u - 0.3

function trueLabel(x: number, y: number, thetaDeg: number): number {
  const t = (thetaDeg * Math.PI) / 180
  const c = Math.cos(t)
  const sn = Math.sin(t)
  const u = c * x + sn * y
  const v = -sn * x + c * y
  return v > f(u) ? 1 : 0
}

function ruleCurve(thetaDeg: number): [number, number][] {
  const t = (thetaDeg * Math.PI) / 180
  const c = Math.cos(t)
  const sn = Math.sin(t)
  const pts: [number, number][] = []
  for (let u = -9; u <= 9.001; u += 0.1) {
    const v = f(u)
    pts.push([c * u - sn * v, sn * u + c * v])
  }
  return pts
}

function modelLine(m: LogReg): [number, number][] {
  // w0·x + w1·y + b = 0  →  y = −(w0·x + b) / w1
  const [w0, w1] = m.w
  return [
    [-6, -(w0 * -6 + m.b) / w1],
    [8, -(w0 * 8 + m.b) / w1],
  ]
}

function circle(cx: number, cy: number, r: number): [number, number][] {
  return Array.from({ length: 61 }, (_, i) => {
    const a = (i / 60) * 2 * Math.PI
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number]
  })
}

export default function DistributionShift() {
  const [mode, setMode] = useState<Mode>('covariate')
  const [centre, setCentre] = useState<[number, number]>([2.8, 1.4])
  const [theta, setTheta] = useState(35)
  const [showRule, setShowRule] = useState(true)

  const { train, offsets, model, trainAcc } = useMemo(() => {
    const { gauss } = seeded(4242)
    const X: [number, number][] = Array.from({ length: N }, () => [1.1 * gauss(), 1.1 * gauss()])
    const y = X.map(([a, b]) => trueLabel(a, b, 0))
    const m = fitLogReg(X, y, 800, 0.5)
    const offs: [number, number][] = Array.from({ length: N }, () => [1.1 * gauss(), 1.1 * gauss()])
    return { train: { X, y }, offsets: offs, model: m, trainAcc: accuracy(m, X, y) }
  }, [])

  const c: [number, number] = mode === 'covariate' ? centre : [0, 0]
  const th = mode === 'concept' ? theta : 0
  const testX = offsets.map(([a, b]) => [a + c[0], b + c[1]] as [number, number])
  const testY = testX.map(([a, b]) => trueLabel(a, b, th))
  const testAcc = accuracy(model, testX, testY)
  const moved = Math.hypot(c[0], c[1]) > 0.3
  const ruleChanged = Math.abs(th) > 0.5

  const colour = (k: number) => (k === 1 ? 'var(--viz-2)' : 'var(--viz-1)')
  const trainDots: DotDatum[] = train.X.map(([a, b], i) => ({ x: a, y: b, r: 3.2, color: `color-mix(in srgb, ${colour(train.y[i])} 55%, var(--surface))`, hollow: true }))
  const testDots: DotDatum[] = testX.map(([a, b], i) => {
    const wrong = (model.w[0] * a + model.w[1] * b + model.b > 0 ? 1 : 0) !== testY[i]
    return wrong ? { x: a, y: b, r: 4.5, color: 'var(--viz-neg)', shape: 'cross' as const } : { x: a, y: b, r: 4, color: colour(testY[i]) }
  })

  const verdict =
    mode === 'covariate'
      ? moved
        ? 'Covariate shift: the inputs moved (P(x) changed) but the rule did not. The model is extrapolating its straight line into a region where the true boundary curves away.'
        : 'No shift: the test data come from the same place, and the same rule, as the training data.'
      : ruleChanged
        ? 'Concept drift: the inputs look exactly like the training data (P(x) unchanged), but the rule that labels them has turned (P(y|x) changed). Checking the inputs alone would never reveal this.'
        : 'No drift: same inputs, same rule.'

  return (
    <Figure
      title="When the world moves, the score moves"
      caption={
        <>
          Hollow dots: training data. Solid dots: test data, coloured by their true class; red crosses are the model's mistakes. Dashed line:
          the model learned from the training data. Solid curve: the true rule. In <b>covariate shift</b> mode, drag the test cloud around:
          accuracy only drops where the curve and the line disagree. In <b>concept drift</b> mode the cloud stays put and you rotate the rule
          instead.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Segmented
            label="What changes after training?"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'covariate', label: <>covariate shift: the inputs move</> },
              { value: 'concept', label: <>concept drift: the rule changes</> },
            ]}
          />
        </Controls>
        <Plot x={[-4.5, 6.5]} y={[-4, 5.5]} width={520} height={450} ariaLabel="Scatter plot of training and test data with the model's boundary and the true rule">
          <Grid xTicks={11} yTicks={9} />
          <Axes xTicks={6} yTicks={5} xLabel="feature 1" yLabel="feature 2" />
          <Path points={circle(0, 0, 2.2)} color="var(--viz-muted)" width={1.5} dash="3 4" />
          {moved && <Path points={circle(c[0], c[1], 2.2)} color="var(--ink-3)" width={1.8} dash="6 4" />}
          <Dots points={trainDots} />
          {showRule && <Path points={ruleCurve(th)} color="var(--viz-4)" width={3} />}
          <Path points={modelLine(model)} color="var(--ink)" width={2.5} dash="8 6" />
          <Dots points={testDots} />
          <Label x={0} y={-2.2} dy={16} anchor="middle" color="var(--ink-3)" size={11}>
            training region
          </Label>
          {mode === 'covariate' && <DraggablePoint x={centre[0]} y={centre[1]} onChange={(x, y) => setCentre([Math.round(x * 10) / 10, Math.round(y * 10) / 10])} color="var(--ink)" label="drag the test data" />}
        </Plot>
        <Controls>
          {mode === 'concept' && <Slider label={<>rotate the rule by <M>{'\\theta'}</M></>} value={theta} min={0} max={90} step={1} onChange={setTheta} format={(v) => `${v}°`} />}
          <Toggle label="Show the true rule" checked={showRule} onChange={setShowRule} />
          <Readout
            items={[
              ['training accuracy', pct(trainAcc)],
              ['test accuracy', pct(testAcc)],
              [<M key="px">{'P(x)'}</M>, moved ? 'changed' : 'same'],
              [<M key="pyx">{'P(y \\mid x)'}</M>, ruleChanged ? 'changed' : 'same'],
            ]}
          />
        </Controls>
        <div className={s.legend} aria-hidden="true">
          <span>
            <i className={s.lineDash} /> model's boundary
          </span>
          <span>
            <i className={s.line} style={{ borderColor: 'var(--viz-4)' }} /> true rule
          </span>
          <span>
            <i className={s.dot} style={{ background: 'var(--viz-1)' }} /> class A
          </span>
          <span>
            <i className={s.dot} style={{ background: 'var(--viz-2)' }} /> class B
          </span>
          <span style={{ color: 'var(--viz-neg)', fontWeight: 800 }}>× wrong</span>
        </div>
        <p className={`${s.note} ${testAcc < trainAcc - 0.08 ? s.noteBad : s.noteOk}`} role="status">
          {verdict}
        </p>
      </div>
    </Figure>
  )
}
