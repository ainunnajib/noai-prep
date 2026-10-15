import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Toggle } from '../../../../../kit'
import s from './bow.module.css'

/*
  A complete little search engine: tokenise (lower-case letters/digits, optional stop-word
  removal), build count vectors, weight by IDF = ln(N / df), and rank documents by cosine
  similarity with the query. Query words that are not in the vocabulary are ignored, as in
  scikit-learn's vectorisers.
*/

const CORPORA = {
  hawker: {
    name: 'Hawker guide',
    query: 'where is the laksa',
    docs: [
      // "the" is in every document, so its IDF is ln(6/6) = 0, as in the lesson
      'The chicken rice is steamed chicken with fragrant rice and chilli sauce.',
      'The laksa is a spicy noodle soup with coconut milk and prawns.',
      'The char kway teow is fried flat noodles with egg and cockles.',
      'The hawker centre near the MRT station is the busiest in the morning.',
      'The teh tarik is sweet milk tea, pulled to make it frothy.',
      'Most stalls at the hawker centre close late at night.',
    ],
  },
  noai: {
    name: 'NOAI 2025 Final Q3',
    query: 'How does machine learning work?',
    docs: [
      'Artificial intelligence is transforming industries.',
      'Machine learning is a subset of artificial intelligence.',
      'Deep learning allows machines to solve complex problems.',
      'Data science involves statistics and machine learning.',
      'Neural networks are inspired by the human brain.',
    ],
  },
} as const
type CorpusKey = keyof typeof CORPORA

const STOP = new Set(['a', 'an', 'the', 'is', 'are', 'of', 'and', 'to', 'by', 'how', 'does', 'do', 'what', 'where', 'which', 'why', 'in', 'on', 'at', 'for', 'it', 'with', 'i', 'me', 'my', 'you'])

const words = (t: string) => t.toLowerCase().match(/[a-z0-9]+/g) ?? []

