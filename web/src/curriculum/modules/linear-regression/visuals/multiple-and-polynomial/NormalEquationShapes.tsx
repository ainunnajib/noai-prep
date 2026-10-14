import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, MatrixGrid, M, usePlayer, PlayerControls, useContainerWidth, mulberry32 } from '../../../../../kit'
import { matmul, matvec, transpose, solve, det, rank, pinvSolve, symEig, type Mat, type Vec } from './linalg'

/*
  The normal equation w = (XᵀX)⁻¹Xᵀy as a chain of shaped blocks. The learner steps through the
  products, changes n (rows) and d (columns), and can add a duplicate column (or use fewer rows than
  columns) to make XᵀX singular. Real numbers are computed for every step, and the answer is
  compared with gradient descent started from w = 0.
*/

// A fixed pool of 10 examples with 4 small-integer features (seeded), and their targets.
const POOL = (() => {
  const r = mulberry32(13)
  const rows = Array.from({ length: 10 }, () => Array.from({ length: 4 }, () => Math.floor(r() * 6)))
  const y = rows.map((f) => Math.round((1 + 2 * f[0] - f[1] + 0.5 * f[2] + 0.3 * f[3] + (r() - 0.5) * 2) * 10) / 10)
  return { rows, y }
})()

const STEP_TITLES = ['Predictions ŷ = Xw', 'Transpose X', 'Multiply XᵀX', 'Multiply Xᵀy', 'Invert XᵀX', 'Solve for w']

type Item =
  | {
      kind: 'mat'
      name: string
      r: number
      c: number
      color: string
      matchTop?: boolean
      matchLeft?: boolean
    }
  | { kind: 'op'; text: string }

function gdSteps(X: Mat, y: Vec, target: Vec, cap = 200000) {
  const n = y.length
  const Xt = transpose(X)
  const H = matmul(Xt, X).map((r) => r.map((v) => (2 / n) * v))
  const top = Math.max(...symEig(H).values)
  const lr = 1 / top
  let w = new Array(X[0].length).fill(0)
  for (let k = 1; k <= cap; k++) {
    const e = matvec(X, w).map((p, i) => p - y[i])
    const g = matvec(Xt, e).map((v) => (2 / n) * v)
    w = w.map((wi, i) => wi - lr * g[i])
    if (w.every((wi, i) => Math.abs(wi - target[i]) < 0.005)) return { steps: k, w }
  }
  return { steps: null, w }
}

