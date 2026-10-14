import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Slider, Button, useAnimationFrame } from '../../../../../kit'

/*
  A race between a Python for-loop and a vectorised NumPy expression.
  Timings (milliseconds) were measured with time.perf_counter (best of several runs) on one
  test machine: Python 3.13, NumPy 2.5, float64 data. They are replayed here in slow motion.
*/

type Op = 'double' | 'square' | 'sum'
const SIZES = [1_000, 10_000, 100_000, 1_000_000, 10_000_000]
// [python loop ms, numpy ms] for each size, in the order of SIZES
const MS: Record<Op, [number, number][]> = {
  double: [
    [0.0358, 0.0013],
    [0.3455, 0.0029],
    [3.882, 0.0417],
    [55.78, 0.5168],
    [623.5, 21.61],
  ],
  square: [
    [0.0773, 0.002],
    [0.7705, 0.0056],
    [8.291, 0.5208],
    [100.28, 1.3843],
    [1184.0, 44.62],
  ],
  sum: [
    [0.0181, 0.001],
    [0.1801, 0.0032],
    [1.9086, 0.0261],
    [19.9, 0.2884],
    [210.4, 9.008],
  ],
}
const CODE: Record<Op, { loop: string; np: string }> = {
  double: { loop: 'out = []\nfor x in data:\n    out.append(x * 2)', np: 'out = arr * 2' },
  square: { loop: 'out = []\nfor x in data:\n    out.append(x ** 2 + 1)', np: 'out = arr ** 2 + 1' },
  sum: { loop: 'total = 0.0\nfor x in data:\n    total += x', np: 'total = arr.sum()' },
}
const NP_STEP: Record<Op, string> = {
  double: 'read 8 bytes, multiply by 2, write 8 bytes, step to the next address.',
  square: 'read 8 bytes, square, write 8 bytes; then a second C loop adds 1 to every result.',
  sum: 'read 8 bytes and add them to a running total held in the processor.',
}
const SYMBOL: Record<Op, string> = { double: '*', square: '** and +', sum: '+' }
const RESULT: Record<Op, string> = {
  double: 'build a brand-new Python object for the answer and store a pointer to it in the output list',
  square: 'build a brand-new Python object for the answer and store a pointer to it in the output list',
  sum: 'build a brand-new Python object for the new running total',
}
const DURATION = 3.2 // seconds of animation for the slow lane

const fmtTime = (ms: number) => (ms >= 1 ? `${ms >= 100 ? ms.toFixed(0) : ms.toFixed(1)} ms` : `${(ms * 1000).toFixed(ms * 1000 >= 10 ? 0 : 1)} µs`)
const fmtN = (n: number) => n.toLocaleString('en-GB')

const codeStyle: CSSProperties = {
  margin: 0,
  padding: '0.45rem 0.6rem',
  background: 'var(--surface-2)',
  borderRadius: 8,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.8rem',
  lineHeight: 1.45,
  color: 'var(--ink)',
  whiteSpace: 'pre',
  overflowX: 'auto',
}

function Lane({ title, code, colour, frac, ms, n, done }: { title: string; code: string; colour: string; frac: number; ms: number; n: number; done: boolean }) {
  return (
    <div style={{ display: 'grid', gap: '0.35rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)' }}>
        <span>{title}</span>
        <span className="tabular" style={{ color: done ? colour : 'var(--ink-3)' }}>
          {done ? `finished in ${fmtTime(ms)}` : `${fmtN(Math.floor(frac * n))} / ${fmtN(n)} done`}
        </span>
      </div>
      <div style={{ height: 18, borderRadius: 9, background: 'var(--surface-3)', overflow: 'hidden' }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(frac * 100)} aria-label={title}>
        <div style={{ width: `${frac * 100}%`, height: '100%', background: colour, borderRadius: 9 }} />
      </div>
      <pre style={codeStyle}>{code}</pre>
    </div>
  )
}

export default function SpeedRace() {
  const [op, setOp] = useState<Op>('double')
  const [e, setE] = useState(6) // n = 10^e
  const [t, setT] = useState(DURATION) // animation clock; DURATION = finished
  const [running, setRunning] = useState(false)
  const n = SIZES[e - 3]
  const [loopMs, npMs] = MS[op][e - 3]
  const ratio = loopMs / npMs
  const loopFrac = Math.min(1, t / DURATION)
  const npFrac = Math.min(1, (t / DURATION) * ratio)

  useAnimationFrame((dt) => {
    setT((x) => {
      const nx = x + dt
      if (nx >= DURATION) {
        setRunning(false)
        return DURATION
      }
      return nx
    })
  }, running)

  const race = () => {
    setT(0)
    setRunning(true)
  }
  const change = (fn: () => void) => {
    setRunning(false)
    setT(DURATION)
    fn()
  }

  return (
    <Figure
      title="Race: Python loop versus one NumPy line"
      caption={
        <>
          Pick an operation and a size, then press <b>Race</b> to replay the measured times in slow motion (the loop's time is stretched to 3
          seconds and NumPy's is stretched by the same factor). The vectorised line wins by tens of times. These times were measured once on
          a test machine; your own computer will differ, but the gap will be similar. Time it yourself in the code runner below.
        </>
      }
    >
      <Controls>
        <Segmented
          label="operation"
          value={op}
          onChange={(v) => change(() => setOp(v))}
          options={[
            { value: 'double', label: 'x * 2' },
            { value: 'square', label: 'x ** 2 + 1' },
            { value: 'sum', label: 'sum' },
          ]}
        />
        <Slider label="how many numbers, n" value={e} min={3} max={7} step={1} onChange={(v) => change(() => setE(v))} format={(v) => fmtN(10 ** v)} />
        <Button primary onClick={race} disabled={running}>
          {running ? 'Racing…' : 'Race'}
        </Button>
      </Controls>
      <Lane title="Python for-loop over a list" code={CODE[op].loop} colour="var(--viz-2)" frac={loopFrac} ms={loopMs} n={n} done={loopFrac >= 1} />
      <Lane title="NumPy, vectorised" code={CODE[op].np} colour="var(--viz-1)" frac={npFrac} ms={npMs} n={n} done={npFrac >= 1} />
      <Readout
        items={[
          ['loop', fmtTime(loopMs)],
          ['NumPy', fmtTime(npMs)],
          ['NumPy is faster by', `× ${Math.round(ratio)}`],
        ]}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '0.75rem', width: '100%', fontSize: '0.85rem', color: 'var(--ink-2)' }}>
        <div style={{ border: '1px solid var(--rule)', borderRadius: 10, padding: '0.55rem 0.7rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--viz-2)', marginBottom: '0.25rem' }}>The interpreter, for EVERY number</div>
          <ol style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.5 }}>
            <li>follow the pointer to the object</li>
            <li>check its type: int? float? something else?</li>
            <li>look up what {SYMBOL[op]} means for that type</li>
            <li>unpack the raw value and do the maths</li>
            <li>{RESULT[op]}</li>
          </ol>
        </div>
        <div style={{ border: '1px solid var(--rule)', borderRadius: 10, padding: '0.55rem 0.7rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--viz-1)', marginBottom: '0.25rem' }}>NumPy</div>
          <div style={{ lineHeight: 1.5 }}>
            <b>Once:</b> check the dtype (float64) and choose a ready-made compiled C loop.
            <br />
            <b>Then, for every number:</b> {NP_STEP[op]} The bytes sit side by side, so the processor can even handle several at a time.
          </div>
        </div>
      </div>
    </Figure>
  )
}
