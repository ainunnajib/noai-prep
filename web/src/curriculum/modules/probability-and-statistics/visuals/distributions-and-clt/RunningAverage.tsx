import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  Figure,
  Controls,
  Readout,
  Segmented,
  Button,
  Plot,
  Grid,
  Axes,
  Path,
  HLine,
  VLine,
  Rect,
  Label,
  Dots,
  usePlot,
  useNarrow,
  useAnimationFrame,
  mulberry32,
  M,
} from '../../../../../kit'
import { fmt } from './stats'

/*
  Law of large numbers. Die rolls appear one by one; grey dots are the single rolls and the
  blue line is the average of all rolls so far. It wobbles early on and settles on the expected
  value. Switching to a loaded die re-maps the same random numbers through the new probabilities,
  so the target line (and the average) jump to 4.5.
*/

type Die = 'fair' | 'loaded'
type Speed = 'slow' | 'fast' | 'turbo'

const MAX = 2000
const START = 24
const PROBS: Record<Die, number[]> = {
  fair: [1, 1, 1, 1, 1, 1].map((v) => v / 6),
  loaded: [0.1, 0.1, 0.1, 0.1, 0.1, 0.5],
}
const PROB_LABEL: Record<Die, string[]> = {
  fair: ['1/6', '1/6', '1/6', '1/6', '1/6', '1/6'],
  loaded: ['0.1', '0.1', '0.1', '0.1', '0.1', '0.5'],
}
const RATE: Record<Speed, number> = { slow: 4, fast: 40, turbo: 400 }
const X_STEPS = [25, 50, 100, 200, 500, 1000, 2000]

const expected = (p: number[]) => p.reduce((s, pi, i) => s + (i + 1) * pi, 0)

/** turn a uniform number in [0, 1) into a face 1..6 using the cumulative probabilities */
function face(u: number, p: number[]) {
  let c = 0
  for (let i = 0; i < 6; i++) {
    c += p[i]
    if (u < c) return i + 1
  }
  return 6
}

/** every single roll as a faint dot, drawn as ONE path of zero-length round-capped segments */
function RollDots({ rolls, count }: { rolls: number[]; count: number }) {
  const { xs, ys, clipId } = usePlot()
  let d = ''
  for (let i = 0; i < count; i++) d += `M${xs(i + 1).toFixed(1)},${ys(rolls[i]).toFixed(1)}h0`
  return (
    <path
      d={d}
      clipPath={`url(#${clipId})`}
      style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: count > 300 ? 3 : 5, strokeLinecap: 'round', opacity: 0.75 }}
    />
  )
}

const chip = (latest: boolean): CSSProperties => ({
  display: 'inline-grid',
  placeItems: 'center',
  width: '1.7rem',
  height: '1.7rem',
  borderRadius: '6px',
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
  fontSize: '0.9rem',
  border: `1.5px solid ${latest ? 'var(--viz-2)' : 'var(--viz-muted)'}`,
  background: latest ? 'color-mix(in srgb, var(--viz-2) 22%, var(--surface))' : 'var(--surface-2)',
  color: 'var(--ink)',
})

