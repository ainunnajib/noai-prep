import { useState, type ReactNode } from 'react'
import { Figure, Button, M } from '../../../../../kit'
import s from '../prelim-problem-solving/ppw.module.css'
import { OptionList, Note, LessonLink, cx } from '../prelim-problem-solving/shared'
import { CodePanel, type LineState } from './CodePanel'
import { FINAL_ITEMS } from './finalItems'

/*
  Four 2026 Final MCQs read the way an examiner wrote them. 1) click the line you suspect, 2) answer,
  3) step through the reasoning trail: the lines an expert reads, in order, and why each option fails.
  Stems, code and options are verbatim (finalItems.ts is generated from the paper JSON).
*/

interface TrailStep {
  lines: number[]
  text: ReactNode
}
interface Walk {
  n: number
  decisive: number[]
  trail: TrailStep[]
  why: ReactNode[]
  concept: ReactNode
  lessons: { to: string; label: string }[]
  caveat?: ReactNode
}

const WALKS: Walk[] = [
  {
    n: 3,
    decisive: [3],
    trail: [
      {
        lines: [],
        text: (
          <>
            Question line first: two cross-validation scores, 92% and 78%, for the same model. When two ways of measuring the same thing disagree by 14 points,
            ask what each one lets the <b>validation rows</b> influence.
          </>
        ),
      },
      {
        lines: [3],
        text: (
          <>
            Approach A chooses the 10 best features using <code>X</code> and <code>y</code> of <b>every</b> row, including the rows that later become validation
            folds. The validation labels helped pick the features.
          </>
        ),
      },
      { lines: [4], text: <>Cross-validation then scores folds that already shaped the feature choice, so 92% is optimistically biased.</> },
      {
        lines: [11, 12, 13],
        text: (
          <>
            Approach B builds a fresh selector inside each fold, fits it on the training rows only and merely <i>applies</i> it (<code>transform</code>) to the
            validation rows. That copies how the model will meet truly unseen data, so 78% is the honest number.
          </>
        ),
      },
    ],
    why: [
      'stability is no excuse: a precise but biased estimate is worse than an honest, slightly noisier one.',
      "Approach A's selector saw the validation folds' labels; B fits selection inside each fold, so its 78% is the reliable estimate.",
      'Approach A does not measure "optimal features"; it measures features chosen with the answers in view.',
      'a separate held-out set for selection is legitimate but wasteful, and selection inside the CV loop (Approach B) is already correct.',
    ],
    concept: <>Data leakage: every step that learns from data (selection, scaling, imputation) must be fitted inside the cross-validation loop.</>,
    lessons: [
      { to: 'data-and-features/splitting-and-leakage', label: 'Splitting data and avoiding leakage' },
      { to: 'model-evaluation/cross-validation-and-tuning', label: 'Cross-validation and hyperparameter tuning' },
    ],
  },
  {
    n: 5,
    decisive: [18],
    trail: [
      {
        lines: [12],
        text: (
          <>
            Check each labelled line against the formula you know. Line A: the weighted error <M>{'\\varepsilon = \\sum_i w_i[\\text{wrong}_i]/\\sum_i w_i'}</M>.
            Correct.
          </>
        ),
      },
      {
        lines: [14, 15],
        text: <>Line B stops when a stump is worse than chance. Whether it is <code>&gt;</code> or <code>&gt;=</code> only matters at exactly 0.5: an edge case, not &ldquo;performs poorly&rdquo;.</>,
      },
      {
        lines: [17],
        text: (
          <>
            Line C: <M>{'\\alpha = \\tfrac12\\ln\\frac{1-\\varepsilon}{\\varepsilon}'}</M>; the <code>1e-10</code> only prevents division by zero. Textbook.
          </>
        ),
      },
      {
        lines: [18],
        text: (
          <>
            Line D. The textbook update multiplies mistakes by <M>{'e^{+\\alpha}'}</M> and correct points by <M>{'e^{-\\alpha}'}</M>. Here correct points stay at{' '}
            <M>{'\\times 1'}</M>, so a mistake ends up only <M>{'e^{\\alpha}'}</M> times heavier than a correct point instead of <M>{'e^{2\\alpha}'}</M>: half the
            intended effect on a log scale. <code>2*incorrect - 1</code> turns 0/1 into −1/+1 and restores the symmetric
            rule.
          </>
        ),
      },
    ],
    why: [
      '> versus >= only differs when the error is exactly 0.5, which almost never happens.',
      'with Line D unchanged this is in fact a correct variant (AdaBoost.M1); the key wanted the symmetric update (see the caveat).',
      'Line D leaves correct points at ×1; exp(alpha * (2*incorrect - 1)) also shrinks them by e^(−α), exactly as the textbook rule does.',
      'backwards: shrinking the weights of mistakes makes the booster ignore its hard points.',
    ],
    concept: (
      <>
        The AdaBoost update <M>{'w_i \\leftarrow w_i\\,e^{-\\alpha y_i h(x_i)}'}</M>: mistakes go up, correct points go down.
      </>
    ),
    lessons: [{ to: 'trees-and-ensembles/boosting-adaboost', label: 'Boosting and AdaBoost' }],
    caveat: (
      <>
        Flaw in this question: dropping the 0.5 in Line C while keeping Line D (option B) gives AdaBoost.M1, whose re-weighting ratio <M>{'e^{2\\alpha}'}</M>{' '}
        matches the textbook&rsquo;s, and doubling every <M>{'\\alpha'}</M> does not change the sign of the vote. We checked: identical predictions. The original
        code is weaker, not badly broken. The official key is the symmetric form, which is the one worth remembering.
      </>
    ),
  },
  {
    n: 10,
    decisive: [7],
    trail: [
      { lines: [6], text: <><code>criterion</code> returns the <b>mean</b> loss over the micro-batch.</> },
      { lines: [8], text: <><code>loss.backward()</code> <b>adds</b> new gradients onto <code>.grad</code>; nothing is cleared until line 12.</> },
      {
        lines: [10, 11, 12],
        text: <>The optimiser steps only every 4 micro-batches, so <code>.grad</code> then holds the <b>sum</b> of 4 mean-gradients: 4× too big. With plain SGD that is exactly a 4× learning rate (Adam largely cancels a constant scale, but gradient clipping and weight decay still see the wrong size).</>,
      },
      {
        lines: [7],
        text: <>Dividing each loss by 4 turns that sum into an average: exactly the gradient of one batch 4 times as large (a ratio of 1.0 instead of 4.0 in the check below).</>,
      },
    ],
    why: [
      'four summed mean-gradients are 4× too big; dividing each loss by 4 makes the total their average.',
      'nothing overflows; the gradient is 4× too large, which is a scale error, not a numerical one.',
      'it is not just for logging: it changes the gradient, and so every single update.',
      'BatchNorm still sees micro-batches of the small size; dividing the loss cannot change that.',
    ],
    concept: <>Gradients accumulate by addition, so divide each micro-batch loss by the number of accumulation steps.</>,
    lessons: [{ to: 'training-deep-networks/stability-and-scale', label: 'Gradient clipping, mixed precision and accumulation' }],
  },
  {
    n: 18,
    decisive: [21, 27],
    trail: [
      { lines: [19, 20], text: <>Words become ids; unknown words become <code>&lt;UNK&gt;</code>. Fine.</> },
      { lines: [21], text: <><code>&lt;BOS&gt;</code> and <code>&lt;EOS&gt;</code> are added <b>first</b>&hellip;</> },
      {
        lines: [24, 26, 27],
        text: <>&hellip;and only then is the list cut to <code>max_len</code>. Slicing keeps the front, so the first token to be cut is <code>&lt;EOS&gt;</code>.</>,
      },
      {
        lines: [],
        text: (
          <>
            Now count, as the examiner should have: 8 words + <code>&lt;BOS&gt;</code> + <code>&lt;EOS&gt;</code> = 10 = <code>max_len</code>. The else-branch keeps all
            10, so for this exact input <code>&lt;EOS&gt;</code> survives; with 9 or more words it is lost. Fix: truncate the words to <code>max_len - 2</code>{' '}
            <i>before</i> adding the markers.
          </>
        ),
      },
    ],
    why: [
      'a content budget of max_len − 2 is a design choice, not a bug.',
      '−100 is the label value that cross_entropy ignores; padding input ids with 0 is normal.',
      'a word-level vocabulary is a limitation, not a flaw in this encoding.',
      'the code adds <EOS> before truncating, so any input longer than max_len − 2 words loses its end marker.',
    ],
    concept: <>Order of operations at the edges: add special tokens after truncating, never before.</>,
    lessons: [{ to: 'text-as-data/tokenisation', label: 'Tokenisation, vocabularies and padding' }],
    caveat: <>Flawed example: the given sentence has 8 words and fits exactly, so the flaw needs a 9-word input to show. We checked by running the code.</>,
  },
]

