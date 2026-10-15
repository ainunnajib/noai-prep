import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Plot, Grid, Axes, Path, Dots, VLine, useNarrow } from '../../../../../kit'
import { calibratedCounts, metricsOf, type Counts, type Metrics } from './evalMath'
import { HaloLabel } from './HaloLabel'
import { txt } from './colors'
import s from './eval.module.css'

/*
  Four applications, one question: where should the threshold go?
  For each scenario, 1,000 cases are scored by a CALIBRATED model (its score is the true probability of the
  positive class; see calibratedCounts in evalMath.ts), so the cheapest threshold is c_FP / (c_FP + c_FN).
  Total cost(t) = (cost of one FP) × FP(t) + (cost of one FN) × FN(t), using expected counts.
  We mark the threshold with the lowest total cost and the threshold with the highest F1.
*/

interface Scenario {
  id: string
  title: string
  sub: string
  pos: string
  neg: string
  fpMeans: string
  fnMeans: string
  share: number
  d: number
  cFP: number
  cFN: number
}

const SCENARIOS: Scenario[] = [
  {
    id: 'screen',
    title: 'Cancer screening',
    sub: 'positive = has cancer',
    pos: 'cancer',
    neg: 'healthy',
    fpMeans: 'a healthy person gets an extra test',
    fnMeans: 'a cancer is missed',
    share: 0.05,
    d: 2.5,
    cFP: 1,
    cFN: 20,
  },
  {
    id: 'spam',
    title: 'Spam filter',
    sub: 'positive = spam',
    pos: 'spam',
    neg: 'real email',
    fpMeans: 'a real email lands in the spam folder',
    fnMeans: 'a spam reaches your inbox',
    share: 0.4,
    d: 2.5,
    cFP: 10,
    cFN: 1,
  },
  {
    id: 'fraud',
    title: 'Card fraud alerts',
    sub: 'positive = fraud',
    pos: 'fraud',
    neg: 'genuine',
    fpMeans: 'a genuine payment is blocked for a check',
    fnMeans: 'a fraud goes through',
    share: 0.02,
    d: 3,
    cFP: 1,
    cFN: 10,
  },
  {
    id: 'face',
    title: 'Face unlock',
    sub: 'positive = it is the owner',
    pos: 'owner',
    neg: 'stranger',
    fpMeans: 'a stranger unlocks your phone',
    fnMeans: 'you have to type your PIN',
    share: 0.5,
    d: 4,
    cFP: 50,
    cFN: 1,
  },
]

const N = 1000
const TS = Array.from({ length: 197 }, (_, i) => 0.01 + i * 0.005)
const COST_C = 'var(--viz-3)'
const P_C = 'var(--viz-5)'
const R_C = 'var(--viz-4)'
const F1_C = 'var(--viz-6)'

function niceCeil(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p
  return 10 * p
}

interface Row {
  t: number
  c: Counts
  m: Metrics
  cost: number
}

