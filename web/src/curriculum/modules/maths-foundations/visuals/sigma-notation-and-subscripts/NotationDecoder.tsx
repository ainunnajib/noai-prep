import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Segmented, M } from '../../../../../kit'

/*
  Subscripts are coordinates into a table. Rows are examples (superscript (i)), columns are features
  (subscript j), y is the true answer and ŷ the model's prediction. Hover or tap any symbol in the
  formula, or in the decoder row, to light up exactly the cells it refers to.
*/

type Formula = 'mean' | 'model' | 'mse'
interface Hl {
  cells?: [number, number][]
  rows?: number[]
  cols?: number[]
  theta?: number[]
  index?: boolean
}
interface Piece {
  tex: string
  key?: string
  desc?: string
  hl?: Hl
}

// columns: 0 = x1 (revision hours), 1 = x2 (sleep hours), 2 = y (score), 3 = ŷ (predicted score)
const DATA = [
  [2, 7, 55, 58],
  [5, 6, 72, 69],
  [8, 8, 90, 92],
  [5, 5, 67, 65],
]
const THETA = [20, 5, 4]
const M_ROWS = DATA.length
const COLS = [
  { tex: 'x_1', name: 'revision (h)' },
  { tex: 'x_2', name: 'sleep (h)' },
  { tex: 'y', name: 'score' },
  { tex: '\\hat{y}', name: 'predicted' },
]
const ALL_ROWS = [0, 1, 2, 3]

const DECODE: Piece[] = [
  { tex: 'x_2^{(3)}', key: 'd1', desc: 'x₂⁽³⁾ = 8. The superscript (3) picks example 3 (row 3); the subscript 2 picks feature 2 (sleep). The brackets say "label", not "power".', hl: { cells: [[2, 1]] } },
  { tex: 'x^{(3)}', key: 'd2', desc: 'x⁽³⁾ = [8, 8]: all the features of example 3, a whole row. It is a vector.', hl: { cells: [[2, 0], [2, 1]] } },
  { tex: 'x_1', key: 'd3', desc: 'x₁: feature 1 (revision hours). With no example index it means that whole column.', hl: { cols: [0] } },
  { tex: 'y^{(2)}', key: 'd4', desc: 'y⁽²⁾ = 72: the true answer (label) for example 2.', hl: { cells: [[1, 2]] } },
  { tex: '\\hat{y}^{(2)}', key: 'd5', desc: 'ŷ⁽²⁾ = 69: the model\'s prediction for example 2. The hat always means "predicted" or "estimated".', hl: { cells: [[1, 3]] } },
  { tex: 'm', key: 'd6', desc: 'm = 4: the number of examples (rows). Many books use n for this instead, so check the question.', hl: { index: true } },
  { tex: 'n', key: 'd7', desc: 'n = 2: the number of features (x columns) in this convention.', hl: { cols: [0, 1] } },
  { tex: '\\theta', key: 'd8', desc: 'θ (theta) = (θ₀, θ₁, θ₂) = (20, 5, 4): the parameters, the numbers the model learns. Some books call them w (weights) and b (bias).', hl: { theta: [0, 1, 2] } },
]

