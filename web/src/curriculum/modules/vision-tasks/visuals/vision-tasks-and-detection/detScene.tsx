import { tint } from './street'

/*
  The small scene used by the NMS stepper and the detector pipelines: two people standing close
  together, a car and a bush, in a 100 × 70 image (y down). Boxes are (x1, y1, x2, y2).
*/

export const DW = 100
export const DH = 70

export const GT: { id: string; cls: 'person' | 'car'; label: string; b: [number, number, number, number] }[] = [
  { id: 'A', cls: 'person', label: 'person A', b: [22, 14, 40, 60] },
  { id: 'B', cls: 'person', label: 'person B', b: [29, 15, 47, 61] },
  { id: 'car', cls: 'car', label: 'car', b: [58, 34, 94, 60] },
]

export function DetScene() {
  const skin = tint('var(--viz-2)', 45)
  const legs = tint('var(--viz-ink)', 70)
  const person = (cx: number, top: number, shirt: string) => (
    <g>
      <rect x={cx - 3.6} y={top + 30} width={7.2} height={16} rx={2} style={{ fill: legs }} />
      <rect x={cx - 5} y={top + 9} width={10} height={22} rx={3.5} style={{ fill: shirt, stroke: 'var(--surface)', strokeWidth: 0.6 }} />
      <circle cx={cx} cy={top + 5} r={5} style={{ fill: skin, stroke: 'var(--surface)', strokeWidth: 0.6 }} />
    </g>
  )
  return (
    <g>
      <rect x={0} y={0} width={100} height={70} style={{ fill: tint('var(--viz-1)', 12) }} />
      <rect x={0} y={58} width={100} height={12} style={{ fill: tint('var(--viz-3)', 30) }} />
      {/* bush */}
      <circle cx={7} cy={46} r={6} style={{ fill: tint('var(--viz-3)', 75) }} />
      <circle cx={11} cy={40} r={5.5} style={{ fill: tint('var(--viz-3)', 85) }} />
      <rect x={8} y={44} width={2} height={14} style={{ fill: tint('var(--viz-6)', 70) }} />
      {/* car */}
      <path d="M66,44 L71,36 L84,36 L89,44 Z" style={{ fill: tint('var(--viz-5)', 75) }} />
      <rect x={59} y={44} width={34} height={11} rx={3} style={{ fill: 'var(--viz-5)' }} />
      <circle cx={67} cy={55} r={4} style={{ fill: 'var(--viz-ink)' }} />
      <circle cx={86} cy={55} r={4} style={{ fill: 'var(--viz-ink)' }} />
      {person(31, 14, 'var(--viz-1)')}
      {person(38, 15, 'var(--viz-6)')}
    </g>
  )
}
