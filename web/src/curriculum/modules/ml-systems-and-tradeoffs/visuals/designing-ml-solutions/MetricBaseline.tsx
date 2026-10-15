import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button } from '../../../../../kit'

/*
  10,000 card transactions, 100 of them fraudulent (1%). Three candidates:
    baseline  "always say legit"          TP 0   FP 0    FN 100  TN 9900
    model A   catches most, many alarms    TP 80  FP 300  FN 20   TN 9600
    model B   careful, fewer alarms        TP 50  FP 20   FN 50   TN 9880
  Accuracy = (TP + TN)/N, precision = TP/(TP + FP), recall = TP/(TP + FN), F1 = 2PR/(P + R),
  cost = FN × (cost of a missed fraud) + FP × (cost of a false alarm).
*/

interface Cand {
  id: string
  name: string
  blurb: string
  TP: number
  FP: number
  FN: number
  TN: number
  colour: string
}

const CANDS: Cand[] = [
  { id: 'base', name: 'Baseline: always "legit"', blurb: 'catches 0 of 100 frauds, 0 false alarms', TP: 0, FP: 0, FN: 100, TN: 9900, colour: 'var(--viz-muted)' },
  { id: 'A', name: 'Model A', blurb: 'catches 80 of 100 frauds, 300 false alarms', TP: 80, FP: 300, FN: 20, TN: 9600, colour: 'var(--viz-1)' },
  { id: 'B', name: 'Model B', blurb: 'catches 50 of 100 frauds, 20 false alarms', TP: 50, FP: 20, FN: 50, TN: 9880, colour: 'var(--viz-2)' },
]

type Metric = 'acc' | 'prec' | 'rec' | 'f1' | 'cost'

const METRICS: { value: Metric; label: string }[] = [
  { value: 'acc', label: 'accuracy' },
  { value: 'prec', label: 'precision' },
  { value: 'rec', label: 'recall' },
  { value: 'f1', label: 'F1' },
  { value: 'cost', label: 'cost ($)' },
]

const PRESETS = [
  { name: 'Bank: missed fraud $500, check call $5', fn: 500, fp: 5 },
  { name: 'Small shop: fraud $40, lost customer $50', fn: 40, fp: 50 },
]

function score(c: Cand, m: Metric, cFN: number, cFP: number): number | null {
  const N = c.TP + c.FP + c.FN + c.TN
  const prec = c.TP + c.FP > 0 ? c.TP / (c.TP + c.FP) : null
  const rec = c.TP / (c.TP + c.FN)
  switch (m) {
    case 'acc':
      return (c.TP + c.TN) / N
    case 'prec':
      return prec
    case 'rec':
      return rec
    case 'f1':
      return prec === null || prec + rec === 0 ? 0 : (2 * prec * rec) / (prec + rec)
    case 'cost':
      return c.FN * cFN + c.FP * cFP
  }
}

const money = (v: number) => `$${Math.round(v).toLocaleString('en-GB')}`

export default function MetricBaseline() {
  const [metric, setMetric] = useState<Metric>('acc')
  const [cFN, setCFN] = useState(500)
  const [cFP, setCFP] = useState(5)

  const vals = CANDS.map((c) => score(c, metric, cFN, cFP))
  const lowerBetter = metric === 'cost'
  const defined = vals.filter((v): v is number => v !== null)
  const bestVal = lowerBetter ? Math.min(...defined) : Math.max(...defined)
  const winners = CANDS.filter((_, i) => vals[i] === bestVal)
  const max = metric === 'cost' ? Math.max(1, ...defined) : 1
  const fmt = (v: number | null) => (v === null ? 'undefined' : metric === 'cost' ? money(v) : `${(v * 100).toFixed(1)}%`)

  const verdict =
    winners.length > 1
      ? `${winners.map((w) => w.name.replace(': always "legit"', '')).join(' and ')} tie on ${METRICS.find((m) => m.value === metric)!.label}.`
      : winners[0].id === 'base'
        ? `By ${METRICS.find((m) => m.value === metric)!.label}, doing nothing wins. ${metric === 'acc' ? 'Accuracy rewards ignoring the rare class.' : 'With these costs, false alarms hurt more than the fraud they stop.'}`
        : `By ${METRICS.find((m) => m.value === metric)!.label}, ${winners[0].name} wins.`

  return (
    <Figure
      wide
      title="Which model is best? It depends on the metric"
      caption={
        <>
          10,000 card transactions, 100 of them fraud. Switch the metric and watch the winner change: accuracy prefers the useless baseline over Model A, because 99% of transactions are
          legitimate anyway. Then choose <b>cost</b> and try both business presets, or set your own prices for a missed fraud and a false alarm. The right metric is the one that matches what a
          mistake costs the business, and every model must beat the do-nothing baseline on it.
        </>
      }
    >
      <Segmented label="Judge by" value={metric} onChange={setMetric} options={METRICS} />

      <div style={{ width: '100%', display: 'grid', gap: 10 }} role="list" aria-label="Scores of the three candidates">
        {CANDS.map((c, i) => {
          const v = vals[i]
          const win = v !== null && v === bestVal
          return (
            <div key={c.id} role="listitem" style={{ display: 'grid', gap: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0 10px', fontSize: 13.5 }}>
                <span style={{ fontWeight: 800, color: 'var(--ink)' }}>
                  {c.name}
                  {win && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--ok)', fontWeight: 800 }}>{lowerBetter ? 'cheapest' : 'best'}</span>}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: v === null ? 'var(--ink-3)' : 'var(--ink)' }}>{fmt(v)}</span>
              </div>
              <div style={{ height: 16, borderRadius: 5, background: 'var(--surface-2)', border: '1px solid var(--rule)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${v === null ? 0 : (v / max) * 100}%`,
                    height: '100%',
                    background: `color-mix(in srgb, ${c.colour} ${win ? 85 : 55}%, var(--surface))`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                {c.blurb}
                {metric === 'prec' && v === null && ' (it never says "fraud", so precision is 0 ÷ 0)'}
                {metric === 'cost' && ` → ${c.FN} × ${money(cFN)} + ${c.FP} × ${money(cFP)}`}
              </div>
            </div>
          )
        })}
      </div>

      <div
        role="status"
        style={{
          width: '100%',
          padding: '0.45rem 0.7rem',
          borderRadius: 8,
          fontSize: 13.5,
          fontWeight: 650,
          background: winners.length === 1 && winners[0].id === 'base' ? 'var(--warn-soft)' : 'var(--ok-soft)',
          color: winners.length === 1 && winners[0].id === 'base' ? 'var(--warn)' : 'var(--ok)',
        }}
      >
        {verdict}
      </div>

      {metric === 'cost' && (
        <>
          <Controls>
            <Slider label="cost of a missed fraud" value={cFN} min={0} max={1000} step={10} onChange={setCFN} format={money} />
            <Slider label="cost of a false alarm" value={cFP} min={0} max={100} step={1} onChange={setCFP} format={money} />
          </Controls>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%' }}>
            {PRESETS.map((p) => (
              <Button
                key={p.name}
                onClick={() => {
                  setCFN(p.fn)
                  setCFP(p.fp)
                }}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </>
      )}
    </Figure>
  )
}
