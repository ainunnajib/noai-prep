import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Readout } from '../../../../../kit'
import s from './built.module.css'

/*
  RLHF in miniature.
  1. A person compares pairs of the model's answers (you click the better one).
  2. A reward model learns one score r per answer so that P(A beats B) = σ(r_A − r_B)
     (Bradley–Terry, fitted here by gradient ascent with a little L2 regularisation).
  3. Reinforcement learning shifts the LLM towards high-reward answers while a KL penalty keeps it
     close to the SFT model. The best policy for that objective is π(y) ∝ π_SFT(y) · exp(r(y) / β).
*/

const COLORS = ['var(--viz-3)', 'var(--viz-1)', 'var(--viz-4)', 'var(--viz-6)']
const ANSWERS = [
  { id: 'A', text: 'Sunlight contains every colour. Air scatters blue light the most, so blue reaches your eyes from all over the sky.', note: 'clear and correct' },
  { id: 'B', text: 'Rayleigh scattering: intensity ∝ λ⁻⁴, so short wavelengths dominate diffuse sky radiance.', note: 'correct but too technical' },
  { id: 'C', text: 'Because the sky reflects the blue of the oceans.', note: 'confident but wrong (a myth)' },
  { id: 'D', text: "I'm not sure. Your science teacher could explain it.", note: 'honest but unhelpful' },
]
const PAIRS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
]
const DEFAULT_WINNERS = [0, 0, 0, 1, 1, 3]
const P_SFT = [0.2, 0.25, 0.35, 0.2] // the SFT model often repeats the popular myth
const LAMBDA = 0.2

function fitRewards(wins: [number, number][]): number[] {
  const r = [0, 0, 0, 0]
  for (let it = 0; it < 1500; it++) {
    const g = r.map((v) => -LAMBDA * v)
    for (const [w, l] of wins) {
      const p = 1 / (1 + Math.exp(-(r[w] - r[l])))
      g[w] += 1 - p
      g[l] -= 1 - p
    }
    for (let i = 0; i < 4; i++) r[i] += 0.1 * g[i]
  }
  const mean = r.reduce((a, b) => a + b, 0) / 4
  return r.map((v) => v - mean)
}

const sigma = (z: number) => 1 / (1 + Math.exp(-z))

