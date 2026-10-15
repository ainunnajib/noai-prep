import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, Plot, Grid, Axes, Path, Dots, HLine, Label, useNarrow } from '../../../../../kit'
import { CORPUS } from './corpus'
import { BASE_CHARS, encodeWord, inBase, isWord, pretokenise, trainBPE, wordFreq, type Merge } from './bpe'
import s from './tok.module.css'

/*
  One sentence, three tokenisers, all trained on the same ~370-word corpus (corpus.ts):
    - word-level: vocabulary = every distinct corpus word (+ punctuation); anything else is [UNK];
    - character-level: vocabulary = a–z, 0–9 and 11 punctuation marks;
    - BPE: the same characters plus the first k merge rules learned from the corpus.
  The chart shows how many tokens the sentence needs as k grows.
*/

interface Model {
  merges: Merge[]
  words: Set<string>
}
let model: Model | null = null
function getModel(): Model {
  if (!model) {
    const freq = wordFreq(pretokenise(CORPUS))
    model = { merges: trainBPE(freq, 1000), words: new Set(freq.map(([w]) => w)) }
  }
  return model
}

const PRESETS: [string, string][] = [
  ['Singlish', 'Tokenising Singlish is shiok, but unbelievably tricky lah!'],
  ['Typo', 'The teacher said the homework was sooo looong.'],
  ['Emoji', 'Chicken rice 🍗 is the best!'],
]

const TINTS = ['var(--viz-1)', 'var(--viz-3)', 'var(--viz-2)', 'var(--viz-5)', 'var(--viz-4)']
const tint = (i: number) => `color-mix(in srgb, ${TINTS[i % TINTS.length]} 20%, var(--surface))`

interface Tok {
  text: string
  unk: boolean
}

/** Positions (merge ranks) at which a word loses one symbol, so tokens(k) = chars − #ranks < k. */
function mergeRanks(word: string, merges: Merge[]): number[] {
  let sym = [...word]
  const ranks: number[] = []
  for (let r = 0; r < merges.length && sym.length > 1; r++) {
    const [a, b] = merges[r].pair
    if (!sym.includes(a) || !sym.includes(b)) continue
    const before = sym.length
    const next: string[] = []
    let i = 0
    while (i < sym.length) {
      if (i < sym.length - 1 && sym[i] === a && sym[i + 1] === b) {
        next.push(a + b)
        i += 2
      } else {
        next.push(sym[i])
        i += 1
      }
    }
    for (let n = 0; n < before - next.length; n++) ranks.push(r)
    sym = next
  }
  return ranks
}

function Strip({ name, groups, vocab, note }: { name: string; groups: Tok[][]; vocab: number; note?: string }) {
  const n = groups.reduce((a, g) => a + g.length, 0)
  const unk = groups.reduce((a, g) => a + g.filter((t) => t.unk).length, 0)
  let idx = 0
  return (
    <div className={s.strip}>
      <div className={s.stripHead}>
        <span className={s.stripName}>{name}</span>
        <span className={s.stripStats}>
          vocab {vocab} · <b>{n} tokens</b> · <span className={unk ? s.bad : undefined}>{unk} unknown</span>
        </span>
      </div>
      <div className={s.tokens} aria-label={`${name}: ${n} tokens`}>
        {groups.map((g, gi) => (
          <span key={gi} className={s.group}>
            {g.map((t, ti) => {
              const i = idx++
              return t.unk ? (
                <span key={ti} className={`${s.chip} ${s.unk}`} title={`"${t.text}" is not in the vocabulary`}>
                  [UNK]
                  <span className={s.chipSub}>{t.text}</span>
                </span>
              ) : (
                <span key={ti} className={s.chip} style={{ background: tint(i) }}>
                  {t.text}
                </span>
              )
            })}
          </span>
        ))}
      </div>
      {note && <div className={s.chipSub}>{note}</div>}
    </div>
  )
}

