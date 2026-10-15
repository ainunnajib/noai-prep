import type { ReactNode } from 'react'
import { useState } from 'react'
import { Figure, Controls, Toggle, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import css from './autograd.module.css'

/*
  The autograd tape for L = (w*x + b - y)^2 with w = 2, x = 3, b = 1, y = 5 (the running example
  from the backpropagation module). Step through the forward pass (each op is recorded as a
  grad_fn node), then L.backward() (gradients flow back and land in the leaves' .grad), then a
  second forward + backward, which ADDS to .grad unless you zero it first. Switch off
  requires_grad on w or b to see what is (and is not) recorded.
*/

type Id = 'w' | 'x' | 'b' | 'y' | 'mul' | 'add' | 'sub' | 'pow' | 'L'

interface NodeDef {
  id: Id
  kind: 'leaf' | 'op' | 'out'
  /** position along the chain (0..1) and across it (-1..1) */
  u: number
  v: number
  name: string
  value: number
  sym?: string
  gradFn?: string
  inputs?: Id[]
  /** forward step at which it appears */
  at: number
  /** where the value label sits in the wide layout */
  la?: 'right' | 'center'
}

const NODES: NodeDef[] = [
  { id: 'w', kind: 'leaf', u: 0, v: -0.62, name: 'w', value: 2, at: 0 },
  { id: 'x', kind: 'leaf', u: 0, v: 0.62, name: 'x', value: 3, at: 0 },
  { id: 'b', kind: 'leaf', u: 0.27, v: -0.85, name: 'b', value: 1, at: 0 },
  { id: 'y', kind: 'leaf', u: 0.5, v: 0.8, name: 'y', value: 5, at: 0 },
  { id: 'mul', kind: 'op', u: 0.18, v: 0, name: 'p', value: 6, sym: '×', gradFn: 'MulBackward0', inputs: ['w', 'x'], at: 1, la: 'right' },
  { id: 'add', kind: 'op', u: 0.42, v: 0, name: 'y_hat', value: 7, sym: '+', gradFn: 'AddBackward0', inputs: ['mul', 'b'], at: 2, la: 'right' },
  { id: 'sub', kind: 'op', u: 0.65, v: 0, name: 'e', value: 2, sym: '−', gradFn: 'SubBackward0', inputs: ['add', 'y'], at: 3, la: 'center' },
  { id: 'pow', kind: 'op', u: 0.85, v: 0, name: 'L', value: 4, sym: 'x²', gradFn: 'PowBackward0', inputs: ['sub'], at: 4, la: 'center' },
]

// gradient of L with respect to each node's output, and the backward step at which it arrives
const GRAD: Record<Id, number> = { pow: 1, sub: 4, add: 4, y: -4, mul: 4, b: 4, w: 12, x: 8, L: 1 }
const BACK_AT: Record<Id, number> = { pow: 5, sub: 6, add: 7, y: 7, mul: 8, b: 8, w: 9, x: 9, L: 5 }

const STEPS = 11

const LINES = (rw: boolean, rb: boolean, zero: boolean) => [
  `w = torch.tensor(2.0, requires_grad=${rw ? 'True' : 'False'})`,
  `b = torch.tensor(1.0, requires_grad=${rb ? 'True' : 'False'})`,
  'x, y = torch.tensor(3.0), torch.tensor(5.0)',
  'p = w * x',
  'y_hat = p + b',
  'e = y_hat - y',
  'L = e ** 2',
  'L.backward()',
  ...(zero ? ['w.grad.zero_(); b.grad.zero_()  # zero first'] : []),
  'L = (w * x + b - y) ** 2   # a fresh forward pass',
  'L.backward()               # second backward',
]

// which code line (0-based) is current at each step
const lineAt = (step: number, zero: boolean): number[] => {
  if (step === 0) return [0, 1, 2]
  if (step <= 4) return [step + 2]
  if (step <= 9) return [7]
  return zero ? [8, 9, 10] : [8, 9]
}

const fmtT = (v: number) => `tensor(${Number.isInteger(v) ? `${v}.` : v})`

export default function AutogradTape() {
  const [rw, setRw] = useState(true)
  const [rb, setRb] = useState(true)
  const [zero, setZero] = useState(false)
  const player = usePlayer({ steps: STEPS, interval: 1400 })
  const step = player.step
  const [ref, cw] = useContainerWidth<HTMLDivElement>(560)
  const narrow = cw < 500

  const req: Record<Id, boolean> = { w: rw, b: rb, x: false, y: false, mul: rw, add: rw || rb, sub: rw || rb, pow: rw || rb, L: rw || rb }
  const anyReq = rw || rb
  const failed = !anyReq && step >= 5

  // geometry
  const W = narrow ? Math.max(280, Math.min(cw, 420)) : Math.min(Math.max(cw, 500), 640)
  const H = narrow ? 580 : 320
  const pos = (u: number, v: number): [number, number] =>
    narrow ? [W / 2 + v * (W / 2 - 52), 40 + u * (H - 80)] : [44 + u * (W - 88), H / 2 + 10 + v * 112]
  const P: Record<string, [number, number]> = {}
  NODES.forEach((n) => (P[n.id] = pos(n.u, n.v)))
  P.L = pos(1, 0)

  const visible = (n: NodeDef) => step >= n.at
  const backShown = (id: Id) => anyReq && step >= BACK_AT[id] && req[id]

  // .grad values of the leaves
  const leafGrad = (id: 'w' | 'b' | 'x' | 'y'): number | null => {
    if (!req[id] || !anyReq) return null
    if (step < BACK_AT[id]) return null
    const once = GRAD[id]
    if (step >= 10) return zero ? once : 2 * once
    return once
  }

  const narration = (): ReactNode => {
    if (step === 0)
      return (
        <>
          Four <b>leaf</b> tensors. {rw || rb ? <>Only {[rw && 'w', rb && 'b'].filter(Boolean).join(' and ')} asked for gradients (<code>requires_grad=True</code>), so only operations that touch {rw && rb ? 'them' : 'it'} will be recorded.</> : <>None of them asked for gradients, so nothing will be recorded.</>}
        </>
      )
    if (step <= 4) {
      const n = NODES.find((m) => m.at === step)!
      return req[n.id] ? (
        <>
          <code>{n.name}</code> = {n.value}. One of its inputs needs a gradient, so PyTorch records the operation: <code>{n.name}.grad_fn</code> is <code>{n.gradFn}</code>, which
          remembers the inputs it will need for the backward pass.
        </>
      ) : (
        <>
          <code>{n.name}</code> = {n.value}, but no input needs a gradient, so nothing is recorded: <code>{n.name}.grad_fn</code> is <code>None</code> and{' '}
          <code>{n.name}</code> is just a number to the graph.
        </>
      )
    }
    if (failed) return <>Nothing was recorded, so there is no graph to run backwards: <code>L.backward()</code> raises an error.</>
    if (step === 5) return <>L.backward() starts at the loss with ∂L/∂L = 1 and plays the tape in reverse.</>
    if (step === 6) return <>Through the square: ∂L/∂e = 2e × 1 = 2 × 2 = 4.</>
    if (step === 7) return <>Through the subtraction: y_hat gets 4 × 1 = 4. y would get 4 × (−1) = −4, but y does not require grad, so that is skipped.</>
    if (step === 8)
      return rb ? (
        <>Through the addition: both inputs get 4. b is a leaf that requires grad, so 4 is stored in <code>b.grad</code>.</>
      ) : (
        <>Through the addition: p gets 4. b does not require grad, so nothing is stored for it.</>
      )
    if (step === 9)
      return rw ? (
        <>Through the multiplication: w gets 4 × x = 4 × 3 = 12, stored in <code>w.grad</code>. x is data, so its 4 × w = 8 is skipped. The graph's saved values are now freed.</>
      ) : (
        <>The multiplication was never recorded (w did not require grad), so the backward pass stops here. <code>w.grad</code> stays <code>None</code>.</>
      )
    return zero ? (
      <>The grads were zeroed first, so the second backward stores the same values again: {rw && <>w.grad = 12</>}{rw && rb && ', '}{rb && <>b.grad = 4</>}.</>
    ) : (
      <>
        No zeroing: the second backward <b>adds</b> to what was already there, so {rw && <>w.grad = 12 + 12 = 24</>}
        {rw && rb && ' and '}
        {rb && <>b.grad = 4 + 4 = 8</>}. Gradients accumulate.
      </>
    )
  }

  const lines = LINES(rw, rb, zero)
  const cur = lineAt(step, zero)

  // drawing helpers
  const leafW = 64
  const leafH = 32
  const R = 19
  const edgeEnd = (from: Id, to: Id): [number, number, number, number] => {
    const [x1, y1] = P[from]
    const [x2, y2] = P[to]
    const d = Math.hypot(x2 - x1, y2 - y1) || 1
    const ux = (x2 - x1) / d
    const uy = (y2 - y1) / d
    const fromNode = NODES.find((n) => n.id === from)
    const r1 = fromNode?.kind === 'leaf' ? Math.min(leafW / 2 / Math.max(Math.abs(ux), 0.01), leafH / 2 / Math.max(Math.abs(uy), 0.01)) : R
    const r2 = to === 'L' ? Math.min(28 / Math.max(Math.abs(ux), 0.01), 16 / Math.max(Math.abs(uy), 0.01)) : R
    return [x1 + ux * (r1 + 2), y1 + uy * (r1 + 2), x2 - ux * (r2 + 4), y2 - uy * (r2 + 4)]
  }
  const arrowHead = (x1: number, y1: number, x2: number, y2: number, colour: string, key: string) => {
    const d = Math.hypot(x2 - x1, y2 - y1) || 1
    const ux = (x2 - x1) / d
    const uy = (y2 - y1) / d
    const h = 8
    return <path key={key} d={`M${x2},${y2}L${x2 - ux * h - uy * h * 0.5},${y2 - uy * h + ux * h * 0.5}L${x2 - ux * h + uy * h * 0.5},${y2 - uy * h - ux * h * 0.5}Z`} style={{ fill: colour }} />
  }

  const edges: { from: Id; to: Id; at: number }[] = []
  NODES.forEach((n) => n.inputs?.forEach((i) => edges.push({ from: i, to: n.id, at: n.at })))
  edges.push({ from: 'pow', to: 'L', at: 4 })

  return (
    <Figure
      wide
      title="The autograd tape: record forward, replay backward"
      caption={
        <>
          Press <b>Next</b> to run the code one line at a time. Each operation on a tensor that needs a gradient is recorded as a <code>grad_fn</code> node (filled
          circles). <code>L.backward()</code> replays the record in reverse, multiplying local derivatives (orange), and stores the result in the leaves' <code>.grad</code>.
          The last step runs forward and backward again: watch <code>.grad</code> double unless you tick “zero the grads first”. Try switching off{' '}
          <code>requires_grad</code> for <code>w</code> or <code>b</code>.
        </>
      }
    >
      <Controls>
        <Toggle label={<>w requires_grad</>} checked={rw} onChange={setRw} />
        <Toggle label={<>b requires_grad</>} checked={rb} onChange={setRb} />
        <Toggle label="zero the grads first (step 11)" checked={zero} onChange={setZero} />
      </Controls>

      <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr)', gap: 10, width: '100%' }}>
        <pre className={css.code} style={narrow ? { fontSize: '0.7rem' } : undefined} aria-label="Code being run">
          {lines.map((l, i) => {
            const on = cur.includes(i)
            const dim = i > Math.max(...cur)
            const [code, comment] = l.split('#')
            return (
              <span key={i} className={`${css.line} ${on ? css.lineOn : ''} ${dim ? css.lineDim : ''}`}>
                {narrow ? code.trimEnd() : code}
                {comment && !narrow && <span className={css.comment}>#{comment}</span>}
              </span>
            )
          })}
        </pre>

        <div ref={ref} style={{ width: '100%' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }} role="img" aria-label="Computational graph of L = (w x + b - y) squared, with gradients flowing back">
            {/* forward edges */}
            {edges.map((e) => {
              if (step < e.at) return null
              const [x1, y1, x2, y2] = edgeEnd(e.from, e.to)
              const live = req[e.to === 'L' ? 'pow' : e.to]
              const c = live ? 'var(--viz-axis)' : 'var(--viz-muted)'
              return (
                <g key={`f${e.from}${e.to}`} style={{ opacity: live ? 1 : 0.55 }}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: c, strokeWidth: 1.6, strokeDasharray: live ? undefined : '4 3' }} />
                  {arrowHead(x1, y1, x2, y2, c, 'h')}
                </g>
              )
            })}
            {/* backward edges */}
            {edges.map((e) => {
              const target = e.from
              if (!backShown(target) || (e.to !== 'L' && !req[e.to])) return null
              const [x1, y1, x2, y2] = edgeEnd(e.from, e.to)
              const d = Math.hypot(x2 - x1, y2 - y1) || 1
              const ox = (-(y2 - y1) / d) * 7
              const oy = ((x2 - x1) / d) * 7
              const g = e.to === 'L' ? 1 : GRAD[target]
              const mx = (x1 + x2) / 2 + ox * 3.1
              const my = (y1 + y2) / 2 + oy * 3.1
              const isNew = step === BACK_AT[target]
              return (
                <g key={`b${e.from}${e.to}`}>
                  <line x1={x2 + ox} y1={y2 + oy} x2={x1 + ox} y2={y1 + oy} style={{ stroke: 'var(--viz-2)', strokeWidth: isNew ? 3 : 2 }} />
                  {arrowHead(x2 + ox, y2 + oy, x1 + ox, y1 + oy, 'var(--viz-2)', 'h')}
                  <text className="plot-label" x={mx} y={my} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--viz-2)', fontSize: 12.5 }}>
                    {g}
                  </text>
                </g>
              )
            })}
            {/* nodes */}
            {NODES.map((n) => {
              if (!visible(n)) return null
              const [cx, cy] = P[n.id]
              if (n.kind === 'leaf') {
                const on = req[n.id]
                return (
                  <g key={n.id}>
                    <rect x={cx - leafW / 2} y={cy - leafH / 2} width={leafW} height={leafH} rx={6} style={{ fill: on ? 'color-mix(in srgb, var(--viz-1) 16%, var(--surface))' : 'var(--surface-2)', stroke: on ? 'var(--viz-1)' : 'var(--viz-muted)', strokeWidth: on ? 2 : 1.3 }} />
                    <text x={cx} y={cy} dy="0.35em" textAnchor="middle" className="nnet-node-label" style={{ fontSize: 13 }}>
                      {n.name} = {n.value}
                    </text>
                    <text x={cx} y={narrow ? cy - leafH / 2 - 5 : n.v < 0 ? cy - leafH / 2 - 5 : cy + leafH / 2 + 13} textAnchor="middle" style={{ fontSize: 10.5, fontWeight: 700, fill: on ? 'var(--viz-1)' : 'var(--ink-3)' }}>
                      {on ? 'requires_grad' : 'data'}
                    </text>
                  </g>
                )
              }
              const rec = req[n.id]
              const lx = narrow ? cx + R + 6 : n.la === 'right' ? cx + 6 : cx
              const ly = narrow ? cy - 4 : cy - R - 22
              const anchor = narrow || n.la === 'right' ? 'start' : 'middle'
              return (
                <g key={n.id}>
                  <circle cx={cx} cy={cy} r={R} style={{ fill: rec ? 'var(--viz-ink)' : 'var(--surface)', stroke: rec ? 'var(--viz-ink)' : 'var(--viz-muted)', strokeWidth: 1.6, strokeDasharray: rec ? undefined : '4 3' }} />
                  <text x={cx} y={cy} dy="0.36em" textAnchor="middle" style={{ fontSize: 15, fontWeight: 800, fill: rec ? 'var(--surface)' : 'var(--ink-3)' }}>
                    {n.sym}
                  </text>
                  <text className="plot-label" x={lx} y={ly} textAnchor={anchor} style={{ fontSize: 12.5 }}>
                    {n.name} = {n.value}
                  </text>
                  <text x={lx} y={ly + 13} textAnchor={anchor} style={{ fontSize: 9.5, fontWeight: 600, fill: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                    {rec ? n.gradFn : 'grad_fn=None'}
                  </text>
                </g>
              )
            })}
            {step >= 4 && (
              <g>
                <rect x={P.L[0] - 26} y={P.L[1] - 15} width={52} height={30} rx={6} style={{ fill: 'color-mix(in srgb, var(--viz-2) 14%, var(--surface))', stroke: 'var(--viz-2)', strokeWidth: 2 }} />
                <text x={P.L[0]} y={P.L[1]} dy="0.35em" textAnchor="middle" className="nnet-node-label" style={{ fontSize: 13 }}>
                  L = 4
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      <PlayerControls player={player} label={(s) => `Step ${s + 1} of ${STEPS}`} />
      <div className={css.narr} aria-live="polite">
        {narration()}
      </div>
      {failed && <div className={css.err}>RuntimeError: element 0 of tensors does not require grad and does not have a grad_fn</div>}
      <div className={css.gradPanel} aria-label="The .grad attribute of each leaf">
        {(['w', 'b', 'x', 'y'] as const).map((id) => {
          const g = leafGrad(id)
          return (
            <span key={id} className={`${css.gradChip} ${g != null ? css.gradChipOn : ''}`}>
              {id}.grad = {g == null ? 'None' : fmtT(g)}
            </span>
          )
        })}
      </div>
    </Figure>
  )
}
