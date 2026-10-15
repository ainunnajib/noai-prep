import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Button, Plot, Grid, Axes, FnPath, Path, Rect, Label, useAnimationFrame, useNarrow } from '../../../../../kit'
import { Handle } from '../derivatives-as-slopes/plotHelpers'

/*
  A walker in thick haze (a ball) on a 1-D loss landscape. Drop or drag the ball, let go,
  and it slides downhill (it always moves against the slope) until the ground is flat.
  Valleys it finds are flagged as local or global minima. Optional layers: which valley
  each start point leads to, and "haze" that hides everything except the ground under the
  ball. The ball settles as soon as the slope changes sign (it has crossed a valley floor),
  so it stops at any frame rate instead of jittering across the minimum.
*/

type Land = 'bumpy' | 'bowl'
const X0 = -4
const X1 = 4
const Y_MAX = 4.6
const START = -3.4

const bump = (x: number, c: number, s: number) => Math.exp(-((x - c) ** 2) / (2 * s * s))
const LANDS: Record<Land, (x: number) => number> = {
  bumpy: (x) => 0.15 * x * x + 1.9 - 1.3 * bump(x, -2.5, 0.55) - 1.0 * bump(x, -0.1, 0.55) - 2.4 * bump(x, 2.3, 0.6),
  bowl: (x) => 0.2 * (x - 0.6) ** 2 + 0.35,
}
const slopeOf = (f: (x: number) => number, x: number) => (f(x + 1e-4) - f(x - 1e-4)) / 2e-4
const curvOf = (f: (x: number) => number, x: number) => (slopeOf(f, x + 1e-3) - slopeOf(f, x - 1e-3)) / 2e-3

/** Points where the slope changes sign, found numerically from the same formula that is drawn. */
function criticalPoints(f: (x: number) => number) {
  const out: { x: number; kind: 'min' | 'max' }[] = []
  const n = 800
  let prev = slopeOf(f, X0)
  for (let i = 1; i <= n; i++) {
    const px = X0 + ((X1 - X0) * i) / n
    const sl = slopeOf(f, px)
    if (sl === 0) continue
    if (Math.sign(sl) !== Math.sign(prev)) {
      let a = px - (X1 - X0) / n
      let b = px
      for (let k = 0; k < 40; k++) {
        const m = (a + b) / 2
        if (Math.sign(slopeOf(f, m)) === Math.sign(slopeOf(f, a))) a = m
        else b = m
      }
      out.push({ x: (a + b) / 2, kind: prev < 0 ? 'min' : 'max' })
    }
    prev = sl
  }
  return out
}

const VALLEY_COLOURS = ['var(--viz-4)', 'var(--viz-5)', 'var(--viz-3)']

