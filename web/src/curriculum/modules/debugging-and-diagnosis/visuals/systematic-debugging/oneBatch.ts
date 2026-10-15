import { mulberry32 } from '../../../../../kit'

/*
  A real "overfit one batch" experiment, computed in the browser.
  Model: 2 inputs -> 16 tanh hidden units -> 4 class scores (logits), cross-entropy loss, Adam (lr 0.01).
  Batch: 16 points in four clusters (4 per class), the same batch every step.
  Initial weights follow PyTorch's nn.Linear default, uniform in (-1/sqrt(fan_in), 1/sqrt(fan_in)),
  so the first loss is close to ln 4 = 1.386.
  Each bug is injected the way it happens in real PyTorch code (see runOneBatch).
*/

export const N = 16
export const D = 2
export const H = 16
export const K = 4
export const LN_K = Math.log(K)
/** Lowest possible loss when softmax is applied before CrossEntropyLoss: -ln(e / (e + K - 1)) = ln(1 + (K-1)/e) */
export const SOFTMAX_TWICE_FLOOR = Math.log(1 + (K - 1) / Math.E)
export const GOOD_LR = 0.02
export const STEPS = 300
export const HUGE_INIT = 30

export type BugId = 'none' | 'noZeroGrad' | 'shuffled' | 'softmaxTwice' | 'staleOpt' | 'lrLow' | 'hugeInit'

export interface BatchData {
  x: [number, number][]
  y: number[]
}

function gaussian(r: () => number) {
  const u = Math.max(r(), 1e-12)
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

let cachedData: BatchData | null = null

export function oneBatch(): BatchData {
  if (cachedData) return cachedData
  const r = mulberry32(31)
  const x: [number, number][] = []
  const y: number[] = []
  for (let i = 0; i < N; i++) {
    const c = i % K
    const a = (c * Math.PI) / 2 + Math.PI / 4
    x.push([1.2 * Math.cos(a) + 0.45 * gaussian(r), 1.2 * Math.sin(a) + 0.45 * gaussian(r)])
    y.push(c)
  }
  cachedData = { x, y }
  return cachedData
}

// flat parameter vector: W1 (H x D), b1 (H), W2 (K x H), b2 (K)
const OFF_W1 = 0
const OFF_B1 = OFF_W1 + H * D
const OFF_W2 = OFF_B1 + H
const OFF_B2 = OFF_W2 + K * H
const P = OFF_B2 + K

function initParams(seed: number, outScale: number): Float64Array {
  const r = mulberry32(seed)
  const p = new Float64Array(P)
  const a1 = 1 / Math.sqrt(D)
  const a2 = 1 / Math.sqrt(H)
  for (let i = OFF_W1; i < OFF_W2; i++) p[i] = (r() * 2 - 1) * a1
  for (let i = OFF_W2; i < P; i++) p[i] = (r() * 2 - 1) * a2 * outScale
  return p
}

function softmax(z: number[]): number[] {
  const m = Math.max(...z)
  const e = z.map((v) => Math.exp(v - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / s)
}

/**
 * Forward + backward on the whole batch: mean cross-entropy loss, its gradient and the accuracy.
 * With softmaxTwice the model's output goes through softmax and CrossEntropyLoss then applies
 * log-softmax again, which is what happens with nn.Softmax as the last layer + nn.CrossEntropyLoss.
 */
function lossAndGrad(p: Float64Array, x: [number, number][], y: number[], softmaxTwice: boolean) {
  const g = new Float64Array(P)
  let loss = 0
  let correct = 0
  const n = x.length
  const h = new Array(H).fill(0)
  for (let s = 0; s < n; s++) {
    for (let j = 0; j < H; j++) h[j] = Math.tanh(p[OFF_W1 + j * D] * x[s][0] + p[OFF_W1 + j * D + 1] * x[s][1] + p[OFF_B1 + j])
    const z: number[] = []
    for (let k = 0; k < K; k++) {
      let v = p[OFF_B2 + k]
      for (let j = 0; j < H; j++) v += p[OFF_W2 + k * H + j] * h[j]
      z.push(v)
    }
    const sIn = softmaxTwice ? softmax(z) : z // what CrossEntropyLoss receives
    const q = softmax(sIn)
    loss += -Math.log(Math.max(q[y[s]], 1e-300))
    let best = 0
    for (let k = 1; k < K; k++) if (z[k] > z[best]) best = k
    if (best === y[s]) correct++
    const ds = q.map((v, k) => (v - (k === y[s] ? 1 : 0)) / n)
    let dz = ds
    if (softmaxTwice) {
      const dot = ds.reduce((a, v, j) => a + v * sIn[j], 0)
      dz = sIn.map((sv, k) => sv * (ds[k] - dot))
    }
    const dh = new Array(H).fill(0)
    for (let k = 0; k < K; k++) {
      g[OFF_B2 + k] += dz[k]
      for (let j = 0; j < H; j++) {
        g[OFF_W2 + k * H + j] += dz[k] * h[j]
        dh[j] += dz[k] * p[OFF_W2 + k * H + j]
      }
    }
    for (let j = 0; j < H; j++) {
      const da = dh[j] * (1 - h[j] * h[j])
      g[OFF_B1 + j] += da
      g[OFF_W1 + j * D] += da * x[s][0]
      g[OFF_W1 + j * D + 1] += da * x[s][1]
    }
  }
  return { loss: loss / n, g, acc: correct / n }
}

export interface OneBatchRun {
  /** logged loss before step 1, after step 1, ... (length steps + 1) */
  loss: number[]
  /** accuracy on the batch's true labels at the end */
  acc: number
}

export function runOneBatch(bug: BugId, steps = STEPS): OneBatchRun {
  const { x, y } = oneBatch()
  const p = initParams(7, bug === 'hugeInit' ? HUGE_INIT : 1)
  const lr = bug === 'lrLow' ? GOOD_LR / 100 : GOOD_LR
  const r = mulberry32(99)
  const grad = new Float64Array(P) // the .grad buffers: only ever cleared by zero_grad()
  const m = new Float64Array(P)
  const v = new Float64Array(P)
  const b1 = 0.9
  const b2 = 0.999
  const loss: number[] = []
  for (let t = 0; t <= steps; t++) {
    let yy = y
    if (bug === 'shuffled') {
      // labels shuffled separately from the inputs every time the batch is loaded
      yy = y.slice()
      for (let i = yy.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1))
        const tmp = yy[i]
        yy[i] = yy[j]
        yy[j] = tmp
      }
    }
    const res = lossAndGrad(p, x, yy, bug === 'softmaxTwice')
    loss.push(res.loss)
    if (t === steps) break
    if (bug === 'staleOpt') continue // the optimiser holds an old model's parameters: this model is never updated
    if (bug !== 'noZeroGrad') grad.fill(0) // optimizer.zero_grad()
    for (let i = 0; i < P; i++) grad[i] += res.g[i] // loss.backward() ADDS into .grad
    // optimizer.step() (Adam)
    const c1 = 1 - Math.pow(b1, t + 1)
    const c2 = 1 - Math.pow(b2, t + 1)
    for (let i = 0; i < P; i++) {
      m[i] = b1 * m[i] + (1 - b1) * grad[i]
      v[i] = b2 * v[i] + (1 - b2) * grad[i] * grad[i]
      p[i] -= (lr * (m[i] / c1)) / (Math.sqrt(v[i] / c2) + 1e-8)
    }
  }
  const acc = lossAndGrad(p, x, y, bug === 'softmaxTwice').acc
  return { loss, acc }
}
