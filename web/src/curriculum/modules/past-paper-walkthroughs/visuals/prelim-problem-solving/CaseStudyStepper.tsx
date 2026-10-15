import { useState, type ReactNode } from 'react'
import { Figure, Button, M } from '../../../../../kit'
import s from './ppw.module.css'
import { OptionList, Note, LessonLink, cx, useStoredState, type OptionItem } from './shared'

/*
  Six real 2026 Prelim scenarios as patient charts. Commit to a diagnosis first; then the decisive
  evidence lights up, the wrong options are crossed out with a one-line reason, and misses go to an
  error log (remembered in this browser only).
*/

interface Vital {
  k: string
  v: string
  key?: boolean
}
interface Case {
  q: number
  title: string
  stem: ReactNode
  vitals: Vital[]
  ask: string
  options: OptionItem[]
  answer: number
  why: ReactNode[]
  diagnosis: string
  trigger: string
  firstMove: ReactNode
  lesson: { to: string; label: string }
  caveat?: ReactNode
}

const CASES: Case[] = [
  {
    q: 258,
    title: 'The 50 patients',
    stem: <>A medical dataset has 50 patient samples with 100 biomarker measurements per patient. A logistic regression model is trained on it.</>,
    vitals: [
      { k: 'samples n', v: '50', key: true },
      { k: 'features p', v: '100', key: true },
      { k: 'training accuracy', v: '98% (49/50)', key: true },
      { k: 'validation accuracy', v: '62% (31/50)', key: true },
      { k: 'feature weights', v: 'most non-zero' },
    ],
    ask: 'What problem is the model experiencing and what is its root cause?',
    options: [
      {
        text: 'Overfitting due to high dimensionality (p=100) relative to sample size (n=50) - the model has more parameters (100 weights) than effective training samples, allowing it to memorise training data rather than learn generalisable patterns',
      },
      { text: 'Underfitting because 50 samples are insufficient to train any model - need minimum 1000 samples for machine learning to work' },
      { text: 'Class imbalance in the dataset causing the model to predict only the majority class' },
      { text: 'Feature scaling issues - biomarkers measured in different units (ng/mL, copies, etc.) preventing proper convergence' },
    ],
    answer: 0,
    why: [
      'a 36-point train–validation gap is overfitting, and 100 weights for 50 samples let the model memorise almost any labelling.',
      'there is no universal 1,000-sample rule, and 98% training accuracy is the opposite of underfitting.',
      'the stem gives no class ratio, and imbalance would not explain a 36-point gap between training and validation.',
      'unscaled features slow convergence; they do not produce near-perfect training accuracy with poor validation.',
    ],
    diagnosis: 'Overfitting, because there are more features than samples',
    trigger: 'p = 100 > n = 50',
    firstMove: <>L1 regularisation or feature selection to cut the 100 weights down; more patients if possible.</>,
    lesson: { to: 'ml-fundamentals/curse-of-dimensionality', label: 'The curse of dimensionality' },
  },
  {
    q: 265,
    title: 'The three practitioners',
    stem: (
      <>
        After class weights are added to a fraud detector, three practitioners judge it on 10,000 transactions (9,800 legitimate, 200 fraud). A quotes
        accuracy, B quotes precision, C quotes recall.
      </>
    ),
    vitals: [
      { k: 'fraud share', v: '200 / 10,000 = 2%', key: true },
      { k: 'TP · FN (frauds)', v: '180 caught · 20 missed', key: true },
      { k: 'FP · TN (legit)', v: '294 flagged · 9,506 passed' },
      { k: 'A: accuracy', v: '“98.7%”' },
      { k: 'B: precision', v: '180/474 ≈ 38%' },
      { k: 'C: recall', v: '180/200 = 90%', key: true },
    ],
    ask: "Which practitioner's evaluation is most appropriate for this imbalanced classification problem?",
    options: [
      { text: 'Practitioner A using accuracy - 98.7% correctly classified transactions is objectively the best overall performance metric' },
      { text: 'Practitioner B using precision - 38% precision means majority of fraud alerts are false alarms, creating operational burden and user friction' },
      {
        text: 'Practitioner C focusing on recall - catching 90% of frauds (180/200) is the primary objective; false positives (294 legit transactions flagged) can be manually reviewed by fraud team',
      },
      { text: 'None individually sufficient - must evaluate F1-score (harmonic mean of precision and recall) or use ROC-AUC which aggregates performance across all thresholds' },
    ],
    answer: 2,
    why: [
      <>
        with 2% fraud, accuracy is misleading. The quoted 98.7% is also wrong: <M>{'(180+9506)/10000 = 96.86\\%'}</M>, below the 98% of a model that calls
        everything legitimate.
      </>,
      'false alarms cost a manual review; a missed fraud costs real money. About 1.6 false alarms per fraud caught (294/180), or 474 alerts in total, is a workable review load.',
      'the costly error here is a missed fraud (FN), so recall is the metric that matters most, and 90% is good.',
      'F1 weighs precision and recall equally, ignoring that the two errors cost very different amounts; ROC-AUC flatters heavily imbalanced data.',
    ],
    diagnosis: 'Imbalanced data: judge the model by its costly error',
    trigger: '2% positives, and a missed fraud is expensive',
    firstMove: <>Ignore accuracy. Ask which mistake costs more, then pick precision or recall to match.</>,
    lesson: { to: 'model-evaluation/imbalanced-data', label: 'Imbalanced classes' },
    caveat: (
      <>
        Answer-key caveat: AI Singapore&rsquo;s self-assessment tool keys recall. &ldquo;Look at F1 or ROC-AUC&rdquo; is defensible in real life, so treat this
        as a &ldquo;which error costs more?&rdquo; question. Also notice that the stem&rsquo;s own 98.7% is miscomputed.
      </>
    ),
  },
  {
    q: 272,
    title: 'NaN at epoch 23',
    stem: <>Training abruptly produces NaN losses at epoch 23 after stable convergence.</>,
    vitals: [
      { k: 'symptom', v: 'loss = NaN', key: true },
      { k: 'onset', v: 'sudden, epoch 23', key: true },
      { k: 'before that', v: '22 stable epochs', key: true },
      { k: 'asked for', v: 'a hypothesis-driven approach', key: true },
    ],
    ask: 'Which hypothesis-driven debugging approach is most effective?',
    options: [
      { text: 'Enable anomaly detection (torch.autograd.set_detect_anomaly(True)), log pre-activation statistics, then inspect batch samples causing numerical overflow' },
      { text: 'Reduce learning rate by 10x, add gradient clipping at norm=1.0, switch to mixed precision training with loss scaling' },
      { text: 'Check for division by zero in loss function, add epsilon (1e-8) to denominators, validate input data range' },
      { text: 'Replace batch normalisation with layer normalisation, use gradient checkpointing, decrease model capacity' },
    ],
    answer: 0,
    why: [
      'a sudden NaN after stable training is one specific event, so first find where and when: anomaly detection names the operation, activation statistics name the layer, the batch tests the bad-data idea.',
      'three fixes at once without knowing the cause, and switching to 16-bit floats makes overflow more likely, not less.',
      'sensible checks, but they assume one cause (a division) before any evidence has been gathered.',
      'architecture changes that have nothing to do with a NaN that suddenly appears.',
    ],
    diagnosis: 'A numerical blow-up: find it before you fix it',
    trigger: 'NaN appears suddenly after stable epochs',
    firstMove: <>Localise: which operation, which layer, which batch. Then fix that one thing.</>,
    lesson: { to: 'debugging-and-diagnosis/nan-and-numerical-issues', label: 'NaNs, numerical issues and gradient diagnostics' },
  },
  {
    q: 273,
    title: 'Stuck at 10%',
    stem: <>Validation accuracy remains at 10% (random baseline for a 10-class problem) while training loss decreases smoothly to 0.01.</>,
    vitals: [
      { k: 'validation accuracy', v: '10%', key: true },
      { k: 'classes', v: '10, so chance = 1/10', key: true },
      { k: 'training loss', v: 'falls smoothly to 0.01', key: true },
    ],
    ask: 'Which failure mode is most likely?',
    options: [
      { text: 'Label mismatch between training and validation sets (different encoding schemes or class mappings)' },
      { text: 'Extreme overfitting due to insufficient regularisation and model memorisation of training set' },
      { text: 'Vanishing gradients preventing feature learning, causing model to predict uniform distribution' },
      { text: 'Data leakage in training set artificially inflating training performance without validation generalisation' },
    ],
    answer: 0,
    why: [
      'the model clearly learns (loss 0.01) yet scores exactly chance on validation, so the validation labels do not mean what the training labels mean.',
      'an overfitted model still learns some general patterns, so it scores above chance, not exactly at it.',
      'vanishing gradients would stop the training loss from falling, but here it falls smoothly.',
      'leakage makes results look too good; it does not pin validation at chance.',
    ],
    diagnosis: 'A label or pipeline bug',
    trigger: 'validation accuracy = 1 / (number of classes)',
    firstMove: <>Compare the class-to-index mapping of both sets and look at a few validation images with their labels.</>,
    lesson: { to: 'debugging-and-diagnosis/data-bugs-and-shift', label: 'Data bugs, leakage and distribution shift' },
  },
  {
    q: 274,
    title: 'Out of memory at batch 128',
    stem: <>Training a ResNet-50 with batch size 128 causes &ldquo;CUDA out of memory&rdquo; on a 16 GB GPU.</>,
    vitals: [
      { k: 'error', v: 'CUDA out of memory', key: true },
      { k: 'batch size', v: '128', key: true },
      { k: 'GPU', v: '16 GB' },
      { k: 'asked for', v: 'best throughput–memory trade-off', key: true },
    ],
    ask: 'Which memory optimisation strategy provides best throughput-memory tradeoff?',
    options: [
      { text: 'Gradient accumulation (effective batch 128 = 4 micro-batches × 32) with gradient checkpointing on residual blocks' },
      { text: 'Mixed precision training (FP16 forward/backward, FP32 optimiser) with dynamic loss scaling' },
      { text: 'Reduce batch size to 32 without other changes, accepting 4x longer training time' },
      { text: 'Enable torch.cuda.empty_cache() after each backward pass and use pin_memory for data loading' },
    ],
    answer: 0,
    why: [
      'four micro-batches of 32 add up their gradients before one optimiser step, so each update still averages 128 samples while only 32 sit in memory (ResNet-50’s BatchNorm layers still compute their statistics over 32); checkpointing saves more memory for about one extra forward pass of compute.',
      'a strong technique and often combined with the keyed answer, but on its own it only roughly halves activation memory.',
      'it changes the optimisation itself: each update now averages 32 samples, not 128, so the tuned learning rate no longer matches.',
      'empty_cache() only hands cached blocks back to the driver; the model still needs exactly the same memory.',
    ],
    diagnosis: 'A memory limit: keep the effective batch, shrink what is in memory',
    trigger: '“CUDA out of memory” + keep batch 128',
    firstMove: <>Micro-batches with gradient accumulation; then checkpointing or mixed precision for more room.</>,
    lesson: { to: 'training-deep-networks/stability-and-scale', label: 'Gradient clipping, mixed precision and accumulation' },
    caveat: (
      <>
        Answer-key caveat: mixed precision is also strongly defensible, and many engineers would try it first. The official key prefers accumulation plus
        checkpointing because it is sure to fit while keeping the recipe (batch 128) at a predictable cost.
      </>
    ),
  },
  {
    q: 283,
    title: 'The Transformer that diverged',
    stem: (
      <>
        A GPT-2-scale Transformer (124M parameters) is trained from scratch with AdamW. It diverges within 500 steps, despite a stable first 100 steps. Adding a
        2,000-step linear learning-rate warm-up makes training stable.
      </>
    ),
    vitals: [
      { k: 'model', v: 'Transformer, 124M params' },
      { k: 'optimiser', v: 'AdamW', key: true },
      { k: 'failure', v: 'diverges in the first 500 steps', key: true },
      { k: 'what fixed it', v: '2,000-step warm-up', key: true },
      { k: 'asked for', v: 'the mechanism' },
    ],
    ask: 'What mechanism does warmup provide?',
    options: [
      { text: 'Prevents large gradient updates from poorly-initialised parameters creating catastrophic Adam second-moment (v_t) estimates' },
      { text: 'Gradually exposes model to full dataset complexity, allowing early layers to learn basic features before tackling difficult examples' },
      { text: 'Stabilises batch normalisation statistics by allowing running mean/variance to accumulate before high learning rates' },
      { text: 'Allows optimiser momentum terms to initialise properly, preventing oscillations from zero-initialised momentum buffers' },
    ],
    answer: 0,
    why: [
      <>
        Adam divides each step by <M>{'\\sqrt{\\hat v_t}'}</M>, estimated from a handful of noisy early gradients. A tiny learning rate keeps those erratic steps
        small until <M>{'\\hat v_t'}</M> settles.
      </>,
      'that describes curriculum learning. Warm-up changes the step size, not which examples the model sees.',
      'GPT-style Transformers use LayerNorm, not BatchNorm.',
      <>
        Adam&rsquo;s bias correction already handles zero-initialised buffers: <M>{'\\hat m_t = m_t/(1-\\beta_1^t)'}</M>.
      </>,
    ],
    diagnosis: 'Early instability of an adaptive optimiser, cured by warm-up',
    trigger: 'Transformer + Adam diverges in the first few hundred steps',
    firstMove: <>Linear warm-up of the learning rate over the first few thousand steps.</>,
    lesson: { to: 'training-deep-networks/learning-rate-warmup-schedules', label: 'Learning-rate schedules and warm-up' },
  },
]

