import { useState } from 'react'
import { Figure, Controls, Toggle, PlayerControls } from '../../../../../kit'
import { useStepper } from './useStepper'
import s from './agents.module.css'

/*
  Function calling as a sequence of messages between four actors. The model only ever writes
  text; the app validates and runs the function and sends the result back as another message.
  Illustrative (no real model runs), but every tool result is real:
    days_between("2026-10-14", "2027-02-19") = 128 (Python: (date(2027,2,19) - date(2026,10,14)).days)
    0.17 * 2480 = 421.6
*/

type Actor = 'user' | 'app' | 'model' | 'tool'
type Kind = 'text' | 'tools' | 'call' | 'result' | 'error'
interface Msg {
  from: Actor
  to: Actor
  via?: Actor
  kind: Kind
  body: string
  mono?: boolean
  note: string
}

const NAMES: Record<Actor, string> = { user: 'User', app: 'Your app', model: 'LLM', tool: 'Tool' }
const ROLES: Record<Actor, string> = { user: 'asks', app: 'runs code', model: 'writes text', tool: 'a function' }
const KIND_LABEL: Record<Kind, string> = { text: 'text', tools: 'prompt + tool schemas', call: 'tool call', result: 'tool result', error: 'error' }
const KIND_CLASS: Record<Kind, string> = { text: s.kindText, tools: s.kindTools, call: s.kindCall, result: s.kindResult, error: s.kindError }

const TOOL_LIST = 'tools: days_between(start, end) · calculator(expression) · search_handbook(query)'

interface Scenario {
  key: string
  question: string
  tool?: string
  call?: string
  run?: string
  bad?: string
  error?: string
  result?: string
  answer: string
}

const SCENARIOS: Scenario[] = [
  {
    key: 'dates',
    question: 'How many days from 14 Oct 2026 to 19 Feb 2027?',
    tool: 'days_between',
    call: '{"name": "days_between",\n "arguments": {"start": "2026-10-14", "end": "2027-02-19"}}',
    run: 'days_between("2026-10-14", "2027-02-19")',
    bad: '{"name": "days_between",\n "arguments": {"start": "14 Oct 2026", "end": "19 Feb 2027"}}',
    error: 'Error: "start" must be a date written YYYY-MM-DD',
    result: '128',
    answer: 'There are 128 days from 14 October 2026 to 19 February 2027.',
  },
  {
    key: 'percent',
    question: 'What is 17% of 2,480?',
    tool: 'calculator',
    call: '{"name": "calculator",\n "arguments": {"expression": "0.17 * 2480"}}',
    run: 'calculator("0.17 * 2480")',
    bad: '{"name": "calculator",\n "arguments": {"expression": "17% of 2,480"}}',
    error: 'Error: cannot parse "17% of 2,480": use numbers and + - * / only',
    result: '421.6',
    answer: '17% of 2,480 is 421.6.',
  },
  {
    key: 'handbook',
    question: 'Is the library open on Friday?',
    tool: 'search_handbook',
    call: '{"name": "search_handbook",\n "arguments": {"query": "library open Friday"}}',
    run: 'search_handbook("library open Friday")',
    bad: '{"name": "search_handbook",\n "arguments": {"q": "library"}}',
    error: 'Error: missing required argument "query"',
    result: '[d0] The library is open on Friday.  (score 1.000)',
    answer: 'Yes. The handbook says the library is open on Friday [d0].',
  },
  {
    key: 'haiku',
    question: 'Write a haiku about the MRT.',
    answer: 'Doors chime, then slide shut\na river of quiet heads\nunderground, northbound',
  },
]

