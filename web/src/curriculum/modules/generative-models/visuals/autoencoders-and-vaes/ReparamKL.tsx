import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Button, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, Arrow, Label, VLine, M, mulberry32, useNarrow } from '../../../../../kit'

/*
  One latent dimension of a VAE, for one input image.
  The encoder outputs mu and sigma; the code is sampled as z = mu + sigma * eps with eps ~ N(0, 1)
  (the reparameterisation trick). The KL term measures how far N(mu, sigma^2) is from the prior N(0, 1):
     KL = 1/2 (mu^2 + sigma^2 - 1 - ln sigma^2)
*/

const SQ2PI = Math.sqrt(2 * Math.PI)
const pdf = (x: number, m: number, s: number) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * SQ2PI)
const kl = (m: number, s: number) => 0.5 * (m * m + s * s - 1 - Math.log(s * s))
const YTOP = 1.1

function eps(seed: number): number {
  const rng = mulberry32(4242 + seed * 97)
  const u = Math.max(1e-12, rng())
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const area = (f: (x: number) => number): [number, number][] => {
  const pts: [number, number][] = [[-4, 0]]
  for (let i = 0; i <= 200; i++) {
    const x = -4 + (8 * i) / 200
    pts.push([x, Math.min(YTOP * 1.5, f(x))])
  }
  pts.push([4, 0])
  return pts
}

const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))
const sgn = (v: number) => (v < 0 ? `(${f2(v)})` : f2(v))

export default function ReparamKL() {
  const [mu, setMu] = useState(1.2)
  const [sigma, setSigma] = useState(0.5)
  const [n, setN] = useState(1)
  const [back, setBack] = useState(false)

  const epsList = useMemo(() => Array.from({ length: n }, (_, i) => eps(i)), [n])
  const e = epsList[epsList.length - 1]
  const z = mu + sigma * e
  const K = kl(mu, sigma)
  const q = (x: number) => pdf(x, mu, sigma)
  const prior = (x: number) => pdf(x, 0, 1)
  const hist = epsList.slice(-30)

  return (
    <Figure
      title="Inside a VAE's bottleneck: μ, σ, ε and the KL price"
      caption={
        <>
          For one input, the encoder outputs a mean <M>{'\\mu'}</M> and a spread <M>{'\\sigma'}</M>: not one code, but a bell curve of possible codes (purple). Press{' '}
          <b>Sample ε</b>: a random <M>{'\\varepsilon'}</M> is drawn from the fixed grey curve and turned into a code by <M>{'z = \\mu + \\sigma\\varepsilon'}</M>. Now find
          the settings that make the KL price zero, then shrink <M>{'\\sigma'}</M> towards 0.1 and watch the price shoot up: a VAE is charged for squeezing each input
          into a tiny, private spot.
        </>
      }
    >
      <Plot x={[-4, 4]} y={[0, YTOP]} width={520} height={250} minHeight={220} margin={{ left: 40, bottom: 30, top: 12 }} ariaLabel="The prior bell curve N(0, 1) and the encoder's bell curve N(mu, sigma squared), with the latest sample">
        <Grid xTicks={8} yTicks={4} />
        <Path points={area(prior)} closed fill="color-mix(in srgb, var(--viz-muted) 22%, transparent)" color="none" width={0} />
        <Path points={area(q)} closed fill="color-mix(in srgb, var(--viz-5) 22%, transparent)" color="none" width={0} />
        <FnPath f={prior} color="var(--viz-muted)" width={2.2} dash="6 4" />
        <FnPath f={q} color="var(--viz-5)" width={2.8} />
        <VLine x={mu} color="var(--viz-5)" dash="3 3" />
        <Label x={-2.35} y={0.17} anchor="middle" color="var(--ink-2)" size={12}>
          prior N(0, 1)
        </Label>
        {q(mu) < YTOP ? (
          <Label x={mu} y={q(mu)} dy={-8} anchor={mu > 2.3 ? 'end' : mu < -2.3 ? 'start' : 'middle'} color="var(--viz-5)" size={12} weight={700}>
            encoder: N(μ, σ²)
          </Label>
        ) : (
          <Label x={mu} y={YTOP} dx={mu > 2 ? -6 : 6} dy={14} anchor={mu > 2 ? 'end' : 'start'} color="var(--viz-5)" size={12} weight={700}>
            peak off the chart
          </Label>
        )}
        {/* history of earlier samples, as ticks along the bottom */}
        <Dots points={hist.slice(0, -1).map((v) => ({ x: mu + sigma * v, y: 0.025, r: 3, color: 'color-mix(in srgb, var(--viz-5) 55%, var(--surface))' }))} />
        <Arrow from={[e, prior(e)]} to={[z, Math.min(YTOP - 0.02, q(z))]} color="var(--viz-ink)" width={1.8} head={8} dash="4 3" />
        <Dots
          points={[
            { x: e, y: prior(e), r: 6, color: 'var(--viz-muted)' },
            { x: z, y: Math.min(YTOP - 0.02, q(z)), r: 6.5, color: 'var(--viz-5)' },
          ]}
        />
        <Label x={e} y={prior(e)} dx={-10} dy={4} anchor="end" color="var(--ink-2)" size={13} weight={700}>
          ε
        </Label>
        <Axes xTicks={8} yTicks={4} xLabel="latent value z" />
      </Plot>
      <div style={sumLine} className="tabular" aria-live="polite">
        <span>
          <M>{'z = \\mu + \\sigma\\,\\varepsilon'}</M> = {f2(mu)} + {f2(sigma)} × {sgn(e)} = <b style={{ color: 'var(--viz-5)' }}>{f2(z)}</b>
        </span>
        <span>
          <M>{'\\text{KL} = \\tfrac12(\\mu^2 + \\sigma^2 - 1 - \\ln\\sigma^2)'}</M> = ½({f2(mu * mu)} + {f2(sigma * sigma)} − 1 − {sgn(Math.log(sigma * sigma))}) ={' '}
          <b style={{ color: K < 0.05 ? 'var(--ok)' : K > 2 ? 'var(--viz-neg)' : 'var(--ink)' }}>{f2(K)}</b>
        </span>
      </div>
      <Controls>
        <Slider label={<>mean <M>{'\\mu'}</M></>} value={mu} min={-3} max={3} step={0.05} onChange={setMu} format={(v) => v.toFixed(2)} />
        <Slider label={<>spread <M>{'\\sigma'}</M></>} value={sigma} min={0.1} max={2} step={0.05} onChange={setSigma} format={(v) => v.toFixed(2)} />
        <Button primary onClick={() => setN((k) => k + 1)}>
          Sample ε
        </Button>
        <Readout
          items={[
            ['ε (random)', f2(e)],
            ['z', f2(z)],
            ['KL price', f2(K)],
          ]}
        />
      </Controls>
      <Graph mu={mu} sigma={sigma} e={e} z={z} back={back} />
      <Controls>
        <Toggle label="Show the backward pass (where gradients flow)" checked={back} onChange={setBack} />
      </Controls>
    </Figure>
  )
}

