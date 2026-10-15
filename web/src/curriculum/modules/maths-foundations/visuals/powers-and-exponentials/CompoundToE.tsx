import { useState } from 'react'
import { Figure, Controls, Slider, Plot, Grid, Axes, FnPath, Path, Dots, Label, HLine, useNarrow, M } from '../../../../../kit'

/*
  $1 in a bank that pays 100% interest a year, added n times a year: each time the balance
  grows by 1/n of itself (it is multiplied by 1 + 1/n).
  The money grows in a staircase of n steps; as n grows the staircase smooths into the curve e^t
  and the year-end amount (1 + 1/n)^n creeps up towards e = 2.71828..., but never past it.
*/

const OPTIONS: { n: number; how: string }[] = [
  { n: 1, how: 'once a year' },
  { n: 2, how: 'twice a year' },
  { n: 4, how: 'every quarter' },
  { n: 12, how: 'every month' },
  { n: 52, how: 'every week' },
  { n: 365, how: 'every day' },
  { n: 8760, how: 'every hour' },
  { n: 525600, how: 'every minute' },
]
const E = Math.E
const amount = (n: number) => (1 + 1 / n) ** n
const fmtN = (n: number) => n.toLocaleString('en-GB')
/** the same inside KaTeX, where a bare comma would be followed by a space */
const texN = (n: number) => fmtN(n).replace(/,/g, '{,}')
/** the gap to e: 5 decimals while that is readable, then a power of ten (2.6 × 10⁻⁶) */
function gapTex(g: number) {
  if (g >= 1e-4) return g.toFixed(5)
  const e = Math.floor(Math.log10(g))
  return `${(g / 10 ** e).toFixed(1)} \\times 10^{${e}}`
}

export default function CompoundToE() {
  const [idx, setIdx] = useState(2)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const { n, how } = OPTIONS[idx]
  const end = amount(n)

  // staircase: hold the balance for 1/n of a year, then add interest
  const steps: [number, number][] = []
  if (n <= 400) {
    for (let k = 0; k < n; k++) {
      const v = (1 + 1 / n) ** k
      steps.push([k / n, v], [(k + 1) / n, v])
    }
    steps.push([1, end])
  }

  return (
    <Figure
      title="Compounding more and more often leads to e"
      caption={
        <>
          You put $1 in a bank paying 100% interest a year. If interest is added <M>n</M> times a year, each time <M>{'\\tfrac{1}{n}'}</M> of the current
          balance (so the balance is multiplied by <M>{'1 + \\tfrac{1}{n}'}</M>), you end the year with{' '}
          <M>{'\\left(1 + \\tfrac{1}{n}\\right)^n'}</M> dollars. Slide <M>n</M> up: the staircase gets finer and hugs the smooth curve <M>{'e^t'}</M>, and the
          year-end amount creeps up to <M>{'e \\approx 2.718'}</M> but never passes it.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: 16, alignItems: 'center' }}>
        <Plot x={[0, 1]} y={[0.9, 2.9]} width={400} height={300} minHeight={240} margin={{ left: 44 }} ariaLabel={`Money during one year when interest is added ${n} times`}>
          <Grid xTicks={4} yTicks={4} />
          <Axes xLabel="time (years)" yLabel="money ($)" xTicks={4} yTicks={4} />
          <HLine y={E} color="var(--viz-3)" dash="6 4" width={1.5} />
          <Label x={0.02} y={E} dy={15} color="var(--viz-3)" size={12}>
            e ≈ 2.718
          </Label>
          <FnPath f={(t) => Math.exp(t)} color="var(--viz-3)" width={2} dash="3 4" />
          <Label x={0.62} y={Math.exp(0.62)} dx={-6} dy={-8} anchor="end" color="var(--viz-3)" size={13} weight={700}>
            eᵗ
          </Label>
          {n <= 400 ? <Path points={steps} color="var(--viz-1)" width={2.5} /> : <FnPath f={(t) => (1 + 1 / n) ** (n * t)} color="var(--viz-1)" width={2.5} />}
          <Dots points={[{ x: 1, y: end, color: 'var(--viz-2)', r: 6 }]} />
        </Plot>
        <div role="group" aria-label="Year-end amount for each compounding frequency (press a row to choose it)" style={{ display: 'grid', gap: 2, fontSize: '0.86rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 4.6rem 5.2rem', gap: 6, fontWeight: 700, color: 'var(--ink-3)', fontSize: '0.78rem' }}>
            <span>interest added</span>
            <span style={{ textAlign: 'right' }}>
              n
            </span>
            <span style={{ textAlign: 'right' }}>
              (1 + 1/n)ⁿ
            </span>
          </div>
          {OPTIONS.map((o, i) => (
            <button
              key={o.n}
              type="button"
             
              onClick={() => setIdx(i)}
              aria-pressed={i === idx}
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) 4.6rem 5.2rem',
                gap: 6,
                padding: '3px 6px',
                borderRadius: 6,
                background: i === idx ? 'var(--accent-soft)' : 'transparent',
                color: i === idx ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: i === idx ? 700 : 500,
              }}
            >
              <span>{o.how}</span>
              <span className="tabular" style={{ textAlign: 'right' }}>
                {fmtN(o.n)}
              </span>
              <span className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {amount(o.n).toFixed(5)}
              </span>
            </button>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 5.2rem', gap: 6, padding: '3px 6px', borderTop: '1px dashed var(--rule)', color: 'var(--viz-3)', fontWeight: 700 }}>
            <span>the limit, e</span>
            <span className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
              {E.toFixed(5)}
            </span>
          </div>
        </div>
      </div>
      <Controls>
        <Slider
          label={
            <>
              interest added <b>{how}</b> (<M>{`n = ${texN(n)}`}</M>)
            </>
          }
          value={idx}
          min={0}
          max={OPTIONS.length - 1}
          step={1}
          onChange={setIdx}
          format={() => ''}
        />
      </Controls>
      <div style={{ width: '100%', fontSize: '0.95rem', textAlign: 'center' }} aria-live="polite">
        <M>{`\\left(1 + \\tfrac{1}{${texN(n)}}\\right)^{${texN(n)}} = ${end.toFixed(5)}`}</M>
        <span style={{ color: 'var(--ink-3)' }}>
          {' '}
          · gap to e: <M>{gapTex(E - end)}</M>
        </span>
      </div>
    </Figure>
  )
}
