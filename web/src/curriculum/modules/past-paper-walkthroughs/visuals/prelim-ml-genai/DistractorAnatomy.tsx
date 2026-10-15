import { useState, type CSSProperties } from 'react'
import { Figure, Button, Bars } from '../../../../../kit'
import s from '../prelim-maths-computing/pp.module.css'

/*
  Thirteen real 2026 Prelim questions with every wrong option labelled by the misconception it
  was built from. Click a wrong option, name its trap, then see whether you were right.
  The bar chart counts the trap types over all 39 wrong options.
*/

type Trap = 'twin' | 'opposite' | 'cause' | 'true' | 'overclaim' | 'slip' | 'filler'

const TRAPS: Record<Trap, { name: string; colour: string; desc: string }> = {
  twin: { name: 'Confusable twin', colour: 'var(--viz-1)', desc: 'the right answer to a neighbouring concept (bagging for boosting, precision for recall)' },
  opposite: { name: 'Opposite effect', colour: 'var(--viz-2)', desc: 'flips the direction: reduces for increases, under- for overfitting' },
  cause: { name: 'Wrong reason', colour: 'var(--viz-3)', desc: 'a plausible-sounding cause or benefit that is not the real one' },
  true: { name: 'True, but not the point', colour: 'var(--viz-5)', desc: 'a correct or half-correct statement that does not answer what was asked' },
  overclaim: { name: 'Overclaim', colour: 'var(--viz-4)', desc: 'an absolute word: only, always, never, cannot' },
  slip: { name: 'Half-done working', colour: 'var(--viz-6)', desc: 'the number you get by skipping, swapping or substituting one step' },
  filler: { name: 'Filler', colour: 'var(--viz-muted)', desc: 'unrelated or empty: a free elimination' },
}
const ORDER: Trap[] = ['twin', 'opposite', 'cause', 'true', 'overclaim', 'slip', 'filler']

interface Item {
  n: number
  q: string
  options: string[]
  answer: number
  key: string
  traps: (Trap | null)[]
  notes: string[]
}

