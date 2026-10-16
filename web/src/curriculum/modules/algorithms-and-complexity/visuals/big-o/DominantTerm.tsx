import { useState } from 'react'
import { Figure, Controls, Slider, Readout, Plot, Grid, Axes, Path, VLine, Label, DraggablePoint, M } from '../../../../../kit'
import { comma } from './format'
import s from './algo.module.css'

/*
  f(n) = 3n² + 50n + 200. The plot stacks each term's share of the total work against n (log axis).
  The learner drags along the boundary (or uses the slider) and sees the n² share swallow everything.
*/

const TERMS = [
  { tex: '3n^2', colour: 'var(--viz-2)', f: (n: number) => 3 * n * n },
  { tex: '50n', colour: 'var(--viz-1)', f: (n: number) => 50 * n },
  { tex: '200', colour: 'var(--viz-3)', f: () => 200 },
]
const total = (n: number) => TERMS.reduce((t, term) => t + term.f(n), 0)
const shares = (n: number) => TERMS.map((term) => (100 * term.f(n)) / total(n))

const X_MAX = 4 // log10 n from 0 (n = 1) to 4 (n = 10,000)
const SAMPLES = 160

function band(lower: (n: number) => number, upper: (n: number) => number): [number, number][] {
  const top: [number, number][] = []
  const bottom: [number, number][] = []
  for (let i = 0; i <= SAMPLES; i++) {
    const x = (X_MAX * i) / SAMPLES
    const n = Math.pow(10, x)
    top.push([x, upper(n)])
    bottom.push([x, lower(n)])
  }
  return [...top, ...bottom.reverse()]
}

const P0 = (n: number) => shares(n)[0]
const P01 = (n: number) => shares(n)[0] + shares(n)[1]
const BANDS = [band(() => 0, P0), band(P0, P01), band(P01, () => 100)]

const pct = (v: number) => (v >= 99.95 ? '>99.9' : v < 0.05 ? '<0.1' : v.toFixed(1)) + '%'

export default function DominantTerm() {
  const [x, setX] = useState(1) // log10 n; starts at n = 10
  const n = Math.max(1, Math.round(Math.pow(10, x)))
  const sh = shares(n)
  const ratio = total(2 * n) / total(n)

  return (
    <Figure
      title="Which term does the work?"
      caption={
        <>
          The cost is <M>{'f(n) = 3n^2 + 50n + 200'}</M> steps. Drag the dot (or use the slider) to grow <M>n</M>. At <M>n = 10</M> the{' '}
          <M>50n</M> term is the biggest share, but by <M>n = 1000</M> the <M>3n^2</M> term does more than 98% of the work. That is why
          Big-O keeps only the dominant term and writes <M>{'O(n^2)'}</M>. In the readouts, <M>{'f(n) \\div n^2'}</M> settles near 3, the constant
          factor Big-O throws away, and <M>{'f(2n) \\div f(n)'}</M> heads towards 4: the doubling test you will meet further down.
        </>
      }
    >
      <div className={s.wrap}>
        <Plot x={[0, X_MAX]} y={[0, 100]} height={280} minHeight={230} margin={{ left: 46, bottom: 38, top: 12 }} ariaLabel="Share of the total work done by each term of 3n² + 50n + 200, as n grows from 1 to 10,000">
          <Grid xTicks={4} yTicks={4} />
          {BANDS.map((pts, i) => (
            <Path key={i} points={pts} closed width={0} color="none" fill={`color-mix(in srgb, ${TERMS[i].colour} 38%, var(--surface))`} />
          ))}
          <Label x={2.95} y={42} anchor="middle" weight={800} size={15} color="var(--viz-ink)">
            3n²
          </Label>
          <Label x={0.62} y={33} anchor="middle" weight={800} size={15} color="var(--viz-ink)">
            50n
          </Label>
          <Label x={0.3} y={90} anchor="middle" weight={800} size={15} color="var(--viz-ink)">
            200
          </Label>
          <Axes xTicks={4} hideYTicks tickFormat={(v) => (Number.isInteger(v) && v >= 0 ? comma(Math.pow(10, v)) : '')} xLabel="n (log scale)" />
          <Axes yTicks={4} hideXTicks tickFormat={(v) => `${v}%`} />
          <VLine x={x} color="var(--viz-ink)" dash="5 4" />
          {/* the dot's label: just below it (not above) near the top, and on its left near the right edge, so it stays inside the plot */}
          <Label x={x} y={P0(n)} dx={x > X_MAX - 1.2 ? -14 : 14} dy={P0(n) > 85 ? 17 : -9} anchor={x > X_MAX - 1.2 ? 'end' : 'start'} color="var(--viz-2)">
            {`n = ${comma(n)}`}
          </Label>
          <DraggablePoint
            x={x}
            y={P0(n)}
            color="var(--viz-2)"
            ariaLabel={`n = ${comma(n)}`}
            onChange={(nx) => setX(Math.min(X_MAX, Math.max(0, Math.round(nx * 50) / 50)))}
            constrain={(nx) => [nx, P0(Math.max(1, Math.round(Math.pow(10, nx))))]}
          />
        </Plot>
        <table className={s.tableSmall} aria-label={`Term values at n = ${n}`}>
          <thead>
            <tr>
              <th>term</th>
              <th>value at n = {comma(n)}</th>
              <th>share of f(n)</th>
            </tr>
          </thead>
          <tbody>
            {TERMS.map((t, i) => (
              <tr key={t.tex}>
                <td>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, marginRight: 6, background: t.colour }} />
                  <M>{t.tex}</M>
                </td>
                <td className={s.mono}>{comma(t.f(n))}</td>
                <td className={s.mono}>{pct(sh[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Controls>
          <Slider label={<>input size <M>n</M></>} value={x} min={0} max={X_MAX} step={0.02} onChange={setX} format={() => comma(n)} />
          <Readout
            items={[
              ['f(n)', comma(total(n))],
              ['f(2n) ÷ f(n)', `×${ratio.toFixed(2)}`],
              ['f(n) ÷ n²', (total(n) / (n * n)).toFixed(2)],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
