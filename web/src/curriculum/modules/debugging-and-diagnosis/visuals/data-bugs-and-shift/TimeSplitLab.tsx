import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Plot, Axes, Grid, Path, HLine, Rect, Label, useContainerWidth, mulberry32 } from '../../../../../kit'
import { seeded, fitLogReg, accuracy, pct } from './sim'
import s from './shift.module.css'

/*
  A spam filter with 30 months of data: Jan 2023 – Dec 2024 is available for training and validation,
  Jan – Jun 2025 is the future it will be deployed in. Spammers change tactics: the true (linear) rule
  rotates by `drift` degrees every month (concept drift), and 4% of labels are noise.
  Random split: 20% of the rows of every month go to validation.
  Time-based split: train on Jan 2023 – Jun 2024, validate on Jul – Dec 2024.
  Either way, the deployed model is then retrained on all 24 available months and scored on 2025.
  Aha: a random split leaks the future into training and promises more than the model will deliver;
  a time-based split's score is close to what happens after deployment.
*/

type Split = 'random' | 'time'
const MONTHS = 30
const AVAIL = 24
const CUT = 18
const PER = 80
const ROWS_SHOWN = 10
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthName = (m: number) => `${MONTH_NAMES[m % 12]} ${23 + Math.floor(m / 12)}`

function makeData(drift: number) {
  const { rnd, gauss } = seeded(2027)
  const X: [number, number][][] = []
  const Y: number[][] = []
  for (let m = 0; m < MONTHS; m++) {
    const th = ((10 + drift * m) * Math.PI) / 180
    const xs: [number, number][] = []
    const ys: number[] = []
    for (let i = 0; i < PER; i++) {
      const a = 1.2 * gauss()
      const b = 1.2 * gauss()
      let y = -Math.sin(th) * a + Math.cos(th) * b > 0 ? 1 : 0
      if (rnd() < 0.04) y = 1 - y
      xs.push([a, b])
      ys.push(y)
    }
    X.push(xs)
    Y.push(ys)
  }
  return { X, Y }
}

