import { useState } from 'react'
import { Figure, Controls, Readout, Toggle, Plot, Path, Rect, Label, DraggablePoint, usePlot, useNarrow } from '../../../../../kit'

/*
  Candidate models for a phone app that recognises 20 hawker dishes from a photo. Latency is per photo on a
  phone CPU; all numbers are illustrative (made up to be realistic, not measured benchmarks).
  int8 versions: about 2.5× faster, 4× smaller, a little less accurate. Distilled students: the same
  architecture trained to imitate the Large ViT, so the same speed and size but more accurate.
  The Pareto frontier is the set of models that no other model beats on both latency and accuracy.
*/

type Kind = 'base' | 'int8' | 'distil' | 'both'
interface Model {
  name: string
  kind: Kind
  params: number // millions
  bits: 32 | 8
  ms: number
  acc: number
}

const MODELS: Model[] = [
  { name: 'Large ViT', kind: 'base', params: 86, bits: 32, ms: 300, acc: 92.0 },
  { name: 'Big CNN', kind: 'base', params: 25, bits: 32, ms: 110, acc: 90.0 },
  { name: 'Old wide CNN', kind: 'base', params: 138, bits: 32, ms: 420, acc: 86.0 },
  { name: 'Medium CNN', kind: 'base', params: 11, bits: 32, ms: 55, acc: 85.5 },
  { name: 'Efficient CNN', kind: 'base', params: 5.3, bits: 32, ms: 38, acc: 88.0 },
  { name: 'Mobile CNN', kind: 'base', params: 2.5, bits: 32, ms: 11, acc: 84.0 },
  { name: 'Tiny CNN', kind: 'base', params: 0.3, bits: 32, ms: 3, acc: 74.0 },
  { name: 'Large ViT int8', kind: 'int8', params: 86, bits: 8, ms: 120, acc: 91.6 },
  { name: 'Big CNN int8', kind: 'int8', params: 25, bits: 8, ms: 44, acc: 89.6 },
  { name: 'Efficient CNN int8', kind: 'int8', params: 5.3, bits: 8, ms: 15, acc: 87.4 },
  { name: 'Mobile CNN int8', kind: 'int8', params: 2.5, bits: 8, ms: 4.4, acc: 83.2 },
  { name: 'Efficient CNN, distilled', kind: 'distil', params: 5.3, bits: 32, ms: 38, acc: 90.0 },
  { name: 'Mobile CNN, distilled', kind: 'distil', params: 2.5, bits: 32, ms: 11, acc: 86.5 },
  { name: 'Tiny CNN, distilled', kind: 'distil', params: 0.3, bits: 32, ms: 3, acc: 78.0 },
  { name: 'Efficient CNN, distilled int8', kind: 'both', params: 5.3, bits: 8, ms: 15, acc: 89.4 },
  { name: 'Mobile CNN, distilled int8', kind: 'both', params: 2.5, bits: 8, ms: 4.4, acc: 85.7 },
]

const STYLE: Record<Kind, { colour: string; shape: 'circle' | 'square' | 'triangle' | 'diamond'; label: string }> = {
  base: { colour: 'var(--viz-1)', shape: 'circle', label: 'original (32-bit)' },
  int8: { colour: 'var(--viz-3)', shape: 'square', label: 'quantised to int8' },
  distil: { colour: 'var(--viz-5)', shape: 'triangle', label: 'distilled student' },
  both: { colour: 'var(--viz-4)', shape: 'diamond', label: 'distilled + int8' },
}

const X0 = Math.log10(2)
const X1 = Math.log10(700)
const Y0 = 70
const Y1 = 94
const TICKS = [2, 5, 10, 20, 50, 100, 200, 500]
const lg = Math.log10

const dominated = (m: Model, all: Model[]) => all.some((o) => o !== m && o.ms <= m.ms && o.acc >= m.acc && (o.ms < m.ms || o.acc > m.acc))
const sizeMB = (m: Model) => (m.params * m.bits) / 8

