import { Fragment, useState } from 'react'
import { Figure, Controls, Toggle, Segmented, Button, Readout, useNarrow } from '../../../../../kit'
import { TryNotice } from '../Caption'
import s from './bow.module.css'

/*
  Term-by-document table: counts (TF), document frequency (df), IDF and the TF-IDF weights
  as a heat map. Three IDF variants:
    log2  : log2(N / df)              (whole numbers in the lesson's hand example)
    ln    : ln(N / df)                (same pattern, every value x 0.693)
    smooth: ln((1 + N) / (1 + df)) + 1 (scikit-learn's default; never exactly 0)
*/

const DEFAULT_DOCS = ['the chicken rice is good', 'the mrt is fast', 'the chicken is spicy', 'the rice is cheap']
const EXTRA = 'the mrt to the hawker centre is fast'
type Variant = 'log2' | 'ln' | 'smooth'

const tokenise = (t: string) => (t.toLowerCase().match(/[a-z0-9']+/g) ?? []).slice(0, 12)

function idfOf(N: number, df: number, v: Variant) {
  if (v === 'log2') return Math.log2(N / df)
  if (v === 'ln') return Math.log(N / df)
  return Math.log((1 + N) / (1 + df)) + 1
}

const fmt = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(2))

export default function TFIDFTable() {
  const [docs, setDocs] = useState<string[]>(DEFAULT_DOCS)
  const [useIdf, setUseIdf] = useState(true)
  const [variant, setVariant] = useState<Variant>('log2')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(440)

  const toks = docs.map(tokenise)
  const N = docs.length
  const terms = [...new Set(toks.flat())]
  const df = new Map(terms.map((t) => [t, toks.filter((d) => d.includes(t)).length]))
  // common words first, then alphabetical
  terms.sort((x, y) => df.get(y)! - df.get(x)! || x.localeCompare(y))
  const tf = toks.map((d) => terms.map((t) => d.filter((w) => w === t).length))
  const idf = terms.map((t) => idfOf(N, df.get(t)!, variant))
  const W = tf.map((row) => row.map((c, j) => (useIdf ? c * idf[j] : c)))
  const maxW = Math.max(1e-9, ...W.flat())
  const top = W.map((row) => {
    const m = Math.max(...row)
    return m > 0 ? terms.filter((_, j) => Math.abs(row[j] - m) < 1e-9) : []
  })
  // a "top word" is only shown when there is a clear winner (at most a 2-way tie)
  const clear = top.map((tw) => tw.length > 0 && tw.length <= 2)
  const noWinner = clear.every((c) => !c)

  const heat = (v: number) => (v > 0 ? `color-mix(in srgb, ${useIdf ? 'var(--viz-2)' : 'var(--viz-1)'} ${Math.round(12 + (v / maxW) * 58)}%, var(--surface))` : undefined)
  const cols = narrow ? `minmax(3.4rem, max-content) repeat(${N}, 2.35rem) 1.6rem 2.5rem` : `minmax(4.2rem, max-content) repeat(${N}, 2.9rem) 2.2rem 3rem`

  return (
    <Figure
      wide
      title="From counts to TF-IDF weights"
      caption={
        <TryNotice
          tryIt={
            <>
              switch <b>multiply by IDF</b> off and on, then add a fifth document.
            </>
          }
          notice={
            <>
              words in every document (<code>the</code>, <code>is</code>) get IDF 0 and vanish; rare words light up and become each document&apos;s top
              word. The smoothed formula never gives exactly 0, but it still ranks words the same way: the rarer the word, the higher its IDF.
            </>
          }
          note={
            <>
              Here words are rows and documents are columns: the transpose of the matrix <code>X</code> in the NumPy code below, which is why df is{' '}
              <code>(tf &gt; 0).sum(axis=0)</code> there.
            </>
          }
        />
      }
    >
      <div className={s.field}>
        <span className={s.fieldLabel}>Documents (edit me)</span>
        {docs.map((d, i) => (
          <div key={i} className={s.docRow}>
            <label className={s.docTag} htmlFor={`tfidf-doc-${i}`}>
              d{i + 1}
            </label>
            <input
              id={`tfidf-doc-${i}`}
              className={s.input}
              value={d}
              spellCheck={false}
              onChange={(e) => setDocs((ds) => ds.map((x, j) => (j === i ? e.target.value : x)))}
            />
          </div>
        ))}
      </div>
      <Controls>
        {docs.length < 5 ? (
          <Button onClick={() => setDocs((ds) => [...ds, EXTRA])}>Add a document</Button>
        ) : (
          <Button onClick={() => setDocs((ds) => ds.slice(0, 4))}>Remove d5</Button>
        )}
        <Toggle label="multiply by IDF" checked={useIdf} onChange={setUseIdf} />
        <Segmented
          label="IDF formula"
          value={variant}
          onChange={setVariant}
          options={[
            { value: 'log2', label: 'log₂(N/df)' },
            { value: 'ln', label: 'ln(N/df)' },
            { value: 'smooth', label: 'smoothed' },
          ]}
        />
      </Controls>
      <div className={s.scroll} ref={wrapRef}>
        <div className={s.table} style={{ gridTemplateColumns: cols, fontSize: narrow ? 11 : 12 }} role="table" aria-label="Term by document table with document frequency and IDF">
          <span className={s.th} style={{ justifyContent: 'flex-end' }}>
            word
          </span>
          {docs.map((_, i) => (
            <span key={i} className={s.th}>
              d{i + 1}
            </span>
          ))}
          <span className={s.th}>df</span>
          <span className={s.th}>idf</span>
          {terms.map((t, j) => (
            <Fragment key={t}>
              <span className={s.term}>{t}</span>
              {W.map((row, i) => (
                <span key={i} className={`${s.td} ${row[j] ? '' : s.tdMuted} ${clear[i] && top[i].includes(t) ? s.tdStrong : ''}`} style={{ background: heat(row[j]) }}>
                  {fmt(row[j])}
                </span>
              ))}
              <span className={`${s.td} ${s.tdStat}`}>{df.get(t)}</span>
              <span className={`${s.td} ${s.tdStat}`} style={{ color: idf[j] < 1e-9 ? 'var(--viz-neg)' : undefined, fontWeight: 700 }}>
                {fmt(idf[j])}
              </span>
            </Fragment>
          ))}
          <span className={s.th} style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
            top word
          </span>
          {top.map((tw, i) => (
            <span key={i} className={s.foot} style={{ fontSize: narrow ? '0.7rem' : undefined }}>
              {clear[i]
                ? tw.map((w) => (
                    <span key={w} style={{ display: 'block' }}>
                      {w}
                    </span>
                  ))
                : tw.length
                  ? <span style={{ display: 'block', color: 'var(--ink-2)', fontWeight: 600 }} title={`${tw.length}-way tie: ${tw.join(', ')}`} aria-label={`${tw.length}-way tie`}>tie</span>
                  : '–'}
            </span>
          ))}
          <span />
          <span />
        </div>
      </div>
      {noWinner && (
        <p className={s.small} style={{ margin: 0, textAlign: 'center' }} role="status">
          {useIdf
            ? 'Every document has several equally weighted words, so there is no single top word.'
            : 'With plain counts the words in each document tie, so there is no top word. Switch IDF back on.'}
        </p>
      )}
      <Readout
        items={[
          ['documents N', String(N)],
          ['vocabulary', `${terms.length} words`],
          ['showing', useIdf ? 'TF × IDF' : 'counts (TF)'],
        ]}
      />
    </Figure>
  )
}
