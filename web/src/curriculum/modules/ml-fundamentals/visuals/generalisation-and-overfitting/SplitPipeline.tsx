import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Slider, Toggle, usePlayer, PlayerControls, Plot, Grid, Axes, Path, Dots, Label, HLine, VLine, useNarrow, mulberry32 } from '../../../../../kit'
import { gaussian } from './polyfit'

/*
  Train / validation / test. A bar shows how 1,000 labelled examples are split. Step through the
  workflow: fit on the training set, choose a hyperparameter setting with the validation set,
  then open the sealed test set once to report. Turn on "peek" to choose the setting by its TEST
  score instead, and the reported score becomes too optimistic.

  The bottom chart is a simulation of 1,000 projects. Each project tries m settings whose true
  accuracies are close to 88%. A score measured on a set of n examples is the true accuracy plus
  random noise of size sqrt(p(1 - p) / n). We record (reported score) − (true accuracy of the
  chosen setting), averaged over the projects.
  Aha: the test set is a sealed envelope; open it once at the end.
*/

const N_TOTAL = 1000
const M_MAX = 50
const PROJECTS = 1000
const BASE = 0.88
const SPREAD = 0.012

interface Sim {
  honest: number[]
  peek: number[]
  honestTrue: number[]
  peekTrue: number[]
  honestRep: number[]
  peekRep: number[]
}

/** average over many simulated projects, for every number of settings tried m = 1..M_MAX */
function simulate(nVal: number, nTest: number): Sim {
  const rng = mulberry32(2027)
  const acc = {
    honest: new Array(M_MAX).fill(0),
    peek: new Array(M_MAX).fill(0),
    honestTrue: new Array(M_MAX).fill(0),
    peekTrue: new Array(M_MAX).fill(0),
    honestRep: new Array(M_MAX).fill(0),
    peekRep: new Array(M_MAX).fill(0),
  }
  for (let r = 0; r < PROJECTS; r++) {
    let bestVal = -1
    let hTrue = 0
    let hTest = 0
    let bestTest = -1
    let pTrue = 0
    for (let j = 0; j < M_MAX; j++) {
      const p = Math.min(0.99, BASE + SPREAD * gaussian(rng))
      const sd = (n: number) => Math.sqrt((p * (1 - p)) / n)
      const val = p + sd(nVal) * gaussian(rng)
      const test = p + sd(nTest) * gaussian(rng)
      if (val > bestVal) {
        bestVal = val
        hTrue = p
        hTest = test
      }
      if (test > bestTest) {
        bestTest = test
        pTrue = p
      }
      acc.honest[j] += (hTest - hTrue) / PROJECTS
      acc.peek[j] += (bestTest - pTrue) / PROJECTS
      acc.honestTrue[j] += hTrue / PROJECTS
      acc.peekTrue[j] += pTrue / PROJECTS
      acc.honestRep[j] += hTest / PROJECTS
      acc.peekRep[j] += bestTest / PROJECTS
    }
  }
  return acc
}

