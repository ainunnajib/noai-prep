import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure } from '../../../../../kit'
import { highlightPy } from './pyCode'
import s from './code.module.css'

/*
  Break a working program in four classic ways and decode the traceback Python prints.
  Every traceback below is the real output of Python 3.13 for that exact file (only the
  long folder path in the File "…" line has been shortened to the file name).
*/

type PartId = 'header' | 'where' | 'code' | 'type' | 'message'

const PART_META: Record<PartId, { name: string; colour: string }> = {
  header: { name: 'The header', colour: 'var(--viz-5)' },
  where: { name: 'Where: file and line number', colour: 'var(--viz-1)' },
  code: { name: 'The line, with markers', colour: 'var(--viz-2)' },
  type: { name: 'The error type (read this first)', colour: 'var(--viz-4)' },
  message: { name: 'The message', colour: 'var(--viz-3)' },
}

interface Traceback {
  header: boolean
  line: number
  inModule: boolean
  code: string
  pointer: string
  type: string
  message: string
}

interface Scenario {
  id: string
  label: string
  lines: string[]
  bad: number | null
  printed: string[]
  tb: Traceback | null
  explain: Partial<Record<PartId, ReactNode>>
  fix?: ReactNode
  summary: ReactNode
}

const BASE = ['print("Class 3E fundraiser")', 'print("Tickets sold:", 120)', 'print("Per student:", 120 / 40)', 'print("Thank you!")']
const ALL_OUT = ['Class 3E fundraiser', 'Tickets sold: 120', 'Per student: 3.0', 'Thank you!']
const withLine = (i: number, code: string) => BASE.map((l, k) => (k === i - 1 ? code : l))

const HEADER_TEXT = (
  <>
    “Traceback (most recent call last)” announces an error report. Python lists the steps that led to the crash with the <em>most recent</em> step
    last, which is why you read a traceback from the bottom up. In a short program like this one there is only one step.
  </>
)
const where = (n: number) => (
  <>
    Where to look: the file and the <strong>line number (line {n})</strong>. “in &lt;module&gt;” means the main program, not inside a function. In a
    Jupyter notebook this part reads like <code>Cell In[3], line {n}</code> instead, and on your own computer the file name comes with its full folder path.
  </>
)

