import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, FnPath, Path, VLine, DraggablePoint, usePlot, useNarrow, M } from '../../../../../kit'
import { normalPdf, normalCdf, fmt } from './stats'

/*
  The normal curve for Sec 3 heights. Sliders set μ and σ; a shaded band shows the 68-95-99.7
  rule (or the area below x); the orange point x can be dragged along the axis and its z-score
  and percentile update. Under the cm axis a second ruler counts σ-steps from μ (the z scale):
  it slides and stretches with the curve, which is the whole idea of standardisation.
  The x-range covers μ ± 3σ for every slider setting, so no band is ever cut off. The shaded
  percentage sits in the top corner away from x, and the x label is placed above the curve on the
  side with room, so the labels never collide.
*/

type Shade = '1' | '2' | '3' | 'below'
const X0 = 100
const X1 = 220
const Y_TOP = 0.086
const WITHIN: Record<'1' | '2' | '3', number> = { '1': 68.27, '2': 95.45, '3': 99.73 }

/** the z ruler: drawn under the cm axis in plot pixels */
function ZRuler({ mu, sigma }: { mu: number; sigma: number }) {
  const { xs, ys } = usePlot()
  const y = ys(0) + 44
  const ks = [-3, -2, -1, 0, 1, 2, 3].filter((k) => mu + k * sigma >= X0 && mu + k * sigma <= X1)
  const a = xs(Math.max(X0, mu - 3 * sigma))
  const b = xs(Math.min(X1, mu + 3 * sigma))
  // on a phone with a small σ the ticks are close together: then label only −2, 0 and +2
  const sparse = xs(mu + sigma) - xs(mu) < 22
  return (
    <g aria-hidden="true">
      <line x1={a} x2={b} y1={y} y2={y} style={{ stroke: 'var(--viz-5)', strokeWidth: 2 }} />
      {ks.map((k) => (
        <g key={k} transform={`translate(${xs(mu + k * sigma)},${y})`}>
          <line y1={-5} y2={5} style={{ stroke: 'var(--viz-5)', strokeWidth: 2 }} />
          {(!sparse || k % 2 === 0) && (
            <text y={18} textAnchor="middle" style={{ fill: 'var(--viz-5)', fontSize: 12, fontWeight: 700 }}>
              {k > 0 ? `+${k}` : k < 0 ? `−${-k}` : '0'}
            </text>
          )}
        </g>
      ))}
      <text x={a - 10} y={y + 4} textAnchor="end" style={{ fill: 'var(--viz-5)', fontSize: 13, fontWeight: 700 }}>
        z
      </text>
    </g>
  )
}

/** area under the curve between a and b, as a closed polygon */
function areaPoints(mu: number, sigma: number, a: number, b: number): [number, number][] {
  const lo = Math.max(X0, a)
  const hi = Math.min(X1, b)
  if (hi <= lo) return []
  const n = 80
  const pts: [number, number][] = [[lo, 0]]
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n
    pts.push([x, normalPdf(x, mu, sigma)])
  }
  pts.push([hi, 0])
  return pts
}

/** percentage with one decimal, without claiming 0% or 100% for tails that are merely tiny */
const pct = (p: number) => (p > 99.95 ? '> 99.9%' : p < 0.05 ? '< 0.1%' : `${p.toFixed(1)}%`)

/** rough width of a bold 13px label, in px */
const textW = (t: string) => t.length * 7.3

/**
 * The orange x label sits above the curve. It prefers the side away from μ (where the curve
 * falls away), flips if it would leave the plot, and rises above the highest point of the curve
 * underneath it. The μ label is hidden when the x label would cover it.
 */
function XAndMuLabels({ x, mu, sigma, text }: { x: number; mu: number; sigma: number; text: string }) {
  const { xs, ys } = usePlot()
  const [left, right] = xs.range()
  const top = ys.range()[1]
  const w = textW(text)
  const px = xs(x)
  let side = x >= mu ? 1 : -1
  if (side === 1 && px + 8 + w > right) side = -1
  else if (side === -1 && px - 8 - w < left) side = 1
  const boxL = side === 1 ? px + 8 : px - 8 - w
  let high = normalPdf(x, mu, sigma)
  for (let i = 0; i <= 24; i++) high = Math.max(high, normalPdf(xs.invert(boxL + (w * i) / 24), mu, sigma))
  const y = Math.max(top + 12, ys(high) - 8)
  const peakY = ys(normalPdf(mu, mu, sigma)) - 6
  const muPx = xs(mu)
  const muHidden = muPx > boxL - 10 && muPx < boxL + w + 10 && Math.abs(peakY - y) < 16
  return (
    <>
      {!muHidden && (
        <text x={muPx} y={peakY} textAnchor="middle" className="plot-label" style={{ fontSize: 12 }}>
          μ
        </text>
      )}
      <text x={side === 1 ? px + 8 : px - 8} y={y} textAnchor={side === 1 ? 'start' : 'end'} className="plot-label" style={{ fill: 'var(--viz-2)', fontWeight: 700 }}>
        {text}
      </text>
    </>
  )
}

