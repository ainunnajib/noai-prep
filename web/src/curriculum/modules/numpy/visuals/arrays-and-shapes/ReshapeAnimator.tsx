import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Segmented, Toggle, useContainerWidth } from '../../../../../kit'
import { npPrint, nest, shapeStr, charsThatFit } from './npFormat'
import css from './reshape.module.css'

/*
  The twelve numbers of np.arange(12) flow, in reading order, into whatever shape you choose.
  The order never changes; only the grouping does. Bad shapes raise the same error NumPy gives.
*/

const N = 12
const DATA = Array.from({ length: N }, (_, i) => i)
const TARGETS: { label: string; dims: number[] }[] = [
  { label: '(12,)', dims: [12] },
  { label: '(3, 4)', dims: [3, 4] },
  { label: '(4, 3)', dims: [4, 3] },
  { label: '(2, 6)', dims: [2, 6] },
  { label: '(3, -1)', dims: [3, -1] },
  { label: '(-1, 6)', dims: [-1, 6] },
  { label: '(2, 2, 3)', dims: [2, 2, 3] },
  { label: '(2, -1, 3)', dims: [2, -1, 3] },
  { label: '(5, -1)', dims: [5, -1] },
  { label: '(3, 5)', dims: [3, 5] },
  { label: '(-1, -1)', dims: [-1, -1] },
]

function resolve(dims: number[]): { shape?: number[]; error?: string; note?: string } {
  const unknown = dims.filter((d) => d === -1).length
  if (unknown > 1) return { error: 'ValueError: can only specify one unknown dimension' }
  const known = dims.filter((d) => d !== -1).reduce((a, b) => a * b, 1)
  const npShape = `(${dims.map((d) => (d === -1 ? 'newaxis' : String(d))).join(',')}${dims.length === 1 ? ',' : ''})`
  if (unknown === 1) {
    if (N % known !== 0) return { error: `ValueError: cannot reshape array of size ${N} into shape ${npShape}` }
    const fill = N / known
    const shape = dims.map((d) => (d === -1 ? fill : d))
    const others = dims.filter((d) => d !== -1)
    return { shape, note: `−1 means "work it out": ${N} ÷ ${others.length > 1 ? `(${others.join(' × ')})` : others[0]} = ${fill}` }
  }
  if (known !== N) return { error: `ValueError: cannot reshape array of size ${N} into shape ${npShape}` }
  return { shape: dims }
}

interface Pos {
  x: number
  y: number
  s: number
}

function layout(shape: number[], W: number): { pos: Pos[]; H: number; labels: { x: number; y: number; text: string }[] } {
  const gap = 4
  const pos: Pos[] = []
  const labels: { x: number; y: number; text: string }[] = []
  if (shape.length === 1) {
    const s = Math.min(42, Math.floor((W - (N - 1) * gap) / N))
    const total = N * s + (N - 1) * gap
    const x0 = (W - total) / 2
    for (let k = 0; k < N; k++) pos.push({ x: x0 + k * (s + gap), y: 4, s })
    return { pos, H: s + 8, labels }
  }
  if (shape.length === 2) {
    const [r, c] = shape
    const s = Math.min(44, Math.floor((W - (c - 1) * gap) / c))
    const total = c * s + (c - 1) * gap
    const x0 = (W - total) / 2
    for (let k = 0; k < N; k++) pos.push({ x: x0 + (k % c) * (s + gap), y: 4 + Math.floor(k / c) * (s + gap), s })
    return { pos, H: r * (s + gap) + 8, labels }
  }
  const [a, r, c] = shape
  const bgap = 22
  // side by side if it fits with decent cells, otherwise stacked
  let s = Math.min(40, Math.floor((W - (a - 1) * bgap - a * (c - 1) * gap) / (a * c)))
  const side = s >= 26
  if (!side) s = Math.min(40, Math.floor((W - (c - 1) * gap) / c))
  const bw = c * s + (c - 1) * gap
  const bh = r * s + (r - 1) * gap
  const totalW = side ? a * bw + (a - 1) * bgap : bw
  const x0 = (W - totalW) / 2
  for (let k = 0; k < N; k++) {
    const b = Math.floor(k / (r * c))
    const rem = k % (r * c)
    const bx = side ? x0 + b * (bw + bgap) : x0
    const by = side ? 20 : 20 + b * (bh + 26)
    pos.push({ x: bx + (rem % c) * (s + gap), y: by + Math.floor(rem / c) * (s + gap), s })
  }
  for (let b = 0; b < a; b++) {
    const bx = side ? x0 + b * (bw + bgap) : x0
    const by = side ? 20 : 20 + b * (bh + 26)
    labels.push({ x: bx, y: by - 18, text: `b[${b}]` })
  }
  return { pos, H: (side ? 20 + bh : 20 + a * (bh + 26) - 26) + 6, labels }
}

const pre: CSSProperties = {
  margin: 0,
  padding: '0.55rem 0.75rem',
  background: 'var(--surface-2)',
  borderRadius: 8,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  lineHeight: 1.45,
  color: 'var(--ink)',
  whiteSpace: 'pre',
  overflowX: 'auto',
  width: '100%',
  boxSizing: 'border-box',
}

