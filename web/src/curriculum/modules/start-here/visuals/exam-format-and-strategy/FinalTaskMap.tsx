import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Figure, useContainerWidth } from '../../../../../kit'

/*
  Every programming task from the 2025 and 2026 NOAI Finals, wired to the course modules that
  teach it. Click, tap or tab to a task to light up what it needs; module names are links.
  Task facts come from the released notebooks (github.com/AISGNUSNOAI).
*/

interface Task {
  id: string
  year: 2025 | 2026
  name: string
  marks: number
  lib: string
  /** one plain-English line for a complete beginner */
  plain: string
  what: string
  modules: string[]
}

const TASKS: Task[] = [
  {
    id: '25-1',
    year: 2025,
    name: 'Linear regression by gradient descent',
    marks: 15,
    lib: 'Python standard library and NumPy only',
    plain: 'Find the straight line that best fits some points by nudging its slope and intercept downhill, a little at a time, until the error stops shrinking.',
    what: 'Write one function that fits a straight line with batch gradient descent for a set number of steps and returns its coefficients, rounded to 4 decimal places.',
    modules: ['calculus-and-gradient-descent', 'linear-regression', 'numpy', 'final-lab-numpy'],
  },
  {
    id: '25-2',
    year: 2025,
    name: 'k-means clustering',
    marks: 25,
    lib: 'Python standard library and NumPy only',
    plain: "Sort points into groups by repeatedly moving each group's centre to the middle of its points.",
    what: 'Assign each point to its nearest centre, move each centre to the mean of its points, and repeat until nothing changes, handling a cluster that ends up empty.',
    modules: ['numpy', 'final-lab-numpy', 'unsupervised-learning'],
  },
  {
    id: '25-3',
    year: 2025,
    name: 'Retrieval-augmented generation (RAG)',
    marks: 40,
    lib: 'Python standard library and NumPy only',
    plain: 'Find the documents most similar to a question, and use them to build the answer.',
    what: 'Turn five short documents and a question into vectors (TF-IDF was suggested), rank the documents by cosine similarity, and build an answer from the best matches.',
    modules: ['numpy', 'final-lab-numpy', 'text-as-data', 'prompting-and-rag'],
  },
  {
    id: '26-1',
    year: 2026,
    name: 'Gradient boosting from scratch',
    marks: 25,
    lib: "NumPy plus scikit-learn's DecisionTreeRegressor (25 marks include a 5-mark bonus)",
    plain: 'Build a strong predictor from many small decision trees, each one trained to fix the mistakes of the trees before it.',
    what: 'Write the loss gradients, the fit loop that adds one small tree at a time scaled by a learning rate, the predict loop, and (bonus) early stopping.',
    modules: ['calculus-and-gradient-descent', 'final-lab-numpy', 'trees-and-ensembles'],
  },
  {
    id: '26-2',
    year: 2026,
    name: 'Debugging a U-Net, then mean IoU',
    marks: 20,
    lib: 'PyTorch and NumPy; scikit-learn and torchmetrics banned',
    plain: 'Repair a broken picture-labelling network so that it runs, then score how well the areas it labels overlap the true ones.',
    what: 'Fix a segmentation network that crashes because its skip connections no longer line up (centre-crop them), then compute mean IoU without any metric library.',
    modules: ['convolutional-networks', 'vision-tasks', 'pytorch', 'final-lab-pytorch'],
  },
  {
    id: '26-3',
    year: 2026,
    name: 'The attention mechanism',
    marks: 35,
    lib: 'PyTorch (35 marks include a 5-mark bonus)',
    plain: 'Build the part of a language model that lets each word look back at the earlier words that matter most to it.',
    what: 'Implement scaled dot-product attention with a causal mask and multi-head attention, fix a buggy positional encoding, and add a classification head.',
    modules: ['pytorch', 'attention-and-transformers', 'final-lab-pytorch'],
  },
]

/** Middle column, ordered to keep the wires short. */
const MODULES: { slug: string; label: string; short: string }[] = [
  { slug: 'calculus-and-gradient-descent', label: 'Calculus and gradient descent', short: 'Calculus + GD' },
  { slug: 'linear-regression', label: 'Linear regression', short: 'Linear regression' },
  { slug: 'numpy', label: 'NumPy', short: 'NumPy' },
  { slug: 'final-lab-numpy', label: 'Final lab I: NumPy', short: 'Final lab I' },
  { slug: 'unsupervised-learning', label: 'Unsupervised learning', short: 'Unsupervised' },
  { slug: 'trees-and-ensembles', label: 'Trees and ensembles', short: 'Trees + ensembles' },
  { slug: 'text-as-data', label: 'Text as data', short: 'Text as data' },
  { slug: 'prompting-and-rag', label: 'Prompting and RAG', short: 'Prompting + RAG' },
  { slug: 'convolutional-networks', label: 'Convolutional networks', short: 'CNNs' },
  { slug: 'vision-tasks', label: 'Vision tasks', short: 'Vision tasks' },
  { slug: 'pytorch', label: 'PyTorch', short: 'PyTorch' },
  { slug: 'attention-and-transformers', label: 'Attention and Transformers', short: 'Attention' },
  { slug: 'final-lab-pytorch', label: 'Final lab II: PyTorch', short: 'Final lab II' },
]