function build(sc: Scenario, badArgs: boolean): Msg[] {
  const msgs: Msg[] = [
    { from: 'user', to: 'app', kind: 'text', body: sc.question, note: 'The user types a question into your app.' },
    {
      from: 'app',
      to: 'model',
      kind: 'tools',
      body: `${TOOL_LIST}\nuser: ${sc.question}`,
      mono: true,
      note: 'Your app sends the conversation so far plus the tool schemas: each tool’s name, a description of what it does, and the parameters it takes.',
    },
  ]
  if (!sc.tool) {
    msgs.push({
      from: 'model',
      to: 'user',
      via: 'app',
      kind: 'text',
      body: sc.answer,
      note: 'No tool fits a creative request, so the model simply answers in text. Deciding NOT to call a tool is part of the skill.',
    })
    return msgs
  }
  if (badArgs) {
    msgs.push(
      {
        from: 'model',
        to: 'app',
        kind: 'call',
        body: sc.bad!,
        mono: true,
        note: 'The model writes a tool call, but with arguments that do not match the schema. It is only predicting text, so this can happen.',
      },
      {
        from: 'app',
        to: 'model',
        kind: 'error',
        body: sc.error!,
        mono: true,
        note: 'Your app validates the arguments before running anything. They fail, so it sends the error message back instead of a result.',
      },
      {
        from: 'model',
        to: 'app',
        kind: 'call',
        body: sc.call!,
        mono: true,
        note: 'The model reads the error and tries again, this time matching the schema. Clear error messages let it fix itself.',
      },
    )
  } else {
    msgs.push({
      from: 'model',
      to: 'app',
      kind: 'call',
      body: sc.call!,
      mono: true,
      note: 'Instead of answering, the model writes a tool call: ordinary text in an exact JSON format that matches the schema.',
    })
  }
  msgs.push(
    {
      from: 'app',
      to: 'tool',
      kind: 'call',
      body: sc.run!,
      mono: true,
      note: 'Your code checks the arguments and runs the real function. The model never executes anything itself.',
    },
    {
      from: 'tool',
      to: 'model',
      via: 'app',
      kind: 'result',
      body: `{"role": "tool", "name": "${sc.tool}", "content": ${JSON.stringify(sc.result)}}`,
      mono: true,
      note: 'The result is appended to the conversation as a tool message, and the model is called again with everything so far.',
    },
    {
      from: 'model',
      to: 'user',
      via: 'app',
      kind: 'text',
      body: sc.answer,
      note: 'With the tool’s result in its context, the model writes the final answer, which your app shows to the user.',
    },
  )
  return msgs
}

export default function FunctionCallAnatomy() {
  const [key, setKey] = useState('dates')
  const [badArgs, setBadArgs] = useState(false)
  const sc = SCENARIOS.find((x) => x.key === key)!
  const msgs = build(sc, badArgs)
  const player = useStepper({ steps: msgs.length, interval: 1600 })
  const step = Math.min(player.step, msgs.length - 1)
  const cur = msgs[step]

  const choose = (k: string) => {
    setKey(k)
    const n = build(SCENARIOS.find((x) => x.key === k)!, badArgs).length
    player.pause()
    player.setStep(n - 1)
  }
  const toggleBad = (v: boolean) => {
    setBadArgs(v)
    player.pause()
    player.setStep(build(sc, v).length - 1)
  }

  return (
    <Figure
      wide
      title="Function calling: the model asks, your code acts"
      caption={
        <>
          In the actor row, blue marks the sender and orange the receiver. The LLM only ever <i>writes</i>; your app is the one that runs the function. Bad arguments show
          why tools come with a schema, and the haiku needs no tool at all.
        </>
      }
    >
      <div className={s.stack}>
        <p className={s.tryLine}>
          <b>Try:</b> pick a request, press <b>Restart</b>, then <b>Next</b> to follow each message. Then switch on <b>bad arguments</b>.
        </p>
        <div className={s.chips} role="radiogroup" aria-label="Request">
          {SCENARIOS.map((x) => (
            <button key={x.key} type="button" role="radio" aria-checked={key === x.key} className={`${s.chip} ${key === x.key ? s.chipOn : ''}`} onClick={() => choose(x.key)}>
              {x.question}
            </button>
          ))}
        </div>
        <Controls>
          {sc.tool ? (
            <Toggle label="the model writes bad arguments first" checked={badArgs} onChange={toggleBad} />
          ) : (
            <span className={s.note}>No tool call for a haiku, so there are no arguments to get wrong.</span>
          )}
        </Controls>
        <div className={s.actors} aria-label="Who is talking">
          {(['user', 'app', 'model', 'tool'] as Actor[]).map((a) => (
            <div key={a} className={`${s.actor} ${cur.from === a ? s.actorFrom : ''} ${cur.to === a ? s.actorTo : ''}`}>
              <span>{NAMES[a]}</span>
              <span style={{ fontWeight: 500, fontSize: '0.74rem' }}>{ROLES[a]}</span>
            </div>
          ))}
        </div>
        <PlayerControls player={{ ...player, step }} label={(i) => `Message ${i + 1} of ${msgs.length}`} />
        <div className={s.explain} aria-live="polite">
          {cur.note}
        </div>
        <div className={s.log} aria-label="Messages so far">
          {msgs.slice(0, step + 1).map((m, i) => (
            <div key={`${key}-${badArgs}-${i}`} className={`${s.msg} ${KIND_CLASS[m.kind]} ${i === step ? s.msgNow : ''}`}>
              <div className={s.msgHead}>
                <span>
                  {NAMES[m.from]} → {m.via ? `${NAMES[m.via]} → ` : ''}
                  {NAMES[m.to]}
                </span>
                <span>{KIND_LABEL[m.kind]}</span>
              </div>
              <div className={s.msgBody}>{m.mono ? <pre className={s.mono}>{m.body}</pre> : <span style={{ whiteSpace: 'pre-line' }}>{m.body}</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </Figure>
  )
}
