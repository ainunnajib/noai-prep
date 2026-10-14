/*
  Tiny computational-graph engine shared by the visuals of the "computational-graphs" and
  "backprop-step-by-step" lessons. A graph is a list of nodes in topological order (every node
  comes after its inputs). Leaves hold numbers; op nodes compute one elementary operation.
  The same code computes the forward values, each edge's local derivative and the backward pass,
  so every number on screen comes from the rules the lessons teach.
*/

export type Op = 'add' | 'sub' | 'mul' | 'sq' | 'sig' | 'max' | 'relu'

export interface GNode {
  id: string
  /** label drawn in the SVG (Unicode, e.g. 'ŷ', 'x₁') */
  name: string
  /** the same name in TeX for explanations (e.g. '\\hat y', 'x_1') */
  tex: string
  op?: Op
  /** ids of the inputs, in order (order matters for subtraction) */
  ins?: string[]
  /** column (0 = leftmost) and row (can be fractional) for the drawing */
  d: number
  lane: number
  /** optional position overrides for the top-to-bottom phone layout */
  vd?: number
  vlane?: number
  /** phone layout: which side of an op circle its labels go (default left) */
  vside?: 'left' | 'right'
}

export interface Graph {
  key: string
  /** the whole expression in TeX */
  formula: string
  nodes: GNode[]
  /** id of the final output node */
  out: string
  /** default values of the leaves */
  init: Record<string, number>
  /** slider range for each leaf */
  range?: Record<string, [number, number]>
}

export const sig = (z: number) => 1 / (1 + Math.exp(-z))

export const OP_LABEL: Record<Op, string> = {
  add: '+',
  sub: '−',
  mul: '×',
  sq: '( )²',
  sig: 'σ',
  max: 'max',
  relu: 'ReLU',
}

export const OP_WORD: Record<Op, string> = {
  add: 'add',
  sub: 'subtract',
  mul: 'multiply',
  sq: 'square',
  sig: 'sigmoid',
  max: 'max',
  relu: 'ReLU',
}

export const isLeaf = (n: GNode) => !n.op

export function nodeMap(g: Graph): Record<string, GNode> {
  const m: Record<string, GNode> = {}
  for (const n of g.nodes) m[n.id] = n
  return m
}

/** Evaluate one op on its input values. */
export function apply(op: Op, v: number[]): number {
  switch (op) {
    case 'add':
      return v.reduce((s, t) => s + t, 0)
    case 'sub':
      return v[0] - v[1]
    case 'mul':
      return v.reduce((s, t) => s * t, 1)
    case 'sq':
      return v[0] * v[0]
    case 'sig':
      return sig(v[0])
    case 'max':
      return Math.max(...v)
    case 'relu':
      return Math.max(0, v[0])
  }
}

/** Forward pass: values of every node. */
export function forward(g: Graph, leaves: Record<string, number>): Record<string, number> {
  const val: Record<string, number> = {}
  for (const n of g.nodes) {
    if (!n.op) val[n.id] = leaves[n.id] ?? g.init[n.id] ?? 0
    else val[n.id] = apply(n.op, (n.ins ?? []).map((i) => val[i]))
  }
  return val
}

/** Local derivative ∂(node)/∂(input number k), evaluated at the current values. */
export function localDeriv(n: GNode, val: Record<string, number>, k: number): number {
  const ins = (n.ins ?? []).map((i) => val[i])
  switch (n.op) {
    case 'add':
      return 1
    case 'sub':
      return k === 0 ? 1 : -1
    case 'mul':
      return ins.reduce((s, t, j) => (j === k ? s : s * t), 1)
    case 'sq':
      return 2 * ins[0]
    case 'sig': {
      const a = sig(ins[0])
      return a * (1 - a)
    }
    case 'max': {
      const m = Math.max(...ins)
      return ins.indexOf(m) === k ? 1 : 0
    }
    case 'relu':
      return ins[0] > 0 ? 1 : 0
    default:
      return 0
  }
}

/** The local derivative as a formula in TeX (symbolic), e.g. 'x' for ∂(w·x)/∂w. */
export function localTex(n: GNode, nodes: Record<string, GNode>, val: Record<string, number>, k: number): string {
  const ins = (n.ins ?? []).map((i) => nodes[i])
  switch (n.op) {
    case 'add':
      return '1'
    case 'sub':
      return k === 0 ? '1' : '-1'
    case 'mul':
      return ins.filter((_, j) => j !== k).map((m) => m.tex).join(' \\times ')
    case 'sq':
      return `2${ins[0].tex}`
    case 'sig':
      return `${n.tex}(1 - ${n.tex})`
    case 'max': {
      const vals = ins.map((m) => val[m.id])
      const win = vals.indexOf(Math.max(...vals)) === k
      return win ? '1 \\;(\\text{the larger input})' : '0 \\;(\\text{not the larger})'
    }
    case 'relu':
      return val[ins[0].id] > 0 ? `1 \\;(${ins[0].tex} > 0)` : `0 \\;(${ins[0].tex} \\le 0)`
    default:
      return ''
  }
}

