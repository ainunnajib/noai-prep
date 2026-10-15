import { useState } from 'react'
import { Figure, Controls, Slider, Button, Plot, Grid, Axes, Rect, Path, Label, DraggablePoint } from '../../../../../kit'
import s from './reg.module.css'

/*
  Box IoU, step by step. Two boxes on a grid: the true box (green) and the predicted box (orange).
  Drag a box's centre handle to move it and its top-right handle to resize it, or type the corner
  coordinates. The overlap rectangle and the union are shaded, and the working is shown:
  overlap width x height, then union = A + B - overlap, then IoU = overlap / union.
  A threshold slider labels the prediction a hit or a miss, as an object detector's scorer would.
*/

interface Box {
  x1: number
  y1: number
  x2: number
  y2: number
}

const XMAX = 10
const YMAX = 8
const TRUE0: Box = { x1: 1, y1: 2, x2: 5, y2: 6 }
const PRED0: Box = { x1: 3, y1: 2, x2: 7, y2: 6 }

const snap = (v: number) => Math.round(v * 2) / 2
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
/** corners in order, whatever the learner typed */
const norm = (b: Box): Box => ({ x1: Math.min(b.x1, b.x2), y1: Math.min(b.y1, b.y2), x2: Math.max(b.x1, b.x2), y2: Math.max(b.y1, b.y2) })
const area = (b: Box) => (b.x2 - b.x1) * (b.y2 - b.y1)
const f = (v: number) => {
  const r = Math.round(v * 100) / 100
  return r < 0 ? `−${-r}` : String(r)
}

function BoxShape({ b, color, name, dash }: { b: Box; color: string; name: string; dash?: string }) {
  return (
    <>
      <Path
        points={[
          [b.x1, b.y1],
          [b.x2, b.y1],
          [b.x2, b.y2],
          [b.x1, b.y2],
        ]}
        closed
        color={color}
        width={3}
        dash={dash}
      />
      <Label x={b.x1} y={b.y2} dx={4} dy={-6} color={color} weight={700}>
        {name}
      </Label>
    </>
  )
}

