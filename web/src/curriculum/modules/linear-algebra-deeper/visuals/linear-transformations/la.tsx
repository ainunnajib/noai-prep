import type { CSSProperties, ReactNode } from 'react'
import { Path, usePlot } from '../../../../../kit'
import s from './lt.module.css'

/*
  Small 2×2 linear-algebra helpers and drawing pieces shared by the visuals of
  "A matrix is a transformation of space" (and reused by "Span, linear independence and rank").
  Matrices are stored by rows: [[a, b], [c, d]], so the columns are (a, c) and (b, d).
*/

export type V2 = [number, number]
export type M2 = [[number, number], [number, number]]

export const I2: M2 = [
  [1, 0],
  [0, 1],
]
export const fromCols = (c1: V2, c2: V2): M2 => [
  [c1[0], c2[0]],
  [c1[1], c2[1]],
]
export const col = (m: M2, j: 0 | 1): V2 => [m[0][j], m[1][j]]
export const apply = (m: M2, p: V2): V2 => [m[0][0] * p[0] + m[0][1] * p[1], m[1][0] * p[0] + m[1][1] * p[1]]
export const mul = (A: M2, B: M2): M2 => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
]
export const lerpM = (A: M2, B: M2, t: number): M2 => [
  [A[0][0] + (B[0][0] - A[0][0]) * t, A[0][1] + (B[0][1] - A[0][1]) * t],
  [A[1][0] + (B[1][0] - A[1][0]) * t, A[1][1] + (B[1][1] - A[1][1]) * t],
]
export const det = (m: M2) => m[0][0] * m[1][1] - m[0][1] * m[1][0]
export const rot = (deg: number): M2 => {
  const r = (deg * Math.PI) / 180
  const c = Math.cos(r)
  const sn = Math.sin(r)
  return [
    [c, -sn],
    [sn, c],
  ]
}
export const shearX = (k: number): M2 => [
  [1, k],
  [0, 1],
]
export const sameM = (A: M2, B: M2, eps = 1e-9) =>
  Math.abs(A[0][0] - B[0][0]) < eps && Math.abs(A[0][1] - B[0][1]) < eps && Math.abs(A[1][0] - B[1][0]) < eps && Math.abs(A[1][1] - B[1][1]) < eps

/** Display a number: integers plain, otherwise up to `dp` decimals; typographic minus; no "−0". */
export function fmt(v: number, dp = 2): string {
  const p = 10 ** dp
  let r = Math.round(v * p) / p
  if (Math.abs(r) < 0.5 / p) r = 0
  return String(r).replace('-', '−')
}
export const fmtV = (p: V2, dp = 2) => `(${fmt(p[0], dp)}, ${fmt(p[1], dp)})`

/** What a 2×2 matrix does, in words (used as a live label). */
export function describe(m: M2): string {
  const [[a, b], [c, d]] = m
  const eps = 1e-6
  const near = (x: number, y: number) => Math.abs(x - y) < eps
  const D = det(m)
  if ([a, b, c, d].every((v) => near(v, 0))) return 'crushes every point to the origin'
  if (near(D, 0)) return sameM(mul(m, m), m, 1e-6) ? 'projection onto a line: the plane is flattened' : 'squashes the plane onto a line'
  if (near(a, 1) && near(b, 0) && near(c, 0) && near(d, 1)) return 'identity: nothing moves'
  const unit1 = near(a * a + c * c, 1)
  const unit2 = near(b * b + d * d, 1)
  const perp = near(a * b + c * d, 0)
  if (unit1 && unit2 && perp) {
    if (D > 0) {
      const ang = Math.round((Math.atan2(c, a) * 180) / Math.PI)
      return ang >= 0 ? `rotation by ${ang}° anticlockwise` : `rotation by ${-ang}° clockwise`
    }
    return 'reflection (a mirror flip)'
  }
  if (near(b, 0) && near(c, 0)) return `scaling: x × ${fmt(a)}, y × ${fmt(d)}${D < 0 ? ' (with a flip)' : ''}`
  if (near(a, 1) && near(d, 1) && near(c, 0)) return `horizontal shear by ${fmt(b)}`
  if (near(a, 1) && near(d, 1) && near(b, 0)) return `vertical shear by ${fmt(c)}`
  // perpendicular columns of equal length: a turn (or a mirror) combined with an even scaling
  if (perp && near(a * a + c * c, b * b + d * d)) {
    const sc = fmt(Math.sqrt(a * a + c * c))
    if (D > 0) {
      const ang = Math.round((Math.atan2(c, a) * 180) / Math.PI)
      return `${ang >= 0 ? `rotation by ${ang}° anticlockwise` : `rotation by ${-ang}° clockwise`} and scaling × ${sc}`
    }
    return `reflection and scaling × ${sc}`
  }
  return D < 0 ? 'a mix of stretch, turn and shear, with a flip' : 'a mix of stretch, turn and shear'
}

