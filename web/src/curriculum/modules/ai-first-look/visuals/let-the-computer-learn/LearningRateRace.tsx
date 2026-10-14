import { useEffect, useId, useState, type CSSProperties } from 'react'
import { Figure, Controls, Slider, Button, Plot, Grid, Axes, Path, Dots, HLine, Label, useContainerWidth } from '../../../../../kit'
import { loss, slope, fixed, prefersReducedMotion } from './flats'

/*
  Four balls race down the same loss valley with different learning rates:
  0.01 (crawls), 0.1 (converges), 1.1 (diverges) and one the learner sets.
  Every run starts at w = 1 and uses new w = w − η × slope. Each run is recomputed from scratch for the
  current step count, so moving the slider redraws the fourth run instantly.
*/

const START = 1
const MAX_STEPS = 40
const W_RANGE: [number, number] = [0, 12]
const L_TOP = 40
const CHART_TOP = 30

interface Run {
  eta: number
  name: string
  color: string
}

function simulate(eta: number, steps: number): number[] {
  const out = [START]
  for (let i = 0; i < steps; i++) {
    const w = out[out.length - 1]
    if (!Number.isFinite(w) || Math.abs(w) > 1e7) {
      out.push(w)
      continue
    }
    out.push(w - eta * slope(w))
  }
  return out
}

/**
 * What happens with this learning rate on this valley. For this data every step multiplies the distance
 * to the bottom by (1 − 2η), exactly, because the loss is (w − 6)² + 0.1. We check that numerically too.
 */
function verdict(eta: number): { text: string; color: string } {
  const r = 1 - 2 * eta
  if (Math.abs(r) > 1 + 1e-9) return { text: 'overshoots further every step: diverges', color: 'var(--viz-neg)' }
  if (Math.abs(Math.abs(r) - 1) < 1e-9) return { text: eta > 0.5 ? 'bounces between two spots forever' : 'does not move', color: 'var(--viz-neg)' }
  if (Math.abs(r) < 1e-9) return { text: 'lands on the bottom in one step', color: 'var(--viz-pos)' }
  const far = Math.abs(simulate(eta, MAX_STEPS)[MAX_STEPS] - 6) > 0.25
  if (far) return { text: `crawls: still far from the bottom after ${MAX_STEPS} steps`, color: 'var(--viz-6)' }
  if (r < 0) return { text: 'zig-zags across the valley, but settles', color: 'var(--viz-pos)' }
  return { text: 'slides smoothly to the bottom', color: 'var(--viz-pos)' }
}

/** Small loss-valley picture drawn in real pixels (no text inside, so it can shrink on phones). */
function MiniValley({ path, next, color, ariaLabel }: { path: number[]; next: number; color: string; ariaLabel: string }) {
  const uid = useId().replace(/:/g, '')
  const [ref, width] = useContainerWidth<HTMLDivElement>(320)
  const W = Math.max(120, width)
  const H = Math.round(W * 0.58)
  const pad = 6
  const sx = (w: number) => pad + ((w - W_RANGE[0]) / (W_RANGE[1] - W_RANGE[0])) * (W - 2 * pad)
  const sy = (l: number) => H - pad - (l / L_TOP) * (H - 2 * pad)
  let curve = ''
  for (let i = 0; i <= 120; i++) {
    const w = W_RANGE[0] + ((W_RANGE[1] - W_RANGE[0]) * i) / 120
    curve += `${i ? 'L' : 'M'}${sx(w).toFixed(1)},${sy(loss(w)).toFixed(1)}`
  }
  const pts = path.map((w): [number, number] => [sx(w), sy(loss(w))])
  const clip = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
  const trail = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${clip(x, -1e4, 1e4).toFixed(1)},${clip(y, -1e4, 1e4).toFixed(1)}`).join('')
  const w = path[path.length - 1]
  const onChart = w >= W_RANGE[0] && w <= W_RANGE[1] && loss(w) <= L_TOP
  const id = `mv-${uid}`
  // the jump the ball will make next (dashed), so even the first frame shows how big each step is
  const showNext = onChart && Math.abs(next - w) > 0.02
  const nx = clip(sx(next), -50, W + 50)
  const ny = clip(sy(loss(next)), -50, H + 50)
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={ariaLabel} style={{ display: 'block', overflow: 'hidden' }}>
        <defs>
          <clipPath id={id}>
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        <line x1={pad} x2={W - pad} y1={sy(0)} y2={sy(0)} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
        <line x1={sx(6)} x2={sx(6)} y1={sy(0)} y2={sy(0) - 5} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
        <path d={curve} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 2 }} />
        <g clipPath={`url(#${id})`}>
          <path d={trail} style={{ fill: 'none', stroke: color, strokeWidth: 1.6, opacity: 0.75 }} strokeLinejoin="round" />
          {pts.slice(0, -1).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.6} style={{ fill: color, opacity: 0.6 }} />
          ))}
          {showNext && (
            <line x1={pts[pts.length - 1][0]} y1={pts[pts.length - 1][1]} x2={nx} y2={ny} style={{ stroke: color, strokeWidth: 1.5, strokeDasharray: '4 3', opacity: 0.9 }} />
          )}
          {showNext && <circle cx={nx} cy={ny} r={3.5} style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />}
          {onChart && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={7} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2 }} />}
        </g>
      </svg>
    </div>
  )
}

