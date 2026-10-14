import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Segmented, Slider, Button } from '../../../../../kit'
import s from './gm.module.css'

/*
  Three ways to make a new column:
    vectorised  df['psm'] = df['price'] / df['area']      (type any arithmetic; the whole column fills at once)
    map         df['region'] = df['town'].map({...})       (switch dictionary entries off to see NaN appear)
    apply       df['band'] = df['price'].apply(label)      (the function is called once per row, animated)
  The timing bars are real measurements on 1,000,000 rows (pandas 3, one run on a 4-core x86 machine).
*/

interface Flat {
  town: string
  area: number
  price: number
}
/** the same eight flats as the groupby animation (flat_type left out to save space) */
const DF: Flat[] = [
  { town: 'Tampines', area: 90, price: 520 },
  { town: 'Bishan', area: 70, price: 480 },
  { town: 'Woodlands', area: 90, price: 460 },
  { town: 'Tampines', area: 70, price: 400 },
  { town: 'Bishan', area: 95, price: 700 },
  { town: 'Woodlands', area: 70, price: 350 },
  { town: 'Tampines', area: 110, price: 640 },
  { town: 'Woodlands', area: 125, price: 540 },
]
const N = DF.length
type NumCol = 'area' | 'price'
const NUM_COLS: NumCol[] = ['area', 'price']
const REGION: [string, string][] = [
  ['Tampines', 'East'],
  ['Bishan', 'Central'],
  ['Woodlands', 'North'],
]

/* ---------------- a tiny vectorised expression evaluator ---------------- */
type Val = number | number[]
type Tok = { t: 'num'; v: number } | { t: 'col'; v: string } | { t: 'op'; v: string } | { t: 'meth'; v: string }

