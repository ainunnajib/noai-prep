import { mulberry32 } from '../../../../../kit'

/*
  A made-up but realistic HDB resale sample shared by the plotting-data visuals.
  Generated deterministically from a seed, so every learner sees the same 144 flats.
  price is in $ thousands, area in square metres.
*/

export type Town = 'Bishan' | 'Tampines' | 'Woodlands'
export type FlatType = '3-room' | '4-room' | '5-room'
export interface Flat {
  town: Town
  flat_type: FlatType
  area: number
  price: number
  year: number
}

export const TOWNS: Town[] = ['Bishan', 'Tampines', 'Woodlands']
export const FLAT_TYPES: FlatType[] = ['3-room', '4-room', '5-room']
export const YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]

/** $ thousands per square metre in 2017, by town */
const PSM: Record<Town, number> = { Bishan: 6.3, Tampines: 5.0, Woodlands: 4.1 }
const AREA: Record<FlatType, [number, number]> = { '3-room': [68, 3], '4-room': [93, 3.5], '5-room': [117, 4] }
/** price level relative to 2017 */
const YEAR_FACTOR: Record<number, number> = { 2017: 1, 2018: 0.99, 2019: 0.98, 2020: 1.03, 2021: 1.16, 2022: 1.28, 2023: 1.36, 2024: 1.47 }

function makeData(): Flat[] {
  const rnd = mulberry32(2063)
  const normal = () => {
    const u = Math.max(1e-9, rnd())
    const v = rnd()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const out: Flat[] = []
  // 144 flats: every year has the same mix in every town (one 3-room, three 4-room and two
  // 5-room flats), so yearly medians compare like with like
  const MIX: FlatType[] = ['3-room', '4-room', '4-room', '4-room', '5-room', '5-room']
  for (let i = 0; i < 144; i++) {
    const town = TOWNS[i % 3]
    const year = YEARS[Math.floor(i / 3) % YEARS.length]
    const flat_type = MIX[Math.floor(i / 24)]
    const [mu, sd] = AREA[flat_type]
    const area = Math.round(mu + sd * normal())
    const price = Math.round(area * PSM[town] * YEAR_FACTOR[year] * (1 + 0.05 * normal()))
    out.push({ town, flat_type, area, price, year })
  }
  return out
}

export const DATA: Flat[] = makeData()

/* ---------------- small statistics helpers ---------------- */
export const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length

/** Percentile with linear interpolation: the default of np.percentile, matplotlib and seaborn box plots. */
export function percentile(v: number[], p: number) {
  const s = [...v].sort((a, b) => a - b)
  const pos = ((s.length - 1) * p) / 100
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return s[lo] + (s[hi] - s[lo]) * (pos - lo)
}
export const median = (v: number[]) => percentile(v, 50)

export interface BoxStats {
  q1: number
  med: number
  q3: number
  lo: number
  hi: number
  fliers: number[]
}
/** Tukey box plot: whiskers reach the furthest points within 1.5 × IQR of the box. */
export function boxStats(v: number[]): BoxStats {
  const q1 = percentile(v, 25)
  const q3 = percentile(v, 75)
  const iqr = q3 - q1
  const inside = v.filter((x) => x >= q1 - 1.5 * iqr && x <= q3 + 1.5 * iqr)
  return {
    q1,
    med: percentile(v, 50),
    q3,
    lo: Math.min(...inside),
    hi: Math.max(...inside),
    fliers: v.filter((x) => x < q1 - 1.5 * iqr || x > q3 + 1.5 * iqr),
  }
}

/** Bin edges like np.histogram(v, bins=n): n equal-width bins from min to max. */
export function binEdges(v: number[], n: number) {
  const lo = Math.min(...v)
  const hi = Math.max(...v)
  return Array.from({ length: n + 1 }, (_, i) => lo + ((hi - lo) * i) / n)
}
export function histCounts(v: number[], edges: number[]) {
  const n = edges.length - 1
  const c = Array(n).fill(0)
  for (const x of v) {
    let k = Math.floor(((x - edges[0]) / (edges[n] - edges[0])) * n)
    if (k >= n) k = n - 1 // the last bin includes its right edge
    if (k >= 0) c[k]++
  }
  return c
}

/** Round a range outwards to tidy numbers for an axis. */
export function niceRange(lo: number, hi: number, step: number): [number, number] {
  return [Math.floor(lo / step) * step, Math.ceil(hi / step) * step]
}
