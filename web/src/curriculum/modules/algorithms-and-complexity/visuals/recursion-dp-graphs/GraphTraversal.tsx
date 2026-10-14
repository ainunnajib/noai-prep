import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Segmented, Readout, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import s from '../big-o/algo.module.css'
import d from './dp.module.css'

/*
  BFS and DFS on a small made-up neighbourhood map. The ONLY difference in the code is the data
  structure holding the frontier: a queue (first in, first out) for BFS, a stack (last in, first
  out) for DFS. Neighbours are always tried in the same fixed order. A node counts as "visited" when
  it is taken off the frontier; the search stops when the goal is visited.
*/

const NODES: Record<string, [number, number]> = {
  Home: [6, 32],
  MRT: [27, 12],
  Park: [27, 52],
  School: [50, 4],
  Mall: [50, 32],
  Hawker: [50, 60],
  Library: [73, 12],
  Clinic: [73, 52],
  Pool: [94, 32],
  Stadium: [94, 60],
}
const EDGES: [string, string][] = [
  ['Home', 'MRT'],
  ['Home', 'Park'],
  ['MRT', 'School'],
  ['MRT', 'Mall'],
  ['Park', 'Mall'],
  ['Park', 'Hawker'],
  ['School', 'Library'],
  ['Mall', 'Library'],
  ['Mall', 'Clinic'],
  ['Hawker', 'Clinic'],
  ['Library', 'Pool'],
  ['Clinic', 'Pool'],
  ['Clinic', 'Stadium'],
  ['Pool', 'Stadium'],
]
const ADJ: Record<string, string[]> = {}
for (const [a, b] of EDGES) {
  ;(ADJ[a] ??= []).push(b)
  ;(ADJ[b] ??= []).push(a)
}
const NAMES = Object.keys(NODES)

type Algo = 'bfs' | 'dfs'

interface Snap {
  current: string
  visited: string[]
  frontier: string[] // queue front→back, or stack bottom→top
  parent: Record<string, string | null>
  note: string
}

function run(algo: Algo, start: string, goal: string) {
  const snaps: Snap[] = []
  const parent: Record<string, string | null> = {}
  const visited: string[] = []
  const dist: Record<string, number> = { [start]: 0 }
  if (algo === 'bfs') {
    const queue = [start]
    parent[start] = null
    while (queue.length) {
      const u = queue.shift()!
      visited.push(u)
      const added: string[] = []
      if (u !== goal)
        for (const v of ADJ[u])
          if (!(v in parent)) {
            parent[v] = u
            dist[v] = dist[u] + 1
            queue.push(v)
            added.push(v)
          }
      snaps.push({
        current: u,
        visited: visited.slice(),
        frontier: queue.slice(),
        parent: { ...parent },
        note:
          u === goal
            ? `Take ${u} from the FRONT of the queue: it is the goal, so stop.`
            : `Take ${u} from the FRONT of the queue (distance ${dist[u]}). ${added.length ? `Add its new neighbours ${added.join(', ')} to the BACK.` : 'All its neighbours have been seen already.'}`,
      })
      if (u === goal) break
    }
  } else {
    const stack: [string, string | null][] = [[start, null]]
    const seen = new Set<string>()
    while (stack.length) {
      const [u, p] = stack.pop()!
      if (seen.has(u)) continue
      seen.add(u)
      parent[u] = p
      visited.push(u)
      const added: string[] = []
      if (u !== goal)
        for (const v of [...ADJ[u]].reverse())
          if (!seen.has(v)) {
            stack.push([v, u])
            added.unshift(v)
          }
      snaps.push({
        current: u,
        visited: visited.slice(),
        frontier: stack.map(([x]) => x),
        parent: { ...parent },
        note:
          u === goal
            ? `Pop ${u} from the TOP of the stack: it is the goal, so stop.`
            : `Pop ${u} from the TOP of the stack. ${added.length ? `Push its unvisited neighbours (${added.join(', ')}) so that ${added[0]} is on top and is explored next.` : 'Nothing new to push: back up to the next item on the stack.'}`,
      })
      if (u === goal) break
    }
  }
  const last = snaps[snaps.length - 1]
  const path: string[] = []
  if (last.current === goal) for (let x: string | null = goal; x; x = last.parent[x] ?? null) path.unshift(x)
  return { snaps, path, dist }
}

