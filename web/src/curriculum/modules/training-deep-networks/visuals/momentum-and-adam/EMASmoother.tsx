import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, Plot, Grid, Axes, Path, Dots, Rect, Label, useNarrow, useBump, mulberry32 } from '../../../../../kit'

/*
  A noisy stream of gradient values g_t (dots): the underlying signal is +2 for 50 steps, then −1.
  Its exponential moving average m_t = β·m_{t−1} + (1 − β)·g_t (m_0 = 0) is the solid line;
  the bias-corrected m̂_t = m_t / (1 − β^t) is optional. Below: how much the value from k steps ago
  counts in today's average, (1 − β)·β^k.
*/

const T = 100
const JUMP = 50
const signal = (t: number) => (t <= JUMP ? 2 : -1)

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-12)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

export default function EMASmoother() {
  const [beta, setBeta] = useState(0.9)
  const [corrected, setCorrected] = useState(false)
  const [seed, bump] = useBump()
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const g = useMemo(() => {
    const r = mulberry32(31 + seed * 977)
    return Array.from({ length: T }, (_, i) => signal(i + 1) + 1.3 * gauss(r))
  }, [seed])

  const { ema, hat } = useMemo(() => {
    let m = 0
    const ema: [number, number][] = [[0, 0]]
    const hat: [number, number][] = []
    g.forEach((v, i) => {
      const t = i + 1
      m = beta * m + (1 - beta) * v
      ema.push([t, m])
      hat.push([t, beta === 0 ? m : m / (1 - beta ** t)])
    })
    return { ema, hat }
  }, [g, beta])

  const memory = beta < 1 ? 1 / (1 - beta) : Infinity
  // steps after the jump until the average first falls below the halfway level (0.5)
  const lag = (() => {
    const src = corrected ? hat : ema.slice(1)
    for (let i = JUMP; i < src.length; i++) if (src[i][1] < 0.5) return src[i][0] - JUMP
    return null
  })()
  const K = 30
  const weights = Array.from({ length: K }, (_, k) => (1 - beta) * beta ** k)

  return (
    <Figure
      title="Smoothing a noisy signal with an exponential moving average"
      caption={
        <>
          The dots are noisy gradient values: on average +2 for 50 steps, then −1 (dashed). The solid line is their exponential moving average.
          Slide β from 0 to 0.99: at β = 0 the average just copies the latest dot; at β = 0.9 it is smooth but takes several steps to notice
          the jump; at β = 0.99 it is very smooth but very slow. Look at the start too: the average begins at 0 and creeps up. Switch on{' '}
          <b>bias correction</b> to fix that. The bars below show how much each past value counts today.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.4rem' }}>
        <Plot x={[0, T]} y={[-4.5, 6]} width={narrow ? 360 : 540} height={narrow ? 230 : 260} maxWidth={680} minHeight={210} ariaLabel={`Noisy values and their moving average with beta ${beta.toFixed(2)}`}>
          <Grid xTicks={10} yTicks={5} />
          <Axes xLabel="step t" yLabel="gradient value" xTicks={narrow ? 5 : 10} yTicks={5} />
          <Path points={[[0, 2], [JUMP, 2], [JUMP, -1], [T, -1]]} color="var(--viz-muted)" width={1.5} dash="5 4" />
          <Dots points={g.map((v, i) => ({ x: i + 1, y: v, r: 2.6, color: 'color-mix(in srgb, var(--viz-ink) 45%, var(--surface))' }))} stroke="none" />
          <Path points={ema} color="var(--viz-1)" width={2.8} />
          {corrected && <Path points={hat} color="var(--viz-2)" width={2.4} dash="6 4" />}
          <Label x={T} y={6} dx={-4} dy={14} anchor="end" color="var(--viz-1)" weight={700}>
            {corrected ? 'EMA m (solid), corrected m̂ (dashed)' : 'EMA m'}
          </Label>
        </Plot>
        <Plot x={[-0.6, K - 0.4]} y={[0, Math.max(0.12, 1 - beta) * 1.08]} width={narrow ? 360 : 540} height={narrow ? 120 : 120} maxWidth={680} minHeight={110} margin={{ left: 40, bottom: 30, top: 10 }} ariaLabel="Weight of each past value in the average">
          <Axes xLabel="steps ago (k)" xTicks={narrow ? 3 : 6} yTicks={2} />
          {weights.map((w, k) => (
            <Rect key={k} x0={k - 0.36} x1={k + 0.36} y0={0} y1={w} fill={k === 0 ? 'var(--viz-2)' : 'var(--viz-1)'} opacity={0.85} />
          ))}
          <Label x={K - 0.4} y={Math.max(0.12, 1 - beta) * 1.08} dx={-4} dy={14} anchor="end" color="var(--ink-2)" size={12}>
            weight (1 − β)·βᵏ
          </Label>
        </Plot>
      </div>
      <Controls>
        <Slider label="β (how much of the old average to keep)" value={beta} min={0} max={0.99} step={0.01} onChange={setBeta} format={(v) => v.toFixed(2)} />
      </Controls>
      <Controls>
        <Toggle label="Bias correction m̂ = m / (1 − βᵗ)" checked={corrected} onChange={setCorrected} />
        <Button onClick={bump}>New noise</Button>
      </Controls>
      <Readout
        items={[
          ['weight on the newest value, 1 − β', (1 - beta).toFixed(2)],
          ['remembers roughly the last 1/(1 − β)', Number.isFinite(memory) ? `${memory.toFixed(memory < 10 ? 1 : 0)} values` : '∞'],
          ['steps to react to the jump', lag == null ? 'more than 50' : String(lag)],
        ]}
      />
    </Figure>
  )
}