export default function TimeSplitLab() {
  const [split, setSplit] = useState<Split>('random')
  const [drift, setDrift] = useState(2)
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)

  // which rows of the 24 available months are validation in the random split (fixed seed)
  const randomVal = useMemo(() => {
    const rnd = mulberry32(77)
    return Array.from({ length: AVAIL }, () => Array.from({ length: PER }, () => rnd() < 0.2))
  }, [])

  const res = useMemo(() => {
    const { X, Y } = makeData(drift)
    const pick = (cond: (m: number, i: number) => boolean) => {
      const xs: [number, number][] = []
      const ys: number[] = []
      for (let m = 0; m < MONTHS; m++) for (let i = 0; i < PER; i++) if (cond(m, i)) (xs.push(X[m][i]), ys.push(Y[m][i]))
      return { xs, ys }
    }
    const isVal = (m: number, i: number, sp: Split) => (sp === 'random' ? m < AVAIL && randomVal[m][i] : m >= CUT && m < AVAIL)
    const out = {} as Record<Split, number>
    for (const sp of ['random', 'time'] as Split[]) {
      const tr = pick((m, i) => m < AVAIL && !isVal(m, i, sp))
      const va = pick((m, i) => isVal(m, i, sp))
      out[sp] = accuracy(fitLogReg(tr.xs, tr.ys, 300, 0.8), va.xs, va.ys)
    }
    const all = pick((m) => m < AVAIL)
    const final = fitLogReg(all.xs, all.ys, 300, 0.8)
    const future = pick((m) => m >= AVAIL)
    const truth = accuracy(final, future.xs, future.ys)
    const monthly = Array.from({ length: MONTHS }, (_, m) => accuracy(final, X[m], Y[m]))
    return { est: out, truth, monthly }
  }, [drift, randomVal])

  const est = res.est[split]
  const gap = est - res.truth
  const narrow = width < 520

  // timeline geometry
  const W = Math.max(300, Math.min(640, width))
  const padL = 6
  const colW = (W - padL * 2) / MONTHS
  const sq = Math.max(4, Math.min(12, colW - 2))
  const rows = ROWS_SHOWN
  const H = rows * (sq + 2) + 34
  const cellColour = (m: number, r: number) => {
    if (m >= AVAIL) return 'color-mix(in srgb, var(--viz-muted) 45%, var(--surface))'
    const val = split === 'random' ? randomVal[m][r * 7] : m >= CUT
    return val ? 'var(--viz-2)' : 'var(--viz-1)'
  }

  // smooth the monthly accuracy a little for the line (3-month moving average)
  const smooth = res.monthly.map((_, m) => {
    const a = Math.max(0, m - 1)
    const b = Math.min(MONTHS - 1, m + 1)
    let t = 0
    for (let k = a; k <= b; k++) t += res.monthly[k]
    return t / (b - a + 1)
  })

  return (
    <Figure
      title="Random split or time-based split?"
      caption={
        <>
          A spam filter trained on 2023–2024 and used in 2025, while spammers change tactics (the rule turns by the drift speed every month).
          Blue squares: training rows; orange: validation rows; grey: the 2025 future. Compare the validation score (your forecast) with
          the real 2025 accuracy, first with a <b>random</b> split, then a <b>time-based</b> one. Set the drift to 0: then both splits are
          honest.
        </>
      }
    >
      <div className={s.wrap} ref={wrapRef}>
        <Controls>
          <Segmented
            label="How do you choose validation rows?"
            value={split}
            onChange={setSplit}
            options={[
              { value: 'random', label: 'random 80/20 split' },
              { value: 'time', label: 'time-based split' },
            ]}
          />
          <Slider label="drift speed (degrees per month)" value={drift} min={0} max={4} step={0.5} onChange={setDrift} format={(v) => `${v}°`} />
        </Controls>

        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: 640, margin: '0 auto' }} role="img" aria-label="Timeline of 30 months showing which rows are used for training, validation and the future">
          {Array.from({ length: MONTHS }, (_, m) =>
            Array.from({ length: rows }, (_, r) => (
              <rect key={`${m}-${r}`} x={padL + m * colW + (colW - sq) / 2} y={4 + r * (sq + 2)} width={sq} height={sq} rx={2} style={{ fill: cellColour(m, r) }} />
            )),
          )}
          <line x1={padL + AVAIL * colW} x2={padL + AVAIL * colW} y1={0} y2={rows * (sq + 2) + 8} style={{ stroke: 'var(--ink)', strokeWidth: 2, strokeDasharray: '4 3' }} />
          {[0, 6, 12, 18, 24].map((m) => (
            <text key={m} x={padL + m * colW + 1} y={rows * (sq + 2) + 22} style={{ fill: 'var(--ink-2)', fontSize: narrow ? 10 : 11 }}>
              {monthName(m)}
            </text>
          ))}
        </svg>
        <div className={s.legend} aria-hidden="true">
          <span>
            <i className={s.dot} style={{ background: 'var(--viz-1)', borderRadius: 2 }} /> train
          </span>
          <span>
            <i className={s.dot} style={{ background: 'var(--viz-2)', borderRadius: 2 }} /> validation
          </span>
          <span>
            <i className={s.dot} style={{ background: 'color-mix(in srgb, var(--viz-muted) 45%, var(--surface))', borderRadius: 2 }} /> 2025: after deployment
          </span>
        </div>

        <div className={s.bigNums}>
          <div className={s.bigNum}>
            <span>validation score (your forecast)</span>
            <b>{pct(est)}</b>
          </div>
          <div className={s.bigNum}>
            <span>real accuracy, Jan–Jun 2025</span>
            <b>{pct(res.truth)}</b>
          </div>
          <div className={s.bigNum}>
            <span>forecast − reality</span>
            <b style={{ color: Math.abs(gap) > 0.04 ? 'var(--viz-neg)' : 'var(--viz-pos)' }}>
              {Math.round(gap * 100) > 0 ? '+' : Math.round(gap * 100) < 0 ? '−' : ''}
              {Math.abs(Math.round(gap * 100))} points
            </b>
          </div>
        </div>

        <Plot x={[0, MONTHS - 1]} y={[0.5, 1]} width={600} height={190} minHeight={170} margin={{ left: 44, bottom: 30, top: 12, right: 12 }} ariaLabel="Monthly accuracy of the deployed model, with the validation forecast as a dashed line">
          <Rect x0={AVAIL - 0.5} x1={MONTHS - 1} y0={0.5} y1={1} fill="color-mix(in srgb, var(--viz-muted) 16%, var(--surface))" />
          <Grid xTicks={5} yTicks={5} />
          <Axes hideXTicks yTicks={5} tickFormat={(v) => `${Math.round(v * 100)}%`} />
          {[0, 6, 12, 18, 24].map((m) => (
            <Label key={m} x={m} y={0.5} dy={17} anchor={m === 0 ? 'start' : 'middle'} color="var(--ink-3)" size={11}>
              {monthName(m)}
            </Label>
          ))}
          <Path points={smooth.map((v, m) => [m, v] as [number, number])} color="var(--viz-1)" width={2.5} />
          <HLine y={est} color="var(--viz-2)" dash="6 4" width={2} label={`forecast ${pct(est)}`} />
          <Label x={AVAIL + 2.5} y={0.52} anchor="middle" color="var(--ink-2)" size={11} dy={-4}>
            future
          </Label>
        </Plot>
        <p className={`${s.note} ${Math.abs(gap) > 0.04 ? s.noteBad : s.noteOk}`} role="status">
          {split === 'random'
            ? drift === 0
              ? 'With no drift, every month looks alike, so a random split is honest.'
              : 'Random split: validation rows come from the same months as the training rows, so the model has effectively seen the future. The score is a promise the model cannot keep in 2025.'
            : 'Time-based split: the model is validated on the most recent months, after the period it trained on, exactly as it will be used. The forecast is close to what really happens in 2025.'}
        </p>
      </div>
    </Figure>
  )
}
