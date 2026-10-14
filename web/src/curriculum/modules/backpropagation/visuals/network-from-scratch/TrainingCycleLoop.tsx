import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Controls, Readout, Button, Plot, usePlot, Path, CodeBlock, useAnimationFrame, useNarrow, mulberry32 } from '../../../../../kit'
import { makeMoons, oneHot, initParams, cloneParams, forward, trainStep, fmtShape, type Params } from './net'

/*
  The four-step training loop on a real (tiny) network: 2 inputs → 12 ReLU units → 2 softmax outputs,
  trained by full-batch gradient descent on 100 points shaped like two interleaving moons.
  Step through the stages one at a time, or run many loops and watch the decision boundary bend.
*/

const N_POINTS = 100
const H = 12
const LR = 0.5
const GRID = 30
const LIM = 2.5

const STAGES = [
  {
    name: 'Forward pass',
    short: 'Forward',
    lines: [2, 3, 4, 5, 6],
    what: 'Push all the examples through the network at once: two matrix products, a ReLU and a softmax. Out come probabilities P, one row per example.',
  },
  {
    name: 'Loss',
    short: 'Loss',
    lines: [7, 8],
    what: 'Compare P with the true labels. The cross-entropy is the average of −log(probability given to the right class): one number, lower is better. Misclassified points are ringed.',
  },
  {
    name: 'Backward pass',
    short: 'Backward',
    lines: [9, 10, 11, 12, 13],
    what: 'Start from dZ2 = (P − Y)/N and apply the chain rule layer by layer. Every parameter gets a gradient with exactly its own shape.',
  },
  {
    name: 'Update',
    short: 'Update',
    lines: [14, 15, 16],
    what: `Take one gradient-descent step: every parameter moves a little against its gradient, W ← W − ${LR}·dW. The boundary shifts.`,
  },
]

const CODE = `for step in range(1000):
    # 1. forward pass
    Z1 = X @ W1 + b1
    A1 = np.maximum(Z1, 0)
    Z2 = A1 @ W2 + b2
    P = softmax(Z2)
    # 2. loss
    loss = -np.sum(Y * np.log(P)) / N
    # 3. backward pass
    dZ2 = (P - Y) / N
    dW2 = A1.T @ dZ2;  db2 = dZ2.sum(axis=0)
    dA1 = dZ2 @ W2.T;  dZ1 = dA1 * (Z1 > 0)
    dW1 = X.T @ dZ1;   db1 = dZ1.sum(axis=0)
    # 4. update
    W1 -= lr * dW1;    b1 -= lr * db1
    W2 -= lr * dW2;    b2 -= lr * db2`

function probGrid(p: Params): number[][] {
  // P(class 1) at the centre of every grid cell
  const pts: number[][] = []
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++) pts.push([-LIM + ((c + 0.5) * 2 * LIM) / GRID, LIM - ((r + 0.5) * 2 * LIM) / GRID])
  const Y = pts.map(() => [1, 0])
  const f = forward(pts, Y, p)
  const out: number[][] = []
  for (let r = 0; r < GRID; r++) out.push(f.P.slice(r * GRID, (r + 1) * GRID).map((row) => row[1]))
  return out
}

function Boundary({ grid }: { grid: number[][] }) {
  const { xs, ys } = usePlot()
  const cw = Math.abs(xs(2 * LIM / GRID) - xs(0)) + 0.6
  return (
    <g aria-hidden="true">
      {grid.map((row, r) =>
        row.map((p1, c) => {
          const a = Math.round(Math.min(1, Math.abs(p1 - 0.5) * 2) * 38)
          const col = p1 >= 0.5 ? 'var(--viz-2)' : 'var(--viz-1)'
          return (
            <rect
              key={`${r}-${c}`}
              x={xs(-LIM + (c * 2 * LIM) / GRID)}
              y={ys(LIM - (r * 2 * LIM) / GRID)}
              width={cw}
              height={cw}
              style={{ fill: `color-mix(in srgb, ${col} ${a}%, var(--surface))` }}
            />
          )
        }),
      )}
    </g>
  )
}

