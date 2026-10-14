import { useState } from 'react'
import { Figure, Controls, Readout, Toggle, Button, Plot, Grid, Axes, Path, Bars, usePlot } from '../../../../../kit'
import { DragDot } from './DragDot'
import { RIDES, fitLS, sse, fmt, fix, lineText, type Pt } from './shared'

/*
  Residuals drawn as real squares. The learner drags the line by its two handles, snaps it to
  the least-squares fit, and drags a fare up to make an outlier whose square takes over.
  Squares are drawn in screen pixels with side = |residual| in y-pixels, so their areas are
  proportional to residual² even though the x and y axes have different scales.
*/

const X: [number, number] = [0, 6]
const Y: [number, number] = [0, 12]
const XL = 0.4
const XR = 5.6
const INIT: [number, number] = [5.2, 7.8] // the flat guess ŷ = 0.5x + 5

function Squares({ pts, w, b }: { pts: Pt[]; w: number; b: number }) {
  const { xs, ys, clipId } = usePlot()
  const right = xs.range()[1]
  return (
    <g clipPath={`url(#${clipId})`}>
      {pts.map(([x, y], i) => {
        const px = xs(x)
        const py = ys(y)
        const ph = ys(w * x + b)
        const side = Math.abs(py - ph)
        if (side < 0.5) return null
        const left = px + side > right ? px - side : px
        return (
          <rect
            key={i}
            x={left}
            y={Math.min(py, ph)}
            width={side}
            height={side}
            style={{ fill: 'color-mix(in srgb, var(--viz-2) 22%, transparent)', stroke: 'var(--viz-2)', strokeWidth: 1.5 }}
          />
        )
      })}
    </g>
  )
}

function Residuals({ pts, w, b }: { pts: Pt[]; w: number; b: number }) {
  return (
    <>
      {pts.map(([x, y], i) => (
        <Path key={i} points={[[x, y], [x, w * x + b]]} color="var(--viz-2)" width={2.5} />
      ))}
    </>
  )
}

export default function ResidualSquares() {
  const [pts, setPts] = useState<Pt[]>(RIDES)
  const [ends, setEnds] = useState<[number, number]>(INIT)
  const [auto, setAuto] = useState(false)
  const [showSq, setShowSq] = useState(true)

  const best = fitLS(pts)
  const w = auto ? best.w : (ends[1] - ends[0]) / (XR - XL)
  const b = auto ? best.b : ends[0] - w * XL
  const yL = w * XL + b
  const yR = w * XR + b
  const total = sse(pts, w, b)
  const bestTotal = sse(pts, best.w, best.b)
  const areas = pts.map(([x, y]) => (y - (w * x + b)) ** 2)
  const biggest = areas.indexOf(Math.max(...areas))
  const moved = pts.some((p, i) => p[1] !== RIDES[i][1])

  const dragEnd = (which: 0 | 1, v: number) => {
    const next: [number, number] = [yL, yR]
    next[which] = v
    setEnds(next)
    setAuto(false)
  }

  return (
    <Figure
      title="Residuals as squares"
      caption={
        <>
          Each orange square sits on one residual (the gap between a fare and the line), so its area is that residual squared. Drag the two green
          handles to make the <b>total</b> orange area as small as you can, then press <b>Snap to the best-fit line</b>. Now drag ride 3's fare far
          upwards (a surge-priced ride): its square grows with the <i>square</i> of the gap, takes over the total, and drags the best-fit line
          towards it. An outlier at either end does something different: it tilts the whole line.
        </>
      }
    >
      <Plot x={X} y={Y} width={520} height={330} minHeight={300} maxWidth={680} ariaLabel={`Five Grab rides with the line ${lineText(w, b)} and a square on each residual; total squared error ${fmt(total)}`}>
        <Grid xTicks={6} yTicks={6} />
        <Axes xLabel="distance x (km)" yLabel="fare y ($)" xTicks={6} yTicks={6} />
        {showSq && <Squares pts={pts} w={w} b={b} />}
        <Residuals pts={pts} w={w} b={b} />
        <Path points={[[X[0], w * X[0] + b], [X[1], w * X[1] + b]]} color="var(--viz-3)" width={3} />
        {pts.map(([x, y], i) => (
          <DragDot
            key={i}
            x={x}
            y={y}
            lockX
            r={7}
            tag={String(i + 1)}
            ariaLabel={`Fare of ride ${i + 1} (${x} km)`}
            onChange={(_, ny) => setPts((ps) => ps.map((p, k) => (k === i ? [p[0], ny] : p)))}
          />
        ))}
        <DragDot x={XL} y={yL} lockX square r={7} color="var(--viz-3)" ariaLabel="Left end of the line" onChange={(_, ny) => dragEnd(0, ny)} />
        <DragDot x={XR} y={yR} lockX square r={7} color="var(--viz-3)" ariaLabel="Right end of the line" onChange={(_, ny) => dragEnd(1, ny)} />
      </Plot>
      <Readout
        items={[
          ['line', lineText(w, b)],
          ['total squared error', fix(total, 2)],
          ['MSE = total ÷ 5', fix(total / pts.length, 3)],
          ['best possible MSE', fix(bestTotal / pts.length, 3)],
        ]}
      />
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.35rem' }}>Each ride's share of the total squared error</div>
        <Bars
          ariaLabel="Squared residual of each ride"
          max={Math.max(total, 1e-9)}
          format={(v) => `${fix(v, 2)} (${total > 1e-9 ? Math.round((100 * v) / total) : 0}%)`}
          data={areas.map((a, i) => ({
            label: `ride ${i + 1}`,
            value: a,
            color: i === biggest && a > 0 ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-2) 55%, var(--surface))',
            strong: i === biggest && a > 0,
          }))}
        />
      </div>
      <Controls>
        <Button primary onClick={() => setAuto(true)} disabled={auto}>
          Snap to the best-fit line
        </Button>
        <Button
          onClick={() => {
            setPts(RIDES)
            setEnds(INIT)
            setAuto(false)
          }}
        >
          Reset
        </Button>
        <Toggle label="Show squares" checked={showSq} onChange={setShowSq} />
      </Controls>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ink-2)', width: '100%' }}>
        {auto
          ? moved
            ? 'The line is following the least-squares fit. One big gap costs more than several small ones, so the line bends towards the outlier.'
            : 'This is the least-squares line: no other line has a smaller total area. Now drag one fare up and watch the line follow it.'
          : 'Your line. Drag the green handles, or snap to the best fit.'}
      </p>
    </Figure>
  )
}
