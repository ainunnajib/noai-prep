import { useEffect, useState } from 'react'
import { Controls, Readout, Button, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, Arrow, Label, DraggablePoint, MBlock, useNarrow } from '../../../../../kit'
import Figure from '../TouchFigure'
import { loss, slope, fixed, fmt, prefersReducedMotion } from './flats'

/*
  A ball on the loss valley L(w) of the 8-flat model. At each step the computer only measures the
  slope where the ball stands (the dashed tangent and its rise/run triangle), then steps the other way:
  new w = w − η × slope with η = 0.1. "Hide the valley" shows what the computer actually knows.
*/

const ETA = 0.1
const X: [number, number] = [0, 12]
const Y: [number, number] = [0, 40]
const MAX_STEPS = 60
const clampX = (v: number) => Math.max(X[0], Math.min(X[1], v))

export default function DownhillBallPreview() {
  const [path, setPath] = useState<number[]>([1])
  const [playing, setPlaying] = useState(false)
  const [fog, setFog] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const w = path[path.length - 1]
  const k = path.length - 1
  const s = slope(w)
  const step = -ETA * s
  const next = w + step
  const flat = Math.abs(s) < 0.05
  const done = flat || k >= MAX_STEPS

  const doStep = () => setPath((p) => (p.length > MAX_STEPS || Math.abs(slope(p[p.length - 1])) < 0.05 ? p : [...p, p[p.length - 1] - ETA * slope(p[p.length - 1])]))
  const reset = (start = path[0]) => {
    setPlaying(false)
    setPath([start])
  }

  useEffect(() => {
    if (!playing) return
    if (done) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(doStep, prefersReducedMotion() ? 900 : 550)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, path])

  // tangent line and rise/run triangle at the ball
  const L0 = loss(w)
  const half = 1.4
  const tangent: [number, number][] = [
    [w - half, L0 - half * s],
    [w + half, L0 + half * s],
  ]
  // rise/run triangle: run of 1 across, rise = slope. Drawn on the downhill side of the ball when it fits
  // above the axis, otherwise on the uphill side (from the tangent one unit uphill, across, then to the ball).
  const d = s < 0 ? 1 : -1 // downhill direction
  const downhillFits = L0 - Math.abs(s) >= 3 && w + d > 0.3 && w + d < 11.7
  const tri: [number, number][] = downhillFits
    ? [
        [w, L0],
        [w + d, L0],
        [w + d, L0 + d * s],
      ]
    : [
        [w - d, L0 - d * s],
        [w, L0 - d * s],
        [w, L0],
      ]
  const runY = downhillFits ? L0 : L0 - d * s
  const runX = downhillFits ? w + d / 2 : w - d / 2
  const riseX = downhillFits ? w + d : w
  const riseY = downhillFits ? L0 + (d * s) / 2 : L0 - (d * s) / 2
  const riseRight = d > 0
  const showTriangle = Math.abs(s) >= 1.5 && !done
  const sStr = fixed(s, 2)
  const direction = flat ? (
    <>Slope ≈ 0: the ground is flat, and on this single valley that means the bottom.</>
  ) : s < 0 ? (
    <>
      Slope is negative: the loss goes <em>down</em> as w goes up, so step right (make w bigger).
    </>
  ) : (
    <>
      Slope is positive: the loss goes <em>up</em> as w goes up, so step left (make w smaller).
    </>
  )
  // the rise/run text only fits beside the triangle while the triangle is reasonably big
  const showTriLabels = Math.abs(s) >= 3

  const sTex = s < 0 ? `(${sStr})` : sStr
  // "=" when the rounded numbers shown add up exactly, "≈" otherwise
  const eq = Math.abs(Number(fixed(w, 2)) - ETA * Number(sStr) - Number(fixed(next, 2))) < 1e-9 ? '=' : '\\approx'
  const tex = narrow
    ? `\\begin{gathered}
\\text{slope at } w = ${fixed(w, 2)} \\text{ is } {${sStr}} \\\\
w_{\\text{new}} = w - \\eta \\times \\text{slope} \\\\
= ${fixed(w, 2)} - 0.1 \\times ${sTex} ${eq} ${fixed(next, 2)}
\\end{gathered}`
    : `\\begin{gathered}
\\text{slope at } w = ${fixed(w, 2)} \\text{ is } {${sStr}} \\\\
w_{\\text{new}} = w - \\eta \\times \\text{slope} = ${fixed(w, 2)} - 0.1 \\times ${sTex} ${eq} ${fixed(next, 2)}
\\end{gathered}`

  return (
    <Figure
      title="Rolling downhill on the loss valley"
      caption={
        <>
          Press <b>Step</b> a few times, then <b>Play</b>. The dashed line is the slope the ball feels; the green arrow is the step it takes. Its size is set
          by η = 0.1, the <i>learning rate</i>, which the next section explains.
          Drag the ball to a new start on either side and run it again. Then switch on <b>Hide the valley</b>: the computer never sees the curve, only the
          slope where it has stood, and that is enough to reach the bottom at w = 6 ($6,000 per m²).
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot
          x={X}
          y={Y}
          width={narrow ? 360 : 560}
          height={narrow ? 300 : 320}
          maxWidth={700}
          ariaLabel={`Loss valley: loss against the knob w. The ball is at w = ${fmt(w)} with loss ${fmt(L0)} and slope ${fmt(s)} after ${k} steps.`}
        >
          <Grid xTicks={12} yTicks={8} />
          <Axes xLabel="knob w" yLabel="loss (MSE)" xTicks={narrow ? 6 : 12} yTicks={4} />
          {!fog && <FnPath f={loss} color="var(--viz-1)" width={3} />}
          {fog &&
            path.map((p, i) => {
              const sp = slope(p)
              const lp = loss(p)
              return <Path key={`f${i}`} points={[[p - 0.45, lp - 0.45 * sp], [p + 0.45, lp + 0.45 * sp]]} color="var(--viz-1)" width={3} />
            })}
          {fog && (
            <Label x={6} y={37} anchor="middle" color="var(--ink-3)">
              {narrow ? 'the valley is hidden' : 'the valley is hidden: only the slopes felt so far'}
            </Label>
          )}
          {/* trail of earlier positions */}
          <Dots points={path.slice(0, -1).map((p) => ({ x: p, y: loss(p), r: 4, color: 'color-mix(in srgb, var(--viz-2) 55%, var(--surface))' }))} stroke="none" />
          {!done && <Path points={tangent} color="var(--viz-ink)" width={1.8} dash="6 4" />}
          {showTriangle && (
            <>
              <Path points={tri} color="var(--viz-5)" width={2} />
              {!narrow && showTriLabels && (
                <Label x={runX} y={runY} dy={-7} anchor="middle" color="var(--viz-5)" size={12}>
                  run 1
                </Label>
              )}
              {showTriLabels && (
                <Label x={riseX} y={riseY} dx={riseRight ? 7 : -7} dy={4} anchor={riseRight ? 'start' : 'end'} color="var(--viz-5)" size={12}>
                  {`${narrow ? 'slope' : 'rise'} ${s < 0 ? '−' : '+'}${fmt(Math.abs(s), 1)}`}
                </Label>
              )}
            </>
          )}
          {!done && Math.abs(step) > 0.02 && (
            <>
              <Arrow from={[w, 2.2]} to={[clampX(next), 2.2]} color="var(--viz-3)" width={3} head={8} />
              {Math.abs(step) > 0.35 && (
                <Label x={(w + clampX(next)) / 2} y={2.2} dy={-9} anchor="middle" color="var(--viz-3)" weight={700} size={12}>
                  {`w ${step > 0 ? '+' : '−'}${fmt(Math.abs(step))}`}
                </Label>
              )}
            </>
          )}
          {k === 0 && (
            <Label x={w} y={L0} dx={0} dy={-17} anchor="middle" color="var(--viz-2)" size={12} weight={700}>
              drag me
            </Label>
          )}
          <DraggablePoint
            x={w}
            y={L0}
            r={10}
            color="var(--viz-2)"
            constrain={(x) => {
              const v = Math.max(0.2, Math.min(11.8, Math.round(x * 10) / 10))
              return [v, loss(v)]
            }}
            onChange={(x) => reset(x)}
          />
        </Plot>
      </div>
      <MBlock>{tex}</MBlock>
      <p style={{ margin: 0, fontSize: '0.9rem', color: flat ? 'var(--viz-pos)' : 'var(--ink-2)', fontWeight: 600, textAlign: 'center' }} aria-live="polite">
        {direction}
      </p>
      <Readout
        items={[
          ['step', String(k)],
          ['w', fixed(w, 2)],
          ['loss', fixed(L0, 2)],
          ['slope', fixed(s, 2)],
        ]}
      />
      <Controls>
        <Button primary onClick={doStep} disabled={done}>
          Step
        </Button>
        <Button onClick={() => setPlaying((p) => !p)} disabled={done && !playing}>
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={() => reset()}>Reset</Button>
        <Toggle label="Hide the valley (the computer's view)" checked={fog} onChange={setFog} />
      </Controls>
    </Figure>
  )
}
