import { useState, type CSSProperties, type ReactElement } from 'react'
import { Figure, Controls, Slider, Toggle, Plot, usePlot, M, useNarrow } from '../../../../../kit'

/*
  Bayes by counting people. 1000 dots, one per person, in reading order:
  sick & test positive, sick & negative, healthy & positive, healthy & negative.
  Colour = true condition, solid dot with an outline = tests positive, faint dot = tests negative.
  On phones the grid has fewer columns and the positive dots are drawn larger, so they stand out.
  Sliders set prevalence, sensitivity and false-positive rate; "only positives" fades everyone who
  tested negative, so the posterior is literally (red ringed dots) / (all ringed dots).
*/

const N = 1000
const pct = (v: number, dp = 1) => `${(Math.round(v * 100 * 10 ** dp) / 10 ** dp).toString()}%`

interface Counts {
  sick: number
  tp: number
  fn: number
  fp: number
  tn: number
}

function counts(prev: number, sens: number, fpr: number): Counts {
  const sick = Math.round(N * prev)
  const tp = Math.round(sick * sens)
  const fp = Math.round((N - sick) * fpr)
  return { sick, tp, fn: sick - tp, fp, tn: N - sick - fp }
}

function Dots({ c, cols, onlyPos, narrow }: { c: Counts; cols: number; onlyPos: boolean; narrow: boolean }) {
  const { xs, ys } = usePlot()
  const pitch = xs(1) - xs(0)
  const r = pitch * 0.36
  const posR = r * (narrow ? 1.32 : 1.05)
  const kinds: { n: number; sick: boolean; pos: boolean }[] = [
    { n: c.tp, sick: true, pos: true },
    { n: c.fn, sick: true, pos: false },
    { n: c.fp, sick: false, pos: true },
    { n: c.tn, sick: false, pos: false },
  ]
  const out: ReactElement[] = []
  let i = 0
  for (const k of kinds) {
    for (let j = 0; j < k.n; j++, i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const style: CSSProperties = {
        fill: k.sick ? 'var(--viz-neg)' : 'var(--viz-1)',
        opacity: k.pos ? 1 : onlyPos ? 0.07 : 0.3,
        stroke: k.pos ? 'var(--viz-ink)' : 'none',
        strokeWidth: k.pos ? Math.max(narrow ? 1.5 : 1.2, r * 0.38) : 0,
        transition: 'opacity 0.3s',
      }
      out.push(<circle key={i} cx={xs(col + 0.5)} cy={ys(row + 0.5)} r={k.pos ? posR : r * 0.85} style={style} />)
    }
  }
  return <g>{out}</g>
}

export default function BayesGrid() {
  const [prev, setPrev] = useState(0.01)
  const [sens, setSens] = useState(0.9)
  const [fpr, setFpr] = useState(0.05)
  const [onlyPos, setOnlyPos] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>()
  const cols = narrow ? 40 : 50
  const rows = N / cols
  const c = counts(prev, sens, fpr)
  const pos = c.tp + c.fp
  const exact = (sens * prev) / (sens * prev + fpr * (1 - prev))

  return (
    <Figure
      title="1000 people take the test"
      caption={
        <>
          Each dot is a person. <b style={{ color: 'var(--viz-neg)' }}>Red</b> dots have the condition and <b style={{ color: 'var(--viz-1)' }}>blue</b> dots do not.
          A solid dot with an outline tested <b>positive</b>; a faint dot tested negative. Switch on <b>Only show positive tests</b> and ask: of all the outlined
          dots, what fraction are red? Then slide the prevalence up and watch the answer change, even though the test itself is just as accurate.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <Plot x={[0, cols]} y={[rows, 0]} width={600} height={(600 * rows) / cols} maxWidth={680} margin={{ left: 4, right: 4, top: 4, bottom: 4 }} ariaLabel={`1000 people: ${c.sick} have the condition, ${c.tp} true positives and ${c.fp} false positives`}>
          <Dots c={c} cols={cols} onlyPos={onlyPos} narrow={narrow} />
        </Plot>
      </div>
      <div style={{ width: '100%', display: 'grid', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--ink-2)', textAlign: 'center' }}>
          The {pos} people who test positive
        </div>
        <div role="img" aria-label={`${c.tp} true positives and ${c.fp} false positives`} style={{ display: 'flex', width: '100%', height: 26, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--rule)' }}>
          <div style={{ width: `${pos ? (100 * c.tp) / pos : 0}%`, background: 'var(--viz-neg)', transition: 'width 0.3s' }} />
          <div style={{ flex: 1, background: 'color-mix(in srgb, var(--viz-1) 75%, var(--surface))' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--viz-neg)', fontWeight: 650 }}>{c.tp} really have it (true positives)</span>
          <span style={{ color: 'var(--viz-1)', fontWeight: 650 }}>{c.fp} are healthy (false positives)</span>
        </div>
      </div>
      <div style={{ fontSize: '1.05rem', textAlign: 'center', width: '100%', overflowX: 'auto' }}>
        <M>{`P(\\text{condition} \\mid +) \\approx \\frac{${c.tp}}{${c.tp} + ${c.fp}} = \\frac{${c.tp}}{${pos}} \\approx ${pos ? pct(c.tp / pos).replace('%', '\\%') : '\\text{–}'}`}</M>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)', textAlign: 'center' }}>
        (Counts are rounded to whole people. Bayes' formula gives exactly {pct(exact, 2)}.)
      </div>
      <Controls>
        <Slider label="prevalence (how common the condition is)" value={prev} min={0.001} max={0.3} step={0.001} onChange={setPrev} format={(v) => pct(v)} />
        <Slider label="sensitivity: P(+ | condition)" value={sens} min={0.5} max={1} step={0.01} onChange={setSens} format={(v) => pct(v, 0)} />
        <Slider label="false-positive rate: P(+ | healthy)" value={fpr} min={0} max={0.3} step={0.01} onChange={setFpr} format={(v) => pct(v, 0)} />
      </Controls>
      <Controls>
        <Toggle label="Only show positive tests" checked={onlyPos} onChange={setOnlyPos} />
      </Controls>
    </Figure>
  )
}
