import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Toggle, Readout, Plot, Axes, Path, Dots, Label } from '../../../../../kit'
import type { DotDatum } from '../../../../../kit'
import { simulate, type GroupMetrics } from './biasSim'
import s from './lim.module.css'

/*
  Bias in, bias out. A logistic-regression "approval model" is trained on past decisions in which
  qualified group-B applicants were sometimes rejected. Both groups are equally able (same score
  distribution), so every gap in the metrics comes from the biased records.
*/

const BAND: Record<0 | 1, number> = { 0: 1.45, 1: 0.45 }
const pctf = (x: number) => `${Math.round(x * 100)}%`

function Pair({ title, a, b, note }: { title: string; a: number; b: number; note?: string }) {
  const gap = Math.round(Math.abs(a - b) * 100)
  return (
    <div className={s.metric}>
      <div className={s.metricTitle}>{title}</div>
      {(
        [
          ['A', a, 'var(--viz-1)'],
          ['B', b, 'var(--viz-2)'],
        ] as const
      ).map(([g, v, c]) => (
        <div key={g} className={s.pairRow}>
          <span className={s.pairLabel} style={{ color: c }}>
            {g}
          </span>
          <span className={s.pairTrack}>
            <span className={s.pairFill} style={{ width: `${v * 100}%`, background: c }} />
          </span>
          <span className={s.pairVal}>{pctf(v)}</span>
        </div>
      ))}
      <div className={s.gap}>
        gap: <b style={{ color: gap >= 10 ? 'var(--viz-neg)' : 'var(--ink-2)' }}>{gap} points</b>
        {note ? ` · ${note}` : ''}
      </div>
    </div>
  )
}