const SCENARIOS: Scenario[] = [
  {
    id: 'ok',
    label: 'Working',
    lines: BASE,
    bad: null,
    printed: ALL_OUT,
    tb: null,
    explain: {},
    summary: <>No errors: all four lines ran, top to bottom. Now pick one of the ways to break it.</>,
  },
  {
    id: 'quote',
    label: 'Forget a quote',
    lines: withLine(4, 'print("Thank you!)'),
    bad: 4,
    printed: [],
    tb: { header: false, line: 4, inModule: false, code: '    print("Thank you!)', pointer: '          ^', type: 'SyntaxError', message: 'unterminated string literal (detected at line 4)' },
    explain: {
      where: (
        <>
          Where to look: <strong>line 4</strong>. Notice there is no “Traceback” header and no “in &lt;module&gt;”: Python found this problem while
          <em> reading</em> the file, before it ran a single line.
        </>
      ),
      code: <>A copy of line 4. The ^ points at the quote mark that opens the text, which is never closed.</>,
      type: (
        <>
          <strong>SyntaxError</strong>: the code breaks Python's grammar rules. Python checks the grammar of the <em>whole</em> file before running
          anything, so nothing was printed, not even the perfectly good lines 1 to 3.
        </>
      ),
      message: <>“unterminated string literal” means some text was opened with a quote mark but never closed. Python noticed when it reached the end of line 4.</>,
    },
    fix: <>Close the quote: <code>print("Thank you!")</code></>,
    summary: <>Nothing was printed at all, even though only line 4 is wrong.</>,
  },
  {
    id: 'typo',
    label: 'Misspell print',
    lines: withLine(2, 'prnt("Tickets sold:", 120)'),
    bad: 2,
    printed: ALL_OUT.slice(0, 1),
    tb: { header: true, line: 2, inModule: true, code: '    prnt("Tickets sold:", 120)', pointer: '    ^^^^', type: 'NameError', message: "name 'prnt' is not defined. Did you mean: 'print'?" },
    explain: {
      code: <>A copy of line 2. The ^^^^ underline the exact part Python could not run: the name <code>prnt</code>.</>,
      type: (
        <>
          <strong>NameError</strong>: Python met a name it does not know. Usually it is a typo (<code>prnt</code>, or <code>Print</code> with a capital
          P) or a variable used before it was created. Line 1 had already run, so its output appears above the traceback.
        </>
      ),
      message: <>“name 'prnt' is not defined” names the culprit, and “Did you mean: 'print'?” even suggests the fix.</>,
    },
    fix: <>Spell it correctly: <code>print("Tickets sold:", 120)</code></>,
    summary: <>Line 1 ran and printed. Python stopped at line 2, so lines 3 and 4 never ran.</>,
  },
  {
    id: 'plus',
    label: 'Text + number',
    lines: withLine(2, 'print("Tickets sold: " + 120)'),
    bad: 2,
    printed: ALL_OUT.slice(0, 1),
    tb: {
      header: true,
      line: 2,
      inModule: true,
      code: '    print("Tickets sold: " + 120)',
      pointer: '          ~~~~~~~~~~~~~~~~~^~~~~',
      type: 'TypeError',
      message: 'can only concatenate str (not "int") to str',
    },
    explain: {
      code: <>A copy of line 2. The ~~~ underline the whole calculation and the ^ points at the operator that failed: the +.</>,
      type: (
        <>
          <strong>TypeError</strong>: an operation was given a value of the wrong <em>type</em>. Here + was asked to join a piece of text (a{' '}
          <code>str</code>) to a whole number (an <code>int</code>). You will meet types properly in the next lesson.
        </>
      ),
      message: <>“can only concatenate str (not "int") to str”: concatenate means join end to end, and + can only join text to text.</>,
    },
    fix: (
      <>
        Use a comma instead, <code>print("Tickets sold:", 120)</code>, or turn the number into text first: <code>"Tickets sold: " + str(120)</code>
      </>
    ),
    summary: <>Line 1 ran and printed. Python stopped at line 2, so lines 3 and 4 never ran.</>,
  },
  {
    id: 'zero',
    label: 'Divide by zero',
    lines: withLine(3, 'print("Per student:", 120 / 0)'),
    bad: 3,
    printed: ALL_OUT.slice(0, 2),
    tb: {
      header: true,
      line: 3,
      inModule: true,
      code: '    print("Per student:", 120 / 0)',
      pointer: '                          ~~~~^~~',
      type: 'ZeroDivisionError',
      message: 'division by zero',
    },
    explain: {
      code: <>A copy of line 3. The ~~~ underline <code>120 / 0</code> and the ^ points at the division sign.</>,
      type: (
        <>
          <strong>ZeroDivisionError</strong>: the program tried to divide by zero, which has no answer. The grammar was fine, so lines 1 and 2 ran
          normally before the crash.
        </>
      ),
      message: <>“division by zero” says exactly what went wrong.</>,
    },
    fix: <>Divide by the real number of students: <code>120 / 40</code></>,
    summary: <>Lines 1 and 2 ran and printed. Python stopped at line 3, so line 4 never ran.</>,
  },
]

