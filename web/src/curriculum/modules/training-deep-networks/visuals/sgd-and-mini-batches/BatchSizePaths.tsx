import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Segmented, Button, Plot, Path, Dots, Label, Axes, DraggablePoint, usePlot, useNarrow, useAnimationFrame, useBump, mulberry32 } from '../../../../../kit'
import { regData, loss, batchGrad, contour, permutation, N, LR, START } from './regressionData'

/*
  Three runs of gradient descent on the same line-fitting loss, from the same start:
    full batch (all N = 200 examples per step), mini-batch (B examples) and SGD (1 example).
  Two ways to compare them: after the same number of STEPS, or after the same COMPUTE
  (number of example-gradients evaluated). Mini-batches are drawn epoch by epoch from a shuffled order.
*/

const W_DOM: [number, number] = [-2.2, 2.6]
const B_DOM: [number, number] = [-1.6, 2.6]
const LEVELS = [0.05, 0.15, 0.35, 0.7, 1.2, 2, 3, 4.5, 6.5]
const B_CHOICES = [2, 4, 8, 16, 32, 64, 128]
type Mode = 'steps' | 'compute'

interface Run {
  pts: [number, number][]
  /** examples processed after each point (cum[0] = 0) */
  cum: number[]
}

function runGD(start: [number, number], B: number, seed: number, stop: (steps: number, examples: number) => boolean): Run {
  const d = regData()
  const r = mulberry32(seed)
  let order: number[] = []
  let p = start
  const pts: [number, number][] = [p]
  const cum = [0]
  let ex = 0
  for (let s = 0; s < 5000; s++) {
    let idx: number[] | null
    if (B >= N) idx = null
    else {
      if (order.length === 0) order = permutation(N, r)
      idx = order.slice(0, B)
      order = order.slice(B)
    }
    const n = idx ? idx.length : N
    if (stop(s, ex + n)) break
    const g = batchGrad(d, idx, p[0], p[1])
    p = [p[0] - LR * g[0], p[1] - LR * g[1]]
    ex += n
    pts.push(p)
    cum.push(ex)
  }
  return { pts, cum }
}

function Clipped({ children }: { children: ReactNode }) {
  const { clipId } = usePlot()
  return <g clipPath={`url(#${clipId})`}>{children}</g>
}

const fmt = (n: number) => n.toLocaleString('en-GB')

