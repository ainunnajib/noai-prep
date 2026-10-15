import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Grid, Axes, Path, Dots, DraggablePoint, usePlot, M, mulberry32, useNarrow } from '../../../../../kit'
import { DigitImg, decodeImg, makeDecoder, mse, Tiny } from './digits'
import { LATENT, type LatentModel } from './aeData'

/*
  Two real 2-D latent spaces, trained in PyTorch on scikit-learn's 8 x 8 digits:
  a plain autoencoder (codes z) and a VAE (codes = the encoder means mu). Each glyph is one training digit
  placed at its code. The decoder runs live in the browser on whatever point you choose.
  "How real?" = mean squared distance from the decoded image to the closest of the 300 real digits shown.
*/

type Which = 'ae' | 'vae'
type Mode = 'probe' | 'path' | 'sample'
type P = [number, number]

const CLS = [
  'var(--viz-1)',
  'var(--viz-2)',
  'var(--viz-3)',
  'var(--viz-4)',
  'var(--viz-5)',
  'var(--viz-6)',
  'color-mix(in srgb, var(--viz-1) 45%, var(--viz-3))',
  'color-mix(in srgb, var(--viz-2) 50%, var(--viz-4))',
  'var(--viz-neg)',
  'var(--viz-ink)',
]
const STRIP = 8

function realness(d: number): { text: string; color: string } {
  if (d < 0.03) return { text: 'looks like a real digit', color: 'var(--ok)' }
  if (d < 0.05) return { text: 'a bit odd', color: 'var(--warn)' }
  return { text: 'unlike any real digit', color: 'var(--bad)' }
}

// Path mode starts at the same two training digits (a 4 and a 6) in both models
const START: Record<Which, { probe: P; a: P; b: P }> = {
  ae: { probe: [10.5, 15], a: [17.4, 5.7], b: [2.2, 14.4] },
  vae: { probe: [1.6, 1.6], a: [2.26, -0.87], b: [0.12, -1.29] },
}

function gauss(seed: number, n: number): P[] {
  const rng = mulberry32(777 + seed * 131)
  const out: P[] = []
  for (let i = 0; i < n; i++) {
    const u = Math.max(1e-12, rng())
    const v = rng()
    const r = Math.sqrt(-2 * Math.log(u))
    out.push([r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)])
  }
  return out
}

const panel: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', minWidth: 0 }

