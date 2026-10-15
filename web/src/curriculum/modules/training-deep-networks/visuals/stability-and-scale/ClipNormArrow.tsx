import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Arrow, DraggablePoint, usePlot, M } from '../../../../../kit'
import { Legend, Note } from './parts'

/*
  Clip by norm versus clip by value, in 2-D. Drag the tip of the gradient g. The circle has radius
  max_norm: norm clipping shrinks any arrow that pokes out of it back onto the circle, along the same
  line. The square is [-c, c] x [-c, c]: value clipping cuts each component separately, which can
  turn the arrow.
  Aha: norm clipping preserves direction, value clipping can change it.
*/

type Mode = 'norm' | 'value' | 'both'
const R = 5

function Regions({ c, mode }: { c: number; mode: Mode }) {
  const { xs, ys, clipId } = usePlot()
  const cx = xs(0)
  const cy = ys(0)
  const rx = Math.abs(xs(c) - cx)
  const ry = Math.abs(ys(c) - cy)
  return (
    <g clipPath={`url(#${clipId})`}>
      {mode !== 'norm' && (
        <rect
          x={cx - rx}
          y={cy - ry}
          width={2 * rx}
          height={2 * ry}
          style={{ fill: 'color-mix(in srgb, var(--viz-4) 9%, transparent)', stroke: 'var(--viz-4)', strokeWidth: 1.6, strokeDasharray: '6 4' }}
        />
      )}
      {mode !== 'value' && (
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} style={{ fill: 'color-mix(in srgb, var(--viz-3) 12%, transparent)', stroke: 'var(--viz-3)', strokeWidth: 2 }} />
      )}
    </g>
  )
}

const deg = (v: [number, number]) => (Math.atan2(v[1], v[0]) * 180) / Math.PI
const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))
const vec = (v: [number, number]) => `(${f2(v[0])}, ${f2(v[1])})`

export default function ClipNormArrow() {
  const [g, setG] = useState<[number, number]>([1.2, 4.2])
  const [c, setC] = useState(2)
  const [mode, setMode] = useState<Mode>('both')

  const norm = Math.hypot(g[0], g[1])
  const factor = norm > c ? c / norm : 1
  const gn: [number, number] = [g[0] * factor, g[1] * factor]
  const clamp = (v: number) => Math.max(-c, Math.min(c, v))
  const gv: [number, number] = [clamp(g[0]), clamp(g[1])]
  const turn = norm > 1e-9 && Math.hypot(gv[0], gv[1]) > 1e-9 ? Math.abs(((deg(gv) - deg(g) + 540) % 360) - 180) : 0
  const valueChanged = gv[0] !== g[0] || gv[1] !== g[1]

  const snap = (x: number, y: number): [number, number] => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]

  const showN = mode !== 'value'
  const showV = mode !== 'norm'

  return (
    <Figure
      title="Clip by norm or clip by value?"
      caption={
        <>
          <b>Drag the tip</b> of the gradient <M>g</M> (blue) and slide <b>max_norm</b>. Norm clipping (green) shrinks an arrow that pokes out of the
          circle back onto it, keeping its direction. Value clipping (pink) cuts each component to the square <M>{'[-c, c]'}</M> separately. Drag the arrow
          steeply upwards: the pink arrow tilts towards the diagonal, the green one never turns.
        </>
      }
    >
      <Segmented
        label="Show"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'norm', label: 'clip by norm' },
          { value: 'value', label: 'clip by value' },
          { value: 'both', label: 'both' },
        ]}
      />
      <Plot x={[-R, R]} y={[-R, R]} width={420} height={420} margin={{ left: 28, right: 28, top: 28, bottom: 28 }} ariaLabel={`Gradient ${vec(g)} with length ${norm.toFixed(2)}. Clipped by norm to ${vec(gn)}; clipped by value to ${vec(gv)}.`}>
        <Grid xTicks={10} yTicks={10} />
        <Axes origin xTicks={5} yTicks={5} />
        <Regions c={c} mode={mode} />
        <Arrow from={[0, 0]} to={g} color="var(--viz-1)" width={3.2} />
        {showV && valueChanged && <Arrow from={[0, 0]} to={gv} color="var(--viz-4)" width={3.2} dash="7 4" />}
        {showN && factor < 1 && <Arrow from={[0, 0]} to={gn} color="var(--viz-3)" width={3.6} />}
        <DraggablePoint x={g[0]} y={g[1]} color="var(--viz-1)" r={8} onChange={(x, y) => setG(snap(x, y))} label="g (drag me)" />
      </Plot>
      <Legend
        items={[
          { color: 'var(--viz-1)', label: 'gradient g' },
          ...(showN ? [{ color: 'var(--viz-3)', label: 'clipped by norm' }] : []),
          ...(showV ? [{ color: 'var(--viz-4)', label: 'clipped by value', dash: true }] : []),
        ]}
      />
      <Note tone={factor < 1 || valueChanged ? 'plain' : 'good'}>
        {showN &&
          (factor < 1 ? (
            <div>
              <b>Norm:</b> ‖g‖ = {norm.toFixed(2)} &gt; {c.toFixed(1)}, so multiply by {c.toFixed(1)} / {norm.toFixed(2)} = {factor.toFixed(3)}: {vec(g)} → {vec(gn)}. Length
              now exactly {c.toFixed(1)}, direction unchanged.
            </div>
          ) : (
            <div>
              <b>Norm:</b> ‖g‖ = {norm.toFixed(2)} ≤ {c.toFixed(1)}, so g is left exactly as it is.
            </div>
          ))}
        {showV &&
          (valueChanged ? (
            <div>
              <b>Value:</b> each component is cut to [−{c.toFixed(1)}, {c.toFixed(1)}]: {vec(g)} → {vec(gv)}. The arrow turns by{' '}
              <b>{turn.toFixed(0)}°</b>.
            </div>
          ) : (
            <div>
              <b>Value:</b> both components are inside [−{c.toFixed(1)}, {c.toFixed(1)}], so nothing changes.
            </div>
          ))}
      </Note>
      <Controls>
        <Slider label="max_norm (and clip value) c" value={c} min={0.5} max={4.5} step={0.1} onChange={setC} format={(v) => v.toFixed(1)} />
        <Readout
          items={[
            ['g', vec(g)],
            ['‖g‖', norm.toFixed(2)],
            ['scale min(1, c/‖g‖)', factor.toFixed(3)],
            ['value clip turns it by', `${turn.toFixed(0)}°`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