const ITEMS: Item[] = [
  {
    n: 154,
    q: 'In ensemble methods, bagging reduces:',
    options: ['Bias', 'Training time', 'Model complexity', 'Variance'],
    answer: 3,
    key: 'Averaging many deep trees, each trained on a different bootstrap sample, cancels out their random errors: variance falls.',
    traps: ['twin', 'opposite', 'opposite', null],
    notes: ['Boosting’s answer. Bagging averages deep trees whose bias is already low.', 'Bagging trains many models, so it costs more time, not less.', 'A forest of 100 trees is more complex than one tree, not less.', ''],
  },
  {
    n: 2,
    q: 'Given vector v = [3, 4], what is its L2 norm (Euclidean length)?',
    options: ['5', '7', '25', '12'],
    answer: 0,
    key: '√(3² + 4²) = √25 = 5.',
    traps: [null, 'slip', 'slip', 'slip'],
    notes: ['', 'Added the entries without squaring: 3 + 4 = 7, which is the L1 norm.', 'Squared and added but forgot the square root: 9 + 16 = 25.', 'Swapped the operation: multiplied the entries, 3 × 4 = 12, instead of squaring and adding.'],
  },
  {
    n: 56,
    q: 'What is recall (sensitivity) in classification?',
    options: ['TP / (TP + FP)', 'TN / (TN + FN)', '(TP + TN) / Total', 'TP / (TP + FN)'],
    answer: 3,
    key: 'Recall = of all the real positives, the share you caught: TP / (TP + FN).',
    traps: ['twin', 'twin', 'twin', null],
    notes: ['That is precision: of everything flagged positive, the share that was right.', 'The mirror image for the negative class (negative predictive value).', 'That is accuracy.', ''],
  },
  {
    n: 148,
    q: 'L1 regularisation (Lasso) tends to:',
    options: ['Produce dense models', 'Have no effect', 'Only work for classification', 'Produce sparse models (many zero weights)'],
    answer: 3,
    key: 'The L1 penalty |w| keeps pushing small weights all the way to exactly 0, so many features drop out.',
    traps: ['opposite', 'filler', 'overclaim', null],
    notes: ['The opposite: L1 zeroes weights out. Shrinking without zeroing is what L2 does.', 'A penalty on the weights clearly has an effect.', '“Only”, and wrong too: L1 works for regression (Lasso) and classification (L1-penalised logistic regression) alike.', ''],
  },
  {
    n: 155,
    q: 'Boosting reduces:',
    options: ['Variance only', 'Both equally', 'Neither', 'Bias'],
    answer: 3,
    key: 'Each new weak learner corrects what the ensemble still gets wrong, so bias falls step by step.',
    traps: ['twin', 'true', 'filler', null],
    notes: ['Bagging’s answer, with an “only” on top.', 'Half-true: boosting can lower variance a little, but “equally” overstates it and the question wants the main effect.', 'Boosting obviously changes the error.', ''],
  },
  {
    n: 172,
    q: 'Why is ReLU preferred over sigmoid in hidden layers?',
    options: ['Always outputs between 0-1', 'More complex', 'Requires less memory', 'Avoids vanishing gradients, faster computation'],
    answer: 3,
    key: 'ReLU’s slope is 1 for positive inputs, so gradients do not shrink layer after layer, and max(0, x) is cheap to compute.',
    traps: ['twin', 'opposite', 'cause', null],
    notes: ['That is the sigmoid’s range; ReLU has no upper limit. The “always” is a second warning.', 'ReLU, max(0, x), is simpler than the sigmoid.', 'Memory use is about the same; the real gains are gradient flow and speed.', ''],
  },
  {
    n: 176,
    q: 'Xavier/Glorot initialisation is designed for:',
    options: ['ReLU activations', 'No activations', 'Tanh and sigmoid activations', 'Output layers only'],
    answer: 2,
    key: 'Xavier keeps the signal’s spread steady through zero-centred activations like tanh (and, roughly, sigmoid).',
    traps: ['twin', 'true', null, 'overclaim'],
    notes: ['That is He (Kaiming) initialisation, made for ReLU.', 'Part of the derivation (it treats the activation as nearly straight around 0), but not what it was designed for.', '', 'It is used for every layer, not only the output.'],
  },
  {
    n: 178,
    q: 'Early stopping prevents:',
    options: ['Underfitting', 'Training from starting', 'Gradient computation', 'Overfitting by stopping when validation error increases'],
    answer: 3,
    key: 'Stop when the validation error starts to rise: that is where the model begins memorising the training set.',
    traps: ['opposite', 'filler', 'filler', null],
    notes: ['Stopping early can only make a model fit less, so it fights overfitting. (Stop too early and you cause underfitting.)', 'Nonsense: it acts at the end of training.', 'Gradients are computed as usual until you stop.', ''],
  },
  {
    n: 185,
    q: 'What is layer normalisation and when is it preferred over batch norm?',
    options: ['Same as batch norm', 'Only for CNNs', 'Normalises across features per sample; better for small batches/RNNs', 'Slower than batch norm'],
    answer: 2,
    key: 'LayerNorm normalises each sample over its own features, so it does not care about batch size or sequence length.',
    traps: ['filler', 'overclaim', null, 'cause'],
    notes: ['Empty: the question itself asks how they differ. (They average over different axes: BatchNorm across the batch, LayerNorm across one sample’s features.)', '“Only”, and backwards: CNNs are BatchNorm’s home; LayerNorm is the Transformer and RNN choice.', '', 'Speed is not the difference that matters, and the question asks when it is preferred.'],
  },
  {
    n: 213,
    q: 'What is the key difference between BERT and GPT?',
    options: ['They are identical', 'BERT is for vision', 'BERT = bidirectional encoder, GPT = autoregressive decoder', 'GPT is older'],
    answer: 2,
    key: 'BERT is an encoder that reads both directions; GPT is a decoder that predicts the next token from the left.',
    traps: ['filler', 'filler', null, 'true'],
    notes: ['Empty: their architectures clearly differ.', 'Wrong modality: BERT is a text model. A free elimination.', '', 'True for GPT-1 (June 2018) and BERT (October 2018), but a date is not a difference in how the models work.'],
  },
  {
    n: 235,
    q: 'LoRA (Low-Rank Adaptation) enables:',
    options: ['Faster inference', 'Efficient fine-tuning by training low-rank weight adapters', 'Larger models', 'Data augmentation'],
    answer: 1,
    key: 'Freeze the big weight matrix W and train a small low-rank update BA instead.',
    traps: ['cause', null, 'opposite', 'filler'],
    notes: ['LoRA makes fine-tuning cheaper; inference is at best as fast as the base model.', '', 'LoRA adds a sliver of weights to make adaptation smaller, not models larger.', 'Nothing to do with the data.'],
  },
  {
    n: 244,
    q: 'Why are diffusion models slower than Generative Adversarial Network (GAN) at inference?',
    options: ['Larger model size', 'More parameters', 'Require many iterative denoising steps', 'GPU limitations'],
    answer: 2,
    key: 'A GAN runs its generator once; a diffusion model runs its network once per denoising step, tens to a thousand times.',
    traps: ['cause', 'cause', null, 'filler'],
    notes: ['Size is not the issue; the number of passes is.', 'Says the same as “larger model size”: twin options, so both go.', '', 'Both run on the same GPU.'],
  },
  {
    n: 245,
    q: 'DDPM (Denoising Diffusion Probabilistic Model) defines diffusion as:',
    options: ['Single-step generation', 'Deterministic process', 'Markov Chain with learnt reverse process', 'Classification task'],
    answer: 2,
    key: 'A fixed chain adds noise step by step; a learnt chain removes it, with fresh randomness at each step.',
    traps: ['opposite', 'twin', null, 'filler'],
    notes: ['Diffusion is many small steps; one-step generation is a GAN.', 'That is DDIM, a later deterministic sampler.', '', 'Diffusion generates; it does not classify.'],
  },
]

