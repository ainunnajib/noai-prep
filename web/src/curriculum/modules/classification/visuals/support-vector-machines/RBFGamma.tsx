import { useMemo, useState, type ReactElement } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, usePlot } from '../../../../../kit'
import { smo, rbfK, decision, supportIdx, type P2, type SVMModel } from './svm'
import { MOONS, MOONS_TEST } from './svmData'
import { Mark, Ring, Legend, swatch, POS_C, NEG_C } from './parts'

/*
  An RBF-kernel SVM on two interleaved "moons", retrained (SMO) whenever γ or C changes.
  Background: the sign of f(x) (paler inside the street |f| < 1). Solid curve: f = 0; dashed: f = ±1.
  Train and test accuracy (400 fresh points) show under- and overfitting.
*/

const XR: [number, number] = [0, 10.5]
const YR: [number, number] = [0, 7.5]
const NX = 84
const NY = 60

interface FieldData {
  vals: Float64Array // (NX+1)·(NY+1) vertex values
}

function field(m: SVMModel): FieldData {
  const vals = new Float64Array((NX + 1) * (NY + 1))
  for (let j = 0; j <= NY; j++)
    for (let i = 0; i <= NX; i++) vals[j * (NX + 1) + i] = decision(m, [XR[0] + ((XR[1] - XR[0]) * i) / NX, YR[0] + ((YR[1] - YR[0]) * j) / NY])
  return { vals }
}

/** Background cells, merged into runs of equal (sign, inside-street) per row. */
function Regions({ f }: { f: FieldData }) {
  const { xs, ys, clipId } = usePlot()
  const dx = (XR[1] - XR[0]) / NX
  const dy = (YR[1] - YR[0]) / NY
  const rects: ReactElement[] = []
  const v = (i: number, j: number) => f.vals[j * (NX + 1) + i]
  for (let j = 0; j < NY; j++) {
    let start = 0
    let prev = ''
    for (let i = 0; i <= NX; i++) {
      let key = ''
      if (i < NX) {
        const c = (v(i, j) + v(i + 1, j) + v(i, j + 1) + v(i + 1, j + 1)) / 4
        key = `${c > 0 ? 'p' : 'n'}${Math.abs(c) < 1 ? 's' : 'o'}`
      }
      if (i === 0) prev = key
      if (key !== prev) {
        const x0 = XR[0] + start * dx
        const x1 = XR[0] + i * dx
        const y0 = YR[0] + j * dy
        const y1 = y0 + dy
        const col = prev[0] === 'p' ? POS_C : NEG_C
        rects.push(
          <rect
            key={`${j}-${start}`}
            x={xs(x0)}
            y={ys(y1)}
            width={xs(x1) - xs(x0) + 0.6}
            height={ys(y0) - ys(y1) + 0.6}
            shapeRendering="crispEdges"
            style={{ fill: `color-mix(in srgb, ${col} ${prev[1] === 's' ? 9 : 20}%, var(--surface))` }}
          />,
        )
        start = i
        prev = key
      }
    }
  }
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true">
      {rects}
    </g>
  )
}

/** Marching squares: the curve f = level. */
function Contour({ f, level, color, width, dash }: { f: FieldData; level: number; color: string; width: number; dash?: string }) {
  const { xs, ys, clipId } = usePlot()
  const dx = (XR[1] - XR[0]) / NX
  const dy = (YR[1] - YR[0]) / NY
  const v = (i: number, j: number) => f.vals[j * (NX + 1) + i] - level
  let d = ''
  const P = (x: number, y: number) => `${xs(x).toFixed(1)},${ys(y).toFixed(1)}`
  for (let j = 0; j < NY; j++)
    for (let i = 0; i < NX; i++) {
      const a = v(i, j) // bottom-left
      const b = v(i + 1, j) // bottom-right
      const c = v(i + 1, j + 1) // top-right
      const e = v(i, j + 1) // top-left
      const idx = (a > 0 ? 1 : 0) | (b > 0 ? 2 : 0) | (c > 0 ? 4 : 0) | (e > 0 ? 8 : 0)
      if (idx === 0 || idx === 15) continue
      const x0 = XR[0] + i * dx
      const y0 = YR[0] + j * dy
      const E = [
        () => P(x0 + (dx * a) / (a - b), y0), // bottom
        () => P(x0 + dx, y0 + (dy * b) / (b - c)), // right
        () => P(x0 + (dx * e) / (e - c), y0 + dy), // top
        () => P(x0, y0 + (dy * a) / (a - e)), // left
      ]
      const seg = (p: number, q: number) => (d += `M${E[p]()}L${E[q]()}`)
      switch (idx) {
        case 1:
        case 14:
          seg(3, 0)
          break
        case 2:
        case 13:
          seg(0, 1)
          break
        case 3:
        case 12:
          seg(3, 1)
          break
        case 4:
        case 11:
          seg(1, 2)
          break
        case 5:
          seg(3, 2)
          seg(0, 1)
          break
        case 10:
          seg(3, 0)
          seg(1, 2)
          break
        case 6:
        case 9:
          seg(0, 2)
          break
        case 7:
        case 8:
          seg(3, 2)
          break
      }
    }
  return <path d={d} clipPath={`url(#${clipId})`} aria-hidden="true" style={{ fill: 'none', stroke: color, strokeWidth: width, strokeDasharray: dash, strokeLinecap: 'round' }} />
}

