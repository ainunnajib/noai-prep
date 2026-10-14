import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Figure, Segmented, Toggle, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { highlightPy, Py } from '../decisions/pyCode'
import s from '../decisions/ui.module.css'

/*
  Python-Tutor-style stepper for two small loops, with a trace table that gains one row per
  pass. The while version can be "broken" by deleting the line that changes balance: the rows
  keep coming, balance never moves, and an infinite-loop warning appears.
*/

interface Ev {
  line: number
  note: ReactNode
  /** trace-table row this event writes to (0 = start row) */
  row: number
  /** column it writes, and the text written */
  col?: string
  val?: string
  out?: string
}
interface Program {
  file: string
  lines: string[]
  cols: string[]
  events: Ev[]
  rowLabels: string[]
  infinite?: boolean
}

function forProgram(): Program {
  const lines = ['total = 0', 'for i in range(1, 5):', '    total = total + i', 'print(total)']
  const ev: Ev[] = [{ line: 0, note: <>Set <Py>total</Py> to 0 before the loop starts.</>, row: 0, col: 'total', val: '0' }]
  const rowLabels = ['start']
  let total = 0
  for (let i = 1; i < 5; i++) {
    rowLabels.push(`pass ${i}`)
    ev.push({ line: 1, note: <><Py>range(1, 5)</Py> hands over its next value, so <Py>{`i = ${i}`}</Py>.</>, row: i, col: 'i', val: String(i) })
    const before = total
    total += i
    ev.push({ line: 2, note: <>Work out the right side first: <Py>{`${before} + ${i}`}</Py> is {total}, so <Py>total</Py> becomes {total}.</>, row: i, col: 'total', val: String(total) })
  }
  ev.push({ line: 1, note: <><Py>range(1, 5)</Py> has no values left (it stops before 5), so the loop ends.</>, row: -1 })
  ev.push({ line: 3, note: <>The loop is over, so this unindented line runs once and prints {total}.</>, row: -1, out: String(total) })
  return { file: 'add_up.py', lines, cols: ['i', 'total'], events: ev, rowLabels }
}

function whileProgram(broken: boolean): Program {
  const lines = [
    'balance = 3',
    'top_ups = 0',
    'while balance < 20:',
    broken ? '    # balance = balance + 5' : '    balance = balance + 5',
    '    top_ups = top_ups + 1',
    'print(balance, top_ups)',
  ]
  const C = 'balance < 20'
  const ev: Ev[] = [
    { line: 0, note: <>Your EZ-Link card starts with $3.</>, row: 0, col: 'balance', val: '3' },
    { line: 1, note: <>No top-ups yet.</>, row: 0, col: 'top_ups', val: '0' },
  ]
  const rowLabels = ['start']
  let balance = 3
  let tops = 0
  const cap = broken ? 8 : 50
  let pass = 0
  while (balance < 20 && pass < cap) {
    pass++
    rowLabels.push(`pass ${pass}`)
    ev.push({ line: 2, note: <>Check the condition: <Py>{`${balance} < 20`}</Py> is True, so run the body.</>, row: pass, col: C, val: 'True' })
    if (!broken) {
      const b = balance
      balance += 5
      ev.push({ line: 3, note: <>Top up $5: <Py>{`${b} + 5`}</Py> is {balance}.</>, row: pass, col: 'balance', val: String(balance) })
    }
    tops++
    ev.push({
      line: 4,
      note: broken ? (
        <>
          Count the top-up. But nothing changed <Py>balance</Py>: it is still {balance}
          {pass >= 2 ? ', so the condition will be True again' : ''}.
        </>
      ) : (
        <>Count the top-up: <Py>top_ups</Py> is now {tops}. Then jump back up to the <Py>while</Py> line.</>
      ),
      row: pass,
      col: 'top_ups',
      val: String(tops),
    })
  }
  if (!broken) {
    rowLabels.push('end')
    ev.push({ line: 2, note: <>Check again: <Py>{`${balance} < 20`}</Py> is False, so the loop ends. Python jumps past the indented block.</>, row: pass + 1, col: C, val: 'False' })
    ev.push({ line: 5, note: <>Print the final values: balance {balance}, after {tops} top-ups.</>, row: -1, out: `${balance} ${tops}` })
  }
  return { file: 'ez_link.py', lines, cols: [C, 'balance', 'top_ups'], events: ev, rowLabels, infinite: broken }
}

