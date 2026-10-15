import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Axes, Rect, Label, VLine, useNarrow, mulberry32 } from '../../../../../kit'
import { Legend, Note } from './parts'

/*
  Loss scaling as "sliding numbers into range". Top: the positive numbers each format can store, on a
  logarithmic ruler from 10^-46 to 10^40 (FP32, BF16 and FP16; the lighter part of each bar is the
  "subnormal" zone with fewer significant bits). Bottom: a zoom on 10^-12 .. 10^8 with a histogram of
  10,000 gradient values (an illustrative spread, mostly between 10^-9 and 10^-4), multiplied by the
  loss scale S. Every value is rounded exactly as the chosen format would round it.
  Aha: loss scaling just shifts the gradients into the range FP16 can represent.
*/

const N = 10000
const MU = -6.8
const SD = 1.25
const Z0 = -12
const Z1 = 8
const BIN = 0.25

const FP16_SUB = 2 ** -24 // smallest positive FP16 number, about 5.96e-8
const FP16_NORM = 2 ** -14 // smallest normal FP16 number, about 6.1e-5
const FP16_MAX = 65504

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-12)
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** log10 of the 10,000 gradient magnitudes (fixed seed) */
const LOGS: number[] = (() => {
  const r = mulberry32(2024)
  return Array.from({ length: N }, () => MU + SD * gauss(r))
})()

function roundHalfEven(v: number) {
  const f = Math.floor(v)
  const d = v - f
  if (d > 0.5) return f + 1
  if (d < 0.5) return f
  return f % 2 === 0 ? f : f + 1
}

/** round a positive number to the nearest FP16 value (Infinity on overflow) */
function toFP16(v: number) {
  if (v >= 65520) return Infinity
  const e = Math.floor(Math.log2(v))
  const q = e < -14 ? FP16_SUB : 2 ** (e - 10)
  return roundHalfEven(v / q) * q
}

/** round a positive number to the nearest BF16 value (range as FP32, 8 significant bits) */
function toBF16(v: number) {
  const e = Math.floor(Math.log2(v))
  const q = e < -126 ? 2 ** -133 : 2 ** (e - 7)
  return roundHalfEven(v / q) * q
}

type Fmt = 'fp16' | 'bf16'
type Cat = 'lost' | 'sub' | 'ok' | 'inf'

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const pow10 = (v: number) => (Number.isInteger(v) ? (v === 0 ? '1' : `10${String(v).split('').map((ch) => SUP[ch] ?? ch).join('')}`) : '')

const CAT_COLOR: Record<Cat, string> = {
  lost: 'var(--viz-neg)',
  sub: 'var(--viz-6)',
  ok: 'var(--viz-1)',
  inf: 'var(--viz-neg)',
}

const RANGES: { name: string; sub: number; norm: number; max: number; color: string }[] = [
  { name: 'FP32', sub: Math.log10(2 ** -149), norm: Math.log10(2 ** -126), max: Math.log10(3.4028e38), color: 'var(--viz-5)' },
  { name: 'BF16', sub: Math.log10(2 ** -133), norm: Math.log10(2 ** -126), max: Math.log10(3.3895e38), color: 'var(--viz-3)' },
  { name: 'FP16', sub: Math.log10(FP16_SUB), norm: Math.log10(FP16_NORM), max: Math.log10(FP16_MAX), color: 'var(--viz-2)' },
]

const sup2 = (k: number) => `2${String(k).split('').map((ch) => SUP[ch]).join('')}`
const fmtS = (k: number) => `2${String(k).split('').map((ch) => SUP[ch]).join('')} = ${(2 ** k).toLocaleString('en-GB')}`

