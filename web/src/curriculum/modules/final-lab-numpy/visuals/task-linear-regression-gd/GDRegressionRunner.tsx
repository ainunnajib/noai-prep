import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, Path, Dots, HLine, usePlot, useNarrow } from '../../../../../kit'
import { Notebook, NbCell, CodeLines, Note } from '../exam-notebook-skills/nb'
import { npArrayRepr, npRound } from '../exam-notebook-skills/pyfmt'
import { runGD, ALPHA, ITERS, EXPECTED } from './gd'
import { ThetaPlane } from './ThetaPlane'

/*
  Concept: the implementation, run and checked.
  The protected call cell of 2025 Task 1 with the learning rate and iteration count you choose,
  the exact NumPy output, the path of θ over the cost bowl, and the cost curve.
*/

const ALPHAS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.08, 0.09, 0.1]
const ITER_LIST = [0, 1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000, 1500, 2000, 3000]
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const pow10 = (v: number) => `10${String(Math.round(v))
  .split('')
  .map((c) => SUP[c] ?? c)
  .join('')}`

const LOG_LO = -12
const LOG_HI = 4

export default function GDRegressionRunner() {
  const [ai, setAi] = useState(ALPHAS.indexOf(ALPHA))
  const [ii, setIi] = useState(ITER_LIST.indexOf(ITERS))
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(640)
  const alpha = ALPHAS[ai]
  const iters = ITER_LIST[ii]

  const trace = useMemo(() => runGD(alpha, iters), [alpha, iters])
  const theta = trace.thetas[iters]
  const J = trace.losses[iters]
  const out = npArrayRepr(npRound(theta, 4))
  const isExam = alpha === ALPHA && iters === ITERS
  const matches = out === npArrayRepr(EXPECTED)
  const falling = trace.losses.every((v, k) => k === 0 || v <= trace.losses[k - 1] + 1e-15)
  const diverged = !theta.every((v) => Number.isFinite(v) && Math.abs(v) < 1e3)
  const dist = Math.hypot(theta[0] - 0, theta[1] - 1)

  const lossPts = useMemo(
    () => trace.losses.map((v, k) => [k, Math.max(LOG_LO, Math.min(LOG_HI + 0.5, Math.log10(Math.max(v, 1e-300))))] as [number, number]),
    [trace],
  )

  const call = `linear_regression_gradient_descent(
    X=X, y=y, alpha=${alpha}, iterations=${iters})`

  return (
    <Figure
      title="Run the task, then check the answer three ways"
      caption={
        <>
          At the exam's settings (α = 0.01, 1000 iterations) the output matches the official answer. Now move the sliders: set iterations to 1 to see the hand-calculated
          first step, push iterations up to watch θ crawl along the valley floor to (0, 1), and raise α until the path zig-zags (0.09) or blows up (0.1). Notice that
          the 4-decimal answer depends on the exact α and iteration count. The cost plot uses a log scale: each labelled tick is 1,000 times smaller than the one above it.
        </>
      }
      wide
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.75rem' }}>
        <Notebook ariaLabel="The protected call cell and its output">
          <NbCell
            prompt="In [5]:"
            tags={[{ text: 'call cell: values from the sliders', tone: 'lock' }]}
            locked
            output={out}
            outputLabel="Out[5]:"
            outputKind={isExam ? (matches ? 'ok' : 'bad') : 'plain'}
          >
            <CodeLines code={call} wrap={narrow} />
          </NbCell>
        </Notebook>
        <Controls>
          <Slider label="learning rate α" value={ai} min={0} max={ALPHAS.length - 1} step={1} onChange={setAi} format={(i) => String(ALPHAS[i])} />
          <Slider label="iterations" value={ii} min={0} max={ITER_LIST.length - 1} step={1} onChange={setIi} format={(i) => String(ITER_LIST[i])} />
        </Controls>
        {isExam ? (
          <Note tone="ok" title="Matches the expected answer.">
            <code>array([0.003 , 0.9987])</code>, the official output for the exam's settings.
          </Note>
        ) : diverged ? (
          <Note tone="bad" title="Diverged.">
            α = {alpha} is above the stability limit (about 0.09 for this data): every step overshoots further and θ explodes.
          </Note>
        ) : (
          <Note title="Different settings, different answer.">
            The exam asked for α = 0.01 and 1000 iterations; with these settings the function returns something else, so always use the task's exact values.
          </Note>
        )}

        <div style={{ display: 'grid', gap: '0.5rem', width: '100%', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'left' }}>Where θ goes (ellipses: equal cost)</div>
            <ThetaPlane
              ariaLabel={`Path of theta over ${iters} iterations with learning rate ${alpha}`}
              paths={[{ pts: trace.thetas, color: diverged ? 'var(--viz-neg)' : 'var(--viz-1)', width: iters > 300 ? 1.3 : 2.2 }]}
              current={{ p: theta, color: diverged ? 'var(--viz-neg)' : 'var(--viz-1)' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'left' }}>Cost J after each iteration (log scale)</div>
            <Plot
              x={[0, Math.max(1, iters)]}
              y={[LOG_LO, LOG_HI]}
              width={380}
              height={300}
              minHeight={250}
              margin={{ left: 46, bottom: 36, right: 14, top: 12 }}
              ariaLabel="Cost against iteration on a log scale"
            >
              <Grid xTicks={5} yTicks={8} />
              <Axes xLabel="iteration" xTicks={4} yTicks={8} hideYTicks tickFormat={(v) => String(Math.round(v))} />
              <YLogTicks />
              <HLine y={Math.log10(9.333333)} label="start: J = 9.33" color="var(--viz-muted)" />
              <Path points={lossPts} color={falling ? 'var(--viz-1)' : 'var(--viz-neg)'} width={2.2} />
              <Dots points={[{ x: iters, y: Math.min(LOG_HI, lossPts[iters][1]), color: falling ? 'var(--viz-1)' : 'var(--viz-neg)', r: 5 }]} />
            </Plot>
          </div>
        </div>
        <Readout
          items={[
            [`θ after ${iters}`, diverged ? 'exploded' : `(${theta[0].toFixed(6)}, ${theta[1].toFixed(6)})`],
            ['J', Number.isFinite(J) ? J.toExponential(2) : 'inf'],
            ['distance to (0, 1)', diverged ? '—' : dist.toFixed(4)],
          ]}
        />
        <div style={{ width: '100%', display: 'grid', gap: '0.25rem', textAlign: 'left', fontSize: '0.88rem' }} role="list" aria-label="Three checks">
          <Check ok={alpha === ALPHA && iters === 1 ? true : undefined} text="One step by hand gives (0.08, 0.1867): set iterations to 1 with α = 0.01 and compare." />
          <Check ok={falling} text={falling ? 'The cost falls at every iteration.' : 'The cost rises: the learning rate is too large.'} />
          <Check
            ok={!diverged && dist < 0.001 ? true : undefined}
            text="With enough iterations θ reaches (0, 1), the exact least-squares answer (np.linalg.lstsq gives the same)."
          />
        </div>
      </div>
    </Figure>
  )
}

function Check({ ok, text }: { ok: boolean | undefined; text: string }) {
  return (
    <div role="listitem" style={{ display: 'flex', gap: '0.45rem', alignItems: 'baseline' }}>
      <span aria-hidden="true" style={{ fontWeight: 700, minWidth: '1.1em', color: ok === undefined ? 'var(--ink-3)' : ok ? 'var(--ok)' : 'var(--bad)' }}>
        {ok === undefined ? '○' : ok ? '✓' : '✗'}
      </span>
      <span>{text}</span>
    </div>
  )
}

function YLogTicks() {
  return (
    <>
      {[-12, -9, -6, -3, 0, 3].map((v) => (
        <YTick key={v} v={v} />
      ))}
    </>
  )
}

function YTick({ v }: { v: number }) {
  const { xs, ys } = usePlot()
  const x0 = xs.range()[0]
  return (
    <g transform={`translate(${x0},${ys(v)})`} aria-hidden="true">
      <line x2={-5} style={{ stroke: 'var(--viz-axis)' }} />
      <text x={-8} dy="0.32em" textAnchor="end" className="plot-label" style={{ fontSize: 11, fill: 'var(--ink-3)' }}>
        {pow10(v)}
      </text>
    </g>
  )
}
