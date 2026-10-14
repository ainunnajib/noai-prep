import { useState } from 'react'
import { Figure, Segmented, Button, useNarrow } from '../../../../../kit'
import s from './df.module.css'
import { COLS, FLATS, TOWNS, fmtCell, type ColName, type Flat } from './data'

/*
  Build a boolean filter from condition chips. Each condition is evaluated on every row (the
  cells that pass are tinted in the condition's colour), the conditions are combined with & or |
  into one True/False mask, rows where the mask is False fade out, and the matching pandas code
  is written underneath. Comparisons with the missing area (NaN) are False, except != which is True.
*/

type Op = '==' | '!=' | '<' | '<=' | '>' | '>='
interface Cond {
  id: number
  col: ColName
  op: Op
  val: string
}

const COND_COLOURS = ['var(--viz-1)', 'var(--viz-3)', 'var(--viz-5)']
const NUM_OPS: Op[] = ['<', '<=', '>', '>=', '==', '!=']
const TXT_OPS: Op[] = ['==', '!=']
const DEFAULTS: Record<ColName, { op: Op; val: string }> = {
  town: { op: '==', val: 'Tampines' },
  rooms: { op: '>=', val: '4' },
  area: { op: '>', val: '90' },
  price: { op: '<', val: '600000' },
}

function test(f: Flat, c: Cond): boolean | null {
  const v = f[c.col]
  if (c.col === 'town') return c.op === '==' ? v === c.val : v !== c.val
  const x = Number(c.val)
  if (c.val.trim() === '' || !Number.isFinite(x)) return null
  if (v === null) return c.op === '!=' // NaN compares False with everything, so != is True
  const n = v as number
  switch (c.op) {
    case '==':
      return n === x
    case '!=':
      return n !== x
    case '<':
      return n < x
    case '<=':
      return n <= x
    case '>':
      return n > x
    case '>=':
      return n >= x
  }
}

const condCode = (c: Cond) => `df['${c.col}'] ${c.op} ${c.col === 'town' ? `'${c.val}'` : c.val.trim() || '?'}`

