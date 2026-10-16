import { useState, type ReactNode } from 'react'
import { Figure, Segmented, usePlayer, PlayerControls, Button } from '../../../../../kit'
import s from './ppw.module.css'
import { OptionList, Note, cx, type OptionItem } from './shared'

/*
  Stem-first reading, shown then practised.
  Watch: 2026 Prelim Q261 is highlighted in the order an expert reads it (question line, deciding
  numbers, noise, then the one phrase where the options differ).
  Your turn: 2026 Prelim Q299. Tap the phrases you think decide it, then check.
*/

type Role = 'plain' | 'q' | 'key' | 'use' | 'noise'
interface Seg {
  t: string
  role: Role
  id?: string
  group?: string
}
type Line = { segs: Seg[]; bullet?: boolean }

/* ---------- Watch: Q261, verbatim stem ---------- */
const WATCH: Line[] = [
  {
    segs: [
      { t: 'A sentiment analysis model (classifying movie reviews as positive/negative)', role: 'noise' },
      { t: ' shows the following performance after training for 50 epochs:', role: 'noise' },
    ],
  },
  { bullet: true, segs: [{ t: 'Training accuracy: 98.5%', role: 'key' }] },
  { bullet: true, segs: [{ t: 'Training loss: 0.08', role: 'key' }] },
  { bullet: true, segs: [{ t: 'Validation accuracy: 72.3%', role: 'key' }] },
  { bullet: true, segs: [{ t: 'Validation loss: 1.45', role: 'key' }] },
  { bullet: true, segs: [{ t: 'Test accuracy: 71.8%', role: 'use' }] },
  {
    bullet: true,
    segs: [
      { t: 'Model complexity: 3-layer LSTM with 512 hidden units, ', role: 'noise' },
      { t: '2.4M parameters', role: 'key' },
    ],
  },
  {
    bullet: true,
    segs: [
      { t: 'Training set size: ', role: 'noise' },
      { t: '5,000 reviews', role: 'key' },
    ],
  },
  { segs: [{ t: 'What is the most likely problem and what evidence supports this diagnosis?', role: 'q' }] },
]

const WATCH_OPTIONS: OptionItem[] = [
  {
    head: 'Data leakage',
    text: '- validation and test performance are similar (72.3% vs 71.8%), suggesting information leaked from training to validation set',
  },
  { head: 'Underfitting', text: '- 72% validation accuracy is too low for sentiment analysis, indicating the model failed to learn the underlying patterns in the data' },
  {
    head: 'Overfitting',
    text: '- large train-validation gap (98.5% vs 72.3%), loss divergence (0.08 vs 1.45), and model complexity (2.4M parameters) relative to dataset size (5K samples) indicates the model memorised training data rather than learning generalisable patterns',
  },
  {
    head: 'Distribution shift',
    text: '- model performs well on training data (98.5%) but test data comes from different distribution, causing performance drop',
  },
]
const WATCH_WHY: ReactNode[] = [
  'similar validation and test scores show the validation set is a fair judge. Leakage makes scores too good, not 26 points worse.',
  '98.5% training accuracy is the opposite of underfitting: the model fits its training data almost perfectly.',
  'a 26-point accuracy gap, an 18× loss gap and 480 parameters per training review all say "memorised".',
  'validation comes from the same data as training and already shows the whole drop; test simply matches it.',
]

const STEPS: { title: string; body: ReactNode }[] = [
  {
    title: 'The stem as printed',
    body: <>Nine lines and ten numbers. Reading from the top, you meet movie reviews and epochs before you know what you are looking for.</>,
  },
  {
    title: 'Read the question line first',
    body: (
      <>
        It asks for a <b>problem</b> and its <b>evidence</b>. So you are choosing between named failures (overfitting, underfitting, leakage, shift) and you need
        the numbers that tell them apart.
      </>
    ),
  },
  {
    title: 'Scan for the numbers that question needs',
    body: (
      <>
        Training versus validation is the classic pair. Model size versus data size is the other. Turn each pair into one number (cards below).
      </>
    ),
  },
  {
    title: 'Sort the rest: useful or noise',
    body: (
      <>
        Test 71.8% is almost the same as validation 72.3%, so the validation set is a fair judge. That rules out leakage and shift. Movie reviews, 50 epochs and
        the LSTM details don&rsquo;t change the diagnosis.
      </>
    ),
  },
  {
    title: 'Compare options on the one phrase that differs',
    body: (
      <>
        The four options are long, but they differ only in their <b>first words</b>: each names a different failure. The rest is justification. Only one
        name fits a big train–validation gap.
      </>
    ),
  },
]

const VITALS: { k: string; v: string; note: string; from: number; use?: boolean }[] = [
  { k: '98.5 − 72.3', v: '26.2-point gap', note: 'training vs validation accuracy', from: 2 },
  { k: '1.45 ÷ 0.08', v: '≈ 18×', note: 'validation loss vs training loss', from: 2 },
  { k: '2.4M ÷ 5,000', v: '480', note: 'parameters per training review', from: 2 },
  { k: '72.3 vs 71.8', v: '≈ equal', note: 'validation vs test: no leakage, no shift', from: 3, use: true },
]

