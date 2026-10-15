import { useState } from 'react'
import { Figure, Slider, Readout, useContainerWidth } from '../../../../../kit'
import css from './modules.module.css'

/*
  nn.Linear(in_features, out_features) as blocks: x (N, width) @ W.T (in, out) + b (out,) = y (N, out).
  The weight is STORED as (out, in), one row per output neuron (drawn underneath, each row in its own
  colour); .T turns each row into a column of W.T, and column j of y is neuron j's output.
  When the input's width differs from in_features, the two clashing numbers turn red and the real
  PyTorch error appears.
*/

const COL = { n: 'var(--viz-5)', k: 'var(--viz-2)', out: 'var(--viz-3)', bad: 'var(--viz-neg)' }
// six distinct colours, one per output neuron (orange is kept for the in/width sizes, red for errors)
const NEURON = ['var(--viz-3)', 'var(--viz-4)', 'var(--viz-6)', 'var(--viz-5)', 'var(--viz-1)', 'var(--viz-axis)']

export default function LinearShapeMatcher() {
  const [N, setN] = useState(4)
  const [inF, setIn] = useState(3)
  const [outF, setOut] = useState(2)
  const [width, setWidth] = useState(3)
  const [ref, cw] = useContainerWidth<HTMLDivElement>(560)
  const ok = width === inF

  // geometry: four blocks in a row, cell size chosen to fit; the stored weight sits under W.T
  const W = Math.max(280, Math.min(cw, 640))
  const sym = 22
  const cols = width + outF + outF + outF
  const s = Math.max(9, Math.min(26, Math.floor((W - 4 * sym - 24) / cols)))
  const top = 40
  const xs = {
    x: 8,
    wt: 8 + width * s + sym,
    b: 8 + width * s + sym + outF * s + sym,
    y: 8 + width * s + sym + 2 * (outF * s + sym),
  }
  const total = xs.y + outF * s + 8
  const off = Math.max(0, (W - total) / 2)
  const row1Bottom = top + Math.max(N, inF) * s
  const wTop = row1Bottom + 62 // stored weight block
  // centre the stored weight under W.T, kept inside the drawing
  const wtCentre = off + xs.wt + (outF * s) / 2
  const wLeft = Math.min(Math.max(4, wtCentre - (inF * s) / 2), W - inF * s - 4)
  // its label goes to the right, else to the left, else underneath
  const LABEL_W = 150
  const wLabel: { x: number; y: number; anchor: 'start' | 'end' | 'middle' } =
    W - (wLeft + inF * s) > LABEL_W + 8
      ? { x: wLeft + inF * s + 8, y: wTop + 12, anchor: 'start' }
      : wLeft > LABEL_W + 8
        ? { x: wLeft - 8, y: wTop + 12, anchor: 'end' }
        : { x: wLeft + (inF * s) / 2, y: wTop + outF * s + 16, anchor: 'middle' }
  const H = wTop + outF * s + (wLabel.anchor === 'middle' ? 46 : 30)

  const tint = (c: string, p = 26) => `color-mix(in srgb, ${c} ${p}%, var(--surface))`
  const cells = (x0: number, y0: number, rows: number, cols: number, fill: (r: number, c: number) => string, edge: string, ghost = false, key = '') => (
    <g key={key} transform={`translate(${x0}, ${y0})`} style={{ opacity: ghost ? 0.3 : 1 }}>
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        return <rect key={i} x={c * s} y={r * s} width={s} height={s} style={{ fill: fill(r, c), stroke: 'var(--surface)', strokeWidth: 1 }} />
      })}
      <rect width={cols * s} height={rows * s} rx={3} style={{ fill: 'none', stroke: edge, strokeWidth: 2 }} />
    </g>
  )
  const label = (x: number, y: number, text: string, colour: string, anchor: 'middle' | 'start' | 'end' = 'middle', weight = 700) => (
    <text x={x} y={y} textAnchor={anchor} style={{ fill: colour, fontSize: 12, fontWeight: weight, fontFamily: 'var(--font-mono)' }}>
      {text}
    </text>
  )
  const symAt = (x: number, t: string) => (
    <text x={off + x} y={top + (Math.min(N, inF) * s) / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 16, fontWeight: 800, fill: 'var(--ink-2)' }}>
      {t}
    </text>
  )
  const neuron = (j: number) => NEURON[j % NEURON.length]
  const edgeK = ok ? COL.k : COL.bad

  return (
    <Figure
      title="nn.Linear: which numbers have to match?"
      caption={
        <>
          <code>nn.Linear(in, out)</code> stores its weight as <b>(out, in)</b> (bottom): one coloured row per output neuron. <code>.T</code> turns each row into
          a column, and column <i>j</i> of <code>y</code> is neuron <i>j</i>'s output. The input's width (last dim) must equal <code>in_features</code>: drag{' '}
          <i>input width</i> away from <i>in_features</i> and read which two numbers PyTorch says disagree. The batch size never matters.
        </>
      }
    >
      <pre className={css.code} style={{ padding: '0.5rem 0.75rem' }}>
        {`layer = nn.Linear(${inF}, ${outF})\n`}
        <span className={css.comment}>{`# weight: (${outF}, ${inF})  bias: (${outF},)`}</span>
        {`\nx = torch.randn(${N}, ${width})\ny = layer(x)`}
      </pre>
      <div ref={ref} style={{ width: '100%' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
          role="img"
          aria-label={`x of shape ${N} by ${width}, times W transposed of shape ${inF} by ${outF}, plus a bias of ${outF}, gives y of shape ${N} by ${outF}. The weight is stored as ${outF} by ${inF}.`}
        >
          {cells(off + xs.x, top, N, width, () => tint('var(--viz-1)', 18), edgeK, false, 'x')}
          {symAt(xs.x + width * s + sym / 2, '@')}
          {cells(off + xs.wt, top, inF, outF, (_, c) => tint(neuron(c)), edgeK, false, 'wt')}
          {symAt(xs.wt + outF * s + sym / 2, '+')}
          {cells(off + xs.b, top, 1, outF, (_, c) => tint(neuron(c)), 'var(--viz-ink)', false, 'b')}
          {symAt(xs.b + outF * s + sym / 2, '=')}
          {cells(off + xs.y, top, N, outF, (_, c) => tint(neuron(c), 40), 'var(--viz-ink)', !ok, 'y')}
          {/* names */}
          {label(off + xs.x + (width * s) / 2, top - 22, 'x', 'var(--ink)')}
          {label(off + xs.wt + (outF * s) / 2, top - 22, 'W.T', 'var(--ink)')}
          {label(off + xs.b + (outF * s) / 2, top - 22, 'b', 'var(--ink)')}
          {label(off + xs.y + (outF * s) / 2, top - 22, ok ? 'y' : 'y ?', ok ? 'var(--ink)' : COL.bad)}
          {/* dimension labels */}
          {label(off + xs.x + (width * s) / 2, top - 6, `width ${width}`, edgeK)}
          {label(off + xs.wt + (outF * s) / 2, top - 6, `out ${outF}`, COL.out)}
          {label(off + xs.y + (outF * s) / 2, top - 6, `out ${outF}`, COL.out)}
          {label(off + xs.x + (width * s) / 2, top + N * s + 16, `N = ${N}`, COL.n)}
          {label(off + xs.wt + (outF * s) / 2, top + inF * s + 16, `in ${inF}`, edgeK)}
          {label(off + xs.b + (outF * s) / 2, top + s + 16, `(${outF},)`, 'var(--ink-2)', 'middle', 400)}
          {ok && label(off + xs.y + (outF * s) / 2, top + N * s + 16, `(${N}, ${outF})`, 'var(--ink-2)')}
          {!ok && label(off + xs.wt - sym / 2, row1Bottom + 34, `${width} ≠ ${inF}`, COL.bad)}
          {/* stored weight, with the .T arrow up to W.T */}
          <line
            x1={wtCentre}
            x2={wtCentre}
            y1={wTop - 6}
            y2={top + inF * s + 24}
            style={{ stroke: 'var(--ink-3)', strokeWidth: 1.5, strokeDasharray: '4 3' }}
            markerEnd="url(#lsm-arrow)"
          />
          <defs>
            <marker id="lsm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: 'var(--ink-3)' }} />
            </marker>
          </defs>
          {label(wtCentre + 6, (wTop + top + inF * s + 24) / 2 + 4, '.T', 'var(--ink-2)', 'start')}
          {cells(wLeft, wTop, outF, inF, (r) => tint(neuron(r)), 'var(--viz-ink)', false, 'w')}
          {label(wLabel.x, wLabel.y, 'layer.weight', 'var(--ink)', wLabel.anchor)}
          {label(wLabel.x, wLabel.y + 16, `(${outF}, ${inF}) = (out, in)`, 'var(--ink-2)', wLabel.anchor, 400)}
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
      <div className={css.sliderGrid}>
        <div className={css.sliderGroup}>
          <div className={css.groupHead}>
            the data <code>x</code>
          </div>
          <Slider label="batch size N" value={N} min={1} max={6} onChange={setN} />
          <Slider label="input width (x.shape[-1])" value={width} min={1} max={6} onChange={setWidth} />
        </div>
        <div className={css.sliderGroup}>
          <div className={css.groupHead}>
            the layer <code>nn.Linear(in, out)</code>
          </div>
          <Slider label="in_features" value={inF} min={1} max={6} onChange={setIn} />
          <Slider label="out_features" value={outF} min={1} max={6} onChange={setOut} />
        </div>
      </div>
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
