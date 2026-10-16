import { useState } from 'react'
import { Figure, Controls, Segmented, Toggle, Plot, Grid, Axes, Rect, Label, Path, Bars, VLine, usePlot, useNarrow } from '../../../../../kit'

/*
  36 students: weekly revision hours (x) and test score (y). Ten students left "hours" blank,
  and most of them revise little (the blank is informative). The learner picks how to deal
  with the blanks and compares the spread and correlation with the hidden true values.
*/

const HOURS = [5, 4, 3.5, 5, 3.5, 7, 5, 5, 1.5, 1, 1.5, 5.5, 4.5, 1, 5.5, 2.5, 2.5, 8.5, 4.5, 5, 5, 1, 5.5, 21, 1.5, 7, 7.5, 7.5, 3, 3.5, 1.5, 4, 10, 2.5, 0.5, 4.5]
const SCORE = [60, 49, 47, 53, 61, 59, 53, 57, 42, 40, 35, 57, 50, 50, 61, 46, 51, 65, 61, 55, 59, 32, 59, 98, 29, 60, 57, 65, 64, 44, 39, 53, 75, 45, 38, 58]
const BLANK = [0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0].map(Boolean)

type Method = 'drop' | 'mean' | 'median' | 'regression'

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length
const std = (a: number[]) => {
  const m = mean(a)
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length)
}
const median = (a: number[]) => {
  const s = [...a].sort((p, q) => p - q)
  const k = Math.floor(s.length / 2)
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2
}
const corr = (a: number[], b: number[]) => {
  const ma = mean(a)
  const mb = mean(b)
  let sab = 0
  let saa = 0
  let sbb = 0
  a.forEach((v, i) => {
    sab += (v - ma) * (b[i] - mb)
    saa += (v - ma) ** 2
    sbb += (b[i] - mb) ** 2
  })
  return sab / Math.sqrt(saa * sbb)
}

const OBS_X = HOURS.filter((_, i) => !BLANK[i])
const OBS_Y = SCORE.filter((_, i) => !BLANK[i])
// regression fill: predict hours from score using the complete rows
const SLOPE = (() => {
  const mx = mean(OBS_X)
  const my = mean(OBS_Y)
  let sxy = 0
  let syy = 0
  OBS_X.forEach((v, i) => {
    sxy += (v - mx) * (OBS_Y[i] - my)
    syy += (OBS_Y[i] - my) ** 2
  })
  return sxy / syy
})()
const INTERCEPT = mean(OBS_X) - SLOPE * mean(OBS_Y)
const regFill = (score: number) => INTERCEPT + SLOPE * score

const TRUE = { n: HOURS.length, mean: mean(HOURS), std: std(HOURS), r: corr(HOURS, SCORE) }
const X_WIDE: [number, number] = [-3.4, 22]
// on phones the axis stops at 12.6 h so the other 35 students get room; the 21-hour student is drawn at the edge
const X_NARROW: [number, number] = [-3.4, 12.6]
const STRIP_X = -2.35
// spread the blank students sideways inside the strip (in score order) so close scores do not stack
const STRIP_OFFSET: number[] = (() => {
  const off = HOURS.map(() => 0)
  const blanks = HOURS.map((_, i) => i).filter((i) => BLANK[i]).sort((a, b) => SCORE[a] - SCORE[b])
  blanks.forEach((i, k) => (off[i] = [-0.5, 0, 0.5][k % 3]))
  return off
})()
const stripX = (i: number) => STRIP_X + STRIP_OFFSET[i]

function filled(method: Method): (number | null)[] {
  return HOURS.map((h, i) => {
    if (!BLANK[i]) return h
    if (method === 'drop') return null
    if (method === 'mean') return mean(OBS_X)
    if (method === 'median') return median(OBS_X)
    return regFill(SCORE[i])
  })
}

/** a dot that glides to its new position */
function MovingDot({ x, y, color, ring, warn, faded }: { x: number; y: number; color: string; ring?: boolean; warn?: boolean; faded?: boolean }) {
  const { xs, ys } = usePlot()
  return (
    <g style={{ transform: `translate(${xs(x)}px, ${ys(y)}px)`, transition: 'transform 0.6s ease', opacity: faded ? 0.3 : 1 }}>
      {ring && <circle r={9} style={{ fill: 'none', stroke: 'var(--viz-4)', strokeWidth: 2 }} />}
      {warn && <circle r={12} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2 }} />}
      <circle r={5} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
    </g>
  )
}

function Hollow({ x, y, crossed }: { x: number; y: number; crossed: boolean }) {
  const { xs, ys } = usePlot()
  const cx = xs(x)
  const cy = ys(y)
  return (
    <g style={{ opacity: crossed ? 0.45 : 1 }}>
      <circle cx={cx} cy={cy} r={5} style={{ fill: 'var(--surface)', stroke: 'var(--viz-2)', strokeWidth: 2 }} />
      {crossed && <path d={`M${cx - 7},${cy}H${cx + 7}`} style={{ stroke: 'var(--viz-neg)', strokeWidth: 2 }} />}
    </g>
  )
}