function Points({ X, y, P, ring }: { X: number[][]; y: number[]; P: number[][]; ring: boolean }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {X.map(([a, b], i) => {
        const wrong = (P[i][1] > P[i][0] ? 1 : 0) !== y[i]
        const cx = xs(a)
        const cy = ys(b)
        return (
          <g key={i}>
            {ring && wrong && <circle cx={cx} cy={cy} r={8} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2.2 }} />}
            {y[i] === 0 ? (
              <circle cx={cx} cy={cy} r={3.8} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 1.2 }} />
            ) : (
              <rect x={cx - 3.6} y={cy - 3.6} width={7.2} height={7.2} style={{ fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 1.2 }} />
            )}
          </g>
        )
      })}
    </g>
  )
}

function CycleDiagram({ stage, loop, busy }: { stage: number; loop: number; busy: boolean }) {
  const size = 270
  const c = size / 2
  const R = 86
  const pos = [
    [c, c - R],
    [c + R, c],
    [c, c + R],
    [c - R, c],
  ]
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={`Training cycle, stage ${stage + 1}: ${STAGES[stage].name}`} style={{ maxWidth: '100%' }}>
      <circle cx={c} cy={c} r={R} style={{ fill: 'none', stroke: 'var(--viz-grid)', strokeWidth: 10 }} />
      {/* arrows between stages (clockwise) */}
      {[0, 1, 2, 3].map((i) => {
        const a0 = -Math.PI / 2 + (i * Math.PI) / 2 + 0.36
        const a1 = -Math.PI / 2 + ((i + 1) * Math.PI) / 2 - 0.36
        const x0 = c + R * Math.cos(a0)
        const y0 = c + R * Math.sin(a0)
        const x1 = c + R * Math.cos(a1)
        const y1 = c + R * Math.sin(a1)
        const on = !busy && stage === (i + 1) % 4
        const ang = a1 + Math.PI / 2
        return (
          <g key={i}>
            <path d={`M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1}`} style={{ fill: 'none', stroke: on ? 'var(--accent)' : 'var(--viz-muted)', strokeWidth: on ? 3 : 2 }} />
            <path
              d={`M${x1},${y1} l${-8 * Math.cos(ang) + 4 * Math.sin(ang)},${-8 * Math.sin(ang) - 4 * Math.cos(ang)} l${-8 * Math.sin(ang)},${8 * Math.cos(ang)} z`}
              style={{ fill: on ? 'var(--accent)' : 'var(--viz-muted)' }}
            />
          </g>
        )
      })}
      {STAGES.map((s, i) => {
        const on = busy || stage === i
        return (
          <g key={s.name}>
            <rect
              x={pos[i][0] - 40}
              y={pos[i][1] - 16}
              width={80}
              height={32}
              rx={9}
              style={{
                fill: on ? 'color-mix(in srgb, var(--accent) 18%, var(--surface))' : 'var(--surface-2)',
                stroke: on ? 'var(--accent)' : 'var(--viz-muted)',
                strokeWidth: on ? 2.4 : 1.2,
              }}
            />
            <text x={pos[i][0]} y={pos[i][1]} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 13, fontWeight: on ? 800 : 600 }}>
              {i + 1}. {s.short}
            </text>
          </g>
        )
      })}
      <text x={c} y={c - 6} textAnchor="middle" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
        loop
      </text>
      <text x={c} y={c + 14} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 20, fontWeight: 800 }}>
        {loop}
      </text>
    </svg>
  )
}

function StageChips({ stage, busy }: { stage: number; busy: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      {STAGES.map((s, i) => {
        const on = busy || stage === i
        return (
          <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: 8,
                border: `1.5px solid ${on ? 'var(--accent)' : 'var(--rule)'}`,
                background: on ? 'color-mix(in srgb, var(--accent) 16%, var(--surface))' : 'var(--surface-2)',
                fontWeight: on ? 800 : 600,
                fontSize: '0.8125rem',
                color: 'var(--ink)',
              }}
            >
              {i + 1}. {s.short}
            </span>
            <span aria-hidden="true" style={{ color: 'var(--ink-3)' }}>
              {i < 3 ? '→' : '↺'}
            </span>
          </span>
        )
      })}
    </div>
  )
}

