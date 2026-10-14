import { useEffect, useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Segmented, usePlayer, PlayerControls, M } from '../../../../../kit'
import { GraphView, edgeKey, type EdgeChip } from '../computational-graphs/GraphView'
import { BRANCH, LINE, backward, fmt, forward, localTex, nodeMap, opTex, OP_WORD, pa, type Graph } from '../computational-graphs/graphCore'

/*
  The backward pass, one node at a time. After the forward pass, the gradient starts as
  ∂L/∂L = 1 at the loss and moves right to left: every step takes the upstream gradient at one
  node, multiplies it by that node's local derivative for each input, and hands the result back.
  The second graph uses x twice, so x receives two contributions that are added.
*/

const GRAPHS: Record<string, Graph> = { line: LINE, branch: BRANCH }
const PARAMS: Record<string, string[]> = { line: ['w', 'b'], branch: ['w1', 'w2'] }

export default function BackpropStepper() {
  const [key, setKey] = useState<'line' | 'branch'>('line')
  const graph = GRAPHS[key]
  const [leaves, setLeaves] = useState<Record<string, Record<string, number>>>(() => ({ line: { ...LINE.init }, branch: { ...BRANCH.init } }))
  const ops = graph.nodes.filter((n) => n.op)
  const n = ops.length
  const total = 2 * n + 3
  const player = usePlayer({ steps: total, interval: 1900 })
  const s = player.step
  const nodes = nodeMap(graph)
  const lv = leaves[key]
  const val = forward(graph, lv)
  const { grad, order, sends } = backward(graph, val)

  // open with the forward pass already done, ready for the backward pass
  useEffect(() => {
    player.setStep(n)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const fwdDone = Math.min(n, s)
  const seeded = s >= n + 1
  const bwdDone = s >= n + 2 ? Math.min(n, s - (n + 1)) : 0 // how many op nodes have sent their gradient back
  const isSummary = s === total - 1

  const computed = new Set(ops.slice(0, fwdDone).map((o) => o.id))
  const shown: Record<string, number | undefined> = {}
  for (const nd of graph.nodes) shown[nd.id] = !nd.op || computed.has(nd.id) ? val[nd.id] : undefined

  // consumers of each node (how many contributions it will receive)
  const consumers: Record<string, number> = {}
  for (const nd of graph.nodes) for (const i of nd.ins ?? []) consumers[i] = (consumers[i] ?? 0) + 1

  // gradients received so far
  const parts: Record<string, number[]> = {}
  for (let j = 0; j < bwdDone; j++) for (const c of sends[j]) (parts[c.to] ??= []).push(c.value)
  const grads: Record<string, number | undefined> = {}
  const gradText: Record<string, string | undefined> = {}
  if (seeded) grads[graph.out] = 1
  for (const [id, ps] of Object.entries(parts)) {
    const sum = ps.reduce((a, b) => a + b, 0)
    grads[id] = sum
    if ((consumers[id] ?? 0) > 1) {
      const txt = ps.map((p) => fmt(p)).join(' + ').replace(/-/g, '−')
      // short form (no "∂L/∂x =" prefix) so the running sum fits beside the branching edges
      gradText[id] = ps.length < consumers[id] ? `${txt} + …` : `${txt} = ${fmt(sum).replace('-', '−')}`
    }
  }

  const chips: Record<string, EdgeChip | undefined> = {}
  const backEdges: string[] = []
  for (let j = 0; j < bwdDone; j++)
    for (const c of sends[j]) {
      const k = edgeKey(c.to, c.node)
      backEdges.push(k)
      chips[k] = { text: `×${fmt(c.local)}`.replace('-', '−'), tone: 'local', strong: j === bwdDone - 1 && !isSummary }
    }

  const cur = bwdDone > 0 && !isSummary ? order[bwdDone - 1] : null
  const curFwd = s >= 1 && s <= n ? ops[s - 1] : null
  const activeNodes = cur ? [cur.id, ...(cur.ins ?? [])] : curFwd ? [curFwd.id] : s === n + 1 ? [graph.out] : []
  const activeEdges = cur ? (cur.ins ?? []).map((i) => edgeKey(i, cur.id)) : curFwd ? (curFwd.ins ?? []).map((i) => edgeKey(i, curFwd.id)) : []

  // ---- explanation for this step ----
  let title: string
  let body: ReactNode
  const outT = nodes[graph.out].tex
  if (s === 0) {
    title = 'Inputs'
    body = <>Only the inputs are known. The backward pass needs every node's value, so the forward pass always runs first: press Next.</>
  } else if (s <= n) {
    title = `Forward ${s}/${n}: the ${OP_WORD[curFwd!.op!]} node`
    body = (
      <>
        <M>{opTex(curFwd!, nodes, val)}</M>
        {s === n && <>. Forward pass done. Press Next to start the backward pass.</>}
      </>
    )
  } else if (s === n + 1) {
    title = 'Backward: start at the loss'
    body = (
      <>
        The gradient of the loss with respect to itself is <M>{`\\frac{\\partial ${outT}}{\\partial ${outT}} = 1`}</M>: nudging <M>{outT}</M> by 1 changes{' '}
        <M>{outT}</M> by 1. This is the first upstream gradient.
      </>
    )
  } else if (!isSummary) {
    const nd = cur!
    title = `Backward ${bwdDone}/${n}: through the ${OP_WORD[nd.op!]} node ${nd.name}`
    const up = grad[nd.id]
    body = (
      <>
        Upstream gradient arriving at <M>{nd.tex}</M>: <M>{`\\frac{\\partial ${outT}}{\\partial ${nd.tex}} = ${fmt(up)}`}</M>. Multiply by each local
        derivative and pass it back:
        {sends[bwdDone - 1].map((c) => {
          const inp = nodes[c.to]
          const multi = (consumers[c.to] ?? 0) > 1
          const soFar = (parts[c.to] ?? []).reduce((a, b) => a + b, 0)
          return (
            <div key={c.to} style={{ marginTop: '0.2rem' }}>
              <M>{`\\frac{\\partial ${outT}}{\\partial ${inp.tex}} ${multi ? '\\mathrel{+}=' : '='} \\underbrace{${pa(c.upstream)}}_{\\text{upstream}} \\times \\underbrace{${pa(c.local)}}_{\\text{local: } ${localTex(nd, nodes, val, c.k)}} = ${fmt(c.value)}`}</M>
              {multi && (
                <span style={{ color: 'var(--viz-2)', fontWeight: 700 }}>
                  {' '}
                  {(parts[c.to] ?? []).length < consumers[c.to]
                    ? `(${inp.name} is used twice: more is still to come)`
                    : `(second path: running total ${fmt(soFar).replace('-', '−')})`}
                </span>
              )}
            </div>
          )
        })}
      </>
    )
  } else {
    title = 'Done: every gradient in one backward sweep'
    if (key === 'line') {
      const e = val.e
      body = (
        <>
          <M>{`\\frac{\\partial L}{\\partial w} = ${fmt(grad.w)},\\ \\frac{\\partial L}{\\partial b} = ${fmt(grad.b)}`}</M> (and{' '}
          <M>{`\\frac{\\partial L}{\\partial x} = ${fmt(grad.x)},\\ \\frac{\\partial L}{\\partial y} = ${fmt(grad.y)}`}</M>). Each is a product of the local
          derivatives along its path, which is the chain rule:{' '}
          <M>{`\\frac{\\partial L}{\\partial w} = 2e \\cdot 1 \\cdot 1 \\cdot x = ${pa(2 * e)} \\times ${pa(lv.x)} = ${fmt(grad.w)}`}</M>.
        </>
      )
    } else {
      const sw = lv.w1 + lv.w2
      const ps = (parts.x ?? []).map((p) => fmt(p))
      body = (
        <>
          <M>x</M> fed two nodes, so its gradient is the <b>sum</b> of what came back along each path:{' '}
          <M>{`\\frac{\\partial L}{\\partial x} = ${ps.join(' + ')} = ${fmt(grad.x)}`}</M>. Check with ordinary algebra: <M>{`L = (x(w_1 + w_2) - y)^2`}</M>, so{' '}
          <M>{`\\frac{dL}{dx} = 2e\\,(w_1 + w_2) = ${pa(2 * val.e)} \\times ${pa(sw)} = ${fmt(2 * val.e * sw)}`}</M>.
        </>
      )
    }
  }

  const stepLabel = (k: number) => (k <= n ? `forward ${k}/${n}` : k === n + 1 ? 'seed ∂L/∂L = 1' : k < total - 1 ? `backward ${k - n - 1}/${n}` : 'summary')

  return (
    <Figure
      title="Backpropagation, one node at a time"
      caption={
        <>
          It opens with the forward pass done. Press <b>Next</b> to send the gradient back: each step takes the upstream gradient (orange pill) at one
          node, multiplies it by the local derivative on each incoming edge (purple chip) and hands the result to that input. Switch to{' '}
          <b>x used twice</b> to see a value collect two gradients that add up. Change the inputs and every number updates.
        </>
      }
    >
      <Segmented
        label="Graph"
        value={key}
        onChange={(v) => setKey(v)}
        options={[
          { value: 'line', label: <M>{'(wx + b - y)^2'}</M> },
          { value: 'branch', label: <>x used twice</> },
        ]}
      />
      <div style={{ fontSize: '1.05rem' }}>
        <M>{graph.formula}</M>
      </div>
      <GraphView
        graph={graph}
        values={shown}
        grads={grads}
        gradText={gradText}
        chips={chips}
        activeNodes={activeNodes}
        activeEdges={activeEdges}
        backEdges={backEdges}
        params={PARAMS[key]}
        ariaLabel={`Computational graph of ${graph.formula}. ${title}`}
      />
      <div style={{ width: '100%', minHeight: '7.5em', fontSize: '0.95rem', lineHeight: 1.6 }} aria-live="polite">
        <div style={{ fontWeight: 700, color: 'var(--ink-2)', fontSize: '0.9rem' }}>{title}</div>
        <div style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '0.2rem' }}>{body}</div>
      </div>
      <PlayerControls player={player} label={stepLabel} />
      <Controls>
        {graph.nodes
          .filter((nd) => !nd.op)
          .map((nd) => {
            const [lo, hi] = graph.range?.[nd.id] ?? [-3, 3]
            return (
              <Slider
                key={nd.id}
                label={nd.name}
                value={lv[nd.id]}
                min={lo}
                max={hi}
                step={0.5}
                onChange={(v) => setLeaves((st) => ({ ...st, [key]: { ...st[key], [nd.id]: v } }))}
                format={(v) => fmt(v).replace('-', '−')}
              />
            )
          })}
      </Controls>
    </Figure>
  )
}
