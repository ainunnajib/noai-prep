import { useMemo, useState } from 'react'
import { Figure, Controls, Button, Readout, mulberry32 } from '../../../../../kit'
import s from './bg.module.css'

/*
  BERT's masking recipe, sampled live. Every ordinary token is chosen with probability 15%.
  A chosen token is then replaced by [MASK] (80%), by a random word (10%) or left unchanged (10%).
  Labels hold the original word at chosen positions and −100 everywhere else, so the loss only
  scores the chosen positions. A running tally shows the proportions settling to 15% and 80/10/10.
*/

const WORDS = ['the', 'national', 'day', 'parade', 'is', 'held', 'every', 'year', 'in', 'august', 'and', 'thousands', 'of', 'families', 'watch', 'the', 'fireworks', 'together']
const RANDOM_VOCAB = ['banana', 'river', 'seven', 'quickly', 'purple', 'table', 'sang', 'under', 'cloud', 'laptop', 'tiger', 'green', 'shoe', 'ocean']

type Kind = 'none' | 'mask' | 'random' | 'same'
interface Cell {
  word: string
  kind: Kind
  shown: string
}

function sampleOnce(seed: number): Cell[] {
  const rnd = mulberry32(7919 * (seed + 1))
  return WORDS.map((w) => {
    if (rnd() >= 0.15) return { word: w, kind: 'none', shown: w }
    const r = rnd()
    if (r < 0.8) return { word: w, kind: 'mask', shown: '[MASK]' }
    if (r < 0.9) {
      const pick = RANDOM_VOCAB[Math.floor(rnd() * RANDOM_VOCAB.length)]
      return { word: w, kind: 'random', shown: pick }
    }
    return { word: w, kind: 'same', shown: w }
  })
}

interface Tally {
  tokens: number
  chosen: number
  mask: number
  random: number
  same: number
}

function addTally(t: Tally, cells: Cell[]): Tally {
  const c = { ...t }
  c.tokens += cells.length
  for (const x of cells) {
    if (x.kind === 'none') continue
    c.chosen++
    c[x.kind]++
  }
  return c
}

// the first sample of this seed shows all three outcomes: two [MASK]s, one random word, one unchanged
const START_SEED = 43
const EMPTY: Tally = { tokens: 0, chosen: 0, mask: 0, random: 0, same: 0 }
const pct = (a: number, b: number) => (b === 0 ? '–' : `${((100 * a) / b).toFixed(1)}%`)

export default function MaskingSampler() {
  const [seed, setSeed] = useState(START_SEED)
  const cells = useMemo(() => sampleOnce(seed), [seed])
  const [tally, setTally] = useState<Tally>(() => addTally(EMPTY, sampleOnce(START_SEED)))

  const next = (n: number) => {
    let t = tally
    let sd = seed
    for (let i = 0; i < n; i++) {
      sd += 1
      t = addTally(t, sampleOnce(sd))
    }
    setSeed(sd)
    setTally(t)
  }
  const reset = () => {
    setSeed(START_SEED)
    setTally(addTally(EMPTY, sampleOnce(START_SEED)))
  }

  const chosenNow = cells.filter((c) => c.kind !== 'none').length
  const inCls = (k: Kind) => (k === 'mask' ? s.inMask : k === 'random' ? s.inRandom : k === 'same' ? s.inSame : '')
  const samples = tally.tokens / WORDS.length

  const bar = (label: string, v: number, target: number, color: string) => (
    <div className={s.row} key={label} aria-label={`${label}: ${(v * 100).toFixed(1)}% (expected ${target}%)`}>
      <span className={s.rowLabel}>{label}</span>
      <span className={s.track} aria-hidden="true">
        <span className={s.fill} style={{ width: `${Math.min(100, v * 100)}%`, background: color }} />
      </span>
      <span className={s.val}>{(v * 100).toFixed(1)}%</span>
    </div>
  )

  return (
    <Figure
      title="BERT's 15% and 80/10/10 rule, sampled"
      caption={
        <>
          Each column is one token: the original word, what BERT is fed, and the label (<code>−100</code> = not scored). Press{' '}
          <b>Add 1,000 samples</b> and notice that the "unchanged" tokens still get a label: BERT must predict them too.
        </>
      }
    >
      <div className={s.legend} aria-hidden="true">
        <span>
          <i className={s.sw} style={{ background: 'var(--accent)' }} /> replaced by [MASK] (80%)
        </span>
        <span>
          <i className={`${s.sw} ${s.inRandom}`} /> random word (10%)
        </span>
        <span>
          <i className={`${s.sw} ${s.inSame}`} /> left unchanged (10%)
        </span>
      </div>

      <div className={s.units} role="list" aria-label="Tokens of the sentence with their masked input and label">
        <div className={s.unit} role="listitem">
          <span className={`${s.cellOrig} ${s.tokSpecial}`} style={{ borderWidth: 0 }}>
            [CLS]
          </span>
          <span className={`${s.cellIn} ${s.tokSpecial}`} style={{ borderWidth: 0 }}>
            [CLS]
          </span>
          <span className={s.cellLab}>−100</span>
        </div>
        {cells.map((c, i) => (
          <div key={i} className={`${s.unit} ${c.kind !== 'none' ? s.unitChosen : ''}`} role="listitem" aria-label={`${c.word}: fed as ${c.shown}`}>
            <span className={s.cellOrig}>{c.word}</span>
            <span className={`${s.cellIn} ${inCls(c.kind)}`}>{c.shown}</span>
            <span className={`${s.cellLab} ${c.kind !== 'none' ? s.cellLabOn : ''}`}>{c.kind !== 'none' ? c.word : '−100'}</span>
          </div>
        ))}
        <div className={s.unit} role="listitem">
          <span className={`${s.cellOrig} ${s.tokSpecial}`} style={{ borderWidth: 0 }}>
            [SEP]
          </span>
          <span className={`${s.cellIn} ${s.tokSpecial}`} style={{ borderWidth: 0 }}>
            [SEP]
          </span>
          <span className={s.cellLab}>−100</span>
        </div>
      </div>

      <Controls>
        <Button primary onClick={() => next(1)}>
          New sample
        </Button>
        <Button onClick={() => next(1000)}>Add 1,000 samples</Button>
        <Button onClick={reset}>Reset tally</Button>
        <Readout
          items={[
            ['this sample', `${chosenNow} of ${WORDS.length} chosen`],
            ['samples so far', samples.toLocaleString('en-GB')],
          ]}
        />
      </Controls>

      <div className={s.rows} aria-label="Running tally">
        {bar('chosen', tally.tokens ? tally.chosen / tally.tokens : 0, 15, 'var(--viz-2)')}
        {bar('→ [MASK]', tally.chosen ? tally.mask / tally.chosen : 0, 80, 'var(--accent)')}
        {bar('→ random', tally.chosen ? tally.random / tally.chosen : 0, 10, 'var(--viz-4)')}
        {bar('→ unchanged', tally.chosen ? tally.same / tally.chosen : 0, 10, 'var(--viz-3)')}
      </div>
      <p className={s.hint}>
        Tally: {tally.chosen.toLocaleString('en-GB')} of {tally.tokens.toLocaleString('en-GB')} tokens chosen ({pct(tally.chosen, tally.tokens)}); of those,{' '}
        {pct(tally.mask, tally.chosen)} became [MASK], {pct(tally.random, tally.chosen)} a random word and {pct(tally.same, tally.chosen)} stayed the same.
        [CLS] and [SEP] are never chosen.
      </p>
    </Figure>
  )
}