export default function TrainingCycleLoop() {
  const data = useMemo(() => {
    const m = makeMoons(7, N_POINTS)
    return { X: m.X, y: m.y, Y: oneHot(m.y, 2) }
  }, [])
  const init = useMemo(() => initParams(mulberry32(3), 2, H, 2), [])
  const params = useRef<Params>(cloneParams(init))
  const [, setVersion] = useState(0)
  const [stage, setStage] = useState(0)
  const [loop, setLoop] = useState(0)
  const [history, setHistory] = useState<number[]>(() => [forward(data.X, data.Y, init).loss])
  const [playing, setPlaying] = useState(false)
  const [pending, setPending] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const f = forward(data.X, data.Y, params.current)
  const acc = f.P.filter((r, i) => (r[1] > r[0] ? 1 : 0) === data.y[i]).length / data.y.length
  const grid = probGrid(params.current)
  const busy = pending > 0

  const doUpdate = () => {
    trainStep(data.X, data.Y, params.current, LR)
    const L = forward(data.X, data.Y, params.current).loss
    setHistory((h) => [...h, L])
    setLoop((n) => n + 1)
    setVersion((v) => v + 1)
  }

  const advance = () => {
    const next = (stage + 1) % 4
    if (next === 3) doUpdate()
    setStage(next)
  }

  // auto-advance through the stages while playing
  const advRef = useRef(advance)
  advRef.current = advance
  useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => advRef.current(), 900)
    return () => window.clearInterval(t)
  }, [playing])

  // fast-forward many loops, a few per animation frame
  useAnimationFrame(() => {
    const k = Math.min(pending, 3)
    const losses: number[] = []
    for (let i = 0; i < k; i++) {
      trainStep(data.X, data.Y, params.current, LR)
      losses.push(forward(data.X, data.Y, params.current).loss)
    }
    setHistory((h) => [...h, ...losses])
    setLoop((n) => n + k)
    setPending((p) => p - k)
    setVersion((v) => v + 1)
  }, pending > 0)

  const reset = () => {
    params.current = cloneParams(init)
    setPlaying(false)
    setPending(0)
    setStage(0)
    setLoop(0)
    setHistory([forward(data.X, data.Y, init).loss])
    setVersion((v) => v + 1)
  }
  const runLoops = (n: number) => {
    setPlaying(false)
    setStage(0)
    setPending((p) => p + n)
  }

  const N = data.X.length
  const shapes = [
    `X ${fmtShape([N, 2])} → Z1, A1 ${fmtShape([N, H])} → Z2, P ${fmtShape([N, 2])}`,
    `P ${fmtShape([N, 2])} and Y ${fmtShape([N, 2])} → loss, a single number: ${f.loss.toFixed(3)}`,
    `dZ2 ${fmtShape([N, 2])} → dW2 ${fmtShape([H, 2])}, db2 ${fmtShape([2])} → dA1, dZ1 ${fmtShape([N, H])} → dW1 ${fmtShape([2, H])}, db1 ${fmtShape([H])}`,
    `W1 ${fmtShape([2, H])}, b1 ${fmtShape([H])}, W2 ${fmtShape([H, 2])}, b2 ${fmtShape([2])}: each minus ${LR} × its gradient (same shape)`,
  ]
  const hMax = Math.max(0.8, ...history)
  const hx = Math.max(10, history.length - 1)

  return (
    <Figure
      wide
      title="The training loop: forward, loss, backward, update"
      caption={
        <>
          Press <b>Next stage</b> to walk through one loop: the matching NumPy lines light up below, with the shapes of the arrays involved. Then
          press <b>Run 100 loops</b> a few times. Each loop nudges every weight a little; watch the loss fall and the boundary bend around the
          moons until (almost) every point is on the right side. Blue circles and orange squares are the two classes; the shading is the
          network's probability for each class.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'auto minmax(0, 1fr)', gap: '0.75rem', alignItems: 'center', justifyItems: 'center' }}
      >
        {narrow ? <StageChips stage={stage} busy={busy} /> : <CycleDiagram stage={stage} loop={loop} busy={busy} />}
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Plot x={[-LIM, LIM]} y={[-LIM, LIM]} width={340} height={340} maxWidth={380} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} ariaLabel={`Decision boundary after ${loop} loops: accuracy ${(acc * 100).toFixed(0)} percent`}>
            <Boundary grid={grid} />
            <Points X={data.X} y={data.y} P={f.P} ring={!busy && stage === 1} />
          </Plot>
        </div>
      </div>
      <div style={{ width: '100%', borderRadius: 10, padding: '0.6rem 0.8rem', background: 'var(--surface-2)', border: '1px solid var(--rule)' }}>
        <div style={{ fontWeight: 800, color: 'var(--ink)', marginBottom: '0.2rem' }}>
          {busy ? `Running loops… (${pending} to go)` : `Stage ${stage + 1} of 4: ${STAGES[stage].name}`}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--ink-2)', lineHeight: 1.45 }}>{busy ? 'Forward, loss, backward, update, again and again.' : STAGES[stage].what}</div>
        {!busy && (
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink)', marginTop: '0.35rem', overflowWrap: 'anywhere' }}>
            {shapes[stage]}
          </div>
        )}
      </div>
      <Controls>
        <Button primary onClick={advance} disabled={busy || playing}>
          Next stage
        </Button>
        <Button onClick={() => setPlaying((p) => !p)} disabled={busy}>
          {playing ? 'Pause' : 'Play stages'}
        </Button>
        <Button onClick={() => runLoops(10)}>Run 10 loops</Button>
        <Button onClick={() => runLoops(100)}>Run 100 loops</Button>
        <Button onClick={reset}>Reset</Button>
      </Controls>
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.75rem', alignItems: 'center' }}>
        <Readout
          items={[
            ['loops', String(loop)],
            ['loss', f.loss.toFixed(3)],
            ['accuracy', `${(acc * 100).toFixed(0)}%`],
          ]}
        />
        <Plot x={[0, hx]} y={[0, hMax]} width={300} height={80} margin={{ left: 34, right: 8, top: 8, bottom: 18 }} ariaLabel="Loss after each loop">
          <Path points={history.map((v, i) => [i, v] as [number, number])} color="var(--viz-3)" width={2} />
          <AxisHint hMax={hMax} hx={hx} last={history[history.length - 1]} n={history.length - 1} />
        </Plot>
      </div>
      <div style={{ width: '100%' }}>
        <CodeBlock code={CODE} language="python" title="the whole loop in NumPy" highlight={busy ? [] : STAGES[stage].lines} />
      </div>
    </Figure>
  )
}