const card: CSSProperties = {
  border: '1px solid var(--rule)',
  borderRadius: 'var(--radius-m)',
  padding: '0.5rem 0.6rem 0.45rem',
  background: 'var(--surface)',
  minWidth: 0,
  display: 'grid',
  gap: '0.3rem',
  alignContent: 'start',
}
const small: CSSProperties = { fontSize: '0.8rem', lineHeight: 1.35, color: 'var(--ink-2)' }

export default function LearningRateRace() {
  const [k, setK] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [custom, setCustom] = useState(0.8)

  const runs: Run[] = [
    { eta: 0.01, name: 'tiny steps', color: 'var(--viz-1)' },
    { eta: 0.1, name: 'medium steps', color: 'var(--viz-3)' },
    { eta: 1.1, name: 'huge steps', color: 'var(--viz-neg)' },
    { eta: custom, name: 'your choice', color: 'var(--viz-5)' },
  ]
  const paths = runs.map((r) => simulate(r.eta, k))
  const done = k >= MAX_STEPS

  useEffect(() => {
    if (!playing) return
    if (k >= MAX_STEPS) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(() => setK((v) => Math.min(MAX_STEPS, v + 1)), prefersReducedMotion() ? 700 : 260)
    return () => window.clearTimeout(t)
  }, [playing, k])

  const showVerdict = k >= 10

  return (
    <Figure
      title="Learning-rate race"
      caption={
        <>
          Press <b>Race</b>. All four balls start at w = 1 and follow the same rule, new w = w − η × slope; only the learning rate η differs.
          Watch the loss chart below as well. Then drag the slider for the fourth ball: find the biggest η that still settles at the bottom,
          and the η that lands on the bottom in a single step. (The small tick under each valley marks the bottom, w = 6.)
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.6rem' }}>
        {runs.map((r, i) => {
          const p = paths[i]
          const w = p[p.length - 1]
          const L = loss(w)
          const off = !(w >= W_RANGE[0] && w <= W_RANGE[1] && L <= L_TOP)
          const v = verdict(r.eta)
          return (
            <div key={i} style={card}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0 0.5rem', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 800, color: r.color, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>η = {r.eta.toFixed(2)}</span>
                <span style={{ ...small, fontWeight: 600 }}>{r.name}</span>
              </div>
              <MiniValley path={p} next={w - r.eta * slope(w)} color={r.color} ariaLabel={`Learning rate ${r.eta.toFixed(2)}: after ${k} steps w = ${fixed(w, 2)}, loss ${fixed(L, 2)}`} />
              <div style={{ ...small, fontFamily: 'var(--font-mono)' }} className="tabular">
                step {k} · loss {fixed(L, 2)}
                {off && <span style={{ color: 'var(--viz-neg)', fontWeight: 700 }}> · off the chart!</span>}
              </div>
              {showVerdict && <div style={{ ...small, color: v.color, fontWeight: 700 }}>{v.text}</div>}
            </div>
          )
        })}
      </div>
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }}>Loss after each step</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.2rem 0.9rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', margin: '0.2rem 0' }}>
          {runs.map((r, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--ink-2)' }}>
              <span aria-hidden="true" style={{ width: 14, height: 3, borderRadius: 2, background: r.color, display: 'inline-block' }} />
              η = {r.eta.toFixed(2)}
            </span>
          ))}
        </div>
        <Plot x={[0, MAX_STEPS]} y={[0, CHART_TOP]} width={560} height={190} maxWidth={700} minHeight={170} margin={{ top: 10, left: 36 }} ariaLabel={`Loss after each step for the four learning rates, up to step ${k}`}>
          <Grid xTicks={8} yTicks={3} />
          <Axes xLabel="step" xTicks={8} yTicks={3} />
          <HLine y={0.1} color="var(--viz-muted)" dash="3 4" width={1} />
          {k > 0 && paths.some((p) => loss(p[p.length - 1]) > CHART_TOP) && (
            <Label x={k} y={CHART_TOP} dx={k > MAX_STEPS - 8 ? -10 : 10} dy={14} anchor={k > MAX_STEPS - 8 ? 'end' : 'start'} color="var(--viz-neg)" size={12}>
              off the top: exploding
            </Label>
          )}
          {runs.map((r, i) => {
            const pts = paths[i].map((w, j): [number, number] => [j, Math.min(loss(w), CHART_TOP + 2)])
            return (
              <g key={i}>
                <Path points={pts} color={r.color} width={2.2} />
                <Dots
                  points={[{ x: pts[pts.length - 1][0], y: Math.min(pts[pts.length - 1][1], CHART_TOP), r: 4.5, color: r.color, shape: loss(paths[i][paths[i].length - 1]) > CHART_TOP ? 'triangle' : undefined }]}
                  stroke="var(--surface)"
                />
              </g>
            )
          })}
        </Plot>
      </div>
      <Controls>
        <Slider label="η for the fourth ball (your choice)" value={custom} min={0.01} max={1.2} step={0.01} onChange={setCustom} format={(v) => v.toFixed(2)} />
        <Button primary onClick={() => (done ? (setK(0), setPlaying(true)) : setPlaying((p) => !p))}>
          {playing ? 'Pause' : done ? 'Race again' : k === 0 ? 'Race' : 'Resume'}
        </Button>
        <Button onClick={() => setK((v) => Math.min(MAX_STEPS, v + 1))} disabled={done}>
          Step
        </Button>
        <Button
          onClick={() => {
            setPlaying(false)
            setK(0)
          }}
        >
          Reset
        </Button>
      </Controls>
    </Figure>
  )
}
