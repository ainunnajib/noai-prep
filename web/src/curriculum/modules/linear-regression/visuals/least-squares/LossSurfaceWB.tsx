import { useMemo, useState } from 'react'
import { Figure, Readout, Button, Plot, Grid, Axes, Path, Dots, Label, FnPath, useNarrow } from '../../../../../kit'
import { DragDot } from './DragDot'
import { RIDES, fitLS, mse, ellipse, mseForm, fmt, fix, lineText, type Pt } from './shared'

/*
  Two linked views of the same thing. Left: the data and a line ŷ = wx + b.
  Right: the (w, b) plane, coloured by MSE like a map seen from above (exact elliptical
  contours, because MSE is quadratic in w and b). One marker on the map = one line on the data.
*/

const W: [number, number] = [-0.5, 3.5]
const B: [number, number] = [-2.5, 5.5]
const YD: [number, number] = [0, 12]
const XL = 0.4
const XR = 5.6
const LEVELS = [0.38, 0.55, 0.9, 1.5, 2.6, 4.5, 8, 14, 25, 45, 80]
const LABELLED = [1.5, 8, 25]

const best = fitLS(RIDES)
const bestMse = mse(RIDES, best.w, best.b)
const form = mseForm(RIDES)

export default function LossSurfaceWB() {
  const [wb, setWb] = useState<Pt>([0.5, 4.5])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const [w, b] = wb
  const loss = mse(RIDES, w, b)
  const clampW = (v: number) => Math.max(W[0], Math.min(W[1], v))
  const clampB = (v: number) => Math.max(B[0], Math.min(B[1], v))
  const set = (nw: number, nb: number) => setWb([Math.round(clampW(nw) * 20) / 20, Math.round(clampB(nb) * 20) / 20])

  const rings = useMemo(() => LEVELS.map((L) => ({ L, pts: ellipse(form.a, form.h, form.d, [best.w, best.b], L - bestMse) })), [])
  // label position: where each labelled contour crosses the steep axis (well separated there)
  const tag = (L: number): Pt => ellipse(form.a, form.h, form.d, [best.w, best.b], L - bestMse, 4)[0]

  const yL = w * XL + b
  const yR = w * XR + b
  const setEnds = (nl: number, nr: number) => {
    const nw = (nr - nl) / (XR - XL)
    set(nw, nl - nw * XL)
  }
  const inY = (v: number) => v >= YD[0] && v <= YD[1]
  const pick = (p: Pt) => set(p[0], p[1])

  return (
    <Figure
      title="One line = one point on the loss map"
      caption={
        <>
          Left: the rides and a line. Right: every possible line, as a point <i>(w, b)</i>, coloured by its MSE, like a contour map of a valley seen
          from above (darker means lower loss; the small numbers are MSE values on three of the contours). Drag the marker or tap anywhere on the map and watch the line jump; drag the line's green handles and
          watch the marker move. Can you get the MSE below 0.35 using only the line? The bottom of the bowl, marked ×, is the least-squares line.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <Plot x={[0, 6]} y={YD} width={340} height={300} minHeight={250} maxWidth={520} ariaLabel={`Data with the line ${lineText(w, b)}`}>
          <Grid xTicks={6} yTicks={6} />
          <Axes xLabel="km" yLabel="fare ($)" xTicks={6} yTicks={6} />
          {RIDES.map(([x, y], i) => (
            <Path key={i} points={[[x, y], [x, w * x + b]]} color="var(--viz-2)" width={2} />
          ))}
          <FnPath f={(x) => w * x + b} color="var(--viz-3)" width={3} />
          <Dots points={RIDES.map(([x, y]) => ({ x, y, r: 6, color: 'var(--viz-1)' }))} />
          {inY(yL) && <DragDot x={XL} y={yL} lockX square color="var(--viz-3)" ariaLabel="Left end of the line" onChange={(_, ny) => setEnds(ny, yR)} />}
          {inY(yR) && <DragDot x={XR} y={yR} lockX square color="var(--viz-3)" ariaLabel="Right end of the line" onChange={(_, ny) => setEnds(yL, ny)} />}
        </Plot>
        <Plot
          x={W}
          y={B}
          width={340}
          height={300}
          minHeight={260}
          maxWidth={520}
          ariaLabel={`Contour map of the MSE over slope w and intercept b; current point w = ${fmt(w)}, b = ${fmt(b)}, MSE ${fmt(loss)}`}
          onPointerDown={(p) => pick(p)}
          onPointerMove={(p, e) => {
            if (e.buttons & 1) pick(p)
          }}
        >
          {rings
            .slice()
            .reverse()
            .map(({ L, pts }) => (
              <Path key={L} points={pts} closed fill="color-mix(in srgb, var(--viz-1) 8%, transparent)" color="color-mix(in srgb, var(--viz-1) 45%, var(--surface))" width={1.1} />
            ))}
          <Grid xTicks={4} yTicks={4} />
          <Axes xLabel="slope w" yLabel="intercept b" xTicks={4} yTicks={4} />
          {LABELLED.map((L) => {
            const [lx, ly] = tag(L)
            return (
              <Label key={L} x={lx} y={ly} dx={3} dy={4} size={11} color="var(--ink-2)">
                {String(L)}
              </Label>
            )
          })}
          <Dots points={[{ x: best.w, y: best.b, r: 7, shape: 'cross', color: 'var(--viz-ink)' }]} />
          <Label x={best.w} y={best.b} dx={-10} dy={18} anchor="end" size={12} weight={700}>
            lowest MSE
          </Label>
          <DragDot x={w} y={b} r={8} color="var(--viz-2)" snap={0.05} ariaLabel="Slope and intercept of the line" onChange={(nw, nb) => set(nw, nb)} />
        </Plot>
      </div>
      <Readout
        items={[
          ['line', lineText(w, b)],
          ['MSE', fix(loss, 3)],
          ['lowest MSE', fix(bestMse, 3)],
          ['best line', lineText(best.w, best.b)],
        ]}
      />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
        <Button onClick={() => setWb([best.w, best.b])}>Jump to the bottom</Button>
        <Button onClick={() => setWb([0.5, 4.5])}>Reset</Button>
      </div>
    </Figure>
  )
}
