import { useState } from 'react'
import { Figure, Controls, Readout, Button, Segmented, Toggle, Plot, Rect, Label, Path, useNarrow, M } from '../../../../../kit'
import { CLASSES, Z_RANGE, softmax, fix, LogitPanel, ProbPanel } from './shared'

/*
  Cross-entropy with a target. Pick the true class; the target is one-hot, or label-smoothed
  ((1 − ε)·one-hot + ε/K with ε = 0.1, as in PyTorch). The loss is −Σ y log p, its gradient with
  respect to the logits is p − y, and "gradient step" applies z ← z − 1·(p − y).
  With a one-hot target the true logit keeps running away; with smoothing the logits settle.
*/

const START = [2, 1, 0, -1]
const EPS = 0.1
const K = CLASSES.length

function GradPanel({ g }: { g: number[] }) {
  return (
    <Plot x={[0, K]} y={[-1, 1]} width={480} height={150} minHeight={140} margin={{ left: 34, right: 8, top: 10, bottom: 22 }} ariaLabel={`Gradient p minus y for each class: ${g.map((v, i) => `${CLASSES[i]} ${v.toFixed(2)}`).join(', ')}`}>
      {[-1, -0.5, 0.5, 1].map((t) => (
        <g key={t}>
          <Path points={[[0, t], [K, t]]} color="var(--viz-grid)" width={1} />
          <Label x={0} y={t} dx={-6} dy={4} anchor="end" size={11} color="var(--ink-3)">
            {String(t).replace('-', '−')}
          </Label>
        </g>
      ))}
      <Path points={[[0, 0], [K, 0]]} color="var(--viz-axis)" width={1.4} />
      {g.map((v, i) => (
        <g key={i}>
          <Rect x0={i + 0.25} x1={i + 0.75} y0={0} y1={v} rx={2} fill={`color-mix(in srgb, ${v < 0 ? 'var(--viz-3)' : 'var(--viz-4)'} 70%, var(--surface))`} />
          <Label x={i + 0.5} y={0} dy={v >= -0.005 ? 16 : -6} anchor="middle" size={12} weight={700} color="var(--viz-ink)">
            {fix(v, 2)}
          </Label>
          <Label x={i + 0.5} y={-1} dy={16} anchor="middle" size={12} color="var(--ink-2)">
            {CLASSES[i]}
          </Label>
        </g>
      ))}
    </Plot>
  )
}

export default function CrossEntropyTarget() {
  const [z, setZ] = useState(START)
  const [c, setC] = useState(2)
  const [smooth, setSmooth] = useState(false)
  const [steps, setSteps] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const y = CLASSES.map((_, i) => (smooth ? EPS / K : 0) + (i === c ? 1 - (smooth ? EPS : 0) : 0))
  const p = softmax(z)
  const loss = -y.reduce((s, yi, i) => s + (yi > 0 ? yi * Math.log(p[i]) : 0), 0)
  const best = -y.reduce((s, yi) => s + (yi > 0 ? yi * Math.log(yi) : 0), 0)
  const g = p.map((pi, i) => pi - y[i])
  const others = z.filter((_, i) => i !== c)
  const gap = z[c] - Math.max(...others)

  const step = (n: number) => {
    let zz = z
    for (let k = 0; k < n; k++) {
      const pp = softmax(zz)
      zz = zz.map((v, i) => Math.max(Z_RANGE[0], Math.min(Z_RANGE[1], v - (pp[i] - y[i]))))
    }
    setZ(zz)
    setSteps(steps + n)
  }
  const reset = () => {
    setZ(START)
    setSteps(0)
  }

  return (
    <Figure
      title="Cross-entropy pulls the right logit up"
      caption={
        <>
          Pick the true class. The dashed green outlines are the target <M>y</M>; the blue bars are the model's <M>p</M>. The loss is{' '}
          <M>{'-\\sum_k y_k \\ln p_k'}</M>, which for a one-hot target is just <M>{'-\\ln p_{\\text{true}}'}</M>. The bottom chart is the gradient{' '}
          <M>{'\\partial L / \\partial z_k = p_k - y_k'}</M>: green bars (negative) mean "raise this logit", pink bars mean "lower it". Press <b>gradient step</b>{' '}
          a few times and watch the loss fall. With a one-hot target the loss never reaches 0 and the gap between logits keeps growing; switch on label
          smoothing and the logits settle at a finite gap, with the loss levelling off at the target's own entropy.
        </>
      }
    >
      <Segmented
        label="True class"
        value={c}
        onChange={(v) => {
          setC(v)
          setSteps(0)
        }}
        options={CLASSES.map((name, i) => ({ value: i, label: name }))}
      />
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '0.5rem' }}>
        <LogitPanel z={z} onChange={setZ} highlight={c} height={210} />
        <ProbPanel p={p} target={y} highlight={c} title="p (blue) and target y (dashed)" height={210} />
      </div>
      <div style={{ width: '100%', display: 'grid', gap: '0.1rem' }}>
        <div style={{ fontWeight: 800, fontSize: '0.92rem', textAlign: 'center', color: 'var(--ink-2)' }}>
          gradient <M>{'p - y'}</M> for each logit
        </div>
        <GradPanel g={g} />
      </div>
      <Readout
        items={[
          ['loss', fix(loss, 3)],
          [<>
            <M>{'-\\ln p_{\\text{true}}'}</M>
          </>, fix(-Math.log(p[c]), 3)],
          ['lowest possible loss', fix(best, 3)],
          ['true logit minus best other', fix(gap, 2)],
          ['steps taken', String(steps)],
        ]}
      />
      <Controls>
        <Button primary onClick={() => step(1)}>
          gradient step
        </Button>
        <Button onClick={() => step(10)}>10 steps</Button>
        <Button onClick={reset}>Reset</Button>
        <Toggle label="Label smoothing (ε = 0.1)" checked={smooth} onChange={setSmooth} />
      </Controls>
    </Figure>
  )
}
