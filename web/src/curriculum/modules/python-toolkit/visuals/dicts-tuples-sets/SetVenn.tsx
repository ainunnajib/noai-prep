import { useId, useState } from 'react'
import { Figure, Readout, Segmented, Button, useContainerWidth } from '../../../../../kit'
import s from './dts.module.css'

/*
  Sets as Venn diagrams. Two CCA sign-up lists may contain the same name twice; set() keeps
  each name once. The chosen operator (|, &, -, ^) lights up its region of the diagram.
*/

const NAMES = ['Aisha', 'Ben', 'Chen', 'Dev', 'Ella', 'Farid']
const MAX_LIST = 12
type OpKey = 'or' | 'and' | 'aminus' | 'bminus' | 'xor'
const OPS: { value: OpKey; label: string; code: string; method: string; words: string }[] = [
  { value: 'or', label: 'A | B', code: 'A | B', method: 'A.union(B)', words: 'in A or B (or both)' },
  { value: 'and', label: 'A & B', code: 'A & B', method: 'A.intersection(B)', words: 'in both A and B' },
  { value: 'aminus', label: 'A - B', code: 'A - B', method: 'A.difference(B)', words: 'in A but not in B' },
  { value: 'bminus', label: 'B - A', code: 'B - A', method: 'B.difference(A)', words: 'in B but not in A' },
  { value: 'xor', label: 'A ^ B', code: 'A ^ B', method: 'A.symmetric_difference(B)', words: 'in exactly one of them' },
]

const uniq = (xs: string[]) => NAMES.filter((n) => xs.includes(n))
const pyList = (xs: string[]) => `[${xs.map((x) => `'${x}'`).join(', ')}]`
const pySet = (xs: string[]) => (xs.length ? `{${xs.map((x) => `'${x}'`).join(', ')}}` : 'set()')