/**
 * The in-between matrix shown while a move is played from I to `target` (f from 0 to 1).
 * A turn (possibly with an even scaling) turns through part of its angle, so lengths never dip
 * on the way; any other move blends the entries in a straight line.
 */
export function morphM(target: M2, f: number): M2 {
  const [[a, b], [c, d]] = target
  const n1 = a * a + c * c
  const n2 = b * b + d * d
  const perp = Math.abs(a * b + c * d) < 1e-9
  if (perp && Math.abs(n1 - n2) < 1e-9 && det(target) > 1e-9) {
    const ang = (Math.atan2(c, a) * 180) / Math.PI
    if (Math.abs(ang) > 1e-9) {
      const k = 1 + (Math.sqrt(n1) - 1) * f
      const r = rot(ang * f)
      return [
        [k * r[0][0], k * r[0][1]],
        [k * r[1][0], k * r[1][1]],
      ]
    }
  }
  return lerpM(I2, target, f)
}

/* ---------------- drawing pieces (use inside <Plot>) ---------------- */

/**
 * A label for the tip of an arrow from the origin, set off to the SIDE of the arrow (not past its
 * tip), on the side away from `away`, so dashed guides that run along the arrow never cross it.
 */
export function TipLabel({ tip, away, text, color }: { tip: V2; away?: V2; text: string; color: string }) {
  const { xs, ys } = usePlot()
  const ox = xs(0)
  const oy = ys(0)
  const px = xs(tip[0])
  const py = ys(tip[1])
  let dx = px - ox
  let dy = py - oy
  const len = Math.hypot(dx, dy)
  if (len < 1e-6) {
    dx = 1
    dy = 0
  } else {
    dx /= len
    dy /= len
  }
  let nx = -dy
  let ny = dx
  if (away) {
    const ax = xs(away[0]) - ox
    const ay = ys(away[1]) - oy
    if (nx * ax + ny * ay > 0) {
      nx = -nx
      ny = -ny
    }
  }
  const x = px + nx * 17 + dx * 4
  const y = py + ny * 17 + dy * 4 + (ny > 0.35 ? 9 : ny < -0.35 ? 0 : 4)
  const anchor = nx > 0.35 ? 'start' : nx < -0.35 ? 'end' : 'middle'
  return (
    <text className="plot-label" x={x} y={y} textAnchor={anchor} style={{ fill: color, fontWeight: 750 }} aria-hidden="true">
      {text}
    </text>
  )
}

/** Clip children to the plot area (the kit's Dots, Arrow and Label are not clipped on their own). */
export function Clip({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

/**
 * Images of the integer grid lines x = k and y = k under m. Because m is linear, each image is
 * again a straight line, so two end points are enough. The images of the axes are drawn stronger.
 */
export function WarpedGrid({ m, n = 10, color = 'var(--viz-5)', opacity = 0.42 }: { m: M2; n?: number; color?: string; opacity?: number }) {
  const L = 60
  const out: ReactNode[] = []
  for (let k = -n; k <= n; k++) {
    const axis = k === 0
    out.push(<Path key={`v${k}`} points={[apply(m, [k, -L]), apply(m, [k, L])]} color={color} width={axis ? 1.8 : 1.1} opacity={axis ? 0.95 : opacity} />)
    out.push(<Path key={`h${k}`} points={[apply(m, [-L, k]), apply(m, [L, k])]} color={color} width={axis ? 1.8 : 1.1} opacity={axis ? 0.95 : opacity} />)
  }
  return <g aria-hidden="true">{out}</g>
}

const circle = (cx: number, cy: number, r: number, from = 0, to = 360, n = 48): V2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = ((from + ((to - from) * i) / n) * Math.PI) / 180
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as V2
  })

/** A winking smiley (the wink makes mirror images easy to spot). */
export function smileyParts(cx: number, cy: number, r: number) {
  return {
    face: circle(cx, cy, r),
    eye: circle(cx - 0.36 * r, cy + 0.3 * r, 0.12 * r, 0, 360, 16),
    wink: [
      [cx + 0.2 * r, cy + 0.28 * r],
      [cx + 0.36 * r, cy + 0.36 * r],
      [cx + 0.52 * r, cy + 0.28 * r],
    ] as V2[],
    smile: circle(cx, cy - 0.02 * r, 0.56 * r, 205, 335, 20),
  }
}

