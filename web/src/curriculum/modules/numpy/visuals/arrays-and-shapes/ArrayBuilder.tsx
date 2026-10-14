import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Slider, Toggle, Button, MatrixGrid, useContainerWidth } from '../../../../../kit'
import { npPrint, shapeOf, flat, nest, shapeStr, type Nested } from './npFormat'

/*
  Pick a constructor, set its arguments, and see the array NumPy would make: the grid, exactly what
  print() shows, and its shape, ndim, size and dtype. Turn on "predict first" to guess the shape
  before it is revealed.
*/

type Ctor = 'array' | 'zeros' | 'ones' | 'arange' | 'linspace' | 'eye'

const LISTS: { label: string; value: Nested; isFloat: boolean }[] = [
  { label: '[1, 2, 3]', value: [1, 2, 3], isFloat: false },
  { label: '[1, 2.5, 3]', value: [1, 2.5, 3], isFloat: true },
  { label: '[[1, 2, 3], [4, 5, 6]]', value: [[1, 2, 3], [4, 5, 6]], isFloat: false },
  { label: '[[1, 2], [3, 4], [5, 6]]', value: [[1, 2], [3, 4], [5, 6]], isFloat: false },
]

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

const short = (dp: number) => (v: number) => {
  if (Number.isInteger(v)) return String(v)
  const s = v.toFixed(dp).replace(/0+$/, '')
  return Math.abs(v - Number(s)) > 1e-12 ? s + '…' : s
}

