import { useState } from 'react'
import { Figure, Controls, Slider, Toggle, Plot, Grid, Axes, FnPath, Dots, Label, HLine, VLine, M } from '../../../../../kit'

/*
  Two straight-line machines chained together: g(x) = m1 x + c1, then f(z) = m2 z + c2.
  Without anything in between, f(g(x)) is always another straight line, whatever the sliders say.
  Switch on a ReLU between the machines and the output gets a kink exactly where g(x) = 0.
  This is the reason neural networks put a non-linear activation function between their linear
  layers. The defaults match the lesson's worked example: g(x) = 2x + 1, f(z) = 2z - 3.
*/

const fx = (v: number) => {
  const r = Math.round(v * 100) / 100
  return String(Object.is(r, -0) ? 0 : r)
}
const signed = (v: number) => (v < 0 ? `- ${fx(-v)}` : `+ ${fx(v)}`)
function lin(m: number, c: number, v = 'x') {
  const mx = m === 0 ? '' : m === 1 ? v : m === -1 ? `-${v}` : `${fx(m)}${v}`
  if (!mx) return fx(c)
  return c === 0 ? mx : `${mx} ${signed(c)}`
}

export default function WhyKinks() {
  const [m1, setM1] = useState(2)
  const [c1, setC1] = useState(1)
  const [m2, setM2] = useState(2)
  const [c2, setC2] = useState(-3)
  const [relu, setRelu] = useState(false)

  const g = (x: number) => m1 * x + c1
  const out = (x: number) => m2 * (relu ? Math.max(0, g(x)) : g(x)) + c2
  const slopeOut = m2 * m1
  const interceptOut = m2 * c1 + c2
  const kinkX = m1 !== 0 ? -c1 / m1 : null
  const showKink = relu && kinkX !== null && kinkX > -4 && kinkX < 4 && m2 !== 0
  // Put the kink's label centred above or below the dot, on the side away from the ramp, unless that
  // side runs off the plot. On the ramp the output is m2 · g + c2 with g ≥ 0, so it rises when m2 > 0.
  const kinkY = kinkX !== null ? out(kinkX) : 0
  const rampUp = m2 > 0
  let labelBelow = rampUp
  if (labelBelow && kinkY < -4.6) labelBelow = false
  if (!labelBelow && kinkY > 4.6) labelBelow = true

  return (
    <Figure
      title="Why a neural network needs a non-linear step"
      caption={
        <>
          With the switch <b>off</b>, move all four sliders: the output (thick line) is <i>always</i> a straight line, because a line fed into a line is a line. Now
          switch the ReLU <b>on</b>: the output bends at the point where <M>g(x)</M> crosses 0. Stacking linear layers buys nothing; the non-linear activation in
          between (here ReLU's kink) is what lets a network build curved shapes.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 0.5rem', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }} aria-hidden="true">
        <span>x</span>
        <span>→</span>
        <span style={{ padding: '2px 8px', borderRadius: 8, border: '2px solid var(--viz-3)' }}>
          <M>{`g(x) = ${lin(m1, c1)}`}</M>
        </span>
        <span>→</span>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 8,
            border: `2px ${relu ? 'solid' : 'dashed'} ${relu ? 'var(--viz-2)' : 'var(--viz-muted)'}`,
            color: relu ? 'var(--ink)' : 'var(--ink-3)',
          }}
        >
          {relu ? 'ReLU' : 'nothing'}
        </span>
        <span>→</span>
        <span style={{ padding: '2px 8px', borderRadius: 8, border: '2px solid var(--viz-1)' }}>
          <M>{`f(z) = ${lin(m2, c2, 'z')}`}</M>
        </span>
        <span>→</span>
        <span>output</span>
      </div>
      <Plot x={[-4, 4]} y={[-6, 6]} width={460} height={340} minHeight={260} ariaLabel={relu ? 'Output of f(ReLU(g(x))), which has a kink' : 'Output of f(g(x)), a straight line'}>
        <Grid xTicks={8} yTicks={6} />
        {/* tick numbers sit on the plot's edges, so the steep output line never hides a minus sign */}
        <Axes xLabel="x" yLabel="output" xTicks={8} yTicks={6} />
        <HLine y={0} color="var(--viz-axis)" dash="none" width={1.25} />
        <VLine x={0} color="var(--viz-axis)" dash="none" width={1.25} />
        <FnPath f={g} color="var(--viz-3)" width={2} dash="6 5" opacity={0.8} />
        <FnPath f={out} color="var(--viz-1)" width={4} samples={400} />
        {showKink && (
          <>
            <Dots points={[{ x: kinkX!, y: kinkY, color: 'var(--viz-2)', r: 6 }]} />
            <Label
              x={kinkX!}
              y={kinkY}
              dx={kinkX! > 2.6 ? 8 : kinkX! < -2.6 ? -8 : 0}
              dy={labelBelow ? 24 : -14}
              anchor={kinkX! > 2.6 ? 'end' : kinkX! < -2.6 ? 'start' : 'middle'}
              color="var(--viz-2)"
            >
              {`kink at x = ${fx(kinkX!)}`}
            </Label>
          </>
        )}
      </Plot>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1.2rem', justifyContent: 'center', fontSize: '0.85rem', color: 'var(--ink-2)' }} aria-hidden="true">
        <span>
          <svg width="28" height="10" style={{ verticalAlign: 'middle', marginRight: 6 }}>
            <line x1="2" y1="5" x2="26" y2="5" style={{ stroke: 'var(--viz-1)', strokeWidth: 4, strokeLinecap: 'round' }} />
          </svg>
          output of the whole chain
        </span>
        <span>
          <svg width="28" height="10" style={{ verticalAlign: 'middle', marginRight: 6 }}>
            <line x1="2" y1="5" x2="26" y2="5" style={{ stroke: 'var(--viz-3)', strokeWidth: 2, strokeDasharray: '6 5' }} />
          </svg>
          <M>{'g(x)'}</M>, the first machine on its own
        </span>
      </div>
      <div style={{ width: '100%', textAlign: 'center', fontSize: '1rem' }} aria-live="polite">
        {relu ? (
          kinkX === null || m2 === 0 ? (
            <span>
              With <M>{m1 === 0 ? 'm_1 = 0' : 'm_2 = 0'}</M> there is nothing to bend. Change a slope.
            </span>
          ) : (
            <span>
              <M>{`f(\\operatorname{ReLU}(g(x)))`}</M> is flat where <M>{'g(x) < 0'}</M> and a line where <M>{'g(x) \\ge 0'}</M>: <b>a bent shape</b>.
            </span>
          )
        ) : (
          <span>
            <M>{`f(g(x)) = ${fx(m2)}(${lin(m1, c1)}) ${signed(c2)} = ${lin(slopeOut, interceptOut)}`}</M>: still a <b>straight line</b> (slope <M>{`m_2 m_1 = ${fx(slopeOut)}`}</M>).
          </span>
        )}
      </div>
      <Controls>
        <Toggle label="Put a ReLU between the machines" checked={relu} onChange={setRelu} />
      </Controls>
      <Controls>
        <Slider label={<>g slope <M>m_1</M></>} value={m1} min={-3} max={3} step={0.5} onChange={setM1} />
        <Slider label={<>g intercept <M>c_1</M></>} value={c1} min={-3} max={3} step={0.5} onChange={setC1} />
      </Controls>
      <Controls>
        <Slider label={<>f slope <M>m_2</M></>} value={m2} min={-3} max={3} step={0.5} onChange={setM2} />
        <Slider label={<>f intercept <M>c_2</M></>} value={c2} min={-3} max={3} step={0.5} onChange={setC2} />
      </Controls>
    </Figure>
  )
}