const sumLine: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--ink)', margin: '0.4rem 0 0', textAlign: 'center' }

interface Node {
  id: string
  x: number
  y: number
  w: number
  text: string
  sub?: string
  kind: 'data' | 'net' | 'rand' | 'z'
}

/** the computation graph x -> encoder -> (mu, sigma) ; eps -> z = mu + sigma*eps -> decoder -> x-hat */
function Graph({ mu, sigma, e, z, back }: { mu: number; sigma: number; e: number; z: number; back: boolean }) {
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const W = narrow ? 340 : 640
  const H = narrow ? 420 : 205
  const nodes: Node[] = narrow
    ? [
        { id: 'x', x: 170, y: 26, w: 120, text: 'input image x', kind: 'data' },
        { id: 'enc', x: 170, y: 86, w: 120, text: 'encoder', kind: 'net' },
        { id: 'mu', x: 85, y: 150, w: 100, text: `μ = ${f2(mu)}`, kind: 'data' },
        { id: 'sg', x: 255, y: 150, w: 100, text: `σ = ${f2(sigma)}`, kind: 'data' },
        { id: 'eps', x: 255, y: 222, w: 130, text: `ε = ${f2(e)}`, sub: 'random, from N(0, 1)', kind: 'rand' },
        { id: 'z', x: 100, y: 262, w: 150, text: `z = μ + σε = ${f2(z)}`, kind: 'z' },
        { id: 'dec', x: 170, y: 330, w: 120, text: 'decoder', kind: 'net' },
        { id: 'xh', x: 170, y: 392, w: 150, text: 'reconstruction x̂', kind: 'data' },
      ]
    : [
        { id: 'x', x: 40, y: 82, w: 72, text: 'image x', kind: 'data' },
        { id: 'enc', x: 138, y: 82, w: 80, text: 'encoder', kind: 'net' },
        { id: 'mu', x: 248, y: 36, w: 92, text: `μ = ${f2(mu)}`, kind: 'data' },
        { id: 'sg', x: 248, y: 128, w: 92, text: `σ = ${f2(sigma)}`, kind: 'data' },
        { id: 'eps', x: 420, y: 160, w: 120, text: `ε = ${f2(e)}`, sub: 'random, from N(0, 1)', kind: 'rand' },
        { id: 'z', x: 420, y: 82, w: 168, text: `z = μ + σε = ${f2(z)}`, kind: 'z' },
        { id: 'dec', x: 551, y: 82, w: 74, text: 'decoder', kind: 'net' },
        { id: 'xh', x: 616, y: 82, w: 40, text: 'x̂', kind: 'data' },
      ]
  const N = Object.fromEntries(nodes.map((d) => [d.id, d])) as Record<string, Node>
  const edges: [string, string][] = [
    ['x', 'enc'],
    ['enc', 'mu'],
    ['enc', 'sg'],
    ['mu', 'z'],
    ['sg', 'z'],
    ['eps', 'z'],
    ['z', 'dec'],
    ['dec', 'xh'],
  ]
  const grad = new Set(['enc-mu', 'enc-sg', 'mu-z', 'sg-z', 'z-dec', 'dec-xh', 'x-enc'])
  const h = 34
  const fillOf = (k: Node['kind']) =>
    k === 'net' ? 'color-mix(in srgb, var(--viz-1) 14%, var(--surface))' : k === 'rand' ? 'color-mix(in srgb, var(--viz-muted) 20%, var(--surface))' : k === 'z' ? 'color-mix(in srgb, var(--viz-5) 16%, var(--surface))' : 'var(--surface)'
  const strokeOf = (k: Node['kind']) => (k === 'net' ? 'var(--viz-1)' : k === 'rand' ? 'var(--viz-muted)' : k === 'z' ? 'var(--viz-5)' : 'var(--viz-axis)')

  // a line from the edge of one box to the edge of another
  const seg = (a: Node, b: Node) => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const cut = (n: Node, ux: number, uy: number) => {
      const tx = Math.abs(ux) > 1e-9 ? n.w / 2 / Math.abs(ux) : Infinity
      const ty = Math.abs(uy) > 1e-9 ? h / 2 / Math.abs(uy) : Infinity
      return Math.min(tx, ty) + 3
    }
    const L = Math.hypot(dx, dy)
    const ux = dx / L
    const uy = dy / L
    const s = cut(a, ux, uy)
    const t = cut(b, ux, uy)
    return { x1: a.x + ux * s, y1: a.y + uy * s, x2: b.x - ux * t, y2: b.y - uy * t }
  }

  return (
    <div ref={ref} style={{ width: '100%', marginTop: '0.6rem' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W * 1.15, display: 'block', margin: '0 auto' }} role="img" aria-label="Computation graph: image, encoder, mu and sigma, random epsilon, z, decoder, reconstruction">
        <defs>
          <marker id="rk-fwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0L10,5L0,10Z" style={{ fill: 'var(--viz-axis)' }} />
          </marker>
          <marker id="rk-back" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0L10,5L0,10Z" style={{ fill: 'var(--viz-pos)' }} />
          </marker>
        </defs>
        {edges.map(([a, b]) => {
          const s = seg(N[a], N[b])
          const isGrad = back && grad.has(`${a}-${b}`)
          return (
            <g key={`${a}-${b}`}>
              <line {...s} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.6, opacity: back ? 0.35 : 1 }} markerEnd="url(#rk-fwd)" />
              {isGrad && (
                <line
                  x1={s.x2}
                  y1={s.y2}
                  x2={s.x1}
                  y2={s.y1}
                  transform={`translate(${narrow ? 7 : 0},${narrow ? 0 : 6})`}
                  style={{ stroke: 'var(--viz-pos)', strokeWidth: 2.4, strokeDasharray: '5 3' }}
                  markerEnd="url(#rk-back)"
                />
              )}
            </g>
          )
        })}
        {nodes.map((d) => (
          <g key={d.id}>
            <rect x={d.x - d.w / 2} y={d.y - h / 2} width={d.w} height={h} rx={8} style={{ fill: fillOf(d.kind), stroke: strokeOf(d.kind), strokeWidth: 1.6, strokeDasharray: d.kind === 'rand' ? '4 3' : undefined }} />
            <text x={d.x} y={d.y} dy="0.35em" textAnchor="middle" className="tabular" style={{ fontSize: 13, fill: 'var(--ink)', fontWeight: d.kind === 'z' ? 700 : 500 }}>
              {d.text}
            </text>
            {d.sub && (
              <text x={d.x} y={d.y + h / 2 + 13} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ink-2)' }}>
                {d.sub}
              </text>
            )}
          </g>
        ))}
        {back && (
          <g style={{ fontSize: 12, fontWeight: 700 }}>
            <text x={narrow ? 20 : 304} y={narrow ? 204 : 34} style={{ fill: 'var(--viz-pos)' }}>
              ∂z/∂μ = 1
            </text>
            <text x={narrow ? 335 : 304} y={narrow ? 188 : 134} textAnchor={narrow ? 'end' : 'start'} style={{ fill: 'var(--viz-pos)' }}>
              {narrow ? '∂z/∂σ = ε' : `∂z/∂σ = ε = ${f2(e)}`}
            </text>
            <text x={narrow ? 255 : 488} y={narrow ? 272 : 160} dy="0.35em" textAnchor={narrow ? 'middle' : 'start'} style={{ fill: 'var(--viz-neg)', fontWeight: 600 }}>
              no gradient needed
            </text>
          </g>
        )}
      </svg>
      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', textAlign: 'center', margin: '0.2rem auto 0', maxWidth: '36rem', minHeight: '2.5em' }}>
        {back
          ? 'Training sends gradients (green) backwards from the loss. They pass through z to μ and σ, and on into the encoder, because z = μ + σε is ordinary arithmetic. The random ε is just an input, like the image: nothing needs to learn it.'
          : 'Forward pass: the randomness enters from the side, as ε. Everything on the main path is ordinary, differentiable arithmetic.'}
      </p>
    </div>
  )
}
