import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, FnPath, Path, Dots, Label, VLine, DraggablePoint, M } from '../../../../../kit'

/*
  Line mode: y = mx + c with its intercept and a slope triangle (run 1 to 3, rise m × run) that can
  be dragged along the line; rise ÷ run never changes, because a line has one slope everywhere.
  The triangle is always kept inside the plot (it is pulled back when m or c moves the line).
  Parabola mode: y = a(x - h)^2 + k with its vertex, and a point to drag along the curve that
  shows its height and the slope of the tangent there (negative, zero at the vertex, positive).
  `lock` hides the Line/Parabola switch so each lesson section shows only its own shape.
*/

const X: [number, number] = [-4, 6]
const Y: [number, number] = [-4, 6]
const f1 = (v: number) => {
  const r = Math.round(v * 100) / 100
  return String(Object.is(r, -0) ? 0 : r)
}
const signed = (v: number) => (v < 0 ? `- ${f1(-v)}` : `+ ${f1(v)}`)
const snap = (v: number, step: number) => Math.round(v / step) * step
const PAD_Y = 0.6 // keep the triangle (and its labels) this far inside the top and bottom
/**
 * The x-interval where a slope triangle starting at (tx, line(tx)) fits: both corners
 * (tx, m·tx + c) and (tx + run, m·tx + c + m·run) inside the plot. null if it cannot fit.
 */
function triangleRange(m: number, c: number, run: number): [number, number] | null {
  let lo = X[0] + 0.5
  let hi = X[1] - run - 1.3 // room for the 'rise' label on the right
  const y0 = Y[0] + PAD_Y
  const y1 = Y[1] - PAD_Y
  if (m === 0) {
    if (c < y0 || c > y1) return null
  } else {
    const p = (y0 - c) / m
    const q = (y1 - c) / m
    lo = Math.max(lo, Math.min(p, q))
    hi = Math.min(hi, Math.max(p, q) - run)
  }
  if (lo > hi) return null
  // snap the ends inwards to tenths so a snapped point never leaves the interval
  const loS = Math.ceil(lo * 10 - 1e-9) / 10
  const hiS = Math.floor(hi * 10 + 1e-9) / 10
  return loS <= hiS ? [loS, hiS] : [(lo + hi) / 2, (lo + hi) / 2]
}

function lineTex(m: number, c: number) {
  const mx = m === 0 ? '' : m === 1 ? 'x' : m === -1 ? '-x' : `${f1(m)}x`
  if (!mx) return `y = ${f1(c)}`
  return c === 0 ? `y = ${mx}` : `y = ${mx} ${signed(c)}`
}
function parabolaTex(a: number, h: number, k: number) {
  if (a === 0) return `y = ${f1(k)}`
  const inner = h === 0 ? 'x' : `(x ${signed(-h)})`
  const A = a === 1 ? '' : a === -1 ? '-' : f1(a)
  const sq = h === 0 ? `${A}x^2` : `${A}${inner}^2`
  return k === 0 ? `y = ${sq}` : `y = ${sq} ${signed(k)}`
}

