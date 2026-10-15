import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, Plot, Grid, Axes, FnPath, Dots, DraggablePoint, usePlot, M } from '../../../../../kit'
import { FLATS, AREA, PRICE, mse, bestLine, fmt, plainTick } from './hdbFlats'

/*
  Residuals drawn as vertical lines and squared errors drawn as real squares (side = |residual| in pixels,
  so area ∝ residual²). One flat can be dragged anywhere to show how a single outlier dominates the MSE.
*/

const HOT = 25 // index of the flat the learner can drag (120 m², S$790k: already the worst-fitting flat)

function Squares({ data, w, b, show }: { data: [number, number][]; w: number; b: number; show: boolean }) {
  const { xs, ys, clipId } = usePlot()
  const right = xs.range()[1]
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {data.map(([x, y], i) => {
        const px = xs(x)
        const py = ys(y)
        const pl = ys(w * x + b)
        const side = Math.abs(py - pl)
        const left = px + side > right ? px - side : px
        const hot = i === HOT
        const c = hot ? 'var(--viz-4)' : 'var(--viz-neg)'
        return (
          <g key={i}>
            {show && side > 0.5 && (
              <rect
                x={left}
                y={Math.min(py, pl)}
                width={side}
                height={side}
                style={{ fill: `color-mix(in srgb, ${c} ${hot ? 22 : 10}%, transparent)`, stroke: c, strokeWidth: hot ? 1.6 : 1, strokeOpacity: hot ? 0.8 : 0.45 }}
              />
            )}
            <line x1={px} x2={px} y1={py} y2={pl} style={{ stroke: c, strokeWidth: hot ? 2.5 : 1.6 }} />
          </g>
        )
      })}
    </g>
  )
}

export default function SquaredErrorPreview() {
  const [w, setW] = useState(4)
  const [b, setB] = useState(180)
  const [hot, setHot] = useState<[number, number]>(FLATS[HOT])
  const [showSquares, setShowSquares] = useState(true)

  const data = useMemo(() => FLATS.map((p, i) => (i === HOT ? hot : p)), [hot])
  const sq = data.map(([x, y]) => (y - (w * x + b)) ** 2)
  const total = sq.reduce((a, v) => a + v, 0)
  const loss = total / data.length
  const best = bestLine(data)
  const bestLoss = mse(best.w, best.b, data)
  const share = total > 0 ? sq[HOT] / total : 0
  const moved = hot[0] !== FLATS[HOT][0] || hot[1] !== FLATS[HOT][1]
  const r = hot[1] - (w * hot[0] + b)

  return (
    <Figure
      title="Residuals and squared errors"
      caption={
        <>
          Each red line is a <strong>residual</strong>: actual price minus predicted price. Each square has that residual as its side, so its area is the{' '}
          <strong>squared error</strong>, and the MSE is the average area. Move the line and watch the squares shrink or grow. Then drag the pink flat far from the
          line: one big miss makes a giant square that can outweigh all the others put together.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', justifyItems: 'center', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <Plot x={AREA} y={PRICE} width={520} height={360} minHeight={300} margin={{ left: 46 }} ariaLabel="HDB flats with a line, vertical residual lines and squared-error squares">
        <Grid xTicks={6} yTicks={8} />
        <Axes xLabel="floor area (m²)" yLabel="price (S$ thousands)" xTicks={6} yTicks={5} tickFormat={plainTick} />
        <Squares data={data} w={w} b={b} show={showSquares} />
        <FnPath f={(x) => w * x + b} color="var(--viz-2)" width={3} />
        <Dots points={data.filter((_, i) => i !== HOT).map(([x, y]) => ({ x, y }))} r={4.5} color="var(--viz-1)" />
        <DraggablePoint
          x={hot[0]}
          y={hot[1]}
          color="var(--viz-4)"
          r={8}
          label={moved ? undefined : 'drag me'}
          onChange={(x, y) => setHot([Math.round(x), Math.round(y)])}
        />
      </Plot>
      </div>
      <Controls>
        <Slider label={<>slope <M>w</M></>} value={w} min={0} max={9} step={0.1} onChange={setW} format={(v) => v.toFixed(1)} />
        <Slider label={<>intercept <M>b</M></>} value={b} min={-300} max={600} step={5} onChange={setB} />
      </Controls>
      <div style={{ width: '100%', display: 'grid', gap: '0.35rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)' }}>
          <span>Where the total squared error comes from (one slice per flat)</span>
          <span style={{ color: 'var(--ink)' }}>pink flat: {Math.round(share * 100)}%</span>
        </div>
        <div
          role="img"
          aria-label={`The pink flat contributes ${Math.round(share * 100)} percent of the total squared error`}
          style={{ display: 'flex', width: '100%', height: 18, borderRadius: 6, overflow: 'hidden', background: 'var(--surface-3)' }}
        >
          {sq.map((v, i) => (
            <span
              key={i}
              style={{
                width: `${total > 0 ? (100 * v) / total : 0}%`,
                background: i === HOT ? 'var(--viz-4)' : `color-mix(in srgb, var(--viz-neg) ${i % 2 ? 55 : 35}%, var(--surface))`,
              }}
            />
          ))}
        </div>
      </div>
      <Controls>
        <Readout
          items={[
            ['MSE', fmt(loss)],
            ['lowest possible MSE', fmt(bestLoss)],
            ['pink flat’s residual', `${r >= 0 ? '+' : '−'}${fmt(Math.abs(r))}`],
          ]}
        />
        <Toggle label="Show squares" checked={showSquares} onChange={setShowSquares} />
        <Button onClick={() => setHot(FLATS[HOT])} disabled={!moved}>
          Put the flat back
        </Button>
      </Controls>
    </Figure>
  )
}
