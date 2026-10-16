import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Readout, Button, Plot, Grid, Axes, Path, Dots, Label, FnPath, useNarrow } from '../../../../../kit'
import { DragDot } from './DragDot'
import { RIDES, fitLS, mse, ellipse, mseForm, fmt, fix, lineText, lineHandles, lineThrough, type Pt } from './shared'

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
const small: CSSProperties = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: '0.2rem' }

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

  // the handles stay on the line and inside the plot, even when the line's ends leave it
  const [hL, hR] = lineHandles(w, b, XL, XR, YD)
  const dragHandle = (which: 0 | 1, ny: number) => {
    const l = which === 0 ? lineThrough([hL[0], ny], hR) : lineThrough(hL, [hR[0], ny])
    set(l.w, l.b)
  }
  const pick = (p: Pt) => set(p[0], p[1])

  return (
    <Figure
      title="One line = one point on the loss map"
      caption={
        <>
          The data plot shows the rides and a line. The loss map shows every possible line as a point <i>(w, b)</i>, coloured by its MSE, like a contour
          map of a valley seen from above (the colour gets more intense towards the bottom of the bowl; the small numbers are MSE values on three of the
          contours). Drag the orange marker or tap anywhere on the loss map and watch the line jump; drag the line's green square handles and watch the
          marker move. Can you get the MSE below 0.35 using only the line? The bottom of the bowl, marked ×, is the least-squares line.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <div>
        <div style={small}>The data and the line</div>
        <Plot x={[0, 6]} y={YD} width={340} height={300} minHeight={250} maxWidth={520} ariaLabel={`Data with the line ${lineText(w, b)}`}>
          <Grid xTicks={6} yTicks={6} />
          <Axes xLabel="km" yLabel="fare ($)" xTicks={6} yTicks={6} />
          {RIDES.map(([x, y], i) => (
            <Path key={i} points={[[x, y], [x, w * x + b]]} color="var(--viz-2)" width={2} />
          ))}
          <FnPath f={(x) => w * x + b} color="var(--viz-3)" width={3} />
          <Dots points={RIDES.map(([x, y]) => ({ x, y, r: 6, color: 'var(--viz-1)' }))} />
          <DragDot x={hL[0]} y={hL[1]} lockX square color="var(--viz-3)" ariaLabel="Left handle of the line" onChange={(_, ny) => dragHandle(0, ny)} />
          <DragDot x={hR[0]} y={hR[1]} lockX square color="var(--viz-3)" ariaLabel="Right handle of the line" onChange={(_, ny) => dragHandle(1, ny)} />
        </Plot>
        </div>
        <div>
        <div style={small}>The loss map over (w, b)</div>
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
