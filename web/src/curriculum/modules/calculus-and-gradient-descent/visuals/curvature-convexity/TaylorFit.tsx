import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Toggle, Button, Plot, Grid, Axes, FnPath, Path, Dots, Arrow, Label, M, MBlock, useNarrow, usePlot } from '../../../../../kit'
import { BoxLabel, Handle } from '../derivatives-as-slopes/plotHelpers'

/*
  Taylor approximations and Newton's method. At the current point the tangent line (first order)
  and the parabola (second order) approximate f. Newton's method jumps to the bottom of the
  parabola: x ← x − f'(x)/f''(x). Gradient descent (x ← x − η f'(x), η = 0.1) runs alongside from
  the same start, so the learner can compare how many steps each needs.
*/

type Key = 'convex' | 'nonconvex'
interface Fn {
  label: string
  tex: string
  f: (x: number) => number
  d1: (x: number) => number
  d2: (x: number) => number
  x: [number, number]
  y: [number, number]
  start: number
}
const FNS: Record<Key, Fn> = {
  convex: {
    label: 'Convex',
    tex: 'f(x) = \\tfrac14 x^4 - x + 1',
    f: (x) => x ** 4 / 4 - x + 1,
    d1: (x) => x ** 3 - 1,
    d2: (x) => 3 * x * x,
    x: [-1.2, 2.4],
    y: [-0.6, 7],
    start: 2,
  },
  nonconvex: {
    label: 'Not convex',
    tex: 'f(x) = \\tfrac14 x^4 - x^2 + 1.5',
    f: (x) => x ** 4 / 4 - x * x + 1.5,
    d1: (x) => x ** 3 - 2 * x,
    d2: (x) => 3 * x * x - 2,
    x: [-2.2, 2.2],
    y: [-0.6, 3.6],
    start: 0.5,
  },
}
const ETA = 0.1
const MAX_K = 40
const TOL = 1e-3
const NEWTON = 'var(--viz-5)'
const GD = 'var(--viz-2)'

const fmt = (v: number, dp = 3) => {
  if (!Number.isFinite(v)) return '∞'
  if (Math.abs(v) >= 1000) return v.toExponential(1)
  const r = Math.round(v * 10 ** dp) / 10 ** dp
  return String(Object.is(r, -0) ? 0 : r)
}
const par = (v: number, dp = 3) => (v < 0 ? `(${fmt(v, dp)})` : fmt(v, dp))

