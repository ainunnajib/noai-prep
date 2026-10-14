import { useMemo, useState } from 'react'
import {
  Figure,
  Controls,
  Readout,
  Slider,
  Segmented,
  Button,
  Plot,
  Grid,
  Axes,
  FnPath,
  Path,
  Dots,
  Label,
  HLine,
  VLine,
  usePlot,
  useBump,
  useNarrow,
} from '../../../../../kit'
import { truth, NOISE_FLOOR, makeRng, sample, fitPoly, predict } from './polyfit'

/*
  Bias and variance made visible. The same kind of model (a polynomial of the chosen degree) is
  fitted to 20 different training sets drawn from the same hidden curve.
  - Left: the 20 fitted curves (faint), their average (bold) and the truth (dashed).
  - Right: a dartboard. Each fitted model is one dart: its error at x = 0.2 (across) and at x = 0.6
    (up). The bullseye is "no error". The average dart's distance from the bullseye is bias; the
    scatter of the darts is variance.
  - Bottom: bias², variance and noise for every degree (averaged over 300 refits), whose sum is the
    expected error on new data.
  Aha: simple models miss consistently (bias); flexible models miss differently every time (variance).
*/

const N = 15
const MAX_DEG = 10
const SHOWN = 20
const STAT_FITS = 300
const XA = 0.2
const XB = 0.45
const GRID = Array.from({ length: 49 }, (_, i) => 0.02 + (0.96 * i) / 48)
const BOARD = 1.25

function refits(seed: number, count: number) {
  const rng = makeRng(seed)
  return Array.from({ length: count }, () => sample(rng, N))
}

/** bias², variance for each degree, from many refits (fixed seed so the numbers are stable) */
function stats() {
  const sets = refits(424242, STAT_FITS)
  return Array.from({ length: MAX_DEG }, (_, di) => {
    const d = di + 1
    const preds = sets.map((s) => {
      const c = fitPoly(s.x, s.y, d)
      return GRID.map((x) => predict(c, x))
    })
    let b2 = 0
    let v = 0
    GRID.forEach((x, j) => {
      let m = 0
      for (const p of preds) m += p[j]
      m /= preds.length
      let s2 = 0
      for (const p of preds) s2 += (p[j] - m) ** 2
      b2 += (m - truth(x)) ** 2
      v += s2 / preds.length
    })
    b2 /= GRID.length
    v /= GRID.length
    return { d, bias2: b2, variance: v, total: b2 + v + NOISE_FLOOR }
  })
}

function Board() {
  const { xs, ys } = usePlot()
  const cx = xs(0)
  const cy = ys(0)
  const px = (r: number) => Math.abs(xs(r) - xs(0))
  return (
    <g aria-hidden="true">
      {[1.2, 0.9, 0.6, 0.3].map((r, i) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={px(r)}
          style={{ fill: i % 2 ? 'var(--surface)' : 'color-mix(in srgb, var(--viz-1) 9%, var(--surface))', stroke: 'var(--viz-grid)', strokeWidth: 1.5 }}
        />
      ))}
      <circle cx={cx} cy={cy} r={px(0.1)} style={{ fill: 'var(--viz-neg)', opacity: 0.85 }} />
      <line x1={xs(-BOARD)} x2={xs(BOARD)} y1={cy} y2={cy} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
      <line x1={cx} x2={cx} y1={ys(-BOARD)} y2={ys(BOARD)} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
    </g>
  )
}

const PRESETS = [
  { value: 1, label: 'too simple (1)' },
  { value: 5, label: 'about right (5)' },
  { value: 10, label: 'too flexible (10)' },
]

