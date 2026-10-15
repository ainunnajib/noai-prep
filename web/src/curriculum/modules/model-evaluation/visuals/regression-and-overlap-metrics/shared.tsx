import { usePlot } from '../../../../../kit'

/*
  Helpers shared by the regression visuals.
  ErrorSquares draws, for each point, a square whose side is the vertical gap between the true value
  and the prediction. It is drawn in screen pixels, so it is a true square even when the x and y
  scales differ, and its AREA is proportional to the squared error.
*/

export interface ErrPoint {
  x: number
  /** true value */
  y: number
  /** prediction */
  p: number
}

export function ErrorSquares({ pts, color, opacity = 22 }: { pts: ErrPoint[]; color: string; opacity?: number }) {
  const { xs, ys, clipId } = usePlot()
  const right = xs.range()[1]
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {pts.map((d, i) => {
        const y1 = ys(d.y)
        const y2 = ys(d.p)
        const side = Math.abs(y1 - y2)
        if (side < 0.5) return null
        const x0 = xs(d.x)
        // draw to the right of the residual line unless that would leave the plot
        const left = x0 + side > right ? x0 - side : x0
        return (
          <rect
            key={i}
            x={left}
            y={Math.min(y1, y2)}
            width={side}
            height={side}
            style={{ fill: `color-mix(in srgb, ${color} ${opacity}%, transparent)`, stroke: color, strokeWidth: 1.2 }}
          />
        )
      })}
    </g>
  )
}

/** vertical residual segments from each true value to its prediction */
export function ResidualLines({ pts, color }: { pts: ErrPoint[]; color: string }) {
  const { xs, ys } = usePlot()
  return (
    <g aria-hidden="true">
      {pts.map((d, i) => (
        <line key={i} x1={xs(d.x)} x2={xs(d.x)} y1={ys(d.y)} y2={ys(d.p)} style={{ stroke: color, strokeWidth: 2.2 }} />
      ))}
    </g>
  )
}

/** 2 -> "2", 2.5 -> "2.5", 2.25 -> "2.25" */
export const fmtNum = (v: number, maxDp = 2) => String(Math.round(v * 10 ** maxDp) / 10 ** maxDp)