function Clipped({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

function runs(F: Fn, x0: number) {
  const newton = [x0]
  const gd = [x0]
  for (let k = 0; k < MAX_K; k++) {
    const xn = newton[newton.length - 1]
    const c = F.d2(xn)
    newton.push(Number.isFinite(xn) && Math.abs(c) > 1e-12 && Math.abs(xn) < 1e6 ? xn - F.d1(xn) / c : NaN)
    const xg = gd[gd.length - 1]
    gd.push(Math.abs(xg) < 1e6 ? xg - ETA * F.d1(xg) : NaN)
  }
  const reached = (seq: number[]) => seq.findIndex((x) => Number.isFinite(x) && Math.abs(F.d1(x)) < TOL)
  return { newton, gd, nNewton: reached(newton), nGd: reached(gd) }
}

export default function TaylorFit() {
  const [key, setKey] = useState<Key>('convex')
  const [x0, setX0] = useState(FNS.convex.start)
  const [k, setK] = useState(0)
  const [showLine, setShowLine] = useState(true)
  const [showPara, setShowPara] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const F = FNS[key]
  const { newton, gd, nNewton, nGd } = useMemo(() => runs(F, x0), [F, x0])

  const xk = newton[k]
  const ok = Number.isFinite(xk)
  const inView = ok && xk >= F.x[0] && xk <= F.x[1]
  const fk = ok ? F.f(xk) : NaN
  const g1 = ok ? F.d1(xk) : NaN
  const g2 = ok ? F.d2(xk) : NaN
  const xN = ok ? xk - g1 / g2 : NaN
  const line = (x: number) => fk + g1 * (x - xk)
  const para = (x: number) => fk + g1 * (x - xk) + 0.5 * g2 * (x - xk) ** 2
  const xg = gd[k]
  const span = F.x[1] - F.x[0]
  const base = F.y[0] + (F.y[1] - F.y[0]) * 0.06
  const clampX = (x: number) => Math.max(F.x[0], Math.min(F.x[1], x))

  const kind = (x: number) => (F.d2(x) > 0 ? 'a minimum' : F.d2(x) < 0 ? 'a maximum!' : 'flat')
  // "flat ground" = |f'(x)| < 0.001
  const newtonStatus =
    nNewton < 0
      ? `more than ${MAX_K} steps to reach flat ground`
      : `${nNewton} step${nNewton === 1 ? '' : 's'} to reach flat ground (x = ${fmt(newton[nNewton], 2)}, ${kind(newton[nNewton])})`
  const gdStatus = nGd < 0 ? `more than ${MAX_K} steps to reach flat ground` : `${nGd} step${nGd === 1 ? '' : 's'} to reach flat ground (x = ${fmt(gd[nGd], 2)}, ${kind(gd[nGd])})`

  let warning = ''
  if (ok && g2 < 0) warning = 'Here f″ < 0: the parabola opens downwards, so Newton jumps to its top and heads for a maximum.'
  else if (ok && Math.abs(g1 / g2) > span * 0.6) warning = 'Here the curvature is tiny, so the parabola is very flat and Newton’s jump is huge.'
  const step = () => setK((v) => Math.min(MAX_K - 1, v + 1))
  const choose = (v: Key) => {
    setKey(v)
    setX0(FNS[v].start)
    setK(0)
  }

  return (
    <Figure
      title="Fit a parabola, jump to its bottom: Newton's method"
      caption={
        <>
          At the current point, the dashed pink line is the first-order Taylor approximation (the tangent) and the purple curve is the second-order one
          (a parabola). Newton&apos;s method jumps straight to the parabola&apos;s lowest point. Press <b>Step both</b> to take one Newton step (purple) and
          one gradient-descent step with η = 0.1 (orange) and compare how fast they settle. Drag the orange start point. On the non-convex curve, start
          between the two dips and watch Newton head for the hilltop.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot
          x={F.x}
          y={F.y}
          width={narrow ? 360 : 540}
          height={narrow ? 300 : 320}
          maxWidth={680}
          ariaLabel={`Graph of ${F.label} with Newton's method at x = ${fmt(xk, 2)} after ${k} steps`}
        >
          <Grid xTicks={8} yTicks={6} />
          <Axes xLabel="x" yLabel="f(x)" xTicks={narrow ? 6 : 8} yTicks={6} />
          <FnPath f={F.f} color="var(--viz-1)" width={3} />
          {inView && showPara && <FnPath f={para} color={NEWTON} width={2.2} />}
          {inView && showLine && <FnPath f={line} color="var(--viz-4)" width={2} dash="6 5" />}
          <Clipped>
            {/* gradient descent trail */}
            <Dots points={gd.slice(0, k + 1).filter(Number.isFinite).map((x) => ({ x, y: F.f(x), r: 4, color: GD }))} stroke="none" />
            {/* Newton trail */}
            <Dots points={newton.slice(0, k + 1).filter(Number.isFinite).map((x) => ({ x, y: F.f(x), r: 4.5, color: NEWTON }))} stroke="none" />
            {inView && showPara && Number.isFinite(xN) && (
              <>
                <Path points={[[xN, para(xN)], [xN, base]]} color={NEWTON} width={1.2} dash="3 4" />
                <Dots points={[{ x: xN, y: para(xN), r: 5, color: NEWTON, hollow: true }]} />
                <Arrow from={[xk, base]} to={[clampX(xN), base]} color={NEWTON} width={3} />
              </>
            )}
          </Clipped>
          {inView && showPara && Number.isFinite(xN) && Math.abs(xN - xk) > span * 0.08 && (
            <BoxLabel x={(xk + clampX(xN)) / 2} y={base} dy={-9} color={NEWTON} text="Newton step" />
          )}
          {ok && inView && <Dots points={[{ x: xk, y: fk, r: 7, color: NEWTON }]} />}
          {Number.isFinite(xg) && xg >= F.x[0] && xg <= F.x[1] && <Dots points={[{ x: xg, y: F.f(xg), r: 6, color: GD, hollow: true }]} />}
          {!inView && (
            <Label x={(F.x[0] + F.x[1]) / 2} y={F.y[1]} dy={18} anchor="middle" color="var(--viz-neg)" weight={700}>
              {ok ? `Newton jumped off the chart (x = ${fmt(xk, 1)})` : 'Newton broke down (f″ = 0)'}
            </Label>
          )}
          <Handle
            x={x0}
            y={F.f(x0)}
            r={7}
            color={GD}
            ariaLabel="start point: drag along the curve"
            label={k === 0 ? 'start' : undefined}
            constrain={(x) => {
              const s = Math.round(x * 20) / 20
              return [s, F.f(s)]
            }}
            onChange={(x) => {
              setX0(x)
              setK(0)
            }}
          />
        </Plot>
      </div>
      {ok && (
        <MBlock>
          {narrow
            ? `\\begin{aligned} x_{\\text{new}} &= x - \\frac{f'(x)}{f''(x)} \\\\ &= ${fmt(xk)} - \\frac{${fmt(g1)}}{${fmt(g2)}} = ${fmt(xN)} \\end{aligned}`
            : `x_{\\text{new}} = x - \\frac{f'(x)}{f''(x)} = ${fmt(xk)} - \\frac{${fmt(g1)}}{${par(g2)}} = ${fmt(xN)}`}
        </MBlock>
      )}
      {warning && <div style={{ width: '100%', fontSize: '0.875rem', fontWeight: 600, color: 'var(--viz-neg)' }}>{warning}</div>}
      <Controls>
        <Button primary onClick={step} disabled={k >= MAX_K - 1}>
          Step both
        </Button>
        <Button onClick={() => setK(0)}>Reset</Button>
        <Toggle label="Tangent line (1st order)" checked={showLine} onChange={setShowLine} />
        <Toggle label="Parabola (2nd order)" checked={showPara} onChange={setShowPara} />
      </Controls>
      <Controls>
        <Segmented label="Function" value={key} onChange={choose} options={(Object.keys(FNS) as Key[]).map((v) => ({ value: v, label: FNS[v].label }))} />
      </Controls>
      <div style={{ width: '100%', display: 'grid', gap: '0.3rem', fontSize: '0.875rem', color: 'var(--ink-2)' }}>
        <div>
          <M>{F.tex}</M>, after <b>{k}</b> step{k === 1 ? '' : 's'}: <b style={{ color: NEWTON }}>Newton</b> at x = {fmt(xk, 4)},{' '}
          <b style={{ color: GD }}>gradient descent</b> at x = {fmt(xg, 4)}.
        </div>
        <div>
          <b style={{ color: NEWTON }}>Newton</b> needs {newtonStatus}.
        </div>
        <div>
          <b style={{ color: GD }}>Gradient descent</b> needs {gdStatus}.
        </div>
      </div>
    </Figure>
  )
}
