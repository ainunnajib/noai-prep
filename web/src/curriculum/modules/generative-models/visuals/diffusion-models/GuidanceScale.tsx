import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Label, usePlot, mulberry32, M } from '../../../../../kit'
import { ABAR, epsHat, gaussian, timesteps, type Pt } from './diffusion'

/*
  Classifier-free guidance on a 2-D toy. Three "prompts" (cat, dog, bird), each a round Gaussian
  blob of data. Both noise predictions come from the ideal denoiser for this data:
    eps_uncond: for all the data (any class)      eps_cond: for the prompted class only
  Guided prediction: eps = eps_uncond + w (eps_cond − eps_uncond). Sampler: deterministic DDIM, 30 steps.
*/

const CENTRES: Pt[] = [
  [-1, 0.55],
  [1, 0.55],
  [0, -1.1],
]
const SD = 0.6
const NAMES = ['cat', 'dog', 'bird'] as const
const COLS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)']
const N = 140
const K = 30

function sample(w: number, c: number, start: Pt[]): Pt[] {
  const ts = timesteps(K)
  const ab = ABAR.linear
  let xs = start
  for (let i = 0; i < K; i++) {
    const a = ab[ts[i]]
    const ap = ab[ts[i + 1]]
    xs = xs.map((x) => {
      const eu = epsHat(x, a, CENTRES, SD)
      const ec = epsHat(x, a, [CENTRES[c]], SD)
      const e: Pt = [eu[0] + w * (ec[0] - eu[0]), eu[1] + w * (ec[1] - eu[1])]
      const x0: Pt = [(x[0] - Math.sqrt(1 - a) * e[0]) / Math.sqrt(a), (x[1] - Math.sqrt(1 - a) * e[1]) / Math.sqrt(a)]
      if (ts[i + 1] === 0) return x0
      return [Math.sqrt(ap) * x0[0] + Math.sqrt(1 - ap) * e[0], Math.sqrt(ap) * x0[1] + Math.sqrt(1 - ap) * e[1]] as Pt
    })
  }
  return xs
}

/** probability of each class for a clean point (equal priors, equal round blobs) */
function classProbs(p: Pt): number[] {
  const l = CENTRES.map((c) => -((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2) / (2 * SD * SD))
  const m = Math.max(...l)
  const e = l.map((v) => Math.exp(v - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / s)
}

function Points({ pts, color, r, hollow }: { pts: Pt[]; color: string; r: number; hollow?: boolean }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={xs(p[0])}
          cy={ys(p[1])}
          r={r}
          style={hollow ? { fill: 'none', stroke: color, strokeWidth: 1, opacity: 0.45 } : { fill: color, stroke: 'var(--surface)', strokeWidth: 0.8, opacity: 0.95 }}
        />
      ))}
    </g>
  )
}

export default function GuidanceScale() {
  const [w, setW] = useState(1)
  const [c, setC] = useState(0)

  const { data, start } = useMemo(() => {
    const rng = mulberry32(31337)
    const data = CENTRES.map((cc) => Array.from({ length: 70 }, () => [cc[0] + SD * gaussian(rng), cc[1] + SD * gaussian(rng)] as Pt))
    const start: Pt[] = Array.from({ length: N }, () => [gaussian(rng), gaussian(rng)])
    return { data, start }
  }, [])

  const pts = useMemo(() => sample(w, c, start), [w, c, start])
  const clearly = pts.filter((p) => classProbs(p)[c] >= 0.9).length / N
  const mean: Pt = [pts.reduce((s, p) => s + p[0], 0) / N, pts.reduce((s, p) => s + p[1], 0) / N]
  const spread = Math.sqrt(pts.reduce((s, p) => s + (p[0] - mean[0]) ** 2 + (p[1] - mean[1]) ** 2, 0) / N)
  const fromTypical = pts.reduce((s, p) => s + Math.hypot(p[0] - CENTRES[c][0], p[1] - CENTRES[c][1]), 0) / N

  const verdict =
    w === 0
      ? 'w = 0: the prompt is ignored, so you get a mix of all three kinds.'
      : w <= 1
        ? 'w = 1: plain conditional sampling. Most samples fit the prompt, but some sit in the overlap with other classes.'
        : w <= 4
          ? 'w > 1: pushed away from the other classes. Every sample clearly fits the prompt, with a little less variety.'
          : 'Large w: samples are exaggerated, crowding into the far corner, beyond most real examples. Real images start to look over-saturated.'

  return (
    <Figure
      wide
      title="Classifier-free guidance: obeying the prompt"
      caption={
        <>
          Faint rings: real training data for three prompts. Filled dots: 140 samples generated with the prompt you choose, using{' '}
          <M>{'\\hat\\varepsilon = \\varepsilon_\\text{uncond} + w\\,(\\varepsilon_\\text{cond} - \\varepsilon_\\text{uncond})'}</M>. Slide the guidance scale{' '}
          <M>w</M> from 0 to 10 and watch the samples move <i>away</i> from the other prompts and bunch together. Stable Diffusion uses <M>{'w = 7.5'}</M> by default.
        </>
      }
    >
      <Plot x={[-3.9, 3.9]} y={[-4.1, 3.2]} width={480} height={450} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} ariaLabel="Three classes of data and samples generated with classifier-free guidance">
        {data.map((d, k) => (
          <Points key={k} pts={d} color={COLS[k]} r={3.4} hollow />
        ))}
        {CENTRES.map((cc, k) => (
          <Label key={k} x={k === 2 ? 1.75 : cc[0]} y={k === 2 ? -1.95 : 2.55} anchor="middle" color={COLS[k]} weight={700} size={14}>
            {NAMES[k]}
          </Label>
        ))}
        <Points pts={pts} color={COLS[c]} r={3.6} />
      </Plot>
      <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--ink-2)', textAlign: 'center' }} aria-live="polite">
        {verdict}
      </p>
      <Controls>
        <Segmented label="Prompt" value={c} onChange={setC} options={NAMES.map((n, k) => ({ value: k, label: `"${n}"` }))} />
        <Slider label={<>guidance scale <M>w</M></>} value={w} min={0} max={10} step={0.5} onChange={setW} format={(v) => v.toFixed(1)} />
        <Readout
          items={[
            [`clearly a ${NAMES[c]}`, `${Math.round(clearly * 100)}%`],
            ['variety (spread)', spread.toFixed(2)],
            [`distance from a typical ${NAMES[c]}`, fromTypical.toFixed(2)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
