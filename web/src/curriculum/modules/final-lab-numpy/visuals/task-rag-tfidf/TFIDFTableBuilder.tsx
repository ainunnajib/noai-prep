import { Fragment, useState } from 'react'
import { Figure, Controls, Segmented, Readout, usePlayer, PlayerControls, useNarrow, M } from '../../../../../kit'
import { DOCUMENTS, QUERY, CLEAN, buildIndex, tokenChips, vectorise, fmt, type IdfVariant } from './rag'
import s from './rag.module.css'

/*
  Step through the exam's five documents: tokens -> vocabulary -> counts (TF) -> df and IDF -> TF-IDF
  -> the query placed in the same space. Change the IDF formula at any step and click a word to see
  its numbers worked out.
*/

const STEPS = [
  { title: '1 · Tokenise', note: 'Lower-case, keep runs of letters (so "industries." becomes "industries") and drop stop words (struck out).' },
  { title: '2 · Build the vocabulary', note: 'Every distinct document token gets a fixed column number, sorted A to Z. The query does not add words.' },
  { title: '3 · Count: term frequency', note: 'One column per document: how many times each vocabulary word occurs in it. Most cells are 0.' },
  { title: '4 · Document frequency and IDF', note: 'df = how many documents contain the word. IDF turns it into a weight: rare words get more.' },
  { title: '5 · TF × IDF', note: 'Multiply each count by its word’s IDF. Distinctive words now carry the most weight.' },
  { title: '6 · Put the query in the same space', note: 'Vectorise the query with the same vocabulary and the same IDF. “work” is in no document, so it has no column and is ignored.' },
]

const IDF_TEX: Record<IdfVariant, string> = {
  smooth: '\\mathrm{idf} = \\ln\\dfrac{1+N}{1+\\mathrm{df}} + 1',
  plain: '\\mathrm{idf} = \\ln\\dfrac{N}{\\mathrm{df}}',
  none: '\\mathrm{idf} = 1 \\text{ (TF only)}',
}

