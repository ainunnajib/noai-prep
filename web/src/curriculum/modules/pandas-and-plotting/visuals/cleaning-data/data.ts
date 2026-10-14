/* Data and pandas-style formatting helpers shared by this lesson's visuals. */

export type Cell = number | string | null

/**
 * Format a float column the way pandas prints it: every value gets the same number of decimals,
 * the fewest (at least 1, at most 6) that show all of them exactly. NaN prints as "NaN".
 */
export function fmtFloatColumn(values: (number | null)[]): string[] {
  let d = 1
  for (const v of values) {
    if (v === null || !Number.isFinite(v)) continue
    const s = v.toFixed(6).replace(/0+$/, '')
    const dec = s.length - s.indexOf('.') - 1
    d = Math.max(d, dec)
  }
  return values.map((v) => (v === null || !Number.isFinite(v) ? 'NaN' : v.toFixed(d)))
}

/** Print a Series pandas-style: labels left-aligned, values right-aligned four spaces after the widest label. */
export function fmtSeries(labels: string[], values: string[], footer: string): string[] {
  const lw = Math.max(...labels.map((l) => l.length))
  const vw = Math.max(...values.map((v) => v.length))
  return [...labels.map((l, i) => l.padEnd(lw) + values[i].padStart(vw + 4)), footer]
}

// ------------------------------------------------------------------ MissingMap: 12 HDB resale records

export const MM_COLS = ['town', 'area', 'lease', 'price', 'reno'] as const
export type MMCol = (typeof MM_COLS)[number]

/** The full values (what the seller would have reported). `area` m², `lease` = years of lease left, `reno` = year of last renovation. */
export const MM_TRUE: Record<MMCol, (string | number)[]> = {
  town: ['Tampines', 'Bedok', 'Punggol', 'Tampines', 'Yishun', 'Tampines', 'Bedok', 'Punggol', 'Bishan', 'Yishun', 'Clementi', 'Sengkang'],
  area: [92, 67, 112, 68, 73, 120, 90, 95, 121, 70, 68, 93],
  lease: [61, 55, 88, 70, 72, 66, 52, 91, 63, 74, 48, 84],
  price: [585000, 398000, 720000, 430000, 455000, 760000, 540000, 598000, 1050000, 480000, 420000, 610000],
  reno: [2010, 2015, 2019, 2005, 2012, 2017, 2009, 2021, 2014, 2011, 2007, 2018],
}

/** Which cells start out missing: area ×2, lease ×1, reno ×10 (most sellers leave it blank). */
export const MM_START_MISSING: Record<MMCol, number[]> = {
  town: [],
  area: [3, 9],
  lease: [4],
  price: [],
  reno: [0, 2, 3, 4, 5, 6, 8, 9, 10, 11],
}

// ------------------------------------------------------------------ NaNFixer: a week of weather-station readings

export const W_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const W_COLS = ['temp', 'rain', 'humid', 'uv'] as const
export type WCol = (typeof W_COLS)[number]
/** temp °C at 2 pm, rain mm, humidity %, UV index (that sensor is often offline) */
export const W_DATA: Record<WCol, (number | null)[]> = {
  temp: [30.0, null, 31.0, 32.0, null, null, 30.5],
  rain: [0.0, 12.5, 3.0, 0.0, 25.0, 1.5, 0.0],
  humid: [78, 85, null, 74, 90, 82, 76],
  uv: [null, 9, null, 10, 11, null, null],
}

// ------------------------------------------------------------------ DtypeDoctor: a messy CSV

export const CSV_TEXT = `town,area,price
Tampines,92,"585,000"
Bedok,67,"398,000"
Punggol,unknown,"720,000"
Bedok,67,"398,000"
Bishan,121,"1,050,000"
Yishun,73,"455,000"`

export interface RawFlat {
  town: string
  area: string
  price: string
}
export const RAW: RawFlat[] = [
  { town: 'Tampines', area: '92', price: '585,000' },
  { town: 'Bedok', area: '67', price: '398,000' },
  { town: 'Punggol', area: 'unknown', price: '720,000' },
  { town: 'Bedok', area: '67', price: '398,000' },
  { town: 'Bishan', area: '121', price: '1,050,000' },
  { town: 'Yishun', area: '73', price: '455,000' },
]
