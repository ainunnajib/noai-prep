import { useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Toggle, Button, useContainerWidth } from '../../../../../kit'
import { matmulShape } from './matmulShape'
import css from './tensors.module.css'

/*
  Shape chips for A @ B and the result. Batch dims (purple) are matched by broadcasting; only the
  last two dims take part in the matrix product: rows of A (indigo), the shared inner size
  (orange) and columns of B (green). Edit any size, toggle .transpose(-2, -1), and the result or
  PyTorch's real error appears. The diagram draws one of the many small products.
*/

interface Preset {
  label: string
  a: number[]
  b: number[]
  an: string
  bn: string
  tb: boolean
  story: string
}

const PRESETS: Preset[] = [
  { label: '8 products at once', a: [8, 5, 3], b: [8, 3, 2], an: 'A', bn: 'B', tb: false, story: 'A holds 8 matrices of size 5 × 3 and B holds 8 matrices of size 3 × 2. A @ B multiplies them in pairs: 8 separate products in one call.' },
  {
    label: 'attention scores',
    a: [2, 4, 5, 16],
    b: [2, 4, 5, 16],
    an: 'Q',
    bn: 'K',
    tb: true,
    story: 'Q and K are two stacks of token vectors, (B, h, T, d) = (2 sentences, 4 heads, 5 tokens, 16 numbers per token). Every token in Q is compared with every token in K.',
  },
  { label: 'attention output', a: [2, 4, 5, 5], b: [2, 4, 5, 16], an: 'weights', bn: 'V', tb: false, story: 'The (B, h, T, T) weights (one row of 5 weights per token) mix the rows of V, which is (B, h, T, d).' },
  { label: 'one weight, many sequences', a: [6, 3, 4], b: [4, 2], an: 'X', bn: 'W', tb: false, story: 'X holds 6 sequences of 3 tokens with 4 features; the same W is used for every sequence.' },
  { label: 'Linear by hand', a: [4, 3], b: [2, 3], an: 'x', bn: 'W', tb: true, story: 'x is a batch of 4 inputs with 3 features; nn.Linear(3, 2) stores W as (out, in) = (2, 3), so it computes x @ W.T.' },
  { label: 'broadcast a 1', a: [2, 1, 3, 4], b: [5, 4, 6], an: 'A', bn: 'B', tb: false, story: 'A size-1 batch dim (or a missing one) is stretched to match the other tensor.' },
]

const COL = { batch: 'var(--viz-5)', m: 'var(--viz-1)', k: 'var(--viz-2)', n: 'var(--viz-3)', bad: 'var(--viz-neg)' }

const swapLast = (s: number[]) => [...s.slice(0, -2), s[s.length - 1], s[s.length - 2]]

