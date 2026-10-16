import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Segmented, Button, useContainerWidth, mulberry32, shuffled } from '../../../../../kit'
import s from './ppw.module.css'
import { Note, LessonLink, cx } from './shared'

/*
  Keyword triggers: twelve phrases from real 2026 scenario stems, wired to the ten diagnoses they point to.
  Explore: click a keyword (or a diagnosis) to light up its links, the first move and the lesson.
  Quiz: a real stem with three of its phrases, of similar length and shown in a seeded random order;
  pick the one that decides the question.
*/

type Fam = 'train' | 'res' | 'gen' | 'data' | 'eval'
const FAMS: Record<Fam, { label: string; color: string }> = {
  train: { label: 'Training dynamics', color: 'var(--viz-1)' },
  res: { label: 'Resources', color: 'var(--viz-2)' },
  gen: { label: 'Generalisation', color: 'var(--viz-3)' },
  data: { label: 'Data', color: 'var(--viz-4)' },
  eval: { label: 'Evaluation', color: 'var(--viz-5)' },
}

interface Diag {
  id: string
  label: string
  fam: Fam
  fix: ReactNode
  lesson: { to: string; label: string }
}
const DIAGS: Diag[] = [
  { id: 'lr', label: 'learning rate too high', fam: 'train', fix: 'Lower the learning rate (try 10× smaller).', lesson: { to: 'debugging-and-diagnosis/reading-loss-curves', label: 'Reading loss curves' } },
  {
    id: 'decay',
    label: 'decay the learning rate',
    fam: 'train',
    fix: 'A schedule (step or cosine): big steps early, small steps near the minimum.',
    lesson: { to: 'training-deep-networks/learning-rate-warmup-schedules', label: 'Learning-rate schedules and warm-up' },
  },
  {
    id: 'warm',
    label: 'learning-rate warm-up',
    fam: 'train',
    fix: 'Ramp the learning rate up from almost zero over the first few thousand steps.',
    lesson: { to: 'training-deep-networks/learning-rate-warmup-schedules', label: 'Learning-rate schedules and warm-up' },
  },
  {
    id: 'nan',
    label: 'numerical blow-up: localise it',
    fam: 'train',
    fix: 'Anomaly detection, activation statistics, inspect the offending batch; then fix that one thing.',
    lesson: { to: 'debugging-and-diagnosis/nan-and-numerical-issues', label: 'NaNs, numerical issues and gradient diagnostics' },
  },
  {
    id: 'mem',
    label: 'memory limit',
    fam: 'res',
    fix: 'Micro-batches with gradient accumulation, gradient checkpointing, mixed precision.',
    lesson: { to: 'training-deep-networks/stability-and-scale', label: 'Gradient clipping, mixed precision and accumulation' },
  },
  {
    id: 'over',
    label: 'overfitting (high variance)',
    fam: 'gen',
    fix: 'Regularise (L1/L2, dropout), simplify, stop early, or get more data.',
    lesson: { to: 'ml-fundamentals/generalisation-and-overfitting', label: 'Generalisation, overfitting and bias-variance' },
  },
  {
    id: 'under',
    label: 'underfitting (high bias)',
    fam: 'gen',
    fix: 'More capacity or better features; train longer.',
    lesson: { to: 'ml-fundamentals/generalisation-and-overfitting', label: 'Generalisation, overfitting and bias-variance' },
  },
  {
    id: 'bug',
    label: 'label or pipeline bug',
    fam: 'data',
    fix: 'Check the label mapping and preprocessing of each split; look at a few examples by eye.',
    lesson: { to: 'debugging-and-diagnosis/data-bugs-and-shift', label: 'Data bugs, leakage and distribution shift' },
  },
  {
    id: 'drift',
    label: 'distribution shift',
    fam: 'data',
    fix: 'Monitor inputs and outputs, validate on later data, retrain on recent data.',
    lesson: { to: 'ml-systems-and-tradeoffs/lifecycle-and-deployment', label: 'The ML lifecycle, deployment and monitoring' },
  },
  {
    id: 'metric',
    label: 'accuracy misleads: use precision / recall',
    fam: 'eval',
    fix: 'Choose the metric that matches the costly error; report PR-AUC, not accuracy.',
    lesson: { to: 'model-evaluation/imbalanced-data', label: 'Imbalanced classes' },
  },
]

