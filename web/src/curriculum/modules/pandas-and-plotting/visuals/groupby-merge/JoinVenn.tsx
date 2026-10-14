import { useId, useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Toggle, Readout } from '../../../../../kit'
import s from './gm.module.css'

/*
  pd.merge(students, cca, on='id', how=…). Two small tables, a Venn diagram of their key sets
  and the merged result. The merge below follows pandas' rules exactly: inner and left keep the
  left table's order, right keeps the right table's order, outer sorts the keys; a key that
  appears k times on one side and m times on the other gives k × m rows.
*/

type How = 'inner' | 'left' | 'right' | 'outer'
interface Student {
  id: number
  name: string
  cls: string
}
interface Cca {
  id: number
  cca: string
}
interface Out {
  id: number
  name: string | null
  cls: string | null
  cca: string | null
}

const STUDENTS: Student[] = [
  { id: 101, name: 'Aisha', cls: '3A' },
  { id: 102, name: 'Ben', cls: '3A' },
  { id: 103, name: 'Chen', cls: '3B' },
  { id: 104, name: 'Dev', cls: '3B' },
]
const CCA_BASE: Cca[] = [
  { id: 102, cca: 'Robotics' },
  { id: 103, cca: 'Choir' },
  { id: 105, cca: 'Netball' },
]
const CCA_DUP: Cca[] = [
  { id: 102, cca: 'Robotics' },
  { id: 103, cca: 'Choir' },
  { id: 103, cca: 'Football' },
  { id: 105, cca: 'Netball' },
]

function merge(left: Student[], right: Cca[], how: How): Out[] {
  const row = (l: Student | null, r: Cca | null, id: number): Out => ({
    id,
    name: l?.name ?? null,
    cls: l?.cls ?? null,
    cca: r?.cca ?? null,
  })
  const out: Out[] = []
  if (how === 'inner' || how === 'left') {
    for (const l of left) {
      const ms = right.filter((r) => r.id === l.id)
      if (ms.length) ms.forEach((r) => out.push(row(l, r, l.id)))
      else if (how === 'left') out.push(row(l, null, l.id))
    }
  } else if (how === 'right') {
    for (const r of right) {
      const ms = left.filter((l) => l.id === r.id)
      if (ms.length) ms.forEach((l) => out.push(row(l, r, r.id)))
      else out.push(row(null, r, r.id))
    }
  } else {
    const keys = [...new Set([...left.map((l) => l.id), ...right.map((r) => r.id)])].sort((a, b) => a - b)
    for (const k of keys) {
      const ls = left.filter((l) => l.id === k)
      const rs = right.filter((r) => r.id === k)
      if (ls.length && rs.length) ls.forEach((l) => rs.forEach((r) => out.push(row(l, r, k))))
      else if (ls.length) ls.forEach((l) => out.push(row(l, null, k)))
      else rs.forEach((r) => out.push(row(null, r, k)))
    }
  }
  return out
}

const EXPLAIN: Record<How, ReactNode> = {
  inner: (
    <>
      <b>inner</b> keeps only the ids found in <i>both</i> tables (the overlap). Aisha and Dev have no CCA row, and nobody in the class list is 105, so all
      three disappear.
    </>
  ),
  left: (
    <>
      <b>left</b> keeps <i>every row of the left table</i> (students). Aisha and Dev have no CCA row, so their <code>cca</code> is filled with <code>NaN</code>,
      pandas' marker for a missing value. CCA row 105 has no student and is dropped.
    </>
  ),
  right: (
    <>
      <b>right</b> keeps <i>every row of the right table</i> (cca). Id 105 has no student, so its <code>name</code> and <code>class</code> are <code>NaN</code>.
      Aisha and Dev are dropped.
    </>
  ),
  outer: (
    <>
      <b>outer</b> keeps <i>every id from either table</i>, sorted, and fills each gap with <code>NaN</code>. Nothing is lost, but you may get holes to clean
      up.
    </>
  ),
}