export default function PreferenceToReward() {
  const [winners, setWinners] = useState<number[]>(DEFAULT_WINNERS)
  const [push, setPush] = useState(1) // 1/β
  const wins = PAIRS.map(([a, b], i) => [winners[i], winners[i] === a ? b : a] as [number, number])
  const key = winners.join('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const r = useMemo(() => fitRewards(wins), [key])
  const unnorm = P_SFT.map((p, i) => p * Math.exp(push * r[i]))
  const Z = unnorm.reduce((a, b) => a + b, 0)
  const pNew = unnorm.map((u) => u / Z)
  const rMax = 3
  const best = r.indexOf(Math.max(...r))

  return (
    <Figure
      wide
      title="RLHF in miniature: comparisons → reward model → better answers"
      caption={
        <>
          <b>Try:</b> you are the labeller: click the better answer in each pair, then slide <b>push towards reward</b>. <b>Notice:</b> prefer the
          myth <b>C</b> every time and the model learns to repeat it. RLHF learns what labellers reward, right or wrong.
        </>
      }
    >
      <div className={s.wrap}>
        <div>
          <p className={s.subhead}>Prompt: “Why is the sky blue?” (asked by a 10-year-old). Four answers sampled from the SFT model:</p>
          <div className={s.answers}>
            {ANSWERS.map((a, i) => (
              <div key={a.id} className={s.answer}>
                <span className={s.letter} style={{ background: COLORS[i] }}>
                  {a.id}
                </span>
                <span>
                  {a.text}
                  <small>{a.note}</small>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.cols}>
          <div className={s.panel}>
            <div className={s.panelTitle}>
              <span className={s.num}>1</span> People compare pairs
            </div>
            <div className={s.pairs}>
              {PAIRS.map(([a, b], i) => (
                <div key={i} className={s.pairRow} role="group" aria-label={`Answer ${ANSWERS[a].id} or answer ${ANSWERS[b].id}: which is better?`}>
                  {[a, b].map((x, j) => (
                    <button
                      key={x}
                      type="button"
                      className={`${s.pick} ${winners[i] === x ? s.pickOn : ''}`}
                      aria-pressed={winners[i] === x}
                      onClick={() => setWinners((w) => w.map((v, k) => (k === i ? x : v)))}
                      style={j === 1 ? { gridColumn: 3 } : undefined}
                    >
                      {winners[i] === x ? '✓ ' : ''}
                      {ANSWERS[x].id}
                    </button>
                  ))}
                  <span className={s.vs} style={{ gridColumn: 2, gridRow: 1 }}>
                    vs
                  </span>
                </div>
              ))}
            </div>
            <p className={s.hint}>6 comparisons. Nobody writes a perfect answer; they only pick the better one.</p>
          </div>

          <div className={s.panel}>
            <div className={s.panelTitle}>
              <span className={s.num}>2</span> Reward model scores
            </div>
            <div className={s.rbars} role="list" aria-label="Reward model score for each answer">
              {r.map((v, i) => {
                const w = (Math.min(rMax, Math.abs(v)) / rMax) * 50
                return (
                  <div key={i} className={s.rrow} role="listitem">
                    <span className={s.letter} style={{ background: COLORS[i], width: '1.3rem', height: '1.3rem', fontSize: '0.7rem' }}>
                      {ANSWERS[i].id}
                    </span>
                    <span className={s.rtrack}>
                      <span className={s.rzero} />
                      <span className={s.rfill} style={{ left: v >= 0 ? '50%' : `${50 - w}%`, width: `${w}%`, background: v >= 0 ? 'var(--viz-pos)' : 'var(--viz-neg)' }} />
                    </span>
                    <span className={s.rval}>{(v >= 0 ? '+' : '') + v.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
            <p className={s.hint}>
              Predicted chance a person prefers {ANSWERS[0].id} to {ANSWERS[2].id}: σ({(r[0] - r[2]).toFixed(2)}) = {sigma(r[0] - r[2]).toFixed(2)}
            </p>
          </div>

          <div className={s.panel}>
            <div className={s.panelTitle}>
              <span className={s.num}>3</span> The LLM's chance of each answer
            </div>
            <div className={s.pbars} role="list" aria-label="Probability of each answer before and after RLHF">
              {pNew.map((p, i) => (
                <div key={i} className={s.prow} role="listitem">
                  <span className={s.letter} style={{ background: COLORS[i], width: '1.3rem', height: '1.3rem', fontSize: '0.7rem' }}>
                    {ANSWERS[i].id}
                  </span>
                  <span className={s.pstack}>
                    <span className={s.pline}>
                      <span className={s.ptrack}>
                        <span className={s.pfill} style={{ width: `${P_SFT[i] * 100}%`, background: 'var(--viz-muted)' }} />
                      </span>
                      <span className={s.pval}>{P_SFT[i].toFixed(2)}</span>
                    </span>
                    <span className={s.pline}>
                      <span className={s.ptrack}>
                        <span className={s.pfill} style={{ width: `${p * 100}%`, background: COLORS[i] }} />
                      </span>
                      <span className={s.pval} style={{ color: 'var(--ink)', fontWeight: 700 }}>
                        {p.toFixed(2)}
                      </span>
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <p className={s.hint}>Grey: SFT model (before). Coloured: after RLHF.</p>
          </div>
        </div>

        <Controls>
          <Slider label="push towards reward" value={push} min={0} max={3} step={0.1} onChange={setPush} format={(v) => v.toFixed(1)} />
          <Readout
            items={[
              ['top-reward answer', ANSWERS[best].id],
              [`P(${ANSWERS[best].id}) before → after`, `${P_SFT[best].toFixed(2)} → ${pNew[best].toFixed(2)}`],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
