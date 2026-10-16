import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Slider, Button, Plot, Path, Label, Rect, Dots, DraggablePoint, useNarrow, usePlot } from '../../../../../kit'
import { PRELIM, FINAL, TIMELINE, CONTACT_EMAIL } from '../../../../../data/facts'

/*
  The NOAI 2027 → IOAI 2027 calendar on one line. Drag "today" and read how many weeks are
  left before each milestone, and what this stretch of time should be used for.
  Dates are handled as whole days in UTC so time zones cannot shift them.
*/

const DAY = 86400000
const ORIGIN = Date.UTC(2026, 9, 1) // 1 Oct 2026 = day 0
const LAST = Math.round((Date.UTC(2027, 6, 14) - ORIGIN) / DAY) // 14 Jul 2027

const dayOfIso = (iso: string) => Math.round((Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) - ORIGIN) / DAY)
const isoOf = (title: string, fallback: string) => TIMELINE.find((t) => t.title === title)?.iso ?? fallback
const fmt = (d: number, withDay = false) =>
  new Date(ORIGIN + d * DAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(withDay ? { weekday: 'short' } : {}), timeZone: 'UTC' })
const weeks = (n: number) => (n < 7 ? `${n} day${n === 1 ? '' : 's'}` : `${Math.floor(n / 7)} wk ${n % 7} d`)
/** small coloured text: mixed towards the ink colour so it passes contrast in light mode */
const txt = (c: string) => `color-mix(in srgb, ${c} 65%, var(--ink))`

const D = {
  writeIns: dayOfIso(isoOf('Direct write-ins close', '2026-11-27')),
  signUp: dayOfIso(isoOf('Schools register interest', '2027-01-15')),
  prelim: dayOfIso(PRELIM.date),
  final: dayOfIso(FINAL.date),
  ntu: dayOfIso(isoOf('NTU Selection Test', '2027-05-08')),
  trainFrom: dayOfIso('2027-05-22'),
  campTo: dayOfIso(isoOf('Residential camp', '2027-06-18')),
  ioaiFrom: dayOfIso('2027-07-04'),
  ioaiTo: dayOfIso(isoOf('IOAI 2027 in Singapore', '2027-07-10')),
}

const AXIS = 5.9

interface Pin {
  day: number
  to?: number
  label: string
  short: string
  row: 1 | 2
  colour: string
  bold?: boolean
  /** put the label to the left of its pin */
  leftLabel?: boolean
}

const PINS: Pin[] = [
  { day: D.writeIns, label: 'Direct entries close', short: 'Write-ins', row: 1, colour: 'var(--viz-6)' },
  { day: D.signUp, label: 'School sign-up closes', short: 'Sign-up', row: 2, colour: 'var(--viz-6)', leftLabel: true },
  { day: D.prelim, label: 'Prelim', short: 'Prelim', row: 1, colour: 'var(--viz-1)', bold: true },
  { day: D.final, label: 'Final', short: 'Final', row: 2, colour: 'var(--viz-3)', bold: true },
  { day: D.ntu, label: 'NTU test', short: 'NTU', row: 1, colour: 'var(--viz-5)' },
  { day: D.trainFrom, to: D.campTo, label: 'Training + camp', short: 'Camp', row: 2, colour: 'var(--viz-5)' },
  { day: D.ioaiFrom, to: D.ioaiTo, label: 'IOAI 2027', short: 'IOAI', row: 1, colour: 'var(--viz-2)', bold: true },
]

const TARGETS = [
  { day: D.prelim, name: 'Prelim', colour: 'var(--viz-1)', y: 4.3 },
  { day: D.final, name: 'Final', colour: 'var(--viz-3)', y: 3.2 },
  { day: D.ntu, name: 'NTU test', colour: 'var(--viz-5)', y: 2.1 },
  { day: D.ioaiFrom, name: 'IOAI', colour: 'var(--viz-2)', y: 1.0 },
]

