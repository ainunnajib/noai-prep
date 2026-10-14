import { mulberry32 } from '../../../../../lib/random'

/*
  A small made-up "flat price" dataset for the regularisation path: 15 training flats, 200
  validation flats, 6 features (two of them pure noise). Features are standardised with the
  training mean and standard deviation; y is centred, so the intercept is simply mean(y) and is
  never penalised.
*/

export const FEATURES = ['floor area', 'flat age', 'storey', 'distance to MRT', 'postal digit', 'listing weekday']
const W_TRUE = [4, -3, 2, -1, 0, 0]
const SIGMA = 3
const RHO = 0.5

export interface RegData {
  Xtr: number[][]
  ytr: number[]
  Xva: number[][]
  yva: number[]
  yMean: number
}

export function makeRegData(seed = 70, nTrain = 15, nVal = 200): RegData {
  const r = mulberry32(seed)
  const gauss = () => {
    const u = Math.max(r(), 1e-12)
    const v = r()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const row = () => {
    const z = W_TRUE.map(() => gauss())
    z[1] = RHO * z[0] + Math.sqrt(1 - RHO * RHO) * z[1]
    return z
  }
  const target = (X: number[][]) => {
    const noise = X.map(() => gauss())
    return X.map((x, i) => x.reduce((s, v, j) => s + v * W_TRUE[j], 0) + SIGMA * noise[i] + 20)
  }
  const XtrRaw = Array.from({ length: nTrain }, row)
  const ytr = target(XtrRaw)
  const XvaRaw = Array.from({ length: nVal }, row)
  const yva = target(XvaRaw)
  const d = W_TRUE.length
  const mu = Array.from({ length: d }, (_, j) => XtrRaw.reduce((s, x) => s + x[j], 0) / nTrain)
  const sd = Array.from({ length: d }, (_, j) => Math.sqrt(XtrRaw.reduce((s, x) => s + (x[j] - mu[j]) ** 2, 0) / nTrain))
  const std = (X: number[][]) => X.map((x) => x.map((v, j) => (v - mu[j]) / sd[j]))
  return {
    Xtr: std(XtrRaw),
    ytr,
    Xva: std(XvaRaw),
    yva,
    yMean: ytr.reduce((s, v) => s + v, 0) / nTrain,
  }
}

/** Ridge: minimise (1/n)‖y − Xw‖² + λ‖w‖² on centred data. */
export function ridgeFit(X: number[][], yc: number[], lam: number): number[] {
  const n = X.length
  const d = X[0].length
  const M = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => X.reduce((s, x) => s + x[i] * x[j], 0) / n + (i === j ? lam : 0)))
  const b = Array.from({ length: d }, (_, i) => X.reduce((s, x, k) => s + x[i] * yc[k], 0) / n)
  // Gaussian elimination (M is symmetric positive definite for λ > 0, and for λ = 0 here)
  const A = M.map((r, i) => [...r, b[i]])
  for (let k = 0; k < d; k++) {
    let p = k
    for (let i = k + 1; i < d; i++) if (Math.abs(A[i][k]) > Math.abs(A[p][k])) p = i
    ;[A[k], A[p]] = [A[p], A[k]]
    for (let i = k + 1; i < d; i++) {
      const f = A[i][k] / A[k][k]
      for (let j = k; j <= d; j++) A[i][j] -= f * A[k][j]
    }
  }
  const w = new Array(d).fill(0)
  for (let i = d - 1; i >= 0; i--) {
    let s = A[i][d]
    for (let j = i + 1; j < d; j++) s -= A[i][j] * w[j]
    w[i] = s / A[i][i]
  }
  return w
}

/** Lasso: minimise (1/n)‖y − Xw‖² + λ‖w‖₁ by coordinate descent (soft-thresholding at λ/2). */
export function lassoFit(X: number[][], yc: number[], lam: number, start?: number[]): number[] {
  const n = X.length
  const d = X[0].length
  const w = start ? start.slice() : new Array(d).fill(0)
  const z = Array.from({ length: d }, (_, j) => X.reduce((s, x) => s + x[j] * x[j], 0) / n)
  const res = yc.map((y, i) => y - X[i].reduce((s, v, j) => s + v * w[j], 0))
  for (let sweep = 0; sweep < 5000; sweep++) {
    let change = 0
    for (let j = 0; j < d; j++) {
      let rho = 0
      for (let i = 0; i < n; i++) rho += X[i][j] * (res[i] + X[i][j] * w[j])
      rho /= n
      const nw = (Math.sign(rho) * Math.max(Math.abs(rho) - lam / 2, 0)) / z[j]
      const dw = nw - w[j]
      if (dw !== 0) {
        for (let i = 0; i < n; i++) res[i] -= X[i][j] * dw
        w[j] = nw
        change = Math.max(change, Math.abs(dw))
      }
    }
    if (change < 1e-10) break
  }
  return w
}
