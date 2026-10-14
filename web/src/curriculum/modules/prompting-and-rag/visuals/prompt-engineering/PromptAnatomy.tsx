import { useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Button, useNarrow } from '../../../../../kit'
import s from './pe.module.css'

/*
  Six parts of a prompt, each switchable. The reply is ILLUSTRATIVE: it is assembled from fragments,
  each controlled by one part, to show the typical effect of that part (a real model's reply varies).
  Dates: 8 Jan 2027 → 19 Feb 2027 is 23 + 19 = 42 days = 6 weeks.
*/

type Key = 'role' | 'task' | 'context' | 'constraints' | 'format' | 'reasoning'

const PARTS: { key: Key; name: string; color: string; text: string; off?: string; does: string }[] = [
  { key: 'role', name: 'Role', color: 'var(--viz-5)', text: 'You are an experienced NOAI coach for Secondary 3 students.', does: 'who the model should be: expertise, tone, level' },
  { key: 'task', name: 'Task', color: 'var(--viz-1)', text: 'Make me a revision plan for the NOAI Preliminary Round.', off: 'Help me study.', does: 'exactly what to produce' },
  {
    key: 'context',
    name: 'Context',
    color: 'var(--viz-3)',
    text: 'Today is 8 Jan 2027. The Prelim is on 19 Feb 2027: 150 MCQs in 90 minutes, no calculator. My weakest topic is probability.',
    does: 'facts the model cannot know',
  },
  {
    key: 'constraints',
    name: 'Constraints',
    color: 'var(--viz-2)',
    text: 'I can study at most 1 hour on weekdays and 2 hours on Saturdays, and I have CCA every Tuesday. Keep it under 120 words.',
    does: 'limits the answer must respect',
  },
  { key: 'format', name: 'Format', color: 'var(--viz-4)', text: 'Reply as a table with columns Week | Focus | Practice.', does: 'the exact shape of the answer' },
  { key: 'reasoning', name: 'Reasoning', color: 'var(--viz-6)', text: 'First count the weeks left and decide how to split the topics, then write the plan.', does: 'think before answering' },
]

type On = Record<Key, boolean>
const ALL_ON: On = { role: true, task: true, context: true, constraints: true, format: true, reasoning: true }
const ALL_OFF: On = { role: false, task: false, context: false, constraints: false, format: false, reasoning: false }

const ROLE_PRACTICE = ['Timed MCQ sets, no calculator', 'Past-paper questions', 'Redo every wrong answer', 'Mixed timed sets', 'Full mock under exam timing']
const GENERIC_PRACTICE = ['Read notes, do exercises', 'Read notes, do exercises', 'Read notes, do exercises', 'Read notes, do exercises', 'Read notes, do exercises']

interface Reply {
  opener: string
  working?: string
  schedule?: string
  scheduleFlag?: string
  rows?: [string, string, string][]
  rowsFlag?: string
  prose?: string
  tips?: string
  padding?: string
}