function watchClass(role: Role, step: number) {
  if (step === 0) return s.seg
  if (role === 'q') return cx(s.seg, s.segQ)
  if (step === 1) return cx(s.seg, s.segDim)
  if (role === 'key') return cx(s.seg, s.segKey)
  if (step === 2) return s.seg
  if (role === 'use') return cx(s.seg, s.segUse)
  if (role === 'noise') return cx(s.seg, s.segDim)
  return s.seg
}

function Passage({ lines, render }: { lines: Line[]; render: (seg: Seg, key: string) => ReactNode }) {
  return (
    <div className={s.passage}>
      {lines.map((ln, i) => (
        <div key={i} className={cx(s.pline, ln.bullet && s.pbullet)}>
          {ln.segs.map((sg, j) => render(sg, `${i}-${j}`))}
        </div>
      ))}
    </div>
  )
}

function Watch() {
  const player = usePlayer({ steps: STEPS.length, interval: 3600 })
  const step = player.step
  return (
    <div className={s.wrap}>
      <div className={s.stepCard} aria-live="polite">
        <span className={s.label}>
          Step {step + 1} of {STEPS.length}
        </span>
        <b className={s.stepTitle}>{STEPS[step].title}</b>
        <span>{STEPS[step].body}</span>
      </div>
      <div className={s.label}>2026 Prelim Q261 · problem solving</div>
      <Passage
        lines={WATCH}
        render={(sg, key) => (
          <span key={key} className={watchClass(sg.role, step)}>
            {sg.t}
          </span>
        )}
      />
      {step >= 2 && (
        <div className={s.vitals} aria-label="Numbers extracted from the stem">
          {VITALS.filter((v) => step >= v.from).map((v) => (
            <div key={v.k} className={cx(s.vital, v.use ? s.vitalUse : s.key)}>
              <span>{v.k}</span>
              <b>{v.v}</b>
              <span>{v.note}</span>
            </div>
          ))}
        </div>
      )}
      <OptionList options={WATCH_OPTIONS} answer={2} picked={null} reveal={step >= 4} why={WATCH_WHY} heads={step >= 4} ariaLabel="Options of Q261" />
      <PlayerControls player={player} />
    </div>
  )
}

/* ---------- Your turn: Q299 ---------- */
const TURN: Line[] = [
  { segs: [{ id: 'intro', t: 'Your deployed loan approval model shows these metrics:', role: 'noise' }] },
  {
    bullet: true,
    segs: [
      { t: 'Week 1: ', role: 'plain' },
      { id: 'a1', t: 'approval rate 40%', role: 'key', group: 'trend' },
      { t: ', ', role: 'plain' },
      { id: 'e1', t: 'error rate 0.1%', role: 'use' },
    ],
  },
  {
    bullet: true,
    segs: [
      { t: 'Week 2: ', role: 'plain' },
      { id: 'a2', t: 'approval rate 35%', role: 'key', group: 'trend' },
      { t: ', ', role: 'plain' },
      { id: 'e2', t: 'error rate 0.1%', role: 'use' },
    ],
  },
  {
    bullet: true,
    segs: [
      { t: 'Week 3: ', role: 'plain' },
      { id: 'a3', t: 'approval rate 30%', role: 'key', group: 'trend' },
      { t: ', ', role: 'plain' },
      { id: 'e3', t: 'error rate 0.1%', role: 'use' },
    ],
  },
  { segs: [{ id: 'gt', t: 'Ground truth labels (loan repayment outcomes) take 3 months to collect.', role: 'key', group: 'delay' }] },
  {
    segs: [
      { id: 'ql', t: 'Which monitoring metric would alert you to potential model problems ', role: 'q' },
      { id: 'first', t: 'FIRST', role: 'key', group: 'first' },
      { t: '?', role: 'plain' },
    ],
  },
]

const GROUPS: { id: string; label: string; why: ReactNode }[] = [
  { id: 'first', label: '“FIRST”', why: <>The question is about how <b>early</b> a metric can raise the alarm, not which metric is best overall.</> },
  { id: 'delay', label: 'Labels take 3 months', why: <>Accuracy needs labels, and they arrive a quarter later. So accuracy cannot be first.</> },
  {
    id: 'trend',
    label: 'Approval rate 40% → 35% → 30%',
    why: <>The model&rsquo;s outputs are already moving: a 10-point fall is a 25% relative drop in three weeks. That is visible today.</>,
  },
]

const TURN_OPTIONS: OptionItem[] = [{ text: 'Error rate' }, { text: 'Approval rate' }, { text: 'Ground truth accuracy' }, { text: 'No metric can detect problems until ground truth labels arrive' }]
const TURN_WHY: ReactNode[] = [
  'it stays flat at 0.1% and counts processing errors, not bad decisions.',
  'the output distribution is available immediately, and it is already drifting.',
  'it needs the repayment labels, which arrive 3 months later: too late to be first.',
  'the approval rate is a label-free signal that is already moving.',
]