/** the shaded percentage, pinned in a top corner of the plot (the one away from x) */
function CornerLabel({ corner, big, small }: { corner: 'left' | 'right'; big: string; small: string }) {
  const { xs, ys } = usePlot()
  const [left, right] = xs.range()
  const top = ys.range()[1]
  const tx = corner === 'left' ? left + 6 : right - 6
  const anchor = corner === 'left' ? 'start' : 'end'
  return (
    <g>
      <text x={tx} y={top + 14} textAnchor={anchor} className="plot-label" style={{ fontSize: 15, fontWeight: 800 }}>
        {big}
      </text>
      <text x={tx} y={top + 30} textAnchor={anchor} className="plot-label" style={{ fontSize: 12, fill: 'var(--ink-2)' }}>
        {small}
      </text>
    </g>
  )
}

export default function NormalExplorer() {
  const [mu, setMu] = useState(160)
  const [sigma, setSigma] = useState(8)
  const [x, setX] = useState(176)
  const [shade, setShade] = useState<Shade>('1')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(480)

  const z = (x - mu) / sigma
  const below = normalCdf(z) * 100
  const peak = normalPdf(mu, mu, sigma)
  const k = shade === 'below' ? 0 : Number(shade)
  const band = shade === 'below' ? areaPoints(mu, sigma, X0, x) : areaPoints(mu, sigma, mu - k * sigma, mu + k * sigma)
  const bandColour = shade === 'below' ? 'var(--viz-2)' : 'var(--viz-1)'
  const fx = normalPdf(x, mu, sigma)

  return (
    <Figure
      title="The normal curve: heights of Sec 3 students"
      caption={
        <>
          Drag the orange point <M>x</M> along the axis and read off its z-score. Then change <M>{'\\mu'}</M> and <M>{'\\sigma'}</M>: the purple{' '}
          <b>z ruler</b> under the axis slides and stretches with the curve, because <M>z</M> counts steps of <M>{'\\sigma'}</M> away from{' '}
          <M>{'\\mu'}</M>. However you set them, the same bands hold 68%, 95% and 99.7% of the area. A student at <M>{'z = 2'}</M> is taller than
          97.7% of the cohort, which the 68-95-99.7 rule rounds to about 97.5%.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
      <Plot
        x={[X0, X1]}
        y={[0, Y_TOP]}
        width={560}
        height={300}
        maxWidth={680}
        minHeight={310}
        margin={{ left: 26, right: 18, bottom: 72, top: 16 }}
        ariaLabel={`Normal curve with mean ${mu} cm and standard deviation ${sigma} cm; x = ${fmt(x, 1)} cm has z = ${z.toFixed(2)}`}
      >
        <Grid xTicks={narrow ? 4 : 8} yTicks={0} />
        <Axes xLabel="height (cm)" xTicks={narrow ? 4 : 8} yTicks={0} hideYTicks />
        {band.length > 0 && <Path points={band} closed color="none" fill={`color-mix(in srgb, ${bandColour} 26%, transparent)`} />}
        {shade !== 'below' &&
          [1, 2, 3].map((j) => (
            <g key={j}>
              <VLine x={mu - j * sigma} color="var(--viz-muted)" dash="3 4" width={1.2} />
              <VLine x={mu + j * sigma} color="var(--viz-muted)" dash="3 4" width={1.2} />
            </g>
          ))}
        <VLine x={mu} color="var(--viz-ink)" dash="2 3" width={1.4} />
        <FnPath f={(t) => normalPdf(t, mu, sigma)} color="var(--viz-1)" width={3} samples={300} />
        {shade !== 'below' && (
          <>
            <Path
              points={[
                [Math.max(X0, mu - k * sigma), peak * 0.3],
                [Math.min(X1, mu + k * sigma), peak * 0.3],
              ]}
              color="var(--viz-1)"
              width={1.6}
            />
          </>
        )}
        <CornerLabel
          corner={x < mu ? 'right' : 'left'}
          big={shade === 'below' ? pct(below) : `${WITHIN[shade]}%`}
          small={shade === 'below' ? 'below x' : `within ±${k}σ`}
        />
        <Path
          points={[
            [x, 0],
            [x, fx],
          ]}
          color="var(--viz-2)"
          width={2.5}
        />
        <XAndMuLabels x={x} mu={mu} sigma={sigma} text={`x = ${fmt(x, 1)}, z = ${fmt(z, 2).replace('-', '−')}`} />
        <ZRuler mu={mu} sigma={sigma} />
        <DraggablePoint x={x} y={0} lockY color="var(--viz-2)" r={8} constrain={(nx) => [Math.round(nx * 2) / 2, 0]} onChange={(nx) => setX(nx)} />
      </Plot>
      </div>
      <Controls>
        <Slider label={<>mean μ (cm)</>} value={mu} min={145} max={175} step={1} onChange={setMu} />
        <Slider label={<>standard deviation σ (cm)</>} value={sigma} min={5} max={12} step={0.5} onChange={setSigma} />
        <Segmented
          label="shade"
          value={shade}
          onChange={setShade}
          options={[
            { value: '1', label: '±1σ' },
            { value: '2', label: '±2σ' },
            { value: '3', label: '±3σ' },
            { value: 'below', label: 'below x' },
          ]}
        />
      </Controls>
      <Readout
        items={[
          ['x', `${fmt(x, 1)} cm`],
          ['z = (x − μ)/σ', `(${fmt(x, 1)} − ${mu})/${fmt(sigma, 1)} = ${z.toFixed(2)}`],
          ['shorter than x', pct(below)],
        ]}
      />
    </Figure>
  )
}
