import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Slider, Toggle, Readout, Bars, usePlayer, PlayerControls, useContainerWidth, M } from '../../../../../kit'
import { comma } from '../big-o/format'
import s from '../big-o/algo.module.css'

/*
  The call tree of fib(n). Each circle is one function call, labelled with its argument k and
  coloured by k, so repeated subproblems share a colour. With memoisation on, every fib(k) after
  the first is a dashed "memo hit" leaf and the tree collapses to a chain. The player steps through
  the calls in the order Python makes them, showing the call stack.
*/

interface TNode {
  id: number
  k: number
  depth: number
  x: number
  kind: 'inner' | 'base' | 'hit'
  value: number
  children: TNode[]
  parent: TNode | null
  callAt: number
  retAt: number
}

interface Ev {
  node: TNode
  type: 'call' | 'return' | 'leaf'
}

const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

function build(n: number, memo: boolean) {
  let id = 0
  let leaf = 0
  const events: Ev[] = []
  const done = new Set<number>()
  const nodes: TNode[] = []
  const rec = (k: number, depth: number, parent: TNode | null): TNode => {
    const node: TNode = { id: id++, k, depth, x: 0, kind: 'inner', value: FIB[k], children: [], parent, callAt: 0, retAt: 0 }
    nodes.push(node)
    if (memo && done.has(k)) node.kind = 'hit'
    else if (k <= 1) node.kind = 'base'
    if (node.kind !== 'inner') {
      node.x = leaf++
      node.callAt = node.retAt = events.length
      events.push({ node, type: 'leaf' })
      return node
    }
    node.callAt = events.length
    events.push({ node, type: 'call' })
    node.children = [rec(k - 1, depth + 1, node), rec(k - 2, depth + 1, node)]
    node.x = (node.children[0].x + node.children[1].x) / 2
    node.retAt = events.length
    events.push({ node, type: 'return' })
    if (memo) done.add(k)
    return node
  }
  rec(n, 0, null)
  return { nodes, events, leaves: leaf, depth: Math.max(...nodes.map((d) => d.depth)) }
}

const COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)']
const colourOf = (k: number) => (k <= 1 ? 'var(--viz-muted)' : COLOURS[(k - 2) % COLOURS.length])
const naiveCalls = (n: number) => 2 * FIB[n + 1] - 1
const naiveCalls30 = 2692537 // 2 * fib(31) - 1, checked in Python

