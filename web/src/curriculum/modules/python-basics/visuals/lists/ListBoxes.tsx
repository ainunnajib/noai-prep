import { useState } from 'react'
import { Figure, Controls, Slider, useContainerWidth } from '../../../../../kit'
import { Py, highlightPy } from '../decisions/pyCode'
import ui from '../decisions/ui.module.css'
import s from './lists.module.css'

/*
  A list as a row of indexed boxes. Every button runs one real list operation (with Python's
  exact behaviour and error messages): reading and assigning nums[i], append, insert, pop,
  remove and + concatenation. Boxes slide to their new positions, so you can watch insert and
  pop shift everything after them. Out-of-range indices flash a red IndexError.
*/

interface Item {
  id: number
  v: number
}
interface LogEntry {
  code: string
  res: string
  err?: boolean
}

const START = [3, 1, 4, 1, 5]
const POOL = [9, 2, 6, 8, 7, 0]
const MAX = 8
const SLOTS = 9

export default function ListBoxes() {
  const [items, setItems] = useState<Item[]>(START.map((v, id) => ({ id, v })))
  const [nextId, setNextId] = useState(START.length)
  const [poolIdx, setPoolIdx] = useState(0)
  const [i, setI] = useState(2)
  const [log, setLog] = useState<LogEntry[]>([{ code: 'nums[2]', res: '→ 4' }])
  const [fresh, setFresh] = useState<number[]>([])
  const [readId, setReadId] = useState<number | null>(null)
  const [tick, setTick] = useState(0)
  const [lastErr, setLastErr] = useState(false)
  const [ref, w] = useContainerWidth<HTMLDivElement>(560)

  const n = items.length
  const x = POOL[poolIdx % POOL.length]
  const y = POOL[(poolIdx + 1) % POOL.length]
  const k = i < 0 ? i + n : i
  const valid = k >= 0 && k < n
  const show = (arr: Item[]) => `[${arr.map((it) => it.v).join(', ')}]`

  const record = (code: string, res: string, err = false) => {
    setLog((l) => [{ code, res, err }, ...l].slice(0, 4))
    setLastErr(err)
    setTick((v) => v + 1)
  }
  const commit = (next: Item[], code: string, res: string, newIds: number[] = []) => {
    setItems(next)
    setFresh(newIds)
    setReadId(null)
    record(code, res)
  }
  const fail = (code: string, msg: string) => {
    setFresh([])
    setReadId(null)
    record(code, msg, true)
  }

  const ops: { code: string; run: () => void; disabled?: boolean }[] = [
    {
      code: `nums[${i}]`,
      run: () => {
        if (!valid) return fail(`nums[${i}]`, 'IndexError: list index out of range')
        setReadId(items[k].id)
        setFresh([])
        record(`nums[${i}]`, `→ ${items[k].v}`)
      },
    },
    {
      code: `nums[${i}] = ${x}`,
      run: () => {
        if (!valid) return fail(`nums[${i}] = ${x}`, 'IndexError: list assignment index out of range')
        const next = items.map((it, j) => (j === k ? { id: nextId, v: x } : it))
        setNextId(nextId + 1)
        setPoolIdx(poolIdx + 1)
        commit(next, `nums[${i}] = ${x}`, `nums is now ${show(next)}`, [nextId])
      },
    },
    {
      code: `nums.append(${x})`,
      disabled: n >= MAX,
      run: () => {
        const next = [...items, { id: nextId, v: x }]
        setNextId(nextId + 1)
        setPoolIdx(poolIdx + 1)
        commit(next, `nums.append(${x})`, `nums is now ${show(next)}`, [nextId])
      },
    },
    {
      code: `nums.insert(${i}, ${x})`,
      disabled: n >= MAX,
      run: () => {
        // Python clamps insert positions instead of raising an error
        const at = i < 0 ? Math.max(0, n + i) : Math.min(i, n)
        const next = [...items.slice(0, at), { id: nextId, v: x }, ...items.slice(at)]
        setNextId(nextId + 1)
        setPoolIdx(poolIdx + 1)
        commit(next, `nums.insert(${i}, ${x})`, `nums is now ${show(next)}`, [nextId])
      },
    },
    {
      code: 'nums.pop()',
      run: () => {
        if (n === 0) return fail('nums.pop()', 'IndexError: pop from empty list')
        const v = items[n - 1].v
        const next = items.slice(0, -1)
        commit(next, 'nums.pop()', `returns ${v}; nums is now ${show(next)}`)
      },
    },
    {
      code: `nums.pop(${i})`,
      run: () => {
        if (n === 0) return fail(`nums.pop(${i})`, 'IndexError: pop from empty list')
        if (!valid) return fail(`nums.pop(${i})`, 'IndexError: pop index out of range')
        const v = items[k].v
        const next = items.filter((_, j) => j !== k)
        commit(next, `nums.pop(${i})`, `returns ${v}; nums is now ${show(next)}`)
      },
    },
    {
      code: `nums = nums + [${x}, ${y}]`,
      disabled: n + 2 > MAX,
      run: () => {
        // + builds a brand-new list, so every box is new
        const next = [...items, { id: 0, v: x }, { id: 0, v: y }].map((it, j) => ({ id: nextId + j, v: it.v }))
        setNextId(nextId + next.length)
        setPoolIdx(poolIdx + 2)
        commit(next, `nums = nums + [${x}, ${y}]`, `a new list ${show(next)}`, next.map((it) => it.id))
      },
    },
    {
      code: 'nums.remove(1)',
      run: () => {
        const at = items.findIndex((it) => it.v === 1)
        if (at < 0) return fail('nums.remove(1)', 'ValueError: list.remove(x): x not in list')
        const next = items.filter((_, j) => j !== at)
        commit(next, 'nums.remove(1)', `removes the first 1 (at index ${at}); nums is now ${show(next)}`)
      },
    },
  ]

  const reset = () => {
    setItems(START.map((v, id) => ({ id: id + nextId, v })))
    setNextId(nextId + START.length)
    setPoolIdx(0)
    setLog([])
    setFresh([])
    setReadId(null)
    setLastErr(false)
  }

  // geometry
  const W = Math.max(280, w)
  const sw = Math.min(62, Math.floor(W / SLOTS))
  const bw = sw - 6
  const x0 = Math.max(0, (W - sw * SLOTS) / 2)
  const left = (slot: number) => x0 + slot * sw + 3
  const ghostSlot = !valid && i >= n && i < SLOTS ? i : null
  const H = 22 + bw + 26

  return (
    <Figure
      wide
      title="A list is a row of numbered boxes"
      caption={
        <>
          Choose an index <code>i</code> with the slider, then press the operations. Watch <code>insert</code> and <code>pop</code> shift every box
          after them, and notice which operations change <code>nums</code> in place and which give back a value. Now slide <code>i</code> to 10 and
          press <code>nums[10]</code>: every valid index lies between 0 and <code>len(nums) - 1</code> (or −len to −1 from the end), and anything else
          is an <code>IndexError</code>.
        </>
      }
    >
      <div className={ui.wrap}>
        <div className={ui.bigExpr} style={{ fontSize: '0.98rem' }} aria-live="polite">
          <Py>{`nums = ${show(items)}`}</Py>
          <span style={{ fontSize: 'var(--step--1)', color: 'var(--ink-2)', fontFamily: 'var(--font-body)' }}>
            <Py>{`len(nums)`}</Py> is {n}
            {n > 0 ? `, valid indices 0 to ${n - 1}` : ', so no index is valid'}
          </span>
        </div>
        <div ref={ref} className={s.track} style={{ height: H }} role="img" aria-label={`The list nums with ${n} items: ${items.map((it) => it.v).join(', ')}`}>
          {items.map((it, j) => (
            <div key={it.id}>
              <div className={`${s.idx} ${valid && j === k && i >= 0 ? s.idxSel : ''}`} style={{ left: left(j), width: bw, top: 2 }}>
                {j}
              </div>
              <div
                key={readId === it.id ? `r${tick}` : 'b'}
                className={`${s.box} ${valid && j === k ? s.boxSel : ''} ${fresh.includes(it.id) ? s.boxNew : ''} ${readId === it.id ? s.boxRead : ''}`}
                style={{ left: left(j), width: bw, height: bw, fontSize: bw > 40 ? '1.1rem' : '0.95rem' }}
              >
                {it.v}
              </div>
              <div className={`${s.idx} ${valid && j === k && i < 0 ? s.idxSel : ''}`} style={{ left: left(j), width: bw, top: 22 + bw + 6 }}>
                {j - n}
              </div>
            </div>
          ))}
          {ghostSlot !== null && (
            <div key={`g${tick}`} className={`${s.ghost} ${lastErr ? s.flashBad : ''}`} style={{ left: left(ghostSlot), width: bw, height: bw }}>
              <span>none</span>
            </div>
          )}
          {ghostSlot !== null && (
            <div className={`${s.idx} ${s.idxSel}`} style={{ left: left(ghostSlot), width: bw, top: 2, color: 'var(--bad)' }}>
              {ghostSlot}
            </div>
          )}
        </div>

        <Controls>
          <Slider label={<>index <code>i</code></>} value={i} min={-10} max={10} step={1} onChange={setI} />
          <div style={{ fontSize: 'var(--step--1)', color: 'var(--ink-2)' }}>
            next value to add: <Py>{`x = ${x}`}</Py>
          </div>
        </Controls>

        <div className={s.ops}>
          {ops.map((op) => (
            <button key={op.code.replace(/-?\d+/g, '#')} type="button" className={`${s.op} ${op.code.includes('+') ? s.opWide : ''}`} onClick={op.run} disabled={op.disabled} title={op.disabled ? 'This demo holds at most 8 items' : undefined}>
              {highlightPy(op.code)}
            </button>
          ))}
        </div>

        <div className={ui.pane}>
          <div className={ui.bar}>
            <span>What happened (newest first)</span>
            <button type="button" className="btn btn-small btn-ghost" onClick={reset} style={{ padding: '0 0.4rem' }}>
              Reset
            </button>
          </div>
          <ol className={s.log} aria-live="polite">
            {log.length === 0 && <li className={ui.muted}>Press an operation above.</li>}
            {log.map((e, j) => (
              <li key={`${tick - j}`} className={`${s.logRow} ${j === 0 ? s.logNew : s.logOld}`}>
                <span>{highlightPy(e.code)}</span>
                <span className={`${e.err ? s.logErr : s.logRes} ${j === 0 && e.err ? s.flashBad : ''}`} style={{ display: 'inline-block' }}>
                  {e.res}
                </span>
              </li>
            ))}
          </ol>
        </div>
        {n >= MAX && <div className={ui.legend}>The demo stops at {MAX} items so the boxes fit on a phone; real lists can grow as long as memory allows.</div>}
      </div>
    </Figure>
  )
}
