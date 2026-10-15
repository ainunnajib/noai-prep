import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button, Plot, Axes, Rect, Path, Label, Arrow, M, useContainerWidth } from '../../../../../kit'
import { impurityOf, type ClfCriterion } from './cart'
import { TXT_GREEN } from '../tones'
import s from './trees.module.css'

/*
  Weighted impurity of a split, drawn as areas. A parent node of 10 flats (5 orange, 5 blue) is
  split; the learner chooses how many of each colour go to the "yes" side. Each child becomes a
  rectangle whose width is its share of the flats and whose height is its impurity, so the total
  shaded area is the weighted impurity, and the gap to the parent's dashed line is the gain.
*/

const PO = 5 // orange in parent (sold for $600k or more)
const PB = 5 // blue in parent

function Tokens({ x, y, o, b, per = 5 }: { x: number; y: number; o: number; b: number; per?: number }) {
  const r = 6
  const step = 15
  const items = [...Array(b).fill(0), ...Array(o).fill(1)]
  const cols = Math.min(per, Math.max(1, items.length))
  const x0 = x - ((cols - 1) * step) / 2
  return (
    <g>
      {items.map((c, i) => {
        const cx = x0 + (i % per) * step
        const cy = y + Math.floor(i / per) * step
        return c ? (
          <rect key={i} x={cx - r} y={cy - r} width={2 * r} height={2 * r} style={{ fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 1.2 }} />
        ) : (
          <circle key={i} cx={cx} cy={cy} r={r} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 1.2 }} />
        )
      })}
    </g>
  )
}

