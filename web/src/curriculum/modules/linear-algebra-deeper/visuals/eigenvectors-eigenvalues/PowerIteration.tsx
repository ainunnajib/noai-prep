import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, usePlayer, PlayerControls, Plot, Grid, Axes, Arrow, Path, Dots, Label, Rect, DraggablePoint, MatrixGrid, M, useNarrow } from '../../../../../kit'
import { type M2, type V2, apply, eig2, dirV, angleOf, lineGap, norm, unit, scale, dot, fmt, fix } from './eig2'
import s from './ev.module.css'

/*
  Power iteration: multiply the same vector by the same matrix again and again. The direction
  swings onto the eigen-line with the largest |λ|, and (without rescaling) the length grows or
  shrinks by about |λ₁| every step.
*/

type Key = 'grows' | 'shrinks' | 'flips' | 'turns'
const PRESETS: Record<Key, { m: M2; note: string }> = {
  grows: { m: [[1.1, 0.3], [0.2, 1.0]], note: 'λ₁ = 1.3, λ₂ = 0.8' },
  shrinks: { m: [[0.7, 0.2], [0.1, 0.8]], note: 'λ₁ = 0.9, λ₂ = 0.6' },
  flips: { m: [[-1.0, 0.4], [0.8, 0.4]], note: 'λ₁ = −1.2, λ₂ = 0.6' },
  turns: { m: [[0.9, -0.5], [0.5, 0.9]], note: 'complex: λ = 0.9 ± 0.5i' },
}
const N = 12

