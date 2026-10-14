import { useState } from 'react'
import { Figure, Controls, Slider, Button, Plot, Grid, Axes, Arrow, Dots, Path, Rect, DraggablePoint, useNarrow } from '../../../../../kit'
import { type V2, fmt, Vec, Clip, KeyStep } from '../linear-transformations/la'
import s from './sri.module.css'

/*
  Span of two arrows u and v: every point a·u + b·v. The lattice of dots shows the combinations
  with whole and half amounts; the shading shows everything reachable with any amounts.
  Make u and v parallel and the whole span collapses onto one line.
*/

const snapHalf = (v: number) => Math.round(v * 2) / 2
const STAR: V2 = [0, 3]
const COEFFS = Array.from({ length: 17 }, (_, i) => -4 + i * 0.5)

function starPath(c: V2, r: number): V2[] {
  return Array.from({ length: 11 }, (_, i) => {
    const ang = Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 === 0 ? r : r * 0.45
    return [c[0] + rr * Math.cos(ang), c[1] + rr * Math.sin(ang)] as V2
  })
}

export default function SpanExplorer() {
  const [u, setU] = useState<V2>([2, 1])
  const [v, setV] = useState<V2>([-1, 1])
  const [a, setA] = useState(1.5)
  const [b, setB] = useState(1)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const LIM = narrow ? 3.8 : 4.5
  const reach = narrow ? 3 : 3.5
  const clampV = (x: number) => Math.max(-reach, Math.min(reach, x))

  const cross = u[0] * v[1] - u[1] * v[0]
  const uZero = Math.hypot(u[0], u[1]) < 1e-9
  const vZero = Math.hypot(v[0], v[1]) < 1e-9
  const independent = Math.abs(cross) > 1e-9
  const dim = independent ? 2 : uZero && vZero ? 0 : 1
  const dir: V2 = uZero ? v : u
  const au: V2 = [a * u[0], a * u[1]]
  const w: V2 = [au[0] + b * v[0], au[1] + b * v[1]]
  const reached = Math.hypot(w[0] - STAR[0], w[1] - STAR[1]) < 0.06
  // is the star on the spanned line (when dependent)?
  const starOnSpan = dim === 2 || (dim === 1 && Math.abs(dir[0] * STAR[1] - dir[1] * STAR[0]) < 1e-9)

  const dots = []
  for (const p of COEFFS)
    for (const q of COEFFS)
      dots.push({
        x: p * u[0] + q * v[0],
        y: p * u[1] + q * v[1],
        r: 2.4,
        color: 'var(--viz-3)',
      })

  const [msg, setMsg] = useState<string | null>(null)
  const solve = () => {
    if (independent) {
      // Cramer's rule for a·u + b·v = star
      const na = (STAR[0] * v[1] - STAR[1] * v[0]) / cross
      const nb = (u[0] * STAR[1] - u[1] * STAR[0]) / cross
      if (Math.abs(na) > 4 || Math.abs(nb) > 4) {
        setMsg(`It needs a = ${fmt(na)} and b = ${fmt(nb)}: possible, but beyond these sliders. Make the arrows longer.`)
      } else {
        setA(na)
        setB(nb)
        setMsg(`Solved: a = ${fmt(na)}, b = ${fmt(nb)}. With independent arrows there is always exactly one answer.`)
      }
    } else if (starOnSpan && dim === 1) {
      setMsg('The star is on the line, so it can be reached, and in infinitely many ways: the two arrows do the same job.')
    } else {
      setMsg('No amounts a and b can do it. Every combination of u and v stays on their line, and the star is off it.')
    }
  }
  const makeParallel = () => {
    setMsg(null)
    if (uZero) return setV([0, 0])
    // a multiple of u that stays on the half-grid and inside the plot
    for (const k of [-0.5, 1.5, 0.5, -1, 2, -2]) {
      const c: V2 = [k * u[0], k * u[1]]
      if (c.every((x) => Math.abs(x * 2 - Math.round(x * 2)) < 1e-9 && Math.abs(x) <= reach)) return setV(c)
    }
    setV([-u[0], -u[1]])
  }
  const dragU = (x: number, y: number) => (setU([clampV(snapHalf(x)), clampV(snapHalf(y))]), setMsg(null))
  const dragV = (x: number, y: number) => (setV([clampV(snapHalf(x)), clampV(snapHalf(y))]), setMsg(null))

  const L = 40
  const verdict =
    dim === 2
      ? 'independent: the span is the whole plane'
      : dim === 1
        ? `dependent${!uZero && !vZero ? ` (v = ${fmt(Math.abs(u[0]) > 1e-9 ? v[0] / u[0] : v[1] / u[1])}·u)` : ''}: the span is only a line`
        : 'both arrows are zero: the span is a single point'

  return (
    <Figure
      title="Span: everywhere a·u + b·v can reach"
      caption={
        <>
          Drag the tips of <span className={s.c1}>u</span> and <span className={s.c2}>v</span>. The green dots are the combinations a·u + b·v with a and b in
          steps of ½; the shading is everything reachable with any amounts. Use the sliders to steer the point onto the star (or press <b>Solve for a and b</b>
          ). Then press <b>Make v parallel to u</b>: every dot falls onto one line, and the star becomes unreachable. Parallel arrows waste a direction.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot
          x={[-LIM, LIM]}
          y={[-LIM, LIM]}
          width={440}
          height={440}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          ariaLabel={`Span of u = (${u.join(', ')}) and v = (${v.join(', ')}): ${verdict}`}
        >
          {dim === 2 && <Rect x0={-LIM} x1={LIM} y0={-LIM} y1={LIM} fill="color-mix(in srgb, var(--viz-3) 9%, transparent)" />}
          <Grid xTicks={2 * Math.round(LIM)} yTicks={2 * Math.round(LIM)} />
          <Axes origin xTicks={8} yTicks={8} />
          <Clip>
            {dim === 1 && (
              <Path
                points={[
                  [-L * dir[0], -L * dir[1]],
                  [L * dir[0], L * dir[1]],
                ]}
                color="color-mix(in srgb, var(--viz-3) 45%, transparent)"
                width={9}
              />
            )}
            <Dots points={dots} stroke="none" />
            <Path
              points={starPath(STAR, 0.32)}
              closed
              color="var(--viz-4)"
              width={2}
              fill={reached ? 'var(--viz-4)' : 'color-mix(in srgb, var(--viz-4) 25%, transparent)'}
            />
            <Arrow from={[0, 0]} to={au} color="var(--viz-1)" width={2.2} dash="5 4" head={7} />
            <Arrow from={au} to={w} color="var(--viz-2)" width={2.2} dash="5 4" head={7} />
            <Arrow from={[0, 0]} to={u} color="var(--viz-1)" width={4} head={11} />
            <Arrow from={[0, 0]} to={v} color="var(--viz-2)" width={4} head={11} />
            <Dots
              points={[
                {
                  x: w[0],
                  y: w[1],
                  r: 7,
                  color: 'var(--viz-3)',
                  label: 'a·u + b·v',
                },
              ]}
            />
          </Clip>
          <KeyStep x={u[0]} y={u[1]} onChange={dragU}>
            <DraggablePoint x={u[0]} y={u[1]} color="var(--viz-1)" label="u" onChange={dragU} />
          </KeyStep>
          <KeyStep x={v[0]} y={v[1]} onChange={dragV}>
            <DraggablePoint x={v[0]} y={v[1]} color="var(--viz-2)" label="v" onChange={dragV} />
          </KeyStep>
        </Plot>
      </div>

      <div className={s.info} aria-live="polite">
        <div className={s.eq}>
          <span>
            {fmt(a)}·<Vec p={u} tone="var(--viz-1)" />
          </span>
          <span>+</span>
          <span>
            {fmt(b)}·<Vec p={v} tone="var(--viz-2)" />
          </span>
          <span>
            = <Vec p={w} tone="var(--viz-3)" />
          </span>
          {reached && <span className={s.badge}>on the star!</span>}
        </div>
        <span className={`${s.badge} ${dim === 2 ? '' : s.badgeBad}`}>{verdict}</span>
        {msg && <div className={s.note}>{msg}</div>}
      </div>

      <Controls>
        <Slider
          label={
            <>
              amount of <span className={s.c1}>u</span>: a
            </>
          }
          value={a}
          min={-4}
          max={4}
          step={0.1}
          onChange={(x) => (setA(x), setMsg(null))}
          format={(x) => fmt(x)}
        />
        <Slider
          label={
            <>
              amount of <span className={s.c2}>v</span>: b
            </>
          }
          value={b}
          min={-4}
          max={4}
          step={0.1}
          onChange={(x) => (setB(x), setMsg(null))}
          format={(x) => fmt(x)}
        />
      </Controls>
      <Controls>
        <Button primary onClick={solve}>
          Solve for a and b
        </Button>
        <Button onClick={makeParallel}>Make v parallel to u</Button>
        <Button
          onClick={() => {
            setU([2, 1])
            setV([-1, 1])
            setA(1.5)
            setB(1)
            setMsg(null)
          }}
        >
          Reset
        </Button>
      </Controls>
    </Figure>
  )
}