const YEAR_COLOUR = { 2025: 'var(--viz-1)', 2026: 'var(--viz-2)' } as const
/** year colour for small text: mixed towards the ink colour so it passes contrast in light mode */
const YEAR_TEXT = { 2025: 'color-mix(in srgb, var(--viz-1) 65%, var(--ink))', 2026: 'color-mix(in srgb, var(--viz-2) 65%, var(--ink))' } as const

function wrap(text: string, max: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > max) {
      lines.push(cur)
      cur = w
    } else cur = cur ? cur + ' ' + w : w
  }
  if (cur) lines.push(cur)
  return lines
}

export default function FinalTaskMap() {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(640)
  const W = Math.max(300, measured)
  const [sel, setSel] = useState('26-1')
  const narrow = W < 560
  const task = TASKS.find((t) => t.id === sel)!

  // ---- layout ----
  const top = 30
  const modW = narrow ? Math.min(150, W * 0.44) : Math.min(210, W * 0.33)
  const modX = narrow ? W - modW : (W - modW) / 2
  const taskW = narrow ? W - modW - 30 : (W - modW) / 2 - 36
  const charsPerLine = Math.max(12, Math.floor((taskW - 14) / 6.8))
  const boxH = (n: number) => 18 + n * 15 + 14

  type Box = { t: Task; x: number; y: number; h: number; side: 'L' | 'R'; lines: string[] }
  const boxes: Box[] = []
  const t25 = TASKS.filter((t) => t.year === 2025)
  const t26 = TASKS.filter((t) => t.year === 2026)
  let H: number
  let rowH: number
  if (narrow) {
    // tasks stacked down the left (2025 then 2026); the module column stretches to match
    let y = top + 10
    ;[t25, t26].forEach((list, k) => {
      if (k === 1) y += 22
      list.forEach((t) => {
        const lines = wrap(t.name, charsPerLine)
        boxes.push({ t, x: 0, y, h: boxH(lines.length), side: 'L', lines })
        y += boxH(lines.length) + 8
      })
    })
    H = Math.max(y, top + MODULES.length * 26) + 4
    rowH = (H - top - 4) / MODULES.length
  } else {
    rowH = 27
    H = top + MODULES.length * rowH + 6
    const spread = (list: Task[], x: number, side: 'L' | 'R') => {
      const lines = list.map((t) => wrap(t.name, charsPerLine))
      const hs = lines.map((l) => boxH(l.length))
      const gap = (MODULES.length * rowH - hs.reduce((a, b) => a + b, 0)) / (list.length - 1)
      let y = top
      list.forEach((t, i) => {
        boxes.push({ t, x, y, h: hs[i], side, lines: lines[i] })
        y += hs[i] + gap
      })
    }
    spread(t25, 0, 'L')
    spread(t26, W - taskW, 'R')
  }
  const modY = (i: number) => top + i * rowH + rowH / 2
  const needed = new Set(task.modules)

  const onKey = (id: string) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSel(id)
    }
  }

  const headStyle = { fontSize: 12, fontWeight: 800, letterSpacing: '0.02em' }

  return (
    <Figure
      title="Every past Final task, and where this course teaches it"
      caption={
        <>
          Click, tap or tab to a task: the card below explains it in one plain line and lights up the modules that teach it (the module names are links). Five of the six are
          well-known algorithms or building blocks with a clear recipe, and the sixth is a debugging job, so you can practise every one of them before the day. 2025 allowed NumPy
          only; 2026 added PyTorch and asked you to fix someone else's broken code.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <svg className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Diagram linking the six programming tasks of the 2025 and 2026 NOAI Finals to the course modules that teach them.">
          {/* column heads */}
          <text x={0} y={14} style={{ ...headStyle, fill: narrow ? 'var(--ink-2)' : YEAR_TEXT[2025] }}>
            {narrow ? 'Past Final tasks' : 'NOAI 2025 · NumPy only'}
          </text>
          {!narrow && (
            <text x={W} y={14} textAnchor="end" style={{ ...headStyle, fill: YEAR_TEXT[2026] }}>
              NOAI 2026 · NumPy + PyTorch
            </text>
          )}
          <text x={modX + modW / 2} y={14} textAnchor="middle" style={{ ...headStyle, fill: 'var(--ink-2)' }}>
            Course modules
          </text>
          {narrow && (
            <>
              <text x={0} y={boxes[0].y - 6} style={{ fontSize: 11.5, fontWeight: 800, fill: YEAR_TEXT[2025] }}>
                2025 · NumPy only
              </text>
              <text x={0} y={boxes[3].y - 6} style={{ fontSize: 11.5, fontWeight: 800, fill: YEAR_TEXT[2026] }}>
                2026 · NumPy + PyTorch
              </text>
            </>
          )}
          {/* wires: unselected first, selected on top */}
          {[false, true].map((front) =>
            boxes
              .filter((b) => (b.t.id === sel) === front)
              .flatMap((b) =>
                b.t.modules.map((slug) => {
                  const mi = MODULES.findIndex((m) => m.slug === slug)
                  const y2 = modY(mi)
                  const fromX = b.side === 'L' ? b.x + taskW : b.x
                  const toX = b.side === 'L' ? modX : modX + modW
                  const y1 = b.y + b.h / 2
                  const dx = (toX - fromX) * 0.5
                  const c = YEAR_COLOUR[b.t.year]
                  return (
                    <path
                      key={`${b.t.id}-${slug}`}
                      d={`M${fromX},${y1} C${fromX + dx},${y1} ${toX - dx},${y2} ${toX},${y2}`}
                      style={{ fill: 'none', stroke: c, strokeWidth: front ? 2.6 : 1.1, opacity: front ? 0.95 : 0.22 }}
                    />
                  )
                }),
              ),
          )}
          {/* modules */}
          {MODULES.map((m, i) => {
            const on = needed.has(m.slug)
            const c = YEAR_COLOUR[task.year]
            return (
              <Link key={m.slug} to={`/learn/${m.slug}`} aria-label={`Open module: ${m.label}`}>
                <rect
                  x={modX}
                  y={modY(i) - rowH / 2 + 2}
                  width={modW}
                  height={rowH - 4}
                  rx={6}
                  style={{
                    fill: on ? `color-mix(in srgb, ${c} 18%, var(--surface))` : 'var(--surface-2)',
                    stroke: on ? c : 'var(--rule)',
                    strokeWidth: on ? 1.8 : 1,
                  }}
                />
                <text
                  x={modX + modW / 2}
                  y={modY(i) + 4}
                  textAnchor="middle"
                  style={{ fontSize: narrow ? 11.5 : 12, fontWeight: on ? 800 : 600, fill: on ? 'var(--ink)' : 'var(--ink-2)', textDecoration: on ? 'underline' : 'none' }}
                >
                  {narrow ? m.short : m.label}
                </text>
              </Link>
            )
          })}
          {/* task boxes */}
          {boxes.map((b) => {
            const on = b.t.id === sel
            const c = YEAR_COLOUR[b.t.year]
            return (
              <g
                key={b.t.id}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${b.t.year} task: ${b.t.name}, ${b.t.marks} marks`}
                onClick={() => setSel(b.t.id)}
                onFocus={() => setSel(b.t.id)}
                onKeyDown={onKey(b.t.id)}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                <rect
                  x={b.x}
                  y={b.y}
                  width={taskW}
                  height={b.h}
                  rx={9}
                  style={{ fill: on ? `color-mix(in srgb, ${c} 16%, var(--surface))` : 'var(--surface)', stroke: c, strokeWidth: on ? 2.4 : 1.2 }}
                />
                {b.lines.map((l, k) => (
                  <text key={k} x={b.x + 8} y={b.y + 18 + k * 15} style={{ fontSize: 12.5, fontWeight: 750, fill: 'var(--ink)' }}>
                    {l}
                  </text>
                ))}
                <text x={b.x + 8} y={b.y + 18 + b.lines.length * 15 + 2} style={{ fontSize: 11.5, fontWeight: 700, fill: YEAR_TEXT[b.t.year] }}>
                  {b.t.marks} marks
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <TaskCard task={task} />
    </Figure>
  )
}

const dtStyle: CSSProperties = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)' }

function TaskCard({ task }: { task: Task }) {
  const c = YEAR_COLOUR[task.year]
  return (
    <div aria-live="polite" style={{ width: '100%', borderLeft: `5px solid ${c}`, background: 'var(--surface-2)', borderRadius: 'var(--radius-m)', padding: '0.7rem 0.9rem', display: 'grid', gap: '0.35rem', fontSize: '0.92rem', lineHeight: 1.45 }}>
      <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
        NOAI {task.year} · {task.name} · {task.marks} marks
      </div>
      <div style={{ color: 'var(--ink)' }}>
        <span style={dtStyle}>In one line: </span>
        {task.plain}
      </div>
      <div style={{ color: 'var(--ink-2)' }}>
        <span style={dtStyle}>What you write: </span>
        {task.what}
      </div>
      <div>
        <span style={dtStyle}>Allowed: </span>
        {task.lib}
      </div>
      <div>
        <span style={dtStyle}>Learn it in: </span>
        {MODULES.filter((m) => task.modules.includes(m.slug)).map((m, i) => (
          <span key={m.slug}>
            {i > 0 && ' · '}
            <Link to={`/learn/${m.slug}`}>{m.label}</Link>
          </span>
        ))}
      </div>
    </div>
  )
}
