import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Grid, Axes, Path, Dots, Label, type DotDatum } from '../../../../../kit'

/*
  Made-up resale prices ($ thousands) of four flats in each of five towns. A linear model
  price ≈ w · code + b on label-encoded towns must put all towns on one straight line, in
  whatever order the codes happen to follow. With one-hot encoding each town gets its own
  weight, so the model can learn each town's own level.
*/

const TOWNS = ['Ang Mo Kio', 'Bedok', 'Clementi', 'Jurong West', 'Punggol']
const SHORT = ['AMK', 'BDK', 'CLE', 'JW', 'PGL']
const PRICES = [
  [597, 514, 568, 550],
  [492, 496, 464, 496],
  [624, 700, 644, 634],
  [465, 458, 451, 463],
  [589, 576, 597, 576],
]
// code given to each town: alphabetical first, then two other arbitrary numberings
const ORDERS: { name: string; code: number[] }[] = [
  { name: 'alphabetical', code: [0, 1, 2, 3, 4] },
  { name: 'shuffled', code: [3, 0, 4, 1, 2] },
  { name: 'shuffled again', code: [1, 4, 0, 2, 3] },
]
const COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)']

type Enc = 'label' | 'onehot'

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length

export default function LinearOnCodes() {
  const [enc, setEnc] = useState<Enc>('label')
  const [order, setOrder] = useState(0)
  const code = ORDERS[order].code

  // all flats as (code, price, town)
  const flats = PRICES.flatMap((ps, t) => ps.map((p, j) => ({ x: code[t] + (j - 1.5) * 0.08, c: code[t], y: p, t })))
  // least-squares line on the codes
  const mx = mean(flats.map((f) => f.c))
  const my = mean(flats.map((f) => f.y))
  const sxy = flats.reduce((s, f) => s + (f.c - mx) * (f.y - my), 0)
  const sxx = flats.reduce((s, f) => s + (f.c - mx) ** 2, 0)
  const w = sxy / sxx
  const b = my - w * mx
  const townMean = PRICES.map(mean)
  const pred = (f: (typeof flats)[number]) => (enc === 'label' ? w * f.c + b : townMean[f.t])
  const rmse = Math.sqrt(mean(flats.map((f) => (f.y - pred(f)) ** 2)))

  const dots: DotDatum[] = flats.map((f) => ({ x: f.x, y: f.y, r: 4.5, color: COLOURS[f.t] }))

  return (
    <Figure
      title="What a linear model can do with each encoding"
      caption={
        <>
          Made-up resale prices of four flats in each of five towns, plotted against the town’s code. With <b>label encoding</b> a linear model can
          only draw one straight line through the codes, so every town must sit on it. Press <b>renumber the towns</b>: the codes are arbitrary, yet
          the line and the error change. Switch to <b>one-hot</b> and each town gets its own weight (its own level).
        </>
      }
    >
      <Controls>
        <Segmented<Enc>
          label="Encoding"
          value={enc}
          onChange={setEnc}
          options={[
            { value: 'label', label: 'label: price ≈ w·code + b' },
            { value: 'onehot', label: 'one-hot: one weight per town' },
          ]}
        />
        <Button onClick={() => setOrder((o) => (o + 1) % ORDERS.length)}>Renumber the towns</Button>
      </Controls>
      <Plot x={[-0.6, 4.6]} y={[420, 720]} width={480} height={300} minHeight={260} margin={{ left: 46, bottom: 40, top: 16 }} ariaLabel={`Flat prices by town code with a ${enc === 'label' ? 'straight-line' : 'per-town'} fit`}>
        <Grid xTicks={5} yTicks={6} />
        <Axes yLabel="price ($k)" yTicks={6} hideXTicks />
        {/* errors */}
        {flats.map((f, i) => (
          <Path key={`e${i}`} points={[[f.x, f.y], [f.x, pred(f)]]} color="var(--viz-neg)" width={1.2} opacity={0.6} />
        ))}
        {enc === 'label' ? (
          <Path points={[[-0.5, w * -0.5 + b], [4.5, w * 4.5 + b]]} color="var(--viz-ink)" width={2.5} />
        ) : (
          townMean.map((m, t) => <Path key={t} points={[[code[t] - 0.32, m], [code[t] + 0.32, m]]} color={COLOURS[t]} width={3.5} />)
        )}
        <Dots points={dots} />
        {SHORT.map((s, t) => (
          <g key={s}>
            <Label x={code[t]} y={420} dy={15} anchor="middle" size={12} color="var(--ink-2)">
              {`code ${code[t]}`}
            </Label>
            <Label x={code[t]} y={420} dy={30} anchor="middle" size={12} color={COLOURS[t]} weight={700}>
              {s}
            </Label>
          </g>
        ))}
      </Plot>
      <Readout
        items={[
          ['codes', ORDERS[order].name],
          ['fit', enc === 'label' ? `price ≈ ${w.toFixed(1)} × code + ${b.toFixed(0)}` : 'each town predicted at its own average'],
          ['typical error (RMSE)', `$${rmse.toFixed(0)}k`],
        ]}
      />
      <p style={{ margin: 0, width: '100%', fontSize: 'var(--step--1)', color: 'var(--ink-2)' }}>
        {TOWNS.map((t, i) => `${SHORT[i]} = ${t}`).join(' · ')}
      </p>
    </Figure>
  )
}