export default function LineParabolaPlot({ start = 'line', lock = false }: { start?: 'line' | 'parabola'; lock?: boolean }) {
  const [mode, setMode] = useState<'line' | 'parabola'>(start)
  const [m, setM] = useState(2)
  const [c, setC] = useState(1)
  const [run, setRun] = useState(1)
  const [tx, setTx] = useState(1) // where the slope triangle starts (pulled back into view below)
  const [a, setA] = useState(1)
  const [h, setH] = useState(3)
  const [k, setK] = useState(1)
  const [px, setPx] = useState(1)

  const line = (x: number) => m * x + c
  const par = (x: number) => a * (x - h) ** 2 + k
  // keep the draggable point on the visible part of the curve
  const lim = a > 0 ? Math.sqrt(Math.max(0, (Y[1] - k) / a)) : a < 0 ? Math.sqrt(Math.max(0, (k - Y[0]) / -a)) : Infinity
  const clampPx = (x: number) => Math.round(Math.max(X[0], h - lim, Math.min(X[1], h + lim, x)) * 10) / 10
  const pxs = clampPx(px)
  const py = par(pxs)
  const slope = 2 * a * (pxs - h) // slope of the tangent (from calculus; read it here)
  const atVertex = Math.abs(pxs - h) < 1e-9

  let status = ''
  if (a === 0) status = 'a = 0: no curve left, just a flat line'
  else if (atVertex) status = a > 0 ? 'slope 0: you are at the bottom (the vertex)' : 'slope 0: you are at the top (the vertex)'
  else status = slope < 0 ? 'slope negative: the curve goes down as x increases' : 'slope positive: the curve goes up as x increases'

  // keep the slope triangle where it can be seen: clamp its start into the interval where it fits
  const range = triangleRange(m, c, run)
  const clampTx = (x: number) => (range ? Math.max(range[0], Math.min(range[1], snap(x, 0.1))) : x)
  const txs = clampTx(tx)
  const ty = line(txs)
  const rise = m * run
  const tanHalf = 1.1
  const title = lock ? (mode === 'line' ? 'Slope and intercept of a line' : 'A parabola and its tangent') : 'Lines and parabolas'

  return (
    <Figure
      title={title}
      caption={
        mode === 'line' ? (
          <>
            Move the sliders: <M>m</M> tilts the line and <M>c</M> slides it up and down, so <M>c</M> is where it crosses the <M>y</M>-axis. Drag the orange
            corner along the line, and make the run longer: the triangle grows, but rise <M>{'\\div'}</M> run is always <M>m</M>, because a straight line has
            one slope everywhere.
          </>
        ) : (
          <>
            <M>h</M> and <M>k</M> move the turning point, the <b>vertex</b>, to <M>(h, k)</M> (the lowest point when <M>{'a > 0'}</M>, the highest when{' '}
            <M>{'a < 0'}</M>); <M>a</M> sets how narrow the U is and flips it when negative. Drag the orange point along the curve: the tangent's slope is
            negative on the way down, <b>0 at the vertex</b> and positive on the way up.
          </>
        )
      }
    >
      {!lock && (
        <Segmented
          label="Shape"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'line', label: 'Line' },
            { value: 'parabola', label: 'Parabola' },
          ]}
        />
      )}
      <div style={{ fontSize: '1.15rem' }} aria-live="polite">
        <M>{mode === 'line' ? lineTex(m, c) : parabolaTex(a, h, k)}</M>
      </div>
      <Plot x={X} y={Y} width={440} height={440} ariaLabel={mode === 'line' ? `Line ${lineTex(m, c)}` : `Parabola ${parabolaTex(a, h, k)} with vertex at (${h}, ${k})`}>
        <Grid xTicks={10} yTicks={10} />
        <Axes origin xLabel="x" yLabel="y" xTicks={10} yTicks={10} />
        {mode === 'line' ? (
          <>
            <FnPath f={line} color="var(--viz-1)" width={3} />
            <Dots points={[{ x: 0, y: c, color: 'var(--viz-3)', r: 6 }]} />
            {c >= Y[0] && c <= Y[1] && (
              <Label x={0} y={c} dx={-10} dy={m > 0 ? -10 : 18} anchor="end" color="var(--viz-3)">
                {`intercept ${f1(c)}`}
              </Label>
            )}
            {range && (
              <>
                {/* slope triangle: run then rise */}
                <Path points={[[txs, ty], [txs + run, ty]]} color="var(--viz-2)" width={3} />
                <Path points={[[txs + run, ty], [txs + run, ty + rise]]} color="var(--viz-4)" width={3} />
                <Label x={txs + run / 2} y={ty} dy={m > 0 ? 18 : -9} anchor="middle" color="var(--viz-2)">
                  {`run ${run}`}
                </Label>
                <Label x={txs + run} y={ty + rise / 2} dx={8} dy={4} color="var(--viz-4)">
                  {`rise ${f1(rise)}`}
                </Label>
                <DraggablePoint
                  x={txs}
                  y={ty}
                  r={7}
                  color="var(--viz-2)"
                  constrain={(x) => {
                    const s = clampTx(x)
                    return [s, line(s)]
                  }}
                  onChange={(x) => setTx(clampTx(x))}
                />
              </>
            )}
          </>
        ) : (
          <>
            {a !== 0 && <VLine x={h} />}
            <FnPath f={par} color="var(--viz-1)" width={3} />
            {Math.abs(slope) < 40 && (
              <Path points={[[pxs - tanHalf, py - tanHalf * slope], [pxs + tanHalf, py + tanHalf * slope]]} color="var(--viz-4)" width={2.5} dash="7 5" />
            )}
            <Dots points={[{ x: h, y: k, color: 'var(--viz-3)', r: 6 }]} />
            {a !== 0 && (
              <Label x={h} y={k} dy={a > 0 ? 22 : -12} anchor="middle" color="var(--viz-3)">
                {`vertex (${f1(h)}, ${f1(k)})`}
              </Label>
            )}
            <DraggablePoint
              x={pxs}
              y={py}
              r={7}
              color="var(--viz-2)"
              constrain={(x) => {
                const s = clampPx(x)
                return [s, par(s)]
              }}
              onChange={(x) => setPx(clampPx(x))}
            />
            {py <= Y[1] && py >= Y[0] && (
              <Label
                x={pxs}
                y={py}
                dx={atVertex ? 0 : pxs < h ? 14 : -14}
                dy={a >= 0 ? -14 : 24}
                anchor={atVertex ? 'middle' : pxs < h ? 'start' : 'end'}
                color="var(--viz-4)"
              >
                {`slope ${f1(slope)}`}
              </Label>
            )}
          </>
        )}
      </Plot>
      {mode === 'line' ? (
        <Controls>
          <Slider label={<>slope <M>m</M></>} value={m} min={-3} max={3} step={0.5} onChange={setM} />
          <Slider label={<>intercept <M>c</M></>} value={c} min={-3} max={4} step={0.5} onChange={setC} />
          <Slider label="run of the triangle" value={run} min={1} max={3} step={1} onChange={setRun} />
          <Readout
            items={[
              ['slope = rise ÷ run', range ? `${f1(rise)} ÷ ${run} = ${f1(m)}` : `${f1(m)}`],
              ['crosses the y-axis at', `(0, ${f1(c)})`],
              ['triangle starts at', range ? `(${f1(txs)}, ${f1(ty)})` : 'hidden'],
            ]}
          />
          {!range && (
            <div style={{ width: '100%', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-2)' }} aria-live="polite">
              {`A run of ${run} rises ${f1(rise)}: too tall to fit on this plot. Make the run shorter (or the slope gentler) to see the triangle again.`}
            </div>
          )}
        </Controls>
      ) : (
        <Controls>
          <Slider label={<>width and direction <M>a</M></>} value={a} min={-2} max={2} step={0.25} onChange={setA} />
          <Slider label={<>left–right <M>h</M></>} value={h} min={-2} max={4} step={0.5} onChange={setH} />
          <Slider label={<>up–down <M>k</M></>} value={k} min={-3} max={4} step={0.5} onChange={setK} />
          <Readout
            items={[
              ['point', `x = ${f1(pxs)}`],
              ['height y', f1(py)],
              ['tangent slope', f1(slope)],
            ]}
          />
          <div style={{ width: '100%', fontSize: '0.9rem', fontWeight: 600, color: atVertex && a !== 0 ? 'var(--viz-3)' : 'var(--ink-2)' }} aria-live="polite">
            {status}
          </div>
        </Controls>
      )}
    </Figure>
  )
}
