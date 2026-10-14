import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Button, Plot, Grid, Axes, Path, Dots, Label, FnPath, HLine, useAnimationFrame, useNarrow, usePlot } from '../../../../../kit'
import { DragDot } from '../least-squares/DragDot'
import { RIDES, fitLS, mse, ellipse, mseForm, fmt, fix, lineText, type Pt } from '../least-squares/shared'

/*
  Gradient descent on the Grab rides, shown three ways at once:
  (1) the data with the current line, (2) the (w, b) loss map with the path so far,
  (3) the loss after every iteration (log scale). Play, step or scrub; change the learning
  rate and the number of iterations; drag the start point on the map.
*/

const N = RIDES.length
const W: [number, number] = [-0.6, 3.6]
const B: [number, number] = [-2.5, 5.5]
const LEVELS = [0.38, 0.55, 0.9, 1.5, 2.6, 4.5, 8, 14, 25, 45, 80]
const best = fitLS(RIDES)
const bestMse = mse(RIDES, best.w, best.b)
const form = mseForm(RIDES)
// largest curvature of the bowl = largest eigenvalue of the Hessian 2A
const lamMax = 2 * ((form.a + form.d) / 2 + Math.sqrt(((form.a - form.d) / 2) ** 2 + form.h ** 2))
const ETA_LIMIT = 2 / lamMax

interface Pt3 {
  w: number
  b: number
  loss: number
  gw: number
  gb: number
}

function run(start: Pt, eta: number, iters: number) {
  const out: Pt3[] = []
  let [w, b] = start
  let diverged = false
  for (let k = 0; k <= iters; k++) {
    let sE = 0
    let sEx = 0
    let sq = 0
    for (const [x, y] of RIDES) {
      const e = w * x + b - y
      sE += e
      sEx += e * x
      sq += e * e
    }
    const loss = sq / N
    if (!Number.isFinite(loss) || loss > 1e7) {
      diverged = true
      break
    }
    const gw = (2 / N) * sEx
    const gb = (2 / N) * sE
    out.push({ w, b, loss, gw, gb })
    w -= eta * gw
    b -= eta * gb
  }
  return { pts: out, diverged }
}

const LOG_TICKS = [0.3, 1, 3, 10, 30, 100, 300, 1000, 3000, 10000]
const log10 = Math.log10

/** y-axis ticks for a log10-scaled axis */
function LogTicks({ lo, hi }: { lo: number; hi: number }) {
  const { xs, ys } = usePlot()
  const x0 = xs.range()[0]
  return (
    <g className="plot-axes">
      {(hi - lo > 2.7 ? LOG_TICKS.filter((t) => t === 0.3 || Number.isInteger(log10(t))) : LOG_TICKS)
        .filter((t) => log10(t) >= lo - 1e-9 && log10(t) <= hi + 1e-9)
        .map((t) => (
        <g key={t} transform={`translate(${x0},${ys(log10(t))})`}>
          <line x2={-5} />
          <text x={-8} dy="0.32em" textAnchor="end">
            {t >= 1000 ? `${t / 1000}k` : String(t)}
          </text>
        </g>
      ))}
    </g>
  )
}

