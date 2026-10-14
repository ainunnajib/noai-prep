import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Button } from '../../../../../kit'

/*
  The same categorical column encoded two ways, plus the distance between every pair of
  encoded categories. Town has no natural order; flat type does.
*/

type Col = 'town' | 'flat'
type Enc = 'integer' | 'onehot'

const TOWNS = ['Ang Mo Kio', 'Bedok', 'Clementi', 'Jurong West', 'Punggol', 'Tampines']
const TOWN_SHORT = ['AMK', 'BDK', 'CLE', 'JW', 'PGL', 'TAM']
const FLATS = ['2-room', '3-room', '4-room', '5-room', 'Executive']
const FLAT_SHORT = ['2R', '3R', '4R', '5R', 'EX']
// which category each of the six example rows holds (indices into the category list)
const ROWS = [1, 0, 2, 1, 3, 4]

const cell: CSSProperties = { padding: '0.25rem 0.45rem', textAlign: 'center', whiteSpace: 'nowrap' }

export default function EncodingCompare() {
  const [col, setCol] = useState<Col>('town')
  const [enc, setEnc] = useState<Enc>('integer')
  const [k, setK] = useState(3)

  const cats = col === 'town' ? TOWNS : FLATS
  const short = col === 'town' ? TOWN_SHORT : FLAT_SHORT
  const maxK = cats.length
  const K = Math.min(k, maxK)
  const used = cats.slice(0, K)
  const rows = ROWS.map((r) => r % K)

  const vec = (c: number) => (enc === 'integer' ? [c] : used.map((_, j) => (j === c ? 1 : 0)))
  const dist = (a: number, b: number) => {
    const va = vec(a)
    const vb = vec(b)
    return Math.sqrt(va.reduce((s, v, j) => s + (v - vb[j]) ** 2, 0))
  }
  const maxD = enc === 'integer' ? K - 1 : Math.SQRT2
  const fmtD = (d: number) => (d === 0 ? '0' : enc === 'onehot' ? '√2' : String(d))

  const intName = col === 'town' ? 'label encoding' : 'ordinal encoding'
  let verdict: string
  if (col === 'town' && enc === 'integer')
    verdict = `The codes follow the alphabet, so the model is told that ${used[0]} → ${used[1]} → ${used[2]} is a scale, and that ${used[2]} is twice as far from ${used[0]} as ${used[1]} is. None of that is true: it is invented.`
  else if (col === 'town')
    verdict = 'Every pair of different towns is exactly √2 apart. No town is “between” two others, and no order is invented.'
  else if (enc === 'integer')
    verdict = 'Here the order is real: a 4-room flat is bigger than a 3-room flat, which is bigger than a 2-room flat. Ordinal codes keep that information, and neighbouring sizes are closest.'
  else verdict = 'One-hot treats a 2-room and a 5-room flat as just as different as a 4-room and a 5-room flat. It throws the real order away.'

  return (
    <Figure
      wide
      title="Label encoding versus one-hot encoding"
      caption={
        <>
          Choose a column and an encoding. The table shows the numbers a model would actually receive, and the grid shows the Euclidean distance
          between every pair of encoded categories (darker = further apart). Add categories and watch the number of columns. Then switch to the
          ordered column, flat type.
        </>
      }
    >
      <Controls>
        <Segmented<Col>
          label="Column"
          value={col}
          onChange={(c) => {
            setCol(c)
            setK(3)
          }}
          options={[
            { value: 'town', label: 'town (no order)' },
            { value: 'flat', label: 'flat type (ordered)' },
          ]}
        />
        <Segmented<Enc>
          label="Encoding"
          value={enc}
          onChange={setEnc}
          options={[
            { value: 'integer', label: col === 'town' ? 'label (0, 1, 2…)' : 'ordinal (0, 1, 2…)' },
            { value: 'onehot', label: 'one-hot' },
          ]}
        />
        <Button onClick={() => setK((x) => (x >= maxK ? 2 : x + 1))}>{K >= maxK ? 'Reset categories' : `+ add ${cats[K]}`}</Button>
      </Controls>
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.3rem' }}>What the model receives</div>
          <div className="table-wrap" style={{ margin: 0 }}>
            <table style={{ fontSize: 'var(--step--1)', borderCollapse: 'collapse', margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ ...cell, textAlign: 'left' }}>{col === 'town' ? 'town' : 'flat type'}</th>
                  {enc === 'integer' ? (
                    <th style={cell}>code</th>
                  ) : (
                    used.map((c, j) => (
                      <th key={c} style={{ ...cell, color: 'var(--viz-1)' }} title={c}>
                        {`is_${short[j]}`}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody className="tabular">
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...cell, textAlign: 'left' }}>{used[r]}</td>
                    {enc === 'integer' ? (
                      <td style={{ ...cell, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r}</td>
                    ) : (
                      used.map((_, j) => (
                        <td
                          key={j}
                          style={{
                            ...cell,
                            fontFamily: 'var(--font-mono)',
                            fontWeight: j === r ? 700 : 400,
                            color: j === r ? 'var(--ink)' : 'var(--ink-3)',
                            background: j === r ? 'color-mix(in srgb, var(--viz-1) 18%, transparent)' : undefined,
                          }}
                        >
                          {j === r ? 1 : 0}
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.3rem' }}>Distance between encoded categories</div>
          <div
            role="table"
            aria-label="Distances between every pair of encoded categories"
            style={{ display: 'grid', gridTemplateColumns: `max-content repeat(${K}, minmax(28px, 40px))`, justifyContent: 'start', gap: 3, fontSize: 12, fontFamily: 'var(--font-mono)', alignItems: 'center' }}
          >
            <span />
            {short.slice(0, K).map((s) => (
              <span key={s} style={{ textAlign: 'center', color: 'var(--ink-3)', fontWeight: 700 }}>
                {s}
              </span>
            ))}
            {used.map((_, a) => [
              <span key={`r${a}`} style={{ color: 'var(--ink-3)', fontWeight: 700, paddingRight: 4 }}>
                {short[a]}
              </span>,
              ...used.map((__, b) => {
                const d = dist(a, b)
                const t = maxD ? d / maxD : 0
                return (
                  <span
                    key={`${a}-${b}`}
                    role="cell"
                    style={{
                      height: 30,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 4,
                      color: t > 0.6 ? 'var(--surface)' : 'var(--ink)',
                      background: `color-mix(in srgb, var(--viz-1) ${Math.round(6 + t * 74)}%, var(--surface))`,
                    }}
                  >
                    {fmtD(d)}
                  </span>
                )
              }),
            ])}
          </div>
        </div>
      </div>
      <p style={{ margin: 0, width: '100%', fontSize: 'var(--step--1)', color: 'var(--ink-2)' }}>{verdict}</p>
      <Readout
        items={[
          ['encoding', enc === 'integer' ? intName : 'one-hot'],
          ['categories', String(K)],
          ['columns the model gets', enc === 'integer' ? '1' : `${K} (one per category)`],
        ]}
      />
    </Figure>
  )
}
