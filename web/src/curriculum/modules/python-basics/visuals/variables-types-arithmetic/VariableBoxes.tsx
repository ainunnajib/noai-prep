import { useId, useState, type ReactNode } from 'react'
import { Figure, Button, useNarrow } from '../../../../../kit'
import { highlightPy } from './pyCode'
import s from './viz.module.css'

/*
  Names are tags, values are boxes. Step through a short program and watch which tag moves.
  The diagram is Python's real model: `y = x` ties a second tag to the SAME value, and
  `x = x + 1` makes a NEW value and moves only x's tag.
*/

interface Program {
  label: string
  lines: string[]
  ask: { name: string; options: string[] }
  why: ReactNode
}

const PROGRAMS: Record<string, Program> = {
  copy: {
    label: 'Copy, then change',
    lines: ['x = 5', 'y = x', 'x = x + 1'],
    ask: { name: 'y', options: ['5', '6'] },
    why: (
      <>
        <code>y = x</code> tied y to the <em>same</em> 5 that x points at. Then <code>x = x + 1</code> worked out 5 + 1 = 6 as a brand-new value and
        moved <em>only</em> x's tag. Nothing told y to move, so y is still 5.
      </>
    ),
  },
  total: {
    label: 'Running total',
    lines: ['score = 0', 'score = score + 10', 'score = score + 5'],
    ask: { name: 'score', options: ['5', '15', '25'] },
    why: (
      <>
        Each line works out the right-hand side first, using the <em>current</em> value of score (0 + 10 = 10, then 10 + 5 = 15), and only then moves
        the tag. The old values 0 and 10 have no name left, so Python throws them away.
      </>
    ),
  },
  swap: {
    label: 'Swap gone wrong',
    lines: ['a = 1', 'b = 2', 'a = b', 'b = a'],
    ask: { name: 'b', options: ['1', '2'] },
    why: (
      <>
        After <code>a = b</code>, both tags point at 2 and the 1 has no name left. So <code>b = a</code> just ties b to 2 again: both are 2. To swap
        two variables, Python lets you write <code>a, b = b, a</code>.
      </>
    ),
  },
}

interface Obj {
  value: number
}
interface State {
  objs: Obj[]
  names: Record<string, number>
  order: string[]
  changed: string | null
  note: ReactNode
}

const OPS: Record<string, (a: number, b: number) => number> = { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b }

function simulate(lines: string[], upto: number): State {
  const objs: Obj[] = []
  const names: Record<string, number> = {}
  const order: string[] = []
  let changed: string | null = null
  let note: ReactNode = null
  for (let i = 0; i < upto; i++) {
    const [, target, rhs] = /^(\w+) = (.+)$/.exec(lines[i])!
    let id: number
    const arith = /^(\w+) ([+\-*]) (\w+)$/.exec(rhs)
    if (/^-?\d+$/.test(rhs)) {
      objs.push({ value: Number(rhs) })
      id = objs.length - 1
      note = (
        <>
          Python creates the value <strong>{rhs}</strong> and ties the name <strong>{target}</strong> to it.
        </>
      )
    } else if (arith) {
      const val = (t: string) => (/^\d+$/.test(t) ? Number(t) : objs[names[t]].value)
      const a = val(arith[1])
      const b = val(arith[3])
      const v = OPS[arith[2]](a, b)
      objs.push({ value: v })
      id = objs.length - 1
      note = (
        <>
          Right side first: {rhs} = {a} {arith[2]} {b} = <strong>{v}</strong>, a new value. Then the tag <strong>{target}</strong> moves to it.
        </>
      )
    } else {
      id = names[rhs]
      note = (
        <>
          No new value is made: <strong>{target}</strong> is tied to the same value that {rhs} points at ({objs[id].value}).
        </>
      )
    }
    if (!(target in names)) order.push(target)
    names[target] = id
    changed = target
  }
  return { objs, names, order, changed, note }
}

