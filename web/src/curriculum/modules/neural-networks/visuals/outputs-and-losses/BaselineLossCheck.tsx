import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, FnPath, Rect, HLine, Dots, Path, Label, useNarrow, mulberry32, M } from '../../../../../kit'
import s from './heads.module.css'

/*
  The loss you should see before training. An untrained K-class classifier with small output
  weights gives every class probability ≈ 1/K, so its cross-entropy is −ln(1/K) = ln K whatever the
  label. If the initial logits are spread out (e.g. a badly scaled output layer), the model is
  confidently random and the expected loss (averaged over balanced labels) rises above ln K.
*/

const KMAX = 20
// fixed standard-normal draws, one per class, so the picture is deterministic
const G = (() => {
  const rng = mulberry32(2027)
  const out: number[] = []
  for (let i = 0; i < KMAX; i++) {
    const u = Math.max(1e-12, rng())
    const v = rng()
    out.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v))
  }
  return out
})()

function softmax(z: number[]) {
  const mx = Math.max(...z)
  const e = z.map((v) => Math.exp(v - mx))
  const t = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / t)
}

export default function BaselineLossCheck() {
  const [K, setK] = useState(10)
  const [spread, setSpread] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const { p, loss } = useMemo(() => {
    const pp = softmax(G.slice(0, K).map((g) => spread * g))
    // labels are balanced, so average −ln p over every possible true class
    const l = pp.reduce((a, v) => a - Math.log(v), 0) / K
    return { p: pp, loss: l }
  }, [K, spread])
  const lnK = Math.log(K)
  const maxP = Math.max(...p)
  const yTop = maxP > 0.55 ? 1 : 0.6
  const healthy = Math.abs(loss - lnK) < 0.1 * lnK
  const lossTop = Math.max(3.4, loss * 1.1)

  return (
    <Figure
      title="What should the very first loss be?"
      caption={
        <>
          Left: the probabilities an untrained <M>K</M>-class model gives one input. Right: its expected first loss against the curve <M>{'\\ln K'}</M>. Slide{' '}
          <M>K</M> with the spread at 0 (every class gets <M>{'1/K'}</M>), then raise the spread of the starting logits, as when the output weights start too big:
          the model becomes confidently random and the first loss climbs above <M>{'\\ln K'}</M>.
        </>
      }
    >
      <div ref={wrapRef} className={s.wrap}>
        <div className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
          <div className={s.panel}>
            <div className={s.panelTitle}>
              <b>Predicted probabilities</b> for one input (dashed line: <M>{'1/K'}</M>)
            </div>
            <Plot x={[0.4, K + 0.6]} y={[0, yTop]} width={340} height={230} minHeight={200} margin={{ left: 40, bottom: 40, top: 26, right: 12 }} ariaLabel={`Bar chart of ${K} predicted class probabilities`}>
              <Grid xTicks={0} yTicks={4} />
              <Axes xLabel="class" yLabel="probability" xTicks={Math.min(K, 10)} yTicks={4} tickFormat={(v) => (Number.isInteger(v) ? String(v) : v.toFixed(1))} />
              {p.map((v, i) => (
                <Rect key={i} x0={i + 1 - 0.36} x1={i + 1 + 0.36} y0={0} y1={v} fill="var(--viz-1)" rx={2} />
              ))}
              <HLine y={1 / K} color="var(--viz-2)" dash="5 4" width={2} />
            </Plot>
          </div>
          <div className={s.panel}>
            <div className={s.panelTitle}>
              <b>Expected first loss</b> compared with <M>{'\\ln K'}</M>
            </div>
            <Plot x={[2, KMAX + 0.8]} y={[0, lossTop]} width={340} height={230} minHeight={200} margin={{ left: 40, bottom: 40, top: 26, right: 12 }} ariaLabel="The curve ln K against K, with the current first loss marked">
              <Grid xTicks={6} yTicks={4} />
              <Axes xLabel="K" yLabel="loss" xTicks={6} yTicks={4} />
              <FnPath f={(k) => Math.log(k)} color="var(--viz-3)" width={2.4} />
              <Label x={16.5} y={Math.log(16.5)} dy={22} anchor="middle" color="var(--viz-3)">
                ln K
              </Label>
              {Math.abs(loss - lnK) > 1e-6 && (
                <Path
                  points={[
                    [K, lnK],
                    [K, loss],
                  ]}
                  color="var(--viz-neg)"
                  width={2}
                  dash="3 3"
                />
              )}
              <Dots
                points={[
                  { x: K, y: lnK, color: 'var(--viz-3)', r: 6 },
                  { x: K, y: loss, color: healthy ? 'var(--viz-3)' : 'var(--viz-neg)', r: 6, hollow: true },
                ]}
              />
            </Plot>
            <div className={s.legend}>
              <span>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: '0.35rem' }}>
                  <circle cx="7" cy="7" r="5" style={{ fill: 'var(--viz-3)' }} />
                </svg>
                <M>{'\\ln K'}</M>: a healthy start
              </span>
              <span>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: '0.35rem' }}>
                  <circle cx="7" cy="7" r="5" style={{ fill: 'var(--surface)', stroke: healthy ? 'var(--viz-3)' : 'var(--viz-neg)', strokeWidth: 2 }} />
                </svg>
                this model&rsquo;s expected first loss
              </span>
            </div>
          </div>
        </div>
        <Controls>
          <Slider label={<>number of classes <M>K</M></>} value={K} min={2} max={KMAX} step={1} onChange={setK} />
          <Slider label="spread of the starting logits (their std)" value={spread} min={0} max={4} step={0.1} onChange={setSpread} format={(v) => v.toFixed(1)} />
          <Readout
            items={[
              ['each class 1/K', (1 / K).toFixed(3)],
              ['ln K', lnK.toFixed(3)],
              ['expected first loss', loss.toFixed(3)],
              ['verdict', healthy ? 'looks healthy' : 'too high: check the output layer'],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
