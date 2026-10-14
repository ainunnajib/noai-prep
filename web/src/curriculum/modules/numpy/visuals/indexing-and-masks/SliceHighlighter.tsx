import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Toggle } from '../../../../../kit'
import { npPrint, shapeStr, type Nested } from '../arrays-and-shapes/npFormat'
import { evaluate, R, C } from './sliceEval'

/*
  arr = np.arange(30).reshape(5, 6). Type or pick an indexing expression; the selected cells light
  up, and the result, its shape and exactly what print() shows appear below. Integers and slices
  follow Python's rules exactly (negative indices, steps, out-of-range stops).
*/

const val = (r: number, c: number) => r * C + c
const PRESETS = ['arr[2, 3]', 'arr[0]', 'arr[:, 0]', 'arr[1:3, ::2]', 'arr[-1]', 'arr[:, -2:]', 'arr[1:4, 2]', 'arr[0:1]', 'arr[::-1, 0]', 'arr[5, 0]']

const chip = (on: boolean): CSSProperties => ({
  fontFamily: 'var(--font-mono)',
  fontSize: '0.8rem',
  padding: '0.25rem 0.55rem',
  borderRadius: 999,
  border: `1.5px solid ${on ? 'var(--accent)' : 'var(--rule)'}`,
  background: on ? 'var(--accent-soft)' : 'var(--surface)',
  color: on ? 'var(--accent)' : 'var(--ink-2)',
  fontWeight: 700,
  cursor: 'pointer',
})

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

export default function SliceHighlighter() {
  const [expr, setExpr] = useState('arr[1:3, ::2]')
  const [neg, setNeg] = useState(false)
  const res = evaluate(expr)
  const ok = typeof res !== 'string'
  const on = (r: number, c: number) => ok && res.rows.includes(r) && res.cols.includes(c)

  let nested: Nested | null = null
  let shape: number[] = []
  if (ok) {
    const { rows, cols, keepRow, keepCol } = res
    if (keepRow && keepCol) {
      nested = rows.map((r) => cols.map((c) => val(r, c)))
      shape = [rows.length, cols.length]
    } else if (keepRow) {
      nested = rows.map((r) => val(r, cols[0]))
      shape = [rows.length]
    } else if (keepCol) {
      nested = cols.map((c) => val(rows[0], c))
      shape = [cols.length]
    } else {
      nested = val(rows[0], cols[0])
      shape = []
    }
  }
  const empty = ok && shape.some((d) => d === 0)
  const printed = nested === null ? '' : empty ? '[]' : npPrint(nested, false)

  const cell = 40
  const head: CSSProperties = { display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-3)', fontWeight: 700 }

  return (
    <Figure
      title="Slice explorer: which cells does it pick?"
      caption={
        <>
          The grid is <code>arr = np.arange(30).reshape(5, 6)</code>. Tap a preset or type your own expression. The first index chooses
          rows (axis 0), the second chooses columns (axis 1), and <code>:</code> means "all of them". Compare <code>arr[0]</code> with{' '}
          <code>arr[0:1]</code>: same cells, but an integer drops the axis while a slice keeps it.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', width: '100%' }}>
        {PRESETS.map((p) => (
          <button key={p} type="button" style={chip(p === expr)} onClick={() => setExpr(p)}>
            {p}
          </button>
        ))}
      </div>
      <label style={{ width: '100%', display: 'grid', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink-2)' }}>
        Type an expression
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          spellCheck={false}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', padding: '0.4rem 0.6rem', borderRadius: 8, border: `1.5px solid ${ok ? 'var(--accent-line)' : 'var(--bad)'}`, background: 'var(--surface)', color: 'var(--ink)', width: '100%', boxSizing: 'border-box' }}
        />
      </label>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)', textAlign: 'center' }}>
        row numbers (axis 0) down the side · column numbers (axis 1) across the top
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `28px repeat(${C}, ${cell}px)`, gap: 3, maxWidth: '100%' }} role="table" aria-label={`5 by 6 array with the cells selected by ${expr} highlighted`}>
        <div aria-hidden="true" />
        {Array.from({ length: C }, (_, c) => (
          <div key={`h${c}`} style={{ ...head, height: 22, color: ok && res.cols.includes(c) ? 'var(--accent)' : 'var(--ink-3)' }}>
            {neg ? c - C : c}
          </div>
        ))}
        {Array.from({ length: R }, (_, r) => (
          <div key={`r${r}`} style={{ display: 'contents' }}>
            <div style={{ ...head, color: ok && res.rows.includes(r) ? 'var(--accent)' : 'var(--ink-3)' }}>{neg ? r - R : r}</div>
            {Array.from({ length: C }, (_, c) => {
              const hit = on(r, c)
              return (
                <div
                  key={c}
                  role="cell"
                  style={{
                    height: cell,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    fontWeight: hit ? 800 : 500,
                    color: hit ? 'var(--ink)' : 'var(--ink-3)',
                    background: hit ? 'color-mix(in srgb, var(--viz-2) 30%, var(--surface))' : 'var(--surface-2)',
                    border: `1.5px solid ${hit ? 'var(--viz-2)' : 'transparent'}`,
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  {val(r, c)}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <Controls>
        <Toggle label="label rows and columns with negative indices" checked={neg} onChange={setNeg} />
      </Controls>
      {ok ? (
        <>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', width: '100%', fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>
            {res.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
          <div style={{ width: '100%' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '0.2rem' }}>print({expr.trim()}) shows</div>
            <pre style={pre}>{printed}</pre>
          </div>
          <Readout
            items={[
              ['result shape', shape.length === 0 ? '() : a single number' : shapeStr(shape)],
              ['ndim', String(shape.length)],
              ['elements', String(shape.reduce((a, b) => a * b, 1))],
            ]}
          />
        </>
      ) : (
        <div style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 8, background: 'var(--bad-soft)', color: 'var(--bad)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700 }}>
          {res}
        </div>
      )}
    </Figure>
  )
}
