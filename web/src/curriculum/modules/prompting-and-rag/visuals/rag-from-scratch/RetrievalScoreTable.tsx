import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Segmented, Button, PlayerControls, CodeBlock, M } from '../../../../../kit'
import { HANDBOOK, PRESET_QUERIES, STOP, fit, score, tokenise } from './handbook'
import s from './rag.module.css'
import { useStepper } from './useStepper'

/*
  Stepper: tokens -> vocabulary -> document-term matrix D -> query vector q -> D @ q -> norms
  -> cosine scores -> np.argsort(-scores)[:k]. Every number is computed with the same formulas as
  the lesson's NumPy code (see handbook.ts). The learner can type a query, add documents and
  switch counts / TF-IDF.
*/

const STEPS = ['tokenise', 'vocabulary', 'matrix D', 'query vector q', 'dot products D @ q', 'lengths (norms)', 'cosine scores', 'top-k ranking']
const MAX_DOCS = 6
const MAX_VOCAB = 14
const SUGGESTED_DOC = 'The canteen is closed in exam week.'

/** Render a text with stop words / punctuation dimmed, kept words bold, query words marked. */
export function TokenText({ text, hits, known }: { text: string; hits?: Set<string>; known?: Set<string> }) {
  const parts = text.split(/([A-Za-z]+)/)
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null
        if (!/^[A-Za-z]+$/.test(p))
          return (
            <span key={i} className={p.trim() ? s.wPunct : undefined}>
              {p}
            </span>
          )
        const w = p.toLowerCase()
        if (STOP.has(w))
          return (
            <span key={i} className={s.wStop}>
              {p}
            </span>
          )
        if (known && !known.has(w))
          return (
            <span key={i} className={s.wUnknown} title="not in the vocabulary: ignored">
              {p}
            </span>
          )
        if (hits && hits.has(w))
          return (
            <span key={i} className={s.wHit}>
              {p}
            </span>
          )
        return (
          <span key={i} className={s.wKeep}>
            {p}
          </span>
        )
      })}
    </>
  )
}

const fmtCell = (v: number, tfidf: boolean) => (v === 0 ? '0' : tfidf ? v.toFixed(1) : String(v))
const f3 = (v: number) => (Number.isNaN(v) ? 'nan' : v.toFixed(3))
const f2 = (v: number) => v.toFixed(2)

