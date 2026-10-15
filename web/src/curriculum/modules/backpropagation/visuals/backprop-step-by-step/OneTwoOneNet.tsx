import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, M, useContainerWidth } from '../../../../../kit'
import { fmt } from '../computational-graphs/graphCore'

/*
  The worked 1-2-1 network of the lesson (x → two ReLU neurons → ŷ, squared error against y = 1).
  Lines are drawn in one neutral colour with each weight written on it, so colour never stands for a
  sign here. "Forward" adds every value; "Backward" adds every gradient (orange, like all gradients in
  this module). Every number is computed from the same formulas as the lesson's Steps.
*/

type Mode = 'weights' | 'forward' | 'backward'

const W1 = [1, -1]
const B1 = [-1, 1]
const V = [2, 3]
const C = 0.5
const Y = 1

const u = (v: number) => fmt(v).replace('-', '−')
const GRAD_FILL = 'color-mix(in srgb, var(--viz-2) 16%, var(--surface))'
const GRAD_TEXT = 'color-mix(in srgb, var(--viz-2) 70%, var(--ink))'

function compute(x: number) {
  const z = W1.map((w, j) => w * x + B1[j])
  const h = z.map((v) => Math.max(0, v))
  const yh = h[0] * V[0] + h[1] * V[1] + C
  const L = (yh - Y) ** 2
  const d = 2 * (yh - Y)
  const dv = h.map((hj) => hj * d)
  const dh = V.map((v) => v * d)
  const dz = dh.map((g, j) => (z[j] > 0 ? g : 0))
  const dw = dz.map((g) => x * g)
  return { z, h, yh, L, d, dv, dc: d, dh, dz, dw, db: dz }
}