const pct = (v: number) => `${(100 * v).toFixed(1)}%`
const pts = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(100 * v).toFixed(1)}`

const SEG = {
  train: { name: 'Training', short: 'Train', color: 'var(--viz-1)' },
  val: { name: 'Validation', short: 'Val', color: 'var(--viz-5)' },
  test: { name: 'Test', short: 'Test', color: 'var(--viz-2)' },
}

export default function SplitPipeline() {
  const [trainPct, setTrainPct] = useState(60)
  const [valPct, setValPct] = useState(20)
  const [m, setM] = useState(20)
  const [peek, setPeek] = useState(false)
  const player = usePlayer({ steps: 3, interval: 2400 })
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const step = player.step

  const v = Math.min(valPct, 95 - trainPct)
  const testPct = 100 - trainPct - v
  const nTrain = (N_TOTAL * trainPct) / 100
  const nVal = (N_TOTAL * v) / 100
  const nTest = (N_TOTAL * testPct) / 100
  const sim = useMemo(() => simulate(nVal, nTest), [nVal, nTest])

  const active: Record<'train' | 'val' | 'test', boolean> = {
    train: step === 0 || step === 1,
    val: step === 1 && !peek,
    test: step === 2 || (step === 1 && peek),
  }

  const seg = (k: 'train' | 'val' | 'test', pctv: number, n: number) => {
    const on = active[k]
    const warn = k === 'test' && peek && step === 1
    const style: CSSProperties = {
      flex: `${pctv} 1 0`,
      minWidth: 0,
      padding: '0.4rem 0.3rem',
      textAlign: 'center',
      background: on ? `color-mix(in srgb, ${SEG[k].color} 78%, var(--surface))` : `color-mix(in srgb, ${SEG[k].color} 22%, var(--surface))`,
      color: on ? 'var(--surface)' : 'var(--ink)',
      fontSize: '0.8rem',
      fontWeight: 700,
      lineHeight: 1.25,
      outline: warn ? '3px dashed var(--viz-neg)' : 'none',
      outlineOffset: -3,
      transition: 'background 0.25s',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    }
    return (
      <div key={k} style={style} title={`${SEG[k].name}: ${n} examples`}>
        {narrow ? (pctv >= 10 ? SEG[k].short : SEG[k].short[0]) : SEG[k].name}
        <div style={{ fontWeight: 500, fontSize: '0.75rem' }}>
          {Math.round(n)}
          {k === 'test' && step < 2 && !peek && !narrow ? ' (sealed)' : ''}
        </div>
      </div>
    )
  }

  const honestRep = sim.honestRep[m - 1]
  const honestTrue = sim.honestTrue[m - 1]
  const peekRep = sim.peekRep[m - 1]
  const peekTrue = sim.peekTrue[m - 1]

  const stages: { title: string; body: ReactNode }[] = [
    {
      title: '1. Fit on the training set',
      body: (
        <>
          <code>model.fit(X_train, y_train)</code> learns the <b>parameters</b> from the {Math.round(nTrain)} training examples only. The other two
          sets stay unseen.
        </>
      ),
    },
    {
      title: peek ? '2. Tune… on the test set (peeking!)' : '2. Tune on the validation set',
      body: peek ? (
        <>
          For each of the <b>{m}</b> hyperparameter settings you fit on the training set, then score on the <b>test</b> set and keep the best. The test
          set is no longer unseen: you have chosen the setting that happens to suit those {Math.round(nTest)} examples.
        </>
      ) : (
        <>
          For each of the <b>{m}</b> hyperparameter settings (say, different tree depths) you fit on the training set and score on the{' '}
          <b>validation</b> set. Keep the setting with the best validation score. The test set stays sealed.
        </>
      ),
    },
    {
      title: '3. Report: open the test set once',
      body: peek ? (
        <>
          You report the test score you already used to choose: about <b>{pct(peekRep)}</b>. But on brand-new data the chosen model really scores
          about <b>{pct(peekTrue)}</b>. Your report is <b style={{ color: 'var(--viz-neg)' }}>{pts(peekRep - peekTrue)} points too optimistic</b>.
        </>
      ) : (
        <>
          Score the chosen model once on the test set: about <b>{pct(honestRep)}</b>. On brand-new data it really scores about{' '}
          <b>{pct(honestTrue)}</b>. An honest estimate: off by only {pts(honestRep - honestTrue)} points on average.
        </>
      ),
    },
  ]

  // plotted in percentage points
  const peekPts = sim.peek.map((y) => 100 * y)
  const honestPts = sim.honest.map((y) => 100 * y)
  const yMax = Math.max(3, Math.ceil(Math.max(...peekPts) + 0.5))

  return (
    <Figure
      title="Three sets, three jobs: the sealed envelope"
      caption={
        <>
          Press <b>Next</b> to walk through fit → tune → report and watch which part of the data each step touches. Then switch on <b>peek</b>, which
          chooses the hyperparameters by their test score. The bottom chart shows how far the reported score sits above the truth, averaged over{' '}
          {PROJECTS.toLocaleString('en-GB')} simulated projects. Slide the number of settings tried and the size of the test set: peeking gets worse the more you try and the
          smaller the test set, while the honest route stays on target.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.7rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-2)', textAlign: 'center' }}>{N_TOTAL.toLocaleString('en-GB')} labelled examples, split three ways</div>
        <div style={{ display: 'flex', width: '100%', borderRadius: 'var(--radius-m)', overflow: 'hidden', border: '1px solid var(--rule)' }} role="img" aria-label={`Training ${trainPct}%, validation ${v}%, test ${testPct}%`}>
          {seg('train', trainPct, nTrain)}
          {seg('val', v, nVal)}
          {seg('test', testPct, nTest)}
        </div>
        <div
          style={{
            borderRadius: 'var(--radius-m)',
            border: `1.5px solid ${peek && step >= 1 ? 'var(--viz-neg)' : 'var(--rule)'}`,
            background: 'var(--surface-2)',
            padding: '0.55rem 0.8rem',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            minHeight: narrow ? 150 : 110,
          }}
          aria-live="polite"
        >
          <div style={{ fontWeight: 750, marginBottom: 2, color: peek && step >= 1 ? 'var(--viz-neg)' : 'var(--ink)' }}>
            {stages[step].title}
          </div>
          {stages[step].body}
        </div>
        <PlayerControls player={player} label={(s) => `Step ${s + 1} of 3`} />
      </div>
      <Controls>
        <Slider label="training %" value={trainPct} min={40} max={80} step={5} onChange={(x) => setTrainPct(x)} format={(x) => `${x}%`} />
        <Slider label="validation %" value={v} min={5} max={Math.min(40, 95 - trainPct)} step={5} onChange={setValPct} format={(x) => `${x}% (test ${100 - trainPct - x}%)`} />
        <Slider label="hyperparameter settings tried" value={m} min={1} max={M_MAX} step={1} onChange={setM} />
        <Toggle label={<b style={{ color: peek ? 'var(--viz-neg)' : undefined }}>peek: tune on the test set</b>} checked={peek} onChange={setPeek} />
      </Controls>
      <div style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: 4 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }}>
          How optimistic is the reported score? (reported − true, in percentage points)
        </div>
        <Plot
          x={[0, M_MAX + 1]}
          y={[-1, yMax]}
          width={narrow ? 360 : 600}
          height={narrow ? 220 : 230}
          maxWidth={700}
          margin={{ left: 44, top: 16 }}
          ariaLabel={`With ${m} settings tried and ${Math.round(nTest)} test examples, peeking overstates the score by ${(100 * sim.peek[m - 1]).toFixed(1)} points; the honest route by ${(100 * sim.honest[m - 1]).toFixed(1)}.`}
          onPointerDown={([x]) => setM(Math.max(1, Math.min(M_MAX, Math.round(x))))}
        >
          <Grid xTicks={10} yTicks={5} />
          <Axes xLabel="settings tried" yLabel="points too high" xTicks={narrow ? 5 : 10} yTicks={5} />
          <HLine y={0} color="var(--viz-axis)" dash="" width={1.2} />
          <VLine x={m} color="var(--viz-ink)" dash="4 3" width={1.4} />
          <Path points={peekPts.map((y, i): [number, number] => [i + 1, y])} color="var(--viz-neg)" width={peek ? 3.2 : 2} opacity={peek ? 1 : 0.55} />
          <Path points={honestPts.map((y, i): [number, number] => [i + 1, y])} color="var(--viz-pos)" width={peek ? 2 : 3.2} opacity={peek ? 0.55 : 1} />
          <Dots
            points={[
              { x: m, y: peekPts[m - 1], r: 6, color: 'var(--viz-neg)' },
              { x: m, y: honestPts[m - 1], r: 6, color: 'var(--viz-pos)' },
            ]}
          />
          <Label x={M_MAX} y={peekPts[M_MAX - 1]} dx={-4} dy={-10} anchor="end" size={12} color="var(--viz-neg)" weight={700}>
            peeking at the test set
          </Label>
          <Label x={M_MAX} y={honestPts[M_MAX - 1]} dx={-4} dy={-10} anchor="end" size={12} color="var(--viz-pos)" weight={700}>
            honest: tune on validation
          </Label>
          <Label x={m} y={peekPts[m - 1]} dx={m > M_MAX * 0.7 ? -10 : 10} dy={4} anchor={m > M_MAX * 0.7 ? 'end' : 'start'} size={12} color="var(--viz-neg)" weight={700}>
            {pts(sim.peek[m - 1])}
          </Label>
        </Plot>
      </div>
    </Figure>
  )
}
