import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Readout, Button, Plot, Grid, Axes, FnPath, Dots, VLine, M, MBlock } from '../../../../../kit'
import { Handle, fx } from '../derivatives-as-slopes/plotHelpers'

/*
  A stepper through the quotient-rule derivation of σ′(x), one line of algebra per step, next to a
  live check: the "messy" form e^{-x}/(1 + e^{-x})² and the "neat" form σ(1 − σ) draw the same curve
  and give the same number at any x the learner drags to.
*/

const sig = (x: number) => 1 / (1 + Math.exp(-x))
const messy = (x: number) => Math.exp(-x) / (1 + Math.exp(-x)) ** 2
const neat = (x: number) => sig(x) * (1 - sig(x))

const STEPS: { title: string; tex: string; say: ReactNode }[] = [
  {
    title: 'Write σ as a fraction u / v',
    tex: '\\begin{gathered} \\sigma(x) = \\frac{1}{1 + e^{-x}} \\\\ u = 1, \\qquad v = 1 + e^{-x} \\end{gathered}',
    say: (
      <>
        The top is the constant 1 and the bottom is <M>{'1 + e^{-x}'}</M>.
      </>
    ),
  },
  {
    title: 'Differentiate the top and the bottom',
    tex: "u' = 0, \\qquad v' = 0 + (-e^{-x}) = -e^{-x}",
    say: (
      <>
        A constant has slope 0. The mirror rule says <M>{'e^{-x}'}</M> has slope <M>{'-e^{-x}'}</M>.
      </>
    ),
  },
  {
    title: 'Apply the quotient rule',
    tex: "\\begin{aligned} \\sigma'(x) &= \\frac{u'v - uv'}{v^2} \\\\ &= \\frac{0 \\cdot (1 + e^{-x}) - 1 \\cdot (-e^{-x})}{(1 + e^{-x})^2} \\\\ &= \\frac{e^{-x}}{(1 + e^{-x})^2} \\end{aligned}",
    say: 'The first product is 0, and minus a minus becomes a plus.',
  },
  {
    title: 'Split it into two fractions',
    tex: "\\sigma'(x) = \\frac{1}{1 + e^{-x}} \\cdot \\frac{e^{-x}}{1 + e^{-x}}",
    say: (
      <>
        Same top, same bottom, just written as a product. The first factor is <M>{'\\sigma(x)'}</M> itself.
      </>
    ),
  },
  {
    title: 'Recognise the second factor as 1 − σ',
    tex: '\\begin{aligned} 1 - \\sigma(x) &= \\frac{(1 + e^{-x}) - 1}{1 + e^{-x}} \\\\ &= \\frac{e^{-x}}{1 + e^{-x}} \\end{aligned}',
    say: (
      <>
        Write 1 as <M>{'\\frac{1 + e^{-x}}{1 + e^{-x}}'}</M> and subtract <M>{'\\sigma(x) = \\frac{1}{1 + e^{-x}}'}</M>.
      </>
    ),
  },
  {
    title: 'The result',
    tex: "\\sigma'(x) = \\sigma(x)\\,\\bigl(1 - \\sigma(x)\\bigr)",
    say: (
      <>
        Check at <M>{'x = 0'}</M>: <M>{'e^0 = 1'}</M>, so the messy form gives <M>{'1 / 2^2 = 0.25'}</M> and the neat form gives{' '}
        <M>{'0.5 \\times 0.5 = 0.25'}</M>.
      </>
    ),
  },
]

const lineStyle = (state: 'past' | 'now'): CSSProperties => ({
  width: '100%',
  padding: '0.15rem 0.6rem',
  borderRadius: 10,
  borderLeft: `4px solid ${state === 'now' ? 'var(--viz-2)' : 'transparent'}`,
  background: state === 'now' ? 'color-mix(in srgb, var(--viz-2) 10%, var(--surface))' : 'transparent',
  opacity: state === 'now' ? 1 : 0.62,
  overflowX: 'auto',
})

export default function SigmoidDerivation() {
  const [k, setK] = useState(0)
  const [x, setX] = useState(1.5)
  const s = STEPS[k]

  return (
    <Figure
      title="Deriving σ′(x) with the quotient rule"
      caption={
        <>
          Press <b>Next</b> to add one line of algebra at a time. The plot checks the algebra numerically: the solid curve is the messy form{' '}
          <M>{'e^{-x}/(1+e^{-x})^2'}</M> and the dashed curve is the neat form <M>{'\\sigma(1-\\sigma)'}</M>. They are the same curve, and dragging the
          point gives the same number from both.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gap: '0.25rem' }}>
        {STEPS.slice(0, k + 1).map((st, i) => (
          <div key={i} style={lineStyle(i === k ? 'now' : 'past')}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)' }}>
              {i + 1}. {st.title}
            </div>
            <MBlock>{st.tex}</MBlock>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', fontSize: '0.92rem', color: 'var(--ink)' }}>{s.say}</div>
      <Controls>
        <Button onClick={() => setK((v) => Math.max(0, v - 1))} disabled={k === 0}>
          Back
        </Button>
        <Button primary onClick={() => setK((v) => Math.min(STEPS.length - 1, v + 1))} disabled={k === STEPS.length - 1}>
          Next
        </Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--ink-2)' }}>
          Step {k + 1} of {STEPS.length}
        </span>
      </Controls>
      <Plot x={[-6, 6]} y={[-0.02, 0.3]} width={520} height={220} minHeight={190} maxWidth={680} ariaLabel="The two forms of the sigmoid derivative drawn on the same axes">
        <Grid xTicks={6} yTicks={3} />
        <Axes origin xTicks={6} yTicks={3} xLabel="x" />
        <FnPath f={messy} color="var(--viz-1)" width={5} opacity={0.55} />
        <FnPath f={neat} color="var(--viz-2)" width={2.5} dash="7 5" />
        <VLine x={x} color="var(--viz-muted)" dash="2 4" width={1.2} />
        <Dots points={[{ x, y: messy(x), r: 4, color: 'var(--viz-1)' }]} />
        <Handle
          x={x}
          y={neat(x)}
          r={7}
          color="var(--viz-2)"
          label="drag"
          ariaLabel="choose x: drag along the curve"
          constrain={(nx) => {
            const v = Math.round(nx * 10) / 10
            return [v, neat(v)]
          }}
          onChange={(nx) => setX(nx)}
        />
      </Plot>
      <Readout
        items={[
          ['x', fx(x, 1)],
          ['σ(x)', fx(sig(x), 4)],
          ['messy form', fx(messy(x), 4)],
          ['σ(1 − σ)', fx(neat(x), 4)],
        ]}
      />
    </Figure>
  )
}
