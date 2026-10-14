import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, useNarrow } from '../../../../../kit'
import s from './df.module.css'
import { cellStyle } from './outline'
import { ARRAY_OUT, CELL_OUT, COLS, COLUMNS_OUT, DTYPES, DTYPES_OUT, FLATS, INDEX_OUT, ROW_OUT, SERIES_OUT, SHAPE_OUT, fmtCell } from './data'

/*
  Anatomy of a DataFrame. Pick a part (index, column labels, a column = Series, the NumPy
  values underneath, a row, a cell, dtypes, shape) or click the table itself; the part is
  outlined and a panel shows what it is, the code that reaches it and pandas' real output.
*/

type Part = 'index' | 'columns' | 'series' | 'values' | 'row' | 'cell' | 'dtypes' | 'shape'

const PARTS: { id: Part; label: string }[] = [
  { id: 'series', label: 'a column (Series)' },
  { id: 'values', label: 'values (NumPy)' },
  { id: 'index', label: 'index' },
  { id: 'columns', label: 'column labels' },
  { id: 'row', label: 'a row' },
  { id: 'cell', label: 'a cell' },
  { id: 'dtypes', label: 'dtypes' },
  { id: 'shape', label: 'shape' },
]

// grid coordinates: header row = -1, data rows 0..7, dtype row = 8; index column = -1, data columns 0..3
const N = FLATS.length
const FOOT = N

