import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, Path } from '../../../../../kit'
import { smo, linearK, linearW, margin, fLine, type P2 } from './svm'
import { SOFT } from './svmData'
import { Street, Mark, Ring, DragMark, Legend, swatch } from './parts'

/*
  Soft-margin linear SVM on overlapping data, solved with SMO for the chosen C. Points with slack
  ξ = max(0, 1 − y·f(x)) > 0 are inside the street or on the wrong side; a red segment shows how far each
  one is from its own edge of the street (that distance is ξ / ‖w‖). Optional outlier: a blue point you
  can drag into orange territory.
*/

const fmtC = (c: number) => (c >= 10 ? c.toFixed(0) : c >= 1 ? c.toFixed(1) : c.toPrecision(2))

export default function SoftMarginC() {
  const [logC, setLogC] = useState(0)
  const [outlier, setOutlier] = useState(false)
  const [op, setOp] = useState<[number, number]>([3.5, 5.5])
  const C = 10 ** logC

  const X: P2[] = useMemo(() => [...SOFT.map((p) => [p[0], p[1]] as P2), ...(outlier ? [op as P2] : [])], [outlier, op])
  const y: number[] = useMemo(() => [...SOFT.map((p) => p[2]), ...(outlier ? [1] : [])], [outlier])
  const model = useMemo(() => smo(X, y, C, linearK), [X, y, C])
  const line = linearW(model)
  const n2 = line.w[0] ** 2 + line.w[1] ** 2

  const info = X.map((p, i) => {
    const f = fLine(line, p)
    const xi = Math.max(0, 1 - y[i] * f)
    return { p, label: y[i], f, xi, sv: model.alpha[i] > 1e-8 }
  })
  // tolerance: the solver stops within 1e-3 of the optimum, so ignore slacks smaller than that
  const viol = info.filter((d) => d.xi > 2e-3)
  const wrong = info.filter((d) => d.xi > 1)
  const sumXi = viol.reduce((s, d) => s + d.xi, 0)
  const width = margin(line)

  return (
    <Figure
      title="Soft margin: C sets the price of a violation"
      caption={
        <>
          Slide <i>C</i>. With a small <i>C</i>, violations are cheap: the street is wide and many points sit inside it (red segments show how far
          each is from its own edge). With a large <i>C</i>, violations are expensive: the street narrows until hardly anything is inside. Now switch on
          the outlier and drag it into the orange cloud: a large <i>C</i> twists the whole boundary to accommodate one odd point, while a small{' '}
          <i>C</i> barely notices it.
        </>
      }
    >
      <Legend
        items={[
          { swatch: swatch.neg, label: 'class −1' },
          { swatch: swatch.pos, label: 'class +1' },
          { swatch: swatch.sv, label: 'support vector on the edge' },
          { swatch: swatch.violator, label: 'violator (slack ξ > 0)' },
        ]}
      />
      <Plot
        x={[0, 10]}
        y={[0, 10]}
        width={440}
        height={440}
        maxWidth={480}
        margin={{ left: 34, bottom: 34, right: 12, top: 12 }}
        ariaLabel={`Soft-margin SVM with C = ${fmtC(C)}: street width ${width.toFixed(2)}, ${viol.length} points with slack, ${wrong.length} misclassified.`}
      >
        <Grid xTicks={10} yTicks={10} />
        <Axes xLabel="x₁" yLabel="x₂" xTicks={5} yTicks={5} />
        <Street line={line} />
        {viol.map((d, i) => {
          // the point's own edge of the street is w·x + b = y_i; walk along w until f reaches it
          const t = (d.label - d.f) / n2
          return <Path key={i} points={[[d.p[0], d.p[1]], [d.p[0] + t * line.w[0], d.p[1] + t * line.w[1]]]} color="var(--viz-neg)" width={2.2} />
        })}
        {SOFT.map((p, i) => (
          <Mark key={i} x={p[0]} y={p[1]} label={p[2]} />
        ))}
        {outlier && <DragMark x={op[0]} y={op[1]} label={1} name="outlier (blue)" onChange={(a, b) => setOp([a, b])} r={7.5} />}
        {info.map((d, i) =>
          d.xi > 2e-3 ? (
            <Ring key={i} x={d.p[0]} y={d.p[1]} r={11} color="var(--viz-neg)" dash="3 2" width={2} />
          ) : d.sv ? (
            <Ring key={i} x={d.p[0]} y={d.p[1]} r={11} />
          ) : null,
        )}
      </Plot>
      <Controls>
        <Slider label={<>penalty <i>C</i> (log scale)</>} value={logC} min={-2} max={2} step={0.1} onChange={setLogC} format={(v) => fmtC(10 ** v)} />
        <Toggle label="Add an outlier (drag it)" checked={outlier} onChange={setOutlier} />
        <Readout
          items={[
            ['street width 2/‖w‖', width.toFixed(2)],
            ['points with slack', String(viol.length)],
            ['misclassified', String(wrong.length)],
            ['support vectors', String(info.filter((d) => d.sv).length)],
            ['½‖w‖²', (n2 / 2).toFixed(2)],
            ['C·Σξ', (C * sumXi).toFixed(2)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
