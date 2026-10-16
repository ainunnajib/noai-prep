import { useState } from 'react'
import { Figure, Controls, Button, Segmented, Plot, Rect, Label, Path, Bars, useNarrow, M } from '../../../../../kit'
import { Handle } from '../logistic-regression/Handle'
import { entropy, crossEntropy, kl, setProb, fix, logU, type Units } from './info'

/*
  Two editable distributions over four weather outcomes: the truth p and your forecast q.
  Drag a bar's top (the others rescale so each distribution still sums to 1). Read off the entropy,
  cross-entropy and both KL divergences. Start: the lesson's worked example.
*/

const OUTCOMES = ['sun', 'cloud', 'rain', 'storm']
const P0 = [0.5, 0.25, 0.125, 0.125]
const Q0 = [0.25, 0.125, 0.5, 0.125]
const P_C = 'var(--viz-1)'
const Q_C = 'var(--viz-2)'

function DistPanel({
  title,
  dist,
  color,
  onChange,
  surprise,
  units,
}: {
  title: string
  dist: number[]
  color: string
  onChange: (d: number[]) => void
  surprise?: boolean
  units: Units
}) {
  return (
    <div style={{ minWidth: 0, display: 'grid', gap: '0.2rem' }}>
      <div style={{ fontWeight: 800, color, fontSize: '0.95rem', textAlign: 'center' }}>{title}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', textAlign: 'center', fontWeight: 600 }}>
        {surprise ? `under each bar: your surprise −log${units === 'bits' ? '₂' : ''} q (${units})` : 'how often each weather really happens'}
      </div>
      <Plot x={[0, 4]} y={[0, 1.08]} width={300} height={190} maxWidth={420} margin={{ left: 10, right: 10, top: 8, bottom: surprise ? 44 : 26 }} ariaLabel={`${title}: ${dist.map((v, i) => `${OUTCOMES[i]} ${v.toFixed(2)}`).join(', ')}`}>
        <Path points={[[0, 0], [4, 0]]} color="var(--viz-axis)" width={1.25} />
        {dist.map((v, i) => (
          <g key={i}>
            <Rect x0={i + 0.17} x1={i + 0.83} y0={0} y1={v} fill={`color-mix(in srgb, ${color} 72%, var(--surface))`} rx={3} />
            <Label x={i + 0.5} y={v} dy={-14} anchor="middle" size={12} weight={700} color="var(--viz-ink)">
              {String(Number(v.toFixed(3)))}
            </Label>
            <Label x={i + 0.5} y={0} dy={16} anchor="middle" size={12} color="var(--ink-2)">
              {OUTCOMES[i]}
            </Label>
            {surprise && (
              <Label x={i + 0.5} y={0} dy={33} anchor="middle" size={11} color="var(--ink-3)">
                {v > 0 ? fix(-logU(v, units), 2) : '∞'}
              </Label>
            )}
            <Handle
              x={i + 0.5}
              y={v}
              lockX
              r={7}
              step={0.05}
              color={color}
              onChange={(_, y) => onChange(setProb(dist, i, Math.round(y * 100) / 100))}
              ariaLabel={`${title}: probability of ${OUTCOMES[i]}`}
              valueText={v.toFixed(2)}
            />
          </g>
        ))}
      </Plot>
    </div>
  )
}

export default function EntropyBars() {
  const [p, setP] = useState(P0)
  const [q, setQ] = useState(Q0)
  const [units, setUnits] = useState<Units>('bits')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const Hp = entropy(p, units)
  const Hpq = crossEntropy(p, q, units)
  const KLpq = kl(p, q, units)
  const KLqp = kl(q, p, units)
  const finite = [Hp, Hpq, KLpq, KLqp].filter(Number.isFinite)
  const top = Math.max(0.5, ...finite) * 1.05
  const u = units === 'bits' ? 'bits' : 'nats'

  return (
    <Figure
      title="Entropy, cross-entropy and KL divergence"
      caption={
        <>
          <M>p</M> is how the weather really behaves; <M>q</M> is your forecast. Drag the top of any bar (the other bars rescale so each row still adds up to
          1). The small numbers under <M>q</M> are your surprise <M>{units === 'bits' ? '-\\log_2 q' : '-\\ln q'}</M> when that weather turns up. Cross-entropy{' '}
          <M>{'H(p, q)'}</M> averages those surprises using how often each outcome really happens. Press <b>Make q = p</b>: the KL bars drop to 0. Press{' '}
          <b>Swap</b>: the two KL values trade places, so the order matters. Drag a <M>q</M> bar to 0 for weather that does happen: infinite surprise.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '0.6rem' }}>
        <DistPanel title="truth p" dist={p} color={P_C} onChange={setP} units={units} />
        <DistPanel title="forecast q" dist={q} color={Q_C} onChange={setQ} surprise units={units} />
      </div>
      <div style={{ width: '100%', display: 'grid', gap: '0.35rem' }}>
        <Bars
          ariaLabel={`Entropy and divergences in ${u}`}
          max={top}
          format={(v) => fix(v, 3)}
          data={[
            { label: <>entropy <M>{'H(p)'}</M></>, value: Hp, color: P_C },
            { label: <>cross-entropy <M>{'H(p, q)'}</M></>, value: Hpq, color: Q_C, strong: true },
            { label: <M>{'\\mathrm{KL}(p \\,\\|\\, q)'}</M>, value: KLpq, color: 'var(--viz-4)' },
            { label: <M>{'\\mathrm{KL}(q \\,\\|\\, p)'}</M>, value: KLqp, color: 'var(--viz-5)' },
          ]}
        />
        <div className="tabular" style={{ fontSize: '0.88rem', color: 'var(--ink-2)', textAlign: 'center' }}>
          {Number.isFinite(Hpq) ? (
            <M>{`\\mathrm{KL}(p\\,\\|\\,q) = H(p,q) - H(p) = ${fix(Hpq, 3)} - ${fix(Hp, 3)} = ${fix(KLpq, 3)}\\text{ ${u}}`}</M>
          ) : (
            <span>
              <b>q</b> gives probability 0 to weather that happens, so <M>{'H(p, q)'}</M> and <M>{'\\mathrm{KL}(p\\,\\|\\,q)'}</M> are infinite.
            </span>
          )}
          {!Number.isFinite(KLqp) && Number.isFinite(Hpq) && <div>KL(q ‖ p) is infinite: q expects weather that p says never happens.</div>}
        </div>
      </div>
      <Controls>
        <Button primary onClick={() => setQ(p.slice())}>
          Make q = p
        </Button>
        <Button
          onClick={() => {
            setP(q)
            setQ(p)
          }}
        >
          Swap p and q
        </Button>
        <Button
          onClick={() => {
            setP(P0)
            setQ(Q0)
          }}
        >
          Reset
        </Button>
        <Segmented
          label="Units"
          value={units}
          onChange={setUnits}
          options={[
            { value: 'bits', label: 'bits (log₂)' },
            { value: 'nats', label: 'nats (ln)' },
          ]}
        />
      </Controls>
    </Figure>
  )
}
