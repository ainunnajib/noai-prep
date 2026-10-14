import { useState, type ReactElement } from 'react'
import { Figure, useContainerWidth } from '../../../../../kit'

/*
  Schematic of the feature hierarchy in a trained CNN: edge and colour detectors (early layers)
  combine into textures and parts (middle layers), which combine into object detectors (late
  layers). Hover or click any unit to see what it is built from and what it helps build.
  The patterns are drawn by hand to show the idea, not taken from a real network.
*/

type Unit = { id: string; name: string; tier: 0 | 1 | 2; from: string[]; draw: (T: number) => ReactElement }

const ink = 'var(--viz-ink)'
const A = 'color-mix(in srgb, var(--viz-1) 70%, var(--surface))'

const UNITS: Unit[] = [
  // tier 0: edges and colours
  { id: 'v', name: 'vertical edge', tier: 0, from: [], draw: (T) => <rect x={0} y={0} width={T / 2} height={T} style={{ fill: A }} /> },
  { id: 'h', name: 'horizontal edge', tier: 0, from: [], draw: (T) => <rect x={0} y={0} width={T} height={T / 2} style={{ fill: A }} /> },
  { id: 'd1', name: 'diagonal edge ／', tier: 0, from: [], draw: (T) => <path d={`M${T},0L${T},${T}L0,${T}Z`} style={{ fill: A }} /> },
  { id: 'd2', name: 'diagonal edge ＼', tier: 0, from: [], draw: (T) => <path d={`M0,0L${T},${T}L0,${T}Z`} style={{ fill: A }} /> },
  { id: 'blob', name: 'small spot', tier: 0, from: [], draw: (T) => <circle cx={T / 2} cy={T / 2} r={T * 0.22} style={{ fill: 'var(--viz-ink)', opacity: 0.85 }} /> },
  {
    id: 'col',
    name: 'colour contrast',
    tier: 0,
    from: [],
    draw: (T) => (
      <g>
        <rect x={0} y={0} width={T} height={T} style={{ fill: 'color-mix(in srgb, var(--viz-2) 75%, var(--surface))' }} />
        <path d={`M0,0L${T},0L0,${T}Z`} style={{ fill: 'color-mix(in srgb, var(--viz-3) 75%, var(--surface))' }} />
      </g>
    ),
  },
  // tier 1: textures and parts
  { id: 'ring', name: 'ring (wheel, head outline)', tier: 1, from: ['v', 'h', 'd1', 'd2'], draw: (T) => <circle cx={T / 2} cy={T / 2} r={T * 0.3} style={{ fill: 'none', stroke: ink, strokeWidth: T * 0.1 }} /> },
  {
    id: 'eye',
    name: 'eye',
    tier: 1,
    from: ['blob', 'd1', 'd2'],
    draw: (T) => (
      <g>
        <path d={`M${T * 0.1},${T / 2}Q${T / 2},${T * 0.15} ${T * 0.9},${T / 2}Q${T / 2},${T * 0.85} ${T * 0.1},${T / 2}Z`} style={{ fill: 'none', stroke: ink, strokeWidth: 2.5 }} />
        <circle cx={T / 2} cy={T / 2} r={T * 0.13} style={{ fill: ink }} />
      </g>
    ),
  },
  {
    id: 'grid',
    name: 'grid (windows)',
    tier: 1,
    from: ['v', 'h'],
    draw: (T) => (
      <g style={{ fill: 'none', stroke: ink, strokeWidth: 2.5 }}>
        <rect x={T * 0.15} y={T * 0.15} width={T * 0.7} height={T * 0.7} />
        <line x1={T / 2} x2={T / 2} y1={T * 0.15} y2={T * 0.85} />
        <line y1={T / 2} y2={T / 2} x1={T * 0.15} x2={T * 0.85} />
      </g>
    ),
  },
  {
    id: 'fur',
    name: 'fur texture',
    tier: 1,
    from: ['d1', 'd2', 'col'],
    draw: (T) => (
      <g style={{ stroke: 'color-mix(in srgb, var(--viz-2) 80%, var(--viz-ink))', strokeWidth: 2, strokeLinecap: 'round' }}>
        {[0.15, 0.35, 0.55, 0.75].flatMap((y, i) =>
          [0.15, 0.4, 0.65].map((x, j) => <line key={`${i}${j}`} x1={T * (x + (i % 2) * 0.08)} y1={T * (y + 0.12)} x2={T * (x + 0.12 + (i % 2) * 0.08)} y2={T * y} />),
        )}
      </g>
    ),
  },
  { id: 'peak', name: 'corner / point (roof, ear)', tier: 1, from: ['d1', 'd2'], draw: (T) => <path d={`M${T * 0.12},${T * 0.8}L${T / 2},${T * 0.2}L${T * 0.88},${T * 0.8}`} style={{ fill: 'none', stroke: ink, strokeWidth: T * 0.09, strokeLinejoin: 'round' }} /> },
  { id: 'curve', name: 'curve (smile, car roof)', tier: 1, from: ['h', 'd1', 'd2'], draw: (T) => <path d={`M${T * 0.12},${T * 0.35}Q${T / 2},${T * 0.95} ${T * 0.88},${T * 0.35}`} style={{ fill: 'none', stroke: ink, strokeWidth: T * 0.09, strokeLinecap: 'round' }} /> },
  // tier 2: objects
  {
    id: 'car',
    name: 'car',
    tier: 2,
    from: ['ring', 'grid', 'curve'],
    draw: (T) => (
      <g style={{ stroke: ink, strokeWidth: 2 }}>
        <path d={`M${T * 0.08},${T * 0.68}L${T * 0.08},${T * 0.5}L${T * 0.28},${T * 0.48}Q${T * 0.45},${T * 0.22} ${T * 0.68},${T * 0.3}L${T * 0.8},${T * 0.48}L${T * 0.92},${T * 0.52}L${T * 0.92},${T * 0.68}Z`} style={{ fill: 'color-mix(in srgb, var(--viz-neg) 55%, var(--surface))' }} />
        <rect x={T * 0.38} y={T * 0.34} width={T * 0.13} height={T * 0.12} style={{ fill: 'var(--surface)' }} />
        <rect x={T * 0.53} y={T * 0.34} width={T * 0.13} height={T * 0.12} style={{ fill: 'var(--surface)' }} />
        <circle cx={T * 0.28} cy={T * 0.7} r={T * 0.1} style={{ fill: 'var(--surface)', strokeWidth: 3 }} />
        <circle cx={T * 0.72} cy={T * 0.7} r={T * 0.1} style={{ fill: 'var(--surface)', strokeWidth: 3 }} />
      </g>
    ),
  },
  {
    id: 'face',
    name: 'face',
    tier: 2,
    from: ['ring', 'eye', 'curve'],
    draw: (T) => (
      <g style={{ fill: 'none', stroke: ink, strokeWidth: 2 }}>
        <circle cx={T / 2} cy={T / 2} r={T * 0.38} style={{ fill: 'color-mix(in srgb, var(--viz-6) 35%, var(--surface))' }} />
        <circle cx={T * 0.36} cy={T * 0.42} r={T * 0.06} style={{ fill: ink }} />
        <circle cx={T * 0.64} cy={T * 0.42} r={T * 0.06} style={{ fill: ink }} />
        <path d={`M${T * 0.32},${T * 0.6}Q${T / 2},${T * 0.78} ${T * 0.68},${T * 0.6}`} />
      </g>
    ),
  },
  {
    id: 'cat',
    name: 'cat',
    tier: 2,
    from: ['eye', 'fur', 'peak'],
    draw: (T) => (
      <g style={{ stroke: ink, strokeWidth: 2 }}>
        <path d={`M${T * 0.18},${T * 0.45}L${T * 0.22},${T * 0.1}L${T * 0.42},${T * 0.3}L${T * 0.58},${T * 0.3}L${T * 0.78},${T * 0.1}L${T * 0.82},${T * 0.45}Q${T * 0.85},${T * 0.88} ${T / 2},${T * 0.88}Q${T * 0.15},${T * 0.88} ${T * 0.18},${T * 0.45}Z`} style={{ fill: 'color-mix(in srgb, var(--viz-2) 45%, var(--surface))' }} />
        <circle cx={T * 0.37} cy={T * 0.52} r={T * 0.05} style={{ fill: ink }} />
        <circle cx={T * 0.63} cy={T * 0.52} r={T * 0.05} style={{ fill: ink }} />
        <line x1={T * 0.05} y1={T * 0.66} x2={T * 0.35} y2={T * 0.68} style={{ strokeWidth: 1.2 }} />
        <line x1={T * 0.95} y1={T * 0.66} x2={T * 0.65} y2={T * 0.68} style={{ strokeWidth: 1.2 }} />
      </g>
    ),
  },
  {
    id: 'house',
    name: 'house',
    tier: 2,
    from: ['grid', 'peak'],
    draw: (T) => (
      <g style={{ stroke: ink, strokeWidth: 2 }}>
        <rect x={T * 0.2} y={T * 0.45} width={T * 0.6} height={T * 0.45} style={{ fill: 'color-mix(in srgb, var(--viz-3) 40%, var(--surface))' }} />
        <path d={`M${T * 0.1},${T * 0.47}L${T / 2},${T * 0.12}L${T * 0.9},${T * 0.47}Z`} style={{ fill: 'color-mix(in srgb, var(--viz-5) 45%, var(--surface))' }} />
        <rect x={T * 0.3} y={T * 0.55} width={T * 0.18} height={T * 0.16} style={{ fill: 'var(--surface)' }} />
        <rect x={T * 0.55} y={T * 0.6} width={T * 0.15} height={T * 0.3} style={{ fill: 'var(--surface)' }} />
      </g>
    ),
  },
]

