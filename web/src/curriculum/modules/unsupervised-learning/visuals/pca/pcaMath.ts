import { mulberry32 } from '../../../../../kit'

/*
  Small, exact helpers for 2-D PCA used by the lesson's visuals.
  Variances and covariances divide by (n - 1), like np.cov and scikit-learn's PCA.
*/

export type Pt = [number, number]

/** Standard normal samples from a seeded generator (Box-Muller). */
export function normals(seed: number, count: number): number[] {
  const rnd = mulberry32(seed)
  const out: number[] = []
  while (out.length < count) {
    const u = Math.max(1e-12, rnd())
    const v = rnd()
    const r = Math.sqrt(-2 * Math.log(u))
    out.push(r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v))
  }
  return out.slice(0, count)
}

/** n points stretched along angleDeg (sdAlong) and across it (sdAcross), centred exactly on (0, 0). */
export function tiltedCloud(seed: number, n: number, angleDeg: number, sdAlong: number, sdAcross: number): Pt[] {
  const z = normals(seed, 2 * n)
  const a = (angleDeg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const u = z[2 * i] * sdAlong
    const w = z[2 * i + 1] * sdAcross
    pts.push([u * c - w * s, u * s + w * c])
  }
  return centre(pts)
}

export function mean2(pts: Pt[]): Pt {
  let x = 0
  let y = 0
  for (const p of pts) {
    x += p[0]
    y += p[1]
  }
  return [x / pts.length, y / pts.length]
}

export function centre(pts: Pt[]): Pt[] {
  const [mx, my] = mean2(pts)
  return pts.map(([x, y]) => [x - mx, y - my])
}

export interface Cov2 {
  sxx: number
  syy: number
  sxy: number
}

/** Sample covariance matrix entries (divide by n - 1). */
export function cov2(pts: Pt[]): Cov2 {
  const [mx, my] = mean2(pts)
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (const [x, y] of pts) {
    sxx += (x - mx) ** 2
    syy += (y - my) ** 2
    sxy += (x - mx) * (y - my)
  }
  const d = pts.length - 1
  return { sxx: sxx / d, syy: syy / d, sxy: sxy / d }
}

export interface Eig2 {
  l1: number
  l2: number
  /** unit eigenvector for the larger eigenvalue (PC1), pointing into x >= 0 */
  v1: Pt
  v2: Pt
  /** angle of PC1 in degrees, in [0, 180) */
  angle: number
}

/** Eigen-decomposition of the symmetric matrix [[sxx, sxy], [sxy, syy]]. */
export function eig2({ sxx, syy, sxy }: Cov2): Eig2 {
  const half = (sxx + syy) / 2
  const r = Math.sqrt(((sxx - syy) / 2) ** 2 + sxy ** 2)
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy)
  let v1: Pt = [Math.cos(theta), Math.sin(theta)]
  if (v1[0] < 0 || (v1[0] === 0 && v1[1] < 0)) v1 = [-v1[0], -v1[1]]
  const v2: Pt = [-v1[1], v1[0]]
  let angle = (Math.atan2(v1[1], v1[0]) * 180) / Math.PI
  if (angle < 0) angle += 180
  return { l1: half + r, l2: half - r, v1, v2, angle }
}

/** Variance of the data's shadows on the unit direction at angle theta (radians): v^T C v. */
export function keptVariance({ sxx, syy, sxy }: Cov2, theta: number): number {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  return sxx * c * c + 2 * sxy * s * c + syy * s * s
}

export const fmt = (v: number, d = 2) => (Math.abs(v) < 0.5 * 10 ** -d ? (0).toFixed(d) : v.toFixed(d))