const COUNTS = ORDER.map((t) => ({ t, n: ITEMS.reduce((a, it) => a + it.traps.filter((x) => x === t).length, 0) }))
const TOTAL_WRONG = COUNTS.reduce((a, c) => a + c.n, 0)
const LETTERS = 'ABCD'

interface Revealed {
  guess?: Trap
}

export default function DistractorAnatomy() {
  const [filter, setFilter] = useState<Trap | 'all'>('all')
  const [qi, setQi] = useState(0)
  const [rev, setRev] = useState<Record<string, Revealed>>({ '154-0': {} })
  const [pending, setPending] = useState<number | null>(null)

  const list = ITEMS.map((it, i) => ({ it, i })).filter(({ it }) => filter === 'all' || it.traps.includes(filter))
  const item = ITEMS[qi]
  const keyOf = (k: number) => `${item.n}-${k}`
  const guessed = Object.entries(rev).filter(([, v]) => v.guess)
  const guessedRight = guessed.filter(([k, v]) => {
    const [n, o] = k.split('-').map(Number)
    const it = ITEMS.find((x) => x.n === n)!
    return it.traps[o] === v.guess
  }).length

  const clickOption = (k: number) => {
    if (rev[keyOf(k)]) return
    if (k === item.answer) {
      setRev((r) => ({ ...r, [keyOf(k)]: {} }))
      setPending(null)
    } else setPending(k)
  }
  const name = (t: Trap | undefined) => {
    if (pending == null) return
    setRev((r) => ({ ...r, [keyOf(pending)]: t ? { guess: t } : {} }))
    setPending(null)
  }
  const goto = (i: number) => {
    setQi(i)
    setPending(null)
  }
  const revealAll = () => {
    const next = { ...rev }
    item.options.forEach((_, k) => {
      if (!next[keyOf(k)]) next[keyOf(k)] = {}
    })
    setRev(next)
    setPending(null)
  }

  return (
    <Figure
      title="Name the trap"
      caption={
        <>
          Click a wrong option, say which trap it is, and check. Use the filter to collect all the questions with one kind of trap. Notice how predictable the wrong options are: the chart counts all {TOTAL_WRONG} of them, and confusable twins and opposite effects are the most common deliberate traps, while fillers are free eliminations. (Q2 and Q56 come from the maths block, because half-done working needs numbers.)
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.group}>
          <span className={s.label}>Filter by trap</span>
          <div className={s.row}>
            <button type="button" className={`${s.chip}${filter === 'all' ? ` ${s.chipOn}` : ''}`} onClick={() => setFilter('all')}>
              All 13 questions
            </button>
            {ORDER.map((t) => (
              <button
                key={t}
                type="button"
                title={TRAPS[t].desc}
                className={`${s.chip}${filter === t ? ` ${s.chipOn}` : ''}`}
                onClick={() => {
                  setFilter(t)
                  const first = ITEMS.findIndex((it) => it.traps.includes(t))
                  if (first >= 0 && !ITEMS[qi].traps.includes(t)) goto(first)
                }}
              >
                <span className={s.swatch} style={{ background: TRAPS[t].colour }} />
                {TRAPS[t].name}
              </button>
            ))}
          </div>
        </div>
        <div className={s.group}>
          <span className={s.label}>Questions{filter !== 'all' ? ` with a “${TRAPS[filter].name}” option` : ''}</span>
          <div className={s.nav}>
            {list.map(({ it, i }) => (
              <button key={it.n} type="button" className={`${s.navChip}${i === qi ? ` ${s.navOn}` : ''}`} onClick={() => goto(i)} aria-current={i === qi ? 'true' : undefined}>
                Q{it.n}
                {it.n < 120 ? ' (maths)' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className={s.card}>
          <span className={s.label}>
            2026 Prelim · Q{item.n}
            {item.n < 120 ? ' · from the maths block' : ''}
          </span>
          <div className={s.qtext}>{item.q}</div>
          <div className={s.opts}>
            {item.options.map((o, k) => {
              const r = rev[keyOf(k)]
              const isAns = k === item.answer
              const trap = item.traps[k]
              const colour = isAns ? 'var(--ok)' : trap ? TRAPS[trap].colour : 'var(--rule)'
              const dim = filter !== 'all' && r && !isAns && trap !== filter
              const style: CSSProperties = r ? { borderLeft: `6px solid ${colour}`, opacity: dim ? 0.55 : 1 } : {}
              let cls = 'qopt'
              if (r && isAns) cls += ' is-answer'
              else if (pending === k) cls += ' is-selected'
              return (
                <div key={k} className={s.optWrap}>
                  <button type="button" className={cls} style={style} onClick={() => clickOption(k)} aria-expanded={Boolean(r)}>
                    <span className="qopt-letter" aria-hidden="true">
                      {LETTERS[k]}
                    </span>
                    <span className="qopt-text">
                      {o}
                      {r && (
                        <span className={s.tag} style={{ display: 'table', marginTop: '0.3rem', background: `color-mix(in srgb, ${colour} 22%, var(--surface))` }}>
                          {isAns ? '✓ Answer' : TRAPS[trap!].name}
                        </span>
                      )}
                    </span>
                  </button>
                  {r && (
                    <div className={`${s.optNote} ${isAns ? s.optNoteRight : ''}`} style={isAns ? undefined : { borderLeftColor: colour }}>
                      {isAns ? item.key : item.notes[k]}
                      {!isAns && r.guess && (
                        <strong style={{ color: r.guess === trap ? 'var(--ok)' : 'var(--bad)' }}> {r.guess === trap ? ' You named it.' : ` You said “${TRAPS[r.guess].name}”.`}</strong>
                      )}
                    </div>
                  )}
                  {pending === k && (
                    <div className={s.cardSoft} style={{ marginLeft: '2.6rem' }}>
                      <span className={s.small}>Which trap is this option?</span>
                      <div className={s.row}>
                        {ORDER.map((t) => (
                          <button key={t} type="button" className={s.chip} onClick={() => name(t)}>
                            <span className={s.swatch} style={{ background: TRAPS[t].colour }} />
                            {TRAPS[t].name}
                          </button>
                        ))}
                        <button type="button" className={s.chip} onClick={() => name(undefined)}>
                          Just show me
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className={s.spread}>
            <span className={`${s.small} tabular`}>
              Traps named correctly: {guessedRight} of {guessed.length}
            </span>
            <div className={s.row}>
              <Button onClick={revealAll}>Reveal all four</Button>
              {qi < ITEMS.length - 1 && (
                <Button primary onClick={() => goto(qi + 1)}>
                  Next question →
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className={s.group}>
          <span className={s.label}>The {TOTAL_WRONG} wrong options of these 13 questions, by trap</span>
          <Bars
            ariaLabel="Number of wrong options of each trap type"
            format={(v) => String(v)}
            data={[...COUNTS].sort((a, b) => b.n - a.n).map((c) => ({ label: TRAPS[c.t].name, value: c.n, color: TRAPS[c.t].colour, strong: filter === c.t }))}
          />
        </div>
      </div>
    </Figure>
  )
}
