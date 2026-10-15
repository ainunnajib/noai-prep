import { useMemo, useState } from 'react'
import { Figure, Segmented, useNarrow } from '../../../../../kit'
import { DOMAINS, DOMAINS_SHORT, GROUPS, QUESTIONS, STYLES } from './prelimMap'

const DOMAINS_TINY = ['Ma', 'Co', 'ML', 'GA', 'PS']
import s from './pe.module.css'

/*
  Where the 300 questions of the 2026 Prelim came from.
  View 1: topic × domain heat map of question counts; click a cell or a topic for sample questions and lessons.
  View 2: every question in paper order, coloured by question style, with the median length of each row.
*/

const STYLE_COLOUR = ['var(--viz-1)', 'var(--viz-5)', 'var(--viz-3)', 'var(--viz-6)', 'var(--viz-2)']

const median = (xs: number[]) => {
  const a = [...xs].sort((p, q) => p - q)
  const m = a.length >> 1
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2
}

type Sel = { kind: 'cell'; g: number; d: number } | { kind: 'topic'; g: number } | { kind: 'q'; n: number } | null

export default function PrelimHeatmap() {
  const [view, setView] = useState<'topics' | 'position'>('topics')
  const [sel, setSel] = useState<Sel>({ kind: 'topic', g: 0 })
  const [styleOn, setStyleOn] = useState<number | null>(null)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)

  const counts = useMemo(() => {
    const c = GROUPS.map(() => DOMAINS.map(() => 0))
    for (const [, d, g] of QUESTIONS) c[g][d]++
    return c
  }, [])
  const totals = counts.map((r) => r.reduce((a, b) => a + b, 0))
  const maxCell = Math.max(...counts.flat())
  const maxTotal = Math.max(...totals)
  const top5 = [...totals].sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b, 0)

  const heatBg = (v: number) => (v === 0 ? 'var(--surface-2)' : `color-mix(in srgb, var(--viz-1) ${Math.round(12 + (v / maxCell) * 70)}%, var(--surface))`)
  const heatInk = (v: number) => (v / maxCell > 0.55 ? 'var(--surface)' : 'var(--ink)')

  const listFor = (g: number, d?: number) => QUESTIONS.filter(([, dd, gg]) => gg === g && (d === undefined || dd === d))

  // position view layout
  const perRow = narrow ? 15 : 30
  const rows = Math.ceil(QUESTIONS.length / perRow)

  return (
    <Figure
      title="The 2026 Prelim, all 300 questions"
      caption={
        <>
          <strong>Topics</strong>: darker cells held more questions; tap a cell or a topic name to see real questions from it and the lessons that teach it. <strong>Position</strong>: one
          square per question in paper order, coloured by what the question asked you to do, with the median length of each row on the right. Watch the colours and the lengths change
          as the paper goes on.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <Segmented
          label="View"
          value={view}
          onChange={(v) => {
            setView(v)
            setSel(v === 'topics' ? { kind: 'topic', g: 0 } : { kind: 'q', n: 275 })
          }}
          options={[
            { value: 'topics', label: 'Topics × domains' },
            { value: 'position', label: 'Position in the paper' },
          ]}
        />

        {view === 'topics' ? (
          <>
            <div className={s.heat} style={{ gridTemplateColumns: `minmax(0, 1fr) repeat(5, ${narrow ? 31 : 46}px) ${narrow ? 26 : 92}px` }} role="table" aria-label="Question counts by topic and domain">
              <div className={s.heatHead} style={{ textAlign: 'left' }} role="columnheader">
                topic
              </div>
              {(narrow ? DOMAINS_TINY : DOMAINS_SHORT).map((d, i) => (
                <div key={d} className={s.heatHead} title={DOMAINS[i]} role="columnheader">
                  {d}
                </div>
              ))}
              <div className={s.heatHead} role="columnheader">
                total
              </div>
              {GROUPS.map((g, gi) => (
                <Row key={g.name}>
                  <button
                    type="button"
                    className={`${s.topic}${narrow ? ` ${s.topicWrap}` : ''}${sel?.kind !== 'q' && sel?.g === gi ? ` ${s.topicOn}` : ''}`}
                    onClick={() => setSel({ kind: 'topic', g: gi })}
                    title={g.name}
                  >
                    {g.name}
                  </button>
                  {counts[gi].map((v, di) => {
                    const on = sel?.kind === 'cell' && sel.g === gi && sel.d === di
                    return (
                      <button
                        key={di}
                        type="button"
                        className={`${s.cell}${on ? ` ${s.cellOn}` : ''}`}
                        style={{ background: heatBg(v), color: heatInk(v) }}
                        onClick={() => setSel({ kind: 'cell', g: gi, d: di })}
                        disabled={v === 0}
                        aria-label={`${g.name}, ${DOMAINS[di]}: ${v} questions`}
                      >
                        {v || ''}
                      </button>
                    )
                  })}
                  <div className={s.total}>
                    {!narrow && (
                      <span style={{ display: 'inline-block', height: 8, borderRadius: 3, width: `${(totals[gi] / maxTotal) * 56}px`, background: 'var(--viz-1)', opacity: 0.75 }} />
                    )}
                    {totals[gi]}
                  </div>
                </Row>
              ))}
            </div>
            <div className={s.small}>
              Columns: {DOMAINS.map((d, i) => `${(narrow ? DOMAINS_TINY : DOMAINS_SHORT)[i]} = ${d}`).join(', ')}. The five biggest topics held <strong className="tabular">{top5}</strong> of the 300 questions (
              {Math.round((top5 / 300) * 100)}%).
            </div>
          </>
        ) : (
          <>
            <PositionGrid perRow={perRow} rows={rows} styleOn={styleOn} sel={sel} onPick={(n) => setSel({ kind: 'q', n })} />
            <div className={s.row} role="group" aria-label="Highlight one question style">
              {STYLES.map((name, i) => (
                <button key={name} type="button" className={`${s.chip}${styleOn === i ? ` ${s.chipOn}` : ''}`} onClick={() => setStyleOn(styleOn === i ? null : i)} aria-pressed={styleOn === i}>
                  <span className={s.swatch} style={{ background: STYLE_COLOUR[i] }} />
                  {name} <span className="tabular">({QUESTIONS.filter((q) => q[3] === i).length})</span>
                </button>
              ))}
            </div>
          </>
        )}

        <Detail sel={sel} listFor={listFor} />
      </div>
    </Figure>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div role="row" style={{ display: 'contents' }}>
      {children}
    </div>
  )
}

