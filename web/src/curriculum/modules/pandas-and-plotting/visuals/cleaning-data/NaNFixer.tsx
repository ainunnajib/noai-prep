import { useRef, useState, type ReactNode } from 'react'
import { Figure, useNarrow } from '../../../../../kit'
import s from './clean.module.css'
import { useScrollFade } from '../dataframes-and-selection/scrollFade'
import { W_COLS, W_DATA, W_DAYS, fmtFloatColumn, type WCol } from './data'

/*
  One week of weather-station readings with gaps, before and after a chosen fix. Dropped rows
  and columns stay visible as struck-out ghosts, filled-in cells are tinted, and the shape and
  column means are recomputed so the learner sees what each method costs: lost data (dropna)
  or invented data (fillna, ffill, interpolate). Every number matches pandas 2.2 exactly.
*/

type Method = 'dropna' | 'dropcol' | 'dropna1' | 'fill0' | 'fillmed' | 'ffill' | 'interp'
type Col = (number | null)[]
type Frame = Record<WCol, Col>

const METHODS: { id: Method; code: string }[] = [
  { id: 'dropna', code: 'df.dropna()' },
  { id: 'dropcol', code: "df.drop(columns=['uv'])" },
  { id: 'dropna1', code: 'df.dropna(axis=1)' },
  { id: 'fill0', code: 'df.fillna(0)' },
  { id: 'fillmed', code: 'df.fillna(df.median())' },
  { id: 'ffill', code: 'df.ffill()' },
  { id: 'interp', code: 'df.interpolate()' },
]

const nanMean = (c: Col) => {
  const v = c.filter((x): x is number => x !== null)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}
const nanMedian = (c: Col) => {
  const v = c.filter((x): x is number => x !== null).sort((a, b) => a - b)
  const m = v.length >> 1
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}
const ffill = (c: Col): Col => {
  let last: number | null = null
  return c.map((x) => (x === null ? last : (last = x)))
}
/** pandas' default linear interpolate: straight lines between known points; trailing gaps copy the last value; leading gaps stay NaN */
const interp = (c: Col): Col => {
  const out = [...c]
  const known = c.map((x, i) => (x === null ? -1 : i)).filter((i) => i >= 0)
  for (let i = 0; i < c.length; i++) {
    if (c[i] !== null) continue
    const before = known.filter((k) => k < i).pop()
    const after = known.find((k) => k > i)
    if (before === undefined) continue
    if (after === undefined) out[i] = c[before]
    else out[i] = (c[before] as number) + (((c[after] as number) - (c[before] as number)) * (i - before)) / (after - before)
  }
  return out
}

interface Result {
  frame: Frame
  keepRows: boolean[]
  keepCols: Record<WCol, boolean>
}

function apply(m: Method): Result {
  const keepRows = W_DAYS.map(() => true)
  const keepCols = { temp: true, rain: true, humid: true, uv: true }
  const frame = {} as Frame
  for (const c of W_COLS) frame[c] = [...W_DATA[c]]
  if (m === 'dropna') W_DAYS.forEach((_, i) => (keepRows[i] = W_COLS.every((c) => W_DATA[c][i] !== null)))
  if (m === 'dropna1') for (const c of W_COLS) keepCols[c] = W_DATA[c].every((x) => x !== null)
  if (m === 'dropcol') keepCols.uv = false
  for (const c of W_COLS) {
    if (m === 'fill0') frame[c] = W_DATA[c].map((x) => (x === null ? 0 : x))
    if (m === 'fillmed') {
      const med = nanMedian(W_DATA[c])
      frame[c] = W_DATA[c].map((x) => (x === null ? med : x))
    }
    if (m === 'ffill') frame[c] = ffill(W_DATA[c])
    if (m === 'interp') frame[c] = interp(W_DATA[c])
  }
  return { frame, keepRows, keepCols }
}

const fmt2 = (v: number | null) => (v === null ? '—' : v.toFixed(2))

