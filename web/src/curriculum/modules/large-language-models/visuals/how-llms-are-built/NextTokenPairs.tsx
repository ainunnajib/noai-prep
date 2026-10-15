import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Button, Bars, M } from '../../../../../kit'
import s from './built.module.css'

/*
  Self-supervised pretraining: every position in a sentence is a free training example
  (the words before it → the word at it). The loss at each position is −ln p(actual next token).
  Probabilities are illustrative values of the kind a trained model gives.
*/

const VOCAB = 50000
const SENTENCES: { key: string; label: string; tokens: string[]; p: number[] }[] = [
  { key: 'mrt', label: 'MRT', tokens: ['The', 'MRT', 'train', 'was', 'late', 'again', 'this', 'morning', '.'], p: [0.02, 0.3, 0.35, 0.25, 0.2, 0.3, 0.6, 0.55] },
  { key: 'fact', label: 'A fact', tokens: ['The', 'capital', 'of', 'Japan', 'is', 'Tokyo', '.'], p: [0.03, 0.85, 0.02, 0.7, 0.92, 0.5] },
  { key: 'sum', label: 'A sum', tokens: ['Two', 'plus', 'three', 'equals', 'five', '.'], p: [0.08, 0.15, 0.4, 0.85, 0.6] },
  { key: 'kopi', label: 'Breakfast', tokens: ['Kaya', 'toast', 'goes', 'well', 'with', 'kopi', '.'], p: [0.55, 0.1, 0.7, 0.9, 0.15, 0.5] },
]

export default function NextTokenPairs() {
  const [key, setKey] = useState('fact')
  const [t, setT] = useState(5) // index of the target token (≥ 1)
  const [untrained, setUntrained] = useState(false)
  const sent = SENTENCES.find((x) => x.key === key) ?? SENTENCES[0]
  const n = sent.tokens.length
  const tt = Math.min(Math.max(1, t), n - 1)
  const probs = sent.p.map((p) => (untrained ? 1 / VOCAB : p))
  const losses = probs.map((p) => -Math.log(p))
  const pNow = probs[tt - 1]
  const avg = losses.reduce((a, b) => a + b, 0) / losses.length

  const choose = (k: string) => {
    setKey(k)
    const nx = SENTENCES.find((x) => x.key === k) ?? SENTENCES[0]
    setT(nx.tokens.length - 2)
  }

  return (
    <Figure
      wide
      title="One sentence, many free training examples"
      caption={
        <>
          <b>Try:</b> click any word to make it the <b>label</b> (everything before it is the input), then tick <b>untrained model</b>.{' '}
          <b>Notice:</b> {n} tokens give {n - 1} free examples, and the loss is small where knowledge pins down the answer (<i>Tokyo</i>).
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Segmented label="sentence" value={key} onChange={choose} options={SENTENCES.map((x) => ({ value: x.key, label: x.label }))} />
          <Toggle label="untrained model" checked={untrained} onChange={setUntrained} />
        </Controls>

        <div className={s.tokens} role="group" aria-label="Tokens of the sentence. Choose one to be the label.">
          {sent.tokens.map((tok, i) => {
            const cls = i < tt ? s.tokCtx : i === tt ? s.tokTarget : s.tokHidden
            return (
              <button
                key={i}
                type="button"
                className={`${s.tok} ${cls}`}
                disabled={i === 0}
                aria-pressed={i === tt}
                aria-label={i === 0 ? `${tok} (first token, never a label)` : `${tok}: make this the label`}
                onClick={() => setT(i)}
              >
                {tok}
              </button>
            )
          })}
        </div>

        <div className={s.pair} aria-live="polite">
          <div className={s.pairCol}>
            <span className={s.pairHead}>input (context)</span>
            <span className={s.pairCtx}>{sent.tokens.slice(0, tt).join(' ')}</span>
          </div>
          <span className={s.pairArrow} aria-hidden="true">
            →
          </span>
          <div className={s.pairCol}>
            <span className={s.pairHead}>label</span>
            <span className={s.pairTarget}>{sent.tokens[tt]}</span>
          </div>
        </div>
        <div className={s.lossLine}>
          The model gave the real next token probability <b>{untrained ? '1/50,000' : pNow.toFixed(2)}</b>, so this example's loss is{' '}
          <M>{`-\\ln ${untrained ? '(1/50\\,000)' : pNow.toFixed(2)} = ${losses[tt - 1].toFixed(2)}`}</M>. Tokens after the label are hidden: the
          model may not peek ahead.
        </div>

        <div>
          <p className={s.subhead}>Loss at every position (lower is better)</p>
          <Bars
            ariaLabel="Loss for each training example in the sentence"
            max={11}
            data={sent.tokens.slice(1).map((tok, i) => ({
              label: `→ ${tok}`,
              value: losses[i],
              strong: i + 1 === tt,
              color: i + 1 === tt ? 'var(--viz-2)' : 'var(--viz-1)',
            }))}
          />
        </div>

        <Controls>
          <Button onClick={() => setT(tt >= n - 1 ? 1 : tt + 1)}>Next example</Button>
          <Readout
            items={[
              ['examples from this sentence', String(n - 1)],
              ['labelled by people', '0'],
              ['average loss', avg.toFixed(2)],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
