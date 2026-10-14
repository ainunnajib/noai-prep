import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Figure, Segmented, useContainerWidth, usePlayer, PlayerControls } from '../../../../../kit'
import { CodeView, Console, MONO, type ConsoleLine } from '../references-mutability/pyviz'

/*
  Which blocks of a try / except / else / finally statement run? Choose the input,
  then step through: the code highlights the running line, and the block diagram lights
  the path in order (numbered dots), dims what is skipped, and shows where the program ends up.
*/

type Input = 'four' | 'zero' | 'abc' | 'none'
type Block = 'start' | 'try' | 'exZero' | 'exValue' | 'else' | 'finally' | 'after' | 'crash'

const INPUTS: Record<Input, { label: string; literal: string }> = {
  four: { label: '"4"', literal: '"4"' },
  zero: { label: '"0"', literal: '"0"' },
  abc: { label: '"abc"', literal: '"abc"' },
  none: { label: 'None', literal: 'None' },
}

const code = (lit: string) => `text = ${lit}
try:
    n = int(text)
    print(12 / n)
except ZeroDivisionError:
    print("can't divide by 0")
except ValueError:
    print("not a number")
else:
    print("no errors")
finally:
    print("done")
print("after")`

interface Step {
  line: number[]
  block: Block
  /** 'run' = block body runs; 'raise' = error raised here; 'check' = except clause checked, no match */
  kind: 'run' | 'raise' | 'check'
  out: ConsoleLine[]
  note: ReactNode
}

const o = (...t: string[]): ConsoleLine[] => t.map((text) => ({ text }))
const TB: ConsoleLine[] = [
  { text: 'Traceback (most recent call last):', tone: 'err' },
  { text: '  File "main.py", line 3, in <module>', tone: 'err' },
  { text: '    n = int(text)', tone: 'err' },
  { text: "TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'", tone: 'err' },
]

function steps(inp: Input): Step[] {
  const first: Step = { line: [1], block: 'start', kind: 'run', out: [], note: <>The input is {inp === 'none' ? <code>None</code> : <>the string <code>{INPUTS[inp].literal}</code></>}.</> }
  if (inp === 'four')
    return [
      first,
      { line: [2, 3], block: 'try', kind: 'run', out: [], note: <>Enter the try block. <code>int("4")</code> gives 4: no error.</> },
      { line: [4], block: 'try', kind: 'run', out: o('3.0'), note: <>12 / 4 = 3.0 is printed. The whole try block finished without an error.</> },
      { line: [9, 10], block: 'else', kind: 'run', out: o('3.0', 'no errors'), note: <>No exception, so both except clauses are skipped and <b>else</b> runs.</> },
      { line: [11, 12], block: 'finally', kind: 'run', out: o('3.0', 'no errors', 'done'), note: <><b>finally</b> always runs.</> },
      { line: [13], block: 'after', kind: 'run', out: o('3.0', 'no errors', 'done', 'after'), note: <>The program carries on normally.</> },
    ]
  if (inp === 'zero')
    return [
      first,
      { line: [2, 3], block: 'try', kind: 'run', out: [], note: <>Enter the try block. <code>int("0")</code> gives 0: no error yet.</> },
      { line: [4], block: 'try', kind: 'raise', out: [], note: <>12 / 0 raises <b>ZeroDivisionError</b>. The rest of the try block is abandoned and Python looks for a matching except, top to bottom.</> },
      { line: [5, 6], block: 'exZero', kind: 'run', out: o("can't divide by 0"), note: <>The first except clause matches, so its block runs. At most one except block ever runs.</> },
      { line: [11, 12], block: 'finally', kind: 'run', out: o("can't divide by 0", 'done'), note: <><b>else</b> is skipped because there was an error. <b>finally</b> runs anyway.</> },
      { line: [13], block: 'after', kind: 'run', out: o("can't divide by 0", 'done', 'after'), note: <>The error was handled, so the program carries on.</> },
    ]
  if (inp === 'abc')
    return [
      first,
      { line: [2, 3], block: 'try', kind: 'raise', out: [], note: <><code>int("abc")</code> raises <b>ValueError</b> on line 3, so line 4 never runs.</> },
      { line: [5], block: 'exZero', kind: 'check', out: [], note: <>Is it a ZeroDivisionError? No, so this block is skipped.</> },
      { line: [7, 8], block: 'exValue', kind: 'run', out: o('not a number'), note: <>Is it a ValueError? Yes: this block runs.</> },
      { line: [11, 12], block: 'finally', kind: 'run', out: o('not a number', 'done'), note: <><b>finally</b> runs. (<b>else</b> was skipped: there was an error.)</> },
      { line: [13], block: 'after', kind: 'run', out: o('not a number', 'done', 'after'), note: <>Handled, so the program carries on.</> },
    ]
  return [
    first,
    { line: [2, 3], block: 'try', kind: 'raise', out: [], note: <><code>int(None)</code> raises <b>TypeError</b>: None is not a string or a number.</> },
    { line: [5], block: 'exZero', kind: 'check', out: [], note: <>Is it a ZeroDivisionError? No.</> },
    { line: [7], block: 'exValue', kind: 'check', out: [], note: <>Is it a ValueError? No. No except clause matches a TypeError.</> },
    { line: [11, 12], block: 'finally', kind: 'run', out: o('done'), note: <><b>finally</b> still runs, even though the error was not handled.</> },
    { line: [3], block: 'crash', kind: 'raise', out: [...o('done'), ...TB], note: <>The unhandled TypeError travels on and stops the program with a traceback. Line 13 never runs.</> },
  ]
}

