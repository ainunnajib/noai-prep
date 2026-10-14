import { useState } from 'react'
import { Figure, Controls, Slider, Toggle, M } from '../../../../../kit'
import { comma, fromLog10, timeAtMicrosecond } from './format'
import s from './algo.module.css'

/*
  The growth race. For each complexity class we compute log10(steps) at the chosen n, so even
  2^n at n = 1,000,000 (a number with 301,030 digits) can be shown without overflowing.
  Bars use a linear axis (relative to the biggest shown class) or a fixed log axis from 1 to 10^13.
*/

const N_VALUES = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000]
const LOG_MAX = 13 // log axis runs from 10^0 to 10^13 steps

interface Cls {
  id: string
  tex: string
  name: string
  colour: string
  lg: (n: number) => number // log10 of the number of steps
}

const CLASSES: Cls[] = [
  { id: 'c', tex: 'O(1)', name: 'constant', colour: 'var(--viz-3)', lg: () => 0 },
  { id: 'log', tex: 'O(\\log n)', name: 'logarithmic', colour: 'var(--viz-1)', lg: (n) => Math.log10(Math.log2(n)) },
  { id: 'n', tex: 'O(n)', name: 'linear', colour: 'var(--viz-5)', lg: (n) => Math.log10(n) },
  { id: 'nlogn', tex: 'O(n \\log n)', name: 'n log n', colour: 'var(--viz-6)', lg: (n) => Math.log10(n * Math.log2(n)) },
  { id: 'n2', tex: 'O(n^2)', name: 'quadratic', colour: 'var(--viz-2)', lg: (n) => 2 * Math.log10(n) },
  { id: 'exp', tex: 'O(2^n)', name: 'exponential', colour: 'var(--viz-4)', lg: (n) => n * Math.log10(2) },
]

const AXIS_LOG: [number, string][] = [
  [0, '1'],
  [3, '10³'],
  [6, '10⁶'],
  [9, '10⁹'],
  [12, '10¹²'],
]

// log10 of the age of the universe in microseconds (1.38e10 years).
const LG_UNIVERSE_US = Math.log10(1.38e10 * 365.25 * 24 * 3600) + 6

export default function BigORace() {
  const [idx, setIdx] = useState(6) // n = 1000
  const [logScale, setLogScale] = useState(false)
  const [shown, setShown] = useState<Record<string, boolean>>({ c: true, log: true, n: true, nlogn: true, n2: true, exp: false })
  const n = N_VALUES[idx]

  const rows = CLASSES.filter((c) => shown[c.id]).map((c) => ({ ...c, l: c.lg(n) }))
  const maxLg = Math.max(0, ...rows.map((r) => r.l))

  const width = (l: number) => {
    if (logScale) return Math.min(100, (l / LOG_MAX) * 100)
    return 100 * Math.pow(10, l - maxLg)
  }

  const lgN2 = 2 * Math.log10(n)
  const lgNlogN = Math.log10(n * Math.log2(n))
  const lgExp = n * Math.log10(2)

  return (
    <Figure
      title="The growth race"
      caption={
        <>
          Slide <M>n</M> from 10 up to a million and watch the time column (at one step per microsecond, a round number for one simple
          operation). On the ordinary axis the biggest class squashes everything else flat; switch on the log axis
          to see all of them at once (each grid line is 1000 times the one before). Then switch on <M>O(2^n)</M>: it is already off the
          chart at <M>n = 50</M>.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.chips} role="group" aria-label="Complexity classes to show">
          {CLASSES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={s.chip}
              style={{ ['--c' as string]: c.colour }}
              aria-pressed={shown[c.id]}
              onClick={() => setShown((v) => ({ ...v, [c.id]: !v[c.id] }))}
            >
              <M>{c.tex}</M>
            </button>
          ))}
        </div>

        <div className={s.race} role="list" aria-label={`Number of steps for each complexity class at n = ${comma(n)}`}>
          {rows.length === 0 && <div className={s.muted}>Switch on at least one class above.</div>}
          {rows.map((r) => {
            const w = width(r.l)
            const off = logScale && r.l > LOG_MAX
            return (
              <div key={r.id} className={s.raceRow} role="listitem">
                <div className={s.raceHead}>
                  <span className={s.raceName}>
                    <M>{r.tex}</M>
                    <span className={s.raceSub}>{r.name}</span>
                  </span>
                  <span className={s.raceVal}>
                    <b>{fromLog10(r.l)}</b> {r.l === 0 ? 'step' : 'steps'} · {timeAtMicrosecond(r.l)}
                  </span>
                </div>
                <div className={s.raceTrack}>
                  {logScale &&
                    AXIS_LOG.slice(1).map(([d]) => <span key={d} className={s.raceGrid} style={{ left: `${(d / LOG_MAX) * 100}%` }} />)}
                  <span className={s.raceFill} style={{ width: `max(3px, ${w}%)`, background: r.colour }} />
                  {off && <span className={s.raceOff}>off the chart →</span>}
                </div>
              </div>
            )
          })}
          {rows.length > 0 && (
            <div className={s.axis} aria-hidden="true">
              {logScale ? (
                AXIS_LOG.map(([d, t], i) => (
                  <span key={d} style={{ left: `${(d / LOG_MAX) * 100}%`, transform: i === 0 ? 'none' : 'translateX(-50%)' }}>
                    {t}
                  </span>
                ))
              ) : (
                <>
                  <span style={{ left: 0, transform: 'none' }}>0</span>
                  <span style={{ left: '100%', transform: 'translateX(-100%)' }}>{fromLog10(maxLg)} steps</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className={s.verdict} aria-live="polite">
          At <b>n = {comma(n)}</b>, an <M>O(n \log n)</M> method needs about {timeAtMicrosecond(lgNlogN)} but an <M>O(n^2)</M> one needs{' '}
          {timeAtMicrosecond(lgN2)}
          {lgExp > LG_UNIVERSE_US ? (
            <>
              , and <M>O(2^n)</M> would take longer than the age of the universe.
            </>
          ) : (
            <>
              , and <M>O(2^n)</M> would take {timeAtMicrosecond(lgExp)}.
            </>
          )}
        </div>

        <Controls>
          <Slider label={<>input size <M>n</M></>} value={idx} min={0} max={N_VALUES.length - 1} step={1} onChange={setIdx} format={(i) => comma(N_VALUES[i])} />
          <Toggle label="Log axis" checked={logScale} onChange={setLogScale} />
        </Controls>
      </div>
    </Figure>
  )
}
