import { useMemo, useState } from 'react'
import { Figure, Bars, Button, mulberry32 } from '../../../../../kit'
import { TryNotice } from '../Caption'
import s from './tc.module.css'
import { ProbBar, SentenceInput } from './parts'
import { VOCAB, COUNT_W, COUNT_B, TRAIN_POS, TRAIN_NEG } from './toyData'
import { tokenise, scoreCounts, VOCAB_INDEX, fixed, signed } from './toyModel'

/*
  A bag-of-words logistic regression: every vocabulary word has exactly one weight, and the
  score is bias + the sum of the weights of the words present. Learners type sentences with
  negation or sarcasm and see where the model goes wrong, and shuffle the words to see that
  word order never matters to it.
*/

const HUMAN: Record<string, 'positive' | 'negative'> = {
  'not bad at all': 'positive',
  'the food was good, not bad': 'positive',
  'the food was bad, not good': 'negative',
  'wah so fast, only waited one hour': 'negative',
  'friendly auntie and delicious laksa': 'positive',
  'the laksa was cold and bland': 'negative',
}
const PRESETS = Object.keys(HUMAN)

const ranked = VOCAB.map((w, i) => ({ w, v: COUNT_W[i] })).sort((a, b) => b.v - a.v)
const TOP_POS = ranked.slice(0, 8)
const TOP_NEG = ranked.slice(-8).reverse()
const MAXW = Math.max(...COUNT_W.map(Math.abs))

const tint = (v: number) => `color-mix(in srgb, ${v >= 0 ? 'var(--viz-pos)' : 'var(--viz-neg)'} ${Math.round(Math.min(1, Math.abs(v) / 1.4) * 60)}%, var(--surface))`

function shuffleWords(text: string, seed: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const rand = mulberry32(seed)
  for (let k = 0; k < 8; k++) {
    const a = words.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    if (a.join(' ') !== words.join(' ') || a.length < 2) return a.join(' ')
  }
  return words.join(' ')
}

export default function WordWeightBars() {
  const [text, setText] = useState(PRESETS[0])
  const [seed, setSeed] = useState(1)
  const toks = useMemo(() => tokenise(text), [text])
  const res = useMemo(() => scoreCounts(toks), [toks])
  const human = HUMAN[text.trim().toLowerCase()]
  const pred = res.p >= 0.5 ? 'positive' : 'negative'
  // which preset (if any) has the same bag of words as the current text?
  const sameBag = PRESETS.filter((p) => p !== text && bagKey(p) === bagKey(text) && bagKey(p) !== '')

  return (
    <Figure
      title="One weight per word"
      caption={
        <TryNotice
          tryIt={
            <>
              try the two “good, not bad” sentences, then press <b>Shuffle the words</b>.
            </>
          }
          notice={
            <>
              the score is the bias plus one fixed weight per word, so shuffling never changes it. <code>mee</code> (noodles) is not a feeling: 3 of
              its 4 training reviews just happened to be positive.
            </>
          }
          note={<>A word-count logistic regression trained on {TRAIN_POS.length + TRAIN_NEG.length} toy reviews.</>}
        />
      }
    >
      <div className={s.wrap}>
        <div className={s.twoCols}>
          <div>
            <p className={s.colTitle}>Strongest positive weights</p>
            <Bars data={TOP_POS.map((d) => ({ label: d.w, value: d.v, color: 'var(--viz-pos)' }))} max={MAXW} format={(v) => signed(v)} ariaLabel="Most positive word weights" />
          </div>
          <div>
            <p className={s.colTitle}>Strongest negative weights</p>
            <Bars data={TOP_NEG.map((d) => ({ label: d.w, value: d.v, color: 'var(--viz-neg)' }))} max={MAXW} format={(v) => signed(v)} ariaLabel="Most negative word weights" />
          </div>
        </div>

        <SentenceInput label="Test sentence" value={text} onChange={setText} presets={PRESETS} />

        <div className={s.sentence} aria-label="Each word with its weight">
          {toks.length === 0 && <span className={s.empty}>Type a sentence.</span>}
          {toks.map((t, i) => {
            const w = t.status === 'known' ? COUNT_W[VOCAB_INDEX.get(t.word)!] : null
            return (
              <span key={i} className={`${s.wordChip} ${w == null ? s.wordFaint : ''}`} style={{ background: w == null ? 'transparent' : tint(w), borderStyle: w == null ? 'dashed' : 'solid' }}>
                <b>{t.word}</b>
                <small>{w == null ? (t.status === 'stop' ? 'stop' : 'unknown') : signed(w)}</small>
              </span>
            )
          })}
        </div>

        <p className={s.sum}>
          z = b + Σ weights = {fixed(COUNT_B)}
          {res.contribs.map((c) => ` ${c.contrib < 0 ? '−' : '+'} ${Math.abs(c.contrib).toFixed(2)}`).join('')} = <b>{fixed(res.z)}</b>
        </p>
        <ProbBar p={res.p} />
        <p className={s.verdict}>
          Model: <strong>{pred}</strong> (p = {res.p.toFixed(2)}).{' '}
          {human ? (
            <>
              A human reader says <strong>{human}</strong>{' '}
              {human === pred ? <span className={s.ok}>✓ correct.</span> : <span className={s.bad}>✗ wrong.</span>}
            </>
          ) : (
            'Is that what a human would say?'
          )}
          {sameBag.length > 0 && (
            <>
              {' '}
              Same words as <i>“{sameBag[0]}”</i>, so exactly the same score.
            </>
          )}
        </p>
        <div className={s.row}>
          <Button
            onClick={() => {
              setText(shuffleWords(text, seed))
              setSeed(seed + 1)
            }}
          >
            Shuffle the words
          </Button>
          <span className={s.verdict}>Reordering words cannot change a bag-of-words score.</span>
        </div>
      </div>
    </Figure>
  )
}

/** sorted vocabulary words of a text: two texts with equal keys get equal bag-of-words scores */
function bagKey(text: string) {
  return tokenise(text)
    .filter((t) => t.status === 'known')
    .map((t) => t.word)
    .sort()
    .join(' ')
}
