import { useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Segmented, Slider, Button, Plot, Grid, Axes, FnPath, Path, Label, Bars, MBlock, M, usePlot } from '../../../../../kit'
import { Handle } from '../logistic-regression/Handle'
import { fix } from './info'

/*
  Where MSE and binary cross-entropy come from. Two tabs:
  - Gaussian noise: y = ŷ + noise, noise ~ N(0, 1). The likelihood of the observed y is the bell's height
    at y; −ln of it is ½(y − ŷ)² + 0.919. Drag ŷ.
  - Coin (Bernoulli): P(y = 1) = p. −ln of the probability of the observed label is the BCE.
  Below, a click-through derivation for each.
*/

type Tab = 'gauss' | 'coin'
const Y_OBS = 3
const LN_SQRT_2PI = 0.5 * Math.log(2 * Math.PI) // 0.919

const gauss = (x: number, mu: number) => Math.exp(-0.5 * (x - mu) ** 2) / Math.sqrt(2 * Math.PI)

const STEPS: Record<Tab, { title: string; tex: string; note: ReactNode }[]> = {
  gauss: [
    {
      title: 'Assume a noise model',
      tex: '\\begin{gathered} y = \\hat{y} + \\varepsilon,\\quad \\varepsilon \\sim \\mathcal{N}(0, \\sigma^2) \\\\ p(y \\mid \\hat{y}) = \\frac{1}{\\sqrt{2\\pi}\\,\\sigma}\\, e^{-\\frac{(y - \\hat{y})^2}{2\\sigma^2}} \\end{gathered}',
      note: <>The true value is the prediction plus bell-shaped (Gaussian) noise with a fixed spread <M>{'\\sigma'}</M>.</>,
    },
    {
      title: 'Multiply over independent examples',
      tex: 'L = \\prod_{i=1}^{m} p(y_i \\mid \\hat{y}_i)',
      note: <>The likelihood of the whole dataset is the product of the bell heights, one per example.</>,
    },
    {
      title: 'Take minus the log',
      tex: '-\\ln L = \\sum_{i=1}^{m} \\frac{(y_i - \\hat{y}_i)^2}{2\\sigma^2} + m\\ln\\!\\big(\\sqrt{2\\pi}\\,\\sigma\\big)',
      note: <>The log turns the product into a sum, and <M>{'\\ln(e^{u}) = u'}</M> removes the exponential.</>,
    },
    {
      title: 'Drop what does not depend on the model',
      tex: '\\begin{gathered} \\text{minimise } -\\ln L \\\\ \\iff \\text{minimise } \\frac{1}{m}\\sum_{i=1}^{m} (y_i - \\hat{y}_i)^2 = \\text{MSE} \\end{gathered}',
      note: <><M>{'\\sigma'}</M> is fixed, so the constant term and the factor <M>{'1/(2\\sigma^2)'}</M> do not change which model wins.</>,
    },
  ],
  coin: [
    {
      title: 'Assume a coin-flip model',
      tex: 'P(y \\mid p) = p^{\\,y}\\,(1 - p)^{\\,1 - y}\\qquad (y \\in \\{0, 1\\})',
      note: <>Check: <M>{'y = 1'}</M> gives <M>p</M>, and <M>{'y = 0'}</M> gives <M>{'1 - p'}</M>. This is the Bernoulli distribution.</>,
    },
    {
      title: 'Multiply over independent examples',
      tex: 'L = \\prod_{i=1}^{m} p_i^{\\,y_i}\\,(1 - p_i)^{\\,1 - y_i}',
      note: <>Each example has its own predicted probability, for example <M>{'p_i = \\sigma(wx_i + b)'}</M> in logistic regression.</>,
    },
    {
      title: 'Take minus the log',
      tex: '-\\ln L = -\\sum_{i=1}^{m} \\big[\\, y_i \\ln p_i + (1 - y_i) \\ln (1 - p_i) \\,\\big]',
      note: <>Powers become multipliers: <M>{'\\ln(p^{y}) = y \\ln p'}</M>.</>,
    },
    {
      title: 'Average: the binary cross-entropy',
      tex: '\\frac{1}{m}(-\\ln L) = \\text{mean BCE}',
      note: <>Minimising the log loss from the last lesson is exactly maximum likelihood.</>,
    },
  ],
}

function ObsMark() {
  const { xs, ys } = usePlot()
  return <circle cx={xs(Y_OBS)} cy={ys(0)} r={6} style={{ fill: 'var(--viz-4)', stroke: 'var(--surface)', strokeWidth: 2 }} />
}