function phase(t: number): { title: string; text: string } {
  if (t < D.prelim - 42)
    return {
      title: 'Build phase',
      text: 'Work through the course parts in order (code, the maths and data toolkit, classical ML, deep learning, then vision, language and generative AI), doing every checkpoint.',
    }
  if (t < D.prelim - 14)
    return {
      title: 'Exam-mode phase',
      text: 'Timed MCQ sets and past papers for the Prelim, and start the Final labs now: from-scratch NumPy and PyTorch tasks need weeks of practice, and the Final is only 14 days after the Prelim.',
    }
  if (t < D.prelim)
    return { title: 'The last fortnight', text: 'Full 150-question mocks in 90 minutes, spaced review of your mistakes, and one Final-lab notebook a week.' }
  if (t === D.prelim)
    return { title: 'Prelim day', text: '150 MCQs in 90 minutes. Check your pace with "question number ÷ 2 = minutes gone", and answer every question. From tomorrow, switch to Final mode.' }
  if (t === D.final) return { title: 'Final day', text: 'MCQs first, then bank the core parts of each programming task before any bonus part.' }
  if (t < D.final) return { title: 'Final mode', text: 'Timed Jupyter notebooks with no AI helpers, plus code-reading MCQs. There is no time to start from zero now.' }
  if (t < D.ntu)
    return { title: 'Results and IOAI-style practice', text: 'Award tiers come out in early April. If you are invited to NTU, switch to open-ended tasks on real datasets.' }
  if (t < D.ioaiFrom) return { title: 'NTU training', text: 'Selection test, Saturday training and the residential camp pick the team for IOAI 2027.' }
  return { title: 'IOAI 2027 in Singapore', text: 'The national team competes from 4 to 10 July. The next NOAI cycle begins later in 2027.' }
}

function todayDay() {
  const sg = new Date(Date.now() + 8 * 3600000) // Singapore time
  const d = Math.round((Date.UTC(sg.getUTCFullYear(), sg.getUTCMonth(), sg.getUTCDate()) - ORIGIN) / DAY)
  return Math.max(0, Math.min(LAST, d))
}

const MONTHS = Array.from({ length: 10 }, (_, i) => {
  const t = Date.UTC(2026, 9 + i, 1)
  const dt = new Date(t)
  const mon = dt.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })
  const yy = String(dt.getUTCFullYear()).slice(2)
  return {
    d: Math.round((t - ORIGIN) / DAY),
    label: i === 0 || dt.getUTCMonth() === 0 ? `${mon} ${dt.getUTCFullYear()}` : mon,
    // phones: every other month, with the year on Oct and Feb
    short: i % 2 === 1 ? '' : i === 0 || i === 4 ? `${mon} ’${yy}` : mon,
  }
}).filter((m) => m.d <= LAST)

