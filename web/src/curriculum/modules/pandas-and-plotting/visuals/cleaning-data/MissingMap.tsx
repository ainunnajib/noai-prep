import { useRef, useState, type CSSProperties } from 'react'
import { Figure, Segmented, useNarrow } from '../../../../../kit'
import s from './clean.module.css'
import { useScrollFade } from '../dataframes-and-selection/scrollFade'
import { MM_COLS, MM_START_MISSING, MM_TRUE, fmtFloatColumn, fmtSeries, type MMCol } from './data'

/*
  Twelve HDB resale records with gaps. Click any cell to blank it (NaN) or fill it back in.
  Switch the table to df.isna() to see the True/False table pandas actually counts, and read
  the per-column counts (or fractions) as bars and as pandas' printed output. The readouts
  show what df.dropna() would keep, with and without the mostly-empty column.
*/

const N = 12
/** Python's str() of a float: shortest round-trip digits, and always a decimal point */
const pyFloat = (x: number) => (Number.isInteger(x) ? x.toFixed(1) : String(x))
type Missing = Record<MMCol, boolean[]>

const startMissing = (): Missing => {
  const m = {} as Missing
  for (const c of MM_COLS) m[c] = Array.from({ length: N }, (_, i) => MM_START_MISSING[c].includes(i))
  return m
}