function PositionGrid({ perRow, rows, styleOn, sel, onPick }: { perRow: number; rows: number; styleOn: number | null; sel: Sel; onPick: (n: number) => void }) {
  const labelW = 44
  const barW = perRow === 15 ? 58 : 96
  const cell = perRow === 15 ? 15 : 13
  const gap = 2
  const rowH = cell + 5
  const gridW = perRow * (cell + gap)
  const W = labelW + gridW + 8 + barW
  const H = rows * rowH + 18
  const meds = Array.from({ length: rows }, (_, r) => median(QUESTIONS.slice(r * perRow, (r + 1) * perRow).map((q) => q[4])))
  const maxMed = Math.max(...meds)
  // domain changes: mark the first question of each new domain
  const starts = QUESTIONS.filter((q, i) => i === 0 || QUESTIONS[i - 1][1] !== q[1])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="plot" style={{ maxWidth: W, width: '100%' }} role="img" aria-label="All 300 questions of the 2026 Prelim in order, coloured by style; the last rows are much longer and more scenario-based.">
      <text x={labelW + gridW + 8} y={11} style={{ fill: 'var(--ink-3)', fontSize: 10.5, fontWeight: 700 }}>
        median length
      </text>
      {QUESTIONS.map((q, i) => {
        const r = Math.floor(i / perRow)
        const c = i % perRow
        const x = labelW + c * (cell + gap)
        const y = 16 + r * rowH
        const dim = styleOn !== null && q[3] !== styleOn
        const on = sel?.kind === 'q' && sel.n === q[0]
        return (
          <rect
            key={q[0]}
            x={x}
            y={y}
            width={cell}
            height={cell}
            rx={2}
            style={{ fill: STYLE_COLOUR[q[3]], opacity: dim ? 0.15 : 1, stroke: on ? 'var(--viz-ink)' : 'none', strokeWidth: on ? 2 : 0, cursor: 'pointer' }}
            onClick={() => onPick(q[0])}
          >
            <title>{`Q${q[0]}: ${q[5]}`}</title>
          </rect>
        )
      })}
      {starts.map((q) => {
        const i = q[0] - 1
        const r = Math.floor(i / perRow)
        const c = i % perRow
        const x = labelW + c * (cell + gap) - gap / 2
        const y = 16 + r * rowH
        return <line key={`d${q[0]}`} x1={x} x2={x} y1={y - 3} y2={y + cell + 3} style={{ stroke: 'var(--viz-ink)', strokeWidth: 2 }} />
      })}
      {meds.map((m, r) => {
        const y = 16 + r * rowH
        return (
          <g key={r}>
            <text x={labelW - 6} y={y + cell - 3} textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 10.5 }} className="tabular">
              Q{r * perRow + 1}
            </text>
            <rect x={labelW + gridW + 8} y={y + 2} width={Math.max(1, (m / maxMed) * (barW - 30))} height={cell - 4} rx={2} style={{ fill: 'var(--viz-muted)' }} />
            <text x={labelW + gridW + 8 + (m / maxMed) * (barW - 30) + 3} y={y + cell - 3} style={{ fill: 'var(--ink-2)', fontSize: 10.5 }} className="tabular">
              {Math.round(m)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Detail({ sel, listFor }: { sel: Sel; listFor: (g: number, d?: number) => typeof QUESTIONS }) {
  if (!sel) return null
  if (sel.kind === 'q') {
    const q = QUESTIONS.find((x) => x[0] === sel.n)
    if (!q) return null
    const g = GROUPS[q[2]]
    return (
      <div className={s.detail} aria-live="polite">
        <div>
          <span className={s.qnum}>Q{q[0]}</span> · {DOMAINS[q[1]]} · {g.name} · {STYLES[q[3]].toLowerCase()} · {q[4]} characters
        </div>
        <div>{q[5]}</div>
        <div>
          <a href={`#/papers/prelim2026#q${q[0]}`}>Open it in the 2026 paper</a> · Study: <Lessons g={g} />
        </div>
      </div>
    )
  }
  const g = GROUPS[sel.g]
  const list = sel.kind === 'cell' ? listFor(sel.g, sel.d) : listFor(sel.g)
  const head = sel.kind === 'cell' ? `${g.name} in ${DOMAINS[sel.d]}` : g.name
  return (
    <div className={s.detail} aria-live="polite">
      <div>
        <strong>{head}</strong>: {list.length} question{list.length === 1 ? '' : 's'}. {list.length > 5 ? 'Five of them:' : ''}
      </div>
      <ul>
        {list.slice(0, 5).map((q) => (
          <li key={q[0]}>
            <a href={`#/papers/prelim2026#q${q[0]}`} className={s.qnum}>
              Q{q[0]}
            </a>{' '}
            {q[5]}
          </li>
        ))}
      </ul>
      <div>
        Study: <Lessons g={g} />
      </div>
    </div>
  )
}

function Lessons({ g }: { g: (typeof GROUPS)[number] }) {
  return (
    <>
      {g.lessons.map((l, i) => (
        <span key={l.href}>
          {i > 0 && ' · '}
          <a href={l.href}>{l.label}</a>
        </span>
      ))}
    </>
  )
}