export default function DataFrameAnatomy() {
  const [part, setPart] = useState<Part>('series')
  const [r, setR] = useState(2)
  const [c, setC] = useState(3)
  const [ref, narrow] = useNarrow<HTMLDivElement>(420)
  const [ref2, tiny] = useNarrow<HTMLDivElement>(330)
  const col = COLS[c]

  const inPrimary = (i: number, j: number): boolean => {
    switch (part) {
      case 'index':
        return j === -1 && i >= 0 && i < N
      case 'columns':
        return i === -1 && j >= 0
      case 'series':
        return j === c && i >= -1 && i < N
      case 'values':
        return j === c && i >= 0 && i < N
      case 'row':
        return i === r && j >= -1 && j <= 3
      case 'cell':
        return i === r && j === c
      case 'dtypes':
        return i === FOOT && j >= 0 && j <= 3
      case 'shape':
        return i >= 0 && i < N && j >= 0 && j <= 3
    }
  }
  // a Series carries the shared index with it: show that as a second, orange region
  const inSecondary = part === 'series' ? (i: number, j: number) => j === -1 && i >= 0 && i < N : undefined
  const st = (i: number, j: number): CSSProperties => cellStyle(i, j, inPrimary, inSecondary)

  const info: Record<Part, { title: string; body: ReactNode; code: string; out: string }> = {
    series: {
      title: `A column is a Series: df['${col}']`,
      body: (
        <>
          One column is a <strong>Series</strong>: its values, plus the shared index (orange) and a name. Every value in a
          Series has the same type, its <em>dtype</em>. Click another column heading to pull that one out instead.
        </>
      ),
      code: `df['${col}']`,
      out: SERIES_OUT[col],
    },
    values: {
      title: 'Underneath: a NumPy array',
      body: (
        <>
          Strip away the labels and each column is a plain NumPy array. That is why the NumPy ideas you already know
          (vectorised maths, boolean masks) work on columns too.
        </>
      ),
      code: `df['${col}'].to_numpy()`,
      out: ARRAY_OUT[col],
    },
    index: {
      title: 'The index: row labels',
      body: (
        <>
          The bold labels down the left. Every column shares them, so position 3 in <code>town</code> lines up with position 3
          in <code>price</code>. By default they are 0, 1, 2, …, but they can be dates, IDs or names.
        </>
      ),
      code: 'df.index',
      out: INDEX_OUT,
    },
    columns: {
      title: 'Column labels',
      body: (
        <>
          The names along the top. You use them to pick columns, as in <code>df['price']</code>. The index is not one of the
          columns.
        </>
      ),
      code: 'df.columns',
      out: COLUMNS_OUT,
    },
    row: {
      title: `A row: df.loc[${r}]`,
      body: (
        <>
          Pick a row by its index label with <code>loc</code>. A row mixes text and numbers, so pandas returns it as a
          Series with dtype <code>object</code> (anything goes). Click any bold row label to choose a row.
        </>
      ),
      code: `df.loc[${r}]`,
      out: ROW_OUT[r],
    },
    cell: {
      title: `One cell: df.loc[${r}, '${col}']`,
      body: (
        <>
          A row label plus a column label pins down exactly one value. Click any cell to try it.
          {FLATS[r][col] === null && (
            <>
              {' '}
              This one is missing: pandas shows it as <code>NaN</code> in tables and NumPy prints it as <code>nan</code>.
            </>
          )}
        </>
      ),
      code: `print(df.loc[${r}, '${col}'])`,
      out: CELL_OUT[r][c],
    },
    dtypes: {
      title: 'dtypes: one type per column',
      body: (
        <>
          <code>object</code> means text (pandas 3 calls it <code>str</code>), <code>int64</code> whole numbers and{' '}
          <code>float64</code> decimals. <code>area</code> holds whole numbers yet is <code>float64</code>, because its
          missing value, NaN, is a float.
        </>
      ),
      code: 'df.dtypes',
      out: DTYPES_OUT,
    },
    shape: {
      title: 'shape: (rows, columns)',
      body: (
        <>
          8 rows and 4 columns. The index is a set of labels, not data, so it is not counted. <code>shape</code> has no
          brackets after it: it is an attribute, not a method.
        </>
      ),
      code: 'df.shape',
      out: SHAPE_OUT,
    },
  }
  const cur = info[part]

  const twoUp: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(290px, 100%), 1fr))',
    gap: '0.9rem 1.1rem',
    width: '100%',
    alignItems: 'start',
  }

  return (
    <Figure
      title="Anatomy of a DataFrame"
      caption={
        <>
          Pick a part, or click the table: a column heading pulls out that <strong>Series</strong>, a bold row label picks a
          row, a cell picks one value. Notice that a DataFrame is just named NumPy columns that share one set of row labels.
        </>
      }
    >
      <div className={s.chips} role="group" aria-label="Parts of a DataFrame">
        {PARTS.map((p) => (
          <button key={p.id} type="button" className={s.chip} aria-pressed={part === p.id} onClick={() => setPart(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      <div style={twoUp} ref={ref}>
        <div className={s.scroll} ref={ref2}>
          <table className={`${s.table}${narrow ? ` ${s.compact}` : ''}${tiny ? ` ${s.tiny}` : ''}`} aria-label="The DataFrame df: 8 HDB resale flats">
            <thead>
              <tr>
                <th className={s.corner} aria-label="index" />
                {COLS.map((name, j) => (
                  <th key={name} style={st(-1, j)}>
                    <button
                      type="button"
                      className={s.cellBtn}
                      onClick={() => {
                        setC(j)
                        setPart('series')
                      }}
                      aria-label={`Select column ${name}`}
                    >
                      {name}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FLATS.map((f, i) => (
                <tr key={i}>
                  <th scope="row" style={st(i, -1)}>
                    <button
                      type="button"
                      className={s.cellBtn}
                      onClick={() => {
                        setR(i)
                        setPart('row')
                      }}
                      aria-label={`Select row ${i}`}
                    >
                      {i}
                    </button>
                  </th>
                  {COLS.map((name, j) => (
                    <td
                      key={name}
                      className={`${s.clickable}${f[name] === null ? ` ${s.nan}` : ''}`}
                      style={st(i, j)}
                      onClick={() => {
                        setR(i)
                        setC(j)
                        setPart('cell')
                      }}
                    >
                      {fmtCell(f, name)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th className={s.corner}>dtype</th>
                {COLS.map((name, j) => (
                  <td key={name} className={s.clickable} style={st(FOOT, j)} onClick={() => setPart('dtypes')}>
                    {DTYPES[name]}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
        <div className={s.panel} aria-live="polite">
          <div className={s.panelTitle}>{cur.title}</div>
          <p>{cur.body}</p>
          <div className={s.io}>
            <div className={s.ioLabel}>code</div>
            <pre className={s.code}>{cur.code}</pre>
            <div className={s.ioLabel}>output</div>
            <pre className={s.out}>{cur.out}</pre>
          </div>
        </div>
      </div>
    </Figure>
  )
}
