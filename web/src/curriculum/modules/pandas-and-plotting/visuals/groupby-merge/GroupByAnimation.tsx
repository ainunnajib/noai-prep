import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Segmented, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import s from './gm.module.css'

/*
  Split → apply → combine, animated. Eight HDB resale rows (price in $ thousands) slide into
  one pile per group, each pile is reduced to one summary row, and the summary rows stack
  into the result table whose index is the grouping column. Every number is computed here.
*/

type Key = 'town' | 'flat_type'
type Agg = 'mean' | 'sum' | 'count' | 'max'
interface Row {
  town: string
  flat_type: string
  area: number
  price: number
}

const ROWS: Row[] = [
  { town: 'Tampines', flat_type: '4-room', area: 90, price: 520 },
  { town: 'Bishan', flat_type: '3-room', area: 70, price: 480 },
  { town: 'Woodlands', flat_type: '4-room', area: 90, price: 460 },
  { town: 'Tampines', flat_type: '3-room', area: 70, price: 400 },
  { town: 'Bishan', flat_type: '4-room', area: 95, price: 700 },
  { town: 'Woodlands', flat_type: '3-room', area: 70, price: 350 },
  { town: 'Tampines', flat_type: '5-room', area: 110, price: 640 },
  { town: 'Woodlands', flat_type: '5-room', area: 125, price: 540 },
]

const COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)']
const ROW_H = 30
const HEAD_H = 32
const LABEL_H = 26
/** on phones the worked formula goes on a second line under the group name */
const LABEL_H_NARROW = 44
const GAP = 12
const STEP_NAMES = ['1 · the table', '2 · split', '3 · apply', '4 · combine']

function aggregate(vals: number[], agg: Agg): number {
  switch (agg) {
    case 'mean':
      return vals.reduce((a, b) => a + b, 0) / vals.length
    case 'sum':
      return vals.reduce((a, b) => a + b, 0)
    case 'count':
      return vals.length
    case 'max':
      return Math.max(...vals)
  }
}

/** Format like pandas (means are floats: 590.0, 82.5); long decimals are rounded to 2 places (pandas prints 91.666667). */
function fmt(v: number, agg: Agg): string {
  if (agg !== 'mean') return String(v)
  if (Number.isInteger(v)) return v.toFixed(1)
  return String(Math.round(v * 100) / 100)
}

function formula(vals: number[], agg: Agg): string {
  const v = fmt(aggregate(vals, agg), agg)
  switch (agg) {
    case 'mean':
      return `(${vals.join(' + ')}) / ${vals.length} = ${v}`
    case 'sum':
      return `${vals.join(' + ')} = ${v}`
    case 'count':
      return `${vals.length} values → ${v}`
    case 'max':
      return `max(${vals.join(', ')}) = ${v}`
  }
}

