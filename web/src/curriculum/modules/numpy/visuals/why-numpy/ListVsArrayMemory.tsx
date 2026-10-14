import { useId, useState } from 'react'
import { Figure, Controls, Readout, Segmented, MatrixGrid, Bars, useContainerWidth } from '../../../../../kit'

/*
  Left/top: a Python list is a block of pointers to number objects scattered around memory.
  Right/bottom: a NumPy array is one contiguous run of raw bytes; the stride is the jump in bytes.
  Toggle the dtype (byte width) and the shape (1-D or 2-D) and click an element to see where it lives.
*/

const VALUES = [7, 2, 9, 4, 1, 6]
type DType = 'int8' | 'float32' | 'int64' | 'float64'
const ITEMSIZE: Record<DType, number> = { int8: 1, float32: 4, int64: 8, float64: 8 }
const ROW_FILL = ['var(--viz-1)', 'var(--viz-3)']

/* scattered heap positions (fractions of the heap area) and which value lives in each slot */
const SLOTS: [number, number][] = [
  [0.04, 0.1],
  [0.45, 0.0],
  [0.88, 0.14],
  [0.22, 0.92],
  [0.6, 1.0],
  [1.0, 0.84],
]
const VALUE_SLOT = [4, 2, 0, 5, 1, 3] // value k sits in slot VALUE_SLOT[k]

const txt = { fontFamily: 'var(--font-body)', fontSize: 12, fill: 'var(--ink-2)' } as const
const mono = { fontFamily: 'var(--font-mono)', fontSize: 13, fill: 'var(--ink)', fontWeight: 700 } as const

