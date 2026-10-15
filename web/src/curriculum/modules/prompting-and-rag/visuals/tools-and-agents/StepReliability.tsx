import { useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Toggle, Readout, Plot, Grid, Axes, FnPath, Dots, VLine, M } from '../../../../../kit'

/*
  If each step of an agent succeeds independently with probability p, all n steps succeed with
  probability p^n. With one retry for a failed step (assuming failures are detected), a step
  succeeds with probability 1 - (1 - p)^2.
  Checked in Python: 0.9**3 = 0.729, 0.95**10 = 0.599, 0.99**10 = 0.904.
*/

export default function StepReliability() {
  const [p, setP] = useState(0.95)
  const [n, setN] = useState(10)
  const [retry, setRetry] = useState(false)
  const pr = 1 - (1 - p) ** 2
  const all = p ** n
  const allR = pr ** n
  const ns = Array.from({ length: 20 }, (_, i) => i + 1)

  return (
    <Figure
      title="Every extra step is another chance to fail"
      caption={
        <>
          Each dot is the chance that <b>all</b> <M>{'n'}</M> steps go right when each step succeeds with probability <M>{'p'}</M> on its own: <M>{'p^n'}</M>.
          Start at <M>{'p = 0.95'}</M>: one step is very reliable, yet ten steps in a row succeed only about 60% of the time. Then switch on a retry for
          failed steps (this assumes the agent can tell a step failed, for example from an error message) and watch the curve flatten.
        </>
      }
    >
      <Plot x={[0, 20.5]} y={[0, 1.16]} width={480} height={300} minHeight={240} ariaLabel="Probability that all n steps succeed, plotted against n" margin={{ left: 44, bottom: 38 }}>
        <Grid xTicks={10} yTicks={5} />
        <Axes xLabel="number of steps n" yLabel="P(all steps right)" xTicks={10} yTicks={5} />
        <FnPath f={(x) => (x >= 1 ? p ** x : NaN)} color="var(--viz-1)" width={2} />
        {retry && <FnPath f={(x) => (x >= 1 ? pr ** x : NaN)} color="var(--viz-3)" width={2} dash="6 4" />}
        <VLine x={n} color="var(--viz-muted)" />
        <Dots points={ns.map((k) => ({ x: k, y: p ** k, r: k === n ? 7 : 3.5, color: 'var(--viz-1)' }))} />
        {retry && <Dots points={ns.map((k) => ({ x: k, y: pr ** k, r: k === n ? 7 : 3.5, color: 'var(--viz-3)', shape: 'square' as const }))} />}
      </Plot>
      <Controls>
        <Slider label={<>per-step success <M>{'p'}</M></>} value={p} min={0.8} max={0.99} step={0.01} onChange={setP} format={(v) => v.toFixed(2)} />
        <Slider label={<>steps <M>{'n'}</M></>} value={n} min={1} max={20} step={1} onChange={setN} />
        <Toggle label="one retry for a failed step" checked={retry} onChange={setRetry} />
      </Controls>
      <Readout
        items={[
          [<M key="a">{'p^n'}</M>, `${p.toFixed(2)}^${n} = ${all.toFixed(3)}`],
          [`all ${n} steps right`, `${(all * 100).toFixed(1)}%`],
          ...(retry
            ? ([
                [<span key="b">one step, with retry</span>, `1 − ${(1 - p).toFixed(2)}² = ${pr.toFixed(4)}`],
                [<span key="c">all {n} steps, with retry</span>, `${(allR * 100).toFixed(1)}%`],
              ] as [ReactNode, ReactNode][])
            : []),
        ]}
      />
    </Figure>
  )
}
