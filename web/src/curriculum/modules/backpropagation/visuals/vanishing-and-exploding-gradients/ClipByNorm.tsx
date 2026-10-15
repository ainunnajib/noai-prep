import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, usePlot, Grid, Axes, Arrow, DraggablePoint, M } from '../../../../../kit'
import { SIZE_COLOUR } from './sim'

/*
  Gradient clipping in 2-D. Drag the tip of the gradient g. Clip by norm rescales g onto the circle of radius c
  (same direction, shorter). Clip by value clamps each component to [−c, c] (can change the direction).
*/

type Mode = 'norm' | 'value'

function Region({ c, mode }: { c: number; mode: Mode }) {
  const { xs, ys } = usePlot()
  // the x and y scales can differ by a pixel or two per unit, so size each direction with its own scale
  const rx = xs(c) - xs(0)
  const ry = ys(0) - ys(c)
  const style = { fill: 'color-mix(in srgb, var(--viz-axis) 8%, transparent)', stroke: 'var(--viz-axis)', strokeWidth: 2, strokeDasharray: '6 4' }
  return mode === 'norm' ? (
    <ellipse cx={xs(0)} cy={ys(0)} rx={rx} ry={ry} style={style} />
  ) : (
    <rect x={xs(-c)} y={ys(c)} width={xs(c) - xs(-c)} height={ys(-c) - ys(c)} style={style} />
  )
}

/** "clipped" written beside the middle of the clipped arrow, off to one side so it never sits on g's label */
function ClippedLabel({ v }: { v: [number, number] }) {
  const { xs, ys } = usePlot()
  const x0 = xs(0)
  const y0 = ys(0)
  const x1 = xs(v[0])
  const y1 = ys(v[1])
  const len = Math.hypot(x1 - x0, y1 - y0)
  if (len < 30) return null
  // unit normal, turned clockwise on screen
  const nx = -(y1 - y0) / len
  const ny = (x1 - x0) / len
  const mx = (x0 + x1) / 2 - nx * 16
  const my = (y0 + y1) / 2 - ny * 16
  return (
    <text x={mx} y={my} dy="0.32em" textAnchor="middle" className="plot-label" style={{ fill: SIZE_COLOUR.healthy, fontWeight: 800, fontSize: 12.5 }}>
      clipped
    </text>
  )
}

const fmt = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))

export default function ClipByNorm() {
  const [g, setG] = useState<[number, number]>([6, 8])
  const [c, setC] = useState(5)
  const [mode, setMode] = useState<Mode>('norm')
  const norm = Math.hypot(g[0], g[1])
  const clipped: [number, number] =
    mode === 'norm'
      ? norm > c
        ? [(g[0] * c) / norm, (g[1] * c) / norm]
        : g
      : [Math.max(-c, Math.min(c, g[0])), Math.max(-c, Math.min(c, g[1]))]
  const changed = clipped[0] !== g[0] || clipped[1] !== g[1]
  const angle = (v: [number, number]) => (Math.atan2(v[1], v[0]) * 180) / Math.PI
  let turn = Math.abs(angle(g) - angle(clipped))
  if (turn > 180) turn = 360 - turn
  if (norm < 1e-9) turn = 0
  const snap = (x: number, y: number): [number, number] => [Math.round(x * 2) / 2, Math.round(y * 2) / 2]

  return (
    <Figure
      title="Clip the gradient, keep its direction"
      caption={
        <>
          Drag the orange tip to make the gradient <M>g</M> bigger or smaller. With <b>clip by norm</b>, any gradient longer than <M>c</M> is
          shrunk back onto the dashed circle: the green arrow points the same way, only shorter. Short gradients are left alone, so clipping can never
          help a gradient that is too <em>small</em>. Switch to <b>clip by value</b>: each component is cut to <M>[-c, c]</M> separately, and for a
          long diagonal gradient the direction turns.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Clipping rule"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'norm', label: 'clip by norm' },
            { value: 'value', label: 'clip by value' },
          ]}
        />
      </Controls>
      <div style={{ width: '100%', display: 'grid', justifyItems: 'center', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <Plot x={[-10, 10]} y={[-10, 10]} width={380} height={380} ariaLabel={`Gradient (${fmt(g[0])}, ${fmt(g[1])}) clipped to (${fmt(clipped[0])}, ${fmt(clipped[1])}).`}>
        <Grid xTicks={10} yTicks={10} />
        <Axes origin xTicks={2} yTicks={2} />
        <Region c={c} mode={mode} />
        <Arrow from={[0, 0]} to={g} color="var(--viz-2)" width={changed ? 2 : 3} dash={changed ? '5 4' : undefined} />
        {changed && <Arrow from={[0, 0]} to={clipped} color={SIZE_COLOUR.healthy} width={4} />}
        {changed && <ClippedLabel v={clipped} />}
        <DraggablePoint x={g[0]} y={g[1]} onChange={(x, y) => setG(snap(x, y))} color="var(--viz-2)" label={changed ? 'g (drag)' : 'g, unchanged (drag)'} />
      </Plot>
      </div>
      <Controls>
        <Slider label={<>threshold <M>c</M> (max_norm)</>} value={c} min={1} max={9} step={0.5} onChange={setC} format={(v) => v.toFixed(1)} />
        <Readout
          items={[
            [<M key="g">g</M>, `(${fmt(g[0])}, ${fmt(g[1])})`],
            [<M key="n">{'\\lVert g \\rVert'}</M>, norm.toFixed(2)],
            ['after clipping', `(${fmt(clipped[0])}, ${fmt(clipped[1])})`],
            ['new length', Math.hypot(clipped[0], clipped[1]).toFixed(2)],
            ['direction turned by', `${turn.toFixed(1)}°`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