export default function GroupByAnimation() {
  const [key, setKey] = useState<Key>('town')
  const [agg, setAgg] = useState<Agg>('mean')
  const player = usePlayer({ steps: 4, interval: 1700 })
  const step = player.step
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(470)
  const other: Key = key === 'town' ? 'flat_type' : 'town'

  const labelH = narrow ? LABEL_H_NARROW : LABEL_H
  const layout = useMemo(() => {
    const keys = [...new Set(ROWS.map((r) => r[key]))].sort()
    const members = keys.map((k) => ROWS.map((r, i) => ({ r, i })).filter((x) => x.r[key] === k))
    // split / apply positions
    const blockTop: number[] = []
    let y = HEAD_H + 8
    for (const m of members) {
      blockTop.push(y)
      y += labelH + m.length * ROW_H + ROW_H + GAP
    }
    const splitHeight = y - GAP
    const groupOf = ROWS.map((r) => keys.indexOf(r[key]))
    const posInGroup = ROWS.map((_, i) => members[groupOf[i]].findIndex((x) => x.i === i))
    const summaries = members.map((m) => ({
      area: aggregate(
        m.map((x) => x.r.area),
        agg,
      ),
      price: aggregate(
        m.map((x) => x.r.price),
        agg,
      ),
      formula: formula(
        m.map((x) => x.r.price),
        agg,
      ),
    }))
    return { keys, members, blockTop, splitHeight, groupOf, posInGroup, summaries }
  }, [key, agg, labelH])

  const { keys, members, blockTop, splitHeight, groupOf, posInGroup, summaries } = layout
  const heights = [HEAD_H + ROWS.length * ROW_H + 4, splitHeight, splitHeight, HEAD_H + keys.length * ROW_H + 4]

  const rowTop = (i: number) => {
    const g = groupOf[i]
    if (step === 0) return HEAD_H + i * ROW_H
    if (step === 3) return HEAD_H + g * ROW_H
    return blockTop[g] + labelH + posInGroup[i] * ROW_H
  }
  const summaryTop = (g: number) => (step === 3 ? HEAD_H + g * ROW_H : blockTop[g] + labelH + members[g].length * ROW_H)

  const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, var(--surface))`
  const rowStyle = (g: number, top: number, extra?: CSSProperties): CSSProperties => ({
    top,
    height: ROW_H - 3,
    background: tint(COLOURS[g], step === 0 ? 12 : 16),
    boxShadow: `inset 4px 0 0 ${COLOURS[g]}`,
    ...extra,
  })

  const codeKey = `.groupby('${key}')`
  const codeAgg = `.${agg}()`
  const code: ReactNode = (
    <div className={s.code} aria-label="pandas code for this animation">
      <span>df</span>
      <span className={step === 1 || step === 3 ? s.codeHl : undefined}>{codeKey}</span>
      <span className={step === 3 ? s.codeHl : undefined}>[['area', 'price']]</span>
      <span className={step >= 2 ? s.codeHl : undefined}>{codeAgg}</span>
    </div>
  )

  const aggWord = { mean: 'mean', sum: 'sum', count: 'count', max: 'maximum' }[agg]
  const notes: ReactNode[] = [
    <>
      Eight flats. Each row is coloured by its <b>{key}</b>. Nothing has been computed yet. Press <b>Play</b> or <b>Next</b>.
    </>,
    <>
      <b>Split.</b> <code>groupby('{key}')</code> sorts the rows into {keys.length} piles, one per {key === 'town' ? 'town' : 'flat type'} (in alphabetical
      order). The rows are only regrouped: no number has changed.
    </>,
    <>
      <b>Apply.</b> <code>.{agg}()</code> is worked out <i>separately inside each pile</i> for every numeric column. The <b>{other}</b> column is text, so it
      has no {aggWord} and is left out.
    </>,
    <>
      <b>Combine.</b> The {keys.length} summary rows are stacked into a new table. Its <b>index</b> (row labels) is now <b>{key}</b>: one row per group, not one
      per flat.
    </>,
  ]

  return (
    <Figure
      title="groupby = split, apply, combine"
      caption={
        <>
          Step through it, then switch the grouping column and the aggregation and replay. Notice that the result always has <b>one row per group</b>, its row
          labels are the group names, and the text column that was not grouped on simply disappears.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem', justifyItems: 'center' }}>
        <Controls>
          <Segmented
            label="group by"
            value={key}
            onChange={setKey}
            options={[
              { value: 'town', label: 'town' },
              { value: 'flat_type', label: 'flat_type' },
            ]}
          />
          <Segmented
            label="aggregate"
            value={agg}
            onChange={setAgg}
            options={[
              { value: 'mean', label: 'mean' },
              { value: 'sum', label: 'sum' },
              { value: 'count', label: 'count' },
              { value: 'max', label: 'max' },
            ]}
          />
        </Controls>
        {code}
        <div className={s.stage} style={{ height: heights[step] }} role="img" aria-label={`Animation step ${step + 1} of 4: ${STEP_NAMES[step]}`}>
          {/* original header */}
          <div className={`${s.row} ${s.head}`} style={{ top: 0, height: HEAD_H - 4, opacity: step === 3 ? 0 : 1 }}>
            <span className={s.idx} />
            <span style={{ color: key === 'town' ? 'var(--ink)' : undefined }}>town</span>
            <span style={{ color: key === 'flat_type' ? 'var(--ink)' : undefined }}>flat_type</span>
            <span className={s.num}>area</span>
            <span className={s.num}>price</span>
          </div>
          {/* result header */}
          <div className={`${s.row} ${s.head}`} style={{ top: 0, height: HEAD_H - 4, opacity: step === 3 ? 1 : 0 }} aria-hidden={step !== 3}>
            <span style={{ gridColumn: '1 / 4', color: 'var(--ink)' }}>
              {key}{' '}
              <span className={s.dim} style={{ fontWeight: 600 }}>
                (index)
              </span>
            </span>
            <span className={s.num}>area</span>
            <span className={s.num}>price</span>
          </div>

          {/* group labels with the worked formula for price */}
          {keys.map((k, g) => (
            <div
              key={`lab-${k}`}
              className={s.groupLabel}
              style={{
                top: blockTop[g] + 3,
                opacity: step === 1 || step === 2 ? 1 : 0,
                color: COLOURS[g],
                flexDirection: narrow ? 'column' : 'row',
                gap: narrow ? 2 : undefined,
              }}
            >
              <span>
                {k} <span className={s.dim}>({members[g].length} rows)</span>
              </span>
              <span className={s.formula} style={{ opacity: step === 2 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
                <span className={s.dim}>price: </span>
                {summaries[g].formula}
              </span>
            </div>
          ))}

          {/* the eight data rows */}
          {ROWS.map((r, i) => {
            const g = groupOf[i]
            const applying = step === 2
            return (
              <div key={`r${i}`} className={s.row} style={rowStyle(g, rowTop(i), { opacity: step === 3 ? 0 : 1 })}>
                <span className={s.idx}>{i}</span>
                <span style={{ fontWeight: key === 'town' ? 700 : 400, opacity: applying && key !== 'town' ? 0.4 : 1 }}>{r.town}</span>
                <span style={{ fontWeight: key === 'flat_type' ? 700 : 400, opacity: applying && key !== 'flat_type' ? 0.4 : 1 }}>{r.flat_type}</span>
                <span className={s.num}>{r.area}</span>
                <span className={s.num}>{r.price}</span>
              </div>
            )
          })}

          {/* one summary row per group */}
          {keys.map((k, g) => (
            <div
              key={`sum-${k}`}
              className={`${s.row} ${s.summary} ${step === 1 ? s.placeholder : ''}`}
              style={rowStyle(g, summaryTop(g), {
                opacity: step === 0 ? 0 : step === 1 ? 0.75 : 1,
                background: tint(COLOURS[g], step === 3 ? 18 : 30),
                boxShadow: `inset 4px 0 0 ${COLOURS[g]}, inset 0 0 0 1.5px ${COLOURS[g]}`,
              })}
            >
              <span style={{ gridColumn: '1 / 4', paddingLeft: '0.6rem' }}>
                {step <= 2 && <span className={s.dim}>{agg} → </span>}
                {k}
              </span>
              <span className={s.num}>{step <= 1 ? '?' : fmt(summaries[g].area, agg)}</span>
              <span className={s.num}>{step <= 1 ? '?' : fmt(summaries[g].price, agg)}</span>
            </div>
          ))}
        </div>
        <div className={s.stepNote} aria-live="polite">
          {notes[step]}
        </div>
        <PlayerControls player={player} label={(st) => STEP_NAMES[st]} />
      </div>
    </Figure>
  )
}