export default function MissingMap() {
  const [miss, setMiss] = useState<Missing>(startMissing)
  const [view, setView] = useState<'values' | 'isna'>('values')
  const [agg, setAgg] = useState<'sum' | 'mean'>('sum')
  const [hot, setHot] = useState<MMCol | null>(null)
  const [ref, narrow] = useNarrow<HTMLDivElement>(400)
  const [wideRef, stacked] = useNarrow<HTMLDivElement>(660)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fade = useScrollFade(scrollRef, `${view}${stacked}`)

  const toggle = (c: MMCol, i: number) => setMiss((m) => ({ ...m, [c]: m[c].map((v, k) => (k === i ? !v : v)) }))

  // what pandas would print in each column: numeric columns become float64 as soon as one NaN appears
  const shown: Record<MMCol, string[]> = {} as Record<MMCol, string[]>
  const dtype: Record<MMCol, string> = {} as Record<MMCol, string>
  for (const c of MM_COLS) {
    if (c === 'town') {
      shown[c] = MM_TRUE.town.map((v, i) => (miss.town[i] ? 'NaN' : String(v)))
      dtype[c] = 'object'
    } else if (miss[c].some(Boolean)) {
      shown[c] = fmtFloatColumn(MM_TRUE[c].map((v, i) => (miss[c][i] ? null : (v as number))))
      dtype[c] = 'float64'
    } else {
      shown[c] = MM_TRUE[c].map(String)
      dtype[c] = 'int64'
    }
  }

  const counts = MM_COLS.map((c) => miss[c].filter(Boolean).length)
  const total = counts.reduce((a, b) => a + b, 0)
  const completeRows = Array.from({ length: N }, (_, i) => MM_COLS.every((c) => !miss[c][i])).filter(Boolean).length
  const completeNoReno = Array.from({ length: N }, (_, i) => MM_COLS.filter((c) => c !== 'reno').every((c) => !miss[c][i])).filter(Boolean).length

  const values = agg === 'sum' ? counts.map(String) : fmtFloatColumn(counts.map((k) => k / N))
  const printed = fmtSeries([...MM_COLS], values, agg === 'sum' ? 'dtype: int64' : 'dtype: float64')
  const hotIdx = hot ? MM_COLS.indexOf(hot) : -1
  const hotCount = hotIdx >= 0 ? counts[hotIdx] : 0
  const advice = (k: number) =>
    k === 0 ? 'complete: nothing to fix' : k / N >= 0.5 ? 'mostly empty: think about dropping the whole column' : 'a few gaps: fill them, or drop those rows'

  const barColour = (k: number) => (k === 0 ? 'var(--viz-muted)' : k / N >= 0.5 ? 'var(--viz-neg)' : 'var(--viz-2)')
  const colStyle = (c: MMCol): CSSProperties | undefined => (hot === c ? { boxShadow: 'inset 2px 0 0 var(--accent), inset -2px 0 0 var(--accent)' } : undefined)

  return (
    <Figure
      title="Where are the holes?"
      caption={
        <>
          Click any cell to blank it or fill it back in, flip the table to <code>df.isna()</code>, and hover or tap a bar.
          Notice that <code>reno</code> (year of the last renovation) is 83% empty while <code>area</code> has just two
          gaps: they need different fixes. And watch the dtype row: one NaN turns a whole <code>int64</code> column into{' '}
          <code>float64</code>.
        </>
      }
    >
      <div ref={ref} className={s.stack} style={{ justifyItems: 'center' }}>
        <Segmented
          label="Show the table as"
          options={[
            { value: 'values', label: <span className={s.mono}>df</span> },
            { value: 'isna', label: <span className={s.mono}>df.isna()</span> },
          ]}
          value={view}
          onChange={setView}
        />
        <div
          ref={wideRef}
          style={{ display: 'grid', gridTemplateColumns: stacked ? 'minmax(0, 1fr)' : 'max-content minmax(0, 1fr)', gap: '0.9rem 1.2rem', width: '100%', alignItems: 'start' }}
        >
          <div className={s.scroll} ref={scrollRef} style={fade}>
            <table className={`${s.table} ${s.compact}${narrow ? ` ${s.tiny}` : ''}`} aria-label={view === 'values' ? 'HDB resale records with missing values' : 'df.isna(): True where a value is missing'}>
              <thead>
                <tr>
                  <th className={s.corner} />
                  {MM_COLS.map((c) => (
                    <th key={c} style={colStyle(c)}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: N }, (_, i) => (
                  <tr key={i}>
                    <th scope="row">{i}</th>
                    {MM_COLS.map((c) => {
                      const m = miss[c][i]
                      const cls = view === 'isna' ? (m ? s.isnaTrue : s.isnaFalse) : m ? s.missing : undefined
                      return (
                        <td key={c} className={`${s.clickable}${cls ? ` ${cls}` : ''}`} style={colStyle(c)} onClick={() => toggle(c, i)} title={m ? 'click to fill in' : 'click to blank out'}>
                          {view === 'isna' ? (m ? 'True' : 'False') : shown[c][i]}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th className={s.corner}>dtype</th>
                  {MM_COLS.map((c) => (
                    <td key={c}>{view === 'isna' ? 'bool' : dtype[c]}</td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          <div className={s.stack}>
            <Segmented
              label="Count or fraction"
              options={[
                { value: 'sum', label: <span className={s.mono}>.isna().sum()</span> },
                { value: 'mean', label: <span className={s.mono}>.isna().mean()</span> },
              ]}
              value={agg}
              onChange={setAgg}
            />
            <div className={s.mbars} onMouseLeave={() => setHot(null)}>
              {MM_COLS.map((c, j) => {
                const k = counts[j]
                return (
                  <div key={c} className={`${s.mbar}${hot === c ? ` ${s.mbarOn}` : ''}`} onMouseEnter={() => setHot(c)}>
                    <button type="button" className={s.mbarLabel} onFocus={() => setHot(c)} onBlur={() => setHot(null)} onClick={() => setHot(c)} aria-label={`${c}: ${k} missing`}>
                      {c}
                    </button>
                    <span className={s.mbarTrack} onClick={() => setHot(c)}>
                      <span className={s.mbarFill} style={{ width: `${(k / N) * 100}%`, background: barColour(k) }} />
                    </span>
                    <span className={s.mbarValue}>{agg === 'sum' ? k : (k / N).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
            <div className={s.io}>
              <pre className={s.code}>{hot ? `print(df['${hot}'].isna().${agg}())` : `print(df.isna().${agg}())`}</pre>
              <pre className={s.out}>
                {hot
                  ? agg === 'sum'
                    ? String(hotCount)
                    : pyFloat(hotCount / N)
                  : printed.map((ln, i) => (
                      <span key={i} className={i === hotIdx ? s.lineOn : undefined}>
                        {ln}
                        {i < printed.length - 1 ? '\n' : ''}
                      </span>
                    ))}
              </pre>
              {hot && (
                <div className={s.hint} style={{ textAlign: 'left' }}>
                  <strong>{hot}</strong>: {hotCount} of {N} missing, {advice(hotCount)}.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={s.resultLine} style={{ justifyContent: 'center', gap: '0.4rem 1.2rem' }} aria-live="polite">
          <span>
            missing cells: <strong className={s.mono}>{total}</strong> of {N * MM_COLS.length}
          </span>
          <span>
            <code>df.dropna()</code> keeps <strong className={s.mono}>{completeRows}</strong> of {N} rows
          </span>
          <span>
            drop <code>reno</code> first: keeps <strong className={s.mono}>{completeNoReno}</strong>
          </span>
        </div>
      </div>
    </Figure>
  )
}