export function Smiley({ m, cx, cy, r, ghost }: { m: M2; cx: number; cy: number; r: number; ghost?: boolean }) {
  const p = smileyParts(cx, cy, r)
  const T = (pts: V2[]) => pts.map((q) => apply(m, q))
  if (ghost) {
    return (
      <g aria-hidden="true">
        <Path points={T(p.face)} closed color="var(--viz-muted)" width={1.5} dash="4 4" />
      </g>
    )
  }
  return (
    <g aria-hidden="true">
      <Path points={T(p.face)} closed color="var(--viz-ink)" width={2} fill="color-mix(in srgb, var(--highlight) 75%, transparent)" />
      <Path points={T(p.eye)} closed color="var(--viz-ink)" width={1.5} fill="var(--viz-ink)" />
      <Path points={T(p.wink)} color="var(--viz-ink)" width={2.4} />
      <Path points={T(p.smile)} color="var(--viz-ink)" width={2.4} />
    </g>
  )
}

/** The letter F: no symmetry at all, so every rotation, flip and shear shows. */
export const F_STROKES: V2[][] = [
  [
    [0.5, 0.25],
    [0.5, 1.85],
    [1.5, 1.85],
  ],
  [
    [0.5, 1.05],
    [1.2, 1.05],
  ],
]

export function FShape({
  m,
  color = 'var(--viz-3)',
  width = 5,
  dash,
  opacity = 1,
}: {
  m: M2
  color?: string
  width?: number
  dash?: string
  opacity?: number
}) {
  return (
    <g aria-hidden="true">
      {F_STROKES.map((st, i) => (
        <Path key={i} points={st.map((q) => apply(m, q))} color={color} width={width} dash={dash} opacity={opacity} />
      ))}
    </g>
  )
}

/* ---------------- HTML matrix with colour-coded columns ---------------- */

export const COL_TONES = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)']

export function ColMat({
  rows,
  name,
  tones = COL_TONES,
  cell = 46,
  dp = 2,
  plain,
  ariaLabel,
}: {
  rows: number[][]
  name?: ReactNode
  tones?: (string | undefined)[]
  cell?: number
  dp?: number
  /** no column colours */
  plain?: boolean
  ariaLabel?: string
}) {
  const nc = rows[0]?.length ?? 0
  return (
    <span className={s.mat}>
      {name && <span className={s.matName}>{name}</span>}
      <span className={s.matBody} role="table" aria-label={ariaLabel}>
        <span className={s.matGrid} style={{ gridTemplateColumns: `repeat(${nc}, ${cell}px)` }}>
          {rows.map((r, i) =>
            r.map((v, j) => {
              const tone = plain ? undefined : tones[j]
              const st: CSSProperties = tone
                ? {
                    color: tone,
                    background: `color-mix(in srgb, ${tone} 14%, var(--surface))`,
                    height: Math.round(cell * 0.78),
                  }
                : { height: Math.round(cell * 0.78) }
              return (
                <span key={`${i}-${j}`} role="cell" className={s.cell} style={st}>
                  {fmt(v, dp)}
                </span>
              )
            }),
          )}
        </span>
      </span>
    </span>
  )
}

/** Coloured inline vector text, e.g. (1.5, 0.5) in the colour of column 1. */
export function Vec({ p, tone, dp = 2 }: { p: V2 | number[]; tone?: string; dp?: number }) {
  return (
    <span className={s.vec} style={tone ? { color: tone } : undefined}>
      ({p.map((x) => fmt(x, dp)).join(', ')})
    </span>
  )
}

/**
 * Wrap a DraggablePoint whose position is snapped to a grid: arrow keys then move it by one whole
 * `step` (the kit's default keyboard step is smaller than the snap, so it would never move).
 */
export function KeyStep({
  x,
  y,
  step = 0.5,
  onChange,
  children,
}: {
  x: number
  y: number
  step?: number
  onChange: (x: number, y: number) => void
  children: ReactNode
}) {
  return (
    <g
      onKeyDownCapture={(e) => {
        const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }
        const mv = d[e.key]
        if (!mv) return
        e.preventDefault()
        e.stopPropagation()
        onChange(x + mv[0], y + mv[1])
      }}
    >
      {children}
    </g>
  )
}
