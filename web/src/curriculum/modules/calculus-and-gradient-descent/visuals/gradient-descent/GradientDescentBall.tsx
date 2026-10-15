import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Grid, Axes, FnPath, Path, Dots, Arrow, Label, HLine, MBlock, usePlot, useNarrow } from '../../../../../kit'
import { Handle, Verdict } from '../derivatives-as-slopes/plotHelpers'

/*
  Gradient descent on L(w) = w². The learner sets the learning rate, presses Step or Play,
  and drags the start point. The panel shows the arithmetic of the next update, and a
  small chart shows the loss after each step for the current learning rate, so the four
  regimes (crawl, converge, zig-zag, diverge) are visible before even pressing Play.
*/

const L = (w: number) => w * w
const dL = (w: number) => 2 * w
const W_RANGE: [number, number] = [-5, 5]
const Y_TOP = 26
const MAX_STEPS = 30
const FORECAST = 20

/** up to 3 decimals, trailing zeros removed, so the shown arithmetic adds up */
const f2 = (v: number) => {
  if (!Number.isFinite(v)) return '∞'
  if (Math.abs(v) >= 1000) return v.toExponential(1)
  const r = Math.round(v * 1000) / 1000
  return String(Object.is(r, -0) ? 0 : r)
}

/** clip children (e.g. arrows) to the plotting area */
function Clipped({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}
const paren = (v: number) => (v < 0 ? `(${f2(v)})` : f2(v))

const PRESETS = [
  { value: 0.02, label: 'tiny' },
  { value: 0.3, label: 'good' },
  { value: 0.85, label: 'big' },
  { value: 1.05, label: 'too big' },
]

function regime(eta: number) {
  const r = 1 - 2 * eta
  if (Math.abs(r) > 1 + 1e-9) return { name: 'diverging: every step overshoots further', colour: 'var(--viz-neg)' }
  if (Math.abs(Math.abs(r) - 1) < 1e-9) return { name: eta < 0.5 ? 'stuck' : 'bouncing forever between ±w', colour: 'var(--viz-neg)' }
  if (r < 0) return { name: 'zig-zagging, but converging', colour: 'var(--viz-6)' }
  if (r > 0.9) return { name: 'crawling: tiny steps', colour: 'var(--viz-6)' }
  return { name: 'converging smoothly', colour: 'var(--viz-pos)' }
}

const panel: CSSProperties = { width: '100%' }
const smallTitle: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }

