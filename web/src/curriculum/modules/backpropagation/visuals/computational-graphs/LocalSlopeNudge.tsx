import { useState } from 'react'
import css from './gates.module.css'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, FnPath, Path, Label, DraggablePoint, M } from '../../../../../kit'
import { fmt, sig } from './graphCore'

/*
  A local derivative is just the slope of one tiny function. Pick a gate, drag the input a along
  the curve "output as a function of a" (the other input b held fixed), and read the slope of the
  tangent. A real nudge of a by 0.01 confirms it: the output moves by slope × 0.01.
*/

type Gate = 'add' | 'mul' | 'sq' | 'sig' | 'max'

const GATES: Record<
  Gate,
  {
    f: (a: number, b: number) => number
    d: (a: number, b: number) => number
    y: [number, number]
    tex: string
    dtex: (a: number, b: number) => string
    /** a plain-words reading of the slope, shown under the maths */
    note?: (a: number, b: number) => string
    two: boolean
  }
> = {
  add: { f: (a, b) => a + b, d: () => 1, y: [-6.5, 6.5], tex: 'a + b', dtex: () => '1', two: true },
  mul: { f: (a, b) => a * b, d: (_a, b) => b, y: [-9.5, 9.5], tex: 'a \\times b', dtex: (_a, b) => `b = ${fmt(b)}`, two: true },
  sq: { f: (a) => a * a, d: (a) => 2 * a, y: [-1.5, 9.5], tex: 'a^2', dtex: (a) => `2a = ${fmt(2 * a)}`, two: false },
  sig: {
    f: (a) => sig(a),
    d: (a) => sig(a) * (1 - sig(a)),
    y: [-0.15, 1.15],
    tex: '\\sigma(a)',
    dtex: (a) => {
      // say "≈" when the two rounded factors do not multiply to exactly the rounded slope
      const eq = fmt(Number(fmt(sig(a))) * Number(fmt(1 - sig(a)))) === fmt(sig(a) * (1 - sig(a))) ? '=' : '\\approx'
      return `\\sigma(a)\\,(1-\\sigma(a)) = ${fmt(sig(a))} \\times ${fmt(1 - sig(a))} ${eq} ${fmt(sig(a) * (1 - sig(a)))}`
    },
    two: false,
  },
  max: {
    f: (a, b) => Math.max(a, b),
    d: (a, b) => (a >= b ? 1 : 0),
    y: [-3.5, 3.5],
    tex: '\\max(a, b)',
    dtex: (a, b) => (a >= b ? '1' : '0'),
    note: (a, b) =>
      a === b
        ? 'A tie: the slope is 1 just to the right of b and 0 just to the left. Conventions differ: PyTorch\'s max splits the gradient half-and-half, max-pooling picks one input. Here we pick a.'
        : a > b
          ? 'a is the larger input, so it passes straight through.'
          : 'b is larger, so a has no effect on the output.',
    two: true,
  },
}

