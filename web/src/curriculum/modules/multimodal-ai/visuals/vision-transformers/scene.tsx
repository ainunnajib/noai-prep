/*
  The "photo" used by this lesson's visuals: a cat in a garden, drawn in a 100 × 100 user-space
  square (y points down, like SVG). Colours come from theme tokens only, so it works in both themes.

  Besides the drawing, this file exposes the same geometry as point-membership tests, so a visual
  can ask "which object covers this patch?" (used for the illustrative attention patterns).
*/

export const viz = (k: number) => `var(--viz-${k})`
export const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, var(--surface))`

export type ObjectLabel = 'sky' | 'sun' | 'grass' | 'trunk' | 'leaves' | 'cat' | 'ball'
/** Colour family of each object: early attention heads tend to group patches by colour. */
export const COLOUR_GROUP: Record<ObjectLabel, string> = {
  sky: 'blue',
  sun: 'yellow',
  grass: 'green',
  leaves: 'green',
  trunk: 'brown',
  cat: 'orange',
  ball: 'pink',
}

// ---- geometry (shared by the drawing and the membership tests) ----
const GROUND_Y = 70
const SUN = { cx: 17, cy: 17, r: 9 }
const CROWN = { cx: 81, cy: 33, r: 14 }
const TRUNK = { x0: 78, x1: 84, y0: 42, y1: 74 }
const BODY = { cx: 46, cy: 66, rx: 17, ry: 12 }
const HEAD = { cx: 32, cy: 46, r: 10 }
const BALL = { cx: 69, cy: 86, r: 6 }
const EAR_L: [number, number][] = [
  [23.5, 42],
  [24.5, 30],
  [31, 37.5],
]
const EAR_R: [number, number][] = [
  [33, 37],
  [39.5, 29.5],
  [41, 42],
]
/** tail as a quadratic Bézier from (62,70) via (76,66) to (70,50) */
const TAIL = { p0: [62, 70], c: [77, 67], p1: [70, 50], w: 4.5 }

function inTri(px: number, py: number, t: [number, number][]) {
  const s = (a: [number, number], b: [number, number]) => (px - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (py - b[1])
  const d1 = s(t[0], t[1])
  const d2 = s(t[1], t[2])
  const d3 = s(t[2], t[0])
  const neg = d1 < 0 || d2 < 0 || d3 < 0
  const pos = d1 > 0 || d2 > 0 || d3 > 0
  return !(neg && pos)
}

const TAIL_PTS: [number, number][] = Array.from({ length: 25 }, (_, i) => {
  const t = i / 24
  const a = (1 - t) * (1 - t)
  const b = 2 * (1 - t) * t
  const c = t * t
  return [a * TAIL.p0[0] + b * TAIL.c[0] + c * TAIL.p1[0], a * TAIL.p0[1] + b * TAIL.c[1] + c * TAIL.p1[1]]
})

/** Which object is visible at point (x, y) of the 100 × 100 drawing (front-most wins). */
export function labelAt(x: number, y: number): ObjectLabel {
  const inCircle = (c: { cx: number; cy: number; r: number }) => (x - c.cx) ** 2 + (y - c.cy) ** 2 <= c.r * c.r
  if (inCircle(HEAD) || inTri(x, y, EAR_L) || inTri(x, y, EAR_R)) return 'cat'
  if (((x - BODY.cx) / BODY.rx) ** 2 + ((y - BODY.cy) / BODY.ry) ** 2 <= 1) return 'cat'
  if (TAIL_PTS.some(([tx, ty]) => (x - tx) ** 2 + (y - ty) ** 2 <= (TAIL.w / 2) ** 2)) return 'cat'
  if (inCircle(BALL)) return 'ball'
  if (inCircle(CROWN)) return 'leaves'
  if (x >= TRUNK.x0 && x <= TRUNK.x1 && y >= TRUNK.y0 && y <= TRUNK.y1) return 'trunk'
  if (inCircle(SUN)) return 'sun'
  return y >= GROUND_Y ? 'grass' : 'sky'
}

/**
 * Label each patch of an n × n grid by sampling it. A foreground object (cat, ball) wins the
 * patch if it covers at least 20% of it; otherwise the most common label wins.
 */
export function patchLabels(n: number, samples = 6): ObjectLabel[] {
  const out: ObjectLabel[] = []
  const size = 100 / n
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const count = new Map<ObjectLabel, number>()
      for (let i = 0; i < samples; i++) {
        for (let j = 0; j < samples; j++) {
          const l = labelAt(c * size + ((j + 0.5) * size) / samples, r * size + ((i + 0.5) * size) / samples)
          count.set(l, (count.get(l) ?? 0) + 1)
        }
      }
      const total = samples * samples
      let best: ObjectLabel = 'sky'
      let bestN = -1
      for (const [l, k] of count) if (k > bestN) [best, bestN] = [l, k]
      for (const fg of ['cat', 'ball'] as ObjectLabel[]) if ((count.get(fg) ?? 0) / total >= 0.2) best = fg
      out.push(best)
    }
  }
  return out
}

/** Fraction of a patch covered by each object (used as toy patch "content" features). */
export function patchCoverage(n: number, r: number, c: number, samples = 8): Record<ObjectLabel, number> {
  const res: Record<ObjectLabel, number> = { sky: 0, sun: 0, grass: 0, trunk: 0, leaves: 0, cat: 0, ball: 0 }
  const size = 100 / n
  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < samples; j++) {
      res[labelAt(c * size + ((j + 0.5) * size) / samples, r * size + ((i + 0.5) * size) / samples)] += 1 / (samples * samples)
    }
  }
  return res
}

/** The drawing itself, in 100 × 100 user units. */
export function GardenScene() {
  const ink = 'var(--viz-ink)'
  const t = TAIL
  return (
    <g>
      <rect x={0} y={0} width={100} height={100} style={{ fill: tint(viz(1), 16) }} />
      <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r} style={{ fill: 'var(--highlight)', stroke: viz(6), strokeWidth: 1.2 }} />
      <rect x={0} y={GROUND_Y} width={100} height={100 - GROUND_Y} style={{ fill: tint(viz(3), 42) }} />
      {/* a few blades of grass */}
      {[8, 15, 52, 88, 94].map((x) => (
        <path key={x} d={`M${x},${GROUND_Y + 9} l1.5,-5 l1.5,5`} style={{ fill: 'none', stroke: viz(3), strokeWidth: 0.9 }} />
      ))}
      <rect x={TRUNK.x0} y={TRUNK.y0} width={TRUNK.x1 - TRUNK.x0} height={TRUNK.y1 - TRUNK.y0} style={{ fill: tint(viz(6), 80) }} />
      <circle cx={CROWN.cx} cy={CROWN.cy} r={CROWN.r} style={{ fill: viz(3) }} />
      <circle cx={BALL.cx} cy={BALL.cy} r={BALL.r} style={{ fill: viz(4) }} />
      <path d={`M${BALL.cx - BALL.r},${BALL.cy} Q${BALL.cx},${BALL.cy - 3} ${BALL.cx + BALL.r},${BALL.cy}`} style={{ fill: 'none', stroke: 'var(--surface)', strokeWidth: 1 }} />
      {/* cat */}
      <path d={`M${t.p0[0]},${t.p0[1]} Q${t.c[0]},${t.c[1]} ${t.p1[0]},${t.p1[1]}`} style={{ fill: 'none', stroke: viz(2), strokeWidth: t.w, strokeLinecap: 'round' }} />
      <ellipse cx={BODY.cx} cy={BODY.cy} rx={BODY.rx} ry={BODY.ry} style={{ fill: viz(2) }} />
      <path d={`M${EAR_L.map((p) => p.join(',')).join(' L')} Z M${EAR_R.map((p) => p.join(',')).join(' L')} Z`} style={{ fill: viz(2) }} />
      <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} style={{ fill: viz(2) }} />
      <circle cx={28.4} cy={44.5} r={1.5} style={{ fill: ink }} />
      <circle cx={35.6} cy={44.5} r={1.5} style={{ fill: ink }} />
      <path d="M30.6,48.6 L33.4,48.6 L32,50.2 Z" style={{ fill: ink }} />
      <path d="M22,49 L28,49.5 M22,52 L28,51 M42,49 L36,49.5 M42,52 L36,51" style={{ fill: 'none', stroke: ink, strokeWidth: 0.5, opacity: 0.7 }} />
    </g>
  )
}
