import { useId, useState } from 'react'
import { Figure, Toggle, useNarrow } from '../../../../../kit'
import { Py, highlightPy } from '../decisions/pyCode'
import ui from '../decisions/ui.module.css'
import s from './lists.module.css'

/*
  A 4 × 5 nested list shown twice: as the Python literal (a list of row lists) and as a table.
  Click a cell to get grid[r][c], click a row label to get grid[r], or type an expression.
  The "pixels" toggle shades each cell by its value: a greyscale image is exactly such a grid.
*/

const GRID = [
  [3, 8, 1, 9, 4],
  [7, 0, 6, 2, 5],
  [1, 4, 9, 7, 3],
  [6, 2, 5, 0, 8],
]
const R = GRID.length
const C = GRID[0].length

type Sel = { r: number | null; c: number | null }
type Result = { ok: true; text: string; sel: Sel } | { ok: false; text: string }

const norm = (i: number, n: number) => (i < 0 ? i + n : i)
const listText = (row: number[]) => `[${row.join(', ')}]`

function evaluate(src: string): Result {
  const e = src.replace(/\s+/g, '')
  if (!e) return { ok: false, text: 'Type an expression such as grid[2][3]' }
  let m = /^len\(grid\)$/.exec(e)
  if (m) return { ok: true, text: String(R), sel: { r: null, c: null } }
  m = /^len\(grid\[(-?\d+)\]\)$/.exec(e)
  if (m) {
    const r = norm(Number(m[1]), R)
    if (r < 0 || r >= R) return { ok: false, text: 'IndexError: list index out of range' }
    return { ok: true, text: String(C), sel: { r, c: null } }
  }
  m = /^grid\[(-?\d+),(-?\d+)\]$/.exec(e)
  if (m) return { ok: false, text: 'TypeError: list indices must be integers or slices, not tuple (grid[r, c] is NumPy style; a list needs grid[r][c])' }
  m = /^grid\[(-?\d+)\]\[(-?\d+)\]$/.exec(e)
  if (m) {
    const r = norm(Number(m[1]), R)
    if (r < 0 || r >= R) return { ok: false, text: `IndexError: list index out of range (grid has only ${R} rows: 0 to ${R - 1})` }
    const c = norm(Number(m[2]), C)
    if (c < 0 || c >= C) return { ok: false, text: `IndexError: list index out of range (each row has only ${C} items: 0 to ${C - 1})` }
    return { ok: true, text: String(GRID[r][c]), sel: { r, c } }
  }
  m = /^grid\[(-?\d+)\]$/.exec(e)
  if (m) {
    const r = norm(Number(m[1]), R)
    if (r < 0 || r >= R) return { ok: false, text: `IndexError: list index out of range (grid has only ${R} rows: 0 to ${R - 1})` }
    return { ok: true, text: listText(GRID[r]), sel: { r, c: null } }
  }
  if (e === 'grid') return { ok: true, text: `[${GRID.map(listText).join(', ')}]`, sel: { r: null, c: null } }
  return { ok: false, text: 'This box understands grid, grid[r], grid[r][c], len(grid) and len(grid[r]) with whole-number indices.' }
}