export default function TokeniserCompare() {
  const [text, setText] = useState(PRESETS[0][1])
  const [k, setK] = useState(200)
  const [plotRef, narrow] = useNarrow<HTMLDivElement>(480)
  const { merges, words } = getModel()
  const M = merges.length

  const pieces = useMemo(() => pretokenise(text).slice(0, 60), [text])
  const wordGroups: Tok[][] = pieces.map((p) => [{ text: p, unk: isWord(p) ? !words.has(p) : !inBase(p) }])
  const charGroups: Tok[][] = pieces.map((p) => [...p].map((c) => ({ text: c, unk: !inBase(c) })))
  const bpeGroups: Tok[][] = pieces.map((p) => (isWord(p) ? encodeWord(p, merges, k).map((t) => ({ text: t, unk: false })) : [{ text: p, unk: !inBase(p) }]))

  // tokens needed for every k: a step function
  const { path, nChars } = useMemo(() => {
    let total = 0
    const ranks: number[] = []
    for (const p of pieces) {
      if (isWord(p)) {
        total += p.length
        ranks.push(...mergeRanks(p, merges))
      } else total += 1
    }
    ranks.sort((a, b) => a - b)
    const pts: [number, number][] = [[0, total]]
    let c = total
    for (const r of ranks) {
      pts.push([r + 1, c])
      c -= 1
      pts.push([r + 1, c])
    }
    pts.push([M, c])
    return { path: pts, nChars: total }
  }, [pieces, merges, M])

  const nWord = pieces.length
  const nBpe = bpeGroups.reduce((a, g) => a + g.length, 0)
  const yMax = Math.max(4, Math.ceil(nChars * 1.32))
  const wordVocab = words.size + 11

  return (
    <Figure
      wide
      title="One sentence, three tokenisers"
      caption={
        <>
          All three tokenisers learned from the same short school-day text (about 370 words). Edit the sentence or tap a preset, then slide the number of BPE merges.
          At 0 merges BPE is exactly character-level; as it learns more merges, frequent chunks such as <code>ing</code>, <code>un</code> and{' '}
          <code>token</code> become single tokens and the sentence gets shorter, yet a word it never saw is still spelled out from pieces instead of
          becoming <code>[UNK]</code>. Only symbols outside the base alphabet (like the emoji) are unknown; byte-level BPE, used by GPT models, avoids
          even that by starting from the 256 possible bytes.
        </>
      }
    >
      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="tokcmp-text">
          Your sentence
        </label>
        <input id="tokcmp-text" className={s.input} value={text} spellCheck={false} onChange={(e) => setText(e.target.value)} />
        <div className={s.presets}>
          <span>Try:</span>
          {PRESETS.map(([name, t]) => (
            <Button key={name} onClick={() => setText(t)}>
              {name}
            </Button>
          ))}
        </div>
      </div>
      <div className={s.strips}>
        <Strip name="Word-level" groups={wordGroups} vocab={wordVocab} />
        <Strip name="Character-level" groups={charGroups} vocab={BASE_CHARS.length} />
        <Strip name={`Subword (BPE, ${k} merges)`} groups={bpeGroups} vocab={BASE_CHARS.length + k} />
      </div>
      <Controls>
        <Slider label="BPE merges learned" value={k} min={0} max={M} step={1} onChange={setK} format={(v) => `${v} (vocab ${BASE_CHARS.length + v})`} />
      </Controls>
      <div ref={plotRef} style={{ width: '100%' }}>
      {pieces.length === 0 ? (
        <p className={s.message}>Type a sentence above to see how many tokens each tokeniser needs.</p>
      ) : (
      <Plot x={[0, M]} y={[0, yMax]} width={560} height={210} minHeight={190} margin={{ left: 44, bottom: 38, right: 18 }} ariaLabel="Number of tokens for the sentence against the number of BPE merges">
        <Grid xTicks={narrow ? 4 : 8} yTicks={5} />
        <Axes xLabel="BPE merges (vocabulary grows →)" yLabel="tokens" xTicks={narrow ? 4 : 8} yTicks={5} />
        <HLine y={nWord} color="var(--viz-2)" />
        {/* the word-level label sits at the left end, away from the BPE dot, which ends up near this line on the right */}
        <Label x={0} y={nWord} dx={8} dy={-6} color="var(--viz-2)">
          {`word-level: ${nWord}`}
        </Label>
        <Path points={path} color="var(--viz-1)" width={2.5} />
        <Dots points={[{ x: k, y: nBpe, color: 'var(--viz-1)', r: 6 }]} />
        {k < M * 0.12 ? (
          <Label x={k} y={nBpe} dx={10} dy={-8} color="var(--viz-1)">
            {`BPE = characters: ${nBpe}`}
          </Label>
        ) : (
          <>
            <Label x={k} y={nBpe} dx={k > M * 0.7 ? -10 : 10} dy={Math.abs(nBpe - nWord) <= 2 ? -16 : -10} anchor={k > M * 0.7 ? 'end' : 'start'} color="var(--viz-1)">
              {`BPE: ${nBpe}`}
            </Label>
            <Label x={0} y={nChars} dx={8} dy={-7} color="var(--ink-2)">
              {`characters: ${nChars}`}
            </Label>
          </>
        )}
      </Plot>
      )}
      </div>
    </Figure>
  )
}
