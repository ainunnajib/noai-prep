import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, M, mulberry32, useNarrow } from '../../../../../kit'

/*
  A toy generator G that turns 4 random numbers z ~ N(0, 1) into a slice of kaya toast:
     features = sigmoid(W z + b)          (4 numbers between 0 and 1)
     picture  = draw(features)            (toastiness, kaya spread, butter size, dome of the loaf)
  W was set by hand (mostly diagonal, with a little mixing, as in real generators where one noise number
  rarely controls exactly one feature). A real generator learns millions of such weights from data.
*/

const W = [
  [1.2, 0, 0, 0.35],
  [0, 1.2, 0.3, 0],
  [0.3, 0, 1.2, 0],
  [0, -0.3, 0, 1.2],
]
const FEATURES = ['toastiness', 'kaya spread', 'butter size', 'loaf dome']
const N = 12
const sigmoid = (v: number) => 1 / (1 + Math.exp(-v))

function noiseBatch(seed: number): number[][] {
  const rng = mulberry32(seed * 7919 + 17)
  const normal = () => {
    const u = Math.max(1e-12, rng())
    const v = rng()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  return Array.from({ length: N }, () => [normal(), normal(), normal(), normal()].map((v) => Math.round(v * 100) / 100))
}

function generate(z: number[]): number[] {
  return W.map((row) => sigmoid(row.reduce((s, w, j) => s + w * z[j], 0)))
}

/** draws one slice of kaya toast, front view, in a 100 x 100 box */
function Toast({ f, size, label }: { f: number[]; size: number; label: string }) {
  const [toast, kaya, butter, dome] = f
  const Wd = 62 + 8 * dome
  const L = 50 - Wd / 2
  const R = 50 + Wd / 2
  const top = 50
  const H = 8 + 26 * dome
  const o = 2 + 6 * dome
  const bread = `M${L},88 Q${L},94 ${L + 6},94 H${R - 6} Q${R},94 ${R},88 V${top} C${R + o},${top - 0.55 * H} ${R - 0.22 * Wd},${top - H} 50,${top - H} C${L + 0.22 * Wd},${top - H} ${L - o},${top - 0.55 * H} ${L},${top} Z`
  // kaya: an inset blob whose margin shrinks as the spread grows
  const m = 17 - 12 * kaya
  // keep the top of the kaya above the crust's shoulders, so it never dips into a notch
  const kTop = Math.min(top - 3, top - H + m + 2)
  const kaya_d = `M${L + m},${88 - m * 0.6} V${top} C${L + m - 1},${kTop + 0.35 * (top - kTop)} ${50 - 0.22 * Wd},${kTop} 50,${kTop} C${50 + 0.22 * Wd},${kTop} ${R - m + 1},${kTop + 0.35 * (top - kTop)} ${R - m},${top} V${88 - m * 0.6} Q${R - m},${94 - m} ${R - m - 6},${94 - m} H${L + m + 6} Q${L + m},${94 - m} ${L + m},${88 - m * 0.6} Z`
  const bw = 10 + 26 * butter
  const bh = 6 + 9 * butter
  const by = (top + 88) / 2 - 4
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label} style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}>
      <path
        d={bread}
        style={{
          fill: `color-mix(in srgb, color-mix(in srgb, var(--viz-2) 60%, var(--viz-6)) ${Math.round(12 + 58 * toast)}%, var(--surface))`,
          stroke: `color-mix(in srgb, var(--viz-6) ${Math.round(55 + 40 * toast)}%, var(--viz-2))`,
          strokeWidth: 4,
          strokeLinejoin: 'round',
        }}
      />
      <path d={kaya_d} style={{ fill: 'color-mix(in srgb, var(--viz-3) 55%, var(--viz-6))', opacity: 0.85 }} />
      <rect x={50 - bw / 2} y={by - bh / 2} width={bw} height={bh} rx={1.5} style={{ fill: 'var(--highlight)', stroke: 'color-mix(in srgb, var(--highlight) 55%, var(--viz-ink))', strokeWidth: 1 }} />
    </svg>
  )
}

const panel: CSSProperties = { minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }
const small: CSSProperties = { fontSize: '0.8125rem', color: 'var(--ink-2)', textAlign: 'center', fontWeight: 600 }