export default function FibRecursionTree() {
  const [ref, width] = useContainerWidth<HTMLDivElement>(600)
  const narrow = width < 520
  const maxN = narrow ? 6 : 7
  const [nRaw, setN] = useState(5)
  const n = Math.min(nRaw, maxN)
  const [memo, setMemo] = useState(false)
  const tree = useMemo(() => build(n, memo), [n, memo])
  const E = tree.events.length
  const player = usePlayer({ steps: E, interval: 700 })
  useEffect(() => {
    player.setStep(E - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, memo, E])
  const e = Math.min(player.step, E - 1)
  const ev = tree.events[e]
  const cur = ev.node

  const W = Math.max(280, Math.min(width, 680))
  const slot = W / tree.leaves
  const r = Math.max(8, Math.min(14, slot * 0.4))
  const gap = 46
  const H = tree.depth * gap + 2 * r + 8
  const px = (d: TNode) => (d.x + 0.5) * slot
  const py = (d: TNode) => r + 4 + d.depth * gap

  const stack: TNode[] = []
  for (let p: TNode | null = cur; p; p = p.parent) stack.unshift(p)

  const callsSoFar = tree.events.slice(0, e + 1).filter((x) => x.type !== 'return').length
  const totalCalls = tree.nodes.length
  const perK = Array.from({ length: n + 1 }, (_, k) => tree.nodes.filter((d) => d.k === k).length).reverse()

  let status: string
  if (ev.type === 'call') status = `Call fib(${cur.k}). It is not a base case, so it must first call fib(${cur.k - 1}) and then fib(${cur.k - 2}).`
  else if (ev.type === 'return') status = `fib(${cur.k}) returns fib(${cur.k - 1}) + fib(${cur.k - 2}) = ${FIB[cur.k - 1]} + ${FIB[cur.k - 2]} = ${cur.value}${memo ? `, and stores it in the memo` : ''}.`
  else if (cur.kind === 'hit') status = `fib(${cur.k}) is already in the memo: return ${cur.value} at once, no new calls.`
  else status = `fib(${cur.k}) is a base case: return ${cur.value} straight away.`
  if (e === E - 1) status += ` Done: fib(${n}) = ${FIB[n]} after ${totalCalls} calls.`

  return (
    <Figure
      title="The recursion tree of fib(n)"
      caption={
        <>
          Every circle is one call, labelled with its argument; circles of the same colour are the same subproblem being solved again.
          Press Restart and step through to see the order Python makes the calls and the call stack of calls still waiting for an answer.
          Then switch on memoisation: every repeat becomes a dashed "already know it" leaf, and the tree collapses into a chain of{' '}
          <M>2n - 1</M> calls.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Call tree of fib(${n}) ${memo ? 'with' : 'without'} memoisation: ${totalCalls} calls`} style={{ display: 'block', maxWidth: W }}>
          {tree.nodes.map((d) =>
            d.parent ? (
              <line
                key={`e${d.id}`}
                x1={px(d.parent)}
                y1={py(d.parent)}
                x2={px(d)}
                y2={py(d)}
                style={{ stroke: stack.includes(d) ? 'var(--viz-ink)' : 'var(--viz-axis)', strokeWidth: stack.includes(d) ? 2.5 : 1.2, opacity: d.callAt <= e ? 1 : 0.15 }}
              />
            ) : null,
          )}
          {tree.nodes.map((d) => {
            const seen = d.callAt <= e
            const c = colourOf(d.k)
            const isCur = d === cur
            const onStack = stack.includes(d)
            return (
              <g key={d.id} opacity={seen ? 1 : 0.15}>
                <circle
                  cx={px(d)}
                  cy={py(d)}
                  r={d.kind === 'hit' ? r * 0.85 : r}
                  style={{
                    fill: d.kind === 'hit' ? 'var(--surface)' : `color-mix(in srgb, ${c} ${d.retAt <= e ? 55 : 22}%, var(--surface))`,
                    stroke: isCur ? 'var(--viz-ink)' : c,
                    strokeWidth: isCur ? 3 : onStack ? 2.5 : 1.5,
                    strokeDasharray: d.kind === 'hit' ? '3 2' : undefined,
                  }}
                />
                <text x={px(d)} y={py(d)} dy="0.35em" textAnchor="middle" style={{ fontSize: r >= 11 ? 12 : 10, fontWeight: 800, fill: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
                  {d.k}
                </text>
              </g>
            )
          })}
        </svg>

        <div className={s.memRow}>
          <span className={s.cellLabel}>call stack (calls still waiting for an answer, oldest first)</span>
          <div className={s.cells}>
            {stack.map((d, i) => (
              <span key={d.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {i > 0 && <span className={s.muted}>→</span>}
                <span className={s.cell} style={{ height: '1.8rem', fontSize: '0.8rem', borderColor: colourOf(d.k), background: `color-mix(in srgb, ${colourOf(d.k)} 16%, var(--surface))` }}>
                  fib({d.k})
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className={s.verdict} aria-live="polite">
          {status}
        </div>
        <PlayerControls player={player} label={() => `calls so far: ${callsSoFar} of ${totalCalls}`} />
        <Controls>
          <Slider label={<>n</>} value={n} min={2} max={maxN} step={1} onChange={setN} />
          <Toggle label="Memoisation (remember answers)" checked={memo} onChange={setMemo} />
          <Readout
            items={[
              [`fib(${n})`, String(FIB[n])],
              ['calls without memo', String(naiveCalls(n))],
              ['calls with memo', String(2 * n - 1)],
            ]}
          />
        </Controls>
        <div style={{ width: '100%' }}>
          <div className={s.summaryHead} style={{ fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
            How many times each fib(k) is called {memo ? '(with memo: hits included)' : '(no memo)'}
          </div>
          <Bars
            ariaLabel="Number of calls for each argument k"
            max={FIB[n]}
            format={(v) => String(v)}
            data={perK.map((v, i) => {
              const k = n - i
              return { label: `fib(${k})`, value: v, color: colourOf(k) }
            })}
          />
          <div className={s.muted} style={{ marginTop: '0.35rem' }}>
            For <M>n = 30</M>: {comma(naiveCalls30)} calls without memoisation, 59 with it.
          </div>
        </div>
      </div>
    </Figure>
  )
}

