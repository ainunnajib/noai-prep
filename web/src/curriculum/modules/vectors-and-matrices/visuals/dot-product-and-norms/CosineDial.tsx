import { useState } from 'react'
import { Figure, Controls, Readout, Plot, Grid, Axes, Arrow, DraggablePoint, Segmented, Slider, usePlot } from '../../../../../kit'
import { ArrowLabel, fmt, type P } from '../vectors/shared'
import { AngleArc, cosOf, degOf, dot, len, signColour } from './geom'
import vs from '../vectors/vectors.module.css'
import s from './dot.module.css'

type Mode = 'arrows' | 'docs'
type Pair = 'sl' | 'sf' | 'lf'

const A = 'var(--viz-1)'
const B = 'var(--viz-2)'
const FIXED_A: P = [4, 1]
const B_MAX = 5

const DOCS: Record<'s' | 'l' | 'f', { name: string; v: P }> = {
  s: { name: 'Match report (short)', v: [3, 1] },
  l: { name: 'Match report (long)', v: [9, 3] },
  f: { name: 'Food blog', v: [1, 4] },
}
const PAIRS: Record<Pair, ['s' | 'l' | 'f', 's' | 'l' | 'f']> = { sl: ['s', 'l'], sf: ['s', 'f'], lf: ['l', 'f'] }

/** Two-decimal format with a true minus sign (cosines are easier to compare at fixed precision). */
const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : (v < 0 ? '\u2212' : '') + Math.abs(v).toFixed(2))

