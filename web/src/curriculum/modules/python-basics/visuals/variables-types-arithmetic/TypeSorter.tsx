import { useRef, useState, type CSSProperties } from 'react'
import { Figure, Button, useNarrow } from '../../../../../kit'
import { run } from './miniPython'
import s from './viz.module.css'

/*
  Sort values into type bins (drag, or tap a value then tap a bin), then check against what
  Python's type() really says. The type() outputs are computed by the mini-Python evaluator.
*/

type Bin = 'int' | 'float' | 'str' | 'bool'
const BINS: { id: Bin; colour: string; hint: string }[] = [
  { id: 'int', colour: 'var(--viz-1)', hint: 'whole numbers' },
  { id: 'float', colour: 'var(--viz-2)', hint: 'decimals' },
  { id: 'str', colour: 'var(--viz-3)', hint: 'text' },
  { id: 'bool', colour: 'var(--viz-5)', hint: 'True / False' },
]

const CHIPS: { id: string; code: string; note: string }[] = [
  { id: 'a', code: '3', note: 'A whole number with no decimal point is an int.' },
  { id: 'b', code: '3.0', note: 'The decimal point makes it a float, even though its value is a whole number.' },
  { id: 'c', code: "'3'", note: 'The quotes make it a str: text that happens to contain the digit 3.' },
  { id: 'd', code: 'True', note: 'True and False (capital letter, no quotes) are the only two bool values.' },
  { id: 'e', code: '2.5e3', note: '2.5e3 is scientific notation for 2.5 × 10³ = 2500.0, and it is always a float.' },
  { id: 'f', code: "''", note: 'Two quotes with nothing between them: the empty string. Still a str, with length 0.' },
  { id: 'g', code: '-7', note: 'Negative whole numbers are ints too.' },
  { id: 'h', code: '"False"', note: 'It is in quotes, so it is text, not the bool False.' },
  { id: 'i', code: '4 / 2', note: 'The / operator always gives a float, so 4 / 2 is 2.0.' },
]

const truthOf = (code: string) => run(`type(${code})`).shown ?? ''
const binOf = (code: string) => /'(\w+)'/.exec(truthOf(code))?.[1] as Bin

export default function TypeSorter() {
  const [place, setPlace] = useState<Record<string, Bin | null>>(() => Object.fromEntries(CHIPS.map((c) => [c.id, c.id === 'a' ? 'int' : null])))
  const [sel, setSel] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null)
  const dragRef = useRef<{ id: string; x0: number; y0: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const put = (id: string, bin: Bin | null) => {
    setPlace((p) => ({ ...p, [id]: bin }))
    setSel(null)
    setChecked(false)
  }

  const token = (c: (typeof CHIPS)[number]) => {
    const where = place[c.id]
    const right = checked && where !== null && binOf(c.code) === where
    const wrong = checked && where !== null && !right
    const dragging = drag?.id === c.id
    const style: CSSProperties | undefined = dragging ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` } : undefined
    return (
      <button
        key={c.id}
        type="button"
        className={`${s.token} ${sel === c.id ? s.tokenSel : ''} ${dragging ? s.tokenDrag : ''} ${right ? s.tokenRight : ''} ${wrong ? s.tokenWrong : ''}`}
        style={style}
        aria-pressed={sel === c.id}
        aria-label={`${c.code}${where ? `, in the ${where} bin` : ''}${right ? ', correct' : wrong ? ', wrong' : ''}`}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          dragRef.current = { id: c.id, x0: e.clientX, y0: e.clientY, moved: false }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const d = dragRef.current
          if (!d || d.id !== c.id) return
          const dx = e.clientX - d.x0
          const dy = e.clientY - d.y0
          if (!d.moved && Math.hypot(dx, dy) > 6) d.moved = true
          if (d.moved) setDrag({ id: c.id, dx, dy })
        }}
        onPointerUp={(e) => {
          const d = dragRef.current
          dragRef.current = null
          setDrag(null)
          if (!d || !d.moved) return
          // a drag is not a tap: swallow the click that may follow (the token may also be re-mounted in its new bin)
          suppressClick.current = true
          window.setTimeout(() => (suppressClick.current = false), 0)
          const target = document.elementsFromPoint(e.clientX, e.clientY).find((el) => (el as HTMLElement).dataset?.bin) as HTMLElement | undefined
          if (target) put(c.id, target.dataset.bin === 'tray' ? null : (target.dataset.bin as Bin))
        }}
        onPointerCancel={() => {
          dragRef.current = null
          setDrag(null)
        }}
        onClick={() => {
          if (suppressClick.current) {
            suppressClick.current = false
            return
          }
          setSel((v) => (v === c.id ? null : c.id))
        }}
      >
        {c.code}
        {checked && where !== null && (
          <span className={s.tokenMark} aria-hidden="true">
            {right ? '✓' : '✗'}
          </span>
        )}
      </button>
    )
  }

  const inTray = CHIPS.filter((c) => place[c.id] === null)
  const placed = CHIPS.filter((c) => place[c.id] !== null)
  const score = placed.filter((c) => binOf(c.code) === place[c.id]).length

  return (
    <Figure
      title="Sort the values by type"
      caption={
        <>
          Drag each value into a bin (or tap a value, then tap a bin), then press <strong>Check</strong> to see what <code>type()</code> really says.
          Look out for the quotes, the decimal points and the <code>e</code>: those are what decide the type, not how the value looks.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <div
          className={s.tray}
          data-bin="tray"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('button')) return
            if (sel && place[sel] !== null) put(sel, null)
          }}
        >
          <span className={s.trayLabel}>{inTray.length ? `Values to sort (${inTray.length} left)` : 'All sorted. Press Check!'}</span>
          {inTray.map(token)}
        </div>
        <div className={`${s.bins} ${narrow ? s.binsNarrow : ''}`}>
          {BINS.map((b) => (
            <div
              key={b.id}
              role="button"
              tabIndex={0}
              data-bin={b.id}
              className={`${s.bin} ${sel ? s.binReady : ''}`}
              style={{ '--c': b.colour } as CSSProperties}
              aria-label={`${b.id} bin${sel ? ': place the selected value here' : ''}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return
                if (sel) put(sel, b.id)
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && sel && e.target === e.currentTarget) {
                  e.preventDefault()
                  put(sel, b.id)
                }
              }}
            >
              <span className={s.binHead}>
                {b.id}
                <span className={s.binHint}>{b.hint}</span>
              </span>
              <span className={s.binItems}>{CHIPS.filter((c) => place[c.id] === b.id).map(token)}</span>
            </div>
          ))}
        </div>
        <div className={s.btnRow}>
          <Button primary onClick={() => setChecked(true)} disabled={placed.length === 0}>
            Check
          </Button>
          <Button
            onClick={() => {
              setPlace(Object.fromEntries(CHIPS.map((c) => [c.id, null])))
              setChecked(false)
              setSel(null)
            }}
          >
            Start again
          </Button>
          <span className={s.spacer} />
          {checked && (
            <span className={s.binHint} style={{ fontSize: '0.85rem' }}>
              {score} of {placed.length} placed values correct{inTray.length ? `, ${inTray.length} still to sort` : ''}
            </span>
          )}
        </div>
        {checked && (
          <ul className={s.notes} aria-live="polite">
            {placed.map((c) => (
              <li key={c.id}>
                <code>
                  type({c.code}) → {truthOf(c.code)}
                </code>
                <span>
                  {binOf(c.code) === place[c.id] ? '✓ ' : '✗ '}
                  {c.note}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Figure>
  )
}
