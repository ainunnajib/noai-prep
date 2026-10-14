import { Fragment, useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Segmented, useNarrow } from '../../../../../kit'
import { TIMELINE, CONTACT_EMAIL } from '../../../../../data/facts'

/*
  Who can enter NOAI 2027, how they register, and who can go on to the IOAI team.
  Rules from the official NOAI 2027 page and FAQ (see src/data/facts.ts).
*/

type School = 'moe' | 'home' | 'between' | 'private'
type Age = 'u20' | 'o20'
type Pass = 'sc' | 'pr' | 'other'

const findDate = (title: string, fallback: string) => TIMELINE.find((t) => t.title === title)?.date ?? fallback
const WRITE_IN = findDate('Direct write-ins close', 'by 27 Nov 2026').replace(/^by\s+/, '')
const SIGN_UP = findDate('Schools register interest', '1 Aug 2026 – 15 Jan 2027').split('–').pop()!.trim()

const SCHOOLS: { value: School; label: string; long: string }[] = [
  { value: 'moe', label: 'MOE school', long: 'Full-time in an MOE secondary school, IP, JC, ITE or polytechnic' },
  { value: 'home', label: 'Home-schooled', long: 'Home-schooled' },
  { value: 'between', label: 'Between schools', long: 'Between institutions, e.g. finished Sec 4 and waiting to start JC or poly' },
  { value: 'private', label: 'Private or international', long: 'At a private or international school' },
]

type Status = 'yes' | 'maybe' | 'no'

interface Result {
  status: Status
  headline: string
  route: string[]
  details: [string, ReactNode][]
}

function decide(school: School, age: Age, pass: Pass): Result {
  if (age === 'o20')
    return {
      status: 'no',
      headline: 'Not eligible: NOAI is for full-time students below age 20.',
      route: [],
      details: [['Why', 'The age rule applies to every route into NOAI 2027.']],
    }
  const direct = (send: string, extra?: string): Result['details'] => [
    ['Register', <>Email <strong>{CONTACT_EMAIL}</strong> yourself, with {send}.</>],
    ['Deadline', <strong>{WRITE_IN}</strong>],
    ['Prelim venue', 'The AI Singapore office at NUS, same date and time as everyone else. You compete for the same 150 Final places.'],
    ['Cost', extra ? `Free. ${extra}` : 'Free.'],
  ]
  const directRoute = ['You', `Email ${CONTACT_EMAIL}`, 'AI Singapore approves', 'Prelim at AISG (NUS)']
  switch (school) {
    case 'moe':
      return {
        status: 'yes',
        headline: 'You can enter, whatever your nationality, through your school.',
        route: ['You', "Your school's NOAI teacher rep", 'School signs up with AI Singapore', 'Prelim in your school lab'],
        details: [
          ['Register', "Ask your school's NOAI teacher representative. Sign-ups from individual MOE students are not accepted."],
          ['Deadline', <>Your school must sign up by <strong>{SIGN_UP}</strong>, so ask early.</>],
          ['Prelim venue', "Your school's computer lab."],
          ['Cost', 'Free.'],
        ],
      }
    case 'home':
      if (pass === 'other')
        return {
          status: 'no',
          headline: 'Not covered: the home-schooled route is for Singapore Citizens and PRs.',
          route: [],
          details: [['If unsure', <>Email <strong>{CONTACT_EMAIL}</strong> to ask before {WRITE_IN}.</>]],
        }
      return { status: 'yes', headline: 'You can enter through the direct route.', route: directRoute, details: direct('your full name, age and learning arrangement') }
    case 'between':
      return {
        status: 'yes',
        headline: 'You can enter through the direct route.',
        route: directRoute,
        details: direct('your name, your most recent school and where you are going next (for example, the polytechnic you will join)'),
      }
    case 'private':
      return {
        status: 'maybe',
        headline: 'Possible: requests are decided case by case, with no guarantee.',
        route: directRoute,
        details: direct('your name, school, year level and nationality', 'Approval is case by case.'),
      }
  }
}

const STATUS_STYLE: Record<Status, { colour: string; soft: string; icon: string }> = {
  yes: { colour: 'var(--ok)', soft: 'var(--ok-soft)', icon: '✓' },
  maybe: { colour: 'var(--warn)', soft: 'var(--warn-soft)', icon: '?' },
  no: { colour: 'var(--bad)', soft: 'var(--bad-soft)', icon: '✕' },
}

const box: CSSProperties = {
  border: '1.5px solid var(--rule)',
  background: 'var(--surface)',
  borderRadius: 'var(--radius-m)',
  padding: '0.45rem 0.6rem',
  fontSize: '0.85rem',
  fontWeight: 650,
  color: 'var(--ink)',
  textAlign: 'center',
  minWidth: 0,
  overflowWrap: 'anywhere',
}