/** Everything drawn in data coordinates; uses the live x-scale to place labels so they never collide with the span. */
function Layers({ today, narrow }: { today: number; narrow: boolean }) {
  const { xs } = usePlot()
  const px = (a: number, b: number) => Math.abs(xs(b) - xs(a))
  const [x0, x1] = xs.range()
  const charW = 6.6
  return (
    <>
      <Path points={[[0, AXIS], [LAST, AXIS]]} color="var(--viz-axis)" width={2} />
      {MONTHS.map((m) => (
        <g key={m.d}>
          <Path points={[[m.d, AXIS - 0.18], [m.d, AXIS + 0.18]]} color="var(--viz-axis)" width={1.5} />
          {(narrow ? m.short : m.label) && (
            <Label x={m.d} y={AXIS} dy={19} dx={2} color="var(--ink-3)" size={11}>
              {narrow ? m.short : m.label}
            </Label>
          )}
        </g>
      ))}
      {PINS.map((p) => {
        const ly = p.row === 1 ? 9.2 : 7.7
        const end = p.to ?? p.day
        const text = narrow ? p.short : p.label
        const flip = p.leftLabel || xs(p.day) + text.length * charW + 6 > x1
        return (
          <g key={p.label}>
            {p.to !== undefined && <Rect x0={p.day} x1={p.to} y0={AXIS - 0.22} y1={AXIS + 0.22} fill={p.colour} />}
            <Path points={[[p.day, AXIS], [p.day, ly - 0.25]]} color={p.colour} width={1.5} dash={p.bold ? undefined : '3 3'} />
            <Label x={flip ? end : p.day} y={ly} dx={flip ? -3 : 3} anchor={flip ? 'end' : 'start'} color={txt(p.colour)} size={narrow ? 11.5 : 12.5} weight={p.bold ? 800 : 650}>
              {text}
            </Label>
          </g>
        )
      })}
      <Dots points={PINS.filter((p) => p.to === undefined).map((p) => ({ x: p.day, y: AXIS, color: p.colour, r: 4 }))} />
      {TARGETS.map((t) => {
        const left = t.day - today
        // milestones already passed: the tiles below say "done", so draw nothing here
        if (left < 0) return null
        if (left === 0)
          return (
            <Label key={t.name} x={t.day} y={t.y} dx={xs(t.day) > (x0 + x1) / 2 ? -6 : 6} dy={4} anchor={xs(t.day) > (x0 + x1) / 2 ? 'end' : 'start'} color={txt(t.colour)} size={12} weight={800}>
              {`${t.name}: today!`}
            </Label>
          )
        const text = narrow ? `${weeks(left)} → ${t.name}` : `${weeks(left)} to the ${t.name}`
        const textPx = text.length * charW
        const where = px(today, t.day) > textPx + 12 ? 'inside' : x1 - xs(t.day) > textPx + 10 ? 'right' : 'left'
        return (
          <g key={t.name}>
            <Path points={[[today, t.y], [t.day, t.y]]} color={t.colour} width={3} />
            <Path points={[[t.day, t.y - 0.25], [t.day, t.y + 0.25]]} color={t.colour} width={2} />
            {where === 'inside' ? (
              <Label x={(today + t.day) / 2} y={t.y} dy={-6} anchor="middle" color={txt(t.colour)} size={12} weight={700}>
                {text}
              </Label>
            ) : where === 'right' ? (
              <Label x={t.day} y={t.y} dx={6} dy={4} color={txt(t.colour)} size={12} weight={700}>
                {text}
              </Label>
            ) : (
              <Label x={today} y={t.y} dx={-6} dy={4} anchor="end" color={txt(t.colour)} size={12} weight={700}>
                {text}
              </Label>
            )}
          </g>
        )
      })}
    </>
  )
}

/** "today: 15 Oct" in a pill at the top of the dashed line, above every pin label; it flips side near the right edge. */
function TodayTag({ today }: { today: number }) {
  const { xs, ys } = usePlot()
  const [, x1] = xs.range()
  const text = `today: ${fmt(today)}`
  const w = text.length * 6.9 + 14
  const x = xs(today)
  const left = x + w + 2 > x1
  const bx = left ? x - w : x
  const y = ys(10.25)
  return (
    <g aria-hidden="true">
      <rect x={bx} y={y - 9} width={w} height={19} rx={9.5} style={{ fill: 'var(--viz-ink)' }} />
      <text x={bx + w / 2} y={y + 4.5} textAnchor="middle" style={{ fill: 'var(--surface)', fontSize: 12, fontWeight: 800 }}>
        {text}
      </text>
    </g>
  )
}

const tile: CSSProperties = { borderRadius: 'var(--radius-m)', padding: '0.45rem 0.6rem', background: 'var(--surface-2)', display: 'grid', gap: '0.1rem', minWidth: 0 }