export default function CosineSearch() {
  const [corpus, setCorpus] = useState<CorpusKey>('hawker')
  const [query, setQuery] = useState<string>(CORPORA.hawker.query)
  const [weighting, setWeighting] = useState<'tfidf' | 'raw'>('tfidf')
  const [stop, setStop] = useState(false)
  const [k, setK] = useState(2)
  const docs = CORPORA[corpus].docs

  const keep = (w: string) => !(stop && STOP.has(w))
  const model = useMemo(() => {
    const toks = docs.map((d) => words(d).filter(keep))
    const vocab = [...new Set(toks.flat())]
    const index = new Map(vocab.map((w, i) => [w, i]))
    const N = docs.length
    const tf = toks.map((d) => {
      const v = new Array(vocab.length).fill(0)
      for (const w of d) v[index.get(w)!] += 1
      return v as number[]
    })
    const df = vocab.map((_, j) => tf.filter((r) => r[j] > 0).length)
    const idf = df.map((d) => Math.log(N / d))
    return { vocab, index, tf, idf }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corpus, stop])

  const qWords = words(query)
  const qv = new Array(model.vocab.length).fill(0) as number[]
  for (const w of qWords) if (keep(w) && model.index.has(w)) qv[model.index.get(w)!] += 1
  const weight = (v: number[]) => (weighting === 'tfidf' ? v.map((c, j) => c * model.idf[j]) : v)
  const q = weight(qv)
  const qNorm = Math.hypot(...q)
  const scores = model.tf.map((row) => {
    const d = weight(row)
    const dot = d.reduce((a, x, j) => a + x * q[j], 0)
    const n = Math.hypot(...d)
    return qNorm > 0 && n > 0 ? dot / (qNorm * n) : 0
  })
  const order = scores.map((_, i) => i).sort((a, b) => scores[b] - scores[a] || a - b)
  const rankOf = new Map(order.map((i, r) => [i, r]))
  const qSet = new Set(qWords.filter((w) => keep(w) && model.index.has(w) && (weighting === 'raw' || model.idf[model.index.get(w)!] > 0)))

  const switchCorpus = (c: CorpusKey) => {
    setCorpus(c)
    setQuery(CORPORA[c].query)
  }

  const highlight = (text: string) =>
    text.split(/(\s+)/).map((part, i) => {
      const w = part.toLowerCase().replace(/[^a-z0-9]/g, '')
      return qSet.has(w) ? (
        <mark key={i} className={s.hit}>
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    })

  return (
    <Figure
      wide
      title="A search engine in four steps: tokenise, vectorise, weight, rank"
      caption={
        <>
          Type a question. The query is turned into a vector exactly like the documents, and each bar is the cosine similarity between the query and
          a document; the top <i>k</i> are retrieved. Start with <b>where is the laksa</b> and switch between raw counts and TF-IDF: with raw counts the
          MRT document wins because it contains “the” four times. TF-IDF gives “the” (in all 6 documents) an IDF of exactly 0, shrinks “is” (in 5 of
          them) and gives the rare word “laksa” (in only one) the largest weight, so the laksa document comes first. Then try removing stop words. Switch to the NOAI 2025 Final documents to see the retrieval half of that 40-mark task.
        </>
      }
    >
      <Controls>
        <Segmented
          label="documents"
          value={corpus}
          onChange={switchCorpus}
          options={[
            { value: 'hawker', label: CORPORA.hawker.name },
            { value: 'noai', label: CORPORA.noai.name },
          ]}
        />
        <Segmented
          label="weighting"
          value={weighting}
          onChange={setWeighting}
          options={[
            { value: 'raw', label: 'raw counts' },
            { value: 'tfidf', label: 'TF-IDF' },
          ]}
        />
      </Controls>
      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="cos-query">
          Query
        </label>
        <input id="cos-query" className={s.input} value={query} spellCheck={false} onChange={(e) => setQuery(e.target.value)} />
        <div className={s.chips} aria-label="Query vector">
          <span className={s.small}>query vector:</span>
          {qWords.length === 0 && <span className={s.small}>type some words</span>}
          {qWords.map((w, i) => {
            if (!keep(w))
              return (
                <span key={i} className={`${s.chip} ${s.chipOff}`} title="stop word removed">
                  {w}
                </span>
              )
            if (!model.index.has(w))
              return (
                <span key={i} className={`${s.chip} ${s.chipOut}`} title="not in the documents' vocabulary: ignored">
                  {w}
                  <span className={s.chipSub}>not in vocab</span>
                </span>
              )
            const j = model.index.get(w)!
            const val = weighting === 'tfidf' ? model.idf[j] : 1
            return (
              <span key={i} className={s.chip} style={{ background: `color-mix(in srgb, var(--viz-2) ${Math.round(10 + Math.min(1, val / 2) * 45)}%, var(--surface))` }}>
                {w}
                <span className={s.chipSub}>{weighting === 'tfidf' ? `idf ${val.toFixed(2)}` : 'count 1'}</span>
              </span>
            )
          })}
        </div>
      </div>
      <Controls>
        <Slider label="top k" value={k} min={1} max={3} step={1} onChange={setK} />
        <Toggle label="remove stop words" checked={stop} onChange={setStop} />
      </Controls>
      <div className={s.results} role="list" aria-label="Documents ranked by cosine similarity">
        {docs.map((d, i) => {
          const r = rankOf.get(i)!
          const isTop = r < k && scores[i] > 0
          return (
            <div key={i} role="listitem" className={`${s.result} ${isTop ? s.resultTop : ''}`}>
              <span className={s.rank}>{isTop ? `#${r + 1}` : `d${i + 1}`}</span>
              <span className={s.docText}>{highlight(d)}</span>
              <span className={s.score}>{scores[i].toFixed(3)}</span>
              <span className={s.barTrack}>
                <span className={s.barFill} style={{ width: `${Math.max(0, scores[i]) * 100}%`, background: isTop ? 'var(--viz-2)' : 'var(--viz-1)' }} />
              </span>
            </div>
          )
        })}
      </div>
    </Figure>
  )
}
