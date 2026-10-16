import { useState } from 'react'
import { Figure, Controls, Toggle, Readout, Button } from '../../../../../kit'
import s from './hf.module.css'

/*
  Labels of −100 are skipped by PyTorch's cross-entropy (ignore_index=-100 is the default), so they add nothing
  to the loss and are not counted in the average. One NER training example after tokenisation and padding:
  each position shows its token, its label (or −100) and its loss −ln p, where p is the probability the model
  gives the correct label (illustrative numbers for a model part-way through fine-tuning).
*/

type Kind = 'special' | 'first' | 'piece' | 'pad'
interface Pos {
  tok: string
  kind: Kind
  label: string
  id: number
  p: number
}

const POS: Pos[] = [
  { tok: '[CLS]', kind: 'special', label: 'O', id: 0, p: 0.4 },
  { tok: 'Joseph', kind: 'first', label: 'B-PER', id: 3, p: 0.7 },
  { tok: 'School', kind: 'first', label: 'I-PER', id: 4, p: 0.55 },
  { tok: '##ing', kind: 'piece', label: 'I-PER', id: 4, p: 0.3 },
  { tok: 'won', kind: 'first', label: 'O', id: 0, p: 0.9 },
  { tok: 'gold', kind: 'first', label: 'O', id: 0, p: 0.85 },
  { tok: 'in', kind: 'first', label: 'O', id: 0, p: 0.93 },
  { tok: 'Rio', kind: 'first', label: 'B-LOC', id: 7, p: 0.6 },
  { tok: '[SEP]', kind: 'special', label: 'O', id: 0, p: 0.35 },
  { tok: '[PAD]', kind: 'pad', label: 'O', id: 0, p: 0.25 },
  { tok: '[PAD]', kind: 'pad', label: 'O', id: 0, p: 0.25 },
  { tok: '[PAD]', kind: 'pad', label: 'O', id: 0, p: 0.25 },
]
const LOSS = POS.map((q) => -Math.log(q.p))
const LMAX = 1.45
const DEFAULT = POS.map((q) => q.kind !== 'first')

const mean = (ign: boolean[]) => {
  const xs = LOSS.filter((_, i) => !ign[i])
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN
}

export default function IgnoreIndexMask() {
  const [ign, setIgn] = useState<boolean[]>(DEFAULT)
  const setKind = (k: Kind, v: boolean) => setIgn((g) => g.map((x, i) => (POS[i].kind === k ? v : x)))
  const all = (k: Kind) => POS.every((q, i) => q.kind !== k || ign[i])

  const scored = ign.filter((x) => !x).length
  const m = mean(ign)
  const mRef = mean(DEFAULT)
  const padsScored = POS.some((q, i) => q.kind === 'pad' && !ign[i])
  const specScored = POS.some((q, i) => q.kind === 'special' && !ign[i])
  const realIgnored = POS.some((q, i) => q.kind === 'first' && ign[i])

  let status = <>✓ Standard setup: only real words are scored. Special tokens, later word pieces and padding all have label −100.</>
  let cls = `${s.status} ${s.statusOk}`
  if (padsScored) {
    status = (
      <>
        ✗ Padding is being graded as if it were the word "O". The loss now depends on how much padding the batch happens to have, and the model wastes effort
        learning to label <code>[PAD]</code>, which it will never need to do.
      </>
    )
    cls = `${s.status} ${s.statusBad}`
  } else if (realIgnored) {
    status = <>✗ A real word has label −100, so the model gets no feedback on it. Only padding and special tokens should be skipped.</>
    cls = `${s.status} ${s.statusBad}`
  } else if (specScored) {
    status = <>Not wrong, but wasteful: <code>[CLS]</code> and <code>[SEP]</code> are not words, so most code gives them −100 too.</>
    cls = s.status
  } else if (!all('piece')) {
    status = (
      <>
        Also fine: some code gives every piece of a word the word's label instead of −100. Hugging Face's examples score only the first piece, so each word
        counts once.
      </>
    )
    cls = s.status
  }

  const terms = LOSS.map((l, i) => (ign[i] ? null : l.toFixed(2))).filter(Boolean)

  return (
    <Figure
      wide
      title="Labels of −100 are skipped by the loss"
      caption={
        <>
          Each bar is one position's loss, −ln p (illustrative numbers). Tap a label to flip it to −100, or switch a toggle off, and notice
          that −100 positions add nothing and do not count in the divisor.
        </>
      }
    >
      <div className={s.lossUnits} role="list" aria-label="Positions with token, label and loss">
        {POS.map((q, i) => {
          const off = ign[i]
          const h = Math.min(1, LOSS[i] / LMAX) * 72
          return (
            <div key={i} className={`${s.lu} ${off ? s.luSkipped : ''}`} role="listitem">
              <span className={s.luLoss}>{off ? 'skip' : LOSS[i].toFixed(2)}</span>
              <span className={s.luBarBox} aria-hidden="true">
                <span className={`${s.luBar} ${off ? s.luBarSkipped : ''}`} style={{ height: h, background: q.kind === 'pad' ? 'var(--viz-neg)' : 'var(--viz-1)' }} />
              </span>
              <button
                type="button"
                className={`${s.luLab} ${off ? s.luIgnored : ''}`}
                onClick={() => setIgn((g) => g.map((x, j) => (j === i ? !x : x)))}
                aria-label={`${q.tok}: label ${off ? '-100' : q.label}. Tap to flip.`}
              >
                {off ? '−100' : q.label}
              </button>
              <span className={s.luTok} title={q.tok}>
                {q.tok}
              </span>
            </div>
          )
        })}
      </div>

      <Controls>
        <Toggle label="−100 for [CLS] and [SEP]" checked={all('special')} onChange={(v) => setKind('special', v)} />
        <Toggle label="−100 for later word pieces (##ing)" checked={all('piece')} onChange={(v) => setKind('piece', v)} />
        <Toggle label="−100 for padding" checked={all('pad')} onChange={(v) => setKind('pad', v)} />
        <Button onClick={() => setIgn(DEFAULT)}>Reset</Button>
      </Controls>
      <Readout
        items={[
          ['positions scored', `${scored} of ${POS.length}`],
          ['average loss', Number.isNaN(m) ? '–' : m.toFixed(3)],
          ['standard setup', mRef.toFixed(3)],
        ]}
      />
      <p className={s.hint} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        loss = ({terms.length ? terms.join(' + ') : '0'}) / {scored} = {Number.isNaN(m) ? '–' : m.toFixed(3)}
      </p>
      <div className={cls} role="status">
        {status}
      </div>
    </Figure>
  )
}
