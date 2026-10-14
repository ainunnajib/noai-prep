import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, DraggablePoint, MBlock, useNarrow } from '../../../../../kit'

/*
  One parameter, one loss number. The learner changes w (price per km) and sees
  (left) how wrong the line is on four Grab trips and (right) the loss L(w) as one dot
  on the loss landscape. Every position they try leaves a dot, so the landscape is
  literally built from loss values.
*/

const KM = [1, 2, 3, 4]
const FARE = [3, 4, 7, 7]
const W_MIN = 0
const W_MAX = 4
const HANDLE_X = 3.25

const loss = (w: number) => KM.reduce((s, x, i) => s + (FARE[i] - w * x) ** 2, 0) / KM.length
const snap = (w: number) => Math.max(W_MIN, Math.min(W_MAX, Math.round(w * 20) / 20))
const num = (v: number) => {
  const r = Math.round(v * 100) / 100
  return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0$/, '')
}

const twoUp: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(270px, 100%), 1fr))',
  gap: '0.75rem 1rem',
  width: '100%',
  alignItems: 'start',
}
const panelTitle: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: '0.15rem' }

export default function LossBuilder() {
  const [w, setW] = useState(1)
  const [trail, setTrail] = useState<number[]>([0, 1, 3, 4])
  const [showAll, setShowAll] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(480)

  const update = (v: number) => {
    const s = snap(v)
    setW(s)
    setTrail((t) => (t.includes(s) ? t : [...t, s]))
  }

  const errors = KM.map((x, i) => FARE[i] - w * x)
  const L = loss(w)
  const atBest = Math.abs(w - 2) < 1e-9
  const sqTerms = errors.map((e) => (e < 0 ? `(${num(e)})^2` : `${num(e)}^2`))
  const sq = sqTerms.join(' + ')
  // on phones the sum of squares is split over two lines
  const sqParts = [sqTerms.slice(0, 2).join(' + '), sqTerms.slice(2).join(' + ')]

  return (
    <Figure
      title="Build a loss landscape, one dot at a time"
      caption={
        <>
          Drag the orange handle on the line (or the orange dot on the loss landscape, or use the slider). Each value of the price per km <b>w</b> gives one loss
          number, and each value you try leaves a dot on the landscape. Can you find the <b>w</b> with the smallest loss? Then switch on the whole
          landscape: it is the graph of <i>every</i> possible loss, and training means finding its lowest point.
        </>
      }
    >
      <div ref={wrapRef} style={twoUp}>
        <div>
          <div style={panelTitle}>Model: fare = {w.toFixed(2)} × distance</div>
          <Plot x={[0, 4.5]} y={[0, 13]} width={340} height={270} ariaLabel={`Four trips with the line fare = ${w.toFixed(2)} times distance and the errors drawn as red bars`}>
            <Grid xTicks={5} yTicks={6} />
            <Axes xLabel="distance (km)" yLabel="fare ($)" xTicks={5} yTicks={6} />
            <FnPath f={(x) => w * x} color="var(--viz-1)" width={3} />
            {KM.map((x, i) => (
              <Path key={i} points={[[x, FARE[i]], [x, w * x]]} color="var(--viz-neg)" width={3} />
            ))}
            <Dots points={KM.map((x, i) => ({ x, y: FARE[i], color: 'var(--viz-ink)' }))} r={5.5} />
            <DraggablePoint x={HANDLE_X} y={w * HANDLE_X} lockX onChange={(_, y) => update(y / HANDLE_X)} label="drag" />
          </Plot>
        </div>
        <div>
          <div style={panelTitle}>The loss landscape L(w)</div>
          <Plot x={[W_MIN, W_MAX]} y={[0, 36]} width={340} height={270} ariaLabel={`Loss against w. Current w ${w.toFixed(2)}, loss ${L.toFixed(2)}`}>
            <Grid xTicks={8} yTicks={8} />
            <Axes xLabel="w ($ per km)" yLabel="loss L(w)" xTicks={8} yTicks={4} />
            {showAll && <FnPath f={loss} color="var(--viz-1)" width={2.5} />}
            {showAll && !atBest && <Dots points={[{ x: 2, y: loss(2), color: 'var(--viz-3)', r: 6, label: 'lowest point' }]} />}
            <Dots points={trail.map((t) => ({ x: t, y: loss(t), r: 4, color: 'color-mix(in srgb, var(--viz-1) 75%, var(--surface))' }))} stroke="none" />
            <Path points={[[w, 0], [w, L]]} color="var(--viz-2)" width={1.5} dash="4 4" />
            <DraggablePoint x={w} y={L} onChange={(x) => update(x)} constrain={(x) => [x, loss(snap(x))]} label={atBest ? 'lowest point!' : `L = ${L.toFixed(2)}`} />
          </Plot>
        </div>
      </div>
      <MBlock>
        {narrow
          ? `\\small\\begin{aligned}\\text{errors} &= [${errors.map(num).join(',\\ ')}] \\\\ L(${w.toFixed(2)}) &= \\tfrac14\\big(${sqParts[0]} \\\\ &\\qquad + ${sqParts[1]}\\big) \\\\ &= ${L.toFixed(2)}\\end{aligned}`
          : `\\begin{gathered}\\text{errors } (y - w x) = [${errors.map(num).join(',\\ ')}] \\\\ L(${w.toFixed(2)}) = \\tfrac14\\big(${sq}\\big) = ${L.toFixed(2)}\\end{gathered}`}
      </MBlock>
      <Controls>
        <Slider label="price per km, w" value={w} min={W_MIN} max={W_MAX} step={0.05} onChange={update} format={(v) => `$${v.toFixed(2)}`} />
        <Readout items={[['w', w.toFixed(2)], ['loss', L.toFixed(2)], ['dots tried', String(trail.length)]]} />
        <Toggle label="Show the whole landscape" checked={showAll} onChange={setShowAll} />
      </Controls>
    </Figure>
  )
}
