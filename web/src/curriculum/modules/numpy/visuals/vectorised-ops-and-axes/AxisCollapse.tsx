import { useEffect, useState, type CSSProperties } from 'react'
import { Figure, Controls, Segmented, Toggle, Button, useContainerWidth } from '../../../../../kit'
import { cellStyle, mono, npPrint, OutputBox } from './Cells'

/*
  A 3x4 mark sheet (3 students x 4 subjects) collapsing along axis 0 (down the rows), axis 1
  (across the columns) or everything. Copies of the cells fly into the result cells, so the
  learner sees which numbers are combined. The named axis is the one that disappears.
*/

const MARKS = [
  [6, 4, 6, 8],
  [8, 8, 10, 6],
  [7, 9, 8, 4],
]
const STUDENTS = ['Aisyah', 'Bala', 'Chloe']
const SUBJECTS = ['Math', 'Sci', 'Eng', 'MT']
const R = 3
const C = 4

type Axis = 0 | 1 | 'none'
type Op = 'sum' | 'mean' | 'max' | 'argmax'

function reduce(values: number[], op: Op): number {
  if (op === 'sum') return values.reduce((a, b) => a + b, 0)
  if (op === 'mean') return values.reduce((a, b) => a + b, 0) / values.length
  if (op === 'max') return Math.max(...values)
  let best = 0
  values.forEach((v, k) => {
    if (v > values[best]) best = k
  })
  return best
}

const PHRASE: Record<Op, [string, string, string]> = {
  sum: ["each subject's total over the 3 students: one number per column", "each student's total over the 4 subjects: one number per row", 'the grand total of all 12 marks: one number'],
  mean: ["each subject's average over the 3 students: one number per column", "each student's average over the 4 subjects: one number per row", 'the average of all 12 marks: one number'],
  max: ['the top mark in each subject: one number per column', "each student's best mark: one number per row", 'the highest mark anywhere: one number'],
  argmax: [
    'WHICH student topped each subject: a row index per column',
    'WHICH subject is each student’s best: a column index per row',
    'WHERE the highest mark is, counted along the flattened array (row 1, column 2 is position 1×4 + 2 = 6)',
  ],
}

