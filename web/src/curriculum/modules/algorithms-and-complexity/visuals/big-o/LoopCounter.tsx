import { useId, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Toggle, Readout, CodeBlock, M, useContainerWidth } from '../../../../../kit'
import { comma } from './format'
import s from './algo.module.css'

/*
  The doubling test. Each snippet's exact step count is computed for n and for 2n, and its work is
  drawn to the SAME scale in two panels: one cell per step (a line, two lines, a square, a staircase),
  or one equal cell per pass for the halving loop. In the 2n panel the old work is drawn in the first colour
  and the extra work in the second, so "x2", "x4" and "+1" can be seen, not just read.
*/

type Shape = 'bar' | 'bars2' | 'square' | 'triangle' | 'halving'

interface Snip {
  id: string
  label: string
  code: string
  highlight: number[]
  steps: (n: number) => number
  shape: Shape
  note: string
}

const halvings = (n: number) => {
  let k = 0
  while (n > 1) {
    n = Math.floor(n / 2)
    k++
  }
  return k
}

const SNIPS: Snip[] = [
  {
    id: 'one',
    label: 'one loop',
    code: `total = 0
for i in range(n):
    total += i     # n times`,
    highlight: [3],
    steps: (n) => n,
    shape: 'bar',
    note: 'One pass over n items: the work is a line of n cells.',
  },
  {
    id: 'seq',
    label: 'two in a row',
    code: `for i in range(n):
    print(i)          # n steps
for j in range(n):
    print(j)          # n more steps`,
    highlight: [2, 4],
    steps: (n) => 2 * n,
    shape: 'bars2',
    note: 'Blocks that run one after another ADD: n + n = 2n steps, and 2n is still O(n).',
  },
  {
    id: 'nested',
    label: 'nested',
    code: `count = 0
for i in range(n):
    for j in range(n):
        count += 1    # n × n steps`,
    highlight: [4],
    steps: (n) => n * n,
    shape: 'square',
    note: 'A loop inside a loop MULTIPLIES: n rows of n cells make an n × n square.',
  },
  {
    id: 'triangle',
    label: 'triangle',
    code: `pairs = 0
for i in range(n):
    for j in range(i):
        pairs += 1   # runs i times`,
    highlight: [4],
    steps: (n) => (n * (n - 1)) / 2,
    shape: 'triangle',
    note: 'The inner loop runs 0, 1, 2, …, n − 1 times: n(n − 1)/2 steps, about half a square. The ½ is a constant, so this is still O(n²).',
  },
  {
    id: 'halving',
    label: 'halving',
    code: `steps = 0
while n > 1:
    n = n // 2        # halve n
    steps += 1        # one pass`,
    highlight: [3, 4],
    steps: halvings,
    shape: 'halving',
    note: 'Each pass halves n, so the loop runs log₂ n times (one row per pass). Doubling n adds just one extra pass.',
  },
  {
    id: 'hidden',
    label: '"in" a list',
    code: `found = 0
# items is a list of n numbers
for q in queries:     # n queries
    if q in items:    # hidden loop!
        found += 1`,
    highlight: [4],
    steps: (n) => n * n,
    shape: 'square',
    note: '"q in items" looks like one step, but on a list Python checks the items one by one: a hidden inner loop. When q is missing it checks all n, so the total is n × n.',
  },
]

const SET_SNIP: Snip = {
  id: 'hidden-set',
  label: '"in" a set',
  code: `items = set(items)  # n steps
found = 0
for q in queries:     # n queries
    if q in items:    # ~1 step
        found += 1`,
  highlight: [1, 4],
  steps: (n) => 2 * n,
  shape: 'bars2',
  note: 'A set jumps straight to the answer (hashing, explained in the Hashing and heaps lesson), so each "in" is about 1 step. Building the set is n steps and the loop is n more: O(n) in total.',
}

const OLD = 'var(--viz-1)'
const NEW = 'var(--viz-2)'
const HALF_ROW = 18
const HALF_CELL = 22
const fillOf = (c: string) => `color-mix(in srgb, ${c} 55%, var(--surface))`

