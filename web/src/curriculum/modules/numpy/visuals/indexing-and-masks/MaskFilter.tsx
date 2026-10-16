import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Slider, useNarrow, useContainerWidth } from '../../../../../kit'
import { npPrint, charsThatFit } from '../arrays-and-shapes/npFormat'

/*
  Two uses of boolean masks.
  Filter: a comparison makes a True/False grid of the same shape; arr[mask] keeps the True cells in reading order.
  Accuracy: (pred == y).mean() counts the Trues and divides by n. Click a prediction to flip it.
*/

const MARKS = [
  [72, 45, 88, 91, 60],
  [38, 77, 54, 95, 12],
  [66, 83, 49, 70, 100],
  [25, 58, 81, 33, 64],
]
const Y_TRUE = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1]
const PRED0 = [1, 0, 0, 1, 0, 1, 1, 0, 1, 1]

type Cond = 'ge' | 'and' | 'or'

/** How Python prints a float: 0.7, 0.0, 1.0 */
const pyFloat = (x: number) => {
  const r = Math.round(x * 1e8) / 1e8
  return Number.isInteger(r) ? r.toFixed(1) : String(r)
}

const cellBase: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  borderRadius: 6,
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
  borderWidth: 1.5,
  borderStyle: 'solid',
  borderColor: 'transparent',
}

