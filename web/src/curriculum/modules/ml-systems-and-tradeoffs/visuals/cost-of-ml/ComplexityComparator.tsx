import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Plot, Grid, Axes, FnPath, Dots, VLine, useNarrow } from '../../../../../kit'
import { approx, duration, pow10, sup } from './format'

/*
  Rough operation counts (multiply-adds or comparisons) for n training examples with d features:
    k-NN            train: n·d (it only stores the data)   predict: n·d (distance to every stored point)   keeps n·d numbers
    linear model    train: 2·E·n·d (E epochs of gradient descent, forward + gradient)   predict: d   keeps d + 1
    decision tree   depth D = min(10, ⌈log₂ n⌉); train: n·d·D (every level scans every example on every feature)
                    predict: D comparisons   keeps at most 2^(D+1) nodes
    neural net      one hidden layer of 64 units, P = 64(d + 1) + 65 parameters; train: 3·E·n·P (backward ≈ 2 × forward)
                    predict: P   keeps P
  E = 100 epochs. Time assumes 10⁹ simple operations per second (about one CPU core).
*/

const E = 100
const OPS_PER_S = 1e9
type View = 'train' | 'predict' | 'total'

interface Model {
  id: string
  name: string
  colour: string
  train: (n: number, d: number) => number
  predict: (n: number, d: number) => number
  memory: (n: number, d: number) => number
}

const depth = (n: number) => Math.min(10, Math.ceil(Math.log2(n)))
const P = (d: number) => 64 * (d + 1) + 65

const MODELS: Model[] = [
  { id: 'knn', name: 'k-NN', colour: 'var(--viz-2)', train: (n, d) => n * d, predict: (n, d) => n * d, memory: (n, d) => n * d },
  { id: 'lin', name: 'Linear model', colour: 'var(--viz-1)', train: (n, d) => 2 * E * n * d, predict: (_n, d) => d, memory: (_n, d) => d + 1 },
  { id: 'tree', name: 'Decision tree', colour: 'var(--viz-3)', train: (n, d) => n * d * depth(n), predict: (n) => depth(n), memory: (n) => Math.min(2 * n, 2 ** (depth(n) + 1)) },
  { id: 'nn', name: 'Small neural net', colour: 'var(--viz-4)', train: (n, d) => 3 * E * n * P(d), predict: (_n, d) => P(d), memory: (_n, d) => P(d) },
]

const N_LOG = [2, 7] as [number, number]
const COLS = 'minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1fr)'
const Y_TOP: Record<View, number> = { train: 15, predict: 11, total: 18 }

