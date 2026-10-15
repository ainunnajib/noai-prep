import { useMemo, useState } from 'react'
import {
  Figure,
  Controls,
  Readout,
  Slider,
  Segmented,
  Toggle,
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
  Rect,
  useBump,
  useNarrow,
} from '../../../../../kit'
import { truth, NOISE_FLOOR, makeRng, sample, fitPoly, predict, mse } from './polyfit'

/*
  Under- and overfitting with polynomials. Left: noisy training points drawn from a hidden curve,
  the polynomial that fit() finds, and (optionally) fresh validation points. Right: training and
  validation error for EVERY degree 1-15 on this same data, with the current degree marked.
  Slide the degree, resample, and add training points. Aha: training error only ever falls, but
  validation error is U-shaped; more data pushes the bottom of the U (and the overfitting) further right.
*/

const MAX_DEG = 15
const Y_TOP = 0.7
const N_VAL = 60
/** --viz-6 alone is too faint for small text on a light surface; mixing in ink keeps the hue and lifts contrast in both themes */
const UNDER_TEXT = 'color-mix(in srgb, var(--viz-6) 75%, var(--ink))'

export default function PolynomialOverfit() {
  const [deg, setDeg] = useState(3)
  const [nTrain, setNTrain] = useState(20)
  const [showVal, setShowVal] = useState(true)
  const [seed, bump] = useBump()
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(640)

  const data = useMemo(() => {
    // seed 27 is the first dataset shown: a typical draw with a clean U at 20 points
    const s = 27 + seed
    const train = sample(makeRng(1000 + s * 97 + nTrain), nTrain)
    const val = sample(makeRng(5000 + s * 131), N_VAL, 1)
    const curves = Array.from({ length: MAX_DEG }, (_, i) => {
      const c = fitPoly(train.x, train.y, i + 1)
      return { c, tr: mse(c, train.x, train.y), va: mse(c, val.x, val.y) }
    })
    let best = 0
    curves.forEach((k, i) => {
      if (k.va < curves[best].va) best = i
    })
    return { train, val, curves, best: best + 1 }
  }, [seed, nTrain])

  const cur = data.curves[deg - 1]
  const minVa = data.curves[data.best - 1].va
  const verdict =
    cur.va <= 1.2 * minVa
      ? { text: 'good fit: near the bottom of the U', color: 'var(--viz-pos)' }
      : deg < data.best
        ? { text: 'underfitting: both errors high', color: UNDER_TEXT }
        : { text: 'overfitting: low training error, high validation error', color: 'var(--viz-neg)' }

  const fmt = (v: number) => (v >= 100 ? v.toExponential(1) : v >= 10 ? v.toFixed(1) : v.toFixed(3))
  const capped = (v: number) => Math.min(v, Y_TOP)
  const pw = narrow ? 360 : 340
  const ph = narrow ? 260 : 280

  return (
    <Figure
      title="Underfitting and overfitting: slide the degree"
      caption={
        <>
          The grey dashed curve is the hidden pattern; the blue dots are the training points (pattern + noise) and the hollow orange dots are the
          validation points, which the fit never sees. Slide the <b>degree</b> to make the
          polynomial more flexible, or tap a degree on the right-hand chart. Watch the blue <b>training error</b> fall every time while the orange{' '}
          <b>validation error</b>, measured on {N_VAL} fresh points, falls and then shoots up. Then press <b>New random data</b> a few times, and
          switch to 40 or 80 training points: the bottom of the U spreads to the right and overfitting needs a much higher degree.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.75rem', alignItems: 'start' }}
      >
        <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>The data and the degree-{deg} fit</div>
          <Plot x={[0, 1]} y={[-2, 2]} width={pw} height={ph} maxWidth={480} margin={{ left: 34 }} ariaLabel={`Training points and a degree ${deg} polynomial fit`}>
            <Grid xTicks={5} yTicks={4} />
            <Axes xLabel="x" yLabel="y" xTicks={5} yTicks={4} />
            <FnPath f={truth} color="var(--viz-muted)" width={2} dash="6 5" />
            {showVal && <Dots points={data.val.x.map((x, i) => ({ x, y: data.val.y[i], r: 3.5, hollow: true, color: 'var(--viz-2)' }))} />}
            <Dots points={data.train.x.map((x, i) => ({ x, y: data.train.y[i], r: 5, color: 'var(--viz-1)' }))} />
            <FnPath f={(x) => predict(cur.c, x)} color="var(--viz-ink)" width={3} samples={400} />
          </Plot>
          <div style={{ display: 'flex', gap: '0.2rem 0.9rem', fontSize: '0.8rem', color: 'var(--ink-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>
              <b style={{ color: 'var(--viz-muted)' }}>- -</b> hidden pattern
            </span>
            <span>
              <b style={{ color: 'var(--viz-1)' }}>●</b> training points
            </span>
            {showVal && (
              <span>
                <b style={{ color: 'var(--viz-2)' }}>○</b> validation points
              </span>
            )}
            <span>
              <b style={{ color: 'var(--viz-ink)' }}>━</b> degree-{deg} fit
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>Error (MSE) for every degree on this data</div>
          <Plot
            x={[0.5, MAX_DEG + 0.5]}
            y={[0, Y_TOP]}
            width={pw}
            height={ph}
            maxWidth={480}
            margin={{ left: 42, top: 22 }}
            ariaLabel={`Training and validation error against polynomial degree. Lowest validation error at degree ${data.best}.`}
            onPointerDown={([x]) => setDeg(Math.max(1, Math.min(MAX_DEG, Math.round(x))))}
          >
            {data.curves.map((k, i) =>
              k.va > 1.2 * minVa ? (
                <Rect
                  key={i}
                  x0={i + 0.5}
                  x1={i + 1.5}
                  y0={0}
                  y1={Y_TOP}
                  fill={i + 1 < data.best ? 'color-mix(in srgb, var(--viz-6) 10%, transparent)' : 'color-mix(in srgb, var(--viz-neg) 8%, transparent)'}
                />
              ) : null,
            )}
            <Grid xTicks={15} yTicks={7} />
            <Axes xLabel="degree" xTicks={narrow ? 8 : 15} yTicks={7} />
            <HLine y={NOISE_FLOOR} color="var(--viz-3)" dash="3 4" width={1.5} />
            <VLine x={deg} color="var(--viz-ink)" dash="" width={1.5} />
            <Path points={data.curves.map((k, i): [number, number] => [i + 1, capped(k.tr)])} color="var(--viz-1)" width={2.5} />
            <Path points={data.curves.map((k, i): [number, number] => [i + 1, capped(k.va)])} color="var(--viz-2)" width={2.5} />
            <Dots points={data.curves.map((k, i) => ({ x: i + 1, y: capped(k.tr), r: i + 1 === deg ? 6 : 3.5, color: 'var(--viz-1)' }))} />
            <Dots
              points={data.curves.map((k, i) => ({
                x: i + 1,
                y: capped(k.va),
                r: i + 1 === deg ? 6 : 3.5,
                color: 'var(--viz-2)',
                shape: k.va > Y_TOP ? ('triangle' as const) : undefined,
              }))}
            />
            <Label x={data.best} y={data.curves[data.best - 1].va} dy={-12} anchor="middle" size={12} color="var(--viz-2)" weight={700}>
              best
            </Label>
            <Label x={0.6} y={Y_TOP} dy={-8} size={11} color={UNDER_TEXT} weight={700}>
              ← underfitting
            </Label>
            <Label x={MAX_DEG + 0.4} y={Y_TOP} dy={-8} anchor="end" size={11} color="var(--viz-neg)" weight={700}>
              overfitting →
            </Label>
          </Plot>
          <div style={{ display: 'flex', gap: '0.9rem', fontSize: '0.8rem', color: 'var(--ink-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span>
              <b style={{ color: 'var(--viz-1)' }}>●</b> training error
            </span>
            <span>
              <b style={{ color: 'var(--viz-2)' }}>●</b> validation error
            </span>
            <span>
              <b style={{ color: 'var(--viz-2)' }}>▲</b> off the chart
            </span>
            <span>
              <b style={{ color: 'var(--viz-3)' }}>- -</b> noise floor σ² = {NOISE_FLOOR.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <Controls>
        <Slider label="polynomial degree (flexibility)" value={deg} min={1} max={MAX_DEG} step={1} onChange={setDeg} />
        <Segmented
          label="Training points"
          value={nTrain}
          onChange={setNTrain}
          options={[
            { value: 20, label: '20' },
            { value: 40, label: '40' },
            { value: 80, label: '80' },
          ]}
        />
        <Button onClick={bump}>New random data</Button>
        <Toggle label="show validation points" checked={showVal} onChange={setShowVal} />
      </Controls>
      <Readout
        items={[
          ['training MSE', fmt(cur.tr)],
          ['validation MSE', fmt(cur.va)],
          ['best degree here', String(data.best)],
          [
            'verdict',
            <span key="v" style={{ color: verdict.color, fontFamily: 'var(--font-body)' }}>
              {verdict.text}
            </span>,
          ],
        ]}
      />
    </Figure>
  )
}