/** Radio chips that wrap cleanly on phones (the four school types have long labels). */
function ChipGroup<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'grid', gap: '0.3rem' }}>
      <span style={{ fontSize: 'var(--step--1)', fontWeight: 600, color: 'var(--ink-2)' }}>{label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {options.map((o) => {
          const on = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              style={{
                font: 'inherit',
                fontSize: 'var(--step--1)',
                fontWeight: 700,
                padding: '0.35rem 0.8rem',
                borderRadius: 999,
                cursor: 'pointer',
                border: `1.5px solid ${on ? 'var(--accent)' : 'var(--rule)'}`,
                background: on ? 'var(--accent)' : 'var(--surface)',
                color: on ? 'var(--accent-ink)' : 'var(--ink-2)',
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function EligibilityChecker() {
  const [school, setSchool] = useState<School>('moe')
  const [age, setAge] = useState<Age>('u20')
  const [pass, setPass] = useState<Pass>('other')
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const res = decide(school, age, pass)
  const st = STATUS_STYLE[res.status]
  const canEnter = res.status !== 'no'
  const citizen = pass !== 'other'

  // the four stages, and whether this student can be there
  const ladder: { stage: string; mark: Status; note: string }[] = [
    { stage: 'Prelim', mark: res.status, note: canEnter ? (res.status === 'maybe' ? 'if approved' : 'yes') : 'no' },
    { stage: 'Final', mark: canEnter ? res.status : 'no', note: canEnter ? 'if top 150' : 'no' },
    { stage: 'NTU stage', mark: canEnter ? (citizen ? res.status : 'maybe') : 'no', note: canEnter ? (citizen ? 'if invited' : 'NTU decides') : 'no' },
    { stage: 'IOAI team', mark: canEnter && citizen ? res.status : 'no', note: canEnter && citizen ? 'if selected' : 'SC/PR only' },
  ]

  return (
    <Figure
      title="Can I enter, and how do I register?"
      caption={
        <>
          Flip the choices. Start with an MOE student who is <strong>not</strong> a Singapore Citizen or PR: they can enter NOAI and win an award, and only the last step, the
          IOAI team, is closed. Then try <strong>Private or international</strong>: the route changes from your school to an email you send yourself, with an earlier deadline.
        </>
      }
    >
      <div style={{ display: 'grid', gap: '0.6rem', width: '100%' }}>
        <ChipGroup label="Where do you study?" value={school} onChange={setSchool} options={SCHOOLS} />
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginTop: '-0.3rem' }}>{SCHOOLS.find((s) => s.value === school)!.long}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 1.5rem' }}>
          <Segmented
            label="Age on the day"
            value={age}
            onChange={setAge}
            options={[
              { value: 'u20', label: 'Under 20' },
              { value: 'o20', label: '20 or older' },
            ]}
          />
          <Segmented
            label="Citizenship"
            value={pass}
            onChange={setPass}
            options={[
              { value: 'sc', label: 'Citizen' },
              { value: 'pr', label: 'PR' },
              { value: 'other', label: 'Other' },
            ]}
          />
        </div>
      </div>

      <div ref={ref} aria-live="polite" style={{ width: '100%', border: `1.5px solid ${st.colour}`, borderRadius: 'var(--radius-l)', overflow: 'hidden' }}>
        <div style={{ background: st.soft, padding: '0.6rem 0.85rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span
            aria-hidden="true"
            style={{ flex: 'none', width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', background: st.colour, color: 'var(--surface)', fontWeight: 900 }}
          >
            {st.icon}
          </span>
          <strong style={{ color: 'var(--ink)', lineHeight: 1.35 }}>{res.headline}</strong>
        </div>
        <div style={{ padding: '0.75rem 0.85rem', display: 'grid', gap: '0.75rem' }}>
          {res.route.length > 0 && (
            <div
              aria-label={`Route: ${res.route.join(', then ')}`}
              style={{
                display: 'grid',
                gridTemplateColumns: narrow ? '1fr' : `repeat(${res.route.length * 2 - 1}, auto)`,
                justifyContent: narrow ? 'stretch' : 'start',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {res.route.map((r, i) => (
                <Fragment key={r}>
                  {i > 0 && (
                    <span aria-hidden="true" style={{ textAlign: 'center', color: st.colour, fontWeight: 900 }}>
                      {narrow ? '↓' : '→'}
                    </span>
                  )}
                  <span style={{ ...box, borderColor: i === 0 ? 'var(--rule)' : st.colour, background: i === 0 ? 'var(--surface-2)' : 'var(--surface)' }}>{r}</span>
                </Fragment>
              ))}
            </div>
          )}
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'minmax(6.5rem, max-content) 1fr', gap: '0.35rem 0.8rem', fontSize: '0.9rem', lineHeight: 1.45 }}>
            {res.details.map(([k, v]) => (
              <Fragment key={k}>
                <dt style={{ fontWeight: 700, color: 'var(--ink-3)' }}>{k}</dt>
                <dd style={{ margin: 0, color: 'var(--ink)' }}>{v}</dd>
              </Fragment>
            ))}
          </dl>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '0.3rem' }}>How far can this student go?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.3rem' }}>
              {ladder.map((l) => {
                const s = STATUS_STYLE[l.mark]
                return (
                  <div key={l.stage} style={{ textAlign: 'center', borderRadius: 'var(--radius-s)', background: s.soft, border: `1.5px solid ${s.colour}`, padding: '0.35rem 0.2rem', minWidth: 0 }}>
                    <div style={{ fontWeight: 900, color: s.colour }} aria-hidden="true">
                      {s.icon}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--ink)' }}>{l.stage}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-2)' }}>{l.note}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Figure>
  )
}