export default function ErrorCostScenarios() {
  const [sid, setSid] = useState('screen')
  const sc = SCENARIOS.find((x) => x.id === sid)!
  const [cFP, setCFP] = useState(sc.cFP)
  const [cFN, setCFN] = useState(sc.cFN)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)

  const pick = (id: string) => {
    const n = SCENARIOS.find((x) => x.id === id)!
    setSid(id)
    setCFP(n.cFP)
    setCFN(n.cFN)
  }

  const nPos = N * sc.share
  const nNeg = N - nPos
  const rows: Row[] = useMemo(
    () =>
      TS.map((t) => {
        const c = calibratedCounts(t, sc.d, sc.share, N)
        const m = metricsOf(c)
        return { t, c, m, cost: cFP * c.fp + cFN * c.fn }
      }),
    [sc, nNeg, nPos, cFP, cFN],
  )
  const best = rows.reduce((a, b) => (b.cost < a.cost ? b : a))
  const bestF1 = rows.reduce((a, b) => (b.m.f1 > a.m.f1 ? b : a))
  const yMax = niceCeil(Math.min(Math.max(...rows.map((r) => r.cost)), 4 * best.cost))

  const plotH = narrow ? 210 : 190
  const fmtCost = (v: number) => (v >= 10000 ? `${Math.round(v / 1000)}k` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)))

  return (
    <Figure
      title="Which mistake costs more? Find the cheapest threshold"
      caption={
        <>
          Pick an application and compare the cheapest threshold (teal) with the one that maximises F1 (dashed olive). Then raise the cost of a false negative:
          the cheapest threshold slides left.
        </>
      }
    >
      <div className={s.cards} role="radiogroup" aria-label="Application">
        {SCENARIOS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="radio"
            aria-checked={x.id === sid}
            className={`${s.card} ${x.id === sid ? s.cardActive : ''}`}
            onClick={() => pick(x.id)}
          >
            <span className={s.cardTitle}>{x.title}</span>
            <span className={s.cardSub}>{x.sub}</span>
          </button>
        ))}
      </div>
      <div ref={wrapRef} className={s.wrap}>
        <Plot x={[0, 1]} y={[0, yMax]} width={560} height={plotH} minHeight={170} margin={{ left: 52, bottom: 26, top: 22 }} ariaLabel={`Total cost against threshold for ${sc.title}`}>
          <Grid xTicks={10} yTicks={4} />
          <Axes yLabel="total cost" xTicks={5} yTicks={4} tickFormat={(v) => (v > 1.5 ? fmtCost(v) : String(Math.round(v * 100) / 100))} />
          <VLine x={best.t} color={COST_C} dash="none" width={2} />
          <VLine x={bestF1.t} color={F1_C} dash="6 4" width={2} />
          <Path points={rows.map((r) => [r.t, r.cost] as [number, number])} color={COST_C} width={3} />
          <Dots points={[{ x: best.t, y: best.cost, color: COST_C, r: 6 }]} />
          <HaloLabel x={best.t} y={best.cost} dx={best.t > 0.6 ? -9 : 9} dy={18} anchor={best.t > 0.6 ? 'end' : 'start'} color={txt(COST_C)}>
            {`cheapest: t = ${best.t.toFixed(2)}`}
          </HaloLabel>
        </Plot>
        <Plot x={[0, 1]} y={[0, 1]} width={560} height={plotH} minHeight={170} margin={{ left: 52, bottom: 34, top: 14 }} ariaLabel={`Precision, recall and F1 against threshold for ${sc.title}`}>
          <Grid xTicks={10} yTicks={4} />
          <Axes xLabel="threshold" xTicks={5} yTicks={4} />
          <VLine x={best.t} color={COST_C} dash="none" width={2} />
          <VLine x={bestF1.t} color={F1_C} dash="6 4" width={2} />
          <Path points={rows.map((r) => [r.t, r.m.precision] as [number, number])} color={P_C} width={2.5} />
          <Path points={rows.map((r) => [r.t, r.m.recall] as [number, number])} color={R_C} width={2.5} />
          <Path points={rows.map((r) => [r.t, r.m.f1] as [number, number])} color={F1_C} width={2.5} dash="7 4" />
        </Plot>
      </div>
      <div className={s.legend}>
        <span>
          <span className={s.swatchLine} style={{ borderColor: COST_C }} />
          total cost
        </span>
        <span>
          <span className={s.swatchLine} style={{ borderColor: P_C }} />
          precision
        </span>
        <span>
          <span className={s.swatchLine} style={{ borderColor: R_C }} />
          recall
        </span>
        <span>
          <span className={`${s.swatchLine} ${s.swatchDash}`} style={{ borderColor: F1_C }} />
          F1 (dashed line = best F1)
        </span>
      </div>
      <Controls>
        <Slider label={`cost of a false positive: ${sc.fpMeans}`} value={cFP} min={1} max={50} step={1} onChange={setCFP} />
        <Slider label={`cost of a false negative: ${sc.fnMeans}`} value={cFN} min={1} max={50} step={1} onChange={setCFN} />
      </Controls>
      <table className={s.table} style={{ maxWidth: 420 }}>
        <thead>
          <tr>
            <th>per 1,000 cases</th>
            <th style={{ color: txt(COST_C) }}>lowest cost</th>
            <th style={{ color: txt(F1_C) }}>best F1</th>
          </tr>
        </thead>
        <tbody>
          {(
            [
              ['threshold', (r) => r.t.toFixed(2)],
              ['recall', (r) => r.m.recall.toFixed(2)],
              ['precision', (r) => r.m.precision.toFixed(2)],
              ['false positives (FP)', (r) => String(Math.round(r.c.fp))],
              ['false negatives (FN)', (r) => String(Math.round(r.c.fn))],
              ['total cost', (r) => String(Math.round(r.cost))],
            ] as [string, (r: Row) => string][]
          ).map(([name, f]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{f(best)}</td>
              <td>{f(bestF1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Figure>
  )
}