export default function LatentInterpolator() {
  const [which, setWhich] = useState<Which>('ae')
  const [mode, setMode] = useState<Mode>('probe')
  const [pts, setPts] = useState(START)
  const [seed, setSeed] = useState(1)
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)

  const M_: LatentModel = LATENT[which]
  const decode = useMemo(() => ({ ae: makeDecoder(LATENT.ae.dec), vae: makeDecoder(LATENT.vae.dec) }), [])
  const reals = useMemo(() => LATENT.imgs.map(decodeImg), [])
  const nearest = (img: number[]) => {
    let best = Infinity
    let bi = 0
    for (let i = 0; i < reals.length; i++) {
      const d = mse(img, reals[i])
      if (d < best) {
        best = d
        bi = i
      }
    }
    return { d: best, i: bi }
  }

  const cur = pts[which]
  const set = (key: 'probe' | 'a' | 'b') => (x: number, y: number) => setPts((o) => ({ ...o, [which]: { ...o[which], [key]: [x, y] as P } }))
  const [[x0, x1], [y0, y1]] = M_.box

  const probeImg = decode[which](cur.probe)
  const probeNear = nearest(probeImg)
  const strip: P[] =
    mode === 'path'
      ? Array.from({ length: STRIP }, (_, i) => {
          const t = i / (STRIP - 1)
          return [cur.a[0] + t * (cur.b[0] - cur.a[0]), cur.a[1] + t * (cur.b[1] - cur.a[1])] as P
        })
      : mode === 'sample'
        ? gauss(seed, STRIP)
        : []
  const stripImgs = strip.map((z) => decode[which](z))
  const stripNear = stripImgs.map(nearest)
  const stripMean = stripNear.length ? stripNear.reduce((s, n) => s + n.d, 0) / stripNear.length : 0
  const sampleInBox = strip.filter(([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)

  const rn = realness(probeNear.d)
  const big = narrow ? 96 : 120

  return (
    <Figure
      wide
      title="Walk around inside the latent space"
      caption={
        <>
          Each little number is a real training digit, placed at the 2-D code its encoder gave it. The decoder runs live on any point you choose. Start with the{' '}
          <b>plain autoencoder</b>: look at the axis scales and the empty space between the arms, then drag the probe into a gap. Switch to <b>Path</b> (it starts at the same 4 and 6 in both models) and <b>Sample</b> (8 random codes from{' '}
          <M>{'\\mathcal N(0, I)'}</M>, the dashed circles). Then flip to the <b>VAE</b> and try the same three things.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Model"
          value={which}
          onChange={setWhich}
          options={[
            { value: 'ae', label: 'Plain autoencoder' },
            { value: 'vae', label: 'VAE' },
          ]}
        />
        <Segmented
          label="Explore"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'probe', label: 'Probe' },
            { value: 'path', label: 'Path' },
            { value: 'sample', label: 'Sample' },
          ]}
        />
      </Controls>
      <div ref={ref} style={{ display: 'grid', gridTemplateColumns: narrow || mode !== 'probe' ? '1fr' : 'minmax(0, 1fr) 190px', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
        <Plot
          x={[x0, x1]}
          y={[y0, y1]}
          width={520}
          height={400}
          minHeight={300}
          margin={{ left: 40, bottom: 30, top: 12, right: 14 }}
          ariaLabel={`Latent space of the ${which === 'ae' ? 'plain autoencoder' : 'VAE'}, with training digits placed at their codes`}
          onPointerDown={mode === 'probe' ? ([x, y]) => set('probe')(x, y) : undefined}
        >
          <Grid xTicks={8} yTicks={8} />
          <Rings />
          <Glyphs codes={M_.codes} />
          <Axes xTicks={6} yTicks={6} xLabel="z₁" yLabel="z₂" />
          {mode === 'probe' && <DraggablePoint x={cur.probe[0]} y={cur.probe[1]} onChange={set('probe')} color="var(--viz-ink)" r={8} label="probe" />}
          {mode === 'path' && (
            <>
              <Path points={[cur.a, cur.b]} color="var(--viz-ink)" width={2} dash="5 4" />
              <Dots points={strip.slice(1, -1).map(([x, y]) => ({ x, y, r: 3.5, color: 'var(--viz-ink)' }))} />
              <DraggablePoint x={cur.a[0]} y={cur.a[1]} onChange={set('a')} color="var(--viz-ink)" r={8} label="A" />
              <DraggablePoint x={cur.b[0]} y={cur.b[1]} onChange={set('b')} color="var(--viz-ink)" r={8} label="B" />
            </>
          )}
          {mode === 'sample' && <Dots points={sampleInBox.map(([x, y]) => ({ x, y, r: 6, hollow: true, color: 'var(--viz-ink)' }))} />}
        </Plot>
        {mode === 'probe' && (
          <div style={panel} aria-live="polite">
            <Tiny strong>decoded at the probe</Tiny>
            <DigitImg px={probeImg} size={big} label="image decoded at the probe" outline={`2px solid ${rn.color}`} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: rn.color }}>{rn.text}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <DigitImg px={reals[probeNear.i]} size={36} label="closest real digit" />
              <Tiny>
                closest real digit
                <br />
                distance {probeNear.d.toFixed(3)}
              </Tiny>
            </div>
          </div>
        )}
      </div>
      {mode !== 'probe' && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: 4 }}>
            {mode === 'path' ? 'Decoded along the dashed path, from A to B' : `8 codes drawn from N(0, I), decoded (batch ${seed})`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STRIP}, minmax(0, 1fr))`, gap: 4, maxWidth: 520, margin: '0 auto' }}>
            {stripImgs.map((img, i) => {
              const r = realness(stripNear[i].d)
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 0 }}>
                  <DigitImg px={img} size={narrow ? 36 : 52} label={`decoded image ${i + 1}: ${r.text}`} outline={`2px solid ${r.color}`} />
                  <Tiny color={r.color}>{stripNear[i].d.toFixed(3)}</Tiny>
                </div>
              )
            })}
          </div>
          {mode === 'sample' && which === 'ae' && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', textAlign: 'center', margin: '0.35rem auto 0', maxWidth: '34rem' }}>
              The dashed circles are tiny on this map. N(0, I) only visits its crowded middle, so out come mostly 0s, 2s and 6s, and almost never a 3, 4, 7 or 9.
            </p>
          )}
        </div>
      )}
      <Controls>
        {mode === 'sample' && (
          <Button primary onClick={() => setSeed((s) => s + 1)}>
            Draw 8 new codes
          </Button>
        )}
        <Button onClick={() => setPts((o) => ({ ...o, [which]: START[which] }))}>Reset points</Button>
        <Readout
          items={
            mode === 'probe'
              ? [
                  ['probe z', `(${cur.probe[0].toFixed(1)}, ${cur.probe[1].toFixed(1)})`],
                  ['distance to closest real digit', probeNear.d.toFixed(3)],
                ]
              : [
                  ['average distance to closest real digit', stripMean.toFixed(3)],
                  ['different digits among the 8', String(new Set(stripNear.map((n) => LATENT.labels[n.i])).size)],
                  ['map spans', `z₁ ${x0.toFixed(0)} to ${x1.toFixed(0)}, z₂ ${y0.toFixed(0)} to ${y1.toFixed(0)}`],
                ]
          }
        />
      </Controls>
      <p style={{ fontSize: '0.75rem', color: 'var(--ink-3)', textAlign: 'center', margin: '0.3rem 0 0' }}>
        Distance = mean squared pixel difference to the most similar of the 300 real digits on the map. Below 0.03 counts as realistic (green); above 0.05 as unlike any real digit (red).
      </p>
    </Figure>
  )
}

/** circles of radius 1 and 2 around the origin: where N(0, I) puts most of its samples */
function Rings() {
  const ring = (r: number) => Array.from({ length: 73 }, (_, i) => [r * Math.cos((i / 72) * 2 * Math.PI), r * Math.sin((i / 72) * 2 * Math.PI)] as P)
  return (
    <g>
      <Path points={ring(2)} color="var(--viz-muted)" width={1.5} dash="5 4" fill="color-mix(in srgb, var(--viz-muted) 8%, transparent)" />
      <Path points={ring(1)} color="var(--viz-muted)" width={1.5} dash="5 4" />
    </g>
  )
}

/** each training digit drawn as its own label, coloured by class */
function Glyphs({ codes }: { codes: [number, number][] }) {
  const { xs, ys, clipId } = usePlot()
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {codes.map(([a, b], i) => {
        const lab = LATENT.labels[i]
        return (
          <text key={i} x={xs(a)} y={ys(b)} dy="0.35em" textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: CLS[lab], opacity: 0.85 }}>
            {lab}
          </text>
        )
      })}
    </g>
  )
}
