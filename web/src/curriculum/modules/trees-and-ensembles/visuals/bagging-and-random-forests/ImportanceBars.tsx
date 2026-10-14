import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Toggle, Bars, mulberry32, useNarrow } from '../../../../../kit'
import { fitForest, forestImportances, forestValue, r2, type Forest } from './forest'
import { hdbPrices, withExtras, BASE_FEATURES } from './hdbPrices'
import s from '../decision-trees/trees.module.css'

/*
  Feature importance for a random forest that predicts (made-up) HDB resale prices.
  - Impurity importance (MDI): how much each feature's splits reduced the squared error, summed
    over all trees and normalised to add up to 1 (scikit-learn's feature_importances_).
  - Permutation importance: shuffle one column of the TEST data and measure the drop in R².
  Toggles add a copy of floor area (in square feet) and a meaningless random flat ID.
*/

const TRAIN = hdbPrices(300, 101)
const TEST = hdbPrices(300, 202)
const N_TREES = 30
const REPEATS = 3

interface Result {
  names: string[]
  kinds: ('base' | 'copy' | 'id')[]
  mdi: number[]
  perm: number[]
  score: number
}

function permutationImportance(f: Forest, X: number[][], y: number[], base: number) {
  const p = X[0].length
  return Array.from({ length: p }, (_, j) => {
    let total = 0
    for (let rep = 0; rep < REPEATS; rep++) {
      const rng = mulberry32(1000 + 31 * j + rep)
      const col = X.map((r) => r[j])
      for (let i = col.length - 1; i > 0; i--) {
        const k = Math.floor(rng() * (i + 1))
        ;[col[i], col[k]] = [col[k], col[i]]
      }
      const pred = X.map((r, i) => {
        const q = r.slice()
        q[j] = col[i]
        return forestValue(f, q)
      })
      total += base - r2(y, pred)
    }
    return total / REPEATS
  })
}

const cache = new Map<string, Result>()
function compute(copy: boolean, id: boolean): Result {
  const key = `${copy}-${id}`
  const hit = cache.get(key)
  if (hit) return hit
  const tr = withExtras(TRAIN, copy, id, 5)
  const te = withExtras(TEST, copy, id, 6)
  const forest = fitForest(tr.X, tr.y, N_TREES, 3, { task: 'reg', maxFeatures: 2 })
  const score = r2(
    te.y,
    te.X.map((x) => forestValue(forest, x)),
  )
  const names: string[] = [...BASE_FEATURES]
  const kinds: Result['kinds'] = ['base', 'base', 'base', 'base']
  if (copy) {
    names.push('floor area (sq ft) copy')
    kinds.push('copy')
  }
  if (id) {
    names.push('random flat ID')
    kinds.push('id')
  }
  const res = { names, kinds, mdi: forestImportances(forest), perm: permutationImportance(forest, te.X, te.y, score), score }
  cache.set(key, res)
  return res
}

const COLORS = { base: 'var(--viz-1)', copy: 'var(--viz-4)', id: 'var(--viz-6)' }

function Panel({ title, values, res, kind }: { title: string; values: number[]; res: Result; kind: 'mdi' | 'perm' }) {
  const top = kind === 'mdi' ? Math.max(0.6, ...values) : Math.max(1, ...values)
  return (
    <div style={{ minWidth: 0 }}>
      <p className={s.panelTitle}>{title}</p>
      <Bars
        ariaLabel={title}
        max={top}
        format={(v) => (kind === 'mdi' ? `${(100 * v).toFixed(1)}%` : v.toFixed(2))}
        data={res.names.map((nm, i) => ({ label: nm, value: Math.max(0, values[i]), color: COLORS[res.kinds[i]], strong: res.kinds[i] !== 'base' }))}
      />
    </div>
  )
}

export default function ImportanceBars() {
  const [copy, setCopy] = useState(false)
  const [id, setId] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(640)
  const res = useMemo(() => compute(copy, id), [copy, id])

  let note: string
  if (copy && id)
    note =
      'Both effects at once: the twins share the impurity credit and hide each other from permutation, while the ID collects a little impurity credit but no permutation importance.'
  else if (copy)
    note =
      'Impurity importance splits floor area\'s credit between the twins, so each looks about half as important. Permutation is worse: shuffling one twin hardly hurts because the forest still has the other, so both look less important than lease, even though floor area matters most.'
  else if (id)
    note =
      'The random ID means nothing, yet impurity importance gives it a share close to "km to MRT": with 300 different values, deep trees can always find an ID split that happens to fit some noise. Shuffling the ID changes nothing on new data, so its permutation importance is about 0.'
  else
    note =
      'Both methods agree on the order here: floor area, then lease, then storey, then distance to the MRT. Impurity importance adds up each feature\'s drop in squared error over all 30 trees (scaled to 100%); permutation importance is how much the test R² falls when that column is shuffled.'

  return (
    <Figure
      title="Which features does the forest rely on?"
      caption={
        <>
          A random forest of 30 trees predicts made-up HDB resale prices from four features (the true rule uses floor area most, then lease, then storey and
          distance to the MRT). Add a <b>copy of floor area</b> in square feet and watch the credit split between the twins, or add a <b>random flat ID</b>{' '}
          and see which method is fooled by it.
        </>
      }
    >
      <div ref={wrapRef} className={s.panels} style={{ gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: 18 }}>
        <Panel title="Impurity importance (adds up to 100%)" values={res.mdi} res={res} kind="mdi" />
        <Panel title="Permutation importance (drop in test R²)" values={res.perm} res={res} kind="perm" />
      </div>
      <p className={s.status}>{note}</p>
      <Readout items={[['forest test R²', res.score.toFixed(3)]]} />
      <Controls>
        <Toggle label="Add a copy of floor area (sq ft)" checked={copy} onChange={setCopy} />
        <Toggle label="Add a random flat ID" checked={id} onChange={setId} />
      </Controls>
    </Figure>
  )
}
