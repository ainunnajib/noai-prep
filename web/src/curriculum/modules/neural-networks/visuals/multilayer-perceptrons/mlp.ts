/*
  A tiny multi-layer perceptron, written out by hand so the playground can train it live in the
  browser. Two inputs (x₁, x₂), any number of hidden layers, one output logit z. The predicted
  probability of the orange class is p = σ(z) and the loss is binary cross-entropy.

  Training: mini-batches of 10 points; gradients by backpropagation (the next module explains
  how); parameter updates with Adam (a gradient-descent variant met in "Training deep networks").
  The same maths was prototyped in NumPy first to choose the datasets and defaults.
*/
import { mulberry32 } from '../../../../../kit'

export type Act = 'relu' | 'tanh' | 'sigmoid' | 'linear'
export type DatasetName = 'circle' | 'xor' | 'moons' | 'spiral'

export interface Pt {
  x: number
  y: number
  label: 0 | 1
}

/** The data live in the square [−6, 6]²; the network sees them scaled by INPUT_SCALE. */
export const DOMAIN = 6
export const INPUT_SCALE = 0.25

function gauss(rng: () => number) {
  const u = Math.max(1e-12, rng())
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Deterministic toy datasets (labels alternate so both classes are equally common). */
export function makeData(name: DatasetName, n: number, seed: number, noise = 0.3): Pt[] {
  const rng = mulberry32(seed)
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const label = (i % 2) as 0 | 1
    let x = 0
    let y = 0
    if (name === 'circle') {
      const r = label === 1 ? 2.0 * rng() : 3.2 + 1.8 * rng()
      const a = 2 * Math.PI * rng()
      x = r * Math.cos(a)
      y = r * Math.sin(a)
    } else if (name === 'xor') {
      // a point in one of the four quadrants, kept a little away from the axes
      x = -5 + 10 * rng()
      y = -5 + 10 * rng()
      x += 0.4 * Math.sign(x)
      y += 0.4 * Math.sign(y)
      const want = label === 1 ? 1 : -1
      if (Math.sign(x * y) !== want) y = -y
    } else if (name === 'moons') {
      const t = Math.PI * rng()
      const mx = label === 0 ? Math.cos(t) : 1 - Math.cos(t)
      const my = label === 0 ? Math.sin(t) : 0.5 - Math.sin(t)
      x = (mx - 0.5) * 4
      y = (my - 0.25) * 4
    } else {
      // two interleaved spiral arms, 1.25 turns each
      const k = Math.floor(i / 2)
      const m = Math.floor(n / 2)
      const r = 0.5 + (4.5 * k) / m
      const t = (1.25 * 2 * Math.PI * k) / m + (label === 1 ? Math.PI : 0)
      x = r * Math.sin(t)
      y = r * Math.cos(t)
    }
    pts.push({ x: x + noise * gauss(rng), y: y + noise * gauss(rng), label })
  }
  return pts
}

export interface Net {
  sizes: number[]
  /** W[l][j * sizes[l] + i] is the weight from neuron i of layer l to neuron j of layer l + 1 */
  W: Float64Array[]
  b: Float64Array[]
  mW: Float64Array[]
  vW: Float64Array[]
  mb: Float64Array[]
  vb: Float64Array[]
  t: number
}

export function actFn(act: Act, z: number) {
  switch (act) {
    case 'relu':
      return z > 0 ? z : 0
    case 'tanh':
      return Math.tanh(z)
    case 'sigmoid':
      return 1 / (1 + Math.exp(-z))
    default:
      return z
  }
}

/** Derivative of the activation, written in terms of z (pre-activation) and a = f(z). */
function actGrad(act: Act, z: number, a: number) {
  switch (act) {
    case 'relu':
      return z > 0 ? 1 : 0
    case 'tanh':
      return 1 - a * a
    case 'sigmoid':
      return a * (1 - a)
    default:
      return 1
  }
}

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

