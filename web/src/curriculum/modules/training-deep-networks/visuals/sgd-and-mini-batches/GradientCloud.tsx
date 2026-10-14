import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Path, Dots, Arrow, Label, usePlot, useBump, mulberry32 } from '../../../../../kit'
import { regData, exampleGrad, batchGrad, START, N } from './regressionData'

/*
  One step's worth of gradient estimates. At a chosen point (w, b) of the line-fitting problem we draw
  K mini-batches of size B and plot each batch's downhill direction −g_B as a thin arrow from the origin,
  next to the true downhill direction −∇L (thick). The fan shows the noise; its spread shrinks like 1/√B.
*/

const K = 40
const B_CHOICES = [1, 2, 4, 8, 16, 32, 64]
type Where = 'far' | 'half' | 'near'
const WHERE_FRAC: Record<Where, number> = { far: 1, half: 0.5, near: 0.12 }
const W = 440
const H = 330
const PAD = 12

function Axes0() {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const [y0, y1] = ys.range()
  return (
    <g aria-hidden="true">
      <line x1={x0} x2={x1} y1={ys(0)} y2={ys(0)} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1, opacity: 0.6 }} />
      <line x1={xs(0)} x2={xs(0)} y1={y0} y2={y1} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1, opacity: 0.6 }} />
    </g>
  )
}

function Clipped({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

function Fan({ tips }: { tips: [number, number][] }) {
  const { xs, ys, clipId } = usePlot()
  const d = tips.map(([a, b]) => `M${xs(0).toFixed(1)},${ys(0).toFixed(1)}L${xs(a).toFixed(1)},${ys(b).toFixed(1)}`).join('')
  return <path d={d} clipPath={`url(#${clipId})`} style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 1.2, opacity: 0.45 }} />
}