function shapeHeight(shape: Shape, m: number, u: number) {
  switch (shape) {
    case 'bar':
      return 18
    case 'bars2':
      return 18 * 2 + 8
    case 'square':
    case 'triangle':
      return m * u
    case 'halving':
      return halvings(m) * HALF_ROW
  }
}

function staircase(m: number, u: number) {
  let d = 'M0,0'
  for (let i = 0; i < m; i++) d += `L${i * u},${i * u}L${i * u},${(i + 1) * u}`
  return d + `L0,${m * u}Z`
}

/** Cell grid lines over the shape, so single steps can be counted when cells are big enough. */
function GridLines({ m, u, w, h, vertical, horizontal, clip }: { m: number; u: number; w: number; h: number; vertical: boolean; horizontal: boolean; clip: string }) {
  if (u < 5) return null
  const lines = []
  if (vertical) for (let i = 1; i < m; i++) lines.push(<line key={`v${i}`} x1={i * u} x2={i * u} y1={0} y2={h} />)
  if (horizontal) for (let i = 1; i < m; i++) lines.push(<line key={`h${i}`} y1={i * u} y2={i * u} x1={0} x2={w} />)
  return (
    <g clipPath={`url(#${clip})`} style={{ stroke: 'var(--surface)', strokeWidth: u > 12 ? 1.5 : 1 }}>
      {lines}
    </g>
  )
}

function Work({ shape, m, u, isDouble, height }: { shape: Shape; m: number; u: number; isDouble: boolean; height: number }) {
  const id = useId().replace(/:/g, '')
  const half = m / 2
  const ext = m * u
  const outline = { stroke: 'var(--viz-ink)', strokeWidth: 1.2, strokeOpacity: 0.55 }
  let body = null
  let clipShape = null
  switch (shape) {
    case 'bar':
    case 'bars2': {
      const rows = shape === 'bar' ? [0] : [0, 26]
      clipShape = rows.map((y) => <rect key={y} x={0} y={y} width={ext} height={18} />)
      body = rows.map((y) => (
        <g key={y}>
          <rect x={0} y={y} width={ext} height={18} rx={2} style={{ fill: fillOf(isDouble ? NEW : OLD), ...outline }} />
          {isDouble && <rect x={0} y={y} width={half * u} height={18} rx={2} style={{ fill: fillOf(OLD) }} />}
        </g>
      ))
      body = (
        <>
          {body}
          <GridLines m={m} u={u} w={ext} h={44} vertical horizontal={false} clip={id} />
        </>
      )
      break
    }
    case 'square':
      clipShape = <rect x={0} y={0} width={ext} height={ext} />
      body = (
        <>
          <rect x={0} y={0} width={ext} height={ext} style={{ fill: fillOf(isDouble ? NEW : OLD), ...outline }} />
          {isDouble && <rect x={0} y={0} width={half * u} height={half * u} style={{ fill: fillOf(OLD) }} />}
          <GridLines m={m} u={u} w={ext} h={ext} vertical horizontal clip={id} />
        </>
      )
      break
    case 'triangle':
      clipShape = <path d={staircase(m, u)} />
      body = (
        <>
          <path d={staircase(m, u)} style={{ fill: fillOf(isDouble ? NEW : OLD), ...outline }} />
          {isDouble && <path d={staircase(half, u)} style={{ fill: fillOf(OLD) }} />}
          <GridLines m={m} u={u} w={ext} h={ext} vertical horizontal clip={id} />
          {/* the full square, for comparison */}
          <rect x={0} y={0} width={ext} height={ext} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeDasharray: '4 4' }} />
        </>
      )
      break
    case 'halving': {
      // one equal cell per pass (a pass is one unit of work, whatever n is), labelled with how n shrinks
      const rows: number[] = []
      for (let v = m; v > 1; v = Math.floor(v / 2)) rows.push(v)
      body = rows.map((v, i) => (
        <g key={i}>
          <rect x={0} y={i * HALF_ROW} width={HALF_CELL} height={HALF_ROW - 3} rx={2} style={{ fill: fillOf(isDouble && i === 0 ? NEW : OLD), ...outline }} />
          <text x={HALF_CELL + 6} y={i * HALF_ROW + (HALF_ROW - 3) / 2} dy="0.35em" style={{ fontSize: 12, fill: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>
            {comma(v)} → {comma(Math.floor(v / 2))}
          </text>
        </g>
      ))
      break
    }
  }
  return (
    <svg width="100%" height={height + 2} viewBox={`-1 -1 ${ext + 2} ${height + 2}`} preserveAspectRatio="xMinYMin meet" role="img" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id={id}>{clipShape}</clipPath>
      </defs>
      {body}
    </svg>
  )
}