export default function LossFromLikelihood() {
  const [tab, setTab] = useState<Tab>('gauss')
  const [yhat, setYhat] = useState(1.5)
  const [p, setP] = useState(0.8)
  const [label, setLabel] = useState<1 | 0>(1)
  const [shown, setShown] = useState(1)

  const steps = STEPS[tab]
  const like = gauss(Y_OBS, yhat)
  const nll = 0.5 * (Y_OBS - yhat) ** 2 + LN_SQRT_2PI
  const pObs = label === 1 ? p : 1 - p

  const switchTab = (t: Tab) => {
    setTab(t)
    setShown(1)
  }

  return (
    <Figure
      title="From a noise model to a loss"
      caption={
        <>
          {tab === 'gauss' ? (
            <>
              The bell is the model's belief about <M>y</M>: centred on its prediction <M>{'\\hat{y}'}</M>, with spread <M>{'\\sigma = 1'}</M>. The pink dot is the
              value that actually turned up, <M>{`y = ${Y_OBS}`}</M>. Its likelihood is the bell's height there. Drag the bell's peak: when{' '}
              <M>{'\\hat{y}'}</M> moves away, the height falls fast, and <M>{'-\\ln(\\text{height})'}</M> grows exactly like the squared error.
            </>
          ) : (
            <>
              A coin-flip model gives probability <M>p</M> to <M>y = 1</M> and <M>1 - p</M> to <M>y = 0</M>. The loss is minus the log of the bar for the label that
              actually happened, which is the binary cross-entropy. Slide <M>p</M> and switch the observed label.
            </>
          )}{' '}
          Then click <b>Next step</b> to build the derivation one line at a time.
        </>
      }
    >
      <Segmented
        label="Noise model"
        value={tab}
        onChange={switchTab}
        options={[
          { value: 'gauss', label: 'Gaussian noise → MSE' },
          { value: 'coin', label: 'Coin flip → cross-entropy' },
        ]}
      />
      {tab === 'gauss' ? (
        <>
          <Plot x={[-1, 7]} y={[0, 0.46]} width={480} height={220} minHeight={200} margin={{ left: 44, bottom: 36, top: 16 }} ariaLabel={`Gaussian centred on the prediction ${fix(yhat, 1)}; its height at the observed value ${Y_OBS} is ${fix(like, 3)}`}>
            <Grid xTicks={8} yTicks={4} />
            <Axes xLabel="value of y" xTicks={8} yTicks={4} />
            <FnPath f={(x) => gauss(x, yhat)} color="var(--viz-1)" width={2.75} />
            <Path points={[[Y_OBS, 0], [Y_OBS, like]]} color="var(--viz-4)" width={3} />
            <Path points={[[yhat, 0], [yhat, gauss(yhat, yhat)]]} color="var(--viz-1)" width={1.2} dash="3 4" />
            <Label x={Y_OBS} y={like} dx={8} dy={like > 0.3 ? 18 : -8} color="var(--viz-4)" size={12}>
              {`height ${fix(like, 3)}`}
            </Label>
            <Label x={Y_OBS} y={0} dx={-9} dy={-6} anchor="end" color="var(--viz-4)" size={12}>
              observed y
            </Label>
            <ObsMark />
            <Handle
              x={yhat}
              y={gauss(yhat, yhat)}
              lockY
              step={0.1}
              color="var(--viz-1)"
              tag="ŷ"
              tagDx={10}
              tagDy={-8}
              onChange={(x) => setYhat(Math.min(6.5, Math.max(-0.5, Math.round(x * 10) / 10)))}
              ariaLabel="Prediction y-hat"
              valueText={`prediction ${yhat.toFixed(1)}`}
            />
          </Plot>
          <Readout
            items={[
              ['prediction ŷ', fix(yhat, 1)],
              ['error y − ŷ', fix(Y_OBS - yhat, 1)],
              ['likelihood', fix(like, 3)],
              ['−ln(likelihood)', `½(${fix(Y_OBS - yhat, 1)})² + 0.919 = ${fix(nll, 3)}`],
            ]}
          />
        </>
      ) : (
        <>
          <div style={{ width: '100%', maxWidth: 520, display: 'grid', gap: '0.5rem' }}>
            <Bars
              ariaLabel="Probabilities the model gives to each label"
              max={1}
              data={[
                { label: <>P(y = 1) = <M>p</M></>, value: p, color: label === 1 ? 'var(--viz-4)' : 'var(--viz-muted)', strong: label === 1 },
                { label: <>P(y = 0) = <M>1 - p</M></>, value: 1 - p, color: label === 0 ? 'var(--viz-4)' : 'var(--viz-muted)', strong: label === 0 },
              ]}
            />
          </div>
          <Readout
            items={[
              ['observed label', `y = ${label}`],
              ['probability of what happened', fix(pObs, 2)],
              ['−ln of it = BCE', fix(-Math.log(pObs), 3)],
            ]}
          />
          <Controls>
            <Slider label={<M>p</M>} value={p} min={0.01} max={0.99} step={0.01} onChange={setP} format={(v) => v.toFixed(2)} />
            <Segmented
              label="Observed label"
              value={label}
              onChange={setLabel}
              options={[
                { value: 1, label: 'y = 1' },
                { value: 0, label: 'y = 0' },
              ]}
            />
          </Controls>
        </>
      )}
      <div style={{ width: '100%', border: '1px solid var(--rule)', borderRadius: 'var(--radius-m)', padding: '0.6rem 0.75rem', display: 'grid', gap: '0.4rem', background: 'var(--surface-2)' }}>
        {steps.slice(0, shown).map((s, i) => (
          <div key={`${tab}-${i}`} style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: i === shown - 1 ? 'var(--ink)' : 'var(--ink-2)' }}>
              {i + 1}. {s.title}
            </div>
            <MBlock>{s.tex}</MBlock>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}>{s.note}</div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => setShown(Math.max(1, shown - 1))} disabled={shown <= 1}>
            Back
          </Button>
          <Button primary onClick={() => setShown(Math.min(steps.length, shown + 1))} disabled={shown >= steps.length}>
            Next step
          </Button>
          <span className="tabular" style={{ fontSize: '0.85rem', color: 'var(--ink-3)', fontWeight: 600 }}>
            step {shown} of {steps.length}
          </span>
        </div>
      </div>
    </Figure>
  )
}
