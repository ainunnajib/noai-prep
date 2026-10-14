import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Rect, HLine, usePlot } from '../../../../../kit'

/*
  Backprop through n layers multiplies one local factor per layer. With the same factor f in
  every layer, the gradient that reaches layer k (counting from the input side) is f^(n − k + 1).
  Bars show it on a log scale (one grid step = ×10), so steady shrinking looks like a straight
  staircase. Below 1 it vanishes, above 1 it explodes, exactly 1 keeps it intact.
*/

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sup = (k: number) => String(k).split('').map((c) => SUP[c] ?? c).join('')

/** 0.000123 → "1.2 × 10⁻⁴"; ordinary numbers stay ordinary */
function sci(v: number): string {
  if (v === 0) return '0'
  if (v >= 0.001 && v < 100000) return v >= 100 ? Math.round(v).toLocaleString('en-GB') : String(Number(v.toPrecision(3)))
  const e = Math.floor(Math.log10(v))
  const m = v / 10 ** e
  return `${m.toFixed(1)} × 10${sup(e)}`
}

const PRESETS = [
  { value: 0.25, label: 'sigmoid at best ×0.25' },
  { value: 0.9, label: '×0.9' },
  { value: 1, label: 'ReLU (active) ×1' },
  { value: 1.5, label: '×1.5' },
]

/** the row of layer boxes along the top of the plot, each showing its factor */
function LayerRow({ n, f, yTop }: { n: number; f: number; yTop: number }) {
  const { xs, ys } = usePlot()
  const cell = Math.abs(xs(1) - xs(0))
  const showText = cell >= 34
  if (cell < 9) return null
  return (
    <g aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const k = i + 1
        const x = xs(k)
        return (
          <g key={k}>
            <rect x={x - cell * 0.44} y={ys(yTop) + 2} width={cell * 0.88} height={22} rx={Math.min(5, cell * 0.2)} style={{ fill: 'var(--surface-2)', stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
            {showText && (
              <text x={x} y={ys(yTop) + 17} textAnchor="middle" className="tabular" style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 700 }}>
                ×{f}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

export default function VanishingProduct() {
  const [fRaw, setF] = useState(0.25)
  const [n, setN] = useState(10)
  const f = Number(fRaw.toFixed(2))

  const lf = Math.log10(f)
  // log10 of the gradient that reaches layer k (k = 1 is the input side): (n − k + 1)·log10 f
  const logs = Array.from({ length: n }, (_, i) => (n - i) * lf)
  const lo = Math.min(0, n * lf)
  const hi = Math.max(0, n * lf)
  const yMin = Math.floor(lo) - 0.6
  const yTop = Math.ceil(hi) + 0.6
  const yMax = yTop + Math.max(1.2, (yTop - yMin) * 0.12)
  const tone = Math.abs(f - 1) < 1e-9 ? 'var(--viz-pos)' : f < 1 ? 'var(--viz-1)' : 'var(--viz-neg)'
  const first = f ** n
  const verdict = Math.abs(f - 1) < 1e-9 ? 'kept intact' : f < 1 ? (first < 1e-3 ? 'vanished' : 'shrinking') : first > 1e3 ? 'exploded' : 'growing'
  const span = yMax - yMin
  const step = span > 24 ? 5 : span > 12 ? 2 : 1
  const xt = n > 15 ? 6 : Math.min(n, 10)

  return (
    <Figure
      title="Multiply one factor per layer"
      caption={
        <>
          Each box is a layer that multiplies the gradient passing back through it by the same factor. The dark line at 10⁰ = 1 is the gradient&apos;s
          size at the output; the bars show its size by the time it reaches each layer, on a <b>log scale</b> (10⁻³ means 0.001), so multiplying by
          the same factor again and again makes a straight staircase. Try the sigmoid&apos;s best case, 0.25, with 10 layers, then 30 layers, then a factor just above 1.
        </>
      }
    >
      <Controls>
        <Segmented label="Per-layer factor" value={PRESETS.some((p) => Math.abs(p.value - f) < 1e-9) ? f : -1} onChange={setF} options={PRESETS} />
      </Controls>
      <Plot
        x={[0.4, n + 0.6]}
        y={[yMin, yMax]}
        width={560}
        height={300}
        minHeight={260}
        maxWidth={720}
        margin={{ left: 54 }}
        ariaLabel={`Gradient size reaching each of ${n} layers when every layer multiplies by ${f}: the first layer gets ${sci(first)}`}
      >
        <Grid xTicks={xt} yTicks={Math.round(span / step)} />
        <Axes xTicks={xt} hideYTicks xLabel="layer (1 = input side)" tickFormat={(v) => (Number.isInteger(v) ? String(v) : '')} />
        <Axes hideXTicks yTicks={Math.round(span / step)} tickFormat={(v) => (Number.isInteger(v) && v <= Math.max(0, Math.ceil(hi)) ? `10${sup(v)}` : '')} />
        <HLine y={0} color="var(--viz-ink)" dash="" width={1.6} />
        {logs.map((v, i) => (
          <Rect key={i} x0={i + 1 - 0.36} x1={i + 1 + 0.36} y0={0} y1={v} fill={tone} opacity={0.85} rx={2} />
        ))}
        <LayerRow n={n} f={f} yTop={yMax - 0.05 * span} />
      </Plot>
      <Controls>
        <Slider label="factor per layer" value={f} min={0.1} max={2} step={0.05} onChange={setF} format={(v) => `×${v.toFixed(2)}`} />
        <Slider label="number of layers" value={n} min={1} max={30} step={1} onChange={setN} />
      </Controls>
      <Readout
        items={[
          ['gradient at layer 1', `${f}${sup(n)} = ${sci(first)}`],
          ['verdict', <span key="v" style={{ color: tone }}>{verdict}</span>],
        ]}
      />
    </Figure>
  )
}