function Grid({ data, render, size, label }: { data: number[][]; render: (v: number, i: number, j: number) => { text: string; style: CSSProperties }; size: number; label: string }) {
  return (
    <div style={{ display: 'grid', gap: '0.3rem', justifyItems: 'center' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data[0].length}, ${size}px)`, gap: 3 }} role="table" aria-label={label}>
        {data.map((row, i) =>
          row.map((v, j) => {
            const r = render(v, i, j)
            return (
              <div key={`${i}-${j}`} role="cell" style={{ ...cellBase, height: size, fontSize: size < 44 ? '0.7rem' : '0.8rem', ...r.style }}>
                {r.text}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}

const pre: CSSProperties = {
  margin: 0,
  padding: '0.55rem 0.75rem',
  background: 'var(--surface-2)',
  borderRadius: 8,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  lineHeight: 1.45,
  color: 'var(--ink)',
  whiteSpace: 'pre',
  overflowX: 'auto',
  width: '100%',
  boxSizing: 'border-box',
}

const T = { background: 'color-mix(in srgb, var(--viz-pos) 26%, var(--surface))', borderColor: 'var(--viz-pos)', color: 'var(--ink)' }
const F = { background: 'var(--surface-2)', borderColor: 'transparent', color: 'var(--ink-3)' }

function FilterMode() {
  const [cond, setCond] = useState<Cond>('ge')
  const [a, setA] = useState(50)
  const [b, setB] = useState(80)
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)
  const test = (v: number) => (cond === 'ge' ? v >= a : cond === 'and' ? v >= a && v <= b : v < a || v > b)
  const mask = MARKS.map((r) => r.map((v) => (test(v) ? 1 : 0)))
  const kept = MARKS.flat().filter(test)
  const count = kept.length
  const code = cond === 'ge' ? `marks >= ${a}` : cond === 'and' ? `(marks >= ${a}) & (marks <= ${b})` : `(marks < ${a}) | (marks > ${b})`
  const size = narrow ? 40 : 48
  const [outRef, outW] = useContainerWidth<HTMLDivElement>(520)
  const fit = charsThatFit(outW)
  // On a phone, a long two-part test goes over two lines (still valid Python) instead of scrolling.
  const parts = code.split(/ ([&|]) /)
  const maskLine = `mask = ${code}`.length <= fit || parts.length !== 3 ? `mask = ${code}` : `mask = (${parts[0]}\n        ${parts[1]} ${parts[2]})`

  return (
    <>
      <Controls>
        <Segmented
          label="condition"
          value={cond}
          onChange={setCond}
          options={[
            { value: 'ge', label: 'one test' },
            { value: 'and', label: 'between (&)' },
            { value: 'or', label: 'outside (|)' },
          ]}
        />
        <Slider label={cond === 'ge' ? 'pass mark a' : 'a'} value={a} min={0} max={100} step={5} onChange={setA} />
        {cond !== 'ge' && <Slider label="b" value={b} min={0} max={100} step={5} onChange={setB} />}
      </Controls>
      <pre style={{ ...pre, fontWeight: 700, color: 'var(--accent)' }}>{`${maskLine}\nkept = marks[mask]`}</pre>
      <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', width: '100%' }}>
        <Grid
          label="marks"
          data={MARKS}
          size={size}
          render={(v) => ({ text: String(v), style: test(v) ? { color: 'var(--ink)', background: 'var(--surface-2)', borderColor: 'var(--viz-pos)' } : { color: 'var(--ink-3)', background: 'var(--surface-2)', borderColor: 'transparent' } })}
        />
        <Grid label="mask" data={mask} size={size} render={(m) => ({ text: m ? 'True' : 'False', style: m ? T : F })} />
      </div>
      <div ref={outRef} style={{ width: '100%' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '0.2rem' }}>print(kept) shows (the True cells, read row by row)</div>
        <pre style={pre}>{npPrint(kept, false, fit)}</pre>
      </div>
      <Readout
        items={[
          ['mask.shape', '(4, 5)'],
          ['kept.shape', `(${count},)`],
          ['mask.sum()', String(count)],
          ['mask.mean()', pyFloat(count / 20)],
        ]}
      />
    </>
  )
}

function AccuracyMode() {
  const [pred, setPred] = useState(PRED0)
  const eq: number[] = pred.map((p, i) => (p === Y_TRUE[i] ? 1 : 0))
  const k = eq.reduce((s, x) => s + x, 0)
  const n = pred.length
  // wide cells must fit the word "False" (5 monospace characters)
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)
  const size = narrow ? 24 : 48
  const label = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', textAlign: 'right' as const, paddingRight: 6 }
  const rowCells = (vals: number[], kind: 'y' | 'p' | 'm') =>
    vals.map((v, i) => {
      const style: CSSProperties = { ...cellBase, height: size, fontSize: size < 30 ? '0.66rem' : '0.74rem' }
      if (kind === 'm') Object.assign(style, v ? T : { ...F, background: 'color-mix(in srgb, var(--viz-neg) 18%, var(--surface))', borderColor: 'var(--viz-neg)', color: 'var(--ink)' })
      else Object.assign(style, { background: 'var(--surface-2)', color: 'var(--ink)' })
      const text = kind === 'm' ? (v ? (narrow ? 'T' : 'True') : narrow ? 'F' : 'False') : String(v)
      if (kind === 'p')
        return (
          <button
            key={i}
            type="button"
            onClick={() => setPred((ps) => ps.map((x, j) => (j === i ? 1 - x : x)))}
            style={{ ...style, cursor: 'pointer', borderColor: 'var(--accent-line)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
            aria-label={`prediction ${i}: ${v}. Click to flip`}
          >
            {text}
          </button>
        )
      return (
        <div key={i} role="cell" style={style}>
          {text}
        </div>
      )
    })

  return (
    <>
      <pre style={{ ...pre, fontWeight: 700, color: 'var(--accent)' }}>{`correct = (pred == y)\naccuracy = correct.mean()`}</pre>
      <div ref={ref} style={{ width: '100%', display: 'grid', justifyContent: 'center', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${n}, ${size}px)`, gap: 3, alignItems: 'center' }}>
          <div style={label}>y</div>
          {rowCells(Y_TRUE, 'y')}
          <div style={label}>pred</div>
          {rowCells(pred, 'p')}
          <div style={label}>{narrow ? '==' : 'pred == y'}</div>
          {rowCells(eq, 'm')}
        </div>
        {narrow && <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--ink-3)', textAlign: 'center' }}>T = True, F = False</div>}
      </div>
      <Readout
        items={[
          ['correct.sum()', String(k)],
          ['correct.mean()', `${k} / ${n} = ${pyFloat(k / n)}`],
          ['accuracy', `${Math.round((k / n) * 100)}%`],
        ]}
      />
      <div style={{ width: '100%', fontSize: '0.85rem', color: 'var(--ink-2)' }}>
        Python treats True as 1 and False as 0, so the <b>sum</b> of a mask counts the Trues and its <b>mean</b> is the fraction that are
        True. Click any prediction to flip it between 0 and 1.
      </div>
    </>
  )
}

export default function MaskFilter() {
  const [mode, setMode] = useState<'filter' | 'acc'>('filter')
  return (
    <Figure
      title="Boolean masks: a stencil of True and False"
      caption={
        <>
          <b>Filter</b>: move the pass mark and watch the mask (same shape as the marks) and the kept values change. Join two tests with{' '}
          <code>&amp;</code> (and) or <code>|</code> (or), each in its own brackets. <b>Accuracy</b>: a mask of correct predictions turns into a
          metric with one <code>.mean()</code>.
        </>
      }
    >
      <Controls>
        <Segmented
          label="use"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'filter', label: 'filter values' },
            { value: 'acc', label: 'measure accuracy' },
          ]}
        />
      </Controls>
      {mode === 'filter' ? <FilterMode /> : <AccuracyMode />}
    </Figure>
  )
}
