/*
  A 1-D training loss with one sharp and one flat minimum of EQUAL depth, used by SharpFlatMinima
  and MinimaEscape. It is a smooth minimum of two parabolas:
      q₁(w) = ½·C_SHARP·(w − W_SHARP)² + FLOOR      (narrow pit)
      q₂(w) = ½·C_FLAT ·(w − W_FLAT )² + FLOOR      (wide basin)
      L(w)  = −T·log(e^(−q₁/T) + e^(−q₂/T))          (≈ min(q₁, q₂), but smooth)
*/

export const W_SHARP = -1.5
export const W_FLAT = 1.2
export const C_SHARP = 24
export const C_FLAT = 1.2
export const FLOOR = 0.3
const T = 0.05

export function trainLoss(w: number) {
  const q1 = 0.5 * C_SHARP * (w - W_SHARP) ** 2 + FLOOR
  const q2 = 0.5 * C_FLAT * (w - W_FLAT) ** 2 + FLOOR
  const m = Math.min(q1, q2)
  return m - T * Math.log(Math.exp(-(q1 - m) / T) + Math.exp(-(q2 - m) / T))
}

export function trainSlope(w: number) {
  const q1 = 0.5 * C_SHARP * (w - W_SHARP) ** 2 + FLOOR
  const q2 = 0.5 * C_FLAT * (w - W_FLAT) ** 2 + FLOOR
  const m = Math.min(q1, q2)
  const e1 = Math.exp(-(q1 - m) / T)
  const e2 = Math.exp(-(q2 - m) / T)
  return (e1 * C_SHARP * (w - W_SHARP) + e2 * C_FLAT * (w - W_FLAT)) / (e1 + e2)
}

/** the hilltop between the two valleys: where the two parabolas cross */
export const BARRIER = (() => {
  const s = Math.sqrt(C_SHARP / C_FLAT)
  return (W_FLAT + s * W_SHARP) / (1 + s)
})()

/** half-width of a parabola valley at height `h` above its floor */
export const halfWidth = (c: number, h: number) => Math.sqrt((2 * h) / c)
