import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Rect, Label, VLine, DraggablePoint, Bars, usePlot, useNarrow } from '../../../../../kit'
import { nbStyles as s, Note } from './nb'

/*
  Concept: planning three hours.
  The 2026 Final: 20 MCQs (20 marks) + three notebooks (25 + 20 + 35 marks, 10 of them bonus).
  Drag the boundaries of the 180-minute bar, rate each part, and compare two ways of spending the
  notebook time: page order versus best expected marks per minute first.
  The minutes and success rates are a stated model, not official data.
*/

type Rating = 'C' | 'M' | 'H'
interface Part {
  id: string
  task: 1 | 2 | 3
  name: string
  marks: number
  /** our estimate of minutes for a well-prepared student who is confident */
  base: number
  bonus?: boolean
}

const PARTS: Part[] = [
  { id: '1.1', task: 1, name: 'L1 negative gradient', marks: 2, base: 2 },
  { id: '1.2', task: 1, name: 'L2 negative gradient', marks: 2, base: 2 },
  { id: '1.3', task: 1, name: 'L1 start value (median)', marks: 2, base: 2 },
  { id: '1.4', task: 1, name: 'L2 start value (mean)', marks: 2, base: 2 },
  { id: '1.5', task: 1, name: 'predict()', marks: 4, base: 5 },
  { id: '1.6', task: 1, name: 'fit() loop', marks: 8, base: 12 },
  { id: '1.7', task: 1, name: 'early stopping', marks: 5, base: 15, bonus: true },
  { id: '2.1', task: 2, name: 'U-Net centre crop', marks: 10, base: 15 },
  { id: '2.2', task: 2, name: 'mean IoU', marks: 10, base: 15 },
  { id: '3.1', task: 3, name: 'attention function', marks: 8, base: 10 },
  { id: '3.2', task: 3, name: 'why divide by √d (written)', marks: 2, base: 3 },
  { id: '3.3', task: 3, name: 'multi-head __init__', marks: 5, base: 4 },
  { id: '3.4', task: 3, name: 'multi-head forward', marks: 5, base: 12 },
  { id: '3.5', task: 3, name: 'fix positional encoding', marks: 5, base: 8 },
  { id: '3.6', task: 3, name: 'classifier head', marks: 2, base: 3 },
  { id: '3.7', task: 3, name: 'classifier forward', marks: 3, base: 8 },
  { id: '3.8', task: 3, name: 'causal mask', marks: 5, base: 4, bonus: true },
]

const START: Record<string, Rating> = {
  '1.1': 'C', '1.2': 'C', '1.3': 'C', '1.4': 'C', '1.5': 'M', '1.6': 'M', '1.7': 'H',
  '2.1': 'H', '2.2': 'M',
  '3.1': 'C', '3.2': 'C', '3.3': 'C', '3.4': 'M', '3.5': 'M', '3.6': 'C', '3.7': 'M', '3.8': 'M',
}

const MODEL: Record<Rating, { label: string; mult: number; p: number; color: string }> = {
  C: { label: 'confident', mult: 1, p: 0.9, color: 'var(--viz-3)' },
  M: { label: 'maybe', mult: 1.8, p: 0.6, color: 'var(--viz-6)' },
  H: { label: 'hard', mult: 3, p: 0.3, color: 'var(--viz-4)' },
}
const NEXT: Record<Rating, Rating> = { C: 'M', M: 'H', H: 'C' }
const TASK_COLOR = { 1: 'var(--viz-1)', 2: 'var(--viz-2)', 3: 'var(--viz-5)' } as const

const TOTAL = 180
const MCQ_N = 20
const MCQ_MIN = 1.5
const MCQ_P = 0.7
const GUESS_P = 0.25

function mcqExpected(t: number) {
  const careful = Math.min(MCQ_N, Math.floor(t / MCQ_MIN + 1e-9))
  return careful * MCQ_P + (MCQ_N - careful) * GUESS_P
}

interface Slot {
  part: Part
  start: number
  time: number
  exp: number
  /** fraction of the part finished within the time budget */
  done: number
}

function schedule(order: Part[], ratings: Record<string, Rating>, budget: number): { slots: Slot[]; total: number } {
  let t = 0
  let total = 0
  const slots: Slot[] = []
  for (const part of order) {
    const m = MODEL[ratings[part.id]]
    const time = part.base * m.mult
    const exp = part.marks * m.p
    const done = Math.max(0, Math.min(1, (budget - t) / time))
    total += exp * done
    slots.push({ part, start: t, time, exp, done })
    t += time
  }
  return { slots, total }
}

