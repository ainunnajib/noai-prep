import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Slider, useContainerWidth } from '../../../../../kit'

/*
  Build a 1-D, 2-D or 3-D array with sliders and see it as a stack of cells, with each axis
  labelled by its number. shape, ndim, size, dtype and nbytes update together.
*/

type DT = 'int8' | 'float32' | 'int64' | 'float64'
const ITEM: Record<DT, number> = { int8: 1, float32: 4, int64: 8, float64: 8 }
const LAYER = ['var(--viz-1)', 'var(--viz-3)', 'var(--viz-5)', 'var(--viz-2)']
const AX = ['var(--viz-4)', 'var(--viz-2)', 'var(--viz-1)']

export default function ShapeInspector() {
  const [ndim, setNdim] = useState(3)
  const [d0, setD0] = useState(2)
  const [d1, setD1] = useState(3)
  const [d2, setD2] = useState(4)
  const [dt, setDt] = useState<DT>('int64')

  const shape = ndim === 1 ? [d2] : ndim === 2 ? [d1, d2] : [d0, d1, d2]
  const depth = ndim === 3 ? d0 : 1
  const rows = ndim === 1 ? 1 : d1
  const cols = d2
  const size = shape.reduce((a, b) => a * b, 1)
  const shapeText = ndim === 1 ? `(${shape[0]},)` : `(${shape.join(', ')})`

  const [wrapRef, cw] = useContainerWidth<HTMLDivElement>(520)
  const c = cw >= 500 ? 42 : 30
  const off = Math.round(c * 0.6)
  const left = ndim >= 2 ? 78 : 14
  const top = (ndim === 3 ? 34 : 10) + (depth - 1) * off
  const W = left + cols * c + (depth - 1) * off + 26
  const H = top + rows * c + 44
  const gridW = cols * c
  const gridH = rows * c

  // axis numbers for the visible directions
  const rowAxis = ndim === 3 ? 1 : 0
  const colAxis = ndim - 1

  const layers = []
  for (let k = depth - 1; k >= 0; k--) {
    const ox = left + k * off
    const oy = top - k * off
    const col = LAYER[k % LAYER.length]
    const front = k === 0
    layers.push(
      <g key={k}>
        {Array.from({ length: rows }, (_, i) =>
          Array.from({ length: cols }, (_, j) => {
            const idx = k * rows * cols + i * cols + j
            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={ox + j * c}
                  y={oy + i * c}
                  width={c}
                  height={c}
                  style={{
                    fill: `color-mix(in srgb, ${col} ${front ? 22 : 30}%, var(--surface))`,
                    stroke: col,
                    strokeWidth: 1.2,
                  }}
                />
                {front && (
                  <text
                    x={ox + j * c + c / 2}
                    y={oy + i * c + c / 2 + 4}
                    textAnchor="middle"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: c > 34 ? 13 : 11,
                      fill: 'var(--ink)',
                    }}
                  >
                    {idx}
                  </text>
                )}
              </g>
            )
          }),
        )}
      </g>,
    )
  }

  const lab = { fontSize: 12, fontWeight: 700 } as const

  return (
    <Figure
      title="Shape inspector: count the cells"
      caption={
        <>
          Pick 1, 2 or 3 dimensions and drag the sliders. The <b>shape</b> lists the length of each axis, <b>ndim</b> counts the axes and <b>size</b> multiplies them. Notice that
          in 3-D the extra axis is added at the <i>front</i>: axis 0 becomes the blocks, and rows and columns move to axes 1 and 2.
        </>
      }
    >
      <Controls>
        <Segmented
          label="number of dimensions"
          value={ndim}
          onChange={setNdim}
          options={[
            { value: 1, label: '1-D' },
            { value: 2, label: '2-D' },
            { value: 3, label: '3-D' },
          ]}
        />
        <Segmented label="dtype" value={dt} onChange={setDt} options={(['int8', 'float32', 'int64', 'float64'] as DT[]).map((d) => ({ value: d, label: d }))} />
      </Controls>
      <Controls>
        {ndim === 3 && <Slider label={<span style={{ color: AX[0] }}>axis 0: blocks</span>} value={d0} min={1} max={4} onChange={setD0} />}
        {ndim >= 2 && <Slider label={<span style={{ color: AX[rowAxis] }}>axis {rowAxis}: rows</span>} value={d1} min={1} max={4} onChange={setD1} />}
        <Slider
          label={
            <span style={{ color: AX[colAxis] }}>
              axis {colAxis}: {ndim === 1 ? 'length' : 'columns'}
            </span>
          }
          value={d2}
          min={1}
          max={ndim === 1 ? 8 : 5}
          onChange={setD2}
        />
      </Controls>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            fontFamily: 'var(--font-body)',
          }}
          role="img"
          aria-label={`An array of shape ${shapeText} drawn as ${depth > 1 ? `${depth} stacked blocks of ` : ''}${rows} by ${cols} cells`}
        >
          {layers}
          {/* rows bracket on the left */}
          {ndim >= 2 && (
            <g>
              <path d={`M${left - 8},${top} h-5 v${gridH} h5`} style={{ fill: 'none', stroke: AX[rowAxis], strokeWidth: 2 }} />
              <text x={left - 16} y={top + gridH / 2 - 2} textAnchor="end" style={{ ...lab, fill: AX[rowAxis] }}>
                axis {rowAxis}
              </text>
              <text x={left - 16} y={top + gridH / 2 + 12} textAnchor="end" style={{ ...lab, fill: AX[rowAxis] }}>
                {d1} rows
              </text>
            </g>
          )}
          {/* columns bracket underneath */}
          <path d={`M${left},${top + gridH + 8} v5 h${gridW} v-5`} style={{ fill: 'none', stroke: AX[colAxis], strokeWidth: 2 }} />
          <text x={left + gridW / 2} y={top + gridH + 28} textAnchor="middle" style={{ ...lab, fill: AX[colAxis] }}>
            axis {colAxis}: {cols} {ndim === 1 ? 'elements' : cols === 1 ? 'column' : 'columns'}
          </text>
          {/* depth arrow */}
          {ndim === 3 && (
            <g>
              <path d={`M${left - 4},${top - 4} l${(depth - 1) * off + 0.01},${-(depth - 1) * off - 0.01}`} style={{ stroke: AX[0], strokeWidth: 2, fill: 'none' }} />
              <text x={left - 10} y={14} style={{ ...lab, fill: AX[0] }}>
                axis 0: {d0} {d0 === 1 ? 'block' : 'blocks'}
              </text>
            </g>
          )}
        </svg>
      </div>
      <Readout
        items={[
          ['shape', shapeText],
          ['ndim', `${ndim}`],
          ['size', ndim === 1 ? `${size}` : `${shape.join(' × ')} = ${size}`],
          ['len(a)', `${shape[0]}`],
          ['dtype', dt],
          ['nbytes', `${size} × ${ITEM[dt]} = ${size * ITEM[dt]}`],
        ]}
      />
      {ndim === 3 && (
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-2)', width: '100%' }}>
          Like an HDB estate: {d0} {d0 === 1 ? 'block' : 'blocks'} × {d1} {d1 === 1 ? 'floor' : 'floors'} × {d2} {d2 === 1 ? 'flat' : 'flats'} per floor = {size} flats.{' '}
          <code>a[0]</code> is the whole front block, with shape ({d1}, {d2}).
        </div>
      )}
    </Figure>
  )
}
