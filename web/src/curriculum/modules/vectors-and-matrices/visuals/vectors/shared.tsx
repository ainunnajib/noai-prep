import type { ReactNode } from 'react'
import { usePlot } from '../../../../../kit'
import s from './vectors.module.css'

/** Shared helpers for the "vectors" lesson visuals (not a visual itself). */

export type P = [number, number]

/** Format a number for display: integers plain, otherwise up to 2 decimals, with a true minus sign. */
export function fmt(v: number, dp = 2): string {
  const r = Math.round(v * 10 ** dp) / 10 ** dp
  const a = Math.abs(r)
  const body = Number.isInteger(a) ? String(a) : a.toFixed(dp).replace(/0+$/, '').replace(/\.$/, '')
  return (r < 0 ? '−' : '') + body
}

export const snap = (v: number, step: number) => Math.round(v / step) * step
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** A vector written as a list, e.g. [3, 4], with optional colours and captions under each entry. */
export function Vec({
  name,
  values,
  colors = [],
  captions,
  small,
}: {
  name?: ReactNode
  values: (number | string)[]
  colors?: (string | undefined)[]
  captions?: string[]
  small?: boolean
}) {
  return (
    <span className={`${s.vec}${small ? ' ' + s.vecSmall : ''}`} aria-label={`${typeof name === 'string' ? name + ' = ' : ''}[${values.map((v) => (typeof v === 'number' ? fmt(v) : v)).join(', ')}]`}>
      {name != null && (
        <span className={s.vecName}>
          {name} =
        </span>
      )}
      <span className={s.vecBracket}>[</span>
      {values.map((v, i) => (
        <span key={i} style={{ display: 'inline-flex' }}>
          <span className={s.vecEntry}>
            <span style={{ color: colors[i] }}>{typeof v === 'number' ? fmt(v) : v}</span>
            {captions && <span className={s.vecCap}>{captions[i]}</span>}
          </span>
          {i < values.length - 1 && <span className={s.vecBracket}>,</span>}
        </span>
      ))}
      <span className={s.vecBracket}>]</span>
    </span>
  )
}

/**
 * A text label placed beside an arrow (in data coordinates), offset perpendicular to it so it
 * never sits on the shaft. `t` is how far along the arrow (0 = tail, 1 = tip). The label goes on
 * `side` (1 = right-hand side when walking along the arrow, -1 = left), or, when `avoid` segments
 * are given (the other arrows), on whichever side has more clearance from them.
 */
export function ArrowLabel({
  from,
  to,
  text,
  color,
  t = 0.6,
  side = 1,
  gap = 14,
  avoid,
}: {
  from: P
  to: P
  text: string
  color: string
  t?: number
  side?: 1 | -1
  gap?: number
  avoid?: [P, P][]
}) {
  const { xs, ys } = usePlot()
  const x1 = xs(from[0])
  const y1 = ys(from[1])
  const x2 = xs(to[0])
  const y2 = ys(to[1])
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 4) return null
  const nx = -(y2 - y1) / len
  const ny = (x2 - x1) / len
  const mx = x1 + (x2 - x1) * t
  const my = y1 + (y2 - y1) * t
  const at = (sd: number): [number, number] => [mx + nx * gap * sd, my + ny * gap * sd]
  let sd: number = side
  if (avoid && avoid.length) {
    const segDist = (p: [number, number], [a, b]: [P, P]) => {
      const ax = xs(a[0])
      const ay = ys(a[1])
      const bx = xs(b[0])
      const by = ys(b[1])
      const L2 = (bx - ax) ** 2 + (by - ay) ** 2
      const k = L2 < 1e-9 ? 0 : Math.max(0, Math.min(1, ((p[0] - ax) * (bx - ax) + (p[1] - ay) * (by - ay)) / L2))
      return Math.hypot(p[0] - (ax + k * (bx - ax)), p[1] - (ay + k * (by - ay)))
    }
    const clearance = (p: [number, number]) => Math.min(...avoid.map((sg) => segDist(p, sg)))
    sd = clearance(at(1)) >= clearance(at(-1)) ? 1 : -1
  }
  const [px, py] = at(sd)
  return (
    <text className="plot-label" x={px} y={py} dy="0.35em" textAnchor="middle" style={{ fill: color, fontSize: 14, fontWeight: 700 }}>
      {text}
    </text>
  )
}

export interface LabelSpec {
  from: P
  to: P
  text: string
  color: string
  /** how far along the arrow (0 = tail, 1 = tip) */
  t?: number
  gap?: number
  /** fix the side (1 = right-hand side when walking along the arrow, -1 = left) */
  side?: 1 | -1
}

/**
 * Places several arrow labels at once. Each label goes on whichever side of its arrow has more room,
 * keeping clear of the given segments, of `points` (e.g. drag handles) and of labels already placed.
 */
export function ArrowLabels({ labels, segments = [], points = [] }: { labels: LabelSpec[]; segments?: [P, P][]; points?: P[] }) {
  const { xs, ys } = usePlot()
  const px = (p: P): [number, number] => [xs(p[0]), ys(p[1])]
  const segDist = (p: [number, number], a: [number, number], b: [number, number]) => {
    const L2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2
    const k = L2 < 1e-9 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / L2))
    return Math.hypot(p[0] - (a[0] + k * (b[0] - a[0])), p[1] - (a[1] + k * (b[1] - a[1])))
  }
  const placed: { x: number; y: number; w: number }[] = []
  const out: { x: number; y: number; l: LabelSpec }[] = []
  for (const l of labels) {
    const a = px(l.from)
    const b = px(l.to)
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (len < 4) continue
    const nx = -(b[1] - a[1]) / len
    const ny = (b[0] - a[0]) / len
    const t = l.t ?? 0.6
    const gap = l.gap ?? 15
    const mx = a[0] + (b[0] - a[0]) * t
    const my = a[1] + (b[1] - a[1]) * t
    const w = l.text.length * 7.5 + 6
    const at = (sd: number): [number, number] => [mx + nx * gap * sd, my + ny * gap * sd]
    const clearance = (p: [number, number]) => {
      let c = Infinity
      for (const [s0, s1] of segments) {
        if (s0 === l.from && s1 === l.to) continue
        c = Math.min(c, segDist(p, px(s0), px(s1)))
      }
      for (const q of points) {
        const [qx, qy] = px(q)
        c = Math.min(c, Math.hypot(p[0] - qx, p[1] - qy) - 10)
      }
      for (const q of placed) c = Math.min(c, Math.max(Math.abs(p[0] - q.x) - (q.w + w) / 2, Math.abs(p[1] - q.y) - 14) + 6)
      return c
    }
    const sd = l.side ?? (clearance(at(1)) >= clearance(at(-1)) ? 1 : -1)
    const [x, y] = at(sd)
    placed.push({ x, y, w })
    out.push({ x, y, l })
  }
  return (
    <g>
      {out.map(({ x, y, l }, i) => (
        <text key={i} className="plot-label" x={x} y={y} dy="0.35em" textAnchor="middle" style={{ fill: l.color, fontSize: 14, fontWeight: 700 }}>
          {l.text}
        </text>
      ))}
    </g>
  )
}
