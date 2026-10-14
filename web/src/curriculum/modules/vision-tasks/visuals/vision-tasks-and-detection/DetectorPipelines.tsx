import { Fragment, useState, type ReactNode } from 'react'
import { Figure, Segmented, Readout, useNarrow } from '../../../../../kit'
import { DetScene, GT, DW, DH } from './detScene'
import css from './det.module.css'

/*
  Three detector families as clickable pipelines: Faster R-CNN (propose, then classify),
  YOLO (one pass over a grid) and DETR (a Transformer that predicts a set). Clicking a stage
  shows its input and output and changes the picture to what that stage produces. For YOLO the
  grid size can be changed: the cell that contains an object's centre is responsible for it.
  Aha: detectors differ in whether they propose first, predict everywhere at once, or predict
  a set directly.
*/

type Family = 'frcnn' | 'yolo' | 'detr'
type Mode = 'plain' | 'features' | 'anchors' | 'classified' | 'grid' | 'attention' | 'queries' | 'final'

interface Stage {
  name: string
  sub: string
  input: ReactNode
  output: ReactNode
  what: ReactNode
  mode: Mode
}

const PIPES: Record<Family, { label: string; kind: string; stages: Stage[] }> = {
  frcnn: {
    label: 'Faster R-CNN',
    kind: 'two-stage',
    stages: [
      { name: 'Image', sub: 'input', mode: 'plain', input: <>a photo</>, output: <>a 3 × H × W tensor</>, what: <>The whole image goes into the network once.</> },
      {
        name: 'Backbone CNN',
        sub: 'shared features',
        mode: 'features',
        input: <>3 × H × W image</>,
        output: <>a feature map, e.g. 512 × H/16 × W/16: one feature vector per grid cell</>,
        what: <>A pretrained CNN (VGG or ResNet) computes features once; both stages below reuse them.</>,
      },
      {
        name: 'Region proposal network',
        sub: 'stage 1',
        mode: 'anchors',
        input: <>the feature map</>,
        output: <>about 300 to 2,000 candidate boxes (“proposals”) likely to contain some object</>,
        what: (
          <>
            At every feature-map cell sit k = 9 <b>anchor boxes</b> (3 sizes × 3 shapes, dashed). For each anchor a small network predicts an
            “objectness” score and 4 numbers that nudge the anchor into a better box. The highest-scoring boxes become proposals. The original R-CNN got its
            proposals from a slow, hand-made algorithm (selective search) instead.
          </>
        ),
      },
      {
        name: 'RoI pooling + head',
        sub: 'stage 2',
        mode: 'classified',
        input: <>the feature map + each proposal</>,
        output: <>for every proposal: C + 1 class scores (including “background”) and a refined box</>,
        what: (
          <>
            Each proposal&rsquo;s features are cut out and resized to a fixed 7 × 7 grid, then classified. Grey boxes were judged “background”.{' '}
            <b>Mask R-CNN</b> adds a third output here, a small mask for each box, which gives instance segmentation.
          </>
        ),
      },
      {
        name: 'NMS',
        sub: 'clean-up',
        mode: 'final',
        input: <>many overlapping scored boxes</>,
        output: <>one box per object: (x₁, y₁, x₂, y₂, class, score)</>,
        what: <>Non-maximum suppression removes duplicate boxes, class by class.</>,
      },
    ],
  },
  yolo: {
    label: 'YOLO',
    kind: 'one-stage',
    stages: [
      { name: 'Image', sub: 'input', mode: 'plain', input: <>a photo</>, output: <>resized, e.g. 3 × 448 × 448</>, what: <>The image is looked at once (“You Only Look Once”).</> },
      {
        name: 'One CNN',
        sub: 'single pass',
        mode: 'features',
        input: <>the image</>,
        output: <>an S × S grid of feature vectors</>,
        what: <>One network, one forward pass. No separate proposal step, which is what makes it fast enough for real-time video.</>,
      },
      {
        name: 'Grid predictions',
        sub: 'every cell at once',
        mode: 'grid',
        input: <>the S × S grid</>,
        output: <>S × S × (5B + C) numbers</>,
        what: (
          <>
            The cell that contains an object&rsquo;s <b>centre</b> is responsible for it. Each cell predicts B boxes, each as (x, y, w, h, confidence), plus C class
            probabilities. <b>SSD</b> works the same way but predicts from several feature maps of different sizes, using preset default (anchor) boxes, to catch
            both small and large objects.
          </>
        ),
      },
      {
        name: 'Threshold + NMS',
        sub: 'clean-up',
        mode: 'final',
        input: <>S × S × B scored boxes</>,
        output: <>one box per object</>,
        what: <>Drop low-confidence boxes, then remove duplicates with NMS.</>,
      },
    ],
  },
  detr: {
    label: 'DETR',
    kind: 'set prediction',
    stages: [
      { name: 'Image', sub: 'input', mode: 'plain', input: <>a photo</>, output: <>a 3 × H × W tensor</>, what: <>DETR stands for DEtection TRansformer.</> },
      {
        name: 'CNN backbone',
        sub: 'features',
        mode: 'features',
        input: <>the image</>,
        output: <>a feature map, flattened into a sequence of vectors (one per cell) with position encodings</>,
        what: <>Exactly like the first step of the others: a pretrained CNN describes each region of the image.</>,
      },
      {
        name: 'Transformer encoder',
        sub: 'global context',
        mode: 'attention',
        input: <>the sequence of cell vectors</>,
        output: <>the same number of vectors, each now informed by the whole image</>,
        what: <>Self-attention lets every cell look at every other cell (lines), so the model can reason about the whole scene at once.</>,
      },
      {
        name: 'Decoder + object queries',
        sub: 'N slots',
        mode: 'queries',
        input: <>encoder output + N = 100 learned “object queries”</>,
        output: <>N predictions, each a box + class, or “∅ no object”</>,
        what: (
          <>
            Each query is a slot that asks “is there an object for me?”. Most slots answer ∅ (the first 8 of the 100 slots are listed below). During training each real object is matched to exactly one
            prediction (Hungarian matching), so duplicates are punished.
          </>
        ),
      },
      {
        name: 'The set of boxes',
        sub: 'no NMS',
        mode: 'final',
        input: <>N slot predictions</>,
        output: <>the non-∅ slots: one box per object</>,
        what: <>Because training already forbids duplicates, DETR needs <b>no anchors and no NMS</b>.</>,
      },
    ],
  },
}