/** Random initial weights (He/Xavier-style scale) and small biases. */
export function createNet(sizes: number[], act: Act, seed: number): Net {
  const rng = mulberry32(seed)
  const W: Float64Array[] = []
  const b: Float64Array[] = []
  for (let l = 0; l < sizes.length - 1; l++) {
    const nIn = sizes[l]
    const nOut = sizes[l + 1]
    const scale = Math.sqrt((act === 'relu' ? 2 : 1) / nIn)
    const w = new Float64Array(nIn * nOut)
    for (let k = 0; k < w.length; k++) w[k] = gauss(rng) * scale
    W.push(w)
    const bb = new Float64Array(nOut)
    if (act === 'relu' && l < sizes.length - 2) bb.fill(0.1)
    b.push(bb)
  }
  const zeros = (arr: Float64Array[]) => arr.map((a) => new Float64Array(a.length))
  return { sizes: sizes.slice(), W, b, mW: zeros(W), vW: zeros(W), mb: zeros(b), vb: zeros(b), t: 0 }
}

/** Work buffers for one forward pass: z and a for every layer. */
export function makeBuffers(sizes: number[]) {
  return {
    z: sizes.map((n) => new Float64Array(n)),
    a: sizes.map((n) => new Float64Array(n)),
  }
}
export type Buffers = ReturnType<typeof makeBuffers>

/** Forward pass for one point (in data coordinates). Fills buf and returns the output logit. */
export function forward(net: Net, act: Act, x: number, y: number, buf: Buffers): number {
  const { sizes, W, b } = net
  buf.a[0][0] = x * INPUT_SCALE
  buf.a[0][1] = y * INPUT_SCALE
  const L = sizes.length - 1
  for (let l = 0; l < L; l++) {
    const nIn = sizes[l]
    const nOut = sizes[l + 1]
    const w = W[l]
    const aIn = buf.a[l]
    const zOut = buf.z[l + 1]
    const aOut = buf.a[l + 1]
    const last = l === L - 1
    for (let j = 0; j < nOut; j++) {
      let s = b[l][j]
      const row = j * nIn
      for (let i = 0; i < nIn; i++) s += w[row + i] * aIn[i]
      zOut[j] = s
      aOut[j] = last ? s : actFn(act, s)
    }
  }
  return buf.a[L][0]
}

/** Numerically stable binary cross-entropy computed from the logit. */
export function bceFromLogit(z: number, y: number) {
  return Math.max(z, 0) - z * y + Math.log1p(Math.exp(-Math.abs(z)))
}

export function evaluate(net: Net, act: Act, data: Pt[], buf: Buffers) {
  let loss = 0
  let correct = 0
  for (const p of data) {
    const z = forward(net, act, p.x, p.y, buf)
    loss += bceFromLogit(z, p.label)
    if ((z >= 0 ? 1 : 0) === p.label) correct++
  }
  return { loss: loss / data.length, acc: correct / data.length }
}

/** One epoch of mini-batch training with Adam. */
export function trainEpoch(net: Net, act: Act, data: Pt[], lr: number, rng: () => number, batch = 10) {
  const { sizes, W, b } = net
  const L = sizes.length - 1
  const buf = makeBuffers(sizes)
  const delta = sizes.map((n) => new Float64Array(n))
  const gW = W.map((w) => new Float64Array(w.length))
  const gb = b.map((v) => new Float64Array(v.length))
  const order = data.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const b1 = 0.9
  const b2 = 0.999
  for (let s = 0; s < order.length; s += batch) {
    const end = Math.min(order.length, s + batch)
    const m = end - s
    for (const g of gW) g.fill(0)
    for (const g of gb) g.fill(0)
    for (let k = s; k < end; k++) {
      const p = data[order[k]]
      const z = forward(net, act, p.x, p.y, buf)
      // dLoss/dz for sigmoid + binary cross-entropy is simply p − y
      delta[L][0] = (sigmoid(z) - p.label) / m
      for (let l = L - 1; l >= 0; l--) {
        const nIn = sizes[l]
        const nOut = sizes[l + 1]
        const w = W[l]
        const aIn = buf.a[l]
        const dOut = delta[l + 1]
        for (let j = 0; j < nOut; j++) {
          const d = dOut[j]
          gb[l][j] += d
          const row = j * nIn
          for (let i = 0; i < nIn; i++) gW[l][row + i] += d * aIn[i]
        }
        if (l > 0) {
          const dIn = delta[l]
          for (let i = 0; i < nIn; i++) {
            let s2 = 0
            for (let j = 0; j < nOut; j++) s2 += w[j * nIn + i] * dOut[j]
            dIn[i] = s2 * actGrad(act, buf.z[l][i], buf.a[l][i])
          }
        }
      }
    }
    net.t++
    const c1 = 1 - Math.pow(b1, net.t)
    const c2 = 1 - Math.pow(b2, net.t)
    const upd = (P: Float64Array, G: Float64Array, M: Float64Array, V: Float64Array) => {
      for (let k = 0; k < P.length; k++) {
        const g = G[k]
        M[k] = b1 * M[k] + (1 - b1) * g
        V[k] = b2 * V[k] + (1 - b2) * g * g
        P[k] -= (lr * (M[k] / c1)) / (Math.sqrt(V[k] / c2) + 1e-8)
      }
    }
    for (let l = 0; l < L; l++) {
      upd(W[l], gW[l], net.mW[l], net.vW[l])
      upd(b[l], gb[l], net.mb[l], net.vb[l])
    }
  }
}