export default function TFIDFTableBuilder() {
  const player = usePlayer({ steps: STEPS.length, interval: 2200 })
  const step = player.step
  const [variant, setVariant] = useState<IdfVariant>('smooth')
  const [sel, setSel] = useState<string>('machine')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(470)

  const ix = buildIndex(DOCUMENTS, CLEAN, variant)
  const q = vectorise(QUERY, ix, CLEAN)
  const N = DOCUMENTS.length
  const showIdf = step >= 3
  const weighted = step >= 4
  const showQ = step >= 5
  const cellVal = (i: number, j: number) => (weighted ? ix.W[i][j] : ix.tf[i][j])
  const maxW = Math.max(1e-9, ...ix.W.flat(), ...q.vec)
  const heat = (v: number) => (weighted && v > 0 ? `color-mix(in srgb, var(--viz-1) ${Math.round(14 + (v / maxW) * 56)}%, var(--surface))` : undefined)

  const cw = narrow ? 28 : 40
  const cols = [`minmax(${narrow ? 64 : 112}px, max-content)`, ...DOCUMENTS.map(() => `${cw}px`)]
  if (showQ) cols.push(`${cw}px`)
  if (showIdf) cols.push(narrow ? '16px' : '28px', `${narrow ? 30 : 40}px`)

  const j = ix.pos.get(sel)
  const explain = (() => {
    if (j === undefined) return null
    const docsWith = DOCUMENTS.map((_, i) => i).filter((i) => ix.tf[i][j] > 0)
    const df = ix.df[j]
    const idfStr =
      variant === 'smooth'
        ? `ln((1 + ${N}) / (1 + ${df})) + 1 = ${ix.idf[j].toFixed(2)}`
        : variant === 'plain'
          ? `ln(${N} / ${df}) = ${ix.idf[j].toFixed(2)}`
          : '1 (no IDF)'
    return (
      <>
        <b>{sel}</b> (column {j}) appears in {docsWith.map((i) => `d${i + 1}`).join(', ')}
        {step >= 3 && (
          <>
            , so df = {df} and idf = {idfStr}
          </>
        )}
        {step >= 4 && (
          <>
            . In d{docsWith[0] + 1}: TF-IDF = {ix.tf[docsWith[0]][j]} × {ix.idf[j].toFixed(2)} = {ix.W[docsWith[0]][j].toFixed(2)}
          </>
        )}
        {step >= 5 && (
          <>
            . In the query: {q.counts[j]} × {ix.idf[j].toFixed(2)} = {q.vec[j].toFixed(2)}
          </>
        )}
        .
      </>
    )
  })()

  return (
    <Figure
      wide
      title="From five sentences to TF-IDF vectors"
      caption={
        <>
          Press <b>Next</b> to build the table one stage at a time, and click any word to see its numbers worked out. Switch the IDF formula: with{' '}
          <b>TF only</b> every word counts the same; with the <b>plain</b> log a word in every document would get exactly 0; the <b>smoothed</b>{' '}
          formula (scikit-learn&apos;s default, the one we use) never divides by zero. Whatever you choose, the last step must use the{' '}
          <b>same vocabulary and IDF</b> for the query, or its numbers would not line up with the documents&apos;.
        </>
      }
    >
      <div className={s.stack} ref={wrapRef}>
        <PlayerControls player={player} label={(i) => STEPS[i].title} />
        <p className={s.stepNote}>{STEPS[step].note}</p>

        {step === 0 && (
          <div className={s.docRows}>
            {[...DOCUMENTS, QUERY].map((d, i) => (
              <div key={i} className={s.docRow}>
                <span className={`${s.docTag} ${i === N ? s.docTagQ : ''}`}>{i === N ? 'q' : `d${i + 1}`}</span>
                <div className={s.chips} aria-label={`tokens of ${i === N ? 'the query' : `document ${i + 1}`}`}>
                  {tokenChips(d, CLEAN).map((c, k) => (
                    <span key={k} className={`${s.chip} ${i === N ? s.chipQ : ''} ${c.dropped ? s.chipOff : ''}`}>
                      {c.w}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className={s.chips} aria-label="vocabulary with column numbers">
            {ix.vocab.map((w, k) => (
              <span key={w} className={s.chip}>
                <span className={s.chipIdx}>{k}</span>
                {w}
              </span>
            ))}
          </div>
        )}

        {step >= 2 && (
          <div className={s.scroll}>
            <div
              className={s.table}
              style={{ gridTemplateColumns: cols.join(' '), fontSize: narrow ? 10.5 : 12, gap: narrow ? 1 : 2 }}
              role="table"
              aria-label="Vocabulary words by documents: counts, document frequency, IDF and TF-IDF weights"
            >
              <span className={s.th} style={{ justifyContent: 'flex-end' }}>
                word
              </span>
              {DOCUMENTS.map((_, i) => (
                <span key={i} className={s.th}>
                  d{i + 1}
                </span>
              ))}
              {showQ && <span className={`${s.th} ${s.thQ}`}>q</span>}
              {showIdf && (
                <>
                  <span className={s.th}>df</span>
                  <span className={s.th}>idf</span>
                </>
              )}
              {ix.vocab.map((w, jj) => {
                const isQ = showQ && q.counts[jj] > 0
                const selected = w === sel
                return (
                  <Fragment key={w}>
                    <button
                      type="button"
                      className={`${s.term} ${selected ? s.termSel : ''}`}
                      style={{ color: isQ ? 'var(--viz-2)' : undefined }}
                      onClick={() => setSel(w)}
                      aria-pressed={selected}
                    >
                      {!narrow && <span className={s.termIdx}>{jj}</span>}
                      {w}
                    </button>
                    {DOCUMENTS.map((_, i) => {
                      const v = cellVal(i, jj)
                      return (
                        <span key={i} className={`${s.td} ${v ? '' : s.tdZero}`} style={{ background: heat(v) }}>
                          {fmt(v)}
                        </span>
                      )
                    })}
                    {showQ && (
                      <span className={`${s.td} ${s.tdQ} ${q.vec[jj] ? '' : s.tdZero}`} style={{ background: heat(q.vec[jj]) }}>
                        {fmt(q.vec[jj])}
                      </span>
                    )}
                    {showIdf && (
                      <>
                        <span className={`${s.td} ${s.tdStat}`}>{ix.df[jj]}</span>
                        <span className={`${s.td} ${s.tdStat}`} style={{ fontWeight: 700 }}>
                          {variant === 'none' ? '1' : ix.idf[jj].toFixed(2)}
                        </span>
                      </>
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>
        )}

        {step >= 2 && <div className={s.explain}>{explain}</div>}

        {step === 5 && (
          <div className={s.docRow}>
            <span className={`${s.docTag} ${s.docTagQ}`}>q</span>
            <div className={s.chips}>
              {q.known.map((w, k) => (
                <span key={`k${k}`} className={`${s.chip} ${s.chipQ} ${s.chipHit}`}>
                  {w} <span className={s.chipIdx}>col {ix.pos.get(w)}</span>
                </span>
              ))}
              {q.unknown.map((w, k) => (
                <span key={`u${k}`} className={`${s.chip} ${s.chipOut}`}>
                  {w} <span className={s.chipIdx}>not in vocabulary</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <Controls>
        <Segmented
          label="IDF formula"
          value={variant}
          onChange={setVariant}
          options={[
            { value: 'smooth', label: 'smoothed' },
            { value: 'plain', label: 'plain log' },
            { value: 'none', label: 'TF only' },
          ]}
        />
        <span style={{ fontSize: 14 }}>
          <M>{IDF_TEX[variant]}</M>
        </span>
        <Readout
          items={[
            ['N documents', String(N)],
            ['vocabulary', `${ix.vocab.length} words`],
            ['matrix', `${N} × ${ix.vocab.length}`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