interface Kw {
  id: string
  label: string
  to: string[]
  /** weaker, secondary links */
  also?: string[]
  seen: string
}
const KWS: Kw[] = [
  { id: 'osc', label: 'loss oscillates wildly', to: ['lr'], seen: 'Q269' },
  { id: 'plat', label: 'plateau + oscillation at a constant LR', to: ['decay'], also: ['lr'], seen: 'Q286' },
  { id: 'div', label: 'Transformer + Adam diverges early', to: ['warm'], seen: 'Q283' },
  { id: 'nan', label: 'sudden NaN after stable epochs', to: ['nan'], seen: 'Q272' },
  { id: 'oom', label: 'CUDA out of memory', to: ['mem'], seen: 'Q274, Q285' },
  { id: 'pn', label: 'p > n (100 features, 50 samples)', to: ['over'], seen: 'Q258' },
  { id: 'gap', label: 'train 98%, validation 72%', to: ['over'], seen: 'Q261, Q266' },
  { id: 'low', label: 'train ≈ validation, both low', to: ['under'], seen: 'Q266' },
  { id: 'chance', label: 'validation at chance (10% on 10 classes)', to: ['bug'], seen: 'Q273' },
  { id: 'time', label: 'trained on 2023, used in 2024–25', to: ['drift'], seen: 'Q275, Q300' },
  { id: 'late', label: 'outputs shifting while labels arrive months later', to: ['drift'], seen: 'Q299' },
  { id: 'rare', label: 'rare positives (1–2%: fraud, rare disease)', to: ['metric'], seen: 'Q263, Q265' },
]

interface QuizItem {
  q: number
  stem: ReactNode
  chips: string[]
  answer: number
  kw: string
  why: ReactNode
}
const QUIZ: QuizItem[] = [
  {
    q: 286,
    stem: (
      <>
        A ResNet-34 trains on CIFAR-10 with a constant learning rate of 0.1 for 200 epochs. Loss falls fast for 50 epochs, then plateaus at 0.45 and keeps
        oscillating around it. Which learning-rate schedule would most improve final performance?
      </>
    ),
    chips: ['ResNet-34 trained on CIFAR-10 for 200 epochs', 'constant LR 0.1, oscillating at a plateau', 'loss falls fast for the first 50 epochs'],
    answer: 1,
    kw: 'plat',
    why: <>A constant, large learning rate is great early and too big late: the steps keep overshooting the minimum. Decay it (step decay at epochs 100 and 150).</>,
  },
  {
    q: 273,
    stem: <>Validation accuracy remains at 10% (random baseline for a 10-class problem) while training loss decreases smoothly to 0.01. Which failure mode is most likely?</>,
    chips: ['training loss falls smoothly to 0.01', 'validation stuck at 10% on 10 classes', 'which failure mode is most likely'],
    answer: 1,
    kw: 'chance',
    why: <>Exactly chance level while training clearly works means the validation labels are scrambled relative to training: a label-mapping bug.</>,
  },
  {
    q: 265,
    stem: (
      <>
        After class weights are added, a fraud model is judged on 10,000 transactions (9,800 legitimate, 200 fraud). Practitioners quote accuracy, precision and
        recall. Whose evaluation is most appropriate?
      </>
    ),
    chips: ['class weights were added to the model', '9,800 legitimate and only 200 fraud', 'three practitioners quote three metrics'],
    answer: 1,
    kw: 'rare',
    why: <>2% positives makes accuracy useless (calling everything legitimate scores 98%), so the answer is about precision versus recall.</>,
  },
  {
    q: 283,
    stem: (
      <>
        A GPT-2-scale Transformer (124M parameters) trained from scratch with AdamW diverges within 500 steps despite a stable first 100. A 2,000-step linear
        warm-up fixes it. What mechanism does warm-up provide?
      </>
    ),
    chips: ['a 124M-parameter GPT-2-scale model', 'AdamW diverges within the first 500 steps', 'a 2,000-step linear warm-up fixes it'],
    answer: 1,
    kw: 'div',
    why: <>Adam&rsquo;s step sizes are unreliable while its running averages are built from a few noisy gradients; warm-up keeps steps tiny until they settle.</>,
  },
  {
    q: 261,
    stem: (
      <>
        A 3-layer LSTM (2.4M parameters) classifies 5,000 movie reviews. Training accuracy 98.5%, validation 72.3%, test 71.8%. What is the most likely problem?
      </>
    ),
    chips: ['a 3-layer LSTM with 2.4M parameters', 'training 98.5% against validation 72.3%', 'validation 72.3% and test 71.8% agree'],
    answer: 1,
    kw: 'gap',
    why: <>A 26-point gap between training and validation is the signature of overfitting. Validation and test agreeing only tells you the validation set is a fair judge; the architecture is scenery.</>,
  },
  {
    q: 272,
    stem: <>Training abruptly produces NaN losses at epoch 23 after stable convergence. Which hypothesis-driven debugging approach is most effective?</>,
    chips: ['the failure happens at epoch 23', 'abrupt NaN after stable convergence', 'a hypothesis-driven debugging approach'],
    answer: 1,
    kw: 'nan',
    why: <>A sudden NaN after stable epochs is a specific event (a bad batch, an overflow): find where it happens before changing anything.</>,
  },
  {
    q: 300,
    stem: (
      <>
        A credit-scoring model trained on 2023 data is deployed in January 2024. By June, applicants&rsquo; average income has fallen, gig workers have tripled,
        and accuracy has dropped from 81% to 76%. What is happening?
      </>
    ),
    chips: ['a credit-scoring model deployed in January', 'trained on 2023 data, 2024 applicants differ', 'accuracy has dropped from 81% to 76%'],
    answer: 1,
    kw: 'time',
    why: <>The model learnt 2023 applicants and now sees different 2024 applicants: data drift. The fix is to retrain on recent data.</>,
  },
  {
    q: 269,
    stem: <>Your training loss oscillates wildly. What&rsquo;s likely wrong?</>,
    chips: ['your training loss', 'oscillates wildly', 'what is likely wrong'],
    answer: 1,
    kw: 'osc',
    why: <>Each step overshoots the bottom of the valley and lands on the other side: the learning rate is too high.</>,
  },
]

