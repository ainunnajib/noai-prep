import type { ReactNode } from 'react'
import { usePlot, mulberry32 } from '../../../../../kit'
import { type M2, type V2, eig2, unit, dirV, mul, rot, transpose, det, fix } from '../eigenvectors-eigenvalues/eig2'
import c from './cps.module.css'

/*
  Shared helpers for the "Covariance, PCA and SVD" visuals: deterministic Gaussian clouds,
  covariance, a Jacobi eigen-solver / SVD for small matrices, a 2×2 SVD as rotate–stretch–rotate,
  marching-squares contours, and two small SVG drawing pieces that work in data coordinates.
*/

/* ---------------- data ---------------- */

/** n standard-normal pairs from a seeded generator (Box–Muller), exactly centred and whitened:
 *  mean (0, 0) and covariance (dividing by n) exactly the identity. */
export function whiteCloud(n: number, seed: number): V2[] {
  const rnd = mulberry32(seed)
  const pts: V2[] = []
  for (let i = 0; i < n; i++) {
    const u1 = Math.max(1e-12, rnd())
    const u2 = rnd()
    const r = Math.sqrt(-2 * Math.log(u1))
    pts.push([r * Math.cos(2 * Math.PI * u2), r * Math.sin(2 * Math.PI * u2)])
  }
  // centre
  const mx = pts.reduce((s, p) => s + p[0], 0) / n
  const my = pts.reduce((s, p) => s + p[1], 0) / n
  const c = pts.map((p) => [p[0] - mx, p[1] - my] as V2)
  // whiten with C^(-1/2)
  const C = covariance(c)
  const e = eig2(C)
  if (e.kind !== 'two') return c
  const R: M2 = [
    [e.v1[0], e.v2[0]],
    [e.v1[1], e.v2[1]],
  ]
  const Dm: M2 = [
    [1 / Math.sqrt(e.l1), 0],
    [0, 1 / Math.sqrt(e.l2)],
  ]
  const W = mul(mul(R, Dm), transpose(R))
  return c.map((p) => [W[0][0] * p[0] + W[0][1] * p[1], W[1][0] * p[0] + W[1][1] * p[1]] as V2)
}

/** Covariance matrix of 2-D points, dividing by n (the points are assumed centred or not; we centre). */
export function covariance(pts: V2[]): M2 {
  const n = pts.length
  const mx = pts.reduce((s, p) => s + p[0], 0) / n
  const my = pts.reduce((s, p) => s + p[1], 0) / n
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (const p of pts) {
    const dx = p[0] - mx
    const dy = p[1] - my
    sxx += dx * dx
    syy += dy * dy
    sxy += dx * dy
  }
  return [
    [sxx / n, sxy / n],
    [sxy / n, syy / n],
  ]
}

/** Points of the ellipse { x : xᵀ C⁻¹ x = k² } (k standard deviations) for a covariance matrix C. */
export function covEllipse(C: M2, k = 2, n = 96): V2[] {
  const e = eig2(C)
  if (e.kind !== 'two') {
    const s = Math.sqrt(Math.max(0, C[0][0]))
    return Array.from({ length: n + 1 }, (_, i) => {
      const d = dirV((360 * i) / n)
      return [k * s * d[0], k * s * d[1]] as V2
    })
  }
  const a = Math.sqrt(Math.max(0, e.l1))
  const b = Math.sqrt(Math.max(0, e.l2))
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = (2 * Math.PI * i) / n
    const u = k * a * Math.cos(t)
    const w = k * b * Math.sin(t)
    return [u * e.v1[0] + w * e.v2[0], u * e.v1[1] + w * e.v2[1]] as V2
  })
}

/* ---------------- small dense linear algebra ---------------- */

/** Eigen-decomposition of a symmetric matrix by cyclic Jacobi rotations.
 *  Returns eigenvalues sorted from largest to smallest and the eigenvectors as COLUMNS of `vectors`. */
export function jacobiEig(Ain: number[][]): { values: number[]; vectors: number[][] } {
  const n = Ain.length
  const A = Ain.map((r) => [...r])
  const V: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] * A[p][q]
    if (off < 1e-22) break
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-15) continue
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q])
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c
        for (let k = 0; k < n; k++) {
          const akp = A[k][p]
          const akq = A[k][q]
          A[k][p] = c * akp - s * akq
          A[k][q] = s * akp + c * akq
        }
        for (let k = 0; k < n; k++) {
          const apk = A[p][k]
          const aqk = A[q][k]
          A[p][k] = c * apk - s * aqk
          A[q][k] = s * apk + c * aqk
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k][p]
          const vkq = V[k][q]
          V[k][p] = c * vkp - s * vkq
          V[k][q] = s * vkp + c * vkq
        }
      }
    }
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => A[j][j] - A[i][i])
  return {
    values: order.map((i) => A[i][i]),
    vectors: V.map((row) => order.map((i) => row[i])),
  }
}