/**
 * Evaluate every neuron over a res × res grid covering [−DOMAIN, DOMAIN]².
 * a[l][j] holds the output of neuron j of layer l at every grid point (row 0 = top of the plot) and
 * z[l][j] its pre-activation (for the inputs, z = a; for the output neuron, a = z = the logit).
 */
export function evalGrid(net: Net, act: Act, res: number) {
  const { sizes } = net
  const buf = makeBuffers(sizes)
  const A = sizes.map((n) => Array.from({ length: n }, () => new Float32Array(res * res)))
  const Z = sizes.map((n) => Array.from({ length: n }, () => new Float32Array(res * res)))
  for (let r = 0; r < res; r++) {
    const y = DOMAIN - ((r + 0.5) / res) * 2 * DOMAIN
    for (let c = 0; c < res; c++) {
      const x = -DOMAIN + ((c + 0.5) / res) * 2 * DOMAIN
      forward(net, act, x, y, buf)
      const k = r * res + c
      for (let l = 0; l < sizes.length; l++) {
        const a = buf.a[l]
        const z = l === 0 ? buf.a[0] : buf.z[l]
        for (let j = 0; j < sizes[l]; j++) {
          A[l][j][k] = a[j]
          Z[l][j][k] = z[j]
        }
      }
    }
  }
  return { a: A, z: Z }
}
export type GridMaps = ReturnType<typeof evalGrid>

/**
 * Marching squares: line segments where the grid values cross zero, in data coordinates.
 * Returns an SVG path string with y flipped (so it can be drawn in a viewBox of −D −D 2D 2D).
 */
export function zeroContourPath(v: Float32Array, res: number): string {
  const step = (2 * DOMAIN) / res
  const X = (c: number) => -DOMAIN + (c + 0.5) * step
  const Yflip = (r: number) => -(DOMAIN - (r + 0.5) * step)
  let d = ''
  const lerp = (a: number, b: number) => (Math.abs(a - b) < 1e-12 ? 0.5 : a / (a - b))
  for (let r = 0; r < res - 1; r++) {
    for (let c = 0; c < res - 1; c++) {
      const tl = v[r * res + c]
      const tr = v[r * res + c + 1]
      const bl = v[(r + 1) * res + c]
      const br = v[(r + 1) * res + c + 1]
      const pts: [number, number][] = []
      // top edge (tl → tr), right edge (tr → br), bottom edge (bl → br), left edge (tl → bl)
      if (tl > 0 !== tr > 0) pts.push([X(c) + lerp(tl, tr) * step, Yflip(r)])
      if (tr > 0 !== br > 0) pts.push([X(c + 1), Yflip(r) + lerp(tr, br) * step])
      if (bl > 0 !== br > 0) pts.push([X(c) + lerp(bl, br) * step, Yflip(r + 1)])
      if (tl > 0 !== bl > 0) pts.push([X(c), Yflip(r) + lerp(tl, bl) * step])
      if (pts.length >= 2) d += `M${pts[0][0].toFixed(3)},${pts[0][1].toFixed(3)}L${pts[1][0].toFixed(3)},${pts[1][1].toFixed(3)}`
      if (pts.length === 4) d += `M${pts[2][0].toFixed(3)},${pts[2][1].toFixed(3)}L${pts[3][0].toFixed(3)},${pts[3][1].toFixed(3)}`
    }
  }
  return d
}

export function paramCount(sizes: number[]) {
  let n = 0
  for (let l = 0; l < sizes.length - 1; l++) n += sizes[l] * sizes[l + 1] + sizes[l + 1]
  return n
}
