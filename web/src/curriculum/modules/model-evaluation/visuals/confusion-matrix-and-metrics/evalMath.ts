/*
  Shared maths for the model-evaluation visuals (confusion matrices, metrics, score models).

  Score model used throughout the module ("binormal" model):
    each example has a hidden evidence value z. For actual negatives z ~ N(-d/2, 1), for actual
    positives z ~ N(+d/2, 1); d is the class separation. The model's score is s = sigmoid(z),
    a number between 0 and 1. Predict "positive" when s >= threshold t.
  With d = 0 the classifier is useless (both classes look alike); larger d means a better model.
*/
import { mulberry32 } from '../../../../../kit'

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
export const logit = (p: number) => Math.log(p / (1 - p))

/** Standard normal CDF Φ(x) (W. J. Cody-style rational approximation via erfc; |error| < 1e-7). */
export function normCdf(x: number): number {
  // Abramowitz & Stegun 7.1.26 is too coarse in the tails; use the complementary error function.
  const z = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + 0.5 * z)
  const r =
    t *
    Math.exp(
      -z * z -
        1.26551223 +
        t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))),
    )
  const erfcHalf = r / 2 // = P(Z > |x|)
  return x >= 0 ? 1 - erfcHalf : erfcHalf
}

/** Standard normal density φ(x). */
export const normPdf = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)

/** Inverse standard normal CDF Φ⁻¹(p) (Acklam's rational approximation, relative error < 1.2e-9). */
export function normInv(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239]
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572]
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416]
  const lo = 0.02425
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
  if (p > 1 - lo) return -normInv(1 - p)
  const q = p - 0.5
  const r = q * q
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
}

/** n evenly spread standard-normal values: Φ⁻¹((i + 0.5) / n). A "perfectly typical" sample. */
export const normalQuantiles = (n: number) => Array.from({ length: n }, (_, i) => normInv((i + 0.5) / n))

/** Deterministic standard-normal samples (Box–Muller on mulberry32). */
export function normals(n: number, seed: number): number[] {
  const rng = mulberry32(seed)
  const out: number[] = []
  while (out.length < n) {
    const u = Math.max(1e-12, rng())
    const v = rng()
    const r = Math.sqrt(-2 * Math.log(u))
    out.push(r * Math.cos(2 * Math.PI * v))
    if (out.length < n) out.push(r * Math.sin(2 * Math.PI * v))
  }
  return out
}

export interface Counts {
  tp: number
  fp: number
  fn: number
  tn: number
}

export interface Metrics {
  accuracy: number
  /** NaN when the model predicts no positives at all (0/0) */
  precision: number
  /** NaN when there are no actual positives */
  recall: number
  /** NaN when precision and recall are both undefined or both 0 */
  f1: number
  /** false positive rate FP / (FP + TN) */
  fpr: number
  /** specificity TN / (TN + FP) */
  specificity: number
}

const div = (a: number, b: number) => (b === 0 ? NaN : a / b)

export function metricsOf({ tp, fp, fn, tn }: Counts): Metrics {
  const total = tp + fp + fn + tn
  const precision = div(tp, tp + fp)
  const recall = div(tp, tp + fn)
  // F1 = 2TP / (2TP + FP + FN): identical to 2PR/(P+R) but defined whenever there is any positive
  const f1 = div(2 * tp, 2 * tp + fp + fn)
  return {
    accuracy: div(tp + tn, total),
    precision,
    recall,
    f1,
    fpr: div(fp, fp + tn),
    specificity: div(tn, tn + fp),
  }
}

/** Count outcomes when predicting positive for score >= t. labels: 1 = actual positive. */
export function countAt(scores: number[], labels: number[], t: number): Counts {
  const c: Counts = { tp: 0, fp: 0, fn: 0, tn: 0 }
  for (let i = 0; i < scores.length; i++) {
    const predPos = scores[i] >= t
    if (labels[i] === 1) predPos ? c.tp++ : c.fn++
    else predPos ? c.fp++ : c.tn++
  }
  return c
}

/**
 * Expected counts for the binormal model with nNeg negatives and nPos positives at threshold t
 * on the score s = sigmoid(z). (Smooth curves; values are not rounded.)
 */
export function expectedCounts(t: number, d: number, nNeg: number, nPos: number): Counts {
  const c = t <= 0 ? -Infinity : t >= 1 ? Infinity : logit(t)
  const negBelow = c === -Infinity ? 0 : c === Infinity ? 1 : normCdf(c + d / 2) // P(z < c | neg)
  const posBelow = c === -Infinity ? 0 : c === Infinity ? 1 : normCdf(c - d / 2)
  return { tn: nNeg * negBelow, fp: nNeg * (1 - negBelow), fn: nPos * posBelow, tp: nPos * (1 - posBelow) }
}

/**
 * Expected counts for a CALIBRATED model: the score is the true probability of being positive,
 * p = sigmoid(d·x + logit(share)) with x ~ N(±d/2, 1). Predict positive when p >= t.
 */
export function calibratedCounts(t: number, d: number, share: number, n: number): Counts {
  const nPos = n * share
  const nNeg = n - nPos
  if (t <= 0) return { tp: nPos, fp: nNeg, fn: 0, tn: 0 }
  if (t >= 1) return { tp: 0, fp: 0, fn: nPos, tn: nNeg }
  const c = (logit(t) - logit(share)) / d // threshold on x
  const fpr = 1 - normCdf(c + d / 2)
  const tpr = 1 - normCdf(c - d / 2)
  return { tp: nPos * tpr, fn: nPos * (1 - tpr), fp: nNeg * fpr, tn: nNeg * (1 - fpr) }
}

/** Format a metric in [0, 1] with 2 decimals, or a dash when undefined. */
export const fmt2 = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : '–')
export const pct = (v: number, dp = 0) => (Number.isFinite(v) ? `${(v * 100).toFixed(dp)}%` : '–')
