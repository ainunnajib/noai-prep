import { useEffect, useRef, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Button, Plot, Grid, Axes, Path, Dots, VLine, Label, useAnimationFrame } from '../../../../../kit'
import { CURVES, LRS } from './esCurves'
import { earlyStop } from './gb'
import { Py } from './code'
import s from './gb.module.css'

/*
  GBREarlyStop on the notebook's own test cell data (640 training rows, 160 validation rows, 200 test
  rows, criterion 'l2', depth 3, up to 500 trees). The loss curves were computed once in Python with the
  official solution; the stopping rule itself runs here, live, on the validation curve.
*/

type Op = '>=' | '>'
const Y_MAX = 4000

/** patience_counter after tree m (1-based), replaying the rule. */
function counterAt(val: number[], m: number, minDelta = 1e-4) {
  let best = Infinity
  let c = 0
  for (let i = 0; i < m; i++) {
    if (val[i] < best - minDelta) {
      best = val[i]
      c = 0
    } else c += 1
  }
  return c
}

const pts = (a: number[], from: number, to: number): [number, number][] => a.slice(from, to).map((v, i) => [from + i + 1, v])

export default function EarlyStopRunner() {
  const [lr, setLr] = useState<(typeof LRS)[number]>(0.1)
  const [patience, setPatience] = useState(1)
  const [op, setOp] = useState<Op>('>=')
  const [showTest, setShowTest] = useState(false)
  const [zoom, setZoom] = useState(false)
  const c = CURVES[String(lr)]
  const { stoppedAfter, bestN } = earlyStop(c.val, patience, op)
  const [drawn, setDrawn] = useState(stoppedAfter)
  const [running, setRunning] = useState(false)

  // Re-run the fit (animate the curves growing) whenever a setting changes.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false // complete at rest: no animation on the first render
      return
    }
    setDrawn(0)
    setRunning(true)
  }, [lr, patience, op])
  useAnimationFrame((dt) => {
    setDrawn((d) => {
      const next = Math.min(stoppedAfter, d + Math.max(1, dt * 260))
      if (next >= stoppedAfter) setRunning(false)
      return next
    })
  }, running)

  const shown = Math.floor(drawn)
  const done = shown >= stoppedAfter
  const counter = counterAt(c.val, shown)
  const testAtBest = bestN > 0 ? c.test[bestN - 1] : c.f0[2]
  // zoomed view: a 500-wide window just above the lowest validation MSE, so a small rise after the best tree is visible
  const vMin = Math.min(...c.val)
  const yLo = zoom ? Math.max(0, Math.floor((vMin - 100) / 100) * 100) : 0
  const yHi = zoom ? yLo + 500 : Y_MAX

  return (
    <Figure
      wide
      title="Early stopping on the notebook’s own test cell"
      caption={
        <>
          The model adds one tree at a time and checks the <b>validation</b> MSE after each. It remembers the best so far and stops once{' '}
          <code>patience</code> trees in a row have failed to beat it; then it keeps only the first <code>best_n_estimators</code> trees. The
          default settings reproduce the notebook&apos;s test with scikit-learn 1.9 (patience = 1: stop after 125 trees, keep 124; other versions stop elsewhere). Raise the patience: one unlucky
          tree no longer ends training, and the kept model is better on unseen test data. Try learning_rate 0.5 with patience 30 and switch on <b>Zoom on validation</b>:
          the validation loss bottoms out near tree 91 and then creeps up slightly while the training loss keeps falling (mild overfitting); early stopping keeps the best
          point. Faded lines show what would have happened if training had continued.
        </>
      }
    >
      <Plot x={[0, 500]} y={[yLo, yHi]} width={680} height={300} minHeight={230} margin={{ left: 52 }} ariaLabel="Training and validation MSE against the number of trees, with the early-stopping point marked">
        <Grid xTicks={10} yTicks={8} />
        <Axes xLabel="number of trees" yLabel="MSE" xTicks={5} yTicks={4} tickFormat={(v) => v.toLocaleString('en-GB')} />
        {/* what would have happened (faded) */}
        {done && (
          <>
            <Path points={pts(c.train, stoppedAfter, 500)} color="var(--viz-1)" width={1.5} opacity={0.25} />
            <Path points={pts(c.val, stoppedAfter, 500)} color="var(--viz-2)" width={1.5} opacity={0.3} />
            {showTest && <Path points={pts(c.test, stoppedAfter, 500)} color="var(--viz-3)" width={1.5} dash="5 4" opacity={0.3} />}
          </>
        )}
        <Path points={[[0, c.f0[0]], ...pts(c.train, 0, shown)]} color="var(--viz-1)" width={2.5} />
        <Path points={[[0, c.f0[1]], ...pts(c.val, 0, shown)]} color="var(--viz-2)" width={2.5} />
        {showTest && <Path points={[[0, c.f0[2]], ...pts(c.test, 0, shown)]} color="var(--viz-3)" width={2} dash="5 4" />}
        {done && bestN > 0 && (
          <>
            <VLine x={bestN} color="var(--viz-4)" label={`kept ${bestN}`} />
            <Dots points={[{ x: bestN, y: c.val[bestN - 1], color: 'var(--viz-4)' }]} r={6} />
          </>
        )}
        {done && stoppedAfter < 500 && stoppedAfter - bestN > 25 && (
          <>
            <VLine x={stoppedAfter} color="var(--viz-neg)" />
            {/* a second row, so it never runs into the "kept" label when the two lines are close */}
            <Label x={stoppedAfter} y={yHi} dx={5} dy={30} color="var(--viz-neg)" size={12} weight={700}>
              {`stopped ${stoppedAfter}`}
            </Label>
          </>
        )}
      </Plot>
      <div className={s.legend}>
        <span className={s.key}>
          <span className={s.swatch} style={{ borderColor: 'var(--viz-1)' }} /> training MSE
        </span>
        <span className={s.key}>
          <span className={s.swatch} style={{ borderColor: 'var(--viz-2)' }} /> validation MSE (decides when to stop)
        </span>
        {showTest && (
          <span className={s.key}>
            <span className={`${s.swatch} ${s.swatchDash}`} style={{ borderColor: 'var(--viz-3)' }} /> test MSE (never used in fit)
          </span>
        )}
        <span className={s.key}>
          <span className={s.dot} style={{ background: 'var(--viz-4)' }} /> best validation MSE
        </span>
      </div>
      <Controls>
        <Segmented
          label="learning_rate"
          value={lr}
          onChange={setLr}
          options={LRS.map((v) => ({ value: v, label: String(v) }))}
        />
        <Slider label="patience" value={patience} min={1} max={30} step={1} onChange={setPatience} />
        <Segmented
          label="stop test"
          value={op}
          onChange={setOp}
          options={[
            { value: '>=', label: 'counter >= patience' },
            { value: '>', label: 'counter > patience' },
          ]}
        />
        <Toggle label="show test MSE" checked={showTest} onChange={setShowTest} />
        <Toggle label="Zoom on validation" checked={zoom} onChange={setZoom} />
        <Button
          primary
          onClick={() => {
            setDrawn(0)
            setRunning(true)
          }}
        >
          Run fit again
        </Button>
      </Controls>
      <Readout
        items={[
          ['trees fitted', done ? String(stoppedAfter) : String(shown)],
          ['patience_counter', String(counter)],
          ['best_n_estimators (kept)', done ? String(bestN) : '…'],
          ['best validation MSE', done && bestN > 0 ? c.val[bestN - 1].toFixed(1) : '…'],
          ['test MSE of kept model', done ? testAtBest.toFixed(1) : '…'],
        ]}
      />
      <div className={s.code} style={{ marginTop: 8, width: '100%' }}>
        <div className={s.codeBar}>
          <span>the stopping rule inside GBREarlyStop.fit (Q1.7)</span>
          <span>min_delta = 1e-4</span>
        </div>
        <div className={s.codeBody} style={{ fontSize: 11.5 }}>
          {[
            'if val_loss < best_val_loss - min_delta:',
            '    best_val_loss = val_loss',
            '    best_n_estimators = m + 1          # a count of trees, not an index',
            '    patience_counter = 0',
            'else:',
            '    patience_counter += 1',
            `if patience_counter ${op} patience:      # patience = ${patience}`,
            '    break',
          ].map((l, i) => (
            <span key={i} className={`${s.line} ${s.lineWrap} ${i === 6 ? s.lineOn : ''}`}>
              <Py code={l} />
            </span>
          ))}
        </div>
      </div>
    </Figure>
  )
}