export default function SetVenn() {
  const [listA, setListA] = useState<string[]>(['Aisha', 'Ben', 'Chen', 'Ben'])
  const [listB, setListB] = useState<string[]>(['Chen', 'Dev', 'Ella', 'Dev'])
  const [op, setOp] = useState<OpKey>('and')
  const [flash, setFlash] = useState<{ which: 'A' | 'B'; name: string; dup: boolean } | null>(null)
  const uid = useId().replace(/:/g, '')

  const A = uniq(listA)
  const B = uniq(listB)
  const onlyA = A.filter((n) => !B.includes(n))
  const both = A.filter((n) => B.includes(n))
  const onlyB = B.filter((n) => !A.includes(n))
  const lit = {
    a: op === 'or' || op === 'aminus' || op === 'xor',
    ab: op === 'or' || op === 'and',
    b: op === 'or' || op === 'bminus' || op === 'xor',
  }
  const result = [...(lit.a ? onlyA : []), ...(lit.ab ? both : []), ...(lit.b ? onlyB : [])].sort((x, y) => NAMES.indexOf(x) - NAMES.indexOf(y))
  const meta = OPS.find((o) => o.value === op)!

  const signUp = (which: 'A' | 'B', name: string) => {
    const list = which === 'A' ? listA : listB
    if (list.length >= MAX_LIST) return
    setFlash({ which, name, dup: list.includes(name) })
    ;(which === 'A' ? setListA : setListB)([...list, name])
  }
  const clear = (which: 'A' | 'B') => {
    ;(which === 'A' ? setListA : setListB)([])
    setFlash(null)
  }

  // ---------- layout ----------
  const [ref, measured] = useContainerWidth<HTMLDivElement>(520)
  const width = Math.max(290, Math.min(measured, 560))
  const r = Math.min(96, (width - 12) / 3.1)
  const d = r * 1.08
  const cy = r + 28
  const height = cy + r + 10
  const cxA = width / 2 - d / 2
  const cxB = width / 2 + d / 2
  const colA = (cxA - r + (cxB - r)) / 2
  const colAB = (cxA + cxB) / 2
  const colB = (cxA + r + (cxB + r)) / 2
  const lineH = 18
  const litFill = 'color-mix(in srgb, var(--viz-3) 34%, var(--surface))'
  const fontSize = r < 85 ? 12 : 13

  const column = (names: string[], x: number, on: boolean) =>
    names.map((n, i) => (
      <text
        key={n}
        x={x}
        y={cy + (i - (names.length - 1) / 2) * lineH + 4.5}
        textAnchor="middle"
        style={{ fill: on ? 'var(--ink)' : 'var(--viz-muted)', fontWeight: on ? 800 : 500, fontSize }}
      >
        {n}
      </text>
    ))

  const chipRow = (which: 'A' | 'B', list: string[]) => (
    <div className={s.row}>
      <span className={s.rowLabel}>{which === 'A' ? 'Sign up for robotics (A):' : 'Sign up for chess (B):'}</span>
      {NAMES.map((n) => {
        const c = list.filter((x) => x === n).length
        return (
          <button key={n} type="button" className={`${s.chip} ${c ? s.chipOn : ''}`} onClick={() => signUp(which, n)} aria-label={`Add ${n} to the ${which === 'A' ? 'robotics' : 'chess'} list`}>
            {n}
            {c > 1 && <span className={s.count}>×{c}</span>}
          </button>
        )
      })}
      <Button onClick={() => clear(which)}>Clear</Button>
    </div>
  )

  return (
    <Figure
      title="Sets keep each item once, and their operators are Venn diagrams"
      caption={
        <>
          Tap names to add them to each club's sign-up <i>list</i>. Tap a name twice: the list grows, but the set does not. Then switch the operator and watch
          which region lights up. Python may print a set's items in any order; they are shown alphabetically here.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <pre className={s.code}>
          robotics = {pyList(listA)}
          {'\n'}chess = {pyList(listB)}
          {'\n'}A = set(robotics) <span className={s.comment}># {pySet(A)}</span>
          {'\n'}B = set(chess) <span className={s.comment}># {pySet(B)}</span>
          {'\n'}
          <span className={s.prompt}>{'>>> '}</span>
          {meta.code}
          <span className={s.comment}>{`   # same as ${meta.method}`}</span>
          {'\n'}
          <span className={s.out}>{pySet(result)}</span>
        </pre>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`Venn diagram. A only: ${onlyA.join(', ') || 'nobody'}. Both: ${both.join(', ') || 'nobody'}. B only: ${onlyB.join(', ') || 'nobody'}. ${meta.code} = ${pySet(result)}.`} style={{ display: 'block', maxWidth: width, margin: '0 auto' }}>
          <defs>
            <mask id={`${uid}-notB`}>
              <rect x={0} y={0} width={width} height={height} style={{ fill: 'white' }} />
              <circle cx={cxB} cy={cy} r={r} style={{ fill: 'black' }} />
            </mask>
            <mask id={`${uid}-notA`}>
              <rect x={0} y={0} width={width} height={height} style={{ fill: 'white' }} />
              <circle cx={cxA} cy={cy} r={r} style={{ fill: 'black' }} />
            </mask>
            <clipPath id={`${uid}-inB`}>
              <circle cx={cxB} cy={cy} r={r} />
            </clipPath>
          </defs>
          {lit.a && <circle cx={cxA} cy={cy} r={r} mask={`url(#${uid}-notB)`} style={{ fill: litFill }} />}
          {lit.b && <circle cx={cxB} cy={cy} r={r} mask={`url(#${uid}-notA)`} style={{ fill: litFill }} />}
          {lit.ab && <circle cx={cxA} cy={cy} r={r} clipPath={`url(#${uid}-inB)`} style={{ fill: litFill }} />}
          <circle cx={cxA} cy={cy} r={r} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 2.5 }} />
          <circle cx={cxB} cy={cy} r={r} style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 2.5 }} />
          <text x={cxA - r * 0.55} y={18} textAnchor="middle" style={{ fill: 'var(--viz-1)', fontWeight: 800, fontSize: 13 }}>
            A (robotics)
          </text>
          <text x={cxB + r * 0.55} y={18} textAnchor="middle" style={{ fill: 'var(--viz-2)', fontWeight: 800, fontSize: 13 }}>
            B (chess)
          </text>
          {column(onlyA, colA, lit.a)}
          {column(both, colAB, lit.ab)}
          {column(onlyB, colB, lit.b)}
        </svg>

        <div className={s.status} aria-live="polite">
          {flash ? (
            flash.dup ? (
              <>
                <b>{flash.name}</b> was already in the {flash.which === 'A' ? 'robotics' : 'chess'} list. The list now has {flash.which === 'A' ? listA.length : listB.length} entries,
                {` but set ${flash.which} still has ${flash.which === 'A' ? A.length : B.length}: a set keeps each item only once.`}
              </>
            ) : (
              <>
                <b>{flash.name}</b> joins set {flash.which}.
              </>
            )
          ) : (
            <>
              <span className={s.mono}>{meta.code}</span> keeps the names {meta.words}.
            </>
          )}
        </div>

        {chipRow('A', listA)}
        {chipRow('B', listB)}
        <Segmented label="Operator" value={op} onChange={(v) => { setOp(v); setFlash(null) }} options={OPS.map((o) => ({ value: o.value, label: <span className={s.mono}>{o.label}</span> }))} />
        <Readout
          items={[
            ['len(robotics)', String(listA.length)],
            ['len(A)', String(A.length)],
            ['len(chess)', String(listB.length)],
            ['len(B)', String(B.length)],
            [`len(${meta.code})`, String(result.length)],
          ]}
        />
      </div>
    </Figure>
  )
}
