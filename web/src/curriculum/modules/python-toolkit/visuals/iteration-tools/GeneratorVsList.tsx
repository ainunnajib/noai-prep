import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button, Bars } from '../../../../../kit'
import s from './it.module.css'

/*
  Memory for N squares stored in a list versus produced by a generator. The byte counts were
  measured in CPython 3.13 with sys.getsizeof: the list object itself plus every int object it
  holds; the generator object is 200 bytes whatever N is. A next() button pulls values from the
  generator one at a time.
*/

const SIZES: { n: number; listBytes: number }[] = [
  { n: 10, listBytes: 464 },
  { n: 100, listBytes: 3720 },
  { n: 1_000, listBytes: 36856 },
  { n: 10_000, listBytes: 365176 },
  { n: 100_000, listBytes: 3869912 },
  { n: 1_000_000, listBytes: 40317656 },
  { n: 10_000_000, listBytes: 408964088 },
]
const GEN_BYTES = 200
const pyNum = (n: number) => n.toLocaleString('en-GB').replace(/,/g, '_')
const human = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b >= 1e3 ? `${(b / 1e3).toFixed(1)} kB` : `${b} bytes`)
const SHOW = 8

export default function GeneratorVsList() {
  const [kind, setKind] = useState<'list' | 'gen'>('gen')
  const [e, setE] = useState(5) // index into SIZES: 1,000,000 by default
  const [pulled, setPulled] = useState<number[]>([0, 1, 4])
  const [stopped, setStopped] = useState(false)
  const { n, listBytes } = SIZES[e]
  const isGen = kind === 'gen'
  const src = isGen ? `squares = (x * x for x in range(${pyNum(n)}))` : `squares = [x * x for x in range(${pyNum(n)})]`
  const ratio = Math.round(listBytes / GEN_BYTES)
  const done = pulled.length >= n

  const pull = () => {
    if (done) {
      setStopped(true) // range(n) is used up, so next() raises StopIteration
      return
    }
    const k = pulled.length
    setPulled([...pulled, k * k])
  }
  const fresh = () => {
    setPulled([])
    setStopped(false)
  }

  return (
    <Figure
      title="A list stores every value; a generator makes them on demand"
      caption={
        <>
          Slide N up to a million and compare the memory bars. Then, in generator mode, press <span className={s.mono}>next(squares)</span> a few times: each value is
          computed only when you ask, and the generator remembers only where it is up to. Switch to the list and every value already exists, all at once.
        </>
      }
    >
      <div className={s.wrap}>
        <Segmented
          label="Build the squares as"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'list', label: <span className={s.mono}>[ … ] a list</span> },
            { value: 'gen', label: <span className={s.mono}>( … ) a generator</span> },
          ]}
        />
        <pre className={s.bigCode} style={{ fontSize: '0.85rem' }}>
          {src}
        </pre>

        <Bars
          ariaLabel="Memory used"
          max={Math.max(listBytes, GEN_BYTES)}
          format={(v) => human(v)}
          data={[
            { label: 'list', value: listBytes, color: 'var(--viz-2)', strong: !isGen },
            { label: 'generator', value: GEN_BYTES, color: 'var(--viz-3)', strong: isGen },
          ]}
        />
        <div className={s.status}>
          {ratio > 1 ? (
            <>
              With N = {n.toLocaleString('en-GB')}, the list needs about <b>{ratio.toLocaleString('en-GB')} times</b> as much memory as the generator.
            </>
          ) : (
            <>With only {n} values the difference is tiny; it grows with N, because the generator's size never changes.</>
          )}
        </div>

        <div className={s.rowLabel}>
          {isGen ? 'Values produced so far (handed out one at a time; the generator stores none of them):' : 'Values in memory (all computed and stored when the line ran):'}
        </div>
        <div className={s.cells} aria-label="Values computed so far">
          {Array.from({ length: Math.min(SHOW, n) }, (_, i) => {
            const have = isGen ? i < pulled.length : true
            const newest = isGen && i === pulled.length - 1
            const past = isGen && have && !newest
            return (
              <span key={i} className={`${s.cell} ${have && !past ? s.cellOn : ''} ${newest ? s.cellNew : ''} ${past ? s.cellPast : ''}`}>
                {have ? i * i : '?'}
              </span>
            )
          })}
          {n > SHOW && <span className={s.muted}>… {isGen ? `${(n - pulled.length).toLocaleString('en-GB')} values still to come` : `${(n - SHOW).toLocaleString('en-GB')} more, all stored`}</span>}
        </div>

        {isGen ? (
          <div className={s.row}>
            <Button primary onClick={pull}>
              <span className={s.mono}>next(squares)</span>
            </Button>
            <Button onClick={fresh}>Make a fresh generator</Button>
            <span className={s.mono} aria-live="polite">
              {stopped ? <span className={s.err}>StopIteration: no values left</span> : pulled.length ? <>→ {pulled[pulled.length - 1]}</> : <span className={s.muted}>nothing computed yet</span>}
            </span>
          </div>
        ) : (
          <div className={s.status}>A list doesn't need next(): all {n.toLocaleString('en-GB')} values were computed the moment the line ran.</div>
        )}

        <Controls>
          <Slider
            label="N (how many squares)"
            value={e}
            min={0}
            max={SIZES.length - 1}
            step={1}
            onChange={(v) => {
              setE(v)
              setPulled((p) => p.slice(0, SIZES[v].n))
              setStopped(false)
            }}
            format={(v) => SIZES[v].n.toLocaleString('en-GB')}
          />
        </Controls>
      </div>
    </Figure>
  )
}
