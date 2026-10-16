/*
  ROC helpers for the roc-and-pr-curves visuals.
*/
import { normCdf } from '../confusion-matrix-and-metrics/evalMath'

export type Pt = [number, number]

/**
 * Exact ROC curve of a finite sample: sweep the threshold from above every score down to below
 * every score. Each positive passed moves the point up by 1/nPos, each negative right by 1/nNeg;
 * tied scores move diagonally. Returns the corner points from (0, 0) to (1, 1).
 */
export function rocPoints(pos: number[], neg: number[]): Pt[] {
  const all = [...pos.map((s) => ({ s, y: 1 })), ...neg.map((s) => ({ s, y: 0 }))].sort((a, b) => b.s - a.s)
  const pts: Pt[] = [[0, 0]]
  let tp = 0
  let fp = 0
  let i = 0
  while (i < all.length) {
    const s = all[i].s
    while (i < all.length && all[i].s === s) {
      if (all[i].y === 1) tp++
      else fp++
      i++
    }
    pts.push([fp / neg.length, tp / pos.length])
  }
  return pts
}

/** Area under a piecewise-linear curve through the points (trapezoid rule). */
export function areaUnder(pts: Pt[]): number {
  let a = 0
  for (let i = 1; i < pts.length; i++) a += ((pts[i][0] - pts[i - 1][0]) * (pts[i][1] + pts[i - 1][1])) / 2
  return a
}

/** AUC by counting pairs: P(random positive scores higher than random negative), ties count half. */
export function pairAUC(pos: number[], neg: number[]): { wins: number; ties: number; total: number; auc: number } {
  let wins = 0
  let ties = 0
  for (const p of pos)
    for (const n of neg) {
      if (p > n) wins++
      else if (p === n) ties++
    }
  const total = pos.length * neg.length
  return { wins, ties, total, auc: (wins + ties / 2) / total }
}

/** TPR and FPR at threshold t for a finite sample (predict positive when score >= t). */
export function ratesAt(pos: number[], neg: number[], t: number) {
  const tp = pos.filter((s) => s >= t).length
  const fp = neg.filter((s) => s >= t).length
  return { tp, fp, tpr: tp / pos.length, fpr: fp / neg.length }
}

/**
 * Smooth "binormal" curves: negatives' evidence ~ N(−d/2, 1), positives' ~ N(+d/2, 1).
 * At evidence threshold c: TPR = 1 − Φ(c − d/2), FPR = 1 − Φ(c + d/2).
 */
export function binormalAt(c: number, d: number) {
  return { tpr: 1 - normCdf(c - d / 2), fpr: 1 - normCdf(c + d / 2) }
}

export const binormalAUC = (d: number) => normCdf(d / Math.SQRT2)

/** Sample the binormal ROC and PR curves for a positive share `share`. */
export function binormalCurves(d: number, share: number, n = 400) {
  const roc: Pt[] = []
  const pr: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const c = 9 - (18 * i) / n // threshold from very high to very low
    const { tpr, fpr } = binormalAt(c, d)
    roc.push([fpr, tpr])
    const denom = share * tpr + (1 - share) * fpr
    pr.push([tpr, denom > 0 ? (share * tpr) / denom : 1])
  }
  // average precision = area under the PR curve (recall rises along the list)
  return { roc, pr, ap: areaUnder(pr) }
}
