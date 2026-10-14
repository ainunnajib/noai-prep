import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button, Bars, Plot, Grid, Axes, Path, Arrow, usePlayer, PlayerControls, useAnimationFrame, usePlot, M } from '../../../../../kit'
import { POS_C, NEG_C, W_C, clipLine, halfPlane, foot, num, tnum, tparen, step, type Pt } from './shared'

/*
  The perceptron learning rule, one example at a time. Every step checks one point:
  z = w·x + b, ŷ = step(z). If ŷ is right nothing changes; if it is wrong,
  w ← w + η(y − ŷ)x and b ← b + η(y − ŷ). The run is simulated in advance so the learner can step
  forwards and backwards. Separable data stops after a pass with no mistakes; the "two rebels" data
  (one point of each class planted on the wrong side) never does, so it is cut off after 10 passes.
*/

interface Datum {
  x: Pt
  y: number
}

const SEP: Datum[] = [
  { x: [-3, 1], y: 1 },
  { x: [2, 0.5], y: 0 },
  { x: [1, 3], y: 1 },
  { x: [-3, -2.5], y: 0 },
  { x: [-1, 0.5], y: 1 },
  { x: [1, -2.5], y: 0 },
  { x: [3, 3], y: 1 },
  { x: [-0.5, -0.5], y: 0 },
  { x: [-2, 2.5], y: 1 },
  { x: [3, 1], y: 0 },
  { x: [1.5, 1.5], y: 1 },
  { x: [-1.5, -1.5], y: 0 },
  { x: [0, 1.5], y: 1 },
  { x: [2.5, -1.5], y: 0 },
]
const REBELS: Datum[] = [...SEP.slice(0, 5), { x: [2, -1], y: 1 }, ...SEP.slice(5, 10), { x: [-2, 1.5], y: 0 }, ...SEP.slice(10)]

const W0: Pt = [-1, -1]
const B0 = 1
const MAX_PASSES = 10
const XR: Pt = [-4, 4]
const YR: Pt = [-3.5, 4]

interface Frame {
  pass: number
  idx: number
  d: Datum | null
  z: number
  yhat: number
  wBefore: Pt
  bBefore: number
  w: Pt
  b: number
  updated: boolean
}

function simulate(data: Datum[], eta: number) {
  const frames: Frame[] = [{ pass: 0, idx: -1, d: null, z: 0, yhat: 0, wBefore: W0, bBefore: B0, w: W0, b: B0, updated: false }]
  let w: Pt = [...W0]
  let b = B0
  let converged = false
  for (let pass = 0; pass < MAX_PASSES && !converged; pass++) {
    let mistakes = 0
    data.forEach((d, idx) => {
      const z = w[0] * d.x[0] + w[1] * d.x[1] + b
      const yhat = step(z)
      const err = d.y - yhat
      const wBefore: Pt = [w[0], w[1]]
      const bBefore = b
      if (err !== 0) {
        mistakes++
        // round to 10 decimals so 0.1 + 0.2 style float noise never shows up as a wrong side
        w = [Math.round((w[0] + eta * err * d.x[0]) * 1e10) / 1e10, Math.round((w[1] + eta * err * d.x[1]) * 1e10) / 1e10]
        b = Math.round((b + eta * err) * 1e10) / 1e10
      }
      frames.push({ pass, idx, d, z, yhat, wBefore, bBefore, w, b, updated: err !== 0 })
    })
    if (mistakes === 0) converged = true
  }
  return { frames, converged }
}

/** Ease the drawn boundary towards the current weights so each update visibly swings the line. */
function useEased(target: [number, number, number]) {
  const [shown, setShown] = useState(target)
  const goal = useRef(target)
  goal.current = target
  const [moving, setMoving] = useState(false)
  useEffect(() => setMoving(true), [target[0], target[1], target[2]])
  useAnimationFrame((dt) => {
    setShown((s) => {
      const g = goal.current
      const k = Math.min(1, dt * 9)
      const n: [number, number, number] = [s[0] + (g[0] - s[0]) * k, s[1] + (g[1] - s[1]) * k, s[2] + (g[2] - s[2]) * k]
      if (Math.abs(n[0] - g[0]) + Math.abs(n[1] - g[1]) + Math.abs(n[2] - g[2]) < 1e-3) {
        setMoving(false)
        return g
      }
      return n
    })
  }, moving)
  return shown
}

