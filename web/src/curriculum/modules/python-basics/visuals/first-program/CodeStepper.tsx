import { useState } from 'react'
import { Figure, Button, useNarrow } from '../../../../../kit'
import { highlightPy } from './pyCode'
import s from './code.module.css'

/*
  A five-line program you can run one line at a time (like Python Tutor), reorder with ↑,
  and switch lines off with #. The console tags every printed line with the code line
  that produced it, so "order of lines = order of output" is visible at a glance.
*/

interface Line {
  id: string
  /** the code without any leading '# ' that the learner adds */
  text: string
  /** what print shows; null for a pure comment line */
  out: string | null
  /** what Python did, in words */
  note: string
}

const LINES: Record<string, Line> = {
  title: { id: 'title', text: '# My trip to school', out: null, note: '' },
  tapin: { id: 'tapin', text: 'print("Tap in")', out: 'Tap in', note: 'print shows the text inside the quotes (but not the quotes themselves).' },
  stops: {
    id: 'stops',
    text: 'print("Stops:", 2 + 3)',
    out: 'Stops: 5',
    note: 'Python works out 2 + 3 = 5 first, then prints both items with a space between them.',
  },
  nap: { id: 'nap', text: 'print("Take a nap")', out: 'Take a nap', note: 'print shows the text inside the quotes.' },
  tapout: { id: 'tapout', text: 'print("Tap out")', out: 'Tap out', note: 'print shows the text inside the quotes.' },
}
const START_ORDER = ['title', 'tapin', 'stops', 'nap', 'tapout']
const START_OFF = ['nap']
const N = START_ORDER.length

export default function CodeStepper() {
  const [order, setOrder] = useState<string[]>(START_ORDER)
  const [off, setOff] = useState<string[]>(START_OFF)
  const [step, setStep] = useState(N)
  const [edited, setEdited] = useState(false)
  const [justEdited, setJustEdited] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>()

  const isComment = (id: string) => LINES[id].out === null || off.includes(id)
  const shown = (id: string) => (LINES[id].out === null ? LINES[id].text : off.includes(id) ? '# ' + LINES[id].text : LINES[id].text)

  const ran = order.slice(0, step)
  const outputs = ran.map((id, i) => ({ id, lineNo: i + 1 })).filter((r) => !isComment(r.id))
  const lastId = step > 0 ? order[step - 1] : null
  const lastPrinted = lastId !== null && !isComment(lastId)

  const changed = (o: string[], f: string[]) => {
    setOrder(o)
    setOff(f)
    setStep(N)
    setEdited(true)
    setJustEdited(true)
  }
  const moveUp = (i: number) => {
    const o = order.slice()
    ;[o[i - 1], o[i]] = [o[i], o[i - 1]]
    changed(o, off)
  }
  const toggle = (id: string) => changed(order, off.includes(id) ? off.filter((x) => x !== id) : [...off, id])
  const go = (k: number) => {
    setStep(Math.max(0, Math.min(N, k)))
    setJustEdited(false)
  }
  const undo = () => {
    setOrder(START_ORDER)
    setOff(START_OFF)
    setStep(N)
    setEdited(false)
    setJustEdited(false)
  }

  let status
  if (justEdited) status = <>You changed the program, so it ran again from the top. Compare the new output with the code order, then press <strong>Restart</strong> to step through it.</>
  else if (step === 0) status = <>Nothing has run yet. The arrow ▶ marks the <strong>next</strong> line Python will run. Press <strong>Next line</strong>.</>
  else if (lastId && isComment(lastId))
    status = (
      <>
        <strong>Line {step}</strong> is a comment (it starts with #), so Python skips it. Nothing is printed.
        {step === N && ' That was the last line, so the program ends.'}
      </>
    )
  else if (lastId)
    status = (
      <>
        <strong>Ran line {step}:</strong> {LINES[lastId].note}
        {step === N && ' That was the last line, so the program ends.'}
      </>
    )

  return (
    <Figure
      title="Run a program one line at a time"
      caption={
        <>
          Press <strong>Restart</strong>, then <strong>Next line</strong> to run the program step by step and watch the output fill up. Then edit the
          program: <strong>↑</strong> swaps a line with the one above it, and <strong>#</strong> turns a line into a comment (or back). The output
          always comes out in the same order as the lines that ran.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <div className={narrow ? s.stack : s.cols}>
          <div className={s.pane}>
            <div className={s.bar}>
              <span>trip.py</span>
              <span>{edited ? 'edited' : ''}</span>
            </div>
            <ol className={s.lines} aria-label="Program code">
              {order.map((id, i) => {
                const next = i === step
                const done = i < step
                const pure = LINES[id].out === null
                return (
                  <li key={id} className={`${s.line} ${next ? s.isNext : ''}`} aria-current={next ? 'step' : undefined}>
                    <span className={s.gutter}>
                      <span className={`${s.marker} ${next ? s.markerNext : done ? s.markerDone : ''}`} aria-hidden="true">
                        {next ? '▶' : done ? '✓' : ''}
                      </span>
                      <span>{i + 1}</span>
                    </span>
                    <span className={s.code}>{highlightPy(shown(id))}</span>
                    <button
                      type="button"
                      className={`${s.iconBtn} ${!pure && off.includes(id) ? s.iconOn : ''}`}
                      disabled={pure}
                      onClick={() => toggle(id)}
                      aria-label={pure ? `Line ${i + 1} is always a comment` : off.includes(id) ? `Uncomment line ${i + 1}` : `Comment out line ${i + 1}`}
                      title={pure ? 'This line is a note, so it stays a comment' : off.includes(id) ? 'Uncomment this line' : 'Comment out this line'}
                    >
                      #
                    </button>
                    <button type="button" className={s.iconBtn} disabled={i === 0} onClick={() => moveUp(i)} aria-label={`Move line ${i + 1} up`} title="Swap with the line above">
                      ↑
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
          <div className={s.pane}>
            <div className={s.bar}>
              <span>Output</span>
              <span>{outputs.length} printed</span>
            </div>
            <div className={s.console} aria-live="polite">
              {outputs.length === 0 ? (
                <span className={s.empty}>{step === 0 ? 'Nothing printed yet.' : 'Nothing printed yet: comments print nothing.'}</span>
              ) : (
                outputs.map((r, k) => (
                  <div key={r.id} className={`${s.outRow} ${lastPrinted && k === outputs.length - 1 ? s.outNew : ''}`}>
                    <span className={s.outText}>{LINES[r.id].out}</span>
                    <span className={s.outTag}>from line {r.lineNo}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className={s.status} aria-live="polite">
          {status}
        </div>
        <div className={s.btnRow}>
          <Button onClick={() => go(0)}>Restart</Button>
          <Button onClick={() => go(step - 1)} disabled={step === 0}>
            Back
          </Button>
          <Button primary onClick={() => go(step + 1)} disabled={step === N}>
            Next line
          </Button>
          <Button onClick={() => go(N)} disabled={step === N}>
            Run all
          </Button>
          <span className={s.spacer} />
          {edited && <Button onClick={undo}>Undo my edits</Button>}
        </div>
      </div>
    </Figure>
  )
}