export default function BatchSizePaths() {
  const [mode, setMode] = useState<Mode>('steps')
  const [steps, setSteps] = useState(40)
  const [epochs, setEpochs] = useState(2)
  const [bi, setBi] = useState(3)
  const [start, setStart] = useState<[number, number]>(START)
  const [seed, bump] = useBump()
  const [prog, setProg] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const d = regData()
  const B = B_CHOICES[bi]
  const budget = Math.round(epochs * N)

  const runs = useMemo(() => {
    const stop = (s: number, exAfter: number) => (mode === 'steps' ? s >= steps : exAfter > budget)
    return [
      { key: 'full', name: 'Full batch', per: N, color: 'var(--viz-1)', run: runGD(start, N, 1, stop) },
      { key: 'mini', name: `Mini-batch (B = ${B})`, per: B, color: 'var(--viz-3)', run: runGD(start, B, 101 + seed * 7919 + B, stop) },
      { key: 'sgd', name: 'SGD (B = 1)', per: 1, color: 'var(--viz-2)', run: runGD(start, 1, 202 + seed * 7919, stop) },
    ]
  }, [mode, steps, budget, start, B, seed])

  useAnimationFrame((dt) => {
    setProg((p) => {
      const np = Math.min(1, p + dt / 4)
      if (np >= 1) setPlaying(false)
      return np
    })
  }, playing)

  const replay = () => {
    setProg(0)
    setPlaying(true)
  }
  const stopAnim = () => {
    setPlaying(false)
    setProg(1)
  }

  // the visible prefix of each run at the current animation progress
  const visible = runs.map((r) => {
    const { pts, cum } = r.run
    let k = pts.length - 1
    if (prog < 1) {
      if (mode === 'steps') k = Math.min(pts.length - 1, Math.floor(prog * steps))
      else {
        const lim = prog * budget
        k = 0
        while (k + 1 < cum.length && cum[k + 1] <= lim) k++
      }
    }
    return { ...r, shown: pts.slice(0, k + 1), at: pts[k], stepsDone: k, examplesDone: cum[k] }
  })

  return (
    <Figure
      title="Full batch, mini-batch and SGD race to the valley"
      caption={
        <>
          You are looking down on the loss of a line fit with two parameters, <i>w</i> and <i>b</i>; the cross marks the minimum. All three
          runs use the same learning rate (0.1) and start at the dot labelled start (drag it). With the <b>same number of steps</b>, the full-batch path
          is smooth and SGD is jumpy, yet all three reach the valley. Now switch to the <b>same compute</b>: one full-batch step costs as much
          as 200 SGD steps, so with a budget of 2 epochs the full batch has taken only 2 steps while SGD is already rattling around the
          minimum. Try <b>New random batches</b> to see that the noise changes but the destination does not.
        </>
      }
    >
      <Segmented
        label="Give every run"
        value={mode}
        onChange={(m) => {
          setMode(m)
          stopAnim()
        }}
        options={[
          { value: 'steps', label: 'the same steps' },
          { value: 'compute', label: 'the same compute' },
        ]}
      />
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot
          x={W_DOM}
          y={B_DOM}
          width={narrow ? 360 : 500}
          height={narrow ? 330 : 400}
          maxWidth={620}
          margin={{ left: 36, bottom: 32, right: 12, top: 12 }}
          ariaLabel="Contour map of the loss with three gradient descent paths: full batch, mini-batch and SGD"
        >
          {LEVELS.slice()
            .reverse()
            .map((lv, i) => (
              <Path key={lv} points={contour(d, lv)} closed fill={`color-mix(in srgb, var(--viz-1) ${3 + i * 1.6}%, transparent)`} color="color-mix(in srgb, var(--viz-1) 45%, var(--surface))" width={1.1} />
            ))}
          <Axes xLabel="w" yLabel="b" xTicks={narrow ? 5 : 6} yTicks={4} />
          {visible.map((v) => (
            <Path key={v.key} points={v.shown} color={v.color} width={v.key === 'sgd' ? 1.4 : 2.4} opacity={v.key === 'sgd' ? 0.85 : 1} />
          ))}
          <Clipped>
            {visible.map((v) => (
              <Dots key={v.key} points={[{ x: v.at[0], y: v.at[1], r: 6.5, color: v.color }]} />
            ))}
          </Clipped>
          <Dots points={[{ x: d.opt[0], y: d.opt[1], r: 7, color: 'var(--viz-ink)', shape: 'cross' }]} />
          <Label x={d.opt[0]} y={d.opt[1]} dx={14} dy={26} color="var(--viz-ink)" size={12}>
            minimum
          </Label>
          <DraggablePoint
            x={start[0]}
            y={start[1]}
            color="var(--viz-ink)"
            r={7}
            label="start"
            constrain={(x, y) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]}
            onChange={(x, y) => {
              setStart([x, y])
              stopAnim()
            }}
          />
        </Plot>
      </div>
      <div style={{ width: '100%', display: 'grid', gap: '0.3rem', fontSize: 'var(--step--1)' }} role="table" aria-label="Cost and result of each run">
        <div role="row" style={{ display: 'grid', gridTemplateColumns: 'minmax(7.5rem, 1.6fr) repeat(3, minmax(3.6rem, 1fr))', gap: '0.5rem', color: 'var(--ink-3)', fontWeight: 600 }}>
          <span role="columnheader">run</span>
          <span role="columnheader" style={{ textAlign: 'right' }}>steps</span>
          <span role="columnheader" style={{ textAlign: 'right' }}>examples used</span>
          <span role="columnheader" style={{ textAlign: 'right' }}>loss now</span>
        </div>
        {visible.map((v) => (
          <div key={v.key} role="row" style={{ display: 'grid', gridTemplateColumns: 'minmax(7.5rem, 1.6fr) repeat(3, minmax(3.6rem, 1fr))', gap: '0.5rem', alignItems: 'baseline' }}>
            <span role="cell" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontWeight: 600, color: 'var(--ink)' }}>
              <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 3, background: v.color, flex: '0 0 auto' }} />
              {v.name}
            </span>
            <span role="cell" className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmt(v.stepsDone)}</span>
            <span role="cell" className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmt(v.examplesDone)}</span>
            <span role="cell" className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{loss(d, v.at[0], v.at[1]).toFixed(3)}</span>
          </div>
        ))}
        <div style={{ color: 'var(--ink-3)' }}>
          Lowest possible loss: <span className="tabular" style={{ fontFamily: 'var(--font-mono)' }}>{d.lmin.toFixed(3)}</span>. Each step costs as many example-gradients as its batch size.
        </div>
      </div>
      <Controls>
        {mode === 'steps' ? (
          <Slider label="number of steps (for every run)" value={steps} min={1} max={80} step={1} onChange={(v) => { setSteps(v); stopAnim() }} />
        ) : (
          <Slider label="compute budget (for every run)" value={epochs} min={0.5} max={5} step={0.5} onChange={(v) => { setEpochs(v); stopAnim() }} format={(v) => `${v} epoch${v === 1 ? '' : 's'} = ${fmt(v * N)} examples`} />
        )}
        <Slider label="mini-batch size B" value={bi} min={0} max={B_CHOICES.length - 1} step={1} onChange={(v) => { setBi(v); stopAnim() }} format={(v) => String(B_CHOICES[v])} />
      </Controls>
      <Controls>
        <Button primary onClick={replay}>{playing ? 'Playing…' : 'Replay the race'}</Button>
        <Button onClick={() => { bump(); stopAnim() }}>New random batches</Button>
      </Controls>
    </Figure>
  )
}