export default function LocalSlopeNudge() {
  const [gate, setGate] = useState<Gate>('mul')
  const [a, setA] = useState(1)
  const [b, setB] = useState(2)
  const G = GATES[gate]
  const out = G.f(a, b)
  const slope = G.d(a, b)
  const eps = 0.01
  const nudged = G.f(a + eps, b)
  const change = nudged - out
  const [y0, y1] = G.y
  const run = gate === 'sig' ? 1.5 : 1
  // rise-over-run triangle drawn on the tangent line (shifted left if it would leave the plot)
  const T = (t: number) => out + slope * (t - a)
  const s0 = a + run <= 2.4 ? a : a - run
  const tri: [number, number][] = [
    [s0, T(s0)],
    [s0 + run, T(s0)],
    [s0 + run, T(s0 + run)],
  ]
  const snap = (v: number) => Math.max(-3, Math.min(3, Math.round(v * 4) / 4))
  // the point sits at one end of the triangle: the start of the run leg, or the top/bottom of the rise leg
  const pointAtRise = s0 !== a
  const sig3 = (v: number) => (Math.abs(v) < 1e-12 ? '0' : String(Number(v.toPrecision(3))))

  return (
    <Figure
      title="A local derivative is the slope of one small function"
      caption={
        <>
          Drag the orange point to change the input <M>a</M>; the line touching the curve has the local slope. Try <b>multiply</b> and move the{' '}
          <M>b</M> slider: the slope with respect to <M>a</M> is <M>b</M>, the <i>other</i> input. Try <b>sigmoid</b>: the slope is never more than
          0.25. Try <b>max</b>: the slope is 1 while <M>a</M> is the larger input and 0 once it is not. (For add and multiply the curve is
          already a straight line, so the dashed tangent lies right on top of it.)
        </>
      }
    >
      <Segmented
        label="Gate"
        value={gate}
        onChange={(g) => setGate(g)}
        options={[
          { value: 'add', label: 'add' },
          { value: 'mul', label: 'multiply' },
          { value: 'sq', label: 'square' },
          { value: 'sig', label: 'sigmoid' },
          { value: 'max', label: 'max' },
        ]}
      />
      <div style={{ fontSize: '1.02rem' }}>
        <M>{`\\text{out} = ${G.tex}`}</M>
        {G.two && (
          <>
            {' '}
            with <M>{`b = ${fmt(b)}`}</M> held fixed
          </>
        )}
      </div>
      <Plot x={[-3.4, 3.4]} y={[y0, y1]} width={480} height={300} minHeight={240} ariaLabel={`Graph of out = ${G.tex} against a, with the tangent line at a = ${fmt(a)}`}>
        <Grid xTicks={7} yTicks={6} />
        <Axes origin xLabel="a" yLabel="out" xTicks={7} yTicks={6} />
        <FnPath f={(t) => G.f(t, b)} color="var(--viz-1)" width={3} samples={300} />
        {/* tangent line */}
        <FnPath f={(t) => out + slope * (t - a)} color="var(--viz-5)" width={2} dash="6 4" domain={[a - 1.6, a + 1.6]} />
        {/* rise-over-run triangle */}
        {Math.abs(slope) > 1e-9 && (
          <>
            <Path points={tri} color="var(--viz-5)" width={2} />
            <Label x={s0 + run / 2} y={T(s0)} dy={slope >= 0 ? 16 : -8} anchor="middle" color="var(--viz-5)" size={12}>
              {`run ${run}`}
            </Label>
            <Label x={s0 + run} y={T(s0) + (slope * run) / 2} dx={pointAtRise ? 16 : 6} dy={4} anchor="start" color="var(--viz-5)" size={12}>
              {`rise ${fmt(slope * run)}`}
            </Label>
          </>
        )}
        {/* the kit draws a point's label up and to the right, where the triangle's labels go; draw our own up and to the left */}
        <g className={css.noLabel}>
          <DraggablePoint x={a} y={out} onChange={(nx) => setA(snap(nx))} constrain={(nx) => [snap(nx), G.f(snap(nx), b)]} label="input a (drag)" />
        </g>
        <Label x={a} y={out} dx={-14} dy={-10} anchor="end" color="color-mix(in srgb, var(--viz-2) 70%, var(--ink))" size={13} weight={700}>
          a
        </Label>
      </Plot>
      <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', fontSize: '0.95rem', lineHeight: 1.7 }}>
        <div>
          Local derivative: <M>{`\\dfrac{\\partial\\,\\text{out}}{\\partial a} = ${G.dtex(a, b)}`}</M>
        </div>
        {G.note && <div style={{ color: 'var(--ink-2)', fontSize: '0.9rem', lineHeight: 1.5 }}>{G.note(a, b)}</div>}
        <div style={{ color: 'var(--ink-2)' }}>
          Nudge check: moving <M>a</M> from <M>{fmt(a)}</M> to <M>{fmt(a + eps, 2)}</M> changes out by <M>{fmt(change, 5)}</M>, and{' '}
          <M>{`${fmt(change, 5)} \\div 0.01 \\approx ${sig3(change / eps)}`}</M>
        </div>
      </div>
      <Controls>
        <Slider label="input a" value={a} min={-3} max={3} step={0.25} onChange={setA} format={(v) => fmt(v).replace('-', '−')} />
        {G.two && <Slider label="other input b" value={b} min={-3} max={3} step={0.25} onChange={setB} format={(v) => fmt(v).replace('-', '−')} />}
        <Readout
          items={[
            ['out', fmt(out).replace('-', '−')],
            ['slope', fmt(slope).replace('-', '−')],
          ]}
        />
      </Controls>
    </Figure>
  )
}
