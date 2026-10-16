import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Button, Plot, Grid, Axes, Path, HLine, Label } from '../../../../../kit'
import { STALLS, MEALS, BEST, EPSILONS, newDiner, eat, simulate, type Diner } from './bandit'

/*
  Exploration versus exploitation with ε-greedy, as lunch at a hawker centre.
  Top: one diner's running-average estimate of each stall (bars) against the hidden true average (tick).
  Bottom: what happens on average, over 500 simulated diners, for each ε.
*/

const SIM_DINERS = 500
const COLOUR: Record<number, string> = { 0: 'var(--viz-4)', 0.1: 'var(--viz-3)', 0.5: 'var(--viz-2)', 1: 'var(--viz-5)' }
const EPS_TEXT: Record<number, string> = { 0: 'never explore', 0.1: 'explore 1 meal in 10', 0.5: 'explore half the time', 1: 'always random' }
const SCALE = 10
const LABEL_T = 62

type Sim = ReturnType<typeof simulate>

const small: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }

function smooth(v: number[], k = 5): number[] {
  return v.map((_, i) => {
    const lo = Math.max(0, i - k + 1)
    const seg = v.slice(lo, i + 1)
    return seg.reduce((s, x) => s + x, 0) / seg.length
  })
}

export default function BanditBars() {
  const [eps, setEps] = useState(0.1)
  const [seed, setSeed] = useState(3)
  const dRef = useRef<Diner>(newDiner(3))
  const [, force] = useReducer((x: number) => x + 1, 0)
  const [running, setRunning] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [yours, setYours] = useState<Record<string, number>>({})
  const [sims, setSims] = useState<Record<string, Sim> | null>(null)

  // the 500-diner averages are computed once, just after the first paint
  useEffect(() => {
    const id = window.setTimeout(() => {
      const out: Record<string, Sim> = {}
      for (const e of EPSILONS) out[String(e)] = simulate(e, SIM_DINERS, 2027)
      setSims(out)
    }, 30)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      const d = dRef.current
      if (d.t >= MEALS) {
        setRunning(false)
        return
      }
      eat(d, eps)
      if (d.t >= MEALS) {
        setRunning(false)
        setReveal(true)
        setYours((y) => ({ ...y, [String(eps)]: d.total }))
      }
      force()
    }, 28)
    return () => window.clearInterval(id)
  }, [running, eps])

  const newRun = (s = seed + 1) => {
    setRunning(false)
    setSeed(s)
    // a new diner starts out not knowing the true averages again
    setReveal(false)
    dRef.current = newDiner(s)
    force()
  }
  const one = () => {
    const d = dRef.current
    if (d.t >= MEALS) return
    eat(d, eps)
    if (d.t >= MEALS) {
      setReveal(true)
      setYours((y) => ({ ...y, [String(eps)]: d.total }))
    }
    force()
  }

  const d = dRef.current
  const done = d.t >= MEALS
  // the true averages appear automatically after meal 100 (the toggle switches on to match), and can be hidden again
  const showTruth = reveal
  const atBest = d.N[BEST]
  const maxTotal = 800

  return (
    <Figure
      title="Four stalls, 100 lunches: explore or exploit?"
      caption={
        <>
          You eat lunch at one of four stalls each day. Each meal's satisfaction score is random around the stall's true average, which you
          cannot see. The bars are your running averages so far. Pick ε (how often you try a random stall), then eat 100 meals. With ε = 0 you
          lock onto whichever stall you happened to try first; with ε = 1 you never use what you learned. A little exploration wins, as the
          averages over 500 simulated diners show.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gap: '0.45rem' }} role="list" aria-label="Estimated satisfaction for each stall">
        {STALLS.map((s, i) => {
          const isLast = d.last?.stall === i
          const q = d.Q[i]
          return (
            <div
              key={s.name}
              role="listitem"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(5.8em, 7.5em) 1fr 3.4em',
                gap: '0.5rem',
                alignItems: 'center',
                padding: '0.3rem 0.45rem',
                borderRadius: 8,
                background: isLast ? 'var(--accent-soft)' : 'transparent',
                outline: isLast ? '1.5px solid var(--accent-line)' : 'none',
              }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
                {s.name}
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-3)' }}>
                  {d.N[i]} meal{d.N[i] === 1 ? '' : 's'}
                </span>
              </span>
              <span style={{ position: 'relative', height: 18, borderRadius: 4, background: 'var(--surface-3)' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${Math.max(0, Math.min(1, q / SCALE)) * 100}%`,
                    borderRadius: 4,
                    background: i === BEST && showTruth ? 'var(--viz-3)' : 'var(--viz-1)',
                    transition: 'width 120ms',
                  }}
                />
                {showTruth && (
                  <span
                    title={`true average ${s.mean}`}
                    style={{ position: 'absolute', left: `calc(${(s.mean / SCALE) * 100}% - 1.5px)`, top: -4, bottom: -4, width: 3, borderRadius: 2, background: 'var(--viz-ink)' }}
                  />
                )}
              </span>
              <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)', textAlign: 'right' }}>
                {d.N[i] ? q.toFixed(1) : '?'}
              </span>
            </div>
          )
        })}
      </div>
      <div style={{ width: '100%', fontSize: '0.875rem', color: 'var(--ink-2)', minHeight: '1.4em' }}>
        {d.last
          ? `Meal ${d.t}: ${d.last.explored ? 'explored (random stall)' : 'exploited (best average so far)'} → ${STALLS[d.last.stall].name}, scored ${d.last.reward.toFixed(1)}.`
          : 'No meals yet: every stall has an unknown average (?).'}
        {showTruth && <span style={{ color: 'var(--ink-3)' }}> Ticks: true averages.</span>}
      </div>
      <Controls>
        <Segmented
          label="ε (exploration rate)"
          value={eps}
          onChange={(v) => {
            setEps(v)
            newRun()
          }}
          options={EPSILONS.map((e) => ({ value: e, label: String(e) }))}
        />
      </Controls>
      <Controls>
        <Button primary onClick={() => (done ? (newRun(), setRunning(true)) : setRunning((r) => !r))}>
          {running ? 'Pause' : done ? 'New diner, eat 100' : d.t > 0 ? 'Keep eating' : 'Eat 100 meals'}
        </Button>
        <Button onClick={one} disabled={done}>
          Eat 1 meal
        </Button>
        <Button onClick={() => newRun()}>New diner</Button>
        <Toggle label="Show true averages" checked={reveal} onChange={setReveal} />
      </Controls>
      <Readout
        items={[
          ['meals', `${d.t} / ${MEALS}`],
          ['total satisfaction', d.total.toFixed(0)],
          ['at the best stall', `${atBest} of ${d.t}`],
        ]}
      />
      <div style={{ width: '100%', borderTop: '1px dashed var(--rule)', paddingTop: '0.8rem', display: 'grid', gap: '0.5rem' }}>
        <div style={small}>Total satisfaction after 100 meals</div>
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          {EPSILONS.map((e) => {
            const avg = sims?.[String(e)]?.total
            const mine = yours[String(e)]
            const on = e === eps
            return (
              <div key={e} style={{ display: 'grid', gridTemplateColumns: 'minmax(6.5em, 9.5em) 1fr 3em', gap: '0.5rem', alignItems: 'center', fontSize: '0.8125rem', opacity: on ? 1 : 0.8 }}>
                <span style={{ fontWeight: on ? 800 : 600, color: 'var(--ink)', lineHeight: 1.2 }}>
                  <span style={{ color: COLOUR[e] }}>■</span> ε = {e}
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-3)' }}>{EPS_TEXT[e]}</span>
                </span>
                <span style={{ position: 'relative', height: 16, borderRadius: 4, background: 'var(--surface-3)' }}>
                  {avg !== undefined && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(avg / maxTotal) * 100}%`, borderRadius: 4, background: COLOUR[e], opacity: on ? 1 : 0.7 }} />}
                  {mine !== undefined && (
                    <span title={`your run: ${mine.toFixed(0)}`} style={{ position: 'absolute', left: `calc(${Math.max(0, Math.min(1, mine / maxTotal)) * 100}% - 5px)`, top: 3, width: 10, height: 10, borderRadius: '50%', background: 'var(--surface)', border: '2.5px solid var(--viz-ink)' }} />
                  )}
                </span>
                <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)', textAlign: 'right' }}>
                  {avg !== undefined ? avg.toFixed(0) : '…'}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>
          Bars: average of {SIM_DINERS} simulated diners (eating at the best stall every time would score 800). ○ your own most recent run with that ε.
        </div>
        <div style={{ ...small, marginTop: '0.4rem' }}>Average score of meal number t, over {SIM_DINERS} diners</div>
        <Plot x={[1, MEALS]} y={[5, 8.4]} width={520} height={210} minHeight={220} maxWidth={640} margin={{ top: 12, bottom: 36, left: 36, right: 12 }} ariaLabel="Average satisfaction per meal for each epsilon: epsilon 0.1 climbs towards 8, epsilon 0 and 1 stay flat near 5.75">
          <Grid xTicks={5} yTicks={4} />
          <Axes xLabel="meal number t" yTicks={4} xTicks={5} />
          <HLine y={8} color="var(--viz-muted)" />
          <Label x={1} y={8} dx={6} dy={-6} color="var(--ink-3)" weight={700}>
            best stall every time
          </Label>
          {sims &&
            EPSILONS.map((e) => {
              const pts = smooth(sims[String(e)].perMeal).map((v, i) => [i + 1, v] as [number, number])
              return <Path key={e} points={pts} color={COLOUR[e]} width={e === eps ? 3.5 : 1.8} opacity={e === eps ? 1 : 0.55} />
            })}
          {sims && (
            <>
              <Label x={LABEL_T} y={smooth(sims['0.1'].perMeal)[LABEL_T - 1]} dy={-9} anchor="middle" color={COLOUR[0.1]} weight={800}>
                ε = 0.1
              </Label>
              <Label x={LABEL_T} y={smooth(sims['0.5'].perMeal)[LABEL_T - 1]} dy={19} anchor="middle" color={COLOUR[0.5]} weight={800}>
                ε = 0.5
              </Label>
              <Label x={LABEL_T} y={Math.min(smooth(sims['0'].perMeal)[LABEL_T - 1], smooth(sims['1'].perMeal)[LABEL_T - 1])} dy={19} anchor="middle" color="var(--ink-2)" weight={800}>
                ε = 0 and ε = 1
              </Label>
            </>
          )}
        </Plot>
      </div>
    </Figure>
  )
}