/** Draws the blocks of one step, scaled so the whole equation fits the container. */
function ShapeEquation({ items, width }: { items: Item[]; width: number }) {
  const opW = 26
  const badW = 110
  const minSlot = 46
  const mats = items.filter((i): i is Extract<Item, { kind: 'mat' }> => i.kind === 'mat')
  const opsW = items.reduce((t, i) => t + (i.kind === 'op' ? (i.text.startsWith('✗') ? badW : opW) : 0), 0)
  let cs = 28
  const total = (s: number) => mats.reduce((t, m) => t + Math.max(m.c * s, minSlot), 0) + opsW + (items.length - 1) * 4
  while (cs > 5 && total(cs) > width - 8) cs -= 0.5
  const maxRows = Math.max(...mats.map((m) => m.r))
  const top = 16
  const H = top + maxRows * cs + 40
  const W = Math.min(width, total(cs) + 8)
  let x = (W - total(cs)) / 2
  const midY = top + (maxRows * cs) / 2
  const nodes: ReactNode[] = []
  items.forEach((it, idx) => {
    if (it.kind === 'op') {
      const bad = it.text.startsWith('✗')
      const w = bad ? badW : opW
      nodes.push(
        <text
          key={idx}
          x={x + w / 2}
          y={midY}
          dy="0.35em"
          textAnchor="middle"
          style={{
            fill: bad ? 'var(--viz-neg)' : 'var(--ink-2)',
            fontSize: bad ? 15 : 18,
            fontWeight: 700,
          }}
        >
          {it.text}
        </text>,
      )
      x += w + 4
      return
    }
    const slot = Math.max(it.c * cs, minSlot)
    const bw = it.c * cs
    const bh = it.r * cs
    const bx = x + (slot - bw) / 2
    const by = midY - bh / 2
    const lines: ReactNode[] = []
    for (let i = 1; i < it.r; i++) lines.push(<line key={`r${i}`} x1={bx} x2={bx + bw} y1={by + i * cs} y2={by + i * cs} />)
    for (let j = 1; j < it.c; j++) lines.push(<line key={`c${j}`} y1={by} y2={by + bh} x1={bx + j * cs} x2={bx + j * cs} />)
    nodes.push(
      <g key={idx}>
        <rect
          x={bx}
          y={by}
          width={bw}
          height={bh}
          rx={2}
          style={{
            fill: `color-mix(in srgb, ${it.color} 16%, var(--surface))`,
            stroke: it.color,
            strokeWidth: 1.5,
          }}
        />
        <g
          style={{
            stroke: `color-mix(in srgb, ${it.color} 40%, var(--surface))`,
            strokeWidth: 0.75,
          }}
        >
          {lines}
        </g>
        {it.matchTop && <line x1={bx} x2={bx + bw} y1={by - 4} y2={by - 4} style={{ stroke: 'var(--viz-2)', strokeWidth: 3.5 }} strokeLinecap="round" />}
        {it.matchLeft && <line x1={bx - 4} x2={bx - 4} y1={by} y2={by + bh} style={{ stroke: 'var(--viz-2)', strokeWidth: 3.5 }} strokeLinecap="round" />}
        <text x={x + slot / 2} y={top + maxRows * cs + 17} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 700 }}>
          {it.name}
        </text>
        <text
          x={x + slot / 2}
          y={top + maxRows * cs + 33}
          textAnchor="middle"
          style={{
            fill: 'var(--ink-3)',
            fontSize: 12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {it.r}×{it.c}
        </text>
      </g>,
    )
    x += slot + 4
  })
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      role="img"
      aria-label={mats.map((m) => `${m.name} is ${m.r} by ${m.c}`).join(', ')}
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {nodes}
    </svg>
  )
}

const fmt = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2))
const vecStr = (v: Vec) => `[${v.map((x) => (Math.abs(x) < 0.005 ? '0.00' : x.toFixed(2))).join(', ')}]`

