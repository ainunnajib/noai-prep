import { useId, useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, usePlayer, PlayerControls, M, useContainerWidth } from '../../../../../kit'
import { fs, ft } from '../derivatives-as-slopes/plotHelpers'

/*
  A one-neuron computational graph: z = w·x + b, a = σ(z), L = (a − y)².
  Forward steps fill in the values left to right; backward steps fill in ∂L/∂(node) right to
  left, each one "upstream gradient × local derivative", with the local derivative written on
  the edge it travels along. All numbers are computed live from the sliders.
*/

const sig = (v: number) => 1 / (1 + Math.exp(-v))

type NodeId = 'x' | 'w' | 'b' | 'z' | 'a' | 'L' | 'y'

export default function GraphChainStepper() {
  const [x, setX] = useState(2)
  const [w, setW] = useState(0.5)
  const [b, setB] = useState(-1)
  const [y, setY] = useState(1)
  const player = usePlayer({ steps: 9, interval: 2200 })
  const k = player.step
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(600)
  const uid = useId().replace(/:/g, '')

  // forward
  const z = w * x + b
  const a = sig(z)
  const L = (a - y) ** 2
  // backward
  const gL = 1
  const ga = 2 * (a - y)
  const sp = a * (1 - a)
  const gz = ga * sp
  const gw = gz * x
  const gb = gz
  const gx = gz * w

  const fwd = k === 0 ? 0 : Math.min(3, k) // 0 inputs, 1 z, 2 a, 3 L
  const bwd = k < 4 ? 0 : Math.min(4, k - 3) // 1 L, 2 a, 3 z, 4 w b x

  const W = Math.max(300, Math.min(760, measured))
  const narrow = W < 520
  // wide screens: the graph flows left to right; phones: top to bottom
  const H = narrow ? 420 : 290
  const nw = narrow ? 74 : Math.min(112, W * 0.17)
  const nh = 46
  const P: Record<NodeId, [number, number]> = narrow
    ? {
        x: [W * 0.17, 66],
        w: [W * 0.5, 66],
        b: [W * 0.83, 66],
        z: [W * 0.5, 176],
        a: [W * 0.5, 276],
        L: [W * 0.5, 376],
        y: [W * 0.85, 376],
      }
    : {
        x: [W * 0.11, 62],
        w: [W * 0.11, 152],
        b: [W * 0.11, 242],
        z: [W * 0.38, 152],
        a: [W * 0.635, 152],
        L: [W * 0.885, 152],
        y: [W * 0.885, 258],
      }
  const chipW = narrow ? 92 : 100
  /** centre of a node's gradient chip: above the node, or (phones) to the left of z, a and L */
  const chipAt = (id: NodeId): [number, number] => {
    const [cx, cy] = P[id]
    if (narrow && (id === 'z' || id === 'a' || id === 'L')) return [cx - nw / 2 - 10 - chipW / 2, cy]
    return [cx, cy - nh / 2 - 16]
  }

  const n2 = (v: number) => fs(v, 3)
  const label: Record<NodeId, string> = narrow
    ? { x: 'x', w: 'w', b: 'b', z: 'z', a: 'a', L: 'L', y: 'y (target)' }
    : { x: 'input x', w: 'weight w', b: 'bias b', z: 'z = wx + b', a: 'a = σ(z)', L: 'L = (a − y)²', y: 'target y' }
  const value: Record<NodeId, string | null> = {
    x: n2(x),
    w: n2(w),
    b: n2(b),
    y: n2(y),
    z: fwd >= 1 ? n2(z) : null,
    a: fwd >= 2 ? n2(a) : null,
    L: fwd >= 3 ? n2(L) : null,
  }
  const grad: Partial<Record<NodeId, { v: number; on: boolean; name: string }>> = {
    L: { v: gL, on: bwd >= 1, name: 'L' },
    a: { v: ga, on: bwd >= 2, name: 'a' },
    z: { v: gz, on: bwd >= 3, name: 'z' },
    w: { v: gw, on: bwd >= 4, name: 'w' },
    b: { v: gb, on: bwd >= 4, name: 'b' },
    x: { v: gx, on: bwd >= 4, name: 'x' },
  }
  const activeNodes: NodeId[] = [[], ['z'], ['a'], ['L'], ['L'], ['a'], ['z'], ['w', 'b', 'x'], ['w']][k] as NodeId[]

  // edges: [from, to, local derivative label (shown on the backward pass), bwd level at which it is used]
  const edges: [NodeId, NodeId, string, number][] = [
    ['x', 'z', '× w', 4],
    ['w', 'z', '× x', 4],
    ['b', 'z', '× 1', 4],
    ['z', 'a', "× σ′(z)", 3],
    ['a', 'L', '× 2(a − y)', 2],
    ['y', 'L', '', 99],
  ]

  /** where the straight line between two node centres leaves/enters each box */
  const edgeGeom = (from: NodeId, to: NodeId) => {
    const [ax, ay] = P[from]
    const [bx, by] = P[to]
    const dx = bx - ax
    const dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len
    const uy = dy / len
    const hwF = (from === 'y' && narrow ? nw * 1.25 : nw) / 2
    const cut = (hw: number) => Math.min(Math.abs(ux) > 1e-6 ? hw / Math.abs(ux) : 1e9, Math.abs(uy) > 1e-6 ? nh / 2 / Math.abs(uy) : 1e9)
    const t1 = cut(hwF) + 2
    const t2 = cut(nw / 2) + 2
    return { x1: ax + ux * t1, y1: ay + uy * t1, x2: bx - ux * t2, y2: by - uy * t2, nx: -uy, ny: ux }
  }

  const steps: { title: string; body: ReactNode }[] = [
    {
      title: 'The graph',
      body: (
        <>
          Each box is one small calculation. The inputs are <M>{`x = ${ft(x)}`}</M>, the weight <M>{`w = ${ft(w)}`}</M>, the bias{' '}
          <M>{`b = ${ft(b)}`}</M> and the target <M>{`y = ${ft(y)}`}</M>. Press <b>Next</b> to run the forward pass.
        </>
      ),
    },
    { title: 'Forward: z', body: <M>{`z = w x + b = ${ft(w)} \\times ${pa(x)} + ${pa(b)} = ${ft(z)}`}</M> },
    { title: 'Forward: a', body: <M>{`a = \\sigma(z) = \\sigma(${ft(z)}) = ${ft(a)}`}</M> },
    { title: 'Forward: L', body: <M>{`L = (a - y)^2 = (${ft(a)} - ${pa(y)})^2 = ${ft(L)}`}</M> },
    {
      title: 'Backward: start at the loss',
      body: (
        <>
          The backward pass asks how much each box affects <M>L</M>. For <M>L</M> itself the answer is <M>{'\\frac{\\partial L}{\\partial L} = 1'}</M>.
        </>
      ),
    },
    {
      title: 'Backward: through the square',
      body: (
        <>
          upstream × local: <M>{`\\frac{\\partial L}{\\partial a} = 1 \\times 2(a - y) = 2 \\times (${ft(a)} - ${pa(y)}) = ${ft(ga)}`}</M>
        </>
      ),
    },
    {
      title: 'Backward: through the sigmoid',
      body: (
        <>
          The local derivative is <M>{`\\sigma'(z) = a(1 - a) = ${ft(sp)}`}</M>, so <M>{`\\frac{\\partial L}{\\partial z} = ${pa(ga)} \\times ${ft(sp)} = ${ft(gz)}`}</M>
        </>
      ),
    },
    {
      title: 'Backward: into the weight and bias',
      body: (
        <>
          <M>{`z = wx + b`}</M> has slope <M>x</M> in the <M>w</M> direction and 1 in the <M>b</M> direction:{' '}
          <M>{`\\frac{\\partial L}{\\partial w} = ${pa(gz)} \\times ${pa(x)} = ${ft(gw)}`}</M> and <M>{`\\frac{\\partial L}{\\partial b} = ${pa(gz)} \\times 1 = ${ft(gb)}`}</M>.
          (The same rule gives <M>{`\\frac{\\partial L}{\\partial x} = ${pa(gz)} \\times ${pa(w)} = ${ft(gx)}`}</M>, which is how gradients flow on to earlier layers.)
        </>
      ),
    },
    {
      title: 'The whole chain in one line',
      body: (
        <>
          <M>{`\\frac{\\partial L}{\\partial w} = \\underbrace{2(a-y)}_{${ft(ga)}} \\cdot \\underbrace{\\sigma'(z)}_{${ft(sp)}} \\cdot \\underbrace{x}_{${ft(x)}} = ${ft(gw)}`}</M>
          . {Math.abs(gw) < 1e-9 ? 'It is 0: changing w would not change the loss here.' : gw < 0 ? 'It is negative, so increasing w would lower the loss.' : 'It is positive, so decreasing w would lower the loss.'}
        </>
      ),
    },
  ]

  const nodeIds: NodeId[] = ['x', 'w', 'b', 'z', 'a', 'L', 'y']
  const cNode = (id: NodeId) => (id === 'y' ? 'var(--viz-6)' : id === 'x' || id === 'w' || id === 'b' ? 'var(--viz-1)' : 'var(--viz-5)')

  return (
    <Figure
      title="The chain rule on a computational graph"
      caption={
        <>
          Step through the forward pass (values flow from the inputs to the loss), then the backward pass (orange gradients flow from the loss back
          to the inputs). Every backward step is the same move: the gradient arriving from the loss side times the local derivative written on the
          edge. Change the sliders and step again: the numbers update.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label={`Computational graph, step ${k + 1}: ${steps[k].title}`}>
          <defs>
            <marker id={`${uid}f`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0L10,5L0,10Z" style={{ fill: 'var(--viz-axis)' }} />
            </marker>
            <marker id={`${uid}b`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0L10,5L0,10Z" style={{ fill: 'var(--viz-2)' }} />
            </marker>
          </defs>
          {edges.map(([f, t, loc, lvl]) => {
            const e = edgeGeom(f, t)
            const used = bwd >= lvl
            const now = bwd === lvl && k <= 7
            const mx = (e.x1 + e.x2) / 2
            const my = (e.y1 + e.y2) / 2
            // the backward arrow runs alongside the forward one; the label sits on the other side
            const off = 6
            const lx = mx - e.nx * (narrow ? 12 : 14)
            const ly = my - e.ny * (narrow ? 12 : 14)
            const side = Math.abs(e.nx) > Math.abs(e.ny) * 1.5 ? (-e.nx > 0 ? 'start' : 'end') : 'middle'
            return (
              <g key={`${f}${t}`}>
                <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.6 }} markerEnd={`url(#${uid}f)`} />
                {used && (
                  <line
                    x1={e.x2 + e.nx * off}
                    y1={e.y2 + e.ny * off}
                    x2={e.x1 + e.nx * off}
                    y2={e.y1 + e.ny * off}
                    style={{ stroke: 'var(--viz-2)', strokeWidth: now ? 3.2 : 1.8, strokeDasharray: now ? undefined : '5 4' }}
                    markerEnd={`url(#${uid}b)`}
                  />
                )}
                {used && loc && (
                  <text
                    x={lx}
                    y={ly}
                    dy="0.35em"
                    textAnchor={side}
                    className="plot-label"
                    style={{ fill: 'var(--viz-2)', fontSize: narrow ? 11.5 : 12.5, fontWeight: 700 }}
                  >
                    {loc}
                  </text>
                )}
              </g>
            )
          })}
          {nodeIds.map((id) => {
            const [cx, cy] = P[id]
            const v = value[id]
            const act = activeNodes.includes(id)
            const g = grad[id]
            const isY = id === 'y'
            const bw = isY ? nw * (narrow ? 1.25 : 1) : nw
            return (
              <g key={id}>
                <rect
                  x={cx - bw / 2}
                  y={cy - nh / 2}
                  width={bw}
                  height={nh}
                  rx={10}
                  style={{
                    fill: act ? `color-mix(in srgb, ${cNode(id)} 22%, var(--surface))` : 'var(--surface)',
                    stroke: cNode(id),
                    strokeWidth: act ? 3 : 1.6,
                  }}
                />
                <text x={cx} y={cy - 6} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: narrow ? 12 : 12.5, fontWeight: 700 }}>
                  {label[id]}
                </text>
                <text x={cx} y={cy + 13} textAnchor="middle" className="tabular" style={{ fill: v == null ? 'var(--ink-3)' : 'var(--viz-ink)', fontSize: 14, fontWeight: 800 }}>
                  {v ?? '?'}
                </text>
                {g && g.on && (
                  <g>
                    <rect
                      x={chipAt(id)[0] - chipW / 2}
                      y={chipAt(id)[1] - 10}
                      width={chipW}
                      height={20}
                      rx={6}
                      style={{ fill: 'color-mix(in srgb, var(--viz-2) 16%, var(--surface))', stroke: 'var(--viz-2)', strokeWidth: act && k >= 4 ? 2 : 1 }}
                    />
                    <text x={chipAt(id)[0]} y={chipAt(id)[1]} dy="0.35em" textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: narrow ? 11.5 : 12, fontWeight: 700 }}>
                      {`∂L/∂${g.name} = ${n2(g.v)}`}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
        {narrow && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.2rem 1.4rem', fontSize: '0.9rem', color: 'var(--ink-2)', marginTop: '0.2rem' }}>
            <M>{'z = wx + b'}</M>
            <M>{'a = \\sigma(z)'}</M>
            <M>{'L = (a - y)^2'}</M>
          </div>
        )}
      </div>
      <div style={{ width: '100%', minHeight: '4.6em' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink-2)', marginBottom: '0.2rem' }}>
          Step {k + 1}: {steps[k].title}
        </div>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.6, overflowX: 'auto' }}>{steps[k].body}</div>
      </div>
      <PlayerControls player={player} label={(s) => (s < 4 ? `forward ${s + 1}/4` : `backward ${s - 3}/5`)} />
      <Controls>
        <Slider label="x" value={x} min={-3} max={3} step={0.5} onChange={setX} />
        <Slider label="w" value={w} min={-2} max={2} step={0.25} onChange={setW} />
        <Slider label="b" value={b} min={-2} max={2} step={0.25} onChange={setB} />
        <Slider label="target y" value={y} min={0} max={1} step={0.1} onChange={setY} format={(v) => v.toFixed(1)} />
      </Controls>
    </Figure>
  )
}

/** number for KaTeX, wrapped in brackets if negative */
function pa(v: number): string {
  const s = ft(v)
  return v < 0 ? `(${s})` : s
}
