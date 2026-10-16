import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Label, MatrixGrid, Bars, usePlot, useNarrow, M } from '../../../../../kit'
import { Note } from '../k-means/parts'
import { laplacian, spectrum } from './graphs'

/*
  A six-node graph: two triangles (A, B, C) and (D, E, F) joined by a bridge C-D of adjustable weight w.
  Shows the Laplacian L = D - W as a matrix, its second-smallest eigenvalue (lambda_2) and the Fiedler
  vector as signed bars and node colours. As the bridge weakens, lambda_2 -> 0 and the vector becomes
  +c on one triangle and -c on the other: the eigenvector "finds" the two groups.
*/

const NAMES = ['A', 'B', 'C', 'D', 'E', 'F']
const POS: [number, number][] = [
  [0.8, 3.2],
  [0.8, 0.8],
  [2.5, 2.0],
  [4.5, 2.0],
  [6.2, 0.8],
  [6.2, 3.2],
]
const BASE_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [3, 4],
  [3, 5],
  [4, 5],
]

const fmtNum = (v: number) => {
  const r = Math.round(v * 100) / 100
  return Object.is(r, -0) ? '0' : String(r)
}

function Graph({ W, vec }: { W: number[][]; vec: number[] }) {
  const { xs, ys } = usePlot()
  const vmax = Math.max(...vec.map(Math.abs), 1e-9)
  const lines: React.ReactNode[] = []
  for (let i = 0; i < 6; i++)
    for (let j = i + 1; j < 6; j++) {
      const w = W[i][j]
      const isBridge = !BASE_EDGES.some(([a, b]) => a === i && b === j)
      if (w <= 0 && !isBridge) continue
      if (w <= 0 && !(i === 2 && j === 3)) continue
      const mx = (xs(POS[i][0]) + xs(POS[j][0])) / 2
      const my = (ys(POS[i][1]) + ys(POS[j][1])) / 2
      lines.push(
        <g key={`${i}-${j}`}>
          <line
            x1={xs(POS[i][0])}
            y1={ys(POS[i][1])}
            x2={xs(POS[j][0])}
            y2={ys(POS[j][1])}
            style={{ stroke: isBridge ? 'var(--viz-4)' : 'var(--viz-axis)', strokeWidth: w > 0 ? 1 + 3.5 * w : 1.2, strokeDasharray: w > 0 ? undefined : '4 4', opacity: w > 0 ? 0.9 : 0.6 }}
            strokeLinecap="round"
          />
          {isBridge && (
            <text className="plot-label" x={mx} y={my - 8} textAnchor="middle" style={{ fill: 'var(--viz-4)', fontWeight: 700, fontSize: 12 }}>
              {w > 0 ? `w = ${fmtNum(w)}` : 'no edge'}
            </text>
          )}
        </g>,
      )
    }
  return (
    <g>
      {lines}
      {POS.map((p, i) => {
        const v = vec[i]
        const colour = v >= 0 ? 'var(--viz-1)' : 'var(--viz-2)'
        const pct = Math.round(25 + 65 * (Math.abs(v) / vmax))
        return (
          <g key={i}>
            <circle cx={xs(p[0])} cy={ys(p[1])} r={17} style={{ fill: `color-mix(in srgb, ${colour} ${pct}%, var(--surface))`, stroke: colour, strokeWidth: 2 }} />
            <text x={xs(p[0])} y={ys(p[1])} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontWeight: 800, fontSize: 14 }}>
              {NAMES[i]}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default function LaplacianToy() {
  const [w, setW] = useState(0.3)
  const [second, setSecond] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const W = Array.from({ length: 6 }, () => new Array(6).fill(0))
  for (const [a, b] of BASE_EDGES) W[a][b] = W[b][a] = 1
  W[2][3] = W[3][2] = w
  if (second) W[1][4] = W[4][1] = 1
  const L = laplacian(W)
  const s = spectrum(L, 0)
  const vec = s.fiedler
  const lam2 = s.fiedlerValue
  const groupA = NAMES.filter((_, i) => vec[i] >= 0).join(', ')
  const groupB = NAMES.filter((_, i) => vec[i] < 0).join(', ')
  // the quantity the Fiedler vector minimises: sum over edges of w_ij (v_i - v_j)^2
  let quad = 0
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) quad += W[i][j] * (vec[i] - vec[j]) ** 2

  return (
    <Figure
      title="Why the Laplacian's eigenvectors find clusters"
      caption={
        <>
          Two friend groups (triangles) joined by one bridge of strength <M>w</M>. Slide <M>w</M> towards 0 and watch <M>{'\\lambda_2'}</M> fall to 0 while
          the Fiedler vector becomes one constant value on each triangle (blue = positive, orange = negative). At <M>w = 0</M> the graph is in two
          pieces and the vector is exactly <M>{'\\pm 1/\\sqrt{6}'}</M>. Add a second bridge and the groups are harder to separate, so{' '}
          <M>{'\\lambda_2'}</M> grows.
        </>
      }
    >
      <Plot x={[0, 7]} y={[0, 4]} width={420} height={240} maxWidth={520} margin={{ left: 10, right: 10, top: 10, bottom: 10 }} ariaLabel={`Graph of two triangles joined by a bridge of weight ${fmtNum(w)}; Fiedler vector splits ${groupA} from ${groupB}`}>
        <Graph W={W} vec={vec} />
        <Label x={3.5} y={3.75} anchor="middle" size={12} color="var(--ink-2)">
          {`split: {${groupA}} | {${groupB}}`}
        </Label>
      </Plot>
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'auto 1fr', gap: '1rem', alignItems: 'center', justifyItems: 'center' }}>
        <MatrixGrid
          label={<>Laplacian <M>{'L = D - W'}</M></>}
          data={L}
          format={fmtNum}
          cellSize={narrow ? 38 : 40}
          cells={second ? [[2, 3], [3, 2], [1, 4], [4, 1]] : [[2, 3], [3, 2]]}
          ariaLabel="The 6 by 6 Laplacian matrix: degrees on the diagonal, minus the edge weights off the diagonal"
        />
        <div style={{ width: '100%', maxWidth: 340 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.3rem' }}>Fiedler vector (2nd eigenvector of L)</div>
          <Bars
            ariaLabel="Entries of the Fiedler vector for nodes A to F"
            max={0.7}
            format={(v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(3)}
            data={vec.map((v, i) => ({ label: NAMES[i], value: v, color: v >= 0 ? 'var(--viz-1)' : 'var(--viz-2)' }))}
          />
        </div>
      </div>
      <Readout
        items={[
          [<M key="l1">{'\\lambda_1'}</M>, '0 (always)'],
          [<M key="l2">{'\\lambda_2'}</M>, lam2.toFixed(3)],
          [<M key="q">{'\\sum w_{ij}(v_i - v_j)^2'}</M>, quad.toFixed(3)],
        ]}
      />
      <Note>
        The last number is the "disagreement" of the vector across edges. For a unit eigenvector it equals <M>{'\\lambda_2'}</M>: the Fiedler vector is the
        way to give every node a number (not all the same) so that strongly connected nodes get similar numbers.
      </Note>
      <Controls>
        <Slider label="bridge strength w (edge C–D)" value={w} min={0} max={2} step={0.05} onChange={setW} format={(v) => v.toFixed(2)} />
        <Toggle label="Add a second bridge B–E (weight 1)" checked={second} onChange={setSecond} />
      </Controls>
    </Figure>
  )
}
