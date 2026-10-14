import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, usePlayer, PlayerControls, M } from '../../../../../kit'

/*
  What a Pipeline does inside 5-fold cross-validation. Twenty rows of one feature (hours of
  revision per week) are split into 5 folds; fold 3 contains one extreme value (30). In each round
  one fold validates and the scaler is fitted on the rows it is allowed to see:
    leaky:    StandardScaler fitted once on all 20 rows, before cross-validation
    pipeline: the scaler is refitted on the 16 training rows of each round
  The cells the scaler learned from are filled; the read-outs show its mean and standard deviation
  (population, as StandardScaler uses) and the validation rows after scaling. Aha: with a Pipeline
  the validation fold is never seen during fitting, so an unusual validation value looks as
  unusual as it really is.
*/

const FOLDS = [
  [4, 6, 5, 7],
  [8, 3, 6, 5],
  [9, 30, 7, 6],
  [5, 4, 8, 6],
  [7, 5, 6, 4],
]

const meanStd = (v: number[]) => {
  const m = v.reduce((a, b) => a + b, 0) / v.length
  const s = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length)
  return { m, s }
}
const f2 = (v: number) => v.toFixed(2)

export default function PipelineFolds() {
  const [mode, setMode] = useState<'leaky' | 'pipe'>('pipe')
  const player = usePlayer({ steps: 5, interval: 1400 })
  const k = player.step

  const all = FOLDS.flat()
  const train = FOLDS.filter((_, j) => j !== k).flat()
  const fit = mode === 'leaky' ? all : train
  const { m, s } = meanStd(fit)
  const zVal = FOLDS[k].map((x) => (x - m) / s)

  const cell = (j: number): CSSProperties => {
    const isVal = j === k
    const seen = mode === 'leaky' || !isVal
    const col = isVal ? 'var(--viz-2)' : 'var(--viz-1)'
    return {
      height: 34,
      borderRadius: 7,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: '0.95rem',
      border: `2px ${seen ? 'solid' : 'dashed'} ${col}`,
      background: seen ? `color-mix(in srgb, ${col} ${isVal ? 30 : 22}%, var(--surface))` : 'var(--surface)',
      color: 'var(--ink)',
      position: 'relative',
    }
  }

  return (
    <Figure
      title="Who does the scaler learn from?"
      caption={
        <>
          Five-fold cross-validation on 20 rows (hours of revision per week). Step through the five rounds: each round, one fold (orange) is the
          validation fold. Filled cells are the rows the scaler learned its mean and standard deviation from. In <b>leaky</b> mode the scaler was fitted
          once on all 20 rows, so every validation fold has already been seen (red marks). With a <b>Pipeline</b>, the scaler is refitted on the 16
          training rows in every round. Watch round 3: the extreme value 30 looks far more unusual when the scaler has not been allowed to see it.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Preprocessing"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'leaky', label: 'leaky: scale all rows first' },
            { value: 'pipe', label: 'Pipeline inside each fold' },
          ]}
        />
      </Controls>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
          {FOLDS.map((f, j) => (
            <div key={j} style={{ display: 'grid', gap: 4 }}>
              <div style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 800, color: j === k ? 'var(--viz-2)' : 'var(--ink-3)' }}>
                fold {j + 1}
                <br />
                {j === k ? 'validate' : 'train'}
              </div>
              {f.map((x, i) => (
                <div key={i} style={cell(j)}>
                  {x}
                  {mode === 'leaky' && j === k && (
                    <span style={{ position: 'absolute', top: -7, right: -5, width: 15, height: 15, borderRadius: 8, background: 'var(--viz-neg)', color: 'var(--surface)', fontSize: 11, lineHeight: '15px', textAlign: 'center' }}>
                      !
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <PlayerControls player={player} label={(s) => `Round ${s + 1} of 5: fold ${s + 1} validates`} />
      <div style={{ fontSize: '0.95rem', textAlign: 'center' }}>
        <M>{`\\text{scaler: } \\mu = ${f2(m)},\\ \\sigma = ${f2(s)}`}</M>
        <span style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}> (fitted on {fit.length} rows)</span>
      </div>
      <div style={{ fontSize: '0.95rem', textAlign: 'center' }}>
        validation fold after scaling: <M>{`z = [${zVal.map(f2).join(',\\ ')}]`}</M>
      </div>
      <Readout
        items={[
          ['rows the scaler learned from', String(fit.length)],
          ['validation rows it had already seen', `${mode === 'leaky' ? 4 : 0} of 4`],
        ]}
      />
    </Figure>
  )
}