function formulaPieces(f: Formula, i: number, j: number): { pieces: Piece[]; worked: string; note?: string } {
  const r = i - 1
  const c = j - 1
  if (f === 'mean') {
    const col = DATA.map((row) => row[c])
    const mean = col.reduce((a, b) => a + b, 0) / M_ROWS
    return {
      pieces: [
        { tex: `\\bar{x}_{${j}}`, key: 'bar', desc: `x̄${j === 1 ? '₁' : '₂'}: the mean of feature ${j} (${COLS[c].name}). A bar on top means "average".`, hl: { cols: [c] } },
        { tex: '=' },
        { tex: '\\frac{1}{m}', key: 'm', desc: '1/m: divide by m = 4, the number of examples (rows).', hl: { index: true } },
        { tex: '\\sum_{i=1}^{m}', key: 'sum', desc: 'Σ from i = 1 to m: visit rows 1, 2, 3, 4 in turn and add up what follows.', hl: { cols: [c], index: true } },
        { tex: `x_{${j}}^{(i)}`, key: 'xji', desc: `x${j === 1 ? '₁' : '₂'}⁽ⁱ⁾: column ${j}, row i. As i runs from 1 to 4 it walks down column ${j}.`, hl: { cols: [c] } },
      ],
      worked: `= \\tfrac{1}{4}(${col.join(' + ')}) = ${mean}`,
    }
  }
  if (f === 'model') {
    const row = DATA[r]
    const pred = THETA[0] + THETA[1] * row[0] + THETA[2] * row[1]
    return {
      pieces: [
        { tex: `\\hat{y}^{(${i})}`, key: 'yhat', desc: `ŷ⁽${i}⁾: the model's predicted score for example ${i}. The hat means "predicted".`, hl: { cells: [[r, 3]] } },
        { tex: '=' },
        { tex: '\\theta_0', key: 't0', desc: 'θ₀ = 20: a learned parameter, the base score before any features are counted.', hl: { theta: [0] } },
        { tex: '+' },
        { tex: '\\theta_1', key: 't1', desc: 'θ₁ = 5: the learned weight for feature 1 (5 marks per hour of revision).', hl: { theta: [1] } },
        { tex: `x_1^{(${i})}`, key: 'x1', desc: `x₁⁽${i}⁾ = ${row[0]}: feature 1 (revision hours) of example ${i}.`, hl: { cells: [[r, 0]] } },
        { tex: '+' },
        { tex: '\\theta_2', key: 't2', desc: 'θ₂ = 4: the learned weight for feature 2 (4 marks per hour of sleep).', hl: { theta: [2] } },
        { tex: `x_2^{(${i})}`, key: 'x2', desc: `x₂⁽${i}⁾ = ${row[1]}: feature 2 (sleep hours) of example ${i}.`, hl: { cells: [[r, 1]] } },
      ],
      worked: `= 20 + 5 \\times ${row[0]} + 4 \\times ${row[1]} = ${pred}`,
      note: `(\\text{true } y^{(${i})} = ${row[2]})`,
    }
  }
  const sq = DATA.map((row) => (row[3] - row[2]) ** 2)
  const errs = DATA.map((row) => row[3] - row[2])
  return {
    pieces: [
      { tex: '\\text{MSE}', key: 'mse', desc: 'MSE, the mean squared error: the average of the squared prediction errors.', hl: { cols: [2, 3] } },
      { tex: '=' },
      { tex: '\\frac{1}{m}', key: 'm', desc: '1/m: divide by m = 4, the number of examples.', hl: { index: true } },
      { tex: '\\sum_{i=1}^{m}', key: 'sum', desc: 'Σ over i: one squared error per row, added up.', hl: { cols: [2, 3], index: true } },
      { tex: '\\big(\\hat{y}^{(i)}', key: 'yhat', desc: 'ŷ⁽ⁱ⁾: the prediction in row i.', hl: { cols: [3] } },
      { tex: '-' },
      { tex: 'y^{(i)}\\big)^2', key: 'y', desc: 'y⁽ⁱ⁾: the true score in row i. Subtract, then square, so errors of +3 and −3 both cost 9.', hl: { cols: [2] } },
    ],
    worked: `= \\tfrac{1}{4}\\big(${errs.map((e) => (e < 0 ? `(${e})^2` : `${e}^2`)).join(' + ')}\\big) = \\tfrac{${sq.reduce((a, b) => a + b, 0)}}{4} = ${sq.reduce((a, b) => a + b, 0) / 4}`,
  }
}

const union = (ps: Piece[]): Hl => {
  const out: Required<Hl> = { cells: [], rows: [], cols: [], theta: [], index: false }
  for (const p of ps) {
    if (!p.hl) continue
    out.cells.push(...(p.hl.cells ?? []))
    out.rows.push(...(p.hl.rows ?? []))
    out.cols.push(...(p.hl.cols ?? []))
    out.theta.push(...(p.hl.theta ?? []))
    out.index = out.index || Boolean(p.hl.index)
  }
  return out
}

const pieceBtn = (active: boolean): CSSProperties => ({
  font: 'inherit',
  fontSize: '1.15rem',
  color: 'var(--ink)',
  background: active ? 'color-mix(in srgb, var(--highlight) 50%, var(--surface))' : 'transparent',
  border: `1.5px solid ${active ? 'var(--highlight)' : 'color-mix(in srgb, var(--accent) 30%, transparent)'}`,
  borderRadius: 8,
  padding: '0.1rem 0.3rem',
  cursor: 'pointer',
})
const th: CSSProperties = { padding: '0.35rem 0.45rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', borderBottom: '1.5px solid var(--ink-3)', textAlign: 'center', lineHeight: 1.25 }

