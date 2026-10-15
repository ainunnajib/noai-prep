import { useState } from 'react'
import { Figure, Controls, Slider, Readout, Bars } from '../../../../../kit'
import { Chips, Py } from '../task-attention/ui'
import s from './pe.module.css'

/*
  Q3.8 (bonus): build the causal mask. The learner picks a construction (tril, triu, triu with
  diagonal=1, its inverse, tril with diagonal=-1) and the way the attention code reads the mask
  (masked_fill(mask == 0, ...) as in the notebook, or mask == 1). Each cell is coloured by whether
  that query may really look at that key, compared with the causal rule j <= i. Clicking a row shows
  that query's attention weights when all scores are equal.
*/

const WORDS = ['The', 'cat', 'sat', 'on', 'the', 'mat', 'today', '.']

type Build = 'tril' | 'triu' | 'triu1' | 'inv' | 'trilm1'
type Conv = 'zero' | 'one'

const BUILD: Record<Build, { code: string; f: (i: number, j: number) => number }> = {
  tril: { code: 'torch.tril(torch.ones(T, T))', f: (i, j) => (j <= i ? 1 : 0) },
  triu: { code: 'torch.triu(torch.ones(T, T))', f: (i, j) => (j >= i ? 1 : 0) },
  triu1: { code: 'torch.triu(torch.ones(T, T), diagonal=1)', f: (i, j) => (j > i ? 1 : 0) },
  inv: { code: '1 - torch.triu(torch.ones(T, T), diagonal=1)', f: (i, j) => (j > i ? 0 : 1) },
  trilm1: { code: 'torch.tril(torch.ones(T, T), diagonal=-1)', f: (i, j) => (j < i ? 1 : 0) },
}

export default function CausalMaskBuilder() {
  const [T, setT] = useState(3)
  const [build, setBuild] = useState<Build>('tril')
  const [conv, setConv] = useState<Conv>('zero')
  const [row, setRow] = useState(1)
  const r = Math.min(row, T - 1)

  const val = (i: number, j: number) => BUILD[build].f(i, j)
  const allowed = (i: number, j: number) => (conv === 'zero' ? val(i, j) !== 0 : val(i, j) !== 1)
  let peeks = 0
  let blind = 0
  let fullRows = 0
  let leaked = 0
  for (let i = 0; i < T; i++) {
    let any = false
    for (let j = 0; j < T; j++) {
      const a = allowed(i, j)
      if (a) any = true
      if (a && j > i) peeks++
      if (!a && j <= i) blind++
    }
    if (!any) {
      fullRows++
      leaked += T - 1 - i // a fully hidden row becomes uniform, so its future gets weight too
    }
  }
  const correct = peeks === 0 && blind === 0

  // attention weights for row r when every score is equal, filling hidden scores with -1e9
  const vis = Array.from({ length: T }, (_, j) => allowed(r, j))
  const nVis = vis.filter(Boolean).length
  const w = vis.map((a) => (nVis === 0 ? 1 / T : a ? 1 / nVis : 0))

  const verdict = correct
    ? 'A correct causal mask: every token sees itself and everything before it, and nothing after it.'
    : [
        peeks ? `${peeks} cell${peeks > 1 ? 's let' : ' lets'} a token peek at the future (red).` : '',
        blind ? `${blind} cell${blind > 1 ? 's hide' : ' hides'} a token's own past or itself (hatched).` : '',
        fullRows ? `${fullRows} row${fullRows > 1 ? 's are' : ' is'} fully hidden, so -1e9 makes it uniform and that token sees the future after all.` : '',
      ]
        .filter(Boolean)
        .join(' ')

  const cell = T > 6 ? 30 : 38
  return (
    <Figure
      title="Build the causal mask"
      caption={
        <>
          Pick a way to build the mask and how the attention code reads it. Row <i>i</i> is the query (the token doing the looking), column <i>j</i> the key. Green cells are allowed,
          red cells peek at the future, hatched cells hide something that should be visible. Click a row label to see that token's weights when all scores are equal.
        </>
      }
    >
      <div className={s.stack}>
        <Chips
          label="Build the mask with"
          options={[
            { value: 'tril', label: 'tril' },
            { value: 'triu', label: 'triu', bad: true },
            { value: 'triu1', label: 'triu(diagonal=1)' },
            { value: 'inv', label: '1 − triu(diagonal=1)' },
            { value: 'trilm1', label: 'tril(diagonal=−1)', bad: true },
          ]}
          value={build}
          onChange={setBuild}
        />
        <Chips
          label="The attention code hides positions where"
          options={[
            { value: 'zero', label: 'mask == 0 (the notebook)' },
            { value: 'one', label: 'mask == 1' },
          ]}
          value={conv}
          onChange={setConv}
        />
        <div className={s.codeLine}>
          <Py code={`mask = ${BUILD[build].code}\nscores = scores.masked_fill(mask == ${conv === 'zero' ? 0 : 1}, -1e9)`} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem', justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
          <div
            className={s.maskGrid}
            style={{ gridTemplateColumns: `max-content repeat(${T}, minmax(26px, ${cell}px))` }}
            role="table"
            aria-label={`Causal mask for ${T} tokens`}
          >
            <span className={s.mLab}>query ↓ key →</span>
            {WORDS.slice(0, T).map((w, j) => (
              <span key={`c${j}`} className={s.mLab}>
                {w}
              </span>
            ))}
            {WORDS.slice(0, T).map((wi, i) => (
              <div key={i} role="row" style={{ display: 'contents' }}>
                <button type="button" className={`${s.mLabRow} ${i === r ? s.mLabRowOn : ''}`} onClick={() => setRow(i)} aria-label={`Show weights for ${wi}`}>
                  {i}: {wi}
                </button>
                {WORDS.slice(0, T).map((_, j) => {
                  const a = allowed(i, j)
                  const cls = a ? (j > i ? s.mPeek : s.mAllowed) : j <= i ? s.mBlind : ''
                  return (
                    <button
                      key={j}
                      type="button"
                      role="cell"
                      className={`${s.mcell} ${cls} ${i === r ? s.mRowOn : ''}`}
                      onClick={() => setRow(i)}
                      aria-label={`row ${i} column ${j}: mask ${val(i, j)}, ${a ? 'allowed' : 'hidden'}`}
                    >
                      {val(i, j)}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <div style={{ minWidth: 200, flex: '1 1 220px', maxWidth: 340 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.35rem' }}>
              weights for "{WORDS[r]}" (equal scores)
            </div>
            <Bars
              data={w.map((x, j) => ({ label: WORDS[j], value: x, color: j > r && x > 0 ? 'var(--bad)' : 'var(--viz-3)', strong: j === r }))}
              max={1}
              ariaLabel={`Attention weights for ${WORDS[r]}`}
            />
          </div>
        </div>
        <p className={`${s.verdict} ${correct ? s.ok : s.bad}`}>{verdict}</p>
        <Controls>
          <Slider label="T (tokens)" value={T} min={2} max={8} step={1} onChange={setT} />
          <Readout
            items={[
              ['create_causal_mask returns', `(1, 1, ${T}, ${T})`],
              ['future cells that get weight', String(peeks + leaked)],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
