import type { ComponentProps, KeyboardEvent, ReactNode } from 'react'
import { DraggablePoint, usePlot } from '../../../../../kit'
import s from './vectors.module.css'

/** Shared helpers for the "vectors" lesson visuals (not a visual itself). */

export type P = [number, number]

const KEY_DIR: Record<string, P> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }

/**
 * A DraggablePoint for figures that snap to a grid. The kit's arrow-key step (a fiftieth of the
 * plot) is smaller than our snap, so the snap would round every key press straight back. Here
 * each arrow key moves exactly one grid step instead; dragging with a mouse or finger is unchanged.
 */
export function SnapPoint({ step = 0.5, ...p }: ComponentProps<typeof DraggablePoint> & { step?: number | P }) {
  const { xs, ys } = usePlot()
  const [sx, sy] = typeof step === 'number' ? [step, step] : step
  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    const d = KEY_DIR[e.key]
    if (!d) return
    e.preventDefault()
    e.stopPropagation() // keep the kit's own (smaller) key step from running as well
    const [x0, x1] = xs.domain()
    const [y0, y1] = ys.domain()
    let nx = p.lockX ? p.x : clamp(p.x + d[0] * sx, Math.min(x0, x1), Math.max(x0, x1))
    let ny = p.lockY ? p.y : clamp(p.y + d[1] * sy, Math.min(y0, y1), Math.max(y0, y1))
    if (p.constrain) [nx, ny] = p.constrain(nx, ny)
    p.onChange(nx, ny)
  }
  return (
    <g onKeyDownCapture={onKey}>
      <DraggablePoint {...p} />
    </g>
  )
}

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
  /** several positions along the arrow to try (best clearance wins, earlier ones slightly preferred); overrides t */
  ts?: number[]
  gap?: number
  /** fix the side (1 = right-hand side when walking along the arrow, -1 = left) */
  side?: 1 | -1
  /** skip the label when the arrow is shorter than this many pixels */
  minLen?: number
}

/**
 * Places several arrow labels at once. Each label goes on whichever side of its arrow has more room,
 * keeping clear of the given segments, of `points` (e.g. drag handles), of the axis tick labels at
 * `ticks` and of labels already placed.
 */
export function ArrowLabels({
  labels,
  segments = [],
  points = [],
  ticks,
}: {
  labels: LabelSpec[]
  segments?: [P, P][]
  points?: P[]
  /** tick values drawn by `<Axes origin>`, so labels keep off the tick numbers */
  ticks?: { x: number[]; y: number[] }
}) {
  const { xs, ys } = usePlot()
  // boxes (centre x, centre y, half width, half height) of the tick numbers, as the kit's Axes draws them
  const tickBoxes: [number, number, number, number][] = ticks
    ? [...ticks.x.filter((t) => t !== 0).map((t) => [xs(t), ys(0) + 13, 9, 7] as [number, number, number, number]), ...ticks.y.filter((t) => t !== 0).map((t) => [xs(0) - 15, ys(t), 10, 7] as [number, number, number, number])]
    : []
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
    if (len < Math.max(4, l.minLen ?? 0)) continue
    const nx = -(b[1] - a[1]) / len
    const ny = (b[0] - a[0]) / len
    const gap = l.gap ?? 15
    const w = l.text.length * 7.5 + 6
    const at = (sd: number, t: number): [number, number] => [a[0] + (b[0] - a[0]) * t + nx * gap * sd, a[1] + (b[1] - a[1]) * t + ny * gap * sd]
    /** gap between this label's box (centred at p) and a box centred at (qx, qy) with half-sizes hw, hh */
    const boxGap = (p: [number, number], qx: number, qy: number, hw: number, hh: number) => Math.max(Math.abs(p[0] - qx) - w / 2 - hw, Math.abs(p[1] - qy) - 8 - hh)
    const clearance = (p: [number, number]) => {
      let c = Infinity
      for (const [s0, s1] of segments) {
        if (s0 === l.from && s1 === l.to) continue
        c = Math.min(c, segDist(p, px(s0), px(s1)))
      }
      // drag handles: treat each as a 14 px disc and measure from the edge of the label's box
      for (const q of points) {
        const [qx, qy] = px(q)
        c = Math.min(c, boxGap(p, qx, qy, 14, 14) + 6)
      }
      for (const [qx, qy, hw, hh] of tickBoxes) c = Math.min(c, boxGap(p, qx, qy, hw, hh) + 6)
      for (const q of placed) c = Math.min(c, Math.max(Math.abs(p[0] - q.x) - (q.w + w) / 2, Math.abs(p[1] - q.y) - 14) + 6)
      return c
    }
    let best: [number, number] = at(l.side ?? 1, l.ts?.[0] ?? l.t ?? 0.6)
    let bestScore = -Infinity
    ;(l.ts ?? [l.t ?? 0.6]).forEach((t, k) => {
      for (const sd of l.side ? [l.side] : [1, -1]) {
        const p = at(sd, t)
        const score = Math.min(clearance(p), 40) - 3 * k // clearance beyond 40 px is plenty; prefer earlier positions
        if (score > bestScore) {
          bestScore = score
          best = p
        }
      }
    })
    const [x, y] = best
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
