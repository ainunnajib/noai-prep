import { useState } from 'react'
import { Figure, Controls, Slider, Readout, Plot, Grid, Axes, FnPath, Path, Dots, Rect, Label, DraggablePoint, M } from '../../../../../kit'

/*
  Left: drag a predicted square over a fixed true square (area 16). Intersection, union, IoU and Dice are computed from the
  overlap rectangle. Right: every (IoU, Dice) pair lies on Dice = 2 IoU / (1 + IoU), which sits above the diagonal Dice = IoU.
  Colours match the pixel accuracy trap: truth = dashed ink outline, prediction = blue, IoU = green, Dice = magenta.
*/

const IOU_COL = 'var(--viz-3)'
const DICE_COL = 'var(--viz-4)'
/** keep the predicted square (half-side hh) inside the 10 x 10 plot */
const clampC = (v: number, hh: number) => Math.min(10 - hh, Math.max(hh, v))

const T0 = 3
const T1 = 7 // true square [3, 7] x [3, 7], area 16
const TA = (T1 - T0) ** 2

export default function DiceIoUCurve() {
  const [c, setC] = useState<[number, number]>([5.5, 4.5])
  const [side, setSide] = useState(4)
  const h = side / 2
  const px0 = c[0] - h
  const px1 = c[0] + h
  const py0 = c[1] - h
  const py1 = c[1] + h
  const ix = Math.max(0, Math.min(px1, T1) - Math.max(px0, T0))
  const iy = Math.max(0, Math.min(py1, T1) - Math.max(py0, T0))
  const inter = ix * iy
  const pa = side * side
  const union = TA + pa - inter
  const iou = inter / union
  const dice = (2 * inter) / (TA + pa)
  const snap = (x: number, y: number): [number, number] => [clampC(Math.round(x * 4) / 4, h), clampC(Math.round(y * 4) / 4, h)]
  const changeSide = (v: number) => {
    setSide(v)
    setC((cc) => [clampC(cc[0], v / 2), clampC(cc[1], v / 2)])
  }

  return (
    <Figure
      title="For one mask, Dice and IoU always move together"
      caption={
        <>
          Drag the blue predicted square over the true square (dashed outline), and change its size. The darker overlap is the intersection.
          On the right, the point always sits on the same curve, <M>{'\\text{Dice} = 2\\,\\text{IoU}/(1 + \\text{IoU})'}</M>: Dice is never below
          IoU, the two agree at 0 and 1, and a better IoU always means a better Dice.
        </>
      }
    >
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', justifyContent: 'center' }}>
        <div style={{ flex: '1 1 250px', maxWidth: 330 }}>
          <Plot x={[0, 10]} y={[0, 10]} width={320} height={320} margin={{ left: 26, bottom: 26, top: 10, right: 10 }} ariaLabel={`Predicted square overlapping the true square. IoU ${iou.toFixed(2)}, Dice ${dice.toFixed(2)}.`}>
            <Grid xTicks={10} yTicks={10} />
            <Axes xTicks={5} yTicks={5} />
            <Rect x0={T0} x1={T1} y0={T0} y1={T1} fill="color-mix(in srgb, var(--viz-ink) 7%, transparent)" />
            <Rect x0={px0} x1={px1} y0={py0} y1={py1} fill="color-mix(in srgb, var(--viz-1) 18%, transparent)" stroke="var(--viz-1)" />
            {inter > 0 && (
              <Rect
                x0={Math.max(px0, T0)}
                x1={Math.min(px1, T1)}
                y0={Math.max(py0, T0)}
                y1={Math.min(py1, T1)}
                fill="color-mix(in srgb, var(--viz-1) 50%, transparent)"
                stroke="var(--viz-1)"
              />
            )}
            <Path points={[[T0, T0], [T1, T0], [T1, T1], [T0, T1], [T0, T0]]} color="var(--viz-ink)" dash="5 3" width={2} />
            <Label x={T0} y={T1} dy={-5} color="var(--viz-ink)" weight={700}>
              true
            </Label>
            <Label x={px1} y={py0 < 1.3 ? py1 : py0} dy={py0 < 1.3 ? -5 : 13} anchor="end" color="var(--viz-1)" weight={700}>
              prediction
            </Label>
            <DraggablePoint x={c[0]} y={c[1]} onChange={(x, y) => setC(snap(x, y))} color="var(--viz-1)" label="drag" />
          </Plot>
        </div>
        <div style={{ flex: '1 1 250px', maxWidth: 330 }}>
          <Plot x={[0, 1]} y={[0, 1]} width={320} height={320} margin={{ left: 40, bottom: 34, top: 12, right: 12 }} ariaLabel="Dice plotted against IoU">
            <Grid xTicks={5} yTicks={5} />
            <Axes xTicks={5} yTicks={5} xLabel="IoU" yLabel="Dice" />
            <Path points={[[0, 0], [1, 1]]} color="var(--viz-muted)" dash="5 4" width={1.5} />
            <FnPath f={(x) => (2 * x) / (1 + x)} color={DICE_COL} width={2.5} />
            <Path points={[[iou, 0], [iou, dice]]} color={IOU_COL} dash="3 3" width={1.6} />
            <Path points={[[iou, dice], [0, dice]]} color={DICE_COL} dash="3 3" width={1.6} />
            <Dots points={[{ x: iou, y: dice, color: DICE_COL, r: 6 }]} />
            <Label x={0.8} y={0.8} dx={4} dy={16} color="var(--ink-2)" size={11}>
              Dice = IoU
            </Label>
            <Label x={0.04} y={0.92} color={DICE_COL} size={11} weight={700}>
              Dice = 2·IoU / (1 + IoU)
            </Label>
          </Plot>
        </div>
      </div>
      <Readout
        items={[
          ['|P ∩ T|', inter.toFixed(2)],
          ['|P ∪ T|', union.toFixed(2)],
          [<span key="i" style={{ color: IOU_COL, fontWeight: 700 }}>IoU</span>, iou.toFixed(3)],
          [<span key="d" style={{ color: DICE_COL, fontWeight: 700 }}>Dice</span>, dice.toFixed(3)],
        ]}
      />
      <Controls>
        <Slider label="predicted square side" value={side} min={1} max={7} step={0.5} onChange={changeSide} format={(v) => v.toFixed(1)} />
      </Controls>
    </Figure>
  )
}
