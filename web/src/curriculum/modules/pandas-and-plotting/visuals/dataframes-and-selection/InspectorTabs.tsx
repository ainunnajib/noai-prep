import { useState, type ReactNode } from 'react'
import { Figure, Segmented, useNarrow } from '../../../../../kit'
import s from './df.module.css'

/*
  The four "first look" commands on the running example, with their REAL pandas 2.2 output
  (generated with pandas 2.2.3, the version the in-browser Python runner uses). Highlighted
  pieces of each output are clickable and explain what that number is telling you.
*/

type Tab = 'head' | 'shape' | 'info' | 'describe' | 'vc'

interface Hot {
  /** line of the output (0-based) */
  line: number
  /** exact text to highlight on that line */
  text: string
  /** which occurrence of `text` on the line (default 0) */
  nth?: number
  note: ReactNode
}

interface TabDef {
  label: string
  code: string
  purpose: ReactNode
  out: string[]
  hots: Hot[]
}

const TABS: Record<Tab, TabDef> = {
  head: {
    label: 'head()',
    code: 'df.head()',
    purpose: <>The first 5 rows, so you can see what the data looks like.</>,
    out: [
      '       town  rooms   area   price',
      '0  Tampines      4   92.0  585000',
      '1     Bedok      3   67.0  398000',
      '2   Punggol      5  112.0  720000',
      '3  Tampines      3   68.0  430000',
      '4    Yishun      4    NaN  512000',
    ],
    hots: [
      { line: 5, text: 'NaN', note: <><strong>NaN</strong> ("Not a Number") is how pandas marks a <strong>missing value</strong>. You were lucky to see it in the first 5 rows; <code>info()</code> counts every one of them.</> },
      { line: 1, text: '92.0', note: <>The areas are whole numbers, yet they print as <code>92.0</code>: the whole column is stored as decimals (float). The NaN two rows down is the reason, because NaN is itself a float.</> },
      { line: 5, text: '4', nth: 0, note: <><code>head()</code> stops after 5 rows (labels 0 to 4). Use <code>df.head(10)</code> for more, or <code>df.tail()</code> for the last 5.</> },
    ],
  },
  shape: {
    label: 'shape',
    code: 'df.shape',
    purpose: <>How big is the table? A tuple <code>(rows, columns)</code>. No brackets after <code>shape</code>: it is an attribute, not a method.</>,
    out: ['(8, 4)'],
    hots: [
      { line: 0, text: '8', note: <><strong>8 rows</strong>: eight flats. <code>len(df)</code> gives the same number.</> },
      { line: 0, text: '4', note: <><strong>4 columns</strong>: town, rooms, area and price. The index (row labels) is not counted as a column.</> },
    ],
  },
  info: {
    label: 'info()',
    code: 'df.info()',
    purpose: <>One line per column: how many values are <strong>not missing</strong>, and the column's type.</>,
    out: [
      "<class 'pandas.core.frame.DataFrame'>",
      'RangeIndex: 8 entries, 0 to 7',
      'Data columns (total 4 columns):',
      ' #   Column  Non-Null Count  Dtype',
      '---  ------  --------------  -----',
      ' 0   town    8 non-null      object',
      ' 1   rooms   8 non-null      int64',
      ' 2   area    7 non-null      float64',
      ' 3   price   8 non-null      int64',
      'dtypes: float64(1), int64(2), object(1)',
      'memory usage: 388.0+ bytes',
    ],
    hots: [
      { line: 7, text: '7 non-null', note: <><strong>7 non-null out of 8 entries</strong>: one <code>area</code> is missing. Any non-null count below the number of rows means missing values, which you must deal with before training a model.</> },
      { line: 1, text: '8 entries', note: <>There are <strong>8 rows</strong>, labelled 0 to 7. Compare every non-null count with this number.</> },
      { line: 5, text: 'object', note: <><code>object</code> is pandas 2's name for a <strong>text</strong> column (pandas 3 prints <code>str</code>). If a column that should hold numbers shows <code>object</code>, some entries are text, such as <code>"450,000"</code>. The next lesson fixes that.</> },
      { line: 7, text: 'float64', note: <><code>float64</code> = 64-bit decimal numbers. <code>area</code> is float even though every area is whole, because NaN only exists as a float.</> },
    ],
  },
  describe: {
    label: 'describe()',
    code: 'df.describe()',
    purpose: <>Summary statistics for every <strong>numeric</strong> column: count, mean, spread and the five-number summary.</>,
    out: [
      '          rooms        area          price',
      'count  8.000000    7.000000       8.000000',
      'mean   4.000000   92.000000  567875.000000',
      'std    0.755929   19.991665  127066.279105',
      'min    3.000000   67.000000  398000.000000',
      '25%    3.750000   79.000000  491500.000000',
      '50%    4.000000   92.000000  562500.000000',
      '75%    4.250000  103.500000  628500.000000',
      'max    5.000000  120.000000  760000.000000',
    ],
    hots: [
      { line: 1, text: '7.000000', note: <><strong>count</strong> = number of non-missing values. 7 for <code>area</code> but 8 elsewhere: the same missing value that <code>info()</code> found. All the other <code>area</code> numbers are worked out from those 7 values only.</> },
      { line: 6, text: '562500.000000', note: <>The <strong>50%</strong> row is the <strong>median</strong>, the middle value once sorted. Here the median price (562,500) is a little below the mean (567,875): a couple of expensive flats pull the mean up.</> },
      { line: 5, text: '3.750000', note: <><strong>25%</strong> is the first quartile: a quarter of the values lie below it. With 8 values it falls between the 2nd and 3rd smallest (3 and 4), so pandas interpolates: 3 + 0.75 × (4 − 3) = 3.75.</> },
      { line: 3, text: 'std', note: <><strong>std</strong> = standard deviation, the typical distance from the mean. pandas divides by n − 1 (the sample version), while NumPy's <code>np.std</code> divides by n by default, so the two disagree slightly.</> },
      { line: 4, text: '67.000000', note: <><strong>min</strong> and <strong>max</strong> are your range check. Areas of 67 to 120 m² are sensible for 3- to 5-room flats; a min of 0 or a max of 9,999 would be a data-entry error to investigate.</> },
      { line: 0, text: 'rooms', note: <>Where is <code>town</code>? <code>describe()</code> skips text columns by default. Use <code>df['town'].value_counts()</code> for categories, or <code>df.describe(include='all')</code>.</> },
    ],
  },
  vc: {
    label: 'value_counts()',
    code: "df['town'].value_counts()",
    purpose: <>How often each category appears in one column, most common first.</>,
    out: ['town', 'Tampines    3', 'Bedok       2', 'Punggol     2', 'Yishun      1', 'Name: count, dtype: int64'],
    hots: [
      { line: 1, text: 'Tampines    3', note: <>Most common first: 3 of the 8 flats are in Tampines. Add <code>normalize=True</code> to get fractions instead (3/8 = 0.375).</> },
      { line: 4, text: 'Yishun      1', note: <>Rare categories show up at the bottom. Typos show up here too: <code>Tampines</code> and <code>tampines </code> would be counted as two different towns.</> },
      { line: 5, text: 'Name: count', note: <>The result is itself a <strong>Series</strong>: the town names are its index and the counts are its values (pandas 2 names it <code>count</code>).</> },
    ],
  },
}

const ORDER: Tab[] = ['head', 'shape', 'info', 'describe', 'vc']

function renderLine(text: string, line: number, hots: Hot[], active: number, onPick: (i: number) => void): ReactNode {
  // find each hotspot's [start, end) on this line, then cut the line into plain and clickable pieces
  const spans = hots
    .map((h, i) => ({ h, i }))
    .filter(({ h }) => h.line === line)
    .map(({ h, i }) => {
      let from = -1
      for (let k = 0; k <= (h.nth ?? 0); k++) from = text.indexOf(h.text, from + 1)
      return { i, start: from, end: from + h.text.length }
    })
    .filter((x) => x.start >= 0)
    .sort((a, b) => a.start - b.start)
  const parts: ReactNode[] = []
  let pos = 0
  for (const sp of spans) {
    if (sp.start < pos) continue
    parts.push(text.slice(pos, sp.start))
    parts.push(
      <button key={sp.i} type="button" className={`${s.hot}${active === sp.i ? ` ${s.hotOn}` : ''}`} onClick={() => onPick(sp.i)} aria-pressed={active === sp.i}>
        {text.slice(sp.start, sp.end)}
      </button>,
    )
    pos = sp.end
  }
  parts.push(text.slice(pos))
  return parts
}

export default function InspectorTabs() {
  const [tab, setTab] = useState<Tab>('info')
  const [active, setActive] = useState(0)
  const [ref, narrow] = useNarrow<HTMLDivElement>(480)
  const T = TABS[tab]
  const hot = T.hots[active] ?? T.hots[0]

  return (
    <Figure
      title="Thirty seconds of inspection"
      caption={
        <>
          Switch between the commands and click any <span className={s.hot}>highlighted</span> piece of output. Spot the
          single missing <code>area</code> in three different places: as NaN in <code>head()</code>, as 7 non-null in{' '}
          <code>info()</code> and as count 7 in <code>describe()</code>.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gap: '0.7rem', justifyItems: 'center' }}>
        <Segmented
          label="Command"
          options={ORDER.map((t) => ({ value: t, label: <span className={s.mono}>{TABS[t].label}</span> }))}
          value={tab}
          onChange={(t) => {
            setTab(t)
            setActive(0)
          }}
        />
        <div className={s.hint} style={{ textAlign: 'left', color: 'var(--ink-2)' }}>
          {T.purpose}
        </div>
        <pre className={`${s.console}${narrow ? ` ${s.consoleNarrow}` : ''}`} aria-label={`Output of ${T.code}`}>
          <span className={s.prompt}>{T.code}</span>
          {'\n'}
          {T.out.map((ln, i) => (
            <span key={i}>
              {renderLine(ln, i, T.hots, active, setActive)}
              {i < T.out.length - 1 ? '\n' : ''}
            </span>
          ))}
        </pre>
        <div className={s.note} aria-live="polite">
          {hot.note}
        </div>
      </div>
    </Figure>
  )
}