export default function RunningAverage() {
  const [die, setDie] = useState<Die>('fair')
  const [seed, setSeed] = useState(7)
  const [count, setCount] = useState(START)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>('fast')
  const acc = useRef(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const uniforms = useMemo(() => {
    const r = mulberry32(seed)
    return Array.from({ length: MAX }, () => r())
  }, [seed])
  const p = PROBS[die]
  const mu = expected(p)
  const rolls = useMemo(() => uniforms.map((u) => face(u, p)), [uniforms, p])
  const running = useMemo(() => {
    const out: number[] = []
    let s = 0
    rolls.forEach((r, i) => {
      s += r
      out.push(s / (i + 1))
    })
    return out
  }, [rolls])

  useAnimationFrame((dt) => {
    acc.current += dt * RATE[speed]
    const k = Math.floor(acc.current)
    if (k > 0) {
      acc.current -= k
      setCount((c) => Math.min(MAX, c + k))
    }
  }, playing)

  useEffect(() => {
    if (count >= MAX) setPlaying(false)
  }, [count])

  const xMax = X_STEPS.find((s) => s >= count) ?? MAX
  const avg = count > 0 ? running[count - 1] : NaN
  const pts: [number, number][] = running.slice(0, count).map((a, i) => [i + 1, a])
  const last = rolls.slice(Math.max(0, count - 10), count)

  const restart = () => {
    setPlaying(false)
    acc.current = 0
    setSeed((s) => s + 1)
    setCount(0)
  }

  return (
    <Figure
      title="Roll a die again and again"
      caption={
        <>
          Press <b>Play</b>. Each grey dot is one roll, and it jumps between 1 and 6 for ever. The blue line is the <b>average of all rolls so far</b>: it
          swings wildly at first, then settles onto the orange line, the expected value <M>{'E[X]'}</M>. Try <b>turbo</b>, then switch to the loaded die
          (a 6 comes up half the time) and watch the target move to 4.5. No single roll is ever 3.5 or 4.5: expectation describes the long run.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.75rem', alignItems: 'center' }}
      >
        <div style={{ display: 'grid', justifyItems: 'center', gap: '0.2rem', width: '100%' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>Probability of each face ({die} die)</div>
        <Plot x={[0.5, 6.5]} y={[0, 0.62]} width={300} height={160} maxWidth={340} margin={{ left: 34, bottom: 26, top: 18 }} ariaLabel={`Probabilities of each face of the ${die} die`}>
          <Axes xTicks={6} yTicks={3} />
          {p.map((pi, i) => (
            <Rect key={i} x0={i + 1 - 0.32} x1={i + 1 + 0.32} y0={0} y1={pi} fill="color-mix(in srgb, var(--viz-1) 55%, var(--surface))" stroke="var(--viz-1)" />
          ))}
          {p.map((pi, i) => (
            <Label key={i} x={i + 1} y={pi} dy={-5} anchor="middle" size={11}>
              {PROB_LABEL[die][i]}
            </Label>
          ))}
          <VLine x={mu} color="var(--viz-2)" dash="5 3" width={2} />
          <Label x={mu} y={0.62} dx={-5} dy={12} anchor="end" color="var(--viz-2)" weight={700}>
            {`E[X] = ${fmt(mu)}`}
          </Label>
        </Plot>
        </div>
        <div style={{ display: 'grid', gap: '0.4rem', justifyItems: narrow ? 'center' : 'start' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>Last {last.length || ''} rolls (newest on the right)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', minHeight: '1.7rem' }} aria-live="off">
            {last.length === 0 && <span style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>no rolls yet: press Play</span>}
            {last.map((r, i) => (
              <span key={count - last.length + i} style={chip(i === last.length - 1)}>
                {r}
              </span>
            ))}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}>
            {mu === 3.5 ? (
              <M>{'E[X] = \\tfrac{1+2+3+4+5+6}{6} = 3.5'}</M>
            ) : (
              <M>{'E[X] = 0.1(1+2+3+4+5) + 0.5(6) = 4.5'}</M>
            )}
          </div>
        </div>
      </div>

      <Plot
        x={[0, xMax]}
        y={[0.5, 6.5]}
        width={560}
        height={300}
        maxWidth={680}
        minHeight={240}
        margin={{ left: 40, bottom: 36 }}
        ariaLabel={`Running average after ${count} rolls is ${Number.isFinite(avg) ? avg.toFixed(2) : 'undefined'}; expected value ${mu}`}
      >
        <Grid xTicks={5} yTicks={6} />
        <Axes xLabel="number of rolls" yLabel="value" xTicks={5} yTicks={6} tickFormat={(v) => String(v)} />
        <RollDots rolls={rolls} count={count} />
        <HLine y={mu} color="var(--viz-2)" dash="7 4" width={2.5} />
        {pts.length > 1 && <Path points={pts} color="var(--viz-1)" width={2.5} />}
        {count > 0 && <Dots points={[{ x: count, y: avg, r: 5.5, color: 'var(--viz-1)' }]} />}
        <Label x={xMax} y={mu} dx={-6} dy={mu > 5.2 ? 18 : -8} anchor="end" color="var(--viz-2)" weight={700}>
          {`expected value ${fmt(mu)}`}
        </Label>
      </Plot>

      <Controls>
        <Button primary onClick={() => (playing ? setPlaying(false) : count >= MAX ? (setCount(0), setPlaying(true)) : setPlaying(true))}>
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={() => setCount((c) => Math.min(MAX, c + 1))} disabled={playing || count >= MAX}>
          Roll once
        </Button>
        <Button onClick={restart}>New rolls</Button>
        <Segmented
          label="speed"
          value={speed}
          onChange={setSpeed}
          options={[
            { value: 'slow', label: 'slow' },
            { value: 'fast', label: 'fast' },
            { value: 'turbo', label: 'turbo' },
          ]}
        />
        <Segmented
          label="die"
          value={die}
          onChange={setDie}
          options={[
            { value: 'fair', label: 'fair' },
            { value: 'loaded', label: 'loaded' },
          ]}
        />
      </Controls>
      <Readout
        items={[
          ['rolls', String(count)],
          ['last roll', count > 0 ? String(rolls[count - 1]) : '–'],
          ['average so far', Number.isFinite(avg) ? avg.toFixed(3) : '–'],
          ['E[X]', fmt(mu)],
          ['gap', Number.isFinite(avg) ? Math.abs(avg - mu).toFixed(3) : '–'],
        ]}
      />
    </Figure>
  )
}
