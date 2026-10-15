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
            At every feature-map cell (the faint grid) sit k = 9 <b>anchor boxes</b>: 3 sizes × 3 shapes. Only one cell&rsquo;s anchors are drawn
            (dashed); every dot is another cell with its own 9. For each anchor a small network predicts an “objectness” score and 4 numbers that nudge
            the anchor into a better box. The highest-scoring boxes become proposals (thin black): notice how the wide anchor, nudged a little, becomes the
            car&rsquo;s proposal. The original R-CNN got its proposals from a slow, hand-made algorithm (selective search) instead.
          </>
        ),
      },
      {
        name: 'RoI pooling + head',
        sub: 'stage 2',
        mode: 'classified',
        input: <>the feature map + each proposal</>,
        output: <>for every proposal: C + 1 class scores (the C classes plus “background”) and a refined box</>,
        what: (
          <>
            <b>RoI (region of interest) pooling</b> cuts each proposal&rsquo;s features out of the shared map and resizes them to a fixed 7 × 7 grid; the head
            then classifies them. Grey dashed boxes were judged “background”; the two leftover duplicates are removed in the next stage.{' '}
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
            probabilities, so (in the original YOLO) S × S × (5B + C) numbers. Later YOLO versions give every anchor box its own class scores:
            S × S × B × (5 + C). <b>SSD</b> also uses preset default (anchor) boxes, but each gets 4 offsets and C + 1 class scores (“background” replaces
            the confidence), and it predicts from several feature maps of different sizes to catch both small and large objects.
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
        output: <>a feature map, flattened into a sequence of vectors (one per cell), each tagged with where its cell was (a “position encoding”)</>,
        what: <>Exactly like the first step of the others: a pretrained CNN describes each region of the image.</>,
      },
      {
        name: 'Transformer encoder',
        sub: 'global context',
        mode: 'attention',
        input: <>the sequence of cell vectors</>,
        output: <>the same number of vectors, each now informed by the whole image</>,
        what: (
          <>
            Self-attention (taught in the attention-and-transformers module) lets every cell look at every other cell (the lines show this for one
            highlighted cell), so the model can reason about the whole scene at once.
          </>
        ),
      },
      {
        name: 'Decoder + object queries',
        sub: 'N slots',
        mode: 'queries',
        input: <>encoder output + N = 100 learned “object queries”</>,
        output: <>N predictions, each a box + class, or “∅ no object”</>,
        what: (
          <>
            Each query is a slot that asks “is there an object for me?”. Most slots answer ∅ (the first 8 of the 100 slots are listed below). During training a one-to-one matching step pairs each real
            object with exactly one slot, and any other slot that also predicts it is penalised.
          </>
        ),
      },
      {
        name: 'The set of boxes',
        sub: 'no NMS',
        mode: 'final',
        input: <>N slot predictions</>,
        output: <>the non-∅ slots: one box per object</>,
        what: (
          <>
            One-to-one matching during training penalises duplicate predictions, so DETR learns to output one box per object and needs <b>no NMS</b>.
            Each query predicts its box directly, not as an adjustment of a preset box, so it needs <b>no anchors</b> either.
          </>
        ),
      },
    ],
  },
}

const GRIDS = [5, 7, 14]
/** which of the decoder's query slots ended up holding person A, person B and the car */
const QUERY_HITS = [2, 5, 7]
const B_BOXES = 2
const C_CLASSES = 20
const COL = { person: 'var(--viz-4)', car: 'var(--viz-2)' }
const centre = (b: number[]) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] as const

// the RPN's top proposals: one per object, two duplicates (removed later by NMS) and two background boxes
const PROPOSALS: { b: [number, number, number, number]; cls: 'person' | 'car' | 'bg' }[] = [
  { b: [22, 14, 40, 60], cls: 'person' },
  { b: [29, 15, 47, 61], cls: 'person' },
  { b: [20, 12, 39, 58], cls: 'person' },
  { b: [58, 34, 94, 60], cls: 'car' },
  { b: [55, 32, 90, 58], cls: 'car' },
  { b: [3, 33, 16, 58], cls: 'bg' },
  { b: [46, 4, 70, 22], cls: 'bg' },
]
/** the backbone's feature map in the two-stage and DETR views: 10 × 7 cells of 10 × 10 image units */
const FCOLS = 10
const FROWS = 7
/** the one feature-map cell whose 9 anchors are drawn (on the car, column 7, row 4) */
const ANCHOR_CELL = [7, 4] as const