export default function GradientCloud() {
  const [where, setWhere] = useState<Where>('far')
  const [bi, setBi] = useState(0)
  const [seed, bump] = useBump()
  const B = B_CHOICES[bi]
  const d = regData()

  const pt: [number, number] = useMemo(() => {
    const f = WHERE_FRAC[where]
    return [d.opt[0] + f * (START[0] - d.opt[0]), d.opt[1] + f * (START[1] - d.opt[1])]
  }, [where, d])

  // per-example gradients, their mean (= the true gradient), their spread, and a viewing box for the B = 1 cloud
  const stats = useMemo(() => {
    const gs = d.x.map((_, i) => exampleGrad(d, i, pt[0], pt[1]))
    const g = batchGrad(d, null, pt[0], pt[1])
    let tr = 0
    for (const [a, b] of gs) tr += (a - g[0]) ** 2 + (b - g[1]) ** 2
    tr /= N
    const q = (vals: number[], f: number) => vals.slice().sort((a, b) => a - b)[Math.floor(f * (vals.length - 1))]
    const xsD = gs.map(([a]) => -a)
    const ysD = gs.map(([, b]) => -b)
    const box = {
      x0: Math.min(0, -g[0], q(xsD, 0.08)),
      x1: Math.max(0, -g[0], q(xsD, 0.92)),
      y0: Math.min(0, -g[1], q(ysD, 0.08)),
      y1: Math.max(0, -g[1], q(ysD, 0.92)),
    }
    return { g, tr, box }
  }, [d, pt])

  const tips = useMemo(() => {
    const r = mulberry32(1000 + seed * 97 + bi * 13 + (where === 'far' ? 0 : where === 'half' ? 1 : 2))
    const out: [number, number][] = []
    for (let k = 0; k < K; k++) {
      // choose B different examples (partial Fisher–Yates)
      const p = Array.from({ length: N }, (_, i) => i)
      for (let i = 0; i < B; i++) {
        const j = i + Math.floor(r() * (N - i))
        const t = p[i]
        p[i] = p[j]
        p[j] = t
      }
      const gB = batchGrad(d, p.slice(0, B), pt[0], pt[1])
      out.push([-gB[0], -gB[1]])
    }
    return out
  }, [d, pt, B, bi, seed, where])

  const gLen = Math.hypot(stats.g[0], stats.g[1])
  // spread of a mini-batch average when B examples are drawn without replacement from N
  const rmsB = Math.sqrt((stats.tr / B) * ((N - B) / (N - 1)))
  const downhill = tips.filter(([a, b]) => -a * stats.g[0] + -b * stats.g[1] > 0).length

  // same scale on both axes: pad the box, then widen whichever side is too short for the plot's shape
  const { box } = stats
  const padX = 0.08 * (box.x1 - box.x0)
  const padY = 0.08 * (box.y1 - box.y0)
  let [bx0, bx1, by0, by1] = [box.x0 - padX, box.x1 + padX, box.y0 - padY, box.y1 + padY]
  const want = (W - 2 * PAD) / (H - 2 * PAD)
  if ((bx1 - bx0) / (by1 - by0) < want) {
    const extra = (want * (by1 - by0) - (bx1 - bx0)) / 2
    bx0 -= extra
    bx1 += extra
  } else {
    const extra = ((bx1 - bx0) / want - (by1 - by0)) / 2
    by0 -= extra
    by1 += extra
  }
  const trueTip: [number, number] = [-stats.g[0], -stats.g[1]]
  const ring: [number, number][] = Array.from({ length: 61 }, (_, k) => {
    const t = (k / 60) * 2 * Math.PI
    return [trueTip[0] + rmsB * Math.cos(t), trueTip[1] + rmsB * Math.sin(t)]
  })

  return (
    <Figure
      title="One step, 40 different mini-batches"
      caption={
        <>
          Each thin orange arrow is the downhill direction suggested by one random mini-batch of {B} example{B > 1 ? 's' : ''}; the thick
          arrow is the true downhill direction, averaged over all {N} examples. Slide the batch size: every time it is multiplied by 4, the
          spread (dashed circle) roughly halves, while the cost of one estimate goes up 4 times. Then move <b>near the minimum</b>: the true
          slope is tiny there, so single examples disagree wildly and some even point uphill.
        </>
      }
    >
      <Segmented
        label="Where are we?"
        value={where}
        onChange={setWhere}
        options={[
          { value: 'far', label: 'far from the minimum' },
          { value: 'half', label: 'halfway' },
          { value: 'near', label: 'near the minimum' },
        ]}
      />
      <Plot x={[bx0, bx1]} y={[by0, by1]} width={W} height={H} margin={{ left: PAD, right: PAD, top: PAD, bottom: PAD }} ariaLabel={`Fan of ${K} mini-batch gradient directions with batch size ${B}, ${downhill} of them pointing downhill`}>
        <Axes0 />
        <Fan tips={tips} />
        <Clipped>
          <Dots points={tips.map(([a, b]) => ({ x: a, y: b, r: 2.6, color: 'var(--viz-2)' }))} stroke="none" />
        </Clipped>
        <Path points={ring} color="var(--viz-1)" width={1.5} dash="5 4" />
        <Arrow from={[0, 0]} to={trueTip} color="var(--viz-1)" width={4} head={13} />
        <Label x={trueTip[0]} y={trueTip[1]} dx={trueTip[0] >= 0 ? 10 : -10} dy={-10} anchor={trueTip[0] >= 0 ? 'start' : 'end'} color="var(--viz-1)" weight={700}>
          true downhill
        </Label>
        <Dots points={[{ x: 0, y: 0, r: 4.5, color: 'var(--viz-ink)' }]} />
        <Label x={0} y={0} dx={-8} dy={-8} anchor="end" color="var(--ink-2)" size={11.5}>
          you are here
        </Label>
      </Plot>
      <Controls>
        <Slider label="batch size B" value={bi} min={0} max={B_CHOICES.length - 1} step={1} onChange={setBi} format={(v) => String(B_CHOICES[v])} />
        <Button onClick={bump}>Draw 40 new batches</Button>
      </Controls>
      <Readout
        items={[
          ['cost of one estimate', `${B} example${B > 1 ? 's' : ''}`],
          ['typical error (dashed circle)', `${rmsB.toFixed(2)}  (${(rmsB / gLen).toFixed(2)} × true length)`],
          ['pointing downhill', `${downhill} of ${K}`],
        ]}
      />
    </Figure>
  )
}