const NAME_COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-5)']
const W = 330
const ROW = 50
const TOP = 34

function Diagram({ st }: { st: State }) {
  const uid = useId().replace(/:/g, '')
  const used = new Set(Object.values(st.names))
  const rows = Math.max(st.order.length, st.objs.length, 1)
  const H = TOP + rows * ROW + 4
  const nameY = (i: number) => TOP + i * ROW + 20
  const objY = (j: number) => TOP + j * ROW + 20
  return (
    <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Memory: ${st.order.map((n) => `${n} points to ${st.objs[st.names[n]].value}`).join(', ') || 'empty'}`}>
      <defs>
        {NAME_COLOURS.map((c, i) => (
          <marker key={i} id={`${uid}-h${i}`} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" style={{ fill: c }} />
          </marker>
        ))}
      </defs>
      <text x={12} y={16} style={{ fill: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }}>
        NAMES
      </text>
      <text x={196} y={16} style={{ fill: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }}>
        VALUES
      </text>
      {st.order.length === 0 && (
        <text x={W / 2} y={TOP + 24} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 13, fontStyle: 'italic' }}>
          Nothing stored yet
        </text>
      )}
      {st.order.map((n, i) => {
        const j = st.names[n]
        const y1 = nameY(i)
        const y2 = objY(j)
        const c = NAME_COLOURS[i % NAME_COLOURS.length]
        const hot = st.changed === n
        return (
          <path
            key={`a-${n}`}
            d={`M106,${y1} C150,${y1} 150,${y2} 192,${y2}`}
            markerEnd={`url(#${uid}-h${i % NAME_COLOURS.length})`}
            style={{ fill: 'none', stroke: c, strokeWidth: hot ? 3.2 : 2.2 }}
          />
        )
      })}
      {st.objs.map((o, j) => {
        const y = objY(j)
        const alive = used.has(j)
        return (
          <g key={`o-${j}`}>
            <rect
              x={196}
              y={y - 19}
              width={70}
              height={38}
              rx={8}
              style={{
                fill: alive ? 'var(--surface-2)' : 'var(--surface)',
                stroke: alive ? 'var(--ink-2)' : 'var(--viz-muted)',
                strokeWidth: 1.5,
                strokeDasharray: alive ? undefined : '4 3',
              }}
            />
            <text x={201} y={y - 8} style={{ fill: 'var(--ink-3)', fontSize: 9.5, fontWeight: 700 }}>
              int
            </text>
            <text className={s.svgMono} x={231} y={y + 6} textAnchor="middle" style={{ fill: alive ? 'var(--ink)' : 'var(--viz-muted)', fontSize: 17, fontWeight: 700 }}>
              {o.value}
            </text>
            {!alive && (
              <text x={272} y={y + 4} style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
                no name
              </text>
            )}
          </g>
        )
      })}
      {st.order.map((n, i) => {
        const y = nameY(i)
        const c = NAME_COLOURS[i % NAME_COLOURS.length]
        const hot = st.changed === n
        return (
          <g key={`n-${n}`}>
            <path
              d={`M12,${y - 17} H98 a6,6 0 0 1 6,6 V${y + 11} a6,6 0 0 1 -6,6 H12 Z`}
              style={{ fill: hot ? 'var(--highlight-soft)' : 'var(--surface)', stroke: c, strokeWidth: 2 }}
            />
            <circle cx={22} cy={y} r={3.5} style={{ fill: 'var(--surface)', stroke: c, strokeWidth: 1.5 }} />
            <text className={s.svgMono} x={62} y={y + 5} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 15, fontWeight: 700 }}>
              {n}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function VariableBoxes() {
  const [pid, setPid] = useState('copy')
  const prog = PROGRAMS[pid]
  const n = prog.lines.length
  const [step, setStep] = useState(n - 1)
  const [answer, setAnswer] = useState<string | null>(null)
  const [ref, narrow] = useNarrow<HTMLDivElement>()
  const st = simulate(prog.lines, step)
  const finalState = simulate(prog.lines, n)
  const truth = String(finalState.objs[finalState.names[prog.ask.name]].value)

  const choose = (id: string) => {
    setPid(id)
    setStep(PROGRAMS[id].lines.length - 1)
    setAnswer(null)
  }
  const go = (k: number) => {
    setStep(Math.max(0, Math.min(n, k)))
    if (k < n) setAnswer(null)
  }
  const predict = (opt: string) => {
    setAnswer(opt)
    setStep(n)
  }

  let status: ReactNode
  let tone = ''
  if (step === n && answer !== null) {
    tone = answer === truth ? s.good : s.bad
    status = (
      <>
        <strong>{answer === truth ? `Yes: ${prog.ask.name} is ${truth}.` : `Not quite: ${prog.ask.name} is ${truth}, not ${answer}.`}</strong> {prog.why}
      </>
    )
  } else if (step === n) status = <>{st.note} {prog.why}</>
  else if (step === 0) status = <>Nothing has run yet. Press <strong>Next line</strong>.</>
  else
    status = (
      <>
        <strong>Line {step}</strong> <code>{prog.lines[step - 1]}</code>: {st.note}
      </>
    )

  const memText = st.order.map((nm) => `${nm} → ${st.objs[st.names[nm]].value}`).join('   ')

  return (
    <Figure
      title="Names are tags tied to values"
      caption={
        <>
          Predict the answer, or step through with <strong>Next line</strong>. Watch the tags (names) on the left: <code>=</code> never copies a box, it
          only moves a tag, after working out the right-hand side. Try all three programs.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <div className={s.chips} role="group" aria-label="Choose a program">
          {Object.entries(PROGRAMS).map(([id, p]) => (
            <button key={id} type="button" className={`${s.chip} ${id === pid ? s.chipOn : ''}`} aria-pressed={id === pid} onClick={() => choose(id)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className={narrow ? s.stack : s.cols}>
          <div className={s.pane}>
            <div className={s.bar}>
              <span>program</span>
              <span>
                {step} of {n} lines run
              </span>
            </div>
            <ol className={s.lines} aria-label="Program code">
              {prog.lines.map((code, i) => {
                const next = i === step
                const done = i < step
                return (
                  <li key={i} className={`${s.line} ${next ? s.isNext : done ? s.isDone : ''}`} aria-current={next ? 'step' : undefined}>
                    <span className={s.gutter}>
                      <span className={`${s.marker} ${next ? s.markerNext : s.markerDone}`} aria-hidden="true">
                        {next ? '▶' : done ? '✓' : ''}
                      </span>
                      <span>{i + 1}</span>
                    </span>
                    <span className={s.code}>{highlightPy(code)}</span>
                  </li>
                )
              })}
            </ol>
          </div>
          <div className={s.diagram}>
            <Diagram st={st} />
            <div className={s.memText} aria-hidden="true">
              {memText || ' '}
            </div>
          </div>
        </div>
        {step === n - 1 && answer === null ? (
          <div className={s.predict}>
            <span>
              Predict: after line {n} runs, what is <strong>{prog.ask.name}</strong>?
            </span>
            {prog.ask.options.map((o) => (
              <button key={o} type="button" className={s.answerBtn} onClick={() => predict(o)}>
                {o}
              </button>
            ))}
          </div>
        ) : null}
        <div className={`${s.status} ${tone}`} aria-live="polite">
          {status}
        </div>
        <div className={s.btnRow}>
          <Button onClick={() => go(0)}>Restart</Button>
          <Button onClick={() => go(step - 1)} disabled={step === 0}>
            Back
          </Button>
          <Button primary onClick={() => go(step + 1)} disabled={step === n}>
            Next line
          </Button>
        </div>
      </div>
    </Figure>
  )
}
