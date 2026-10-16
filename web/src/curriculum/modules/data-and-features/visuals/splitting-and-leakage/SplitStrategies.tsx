import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Slider, Button, Bars, useBump, mulberry32, shuffled } from '../../../../../kit'

/*
  60 card transactions in time order (5 months × 12), some of them a rare class (fraud).
  The learner picks a random, stratified or time-based split (validation = 20% = 12 rows),
  reshuffles, and makes the rare class rarer. Validation rows are drawn hollow. Bars compare the
  rare-class share in the whole data, the training part and the validation part, and a read-out
  counts validation rows whose "future" was used for training.
  Aha: random splits make the rare class's share in validation swing wildly (sometimes to zero);
  stratified splits fix the share; only the time split never trains on the future.
*/

type Strategy = 'random' | 'stratified' | 'time'
const N = 60
const PER_ROW = 12
const N_VAL = 12
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May']

/** largest-remainder allocation of n_val rows between rare and common, like scikit-learn's stratify */
function stratAlloc(nRare: number) {
  const exact = (N_VAL * nRare) / N
  let r = Math.floor(exact)
  let c = Math.floor(N_VAL - exact)
  if (r + c < N_VAL) {
    if (exact - r >= N_VAL - exact - c) r++
    else c++
  }
  return r
}

const cellBase: CSSProperties = {
  aspectRatio: '1',
  borderRadius: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  fontWeight: 800,
  minWidth: 0,
}

export default function SplitStrategies() {
  const [strategy, setStrategy] = useState<Strategy>('random')
  const [nRare, setNRare] = useState(5)
  const [seed, reshuffle] = useBump()

  // fixed order in which rows become rare, so the slider adds rare rows without moving the others
  const rareOrder = useMemo(() => shuffled(Array.from({ length: N }, (_, i) => i), mulberry32(11)), [])
  const isRare = useMemo(() => {
    const s = new Set(rareOrder.slice(0, nRare))
    return Array.from({ length: N }, (_, i) => s.has(i))
  }, [rareOrder, nRare])

  const isVal = useMemo(() => {
    const v = new Array<boolean>(N).fill(false)
    const rnd = mulberry32(1000 + seed * 7919)
    if (strategy === 'time') for (let i = N - N_VAL; i < N; i++) v[i] = true
    else if (strategy === 'random') shuffled(Array.from({ length: N }, (_, i) => i), rnd).slice(0, N_VAL).forEach((i) => (v[i] = true))
    else {
      const rare = shuffled(Array.from({ length: N }, (_, i) => i).filter((i) => isRare[i]), rnd)
      const common = shuffled(Array.from({ length: N }, (_, i) => i).filter((i) => !isRare[i]), rnd)
      const r = stratAlloc(nRare)
      ;[...rare.slice(0, r), ...common.slice(0, N_VAL - r)].forEach((i) => (v[i] = true))
    }
    return v
  }, [strategy, seed, isRare, nRare])

  const valRare = isVal.filter((v, i) => v && isRare[i]).length
  const trainRare = nRare - valRare
  const lastTrain = Math.max(...Array.from({ length: N }, (_, i) => (isVal[i] ? -1 : i)))
  const futureLeaks = isVal.filter((v, i) => v && i < lastTrain).length
  const pct = (a: number, b: number) => (100 * a) / b

  const cell = (i: number): CSSProperties => {
    const col = isRare[i] ? 'var(--viz-2)' : 'var(--viz-1)'
    return isVal[i]
      ? { ...cellBase, background: `color-mix(in srgb, ${col} 12%, var(--surface))`, border: `2.5px solid ${col}`, color: col }
      : { ...cellBase, background: col, border: `2.5px solid ${col}`, color: 'var(--surface)' }
  }

  return (
    <Figure
      title="Three ways to hold out 20% for validation"
      caption={
        <>
          Each square is one card transaction, in time order: read each row left to right, one row per month. Orange squares are the rare class
          (fraud); hollow squares are the 12 validation rows. Press <b>Reshuffle</b> a few times with the random split and watch the fraud share in
          validation jump around, sometimes to 0%. Stratifying keeps it at the overall share (as closely as whole rows allow). Then pick the time split: it is the only one that
          never trains on transactions from after the ones it is tested on.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Split"
          value={strategy}
          onChange={setStrategy}
          options={[
            { value: 'random', label: 'random' },
            { value: 'stratified', label: 'stratified' },
            { value: 'time', label: 'by time' },
          ]}
        />
        <Button onClick={reshuffle} disabled={strategy === 'time'}>
          Reshuffle
        </Button>
      </Controls>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--ink-3)', margin: '0 0 4px 34px' }}>
          <span>earlier</span>
          <span>time →</span>
          <span>later</span>
        </div>
        {MONTHS.map((m, r) => (
          <div key={m} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-3)', fontWeight: 700 }}>{m}</span>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${PER_ROW}, minmax(0, 1fr))`, gap: 3 }}>
              {Array.from({ length: PER_ROW }, (_, c) => {
                const i = r * PER_ROW + c
                return (
                  <div key={i} style={cell(i)} title={`${m} #${c + 1}: ${isRare[i] ? 'fraud' : 'normal'}, ${isVal[i] ? 'validation' : 'training'}`}>
                    {isVal[i] ? 'V' : ''}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1rem', fontSize: '0.8rem', color: 'var(--ink-2)', margin: '6px 0 0 34px' }}>
          <span>
            <span style={{ ...cellBase, display: 'inline-block', width: 12, height: 12, background: 'var(--viz-1)', verticalAlign: '-1px', marginRight: 5 }} />
            normal
          </span>
          <span>
            <span style={{ ...cellBase, display: 'inline-block', width: 12, height: 12, background: 'var(--viz-2)', verticalAlign: '-1px', marginRight: 5 }} />
            fraud
          </span>
          <span>filled = training</span>
          <span>hollow V = validation</span>
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: 4 }}>Share of fraud in each part</div>
        <Bars
          data={[
            { label: 'all data', value: pct(nRare, N), color: 'var(--viz-muted)' },
            { label: 'training', value: pct(trainRare, N - N_VAL), color: 'var(--viz-2)' },
            { label: 'validation', value: pct(valRare, N_VAL), color: 'var(--viz-2)', strong: true },
          ]}
          max={Math.max(40, pct(valRare, N_VAL))}
          format={(v) => `${v.toFixed(1)}%`}
          ariaLabel="Share of the rare class in all data, training and validation"
        />
      </div>
      <Controls>
        <Slider label="fraud cases in the data" value={nRare} min={3} max={18} onChange={setNRare} format={(v) => `${v} of ${N}`} />
      </Controls>
      <Readout
        items={[
          ['fraud in validation', `${valRare} of ${N_VAL}`],
          ['validation rows with training data from their future', `${futureLeaks} of ${N_VAL}`],
        ]}
      />
    </Figure>
  )
}
