import { useState } from 'react'
import { Figure, Plot, Grid, Axes, Arrow, Path, DraggablePoint, Button, Toggle } from '../../../../../kit'
import { ArrowLabel, fmt, snap, clamp, type P } from '../vectors/shared'
import { AngleArc, LineThrough, RightAngle, cosOf, degOf, dot, len, signColour } from './geom'
import s from './dot.module.css'

const A = 'var(--viz-1)'
const B = 'var(--viz-2)'
const LIM = 4.5
/** a number for use inside a product: negatives get brackets, e.g. 1×(−0.5) */
const pf = (v: number, dp = 2) => (v < 0 ? `(${fmt(v, dp)})` : fmt(v, dp))

/** Drag a and b: watch b's shadow on a, the angle, and a·b computed two ways, all change together. */
export default function DotProductProjector() {
  const [a, setA] = useState<P>([4, 1])
  const [b, setB] = useState<P>([2, 3])
  const [showShadow, setShowShadow] = useState(true)

  const d = dot(a, b)
  const la = len(a)
  const lb = len(b)
  const c = cosOf(a, b)
  const theta = degOf(a, b)
  const zero = Math.abs(d) < 1e-9
  const col = signColour(zero ? 0 : c)
  const k = la < 1e-9 ? 0 : d / (la * la)
  const foot: P = [k * a[0], k * a[1]] // b's shadow (projection) on the line of a
  const shadowLen = la < 1e-9 ? 0 : d / la

  const drag = (set: (p: P) => void) => (x: number, y: number) => set([clamp(snap(x, 0.5), -LIM, LIM), clamp(snap(y, 0.5), -LIM, LIM)])
  const preset = (kind: 'same' | 'perp' | 'opp') => {
    // exact multiples of a, so "same" and "opposite" really are parallel
    const f = len(a) >= 2 ? 0.5 : 2
    if (kind === 'same') setB([f * a[0], f * a[1]])
    if (kind === 'perp') setB([-a[1], a[0]])
    if (kind === 'opp') setB([-f * a[0], -f * a[1]])
  }

  const verdict = zero
    ? 'a·b = 0: perpendicular (orthogonal). b has no shadow on a.'
    : d > 0
      ? 'a·b > 0: they point roughly the same way (angle under 90°).'
      : 'a·b < 0: they point roughly opposite ways (angle over 90°).'

  const footDist = Math.hypot(b[0] - foot[0], b[1] - foot[1])

  return (
    <Figure
      title="The dot product is length × shadow"
      caption={
        <>
          Shine a light straight down onto the line through <strong style={{ color: A }}>a</strong>: the shadow of <strong style={{ color: B }}>b</strong> is
          the thick segment. The dot product is the length of a times that shadow, which is why both rows below always give the same number. Swing b past
          90° and the shadow flips behind the origin, so a·b turns negative.
        </>
      }
    >
      <Plot x={[-5, 5]} y={[-5, 5]} width={420} height={420} margin={{ left: 14, right: 14, top: 14, bottom: 14 }} ariaLabel="Two draggable vectors a and b, the shadow of b on the line of a, and the angle between them">
        <Grid xTicks={10} yTicks={10} />
        <Axes origin xTicks={5} yTicks={5} />
        <LineThrough d={a} color="color-mix(in srgb, var(--viz-1) 45%, var(--surface))" />
        {showShadow && !zero && (
          <>
            <Path points={[b, foot]} color="var(--viz-muted)" width={1.6} dash="4 4" />
            <Path points={[[0, 0], foot]} color={col} width={9} opacity={0.85} />
          </>
        )}
        {showShadow && footDist > 0.35 && len(foot) > 0.35 && <RightAngle at={foot} d1={[-foot[0], -foot[1]]} d2={[b[0] - foot[0], b[1] - foot[1]]} />}
        {showShadow && zero && la > 1e-9 && lb > 1e-9 && <RightAngle at={[0, 0]} d1={a} d2={b} size={12} color={col} />}
        <AngleArc a={a} b={b} r={30} label={`${Math.round(theta)}°`} hideArc={zero && showShadow} />
        <Arrow from={[0, 0]} to={a} color={A} width={3.5} />
        <Arrow from={[0, 0]} to={b} color={B} width={3.5} />
        <ArrowLabel from={[0, 0]} to={a} text="a" color={A} t={0.8} avoid={[[[0, 0], b], [[0, 0], foot]]} />
        <ArrowLabel from={[0, 0]} to={b} text="b" color={B} t={0.8} avoid={[[[0, 0], a], [b, foot]]} />
        <DraggablePoint x={a[0]} y={a[1]} color={A} onChange={drag(setA)} />
        <DraggablePoint x={b[0]} y={b[1]} color={B} onChange={drag(setB)} />
      </Plot>

      <div className={s.presets}>
        <span className={s.presetsLabel}>Set b to:</span>
        <Button onClick={() => preset('same')}>same direction</Button>
        <Button onClick={() => preset('perp')}>perpendicular</Button>
        <Button onClick={() => preset('opp')}>opposite</Button>
        <Toggle label="Show shadow" checked={showShadow} onChange={setShowShadow} />
      </div>

      <div className={s.calc} aria-live="polite">
        <div className={s.calcRow}>
          <span className={s.calcLabel}>Multiply and add</span>
          <span className={s.calcMath}>
            <span>
              <span style={{ color: A }}>{pf(a[0])}</span>×<span style={{ color: B }}>{pf(b[0])}</span> +{' '}
              <span style={{ color: A }}>{pf(a[1])}</span>×<span style={{ color: B }}>{pf(b[1])}</span>
            </span>{' '}
            <span>
              = <strong style={{ color: col }}>{fmt(d)}</strong>
            </span>
          </span>
        </div>
        <div className={s.calcRow}>
          <span className={s.calcLabel}>|a| × |b| × cos θ</span>
          <span className={s.calcMath}>
            <span>
              {fmt(la)} × {fmt(lb)} × {pf(c, 3)}
            </span>{' '}
            <span>
              = <strong style={{ color: col }}>{fmt(la * lb * c)}</strong>
            </span>
          </span>
        </div>
        <div className={s.calcRow}>
          <span className={s.calcLabel}>|a| × shadow of b</span>
          <span className={s.calcMath}>
            <span>
              {fmt(la)} × {pf(shadowLen)}
            </span>{' '}
            <span>
              = <strong style={{ color: col }}>{fmt(la * shadowLen)}</strong>
            </span>
          </span>
        </div>
      </div>
      <span className={s.verdict} style={{ color: col }}>
        <span className={s.verdictDot} />
        {verdict}
      </span>
    </Figure>
  )
}
