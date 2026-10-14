import { useState, type CSSProperties } from 'react'
import { Figure, Button } from '../../../../../kit'
import { run, typeName, PyError, Unsupported } from './miniPython'
import { highlightPy } from './pyCode'
import s from './viz.module.css'

/*
  A tiny notebook: type an expression that mixes types and see its value and type, or the exact
  error Python would raise, with a plain-English hint. Evaluated instantly by miniPython.ts.
*/

const PRESETS = ["'3' + 3", "int('3') + 3", "'3' + str(3)", "'3' * 3", '3 + 3.0', '7 / 7', 'True + True', "int('3.5')", "float('3.5')", 'int(3.99)', 'type(2.5e3)', "bool('False')"]
const START = ["'3' + 3", "int('3') + 3", "'3' * 3"]
const MAX_CELLS = 6

const TYPE_COLOUR: Record<string, string> = {
  int: 'var(--viz-1)',
  float: 'var(--viz-2)',
  str: 'var(--viz-3)',
  bool: 'var(--viz-5)',
  type: 'var(--viz-6)',
  NoneType: 'var(--ink-3)',
}

function hint(e: PyError): string | null {
  const m = e.message
  if (m.startsWith('can only concatenate str') || (m.startsWith('unsupported operand type(s) for +') && m.includes("'str'")))
    return "Should + add numbers or join text? Python refuses to guess. Convert one side first: int('3') + 3 gives 6, while '3' + str(3) gives '33'."
  if (m.startsWith("can't multiply sequence")) return "A string can only be repeated a whole number of times, as in '3' * 3."
  if (m.startsWith('unsupported operand') || m.startsWith('bad operand')) return 'These types cannot be combined with this operator.'
  if (m.startsWith('invalid literal for int()'))
    return "int() only reads text that looks like a whole number. For '3.5' use float('3.5'), or int(float('3.5')) to chop off the decimal part."
  if (m.startsWith('could not convert string to float')) return 'float() needs text that looks like a number.'
  if (e.pyType === 'NameError') return 'A word without quotes is treated as a name (a variable or a function). If you meant text, put it in quotes.'
  if (e.pyType === 'ZeroDivisionError') return 'Dividing by zero has no answer.'
  if (e.pyType === 'SyntaxError') return 'Check for a missing quote or bracket.'
  return null
}

interface Cell {
  n: number
  src: string
}

export default function TypeMixer() {
  const [cells, setCells] = useState<Cell[]>(START.map((src, i) => ({ n: i + 1, src })))
  const [count, setCount] = useState(START.length)
  const [text, setText] = useState('')

  const submit = (src: string) => {
    const code = src.trim()
    if (!code) return
    const n = count + 1
    setCount(n)
    setCells((c) => [...c, { n, src: code }].slice(-MAX_CELLS))
    setText('')
  }

  return (
    <Figure
      title="Mix types in a mini notebook"
      caption={
        <>
          Type an expression and press Enter, or tap an example. Each result shows its value <em>and</em> its type. Try to predict each one first, and
          notice which mixes Python refuses (a <code>TypeError</code>) and how <code>int()</code>, <code>float()</code> and <code>str()</code> fix them.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.cells} aria-live="polite">
          {cells.map((c) => {
            const r = run(c.src)
            return (
              <div key={c.n} className={s.cell}>
                <div className={s.cellIn}>
                  <span className={s.cellLabel}>In [{c.n}]:</span>
                  <span className={s.cellCode}>{highlightPy(c.src)}</span>
                </div>
                {(r.out.length > 0 || r.shown !== undefined || r.error) && (
                  <div className={s.cellOut}>
                    <span className={s.cellLabel}>{r.error ? '' : r.shown !== undefined ? `Out[${c.n}]:` : ''}</span>
                    <div>
                      {r.out.map((line, i) => (
                        <div key={i} className={s.cellCode}>
                          {line}
                        </div>
                      ))}
                      {r.result && r.shown !== undefined && (
                        <span className={s.cellValue}>
                          {r.shown}
                          <span className={s.badge} style={{ '--c': TYPE_COLOUR[typeName(r.result)] ?? 'var(--ink-3)' } as CSSProperties}>
                            {typeName(r.result)}
                          </span>
                        </span>
                      )}
                      {r.error instanceof PyError && (
                        <>
                          <div className={s.err}>
                            {r.error.pyType}: {r.error.message}
                          </div>
                          {hint(r.error) && <div className={s.hint}>{hint(r.error)}</div>}
                        </>
                      )}
                      {r.error instanceof Unsupported && <div className={s.unsup}>{r.error.message}</div>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <form
          className={s.prompt}
          onSubmit={(e) => {
            e.preventDefault()
            submit(text)
          }}
        >
          <span className={s.promptSign} aria-hidden="true">
            In [{count + 1}]:
          </span>
          <input
            className={s.input}
            value={text}
            maxLength={80}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="e.g. int('7') * 2"
            aria-label="Python expression"
            onChange={(e) => setText(e.target.value)}
          />
          <Button primary onClick={() => submit(text)} disabled={!text.trim()}>
            Run
          </Button>
        </form>
        <div className={s.chips} role="group" aria-label="Examples to run">
          <span className={s.chipsLabel}>Try:</span>
          {PRESETS.map((p) => (
            <button key={p} type="button" className={`${s.chip} ${s.codeChip}`} onClick={() => submit(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </Figure>
  )
}
