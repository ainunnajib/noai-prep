import { useMemo, useState } from 'react'
import { Figure, Controls, Segmented, Button, Plot, Grid, Axes, Rect, Dots, Path, Label, DraggablePoint, usePlot, useNarrow, useContainerWidth } from '../../../../../kit'
import { FLAT_X, FLAT_Y } from './data'
import { impurityOf, bestSplit, type ClfCriterion } from './cart'
import s from './trees.module.css'

/*
  Build a decision tree by hand on 32 HDB flats (floor area, remaining lease → sold for ≥ $600k?).
  The learner picks a leaf, drags a vertical or horizontal threshold, reads the impurity of both
  sides and the information gain, can ask for the greedy best split, and commits it. The plot and
  the tree diagram are two views of the same tree.
*/

type Box = [number, number, number, number] // x0, x1, y0, y1
interface BNode {
  rows: number[]
  box: Box
  depth: number
  split?: { f: number; t: number }
  kids?: [number, number]
}
interface Cand {
  f: number
  t: number
}

const BOX: Box = [60, 130, 44, 96]
const MAX_DEPTH = 3
const FEAT = ['area', 'lease']
const ALL = FLAT_Y.map((_, i) => i)
const START: BNode[] = [{ rows: ALL, box: BOX, depth: 0 }]
const START_CAND: Cand = { f: 0, t: 92.5 }
const SHAPE = ['circle', 'square'] as const
const CLASS_COLOR = ['var(--viz-1)', 'var(--viz-2)']

const countsOf = (rows: number[]) => {
  const c = [0, 0]
  for (const i of rows) c[FLAT_Y[i]]++
  return c
}
const fmtT = (t: number) => (Number.isInteger(t) ? String(t) : t.toFixed(1))
const unit = (f: number) => (f === 0 ? ' m²' : ' yrs')

/** thresholds snap to k + 0.5 so a line never sits on a data point */
function snapT(v: number, f: number, box: Box) {
  const lo = f === 0 ? box[0] : box[2]
  const hi = f === 0 ? box[1] : box[3]
  let tmin = Math.floor(lo) + 0.5
  if (tmin <= lo) tmin += 1
  let tmax = Math.ceil(hi) - 0.5
  if (tmax >= hi) tmax -= 1
  return Math.min(tmax, Math.max(tmin, Math.round(v - 0.5) + 0.5))
}
const midCand = (nd: BNode, f: number): Cand => ({ f, t: snapT(f === 0 ? (nd.box[0] + nd.box[1]) / 2 : (nd.box[2] + nd.box[3]) / 2, f, nd.box) })
const splittable = (nd: BNode) => !nd.kids && nd.depth < MAX_DEPTH && impurityOf(countsOf(nd.rows), 'gini') > 0

function tint(c: number[]) {
  const n = c[0] + c[1]
  if (!n) return 'var(--surface)'
  const p = c[1] / n
  const strength = Math.round(7 + 21 * Math.abs(p - 0.5) * 2)
  return `color-mix(in srgb, ${p > 0.5 ? 'var(--viz-2)' : 'var(--viz-1)'} ${strength}%, var(--surface))`
}

/** outline of the selected leaf, drawn in screen pixels */
function Outline({ box }: { box: Box }) {
  const { xs, ys } = usePlot()
  const x = xs(box[0])
  const y = ys(box[3])
  return (
    <rect
      x={x + 1.5}
      y={y + 1.5}
      width={Math.max(0, xs(box[1]) - x - 3)}
      height={Math.max(0, ys(box[2]) - y - 3)}
      rx={3}
      style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2.5 }}
    />
  )
}

/* ---------- tree diagram ---------- */

interface VNode {
  key: string
  id?: number
  depth: number
  kind: 'split' | 'leaf' | 'ghost'
  c: number[]
  label?: string
  kids: VNode[]
  x?: number
}

