import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Grid, Axes, Path, Dots, VLine, HLine, Label, Bars, useNarrow } from '../../../../../kit'
import { FEATURES, makeRegData, ridgeFit, lassoFit } from './regData'

/*
  Regularisation paths on a 6-feature flat-price dataset (15 training flats). Top: every
  coefficient against log₁₀ λ. Bottom left: validation MSE against log₁₀ λ. Bottom right: the
  coefficients at the current λ. The knob can be shown as λ or as scikit-learn's C = 1/λ.
*/

type Kind = 'ridge' | 'lasso'
type Knob = 'lambda' | 'C'
const COLORS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)']
const LO = -2
const HI = 2
const STEP = 0.05
const GRID = Array.from({ length: Math.round((HI - LO) / STEP) + 1 }, (_, i) => +(LO + i * STEP).toFixed(2))
const DATA = makeRegData()
const YC = DATA.ytr.map((v) => v - DATA.yMean)
const valMSE = (w: number[]) => DATA.Xva.reduce((s, x, i) => s + (x.reduce((a, v, j) => a + v * w[j], 0) + DATA.yMean - DATA.yva[i]) ** 2, 0) / DATA.yva.length

function paths(kind: Kind) {
  const ws: number[][] = []
  let prev: number[] | undefined
  // go from strong to weak regularisation so each lasso fit warm-starts from the previous one
  for (let i = GRID.length - 1; i >= 0; i--) {
    const lam = 10 ** GRID[i]
    const w = kind === 'ridge' ? ridgeFit(DATA.Xtr, YC, lam) : lassoFit(DATA.Xtr, YC, lam, prev)
    ws[i] = w
    prev = w
  }
  const val = ws.map(valMSE)
  const best = val.indexOf(Math.min(...val))
  return { ws, val, best }
}

const fmt = (lg: number) => {
  const v = 10 ** lg
  return v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v >= 0.1 ? v.toFixed(2) : v.toFixed(3)
}