function Shape({ x, y, kind, faded, ring, r = 6 }: { x: number; y: number; kind: Kind; faded: boolean; ring: boolean; r?: number }) {
  const st = STYLE[kind]
  const style = faded ? { fill: 'var(--surface)', stroke: st.colour, strokeWidth: 1.8, opacity: 0.75 } : { fill: st.colour, stroke: 'var(--surface)', strokeWidth: 1.5 }
  let el
  if (st.shape === 'square') el = <rect x={x - r * 0.9} y={y - r * 0.9} width={r * 1.8} height={r * 1.8} style={style} />
  else if (st.shape === 'triangle') el = <path d={`M${x},${y - r * 1.15}L${x + r * 1.05},${y + r * 0.8}L${x - r * 1.05},${y + r * 0.8}Z`} style={style} />
  else if (st.shape === 'diamond') el = <path d={`M${x},${y - r * 1.2}L${x + r * 1.1},${y}L${x},${y + r * 1.2}L${x - r * 1.1},${y}Z`} style={style} />
  else el = <circle cx={x} cy={y} r={r} style={style} />
  return (
    <g>
      {ring && <circle cx={x} cy={y} r={r + 6} style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 2 }} />}
      {el}
    </g>
  )
}

/** Points with greedily placed labels that avoid each other, the points, the frontier and the requirement lines. */
function Points({
  models,
  front,
  chosen,
  selected,
  onSelect,
  stair,
  budget,
  floor,
}: {
  models: Model[]
  front: Set<Model>
  chosen: Model | null
  selected: Model | null
  onSelect: (m: Model) => void
  stair: [number, number][]
  budget: number
  floor: number
}) {
  const { xs, ys, width, height, margin } = usePlot()
  type Box = [number, number, number, number]
  const pos = models.map((m) => ({ m, x: xs(lg(m.ms)), y: ys(m.acc) }))
  const boxes: Box[] = pos.map((p) => [p.x - 8, p.y - 8, p.x + 8, p.y + 8])
  // the frontier staircase, the two requirement lines, their handles and the floor label
  for (let i = 1; i < stair.length; i++) {
    const [x1, y1] = [xs(stair[i - 1][0]), ys(stair[i - 1][1])]
    const [x2, y2] = [xs(stair[i][0]), ys(stair[i][1])]
    boxes.push([Math.min(x1, x2) - 2, Math.min(y1, y2) - 2, Math.max(x1, x2) + 2, Math.max(y1, y2) + 2])
  }
  const bx = xs(budget)
  const fy = ys(floor)
  boxes.push([bx - 2, margin.top, bx + 2, height - margin.bottom], [margin.left, fy - 2, width - margin.right, fy + 2])
  boxes.push([bx - 12, margin.top - 12, bx + 12, margin.top + 12], [width - margin.right - 12, fy - 12, width - margin.right + 12, fy + 12])
  boxes.push([width - margin.right - 62, fy - 20, width - margin.right - 10, fy - 4])
  const hits = (b: Box) =>
    b[0] < margin.left + 2 || b[2] > width - 2 || b[1] < margin.top - 4 || b[3] > height - margin.bottom - 2 ||
    boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])
  const order = [...pos].sort((a, b) => {
    const pr = (p: Model) => (p === selected ? 0 : p === chosen ? 1 : front.has(p) ? 2 : 3)
    return pr(a.m) - pr(b.m)
  })
  const labels: { m: Model; x: number; y: number; anchor: 'start' | 'end' | 'middle' }[] = []
  for (const p of order) {
    const w = p.m.name.length * 6.4
    const tries: { x: number; y: number; anchor: 'start' | 'end' | 'middle'; b: Box }[] = [
      { x: p.x - 10, y: p.y - 6, anchor: 'end', b: [p.x - 11 - w, p.y - 17, p.x - 9, p.y - 4] },
      { x: p.x, y: p.y - 12, anchor: 'middle', b: [p.x - w / 2, p.y - 23, p.x + w / 2, p.y - 10] },
      { x: p.x + 10, y: p.y - 6, anchor: 'start', b: [p.x + 9, p.y - 17, p.x + 11 + w, p.y - 4] },
      { x: p.x - 10, y: p.y + 4, anchor: 'end', b: [p.x - 11 - w, p.y - 7, p.x - 9, p.y + 6] },
      { x: p.x + 10, y: p.y + 4, anchor: 'start', b: [p.x + 9, p.y - 7, p.x + 11 + w, p.y + 6] },
      { x: p.x - 10, y: p.y + 16, anchor: 'end', b: [p.x - 11 - w, p.y + 5, p.x - 9, p.y + 18] },
      { x: p.x + 10, y: p.y + 16, anchor: 'start', b: [p.x + 9, p.y + 5, p.x + 11 + w, p.y + 18] },
      { x: p.x, y: p.y + 21, anchor: 'middle', b: [p.x - w / 2, p.y + 10, p.x + w / 2, p.y + 23] },
    ]
    const t = tries.find((c) => !hits(c.b))
    if (t) {
      boxes.push(t.b)
      labels.push({ m: p.m, x: t.x, y: t.y, anchor: t.anchor })
    }
  }
  return (
    <g>
      {pos.map((p) => (
        <g
          key={p.m.name}
          tabIndex={0}
          role="button"
          aria-label={`${p.m.name}: ${p.m.acc}% at ${p.m.ms} ms`}
          onClick={() => onSelect(p.m)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(p.m))}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <circle cx={p.x} cy={p.y} r={12} style={{ fill: 'transparent' }} />
          <Shape x={p.x} y={p.y} kind={p.m.kind} faded={!front.has(p.m)} ring={p.m === chosen} />
        </g>
      ))}
      {labels.map((l) => (
        <text
          key={l.m.name}
          className="plot-label"
          x={l.x}
          y={l.y}
          textAnchor={l.anchor}
          style={{ fontSize: 11.5, fontWeight: l.m === chosen || l.m === selected ? 800 : 600, fill: front.has(l.m) ? 'var(--ink)' : 'var(--ink-3)', pointerEvents: 'none' }}
        >
          {l.m.name}
        </text>
      ))}
    </g>
  )
}

