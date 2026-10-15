import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Readout, Button, M, mulberry32, useBump } from '../../../../../kit'
import s from './decode.module.css'

/*
  Temperature: divide the logits by T, then softmax.  p_i = exp(z_i / T) / Σ_j exp(z_j / T)
  The bars are recomputed for the chosen T; the thin tick on each bar marks the T = 1 probability.
  Five continuations are sampled from the current distribution with a seeded RNG.
*/

const PROMPT = 'After CCA we went to the hawker centre and I ordered'
const TOKENS: { t: string; z: number }[] = [
  { t: 'chicken', z: 3.0 },
  { t: 'laksa', z: 2.4 },
  { t: 'prata', z: 2.0 },
  { t: 'satay', z: 1.4 },
  { t: 'noodles', z: 1.2 },
  { t: 'kopi', z: 0.8 },
  { t: 'durian', z: 0.0 },
  { t: 'pizza', z: -0.5 },
  { t: 'homework', z: -2.5 },
]

function softmaxT(z: number[], T: number): number[] {
  const scaled = z.map((v) => v / T)
  const m = Math.max(...scaled)
  const e = scaled.map((v) => Math.exp(v - m))
  const sum = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / sum)
}

const entropyBits = (p: number[]) => -p.reduce((acc, v) => (v > 0 ? acc + v * Math.log2(v) : acc), 0)

function sampleIndex(p: number[], u: number) {
  let c = 0
  for (let i = 0; i < p.length; i++) {
    c += p[i]
    if (u < c) return i
  }
  return p.length - 1
}

export default function TemperatureSoftmax() {
  const [T, setT] = useState(1)
  const [seed, bump] = useBump()
  const z = TOKENS.map((x) => x.z)
  const p = softmaxT(z, T)
  const p1 = useMemo(() => softmaxT(z, 1), []) // eslint-disable-line react-hooks/exhaustive-deps
  const H = entropyBits(p)
  const top = Math.max(...p)
  const rng = mulberry32(1234 + seed * 7919)
  const draws = Array.from({ length: 5 }, () => sampleIndex(p, rng()))
  const scale = Math.max(0.5, top)

  return (
    <Figure
      wide
      title="Temperature reshapes the next-token distribution"
      caption={
        <>
          Slide T and press <b>Resample</b>. Below 1 the bars sharpen until only <i>chicken</i> is left (that is greedy decoding); above 1 they
          flatten and odd choices like <i>homework</i> start to appear. The thin tick marks each token's probability at T = 1. Notice that the{' '}
          <b>order of the bars never changes</b>: temperature only changes how strongly the top tokens dominate. Entropy (in bits) measures how
          unpredictable the next token is.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.prompt}>
          <b>Prompt:</b> {PROMPT} <span className={s.blank}>?</span>
        </div>

        <div className={s.formula}>
          <M>{`p_i = \\dfrac{e^{z_i / T}}{\\sum_j e^{z_j / T}}, \\qquad T = ${T.toFixed(2)}`}</M>
        </div>

        <div className={s.rows} role="list" aria-label={`Next-token probabilities at temperature ${T.toFixed(2)}`}>
          {TOKENS.map((x, i) => (
            <div key={x.t} role="listitem" style={{ display: 'contents' }}>
              <span className={`${s.rowLabel} ${i === 0 ? s.rowLabelStrong : ''}`}>
                {x.t} <span className={s.valMuted}>({x.z >= 0 ? '+' : ''}{x.z.toFixed(1)})</span>
              </span>
              <span className={s.track}>
                <span className={s.fill} style={{ width: `${(p[i] / scale) * 100}%`, background: i === 0 ? 'var(--viz-2)' : 'var(--viz-1)' }} />
                <span className={s.ghost} style={{ left: `calc(${Math.min(100, (p1[i] / scale) * 100)}% - 1px)` }} aria-hidden="true" />
              </span>
              <span className={s.val}>{p[i] < 0.0005 ? '0.000' : p[i].toFixed(3)}</span>
            </div>
          ))}
        </div>
        <div className={s.legend}>
          <span>token (logit z)</span>
          <span>
            <i className={s.swatch} style={{ background: 'var(--viz-1)' }} /> probability at this T
          </span>
          <span>
            <i className={s.tick} /> probability at T = 1
          </span>
        </div>

        <Controls>
          <Slider label="temperature T" value={T} min={0.1} max={2} step={0.05} onChange={setT} format={(v) => v.toFixed(2)} />
          <Readout
            items={[
              ['P(top token)', top.toFixed(3)],
              ['entropy', `${H.toFixed(2)} bits`],
            ]}
          />
        </Controls>

        <div className={s.samples} aria-live="polite">
          <div className={s.sampleHead}>Five sampled continuations at T = {T.toFixed(2)}</div>
          {draws.map((d, k) => (
            <div key={k} className={s.sample}>
              …and I ordered <b>{TOKENS[d].t}</b>
            </div>
          ))}
          <div>
            <Button onClick={bump}>Resample</Button>
          </div>
        </div>
      </div>
    </Figure>
  )
}