export default function LoopCounter() {
  const [snipId, setSnipId] = useState('nested')
  const [useSet, setUseSet] = useState(false)
  const [k, setK] = useState(3) // n = 2^k
  const [ref, width] = useContainerWidth<HTMLDivElement>(600)

  const snip = snipId === 'hidden' && useSet ? SET_SNIP : SNIPS.find((x) => x.id === snipId)!
  const n = 2 ** k
  const s1 = snip.steps(n)
  const s2 = snip.steps(2 * n)
  const diff = s2 - s1
  const r = s2 / s1

  const verdict =
    diff <= 1
      ? { growth: `+${diff} step`, tex: 'O(\\log n)', words: 'adds one step' }
      : r < 3
        ? { growth: `×${r.toFixed(2)}`, tex: 'O(n)', words: 'doubles the steps' }
        : { growth: `×${r.toFixed(2)}`, tex: 'O(n^2)', words: `multiplies the steps by about 4` }

  // Both panels share one scale: the 2n shape fills the panel width (capped so squares stay compact).
  const panelW = Math.max(120, (width - 12) / 2)
  const ext = Math.min(panelW, 260)
  const u = ext / (2 * n)
  const h = shapeHeight(snip.shape, 2 * n, u)

  return (
    <Figure
      title="The doubling test"
      caption={
        <>
          Pick a snippet and slide <M>n</M>. The right panel runs the same code on twice as much input, drawn to the same scale: blue is the
          old work, orange is the extra work that doubling <M>n</M> added. A line doubles, a square (or a staircase, which is half a square)
          quadruples, and the halving loop gains a single pass. Try the <b>"in" a list</b> snippet, then switch it to a set.
        </>
      }
    >
      <div className={s.wrap}>
        <Segmented label="Snippet" value={snipId} onChange={setSnipId} options={SNIPS.map((x) => ({ value: x.id, label: x.label }))} />
        <CodeBlock code={snip.code} highlight={snip.highlight} title={snip.label} />
        {snipId === 'hidden' && <Toggle label={<>make <code>items</code> a set</>} checked={useSet} onChange={setUseSet} />}
        <div ref={ref} className={s.panels}>
          {[
            { m: n, title: <>n = {comma(n)}</>, steps: s1, dbl: false },
            { m: 2 * n, title: <>2n = {comma(2 * n)}</>, steps: s2, dbl: true },
          ].map((p, i) => (
            <div key={i} className={s.panel}>
              <div className={s.panelTitle}>
                <span>{p.title}</span>
                <span>{comma(p.steps)} steps</span>
              </div>
              <Work shape={snip.shape} m={p.m} u={u} isDouble={p.dbl} height={h} />
            </div>
          ))}
        </div>
        <div className={s.row} style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }} aria-hidden="true">
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, marginRight: 6, verticalAlign: '-1px', background: fillOf(OLD) }} />
            work for n
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, marginRight: 6, verticalAlign: '-1px', background: fillOf(NEW) }} />
            extra work after doubling
          </span>
        </div>
        <div className={s.verdict} aria-live="polite">
          {snip.note} Doubling <M>n</M> {verdict.words} ({verdict.growth}), so this code is <M>{verdict.tex}</M>.
        </div>
        <Controls>
          <Slider label={<>input size <M>n</M></>} value={k} min={2} max={10} step={1} onChange={setK} format={(v) => comma(2 ** v)} />
          <Readout
            items={[
              ['steps(n)', comma(s1)],
              ['steps(2n)', comma(s2)],
              ['growth', verdict.growth],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
