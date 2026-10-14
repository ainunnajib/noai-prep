import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Plot, Grid, Axes, Arrow, Dots, Bars, M, useNarrow } from '../../../../../kit'
import { normals, cov2, eig2, fmt, type Pt } from './pcaMath'

/*
  The same 40 students, with height recorded in metres, centimetres or millimetres.
  PCA on the raw numbers follows whichever column has the biggest numbers; after standardising
  (z-scores) the answer no longer depends on the units.
*/

type Unit = 'm' | 'cm' | 'mm'
const FACTOR: Record<Unit, number> = { m: 0.01, cm: 1, mm: 10 }

const N = 40
const z = normals(2027, 2 * N)
const HEIGHT_CM = Array.from({ length: N }, (_, i) => 165 + 8 * z[2 * i])
const MASS_KG = HEIGHT_CM.map((h, i) => 57 + 0.5 * (h - 165) + 4.5 * z[2 * i + 1])

function sd(a: number[]) {
  const m = a.reduce((s, v) => s + v, 0) / a.length
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1))
}
function centred(a: number[]) {
  const m = a.reduce((s, v) => s + v, 0) / a.length
  return a.map((v) => v - m)
}

/** a "nice" half-width for a square plot that holds every point */
function niceRange(maxAbs: number) {
  const raw = maxAbs * 1.15
  const p = 10 ** Math.floor(Math.log10(raw))
  for (const k of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (k * p >= raw) return k * p
  return 10 * p
}

const fmtW = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))

export default function StandardiseFirst() {
  const [unit, setUnit] = useState<Unit>('cm')
  const [std, setStd] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const r = useMemo(() => {
    const hRaw = HEIGHT_CM.map((h) => h * FACTOR[unit])
    let h = centred(hRaw)
    let m = centred(MASS_KG)
    if (std) {
      const sh = sd(h)
      const sm = sd(m)
      h = h.map((v) => v / sh)
      m = m.map((v) => v / sm)
    }
    const pts: Pt[] = h.map((v, i) => [v, m[i]])
    const c = cov2(pts)
    const e = eig2(c)
    const R = niceRange(Math.max(...pts.map(([a, b]) => Math.max(Math.abs(a), Math.abs(b)))))
    return { pts, c, e, R }
  }, [unit, std])

  const total = r.c.sxx + r.c.syy
  const share1 = r.e.l1 / total
  const xName = std ? 'height (z-score)' : `height (${unit})`
  const yName = std ? 'mass (z-score)' : 'mass (kg)'
  const L1 = 2 * Math.sqrt(r.e.l1)
  const L2 = 2 * Math.sqrt(Math.max(0, r.e.l2))

  return (
    <Figure
      wide
      title="Change the units, change the answer?"
      caption={
        <>
          The same 40 students every time. With raw numbers, switching height from cm to mm makes its numbers 10 times bigger and its variance 100
          times bigger, so <M>{'\\text{PC1}'}</M> swings to point along height; in metres it swings to mass. Nothing about the students changed!
          Turn on <b>standardise first</b>: every unit choice now gives the same PC1, an equal mix of the two features.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', alignItems: 'center' }}>
        <div style={{ minWidth: 0 }}>
          <Plot
            x={[-r.R, r.R]}
            y={[-r.R, r.R]}
            width={360}
            height={360}
            maxWidth={400}
            margin={{ left: 50, right: 14, top: 14, bottom: 50 }}
            ariaLabel={`Scatter of ${xName} against ${yName}, centred, drawn to the same scale on both axes, with PC1 and PC2 arrows`}
          >
            <Grid xTicks={4} yTicks={4} />
            <Axes xTicks={4} yTicks={4} xLabel={xName} yLabel={yName} />
            <Dots points={r.pts.map(([x, y]) => ({ x, y, color: 'var(--viz-ink)', r: 3.5 }))} />
            <Arrow from={[0, 0]} to={[L1 * r.e.v1[0], L1 * r.e.v1[1]]} color="var(--viz-3)" width={3.5} label="PC1" />
            {L2 > r.R * 0.04 && <Arrow from={[0, 0]} to={[L2 * r.e.v2[0], L2 * r.e.v2[1]]} color="var(--viz-4)" width={3} label="PC2" labelOffset={[-36, -4]} />}
          </Plot>
          <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--ink-3)' }}>Both axes use the same scale, exactly as PCA sees the numbers.</div>
        </div>
        <div style={{ minWidth: 0, display: 'grid', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: 4 }}>Share of the total variance in each column</div>
            <Bars
              data={[
                { label: 'height', value: r.c.sxx / total, color: 'var(--viz-1)' },
                { label: 'mass', value: r.c.syy / total, color: 'var(--viz-2)' },
              ]}
              max={1}
              format={(v) => `${(100 * v).toFixed(v > 0.999 || v < 0.001 ? 2 : 1)}%`}
              ariaLabel="Share of total variance by column"
            />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: 4 }}>PC1 as a recipe of the two columns</div>
            <div style={{ fontSize: '1.05rem' }}>
              <M>{`\\text{PC1} = ${fmtW(r.e.v1[0])}\\,\\text{height} + ${fmtW(r.e.v1[1])}\\,\\text{mass}`}</M>
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--ink-2)' }}>
            {std
              ? 'Standardised: PC1 weighs height and mass equally whatever the units.'
              : unit === 'mm'
                ? 'Height in mm has the biggest numbers, so PC1 is almost pure height.'
                : unit === 'm'
                  ? 'Height in metres has tiny numbers, so PC1 is almost pure mass.'
                  : 'In cm the two columns happen to have similar spreads, so PC1 mixes them.'}
          </div>
        </div>
      </div>
      <Controls>
        <Segmented
          label="height measured in"
          value={unit}
          onChange={setUnit}
          options={[
            { value: 'm', label: 'm' },
            { value: 'cm', label: 'cm' },
            { value: 'mm', label: 'mm' },
          ]}
        />
        <Toggle label="Standardise first" checked={std} onChange={setStd} />
        <Readout items={[['PC1 keeps', `${(100 * share1).toFixed(1)}%`], ['var(height)', fmt(r.c.sxx, r.c.sxx < 0.1 ? 4 : 1)], ['var(mass)', fmt(r.c.syy, 1)]]} />
      </Controls>
    </Figure>
  )
}
