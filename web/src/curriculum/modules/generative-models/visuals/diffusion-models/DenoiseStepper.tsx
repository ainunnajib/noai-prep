import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Path, usePlot, usePlayer, PlayerControls, mulberry32, M } from '../../../../../kit'
import { ABAR, gaussian, timesteps, x0Hat, type Pt } from './diffusion'

/*
  Sampling from a diffusion model on toy 2-D data (points on a spiral). The "network" is the ideal
  denoiser for this data (see diffusion.ts), so every step is exactly what a perfectly trained model
  would do. Samplers, on K evenly spaced steps of the linear schedule: DDIM (deterministic: each step
  only removes predicted noise) or DDPM (each step also adds back a little fresh noise).
*/

const M_PTS = 160
const N = 150
const S = 0.05 // the spiral's thickness

const SPIRAL: Pt[] = Array.from({ length: M_PTS }, (_, i) => {
  const u = i / (M_PTS - 1)
  const th = 3 * Math.PI * u + 0.5 * Math.PI
  const r = 0.35 + 1.65 * u
  return [r * Math.cos(th), r * Math.sin(th)]
})

type Sampler = 'ddim' | 'ddpm'

/** frames[i] = positions after i steps; guesses[i] = the network's guess of each point's clean version x0 at that moment */
function run(K: number, seed: number, sampler: Sampler): { frames: Pt[][]; guesses: Pt[][] } {
  const rng = mulberry32(seed * 7907 + 11)
  let xs: Pt[] = Array.from({ length: N }, () => [gaussian(rng), gaussian(rng)])
  const frames: Pt[][] = [xs]
  const guesses: Pt[][] = []
  const ts = timesteps(K)
  const ab = ABAR.linear
  for (let i = 0; i < K; i++) {
    const a = ab[ts[i]]
    const ap = ab[ts[i + 1]]
    // fresh-noise variance between the two noise levels: 0 for DDIM, (1 - ap)/(1 - a) * (1 - a/ap) for DDPM
    const s2 = sampler === 'ddpm' && ts[i + 1] > 0 ? ((1 - ap) / (1 - a)) * (1 - a / ap) : 0
    const c = Math.sqrt(Math.max(0, 1 - ap - s2))
    const sd = Math.sqrt(s2)
    const g: Pt[] = xs.map((x) => x0Hat(x, a, SPIRAL, S))
    guesses.push(g)
    const mean: Pt[] = xs.map((x, j) => {
      const x0 = g[j]
      if (ts[i + 1] === 0) return x0
      const eps: Pt = [(x[0] - Math.sqrt(a) * x0[0]) / Math.sqrt(1 - a), (x[1] - Math.sqrt(a) * x0[1]) / Math.sqrt(1 - a)]
      return [Math.sqrt(ap) * x0[0] + c * eps[0], Math.sqrt(ap) * x0[1] + c * eps[1]] as Pt
    })
    xs = sd > 0 ? mean.map((m) => [m[0] + sd * gaussian(rng), m[1] + sd * gaussian(rng)] as Pt) : mean
    frames.push(xs)
  }
  return { frames, guesses }
}

function distToSpiral(p: Pt) {
  let best = Infinity
  for (const q of SPIRAL) best = Math.min(best, Math.hypot(p[0] - q[0], p[1] - q[1]))
  return best
}

function Layer({ pts, next }: { pts: Pt[]; next?: Pt[] }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {next &&
        pts.map((p, i) => {
          const x1 = xs(p[0])
          const y1 = ys(p[1])
          const x2 = xs(next[i][0])
          const y2 = ys(next[i][1])
          const len = Math.hypot(x2 - x1, y2 - y1)
          if (len < 3) return null
          const ux = (x2 - x1) / len
          const uy = (y2 - y1) / len
          const h = Math.min(6, len * 0.5)
          return (
            <g key={`a${i}`} style={{ opacity: 0.4 }}>
              <line x1={x1} y1={y1} x2={x2 - ux * h} y2={y2 - uy * h} style={{ stroke: 'var(--viz-2)', strokeWidth: 1 }} />
              <path d={`M${x2},${y2}L${x2 - ux * h - uy * h * 0.5},${y2 - uy * h + ux * h * 0.5}L${x2 - ux * h + uy * h * 0.5},${y2 - uy * h - ux * h * 0.5}Z`} style={{ fill: 'var(--viz-2)' }} />
            </g>
          )
        })}
      {pts.map((p, i) => (
        <circle key={i} cx={xs(p[0])} cy={ys(p[1])} r={3.2} style={{ fill: 'var(--viz-4)', stroke: 'var(--surface)', strokeWidth: 0.7 }} />
      ))}
    </g>
  )
}

export default function DenoiseStepper() {
  const [K, setK] = useState(20)
  const [seed, setSeed] = useState(1)
  const [sampler, setSampler] = useState<Sampler>('ddim')
  const { frames, guesses } = useMemo(() => run(K, seed, sampler), [K, seed, sampler])
  const player = usePlayer({ steps: K + 1, interval: K >= 50 ? 110 : K >= 20 ? 260 : 700 })
  const i = Math.min(player.step, K)
  const pts = frames[i]
  const ts = timesteps(K)
  const avgDist = useMemo(() => pts.reduce((s, p) => s + distToSpiral(p), 0) / pts.length, [pts])

  return (
    <Figure
      wide
      title="Generating = many small denoising steps"
      caption={
        <>
          The grey spiral is where real data lives. The pink dots start as pure noise. At every step the network predicts each dot's noise, which is the same as
          guessing its clean version <M>{'\\hat x_0'}</M> (orange arrows), and the dot moves a little way towards it. Press <b>Play</b>: early on, every arrow points
          at the same spot, the <i>average</i> of the data (near the middle of the spiral), because from heavy noise that is the best guess; later the guesses sharpen onto the spiral. Set the steps to{' '}
          <b>1</b>: one giant step lands every dot on that blurry average. With 5 they are only roughly placed; with 20 or 100 they find the spiral. Switch to <b>DDPM</b> to add a little fresh noise
          at each step, as in the original method: the dots jitter but still arrive.
        </>
      }
    >
      <Plot x={[-2.7, 2.7]} y={[-2.7, 2.7]} width={420} height={420} margin={{ left: 10, right: 10, top: 10, bottom: 10 }} ariaLabel="Noise points being denoised step by step onto a spiral">
        <Path points={SPIRAL} color="color-mix(in srgb, var(--viz-muted) 70%, transparent)" width={9} />
        <Layer pts={pts} next={i < K ? guesses[i] : undefined} />
      </Plot>
      <PlayerControls player={player} label={(s) => (s === 0 ? `Pure noise (t = 1000)` : `After step ${Math.min(s, K)} of ${K} (t = ${ts[Math.min(s, K)]})`)} />
      <Controls>
        <Segmented
          label="Denoising steps"
          value={K}
          onChange={(k) => {
            player.reset()
            setK(k)
          }}
          options={[1, 5, 20, 100].map((k) => ({ value: k, label: String(k) }))}
        />
        <Segmented
          label="Sampler"
          value={sampler}
          onChange={(v) => {
            player.reset()
            setSampler(v)
          }}
          options={[
            { value: 'ddim', label: 'DDIM' },
            { value: 'ddpm', label: 'DDPM' },
          ]}
        />
        <Button
          onClick={() => {
            player.reset()
            setSeed((s) => s + 1)
          }}
        >
          New starting noise
        </Button>
        <Readout
          items={[
            ['network calls so far', String(i)],
            ['average distance to the spiral', avgDist.toFixed(2)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