export default function IoUBoxes() {
  const [tb, setTb] = useState<Box>(TRUE0)
  const [pb, setPb] = useState<Box>(PRED0)
  const [thr, setThr] = useState(0.5)

  const A = norm(tb)
  const B = norm(pb)
  const left = Math.max(A.x1, B.x1)
  const right = Math.min(A.x2, B.x2)
  const bottom = Math.max(A.y1, B.y1)
  const top = Math.min(A.y2, B.y2)
  const rawW = right - left
  const rawH = top - bottom
  const w = Math.max(0, rawW)
  const h = Math.max(0, rawH)
  const overlap = w * h
  const areaA = area(A)
  const areaB = area(B)
  const union = areaA + areaB - overlap
  const iou = union > 0 ? overlap / union : 0
  const hit = iou >= thr

  const green = 'var(--viz-3)'
  const orange = 'var(--viz-2)'
  const unionFill = 'color-mix(in srgb, var(--viz-1) 13%, transparent)'
  const overlapFill = 'color-mix(in srgb, var(--viz-5) 55%, transparent)'

  // dragging: the centre handle moves the whole box, the top-right handle resizes it
  const moveTo = (set: (fn: (b: Box) => Box) => void) => (cx: number, cy: number) =>
    set((old) => {
      const b = norm(old)
      const bw = b.x2 - b.x1
      const bh = b.y2 - b.y1
      const x1 = clamp(snap(cx - bw / 2), 0, XMAX - bw)
      const y1 = clamp(snap(cy - bh / 2), 0, YMAX - bh)
      return { x1, y1, x2: x1 + bw, y2: y1 + bh }
    })
  const resizeTo = (set: (fn: (b: Box) => Box) => void) => (x: number, y: number) =>
    set((old) => {
      const b = norm(old)
      return { ...b, x2: clamp(snap(x), b.x1 + 0.5, XMAX), y2: clamp(snap(y), b.y1 + 0.5, YMAX) }
    })

  const numInput = (box: Box, set: (b: Box) => void, key: keyof Box, label: string) => (
    <input
      className={s.num}
      type="number"
      step={0.5}
      min={0}
      max={key.startsWith('x') ? XMAX : YMAX}
      value={box[key]}
      aria-label={label}
      onChange={(e) => {
        const v = Number(e.target.value)
        if (!Number.isFinite(v)) return
        set({ ...box, [key]: clamp(v, 0, key.startsWith('x') ? XMAX : YMAX) })
      }}
    />
  )

  return (
    <Figure
      title="Intersection over union for two boxes"
      caption={
        <>
          Drag the round handle in the middle of a box to move it and the one at its top-right corner to resize it, or type the corners below. The
          purple rectangle is the overlap (intersection); everything shaded, purple or blue, is the union. Try making the orange box huge so that it
          swallows the green one: it covers the whole object, yet IoU falls, because IoU also punishes extra area. Then slide the threshold: a detector
          counts a predicted box as a correct detection only if its IoU with the true box reaches the threshold (0.5 is common).
        </>
      }
    >
      <div className={s.wrap}>
        <Plot x={[0, XMAX]} y={[0, YMAX]} width={480} height={398} margin={{ left: 30, right: 10, top: 10, bottom: 36 }} ariaLabel={`True box and predicted box; overlap ${f(overlap)}, union ${f(union)}, IoU ${iou.toFixed(2)}`}>
          <Grid xTicks={10} yTicks={8} />
          <Axes xTicks={10} yTicks={8} />
          {/* union: both boxes lightly filled */}
          <Rect x0={A.x1} x1={A.x2} y0={A.y1} y1={A.y2} fill={unionFill} />
          <Rect x0={B.x1} x1={B.x2} y0={B.y1} y1={B.y2} fill={unionFill} />
          {/* intersection */}
          {overlap > 0 && <Rect x0={left} x1={right} y0={bottom} y1={top} fill={overlapFill} />}
          <BoxShape b={A} color={green} name="true" />
          <BoxShape b={B} color={orange} name="predicted" dash="8 5" />
          <DraggablePoint x={(A.x1 + A.x2) / 2} y={(A.y1 + A.y2) / 2} r={8} color={green} onChange={moveTo(setTb)} />
          <DraggablePoint x={A.x2} y={A.y2} r={7} color={green} onChange={resizeTo(setTb)} />
          <DraggablePoint x={(B.x1 + B.x2) / 2} y={(B.y1 + B.y2) / 2} r={8} color={orange} onChange={moveTo(setPb)} />
          <DraggablePoint x={B.x2} y={B.y2} r={7} color={orange} onChange={resizeTo(setPb)} />
        </Plot>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.rowHead}>box</th>
                <th>
                  x<sub>1</sub>
                </th>
                <th>
                  y<sub>1</sub>
                </th>
                <th>
                  x<sub>2</sub>
                </th>
                <th>
                  y<sub>2</sub>
                </th>
                <th>area</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={s.rowHead} style={{ color: green, fontWeight: 700 }}>
                  true
                </td>
                <td>{numInput(tb, setTb, 'x1', 'true box x1')}</td>
                <td>{numInput(tb, setTb, 'y1', 'true box y1')}</td>
                <td>{numInput(tb, setTb, 'x2', 'true box x2')}</td>
                <td>{numInput(tb, setTb, 'y2', 'true box y2')}</td>
                <td>{f(areaA)}</td>
              </tr>
              <tr>
                <td className={s.rowHead} style={{ color: orange, fontWeight: 700 }}>
                  predicted
                </td>
                <td>{numInput(pb, setPb, 'x1', 'predicted box x1')}</td>
                <td>{numInput(pb, setPb, 'y1', 'predicted box y1')}</td>
                <td>{numInput(pb, setPb, 'x2', 'predicted box x2')}</td>
                <td>{numInput(pb, setPb, 'y2', 'predicted box y2')}</td>
                <td>{f(areaB)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={s.work} aria-live="polite">
          <ol>
            <li>
              Overlap width = min(x<sub>2</sub>) − max(x<sub>1</sub>) = {f(right)} − {f(left)} = <b>{f(rawW)}</b>
              {rawW <= 0 && ' → no overlap, use 0'}
            </li>
            <li>
              Overlap height = min(y<sub>2</sub>) − max(y<sub>1</sub>) = {f(top)} − {f(bottom)} = <b>{f(rawH)}</b>
              {rawH <= 0 && ' → no overlap, use 0'}
            </li>
            <li>
              Overlap area = {f(w)} × {f(h)} = <b>{f(overlap)}</b>
            </li>
            <li>
              Union = A + B − overlap = {f(areaA)} + {f(areaB)} − {f(overlap)} = <b>{f(union)}</b>
            </li>
            <li>
              IoU = overlap ÷ union = {f(overlap)} ÷ {f(union)} = <b style={{ fontSize: '1.1em' }}>{iou.toFixed(3)}</b>
            </li>
          </ol>
        </div>

        <Controls>
          <Slider label="IoU threshold for a correct detection" value={thr} min={0.1} max={0.9} step={0.05} onChange={setThr} format={(v) => v.toFixed(2)} />
          <span className={s.verdict} style={{ color: hit ? 'var(--viz-pos)' : 'var(--viz-neg)' }} aria-live="polite">
            {hit ? `hit: IoU ${iou.toFixed(2)} ≥ ${thr.toFixed(2)}` : `miss: IoU ${iou.toFixed(2)} < ${thr.toFixed(2)}`}
          </span>
          <Button
            onClick={() => {
              setTb(TRUE0)
              setPb(PRED0)
            }}
          >
            Reset boxes
          </Button>
        </Controls>
      </div>
    </Figure>
  )
}
