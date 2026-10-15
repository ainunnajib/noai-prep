import { useState } from 'react'
import { Figure, Controls, Slider, Plot, usePlot, useNarrow } from '../../../../../kit'
import { Py } from '../decisions/pyCode'
import s from '../decisions/ui.module.css'

/*
  range(start, stop, step) on a number line. Dots mark the values range() produces, arcs show
  each hop of size `step`, and the stop value gets a hollow "not included" ring. Presets cover the
  usual exam cases, including an empty range and a negative step.
*/

const LO = -5
const HI = 20

function rangeValues(start: number, stop: number, step: number): number[] {
  const out: number[] = []
  if (step === 0) return out
  if (step > 0) for (let v = start; v < stop; v += step) out.push(v)
  else for (let v = start; v > stop; v += step) out.push(v)
  return out
}

const PRESETS: { label: string; v: [number, number, number] }[] = [
  { label: 'range(5)', v: [0, 5, 1] },
  { label: 'range(2, 6)', v: [2, 6, 1] },
  { label: 'range(0, 10, 2)', v: [0, 10, 2] },
  { label: 'range(10, 0, -2)', v: [10, 0, -2] },
  { label: 'range(5, 0)', v: [5, 0, 1] },
]

/** How the call is usually written: range(stop), range(start, stop) or range(start, stop, step). */
function callText(start: number, stop: number, step: number) {
  if (step === 1 && start === 0) return `range(${stop})`
  if (step === 1) return `range(${start}, ${stop})`
  return `range(${start}, ${stop}, ${step})`
}

function Line({ vals, start, stop, step, narrow }: { vals: number[]; start: number; stop: number; step: number; narrow: boolean }) {
  const { xs, ys } = usePlot()
  // keep the line a fixed distance above the bottom edge, leaving room for labels below and hops above
  const yL = ys.range()[0] - 44
  const ticks = Array.from({ length: HI - LO + 1 }, (_, k) => LO + k)
  const set = new Set(vals)
  // On a narrow screen there is no room to number every tick. Label the start and the values produced first, then the
  // stop, then the multiples of 5, skipping any label that would touch one already placed.
  const labelled = new Set<number>()
  if (narrow) {
    const width = (t: number) => String(t).length
    const fits = (t: number) => [...labelled].every((u) => Math.abs(t - u) >= (width(t) + width(u) > 2 ? 2 : 1))
    for (const t of [start, ...vals, stop, ...ticks.filter((u) => u % 5 === 0)]) if (t >= LO && t <= HI && !labelled.has(t) && fits(t)) labelled.add(t)
  }
  return (
    <g>
      <line x1={xs(LO - 0.6)} x2={xs(HI + 0.6)} y1={yL} y2={yL} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
      {ticks.map((t) => {
        const showLabel = !narrow || labelled.has(t)
        return (
          <g key={t}>
            <line x1={xs(t)} x2={xs(t)} y1={yL - 4} y2={yL + 4} style={{ stroke: 'var(--viz-axis)', strokeWidth: t % 5 === 0 ? 1.5 : 1 }} />
            {showLabel && (
              <text
                x={xs(t)}
                y={yL + 19}
                textAnchor="middle"
                style={{ fill: set.has(t) ? 'var(--viz-1)' : 'var(--ink-3)', fontSize: narrow ? 11 : 11.5, fontWeight: set.has(t) ? 800 : 400 }}
              >
                {t}
              </text>
            )}
          </g>
        )
      })}
      {/* hops */}
      {vals.slice(1).map((v, i) => {
        const a = xs(vals[i])
        const b = xs(v)
        const h = Math.min(46, 10 + Math.abs(b - a) * 0.45)
        return (
          <path
            key={i}
            d={`M${a},${yL - 8}Q${(a + b) / 2},${yL - 8 - h} ${b},${yL - 8}`}
            style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 1.6, opacity: 0.55 }}
          />
        )
      })}
      {/* stop ring: the value range() never reaches */}
      {stop >= LO && stop <= HI && (
        <g>
          <circle cx={xs(stop)} cy={yL} r={8} style={{ fill: 'var(--surface)', stroke: 'var(--viz-neg)', strokeWidth: 2.25 }} />
          <path
            d={`M${xs(stop) - 4},${yL - 4}L${xs(stop) + 4},${yL + 4}M${xs(stop) - 4},${yL + 4}L${xs(stop) + 4},${yL - 4}`}
            style={{ stroke: 'var(--viz-neg)', strokeWidth: 2 }}
          />
          <text x={xs(stop)} y={yL + 36} textAnchor="middle" style={{ fill: 'var(--viz-neg)', fontSize: 11, fontWeight: 700 }}>
            stop
          </text>
        </g>
      )}
      {/* produced values */}
      {vals.map((v, i) => (
        <circle key={v} cx={xs(v)} cy={yL} r={i === 0 ? 7.5 : 6.5} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 2 }} />
      ))}
      {step !== 0 && vals.length > 1 && (
        <text
          x={(xs(vals[0]) + xs(vals[1])) / 2}
          y={yL - 8 - Math.min(46, 10 + Math.abs(xs(vals[1]) - xs(vals[0])) * 0.45) / 2 - 7}
          textAnchor="middle"
          className="plot-label"
          style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 700 }}
        >
          {step > 0 ? `+${step}` : step}
        </text>
      )}
    </g>
  )
}