export default function NormalEquationShapes() {
  const [n, setN] = useState(6)
  const [d, setD] = useState(3)
  const [dup, setDup] = useState(false)
  const player = usePlayer({ steps: 6, interval: 2600 })
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(520)
  const s = player.step

  const D = d + (dup ? 1 : 0)
  const calc = useMemo(() => {
    const X = POOL.rows.slice(0, n).map((f) => [1, ...f.slice(0, d - 1), ...(dup ? [f[0]] : [])])
    const y = POOL.y.slice(0, n)
    const Xt = transpose(X)
    const XtX = matmul(Xt, X)
    const Xty = matvec(Xt, y)
    const dt = det(XtX)
    const rk = rank(X)
    const wNE = dt !== 0 ? solve(XtX, Xty) : null
    const wPinv = pinvSolve(X, y)
    const gd = gdSteps(X, y, wNE ?? wPinv)
    return { X, y, Xt, XtX, Xty, dt, rk, wNE, wPinv, gd }
  }, [n, d, dup])
  const singular = calc.wNE === null

  const C = {
    X: 'var(--viz-1)',
    y: 'var(--viz-3)',
    G: 'var(--viz-5)',
    g: 'var(--viz-6)',
    w: 'var(--viz-4)',
  }
  const items: Item[][] = [
    [
      { kind: 'mat', name: 'X', r: n, c: D, color: C.X, matchTop: true },
      { kind: 'op', text: '×' },
      { kind: 'mat', name: 'w', r: D, c: 1, color: C.w, matchLeft: true },
      { kind: 'op', text: '=' },
      { kind: 'mat', name: 'ŷ', r: n, c: 1, color: C.y },
    ],
    [
      { kind: 'mat', name: 'X', r: n, c: D, color: C.X },
      { kind: 'op', text: '→' },
      { kind: 'mat', name: 'Xᵀ', r: D, c: n, color: C.X },
    ],
    [
      { kind: 'mat', name: 'Xᵀ', r: D, c: n, color: C.X, matchTop: true },
      { kind: 'op', text: '×' },
      { kind: 'mat', name: 'X', r: n, c: D, color: C.X, matchLeft: true },
      { kind: 'op', text: '=' },
      { kind: 'mat', name: 'XᵀX', r: D, c: D, color: C.G },
    ],
    [
      { kind: 'mat', name: 'Xᵀ', r: D, c: n, color: C.X, matchTop: true },
      { kind: 'op', text: '×' },
      { kind: 'mat', name: 'y', r: n, c: 1, color: C.y, matchLeft: true },
      { kind: 'op', text: '=' },
      { kind: 'mat', name: 'Xᵀy', r: D, c: 1, color: C.g },
    ],
    singular
      ? [
          { kind: 'mat', name: 'XᵀX', r: D, c: D, color: C.G },
          { kind: 'op', text: '→' },
          { kind: 'op', text: '✗ no inverse' },
        ]
      : [
          { kind: 'mat', name: 'XᵀX', r: D, c: D, color: C.G },
          { kind: 'op', text: '→' },
          { kind: 'mat', name: '(XᵀX)⁻¹', r: D, c: D, color: C.G },
        ],
    singular
      ? [
          {
            kind: 'mat',
            name: 'pinv(X)',
            r: D,
            c: n,
            color: C.G,
            matchTop: true,
          },
          { kind: 'op', text: '×' },
          { kind: 'mat', name: 'y', r: n, c: 1, color: C.y, matchLeft: true },
          { kind: 'op', text: '=' },
          { kind: 'mat', name: 'w', r: D, c: 1, color: C.w },
        ]
      : [
          {
            kind: 'mat',
            name: '(XᵀX)⁻¹',
            r: D,
            c: D,
            color: C.G,
            matchTop: true,
          },
          { kind: 'op', text: '×' },
          { kind: 'mat', name: 'Xᵀy', r: D, c: 1, color: C.g, matchLeft: true },
          { kind: 'op', text: '=' },
          { kind: 'mat', name: 'w', r: D, c: 1, color: C.w },
        ],
  ]

  const inner = (a: string, b: string, k: number, c: string) => (
    <>
      ({a}×<b style={{ color: 'var(--viz-2)' }}>{k}</b>) times (<b style={{ color: 'var(--viz-2)' }}>{k}</b>×{b}) gives {a}×{b}
      {c}
    </>
  )
  const text: ReactNode[] = [
    <>
      Each prediction is one row of X times the column w. The orange edges must have the same length ({D}): one weight per column of X.{' '}
      {inner(String(n), '1', D, '.')}
    </>,
    <>
      The transpose Xᵀ flips X over its diagonal: row i becomes column i. An {n}×{D} table becomes {D}×{n}.
    </>,
    <>
      {inner(String(D), String(D), n, '.')} The {n} examples are summed away, so XᵀX is a small {D}×{D} square however many rows of data you have. It is
      symmetric: entry (i, j) = entry (j, i).
    </>,
    <>{inner(String(D), '1', n, '.')} Entry j adds up (feature j × target) over all examples.</>,
    singular ? (
      <>
        <b style={{ color: 'var(--viz-neg)' }}>No inverse.</b> det(XᵀX) = 0 because the columns of X are not independent: its rank is {calc.rk} but it has {D}{' '}
        columns
        {dup ? ', and the last column copies x₁' : n < D ? `, with only ${n} rows to pin down ${D} weights` : ''}. Infinitely many w fit the data equally well.
      </>
    ) : (
      <>det(XᵀX) = {fmt(calc.dt)} ≠ 0, so the inverse exists. Try adding a duplicate column, or making n smaller than d, to break it.</>
    ),
    singular ? (
      <>
        (XᵀX)⁻¹ does not exist, but the <b>pseudoinverse</b> pinv(X), a {D}×{n} matrix, still gives one answer: the best-fitting w with the smallest length.
        Gradient descent started from w = 0 lands on that same w.
      </>
    ) : (
      <>{inner(String(D), '1', D, ':')} one weight per column of X. Gradient descent reaches the same w; the normal equation just jumps there in one go.</>
    ),
  ]

  const num: ReactNode = (() => {
    const box = (label: string, data: (number | string)[][], cell = 34, extra?: Partial<Parameters<typeof MatrixGrid>[0]>) => (
      <MatrixGrid label={label} data={data} format={fmt} cellSize={cell} {...extra} />
    )
    if (s === 0)
      return (
        <>
          {box('X', calc.X, 34)}
          {box(
            'y',
            calc.y.map((v) => [v]),
            34,
            { format: (v: number) => v.toFixed(1) },
          )}
        </>
      )
    if (s === 1) return box('Xᵀ', calc.Xt, 26)
    if (s === 2 || s === 4) return box('XᵀX', calc.XtX, D > 4 ? 38 : 42)
    if (s === 3)
      return box(
        'Xᵀy',
        calc.Xty.map((v) => [v]),
        52,
        { format: (v: number) => v.toFixed(1) },
      )
    return box(
      singular ? 'w = pinv(X) y' : 'w',
      (calc.wNE ?? calc.wPinv).map((v) => [v]),
      56,
      { format: (v: number) => v.toFixed(3) },
    )
  })()

  return (
    <Figure
      title="The normal equation, shape by shape"
      caption={
        <>
          Press <b>Play</b> (or Next) to build <M>{'w = (X^\\top X)^{-1} X^\\top y'}</M> one product at a time. The orange edges show the inner sizes that must
          match. Then change <b>n</b> and <b>d</b>: the result XᵀX is always d×d. Finally switch on the duplicate column, or drag n below d, and watch det(XᵀX)
          drop to 0.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{
          width: '100%',
          display: 'grid',
          justifyItems: 'center',
          gap: 10,
        }}
      >
        <ShapeEquation items={items[s]} width={width} />
        <p
          style={{
            margin: 0,
            fontSize: 'var(--step--1)',
            color: 'var(--ink-2)',
            lineHeight: 1.5,
            maxWidth: 560,
            textAlign: 'center',
          }}
        >
          <b style={{ color: 'var(--ink)' }}>
            Step {s + 1}. {STEP_TITLES[s]}.
          </b>{' '}
          {text[s]}
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            justifyContent: 'center',
            alignItems: 'flex-start',
            maxWidth: '100%',
          }}
        >
          {num}
        </div>
      </div>
      <PlayerControls player={player} label={(k) => `${k + 1}/6 · ${STEP_TITLES[k]}`} />
      <Controls>
        <Slider label="n: rows (examples)" value={n} min={2} max={10} onChange={setN} />
        <Slider label="d: columns of X (incl. the 1s)" value={d} min={2} max={5} onChange={setD} />
        <Toggle label="Add a duplicate of column x₁" checked={dup} onChange={setDup} />
      </Controls>
      <Readout
        items={[
          ['X is', `${n}×${D}`],
          ['det(XᵀX)', singular ? '0 (singular)' : fmt(calc.dt)],
          [singular ? 'pinv answer w' : 'normal equation w', vecStr(calc.wNE ?? calc.wPinv)],
          [
            'gradient descent from w = 0',
            calc.gd.steps ? `same w (±0.005) after ${calc.gd.steps.toLocaleString('en-GB')} steps` : 'still creeping after 200,000 steps',
          ],
        ]}
      />
    </Figure>
  )
}
