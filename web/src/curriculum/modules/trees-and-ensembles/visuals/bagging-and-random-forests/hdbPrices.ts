import { mulberry32 } from '../../../../../kit'
import { gauss } from '../decision-trees/cart'

/*
  Made-up HDB resale prices for the feature-importance demo.
    price ($k) = 100 + 3.6·area + 3.2·lease + 2·storey − 20·distance to MRT + noise (sd 45)
  so floor area matters most, then lease, then storey and MRT distance. Storey is the middle of a
  3-storey band (as in HDB's published resale data) and the MRT distance is rounded to 0.5 km, so
  these two have few distinct values: that is what lets a random ID column (300 distinct values)
  out-rank them under impurity importance.
*/

export const BASE_FEATURES = ['floor area (m²)', 'remaining lease (yrs)', 'storey', 'km to MRT'] as const

export interface PriceData {
  X: number[][]
  y: number[]
}

export function hdbPrices(n: number, seed: number): PriceData {
  const rng = mulberry32(seed)
  const X: number[][] = []
  const y: number[] = []
  for (let i = 0; i < n; i++) {
    const area = Math.round(60 + rng() * 70)
    const lease = Math.round(45 + rng() * 50)
    const storey = 2 + 3 * Math.floor(rng() * 13)
    const mrt = 0.5 + 0.5 * Math.floor(rng() * 5)
    const price = 100 + 3.6 * area + 3.2 * lease + 2 * storey - 20 * mrt + 45 * gauss(rng)
    X.push([area, lease, storey, mrt])
    y.push(Math.round(price))
  }
  return { X, y }
}

/** Add optional extra columns: a copy of floor area in square feet, and a random unique flat ID. */
export function withExtras(d: PriceData, copy: boolean, id: boolean, seed: number): PriceData {
  const rng = mulberry32(seed)
  const ids = d.y.map((_, i) => i + 1)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  const X = d.X.map((row, i) => {
    const r = row.slice()
    if (copy) r.push(Math.round(row[0] * 10.764))
    if (id) r.push(1000 + ids[i])
    return r
  })
  return { X, y: d.y }
}