function Swatch({ stroke, dash, fill = 'none', w = 1.6 }: { stroke: string; dash?: string; fill?: string; w?: number }) {
  return (
    <svg width={20} height={12} aria-hidden="true" style={{ flex: 'none' }}>
      <rect x={1.5} y={1.5} width={17} height={9} rx={1} style={{ fill, stroke, strokeWidth: w, strokeDasharray: dash }} />
    </svg>
  )
}

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
    const cols = family === 'yolo' ? 7 : FCOLS
    const rows = FROWS
    const cw = DW / cols
    const ch = DH / rows
    const lines: ReactNode[] = []
    for (let i = 1; i < cols; i++) lines.push(<line key={`v${i}`} x1={i * cw} x2={i * cw} y1={0} y2={DH} style={{ stroke: 'var(--viz-ink)', strokeWidth: 0.3, opacity: 0.5 }} />)
    for (let j = 1; j < rows; j++) lines.push(<line key={`h${j}`} y1={j * ch} y2={j * ch} x1={0} x2={DW} style={{ stroke: 'var(--viz-ink)', strokeWidth: 0.3, opacity: 0.5 }} />)
    const att: ReactNode[] = []
    if (mode === 'attention') {
      const [sc, sr] = [Math.floor(31 / cw), Math.floor(37 / ch)]
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
    const cw = DW / FCOLS
    const ch = DH / FROWS
    const [ac, ar] = ANCHOR_CELL
    const [cx, cy] = [(ac + 0.5) * cw, (ar + 0.5) * ch]
    const grid: ReactNode[] = []
    for (let i = 1; i < FCOLS; i++) grid.push(<line key={`v${i}`} x1={i * cw} x2={i * cw} y1={0} y2={DH} style={{ stroke: 'var(--viz-ink)', strokeWidth: 0.25, opacity: 0.3 }} />)
    for (let j = 1; j < FROWS; j++) grid.push(<line key={`h${j}`} y1={j * ch} y2={j * ch} x1={0} x2={DW} style={{ stroke: 'var(--viz-ink)', strokeWidth: 0.25, opacity: 0.3 }} />)
    const dots: ReactNode[] = []
    for (let c = 0; c < FCOLS; c++)
      for (let r = 0; r < FROWS; r++)
        if (c !== ac || r !== ar) dots.push(<circle key={`d${c}-${r}`} cx={(c + 0.5) * cw} cy={(r + 0.5) * ch} r={0.7} style={{ fill: 'var(--accent)', opacity: 0.7 }} />)
    const anchors: ReactNode[] = []
    ;[12, 22, 34].forEach((sz, i) =>
      [0.5, 1, 2].forEach((ratio, j) => {
        const w = sz * Math.sqrt(ratio)
        const h = sz / Math.sqrt(ratio)
        anchors.push(box([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], 'var(--accent)', `an${i}${j}`, '1.6 1.2', 0.6))
      }),
    )
    return (
      <g>
        <rect x={0} y={0} width={DW} height={DH} style={{ fill: 'var(--surface)', opacity: 0.25 }} />
        {grid}
        <rect x={ac * cw} y={ar * ch} width={cw} height={ch} style={{ fill: 'color-mix(in srgb, var(--accent) 35%, transparent)', stroke: 'var(--accent)', strokeWidth: 0.6 }} />
        {dots}
        {PROPOSALS.map((p, i) => box(p.b, 'var(--viz-ink)', `p${i}`, undefined, 0.5))}
        {anchors}
        <circle cx={cx} cy={cy} r={2} style={{ fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 0.7 }} />
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
      {stage.mode === 'anchors' && (
        <div className={css.legend}>
          <span>
            <Swatch stroke="var(--accent)" dash="3 2" /> the 9 anchors at ONE cell (filled)
          </span>
          <span>
            <svg width={12} height={12} aria-hidden="true">
              <circle cx={6} cy={6} r={2.5} style={{ fill: 'var(--accent)' }} />
            </svg>
            every other cell, each with its own 9
          </span>
          <span>
            <Swatch stroke="var(--viz-ink)" w={1.1} /> top proposals
          </span>
        </div>
      )}
      {stage.mode === 'classified' && (
        <div className={css.legend}>
          <span>
            <Swatch stroke={COL.person} /> person
          </span>
          <span>
            <Swatch stroke={COL.car} /> car
          </span>
          <span>
            <Swatch stroke="var(--viz-muted)" dash="3 2" /> background (dropped)
          </span>
        </div>
      )}
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
              ? `With a ${S} × ${S} grid, both people's centres fall in the same cell, so that one cell must find both. The original YOLO gave each cell only B = 2 boxes and one set of class scores, so it struggled with small objects in crowds.`
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
