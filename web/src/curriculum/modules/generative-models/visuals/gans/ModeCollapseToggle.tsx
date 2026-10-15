import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Bars, usePlayer, PlayerControls, usePlot, useNarrow, mulberry32, M } from '../../../../../kit'

/*
  The classic "8 clusters on a ring" test for GANs, as a simplified simulation of what real training
  runs show (e.g. Metz et al., 2017, "Unrolled GANs").
  - healthy: the generator's samples spread out and settle on all 8 clusters;
  - collapsing: all samples crowd onto one cluster, the discriminator learns to call that cluster
    fake, and the whole crowd hops to a neighbouring cluster, again and again.
  The discriminator's verdict at each cluster uses the best-possible-discriminator formula
      D*(x) = p_data(x) / (p_data(x) + p_g(x)),
  with cluster shares in place of densities, and a lag of 2 steps (D needs time to notice).
*/

const K = 8
const R = 2
const T = 48
const N = 120
const LAG = 2
const modeAngle = (k: number) => (k * 2 * Math.PI) / K

function gaussian(rng: () => number) {
  const u = Math.max(1e-12, rng())
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
const smooth = (t: number) => {
  const s = Math.max(0, Math.min(1, t))
  return s * s * (3 - 2 * s)
}

type Mode = 'healthy' | 'collapse'

interface Noise {
  u: number
  n1: number
  n2: number
  n3: number
}

function samplesAt(mode: Mode, t: number, noise: Noise[]): [number, number][] {
  if (mode === 'healthy') {
    const s = smooth(t / 30)
    return noise.map(({ u, n1, n2 }) => {
      const th0 = 2 * Math.PI * u
      const k = Math.round(th0 / (2 * Math.PI / K)) % K
      let thF = modeAngle(k)
      if (thF - th0 > Math.PI) thF -= 2 * Math.PI
      if (th0 - thF > Math.PI) thF += 2 * Math.PI
      const th = th0 + s * (thF - th0)
      const r = 0.35 + s * (R - 0.35)
      const sd = 0.32 * (1 - s) + 0.13 * s
      return [r * Math.cos(th) + sd * n1, r * Math.sin(th) + sd * n2]
    })
  }
  // collapsing: one crowd whose centre angle hops from cluster to cluster
  const start = 2 // the cluster the crowd reaches first
  const reach = smooth(t / 8)
  const dwell = 7
  const move = 3
  let phi = modeAngle(start)
  if (t > 8) {
    const tt = t - 8
    const cyc = dwell + move
    const hops = Math.floor(tt / cyc)
    const within = tt - hops * cyc
    const frac = within < dwell ? 0 : smooth((within - dwell) / move)
    phi = modeAngle(start + hops + frac)
  }
  const r = 0.35 + reach * (R - 0.35)
  return noise.map(({ n1, n2, n3 }) => {
    const th = phi + 0.07 * n3
    return [r * Math.cos(th) + 0.12 * n1, r * Math.sin(th) + 0.12 * n2]
  })
}

/** share of samples near each cluster (within 0.6 of its centre) */
function shares(pts: [number, number][]) {
  const c = new Array(K).fill(0)
  for (const [x, y] of pts) {
    for (let k = 0; k < K; k++) {
      const a = modeAngle(k)
      if (Math.hypot(x - R * Math.cos(a), y - R * Math.sin(a)) < 0.6) {
        c[k]++
        break
      }
    }
  }
  return c.map((v) => v / pts.length)
}

function DotsLayer({ pts, color, r, hollow }: { pts: [number, number][]; color: string; r: number; hollow?: boolean }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={xs(x)}
          cy={ys(y)}
          r={r}
          style={hollow ? { fill: 'none', stroke: color, strokeWidth: 1.1, opacity: 0.55 } : { fill: color, opacity: 0.8, stroke: 'var(--surface)', strokeWidth: 0.6 }}
        />
      ))}
    </g>
  )
}

