import { useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Segmented, Toggle, useNarrow } from '../../../../../kit'
import s from './df.module.css'
import { cellStyle } from './outline'
import { COLS, FLATS, fmtCell } from './data'
import { evaluate, twinOf, type Frame, type Label, type Outcome } from './indexer'

/*
  Type a loc / iloc expression and see exactly which cells it picks. Every row shows BOTH its
  position (orange, 0..7 from the top) and its index label (indigo). After sorting, the two
  numbering systems disagree, so df.loc[0:2] and df.iloc[0:2] pick different rows. The "twin"
  of the typed expression (loc <-> iloc) is drawn as an orange/indigo inner outline.
*/

type Mode = 'sorted' | 'default' | 'letters'

const LOC = 'var(--viz-1)'
const ILOC = 'var(--viz-2)'
const GET = 'var(--viz-3)'

const MODES: Record<Mode, { label: string; setup: string; order: number[]; labels: Label[]; frame: Frame }> = {
  sorted: {
    label: "sort_values('price')",
    setup: "df = df.sort_values('price')   # cheapest first; rows keep their old labels",
    order: [1, 3, 4, 6, 0, 7, 2, 5],
    labels: [1, 3, 4, 6, 0, 7, 2, 5],
    frame: { index: [1, 3, 4, 6, 0, 7, 2, 5], columns: COLS, monotonic: false, range: false },
  },
  default: {
    label: 'default 0–7',
    setup: 'df = pd.DataFrame({...})       # default index: labels 0, 1, 2, … 7',
    order: [0, 1, 2, 3, 4, 5, 6, 7],
    labels: [0, 1, 2, 3, 4, 5, 6, 7],
    frame: { index: [0, 1, 2, 3, 4, 5, 6, 7], columns: COLS, monotonic: true, range: true },
  },
  letters: {
    label: 'letters A–H',
    setup: "df.index = list('ABCDEFGH')    # text labels, like flat IDs",
    order: [0, 1, 2, 3, 4, 5, 6, 7],
    labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    frame: { index: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], columns: COLS, monotonic: true, range: false },
  },
}

const PRESETS: Record<Mode, string[]> = {
  sorted: ['df.loc[0:2]', 'df.iloc[0:2]', 'df.loc[3]', 'df.iloc[3]', "df.loc[:, 'price']", 'df.iloc[-1]', "df.loc[3, 'town']", 'df.iloc[1:3, 0:2]', "df.loc[[5, 1], ['town', 'price']]", "df['price']", 'df.loc[8]'],
  default: ['df.loc[0:2]', 'df.iloc[0:2]', 'df.loc[3]', 'df.iloc[3]', "df.loc[:, 'price']", 'df.iloc[-1]', "df.loc[3, 'town']", 'df.iloc[1:3, 0:2]', "df.loc[[5, 1], ['town', 'price']]", "df['price']", 'df.loc[-1]'],
  letters: ["df.loc['A':'C']", 'df.iloc[0:2]', "df.loc['D']", 'df.iloc[3]', "df.loc[:, 'price']", 'df.iloc[-1]', "df.loc['D', 'town']", 'df.iloc[1:3, 0:2]', "df.loc[['F', 'B'], ['town', 'price']]", 'df.loc[2]', 'df.iloc[\'B\']'],
}

