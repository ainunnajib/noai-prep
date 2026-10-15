import { useState } from 'react'
import { Figure, Controls, Readout, Toggle, Button, Plot, Grid, Axes, Arrow, Dots, Label, HLine, VLine, M, usePlot, useNarrow } from '../../../../../kit'

/*
  Gradient accumulation with a model y = w*x + b (starting at w = b = 0) and MSE loss.
  A batch of 8 examples is split into 4 micro-batches of 2. Each loss.backward() adds that
  micro-batch's gradient (∂L/∂w, ∂L/∂b) to .grad, drawn head to tail. Without dividing the loss by 4
  the sum ends at 4 × the gradient of the real batch of 8; with the division it lands exactly on it.
  All numbers checked with torch (scratch script accum.py).
*/

const MICRO: { pts: [number, number][]; g: [number, number] }[] = [
  { pts: [[2, 2], [-1, -2]], g: [-6, 0] },
  { pts: [[1, -3], [3, 4]], g: [-9, -1] },
  { pts: [[-1, 1], [1, -2]], g: [3, 1] },
  { pts: [[-1, 3], [3, 1]], g: [0, -4] },
]
const G: [number, number] = [-3, -1] // gradient of the mean loss over all 8 examples
const COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)']
const LR = 0.1

const f = (v: number) => {
  const r = Math.round(v * 100) / 100
  return (r < 0 ? '−' : '') + String(Math.abs(r))
}
const vec = (v: [number, number]) => `(${f(v[0])}, ${f(v[1])})`

/** A label beside the middle of an arrow, pushed sideways (to the arrow's left) by `off` px. */
function ArrowLabel({ from, to, text, color, off = 11 }: { from: [number, number]; to: [number, number]; text: string; color: string; off?: number }) {
  const { xs, ys } = usePlot()
  const x1 = xs(from[0])
  const y1 = ys(from[1])
  const x2 = xs(to[0])
  const y2 = ys(to[1])
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const nx = (y2 - y1) / len
  const ny = -(x2 - x1) / len
  return (
    <text className="plot-label" x={(x1 + x2) / 2 + nx * off} y={(y1 + y2) / 2 + ny * off} dy="0.35em" textAnchor="middle" style={{ fill: color, fontWeight: 750, fontSize: 12.5 }}>
      {text}
    </text>
  )
}

