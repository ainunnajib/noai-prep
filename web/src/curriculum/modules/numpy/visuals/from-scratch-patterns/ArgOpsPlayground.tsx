import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Slider, Button, useContainerWidth } from '../../../../../kit'
import { cellStyle, mono, npPrint, OutputBox, type Tone } from '../vectorised-ops-and-axes/Cells'

/*
  argmax/argmin versus max, plus np.sign, np.where, np.unique and np.clip on one small integer
  array. Click a cell and use the slider to edit it; pick an operation to see its output under
  (or beside) the input, with the elements it used highlighted. Outputs match NumPy's print().
*/

type Op = 'argmax' | 'argmin' | 'max' | 'sign' | 'where' | 'unique' | 'clip'
const START = [4, -2, 7, 0, 7, -5, 3, -2]

const CODE: Record<Op, string> = {
  argmax: 'np.argmax(a)',
  argmin: 'np.argmin(a)',
  max: 'np.max(a)',
  sign: 'np.sign(a)',
  where: 'np.where(a > 0, a, 0)',
  unique: 'vals, counts = np.unique(a, return_counts=True)',
  clip: 'np.clip(a, -3, 3)',
}

const WHAT: Record<Op, string> = {
  argmax: 'The POSITION of the largest value. With a tie, the first position wins.',
  argmin: 'The POSITION of the smallest value (the nearest centroid, when a is a row of distances).',
  max: 'The largest VALUE itself, not where it is.',
  sign: '−1 for negative, 0 for zero, 1 for positive. If a holds (true value − guess), +1 says a guess is too low (nudge it up) and −1 says it is too high.',
  where: 'Element-wise choice: keep a where the condition is True, use 0 elsewhere (this one is ReLU).',
  unique: 'The sorted distinct values and how often each appears: class counts, or a majority vote.',
  clip: 'Values below −3 become −3 and values above 3 become 3; the rest are unchanged.',
}

