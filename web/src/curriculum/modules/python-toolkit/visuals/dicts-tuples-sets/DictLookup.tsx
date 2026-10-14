import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Button, useContainerWidth } from '../../../../../kit'
import s from './dts.module.css'

/*
  A dict as a hash table. Every key is turned into a number by a (toy) hash function, and
  number % table_size picks the slot. Look-ups jump straight to that slot. If the slot holds a
  different key, Python tries another slot; an empty slot means "not in the dict".
  The toy hash (sum of letter positions) stands in for Python's real, scrambled hash().
  Like CPython, the table is kept at most two-thirds full and doubles when it fills up.
*/

type Entry = { key: string; value: number }
type Kind = 'set' | 'get' | 'safe' | 'in'
type Op = { kind: Kind; key: string; value: number; id: number }

const START: Entry[] = [
  { key: 'kopi', value: 1.2 },
  { key: 'teh', value: 1.1 },
  { key: 'bandung', value: 1.6 },
  { key: 'teh-c', value: 1.4 },
]
const PRESETS = ['kopi', 'teh', 'milo', 'sirap', 'bandung']
const MAX_CAP = 16

const letterValue = (c: string) => {
  const l = c.toLowerCase()
  if (l >= 'a' && l <= 'z') return l.charCodeAt(0) - 96
  if (c >= '0' && c <= '9') return Number(c)
  return 0
}
const toyHash = (key: string) => [...key].reduce((t, c) => t + letterValue(c), 0)
/** CPython keeps a dict's table at most about two-thirds full. */
const usable = (cap: number) => Math.floor((cap * 2) / 3)
const fmtVal = (v: number) => v.toFixed(1)
const q = (k: string) => `'${k}'`

function buildTable(entries: Entry[], cap: number): (Entry | null)[] {
  const t: (Entry | null)[] = Array(cap).fill(null)
  for (const e of entries) {
    let i = toyHash(e.key) % cap
    while (t[i]) i = (i + 1) % cap
    t[i] = e
  }
  return t
}

function probe(table: (Entry | null)[], key: string) {
  const cap = table.length
  const checked: number[] = []
  let i = toyHash(key) % cap
  for (let n = 0; n < cap; n++) {
    checked.push(i)
    const e = table[i]
    if (!e) return { checked, found: false }
    if (e.key === key) return { checked, found: true }
    i = (i + 1) % cap
  }
  return { checked, found: false }
}

interface Result {
  entries: Entry[]
  cap: number
  checked: number[]
  found: boolean
  grew: boolean
  full: boolean
  code: string
  output: { text: string; kind: 'out' | 'err' | 'none' }
}

