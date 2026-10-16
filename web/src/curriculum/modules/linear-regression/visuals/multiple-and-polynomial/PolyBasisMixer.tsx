import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Button, Plot, Grid, Axes, FnPath, Dots, MatrixGrid, M } from '../../../../../kit'
import { lstsq, polyRow, polyEval, mse } from './linalg'
import { CUBIC_X, CUBIC_Y } from './polyData'

/*
  A polynomial is a weighted sum of fixed basis curves 1, x, x², x³. The learner sets each weight
  and sees the scaled pieces (thin) and their sum (thick) against the data. "Fit" solves the
  least-squares problem on the expanded features [1, x, x², x³].
*/

const COLORS = ['var(--viz-3)', 'var(--viz-2)', 'var(--viz-5)', 'var(--viz-4)']
const BASIS = ['1', 'x', 'x²', 'x³']
const LINE = lstsq(
  CUBIC_X.map((x) => polyRow(x, 1)),
  CUBIC_Y,
)
const START = [LINE[0], LINE[1], 0, 0]

const sw = (c: string) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: 14,
      height: 4,
      borderRadius: 2,
      background: c,
      marginRight: 6,
      verticalAlign: 'middle',
    }}
  />
)

function formula(w: number[], degree: number) {
  const terms = w.slice(0, degree + 1).map((v, k) => {
    const mag = Math.abs(v).toFixed(2)
    const pow = k === 0 ? '' : k === 1 ? 'x' : `x^${k}`
    return { sign: v < 0 ? '-' : '+', body: `${mag}${pow}` }
  })
  return terms.map((t, i) => (i === 0 ? (t.sign === '-' ? '-' : '') + t.body : ` ${t.sign} ${t.body}`)).join('')
}

export default function PolyBasisMixer() {
  const [degree, setDegree] = useState(3)
  const [w, setW] = useState<number[]>(START)
  const [pieces, setPieces] = useState(true)
  const [table, setTable] = useState(false)

  const active = w.map((v, k) => (k <= degree ? v : 0))
  const pred = CUBIC_X.map((x) => polyEval(active, x))
  const loss = mse(pred, CUBIC_Y)
  const best = useMemo(() => {
    const fit = lstsq(
      CUBIC_X.map((x) => polyRow(x, degree)),
      CUBIC_Y,
    )
    return {
      w: [...fit, 0, 0, 0].slice(0, 4),
      mse: mse(
        CUBIC_X.map((x) => polyEval(fit, x)),
        CUBIC_Y,
      ),
    }
  }, [degree])

  const setK = (k: number) => (v: number) => setW((old) => old.map((o, i) => (i === k ? v : o)))
  const changeDegree = (d: number) => {
    setDegree(d)
    setW((old) => old.map((o, i) => (i <= d ? o : 0)))
  }

  return (
    <Figure
      title="Building a curve from straight-line maths"
      caption={
        <>
          The thick curve is the model <M>{`\\hat{y} = ${formula(active, degree)}`}</M>: a <b>weighted sum</b> of the thin basis curves 1, x, x², x³. It starts
          as the best straight line, which misses the S-shape. Slide <b>w₃</b> and watch only the pink dashed x³ piece stretch (a piece with weight 0 is not
          drawn); then press <b>Fit</b> to let least squares choose all the weights at once. Every weight just multiplies a fixed curve, which is why this is
          still <i>linear</i> regression.
        </>
      }
    >
      <Plot
        x={[-2.3, 2.3]}
        y={[-4.5, 5.5]}
        width={520}
        height={340}
        minHeight={300}
        ariaLabel={`Data with a degree ${degree} polynomial built from basis curves`}
      >
        <Grid xTicks={10} yTicks={10} />
        <Axes origin xTicks={5} yTicks={5} xLabel="x" yLabel="y" />
        {pieces &&
          active
            .slice(0, degree + 1)
            .map((wk, k) => (Math.abs(wk) < 0.005 ? null : <FnPath key={k} f={(x) => wk * x ** k} color={COLORS[k]} width={2} dash="6 5" opacity={0.95} />))}
        <FnPath f={(x) => polyEval(active, x)} color="var(--viz-1)" width={4} />
        <Dots
          points={CUBIC_X.map((x, i) => ({
            x,
            y: CUBIC_Y[i],
            r: 5.5,
            color: 'var(--viz-ink)',
          }))}
        />
      </Plot>
      <Controls>
        <Segmented
          label="Highest power (degree)"
          value={degree}
          onChange={changeDegree}
          options={[
            { value: 1, label: '1: line' },
            { value: 2, label: '2: parabola' },
            { value: 3, label: '3: cubic' },
          ]}
        />
        <Toggle label="Show the pieces" checked={pieces} onChange={setPieces} />
        <Toggle label="Show the feature table" checked={table} onChange={setTable} />
      </Controls>
      <Controls>
        {BASIS.slice(0, degree + 1).map((b, k) => (
          <Slider
            key={k}
            label={
              <>
                {sw(COLORS[k])}w{'₀₁₂₃'[k]} × {b}
              </>
            }
            value={w[k]}
            min={-2}
            max={2}
            step={0.01}
            onChange={setK(k)}
            format={(v) => v.toFixed(2)}
          />
        ))}
      </Controls>
      <Controls>
        <Button primary onClick={() => setW(best.w)}>
          Fit (least squares)
        </Button>
        <Button onClick={() => setW(START)}>Reset to the line</Button>
        <Readout
          items={[
            ['MSE', loss.toFixed(3)],
            [`best MSE at degree ${degree}`, best.mse.toFixed(3)],
          ]}
        />
      </Controls>
      {table && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <MatrixGrid
            label={`Features X = [${BASIS.slice(0, degree + 1).join(', ')}]`}
            data={CUBIC_X.map((x) => polyRow(x, degree))}
            format={(v) => (Number.isInteger(v) ? String(v) : v.toFixed(3).replace(/0+$/, ''))}
            cellSize={56}
            ariaLabel="Expanded feature table"
          />
          <MatrixGrid label="y" data={CUBIC_Y.map((v) => [v])} format={(v) => v.toFixed(2)} cellSize={56} ariaLabel="Targets" />
        </div>
      )}
    </Figure>
  )
}