export default function AxisCollapse() {
  const [axis, setAxis] = useState<Axis>(0)
  const [op, setOp] = useState<Op>('sum')
  const [keep, setKeep] = useState(false)
  const [phase, setPhase] = useState<'done' | 'start' | 'move'>('done')
  const [run, setRun] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const [wrapRef, w] = useContainerWidth<HTMLDivElement>(560)

  // layout (px), sized to the container so the text stays legible on phones
  const narrow = w < 460
  const L = narrow ? 54 : 70
  const T = 24
  const g = narrow ? 5 : 6
  const gapR = narrow ? 28 : 40
  const cs = Math.max(34, Math.min(50, Math.floor((w - L - 3 * g - gapR - 6) / 5)))
  const xCol = (j: number) => L + j * (cs + g)
  const yRow = (i: number) => T + i * (cs + g)
  const gridW = C * cs + (C - 1) * g
  const gridH = R * cs + (R - 1) * g
  const yRes = T + gridH + gapR
  const xRes = L + gridW + gapR
  const W = xRes + cs + 6
  const H = axis === 1 ? T + gridH + 6 : yRes + cs + 4

  // results
  const groups: number[][] =
    axis === 0 ? SUBJECTS.map((_, j) => MARKS.map((r) => r[j])) : axis === 1 ? MARKS.map((r) => r.slice()) : [MARKS.flat()]
  const res = groups.map((gv) => reduce(gv, op))
  const resPos = (k: number): [number, number] => (axis === 0 ? [xCol(k), yRes] : axis === 1 ? [xRes, yRow(k)] : [xRes, yRes])
  const groupOf = (i: number, j: number) => (axis === 0 ? j : axis === 1 ? i : 0)
  const isWinner = (i: number, j: number) => {
    if (op !== 'max' && op !== 'argmax') return false
    const k = groupOf(i, j)
    const pos = axis === 0 ? i : axis === 1 ? j : i * C + j
    const best = op === 'argmax' ? res[k] : groups[k].indexOf(res[k])
    return pos === best
  }
  const fmt = (v: number) => (op === 'mean' ? v.toFixed(1) : String(v))

  // animation: copies fly from each cell to its result cell, then the result fades in
  useEffect(() => {
    if (run === 0) return
    setPhase('start')
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setPhase('move'))
    })
    const t = window.setTimeout(() => setPhase('done'), 2200)
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      window.clearTimeout(t)
    }
  }, [run])
  const replay = () => setRun((n) => n + 1)
  const changeAxis = (a: Axis) => {
    setAxis(a)
    setHover(null)
    replay()
  }
  const changeOp = (o: Op) => {
    setOp(o)
    replay()
  }

  const delayOf = (i: number, j: number) => (axis === 0 ? i * 160 : axis === 1 ? j * 140 : (i * C + j) * 45)
  const showResult = phase !== 'start'
  const maxDelay = axis === 0 ? (R - 1) * 160 : axis === 1 ? (C - 1) * 140 : (R * C - 1) * 45
  const resultDelay = (maxDelay + 700) / 1000

  // shape text with the vanished axis struck out
  const inShape = (
    <>
      (
      <span style={axis === 0 || axis === 'none' ? { color: 'var(--viz-neg)', textDecoration: 'line-through' } : undefined}>3</span>,{' '}
      <span style={axis === 1 || axis === 'none' ? { color: 'var(--viz-neg)', textDecoration: 'line-through' } : undefined}>4</span>)
    </>
  )
  const outShape = keep ? (axis === 0 ? '(1, 4)' : axis === 1 ? '(3, 1)' : '(1, 1)') : axis === 0 ? '(4,)' : axis === 1 ? '(3,)' : '()'
  const call = axis === 'none' ? `marks.${op}(${keep ? 'keepdims=True' : ''})` : `marks.${op}(axis=${axis}${keep ? ', keepdims=True' : ''})`
  const isFloat = op === 'mean'
  let printed: string
  if (axis === 'none') printed = keep ? `[[${isFloat ? res[0].toFixed(0) + '.' : res[0]}]]` : isFloat ? res[0].toFixed(1) : String(res[0])
  else if (axis === 0) printed = keep ? npPrint([res], isFloat) : npPrint(res, isFloat)
  else printed = keep ? npPrint(res.map((v) => [v]), isFloat) : npPrint(res, isFloat)

  const lane = (k: number): CSSProperties => {
    const pad = 3
    const base: CSSProperties = {
      position: 'absolute',
      borderRadius: 10,
      background: `color-mix(in srgb, var(--viz-1) ${hover === k ? 20 : 8}%, transparent)`,
      border: `1px solid color-mix(in srgb, var(--viz-1) ${hover === k ? 60 : 25}%, transparent)`,
      transition: 'background 0.2s ease',
    }
    if (axis === 0) return { ...base, left: xCol(k) - pad, top: T - pad, width: cs + 2 * pad, height: yRes + cs + pad - (T - pad) }
    if (axis === 1) return { ...base, left: L - pad, top: yRow(k) - pad, width: xRes + cs + pad - (L - pad), height: cs + 2 * pad }
    return { ...base, left: L - pad, top: T - pad, width: gridW + 2 * pad, height: gridH + 2 * pad }
  }

  const arrowGlyph = axis === 0 ? '↓' : axis === 1 ? '→' : '↘'

  return (
    <Figure
      title="Reducing along an axis: the axis you name disappears"
      caption={
        <>
          A mark sheet with 3 students (rows, axis 0) and 4 subjects (columns, axis 1). Pick an axis and an operation; the copies of the cells fly into
          the result. <code>axis=0</code> squashes the 3 rows together, so one value per <b>column</b> is left; <code>axis=1</code> squashes the 4 columns,
          leaving one value per <b>row</b>. Hover a result to see its group, and try <code>argmax</code>: it returns a <em>position</em>, not a mark.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.75rem' }}>
        <div style={{ position: 'relative', width: W, height: H, maxWidth: '100%' }} role="group" aria-label={`marks.${op} along ${axis === 'none' ? 'all axes' : 'axis ' + axis} gives ${printed}`}>
          {/* lanes: which cells are combined into each result */}
          {groups.map((_, k) => (
            <div key={`lane${k}`} style={lane(k)} aria-hidden="true" />
          ))}
          {/* column and row labels */}
          {SUBJECTS.map((s, j) => (
            <div key={s} style={{ position: 'absolute', left: xCol(j), top: 0, width: cs, textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-2)' }}>
              {s}
            </div>
          ))}
          {STUDENTS.map((s, i) => (
            <div
              key={s}
              style={{ position: 'absolute', left: 0, top: yRow(i), width: L - 8, height: cs, display: 'grid', alignItems: 'center', justifyContent: 'end', fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)' }}
            >
              {s}
            </div>
          ))}
          {/* source cells */}
          {MARKS.map((row, i) =>
            row.map((v, j) => (
              <div
                key={`c${i}${j}`}
                style={{
                  ...cellStyle(isWinner(i, j) ? 'b' : hover !== null && groupOf(i, j) === hover ? 'a' : 'plain', cs, isWinner(i, j)),
                  position: 'absolute',
                  left: xCol(j),
                  top: yRow(i),
                }}
              >
                {v}
              </div>
            )),
          )}
          {/* arrows and op label in the gap */}
          {groups.map((_, k) => {
            const [x, y] = resPos(k)
            const style: CSSProperties = { position: 'absolute', fontSize: '1rem', fontWeight: 700, color: 'var(--viz-1)', textAlign: 'center' }
            if (axis === 0) return <div key={`ar${k}`} aria-hidden="true" style={{ ...style, left: x, width: cs, top: T + gridH + (gapR - 20) / 2 }}>{arrowGlyph}</div>
            if (axis === 1) return <div key={`ar${k}`} aria-hidden="true" style={{ ...style, left: L + gridW + (gapR - 14) / 2, top: y + cs / 2 - 11 }}>{arrowGlyph}</div>
            return <div key={`ar${k}`} aria-hidden="true" style={{ ...style, left: L + gridW + 4, top: T + gridH + 4 }}>{arrowGlyph}</div>
          })}
          <div
            style={{
              position: 'absolute',
              ...(axis === 0 ? { left: 0, top: yRes, width: L - 8, height: cs, justifyContent: 'end' } : axis === 1 ? { left: xRes - 8, top: 0, width: cs + 16, justifyContent: 'center' } : { left: 0, top: yRes, width: L + gridW, height: cs, justifyContent: 'end', paddingRight: 8 }),
              display: 'grid',
              alignItems: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--viz-1)',
              ...mono,
            }}
          >
            {op}
          </div>
          {/* result cells */}
          {res.map((v, k) => {
            const [x, y] = resPos(k)
            const name = op === 'argmax' && axis !== 'none' ? (axis === 0 ? STUDENTS[v] : SUBJECTS[v]) : null
            return (
              <button
                key={`r${k}`}
                type="button"
                onMouseEnter={() => setHover(k)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(k)}
                onBlur={() => setHover(null)}
                aria-label={`result ${k}: ${fmt(v)}`}
                style={{
                  ...cellStyle('c', cs, true),
                  position: 'absolute',
                  left: x,
                  top: y,
                  cursor: 'default',
                  ...mono,
                  fontSize: '0.92rem',
                  opacity: showResult ? 1 : 0,
                  transition: phase === 'move' ? `opacity 0.35s ease ${resultDelay}s` : 'none',
                  display: 'grid',
                  alignContent: 'center',
                  gap: 1,
                }}
              >
                <span>{fmt(v)}</span>
                {name && <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--ink-2)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{name}</span>}
              </button>
            )
          })}
          {/* flying copies (only while animating) */}
          {phase !== 'done' &&
            MARKS.map((row, i) =>
              row.map((v, j) => {
                const [tx, ty] = resPos(groupOf(i, j))
                const dx = phase === 'move' ? tx - xCol(j) : 0
                const dy = phase === 'move' ? ty - yRow(i) : 0
                const d = delayOf(i, j)
                return (
                  <div
                    key={`f${i}${j}`}
                    aria-hidden="true"
                    style={{
                      ...cellStyle('a', cs),
                      position: 'absolute',
                      left: xCol(j),
                      top: yRow(i),
                      transform: `translate(${dx}px, ${dy}px)`,
                      opacity: phase === 'move' ? 0 : 0.95,
                      transition: phase === 'move' ? `transform 0.75s cubic-bezier(.5,0,.3,1) ${d}ms, opacity 0.3s ease ${d + 650}ms` : 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {v}
                  </div>
                )
              }),
            )}
        </div>
        <div style={{ ...mono, fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }} aria-live="polite">
          shape {inShape} → <span style={{ color: 'var(--viz-3)' }}>{outShape}</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--ink-2)', textAlign: 'center', maxWidth: 520 }}>{PHRASE[op][axis === 'none' ? 2 : axis]}.</div>
        <OutputBox label={`print(${call})`}>{printed}</OutputBox>
        <Controls>
          <Segmented
            label="Axis"
            value={axis}
            onChange={changeAxis}
            options={[
              { value: 0, label: 'axis=0' },
              { value: 1, label: 'axis=1' },
              { value: 'none', label: 'no axis' },
            ]}
          />
          <Segmented
            label="Operation"
            value={op}
            onChange={changeOp}
            options={[
              { value: 'sum', label: 'sum' },
              { value: 'mean', label: 'mean' },
              { value: 'max', label: 'max' },
              { value: 'argmax', label: 'argmax' },
            ]}
          />
        </Controls>
        <Controls>
          <Toggle label="keepdims=True" checked={keep} onChange={setKeep} />
          <Button primary onClick={replay}>
            Play the collapse
          </Button>
        </Controls>
      </div>
    </Figure>
  )
}