export default function RegularisationPath() {
  const [kind, setKind] = useState<Kind>('lasso')
  const [knob, setKnob] = useState<Knob>('lambda')
  const [idx, setIdx] = useState(GRID.indexOf(-1.5))
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const P = useMemo(() => ({ ridge: paths('ridge'), lasso: paths('lasso') }), [])
  const p = P[kind]
  const lg = GRID[idx]
  const w = p.ws[idx]
  const nonZero = w.filter((v) => Math.abs(v) > 1e-9).length
  const vals = [...P.ridge.val, ...P.lasso.val]
  const vLo = Math.floor(Math.min(...vals) - 1)
  const vHi = Math.ceil(Math.max(...vals) + 1)
  const wAll = [...P.ridge.ws.flat(), ...P.lasso.ws.flat()]
  const yLo = Math.floor(Math.min(...wAll)) - 0.5
  const yHi = Math.ceil(Math.max(...wAll)) + 0.5
  const xLabel = knob === 'lambda' ? 'log₁₀ λ  (stronger →)' : 'log₁₀ λ = −log₁₀ C  (C grows ←)'

  return (
    <Figure
      title="Turning the regularisation knob"
      caption={
        <>
          Predicting made-up flat prices from 6 standardised features, two of which (postal digit, listing weekday) are pure noise, using only 15 training
          flats. Slide the knob. With <b>lasso</b>, coefficients hit exactly 0 one after another, noise features first; with <b>ridge</b> they all shrink
          smoothly together. The validation error (bottom left) is U-shaped: find its lowest point. Switch the knob to <b>C</b> and notice it moves the other
          way: small C means strong regularisation.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: 10 }}>
        <Plot
          x={[LO, HI]}
          y={[yLo, yHi]}
          width={620}
          height={250}
          minHeight={230}
          margin={{ left: 36, top: 22, bottom: 36 }}
          ariaLabel={`${kind} coefficient paths against log lambda`}
        >
          <Grid xTicks={8} yTicks={6} />
          <HLine y={0} color="var(--viz-axis)" dash="" width={1.2} />
          <Axes xLabel={xLabel} yLabel="coefficient" xTicks={8} yTicks={6} />
          {FEATURES.map((_, j) => (
            <Path key={j} points={GRID.map((g, i) => [g, p.ws[i][j]] as [number, number])} color={COLORS[j]} width={2.5} />
          ))}
          <VLine x={lg} color="var(--viz-ink)" dash="5 4" />
          <Dots
            points={w.map((v, j) => ({
              x: lg,
              y: v,
              r: 4.5,
              color: COLORS[j],
            }))}
          />
        </Plot>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: narrow ? '1fr' : '1fr 1fr',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <Plot
            x={[LO, HI]}
            y={[vLo, vHi]}
            width={320}
            height={210}
            minHeight={190}
            margin={{ left: 36, top: 22, bottom: 36 }}
            ariaLabel="Validation MSE against log lambda"
          >
            <Grid xTicks={4} yTicks={4} />
            <Axes xLabel="log₁₀ λ" yLabel="validation MSE" xTicks={4} yTicks={4} />
            <Path points={GRID.map((g, i) => [g, p.val[i]] as [number, number])} color="var(--viz-2)" width={2.5} />
            <VLine x={lg} color="var(--viz-ink)" dash="5 4" />
            <Dots
              points={[
                {
                  x: GRID[p.best],
                  y: p.val[p.best],
                  r: 6,
                  color: 'var(--viz-pos)',
                  shape: 'square',
                },
                { x: lg, y: p.val[idx], r: 5.5, color: 'var(--viz-2)' },
              ]}
            />
            <Label x={GRID[p.best]} y={p.val[p.best]} dy={-12} anchor="middle" color="var(--viz-pos)" weight={700}>
              best
            </Label>
          </Plot>
          <div style={{ display: 'grid', gap: 6, width: '100%' }}>
            <div
              style={{
                fontSize: 'var(--step--1)',
                fontWeight: 700,
                color: 'var(--ink-2)',
              }}
            >
              {kind === 'ridge' ? 'Ridge' : 'Lasso'} coefficients at λ = {fmt(lg)}
            </div>
            <Bars
              data={FEATURES.map((f, j) => ({
                label: f,
                value: w[j],
                color: COLORS[j],
                strong: Math.abs(w[j]) > 1e-9,
              }))}
              max={Math.max(...P.ridge.ws[0].map(Math.abs))}
              format={(v) => (Math.abs(v) < 1e-9 ? '0 (off)' : v.toFixed(2))}
              ariaLabel="Current coefficients"
            />
          </div>
        </div>
      </div>
      <Controls>
        <Segmented
          label="Penalty"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'lasso', label: 'Lasso (L1)' },
            { value: 'ridge', label: 'Ridge (L2)' },
          ]}
        />
        <Segmented
          label="Knob shows"
          value={knob}
          onChange={setKnob}
          options={[
            { value: 'lambda', label: 'λ' },
            { value: 'C', label: 'C = 1/λ' },
          ]}
        />
        <Button onClick={() => setIdx(p.best)}>Jump to the best λ</Button>
      </Controls>
      <Controls>
        {knob === 'lambda' ? (
          <Slider label="λ (log scale): bigger = stronger penalty" value={idx} min={0} max={GRID.length - 1} onChange={setIdx} format={(i) => fmt(GRID[i])} />
        ) : (
          <Slider
            label="C (log scale): bigger = WEAKER penalty"
            value={GRID.length - 1 - idx}
            min={0}
            max={GRID.length - 1}
            onChange={(i) => setIdx(GRID.length - 1 - i)}
            format={(i) => fmt(-GRID[GRID.length - 1 - i])}
          />
        )}
      </Controls>
      <Readout
        items={[
          ['λ', fmt(lg)],
          ['C = 1/λ', fmt(-lg)],
          ['validation MSE', p.val[idx].toFixed(2)],
          ['non-zero weights', `${nonZero} of 6`],
          ['intercept (not penalised)', DATA.yMean.toFixed(2)],
        ]}
      />
    </Figure>
  )
}
