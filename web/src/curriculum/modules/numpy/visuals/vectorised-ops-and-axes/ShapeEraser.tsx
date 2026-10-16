import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Toggle, mulberry32 } from '../../../../../kit'
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
  '0': 'The average image: every pixel position averaged over all 100 images, which looks like a blurry "average digit".',
  '1': 'For each image, every pixel column averaged down its 28 rows.',
  '2': 'For each image, every pixel row averaged across its 28 columns.',
  '-1': 'axis=-1 means "the last axis", which here is axis 2: each pixel row averaged across its columns.',
  '(1, 2)': "One number per image: that image's average brightness. Naming two axes erases both.",
  none: 'One number for the whole dataset: the average brightness of all 78,400 pixels.',
}

/*
  100 small synthetic "digits" (a 0, a 1 or a 7, each shifted and thickened at random by a fixed
  seed), so that the preview can SHOW what each reduction gives: the average image, one strip of 28
  numbers per image, or one brightness per image.
*/
const N_IMG = 100
const P = 28
const IMGS: Float64Array[] = (() => {
  const rand = mulberry32(7)
  const out: Float64Array[] = []
  for (let k = 0; k < N_IMG; k++) {
    const img = new Float64Array(P * P)
    const kind = k % 3
    const cx = 13.5 + (rand() - 0.5) * 4
    const cy = 13.5 + (rand() - 0.5) * 4
    const s = 1.1 + rand() * 0.6
    const R = 6 + rand() * 2
    const g = (d: number) => Math.exp(-(d * d) / (2 * s * s))
    for (let y = 0; y < P; y++)
      for (let x = 0; x < P; x++) {
        let v: number
        if (kind === 0) v = g(Math.hypot((x - cx) * 1.25, y - cy) - R) // a "0": an oval ring
        else if (kind === 1) v = Math.abs(y - cy) < 9 ? g(x - cx) : 0 // a "1": a vertical stroke
        else {
          // a "7": a top bar and a slanted stroke
          const bar = Math.abs(x - cx) < 6 ? g(y - (cy - 8)) : 0
          const [ax, ay, bx, by] = [cx + 6, cy - 8, cx - 3, cy + 9]
          const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)))
          v = Math.max(bar, g(Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay)))))
        }
        img[y * P + x] = v
      }
    out.push(img)
  }
  return out
})()
const MEAN_IMG = Array.from({ length: P * P }, (_, p) => IMGS.reduce((acc, im) => acc + im[p], 0) / N_IMG)
const COL_MEANS = IMGS.slice(0, 8).map((im) => Array.from({ length: P }, (_, x) => im.reduce((acc, v, p) => acc + (p % P === x ? v : 0), 0) / P))
const ROW_MEANS = IMGS.slice(0, 8).map((im) => Array.from({ length: P }, (_, y) => im.slice(y * P, (y + 1) * P).reduce((acc, v) => acc + v, 0) / P))
const IMG_MEANS = IMGS.map((im) => im.reduce((acc, v) => acc + v, 0) / (P * P))
const ALL_MEAN = IMG_MEANS.reduce((acc, v) => acc + v, 0) / N_IMG

/** A grey-level heat map drawn from a flat list of values (row by row). */
function Heat({ values, cols, cell, cellH = cell, gap = 0, label }: { values: number[]; cols: number; cell: number; cellH?: number; gap?: number; label: string }) {
  const max = Math.max(...values, 1e-9)
  const rows = values.length / cols
  return (
    <svg viewBox={`0 0 ${cols * cell} ${rows * cellH}`} width={cols * cell} height={rows * cellH} role="img" aria-label={label} style={{ display: 'block', maxWidth: '100%', height: 'auto', background: 'var(--surface)', border: '1px solid var(--rule)' }}>
      {values.map((v, i) => (v / max < 0.03 ? null : <rect key={i} x={(i % cols) * cell} y={Math.floor(i / cols) * cellH + gap / 2} width={cell} height={cellH - gap} style={{ fill: 'var(--ink)', fillOpacity: v / max }} />))}
      {gap > 0 && Array.from({ length: rows - 1 }, (_, r) => <line key={`g${r}`} x1={0} x2={cols * cell} y1={(r + 1) * cellH} y2={(r + 1) * cellH} style={{ stroke: 'var(--rule)', strokeWidth: 1 }} />)}
    </svg>
  )
}

/** What the result of the chosen reduction looks like. */
function Preview({ ax }: { ax: AxisChoice }) {
  const note = { fontSize: '0.78rem', color: 'var(--ink-3)', textAlign: 'center' as const, maxWidth: 230 }
  let body: ReactNode
  let text: string
  if (ax === '0') {
    body = <Heat values={MEAN_IMG} cols={P} cell={4} label="The average of all 100 images: a blurry blend of a 0, a 1 and a 7" />
    text = 'the result, drawn as an image: a blurry "average digit"'
  } else if (ax === '1') {
    body = <Heat values={COL_MEANS.flat()} cols={P} cell={4} cellH={10} gap={3} label="Eight images, each squashed down its rows into 28 column averages" />
    text = 'first 8 of the 100 rows: each image is now 28 column averages (a "1" gives one bright spot)'
  } else if (ax === '2' || ax === '-1') {
    body = <Heat values={ROW_MEANS.flat()} cols={P} cell={4} cellH={10} gap={3} label="Eight images, each squashed across its columns into 28 row averages" />
    text = 'first 8 of the 100 rows: each image is now 28 row averages, top to bottom'
  } else if (ax === '(1, 2)') {
    const max = Math.max(...IMG_MEANS.slice(0, 12))
    body = (
      <svg viewBox="0 0 120 64" width={120} height={64} role="img" aria-label="Average brightness of the first 12 images, one bar each" style={{ display: 'block' }}>
        {IMG_MEANS.slice(0, 12).map((v, i) => (
          <rect key={i} x={i * 10 + 1} y={62 - (v / max) * 58} width={8} height={(v / max) * 58} rx={1.5} style={{ fill: 'var(--viz-3)' }} />
        ))}
        <line x1={0} x2={120} y1={62.5} y2={62.5} style={{ stroke: 'var(--viz-axis)' }} />
      </svg>
    )
    text = 'first 12 of the 100 numbers: one average brightness per image'
  } else {
    body = <div style={{ ...mono, fontSize: '1.3rem', fontWeight: 700, color: 'var(--viz-3)' }}>{ALL_MEAN.toFixed(4)}</div>
    text = 'one number: the average of all 78,400 pixels'
  }
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
      {body}
      <div style={note}>{text}</div>
    </div>
  )
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
          get crossed out of the shape; the small picture shows what the result looks like. Negative numbers count from the end, so <code>axis=-1</code> is always the last axis. Turn on{' '}
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
          <Preview ax={ax} />
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
