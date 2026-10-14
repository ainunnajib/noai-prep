import { useState } from 'react'
import { Figure, Controls, Slider, Readout, useContainerWidth } from '../../../../../kit'
import css from './modules.module.css'

/*
  nn.Linear(in_features, out_features) as blocks: x (N, width) @ W^T (in, out) + b (out,) = y (N, out).
  The weight is STORED as (out, in), one row per output neuron, which is why it is transposed.
  When the input's width differs from in_features, the two clashing numbers turn red and the real
  PyTorch error appears.
*/

const COL = { n: 'var(--viz-5)', k: 'var(--viz-2)', out: 'var(--viz-3)', bad: 'var(--viz-neg)' }

export default function LinearShapeMatcher() {
  const [N, setN] = useState(4)
  const [inF, setIn] = useState(3)
  const [outF, setOut] = useState(2)
  const [width, setWidth] = useState(3)
  const [ref, cw] = useContainerWidth<HTMLDivElement>(560)
  const ok = width === inF

  // geometry: four blocks in a row, cell size chosen to fit
  const W = Math.max(280, Math.min(cw, 640))
  const sym = 22
  const cols = width + outF + outF + outF
  const s = Math.max(9, Math.min(26, Math.floor((W - 4 * sym - 24) / cols)))
  const top = 40
  const blocks = [
    { key: 'x', rows: N, cols: width, x: 8, colour: 'var(--viz-1)' },
    { key: 'wt', rows: inF, cols: outF, x: 8 + width * s + sym, colour: COL.out },
    { key: 'b', rows: 1, cols: outF, x: 8 + width * s + sym + outF * s + sym, colour: 'var(--viz-6)' },
    { key: 'y', rows: N, cols: outF, x: 8 + width * s + sym + 2 * (outF * s + sym), colour: 'var(--viz-4)' },
  ]
  const total = blocks[3].x + outF * s + 8
  const H = top + Math.max(N, inF) * s + 44
  const off = Math.max(0, (W - total) / 2)

  const grid = (b: (typeof blocks)[number], edge: string, ghost = false) => (
    <g key={b.key} transform={`translate(${off + b.x}, ${top})`} style={{ opacity: ghost ? 0.3 : 1 }}>
      <rect width={b.cols * s} height={b.rows * s} rx={3} style={{ fill: `color-mix(in srgb, ${b.colour} 16%, var(--surface))`, stroke: edge, strokeWidth: 2 }} />
      {Array.from({ length: b.rows - 1 }, (_, i) => (
        <line key={`r${i}`} x1={0} x2={b.cols * s} y1={(i + 1) * s} y2={(i + 1) * s} style={{ stroke: b.colour, strokeWidth: 0.6, opacity: 0.6 }} />
      ))}
      {Array.from({ length: b.cols - 1 }, (_, i) => (
        <line key={`c${i}`} y1={0} y2={b.rows * s} x1={(i + 1) * s} x2={(i + 1) * s} style={{ stroke: b.colour, strokeWidth: 0.6, opacity: 0.6 }} />
      ))}
    </g>
  )
  const label = (x: number, y: number, text: string, colour: string, anchor: 'middle' | 'start' | 'end' = 'middle') => (
    <text className="plot-label" x={off + x} y={y} textAnchor={anchor} style={{ fill: colour, fontSize: 12 }}>
      {text}
    </text>
  )
  const [bx, bw, bb, by] = blocks
  const symAt = (x: number, t: string) => (
    <text x={off + x} y={top + (Math.min(N, inF) * s) / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 16, fontWeight: 800, fill: 'var(--ink-2)' }}>
      {t}
    </text>
  )

  return (
    <Figure
      title="nn.Linear: which numbers have to match?"
      caption={
        <>
          <code>nn.Linear(in, out)</code> stores its weight as <b>(out, in)</b>, one row per output, and computes <code>x @ W.T + b</code>. The input's width (last
          dim) must equal <code>in_features</code>: drag <i>input width</i> away from <i>in_features</i> and read which two numbers PyTorch says disagree. The
          batch size never matters.
        </>
      }
    >
      <pre className={css.code} style={{ padding: '0.5rem 0.75rem' }}>
        {`layer = nn.Linear(${inF}, ${outF})     # weight ${'('}${outF}, ${inF}), bias (${outF},)\nx = torch.randn(${N}, ${width})\ny = layer(x)`}
      </pre>
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }} role="img" aria-label={`x of shape ${N} by ${width} times W transposed of shape ${inF} by ${outF}`}>
          {grid(bx, ok ? COL.k : COL.bad)}
          {symAt(bx.x + width * s + sym / 2, '@')}
          {grid(bw, ok ? COL.k : COL.bad)}
          {symAt(bw.x + outF * s + sym / 2, '+')}
          {grid(bb, 'var(--viz-6)')}
          {symAt(bb.x + outF * s + sym / 2, '=')}
          {grid(by, 'var(--viz-ink)', !ok)}
          {/* top labels */}
          {label(bx.x + (width * s) / 2, top - 22, 'x', 'var(--ink)')}
          {label(bw.x + (outF * s) / 2, top - 22, 'W.T', 'var(--ink)')}
          {label(bb.x + (outF * s) / 2, top - 22, 'b', 'var(--ink)')}
          {label(by.x + (outF * s) / 2, top - 22, ok ? 'y' : 'y ?', ok ? 'var(--ink)' : COL.bad)}
          {/* dimension labels */}
          {label(bx.x + (width * s) / 2, top - 6, `width ${width}`, ok ? COL.k : COL.bad)}
          {label(bw.x + (outF * s) / 2, top - 6, `out ${outF}`, COL.out)}
          {label(by.x + (outF * s) / 2, top - 6, `out ${outF}`, COL.out)}
          {label(bx.x + (width * s) / 2, top + N * s + 16, `N = ${N}`, COL.n)}
          {label(bw.x + (outF * s) / 2, top + inF * s + 16, `in ${inF}`, ok ? COL.k : COL.bad)}
          {label(by.x + (outF * s) / 2, top + N * s + 16, ok ? `(${N}, ${outF})` : '', 'var(--ink-2)')}
          {!ok && label(bx.x + width * s + sym / 2, top + Math.max(N, inF) * s + 34, `${width} ≠ ${inF}`, COL.bad)}
        </svg>
      </div>
      {ok ? (
        <div className={css.ok}>
          y.shape = ({N}, {outF}): each of the {N} rows of x meets all {outF} rows of the weight.
        </div>
      ) : (
        <div className={css.err} role="alert">
          {`RuntimeError: mat1 and mat2 shapes cannot be multiplied (${N}x${width} and ${inF}x${outF})`}
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--ink-2)', marginTop: 4 }}>
            mat1 is your input ({N} × {width}); mat2 is the transposed weight ({inF} × {outF}). The middle pair, {width} and {inF}, must be equal: either
            the data has the wrong number of features or the layer was built with the wrong <code>in_features</code>.
          </div>
        </div>
      )}
      <Controls>
        <Slider label="batch size N" value={N} min={1} max={6} onChange={setN} />
        <Slider label="input width (x.shape[-1])" value={width} min={1} max={6} onChange={setWidth} />
        <Slider label="in_features" value={inF} min={1} max={6} onChange={setIn} />
        <Slider label="out_features" value={outF} min={1} max={6} onChange={setOut} />
      </Controls>
      <Readout
        items={[
          ['layer.weight.shape', `(${outF}, ${inF})`],
          ['layer.bias.shape', `(${outF},)`],
          ['parameters', `${outF} × ${inF} + ${outF} = ${outF * inF + outF}`],
        ]}
      />
    </Figure>
  )
}