export default function JoinVenn() {
  const [how, setHow] = useState<How>('left')
  const [dup, setDup] = useState(false)
  const [focus, setFocus] = useState<number | null>(null)
  const clipId = useId().replace(/:/g, '')
  const cca = dup ? CCA_DUP : CCA_BASE
  const result = useMemo(() => merge(STUDENTS, cca, how), [cca, how])

  const leftIds = new Set(STUDENTS.map((x) => x.id))
  const rightIds = new Set(cca.map((x) => x.id))
  const keepLeftOnly = how === 'left' || how === 'outer'
  const keepRightOnly = how === 'right' || how === 'outer'
  const kept = (id: number) => (leftIds.has(id) && rightIds.has(id)) || (leftIds.has(id) ? keepLeftOnly : keepRightOnly)

  // Venn geometry (SVG user units; the SVG scales to its box)
  const W = 300
  const H = 178
  const R = 66
  const cxL = 112
  const cxR = 188
  const cy = 96
  const keyPos: Record<number, [number, number]> = {
    101: [76, 82],
    104: [76, 112],
    102: [150, 82],
    103: [150, 112],
    105: [224, 98],
  }
  const fillC = 'var(--viz-1)'

  const nan = <span>NaN</span>
  const cell = (v: string | null) => (v == null ? nan : v)
  const rowClass = (id: number, isKept = true) => [focus === id ? s.focus : '', isKept ? '' : s.faded].join(' ')

  return (
    <Figure
      title="Merging two tables on a key"
      caption={
        <>
          Pick a join type and watch which part of the Venn diagram is shaded and which rows survive. Tap an id in the diagram to light up its rows in every
          table. Then switch on <b>Chen has two CCAs</b>: one key matching two rows makes <b>two</b> output rows, so a merge can return more rows than either
          input.
        </>
      }
    >
      <Controls>
        <Segmented
          label="how ="
          value={how}
          onChange={setHow}
          options={(['inner', 'left', 'right', 'outer'] as How[]).map((h) => ({ value: h, label: `'${h}'` }))}
        />
        <Toggle label="Chen has two CCAs" checked={dup} onChange={setDup} />
      </Controls>

      <div className={s.code}>
        result = pd.merge(students, cca, on='id', how='<b>{how}</b>')
      </div>

      <div className={s.tables}>
        <div className={s.tableBox}>
          <div className={s.tableTitle}>
            left: <code>students</code>
          </div>
          <table className={s.tbl}>
            <thead>
              <tr>
                <th>id</th>
                <th>name</th>
                <th>class</th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((r) => (
                <tr key={r.id} className={rowClass(r.id, kept(r.id))}>
                  <td style={{ fontWeight: 700 }}>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.cls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={s.tableBox}>
          <div className={s.tableTitle}>
            right: <code>cca</code>
          </div>
          <table className={s.tbl}>
            <thead>
              <tr>
                <th>id</th>
                <th>cca</th>
              </tr>
            </thead>
            <tbody>
              {cca.map((r, i) => (
                <tr key={`${r.id}-${i}`} className={rowClass(r.id, kept(r.id))}>
                  <td style={{ fontWeight: 700 }}>{r.id}</td>
                  <td>
                    {r.cca}
                    {dup && r.id === 103 && <span className={s.badge}>×2</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={s.tablesWide}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', maxWidth: 330, justifySelf: 'center', overflow: 'visible' }}
          role="group"
          aria-label="Venn diagram of the ids in each table"
        >
          <defs>
            <clipPath id={`${clipId}-r`}>
              <circle cx={cxR} cy={cy} r={R} />
            </clipPath>
          </defs>
          {/* shaded = rows that survive this join */}
          <g style={{ opacity: 0.28 }}>
            {keepLeftOnly && <circle cx={cxL} cy={cy} r={R} style={{ fill: fillC }} />}
            {keepRightOnly && <circle cx={cxR} cy={cy} r={R} style={{ fill: fillC }} />}
            <circle cx={cxL} cy={cy} r={R} clipPath={`url(#${clipId}-r)`} style={{ fill: fillC }} />
          </g>
          <circle cx={cxL} cy={cy} r={R} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 1.6 }} />
          <circle cx={cxR} cy={cy} r={R} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 1.6 }} />
          <text x={cxL - 30} y={18} textAnchor="middle" className="plot-label" style={{ fontSize: 13 }}>
            students.id
          </text>
          <text x={cxR + 30} y={18} textAnchor="middle" className="plot-label" style={{ fontSize: 13 }}>
            cca.id
          </text>
          {Object.entries(keyPos).map(([k, [x, y]]) => {
            const id = Number(k)
            if (!leftIds.has(id) && !rightIds.has(id)) return null
            const on = kept(id)
            const isF = focus === id
            return (
              <g
                key={k}
                role="button"
                tabIndex={0}
                aria-label={`id ${id}${on ? ', kept' : ', dropped'}`}
                aria-pressed={isF}
                style={{ cursor: 'pointer', outline: 'none' }}
                onClick={() => setFocus(isF ? null : id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setFocus(isF ? null : id)
                  }
                }}
              >
                <rect
                  x={x - 20}
                  y={y - 12}
                  width={40}
                  height={24}
                  rx={7}
                  style={{
                    fill: isF ? 'color-mix(in srgb, var(--highlight) 70%, var(--surface))' : 'var(--surface)',
                    stroke: on ? 'var(--viz-1)' : 'var(--viz-muted)',
                    strokeWidth: isF ? 2.5 : 1.5,
                    strokeDasharray: on ? undefined : '3 3',
                  }}
                />
                <text
                  x={x}
                  y={y}
                  dy="0.35em"
                  textAnchor="middle"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 700,
                    fill: on ? 'var(--viz-ink)' : 'var(--viz-muted)',
                    textDecoration: on ? undefined : 'line-through',
                  }}
                >
                  {id}
                </text>
                {dup && id === 103 && (
                  <text x={x + 23} y={y + 4} style={{ fontSize: 11, fontWeight: 700, fill: 'var(--viz-2)' }}>
                    ×2
                  </text>
                )}
              </g>
            )
          })}
          <text x={W / 2} y={H - 2} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ink-3)' }}>
            shaded = kept · dashed = dropped
          </text>
        </svg>

        <div className={s.tableBox}>
          <div className={s.tableTitle}>
            <code>result</code> ({result.length} rows)
          </div>
          <div className={s.scroll}>
            <table className={s.tbl}>
              <thead>
                <tr>
                  <th />
                  <th>id</th>
                  <th>name</th>
                  <th>class</th>
                  <th>cca</th>
                </tr>
              </thead>
              <tbody>
                {result.map((r, i) => (
                  <tr key={`${how}-${i}`} className={rowClass(r.id)}>
                    <td style={{ color: 'var(--ink-3)' }}>{i}</td>
                    <td style={{ fontWeight: 700 }}>{r.id}</td>
                    <td className={r.name == null ? s.nan : undefined}>{cell(r.name)}</td>
                    <td className={r.cls == null ? s.nan : undefined}>{cell(r.cls)}</td>
                    <td className={r.cca == null ? s.nan : undefined}>{cell(r.cca)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`${s.verdict} ${dup ? s.verdictWarn : ''}`} aria-live="polite">
        {EXPLAIN[how]}
        {dup && (
          <>
            {' '}
            With the duplicate, id 103 matches <b>two</b> CCA rows, so Chen appears twice
            {how === 'left' ? ': the result has 5 rows although the left table has only 4.' : '.'}
          </>
        )}
      </div>
      <Readout
        items={[
          ['students rows', STUDENTS.length],
          ['cca rows', cca.length],
          ['result rows', result.length],
          ['NaN cells', result.reduce((n, r) => n + [r.name, r.cls, r.cca].filter((v) => v == null).length, 0)],
        ]}
      />
    </Figure>
  )
}
