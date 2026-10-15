import { useEffect, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button, Plot, Grid, Axes, Arrow, Path, Rect, Dots, Label, usePlot, useNarrow } from '../../../../../kit'
import { type M2, type V2, fmt, Smiley, Clip } from '../linear-transformations/la'
import { type Mat, columns, det, matVec, orthoBasis, rankOf, makeProj } from './linalg'
import s from './sri.module.css'

/*
  Rank = how many dimensions survive. The columns of an m×n matrix are n arrows living in
  m-dimensional space; every output Ax is a combination of them, so the outputs fill their span
  (the column space). Edit entries or press the buttons and watch the outputs collapse from
  plane to line to point (or, in 3-D, from space to plane to line to point).
*/

type Shape = '2x2' | '2x3' | '3x2' | '3x3'
const DEFAULTS: Record<Shape, Mat> = {
  '2x2': [
    [1, -1],
    [0.5, 1],
  ],
  '2x3': [
    [1, -1, 1.5],
    [0.5, 1, 1],
  ],
  '3x2': [
    [1, 0],
    [0, 2],
    [0.5, 1],
  ],
  '3x3': [
    [1.5, 0.5, 0],
    [0, 2, 0.5],
    [0.5, 0, 1.5],
  ],
}
const COL = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-4)']
const clone = (M: Mat) => M.map((r) => r.slice())

/** Entries are rounded to 2 decimal places and kept within ±9; an empty cell counts as 0. */
const cleanEntry = (v: number) => Math.round(Math.max(-9, Math.min(9, v)) * 100) / 100