/** clip children to the plot area */
function Clip({ children }: { children: React.ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

const small: CSSProperties = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: '0.2rem' }

export default function GDLineFitLive() {
  const [eta, setEta] = useState(0.05)
  const [iters, setIters] = useState(300)
  const [start, setStart] = useState<Pt>([0, 0])
  const [t, setT] = useState(Number.MAX_SAFE_INTEGER) // at rest: the finished run
  const [playing, setPlaying] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const { pts, diverged } = useMemo(() => run(start, eta, iters), [start, eta, iters])
  const last = pts.length - 1
  const k = Math.min(last, Math.floor(t))
  const cur = pts[k]

  useAnimationFrame((dt) => {
    setT((v) => {
      const nv = v + dt * (2.5 + 0.9 * v)
      if (nv >= last) {
        setPlaying(false)
        return last
      }
      return nv
    })
  }, playing)

  const restart = () => {
    setPlaying(false)
    setT(0)
  }
  const changed = (f: () => void) => {
    f()
    setPlaying(false)
    setT(Number.MAX_SAFE_INTEGER)
  }

  const rings = useMemo(() => LEVELS.map((L) => ellipse(form.a, form.h, form.d, [best.w, best.b], L - bestMse)), [])
  const pathAll: Pt[] = pts.map((p) => [p.w, p.b])
  const pathNow = pathAll.slice(0, k + 1)

  const lossHi = Math.max(log10(100), Math.min(4, log10(Math.max(...pts.map((p) => p.loss)) * 1.3)))
  const lossLo = log10(0.25)
  const lossPts = (upto: number): Pt[] => pts.slice(0, upto + 1).map((p, i) => [i, Math.min(lossHi, log10(p.loss))])

  const status = diverged
    ? `diverging: η is above 2 ÷ ${fmt(lamMax, 2)} ≈ ${fix(ETA_LIMIT, 4)}`
    : pts[last].loss - bestMse < 1e-3
      ? `converged: within 0.001 of the best MSE after ${pts.findIndex((p) => p.loss - bestMse < 1e-3)} iterations`
      : `not converged yet after ${iters} iterations (MSE ${fix(pts[last].loss, 3)})`

  const plotW = narrow ? 340 : 330
  return (
    <Figure
      title="Three views of one training run"
      caption={
        <>
          The finished run is shown first. Press <b>Replay</b> (or drag the iteration slider) and watch three views of the same process: the line
          swinging into place, the orange dot walking down the loss map, and the loss falling in the chart below. The first few steps fix the slope;
          then the dot crawls along the valley floor, which is why the loss curve flattens. Drag the purple start point, raise the learning rate past{' '}
          {fix(ETA_LIMIT, 4)} to see it diverge, and lower it to see it crawl.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <div>
          <div style={small}>The data and the current line</div>
          <Plot x={[0, 6]} y={[0, 12]} width={plotW} height={270} minHeight={230} maxWidth={520} ariaLabel={`Iteration ${k}: line ${lineText(cur.w, cur.b)}`}>
            <Grid xTicks={6} yTicks={6} />
            <Axes xLabel="km" yLabel="fare ($)" xTicks={6} yTicks={6} />
            <FnPath f={(x) => start[1] + start[0] * x} color="var(--viz-5)" width={1.6} dash="5 5" opacity={0.8} />
            {RIDES.map(([x, y], i) => (
              <Path key={i} points={[[x, y], [x, cur.w * x + cur.b]]} color="color-mix(in srgb, var(--viz-2) 70%, var(--surface))" width={2} />
            ))}
            <FnPath f={(x) => cur.w * x + cur.b} color="var(--viz-3)" width={3} />
            <Dots points={RIDES.map(([x, y]) => ({ x, y, r: 6, color: 'var(--viz-1)' }))} />
            {Math.max(cur.b, 6 * cur.w + cur.b) < 0 || Math.min(cur.b, 6 * cur.w + cur.b) > 12 ? (
              <Label x={3} y={12} dy={16} anchor="middle" color="var(--viz-neg)" weight={700}>
                the line is off the chart
              </Label>
            ) : null}
          </Plot>
        </div>
        <div>
          <div style={small}>The loss map over (w, b)</div>
          <Plot x={W} y={B} width={plotW} height={270} minHeight={240} maxWidth={520} ariaLabel={`Loss contour map with the gradient descent path; iteration ${k} at w ${fmt(cur.w)}, b ${fmt(cur.b)}`}>
            {rings
              .slice()
              .reverse()
              .map((r, i) => (
                <Path key={i} points={r} closed fill="color-mix(in srgb, var(--viz-1) 8%, transparent)" color="color-mix(in srgb, var(--viz-1) 45%, var(--surface))" width={1.1} />
              ))}
            <Axes xLabel="slope w" yLabel="intercept b" xTicks={4} yTicks={4} />
            <Path points={pathAll} color="color-mix(in srgb, var(--viz-2) 40%, transparent)" width={1.5} />
            <Path points={pathNow} color="var(--viz-2)" width={2.4} />
            <Clip>
              <Dots points={pathNow.slice(0, 40).map(([x, y]) => ({ x, y, r: 2.8, color: 'var(--viz-2)' }))} stroke="none" />
              <Dots points={[{ x: cur.w, y: cur.b, r: 7, color: 'var(--viz-2)' }]} />
            </Clip>
            <Dots points={[{ x: best.w, y: best.b, r: 6, shape: 'cross', color: 'var(--viz-ink)' }]} />
            {diverged && k >= last - 1 && (
              <Label x={(W[0] + W[1]) / 2} y={B[1]} dy={18} anchor="middle" color="var(--viz-neg)" weight={700}>
                diverging: off the map
              </Label>
            )}
            <DragDot x={start[0]} y={start[1]} r={7} snap={0.1} color="var(--viz-5)" ariaLabel="Starting slope and intercept" tag="start" tagSide="right" onChange={(nw, nb) => changed(() => setStart([nw, nb]))} />
          </Plot>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <div style={small}>Loss (MSE) after each iteration, log scale</div>
        <Plot x={[0, iters]} y={[lossLo, lossHi]} width={680} height={170} minHeight={170} maxWidth={720} margin={{ left: 44, top: 12 }} ariaLabel={`Loss history: ${status}`}>
          <Grid xTicks={6} yTicks={0} />
          <Axes xLabel="iteration" xTicks={narrow ? 4 : 6} hideYTicks />
          <LogTicks lo={lossLo} hi={lossHi} />
          <HLine y={log10(bestMse)} color="var(--viz-3)" label={`best possible ${fix(bestMse, 2)}`} />
          <Path points={lossPts(last)} color="color-mix(in srgb, var(--viz-1) 35%, transparent)" width={1.6} />
          <Path points={lossPts(k)} color="var(--viz-1)" width={2.4} />
          <Clip>
            <Dots points={[{ x: k, y: Math.min(lossHi, log10(cur.loss)), r: 5, color: 'var(--viz-1)' }]} />
          </Clip>
        </Plot>
      </div>
      <div className="player" style={{ width: '100%' }}>
        <Button onClick={restart}>Restart</Button>
        <Button onClick={() => setT(Math.min(last, k + 1))} disabled={k >= last}>
          Step
        </Button>
        <Button
          primary
          onClick={() => {
            if (k >= last) setT(0)
            setPlaying((p) => !p)
          }}
        >
          {playing ? 'Pause' : k >= last ? 'Replay' : 'Play'}
        </Button>
        <Button onClick={() => changed(() => setStart([0, 0]))}>Start at (0, 0)</Button>
      </div>
      <Controls>
        <Slider label="iteration shown" value={k} min={0} max={last} step={1} onChange={(v) => (setPlaying(false), setT(v))} />
        <Slider label="learning rate η" value={eta} min={0.005} max={0.095} step={0.005} onChange={(v) => changed(() => setEta(v))} format={(v) => v.toFixed(3)} />
        <Slider label="iterations" value={iters} min={50} max={1000} step={50} onChange={(v) => changed(() => setIters(v))} />
      </Controls>
      <Readout
        items={[
          ['iteration', String(k)],
          ['line', lineText(cur.w, cur.b, 3)],
          ['MSE', fix(cur.loss, 4)],
          ['gradient (∂w, ∂b)', `(${fix(cur.gw, 3)}, ${fix(cur.gb, 3)})`],
        ]}
      />
      <p style={{ margin: 0, width: '100%', fontSize: '0.875rem', fontWeight: 600, color: diverged ? 'var(--viz-neg)' : 'var(--ink-2)' }}>{status}</p>
    </Figure>
  )
}
