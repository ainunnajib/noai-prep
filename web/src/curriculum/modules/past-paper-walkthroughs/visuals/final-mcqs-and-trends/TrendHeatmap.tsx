import { useEffect, useMemo, useState } from 'react'
import { Figure, Segmented, Button } from '../../../../../kit'
import { loadPaper, type PaperQuestion } from '../../../../../data/papers'
import s from '../prelim-problem-solving/ppw.module.css'
import { LessonLink, cx } from '../prelim-problem-solving/shared'
import { TREND_ROWS, PAPER_SIZES, STYLE_KEYS, STYLE_COUNTS, type TrendRow } from './trendData'

/*
  Three papers side by side: NOAI 2025 MCQs (20), the 2026 Prelim (300) and the 2026 Final MCQs (20).
  By topic: a heat map of question counts per subtopic (colour = share of that paper, so the 20-question
  papers are comparable with the 300-question one). By style: what kind of question each paper asked.
*/

const PAPERS = [
  { id: 'noai2025', short: '2025 MCQ', head: ['2025', 'MCQ'] },
  { id: 'prelim2026', short: '2026 Prelim', head: ['2026', 'Prelim'] },
  { id: 'final2026', short: '2026 Final MCQ', head: ['2026', 'Final'] },
] as const

const STYLE_LABEL: Record<(typeof STYLE_KEYS)[number], string> = {
  definition: 'definition',
  'why-reasoning': 'why / reasoning',
  comparison: 'comparison',
  'scenario-diagnosis': 'scenario',
  computation: 'computation',
  'code-reading': 'code reading',
}
const STYLE_COLOR = ['var(--viz-1)', 'var(--viz-5)', 'var(--viz-6)', 'var(--viz-4)', 'var(--viz-2)', 'var(--viz-3)']

type SortKey = 'total' | '0' | '1' | '2'
const everyYear = (r: TrendRow) => r.counts.every((c) => c > 0)
const share = (r: TrendRow, col: number) => r.counts[col] / PAPER_SIZES[col]
const colMax = [0, 1, 2].map((c) => Math.max(...TREND_ROWS.map((r) => share(r, c))))

function preview(q: PaperQuestion) {
  const hasCode = q.question.includes('```')
  const base = hasCode ? q.question.split('```')[0].replace(/:\s*$/, '') + ' (with code)' : q.question
  const t = base
    .replace(/\|[^\n]*\|/g, ' ')
    .replace(/[*`$\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return t.length > 110 ? t.slice(0, 107).trimEnd() + '…' : t
}

function TopicView() {
  const [sort, setSort] = useState<SortKey>('total')
  const [showAll, setShowAll] = useState(false)
  const [cell, setCell] = useState<{ row: string; col: number } | null>({ row: 'training-regularisation', col: 2 })
  const [rowSel, setRowSel] = useState<string | null>(null)
  const [papers, setPapers] = useState<Record<string, PaperQuestion[]>>({})
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let live = true
    Promise.all(PAPERS.map((p) => loadPaper(p.id)))
      .then((qs) => {
        if (live) setPapers(Object.fromEntries(PAPERS.map((p, i) => [p.id, qs[i]])))
      })
      .catch(() => {
        if (live) setFailed(true)
      })
    return () => {
      live = false
    }
  }, [])

  const rows = useMemo(() => {
    const total = (r: TrendRow) => r.counts[0] + r.counts[1] + r.counts[2]
    const sorted = [...TREND_ROWS].sort((a, b) => {
      if (sort === 'total') return total(b) - total(a)
      const c = Number(sort)
      return share(b, c) - share(a, c) || total(b) - total(a)
    })
    return showAll ? sorted : sorted.slice(0, 14)
  }, [sort, showAll])

  const selRow = cell ? TREND_ROWS.find((r) => r.id === cell.row) : null
  const cellQs = cell && papers[PAPERS[cell.col].id] ? papers[PAPERS[cell.col].id].filter((q) => q.subtopic === cell.row) : null
  const lessonRow = rowSel ? TREND_ROWS.find((r) => r.id === rowSel) : null

  return (
    <div className={s.wrap}>
      <Segmented
        label="Sort rows by"
        value={sort}
        onChange={setSort}
        options={[
          { value: 'total', label: 'Total' },
          { value: '0', label: '2025' },
          { value: '1', label: 'Prelim' },
          { value: '2', label: 'Final' },
        ]}
      />
      <div className={s.heat} role="table" aria-label="Questions per subtopic in each paper">
        <div className={s.heatRow} role="row">
          <span className={s.heatCorner} role="columnheader">
            subtopic <span className={s.muted}>(★ = in every paper)</span>
          </span>
          {PAPERS.map((p, c) => (
            <span key={p.id} className={s.heatHead} role="columnheader">
              {p.head[0]}
              <br />
              {p.head[1]}
              <br />
              <span className={s.muted}>({PAPER_SIZES[c]})</span>
            </span>
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.id} className={cx(s.heatRow, rowSel === r.id && s.heatRowSel)} role="row">
            <button
              type="button"
              className={s.heatLabel}
              role="rowheader"
              onClick={() => {
                setRowSel(r.id)
                setCell(null)
              }}
              aria-pressed={rowSel === r.id}
            >
              {everyYear(r) && <span className={s.star} aria-label="examined in every paper">★ </span>}
              {r.name}
            </button>
            {r.counts.map((n, c) => {
              const t = colMax[c] ? share(r, c) / colMax[c] : 0
              const on = cell?.row === r.id && cell.col === c
              return (
                <button
                  key={c}
                  type="button"
                  role="cell"
                  className={cx(s.heatCell, on && s.heatCellOn)}
                  style={{ background: n ? `color-mix(in srgb, var(--viz-1) ${Math.round(8 + t * 44)}%, var(--surface))` : undefined }}
                  onClick={() => {
                    setCell({ row: r.id, col: c })
                    setRowSel(null)
                  }}
                  onMouseEnter={() => {
                    if (n) {
                      setCell({ row: r.id, col: c })
                      setRowSel(null)
                    }
                  }}
                  aria-label={`${r.name}, ${PAPERS[c].short}: ${n} questions`}
                >
                  {n ? n : <span className={s.muted}>·</span>}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div className={s.row}>
        <Button onClick={() => setShowAll((v) => !v)}>{showAll ? 'Show the top 14 only' : `Show all ${TREND_ROWS.length} subtopics`}</Button>
      </div>
      <div className={s.card} aria-live="polite">
        {lessonRow ? (
          <div className={s.detail}>
            <span>
              <b>{lessonRow.name}</b>: {lessonRow.counts[0]} + {lessonRow.counts[1]} + {lessonRow.counts[2]} questions across the three papers
              {everyYear(lessonRow) ? ', examined in every one of them' : ''}.
            </span>
            <span>
              <b>Lessons that teach it:</b>{' '}
              {lessonRow.lessons.map((l, i) => (
                <span key={l.to}>
                  {i ? ' · ' : ''}
                  <LessonLink to={l.to}>{l.title}</LessonLink>
                </span>
              ))}
            </span>
          </div>
        ) : cell && selRow ? (
          <div className={s.detail}>
            <span>
              <b>
                {PAPERS[cell.col].short} · {selRow.name}
              </b>
              : {selRow.counts[cell.col]} question{selRow.counts[cell.col] === 1 ? '' : 's'} ({((100 * selRow.counts[cell.col]) / PAPER_SIZES[cell.col]).toFixed(1)}% of
              the paper)
            </span>
            {selRow.counts[cell.col] === 0 ? (
              <span className={s.muted}>None in this paper.</span>
            ) : cellQs === null ? (
              <span className={s.muted}>{failed ? 'The questions could not be loaded. Reload the page to try again.' : 'Loading the questions…'}</span>
            ) : (
              <ul className={s.logList}>
                {cellQs.slice(0, 12).map((q) => (
                  <li key={q.n}>
                    <a href={`#/papers/${PAPERS[cell.col].id}#q${q.n}`}>Q{q.n}</a> {preview(q)}
                  </li>
                ))}
                {cellQs.length > 12 && <li className={s.muted}>and {cellQs.length - 12} more</li>}
              </ul>
            )}
          </div>
        ) : (
          <span className={s.muted}>Tap a cell to list its questions, or a subtopic name to see the lessons that teach it.</span>
        )}
      </div>
    </div>
  )
}

