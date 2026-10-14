import { useState } from 'react'
import { Figure, Readout, Button } from '../../../../../kit'
import { CodePanel } from './CodePanel'
import s from './it.module.css'

/*
  A generator function pauses at yield. Each next() resumes it from where it stopped, runs to the
  next yield and hands back one value. The print inside shows that no work happens until a value
  is asked for. When the loop inside ends, next() raises StopIteration; a for loop catches that
  for you and simply stops.
*/

const N = 3
const CODE = ['def squares(n):', '    for x in range(n):', "        print('computing', x)", '        yield x * x', '', `gen = squares(${N})`]

type Out = { text: string; kind: 'out' | 'err' | 'side' }
interface Entry {
  cmd: string
  outs: Out[]
}

/** Lines printed by resuming the generator once, after it has already handed out `k` values. */
function resume(k: number): { outs: Out[]; value: number | null } {
  if (k >= N) return { outs: [{ text: 'StopIteration', kind: 'err' }], value: null }
  return { outs: [{ text: `computing ${k}`, kind: 'side' }, { text: String(k * k), kind: 'out' }], value: k * k }
}

export default function YieldStepper() {
  const [pulls, setPulls] = useState(1) // number of next() calls so far
  const [log, setLog] = useState<Entry[]>([
    { cmd: `gen = squares(${N})`, outs: [] },
    { cmd: 'next(gen)', outs: resume(0).outs },
  ])
  const handed = Math.min(pulls, N)
  const finished = pulls > N

  const push = (e: Entry) => setLog((old) => [...old, e].slice(-6))
  const next = () => {
    push({ cmd: 'next(gen)', outs: resume(pulls).outs })
    setPulls(pulls + 1)
  }
  const forLoop = () => {
    const outs: Out[] = []
    for (let k = handed; k < N; k++) outs.push({ text: `computing ${k}`, kind: 'side' }, { text: `got ${k * k}`, kind: 'out' })
    if (!outs.length) outs.push({ text: '(nothing: the generator is already used up)', kind: 'side' })
    push({ cmd: "for v in gen: print('got', v)", outs })
    setPulls(N + 1)
  }
  const fresh = () => {
    push({ cmd: `gen = squares(${N})`, outs: [] })
    setPulls(0)
  }

  const active = pulls === 0 ? 6 : finished ? undefined : 4
  const state = pulls === 0 ? 'created, but no code has run yet' : finished ? 'finished: the for loop inside has ended' : `paused at yield (line 4), with x = ${pulls - 1}`

  return (
    <Figure
      title="yield: a function that pauses"
      caption={
        <>
          Press <span className={s.mono}>next(gen)</span> repeatedly. Notice that <span className={s.mono}>computing …</span> is printed only when you ask for a value, and that the
          function picks up exactly where it paused. After the third value, the next <span className={s.mono}>next()</span> raises StopIteration. Then make a fresh
          generator and use a for loop instead: it calls next() for you and stops quietly.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.split}>
          <CodePanel lines={CODE} active={active} label="A generator function" />
          <div style={{ display: 'grid', gap: '0.6rem', alignContent: 'start' }}>
            <div className={s.status} style={{ minHeight: 0 }}>
              <b>gen is {state}.</b>
            </div>
            <Readout
              items={[
                ['n', String(N)],
                ['x', pulls === 0 ? '–' : finished ? '–' : String(pulls - 1)],
                ['values handed out', handed ? Array.from({ length: handed }, (_, k) => k * k).join(', ') : 'none'],
              ]}
            />
            <div className={s.status} style={{ minHeight: 0 }}>
              The generator stores only <span className={s.mono}>n</span>, <span className={s.mono}>x</span> and the line where it paused, never a list of all the values.
            </div>
          </div>
        </div>
        <pre className={s.console} aria-live="polite">
          <span className={s.consoleLabel}>Python console</span>
          {log.map((e, i) => (
            <span key={i}>
              <span className={s.muted}>{'>>> '}</span>
              {e.cmd}
              {'\n'}
              {e.outs.map((o, j) => (
                <span key={j}>
                  <span className={o.kind === 'err' ? s.err : o.kind === 'out' ? s.out : s.muted}>{o.text}</span>
                  {'\n'}
                </span>
              ))}
            </span>
          ))}
        </pre>
        <div className={s.row}>
          <Button primary onClick={next}>
            <span className={s.mono}>next(gen)</span>
          </Button>
          <Button onClick={forLoop}>
            <span className={s.mono}>for v in gen: …</span>
          </Button>
          <Button onClick={fresh}>
            <span className={s.mono}>gen = squares({N})</span>
          </Button>
        </div>
      </div>
    </Figure>
  )
}