function TreeDiagram({ nodes, sel, ghost, onSelect }: { nodes: BNode[]; sel: number; ghost: { yes: number[]; no: number[] } | null; onSelect: (id: number) => void }) {
  const [ref, width] = useContainerWidth<HTMLDivElement>(320)
  const W = Math.max(240, width)
  const build = (id: number): VNode => {
    const nd = nodes[id]
    const c = countsOf(nd.rows)
    if (nd.kids && nd.split)
      return { key: `n${id}`, id, depth: nd.depth, kind: 'split', c, label: `${FEAT[nd.split.f]} ≤ ${fmtT(nd.split.t)}`, kids: [build(nd.kids[0]), build(nd.kids[1])] }
    const v: VNode = { key: `n${id}`, id, depth: nd.depth, kind: 'leaf', c, kids: [] }
    if (id === sel && ghost)
      v.kids = [
        { key: 'gy', depth: nd.depth + 1, kind: 'ghost', c: countsOf(ghost.yes), kids: [] },
        { key: 'gn', depth: nd.depth + 1, kind: 'ghost', c: countsOf(ghost.no), kids: [] },
      ]
    return v
  }
  const root = build(0)
  const leaves: VNode[] = []
  let maxDepth = 0
  const collect = (v: VNode) => {
    maxDepth = Math.max(maxDepth, v.depth)
    if (!v.kids.length) leaves.push(v)
    v.kids.forEach(collect)
  }
  collect(root)
  const slot = W / leaves.length
  leaves.forEach((v, i) => (v.x = (i + 0.5) * slot))
  const place = (v: VNode): number => {
    if (v.kids.length) v.x = v.kids.map(place).reduce((a, b) => a + b, 0) / v.kids.length
    return v.x!
  }
  place(root)
  const nodeH = 26
  const gap = 56
  const pad = 6
  const H = pad * 2 + nodeH + Math.max(1, maxDepth) * gap
  const yOf = (d: number) => pad + d * gap
  const fs = W < 330 ? 11 : 12
  const leafW = Math.max(34, Math.min(60, slot - 6))
  const leafSpan = (v: VNode): number => (v.kids.length ? v.kids.map(leafSpan).reduce((a, b) => a + b, 0) : 1)

  const items: JSX.Element[] = []
  const edges: JSX.Element[] = []
  const draw = (v: VNode) => {
    const x = v.x!
    const y = yOf(v.depth)
    v.kids.forEach((k, j) => {
      const ghostEdge = k.kind === 'ghost'
      const x2 = k.x!
      const y2 = yOf(k.depth)
      edges.push(
        <line
          key={`e${k.key}`}
          x1={x}
          y1={y + nodeH}
          x2={x2}
          y2={y2}
          style={{ stroke: ghostEdge ? 'var(--viz-3)' : 'var(--viz-axis)', strokeWidth: ghostEdge ? 2 : 1.5, strokeDasharray: ghostEdge ? '5 4' : undefined }}
        />,
      )
      const mx = x + (x2 - x) * 0.5
      const my = y + nodeH + (y2 - y - nodeH) * 0.5
      edges.push(
        <text key={`t${k.key}`} className={s.edgeText} x={mx + (j === 0 ? -5 : 5)} y={my} textAnchor={j === 0 ? 'end' : 'start'} dy="0.32em">
          {j === 0 ? 'yes' : 'no'}
        </text>,
      )
      draw(k)
    })
    if (v.kind === 'split') {
      const tw = Math.min(leafSpan(v) * slot - 6, (v.label!.length + 1) * fs * 0.58 + 12)
      items.push(
        <g key={v.key}>
          <rect x={x - tw / 2} y={y} width={tw} height={nodeH} rx={7} style={{ fill: 'var(--surface-2)', stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
          <text className={s.nodeText} x={x} y={y + nodeH / 2} dy="0.34em" textAnchor="middle" style={{ fontSize: fs }}>
            {v.label}
          </text>
        </g>,
      )
    } else {
      const isGhost = v.kind === 'ghost'
      const isSel = v.id === sel && !isGhost
      const body = (
        <>
          <rect
            x={x - leafW / 2}
            y={y}
            width={leafW}
            height={nodeH}
            rx={7}
            style={{
              fill: isGhost ? 'var(--surface)' : tint(v.c),
              stroke: isSel ? 'var(--accent)' : isGhost ? 'var(--viz-3)' : 'var(--viz-axis)',
              strokeWidth: isSel ? 2.5 : isGhost ? 1.8 : 1.2,
              strokeDasharray: isGhost ? '4 3' : undefined,
            }}
          />
          <text x={x} y={y + nodeH / 2} dy="0.34em" textAnchor="middle" style={{ fontSize: fs, fontWeight: 700 }}>
            <tspan style={{ fill: 'var(--viz-1)' }}>{v.c[0]}</tspan>
            <tspan style={{ fill: 'var(--ink-3)' }}>{' · '}</tspan>
            <tspan style={{ fill: 'var(--viz-2)' }}>{v.c[1]}</tspan>
          </text>
        </>
      )
      items.push(
        isGhost || v.id === undefined ? (
          <g key={v.key} opacity={0.95}>
            {body}
          </g>
        ) : (
          <g
            key={v.key}
            className={s.clickable}
            role="button"
            tabIndex={0}
            aria-label={`Leaf with ${v.c[0]} cheaper and ${v.c[1]} pricier flats${isSel ? ' (selected)' : ''}`}
            onClick={() => onSelect(v.id!)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(v.id!)
              }
            }}
          >
            {body}
          </g>
        ),
      )
    }
  }
  draw(root)
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg className={s.diagram} viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="The tree as a diagram: questions at the top, leaves with their counts at the bottom" style={{ display: 'block', overflow: 'visible' }}>
        {edges}
        {items}
      </svg>
    </div>
  )
}