/** Number → short display string (≤ 3 decimals, trailing zeros trimmed). */
export function fmt(v: number, dp = 3): string {
  if (!Number.isFinite(v)) return '?'
  const r = Math.round(v * 10 ** dp) / 10 ** dp
  const s = (Object.is(r, -0) ? 0 : r).toFixed(dp).replace(/\.?0+$/, '')
  return s === '-0' ? '0' : s
}

/** For SVG text: use a true minus sign. */
export const fmtU = (v: number, dp = 3) => fmt(v, dp).replace('-', '−')

/** For TeX: wrap negatives in brackets. */
export const pa = (v: number, dp = 3) => (fmt(v, dp).startsWith('-') ? `(${fmt(v, dp)})` : fmt(v, dp))

/** "p = w \times x = 2 \times 3 = 6" for an op node. */
export function opTex(n: GNode, nodes: Record<string, GNode>, val: Record<string, number>): string {
  const ins = (n.ins ?? []).map((i) => nodes[i])
  const t = ins.map((m) => m.tex)
  const v = ins.map((m) => val[m.id])
  const out = fmt(val[n.id])
  switch (n.op) {
    case 'add':
      return `${n.tex} = ${t.join(' + ')} = ${v.map((x, j) => (j ? pa(x) : fmt(x))).join(' + ')} = ${out}`
    case 'sub':
      return `${n.tex} = ${t[0]} - ${t[1]} = ${fmt(v[0])} - ${pa(v[1])} = ${out}`
    case 'mul':
      return `${n.tex} = ${t.join(' \\times ')} = ${v.map((x, j) => (j ? pa(x) : fmt(x))).join(' \\times ')} = ${out}`
    case 'sq':
      return `${n.tex} = ${t[0]}^2 = ${pa(v[0])}^2 = ${out}`
    case 'sig':
      return `${n.tex} = \\sigma(${t[0]}) = \\dfrac{1}{1 + e^{-${t[0]}}} = \\sigma(${fmt(v[0])}) \\approx ${out}`
    case 'max':
      return `${n.tex} = \\max(${t.join(', ')}) = \\max(${v.map((x) => fmt(x)).join(', ')}) = ${out}`
    case 'relu':
      return `${n.tex} = \\mathrm{ReLU}(${t[0]}) = \\max(0, ${fmt(v[0])}) = ${out}`
    default:
      return ''
  }
}

export interface Contribution {
  /** the op node that sends gradient back */
  node: string
  /** the input receiving it */
  to: string
  /** input index k */
  k: number
  upstream: number
  local: number
  value: number
}

/**
 * Backward pass. Returns ∂out/∂(every node) and, per op node (in backward order), the
 * contributions it sends to its inputs (upstream × local). Inputs used by several nodes
 * receive several contributions, which are added.
 */
export function backward(g: Graph, val: Record<string, number>) {
  const grad: Record<string, number> = {}
  for (const n of g.nodes) grad[n.id] = 0
  grad[g.out] = 1
  const order = g.nodes.filter((n) => n.op).reverse()
  const sends: Contribution[][] = []
  for (const n of order) {
    const list: Contribution[] = []
    ;(n.ins ?? []).forEach((i, k) => {
      const local = localDeriv(n, val, k)
      const value = grad[n.id] * local
      grad[i] += value
      list.push({ node: n.id, to: i, k, upstream: grad[n.id], local, value })
    })
    sends.push(list)
  }
  return { grad, order, sends }
}

/* ---------------------------- the graphs used in the lessons ---------------------------- */

/** L = (w·x + b − y)²: squared error of a one-input linear model. */
export const LINE: Graph = {
  key: 'line',
  formula: 'L = (wx + b - y)^2',
  nodes: [
    { id: 'w', name: 'w', tex: 'w', d: 0, lane: 0 },
    { id: 'x', name: 'x', tex: 'x', d: 0, lane: 1 },
    { id: 'p', name: 'p', tex: 'p', op: 'mul', ins: ['w', 'x'], d: 1, lane: 0.5 },
    { id: 'b', name: 'b', tex: 'b', d: 1, lane: 1.55 },
    { id: 'yh', name: 'ŷ', tex: '\\hat y', op: 'add', ins: ['p', 'b'], d: 2, lane: 0.5 },
    { id: 'y', name: 'y', tex: 'y', d: 2, lane: 1.55 },
    { id: 'e', name: 'e', tex: 'e', op: 'sub', ins: ['yh', 'y'], d: 3, lane: 0.5 },
    { id: 'L', name: 'L', tex: 'L', op: 'sq', ins: ['e'], d: 4, lane: 0.5 },
  ],
  out: 'L',
  init: { w: 2, x: 3, b: 1, y: 5 },
  range: { w: [-3, 3], x: [-3, 3], b: [-3, 3], y: [-5, 10] },
}

