import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Readout } from '../../../../../kit'
import { HANDBOOK, fit, score, tokenise } from './handbook'
import s from './rag.module.css'

/*
  Augment + generate. The retriever's top-k documents with score > min_score become (a) the
  context block of a prompt for an LLM, and (b) a template answer that a NumPy-only solution
  can produce. Scores come from the same count-vector cosine as the lesson's code.
*/

const QUERIES = ['Is the library open on Friday?', 'When is the exam hall closed?', 'Is the canteen open on Monday?', 'Is the swimming pool open on Monday?']

export default function AnswerAssembler() {
  const [query, setQuery] = useState(QUERIES[0])
  const [k, setK] = useState(2)
  const [minScore, setMinScore] = useState(0.3)
  const model = useMemo(() => fit(HANDBOOK), [])
  const res = useMemo(() => score(model, query), [model, query])
  const qTok = tokenise(query)
  const recognised = qTok.filter((w) => model.index.has(w)).length
  const top = res.order.slice(0, k).filter((i) => res.scores[i] > minScore)
  const context = top.map((i) => `[d${i}] ${HANDBOOK[i]}`)
  const ctxWords = top.reduce((a, i) => a + HANDBOOK[i].split(/\s+/).length, 0)
  const answer = top.length ? `According to the handbook: ${top.map((i) => `${HANDBOOK[i]} [d${i}]`).join(' ')}` : 'I don’t know: the handbook does not say.'

  return (
    <Figure
      wide
      title="Augment, then generate: what the retriever hands over"
      caption={
        <>
          Retrieved documents (top k, and right of the dashed minimum-score line) become the prompt's context and the template answer. For the swimming pool, unknown words
          are silently ignored, so the query shrinks to “open Monday” and the canteen scores 0.632. A minimum score of 0.65 hides that here; a sturdier guard is counting
          recognised query words.
        </>
      }
    >
      <p className={s.tryLine}>
        <b>Try:</b> slide <b>top k</b> up and watch weaker documents join the prompt. Then ask about the swimming pool.
      </p>
      <div className={s.field}>
        <label className={s.sectionLabel} htmlFor="aa-query">
          Question
        </label>
        <input id="aa-query" className={s.input} value={query} spellCheck={false} onChange={(e) => setQuery(e.target.value)} />
        <div className={s.chips}>
          {QUERIES.map((p) => (
            <button key={p} type="button" className={`${s.chip} ${p === query ? s.chipOn : ''}`} onClick={() => setQuery(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <Controls>
        <Slider label="top k" value={k} min={1} max={4} step={1} onChange={setK} />
        <Slider label="minimum score" value={minScore} min={0} max={0.9} step={0.05} onChange={setMinScore} format={(v) => v.toFixed(2)} />
      </Controls>
      <div className={s.results} style={{ maxWidth: '100%' }} role="list" aria-label="Documents ranked by cosine score">
        {res.order.map((i, r) => {
          const used = top.includes(i)
          const sc = res.scores[i]
          return (
            <div key={i} role="listitem" className={`${s.docRow} ${used ? s.docRowTop : ''}`} style={{ gridTemplateColumns: '2.2rem minmax(0, 1fr) 7.5rem' }}>
              <span className={s.docTag}>d{i}</span>
              <span className={s.docText}>{HANDBOOK[i]}</span>
              <span style={{ display: 'grid', gap: 2 }}>
                <span className={s.num} style={{ fontSize: '0.8rem' }}>
                  {sc.toFixed(3)} {used ? <b>✓</b> : r >= k ? <span className={s.muted}>rank {r + 1}</span> : <span className={s.muted}>too low</span>}
                </span>
                <span className={s.barTrack} style={{ position: 'relative' }}>
                  <span className={s.barFill} style={{ width: `${Math.max(0, sc) * 100}%`, background: used ? 'var(--viz-pos)' : 'var(--viz-1)' }} />
                  <span
                    aria-hidden="true"
                    style={{ position: 'absolute', top: -2, bottom: -2, left: `${minScore * 100}%`, borderLeft: '2px dashed var(--ink)' }}
                  />
                </span>
              </span>
            </div>
          )
        })}
      </div>
      <div className={s.twoCol}>
        <div className={s.panel}>
          <div className={s.panelHead}>Augment: the prompt an LLM would receive</div>
          <div className={s.panelBody}>
            <pre className={s.promptText}>
              <span className={s.instr}>
                {'Answer the question using ONLY the context. If the context does not contain the answer, say "I don\'t know". Cite the documents you use.\n\n'}
              </span>
              {'Context:\n'}
              {context.length ? (
                context.map((c, i) => (
                  <span key={i}>
                    <span className={s.ctx}>{c}</span>
                    {'\n'}
                  </span>
                ))
              ) : (
                <span className={s.instr}>{'(nothing retrieved)\n'}</span>
              )}
              {`\nQuestion: ${query}\nAnswer:`}
            </pre>
          </div>
        </div>
        <div className={s.panel}>
          <div className={s.panelHead}>Generate without an LLM: a template answer</div>
          <div className={s.panelBody}>
            <p style={{ margin: 0 }}>{answer}</p>
            <p className={s.note} style={{ margin: '0.6rem 0 0' }}>
              <code>top_documents</code> = [{top.map((i) => `d${i}`).join(', ')}].{' '}
              {!top.length
                ? 'Nothing passed the filters, so the honest answer is that the documents do not say.'
                : recognised < qTok.length
                  ? `Warning: only ${recognised} of ${qTok.length} query words were recognised, so the copied text may be about something else. Copying avoids invented facts, but not wrong documents.`
                  : 'Every word of this answer is copied from a retrieved document, so it cannot invent facts. It is clumsy, but in a NumPy-only exam it is honest.'}
            </p>
          </div>
        </div>
      </div>
      <Readout
        items={[
          ['retrieved', `${top.length} of ${HANDBOOK.length}`],
          ['context length', `${ctxWords} words`],
          ['best score', res.scores[res.order[0]].toFixed(3)],
          ['query words recognised', `${recognised} of ${qTok.length}`],
        ]}
      />
    </Figure>
  )
}