export default function ReshapeAnimator() {
  const [target, setTarget] = useState(1)
  const [shape, setShape] = useState<number[]>([3, 4])
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [showOrder, setShowOrder] = useState(true)
  const [moved, setMoved] = useState(false)
  const [ref, w] = useContainerWidth<HTMLDivElement>(520)
  const W = Math.max(280, Math.min(620, w))
  const { pos, H, labels } = layout(shape, W)

  const choose = (i: number) => {
    setTarget(i)
    setMoved(true)
    const r = resolve(TARGETS[i].dims)
    if (r.error) {
      setError(r.error)
      setNote(null)
      setShakeKey((k) => k + 1)
    } else {
      setError(null)
      setNote(r.note ?? null)
      setShape(r.shape!)
    }
  }

  const t = TARGETS[target]
  const arg = t.dims.length === 1 ? String(t.dims[0]) : t.dims.join(', ')
  // one dashed arrow along the bottom of each row, in reading order
  const rowRuns: { x1: number; x2: number; y: number; end: number }[] = []
  pos.forEach((p) => {
    const last = rowRuns[rowRuns.length - 1]
    const y = p.y + p.s * 0.84
    if (last && Math.abs(last.y - y) < 0.5 && p.x > last.x2) {
      last.x2 = p.x + p.s * 0.62
      last.end = p.x + p.s
    } else rowRuns.push({ x1: p.x + p.s * 0.3, x2: p.x + p.s * 0.62, y, end: p.x + p.s })
  })

  return (
    <Figure
      title="Reshape: same numbers, new grouping"
      caption={
        <>
          Choose a target shape. The twelve numbers of <code>np.arange(12)</code> flow into place one after another in{' '}
          <b>reading order</b> (along each row, then down to the next row), so the order never changes, only the grouping. Try the shapes
          with <code>-1</code> to let NumPy work out one length, and try <code>(5, -1)</code> or <code>(3, 5)</code> to see why the total
          must stay 12.
        </>
      }
    >
      <Controls>
        <Segmented label="b = a.reshape( … )" value={target} onChange={choose} options={TARGETS.map((x, i) => ({ value: i, label: <span style={{ fontFamily: 'var(--font-mono)' }}>{x.label}</span> }))} />
      </Controls>
      <div ref={ref} style={{ width: '100%' }}>
        <div key={shakeKey} className={`${css.stage}${error ? ` ${css.shake}` : ''}`} style={{ height: H, maxWidth: W, margin: '0 auto' }} aria-live="polite">
          {showOrder && (
            <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 1 }} aria-hidden="true">
              <g key={shape.join('x')} className={moved ? css.order : undefined} opacity={0.9}>
                {rowRuns.map((r, i) => (
                  <g key={i}>
                    <line x1={r.x1} x2={r.x2} y1={r.y} y2={r.y} style={{ stroke: 'var(--viz-2)', strokeWidth: 2, strokeDasharray: '4 3' }} />
                    <path d={`M${r.x2 + 1},${r.y} l-7,-4 l0,8 z`} style={{ fill: 'var(--viz-2)' }} />
                    {i < rowRuns.length - 1 && (
                      <text x={r.end + 3} y={r.y - 2} style={{ fontSize: 15, fontWeight: 700, fill: 'var(--viz-2)' }}>
                        ↵
                      </text>
                    )}
                  </g>
                ))}
              </g>
            </svg>
          )}
          {labels.map((l, i) => (
            <span key={`${shape.join('x')}-${i}`} className={css.blockLabel} style={{ left: l.x, top: l.y }}>
              {l.text}
            </span>
          ))}
          {DATA.map((v, k) => {
            const p = pos[k]
            return (
              <div
                key={k}
                className={css.cell}
                style={{
                  width: p.s,
                  height: p.s,
                  fontSize: p.s < 30 ? '0.75rem' : '0.9rem',
                  transform: `translate(${p.x}px, ${p.y}px)`,
                  transitionDelay: `${k * 45}ms`,
                  background: `color-mix(in srgb, var(--viz-1) ${10 + k * 5}%, var(--surface))`,
                  border: `1.5px solid ${error ? 'var(--viz-neg)' : 'var(--viz-1)'}`,
                }}
              >
                {v}
              </div>
            )
          })}
        </div>
      </div>
      {error ? (
        <div style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 8, background: 'var(--bad-soft)', color: 'var(--bad)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700 }}>
          {error}
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--ink-2)', marginTop: '0.25rem' }}>
            {t.dims.filter((d) => d === -1).length > 1
              ? 'NumPy can only work out one missing length at a time.'
              : `The shape must hold exactly 12 numbers, and ${t.dims.includes(-1) ? `12 cannot be split evenly into ${t.dims.find((d) => d !== -1)} equal parts` : `${t.dims.join(' × ')} = ${t.dims.reduce((a, b) => a * b, 1)}`}. The array keeps its previous shape.`}
          </div>
        </div>
      ) : (
        <pre style={pre}>
          {`a = np.arange(12)\nb = a.reshape(${arg})\nprint(b.shape)   # ${shapeStr(shape)}\nprint(b)\n${npPrint(nest(DATA, shape), false, charsThatFit(w))}`}
        </pre>
      )}
      {note && !error && <div style={{ width: '100%', fontSize: '0.9rem', fontWeight: 600, color: 'var(--viz-2)' }}>{note}</div>}
      <Controls>
        <Toggle label="show the reading order" checked={showOrder} onChange={setShowOrder} />
      </Controls>
    </Figure>
  )
}
