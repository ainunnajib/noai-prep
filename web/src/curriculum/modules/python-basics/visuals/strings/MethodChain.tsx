import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Button, useNarrow } from '../../../../../kit'
import { highlightPy } from './pyCode'
import { reprVal, strRepr, type Val } from './pyStr'
import s from './str.module.css'

/*
  Build a chain of string methods one click at a time and watch every intermediate value.
  The original variable never changes: each method returns a NEW value. After .split() the
  value is a list, so string-only methods fail with Python's real AttributeError.
*/

type Method = { id: string; label: string }
const METHODS: Method[] = [
  { id: 'strip', label: '.strip()' },
  { id: 'lower', label: '.lower()' },
  { id: 'upper', label: '.upper()' },
  { id: 'title', label: '.title()' },
  { id: 'replace', label: ".replace('lah', 'leh')" },
  { id: 'split', label: '.split()' },
  { id: 'join', label: "'-'.join(…)" },
  { id: 'count', label: ".count('a')" },
  { id: 'len', label: 'len(…)' },
]
const START_TEXT = '  Can or NOT lah  '
const START_CHAIN = ['strip', 'lower', 'split']
const MAX_STEPS = 6

const tname = (v: Val) => (typeof v === 'string' ? 'str' : Array.isArray(v) ? 'list' : 'int')
const TYPE_COLOUR: Record<string, string> = { str: 'var(--viz-3)', list: 'var(--viz-5)', int: 'var(--viz-1)' }

const isSpace = (c: string) => /\s/.test(c)
function pyStrip(x: string) {
  let a = 0
  let b = x.length
  while (a < b && isSpace(x[a])) a++
  while (b > a && isSpace(x[b - 1])) b--
  return x.slice(a, b)
}
/** str.title(): a letter is upper-cased if the previous character is not a cased letter. */
function pyTitle(x: string) {
  let out = ''
  let prevCased = false
  for (const ch of x) {
    const cased = ch.toLowerCase() !== ch.toUpperCase()
    out += cased ? (prevCased ? ch.toLowerCase() : ch.toUpperCase()) : ch
    prevCased = cased
  }
  return out
}

type Result = { value: Val } | { error: string }

function apply(id: string, v: Val): Result {
  const noAttr = (attr: string): Result => ({ error: `AttributeError: '${tname(v)}' object has no attribute '${attr}'` })
  switch (id) {
    case 'join':
      if (typeof v === 'string') return { value: Array.from(v).join('-') }
      if (Array.isArray(v)) return { value: v.join('-') }
      return { error: 'TypeError: can only join an iterable' }
    case 'len':
      if (typeof v === 'string') return { value: { int: Array.from(v).length } }
      if (Array.isArray(v)) return { value: { int: v.length } }
      return { error: `TypeError: object of type 'int' has no len()` }
  }
  // lists have a count() method too: it counts the items equal to 'a'
  if (id === 'count' && Array.isArray(v)) return { value: { int: v.filter((w) => w === 'a').length } }
  if (typeof v !== 'string') return noAttr(id)
  switch (id) {
    case 'strip':
      return { value: pyStrip(v) }
    case 'lower':
      return { value: v.toLowerCase() }
    case 'upper':
      return { value: v.toUpperCase() }
    case 'title':
      return { value: pyTitle(v) }
    case 'replace':
      return { value: v.split('lah').join('leh') }
    case 'split':
      return { value: v.split(/\s+/).filter((w) => w.length > 0) }
    case 'count':
      return { value: { int: v.split('a').length - 1 } }
  }
  return { error: 'unknown method' }
}

function wrapCode(expr: string, id: string) {
  if (id === 'join') return `'-'.join(${expr})`
  if (id === 'len') return `len(${expr})`
  return expr + (METHODS.find((m) => m.id === id)?.label ?? '')
}

/** print(x): strings without quotes, lists and ints as Python shows them. */
const printed = (v: Val) => (typeof v === 'string' ? v : reprVal(v))

