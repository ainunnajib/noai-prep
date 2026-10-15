/*
  AdaBoost with decision stumps, written to match the lesson's formulas exactly:
    ε_t = Σ (weights of the points stump t gets wrong)        (weights sum to 1)
    α_t = ½ ln((1 − ε_t) / ε_t)
    w_i ← w_i · e^(−α_t · y_i · h_t(x_i))   then divide by the new total
    H(x) = sign(Σ_t α_t h_t(x))
  Labels are +1 (orange squares) and −1 (blue circles).
*/

/** 36 training points on [0, 10]²: [x1, x2, label]. Orange (+1) lies within 7.5 of the corner (10, 0). */
export const RING: [number, number, number][] = [
  [1.1, 1.6, -1], [0.7, 3.2, -1], [0.9, 4.1, -1], [1.5, 5.7, -1], [1.1, 6.8, -1], [1.4, 9.0, -1],
  [2.9, 0.8, 1], [2.6, 3.2, -1], [3.2, 4.5, -1], [2.7, 5.5, -1], [2.2, 7.9, -1], [2.7, 8.5, -1],
  [4.4, 1.4, 1], [4.4, 3.1, 1], [4.2, 3.7, 1], [4.4, 6.2, -1], [4.3, 7.1, -1], [4.6, 8.9, -1],
  [5.8, 1.4, 1], [5.4, 3.0, 1], [6.0, 4.6, 1], [5.4, 5.3, 1], [6.2, 7.8, -1], [6.2, 8.9, -1],
  [7.1, 0.5, 1], [7.5, 2.9, 1], [7.7, 4.0, 1], [7.0, 5.9, 1], [7.7, 7.9, -1], [6.9, 8.9, -1],
  [9.4, 1.0, 1], [9.0, 2.1, 1], [9.1, 4.7, 1], [9.3, 6.2, 1], [9.1, 7.0, 1], [9.2, 8.6, -1],
]

/** A blue point dropped deep inside orange territory: a mislabelled example (label noise). */
export const NOISY_POINT: [number, number, number] = [7.6, 2.0, -1]

export interface Stump {
  /** feature index: 0 = x₁ (across), 1 = x₂ (up) */
  f: number
  /** threshold */
  t: number
  /** prediction for points with x_f > t; the other side gets −s */
  s: number
}

export const stumpPredict = (st: Stump, x: number[]) => (x[st.f] > st.t ? st.s : -st.s)

/** The stump with the smallest weighted error (ties: first found, features then thresholds ascending). */
export function bestStump(X: number[][], y: number[], w: number[]): { stump: Stump; err: number } {
  let best: { stump: Stump; err: number } | null = null
  for (let f = 0; f < 2; f++) {
    const vals = Array.from(new Set(X.map((x) => x[f]))).sort((a, b) => a - b)
    for (let k = 0; k + 1 < vals.length; k++) {
      const t = (vals[k] + vals[k + 1]) / 2
      for (const s of [1, -1]) {
        let err = 0
        for (let i = 0; i < y.length; i++) if ((X[i][f] > t ? s : -s) !== y[i]) err += w[i]
        if (!best || err < best.err - 1e-12) best = { stump: { f, t, s }, err }
      }
    }
  }
  return best!
}

export interface Round {
  stump: Stump
  /** weights the stump was trained on (sum to 1) */
  w: number[]
  /** weights after re-weighting and normalising (the next round's weights) */
  wNext: number[]
  /** which points this stump gets wrong */
  wrong: boolean[]
  eps: number
  alpha: number
  /** training error of the combined vote after this round */
  ensErr: number
  /** combined score Σ α h(x_i) for every training point after this round */
  F: number[]
}

export const alphaOf = (eps: number) => 0.5 * Math.log((1 - eps) / eps)

export function adaboost(data: [number, number, number][], T: number): Round[] {
  const X = data.map((d) => [d[0], d[1]])
  const y = data.map((d) => d[2])
  const n = y.length
  let w = new Array(n).fill(1 / n)
  const F = new Array(n).fill(0)
  const rounds: Round[] = []
  for (let r = 0; r < T; r++) {
    const { stump, err } = bestStump(X, y, w)
    const eps = Math.max(err, 1e-10)
    const alpha = alphaOf(eps)
    const h = X.map((x) => stumpPredict(stump, x))
    const raw = w.map((wi, i) => wi * Math.exp(-alpha * y[i] * h[i]))
    const Z = raw.reduce((a, b) => a + b, 0)
    const wNext = raw.map((v) => v / Z)
    h.forEach((hi, i) => (F[i] += alpha * hi))
    const ensErr = F.filter((Fi, i) => (Fi > 0 ? 1 : -1) !== y[i]).length / n
    rounds.push({ stump, w, wNext, wrong: h.map((hi, i) => hi !== y[i]), eps, alpha, ensErr, F: F.slice() })
    w = wNext
  }
  return rounds
}

/** Combined score Σ α_t h_t(x) of the first k rounds at a point. */
export function scoreAt(rounds: Round[], k: number, x: number[]) {
  let s = 0
  for (let r = 0; r < k; r++) s += rounds[r].alpha * stumpPredict(rounds[r].stump, x)
  return s
}

export const featName = (f: number) => (f === 0 ? 'x₁' : 'x₂')

/** "x₂ ≤ 5.40 → orange" style description of a stump */
export function describe(st: Stump) {
  const leftColour = st.s > 0 ? 'blue' : 'orange'
  return `${featName(st.f)} ≤ ${st.t.toFixed(2)} → ${leftColour}, else ${leftColour === 'blue' ? 'orange' : 'blue'}`
}