function SplitPicture({ oy, by, crit }: { oy: number; by: number; crit: ClfCriterion }) {
  const [ref, w] = useContainerWidth<HTMLDivElement>(460)
  const W = Math.max(280, Math.min(560, w))
  const H = 168
  const name = crit === 'gini' ? 'Gini' : 'H'
  const box = (cx: number, y: number, o: number, b: number, title: string, stroke: string) => {
    const n = o + b
    const bw = 5 * 15 + 18
    return (
      <g>
        <rect x={cx - bw / 2} y={y} width={bw} height={50} rx={9} style={{ fill: 'var(--surface-2)', stroke, strokeWidth: 1.5 }} />
        <Tokens x={cx} y={y + 17} o={o} b={b} />
        <text x={cx} y={y + 66} textAnchor="middle" className={s.nodeText} style={{ fontSize: 12.5 }}>
          {title} {n} {n === 1 ? 'flat' : 'flats'}
        </text>
        <text x={cx} y={y + 82} textAnchor="middle" style={{ fontSize: 12.5, fill: 'var(--ink-2)' }}>
          {name} = {impurityOf([b, o], crit).toFixed(3)}
        </text>
      </g>
    )
  }
  const yesX = W * 0.25
  const noX = W * 0.75
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Parent of 10 flats split into ${oy + by} and ${10 - oy - by}`} style={{ display: 'block' }}>
        <line x1={W / 2} y1={52} x2={yesX} y2={84} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
        <line x1={W / 2} y1={52} x2={noX} y2={84} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
        <text x={(W / 2 + yesX) / 2 - 6} y={64} textAnchor="end" className={s.edgeText}>
          yes
        </text>
        <text x={(W / 2 + noX) / 2 + 6} y={64} textAnchor="start" className={s.edgeText}>
          no
        </text>
        <g>
          <rect x={W / 2 - 46} y={2} width={92} height={50} rx={9} style={{ fill: 'var(--surface-2)', stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
          <Tokens x={W / 2} y={19} o={PO} b={PB} />
        </g>
        {box(yesX, 84, oy, by, 'yes:', 'var(--viz-3)')}
        {box(noX, 84, PO - oy, PB - by, 'no:', 'var(--viz-4)')}
      </svg>
    </div>
  )
}

const frac = (a: number, n: number) => `\\tfrac{${a}}{${n}}`

export default function WeightedSplit() {
  const [oy, setOy] = useState(1)
  const [by, setBy] = useState(4)
  const [crit, setCrit] = useState<ClfCriterion>('gini')
  const nY = oy + by
  const nN = 10 - nY
  const iP = impurityOf([PB, PO], crit)
  const iY = impurityOf([by, oy], crit)
  const iN = impurityOf([PB - by, PO - oy], crit)
  const wY = nY / 10
  const after = wY * iY + (1 - wY) * iN
  const gain = iP - after
  const top = crit === 'gini' ? 0.6 : 1.15
  const name = crit === 'gini' ? 'Gini' : 'entropy'
  const preset = (o: number, b: number) => {
    setOy(o)
    setBy(b)
  }
  const tex = `${frac(nY, 10)}\\,(${iY.toFixed(3)}) + ${frac(nN, 10)}\\,(${iN.toFixed(3)}) = ${after.toFixed(3)}`

  return (
    <Figure
      title="Weighted impurity as an area"
      caption={
        <>
          Slide the flats sent to <b>yes</b>, or press <b>Split A</b> and <b>Split B</b>. Each block is as wide as its share and as tall as its impurity:
          notice that a tiny pure group barely lowers the total.
        </>
      }
    >
      <SplitPicture oy={oy} by={by} crit={crit} />
      <Plot x={[0, 1]} y={[0, top]} width={460} height={230} minHeight={210} margin={{ top: 22, left: 44, right: 14, bottom: 36 }} ariaLabel={`Weighted ${name} after the split is ${after.toFixed(3)}, down from ${iP.toFixed(3)}`}>
        <Axes xLabel="share of the 10 flats" yLabel={name} xTicks={5} yTicks={4} />
        {nY > 0 && <Rect x0={0} x1={wY} y0={0} y1={iY} fill="color-mix(in srgb, var(--viz-3) 30%, var(--surface))" stroke="var(--viz-3)" />}
        {nN > 0 && <Rect x0={wY} x1={1} y0={0} y1={iN} fill="color-mix(in srgb, var(--viz-4) 26%, var(--surface))" stroke="var(--viz-4)" />}
        {/* block labels sit at the foot of each block, clear of the 'after' line */}
        {wY >= 0.2 && iY > 0.12 * top && (
          <Label x={wY / 2} y={0} dy={-8} anchor="middle" size={12} color="var(--viz-ink)">
            {`${nY}/10 × ${iY.toFixed(2)}`}
          </Label>
        )}
        {1 - wY >= 0.2 && iN > 0.12 * top && (
          <Label x={(1 + wY) / 2} y={0} dy={-8} anchor="middle" size={12} color="var(--viz-ink)">
            {`${nN}/10 × ${iN.toFixed(2)}`}
          </Label>
        )}
        <Path points={[[0, iP], [1, iP]]} color="var(--viz-ink)" width={2} dash="6 5" />
        <Path points={[[0, after], [1, after]]} color="var(--viz-3)" width={2.2} />
        <Label x={1} y={iP} dx={-4} dy={-6} anchor="end" size={12}>
          before: {iP.toFixed(3)}
        </Label>
        <Label x={0.02} y={after} dx={0} dy={after > iP - 0.08 * top ? 16 : -6} anchor="start" color={TXT_GREEN} size={12} weight={700}>
          after (weighted): {after.toFixed(3)}
        </Label>
        {gain > 0.02 * top && <Arrow from={[0.62, iP]} to={[0.62, after]} color="var(--viz-3)" width={2.2} head={7} />}
        {gain > 0.02 * top && (
          <Label x={0.62} y={(iP + after) / 2} dx={8} dy={4} color={TXT_GREEN} weight={700} size={12}>
            gain {gain.toFixed(3)}
          </Label>
        )}
      </Plot>
      <div className={s.formula}>
        <M>{`\\text{after} = ${tex}`}</M>
        <div style={{ marginTop: 6 }}>
          <M>{`\\text{gain} = ${iP.toFixed(3)} - ${after.toFixed(3)} = ${gain.toFixed(3)}`}</M>
        </div>
      </div>
      {(nY === 0 || nN === 0) && <p className={s.status}>One side is empty, so this "question" separates nothing and the gain is 0.</p>}
      <Controls>
        <Slider label="orange flats sent to yes" value={oy} min={0} max={PO} step={1} onChange={setOy} />
        <Slider label="blue flats sent to yes" value={by} min={0} max={PB} step={1} onChange={setBy} />
      </Controls>
      <Controls>
        <Button onClick={() => preset(1, 4)}>Split A (1 + 4 go yes)</Button>
        <Button onClick={() => preset(0, 2)}>Split B (0 + 2 go yes)</Button>
        <Segmented
          label="Impurity"
          value={crit}
          onChange={setCrit}
          options={[
            { value: 'gini', label: 'Gini' },
            { value: 'entropy', label: 'entropy' },
          ]}
        />
      </Controls>
    </Figure>
  )
}