export default function BiasVarianceDartboard() {
  const [deg, setDeg] = useState(1)
  const [seed, bump] = useBump()
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(640)

  const table = useMemo(stats, [])
  const sets = useMemo(() => refits(777 + seed * 7919, SHOWN), [seed])
  const fits = useMemo(() => sets.map((s) => fitPoly(s.x, s.y, deg)), [sets, deg])
  const darts = fits.map((c) => [predict(c, XA) - truth(XA), predict(c, XB) - truth(XB)] as [number, number])
  const mean: [number, number] = [darts.reduce((s, d) => s + d[0], 0) / darts.length, darts.reduce((s, d) => s + d[1], 0) / darts.length]
  const avgCurve = (x: number) => fits.reduce((s, c) => s + predict(c, x), 0) / fits.length
  const row = table[deg - 1]
  const clampB = (v: number) => Math.max(-BOARD + 0.03, Math.min(BOARD - 0.03, v))
  const yCap = 0.6
  const cap = (v: number) => Math.min(v, yCap)
  const pw = narrow ? 360 : 340

  return (
    <Figure
      title="Bias and variance: refit the same model 20 times"
      caption={
        <>
          Each faint curve is the same kind of model fitted to a <b>different</b> random training set of {N} points from the same hidden pattern. On the
          dartboard, each model is one dart: how wrong it is at x = {XA} (across) and at x = {XB} (up). Start at degree 1: the darts land in a tight
          group, but away from the bullseye. That is <b>bias</b>. Slide to degree 10: the group is centred, but scattered. That is <b>variance</b>.
          Press <b>Resample</b> to draw 20 new training sets. The bottom chart adds up both kinds of error for every degree.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '0.75rem', alignItems: 'start' }}
      >
        <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>{SHOWN} refits of a degree-{deg} polynomial</div>
          <Plot x={[0, 1]} y={[-2, 2]} width={pw} height={narrow ? 250 : 280} maxWidth={480} margin={{ left: 34 }} ariaLabel={`${SHOWN} degree ${deg} polynomials fitted to different training sets`}>
            <Grid xTicks={5} yTicks={4} />
            <Axes xLabel="x" yLabel="y" xTicks={5} yTicks={4} />
            {fits.map((c, i) => (
              <FnPath key={i} f={(x) => predict(c, x)} color="var(--viz-5)" width={1.3} opacity={0.35} samples={120} />
            ))}
            <FnPath f={truth} color="var(--viz-ink)" width={2.2} dash="6 5" />
            <FnPath f={avgCurve} color="var(--viz-5)" width={3.2} samples={160} />
            <VLine x={XA} color="var(--viz-2)" dash="3 3" width={1.2} />
            <VLine x={XB} color="var(--viz-2)" dash="3 3" width={1.2} />
            <Label x={XA} y={-2} dx={4} dy={-6} size={11} color="var(--viz-2)">{`x = ${XA}`}</Label>
            <Label x={XB} y={-2} dx={4} dy={-6} size={11} color="var(--viz-2)">{`x = ${XB}`}</Label>
          </Plot>
          <div style={{ display: 'flex', gap: '0.9rem', fontSize: '0.8rem', color: 'var(--ink-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>
              <b style={{ color: 'var(--viz-ink)' }}>- -</b> truth
            </span>
            <span>
              <b style={{ color: 'var(--viz-5)', opacity: 0.6 }}>—</b> one refit
            </span>
            <span>
              <b style={{ color: 'var(--viz-5)' }}>━</b> average of the refits
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>The dartboard: one dart per refit</div>
          <Plot x={[-BOARD, BOARD]} y={[-BOARD, BOARD]} width={280} height={280} maxWidth={320} margin={{ left: 34, right: 10, top: 10, bottom: 34 }} ariaLabel={`Dartboard of errors. Average dart at ${mean[0].toFixed(2)}, ${mean[1].toFixed(2)}.`}>
            <Board />
            <Axes xTicks={4} yTicks={4} />
            <Dots points={darts.map(([a, b]) => ({ x: clampB(a), y: clampB(b), r: 4.5, color: 'var(--viz-5)' }))} />
            {Math.hypot(mean[0], mean[1]) > 0.06 && <Path points={[[0, 0], mean]} color="var(--viz-2)" width={2.5} />}
            <Dots points={[{ x: clampB(mean[0]), y: clampB(mean[1]), r: 7, color: 'var(--viz-2)', shape: 'cross' }]} />
            <Label x={clampB(mean[0])} y={clampB(mean[1])} dx={mean[0] > 0.5 ? -10 : 10} dy={22} anchor={mean[0] > 0.5 ? 'end' : 'start'} size={12} color="var(--viz-2)" weight={700}>
              average dart
            </Label>
          </Plot>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-2)', textAlign: 'center', maxWidth: 320 }}>
            Across: error at x = {XA}. Up: error at x = {XB}. Bullseye = no error. Distance of the <b style={{ color: 'var(--viz-2)' }}>average dart</b>{' '}
            from it = bias. Scatter of the darts = variance.
          </div>
        </div>
      </div>

      <div style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: 4 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>The trade-off: expected error on new data = bias² + variance + noise</div>
        <Plot
          x={[0.5, MAX_DEG + 0.5]}
          y={[0, yCap]}
          width={narrow ? 360 : 640}
          height={narrow ? 230 : 220}
          maxWidth={720}
          margin={{ left: 42, top: 16 }}
          ariaLabel="Bias squared falls and variance rises as the degree grows; their total with noise is U-shaped."
          onPointerDown={([x]) => setDeg(Math.max(1, Math.min(MAX_DEG, Math.round(x))))}
        >
          <Grid xTicks={10} yTicks={5} />
          <Axes xLabel="degree" xTicks={10} yTicks={5} />
          <HLine y={NOISE_FLOOR} color="var(--viz-3)" dash="3 4" width={1.5} />
          <VLine x={deg} color="var(--viz-ink)" dash="" width={1.5} />
          <Path points={table.map((r): [number, number] => [r.d, cap(r.bias2)])} color="var(--viz-6)" width={2.5} />
          <Path points={table.map((r): [number, number] => [r.d, cap(r.variance)])} color="var(--viz-4)" width={2.5} />
          <Path points={table.map((r): [number, number] => [r.d, cap(r.total)])} color="var(--viz-ink)" width={3} />
          <Dots points={table.map((r) => ({ x: r.d, y: cap(r.bias2), r: r.d === deg ? 6 : 3.5, color: 'var(--viz-6)', shape: r.bias2 > yCap ? ('triangle' as const) : undefined }))} />
          <Dots points={table.map((r) => ({ x: r.d, y: cap(r.variance), r: r.d === deg ? 6 : 3.5, color: 'var(--viz-4)', shape: r.variance > yCap ? ('triangle' as const) : undefined }))} />
          <Dots points={table.map((r) => ({ x: r.d, y: cap(r.total), r: r.d === deg ? 6 : 3.5, color: 'var(--viz-ink)', shape: r.total > yCap ? ('triangle' as const) : undefined }))} />
        </Plot>
        <div style={{ display: 'flex', gap: '0.9rem', fontSize: '0.8rem', color: 'var(--ink-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span>
            <b style={{ color: 'var(--viz-6)' }}>●</b> bias²
          </span>
          <span>
            <b style={{ color: 'var(--viz-4)' }}>●</b> variance
          </span>
          <span>
            <b style={{ color: 'var(--viz-3)' }}>- -</b> noise σ² = {NOISE_FLOOR.toFixed(2)}
          </span>
          <span>
            <b style={{ color: 'var(--viz-ink)' }}>●</b> total
          </span>
        </div>
      </div>

      <Controls>
        <Slider label="model flexibility (degree)" value={deg} min={1} max={MAX_DEG} step={1} onChange={setDeg} />
        <Segmented label="Presets" value={deg} onChange={setDeg} options={PRESETS} />
        <Button onClick={bump}>Resample 20 training sets</Button>
      </Controls>
      <Readout
        items={[
          ['bias²', row.bias2.toFixed(3)],
          ['variance', row.variance.toFixed(3)],
          ['noise', NOISE_FLOOR.toFixed(3)],
          ['expected error', row.total.toFixed(3)],
        ]}
      />
    </Figure>
  )
}