/** Thin SVD of an m×n matrix via the eigenvectors of AᵀA (fine for the small, well-scaled matrices drawn here). */
export function svd(A: number[][]): { s: number[]; U: number[][]; V: number[][] } {
  const m = A.length
  const n = A[0].length
  const AtA = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => A.reduce((sum, row) => sum + row[i] * row[j], 0)))
  const { values, vectors } = jacobiEig(AtA)
  const s = values.map((v) => Math.sqrt(Math.max(0, v)))
  const U = Array.from({ length: m }, () => Array(n).fill(0) as number[])
  for (let k = 0; k < n; k++) {
    if (s[k] < 1e-9) continue
    for (let i = 0; i < m; i++) {
      let acc = 0
      for (let j = 0; j < n; j++) acc += A[i][j] * vectors[j][k]
      U[i][k] = acc / s[k]
    }
  }
  return { s, U, V: vectors }
}

/** 2×2 SVD written as rotations: A = U Σ Vᵀ with Vᵀ = rot(-alpha) (always a rotation),
 *  Σ = diag(s1, s2) with s1 ≥ s2 ≥ 0, and U = rot(beta) · diag(1, flip) where flip = −1 when det A < 0. */
export function svd2(A: M2) {
  const AtA = mul(transpose(A), A)
  const e = eig2(AtA)
  let v1: V2
  let l1: number
  let l2: number
  if (e.kind === 'two') {
    // eig2 sorts by |λ|; AᵀA has λ ≥ 0, so l1 is the larger
    v1 = e.v1
    l1 = e.l1
    l2 = e.l2
  } else if (e.kind === 'all') {
    v1 = [1, 0]
    l1 = e.l
    l2 = e.l
  } else if (e.kind === 'one') {
    v1 = e.v
    l1 = e.l
    l2 = e.l
  } else {
    v1 = [1, 0]
    l1 = 0
    l2 = 0
  }
  const s1 = Math.sqrt(Math.max(0, l1))
  const s2 = Math.sqrt(Math.max(0, l2))
  const v2: V2 = [-v1[1], v1[0]] // V = [v1 v2] is a rotation
  const alpha = (Math.atan2(v1[1], v1[0]) * 180) / Math.PI
  const Av1: V2 = [A[0][0] * v1[0] + A[0][1] * v1[1], A[1][0] * v1[0] + A[1][1] * v1[1]]
  const u1: V2 = s1 > 1e-9 ? unit(Av1) : [1, 0]
  const flip = det(A) < -1e-12 ? -1 : 1
  const u2: V2 = [-u1[1] * flip, u1[0] * flip]
  const beta = (Math.atan2(u1[1], u1[0]) * 180) / Math.PI
  const Vt = transpose([
    [v1[0], v2[0]],
    [v1[1], v2[1]],
  ])
  const U: M2 = [
    [u1[0], u2[0]],
    [u1[1], u2[1]],
  ]
  return { s1, s2, v1, v2, u1, u2, alpha, beta, flip, Vt, U, rotVt: rot(-alpha), rotU: rot(beta) }
}

/* ---------------- contours ---------------- */

export type Seg = [V2, V2]

/** Marching squares on f over [x0,x1]×[y0,y1] with an (n+1)×(n+1) sample grid. Returns line segments for level c. */
export function contour(f: (x: number, y: number) => number, x0: number, x1: number, y0: number, y1: number, n: number, levels: number[]): Seg[][] {
  const hx = (x1 - x0) / n
  const hy = (y1 - y0) / n
  const F: number[][] = []
  for (let i = 0; i <= n; i++) {
    F.push([])
    for (let j = 0; j <= n; j++) F[i].push(f(x0 + i * hx, y0 + j * hy))
  }
  return levels.map((c) => {
    const segs: Seg[] = []
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const corners: [number, number, number][] = [
          [x0 + i * hx, y0 + j * hy, F[i][j]],
          [x0 + (i + 1) * hx, y0 + j * hy, F[i + 1][j]],
          [x0 + (i + 1) * hx, y0 + (j + 1) * hy, F[i + 1][j + 1]],
          [x0 + i * hx, y0 + (j + 1) * hy, F[i][j + 1]],
        ]
        const pts: V2[] = []
        for (let k = 0; k < 4; k++) {
          const a = corners[k]
          const b = corners[(k + 1) % 4]
          if ((a[2] < c) !== (b[2] < c)) {
            const t = (c - a[2]) / (b[2] - a[2])
            pts.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])])
          }
        }
        if (pts.length === 2) segs.push([pts[0], pts[1]])
        else if (pts.length === 4) {
          // saddle cell: decide the pairing with the centre value
          const centre = f(x0 + (i + 0.5) * hx, y0 + (j + 0.5) * hy)
          if ((centre < c) === (corners[0][2] < c)) {
            segs.push([pts[0], pts[3]], [pts[1], pts[2]])
          } else {
            segs.push([pts[0], pts[1]], [pts[2], pts[3]])
          }
        }
      }
    }
    return segs
  })
}

