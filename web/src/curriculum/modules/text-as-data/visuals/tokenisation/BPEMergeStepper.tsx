import { useMemo, useState } from 'react'
import { Figure, Bars, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { mergeOnce, pairCounts, trainBPE, type Merge } from './bpe'
import s from './tok.module.css'

/*
  Step through BPE training on a tiny corpus of (word, count) lines.
  State n = "after n merges". The pair table always shows the counts that decide the NEXT merge.
*/

const DEFAULT_CORPUS = 'hug 10\npug 5\npun 12\nbun 4\nhugs 5'
const MAX_MERGES = 12

function parse(src: string): [string, number][] {
  const m = new Map<string, number>()
  for (const line of src.split('\n')) {
    const parts = line.trim().toLowerCase().split(/\s+/)
    const w = (parts[0] ?? '').replace(/[^a-z]/g, '')
    if (!w) continue
    const c = Math.max(1, Math.min(999, Math.round(Number(parts[1] ?? 1)) || 1))
    m.set(w, (m.get(w) ?? 0) + c)
  }
  return [...m.entries()].slice(0, 8)
}

const pairText = ([a, b]: [string, string]) => `${a} + ${b}`

export default function BPEMergeStepper() {
  const [src, setSrc] = useState(DEFAULT_CORPUS)
  const [test, setTest] = useState('bugs')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const freq = useMemo(() => parse(src), [src])
  const merges: Merge[] = useMemo(() => trainBPE(freq, MAX_MERGES), [freq])
  const player = usePlayer({ steps: merges.length + 1, interval: 1400 })
  const n = Math.min(player.step, merges.length)

  // corpus after n merges
  const splits = useMemo(() => {
    let sp = freq.map(([w]) => [...w])
    for (let r = 0; r < n; r++) sp = sp.map((x) => mergeOnce(x, merges[r].pair))
    return sp
  }, [freq, merges, n])

  const counts = pairCounts(freq, splits)
  let best: (typeof counts)[number] | undefined = counts[0]
  for (const c of counts) if (best && c.count > best.count) best = c
  const shown = [...counts].sort((a, b) => b.count - a.count).slice(0, narrow ? 5 : 6)

  const base = [...new Set(freq.flatMap(([w]) => [...w]))].sort()
  const learned = merges.slice(0, n).map((m) => m.pair.join(''))
  const vocab = [...base, ...learned]
  const justMerged = n > 0 ? merges[n - 1] : null

  // tokenise a new word with the merges learned so far
  const testWord = test.toLowerCase().replace(/[^a-z]/g, '').slice(0, 16)
  let testToks = [...testWord]
  for (let r = 0; r < n; r++) testToks = mergeOnce(testToks, merges[r].pair)
  const baseSet = new Set(base)

  const breakdown = (c: (typeof counts)[number]) => c.words.map(([w, f]) => `${w} ×${f}`).join(' + ')
  let message: string
  if (!freq.length) message = 'The corpus is empty: type one word and its count per line, for example “hug 10”.'
  else if (n === 0 && !best) message = 'Every word is a single character, so there are no pairs to merge. Add longer words to the corpus.'
  else if (n === 0 && best)
    message = `Start: every word is split into single characters, so the vocabulary is just the ${base.length} letters. Count every adjacent pair, weighted by how often each word occurs. The most frequent is (${pairText(best.pair)}): ${breakdown(best)} = ${best.count}. Press Next to merge it.`
  else {
    const m = justMerged!
    message = `Merge ${n}: (${pairText(m.pair)}) → "${m.pair.join('')}" (${m.count} times) is now one token, added to the vocabulary and replaced everywhere in the corpus.`
    message += best ? ` Recount: the most frequent pair is now (${pairText(best.pair)}) with ${best.count}.` : ' No adjacent pairs are left: every word is a single token.'
  }

  return (
    <Figure
      wide
      title="Watch BPE learn its merges"
      caption={
        <>
          Press <b>Next</b> (or Play). Each step counts every adjacent pair of symbols in the corpus, weighted by the word counts, and merges the most
          frequent pair into a new token. The merge rules are kept in order; to tokenise a new word, apply them in that same order. Try the new word{' '}
          <code>mug</code>: “m” never appeared in training, so it is <code>[UNK]</code>, while “ug” is still found. Edit the corpus to change which pairs win.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.9rem' }}>
        <div className={`${s.twoCol} ${narrow ? s.twoColNarrow : ''}`}>
          <div className={s.panel}>
            <span className={s.panelTitle}>Corpus after {n} merge{n === 1 ? '' : 's'}</span>
            {freq.map(([w, f], wi) => (
              <div key={w} className={s.corpusRow}>
                <span className={s.group}>
                  {splits[wi].map((t, ti) => {
                    const fresh = justMerged && t === justMerged.pair.join('')
                    return (
                      <span key={ti} className={`${s.chip} ${fresh ? s.fresh : ''}`} style={{ background: 'color-mix(in srgb, var(--viz-1) 16%, var(--surface))' }}>
                        {t}
                      </span>
                    )
                  })}
                </span>
                <span className={s.count}>×{f}</span>
              </div>
            ))}
          </div>
          <div className={s.panel}>
            <span className={s.panelTitle}>Pair counts (decide the next merge)</span>
            {shown.length ? (
              <Bars
                ariaLabel="Adjacent pair counts"
                format={(v) => String(v)}
                data={shown.map((c) => ({
                  label: <span style={{ fontFamily: 'var(--font-mono)' }}>{pairText(c.pair)}</span>,
                  value: c.count,
                  strong: c === best,
                  color: c === best ? 'var(--viz-2)' : 'var(--viz-1)',
                }))}
              />
            ) : (
              <span className={s.chipSub}>No pairs left.</span>
            )}
          </div>
        </div>
        <p className={s.message} aria-live="polite">
          {message}
        </p>
        <PlayerControls player={player} label={(st) => `${Math.min(st, merges.length)} / ${merges.length} merges`} />
        <div className={s.twoCol + (narrow ? ' ' + s.twoColNarrow : '')}>
          <div className={s.panel}>
            <span className={s.panelTitle}>Vocabulary ({vocab.length} tokens)</span>
            <div className={s.tokens} style={{ gap: 4 }}>
              {vocab.map((t, i) => (
                <span
                  key={t + i}
                  className={`${s.chip} ${justMerged && t === justMerged.pair.join('') ? s.fresh : ''}`}
                  style={{ background: i < base.length ? 'var(--surface-3)' : 'color-mix(in srgb, var(--viz-3) 22%, var(--surface))' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className={s.panel}>
            <span className={s.panelTitle}>Merge rules, in order</span>
            {n === 0 ? (
              <span className={s.chipSub}>none yet</span>
            ) : (
              <ol className={s.rules}>
                {merges.slice(0, n).map((m, i) => (
                  <li key={i} className={i === n - 1 ? s.ruleNew : undefined}>
                    {pairText(m.pair)} → {m.pair.join('')}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <div className={s.twoCol + (narrow ? ' ' + s.twoColNarrow : '')}>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="bpe-test">
              Tokenise a new word with these merges
            </label>
            <input id="bpe-test" className={s.input} value={test} spellCheck={false} onChange={(e) => setTest(e.target.value)} />
            <div className={s.tokens} style={{ gap: 4 }} aria-live="polite">
              {testToks.length ? (
                testToks.map((t, i) =>
                  t.length === 1 && !baseSet.has(t) ? (
                    <span key={i} className={`${s.chip} ${s.unk}`}>
                      [UNK]<span className={s.chipSub}>{t}</span>
                    </span>
                  ) : (
                    <span key={i} className={s.chip} style={{ background: 'color-mix(in srgb, var(--viz-3) 22%, var(--surface))' }}>
                      {t}
                    </span>
                  ),
                )
              ) : (
                <span className={s.chipSub}>type a word</span>
              )}
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="bpe-corpus">
              Training corpus (word count per line)
            </label>
            <textarea
              id="bpe-corpus"
              className={s.textarea}
              rows={5}
              value={src}
              spellCheck={false}
              onChange={(e) => {
                setSrc(e.target.value)
                player.reset()
              }}
            />
          </div>
        </div>
      </div>
    </Figure>
  )
}
