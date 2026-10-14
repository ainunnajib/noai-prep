import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Bars, Plot, Grid, Axes, FnPath, Dots, HLine, M } from '../../../../../kit'

/*
  Why sigmoid and softmax are built from e^x. Softmax: three raw scores (any sign) go through e^z,
  which makes every one positive, then get divided by their total, so they add up to 1.
  Sigmoid: one score z; because e^-z is always positive, 1 + e^-z is always more than 1, so
  1 / (1 + e^-z) always lands strictly between 0 and 1.
*/

const CLASSES = ['cat', 'dog', 'bird']
const COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)']
const f3 = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(1) : v.toFixed(3))

export default function ScoresToProbabilities() {
  const [mode, setMode] = useState<'softmax' | 'sigmoid'>('softmax')
  const [z, setZ] = useState([2, 1, -1])
  const [s, setS] = useState(-1)

  const ez = z.map(Math.exp)
  const total = ez.reduce((a, b) => a + b, 0)
  const probs = ez.map((v) => v / total)

  const es = Math.exp(-s)
  const sig = 1 / (1 + es)

  return (
    <Figure
      title="From any scores to probabilities, with eˣ"
      caption={
        mode === 'softmax' ? (
          <>
            Drag the scores, including below 0. Step 1 sends each score through <M>{'e^z'}</M>, so every bar is positive however negative the score. Step 2 divides by
            the total, so the probabilities add up to exactly 1. This recipe is called <b>softmax</b>, and the biggest score always gets the biggest probability.
          </>
        ) : (
          <>
            Slide the score <M>z</M>. Because <M>{'e^{-z}'}</M> is always positive, the bottom of the fraction is always <b>more than 1</b>, so the answer is always{' '}
            <b>less than 1</b>; and since the bottom never becomes infinite, the answer never reaches 0. That is why the sigmoid’s outputs lie strictly between 0 and 1.
          </>
        )
      }
    >
      <Segmented
        label="Function"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'softmax', label: 'softmax (3 classes)' },
          { value: 'sigmoid', label: 'sigmoid (yes or no)' },
        ]}
      />
      {mode === 'softmax' ? (
        <>
          <Controls>
            {CLASSES.map((c, i) => (
              <Slider
                key={c}
                label={`score for “${c}”`}
                value={z[i]}
                min={-3}
                max={3}
                step={0.5}
                onChange={(v) => setZ((old) => old.map((o, j) => (j === i ? v : o)))}
              />
            ))}
          </Controls>
          <div style={{ width: '100%', display: 'grid', gap: '0.9rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: 4 }}>
                Step 1: <M>{'e^{z}'}</M> makes every score positive
              </div>
              <Bars
                ariaLabel="e to the power of each score"
                data={CLASSES.map((c, i) => ({
                  label: (
                    <span>
                      {c}: <M>{`e^{${z[i]}}`}</M>
                    </span>
                  ),
                  value: ez[i],
                  color: COLOURS[i],
                }))}
                format={f3}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: 4 }}>
                Step 2: divide by the total {f3(total)} → probabilities
              </div>
              <Bars ariaLabel="Probabilities" max={1} data={CLASSES.map((c, i) => ({ label: c, value: probs[i], color: COLOURS[i], strong: probs[i] === Math.max(...probs) }))} format={f3} />
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)', marginTop: 4 }} aria-live="polite">
                total: {probs.map((p) => p.toFixed(3)).join(' + ')} = {probs.reduce((a, b) => a + b, 0).toFixed(3)}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <Plot x={[-6, 6]} y={[-0.15, 1.15]} width={480} height={230} minHeight={200} ariaLabel={`Sigmoid curve with the point z = ${s}, output ${sig.toFixed(3)}`}>
            <Grid xTicks={6} yTicks={4} />
            <Axes origin xLabel="z" xTicks={6} yTicks={4} />
            <HLine y={1} color="var(--viz-muted)" dash="4 4" />
            <FnPath f={(t) => 1 / (1 + Math.exp(-t))} color="var(--viz-1)" width={3} />
            <Dots points={[{ x: s, y: sig, color: 'var(--viz-2)', r: 7 }]} />
          </Plot>
          <Controls>
            <Slider label={<>score <M>z</M></>} value={s} min={-6} max={6} step={0.5} onChange={setS} />
          </Controls>
          <div style={{ width: '100%', display: 'grid', gap: 4, fontSize: '1rem', overflowX: 'auto' }} aria-live="polite">
            <div>
              <M>{`e^{-z} = e^{${-s === 0 ? 0 : -s}} = ${f3(es)}`}</M> <span style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>(always positive)</span>
            </div>
            <div>
              <M>{`1 + e^{-z} = ${f3(1 + es)}`}</M> <span style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>(always more than 1)</span>
            </div>
            <div>
              <M>{`\\sigma(z) = \\dfrac{1}{${f3(1 + es)}} = ${sig.toFixed(3)}`}</M> <span style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>(between 0 and 1)</span>
            </div>
          </div>
        </>
      )}
    </Figure>
  )
}
