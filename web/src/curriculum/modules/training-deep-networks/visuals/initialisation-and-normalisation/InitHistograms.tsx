import { useMemo, useState } from 'react'
import { Figure, Segmented, Button, Readout, Plot, Axes, Path, Dots, Rect, Label, useContainerWidth, useNarrow, useBump, mulberry32 } from '../../../../../kit'

/*
  A 20-layer network, 64 neurons per layer, no biases, fed 160 random inputs x ~ N(0, 1).
  Every weight is drawn from N(0, σ²) with σ set by the chosen initialisation, and we look at the
  activations BEFORE any training: their size (root-mean-square) at every layer, and their
  histograms at layers 1, 5, 10 and 20.
    zeros: σ = 0      tiny: σ = 0.01      Xavier: σ = √(1/64)      He: σ = √(2/64)      huge: σ = 0.5
*/

const WIDTH = 64
const BATCH = 160
const DEPTH = 20
const SHOW = [1, 5, 10, 20]
type Init = 'zeros' | 'tiny' | 'xavier' | 'he' | 'huge'
type Act = 'tanh' | 'relu'
const SIGMA: Record<Init, number> = { zeros: 0, tiny: 0.01, xavier: Math.sqrt(1 / WIDTH), he: Math.sqrt(2 / WIDTH), huge: 0.5 }
const SIGMA_TEX: Record<Init, string> = { zeros: '0', tiny: '0.01', xavier: '√(1/64) = 0.125', he: '√(2/64) ≈ 0.177', huge: '0.5' }
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const pow10 = (v: number) => (v === 0 ? '1' : `10${String(v).split('').map((c) => SUP[c] ?? c).join('')}`)
const LOG_LO = -6
const LOG_HI = 6

function simulate(init: Init, act: Act, seed: number) {
  const r = mulberry32(seed)
  const g = () => {
    const u = Math.max(r(), 1e-12)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
  }
  let h: Float64Array = new Float64Array(BATCH * WIDTH)
  for (let i = 0; i < h.length; i++) h[i] = g()
  const rms: number[] = []
  const layers: Record<number, Float64Array> = {}
  const s = SIGMA[init]
  for (let l = 1; l <= DEPTH; l++) {
    const W = new Float64Array(WIDTH * WIDTH)
    for (let i = 0; i < W.length; i++) W[i] = s * g()
    const next = new Float64Array(BATCH * WIDTH)
    for (let b = 0; b < BATCH; b++) {
      for (let j = 0; j < WIDTH; j++) {
        let z = 0
        for (let i = 0; i < WIDTH; i++) z += h[b * WIDTH + i] * W[i * WIDTH + j]
        next[b * WIDTH + j] = act === 'tanh' ? Math.tanh(z) : z > 0 ? z : 0
      }
    }
    h = next
    let sq = 0
    for (let i = 0; i < h.length; i++) sq += h[i] * h[i]
    rms.push(Math.sqrt(sq / h.length))
    if (SHOW.includes(l)) layers[l] = h
  }
  return { rms, layers }
}

function Hist({ values, act, layer, rms }: { values: Float64Array; act: Act; layer: number; rms: number }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(300)
  const w = Math.max(150, Math.min(420, measured))
  const hgt = 104
  const pad = { l: 8, r: 8, t: 22, b: 20 }
  const lo = act === 'tanh' ? -1 : 0
  const hi = act === 'tanh' ? 1 : 3
  const bins = 24
  const counts = new Array(bins).fill(0)
  let over = 0
  let zeros = 0
  for (const v of values) {
    if (act === 'relu' && v === 0) {
      zeros++
      continue
    }
    if (v > hi || v < lo) {
      over++
      continue
    }
    counts[Math.min(bins - 1, Math.floor(((v - lo) / (hi - lo)) * bins))]++
  }
  const max = Math.max(1, ...counts, over)
  const X = (v: number) => pad.l + ((v - lo) / (hi - lo)) * (w - pad.l - pad.r - 14)
  const barW = (w - pad.l - pad.r - 14) / bins
  const Hh = (c: number) => (c / max) * (hgt - pad.t - pad.b)
  const n = values.length
  const note = act === 'relu' ? `${Math.round((100 * zeros) / n)}% exactly 0 (not drawn)` : ''
  return (
    <div ref={ref} style={{ minWidth: 0 }}>
      <svg viewBox={`0 0 ${w} ${hgt}`} width="100%" role="img" aria-label={`Histogram of activations at layer ${layer}`} style={{ display: 'block' }}>
        <text x={pad.l} y={13} style={{ fill: 'var(--ink)', fontSize: 12.5, fontWeight: 700 }}>
          layer {layer}
        </text>
        <text x={w - pad.r} y={13} textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 11.5 }}>
          size {rms === 0 ? '0' : rms < 1e-3 || rms > 1e3 ? rms.toExponential(0) : rms.toFixed(2)}
        </text>
        {counts.map((c, i) => (c > 0 ? <rect key={i} x={X(lo) + i * barW + 0.5} y={hgt - pad.b - Hh(c)} width={Math.max(1, barW - 1)} height={Hh(c)} style={{ fill: 'var(--viz-1)', opacity: 0.85 }} /> : null))}
        {over > 0 && <rect x={X(hi) + 3} y={hgt - pad.b - Hh(over)} width={10} height={Hh(over)} style={{ fill: 'var(--viz-neg)' }} />}
        <line x1={pad.l} x2={w - pad.r} y1={hgt - pad.b} y2={hgt - pad.b} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
        {(act === 'tanh' ? [-1, 0, 1] : [0, 1, 2, 3]).map((t) => (
          <text key={t} x={X(t)} y={hgt - 5} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
            {t}
          </text>
        ))}
        {over > 0 && (
          <text x={X(hi) - 2} y={pad.t + 8} textAnchor="end" style={{ fill: 'var(--viz-neg)', fontSize: 11, fontWeight: 700 }}>
            {(100 * over) / n < 1 ? '<1' : Math.round((100 * over) / n)}% off the scale →
          </text>
        )}
        {note && (
          <text x={w - pad.r - 14} y={pad.t + (over > 0 ? 22 : 8)} textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
            {note}
          </text>
        )}
      </svg>
    </div>
  )
}

