import { scaleLinear, type ScaleLinear } from 'd3-scale'
import { createContext, useCallback, useContext, useId, useMemo, useRef, type ReactNode } from 'react'
import { useContainerWidth } from './useContainerWidth'

/*
  A tiny plotting kit for visual explainers. Everything is in DATA coordinates:

  <Plot x={[-3, 3]} y={[-1, 9]} ariaLabel="Parabola y = x²">
    <Grid />
    <Axes xLabel="x" yLabel="y" />
    <FnPath f={(x) => x * x} />
    <DraggablePoint x={a} y={a * a} onChange={(x) => setA(x)} />
  </Plot>

  Colours: pass CSS variables, e.g. color="var(--viz-2)". All colours come from theme tokens
  (--viz-1..6, --viz-pos, --viz-neg, --viz-axis, --viz-grid, --viz-ink, --viz-muted, --viz-fill).
*/

export interface PlotCtx {
  xs: ScaleLinear<number, number>
  ys: ScaleLinear<number, number>
  width: number
  height: number
  margin: Margin
  clipId: string
  /** convert a pointer event to data coordinates */
  toData: (clientX: number, clientY: number) => [number, number]
}

interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

const Ctx = createContext<PlotCtx | null>(null)

export function usePlot(): PlotCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('usePlot must be used inside <Plot>')
  return c
}

export function Plot({
  x,
  y,
  width: designWidth = 480,
  height: designHeight = 320,
  margin,
  ariaLabel,
  children,
  maxWidth,
  onPointerDown,
  onPointerMove,
}: {
  x: [number, number]
  y: [number, number]
  /** design width in px; the plot scales to its container but never exceeds maxWidth */
  width?: number
  height?: number
  margin?: Partial<Margin>
  ariaLabel: string
  children: ReactNode
  /** cap on rendered CSS width (defaults to the design width × 1.25) */
  maxWidth?: number
  /** pointer handlers receive data coordinates */
  onPointerDown?: (p: [number, number], e: React.PointerEvent<SVGSVGElement>) => void
  onPointerMove?: (p: [number, number], e: React.PointerEvent<SVGSVGElement>) => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const cap = maxWidth ?? designWidth * 1.25
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(designWidth)
  // Size the viewBox in real pixels (keeping the aspect ratio) so 12px text stays 12px on phones.
  const width = Math.max(200, Math.min(cap, measured))
  const height = Math.round((designHeight * width) / designWidth)
  const m: Margin = { top: 14, right: 16, bottom: 34, left: 40, ...margin }
  const clipId = useId().replace(/:/g, '')
  const xs = useMemo(() => scaleLinear().domain(x).range([m.left, width - m.right]), [x[0], x[1], m.left, m.right, width])
  const ys = useMemo(() => scaleLinear().domain(y).range([height - m.bottom, m.top]), [y[0], y[1], m.top, m.bottom, height])

  const toData = useCallback(
    (cx: number, cy: number): [number, number] => {
      const svg = svgRef.current
      if (!svg) return [0, 0]
      const pt = svg.createSVGPoint()
      pt.x = cx
      pt.y = cy
      const ctm = svg.getScreenCTM()
      if (!ctm) return [0, 0]
      const p = pt.matrixTransform(ctm.inverse())
      return [xs.invert(p.x), ys.invert(p.y)]
    },
    [xs, ys],
  )

  const ctx: PlotCtx = { xs, ys, width, height, margin: m, clipId, toData }
  return (
    <Ctx.Provider value={ctx}>
      <div ref={wrapRef} className="plot-wrap" style={{ maxWidth: cap }}>
        <svg
          ref={svgRef}
          className="plot"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={ariaLabel}
          onPointerDown={onPointerDown ? (e) => onPointerDown(toData(e.clientX, e.clientY), e) : undefined}
          onPointerMove={onPointerMove ? (e) => onPointerMove(toData(e.clientX, e.clientY), e) : undefined}
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={m.left} y={m.top} width={width - m.left - m.right} height={height - m.top - m.bottom} />
            </clipPath>
          </defs>
          {children}
        </svg>
      </div>
    </Ctx.Provider>
  )
}

const fmtTick = (v: number) => {
  if (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0)) return v.toExponential(0)
  return String(Math.round(v * 100) / 100)
}