interface LogItem {
  q: number
  diagnosis: string
  to: string
  label: string
}

export default function CaseStudyStepper() {
  const [idx, setIdx] = useState(0)
  const [picks, setPicks] = useState<(number | null)[]>(() => CASES.map(() => null))
  const [log, setLog] = useStoredState<LogItem[]>('ps-error-log', [])
  const c = CASES[idx]
  const pick = picks[idx]
  const revealed = pick !== null
  const answered = picks.filter((p) => p !== null).length
  const correct = picks.filter((p, i) => p === CASES[i].answer).length

  const choose = (i: number) => {
    setPicks((all) => all.map((p, j) => (j === idx ? i : p)))
    if (i !== c.answer) {
      setLog((l) => (l.some((x) => x.q === c.q) ? l : [...l, { q: c.q, diagnosis: c.diagnosis, to: c.lesson.to, label: c.lesson.label }]))
    }
  }
  const resetAll = () => {
    setPicks(CASES.map(() => null))
    setIdx(0)
  }

  return (
    <Figure
      title="The case-study clinic: six real 2026 scenarios"
      caption={
        <>
          Each case is a patient chart: the symptoms are the numbers from the stem. Choose a diagnosis <b>before</b> the evidence is revealed. Then the decisive
          symptoms light up and every wrong option is crossed out with its reason. Misses go to your error log (kept in this browser only). Notice how often the
          same few diagnoses come back.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.row} role="tablist" aria-label="Cases">
          {CASES.map((cc, i) => {
            const p = picks[i]
            const st = p === null ? '' : p === cc.answer ? ' ✓' : ' ✗'
            return (
              <button
                key={cc.q}
                type="button"
                role="tab"
                aria-selected={i === idx}
                className={cx(s.chip, i === idx && s.selected, p !== null && (p === cc.answer ? s.good : s.bad))}
                onClick={() => setIdx(i)}
              >
                Case {i + 1}
                {st}
              </button>
            )
          })}
        </div>
        <div className={s.chart}>
          <div className={s.chartHead}>
            <span className={s.label}>
              Case {idx + 1} of {CASES.length} · 2026 Prelim Q{c.q}
            </span>
            <b className={s.chartTitle}>{c.title}</b>
          </div>
          <div className={s.chartStem}>{c.stem}</div>
          <div className={s.label}>Symptoms {revealed ? '(decisive ones highlighted)' : ''}</div>
          <div className={s.vitals}>
            {c.vitals.map((v) => (
              <div key={v.k} className={cx(s.vital, revealed && v.key && s.key, revealed && !v.key && s.vitalFaded)}>
                <span>{v.k}</span>
                <b>{v.v}</b>
              </div>
            ))}
          </div>
          <div className={s.ask}>{c.ask}</div>
        </div>
        <OptionList options={c.options} answer={c.answer} picked={pick} onPick={choose} reveal={revealed} why={c.why} ariaLabel={`Options of Q${c.q}`} />
        {!revealed && <div className={s.muted}>Pick the diagnosis you would choose. The evidence appears after you commit.</div>}
        {revealed && (
          <Note tone={pick === c.answer ? 'good' : 'bad'}>
            <b>{pick === c.answer ? 'Correct.' : 'Added to your error log.'}</b> Diagnosis: <b>{c.diagnosis}</b>. Trigger: <i>{c.trigger}</i>. First move:{' '}
            {c.firstMove} Learn it: <LessonLink to={c.lesson.to}>{c.lesson.label}</LessonLink>.
          </Note>
        )}
        {revealed && c.caveat && <Note tone="warn">{c.caveat}</Note>}
        <div className={s.row}>
          <Button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
            Previous case
          </Button>
          <Button primary onClick={() => setIdx((i) => Math.min(CASES.length - 1, i + 1))} disabled={idx === CASES.length - 1}>
            Next case
          </Button>
          <span className={s.score} aria-live="polite">
            Score {correct} / {answered}
          </span>
        </div>
        <div className={s.card}>
          <div className={s.logHead}>
            <span className={s.label}>Your error log ({log.length})</span>
            <span className={s.row} style={{ width: 'auto' }}>
              {answered > 0 && (
                <Button onClick={resetAll}>Answer again</Button>
              )}
              {log.length > 0 && <Button onClick={() => setLog([])}>Clear log</Button>}
            </span>
          </div>
          {log.length === 0 ? (
            <div className={s.muted}>No misses yet. Every case you get wrong lands here with the lesson to revisit.</div>
          ) : (
            <ul className={s.logList}>
              {log.map((l) => (
                <li key={l.q}>
                  <b>Q{l.q}</b> · {l.diagnosis} · <LessonLink to={l.to}>{l.label}</LessonLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Figure>
  )
}