export default function NotationDecoder() {
  const [formula, setFormula] = useState<Formula>('model')
  const [i, setI] = useState(3)
  const [j, setJ] = useState(2)
  const [hover, setHover] = useState<string | null>(null)

  const { pieces, worked, note } = formulaPieces(formula, i, j)
  const all = [...pieces, ...DECODE]
  const hovered = hover ? all.find((p) => p.key === hover) : undefined
  const hl: Hl = hovered?.hl ?? union(pieces)
  const isOn = (r: number, c: number) => Boolean(hl.cells?.some(([a, b]) => a === r && b === c) || hl.rows?.includes(r) || hl.cols?.includes(c))

  const bind = (key: string) => ({
    onMouseEnter: () => setHover(key),
    onMouseLeave: () => setHover((h) => (h === key ? null : h)),
    onFocus: () => setHover(key),
    onBlur: () => setHover((h) => (h === key ? null : h)),
    onClick: () => setHover(key),
    'aria-pressed': hover === key,
  })

  const changeFormula = (f: Formula) => {
    setFormula(f)
    setHover(null)
  }

  return (
    <Figure
      title="Subscripts are coordinates in a data table"
      caption={
        <>
          Hover over (or tap) any part of the formula, or a symbol in the decoder row, and watch which cells light up. Switch formulas and change{' '}
          <M>{'i'}</M> or <M>{'j'}</M>: the superscript <M>{'(i)'}</M> always picks a row (an example), the subscript <M>{'j'}</M> picks a
          column (a feature), and a hat marks a prediction. A formula is just a recipe for walking over this table.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Formula"
          value={formula}
          onChange={changeFormula}
          options={[
            { value: 'mean', label: 'mean' },
            { value: 'model', label: 'linear model' },
            { value: 'mse', label: 'MSE' },
          ]}
        />
        {formula === 'model' && <Segmented label="example i" value={i} onChange={(v) => { setI(v); setHover(null) }} options={ALL_ROWS.map((r) => ({ value: r + 1, label: String(r + 1) }))} />}
        {formula === 'mean' && <Segmented label="feature j" value={j} onChange={(v) => { setJ(v); setHover(null) }} options={[{ value: 1, label: '1' }, { value: 2, label: '2' }]} />}
      </Controls>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
        {pieces.map((p, k) =>
          p.key ? (
            <button key={k} type="button" style={pieceBtn(hover === p.key)} {...bind(p.key)} aria-label={p.desc}>
              <M>{p.tex}</M>
            </button>
          ) : (
            <span key={k} style={{ fontSize: '1.15rem' }}>
              <M>{p.tex}</M>
            </span>
          ),
        )}
      </div>
      <div style={{ fontSize: '1rem', maxWidth: '100%', overflowX: 'auto', textAlign: 'center' }}>
        <M>{worked}</M>
        {note && (
          <>
            {' '}
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', marginLeft: '0.5em' }}>
              <M>{note}</M>
            </span>
          </>
        )}
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: '3px', margin: '0 auto', fontVariantNumeric: 'tabular-nums' }}>
          <thead>
            <tr>
              <th style={{ ...th, background: hl.index ? 'color-mix(in srgb, var(--highlight) 45%, var(--surface))' : undefined, borderRadius: 6 }}>
                example
                <br />
                <M>{'i'}</M>
              </th>
              {COLS.map((c, ci) => (
                <th key={ci} style={th}>
                  <M>{c.tex}</M>
                  <br />
                  <span style={{ fontWeight: 500, fontSize: '0.75rem' }}>{c.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA.map((row, r) => (
              <tr key={r}>
                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--ink-2)', padding: '0.3rem 0.5rem', borderRadius: 6, background: hl.index ? 'color-mix(in srgb, var(--highlight) 45%, var(--surface))' : 'transparent' }}>{r + 1}</td>
                {row.map((v, c) => {
                  const on = isOn(r, c)
                  return (
                    <td
                      key={c}
                      style={{
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: on ? 700 : 500,
                        padding: '0.3rem 0.6rem',
                        borderRadius: 6,
                        color: 'var(--ink)',
                        background: on ? 'color-mix(in srgb, var(--highlight) 55%, var(--surface))' : c >= 2 ? 'color-mix(in srgb, var(--viz-3) 9%, var(--surface))' : 'var(--surface-2)',
                        border: `1.5px solid ${on ? 'var(--highlight)' : 'transparent'}`,
                        transition: 'background 0.15s',
                      }}
                    >
                      {v}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>parameters</span>
        {THETA.map((t, k) => {
          const on = Boolean(hl.theta?.includes(k))
          return (
            <span key={k} style={{ padding: '0.15rem 0.5rem', borderRadius: 6, background: on ? 'color-mix(in srgb, var(--highlight) 55%, var(--surface))' : 'var(--surface-2)', border: `1.5px solid ${on ? 'var(--highlight)' : 'var(--rule)'}` }}>
              <M>{`\\theta_${k} = ${t}`}</M>
            </span>
          )
        })}
      </div>

      <div
        aria-live="polite"
        style={{ width: '100%', minHeight: '3.2em', padding: '0.5rem 0.7rem', borderRadius: 8, background: 'var(--surface-2)', border: '1px dashed var(--rule)', fontSize: '0.92rem', color: hovered ? 'var(--ink)' : 'var(--ink-3)' }}
      >
        {hovered?.desc ?? 'Hover or tap a symbol to decode it. Highlighted now: every cell this formula uses.'}
      </div>

      <div style={{ display: 'grid', gap: '0.35rem', justifyItems: 'center' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Decode a symbol</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center' }}>
          {DECODE.map((p) => (
            <button key={p.key} type="button" style={{ ...pieceBtn(hover === p.key), fontSize: '1rem', minWidth: '2.6rem' }} {...bind(p.key!)} aria-label={p.desc}>
              <M>{p.tex}</M>
            </button>
          ))}
        </div>
      </div>
    </Figure>
  )
}