const colorOf = (src: string) => (/\.iloc\s*\[/.test(src) ? ILOC : /\.loc\s*\[/.test(src) ? LOC : GET)
const fmtList = (xs: (string | number)[]) => (xs.length ? xs.map((x) => (typeof x === 'string' ? `'${x}'` : x)).join(', ') : 'none')

function Summary({ src, out, mode, color }: { src: string; out: Outcome; mode: Mode; color: string }) {
  const M = MODES[mode]
  let body: ReactNode
  if (!out.ok) {
    body = out.parse ? <span style={{ color: 'var(--ink-2)' }}>{out.error}</span> : <span className={s.err}>{out.error}</span>
  } else {
    const labels = out.rows.map((i) => M.labels[i])
    const what =
      out.kind === 'scalar'
        ? `one value, ${fmtCell(FLATS[M.order[out.rows[0]]], COLS[out.cols[0]])}`
        : out.kind === 'series'
          ? `a Series of ${out.rows.length === 1 ? out.cols.length : out.rows.length} values`
          : `a DataFrame, ${out.rows.length} row${out.rows.length === 1 ? '' : 's'} × ${out.cols.length} column${out.cols.length === 1 ? '' : 's'}`
    body = (
      <>
        {what}
        {out.rows.length === 8 ? (
          ' · all 8 rows'
        ) : (
          <>
            {' '}
            · row label{labels.length === 1 ? '' : 's'} <span className={s.mono}>{fmtList(labels)}</span> at position{labels.length === 1 ? '' : 's'}{' '}
            <span className={s.mono}>{fmtList(out.rows)}</span>
          </>
        )}
      </>
    )
  }
  return (
    <div className={s.resultLine}>
      <span className={s.swatch} style={{ background: color }} aria-hidden="true" />
      <span className={s.mono} style={{ color }}>
        {src.trim()}
      </span>
      <span>→ {body}</span>
    </div>
  )
}

export default function LocIlocHighlighter() {
  const [mode, setMode] = useState<Mode>('sorted')
  const [expr, setExpr] = useState('df.loc[0:2]')
  const [showTwin, setShowTwin] = useState(true)
  const inputId = useId()
  const [ref, tiny] = useNarrow<HTMLDivElement>(330)
  const M = MODES[mode]

  const out = useMemo(() => evaluate(expr, M.frame), [expr, M])
  const twinSrc = twinOf(expr)
  const twin = useMemo(() => (twinSrc ? evaluate(twinSrc, M.frame) : null), [twinSrc, M])
  const color = colorOf(expr)
  const twinColor = twinSrc ? colorOf(twinSrc) : GET

  const sel = (o: Outcome | null) => {
    if (!o || !o.ok) return () => false
    const rs = new Set(o.rows)
    const cs = new Set(o.cols)
    return (i: number, j: number) => rs.has(i) && cs.has(j)
  }
  const prim = sel(out)
  const sec = showTwin && twin ? sel(twin) : undefined
  const st = (i: number, j: number): CSSProperties => cellStyle(i, j, prim, sec, { primary: color, secondary: twinColor })
  const rowPicked = (i: number) => (out.ok && out.rows.includes(i)) || (showTwin && twin?.ok && twin.rows.includes(i))

  return (
    <Figure
      title="loc picks by label, iloc picks by position"
      caption={
        <>
          Every row has a <strong style={{ color: ILOC }}>position</strong> (0, 1, 2, … from the top) and an{' '}
          <strong style={{ color: LOC }}>index label</strong>. Type an expression or tap a preset: <code>loc</code> picks are
          drawn in indigo, <code>iloc</code> picks in orange, and the twin switch shows the same brackets with{' '}
          <code>loc</code> and <code>iloc</code> swapped. After sorting, <code>df.loc[0:2]</code> and <code>df.iloc[0:2]</code>{' '}
          pick different rows, and <code>loc</code> includes its end label while <code>iloc</code> stops before its end
          position. Switch to the default index to see why the bug hides: there, labels equal positions by coincidence.
        </>
      }
    >
      <Segmented
        label="Row labels"
        options={(Object.keys(MODES) as Mode[]).map((m) => ({ value: m, label: <span className={s.mono}>{MODES[m].label}</span> }))}
        value={mode}
        onChange={setMode}
      />
      <div className={s.setup}>{M.setup}</div>
      <div className={s.exprRow}>
        <label className={s.exprLabel} htmlFor={inputId}>
          Type:
        </label>
        <input
          id={inputId}
          className={s.expr}
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          style={{ color }}
        />
      </div>
      <div className={s.chips} role="group" aria-label="Example expressions">
        {PRESETS[mode].map((p) => (
          <button key={p} type="button" className={`${s.chip} ${s.codeChip}`} aria-pressed={expr === p} onClick={() => setExpr(p)}>
            {p}
          </button>
        ))}
      </div>
      <div className={s.scroll} ref={ref}>
        <table className={`${s.table} ${s.compact}${tiny ? ` ${s.tiny}` : ''}`} aria-label="The DataFrame with row positions and index labels">
          <thead>
            <tr>
              <th className={s.corner} style={{ color: ILOC }}>
                pos
              </th>
              <th className={s.corner} style={{ color: LOC }}>
                label
              </th>
              {COLS.map((c, j) => (
                <th key={c} style={st(-1, j)}>
                  {c}
                  <span className={s.colpos}>{j}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {M.order.map((src, i) => {
              const f = FLATS[src]
              return (
                <tr key={i}>
                  <td className={s.pos} style={{ color: ILOC, fontWeight: rowPicked(i) ? 800 : 400 }}>
                    {i}
                  </td>
                  <th scope="row" style={{ color: LOC }}>
                    {String(M.labels[i])}
                  </th>
                  {COLS.map((c, j) => (
                    <td key={c} className={f[c] === null ? s.nan : undefined} style={st(i, j)}>
                      {fmtCell(f, c)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Toggle label={<>Show the twin ({twinSrc ? <span className={s.mono}>{twinSrc.trim()}</span> : 'loc ↔ iloc'})</>} checked={showTwin} onChange={setShowTwin} />
      <div className={s.result} aria-live="polite">
        <Summary src={expr} out={out} mode={mode} color={color} />
        {showTwin && twin && twinSrc && <Summary src={twinSrc} out={twin} mode={mode} color={twinColor} />}
      </div>
    </Figure>
  )
}
