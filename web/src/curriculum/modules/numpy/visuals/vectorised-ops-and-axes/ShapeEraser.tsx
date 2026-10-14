import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Segmented, Toggle } from '../../../../../kit'
import { mono } from './Cells'

/*
  The shape rule for reductions on a 3-D array: imgs has shape (100, 28, 28), i.e. 100 greyscale
  images of 28 x 28 pixels. Pick the axis (or axes) to average over; those entries are erased from
  the shape (or become 1 with keepdims=True). Negative axes count from the end.
*/

type AxisChoice = '0' | '1' | '2' | '-1' | '(1, 2)' | 'none'

const DIMS = [
  { size: 100, name: 'images', neg: -3 },
  { size: 28, name: 'rows', neg: -2 },
  { size: 28, name: 'columns', neg: -1 },
]

const REMOVED: Record<AxisChoice, number[]> = {
  '0': [0],
  '1': [1],
  '2': [2],
  '-1': [2],
  '(1, 2)': [1, 2],
  none: [0, 1, 2],
}

const MEANING: Record<AxisChoice, string> = {
  '0': 'The average image: every pixel position averaged over all 100 images (it looks like a blurry "average digit").',
  '1': 'For each image, every pixel column averaged down its 28 rows.',
  '2': 'For each image, every pixel row averaged across its 28 columns.',
  '-1': 'axis=-1 means "the last axis", which here is axis 2: each pixel row averaged across its columns.',
  '(1, 2)': "One number per image: that image's average brightness. Naming two axes erases both.",
  none: 'One number for the whole dataset: the average brightness of all 78,400 pixels.',
}

/** A stack of images with arrows along the axes being averaged. */
function Stack({ removed }: { removed: number[] }) {
  const s = 92
  const off = 9
  const n = 5
  const x0 = 44
  const y0 = 34
  const front = { x: x0, y: y0 + (n - 1) * off }
  const on = (k: number) => removed.includes(k)
  const col = 'var(--viz-neg)'
  const arrow = (x1: number, y1: number, x2: number, y2: number, active: boolean, key: string) => {
    const len = Math.hypot(x2 - x1, y2 - y1)
    const ux = (x2 - x1) / len
    const uy = (y2 - y1) / len
    const h = 8
    const bx = x2 - ux * h
    const by = y2 - uy * h
    const c = active ? col : 'var(--viz-muted)'
    return (
      <g key={key} style={{ opacity: active ? 1 : 0.45, transition: 'opacity 0.25s ease' }}>
        <line x1={x1} y1={y1} x2={bx} y2={by} style={{ stroke: c, strokeWidth: active ? 2.6 : 1.6 }} strokeLinecap="round" />
        <path d={`M${x2},${y2}L${bx - uy * 4.5},${by + ux * 4.5}L${bx + uy * 4.5},${by - ux * 4.5}Z`} style={{ fill: c }} />
      </g>
    )
  }
  const lab = (k: number) => ({ fill: on(k) ? col : 'var(--ink-3)', fontSize: 11.5, fontWeight: 700 })
  const br = { x: front.x + s + 6, y: front.y + s + 6 }
  return (
    <svg viewBox="0 0 232 200" width={232} height={200} role="img" aria-label="A stack of 100 images, each 28 by 28 pixels, with arrows for the axes being averaged" style={{ maxWidth: '100%', height: 'auto' }}>
      {Array.from({ length: n }, (_, k) => {
        const x = x0 + (n - 1 - k) * off
        const y = y0 + k * off
        return (
          <rect
            key={k}
            x={x}
            y={y}
            width={s}
            height={s}
            rx={4}
            style={{ fill: 'color-mix(in srgb, var(--viz-1) 10%, var(--surface))', stroke: on(0) ? col : 'var(--viz-axis)', strokeWidth: 1.2 }}
          />
        )
      })}
      {/* pixel grid on the front image */}
      {Array.from({ length: 6 }, (_, k) => (
        <g key={`g${k}`} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }}>
          <line x1={front.x + ((k + 1) * s) / 7} x2={front.x + ((k + 1) * s) / 7} y1={front.y} y2={front.y + s} />
          <line y1={front.y + ((k + 1) * s) / 7} y2={front.y + ((k + 1) * s) / 7} x1={front.x} x2={front.x + s} />
        </g>
      ))}
      <rect x={front.x} y={front.y} width={s} height={s} rx={4} style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 1.4 }} />
      {/* axis 0: through the stack, from the front image to the back one */}
      {arrow(br.x, br.y, br.x + 36, br.y - 36, on(0), 'a0')}
      <text x={br.x + 40} y={br.y - 30} style={lab(0)}>
        axis 0
      </text>
      {/* axis 1: down the rows */}
      {arrow(front.x - 12, front.y + 4, front.x - 12, front.y + s - 2, on(1), 'a1')}
      <text x={front.x - 12} y={front.y - 8} textAnchor="middle" style={lab(1)}>
        axis 1
      </text>
      {/* axis 2: across the columns */}
      {arrow(front.x + 4, front.y + s + 16, front.x + s - 2, front.y + s + 16, on(2), 'a2')}
      <text x={front.x + s / 2} y={front.y + s + 34} textAnchor="middle" style={lab(2)}>
        axis 2
      </text>
    </svg>
  )
}