function WTable({ title, frame, keepRows, keepCols, before }: { title: string; frame: Frame; keepRows: boolean[]; keepCols: Record<WCol, boolean>; before?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const fade = useScrollFade(scrollRef, title)
  // format each column like pandas would print the surviving values
  const shown = {} as Record<WCol, string[]>
  for (const c of W_COLS) {
    const live = frame[c].map((x, i) => (keepRows[i] ? x : null))
    const f = fmtFloatColumn(frame[c])
    const fLive = fmtFloatColumn(live)
    shown[c] = frame[c].map((_, i) => (keepRows[i] ? fLive[i] : f[i]))
  }
  return (
    <div style={{ minWidth: 0 }}>
      <div className={s.tableTitle}>{title}</div>
      <div className={s.scroll} ref={scrollRef} style={fade}>
        <table className={`${s.table} ${s.compact}`} aria-label={title}>
          <thead>
            <tr>
              <th className={s.corner} />
              {W_COLS.map((c) => (
                <th key={c} className={keepCols[c] ? undefined : s.ghostCol}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {W_DAYS.map((d, i) => (
              <tr key={d} className={keepRows[i] ? undefined : `${s.faded} ${s.strike}`}>
                <th scope="row">{d}</th>
                {W_COLS.map((c) => {
                  const v = frame[c][i]
                  const wasNaN = W_DATA[c][i] === null
                  const filled = !before && wasNaN && v !== null
                  const cls = !keepCols[c] ? s.ghostCol : filled ? s.changed : v === null ? s.missing : undefined
                  return (
                    <td key={c} className={cls}>
                      {shown[c][i]}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function NaNFixer() {
  const [m, setM] = useState<Method>('dropna')
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const r = apply(m)
  const all = { temp: true, rain: true, humid: true, uv: true }
  const rowsKept = r.keepRows.filter(Boolean).length
  const colsKept = W_COLS.filter((c) => r.keepCols[c])
  const invented = W_COLS.reduce((n, c) => n + W_DATA[c].filter((x, i) => x === null && r.frame[c][i] !== null && r.keepRows[i] && r.keepCols[c]).length, 0)
  const stillNaN = W_COLS.reduce((n, c) => n + (r.keepCols[c] ? r.frame[c].filter((x, i) => x === null && r.keepRows[i]).length : 0), 0)
  const meanAfter = (c: WCol) => (r.keepCols[c] && rowsKept ? nanMean(r.frame[c].filter((_, i) => r.keepRows[i])) : null)
  // after dropping uv, how many rows would a following dropna() keep?
  const completeNoUv = W_DAYS.filter((_, i) => W_COLS.filter((c) => c !== 'uv').every((c) => W_DATA[c][i] !== null)).length
  const tBefore = nanMean(W_DATA.temp) as number
  const tAfter = meanAfter('temp')

  const story: Record<Method, ReactNode> = {
    dropna: (
      <>
        Complete-case analysis: nothing is invented, but every row with <em>any</em> gap is thrown away. The patchy UV sensor
        alone takes out most of the week, leaving {rowsKept} of 7 rows.
      </>
    ),
    dropcol: (
      <>
        Only the patchy <code>uv</code> column goes (4 of its 7 readings are missing); every day survives. The gaps in <code>temp</code> and{' '}
        <code>humid</code> remain, but now a <code>dropna()</code> afterwards would keep {completeNoUv} rows instead of 1.
      </>
    ),
    dropna1: (
      <>
        Every column with even one gap is removed, including <code>temp</code>, the reading you probably cared about. Only{' '}
        <code>{colsKept.join(', ')}</code> survives.
      </>
    ),
    fill0: (
      <>
        0 °C in Singapore? Filling with a value that could never happen drags the temperature mean from {tBefore.toFixed(2)}{' '}
        down to {fmt2(tAfter)}. A constant is only safe when it really means something (0 mm of rain, say).
      </>
    ),
    fillmed: (
      <>
        Each gap gets its column's median, so the means barely move (temp {tBefore.toFixed(2)} → {fmt2(tAfter)}). But it
        ignores time: Tue, Fri and Sat all get the same 30.75 °C.
      </>
    ),
    ffill: (
      <>
        Each gap copies the last reading before it ("carry forward"). Natural for readings that change slowly, but Mon's{' '}
        <code>uv</code> stays NaN because nothing comes before it.
      </>
    ),
    interp: (
      <>
        Each gap sits on a straight line between its neighbours: Fri and Sat become 31.5 and 31.0, between Thu's 32.0 and
        Sun's 30.5. A gap at the end has no right-hand neighbour, so pandas just repeats the last value (<code>uv</code> on Sat and Sun = 11.0), and a gap
        at the very start (Mon's <code>uv</code>) stays NaN. Usually the best guess for smooth time series.
      </>
    ),
  }

  return (
    <Figure
      title="Drop it, fill it or estimate it"
      caption={
        <>
          Pick a method. Removed rows and columns stay visible as struck-out ghosts, filled-in values are tinted green, and the
          shape and column means are recalculated. Notice the trade: <code>dropna</code> loses real data, while every{' '}
          <code>fill</code> invents data, and the change in shape tells you which one you chose.
        </>
      }
    >
      <div ref={ref} className={s.stack} style={{ justifyItems: 'center' }}>
        <div className={s.chips} role="group" aria-label="Missing-value method">
          {METHODS.map((x) => (
            <button key={x.id} type="button" className={`${s.chip} ${s.codeChip}`} aria-pressed={m === x.id} onClick={() => setM(x.id)}>
              {x.code}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.8rem', width: '100%' }}>
          <WTable title="before: df" frame={W_DATA} keepRows={W_DAYS.map(() => true)} keepCols={all} before />
          <WTable title={`after: ${METHODS.find((x) => x.id === m)?.code}`} frame={r.frame} keepRows={r.keepRows} keepCols={r.keepCols} />
        </div>
        <div className={s.resultLine} style={{ justifyContent: 'center', gap: '0.3rem 1.2rem' }} aria-live="polite">
          <span>
            shape <strong className={s.mono}>(7, 4)</strong> → <strong className={s.mono}>({rowsKept}, {colsKept.length})</strong>
          </span>
          <span>
            values invented: <strong className={s.mono}>{invented}</strong>
          </span>
          <span>
            NaN left: <strong className={s.mono}>{stillNaN}</strong>
          </span>
        </div>
        <table className={s.readTable} aria-label="Column means before and after">
          <thead>
            <tr>
              <th>column mean</th>
              <th>before</th>
              <th>after</th>
              <th>change</th>
            </tr>
          </thead>
          <tbody>
            {W_COLS.map((c) => {
              const b = nanMean(W_DATA[c]) as number
              const a = meanAfter(c)
              const d = a === null ? null : a - b
              const big = d !== null && Math.abs(d) > 0.05 * Math.abs(b)
              return (
                <tr key={c}>
                  <td>{c}</td>
                  <td>{b.toFixed(2)}</td>
                  <td>{a === null ? 'dropped' : a.toFixed(2)}</td>
                  <td style={{ fontWeight: big ? 800 : 400, color: big ? 'var(--ink)' : 'var(--ink-2)' }}>
                    {d === null ? '—' : `${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(2)}`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className={s.hint} style={{ marginTop: '-0.3rem' }}>
          bold: the mean moved by more than 5%
        </div>
        <div className={s.note}>{story[m]}</div>
      </div>
    </Figure>
  )
}
