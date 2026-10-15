import { useMemo, type ReactNode } from 'react'
import { usePlot } from '../../../../../kit'

/*
  Small helpers for drawing functions of two inputs, f(x, y), from above:
  a heat map (colour = height) and contour lines (marching squares).
  Everything is in data coordinates, inside a kit <Plot>.
*/

export type Fn2 = (x: number, y: number) => number
type Seg = [[number, number], [number, number]]

/** Line segments where f(x, y) = level, found by marching squares on an nx × ny grid. */
export function contourSegments(f: Fn2, xr: [number, number], yr: [number, number], nx: number, ny: number, level: number): Seg[] {
  const [x0, x1] = xr
  const [y0, y1] = yr
  const dx = (x1 - x0) / nx
  const dy = (y1 - y0) / ny
  const v = new Float64Array((nx + 1) * (ny + 1))
  for (let j = 0; j <= ny; j++)
    for (let i = 0; i <= nx; i++) {
      const val = f(x0 + i * dx, y0 + j * dy) - level
      // nudge exact zeros so a contour lying exactly on a grid line is still found
      v[j * (nx + 1) + i] = val === 0 ? 1e-12 : val
    }
  const out: Seg[] = []
  const lerp = (a: number, b: number) => (Math.abs(a - b) < 1e-12 ? 0.5 : a / (a - b))
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = v[j * (nx + 1) + i] // (i, j)      bottom-left
      const b = v[j * (nx + 1) + i + 1] // (i+1, j)    bottom-right
      const c = v[(j + 1) * (nx + 1) + i + 1] // (i+1, j+1) top-right
      const d = v[(j + 1) * (nx + 1) + i] // (i, j+1)    top-left
      const X = x0 + i * dx
      const Y = y0 + j * dy
      const pts: [number, number][] = []
      if (a * b < 0) pts.push([X + lerp(a, b) * dx, Y])
      if (b * c < 0) pts.push([X + dx, Y + lerp(b, c) * dy])
      if (c * d < 0) pts.push([X + (1 - lerp(c, d)) * dx, Y + dy])
      if (d * a < 0) pts.push([X, Y + (1 - lerp(d, a)) * dy])
      if (pts.length === 2) out.push([pts[0], pts[1]])
      else if (pts.length === 4) {
        const centre = (a + b + c + d) / 4
        if (centre * a > 0) {
          out.push([pts[0], pts[1]], [pts[2], pts[3]])
        } else {
          out.push([pts[0], pts[3]], [pts[1], pts[2]])
        }
      }
    }
  }
  return out
}

/**
 * Join marching-squares segments that share end points into longer polylines, so a dashed
 * contour is dashed along its whole length (SVG restarts the dash pattern on every new piece).
 */
export function chainSegments(segs: Seg[]): [number, number][][] {
  const key = (p: [number, number]) => `${Math.round(p[0] * 1e6)},${Math.round(p[1] * 1e6)}`
  const ends = new Map<string, number[]>()
  segs.forEach(([p, q], i) => {
    for (const e of [p, q]) {
      const k = key(e)
      const list = ends.get(k)
      if (list) list.push(i)
      else ends.set(k, [i])
    }
  })
  const used = new Uint8Array(segs.length)
  const other = (i: number, at: [number, number]): [number, number] => (key(segs[i][0]) === key(at) ? segs[i][1] : segs[i][0])
  const grow = (line: [number, number][]) => {
    for (;;) {
      const tail = line[line.length - 1]
      const next = (ends.get(key(tail)) ?? []).find((j) => !used[j])
      if (next === undefined) return
      used[next] = 1
      line.push(other(next, tail))
    }
  }
  const out: [number, number][][] = []
  segs.forEach((s, i) => {
    if (used[i]) return
    used[i] = 1
    const line: [number, number][] = [s[0], s[1]]
    grow(line)
    line.reverse()
    grow(line)
    out.push(line)
  })
  return out
}

