import { useState, type ReactNode } from 'react'
import { Figure, Button, useNarrow } from '../../../../../kit'
import { Chip, Chips, Note, Section } from '../reading-loss-curves/ui'
import s from './sd.module.css'

/*
  The debugging routine as a clickable flowchart. Each case is a symptom with a hidden cause. The
  learner runs the checks in a fixed order (cheapest and most likely first), reads the evidence and
  decides whether it passes. The first failing check exits sideways to the diagnosis and fix; if
  every check passes, the routine ends at "tune hyperparameters, one change at a time".
*/

type CheckId = 'data' | 'shapes' | 'init' | 'overfit' | 'baseline'

const CHECKS: { id: CheckId; q: ReactNode; cost: number; generic: ReactNode }[] = [
  { id: 'data', q: 'Look at a few inputs with their labels. Do they make sense?', cost: 2, generic: 'Data or label bug: fix the pipeline before anything else.' },
  { id: 'shapes', q: 'Print the shapes of inputs, outputs, labels and loss. Are they what you expect?', cost: 2, generic: 'Shape bug: a missing flatten, a wrong dim or silent broadcasting.' },
  { id: 'init', q: <>Is the loss at step 0 close to ln K?</>, cost: 1, generic: 'Scale or loss bug: inputs not normalised, huge initial weights, or the wrong loss.' },
  { id: 'overfit', q: 'Can the model drive the loss on one small batch to almost 0?', cost: 5, generic: 'Bug in the model, loss or training loop: nothing else will help until it is fixed.' },
  { id: 'baseline', q: 'Does the full model beat the simple baselines (the majority class and a simple model such as logistic regression)?', cost: 15, generic: 'No bug, but the model is not earning its keep: read the loss curves and rethink the model.' },
]

interface Case {
  name: string
  symptom: ReactNode
  evidence: Record<CheckId, ReactNode>
  /** index of the first check that fails, or null if every check passes */
  failsAt: number | null
  cause: ReactNode
  fix: ReactNode
}

const OK_DATA = 'You print 8 images with their labels: a ship labelled "ship", a cat labelled "cat", a frog labelled "frog"… every label matches its picture.'
const OK_SHAPES = (
  <>
    inputs <code>(64, 3, 32, 32)</code>, logits <code>(64, 10)</code>, labels <code>(64,)</code>, loss <code>()</code> (a single number). All as expected.
  </>
)