const GRIDS = [4, 7, 13]
/** which of the decoder's query slots ended up holding person A, person B and the car */
const QUERY_HITS = [2, 5, 7]
const B_BOXES = 2
const C_CLASSES = 20
const COL = { person: 'var(--viz-4)', car: 'var(--viz-2)' }
const centre = (b: number[]) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] as const

// proposals for the Faster R-CNN view: the earlier NMS candidates plus some background boxes
const PROPOSALS: { b: [number, number, number, number]; cls: 'person' | 'car' | 'bg' }[] = [
  { b: [20, 14, 38, 60], cls: 'person' },
  { b: [18, 12, 37, 58], cls: 'person' },
  { b: [27, 15, 45, 61], cls: 'person' },
  { b: [25, 19, 44, 63], cls: 'person' },
  { b: [58, 34, 94, 60], cls: 'car' },
  { b: [55, 32, 90, 58], cls: 'car' },
  { b: [61, 36, 96, 62], cls: 'car' },
  { b: [3, 33, 16, 58], cls: 'bg' },
  { b: [46, 4, 70, 22], cls: 'bg' },
  { b: [70, 8, 98, 30], cls: 'bg' },
  { b: [40, 40, 62, 66], cls: 'bg' },
  { b: [5, 2, 28, 16], cls: 'bg' },
]