export default function OneTwoOneNet() {
  const [mode, setMode] = useState<Mode>('weights')
  const [x, setX] = useState(2)
  const [ref, measured] = useContainerWidth<HTMLDivElement>(560)
  const W = Math.max(300, Math.min(640, measured))
  const narrow = W < 460
  const H = 250
  const r = narrow ? 19 : 22
  const P = {
    x: [narrow ? 30 : 60, H / 2],
    h0: [W / 2, 58],
    h1: [W / 2, H - 58],
    y: [W - (narrow ? 30 : 60), H / 2],
  } as Record<string, [number, number]>
  const c = compute(x)
  const showVals = mode !== 'weights'
  const back = mode === 'backward'
  const off = [c.z[0] <= 0, c.z[1] <= 0]
  const px = x < 0 ? `(${fmt(x)})` : fmt(x)

  // a label pill at the middle of an edge, nudged off the line
  const pill = (from: [number, number], to: [number, number], text: string, grad: boolean, key: string, side: 1 | -1) => {
    const mx = (from[0] + to[0]) / 2
    const my = (from[1] + to[1]) / 2 + side * 15
    const w = text.length * (narrow ? 6.6 : 7) + 12
    return (
      <g key={key}>
        <rect
          x={mx - w / 2}
          y={my - 10}
          width={w}
          height={20}
          rx={7}
          style={{ fill: grad ? GRAD_FILL : 'var(--surface)', stroke: grad ? 'var(--viz-2)' : 'var(--viz-axis)', strokeWidth: 1 }}
        />
        <text x={mx} y={my + 4.5} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: 12, fontWeight: 700 }}>
          {text}
        </text>
      </g>
    )
  }

  const edge = (a: string, b: string, dead: boolean) => {
    const [x1, y1] = P[a]
    const [x2, y2] = P[b]
    const len = Math.hypot(x2 - x1, y2 - y1)
    const ux = (x2 - x1) / len
    const uy = (y2 - y1) / len
    return (
      <line
        key={`${a}${b}`}
        x1={x1 + ux * r}
        y1={y1 + uy * r}
        x2={x2 - ux * r}
        y2={y2 - uy * r}
        style={{ stroke: 'var(--viz-axis)', strokeWidth: 2, strokeDasharray: dead && showVals ? '5 4' : undefined, opacity: dead && showVals ? 0.6 : 1 }}
      />
    )
  }

  const node = (id: string, name: string, dead: boolean) => {
    const [cx, cy] = P[id]
    return (
      <g key={id}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          style={{ fill: 'var(--surface)', stroke: 'var(--viz-ink)', strokeWidth: 1.6, strokeDasharray: dead && showVals ? '4 3' : undefined }}
        />
        <text x={cx} y={cy + 5} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 15, fontWeight: 700 }}>
          {name}
        </text>
      </g>
    )
  }

  // text beside a node: above for the top neuron, below for the bottom one, under the input and output
  const note = (id: string, lines: { t: string; grad?: boolean }[], where: 'above' | 'below') => {
    const [cx, cy] = P[id]
    const y0 = where === 'above' ? cy - r - 8 - (lines.length - 1) * 15 : cy + r + 16
    const anchor = id === 'x' ? 'start' : id === 'y' ? 'end' : 'middle'
    const tx = id === 'x' ? cx - r : id === 'y' ? cx + r : cx
    return (
      <g key={`n${id}`}>
        {lines.map((l, i) => (
          <text
            key={i}
            x={tx}
            y={y0 + i * 15}
            textAnchor={anchor}
            className="tabular"
            style={{ fill: l.grad ? GRAD_TEXT : 'var(--ink-2)', fontSize: 12, fontWeight: l.grad ? 800 : 600 }}
          >
            {l.t}
          </text>
        ))}
      </g>
    )
  }

  const hNotes = [0, 1].map((j) => {
    const id = `h${j}`
    const s = j === 0 ? '₁' : '₂'
    const lines: { t: string; grad?: boolean }[] = []
    if (mode === 'weights') lines.push({ t: `bias b${s} = ${u(B1[j])}` })
    if (mode === 'forward') lines.push({ t: narrow ? `h${s} = ${u(c.h[j])}` : `z${s} = ${u(c.z[j])}, h${s} = ${u(c.h[j])}${off[j] ? ' (off)' : ''}` })
    if (back) lines.push({ t: narrow ? `δ${s} = ${u(c.dz[j])}` : `δ${s} = ${u(c.dz[j])}, ∂L/∂b${s} = ${u(c.db[j])}`, grad: true })
    return note(id, lines, j === 0 ? 'above' : 'below')
  })

  const xNote = note('x', mode === 'weights' ? [{ t: 'input' }] : [{ t: `x = ${u(x)}` }], 'below')
  const yNote = note(
    'y',
    mode === 'weights'
      ? [{ t: narrow ? `c = ${u(C)}` : `bias c = ${u(C)}` }]
      : mode === 'forward'
        ? [{ t: `ŷ = ${u(c.yh)}` }, ...(narrow ? [] : [{ t: `L = ${u(c.L)}` }])]
        : [{ t: `δ = ${u(c.d)}`, grad: true }, ...(narrow ? [] : [{ t: `∂L/∂c = ${u(c.dc)}`, grad: true }])],
    'below',
  )

  // on phones the gradient pills carry only the number (the legend line under the picture says what they are)
  const wLab = (name: string, val: number, g: number) =>
    back ? { t: narrow ? u(g) : `∂L/∂${name} = ${u(g)}`, grad: true } : { t: `${name} = ${u(val)}`, grad: false }
  const labels = [
    { a: 'x', b: 'h0', ...wLab('w₁', W1[0], c.dw[0]), side: -1 as const },
    { a: 'x', b: 'h1', ...wLab('w₂', W1[1], c.dw[1]), side: 1 as const },
    { a: 'h0', b: 'y', ...wLab('v₁', V[0], c.dv[0]), side: -1 as const },
    { a: 'h1', b: 'y', ...wLab('v₂', V[1], c.dv[1]), side: 1 as const },
  ]

  const story =
    mode === 'weights' ? (
      <>
        Each line is one weight, written on the line. Each hidden neuron adds its bias and applies ReLU; the output adds <M>c</M> and has no
        activation. The target is <M>y = 1</M>.
      </>
    ) : mode === 'forward' ? (
      <>
        <M>{`z_1 = 1 \\times ${px} - 1 = ${fmt(c.z[0])}`}</M> and <M>{`z_2 = -1 \\times ${px} + 1 = ${fmt(c.z[1])}`}</M>, so{' '}
        <M>{`h_1 = ${fmt(c.h[0])}`}</M> and <M>{`h_2 = ${fmt(c.h[1])}`}</M>: ReLU keeps a positive <M>z</M> and turns a negative one into 0 (dashed:
        that neuron is off). Then <M>{`\\hat y = ${fmt(c.yh)}`}</M> and <M>{`L = (${fmt(c.yh)} - 1)^2 = ${fmt(c.L)}`}</M>.
      </>
    ) : (
      <>
        Start at the output: <M>{`\\delta = 2(\\hat y - y) = ${fmt(c.d)}`}</M>. Each orange number on a line is that weight's gradient: its input
        activation times the delta at its far end. Each <M>\delta</M> is <M>{'\\partial L / \\partial z'}</M> at a neuron, which is also its bias's
        gradient. Through a ReLU that is off the slope is 0, so everything behind it gets 0.
      </>
    )

  return (
    <Figure
      title="The 1-2-1 network, worked by hand"
      caption={
        <>
          The lines are all one colour: here the numbers do the talking. Switch between <b>Weights</b>, <b>Forward values</b> and{' '}
          <b>Backward gradients</b> and
          check each number against the steps below. Then slide <M>x</M> to <M>-2</M>: the other hidden neuron switches on, and the zero gradients
          move with it.
        </>
      }
    >
      <Segmented
        label="Show"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'weights', label: 'Weights' },
          { value: 'forward', label: 'Forward values' },
          { value: 'backward', label: 'Backward gradients' },
        ]}
      />
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label={`A 1-2-1 network with x = ${u(x)}. Showing ${mode}.`}>
          {edge('x', 'h0', off[0])}
          {edge('x', 'h1', off[1])}
          {edge('h0', 'y', off[0])}
          {edge('h1', 'y', off[1])}
          {labels.map((l) => pill(P[l.a], P[l.b], l.t, l.grad, `${l.a}${l.b}`, l.side))}
          {node('x', 'x', false)}
          {node('h0', 'h₁', off[0])}
          {node('h1', 'h₂', off[1])}
          {node('y', 'ŷ', false)}
          {hNotes}
          {xNote}
          {yNote}
        </svg>
      </div>
      {narrow && back && (
        <div style={{ width: '100%', fontSize: '0.84rem', color: 'var(--ink-2)' }}>
          <span style={{ color: GRAD_TEXT, fontWeight: 800 }}>Orange numbers on the lines</span> = <M>{'\\partial L / \\partial w'}</M> for that weight;{' '}
          <M>\delta</M> beside a neuron = <M>{'\\partial L / \\partial z'}</M> there.
        </div>
      )}
      <div style={{ width: '100%', minHeight: '4.8em', fontSize: '0.95rem', lineHeight: 1.6, overflowX: 'auto', overflowY: 'hidden' }} aria-live="polite">
        {story}
      </div>
      <Controls>
        <Slider label="input x" value={x} min={-3} max={3} step={0.5} onChange={setX} format={u} />
      </Controls>
    </Figure>
  )
}