/* ---------- layout helpers ---------- */
function wrap(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (!cur) cur = w
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w
    else {
      lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return lines
}

interface Box {
  id: string
  x: number
  y: number
  w: number
  h: number
  lines: string[]
}

const LINE_H = 15
const PAD_Y = 7
const GAP = 7

function useLayout(width: number) {
  return useMemo(() => {
    const narrow = width < 480
    const gapW = narrow ? 34 : Math.min(150, width * 0.2)
    const colW = (width - gapW) / 2
    const maxChars = Math.max(12, Math.floor((colW - 18) / 6.9))
    const left: Box[] = []
    let y = 28
    for (const k of KWS) {
      const lines = wrap(k.label, maxChars)
      const h = PAD_Y * 2 + lines.length * LINE_H
      left.push({ id: k.id, x: 0, y, w: colW, h, lines })
      y += h + GAP
    }
    const leftBottom = y - GAP
    const centre = (b: Box) => b.y + b.h / 2
    const right: Box[] = []
    let floor = 28
    for (const d of DIAGS) {
      const lines = wrap(d.label, maxChars - 1)
      const h = PAD_Y * 2 + lines.length * LINE_H
      const linked = left.filter((b) => KWS.find((k) => k.id === b.id)!.to.includes(d.id))
      const target = linked.reduce((a, b) => a + centre(b), 0) / Math.max(1, linked.length) - h / 2
      const yy = Math.max(floor, target)
      right.push({ id: d.id, x: width - colW, y: yy, w: colW, h, lines })
      floor = yy + h + GAP
    }
    const height = Math.max(leftBottom, floor - GAP) + 6
    return { left, right, height }
  }, [width])
}

function edgePath(a: Box, b: Box) {
  const x1 = a.x + a.w
  const y1 = a.y + a.h / 2
  const x2 = b.x
  const y2 = b.y + b.h / 2
  const mx = (x1 + x2) / 2
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
}

type Sel = { kind: 'k' | 'd'; id: string }

function TriggerNetwork({ sel, onSelect }: { sel: Sel; onSelect: (s: Sel) => void }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(560)
  const width = Math.max(300, Math.min(720, measured))
  const { left, right, height } = useLayout(width)
  const kwById = (id: string) => KWS.find((k) => k.id === id)!
  const diagById = (id: string) => DIAGS.find((d) => d.id === id)!

  const activeK = new Set<string>()
  const activeD = new Set<string>()
  if (sel.kind === 'k') {
    activeK.add(sel.id)
    kwById(sel.id).to.forEach((d) => activeD.add(d))
  } else {
    activeD.add(sel.id)
    KWS.filter((k) => k.to.includes(sel.id)).forEach((k) => activeK.add(k.id))
  }

  const edges: { k: Box; d: Box; fam: Fam; weak: boolean; on: boolean }[] = []
  for (const k of KWS) {
    const kb = left.find((b) => b.id === k.id)!
    for (const [list, weak] of [
      [k.to, false],
      [k.also ?? [], true],
    ] as const) {
      for (const did of list) {
        const db = right.find((b) => b.id === did)!
        const on = sel.kind === 'k' ? sel.id === k.id : sel.id === did && !weak
        edges.push({ k: kb, d: db, fam: diagById(did).fam, weak, on })
      }
    }
  }

  const keyAct = (e: React.KeyboardEvent, f: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      f()
    }
  }

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="group" aria-label="Network linking scenario keywords to the diagnoses they point to" style={{ display: 'block' }}>
        <text x={0} y={14} className={s.svgHead}>
          keyword in the stem
        </text>
        <text x={width} y={14} textAnchor="end" className={s.svgHead}>
          diagnosis
        </text>
        {edges.map((e, i) => (
          <path
            key={i}
            d={edgePath(e.k, e.d)}
            style={{
              fill: 'none',
              stroke: FAMS[e.fam].color,
              strokeWidth: e.on ? 3 : 1.6,
              strokeDasharray: e.weak ? '5 4' : undefined,
              opacity: e.on ? 1 : 0.28,
            }}
          />
        ))}
        {left.map((b) => {
          const on = activeK.has(b.id)
          const fam = diagById(kwById(b.id).to[0]).fam
          return (
            <g
              key={b.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`Keyword: ${kwById(b.id).label}`}
              className={s.svgNode}
              onClick={() => onSelect({ kind: 'k', id: b.id })}
              onKeyDown={(e) => keyAct(e, () => onSelect({ kind: 'k', id: b.id }))}
            >
              <rect
                x={b.x + 1}
                y={b.y}
                width={b.w - 2}
                height={b.h}
                rx={8}
                style={{
                  fill: on ? 'var(--highlight-soft)' : 'var(--surface)',
                  stroke: on ? 'var(--highlight)' : 'var(--rule)',
                  strokeWidth: on ? 2 : 1.2,
                }}
              />
              <circle cx={b.x + b.w - 1} cy={b.y + b.h / 2} r={3.5} style={{ fill: FAMS[fam].color }} />
              <text x={b.x + 9} y={b.y + PAD_Y + 11} style={{ fill: 'var(--ink)', fontSize: 12.5, fontWeight: on ? 700 : 500 }}>
                {b.lines.map((ln, i) => (
                  <tspan key={i} x={b.x + 9} dy={i ? LINE_H : 0}>
                    {ln}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}
        {right.map((b) => {
          const d = diagById(b.id)
          const on = activeD.has(b.id)
          const c = FAMS[d.fam].color
          return (
            <g
              key={b.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`Diagnosis: ${d.label}`}
              className={s.svgNode}
              onClick={() => onSelect({ kind: 'd', id: b.id })}
              onKeyDown={(e) => keyAct(e, () => onSelect({ kind: 'd', id: b.id }))}
            >
              <rect
                x={b.x + 1}
                y={b.y}
                width={b.w - 2}
                height={b.h}
                rx={8}
                style={{
                  fill: `color-mix(in srgb, ${c} ${on ? 26 : 10}%, var(--surface))`,
                  stroke: c,
                  strokeWidth: on ? 2.4 : 1.2,
                }}
              />
              <rect x={b.x + 1} y={b.y} width={5} height={b.h} rx={2} style={{ fill: c }} />
              <text x={b.x + 13} y={b.y + PAD_Y + 11} style={{ fill: 'var(--ink)', fontSize: 12.5, fontWeight: on ? 750 : 600 }}>
                {b.lines.map((ln, i) => (
                  <tspan key={i} x={b.x + 13} dy={i ? LINE_H : 0}>
                    {ln}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}
      </svg>
      <div className={s.legendRow} aria-label="Diagnosis families">
        {(Object.keys(FAMS) as Fam[]).map((f) => (
          <span key={f} className={s.legendItem}>
            <span className={s.legendSwatch} style={{ background: FAMS[f].color }} />
            {FAMS[f].label}
          </span>
        ))}
      </div>
    </div>
  )
}

function Detail({ sel }: { sel: Sel }) {
  if (sel.kind === 'k') {
    const k = KWS.find((x) => x.id === sel.id)!
    return (
      <div className={s.card}>
        {k.to.map((did) => {
          const d = DIAGS.find((x) => x.id === did)!
          return (
            <div key={did} className={s.detail}>
              <span>
                <span className={s.headMark}>&ldquo;{k.label}&rdquo;</span> &rarr; <b>{d.label}</b>
              </span>
              <span>
                <b>First move:</b> {d.fix}
              </span>
              <span>
                <b>Seen in:</b> 2026 Prelim {k.seen}. <b>Learn it:</b> <LessonLink to={d.lesson.to}>{d.lesson.label}</LessonLink>
              </span>
            </div>
          )
        })}
        {k.also && (
          <div className={s.muted} style={{ marginTop: '0.35rem' }}>
            Dashed link: a constant learning rate that is fine early becomes too high late in training, so &ldquo;too high&rdquo; is part of the story.
          </div>
        )}
      </div>
    )
  }
  const d = DIAGS.find((x) => x.id === sel.id)!
  const kws = KWS.filter((k) => k.to.includes(d.id))
  return (
    <div className={s.card}>
      <div className={s.detail}>
        <span>
          <b>{d.label}</b> ({FAMS[d.fam].label.toLowerCase()}) is triggered by: {kws.map((k, i) => <span key={k.id}>{i ? '; ' : ''}&ldquo;{k.label}&rdquo;</span>)}.
        </span>
        <span>
          <b>First move:</b> {d.fix}
        </span>
        <span>
          <b>Learn it:</b> <LessonLink to={d.lesson.to}>{d.lesson.label}</LessonLink>
        </span>
      </div>
    </div>
  )
}

function Quiz({ onReveal }: { onReveal: (kw: string) => void }) {
  const [i, setI] = useState(0)
  const [picks, setPicks] = useState<(number | null)[]>(() => QUIZ.map(() => null))
  const item = QUIZ[i]
  const pick = picks[i]
  // show the chips in a fixed, per-item random order, so the deciding phrase is not always in the same place
  const order = useMemo(() => shuffled(item.chips.map((_, j) => j), mulberry32(item.q * 31)), [item])
  const score = picks.filter((p, j) => p === QUIZ[j].answer).length
  const done = picks.filter((p) => p !== null).length
  const choose = (c: number) => {
    setPicks((all) => all.map((p, j) => (j === i ? c : p)))
    onReveal(item.kw)
  }
  return (
    <div className={s.wrap}>
      <div className={s.chart}>
        <span className={s.label}>
          Stem {i + 1} of {QUIZ.length} · based on 2026 Prelim Q{item.q}
        </span>
        <div className={s.chartStem}>{item.stem}</div>
        <div className={s.ask}>Which phrase decides it?</div>
        <div className={s.row}>
          {order.map((j) => (
            <button
              key={item.chips[j]}
              type="button"
              className={cx(s.chip, pick !== null && j === item.answer && s.good, pick === j && j !== item.answer && s.bad)}
              disabled={pick !== null}
              onClick={() => choose(j)}
            >
              {item.chips[j]}
            </button>
          ))}
        </div>
      </div>
      {pick !== null && (
        <Note tone={pick === item.answer ? 'good' : 'bad'}>
          <b>{pick === item.answer ? 'Yes.' : 'Not that one.'}</b> The deciding phrase is &ldquo;{item.chips[item.answer]}&rdquo;. {item.why} Its link is lit up in the map
          below.
        </Note>
      )}
      <div className={s.row}>
        <Button onClick={() => setI((x) => (x + QUIZ.length - 1) % QUIZ.length)}>Previous stem</Button>
        <Button primary onClick={() => setI((x) => (x + 1) % QUIZ.length)}>
          Next stem
        </Button>
        <span className={s.score}>
          {score} / {done}
        </span>
      </div>
    </div>
  )
}

export default function KeywordTriggerMap() {
  const [mode, setMode] = useState<'explore' | 'quiz'>('explore')
  const [sel, setSel] = useState<Sel>({ kind: 'k', id: 'osc' })
  return (
    <Figure
      title="Keyword triggers: from phrase to diagnosis"
      caption={
        <>
          Left: phrases lifted from real 2026 scenario stems. Right: the diagnosis each one points to, coloured by family. Click a keyword or a diagnosis to see
          its links, the first move and the lesson that teaches it. In <b>Quiz</b>, pick the phrase that decides a real stem. Notice that twelve keywords lead to
          only ten diagnoses in five families.
        </>
      }
    >
      <Segmented
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'explore', label: 'Explore the map' },
          { value: 'quiz', label: 'Quiz: find the keyword' },
        ]}
      />
      {mode === 'quiz' && <Quiz onReveal={(kw) => setSel({ kind: 'k', id: kw })} />}
      <TriggerNetwork sel={sel} onSelect={setSel} />
      {mode === 'explore' && <Detail sel={sel} />}
    </Figure>
  )
}