function Overlay({ mode, S, family }: { mode: Mode; S: number; family: Family }) {
  const box = (b: number[], stroke: string, key: string | number, dash?: string, w = 0.9, fill = 'none') => (
    <rect key={key} x={b[0]} y={b[1]} width={b[2] - b[0]} height={b[3] - b[1]} style={{ fill, stroke, strokeWidth: w, strokeDasharray: dash }} />
  )
  // person B stands right next to person A, so its label goes under its box instead of on top
  const label = (b: number[], text: string, col: string, key: string, below = false) => {
    const y = below ? b[3] : b[1] - 5
    return (
      <g key={key}>
        <rect x={b[0]} y={y} width={text.length * 2.45 + 2} height={5} style={{ fill: col }} />
        <text x={b[0] + 1} y={y + 3.7} style={{ fontSize: 3.9, fontWeight: 700, fill: 'var(--surface)' }}>
          {text}
        </text>
      </g>
    )
  }
  if (mode === 'features' || mode === 'attention') {
    const cols = family === 'yolo' ? 7 : 10
    const rows = family === 'yolo' ? 7 : 7
    const cw = DW / cols
    const ch = DH / rows
    const lines: ReactNode[] = []
    for (let i = 1; i < cols; i++) lines.push(<line key={`v${i}`} x1={i * cw} x2={i * cw} y1={0} y2={DH} style={{ stroke: 'var(--viz-ink)', strokeWidth: 0.3, opacity: 0.5 }} />)
    for (let j = 1; j < rows; j++) lines.push(<line key={`h${j}`} y1={j * ch} y2={j * ch} x1={0} x2={DW} style={{ stroke: 'var(--viz-ink)', strokeWidth: 0.3, opacity: 0.5 }} />)
    const att: ReactNode[] = []
    if (mode === 'attention') {
      const [sc, sr] = [Math.floor(29 / cw), Math.floor(37 / ch)]
      const sx = (sc + 0.5) * cw
      const sy = (sr + 0.5) * ch
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++) {
          if (c === sc && r === sr) continue
          att.push(<line key={`a${c}-${r}`} x1={sx} y1={sy} x2={(c + 0.5) * cw} y2={(r + 0.5) * ch} style={{ stroke: 'var(--accent)', strokeWidth: 0.35, opacity: 0.55 }} />)
        }
      att.push(<rect key="src" x={sc * cw} y={sr * ch} width={cw} height={ch} style={{ fill: 'color-mix(in srgb, var(--accent) 35%, transparent)', stroke: 'var(--accent)', strokeWidth: 0.8 }} />)
    }
    return (
      <g>
        <rect x={0} y={0} width={DW} height={DH} style={{ fill: 'var(--surface)', opacity: 0.35 }} />
        {lines}
        {att}
      </g>
    )
  }
  if (mode === 'anchors') {
    const [cx, cy] = [29, 37]
    const anchors: ReactNode[] = []
    ;[14, 26, 40].forEach((s, i) =>
      [0.5, 1, 2].forEach((r, j) => {
        const w = s * Math.sqrt(r)
        const h = s / Math.sqrt(r)
        anchors.push(box([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], 'var(--accent)', `an${i}${j}`, '1.6 1.2', 0.55))
      }),
    )
    return (
      <g>
        {PROPOSALS.map((p, i) => box(p.b, 'var(--viz-ink)', `p${i}`, undefined, 0.45))}
        {anchors}
        <circle cx={cx} cy={cy} r={1.2} style={{ fill: 'var(--accent)' }} />
      </g>
    )
  }
  if (mode === 'classified') {
    return <g>{PROPOSALS.map((p, i) => box(p.b, p.cls === 'bg' ? 'var(--viz-muted)' : COL[p.cls], `c${i}`, p.cls === 'bg' ? '1.5 1.2' : undefined, p.cls === 'bg' ? 0.5 : 0.8))}</g>
  }
  if (mode === 'grid') {
    const cw = DW / S
    const ch = DH / S
    const cells = GT.map((g) => {
      const [x, y] = centre(g.b)
      return { g, c: Math.floor(x / cw), r: Math.floor(y / ch), x, y }
    })
    const lines: ReactNode[] = []
    for (let i = 1; i < S; i++) {
      lines.push(<line key={`v${i}`} x1={i * cw} x2={i * cw} y1={0} y2={DH} style={{ stroke: 'var(--viz-ink)', strokeWidth: 0.3, opacity: 0.55 }} />)
      lines.push(<line key={`h${i}`} y1={i * ch} y2={i * ch} x1={0} x2={DW} style={{ stroke: 'var(--viz-ink)', strokeWidth: 0.3, opacity: 0.55 }} />)
    }
    return (
      <g>
        {cells.map(({ g, c, r }) => (
          <rect key={`cell${g.id}`} x={c * cw} y={r * ch} width={cw} height={ch} style={{ fill: `color-mix(in srgb, ${COL[g.cls]} 40%, transparent)`, stroke: COL[g.cls], strokeWidth: 0.8 }} />
        ))}
        {lines}
        {cells.map(({ g, x, y }) => (
          <g key={`ctr${g.id}`}>
            {box(g.b, COL[g.cls], `gb${g.id}`, '1.5 1', 0.6)}
            <circle cx={x} cy={y} r={1.4} style={{ fill: COL[g.cls], stroke: 'var(--surface)', strokeWidth: 0.5 }} />
          </g>
        ))}
      </g>
    )
  }
  if (mode === 'queries') {
    return (
      <g>
        {GT.map((g, i) => {
          const q = QUERY_HITS[i]
          return (
            <g key={g.id}>
              {box(g.b, COL[g.cls], g.id, undefined, 0.9)}
              {label(g.b, `query ${q}`, COL[g.cls], `l${g.id}`, g.id === 'B')}
            </g>
          )
        })}
      </g>
    )
  }
  if (mode === 'final') {
    const scores = [0.92, 0.88, 0.95]
    return (
      <g>
        {GT.map((g, i) => (
          <g key={g.id}>
            {box(g.b, COL[g.cls], g.id, undefined, 1.1)}
            {label(g.b, `${g.cls} ${scores[i].toFixed(2)}`, COL[g.cls], `l${g.id}`, g.id === 'B')}
          </g>
        ))}
      </g>
    )
  }
  return null
}

