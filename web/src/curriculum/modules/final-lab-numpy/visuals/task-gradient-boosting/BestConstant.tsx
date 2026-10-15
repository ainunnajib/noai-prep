import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Grid, Axes, Path, Dots, Arrow, Label, VLine, Rect, FnPath, DraggablePoint, useNarrow, M } from '../../../../../kit'
import { mean, median, sign, type Loss } from './gb'
import s from './gb.module.css'

/*
  Q1.1 to Q1.4 in one picture. Drag a constant guess c over four targets (y = 3, 1, 2, 10). Each point
  pulls c with its negative gradient: y - c for L2 (the residual) or sign(y - c) for L1. The best constant is
  where the pulls cancel: the mean for L2, the median for L1. Drag the outlier to see which one it moves.
*/

const XS = [1, 2, 3, 4]
const C_RANGE: [number, number] = [0, 12]

export default function BestConstant() {
  const [loss, setLoss] = useState<Loss>('l2')
  const [c, setC] = useState(6)
  const [y4, setY4] = useState(10)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const ys = [3, 1, 2, y4]
  const mu = mean(ys)
  const med = median(ys)
  const g = ys.map((v) => (loss === 'l2' ? v - c : sign(v - c)))
  const sumG = g.reduce((a, b) => a + b, 0)
  const lossAt = (cc: number) => (loss === 'l2' ? mean(ys.map((v) => 0.5 * (v - cc) ** 2)) : mean(ys.map((v) => Math.abs(v - cc))))
  const sorted = [...ys].sort((a, b) => a - b)
  const flatLo = sorted[1]
  const flatHi = sorted[2]
  const best = loss === 'l2' ? mu : med
  const lossMax = loss === 'l2' ? 40 : 9
  const snap = (v: number) => Math.round(v * 10) / 10
  const fmtG = (v: number) => (loss === 'l1' ? (v > 0 ? '+1' : v < 0 ? '−1' : '0') : `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`)

  return (
    <Figure
      wide
      title="Drag the starting guess: where do the pulls cancel?"
      caption={
        <>
          The orange arrows are each point&apos;s <b>negative gradient</b>: how it wants the guess <M>c</M> to move. With <b>L2</b> the arrow is the
          residual <M>{'y - c'}</M>, so far points pull harder; the pulls add up to 0 exactly at the <b>mean</b>. With <b>L1</b> every arrow has
          length 1 (<M>{'\\operatorname{sign}(y - c)'}</M>), so the pulls cancel when as many points sit above <M>c</M> as below: anywhere between
          the middle two values, which includes the <b>median</b>. Now drag the top point (the outlier) up: the mean chases it, the median does not move.
        </>
      }
    >
      <div ref={wrapRef} className={`${s.two} ${s.twoEven}`} style={narrow ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}>
        <div>
          <p className={s.panelLabel}>The targets and the constant guess c</p>
          <Plot x={[0.3, 5]} y={[-1, 16]} width={360} height={300} minHeight={240} ariaLabel="Four target values, a horizontal line for the constant guess c, and arrows showing each negative gradient">
            <Grid xTicks={5} yTicks={8} />
            <Axes xLabel="sample i" yLabel="y" xTicks={4} yTicks={8} tickFormat={(v) => (Number.isInteger(v) ? String(v) : '')} />
            <Path points={[[0.5, c], [4.55, c]]} color="var(--viz-1)" width={3} />
            {XS.map((x, i) => {
              const to = loss === 'l2' ? ys[i] : c + g[i]
              return Math.abs(g[i]) > 1e-9 ? <Arrow key={i} from={[x, c]} to={[x, to]} color="var(--viz-2)" width={2.5} head={8} /> : null
            })}
            {XS.map((x, i) => (
              <Label key={`g${i}`} x={x} y={loss === 'l2' ? (c + ys[i]) / 2 : c + g[i] / 2} dx={-8} dy={4} anchor="end" color="var(--viz-2)" size={12} weight={700}>
                {fmtG(g[i])}
              </Label>
            ))}
            <Dots points={XS.slice(0, 3).map((x, i) => ({ x, y: ys[i], color: 'var(--viz-ink)' }))} r={6} />
            <DraggablePoint x={4} y={y4} lockX color="var(--viz-3)" r={8} label="drag me" onChange={(_, v) => setY4(snap(Math.max(0, Math.min(15, v))))} />
            <DraggablePoint x={4.75} y={c} lockX color="var(--viz-1)" r={8} label="c" onChange={(_, v) => setC(snap(Math.max(C_RANGE[0], Math.min(C_RANGE[1], v))))} />
          </Plot>
        </div>
        <div>
          <p className={s.panelLabel}>{loss === 'l2' ? 'Mean L2 loss, ½(y − c)², for every c' : 'Mean L1 loss, |y − c|, for every c'}</p>
          <Plot x={C_RANGE} y={[0, lossMax]} width={360} height={300} minHeight={240} ariaLabel="The mean loss as a function of the constant guess c, with its minimum marked">
            <Grid xTicks={6} yTicks={5} />
            <Axes xLabel="c" xTicks={6} yTicks={5} />
            {loss === 'l1' && <Rect x0={flatLo} x1={flatHi} y0={0} y1={lossMax} fill="color-mix(in srgb, var(--viz-4) 18%, transparent)" />}
            <FnPath f={lossAt} color="var(--viz-1)" width={2.5} />
            <VLine x={best} color="var(--viz-4)" label={loss === 'l2' ? `mean ${mu.toFixed(2)}` : `median ${med.toFixed(2)}`} />
            <Dots points={[{ x: c, y: lossAt(c), color: 'var(--viz-2)' }]} r={7} />
          </Plot>
        </div>
      </div>
      <Controls>
        <Segmented
          label="loss"
          value={loss}
          onChange={setLoss}
          options={[
            { value: 'l2', label: 'L2 (MSE)' },
            { value: 'l1', label: 'L1 (MAE)' },
          ]}
        />
        <Button onClick={() => setC(mu)}>c = mean</Button>
        <Button onClick={() => setC(med)}>c = median</Button>
        <Button
          onClick={() => {
            setY4(10)
            setC(6)
          }}
        >
          Reset
        </Button>
      </Controls>
      <Readout
        items={[
          ['c', c.toFixed(1)],
          ['sum of pulls', loss === 'l2' ? sumG.toFixed(1) : String(sumG)],
          ['mean loss', lossAt(c).toFixed(2)],
          ['mean y', mu.toFixed(2)],
          ['median y', med.toFixed(2)],
        ]}
      />
    </Figure>
  )
}
