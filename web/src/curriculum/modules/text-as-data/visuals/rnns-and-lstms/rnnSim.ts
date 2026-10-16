import { mulberry32, hashString } from '../../../../../kit'

/*
  A tiny RNN and a tiny LSTM with fixed random weights (no training), used to show how a
  hidden state is updated word by word and how long the first word keeps influencing it.
  Influence of word 1 on the state at step t = Frobenius norm of the Jacobian ∂h_t/∂x_1,
  estimated with central differences (the same quantity that backpropagation multiplies
  through time).
*/

export const D = 4 // word-vector size
export const H = 8 // hidden-state size

type Vec = number[]
type Mat = number[][]

function gaussian(rand: () => number) {
  const u = Math.max(1e-12, rand())
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
function randMat(rows: number, cols: number, scale: number, seed: number): Mat {
  const r = mulberry32(seed)
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => gaussian(r) * scale))
}
const matVec = (m: Mat, v: Vec) => m.map((row) => row.reduce((s, w, j) => s + w * v[j], 0))
const add = (...vs: Vec[]) => vs[0].map((_, i) => vs.reduce((s, v) => s + v[i], 0))
const sigma = (z: number) => 1 / (1 + Math.exp(-z))

/** a fixed pseudo-random vector for each word (a stand-in for a learned embedding) */
export function wordVec(word: string): Vec {
  const r = mulberry32(hashString(word.toLowerCase()) ^ 0x5eed)
  return Array.from({ length: D }, () => gaussian(r))
}

// ---- plain RNN: h_t = tanh(Wx x_t + Wh h_{t-1} + b) ----
const RNN_WX = randMat(H, D, 1.0 / Math.sqrt(D), 11)
const RNN_WH = randMat(H, H, 0.9 / Math.sqrt(H), 12)
const RNN_B = new Array(H).fill(0)

export function rnnForward(xs: Vec[]): Vec[] {
  let h: Vec = new Array(H).fill(0)
  return xs.map((x) => (h = add(matVec(RNN_WX, x), matVec(RNN_WH, h), RNN_B).map(Math.tanh)))
}

// ---- LSTM: gates computed from [h_{t-1}, x_t]; forget-gate bias set high so it tends to remember ----
const S = 0.5 / Math.sqrt(H + D)
const LSTM_W = { f: randMat(H, H + D, S, 21), i: randMat(H, H + D, S, 22), g: randMat(H, H + D, 1 / Math.sqrt(H + D), 23), o: randMat(H, H + D, S, 24) }
export const LSTM_BIAS = { f: 3, i: -1, g: 0, o: 0 }

export function lstmForward(xs: Vec[]): { h: Vec[]; c: Vec[] } {
  let h: Vec = new Array(H).fill(0)
  let c: Vec = new Array(H).fill(0)
  const hs: Vec[] = []
  const cs: Vec[] = []
  for (const x of xs) {
    const hx = [...h, ...x]
    const f = matVec(LSTM_W.f, hx).map((z) => sigma(z + LSTM_BIAS.f))
    const i = matVec(LSTM_W.i, hx).map((z) => sigma(z + LSTM_BIAS.i))
    const g = matVec(LSTM_W.g, hx).map((z) => Math.tanh(z + LSTM_BIAS.g))
    const o = matVec(LSTM_W.o, hx).map((z) => sigma(z + LSTM_BIAS.o))
    c = c.map((cj, j) => f[j] * cj + i[j] * g[j])
    h = c.map((cj, j) => o[j] * Math.tanh(cj))
    hs.push(h)
    cs.push(c)
  }
  return { h: hs, c: cs }
}

export type Model = 'rnn' | 'lstm'
export const forward = (model: Model, xs: Vec[]) => (model === 'rnn' ? rnnForward(xs) : lstmForward(xs).h)

/** ‖∂h_t/∂x_k‖ for every t (central differences); zero before step k */
export function influenceOf(model: Model, xs: Vec[], k: number): number[] {
  const eps = 1e-4
  const T = xs.length
  const sq = new Array(T).fill(0)
  for (let d = 0; d < D; d++) {
    const nudge = (sign: number) => xs.map((x, t) => (t === k ? x.map((v, j) => (j === d ? v + sign * eps : v)) : x))
    const hp = forward(model, nudge(1))
    const hm = forward(model, nudge(-1))
    for (let t = k; t < T; t++) for (let j = 0; j < H; j++) sq[t] += ((hp[t][j] - hm[t][j]) / (2 * eps)) ** 2
  }
  return sq.map(Math.sqrt)
}