export default function GradientDescentBall() {
  const [eta, setEta] = useState(0.1)
  const [w0, setW0] = useState(3)
  const [path, setPath] = useState<number[]>([3])
  const [playing, setPlaying] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const w = path[path.length - 1]
  const k = path.length - 1
  const g = dL(w)
  const step = eta * g
  const wNext = w - step
  const done = k >= MAX_STEPS || Math.abs(w) > 60 || (Math.abs(w) < 1e-4 && k > 0)

  const doStep = () => setPath((p) => (p.length > MAX_STEPS || Math.abs(p[p.length - 1]) > 60 ? p : [...p, p[p.length - 1] - eta * dL(p[p.length - 1])]))
  const reset = (start = w0) => {
    setPlaying(false)
    setPath([start])
  }

  useEffect(() => {
    if (!playing) return
    if (done) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(doStep, 520)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, path, eta])

  const changeEta = (v: number) => {
    setEta(v)
    reset()
  }

  // loss after each step if we keep going with this learning rate
  const forecast: number[] = [w0]
  for (let i = 0; i < FORECAST; i++) forecast.push(forecast[i] - eta * dL(forecast[i]))
  const base = Math.max(1, L(w0))
  const lossTop = Math.max(base * 1.25, Math.min(Math.max(...forecast.map(L)), base * 6))
  const reg = regime(eta)
  const offChart = Math.abs(w) > W_RANGE[1] || L(w) > Y_TOP
  const tan = 0.9

  return (
    <Figure
      title="Gradient descent, one step at a time"
      caption={
        <>
          Press <b>Step</b> a few times, then try the four preset learning rates with <b>Play</b>. Drag the purple start point to start somewhere else. The
          dashed line is the slope the ball feels, the arrow under the curve is the step it takes, and the small chart shows the loss after each step
          for the current learning rate. Find the learning rate where the ball stops converging and starts flying off.
        </>
      }
    >
      <div ref={wrapRef} style={{ ...panel, display: 'grid', justifyItems: 'center' }}>
        <Plot x={W_RANGE} y={[0, Y_TOP]} width={narrow ? 360 : 520} height={narrow ? 300 : 300} maxWidth={680} ariaLabel={`Parabola L(w) = w squared with the ball at w = ${f2(w)} after ${k} steps`}>
          <Grid xTicks={10} yTicks={5} />
          <Axes xLabel="w" yLabel="loss L(w) = w²" xTicks={10} yTicks={5} />
          <FnPath f={L} color="var(--viz-1)" width={3} />
          <Clipped>
            {path.slice(0, -1).map((p, i) => (
              <Arrow key={i} from={[p, L(p)]} to={[path[i + 1], L(path[i + 1])]} color="color-mix(in srgb, var(--viz-2) 70%, var(--surface))" width={1.8} head={7} />
            ))}
            <Dots points={path.slice(0, -1).map((p) => ({ x: p, y: L(p), r: 4, color: 'color-mix(in srgb, var(--viz-2) 70%, var(--surface))' }))} stroke="none" />
          </Clipped>
          {!done && Math.abs(w) <= W_RANGE[1] && (
            <>
              <Path points={[[w - tan, L(w) - tan * g], [w + tan, L(w) + tan * g]]} color="var(--viz-ink)" width={1.8} dash="5 4" />
              <Arrow from={[w, 1.1]} to={[Math.max(W_RANGE[0], Math.min(W_RANGE[1], wNext)), 1.1]} color="var(--viz-3)" width={3} />
              {Math.abs(step) > 0.45 && (
                <Label x={(w + Math.max(W_RANGE[0], Math.min(W_RANGE[1], wNext))) / 2} y={1.1} dy={-8} anchor="middle" color="var(--viz-3)" weight={700}>
                  {`w changes by ${f2(-step)}`}
                </Label>
              )}
            </>
          )}
          {Math.abs(w) <= W_RANGE[1] && L(w) <= Y_TOP && <Dots points={[{ x: w, y: L(w), r: 10, color: 'var(--viz-2)' }]} />}
          {offChart && (
            // a small marker on the edge the ball left by; the words go in the readout below
            <Dots points={[{ x: w > 0 ? W_RANGE[1] - 0.15 : W_RANGE[0] + 0.15, y: Y_TOP - 1, r: 7, color: 'var(--viz-neg)', shape: 'triangle' }]} stroke="none" />
          )}
          <Handle
            x={w0}
            y={L(w0)}
            r={6}
            color="var(--viz-5)"
            ariaLabel="start point: drag along the curve"
            constrain={(x) => {
              const s = Math.round(x * 10) / 10
              return [s, L(s)]
            }}
            onChange={(x) => {
              setW0(x)
              reset(x)
            }}
            label="start"
          />
        </Plot>
      </div>
      <MBlock>
        {narrow
          ? `\\begin{aligned}
L'(w) &= 2 \\times ${paren(w)} = ${f2(g)} \\\\
\\eta\\, L'(w) &= ${eta.toFixed(2)} \\times ${paren(g)} = ${f2(step)} \\\\
w_{\\text{new}} &= ${f2(w)} - ${paren(step)} = ${f2(wNext)}
\\end{aligned}`
          : `\\begin{aligned}
\\text{slope:}\\quad & L'(w) = 2w = 2 \\times ${paren(w)} = ${f2(g)} \\\\
\\text{step:}\\quad & \\eta \\times L'(w) = ${eta.toFixed(2)} \\times ${paren(g)} = ${f2(step)} \\\\
\\text{update:}\\quad & w_{\\text{new}} = w - \\text{step} = ${f2(w)} - ${paren(step)} = ${f2(wNext)}
\\end{aligned}`}
      </MBlock>
      <Controls>
        <Slider label={<>learning rate η</>} value={eta} min={0.01} max={1.2} step={0.01} onChange={changeEta} format={(v) => v.toFixed(2)} />
        <Button primary onClick={doStep} disabled={done}>
          Step
        </Button>
        <Button onClick={() => (playing ? setPlaying(false) : setPlaying(true))} disabled={done && !playing}>
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={() => reset()}>Reset</Button>
      </Controls>
      <Controls>
        <Segmented label="Preset learning rates" value={eta} onChange={changeEta} options={PRESETS} />
      </Controls>
      <div style={panel}>
        <div style={smallTitle}>Loss after each step with η = {eta.toFixed(2)}</div>
        <Plot x={[0, FORECAST]} y={[0, lossTop]} width={narrow ? 360 : 520} height={narrow ? 150 : 130} maxWidth={680} margin={{ top: 10, bottom: 30 }} ariaLabel={`Loss after each step for learning rate ${eta.toFixed(2)}: ${reg.name}`}>
          <Grid xTicks={10} yTicks={3} />
          <Axes xLabel="step" xTicks={narrow ? 5 : 10} yTicks={3} />
          <HLine y={0} color="var(--viz-axis)" dash="" width={1} />
          <Path points={forecast.map((v, i): [number, number] => [i, Math.min(L(v), lossTop)])} color="color-mix(in srgb, var(--viz-1) 45%, var(--surface))" width={1.5} />
          <Dots
            points={forecast.map((v, i) => ({
              x: i,
              y: Math.min(L(v), lossTop),
              r: i <= k ? 4.5 : 3,
              shape: L(v) > lossTop ? ('triangle' as const) : undefined,
              color: i <= k ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-1) 60%, var(--surface))',
            }))}
            stroke="none"
          />
        </Plot>
      </div>
      <Readout
        items={[
          ['step', String(k)],
          ['w', f2(w)],
          ['loss', f2(L(w))],
          ['each step multiplies w by', (1 - 2 * eta).toFixed(2)],
          ['verdict', <Verdict key="v" tone={reg.colour}>{offChart ? `the ball has flown off the chart (w = ${f2(w)}): ${reg.name}` : reg.name}</Verdict>],
        ]}
      />
    </Figure>
  )
}
