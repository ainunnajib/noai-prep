import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Toggle, usePlayer, PlayerControls, M } from '../../../../../kit'
import { GraphView, edgeKey, type EdgeChip } from './GraphView'
import { CLASSIC, LINE, NEURON, RELU, forward, fmt, localDeriv, localTex, nodeMap, opTex, OP_WORD, type Graph, type GNode } from './graphCore'

/*
  Pick an expression, set its inputs, and step the forward pass: each step computes one node,
  left to right. Toggle "local derivatives" to see the slope each node knows for each of its
  inputs. Tap a node to see its rule.
*/

const GRAPHS: Graph[] = [LINE, CLASSIC, NEURON, RELU]
const PARAMS: Record<string, string[]> = { line: ['w', 'b'], classic: [], neuron: ['w1', 'w2', 'b'], relu: ['w', 'b'] }
const MENU: Record<string, string> = {
  line: '(wx + b - y)^2',
  classic: '(x + y)\\,z',
  neuron: '\\sigma(w_1x_1 + w_2x_2 + b)',
  relu: '\\mathrm{ReLU}(wx + b)',
}

export default function GraphBuilderForward() {
  const [key, setKey] = useState('line')
  const graph = GRAPHS.find((g) => g.key === key) ?? LINE
  const [leaves, setLeaves] = useState<Record<string, Record<string, number>>>(() => Object.fromEntries(GRAPHS.map((g) => [g.key, { ...g.init }])))
  const [showLocal, setShowLocal] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const ops = graph.nodes.filter((n) => n.op)
  const player = usePlayer({ steps: ops.length + 1, interval: 1400 })
  const k = player.step
  const nodes = nodeMap(graph)
  const lv = leaves[key]
  const val = forward(graph, lv)

  const computed = new Set(ops.slice(0, k).map((n) => n.id))
  const shown: Record<string, number | undefined> = {}
  for (const n of graph.nodes) shown[n.id] = !n.op || computed.has(n.id) ? val[n.id] : undefined
  const current = k > 0 ? ops[k - 1] : null
  const focusId = picked && (computed.has(picked) || !nodes[picked]?.op) ? picked : current?.id ?? null
  const focus = focusId ? nodes[focusId] : null

  const chips: Record<string, EdgeChip | undefined> = {}
  if (showLocal) {
    for (const n of ops) {
      if (!computed.has(n.id)) continue
      ;(n.ins ?? []).forEach((i, j) => {
        const d = fmt(localDeriv(n, val, j)).replace('-', '−')
        chips[edgeKey(i, n.id)] = { text: d, tone: 'local', strong: n.id === focusId }
      })
    }
  }

  const choose = (g: string) => {
    setKey(g)
    setPicked(null)
    player.reset()
  }

  const localLine = (n: GNode, i: string, j: number) => {
    const sym = localTex(n, nodes, val, j)
    const num = fmt(localDeriv(n, val, j))
    return `\\tfrac{\\partial ${n.tex}}{\\partial ${nodes[i].tex}} = ${sym}${sym === num ? '' : ` = ${num}`}`
  }

  const outName = nodes[graph.out].tex
  const outDone = computed.has(graph.out)

  return (
    <Figure
      title="Build the graph, then run the forward pass"
      caption={
        <>
          Choose an expression and press <b>Next</b>: each step computes one circle from the values flowing into it, in the direction of the arrows. Turn on{' '}
          <b>local derivatives</b> to put each node's slope on its incoming arrows (purple chips), and tap any circle to see its rule. Change an input
          and every computed value updates at once.
        </>
      }
    >
      <Segmented
        label="Expression"
        value={key}
        onChange={choose}
        options={GRAPHS.map((g) => ({ value: g.key, label: <M>{MENU[g.key]}</M> }))}
      />
      <div style={{ fontSize: '1.05rem' }}>
        <M>{graph.formula}</M>
      </div>
      <GraphView
        graph={graph}
        values={shown}
        chips={chips}
        activeNodes={current ? [current.id] : []}
        activeEdges={current ? (current.ins ?? []).map((i) => edgeKey(i, current.id)) : []}
        selected={picked ?? undefined}
        onNodeClick={(id) => setPicked(id === picked ? null : id)}
        params={PARAMS[key]}
        ariaLabel={`Computational graph of ${graph.formula}; ${k} of ${ops.length} nodes computed`}
      />
      <div style={{ width: '100%', minHeight: '5.2em', fontSize: '0.95rem', lineHeight: 1.6 }}>
        <div style={{ fontWeight: 700, color: 'var(--ink-2)', fontSize: '0.9rem' }}>
          {k === 0 ? 'Inputs set' : outDone && k === ops.length ? 'Forward pass complete' : `Step ${k}: the ${OP_WORD[current!.op!]} node`}
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          {k === 0 ? (
            <>The boxes are the inputs; nothing else is known yet. Predict each ? before you press Next to compute the first circle.</>
          ) : (
            <>
              <M>{opTex(current!, nodes, val)}</M>
              {outDone && k === ops.length && (
                <>
                  {' '}
                  — every node now holds its value, and the output is <M>{`${outName} = ${fmt(val[graph.out])}`}</M>.
                </>
              )}
            </>
          )}
        </div>
        {focus && (showLocal || picked) && (
          <div style={{ marginTop: '0.35rem', overflowX: 'auto', overflowY: 'hidden', color: 'var(--ink-2)' }}>
            {focus.op ? (
              <>
                <span style={{ color: 'var(--viz-5)', fontWeight: 700 }}>Local derivatives of {focus.name}: </span>
                {(focus.ins ?? []).map((i, j) => (
                  <span key={i} style={{ marginRight: '1em', whiteSpace: 'nowrap' }}>
                    <M>{localLine(focus, i, j)}</M>
                  </span>
                ))}
              </>
            ) : (
              <>
                <b>{focus.name}</b> is an input (a leaf): nothing flows into it, so it has no local derivative of its own.
              </>
            )}
          </div>
        )}
      </div>
      <PlayerControls player={player} label={(s) => `${s} / ${ops.length} nodes computed`} />
      <Controls>
        {graph.nodes
          .filter((n) => !n.op)
          .map((n) => {
            const [lo, hi] = graph.range?.[n.id] ?? [-3, 3]
            return (
              <Slider
                key={n.id}
                label={n.name}
                value={lv[n.id]}
                min={lo}
                max={hi}
                step={0.5}
                onChange={(v) => setLeaves((s) => ({ ...s, [key]: { ...s[key], [n.id]: v } }))}
                format={(v) => fmt(v).replace('-', '−')}
              />
            )
          })}
        <Toggle label="Show local derivatives" checked={showLocal} onChange={setShowLocal} />
      </Controls>
    </Figure>
  )
}
