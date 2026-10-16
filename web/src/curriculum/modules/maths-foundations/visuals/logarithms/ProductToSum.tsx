import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Slider, Plot, Grid, Axes, FnPath, Rect, VLine, Dots, Label, DraggablePoint, M } from '../../../../../kit'

/*
  Multiply k probabilities, each equal to p. The true product p^k quickly becomes smaller than the
  smallest number a float can hold, and is then stored as exactly 0 (underflow). The sum of the logs,
  k·ln p, is the log of the same product, and it stays an ordinary number.
  float32: smallest positive ≈ 1.4e-45 (PyTorch's default). float64: ≈ 4.9e-324 (Python and NumPy's default).
*/

type Prec = 'f32' | 'f64'
const KMAX = 1200

const tick = (v: number) => String(Math.round(v * 100) / 100)
const stored = (p: number, k: number, prec: Prec) => (prec === 'f32' ? Math.fround(p ** k) : p ** k)

function sci(log10v: number) {
  const e = Math.floor(log10v)
  let m = 10 ** (log10v - e)
  let ee = e
  if (Number(m.toFixed(2)) >= 10) {
    m /= 10
    ee += 1
  }
  if (ee >= -3) return (10 ** log10v).toPrecision(3)
  return `${m.toFixed(2)} \\times 10^{${ee}}`
}

const tile: CSSProperties = {
  display: 'inline-grid',
  placeItems: 'center',
  minWidth: '2.6rem',
  height: '2rem',
  padding: '0 0.3rem',
  borderRadius: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: 'var(--ink)',
  background: 'color-mix(in srgb, var(--viz-1) 16%, var(--surface))',
  border: '1.5px solid color-mix(in srgb, var(--viz-1) 45%, var(--surface))',
}
const panelTitle: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }

export default function ProductToSum() {
  const [p, setP] = useState(0.9)
  const [k, setK] = useState(1000)
  const [prec, setPrec] = useState<Prec>('f32')

  const lnp = Math.log(p)
  const logSum = k * lnp
  const trueLog10 = k * Math.log10(p)
  const s = stored(p, k, prec)
  // first k at which the stored product becomes exactly 0
  let under: number | null = null
  for (let j = 1; j <= KMAX; j++) {
    if (stored(p, j, prec) === 0) {
      under = j
      break
    }
  }
  // where would it underflow, even beyond the plot?
  const limitLog = prec === 'f32' ? -150 * Math.LN2 : -1075 * Math.LN2
  const farUnder = Math.ceil(limitLog / lnp)
  const yMin = KMAX * lnp * 1.08
  const precName = prec === 'f32' ? 'float32' : 'float64'
  const shownTiles = Math.min(k, 5)

  return (
    <Figure
      title="Multiply probabilities, or add their logs?"
      caption={
        <>
          Slide <strong>k</strong> (or drag the orange point) to multiply more and more probabilities. The product (top) sinks so fast that it looks
          like 0 after a few dozen tiles, and past the red line the computer <em>stores</em> it as exactly 0: every model would look equally
          impossible. The sum of the logs (bottom) is the log of the same product, and it just walks down a straight line,{' '}
          <M>{'k \\times \\ln p'}</M>. Switch to float64 to see that more precise numbers only delay the problem.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.95rem', color: 'var(--ink-2)' }} aria-label={`${k} tiles, each with probability ${p}`}>
        {Array.from({ length: shownTiles }).map((_, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            {i > 0 && <span aria-hidden="true">×</span>}
            <span style={tile}>{p.toFixed(2)}</span>
          </span>
        ))}
        {k > shownTiles && (
          <span aria-hidden="true" style={{ fontWeight: 700 }}>
            × … ×
          </span>
        )}
        {k > shownTiles && <span style={tile}>{p.toFixed(2)}</span>}
        <span style={{ marginLeft: '0.3rem', fontWeight: 700, color: 'var(--ink)' }}>({k.toLocaleString('en-GB')} tiles)</span>
      </div>

      <div style={panelTitle}>
        The product <M>{`${p.toFixed(2)}^{k}`}</M>, as the computer stores it in {precName}
      </div>
      <Plot x={[0, KMAX]} y={[0, 1.05]} width={560} height={170} minHeight={165} margin={{ left: 46, right: 18 }} ariaLabel={`Running product of ${p} falls towards 0; in ${precName} it is stored as exactly 0 from ${under ?? 'beyond'} tiles.`}>
        {under !== null && <Rect x0={under} x1={KMAX} y0={0} y1={1.05} fill="color-mix(in srgb, var(--viz-neg) 13%, transparent)" />}
        <Grid xTicks={6} yTicks={4} />
        <Axes xTicks={6} yTicks={4} xLabel="k tiles" tickFormat={tick} />
        <FnPath f={(x) => (x < 0.5 ? 1 : stored(p, x, prec))} color="var(--viz-1)" width={3} samples={600} />
        {under !== null && <VLine x={under} color="var(--viz-neg)" dash="5 4" width={2} />}
        {under !== null && (
          <Label x={under} y={0.62} dx={under > KMAX * 0.6 ? -6 : 6} anchor={under > KMAX * 0.6 ? 'end' : 'start'} color="var(--viz-neg)" weight={700}>
            {`stored as 0 from k = ${under}`}
          </Label>
        )}
        {under === null && (
          <Label x={KMAX} y={0.62} dx={-6} anchor="end" color="var(--viz-muted)" weight={700}>
            {`${precName}: tiny but not 0 until k ≈ ${farUnder.toLocaleString('en-GB')}`}
          </Label>
        )}
        <Dots points={[{ x: k, y: s, r: 6, color: s === 0 ? 'var(--viz-neg)' : 'var(--viz-2)' }]} />
      </Plot>

      <div style={panelTitle}>
        The sum of logs <M>{`\\ln ${p.toFixed(2)} + \\dots = k \\times (${lnp.toFixed(3)})`}</M>
      </div>
      <Plot x={[0, KMAX]} y={[yMin, 0]} width={560} height={170} minHeight={165} margin={{ left: 46, right: 18 }} ariaLabel={`Running sum of logs falls in a straight line: ${logSum.toFixed(2)} at ${k} tiles.`}>
        <Grid xTicks={6} yTicks={4} />
        <Axes xTicks={6} yTicks={4} xLabel="k tiles" tickFormat={tick} />
        <FnPath f={(x) => x * lnp} color="var(--viz-3)" width={3} />
        <Label x={k} y={logSum} dx={k > KMAX * 0.55 ? -12 : 12} dy={k > KMAX * 0.55 ? 22 : -12} anchor={k > KMAX * 0.55 ? 'end' : 'start'} color="var(--viz-3)" weight={700}>
          {logSum.toFixed(2)}
        </Label>
        <DraggablePoint
          x={k}
          y={logSum}
          color="var(--viz-2)"
          constrain={(x) => {
            const kk = Math.max(1, Math.min(KMAX, Math.round(x)))
            return [kk, kk * lnp]
          }}
          onChange={(x) => setK(Math.max(1, Math.min(KMAX, Math.round(x))))}
        />
      </Plot>

      <Readout
        items={[
          ['true product', <M key="t">{sci(trueLog10)}</M>],
          [`stored in ${precName}`, s === 0 ? <span key="s" style={{ color: 'var(--viz-neg)' }}>0 (underflow)</span> : <M key="s">{sci(Math.log10(s))}</M>],
          ['sum of logs', logSum.toFixed(2)],
        ]}
      />
      <Controls>
        <Slider label="k, number of tiles" value={k} min={1} max={KMAX} step={1} onChange={setK} />
        <Slider label="p on each tile" value={p} min={0.5} max={0.99} step={0.01} onChange={setP} format={(v) => v.toFixed(2)} />
        <Segmented
          label="Number format"
          value={prec}
          onChange={setPrec}
          options={[
            { value: 'f32', label: 'float32 (PyTorch)' },
            { value: 'f64', label: 'float64 (NumPy)' },
          ]}
        />
      </Controls>
    </Figure>
  )
}