export default function ArrayBuilder() {
  const [ctor, setCtor] = useState<Ctor>('zeros')
  const [listIdx, setListIdx] = useState(2)
  const [twoD, setTwoD] = useState(true)
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(4)
  const [start, setStart] = useState(0)
  const [stop, setStop] = useState(10)
  const [step, setStep] = useState(2)
  const [lsStart, setLsStart] = useState(0)
  const [lsStop, setLsStop] = useState(1)
  const [num, setNum] = useState(5)
  const [n, setN] = useState(3)
  const [predict, setPredict] = useState(false)
  const [gridRef, gw] = useContainerWidth<HTMLDivElement>(520)
  const [revealed, setRevealed] = useState(false)

  let value: Nested
  let isFloat = true
  let code = ''
  switch (ctor) {
    case 'array': {
      const L = LISTS[listIdx]
      value = L.value
      isFloat = L.isFloat
      code = `np.array(${L.label})`
      break
    }
    case 'zeros':
    case 'ones': {
      const fill = ctor === 'zeros' ? 0 : 1
      value = twoD ? Array.from({ length: rows }, () => Array(cols).fill(fill)) : Array(cols).fill(fill)
      code = twoD ? `np.${ctor}((${rows}, ${cols}))` : `np.${ctor}(${cols})`
      break
    }
    case 'arange': {
      const v: number[] = []
      for (let x = start; x < stop; x += step) v.push(x)
      value = v
      isFloat = false
      code = `np.arange(${start}, ${stop}, ${step})`
      break
    }
    case 'linspace': {
      value = Array.from({ length: num }, (_, i) => (num === 1 ? lsStart : lsStart + ((lsStop - lsStart) * i) / (num - 1)))
      code = `np.linspace(${lsStart}, ${lsStop}, ${num})`
      break
    }
    case 'eye':
      value = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
      code = `np.eye(${n})`
      break
  }
  // linspace: compute exactly as NumPy does (start + i * step), then fix the last value to stop
  if (ctor === 'linspace' && num > 1) {
    const stepv = (lsStop - lsStart) / (num - 1)
    value = Array.from({ length: num }, (_, i) => (i === num - 1 ? lsStop : lsStart + i * stepv))
  }

  const shape = shapeOf(value)
  const size = flat(value).length
  const ndim = shape.length
  const grid: (number | string)[][] = ndim === 1 ? [flat(value)] : (value as number[][])
  const hidden = predict && !revealed
  const changed = (fn: () => void) => {
    fn()
    setRevealed(false)
  }
  const printed = npPrint(nest(flat(value), shape), isFloat)
  const nCols = ndim === 1 ? size : shape[1]
  const cellSize = Math.max(26, Math.min(ndim === 1 && size > 6 ? 46 : 52, Math.floor((gw - 36) / Math.max(1, nCols)) - 3))
  const dp = cellSize >= 50 ? 3 : cellSize >= 40 ? 2 : 1

  const argControls = () => {
    switch (ctor) {
      case 'array':
        return (
          <Segmented
            label="the Python list"
            value={listIdx}
            onChange={(v) => changed(() => setListIdx(v))}
            options={LISTS.map((l, i) => ({ value: i, label: <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{l.label}</span> }))}
          />
        )
      case 'zeros':
      case 'ones':
        return (
          <>
            <Segmented
              label="shape argument"
              value={twoD ? 2 : 1}
              onChange={(v) => changed(() => setTwoD(v === 2))}
              options={[
                { value: 1, label: 'one number' },
                { value: 2, label: 'a (rows, cols) tuple' },
              ]}
            />
            {twoD && <Slider label="rows" value={rows} min={1} max={4} onChange={(v) => changed(() => setRows(v))} />}
            <Slider label={twoD ? 'cols' : 'length'} value={cols} min={1} max={6} onChange={(v) => changed(() => setCols(v))} />
          </>
        )
      case 'arange':
        return (
          <>
            <Slider label="start" value={start} min={0} max={6} onChange={(v) => changed(() => setStart(v))} />
            <Slider label="stop (not included)" value={stop} min={1} max={12} onChange={(v) => changed(() => setStop(v))} />
            <Slider label="step" value={step} min={1} max={4} onChange={(v) => changed(() => setStep(v))} />
          </>
        )
      case 'linspace':
        return (
          <>
            <Slider label="start" value={lsStart} min={0} max={2} onChange={(v) => changed(() => setLsStart(v))} />
            <Slider label="stop (included)" value={lsStop} min={1} max={10} onChange={(v) => changed(() => setLsStop(v))} />
            <Slider label="num (how many points)" value={num} min={2} max={9} onChange={(v) => changed(() => setNum(v))} />
          </>
        )
      case 'eye':
        return <Slider label="n" value={n} min={1} max={5} onChange={(v) => changed(() => setN(v))} />
    }
  }

  const blur: CSSProperties = hidden ? { filter: 'blur(7px)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none' } : {}

  return (
    <Figure
      title="Array builder: arguments in, shape out"
      caption={
        <>
          Choose a constructor and change its arguments. Notice that the arguments alone decide the shape: <code>zeros((3, 4))</code> is 3
          rows of 4, <code>arange</code> stops <i>before</i> stop, and <code>linspace</code> includes both ends. Turn on <b>predict first</b>
          , say the shape out loud, then reveal.
        </>
      }
    >
      <Controls>
        <Segmented
          label="constructor"
          value={ctor}
          onChange={(v) => changed(() => setCtor(v))}
          options={(['array', 'zeros', 'ones', 'arange', 'linspace', 'eye'] as Ctor[]).map((c) => ({ value: c, label: c }))}
        />
      </Controls>
      <Controls>{argControls()}</Controls>
      <pre style={{ ...pre, fontWeight: 700, color: 'var(--accent)' }}>a = {code}</pre>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.6rem', justifyItems: 'center', width: '100%', ...blur }} aria-hidden={hidden}>
        <div ref={gridRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', justifyItems: 'center', overflow: 'hidden' }}>
          {size === 0 ? (
            <div style={{ fontSize: '0.9rem', color: 'var(--ink-2)', padding: '0.6rem' }}>An empty array: start is not below stop, so there are no numbers.</div>
          ) : (
            <MatrixGrid
              data={grid}
              format={short(dp)}
              cellSize={cellSize}
              label={ndim === 1 ? `1-D: one row of ${size} number${size === 1 ? '' : 's'}` : `2-D: ${shape[0]} rows × ${shape[1]} columns`}
            />
          )}
        </div>
        <div style={{ width: '100%', minWidth: 0 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '0.2rem' }}>print(a) shows</div>
          <pre style={pre}>{printed}</pre>
        </div>
        <Readout
          items={[
            ['a.shape', shapeStr(shape)],
            ['a.ndim', String(ndim)],
            ['a.size', String(size)],
            ['a.dtype', isFloat ? 'float64' : 'int64'],
          ]}
        />
      </div>
      <Controls>
        <Toggle
          label="predict first (hide the answer)"
          checked={predict}
          onChange={(v) => {
            setPredict(v)
            setRevealed(false)
          }}
        />
        {hidden && (
          <Button primary onClick={() => setRevealed(true)}>
            Reveal
          </Button>
        )}
      </Controls>
    </Figure>
  )
}
