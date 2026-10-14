import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Grid, Axes, FnPath, Path, Label, Rect, Bars, usePlot, M } from '../../../../../kit'
import { Handle } from './Handle'
import { bce, fix } from './shared'

/*
  Log loss vs squared error for one example. x-axis: the predicted probability p of class 1.
  Toggle the true label; drag p. Below, the size of each loss's gradient with respect to the score z
  (for a sigmoid output): log loss gives |p − y|, squared error gives 2|p − y|·p(1 − p).
*/

const PMIN = 0.01
const PMAX = 0.99

function SeDot({ x, y }: { x: number; y: number }) {
  const { xs, ys } = usePlot()
  return <circle cx={xs(x)} cy={ys(y)} r={6} style={{ fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 2 }} />
}

function CurveLegend({ label }: { label: 1 | 0 }) {
  const item = { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' } as const
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25rem 1.2rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink-2)' }}>
      <span style={item}>
        <svg width="28" height="10" aria-hidden="true">
          <line x1="2" y1="5" x2="26" y2="5" style={{ stroke: 'var(--viz-1)', strokeWidth: 3 }} strokeLinecap="round" />
        </svg>
        log loss <M>{label === 1 ? '-\\ln p' : '-\\ln(1-p)'}</M>
      </span>
      <span style={item}>
        <svg width="28" height="10" aria-hidden="true">
          <line x1="2" y1="5" x2="26" y2="5" style={{ stroke: 'var(--viz-2)', strokeWidth: 2.5, strokeDasharray: '6 4' }} />
        </svg>
        squared error <M>{label === 1 ? '(1-p)^2' : 'p^2'}</M>
      </span>
    </div>
  )
}

export default function LogLossCurve() {
  const [label, setLabel] = useState<1 | 0>(1)
  const [p, setP] = useState(0.8)
  const loss = (q: number) => bce(q, label)
  const se = (q: number) => (label - q) ** 2
  const L = loss(p)
  const S = se(p)
  const gLog = Math.abs(p - label)
  const gSe = Math.abs(2 * (p - label) * p * (1 - p))
  const wrongZone: [number, number] = label === 1 ? [0, 0.1] : [0.9, 1]
  const confidentWrong = label === 1 ? p < 0.1 : p > 0.9

  return (
    <Figure
      title="Being confidently wrong is expensive"
      caption={
        <>
          The curves show the cost of one prediction <M>p</M> (the model's probability of class 1) when the true label is <M>{`y = ${label}`}</M>. Drag the pink dot.
          Near the right answer both costs are small. Drag towards the shaded zone, a confident mistake: log loss shoots up without limit, while squared error
          can never go above 1. The bars show how hard each loss pushes the score <M>z</M> to fix the prediction (the size of its gradient). Log loss pushes
          hardest exactly when the model is most wrong; squared error behind a sigmoid goes quiet there. Switch the label to see the mirror image.
        </>
      }
    >
      <CurveLegend label={label} />
      <Plot x={[0, 1]} y={[0, 5]} width={480} height={310} minHeight={260} margin={{ left: 40, bottom: 38, top: 28 }} ariaLabel={`Loss against predicted probability for true label ${label}. At p = ${fix(p)} the log loss is ${fix(L, 3)} and the squared error is ${fix(S, 3)}`}>
        <Rect x0={wrongZone[0]} x1={wrongZone[1]} y0={0} y1={5} fill="color-mix(in srgb, var(--viz-neg) 13%, transparent)" />
        <Grid xTicks={10} yTicks={5} />
        <Axes xLabel={`predicted p = P(class 1)`} xTicks={5} yTicks={5} />
        <Label x={0} y={5} dx={-6} dy={-12} size={13} weight={700} color="var(--ink-2)">
          loss
        </Label>
        <FnPath f={se} color="var(--viz-2)" width={2.5} dash="7 5" />
        <FnPath f={loss} color="var(--viz-1)" width={3} domain={[0.005, 0.995]} />
        <Label x={label === 1 ? 0.115 : 0.885} y={4.75} anchor={label === 1 ? 'start' : 'end'} size={11.5} color="var(--viz-neg)">
          confidently wrong
        </Label>
        <Path points={[[p, 0], [p, Math.min(5, L)]]} color="var(--viz-muted)" width={1.2} dash="3 4" />
        <SeDot x={p} y={S} />
        <Handle
          x={p}
          y={Math.min(5, L)}
          lockY
          step={0.01}
          onChange={(x) => setP(Math.min(PMAX, Math.max(PMIN, Math.round(x * 100) / 100)))}
          ariaLabel="Predicted probability p"
          valueText={`p ${p.toFixed(2)}, log loss ${L.toFixed(3)}`}
        />
      </Plot>
      <Readout
        items={[
          ['p', fix(p, 2)],
          ['log loss', fix(L, 3)],
          ['squared error', fix(S, 3)],
        ]}
      />
      <div style={{ width: '100%', display: 'grid', gap: '0.35rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>
          Push on the score <M>z</M> (size of the gradient){confidentWrong ? ': the model is confidently wrong' : ''}
        </div>
        <Bars
          ariaLabel="Size of the gradient of each loss with respect to the score"
          max={1}
          format={(v) => v.toFixed(3)}
          data={[
            { label: 'log loss  |p − y|', value: gLog, color: 'var(--viz-1)', strong: confidentWrong },
            { label: 'squared error  2|p − y|·p(1 − p)', value: gSe, color: 'var(--viz-2)' },
          ]}
        />
      </div>
      <Controls>
        <Segmented
          label="True label"
          value={label}
          onChange={setLabel}
          options={[
            { value: 1, label: 'y = 1 (passed)' },
            { value: 0, label: 'y = 0 (failed)' },
          ]}
        />
      </Controls>
    </Figure>
  )
}
