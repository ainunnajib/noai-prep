import { useState } from 'react'
import { Figure, Controls, Readout, Plot, Grid, Axes, Arrow, Path, DraggablePoint, Toggle, M } from '../../../../../kit'

/** Drag the tip of a vector; see its components and its length update live. */
export default function VectorPlayground() {
  const [tip, setTip] = useState<[number, number]>([3, 4])
  const [showParts, setShowParts] = useState(true)
  const len = Math.hypot(tip[0], tip[1])
  const snap = (x: number, y: number): [number, number] => [Math.round(x * 2) / 2, Math.round(y * 2) / 2]

  return (
    <Figure
      title="Drag the arrow's tip"
      caption={
        <>
          The vector <M>{`v = [${tip[0]}, ${tip[1]}]`}</M> means "go {tip[0]} across, then {tip[1]} up". Its length is the hypotenuse of the right-angled triangle, so{' '}
          <M>{`\\lVert v \\rVert = \\sqrt{${tip[0]}^2 + ${tip[1]}^2} \\approx ${len.toFixed(2)}`}</M>.
        </>
      }
    >
      <Plot x={[-6, 6]} y={[-6, 6]} width={420} height={420} ariaLabel="A vector from the origin that you can drag">
        <Grid xTicks={12} yTicks={12} />
        <Axes origin xTicks={6} yTicks={6} />
        {showParts && (
          <>
            <Path points={[[0, 0], [tip[0], 0]]} color="var(--viz-3)" width={3} dash="6 4" />
            <Path points={[[tip[0], 0], tip]} color="var(--viz-4)" width={3} dash="6 4" />
          </>
        )}
        <Arrow from={[0, 0]} to={tip} color="var(--viz-1)" width={3.5} label="v" />
        <DraggablePoint x={tip[0]} y={tip[1]} onChange={(x, y) => setTip(snap(x, y))} label="drag me" />
      </Plot>
      <Controls>
        <Readout items={[['x', tip[0].toFixed(1)], ['y', tip[1].toFixed(1)], ['length', len.toFixed(3)]]} />
        <Toggle label="Show the triangle" checked={showParts} onChange={setShowParts} />
      </Controls>
    </Figure>
  )
}