export default function ArgOpsPlayground() {
  const [a, setA] = useState<number[]>(START)
  const [op, setOp] = useState<Op>('argmax')
  const [edit, setEdit] = useState(2)
  const n = a.length

  const argmax = a.reduce((b, v, i) => (v > a[b] ? i : b), 0)
  const argmin = a.reduce((b, v, i) => (v < a[b] ? i : b), 0)
  const mx = a[argmax]
  const mn = a[argmin]
  const sign = a.map((v) => Math.sign(v) + 0)
  const where = a.map((v) => (v > 0 ? v : 0))
  const clip = a.map((v) => Math.max(-3, Math.min(3, v)))
  const vals = Array.from(new Set(a)).sort((x, y) => x - y)
  const counts = vals.map((v) => a.filter((x) => x === v).length)
  const ties = op === 'argmax' ? a.filter((v) => v === mx).length > 1 : op === 'argmin' ? a.filter((v) => v === mn).length > 1 : false

  const [wrapRef, w] = useContainerWidth<HTMLDivElement>(560)
  const gap = w < 440 ? 3 : 4
  const size = Math.max(26, Math.min(36, Math.floor((w - 52 - (n - 1) * gap) / n)))

  // tone of each input cell for the chosen op
  const inTone = (i: number): Tone => {
    if (op === 'argmax') return i === argmax ? 'c' : a[i] === mx ? 'b' : 'plain'
    if (op === 'argmin') return i === argmin ? 'c' : a[i] === mn ? 'b' : 'plain'
    if (op === 'max') return a[i] === mx ? 'c' : 'plain'
    if (op === 'where') return a[i] > 0 ? 'c' : 'dim'
    if (op === 'clip') return a[i] < -3 || a[i] > 3 ? 'b' : 'plain'
    return 'plain'
  }

  let printed: string
  if (op === 'argmax') printed = String(argmax)
  else if (op === 'argmin') printed = String(argmin)
  else if (op === 'max') printed = String(mx)
  else if (op === 'sign') printed = npPrint(sign)
  else if (op === 'where') printed = npPrint(where)
  else if (op === 'clip') printed = npPrint(clip)
  else printed = `${npPrint(vals)}\n${npPrint(counts)}`

  const row = (label: ReactNode, cells: ReactNode[], colour = 'var(--ink-2)') => (
    <>
      <div style={{ ...mono, fontSize: '0.78rem', fontWeight: 700, color: colour, textAlign: 'right', paddingRight: 6, whiteSpace: 'nowrap' }}>{label}</div>
      {cells}
    </>
  )
  const outCells = (vs: number[], tone: (i: number) => Tone) =>
    vs.map((v, i) => (
      <div key={`o${i}`} role="cell" style={{ ...cellStyle(tone(i), size), fontSize: '0.85rem' }}>
        {v}
      </div>
    ))

  const pointer = (idx: number, text: string) =>
    Array.from({ length: n }, (_, i) => (
      <div key={`p${i}`} style={{ textAlign: 'center', ...mono, fontSize: '0.8rem', fontWeight: 700, color: 'var(--viz-3)', minHeight: 36, display: 'grid', alignContent: 'start', justifyItems: 'center', lineHeight: 1.2 }}>
        {i === idx ? (
          <>
            <span aria-hidden="true">↑</span>
            <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
          </>
        ) : null}
      </div>
    ))

  const gridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: `auto repeat(${n}, ${size}px)`, gap, alignItems: 'center' }

  return (
    <Figure
      title="arg-functions return positions, not values"
      caption={
        <>
          Pick an operation and compare its output with the input row. Then tap any cell of <code>a</code> and drag the slider to change it: make
          two maxima equal and see <code>argmax</code> keep the first one, or create a new repeated value and watch <code>np.unique</code> count it.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Operation"
          value={op}
          onChange={setOp}
          options={(['argmax', 'argmin', 'max', 'sign', 'where', 'unique', 'clip'] as Op[]).map((v) => ({ value: v, label: v }))}
        />
      </Controls>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
      <div style={{ maxWidth: '100%', overflowX: 'auto', padding: 2 }}>
        <div style={gridStyle} role="table" aria-label="the array a and the result of the chosen operation">
          {row(
            'index',
            a.map((_, i) => (
              <div key={`i${i}`} style={{ ...mono, textAlign: 'center', fontSize: '0.72rem', color: 'var(--ink-3)' }}>
                {i}
              </div>
            )),
            'var(--ink-3)',
          )}
          {row(
            'a',
            a.map((v, i) => (
              <button
                key={`a${i}`}
                type="button"
                onClick={() => setEdit(i)}
                aria-label={`a[${i}] = ${v}; select to edit`}
                aria-pressed={edit === i}
                style={{
                  ...cellStyle(inTone(i), size, op !== 'max' && (i === argmax || i === argmin) && inTone(i) === 'c'),
                  ...mono,
                  cursor: 'pointer',
                  outline: edit === i ? '2px dashed var(--accent)' : 'none',
                  outlineOffset: 2,
                }}
              >
                {v}
              </button>
            )),
            'var(--viz-1)',
          )}
          {op === 'argmax' && row('', pointer(argmax, `index ${argmax}`))}
          {op === 'argmin' && row('', pointer(argmin, `index ${argmin}`))}
          {op === 'sign' && row('sign', outCells(sign, (i) => (sign[i] > 0 ? 'c' : sign[i] < 0 ? 'bad' : 'plain')), 'var(--viz-3)')}
          {op === 'where' && row('where', outCells(where, (i) => (a[i] > 0 ? 'c' : 'plain')), 'var(--viz-3)')}
          {op === 'clip' && row('clip', outCells(clip, (i) => (clip[i] !== a[i] ? 'b' : 'plain')), 'var(--viz-3)')}
        </div>
        {op === 'unique' && (
          <div style={{ ...gridStyle, gridTemplateColumns: `auto repeat(${vals.length}, ${size}px)`, marginTop: 10 }} role="table" aria-label="unique values and their counts">
            {row('vals', outCells(vals, () => 'c'), 'var(--viz-3)')}
            {row('counts', outCells(counts, (i) => (counts[i] > 1 ? 'b' : 'plain')), 'var(--viz-2)')}
          </div>
        )}
      </div>
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--ink-2)', textAlign: 'center', maxWidth: 540 }}>
        {WHAT[op]}
        {ties && <b style={{ color: 'var(--viz-2)' }}> Tie here: the orange cell has the same value, but the first position is returned.</b>}
        {(op === 'argmax' || op === 'argmin') && (
          <>
            {' '}
            Compare: <code>{op === 'argmax' ? `np.max(a)` : `np.min(a)`}</code> is {op === 'argmax' ? mx : mn}.
          </>
        )}
      </div>
      <OutputBox
        label={
          op === 'unique' ? (
            <>
              {CODE[op]}
              <br />
              print(vals); print(counts)
            </>
          ) : (
            `print(${CODE[op]})`
          )
        }
        nowrap
      >
        {printed}
      </OutputBox>
      <Controls>
        <Slider label={`a[${edit}]`} value={a[edit]} min={-9} max={9} step={1} onChange={(v) => setA((xs) => xs.map((x, i) => (i === edit ? v : x)))} />
        <Button onClick={() => setA(START)}>Reset a</Button>
      </Controls>
    </Figure>
  )
}