export default function InitHistograms() {
  const [init, setInit] = useState<Init>('he')
  const [act, setAct] = useState<Act>('relu')
  const [seed, bump] = useBump()
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const sim = useMemo(() => simulate(init, act, 11 + seed * 131), [init, act, seed])
  const pts: [number, number][] = sim.rms.map((v, i) => [i + 1, Math.max(LOG_LO, Math.min(LOG_HI, Math.log10(Math.max(v, 1e-300))))])
  const last = sim.rms[DEPTH - 1]
  const offNote =
    init === 'zeros'
      ? { up: false, text: narrow ? 'exactly 0 everywhere (off a log scale)' : 'exactly 0 at every layer (a log scale cannot show 0)' }
      : last > 10 ** LOG_HI
        ? { up: true, text: narrow ? `↑ ${last.toExponential(0)} by layer ${DEPTH}` : `↑ off the chart: ${last.toExponential(0)} at layer ${DEPTH}` }
        : last < 10 ** LOG_LO
          ? { up: false, text: narrow ? `↓ ${last.toExponential(0)} by layer ${DEPTH}` : `↓ off the chart: ${last.toExponential(0)} at layer ${DEPTH}` }
          : null
  const verdict =
    init === 'zeros'
      ? 'every activation is exactly 0: no signal at all'
      : sim.rms[DEPTH - 1] < 0.01
        ? 'the signal fades away: vanishing activations'
        : sim.rms[DEPTH - 1] > 100
          ? 'the signal blows up: exploding activations'
          : act === 'tanh' && init === 'huge'
            ? 'the signal is stuck at ±1: tanh is saturated'
            : 'the signal stays a healthy size'

  return (
    <Figure
      title="Activations through a 20-layer network, before training"
      caption={
        <>
          Each layer multiplies by random weights with spread σ and applies the activation. The top chart shows the typical size of the
          activations at every layer (log scale: each grid line is 10 times bigger); the shaded band is a healthy size. Try every
          initialisation with <b>ReLU</b>: tiny weights make the signal vanish, huge ones make it explode, Xavier fades steadily (ReLU halves
          the variance at every layer, so by layer 20 the signal is about 1,000 times smaller), and only <b>He</b> keeps it steady. Then switch to <b>tanh</b>: huge weights now pile everything at ±1 (saturation), Xavier fades only slowly,
          and the signal survives all 20 layers.
        </>
      }
    >
      <Segmented
        label="Initialisation"
        value={init}
        onChange={setInit}
        options={[
          { value: 'zeros', label: 'zeros' },
          { value: 'tiny', label: 'tiny' },
          { value: 'xavier', label: 'Xavier' },
          { value: 'he', label: 'He' },
          { value: 'huge', label: 'huge' },
        ]}
      />
      <Segmented
        label="Activation"
        value={act}
        onChange={setAct}
        options={[
          { value: 'relu', label: 'ReLU' },
          { value: 'tanh', label: 'tanh' },
        ]}
      />
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot x={[0.5, DEPTH + 0.5]} y={[LOG_LO, LOG_HI]} width={narrow ? 360 : 520} height={narrow ? 200 : 210} maxWidth={660} minHeight={190} margin={{ left: 48 }} ariaLabel={`Typical activation size at each of ${DEPTH} layers: ${verdict}`}>
          <Rect x0={0.5} x1={DEPTH + 0.5} y0={-1} y1={1} fill="color-mix(in srgb, var(--viz-pos) 14%, transparent)" />
          <Axes xLabel="layer" yLabel="activation size" xTicks={narrow ? 5 : 10} hideYTicks />
          <Axes yTicks={6} hideXTicks tickFormat={pow10} />
          <Path points={pts} color="var(--viz-1)" width={2.6} />
          <Dots points={pts.filter((p) => SHOW.includes(p[0])).map((p) => ({ x: p[0], y: p[1], r: 5, color: 'var(--viz-2)' }))} />
          <Label x={DEPTH + 0.5} y={1} dx={-4} dy={-6} anchor="end" color="var(--viz-pos)" size={11.5}>
            healthy
          </Label>
          {offNote && (
            <Label x={DEPTH + 0.5} y={offNote.up ? LOG_HI : LOG_LO} dx={-4} dy={offNote.up ? 34 : -24} anchor="end" color="var(--viz-neg)" size={11.5} weight={700}>
              {offNote.text}
            </Label>
          )}
        </Plot>
      </div>
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))', gap: '0.5rem 1rem' }}>
        {SHOW.map((l) => (
          <Hist key={`${l}-${init}-${act}-${seed}`} values={sim.layers[l]} act={act} layer={l} rms={sim.rms[l - 1]} />
        ))}
      </div>
      <Readout
        items={[
          ['weights drawn from N(0, σ²) with σ', SIGMA_TEX[init]],
          ['result', verdict],
        ]}
      />
      <Button onClick={bump}>Draw new random weights</Button>
    </Figure>
  )
}