function curve(x1: number, y1: number, x2: number, y2: number) {
  const my = (y1 + y2) / 2
  return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`
}

function ListPanel({ twoD, sel, onSel }: { twoD: boolean; sel: number | null; onSel: (k: number) => void }) {
  const [ref, w] = useContainerWidth<HTMLDivElement>(520)
  const W = Math.max(300, Math.min(640, w))
  const mid = useId().replace(/:/g, '')
  const cw = Math.min(46, (W - 20) / 6.6)
  const ch = 28
  const top = 22
  const innerTop = twoD ? 84 : 0
  const heapTop = twoD ? 150 : 96
  const ow = 46
  const oh = 34
  const heapH = 124
  const H = heapTop + heapH + 18
  const heapW = W - ow - 8

  // pointer cells that point at number objects: [x, y, valueIndex]
  const leaf: { x: number; y: number; k: number }[] = []
  const outer: { x: number; y: number }[] = []
  if (!twoD) {
    VALUES.forEach((_, k) => leaf.push({ x: 10 + k * cw, y: top, k }))
  } else {
    outer.push({ x: 10, y: top }, { x: 10 + cw, y: top })
    const starts = [10, Math.max(10 + 3 * cw + 24, W - 10 - 3 * cw)]
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) leaf.push({ x: starts[r] + c * cw, y: innerTop, k: r * 3 + c })
  }
  const objPos = (k: number) => {
    const [fx, fy] = SLOTS[VALUE_SLOT[k]]
    return { x: 4 + fx * (heapW - 4), y: heapTop + fy * (heapH - oh - 8) }
  }

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="A Python list: a row of pointers, each pointing to a separate number object stored elsewhere in memory" style={{ display: 'block', maxWidth: W }}>
        <defs>
          <marker id={`${mid}a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" style={{ fill: 'var(--viz-muted)' }} />
          </marker>
          <marker id={`${mid}b`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" style={{ fill: 'var(--viz-2)' }} />
          </marker>
        </defs>
        <text x={10} y={14} style={{ ...txt, fontWeight: 700, fill: 'var(--ink)' }}>
          {twoD ? 'list of lists: pointers to lists of pointers' : 'list object: a row of pointers (8 bytes each)'}
        </text>
        <rect x={2} y={heapTop - 10} width={W - 4} height={heapH + 4} rx={10} style={{ fill: 'var(--surface-2)', stroke: 'var(--rule)', strokeDasharray: '4 4' }} />
        <text x={W - 6} y={H - 2} textAnchor="end" style={{ ...txt, fontSize: 11 }}>
          shaded: the rest of memory, where the objects live
        </text>

        {/* outer list (2-D only) */}
        {outer.map((p, r) => {
          const tx = leaf[r * 3].x + 1.5 * cw
          return (
            <g key={`o${r}`}>
              <rect x={p.x} y={p.y} width={cw - 3} height={ch} rx={4} style={{ fill: 'var(--surface-3)', stroke: 'var(--ink-3)' }} />
              <circle cx={p.x + (cw - 3) / 2} cy={p.y + ch / 2} r={3.5} style={{ fill: 'var(--ink-2)' }} />
              <path d={curve(p.x + (cw - 3) / 2, p.y + ch / 2, tx, innerTop - 2)} markerEnd={`url(#${mid}a)`} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 1.5 }} />
            </g>
          )
        })}
        {twoD && (
          <text x={10 + 2 * cw + 6} y={top + ch / 2 + 4} style={{ ...txt, fontSize: 11 }}>
            outer list
          </text>
        )}

        {/* arrows to number objects */}
        {leaf.map((p) => {
          const o = objPos(p.k)
          const on = sel === p.k
          return (
            <path
              key={`a${p.k}`}
              d={curve(p.x + (cw - 3) / 2, p.y + ch / 2, o.x + ow / 2, o.y - 2)}
              markerEnd={`url(#${mid}${on ? 'b' : 'a'})`}
              style={{ fill: 'none', stroke: on ? 'var(--viz-2)' : 'var(--viz-muted)', strokeWidth: on ? 2.5 : 1.4, opacity: sel == null || on ? 1 : 0.55 }}
            />
          )
        })}
        {leaf.map((p) => {
          const on = sel === p.k
          return (
            <g key={`c${p.k}`} onClick={() => onSel(p.k)} style={{ cursor: 'pointer' }}>
              <rect x={p.x} y={p.y} width={cw - 3} height={ch} rx={4} style={{ fill: on ? 'color-mix(in srgb, var(--viz-2) 25%, var(--surface))' : 'var(--surface-3)', stroke: on ? 'var(--viz-2)' : 'var(--ink-3)' }} />
              <circle cx={p.x + (cw - 3) / 2} cy={p.y + ch / 2} r={3.5} style={{ fill: on ? 'var(--viz-2)' : 'var(--ink-2)' }} />
            </g>
          )
        })}

        {/* the scattered number objects */}
        {VALUES.map((v, k) => {
          const o = objPos(k)
          const on = sel === k
          return (
            <g key={`n${k}`} onClick={() => onSel(k)} style={{ cursor: 'pointer' }}>
              <rect x={o.x} y={o.y} width={ow} height={oh} rx={6} style={{ fill: on ? 'color-mix(in srgb, var(--viz-2) 22%, var(--surface))' : 'var(--surface)', stroke: on ? 'var(--viz-2)' : 'var(--ink-3)', strokeWidth: on ? 2 : 1 }} />
              <text x={o.x + ow / 2} y={o.y + 15} textAnchor="middle" style={mono}>
                {v}
              </text>
              <text x={o.x + ow / 2} y={o.y + 28} textAnchor="middle" style={{ ...txt, fontSize: 10 }}>
                int · 28 B
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function ArrayPanel({ dtype, twoD, sel, onSel }: { dtype: DType; twoD: boolean; sel: number | null; onSel: (k: number) => void }) {
  const [ref, w] = useContainerWidth<HTMLDivElement>(520)
  const W = Math.max(300, Math.min(640, w))
  const size = ITEMSIZE[dtype]
  const perRow = 16
  const left = 40
  const cell = Math.min(34, Math.floor((W - left - 6) / perRow))
  const total = VALUES.length * size
  const rows = Math.ceil(total / perRow)
  const top = 46
  const rh = 34
  const H = top + rows * (rh + 8) + 6
  const isFloat = dtype.startsWith('float')
  const label = (v: number) => (isFloat ? (size >= 4 ? `${v}.0` : `${v}.`) : String(v))
  const strides = twoD ? `(${3 * size}, ${size})` : `(${size},)`

  const blocks = VALUES.map((v, k) => {
    const start = k * size
    const r = Math.floor(start / perRow)
    const c = start % perRow
    return { v, k, start, x: left + c * cell, y: top + r * (rh + 8), w: size * cell, row: twoD ? Math.floor(k / 3) : 0 }
  })

  const b0 = blocks[0]
  const b1 = blocks[1]
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`NumPy array memory: ${VALUES.length} values of ${size} byte${size > 1 ? 's' : ''} each, side by side in one block of ${total} bytes. Strides ${strides}.`} style={{ display: 'block', maxWidth: W }}>
        <text x={left} y={13} style={{ ...txt, fontWeight: 700, fill: 'var(--ink)' }}>
          one block of {total} bytes, no pointers
        </text>
        {/* column-stride arrow over the first two elements */}
        <path
          d={`M${b0.x + 2},${top - 4} Q${(b0.x + b1.x) / 2 + 1},${top - 16} ${b1.x + 1},${top - 4}`}
          style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 2 }}
        />
        <path d={`M${b1.x + 1},${top - 3} l-5,-6 l7,0 z`} style={{ fill: 'var(--viz-2)' }} />
        <text x={b1.x + 6} y={top - 8} style={{ ...txt, fill: 'var(--viz-2)', fontWeight: 700 }}>
          +{size} B {twoD ? '(next column)' : '(next element)'}
        </text>

        {Array.from({ length: rows }, (_, r) => (
          <g key={`r${r}`}>
            <text x={left - 6} y={top + r * (rh + 8) + rh / 2 + 4} textAnchor="end" style={{ ...txt, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              +{r * perRow}
            </text>
            {Array.from({ length: perRow }, (_, c) => {
              const byte = r * perRow + c
              const used = byte < total
              return (
                <rect
                  key={c}
                  x={left + c * cell}
                  y={top + r * (rh + 8)}
                  width={cell}
                  height={rh}
                  style={{ fill: used ? 'transparent' : 'var(--surface-2)', stroke: 'var(--rule)', strokeWidth: 1 }}
                />
              )
            })}
          </g>
        ))}
        {blocks.map((b) => {
          const on = sel === b.k
          const fill = ROW_FILL[b.row]
          return (
            <g key={b.k} onClick={() => onSel(b.k)} style={{ cursor: 'pointer' }}>
              <rect
                x={b.x + 1}
                y={b.y + 1}
                width={b.w - 2}
                height={rh - 2}
                rx={4}
                style={{
                  fill: `color-mix(in srgb, ${fill} ${on ? 55 : 22}%, var(--surface))`,
                  stroke: on ? 'var(--viz-2)' : fill,
                  strokeWidth: on ? 2.5 : 1.2,
                }}
              />
              {Array.from({ length: size - 1 }, (_, i) => (
                <line key={i} x1={b.x + (i + 1) * cell} x2={b.x + (i + 1) * cell} y1={b.y + rh - 7} y2={b.y + rh - 1} style={{ stroke: fill, strokeWidth: 1, opacity: 0.7 }} />
              ))}
              <text x={b.x + b.w / 2} y={b.y + rh / 2 + 4.5} textAnchor="middle" style={{ ...mono, fontSize: size === 1 ? 12 : 13 }}>
                {label(b.v)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function ListVsArrayMemory() {
  const [dtype, setDtype] = useState<DType>('int64')
  const [twoD, setTwoD] = useState(false)
  const [sel, setSel] = useState<number | null>(5)
  const size = ITEMSIZE[dtype]
  const grid = twoD ? [VALUES.slice(0, 3), VALUES.slice(3)] : [VALUES]
  const si = sel ?? 0
  const i = twoD ? Math.floor(si / 3) : 0
  const j = twoD ? si % 3 : si
  const offset = twoD ? i * 3 * size + j * size : si * size
  const formula = twoD ? `${i}×${3 * size} + ${j}×${size} = ${offset}` : `${si}×${size} = ${offset}`
  const arrayMB = size
  const panelTitle = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', justifySelf: 'start' } as const

  return (
    <Figure
      title="Where do the numbers actually live?"
      caption={
        <>
          The same six numbers stored two ways. Click any number to follow it. In the list you chase a pointer to an object somewhere
          else; in the array you just jump a fixed number of bytes from the start. Change the dtype and watch the block shrink or grow and
          the stride change; switch to 2-D and notice that the bytes in memory do not move at all: only the strides change.
        </>
      }
    >
      <Controls>
        <Segmented
          label="dtype"
          value={dtype}
          onChange={setDtype}
          options={[
            { value: 'int8', label: 'int8' },
            { value: 'float32', label: 'float32' },
            { value: 'int64', label: 'int64' },
            { value: 'float64', label: 'float64' },
          ]}
        />
        <Segmented
          label="shape"
          value={twoD ? 2 : 1}
          onChange={(v) => setTwoD(v === 2)}
          options={[
            { value: 1, label: '(6,)' },
            { value: 2, label: '(2, 3)' },
          ]}
        />
      </Controls>

      <div style={panelTitle}>Python list {twoD ? '[[7, 2, 9], [4, 1, 6]]' : '[7, 2, 9, 4, 1, 6]'}</div>
      <ListPanel twoD={twoD} sel={sel} onSel={setSel} />

      <div style={panelTitle}>NumPy array, dtype={dtype}: what you see</div>
      <MatrixGrid data={grid} cells={sel == null ? [] : [[i, j]]} cellSize={38} onCellClick={(r, c) => setSel(twoD ? r * 3 + c : c)} ariaLabel="The array as you see it; click a cell" />
      <div style={panelTitle}>…and what is in memory</div>
      <ArrayPanel dtype={dtype} twoD={twoD} sel={sel} onSel={setSel} />

      <Readout
        items={[
          ['itemsize', `${size} B`],
          ['strides', twoD ? `(${3 * size}, ${size})` : `(${size},)`],
          ['nbytes', `${6 * size} B`],
          [twoD ? `a[${i}, ${j}] starts at byte` : `a[${si}] starts at byte`, formula],
        ]}
      />
      <div style={{ width: '100%' }}>
        <div style={{ ...panelTitle, marginBottom: '0.4rem' }}>Memory for 1,000,000 numbers</div>
        <Bars
          ariaLabel="Memory needed for one million numbers"
          max={36}
          format={(v) => `${v} MB`}
          data={[
            { label: 'Python list', value: 36, color: 'var(--viz-2)' },
            { label: `array ${dtype}`, value: arrayMB, color: 'var(--viz-1)', strong: true },
          ]}
        />
        <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', marginTop: '0.35rem' }}>
          List: about 8 MB of pointers + 1,000,000 separate int objects × 28 B ≈ 36 MB. Array: 1,000,000 × {size} B = {arrayMB} MB, plus a header of about 100 bytes.
        </div>
      </div>
    </Figure>
  )
}