export function Grid({ xTicks = 10, yTicks = 8 }: { xTicks?: number; yTicks?: number }) {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const [y0, y1] = ys.range()
  return (
    <g className="plot-grid" aria-hidden="true">
      {xs.ticks(xTicks).map((t) => (
        <line key={`x${t}`} x1={xs(t)} x2={xs(t)} y1={y0} y2={y1} />
      ))}
      {ys.ticks(yTicks).map((t) => (
        <line key={`y${t}`} y1={ys(t)} y2={ys(t)} x1={x0} x2={x1} />
      ))}
    </g>
  )
}

/**
 * Axes. By default they sit on the left/bottom edges; with `origin` they cross at (0,0)
 * when 0 is inside the domain (good for maths plots).
 */
export function Axes({
  xLabel,
  yLabel,
  xTicks = 6,
  yTicks = 5,
  origin = false,
  tickFormat = fmtTick,
  hideXTicks,
  hideYTicks,
}: {
  xLabel?: string
  yLabel?: string
  xTicks?: number
  yTicks?: number
  origin?: boolean
  tickFormat?: (v: number) => string
  hideXTicks?: boolean
  hideYTicks?: boolean
}) {
  const { xs, ys, margin, height } = usePlot()
  const [x0, x1] = xs.range()
  const [yb, yt] = ys.range()
  const [dx0, dx1] = xs.domain()
  const [dy0, dy1] = ys.domain()
  const yAt = origin && dy0 <= 0 && dy1 >= 0 ? ys(0) : yb
  const xAt = origin && dx0 <= 0 && dx1 >= 0 ? xs(0) : x0
  return (
    <g className="plot-axes">
      <line x1={x0} x2={x1} y1={yAt} y2={yAt} />
      <line x1={xAt} x2={xAt} y1={yb} y2={yt} />
      {!hideXTicks &&
        xs.ticks(xTicks).map((t) =>
          origin && t === 0 && xAt !== x0 ? null : (
            <g key={`xt${t}`} transform={`translate(${xs(t)},${yAt})`}>
              <line y2={5} />
              <text y={17} textAnchor="middle">
                {tickFormat(t)}
              </text>
            </g>
          ),
        )}
      {!hideYTicks &&
        ys.ticks(yTicks).map((t) =>
          origin && t === 0 && yAt !== yb ? null : (
            <g key={`yt${t}`} transform={`translate(${xAt},${ys(t)})`}>
              <line x2={-5} />
              <text x={-8} dy="0.32em" textAnchor="end">
                {tickFormat(t)}
              </text>
            </g>
          ),
        )}
      {xLabel && (
        <text className="plot-axis-label" x={x1} y={Math.min(height - 4, yAt + 30)} textAnchor="end">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text className="plot-axis-label" x={xAt + 6} y={Math.max(11, yt - 2 + (margin.top > 18 ? -6 : 10))} textAnchor="start">
          {yLabel}
        </text>
      )}
    </g>
  )
}

/** Plot y = f(x) across the x-domain (or a sub-domain). Breaks the line at non-finite values. */
export function FnPath({
  f,
  color = 'var(--viz-1)',
  width = 2.5,
  samples = 240,
  domain,
  dash,
  opacity = 1,
}: {
  f: (x: number) => number
  color?: string
  width?: number
  samples?: number
  domain?: [number, number]
  dash?: string
  opacity?: number
}) {
  const { xs, ys, clipId } = usePlot()
  const [a, b] = domain ?? (xs.domain() as [number, number])
  let d = ''
  let pen = false
  for (let i = 0; i <= samples; i++) {
    const xv = a + ((b - a) * i) / samples
    const yv = f(xv)
    if (!Number.isFinite(yv)) {
      pen = false
      continue
    }
    const px = xs(xv)
    const py = Math.max(-1e4, Math.min(1e4, ys(yv)))
    d += `${pen ? 'L' : 'M'}${px.toFixed(2)},${py.toFixed(2)}`
    pen = true
  }
  return <path d={d} clipPath={`url(#${clipId})`} style={{ fill: 'none', stroke: color, strokeWidth: width, strokeDasharray: dash, opacity }} strokeLinejoin="round" strokeLinecap="round" />
}