export default function LoopTracer() {
  const [kind, setKind] = useState<'for' | 'while'>('while')
  const [broken, setBroken] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)
  const prog = useMemo(() => (kind === 'for' ? forProgram() : whileProgram(broken)), [kind, broken])
  const n = prog.events.length
  const player = usePlayer({ steps: n + 1, interval: 650 })
  const { setStep } = player
  // show the finished trace whenever the program changes (complete at rest)
  useEffect(() => {
    setStep(n)
  }, [prog, n, setStep])
  const step = Math.min(player.step, n)
  const done = prog.events.slice(0, step)
  const cur = step > 0 ? prog.events[step - 1] : null
  const nextLine = step < n ? prog.events[step].line : -1

  // build the trace table from the events run so far
  const table: Record<string, string>[] = prog.rowLabels.map(() => ({}))
  done.forEach((e) => {
    if (e.row >= 0 && e.col) table[e.row][e.col] = e.val ?? ''
  })
  const visibleRows = prog.rowLabels.map((_, r) => r).filter((r) => r === 0 || Object.keys(table[r]).length > 0)
  const outputs = done.filter((e) => e.out !== undefined).map((e) => e.out as string)
  const passesShown = visibleRows.length - 1
  const showInfinite = prog.infinite && passesShown >= 3

  let status: ReactNode
  if (!cur) status = <>Nothing has run yet. The arrow ▶ marks the next line. Press <strong>Next</strong> or <strong>Play</strong>.</>
  else status = (
    <>
      <strong>Line {cur.line + 1}:</strong> {cur.note}
      {prog.infinite && step === n && <> …and so on, forever. Python never reaches the last line.</>}
    </>
  )

  return (
    <Figure
      wide
      title="Trace a loop, one line at a time"
      caption={
        <>
          Press <strong>Restart</strong>, then <strong>Next</strong> (or <strong>Play</strong>) and watch the highlighted line jump back to the top
          of the loop after each pass while the trace table gains a row. Then switch on <strong>Delete line 4</strong>: nothing changes{' '}
          <code>balance</code> any more, so <code>balance &lt; 20</code> stays True forever. A trace table makes that kind of bug obvious.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <div className={s.row} style={{ justifyContent: 'space-between', gap: '0.6rem 1rem' }}>
          <Segmented
            label="Loop"
            options={[
              { value: 'while', label: 'while loop' },
              { value: 'for', label: 'for loop' },
            ]}
            value={kind}
            onChange={(v) => setKind(v)}
          />
          {kind === 'while' && <Toggle label="Delete line 4 (the top-up)" checked={broken} onChange={setBroken} />}
        </div>
        <div className={narrow ? s.stack : s.cols}>
          <div className={s.pane}>
            <div className={s.bar}>
              <span>{prog.file}</span>
              <span>{broken && kind === 'while' ? 'line 4 deleted' : ''}</span>
            </div>
            <ol className={s.lines} aria-label="Program code">
              {prog.lines.map((l, k) => {
                const isCur = cur?.line === k
                const isNext = !isCur && nextLine === k && step < n
                const isOff = l.trim().startsWith('#')
                return (
                  <li key={k} className={`${s.line} ${isCur ? s.lineNow : ''} ${isOff ? s.lineSkip : ''}`} aria-current={isCur ? 'step' : undefined}>
                    <span className={s.gutter}>
                      <span className={`${s.mark} ${isCur ? s.markNow : ''}`} aria-hidden="true">
                        {isCur ? '▶' : isNext ? '›' : ''}
                      </span>
                      <span>{k + 1}</span>
                    </span>
                    <span className={s.code}>{highlightPy(l)}</span>
                  </li>
                )
              })}
            </ol>
            <div className={s.bar} style={{ borderTop: '1px solid var(--rule)', borderBottom: 0 }}>
              <span>Output</span>
            </div>
            <div className={s.console}>{outputs.length ? outputs.join('\n') : <span className={s.muted}>{prog.infinite ? 'nothing yet, and nothing ever' : 'nothing printed yet'}</span>}</div>
          </div>
          <div className={s.stack}>
            <div className={s.tableWrap}>
              <table className={s.table} aria-label="Trace table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>row</th>
                    {prog.cols.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((r, ri) => (
                    <tr key={r} className={cur && cur.row === r ? s.rowNow : ''} style={{ cursor: 'default' }}>
                      <td style={{ textAlign: 'left', fontFamily: 'var(--font-body)', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{prog.rowLabels[r]}</td>
                      {prog.cols.map((c) => {
                        const v = table[r][c]
                        const fresh = cur && cur.row === r && cur.col === c
                        if (v === undefined) {
                          // unchanged on this row: show the value carried down from the row above, faded
                          let carried: string | undefined
                          for (let q = ri - 1; q >= 0 && carried === undefined; q--) carried = table[visibleRows[q]][c]
                          const isCheck = c === prog.cols[0] && prog.cols[0].includes('<')
                          const stuck = prog.infinite && c === 'balance'
                          return (
                            <td key={c} style={{ color: stuck ? 'var(--bad)' : 'var(--ink-3)', fontWeight: stuck ? 700 : 400 }} title="unchanged">
                              {isCheck || carried === undefined ? '' : carried}
                            </td>
                          )
                        }
                        const cls = v === 'True' ? s.cellT : v === 'False' ? s.markFalse : ''
                        return (
                          <td key={c} className={cls} style={fresh ? { fontWeight: 800, outline: '2px solid var(--highlight)', outlineOffset: -2 } : undefined}>
                            {v}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  {prog.infinite && step === n && (
                    <tr style={{ cursor: 'default' }}>
                      <td colSpan={prog.cols.length + 1} style={{ color: 'var(--ink-3)' }}>
                        … forever
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className={s.legend}>Faded values have not changed since the row above.</div>
            {showInfinite && (
              <div className={`${s.status} ${s.statusBad}`} role="alert">
                <strong>Infinite loop!</strong> <Py>balance</Py> has been 3 for {passesShown} passes. Nothing inside the loop changes it, so{' '}
                <Py>{'balance < 20'}</Py> can never become False. In Jupyter you would have to press the stop button (interrupt the kernel).
              </div>
            )}
          </div>
        </div>
        <div className={s.status} aria-live="polite">
          {status}
        </div>
        <PlayerControls player={player} label={(k) => `Step ${Math.min(k, n)} of ${n}`} />
      </div>
    </Figure>
  )
}