const CASES: Case[] = [
  {
    name: 'Stuck at 10%',
    symptom: 'Image classifier, 10 classes. After 5 epochs the training loss is still 2.30 and accuracy is 10%, exactly as at the start.',
    evidence: {
      data: OK_DATA,
      shapes: OK_SHAPES,
      init: 'Loss at step 0: 2.31. Expected: ln 10 ≈ 2.30.',
      overfit: 'Same 8 images for 200 steps: loss 2.31, 2.31, 2.31, 2.31… it does not move at all, not even by 0.01.',
      baseline: '',
    },
    failsAt: 3,
    cause: (
      <>
        Nothing is being updated. Here the optimiser was built from an <i>old</i> copy of the model: <code>optimizer = SGD(old_model.parameters())</code>. A loss that is
        exactly flat also appears when the learning rate is 0. (Freezing every weight with <code>requires_grad = False</code> does not give a flat line:
        <code>backward()</code> raises an error because nothing needs a gradient.)
      </>
    ),
    fix: <>Build the optimiser from the model you actually train, right after creating it, and check it holds trainable parameters.</>,
  },
  {
    name: 'Starts at 9.7',
    symptom: 'Image classifier, 10 classes. The first logged loss is 9.7; it falls slowly and after 20 epochs accuracy is only 41%.',
    evidence: {
      data: OK_DATA,
      shapes: OK_SHAPES,
      init: 'Loss at step 0: 9.7. Expected: ln 10 ≈ 2.30, so the untrained model is wildly over-confident.',
      overfit: '',
      baseline: '',
    },
    failsAt: 2,
    cause: (
      <>
        An untrained model should be unsure (about 1/10 on each class). A loss of 9.7 means it gives the right class a probability of about e<sup>−9.7</sup>: its outputs
        are far too large. Here the pixels went in as 0 to 255 instead of being scaled to 0 to 1.
      </>
    ),
    fix: <>Normalise the inputs (divide by 255, then standardise). Other causes of a high first loss: huge initial weights, or the wrong loss function.</>,
  },
  {
    name: 'Chance-level validation',
    symptom: 'Image classifier, 10 classes. Training loss creeps down very slowly; validation accuracy hovers around 10%.',
    evidence: {
      data: 'You print 8 images with their labels: a ship labelled "frog", a cat labelled "truck", a horse labelled "horse", a plane labelled "deer"… most labels do not match the pictures.',
      shapes: '',
      init: '',
      overfit: '',
      baseline: '',
    },
    failsAt: 0,
    cause: <>The labels were shuffled separately from the images, so most image–label pairs are wrong. No model can learn a rule that is not there.</>,
    fix: <>Shuffle images and labels together (one shared index, or a DataLoader with <code>shuffle=True</code>), then print a few pairs again.</>,
  },
  {
    name: 'Flat regression',
    symptom: 'House-price regression. The loss stops falling at a high value and the model predicts almost the same price for every house.',
    evidence: {
      data: 'You print 5 rows: floor area, age, town and price all look sensible.',
      shapes: (
        <>
          predictions <code>(64, 1)</code>, targets <code>(64,)</code>, and <code>(pred - target)</code> is <code>(64, 64)</code>!
        </>
      ),
      init: '',
      overfit: '',
      baseline: '',
    },
    failsAt: 1,
    cause: (
      <>
        Broadcasting: a <code>(64, 1)</code> column minus a <code>(64,)</code> row gives a 64 × 64 table of <i>every</i> prediction minus <i>every</i> price. The loss
        compares each house with all 64 prices, so the best the model can do is predict the average price.
      </>
    ),
    fix: (
      <>
        Make the shapes match: <code>pred.squeeze(1)</code> or <code>target.view(-1, 1)</code>.
      </>
    ),
  },
  {
    name: 'Beaten by a baseline',
    symptom: 'Tabular data with 1,000 rows, 2 classes. A 6-layer network reaches 70% validation accuracy.',
    evidence: {
      data: 'You print 5 rows: the features and the yes/no labels look sensible.',
      shapes: (
        <>
          inputs <code>(32, 12)</code>, logits <code>(32, 2)</code>, labels <code>(32,)</code>, loss <code>()</code>. As expected.
        </>
      ),
      init: 'Loss at step 0: 0.70. Expected: ln 2 ≈ 0.69.',
      overfit: 'One batch of 8 rows: the loss falls to 0.002 within 100 steps.',
      baseline: 'Always predicting the more common class: 61%. Logistic regression on the same split: 78%. The network (70%) loses to the simple model.',
    },
    failsAt: 4,
    cause: <>The code works, but this network is the wrong tool for 1,000 rows: it memorises the training set (check the loss curves for a widening gap).</>,
    fix: <>Use the simpler model, or shrink and regularise the network; tune one thing at a time, and keep the baseline as the score to beat.</>,
  },
  {
    name: 'Wants more accuracy',
    symptom: 'Sentiment classifier, 2 classes. Validation accuracy is 81% and you would like more.',
    evidence: {
      data: 'You print 5 reviews: "Loved it!" labelled positive, "Waste of money" labelled negative… all sensible.',
      shapes: (
        <>
          token ids <code>(32, 128)</code>, logits <code>(32, 2)</code>, labels <code>(32,)</code>, loss <code>()</code>. As expected.
        </>
      ),
      init: 'Loss at step 0: 0.70. Expected: ln 2 ≈ 0.69.',
      overfit: 'One batch of 8 reviews: the loss falls to 0.003 within 150 steps.',
      baseline: 'Always predicting the more common class: 52%. Logistic regression on word counts: 74%. Your model: 81%.',
    },
    failsAt: null,
    cause: '',
    fix: '',
  },
]

type Answer = 'pass' | 'fail'

