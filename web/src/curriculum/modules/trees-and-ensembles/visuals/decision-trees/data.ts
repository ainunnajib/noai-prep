import { mulberry32 } from '../../../../../kit'

/*
  Datasets shared by the visuals of this module.
*/

/**
 * 32 HDB resale flats: [floor area (m²), remaining lease (years)] and whether the flat sold for
 * at least $600k (1) or less (0). Small made-up dataset with two deliberately "odd" flats.
 */
export const FLATS: [number, number, number][] = [
  [64, 52, 0], [66, 74, 0], [70, 58, 0], [72, 83, 0], [75, 47, 0], [78, 66, 0], [81, 76, 0], [84, 55, 0],
  [87, 63, 0], [90, 79, 0], [68, 64, 0], [86, 49, 0], [70, 92, 1], [79, 89, 1], [88, 94, 1], [83, 90, 0],
  [96, 71, 1], [99, 84, 1], [103, 64, 1], [107, 78, 1], [111, 91, 1], [115, 68, 1], [120, 82, 1], [124, 74, 1],
  [109, 61, 1], [100, 93, 1], [118, 87, 1], [97, 50, 0], [106, 54, 0], [114, 47, 0], [122, 57, 0], [104, 72, 0],
]
export const FLAT_X = FLATS.map(([a, l]) => [a, l])
export const FLAT_Y = FLATS.map((r) => r[2])
export const FLAT_FEATURES = ['area', 'lease'] as const
export const FLAT_UNITS = ['m²', 'yrs'] as const

/**
 * Noisy 2-D classification data on [0, 10]²: class 1 inside a circle of radius 3.4 around (5, 5),
 * class 0 outside, then a fraction `flip` of the labels flipped at random (label noise).
 */
export function circleData(n: number, seed: number, flip = 0.1) {
  const rng = mulberry32(seed)
  const X: number[][] = []
  const y: number[] = []
  for (let i = 0; i < n; i++) {
    const a = Math.round(rng() * 1000) / 100
    const b = Math.round(rng() * 1000) / 100
    const inside = (a - 5) ** 2 + (b - 5) ** 2 < 3.4 ** 2 ? 1 : 0
    X.push([a, b])
    y.push(rng() < flip ? 1 - inside : inside)
  }
  return { X, y }
}

/** The true (noise-free) rule behind circleData. */
export const circleTruth = (a: number, b: number) => ((a - 5) ** 2 + (b - 5) ** 2 < 3.4 ** 2 ? 1 : 0)
