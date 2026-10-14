import { useId, useState } from 'react'
import { Figure, Controls, Slider, M, useContainerWidth } from '../../../../../kit'
import { fmt, sig } from './graphCore'
import css from './gates.module.css'

/*
  Five gates receive the same upstream gradient g from the right. Each one multiplies g by its
  local derivatives and sends the results back to its inputs (orange). Shared sliders let the
  learner compare: add copies g to every input, multiply swaps the input values, max routes g to
  the winner only, square scales by 2a, sigmoid scales by σ(1 − σ) ≤ 0.25.
*/

type GateId = 'add' | 'mul' | 'max' | 'sq' | 'sig'

interface GateInfo {
  id: GateId
  name: string
  motto: string
  symbol: string
  two: boolean
  out: (a: number, b: number) => number
  /** local derivatives with respect to a and b */
  local: (a: number, b: number) => [number, number]
  /** TeX for the local derivative w.r.t. a and b */
  localTex: (a: number, b: number) => [string, string]
}

const GATES: GateInfo[] = [
  { id: 'add', name: 'Add', motto: 'distributes', symbol: '+', two: true, out: (a, b) => a + b, local: () => [1, 1], localTex: () => ['1', '1'] },
  {
    id: 'mul',
    name: 'Multiply',
    motto: 'swaps',
    symbol: '×',
    two: true,
    out: (a, b) => a * b,
    local: (a, b) => [b, a],
    localTex: () => ['b', 'a'],
  },
  {
    id: 'max',
    name: 'Max',
    motto: 'routes',
    symbol: 'max',
    two: true,
    out: (a, b) => Math.max(a, b),
    local: (a, b) => (a >= b ? [1, 0] : [0, 1]),
    localTex: (a, b) => (a >= b ? ['1', '0'] : ['0', '1']),
  },
  { id: 'sq', name: 'Square', motto: 'scales by 2 × input', symbol: '( )²', two: false, out: (a) => a * a, local: (a) => [2 * a, 0], localTex: () => ['2a', ''] },
  {
    id: 'sig',
    name: 'Sigmoid',
    motto: 'scales by σ(1 − σ), at most ¼',
    symbol: 'σ',
    two: false,
    out: (a) => sig(a),
    local: (a) => [sig(a) * (1 - sig(a)), 0],
    localTex: () => ['\\sigma(a)\\,(1 - \\sigma(a))', ''],
  },
]

const u = (v: number) => fmt(v).replace('-', '−')
const pa = (v: number) => (v < 0 ? `(${fmt(v)})` : fmt(v))

function GateCard({ gate, a, b, g }: { gate: GateInfo; a: number; b: number; g: number }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(300)
  const uid = useId().replace(/:/g, '')
  const W = Math.max(260, Math.min(440, measured))
  const H = gate.two ? 128 : 84
  const midY = H / 2
  const boxW = 92
  const boxH = 42
  const bx = 2 + boxW / 2
  const cx = Math.round(Math.max(boxW + 62, W * 0.56))
  const r = 21
  const [la, lb] = gate.local(a, b)
  const ins: { name: string; v: number; y: number; grad: number; off: boolean }[] = gate.two
    ? [
        { name: 'a', v: a, y: 23, grad: g * la, off: gate.id === 'max' && la === 0 },
        { name: 'b', v: b, y: H - 23, grad: g * lb, off: gate.id === 'max' && lb === 0 },
      ]
    : [{ name: 'a', v: a, y: midY, grad: g * la, off: false }]
  const out = gate.out(a, b)
  const outEnd = W - 4

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="plot"
        role="img"
        aria-label={`${gate.name} gate: upstream gradient ${u(g)} sends ${ins.map((s) => `${u(s.grad)} to ${s.name}`).join(' and ')}`}
      >
        <defs>
          <marker id={`${uid}k`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0L10,5L0,10Z" style={{ fill: 'var(--viz-axis)' }} />
          </marker>
          <marker id={`${uid}o`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0L10,5L0,10Z" style={{ fill: 'var(--viz-2)' }} />
          </marker>
        </defs>
        {ins.map((s) => {
          // forward edge from the box to the gate, and the backward arrow just below/above it
          const x1 = bx + boxW / 2 + 2
          const dx = cx - x1
          const dy = midY - s.y
          const len = Math.hypot(dx, dy)
          const x2 = cx - (dx / len) * (r + 3)
          const y2 = midY - (dy / len) * (r + 3)
          const nx = -dy / len
          const ny = dx / len
          const sgn = s.y <= midY ? 1 : -1
          const ox = nx * 7 * sgn
          const oy = ny * 7 * sgn
          return (
            <g key={s.name}>
              <line x1={x1} y1={s.y} x2={x2} y2={y2} markerEnd={`url(#${uid}k)`} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
              <line
                x1={x2 + ox}
                y1={y2 + oy}
                x2={x1 + 3 + ox}
                y2={s.y + oy}
                markerEnd={`url(#${uid}o)`}
                style={{ stroke: 'var(--viz-2)', strokeWidth: 2.2, opacity: s.off ? 0.3 : 1, strokeDasharray: s.off ? '3 3' : undefined }}
              />
              <rect
                x={bx - boxW / 2}
                y={s.y - boxH / 2}
                width={boxW}
                height={boxH}
                rx={8}
                style={{ fill: 'var(--surface)', stroke: 'var(--viz-axis)', strokeWidth: 1.4 }}
              />
              <text x={bx} y={s.y - 4} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: 13, fontWeight: 700 }}>
                {`${s.name} = ${u(s.v)}`}
              </text>
              <text
                x={bx}
                y={s.y + 13}
                textAnchor="middle"
                className="tabular"
                style={{ fill: s.off ? 'var(--viz-muted)' : 'var(--viz-2)', fontSize: 12.5, fontWeight: 800 }}
              >
                {`∂L/∂${s.name} = ${u(s.grad)}`}
              </text>
            </g>
          )
        })}
        {/* gate */}
        <circle cx={cx} cy={midY} r={r} style={{ fill: 'color-mix(in srgb, var(--viz-5) 12%, var(--surface))', stroke: 'var(--viz-5)', strokeWidth: 2 }} />
        <text
          x={cx}
          y={midY + (gate.symbol.length > 2 ? 4 : 6)}
          textAnchor="middle"
          style={{ fill: 'var(--viz-ink)', fontSize: gate.symbol.length > 2 ? 11.5 : 18, fontWeight: 700 }}
        >
          {gate.symbol}
        </text>
        {/* output (forward) */}
        <line x1={cx + r + 2} y1={midY - 6} x2={outEnd} y2={midY - 6} markerEnd={`url(#${uid}k)`} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
        <text x={(cx + r + outEnd) / 2} y={midY - 13} textAnchor="middle" className="tabular plot-label" style={{ fontSize: 12.5 }}>
          {`out = ${u(out)}`}
        </text>
        {/* upstream gradient (backward) */}
        <line x1={outEnd} y1={midY + 7} x2={cx + r + 4} y2={midY + 7} markerEnd={`url(#${uid}o)`} style={{ stroke: 'var(--viz-2)', strokeWidth: 2.4 }} />
        <text x={(cx + r + outEnd) / 2} y={midY + 26} textAnchor="middle" className="tabular plot-label" style={{ fill: 'var(--viz-2)', fontSize: 12.5, fontWeight: 800 }}>
          {`g = ${u(g)}`}
        </text>
      </svg>
    </div>
  )
}