/** A gauge from -1 to 1 with a needle at the cosine similarity. */
function Dial({ value }: { value: number }) {
  const W = 300
  const cx = 150
  const cy = 142
  const R = 104
  const H = 196
  const at = (v: number, r: number): [number, number] => {
    const t = (Math.PI * (1 - v)) / 2
    return [cx + r * Math.cos(t), cy - r * Math.sin(t)]
  }
  const segs = 40
  const band = Array.from({ length: segs }, (_, i) => {
    const v0 = -1 + (2 * i) / segs
    const v1 = -1 + (2 * (i + 1)) / segs
    const [x0, y0] = at(v0, R)
    const [x1, y1] = at(v1, R)
    return <path key={i} d={`M${x0},${y0}A${R},${R} 0 0 1 ${x1},${y1}`} style={{ fill: 'none', stroke: signColour((v0 + v1) / 2), strokeWidth: 16 }} />
  })
  const [nx, ny] = at(value, R - 14)
  return (
    <svg className={s.dialSvg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Cosine similarity dial reading ${f2(value)}`}>
      {band}
      {[-1, -0.5, 0, 0.5, 1].map((t) => {
        const [x0, y0] = at(t, R + 9)
        const [x1, y1] = at(t, R + 15)
        const [lx, ly] = at(t, R + 26)
        return (
          <g key={t}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
            <text x={lx} y={ly} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 12, fontWeight: 700 }}>
              {fmt(t)}
            </text>
          </g>
        )
      })}
      <text x={cx - R} y={cy + 22} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12.5, fontWeight: 700 }}>
        opposite
      </text>
      <text x={cx + R} y={cy + 22} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12.5, fontWeight: 700 }}>
        same way
      </text>
      <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: 'var(--ink)', strokeWidth: 3.5 }} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={7} style={{ fill: 'var(--ink)' }} />
      <text x={cx} y={cy + 40} textAnchor="middle" style={{ fill: signColour(value), fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
        cos θ = {f2(value)}
      </text>
    </svg>
  )
}

/** Centred meter: bar grows right for positive values and left for negative ones. */
function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const f = Math.max(-1, Math.min(1, value / max))
  return (
    <div className={s.meter}>
      <div className={s.meterHead}>
        <span>{label}</span>
        <span className={s.mono}>{fmt(value)}</span>
      </div>
      <div className={s.meterTrack} aria-hidden="true">
        <div className={s.meterZero} />
        <div className={s.meterFill} style={{ left: f >= 0 ? '50%' : `${50 + f * 50}%`, width: `${Math.abs(f) * 50}%`, background: signColour(Math.sign(value)) }} />
      </div>
    </div>
  )
}

/**
 * The gap between two document tips, labelled with its length. When the two arrows lie on one line
 * (short vs long report) the gap would run along the arrows and vanish, so it is drawn as a bracket
 * set a few pixels to the side instead.
 */
function DistanceLine({ p, q, dist }: { p: P; q: P; dist: number }) {
  const { xs, ys } = usePlot()
  const [x1, y1] = [xs(p[0]), ys(p[1])]
  const [x2, y2] = [xs(q[0]), ys(q[1])]
  const l = Math.hypot(x2 - x1, y2 - y1)
  if (l < 2) return null
  let nx = -(y2 - y1) / l
  let ny = (x2 - x1) / l
  // point the offset away from the origin (or upwards when the gap runs through it)
  const mx = (x1 + x2) / 2 - xs(0)
  const my = (y1 + y2) / 2 - ys(0)
  if (nx * mx + ny * my < 0 || (Math.abs(nx * mx + ny * my) < 1e-6 && ny > 0)) {
    nx = -nx
    ny = -ny
  }
  const collinear = Math.abs(p[0] * q[1] - p[1] * q[0]) < 1e-9
  const off = collinear ? 12 : 0
  const [a1, b1, a2, b2] = [x1 + nx * off, y1 + ny * off, x2 + nx * off, y2 + ny * off]
  const lx = (a1 + a2) / 2 + nx * 16
  const ly = (b1 + b2) / 2 + ny * 16
  return (
    <g>
      {collinear ? (
        <>
          <line x1={x1 + nx * 4} y1={y1 + ny * 4} x2={a1 + nx * 4} y2={b1 + ny * 4} style={{ stroke: 'var(--ink-2)', strokeWidth: 1.5 }} />
          <line x1={x2 + nx * 4} y1={y2 + ny * 4} x2={a2 + nx * 4} y2={b2 + ny * 4} style={{ stroke: 'var(--ink-2)', strokeWidth: 1.5 }} />
          <line x1={a1} y1={b1} x2={a2} y2={b2} style={{ stroke: 'var(--ink-2)', strokeWidth: 2 }} />
        </>
      ) : (
        <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: 'var(--ink-2)', strokeWidth: 2, strokeDasharray: '4 4' }} />
      )}
      <text
        className="plot-label"
        x={lx}
        y={ly}
        dy="0.35em"
        textAnchor={Math.abs(nx) < 0.45 ? 'middle' : nx > 0 ? 'start' : 'end'}
        style={{ fill: 'var(--ink-2)', fontSize: 12.5, fontWeight: 700, paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 4, strokeLinejoin: 'round' }}
      >
        {`distance ${fmt(dist)}`}
      </text>
    </g>
  )
}

/** Dashed circle showing the track b's tip moves on while you rotate it. */
function Track({ r }: { r: number }) {
  const { xs, ys } = usePlot()
  return <ellipse cx={xs(0)} cy={ys(0)} rx={Math.abs(xs(r) - xs(0))} ry={Math.abs(ys(r) - ys(0))} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 1.2, strokeDasharray: '3 5' }} />
}

/** Rotate and stretch b: cosine similarity only cares about the angle. Then compare three tiny documents. */
export default function CosineDial() {
  const [mode, setMode] = useState<Mode>('arrows')
  const [ang, setAng] = useState(60)
  const [blen, setBlen] = useState(3)
  const [pair, setPair] = useState<Pair>('sl')

  const rad = (ang * Math.PI) / 180
  const b: P = [blen * Math.cos(rad), blen * Math.sin(rad)]
  const a = FIXED_A
  const [ka, kb] = PAIRS[pair]
  const da = DOCS[ka].v
  const db = DOCS[kb].v
  const cos = mode === 'arrows' ? cosOf(a, b) : cosOf(da, db)
  const dist = Math.hypot(da[0] - db[0], da[1] - db[1])

  let docNote: string
  if (pair === 'sl') docNote = `Same mix of words (3 : 1), so cosine is 1 even though the tips are ${fmt(dist)} apart. Distance is fooled by length; cosine is not.`
  else if (pair === 'sf') docNote = `Different topics: cosine is only ${f2(cos)}, even though these tips are closer together (${fmt(dist)}) than the two match reports.`
  else docNote = `Different topics again: cosine ${f2(cos)}, exactly the same as for the short report, because the long report points the same way.`

  return (
    <Figure
      title="Cosine similarity: direction only"
      caption={
        mode === 'arrows' ? (
          <>
            Drag the tip of <strong style={{ color: B }}>b</strong> round the dashed circle to change the angle, then use the slider to stretch it. The dot
            product (the bar) grows and shrinks with length, but the dial does not move: cosine similarity only sees the angle.
          </>
        ) : (
          <>
            Each document is a vector of word counts: [how many times "football" appears, how many times "food" appears]. Compare the pairs and watch
            the dial and the distance disagree.
          </>
        )
      }
    >
      <Controls>
        <Segmented
          label="Compare"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'arrows', label: 'Two arrows' },
            { value: 'docs', label: 'Three documents' },
          ]}
        />
        {mode === 'docs' && (
          <Segmented
            label="Pair"
            value={pair}
            onChange={setPair}
            options={[
              { value: 'sl', label: 'short vs long' },
              { value: 'sf', label: 'short vs blog' },
              { value: 'lf', label: 'long vs blog' },
            ]}
          />
        )}
      </Controls>

      <div className={vs.split}>
        <div className={vs.splitMain}>
          {mode === 'arrows' ? (
            <Plot x={[-5.5, 5.5]} y={[-5.5, 5.5]} width={400} height={400} margin={{ left: 12, right: 12, top: 12, bottom: 12 }} ariaLabel="A fixed vector a and a vector b you can rotate and stretch">
              <Grid xTicks={11} yTicks={11} />
              <Axes origin xTicks={5} yTicks={5} />
              <Track r={blen} />
              <AngleArc a={a} b={b} r={28} label={`${Math.round(degOf(a, b))}°`} />
              <Arrow from={[0, 0]} to={a} color={A} width={3.5} />
              <Arrow from={[0, 0]} to={b} color={B} width={3.5} />
              <ArrowLabel from={[0, 0]} to={a} text="a" color={A} t={0.85} side={1} />
              <ArrowLabel from={[0, 0]} to={b} text="b" color={B} t={0.85} avoid={[[[0, 0], a]]} />
              <DraggablePoint
                x={b[0]}
                y={b[1]}
                color={B}
                onChange={(x, y) => {
                  if (Math.hypot(x, y) < 0.2) return
                  let deg = Math.round((Math.atan2(y, x) * 180) / Math.PI)
                  if (deg < 0) deg += 360
                  setAng(deg)
                }}
              />
            </Plot>
          ) : (
            <Plot x={[0, 10]} y={[0, 10]} width={400} height={400} margin={{ left: 34, right: 14, top: 14, bottom: 34 }} ariaLabel="Three documents drawn as word-count vectors">
              <Grid xTicks={10} yTicks={10} />
              <Axes xLabel='"football" count' yLabel='"food" count' xTicks={5} yTicks={5} />
              {(['s', 'l', 'f'] as const)
                .filter((k) => k !== ka && k !== kb)
                .map((k) => (
                  <g key={k} style={{ opacity: 0.45 }}>
                    <Arrow from={[0, 0]} to={DOCS[k].v} color="var(--viz-muted)" width={2.5} />
                  </g>
                ))}
              <DistanceLine p={da} q={db} dist={dist} />
              {len(da) >= len(db) ? (
                <>
                  <Arrow from={[0, 0]} to={da} color={A} width={5} head={12} />
                  <Arrow from={[0, 0]} to={db} color={B} width={3} />
                </>
              ) : (
                <>
                  <Arrow from={[0, 0]} to={db} color={B} width={5} head={12} />
                  <Arrow from={[0, 0]} to={da} color={A} width={3} />
                </>
              )}
              <AngleArc a={da} b={db} r={40} label={degOf(da, db) > 1 ? `${Math.round(degOf(da, db))}°` : undefined} />
              <ArrowLabel from={[0, 0]} to={da} text={ka === 's' ? 'short' : ka === 'l' ? 'long' : 'blog'} color={A} t={1} gap={16} avoid={[[[0, 0], db]]} />
              <ArrowLabel from={[0, 0]} to={db} text={kb === 's' ? 'short' : kb === 'l' ? 'long' : 'blog'} color={B} t={1} gap={16} avoid={[[[0, 0], da]]} />
            </Plot>
          )}
        </div>

        <div className={vs.splitSide}>
          <Dial value={cos} />
          {mode === 'arrows' ? (
            <>
              <Meter label="dot product a·b" value={dot(a, b)} max={len(a) * B_MAX} />
              <Readout
                items={[
                  ['‖a‖', fmt(len(a))],
                  ['‖b‖', fmt(blen)],
                  ['θ', `${Math.round(degOf(a, b))}°`],
                ]}
              />
            </>
          ) : (
            <>
              <div className={s.docs}>
                {(['s', 'l', 'f'] as const).map((k) => {
                  const active = k === ka || k === kb
                  return (
                    <div key={k} className={`${s.doc}${active ? ' ' + s.docActive : ''}`} style={{ color: k === ka ? A : k === kb ? B : undefined }}>
                      <span>{DOCS[k].name}</span>
                      <span className={s.docCounts}>
                        [{DOCS[k].v[0]}, {DOCS[k].v[1]}]
                      </span>
                    </div>
                  )
                })}
              </div>
              <Readout
                items={[
                  ['cosine', f2(cos)],
                  ['distance', fmt(dist)],
                ]}
              />
            </>
          )}
        </div>
      </div>

      {mode === 'arrows' ? (
        <Controls>
          <Slider label="length of b" value={blen} min={1} max={B_MAX} step={0.25} onChange={setBlen} format={(x) => fmt(x)} />
        </Controls>
      ) : (
        <p className={s.note}>{docNote}</p>
      )}
    </Figure>
  )
}