const byId = Object.fromEntries(UNITS.map((u) => [u.id, u]))
const PLURAL: Record<string, string> = {
  v: 'vertical edges',
  h: 'horizontal edges',
  d1: 'diagonal edges (／)',
  d2: 'diagonal edges (＼)',
  blob: 'small spots',
  col: 'colour contrasts',
  ring: 'rings',
  eye: 'eyes',
  grid: 'grids',
  fur: 'fur textures',
  peak: 'pointed corners',
  curve: 'curves',
  car: 'cars',
  face: 'faces',
  cat: 'cats',
  house: 'houses',
}
const joinAnd = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)
const TIER_LABEL = ['Early layers: edges and colours', 'Middle layers: textures and parts', 'Late layers: objects']

function related(id: string): Set<string> {
  const out = new Set<string>([id])
  const down = (x: string) => byId[x].from.forEach((f) => (out.add(f), down(f)))
  const up = (x: string) => UNITS.filter((u) => u.from.includes(x)).forEach((u) => (out.add(u.id), up(u.id)))
  down(id)
  up(id)
  return out
}

export default function FeatureHierarchy() {
  const [sel, setSel] = useState('car')
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)
  const W = Math.min(width, 620)
  const gap = 10
  const T = Math.max(40, Math.min(64, Math.floor((W - 5 * gap - 8) / 6)))
  const labelH = 20
  const rowGap = 46
  const rowY = (tier: number) => labelH + (2 - tier) * (T + labelH + rowGap) // objects on top
  const svgH = rowY(0) + T + 6
  const pos: Record<string, [number, number]> = {}
  for (const tier of [0, 1, 2] as const) {
    const us = UNITS.filter((u) => u.tier === tier)
    const total = us.length * T + (us.length - 1) * gap
    us.forEach((u, i) => (pos[u.id] = [(W - total) / 2 + i * (T + gap), rowY(tier)]))
  }
  const rel = related(sel)
  const s = byId[sel]

  const describe = () => {
    const ups = UNITS.filter((u) => u.from.includes(sel)).map((u) => PLURAL[u.id])
    const parts = s.from.map((f) => PLURAL[f])
    if (s.tier === 0) return `this detector looks at a tiny patch of pixels. On its own it means little, but middle layers combine it into ${joinAnd(ups)}.`
    if (s.tier === 1) return `built from ${joinAnd(parts)}, and reused by the ${joinAnd(ups.map((u) => u.replace(/s$/, '')))} detectors.`
    return `this unit fires when ${joinAnd(parts)} appear together in the right arrangement. Each of those parts is itself built from edges at several angles.`
  }

  return (
    <Figure
      title="From edges to objects"
      caption={
        <>
          Hover or tap any unit. Orange lines show what it is built from (below) and what it helps to build (above). Notice how one simple part, such as a ring, is
          reused by several objects: that sharing is why the early and middle layers of a network trained on one task are useful for many others. (Hand-drawn patterns;
          visualisations of real trained networks, such as Zeiler and Fergus's in 2014, show the same progression.)
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${svgH}`} width={W} height={svgH} style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} role="img" aria-label={`Feature hierarchy; selected unit: ${s.name}`}>
          {UNITS.flatMap((u) =>
            u.from.map((f) => {
              const on = rel.has(u.id) && rel.has(f)
              const [x1, y1] = pos[f]
              const [x2, y2] = pos[u.id]
              return (
                <line
                  key={`${f}-${u.id}`}
                  x1={x1 + T / 2}
                  y1={y1}
                  x2={x2 + T / 2}
                  y2={y2 + T}
                  style={{ stroke: on ? 'var(--viz-2)' : 'var(--viz-muted)', strokeWidth: on ? 2.5 : 1, opacity: on ? 0.95 : 0.35 }}
                />
              )
            }),
          )}
          {[2, 1, 0].map((tier) => (
            <text key={tier} x={W / 2} y={rowY(tier) - 7} textAnchor="middle" className="plot-label" style={{ fontSize: 12.5, fontWeight: 700, fill: 'var(--ink-2)', strokeWidth: 5 }}>
              {TIER_LABEL[tier]}
            </text>
          ))}
          {UNITS.map((u) => {
            const [x, y] = pos[u.id]
            const isSel = u.id === sel
            const on = rel.has(u.id)
            return (
              <g
                key={u.id}
                transform={`translate(${x},${y})`}
                onClick={() => setSel(u.id)}
                onMouseEnter={() => setSel(u.id)}
                onFocus={() => setSel(u.id)}
                tabIndex={0}
                role="button"
                aria-label={u.name}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                <rect x={0} y={0} width={T} height={T} rx={8} style={{ fill: 'var(--surface-2)' }} />
                <svg x={0} y={0} width={T} height={T} viewBox={`0 0 ${T} ${T}`} style={{ overflow: 'hidden' }}>
                  <g style={{ opacity: on ? 1 : 0.4 }}>{u.draw(T)}</g>
                </svg>
                <rect x={0} y={0} width={T} height={T} rx={8} style={{ fill: 'none', stroke: isSel ? 'var(--viz-4)' : on ? 'var(--viz-2)' : 'var(--rule)', strokeWidth: isSel ? 3.5 : on ? 2.5 : 1 }} />
              </g>
            )
          })}
        </svg>
      </div>
      <div style={{ fontSize: 'var(--step--1)', color: 'var(--ink)', textAlign: 'center', maxWidth: 560, minHeight: '3em' }}>
        <b>{s.name[0].toUpperCase() + s.name.slice(1)}</b>: {describe()}
      </div>
    </Figure>
  )
}