export default function PowerIteration() {
  const [key, setKey] = useState<Key>('grows')
  const [start, setStart] = useState(110)
  const [rescale, setRescale] = useState(true)
  const player = usePlayer({ steps: N + 1, interval: 850 })
  // complete at rest: open on the finished trail; Play replays it from the start
  useEffect(() => player.setStep(N), []) // eslint-disable-line react-hooks/exhaustive-deps
  const k = player.step
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const m = PRESETS[key].m
  const e = useMemo(() => eig2(m), [m])
  const raw = useMemo(() => {
    const out: V2[] = [dirV(start)]
    for (let i = 1; i <= N; i++) out.push(apply(m, out[i - 1]))
    return out
  }, [m, start])
  const lens = raw.map(norm)

  const shown = raw.slice(0, k + 1).map((p) => (rescale ? unit(p) : p))
  const maxShown = Math.max(...shown.map(norm))
  const R = rescale ? 1.6 : Math.max(1.6, Math.ceil(maxShown * 1.15 * 2) / 2)

  const dom = e.kind === 'two' ? { v: e.v1, l: e.l1 } : null
  const sub = e.kind === 'two' ? { v: e.v2, l: e.l2 } : null
  const gapDeg = dom ? lineGap(angleOf(raw[k]), angleOf(dom.v)) : null
  // a start exactly on the λ₂ line has no part along v₁, so it can never swing over
  const onSub = sub !== null && lineGap(start, angleOf(sub.v)) < 0.5
  const growth = k > 0 ? lens[k] / lens[k - 1] : null

  const showAll = () => {
    player.pause()
    player.setStep(N)
  }
  const choose = (kk: Key) => {
    setKey(kk)
    showAll()
  }
  const far = R * 3
  // put the λ₁ label at the end of its line away from where the trail finishes
  const domLab = lineLabel(dom ? dom.v : [1, 0], dom && dot(shown[k], dom.v) > 0 ? -1 : 1, R)
  const lenMax = Math.max(...lens) * 1.15

  let verdict: React.ReactNode
  if (k === 0) verdict = <>Press <b>Play</b> (or <b>Next</b>) to multiply by <i>A</i> again and again.</>
  else if (onSub)
    verdict = (
      <>
        v₀ lies exactly on the <b>λ₂ eigen-line</b>, so it has no part along v₁ and never swings over: every step just multiplies it by λ₂ ={' '}
        {fmt(sub!.l)}. Nudge v₀ off the line by a degree and watch the λ₁ direction take over.
      </>
    )
  else if (key === 'turns') verdict = <>No real eigen-line to settle on: each multiplication turns the arrow by about 29°, for ever.</>
  else if (gapDeg !== null && gapDeg < 1.5)
    verdict = (
      <>
        Settled on the <span className={s.c3}>λ₁ line</span>
        {key === 'flips' ? ', jumping to the opposite end each step because λ₁ is negative' : ''}. Each step now multiplies the length by about |λ₁| ={' '}
        {fmt(Math.abs(dom!.l))}, so without rescaling it {Math.abs(dom!.l) > 1 ? 'explodes' : 'fades towards 0'}.
      </>
    )
  else verdict = <>The arrow is {fix(gapDeg ?? 0, 1)}° away from the λ₁ line and closing in.</>

  return (
    <Figure
      title="Multiply again and again: the dominant direction wins"
      caption={
        <>
          <b>Try:</b>
          <ol className="try">
            <li>
              Press <b>Replay</b>, then drag <i>v₀</i> to start somewhere else.
            </li>
            <li>
              Turn off <b>Rescale</b>.
            </li>
          </ol>
          <b>Notice:</b> wherever it starts, the trail swings onto the <span className={s.c3}>green</span> line, the eigenvector with the biggest |λ₁|; without
          rescaling the vectors explode (|λ₁| &gt; 1) or fade away (|λ₁| &lt; 1), just like signals through many copies of one layer.
          <span className="fine">Each step replaces the arrow by A times itself. Starting exactly on the grey λ₂ line is the one exception.</span>
        </>
      }
    >
      <Segmented<Key>
        label="Matrix"
        value={key}
        onChange={choose}
        options={[
          { value: 'grows', label: 'Grows' },
          { value: 'shrinks', label: 'Shrinks' },
          { value: 'flips', label: 'Flips' },
          { value: 'turns', label: 'Turns' },
        ]}
      />
      <div ref={wrapRef} className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
        <div className={s.panel}>
          <div className={s.panelTitle}>{rescale ? 'Direction of Aᵏv₀ (rescaled to length 1)' : 'The real vectors Aᵏv₀'}</div>
          <Plot x={[-R, R]} y={[-R, R]} width={320} height={320} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} maxWidth={360} ariaLabel="The trail of repeatedly multiplied vectors and the eigen-lines">
            <Grid xTicks={R > 4 ? 6 : 2 * R} yTicks={R > 4 ? 6 : 2 * R} />
            <Axes origin xTicks={4} yTicks={4} />
            <Path points={Array.from({ length: 73 }, (_, i) => dirV(i * 5))} color="var(--viz-muted)" width={1.2} dash="4 5" />
            {sub && (
              <>
                <Path points={[scale(sub.v, -far), scale(sub.v, far)]} color="var(--viz-muted)" width={1.6} dash="7 6" />
                <Label x={lineLabel(sub.v, 1, R).x} y={lineLabel(sub.v, 1, R).y} dx={lineLabel(sub.v, 1, R).dx} dy={lineLabel(sub.v, 1, R).dy} anchor={lineLabel(sub.v, 1, R).anchor} color="var(--ink-3)" size={12}>
                  {`λ₂ = ${fmt(sub.l)}`}
                </Label>
              </>
            )}
            {dom && (
              <>
                <Path points={[scale(dom.v, -far), scale(dom.v, far)]} color="var(--viz-3)" width={2.4} dash="9 6" />
                <Label x={domLab.x} y={domLab.y} dx={domLab.dx} dy={domLab.dy} anchor={domLab.anchor} color="var(--viz-3)" size={12} weight={750}>
                  {`λ₁ = ${fmt(dom.l)}`}
                </Label>
              </>
            )}
            <Path points={shown} color="var(--viz-1)" width={1.2} dash="2 4" opacity={0.7} />
            {shown.map((p, i) =>
              i === k ? null : <Arrow key={i} from={[0, 0]} to={p} color="var(--viz-1)" width={1.6} head={7} dash={undefined} />,
            )}
            <Dots points={shown.map((p, i) => ({ x: p[0], y: p[1], r: i === k ? 0 : 3, color: 'var(--viz-1)' }))} />
            <Arrow from={[0, 0]} to={shown[k]} color="var(--viz-2)" width={3.5} head={11} />
            <Label x={shown[k][0]} y={shown[k][1]} dx={8} dy={16} color="var(--viz-2)" weight={750}>
              {k === 0 ? '' : rescale ? `v${k}` : `A${k === 1 ? '' : supNum(k)}v₀`}
            </Label>
            <DraggablePoint
              x={shown[0][0]}
              y={shown[0][1]}
              color="var(--viz-1)"
              r={7}
              label="v₀"
              onChange={(x, y) => {
                setStart(Math.round(angleOf([x, y])))
                showAll()
              }}
            />
          </Plot>
        </div>
        <div className={s.panel}>
          <div className={s.panelTitle}>Length ‖Aᵏv₀‖ without rescaling</div>
          <Plot x={[-0.7, N + 0.7]} y={[0, lenMax]} width={320} height={220} margin={{ top: 14, right: 8, bottom: 34, left: 40 }} maxWidth={360} ariaLabel="Bar chart of the length of the vector after each multiplication">
            <Grid xTicks={0} yTicks={4} />
            <Axes xTicks={6} yTicks={4} xLabel="step k" />
            {lens.map((len, i) => (
              <Rect key={i} x0={i - 0.34} x1={i + 0.34} y0={0} y1={len} fill={i <= k ? (i === k ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-2) 55%, transparent)') : 'color-mix(in srgb, var(--viz-muted) 22%, transparent)'} />
            ))}
            <Label x={k} y={lens[k]} dy={-6} anchor="middle" size={12} weight={750}>
              {fmt(lens[k], 2)}
            </Label>
          </Plot>
          <MatrixGrid data={m} format={(x) => fmt(x, 1)} label={<>A ({PRESETS[key].note})</>} cellSize={46} ariaLabel="the matrix A" />
        </div>
      </div>
      <div className={s.status} role="status">
        {verdict}
      </div>
      <PlayerControls player={player} label={(st) => `Step ${st} of ${N}`} />
      <Controls>
        <Toggle label="Rescale to length 1 after each step" checked={rescale} onChange={setRescale} />
        <Readout
          items={[
            ['angle to λ₁ line', gapDeg === null ? 'none' : `${fix(gapDeg, 1)}°`],
            ['growth this step', growth === null ? '–' : `× ${fix(growth, 3)}`],
            ['length', fix(lens[k], 3)],
          ]}
        />
      </Controls>
      <div className={s.formula}>
        <M>{'v_{k} = \\dfrac{A\\,v_{k-1}}{\\lVert A\\,v_{k-1} \\rVert}'}</M>
        <span className={s.muted}> (power iteration: multiply, then rescale)</span>
      </div>
    </Figure>
  )
}

/**
 * Label position on a line through the origin, 80% of the way to the edge, nudged off the line so
 * that the text (which runs towards the centre) never crosses the line. Offsets are in pixels.
 */
function lineLabel(v: V2, side: number, R: number) {
  const x = v[0] * R * 0.8 * side
  const y = v[1] * R * 0.8 * side
  if (Math.abs(v[0]) < 0.3) return { x, y, dx: 10, dy: 4, anchor: 'start' as const }
  const anchor: 'start' | 'end' = x > 0 ? 'end' : 'start'
  const rising = v[0] * v[1] > 0
  // text runs towards the centre; put it on the side the line moves away from
  const wantUp = Math.abs(v[1]) < 0.15 ? true : (x > 0) === rising
  // unit normal in screen pixels (screen y points down)
  let nx = -v[1]
  let ny = -v[0]
  if ((ny < 0) !== wantUp) {
    nx = -nx
    ny = -ny
  }
  return { x, y, dx: nx * 12, dy: ny * 12 + (wantUp ? 0 : 10), anchor }
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
function supNum(n: number) {
  return String(n)
    .split('')
    .map((c) => SUP[Number(c)])
    .join('')
}
