import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button, usePlayer, Plot, Grid, Axes, Path, Dots, Rect, Label, mulberry32, useBump } from '../../../../../kit'
import { gauss } from './sim'
import s from './cv.module.css'

/*
  The two protocols from the 2026 Prelim (Q292), simulated.
  Each tuning iteration produces a new model whose TRUE accuracy (on all future data) is between
  89.5% and 91%: the tweaks barely matter. Measuring a model on a finite set of rows adds luck.
    Protocol A: 70% train / 30% test. After every tweak, check the test score; report the best one.
    Protocol B: 60% train / 20% validation / 20% test. Choose by validation score; test the chosen
                model once and report that.
  Aha: A's reported score climbs with every peek although no model is truly better; B is unbiased.
  The bottom line averages 400 simulated runs, so the bias is not a fluke of one run.
*/

const T_MAX = 100
const SEED0 = 9005
const TRUE_LO = 0.895
const TRUE_HI = 0.91

/**
 * Accuracy measured on m rows when the true accuracy is a: a whole number of correct rows,
 * drawn from the normal approximation to the binomial (mean a, standard error sqrt(a(1 - a)/m)).
 */
function measure(a: number, m: number, rng: () => number): number {
  const ok = Math.round(m * (a + Math.sqrt((a * (1 - a)) / m) * gauss(rng)))
  return Math.max(0, Math.min(m, ok)) / m
}

interface Sim {
  trueAcc: number[]
  testA: number[]
  valB: number[]
  testB: number[]
}

function simulate(rows: number, rng: () => number): Sim {
  const mA = Math.round(rows * 0.3)
  const mB = Math.round(rows * 0.2)
  const sim: Sim = { trueAcc: [], testA: [], valB: [], testB: [] }
  for (let t = 0; t < T_MAX; t++) {
    const a = TRUE_LO + (TRUE_HI - TRUE_LO) * rng()
    sim.trueAcc.push(a)
    sim.testA.push(measure(a, mA, rng))
    sim.valB.push(measure(a, mB, rng))
    sim.testB.push(measure(a, mB, rng))
  }
  return sim
}