function NumCell({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [text, setText] = useState(String(value))
  useEffect(() => {
    const shown = text.trim() === '' ? 0 : parseFloat(text)
    if (!(Number.isFinite(shown) && cleanEntry(shown) === value)) setText(String(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <input
      type="number"
      step={0.5}
      className={s.edCell}
      value={text}
      aria-label={label}
      onBlur={() => {
        // tidy the text once the learner leaves the cell (e.g. an empty cell shows 0)
        if (text.trim() === '' || cleanEntry(parseFloat(text)) !== parseFloat(text)) setText(String(value))
      }}
      onChange={(e) => {
        setText(e.target.value)
        const raw = e.target.value.trim()
        const v = raw === '' ? 0 : parseFloat(raw)
        if (Number.isFinite(v)) onChange(cleanEntry(v))
      }}
    />
  )
}

/** Vertices and edges of the image of the unit square / cube under M (n = 2 or 3). */
function cubeImage(M: Mat) {
  const n = M[0].length
  const verts: number[][] = []
  for (let mask = 0; mask < 1 << n; mask++) {
    const x = Array.from({ length: n }, (_, j) => (mask >> j) & 1)
    verts.push(matVec(M, x))
  }
  const edges: [number, number][] = []
  for (let a = 0; a < verts.length; a++) for (let j = 0; j < n; j++) if (!((a >> j) & 1)) edges.push([a, a | (1 << j)])
  // faces: fix all but two coordinates
  const faces: number[][] = []
  for (let j = 0; j < n; j++)
    for (let k = j + 1; k < n; k++)
      for (let rest = 0; rest < 1 << n; rest++) {
        if ((rest >> j) & 1 || (rest >> k) & 1) continue
        faces.push([rest, rest | (1 << j), rest | (1 << j) | (1 << k), rest | (1 << k)])
      }
  return { verts, edges, faces }
}

/** "col j" labels at the arrow tips, nudged apart vertically when two tips are close on screen. */
function ColLabels({ tips }: { tips: V2[] }) {
  const { xs, ys } = usePlot()
  const placed: { x: number; y: number; anchor: 'start' | 'end'; j: number }[] = []
  tips.forEach((tip, j) => {
    const px = xs(tip[0])
    const py = ys(tip[1])
    if (Math.hypot(px - xs(0), py - ys(0)) < 4) return
    const left = tip[0] < 0
    const x = px + (left ? -7 : 7)
    let y = py + (tip[1] < 0 ? 15 : -7)
    // the text "col j" is about 40 px wide: [x, x + 40] when anchored at its start, [x − 40, x] at its end.
    // Move it down a line until it no longer overlaps an earlier label.
    const span = (q: { x: number; anchor: 'start' | 'end' }) => (q.anchor === 'start' ? [q.x, q.x + 42] : [q.x - 42, q.x])
    const mine = span({ x, anchor: left ? 'end' : 'start' })
    for (let tries = 0; tries < 4; tries++) {
      const clash = placed.find((q) => {
        const o = span(q)
        return Math.abs(q.y - y) < 14 && o[0] < mine[1] && mine[0] < o[1]
      })
      if (!clash) break
      y = clash.y + 15
    }
    placed.push({ x, y, anchor: left ? 'end' : 'start', j })
  })
  return (
    <g aria-hidden="true">
      {placed.map((p) => (
        <text key={p.j} className="plot-label" x={p.x} y={p.y} textAnchor={p.anchor} style={{ fill: COL[p.j], fontWeight: 750 }}>
          {`col ${p.j + 1}`}
        </text>
      ))}
    </g>
  )
}

export default function RankCollapse() {
  const [shape, setShape] = useState<Shape>('2x2')
  const [M, setM] = useState<Mat>(clone(DEFAULTS['2x2']))
  const [az, setAz] = useState(-125)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(620)

  const m = M.length
  const n = M[0].length
  const cols = columns(M)
  const r = rankOf(M)
  const maxRank = Math.min(m, n)
  const basis = orthoBasis(cols)
  const square = m === n
  const D = square ? det(M) : NaN
  const proj = makeProj(az, 28)
  const S = (p: number[]): V2 => (m === 2 ? [p[0], p[1]] : proj(p))
  const LIM = m === 2 ? 3.6 : 4.2

  const setEntry = (i: number, j: number, v: number) =>
    setM((old) => {
      const nm = clone(old)
      nm[i][j] = v
      return nm
    })
  const setCol = (j: number, c: number[]) =>
    setM((old) => {
      const nm = clone(old)
      for (let i = 0; i < nm.length; i++) nm[i][j] = c[i]
      return nm
    })
  const pick = (sh: Shape) => {
    setShape(sh)
    setM(clone(DEFAULTS[sh]))
  }

  const outputWords =
    m === 2
      ? ['only the origin (a point)', 'a line through the origin', 'the whole plane'][r]
      : ['only the origin (a point)', 'a line through the origin', 'a flat plane through the origin', 'all of 3-D space'][r]
  const img = cubeImage(M)
  const L = 40
  const GL = m === 3 ? 3 : L // in 3-D draw the image of a bounded patch of the input grid

  // drawing of the column space (the set of all outputs)
  const span = (() => {
    if (r === 0) return <Dots points={[{ x: 0, y: 0, r: 8, color: 'var(--viz-3)' }]} />
    if (m === 2 && r === 2) return <Rect x0={-LIM} x1={LIM} y0={-LIM} y1={LIM} fill="color-mix(in srgb, var(--viz-3) 10%, transparent)" />
    if (r === 1 && basis.length >= 1) {
      const b = basis[0]
      return <Path points={[S(b.map((x) => -L * x)), S(b.map((x) => L * x))]} color="color-mix(in srgb, var(--viz-3) 50%, transparent)" width={9} />
    }
    if (m === 3 && r === 2 && basis.length >= 2) {
      const [b1, b2] = basis
      const k = 3.2
      const corner = (s1: number, s2: number) => S(b1.map((x, i) => k * s1 * x + k * s2 * b2[i]))
      return (
        <Path
          points={[corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)]}
          closed
          color="var(--viz-3)"
          width={1.5}
          fill="color-mix(in srgb, var(--viz-3) 16%, transparent)"
        />
      )
    }
    return null
  })()

  // 3-D helpers: axes and a faint floor grid
  const axes3 =
    m === 3 ? (
      <g aria-hidden="true">
        {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
          <g key={k}>
            <Path points={[S([k, -3, 0]), S([k, 3, 0])]} color="var(--viz-grid)" width={1} />
            <Path points={[S([-3, k, 0]), S([3, k, 0])]} color="var(--viz-grid)" width={1} />
          </g>
        ))}
        {[
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ].map((e, i) => (
          <g key={i}>
            <Path points={[S(e.map((x) => -3.4 * x)), S(e.map((x) => 3.4 * x))]} color="var(--viz-axis)" width={1.3} />
            <Label x={S(e.map((x) => 3.75 * x))[0]} y={S(e.map((x) => 3.75 * x))[1]} anchor="middle" dy={4} color="var(--ink-3)">
              {['x', 'y', 'z'][i]}
            </Label>
          </g>
        ))}
      </g>
    ) : null

  // images of the grid lines (only meaningful for 2 inputs)
  const gridLines =
    n === 2 && r > 0
      ? (m === 3 ? [-3, -2, -1, 0, 1, 2, 3] : [-4, -3, -2, -1, 0, 1, 2, 3, 4]).flatMap((k) => [
          <Path
            key={`a${k}`}
            points={[S(matVec(M, [k, -GL])), S(matVec(M, [k, GL]))]}
            color="var(--viz-5)"
            width={k === 0 ? 1.6 : 1}
            opacity={k === 0 ? 0.9 : 0.38}
          />,
          <Path
            key={`b${k}`}
            points={[S(matVec(M, [-GL, k])), S(matVec(M, [GL, k]))]}
            color="var(--viz-5)"
            width={k === 0 ? 1.6 : 1}
            opacity={k === 0 ? 0.9 : 0.38}
          />,
        ])
      : null

  const matrixEditor = (
    <div className={s.edWrap}>
      <span className={s.edLabel}>
        A ({m}×{n}): type in any entry
      </span>
      <div className={s.edMat} style={{ gridTemplateColumns: `repeat(${n}, auto)` }}>
        {M.map((row, i) =>
          row.map((v, j) => (
            <span key={`${i}-${j}`} style={{ display: 'contents' }}>
              <NumCell value={v} onChange={(x) => setEntry(i, j, x)} label={`row ${i + 1}, column ${j + 1}`} />
            </span>
          )),
        )}
      </div>
      <div className={s.colList}>
        {cols.map((c, j) => (
          <span key={j} style={{ color: COL[j] }}>
            col {j + 1} = ({c.map((x) => fmt(x)).join(', ')})
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <Figure
      title="Rank: how many dimensions survive?"
      caption={
        <>
          The coloured arrows are the columns of <i>A</i>; every output <i>Ax</i> is a combination of them, so the outputs fill their span (shaded green). The
          violet shape is where the unit square (or, in 3-D, the unit cube) lands. Type
          in entries or press <b>column 2 = 2 × column 1</b> and watch the output collapse and the rank drop. Switch shape: with 2 rows the columns live in a
          plane, so rank can never pass 2 however many columns you add; with 2 columns you can only ever reach a plane, even in 3-D. In 3-D, turn the view to
          check that a flattened shape really is flat.
        </>
      }
    >
      <Segmented
        label="Shape (rows × columns)"
        value={shape}
        onChange={pick}
        options={[
          { value: '2x2', label: '2×2' },
          { value: '2x3', label: '2×3' },
          { value: '3x2', label: '3×2' },
          { value: '3x3', label: '3×3' },
        ]}
      />
      <div ref={wrapRef} className={`${s.split} ${narrow ? s.splitNarrow : ''}`}>
        <div className={s.side}>
          {matrixEditor}
          <div className={s.rankBig} aria-live="polite">
            rank {r}
          </div>
          <ul className={s.facts}>
            <li>
              {r} of {n} columns independent
            </li>
            <li>
              rank ≤ min({m}, {n}) = {maxRank}
            </li>
            <li>
              outputs fill <b style={{ color: 'var(--ink)' }}>{outputWords}</b>
            </li>
            {square && (
              <li>
                det A = {fmt(D)}: <span className={r === m ? s.c3 : s.c4}>{r === m ? 'full rank, invertible' : 'singular, no inverse'}</span>
              </li>
            )}
          </ul>
        </div>
        <Plot
          x={[-LIM, LIM]}
          y={[-LIM, LIM]}
          width={400}
          height={400}
          margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
          ariaLabel={`Outputs of a ${m} by ${n} matrix of rank ${r}: ${outputWords}`}
        >
          {m === 2 && <Grid xTicks={8} yTicks={8} />}
          <Clip>
            {span}
            {m === 2 && <Axes origin xTicks={6} yTicks={6} />}
            {axes3}
            {gridLines}
            {img.faces.map((f, i) => (
              <Path
                key={`f${i}`}
                points={f.map((q) => S(img.verts[q]))}
                closed
                color="none"
                width={0}
                fill="color-mix(in srgb, var(--viz-5) 10%, transparent)"
              />
            ))}
            {img.edges.map(([p, q], i) => (
              <Path key={`e${i}`} points={[S(img.verts[p]), S(img.verts[q])]} color="var(--viz-5)" width={1.6} />
            ))}
            {shape === '2x2' && r > 0 && <Smiley m={M as M2} cx={-0.8} cy={-0.9} r={0.6} />}
            {cols.map((c, j) => (
              <Arrow key={j} from={[0, 0]} to={S(c)} color={COL[j]} width={3.5} head={10} />
            ))}
            <ColLabels tips={cols.map(S)} />
          </Clip>
        </Plot>
      </div>

      <Controls>
        <Button
          onClick={() =>
            setCol(
              1,
              cols[0].map((x) => 2 * x),
            )
          }
        >
          column 2 = 2 × column 1
        </Button>
        {n === 3 && (
          <Button
            onClick={() =>
              setCol(
                2,
                cols[0].map((x, i) => x + cols[1][i]),
              )
            }
          >
            column 3 = column 1 + column 2
          </Button>
        )}
        <Button onClick={() => setM(M.map((row) => row.map(() => 0)))}>zero matrix</Button>
        <Button onClick={() => setM(clone(DEFAULTS[shape]))}>reset</Button>
      </Controls>
      {m === 3 && (
        <Controls>
          <Slider label="Turn the 3-D view" value={az} min={-180} max={180} step={5} onChange={setAz} format={(v) => `${v}°`} />
        </Controls>
      )}
    </Figure>
  )
}