function YourTurn() {
  const [marked, setMarked] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [pick, setPick] = useState<number | null>(null)
  const allSegs = TURN.flatMap((l) => l.segs)
  const byId = (id: string) => allSegs.find((x) => x.id === id)
  const toggle = (id: string) => setMarked((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))
  const found = (g: string) => marked.some((id) => byId(id)?.group === g)
  const nFound = GROUPS.filter((g) => found(g.id)).length
  const noiseMarked = marked.filter((id) => byId(id)?.role === 'noise').length
  // tapping any part of the question line (or its key word FIRST) counts as reading it first
  const readQ = marked.includes('ql') || marked.includes('first')
  const reset = () => {
    setMarked([])
    setChecked(false)
    setPick(null)
  }

  const segClass = (sg: Seg) => {
    const on = !!sg.id && marked.includes(sg.id)
    if (!checked) return cx(s.seg, on && s.segKey)
    if (sg.role === 'key') return cx(s.seg, on || (sg.group && found(sg.group)) ? s.segKey : s.segMiss)
    if (sg.role === 'use') return cx(s.seg, s.segUse)
    if (sg.role === 'noise') return cx(s.seg, s.segDim, on && s.segNoise)
    if (sg.role === 'q') return cx(s.seg, s.segQ)
    return s.seg
  }

  return (
    <div className={s.wrap}>
      <div className={s.stepCard}>
        <span className={s.label}>Your turn · 2026 Prelim Q299</span>
        <span>
          {checked ? (
            <>
              You found <b>{nFound} of 3</b> deciding clues{noiseMarked ? <> (and marked {noiseMarked} line of noise)</> : null}
              {readQ ? <> and started from the question line</> : null}. Missed clues have a dashed outline; green marks a useful detail. Now answer the
              question.
            </>
          ) : (
            <>
              Tap the phrases you think decide this question (aim for two to four), then press <b>Check</b>. Start with the question line at the bottom.
            </>
          )}
        </span>
      </div>
      <Passage
        lines={TURN}
        render={(sg, key) =>
          sg.id ? (
            <button key={key} type="button" className={segClass(sg)} aria-pressed={marked.includes(sg.id)} disabled={checked} onClick={() => toggle(sg.id!)}>
              {sg.t}
            </button>
          ) : (
            <span key={key} className={s.seg}>
              {sg.t}
            </span>
          )
        }
      />
      {!checked ? (
        <div className={s.row}>
          <Button primary onClick={() => setChecked(true)} disabled={marked.length === 0}>
            Check my highlights
          </Button>
          <span className={s.muted}>{marked.length} marked</span>
        </div>
      ) : (
        <>
          <div className={s.vitals}>
            {GROUPS.map((g) => (
              <div key={g.id} className={cx(s.vital, found(g.id) ? s.key : s.vitalMiss)}>
                <span>{found(g.id) ? '✓ found' : '✗ missed'}</span>
                <b>{g.label}</b>
                <span>{g.why}</span>
              </div>
            ))}
            <div className={cx(s.vital, readQ ? s.key : s.vitalMiss)}>
              <span>{readQ ? '✓ read first' : '✗ not marked'}</span>
              <b>The question line</b>
              <span>{readQ ? 'You started where an expert starts.' : 'Tap it first next time.'} Its word FIRST decides which kind of metric can win.</span>
            </div>
            <div className={cx(s.vital, s.vitalUse)}>
              <span>useful too</span>
              <b>Error rate flat at 0.1%</b>
              <span>Not a deciding clue, but it rules out the &ldquo;error rate&rdquo; option.</span>
            </div>
          </div>
          <OptionList options={TURN_OPTIONS} answer={1} picked={pick} onPick={setPick} reveal={pick !== null} why={TURN_WHY} ariaLabel="Options of Q299" />
          {pick !== null && (
            <Note tone={pick === 1 ? 'good' : 'bad'}>
              {pick === 1 ? <b>Right.</b> : <b>Not this time.</b>} The question word <b>FIRST</b> plus the 3-month label delay rule out anything that needs labels.
              The approval rate is the only signal that is both available now and moving.
            </Note>
          )}
          <div className={s.row}>
            <Button onClick={reset}>Try again</Button>
          </div>
        </>
      )}
    </div>
  )
}

export default function ScenarioHighlighter() {
  const [mode, setMode] = useState<'watch' | 'turn'>('watch')
  return (
    <Figure
      title="Stem-first reading, step by step"
      caption={
        <>
          <b>Watch</b> steps through a real scenario in the order an expert reads it: question line, deciding numbers, noise, then the phrase where the options
          differ. <b>Your turn</b> gives you the highlighter. Notice how few phrases actually decide each question.
        </>
      }
    >
      <Segmented
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'watch', label: 'Watch (Q261)' },
          { value: 'turn', label: 'Your turn (Q299)' },
        ]}
      />
      {mode === 'watch' ? <Watch /> : <YourTurn />}
    </Figure>
  )
}
