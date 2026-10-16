import { useId, useState } from 'react'
import { Figure, Controls, Readout, Segmented, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'

/*
  a = np.arange(12).reshape(3, 4) with dtype int64 lives in ONE strip of 12 × 8 = 96 bytes.
  Every view (a, a.T, slices) is just a different (offset, shape, strides) reading of that strip.
  Click a cell (or play the walk) to see which byte it lives at and how far each step jumps.
*/

const ITEM = 8
interface View {
  label: string
  shape: [number, number]
  strides: [number, number]
  offset: number
}
const VIEWS: View[] = [
  { label: 'a', shape: [3, 4], strides: [32, 8], offset: 0 },
  { label: 'a.T', shape: [4, 3], strides: [8, 32], offset: 0 },
  { label: 'a[:, ::2]', shape: [3, 2], strides: [32, 16], offset: 0 },
  { label: 'a[::2]', shape: [2, 4], strides: [64, 8], offset: 0 },
  { label: 'a[1:, 1:3]', shape: [2, 2], strides: [32, 8], offset: 40 },
]

export default function MemoryStrip() {
  const [vi, setVi] = useState(0)
  const v = VIEWS[vi]
  const [R, C] = v.shape
  const n = R * C
  const player = usePlayer({ steps: n, interval: 900 })
  const sel = Math.min(player.step, n - 1)
  const si = Math.floor(sel / C)
  const sj = sel % C
  const byteOf = (i: number, j: number) => v.offset + i * v.strides[0] + j * v.strides[1]
  const slotOf = (i: number, j: number) => byteOf(i, j) / ITEM
  const used = new Set<number>()
  for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) used.add(slotOf(i, j))
  const contiguous = v.strides[1] === ITEM && v.strides[0] === C * ITEM
  const order = Array.from({ length: n }, (_, k) => byteOf(Math.floor(k / C), k % C))
  const jumps = order.slice(1).map((b, k) => b - order[k])

  const [ref, w] = useContainerWidth<HTMLDivElement>(560)
  const W = Math.max(300, Math.min(680, w))
  const mid = useId().replace(/:/g, '')
  const g = W < 420 ? 36 : 42
  const gridW = C * g + (C - 1) * 4
  const gx = (W - gridW) / 2
  const gy = 26
  const gridH = R * g + (R - 1) * 4
  const pad = 8
  const sw = (W - 2 * pad) / 12
  const sy = gy + gridH + 74
  const sh = 34
  const H = sy + sh + 74
  const slotX = (k: number) => pad + k * sw
  const cellX = (j: number) => gx + j * (g + 4)
  const cellY = (i: number) => gy + i * (g + 4)

  const selSlot = slotOf(si, sj)
  const nextCol = sj + 1 < C ? slotOf(si, sj + 1) : null
  const nextRow = si + 1 < R ? slotOf(si + 1, sj) : null

  const arc = (from: number, to: number, y: number, up: boolean, colour: string, label: string, key: string) => {
    const x1 = slotX(from) + sw / 2
    const x2 = slotX(to) + sw / 2
    const h = Math.min(30, 12 + Math.abs(to - from) * 3)
    const cy = up ? y - h : y + h
    const lx = (x1 + x2) / 2
    const textW = label.length * 6.6
    // above the strip the dashed link comes down at x1, so put the label beside the arc's END, clear of the link
    const upX = x2 + 6 + textW <= W - pad ? x2 + 6 : x1 - 6
    const upAnchor = x2 + 6 + textW <= W - pad ? 'start' : 'end'
    return (
      <g key={key}>
        <path d={`M${x1},${y} Q${lx},${cy} ${x2},${y}`} markerEnd={`url(#${mid}${key})`} style={{ fill: 'none', stroke: colour, strokeWidth: 2 }} />
        <text
          x={up ? upX : Math.max(textW / 2 + 2, Math.min(W - textW / 2 - 2, lx))}
          y={up ? y - 6 : cy - h / 2 + 18}
          textAnchor={up ? upAnchor : 'middle'}
          style={{ fontSize: 11.5, fontWeight: 700, fill: colour, paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 3 }}
        >
          {label}
        </text>
      </g>
    )
  }

  return (
    <Figure
      title="One strip of memory, many ways to read it"
      caption={
        <>
          The 12 numbers of <code>a = np.arange(12).reshape(3, 4)</code> (int64, 8 bytes each) sit in one strip of 96 bytes. Click a cell
          or press Play to walk through the array in reading order and watch where each step lands in memory. Then switch to <code>a.T</code>
          : nothing in the strip moves, the strides are simply swapped, so the walk now jumps around. That is what "not contiguous" means.
        </>
      }
    >
      <Controls>
        <Segmented
          label="view"
          value={vi}
          onChange={(x) => {
            setVi(x)
            player.reset()
          }}
          options={VIEWS.map((x, i) => ({ value: i, label: <span style={{ fontFamily: 'var(--font-mono)' }}>{x.label}</span> }))}
        />
      </Controls>
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${v.label} has shape (${R}, ${C}) and strides (${v.strides.join(', ')}). Element [${si}, ${sj}] is at byte ${byteOf(si, sj)}.`} style={{ display: 'block', maxWidth: W, fontFamily: 'var(--font-body)' }}>
          <defs>
            {['c', 'r'].map((k) => (
              <marker key={k} id={`${mid}${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" style={{ fill: k === 'c' ? 'var(--viz-1)' : 'var(--viz-4)' }} />
              </marker>
            ))}
          </defs>
          <text x={gx} y={14} style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>
            {v.label}  shape ({R}, {C})
          </text>
          {/* link from the selected cell's column (below the grid, so it never runs behind other cells) to its memory slot */}
          <circle cx={cellX(sj) + g / 2} cy={gy + gridH + 5} r={3} style={{ fill: 'var(--viz-2)' }} />
          <path
            d={`M${cellX(sj) + g / 2},${gy + gridH + 5} C${cellX(sj) + g / 2},${sy - 30} ${slotX(selSlot) + sw / 2},${gy + gridH + 30} ${slotX(selSlot) + sw / 2},${sy - 2}`}
            style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 1.5, strokeDasharray: '4 3' }}
          />
          {/* the logical grid */}
          {Array.from({ length: R }, (_, i) =>
            Array.from({ length: C }, (_, j) => {
              const k = i * C + j
              const on = k === sel
              const value = slotOf(i, j)
              return (
                <g key={`${i}-${j}`} onClick={() => player.setStep(k)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={cellX(j)}
                    y={cellY(i)}
                    width={g}
                    height={g}
                    rx={6}
                    style={{ fill: on ? 'color-mix(in srgb, var(--viz-2) 35%, var(--surface))' : 'color-mix(in srgb, var(--viz-1) 14%, var(--surface))', stroke: on ? 'var(--viz-2)' : 'var(--viz-1)', strokeWidth: on ? 2.5 : 1 }}
                  />
                  <text x={cellX(j) + g / 2} y={cellY(i) + g / 2 + 5} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, fill: 'var(--ink)' }}>
                    {value}
                  </text>
                </g>
              )
            }),
          )}
          <text x={W - pad} y={sy - 44} textAnchor="end" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink-2)', paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 4 }}>
            memory: one strip of 96 bytes
          </text>
          {/* the strip */}
          {Array.from({ length: 12 }, (_, k) => {
            const isSel = k === selSlot
            const inView = used.has(k)
            return (
              <g key={k}>
                <rect
                  x={slotX(k) + 1}
                  y={sy}
                  width={sw - 2}
                  height={sh}
                  rx={4}
                  style={{
                    fill: isSel ? 'color-mix(in srgb, var(--viz-2) 40%, var(--surface))' : inView ? 'color-mix(in srgb, var(--viz-1) 18%, var(--surface))' : 'var(--surface-2)',
                    stroke: isSel ? 'var(--viz-2)' : inView ? 'var(--viz-1)' : 'var(--rule)',
                    strokeWidth: isSel ? 2.5 : 1,
                  }}
                />
                <text x={slotX(k) + sw / 2} y={sy + sh / 2 + 5} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: sw < 30 ? 12 : 14, fontWeight: 700, fill: inView ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {k}
                </text>
                <text x={slotX(k) + sw / 2} y={sy + sh + 13} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: sw < 30 ? 9.5 : 11, fill: 'var(--ink-3)' }}>
                  {k * ITEM}
                </text>
              </g>
            )
          })}
          <text x={W - pad} y={sy + sh + 26} textAnchor="end" style={{ fontSize: 10.5, fill: 'var(--ink-3)' }}>
            byte offset
          </text>
          {nextCol != null && arc(selSlot, nextCol, sy - 3, true, 'var(--viz-1)', `+${v.strides[1]} B: next column`, 'c')}
          {nextRow != null && arc(selSlot, nextRow, sy + sh + 30, false, 'var(--viz-4)', `+${v.strides[0]} B: next row`, 'r')}
        </svg>
      </div>
      <PlayerControls player={player} label={(s) => `element ${s + 1} of ${n}`} />
      <Readout
        items={[
          ['strides', `(${v.strides.join(', ')})`],
          [`${v.label}[${si}, ${sj}] at byte`, `${v.offset ? `${v.offset} + ` : ''}${si}×${v.strides[0]} + ${sj}×${v.strides[1]} = ${byteOf(si, sj)}`],
          ['C-contiguous', contiguous ? 'True' : 'False'],
          ['data copied', 'no'],
        ]}
      />
      <div style={{ width: '100%', fontSize: '0.85rem', color: 'var(--ink-2)' }}>
        Jumps while reading in order (bytes):{' '}
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: contiguous ? 'var(--viz-pos)' : 'var(--viz-2)' }}>
          {jumps.map((j, k) => (
            <span key={k} style={{ textDecoration: k === sel - 1 ? 'underline' : undefined }}>
              {(j > 0 ? '+' : '−') + Math.abs(j)}
              {k < jumps.length - 1 ? ' ' : ''}
            </span>
          ))}
        </span>
        {contiguous ? ' (every step is +8: the elements are side by side, so this view is contiguous)' : ' (uneven jumps: this view is not contiguous)'}
      </div>
    </Figure>
  )
}
