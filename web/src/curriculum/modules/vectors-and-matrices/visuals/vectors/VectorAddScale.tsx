import { useState } from 'react'
import { Figure, Controls, Plot, Grid, Axes, Arrow, Dots, Label, DraggablePoint, Segmented, Slider, Toggle, usePlot } from '../../../../../kit'
import { ArrowLabels, fmt, snap, clamp, type P } from './shared'
import s from './vectors.module.css'

type Op = 'add' | 'sub' | 'scale'

const U = 'var(--viz-1)'
const V = 'var(--viz-2)'
const SUM = 'var(--viz-3)'
const DIFF = 'var(--viz-4)'
const SCALED = 'var(--viz-5)'

const LIM = 3 // u and v stay inside [-3, 3] so every result fits on the grid
const AXES: [P, P][] = [
  [[-6, 0], [6, 0]],
  [[0, -6], [0, 6]],
]

interface ArrowSpec {
  from: P
  to: P
  color: string
  width: number
  dash?: string
  head?: number
  label?: string
  t?: number
  gap?: number
  /** fixed side for the label; when unset the label avoids the other arrows */
  side?: 1 | -1
  /** labels with a lower number are placed first and get the best spot */
  prio?: number
}

/** The whole line through the origin in the direction of u (every multiple c·u lies on it). */
function SpanLine({ u }: { u: P }) {
  const { xs, ys, clipId } = usePlot()
  const len = Math.hypot(u[0], u[1])
  if (len < 1e-9) return null
  const k = 20 / len
  return (
    <line
      clipPath={`url(#${clipId})`}
      x1={xs(-u[0] * k)}
      y1={ys(-u[1] * k)}
      x2={xs(u[0] * k)}
      y2={ys(u[1] * k)}
      style={{ stroke: SCALED, strokeWidth: 1.5, strokeDasharray: '2 6', opacity: 0.8 }}
      strokeLinecap="round"
    />
  )
}

/** A list like [2, 1] in one colour. */
const L = ({ v, c }: { v: P; c: string }) => (
  <span style={{ color: c }}>
    [{fmt(v[0])}, {fmt(v[1])}]
  </span>
)

