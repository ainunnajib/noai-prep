import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Slider, Plot, Grid, Axes, FnPath, Path, Rect, Dots, Label, VLine, DraggablePoint, M, useNarrow } from '../../../../../kit'

/*
  Why the learning rate has a hard limit. For L(w) = (c/2) w² the update is
  w ← w − η c w = (1 − η c) w, so every step multiplies w by r = 1 − ηc.
  Top: r against η, with the bands that decide the fate of the walk.
  Bottom: the first few values of w on a number line.
*/

const CURVES = [
  { value: 1, label: 'c = 1' },
  { value: 2, label: 'c = 2 (L = w²)' },
  { value: 4, label: 'c = 4' },
]
const ETA_MAX = 2.2
const W0 = 3
const N = 6
const LINE = 6.5

const fmt = (v: number) => (Math.abs(v) >= 100 ? v.toExponential(1) : v.toFixed(2))
const smallTitle: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }

export default function StepMultiplier() {
  const [c, setC] = useState(2)
  const [eta, setEta] = useState(0.8)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const r = 1 - eta * c
  const ws = Array.from({ length: N + 1 }, (_, k) => W0 * r ** k)
  const fate =
    Math.abs(r) > 1 + 1e-9
      ? { text: 'diverges: |r| > 1, so w grows every step', colour: 'var(--viz-neg)' }
      : Math.abs(Math.abs(r) - 1) < 1e-9
        ? { text: '|r| = 1: w bounces between +3 and −3 for ever', colour: 'var(--viz-neg)' }
        : Math.abs(r) < 1e-9
          ? { text: 'r = 0: lands exactly on the minimum in one step', colour: 'var(--viz-pos)' }
          : r < 0
            ? { text: 'converges, zig-zagging: r is negative, so w flips sign each step', colour: 'var(--viz-6)' }
            : { text: 'converges smoothly from one side', colour: 'var(--viz-pos)' }

  const snapEta = (x: number) => Math.max(0.01, Math.min(ETA_MAX, Math.round(x * 100) / 100))

  return (
    <Figure
      title="Every step multiplies the distance to the bottom by r = 1 − ηc"
      caption={
        <>
          Drag the point along the line (or use the slider) to change the learning rate η, and watch the first six values of w on the number line
          below. Inside the green band (−1 &lt; r &lt; 1) the walk shrinks to 0; below −1 it explodes. The edge is at η = 2/c, so switch to the
          steeper bowl and see the safe range halve.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.5rem' }}>
        <div style={smallTitle}>
          The multiplier <M>{`r = 1 - \\eta c`}</M> for a bowl with curvature c = {c}
        </div>
        <Plot x={[0, ETA_MAX]} y={[-2.4, 1.3]} width={narrow ? 360 : 520} height={narrow ? 280 : 270} maxWidth={680} ariaLabel={`The multiplier r = 1 minus eta times ${c}. At eta ${eta.toFixed(2)}, r = ${r.toFixed(2)}`}>
          <Rect x0={0} x1={ETA_MAX} y0={-1} y1={1} fill="color-mix(in srgb, var(--viz-pos) 13%, transparent)" />
          <Rect x0={0} x1={ETA_MAX} y0={-2.4} y1={-1} fill="color-mix(in srgb, var(--viz-neg) 13%, transparent)" />
          <Grid xTicks={11} yTicks={7} />
          <Axes xLabel="learning rate η" yLabel="r" xTicks={narrow ? 6 : 11} yTicks={7} />
          <Path points={[[0, 0], [ETA_MAX, 0]]} color="var(--viz-axis)" width={1} />
          <Label x={ETA_MAX} y={0.55} dx={-6} anchor="end" color="var(--viz-pos)" weight={700}>
            {narrow ? 'slides in' : '0 < r < 1: slides in'}
          </Label>
          <Label x={ETA_MAX} y={-0.5} dx={-6} anchor="end" color="var(--viz-6)" weight={700}>
            {narrow ? 'zig-zags in' : '−1 < r < 0: zig-zags in'}
          </Label>
          <Label x={ETA_MAX} y={-1.75} dx={-6} anchor="end" color="var(--viz-neg)" weight={700}>
            {narrow ? 'blows up' : 'r < −1: blows up'}
          </Label>
          {1 / c <= ETA_MAX && <VLine x={1 / c} color="var(--viz-muted)" />}
          {1 / c <= ETA_MAX && (
            <Label x={1 / c} y={-2.4} dx={4} dy={-6} color="var(--viz-muted)" weight={700}>
              {`η = 1/c`}
            </Label>
          )}
          {2 / c <= ETA_MAX && <VLine x={2 / c} color="var(--viz-neg)" dash="6 4" />}
          {2 / c <= ETA_MAX && (
            <Label x={2 / c} y={1.3} dx={2 / c > 1.3 ? -5 : 5} dy={13} anchor={2 / c > 1.3 ? 'end' : 'start'} color="var(--viz-neg)" weight={700}>
              {`η = 2/c = ${(2 / c).toFixed(2)}`}
            </Label>
          )}
          <FnPath f={(x) => 1 - c * x} color="var(--viz-1)" width={3} />
          <DraggablePoint x={eta} y={r} constrain={(x) => [snapEta(x), 1 - c * snapEta(x)]} onChange={(x) => setEta(snapEta(x))} />
        </Plot>
        <div style={smallTitle}>
          The walk: <M>{`w_0 = 3,\\; w_{k+1} = r\\, w_k`}</M>
        </div>
        <Plot x={[-LINE, LINE]} y={[-1.4, 1.6]} width={narrow ? 360 : 520} height={narrow ? 120 : 110} maxWidth={680} margin={{ top: 6, bottom: 26, left: 16, right: 16 }} ariaLabel={`First values of w: ${ws.map(fmt).join(', ')}`}>
          <Axes xTicks={narrow ? 6 : 12} hideYTicks origin />
          {ws.slice(0, -1).map((v, k) => {
            const a = Math.max(-LINE, Math.min(LINE, v))
            const b = Math.max(-LINE, Math.min(LINE, ws[k + 1]))
            const up = k % 2 === 0 ? 1 : -1
            const h = Math.min(1.2, 0.35 + Math.abs(b - a) * 0.12) * up
            const pts: [number, number][] = Array.from({ length: 21 }, (_, i) => {
              const t = i / 20
              return [a + (b - a) * t, 4 * h * t * (1 - t)]
            })
            return <Path key={k} points={pts} color="color-mix(in srgb, var(--viz-2) 75%, var(--surface))" width={1.8} />
          })}
          <Dots
            points={ws.map((v, k) => ({
              x: Math.max(-LINE, Math.min(LINE, v)),
              y: 0,
              r: k === 0 ? 6 : 4.5,
              color: Math.abs(v) > LINE ? 'var(--viz-neg)' : k === 0 ? 'var(--viz-ink)' : 'var(--viz-2)',
              shape: Math.abs(v) > LINE ? ('triangle' as const) : undefined,
            }))}
          />
          <Dots points={[{ x: 0, y: 0, r: 3, color: 'var(--viz-pos)' }]} stroke="none" />
        </Plot>
      </div>
      <Controls>
        <Segmented label="Bowl curvature" value={c} onChange={setC} options={CURVES} />
        <Slider label="learning rate η" value={eta} min={0.01} max={ETA_MAX} step={0.01} onChange={setEta} format={(v) => v.toFixed(2)} />
      </Controls>
      <Readout
        items={[
          ['r = 1 − ηc', `1 − ${eta.toFixed(2)} × ${c} = ${r.toFixed(2)}`],
          ['w', ws.map(fmt).join(' → ')],
        ]}
      />
      <div style={{ width: '100%', fontSize: '0.875rem', fontWeight: 600, color: fate.colour }}>{fate.text}</div>
    </Figure>
  )
}
