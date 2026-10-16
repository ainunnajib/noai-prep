import { mulberry32 } from '../../../../../kit'

/*
  A tiny network for the train/eval visual, computed exactly as PyTorch does:
    Linear(3, 4) -> BatchNorm1d(4) -> ReLU -> Dropout(p=0.5) -> Linear(4, 1)
  Train mode: BatchNorm normalises with the batch's mean and (biased) variance and updates its
  running averages (momentum 0.1, unbiased variance); Dropout zeroes each unit with probability p
  and multiplies the survivors by 1/(1-p).
  Eval mode: BatchNorm uses the running averages; Dropout does nothing.
  Checked against torch.nn.BatchNorm1d and explicit dropout masks (scratch script tev_verify.py).
*/

export const W1 = [
  [0.6, -0.4, 1.5],
  [0.9, 0.6, 0.6],
  [1.0, -0.1, 0.4],
  [0.6, -0.8, -1.2],
]
export const B1 = [0.1, -0.2, 0.1, -0.4]
export const W2 = [0.4, 0.6, 0.3, 0.6]
export const B2 = 0.1
export const P_DROP = 0.5
export const EPS = 1e-5
export const MOMENTUM = 0.1

/** example A, whose output we follow */
export const XA = [1.0, -0.5, 0.8]
/** three possible sets of "other examples" sharing A's batch */
export const COMPANIONS = [
  [
    [-0.1, -0.4, -0.5],
    [-2.1, 0.0, 0.1],
    [0.4, -0.2, -0.1],
  ],
  [
    [-0.3, -1.9, -0.8],
    [0.3, -1.2, 0.8],
    [1.8, 1.9, -0.1],
  ],
  [
    [-0.4, 1.3, -0.6],
    [-0.6, 1.4, -1.2],
    [-0.9, 0.8, -0.3],
  ],
]
export const RM0 = [-0.29, -0.32, -0.08, -0.32]
export const RV0 = [1.99, 1.61, 1.25, 0.93]

export interface BNState {
  rm: number[]
  rv: number[]
}

export interface RunResult {
  /** A's hidden units after BatchNorm + ReLU (before dropout) */
  hidden: number[]
  /** dropout keep-mask for A's units (all true in eval mode) */
  keep: boolean[]
  /** A's hidden units after dropout */
  dropped: number[]
  out: number
  next: BNState
}

const lin1 = (x: number[]) => W1.map((w, j) => w[0] * x[0] + w[1] * x[1] + w[2] * x[2] + B1[j])

export function dropoutMask(seed: number): boolean[] {
  const r = mulberry32(seed * 7919 + 13)
  return [0, 1, 2, 3].map(() => r() >= P_DROP)
}

export function run(train: boolean, companions: number[][], st: BNState, seed: number): RunResult {
  const X = [XA, ...companions]
  const H = X.map(lin1)
  const n = X.length
  let mu: number[]
  let varB: number[]
  let next = st
  if (train) {
    mu = [0, 1, 2, 3].map((j) => H.reduce((s, h) => s + h[j], 0) / n)
    varB = [0, 1, 2, 3].map((j) => H.reduce((s, h) => s + (h[j] - mu[j]) ** 2, 0) / n)
    const varU = varB.map((v) => (v * n) / (n - 1))
    next = {
      rm: st.rm.map((r, j) => (1 - MOMENTUM) * r + MOMENTUM * mu[j]),
      rv: st.rv.map((r, j) => (1 - MOMENTUM) * r + MOMENTUM * varU[j]),
    }
  } else {
    mu = st.rm
    varB = st.rv
  }
  const hidden = H[0].map((h, j) => Math.max(0, (h - mu[j]) / Math.sqrt(varB[j] + EPS)))
  const keep = train ? dropoutMask(seed) : [true, true, true, true]
  const dropped = hidden.map((h, j) => (keep[j] ? (train ? h / (1 - P_DROP) : h) : 0))
  const out = dropped.reduce((s, d, j) => s + d * W2[j], B2)
  return { hidden, keep, dropped, out, next }
}
