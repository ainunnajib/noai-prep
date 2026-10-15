import type { CSSProperties, ReactNode } from 'react'

/*
  Six small "photos" for the self-supervised visuals, each drawn in a 100 × 100 user-space square
  (y down) with its own background. Colours come from theme tokens only.
  Each picture also has a signature colour used for its points in the embedding plot.
*/

export const viz = (k: number) => `var(--viz-${k})`
export const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, var(--surface))`

const INK = 'var(--viz-ink)'

function Cat() {
  return (
    <g>
      <rect width={100} height={100} style={{ fill: tint(viz(1), 15) }} />
      <rect y={72} width={100} height={28} style={{ fill: tint(viz(3), 40) }} />
      <circle cx={85} cy={16} r={8} style={{ fill: 'var(--highlight)', stroke: viz(6), strokeWidth: 1 }} />
      <path d="M64,76 Q80,72 74,52" style={{ fill: 'none', stroke: viz(2), strokeWidth: 5, strokeLinecap: 'round' }} />
      <ellipse cx={50} cy={66} rx={18} ry={14} style={{ fill: viz(2) }} />
      <path d="M29,40 L31,24 L40,33 Z M44,33 L53,24 L55,40 Z" style={{ fill: viz(2) }} />
      <circle cx={42} cy={43} r={12} style={{ fill: viz(2) }} />
      <circle cx={37.5} cy={41} r={1.8} style={{ fill: INK }} />
      <circle cx={46.5} cy={41} r={1.8} style={{ fill: INK }} />
      <path d="M40.5,46 L43.5,46 L42,48 Z" style={{ fill: INK }} />
    </g>
  )
}

function Block() {
  // an HDB-style block of flats
  const windows: ReactNode[] = []
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 4; c++) windows.push(<rect key={`${r}-${c}`} x={33 + c * 9} y={22 + r * 10} width={5} height={5} style={{ fill: tint(viz(1), 35) }} />)
  return (
    <g>
      <rect width={100} height={100} style={{ fill: tint(viz(1), 15) }} />
      <rect y={86} width={100} height={14} style={{ fill: tint(viz(3), 40) }} />
      <rect x={28} y={14} width={44} height={74} style={{ fill: 'var(--viz-muted)' }} />
      <rect x={26} y={10} width={48} height={6} style={{ fill: 'var(--viz-axis)' }} />
      {windows}
      <rect x={45} y={78} width={10} height={10} style={{ fill: 'var(--viz-axis)' }} />
      <circle cx={13} cy={74} r={9} style={{ fill: viz(3) }} />
      <rect x={11.5} y={78} width={3} height={10} style={{ fill: tint(viz(6), 80) }} />
    </g>
  )
}

function Car() {
  return (
    <g>
      <rect width={100} height={100} style={{ fill: tint(viz(1), 15) }} />
      <rect y={70} width={100} height={30} style={{ fill: tint('var(--viz-muted)', 45) }} />
      <path d="M0,86 H100" style={{ stroke: 'var(--surface)', strokeWidth: 2, strokeDasharray: '8 6' }} />
      <path d="M14,70 L20,56 Q24,48 34,46 L62,46 Q72,46 78,56 L86,58 Q92,60 92,68 L92,74 L14,74 Z" style={{ fill: viz(1) }} />
      <path d="M30,56 L35,50 L50,50 L50,57 Z M54,50 L64,50 Q69,51 72,57 L54,57 Z" style={{ fill: tint(viz(1), 25) }} />
      <circle cx={31} cy={75} r={8} style={{ fill: INK }} />
      <circle cx={75} cy={75} r={8} style={{ fill: INK }} />
      <circle cx={31} cy={75} r={3} style={{ fill: 'var(--viz-muted)' }} />
      <circle cx={75} cy={75} r={3} style={{ fill: 'var(--viz-muted)' }} />
    </g>
  )
}

function Tree() {
  return (
    <g>
      <rect width={100} height={100} style={{ fill: tint(viz(1), 15) }} />
      <rect y={80} width={100} height={20} style={{ fill: tint(viz(3), 40) }} />
      <rect x={45} y={52} width={10} height={32} style={{ fill: tint(viz(6), 80) }} />
      <circle cx={50} cy={38} r={24} style={{ fill: viz(3) }} />
      <circle cx={32} cy={50} r={13} style={{ fill: viz(3) }} />
      <circle cx={68} cy={50} r={13} style={{ fill: viz(3) }} />
      <circle cx={42} cy={32} r={3} style={{ fill: viz(4) }} />
      <circle cx={60} cy={42} r={3} style={{ fill: viz(4) }} />
    </g>
  )
}

function Fish() {
  return (
    <g>
      <rect width={100} height={100} style={{ fill: tint(viz(1), 32) }} />
      <path d="M8,88 Q14,70 10,56 M90,92 Q84,78 92,66" style={{ fill: 'none', stroke: viz(3), strokeWidth: 3, strokeLinecap: 'round' }} />
      <circle cx={22} cy={28} r={3} style={{ fill: 'none', stroke: 'var(--surface)', strokeWidth: 1.2 }} />
      <circle cx={28} cy={18} r={2} style={{ fill: 'none', stroke: 'var(--surface)', strokeWidth: 1.2 }} />
      <path d="M68,50 L88,36 L88,64 Z" style={{ fill: viz(6) }} />
      <ellipse cx={48} cy={50} rx={26} ry={15} style={{ fill: viz(6) }} />
      <circle cx={34} cy={46} r={2.6} style={{ fill: INK }} />
      <path d="M50,36 Q56,44 50,64" style={{ fill: 'none', stroke: tint(viz(6), 40), strokeWidth: 1.5 }} />
    </g>
  )
}

function Boat() {
  return (
    <g>
      <rect width={100} height={100} style={{ fill: tint(viz(1), 15) }} />
      <rect y={68} width={100} height={32} style={{ fill: tint(viz(1), 45) }} />
      <circle cx={16} cy={18} r={8} style={{ fill: 'var(--highlight)', stroke: viz(6), strokeWidth: 1 }} />
      <path d="M50,16 L50,62 L78,62 Z" style={{ fill: viz(4) }} />
      <path d="M47,24 L47,62 L28,62 Z" style={{ fill: tint(viz(4), 55) }} />
      <path d="M20,66 L82,66 L74,78 L28,78 Z" style={{ fill: INK }} />
      <path d="M0,84 Q12,80 25,84 T50,84 T75,84 T100,84" style={{ fill: 'none', stroke: 'var(--surface)', strokeWidth: 1.5 }} />
    </g>
  )
}

export interface PictureDef {
  name: string
  color: string
  Draw: () => ReactNode
}

export const PICTURES: PictureDef[] = [
  { name: 'cat', color: viz(2), Draw: Cat },
  { name: 'flats', color: 'var(--viz-muted)', Draw: Block },
  { name: 'car', color: viz(1), Draw: Car },
  { name: 'tree', color: viz(3), Draw: Tree },
  { name: 'fish', color: viz(6), Draw: Fish },
  { name: 'boat', color: viz(4), Draw: Boat },
]

/**
 * One picture in its own small SVG, optionally "augmented": zoomed in (a crop, centred at
 * (cx, cy) in 0..100), mirrored, and brightened or darkened by a CSS filter.
 */
export function Picture({
  index,
  size = 64,
  zoom = 1,
  cx = 50,
  cy = 50,
  flip = false,
  brightness = 1,
  label,
  style,
}: {
  index: number
  size?: number | string
  zoom?: number
  cx?: number
  cy?: number
  flip?: boolean
  brightness?: number
  label: string
  style?: CSSProperties
}) {
  const { Draw } = PICTURES[index]
  const w = 100 / zoom
  const x = Math.max(0, Math.min(100 - w, cx - w / 2))
  const y = Math.max(0, Math.min(100 - w, cy - w / 2))
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${w}`}
      role="img"
      aria-label={label}
      style={{ width: size, height: 'auto', display: 'block', borderRadius: 6, overflow: 'hidden', filter: brightness !== 1 ? `brightness(${brightness})` : undefined, ...style }}
    >
      <g transform={flip ? 'translate(100,0) scale(-1,1)' : undefined}>
        <Draw />
      </g>
    </svg>
  )
}
