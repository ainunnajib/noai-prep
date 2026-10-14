import type { ReactNode } from 'react'
import { Plot, Grid, Axes, usePlot } from '../../../../../kit'
import { DATA, FLAT_TYPES, TOWNS, YEARS, binEdges, boxStats, histCounts, mean, median, type Flat } from './hdb'
import type { CatCol, NumCol, Spec } from './labels'
export { FRIENDLY, defaultTitle, yLabelFor, type CatCol, type Kind, type NumCol, type Spec, type YCol } from './labels'

/*
  One renderer for every plot in this lesson (thumbnails, the plot chooser and the recipe builder),
  drawn with the kit's <Plot> in data coordinates. All numbers come from hdb.ts.
*/

export const HUE_COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)']
export const PART_COLOURS = {
  fig: 'var(--viz-5)',
  axes: 'var(--viz-1)',
  title: 'var(--viz-2)',
  labels: 'var(--viz-3)',
  legend: 'var(--viz-4)',
}

export const levels = (c: CatCol): string[] => (c === 'town' ? TOWNS : FLAT_TYPES)
const num = (r: Flat, c: NumCol) => r[c]

interface Mark {
  /** x position, y top (for choosing the emptier corner for the legend) */
  x: number
  y: number
}

interface Built {
  xDom: [number, number]
  yDom: [number, number]
  categorical: string[] | null
  marks: ReactNode
  /** points used to decide where the legend goes */
  extent: Mark[]
  hueLevels: string[]
}

const groupsOf = (data: Flat[], hue: CatCol | null) =>
  hue
    ? levels(hue).map((h, i) => ({ name: h, rows: data.filter((r) => r[hue] === h), colour: HUE_COLOURS[i] }))
    : [{ name: '', rows: data, colour: HUE_COLOURS[0] }]

function tidy(lo: number, hi: number, padFrac = 0.06): [number, number] {
  const pad = (hi - lo) * padFrac
  const span = hi - lo + 2 * pad
  const step = span > 600 ? 100 : span > 250 ? 50 : span > 60 ? 10 : 5
  return [Math.floor((lo - pad) / step) * step, Math.ceil((hi + pad) / step) * step]
}

/* ---------------- marks (inside <Plot>) ---------------- */
function ScatterMarks({ groups, x, y, r }: { groups: ReturnType<typeof groupsOf>; x: NumCol; y: NumCol; r: number }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {groups.flatMap((g) =>
        g.rows.map((row, i) => (
          <circle
            key={`${g.name}${i}`}
            cx={xs(num(row, x))}
            cy={ys(num(row, y))}
            r={r}
            style={{ fill: `color-mix(in srgb, ${g.colour} 75%, transparent)`, stroke: 'var(--surface)', strokeWidth: 0.8 }}
          />
        )),
      )}
    </g>
  )
}

function LineMarks({ series, thumb }: { series: { colour: string; pts: [number, number][] }[]; thumb: boolean }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {series.map((s, k) => (
        <g key={k}>
          <path
            d={s.pts.map(([a, b], i) => `${i ? 'L' : 'M'}${xs(a).toFixed(1)},${ys(b).toFixed(1)}`).join('')}
            style={{ fill: 'none', stroke: s.colour, strokeWidth: thumb ? 2 : 2.4 }}
            strokeLinejoin="round"
          />
          {s.pts.map(([a, b], i) => (
            <circle key={i} cx={xs(a)} cy={ys(b)} r={thumb ? 2.2 : 3.6} style={{ fill: s.colour, stroke: 'var(--surface)', strokeWidth: 1 }} />
          ))}
        </g>
      ))}
    </g>
  )
}

function RectMarks({ rects }: { rects: { x0: number; x1: number; y0: number; y1: number; colour: string; alpha?: number }[] }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {rects.map((r, i) => (
        <rect
          key={i}
          x={Math.min(xs(r.x0), xs(r.x1))}
          y={Math.min(ys(r.y0), ys(r.y1))}
          width={Math.abs(xs(r.x1) - xs(r.x0))}
          height={Math.abs(ys(r.y1) - ys(r.y0))}
          style={{
            fill: r.alpha != null ? `color-mix(in srgb, ${r.colour} ${Math.round(r.alpha * 100)}%, transparent)` : r.colour,
            stroke: r.alpha != null ? r.colour : 'var(--surface)',
            strokeWidth: r.alpha != null ? 1 : 0.8,
          }}
        />
      ))}
    </g>
  )
}