export default function FloatRangeRuler() {
  const [k, setK] = useState(0)
  const [fmt, setFmt] = useState<Fmt>('fp16')
  const [log, setLog] = useState<string | null>(null)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const shift = k * Math.log10(2)

  const stats = useMemo(() => {
    const S = 2 ** k
    const counts: Record<Cat, number> = { lost: 0, sub: 0, ok: 0, inf: 0 }
    const nb = Math.round((Z1 - Z0) / BIN)
    const bins: Record<Cat, number>[] = Array.from({ length: nb }, () => ({ lost: 0, sub: 0, ok: 0, inf: 0 }))
    let errSum = 0
    let errN = 0
    for (const lg of LOGS) {
      const v = 10 ** lg * S
      const q = fmt === 'fp16' ? toFP16(v) : toBF16(v)
      let cat: Cat
      if (q === Infinity) cat = 'inf'
      else if (q === 0) cat = 'lost'
      else if (fmt === 'fp16' && q < FP16_NORM) cat = 'sub'
      else cat = 'ok'
      counts[cat]++
      if (q !== Infinity) {
        errSum += Math.abs(q - v) / v
        errN++
      }
      const b = Math.floor((lg + shift - Z0) / BIN)
      if (b >= 0 && b < nb) bins[b][cat]++
    }
    return { counts, bins, err: errN ? errSum / errN : NaN }
  }, [k, fmt, shift])

  const maxBin = 900
  const { counts } = stats
  const pct = (n: number) => `${((100 * n) / N).toFixed(n > 0 && n < 10 ? 2 : 1)}%`

  let tone: 'good' | 'bad' | 'warn' | 'plain'
  let msg: string
  if (counts.inf > 0) {
    tone = 'bad'
    msg = `${counts.inf.toLocaleString('en-GB')} gradients overflow to inf. GradScaler spots the inf, skips this optimiser step (the weights are not touched) and halves S.`
  } else if (fmt === 'bf16') {
    tone = 'good'
    msg = `BF16 has FP32's range: nothing underflows or overflows${k === 0 ? ' even without any scaling' : ''}. The price is precision: each value keeps only 2 to 3 significant digits (typical error ${(100 * stats.err).toFixed(2)}%), which training tolerates well.`
  } else if (counts.lost > 0.01 * N) {
    tone = 'bad'
    msg = `${pct(counts.lost)} of the gradients are smaller than FP16's smallest number and become exactly 0, and ${pct(counts.sub)} more are stored with only a few significant bits. Those weights simply stop learning. Slide S up.`
  } else if (counts.lost > 0) {
    tone = 'warn'
    msg = `Better: only ${counts.lost} values are still lost, but ${pct(counts.sub)} sit in the imprecise (subnormal) zone. A bigger S moves them into the full-precision range.`
  } else if (counts.sub > 0.01 * N) {
    tone = 'warn'
    msg = `Nothing is lost any more. ${pct(counts.sub)} of the gradients still sit in the subnormal zone, where they keep fewer significant bits; that is usually tolerable, and a slightly larger S moves them up too. After backward, the scaler divides by S again in FP32.`
  } else {
    tone = 'good'
    msg = `Practically every gradient now fits in FP16's range with full precision (typical rounding error ${(100 * stats.err).toFixed(3)}%). After backward, the scaler divides by S again in FP32, so the update uses the true gradient sizes.`
  }

  const gradScalerStep = () => {
    if (counts.inf > 0) {
      setLog(`overflow, so this step is skipped and S is halved from ${sup2(k)} to ${sup2(k - 1)}.`)
      setK((v) => Math.max(0, v - 1))
    } else {
      setLog(`no inf or NaN, so the step is taken. After 2000 such steps in a row, S doubles to ${sup2(k + 1)}.`)
      setK((v) => Math.min(32, v + 1))
    }
  }

  const W = narrow ? 360 : 600
  const zone = (x0: number, x1: number, color: string, key: string) => <Rect key={key} x0={x0} x1={x1} y0={0} y1={maxBin} fill={`color-mix(in srgb, ${color} 13%, transparent)`} />
  const L16 = Math.log10(FP16_SUB)
  const N16 = Math.log10(FP16_NORM)
  const M16 = Math.log10(FP16_MAX)

  return (
    <Figure
      title="Loss scaling: slide the gradients into FP16's range"
      caption={
        <>
          Top: the positive numbers each format can store, on a ruler where every step is a factor of 10. FP16's range is a narrow strip.
          Bottom: 10,000 gradient values from one backward pass (an illustrative spread), multiplied by the loss scale <b>S</b> and rounded exactly
          as the chosen format rounds them. Start at S = 1 in FP16, then slide S up until no red is left; push it too far and they overflow. Press{' '}
          <b>Let GradScaler adjust</b> to apply its rule one step at a time, or switch to <b>BF16</b>.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.55rem', justifyItems: 'center' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>Positive numbers each format can store</div>
        <Plot x={[-46, 40]} y={[0, 3]} width={W} height={narrow ? 120 : 130} minHeight={112} maxWidth={720} margin={{ left: 48, right: 14, top: 8, bottom: 26 }} ariaLabel="FP32 and BF16 store numbers from about 10 to the minus 45 (or minus 40) up to 3.4 times 10 to the 38. FP16 stores only from about 6 times 10 to the minus 8 up to 65,504.">
          <Rect x0={Z0} x1={Z1} y0={0} y1={3} fill="color-mix(in srgb, var(--highlight) 22%, transparent)" />
          <Axes xTicks={5} hideYTicks tickFormat={pow10} />
          {RANGES.map((r, i) => {
            const y = 2.5 - i
            return (
              <g key={r.name}>
                <Rect x0={r.sub} x1={r.norm} y0={y - 0.27} y1={y + 0.27} fill={`color-mix(in srgb, ${r.color} 35%, transparent)`} rx={3} />
                <Rect x0={r.norm} x1={r.max} y0={y - 0.27} y1={y + 0.27} fill={r.color} rx={3} />
                <Label x={-46} y={y} dx={-6} dy={4} anchor="end" size={12} weight={700} color="var(--viz-ink)">
                  {r.name}
                </Label>
              </g>
            )
          })}
          <Label x={Z1} y={0.5} dx={5} dy={4} size={11} color="var(--ink-2)">
            {narrow ? 'zoom ↓' : '← zoomed below'}
          </Label>
        </Plot>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>
          Zoom: 10,000 gradients × S, stored in {fmt === 'fp16' ? 'FP16' : 'BF16'}
        </div>
        <Plot x={[Z0, Z1]} y={[0, maxBin]} width={W} height={narrow ? 200 : 210} minHeight={180} maxWidth={720} margin={{ left: 14, right: 14, top: 22, bottom: 30 }} ariaLabel={`Histogram of gradient sizes times ${2 ** k}. ${counts.lost} become zero, ${counts.sub} are imprecise, ${counts.inf} overflow.`}>
          {fmt === 'fp16' ? (
            <>
              {zone(Z0, L16, 'var(--viz-neg)', 'z0')}
              {zone(L16, N16, 'var(--viz-6)', 'z1')}
              {zone(N16, M16, 'var(--viz-pos)', 'z2')}
              {zone(M16, Z1, 'var(--viz-neg)', 'z3')}
              <VLine x={L16} color="var(--viz-neg)" dash="3 3" width={1.2} />
              <VLine x={M16} color="var(--viz-neg)" dash="3 3" width={1.2} />
              <Label x={(Z0 + L16) / 2} y={maxBin} dy={-8} anchor="middle" size={11.5} weight={700} color="var(--viz-neg)">
                → 0
              </Label>
              <Label x={(N16 + M16) / 2} y={maxBin} dy={-8} anchor="middle" size={11.5} weight={700} color="var(--viz-pos)">
                full precision
              </Label>
              <Label x={(M16 + Z1) / 2} y={maxBin} dy={-8} anchor="middle" size={11.5} weight={700} color="var(--viz-neg)">
                → inf
              </Label>
            </>
          ) : (
            <>
              {zone(Z0, Z1, 'var(--viz-pos)', 'zb')}
              <Label x={(Z0 + Z1) / 2} y={maxBin} dy={-8} anchor="middle" size={11.5} weight={700} color="var(--viz-pos)">
                all inside BF16&apos;s range
              </Label>
            </>
          )}
          <Axes xTicks={narrow ? 5 : 10} hideYTicks tickFormat={pow10} />
          {stats.bins.map((b, i) => {
            const x0 = Z0 + i * BIN
            let y = 0
            return (['lost', 'sub', 'ok', 'inf'] as Cat[]).map((c) => {
              if (!b[c]) return null
              const y0 = y
              y += b[c]
              return <Rect key={`${i}${c}`} x0={x0 + 0.02} x1={x0 + BIN - 0.02} y0={y0} y1={y} fill={CAT_COLOR[c]} />
            })
          })}
        </Plot>
        <Legend
          items={[
            { color: 'var(--viz-1)', label: 'stored with full precision', dot: true },
            ...(fmt === 'fp16' ? [{ color: 'var(--viz-6)', label: 'subnormal: few significant bits', dot: true }] : []),
            { color: 'var(--viz-neg)', label: fmt === 'fp16' ? 'lost: becomes 0 or inf' : 'overflow to inf', dot: true },
          ]}
        />
        <Note tone={tone}>
          {msg}
          {log && <div style={{ marginTop: 4, color: 'var(--ink-2)' }}>GradScaler: {log}</div>}
        </Note>
      </div>
      <Controls>
        <Segmented
          label="Store gradients in"
          value={fmt}
          onChange={(v) => {
            setFmt(v)
            setLog(null)
          }}
          options={[
            { value: 'fp16', label: 'FP16' },
            { value: 'bf16', label: 'BF16' },
          ]}
        />
        <Slider
          label="Loss scale S"
          value={k}
          min={0}
          max={32}
          step={1}
          onChange={(v) => {
            setK(v)
            setLog(null)
          }}
          format={fmtS}
        />
        <Button onClick={gradScalerStep}>Let GradScaler adjust</Button>
        <Readout
          items={[
            ['become 0', pct(counts.lost)],
            ...(fmt === 'fp16' ? ([['imprecise', pct(counts.sub)]] as [string, string][]) : []),
            ['overflow to inf', pct(counts.inf)],
            ['typical rounding error', Number.isFinite(stats.err) ? `${(100 * stats.err).toFixed(stats.err < 0.01 ? 3 : 1)}%` : '—'],
          ]}
        />
      </Controls>
    </Figure>
  )
}
