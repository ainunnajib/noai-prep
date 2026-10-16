import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Rect, Axes, Arrow, Label, usePlot } from '../../../../../kit'

/*
  A smooth distribution of test scores whose skew the learner controls with one slider.
  Vertical lines mark the mode (peak), median (half the area on each side) and mean (balance
  point). The tail drags the mean furthest, so for a right skew mean > median > mode.
  The shape is a Beta(a, b) curve on [0, 100]; every number is computed from the same curve.
*/

const N = 2000
const BIN = 4

function summarise(s: number) {
  const a = 4 - 2.6 * s
  const b = 4 + 2.6 * s
  const xs: number[] = []
  const w: number[] = []
  for (let i = 0; i < N; i++) {
    const x = (i + 0.5) / N
    xs.push(x)
    w.push(Math.pow(x, a - 1) * Math.pow(1 - x, b - 1))
  }
  const tot = w.reduce((p, v) => p + v, 0)
  const p = w.map((v) => v / tot)
  let mu = 0
  p.forEach((pi, i) => (mu += pi * xs[i]))
  let v2 = 0
  let v3 = 0
  p.forEach((pi, i) => {
    const d = xs[i] - mu
    v2 += pi * d * d
    v3 += pi * d * d * d
  })
  let c = 0
  let med = 0
  for (let i = 0; i < N; i++) {
    c += p[i]
    if (c >= 0.5) {
      med = xs[i]
      break
    }
  }
  const mode = (a - 1) / (a + b - 2)
  // histogram: share of students in each 4-mark bin
  const bins: number[] = []
  const per = (N * BIN) / 100
  for (let k = 0; k < 100 / BIN; k++) {
    let s2 = 0
    for (let i = k * per; i < (k + 1) * per; i++) s2 += p[i]
    bins.push(s2)
  }
  return { mean: mu * 100, median: med * 100, mode: mode * 100, skew: v3 / Math.pow(v2, 1.5), bins }
}

const COLORS = { mean: 'var(--viz-2)', median: 'var(--viz-3)', mode: 'var(--viz-5)' }
type Key = keyof typeof COLORS

function Markers({ stats, top, s }: { stats: { mean: number; median: number; mode: number }; top: number; s: number }) {
  const { xs, ys, width } = usePlot()
  const same = Math.abs(s) < 0.05
  // Flag-style labels: the line furthest from the tail gets the highest label, and every label
  // points towards the tail, so no label ever crosses another line.
  const keys: Key[] = (['mode', 'median', 'mean'] as Key[]).sort((a, b) => (s >= 0 ? stats[a] - stats[b] : stats[b] - stats[a]))
  const toRight = s >= 0
  const rowY = (row: number) => ys(top) + 14 + row * 17
  return (
    <g>
      {keys.map((k, row) => (
        <line
          key={k}
          x1={xs(stats[k])}
          x2={xs(stats[k])}
          y1={ys(0)}
          y2={rowY(same ? 0 : row) - 11}
          style={{ stroke: COLORS[k], strokeWidth: 2.5, strokeDasharray: k === 'mean' ? undefined : k === 'median' ? '7 4' : '2 4' }}
        />
      ))}
      {same ? (
        <text x={xs(stats.mean) + 6} y={rowY(0)} className="plot-label">
          {width < 480 ? 'all three = 50' : 'mean = median = mode = 50'}
        </text>
      ) : (
        keys.map((k, row) => (
          <text key={k} x={xs(stats[k]) + (toRight ? 6 : -6)} y={rowY(row)} textAnchor={toRight ? 'start' : 'end'} className="plot-label" style={{ fill: COLORS[k] }}>
            {k} {stats[k].toFixed(1)}
          </text>
        ))
      )}
    </g>
  )
}

export default function SkewTail() {
  const [s, setS] = useState(0.8)
  const st = useMemo(() => summarise(s), [s])
  const yTop = 0.22
  // keep the "long tail" arrow just above the bars it points along
  const tailBins = st.bins.filter((_, k) => (s > 0 ? k * BIN >= 60 : (k + 1) * BIN <= 40))
  const tailY = Math.max(0.025, Math.max(...tailBins) + 0.02)
  const shape = Math.abs(s) < 0.05 ? 'symmetric' : s > 0 ? 'right-skewed (positive skew)' : 'left-skewed (negative skew)'
  const ordered = (['mean', 'median', 'mode'] as Key[]).sort((a, b) => st[b] - st[a])
  const order = Math.abs(s) < 0.05 ? 'mean = median = mode' : ordered.join(' > ')

  return (
    <Figure
      title="Which way does the tail pull?"
      caption={
        <>
          Scores of a big cohort on a test. Slide to the right for a hard paper (most students score low, a few score very high: a long tail to the
          right) and to the left for an easy one. Watch the three lines: the mode stays at the peak, the median splits the area in half, and the mean is dragged
          furthest into the tail. A <b>right</b> tail gives mean &gt; median &gt; mode.
        </>
      }
    >
      <Plot x={[0, 100]} y={[0, yTop]} width={560} height={270} minHeight={240} margin={{ left: 16, right: 16, top: 10, bottom: 36 }} ariaLabel={`Histogram of test scores, ${shape}: mean ${st.mean.toFixed(1)}, median ${st.median.toFixed(1)}, mode ${st.mode.toFixed(1)}`}>
        {st.bins.map((h, k) => (
          <Rect key={k} x0={k * BIN + 0.25} x1={(k + 1) * BIN - 0.25} y0={0} y1={Math.min(h, yTop)} fill="color-mix(in srgb, var(--viz-1) 32%, var(--surface))" rx={1.5} />
        ))}
        <Axes xLabel="test score" xTicks={10} hideYTicks />
        <Markers stats={st} top={yTop} s={s} />
        {Math.abs(s) >= 0.3 && (
          <>
            <Arrow from={s > 0 ? [62, tailY] : [38, tailY]} to={s > 0 ? [92, tailY] : [8, tailY]} color="var(--viz-4)" width={2} />
            <Label x={s > 0 ? 77 : 23} y={tailY} dy={-8} anchor="middle" color="var(--viz-4)">
              long tail
            </Label>
          </>
        )}
      </Plot>
      <Controls>
        <Slider
          label="skew of the scores"
          value={s}
          min={-1}
          max={1}
          step={0.05}
          onChange={setS}
          format={(v) => (Math.abs(v) < 0.05 ? 'symmetric' : v > 0 ? 'tail to the right' : 'tail to the left')}
        />
      </Controls>
      <Readout
        items={[
          ['shape', shape],
          ['order', order],
          ['skewness', (Math.abs(st.skew) < 0.005 ? 0 : st.skew).toFixed(2)],
        ]}
      />
    </Figure>
  )
}