const ROWS: { id: Block; head: string; sub: string }[] = [
  { id: 'try', head: 'try:', sub: 'n = int(text); print(12 / n)' },
  { id: 'exZero', head: 'except ZeroDivisionError:', sub: 'only if try raised ZeroDivisionError' },
  { id: 'exValue', head: 'except ValueError:', sub: 'only if try raised ValueError' },
  { id: 'else', head: 'else:', sub: 'only if try raised nothing' },
  { id: 'finally', head: 'finally:', sub: 'always' },
]

function FlowDiagram({ seq, done, current }: { seq: Step[]; done: boolean; current: Step }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(340)
  const W = Math.max(280, Math.min(520, measured))
  const RH = 46
  const GAP = 8
  const X0 = 34
  const H = ROWS.length * (RH + GAP) + RH + 4
  const order: Block[] = []
  for (const s of seq) if (s.block !== 'start' && !order.includes(s.block)) order.push(s.block)
  const stateOf = (b: Block) => {
    const hits = seq.filter((s) => s.block === b)
    if (!hits.length) return done ? 'skipped' : 'pending'
    const last = hits[hits.length - 1]
    return last.kind
  }
  const colour = (st: string) => (st === 'run' ? 'var(--viz-pos)' : st === 'raise' ? 'var(--viz-neg)' : st === 'check' ? 'var(--viz-muted)' : 'var(--rule)')
  const rowY = (i: number) => 2 + i * (RH + GAP)
  const lastY = rowY(ROWS.length)
  const halfW = (W - X0 - 8) / 2

  const box = (id: Block, x: number, y: number, w: number, head: string, sub: string, key: string) => {
    const st = stateOf(id)
    const isCur = current.block === id
    const n = order.indexOf(id)
    return (
      <g key={key} style={{ opacity: st === 'skipped' ? 0.38 : 1, transition: 'opacity 0.3s' }}>
        <rect
          x={x}
          y={y}
          width={w}
          height={RH}
          rx={8}
          style={{
            fill: isCur ? 'var(--highlight-soft)' : st === 'run' ? 'color-mix(in srgb, var(--viz-pos) 10%, var(--surface))' : st === 'raise' ? 'color-mix(in srgb, var(--viz-neg) 10%, var(--surface))' : 'var(--surface)',
            stroke: isCur ? 'var(--accent)' : colour(st),
            strokeWidth: isCur ? 2.5 : 1.6,
            strokeDasharray: st === 'check' ? '5 4' : undefined,
            transition: 'all 0.3s',
          }}
        />
        <text x={x + 10} y={y + 19} style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, fill: 'var(--ink)' }}>
          {head}
        </text>
        <text x={x + 10} y={y + 36} style={{ fontSize: 11.5, fill: 'var(--ink-3)', fontFamily: 'var(--font-body)' }}>
          {st === 'check' ? '✗ checked: no match, skipped' : st === 'raise' && id === 'try' ? '⚡ error raised here' : sub}
        </text>
        {n >= 0 && id !== 'after' && id !== 'crash' && (
          <g>
            <circle cx={16} cy={y + RH / 2} r={10} style={{ fill: colour(st), transition: 'all 0.3s' }} />
            <text x={16} y={y + RH / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--surface)', fontFamily: 'var(--font-body)' }}>
              {n + 1}
            </text>
          </g>
        )}
      </g>
    )
  }

  return (
    <div ref={ref} style={{ width: '100%', minWidth: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: W, margin: '0 auto' }} role="img" aria-label={`Blocks visited in order: ${order.join(', ') || 'none yet'}`}>
        <line x1={16} x2={16} y1={rowY(0) + RH / 2} y2={lastY + RH / 2} style={{ stroke: 'var(--rule)', strokeWidth: 2 }} />
        {ROWS.map((r, i) => box(r.id, X0, rowY(i), W - X0 - 2, r.head, r.sub, r.id))}
        {box('after', X0, lastY, halfW, 'line 13 runs', 'program carries on', 'after')}
        {box('crash', X0 + halfW + 8, lastY, halfW, 'crash', 'traceback, program stops', 'crash')}
        {(order.includes('after') || order.includes('crash')) && (
          <g>
            <circle cx={16} cy={lastY + RH / 2} r={10} style={{ fill: order.includes('crash') ? 'var(--viz-neg)' : 'var(--viz-pos)' }} />
            <text x={16} y={lastY + RH / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--surface)', fontFamily: 'var(--font-body)' }}>
              {order.length}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

export default function TryExceptFlow() {
  const [inp, setInp] = useState<Input>('abc')
  const all = steps(inp)
  const player = usePlayer({ steps: all.length, interval: 1300 })
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(640)
  const wide = width >= 600

  // At rest, show the finished path for the default input; after a change of input, start from line 1.
  const prevInp = useRef(inp)
  useEffect(() => {
    player.setStep(all.length - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (prevInp.current === inp) return
    prevInp.current = inp
    player.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inp])

  const i = Math.min(player.step, all.length - 1)
  const s = all[i]
  const seq = all.slice(0, i + 1)
  const done = i === all.length - 1

  return (
    <Figure
      title="Which blocks run? Follow the path through try / except / else / finally"
      caption={
        <>
          Choose what <code>text</code> holds, then press <b>Play</b> or <b>Next</b>. The numbered dots show the order the blocks run in; dimmed blocks were skipped. Compare
          the four inputs: exactly one of <code>except</code> / <code>else</code> runs (or neither, if nothing matches), and <code>finally</code> runs every time.
        </>
      }
    >
      <Segmented
        label="text ="
        value={inp}
        onChange={setInp}
        options={(Object.keys(INPUTS) as Input[]).map((k) => ({ value: k, label: <span style={{ fontFamily: MONO }}>{INPUTS[k].label}</span> }))}
      />
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: wide ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: 12, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
          <CodeView code={code(INPUTS[inp].literal)} active={s.line} activeTone={s.kind === 'raise' ? 'bad' : 'highlight'} marks={Object.fromEntries(s.line.map((l) => [l, '▶']))} />
          <Console lines={s.out} minLines={4} />
        </div>
        <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <FlowDiagram seq={seq} done={done} current={s} />
          <div style={{ fontSize: 14.5, lineHeight: 1.5, background: 'var(--surface-2)', borderRadius: 8, padding: '0.5rem 0.7rem', minHeight: '3.2em' }}>{s.note}</div>
        </div>
      </div>
      <PlayerControls player={player} />
    </Figure>
  )
}
