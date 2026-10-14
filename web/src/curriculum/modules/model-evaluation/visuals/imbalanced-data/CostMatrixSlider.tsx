import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Readout, Plot, Grid, Axes, FnPath, Rect, VLine, Dots, Label, DraggablePoint, M } from '../../../../../kit'
import { ConfusionMatrix } from '../confusion-matrix-and-metrics/ConfusionMatrix'
import { calibratedCounts, metricsOf, type Counts } from '../confusion-matrix-and-metrics/evalMath'
import s from '../confusion-matrix-and-metrics/eval.module.css'

/*
  Choosing a threshold from costs. A calibrated fraud model (2% fraud, 10,000 payments) gives
  each payment a probability p of being fraud.
    expected cost if we flag it      = (1 − p) × c_FP   (it might be genuine: a false alarm)
    expected cost if we let it pass  = p × c_FN         (it might be fraud: a miss)
  Flagging is cheaper exactly when p > c_FP / (c_FP + c_FN): that is the best threshold t*.
*/

const N = 10000
const SHARE = 0.02
const D = 3
const FLAG_C = 'var(--viz-5)'
const PASS_C = 'var(--viz-4)'

const money = (v: number) => `$${Math.round(v).toLocaleString('en-GB')}`

/** Expected counts for 10,000 payments, rounded to whole payments (so every number shown adds up). */
function countsAt(t: number): Counts {
  const c = calibratedCounts(t, D, SHARE, N)
  const tp = Math.round(c.tp)
  const fp = Math.round(c.fp)
  return { tp, fp, fn: N * SHARE - tp, tn: N * (1 - SHARE) - fp }
}

type Which = 'best' | 'half'

export default function CostMatrixSlider() {
  const [cFP, setCFP] = useState(10)
  const [cFN, setCFN] = useState(90)
  const [p, setP] = useState(0.3)
  const [which, setWhich] = useState<Which>('best')

  const tStar = cFP / (cFP + cFN)
  const t = which === 'best' ? tStar : 0.5
  const counts = countsAt(t)
  const m = metricsOf(counts)
  const total = cFP * counts.fp + cFN * counts.fn
  const cBest = countsAt(tStar)
  const cHalf = countsAt(0.5)
  const totalBest = cFP * cBest.fp + cFN * cBest.fn
  const totalHalf = cFP * cHalf.fp + cFN * cHalf.fn
  const yMax = Math.max(cFP, cFN) * 1.08
  const flagCost = (1 - p) * cFP
  const passCost = p * cFN
  const decision = flagCost < passCost ? 'flag it' : 'let it through'

  return (
    <Figure
      title="From costs to the best threshold"
      caption={
        <>
          Top: one payment that the model says is fraud with probability <M>p</M>. If you flag it, you pay <M>{'c_{FP}'}</M> whenever it was genuine, so the
          expected cost is <M>{'(1-p)\\,c_{FP}'}</M> (purple). If you let it through, you lose <M>{'c_{FN}'}</M> whenever it was fraud: <M>{'p\\,c_{FN}'}</M>{' '}
          (pink). Drag the point: flagging is cheaper to the right of the crossing, at <M>{'t^* = c_{FP}/(c_{FP}+c_{FN})'}</M>. Bottom: the confusion matrix for
          10,000 payments (2% fraud). Make a missed fraud more expensive and watch <M>{'t^*'}</M> slide left, recall rise and precision fall. Compare with the
          default threshold 0.5: higher accuracy, but a bigger bill.
        </>
      }
    >
      <Plot x={[0, 1]} y={[0, yMax]} width={520} height={250} minHeight={210} margin={{ left: 46, bottom: 34, top: 18 }} ariaLabel={`Expected cost of flagging versus letting through; they cross at t* = ${tStar.toFixed(3)}`}>
        <Rect x0={tStar} x1={1} y0={0} y1={yMax} fill="color-mix(in srgb, var(--viz-5) 8%, transparent)" />
        <Grid xTicks={10} yTicks={5} />
        <Axes xLabel="probability of fraud p" yLabel="expected cost ($)" xTicks={5} yTicks={5} />
        <FnPath f={(x) => (1 - x) * cFP} color={FLAG_C} width={3} />
        <FnPath f={(x) => x * cFN} color={PASS_C} width={3} />
        <VLine x={tStar} color="var(--viz-ink)" dash="5 4" width={1.6} />
        <Dots points={[{ x: tStar, y: (1 - tStar) * cFP, color: 'var(--viz-ink)', r: 5 }]} />
        <Label x={tStar} y={yMax * 0.72} dx={6} dy={0} color="var(--viz-ink)">
          {`t* = ${tStar.toFixed(3)}`}
        </Label>
        <Dots
          points={[
            { x: p, y: flagCost, color: FLAG_C, r: 5 },
            { x: p, y: passCost, color: PASS_C, r: 5 },
          ]}
        />
        <DraggablePoint x={p} y={0} lockY color="var(--viz-ink)" r={7} onChange={(x) => setP(Math.max(0, Math.min(1, Math.round(x * 100) / 100)))} />
      </Plot>
      <div className={s.legend}>
        <span>
          <span className={s.swatchLine} style={{ borderColor: FLAG_C }} />
          flag it: (1 − p) × c<sub>FP</sub> = {money(flagCost)}
        </span>
        <span>
          <span className={s.swatchLine} style={{ borderColor: PASS_C }} />
          let it through: p × c<sub>FN</sub> = {money(passCost)}
        </span>
        <span>
          at p = {p.toFixed(2)}: <b>{decision}</b>
        </span>
      </div>
      <Segmented<Which>
        label="Threshold used below"
        value={which}
        onChange={setWhich}
        options={[
          { value: 'best', label: `best, t* = ${tStar.toFixed(3)}` },
          { value: 'half', label: 'default, 0.5' },
        ]}
      />
      <div className={s.panels}>
        <ConfusionMatrix
          counts={counts}
          negLabel="genuine"
          posLabel="fraud"
          sub={{ fp: `× $${cFP} = ${money(cFP * counts.fp)}`, fn: `× $${cFN} = ${money(cFN * counts.fn)}`, tp: '$0', tn: '$0' }}
          format={(v) => Math.round(v).toLocaleString('en-GB')}
        />
        <Readout
          items={[
            ['threshold', t.toFixed(3)],
            ['total cost', money(total)],
            ['recall', m.recall.toFixed(2)],
            ['precision', m.precision.toFixed(2)],
            ['accuracy', m.accuracy.toFixed(3)],
            ['saving vs 0.5', money(totalHalf - totalBest)],
          ]}
        />
      </div>
      <Controls>
        <Slider label={<>cost of a false alarm <M>{'c_{FP}'}</M> (checking a genuine payment)</>} value={cFP} min={1} max={50} step={1} onChange={setCFP} format={(v) => `$${v}`} />
        <Slider label={<>cost of a missed fraud <M>{'c_{FN}'}</M> (money lost)</>} value={cFN} min={10} max={500} step={10} onChange={setCFN} format={(v) => `$${v}`} />
      </Controls>
    </Figure>
  )
}
