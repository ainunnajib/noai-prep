import { useState } from 'react'
import { Figure, Controls, Readout, Button, Slider, useNarrow, M } from '../../../../../kit'
import { CLASSES, Z_RANGE, softmax, fix, LogitPanel, ProbPanel } from './shared'

/*
  Softmax, live. Drag the four logits; the probabilities update. "Add 5 to every logit" shifts all
  logits (probabilities unchanged). The temperature T divides the logits before exponentiating.
  The table shows the intermediate e^(z/T) values so every number can be checked by hand.
*/

const START = [2, 1, 0, -1]

export default function SoftmaxBars() {
  const [z, setZ] = useState(START)
  const [T, setT] = useState(1)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const p = softmax(z, T)
  const ex = z.map((v) => Math.exp(v / T))
  const sum = ex.reduce((a, b) => a + b, 0)
  const top = p.indexOf(Math.max(...p))
  const sorted = [...z].sort((a, b) => b - a)
  const gap = sorted[0] - sorted[1]
  const canUp = Math.max(...z) + 5 <= Z_RANGE[1]
  const canDown = Math.min(...z) - 5 >= Z_RANGE[0]
  const showExp = sum < 1e6

  const cell = { padding: '0.2rem 0.5rem', textAlign: 'right' as const, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' as const }
  const head = { ...cell, fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--ink-2)' }

  return (
    <Figure
      title="Softmax: from scores to a probability distribution"
      caption={
        <>
          Drag the top of any logit bar. Each probability is <M>{'e^{z_i/T}'}</M> divided by the total of all four, so the bars on the right always add up to
          exactly 1 and the biggest logit always wins the biggest share. Press <b>add 5 to every logit</b>: every <M>{'e^{z}'}</M> is multiplied by{' '}
          <M>{'e^5 \\approx 148'}</M>, the total too, so the probabilities do not move. Only the <i>differences</i> between logits matter. Slide the temperature{' '}
          <M>T</M>: below 1 the winner takes almost everything; above 1 the distribution flattens towards a quarter each.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '0.5rem' }}>
        <LogitPanel z={z} onChange={setZ} highlight={top} />
        <ProbPanel p={p} highlight={top} title={T === 1 ? 'probabilities p = softmax(z)' : `probabilities p = softmax(z / ${fix(T, 1)})`} />
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ margin: '0 auto', borderCollapse: 'collapse', fontSize: '0.85rem' }} aria-label="Softmax worked out for each class">
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--rule)' }}>
              <th style={{ ...head, textAlign: 'left' }}>class</th>
              <th style={head}>
                <M>z</M>
              </th>
              <th style={head}>
                <M>{T === 1 ? 'e^{z}' : 'e^{z/T}'}</M>
              </th>
              <th style={head}>
                <M>{T === 1 ? 'p = e^{z} / \\text{total}' : 'p = e^{z/T} / \\text{total}'}</M>
              </th>
            </tr>
          </thead>
          <tbody>
            {CLASSES.map((c, i) => (
              <tr key={c} style={{ fontWeight: i === top ? 800 : 500, color: i === top ? 'var(--ink)' : 'var(--ink-2)' }}>
                <td style={{ ...cell, textAlign: 'left', fontFamily: 'var(--font-body)' }}>{c}</td>
                <td style={cell}>{fix(z[i], 1)}</td>
                <td style={cell}>{showExp ? fix(ex[i], 3) : ex[i].toExponential(2)}</td>
                <td style={cell}>{p[i].toFixed(3)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '1.5px solid var(--rule)', color: 'var(--ink)' }}>
              <td style={{ ...cell, textAlign: 'left', fontFamily: 'var(--font-body)', fontWeight: 700 }}>total</td>
              <td style={cell} />
              <td style={cell}>{showExp ? fix(sum, 3) : sum.toExponential(2)}</td>
              <td style={{ ...cell, fontWeight: 800 }}>{p.reduce((a, b) => a + b, 0).toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Readout
        items={[
          ['gap between the top two logits', fix(gap, 1)],
          ['ratio of their probabilities', `e^(${fix(gap, 1)}${T === 1 ? '' : ` / ${fix(T, 1)}`}) = ${fix(Math.exp(gap / T), 2)}`],
        ]}
      />
      <Controls>
        <Slider label={<>temperature <M>T</M></>} value={T} min={0.2} max={5} step={0.1} onChange={setT} format={(v) => v.toFixed(1)} />
      </Controls>
      <Controls>
        <Button primary onClick={() => setZ(z.map((v) => v + 5))} disabled={!canUp}>
          add 5 to every logit
        </Button>
        <Button onClick={() => setZ(z.map((v) => v - 5))} disabled={!canDown}>
          subtract 5
        </Button>
        <Button
          onClick={() => {
            setZ(START)
            setT(1)
          }}
        >
          Reset
        </Button>
      </Controls>
    </Figure>
  )
}