/** Contour lines of f at the given levels, clipped to the plot. */
export function ContourLines({
  f,
  levels,
  fnKey,
  color = 'color-mix(in srgb, var(--viz-ink) 45%, transparent)',
  width = 1.2,
  res = 64,
  dash,
}: {
  f: Fn2
  levels: number[]
  /** changes whenever f changes (used to cache the expensive part) */
  fnKey: string
  color?: string
  width?: number
  res?: number
  dash?: string
}) {
  const { xs, ys, clipId } = usePlot()
  const xr = xs.domain() as [number, number]
  const yr = ys.domain() as [number, number]
  const ny = Math.max(8, Math.round((res * (yr[1] - yr[0])) / (xr[1] - xr[0])))
  const d = useMemo(
    () =>
      levels.map((lv) =>
        contourSegments(f, xr, yr, res, ny, lv)
          .map(([p, q]) => `M${xs(p[0]).toFixed(1)},${ys(p[1]).toFixed(1)}L${xs(q[0]).toFixed(1)},${ys(q[1]).toFixed(1)}`)
          .join(''),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fnKey, levels.join(','), xs, ys, res, ny],
  )
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {d.map((p, i) => (
        <path key={i} d={p} style={{ fill: 'none', stroke: color, strokeWidth: width, strokeDasharray: dash }} strokeLinecap="round" />
      ))}
    </g>
  )
}

/**
 * Heat map of f: each cell is coloured by height. Diverging (blue below 0, orange above) when the
 * range crosses 0, otherwise one colour getting stronger with height.
 */
export function HeatMap({
  f,
  fnKey,
  range,
  cells = 28,
  strength = 46,
  sequential = false,
}: {
  f: Fn2
  fnKey: string
  range: [number, number]
  cells?: number
  strength?: number
  /** force one-colour shading even when the range crosses 0 */
  sequential?: boolean
}) {
  const { xs, ys, clipId } = usePlot()
  const [x0, x1] = xs.domain()
  const [y0, y1] = ys.domain()
  const rects = useMemo(() => {
    const ny = Math.max(6, Math.round((cells * (y1 - y0)) / (x1 - x0)))
    const out: ReactNode[] = []
    const [lo, hi] = range
    const diverging = !sequential && lo < 0 && hi > 0
    const top = Math.max(Math.abs(lo), Math.abs(hi))
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < cells; i++) {
        const ax = x0 + ((x1 - x0) * i) / cells
        const bx = x0 + ((x1 - x0) * (i + 1)) / cells
        const ay = y0 + ((y1 - y0) * j) / ny
        const by = y0 + ((y1 - y0) * (j + 1)) / ny
        const v = f((ax + bx) / 2, (ay + by) / 2)
        let fill: string
        if (diverging) {
          const t = Math.min(1, Math.abs(v) / top)
          fill = `color-mix(in srgb, ${v < 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${Math.round(t * strength)}%, var(--surface))`
        } else {
          const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
          fill = `color-mix(in srgb, var(--viz-1) ${Math.round(4 + t * strength)}%, var(--surface))`
        }
        const X = Math.min(xs(ax), xs(bx))
        const Y = Math.min(ys(ay), ys(by))
        out.push(
          <rect
            key={`${i}-${j}`}
            x={X}
            y={Y}
            width={Math.abs(xs(bx) - xs(ax)) + 0.6}
            height={Math.abs(ys(by) - ys(ay)) + 0.6}
            style={{ fill }}
          />,
        )
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fnKey, xs, ys, cells, range[0], range[1], strength, sequential])
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true" shapeRendering="crispEdges">
      {rects}
    </g>
  )
}

/** Clip arbitrary children (arrows, dots) to the plotting area. */
export function Clipped({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

/** A number with up to `dp` decimals and no trailing zeros (−0 shown as 0). */
export function num(v: number, dp = 2): string {
  const r = Math.round(v * 10 ** dp) / 10 ** dp
  return String(Object.is(r, -0) ? 0 : r)
}

/** Wrap negative numbers in brackets for substituted formulas: 2 × (−1.5). */
export function par(v: number, dp = 2): string {
  const s = num(v, dp)
  return v < 0 && s !== '0' ? `(${s})` : s
}