export default function CountdownTimeline() {
  const [today, setToday] = useState(todayDay)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const ph = phase(today)

  return (
    <Figure
      title="Your countdown to the Prelim, the Final and IOAI 2027"
      caption={
        <>
          Drag the <strong>today</strong> marker (or use the slider). The coloured spans show how long is left before each milestone. Notice the red strip: the Final comes only{' '}
          <strong>{D.final - D.prelim} days</strong> after the Prelim, so practice for it has to start well before the Prelim.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <Plot x={[-4, LAST + 4]} y={[0, 11]} width={680} height={320} minHeight={310} margin={{ left: 10, right: 10, top: 6, bottom: 6 }} ariaLabel={`Timeline from October 2026 to July 2027. Today is ${fmt(today)}; ${Math.max(0, D.prelim - today)} days to the Prelim.`}>
          <Rect x0={D.prelim} x1={D.final} y0={0.4} y1={9.9} fill="color-mix(in srgb, var(--viz-neg) 14%, transparent)" />
          <Label x={(D.prelim + D.final) / 2} y={0.15} anchor="middle" color={txt('var(--viz-neg)')} size={11} weight={700}>
            {`${D.final - D.prelim} d`}
          </Label>
          <Layers today={today} narrow={narrow} />
          {/* today */}
          <Path points={[[today, 0.4], [today, 10.25]]} color="var(--viz-ink)" width={1.5} dash="5 4" />
          <TodayTag today={today} />
          <g role="group" aria-label="Today marker: drag it, or use the arrow keys, to change the date">
            <DraggablePoint x={today} y={AXIS} lockY color="var(--viz-ink)" r={8} constrain={(x, y) => [Math.round(Math.max(0, Math.min(LAST, x))), y]} onChange={(x) => setToday(Math.round(Math.max(0, Math.min(LAST, x))))} />
          </g>
        </Plot>
      </div>
      <Controls>
        <Slider label="today" value={today} min={0} max={LAST} step={1} onChange={setToday} format={(v) => fmt(v, true)} />
        <Button onClick={() => setToday(todayDay())}>Back to the real today</Button>
      </Controls>
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(130px, 100%), 1fr))', gap: '0.5rem' }}>
        {TARGETS.map((t) => {
          const left = t.day - today
          return (
            <div key={t.name} style={{ ...tile, borderTop: `3px solid ${t.colour}` }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)' }}>
                {t.name} · {fmt(t.day)}
              </span>
              <span className="tabular" style={{ fontWeight: 800, color: 'var(--ink)' }}>
                {left > 0 ? `${left} days` : left === 0 ? 'today!' : 'done'}
              </span>
              <span className="tabular" style={{ fontSize: '0.8rem', color: 'var(--ink-2)' }}>
                {left > 0 ? weeks(left) : ' '}
              </span>
            </div>
          )
        })}
      </div>
      <div aria-live="polite" style={{ width: '100%', borderLeft: '4px solid var(--accent)', background: 'var(--accent-soft)', borderRadius: 'var(--radius-m)', padding: '0.6rem 0.85rem', fontSize: '0.92rem', lineHeight: 1.45 }}>
        <div style={{ fontWeight: 800, color: 'var(--ink)' }}>What this stretch is for: {ph.title}</div>
        <div style={{ color: 'var(--ink-2)' }}>{ph.text}</div>
        {today <= D.writeIns && (
          <div style={{ marginTop: '0.35rem', color: 'var(--ink)' }}>
            Not in an MOE school? Email <strong>{CONTACT_EMAIL}</strong> by {fmt(D.writeIns)} ({D.writeIns - today} days left).
          </div>
        )}
        {today <= D.signUp && (
          <div style={{ marginTop: '0.2rem', color: 'var(--ink)' }}>
            MOE schools can sign up until {fmt(D.signUp)} ({D.signUp - today} days left): ask your school's NOAI teacher representative.
          </div>
        )}
      </div>
    </Figure>
  )
}