export default function RetrievalScoreTable() {
  const [query, setQuery] = useState(PRESET_QUERIES[0])
  const [extra, setExtra] = useState<string[]>([])
  const [draft, setDraft] = useState(SUGGESTED_DOC)
  const [msg, setMsg] = useState<string | null>(null)
  const [weighting, setWeighting] = useState<'count' | 'tfidf'>('count')
  const [k, setK] = useState(2)
  const player = useStepper({ steps: STEPS.length, interval: 1500 })
  const step = player.step

  const docs = useMemo(() => [...HANDBOOK, ...extra], [extra])
  const model = useMemo(() => fit(docs), [docs])
  const res = useMemo(() => score(model, query, weighting), [model, query, weighting])
  const tfidf = weighting === 'tfidf'
  const V = model.vocab.length
  const n = docs.length
  const qTokens = tokenise(query)
  const qSet = new Set(qTokens.filter((w) => model.index.has(w)))
  const unknown = qTokens.filter((w) => !model.index.has(w))
  const known = new Set(model.vocab)
  const topK = res.order.slice(0, k)
  const rankOf = new Map(topK.map((i, r) => [i, r]))
  const qCols = new Set(res.q.map((v, j) => (v !== 0 ? j : -1)).filter((j) => j >= 0))

  const addDoc = () => {
    const t = draft.trim()
    if (!t) return
    if (docs.length >= MAX_DOCS) return setMsg(`This demo holds at most ${MAX_DOCS} documents.`)
    if (tokenise(t).length === 0) return setMsg('That document has no words left after removing stop words.')
    const newVocab = new Set([...model.vocab, ...tokenise(t)])
    if (newVocab.size > MAX_VOCAB) return setMsg(`That would grow the vocabulary to ${newVocab.size} words; keep it to ${MAX_VOCAB} so the table fits. Try words already in the table.`)
    setExtra([...extra, t])
    setDraft('')
    setMsg(null)
  }

  const cellW = tfidf ? 30 : 26
  const cols = `2.3rem repeat(${V}, ${cellW}px)`

  // per-step explanation, with live numbers
  const best = res.order[0]
  const explain: ReactNode[] = [
    <>Every text is cut into lower-case words; stop words (faded) and punctuation are dropped. The same <code>tokenise</code> runs on documents and the query.</>,
    <>
      The <b>vocabulary</b> is every distinct word left in the <b>documents</b>, sorted. Each word gets a column number <code>index[word]</code>. Here <M>{`V = ${V}`}</M>.
    </>,
    <>
      Row <M>{'i'}</M> of <M>{'D'}</M> counts how often each vocabulary word appears in document <M>{'i'}</M>
      {tfidf ? <>, then multiplies by that word's IDF (row <i>idf</i>): rare words weigh more</> : null}. Shape <code>({n}, {V})</code>: one row per document.
    </>,
    <>
      The query becomes a vector <M>{'q'}</M> in the <b>same</b> columns{tfidf ? ', with the same IDF weights' : ''}.{' '}
      {unknown.length ? (
        <>
          Words not in the vocabulary ({unknown.map((w) => `“${w}”`).join(', ')}) have no column, so they are ignored.
        </>
      ) : (
        <>Shaded columns are the query's words.</>
      )}
    </>,
    <>
      <code>D @ q</code> takes the dot product of every row with <M>{'q'}</M> at once: multiply matching cells (outlined) and add. d{best} gets{' '}
      <M>{`${res.dots[best] === Math.round(res.dots[best]) ? res.dots[best] : res.dots[best].toFixed(2)}`}</M>.
    </>,
    <>
      Each length is <M>{'\\sqrt{\\text{sum of squares}}'}</M> of a row: <code>np.linalg.norm(D, axis=1)</code> gives all {n} at once, and{' '}
      <M>{`\\lVert q \\rVert = ${f2(res.qNorm)}`}</M>. Long documents have long vectors.
    </>,
    <>
      Cosine = dot product ÷ (both lengths). Dividing by the length stops a long document winning just because it has more words; only the <b>mix</b> of words
      counts. Scores run from 0 to 1 here because counts are never negative.
    </>,
    <>
      <code>np.argsort(-scores)</code> lists document numbers from the highest score to the lowest; <code>[:{k}]</code> keeps the first {k}. Retrieved:{' '}
      {topK.map((i) => `d${i}`).join(', ')}.
    </>,
  ]

  const codeLines = [
    'tokens = [tokenise(d) for d in documents]',
    'vocab = sorted({w for t in tokens for w in t})',
    'index = {w: j for j, w in enumerate(vocab)}',
    'D = np.array([vectorise(d) for d in documents])',
    ...(tfidf ? ['D = D * idf          # TF-IDF weights'] : []),
    `q = vectorise(query)${tfidf ? ' * idf' : ''}`,
    'dots = D @ q',
    'norms = np.linalg.norm(D, axis=1) * np.linalg.norm(q)',
    'scores = dots / (norms + 1e-10)',
    `top = np.argsort(-scores, kind="stable")[:${k}]`,
  ]
  const o = tfidf ? 1 : 0
  const hl: number[][] = [[1], [2, 3], tfidf ? [4, 5] : [4], [5 + o], [6 + o], [7 + o], [8 + o], [9 + o]]

  return (
    <Figure
      wide
      title="The scoring table: a whole retriever in five arrays"
      caption={
        <>
          The table starts finished. Press <b>Restart</b>, then <b>Next</b>, to build the retriever one array at a time and see the line of NumPy that makes each one. Then edit the query or click a
          preset. Notice that d0 and d2 have the <b>same</b> dot product for the first preset (3 each), but d0 wins after dividing by length because d2 is longer.
          Add the suggested document and see the vocabulary and every score update. With <b>TF-IDF</b>, “canteen open Monday” no longer ties d0 with d3.
        </>
      }
    >
      <div className={s.stack}>
        <div className={s.field}>
          <label className={s.sectionLabel} htmlFor="rst-query">
            Query
          </label>
          <input id="rst-query" className={s.input} value={query} spellCheck={false} onChange={(e) => setQuery(e.target.value)} />
          <div className={s.chips}>
            {PRESET_QUERIES.map((p) => (
              <button key={p} type="button" className={`${s.chip} ${p === query ? s.chipOn : ''}`} onClick={() => setQuery(p)}>
                {p}
              </button>
            ))}
          </div>
          <div className={s.note}>
            query tokens:{' '}
            {qTokens.length ? (
              <TokenText text={qTokens.join(' ')} known={known} hits={step >= 3 ? qSet : undefined} />
            ) : (
              <span className={s.noteBad}>none (the query vector will be all zeros)</span>
            )}
          </div>
        </div>

        <div className={s.docList} role="list" aria-label="Documents">
          {docs.map((d, i) => {
            const isTop = step >= 7 && rankOf.has(i)
            return (
              <div key={i} role="listitem" className={`${s.docRow} ${isTop ? s.docRowTop : ''}`}>
                <span className={s.docTag}>d{i}</span>
                <span className={s.docText}>
                  <TokenText text={d} hits={step >= 3 ? qSet : undefined} />
                </span>
                {isTop ? (
                  <span className={s.rankBadge}>#{rankOf.get(i)! + 1}</span>
                ) : i >= HANDBOOK.length ? (
                  <button type="button" className={s.removeBtn} aria-label={`Remove d${i}`} onClick={() => setExtra(extra.filter((_, j) => j !== i - HANDBOOK.length))}>
                    ×
                  </button>
                ) : (
                  <span />
                )}
              </div>
            )
          })}
        </div>
        <div className={s.field}>
          <label className={s.sectionLabel} htmlFor="rst-add">
            Add a document
          </label>
          <div className={s.fieldRow}>
            <input
              id="rst-add"
              className={s.input}
              value={draft}
              spellCheck={false}
              placeholder="type a sentence"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDoc()}
            />
            <Button onClick={addDoc} disabled={!draft.trim() || docs.length >= MAX_DOCS}>
              Add
            </Button>
          </div>
          {msg && <div className={`${s.note} ${s.noteBad}`}>{msg}</div>}
        </div>

        <Controls>
          <Segmented
            label="weights"
            value={weighting}
            onChange={setWeighting}
            options={[
              { value: 'count', label: 'counts' },
              { value: 'tfidf', label: 'TF-IDF' },
            ]}
          />
          <Segmented
            label="k"
            value={k}
            onChange={setK}
            options={[1, 2, 3].map((v) => ({ value: v, label: String(v) }))}
          />
        </Controls>

        <PlayerControls player={player} label={(i) => `Step ${i + 1} of ${STEPS.length}: ${STEPS[i]}`} />
        <div className={s.explain} aria-live="polite">
          {explain[step]}
        </div>

        {step >= 1 && (
          <div className={s.scroll}>
            <div className={s.mgrid} style={{ gridTemplateColumns: cols }} role="table" aria-label={`Document-term matrix D with ${n} rows and ${V} columns`}>
              <span />
              {model.vocab.map((w, j) => (
                <span key={w} className={`${s.mHead} ${step >= 3 && qCols.has(j) ? s.mCol : ''}`}>
                  {w}
                </span>
              ))}
              <span className={s.mIdx}>col</span>
              {model.vocab.map((w, j) => (
                <span key={w} className={s.mIdx}>
                  {j}
                </span>
              ))}
              {step >= 2 && tfidf && (
                <>
                  <span className={`${s.mLabel}`} style={{ fontSize: 10.5 }}>
                    idf
                  </span>
                  {model.idf.map((v, j) => (
                    <span key={j} className={s.mIdf}>
                      {v.toFixed(2)}
                    </span>
                  ))}
                </>
              )}
              {step >= 2 &&
                res.W.map((row, i) => (
                  <Row key={i} label={`d${i}`}>
                    {row.map((v, j) => {
                      const col = step >= 3 && qCols.has(j)
                      const hit = step >= 4 && v !== 0 && res.q[j] !== 0
                      return (
                        <span key={j} className={`${s.mCell} ${v === 0 ? s.mZero : ''} ${col ? s.mCol : ''} ${hit ? s.mHit : ''}`}>
                          {fmtCell(v, tfidf)}
                        </span>
                      )
                    })}
                  </Row>
                ))}
              {step >= 3 && (
                <>
                  <span className={s.mGap} style={{ gridColumn: `1 / span ${V + 1}` }} />
                  <Row label="q">
                    {res.q.map((v, j) => (
                      <span key={j} className={`${s.mCell} ${s.mQ} ${v === 0 ? s.mZero : ''} ${v !== 0 ? s.mHit : ''}`}>
                        {fmtCell(v, tfidf)}
                      </span>
                    ))}
                  </Row>
                </>
              )}
            </div>
          </div>
        )}

        {step >= 4 && (
          <div className={s.results} role="table" aria-label="Scores per document">
            <div className={`${s.rRow} ${s.rHead}`} role="row">
              <span>doc</span>
              <span className={s.num}>D @ q</span>
              <span className={s.num}>‖dᵢ‖</span>
              <span className={s.num}>cos</span>
              <span />
              <span className={s.num}>rank</span>
            </div>
            {docs.map((_, i) => {
              const isTop = step >= 7 && rankOf.has(i)
              const r = res.order.indexOf(i)
              return (
                <div key={i} role="row" className={`${s.rRow} ${s.rBody} ${isTop ? s.rTop : ''}`}>
                  <span className={s.docTag}>d{i}</span>
                  <span className={s.num}>{tfidf ? f2(res.dots[i]) : res.dots[i]}</span>
                  <span className={`${s.num} ${step < 5 ? s.muted : ''}`}>{step >= 5 ? f2(res.norms[i]) : '…'}</span>
                  <span className={`${s.num} ${step < 6 ? s.muted : ''}`}>{step >= 6 ? f3(res.scores[i]) : '…'}</span>
                  <span className={s.barTrack}>
                    {step >= 6 && (
                      <span className={s.barFill} style={{ width: `${Math.max(0, Math.min(1, res.scores[i])) * 100}%`, background: isTop ? 'var(--viz-2)' : 'var(--viz-1)' }} />
                    )}
                  </span>
                  <span className={`${s.num} ${step < 7 ? s.muted : ''}`}>{step >= 7 ? (isTop ? <b>#{r + 1}</b> : `${r + 1}`) : '…'}</span>
                </div>
              )
            })}
          </div>
        )}

        <Readout
          items={[
            ['D shape', step >= 2 ? `(${n}, ${V})` : '…'],
            ['q shape', step >= 3 ? `(${V},)` : '…'],
            ['‖q‖', step >= 5 ? f2(res.qNorm) : '…'],
            ['top-k', step >= 7 ? `[${topK.join(', ')}]` : '…'],
          ]}
        />
        <div className={s.code}>
          <CodeBlock code={codeLines.join('\n')} highlight={hl[step]} showLineNumbers={false} title="the NumPy line for this step" />
        </div>
      </div>
    </Figure>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <span className={s.mLabel}>{label}</span>
      {children}
    </>
  )
}
