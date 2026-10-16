import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Axes, Path, Dots, mulberry32, useNarrow } from '../../../../../kit'

/*
  A real (tiny) model: a linear classifier with 48 weights. Weights are drawn from a Laplace-like distribution
  (many small, a few large); 2,000 test inputs x ~ N(0, 1) are labelled by sign(w·x + noise), so the
  full-precision model scores about 94%.
  Quantisation (uniform, min–max): 2^b evenly spaced levels from the smallest to the largest kept weight;
    step Δ = (w_max − w_min)/(2^b − 1), each weight is rounded to the nearest level.
  Pruning: the given fraction of weights with the smallest |w| are set to exactly zero.
  Size counts kept weights × bits, plus a 1-bit-per-weight mask recording which weights were kept when pruning.
*/

const D = 48
const N = 2000
const SIGMA = 1.0
const BITS = [2, 3, 4, 5, 6, 8, 16, 32]

function makeData() {
  const r = mulberry32(7)
  const w: number[] = []
  for (let i = 0; i < D; i++) {
    const s = r() < 0.5 ? 1 : -1
    w.push(s * -Math.log(Math.max(1e-9, r())) * 0.5)
  }
  const gauss = () => {
    const u = Math.max(1e-12, r())
    const v = r()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const X = new Float64Array(N * D)
  const y = new Uint8Array(N)
  for (let n = 0; n < N; n++) {
    let z = 0
    for (let i = 0; i < D; i++) {
      const x = gauss()
      X[n * D + i] = x
      z += w[i] * x
    }
    z += SIGMA * gauss()
    y[n] = z > 0 ? 1 : 0
  }
  return { w, X, y }
}

function compress(w: number[], bits: number, prune: number) {
  const k = Math.round(prune * w.length)
  const sorted = w.map(Math.abs).sort((a, b) => a - b)
  const thr = k > 0 ? sorted[k - 1] : -1
  const keep = w.map((v) => Math.abs(v) > thr)
  const kept = w.filter((_, i) => keep[i])
  if (bits >= 32 || kept.length === 0) return { q: w.map((v, i) => (keep[i] ? v : 0)), keep, levels: [] as number[], step: 0 }
  const lo = Math.min(...kept)
  const hi = Math.max(...kept)
  const L = 2 ** bits - 1
  const step = (hi - lo) / L
  const q = w.map((v, i) => (keep[i] ? lo + Math.round((v - lo) / step) * step : 0))
  const levels = bits <= 4 ? Array.from({ length: L + 1 }, (_, j) => lo + j * step) : []
  return { q, keep, levels, step }
}

function accuracy(q: number[], X: Float64Array, y: Uint8Array) {
  let c = 0
  for (let n = 0; n < N; n++) {
    let z = 0
    for (let i = 0; i < D; i++) z += q[i] * X[n * D + i]
    if ((z > 0 ? 1 : 0) === y[n]) c++
  }
  return c / N
}

export default function CompressionLab() {
  const [bi, setBi] = useState(5) // 8 bits
  const [prune, setPrune] = useState(0)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const { w, X, y } = useMemo(makeData, [])
  const base = useMemo(() => accuracy(w, X, y), [w, X, y])
  const bits = BITS[bi]
  const { q, keep, levels } = useMemo(() => compress(w, bits, prune / 100), [w, bits, prune])
  const acc = useMemo(() => accuracy(q, X, y), [q, X, y])

  const kept = keep.filter(Boolean).length
  const sizeBits = kept * bits + (prune > 0 ? D : 0)
  const fullBits = D * 32
  const err = w.reduce((s, v, i) => s + Math.abs(v - q[i]), 0) / D
  const lo = Math.min(...w)
  const hi = Math.max(...w)
  const resnetMB = (25.6e6 * ((kept / D) * bits + (prune > 0 ? 1 : 0))) / 8 / 1e6

  const accColour = acc >= base - 0.005 ? 'var(--ok)' : acc >= base - 0.03 ? 'var(--warn)' : 'var(--bad)'

  return (
    <Figure
      wide
      title="Squeeze a real model: fewer bits, fewer weights"
      caption={
        <>
          The 48 weights of a linear classifier: hollow circles are the original 32-bit values, filled dots are what the compressed model actually uses. Slide the bits down and watch each
          weight snap to the nearest of 2<sup>b</sup> levels (dashed lines): 8 bits changes nothing you can see, 2 bits wrecks the model. Then prune: the smallest weights go to zero first, so the
          first half can go for a small loss in accuracy. Accuracy is measured live on 2,000 test examples, so differences of a few tenths of a percent are just noise.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <Plot x={[-1, D]} y={[lo - 0.25, hi + 0.25]} width={640} height={260} minHeight={narrow ? 220 : undefined} margin={{ left: 40, right: 10, top: 12, bottom: 28 }} ariaLabel={`The 48 weights, quantised to ${bits} bits with ${prune}% pruned`}>
          {levels.map((v, j) => (
            <Path key={j} points={[[-1, v], [D, v]]} color="var(--viz-2)" width={1} dash="4 4" opacity={0.7} />
          ))}
          <Path points={[[-1, 0], [D, 0]]} color="var(--viz-axis)" width={1} />
          <Axes yTicks={5} hideXTicks />
          {w.map((_, i) => (
            <Path key={`s${i}`} points={[[i, 0], [i, q[i]]]} color={keep[i] ? 'var(--viz-1)' : 'var(--viz-muted)'} width={2} />
          ))}
          <Dots points={w.map((v, i) => ({ x: i, y: v, hollow: true, r: narrow ? 3.2 : 4.5, color: 'var(--viz-muted)' }))} />
          <Dots points={w.map((_, i) => (keep[i] ? { x: i, y: q[i], r: narrow ? 2.6 : 3.5, color: 'var(--viz-1)' } : { x: i, y: 0, r: narrow ? 3 : 4, color: 'var(--viz-neg)', shape: 'cross' as const }))} />
        </Plot>
      </div>
      <Controls>
        <Slider label="bits per weight" value={bi} min={0} max={BITS.length - 1} onChange={setBi} format={(i) => `${BITS[i]}-bit${BITS[i] === 32 ? ' (original)' : ''}`} />
        <Slider label="weights pruned (smallest first)" value={prune} min={0} max={90} step={5} onChange={setPrune} format={(v) => `${v}%`} />
      </Controls>

      <div style={{ width: '100%', display: 'grid', gap: 8 }}>
        {[
          { label: 'model size', value: sizeBits / fullBits, text: `${sizeBits.toLocaleString('en-GB')} bits (${(fullBits / sizeBits).toFixed(1)}× smaller)`, colour: 'var(--viz-5)' },
          { label: 'test accuracy', value: acc, text: `${(acc * 100).toFixed(1)}% (original ${(base * 100).toFixed(1)}%)`, colour: 'var(--viz-3)' },
        ].map((b) => (
          <div key={b.label} style={{ display: 'grid', gap: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0 10px', fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>{b.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: b.label === 'test accuracy' ? accColour : 'var(--ink)' }}>{b.text}</span>
            </div>
            <div style={{ height: 14, borderRadius: 5, background: 'var(--surface-2)', border: '1px solid var(--rule)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(0.5, b.value * 100)}%`, height: '100%', background: `color-mix(in srgb, ${b.label === 'test accuracy' ? accColour : b.colour} 70%, var(--surface))`, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        ))}
      </div>
      <Readout
        items={[
          ['levels', bits >= 32 ? 'all float32 values' : `2${bits <= 9 ? '⁰¹²³⁴⁵⁶⁷⁸⁹'[bits] : '¹⁶'} = ${(2 ** bits).toLocaleString('en-GB')}`],
          ['weights kept', `${kept} of ${D}`],
          ['average change per weight', err.toFixed(3)],
          ['a 25.6M-weight ResNet-50 would be', `${resnetMB >= 10 ? resnetMB.toFixed(0) : resnetMB.toFixed(1)} MB`],
        ]}
      />
      {prune > 0 && (
        <div style={{ width: '100%', fontSize: 12, color: 'var(--ink-3)' }}>With pruning, the size includes a mask of 1 bit per weight recording which weights were kept; at low bit widths that mask is a large share of the model.</div>
      )}
    </Figure>
  )
}
