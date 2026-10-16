import { useState } from 'react'
import { Figure, Controls, Slider, Toggle, Readout, PlayerControls, useContainerWidth } from '../../../../../kit'
import { useStepper } from './useStepper'
import s from './decode.module.css'

/*
  Greedy versus beam search on a small tree of next-token probabilities (other tokens omitted).
  Beam search with width b keeps the b partial sentences with the highest total probability
  (the product of the conditional probabilities, or equivalently the sum of their logs) at every
  step. b = 1 is greedy decoding.
*/

interface Spec {
  tok: string
  p: number
  children?: Spec[]
}

const TREE: Spec = {
  tok: "Let's eat",
  p: 1,
  children: [
    {
      tok: 'chicken',
      p: 0.5,
      children: [
        { tok: 'rice', p: 0.4, children: [{ tok: 'tonight', p: 0.35 }, { tok: '.', p: 0.3 }] },
        { tok: 'wings', p: 0.3, children: [{ tok: 'tonight', p: 0.4 }, { tok: '.', p: 0.3 }] },
      ],
    },
    {
      tok: 'at',
      p: 0.4,
      children: [
        { tok: 'home', p: 0.55, children: [{ tok: 'tonight', p: 0.6 }, { tok: '.', p: 0.3 }] },
        { tok: 'Maxwell', p: 0.4, children: [{ tok: 'tonight', p: 0.95 }, { tok: '.', p: 0.03 }] },
      ],
    },
  ],
}

interface Node {
  id: string
  depth: number
  tok: string
  p: number
  P: number
  parent: string | null
  children: string[]
  path: string[] // ids from depth 1 to this node
}

const NODES: Record<string, Node> = {}
function build(sp: Spec, id: string, depth: number, parent: string | null, P: number, path: string[]) {
  const node: Node = { id, depth, tok: sp.tok, p: sp.p, P, parent, children: [], path }
  NODES[id] = node
  sp.children?.forEach((c, i) => {
    const cid = `${id}${i}`
    node.children.push(cid)
    build(c, cid, depth + 1, id, P * c.p, [...path, cid])
  })
}
build(TREE, 'r', 0, null, 1, [])
const LEAVES = Object.values(NODES).filter((n) => n.depth === 3)

/** Run beam search: kept[d] and candidates[d] for d = 1..3 (ids sorted by total probability). */
function runBeam(b: number) {
  const kept: string[][] = [['r']]
  const cands: string[][] = [['r']]
  for (let d = 1; d <= 3; d++) {
    const c = kept[d - 1].flatMap((id) => NODES[id].children).sort((x, y) => NODES[y].P - NODES[x].P)
    cands.push(c)
    kept.push(c.slice(0, b))
  }
  return { kept, cands }
}

const words = (id: string) => [TREE.tok, ...NODES[id].path.map((x) => NODES[x].tok)].join(' ').replace(' .', '.')
const fmtP = (v: number) => v.toFixed(3)
const fmtLog = (v: number) => Math.log(v).toFixed(2)

