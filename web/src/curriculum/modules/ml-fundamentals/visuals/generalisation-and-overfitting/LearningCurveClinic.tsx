import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Grid, Axes, Path, Dots, Label, HLine, usePlot, useNarrow } from '../../../../../kit'
import { NOISE_FLOOR } from './polyfit'
import { learningCurve, diagnose, type CurvePoint, type Diagnosis } from './curves'

/*
  Learning-curve clinic. A learning curve plots training error and validation error against the
  size of the training set. Pick a patient (high bias, high variance, good fit), read the curves,
  then try a remedy: more data, a bigger or simpler model, or more regularisation. Every curve is
  recomputed from real fits (polynomials with a smoothness penalty, 60 random training sets per size, 30 for the 640-point curves).
  Aha: the shape of the gap tells you whether to collect data or change the model.
*/

type Scenario = Diagnosis
const DEGS = [1, 3, 5, 9, 15]
const LAMS = [0, 1e-4, 1e-3, 1e-2, 1e-1]
const NMAX = [40, 160, 640]
const START: Record<Scenario, { d: number; l: number; n: number }> = {
  bias: { d: 0, l: 0, n: 0 },
  variance: { d: 4, l: 0, n: 0 },
  good: { d: 2, l: 0, n: 0 },
}
const Y_TOP = 0.7
/** --viz-6 alone is too faint for small text on a light surface; mixing in ink keeps the hue and lifts contrast in both themes */
const UNDER_TEXT = 'color-mix(in srgb, var(--viz-6) 75%, var(--ink))'

/**
 * Learning curves are expensive (hundreds of polynomial fits), so each one is computed once and shared
 * by the remedy handler and the render. With 640 points, 30 runs per size already give the same
 * medians to 3 decimals as 60, at half the cost.
 */
const CURVES = new Map<string, CurvePoint[]>()
function curveFor(di: number, li: number, ni: number): CurvePoint[] {
  const key = `${di}|${li}|${ni}`
  let c = CURVES.get(key)
  if (!c) {
    c = learningCurve(DEGS[di], LAMS[li], NMAX[ni], NMAX[ni] >= 640 ? 30 : 60)
    CURVES.set(key, c)
  }
  return c
}

const VERDICT: Record<Diagnosis, { title: string; text: string; color: string; textColor: string }> = {
  bias: {
    title: 'High bias (underfitting)',
    text: 'Both errors are high, close together and far above the noise floor: the model cannot even fit its own training data. More data will not help. Use a more flexible model or better features, or regularise less.',
    color: 'var(--viz-6)',
    textColor: UNDER_TEXT,
  },
  variance: {
    title: 'High variance (overfitting)',
    text: 'Training error is low (often far below the noise floor: it has memorised noise) but validation error is much higher. The big gap says: get more data, regularise more, or use a simpler model.',
    color: 'var(--viz-neg)',
    textColor: 'var(--viz-neg)',
  },
  good: {
    title: 'Good fit',
    text: 'Both errors are low, close together and close to the noise floor. (A training error slightly below the floor is normal: every fit bends a little towards the noise in its own training points.) There is little left to gain on this data.',
    color: 'var(--viz-pos)',
    textColor: 'var(--viz-pos)',
  },
}

const lamText = (l: number) => (l === 0 ? 'none' : String(l))

/** shade the gap between the two curves */
function Gap({ c }: { c: CurvePoint[] }) {
  const { xs, ys, clipId } = usePlot()
  const top = c.map((p) => `${xs(p.n).toFixed(1)},${ys(Math.min(p.val, Y_TOP * 1.2)).toFixed(1)}`)
  const bottom = c
    .slice()
    .reverse()
    .map((p) => `${xs(p.n).toFixed(1)},${ys(Math.min(p.train, Y_TOP * 1.2)).toFixed(1)}`)
  return <polygon clipPath={`url(#${clipId})`} points={[...top, ...bottom].join(' ')} style={{ fill: 'color-mix(in srgb, var(--viz-2) 16%, transparent)' }} />
}