function BoxMarks({ boxes, thumb }: { boxes: { c: number; w: number; colour: string; v: number[] }[]; thumb: boolean }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {boxes.map((b, i) => {
        const st = boxStats(b.v)
        const x0 = xs(b.c - b.w / 2)
        const x1 = xs(b.c + b.w / 2)
        const xc = xs(b.c)
        const cap = (x1 - x0) * 0.25
        const line = { stroke: 'var(--viz-ink)', strokeWidth: thumb ? 1 : 1.3 }
        return (
          <g key={i}>
            <line x1={xc} x2={xc} y1={ys(st.hi)} y2={ys(st.q3)} style={line} />
            <line x1={xc} x2={xc} y1={ys(st.q1)} y2={ys(st.lo)} style={line} />
            <line x1={xc - cap} x2={xc + cap} y1={ys(st.hi)} y2={ys(st.hi)} style={line} />
            <line x1={xc - cap} x2={xc + cap} y1={ys(st.lo)} y2={ys(st.lo)} style={line} />
            <rect
              x={x0}
              y={ys(st.q3)}
              width={x1 - x0}
              height={ys(st.q1) - ys(st.q3)}
              style={{ fill: `color-mix(in srgb, ${b.colour} 55%, var(--surface))`, stroke: 'var(--viz-ink)', strokeWidth: thumb ? 1 : 1.3 }}
            />
            <line x1={x0} x2={x1} y1={ys(st.med)} y2={ys(st.med)} style={{ stroke: 'var(--viz-ink)', strokeWidth: thumb ? 1.6 : 2.2 }} />
            {st.fliers.map((f, k) => (
              <circle key={k} cx={xc} cy={ys(f)} r={thumb ? 2 : 3.4} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 1.2 }} />
            ))}
          </g>
        )
      })}
    </g>
  )
}

/* ---------------- build marks + domains for a spec ---------------- */
export function build(spec: Spec, thumb = false, data: Flat[] = DATA): Built {
  const groups = groupsOf(data, spec.hue)
  const hueLevels = spec.hue ? levels(spec.hue) : []
  switch (spec.kind) {
    case 'scatter': {
      const x = spec.x as NumCol
      const y = spec.y as NumCol
      const xv = data.map((r) => num(r, x))
      const yv = data.map((r) => num(r, y))
      const xDom = x === 'year' ? ([2016.5, 2024.5] as [number, number]) : tidy(Math.min(...xv), Math.max(...xv))
      return {
        xDom,
        yDom: tidy(Math.min(...yv), Math.max(...yv)),
        categorical: null,
        marks: <ScatterMarks groups={groups} x={x} y={y} r={thumb ? 2.2 : 3.8} />,
        extent: data.map((r) => ({ x: num(r, x), y: num(r, y) })),
        hueLevels,
      }
    }
    case 'line': {
      const y = spec.y as NumCol
      const series = groups.map((g) => ({
        colour: g.colour,
        pts: YEARS.map((yr) => [yr, median(g.rows.filter((r) => r.year === yr).map((r) => num(r, y)))] as [number, number]),
      }))
      const all = series.flatMap((s) => s.pts.map((p) => p[1]))
      return {
        xDom: [2016.6, 2024.4],
        yDom: tidy(Math.min(...all), Math.max(...all), 0.1),
        categorical: null,
        marks: <LineMarks series={series} thumb={thumb} />,
        extent: series.flatMap((s) => s.pts.map(([a, b]) => ({ x: a, y: b }))),
        hueLevels,
      }
    }
    case 'hist': {
      const x = spec.x as NumCol
      const edges = binEdges(
        data.map((r) => num(r, x)),
        spec.bins,
      )
      const per = groups.map((g) => ({
        colour: g.colour,
        c: histCounts(
          g.rows.map((r) => num(r, x)),
          edges,
        ),
      }))
      const top = Math.max(...per.flatMap((p) => p.c))
      const rects = per.flatMap((p) =>
        p.c.map((c, k) => ({ x0: edges[k], x1: edges[k + 1], y0: 0, y1: c, colour: p.colour, alpha: spec.hue ? 0.42 : undefined })),
      )
      return {
        xDom: [edges[0] - (edges[1] - edges[0]) * 0.4, edges[edges.length - 1] + (edges[1] - edges[0]) * 0.4],
        yDom: [0, Math.ceil(top * 1.15)],
        categorical: null,
        marks: <RectMarks rects={rects} />,
        extent: rects.map((r) => ({ x: (r.x0 + r.x1) / 2, y: r.y1 })),
        hueLevels,
      }
    }
    case 'bar': {
      const cats = levels(spec.x as CatCol)
      const nh = spec.hue ? hueLevels.length : 1
      const band = 0.8
      const rects: { x0: number; x1: number; y0: number; y1: number; colour: string }[] = []
      cats.forEach((c, ci) => {
        groups.forEach((g, hi) => {
          const rows = g.rows.filter((r) => r[spec.x as CatCol] === c)
          const v = spec.y === 'count' ? rows.length : rows.length ? mean(rows.map((r) => r.price)) : 0
          const w = band / nh
          const x0 = ci - band / 2 + hi * w
          rects.push({ x0: x0 + w * 0.06, x1: x0 + w * 0.94, y0: 0, y1: v, colour: spec.hue ? g.colour : HUE_COLOURS[0] })
        })
      })
      const top = Math.max(...rects.map((r) => r.y1))
      return {
        xDom: [-0.6, cats.length - 0.4],
        yDom: [0, top > 100 ? Math.ceil((top * 1.18) / 100) * 100 : Math.ceil(top * 1.2)],
        categorical: cats,
        marks: <RectMarks rects={rects} />,
        extent: rects.map((r) => ({ x: (r.x0 + r.x1) / 2, y: r.y1 })),
        hueLevels,
      }
    }
    case 'box': {
      const cats = levels(spec.x as CatCol)
      const y = spec.y as NumCol
      const nh = spec.hue ? hueLevels.length : 1
      const band = 0.8
      const boxes: { c: number; w: number; colour: string; v: number[] }[] = []
      cats.forEach((c, ci) => {
        groups.forEach((g, hi) => {
          const v = g.rows.filter((r) => r[spec.x as CatCol] === c).map((r) => num(r, y))
          if (!v.length) return
          const w = band / nh
          boxes.push({ c: ci - band / 2 + (hi + 0.5) * w, w: w * 0.8, colour: g.colour, v })
        })
      })
      const all = data.map((r) => num(r, y))
      return {
        xDom: [-0.6, cats.length - 0.4],
        yDom: tidy(Math.min(...all), Math.max(...all)),
        categorical: cats,
        marks: <BoxMarks boxes={boxes} thumb={thumb} />,
        extent: boxes.flatMap((b) => {
          const st = boxStats(b.v)
          return [{ x: b.c, y: Math.max(st.hi, ...st.fliers) }]
        }),
        hueLevels,
      }
    }
  }
}

