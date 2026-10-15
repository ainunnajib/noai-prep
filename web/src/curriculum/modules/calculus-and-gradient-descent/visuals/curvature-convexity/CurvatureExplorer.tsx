import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Grid, Axes, FnPath, Rect, Dots, Label, HLine, M, useAnimationFrame, useNarrow } from '../../../../../kit'

/*
  Where does a curve bend up, and where does it bend down?
    f(x) = x⁴/4 + a·x²/2 + b·x,   f'(x) = x³ + a·x + b,   f''(x) = 3x² + a.
  Green = f'' > 0 (bends up, like a bowl), red and dashed = f'' < 0 (bends down, like a cap); each
  stretch is also marked ∪ or ∩, so the colour is never the only cue.
  Critical points (f' = 0) are classified by the sign of f''. "Drop marbles" releases eight
  marbles that follow gradient descent: on a convex curve they all meet in one valley.
*/

const X0 = -2.4
const X1 = 2.4
const STARTS = [-2.1, -1.5, -0.9, -0.3, 0.3, 0.9, 1.5, 2.1]
const UP = 'var(--viz-pos)'
const DOWN = 'var(--viz-neg)'
const PRESETS = [
  { value: 'bowl', label: 'Bowl', a: 1, b: 0 },
  { value: 'flat', label: 'Flat-bottomed', a: 0, b: 0 },
  { value: 'two', label: 'Two valleys', a: -3, b: 0.5 },
] as const
type Preset = (typeof PRESETS)[number]['value'] | 'custom'

const fmt = (v: number) => {
  const r = Math.round(v * 100) / 100
  return String(Object.is(r, -0) ? 0 : r)
}
const signed = (v: number, term: string) => (v === 0 ? '' : `${v < 0 ? ' - ' : ' + '}${Math.abs(v) === 1 && term ? '' : fmt(Math.abs(v))}${term}`)
const smallTitle: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }

/** Roots of the cubic f'(x) = x³ + a x + b inside the window, by scanning and bisection. */
function criticalPoints(a: number, b: number) {
  const d1 = (x: number) => x * x * x + a * x + b
  const out: number[] = []
  const n = 600
  let prevX = X0 - 0.3
  let prev = d1(prevX)
  for (let i = 1; i <= n; i++) {
    const x = X0 - 0.3 + ((X1 - X0 + 0.6) * i) / n
    const v = d1(x)
    if (v === 0) out.push(x)
    else if (Math.sign(v) !== Math.sign(prev) && prev !== 0) {
      let lo = prevX
      let hi = x
      for (let k = 0; k < 50; k++) {
        const m = (lo + hi) / 2
        if (Math.sign(d1(m)) === Math.sign(d1(lo))) lo = m
        else hi = m
      }
      out.push((lo + hi) / 2)
    }
    prevX = x
    prev = v
  }
  return out.filter((x) => x >= X0 && x <= X1)
}

