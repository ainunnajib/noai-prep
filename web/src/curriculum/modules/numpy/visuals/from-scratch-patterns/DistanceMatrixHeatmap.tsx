import { useState, type CSSProperties } from 'react'
import { Figure, Plot, Grid, Axes, Path, Dots, Label, DraggablePoint, useNarrow } from '../../../../../kit'
import { mono } from '../vectorised-ops-and-axes/Cells'

/*
  All point-to-centroid distances at once. X has shape (8, 2) and C has shape (3, 2), so
  X[:, None, :] - C[None, :, :] has shape (8, 3, 2); squaring and summing over the last axis and
  taking the square root gives the (8, 3) distance matrix D, and D.argmin(axis=1) assigns each
  point to its nearest centroid. Drag the centroids; click a row (or a point) to inspect it.
*/

const X: [number, number][] = [
  [1.5, 1.0],
  [2.5, 2.5],
  [1.0, 3.0],
  [6.5, 1.5],
  [8.0, 2.5],
  [7.5, 1.0],
  [4.5, 6.0],
  [5.5, 7.0],
]
const COLS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-4)']
const K = 3
const snap = (v: number) => Math.round(v * 2) / 2

export default function DistanceMatrixHeatmap() {
  const [C, setC] = useState<[number, number][]>([
    [3, 4.5],
    [6, 3],
    [8.5, 6.5],
  ])
  const [sel, setSel] = useState(1)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(620)

  const D = X.map(([x, y]) => C.map(([cx, cy]) => Math.hypot(x - cx, y - cy)))
  const labels = D.map((row) => row.reduce((b, v, j) => (v < row[b] ? j : b), 0))
  const dMax = Math.max(...D.flat())

  const move = (j: number) => (x: number, y: number) => setC((cs) => cs.map((c, k) => (k === j ? [snap(x), snap(y)] : c)))

  const cellSize = narrow ? 46 : 50
  const heat = (v: number) => `color-mix(in srgb, var(--viz-5) ${Math.round(8 + (1 - v / dMax) * 52)}%, var(--surface))`
  const th: CSSProperties = { fontSize: '0.78rem', fontWeight: 700, textAlign: 'center' }

  return (
    <Figure
      title="Every point-to-centroid distance in one array"
      caption={
        <>
          Drag the three centroids (big dots). The table is the distance matrix <code>D</code>: one row per point, one column per centroid, darker
          meaning closer. Each row's smallest entry is outlined; its column number is <code>D.argmin(axis=1)</code>, the point's cluster. Click a
          row to draw that point's three distances in the plot.
        </>
      }
      wide
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.8rem 1.4rem' }}>
        <div style={{ flex: narrow ? '1 1 100%' : '1 1 340px', minWidth: 0, maxWidth: 440 }}>
          <Plot x={[0, 10]} y={[0, 8]} width={420} height={346} margin={{ left: 30, bottom: 28, top: 10, right: 12 }} ariaLabel="Eight points and three draggable centroids; each point is joined to its nearest centroid">
            <Grid xTicks={10} yTicks={8} />
            <Axes xTicks={5} yTicks={4} />
            {/* the selected point's distance to every centroid */}
            {C.map((c, j) => (
              <Path key={`sel${j}`} points={[X[sel], c]} color={COLS[j]} width={labels[sel] === j ? 2.6 : 1.4} dash={labels[sel] === j ? undefined : '5 4'} />
            ))}
            {C.map((c, j) => {
              const mx = 0.4 * X[sel][0] + 0.6 * c[0]
              const my = 0.4 * X[sel][1] + 0.6 * c[1]
              return (
                <Label key={`lab${j}`} x={mx} y={my} dx={4} dy={-4} color={COLS[j]} size={12} weight={700}>
                  {D[sel][j].toFixed(1)}
                </Label>
              )
            })}
            {/* every other point joined to its nearest centroid */}
            {X.map((p, i) => (i === sel ? null : <Path key={`n${i}`} points={[p, C[labels[i]]]} color={COLS[labels[i]]} width={1.2} opacity={0.45} />))}
            <Dots
              points={X.map(([x, y], i) => ({ x, y, color: COLS[labels[i]], r: i === sel ? 8 : 6, label: `p${i}` }))}
            />
            {C.map((c, j) => (
              <DraggablePoint key={`c${j}`} x={c[0]} y={c[1]} color={COLS[j]} r={10} label={`c${j}`} onChange={move(j)} />
            ))}
          </Plot>
        </div>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
          <div style={{ ...mono, fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>D, shape (8, 3)</div>
          <div role="table" aria-label="Distance matrix: click a row to inspect that point" style={{ display: 'grid', gridTemplateColumns: `2.2rem repeat(${K}, ${cellSize}px) 3.4rem`, gap: 3, alignItems: 'center' }}>
            <div />
            {C.map((_, j) => (
              <div key={`h${j}`} style={{ ...th, color: COLS[j] }}>
                c{j}
              </div>
            ))}
            <div style={{ ...th, ...mono, fontSize: '0.7rem', color: 'var(--ink-2)' }}>argmin</div>
            {D.map((row, i) => (
              <div key={`r${i}`} style={{ display: 'contents' }}>
                <button
                  type="button"
                  onClick={() => setSel(i)}
                  aria-label={`point ${i}: distances ${row.map((v) => v.toFixed(1)).join(', ')}; nearest centroid ${labels[i]}`}
                  aria-pressed={sel === i}
                  style={{
                    ...th,
                    ...mono,
                    color: sel === i ? 'var(--ink)' : 'var(--ink-3)',
                    textAlign: 'right',
                    padding: '0 4px 0 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  p{i}
                </button>
                {row.map((v, j) => {
                  const best = labels[i] === j
                  return (
                    <span
                      key={`c${j}`}
                      role="cell"
                      onClick={() => setSel(i)}
                      style={{
                        ...mono,
                        boxSizing: 'border-box',
                        height: 28,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '0.82rem',
                        borderRadius: 5,
                        background: heat(v),
                        color: 'var(--ink)',
                        border: best ? `2.5px solid ${COLS[j]}` : '1px solid transparent',
                        fontWeight: best ? 700 : 400,
                        outline: sel === i ? '1.5px solid var(--ink-3)' : 'none',
                        outlineOffset: 1,
                        cursor: 'pointer',
                      }}
                    >
                      {v.toFixed(1)}
                    </span>
                  )
                })}
                <span role="cell" onClick={() => setSel(i)} style={{ ...mono, textAlign: 'center', fontWeight: 700, color: COLS[labels[i]], fontSize: '0.9rem', cursor: 'pointer' }}>
                  {labels[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ ...mono, fontSize: narrow ? '0.74rem' : '0.82rem', color: 'var(--ink-2)', background: 'var(--surface-2)', borderRadius: 8, padding: narrow ? '0.45rem 0.55rem' : '0.45rem 0.75rem', width: '100%', boxSizing: 'border-box', overflowX: 'auto', whiteSpace: 'pre', lineHeight: 1.6 }}>
        {narrow
          ? `diff = X[:, None, :] - C[None, :, :]
#  (8, 1, 2) - (1, 3, 2) -> (8, 3, 2)
D = np.sqrt((diff ** 2).sum(axis=-1))
#  (8, 3)
labels = D.argmin(axis=1)    # (8,)
print(labels)  # [${labels.join(' ')}]`
          : `diff   = X[:, None, :] - C[None, :, :]   # (8, 1, 2) - (1, 3, 2) -> (8, 3, 2)
D      = np.sqrt((diff ** 2).sum(axis=-1))  # (8, 3)
labels = D.argmin(axis=1)                   # (8,)
print(labels)                               # [${labels.join(' ')}]`}
      </div>
    </Figure>
  )
}