export default function GridIndexer() {
  const [expr, setExpr] = useState('grid[2][3]')
  const [pixels, setPixels] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const fid = useId()
  const res = evaluate(expr)
  const sel: Sel = res.ok ? res.sel : { r: null, c: null }
  const cell = narrow ? 44 : 50

  // Pixel mode is image data, not page chrome, so it uses a fixed greyscale ramp in both themes (a documented exception
  // to the theme tokens): 0 is black and 9 is white, matching "0 (black) to 255 (white)" in the lesson.
  const shade = (v: number) => (pixels ? `hsl(0 0% ${8 + v * 10}%)` : undefined)
  const ink = (v: number) => (pixels ? (v < 5 ? '#ffffff' : '#111111') : undefined)

  return (
    <Figure
      wide
      title="Row first, then column"
      caption={
        <>
          Click a cell to see the expression that reaches it, or click a row label to take the whole row. The code on the left is the same grid
          written as Python: each row is one inner list, so <code>grid[r]</code> picks an inner list and the second <code>[c]</code> picks an item
          inside it. Try typing <code>grid[-1][0]</code>, <code>grid[4][0]</code> and <code>grid[1, 2]</code>, then switch on the pixels.
        </>
      }
    >
      <div ref={ref} className={ui.wrap}>
        <div className={narrow ? ui.stack : ui.cols} style={narrow ? undefined : { gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', alignItems: 'center' }}>
          <div className={ui.pane}>
            <div className={ui.bar}>
              <span>grid as Python</span>
            </div>
            <ol className={ui.lines} aria-label="The grid as a nested list">
              {GRID.map((row, r) => {
                const on = sel.r === r
                return (
                  <li key={r} className={`${ui.line} ${on ? ui.lineNow : ''}`}>
                    <span className={ui.code}>
                      {highlightPy(r === 0 ? 'grid = [' : '        ')}
                      <span style={on ? { outline: '2px solid var(--highlight)', borderRadius: 4 } : undefined}>
                        {'['}
                        {row.map((v, c) => (
                          <span key={c}>
                            <span
                              className="tok number"
                              style={on && sel.c === c ? { background: 'var(--highlight)', color: 'var(--highlight-ink)', borderRadius: 3, padding: '0 2px' } : undefined}
                            >
                              {v}
                            </span>
                            {c < C - 1 ? ', ' : ''}
                          </span>
                        ))}
                        {']'}
                      </span>
                      {r < R - 1 ? ',' : ']'}
                      {!narrow && <span className="tok comment">{`  # row ${r}`}</span>}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className={s.gridWrap}>
            <div className={s.grid} style={{ gridTemplateColumns: `auto repeat(${C}, ${cell}px)` }} role="grid" aria-label="The grid as a table">
              <span />
              {Array.from({ length: C }, (_, c) => (
                <span key={c} className={`${s.colHead} ${sel.c === c ? s.colHeadOn : ''}`}>
                  col {c}
                </span>
              ))}
              {GRID.map((row, r) => (
                <div key={r} style={{ display: 'contents' }} role="row">
                  <button type="button" className={`${s.rowHead} ${sel.r === r && sel.c === null ? s.rowHeadOn : ''}`} style={{ height: cell }} onClick={() => setExpr(`grid[${r}]`)}>
                    row {r}
                  </button>
                  {row.map((v, c) => {
                    const on = sel.r === r && sel.c === c
                    const inRow = sel.r === r && sel.c === null
                    return (
                      <button
                        key={c}
                        type="button"
                        role="gridcell"
                        aria-label={`grid[${r}][${c}] is ${v}`}
                        className={`${s.cell} ${on ? s.cellOn : inRow ? s.cellRow : ''}`}
                        style={{ height: cell, background: on || inRow ? undefined : shade(v), color: on || inRow ? undefined : ink(v) }}
                        onClick={() => setExpr(`grid[${r}][${c}]`)}
                      >
                        {v}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={ui.field}>
          <label className={ui.fieldLabel} htmlFor={fid}>
            Type an expression
          </label>
          <input
            id={fid}
            type="text"
            className={`${ui.input} ${res.ok ? '' : ui.inputBad}`}
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
          />
          <div className={ui.chips}>
            {['grid[1]', 'grid[2][3]', 'grid[-1][0]', 'grid[0][-1]', 'len(grid)', 'len(grid[0])', 'grid[4][0]', 'grid[1, 2]'].map((p) => (
              <button key={p} type="button" className={`${ui.chip} ${expr.replace(/\s+/g, '') === p.replace(/\s+/g, '') ? ui.chipOn : ''}`} onClick={() => setExpr(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className={`${ui.status} ${res.ok ? '' : ui.statusBad}`} aria-live="polite">
          {res.ok ? (
            <>
              <Py>{expr.trim()}</Py> <span className={ui.arrow}>→</span> <Py>{res.text}</Py>
              {res.sel.r !== null && res.sel.c !== null && (
                <span>
                  {' '}
                  (row {res.sel.r} first, then item {res.sel.c} of that row)
                </span>
              )}
              {res.sel.r !== null && res.sel.c === null && expr.trim().startsWith('grid') && <span> (one index gives a whole row: an inner list)</span>}
            </>
          ) : (
            <>{res.text}</>
          )}
        </div>
        <Toggle label="Shade each cell by its value, like the pixels of a greyscale image" checked={pixels} onChange={setPixels} />
      </div>
    </Figure>
  )
}
