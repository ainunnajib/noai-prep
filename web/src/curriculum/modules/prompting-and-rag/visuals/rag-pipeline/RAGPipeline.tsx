import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, PlayerControls, useNarrow } from '../../../../../kit'
import { useStepper } from './useStepper'
import { DIMS, PRESETS, INSTRUCTIONS, search, generate, wordCount, matchedKeys } from './ragToy'
import s from './rag.module.css'

/*
  A question's trip through a (toy) RAG pipeline: embed → search → top-k → augment → generate.
  The embedding and the "LLM" are small stand-ins defined in ragToy.ts; every number shown is
  computed live from them.
*/

const STAGES = ['Embed', 'Search', 'Top-k', 'Augment', 'Generate'] as const

/** heat colour for a value in [0, 1]; capped at 45% so the ink text stays readable in both themes */
const heat = (v: number, max = 45) => `color-mix(in srgb, var(--viz-1) ${Math.round(Math.max(0, Math.min(1, v)) * max)}%, var(--surface))`

export default function RAGPipeline() {
  const [presetId, setPresetId] = useState<string | null>('camp')
  const [custom, setCustom] = useState('')
  const [rag, setRag] = useState(true)
  const [k, setK] = useState(2)
  const [focus, setFocus] = useState<number | null>(null)
  const player = useStepper({ steps: STAGES.length, interval: 1400 })
  const step = player.step
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const preset = PRESETS.find((p) => p.id === presetId)
  const q = preset ? preset.q : custom.trim()
  const empty = q === ''
  const { qvec, ranked } = useMemo(() => search(q), [q])
  const topk = ranked.slice(0, k)
  const answer = useMemo(() => generate(q, preset, topk), [q, preset, topk])
  const zeroVec = qvec.every((x) => x === 0)
  const keys = useMemo(() => matchedKeys(q), [q])

  const promptText = rag
    ? [...INSTRUCTIONS, '', 'Context:', ...topk.map((t) => `[${t.chunk.id}] ${t.chunk.text}`), '', `Question: ${q}`, 'Answer:'].join(' ')
    : `Question: ${q} Answer:`
  const promptWords = wordCount(promptText)

  const choosePreset = (id: string) => {
    setPresetId(id)
    setFocus(null)
    player.pause()
    player.setStep(STAGES.length - 1)
  }
  const onType = (t: string) => {
    setCustom(t)
    setPresetId(null)
    setFocus(null)
    player.pause()
    player.setStep(STAGES.length - 1)
  }

  // panel state: before / now / later / skipped (retrieval off)
  const cls = (i: number) => {
    if (!rag && i < 3) return `${s.panel} ${s.panelSkip}`
    if (i === step) return `${s.panel} ${s.panelNow}`
    if (i > step) return `${s.panel} ${s.panelLater}`
    return s.panel
  }
  const showScores = rag && step >= 1
  const showTop = rag && step >= 2

  const neededText = answer.needed
    ? answer.needed[1] === 0
      ? 'none (not in the handbook)'
      : `${answer.needed[0]} of ${answer.needed[1]}`
    : 'n/a (your own question)'

  const verdictBadges = rag ? (
    <>
      {answer.needed && answer.needed[1] > 0 && answer.needed[0] === answer.needed[1] && <span className={`${s.badge} ${s.good}`}>grounded: every fact cites a retrieved chunk</span>}
      {answer.needed && answer.needed[0] < answer.needed[1] && <span className={`${s.badge} ${s.bad}`}>gap: a needed chunk was not retrieved (retrieval failure)</span>}
      {answer.needed && answer.needed[1] === 0 && <span className={`${s.badge} ${s.good}`}>honest: says it doesn’t know instead of guessing</span>}
      {answer.note && <span className={`${s.badge} ${s.meh}`}>{answer.note}</span>}
    </>
  ) : preset ? (
    <span className={`${s.badge} ${preset.noRag.bad ? s.bad : s.good}`}>{preset.noRag.verdict}</span>
  ) : (
    <span className={`${s.badge} ${s.bad}`}>no sources to check</span>
  )

  return (
    <Figure
      wide
      title="A question's trip through a RAG pipeline"
      caption={
        <>
          With retrieval off, the same model answers from memory and makes things up. With the wifi question, search still returns k chunks, but the instruction to say &ldquo;I don&rsquo;t
          know&rdquo; keeps the answer honest. Click a citation to find its chunk. A toy: the embedding has 11 hand-made dimensions (real ones learn hundreds), and the &ldquo;LLM&rdquo; is a
          stand-in.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <p className={s.tryLine}>
          <b>Try:</b> drag <b>top-k</b> to 1 and watch the answer lose the camp's cost (a <i>retrieval</i> failure). Then switch retrieval off. <b>Replay</b> steps through the stages.
        </p>
        <div>
          <div className={s.head}>
            <span>Ask the AI Club handbook bot</span>
            <small>pick a question or type your own</small>
          </div>
          <div className={s.chips} role="group" aria-label="Example questions">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" className={`${s.chip} ${p.id === presetId ? s.chipOn : ''}`} aria-pressed={p.id === presetId} onClick={() => choosePreset(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <label className={s.ask}>
          <span>Your question</span>
          <input type="text" value={preset ? preset.q : custom} onChange={(e) => onType(e.target.value)} placeholder="e.g. Where does the club meet?" maxLength={90} spellCheck={false} />
        </label>
        <Controls>
          <Toggle label="Retrieval (RAG) on" checked={rag} onChange={(v) => { setRag(v); player.setStep(STAGES.length - 1) }} />
          <Slider label="top-k (chunks retrieved)" value={k} min={1} max={4} step={1} onChange={(v) => { setK(v); setFocus(null) }} />
        </Controls>
        {!empty && (
          <Readout
            items={[
              ['retrieved', rag ? topk.map((t) => `[${t.chunk.id}]`).join(' ') : 'nothing'],
              ['answer chunks found', rag ? neededText : 'retrieval off'],
              ['prompt length', `${promptWords} words`],
            ]}
          />
        )}
        {!empty && narrow && <div className={s.badges} aria-hidden="true">{verdictBadges}</div>}
        {empty ? (
          <p className={s.emptyNote}>Type a question or pick one above to start.</p>
        ) : (
          <>

        <div className={s.rail} role="list" aria-label="Pipeline stages">
          {STAGES.map((name, i) => {
            const skipped = !rag && i < 3
            const c = skipped ? s.stageSkip : i === step ? s.stageNow : i < step ? s.stageDone : ''
            return (
              <span key={name} className={s.railItem} role="listitem">
                {i > 0 && (
                  <span className={s.railArrow} aria-hidden="true">
                    →
                  </span>
                )}
                <button type="button" className={`${s.stageBtn} ${c}`} onClick={() => { player.pause(); player.setStep(i) }} aria-current={i === step ? 'step' : undefined}>
                  {i + 1} {name}
                </button>
              </span>
            )
          })}
        </div>

        {/* 1. Embed the question */}
        <section className={cls(0)} aria-label="Stage 1: embed the question">
          <div className={s.panelTitle}>
            <span className={s.num}>1</span>
            Embed the question
            <small>same embedding model as the chunks: {DIMS.length} numbers</small>
          </div>
          {rag ? (
            <>
              <p className={s.qtext}>“{q}”</p>
              <div className={s.vec} role="img" aria-label={`Question vector: ${DIMS.map((d, i) => `${d} ${qvec[i].toFixed(2)}`).join(', ')}`}>
                {DIMS.map((d, i) => (
                  <span key={d} className={s.vcell} style={{ background: heat(qvec[i]) }}>
                    <span className={s.vlab}>{d}</span>
                    <span className={s.vval}>{qvec[i].toFixed(2)}</span>
                  </span>
                ))}
              </div>
              <p className={s.note}>
                {zeroVec
                  ? 'No word in this question is in the toy embedding’s vocabulary, so its vector is all zeros and every score below is 0.'
                  : `Words it recognised: ${keys.join(', ')}.`}
              </p>
            </>
          ) : (
            <p className={s.skipNote}>Skipped: retrieval is off, so the question goes straight to the LLM.</p>
          )}
        </section>

        {/* 2 + 3. Search the vector store and keep the top k */}
        <section className={cls(step === 2 ? 2 : 1)} aria-label="Stages 2 and 3: search the vector store and keep the top k">
          <div className={s.panelTitle}>
            <span className={`${s.num} ${s.numWide}`}>{showTop ? '2–3' : '2'}</span>
            {showTop ? `Search the store, keep the top ${k}` : 'Search the vector store'}
            <small>8 handbook chunks, embedded once in advance · cosine similarity with the question · mini strip = the chunk's {DIMS.length}-number vector (compare it with the question's above)</small>
          </div>
          {rag ? (
            <div className={s.rows}>
              {ranked.map((r, i) => (
                <div key={r.chunk.id}>
                  {showTop && i === k && <div className={s.cut}>↑ top {k} go into the prompt · the rest are left out ↓</div>}
                  <div className={`${s.row} ${showTop && i < k ? s.rowTop : ''} ${focus === r.chunk.id ? s.rowFocus : ''}`}>
                    <span className={s.rowId}>[{r.chunk.id}]</span>
                    <span className={s.rowText}>{r.chunk.text}</span>
                    <span className={s.rowScore}>{showScores ? r.score.toFixed(2) : '–'}</span>
                    <span className={s.rowMeta}>
                      <span
                        className={s.mini}
                        role="img"
                        aria-label={`chunk ${r.chunk.id} vector: ${DIMS.map((d, j) => `${d} ${r.vec[j].toFixed(2)}`).join(', ')}`}
                        title={`chunk ${r.chunk.id} vector: ${DIMS.map((d, j) => `${d} ${r.vec[j].toFixed(2)}`).join(', ')}`}
                      >
                        {r.vec.map((x, j) => (
                          <span key={j} className={s.miniCell} style={{ background: heat(x, 90) }} />
                        ))}
                      </span>
                      <span className={s.track}>
                        <span className={s.fill} style={{ width: `${showScores ? Math.max(0, r.score) * 100 : 0}%`, background: showTop && i < k ? 'var(--viz-pos)' : 'var(--viz-1)' }} />
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={s.skipNote}>Skipped: nothing is looked up.</p>
          )}
        </section>

        {/* 4. Augment the prompt */}
        <section className={cls(3)} aria-label="Stage 4: the augmented prompt">
          <div className={s.panelTitle}>
            <span className={s.num}>4</span>
            {rag ? 'Augment: build the prompt' : 'The prompt'}
            <small>{promptWords} words</small>
          </div>
          <pre className={s.prompt}>
            {rag ? (
              <>
                {INSTRUCTIONS.map((l) => (
                  <span key={l} className={s.pInstr}>
                    {l + '\n'}
                  </span>
                ))}
                {'\nContext:\n'}
                {topk.map((t) => (
                  <span key={t.chunk.id} className={s.pCtx}>
                    [{t.chunk.id}] {t.chunk.text}
                  </span>
                ))}
                {'\n'}
                <span className={s.pQ}>Question: {q}</span>
                {'\nAnswer:'}
              </>
            ) : (
              <>
                <span className={s.pQ}>Question: {q}</span>
                {'\nAnswer:'}
              </>
            )}
          </pre>
        </section>

        {/* 5. Generate */}
        <section className={cls(4)} aria-label="Stage 5: the generated answer" aria-live="polite">
          <div className={s.panelTitle}>
            <span className={s.num}>5</span>
            Generate the answer
            <small>{rag ? 'the LLM reads only the prompt above' : 'from memory alone'}</small>
          </div>
          {rag ? (
            <>
              <p className={s.answer}>
                {answer.parts.map((p, i) => (
                  <span key={i}>
                    {i > 0 && ' '}
                    <span className={p.missing ? s.gap : undefined}>{p.text}</span>
                    {p.cite !== undefined && (
                      <button type="button" className={s.cite} onClick={() => setFocus(p.cite!)} aria-label={`Show chunk ${p.cite}`}>
                        [{p.cite}]
                      </button>
                    )}
                  </span>
                ))}
              </p>
              <div className={s.badges}>{verdictBadges}</div>
            </>
          ) : (
            <>
              <p className={s.answer}>{preset ? preset.noRag.text : 'The model answers from what it memorised in training. It has never seen this handbook, so anything specific it says would be a guess.'}</p>
              <div className={s.badges}>{verdictBadges}</div>
            </>
          )}
        </section>

        <PlayerControls player={player} label={(st) => `Stage ${st + 1} of ${STAGES.length}: ${STAGES[Math.min(st, STAGES.length - 1)]}`} />
          </>
        )}
      </div>
    </Figure>
  )
}
