import { useMemo, useState } from 'react'
import { Figure, Controls, Readout } from '../content/Figure'
import { Plot, Grid, Axes, Path, Dots, DraggablePoint } from '../interactive/Plot'
import { useAnimationFrame } from '../interactive/Player'

// Hours studied vs quiz score (made-up, deterministic data).
const DATA: [number, number][] = [
  [0.5, 2.1], [1, 2.6], [1.6, 3.4], [2.2, 2.9], [2.8, 4.4], [3.3, 4.1], [4, 5.3], [4.6, 4.9], [5.2, 6.4], [5.9, 6.1], [6.5, 7.2], [7.2, 7.0], [7.8, 8.3],
]
const X0 = 0
const X1 = 8

function mse(m: number, b: number) {
  return DATA.reduce((s, [x, y]) => s + (m * x + b - y) ** 2, 0) / DATA.length
}

export function FitLineDemo() {
  // the line is defined by its heights at x = 0 and x = 8 (the two handles)
  const [yA, setYA] = useState(6.5)
  const [yB, setYB] = useState(3)
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState(0)

  const m = (yB - yA) / (X1 - X0)
  const b = yA
  const loss = useMemo(() => mse(m, b), [m, b])

  useAnimationFrame(() => {
    let mm = m
    let bb = b
    for (let k = 0; k < 4; k++) {
      let dm = 0
      let db = 0
      for (const [x, y] of DATA) {
        const e = mm * x + bb - y
        dm += (2 * e * x) / DATA.length
        db += (2 * e) / DATA.length
      }
      mm -= 0.012 * dm
      bb -= 0.05 * db
    }
    setYA(bb)
    setYB(bb + mm * (X1 - X0))
    setSteps((s) => s + 4)
    if (Math.abs(mse(mm, bb) - loss) < 1e-6) setRunning(false)
  }, running)

  const stop = () => setRunning(false)

  return (
    <Figure
      title="Teach a line to predict quiz scores"
      caption={
        <>
          Each dot is a student: hours studied (across) and quiz score (up). Drag the two orange handles to fit the line. The dashed red lines are the prediction errors, and the
          score in the corner is their average squared size. Training a model means making that number as small as possible, and gradient descent does it automatically.
        </>
      }
    >
      <Plot x={[0, 8]} y={[0, 10]} height={300} ariaLabel="Scatter plot of hours studied against quiz score with an adjustable line">
        <Grid />
        <Axes xLabel="hours studied" yLabel="score" />
        {DATA.map(([x, y], i) => (
          <Path key={i} points={[[x, y], [x, m * x + b]]} color="var(--viz-neg)" width={1.5} dash="3 3" />
        ))}
        <Path points={[[X0, yA], [X1, yB]]} color="var(--viz-1)" width={3} />
        <Dots points={DATA.map(([x, y]) => ({ x, y }))} color="var(--viz-ink)" r={4.5} />
        <DraggablePoint x={X0} y={yA} lockX label="drag" onChange={(_, y) => { stop(); setYA(y) }} />
        <DraggablePoint x={X1} y={yB} lockX onChange={(_, y) => { stop(); setYB(y) }} />
      </Plot>
      <Controls>
        <Readout items={[['error (MSE)', loss.toFixed(2)], ['slope', m.toFixed(2)], ['intercept', b.toFixed(2)], ['steps', String(steps)]]} />
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
          <button type="button" className="btn btn-small" onClick={() => { stop(); setYA(6.5); setYB(3); setSteps(0) }}>
            Reset
          </button>
          <button type="button" className="btn btn-primary btn-small" onClick={() => setRunning((r) => !r)}>
            {running ? 'Pause' : 'Run gradient descent'}
          </button>
        </span>
      </Controls>
    </Figure>
  )
}
