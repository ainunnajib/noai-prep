import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Slider, Readout, useNarrow } from '../../../../../kit'
import { cellStyle, OutputBox } from '../vectorised-ops-and-axes/Cells'

/*
  The classic silent bug: pred has shape (n, 1) (a column, e.g. from X @ w with w of shape (d, 1))
  while y has shape (n,). pred - y broadcasts to an (n, n) grid of every prediction minus every
  target, and np.mean(err ** 2) returns a plausible but wrong number. Only the diagonal holds the
  real errors.
*/

const Y_ALL = [3, 5, 2, 6, 4, 7, 1, 5]
const P_ALL = [4, 5, 1, 6, 4, 6, 2, 5]

type Mode = 'flat' | 'column' | 'fixed'

const fmtLoss = (v: number) => {
  const r = Math.round(v * 10000) / 10000
  return Number.isInteger(r) ? `${r}.0` : String(r)
}

export default function SilentBroadcastGrid() {
  const [mode, setMode] = useState<Mode>('column')
  const [n, setN] = useState(4)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const y = Y_ALL.slice(0, n)
  const p = P_ALL.slice(0, n)
  const size = narrow ? (n > 6 ? 28 : 32) : 38
  const gap = 3

  const right = y.map((yv, i) => p[i] - yv)
  const correctLoss = right.reduce((s, e) => s + e * e, 0) / n
  const grid = p.map((pv) => y.map((yv) => pv - yv))
  const wrongLoss = grid.flat().reduce((s, e) => s + e * e, 0) / (n * n)
  const loss = mode === 'column' ? wrongLoss : correctLoss
  const outShape = mode === 'column' ? `(${n}, ${n})` : mode === 'flat' ? `(${n},)` : `(${n}, 1)`
  const entries = mode === 'column' ? n * n : n

  const head: CSSProperties = { fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }
  const cell = (v: number | string, tone: Parameters<typeof cellStyle>[0], strong = false, key?: string): ReactNode => (
    <div key={key} role="cell" style={{ ...cellStyle(tone, size, strong), fontSize: '0.8rem' }}>
      {v}
    </div>
  )

  let picture: ReactNode
  if (mode === 'column') {
    picture = (
      <div role="table" aria-label={`pred minus y gives a ${n} by ${n} grid`} style={{ display: 'grid', gridTemplateColumns: `auto repeat(${n}, ${size}px)`, gap, alignItems: 'center' }}>
        <div style={{ ...head, color: 'var(--ink-3)', textAlign: 'right', paddingRight: 6, fontSize: '0.72rem' }}>
          pred ↓ &nbsp;y →
        </div>
        {y.map((v, j) => cell(v, 'b', false, `y${j}`))}
        {p.map((pv, i) => (
          <div key={`row${i}`} style={{ display: 'contents' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 6 }}>{cell(pv, 'a')}</div>
            {grid[i].map((e, j) => cell(e, i === j ? 'c' : 'bad', i === j, `g${i}${j}`))}
          </div>
        ))}
      </div>
    )
  } else if (mode === 'flat') {
    picture = (
      <div role="table" aria-label="pred minus y, position by position" style={{ display: 'grid', gridTemplateColumns: `auto repeat(${n}, ${size}px)`, gap, alignItems: 'center' }}>
        <div style={{ ...head, color: 'var(--viz-1)', paddingRight: 6, textAlign: 'right' }}>pred</div>
        {p.map((v, j) => cell(v, 'a', false, `p${j}`))}
        <div style={{ ...head, color: 'var(--viz-2)', paddingRight: 6, textAlign: 'right' }}>y</div>
        {y.map((v, j) => cell(v, 'b', false, `y${j}`))}
        <div style={{ ...head, color: 'var(--viz-3)', paddingRight: 6, textAlign: 'right' }}>pred − y</div>
        {right.map((v, j) => cell(v, 'c', true, `e${j}`))}
      </div>
    )
  } else {
    picture = (
      <div role="table" aria-label="pred minus y as two columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 88px)', gap, justifyItems: 'center', alignItems: 'end' }}>
        <div style={{ ...head, color: 'var(--viz-1)', fontFamily: 'var(--font-mono)' }}>pred</div>
        <div style={{ ...head, color: 'var(--viz-2)', fontFamily: 'var(--font-mono)' }}>y[:, None]</div>
        <div style={{ ...head, color: 'var(--viz-3)', fontFamily: 'var(--font-mono)', whiteSpace: 'normal', textAlign: 'center' }}>pred − y[:, None]</div>
        {p.map((pv, i) => (
          <div key={`r${i}`} style={{ display: 'contents' }}>
            {cell(pv, 'a')}
            {cell(y[i], 'b')}
            {cell(right[i], 'c', true)}
          </div>
        ))}
      </div>
    )
  }

  const code =
    mode === 'column'
      ? `err = pred - y         # shape (${n}, ${n}) !!\nloss = np.mean(err ** 2) # ${fmtLoss(wrongLoss)}\n# but the true MSE is ${fmtLoss(correctLoss)}`
      : mode === 'flat'
        ? `err = pred - y         # shape (${n},)\nloss = np.mean(err ** 2) # ${fmtLoss(correctLoss)}`
        : `err = pred - y[:, None] # shape (${n}, 1)\nloss = np.mean(err ** 2) # ${fmtLoss(correctLoss)}`

  return (
    <Figure
      title="The silent (n, 1) − (n,) bug"
      caption={
        <>
          Switch the shape of <code>pred</code>. When it is a column <code>(n, 1)</code> and <code>y</code> is flat <code>(n,)</code>, NumPy does not
          complain: it stretches both into an n × n grid of <em>every</em> prediction minus <em>every</em> target. Only the green diagonal pairs a
          prediction with its own target; the red cells are nonsense, yet they are averaged into the loss. Drag n and watch the grid grow as n².
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.85rem' }}>
        <Controls>
          <Segmented
            label="Shape of pred (y is always (n,))"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'flat', label: '(n,)' },
              { value: 'column', label: '(n, 1)' },
              { value: 'fixed', label: '(n, 1) with y[:, None]' },
            ]}
          />
        </Controls>
        <div style={{ maxWidth: '100%', overflowX: 'auto', padding: 2 }}>{picture}</div>
        <Readout
          items={[
            ['result shape', <span key="s" style={{ color: mode === 'column' ? 'var(--viz-neg)' : 'var(--viz-pos)' }}>{outShape}</span>],
            ['numbers averaged', String(entries)],
            ['loss', <span key="l" style={{ color: mode === 'column' ? 'var(--viz-neg)' : 'var(--viz-pos)' }}>{fmtLoss(loss)}</span>],
            ['true MSE', fmtLoss(correctLoss)],
          ]}
        />
        <OutputBox tone={mode === 'column' ? 'bad' : 'ok'} nowrap small={narrow}>{code}</OutputBox>
        <Controls>
          <Slider label="n (number of examples)" value={n} min={2} max={8} step={1} onChange={setN} />
        </Controls>
      </div>
    </Figure>
  )
}

