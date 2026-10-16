import { useState, type CSSProperties } from 'react'
import { Figure, Button } from '../../../../../kit'
import { CodeView, MONO } from '../references-mutability/pyviz'

/*
  Guess-the-exception: eight short buggy snippets. Pick one, guess which exception it raises,
  then run it to see the real last line of the traceback (Python 3.13), why it happens, and a fix.
*/

const TYPES = ['IndexError', 'KeyError', 'TypeError', 'ValueError', 'ZeroDivisionError', 'NameError', 'AttributeError'] as const
type ExType = (typeof TYPES)[number]

interface Card {
  code: string
  type: ExType
  message: string
  why: string
  fix: string
}

const CARDS: Card[] = [
  {
    code: 'nums = [4, 8, 6]\nnums[3]',
    type: 'IndexError',
    message: 'IndexError: list index out of range',
    why: 'A list of length 3 has positions 0, 1 and 2 only. Asking for position 3 is one past the end: a classic off-by-one.',
    fix: 'nums[2]    # or nums[-1]',
  },
  {
    code: 'd = {"kopi": 1.2}\nd["teh"]',
    type: 'KeyError',
    message: "KeyError: 'teh'",
    why: 'A dictionary raises KeyError when you look up a key that was never put in. The message names the missing key.',
    fix: 'd.get("teh", 0)    # 0 if missing',
  },
  {
    code: '"Score: " + 90',
    type: 'TypeError',
    message: 'TypeError: can only concatenate str (not "int") to str',
    why: '+ can join two strings or add two numbers, but not a string and an int. The types do not fit the operation.',
    fix: '"Score: " + str(90)',
  },
  {
    code: 'int("abc")',
    type: 'ValueError',
    message: "ValueError: invalid literal for int() with base 10: 'abc'",
    why: 'int() does accept a string (right type), but this string’s value is not a whole number. Right type, bad value. Check text.isdigit() first, or catch the ValueError.',
    fix: 'int("123")',
  },
  {
    code: 'count = 0\n10 / count',
    type: 'ZeroDivisionError',
    message: 'ZeroDivisionError: division by zero',
    why: 'Dividing by zero has no answer. A common source: averaging an empty list, sum([]) / len([]).',
    fix: 'if count != 0:\n    print(10 / count)',
  },
  {
    code: 'len(42)',
    type: 'TypeError',
    message: "TypeError: object of type 'int' has no len()",
    why: 'len() measures collections such as lists, strings and dicts. A single int has no length: wrong type for len().',
    fix: 'len([42])    # or len(str(42))',
  },
  {
    code: 'prnt("hi")',
    type: 'NameError',
    message: "NameError: name 'prnt' is not defined. Did you mean: 'print'?",
    why: 'Python has never seen the name prnt. Usually a typo, or a variable used before it was assigned.',
    fix: 'print("hi")',
  },
  {
    code: '"abc".append("d")',
    type: 'AttributeError',
    message: "AttributeError: 'str' object has no attribute 'append'",
    why: 'Strings have no append method (they are immutable). You also get AttributeError when predict reads self.mean_ before fit created it.',
    fix: '"abc" + "d"',
  },
]

