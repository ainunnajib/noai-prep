import { useState } from 'react'
import { Figure, Controls, Slider, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, Label, DraggablePoint, M, useNarrow } from '../../../../../kit'
import { TXT_GREEN } from '../tones'
import s from './trees.module.css'

/*
  Gini impurity and entropy of a two-flavour bag of sweets, as functions of p = fraction of orange
  sweets. The learner drags p (or slides the number of orange sweets out of 20) and reads both
  measures, with the arithmetic written out.
*/

const N = 20
const giniP = (p: number) => 1 - p * p - (1 - p) * (1 - p)
const entP = (p: number) => (p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p)))
const f2 = (v: number) => (Math.round(v * 100) / 100).toFixed(2)
const f3 = (v: number) => v.toFixed(3)
/** up to 4 decimals without trailing zeros (p is a multiple of 0.05, so p² is exact) */
const f4 = (v: number) => String(Math.round(v * 10000) / 10000)

export default function ImpurityCurves() {
  const [k, setK] = useState(6)
  const [double, setDouble] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLParagraphElement>(440)
  const p = k / N
  const q = 1 - p
  const g = giniP(p)
  const h = entP(p)
  const verdict = k === 0 || k === N ? 'pure: every sweet is the same flavour' : k === N / 2 ? 'a 50-50 mix: the most mixed a two-flavour bag can be' : k < N / 2 ? 'mostly blue' : 'mostly orange'
  const sq = (v: number) => `${f2(v)}^2`
  // on phones the middle step is dropped so the result never wraps onto a line of its own
  const giniTex = narrow
    ? `\\text{Gini} = 1 - (${sq(p)} + ${sq(q)}) = ${f3(g)}`
    : `\\text{Gini} = 1 - (${sq(p)} + ${sq(q)}) = 1 - (${f4(p * p)} + ${f4(q * q)}) = ${f3(g)}`
  const entTex =
    k === 0 || k === N
      ? `H = -(1 \\cdot \\log_2 1) = 0`
      : `H = -(${f2(p)}\\log_2 ${f2(p)} + ${f2(q)}\\log_2 ${f2(q)}) = ${f3(h)}`

  return (
    <Figure
      title="Two ways to score how mixed a bag is"
      caption={
        <>
          Drag the green point or use the slider to change the mix. Notice both scores are 0 for a pure bag and peak at 50-50; switch on <b>Gini × 2</b>{' '}
          to see that the curves have almost the same shape.
        </>
      }
    >
      <div className={s.bag} aria-label={`A bag with ${k} orange and ${N - k} blue sweets`} role="img">
        {Array.from({ length: N }, (_, i) => (
          <span
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              display: 'inline-block',
              background: i < k ? 'var(--viz-2)' : 'var(--viz-1)',
              boxShadow: 'inset 0 -2px 0 color-mix(in srgb, var(--ink) 25%, transparent)',
            }}
          />
        ))}
      </div>
      <p ref={wrapRef} className={s.status} style={{ textAlign: 'center' }}>
        <b className={s.high}>{k} orange</b> and <b className={s.low}>{N - k} blue</b> (p = {f2(p)}): {verdict}
      </p>
      <Plot x={[0, 1]} y={[0, 1.08]} width={460} height={290} minHeight={250} margin={{ top: 24, left: 42, right: 14 }} ariaLabel={`Gini and entropy against the fraction of orange sweets; at p = ${f2(p)}, Gini ${f3(g)} and entropy ${f3(h)}`}>
        <Grid xTicks={10} yTicks={5} />
        <Axes xLabel="p = fraction orange" yLabel="impurity" xTicks={5} yTicks={5} />
        <FnPath f={entP} color="var(--viz-5)" width={3} samples={300} />
        <FnPath f={giniP} color="var(--viz-3)" width={3} samples={300} />
        {double && <FnPath f={(x) => 2 * giniP(x)} color="var(--viz-3)" width={2} dash="6 5" samples={300} />}
        <Path points={[[p, 0], [p, Math.max(g, h)]]} color="var(--viz-muted)" width={1.5} dash="4 4" />
        <Label x={0.5} y={1} dy={-8} anchor="middle" color="var(--viz-5)" weight={700}>
          entropy (max 1)
        </Label>
        <Label x={0.5} y={0.5} dy={-8} anchor="middle" color={TXT_GREEN} weight={700}>
          Gini (max 0.5)
        </Label>
        {double && (
          <Label x={0.22} y={2 * giniP(0.22)} dx={-6} dy={-8} anchor="end" color={TXT_GREEN} size={12} weight={700}>
            Gini × 2
          </Label>
        )}
        <Dots points={[{ x: p, y: h, color: 'var(--viz-5)', r: 6 }]} />
        <DraggablePoint
          x={p}
          y={g}
          color="var(--viz-3)"
          constrain={(x) => {
            const kk = Math.round(Math.min(1, Math.max(0, x)) * N)
            return [kk / N, giniP(kk / N)]
          }}
          onChange={(x) => setK(Math.round(x * N))}
        />
      </Plot>
      <div className={s.formula}>
        <div>
          <M>{giniTex}</M>
        </div>
        <div style={{ marginTop: 6 }}>
          <M>{entTex}</M>
        </div>
      </div>
      <Controls>
        <Slider label="orange sweets (out of 20)" value={k} min={0} max={N} step={1} onChange={setK} />
        <Toggle label="Show Gini × 2" checked={double} onChange={setDouble} />
      </Controls>
    </Figure>
  )
}