/** f = (x + y)·z: the classic first example. */
export const CLASSIC: Graph = {
  key: 'classic',
  formula: 'f = (x + y)\\,z',
  nodes: [
    { id: 'x', name: 'x', tex: 'x', d: 0, lane: 0 },
    { id: 'y', name: 'y', tex: 'y', d: 0, lane: 1 },
    { id: 'q', name: 'q', tex: 'q', op: 'add', ins: ['x', 'y'], d: 1, lane: 0.5 },
    { id: 'z', name: 'z', tex: 'z', d: 1, lane: 1.55 },
    { id: 'f', name: 'f', tex: 'f', op: 'mul', ins: ['q', 'z'], d: 2, lane: 0.5 },
  ],
  out: 'f',
  init: { x: -2, y: 5, z: -4 },
  range: { x: [-5, 5], y: [-5, 5], z: [-5, 5] },
}

/** a = σ(w₁x₁ + w₂x₂ + b): a sigmoid neuron with two inputs. */
export const NEURON: Graph = {
  key: 'neuron',
  formula: 'a = \\sigma(w_1 x_1 + w_2 x_2 + b)',
  nodes: [
    { id: 'w1', name: 'w₁', tex: 'w_1', d: 0, lane: 0 },
    { id: 'x1', name: 'x₁', tex: 'x_1', d: 0, lane: 1 },
    { id: 'w2', name: 'w₂', tex: 'w_2', d: 0, lane: 2 },
    { id: 'x2', name: 'x₂', tex: 'x_2', d: 0, lane: 3 },
    { id: 'p1', name: 'p₁', tex: 'p_1', op: 'mul', ins: ['w1', 'x1'], d: 1, lane: 0.5 },
    { id: 'p2', name: 'p₂', tex: 'p_2', op: 'mul', ins: ['w2', 'x2'], d: 1, lane: 2.5 },
    { id: 'b', name: 'b', tex: 'b', d: 1, lane: 3.55 },
    { id: 'z', name: 'z', tex: 'z', op: 'add', ins: ['p1', 'p2', 'b'], d: 2, lane: 1.5 },
    { id: 'a', name: 'a', tex: 'a', op: 'sig', ins: ['z'], d: 3, lane: 1.5 },
  ],
  out: 'a',
  init: { w1: 1, x1: 2, w2: -1, x2: 1, b: -1 },
  range: { w1: [-3, 3], x1: [-3, 3], w2: [-3, 3], x2: [-3, 3], b: [-3, 3] },
}

/** a = ReLU(w·x + b): a ReLU neuron. */
export const RELU: Graph = {
  key: 'relu',
  formula: 'a = \\mathrm{ReLU}(wx + b)',
  nodes: [
    { id: 'w', name: 'w', tex: 'w', d: 0, lane: 0 },
    { id: 'x', name: 'x', tex: 'x', d: 0, lane: 1 },
    { id: 'p', name: 'p', tex: 'p', op: 'mul', ins: ['w', 'x'], d: 1, lane: 0.5 },
    { id: 'b', name: 'b', tex: 'b', d: 1, lane: 1.55 },
    { id: 'z', name: 'z', tex: 'z', op: 'add', ins: ['p', 'b'], d: 2, lane: 0.5 },
    { id: 'a', name: 'a', tex: 'a', op: 'relu', ins: ['z'], d: 3, lane: 0.5 },
  ],
  out: 'a',
  init: { w: 1, x: 2, b: -1 },
  range: { w: [-3, 3], x: [-3, 3], b: [-3, 3] },
}

/** L = (w₁x + w₂x − y)²: the input x is used twice (it feeds two multiply nodes). */
export const BRANCH: Graph = {
  key: 'branch',
  formula: 'L = (w_1 x + w_2 x - y)^2',
  nodes: [
    { id: 'w1', name: 'w₁', tex: 'w_1', d: 0, lane: 0 },
    { id: 'x', name: 'x', tex: 'x', d: 0, lane: 1.25 },
    { id: 'w2', name: 'w₂', tex: 'w_2', d: 0, lane: 2.5 },
    { id: 'u1', name: 'u₁', tex: 'u_1', op: 'mul', ins: ['w1', 'x'], d: 1, lane: 0.4, vlane: 0.85 },
    { id: 'u2', name: 'u₂', tex: 'u_2', op: 'mul', ins: ['w2', 'x'], d: 1, lane: 2.1, vlane: 1.65, vside: 'right' },
    { id: 's', name: 'ŷ', tex: '\\hat y', op: 'add', ins: ['u1', 'u2'], d: 2, lane: 1.25 },
    { id: 'y', name: 'y', tex: 'y', d: 2, lane: 2.4 },
    { id: 'e', name: 'e', tex: 'e', op: 'sub', ins: ['s', 'y'], d: 3, lane: 1.25 },
    { id: 'L', name: 'L', tex: 'L', op: 'sq', ins: ['e'], d: 4, lane: 1.25 },
  ],
  out: 'L',
  init: { w1: 1, x: 2, w2: 3, y: 5 },
  range: { w1: [-3, 3], x: [-3, 3], w2: [-3, 3], y: [-5, 10] },
}
