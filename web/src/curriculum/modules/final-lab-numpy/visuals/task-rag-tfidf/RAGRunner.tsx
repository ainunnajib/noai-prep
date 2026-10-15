import { useState } from 'react'
import { Figure, Controls, Slider, Toggle, Segmented, Button } from '../../../../../kit'
import { DOCUMENTS, QUERY, EXPECTED_RESPONSE, EXPECTED_TOP, retrieve, topK, generateTemplate, generateOfficial } from './rag'
import s from './rag.module.css'

/*
  A pretend notebook cell. It runs the whole pipeline (clean TF-IDF, cosine, top-k, generate) and
  prints in the format of the 2025 protected print cell. Edit the query, k and the generator, press
  Run, and compare with the notebook's expected output. Edits leave the old output on screen, greyed
  out, exactly like a stale Jupyter output.
*/

type Gen = 'template' | 'official'
interface Params {
  query: string
  k: number
  skipZero: boolean
  gen: Gen
  debug: boolean
}

const PRESETS = [QUERY, 'What is deep learning?', 'What does data science involve?', 'Tell me about the human brain', 'What is quantum computing?']

function run(p: Params) {
  const r = retrieve(p.query)
  const idx = topK(r.scores, p.k, p.skipZero)
  const top_documents = idx.map((i) => DOCUMENTS[i])
  const response = p.gen === 'template' ? generateTemplate(top_documents) : generateOfficial(top_documents)
  const lines: string[] = []
  if (p.debug) {
    lines.push('# debug print: tokens known to the vocabulary and every score')
    lines.push(`query tokens: [${r.q.known.map((w) => `'${w}'`).join(', ')}]${r.q.unknown.length ? `  (ignored: ${r.q.unknown.join(', ')})` : ''}`)
    lines.push(`scores: [${r.scores.map((x) => x.toFixed(4)).join(', ')}]`)
    lines.push('')
  }
  lines.push(`Query: ${p.query}`)
  lines.push('')
  lines.push('Retrieved Documents:')
  for (const d of top_documents) lines.push(`- ${d}`)
  lines.push('')
  lines.push('Generated Response:')
  lines.push(response)
  return { text: lines.join('\n'), idx, response }
}

const same = (a: Params, b: Params) => a.query === b.query && a.k === b.k && a.skipZero === b.skipZero && a.gen === b.gen && a.debug === b.debug

export default function RAGRunner() {
  const [p, setP] = useState<Params>({ query: QUERY, k: 2, skipZero: true, gen: 'template', debug: false })
  const [ran, setRan] = useState<Params>(p)
  const [count, setCount] = useState(1)
  const out = run(ran)
  const stale = !same(p, ran)
  const set = (patch: Partial<Params>) => setP((x) => ({ ...x, ...patch }))
  const isExamQuery = ran.query.trim() === QUERY
  const docsOk = out.idx.length === EXPECTED_TOP.length && out.idx.every((i, k) => i === EXPECTED_TOP[k])
  const respOk = out.response === EXPECTED_RESPONSE

  const doRun = () => {
    setRan(p)
    setCount((c) => c + 1)
  }

  return (
    <Figure
      wide
      title="Run the whole pipeline like a notebook cell"
      caption={
        <>
          Change the query, <b>k</b> or the generator, then press <b>Run cell</b>: until you do, the old output stays greyed out, just like a stale
          Jupyter output. Retrieval is the clean TF-IDF pipeline in every run. For the exam query both generators (an extractive <b>template</b> and the <b>official</b> keyword rule) get documents 2 and 4, but
          only the official rule prints the notebook&apos;s sample sentence word for word. Now try <i>What does data science involve?</i>{' '}
          with each generator: the template quotes the right document, while the keyword rule answers a question about machine learning that nobody
          asked.
        </>
      }
    >
      <div className={s.stack}>
        <div className={s.field}>
          <label className={s.fieldLabel} htmlFor="rag-runner-query">
            query
          </label>
          <input
            id="rag-runner-query"
            className={s.input}
            value={p.query}
            spellCheck={false}
            onChange={(e) => set({ query: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') doRun()
            }}
          />
          <div className={s.presets} role="group" aria-label="example queries">
            {PRESETS.map((q) => (
              <button key={q} type="button" className={`${s.preset} ${p.query === q ? s.presetOn : ''}`} onClick={() => set({ query: q })}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <Controls>
          <Slider label="k (documents to retrieve)" value={p.k} min={1} max={5} step={1} onChange={(k) => set({ k })} />
          <Toggle label="skip documents scoring 0" checked={p.skipZero} onChange={(v) => set({ skipZero: v })} />
          <Segmented
            label="generator"
            value={p.gen}
            onChange={(g) => set({ gen: g })}
            options={[
              { value: 'template', label: 'template' },
              { value: 'official', label: 'official rule' },
            ]}
          />
          <Toggle label="debug print" checked={p.debug} onChange={(v) => set({ debug: v })} />
        </Controls>

        <div className={s.cell}>
          <div className={s.cellBar}>
            <span>Out [{count}]:</span>
            {stale ? <span className={s.stale}>stale: you changed the code, press Run cell</span> : <span>up to date</span>}
            <Button primary onClick={doRun}>
              Run cell
            </Button>
          </div>
          <pre className={`${s.out} ${stale ? s.outStale : ''}`} aria-live="polite">
            {out.text}
          </pre>
        </div>

        <ul className={s.checks} aria-label="comparison with the expected output">
          {isExamQuery ? (
            <>
              <li className={s.check}>
                <span className={docsOk ? s.ok : s.bad}>{docsOk ? '✓' : '✗'}</span>
                <span>
                  <code>top_documents</code> {docsOk ? 'is documents 2 and 4, as Ms Sally said.' : `is ${out.idx.length ? out.idx.map((i) => `document ${i + 1}`).join(', ') : 'empty'}, not documents 2 and 4.`}
                </span>
              </li>
              <li className={s.check}>
                <span className={respOk ? s.ok : s.meh}>{respOk ? '✓' : '≈'}</span>
                <span>
                  <code>response</code>{' '}
                  {respOk
                    ? 'matches the sample answer word for word (because the rule returns that exact sentence).'
                    : 'is built only from the retrieved sentences, so its wording differs from the sample answer, which adds facts found in no document.'}
                </span>
              </li>
            </>
          ) : (
            <li className={s.check}>
              <span className={s.meh}>?</span>
              <span>The notebook gives an expected output only for &quot;{QUERY}&quot;. Judge this answer yourself: is every sentence supported by a retrieved document?</span>
            </li>
          )}
        </ul>
      </div>
    </Figure>
  )
}