function tokenise(src: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (/\s/.test(c)) {
      i++
      continue
    }
    const col = /^df\s*\[\s*(['"])([A-Za-z_][\w ]*)\1\s*\]/.exec(src.slice(i))
    if (col) {
      out.push({ t: 'col', v: col[2] })
      i += col[0].length
      continue
    }
    const meth = /^\.\s*([A-Za-z_]\w*)\s*\(\s*\)/.exec(src.slice(i))
    if (meth) {
      out.push({ t: 'meth', v: meth[1] })
      i += meth[0].length
      continue
    }
    const num = /^\d+(\.\d+)?|^\.\d+/.exec(src.slice(i))
    if (num) {
      out.push({ t: 'num', v: parseFloat(num[0]) })
      i += num[0].length
      continue
    }
    if (src.startsWith('**', i)) {
      out.push({ t: 'op', v: '**' })
      i += 2
      continue
    }
    if ('+-*/()'.includes(c)) {
      out.push({ t: 'op', v: c })
      i++
      continue
    }
    const id = /^[A-Za-z_]\w*/.exec(src.slice(i))
    if (id) {
      if (id[0] === 'df') throw new Error("write a column as df['price'], with quotes and square brackets")
      out.push({ t: 'col', v: id[0] })
      i += id[0].length
      continue
    }
    throw new Error(`I don't understand "${c}"`)
  }
  return out
}

const lift = (a: Val, b: Val, f: (x: number, y: number) => number): Val => {
  if (typeof a === 'number' && typeof b === 'number') return f(a, b)
  const aa = typeof a === 'number' ? Array(N).fill(a) : a
  const bb = typeof b === 'number' ? Array(N).fill(b) : b
  return aa.map((x: number, i: number) => f(x, bb[i]))
}

function evaluate(src: string): Val {
  const toks = tokenise(src)
  let p = 0
  const peek = () => toks[p]
  const isOp = (v: string) => peek()?.t === 'op' && peek()?.v === v
  const expr = (): Val => {
    let v = term()
    while (isOp('+') || isOp('-')) {
      const op = (toks[p++] as { v: string }).v
      const r = term()
      v = lift(v, r, op === '+' ? (x, y) => x + y : (x, y) => x - y)
    }
    return v
  }
  const term = (): Val => {
    let v = unary()
    while (isOp('*') || isOp('/')) {
      const op = (toks[p++] as { v: string }).v
      const r = unary()
      v = lift(v, r, op === '*' ? (x, y) => x * y : (x, y) => x / y)
    }
    return v
  }
  const unary = (): Val => {
    if (isOp('-')) {
      p++
      return lift(-1, unary(), (x, y) => x * y)
    }
    return power()
  }
  const power = (): Val => {
    const base = postfix()
    if (isOp('**')) {
      p++
      return lift(base, unary(), (x, y) => x ** y)
    }
    return base
  }
  const postfix = (): Val => {
    let v = primary()
    while (peek()?.t === 'meth') {
      const m = (toks[p++] as { v: string }).v
      const arr = typeof v === 'number' ? [v] : v
      if (m === 'mean') v = arr.reduce((a, b) => a + b, 0) / arr.length
      else if (m === 'sum') v = arr.reduce((a, b) => a + b, 0)
      else if (m === 'max') v = Math.max(...arr)
      else if (m === 'min') v = Math.min(...arr)
      else throw new Error(`.${m}() is not supported here: try .mean(), .sum(), .max() or .min()`)
    }
    return v
  }
  const primary = (): Val => {
    const tk = toks[p++]
    if (!tk) throw new Error('the formula ends too early')
    if (tk.t === 'num') return tk.v
    if (tk.t === 'col') {
      if (tk.v === 'town') throw new Error("'town' holds text, so it can't go into arithmetic")
      if (!NUM_COLS.includes(tk.v as NumCol)) throw new Error(`there is no column called '${tk.v}' (try 'area' or 'price')`)
      return DF.map((r) => r[tk.v as NumCol])
    }
    if (tk.t === 'op' && tk.v === '(') {
      const v = expr()
      if (!isOp(')')) throw new Error('a closing bracket ) is missing')
      p++
      return v
    }
    throw new Error(`unexpected "${tk.v}"`)
  }
  const v = expr()
  if (p < toks.length) throw new Error(`unexpected "${(toks[p] as { v: string | number }).v}"`)
  return v
}

const fmtNum = (v: number) => (!Number.isFinite(v) ? 'inf' : Number.isInteger(v) ? String(v) : v.toFixed(2))

const PRESETS: [string, string][] = [
  ['psm', "df['price'] / df['area']"],
  ['price_sgd', "df['price'] * 1000"],
  ['sqft', "df['area'] * 10.764"],
  ['vs_avg', "df['price'] - df['price'].mean()"],
]

const TIMINGS = [
  { group: 'price ÷ area for every row', code: "df['price'] / df['area']", ms: 4, mode: 'vec' },
  { group: '', code: "df.apply(lambda r: r['price'] / r['area'], axis=1)", ms: 5400, mode: 'apply' },
  { group: '', code: 'Python for-loop with .iloc', ms: 7500, mode: 'loop' },
  { group: "'high' / 'low' label for every row", code: "np.where(df['price'] >= 500, 'high', 'low')", ms: 7, mode: 'vec' },
  { group: '', code: "df['price'].apply(label)", ms: 170, mode: 'apply' },
]

type Mode = 'vec' | 'map' | 'apply'

export default function ColumnBuilder() {
  const [mode, setMode] = useState<Mode>('vec')
  const [name, setName] = useState('psm')
  const [src, setSrc] = useState(PRESETS[0][1])
  const [mapOn, setMapOn] = useState<boolean[]>([true, true, true])
  const [thr, setThr] = useState(500)
  const [cursor, setCursor] = useState(N) // apply animation: rows < cursor are done
  const [flash, setFlash] = useState(0)

  const parsed = useMemo(() => {
    try {
      return { v: evaluate(src), err: null as string | null }
    } catch (e) {
      return { v: null, err: e instanceof Error ? e.message : String(e) }
    }
  }, [src])

  // flash the whole column at once when a vectorised result changes
  useEffect(() => {
    setFlash((f) => f + 1)
    const t = window.setTimeout(() => setFlash(0), 450)
    return () => window.clearTimeout(t)
  }, [src, mode, mapOn])

  // apply: call the function on one row at a time
  const runApply = () => setCursor(0)
  useEffect(() => {
    if (mode !== 'apply') return
    setCursor(0)
  }, [mode, thr])
  useEffect(() => {
    if (mode !== 'apply' || cursor >= N) return
    const t = window.setTimeout(() => setCursor((c) => c + 1), 450)
    return () => window.clearTimeout(t)
  }, [mode, cursor])

  const colName = mode === 'vec' ? name.trim() || 'new' : mode === 'map' ? 'region' : 'band'
  const overwrites = mode === 'vec' && (colName === 'area' || colName === 'price' || colName === 'town')

  let newVals: (string | null)[] = Array(N).fill(null)
  if (mode === 'vec' && parsed.v != null) {
    const v = parsed.v
    const nums = DF.map((_, i) => (typeof v === 'number' ? v : v[i]))
    // like pandas, a column is either all whole numbers or all decimals (5 shows as 5.00 next to 5.78)
    const allInt = nums.every((x) => Number.isInteger(x))
    newVals = nums.map((x) => (allInt ? fmtNum(x) : Number.isFinite(x) ? x.toFixed(2) : 'inf'))
  } else if (mode === 'map') {
    const dict = new Map(REGION.filter((_, k) => mapOn[k]))
    newVals = DF.map((r) => dict.get(r.town) ?? 'NaN')
  } else if (mode === 'apply') {
    newVals = DF.map((r) => (r.price >= thr ? 'high' : 'low'))
  }
  const scalarResult = mode === 'vec' && typeof parsed.v === 'number'

  const cellCls = (i: number) => {
    const cls = [s.newCol]
    if (mode === 'apply') {
      if (i === cursor) cls.push(s.active)
      else if (i > cursor) cls.push(s.pending)
    } else if (flash) cls.push(s.active)
    if (newVals[i] === 'NaN') cls.push(s.nan)
    return cls.join(' ')
  }
  const shown = (i: number) => (mode === 'apply' && i >= cursor ? (i === cursor ? '…' : '') : (newVals[i] ?? ''))

  const columns: string[] = ['town', 'area', 'price'].filter((c) => !(overwrites && c === colName))

  const code =
    mode === 'vec' ? (
      <>
        df['{colName}'] = {src}
      </>
    ) : mode === 'map' ? (
      <>
        df['region'] = df['town'].map(&#123;
        {REGION.filter((_, k) => mapOn[k])
          .map(([a, b]) => `'${a}': '${b}'`)
          .join(', ')}
        &#125;)
      </>
    ) : (
      <>
        def label(p):
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;return 'high' if p &gt;= {thr} else 'low'
        <br />
        df['band'] = df['price'].apply(label)
      </>
    )

  const maxMs = Math.max(...TIMINGS.map((t) => t.ms))

  return (
    <Figure
      title="Make a new column three ways"
      caption={
        <>
          <b>Formula</b>: type any arithmetic on <code>df['area']</code> and <code>df['price']</code> (price is in $ thousands) and the whole column fills in
          one go. <b>map</b>: switch a dictionary entry off and that town becomes <code>NaN</code>. <b>apply</b>: watch your function being called once per row.
          The bars show why this matters on a million rows: notice how thin the vectorised bars are.
        </>
      }
    >
      <Controls>
        <Segmented
          label="method"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'vec', label: 'formula (vectorised)' },
            { value: 'map', label: 'map' },
            { value: 'apply', label: 'apply' },
          ]}
        />
      </Controls>

      {mode === 'vec' && (
        <>
          <div className={s.formulaBar}>
            <span className={s.formulaPrefix}>
              df['
              <input
                aria-label="new column name"
                className={s.nameInput}
                style={{ width: `${Math.max(2, name.length) + 0.3}ch` }}
                value={name}
                spellCheck={false}
                onChange={(e) => setName(e.target.value.replace(/[^\w]/g, ''))}
              />
              '] =&nbsp;
            </span>
            <input aria-label="formula for the new column" className={s.formulaInput} value={src} spellCheck={false} onChange={(e) => setSrc(e.target.value)} />
          </div>
          <div className={s.chips}>
            {PRESETS.map(([n, f]) => (
              <button
                key={n}
                type="button"
                className={`${s.chip} ${src === f && name === n ? s.chipOn : ''}`}
                onClick={() => {
                  setName(n)
                  setSrc(f)
                }}
              >
                {f}
              </button>
            ))}
          </div>
          {parsed.err && <div className={s.error}>Can't compute that: {parsed.err}.</div>}
        </>
      )}

      {mode === 'map' && (
        <div className={s.chips} role="group" aria-label="dictionary entries">
          {REGION.map(([a, b], k) => (
            <button
              key={a}
              type="button"
              aria-pressed={mapOn[k]}
              className={`${s.chip} ${mapOn[k] ? s.chipOn : ''}`}
              style={mapOn[k] ? undefined : { textDecoration: 'line-through' }}
              onClick={() => setMapOn((m) => m.map((x, j) => (j === k ? !x : x)))}
            >
              '{a}': '{b}'
            </button>
          ))}
        </div>
      )}

      {mode === 'apply' && (
        <Controls>
          <Slider label="label(p) says 'high' when price ≥" value={thr} min={400} max={700} step={20} onChange={setThr} format={(v) => `${v}`} />
          <Button onClick={runApply}>Run apply again</Button>
        </Controls>
      )}

      <div className={s.code}>{code}</div>

      <div className={s.scroll}>
        <table className={s.tbl} style={{ maxWidth: 440, margin: '0 auto' }}>
          <thead>
            <tr>
              <th />
              {columns.map((c) => (
                <th key={c} style={{ textAlign: c === 'town' ? 'left' : 'right' }}>
                  {c}
                </th>
              ))}
              <th className={s.newCol} style={{ textAlign: mode === 'vec' ? 'right' : 'left' }}>
                {colName}
              </th>
            </tr>
          </thead>
          <tbody>
            {DF.map((r, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--ink-3)' }}>{i}</td>
                {columns.map((c) => (
                  <td key={c} style={{ textAlign: c === 'town' ? 'left' : 'right' }}>
                    {r[c as keyof Flat]}
                  </td>
                ))}
                <td className={cellCls(i)} style={{ textAlign: mode === 'vec' ? 'right' : 'left' }}>
                  {shown(i)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${s.verdict} ${mode === 'apply' ? s.verdictWarn : ''}`} aria-live="polite">
        {mode === 'vec' &&
          (parsed.err ? (
            <>Fix the formula to see the column. Column names go inside quotes and square brackets.</>
          ) : scalarResult ? (
            <>That formula gives a single number, so pandas copies it into every row (this is broadcasting, as in NumPy).</>
          ) : overwrites ? (
            <>
              <code>{colName}</code> already exists, so this assignment <b>replaces</b> it. Use a new name to keep the original.
            </>
          ) : (
            <>
              One line, no loop: pandas hands both whole columns to NumPy, which does all {N} calculations (or a million) in fast compiled code. Rows are
              matched by their index, so row 3 is always combined with row 3.
            </>
          ))}
        {mode === 'map' &&
          (mapOn.every(Boolean) ? (
            <>
              <code>map</code> looks up each value in the dictionary. Now switch one entry off.
            </>
          ) : (
            <>
              A town that is <b>not a key</b> in the dictionary becomes <code>NaN</code>. <code>map</code> never raises an error, so always check{' '}
              <code>df['region'].isna().sum()</code> afterwards.
            </>
          ))}
        {mode === 'apply' &&
          (cursor < N ? (
            <>
              Calling <code>label({DF[cursor].price})</code> for row {cursor}: one ordinary Python function call per row.
            </>
          ) : (
            <>
              Done: <code>apply</code> made {N} separate Python calls. Fine for 8 rows; slow for millions. The vectorised version is{' '}
              <code>np.where(df['price'] &gt;= {thr}, 'high', 'low')</code>.
            </>
          ))}
      </div>

      <div className={s.timing} role="group" aria-label="Measured times on one million rows">
        <div className={s.timingTitle}>Time on 1,000,000 rows (measured once; your computer will differ, the gap will not)</div>
        {TIMINGS.map((t, i) => {
          const strong = (mode === 'apply' && t.mode === 'apply') || (mode !== 'apply' && t.mode === 'vec')
          const colour = t.mode === 'vec' ? 'var(--viz-3)' : t.mode === 'apply' ? 'var(--viz-2)' : 'var(--viz-neg)'
          return (
            <div key={i} className={`${s.timingRow} ${strong ? s.timingStrong : ''}`} style={t.group ? { marginTop: i ? '0.4rem' : 0 } : undefined}>
              {t.group && <div style={{ fontSize: '0.76rem', color: 'var(--ink-3)', fontWeight: 700 }}>{t.group}</div>}
              <div className={s.timingLabel}>
                <code>{t.code}</code>
                <span className={s.timingValue}>{t.ms >= 1000 ? `≈ ${(t.ms / 1000).toFixed(1)} s` : `≈ ${t.ms} ms`}</span>
              </div>
              <div className={s.timingTrack}>
                <div className={s.timingFill} style={{ width: `${(t.ms / maxMs) * 100}%`, background: colour }} />
              </div>
            </div>
          )
        })}
      </div>
    </Figure>
  )
}