export default function ParetoFrontier() {
  const [int8, setInt8] = useState(false)
  const [distil, setDistil] = useState(false)
  const [budget, setBudget] = useState(lg(50))
  const [floor, setFloor] = useState(85)
  const [selected, setSelected] = useState<Model | null>(null)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const visible = MODELS.filter((m) => m.kind === 'base' || (m.kind === 'int8' && int8) || (m.kind === 'distil' && distil) || (m.kind === 'both' && int8 && distil))
  const front = new Set(visible.filter((m) => !dominated(m, visible)))
  const frontSorted = [...front].sort((a, b) => a.ms - b.ms)
  const L = 10 ** budget
  const ok = visible.filter((m) => m.ms <= L + 1e-9 && m.acc >= floor)
  const chosen = ok.length ? ok.reduce((b, m) => (m.acc > b.acc || (m.acc === b.acc && m.ms < b.ms) ? m : b)) : null
  const show = selected && visible.includes(selected) ? selected : chosen

  const stair: [number, number][] = []
  frontSorted.forEach((m, i) => {
    if (i > 0) stair.push([lg(m.ms), frontSorted[i - 1].acc])
    stair.push([lg(m.ms), m.acc])
  })
  if (frontSorted.length) stair.push([X1, frontSorted[frontSorted.length - 1].acc])

  return (
    <Figure
      wide
      title="The trade-off frontier: no single best model"
      caption={
        <>
          Each mark is a candidate model for a phone app that recognises hawker dishes (illustrative numbers). Filled marks are on the <b>Pareto frontier</b> (the staircase): no other model is at least
          as fast and as accurate while beating it on one of the two. Hollow marks are dominated, so never worth deploying. Drag the vertical handle to set the time budget and the horizontal handle to set the accuracy you need: the
          ringed model is the most accurate one in the shaded region. Tap any mark for its details. Then add int8 and distilled versions and watch the frontier move up and to the left.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <Plot
          x={[X0, X1]}
          y={[Y0, Y1]}
          width={680}
          height={380}
          minHeight={narrow ? 300 : undefined}
          margin={{ left: 44, right: 22, top: 22, bottom: 40 }}
          ariaLabel="Candidate models: accuracy against latency, with the Pareto frontier"
        >
          {TICKS.map((t) => (
            <Path key={t} points={[[lg(t), Y0], [lg(t), Y1]]} color="var(--viz-grid)" width={1} />
          ))}
          {[70, 75, 80, 85, 90].map((a) => (
            <Path key={a} points={[[X0, a], [X1, a]]} color="var(--viz-grid)" width={1} />
          ))}
          <Rect x0={X0} x1={budget} y0={floor} y1={Y1} fill="color-mix(in srgb, var(--viz-3) 13%, transparent)" />
          <Path points={[[X0, Y0], [X1, Y0]]} color="var(--viz-axis)" width={1.25} />
          <Path points={[[X0, Y0], [X0, Y1]]} color="var(--viz-axis)" width={1.25} />
          {TICKS.map((t) => (
            <Label key={`l${t}`} x={lg(t)} y={Y0} dy={16} anchor="middle" size={11.5} color="var(--ink-3)">
              {narrow && (t === 2 || t === 20 || t === 200) ? '' : String(t)}
            </Label>
          ))}
          {[70, 75, 80, 85, 90].map((a) => (
            <Label key={`a${a}`} x={X0} y={a} dx={-6} dy={4} anchor="end" size={11.5} color="var(--ink-3)">
              {`${a}%`}
            </Label>
          ))}
          <Label x={X1} y={Y0} dy={33} anchor="end" size={12.5} weight={700} color="var(--ink-2)">
            time per photo (ms, log scale)
          </Label>
          <Path points={stair} color="var(--viz-ink)" width={2} dash="6 4" opacity={0.75} />
          <Path points={[[budget, Y0], [budget, Y1]]} color="var(--viz-3)" width={2} />
          <Path points={[[X0, floor], [X1, floor]]} color="var(--viz-3)" width={2} />
          <Points models={visible} front={front} chosen={chosen} selected={selected} onSelect={setSelected} stair={stair} budget={budget} floor={floor} />
          <DraggablePoint x={budget} y={Y1} lockY color="var(--viz-3)" r={8} label={`≤ ${Math.round(L)} ms`} onChange={(x) => setBudget(Math.min(X1, Math.max(X0, x)))} />
          <DraggablePoint x={X1} y={floor} lockX color="var(--viz-3)" r={8} onChange={(_, y) => setFloor(Math.round(Math.min(Y1 - 0.5, Math.max(Y0, y)) * 2) / 2)} />
          <g style={{ pointerEvents: 'none' }}>
            <Label x={X1} y={floor} dx={-14} dy={-8} anchor="end" size={12} weight={700} color="var(--viz-3)">
              {`≥ ${floor}%`}
            </Label>
            <Label x={X0} y={Y1} dx={-40} dy={-9} size={12.5} weight={700} color="var(--ink-2)">
              accuracy
            </Label>
          </g>
        </Plot>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 12.5, color: 'var(--ink-2)', width: '100%' }} aria-hidden="true">
        {(Object.keys(STYLE) as Kind[])
          .filter((k) => k === 'base' || (k === 'int8' && int8) || (k === 'distil' && distil) || (k === 'both' && int8 && distil))
          .map((k) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg width={16} height={16} viewBox="0 0 16 16">
                <Shape x={8} y={8.5} kind={k} faded={false} ring={false} r={5} />
              </svg>
              {STYLE[k].label}
            </span>
          ))}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width={16} height={16} viewBox="0 0 16 16">
            <circle cx={8} cy={8} r={5} style={{ fill: 'var(--surface)', stroke: 'var(--viz-1)', strokeWidth: 1.8 }} />
          </svg>
          dominated
        </span>
      </div>

      <Controls>
        <Toggle label="add int8 versions" checked={int8} onChange={setInt8} />
        <Toggle label="add distilled students" checked={distil} onChange={setDistil} />
      </Controls>

      <div
        role="status"
        style={{
          width: '100%',
          padding: '0.45rem 0.7rem',
          borderRadius: 8,
          fontSize: 13.5,
          fontWeight: 650,
          background: chosen ? 'var(--ok-soft)' : 'var(--bad-soft)',
          color: chosen ? 'var(--ok)' : 'var(--bad)',
        }}
      >
        {chosen
          ? `Deploy: ${chosen.name} (${chosen.acc}%, ${chosen.ms} ms, ${sizeMB(chosen).toFixed(sizeMB(chosen) < 10 ? 1 : 0)} MB).`
          : `No model is both within ${Math.round(L)} ms and at least ${floor}% accurate: relax a requirement, or compress or distil a model.`}
      </div>
      {show && (
        <Readout
          items={[
            [show === chosen ? 'chosen' : 'selected', show.name],
            ['accuracy', `${show.acc}%`],
            ['time', `${show.ms} ms`],
            ['size', `${sizeMB(show).toFixed(sizeMB(show) < 10 ? 1 : 0)} MB (${show.params}M weights × ${show.bits} bits)`],
            ['on the frontier?', front.has(show) ? 'yes' : 'no, dominated'],
          ]}
        />
      )}
    </Figure>
  )
}
