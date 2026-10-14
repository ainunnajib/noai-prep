import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { Figure, Controls, Readout, Button } from '../../../../../kit'

/*
  Sort the vocabulary of an ML problem into four boxes: Feature, Label, Parameter, Hyperparameter.
  The chips come from one running example (pricing HDB resale flats with three different models).
  Drag a chip onto a box, or tap a chip and then tap a box. Each move gets a one-line reason, and
  sorted chips light up the matching column or setting in the table above.
  Aha: parameters are LEARNED by fit(); hyperparameters are CHOSEN by you before fit().
*/

type Role = 'feature' | 'label' | 'param' | 'hyper'

interface Chip {
  id: string
  text: string
  role: Role
  why: string
}

const CHIPS: Chip[] = [
  { id: 'area', text: 'floor_area', role: 'feature', why: 'floor_area is an input column. We know it for every flat, including a new one we want to price, so it is a feature.' },
  { id: 'storey', text: 'storey', role: 'feature', why: 'storey is an input we can read off any flat before it is sold, so it is a feature.' },
  { id: 'town', text: 'town', role: 'feature', why: 'town is an input too, even though it is a category. It is turned into numbers (encoded) before training, but it is still a feature.' },
  { id: 'price', text: 'resale_price', role: 'label', why: 'resale_price is the answer we want to predict. Training rows include it; for a new flat it is unknown. That makes it the label.' },
  { id: 'w1', text: 'w₁', role: 'param', why: 'w₁ is the weight on floor area. fit() learns its value from the data; you never type it in, so it is a parameter.' },
  { id: 'b', text: 'b', role: 'param', why: 'The intercept b is learned by fit(), exactly like the weights, so it is a parameter.' },
  { id: 'split', text: 'split: area ≤ 95', role: 'param', why: 'The tree picked the number 95 by searching the training data for the best split, so the split is learned: a parameter.' },
  { id: 'lr', text: 'learning_rate', role: 'hyper', why: 'You choose the step size before training starts; gradient descent never changes it. That makes it a hyperparameter.' },
  { id: 'epochs', text: 'epochs', role: 'hyper', why: 'How many passes to make over the data is your decision, made before training, so it is a hyperparameter.' },
  { id: 'depth', text: 'max_depth', role: 'hyper', why: 'You cap how deep the tree may grow when you create it; the data does not set the cap. Hyperparameter.' },
  { id: 'k', text: 'n_neighbors', role: 'hyper', why: 'k is fixed when you write KNeighborsClassifier(n_neighbors=5); fit() never changes it. Hyperparameter.' },
]

const BINS: { role: Role; name: string; hint: string; color: string }[] = [
  { role: 'feature', name: 'Feature (X)', hint: 'an input the model looks at', color: 'var(--viz-1)' },
  { role: 'label', name: 'Label (y)', hint: 'the answer we want to predict', color: 'var(--viz-2)' },
  { role: 'param', name: 'Parameter', hint: 'learned from the data by fit()', color: 'var(--viz-3)' },
  { role: 'hyper', name: 'Hyperparameter', hint: 'chosen by you before fit()', color: 'var(--viz-5)' },
]
const BIN_NAME: Record<Role, string> = { feature: 'a feature', label: 'the label', param: 'a parameter', hyper: 'a hyperparameter' }
const COLOR: Record<Role, string> = { feature: 'var(--viz-1)', label: 'var(--viz-2)', param: 'var(--viz-3)', hyper: 'var(--viz-5)' }

const ROWS: [number, number, string, number][] = [
  [67, 4, 'Bishan', 420],
  [92, 11, 'Tampines', 530],
  [122, 7, 'Punggol', 680],
]

const START: Record<string, Role> = { area: 'feature' }
const mono: CSSProperties = { fontFamily: 'var(--font-mono)' }

