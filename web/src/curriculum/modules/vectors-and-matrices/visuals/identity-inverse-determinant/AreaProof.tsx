import { useContainerWidth } from '../../../../../kit'

/*
  Static picture for "why is the area ad − bc?". Columns (a, c) = (3, 1) and (b, d) = (1, 2) span a
  parallelogram inside an (a + b) × (c + d) rectangle. The six left-over pieces are two triangles of
  ½ac, two of ½bd and two rectangles of bc, so the parallelogram is what is left: ad − bc = 5.
*/

type Pt = [number, number]
const a = 3
const c = 1
const b = 1
const d = 2

const PIECES: { pts: Pt[]; label: string; color: string }[] = [
  { pts: [[0, 0], [a, 0], [a, c]], label: '½ac', color: 'var(--viz-3)' },
  { pts: [[b, d], [a + b, c + d], [b, c + d]], label: '½ac', color: 'var(--viz-3)' },
  { pts: [[a, c], [a + b, c], [a + b, c + d]], label: '½bd', color: 'var(--viz-5)' },
  { pts: [[0, 0], [b, d], [0, d]], label: '½bd', color: 'var(--viz-5)' },
  { pts: [[a, 0], [a + b, 0], [a + b, c], [a, c]], label: 'bc', color: 'var(--viz-4)' },
  { pts: [[0, d], [b, d], [b, c + d], [0, c + d]], label: 'bc', color: 'var(--viz-4)' },
]

export default function AreaProof() {
  const [ref, W] = useContainerWidth<HTMLDivElement>(360)
  const u = Math.max(48, Math.min(70, Math.floor((Math.min(W, 380) - 70) / (a + b))))
  const padL = 34
  const padT = 10
  const padB = 30
  const width = padL + (a + b) * u + 34
  const height = padT + (c + d) * u + padB
  const X = (x: number) => padL + x * u
  const Y = (y: number) => padT + (c + d - y) * u
  const poly = (pts: Pt[]) => pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')
  const centre = (pts: Pt[]): Pt => [pts.reduce((t, p) => t + p[0], 0) / pts.length, pts.reduce((t, p) => t + p[1], 0) / pts.length]
  const tick = (x1: number, y1: number, x2: number, y2: number, t: string, tx: number, ty: number, key: string) => (
    <g key={key}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: 'var(--ink-3)', strokeWidth: 1.2 }} />
      <text x={tx} y={ty} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 13, fontWeight: 700, fontStyle: 'italic' }}>
        {t}
      </text>
    </g>
  )
  const para: Pt[] = [[0, 0], [a, c], [a + b, c + d], [b, d]]
  const [pcx, pcy] = centre(para)
  return (
    <div ref={ref} style={{ width: '100%', display: 'grid', justifyItems: 'center', margin: '0.5rem 0' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} style={{ maxWidth: '100%', height: 'auto' }} role="img" aria-label="An (a + b) by (c + d) rectangle cut into the parallelogram, two triangles of area half a c, two of half b d and two rectangles of area b c">
        {PIECES.map((p, i) => {
          const [cx, cy] = centre(p.pts)
          return (
            <g key={i}>
              <polygon points={poly(p.pts)} style={{ fill: `color-mix(in srgb, ${p.color} 26%, var(--surface))`, stroke: p.color, strokeWidth: 1.5 }} />
              <text x={X(cx)} y={Y(cy)} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 800 }}>
                {p.label}
              </text>
            </g>
          )
        })}
        <polygon points={poly(para)} style={{ fill: 'color-mix(in srgb, var(--viz-1) 30%, var(--surface))', stroke: 'var(--viz-1)', strokeWidth: 2.5 }} />
        <text x={X(pcx)} y={Y(pcy)} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 14, fontWeight: 800 }}>
          ad − bc
        </text>
        {/* side lengths: a then b along the bottom, c then d up the right-hand side */}
        {tick(X(a), Y(0) + 4, X(a), Y(0) + 10, 'a', X(a / 2), Y(0) + 16, 'ta')}
        {tick(X(a + b), Y(0) + 4, X(a + b), Y(0) + 10, 'b', X(a + b / 2), Y(0) + 16, 'tb')}
        {tick(X(a + b) + 4, Y(c), X(a + b) + 10, Y(c), 'c', X(a + b) + 18, Y(c / 2), 'tc')}
        {tick(X(a + b) + 4, Y(c + d), X(a + b) + 10, Y(c + d), 'd', X(a + b) + 18, Y(c + d / 2), 'td')}
        <text x={X(0) - 8} y={Y(0)} dy="0.35em" textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }}>
          O
        </text>
      </svg>
    </div>
  )
}
