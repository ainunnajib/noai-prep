import { useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Toggle, Readout, Plot, Grid, Axes, FnPath, Dots, VLine, M } from '../../../../../kit'
import s from './agents.module.css'

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
  // 2 d.p. near 100% so 99.99% never shows as a misleading 100.0%
  const pc = (x: number) => (x > 0.995 ? `${Math.min(99.99, Math.floor(x * 10000) / 100).toFixed(2)}%` : `${(x * 100).toFixed(1)}%`)
  const stepsWord = n === 1 ? 'the 1 step' : `all ${n} steps`

  return (
    <Figure
      title="Every extra step is another chance to fail"
      caption={
        <>
          Each dot is the chance that <b>all</b> <M>{'n'}</M> steps go right when each succeeds with probability <M>{'p'}</M> on its own: <M>{'p^n'}</M>. At{' '}
          <M>{'p = 0.95'}</M>, ten steps in a row succeed only about 60% of the time. The retry assumes the agent can tell a step failed (for example, from an error message).
        </>
      }
    >
      <p className={s.tryLine}>
        <b>Try:</b> slide <M>{'n'}</M> up and watch the chance fall. Then switch on <b>one retry</b> and watch the curve flatten.
      </p>
      <Plot x={[0, 20.5]} y={[0, 1.16]} width={480} height={300} minHeight={240} ariaLabel="Probability that all n steps succeed, plotted against n" margin={{ left: 44, bottom: 38 }}>
        <Grid xTicks={10} yTicks={5} />
        <Axes xLabel="number of steps n" yLabel="P(all steps right)" xTicks={10} yTicks={5} />
        <FnPath f={(x) => (x >= 1 ? p ** x : NaN)} color="var(--viz-1)" width={2} />
        {retry && <FnPath f={(x) => (x >= 1 ? pr ** x : NaN)} color="var(--viz-3)" width={2} dash="6 4" />}
        <VLine x={n} color="var(--viz-muted)" />
        <Dots points={ns.map((k) => ({ x: k, y: p ** k, r: k === n ? 7 : 3.5, color: 'var(--viz-1)' }))} />
        {retry && <Dots points={ns.map((k) => ({ x: k, y: pr ** k, r: k === n ? 7 : 3.5, color: 'var(--viz-3)', shape: 'square' as const }))} />}
      </Plot>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1rem', fontSize: '0.8rem', color: 'var(--ink-2)', width: '100%', justifyContent: 'center' }} aria-hidden="true">
        <span>
          <svg width="22" height="10" style={{ verticalAlign: '-1px', marginRight: 4 }}>
            <line x1="1" y1="5" x2="21" y2="5" style={{ stroke: 'var(--viz-1)', strokeWidth: 2 }} />
            <circle cx="11" cy="5" r="3.5" style={{ fill: 'var(--viz-1)' }} />
          </svg>
          no retry: <M>{'p^n'}</M>
        </span>
        {retry && (
          <span>
            <svg width="22" height="10" style={{ verticalAlign: '-1px', marginRight: 4 }}>
              <line x1="1" y1="5" x2="21" y2="5" style={{ stroke: 'var(--viz-3)', strokeWidth: 2, strokeDasharray: '6 4' }} />
              <rect x="7.5" y="1.5" width="7" height="7" style={{ fill: 'var(--viz-3)' }} />
            </svg>
            one retry per step: <M>{'(1-(1-p)^2)^n'}</M>
          </span>
        )}
      </div>
      <Controls>
        <Slider label={<>per-step success <M>{'p'}</M></>} value={p} min={0.8} max={0.99} step={0.01} onChange={setP} format={(v) => v.toFixed(2)} />
        <Slider label={<>steps <M>{'n'}</M></>} value={n} min={1} max={20} step={1} onChange={setN} />
        <Toggle label="one retry for a failed step" checked={retry} onChange={setRetry} />
      </Controls>
      <Readout
        items={[
          [<M key="a">{'p^n'}</M>, `${p.toFixed(2)}^${n} = ${all.toFixed(3)}`],
          [`${stepsWord} right`, pc(all)],
          ...(retry
            ? ([
                [<span key="b">one step, with retry</span>, `1 − ${(1 - p).toFixed(2)}² = ${pr.toFixed(4)}`],
                [<span key="c">{stepsWord}, with retry</span>, pc(allR)],
              ] as [ReactNode, ReactNode][])
            : []),
        ]}
      />
    </Figure>
  )
}