export default function ComplexityComparator() {
  const [view, setView] = useState<View>('predict')
  const [nLog, setNLog] = useState(5)
  const [dLog, setDLog] = useState(1.3)
  const [qLog, setQLog] = useState(0)

  const [ref, narrow] = useNarrow<HTMLDivElement>(480)
  const n = Math.round(10 ** nLog)
  const d = Math.max(1, Math.round(10 ** dLog))
  const Q = Math.round(10 ** qLog)

  const cost = (m: Model, nn: number) => (view === 'train' ? m.train(nn, d) : view === 'predict' ? m.predict(nn, d) : m.train(nn, d) + Q * m.predict(nn, d))
  const rows = MODELS.map((m) => ({ m, v: cost(m, n) }))
  const best = Math.min(...rows.map((r) => r.v))
  const worst = Math.max(...rows.map((r) => r.v))

  const yTop = Y_TOP[view]
  const yLog = (v: number) => Math.min(yTop, Math.log10(Math.max(1, v)))
  const yLabel = view === 'train' ? 'operations to train' : view === 'predict' ? 'operations per prediction' : `train + ${approx(Q)} prediction${Q === 1 ? '' : 's'}`

  return (
    <Figure
      wide
      title="Cheap to train, expensive to run?"
      caption={
        <>
          Both axes are logarithmic: each grid step is 10 times more. Switch between training cost and the cost of one prediction, then drag n. k-NN costs almost nothing to "train" but every
          prediction scans all n stored examples, so its line climbs with n; a tree answers in at most {depth(n)} comparisons (we cap its depth at 10), however large n gets. In the last view, raise the number of predictions and
          watch k-NN go from cheapest to most expensive. Times assume 10⁹ operations per second.
        </>
      }
    >
      <Segmented
        label="Cost of"
        value={view}
        onChange={setView}
        options={[
          { value: 'train', label: 'training' },
          { value: 'predict', label: 'one prediction' },
          { value: 'total', label: 'training + many predictions' },
        ]}
      />
      <Plot x={N_LOG} y={[0, yTop]} width={560} height={300} minHeight={250} margin={{ left: 46, right: 14, top: 16, bottom: 38 }} ariaLabel={`Log-log plot of ${yLabel} against the number of training examples`}>
        <Grid xTicks={5} yTicks={yTop} />
        <Axes xLabel="training examples n" yLabel={yLabel} xTicks={5} yTicks={Math.ceil(yTop / 2)} tickFormat={(v) => (Number.isInteger(v) ? pow10(v) : '')} />
        {MODELS.map((m) => (
          <FnPath key={m.id} f={(x) => Math.log10(Math.max(1, cost(m, 10 ** x)))} color={m.colour} width={2.8} samples={160} />
        ))}
        <VLine x={nLog} color="var(--ink-3)" />
        <Dots points={rows.map((r) => ({ x: nLog, y: yLog(r.v), color: r.m.colour, r: 5.5 }))} />
      </Plot>
      <Controls>
        <Slider label="training examples n" value={nLog} min={2} max={7} step={0.1} onChange={setNLog} format={() => n.toLocaleString('en-GB')} />
        <Slider label="features d" value={dLog} min={0.5} max={3} step={0.1} onChange={setDLog} format={() => d.toLocaleString('en-GB')} />
        {view === 'total' && <Slider label="number of predictions" value={qLog} min={0} max={7} step={0.25} onChange={setQLog} format={() => Q.toLocaleString('en-GB')} />}
      </Controls>
      <div ref={ref} style={{ width: '100%', display: 'grid', gap: 0 }} role="table" aria-label="Cost of each model at the chosen n and d">
        {!narrow && (
          <div role="row" style={{ display: 'grid', gridTemplateColumns: COLS, gap: 8, padding: '3px 6px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>
            <span role="columnheader">model</span>
            <span role="columnheader" style={{ textAlign: 'right' }}>operations</span>
            <span role="columnheader" style={{ textAlign: 'right' }}>time</span>
            <span role="columnheader" style={{ textAlign: 'right' }}>numbers kept</span>
          </div>
        )}
        {rows.map(({ m, v }) => {
          const name = (
            <span style={{ fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
              <span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: 3, background: m.colour, marginRight: 6, verticalAlign: '-1px' }} />
              {m.name}
              {v === best && <span style={{ marginLeft: 6, fontSize: 11.5, color: 'var(--ok)', fontWeight: 800 }}>cheapest</span>}
              {v === worst && <span style={{ marginLeft: 6, fontSize: 11.5, color: 'var(--bad)', fontWeight: 800 }}>most costly</span>}
            </span>
          )
          const mono = { fontFamily: 'var(--font-mono)' }
          return narrow ? (
            <div key={m.id} role="row" style={{ borderTop: '1px solid var(--rule)', padding: '5px 4px', fontSize: 13, display: 'grid', gap: 2 }}>
              <span role="cell">{name}</span>
              <span role="cell" style={{ color: 'var(--ink-2)' }}>
                <b style={{ ...mono, color: 'var(--ink)' }}>{approx(v)}</b> ops · <span style={mono}>{duration(v / OPS_PER_S)}</span> · keeps <span style={mono}>{approx(m.memory(n, d))}</span> numbers
              </span>
            </div>
          ) : (
            <div key={m.id} role="row" style={{ display: 'grid', gridTemplateColumns: COLS, gap: 8, borderTop: '1px solid var(--rule)', padding: '4px 6px', fontSize: 13, alignItems: 'center' }}>
              <span role="cell">{name}</span>
              <span role="cell" style={{ ...mono, textAlign: 'right', color: 'var(--ink)' }}>{approx(v)}</span>
              <span role="cell" style={{ ...mono, textAlign: 'right', color: 'var(--ink-2)' }}>{duration(v / OPS_PER_S)}</span>
              <span role="cell" style={{ ...mono, textAlign: 'right', color: 'var(--ink-2)' }}>{approx(m.memory(n, d))}</span>
            </div>
          )
        })}
      </div>
      <div style={{ width: '100%', fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.45 }}>
        Assumed: linear model and neural net trained for E = 100 epochs; tree depth limited to 10; neural net with one hidden layer of 64 units ({approx(P(d))} parameters at d = {d}).
        Exponents: 10{sup(3)} = thousand, 10{sup(6)} = million, 10{sup(9)} = billion.
      </div>
    </Figure>
  )
}