export default function LearningCurveClinic() {
  const [scenario, setScenario] = useState<Scenario>('variance')
  const [di, setDi] = useState(START.variance.d)
  const [li, setLi] = useState(START.variance.l)
  const [ni, setNi] = useState(START.variance.n)
  const [note, setNote] = useState<{ text: string; tone: 'good' | 'bad' | 'flat' } | null>(null)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const curve = useMemo(() => curveFor(di, li, ni), [di, li, ni])
  const last = curve[curve.length - 1]
  const diag = diagnose(curve)
  const v = VERDICT[diag]
  const nMax = NMAX[ni]

  const pick = (s: Scenario) => {
    setScenario(s)
    setDi(START[s].d)
    setLi(START[s].l)
    setNi(START[s].n)
    setNote(null)
  }

  /** apply a remedy and describe what it did to the final validation error and the gap */
  const remedy = (label: string, next: { d?: number; l?: number; n?: number }) => {
    const nd = next.d ?? di
    const nl = next.l ?? li
    const nn = next.n ?? ni
    const after = curveFor(nd, nl, nn)
    const a = after[after.length - 1]
    const before = last
    const change = a.val / before.val
    const tone = change < 0.9 ? 'good' : change > 1.1 ? 'bad' : 'flat'
    const verb = tone === 'good' ? 'helped' : tone === 'bad' ? 'made it worse' : 'made almost no difference'
    setNote({
      text: `${label} ${verb}: validation error ${before.val.toFixed(3)} → ${a.val.toFixed(3)}, gap ${(before.val - before.train).toFixed(3)} → ${(a.val - a.train).toFixed(3)}.`,
      tone,
    })
    setDi(nd)
    setLi(nl)
    setNi(nn)
  }

  const cap = (y: number) => Math.min(y, Y_TOP)
  const card: CSSProperties = {
    width: '100%',
    borderRadius: 'var(--radius-m)',
    borderLeft: `5px solid ${v.color}`,
    background: 'var(--surface-2)',
    padding: '0.55rem 0.8rem',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  }

  return (
    <Figure
      title="Learning-curve clinic: diagnose, then treat"
      caption={
        <>
          Each curve shows the typical training error (blue) and validation error (orange) after training on that many points, from 30 to 60 random
          training sets per size. Pick a patient, read the gap, then try the remedies. Notice that <b>more data</b> shrinks a variance gap but does
          nothing for high bias, while a <b>bigger model</b> rescues high bias (try it on the Good-fit patient to see it open a variance gap). Too
          much regularisation turns high variance into high bias.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.7rem', justifyItems: 'center' }}>
        <Segmented
          label="Patient"
          value={scenario}
          onChange={pick}
          options={[
            { value: 'bias', label: 'High bias' },
            { value: 'variance', label: 'High variance' },
            { value: 'good', label: 'Good fit' },
          ]}
        />
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-2)', textAlign: 'center' }}>
          Error (MSE) against training-set size. Model: polynomial of degree <b>{DEGS[di]}</b>, regularisation λ = <b>{lamText(LAMS[li])}</b>, up to <b>{nMax}</b> training points
        </div>
        <Plot
          x={[10, nMax * 1.04]}
          y={[0, Y_TOP]}
          width={narrow ? 360 : 600}
          height={narrow ? 270 : 300}
          maxWidth={700}
          margin={{ left: 44, top: 18, right: narrow ? 14 : 20 }}
          ariaLabel={`Learning curves: training error ${last.train.toFixed(3)} and validation error ${last.val.toFixed(3)} at ${last.n} points. Diagnosis: ${v.title}.`}
        >
          <Grid xTicks={8} yTicks={7} />
          <Gap c={curve} />
          <Axes xLabel="training-set size" xTicks={narrow ? 4 : 8} yTicks={7} />
          <HLine y={NOISE_FLOOR} color="var(--viz-3)" dash="4 4" width={1.6} />
          <Path points={curve.map((p): [number, number] => [p.n, cap(p.train)])} color="var(--viz-1)" width={2.8} />
          <Path points={curve.map((p): [number, number] => [p.n, cap(p.val)])} color="var(--viz-2)" width={2.8} />
          <Dots points={curve.map((p) => ({ x: p.n, y: cap(p.train), r: 4, color: 'var(--viz-1)' }))} />
          <Dots points={curve.map((p) => ({ x: p.n, y: cap(p.val), r: p.val > Y_TOP ? 5 : 4, color: 'var(--viz-2)', shape: p.val > Y_TOP ? ('triangle' as const) : undefined }))} />
          {last.val - last.train > 0.02 && (
            <Label x={last.n} y={(cap(last.val) + last.train) / 2} dx={-8} dy={4} anchor="end" size={12} color="var(--viz-2)" weight={700}>
              {`gap ${(last.val - last.train).toFixed(3)}`}
            </Label>
          )}
          <Label x={last.n} y={cap(last.val)} dx={-6} dy={-9} anchor="end" size={12} color="var(--viz-2)" weight={700}>
            validation
          </Label>
          <Label x={last.n} y={last.train} dx={-6} dy={16} anchor="end" size={12} color="var(--viz-1)" weight={700}>
            training
          </Label>
        </Plot>
        <div style={{ display: 'flex', gap: '0.9rem', fontSize: '0.8rem', color: 'var(--ink-2)', flexWrap: 'wrap', justifyContent: 'center', marginTop: '-0.4rem' }}>
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
            <b style={{ color: 'var(--viz-3)' }}>- -</b> noise floor σ² = {NOISE_FLOOR.toFixed(2)} (no model can beat it)
          </span>
        </div>
        <div style={card} aria-live="polite">
          <b style={{ color: v.textColor }}>{v.title}.</b> {v.text}
        </div>
        {note && (
          <div
            style={{
              width: '100%',
              fontSize: '0.88rem',
              color: 'var(--ink)',
              padding: '0.4rem 0.7rem',
              borderRadius: 'var(--radius-m)',
              background: note.tone === 'good' ? 'color-mix(in srgb, var(--viz-pos) 12%, var(--surface))' : note.tone === 'bad' ? 'color-mix(in srgb, var(--viz-neg) 12%, var(--surface))' : 'var(--surface-2)',
            }}
          >
            {note.text}
          </div>
        )}
      </div>
      <Controls>
        <Button onClick={() => remedy('More data', { n: ni + 1 })} disabled={ni >= NMAX.length - 1}>
          More data (×4)
        </Button>
        <Button onClick={() => remedy('A bigger model', { d: di + 1 })} disabled={di >= DEGS.length - 1}>
          Bigger model
        </Button>
        <Button onClick={() => remedy('A simpler model', { d: di - 1 })} disabled={di <= 0}>
          Simpler model
        </Button>
        <Button onClick={() => remedy('More regularisation', { l: li + 1 })} disabled={li >= LAMS.length - 1}>
          Regularise more
        </Button>
        <Button onClick={() => pick(scenario)}>Reset patient</Button>
      </Controls>
      <Readout
        items={[
          ['training error', last.train.toFixed(3)],
          ['validation error', last.val > 10 ? last.val.toExponential(1) : last.val.toFixed(3)],
          ['gap', (last.val - last.train).toFixed(3)],
        ]}
      />
    </Figure>
  )
}