function Verdicts({ d }: { d: number[] }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {d.map((v, k) => {
        const a = modeAngle(k)
        const x = xs(2.82 * Math.cos(a))
        const y = ys(2.82 * Math.sin(a))
        const col = v >= 0.56 ? 'var(--viz-pos)' : v <= 0.44 ? 'var(--viz-neg)' : 'var(--viz-muted)'
        return (
          <g key={k}>
            <rect x={x - 19} y={y - 10} width={38} height={20} rx={10} style={{ fill: `color-mix(in srgb, ${col} 16%, var(--surface))`, stroke: col, strokeWidth: 1.3 }} />
            <text x={x} y={y + 4.5} textAnchor="middle" className="tabular" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink)' }}>
              {v.toFixed(2)}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default function ModeCollapseToggle() {
  const [mode, setMode] = useState<Mode>('collapse')
  const player = usePlayer({ steps: T + 1, interval: 380 })
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)
  const t = player.step
  // open on a moment where the collapse is already visible
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => player.setStep(13), [])

  const { real, noise } = useMemo(() => {
    const rng = mulberry32(2024)
    const real: [number, number][] = []
    for (let k = 0; k < K; k++)
      for (let i = 0; i < 12; i++) real.push([R * Math.cos(modeAngle(k)) + 0.13 * gaussian(rng), R * Math.sin(modeAngle(k)) + 0.13 * gaussian(rng)])
    const noise: Noise[] = Array.from({ length: N }, (_, i) => ({ u: (i + rng()) / N, n1: gaussian(rng), n2: gaussian(rng), n3: gaussian(rng) }))
    return { real, noise }
  }, [])

  const pts = useMemo(() => samplesAt(mode, t, noise), [mode, t, noise])
  const share = useMemo(() => shares(pts), [pts])
  const lagged = useMemo(() => shares(samplesAt(mode, Math.max(0, t - LAG), noise)), [mode, t, noise])
  const verdict = lagged.map((g) => 1 / K / (1 / K + g))
  const covered = share.filter((s) => s >= 0.05).length
  const busiest = Math.max(...share)

  const plot = (
    <Plot x={[-3.3, 3.3]} y={[-3.3, 3.3]} width={400} height={400} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} ariaLabel="Eight real-data clusters on a ring and the generator's samples">
      <DotsLayer pts={real} color="var(--viz-1)" r={3.6} hollow />
      <DotsLayer pts={pts} color="var(--viz-2)" r={3.3} />
      <Verdicts d={verdict} />
    </Plot>
  )

  return (
    <Figure
      wide
      title="Mode collapse on the 8-cluster ring"
      caption={
        <>
          Blue rings: real data, 8 equally common clusters. Orange dots: the generator's samples. The pill at each cluster is the discriminator's verdict there, from{' '}
          <M>{'D = p_\\text{data} / (p_\\text{data} + p_g)'}</M>: green means "looks real", red means "full of fakes", grey means "can't tell". Press <b>Play</b> in both settings. In the collapsing run every
          sample is convincing at each moment, yet the generator only ever makes one kind of output, and D's red pill just chases it around the ring. (A simplified
          simulation of what real training runs show.)
        </>
      }
    >
      <div ref={ref} style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '1rem', alignItems: 'center', width: '100%' }}>
        <div style={{ minWidth: 0 }}>{plot}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '0.3rem' }}>Share of generated samples at each cluster (real data: 12.5% each)</div>
          <Bars
            data={share.map((s, k) => ({ label: `cluster ${k + 1}`, value: s, color: s >= 0.05 ? 'var(--viz-2)' : 'var(--viz-muted)', strong: s === busiest && s > 0.3 }))}
            max={1}
            format={(v) => `${Math.round(v * 100)}%`}
            ariaLabel="Share of generated samples per cluster"
          />
        </div>
      </div>
      <Controls>
        <Segmented
          label="Training"
          value={mode}
          onChange={(m) => {
            setMode(m)
            player.reset()
          }}
          options={[
            { value: 'collapse', label: 'collapsing' },
            { value: 'healthy', label: 'healthy' },
          ]}
        />
        <Readout
          items={[
            ['clusters covered', `${covered} of 8`],
            ['busiest cluster', `${Math.round(busiest * 100)}%`],
          ]}
        />
      </Controls>
      <PlayerControls player={player} label={(s) => `Training step ${s} of ${T}`} />
    </Figure>
  )
}
