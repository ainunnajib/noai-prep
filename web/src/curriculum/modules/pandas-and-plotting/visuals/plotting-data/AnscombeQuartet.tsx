import { useState } from 'react'
import { Figure, Controls, Readout, Toggle, Plot, Grid, Axes, Dots, FnPath } from '../../../../../kit'
import s from './pc.module.css'

/*
  Anscombe's quartet (F. J. Anscombe, 1973): four small datasets with the same means, variances,
  correlation and best-fit line, but completely different pictures. Every statistic shown is
  computed here from the data.
*/

const X123 = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
const SETS: { name: string; x: number[]; y: number[]; story: string }[] = [
  {
    name: 'I',
    x: X123,
    y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],
    story: 'A noisy straight-line trend. Here the line and the correlation are a fair summary.',
  },
  {
    name: 'II',
    x: X123,
    y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.1, 6.13, 3.1, 9.13, 7.26, 4.74],
    story: 'A smooth curve. A straight line is the wrong model: it undershoots in the middle (the points arch above it) and overshoots at both ends.',
  },
  {
    name: 'III',
    x: X123,
    y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],
    story: 'A perfect line except for one outlier, which pulls the fitted line towards itself and makes it steeper (slope 0.35 without it, 0.50 with it). Check that point before trusting any model.',
  },
  {
    name: 'IV',
    x: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8],
    y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.5, 5.56, 7.91, 6.89],
    story: 'Ten points share the same x. A single far-away point creates the whole "trend": remove it and there is no line at all.',
  },
]

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
const variance = (v: number[]) => {
  const m = mean(v)
  return v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1)
}
function stats(x: number[], y: number[]) {
  const mx = mean(x)
  const my = mean(y)
  const sxy = x.reduce((a, xi, i) => a + (xi - mx) * (y[i] - my), 0)
  const sxx = x.reduce((a, xi) => a + (xi - mx) ** 2, 0)
  const syy = y.reduce((a, yi) => a + (yi - my) ** 2, 0)
  const slope = sxy / sxx
  return { mx, my, vx: variance(x), vy: variance(y), r: sxy / Math.sqrt(sxx * syy), slope, icpt: my - slope * mx }
}

function Mini({ k, active, onClick }: { k: number; active: boolean; onClick: () => void }) {
  const d = SETS[k]
  return (
    <button type="button" className={`${s.thumb} ${active ? s.thumbRight : ''}`} onClick={onClick} aria-pressed={active} aria-label={`Dataset ${d.name}`}>
      <Plot
        x={[2, 20]}
        y={[2, 14]}
        width={200}
        height={140}
        margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
        ariaLabel={`Small scatter plot of dataset ${d.name}`}
      >
        <Axes hideXTicks hideYTicks />
        <Dots points={d.x.map((x, i) => ({ x, y: d.y[i] }))} r={4} color="var(--viz-1)" />
      </Plot>
      <span className={s.thumbName}>{d.name}</span>
    </button>
  )
}

export default function AnscombeQuartet() {
  const [k, setK] = useState(0)
  const [fit, setFit] = useState(true)
  const d = SETS[k]
  const st = stats(d.x, d.y)
  return (
    <Figure
      title="Same numbers, different pictures"
      caption={
        <>
          Tap each of the four datasets. Watch the summary numbers under the plot: they stay the same (to two decimal places; the variance of y only wobbles
          between 4.12 and 4.13), while the pictures tell four different stories. Summary statistics cannot replace looking at the data.
        </>
      }
    >
      <div className={s.thumbs} style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }} role="group" aria-label="Choose a dataset">
        {SETS.map((_, i) => (
          <Mini key={i} k={i} active={i === k} onClick={() => setK(i)} />
        ))}
      </div>
      <Plot x={[2, 20]} y={[2, 14]} width={480} height={300} ariaLabel={`Scatter plot of Anscombe dataset ${d.name} with its best-fit line`}>
        <Grid xTicks={9} yTicks={6} />
        <Axes xTicks={9} yTicks={6} xLabel="x" yLabel="y" />
        {fit && <FnPath f={(x) => st.icpt + st.slope * x} color="var(--viz-2)" width={2.2} dash="7 4" />}
        <Dots points={d.x.map((x, i) => ({ x, y: d.y[i] }))} r={6} color="var(--viz-1)" />
      </Plot>
      <Controls>
        <Readout
          items={[
            ['mean x', st.mx.toFixed(2)],
            ['mean y', st.my.toFixed(2)],
            ['variance x', st.vx.toFixed(2)],
            ['variance y', st.vy.toFixed(2)],
            ['correlation r', st.r.toFixed(2)],
            ['best-fit line', `y = ${st.icpt.toFixed(2)} + ${st.slope.toFixed(2)}x`],
          ]}
        />
        <Toggle label="best-fit line" checked={fit} onChange={setFit} />
      </Controls>
      <div className={s.verdict}>
        <b>Dataset {d.name}:</b> {d.story}
      </div>
    </Figure>
  )
}