/** four horizontal bars for z1..z4 on a -3..3 scale */
function NoiseBars({ z, active }: { z: number[]; active: number }) {
  const w = 230
  const rowH = 26
  const x0 = 34
  const x1 = w - 40
  const sx = (v: number) => x0 + ((v + 3) / 6) * (x1 - x0)
  return (
    <svg viewBox={`0 0 ${w} ${rowH * 4 + 14}`} style={{ width: '100%', maxWidth: 260, display: 'block' }} role="img" aria-label={`Noise vector z = ${z.map((v) => v.toFixed(2)).join(', ')}`}>
      <line x1={sx(0)} x2={sx(0)} y1={2} y2={rowH * 4 + 2} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
      {z.map((v, i) => {
        const y = 4 + i * rowH
        const cl = Math.max(-3, Math.min(3, v))
        return (
          <g key={i}>
            <text x={4} y={y + 13} style={{ fontSize: 13, fill: 'var(--ink-2)', fontWeight: i === active ? 700 : 400 }}>
              z{['₁', '₂', '₃', '₄'][i]}
            </text>
            <rect x={x0} y={y + 3} width={x1 - x0} height={14} rx={3} style={{ fill: 'var(--surface-2)' }} />
            <rect
              x={Math.min(sx(0), sx(cl))}
              y={y + 3}
              width={Math.abs(sx(cl) - sx(0))}
              height={14}
              rx={2}
              style={{ fill: i === active ? 'var(--viz-5)' : 'color-mix(in srgb, var(--viz-5) 55%, var(--surface))' }}
            />
            <text x={w - 2} y={y + 14} textAnchor="end" className="tabular" style={{ fontSize: 12.5, fill: 'var(--ink)' }}>
              {v.toFixed(2)}
            </text>
          </g>
        )
      })}
      <text x={sx(-3)} y={rowH * 4 + 13} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ink-3)' }}>
        −3
      </text>
      <text x={sx(0)} y={rowH * 4 + 13} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ink-3)' }}>
        0
      </text>
      <text x={sx(3)} y={rowH * 4 + 13} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ink-3)' }}>
        3
      </text>
    </svg>
  )
}

export default function NoiseToSample() {
  const [seed, setSeed] = useState(1)
  const [edits, setEdits] = useState<Record<string, number>>({})
  const [sel, setSel] = useState(0)
  const [dim, setDim] = useState(0)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const base = useMemo(() => noiseBatch(seed), [seed])
  const zs = base.map((z, i) => z.map((v, j) => edits[`${i}-${j}`] ?? v))
  const z = zs[sel]
  const f = generate(z)

  const reseed = (s: number) => {
    setSeed(s)
    setEdits({})
  }
  const nudge = (v: number) => setEdits((e) => ({ ...e, [`${sel}-${dim}`]: v }))

  return (
    <Figure
      wide
      title="Noise in, toast out"
      caption={
        <>
          Each slice starts as four random numbers <M>{'z = (z_1, z_2, z_3, z_4)'}</M>, drawn from a standard normal distribution. A fixed generator <M>{'G'}</M> turns
          them into a picture. Click a slice, pick one noise number and slide it: the toast changes <i>smoothly</i>. Which number mostly controls the butter? Then press{' '}
          <b>New seed</b> for a fresh batch, and <b>Seed 1 again</b> to see that the same seed always gives exactly the same toast.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: narrow ? '0.4rem' : '1rem', alignItems: 'center' }}>
        <div style={panel}>
          <div style={small}>Random noise z (slice {sel + 1})</div>
          <NoiseBars z={z} active={dim} />
        </div>
        <div style={{ ...small, fontSize: '0.9375rem', color: 'var(--ink)' }} aria-hidden="true">
          {narrow ? '↓ generator G ↓' : '→ G →'}
        </div>
        <div style={panel}>
          <div style={small}>G(z): a new slice</div>
          <Toast f={f} size={150} label={`Generated toast: ${FEATURES.map((n, i) => `${n} ${Math.round(100 * f[i])}%`).join(', ')}`} />
        </div>
      </div>
      <div style={{ ...small, marginTop: '0.6rem' }}>
        Seed {seed}: twelve noise vectors, twelve slices (click one)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${narrow ? 4 : 6}, minmax(0, 1fr))`, gap: 6, width: '100%', maxWidth: 560, margin: '0.25rem auto 0' }}>
        {zs.map((zz, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSel(i)}
            aria-pressed={i === sel}
            aria-label={`Slice ${i + 1}`}
            style={{
              padding: 2,
              borderRadius: 8,
              border: i === sel ? '2px solid var(--viz-5)' : '1px solid var(--rule)',
              background: i === sel ? 'color-mix(in srgb, var(--viz-5) 10%, var(--surface))' : 'var(--surface)',
              cursor: 'pointer',
              minWidth: 0,
            }}
          >
            <Toast f={generate(zz)} size={72} label={`Slice ${i + 1}`} />
          </button>
        ))}
      </div>
      <Controls>
        <Segmented
          label="Nudge"
          value={dim}
          onChange={setDim}
          options={[0, 1, 2, 3].map((j) => ({ value: j, label: <M>{`z_${j + 1}`}</M> }))}
        />
        <Slider label={<>value of <M>{`z_${dim + 1}`}</M></>} value={z[dim]} min={-3} max={3} step={0.05} onChange={nudge} format={(v) => v.toFixed(2)} />
        <Button primary onClick={() => reseed(seed + 1)}>
          New seed
        </Button>
        <Button onClick={() => reseed(1)} disabled={seed === 1 && Object.keys(edits).length === 0}>
          Seed 1 again
        </Button>
        <Readout items={FEATURES.map((n, i) => [n, `${Math.round(100 * f[i])}%`] as [string, string])} />
      </Controls>
    </Figure>
  )
}
