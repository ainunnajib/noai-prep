import { useState } from 'react'
import { Figure, Controls, Readout, Button, Plot, Grid, Axes, FnPath, Path, Dots, Label } from '../../../../../kit'
import { Handle, LineThrough, Verdict, fx } from './plotHelpers'

/*
  Estimate a derivative from a graph. The learner tilts a line through P by dragging a handle
  that sits exactly 1 unit to the right of P, so the handle's height above P IS the slope
  (rise over a run of 1). "Check" reveals the true tangent and its own run-1 triangle.
  Each point starts with a deliberately wrong tilt, so pressing Check without dragging never
  scores (the true slope at x = √3 is 0, which a level starting line would give away).
*/

const g = (x: number) => (x ** 3 - 9 * x) / 6 + 3
const dg = (x: number) => (x * x - 3) / 2
const X: [number, number] = [-3.5, 3.5]
const Y: [number, number] = [-0.5, 6.5]
const POINTS = [1, 2.2, -3, Math.sqrt(3), -0.5]
/** a wrong starting tilt: 0.8 too steep or too shallow, on a 0.05 grid */
const startGuess = (i: number) => Math.round((dg(POINTS[i]) + (i % 2 ? 0.8 : -0.8)) * 20) / 20

export default function TangentGuess() {
  const [idx, setIdx] = useState(0)
  const [guess, setGuess] = useState(() => startGuess(0))
  const [checked, setChecked] = useState(false)
  const [scores, setScores] = useState<(number | null)[]>(() => POINTS.map(() => null))

  const px = POINTS[idx]
  const py = g(px)
  const truth = dg(px)
  const err = guess - truth
  const hx = px + 1
  const hy = py + guess

  const check = () => {
    setChecked(true)
    setScores((s) => s.map((v, i) => (i === idx ? Math.abs(err) : v)))
  }
  const next = () => {
    const ni = (idx + 1) % POINTS.length
    setIdx(ni)
    setGuess(startGuess(ni))
    setChecked(false)
  }

  const verdict = Math.abs(err) <= 0.15 ? 'spot on!' : Math.abs(err) <= 0.4 ? 'close' : err > 0 ? 'tilted too far up: drag the handle down' : 'tilted too far down: drag the handle up'
  const tone = Math.abs(err) <= 0.15 ? 'var(--viz-pos)' : Math.abs(err) <= 0.4 ? 'var(--viz-6)' : 'var(--viz-neg)'
  // the true-rise label goes inside the run-1 triangle (left of its vertical side), or under
  // the 'run 1' label when the true slope is nearly 0, so it never sits on the orange label
  const flatTruth = Math.abs(truth) < 0.3

  return (
    <Figure
      title="Your turn: estimate the slope by eye"
      caption={
        <>
          The orange line starts at the wrong tilt. Drag the orange handle up or down until the line <b>just touches</b> the curve at P, running the same
          way as the curve there. The handle sits exactly 1 unit to the right of P, so the height it rises (or falls) is your slope: rise ÷ run with a run
          of 1. Press <b>Check</b> to see the real tangent, then try the next point. One of the points has a true slope of 0.
        </>
      }
    >
      <Plot x={X} y={Y} width={520} height={340} minHeight={300} maxWidth={680} ariaLabel={`Curve with point P at x = ${fx(px, 2)}; your line has slope ${fx(guess, 2)}`}>
        <Grid xTicks={7} yTicks={6} />
        <Axes xTicks={7} yTicks={6} xLabel="x" yLabel="y" />
        <FnPath f={g} color="var(--viz-1)" width={3} />
        {checked && (
          <>
            <LineThrough x={px} y={py} slope={truth} color="var(--viz-3)" width={2.5} dash="7 5" />
            <Path points={[[px, py], [px + 1, py], [px + 1, py + truth]]} color="var(--viz-3)" width={2} />
            <Label
              x={flatTruth ? px + 0.5 : px + 1}
              y={flatTruth ? py : py + truth / 2}
              dx={flatTruth ? 0 : -6}
              dy={flatTruth ? (guess >= 0 ? 33 : -24) : 4}
              anchor={flatTruth ? 'middle' : 'end'}
              color="var(--viz-3)"
              size={12}
            >
              {`true rise ${fx(truth, 2)}`}
            </Label>
          </>
        )}
        <LineThrough x={px} y={py} slope={guess} color="var(--viz-2)" width={2.6} />
        <Path points={[[px, py], [hx, py]]} color="var(--viz-muted)" width={1.6} dash="4 4" />
        <Path points={[[hx, py], [hx, hy]]} color="var(--viz-2)" width={2} dash="4 4" />
        <Label x={px + 0.5} y={py} dy={guess >= 0 ? 17 : -8} anchor="middle" color="var(--ink-2)" size={12}>
          run 1
        </Label>
        <Dots points={[{ x: px, y: py, r: 7, color: 'var(--viz-1)' }]} />
        <Label x={px} y={py} dx={-10} dy={guess >= 0 ? -10 : 18} anchor="end" color="var(--viz-1)" weight={700}>
          P
        </Label>
        <Handle
          x={hx}
          y={hy}
          r={8}
          lockX
          color="var(--viz-2)"
          label={`rise ${fx(guess, 2)}`}
          ariaLabel="tilt of your line: drag up or down"
          constrain={(nx, ny) => [nx, py + Math.round((ny - py) * 20) / 20]}
          onChange={(_, ny) => {
            setGuess(Math.round((ny - py) * 20) / 20)
            setChecked(false)
          }}
        />
      </Plot>
      <Controls>
        <Button primary onClick={check} disabled={checked}>
          Check
        </Button>
        <Button onClick={next}>Next point</Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--ink-2)' }}>
          Point {idx + 1} of {POINTS.length}
        </span>
      </Controls>
      <Readout
        items={[
          ['P', `(${fx(px, 2)}, ${fx(py, 2)})`],
          ['your slope', fx(guess, 2)],
          ['true slope', checked ? fx(truth, 2) : '?'],
          ['verdict', checked ? <Verdict key="v" tone={tone}>{verdict}</Verdict> : 'press Check'],
          ['points done', `${scores.filter((s) => s != null && s <= 0.4).length} / ${POINTS.length} within 0.4`],
        ]}
      />
    </Figure>
  )
}