/* ---------- main visual ---------- */

export default function TreeBuilder() {
  const [nodes, setNodes] = useState<BNode[]>(START)
  const [history, setHistory] = useState<{ nodes: BNode[]; sel: number; cand: Cand }[]>([])
  const [sel, setSel] = useState(0)
  const [cand, setCand] = useState<Cand>(START_CAND)
  const [crit, setCrit] = useState<ClfCriterion>('gini')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const cur = sel >= 0 ? nodes[sel] : null
  const canSplit = cur ? splittable(cur) : false
  const pc = cur ? countsOf(cur.rows) : [0, 0]
  const yes = cur ? cur.rows.filter((i) => FLAT_X[i][cand.f] <= cand.t) : []
  const no = cur ? cur.rows.filter((i) => FLAT_X[i][cand.f] > cand.t) : []
  const yc = countsOf(yes)
  const nc = countsOf(no)
  const n = yes.length + no.length
  const ip = impurityOf(pc, crit)
  const iy = impurityOf(yc, crit)
  const ino = impurityOf(nc, crit)
  const weighted = n ? (yes.length / n) * iy + (no.length / n) * ino : 0
  const gain = ip - weighted
  const best = useMemo(() => (cur && canSplit ? bestSplit(FLAT_X, FLAT_Y, cur.rows, [0, 1], { task: 'clf', criterion: crit }) : null), [cur, canSplit, crit])
  const isBest = !!best && best.f === cand.f && Math.abs(gain - best.gain) < 1e-9
  const leaves = nodes.map((nd, id) => ({ nd, id })).filter(({ nd }) => !nd.kids)
  const correct = leaves.reduce((acc, { nd }) => acc + Math.max(...countsOf(nd.rows)), 0)
  const critName = crit === 'gini' ? 'Gini' : 'entropy'

  const select = (id: number) => {
    if (id === sel || nodes[id].kids) return
    setSel(id)
    setCand(midCand(nodes[id], cand.f))
  }
  const selectAt = ([x, y]: [number, number]) => {
    const hit = leaves.find(({ nd }) => x >= nd.box[0] && x <= nd.box[1] && y >= nd.box[2] && y <= nd.box[3])
    if (hit) select(hit.id)
  }
  const commit = () => {
    if (!cur || !canSplit || !yes.length || !no.length) return
    const b = cur.box
    const yesBox: Box = cand.f === 0 ? [b[0], cand.t, b[2], b[3]] : [b[0], b[1], b[2], cand.t]
    const noBox: Box = cand.f === 0 ? [cand.t, b[1], b[2], b[3]] : [b[0], b[1], cand.t, b[3]]
    const next = nodes.slice()
    const a = next.length
    next.push({ rows: yes, box: yesBox, depth: cur.depth + 1 }, { rows: no, box: noBox, depth: cur.depth + 1 })
    next[sel] = { ...cur, split: { ...cand }, kids: [a, a + 1] }
    setHistory((h) => [...h, { nodes, sel, cand }])
    setNodes(next)
    // move on to the leaf with the most impurity left to remove
    let pick = -1
    let worst = 0
    next.forEach((nd, id) => {
      if (!splittable(nd)) return
      const score = nd.rows.length * impurityOf(countsOf(nd.rows), 'gini')
      if (score > worst + 1e-12) {
        worst = score
        pick = id
      }
    })
    setSel(pick)
    if (pick >= 0) setCand(midCand(next[pick], cand.f === 0 ? 1 : 0))
  }
  const undo = () => {
    const last = history[history.length - 1]
    if (!last) return
    setNodes(last.nodes)
    setSel(last.sel)
    setCand(last.cand)
    setHistory((h) => h.slice(0, -1))
  }
  const reset = () => {
    setNodes(START)
    setHistory([])
    setSel(0)
    setCand(START_CAND)
  }

  const handle: [number, number] | null =
    cur && canSplit ? (cand.f === 0 ? [cand.t, (cur.box[2] + cur.box[3]) / 2] : [(cur.box[0] + cur.box[1]) / 2, cand.t]) : null

  let status: string
  if (!cur) status = 'Every leaf is now pure or at the depth limit of 3. Press Undo or Start again to try a different tree.'
  else if (!canSplit)
    status = cur.depth >= MAX_DEPTH ? 'This leaf is at the depth limit (3) for this demo. Tap another leaf.' : 'This leaf is pure (one class only): there is nothing left to separate. Tap another leaf.'
  else if (!yes.length || !no.length) status = 'One side of this question is empty, so it separates nothing. Drag the green handle into the points.'
  else if (isBest) status = `This is the best question for this leaf: no threshold on either feature gives a bigger drop in ${critName}.`
  else if (best) status = `Gain ${gain.toFixed(3)}. Can you beat it? The best possible here is ${best.gain.toFixed(3)}.`
  else status = ''

  const plot = (
    <Plot
      x={[BOX[0], BOX[1]]}
      y={[BOX[2], BOX[3]]}
      width={420}
      height={330}
      minHeight={280}
      margin={{ left: 44, bottom: 40, top: 26, right: 12 }}
      ariaLabel={`32 flats plotted by floor area and remaining lease, cut into ${leaves.length} rectangular leaves`}
      onPointerDown={(p) => selectAt(p)}
    >
      {leaves.map(({ nd, id }) => (
        <Rect key={id} x0={nd.box[0]} x1={nd.box[1]} y0={nd.box[2]} y1={nd.box[3]} fill={tint(countsOf(nd.rows))} />
      ))}
      <Grid xTicks={7} yTicks={5} />
      <Axes xLabel="floor area (m²)" yLabel="remaining lease (years)" xTicks={7} yTicks={5} />
      {nodes.map((nd, id) =>
        nd.split ? (
          <Path
            key={`s${id}`}
            points={nd.split.f === 0 ? [[nd.split.t, nd.box[2]], [nd.split.t, nd.box[3]]] : [[nd.box[0], nd.split.t], [nd.box[1], nd.split.t]]}
            color="var(--viz-ink)"
            width={2.2}
          />
        ) : null,
      )}
      {cur && <Outline box={cur.box} />}
      {cur && canSplit && (
        <Path
          points={cand.f === 0 ? [[cand.t, cur.box[2]], [cand.t, cur.box[3]]] : [[cur.box[0], cand.t], [cur.box[1], cand.t]]}
          color="var(--viz-3)"
          width={2.6}
          dash="7 5"
        />
      )}
      <Dots points={FLAT_X.map(([a, l], i) => ({ x: a, y: l, color: CLASS_COLOR[FLAT_Y[i]], shape: SHAPE[FLAT_Y[i]], r: 5.5 }))} />
      {handle && cur && (
        <>
          {cand.f === 0 ? (
            <>
              <Label x={handle[0]} y={handle[1]} dx={-14} dy={4} anchor="end" color="var(--viz-3)" size={12}>
                yes
              </Label>
              <Label x={handle[0]} y={handle[1]} dx={14} dy={4} anchor="start" color="var(--viz-3)" size={12}>
                no
              </Label>
            </>
          ) : (
            <>
              <Label x={handle[0]} y={handle[1]} dx={0} dy={24} anchor="middle" color="var(--viz-3)" size={12}>
                yes
              </Label>
              <Label x={handle[0]} y={handle[1]} dx={0} dy={-16} anchor="middle" color="var(--viz-3)" size={12}>
                no
              </Label>
            </>
          )}
          <DraggablePoint
            x={handle[0]}
            y={handle[1]}
            r={8}
            color="var(--viz-3)"
            lockY={cand.f === 0}
            lockX={cand.f === 1}
            constrain={(x, y) => (cand.f === 0 ? [snapT(x, 0, cur.box), y] : [x, snapT(y, 1, cur.box)])}
            onChange={(x, y) => setCand({ f: cand.f, t: cand.f === 0 ? x : y })}
          />
        </>
      )}
    </Plot>
  )

  return (
    <Figure
      title="Grow a tree by hand: 32 HDB resale flats"
      caption={
        <>
          Each point is a flat: blue circles sold for less than $600k, orange squares for $600k or more. Tap a shaded region (or a box in the tree) to choose a
          leaf, then drag the <b>green handle</b> to move the question's threshold and watch the table. A good question leaves each side as pure (one colour) as
          possible, which shows up as a large <b>information gain</b>. Press <b>Find best split</b> to let the computer try every threshold on both features, then{' '}
          <b>Make this split</b>. Notice that every cut is a straight vertical or horizontal line, so the tree carves the plane into rectangles. Did your first
          guess match the computer's?
        </>
      }
    >
      <div className={s.legend}>
        <span>
          <i className={s.dot} /> under $600k
        </span>
        <span>
          <i className={s.square} /> $600k or more
        </span>
        <span>tree boxes show: <b className={s.low}>under</b> · <b className={s.high}>over</b></span>
      </div>
      <div ref={wrapRef} className={s.panels} style={{ gridTemplateColumns: narrow ? '1fr' : '1.25fr 1fr' }}>
        <div>{plot}</div>
        <div>
          <p className={s.panelTitle}>The same tree as a diagram</p>
          <TreeDiagram nodes={nodes} sel={sel} ghost={cur && canSplit && yes.length && no.length ? { yes, no } : null} onSelect={select} />
          <p className={s.status} style={{ marginTop: 8 }}>
            Accuracy on these flats (each leaf predicts its majority): <b className={s.strong}>{correct}/32</b> · leaves: <b className={s.strong}>{leaves.length}</b>
          </p>
        </div>
      </div>
      {cur && canSplit && (
        <table className={s.table} aria-label="Counts and impurity on each side of the question">
          <thead>
            <tr>
              <th>
                Question: <span className={s.strong}>{FEAT[cand.f]} ≤ {fmtT(cand.t)}{unit(cand.f)}?</span>
              </th>
              <th className={s.low}>under</th>
              <th className={s.high}>over</th>
              <th>{critName}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>this leaf ({cur.rows.length} flats)</td>
              <td>{pc[0]}</td>
              <td>{pc[1]}</td>
              <td>{ip.toFixed(3)}</td>
            </tr>
            <tr>
              <td>yes side ({yes.length})</td>
              <td>{yc[0]}</td>
              <td>{yc[1]}</td>
              <td>{iy.toFixed(3)}</td>
            </tr>
            <tr>
              <td>no side ({no.length})</td>
              <td>{nc[0]}</td>
              <td>{nc[1]}</td>
              <td>{ino.toFixed(3)}</td>
            </tr>
            <tr>
              <td>
                weighted by size ({yes.length}/{n}, {no.length}/{n})
              </td>
              <td />
              <td />
              <td>{weighted.toFixed(3)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>gain = {ip.toFixed(3)} − {weighted.toFixed(3)}</td>
              <td />
              <td />
              <td className={s.gain}>{gain.toFixed(3)}</td>
            </tr>
          </tfoot>
        </table>
      )}
      <p className={s.status}>{status}</p>
      <Controls>
        <Segmented
          label="Split on"
          value={cand.f}
          onChange={(f) => cur && canSplit && setCand(midCand(cur, f))}
          options={[
            { value: 0, label: 'area' },
            { value: 1, label: 'lease' },
          ]}
        />
        <Segmented
          label="Impurity"
          value={crit}
          onChange={setCrit}
          options={[
            { value: 'gini', label: 'Gini' },
            { value: 'entropy', label: 'entropy' },
          ]}
        />
      </Controls>
      <Controls>
        <Button onClick={() => best && setCand({ f: best.f, t: best.t })} disabled={!best || isBest}>
          Find best split
        </Button>
        <Button primary onClick={commit} disabled={!canSplit || !yes.length || !no.length}>
          Make this split
        </Button>
        <Button onClick={undo} disabled={!history.length}>
          Undo
        </Button>
        <Button onClick={reset} disabled={!history.length && sel === 0 && cand.t === START_CAND.t && cand.f === START_CAND.f}>
          Start again
        </Button>
      </Controls>
    </Figure>
  )
}