function Points({ data, current, w, b }: { data: Datum[]; current: number; w: Pt; b: number }) {
  const { xs, ys } = usePlot()
  const r = 6.5
  return (
    <g>
      {data.map((d, i) => {
        const cx = xs(d.x[0])
        const cy = ys(d.x[1])
        const wrong = step(w[0] * d.x[0] + w[1] * d.x[1] + b) !== d.y
        return (
          <g key={i}>
            {i === current && <circle cx={cx} cy={cy} r={r + 10} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2.2 }} />}
            {wrong && <circle cx={cx} cy={cy} r={r + 4.5} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2 }} />}
            {d.y ? (
              <circle cx={cx} cy={cy} r={r} style={{ fill: POS_C, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
            ) : (
              <rect x={cx - r * 0.9} y={cy - r * 0.9} width={r * 1.8} height={r * 1.8} style={{ fill: NEG_C, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
            )}
          </g>
        )
      })}
    </g>
  )
}

const vec = (p: Pt) => `(${tnum(p[0])}, ${tnum(p[1])})`

export default function PerceptronLearn() {
  const [eta, setEta] = useState(0.3)
  const [mode, setMode] = useState<'sep' | 'rebels'>('sep')
  const data = mode === 'sep' ? SEP : REBELS
  const { frames, converged } = useMemo(() => simulate(data, eta), [data, eta])
  const player = usePlayer({ steps: frames.length, interval: 650 })
  const k = Math.min(player.step, frames.length - 1)
  const f = frames[k]

  useEffect(() => {
    player.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eta, mode])

  const [sw1, sw2, sb] = useEased([f.w[0], f.w[1], f.b])
  const wShown: Pt = [sw1, sw2]
  const line = clipLine(sw1, sw2, sb, XR, YR)
  const ghost = f.updated ? clipLine(f.wBefore[0], f.wBefore[1], f.bBefore, XR, YR) : null
  const posPoly = halfPlane(sw1, sw2, sb, XR, YR, 1)
  const negPoly = halfPlane(sw1, sw2, sb, XR, YR, -1)
  const wl = Math.hypot(sw1, sw2)
  let arrow: [Pt, Pt] | null = null
  if (wl > 1e-6) {
    const ft = foot(wShown, sb, [0, 0.25])
    if (ft[0] > XR[0] && ft[0] < XR[1] && ft[1] > YR[0] && ft[1] < YR[1]) arrow = [ft, [ft[0] + (1.1 * sw1) / wl, ft[1] + (1.1 * sw2) / wl]]
  }

  // mistakes per pass, up to the current frame
  const perPass: number[] = []
  for (let i = 1; i <= k; i++) {
    const fr = frames[i]
    while (perPass.length <= fr.pass) perPass.push(0)
    if (fr.updated) perPass[fr.pass]++
  }
  const wrongNow = data.filter((d) => step(f.w[0] * d.x[0] + f.w[1] * d.x[1] + f.b) !== d.y).length
  const last = k === frames.length - 1
  const passDone = (p: number) => frames.some((fr, i) => i <= k && fr.pass === p && fr.idx === data.length - 1)

  const nextMistake = () => {
    player.pause()
    const j = frames.findIndex((fr, i) => i > k && fr.updated)
    player.setStep(j === -1 ? frames.length - 1 : j)
  }

  let explain
  if (!f.d) {
    explain = (
      <>
        Start: a deliberately bad line with <M>{`w = ${vec(W0)}`}</M> and <M>{`b = ${B0}`}</M>. {wrongNow} of the {data.length} points are on the wrong side (red
        rings). Press <b>Next</b> to check the first example.
      </>
    )
  } else {
    const { x, y } = f.d
    const err = y - f.yhat
    const zText = `z = ${tparen(f.wBefore[0])}\\times${tparen(x[0])} + ${tparen(f.wBefore[1])}\\times${tparen(x[1])} + ${tparen(f.bBefore)} = ${tnum(f.z)}`
    explain = (
      <>
        Check <M>{`x = ${vec(x)}`}</M> with true label <M>{`y = ${y}`}</M>: <M>{zText}</M>, so <M>{`\\hat y = ${f.yhat}`}</M>.{' '}
        {err === 0 ? (
          <span style={{ color: 'var(--viz-pos)', fontWeight: 700 }}>Correct, so nothing changes.</span>
        ) : (
          <>
            <span style={{ color: 'var(--viz-neg)', fontWeight: 700 }}>Wrong</span> (<M>{`y - \\hat y = ${err > 0 ? '+1' : '-1'}`}</M>), so {err > 0 ? 'add' : 'subtract'}{' '}
            <M>{'\\eta x'}</M>: <M>{`w = ${vec(f.wBefore)} ${err > 0 ? '+' : '-'} ${tnum(eta)}\\times${vec(x)} = ${vec(f.w)}`}</M> and{' '}
            <M>{`b = ${tnum(f.bBefore)} ${err > 0 ? '+' : '-'} ${tnum(eta)} = ${tnum(f.b)}`}</M>. The dashed line is where the boundary was.
          </>
        )}
        {last && converged && <b> A whole pass with no mistakes: every point is on its correct side, so learning stops.</b>}
        {last && !converged && <b> {MAX_PASSES} passes and still wrong every time: with a rebel on each side no straight line works, so the rule never settles.</b>}
      </>
    )
  }

  return (
    <Figure
      title="The perceptron learning rule, one example at a time"
      caption={
        <>
          Press <b>Play</b> or step with <b>Next</b>. Each step checks one point (black ring). A correct prediction changes nothing; a mistake nudges the line
          towards fixing that point: the pink weight arrow turns towards the direction of a missed orange point, or away from a wrongly accepted blue one. Watch the
          mistakes per pass shrink to 0. Then change <i>η</i> (bigger jumps or smaller nudges), and switch to <b>two rebels</b>: one orange point planted
          among the blues and one blue among the oranges. No line can be perfect any more, and the rule never stops correcting.
        </>
      }
    >
      <Plot x={XR} y={YR} width={460} height={420} ariaLabel={`Perceptron learning: ${wrongNow} points on the wrong side, current boundary ${num(f.w[0])} x1 + ${num(f.w[1])} x2 + ${num(f.b)} = 0`}>
        {posPoly.length > 2 && <Path points={posPoly} closed fill="color-mix(in srgb, var(--viz-2) 16%, var(--surface))" color="none" width={0} />}
        {negPoly.length > 2 && <Path points={negPoly} closed fill="color-mix(in srgb, var(--viz-1) 11%, var(--surface))" color="none" width={0} />}
        <Grid xTicks={8} yTicks={8} />
        <Axes xLabel="x₁" yLabel="x₂" xTicks={8} yTicks={8} origin />
        {ghost && <Path points={ghost} color="var(--viz-muted)" width={2} dash="6 5" />}
        {line && <Path points={line} color="var(--viz-ink)" width={2.75} />}
        {arrow && <Arrow from={arrow[0]} to={arrow[1]} color={W_C} width={2.75} label="w" />}
        <Points data={data} current={f.idx} w={f.w} b={f.b} />
      </Plot>
      <div style={{ width: '100%', minHeight: '5.2em', fontSize: '0.92rem', lineHeight: 1.55, color: 'var(--ink)' }}>{explain}</div>
      <PlayerControls player={player} label={() => (f.d ? `Pass ${f.pass + 1} · example ${f.idx + 1} of ${data.length}` : 'Start')} />
      <Controls>
        <Button onClick={nextMistake} disabled={last}>
          Jump to next mistake
        </Button>
        <Segmented
          label="Data"
          options={[
            { value: 'sep', label: 'separable' },
            { value: 'rebels', label: 'two rebels' },
          ]}
          value={mode}
          onChange={setMode}
        />
        <Slider label="learning rate η" value={eta} min={0.1} max={1} step={0.1} onChange={setEta} format={(v) => v.toFixed(1)} />
      </Controls>
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: '0.35rem' }}>Mistakes in each pass through the data</div>
        {perPass.length ? (
          <Bars
            data={perPass.map((m, p) => ({ label: `pass ${p + 1}${passDone(p) ? '' : ' (so far)'}`, value: m, color: m === 0 ? 'var(--viz-pos)' : 'var(--viz-neg)', strong: p === f.pass }))}
            max={data.length}
            format={(v) => String(v)}
            ariaLabel="Mistakes in each pass"
          />
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>No examples checked yet.</div>
        )}
      </div>
    </Figure>
  )
}