export default function DebugDecisionTree() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const [ci, setCi] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [wrong, setWrong] = useState<{ at: number; said: Answer } | null>(null)
  const c = CASES[ci]
  const truth = (i: number): Answer => (c.failsAt !== null && i === c.failsAt ? 'fail' : 'pass')
  const stoppedAt = answers.findIndex((a) => a === 'fail')
  const finished = stoppedAt >= 0 || answers.length === CHECKS.length
  const active = finished ? -1 : answers.length
  const minutes = answers.reduce((t, _, i) => t + CHECKS[i].cost, 0)

  const choose = (a: Answer) => {
    if (a !== truth(active)) {
      setWrong({ at: active, said: a })
      return
    }
    setWrong(null)
    setAnswers((xs) => [...xs, a])
  }
  const pickCase = (i: number) => {
    setCi(i)
    setAnswers([])
    setWrong(null)
  }

  return (
    <Figure
      title="The debugging routine"
      caption={
        <>
          Pick a case, then run the checks in order. Read the evidence each check gives you and decide whether it passes. The first failing check points to the cause;
          if everything passes, there is no bug and it is time to tune. The minutes are rough costs: notice that the five checks together take about half an hour,
          while a hyperparameter search takes hours and can never fix a bug.
        </>
      }
    >
      <div ref={wrapRef} className={narrow ? s.narrow : undefined} style={{ width: '100%', display: 'grid', gap: '0.8rem' }}>
        <Section label="Case">
          <Chips label="Case">
            {CASES.map((k, i) => (
              <Chip key={k.name} state={i === ci ? 'selected' : 'idle'} onClick={() => pickCase(i)}>
                {k.name}
              </Chip>
            ))}
          </Chips>
        </Section>
        <div className={s.symptom}>
          <span className={s.symptomLabel}>Symptom</span>
          {c.symptom}
        </div>
        <div className={s.tree} role="list" aria-label="Debugging checks">
          {CHECKS.map((ch, i) => {
            const state = i < answers.length ? (answers[i] === 'pass' ? 'passed' : 'failed') : i === active ? 'active' : 'pending'
            const shown = i <= answers.length && !(stoppedAt >= 0 && i > stoppedAt)
            const exitLit = state === 'failed'
            return (
              <div key={ch.id} role="listitem">
                {i > 0 && (
                  <div className={`${s.connector}${i <= answers.length && answers[i - 1] === 'pass' ? ' ' + s.lit : ''}`} aria-hidden="true">
                    yes
                  </div>
                )}
                <div className={s.row}>
                  <div className={`${s.node} ${s[state]}`}>
                    <div className={s.nodeHead}>
                      <span className={s.num}>{state === 'passed' ? '✓' : state === 'failed' ? '✗' : i + 1}</span>
                      <span className={s.q}>{ch.q}</span>
                      <span className={s.cost}>~{ch.cost} min</span>
                    </div>
                    {shown && c.evidence[ch.id] && <div className={s.evidence}>{c.evidence[ch.id]}</div>}
                    {state === 'active' && (
                      <div className={s.answer}>
                        <Button primary onClick={() => choose('pass')}>
                          Yes, passes
                        </Button>
                        <Button onClick={() => choose('fail')}>No, something is wrong</Button>
                      </div>
                    )}
                    {wrong && wrong.at === i && state === 'active' && (
                      <div style={{ marginTop: '0.45rem' }}>
                        <Note tone="warn">
                          {wrong.said === 'pass'
                            ? 'Look again: compare the evidence with what a correct pipeline would show here.'
                            : 'Look again: this evidence is exactly what a correct pipeline shows, so this check passes.'}
                        </Note>
                      </div>
                    )}
                  </div>
                  <div className={`${s.exit}${exitLit ? ' ' + s.lit : ''}`}>
                    <span className={s.exitLabel}>No →</span>
                    {exitLit ? (
                      <>
                        <b>{c.cause}</b> <span style={{ display: 'block', marginTop: '0.3rem' }}>Fix: {c.fix}</span>
                      </>
                    ) : (
                      ch.generic
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div className={`${s.connector}${answers.length === CHECKS.length && stoppedAt < 0 ? ' ' + s.lit : ''}`} aria-hidden="true">
            yes
          </div>
          <div className={`${s.final}${answers.length === CHECKS.length && stoppedAt < 0 ? ' ' + s.lit : ''}`}>
            <b>No bug found.</b> Now improve the model with experiments (learning rate, regularisation, size, more data), <b>one change at a time</b>, keeping a log
            of each run. <span className={s.cost}>hours</span>
          </div>
        </div>
        {finished && (
          <Note tone={stoppedAt >= 0 ? 'bad' : 'good'}>
            {stoppedAt >= 0 ? (
              <>
                <b>Found it at check {stoppedAt + 1}</b>, after about {minutes} minutes of checks. Tuning hyperparameters first would have burned hours of runs without
                touching the real problem.
              </>
            ) : (
              <>
                <b>All five checks pass</b> (about {minutes} minutes). The pipeline is trustworthy, so experiments on the model are now worth their cost.
              </>
            )}{' '}
            <button type="button" className="btn btn-small" style={{ marginLeft: '0.3rem' }} onClick={() => pickCase((ci + 1) % CASES.length)}>
              Next case
            </button>
          </Note>
        )}
      </div>
    </Figure>
  )
}
