/*
  30 made-up but realistic HDB resale flats: floor area (m²) and resale price (S$ thousands).
  Built so that the best straight line (least squares) is almost exactly price = 5 × area + 100,
  with MSE ≈ 1,650 and RMSE ≈ 40.6 (checked in Python with numpy.polyfit).
*/
export const FLATS: [number, number][] = [
  [44, 345], [46, 298], [64, 395], [66, 408], [67, 454], [68, 470], [69, 462], [69, 461], [71, 479], [89, 521],
  [90, 560], [90, 475], [91, 529], [91, 596], [93, 595], [94, 633], [95, 517], [97, 627], [99, 560], [104, 658],
  [112, 584], [113, 642], [114, 663], [116, 618], [117, 650], [120, 790], [137, 837], [143, 839], [151, 846], [152, 848],
]

/** Mean squared error of the line price = w × area + b on the given flats. */
export function mse(w: number, b: number, data: [number, number][] = FLATS): number {
  let s = 0
  for (const [x, y] of data) {
    const r = y - (w * x + b)
    s += r * r
  }
  return s / data.length
}

/** Least-squares line (the lowest possible MSE) for the given data. */
export function bestLine(data: [number, number][] = FLATS): { w: number; b: number } {
  const n = data.length
  let sx = 0
  let sy = 0
  for (const [x, y] of data) {
    sx += x
    sy += y
  }
  const mx = sx / n
  const my = sy / n
  let sxy = 0
  let sxx = 0
  for (const [x, y] of data) {
    sxy += (x - mx) * (y - my)
    sxx += (x - mx) * (x - mx)
  }
  const w = sxx === 0 ? 0 : sxy / sxx
  return { w, b: my - w * mx }
}

/** 1,234 style formatting for prices and losses. */
export const fmt = (v: number, digits = 0) => v.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits })

/** Axis ticks such as 10k, 20k for large loss values. */
export const kTicks = (v: number) => (Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}k` : String(Math.round(v * 100) / 100))

/** Plain tick labels (the kit's default writes 1000 as 1e+3). */
export const plainTick = (v: number) => String(Math.round(v * 100) / 100)

/** Plot window shared by the scatter plots in this lesson. */
export const AREA: [number, number] = [40, 160]
export const PRICE: [number, number] = [150, 1000]
