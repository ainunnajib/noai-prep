import { mulberry32 } from '../../../../../kit'

/*
  A miniature SimCLR that really trains, small enough to run instantly in the browser.

  Each of K = 6 images has 2 "content" numbers (what the object is). Every augmented view adds
  2 "augmentation" numbers (how bright it was made, how far it was zoomed), drawn at random for
  every view at every training step, as in real SimCLR.
      x = [content_1, content_2, brightness, zoom]          (4 numbers)
  The encoder is one linear map W (2 × 4) followed by L2 normalisation, so every embedding
      z = W x / ‖W x‖
  lies on the unit circle. The loss is SimCLR's NT-Xent over the 2K views, and W is trained by
  gradient descent (central-difference gradients: W has only 8 numbers).
*/

export const K = 6
export const STEPS = 120
const LR = 0.06
export const W0 = [
  [0.4, 0.1, 0.9, -0.5],
  [-0.2, 0.4, 0.4, 0.8],
]

/** content vectors: spread round the circle with a little jitter so the start is not too tidy */
export const CONTENT: [number, number][] = (() => {
  const r = mulberry32(3)
  return Array.from({ length: K }, (_, i) => {
    const a = (i / K) * 2 * Math.PI + (r() - 0.5) * 0.5
    const s = 0.85 + 0.3 * r()
    return [Math.cos(a) * s, Math.sin(a) * s] as [number, number]
  })
})()

function gauss(r: () => number) {
  const u = Math.max(1e-12, r())
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Augmentation numbers for every view at a given training step: aug[view] = [brightness, zoom], view = 2·image + (0 | 1). */
export function augmentations(step: number): [number, number][] {
  const r = mulberry32(1000 + step * 7919)
  return Array.from({ length: 2 * K }, () => [Math.max(-2, Math.min(2, gauss(r))), Math.max(-2, Math.min(2, gauss(r)))] as [number, number])
}

export const viewInput = (v: number, aug: [number, number][]) => [CONTENT[v >> 1][0], CONTENT[v >> 1][1], aug[v][0], aug[v][1]]

export function embed(W: number[][], x: number[]): [number, number] {
  const u0 = W[0][0] * x[0] + W[0][1] * x[1] + W[0][2] * x[2] + W[0][3] * x[3]
  const u1 = W[1][0] * x[0] + W[1][1] * x[1] + W[1][2] * x[2] + W[1][3] * x[3]
  const n = Math.hypot(u0, u1) || 1e-9
  return [u0 / n, u1 / n]
}

/** Probabilities that view v assigns to each other view being its partner (softmax of cosine / τ over the 2K − 1 others). */
export function partnerProbs(Z: [number, number][], v: number, tau: number): number[] {
  const s = Z.map((z, k) => (k === v ? -Infinity : (z[0] * Z[v][0] + z[1] * Z[v][1]) / tau))
  const m = Math.max(...s)
  const e = s.map((x) => (Number.isFinite(x) ? Math.exp(x - m) : 0))
  const t = e.reduce((a, b) => a + b, 0)
  return e.map((x) => x / t)
}

/** NT-Xent loss averaged over all 2K views (each view's positive is its partner, v XOR 1). */
export function ntxent(Z: [number, number][], tau: number): number {
  let L = 0
  for (let v = 0; v < Z.length; v++) L += -Math.log(Math.max(1e-300, partnerProbs(Z, v, tau)[v ^ 1]))
  return L / Z.length
}

const lossOf = (W: number[][], aug: [number, number][], tau: number) =>
  ntxent(
    Array.from({ length: 2 * K }, (_, v) => embed(W, viewInput(v, aug))),
    tau,
  )

export interface Frame {
  W: number[][]
  Z: [number, number][]
  aug: [number, number][]
  loss: number
  /** share of the encoder's weight on the augmentation inputs (0..1) */
  augShare: number
}

/** Train for STEPS steps at temperature tau; frame t shows the encoder after t updates, applied to the views drawn at step t. */
export function trajectory(tau: number): Frame[] {
  let W = W0.map((r) => r.slice())
  const frames: Frame[] = []
  const h = 1e-5
  for (let t = 0; t <= STEPS; t++) {
    const aug = augmentations(t)
    const Z = Array.from({ length: 2 * K }, (_, v) => embed(W, viewInput(v, aug)))
    const nc = Math.hypot(W[0][0], W[0][1], W[1][0], W[1][1])
    const na = Math.hypot(W[0][2], W[0][3], W[1][2], W[1][3])
    frames.push({ W, Z, aug, loss: ntxent(Z, tau), augShare: na / (nc + na) })
    if (t === STEPS) break
    const G = W.map((row, i) =>
      row.map((_, j) => {
        const Wp = W.map((r) => r.slice())
        const Wm = W.map((r) => r.slice())
        Wp[i][j] += h
        Wm[i][j] -= h
        return (lossOf(Wp, aug, tau) - lossOf(Wm, aug, tau)) / (2 * h)
      }),
    )
    W = W.map((row, i) => row.map((w, j) => w - LR * G[i][j]))
  }
  return frames
}