export default function RoleSorter() {
  const [placed, setPlaced] = useState<Record<string, Role>>(START)
  const [selected, setSelected] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>({
    ok: true,
    text: 'Example done for you: floor_area is a feature. Now sort the other ten chips.',
  })
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number } | null>(null)
  const press = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null)
  const swallowClick = useRef(false)

  const chip = (id: string) => CHIPS.find((c) => c.id === id)!
  const place = (id: string, role: Role | 'tray') => {
    setSelected(null)
    if (role === 'tray') {
      setPlaced((p) => {
        const n = { ...p }
        delete n[id]
        return n
      })
      return
    }
    setPlaced((p) => ({ ...p, [id]: role }))
    const c = chip(id)
    setMsg(role === c.role ? { ok: true, text: `Yes. ${c.why}` } : { ok: false, text: `Not ${BIN_NAME[role]}. ${c.why}` })
  }

  const isRight = (id: string) => placed[id] === chip(id).role
  const nCorrect = CHIPS.filter((c) => isRight(c.id)).length
  const known = (role: Role, id: string) => placed[id] === role && isRight(id)

  const onDown = (id: string) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    press.current = { id, x: e.clientX, y: e.clientY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current
    if (!p) return
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 6) p.moved = true
    if (p.moved) setGhost({ id: p.id, x: e.clientX, y: e.clientY })
  }
  const onUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current
    press.current = null
    if (!p || !p.moved) return
    swallowClick.current = true
    setGhost(null)
    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-bin]') as HTMLElement | null
    const bin = target?.dataset.bin as Role | 'tray' | undefined
    if (bin) place(p.id, bin)
  }
  const onChipClick = (id: string) => {
    if (swallowClick.current) {
      swallowClick.current = false
      return
    }
    setSelected((s) => (s === id ? null : id))
  }

  const renderChip = (c: Chip) => {
    const where = placed[c.id]
    const state = where == null ? 'loose' : isRight(c.id) ? 'right' : 'wrong'
    const sel = selected === c.id
    const border = state === 'right' ? COLOR[c.role] : state === 'wrong' ? 'var(--viz-neg)' : 'var(--ink-3)'
    return (
      <button
        key={c.id}
        type="button"
        aria-pressed={sel}
        aria-label={`${c.text}${state === 'right' ? ', correctly sorted' : state === 'wrong' ? ', in the wrong box' : ''}`}
        onPointerDown={onDown(c.id)}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => {
          press.current = null
          setGhost(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onChipClick(c.id)
        }}
        style={{
          ...mono,
          fontSize: '0.84rem',
          fontWeight: 600,
          padding: '0.3rem 0.6rem',
          borderRadius: 999,
          border: `2px solid ${border}`,
          background: sel ? 'var(--accent-soft)' : state === 'wrong' ? 'color-mix(in srgb, var(--viz-neg) 12%, var(--surface))' : 'var(--surface)',
          color: 'var(--ink)',
          cursor: 'grab',
          touchAction: 'none',
          boxShadow: sel ? '0 0 0 3px var(--accent-line)' : 'none',
          opacity: ghost?.id === c.id ? 0.35 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {c.text}
        {state === 'right' && <span aria-hidden="true"> ✓</span>}
        {state === 'wrong' && <span aria-hidden="true"> ✗</span>}
      </button>
    )
  }

  const loose = CHIPS.filter((c) => placed[c.id] == null)
  const hl = (role: Role, id: string): CSSProperties =>
    known(role, id) ? { background: `color-mix(in srgb, ${COLOR[role]} 18%, var(--surface))`, color: 'var(--ink)', borderRadius: 4, padding: '0 3px' } : {}

  const th: CSSProperties = { ...mono, fontSize: '0.78rem', padding: '0.3rem 0.4rem', textAlign: 'left', borderBottom: '1.5px solid var(--rule)', whiteSpace: 'nowrap' }
  const td: CSSProperties = { fontSize: '0.82rem', padding: '0.25rem 0.4rem', borderBottom: '1px solid var(--rule)', whiteSpace: 'nowrap' }
  const colStyle = (role: Role, id: string): CSSProperties =>
    known(role, id) ? { background: `color-mix(in srgb, ${COLOR[role]} 16%, var(--surface))`, boxShadow: `inset 0 3px 0 ${COLOR[role]}` } : {}

  return (
    <Figure
      title="Sort the words: feature, label, parameter or hyperparameter?"
      caption={
        <>
          Drag each chip into a box, or <b>tap a chip and then tap a box</b>. Every move gets a one-line reason, and correctly sorted words light up in
          the table and the model descriptions. Notice what the last two boxes have in common and how they differ: both belong to the model, but a{' '}
          <b>parameter</b> is <i>learned</i> by <code>fit()</code> while a <b>hyperparameter</b> is <i>chosen</i> by you before <code>fit()</code> runs.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.7rem' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ borderCollapse: 'collapse', margin: '0 auto', fontVariantNumeric: 'tabular-nums' }} aria-label="Three rows of HDB resale data">
            <thead>
              <tr>
                <th style={{ ...th, ...colStyle('feature', 'area') }}>floor_area</th>
                <th style={{ ...th, ...colStyle('feature', 'storey') }}>storey</th>
                <th style={{ ...th, ...colStyle('feature', 'town') }}>town</th>
                <th style={{ ...th, ...colStyle('label', 'price') }}>resale_price</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i}>
                  <td style={{ ...td, ...colStyle('feature', 'area') }}>{r[0]} m²</td>
                  <td style={{ ...td, ...colStyle('feature', 'storey') }}>{r[1]}</td>
                  <td style={{ ...td, ...colStyle('feature', 'town') }}>{r[2]}</td>
                  <td style={{ ...td, ...colStyle('label', 'price') }}>${r[3]}k</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.88rem', color: 'var(--ink-2)', lineHeight: 1.55 }}>
          <li>
            <b>Model A</b>, a line: price = <span style={hl('param', 'w1')}>w₁</span> × area + w₂ × storey + <span style={hl('param', 'b')}>b</span>, trained
            by gradient descent with <span style={{ ...mono, ...hl('hyper', 'lr') }}>learning_rate=0.01</span> for{' '}
            <span style={{ ...mono, ...hl('hyper', 'epochs') }}>epochs=500</span>.
          </li>
          <li>
            <b>Model B</b>, a decision tree with <span style={{ ...mono, ...hl('hyper', 'depth') }}>max_depth=3</span>. Its first question turned out to
            be <span style={hl('param', 'split')}>"is area ≤ 95?"</span>
          </li>
          <li>
            <b>Model C</b>, k-nearest neighbours with <span style={{ ...mono, ...hl('hyper', 'k') }}>n_neighbors=5</span>.
          </li>
        </ul>

        <div
          data-bin="tray"
          onClick={() => selected && place(selected, 'tray')}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.45rem',
            minHeight: 46,
            padding: '0.55rem',
            borderRadius: 'var(--radius-m)',
            border: '1.5px dashed var(--rule)',
            background: 'var(--surface-2)',
            alignItems: 'center',
          }}
          aria-label="Unsorted chips"
        >
          {loose.length ? (
            loose.map(renderChip)
          ) : (
            <span style={{ fontSize: '0.88rem', color: 'var(--ink-3)' }}>All chips sorted. Wrong ones (✗) can be dragged or tapped and moved again.</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(138px, 1fr))', gap: '0.55rem' }}>
          {BINS.map((bin) => (
            <div
              key={bin.role}
              data-bin={bin.role}
              onClick={() => selected && place(selected, bin.role)}
              style={{
                borderRadius: 'var(--radius-m)',
                border: `2px solid ${selected ? bin.color : `color-mix(in srgb, ${bin.color} 55%, var(--rule))`}`,
                background: `color-mix(in srgb, ${bin.color} 7%, var(--surface))`,
                padding: '0.45rem 0.5rem 0.55rem',
                minHeight: 110,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                cursor: selected ? 'pointer' : 'default',
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (selected) place(selected, bin.role)
                }}
                aria-label={`Put the selected chip in ${bin.name}`}
                style={{ all: 'unset', cursor: selected ? 'pointer' : 'default', display: 'grid', gap: 1 }}
              >
                <span style={{ fontWeight: 750, fontSize: '0.92rem', color: bin.color }}>{bin.name}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-3)', lineHeight: 1.3 }}>{bin.hint}</span>
              </button>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>{CHIPS.filter((c) => placed[c.id] === bin.role).map(renderChip)}</div>
            </div>
          ))}
        </div>

        <div
          aria-live="polite"
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.45,
            padding: '0.5rem 0.7rem',
            borderRadius: 'var(--radius-m)',
            borderLeft: `4px solid ${msg.ok ? 'var(--viz-pos)' : 'var(--viz-neg)'}`,
            background: 'var(--surface-2)',
            color: 'var(--ink)',
          }}
        >
          {selected ? `Selected ${chip(selected).text}: now tap the box it belongs in.` : msg.text}
        </div>
      </div>
      <Controls>
        <Readout items={[['sorted correctly', `${nCorrect} / ${CHIPS.length}`]]} />
        <Button
          onClick={() => {
            setPlaced(Object.fromEntries(CHIPS.map((c) => [c.id, c.role])))
            setSelected(null)
            setMsg({ ok: true, text: 'Answers shown. Parameters (w₁, b, the split) were learned; hyperparameters (learning_rate, epochs, max_depth, n_neighbors) were chosen.' })
          }}
        >
          Show answers
        </Button>
        <Button
          onClick={() => {
            setPlaced(START)
            setSelected(null)
            setMsg({ ok: true, text: 'Reset. floor_area is already sorted as an example.' })
          }}
        >
          Reset
        </Button>
      </Controls>
      {ghost && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: ghost.x,
            top: ghost.y,
            transform: 'translate(-50%, -60%)',
            pointerEvents: 'none',
            zIndex: 50,
            ...mono,
            fontSize: '0.84rem',
            fontWeight: 600,
            padding: '0.3rem 0.6rem',
            borderRadius: 999,
            border: '2px solid var(--accent)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {chip(ghost.id).text}
        </div>
      )}
    </Figure>
  )
}