export default function ErrorDecoder() {
  const [sid, setSid] = useState('typo')
  const [part, setPart] = useState<PartId>('type')
  const sc = SCENARIOS.find((x) => x.id === sid) ?? SCENARIOS[0]
  const tb = sc.tb

  const pick = (id: string) => {
    setSid(id)
    setPart('type')
  }

  const renderPart = (id: PartId, children: ReactNode, block?: boolean) => (
    <span
      role="button"
      tabIndex={0}
      className={`${s.part} ${block ? s.partBlock : ''} ${part === id ? s.partOn : ''}`}
      style={{ '--c': PART_META[id].colour } as CSSProperties}
      onClick={() => setPart(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setPart(id)
        }
      }}
      aria-pressed={part === id}
      aria-label={`${PART_META[id].name}: explain`}
    >
      {children}
    </span>
  )

  const explainText: ReactNode = part === 'header' ? HEADER_TEXT : part === 'where' && !sc.explain.where && tb ? where(tb.line) : sc.explain[part]
  const linkLine = tb && part === 'where'

  return (
    <Figure
      title="Break it, then decode the error"
      caption={
        <>
          Pick a way to break the program. Python stops at the first line it cannot run and prints a traceback. Click each coloured part of the traceback
          to see what it tells you. Notice what got printed <em>before</em> the error: a SyntaxError stops everything, other errors stop at the bad line.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.chips} role="group" aria-label="Break the program">
          <span className={s.chipsLabel}>Break it:</span>
          {SCENARIOS.map((x) => (
            <button key={x.id} type="button" className={`${s.chip} ${x.id === sid ? s.chipOn : ''}`} aria-pressed={x.id === sid} onClick={() => pick(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        <div className={s.pane}>
          <div className={s.bar}>
            <span>fund.py</span>
            <span>{sc.bad ? `line ${sc.bad} changed` : 'all correct'}</span>
          </div>
          <ol className={s.lines} aria-label="Program code">
            {sc.lines.map((code, i) => {
              const bad = sc.bad === i + 1
              return (
                <li key={i} className={`${s.line} ${bad ? s.isBad : ''}`}>
                  <span className={s.gutter}>
                    <span className={`${s.marker} ${s.markerBad}`} aria-hidden="true">
                      {bad ? '✗' : ''}
                    </span>
                    <span
                      className={s.lineNo}
                      style={bad && linkLine ? { outline: `2.5px solid ${PART_META.where.colour}`, background: 'color-mix(in srgb, var(--viz-1) 20%, transparent)' } : undefined}
                    >
                      {i + 1}
                    </span>
                  </span>
                  <span className={s.code}>{highlightPy(code)}</span>
                </li>
              )
            })}
          </ol>
        </div>
        <div className={s.pane}>
          <div className={s.bar}>
            <span>Output</span>
            <span>{tb ? 'crashed' : 'finished'}</span>
          </div>
          <div className={s.console} aria-live="polite">
            {sc.printed.map((t, i) => (
              <div key={i} className={s.outText}>
                {t}
              </div>
            ))}
            {tb && (
              <div className={s.tb}>
                {tb.header && (
                  <span className={s.tbLine}>
                    {renderPart('header', 'Traceback (most recent call last):')}
                  </span>
                )}
                <span className={s.tbLine}>
                  {'  '}
                  {renderPart('where', `File "fund.py", line ${tb.line}${tb.inModule ? ', in <module>' : ''}`)}
                </span>
                <span className={s.tbLine}>
                  {renderPart('code', tb.code + '\n' + tb.pointer, true)}
                </span>
                <span className={s.tbLine} style={{ whiteSpace: 'pre-wrap' }}>
                  {renderPart('type', tb.type)}
                  {': '}
                  {renderPart('message', tb.message)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={s.status}>{sc.summary}</div>
        {tb ? (
          <div className={s.explain} style={{ '--c': PART_META[part].colour } as CSSProperties} aria-live="polite">
            <div className={s.explainHead}>
              <span className={s.swatch} aria-hidden="true" />
              {PART_META[part].name}
            </div>
            <div>{explainText}</div>
            {sc.fix && (
              <div className={s.fix}>
                <strong>Fix:</strong> {sc.fix}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Figure>
  )
}
