import { mulberry32 } from '../../../../../kit'

/*
  A toy CLIP trained for real on ONE batch of N image-caption pairs.
  - Each image and each caption starts as a fixed list of F made-up "features" (standing in for
    what a vision backbone or text backbone outputs).
  - Each encoder is one linear layer (F → D), like CLIP's projection heads.
  - Loss: CLIP's symmetric cross-entropy (InfoNCE) on the N × N cosine-similarity matrix divided
    by the temperature τ. Gradients are computed exactly and applied with Adam.
*/

export interface Snapshot {
  /** S[i][j] = cosine similarity of image i and caption j */
  S: number[][]
  /** image → caption loss (rows), caption → image loss (columns), and their average */
  lossI: number
  lossT: number
  loss: number
}

type M = number[][]
const zeros = (r: number, c: number): M => Array.from({ length: r }, () => new Array(c).fill(0))
const matmul = (A: M, B: M): M => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)))
const T = (A: M): M => A[0].map((_, j) => A.map((row) => row[j]))

function gaussian(rng: () => number) {
  const u = Math.max(1e-12, rng())
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export const softmaxRow = (z: number[]) => {
  const m = Math.max(...z)
  const e = z.map((x) => Math.exp(x - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((x) => x / s)
}

/** Cosine matrix → losses, for any column order `perm` (caption shown in column j is perm[j]). */
export function clipLoss(S: M, tau: number) {
  const n = S.length
  const L = S.map((r) => r.map((x) => x / tau))
  const Pr = L.map(softmaxRow)
  const Pc = T(T(L).map(softmaxRow))
  let li = 0
  let lt = 0
  for (let i = 0; i < n; i++) {
    li -= Math.log(Pr[i][i])
    lt -= Math.log(Pc[i][i])
  }
  return { lossI: li / n, lossT: lt / n, loss: (li + lt) / (2 * n), Pr, Pc }
}

export function trainToy(tau: number, { n = 6, f = 6, d = 6, steps = 40, lr = 0.03, seed = 11 } = {}): Snapshot[] {
  const rng = mulberry32(seed)
  const X = Array.from({ length: n }, () => Array.from({ length: f }, () => gaussian(rng)))
  const Y = Array.from({ length: n }, () => Array.from({ length: f }, () => gaussian(rng)))
  const WI = Array.from({ length: f }, () => Array.from({ length: d }, () => 0.5 * gaussian(rng)))
  const WT = Array.from({ length: f }, () => Array.from({ length: d }, () => 0.5 * gaussian(rng)))
  const params = [WI, WT]
  const m = [zeros(f, d), zeros(f, d)]
  const v = [zeros(f, d), zeros(f, d)]
  const b1 = 0.9
  const b2 = 0.999
  const out: Snapshot[] = []

  for (let step = 0; step <= steps; step++) {
    // forward
    const U = matmul(X, WI)
    const V = matmul(Y, WT)
    const nu = U.map((r) => Math.hypot(...r))
    const nv = V.map((r) => Math.hypot(...r))
    const Uh = U.map((r, i) => r.map((x) => x / nu[i]))
    const Vh = V.map((r, i) => r.map((x) => x / nv[i]))
    const S = matmul(Uh, T(Vh))
    const { lossI, lossT, loss, Pr, Pc } = clipLoss(S, tau)
    out.push({ S, lossI, lossT, loss })
    if (step === steps) break

    // backward: dLoss/dS = (P_rows − I + P_cols − I) / (2 n τ)
    const dS = S.map((r, i) => r.map((_, j) => (Pr[i][j] + Pc[i][j] - (i === j ? 2 : 0)) / (2 * n * tau)))
    const dUh = matmul(dS, Vh)
    const dVh = matmul(T(dS), Uh)
    const back = (dh: M, h: M, nrm: number[]) =>
      dh.map((r, i) => {
        const proj = r.reduce((s, x, k) => s + x * h[i][k], 0)
        return r.map((x, k) => (x - h[i][k] * proj) / nrm[i])
      })
    const grads = [matmul(T(X), back(dUh, Uh, nu)), matmul(T(Y), back(dVh, Vh, nv))]

    // Adam update
    const t = step + 1
    for (let p = 0; p < 2; p++)
      for (let a = 0; a < f; a++)
        for (let b = 0; b < d; b++) {
          const g = grads[p][a][b]
          m[p][a][b] = b1 * m[p][a][b] + (1 - b1) * g
          v[p][a][b] = b2 * v[p][a][b] + (1 - b2) * g * g
          const mh = m[p][a][b] / (1 - b1 ** t)
          const vh = v[p][a][b] / (1 - b2 ** t)
          params[p][a][b] -= (lr * mh) / (Math.sqrt(vh) + 1e-8)
        }
  }
  return out
}