/** Polyline / polygon through data points. */
export function Path({
  points,
  color = 'var(--viz-1)',
  width = 2,
  dash,
  fill,
  closed,
  opacity = 1,
}: {
  points: [number, number][]
  color?: string
  width?: number
  dash?: string
  fill?: string
  closed?: boolean
  opacity?: number
}) {
  const { xs, ys, clipId } = usePlot()
  if (!points.length) return null
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${xs(x).toFixed(2)},${ys(y).toFixed(2)}`).join('') + (closed ? 'Z' : '')
  return <path d={d} clipPath={`url(#${clipId})`} style={{ fill: fill ?? 'none', stroke: color, strokeWidth: width, strokeDasharray: dash, opacity }} strokeLinejoin="round" strokeLinecap="round" />
}

export interface DotDatum {
  x: number
  y: number
  color?: string
  r?: number
  label?: string
  /** draw as hollow ring */
  hollow?: boolean
  shape?: 'circle' | 'square' | 'triangle' | 'cross'
}

export function Dots({ points, r = 5, color = 'var(--viz-1)', stroke = 'var(--surface)' }: { points: DotDatum[]; r?: number; color?: string; stroke?: string }) {
  const { xs, ys } = usePlot()
  return (
    <g className="plot-dots">
      {points.map((p, i) => {
        const cx = xs(p.x)
        const cy = ys(p.y)
        const rr = p.r ?? r
        const c = p.color ?? color
        const style = p.hollow ? { fill: 'var(--surface)', stroke: c, strokeWidth: 2 } : { fill: c, stroke, strokeWidth: 1.5 }
        let shape
        switch (p.shape) {
          case 'square':
            shape = <rect x={cx - rr} y={cy - rr} width={rr * 2} height={rr * 2} style={style} />
            break
          case 'triangle':
            shape = <path d={`M${cx},${cy - rr * 1.2}L${cx + rr * 1.1},${cy + rr * 0.8}L${cx - rr * 1.1},${cy + rr * 0.8}Z`} style={style} />
            break
          case 'cross':
            shape = <path d={`M${cx - rr},${cy - rr}L${cx + rr},${cy + rr}M${cx - rr},${cy + rr}L${cx + rr},${cy - rr}`} style={{ stroke: c, strokeWidth: 2.5, fill: 'none' }} />
            break
          default:
            shape = <circle cx={cx} cy={cy} r={rr} style={style} />
        }
        return (
          <g key={i}>
            {shape}
            {p.label && (
              <text className="plot-label" x={cx + rr + 4} y={cy - rr - 2}>
                {p.label}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

/** Arrow from one data point to another (vectors, gradients, updates). */
export function Arrow({
  from,
  to,
  color = 'var(--viz-1)',
  width = 2.5,
  label,
  labelOffset = [6, -6],
  head = 9,
  dash,
}: {
  from: [number, number]
  to: [number, number]
  color?: string
  width?: number
  label?: string
  labelOffset?: [number, number]
  head?: number
  dash?: string
}) {
  const { xs, ys } = usePlot()
  const x1 = xs(from[0])
  const y1 = ys(from[1])
  const x2 = xs(to[0])
  const y2 = ys(to[1])
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 0.5) return null
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const h = Math.min(head, len * 0.6)
  const bx = x2 - ux * h
  const by = y2 - uy * h
  const px = -uy * h * 0.55
  const py = ux * h * 0.55
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} style={{ stroke: color, strokeWidth: width, strokeDasharray: dash }} strokeLinecap="round" />
      <path d={`M${x2},${y2}L${bx + px},${by + py}L${bx - px},${by - py}Z`} style={{ fill: color }} />
      {label && (
        <text className="plot-label" x={x2 + labelOffset[0]} y={y2 + labelOffset[1]} style={{ fill: color }}>
          {label}
        </text>
      )}
    </g>
  )
}

export function Label({
  x,
  y,
  children,
  dx = 0,
  dy = 0,
  anchor = 'start',
  color,
  size,
  weight,
}: {
  x: number
  y: number
  children: ReactNode
  dx?: number
  dy?: number
  anchor?: 'start' | 'middle' | 'end'
  color?: string
  size?: number
  weight?: number
}) {
  const { xs, ys } = usePlot()
  return (
    <text className="plot-label" x={xs(x) + dx} y={ys(y) + dy} textAnchor={anchor} style={{ fill: color, fontSize: size, fontWeight: weight }}>
      {children}
    </text>
  )
}

export function HLine({ y, color = 'var(--viz-muted)', dash = '4 4', width = 1.5, label }: { y: number; color?: string; dash?: string; width?: number; label?: string }) {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  return (
    <g>
      <line x1={x0} x2={x1} y1={ys(y)} y2={ys(y)} style={{ stroke: color, strokeDasharray: dash, strokeWidth: width }} />
      {label && (
        <text className="plot-label" x={x1 - 4} y={ys(y) - 5} textAnchor="end" style={{ fill: color }}>
          {label}
        </text>
      )}
    </g>
  )
}

export function VLine({ x, color = 'var(--viz-muted)', dash = '4 4', width = 1.5, label }: { x: number; color?: string; dash?: string; width?: number; label?: string }) {
  const { xs, ys } = usePlot()
  const [y0, y1] = ys.range()
  return (
    <g>
      <line x1={xs(x)} x2={xs(x)} y1={y0} y2={y1} style={{ stroke: color, strokeDasharray: dash, strokeWidth: width }} />
      {label && (
        <text className="plot-label" x={xs(x) + 5} y={y1 + 12} style={{ fill: color }}>
          {label}
        </text>
      )}
    </g>
  )
}

/** Axis-aligned rectangle in data coordinates (shaded regions, bars, histogram bins). */
export function Rect({
  x0,
  x1,
  y0,
  y1,
  fill = 'var(--viz-fill)',
  stroke,
  opacity = 1,
  rx = 0,
}: {
  x0: number
  x1: number
  y0: number
  y1: number
  fill?: string
  stroke?: string
  opacity?: number
  rx?: number
}) {
  const { xs, ys, clipId } = usePlot()
  const X = Math.min(xs(x0), xs(x1))
  const Y = Math.min(ys(y0), ys(y1))
  return (
    <rect
      clipPath={`url(#${clipId})`}
      x={X}
      y={Y}
      width={Math.abs(xs(x1) - xs(x0))}
      height={Math.abs(ys(y1) - ys(y0))}
      rx={rx}
      style={{ fill, stroke, opacity }}
    />
  )
}

/**
 * A point the learner can drag. Calls onChange with data coordinates.
 * Use `constrain` to snap or limit movement, e.g. (x, y) => [Math.round(x), y].
 */
export function DraggablePoint({
  x,
  y,
  onChange,
  color = 'var(--viz-2)',
  r = 9,
  label,
  constrain,
  lockX,
  lockY,
}: {
  x: number
  y: number
  onChange: (x: number, y: number) => void
  color?: string
  r?: number
  label?: string
  constrain?: (x: number, y: number) => [number, number]
  lockX?: boolean
  lockY?: boolean
}) {
  const { xs, ys, toData } = usePlot()
  const dragging = useRef(false)
  const [dx0, dx1] = xs.domain()
  const [dy0, dy1] = ys.domain()
  const clamp = (v: number, a: number, b: number) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), v))

  const move = (cx: number, cy: number) => {
    let [nx, ny] = toData(cx, cy)
    nx = lockX ? x : clamp(nx, dx0, dx1)
    ny = lockY ? y : clamp(ny, dy0, dy1)
    if (constrain) [nx, ny] = constrain(nx, ny)
    onChange(nx, ny)
  }

  const onKey = (e: React.KeyboardEvent) => {
    const sx = (dx1 - dx0) / 50
    const sy = (dy1 - dy0) / 50
    let nx = x
    let ny = y
    if (e.key === 'ArrowLeft' && !lockX) nx -= sx
    else if (e.key === 'ArrowRight' && !lockX) nx += sx
    else if (e.key === 'ArrowUp' && !lockY) ny += sy
    else if (e.key === 'ArrowDown' && !lockY) ny -= sy
    else return
    e.preventDefault()
    nx = clamp(nx, dx0, dx1)
    ny = clamp(ny, dy0, dy1)
    if (constrain) [nx, ny] = constrain(nx, ny)
    onChange(nx, ny)
  }

  return (
    <g
      className="plot-drag"
      tabIndex={0}
      role="slider"
      aria-label={label ?? 'draggable point'}
      aria-valuetext={`x ${x.toFixed(2)}, y ${y.toFixed(2)}`}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        e.stopPropagation()
        dragging.current = true
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX, e.clientY)}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      }}
    >
      <circle cx={xs(x)} cy={ys(y)} r={r + 10} style={{ fill: 'transparent' }} />
      <circle cx={xs(x)} cy={ys(y)} r={r} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2.5 }} />
      {label && (
        <text className="plot-label" x={xs(x) + r + 5} y={ys(y) - r} style={{ fill: color }}>
          {label}
        </text>
      )}
    </g>
  )
}