function ValueView({ v }: { v: Val }) {
  if (typeof v === 'string')
    return v.length === 0 ? (
      <span className={s.note}>'' (the empty string)</span>
    ) : (
      <span className={s.cells} aria-label={strRepr(v)}>
        {Array.from(v).map((ch, i) => (
          <span key={i} className={`${s.cell} ${ch === ' ' ? s.space : ''}`}>
            {ch === ' ' ? '·' : ch}
          </span>
        ))}
      </span>
    )
  if (Array.isArray(v))
    return (
      <span className={s.val} aria-label={reprVal(v)}>
        <span className={s.bracket}>[</span>
        {v.map((w, i) => (
          <span key={i} className={s.pill}>
            {strRepr(w)}
          </span>
        ))}
        <span className={s.bracket}>]</span>
      </span>
    )
  return <span className={s.op}>{reprVal(v)}</span>
}

export default function MethodChain() {
  const [text, setText] = useState(START_TEXT)
  const [chain, setChain] = useState<string[]>(START_CHAIN)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)

  const rows: { label: ReactNode; res: Result | null }[] = []
  let cur: Val = text
  let failed = false
  let code = 'text'
  for (const id of chain) {
    code = wrapCode(code, id)
    if (failed) {
      rows.push({ label: METHODS.find((m) => m.id === id)?.label, res: null })
      continue
    }
    const r = apply(id, cur)
    rows.push({ label: METHODS.find((m) => m.id === id)?.label, res: r })
    if ('error' in r) failed = true
    else cur = r.value
  }
  const final = failed ? null : cur
  const badge = (v: Val) => (
    <span className={s.badge} style={{ '--c': TYPE_COLOUR[tname(v)] } as CSSProperties}>
      {tname(v)}
    </span>
  )

  return (
    <Figure
      title="Chain string methods"
      caption={
        <>
          Click methods to add them to the chain (try them in different orders), edit the text, or undo a step. Every method hands back a{' '}
          <em>new</em> value, shown on its own row; the original <code>text</code> never changes. After <code>.split()</code> you have a list, so
          string methods stop working.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <label className={s.field}>
          <span className={s.fieldLabel}>text =</span>
          <input className={s.input} value={text} maxLength={30} spellCheck={false} onChange={(e) => setText(e.target.value)} aria-label="The original text" />
        </label>
        <div className={s.chips} role="group" aria-label="Add a method">
          <span className={s.chipsLabel}>Add:</span>
          {METHODS.map((m) => (
            <button key={m.id} type="button" className={s.chip} disabled={chain.length >= MAX_STEPS} onClick={() => setChain((c) => [...c, m.id])}>
              {m.label}
            </button>
          ))}
        </div>
        <ol className={s.steps} aria-live="polite">
          <li className={`${s.step} ${s.stepOrig} ${narrow ? s.stepNarrow : ''}`}>
            <span className={s.op}>text</span>
            <span className={s.val}>
              <ValueView v={text} />
              {badge(text)}
            </span>
          </li>
          {rows.map((r, i) => (
            <li key={i} className={`${s.step} ${r.res && 'error' in r.res ? s.stepBad : ''} ${narrow ? s.stepNarrow : ''}`}>
              <span className={s.op}>{r.label}</span>
              <span className={s.val}>
                {r.res === null ? (
                  <span className={s.note}>not run: Python stopped at the error above</span>
                ) : 'error' in r.res ? (
                  <span className={s.err}>{r.res.error}</span>
                ) : (
                  <>
                    <ValueView v={r.res.value} />
                    {badge(r.res.value)}
                  </>
                )}
              </span>
            </li>
          ))}
        </ol>
        <div className={s.row}>
          <Button onClick={() => setChain((c) => c.slice(0, -1))} disabled={chain.length === 0}>
            Undo last step
          </Button>
          <Button onClick={() => setChain([])} disabled={chain.length === 0}>
            Clear chain
          </Button>
          <Button
            onClick={() => {
              setText(START_TEXT)
              setChain(START_CHAIN)
            }}
          >
            Reset
          </Button>
        </div>
        <div className={s.codeLine} aria-label="The whole chain as code">
          {highlightPy(`result = ${code}`)}
          {'\n'}
          {highlightPy('print(result)')}
          <span className={s.out}>{final === null ? '   # error, see above' : `   # ${printed(final)}`}</span>
          {'\n'}
          <span className={s.out}>{`# and text is still ${strRepr(text)}: unchanged`}</span>
        </div>
      </div>
    </Figure>
  )
}
