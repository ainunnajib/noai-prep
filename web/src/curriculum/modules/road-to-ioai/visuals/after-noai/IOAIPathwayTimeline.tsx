import { useState, type KeyboardEvent } from 'react'
import { Figure, Controls, Toggle, Readout, useContainerWidth } from '../../../../../kit'
import s from './after.module.css'

/*
  March to August on one calendar, in three swim lanes by who runs each step (AI Singapore, NTU,
  IOAI). Click a milestone (or its chip) for the details; toggle the 2026 cycle to see how much
  earlier and tighter 2027 is. Dates: NOAI 2027 and 2026 timelines (noai.aisingapore.org) and the
  IOAI 2026 contest rules.
*/

type Lane = 'aisg' | 'ntu' | 'ioai'
type Year = 2026 | 2027

interface When {
  /** [month (1-12), day] pairs; one = a day, two = a range */
  days: [number, number][]
  /** separate days drawn as dots (Saturday training) */
  dots?: boolean
  /** fuzzy (approximate) range */
  fuzzy?: boolean
  label: string
}

interface Milestone {
  id: string
  name: string
  short: string
  lane: Lane
  /** label above (true) or below (false) the lane line */
  above: boolean
  y2027: When
  y2026: When
  what: string
  prep: string
  then2026: string
}

const MILESTONES: Milestone[] = [
  {
    id: 'final',
    name: 'NOAI Final',
    short: 'Final',
    lane: 'aisg',
    above: true,
    y2027: { days: [[3, 5]], label: 'Fri 5 Mar 2027' },
    y2026: { days: [[3, 6]], label: 'Fri 6 Mar 2026' },
    what: 'The top 150 from the Prelim sit 20 MCQs and 3 Python programming tasks in Jupyter. In 2026 it took 3 hours at NTU, with no internet.',
    prep: 'Your last NOAI paper. The next stage values different skills, so start them in the weeks after the Final instead of waiting for results.',
    then2026: 'Fri 6 Mar 2026, 3 hours at NTU (20 MCQs + 3 programming tasks, 100 marks).',
  },
  {
    id: 'results',
    name: 'NOAI results',
    short: 'Results',
    lane: 'aisg',
    above: false,
    y2027: { days: [[4, 1], [4, 10]], fuzzy: true, label: 'Early April 2027' },
    y2026: { days: [[4, 1], [4, 10]], fuzzy: true, label: 'Early April 2026' },
    what: 'Finalists receive an award tier only (Gold, Silver, Bronze or Participation), with no marks or breakdown. NTU decides who it invites to the next stage.',
    prep: 'A tier is not a rank at NTU. Keep practising open-ended tasks whatever your tier: NTU re-ranks everyone it invites.',
    then2026: 'Early April 2026: 12 Gold, 24 Silver, 37 Bronze and 73 Participation awards.',
  },
  {
    id: 'test',
    name: 'NTU Selection Test',
    short: 'NTU test',
    lane: 'ntu',
    above: true,
    y2027: { days: [[5, 8]], label: 'Sat 8 May 2027' },
    y2026: { days: [[5, 2]], label: 'Sat 2 May 2026' },
    what: 'About the top 60 finalists are invited. Past tests (2024, 2025) gave one notebook per area (vision, language, tabular ML): a working baseline with a few lines missing, then open-ended improvement on a real dataset, plus short written answers.',
    prep: 'Practise completing and improving real training pipelines in PyTorch on a GPU: a training loop, data augmentation, a pretrained model, the right metric.',
    then2026: 'Sat 2 May 2026, for the top 50 to 60 finalists. (In 2024, 63 students from 11 schools sat it.)',
  },
  {
    id: 'training',
    name: 'Saturday training',
    short: 'Training',
    lane: 'ntu',
    above: false,
    y2027: { days: [[5, 22], [5, 29], [6, 5], [6, 12]], dots: true, label: 'Sat 22 & 29 May, 5 & 12 Jun 2027' },
    y2026: { days: [[5, 16], [5, 23], [5, 30], [6, 6]], dots: true, label: 'Sat 16, 23, 30 May & 6 Jun 2026' },
    what: 'Four Saturday sessions at NTU. Professors teach topics from their own research areas, beyond the NOAI syllabus: machine learning, vision, language and, in 2026, audio.',
    prep: 'Treat each session like a CCA training: redo the exercises at home the same week, and keep a list of things you could not do yet.',
    then2026: 'Four Saturdays: 16, 23, 30 May and 6 Jun 2026.',
  },
  {
    id: 'camp',
    name: 'Residential camp',
    short: 'Camp',
    lane: 'ntu',
    above: true,
    y2027: { days: [[6, 14], [6, 18]], label: 'Mon 14 – Fri 18 Jun 2027' },
    y2026: { days: [[6, 8], [6, 12]], label: 'Mon 8 – Fri 12 Jun 2026' },
    what: 'A week at NTU during the June holidays for a small group (10 students in 2026), with longer, harder tasks on GPUs. The national team is picked at this stage.',
    prep: 'Stamina and iteration speed: run many small, controlled experiments and explain clearly why each change helped or did not.',
    then2026: 'Mon 8 – Fri 12 Jun 2026: 10 students, covering ML, vision, language and audio. 8 were selected for IOAI 2026.',
  },
  {
    id: 'home',
    name: 'IOAI at-home tasks',
    short: 'Home task',
    lane: 'ioai',
    above: false,
    y2027: { days: [[6, 1], [6, 30]], fuzzy: true, label: 'June 2027' },
    y2026: { days: [[7, 1], [7, 31]], fuzzy: true, label: 'July 2026' },
    what: 'IOAI releases a few tasks to every team about a month before the contest; Singapore’s team, picked at the camp, works on them in late June. They do not count towards medals, but the first contest day is linked to them.',
    prep: 'Solve them properly, as if they were scored. Day 1 of the contest builds on their topics or methods.',
    then2026: 'July 2026: 3 at-home problems, about a month before IOAI 2026.',
  },
  {
    id: 'ioai',
    name: 'IOAI 2027 in Singapore',
    short: 'IOAI',
    lane: 'ioai',
    above: true,
    y2027: { days: [[7, 4], [7, 10]], label: '4 – 10 Jul 2027, Singapore' },
    y2026: { days: [[8, 2], [8, 8]], label: '2 – 8 Aug 2026, Astana' },
    what: 'The International Olympiad in AI, hosted by AI Singapore and NTU. In 2026 the individual contest had two 6-hour days with 3 tasks each, solved in GPU notebooks without internet; medals depend only on this contest.',
    prep: 'Beat every task’s baseline clearly before polishing any one task: scores are measured from the baseline (next section).',
    then2026: 'IOAI 2026, Astana, Kazakhstan: 440 contestants; Singapore won 1 Gold, 3 Silver and 3 Bronze.',
  },
]

