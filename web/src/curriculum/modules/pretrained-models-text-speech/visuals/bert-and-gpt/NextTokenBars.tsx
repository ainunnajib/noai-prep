import { useMemo, useState } from 'react'
import { Figure, Controls, Segmented, Button, Readout, mulberry32 } from '../../../../../kit'
import { CORPUS, END, nextDist, factors } from './lm'
import s from './bg.module.css'

/*
  Generate a sentence one token at a time from a tiny bigram / trigram model.
  The bars are the next-token distribution; clicking one appends it (autoregressive generation).
  The strip above multiplies the chain-rule factors into the sentence probability and its perplexity.
*/

const fmtP = (p: number) => {
  if (p === 0) return '0'
  if (p >= 0.001) return p.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
  return p.toExponential(2)
}

export default function NextTokenBars() {
  const [order, setOrder] = useState<2 | 3>(2)
  const [words, setWords] = useState<string[]>(['i', 'take', 'the'])
  const [draws, setDraws] = useState(0)

  const dist = useMemo(() => nextDist(words, order), [words, order])
  const fs = useMemo(() => factors(words, order), [words, order])
  const done = words[words.length - 1] === END
  const P = fs.reduce((a, f) => a * f.p, 1)
  const logP = fs.reduce((a, f) => a + (f.p > 0 ? Math.log(f.p) : -Infinity), 0)
  const N = fs.length
  const ppl = N === 0 ? NaN : Number.isFinite(logP) ? Math.exp(-logP / N) : Infinity

  const add = (w: string) => setWords((ws) => [...ws, w])
  const greedy = () => dist.items.length && add(dist.items[0].word)
  const sample = () => {
    if (!dist.items.length) return
    const r = mulberry32(911 + draws * 31 + words.length)()
    setDraws((d) => d + 1)
    let acc = 0
    for (const it of dist.items) {
      acc += it.p
      if (r < acc) return add(it.word)
    }
    add(dist.items[dist.items.length - 1].word)
  }

  const ctxText = order === 2 ? `"${dist.context}"` : `"${dist.context}"`
  const top = Math.max(1e-9, ...dist.items.map((d) => d.p))

  return (
    <Figure
      wide
      title="Generate a sentence, one next token at a time"
      caption={
        <>
          Tap a bar to add that token and watch the sentence probability shrink with every factor. Then switch to the trigram: the bars
          get sharper, but some two-word contexts never occur in the corpus, so counting runs out of data.
        </>
      }
    >
      <Controls>
        <Segmented
          label="context"
          value={order}
          onChange={(v) => setOrder(v)}
          options={[
            { value: 2, label: 'bigram (1 word)' },
            { value: 3, label: 'trigram (2 words)' },
          ]}
        />
      </Controls>

      <div className={s.stack}>
        <div className={s.chain} aria-label="The sentence so far with the probability of each token">
          <span className={`${s.link} ${s.tokSpecial}`} title="start of sentence">
            <span className={s.linkWord}>&lt;s&gt;</span>
            <span className={s.linkP}>start</span>
          </span>
          {fs.map((f, i) => (
            <span key={i} className={`${s.link} ${f.p === 0 ? s.linkZero : ''}`} title={`P(${f.word} | ${f.context}) = ${f.count}/${f.total}`}>
              <span className={s.linkWord}>{f.word}</span>
              <span className={s.linkP}>{f.total ? `${f.count}/${f.total}` : '0 (unseen)'}</span>
            </span>
          ))}
          {!done && (
            <span className={`${s.link} ${s.linkNext}`} aria-hidden="true">
              <span className={s.linkWord}>?</span>
              <span className={s.linkP}>next</span>
            </span>
          )}
        </div>
        <div className={s.formula}>
          {fs.length ? (
            <>
              P(sentence) = {fs.map((f) => (f.total ? `${f.count}/${f.total}` : '0')).join(' × ')} = <b>{fmtP(P)}</b>
            </>
          ) : (
            <>P(empty sentence) = 1 (nothing chosen yet: tap a word below)</>
          )}
        </div>
        <Readout
          items={[
            ['tokens N', String(N)],
            ['log P (natural)', Number.isFinite(logP) ? logP.toFixed(3) : '−∞'],
            ['perplexity', Number.isNaN(ppl) ? '–' : Number.isFinite(ppl) ? ppl.toFixed(2) : '∞'],
          ]}
        />
      </div>

      <div className={s.panel} style={{ width: '100%' }}>
        <div className={s.panelTitle}>
          <span>{done ? 'Sentence finished' : 'Next-token probabilities'}</span>
          {!done && <span className={s.panelSub}>given {ctxText} · tap a word to add it</span>}
        </div>
        {done ? (
          <p className={s.hint}>
            The model produced the end token "<b>.</b>". Its probability for this whole sentence is <b>{fmtP(P)}</b>. Undo to try a different ending, or
            restart.
          </p>
        ) : dist.items.length === 0 ? (
          <div className={`${s.status} ${s.statusBad}`}>
            The context {ctxText} never appears in the 16 training sentences, so the trigram counts are all zero: the model cannot continue. Undo, or switch
            back to the bigram model.
          </div>
        ) : (
          <div className={s.rows}>
            {dist.items.map((it) => (
              <button key={it.word} type="button" className={`${s.row} ${it === dist.items[0] ? s.rowStrong : ''}`} onClick={() => add(it.word)}>
                <span className={s.rowLabel}>
                  <span className={s.plus} aria-hidden="true">+</span>
                  {it.word === END ? '. (end)' : it.word}
                </span>
                <span className={s.track} aria-hidden="true">
                  <span className={s.fill} style={{ width: `${(it.p / top) * 100}%`, background: it.word === END ? 'var(--viz-5)' : 'var(--viz-1)' }} />
                </span>
                <span className={s.val}>
                  {it.count}/{dist.total}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Controls>
        <Button primary onClick={greedy} disabled={done || dist.items.length === 0}>
          Pick most likely
        </Button>
        <Button onClick={sample} disabled={done || dist.items.length === 0}>
          Sample at random
        </Button>
        <Button onClick={() => setWords((w) => w.slice(0, -1))} disabled={words.length === 0}>
          Undo
        </Button>
        <Button onClick={() => setWords([])}>Start again</Button>
      </Controls>

      <details style={{ width: '100%' }}>
        <summary style={{ cursor: 'pointer', fontSize: 'var(--step--1)', color: 'var(--ink-2)' }}>Show the 16 training sentences</summary>
        <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1.4rem', fontSize: '0.85rem', color: 'var(--ink-2)', columns: '2 14rem', columnGap: '1.5rem' }}>
          {CORPUS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
      </details>
    </Figure>
  )
}