const X: P2[] = MOONS.map((p) => [p[0], p[1]])
const Y: number[] = MOONS.map((p) => p[2])
const fmt = (v: number) => (v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toPrecision(2))

export default function RBFGamma() {
  const [logG, setLogG] = useState(-0.5)
  const [logC, setLogC] = useState(1)
  const [showSV, setShowSV] = useState(true)
  const gamma = 10 ** logG
  const C = 10 ** logC

  const model = useMemo(() => smo(X, Y, C, rbfK(gamma)), [gamma, C])
  const f = useMemo(() => field(model), [model])
  const sv = supportIdx(model)
  const [trainAcc, testAcc] = useMemo(() => {
    const acc = (data: readonly (readonly [number, number, number])[]) => data.filter((p) => (decision(model, [p[0], p[1]]) > 0 ? 1 : -1) === p[2]).length / data.length
    return [acc(MOONS), acc(MOONS_TEST)]
  }, [model])

  return (
    <Figure
      title="RBF kernel: γ sets how far each point's influence reaches"
      caption={
        <>
          Each training point spreads a bump of influence of width about 1/√γ. With a <b>small γ</b> the bumps are broad, so the boundary is smooth,
          almost straight, and misses the curve of the moons (underfitting). With a <b>large γ</b> each bump is tiny, so the boundary wraps little
          islands around single points: training accuracy reaches 100% while test accuracy on 400 new points falls (overfitting). <i>C</i> works as
          before: larger <i>C</i> fits the training points harder.
        </>
      }
    >
      <Legend
        items={[
          { swatch: swatch.neg, label: 'class −1' },
          { swatch: swatch.pos, label: 'class +1' },
          {
            swatch: (
              <svg width="22" height="14" aria-hidden="true">
                <path d="M0,7 L22,7" style={{ stroke: 'var(--viz-ink)', strokeWidth: 2.5 }} />
              </svg>
            ),
            label: 'boundary f = 0',
          },
          {
            swatch: (
              <svg width="22" height="14" aria-hidden="true">
                <path d="M0,7 L22,7" style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.6, strokeDasharray: '4 3' }} />
              </svg>
            ),
            label: 'street edges f = ±1',
          },
          { swatch: swatch.sv, label: 'support vector' },
        ]}
      />
      <Plot
        x={XR}
        y={YR}
        width={480}
        height={343}
        maxWidth={560}
        margin={{ left: 34, bottom: 34, right: 12, top: 12 }}
        ariaLabel={`RBF SVM with gamma ${fmt(gamma)} and C ${fmt(C)}: ${sv.length} support vectors, training accuracy ${(trainAcc * 100).toFixed(0)}%, test accuracy ${(testAcc * 100).toFixed(1)}%.`}
      >
        <Regions f={f} />
        <Grid xTicks={10} yTicks={7} />
        <Axes xLabel="x₁" yLabel="x₂" xTicks={5} yTicks={4} />
        <Contour f={f} level={1} color="var(--viz-muted)" width={1.6} dash="4 3" />
        <Contour f={f} level={-1} color="var(--viz-muted)" width={1.6} dash="4 3" />
        <Contour f={f} level={0} color="var(--viz-ink)" width={2.6} />
        {MOONS.map((p, i) => (
          <Mark key={i} x={p[0]} y={p[1]} label={p[2]} r={5} />
        ))}
        {showSV && sv.map((i) => <Ring key={i} x={X[i][0]} y={X[i][1]} r={9} width={1.6} />)}
      </Plot>
      <Controls>
        <Slider label={<>γ (gamma, log scale)</>} value={logG} min={-2} max={1.5} step={0.1} onChange={setLogG} format={(v) => fmt(10 ** v)} />
        <Slider label={<>C (log scale)</>} value={logC} min={-1} max={2} step={0.1} onChange={setLogC} format={(v) => fmt(10 ** v)} />
        <Toggle label="Ring the support vectors" checked={showSV} onChange={setShowSV} />
        <Readout
          items={[
            ['support vectors', `${sv.length} of ${X.length}`],
            ['training accuracy', `${(trainAcc * 100).toFixed(1)}%`],
            ['test accuracy (400 new)', `${(testAcc * 100).toFixed(1)}%`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