/** average over many simulated runs of (reported - true), after each number of iterations */
function averageBias(rows: number, runs: number): { a: number[]; b: number[] } {
  const rng = mulberry32(55 + rows)
  const a = new Array<number>(T_MAX).fill(0)
  const b = new Array<number>(T_MAX).fill(0)
  for (let r = 0; r < runs; r++) {
    const sim = simulate(rows, rng)
    let iA = 0
    let iB = 0
    for (let k = 0; k < T_MAX; k++) {
      if (sim.testA[k] > sim.testA[iA]) iA = k
      if (sim.valB[k] > sim.valB[iB]) iB = k
      a[k] += (sim.testA[iA] - sim.trueAcc[iA]) / runs
      b[k] += (sim.testB[iB] - sim.trueAcc[iB]) / runs
    }
  }
  return { a, b }
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`
const signed = (v: number) => `${v >= -0.0005 ? '+' : '−'}${Math.abs(v * 100).toFixed(1)}`

export default function ProtocolCompare() {
  const [rows, setRows] = useState(1000)
  const [seed, bump] = useBump()
  const player = usePlayer({ steps: T_MAX, interval: 60 })
  // complete at rest: start with all 100 iterations shown
  useEffect(() => {
    player.setStep(T_MAX - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const t = player.step + 1 // iterations so far

  const sim = useMemo(() => simulate(rows, mulberry32(SEED0 + seed * 7717 + rows)), [rows, seed])
  const bias = useMemo(() => averageBias(rows, 400), [rows])

  // running choices
  const { lineA, lineB, iA, iB } = useMemo(() => {
    const lineA: [number, number][] = []
    const lineB: [number, number][] = []
    let iA = 0
    let iB = 0
    for (let k = 0; k < t; k++) {
      if (sim.testA[k] > sim.testA[iA]) iA = k
      if (sim.valB[k] > sim.valB[iB]) iB = k
      lineA.push([k + 1, sim.testA[iA]])
      lineB.push([k + 1, sim.testB[iB]])
    }
    return { lineA, lineB, iA, iB }
  }, [sim, t])

  const repA = sim.testA[iA]
  const repB = sim.testB[iB]
  const colA = 'var(--viz-neg)'
  const colB = 'var(--viz-pos)'
  const yLo = 0.84
  const yHi = 0.98

  const splitBar = (parts: [string, number, string][]) => (
    <div style={{ display: 'flex', width: '100%', borderRadius: 6, overflow: 'hidden', fontSize: '0.72rem', fontWeight: 700 }}>
      {parts.map(([name, w, c]) => (
        <span
          key={name}
          style={{
            width: `${w}%`,
            padding: '3px 4px',
            textAlign: 'center',
            background: `color-mix(in srgb, ${c} 26%, var(--surface))`,
            color: 'var(--ink)',
            borderRight: '2px solid var(--surface)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {name}
        </span>
      ))}
    </div>
  )

  return (
    <Figure
      title="Peeking at the test set: two protocols"
      caption={
        <>
          Every model tried here is truly between {pct(TRUE_LO)} and {pct(TRUE_HI)} accurate (the shaded band): the tweaks do not really help. Grey
          dots are the test scores Protocol A looks at after each tweak; they scatter because a test set is a finite sample. A <b>keeps the best of
          many lucky draws</b>, so its report (red) ratchets upwards with every peek. B's single test score (green) also wobbles, a little above or
          below the truth, but nothing pushes it up. Press <b>Play</b>, drag the iterations slider, try <b>New run</b>, or switch to 10,000 rows: a
          bigger test set shrinks the luck, but A is still biased upwards.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.panels}>
          <div className={s.panel}>
            <p className={s.panelTitle}>
              <span className={s.badge} style={{ color: colA }}>
                Protocol A
              </span>
            </p>
            {splitBar([
              ['train 70%', 70, 'var(--viz-1)'],
              ['test 30%', 30, colA],
            ])}
            <div className={s.small}>Tweak, check the test score, repeat; report the best test score.</div>
            <div className={s.stats}>
              <span className={s.stat}>
                <span className={s.statNum} style={{ color: colA }}>
                  {pct(repA)}
                </span>
                <span>reported</span>
              </span>
              <span className={s.stat}>
                <span className={s.statNum}>{pct(sim.trueAcc[iA])}</span>
                <span>true accuracy</span>
              </span>
            </div>
          </div>
          <div className={s.panel}>
            <p className={s.panelTitle}>
              <span className={s.badge} style={{ color: colB }}>
                Protocol B
              </span>
            </p>
            {splitBar([
              ['train 60%', 60, 'var(--viz-1)'],
              ['val 20%', 20, 'var(--viz-2)'],
              ['test 20%', 20, colB],
            ])}
            <div className={s.small}>Tweak, check the validation score, repeat; test the chosen model once.</div>
            <div className={s.stats}>
              <span className={s.stat}>
                <span className={s.statNum} style={{ color: colB }}>
                  {pct(repB)}
                </span>
                <span>reported</span>
              </span>
              <span className={s.stat}>
                <span className={s.statNum}>{pct(sim.trueAcc[iB])}</span>
                <span>true accuracy</span>
              </span>
              <span className={s.stat}>
                <span className={s.statNum} style={{ color: 'var(--viz-2)' }}>
                  {pct(sim.valB[iB])}
                </span>
                <span>best validation score</span>
              </span>
            </div>
          </div>
        </div>

        <Plot
          x={[0, T_MAX + 1]}
          y={[yLo, yHi]}
          width={520}
          height={260}
          minHeight={220}
          margin={{ left: 48, right: 16, top: 14, bottom: 38 }}
          ariaLabel={`After ${t} tuning iterations, Protocol A reports ${pct(repA)} and Protocol B reports ${pct(repB)}; every model is truly about 90% accurate.`}
        >
          <Grid xTicks={10} yTicks={7} />
          <Rect x0={0} x1={T_MAX + 1} y0={TRUE_LO} y1={TRUE_HI} fill="color-mix(in srgb, var(--viz-5) 18%, transparent)" />
          <Axes xLabel="tuning iterations" yLabel="accuracy" xTicks={5} yTicks={7} tickFormat={(v) => (v > 0.5 && v < 1.5 ? `${Math.round(v * 100)}%` : String(v))} />
          <Label x={T_MAX} y={TRUE_LO} dy={14} anchor="end" color="var(--viz-5)">
            true accuracy of every model
          </Label>
          <Dots points={sim.testA.slice(0, t).map((v, k) => ({ x: k + 1, y: v, r: 2.6, color: 'var(--viz-muted)' }))} stroke="none" />
          <Path points={lineB} color={colB} width={3} />
          <Path points={lineA} color={colA} width={3} />
          <Dots
            points={[
              { x: t, y: repA, r: 5.5, color: colA },
              { x: t, y: repB, r: 5.5, color: colB },
            ]}
          />
          <Label x={Math.max(t, 14)} y={repA} dx={-4} dy={-10} anchor="end" color={colA}>
            {`A reports ${pct(repA)}`}
          </Label>
          <Label x={Math.max(t, 14)} y={repB} dx={-4} dy={repB > repA - 0.012 ? 20 : -10} anchor="end" color={colB}>
            {`B reports ${pct(repB)}`}
          </Label>
        </Plot>

        <p className={s.small} style={{ margin: 0 }}>
          Averaged over 400 simulated runs of {t} iteration{t === 1 ? '' : 's'}, reported minus true accuracy is{' '}
          <b style={{ color: colA }}>{signed(bias.a[t - 1])} points</b> for A and <b style={{ color: colB }}>{signed(bias.b[t - 1])} points</b> for B.
        </p>

        <Controls>
          <Slider label="tuning iterations" value={t} min={1} max={T_MAX} step={1} onChange={(v) => { player.pause(); player.setStep(v - 1) }} />
          <Segmented
            label="Rows in the dataset"
            value={rows}
            onChange={setRows}
            options={[
              { value: 1000, label: '1,000' },
              { value: 10000, label: '10,000' },
            ]}
          />
          <Button primary onClick={player.toggle}>
            {player.playing ? 'Pause' : t >= T_MAX ? 'Replay' : 'Play'}
          </Button>
          <Button onClick={bump}>New run</Button>
        </Controls>
      </div>
    </Figure>
  )
}