const LANES: { id: Lane; label: string; colour: string }[] = [
  { id: 'aisg', label: 'AI Singapore', colour: 'var(--viz-1)' },
  { id: 'ntu', label: 'NTU', colour: 'var(--viz-3)' },
  { id: 'ioai', label: 'IOAI', colour: 'var(--viz-2)' },
]
const laneOf = (l: Lane) => LANES.find((x) => x.id === l)!
/** lane colour darkened (light mode) or lightened (dark mode) towards the ink, for readable text */
const textOf = (c: string) => `color-mix(in srgb, ${c} 60%, var(--ink))`

/** day offset from 1 March of the same year (both years have 28 days in February) */
const CUM = [0, 31, 61, 92, 122, 153] // Mar, Apr, May, Jun, Jul, Aug
const off = (m: number, d: number) => CUM[m - 3] + d - 1
const LAST = off(8, 12)
const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

const wk = (days: number) => `${Math.floor(days / 7)} wk ${days % 7} d`

export default function IOAIPathwayTimeline() {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(620)
  const W = Math.max(300, measured)
  const narrow = W < 520
  const [sel, setSel] = useState('test')
  const [compare, setCompare] = useState(false)
  const m = MILESTONES.find((x) => x.id === sel)!

  const padL = narrow ? 8 : 92
  const padR = 10
  const X = (d: number) => padL + (d / LAST) * (W - padL - padR)
  const top = 24
  const laneH = narrow ? 70 : 74
  const laneY = (l: Lane) => top + 26 + LANES.findIndex((x) => x.id === l) * laneH
  const bracketY = top + 26 + (LANES.length - 1) * laneH + (compare ? 50 : 42)
  const H = bracketY + 16

  const shape = (ms: Milestone, year: Year) => {
    const w = year === 2027 ? ms.y2027 : ms.y2026
    const y = laneY(ms.lane) + (year === 2026 ? 13 : 0)
    const c = laneOf(ms.lane).colour
    const on = ms.id === sel
    const ghost = year === 2026
    const pts = w.days.map(([mm, dd]) => off(mm, dd))
    const common = { cursor: 'pointer' as const }
    const click = () => setSel(ms.id)
    if (w.dots)
      return (
        <g key={`${ms.id}${year}`} onClick={click} style={common}>
          {pts.map((p, i) => (
            <circle key={i} cx={X(p)} cy={y} r={narrow ? (ghost ? 2.6 : on ? 4 : 3.5) : ghost ? 3.2 : on ? 5.5 : 4.5} style={{ fill: ghost ? 'var(--surface)' : c, stroke: c, strokeWidth: ghost ? 1.5 : narrow ? 1.5 : 2 }} />
          ))}
        </g>
      )
    if (pts.length === 2) {
      const x0 = X(pts[0])
      const x1 = X(pts[1])
      const h = ghost ? 6 : on ? 12 : 10
      return (
        <rect
          key={`${ms.id}${year}`}
          onClick={click}
          x={x0}
          y={y - h / 2}
          width={Math.max(4, x1 - x0)}
          height={h}
          rx={h / 2}
          style={{
            ...common,
            fill: ghost ? 'var(--surface)' : w.fuzzy ? `color-mix(in srgb, ${c} 35%, var(--surface))` : c,
            stroke: c,
            strokeWidth: ghost ? 1.5 : 1.5,
            strokeDasharray: ghost || w.fuzzy ? '3 2' : undefined,
          }}
        />
      )
    }
    return <circle key={`${ms.id}${year}`} onClick={click} cx={X(pts[0])} cy={y} r={ghost ? 3.5 : on ? 7 : 5.5} style={{ ...common, fill: ghost ? 'var(--surface)' : c, stroke: ghost ? c : 'var(--surface)', strokeWidth: 2 }} />
  }

  const labelX = (ms: Milestone) => {
    const pts = ms.y2027.days.map(([mm, dd]) => off(mm, dd))
    return X((Math.min(...pts) + Math.max(...pts)) / 2)
  }

  const onKey = (id: string) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSel(id)
    }
  }

  // gaps that matter for preparation
  const gap27a = off(5, 8) - off(3, 5)
  const gap27b = off(7, 4) - off(5, 8)
  const gap26a = off(5, 2) - off(3, 6)
  const gap26b = off(8, 2) - off(5, 2)
  const c = laneOf(m.lane).colour

  return (
    <Figure
      title="From the Final to IOAI 2027"
      caption={
        <>
          Tap a milestone or its chip for what happens and how to prepare. Then switch on the 2026 cycle: the gap from the NTU test to IOAI shrinks from {Math.floor(gap26b / 7)} weeks to{' '}
          {Math.floor(gap27b / 7)}.
        </>
      }
    >
      {narrow && (
        <div className={s.laneKey} aria-hidden="true">
          <span className={s.laneKeyHint}>Lanes, top to bottom:</span>
          {LANES.map((l) => (
            <span key={l.id}>
              <span className={s.chipDot} style={{ background: l.colour }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
      <div ref={ref} style={{ width: '100%' }}>
        <svg className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Timeline from March to August 2027 in three lanes: AI Singapore runs the NOAI Final and results, NTU runs the selection test, Saturday training and camp, and IOAI runs the at-home tasks and the contest.">
          {/* month grid */}
          {MONTHS.map((mo, i) => {
            const x = X(CUM[i])
            return (
              <g key={mo}>
                <line x1={x} x2={x} y1={top - 6} y2={bracketY - 12} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
                <text x={x + 3} y={top - 10} style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--ink-3)' }}>
                  {mo}
                </text>
              </g>
            )
          })}
          {/* lanes */}
          {LANES.map((l) => {
            const y = laneY(l.id)
            return (
              <g key={l.id}>
                <line x1={padL} x2={W - padR} y1={y} y2={y} style={{ stroke: l.colour, strokeWidth: 1.5, opacity: 0.45 }} />
                {!narrow && (
                  <text x={padL - 10} y={y + 4} textAnchor="end" style={{ fontSize: 12, fontWeight: 800, fill: textOf(l.colour) }}>
                    {l.label}
                  </text>
                )}
                {compare && (
                  <line x1={padL} x2={W - padR} y1={y + 13} y2={y + 13} style={{ stroke: l.colour, strokeWidth: 1, opacity: 0.3, strokeDasharray: '2 3' }} />
                )}
              </g>
            )
          })}
          {/* gap brackets (2027) */}
          {[
            { a: off(3, 5), b: off(5, 8), text: wk(gap27a) },
            { a: off(5, 8), b: off(7, 4), text: wk(gap27b) },
          ].map((g, i) => {
            const y = bracketY
            const x0 = X(g.a)
            const x1 = X(g.b)
            return (
              <g key={i} aria-hidden="true">
                <path d={`M${x0},${y - 5}V${y}H${x1}V${y - 5}`} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 1.2 }} />
                <rect x={(x0 + x1) / 2 - 31} y={y - 7} width={62} height={14} rx={7} style={{ fill: 'var(--surface)' }} />
                <text x={(x0 + x1) / 2} y={y + 4} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--ink-2)' }}>
                  {g.text}
                </text>
              </g>
            )
          })}
          {/* 2026 ghosts first, then 2027 */}
          {compare && MILESTONES.map((ms) => shape(ms, 2026))}
          {MILESTONES.map((ms) => shape(ms, 2027))}
          {/* labels */}
          {MILESTONES.map((ms) => {
            const y = laneY(ms.lane) + (ms.above ? -12 : compare ? 33 : 22)
            const x = labelX(ms)
            const on = ms.id === sel
            const text = narrow ? ms.short : ms.name.replace(' in Singapore', '').replace('IOAI at-home tasks', 'At-home tasks')
            const estW = text.length * (on ? 7.2 : 6.6)
            const xx = Math.min(W - padR - estW / 2, Math.max(padL + estW / 2, x))
            return (
              <text
                key={ms.id}
                x={xx}
                y={y}
                textAnchor="middle"
                onClick={() => setSel(ms.id)}
                style={{ cursor: 'pointer', fontSize: narrow ? 11.5 : 12.5, fontWeight: on ? 800 : 650, fill: on ? 'var(--ink)' : textOf(laneOf(ms.lane).colour) }}
              >
                {text}
              </text>
            )
          })}
        </svg>
      </div>
      {compare && <p className={s.note}>Hollow, dashed shapes just below each line show the 2026 cycle on the same calendar days.</p>}

      <div className={s.chips} role="group" aria-label="Milestones">
        {MILESTONES.map((ms) => (
          <button
            key={ms.id}
            type="button"
            className={`${s.chip} ${ms.id === sel ? s.chipOn : ''}`}
            aria-pressed={ms.id === sel}
            onClick={() => setSel(ms.id)}
            onKeyDown={onKey(ms.id)}
          >
            <span className={s.chipDot} style={{ background: laneOf(ms.lane).colour }} />
            {ms.short}
          </button>
        ))}
      </div>

      <div className={s.card} style={{ borderLeftColor: c }} aria-live="polite">
        <div className={s.cardHead}>
          <span className={s.cardTitle}>{m.name}</span>
          <span className={s.cardWhen}>{m.y2027.label}</span>
          <span className={s.cardWho}>
            <span className={s.chipDot} style={{ background: c }} />
            run by {laneOf(m.lane).label}
          </span>
        </div>
        <p className={s.cardRow}>{m.what}</p>
        <p className={s.cardRow}>
          <span className={s.cardLabel}>How to prepare: </span>
          {m.prep}
        </p>
        {compare && (
          <p className={s.cardThen}>
            <span className={s.cardLabel}>2026 cycle: </span>
            {m.then2026}
          </p>
        )}
      </div>

      <Controls>
        <Toggle label="Compare with the 2026 cycle" checked={compare} onChange={setCompare} />
        <Readout
          items={
            compare
              ? [
                  ['Final → NTU test', wk(gap27a)],
                  ['in 2026', wk(gap26a)],
                  ['NTU test → IOAI', wk(gap27b)],
                  ['in 2026', wk(gap26b)],
                ]
              : [
                  ['Final → NTU test', wk(gap27a)],
                  ['NTU test → IOAI', wk(gap27b)],
                ]
          }
        />
      </Controls>
    </Figure>
  )
}
