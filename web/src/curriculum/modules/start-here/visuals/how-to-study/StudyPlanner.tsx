import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Readout, Plot, Grid, Axes, FnPath, HLine, Label, DraggablePoint, useContainerWidth } from '../../../../../kit'
import { partList } from '../../../../registry'
import { PRELIM, FINAL, TIMELINE } from '../../../../../data/facts'

/*
  Lay the whole course over the weeks before the Prelim. Lesson minutes come from the live
  course index, times a "practice and review" multiplier. The last two weeks before the Prelim
  are kept free for mock exams. Bottom panel: weekly hours needed as a function of start week.
*/

const DAY = 86400000
const BASE = Date.UTC(2026, 9, 12) // Monday 12 Oct 2026 = week 0
const dayOfIso = (iso: string) => Math.round((Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) - BASE) / DAY)
const fmt = (d: number) => new Date(BASE + d * DAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

const PRELIM_D = dayOfIso(PRELIM.date)
const FINAL_D = dayOfIso(FINAL.date)
const NTU_D = dayOfIso(TIMELINE.find((t) => t.title === 'NTU Selection Test')?.iso ?? '2027-05-08')
const MOCKS_D = PRELIM_D - 14 // finish lessons by here; the last fortnight is for mocks
const MAX_START_WK = 16
const AXIS_WEEKS = Math.ceil((NTU_D + 6) / 7)

const SHORT: Record<string, string> = {
  start: 'Start here',
  code: 'Code',
  toolkit: 'Maths + data',
  'classical-ml': 'Classical ML',
  'deep-learning': 'Deep learning',
  vision: 'Vision',
  'language-audio': 'Language',
  'generative-ai': 'Generative AI',
  'problem-solving': 'Problem solving',
  exam: 'Exam + Final labs',
}

/** Course parts with their lesson minutes. "Beyond NOAI" is for after the Final, so it is left out. */
const PARTS = partList.map((p) => ({
  id: p.id,
  label: SHORT[p.id] ?? p.title,
  minutes: p.modules.filter((m) => m.slug !== 'road-to-ioai').reduce((s, m) => s + m.lessons.reduce((t, l) => t + l.minutes, 0), 0),
}))
const LESSON_MIN = PARTS.reduce((s, p) => s + p.minutes, 0)

/** small coloured text: mixed towards the ink colour so it passes contrast in light mode */
const txt = (c: string) => `color-mix(in srgb, ${c} 65%, var(--ink))`
/** round up to one decimal, so "aim for at least X" never shows a value that is still too low */
const up1 = (v: number) => (Math.ceil(v * 10 - 1e-9) / 10).toFixed(1)

function thisWeek() {
  const sg = new Date(Date.now() + 8 * 3600000)
  const d = Math.floor((Date.UTC(sg.getUTCFullYear(), sg.getUTCMonth(), sg.getUTCDate()) - BASE) / DAY)
  return Math.max(0, Math.min(MAX_START_WK, Math.floor(d / 7)))
}

export default function StudyPlanner() {
  const [minWk] = useState(thisWeek)
  const [startWk, setStartWk] = useState(minWk)
  const [hpw, setHpw] = useState(5.5)
  const [mult, setMult] = useState(1.5)
  const [ref, measured] = useContainerWidth<HTMLDivElement>(640)
  const W = Math.max(300, measured)
  const narrow = W < 520

  const totalH = (LESSON_MIN / 60) * mult
  const startD = startWk * 7
  const weeksNeeded = totalH / hpw
  const finishD = startD + weeksNeeded * 7
  const weeksAvail = (MOCKS_D - startD) / 7
  const needH = totalH / weeksAvail
  const status = finishD <= MOCKS_D ? 'ok' : finishD <= PRELIM_D ? 'tight' : 'late'

  // ---- Gantt geometry ----
  const labelW = narrow ? 92 : 128
  const x0 = labelW + 6
  const x1 = W - 6
  const X = (d: number) => x0 + ((x1 - x0) * d) / (AXIS_WEEKS * 7)
  const rowH = narrow ? 21 : 23
  const top = 22
  const H = top + PARTS.length * rowH + 30
  let cum = 0
  const bars = PARTS.map((p) => {
    const a = startD + ((cum / 60) * mult * 7) / hpw
    cum += p.minutes
    const b = startD + ((cum / 60) * mult * 7) / hpw
    return { ...p, a, b, hours: (p.minutes / 60) * mult }
  })
  const months = Array.from({ length: 8 }, (_, i) => {
    const t = Date.UTC(2026, 10 + i, 1)
    return { d: Math.round((t - BASE) / DAY), label: new Date(t).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }) }
  }).filter((m) => m.d < AXIS_WEEKS * 7)
  const pieces = (a: number, b: number) =>
    [
      { a, b: Math.min(b, MOCKS_D), c: 'var(--viz-1)' },
      { a: Math.max(a, MOCKS_D), b: Math.min(b, PRELIM_D), c: 'var(--viz-2)' },
      { a: Math.max(a, PRELIM_D), b, c: 'var(--viz-neg)' },
    ].filter((s) => s.b > s.a)

  const canStartEarlier = startWk > minWk
  const msg =
    status === 'ok'
      ? `On track: you finish the lessons in the week of ${fmt(Math.floor(finishD / 7) * 7)}, leaving the last two weeks before the Prelim for mock exams.`
      : status === 'tight'
        ? `Tight: you finish around ${fmt(Math.round(finishD))}, eating into the two weeks you need for mocks. Aim for at least ${up1(needH)} hours a week.`
        : needH > 25
          ? `Too late: the plan runs past the Prelim (${fmt(PRELIM_D)}) to about ${fmt(Math.round(finishD))}, and no realistic weekly load can fix that. ${canStartEarlier ? 'Start earlier, or cover' : 'Cover'} the parts you know least first and skim the rest.`
          : `Too late: the plan runs past the Prelim (${fmt(PRELIM_D)}) to about ${fmt(Math.round(finishD))}. ${canStartEarlier ? 'Start earlier, or aim' : 'Aim'} for at least ${up1(needH)} hours a week${canStartEarlier ? '' : ', or skim the parts you already know'}.`
  const msgColour = status === 'ok' ? 'var(--ok)' : status === 'tight' ? 'var(--warn)' : 'var(--bad)'
  const msgSoft = status === 'ok' ? 'var(--ok-soft)' : status === 'tight' ? 'var(--warn-soft)' : 'var(--bad-soft)'

  return (
    <Figure
      title="Your plan from today to the Prelim"
      caption={
        <>
          Each bar is one part of this course, sized by its lesson time × your practice multiplier. Slide your <strong>start week</strong> and <strong>hours per week</strong>: the
          bars stretch and squeeze. Blue lessons finish before the mock fortnight; orange eats into it; red runs past the Prelim. The lower chart shows why starting early matters:
          the hours you need each week shoot up as the start slides towards February. Drag its dot to move your start. (The last bar is drawn last to keep the chart simple,
          but start its Final labs in January, one task a week, alongside the other parts.)
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <svg className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Study plan: ${Math.round(totalH)} hours at ${hpw} hours a week from ${fmt(startD)}, finishing ${fmt(Math.round(finishD))}. ${msg}`}>
          {/* mock fortnight and exam lines */}
          <rect x={X(MOCKS_D)} y={top - 4} width={X(PRELIM_D) - X(MOCKS_D)} height={PARTS.length * rowH + 8} style={{ fill: 'color-mix(in srgb, var(--viz-2) 20%, transparent)' }} />
          {months.map((m) => (
            <g key={m.d}>
              <line x1={X(m.d)} x2={X(m.d)} y1={top - 4} y2={top + PARTS.length * rowH + 4} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
              <text x={X(m.d) + 2} y={H - 14} style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
                {m.label}
              </text>
            </g>
          ))}
          {[
            { d: PRELIM_D, name: 'Prelim', c: 'var(--viz-ink)', anchor: 'end' as const, dx: -3 },
            { d: FINAL_D, name: 'Final', c: 'var(--viz-3)', anchor: 'start' as const, dx: 3 },
            { d: NTU_D, name: narrow ? 'NTU' : 'NTU test', c: 'var(--viz-5)', anchor: 'end' as const, dx: -3 },
          ].map((e) => (
            <g key={e.name}>
              <line x1={X(e.d)} x2={X(e.d)} y1={top - 8} y2={top + PARTS.length * rowH + 6} style={{ stroke: e.c, strokeWidth: 2 }} />
              <text x={X(e.d) + e.dx} y={top - 10} textAnchor={e.anchor} style={{ fill: txt(e.c), fontSize: 11.5, fontWeight: 800 }}>
                {e.name}
              </text>
            </g>
          ))}
          <text x={(X(MOCKS_D) + X(PRELIM_D)) / 2} y={H - 2} textAnchor="middle" style={{ fill: txt('var(--viz-2)'), fontSize: 10.5, fontWeight: 700 }}>
            mocks
          </text>
          {/* start line */}
          <line x1={X(startD)} x2={X(startD)} y1={top - 4} y2={top + PARTS.length * rowH + 4} style={{ stroke: 'var(--viz-ink)', strokeWidth: 1.5, strokeDasharray: '4 3' }} />
          {/* bars */}
          {bars.map((b, i) => {
            const y = top + i * rowH
            return (
              <g key={b.id}>
                <text x={labelW} y={y + rowH / 2 + 4} textAnchor="end" style={{ fill: 'var(--ink-2)', fontSize: narrow ? 11 : 12, fontWeight: 650 }}>
                  {b.label}
                </text>
                {pieces(b.a, b.b).map((s, k) => (
                  <rect key={k} x={X(s.a)} y={y + 3} width={Math.max(1, X(Math.min(s.b, AXIS_WEEKS * 7)) - X(s.a))} height={rowH - 6} rx={3} style={{ fill: s.c }} />
                ))}
                {!narrow && X(b.b) + 40 < x1 && (
                  <text x={X(b.b) + 4} y={y + rowH / 2 + 4} style={{ fill: 'var(--ink-3)', fontSize: 10.5 }} className="tabular">
                    {b.hours.toFixed(b.hours < 10 ? 1 : 0)} h
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      <Controls>
        <Slider label="start in the week of" value={startWk} min={minWk} max={MAX_START_WK} step={1} onChange={setStartWk} format={(v) => fmt(v * 7)} />
        <Slider label="hours per week" value={hpw} min={2} max={15} step={0.5} onChange={setHpw} format={(v) => `${v} h`} />
      </Controls>
      <Controls>
        <Segmented
          label={narrow ? 'Time per lesson minute (read only, with practice, thorough)' : 'Time per lesson minute'}
          value={mult}
          onChange={setMult}
          options={[
            { value: 1, label: narrow ? '×1' : '×1 read only' },
            { value: 1.5, label: narrow ? '×1.5' : '×1.5 with practice' },
            { value: 2, label: narrow ? '×2' : '×2 thorough' },
          ]}
        />
      </Controls>
      <div aria-live="polite" style={{ width: '100%', borderLeft: `4px solid ${msgColour}`, background: msgSoft, borderRadius: 'var(--radius-m)', padding: '0.55rem 0.8rem', fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink)' }}>
        {msg}
      </div>
      <Readout
        items={[
          ['study time', `${(LESSON_MIN / 60).toFixed(0)} h of lessons × ${mult} = ${totalH.toFixed(0)} h`],
          ['weeks before the mocks', weeksAvail.toFixed(1)],
          ['hours a week needed', up1(needH)],
        ]}
      />
      <div style={{ width: '100%', display: 'grid', gap: '0.2rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }}>Hours a week needed to finish before the mock fortnight, by start week</div>
        <Plot
          x={[0, MAX_START_WK]}
          y={[0, 30]}
          width={620}
          height={210}
          minHeight={190}
          margin={{ left: 40, right: 14, top: 12, bottom: 32 }}
          ariaLabel={`Hours a week needed against start week. Starting the week of ${fmt(startD)} needs ${up1(needH)} hours a week.`}
        >
          <Grid xTicks={8} yTicks={6} />
          <Axes xLabel={narrow ? 'start week' : 'week you start'} yLabel="hours a week" hideXTicks yTicks={6} />
          {(narrow ? [0, 8, 16] : [0, 4, 8, 12, 16]).map((w) => (
            <Label key={w} x={w} y={0} dy={17} anchor={w === 0 ? 'start' : w === MAX_START_WK ? 'end' : 'middle'} color="var(--ink-3)" size={11.5}>
              {fmt(w * 7)}
            </Label>
          ))}
          <FnPath f={(w) => totalH / ((MOCKS_D - w * 7) / 7)} color="var(--viz-4)" width={2.6} />
          <HLine y={hpw} color="var(--viz-1)" dash="5 4" width={1.5} label={`you: ${hpw} h a week`} />
          <Label x={startWk} y={Math.min(29, needH)} dx={startWk > MAX_START_WK - 3 ? -12 : 12} dy={-10} anchor={startWk > MAX_START_WK - 3 ? 'end' : 'start'} color={txt('var(--viz-4)')} size={12} weight={800}>
            {`${up1(needH)} h`}
          </Label>
          <g role="group" aria-label="Start week marker: use the arrow keys to move your start week">
          <DraggablePoint
            x={startWk}
            y={Math.min(30, needH)}
            color="var(--viz-4)"
            constrain={(x) => {
              const w = Math.max(minWk, Math.min(MAX_START_WK, Math.round(x)))
              return [w, Math.min(30, totalH / ((MOCKS_D - w * 7) / 7))]
            }}
            onChange={(x) => setStartWk(Math.max(minWk, Math.min(MAX_START_WK, Math.round(x))))}
          />
          </g>
        </Plot>
      </div>
    </Figure>
  )
}
