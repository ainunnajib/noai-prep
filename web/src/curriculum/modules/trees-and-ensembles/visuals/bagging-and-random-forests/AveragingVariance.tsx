import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, Rect, Dots, Path, Label, VLine, HLine, FnPath, mulberry32, useNarrow } from '../../../../../kit'
import { gauss } from '../decision-trees/cart'
import { TXT_GREEN } from '../tones'
import s from '../decision-trees/trees.module.css'

/*
  Why averaging works, and why correlation limits it. Each "tree" predicts the price of one flat
  as truth + error, where errors have spread σ and pairwise correlation ρ. Repeating the whole
  experiment 150 times shows how much one tree's prediction wobbles compared with the average of
  B trees. Theory: Var(average) = ρσ² + (1 − ρ)σ²/B.
*/

const R = 150
const BMAX = 100
const TRUTH = 500
const SIGMA = 60

// shared noise for each repeat (z0) and each tree's own noise (cumulative sums for fast averages)
const NOISE = (() => {
  const rng = mulberry32(2718)
  const z0: number[] = []
  const first: number[] = []
  const cum: Float64Array[] = []
  const jit: number[] = []
  for (let r = 0; r < R; r++) {
    z0.push(gauss(rng))
    const c = new Float64Array(BMAX)
    let acc = 0
    for (let b = 0; b < BMAX; b++) {
      const z = gauss(rng)
      if (b === 0) first.push(z)
      acc += z
      c[b] = acc
    }
    cum.push(c)
    jit.push(rng() * 2 - 1)
  }
  return { z0, first, cum, jit }
})()

const sd = (v: number[]) => {
  const m = v.reduce((a, b) => a + b, 0) / v.length
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length)
}

export default function AveragingVariance() {
  const [B, setB] = useState(25)
  const [rho, setRho] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(620)
  const { single, avg } = useMemo(() => {
    const a = Math.sqrt(rho)
    const c = Math.sqrt(1 - rho)
    const single = NOISE.z0.map((z0, r) => TRUTH + SIGMA * (a * z0 + c * NOISE.first[r]))
    const avg = NOISE.z0.map((z0, r) => TRUTH + SIGMA * (a * z0 + (c * NOISE.cum[r][B - 1]) / B))
    return { single, avg }
  }, [B, rho])
  const theory = rho + (1 - rho) / B
  const sdSingle = sd(single)
  const sdAvg = sd(avg)
  const measured = (sdAvg / sdSingle) ** 2

  const strip = (
    <Plot x={[TRUTH - 190, TRUTH + 190]} y={[-0.6, 2.75]} width={360} height={250} minHeight={230} margin={{ left: 12, right: 12, top: 12, bottom: 36 }} ariaLabel={`One tree's predictions spread ±${sdSingle.toFixed(0)}; the average of ${B} trees spreads ±${sdAvg.toFixed(0)}`}>
      <Rect x0={TRUTH - sdSingle} x1={TRUTH + sdSingle} y0={1.45} y1={2.35} fill="color-mix(in srgb, var(--viz-4) 12%, transparent)" />
      <Rect x0={TRUTH - sdAvg} x1={TRUTH + sdAvg} y0={-0.45} y1={0.45} fill="color-mix(in srgb, var(--viz-3) 16%, transparent)" />
      <Axes xLabel="predicted price of one flat ($k)" xTicks={5} hideYTicks />
      <VLine x={TRUTH} color="var(--viz-ink)" dash="4 4" width={1.5} />
      <Dots points={single.map((v, r) => ({ x: v, y: 1.9 + 0.38 * NOISE.jit[r], r: 3, color: 'var(--viz-4)' }))} stroke="none" />
      <Dots points={avg.map((v, r) => ({ x: v, y: 0.38 * NOISE.jit[r], r: 3, color: 'var(--viz-3)' }))} stroke="none" />
      <Label x={TRUTH - 186} y={2.62} color="var(--viz-4)" weight={700} size={12}>
        one tree (150 repeats)
      </Label>
      <Label x={TRUTH - 186} y={0.72} color={TXT_GREEN} weight={700} size={12}>
        {`average of ${B} ${B === 1 ? 'tree' : 'trees'}`}
      </Label>
      <Label x={TRUTH} y={2.62} dx={6} color="var(--viz-ink)" size={11}>
        true price
      </Label>
    </Plot>
  )

  const curve = (
    <Plot x={[1, BMAX]} y={[0, 1.05]} width={360} height={250} minHeight={230} margin={{ left: 42, right: 12, top: 18, bottom: 36 }} ariaLabel={`Variance of the average falls from 1 towards ${rho.toFixed(2)} as trees are added`}>
      <Grid xTicks={5} yTicks={5} />
      <Axes xLabel="number of trees B" xTicks={5} yTicks={5} />
      {rho > 0 && <HLine y={rho} color="var(--viz-5)" dash="6 4" width={1.8} label={`floor = ρ = ${rho.toFixed(2)}`} />}
      <FnPath f={(b) => rho + (1 - rho) / b} color="var(--viz-3)" width={2.8} samples={300} />
      <Path points={[[B, 0], [B, theory]]} color="var(--viz-muted)" width={1.2} dash="3 3" />
      <Dots points={[{ x: B, y: theory, r: 6, color: 'var(--viz-3)' }]} />
    </Plot>
  )

  const sliders = (
    <Controls>
      <Slider label="number of trees B" value={B} min={1} max={BMAX} step={1} onChange={setB} />
      <Slider label="correlation between trees ρ" value={rho} min={0} max={0.9} step={0.05} onChange={setRho} format={(v) => v.toFixed(2)} />
    </Controls>
  )

  return (
    <Figure
      title="Why averaging many trees helps (and what limits it)"
      caption={
        <>
          Slide <b>B</b> up with ρ = 0, then raise the correlation <b>ρ</b>. Notice the green averages squeeze towards the true price, but their variance
          never drops below ρ, however many trees you add.
        </>
      }
    >
      {/* on phones the sliders sit right under the dots they move */}
      <div ref={wrapRef} className={s.panels} style={{ gridTemplateColumns: narrow ? '1fr' : '1fr 1fr' }}>
        <div>
          <p className={s.panelTitle}>Predictions over 150 repeats of the experiment</p>
          {strip}
        </div>
        {narrow && sliders}
        <div>
          <p className={s.panelTitle}>Variance of the average (one tree = 1)</p>
          {curve}
        </div>
      </div>
      <Readout
        items={[
          ['formula ρ + (1 − ρ)/B', theory.toFixed(3)],
          ['measured from the dots', measured.toFixed(3)],
          ["spread of one tree", `±$${sdSingle.toFixed(0)}k`],
          ["spread of the average", `±$${sdAvg.toFixed(0)}k`],
        ]}
      />
      {!narrow && sliders}
    </Figure>
  )
}