/* ---------------- drawing pieces (inside <Plot>) ---------------- */

/** Many line segments as one path (data coordinates), clipped to the plot. */
export function Segments({ segs, color, width = 1.5, opacity = 1, dash }: { segs: Seg[]; color: string; width?: number; opacity?: number; dash?: string }) {
  const { xs, ys, clipId } = usePlot()
  if (!segs.length) return null
  const d = segs.map(([a, b]) => `M${xs(a[0]).toFixed(1)},${ys(a[1]).toFixed(1)}L${xs(b[0]).toFixed(1)},${ys(b[1]).toFixed(1)}`).join('')
  return <path d={d} clipPath={`url(#${clipId})`} style={{ fill: 'none', stroke: color, strokeWidth: width, opacity, strokeDasharray: dash }} strokeLinecap="round" />
}

/** A cloud of small dots without outlines (cheaper and calmer than <Dots> for 100+ points). */
export function Cloud({ pts, color, r = 2.6, opacity = 0.7 }: { pts: V2[]; color: string; r?: number; opacity?: number }) {
  const { xs, ys, clipId } = usePlot()
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {pts.map((p, i) => (
        <circle key={i} cx={xs(p[0])} cy={ys(p[1])} r={r} style={{ fill: color, opacity }} />
      ))}
    </g>
  )
}

/** A small right-angle marker at `at` between unit directions a and b (data coords, size in px). */
export function RightAngle({ at, a, b, size = 9, color = 'var(--viz-ink)' }: { at: V2; a: V2; b: V2; size?: number; color?: string }) {
  const { xs, ys } = usePlot()
  const P = [xs(at[0]), ys(at[1])]
  const ua = unit([a[0], -a[1]])
  const ub = unit([b[0], -b[1]])
  const p1 = [P[0] + ua[0] * size, P[1] + ua[1] * size]
  const p2 = [P[0] + (ua[0] + ub[0]) * size, P[1] + (ua[1] + ub[1]) * size]
  const p3 = [P[0] + ub[0] * size, P[1] + ub[1] * size]
  return <path d={`M${p1[0]},${p1[1]}L${p2[0]},${p2[1]}L${p3[0]},${p3[1]}`} style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
}

/* ---------------- compact matrices for factorisations (A = U·Σ·Vᵀ, A = Q·R) ---------------- */

/** A small bracketed matrix whose cells size to their text, with a name above and an optional note below. */
export function MiniMat({
  rows,
  name,
  note,
  on,
  format = (v: number) => fix(v, 2),
}: {
  rows: (number | string)[][]
  name: string
  note?: ReactNode
  on?: boolean
  format?: (v: number) => string
}) {
  return (
    <div className={`${c.matCard} ${on ? c.matCardOn : ''}`}>
      <div className={c.miniName}>{name}</div>
      <div className={c.miniBody}>
        <div className={c.miniGrid} role="table" aria-label={`matrix ${name}`} style={{ gridTemplateColumns: `repeat(${rows[0]?.length ?? 1}, auto)` }}>
          {rows.flatMap((r, i) =>
            r.map((v, j) => (
              <span key={`${i}-${j}`} role="cell" className={c.miniCell}>
                {typeof v === 'number' ? format(v) : v}
              </span>
            )),
          )}
        </div>
      </div>
      {note && <div className={c.stageNote}>{note}</div>}
    </div>
  )
}

/** "lhs = f₁ · f₂ · …": the line may only break after the "=", never between the factors. */
export function FactorRow({ lhs, factors }: { lhs: ReactNode; factors: ReactNode[] }) {
  return (
    <div className={c.factorRow}>
      <div className={c.factorSide}>
        {lhs}
        <span className={c.op}>=</span>
      </div>
      <div className={c.factorSide}>
        {factors.map((f, i) => (
          <span key={i} className={c.factorItem}>
            {i > 0 && <span className={c.op}>·</span>}
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}