function compose(on: On): Reply {
  if (!on.task) {
    return {
      opener: 'Sure! Here are some general study tips: make a timetable, practise questions, take short breaks and get enough sleep.' + (on.context ? ' Good luck for your Prelim on 19 Feb!' : ''),
      rowsFlag: 'no plan at all: the task never asked for one',
    }
  }
  const weeks = on.context ? (on.reasoning ? 6 : 5) : 4
  let focus: [string, string][]
  if (!on.context)
    focus = [
      ['1', 'Maths'],
      ['2', 'Computing'],
      ['3', 'AI and machine learning'],
      ['4', 'Revision'],
    ]
  else if (weeks === 6)
    focus = [
      ['1–2', 'Probability (your weak spot)'],
      ['3', 'Maths and computing'],
      ['4', 'ML and deep learning'],
      ['5', 'Generative AI, problem solving'],
      ['6', 'Full mocks, then rest'],
    ]
  else
    focus = [
      ['1–2', 'Probability (your weak spot)'],
      ['3', 'Maths and computing'],
      ['4', 'ML, deep learning and GenAI'],
      ['5', 'Full mocks, then rest'],
    ]
  const practice = on.role ? ROLE_PRACTICE.slice(0, focus.length - 1).concat(ROLE_PRACTICE[4]) : GENERIC_PRACTICE.slice(0, focus.length)
  const rows = focus.map(([w, f], i) => [w, f, practice[i]] as [string, string, string])
  const r: Reply = {
    opener: on.role ? `${weeks} weeks is enough if you are consistent. Here is your plan:` : 'Here is a study plan:',
  }
  if (on.reasoning)
    r.working = on.context
      ? 'Working: 8 Jan → 19 Feb is 23 + 19 = 42 days = 6 weeks. Probability is the weak spot, so it gets weeks 1–2; the last week is for full mocks.'
      : "Working: you didn't say when the Prelim is, so I'll assume 4 weeks."
  if (on.constraints) r.schedule = 'Schedule: 1 h on Mon, Wed, Thu and Fri; 2 h on Sat; Tuesdays free for CCA.'
  else {
    r.schedule = 'Study 3 hours every day, including weekends.'
    r.scheduleFlag = 'you can’t do this, but the model was never told'
  }
  if (!on.context) r.rowsFlag = 'guessed: the model doesn’t know your exam date or weak topic'
  else if (!on.reasoning) r.rowsFlag = 'miscounted: 8 Jan to 19 Feb is 6 weeks, so the last week has no plan'
  if (on.format) r.rows = rows
  else
    r.prose = `Over the next ${weeks} weeks: ` + rows.map(([w, f, p]) => `${w.includes('–') ? 'weeks' : 'week'} ${w}, ${lowerFirst(f)}: ${lowerFirst(p)}`).join('; ') + '.'
  if (!on.constraints)
    r.padding =
      'Also remember to drink enough water, sleep eight hours every night, eat a good breakfast, stay positive, reward yourself after every study session, keep your desk tidy, put your phone in another room and, most importantly, believe in yourself!'
  return r
}

const lowerFirst = (t: string) => (/^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t)

const words = (t: string) => t.split(/\s+/).filter(Boolean).length

function replyWords(r: Reply) {
  let t = [r.opener, r.working, r.schedule, r.prose, r.padding].filter(Boolean).join(' ')
  if (r.rows) t += ' ' + r.rows.flat().join(' ')
  return words(t)
}

function Flag({ children }: { children: ReactNode }) {
  return <span className={s.flag}>⚠ {children}</span>
}

