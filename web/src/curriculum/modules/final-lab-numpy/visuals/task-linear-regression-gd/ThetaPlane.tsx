import { useMemo } from 'react'
import { Plot, Grid, Axes, Path, Dots, Label, usePlot } from '../../../../../kit'
import { levelSet, saneBox, THETA_STAR } from './gd'

/*
  The (θ0, θ1) plane for the 2025 Task 1 data: contour ellipses of the cost J, the target
  θ* = (0, 1), and one or two gradient-descent paths.
*/

const LEVELS = [0.005, 0.03, 0.15, 0.6, 2, 5, 9.333]

export function ThetaPlane({
  paths,
  current,
  ariaLabel,
  height = 300,
  x = [-0.35, 0.8],
  y = [-0.45, 1.75],
}: {
  paths: { pts: number[][]; color: string; dash?: string; width?: number }[]
  current?: { p: number[]; color: string; label?: string }
  ariaLabel: string
  height?: number
  x?: [number, number]
  y?: [number, number]
}) {
  const rings = useMemo(() => LEVELS.map((c) => levelSet(c)), [])
  return (
    <Plot x={x} y={y} width={380} height={height} minHeight={250} margin={{ left: 42, bottom: 36, right: 12, top: 12 }} ariaLabel={ariaLabel}>
      <Grid xTicks={6} yTicks={6} />
      {rings.map((pts, i) => (
        <Path key={i} points={pts} color="var(--viz-muted)" width={1} opacity={0.75} />
      ))}
      <Axes xLabel="θ₀" yLabel="θ₁" xTicks={5} yTicks={5} />
      {paths.map((p, i) => (
        <Path key={i} points={saneBox(p.pts)} color={p.color} width={p.width ?? 2.2} dash={p.dash} />
      ))}
      <Dots points={[{ x: 0, y: 0, color: 'var(--viz-ink)', r: 3.5 }]} />
      <Label x={0} y={0} dx={6} dy={14} size={11} color="var(--ink-3)">
        start
      </Label>
      <Dots points={[{ x: THETA_STAR[0], y: THETA_STAR[1], color: 'var(--viz-3)', r: 6, shape: 'cross' }]} />
      <HaloText x={THETA_STAR[0]} y={THETA_STAR[1]} dx={-9} dy={17} text="best θ = (0, 1)" />
      {current && Number.isFinite(current.p[0]) && Math.abs(current.p[0]) < 50 && Math.abs(current.p[1]) < 50 && (
        <Dots points={[{ x: current.p[0], y: current.p[1], color: current.color, r: 6 }]} />
      )}
    </Plot>
  )
}

/** a label with a background-coloured outline so it stays readable over contour lines */
function HaloText({ x, y, dx, dy, text }: { x: number; y: number; dx: number; dy: number; text: string }) {
  const { xs, ys } = usePlot()
  return (
    <text
      x={xs(x) + dx}
      y={ys(y) + dy}
      textAnchor="end"
      className="plot-label"
      style={{ fill: 'var(--viz-3)', fontSize: 11, fontWeight: 700, stroke: 'var(--surface)', strokeWidth: 3.5, paintOrder: 'stroke', strokeLinejoin: 'round' }}
    >
      {text}
    </text>
  )
}
