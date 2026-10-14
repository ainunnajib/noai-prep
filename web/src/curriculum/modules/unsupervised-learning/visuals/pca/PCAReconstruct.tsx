import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Button, Plot, Grid, Axes, Rect, Path, Dots, HLine, Label, M, useNarrow } from '../../../../../kit'
import DigitTiles from './DigitTiles'
import { mean, ratio, components, examples } from './digitsPca'

/*
  Scree plot + reconstructions for scikit-learn's 8x8 digits (64 pixels per image).
  Rebuild each image from its first k principal-component scores:
      z_j = v_j . (x - mean),   x_hat = mean + sum_{j<=k} z_j v_j
  computed live from the stored mean and components.
*/

const cum = ratio.reduce<number[]>((acc, r) => {
  acc.push((acc.length ? acc[acc.length - 1] : 0) + r)
  return acc
}, [])

const head: CSSProperties = { fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-2)', margin: '0.35rem 0 0.25rem', textAlign: 'center' }

function reconstruct(x: number[], k: number): number[] {
  const out = mean.slice()
  for (let j = 0; j < k; j++) {
    const v = components[j]
    let z = 0
    for (let p = 0; p < 64; p++) z += v[p] * (x[p] - mean[p])
    for (let p = 0; p < 64; p++) out[p] += z * v[p]
  }
  return out
}

export default function PCAReconstruct() {
  const [k, setK] = useState(5)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const rebuilt = useMemo(() => examples.map((x) => reconstruct(x, k)), [k])
  const rmse = useMemo(() => {
    let s = 0
    examples.forEach((x, i) => x.forEach((v, p) => (s += (v - rebuilt[i][p]) ** 2)))
    return Math.sqrt(s / (examples.length * 64))
  }, [rebuilt])
  const kept = k === 0 ? 0 : cum[k - 1]
  const n95 = cum.findIndex((c) => c >= 0.95) + 1

  return (
    <Figure
      wide
      title="How many components do you need?"
      caption={
        <>
          Each 8×8 digit is 64 numbers. Slide <M>k</M>: every image is rebuilt from just <M>k</M> numbers (its scores on the first <M>k</M>{' '}
          components). The bars show each component's share of the variance and the line adds them up. Notice how quickly the line rises: at{' '}
          <M>k = 10</M> the digits are already readable with about 74% of the variance, and {n95} components keep 95%.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: '1rem', alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={head}>
            Scree plot (% of variance): the first {k} component{k === 1 ? '' : 's'} keep{k === 1 ? 's' : ''} <span style={{ color: 'var(--viz-2)' }}>{(100 * kept).toFixed(1)}%</span>
          </div>
          <Plot x={[0, 65]} y={[0, 100]} width={360} height={250} maxWidth={440} margin={{ left: 42, right: 12, top: 12, bottom: 36 }} ariaLabel={`Scree plot: ${k} components keep ${(100 * kept).toFixed(1)}% of the variance`}>
            <Grid xTicks={6} yTicks={5} />
            <HLine y={95} color="var(--viz-3)" />
            <Label x={64} y={95} dy={15} anchor="end" color="var(--viz-3)" weight={700}>
              95%
            </Label>
            {ratio.map((r, j) => (
              <Rect key={j} x0={j + 0.6} x1={j + 1.4} y0={0} y1={100 * r} fill={j < k ? 'var(--viz-1)' : 'color-mix(in srgb, var(--viz-muted) 55%, transparent)'} />
            ))}
            <Path points={[[0, 0], ...cum.map((c, j) => [j + 1, 100 * c] as [number, number])]} color="var(--viz-2)" width={2.5} />
            <Dots points={[{ x: Math.max(k, 0.0001), y: 100 * kept, color: 'var(--viz-2)', r: 5.5 }]} />
            <Axes xTicks={6} yTicks={5} xLabel="component" tickFormat={(v) => String(Math.round(v))} />
          </Plot>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={head}>Original images (64 numbers each)</div>
          <DigitTiles images={examples} ariaLabel="Ten original 8 by 8 digit images, 0 to 9" />
          <div style={head}>
            Rebuilt from {k} number{k === 1 ? '' : 's'} each
          </div>
          <DigitTiles images={rebuilt} ariaLabel={`The same ten digits rebuilt from ${k} principal components`} />
          <div style={head}>The building blocks: average image, then PC1 to PC5</div>
          <BlockRow />
          <div style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', textAlign: 'center', marginTop: 4 }}>
            Orange = add ink, blue = remove ink. A rebuild is the average image plus a weighted mix of these patterns.
          </div>
        </div>
      </div>
      <Controls>
        <Slider label="components kept, k" value={k} min={0} max={64} step={1} onChange={setK} />
        <Button onClick={() => setK(n95)}>Keep 95%</Button>
        <Readout items={[['numbers per image', `${k} of 64`], ['variance kept', `${(100 * kept).toFixed(1)}%`], ['rebuild error (RMSE)', rmse.toFixed(2)]]} />
      </Controls>
    </Figure>
  )
}

/** average image (ink) followed by PC1..PC5 (signed colours), in one row */
function BlockRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 5fr', gap: 6, maxWidth: 6 * 46, margin: '0 auto' }}>
      <div>
        <DigitTiles images={[mean]} ariaLabel="The average digit image" />
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-3)' }}>mean</div>
      </div>
      <div>
        <DigitTiles images={components.slice(0, 5)} mode="signed" ariaLabel="The first five principal components drawn as 8 by 8 patterns" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-3)' }}>
          {[1, 2, 3, 4, 5].map((j) => (
            <span key={j}>PC{j}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
