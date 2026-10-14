import { mulberry32 } from '../../../../../kit'

/* Shared maths for the vanishing / exploding gradient visuals. Pure functions, no React. */

export type Act = 'sigmoid' | 'tanh' | 'relu'

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

export const ACT: Record<Act, (z: number) => number> = {
  sigmoid,
  tanh: Math.tanh,
  relu: (z) => (z > 0 ? z : 0),
}

/** Derivative of each activation, as a function of its input z. */
export const DACT: Record<Act, (z: number) => number> = {
  sigmoid: (z) => {
    const s = sigmoid(z)
    return s * (1 - s)
  },
  tanh: (z) => {
    const t = Math.tanh(z)
    return 1 - t * t
  },
  relu: (z) => (z > 0 ? 1 : 0),
}

export const ACT_LABEL: Record<Act, string> = { sigmoid: 'sigmoid', tanh: 'tanh', relu: 'ReLU' }

/** Standard normal sample (Box–Muller) from a uniform rng. */
export function gaussian(rng: () => number): number {
  let u = 0
  while (u === 0) u = rng()
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

/** Label for a log10 tick: 0 -> "1", 1 -> "10", -6 -> "10⁻⁶". */
export function pow10Label(e: number): string {
  const r = Math.round(e)
  if (r === 0) return '1'
  if (r === 1) return '10'
  return '10' + String(r).split('').map((c) => SUP[c] ?? c).join('')
}

/** Compact scientific format for readouts: 0.00032 -> "3.2 × 10⁻⁴", 0.84 -> "0.84". */
export function sci(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : 'NaN'
  if (x === 0) return '0'
  const a = Math.abs(x)
  if (a >= 0.01 && a < 1000) return String(Number(x.toPrecision(digits)))
  const e = Math.floor(Math.log10(a))
  const m = x / 10 ** e
  return `${m.toFixed(digits - 1)} × ${pow10Label(e)}`
}

/* ---------------- a deep MLP at initialisation ---------------- */

export const NET_WIDTH = 32
export const NET_BATCH = 32
export const NET_MAX_DEPTH = 30

export interface BaseNet {
  /** standard-normal weight matrices, n×n each, row-major (scaled later by k/√n) */
  W: Float64Array[]
  /** input batch N×n */
  X: Float64Array
  /** upstream gradient at the output, N×n, Frobenius norm 1 */
  G: Float64Array
}

export function makeBaseNet(seed: number, n = NET_WIDTH, N = NET_BATCH, maxDepth = NET_MAX_DEPTH): BaseNet {
  const rng = mulberry32(seed)
  const W: Float64Array[] = []
  for (let l = 0; l < maxDepth; l++) {
    const m = new Float64Array(n * n)
    for (let i = 0; i < m.length; i++) m[i] = gaussian(rng)
    W.push(m)
  }
  const X = new Float64Array(N * n)
  for (let i = 0; i < X.length; i++) X[i] = gaussian(rng)
  const G = new Float64Array(N * n)
  let s = 0
  for (let i = 0; i < G.length; i++) {
    G[i] = gaussian(rng)
    s += G[i] * G[i]
  }
  const norm = Math.sqrt(s)
  for (let i = 0; i < G.length; i++) G[i] /= norm
  return { W, X, G }
}

export interface DeepNetOpts {
  act: Act
  /** weight std = k / √n (k = 1 is Xavier-style, k = √2 is He) */
  k: number
  depth: number
  residual: boolean
  batchNorm: boolean
}

/**
 * Forward pass then backward pass through `depth` layers:
 *   z = h W (optionally batch-normalised per unit), a = act(z), h ← a  (or h ← h + a with a residual connection).
 * Returns grad[l] = ‖∂L/∂h_l‖ for l = 1..depth (index 0 = layer 1), where h_l is the output of layer l and the
 * gradient sent back from the loss into the last layer has norm 1. Also returns the RMS size of each layer's output.
 */
export function deepNetGradients(base: BaseNet, o: DeepNetOpts, n = NET_WIDTH, N = NET_BATCH): { grad: number[]; rms: number[] } {
  const L = Math.min(o.depth, base.W.length)
  const scale = o.k / Math.sqrt(n)
  const f = ACT[o.act]
  const df = DACT[o.act]
  const eps = 1e-5
  let h = Float64Array.from(base.X)
  const hs: Float64Array[] = []
  const zs: Float64Array[] = []
  const sds: Float64Array[] = []
  const rms: number[] = []
  for (let l = 0; l < L; l++) {
    const W = base.W[l]
    const z = new Float64Array(N * n)
    for (let b = 0; b < N; b++) {
      for (let i = 0; i < n; i++) {
        const hv = h[b * n + i]
        if (hv === 0) continue
        const row = i * n
        const zo = b * n
        for (let j = 0; j < n; j++) z[zo + j] += hv * W[row + j]
      }
    }
    for (let i = 0; i < z.length; i++) z[i] *= scale
    const sd = new Float64Array(n)
    if (o.batchNorm) {
      for (let j = 0; j < n; j++) {
        let mu = 0
        for (let b = 0; b < N; b++) mu += z[b * n + j]
        mu /= N
        let v = 0
        for (let b = 0; b < N; b++) v += (z[b * n + j] - mu) ** 2
        v /= N
        const s = Math.sqrt(v + eps)
        sd[j] = s
        for (let b = 0; b < N; b++) z[b * n + j] = (z[b * n + j] - mu) / s
      }
    }
    hs.push(h)
    zs.push(z)
    sds.push(sd)
    const next = new Float64Array(N * n)
    let ss = 0
    for (let i = 0; i < next.length; i++) {
      const a = f(z[i])
      next[i] = o.residual ? h[i] + a : a
      ss += next[i] * next[i]
    }
    rms.push(Math.sqrt(ss / next.length))
    h = next
  }

  const grad = new Array<number>(L).fill(0)
  let dh = Float64Array.from(base.G)
  for (let l = L - 1; l >= 0; l--) {
    let s2 = 0
    for (let i = 0; i < dh.length; i++) s2 += dh[i] * dh[i]
    grad[l] = Math.sqrt(s2)
    const z = zs[l]
    const dz = new Float64Array(N * n)
    for (let i = 0; i < dz.length; i++) dz[i] = dh[i] * df(z[i])
    if (o.batchNorm) {
      const sd = sds[l]
      for (let j = 0; j < n; j++) {
        let m1 = 0
        let m2 = 0
        for (let b = 0; b < N; b++) {
          m1 += dz[b * n + j]
          m2 += dz[b * n + j] * z[b * n + j]
        }
        m1 /= N
        m2 /= N
        for (let b = 0; b < N; b++) dz[b * n + j] = (dz[b * n + j] - m1 - z[b * n + j] * m2) / sd[j]
      }
    }
    const W = base.W[l]
    const prev = new Float64Array(N * n)
    for (let b = 0; b < N; b++) {
      for (let i = 0; i < n; i++) {
        let acc = 0
        const row = i * n
        const zo = b * n
        for (let j = 0; j < n; j++) acc += dz[zo + j] * W[row + j]
        prev[b * n + i] = acc * scale
      }
    }
    if (o.residual) for (let i = 0; i < prev.length; i++) prev[i] += dh[i]
    dh = prev
  }
  return { grad, rms }
}
