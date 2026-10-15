import { useId } from 'react'
import { useContainerWidth } from '../../../../../kit'
import { OP_LABEL, type Graph, type GNode } from './graphCore'

/*
  Draws a computational graph left to right: leaves (inputs) as rounded boxes, operations as
  circles. Values sit above op nodes, gradients (orange pills) below every node, and small
  chips on edges can show a local derivative (purple) or a gradient contribution (orange).
  All sizes are real pixels, recomputed from the container width, so text stays legible on phones.
*/

export interface EdgeChip {
  text: string
  tone: 'local' | 'grad'
  strong?: boolean
}

export const edgeKey = (from: string, to: string) => `${from}>${to}`

export function GraphView({
  graph,
  values,
  grads,
  gradText,
  chips,
  activeNodes = [],
  activeEdges = [],
  backEdges = [],
  selected,
  onNodeClick,
  params = [],
  ariaLabel,
}: {
  graph: Graph
  /** node value, or undefined if not computed yet ('?' is drawn) */
  values: Record<string, number | undefined>
  /** node gradient to show in an orange pill (omit a node to hide its pill) */
  grads?: Record<string, number | undefined>
  /** override the pill text for a node (e.g. a running sum "6 + 18 = 24") */
  gradText?: Record<string, string | undefined>
  chips?: Record<string, EdgeChip | undefined>
  activeNodes?: string[]
  activeEdges?: string[]
  /** edges along which a gradient has flowed backwards (drawn as orange arrows) */
  backEdges?: string[]
  selected?: string
  onNodeClick?: (id: string) => void
  /** leaf ids that are learnable parameters (drawn in the accent colour) */
  params?: string[]
  ariaLabel: string
}) {
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(640)
  const uid = useId().replace(/:/g, '')
  const W = Math.max(290, Math.min(760, measured))
  const compact = W < 520
  const nodes = graph.nodes
  const byId: Record<string, GNode> = {}
  nodes.forEach((n) => (byId[n.id] = n))

  // On wide screens the graph flows left to right; on phones it flows top to bottom.
  const vertical = compact
  const dOf = (n: GNode) => (vertical ? n.vd ?? n.d : n.d)
  const laneOf = (n: GNode) => (vertical ? n.vlane ?? n.lane : n.lane)
  const D = Math.max(1, ...nodes.map(dOf))
  const lanes = nodes.map(laneOf)
  const minLane = Math.min(...lanes)
  const maxLane = Math.max(...lanes)
  const lw = compact ? 58 : 74
  const lh = 30
  const r = compact ? 17 : 19
  const fs = compact ? 12.5 : 13
  let H: number
  let pos: (n: GNode) => [number, number]
  if (!vertical) {
    const padL = lw / 2 + 4
    const padR = 50
    const laneH = 70
    const top = 26
    H = Math.round(top + (maxLane - minLane) * laneH + 52)
    const colW = (W - padL - padR) / D
    pos = (n) => [padL + dOf(n) * colW, top + (laneOf(n) - minLane) * laneH]
  } else {
    const padX = lw / 2 + 4
    const rowH = 84
    const top = 40
    H = Math.round(top + D * rowH + 34)
    const laneW = (W - 2 * padX) / Math.max(1, maxLane - minLane)
    pos = (n) => [padX + (laneOf(n) - minLane) * laneW, top + dOf(n) * rowH]
  }

  // a point on node n's boundary, heading towards (tx, ty)
  const boundary = (n: GNode, tx: number, ty: number, extra = 0): [number, number] => {
    const [x, y] = pos(n)
    const dx = tx - x
    const dy = ty - y
    const len = Math.hypot(dx, dy) || 1
    if (n.op) return [x + (dx / len) * (r + extra), y + (dy / len) * (r + extra)]
    // rectangle: scale the direction to hit the box edge
    const sx = dx === 0 ? Infinity : (lw / 2 + extra) / Math.abs(dx)
    const sy = dy === 0 ? Infinity : (lh / 2 + extra) / Math.abs(dy)
    const s = Math.min(sx, sy)
    return [x + dx * s, y + dy * s]
  }

  const edges: { from: GNode; to: GNode; key: string }[] = []
  nodes.forEach((n) => (n.ins ?? []).forEach((i) => edges.push({ from: byId[i], to: n, key: `${i}>${n.id}` })))

  const gradLabel = (n: GNode) => {
    const g = grads?.[n.id]
    const over = gradText?.[n.id]
    if (over != null) return over
    if (g == null) return null
    const v = fmtShort(g)
    return `∂${graph.nodes.find((m) => m.id === graph.out)?.name ?? 'L'}/∂${n.name} = ${v}`
  }

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label={ariaLabel}>
        <defs>
          <marker id={`${uid}f`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0L10,5L0,10Z" style={{ fill: 'var(--viz-axis)' }} />
          </marker>
          <marker id={`${uid}fa`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0L10,5L0,10Z" style={{ fill: 'var(--viz-5)' }} />
          </marker>
          <marker id={`${uid}b`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0L10,5L0,10Z" style={{ fill: 'var(--viz-2)' }} />
          </marker>
        </defs>

        {/* forward edges */}
        {edges.map(({ from, to, key }) => {
          const [tx, ty] = pos(to)
          const [fx, fy] = pos(from)
          const [x1, y1] = boundary(from, tx, ty, 1)
          const [x2, y2] = boundary(to, fx, fy, 3)
          const act = activeEdges.includes(key)
          return (
            <line
              key={key}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              markerEnd={`url(#${uid}${act ? 'fa' : 'f'})`}
              style={{ stroke: act ? 'var(--viz-5)' : 'var(--viz-axis)', strokeWidth: act ? 2.6 : 1.5, opacity: act ? 1 : 0.8 }}
            />
          )
        })}

        {/* backward arrows (offset to one side of the forward edge) */}
        {edges
          .filter((e) => backEdges.includes(e.key))
          .map(({ from, to, key }) => {
            const [tx, ty] = pos(to)
            const [fx, fy] = pos(from)
            const [x1, y1] = boundary(from, tx, ty, 4)
            const [x2, y2] = boundary(to, fx, fy, 3)
            const len = Math.hypot(x2 - x1, y2 - y1) || 1
            const ox = (-(y2 - y1) / len) * 6
            const oy = ((x2 - x1) / len) * 6
            const act = activeEdges.includes(key)
            return (
              <line
                key={`b${key}`}
                x1={x2 + ox}
                y1={y2 + oy}
                x2={x1 + ox}
                y2={y1 + oy}
                markerEnd={`url(#${uid}b)`}
                style={{ stroke: 'var(--viz-2)', strokeWidth: act ? 2.8 : 1.6, strokeDasharray: act ? undefined : '4 3' }}
              />
            )
          })}

        {/* edge chips */}
        {edges.map(({ from, to, key }) => {
          const c = chips?.[key]
          if (!c) return null
          const [fx, fy] = pos(from)
          const [tx, ty] = pos(to)
          const [x1, y1] = boundary(from, tx, ty, 0)
          const [x2, y2] = boundary(to, fx, fy, 0)
          const mx = (x1 + x2) / 2
          const my = (y1 + y2) / 2
          const w = textWidth(c.text, 11.5) + 10
          const tone = c.tone === 'local' ? 'var(--viz-5)' : 'var(--viz-2)'
          return (
            <g key={`c${key}`}>
              <rect
                x={mx - w / 2}
                y={my - 9.5}
                width={w}
                height={19}
                rx={9.5}
                style={{ fill: `color-mix(in srgb, ${tone} 14%, var(--surface))`, stroke: tone, strokeWidth: c.strong ? 2 : 1 }}
              />
              <text x={mx} y={my + 4} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: 11.5, fontWeight: 700 }}>
                {c.text}
              </text>
            </g>
          )
        })}

        {/* nodes */}
        {nodes.map((n) => {
          const [x, y] = pos(n)
          const v = values[n.id]
          const act = activeNodes.includes(n.id)
          const sel = selected === n.id
          const gl = gradLabel(n)
          const clickable = Boolean(onNodeClick)
          const common = clickable
            ? {
                role: 'button',
                tabIndex: 0,
                'aria-label': `node ${n.name}${v != null ? ` = ${fmtShort(v)}` : ''}`,
                onClick: () => onNodeClick?.(n.id),
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onNodeClick?.(n.id)
                  }
                },
                style: { cursor: 'pointer', outline: 'none' },
              }
            : {}
          const gw = gl ? textWidth(gl, 11.5) + 12 : 0
          const side = n.vside === 'right' ? 1 : -1
          // where the gradient pill goes: below (wide) or beside / above (phones)
          let gx = x - gw / 2
          let gy = n.op ? y + r + 5 : y + lh / 2 + 4
          if (vertical) {
            if (n.op) {
              gx = side < 0 ? x - r - 6 - gw : x + r + 6
              gy = y + 1
            } else gy = y - lh / 2 - 23
          }
          gx = Math.max(2, Math.min(W - 2 - gw, gx))
          const vx = vertical ? x + side * (r + 6) : x
          const vy = vertical ? y - 5 : y - r - 6
          const vAnchor = vertical ? (side < 0 ? 'end' : 'start') : 'middle'
          let body
          if (!n.op) {
            const isParam = params.includes(n.id)
            const stroke = isParam ? 'var(--viz-1)' : 'var(--viz-axis)'
            body = (
              <>
                <rect
                  x={x - lw / 2}
                  y={y - lh / 2}
                  width={lw}
                  height={lh}
                  rx={8}
                  style={{
                    fill: act || sel ? `color-mix(in srgb, ${stroke} 18%, var(--surface))` : 'var(--surface)',
                    stroke,
                    strokeWidth: act || sel ? 2.6 : 1.5,
                  }}
                />
                <text x={x} y={y + 4.5} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: fs, fontWeight: 700 }}>
                  {`${n.name} = ${v == null ? '?' : fmtShort(v)}`}
                </text>
              </>
            )
          } else {
            const lab = OP_LABEL[n.op]
            const lfs = n.op === 'sq' ? 12.5 : lab.length >= 4 ? 10 : lab.length === 3 ? 11.5 : 17
            const done = v != null
            body = (
              <>
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  style={{
                    fill: act || sel ? 'color-mix(in srgb, var(--viz-5) 24%, var(--surface))' : done ? 'color-mix(in srgb, var(--viz-5) 8%, var(--surface))' : 'var(--surface)',
                    stroke: 'var(--viz-5)',
                    strokeWidth: act || sel ? 3 : 1.7,
                  }}
                />
                <text x={x} y={y + lfs * 0.36} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: lfs, fontWeight: 700 }}>
                  {lab}
                </text>
                <text
                  x={vx}
                  y={vy}
                  textAnchor={vAnchor}
                  className="tabular plot-label"
                  style={{ fill: done ? 'var(--viz-ink)' : 'var(--ink-2)', fontSize: fs, fontWeight: 700 }}
                >
                  {`${n.name} = ${done ? fmtShort(v) : '?'}`}
                </text>
              </>
            )
          }
          return (
            <g key={n.id} {...common}>
              {body}
              {gl && (
                <g>
                  <rect
                    x={gx}
                    y={gy}
                    width={gw}
                    height={19}
                    rx={6}
                    style={{ fill: 'color-mix(in srgb, var(--viz-2) 16%, var(--surface))', stroke: 'var(--viz-2)', strokeWidth: act ? 2 : 1 }}
                  />
                  <text x={gx + gw / 2} y={gy + 13.5} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: 11.5, fontWeight: 700 }}>
                    {gl}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** rough width of a label in px (good enough for pill sizing) */
export function textWidth(s: string, size: number) {
  let w = 0
  for (const ch of s) w += /[0-9.]/.test(ch) ? 0.6 : ch === ' ' ? 0.3 : /[∂×−+=]/.test(ch) ? 0.66 : 0.62
  return w * size
}

function fmtShort(v: number) {
  const r = Math.round(v * 1000) / 1000
  const s = (Object.is(r, -0) ? 0 : r).toFixed(3).replace(/\.?0+$/, '')
  return (s === '-0' ? '0' : s).replace('-', '−')
}