function apply(entries: Entry[], cap: number, op: Op): Result {
  const table = buildTable(entries, cap)
  const tr = probe(table, op.key)
  const base = { entries, cap, checked: tr.checked, found: tr.found, grew: false, full: false }
  const hit = entries.find((e) => e.key === op.key)
  switch (op.kind) {
    case 'get':
      return { ...base, code: `print(prices[${q(op.key)}])`, output: hit ? { text: fmtVal(hit.value), kind: 'out' } : { text: `KeyError: ${q(op.key)}`, kind: 'err' } }
    case 'safe':
      return { ...base, code: `print(prices.get(${q(op.key)}))`, output: { text: hit ? fmtVal(hit.value) : 'None', kind: 'out' } }
    case 'in':
      return { ...base, code: `print(${q(op.key)} in prices)`, output: { text: hit ? 'True' : 'False', kind: 'out' } }
    case 'set': {
      const code = `prices[${q(op.key)}] = ${fmtVal(op.value)}`
      if (hit) {
        return { ...base, entries: entries.map((e) => (e.key === op.key ? { ...e, value: op.value } : e)), code, output: { text: '', kind: 'none' } }
      }
      let newCap = cap
      let grew = false
      if (entries.length + 1 > usable(cap)) {
        if (cap * 2 > MAX_CAP) return { ...base, full: true, code, output: { text: '', kind: 'none' } }
        newCap = cap * 2
        grew = true
      }
      const t2 = buildTable(entries, newCap)
      const tr2 = probe(t2, op.key)
      return { entries: [...entries, { key: op.key, value: op.value }], cap: newCap, checked: tr2.checked, found: false, grew, full: false, code, output: { text: '', kind: 'none' } }
    }
  }
}

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function DictLookup() {
  const [state, setState] = useState<{ entries: Entry[]; cap: number; res: Result; op: Op }>(() => {
    const op: Op = { kind: 'get', key: 'kopi', value: 1.2, id: 0 }
    return { entries: START, cap: 8, res: apply(START, 8, op), op }
  })
  const [key, setKey] = useState('milo')
  const [value, setValue] = useState(1.5)
  const { res, op } = state
  const total = 2 + res.checked.length
  const [phase, setPhase] = useState(total)

  // Animate: 0 = key arrives, 1 = hash computed, 2.. = each slot checked in turn.
  useEffect(() => {
    if (op.id === 0 || reducedMotion()) {
      setPhase(2 + res.checked.length)
      return
    }
    setPhase(0)
    let p = 0
    const t = window.setInterval(() => {
      p += 1
      setPhase(p)
      if (p >= 2 + res.checked.length) window.clearInterval(t)
    }, 520)
    return () => window.clearInterval(t)
  }, [op.id, res.checked.length])

  const run = (kind: Kind) => {
    if (!key) return
    const next: Op = { kind, key, value, id: op.id + 1 }
    const r = apply(state.entries, state.cap, next)
    setState({ entries: r.entries, cap: r.cap, res: r, op: next })
  }
  const reset = () => {
    const o: Op = { kind: 'get', key: 'kopi', value: 1.2, id: op.id + 1 }
    setState({ entries: START, cap: 8, res: apply(START, 8, o), op: o })
    setKey('milo')
  }

  const table = useMemo(() => buildTable(res.entries, res.cap), [res.entries, res.cap])
  const done = phase >= total

  // ---------- layout ----------
  const [ref, measured] = useContainerWidth<HTMLDivElement>(560)
  const width = Math.max(300, Math.min(measured, 640))
  const narrow = width < 520
  const cols = narrow ? 4 : 8
  const rows = res.cap / cols
  const pad = 2
  const gap = 6
  const cellW = (width - 2 * pad - (cols - 1) * gap) / cols
  const cellH = 52
  const boxTop = 2
  const boxH = 92
  const slotsTop = boxTop + boxH + 44
  const height = slotsTop + rows * (cellH + gap) - gap + 4
  const cellX = (i: number) => pad + (i % cols) * (cellW + gap)
  const cellY = (i: number) => slotsTop + Math.floor(i / cols) * (cellH + gap)

  const h = toyHash(op.key)
  const home = h % res.cap
  const letters = [...op.key]
  const chipW = (op.key.length + 2) * 8 + 14
  const lx0 = 10 + chipW + 16
  const cellL = 20

  const checkedUpTo = Math.max(0, phase - 1) // number of slots highlighted so far
  const lastIdx = res.checked[res.checked.length - 1]

  const slotStyle = (i: number) => {
    const order = res.checked.indexOf(i)
    if (order < 0 || order >= checkedUpTo) return { fill: 'var(--surface)', stroke: 'var(--rule)', dash: undefined as string | undefined }
    const isLast = order === res.checked.length - 1
    if (!isLast) return { fill: 'color-mix(in srgb, var(--viz-2) 14%, var(--surface))', stroke: 'var(--viz-2)', dash: undefined }
    if (op.kind === 'set') return { fill: 'color-mix(in srgb, var(--viz-pos) 18%, var(--surface))', stroke: 'var(--viz-pos)', dash: undefined }
    if (res.found) return { fill: 'color-mix(in srgb, var(--viz-pos) 18%, var(--surface))', stroke: 'var(--viz-pos)', dash: undefined }
    return { fill: 'color-mix(in srgb, var(--viz-neg) 10%, var(--surface))', stroke: 'var(--viz-neg)', dash: '5 4' }
  }

  // Before the animation reaches a newly inserted key's slot, draw that slot as it was (empty).
  const hiddenNew = op.kind === 'set' && !res.found && !done && !res.full ? lastIdx : -1

  let status: ReactNode
  if (res.full) status = <>This demo's table is full (it holds at most 10 keys). Press <b>Reset</b> to start again.</>
  else if (!done) status = phase < 2 ? <>Hashing {q(op.key)}…</> : <>Checking slot {res.checked[Math.min(checkedUpTo, res.checked.length) - 1]}…</>
  else {
    const probes = res.checked.length
    const skipped = res.checked.slice(0, -1).map((i) => q(table[i]?.key ?? ''))
    const skipText = probes > 1 ? <>Slot {res.checked[0]} holds {skipped.join(', then ')}, a different key, so Python tries the next slot. </> : null
    if (op.kind === 'set') {
      status = res.found ? (
        <>{q(op.key)} is already in slot {lastIdx}, so its value is <b>replaced</b> by {fmtVal(op.value)}. Keys are unique.</>
      ) : (
        <>
          {res.grew ? <>The table was two-thirds full, so Python first moved every key into a <b>bigger table of {res.cap} slots</b> (now hash % {res.cap}). </> : null}
          {skipText}
          {q(op.key)} is stored in the empty slot {lastIdx}.
        </>
      )
    } else if (res.found) {
      status = (
        <>
          {skipText}Slot {lastIdx} holds {q(op.key)}: found after checking <b>{probes} slot{probes > 1 ? 's' : ''}</b>, without looking at the other keys.
        </>
      )
    } else {
      status = (
        <>
          {skipText}Slot {lastIdx} is <b>empty</b>, so {q(op.key)} is not a key.{' '}
          {op.kind === 'get' ? <>Square brackets raise a <b>KeyError</b>.</> : op.kind === 'safe' ? <>.get() returns <b>None</b> instead of crashing.</> : <>So <code>in</code> gives False.</>}
        </>
      )
    }
  }

  // A list of (key, value) pairs must be scanned from the front: position of the key, or every item if it is missing.
  const isNewKey = op.kind === 'set' && !res.found
  const pos = res.entries.findIndex((e) => e.key === op.key)
  const listChecks = pos >= 0 && !isNewKey ? pos + 1 : isNewKey ? res.entries.length - 1 : res.entries.length
  const printed = `{${res.entries.map((e) => `${q(e.key)}: ${fmtVal(e.value)}`).join(', ')}}`

  const arrowTarget = res.checked[0]
  const ax = cellX(arrowTarget) + cellW / 2
  const ay = cellY(arrowTarget)
  const sx = Math.min(width - 40, Math.max(40, ax))
  const arrowRow = Math.floor(arrowTarget / cols)
  const arrowCol = arrowTarget % cols
  const dir = arrowCol > 0 ? 1 : -1 // +1: enter from the left edge, -1: from the right edge
  const gx = arrowCol > 0 ? cellX(arrowTarget) - gap / 2 : cellX(arrowTarget) + cellW + gap / 2
  const edge = arrowCol > 0 ? cellX(arrowTarget) : cellX(arrowTarget) + cellW
  const my = cellY(arrowTarget) + cellH / 2

  return (
    <Figure
      title="How a dictionary finds a key without searching"
      caption={
        <>
          Pick or type a key, then run one of the four lines of code. Watch the key become a number, the number pick a slot, and Python jump straight
          to it. Try <span className={s.mono}>'milo'</span> with <span className={s.mono}>prices[…]</span> and then with <span className={s.mono}>.get(…)</span>, then
          store it. Add a few more keys and see the table grow. (The hash here is a toy you can do by hand; Python's real <span className={s.mono}>hash()</span> is more
          scrambled, but the idea is the same.)
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`Hash table with ${res.cap} slots. ${q(op.key)} hashes to ${h}, and ${h} % ${res.cap} = ${home}.`} style={{ display: 'block', maxWidth: width, margin: '0 auto' }}>
          {/* hash box */}
          <rect x={pad} y={boxTop} width={width - 2 * pad} height={boxH} rx={12} style={{ fill: 'color-mix(in srgb, var(--viz-5) 8%, var(--surface))', stroke: 'color-mix(in srgb, var(--viz-5) 55%, var(--surface))', strokeWidth: 1.5 }} />
          <text x={12} y={boxTop + 18} style={{ fill: 'var(--ink-2)', fontSize: 11.5, fontWeight: 700 }}>
            {narrow ? 'toy hash: add letter values (a=1 … z=26)' : 'toy hash: add up the letter values (a = 1, b = 2, … z = 26)'}
          </text>
          <rect x={10} y={boxTop + 30} width={chipW} height={26} rx={13} style={{ fill: 'var(--surface)', stroke: 'var(--viz-1)', strokeWidth: 2 }} />
          <text x={10 + chipW / 2} y={boxTop + 47.5} textAnchor="middle" className={s.svgText} style={{ fill: 'var(--viz-1)', fontSize: 13, fontWeight: 700 }}>
            {q(op.key)}
          </text>
          {letters.map((c, i) => (
            <g key={i}>
              <text x={lx0 + i * cellL + cellL / 2} y={boxTop + 40} textAnchor="middle" className={s.svgText} style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 700 }}>
                {c}
              </text>
              <text x={lx0 + i * cellL + cellL / 2} y={boxTop + 58} textAnchor="middle" className={s.svgText} style={{ fill: 'var(--viz-5)', fontSize: 11.5, opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.3s' }}>
                {letterValue(c)}
              </text>
            </g>
          ))}
          <text x={12} y={boxTop + 82} className={s.svgText} style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 700, opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.3s' }}>
            {`sum = ${h}  →  ${h} % ${res.cap} = ${home}  →  slot ${home}`}
          </text>

          {/* arrow from the hash box to the home slot */}
          {phase >= 2 && !res.full && arrowRow === 0 && (
            <g>
              <path d={`M${sx},${boxTop + boxH} C${sx},${boxTop + boxH + 26} ${ax},${ay - 26} ${ax},${ay - 9}`} style={{ fill: 'none', stroke: 'var(--viz-5)', strokeWidth: 2.5 }} />
              <path d={`M${ax},${ay - 2} l-6,-9 l12,0 Z`} style={{ fill: 'var(--viz-5)' }} />
            </g>
          )}
          {phase >= 2 && !res.full && arrowRow > 0 && (
            // Route the arrow down the gap between two columns, then turn into the slot from the side.
            <g>
              <path d={`M${gx},${boxTop + boxH} L${gx},${my - 8} Q${gx},${my} ${gx + dir * 6},${my} L${edge - dir * 8},${my}`} style={{ fill: 'none', stroke: 'var(--viz-5)', strokeWidth: 2.5 }} />
              <path d={`M${edge - dir * 1},${my} l${-dir * 9},-6 l0,12 Z`} style={{ fill: 'var(--viz-5)' }} />
            </g>
          )}

          {/* slots */}
          {table.map((e, i) => {
            const st = slotStyle(i)
            const order = res.checked.indexOf(i)
            const shown = i === hiddenNew ? null : e
            const x = cellX(i)
            const y = cellY(i)
            return (
              <g key={`${res.cap}-${i}`}>
                <rect x={x} y={y} width={cellW} height={cellH} rx={8} style={{ fill: st.fill, stroke: st.stroke, strokeWidth: order >= 0 && order < checkedUpTo ? 2.5 : 1.3, strokeDasharray: st.dash }} />
                <text x={x + 6} y={y + 13} style={{ fill: 'var(--ink-2)', fontSize: 10.5, fontWeight: 700 }}>
                  {i}
                </text>
                {order >= 0 && order < checkedUpTo && res.checked.length > 1 && (
                  <g>
                    <circle cx={x + cellW - 10} cy={y + 10} r={7.5} style={{ fill: st.stroke }} />
                    <text x={x + cellW - 10} y={y + 13.5} textAnchor="middle" style={{ fill: 'var(--surface)', fontSize: 10, fontWeight: 800 }}>
                      {order + 1}
                    </text>
                  </g>
                )}
                {shown ? (
                  <>
                    <text x={x + cellW / 2} y={y + 30} textAnchor="middle" className={s.svgText} style={{ fill: 'var(--ink)', fontSize: Math.min(12, (cellW - 6) / ((shown.key.length + 2) * 0.6)), fontWeight: 700 }}>
                      {q(shown.key)}
                    </text>
                    <text x={x + cellW / 2} y={y + 45} textAnchor="middle" className={s.svgText} style={{ fill: 'var(--ink-2)', fontSize: 12 }}>
                      {fmtVal(shown.value)}
                    </text>
                  </>
                ) : (
                  <text x={x + cellW / 2} y={y + 36} textAnchor="middle" style={{ fill: 'var(--viz-muted)', fontSize: 11 }}>
                    empty
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        <div className={s.status} aria-live="polite">
          {status}
        </div>

        <pre className={s.code} aria-label="Python console">
          <span className={s.prompt}>{'>>> '}</span>
          {res.code}
          {'\n'}
          {done && res.output.kind !== 'none' && <span className={res.output.kind === 'err' ? s.err : s.out}>{res.output.text}{'\n'}</span>}
          {!done && res.output.kind !== 'none' && <span className={s.comment}>…{'\n'}</span>}
          <span className={s.prompt}>{'>>> '}</span>
          print(prices){'\n'}
          <span className={s.out}>{printed}</span>
        </pre>

        <div className={s.row}>
          <span className={s.rowLabel}>key</span>
          <input
            className={s.input}
            aria-label="Key to use"
            value={key}
            onChange={(e) => setKey(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 8))}
          />
          {PRESETS.map((k) => (
            <button key={k} type="button" className={`${s.chip} ${k === key ? s.chipOn : ''}`} onClick={() => setKey(k)}>
              {q(k)}
            </button>
          ))}
        </div>
        <Controls>
          <Slider label="value to store" value={value} min={0.5} max={3} step={0.1} onChange={(v) => setValue(Math.round(v * 10) / 10)} format={fmtVal} />
        </Controls>
        <div className={s.row}>
          <Button primary onClick={() => run('get')} disabled={!key}>
            <span className={s.mono}>prices[{q(key)}]</span>
          </Button>
          <Button onClick={() => run('safe')} disabled={!key}>
            <span className={s.mono}>prices.get({q(key)})</span>
          </Button>
          <Button onClick={() => run('in')} disabled={!key}>
            <span className={s.mono}>{q(key)} in prices</span>
          </Button>
          <Button onClick={() => run('set')} disabled={!key}>
            <span className={s.mono}>
              prices[{q(key)}] = {fmtVal(value)}
            </span>
          </Button>
          <Button onClick={reset}>Reset</Button>
        </div>
        <Readout
          items={[
            ['slots checked', done ? String(res.checked.length) : '…'],
            ['a list of pairs would check', `${listChecks} item${listChecks === 1 ? '' : 's'}`],
            ['table', `${res.entries.length} keys in ${res.cap} slots`],
          ]}
        />
      </div>
    </Figure>
  )
}
