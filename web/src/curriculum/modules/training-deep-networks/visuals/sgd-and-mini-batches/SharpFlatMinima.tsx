import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, Label, useNarrow } from '../../../../../kit'
import { trainLoss, W_SHARP, W_FLAT, C_SHARP, C_FLAT, FLOOR, halfWidth } from './landscape'

/*
  Training loss (solid) with a sharp and a flat minimum of equal depth, and a "test loss" (dashed):
  the same curve shifted sideways by δ, standing in for the slightly different data seen at test time.
  The learner slides δ and compares the test loss at the two training minima.
*/

const X: [number, number] = [-3, 3]
const Y: [number, number] = [0, 3.6]
const RISE = 0.5

export default function SharpFlatMinima() {
  const [shift, setShift] = useState(0.25)
  const [showWidth, setShowWidth] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const test = (w: number) => trainLoss(w - shift)
  const sharpTest = test(W_SHARP)
  const flatTest = test(W_FLAT)
  const hs = halfWidth(C_SHARP, RISE)
  const hf = halfWidth(C_FLAT, RISE)
  const clampY = (v: number) => Math.min(Y[1] - 0.05, v)

  return (
    <Figure
      title="Same training loss, very different test loss"
      caption={
        <>
          Both valleys of the training loss (solid) are equally deep, so training cannot tell them apart. The test data are a little
          different, which slides the curve sideways (dashed). Drag the <b>shift</b> slider and watch the two orange dots: in the
          <b> sharp</b> valley a small shift sends the loss soaring, while in the <b>flat</b> valley it hardly moves. Set the shift to 0 and
          the two minima are exactly as good.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot x={X} y={Y} width={narrow ? 360 : 520} height={narrow ? 280 : 300} maxWidth={660} minHeight={240} ariaLabel={`Training loss with a sharp and a flat minimum; test loss shifted by ${shift.toFixed(2)}`}>
          <Grid xTicks={6} yTicks={4} />
          <Axes xLabel="parameter w" yLabel="loss" xTicks={6} yTicks={4} />
          {showWidth && (
            <>
              <Path points={[[W_SHARP - hs, FLOOR + RISE], [W_SHARP + hs, FLOOR + RISE]]} color="var(--viz-4)" width={3} />
              <Path points={[[W_FLAT - hf, FLOOR + RISE], [W_FLAT + hf, FLOOR + RISE]]} color="var(--viz-3)" width={3} />
              <Label x={W_SHARP - hs} y={FLOOR + RISE} dx={-6} dy={4} anchor="end" color="var(--viz-4)" size={11.5}>
                width {(2 * hs).toFixed(2)}
              </Label>
              <Label x={W_FLAT} y={FLOOR + RISE} dy={-7} anchor="middle" color="var(--viz-3)" size={11.5}>
                width {(2 * hf).toFixed(2)}
              </Label>
            </>
          )}
          <FnPath f={test} color="var(--viz-2)" width={2.2} dash="7 5" samples={400} />
          <FnPath f={trainLoss} color="var(--viz-1)" width={2.8} samples={400} />
          <Path points={[[W_SHARP, FLOOR], [W_SHARP, clampY(sharpTest)]]} color="var(--viz-neg)" width={2} dash="3 3" />
          <Path points={[[W_FLAT, FLOOR], [W_FLAT, clampY(flatTest)]]} color="var(--viz-pos)" width={2} dash="3 3" />
          <Dots
            points={[
              { x: W_SHARP, y: FLOOR, r: 6, color: 'var(--viz-1)' },
              { x: W_FLAT, y: FLOOR, r: 6, color: 'var(--viz-1)' },
              { x: W_SHARP, y: clampY(sharpTest), r: 6, color: 'var(--viz-2)' },
              { x: W_FLAT, y: clampY(flatTest), r: 6, color: 'var(--viz-2)' },
            ]}
          />
          <Label x={W_SHARP} y={Y[1]} dy={14} anchor="middle" weight={700} color="var(--viz-4)">
            sharp
          </Label>
          <Label x={W_FLAT} y={Y[1]} dy={14} anchor="middle" weight={700} color="var(--viz-3)">
            flat
          </Label>
          <Label x={W_SHARP} y={clampY(sharpTest)} dx={10} dy={4} color="var(--viz-neg)" weight={700}>
            {`+${(sharpTest - FLOOR).toFixed(2)}`}
          </Label>
          <Label x={W_FLAT} y={clampY(flatTest)} dx={10} dy={-8} color="var(--viz-pos)" weight={700}>
            {`+${(flatTest - FLOOR).toFixed(2)}`}
          </Label>
        </Plot>
      </div>
      <Controls>
        <Slider label="shift between training and test data" value={shift} min={-0.5} max={0.5} step={0.05} onChange={setShift} format={(v) => v.toFixed(2)} />
        <Toggle label="Show valley widths" checked={showWidth} onChange={setShowWidth} />
      </Controls>
      <Readout
        items={[
          ['training loss at both minima', FLOOR.toFixed(2)],
          ['test loss, sharp minimum', sharpTest.toFixed(2)],
          ['test loss, flat minimum', flatTest.toFixed(2)],
          ['curvature c', `${C_SHARP} (sharp) vs ${C_FLAT} (flat)`],
        ]}
      />
    </Figure>
  )
}
