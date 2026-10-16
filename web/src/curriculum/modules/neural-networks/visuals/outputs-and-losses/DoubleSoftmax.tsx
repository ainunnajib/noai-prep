import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Grid, Axes, FnPath, HLine, Dots, Label, Bars, useNarrow, M } from '../../../../../kit'
import s from './heads.module.css'

/*
  The double-softmax bug. A K-class model whose true-class logit is m larger than the others
  (z = [m, 0, …, 0]). CrossEntropyLoss applies log-softmax itself; if the model ALSO ends in a softmax,
  the loss sees softmax(softmax(z)), which is squashed towards uniform. The loss can then never fall
  below ln(1 + (K − 1)/e), and the push on the true logit is far weaker.
*/

function softmax(z: number[]) {
  const mx = Math.max(...z)
  const e = z.map((v) => Math.exp(v - mx))
  const t = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / t)
}

/** Loss and gradient (on the true logit, index 0) for z = [m, 0, …, 0]. */
function pipeline(m: number, K: number, bug: boolean) {
  const z = [m, ...Array.from({ length: K - 1 }, () => 0)]
  const p = softmax(z)
  if (!bug) return { probs: p, loss: -Math.log(p[0]), grad: p[0] - 1 }
  const q = softmax(p)
  // dL/dp = q − onehot; dL/dz = (diag(p) − p pᵀ)(q − onehot)
  const g = q.map((v, i) => v - (i === 0 ? 1 : 0))
  const pg = p.reduce((a, v, i) => a + v * g[i], 0)
  return { probs: q, loss: -Math.log(q[0]), grad: p[0] * (g[0] - pg) }
}

/** Three decimals with a real minus sign; values that round to 0 print as 0.000, never −0.000. */
const f3 = (v: number) => {
  const s = v.toFixed(3)
  return (/^-0\.0+$/.test(s) ? s.slice(1) : s).replace('-', '−')
}

export default function DoubleSoftmax() {
  const [K, setK] = useState(10)
  const [m, setM] = useState(1)
  const [bug, setBug] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const good = pipeline(m, K, false)
  const bad = pipeline(m, K, true)
  const floor = Math.log(1 + (K - 1) / Math.E)
  const yMax = Math.log(K) * 1.08

  return (
    <Figure
      title="The double-softmax bug"
      caption={
        <>
          The true class&rsquo;s logit is <M>m</M> bigger than every other. With the bug on, the model ends with its own softmax, so the scores are squashed{' '}
          <b>twice</b> and pulled towards <M>{'1/K'}</M>. Slide <M>m</M>: the correct loss heads to 0, but the buggy loss never falls below{' '}
          <M>{'\\ln\\!\\left(1 + \\frac{K-1}{e}\\right)'}</M>, and no error message warns you. Watch the push readouts too: at <M>m = 0</M> the
          bug pushes the true logit about 10 times more weakly than the correct pipeline (−0.09 against −0.9 with K = 10), and at large <M>m</M> its
          push dies away while its loss is still stuck at the floor.
        </>
      }
    >
      <div ref={wrapRef} className={s.wrap}>
        <div className={s.pipe} aria-label="The pipeline from model to loss">
          <span className={s.pipeStep}>
            <span className={s.pipeBox}>model</span>→
          </span>
          <span className={s.pipeStep}>
            <span className={s.pipeBox}>logits z</span>→
          </span>
          {bug && (
            <span className={s.pipeStep}>
              <span className={`${s.pipeBox} ${s.bug}`}>extra softmax (bug)</span>→
            </span>
          )}
          <span className={`${s.pipeBox} ${s.inside}`}>CrossEntropyLoss (log-softmax inside)</span>
        </div>
        <div className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
          <div className={s.panel}>
            <div className={s.panelTitle}>
              <b>Loss</b> as the model grows more confident (true-class lead <M>m</M>)
            </div>
            <Plot x={[0, 10]} y={[0, yMax]} width={340} height={250} minHeight={220} margin={{ left: 40, bottom: 32, top: 26, right: 12 }} ariaLabel="Cross-entropy loss against the true-class lead, with and without the extra softmax">
              <Grid xTicks={5} yTicks={4} />
              <Axes xLabel="m" yLabel="loss" xTicks={5} yTicks={4} />
              {bug && <HLine y={floor} color="var(--viz-neg)" />}
              {bug && (
                <Label x={5} y={floor} dy={16} anchor="middle" color="var(--viz-neg)" size={12}>
                  {`floor for the bug: ${floor.toFixed(2)}`}
                </Label>
              )}
              <FnPath f={(v) => pipeline(v, K, false).loss} color="var(--viz-3)" width={2.6} samples={160} />
              {bug && <FnPath f={(v) => pipeline(v, K, true).loss} color="var(--viz-neg)" width={2.6} dash="7 5" samples={160} />}
              <Dots points={[{ x: m, y: good.loss, color: 'var(--viz-3)', r: 6 }, ...(bug ? [{ x: m, y: bad.loss, color: 'var(--viz-neg)', r: 6 }] : [])]} />
            </Plot>
            <div className={s.legend}>
              <span>
                <span className={s.swatch} style={{ borderColor: 'var(--viz-3)' }} />
                correct: raw logits
              </span>
              {bug && (
                <span>
                  <span className={s.swatch} style={{ borderColor: 'var(--viz-neg)', borderTopStyle: 'dashed' }} />
                  bug: softmax twice
                </span>
              )}
            </div>
          </div>
          <div className={s.panel}>
            <div className={s.panelTitle}>
              <b>Probabilities the loss sees</b>
            </div>
            <Bars
              max={1}
              format={(v) => v.toFixed(3)}
              ariaLabel="Probabilities seen by the loss"
              data={[
                { label: 'correct: true class', value: good.probs[0], color: 'var(--viz-3)', strong: true },
                { label: 'correct: each other class', value: good.probs[1], color: 'var(--viz-3)' },
                ...(bug
                  ? [
                      { label: 'bug: true class', value: bad.probs[0], color: 'var(--viz-neg)', strong: true },
                      { label: 'bug: each other class', value: bad.probs[1], color: 'var(--viz-neg)' },
                    ]
                  : []),
              ]}
            />
            <Readout
              items={[
                ['loss, correct', f3(good.loss)],
                ...(bug ? ([['loss, bug', f3(bad.loss)]] as [string, string][]) : []),
                ['push, correct', f3(good.grad)],
                ...(bug ? ([['push, bug', f3(bad.grad)], ['bug push is', `${(good.grad / bad.grad).toFixed(1)}× weaker`]] as [string, string][]) : []),
              ]}
            />
          </div>
        </div>
        <Controls>
          <Slider label={<>true-class lead <M>m</M></>} value={m} min={0} max={10} step={0.1} onChange={setM} format={(v) => v.toFixed(1)} />
          <Segmented
            label="classes K"
            value={K}
            onChange={setK}
            options={[
              { value: 3, label: '3' },
              { value: 10, label: '10' },
            ]}
          />
          <Toggle label="bug: softmax inside the model" checked={bug} onChange={setBug} />
        </Controls>
      </div>
    </Figure>
  )
}