export default function ExceptionZoo() {
  const [sel, setSel] = useState(0)
  const [guesses, setGuesses] = useState<Record<number, ExType>>({})
  const [ran, setRan] = useState<Record<number, boolean>>({})
  const [showFix, setShowFix] = useState<Record<number, boolean>>({})

  const c = CARDS[sel]
  const guess = guesses[sel]
  const isRun = Boolean(ran[sel])
  const right = Object.entries(guesses).filter(([i, g]) => ran[Number(i)] && CARDS[Number(i)].type === g).length
  const done = Object.keys(ran).length

  const cardStyle = (i: number): CSSProperties => {
    const r = ran[i]
    const ok = r && guesses[i] === CARDS[i].type
    return {
      textAlign: 'left',
      font: 'inherit',
      color: 'var(--ink)',
      cursor: 'pointer',
      borderRadius: 10,
      padding: '0.4rem 0.5rem',
      background: i === sel ? 'var(--accent-soft)' : 'var(--surface)',
      border: `2px solid ${i === sel ? 'var(--accent)' : r ? (ok ? 'var(--viz-pos)' : 'var(--viz-neg)') : 'var(--rule)'}`,
      minWidth: 0,
      display: 'grid',
      gap: 4,
      alignContent: 'start',
    }
  }

  return (
    <Figure
      title="Guess the exception"
      caption={
        <>
          Pick a snippet, guess which exception it raises, then press <b>Run it</b> to see the last line of the real traceback. Each exception name points to one family of
          causes, so the name alone often tells you where to look.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 148px), 1fr))', gap: 8 }}>
        {CARDS.map((k, i) => (
          <button key={i} type="button" style={cardStyle(i)} onClick={() => setSel(i)} aria-pressed={i === sel} aria-label={`Snippet ${i + 1}: ${k.code.replace(/\n/g, '; ')}`}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)' }}>
              #{i + 1}{' '}
              {ran[i] ? (
                <span style={{ color: guesses[i] === k.type ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>{guesses[i] === k.type ? '✓ ' : '✗ '}{k.type}</span>
              ) : guesses[i] ? (
                <span>guess: {guesses[i]}</span>
              ) : (
                '?'
              )}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 12, whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.45 }}>{k.code}</span>
          </button>
        ))}
      </div>

      <div style={{ width: '100%', border: '1px solid var(--rule)', borderRadius: 12, padding: '0.6rem 0.7rem', background: 'var(--surface-2)', display: 'grid', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Snippet #{sel + 1}</div>
        <CodeView code={c.code} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>{isRun ? 'Your guess:' : 'Which exception will it raise?'}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TYPES.map((t) => {
            const picked = guess === t
            const style: CSSProperties = {
              fontFamily: MONO,
              fontSize: 12.5,
              background: isRun && t === c.type ? 'var(--ok-soft)' : isRun && picked ? 'var(--bad-soft)' : picked ? 'var(--accent-soft)' : undefined,
              borderColor: isRun && t === c.type ? 'var(--ok)' : isRun && picked ? 'var(--bad)' : picked ? 'var(--accent)' : undefined,
            }
            return (
              <button key={t} type="button" className="btn btn-small" style={style} aria-pressed={picked} onClick={() => !isRun && setGuesses((g) => ({ ...g, [sel]: t }))} disabled={isRun && !picked && t !== c.type}>
                {t}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Button primary onClick={() => setRan((r) => ({ ...r, [sel]: true }))} disabled={isRun || !guess}>
            {guess ? 'Run it' : 'Pick a guess first'}
          </Button>
          {isRun && (
            <Button onClick={() => setShowFix((f) => ({ ...f, [sel]: !f[sel] }))}>{showFix[sel] ? 'Hide the fix' : 'Show a fix'}</Button>
          )}
          {sel < CARDS.length - 1 && isRun && <Button onClick={() => setSel(sel + 1)}>Next snippet</Button>}
        </div>
        {isRun && (
          <div style={{ display: 'grid', gap: 6 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                color: 'var(--bad)',
                fontWeight: 600,
                background: 'var(--surface)',
                border: '1px solid var(--rule)',
                borderRadius: 8,
                padding: '0.4rem 0.6rem',
                overflowWrap: 'anywhere',
              }}
            >
              {c.message}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              <b style={{ color: guess === c.type ? 'var(--ok)' : 'var(--bad)' }}>{guess === c.type ? 'Right.' : `Not ${guess}.`}</b> {c.why}
            </div>
            {showFix[sel] && <CodeView code={c.fix} title="one way to fix it" />}
          </div>
        )}
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
        Score: <b>{right}</b> right out of <b>{done}</b> run so far (8 snippets).
      </div>
    </Figure>
  )
}