export default function ShapeEraser() {
  const [ax, setAx] = useState<AxisChoice>('0')
  const [keep, setKeep] = useState(false)
  const removed = REMOVED[ax]
  const outShape = DIMS.flatMap((d, k) => (removed.includes(k) ? (keep ? [1] : []) : [d.size]))
  const shapeStr = outShape.length === 0 ? '()' : outShape.length === 1 ? `(${outShape[0]},)` : `(${outShape.join(', ')})`
  const call = ax === 'none' ? `imgs.mean(${keep ? 'keepdims=True' : ''})` : `imgs.mean(axis=${ax}${keep ? ', keepdims=True' : ''})`

  const chip = (k: number): CSSProperties => {
    const gone = removed.includes(k)
    return {
      ...mono,
      display: 'grid',
      justifyItems: 'center',
      gap: 2,
      padding: '0.35rem 0.5rem',
      minWidth: 70,
      borderRadius: 10,
      border: `2px ${gone ? 'dashed' : 'solid'} ${gone ? 'var(--viz-neg)' : 'var(--viz-1)'}`,
      background: gone ? 'color-mix(in srgb, var(--viz-neg) 10%, var(--surface))' : 'color-mix(in srgb, var(--viz-1) 10%, var(--surface))',
      transition: 'all 0.25s ease',
    }
  }

  return (
    <Figure
      title="Same rule in 3-D: cross out the axes you reduce"
      caption={
        <>
          <code>imgs</code> holds 100 greyscale images of 28 × 28 pixels, so its shape is (100, 28, 28). Pick the axis to average over and watch that entry
          get crossed out of the shape. Negative numbers count from the end, so <code>axis=-1</code> is always the last axis. Turn on{' '}
          <code>keepdims</code> and the crossed-out entries stay as 1s instead of vanishing.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.75rem 1.5rem', width: '100%' }}>
        <Stack removed={removed} />
        <div style={{ display: 'grid', gap: '0.6rem', justifyItems: 'center', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }} aria-label="shape of imgs, one chip per axis">
            {DIMS.map((d, k) => {
              const gone = removed.includes(k)
              return (
                <div key={k} style={chip(k)}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    <span style={{ color: gone ? 'var(--viz-neg)' : 'var(--ink)', textDecoration: gone ? 'line-through' : 'none' }}>{d.size}</span>
                    {gone && keep && <span style={{ color: 'var(--viz-3)' }}> → 1</span>}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-2)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{d.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink-3)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                    axis {k} or {d.neg}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ ...mono, fontSize: '0.9rem', color: 'var(--ink-2)', textAlign: 'center' }}>{call}</div>
          <div style={{ ...mono, fontSize: '1.15rem', fontWeight: 700, textAlign: 'center' }} aria-live="polite">
            (100, 28, 28) → <span style={{ color: 'var(--viz-3)' }}>{shapeStr}</span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: '0.92rem', color: 'var(--ink-2)', textAlign: 'center', maxWidth: 540 }}>{MEANING[ax]}</div>
      <Controls>
        <Segmented
          label="axis="
          value={ax}
          onChange={setAx}
          options={(['0', '1', '2', '-1', '(1, 2)', 'none'] as AxisChoice[]).map((v) => ({ value: v, label: v === 'none' ? 'no axis' : v }))}
        />
        <Toggle label="keepdims=True" checked={keep} onChange={setKeep} />
      </Controls>
    </Figure>
  )
}