export default function BeamSearchTree() {
  const [b, setB] = useState(2)
  const [logs, setLogs] = useState(false)
  const player = useStepper({ steps: 4, interval: 1500 })
  const [ref, width] = useContainerWidth<HTMLDivElement>(600)
  const step = player.step
  const { kept, cands } = runBeam(b)
  const greedy = runBeam(1).kept[3][0]
  const best = kept[3][0]

  // ----- layout -----
  const W = Math.max(300, Math.min(760, width))
  const narrow = W < 520
  const nodeW = narrow ? Math.min(74, (W - 8) / 4 - 6) : 100
  const nodeH = 36
  const rowH = 46
  const top = 26
  const H = top + LEAVES.length * rowH + 4
  const colX = (d: number) => 2 + (d * (W - nodeW - 4)) / 3
  const yOf: Record<string, number> = {}
  LEAVES.forEach((n, i) => (yOf[n.id] = top + i * rowH + rowH / 2))
  for (let d = 2; d >= 0; d--)
    Object.values(NODES)
      .filter((n) => n.depth === d)
      .forEach((n) => (yOf[n.id] = n.children.reduce((a, c) => a + yOf[c], 0) / n.children.length))

  type Status = 'root' | 'kept' | 'pruned' | 'unseen' | 'future'
  const status = (n: Node): Status => {
    if (n.depth === 0) return 'root'
    if (n.depth > step) return 'future'
    if (kept[n.depth].includes(n.id)) return 'kept'
    if (cands[n.depth].includes(n.id)) return 'pruned'
    return 'unseen'
  }
  const onBestPath = (id: string) => step === 3 && (id === best || NODES[best].path.includes(id))
  const scored = cands.slice(1, step + 1).reduce((a, c) => a + c.length, 0)
  const valueText = (n: Node) => (logs ? `log ${n.depth === 0 ? '0' : fmtLog(n.P)}` : `P ${n.depth === 0 ? '1' : fmtP(n.P)}`)

  const beamNow = step === 0 ? [] : kept[step]
  const prunedNow = step === 0 ? [] : cands[step].filter((id) => !kept[step].includes(id))
  const product = (id: string) =>
    logs
      ? NODES[id].path.map((x) => `(${fmtLog(NODES[x].p)})`).join(' + ')
      : NODES[id].path.map((x) => NODES[x].p.toFixed(2)).join(' × ')

  return (
    <Figure
      wide
      title="Greedy versus beam search"
      caption={
        <>
          <b>Try:</b> press <b>Next</b> for each token, then set b = 1 (greedy) and b = 3. <b>Notice:</b> greedy grabs <i>chicken</i> and ends on
          0.070; b = 3 keeps <i>at Maxwell</i> alive and finds 0.152. Crossed-out nodes are pruned.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Slider label="beam width b" value={b} min={1} max={4} step={1} onChange={setB} format={(v) => (v === 1 ? '1 (greedy)' : String(v))} />
          <Toggle label="show log-probabilities" checked={logs} onChange={setLogs} />
        </Controls>

        <div ref={ref} className={s.treeWrap}>
          <svg className={s.tree} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Search tree after step ${step} with beam width ${b}. Kept: ${beamNow.map(words).join('; ') || 'the prompt'}.`}>
            {['prompt', 'step 1', 'step 2', 'step 3'].map((t, d) => (
              <text key={t} x={colX(d) + nodeW / 2} y={13} textAnchor="middle" style={{ fill: d === step ? 'var(--ink)' : 'var(--ink-3)', fontSize: 11.5, fontWeight: 800 }}>
                {t}
              </text>
            ))}
            {Object.values(NODES)
              .filter((n) => n.parent)
              .map((n) => {
                const pa = NODES[n.parent as string]
                const st = status(n)
                const x1 = colX(pa.depth) + nodeW
                const y1 = yOf[pa.id]
                const x2 = colX(n.depth)
                const y2 = yOf[n.id]
                const mx = (x1 + x2) / 2
                const hot = onBestPath(n.id)
                const stroke = hot ? 'var(--viz-pos)' : st === 'kept' ? 'var(--viz-1)' : st === 'pruned' ? 'var(--viz-neg)' : 'var(--viz-muted)'
                const op = st === 'unseen' || st === 'future' ? 0.25 : st === 'pruned' ? 0.55 : 1
                return (
                  <g key={`e${n.id}`}>
                    <path
                      d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                      style={{ fill: 'none', stroke, strokeWidth: hot ? 3 : st === 'kept' ? 2 : 1.4, strokeDasharray: st === 'pruned' ? '4 3' : undefined, opacity: op }}
                    />
                    {!narrow && (
                      <text
                        x={x2 - 4}
                        y={y2 - 5}
                        textAnchor="end"
                        className="plot-label"
                        style={{ fontSize: 11, fill: st === 'future' || st === 'unseen' ? 'var(--ink-3)' : 'var(--ink-2)', opacity: st === 'unseen' || st === 'future' ? 0.5 : 1 }}
                      >
                        {logs ? fmtLog(n.p) : n.p.toFixed(2)}
                      </text>
                    )}
                  </g>
                )
              })}
            {Object.values(NODES).map((n) => {
              const st = status(n)
              const hot = onBestPath(n.id)
              const x = colX(n.depth)
              const y = yOf[n.id] - nodeH / 2
              const faint = st === 'unseen' || st === 'future'
              const stroke = hot ? 'var(--viz-pos)' : st === 'kept' || st === 'root' ? 'var(--viz-1)' : st === 'pruned' ? 'var(--viz-neg)' : 'var(--rule)'
              const fill = hot
                ? 'color-mix(in srgb, var(--viz-pos) 22%, var(--surface))'
                : st === 'kept' || st === 'root'
                  ? 'color-mix(in srgb, var(--viz-1) 14%, var(--surface))'
                  : 'var(--surface)'
              return (
                <g key={n.id} style={{ opacity: faint ? 0.38 : 1 }}>
                  <rect x={x} y={y} width={nodeW} height={nodeH} rx={7} style={{ fill, stroke, strokeWidth: hot ? 2.5 : 1.5, strokeDasharray: st === 'pruned' ? '4 3' : undefined }} />
                  <text x={x + nodeW / 2} y={y + 14} textAnchor="middle" style={{ fill: st === 'pruned' ? 'var(--ink-3)' : 'var(--ink)', fontSize: narrow ? 11.5 : 12.5, fontWeight: 800 }}>
                    {n.tok === '.' ? '“.”' : n.tok}
                  </text>
                  <text x={x + nodeW / 2} y={y + 28} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    {faint && st === 'future' ? '' : st === 'unseen' ? 'not scored' : valueText(n)}
                  </text>
                  {st === 'pruned' && (
                    <g aria-hidden="true">
                      <circle cx={x + nodeW - 1} cy={y + 1} r={7} style={{ fill: 'var(--viz-neg)' }} />
                      <path d={`M${x + nodeW - 4},${y - 2} L${x + nodeW + 2},${y + 4} M${x + nodeW + 2},${y - 2} L${x + nodeW - 4},${y + 4}`} style={{ stroke: 'var(--surface)', strokeWidth: 1.8 }} />
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <PlayerControls player={player} label={(i) => (i === 0 ? 'Start: only the prompt' : `After step ${i} of 3`)} />

        <div className={s.beamList} aria-live="polite">
          <div className={s.colTitle} style={{ marginBottom: 0 }}>
            {step === 0 ? 'Press Next to score the first tokens.' : `Beam after step ${step} (keep b = ${b}), ${logs ? 'log-probabilities added' : 'probabilities multiplied'}:`}
          </div>
          {beamNow.map((id, i) => (
            <div key={id} className={`${s.beamItem} ${step === 3 && i === 0 ? s.beamBest : ''}`}>
              <span className={s.beamSeq}>
                {step === 3 && i === 0 ? '★ ' : ''}
                {words(id)}
              </span>
              <span className={s.beamNums}>
                <span className={s.beamNum}>{product(id)}</span>
                <span className={s.beamNum}>{logs ? `≈ ${fmtLog(NODES[id].P)}` : `= ${fmtP(NODES[id].P)}`}</span>
              </span>
            </div>
          ))}
          {prunedNow.length > 0 && (
            <div className={s.note} style={{ color: 'var(--ink-3)' }}>
              Pruned: {prunedNow.map((id) => `${words(id)} (${logs ? fmtLog(NODES[id].P) : fmtP(NODES[id].P)})`).join(', ')}
            </div>
          )}
        </div>

        <div className={s.summary}>
          <div>
            <b>Greedy (b = 1):</b> {words(greedy)} <span className={s.mono}>P = {fmtP(NODES[greedy].P)}</span>
          </div>
          <div>
            <b>Beam (b = {b}):</b>{' '}
            {step === 3 ? (
              <>
                {words(best)} <span className={s.mono}>P = {fmtP(NODES[best].P)}</span>
              </>
            ) : (
              'press Next to finish the search'
            )}
          </div>
          <Readout items={[['sequences scored so far', String(scored)]]} />
        </div>
      </div>
    </Figure>
  )
}
