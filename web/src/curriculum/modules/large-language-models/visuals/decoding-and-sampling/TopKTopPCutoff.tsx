import { Fragment, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Readout } from '../../../../../kit'
import s from './decode.module.css'

/*
  Top-k keeps the k most likely tokens; top-p (nucleus) keeps the smallest set of most likely tokens
  whose probabilities add up to at least p. Either way the survivors are renormalised (divided by
  their total) so they sum to 1 again. Two distributions: a confident one and an uncertain one.
*/

type Dist = 'confident' | 'uncertain'
type Mode = 'k' | 'p'

const DISTS: Record<Dist, { prompt: string; toks: [string, number][] }> = {
  confident: {
    prompt: 'The capital of France is',
    toks: [
      ['Paris', 0.82],
      ['a', 0.08],
      ['the', 0.03],
      ['now', 0.02],
      ['known', 0.015],
      ['home', 0.012],
      ['one', 0.01],
      ['Lyon', 0.008],
      ['Berlin', 0.003],
      ['pizza', 0.002],
    ],
  },
  uncertain: {
    prompt: 'My favourite colour is',
    toks: [
      ['blue', 0.2],
      ['green', 0.16],
      ['red', 0.14],
      ['purple', 0.12],
      ['black', 0.1],
      ['pink', 0.08],
      ['yellow', 0.07],
      ['white', 0.06],
      ['orange', 0.04],
      ['grey', 0.03],
    ],
  },
}

/** How many of the (sorted) probabilities survive the filter. */
function keptCount(probs: number[], mode: Mode, k: number, p: number) {
  if (mode === 'k') return Math.min(k, probs.length)
  let c = 0
  for (let i = 0; i < probs.length; i++) {
    c += probs[i]
    if (c >= p - 1e-9) return i + 1
  }
  return probs.length
}

export default function TopKTopPCutoff() {
  const [dist, setDist] = useState<Dist>('uncertain')
  const [mode, setMode] = useState<Mode>('p')
  const [k, setK] = useState(3)
  const [p, setP] = useState(0.9)
  const d = DISTS[dist]
  const probs = d.toks.map((t) => t[1])
  const n = keptCount(probs, mode, k, p)
  const mass = probs.slice(0, n).reduce((a, b) => a + b, 0)
  const other: Dist = dist === 'confident' ? 'uncertain' : 'confident'
  const nOther = keptCount(
    DISTS[other].toks.map((t) => t[1]),
    mode,
    k,
    p,
  )
  let cum = 0
  const setting = mode === 'k' ? `top-k, k = ${k}` : `top-p, p = ${p.toFixed(2)}`

  return (
    <Figure
      wide
      title="Top-k and top-p: cut off the unlikely tail"
      caption={
        <>
          Choose a filter and slide it, then switch between the confident and the uncertain prompt. Top-k always keeps exactly k tokens. Top-p keeps
          tokens, most likely first, until their probabilities add up to at least p: compare how many survive p = 0.9 on each prompt. The survivors
          are <b>renormalised</b> (divided by the probability they cover) so that they add up to 1 again; then one is sampled.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Segmented
            label="prompt"
            value={dist}
            onChange={setDist}
            options={[
              { value: 'confident', label: 'confident' },
              { value: 'uncertain', label: 'uncertain' },
            ]}
          />
          <Segmented
            label="filter"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'k', label: 'top-k' },
              { value: 'p', label: 'top-p' },
            ]}
          />
          {mode === 'k' ? (
            <Slider label="k (tokens kept)" value={k} min={1} max={10} step={1} onChange={setK} />
          ) : (
            <Slider label="p (probability to cover)" value={p} min={0.05} max={1} step={0.05} onChange={setP} format={(v) => v.toFixed(2)} />
          )}
        </Controls>

        <div className={s.prompt}>
          <b>Prompt:</b> {d.prompt} <span className={s.blank}>?</span>
        </div>

        <div className={s.twoCols}>
          <div>
            <div className={s.colTitle}>1 · Model's probabilities, most likely first</div>
            <div className={s.rows4}>
              <span className={s.cum} style={{ textAlign: 'left' }}>
                token
              </span>
              <span />
              <span className={s.cum}>prob.</span>
              <span className={s.cum}>{mode === 'p' ? 'total' : 'rank'}</span>
              {d.toks.map(([tok, pr], i) => {
                cum += pr
                const kept = i < n
                return (
                  <Fragment key={tok}>
                    {i === n && <div className={s.cut}>cut-off</div>}
                    <span className={`${s.rowLabel} ${kept ? s.rowLabelStrong : s.dropped}`}>
                      {tok}
                      <span className="visually-hidden">{kept ? ' (kept)' : ' (removed)'}</span>
                    </span>
                    <span className={`${s.track} ${kept ? '' : s.dropped}`}>
                      <span className={s.fill} style={{ width: `${(pr / probs[0]) * 100}%`, background: kept ? 'var(--viz-1)' : 'var(--viz-muted)' }} />
                    </span>
                    <span className={`${s.val} ${kept ? '' : s.valMuted}`}>{pr.toFixed(3)}</span>
                    <span className={s.cum} style={kept ? { color: 'var(--ink)', fontWeight: 700 } : undefined}>
                      {mode === 'p' ? cum.toFixed(3) : `#${i + 1}`}
                    </span>
                  </Fragment>
                )
              })}
            </div>
          </div>

          <div>
            <div className={s.colTitle}>2 · After filtering and renormalising (÷ {mass.toFixed(3)})</div>
            <div className={s.rows} role="list" aria-label="Probabilities of the kept tokens after renormalising">
              {d.toks.slice(0, n).map(([tok, pr]) => (
                <div key={tok} role="listitem" style={{ display: 'contents' }}>
                  <span className={`${s.rowLabel} ${s.rowLabelStrong}`}>{tok}</span>
                  <span className={s.track}>
                    <span className={s.fill} style={{ width: `${(pr / mass) * 100}%`, background: 'var(--viz-3)' }} />
                  </span>
                  <span className={s.val}>{(pr / mass).toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Readout
          items={[
            ['tokens kept', `${n} of ${probs.length}`],
            ['probability covered', mass.toFixed(3)],
          ]}
        />
        <p className={s.note}>
          The same setting ({setting}) on the <b>{other}</b> prompt keeps <b>{nOther}</b> token{nOther === 1 ? '' : 's'}.
          {mode === 'p' ? ' Top-p adapts to how sure the model is.' : ' Top-k keeps the same number whatever the model thinks.'}
        </p>
      </div>
    </Figure>
  )
}