/** Drag u and v to add or subtract them tip-to-tail; slide c to stretch, shrink, vanish or flip c·u. */
export default function VectorAddScale() {
  const [op, setOp] = useState<Op>('add')
  const [u, setU] = useState<P>([2, 1])
  const [v, setV] = useState<P>([1, 3])
  const [c, setC] = useState(2)
  const [otherRoute, setOtherRoute] = useState(false)

  const add: P = [u[0] + v[0], u[1] + v[1]]
  const sub: P = [u[0] - v[0], u[1] - v[1]]
  const cu: P = [c * u[0], c * u[1]]
  const drag = (set: (p: P) => void) => (x: number, y: number) => set([clamp(snap(x, 0.5), -LIM, LIM), clamp(snap(y, 0.5), -LIM, LIM)])

  const O: P = [0, 0]
  const arrows: ArrowSpec[] = []
  if (op === 'add') {
    if (otherRoute) arrows.push({ from: v, to: add, color: U, width: 2.5, dash: '6 5', label: 'u' })
    arrows.push({ from: u, to: add, color: V, width: 2.5, dash: '6 5', label: 'v' })
    arrows.push({ from: O, to: add, color: SUM, width: 4.5, label: 'u + v', t: 0.62, gap: 24, prio: 2 })
  } else if (op === 'sub') {
    arrows.push({ from: v, to: u, color: DIFF, width: 2, dash: '3 5' })
    arrows.push({ from: u, to: sub, color: V, width: 2.5, dash: '6 5', label: '−v' })
    arrows.push({ from: O, to: sub, color: DIFF, width: 4.5, label: 'u − v', t: 0.62, gap: 24, prio: 2 })
  } else if (c !== 0) {
    arrows.push({ from: O, to: cu, color: SCALED, width: 7, head: 14, label: `${fmt(c)}u`, t: c > 0 ? 0.85 : 0.6, gap: 20, side: -1, prio: 2 })
  }
  arrows.push({ from: O, to: u, color: U, width: 3.5, label: 'u', t: 0.72, side: op === 'scale' ? 1 : undefined, prio: 0 })
  if (op !== 'scale') arrows.push({ from: O, to: v, color: V, width: 3.5, label: 'v', t: 0.72, prio: 1 })

  let verdict: string
  if (c === 0) verdict = 'c = 0: the arrow shrinks to nothing, the zero vector [0, 0].'
  else if (c < 0) verdict = `c is negative: c·u points the opposite way${Math.abs(c) === 1 ? '' : Math.abs(c) > 1 ? ' and is longer' : ' and is shorter'}.`
  else if (c === 1) verdict = 'c = 1: c·u is just u.'
  else verdict = c > 1 ? 'c > 1: same direction, stretched.' : '0 < c < 1: same direction, shrunk.'

  return (
    <Figure
      title="Adding and scaling: tip to tail"
      caption={
        op === 'add' ? (
          <>
            To add, put the tail of <strong style={{ color: V }}>v</strong> on the tip of <strong style={{ color: U }}>u</strong>. Where you end up is{' '}
            <strong style={{ color: SUM }}>u + v</strong>, and its numbers are just the sums of matching numbers. Turn on the other route: going v first
            then u lands on the same spot, so u + v = v + u.
          </>
        ) : op === 'sub' ? (
          <>
            Subtracting v is adding its flipped copy <strong style={{ color: V }}>−v</strong>. Look at the faint copy of{' '}
            <strong style={{ color: DIFF }}>u − v</strong>: it runs from the tip of v to the tip of u. That is why u − v measures the gap between two points
            (you will use this for distances in the next lesson).
          </>
        ) : (
          <>
            Slide c through 1, 0 and negative values. Every <strong style={{ color: SCALED }}>c·u</strong> stays on the dotted line through u: scaling changes
            length and can flip the direction, but never turns the arrow sideways.
          </>
        )
      }
    >
      <Controls>
        <Segmented
          label="Operation"
          value={op}
          onChange={setOp}
          options={[
            { value: 'add', label: 'u + v' },
            { value: 'sub', label: 'u − v' },
            { value: 'scale', label: 'c × u' },
          ]}
        />
        {op === 'add' && <Toggle label="Show the other route (v first)" checked={otherRoute} onChange={setOtherRoute} />}
      </Controls>
      <div className={s.splitMain} style={{ width: '100%' }}>
        <Plot x={[-6, 6]} y={[-6, 6]} width={420} height={420} margin={{ left: 14, right: 14, top: 14, bottom: 14 }} ariaLabel="Two vectors u and v on a grid, with their sum, difference or a scaled copy">
          <Grid xTicks={12} yTicks={12} />
          <Axes origin xTicks={6} yTicks={6} />

          {op === 'scale' && <SpanLine u={u} />}
          {op === 'scale' && c === 0 && (
            <>
              <Dots points={[{ x: 0, y: 0, r: 6, color: SCALED }]} />
              <Label x={0} y={0} dx={-10} dy={u[0] * u[1] >= 0 ? -12 : 22} anchor="end" color={SCALED} size={14} weight={700}>
                0·u = [0, 0]
              </Label>
            </>
          )}
          {arrows.map((a, i) => (
            <Arrow key={`a${i}`} from={a.from} to={a.to} color={a.color} width={a.width} dash={a.dash} head={a.head} />
          ))}
          <ArrowLabels
            labels={[...arrows].sort((p, q) => (p.prio ?? 3) - (q.prio ?? 3)).filter((a) => a.label).map((a) => ({ from: a.from, to: a.to, text: a.label!, color: a.color, t: a.t ?? 0.55, gap: a.gap ?? 15, side: a.side }))}
            segments={[...AXES, ...arrows.map((b) => [b.from, b.to] as [P, P])]}
            points={op === 'scale' ? [u] : [u, v]}
          />
          {op !== 'scale' && <DraggablePoint x={v[0]} y={v[1]} color={V} onChange={drag(setV)} />}
          <DraggablePoint x={u[0]} y={u[1]} color={U} onChange={drag(setU)} />
        </Plot>
      </div>
      {op === 'scale' && (
        <Controls>
          <Slider label={<>scalar c</>} value={c} min={-2} max={2} step={0.25} onChange={setC} format={(x) => fmt(x)} />
        </Controls>
      )}
      <div className={s.eq} aria-live="polite">
        {op === 'add' && (
          <>
            <span>
              <span style={{ color: U }}>u</span> + <span style={{ color: V }}>v</span> =
            </span>
            <span>
              <L v={u} c={U} /> + <L v={v} c={V} />
            </span>
            <span className={s.eqOp}>=</span>
            <span>
              [{fmt(u[0])} + {fmt(v[0])}, {fmt(u[1])} + {fmt(v[1])}]
            </span>
            <span className={s.eqOp}>=</span>
            <span>
              <L v={add} c={SUM} />
            </span>
          </>
        )}
        {op === 'sub' && (
          <>
            <span>
              <span style={{ color: U }}>u</span> − <span style={{ color: V }}>v</span> =
            </span>
            <span>
              <L v={u} c={U} /> − <L v={v} c={V} />
            </span>
            <span className={s.eqOp}>=</span>
            <span>
              [{fmt(u[0])} − {v[0] < 0 ? `(${fmt(v[0])})` : fmt(v[0])}, {fmt(u[1])} − {v[1] < 0 ? `(${fmt(v[1])})` : fmt(v[1])}]
            </span>
            <span className={s.eqOp}>=</span>
            <span>
              <L v={sub} c={DIFF} />
            </span>
          </>
        )}
        {op === 'scale' && (
          <>
            <span>
              <span style={{ color: SCALED }}>{fmt(c)}</span> × <L v={u} c={U} />
            </span>
            <span className={s.eqOp}>=</span>
            <span>
              [{fmt(c)} × {fmt(u[0])}, {fmt(c)} × {fmt(u[1])}]
            </span>
            <span className={s.eqOp}>=</span>
            <span>
              <L v={cu} c={SCALED} />
            </span>
          </>
        )}
      </div>
      {op === 'scale' && <p className={s.reading} style={{ maxWidth: 'none' }}>{verdict}</p>}
    </Figure>
  )
}