export default function BiasAmplifier() {
  const [skew, setSkew] = useState(0.5)
  const [reweigh, setReweigh] = useState(false)

  const res = useMemo(() => simulate(skew, reweigh, 'truth'), [skew, reweigh])
  const hist = useMemo(() => simulate(skew, reweigh, 'history'), [skew, reweigh])
  const { A, B } = res

  const dots: DotDatum[] = res.train.map((p) => {
    const y = BAND[p.g] + 0.28 * p.jitter
    const biasedRecord = p.qualified && !p.label
    if (p.label) return { x: p.score, y, color: 'var(--viz-3)', r: 3.3 }
    if (biasedRecord && p.g === 1) return { x: p.score, y, color: 'var(--viz-neg)', r: 3.6, hollow: true }
    return { x: p.score, y, color: 'var(--viz-muted)', r: 3, hollow: true }
  })
  const flipped = res.train.filter((p) => p.g === 1 && p.qualified && !p.label).length

  const thrMark = (g: 0 | 1, m: GroupMetrics) => {
    const t = Math.max(0, Math.min(100, m.threshold))
    const top = BAND[g] + 0.42
    const bot = BAND[g] - 0.42
    const right = t > 78
    return (
      <g key={`t${g}`}>
        <Path
          points={[
            [t, bot],
            [t, top],
          ]}
          color="var(--viz-ink)"
          width={2.5}
        />
        <Label x={t} y={top} dx={right ? -5 : 5} dy={9} anchor={right ? 'end' : 'start'} color="var(--viz-ink)" weight={800} size={11.5}>
          {m.threshold > 100 ? 'approves no one' : `approves ≥ ${Math.round(m.threshold)}`}
        </Label>
      </g>
    )
  }

  // Only mention grading against the biased records when it changes the picture noticeably.
  const histHigher = !reweigh && hist.B.accuracy >= B.accuracy + 0.03
  const histLower = reweigh && hist.B.accuracy <= B.accuracy - 0.03

  return (
    <Figure
      wide
      title="Bias in, bias out: a model trained on unfair past decisions"
      caption={
        <>
          Each dot is one past applicant, placed by test score. Both groups are <b>equally able</b> (same score spread), but past reviewers rejected
          some qualified group-B applicants (red rings). A logistic-regression model learns from these records; the black bar shows the score above
          which it approves each group. Slide the bias up and watch the model turn a tendency in the data into a hard rule. Then turn on{' '}
          <b>reweighting</b>, which gives each (group, decision) pair a weight so that group and approval are no longer linked in the training data.
          Because the data are simulated, we know who was really qualified, so the cards below grade the model against the truth.
        </>
      }
    >
      <div className={s.wrap}>
        <Plot x={[0, 100]} y={[0, 2]} width={560} height={250} minHeight={220} margin={{ left: 12, right: 12, top: 10, bottom: 38 }} ariaLabel="Past applicants of group A and group B by test score, coloured by past decision, with the model's approval cut-off for each group">
          <Path points={[[50, 0.02], [50, 1.98]]} color="var(--viz-muted)" width={1.2} dash="4 4" />
          <Path points={[[0, 1], [100, 1]]} color="var(--viz-grid)" width={1} />
          <Dots points={dots} />
          {thrMark(0, A)}
          {thrMark(1, B)}
          <Label x={1} y={1.97} dy={10} color="var(--viz-1)" weight={800}>
            Group A (240)
          </Label>
          <Label x={1} y={0.97} dy={10} color="var(--viz-2)" weight={800}>
            Group B (80)
          </Label>
          <Axes xLabel="test score" xTicks={5} hideYTicks />
        </Plot>
        <div className={s.legend}>
          <span>
            <span className={s.swatch} style={{ background: 'var(--viz-3)', borderRadius: '50%' }} />
            approved in the past
          </span>
          <span>
            <span className={s.swatch} style={{ border: '2px solid var(--viz-muted)', borderRadius: '50%' }} />
            rejected in the past
          </span>
          <span>
            <span className={s.swatch} style={{ border: '2px solid var(--viz-neg)', borderRadius: '50%' }} />
            qualified but rejected ({flipped} in group B)
          </span>
          <span>
            <span className={s.swatch} style={{ borderLeft: '2px dashed var(--viz-muted)', borderRadius: 0, width: '0.5rem' }} />
            fair cut-off (score 50)
          </span>
        </div>
        <Controls>
          <Slider label="Bias in past decisions (qualified B applicants rejected)" value={skew} min={0} max={0.8} step={0.05} onChange={setSkew} format={(v) => pctf(v)} />
          <Toggle label="Reweight the training data" checked={reweigh} onChange={setReweigh} />
        </Controls>
        <div className={s.metricGrid}>
          <Pair title="Approved by the model" a={A.approval} b={B.approval} note="equal ability" />
          <Pair title="Qualified but rejected" a={A.missed} b={B.missed} />
          <Pair title="Accuracy (vs the truth)" a={A.accuracy} b={B.accuracy} />
        </div>
        <Readout
          items={[
            ['overall accuracy', pctf(res.overallAccuracy)],
            ['group A', pctf(A.accuracy)],
            ['group B', pctf(B.accuracy)],
          ]}
        />
        <div className={s.callout}>
          {skew === 0 ? (
            <>
              With fair records, both groups are treated alike: the cut-offs sit near 50 and the gaps are small (just noise). Now add some bias.
            </>
          ) : (
            <>
              Overall accuracy is <b>{pctf(res.overallAccuracy)}</b>, which sounds fine, because group B is only a quarter of the applicants. Measured
              per group, B is {B.missed > A.missed + 0.05 ? <b>rejected when qualified {pctf(B.missed)} of the time, against {pctf(A.missed)} for A</b> : <>treated much more like A</>}.{' '}
              {histHigher && (
                <>
                  And if you graded the model against the same biased records, B's accuracy would look like <b>{pctf(hist.B.accuracy)}</b> instead
                  of {pctf(B.accuracy)}: biased test labels hide the bias.
                </>
              )}
              {histLower && (
                <>
                  Graded against the biased records instead of the truth, B's accuracy would drop to <b>{pctf(hist.B.accuracy)}</b>: the fairer
                  model looks <i>worse</i> when the test labels share the bias.
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Figure>
  )
}