const fmt = (v: number, d = 2) => v.toFixed(d)
function Delta({ v, ref0, digits = 2 }: { v: number; ref0: number; digits?: number }) {
  const rel = (v - ref0) / Math.abs(ref0)
  const tag = Math.abs(rel) < 0.02 ? '≈' : rel < 0 ? '↓' : '↑'
  const col = Math.abs(rel) < 0.02 ? 'var(--viz-pos)' : 'var(--viz-neg)'
  return (
    <span>
      {fmt(v, digits)} <b style={{ color: col }}>{tag}</b>
    </span>
  )
}

export default function ImputationVisualizer() {
  const [method, setMethod] = useState<Method>('mean')
  const [indicator, setIndicator] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const X = narrow ? X_NARROW : X_WIDE
  const edge = X[1] - 0.45
  const maxBin = narrow ? 11 : 21

  const xsFilled = filled(method)
  const used = xsFilled.map((v, i) => (v == null ? null : ([v, SCORE[i]] as [number, number]))).filter((p): p is [number, number] => p != null)
  const ux = used.map((p) => p[0])
  const uy = used.map((p) => p[1])
  const now = { n: used.length, mean: mean(ux), std: std(ux), r: corr(ux, uy) }

  // histogram of hours (bins of width 1, plus one bin for impossible negative values), stacked: observed then imputed
  const bins = Array.from({ length: maxBin + 2 }, (_, j) => ({ k: j - 1, obs: 0, imp: 0 }))
  xsFilled.forEach((v, i) => {
    if (v == null) return
    const k = Math.min(maxBin, Math.max(-1, Math.floor(v)))
    if (BLANK[i]) bins[k + 1].imp++
    else bins[k + 1].obs++
  })
  const hMax = Math.max(...bins.map((b) => b.obs + b.imp))
  const negBin = bins[0].obs + bins[0].imp
  const negFill = xsFilled.find((v, i) => BLANK[i] && v != null && v < 0)

  const blankScores = SCORE.filter((_, i) => BLANK[i])
  const presentScores = SCORE.filter((_, i) => !BLANK[i])

  const methodNote: Record<Method, string> = {
    drop: 'Dropping the 10 incomplete rows leaves 26. They are mostly the keen students, so the average is now too high.',
    mean: `All 10 blanks become ${fmt(mean(OBS_X), 2)} h, the mean of the observed hours: a spike in the histogram, a smaller spread and a weaker correlation. The mean is still too high (true: ${fmt(TRUE.mean)} h) because the students who skipped the question revise less, so the observed mean was biased before anything was filled in.`,
    median: `All 10 blanks become the median, ${fmt(median(OBS_X), 1)} h. Less pulled by the 21-hour student than the mean, but still a spike, and still too high, because the blanks come mostly from students who revise little.`,
    regression: 'Each blank is predicted from that student\u2019s score (dashed line, fitted on the complete rows). The mean and spread look right, but the filled points sit exactly on the line, so the correlation comes out too strong, and one student is even given a negative number of hours.',
  }

  return (
    <Figure
      title="Every way of filling a gap is an assumption"
      caption={
        <>
          Ten of 36 students left “hours of revision” blank (hollow orange circles on the left strip; we still know their scores). Choose how to
          handle the blanks and watch the filled points (orange) move into the scatter and the histogram. Compare the spread and the correlation
          with the true values, which you could never see in real life. Then switch on <b>add an is_missing column</b>.
        </>
      }
    >
      <Controls>
        <Segmented<Method>
          label="Handle the blanks by"
          value={method}
          onChange={setMethod}
          options={[
            { value: 'drop', label: 'dropping rows' },
            { value: 'mean', label: 'mean' },
            { value: 'median', label: 'median' },
            { value: 'regression', label: 'regression' },
          ]}
        />
      </Controls>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.5rem' }}>
      <Plot x={X} y={[25, 102]} width={520} height={290} minHeight={narrow ? 300 : 250} margin={{ left: 40, bottom: 34 }} ariaLabel={`Scatter of revision hours against test score with ten blanks handled by ${method}`}>
        <Grid xTicks={5} yTicks={4} />
        <Rect x0={X[0]} x1={-1.3} y0={25} y1={102} fill="color-mix(in srgb, var(--viz-2) 10%, transparent)" />
        <Label x={STRIP_X} y={25} dy={15} anchor="middle" size={11} weight={700} color="var(--viz-2)">
          blank
        </Label>
        <VLine x={0} color="var(--viz-axis)" dash="2 3" width={1} />
        <Axes xLabel="revision hours per week" yLabel="score" xTicks={5} yTicks={4} tickFormat={(v) => (v < 0 ? '' : String(v))} />
        {method === 'regression' && <Path points={[[regFill(25), 25], [regFill(102), 102]]} color="var(--viz-2)" width={1.5} dash="5 4" />}
        {HOURS.map((_, i) => (BLANK[i] ? <Hollow key={`h${i}`} x={stripX(i)} y={SCORE[i]} crossed={method === 'drop'} /> : null))}
        {HOURS.map((h, i) => {
          if (!BLANK[i]) return <MovingDot key={i} x={Math.min(h, edge)} y={SCORE[i]} color="var(--viz-1)" />
          const v = xsFilled[i]
          return <MovingDot key={i} x={v ?? stripX(i)} y={SCORE[i]} color="var(--viz-2)" ring={indicator && v != null} warn={method === 'regression' && v != null && v < 0} faded={v == null} />
        })}
        {HOURS.map((h, i) =>
          !BLANK[i] && h > edge ? (
            <Label key={`edge${i}`} x={edge} y={SCORE[i]} dx={-10} dy={4} anchor="end" size={11} color="var(--ink-2)">
              {`${h} h →`}
            </Label>
          ) : null,
        )}
        {method === 'regression' && negFill != null && (
          <Label x={negFill} y={SCORE[xsFilled.indexOf(negFill)]} dx={17} dy={-8} size={12} weight={700} color="var(--viz-neg)">
            {`${negFill.toFixed(1).replace('-', '−')} h?!`}
          </Label>
        )}
      </Plot>
      <Plot x={X} y={[0, hMax + 1]} width={520} height={120} minHeight={110} margin={{ left: 40, bottom: 26, top: 8 }} ariaLabel="Histogram of revision hours, observed values in blue and filled values in orange">
        {bins.map((b) => (
          <g key={b.k}>
            {b.obs > 0 && <Rect x0={b.k + 0.06} x1={b.k + 0.94} y0={0} y1={b.obs} fill="color-mix(in srgb, var(--viz-1) 70%, var(--surface))" />}
            {b.imp > 0 && <Rect x0={b.k + 0.06} x1={b.k + 0.94} y0={b.obs} y1={b.obs + b.imp} fill={b.k < 0 ? 'var(--viz-neg)' : 'var(--viz-2)'} />}
          </g>
        ))}
        <Axes xTicks={5} yTicks={2} tickFormat={(v) => (v < 0 ? '' : String(v))} />
        {negBin > 0 && (
          <Label x={-0.5} y={negBin} dy={-4} anchor="middle" size={11} weight={700} color="var(--viz-neg)">
            {'< 0'}
          </Label>
        )}
        {narrow && (
          <Label x={maxBin + 0.5} y={bins[maxBin + 1].obs + bins[maxBin + 1].imp} dy={-4} anchor="middle" size={10} color="var(--ink-2)">
            {'21 h'}
          </Label>
        )}
        <Label x={X[1] - 0.2} y={hMax + 1} dy={12} anchor="end" size={11} color="var(--ink-2)">
          histogram of hours
        </Label>
      </Plot>
      </div>
      <p style={{ margin: 0, width: '100%', fontSize: 'var(--step--1)', color: 'var(--ink-2)' }}>{methodNote[method]}</p>
      <div className="table-wrap" style={{ width: '100%' }}>
        <table style={{ width: '100%', fontSize: 'var(--step--1)' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>hours column</th>
              <th>true (hidden)</th>
              <th>after {method === 'drop' ? 'dropping' : `${method} fill`}</th>
            </tr>
          </thead>
          <tbody className="tabular">
            <tr>
              <td>rows used</td>
              <td style={{ textAlign: 'center' }}>{TRUE.n}</td>
              <td style={{ textAlign: 'center' }}>{now.n}</td>
            </tr>
            <tr>
              <td>mean</td>
              <td style={{ textAlign: 'center' }}>{fmt(TRUE.mean)}</td>
              <td style={{ textAlign: 'center' }}>
                <Delta v={now.mean} ref0={TRUE.mean} />
              </td>
            </tr>
            <tr>
              <td>spread (standard deviation)</td>
              <td style={{ textAlign: 'center' }}>{fmt(TRUE.std)}</td>
              <td style={{ textAlign: 'center' }}>
                <Delta v={now.std} ref0={TRUE.std} />
              </td>
            </tr>
            <tr>
              <td>correlation with score</td>
              <td style={{ textAlign: 'center' }}>{fmt(TRUE.r)}</td>
              <td style={{ textAlign: 'center' }}>
                <Delta v={now.r} ref0={TRUE.r} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Controls>
        <Toggle label="add an is_missing column" checked={indicator} onChange={setIndicator} />
      </Controls>
      {indicator && (
        <div style={{ width: '100%', display: 'grid', gap: '0.4rem' }}>
          {method === 'drop' ? (
            <p style={{ margin: 0, fontSize: 'var(--step--1)', color: 'var(--ink-2)' }}>After dropping, no blank rows are left, so is_missing would be 0 everywhere and useless.</p>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 'var(--step--1)', color: 'var(--ink-2)' }}>
                Ringed points have <code>is_missing = 1</code>. Their average score is much lower: the blank itself tells the model something.
              </p>
              <Bars
                max={100}
                format={(v) => v.toFixed(1)}
                ariaLabel="Average test score for students with and without a blank"
                data={[
                  { label: 'average score, is_missing = 1', value: mean(blankScores), color: 'var(--viz-4)' },
                  { label: 'average score, is_missing = 0', value: mean(presentScores), color: 'var(--viz-1)' },
                ]}
              />
            </>
          )}
        </div>
      )}
    </Figure>
  )
}
