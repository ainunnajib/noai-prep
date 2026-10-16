import { useState } from 'react'
import { Figure, Controls, Toggle, Segmented, Button, Readout } from '../../../../../kit'
import { DOCUMENTS, QUERY, OFFICIAL, retrieve, ranking, rawTokens, tokenChips, type TokOpts } from './rag'
import s from './rag.module.css'

/*
  Cosine scores of the five exam documents against the query, under different cleaning choices.
  Presets: the official 2025 solution (split on spaces, keep stop words, plain counts) and our clean
  TF-IDF pipeline. The top 2 are marked; the readout shows how far ahead the 2nd place is of the 3rd.
*/

type Weight = 'none' | 'smooth'

// The official settings' scores, for the caption (d4 0.267 vs d3 0.250).
const OFF = retrieve(QUERY, OFFICIAL, 'none').scores

export default function RetrievalScoreboard() {
  const [strip, setStrip] = useState(false)
  const [stop, setStop] = useState(false)
  const [weight, setWeight] = useState<Weight>('none')
  const o: TokOpts = { strip, stop }
  const r = retrieve(QUERY, o, weight)
  const order = ranking(r.scores)
  const top2 = order.slice(0, 2)
  const margin = r.scores[order[1]] - r.scores[order[2]]
  const max = Math.max(0.7, ...r.scores)
  const qSet = new Set(r.q.known)
  const isOfficial = !strip && !stop && weight === 'none'
  const isClean = strip && stop && weight === 'smooth'

  // Highlight, inside each sentence, the pieces that matched a query word under the current tokeniser.
  const renderSentence = (d: string) => {
    const words = d.split(' ')
    return words.map((w, k) => {
      const hit = rawTokens(w, strip).some((t) => qSet.has(t))
      return (
        <span key={k}>
          {k > 0 && ' '}
          {hit ? <span className={s.mark}>{w}</span> : w}
        </span>
      )
    })
  }

  return (
    <Figure
      wide
      title="Which documents does the query pull up?"
      caption={
        <>
          It starts with the <b>official 2025 solution</b>&apos;s settings: split on spaces, keep every word, plain counts. Documents 2 and 4 win,
          but d4 beats d3 by only {(OFF[3] - OFF[2]).toFixed(3)}: each shares just one word with the query, and d4 is one word shorter. Now switch on
          the clean-up steps one at a time. Stripping punctuation lets &quot;learning.&quot; match &quot;learning&quot;; dropping stop words and
          weighting by IDF stop &quot;is&quot;, &quot;a&quot; and &quot;of&quot; from padding the vectors. With the full clean TF-IDF pipeline the
          same two documents win by a wide margin.
        </>
      }
    >
      <div className={s.stack}>
        <div className={s.docRow}>
          <span className={`${s.docTag} ${s.docTagQ}`}>q</span>
          <div className={s.chips} aria-label="query tokens">
            {tokenChips(QUERY, o).map((c, k) => {
              const known = r.ix.pos.has(c.w)
              return (
                <span key={k} className={`${s.chip} ${s.chipQ} ${c.dropped ? s.chipOff : known ? s.chipHit : s.chipOut}`} title={c.dropped ? 'stop word' : known ? 'in the vocabulary' : 'not in any document'}>
                  {c.w}
                  {!c.dropped && !known && <span className={s.chipIdx}>unknown</span>}
                </span>
              )
            })}
          </div>
        </div>

        <div className={s.scoreList} role="list" aria-label="cosine similarity of each document with the query">
          {DOCUMENTS.map((d, i) => {
            const isTop = top2.includes(i)
            const v = r.scores[i]
            return (
              <div key={i} className={s.scoreRow} role="listitem">
                <span className={`${s.scoreTag} ${isTop ? s.scoreTagTop : ''}`}>d{i + 1}</span>
                <span className={s.track}>
                  <span
                    className={s.fill}
                    style={{ display: 'block', width: `${(v / max) * 100}%`, background: isTop ? 'var(--viz-2)' : 'var(--viz-1)', opacity: isTop ? 1 : 0.55 }}
                  />
                </span>
                <span className={s.scoreVal}>{v.toFixed(3)}</span>
                <span className={s.sentence}>
                  {renderSentence(d)}
                  {isTop && <span className={s.badge}>top {top2.indexOf(i) + 1}</span>}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <Controls>
        <Toggle label="strip punctuation" checked={strip} onChange={setStrip} />
        <Toggle label="drop stop words" checked={stop} onChange={setStop} />
        <Segmented
          label="weights"
          value={weight}
          onChange={setWeight}
          options={[
            { value: 'none', label: 'counts' },
            { value: 'smooth', label: 'TF-IDF' },
          ]}
        />
      </Controls>
      <Controls>
        <Button
          primary={isOfficial}
          onClick={() => {
            setStrip(false)
            setStop(false)
            setWeight('none')
          }}
        >
          Official 2025 settings
        </Button>
        <Button
          primary={isClean}
          onClick={() => {
            setStrip(true)
            setStop(true)
            setWeight('smooth')
          }}
        >
          Clean TF-IDF
        </Button>
        <Readout
          items={[
            ['top 2', top2.map((i) => `d${i + 1}`).join(', ')],
            ['lead of 2nd over 3rd', margin.toFixed(3)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