const LAYER = ['var(--viz-1)', 'var(--viz-5)', 'var(--viz-4)', 'var(--viz-2)', 'var(--viz-6)', 'var(--viz-3)']

export default function GraphTraversal() {
  const [algo, setAlgo] = useState<Algo>('bfs')
  const [start, setStart] = useState('Home')
  const [goal, setGoal] = useState('Stadium')
  const [clickSets, setClickSets] = useState<'goal' | 'start'>('goal')
  const res = useMemo(() => run(algo, start, goal), [algo, start, goal])
  const T = res.snaps.length
  const player = usePlayer({ steps: T, interval: 1000 })
  useEffect(() => {
    player.setStep(T - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algo, start, goal, T])
  const t = Math.min(player.step, T - 1)
  const snap = res.snaps[t]
  const done = t === T - 1
  const [ref, width] = useContainerWidth<HTMLDivElement>(600)

  const W = Math.max(290, Math.min(width, 620))
  const H = Math.round(W * 0.5) + 34
  const X = (x: number) => 24 + (x / 100) * (W - 48)
  const Y = (y: number) => 24 + (y / 64) * (H - 50)
  const r = 9

  const visitedIdx = (v: string) => snap.visited.indexOf(v)
  const inFrontier = (v: string) => snap.frontier.includes(v)
  const pathEdges = new Set<string>()
  if (done) for (let i = 1; i < res.path.length; i++) pathEdges.add([res.path[i - 1], res.path[i]].sort().join('|'))
  const treeEdge = (a: string, b: string) => snap.parent[b] === a || snap.parent[a] === b

  const nodeColour = (v: string) => {
    if (visitedIdx(v) < 0) return null
    return algo === 'bfs' ? LAYER[(res.dist[v] ?? 0) % LAYER.length] : 'var(--viz-1)'
  }

  const onNode = (v: string) => {
    if (clickSets === 'goal') {
      if (v !== start) setGoal(v)
    } else if (v !== goal) setStart(v)
  }

  return (
    <Figure
      title="Breadth-first versus depth-first search"
      caption={
        <>
          A made-up neighbourhood: places joined by paths. Press Restart, then Next, and watch the frontier (the places waiting to be visited).
          BFS takes from the front of a <b>queue</b>, so it visits places in rings of distance (colours) and its path to the goal has the fewest
          hops. DFS takes from the top of a <b>stack</b>, so it dives down one route and only backs up when stuck; it finds <i>a</i> path, not
          the shortest. Tap a place to move the goal (or the start).
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <Segmented
          label="Search"
          value={algo}
          onChange={setAlgo}
          options={[
            { value: 'bfs', label: 'BFS (queue)' },
            { value: 'dfs', label: 'DFS (stack)' },
          ]}
        />
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${algo.toUpperCase()} from ${start} to ${goal}; visited ${snap.visited.join(', ')}`} style={{ display: 'block', maxWidth: W }}>
          {EDGES.map(([a, b]) => {
            const onPath = pathEdges.has([a, b].sort().join('|'))
            const tree = treeEdge(a, b)
            return (
              <line
                key={a + b}
                x1={X(NODES[a][0])}
                y1={Y(NODES[a][1])}
                x2={X(NODES[b][0])}
                y2={Y(NODES[b][1])}
                style={{
                  stroke: onPath ? 'var(--viz-3)' : tree ? 'var(--viz-ink)' : 'var(--viz-axis)',
                  strokeWidth: onPath ? 6 : tree ? 2.4 : 1.2,
                  strokeOpacity: onPath ? 0.8 : tree ? 0.75 : 0.5,
                  strokeLinecap: 'round',
                }}
              />
            )
          })}
          {NAMES.map((v) => {
            const [x, y] = NODES[v]
            const c = nodeColour(v)
            const isCur = v === snap.current
            const fr = inFrontier(v) && visitedIdx(v) < 0
            const k = visitedIdx(v)
            const below = y > 40
            return (
              <g key={v} onClick={() => onNode(v)} style={{ cursor: 'pointer' }} role="button" aria-label={`${v}${v === start ? ' (start)' : ''}${v === goal ? ' (goal)' : ''}`}>
                <circle cx={X(x)} cy={Y(y)} r={r + 12} style={{ fill: 'transparent' }} />
                {(v === start || v === goal) && (
                  <circle cx={X(x)} cy={Y(y)} r={r + 5} style={{ fill: 'none', stroke: v === goal ? 'var(--viz-3)' : 'var(--viz-ink)', strokeWidth: 2, strokeDasharray: v === goal ? '3 2' : undefined }} />
                )}
                <circle
                  cx={X(x)}
                  cy={Y(y)}
                  r={r}
                  style={{
                    fill: c ? `color-mix(in srgb, ${c} 75%, var(--surface))` : 'var(--surface)',
                    stroke: isCur ? 'var(--viz-ink)' : fr ? 'var(--viz-2)' : c ?? 'var(--viz-axis)',
                    strokeWidth: isCur ? 3 : fr ? 2.5 : 1.5,
                    strokeDasharray: fr ? '3 2' : undefined,
                  }}
                />
                {k >= 0 && (
                  <text x={X(x)} y={Y(y)} dy="0.35em" textAnchor="middle" style={{ fontSize: 10, fontWeight: 800, fill: 'var(--surface)' }}>
                    {k + 1}
                  </text>
                )}
                <text
                  className="plot-label"
                  x={X(x)}
                  y={below ? Y(y) + r + 15 : Y(y) - r - 7}
                  textAnchor={x < 10 ? 'start' : x > 90 ? 'end' : 'middle'}
                  dx={x < 10 ? -8 : x > 90 ? 8 : 0}
                  style={{ fontSize: 12, fontWeight: v === start || v === goal ? 800 : 600 }}
                >
                  {v}
                  {v === start ? ' (start)' : v === goal ? ' (goal)' : ''}
                </text>
              </g>
            )
          })}
        </svg>

        {algo === 'bfs' && (
          <div className={s.row} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', gap: '0.3rem 0.8rem' }} aria-hidden="true">
            <span>colour = distance from {start}:</span>
            {LAYER.slice(0, 1 + Math.max(...snap.visited.map((v) => res.dist[v] ?? 0))).map((c, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 11, height: 11, borderRadius: 999, background: `color-mix(in srgb, ${c} 75%, var(--surface))` }} />
                {i}
              </span>
            ))}
          </div>
        )}

        <div className={s.memRow}>
          <span className={s.cellLabel}>{algo === 'bfs' ? 'queue (front → back): next to visit is on the LEFT' : 'stack (bottom → top): next to visit is on the RIGHT'}</span>
          <div className={d.queue}>
            {snap.frontier.length === 0 && <span className={s.muted}>empty</span>}
            {snap.frontier.map((v, i) => (
              <span key={i} className={d.chip} style={{ opacity: snap.visited.includes(v) ? 0.45 : 1, textDecoration: snap.visited.includes(v) ? 'line-through' : undefined }}>
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className={s.verdict} aria-live="polite">
          {snap.note}
          {done && res.path.length > 0 && (
            <>
              {' '}
              Path found: <b>{res.path.join(' → ')}</b> ({res.path.length - 1} hops).
            </>
          )}
        </div>
        <div className={d.order}>
          Visit order: <b>{snap.visited.map((v, i) => `${i + 1} ${v}`).join(', ')}</b>
        </div>
        <PlayerControls player={player} label={(k) => `Visit ${k + 1} of ${T}`} />
        <Controls>
          <Segmented
            label="Tapping a place sets the"
            value={clickSets}
            onChange={setClickSets}
            options={[
              { value: 'goal', label: 'goal' },
              { value: 'start', label: 'start' },
            ]}
          />
          <Readout
            items={[
              ['places visited', String(snap.visited.length)],
              ['path length', done && res.path.length ? `${res.path.length - 1} hops` : '…'],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
