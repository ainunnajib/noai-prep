import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Button, M } from '../../../../../kit'

/*
  Sort ten well-known models into "discriminative" (learns P(y | x): input in, label out) and
  "generative" (learns P(x), P(x, y) or P(x | prompt): can make new data). Each card reveals what
  the model learns and whether it can produce a brand-new example.
*/

type Kind = 'disc' | 'gen'
interface Card {
  name: string
  task: string
  kind: Kind
  learns: string
  why: string
}

const CARDS: Card[] = [
  {
    name: 'Logistic regression',
    task: 'email → probability it is spam',
    kind: 'disc',
    learns: 'P(y | x)',
    why: 'It learns only w and b in P(spam | x) = sigmoid(w·x + b). Nothing in it says what a typical email looks like, so it cannot write one.',
  },
  {
    name: 'Naive Bayes',
    task: 'email → spam or not',
    kind: 'gen',
    learns: 'P(y) and P(word | y)',
    why: 'It counts how common each class is and how often each word appears in each class, then classifies with Bayes’ rule. Those counts could also be used to draw a random (silly) bag of spammy words.',
  },
  {
    name: 'Random forest',
    task: 'loan application → approve or reject',
    kind: 'disc',
    learns: 'P(y | x)',
    why: 'Each tree splits the feature space into boxes and stores a label (or class share) per box. It never models how the applications themselves are spread out.',
  },
  {
    name: 'GPT',
    task: 'prompt → continues the text',
    kind: 'gen',
    learns: 'P(text), one token at a time',
    why: 'It learns P(next token | tokens so far). Chaining these gives the probability of a whole text, and sampling one token after another writes new text.',
  },
  {
    name: 'ResNet image classifier',
    task: 'photo → “cat”, “dog”, …',
    kind: 'disc',
    learns: 'P(y | image)',
    why: 'Its softmax output is a probability for each label given the image. Ask it for a new cat photo and it has nothing to offer.',
  },
  {
    name: 'Stable Diffusion',
    task: 'text prompt → new image',
    kind: 'gen',
    learns: 'P(image | prompt)',
    why: 'A conditional generative model: the prompt plays the role of the label, and the output is a new x. It is the classifier’s direction turned round.',
  },
  {
    name: 'BERT fine-tuned for sentiment',
    task: 'review → positive or negative',
    kind: 'disc',
    learns: 'P(y | sentence)',
    why: 'A Transformer encoder plus a small classification head that outputs P(positive | review). It understands text but is not used to write it.',
  },
  {
    name: 'Variational autoencoder (VAE)',
    task: 'random code → new face',
    kind: 'gen',
    learns: 'P(x), through a latent code',
    why: 'Its decoder turns a random latent vector into a new example. You build one in the next lesson.',
  },
  {
    name: 'GAN',
    task: 'a generator and a real-or-fake discriminator',
    kind: 'gen',
    learns: 'P(x), implicitly',
    why: 'A trick question: a GAN contains a discriminator (a real-or-fake classifier), but the whole system exists to train its generator, which turns noise into new data.',
  },
  {
    name: 'Support vector machine',
    task: 'measurements → tumour type',
    kind: 'disc',
    learns: 'only a boundary',
    why: 'It finds the widest-margin boundary between the classes. It does not even output probabilities, let alone a model of the data.',
  },
]

const KIND_LABEL: Record<Kind, string> = { disc: 'Discriminative', gen: 'Generative' }
const KIND_COL: Record<Kind, string> = { disc: 'var(--viz-1)', gen: 'var(--viz-4)' }

const btnStyle: CSSProperties = { flex: '1 1 auto', padding: '0.3em 0.55em', minHeight: 32 }
const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))', gap: '0.6rem', width: '100%' }

export default function ModelFamilySorter() {
  // the first card is answered as a worked example
  const [answers, setAnswers] = useState<(Kind | null)[]>(() => CARDS.map((c, i) => (i === 0 ? c.kind : null)))
  const done = answers.filter((a) => a !== null).length
  const right = answers.filter((a, i) => a === CARDS[i].kind).length

  const choose = (i: number, k: Kind) => setAnswers((old) => old.map((a, j) => (j === i ? k : a)))
  const reset = () => setAnswers(CARDS.map((c, i) => (i === 0 ? c.kind : null)))

  return (
    <Figure
      wide
      title="Sort the models: boundary-drawers or data-makers?"
      caption={
        <>
          For each model, decide: does it learn <M>{'P(y \\mid x)'}</M> (input in, label out), or does it learn how the data itself is distributed, so it can produce new{' '}
          <M>x</M>? The first card is done for you. Watch the GAN and GPT cards: they are the ones students most often get wrong.
        </>
      }
    >
      <div style={grid}>
        {CARDS.map((c, i) => {
          const a = answers[i]
          const ok = a === c.kind
          return (
            <div
              key={c.name}
              style={{
                border: `1.5px solid ${a === null ? 'var(--rule)' : ok ? 'var(--ok)' : 'var(--bad)'}`,
                borderRadius: 10,
                padding: '0.55rem 0.65rem 0.6rem',
                // the card's tint shows right or wrong; the true class is the small chip below
                background: a === null ? 'var(--surface)' : `color-mix(in srgb, ${ok ? 'var(--ok)' : 'var(--bad)'} 8%, var(--surface))`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                minWidth: 0,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ink)' }}>{c.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{c.task}</div>
              {a === null ? (
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                  {(['disc', 'gen'] as Kind[]).map((k) => (
                    <button key={k} type="button" className="btn btn-small" style={btnStyle} onClick={() => choose(i, k)} aria-label={`${c.name}: ${KIND_LABEL[k]}`}>
                      {KIND_LABEL[k]}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.8125rem', color: 'var(--ink)', lineHeight: 1.4 }} aria-live="polite">
                  <div style={{ fontWeight: 700, color: ok ? 'var(--ok)' : 'var(--bad)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.3rem' }}>
                    <span aria-hidden="true">{ok ? '✓' : '✗'}</span>
                    <span>{i === 0 ? 'Example:' : ok ? 'Yes:' : `Not quite: you said ${KIND_LABEL[a]}; it is`}</span>
                    <span
                      style={{
                        padding: '0 0.45em',
                        borderRadius: 999,
                        fontSize: '0.75rem',
                        color: 'var(--ink)',
                        background: `color-mix(in srgb, ${KIND_COL[c.kind]} 22%, var(--surface))`,
                        border: `1px solid ${KIND_COL[c.kind]}`,
                      }}
                    >
                      {KIND_LABEL[c.kind]}
                    </span>
                  </div>
                  <div style={{ margin: '0.15rem 0' }}>
                    <span style={{ color: 'var(--ink-2)' }}>learns </span>
                    <b>{c.learns}</b>
                    <span style={{ color: 'var(--ink-2)' }}> · new data? </span>
                    <b>{c.kind === 'gen' ? 'yes' : 'no'}</b>
                  </div>
                  <div style={{ color: 'var(--ink-2)' }}>{c.why}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <Controls>
        <Button onClick={reset} disabled={done === 1}>
          Start again
        </Button>
        <Readout
          items={[
            ['sorted', `${done - 1} / ${CARDS.length - 1}`],
            ['correct', `${Math.max(0, right - 1)} / ${Math.max(0, done - 1)}`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
