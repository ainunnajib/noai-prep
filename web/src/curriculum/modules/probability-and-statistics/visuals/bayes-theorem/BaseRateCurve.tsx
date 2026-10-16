import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, FnPath, VLine, DraggablePoint, Label, useNarrow } from '../../../../../kit'

/*
  How the posterior depends on the prior (the base rate). x = prevalence on a log scale
  (0.1% to 100%), y = P(condition | positive). One curve per number of positive results in a row
  (tests assumed independent given the true condition). The dashed line is "no test": posterior =
  prior. Drag the point along the prevalence axis.
*/

const post = (p: number, sens: number, fpr: number, k: number) => {
  const a = Math.pow(sens, k) * p
  const b = Math.pow(fpr, k) * (1 - p)
  return a / (a + b)
}
const pct = (v: number) => {
  const x = v * 100
  return `${x >= 10 ? x.toFixed(0) : x >= 1 ? x.toFixed(1) : x.toFixed(2)}%`
}
const COLORS = ['var(--viz-4)', 'var(--viz-5)', 'var(--viz-3)']
/** the same hues, darkened where needed for text on light surfaces */
const INK = ['var(--viz-4)', 'var(--viz-5)', 'var(--viz-3-ink)']
const CURVE_NAMES = ['1 positive test', '2 in a row', '3 in a row']

function Swatch({ color, dashed }: { color: string; dashed?: boolean }) {
  return <span aria-hidden="true" style={{ display: 'inline-block', width: 18, height: 0, borderTop: `3px ${dashed ? 'dashed' : 'solid'} ${color}`, marginRight: 6, verticalAlign: 'middle' }} />
}

export default function BaseRateCurve() {
  const [lp, setLp] = useState(-2) // log10 of prevalence
  const [sens, setSens] = useState(0.9)
  const [fpr, setFpr] = useState(0.05)
  const [k, setK] = useState<1 | 2 | 3>(1)
  const [ref, narrow] = useNarrow<HTMLDivElement>()
  const p = Math.pow(10, lp)
  const posts = [1, 2, 3].map((n) => post(p, sens, fpr, n))
  const py = posts[k - 1]
  // keep the point's label clear of the y-axis title (top left) and the right edge
  const labelBelow = py > 0.85
  const labelLeft = lp > -0.5

  return (
    <Figure
      title="The same test, different base rates"
      caption={
        <>
          The pink curve shows how likely you are to have the condition after one positive test, for every possible prevalence (the horizontal axis is
          stretched so that 0.1%, 1%, 10% and 100% are evenly spaced). Drag the point. For a rare condition the curve hugs the floor: a positive result is
          mostly a false alarm. Then choose <b>2</b> or <b>3</b> positive tests in a row: each test's posterior becomes the next test's prior, and the belief
          shoots up.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <Plot x={[-3, 0]} y={[0, 1]} width={540} height={320} minHeight={260} margin={{ left: 46, right: 20, top: 28, bottom: 38 }} ariaLabel={`Posterior after a positive test versus prevalence; at prevalence ${pct(p)} the posterior is ${pct(posts[0])}`}>
          <Grid xTicks={3} yTicks={4} />
          <Axes xLabel="prevalence (log scale)" xTicks={3} hideYTicks tickFormat={(v) => `${+(Math.pow(10, v) * 100).toPrecision(2)}%`} />
          <Axes yLabel="P(condition | +)" yTicks={4} hideXTicks tickFormat={(v) => `${Math.round(v * 100)}%`} />
          <FnPath f={(x) => Math.pow(10, x)} color="var(--viz-muted)" width={1.8} dash="6 5" />
          {[1, 2, 3]
            .filter((n) => n <= k)
            .map((n) => (
              <FnPath key={n} f={(x) => post(Math.pow(10, x), sens, fpr, n)} color={COLORS[n - 1]} width={n === k ? 3.2 : 2} opacity={n === k ? 1 : 0.55} />
            ))}
          <VLine x={lp} color="var(--viz-axis)" dash="3 4" width={1.2} />
          <DraggablePoint x={lp} y={py} color={COLORS[k - 1]} constrain={(x) => [Math.round(x * 20) / 20, post(Math.pow(10, Math.round(x * 20) / 20), sens, fpr, k)]} onChange={(x) => setLp(x)} />
          <Label x={lp} y={py} dx={labelLeft ? -14 : 14} dy={labelBelow ? 22 : -10} anchor={labelLeft ? 'end' : 'start'} color={INK[k - 1]} weight={700}>
            {pct(py)}
          </Label>
        </Plot>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1rem', justifyContent: 'center', fontSize: '0.82rem', color: 'var(--ink-2)' }}>
        {CURVE_NAMES.slice(0, k).map((name, i) => (
          <span key={name} style={{ fontWeight: i === k - 1 ? 700 : 500 }}>
            <Swatch color={COLORS[i]} />
            {name}
          </span>
        ))}
        <span>
          <Swatch color="var(--viz-muted)" dashed />
          {narrow ? 'no test' : 'no test: posterior = prior'}
        </span>
      </div>
      <Controls>
        <Segmented
          label="Positive tests in a row"
          value={k}
          onChange={setK}
          options={[
            { value: 1, label: '1' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
          ]}
        />
        <Slider label="prevalence" value={lp} min={-3} max={0} step={0.05} onChange={setLp} format={() => pct(p)} />
      </Controls>
      <Controls>
        <Slider label="sensitivity" value={sens} min={0.5} max={0.99} step={0.01} onChange={setSens} format={(v) => pct(v)} />
        <Slider label="false-positive rate" value={fpr} min={0.01} max={0.3} step={0.01} onChange={setFpr} format={(v) => pct(v)} />
      </Controls>
      <Readout
        items={[
          ['prior', pct(p)],
          ['after 1 positive', pct(posts[0])],
          ['after 2', pct(posts[1])],
          ['after 3', pct(posts[2])],
        ]}
      />
    </Figure>
  )
}