export default function LandscapeHiker() {
  const [land, setLand] = useState<Land>('bumpy')
  const [x, setX] = useState(START)
  const [rolling, setRolling] = useState(false)
  const [dragged, setDragged] = useState(false)
  const [found, setFound] = useState<number[]>([])
  const [basins, setBasins] = useState(false)
  const [blind, setBlind] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const f = LANDS[land]
  const crit = useMemo(() => criticalPoints(f), [f])
  const minima = crit.filter((c) => c.kind === 'min')
  const maxima = crit.filter((c) => c.kind === 'max')
  const globalIdx = minima.reduce((best, m, i) => (f(m.x) < f(minima[best].x) ? i : best), 0)
  /** index of the valley a point belongs to: valleys are separated by the hilltops (maxima) */
  const valleyOf = (px: number) => maxima.filter((m) => px > m.x).length
  const colourOf = (i: number) => (minima.length === 1 ? 'var(--viz-3)' : VALLEY_COLOURS[i % VALLEY_COLOURS.length])
  const isGlobal = (i: number) => i === globalIdx

  useAnimationFrame((dt) => {
    // move against the slope (speed grows with steepness, with a small floor so shallow bowls don't take forever)
    let nx = x
    const sub = 6
    for (let k = 0; k < sub; k++) {
      const sl = slopeOf(f, nx)
      const speed = Math.max(0.8, Math.min(3.5, 2.2 * Math.abs(sl)))
      const before = nx
      nx = Math.max(X0, Math.min(X1, nx - (Math.sign(sl) * speed * dt) / sub))
      if (sl !== 0 && Math.sign(slopeOf(f, nx)) === -Math.sign(sl)) {
        // the slope flipped sign: moving downhill, the ball has just crossed a valley floor. Settle there.
        const i = valleyOf((before + nx) / 2)
        setRolling(false)
        setX(minima[i]?.x ?? nx)
        setFound((fs) => (fs.includes(i) ? fs : [...fs, i]))
        return
      }
    }
    if (Math.abs(slopeOf(f, nx)) < 0.03) {
      setRolling(false)
      if (curvOf(f, nx) > 0) {
        // flat ground at the bottom of a valley: settle exactly there and plant a flag
        const i = valleyOf(nx)
        setX(minima[i]?.x ?? nx)
        setFound((fs) => (fs.includes(i) ? fs : [...fs, i]))
      } else setX(nx)
      return
    }
    setX(nx)
  }, rolling)

  const drop = (px: number) => {
    setX(Math.max(X0, Math.min(X1, px)))
    setRolling(true)
  }
  const switchLand = (l: Land) => {
    setLand(l)
    setFound([])
    setRolling(false)
    setX(START)
  }

  const s = slopeOf(f, x)
  const flat = !rolling && Math.abs(s) < 0.03
  const settled = flat && curvOf(f, x) > 0
  const here = valleyOf(x)
  const status = rolling
    ? 'rolling downhill…'
    : settled
      ? `stopped on flat ground: ${isGlobal(here) ? 'global' : 'local'} minimum`
      : flat
        ? 'balanced on a hilltop: flat, but a maximum'
        : 'on a slope: let go to roll'

  // how much ground the walker in the haze can "feel" either side of the ball
  const feel = 0.35
  const basinBands = minima.map((_, i) => ({ i, left: i === 0 ? X0 : maxima[i - 1].x, right: i === minima.length - 1 ? X1 : maxima[i].x }))

  return (
    <Figure
      title="Roll the ball: which valley does it find?"
      caption={
        <>
          Drag the ball and let go, or tap anywhere on the picture to drop it there. It always moves against the slope and stops where the ground is
          flat. Start it in different places: there are three valleys, so three <b>local minima</b>, and the deepest one (near <i>w</i> = 2.2) is the{' '}
          <b>global minimum</b>. The start point alone decides which one the ball finds. Switch on the haze to see how little the walker (and a real
          training algorithm) can feel. Then try the single bowl.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', justifyItems: 'center' }}
        onPointerUp={() => {
          if (dragged) {
            setDragged(false)
            setRolling(true)
          }
        }}
      >
        <Plot
          x={[X0, X1]}
          y={[0, Y_MAX]}
          width={narrow ? 360 : 520}
          height={narrow ? 290 : 300}
          maxWidth={700}
          ariaLabel={`A ${land === 'bumpy' ? 'bumpy loss curve with three valleys' : 'single bowl-shaped loss curve'} with a ball at w = ${x.toFixed(2)}`}
          onPointerDown={(p) => drop(p[0])}
        >
          <Grid xTicks={8} yTicks={5} />
          {basins &&
            basinBands.map((b) => (
              <Rect key={b.i} x0={b.left} x1={b.right} y0={0} y1={Y_MAX} fill={`color-mix(in srgb, ${colourOf(b.i)} 14%, transparent)`} />
            ))}
          <Axes xLabel="parameter w" yLabel="loss" xTicks={8} yTicks={4} />
          {blind ? (
            <>
              <FnPath f={f} color="var(--viz-muted)" width={1.5} opacity={0.15} />
              <FnPath f={f} domain={[x - feel, x + feel]} color="var(--viz-1)" width={4} />
            </>
          ) : (
            <FnPath f={f} color="var(--viz-1)" width={3} />
          )}
          {basins && maxima.map((m, i) => <Path key={`m${i}`} points={[[m.x, 0], [m.x, f(m.x)]]} color="var(--viz-muted)" width={1.5} dash="4 4" />)}
          {found.map((i) => {
            const m = minima[i]
            if (!m) return null
            const y = f(m.x)
            const c = colourOf(i)
            return (
              <g key={`f${i}`}>
                <Path points={[[m.x, y], [m.x, y + 0.75]]} color={c} width={2} />
                <Path points={[[m.x, y + 0.75], [m.x + 0.32, y + 0.63], [m.x, y + 0.51]]} color={c} fill={c} closed width={1} />
                <Label x={m.x} y={y + 0.75} dy={-7} anchor="middle" color="var(--ink)" weight={700}>
                  {isGlobal(i) ? 'global min' : 'local min'}
                </Label>
              </g>
            )
          })}
          {/* the slope the hiker feels underfoot */}
          <Path points={[[x - 0.45, f(x) - 0.45 * s], [x + 0.45, f(x) + 0.45 * s]]} color="var(--viz-2)" width={2} dash="5 4" />
          <Handle
            x={x}
            y={f(x)}
            r={11}
            color="var(--viz-2)"
            ariaLabel="the ball: drag it, then let go"
            constrain={(nx) => [nx, f(nx)]}
            onChange={(nx) => {
              setRolling(false)
              setDragged(true)
              setX(nx)
            }}
            label="ball"
          />
        </Plot>
      </div>
      <Controls>
        <Segmented
          label="Landscape"
          value={land}
          onChange={switchLand}
          options={[
            { value: 'bumpy', label: 'Bumpy (like a neural net)' },
            { value: 'bowl', label: 'Single bowl' },
          ]}
        />
        <Button primary onClick={() => setRolling(true)} disabled={rolling || flat}>
          Let go
        </Button>
        <Button onClick={() => setFound([])}>Clear flags</Button>
      </Controls>
      <Controls>
        <Toggle label="Colour start points by the valley they lead to" checked={basins} onChange={setBasins} />
        <Toggle label="Thick haze" checked={blind} onChange={setBlind} />
      </Controls>
      <Readout
        items={[
          ['w', x.toFixed(2)],
          ['loss', f(x).toFixed(2)],
          ['slope', (Math.abs(s) < 0.005 ? 0 : s).toFixed(2)],
          ['valleys found', `${found.length} of ${minima.length}`],
          ['status', status],
        ]}
      />
    </Figure>
  )
}