function AxisHint({ hMax, hx, last, n }: { hMax: number; hx: number; last: number; n: number }) {
  const { xs, ys } = usePlot()
  return (
    <g style={{ fontSize: 10 }}>
      <circle cx={xs(n)} cy={ys(last)} r={3.5} style={{ fill: 'var(--viz-3)' }} />
      <text x={xs(0) + 6} y={ys(hMax) + 8} style={{ fill: 'var(--viz-axis)' }}>
        loss per loop
      </text>
      <line x1={xs(0)} x2={xs(hx)} y1={ys(0)} y2={ys(0)} style={{ stroke: 'var(--viz-axis)' }} />
      <line x1={xs(0)} x2={xs(0)} y1={ys(0)} y2={ys(hMax)} style={{ stroke: 'var(--viz-axis)' }} />
      <text x={xs(0) - 4} y={ys(0)} textAnchor="end" style={{ fill: 'var(--viz-axis)' }}>
        0
      </text>
      <text x={xs(0) - 4} y={ys(hMax) + 8} textAnchor="end" style={{ fill: 'var(--viz-axis)' }}>
        {hMax.toFixed(1)}
      </text>
      <text x={xs(hx)} y={ys(0) + 13} textAnchor="end" style={{ fill: 'var(--viz-axis)' }}>
        {hx} loops
      </text>
    </g>
  )
}
