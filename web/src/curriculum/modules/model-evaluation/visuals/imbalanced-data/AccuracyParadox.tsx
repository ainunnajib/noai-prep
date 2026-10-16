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
  Mistakes get a red outline, separated from a smaller square in the class colour by a gap.
*/

const N = 1000
// rarest on the left, so sliding right means more fraud (like every other slider in the module)
const RATES = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5]
const ORDER = shuffled(
  Array.from({ length: N }, (_, i) => i),
  mulberry32(2027),
)
const POS_C = 'var(--viz-2)'
const NEG_C = 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))'

type ModelKind = 'always' | 'real'

export default function AccuracyParadox() {
  const [ri, setRi] = useState(3) // 1%
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
          Slide the fraud rate down to 0.1%: the <b>always genuine</b> model's accuracy climbs to 99.9% while its recall stays 0. Then switch to the{' '}
          <b>real detector</b>: at 1% fraud its accuracy is <i>lower</i> (0.948 against 0.990), yet it catches 8 of the 10 frauds.
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
            const fill = isPos ? POS_C : NEG_C
            if (st === 'tp' || st === 'tn') return <rect key={i} x={x} y={y} width={cell} height={cell} rx={cell * 0.18} style={{ fill }} />
            // a mistake: red outline, a gap in the surface colour, then a smaller square in the class colour
            // (the gap keeps the outline visible on orange squares, which are close to the red in dark mode)
            const sw = Math.max(1.2, cell * 0.16)
            const inset = sw + Math.max(0.7, cell * 0.08)
            return (
              <g key={i}>
                <rect x={x + sw / 2} y={y + sw / 2} width={cell - sw} height={cell - sw} rx={cell * 0.18} style={{ fill: 'var(--surface)', stroke: 'var(--viz-neg)', strokeWidth: sw }} />
                <rect x={x + inset} y={y + inset} width={cell - 2 * inset} height={cell - 2 * inset} rx={cell * 0.08} style={{ fill }} />
              </g>
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
    </Figure>
  )
}