export default function CurvatureExplorer() {
  const [a, setA] = useState(-3)
  const [b, setB] = useState(0.5)
  const [preset, setPreset] = useState<Preset>('two')
  const [marbles, setMarbles] = useState<number[] | null>(null)
  const [t, setT] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const f = (x: number) => x ** 4 / 4 + (a * x * x) / 2 + b * x
  const d1 = (x: number) => x * x * x + a * x + b
  const d2 = (x: number) => 3 * x * x + a

  // where the curve bends down: |x| < sqrt(-a/3)
  const edge = a < 0 ? Math.sqrt(-a / 3) : 0
  const crit = useMemo(() => criticalPoints(a, b), [a, b])
  const kinds = crit.map((x) => {
    // classify by the sign change of f' (works even when f'' = 0)
    const l = d1(x - 1e-3)
    const r = d1(x + 1e-3)
    return l < 0 && r > 0 ? 'min' : l > 0 && r < 0 ? 'max' : 'flat'
  })
  const minima = crit.filter((_, i) => kinds[i] === 'min')
  const maxima = crit.filter((_, i) => kinds[i] === 'max')
  const globalMin = minima.reduce<number | null>((best, x) => (best == null || f(x) < f(best) ? x : best), null)

  const ys = STARTS.map(f).concat(crit.map(f))
  const lo = Math.min(...ys)
  const hi = Math.max(...ys)
  const pad = Math.max(0.4, (hi - lo) * 0.12)
  // extra room below the lowest point for the "min" labels
  const yr: [number, number] = [lo - pad * 2.4, hi + pad]
  const d2max = 3 * X1 * X1 + a
  const d2min = Math.min(a, 0)
  const y2: [number, number] = [Math.min(-1, d2min - 1), Math.max(2, d2max + 1)]

  // marbles roll by gradient descent; they stop when every marble is on flat ground (or after a while)
  const allFlat = marbles != null && marbles.every((x) => Math.abs(d1(x)) < 2e-3)
  const rolling = marbles != null && t < 6 && !allFlat
  useAnimationFrame((dt) => {
    // 12 small steps per 1/60 s, scaled by the real frame time so marbles roll at the same speed on any screen
    const n = Math.max(1, Math.round(12 * dt * 60))
    setMarbles((ms) => {
      if (!ms) return ms
      const out = ms.map((x) => {
        let v = x
        for (let k = 0; k < n; k++) v = Math.max(X0, Math.min(X1, v - 0.012 * d1(v)))
        return v
      })
      return out
    })
    setT((s) => s + dt)
  }, rolling)
  const valleyOf = (x: number) => maxima.filter((m) => x > m).length
  const settled = marbles != null && !rolling
  const valleysReached = marbles ? new Set(marbles.map(valleyOf)).size : 0
  const marbleColour = (x: number) => (!settled ? 'var(--viz-2)' : ['var(--viz-1)', 'var(--viz-4)', 'var(--viz-5)'][valleyOf(x) % 3])

  const choose = (p: Preset) => {
    setPreset(p)
    const P = PRESETS.find((q) => q.value === p)
    if (P) {
      setA(P.a)
      setB(P.b)
    }
    setMarbles(null)
  }
  const drop = () => {
    setT(0)
    setMarbles([...STARTS])
  }

  // segments of the curve by bending direction
  const segs: { from: number; to: number; up: boolean }[] =
    a >= 0
      ? [{ from: X0, to: X1, up: true }]
      : [
          { from: X0, to: -edge, up: true },
          { from: -edge, to: edge, up: false },
          { from: edge, to: X1, up: true },
        ]

  const tex = `f(x) = \\tfrac14 x^4${signed(a / 2, 'x^2')}${signed(b, 'x')}`
  const convex = a >= 0

  return (
    <Figure
      title="Green bends up (∪), red bends down (∩)"
      caption={
        <>
          The curve is green and solid where <M>{"f''(x) > 0"}</M> (it bends upwards, like a bowl ∪) and red and dashed where <M>{"f''(x) < 0"}</M> (it
          bends downwards, like a cap ∩). Flat points are marked: a valley bottom never sits on red, and a hilltop never sits on green. Press <b>Drop marbles</b> to release eight
          marbles that roll downhill. Then drag <b>a</b> above 0: the red part vanishes, the curve becomes convex, and every marble ends in the same
          valley.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.25rem' }}>
        <Plot
          x={[X0, X1]}
          y={yr}
          width={narrow ? 360 : 540}
          height={narrow ? 260 : 290}
          maxWidth={680}
          ariaLabel={`Graph of ${tex.replace(/\\tfrac14/, 'one quarter')}; ${convex ? 'convex everywhere' : `bends down between x = ${fmt(-edge)} and ${fmt(edge)}`}`}
        >
          {segs.map((s, i) => (
            <Rect key={i} x0={s.from} x1={s.to} y0={yr[0]} y1={yr[1]} fill={`color-mix(in srgb, ${s.up ? UP : DOWN} ${s.up ? 7 : 12}%, transparent)`} />
          ))}
          <Grid xTicks={8} yTicks={5} />
          <Axes xLabel="x" yLabel="f(x)" xTicks={narrow ? 6 : 8} yTicks={5} />
          {segs.map((s, i) => (
            <FnPath key={i} f={f} domain={[s.from, s.to]} color={s.up ? UP : DOWN} width={3.5} dash={s.up ? undefined : '9 5'} />
          ))}
          {crit.map((x, i) => {
            const k = kinds[i]
            const isGlobal = k === 'min' && globalMin != null && Math.abs(x - globalMin) < 1e-9 && minima.length > 1
            return (
              <g key={i}>
                <Dots points={[{ x, y: f(x), r: 6, color: k === 'max' ? DOWN : k === 'min' ? UP : 'var(--viz-muted)', hollow: true }]} />
                <Label x={x} y={f(x)} dy={k === 'max' ? -12 : 22} anchor="middle" color="var(--viz-ink)" weight={700} size={12}>
                  {k === 'max' ? 'max' : k === 'min' ? (isGlobal ? 'global min' : minima.length > 1 ? 'local min' : 'min') : 'flat'}
                </Label>
              </g>
            )
          })}
          {marbles && <Dots points={marbles.map((x) => ({ x, y: f(x) + (yr[1] - yr[0]) * 0.025, r: 6.5, color: marbleColour(x) }))} />}
        </Plot>
        <div style={smallTitle}>
          The second derivative <M>{`f''(x) = 3x^2${signed(a, '')}`}</M>
        </div>
        <Plot
          x={[X0, X1]}
          y={y2}
          width={narrow ? 360 : 540}
          height={narrow ? 130 : 120}
          maxWidth={680}
          margin={{ top: 8, bottom: 26 }}
          ariaLabel={`Second derivative 3x squared plus ${fmt(a)}: ${convex ? 'never negative' : 'negative in the middle'}`}
        >
          <Grid xTicks={8} yTicks={3} />
          <Axes xTicks={narrow ? 6 : 8} yTicks={3} />
          <HLine y={0} color="var(--viz-axis)" dash="" width={1.2} />
          {segs.map((s, i) => (
            <FnPath key={i} f={d2} domain={[s.from, s.to]} color={s.up ? UP : DOWN} width={2.5} dash={s.up ? undefined : '7 4'} />
          ))}
          {segs.map((s, i) =>
            s.to - s.from > 0.3 ? (
              <Label key={`g${i}`} x={(s.from + s.to) / 2} y={y2[1]} dy={17} anchor="middle" color="var(--ink-2)" size={14} weight={700}>
                {s.up ? '∪ up' : '∩ down'}
              </Label>
            ) : null,
          )}
        </Plot>
      </div>
      <Controls>
        <Segmented label="Start from" value={preset} onChange={choose} options={[...PRESETS.map((p) => ({ value: p.value as Preset, label: p.label }))]} />
      </Controls>
      <Controls>
        <Slider
          label="a (bend)"
          value={a}
          min={-3}
          max={2}
          step={0.25}
          onChange={(v) => {
            setA(v)
            setPreset('custom')
            setMarbles(null)
          }}
          format={fmt}
        />
        <Slider
          label="b (tilt)"
          value={b}
          min={-1.5}
          max={1.5}
          step={0.25}
          onChange={(v) => {
            setB(v)
            setPreset('custom')
            setMarbles(null)
          }}
          format={fmt}
        />
        <Button primary onClick={drop}>
          Drop marbles
        </Button>
      </Controls>
      <Readout
        items={[
          ['function', <M key="f">{tex}</M>],
          ['convex?', convex ? 'yes: f″ ≥ 0 everywhere' : `no: f″ < 0 for −${fmt(edge)} < x < ${fmt(edge)}`],
          ['marbles', marbles == null ? 'not dropped yet' : !settled ? 'rolling…' : `${valleysReached} valley${valleysReached === 1 ? '' : 's'} reached`],
        ]}
      />
    </Figure>
  )
}