export default function DetectorPipelines() {
  const [family, setFamily] = useState<Family>('yolo')
  const [stageIdx, setStageIdx] = useState<Record<Family, number>>({ frcnn: 2, yolo: 2, detr: 3 })
  const [S, setS] = useState(7)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const pipe = PIPES[family]
  const si = stageIdx[family]
  const stage = pipe.stages[si]

  const cw = DW / S
  const ch = DH / S
  const cellOf = GT.map((g) => {
    const [x, y] = centre(g.b)
    return `${Math.floor(x / cw)},${Math.floor(y / ch)}`
  })
  const shared = cellOf.filter((c, i) => cellOf.indexOf(c) !== i).length > 0

  return (
    <Figure
      title="Three ways to build a detector"
      caption={
        <>
          Pick a detector family, then click any stage to see what goes in, what comes out, and what the picture looks like at that point. On the YOLO grid stage,
          change the grid size and watch which cells become responsible for the two people.
        </>
      }
    >
      <Segmented
        label="Detector"
        value={family}
        onChange={setFamily}
        options={(Object.keys(PIPES) as Family[]).map((f) => ({ value: f, label: `${PIPES[f].label} (${PIPES[f].kind})` }))}
      />
      <div ref={wrapRef} className={css.flow} role="list" aria-label={`${pipe.label} pipeline stages`}>
        {pipe.stages.map((st, i) => (
          <Fragment key={st.name}>
            {i > 0 && !narrow && (
              <span className={css.arrow} aria-hidden="true">
                →
              </span>
            )}
            <button
              type="button"
              role="listitem"
              aria-pressed={i === si}
              className={`${css.stage}${i === si ? ` ${css.stageOn}` : ''}`}
              onClick={() => setStageIdx((o) => ({ ...o, [family]: i }))}
            >
              <span>
                {narrow ? `${i + 1}. ` : ''}
                {st.name}
              </span>
              <small>{st.sub}</small>
            </button>
          </Fragment>
        ))}
      </div>
      <svg viewBox={`-1 -6 ${DW + 2} ${DH + 7}`} role="img" aria-label={`${pipe.label}, stage ${si + 1}: ${stage.name}`} style={{ width: '100%', maxWidth: 520, height: 'auto', display: 'block', borderRadius: 8 }}>
        <DetScene />
        <Overlay mode={stage.mode} S={S} family={family} />
      </svg>
      {stage.mode === 'grid' && (
        <Segmented label="Grid size S" value={S} onChange={setS} options={GRIDS.map((g) => ({ value: g, label: `${g} × ${g}` }))} />
      )}
      <div className={css.detail} aria-live="polite">
        <dl className={css.io}>
          <dt>Stage</dt>
          <dd>
            <b>
              {si + 1}. {stage.name}
            </b>{' '}
            ({pipe.label}, {pipe.kind})
          </dd>
          <dt>In</dt>
          <dd>{stage.input}</dd>
          <dt>Out</dt>
          <dd>{stage.output}</dd>
        </dl>
        <div>{stage.what}</div>
        {stage.mode === 'grid' && (
          <div style={{ color: shared ? 'var(--viz-neg)' : 'var(--ink-2)' }}>
            {shared
              ? `With a ${S} × ${S} grid, both people's centres fall in the same cell, so one cell must predict both. The original YOLO allowed only one class per cell and struggled with small, crowded objects.`
              : `With a ${S} × ${S} grid, every object's centre falls in its own cell.`}
          </div>
        )}
        {stage.mode === 'queries' && (
          <div className={css.queries} aria-label="The first 8 of the 100 query slots">
            {Array.from({ length: 8 }, (_, i) => {
              const q = i + 1
              const hit = q === QUERY_HITS[0] ? 'person A' : q === QUERY_HITS[1] ? 'person B' : q === QUERY_HITS[2] ? 'car' : null
              return (
                <span key={i} className={`${css.query}${hit ? ` ${css.queryHit}` : ''}`} style={hit ? { borderColor: hit === 'car' ? COL.car : COL.person } : undefined}>
                  query {q}: {hit ?? '∅'}
                </span>
              )
            })}
          </div>
        )}
      </div>
      <Readout
        items={
          family === 'yolo'
            ? [
                ['grid', `${S} × ${S}`],
                ['output size', `${S} × ${S} × (5·${B_BOXES} + ${C_CLASSES}) = ${S * S * (5 * B_BOXES + C_CLASSES)} numbers`],
                ['passes over the image', '1'],
              ]
            : family === 'frcnn'
              ? [
                  ['stages', '2: propose, then classify'],
                  ['anchors per cell', '9 (3 sizes × 3 shapes)'],
                  ['needs NMS', 'yes'],
                ]
              : [
                  ['object queries', 'N = 100'],
                  ['anchors', 'none'],
                  ['needs NMS', 'no'],
                ]
        }
      />
      {family === 'yolo' && (
        <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', textAlign: 'center', width: '100%' }}>
          Output size uses the original YOLO&rsquo;s settings: B = {B_BOXES} boxes per cell, C = {C_CLASSES} classes.
        </div>
      )}
    </Figure>
  )
}
