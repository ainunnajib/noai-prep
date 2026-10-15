import type { CSSProperties, ReactNode } from 'react'
import css from './tl.module.css'

/*
  Procedurally drawn "photos" shared by this lesson's visuals. Every drawing lives in a
  100 × 100 user-space square (y points down, like SVG) so it can be flipped, rotated and
  cropped with plain SVG transforms. Colours come from theme tokens only.
*/

export const viz = (k: number) => `var(--viz-${k})`
export const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, var(--surface))`

/** A cat sitting in a garden. Deliberately asymmetric (sun top-left, tree and tail on the right) so flips are obvious. */
export function CatScene() {
  return (
    <g>
      <rect x={0} y={0} width={100} height={100} style={{ fill: tint(viz(1), 16) }} />
      <circle cx={16} cy={16} r={8} style={{ fill: viz(6) }} />
      <rect x={0} y={72} width={100} height={28} style={{ fill: tint(viz(3), 45) }} />
      <rect x={82} y={48} width={5} height={27} style={{ fill: tint(viz(6), 70) }} />
      <circle cx={84.5} cy={42} r={11} style={{ fill: viz(3) }} />
      {/* tail */}
      <path d="M60,72 C74,72 74,58 68,50" style={{ fill: 'none', stroke: viz(2), strokeWidth: 4.5, strokeLinecap: 'round' }} />
      {/* body */}
      <ellipse cx={48} cy={62} rx={15} ry={14} style={{ fill: viz(2) }} />
      {/* ears + head */}
      <path d="M31.5,36 L33,23 L40,31 Z M40,31 L47,23 L48.5,36 Z" style={{ fill: viz(2) }} />
      <circle cx={40} cy={40} r={10} style={{ fill: viz(2) }} />
      <circle cx={36.3} cy={38.5} r={1.5} style={{ fill: 'var(--viz-ink)' }} />
      <circle cx={43.7} cy={38.5} r={1.5} style={{ fill: 'var(--viz-ink)' }} />
      <path d="M38.6,42.4 L41.4,42.4 L40,44 Z" style={{ fill: 'var(--viz-ink)' }} />
    </g>
  )
}

/** A handwritten-looking 6 on paper. */
export function DigitSix() {
  const ink = { fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <g>
      <rect x={0} y={0} width={100} height={100} style={{ fill: tint(viz(6), 10) }} />
      <path d="M64,18 C48,22 35,38 34,62" style={ink} />
      <circle cx={51} cy={64} r={17} style={ink} />
    </g>
  )
}

/** A round blue "turn left" road sign on a post. */
export function TurnLeftSign() {
  return (
    <g>
      <rect x={0} y={0} width={100} height={100} style={{ fill: tint(viz(3), 18) }} />
      <rect x={47} y={76} width={6} height={24} style={{ fill: 'var(--viz-muted)' }} />
      <circle cx={50} cy={44} r={34} style={{ fill: viz(1), stroke: 'var(--surface)', strokeWidth: 2.5 }} />
      <path d="M61,68 L61,46 Q61,37 52,37 L40,37" style={{ fill: 'none', stroke: 'var(--surface)', strokeWidth: 8, strokeLinejoin: 'round' }} />
      <path d="M26,37 L42,24 L42,50 Z" style={{ fill: 'var(--surface)' }} />
    </g>
  )
}

/** A satellite tile: fields, a river, a road and a few roofs. Has no natural "up". */
export function SatelliteTile() {
  return (
    <g>
      <rect x={0} y={0} width={100} height={100} style={{ fill: tint(viz(3), 40) }} />
      <rect x={0} y={0} width={46} height={38} style={{ fill: tint(viz(6), 45) }} />
      <rect x={58} y={0} width={42} height={30} style={{ fill: tint(viz(3), 65) }} />
      <rect x={60} y={62} width={40} height={38} style={{ fill: tint(viz(6), 30) }} />
      <rect x={0} y={70} width={30} height={30} style={{ fill: tint(viz(3), 25) }} />
      <path d="M-5,52 C20,40 38,70 60,50 S90,30 105,44" style={{ fill: 'none', stroke: viz(1), strokeWidth: 9, strokeLinecap: 'round' }} />
      <path d="M52,-5 L48,105" style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 3.5 }} />
      {[
        [62, 8],
        [72, 12],
        [66, 20],
        [20, 80],
        [12, 88],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={7} height={6} style={{ fill: viz(4) }} />
      ))}
    </g>
  )
}

/*
  A chest X-ray with a faint nodule in the patient's right lung (image left). Drawn from
  brightness values v in [0, 1] (0 = black film, 1 = white bone) so a brightness/contrast change
  can be applied to the numbers themselves, exactly as a real pixel transform (results are clipped
  to [0, 1], although the change used in this lesson never reaches either end).
  The film colours come from a local CSS class so it looks like an X-ray in both themes.
*/
const XR = { film: 0.03, body: 0.3, lung: 0.13, nodule: 0.24, heart: 0.52, rib: 0.62, spine: 0.8, clavicle: 0.7 }

export function ChestXray({ contrast = 1, brightness = 1 }: { contrast?: number; brightness?: number }) {
  // contrast scales distances from mid-grey, brightness multiplies; results are clipped to [0, 1]
  const v = (x: number) => Math.max(0, Math.min(1, brightness * (contrast * (x - 0.5) + 0.5)))
  const c = (x: number) => `color-mix(in srgb, var(--xr-light) ${Math.round(v(x) * 100)}%, var(--xr-dark))`
  const rib = (side: -1 | 1, y: number) => {
    const x0 = 50 + side * 5
    const x1 = 50 + side * 38
    return `M${x0},${y} C${50 + side * 22},${y - 9} ${x1},${y - 4} ${x1 - side * 2},${y + 12}`
  }
  return (
    <g className={css.xray}>
      <rect x={0} y={0} width={100} height={100} style={{ fill: c(XR.film) }} />
      <path d="M10,100 L12,30 Q14,16 30,12 L70,12 Q86,16 88,30 L90,100 Z" style={{ fill: c(XR.body) }} />
      <ellipse cx={31} cy={52} rx={15} ry={30} style={{ fill: c(XR.lung) }} />
      <ellipse cx={69} cy={52} rx={15} ry={30} style={{ fill: c(XR.lung) }} />
      <path d="M50,48 C66,46 76,62 72,76 C66,84 52,82 48,74 Z" style={{ fill: c(XR.heart) }} />
      {[30, 42, 54, 66].map((y) => (
        <g key={y}>
          <path d={rib(-1, y)} style={{ fill: 'none', stroke: c(XR.rib), strokeWidth: 2.4 }} />
          <path d={rib(1, y)} style={{ fill: 'none', stroke: c(XR.rib), strokeWidth: 2.4 }} />
        </g>
      ))}
      <rect x={47.5} y={12} width={5} height={88} rx={2} style={{ fill: c(XR.spine) }} />
      <path d="M48,22 C40,18 28,20 18,24 M52,22 C60,18 72,20 82,24" style={{ fill: 'none', stroke: c(XR.clavicle), strokeWidth: 3, strokeLinecap: 'round' }} />
      <circle cx={27} cy={61} r={4.5} style={{ fill: c(XR.nodule) }} />
    </g>
  )
}

/** Wrap a 100×100 drawing in its own responsive SVG. */
export function Frame({
  children,
  size,
  label,
  style,
  className,
}: {
  children: ReactNode
  size?: number | string
  label: string
  style?: CSSProperties
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
      className={className}
      style={{ width: size ?? '100%', height: 'auto', display: 'block', borderRadius: 6, overflow: 'hidden', ...style }}
    >
      {children}
    </svg>
  )
}

/* ---------- the three classes used in the feature-space experiment ---------- */

export interface ThumbParams {
  cls: number
  cx: number
  cy: number
  s: number
  fg: number
  bg: number
  flip: boolean
}

export const CLASS_NAMES = ['cat', 'house', 'car']
/** colour and marker shape for each class in the scatter plot */
export const CLASS_STYLE: { color: string; shape: 'circle' | 'square' | 'triangle' }[] = [
  { color: 'var(--viz-2)', shape: 'circle' },
  { color: 'var(--viz-3)', shape: 'square' },
  { color: 'var(--viz-1)', shape: 'triangle' },
]

/**
 * One generated thumbnail, drawn in a unit square. The geometry matches the Python script
 * that rasterised the same images and fed them to the frozen encoder.
 */
export function Thumb({ p, size = 56, label }: { p: ThumbParams; size?: number; label?: string }) {
  const { cls, cx, cy, s, fg, bg, flip } = p
  const F = viz(fg + 1)
  const B = tint(viz(bg + 1), 18)
  let body: ReactNode
  if (cls === 0) {
    body = (
      <>
        <path
          d={`M${cx - 0.23 * s},${cy - 0.04 * s} L${cx - 0.2 * s},${cy - 0.3 * s} L${cx - 0.04 * s},${cy - 0.15 * s} Z M${cx + 0.23 * s},${cy - 0.04 * s} L${cx + 0.2 * s},${cy - 0.3 * s} L${cx + 0.04 * s},${cy - 0.15 * s} Z`}
          style={{ fill: F }}
        />
        <circle cx={cx} cy={cy + 0.06 * s} r={0.24 * s} style={{ fill: F }} />
        <circle cx={cx - 0.09 * s} cy={cy + 0.03 * s} r={0.035 * s} style={{ fill: B }} />
        <circle cx={cx + 0.09 * s} cy={cy + 0.03 * s} r={0.035 * s} style={{ fill: B }} />
      </>
    )
  } else if (cls === 1) {
    body = (
      <>
        <path d={`M${cx - 0.27 * s},${cy - 0.02 * s} L${cx},${cy - 0.3 * s} L${cx + 0.27 * s},${cy - 0.02 * s} Z`} style={{ fill: F }} />
        <rect x={cx - 0.2 * s} y={cy - 0.03 * s} width={0.4 * s} height={0.31 * s} style={{ fill: F }} />
        <rect x={cx - 0.05 * s} y={cy + 0.12 * s} width={0.1 * s} height={0.16 * s} style={{ fill: B }} />
      </>
    )
  } else {
    const f = flip ? -1 : 1
    const a = Math.min(cx + f * -0.17 * s, cx + f * 0.13 * s)
    body = (
      <>
        <rect x={a} y={cy - 0.14 * s} width={0.3 * s} height={0.13 * s} style={{ fill: F }} />
        <rect x={cx - 0.32 * s} y={cy - 0.02 * s} width={0.64 * s} height={0.16 * s} style={{ fill: F }} />
        <circle cx={cx - 0.19 * s} cy={cy + 0.15 * s} r={0.08 * s} style={{ fill: 'var(--viz-ink)' }} />
        <circle cx={cx + 0.19 * s} cy={cy + 0.15 * s} r={0.08 * s} style={{ fill: 'var(--viz-ink)' }} />
      </>
    )
  }
  return (
    <svg viewBox="0 0 1 1" width={size} height={size} role="img" aria-label={label ?? CLASS_NAMES[cls]} style={{ display: 'block', borderRadius: 4, flex: 'none' }}>
      <rect x={0} y={0} width={1} height={1} style={{ fill: B }} />
      {body}
    </svg>
  )
}