function StyleView() {
  return (
    <div className={s.wrap}>
      {PAPERS.map((p) => {
        const counts = STYLE_COUNTS[p.id]
        const total = counts.reduce((a, b) => a + b, 0)
        return (
          <div key={p.id} className={s.styleBlock}>
            <div className={s.styleHead}>
              <b>{p.short}</b> <span className={s.muted}>{total} questions</span>
            </div>
            <div className={s.stack} role="img" aria-label={`${p.short}: ${STYLE_KEYS.map((k, i) => `${STYLE_LABEL[k]} ${counts[i]}`).join(', ')}`}>
              {counts.map((c, i) =>
                c ? (
                  <span key={i} className={s.stackSeg} style={{ width: `${(100 * c) / total}%`, background: STYLE_COLOR[i] }} title={`${STYLE_LABEL[STYLE_KEYS[i]]}: ${c}`}>
                    {(100 * c) / total >= 14 ? <span className={s.stackPill}>{Math.round((100 * c) / total)}%</span> : null}
                  </span>
                ) : null,
              )}
            </div>
          </div>
        )
      })}
      <div className={s.legendRow} style={{ justifyContent: 'flex-start' }}>
        {STYLE_KEYS.map((k, i) => (
          <span key={k} className={s.legendItem}>
            <span className={s.legendSwatch} style={{ background: STYLE_COLOR[i] }} />
            {STYLE_LABEL[k]}
          </span>
        ))}
      </div>
      <div className={s.card}>
        <div className={s.detail}>
          <span>
            <b>2025:</b> {STYLE_COUNTS.noai2025[0]} of 20 were one-line definitions (&ldquo;What is the primary function of pooling layers?&rdquo;).
          </span>
          <span>
            <b>2026 Final:</b> {STYLE_COUNTS.final2026[5]} of 20 were tagged code reading, and 18 of the 20 showed a code snippet of 8 to 24 lines.
          </span>
          <span>
            <b>2026 Prelim:</b> mostly definitions ({Math.round((100 * STYLE_COUNTS.prelim2026[0]) / 300)}%), with the long scenarios at the end.
          </span>
        </div>
      </div>
    </div>
  )
}

export default function TrendHeatmap() {
  const [view, setView] = useState<'topic' | 'style'>('topic')
  return (
    <Figure
      title="Three papers side by side"
      caption={
        <>
          <b>By topic:</b> each cell is a question count; its colour is the share of <i>that</i> paper (darkest = the paper&rsquo;s biggest topic), so the
          20-question papers can be compared with the 300-question Prelim. Tap a cell to list its questions, tap a subtopic for its lessons, and re-sort by any
          paper. <b>By style:</b> what kind of question each paper asked. Subtopic and style tags are this site&rsquo;s classification of the official papers.
        </>
      }
    >
      <Segmented
        label="View"
        value={view}
        onChange={setView}
        options={[
          { value: 'topic', label: 'By topic' },
          { value: 'style', label: 'By style' },
        ]}
      />
      {view === 'topic' ? <TopicView /> : <StyleView />}
    </Figure>
  )
}