/* ---------------- decorations ---------------- */
function CategoryTicks({ cats, show }: { cats: string[]; show: boolean }) {
  const { xs, ys } = usePlot()
  const y0 = ys.range()[0]
  if (!show) return null
  return (
    <g className="plot-axes">
      {cats.map((c, i) => (
        <g key={c} transform={`translate(${xs(i)},${y0})`}>
          <line y2={5} />
          <text y={17} textAnchor="middle">
            {c}
          </text>
        </g>
      ))}
    </g>
  )
}

function Legend({ title, items, side, outline }: { title: string; items: string[]; side: 'left' | 'right'; outline: boolean }) {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const yTop = ys.range()[1]
  const w = Math.max(title.length * 7.2, ...items.map((t) => t.length * 7 + 22)) + 14
  const h = 22 + items.length * 17
  const left = side === 'left' ? x0 + 8 : x1 - w - 8
  const top = yTop + 6
  return (
    <g>
      <rect x={left} y={top} width={w} height={h} rx={5} style={{ fill: 'var(--surface)', stroke: 'var(--viz-grid)', opacity: 0.94 }} />
      <text x={left + 8} y={top + 15} style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--ink-2)' }}>
        {title}
      </text>
      {items.map((t, i) => (
        <g key={t} transform={`translate(${left + 8},${top + 22 + i * 17})`}>
          <rect y={2} width={11} height={11} rx={2} style={{ fill: HUE_COLOURS[i] }} />
          <text x={17} y={11.5} style={{ fontSize: 11.5, fill: 'var(--ink)' }}>
            {t}
          </text>
        </g>
      ))}
      {outline && (
        <rect
          x={left - 3}
          y={top - 3}
          width={w + 6}
          height={h + 6}
          rx={6}
          style={{ fill: 'none', stroke: PART_COLOURS.legend, strokeWidth: 2, strokeDasharray: '5 3' }}
        />
      )}
    </g>
  )
}