export default function GateRulesCards() {
  const [a, setA] = useState(2)
  const [b, setB] = useState(-1)
  const [g, setG] = useState(2)

  return (
    <Figure
      wide
      title="How each gate passes a gradient back"
      caption={
        <>
          All five gates receive the same upstream gradient <M>g</M> (orange, from the right) and the same inputs. Move the sliders and compare.
          Make <M>b</M> bigger than <M>a</M> and watch <b>max</b> switch which input gets the gradient. Push <M>a</M> to 3 and see how little
          gets through the <b>sigmoid</b>.
        </>
      }
    >
      <div className={css.legend}>
        <span>
          <span className={css.swatch} style={{ background: 'var(--viz-axis)' }} />
          forward: values flow right
        </span>
        <span>
          <span className={css.swatch} style={{ background: 'var(--viz-2)' }} />
          backward: gradients flow left
        </span>
      </div>
      <div className={css.grid}>
        {GATES.map((gate) => {
          const [la, lb] = gate.local(a, b)
          const [ta, tb] = gate.localTex(a, b)
          return (
            <section key={gate.id} className={css.card} aria-label={`${gate.name} gate`}>
              <div className={css.head}>
                <span className={css.name}>{gate.name}</span>
                <span className={css.motto}>{gate.motto}</span>
              </div>
              <GateCard gate={gate} a={a} b={b} g={g} />
              <div className={css.eq}>
                <div>
                  <M>{`\\tfrac{\\partial L}{\\partial a} = g \\times ${ta} = ${pa(g)} \\times ${pa(la)} = ${fmt(g * la)}`}</M>
                </div>
                {gate.two && (
                  <div>
                    <M>{`\\tfrac{\\partial L}{\\partial b} = g \\times ${tb} = ${pa(g)} \\times ${pa(lb)} = ${fmt(g * lb)}`}</M>
                  </div>
                )}
                {gate.id === 'sig' && (
                  <div>
                    <M>{`\\sigma(${fmt(a)}) = ${fmt(sig(a))},\\; \\text{local} = ${fmt(sig(a))} \\times ${fmt(1 - sig(a))} = ${fmt(la)}`}</M>
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
      <Controls>
        <Slider label="input a" value={a} min={-3} max={3} step={0.5} onChange={setA} format={u} />
        <Slider label="input b" value={b} min={-3} max={3} step={0.5} onChange={setB} format={u} />
        <Slider label="upstream gradient g" value={g} min={-3} max={3} step={0.5} onChange={setG} format={u} />
      </Controls>
    </Figure>
  )
}
