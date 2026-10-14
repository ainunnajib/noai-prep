import { mulberry32 } from '../../../../../kit'

/*
  A tiny NumPy-style toolkit for the "network from scratch" visuals. Arrays are number[][] (row-major),
  vectors are number[]. Everything is float64, exactly like NumPy's default dtype.

  The model (same names as the lesson):
    Z1 = X @ W1 + b1     (N, H)
    A1 = ReLU(Z1)        (N, H)
    Z2 = A1 @ W2 + b2    (N, K)
    P  = softmax(Z2)     (N, K)
    L  = -sum(Y * log P) / N
*/

export type Mat = number[][]
export type Vec = number[]

export function gaussian(rng: () => number): number {
  let u = 0
  while (u === 0) u = rng()
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export const zeros = (r: number, c: number): Mat => Array.from({ length: r }, () => new Array<number>(c).fill(0))
export const shape = (A: Mat): [number, number] => [A.length, A[0]?.length ?? 0]
export const T = (A: Mat): Mat => {
  const [r, c] = shape(A)
  const out = zeros(c, r)
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out[j][i] = A[i][j]
  return out
}

/** Matrix product. Throws a NumPy-style error when the inner sizes differ. */
export function matmul(A: Mat, B: Mat): Mat {
  const [n, k] = shape(A)
  const [k2, m] = shape(B)
  if (k !== k2) {
    throw new Error(
      `ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?) (size ${k2} is different from ${k})`,
    )
  }
  const out = zeros(n, m)
  for (let i = 0; i < n; i++)
    for (let t = 0; t < k; t++) {
      const a = A[i][t]
      if (a === 0) continue
      const row = B[t]
      const o = out[i]
      for (let j = 0; j < m; j++) o[j] += a * row[j]
    }
  return out
}

export const addRow = (A: Mat, b: Vec): Mat => A.map((row) => row.map((v, j) => v + b[j]))
export const relu = (A: Mat): Mat => A.map((row) => row.map((v) => (v > 0 ? v : 0)))
export const sumRows = (A: Mat): Vec => {
  const out = new Array<number>(A[0]?.length ?? 0).fill(0)
  for (const row of A) row.forEach((v, j) => (out[j] += v))
  return out
}
export function softmax(Z: Mat): Mat {
  return Z.map((row) => {
    const m = Math.max(...row)
    const e = row.map((v) => Math.exp(v - m))
    const s = e.reduce((a, b) => a + b, 0)
    return e.map((v) => v / s)
  })
}
export const oneHot = (y: number[], K: number): Mat => y.map((c) => Array.from({ length: K }, (_, k) => (k === c ? 1 : 0)))

export interface Params {
  W1: Mat
  b1: Vec
  W2: Mat
  b2: Vec
}

export interface Forward {
  Z1: Mat
  A1: Mat
  Z2: Mat
  P: Mat
  loss: number
}

export function forward(X: Mat, Y: Mat, p: Params): Forward {
  const N = X.length
  const Z1 = addRow(matmul(X, p.W1), p.b1)
  const A1 = relu(Z1)
  const Z2 = addRow(matmul(A1, p.W2), p.b2)
  const P = softmax(Z2)
  let loss = 0
  for (let i = 0; i < N; i++) for (let k = 0; k < Y[0].length; k++) if (Y[i][k]) loss -= Y[i][k] * Math.log(P[i][k])
  return { Z1, A1, Z2, P, loss: loss / N }
}

export type Bug = 'none' | 'noTransposeX' | 'noTransposeW2' | 'noMask' | 'noN' | 'useZ1'

export interface Grads {
  W1: Mat
  b1: Vec
  W2: Mat
  b2: Vec
}

export interface BackwardOut {
  dZ2: Mat
  dW2: Mat
  db2: Vec
  dA1: Mat
  dZ1: Mat
  dW1: Mat
  db1: Vec
}

/** The seven backward lines, optionally with one classic bug. May throw a NumPy-style shape error. */
export function backward(X: Mat, Y: Mat, p: Params, f: Forward, bug: Bug = 'none'): BackwardOut {
  const N = X.length
  const dZ2 = f.P.map((row, i) => row.map((v, k) => (bug === 'noN' ? v - Y[i][k] : (v - Y[i][k]) / N)))
  const dW2 = matmul(T(bug === 'useZ1' ? f.Z1 : f.A1), dZ2)
  const db2 = sumRows(dZ2)
  const dA1 = matmul(dZ2, bug === 'noTransposeW2' ? p.W2 : T(p.W2))
  const dZ1 = bug === 'noMask' ? dA1.map((r) => r.slice()) : dA1.map((row, i) => row.map((v, j) => (f.Z1[i][j] > 0 ? v : 0)))
  const dW1 = matmul(bug === 'noTransposeX' ? X : T(X), dZ1)
  const db1 = sumRows(dZ1)
  return { dZ2, dW2, db2, dA1, dZ1, dW1, db1 }
}

export const gradsOf = (b: BackwardOut): Grads => ({ W1: b.dW1, b1: b.db1, W2: b.dW2, b2: b.db2 })

export type ParamName = 'W1' | 'b1' | 'W2' | 'b2'

/** Read or write one entry of a parameter: idx = [i] for biases, [i, j] for weights. */
export function getEntry(p: Params, name: ParamName, idx: number[]): number {
  const a = p[name] as Mat | Vec
  return idx.length === 2 ? (a as Mat)[idx[0]][idx[1]] : (a as Vec)[idx[0]]
}
export function setEntry(p: Params, name: ParamName, idx: number[], v: number) {
  const a = p[name] as Mat | Vec
  if (idx.length === 2) (a as Mat)[idx[0]][idx[1]] = v
  else (a as Vec)[idx[0]] = v
}

/** Finite-difference estimate of dL/d(entry). Central: (L(w+ε) − L(w−ε)) / 2ε; forward: (L(w+ε) − L(w)) / ε. */
export function numericalGrad(X: Mat, Y: Mat, p: Params, name: ParamName, idx: number[], eps: number, central = true): number {
  const old = getEntry(p, name, idx)
  setEntry(p, name, idx, old + eps)
  const Lp = forward(X, Y, p).loss
  let Lm: number
  if (central) {
    setEntry(p, name, idx, old - eps)
    Lm = forward(X, Y, p).loss
  } else {
    setEntry(p, name, idx, old)
    Lm = forward(X, Y, p).loss
  }
  setEntry(p, name, idx, old)
  return central ? (Lp - Lm) / (2 * eps) : (Lp - Lm) / eps
}

/** |a − n| / max(|a|, |n|): the usual relative error for gradient checks. */
export function relError(a: number, n: number): number {
  const d = Math.max(Math.abs(a), Math.abs(n))
  return d === 0 ? 0 : Math.abs(a - n) / d
}

export function initParams(rng: () => number, D: number, H: number, K: number, biasScale = 0): Params {
  return {
    W1: Array.from({ length: D }, () => Array.from({ length: H }, () => gaussian(rng) * Math.sqrt(2 / D))),
    b1: Array.from({ length: H }, () => biasScale * gaussian(rng)),
    W2: Array.from({ length: H }, () => Array.from({ length: K }, () => gaussian(rng) * Math.sqrt(2 / H))),
    b2: Array.from({ length: K }, () => biasScale * gaussian(rng)),
  }
}

export const cloneParams = (p: Params): Params => ({ W1: p.W1.map((r) => r.slice()), b1: p.b1.slice(), W2: p.W2.map((r) => r.slice()), b2: p.b2.slice() })

/** Small random problem for the shape/gradient-check visuals. */
export function makeProblem(seed: number, N: number, D: number, H: number, K: number) {
  const rng = mulberry32(seed)
  const X = Array.from({ length: N }, () => Array.from({ length: D }, () => gaussian(rng)))
  const y = Array.from({ length: N }, () => Math.floor(rng() * K))
  const Y = oneHot(y, K)
  const p = initParams(rng, D, H, K, 0.1)
  return { X, y, Y, p }
}

/** Two interleaving half-moons, standardised. Labels alternate 0, 1, 0, 1, … */
export function makeMoons(seed: number, n: number, noise = 0.15): { X: Mat; y: number[] } {
  const rng = mulberry32(seed)
  const X: Mat = []
  const y: number[] = []
  for (let i = 0; i < n; i++) {
    const c = i % 2
    const t = rng() * Math.PI
    let a = Math.cos(t)
    let b = Math.sin(t)
    if (c === 1) {
      a = 1 - a
      b = 0.5 - b
    }
    X.push([a + noise * gaussian(rng), b + noise * gaussian(rng)])
    y.push(c)
  }
  const mean = [0, 1].map((j) => X.reduce((s, r) => s + r[j], 0) / n)
  const sd = [0, 1].map((j) => Math.sqrt(X.reduce((s, r) => s + (r[j] - mean[j]) ** 2, 0) / n))
  return { X: X.map((r) => r.map((v, j) => (v - mean[j]) / sd[j])), y }
}

/** One full gradient-descent step (forward, loss, backward, update). Returns the loss before the update. */
export function trainStep(X: Mat, Y: Mat, p: Params, lr: number): number {
  const f = forward(X, Y, p)
  const g = gradsOf(backward(X, Y, p, f))
  p.W1 = p.W1.map((r, i) => r.map((v, j) => v - lr * g.W1[i][j]))
  p.b1 = p.b1.map((v, j) => v - lr * g.b1[j])
  p.W2 = p.W2.map((r, i) => r.map((v, j) => v - lr * g.W2[i][j]))
  p.b2 = p.b2.map((v, j) => v - lr * g.b2[j])
  return f.loss
}

export const fmtShape = (s: number[]) => (s.length === 1 ? `(${s[0]},)` : `(${s.join(', ')})`)