export default function RangeVisualiser() {
  const [start, setStart] = useState(2)
  const [stop, setStop] = useState(12)
  const [step, setStep] = useState(3)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const vals = rangeValues(start, stop, step)
  const call = callText(start, stop, step)

  const setAll = ([a, b, c]: [number, number, number]) => {
    setStart(a)
    setStop(b)
    setStep(c)
  }

  let note
  if (step === 0) note = <>A step of 0 would never move, so Python refuses: <Py>{'ValueError: range() arg 3 must not be zero'}</Py>.</>
  else if (vals.length === 0)
    note =
      step > 0 ? (
        <>
          <strong>Empty!</strong> With a positive step, Python counts <em>up</em> from {start}, but {start} is not below the stop value {stop}, so there is
          nothing to produce. To count down, use a negative step.
        </>
      ) : (
        <>
          <strong>Empty!</strong> With a negative step, Python counts <em>down</em> from {start}, but {start} is not above the stop value {stop}.
        </>
      )
  else
    note = (
      <>
        Starts at <strong>{start}</strong>, moves by <strong>{step}</strong> each time, and stops <strong>before</strong> reaching {stop}
        {vals[vals.length - 1] + step === stop ? ` (the next value would have been ${stop} itself, which is excluded)` : ''}. That is{' '}
        <strong>{vals.length}</strong> value{vals.length === 1 ? '' : 's'}, so a loop over it runs {vals.length} time{vals.length === 1 ? '' : 's'}.
      </>
    )

  return (
    <Figure
      title="What does range() produce?"
      caption={
        <>
          Drag the sliders or pick a preset. The blue dots are the values <code>range(start, stop, step)</code> produces; the red ring is{' '}
          <code>stop</code>, which is never included. Try a negative step, then a start that is already past the stop. Notice that{' '}
          <code>range(5)</code> gives exactly the five indices 0 to 4 of a five-letter word.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <div className={s.chips} style={{ justifyContent: 'center' }}>
          {PRESETS.map((p) => (
            <button key={p.label} type="button" className={`${s.chip} ${call === p.label ? s.chipOn : ''}`} onClick={() => setAll(p.v)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className={s.bigExpr} aria-live="polite">
          <Py>{`list(${call})`}</Py>
          <span className={s.arrow}>→</span>
          <Py>{step === 0 ? 'ValueError' : `[${vals.join(', ')}]`}</Py>
        </div>
        <Plot
          x={[LO - 0.8, HI + 0.8]}
          y={[0, 3]}
          width={640}
          height={124}
          minHeight={124}
          margin={{ top: 8, right: 10, bottom: 8, left: 10 }}
          ariaLabel={`Number line from ${LO} to ${HI}. ${call} produces ${vals.length ? vals.join(', ') : 'nothing'}.`}
        >
          <Line vals={vals} start={start} stop={stop} step={step} narrow={narrow} />
        </Plot>
        <div className={s.status}>{note}</div>
        <Controls>
          <Slider label="start" value={start} min={LO} max={HI} step={1} onChange={setStart} />
          <Slider label="stop" value={stop} min={LO} max={HI} step={1} onChange={setStop} />
          <Slider label="step" value={step} min={-5} max={5} step={1} onChange={setStep} />
        </Controls>
      </div>
    </Figure>
  )
}