export default function FilterBuilder() {
  const [conds, setConds] = useState<Cond[]>([
    { id: 1, col: 'town', op: '==', val: 'Tampines' },
    { id: 2, col: 'price', op: '<', val: '600000' },
  ])
  const [join, setJoin] = useState<'&' | '|'>('&')
  const [nextId, setNextId] = useState(3)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const [ref2, tiny] = useNarrow<HTMLDivElement>(330)

  const update = (id: number, patch: Partial<Cond>) => setConds((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const add = () => {
    const used = new Set(conds.map((c) => c.col))
    const col = (['rooms', 'area', 'price', 'town'] as ColName[]).find((c) => !used.has(c)) ?? 'rooms'
    setConds((cs) => [...cs, { id: nextId, col, ...DEFAULTS[col] }])
    setNextId((n) => n + 1)
  }

  const results = FLATS.map((f) => conds.map((c) => test(f, c)))
  const invalid = results.some((r) => r.some((v) => v === null))
  const mask = results.map((r) => (r.length === 0 ? true : join === '&' ? r.every((v) => v === true) : r.some((v) => v === true)))
  const kept = mask.filter(Boolean).length
  const usesArea = conds.some((c) => c.col === 'area')

  // the pandas code: one condition needs no brackets, several need one pair each
  let code: string
  if (conds.length === 0) code = 'df            # no conditions: every row'
  else if (conds.length === 1) code = `mask = ${condCode(conds[0])}\ndf[mask]      # ${kept} of 8 rows`
  else
    code =
      'mask = (' +
      conds.map((c, i) => (i === 0 ? `(${condCode(c)})` : `        ${join} (${condCode(c)})`)).join('\n') +
      `)\ndf[mask]      # ${kept} of 8 rows`

  const cellTint = (i: number, col: ColName) => {
    const k = conds.findIndex((c, j) => c.col === col && results[i][j] === true)
    return k >= 0 ? `color-mix(in srgb, ${COND_COLOURS[k]} 20%, var(--surface))` : undefined
  }

  return (
    <Figure
      title="A filter is a True/False mask over the rows"
      caption={
        <>
          Edit the conditions, add a third, or switch between <code>&amp;</code> (both must be True) and <code>|</code> (at
          least one True). Cells that pass a condition are tinted in its colour; the <strong>mask</strong> column combines
          them, and rows where it is False fade away. It is exactly a NumPy boolean mask, applied to rows.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gap: '0.8rem', justifyItems: 'center' }}>
        <div className={s.conds}>
          {conds.map((c, k) => {
            const passCount = results.filter((r) => r[k] === true).length
            return (
              <div key={c.id} className={s.cond} style={{ borderLeftColor: COND_COLOURS[k] }}>
                <select
                  aria-label="column"
                  value={c.col}
                  onChange={(e) => {
                    const col = e.target.value as ColName
                    update(c.id, { col, ...DEFAULTS[col] })
                  }}
                >
                  {COLS.map((col) => (
                    <option key={col} value={col}>
                      df['{col}']
                    </option>
                  ))}
                </select>
                <select aria-label="comparison" value={c.op} onChange={(e) => update(c.id, { op: e.target.value as Op })}>
                  {(c.col === 'town' ? TXT_OPS : NUM_OPS).map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
                {c.col === 'town' ? (
                  <select aria-label="value" value={c.val} onChange={(e) => update(c.id, { val: e.target.value })}>
                    {TOWNS.map((t) => (
                      <option key={t} value={t}>
                        '{t}'
                      </option>
                    ))}
                  </select>
                ) : (
                  <input aria-label="value" type="number" inputMode="numeric" value={c.val} onChange={(e) => update(c.id, { val: e.target.value })} />
                )}
                <span className={s.condCount}>{passCount} True</span>
                <button type="button" className={s.iconBtn} aria-label="Remove this condition" onClick={() => setConds((cs) => cs.filter((x) => x.id !== c.id))}>
                  ×
                </button>
              </div>
            )
          })}
        </div>
        <div className={s.exprRow} style={{ justifyContent: 'center' }}>
          <Segmented
            label="Combine with"
            options={[
              { value: '&', label: <span className={s.mono}>&amp; and</span> },
              { value: '|', label: <span className={s.mono}>| or</span> },
            ]}
            value={join}
            onChange={setJoin}
          />
          <Button onClick={add} disabled={conds.length >= 3}>
            + Add condition
          </Button>
        </div>
        <div className={s.scroll} ref={ref2}>
          <table className={`${s.table} ${s.compact}${tiny ? ` ${s.tiny}` : ''}`} aria-label="Rows of df with the filter mask">
            <thead>
              <tr>
                <th className={s.corner} />
                {COLS.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                <th style={{ color: 'var(--accent)' }}>mask</th>
              </tr>
            </thead>
            <tbody>
              {FLATS.map((f, i) => (
                <tr key={i} className={mask[i] ? undefined : s.faded}>
                  <th scope="row">{i}</th>
                  {COLS.map((c) => (
                    <td key={c} className={f[c] === null ? s.nan : undefined} style={{ background: cellTint(i, c) }}>
                      {fmtCell(f, c)}
                    </td>
                  ))}
                  <td>
                    {!narrow &&
                      results[i].map((v, k) => (
                        <span
                          key={k}
                          className={s.dot}
                          title={`condition ${k + 1}: ${v}`}
                          style={v ? { background: COND_COLOURS[k] } : { boxShadow: `inset 0 0 0 1.5px ${COND_COLOURS[k]}` }}
                        />
                      ))}
                    <span className={mask[i] ? s.maskT : s.maskF}>{mask[i] ? 'True' : 'False'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={s.io} style={{ width: '100%' }}>
          <div className={s.ioLabel}>the same filter in pandas</div>
          <pre className={s.code}>{invalid ? '# type a number in every numeric condition' : code}</pre>
        </div>
        <div className={s.resultLine} aria-live="polite">
          <span className={s.big}>
            {kept} of 8 rows kept
          </span>
          {usesArea && <span style={{ color: 'var(--ink-2)', fontSize: '0.85rem' }}>Row 4's area is NaN, so every comparison on it is False (only != gives True).</span>}
        </div>
      </div>
    </Figure>
  )
}