export default function PromptAnatomy() {
  const [on, setOn] = useState<On>({ role: false, task: true, context: false, constraints: false, format: false, reasoning: false })
  const [ref, narrow] = useNarrow<HTMLDivElement>(620)
  const r = compose(on)
  const nWords = replyWords(r)

  const checks: { ok: boolean; text: string; why: string }[] = [
    { ok: on.task, text: 'Gives a revision plan', why: 'task' },
    { ok: on.task && on.context, text: 'Uses your exam date and weak topic', why: 'context' },
    { ok: on.task && on.context && on.reasoning, text: 'Counts the weeks correctly', why: 'context + reasoning' },
    { ok: on.task && on.constraints && nWords < 120, text: 'Fits your week and stays under 120 words', why: 'constraints' },
    { ok: on.task && on.format, text: 'Easy to scan at a glance', why: 'format' },
    { ok: on.task && on.role, text: 'Exam-style practice, not generic tips', why: 'role' },
    { ok: on.task && on.reasoning, text: 'Shows its working, so you can check it', why: 'reasoning' },
  ]
  const score = checks.filter((c) => c.ok).length

  const promptPanel = (
    <div>
      <div className={s.panelHead}>
        <span>Your prompt</span>
        <small>click a part to switch it</small>
      </div>
      <div className={s.parts}>
        {PARTS.map((p) => {
          const active = on[p.key]
          const isTask = p.key === 'task'
          const text = isTask && !active ? p.off! : p.text
          return (
            <div key={p.key} className={`${s.part} ${active ? '' : s.partOff}`} style={{ borderLeftColor: active ? p.color : 'var(--rule)' }}>
              <button
                type="button"
                className={s.partToggle}
                style={{ color: active ? p.color : 'var(--ink-3)' }}
                aria-pressed={active}
                onClick={() => setOn((o) => ({ ...o, [p.key]: !o[p.key] }))}
                title={p.does}
              >
                <span className={s.dot} style={{ background: active ? p.color : 'transparent' }} aria-hidden="true" />
                {isTask && !active ? 'Task: vague' : p.name}
              </button>
              <span className={s.partText} style={isTask && !active ? { textDecoration: 'none', color: 'var(--ink)' } : undefined}>
                {text}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )

  const replyPanel = (
    <div>
      <div className={s.panelHead}>
        <span>Model's reply</span>
        <small>illustrative, {nWords} words</small>
      </div>
      <div className={s.reply} aria-live="polite">
        <p>{r.opener}</p>
        {r.working && <div className={s.working}>{r.working}</div>}
        {r.schedule && (
          <p>
            {r.schedule}
            {r.scheduleFlag && <Flag>{r.scheduleFlag}</Flag>}
          </p>
        )}
        {r.rows && (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Week</th>
                <th>Focus</th>
                <th>Practice</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map(([w, f, p]) => (
                <tr key={w}>
                  <td>{w}</td>
                  <td>{f}</td>
                  <td>{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {r.prose && <p>{r.prose}</p>}
        {r.rowsFlag && (
          <p style={{ marginTop: -2 }}>
            <Flag>{r.rowsFlag}</Flag>
          </p>
        )}
        {r.padding && <p style={{ color: 'var(--ink-2)' }}>{r.padding}</p>}
      </div>
    </div>
  )

  const checkPanel = (
    <div>
      <div className={s.panelHead}>
        <span>Is it useful?</span>
        <span className={s.score}>
          {score} / {checks.length}
        </span>
      </div>
      <ul className={s.checks}>
        {checks.map((c) => (
          <li key={c.text}>
            <span className={`${s.tick} ${c.ok ? s.tickYes : s.tickNo}`} aria-label={c.ok ? 'yes' : 'no'}>
              {c.ok ? '✓' : '✗'}
            </span>
            <span>
              {c.text} <span className={s.checkWhy}>({c.why})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <Figure
      wide
      title="Anatomy of a prompt: switch the parts on and off"
      caption={
        <>
          The prompt starts as a bare task. Switch on <b>context</b> first: the plan stops guessing your dates. Then <b>format</b> (a table instead of a paragraph) and <b>constraints</b> (it now fits
          your week, and the padding disappears). Turn <b>reasoning</b> off with context on and the week count slips; switch the task to vague and nothing else can rescue the reply. The replies
          are illustrative: each fragment shows the typical effect of one part, not the output of a real model.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        {narrow ? (
          <div className={s.stack}>
            {promptPanel}
            {replyPanel}
            {checkPanel}
          </div>
        ) : (
          <div className={s.cols}>
            <div className={s.stack}>
              {promptPanel}
              {checkPanel}
            </div>
            <div className={s.stack}>{replyPanel}</div>
          </div>
        )}
        <Controls>
          <Button onClick={() => setOn(ALL_ON)}>All parts on</Button>
          <Button onClick={() => setOn({ ...ALL_OFF, task: true })}>Bare task only</Button>
          <Readout items={[['parts switched on', `${Object.values(on).filter(Boolean).length} of 6`], ['reply length', `${nWords} words`]]} />
        </Controls>
      </div>
    </Figure>
  )
}
