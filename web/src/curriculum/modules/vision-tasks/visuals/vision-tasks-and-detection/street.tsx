import type { ReactNode } from 'react'

/*
  A procedurally drawn street scene (160 × 100 units, y down) shared by this lesson's visuals.
  Every object is a list of simple shapes, so the same geometry gives the drawing, the bounding
  boxes and a per-pixel label map (by testing which shape covers each cell centre).
*/

export const SW = 160
export const SH = 100
export const CELL = 2 // one label-map "pixel" = 2 × 2 units, so the map is 80 × 50
export const COLS = SW / CELL
export const ROWS = SH / CELL

export type Shape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx?: number }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'poly'; pts: [number, number][] }

export type ClassName = 'sky' | 'building' | 'road' | 'car' | 'person'
export const STUFF: ClassName[] = ['sky', 'building', 'road']
export const THINGS: ClassName[] = ['car', 'person']

export interface SceneObject {
  id: string
  cls: ClassName
  /** instance number within its class (things only) */
  inst?: number
  shapes: Shape[]
  /** photo colour for each shape (same order) */
  paint: string[]
  /** example detector confidence (things only) */
  score?: number
}

export const tint = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, var(--surface))`
const SKIN = tint('var(--viz-2)', 45)
const LEGS = tint('var(--viz-ink)', 70)

const person = (inst: number, cx: number, top: number, shirt: string, score: number): SceneObject => ({
  id: `person${inst}`,
  cls: 'person',
  inst,
  score,
  shapes: [
    { kind: 'rect', x: cx - 3, y: top + 26, w: 6, h: 12, rx: 1.5 },
    { kind: 'rect', x: cx - 4, y: top + 8, w: 8, h: 19, rx: 3 },
    { kind: 'circle', cx, cy: top + 4, r: 4 },
  ],
  paint: [LEGS, shirt, SKIN],
})

const car = (inst: number, x: number, y: number, w: number, color: string, score: number): SceneObject => {
  const s = w / 46
  return {
    id: `car${inst}`,
    cls: 'car',
    inst,
    score,
    shapes: [
      {
        kind: 'poly',
        pts: [
          [x + 8 * s, y],
          [x + 13 * s, y - 9 * s],
          [x + 32 * s, y - 9 * s],
          [x + 38 * s, y],
        ],
      },
      { kind: 'rect', x, y, w, h: 14 * s, rx: 3 },
      { kind: 'circle', cx: x + 10 * s, cy: y + 14 * s, r: 5 * s },
      { kind: 'circle', cx: x + 36 * s, cy: y + 14 * s, r: 5 * s },
    ],
    paint: [tint(color, 80), color, 'var(--viz-ink)', 'var(--viz-ink)'],
  }
}

/** Back to front: later objects are drawn on top and win the label of shared pixels. */
export const OBJECTS: SceneObject[] = [
  { id: 'sky', cls: 'sky', shapes: [{ kind: 'rect', x: 0, y: 0, w: 160, h: 58 }], paint: [tint('var(--viz-1)', 16)] },
  {
    id: 'building',
    cls: 'building',
    shapes: [
      { kind: 'rect', x: 4, y: 10, w: 42, h: 48 },
      { kind: 'rect', x: 118, y: 22, w: 38, h: 36 },
    ],
    paint: [tint('var(--viz-6)', 38), tint('var(--viz-6)', 30)],
  },
  { id: 'road', cls: 'road', shapes: [{ kind: 'rect', x: 0, y: 58, w: 160, h: 42 }], paint: [tint('var(--viz-muted)', 38)] },
  car(1, 14, 64, 46, 'var(--viz-5)', 0.96),
  car(2, 50, 70, 50, 'var(--viz-3)', 0.91),
  person(1, 110, 42, 'var(--viz-4)', 0.88),
  person(2, 117, 44, 'var(--viz-1)', 0.83),
  person(3, 140, 46, 'var(--viz-6)', 0.9),
]

function inShape(s: Shape, x: number, y: number) {
  if (s.kind === 'rect') return x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h
  if (s.kind === 'circle') return (x - s.cx) ** 2 + (y - s.cy) ** 2 <= s.r * s.r
  // convex polygon (clockwise or anticlockwise)
  let sign = 0
  for (let i = 0; i < s.pts.length; i++) {
    const [ax, ay] = s.pts[i]
    const [bx, by] = s.pts[(i + 1) % s.pts.length]
    const c = (bx - ax) * (y - ay) - (by - ay) * (x - ax)
    if (c !== 0) {
      if (sign === 0) sign = Math.sign(c)
      else if (Math.sign(c) !== sign) return false
    }
  }
  return true
}

/** Index into OBJECTS of the front-most object at (x, y). */
export function objectAt(x: number, y: number): number {
  for (let k = OBJECTS.length - 1; k >= 0; k--) if (OBJECTS[k].shapes.some((s) => inShape(s, x, y))) return k
  return 0
}

/** The ROWS × COLS label map: each cell holds the index of the object covering its centre. */
export const LABEL_MAP: number[][] = Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => objectAt((c + 0.5) * CELL, (r + 0.5) * CELL)))

function shapeBox(s: Shape): [number, number, number, number] {
  if (s.kind === 'rect') return [s.x, s.y, s.x + s.w, s.y + s.h]
  if (s.kind === 'circle') return [s.cx - s.r, s.cy - s.r, s.cx + s.r, s.cy + s.r]
  const xs = s.pts.map((p) => p[0])
  const ys = s.pts.map((p) => p[1])
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
}

/** Tight bounding box (x1, y1, x2, y2) of an object. */
export function boxOf(o: SceneObject): [number, number, number, number] {
  const bs = o.shapes.map(shapeBox)
  return [Math.min(...bs.map((b) => b[0])), Math.min(...bs.map((b) => b[1])), Math.max(...bs.map((b) => b[2])), Math.max(...bs.map((b) => b[3]))]
}

export function ShapeEl({ s, fill, stroke }: { s: Shape; fill: string; stroke?: string }) {
  const st = { fill, stroke, strokeWidth: stroke ? 0.8 : undefined }
  if (s.kind === 'rect') return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} style={st} />
  if (s.kind === 'circle') return <circle cx={s.cx} cy={s.cy} r={s.r} style={st} />
  return <path d={`M${s.pts.map((p) => p.join(',')).join('L')}Z`} style={st} />
}

/** The "photo": the scene drawn in its natural colours, with a few details that are not part of any label. */
export function StreetPhoto() {
  const details: ReactNode[] = []
  // windows on the two blocks
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 5; c++) details.push(<rect key={`wa${r}-${c}`} x={8 + c * 8} y={14 + r * 7} width={4} height={3.5} style={{ fill: 'var(--surface-3)' }} />)
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) details.push(<rect key={`wb${r}-${c}`} x={122 + c * 9} y={26 + r * 7.5} width={4.5} height={3.5} style={{ fill: 'var(--surface-3)' }} />)
  return (
    <g>
      {OBJECTS.slice(0, 3).map((o) => o.shapes.map((s, i) => <ShapeEl key={`${o.id}${i}`} s={s} fill={o.paint[i]} />))}
      {details}
      <circle cx={84} cy={16} r={7} style={{ fill: 'var(--viz-6)' }} />
      <path d="M0,94 L160,94" style={{ stroke: 'var(--surface)', strokeWidth: 1.2, strokeDasharray: '8 6' }} />
      {OBJECTS.slice(3).map((o) => o.shapes.map((s, i) => <ShapeEl key={`${o.id}${i}`} s={s} fill={o.paint[i]} />))}
    </g>
  )
}