export default function BatchedMatmulShapes() {
  const [pi, setPi] = useState(0)
  const [a, setA] = useState(PRESETS[0].a)
  const [b, setB] = useState(PRESETS[0].b)
  const [ta, setTa] = useState(false)
  const [tb, setTb] = useState(PRESETS[0].tb)
  const [ref, w] = useContainerWidth<HTMLDivElement>(520)
  const p = PRESETS[pi]

  const choose = (i: number) => {
    setPi(i)
    setA(PRESETS[i].a)
    setB(PRESETS[i].b)
    setTa(false)
    setTb(PRESETS[i].tb)
  }

  const ea = ta ? swapLast(a) : a
  const eb = tb ? swapLast(b) : b
  const r = matmulShape(ea, eb)
  const L = Math.max(ea.length, eb.length, r.shape?.length ?? 0)

  // edit the underlying size behind effective position i (undo the transpose mapping)
  const edit = (which: 'a' | 'b', i: number, delta: number) => {
    const base = which === 'a' ? a : b
    const t = which === 'a' ? ta : tb
    const n = base.length
    const j = t && i >= n - 2 ? (i === n - 1 ? n - 2 : n - 1) : i
    const next = base.slice()
    next[j] = Math.max(1, Math.min(16, next[j] + delta))
    ;(which === 'a' ? setA : setB)(next)
  }
  const addDim = (which: 'a' | 'b', delta: number) => {
    const base = which === 'a' ? a : b
    if (delta > 0 && base.length < 4) (which === 'a' ? setA : setB)([2, ...base])
    if (delta < 0 && base.length > 2) (which === 'a' ? setA : setB)(base.slice(1))
  }

  const role = (which: 'a' | 'b' | 'r', i: number, len: number): keyof typeof COL => {
    if (i < len - 2) return 'batch'
    if (which === 'a') return i === len - 2 ? 'm' : 'k'
    if (which === 'b') return i === len - 2 ? 'k' : 'n'
    return i === len - 2 ? 'm' : 'n'
  }
  const isBad = (which: 'a' | 'b', i: number, len: number) => {
    const rl = role(which, i, len)
    if (rl === 'k' && r.innerBad) return true
    if (rl === 'batch' && r.badBatch != null) {
      const Lb = Math.max(ea.length, eb.length) - 2
      return i - (len - 2) + Lb === r.badBatch
    }
    return false
  }

  const chipRow = (which: 'a' | 'b' | 'r', shape: number[] | undefined, title: ReactNode, sub?: ReactNode) => {
    const len = shape?.length ?? 0
    return (
      <div style={{ display: 'contents' }}>
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: which === 'a' ? 0 : 6 }}>
          <span className={css.mono} style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink)' }}>
            {title}
          </span>
          {sub && <span style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginLeft: 8 }}>{sub}</span>}
        </div>
        {Array.from({ length: L }, (_, col) => {
          const i = col - (L - len)
          if (!shape || i < 0) return <div key={col} />
          const rl = role(which, i, len)
          const bad = which !== 'r' && isBad(which, i, len)
          const c = bad ? COL.bad : COL[rl]
          return (
            <div key={col} style={{ display: 'grid', justifyItems: 'center', gap: 1 }}>
              {which !== 'r' && (
                <button type="button" className={`btn btn-small ${css.stepBtn}`} style={stepBtn} onClick={() => edit(which, i, 1)} aria-label={`increase size ${i} of ${which === 'a' ? p.an : p.bn}`}>
                  ▲
                </button>
              )}
              <span className={css.chip} style={{ color: c, minWidth: '1.9rem', boxShadow: bad ? `0 0 0 3px color-mix(in srgb, ${COL.bad} 30%, transparent)` : undefined }}>
                <span className={css.chipNum}>{shape[i]}</span>
                <span className={css.chipName}>{rl === 'batch' ? 'batch' : rl}</span>
              </span>
              {which !== 'r' && (
                <button type="button" className={`btn btn-small ${css.stepBtn}`} style={stepBtn} onClick={() => edit(which, i, -1)} aria-label={`decrease size ${i} of ${which === 'a' ? p.an : p.bn}`}>
                  ▼
                </button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const m = ea[ea.length - 2]
  const k = ea[ea.length - 1]
  const kb = eb[eb.length - 2]
  const n = eb[eb.length - 1]
  const P = r.shape ? r.batch.reduce((x, y) => x * y, 1) : 0

  return (
    <Figure
      title="Batched matmul: which dims multiply?"
      caption={
        <>
          Only the <b>last two</b> dims take part in the matrix product: (rows <M c="m" />, inner <M c="k" />) @ (inner <M c="k" />, columns{' '}
          <M c="n" />) gives (<M c="m" />, <M c="n" />), and the two orange sizes must be equal. The purple batch dims are lined up from the right and
          must be equal, 1, or missing. Start with 8 products at once, then pick attention scores. Click ▲▼ to change sizes, switch <code>.transpose(-2, -1)</code> on and off, and read the real PyTorch error when it
          breaks.
        </>
      }
    >
      <Controls>
        <div className={css.segGridWide}>
          <Segmented label="Scenario" value={pi} onChange={choose} options={PRESETS.map((x, i) => ({ value: i, label: x.label }))} />
        </div>
      </Controls>
      <div className={css.note}>{p.story}</div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${L}, max-content)`,
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px 6px',
          width: '100%',
        }}
      >
        {chipRow('a', ea, ta ? `${p.an}.transpose(-2, -1)` : p.an, ta ? `${p.an}.shape = (${a.join(', ')})` : undefined)}
        {chipRow('b', eb, <>@ {tb ? `${p.bn}.transpose(-2, -1)` : p.bn}</>, tb ? `${p.bn}.shape = (${b.join(', ')})` : undefined)}
        {chipRow('r', r.shape, r.shape ? '= result' : '= error', undefined)}
      </div>
      {!r.shape && (
        <div className={css.error} role="alert">
          {r.error}
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--ink-2)', marginTop: 4 }}>
            {r.innerBad ? (
              <>
                The inner sizes disagree: {p.an}'s last dim is {k}, but {p.bn}'s second-to-last dim is {kb}.
                {ea.length >= 2 && eb.length >= 2 && ea[ea.length - 1] === eb[eb.length - 1] && !tb ? <> Try <code>.transpose(-2, -1)</code> on {p.bn}.</> : null}
              </>
            ) : (
              <>A batch dim pair differs and neither is 1, so the batches cannot be paired up.</>
            )}
          </div>
        </div>
      )}

      <Controls>
        <Toggle label={<code>{p.an}.transpose(-2, -1)</code>} checked={ta} onChange={setTa} />
        <Toggle label={<code>{p.bn}.transpose(-2, -1)</code>} checked={tb} onChange={setTb} />
      </Controls>
      <div className={css.row} style={{ fontSize: '0.82rem', color: 'var(--ink-2)', gap: '0.4rem 0.9rem' }}>
        <span style={{ fontWeight: 700 }}>Batch dims:</span>
        {(['a', 'b'] as const).map((which) => {
          const base = which === 'a' ? a : b
          return (
            <span key={which} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              <code>{which === 'a' ? p.an : p.bn}</code>
              <Button onClick={() => addDim(which, -1)} disabled={base.length <= 2}>
                − remove
              </Button>
              <Button onClick={() => addDim(which, 1)} disabled={base.length >= 4}>
                + add
              </Button>
            </span>
          )
        })}
      </div>

      <div ref={ref} style={{ width: '100%' }}>
        <ProductDiagram m={m} k={k} kb={kb} n={n} count={r.shape ? Math.max(1, P) : 0} ok={!!r.shape} innerBad={!!r.innerBad} avail={Math.min(w, 560)} />
      </div>
      {r.shape && (
        <div className={css.note} style={{ textAlign: 'center' }}>
          {r.batch.length ? (
            <>
              {r.batch.join(' × ')} = <b>{P}</b> separate products, each ({m} × {k}) @ ({k} × {n}) → ({m} × {n}), all computed in one call.
            </>
          ) : (
            <>
              One ({m} × {k}) @ ({k} × {n}) product → ({m} × {n}).
            </>
          )}
          {eb.length === 2 && ea.length > 2 ? <> The same 2-D {p.bn} is reused for every batch entry.</> : null}
        </div>
      )}
    </Figure>
  )
}

const stepBtn = { padding: '0.15rem 0.55rem', minHeight: 0, minWidth: 34, lineHeight: 1.3, fontSize: '0.75rem' }

function M({ c }: { c: 'm' | 'k' | 'n' }) {
  return <b style={{ color: COL[c], fontFamily: 'var(--font-mono)' }}>{c}</b>
}

/** Classic layout: B above the result, A to its left. Shadows behind show how many products run at once. */
function ProductDiagram({ m, k, kb, n, count, ok, innerBad, avail }: { m: number; k: number; kb: number; n: number; count: number; ok: boolean; innerBad: boolean; avail: number }) {
  const s = Math.max(8, Math.min(16, Math.floor((avail - 70) / (k + n + 2))))
  const g = 18
  const stack = count > 1 ? 2 : 0
  const off = 4
  const ax = 48
  const top = 18
  const bx = ax + k * s + g
  const by = top + stack * off
  const cy = by + kb * s + g
  // room on the right for the longer of the two labels there ('k=16', '×32'): about 8 px per character at 12 px
  const rightLabel = Math.max(`k=${kb}`.length, count > 1 ? `×${count}`.length : 0)
  const width = bx + n * s + stack * off + 10 + 8 * rightLabel
  const height = cy + m * s + 26
  const grid = (x: number, y: number, rows: number, cols: number, colour: string, edge: string, key: string) => (
    <g key={key}>
      {stack > 0 &&
        [2, 1].map((q) => (
          <rect key={q} x={x + q * off} y={y - q * off} width={cols * s} height={rows * s} rx={3} style={{ fill: 'var(--surface-2)', stroke: colour, strokeWidth: 1, opacity: 0.6 }} />
        ))}
      <rect x={x} y={y} width={cols * s} height={rows * s} rx={3} style={{ fill: `color-mix(in srgb, ${colour} 16%, var(--surface))`, stroke: edge, strokeWidth: 2 }} />
      {Array.from({ length: rows - 1 }, (_, i) => (
        <line key={`r${i}`} x1={x} x2={x + cols * s} y1={y + (i + 1) * s} y2={y + (i + 1) * s} style={{ stroke: colour, strokeWidth: 0.6, opacity: 0.5 }} />
      ))}
      {Array.from({ length: cols - 1 }, (_, i) => (
        <line key={`c${i}`} y1={y} y2={y + rows * s} x1={x + (i + 1) * s} x2={x + (i + 1) * s} style={{ stroke: colour, strokeWidth: 0.6, opacity: 0.5 }} />
      ))}
    </g>
  )
  const innerEdge = innerBad ? COL.bad : COL.k
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }} role="img" aria-label={`One (${m} by ${k}) times (${kb} by ${n}) matrix product${count > 1 ? `, repeated ${count} times` : ''}`}>
      {grid(ax, cy, m, k, COL.m, innerEdge, 'A')}
      {grid(bx, by, kb, n, COL.n, innerEdge, 'B')}
      {ok ? grid(bx, cy, m, n, 'var(--viz-muted)', 'var(--viz-ink)', 'C') : null}
      {!ok && (
        <text x={bx + (n * s) / 2} y={cy + (m * s) / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 22, fontWeight: 800, fill: COL.bad }}>
          ?
        </text>
      )}
      {/* dimension labels */}
      <text className="plot-label" x={ax - 6} y={cy + (m * s) / 2} dy="0.35em" textAnchor="end" style={{ fill: COL.m }}>
        m={m}
      </text>
      <text className="plot-label" x={ax + (k * s) / 2} y={cy + m * s + 16} textAnchor="middle" style={{ fill: innerBad ? COL.bad : COL.k }}>
        k={k}
      </text>
      <text className="plot-label" x={bx + n * s + stack * off + 4} y={by + (kb * s) / 2} dy="0.35em" style={{ fill: innerBad ? COL.bad : COL.k }}>
        k={kb}
      </text>
      <text className="plot-label" x={bx + (n * s) / 2} y={by - stack * off - 5} textAnchor="middle" style={{ fill: COL.n }}>
        n={n}
      </text>
      {count > 1 && (
        <text className="plot-label" x={bx + n * s + stack * off + 4} y={cy + m * s} style={{ fill: 'var(--viz-5)' }}>
          ×{count}
        </text>
      )}
    </svg>
  )
}
