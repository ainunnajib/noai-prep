import { useRef, useState } from 'react'
import { Figure, Controls, Readout, Button, Plot, Grid, Axes, Path, Dots, Label, DraggablePoint, MBlock, useAnimationFrame, useNarrow } from '../../../../../kit'

/*
  "What does fit() actually do?" Six HDB flats (floor area -> price). The learner drags the two
  ends of a line to make the mean squared error (MSE) small, then presses "model.fit()" and
  watches the line glide to the least-squares solution, the lowest MSE any straight line can get.
  Aha: fit() is not magic; it is "choose the parameters w and b that minimise the loss".
*/

const AREA = [67, 73, 92, 95, 110, 122]
const PRICE = [420, 450, 530, 560, 610, 680]
const XL = 60
const XR = 130
const Y_RANGE: [number, number] = [340, 760]

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length

/** least-squares slope and intercept, the same numbers LinearRegression().fit finds */
function leastSquares() {
  const mx = mean(AREA)
  const my = mean(PRICE)
  let sxy = 0
  let sxx = 0
  AREA.forEach((x, i) => {
    sxy += (x - mx) * (PRICE[i] - my)
    sxx += (x - mx) * (x - mx)
  })
  const w = sxy / sxx
  return { w, b: my - w * mx }
}
const BEST = leastSquares()
const BEST_L = BEST.w * XL + BEST.b
const BEST_R = BEST.w * XR + BEST.b

const lineFromEnds = (yl: number, yr: number) => {
  const w = (yr - yl) / (XR - XL)
  return { w, b: yl - w * XL }
}
const mse = (w: number, b: number) => mean(AREA.map((x, i) => (PRICE[i] - (w * x + b)) ** 2))
const BEST_MSE = mse(BEST.w, BEST.b)

const START: [number, number] = [470, 590]

export default function WhatFitDoes() {
  const [ends, setEnds] = useState<[number, number]>(START)
  const [fitted, setFitted] = useState(false)
  const [anim, setAnim] = useState(false)
  const t = useRef(0)
  const from = useRef<[number, number]>(START)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  useAnimationFrame((dt) => {
    t.current = Math.min(1, t.current + dt / 0.9)
    const e = 1 - (1 - t.current) ** 3
    setEnds([from.current[0] + (BEST_L - from.current[0]) * e, from.current[1] + (BEST_R - from.current[1]) * e])
    if (t.current >= 1) {
      setAnim(false)
      setFitted(true)
    }
  }, anim)

  const runFit = () => {
    from.current = ends
    t.current = 0
    setAnim(true)
  }
  const drag = (which: 0 | 1) => (_x: number, y: number) => {
    const v = Math.round(Math.max(Y_RANGE[0], Math.min(Y_RANGE[1], y)))
    setAnim(false)
    setFitted(false)
    setEnds((e) => (which === 0 ? [v, e[1]] : [e[0], v]))
  }

  const { w, b } = lineFromEnds(ends[0], ends[1])
  const loss = mse(w, b)
  const preds = AREA.map((x) => w * x + b)
  const ratio = loss / BEST_MSE
  const verdict = fitted ? 'this is the line fit() chose' : ratio < 1.05 ? 'within 5% of the best possible!' : ratio < 2 ? 'close: keep nudging' : 'keep dragging the ends'
  const sq = (v: number) => (v < 0 ? `(${v.toFixed(1)})` : v.toFixed(1))
  const residuals = AREA.map((_, i) => PRICE[i] - preds[i])

  return (
    <Figure
      title="What does fit() actually do?"
      caption={
        <>
          Drag the two purple handles to move the line and make the <b>MSE</b> as small as you can. Each orange segment is one flat's error (actual
          price minus predicted price). Then press <b>model.fit()</b>. It slides the line to the lowest MSE that any straight line can reach on these six
          flats. Try to beat it: you can't. That is all "training" means here: choosing the parameters <i>w</i> and <i>b</i> that make the loss smallest.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot
          x={[55, 135]}
          y={Y_RANGE}
          width={narrow ? 360 : 520}
          height={narrow ? 300 : 320}
          maxWidth={640}
          margin={{ left: 46 }}
          ariaLabel={`Six HDB flats, floor area against price, with a line price = ${w.toFixed(2)} times area plus ${b.toFixed(0)}. Mean squared error ${loss.toFixed(0)}.`}
        >
          <Grid xTicks={8} yTicks={6} />
          <Axes xLabel="floor area (m²)" yLabel="price ($k)" xTicks={narrow ? 4 : 8} yTicks={6} />
          {AREA.map((x, i) => (
            <Path
              key={i}
              points={[
                [x, PRICE[i]],
                [x, preds[i]],
              ]}
              color="var(--viz-2)"
              width={3}
            />
          ))}
          <Path
            points={[
              [XL, ends[0]],
              [XR, ends[1]],
            ]}
            color={fitted ? 'var(--viz-3)' : 'var(--viz-5)'}
            width={3}
          />
          <Dots points={AREA.map((x, i) => ({ x, y: PRICE[i], r: 6, color: 'var(--viz-1)' }))} />
          {!narrow &&
            AREA.map((x, i) =>
              Math.abs(residuals[i]) > 14 ? (
                <Label key={i} x={x} y={(PRICE[i] + preds[i]) / 2} dx={6} dy={4} color="var(--viz-2)" size={12}>
                  {`${residuals[i] > 0 ? '+' : ''}${residuals[i].toFixed(0)}`}
                </Label>
              ) : null,
            )}
          <DraggablePoint x={XL} y={ends[0]} lockX onChange={drag(0)} color="var(--viz-5)" label={narrow ? undefined : 'drag'} />
          <DraggablePoint x={XR} y={ends[1]} lockX onChange={drag(1)} color="var(--viz-5)" />
        </Plot>
      </div>
      <MBlock>
        {`\\begin{aligned}
\\text{price} &= ${w.toFixed(2)} \\times \\text{area} ${b < 0 ? '-' : '+'} ${Math.abs(b).toFixed(1)} \\\\
\\text{MSE} &= \\tfrac{1}{6}\\big(${narrow ? '\\dots' : residuals.slice(0, 3).map((r) => `${sq(r)}^2`).join(' + ') + ' + \\dots'}\\big) = ${loss.toFixed(1)}
\\end{aligned}`}
      </MBlock>
      <Controls>
        <Button primary onClick={runFit} disabled={anim || fitted}>
          model.fit(X, y)
        </Button>
        <Button
          onClick={() => {
            setAnim(false)
            setFitted(false)
            setEnds(START)
          }}
        >
          Reset line
        </Button>
        <Readout
          items={[
            ['your MSE', loss.toFixed(1)],
            ['lowest possible MSE', fitted ? BEST_MSE.toFixed(1) : '? (press fit)'],
            ['', <span key="v" style={{ color: fitted || ratio < 1.05 ? 'var(--viz-pos)' : 'var(--ink-2)', fontFamily: 'var(--font-body)' }}>{verdict}</span>],
          ]}
        />
      </Controls>
      {fitted && (
        <div style={{ width: '100%', fontSize: '0.9rem', color: 'var(--ink-2)' }}>
          After fitting, the learned parameters are stored on the model: <code>model.coef_</code> = [{BEST.w.toFixed(4)}] (the slope <i>w</i>) and{' '}
          <code>model.intercept_</code> = {BEST.b.toFixed(2)} (the intercept <i>b</i>).
        </div>
      )}
    </Figure>
  )
}