export default function GradAccumulation() {
  const [k, setK] = useState(4)
  const [divide, setDivide] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const s = divide ? 0.25 : 1
  const sums: [number, number][] = [[0, 0]]
  MICRO.forEach((m) => {
    const p = sums[sums.length - 1]
    sums.push([p[0] + s * m.g[0], p[1] + s * m.g[1]])
  })
  const grad = sums[k]
  const ratio = k === 4 ? grad[0] / G[0] : null
  const done = k === 4

  return (
    <Figure
      wide
      title="Gradient accumulation: four small backward() calls, one step"
      caption={
        <>
          Toy version: a batch of 8 examples split into 4 micro-batches of 2 (the text's 32 = 4 × 8 works the same way). Each arrow is one micro-batch's
          gradient <M>{'(\\partial L/\\partial w,\\ \\partial L/\\partial b)'}</M>, added onto <code>.grad</code> by <code>loss.backward()</code>. The dashed
          arrow is the gradient of the full batch, all 8 examples at once. With the division switched off, the four mean-gradients add up to <b>4 times</b> too much. Switch on{' '}
          <code>loss = loss / 4</code> and the sum lands exactly on the dashed arrow. Use the buttons to replay the loop. (Model <M>{'\\hat y = wx + b'}</M> at <M>{'w = b = 0'}</M>, mean squared error.)
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
      <Plot x={[-16, 4]} y={[-5.5, 2]} width={560} height={230} minHeight={210} margin={{ left: 34, bottom: 34, top: 12, right: 12 }} ariaLabel="Micro-batch gradient arrows added head to tail, compared with the full-batch gradient">
        <Grid xTicks={narrow ? 5 : 10} yTicks={7} />
        <Axes xTicks={narrow ? 5 : 10} yTicks={4} xLabel="∂L/∂w" />
        <HLine y={0} color="var(--viz-axis)" dash="0" width={1} />
        <VLine x={0} color="var(--viz-axis)" dash="0" width={1} />
        <Label x={0} y={2} dx={6} dy={12} color="var(--viz-axis)" size={12} weight={700}>
          ∂L/∂b
        </Label>
        <Arrow from={[0, 0]} to={G} color="var(--ink-2)" width={2.2} dash="5 4" />
        {/* below-left of the dashed arrow's tip, clear of the micro-batch arrows; once the divided sum lands there, the .grad label says it instead */}
        {!(divide && k === 4) && (
          <Label x={G[0]} y={G[1]} dx={-10} dy={17} anchor="end" size={12} weight={700} color="var(--ink-2)">
            full batch (all 8)
          </Label>
        )}
        {divide &&
          MICRO.slice(0, k).map((m, i) => {
            const a = MICRO.slice(0, i).reduce<[number, number]>((p, q) => [p[0] + q.g[0], p[1] + q.g[1]], [0, 0])
            return <Arrow key={`ghost${i}`} from={a} to={[a[0] + m.g[0], a[1] + m.g[1]]} color={`color-mix(in srgb, ${COLOURS[i]} 45%, var(--surface))`} width={1.5} dash="3 4" head={6} />
          })}
        {MICRO.slice(0, k).map((_, i) => (
          <Arrow key={i} from={sums[i]} to={sums[i + 1]} color={COLOURS[i]} width={3} />
        ))}
        {divide && k === 4 && (
          <Label x={-12} y={-4} dx={10} dy={18} size={12} color="var(--ink-3)">
            without ÷ 4 (faint)
          </Label>
        )}
        {!divide &&
          MICRO.slice(0, k).map((_, i) => <ArrowLabel key={i} from={sums[i]} to={sums[i + 1]} text={String(i + 1)} color={COLOURS[i]} off={(i === 0 ? -1 : 1) * 11} />)}
        <Dots points={[{ x: grad[0], y: grad[1], r: 6, color: done ? (divide ? 'var(--ok)' : 'var(--bad)') : 'var(--ink)' }]} />
        <Label
          x={grad[0]}
          y={grad[1]}
          dx={k === 0 ? 10 : grad[0] < -8 ? 10 : -10}
          dy={k === 0 ? -10 : 18}
          anchor={k === 0 || grad[0] < -8 ? 'start' : 'end'}
          size={12.5}
          weight={750}
          color={done ? (divide ? 'var(--ok)' : 'var(--bad)') : 'var(--ink)'}
        >
          {done ? (divide ? '.grad = full batch ✓' : '.grad: 4 × too big') : '.grad so far'}
        </Label>
      </Plot>
      </div>

      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
        {MICRO.map((m, i) => {
          const on = i < k
          return (
            <div
              key={i}
              style={{
                padding: '5px 8px',
                borderRadius: 9,
                border: `1.5px solid ${on ? COLOURS[i] : 'var(--rule)'}`,
                background: on ? `color-mix(in srgb, ${COLOURS[i]} 9%, var(--surface))` : 'var(--surface-2)',
                opacity: on ? 1 : 0.6,
                fontSize: 12.5,
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>micro-batch {i + 1}</div>
              <div style={{ color: 'var(--ink-3)' }}>
                (x, y) ={' '}
                {m.pts.map((p, j) => (
                  <span key={j} style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-2)', whiteSpace: 'nowrap', marginRight: 6 }}>
                    {vec(p)}
                  </span>
                ))}
              </div>
              <div style={{ color: 'var(--ink-3)' }}>
                gradient{divide ? ' ÷ 4' : ''} = <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 650 }}>{vec([s * m.g[0], s * m.g[1]])}</span>
              </div>
            </div>
          )
        })}
      </div>

      <Controls>
        <Toggle label="loss = loss / 4" checked={divide} onChange={setDivide} />
        <Button onClick={() => setK(0)} disabled={k === 0}>
          optimizer.zero_grad()
        </Button>
        <Button primary onClick={() => setK(Math.min(4, k + 1))} disabled={k === 4}>
          loss.backward() on micro-batch {Math.min(4, k + 1)}
        </Button>
      </Controls>
      <Readout
        items={[
          ['.grad', vec(grad)],
          ['full-batch gradient', vec(G)],
          ['.grad ÷ full batch', ratio == null ? `after ${k} of 4` : `${ratio.toFixed(2)}×`],
          ['step (lr 0.1) moves (w, b) to', done ? vec([-LR * grad[0], -LR * grad[1]]) : 'not yet'],
        ]}
      />
    </Figure>
  )
}