function Frame({ title, xlabel, ylabel, anatomy }: { title?: string; xlabel?: string; ylabel?: string; anatomy: boolean }) {
  const { xs, ys, width, height } = usePlot()
  const [x0, x1] = xs.range()
  const [yb, yt] = ys.range()
  const dash = { fill: 'none', strokeWidth: 2, strokeDasharray: '5 3' }
  const tW = (title?.length ?? 0) * 7.6
  const xW = (xlabel?.length ?? 0) * 7.2
  const yW = (ylabel?.length ?? 0) * 7.2
  const yMid = (yb + yt) / 2
  return (
    <g>
      {title && (
        <text x={(x0 + x1) / 2} y={17} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: 'var(--ink)' }}>
          {title}
        </text>
      )}
      {xlabel && (
        <text x={(x0 + x1) / 2} y={height - 8} textAnchor="middle" style={{ fontSize: 12.5, fontWeight: 600, fill: 'var(--ink-2)' }}>
          {xlabel}
        </text>
      )}
      {ylabel && (
        <text transform={`translate(14,${yMid}) rotate(-90)`} textAnchor="middle" dy="0.32em" style={{ fontSize: 12.5, fontWeight: 600, fill: 'var(--ink-2)' }}>
          {ylabel}
        </text>
      )}
      {anatomy && (
        <g>
          <rect x={x0} y={yt} width={x1 - x0} height={yb - yt} style={{ ...dash, stroke: PART_COLOURS.axes }} />
          {title && <rect x={(x0 + x1) / 2 - tW / 2 - 5} y={3} width={tW + 10} height={20} rx={4} style={{ ...dash, stroke: PART_COLOURS.title }} />}
          {xlabel && (
            <rect x={(x0 + x1) / 2 - xW / 2 - 5} y={height - 23} width={xW + 10} height={20} rx={4} style={{ ...dash, stroke: PART_COLOURS.labels }} />
          )}
          {ylabel && <rect x={4} y={yMid - yW / 2 - 5} width={20} height={yW + 10} rx={4} style={{ ...dash, stroke: PART_COLOURS.labels }} />}
        </g>
      )}
      {/* keep a hair of space so outlines at the edge are not clipped */}
      <rect x={0} y={0} width={width} height={height} style={{ fill: 'none' }} />
    </g>
  )
}

/* ---------------- the chart ---------------- */
export function Chart({
  spec,
  width = 480,
  height = 300,
  title,
  xlabel,
  ylabel,
  legendTitle,
  anatomy = false,
  thumb = false,
  ariaLabel,
  maxWidth,
  minHeight,
}: {
  spec: Spec
  width?: number
  height?: number
  title?: string
  xlabel?: string
  ylabel?: string
  /** null = no legend even with hue */
  legendTitle?: string | null
  anatomy?: boolean
  thumb?: boolean
  ariaLabel: string
  maxWidth?: number
  minHeight?: number
}) {
  const b = build(spec, thumb)
  const margin = thumb
    ? { top: 8, right: 8, bottom: 8, left: 8 }
    : { top: title ? 32 : 12, right: 14, bottom: xlabel ? 46 : 30, left: (ylabel ? 30 : 8) + (spec.kind === 'hist' || spec.y === 'count' ? 26 : 36) }
  const tickFmt = (v: number) => String(Math.round(v * 100) / 100)
  // legend goes in the emptier top corner
  const [d0, d1] = b.xDom
  const third = (d1 - d0) / 3
  const leftMax = Math.max(0, ...b.extent.filter((m) => m.x < d0 + third).map((m) => m.y))
  const rightMax = Math.max(0, ...b.extent.filter((m) => m.x > d1 - third).map((m) => m.y))
  const side: 'left' | 'right' = leftMax <= rightMax ? 'left' : 'right'
  const showLegend = !thumb && spec.hue && legendTitle !== null
  return (
    <Plot x={b.xDom} y={b.yDom} width={width} height={height} margin={margin} ariaLabel={ariaLabel} maxWidth={maxWidth} minHeight={minHeight}>
      {!thumb && <Grid xTicks={b.categorical ? 0 : spec.x === 'year' ? 8 : 6} yTicks={5} />}
      {!thumb ? <Axes xTicks={spec.x === 'year' ? 8 : 6} yTicks={5} hideXTicks={!!b.categorical} tickFormat={tickFmt} /> : <ThumbAxes />}
      {b.categorical && <CategoryTicks cats={b.categorical} show={!thumb} />}
      {b.marks}
      {!thumb && <Frame title={title} xlabel={xlabel} ylabel={ylabel} anatomy={anatomy} />}
      {showLegend && <Legend title={legendTitle ?? spec.hue!} items={b.hueLevels} side={side} outline={anatomy} />}
    </Plot>
  )
}

function ThumbAxes() {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const [yb, yt] = ys.range()
  return <path d={`M${x0},${yt}L${x0},${yb}L${x1},${yb}`} style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
}
