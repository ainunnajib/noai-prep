/*
  A tiny, genuinely computed CNN forward pass for the pipeline visual: a procedurally drawn
  32×32 colour photo of a car, hand-made first-layer filters (edges at two orientations, "red",
  "dark") and hand-made second-layer filters that combine them. Only the four displayed channels
  of each layer are computed; the rest of the layer's channels exist only in the shape counts.
*/

export type Map2 = number[][]
export type Tensor = Map2[] // [C][H][W]

export const outSize = (n: number, k: number, p: number, s: number) => {
  const v = Math.floor((n + 2 * p - k) / s) + 1
  return v >= 1 ? v : 0
}

/** The input photo: a red car on a road under a blue sky, values in 0..1, shape [3][32][32]. */
export function carImage(): Tensor {
  const N = 32
  const img: Tensor = [0, 1, 2].map(() => Array.from({ length: N }, () => Array(N).fill(0) as number[]))
  const set = (y: number, x: number, r: number, g: number, b: number) => {
    img[0][y][x] = r
    img[1][y][x] = g
    img[2][y][x] = b
  }
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const t = y / N
      set(y, x, 0.5 + 0.35 * t, 0.72 + 0.22 * t, 0.96) // sky
      if (y >= 24) set(y, x, 0.42, 0.43, 0.46) // road
      if (y === 28 && x % 8 < 4) set(y, x, 0.95, 0.95, 0.9) // lane markings
      if (y >= 15 && y <= 22 && x >= 3 && x <= 28) set(y, x, 0.86, 0.13, 0.12) // body
      const inset = (14 - y) * 0.7
      if (y >= 9 && y <= 14 && x >= 8 + inset && x <= 23 - inset) set(y, x, 0.86, 0.13, 0.12) // cabin
      if (y >= 10 && y <= 14 && ((x >= 11 && x <= 14) || (x >= 17 && x <= 20)) && x >= 9 + inset && x <= 22 - inset) set(y, x, 0.62, 0.82, 0.96) // windows
      if (y >= 16 && y <= 17 && x >= 27 && x <= 28) set(y, x, 1, 0.9, 0.3) // headlight
      for (const cx of [9, 22]) {
        const d = Math.hypot(y - 22.5, x - cx)
        if (d <= 3.4) set(y, x, 0.1, 0.1, 0.12) // tyre
        if (d <= 1.3) set(y, x, 0.62, 0.62, 0.66) // hub
      }
    }
  return img
}

const LUM = [0.3, 0.59, 0.11]

function gauss(k: number): number[][] {
  const c = (k - 1) / 2
  const sg = Math.max(0.5, k / 4)
  const g = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => Math.exp(-((i - c) ** 2 + (j - c) ** 2) / (2 * sg * sg))))
  const s = g.flat().reduce((a, b) => a + b, 0)
  return g.map((r) => r.map((v) => v / s))
}

/** Derivative-of-Gaussian edge filter; dir 'x' responds to vertical edges, 'y' to horizontal ones. */
function edge(k: number, dir: 'x' | 'y'): number[][] {
  const c = (k - 1) / 2
  const g = gauss(k)
  return g.map((r, i) => r.map((v, j) => (dir === 'x' ? j - c : i - c) * v))
}

/** conv2d with zero padding: weights[cin][k][k] for ONE output channel. */
function conv1(x: Tensor, w: number[][][], bias: number, k: number, p: number, s: number): Map2 {
  const H = x[0].length
  const W = x[0][0].length
  const oh = outSize(H, k, p, s)
  const ow = outSize(W, k, p, s)
  const out: Map2 = Array.from({ length: oh }, () => Array(ow).fill(0) as number[])
  for (let i = 0; i < oh; i++)
    for (let j = 0; j < ow; j++) {
      let acc = bias
      for (let c = 0; c < x.length; c++)
        for (let a = 0; a < k; a++) {
          const yy = i * s + a - p
          if (yy < 0 || yy >= H) continue
          for (let b = 0; b < k; b++) {
            const xx = j * s + b - p
            if (xx < 0 || xx >= W) continue
            acc += x[c][yy][xx] * w[c][a][b]
          }
        }
      out[i][j] = Math.max(0, acc) // ReLU
    }
  return out
}

export function maxPool(m: Map2): Map2 {
  const oh = outSize(m.length, 2, 0, 2)
  const ow = outSize(m[0]?.length ?? 0, 2, 0, 2)
  return Array.from({ length: oh }, (_, i) => Array.from({ length: ow }, (_, j) => Math.max(m[2 * i][2 * j], m[2 * i][2 * j + 1], m[2 * i + 1][2 * j], m[2 * i + 1][2 * j + 1])))
}

const scaleTo1 = (m: Map2) => {
  const mx = Math.max(1e-9, ...m.flat())
  return m.map((r) => r.map((v) => v / mx))
}

export const L1_NAMES = ['vertical edges', 'horizontal edges', 'red', 'dark']
export const L2_NAMES = ['corners', 'wheel-like', 'red body', 'outlines']

/** First conv layer, four displayed channels (input is centred: pixel − 0.5). */
export function layer1(img: Tensor, k: number, p: number, s: number): Tensor {
  const x = img.map((ch) => ch.map((r) => r.map((v) => v - 0.5)))
  const ex = edge(k, 'x')
  const ey = edge(k, 'y')
  const g = gauss(k)
  const filters: [number[][][], number][] = [
    [LUM.map((l) => ex.map((r) => r.map((v) => l * v * 4))), 0],
    [LUM.map((l) => ey.map((r) => r.map((v) => l * v * 4))), 0],
    [[1, -0.6, -0.6].map((l) => g.map((r) => r.map((v) => l * v))), -0.05],
    [LUM.map((l) => g.map((r) => r.map((v) => -l * v))), 0.12],
  ]
  return filters.map(([w, b]) => conv1(x, w, b, k, p, s))
}

/** Second conv layer: combines the four (normalised) pooled maps of layer 1. */
export function layer2(prev: Tensor, k: number, p: number, s: number): Tensor {
  const x = prev.map(scaleTo1)
  const box = Array.from({ length: k }, () => Array(k).fill(1 / (k * k)) as number[])
  const mix = (coef: number[]) => coef.map((c) => box.map((r) => r.map((v) => v * c)))
  const filters: [number[][][], number][] = [
    [mix([1, 1, 0, 0]), -0.35], // corners: vertical AND horizontal edges nearby
    [mix([0.3, 0.3, -0.3, 1]), -0.3], // wheel-like: dark with edges, not red
    [mix([0, 0, 1, -0.4]), -0.1], // red body
    [mix([0.6, 0.6, 0.2, 0.2]), -0.15], // outlines
  ]
  return filters.map(([w, b]) => conv1(x, w, b, k, p, s))
}