type Phase = 'line' | 'options' | 'trail'
interface WState {
  suspect: number | null
  phase: Phase
  pick: number | null
  step: number
}
const fresh = (): WState => ({ suspect: null, phase: 'line', pick: null, step: 0 })

function Rich({ text }: { text: string }) {
  // render `code` spans inside stem text
  const parts = text.split(/(`[^`]+`)/)
  return <>{parts.map((p, i) => (p.startsWith('`') ? <code key={i}>{p.slice(1, -1)}</code> : <span key={i}>{p}</span>))}</>
}

export default function CodeMCQWalkthrough() {
  const [idx, setIdx] = useState(0)
  const [all, setAll] = useState<WState[]>(() => WALKS.map(fresh))
  const w = WALKS[idx]
  const item = FINAL_ITEMS[w.n]
  const st = all[idx]
  const set = (patch: Partial<WState>) => setAll((a) => a.map((x, i) => (i === idx ? { ...x, ...patch } : x)))
  const last = w.trail.length - 1
  const step = w.trail[st.step]
  const showDecisive = st.phase === 'trail' && st.step === last

  const lineState = (n: number): LineState => {
    if (st.phase === 'trail') {
      if (step.lines.includes(n)) return 'hl'
      if (showDecisive && w.decisive.includes(n)) return 'found'
      if (n === st.suspect) return 'picked'
      return 'plain'
    }
    return n === st.suspect ? 'picked' : 'plain'
  }
  const notes: Record<number, ReactNode> = {}
  if (st.phase !== 'trail' && st.suspect) notes[st.suspect] = <i>Your suspect line. Click another line to change it.</i>

  const lineHit = st.suspect !== null && w.decisive.includes(st.suspect)
  const correct = all.filter((x, i) => x.pick === FINAL_ITEMS[WALKS[i].n].answer).length
  const lineHits = all.filter((x, i) => x.suspect !== null && x.pick !== null && WALKS[i].decisive.includes(x.suspect)).length
  const answered = all.filter((x) => x.pick !== null).length

  return (
    <Figure
      title="Four Final MCQs, read line by line"
      caption={
        <>
          Real 2026 Final questions, word for word. First click the line you suspect, then choose an option, then step through the reasoning trail: the lines an
          expert reads, in order, with the rule each one is checked against. Compare your line with the decisive one. Notice that every answer comes from one
          line read against one formula or rule.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.row} role="tablist" aria-label="Questions">
          {WALKS.map((ww, i) => {
            const x = all[i]
            const ans = FINAL_ITEMS[ww.n].answer
            const mark = x.pick === null ? '' : x.pick === ans ? ' ✓' : ' ✗'
            return (
              <button
                key={ww.n}
                type="button"
                role="tab"
                aria-selected={i === idx}
                className={cx(s.chip, i === idx && s.selected, x.pick !== null && i !== idx && (x.pick === ans ? s.good : s.bad))}
                onClick={() => setIdx(i)}
              >
                Final Q{ww.n}
                {mark}
              </button>
            )
          })}
        </div>
        <div className={s.stepCard} aria-live="polite">
          {st.phase === 'line' && (
            <>
              <span className={s.label}>1 · Find the line</span>
              <span>Read the question line under the code, then click the line you think decides it. No options yet.</span>
            </>
          )}
          {st.phase === 'options' && (
            <>
              <span className={s.label}>2 · Choose</span>
              <span>Now the options. Judge each one against your line.</span>
            </>
          )}
          {st.phase === 'trail' && (
            <>
              <span className={s.label}>
                3 · Reasoning trail, step {st.step + 1} of {w.trail.length}
              </span>
              <span>{step.text}</span>
            </>
          )}
        </div>
        <div className={s.chartStem}>
          <Rich text={item.before} />
        </div>
        <CodePanel
          lines={item.code}
          state={lineState}
          notes={notes}
          onLine={st.phase === 'trail' ? undefined : (n) => set({ suspect: n, phase: 'options' })}
          ariaLabel={`Code of Final Q${w.n}`}
          title={`2026 Final Q${w.n}${st.phase === 'trail' ? '' : ' · click a line'}`}
        />
        <div className={s.ask}>
          <Rich text={item.after} />
        </div>
        {st.phase === 'line' && (
          <div className={s.row}>
            <Button onClick={() => set({ phase: 'options' })}>Not sure: show the options</Button>
          </div>
        )}
        {st.phase !== 'line' && (
          <OptionList
            options={item.options.map((o) => ({ text: o }))}
            answer={item.answer}
            picked={st.pick}
            onPick={(i) => set({ pick: i, phase: 'trail', step: 0 })}
            reveal={st.pick !== null}
            why={w.why}
            ariaLabel={`Options of Final Q${w.n}`}
          />
        )}
        {st.phase === 'trail' && (
          <div className={s.row}>
            <Button onClick={() => set({ step: Math.max(0, st.step - 1) })} disabled={st.step === 0}>
              Back
            </Button>
            <Button primary onClick={() => set({ step: Math.min(last, st.step + 1) })} disabled={st.step === last}>
              Next step
            </Button>
            <Button onClick={() => set(fresh())}>Try again</Button>
          </div>
        )}
        {showDecisive && (
          <Note tone={lineHit ? 'good' : 'info'}>
            <b>Decisive line{w.decisive.length > 1 ? 's' : ''}: {w.decisive.join(' and ')}.</b>{' '}
            {st.suspect === null ? 'You went straight to the options.' : lineHit ? `You picked line ${st.suspect}: spot on.` : `You picked line ${st.suspect}.`} Concept:{' '}
            {w.concept} Learn it:{' '}
            {w.lessons.map((l, i) => (
              <span key={l.to}>
                {i ? ' · ' : ''}
                <LessonLink to={l.to}>{l.label}</LessonLink>
              </span>
            ))}
            .
          </Note>
        )}
        {showDecisive && w.caveat && <Note tone="warn">{w.caveat}</Note>}
        <div className={s.muted}>
          Answered {answered} of {WALKS.length} · correct {correct} · decisive line found first {lineHits}
        </div>
      </div>
    </Figure>
  )
}
