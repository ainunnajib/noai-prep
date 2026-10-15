import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, useContainerWidth, mulberry32, shuffled } from '../../../../../kit'
import { ConfusionMatrix } from '../confusion-matrix-and-metrics/ConfusionMatrix'
import { MetricBars } from '../confusion-matrix-and-metrics/MetricBars'
import { metricsOf, type Counts } from '../confusion-matrix-and-metrics/evalMath'
import s from '../confusion-matrix-and-metrics/eval.module.css'

/*
  1,000 card payments drawn as a grid. Orange squares are frauds (positives). A fixed random
  order decides which squares are frauds, so lowering the fraud rate just removes some of them.
  Two models:
    "always genuine": predicts negative for everyone.
    "real detector": catches 80% of frauds and raises a false alarm on 5% of genuine payments.
  Mistakes get a red outline.
*/

const N = 1000
const RATES = [0.5, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001]
const ORDER = shuffled(
  Array.from({ length: N }, (_, i) => i),
  mulberry32(2027),
)
const POS_C = 'var(--viz-2)'
const NEG_C = 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))'

type ModelKind = 'always' | 'real'

export default function AccuracyParadox() {
  const [ri, setRi] = useState(6) // 1%
  const [model, setModel] = useState<ModelKind>('always')
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(640)

  const rate = RATES[ri]
  const nPos = Math.round(N * rate)
  const nNeg = N - nPos
  const tpCount = model === 'real' ? Math.round(0.8 * nPos) : 0
  const fpCount = model === 'real' ? Math.round(0.05 * nNeg) : 0

  // status of every cell: 'tp' | 'fn' | 'fp' | 'tn'
  const status = useMemo(() => {
    const st = new Array<'tp' | 'fn' | 'fp' | 'tn'>(N).fill('tn')
    ORDER.slice(0, nPos).forEach((cell, k) => (st[cell] = k < tpCount ? 'tp' : 'fn'))
    // false alarms are taken from the end of the order, so they are always genuine payments
    ORDER.slice(N - fpCount).forEach((cell) => (st[cell] = 'fp'))
    return st
  }, [nPos, tpCount, fpCount])

  const counts: Counts = { tp: tpCount, fn: nPos - tpCount, fp: fpCount, tn: nNeg - fpCount }
  const m = metricsOf(counts)

  const cols = width >= 520 ? 50 : 40
  const rows = N / cols
  const gap = 1.5
  const cell = Math.min(14, (Math.min(width, 720) - (cols - 1) * gap) / cols)
  const gw = cols * cell + (cols - 1) * gap
  const gh = rows * cell + (rows - 1) * gap

  return (
    <Figure
      title="The accuracy paradox: 1,000 card payments"
      caption={
        <>
          Each square is one payment; orange squares are frauds, and a red outline marks a wrong prediction. The <b>always genuine</b> model never flags
          anything. Slide the fraud rate down from 50% to 0.1%: its accuracy climbs to 99.9% while its recall stays at 0. Then switch to the <b>real detector</b>{' '}
          (catches 80% of frauds, false alarm on 5% of genuine payments). At 1% fraud its accuracy (0.95) is <i>lower</i> than the useless model's 0.99, yet it
          catches 8 of the 10 frauds.
        </>
      }
    >
      <Segmented<ModelKind>
        label="Model"
        value={model}
        onChange={setModel}
        options={[
          { value: 'always', label: 'always says "genuine"' },
          { value: 'real', label: 'real detector' },
        ]}
      />
      <div ref={wrapRef} className={s.wrap} style={{ display: 'grid', justifyItems: 'center' }}>
        <svg
          width={gw}
          height={gh}
          viewBox={`0 0 ${gw} ${gh}`}
          role="img"
          aria-label={`Grid of ${N} payments: ${nPos} frauds; TP ${counts.tp}, FN ${counts.fn}, FP ${counts.fp}, TN ${counts.tn}`}
          style={{ maxWidth: '100%', height: 'auto' }}
        >
          {status.map((st, i) => {
            const x = (i % cols) * (cell + gap)
            const y = Math.floor(i / cols) * (cell + gap)
            const isPos = st === 'tp' || st === 'fn'
            const wrong = st === 'fn' || st === 'fp'
            const sw = wrong ? Math.max(1.2, cell * 0.16) : 0
            return (
              <rect
                key={i}
                x={x + sw / 2}
                y={y + sw / 2}
                width={cell - sw}
                height={cell - sw}
                rx={cell * 0.18}
                style={{ fill: isPos ? POS_C : NEG_C, stroke: wrong ? 'var(--viz-neg)' : 'none', strokeWidth: sw }}
              />
            )
          })}
        </svg>
      </div>
      <div className={s.legend}>
        <span>
          <span className={`${s.swatch} ${s.swatchSquare}`} style={{ background: POS_C }} />
          fraud ({nPos})
        </span>
        <span>
          <span className={`${s.swatch} ${s.swatchSquare}`} style={{ background: NEG_C }} />
          genuine ({nNeg})
        </span>
        <span>
          <span className={`${s.swatch} ${s.swatchSquare}`} style={{ background: 'var(--surface)', border: '2px solid var(--viz-neg)' }} />
          wrong prediction
        </span>
      </div>
      <div className={s.panels}>
        <ConfusionMatrix counts={counts} negLabel="genuine" posLabel="fraud" />
        <MetricBars
          ariaLabel="Metrics of this model"
          data={[
            { label: 'accuracy', value: m.accuracy, color: 'var(--viz-axis)', digits: 3 },
            { label: 'precision', value: m.precision, color: 'var(--viz-5)', undefinedText: 'never flags fraud' },
            { label: 'recall', value: m.recall, color: 'var(--viz-4)' },
            { label: 'F1', value: m.f1, color: 'var(--viz-6)' },
          ]}
        />
      </div>
      <Controls>
        <Slider
          label="fraud rate"
          value={ri}
          min={0}
          max={RATES.length - 1}
          step={1}
          onChange={setRi}
          format={() => `${(rate * 100).toLocaleString('en-GB', { maximumFractionDigits: 1 })}% (${nPos} of ${N.toLocaleString('en-GB')})`}
        />
      </Controls>
    </Figure>
  )
}