function TickLabels() {
  const { xs, ys } = usePlot()
  const y = ys.range()[0]
  return (
    <g aria-hidden="true">
      {[0, 30, 60, 90, 120, 150, 180].map((m) => (
        <text key={m} x={xs(m)} y={y + 16} textAnchor="middle" className="plot-label" style={{ fontSize: 11, fill: 'var(--ink-3)' }}>
          {m === 180 ? '3 h' : `${m}`}
        </text>
      ))}
    </g>
  )
}

export default function FinalTimePlanner() {
  const [mcq, setMcq] = useState(30)
  const [check, setCheck] = useState(10)
  const [ratings, setRatings] = useState<Record<string, Rating>>(START)
  const [strategy, setStrategy] = useState<'page' | 'mpm'>('mpm')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)

  const b1 = mcq
  const b2 = TOTAL - check
  const budget = b2 - b1

  const mpm = (p: Part) => (p.marks * MODEL[ratings[p.id]].p) / (p.base * MODEL[ratings[p.id]].mult)
  const ranked = useMemo(() => [...PARTS].sort((a, b) => mpm(b) - mpm(a) || PARTS.indexOf(a) - PARTS.indexOf(b)), [ratings])
  const page = useMemo(() => schedule(PARTS, ratings, budget), [ratings, budget])
  const best = useMemo(() => schedule(ranked, ratings, budget), [ranked, ratings, budget])
  const shown = strategy === 'page' ? page : best
  const mcqExp = mcqExpected(mcq)
  const fmt = (v: number) => v.toFixed(1)

  const setB1 = (x: number) => setMcq(Math.max(10, Math.min(60, Math.round(x), b2 - 30)))
  const setB2 = (x: number) => setCheck(Math.max(0, Math.min(30, TOTAL - Math.round(x), TOTAL - b1 - 30)))

  return (
    <Figure
      title="Plan the three hours by marks per minute"
      caption={
        <>
          Drag the two handles to split the 3 hours, and tap a part to rate it <strong>confident → maybe → hard</strong>. The bottom row of the bar shows the order you would
          work in. Compare the two projected scores: same student, same time, different order. Model (our assumption, not official data): a confident part takes our estimated
          time and succeeds 90% of the time; "maybe" takes 1.8× as long at 60%; "hard" takes 3× at 30%; a half-finished part earns half its expected marks; a careful MCQ takes
          1.5 min and is right 70% of the time, a rushed guess 25%. Tasks 2 and 3 are the 2026 PyTorch tasks, which Final lab II rebuilds; here only their marks, minutes
          and your confidence matter.
        </>
      }
      wide
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.8rem', userSelect: 'none', WebkitUserSelect: 'none' }}>
        <Plot x={[0, TOTAL]} y={[0, 2.1]} width={720} height={150} minHeight={140} margin={{ left: 10, right: 12, top: 8, bottom: 24 }} ariaLabel="A three-hour bar split into MCQs, notebooks and a final check, with the order of notebook parts below">
          <Rect x0={0} x1={b1} y0={1.15} y1={2} fill="color-mix(in srgb, var(--viz-1) 30%, var(--surface))" rx={4} />
          <Rect x0={b1} x1={b2} y0={1.15} y1={2} fill="color-mix(in srgb, var(--viz-3) 26%, var(--surface))" rx={4} />
          <Rect x0={b2} x1={TOTAL} y0={1.15} y1={2} fill="color-mix(in srgb, var(--viz-2) 32%, var(--surface))" rx={4} />
          {b1 >= (narrow ? 22 : 18) && (
            <Label x={b1 / 2} y={1.575} anchor="middle" dy={4} weight={700} size={12}>
              {narrow ? `${b1}′` : `MCQs ${b1}′`}
            </Label>
          )}
          <Label x={(b1 + b2) / 2} y={1.575} anchor="middle" dy={4} weight={700} size={12}>
            Notebooks {budget}′
          </Label>
          {check >= (narrow ? 14 : 12) && (
            <Label x={(b2 + TOTAL) / 2} y={1.575} anchor="middle" dy={4} weight={700} size={12}>
              {narrow ? `${check}′` : `Check ${check}′`}
            </Label>
          )}
          {shown.slots.map((sl) => {
            const x0 = b1 + sl.start
            if (x0 >= b2) return null
            const x1 = Math.min(b2, x0 + sl.time)
            const full = sl.done >= 1
            return (
              <g key={sl.part.id}>
                <Rect
                  x0={x0}
                  x1={x1}
                  y0={0.15}
                  y1={0.95}
                  fill={`color-mix(in srgb, ${TASK_COLOR[sl.part.task]} ${full ? 55 : 22}%, var(--surface))`}
                  stroke="var(--surface)"
                />
                {x1 - x0 >= (narrow ? 10 : 6) && (
                  <Label x={(x0 + x1) / 2} y={0.55} anchor="middle" dy={4} size={11} weight={700}>
                    {sl.part.id}
                  </Label>
                )}
              </g>
            )
          })}
          <VLine x={b1} color="var(--ink-2)" dash="" width={1.5} />
          <VLine x={b2} color="var(--ink-2)" dash="" width={1.5} />
          <TickLabels />
          <DraggablePoint x={b1} y={1.575} onChange={(x) => setB1(x)} lockY color="var(--viz-1)" r={8} />
          <DraggablePoint x={b2} y={1.575} onChange={(x) => setB2(x)} lockY color="var(--viz-2)" r={8} />
        </Plot>

        <Controls>
          <Segmented
            label="Notebook order (drawn in the bar)"
            value={strategy}
            onChange={setStrategy}
            options={[
              { value: 'page', label: 'Page order' },
              { value: 'mpm', label: 'Best marks per minute first' },
            ]}
          />
          <Readout
            items={[
              ['minutes', `MCQs ${b1} · notebooks ${budget} · check ${check}`],
              ['MCQs (expected)', `${fmt(mcqExp)} / 20`],
              ['page order', `${fmt(mcqExp + page.total)} / 100`],
              ['marks/min first', `${fmt(mcqExp + best.total)} / 100`],
            ]}
          />
        </Controls>
        {check < 5 && (
          <Note tone="bad" title="No time to check.">
            With under 5 minutes left you cannot Restart &amp; Run All and read the outputs. One crash near the top could stop every later answer from running.
          </Note>
        )}
        {mcq < 30 && (
          <Note title="Rushed MCQs.">
            {MCQ_N - Math.min(MCQ_N, Math.floor(mcq / MCQ_MIN + 1e-9))} MCQs become guesses. Each guess drops from 0.7 to 0.25 expected marks.
          </Note>
        )}

        <div style={{ width: '100%', display: 'grid', gap: '0.5rem', gridTemplateColumns: narrow ? '1fr' : 'repeat(3, minmax(0, 1fr))' }}>
          {([1, 2, 3] as const).map((task) => (
            <div key={task} style={{ border: '1px solid var(--rule)', borderTop: `4px solid ${TASK_COLOR[task]}`, borderRadius: 8, padding: '0.45rem 0.55rem', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                Task {task}: {task === 1 ? 'gradient boosting (25)' : task === 2 ? 'U-Net + IoU (20)' : 'attention (35)'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {PARTS.filter((p) => p.task === task).map((p) => {
                  const r = ratings[p.id]
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setRatings({ ...ratings, [p.id]: NEXT[r] })}
                      aria-label={`Part ${p.id}, ${p.name}, ${p.marks} marks${p.bonus ? ', bonus' : ''}: rated ${MODEL[r].label}. Tap to change.`}
                      title={p.name}
                      style={{
                        font: 'inherit',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        borderRadius: 999,
                        padding: '0.15rem 0.55rem',
                        border: `1.5px solid ${MODEL[r].color}`,
                        background: `color-mix(in srgb, ${MODEL[r].color} 16%, var(--surface))`,
                        color: 'var(--ink)',
                      }}
                    >
                      <span className={s.mono} style={{ fontWeight: 700 }}>
                        {p.id}
                      </span>{' '}
                      {p.marks}
                      {p.bonus ? '★' : ''} · {MODEL[r].label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', textAlign: 'left', width: '100%' }}>
          Number after the part = marks; ★ = bonus part. Marks are the official 2026 ones; the minutes are our estimates for a well-prepared student.
        </div>

        <div style={{ width: '100%', textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>Ranking: expected marks per minute</div>
          <Bars
            ariaLabel="Parts ranked by expected marks per minute"
            data={ranked.map((p) => ({
              label: (
                <span>
                  <span className={s.mono} style={{ fontWeight: 700 }}>
                    {p.id}
                  </span>{' '}
                  {p.name}
                </span>
              ),
              value: mpm(p),
              color: MODEL[ratings[p.id]].color,
            }))}
            format={(v) => v.toFixed(2)}
          />
        </div>
      </div>
    </Figure>
  )
}
